import { animate } from "motion";
import { BlurFilter, Container, Sprite, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";
import { SettingsPopup } from "./SettingsPopup";

/**
 * What End Run does, set by the screen that opened the menu. Popups are pooled
 * and constructed with no arguments (see src/engine/navigation/navigation.ts),
 * so a popup cannot be handed its actions at construction and the handoff needs
 * a home outside both. Same shape as runHandoff between the two screens.
 */
class PauseActions {
  private handler: (() => void) | null = null;

  public setEndRun(handler: (() => void) | null): void {
    this.handler = handler;
  }

  public endRun(): void {
    this.handler?.();
  }
}

export const pauseActions = new PauseActions();

/** Popup that shows up when gameplay is paused */
export class PausePopup extends Container {
  /** The dark semi-transparent background covering current screen */
  private bg: Sprite;
  /** Container for the popup UI components */
  private panel: Container;
  /** The popup title label */
  private title: Label;
  /** Button that closes the popup */
  private doneButton: Button;
  /** Button that opens the settings */
  private settingsButton: Button;
  /** Button that ends the run, set visually apart because it is the destructive one */
  private endRunButton: Button;
  /** The panel background */
  private panelBase: RoundedBox;

  constructor() {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({ height: 420 });
    this.panel.addChild(this.panelBase);

    this.title = new Label({
      text: "Paused",
      style: { fill: 0xec1561, fontSize: 50 },
    });
    this.title.y = -150;
    this.panel.addChild(this.title);

    this.doneButton = new Button({ text: "Resume", width: 260, height: 80 });
    this.doneButton.y = -30;
    this.doneButton.onPress.connect(() => this.dismiss());
    this.panel.addChild(this.doneButton);

    this.settingsButton = new Button({
      text: "Settings",
      width: 260,
      height: 80,
    });
    this.settingsButton.y = 55;
    this.settingsButton.onPress.connect(() => this.openSettings());
    this.panel.addChild(this.settingsButton);

    this.endRunButton = new Button({
      text: "End Run",
      width: 200,
      height: 68,
      fontSize: 22,
    });
    this.endRunButton.y = 160;
    this.endRunButton.onPress.connect(() => this.endRun());
    this.panel.addChild(this.endRunButton);
  }

  /**
   * Back to the run. Named dismiss and not resume because AppScreen declares an
   * optional resume() of its own, and a private method of that name makes this
   * class unassignable to it.
   */
  private dismiss(): void {
    engine()
      .navigation.dismissPopup()
      .catch((error) => console.error(error));
  }

  private openSettings(): void {
    engine()
      .navigation.presentPopup(SettingsPopup)
      .catch((error) => console.error(error));
  }

  /**
   * Ends the run, dismissing this menu first. showScreen never touches
   * currentPopup and never touches filters, so ending from inside the menu
   * without dismissing would hand the player an end screen with this panel and
   * its scrim still on top, and return the game screen to the pool wearing the
   * blur for every later run.
   */
  private endRun(): void {
    engine()
      .navigation.dismissPopup()
      .then(() => pauseActions.endRun())
      .catch((error) => console.error(error));
  }

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  /**
   * Present the popup, animated. The blur is not dressing: a pause menu in a
   * score game normally opens a "pause and read the curtain" line, and the blur
   * is what closes it.
   */
  public async show() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 5 }),
      ];
    }
    this.bg.alpha = 0;
    this.panel.pivot.y = -400;
    animate(this.bg, { alpha: 0.8 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: 0 },
      { duration: 0.3, ease: "backOut" },
    );
  }

  /** Dismiss the popup, animated */
  public async hide() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [];
    }
    animate(this.bg, { alpha: 0 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: -500 },
      { duration: 0.3, ease: "backIn" },
    );
  }

  /** Reset screen, after hidden */
  public reset() {}
}
