import { storage } from "../../engine/utils/storage";
import { MULTIPLIER_MAX, MULTIPLIER_MIN } from "../../input/keys";
import { engine } from "../getEngine";

// Keys for saved items in storage
const KEY_VOLUME_MASTER = "volume-master";
const KEY_VOLUME_BGM = "volume-bgm";
const KEY_VOLUME_SFX = "volume-sfx";
const KEY_KEYBOARD_SPEED = "keyboard-speed";

/**
 * The keyboard speed slider's own range. It runs in integer positions rather
 * than in the speed itself so the handle lands on a step: twentieths give 0.05
 * steps across ADR 0011's 0.75x to 1.5x.
 */
export const KEYBOARD_SPEED_SLIDER_MIN = 15;
export const KEYBOARD_SPEED_SLIDER_MAX = 30;
const KEYBOARD_SPEED_SLIDER_DIVISOR = 20;

/** A slider position as a speed multiplier. */
export function keyboardSpeedFromSlider(value: number): number {
  return Math.round(value) / KEYBOARD_SPEED_SLIDER_DIVISOR;
}

/** A speed multiplier back as a slider position, so the popup can show the stored setting. */
export function sliderFromKeyboardSpeed(speed: number): number {
  return Math.round(speed * KEYBOARD_SPEED_SLIDER_DIVISOR);
}

function clampKeyboardSpeed(value: number): number {
  return Math.min(Math.max(value, MULTIPLIER_MIN), MULTIPLIER_MAX);
}

/**
 * Persistent user settings of volumes.
 */
class UserSettings {
  public init() {
    engine().audio.setMasterVolume(this.getMasterVolume());
    engine().audio.bgm.setVolume(this.getBgmVolume());
    engine().audio.sfx.setVolume(this.getSfxVolume());
  }

  /** Get overall sound volume */
  public getMasterVolume() {
    return storage.getNumber(KEY_VOLUME_MASTER) ?? 0.5;
  }

  /** Set overall sound volume */
  public setMasterVolume(value: number) {
    engine().audio.setMasterVolume(value);
    storage.setNumber(KEY_VOLUME_MASTER, value);
  }

  /** Get background music volume */
  public getBgmVolume() {
    return storage.getNumber(KEY_VOLUME_BGM) ?? 1;
  }

  /** Set background music volume */
  public setBgmVolume(value: number) {
    engine().audio.bgm.setVolume(value);
    storage.setNumber(KEY_VOLUME_BGM, value);
  }

  /**
   * The keyboard speed multiplier (ADR 0011). Clamped on read as well as on
   * write: a hand-edited localStorage is a real input, and so is a value
   * persisted by an earlier build under the old 0.5x to 2.0x range.
   */
  public getKeyboardSpeed() {
    return clampKeyboardSpeed(storage.getNumber(KEY_KEYBOARD_SPEED) ?? 1);
  }

  /** Set the keyboard speed multiplier */
  public setKeyboardSpeed(value: number) {
    storage.setNumber(KEY_KEYBOARD_SPEED, clampKeyboardSpeed(value));
  }

  /** Get sound effects volume */
  public getSfxVolume() {
    return storage.getNumber(KEY_VOLUME_SFX) ?? 1;
  }

  /** Set sound effects volume */
  public setSfxVolume(value: number) {
    engine().audio.sfx.setVolume(value);
    storage.setNumber(KEY_VOLUME_SFX, value);
  }
}

/** SHared user settings instance */
export const userSettings = new UserSettings();
