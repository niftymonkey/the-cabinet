// The volumes and the keyboard speed the player set, kept across sessions.

import { storage } from '../engine/utils/storage';
import { MULTIPLIER_MAX, MULTIPLIER_MIN } from '../input/keys';

// Keys for saved items in storage
const KEY_VOLUME_MASTER = 'volume-master';
const KEY_VOLUME_BGM = 'volume-bgm';
const KEY_VOLUME_SFX = 'volume-sfx';
const KEY_KEYBOARD_SPEED = 'keyboard-speed';

const clampKeyboardSpeed = (value: number): number => {
  return Math.min(Math.max(value, MULTIPLIER_MIN), MULTIPLIER_MAX);
};

/**
 * What the player set, and only that. Telling the audio system about a volume
 * is the driver's hop and not this store's: main.ts applies the saved volumes
 * at boot and the settings panel is handed the same power as a prop.
 */
class UserSettings {
  // Get overall sound volume
  public getMasterVolume() {
    return storage.getNumber(KEY_VOLUME_MASTER) ?? 0.5;
  }

  // Set overall sound volume
  public setMasterVolume(value: number) {
    storage.setNumber(KEY_VOLUME_MASTER, value);
  }

  // Get background music volume
  public getBgmVolume() {
    return storage.getNumber(KEY_VOLUME_BGM) ?? 1;
  }

  // Set background music volume
  public setBgmVolume(value: number) {
    storage.setNumber(KEY_VOLUME_BGM, value);
  }

  /**
   * The keyboard speed multiplier (ADR 0011). Clamped on read as well as on
   * write: a hand-edited localStorage is a real input, and so is a value
   * persisted by an earlier build under the old 0.5x to 2.0x range.
   */
  public getKeyboardSpeed() {
    const stored = storage.getNumber(KEY_KEYBOARD_SPEED) ?? 1;
    const speed = clampKeyboardSpeed(stored);
    if (speed !== stored) {
      console.warn(
        `${KEY_KEYBOARD_SPEED} holds ${stored}, outside ADR 0011's ${MULTIPLIER_MIN} to ${MULTIPLIER_MAX} range; the keys steer at ${speed} instead`,
      );
    }
    return speed;
  }

  // Set the keyboard speed multiplier
  public setKeyboardSpeed(value: number) {
    const speed = clampKeyboardSpeed(value);
    if (speed !== value) {
      console.warn(
        `a keyboard speed of ${value} was asked for, outside ADR 0011's ${MULTIPLIER_MIN} to ${MULTIPLIER_MAX} range; ${speed} is stored and the keys steer at that instead`,
      );
    }
    storage.setNumber(KEY_KEYBOARD_SPEED, speed);
  }

  // Get sound effects volume
  public getSfxVolume() {
    return storage.getNumber(KEY_VOLUME_SFX) ?? 1;
  }

  // Set sound effects volume
  public setSfxVolume(value: number) {
    storage.setNumber(KEY_VOLUME_SFX, value);
  }
}

const userSettings = new UserSettings();

export { userSettings };
