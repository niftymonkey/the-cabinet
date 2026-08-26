// The keyboard speed slider's range and the speeds its positions mean.

import { describe, expect, it } from 'vitest';
import { MULTIPLIER_MAX, MULTIPLIER_MIN } from '../../input/keys';
import {
  KEYBOARD_SPEED_SLIDER_MAX,
  KEYBOARD_SPEED_SLIDER_MIN,
  keyboardSpeedFromSlider,
  sliderFromKeyboardSpeed,
} from '../keyboardSpeedSlider';

describe('the keyboard speed slider (ADR 0011)', () => {
  it("the slider's 15 to 30 range maps to 0.05 steps across 0.75 to 1.5", () => {
    // The tracer plan's checklist said 0.1 steps across 0.5x to 2.0x. 0.1 does
    // not divide 0.75 to 1.5 evenly, so the step moved with the range.
    expect(keyboardSpeedFromSlider(KEYBOARD_SPEED_SLIDER_MIN)).toBeCloseTo(
      MULTIPLIER_MIN,
      12,
    );
    expect(keyboardSpeedFromSlider(KEYBOARD_SPEED_SLIDER_MAX)).toBeCloseTo(
      MULTIPLIER_MAX,
      12,
    );
    expect(keyboardSpeedFromSlider(20)).toBeCloseTo(1, 12);

    for (
      let position = KEYBOARD_SPEED_SLIDER_MIN + 1;
      position <= KEYBOARD_SPEED_SLIDER_MAX;
      position++
    ) {
      const step =
        keyboardSpeedFromSlider(position) -
        keyboardSpeedFromSlider(position - 1);
      expect(step).toBeCloseTo(0.05, 12);
    }

    // A fractional handle position lands on a step rather than between two.
    expect(keyboardSpeedFromSlider(20.4)).toBeCloseTo(1, 12);
    expect(sliderFromKeyboardSpeed(1.25)).toBe(25);
  });
});
