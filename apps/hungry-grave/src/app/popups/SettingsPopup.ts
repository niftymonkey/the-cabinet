import { List } from "@pixi/ui";
import { animate } from "motion";
import type { Text } from "pixi.js";
import { BlurFilter, Container, Sprite, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";
import { SettingSlider } from "../ui/SettingSlider";
import {
  KEYBOARD_SPEED_SLIDER_MAX,
  KEYBOARD_SPEED_SLIDER_MIN,
  keyboardSpeedFromSlider,
  sliderFromKeyboardSpeed,
  userSettings,
} from "../utils/userSettings";
import { PausePopup } from "./PausePopup";

/** Popup for volume */
export class SettingsPopup extends Container {
  /** The dark semi-transparent background covering current screen */
  private bg: Sprite;
  /** Container for the popup UI components */
  private panel: Container;
  /** The popup title label */
  private title: Text;
  /** Button that closes the popup */
  private doneButton: Button;
  /** The panel background */
  private panelBase: RoundedBox;
  /** The build version label */
  private versionLabel: Text;
  /** Layout that organises the UI components */
  private layout: List;
  /** Slider that changes the master volume */
  private masterSlider: SettingSlider;
  /** Slider that changes background music volume */
  private bgmSlider: SettingSlider;
  /** Slider that changes sound effects volume */
  private sfxSlider: SettingSlider;
  /** Slider that changes the keyboard's designated speed (ADR 0011) */
  private keyboardSpeedSlider: SettingSlider;

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
      text: "Settings",
      style: {
        fill: 0xec1561,
        fontSize: 50,
      },
    });
    this.title.y = -this.panelBase.boxHeight * 0.5 + 60;
    this.panel.addChild(this.title);

    this.doneButton = new Button({ text: "OK" });
    this.doneButton.y = this.panelBase.boxHeight * 0.5 - 78;
    // Back to the pause menu and not to the run. presentPopup replaces rather
    // than stacks, so opening Settings destroyed the menu, and dismissing here
    // would drop the player straight into live play holding nothing.
    this.doneButton.onPress.connect(() => {
      engine()
        .navigation.presentPopup(PausePopup)
        .catch((error) => console.error(error));
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

    this.layout = new List({ type: "vertical", elementsMargin: 4 });
    this.layout.x = -140;
    this.layout.y = -80;
    this.panel.addChild(this.layout);

    this.masterSlider = new SettingSlider("Master Volume");
    this.masterSlider.onUpdate.connect((v) => {
      userSettings.setMasterVolume(v / 100);
    });
    this.layout.addChild(this.masterSlider);

    this.bgmSlider = new SettingSlider("BGM Volume");
    this.bgmSlider.onUpdate.connect((v) => {
      userSettings.setBgmVolume(v / 100);
    });
    this.layout.addChild(this.bgmSlider);

    this.sfxSlider = new SettingSlider("SFX Volume");
    this.sfxSlider.onUpdate.connect((v) => {
      userSettings.setSfxVolume(v / 100);
    });
    this.layout.addChild(this.sfxSlider);

    this.keyboardSpeedSlider = new SettingSlider(
      "Keyboard Speed",
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

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  /** Set things up just before showing the popup */
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

  /** Present the popup, animated */
  public async show() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 4 }),
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
      {
        duration: 0.3,
        ease: "backIn",
      },
    );
  }

  /** Reset screen, after hidden */
  public reset() {}
}
