import { animate } from 'motion';
import { Container, Sprite, Texture } from 'pixi.js';

import type { ButtonChrome } from '../ui/Button';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { RoundedBox } from '../ui/RoundedBox';

/** What the pause menu can do, all of it owned by the driver in main.ts. */
interface PausePopupProps extends ButtonChrome {
  // Takes this menu away, back to the run behind it.
  onDismiss(): Promise<void>;
  // Replaces this menu with the settings panel.
  onSettings(): Promise<void>;
  // Ends the run this menu was opened over, called with the menu already gone.
  onEndRun(): void;
  // The screen behind the panel, blurred while the panel is up.
  blurBackdrop(strength: number): void;
  clearBackdrop(): void;
}

// What End Run says before it is armed, and what it says once it is.
const END_RUN_LABEL = 'End Run';
const END_RUN_CONFIRM = 'Sure?';

// Popup that shows up when gameplay is paused
class PausePopup extends Container {
  // The dark semi-transparent background covering current screen
  private bg: Sprite;
  // Container for the popup UI components
  private panel: Container;
  private title: Label;
  // Button that closes the popup
  private doneButton: Button;
  // Button that opens the settings
  private settingsButton: Button;
  // Button that ends the run, set visually apart because it is the destructive one
  private endRunButton: Button;
  // The panel background
  private panelBase: RoundedBox;
  /**
   * Whether End Run has been pressed once and is waiting for the second.
   *
   * There is a score to lose now: overflow pays score, drops level lines, and
   * ending a run by mis-tapping a menu button costs a build. This is the
   * smallest thing that works, with no new popup, no new navigation path, and
   * no state that outlives the menu.
   */
  private endRunArmed = false;
  /**
   * The powers this showing was handed. The pool calls init() before the popup
   * reaches the stage, so it is set before show() and before any press.
   */
  private props!: PausePopupProps;

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
      text: 'Paused',
      style: { fill: 0xec1561, fontSize: 50 },
    });
    this.title.y = -150;
    this.panel.addChild(this.title);

    this.doneButton = new Button({
      text: 'Resume',
      width: 260,
      height: 80,
      playSound: (alias) => this.props.playButtonSound(alias),
    });
    this.doneButton.y = -30;
    this.doneButton.onPress.connect(() => this.dismiss());
    this.panel.addChild(this.doneButton);

    this.settingsButton = new Button({
      text: 'Settings',
      width: 260,
      height: 80,
      playSound: (alias) => this.props.playButtonSound(alias),
    });
    this.settingsButton.y = 55;
    this.settingsButton.onPress.connect(() => this.openSettings());
    this.panel.addChild(this.settingsButton);

    this.endRunButton = new Button({
      text: END_RUN_LABEL,
      width: 200,
      height: 68,
      fontSize: 22,
      playSound: (alias) => this.props.playButtonSound(alias),
    });
    this.endRunButton.y = 160;
    this.endRunButton.onPress.connect(() => this.endRun());
    this.panel.addChild(this.endRunButton);
  }

  public init(props: PausePopupProps): void {
    this.props = props;
  }

  /**
   * Back to the run. Named dismiss and not resume because AppScreen declares an
   * optional resume() of its own, and a private method of that name makes this
   * class unassignable to it.
   */
  private dismiss(): void {
    this.props.onDismiss().catch((error) => console.error(error));
  }

  private openSettings(): void {
    // Opening Settings disarms it, so a confirm cannot be left standing behind
    // another screen and answered by a press that meant something else.
    this.disarmEndRun();
    this.props.onSettings().catch((error) => console.error(error));
  }

  private disarmEndRun(): void {
    this.endRunArmed = false;
    this.endRunButton.text = END_RUN_LABEL;
  }

  /**
   * Ends the run, dismissing this menu first. showScreen never touches
   * currentPopup and never touches filters, so ending from inside the menu
   * without dismissing would hand the player an end screen with this panel and
   * its scrim still on top, and return the game screen to the pool wearing the
   * blur for every later run.
   */
  private endRun(): void {
    if (!this.endRunArmed) {
      this.endRunArmed = true;
      this.endRunButton.text = END_RUN_CONFIRM;
      return;
    }
    this.disarmEndRun();
    this.props
      .onDismiss()
      .then(() => this.props.onEndRun())
      .catch((error) => console.error(error));
  }

  // Resize the popup, fired whenever window size changes
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
    this.disarmEndRun();
    this.props.blurBackdrop(5);
    this.bg.alpha = 0;
    this.panel.pivot.y = -400;
    animate(this.bg, { alpha: 0.8 }, { duration: 0.2, ease: 'linear' });
    await animate(
      this.panel.pivot,
      { y: 0 },
      { duration: 0.3, ease: 'backOut' },
    );
  }

  // Dismiss the popup, animated
  public async hide() {
    this.disarmEndRun();
    this.props.clearBackdrop();
    animate(this.bg, { alpha: 0 }, { duration: 0.2, ease: 'linear' });
    await animate(
      this.panel.pivot,
      { y: -500 },
      { duration: 0.3, ease: 'backIn' },
    );
  }

  // Reset screen, after hidden
  public reset() {
    this.disarmEndRun();
  }
}

export { PausePopup };
export type { PausePopupProps };
