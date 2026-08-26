// The keyboard speed slider's own range, and the speed each handle position means.

/**
 * The slider runs in integer positions rather than in the speed itself so the
 * handle lands on a step: twentieths give 0.05 steps across ADR 0011's 0.75x
 * to 1.5x.
 */
const KEYBOARD_SPEED_SLIDER_MIN = 15;
const KEYBOARD_SPEED_SLIDER_MAX = 30;
const KEYBOARD_SPEED_SLIDER_DIVISOR = 20;

// A slider position as a speed multiplier.
const keyboardSpeedFromSlider = (value: number): number => {
  return Math.round(value) / KEYBOARD_SPEED_SLIDER_DIVISOR;
};

// A speed multiplier back as a slider position, so the popup can show the stored setting.
const sliderFromKeyboardSpeed = (speed: number): number => {
  return Math.round(speed * KEYBOARD_SPEED_SLIDER_DIVISOR);
};

export {
  keyboardSpeedFromSlider,
  sliderFromKeyboardSpeed,
  KEYBOARD_SPEED_SLIDER_MIN,
  KEYBOARD_SPEED_SLIDER_MAX,
};
