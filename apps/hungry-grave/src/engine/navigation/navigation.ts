import type { Ticker } from 'pixi.js';
import { Assets, BigPool, Container } from 'pixi.js';

import type { CreationEngine } from '../engine';

/** What the navigation does to a screen once it is holding one. */
interface AppScreen extends Container {
  show?(): Promise<void>;
  hide?(): Promise<void>;
  pause?(): Promise<void>;
  resume?(): Promise<void>;
  // Prepare screen, before showing
  prepare?(): void;
  /**
   * Reset screen, after hidden. Required, not optional: screens are pooled
   * and reused, so any state a screen keeps comes back with it. Pool.return
   * calls this, and it must stay idempotent.
   */
  reset(): void;
  // Update the screen, passing delta time/step
  update?(time: Ticker): void;
  resize?(width: number, height: number): void;
  blur?(): void;
  focus?(): void;
  // Method to react on assets loading progress
  onLoad?: (progress: number) => void;
}

/**
 * A screen as its own showing knows it: the lifecycle above, plus the powers it
 * is handed. Pool.get calls init before the screen reaches the stage, so a
 * pooled screen comes back holding this showing's powers and never the last
 * one's. Only the showing knows the props type, which is why the field the
 * navigation holds a screen in is the bare AppScreen above.
 */
interface PoweredScreen<Props> extends AppScreen {
  init?(props: Props): void;
}

interface AppScreenConstructor<Props = void> {
  new (): PoweredScreen<Props>;
  // List of assets bundles required by the screen
  assetBundles?: string[];
}

/**
 * How a screen's props reach showScreen: as one argument, or as no argument at
 * all for a screen that declares no init and therefore takes no powers. Written
 * as an argument list rather than an optional parameter so a screen that needs
 * powers cannot be shown without them.
 */
type ScreenArgs<Props> = [Props] extends [void] ? [] : [props: Props];

class Navigation {
  public app!: CreationEngine;

  // Container for screens
  public container = new Container();

  public width = 0;

  public height = 0;

  public currentScreen?: AppScreen;

  public currentPopup?: AppScreen;

  public init(app: CreationEngine) {
    this.app = app;
  }

  // Add screen to the stage, link update & resize functions
  private async addAndShowScreen(screen: AppScreen) {
    // Add navigation container to stage if it does not have a parent yet
    if (!this.container.parent) {
      this.app.stage.addChild(this.container);
    }

    // Add screen to stage
    this.container.addChild(screen);

    // Setup things and pre-organise screen before showing
    if (screen.prepare) {
      screen.prepare();
    }

    // Add screen's resize handler, if available
    if (screen.resize) {
      // Trigger a first resize
      screen.resize(this.width, this.height);
    }

    // Add update function if available
    if (screen.update) {
      this.app.ticker.add(screen.update, screen);
    }

    // Show the new screen
    if (screen.show) {
      screen.interactiveChildren = false;
      await screen.show();
    }

    // Unconditionally, and this is the fix rather than a tidy-up. showScreen
    // and hideAndRemoveScreen both take a screen's children away on the way
    // out, so a screen that declares no show() was never given them back and
    // its buttons were dead on every showing after the first, while the screen
    // itself went on taking pointer events and looked alive.
    screen.interactiveChildren = true;
  }

  /**
   * Remove screen from the stage, unlink update & resize functions, and return
   * the instance to the pool showScreen takes from. Without that return the
   * pool only ever takes its new branch, so every run leaves a whole screen's
   * canvas-backed text textures behind. Pool.return calls reset() itself, so
   * every screen's reset() has to stay idempotent.
   */
  private async hideAndRemoveScreen(screen: AppScreen) {
    // Prevent interaction in the screen
    screen.interactiveChildren = false;

    // Hide screen if method is available
    if (screen.hide) {
      await screen.hide();
    }

    // Unlink update function if method is available
    if (screen.update) {
      this.app.ticker.remove(screen.update, screen);
    }

    // Remove screen from its parent (usually app.stage, if not changed)
    if (screen.parent) {
      screen.parent.removeChild(screen);
    }

    // Back to the pool, which calls reset() on the way in
    BigPool.return(screen);
  }

  /**
   * Hide current screen (if there is one) and present a new screen.
   * Any class that matches AppScreen interface can be used here.
   */
  public async showScreen<Props = void>(
    ctor: AppScreenConstructor<Props>,
    ...args: ScreenArgs<Props>
  ) {
    // Block interactivity in current screen
    if (this.currentScreen) {
      this.currentScreen.interactiveChildren = false;
    }

    // Load assets for the new screen, if available
    if (ctor.assetBundles) {
      // Load all assets required by this new screen
      await Assets.loadBundle(ctor.assetBundles, (progress) => {
        if (this.currentScreen?.onLoad) {
          this.currentScreen.onLoad(progress * 100);
        }
      });
    }

    if (this.currentScreen?.onLoad) {
      this.currentScreen.onLoad(100);
    }

    // If there is a screen already created, hide and destroy it
    if (this.currentScreen) {
      await this.hideAndRemoveScreen(this.currentScreen);
    }

    // Create the new screen and add that to the stage
    this.currentScreen = BigPool.get(ctor, ...args);
    await this.addAndShowScreen(this.currentScreen);
  }

  /**
   * Resize screens
   * @param width Viewport width
   * @param height Viewport height
   */
  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.currentScreen?.resize?.(width, height);
    this.currentPopup?.resize?.(width, height);
  }

  /**
   * Show up a popup over current screen
   */
  public async presentPopup<Props = void>(
    ctor: AppScreenConstructor<Props>,
    ...args: ScreenArgs<Props>
  ) {
    if (this.currentScreen) {
      this.currentScreen.interactiveChildren = false;
      await this.currentScreen.pause?.();
    }

    if (this.currentPopup) {
      await this.hideAndRemoveScreen(this.currentPopup);
    }

    // From the pool, because hideAndRemoveScreen returns popups to it too
    this.currentPopup = BigPool.get(ctor, ...args);
    await this.addAndShowScreen(this.currentPopup);
  }

  /**
   * Dismiss current popup, if there is one
   */
  public async dismissPopup() {
    if (!this.currentPopup) return;
    const popup = this.currentPopup;
    this.currentPopup = undefined;
    await this.hideAndRemoveScreen(popup);
    if (this.currentScreen) {
      this.currentScreen.interactiveChildren = true;
      this.currentScreen.resume?.();
    }
  }

  /**
   * Blur screens when lose focus
   */
  public blur() {
    this.currentScreen?.blur?.();
    this.currentPopup?.blur?.();
  }

  /**
   * Focus screens
   */
  public focus() {
    this.currentScreen?.focus?.();
    this.currentPopup?.focus?.();
  }
}

export { Navigation };
