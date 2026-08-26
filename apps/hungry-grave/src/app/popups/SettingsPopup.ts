import { List } from '@pixi/ui';
import { animate } from 'motion';
import type { Text } from 'pixi.js';
import { Container, Sprite, Texture } from 'pixi.js';

import {
  KEYBOARD_SPEED_SLIDER_MAX,
  KEYBOARD_SPEED_SLIDER_MIN,
  keyboardSpeedFromSlider,
  sliderFromKeyboardSpeed,
} from '../keyboardSpeedSlider';
import type { ButtonChrome } from '../ui/Button';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { RoundedBox } from '../ui/RoundedBox';
import { SettingSlider } from '../ui/SettingSlider';
import { userSettings } from '../userSettings';

/**
 * What the settings panel can do, all of it owned by the driver in main.ts.
 *
 * The three volumes arrive as powers and the keyboard speed does not, and the
 * asymmetry is the rule working: a volume has to be heard as well as stored,
 * and only the driver holds the audio system. The speed is stored and nothing
 * else, so this panel writes it itself.
 */
interface SettingsPopupProps extends ButtonChrome {
  // Back to the pause menu, which is where OK and Escape both go.
  onDone(): Promise<void>;
  // The player's volumes: stored, and heard now.
  setMasterVolume(value: number): void;
  setBgmVolume(value: number): void;
  setSfxVolume(value: number): void;
  // The screen behind the panel, blurred while the panel is up.
  blurBackdrop(strength: number): void;
  clearBackdrop(): void;
}

// Popup for volume
class SettingsPopup extends Container {
  // The dark semi-transparent background covering current screen
  private bg: Sprite;
  // Container for the popup UI components
  private panel: Container;
  private title: Text;
  // Button that closes the popup
  private doneButton: Button;
  // The panel background
  private panelBase: RoundedBox;
  private versionLabel: Text;
  // Layout that organises the UI components
  private layout: List;
  // Slider that changes the master volume
  private masterSlider: SettingSlider;
  // Slider that changes background music volume
  private bgmSlider: SettingSlider;
  // Slider that changes sound effects volume
  private sfxSlider: SettingSlider;
  // Slider that changes the keyboard's designated speed (ADR 0011)
  private keyboardSpeedSlider: SettingSlider;
  /**
   * The powers this showing was handed. The pool calls init() before the popup
   * reaches the stage, so it is set before show() and before any drag.
   */
  private props!: SettingsPopupProps;

  constructor() {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    // Tall enough for four sliders above the OK button. The keyboard speed
    // slider is the fourth and at 425 the button sat on top of it.
    this.panelBase = new RoundedBox({ height: 530 });
    this.panel.addChild(this.panelBase);

    this.title = new Label({
      text: 'Settings',
      style: {
        fill: 0xec1561,
        fontSize: 50,
      },
    });
    this.title.y = -this.panelBase.boxHeight * 0.5 + 60;
    this.panel.addChild(this.title);

    this.doneButton = new Button({
      text: 'OK',
      playSound: (alias) => this.props.playButtonSound(alias),
    });
    this.doneButton.y = this.panelBase.boxHeight * 0.5 - 78;
    // Back to the pause menu and not to the run. presentPopup replaces rather
    // than stacks, so opening Settings destroyed the menu, and dismissing here
    // would drop the player straight into live play holding nothing.
    this.doneButton.onPress.connect(() => {
      this.props.onDone().catch((error) => console.error(error));
    });
    this.panel.addChild(this.doneButton);

    this.versionLabel = new Label({
      text: `Version ${APP_VERSION}`,
      style: {
        fill: 0xffffff,
        fontSize: 12,
      },
    });
    this.versionLabel.alpha = 0.5;
    this.versionLabel.y = this.panelBase.boxHeight * 0.5 - 15;
    this.panel.addChild(this.versionLabel);

    this.layout = new List({ type: 'vertical', elementsMargin: 4 });
    this.layout.x = -140;
    this.layout.y = -80;
    this.panel.addChild(this.layout);

    this.masterSlider = new SettingSlider('Master Volume');
    this.masterSlider.onUpdate.connect((v) => {
      this.props.setMasterVolume(v / 100);
    });
    this.layout.addChild(this.masterSlider);

    this.bgmSlider = new SettingSlider('BGM Volume');
    this.bgmSlider.onUpdate.connect((v) => {
      this.props.setBgmVolume(v / 100);
    });
    this.layout.addChild(this.bgmSlider);

    this.sfxSlider = new SettingSlider('SFX Volume');
    this.sfxSlider.onUpdate.connect((v) => {
      this.props.setSfxVolume(v / 100);
    });
    this.layout.addChild(this.sfxSlider);

    this.keyboardSpeedSlider = new SettingSlider(
      'Keyboard Speed',
      KEYBOARD_SPEED_SLIDER_MIN,
      KEYBOARD_SPEED_SLIDER_MAX,
    );
    this.keyboardSpeedSlider.onUpdate.connect((v) => {
      const speed = keyboardSpeedFromSlider(v);
      userSettings.setKeyboardSpeed(speed);
      this.showKeyboardSpeed(speed);
    });
    this.layout.addChild(this.keyboardSpeedSlider);
  }

  /**
   * The keyboard speed reads as a number, because a handle position cannot
   * produce "it feels right at 1.4x": the multiplier is an absolute value the
   * player carries between sittings, where the three volumes are purely
   * relative and stay bare (ADR 0011). Written here rather than into the shared
   * widget, which #38 owns.
   */
  private showKeyboardSpeed(speed: number): void {
    this.keyboardSpeedSlider.messageLabel.text = `Keyboard Speed  ${speed.toFixed(2)}x`;
  }

  // Resize the popup, fired whenever window size changes
  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  public init(props: SettingsPopupProps) {
    this.props = props;
  }

  // Set things up just before showing the popup
  public prepare() {
    this.masterSlider.value = userSettings.getMasterVolume() * 100;
    this.bgmSlider.value = userSettings.getBgmVolume() * 100;
    this.sfxSlider.value = userSettings.getSfxVolume() * 100;
    const speed = userSettings.getKeyboardSpeed();
    this.keyboardSpeedSlider.value = sliderFromKeyboardSpeed(speed);
    // Set here as well as on update, or the panel opens showing the bare label
    // until the player first drags the handle.
    this.showKeyboardSpeed(speed);
  }

  // Present the popup, animated
  public async show() {
    this.props.blurBackdrop(4);

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
    this.props.clearBackdrop();
    animate(this.bg, { alpha: 0 }, { duration: 0.2, ease: 'linear' });
    await animate(
      this.panel.pivot,
      { y: -500 },
      {
        duration: 0.3,
        ease: 'backIn',
      },
    );
  }

  /**
   * Nothing to clear, and that is a property rather than an omission. Every
   * value this panel shows is a stored one, and prepare() reads all four back
   * off the settings store on every showing, so a pooled second showing cannot
   * inherit the last one's handles. src/__tests__/pooledShowings.test.ts fails
   * if that stops being true.
   */
  public reset() {}
}

export { SettingsPopup };
export type { SettingsPopupProps };
