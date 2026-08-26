// The frame-rate measurement, driven by explicit elapsed values, never a clock.

import { describe, expect, it } from 'vitest';
import { FpsSampler } from '../fpsSampler';

/** Feeds whole frames of one length and returns every reading published. */
function run(sampler: FpsSampler, frames: number, frameMs: number): number[] {
  const readings: number[] = [];
  for (let i = 0; i < frames; i++) {
    const reading = sampler.sample(frameMs);
    if (reading !== null) readings.push(reading);
  }
  return readings;
}

describe('FpsSampler', () => {
  it('publishes nothing until the window of real time has passed', () => {
    expect(run(new FpsSampler(250), 14, 16.67)).toEqual([]);
  });

  it('measures 60 at sixty frames a second', () => {
    expect(run(new FpsSampler(250), 15, 16.67)).toEqual([60]);
  });

  it('measures a high refresh rate rather than capping it', () => {
    // 144 Hz is a 6.944 ms frame, so the window closes on the 37th.
    expect(run(new FpsSampler(250), 37, 6.944)).toEqual([144]);
  });

  it("one long frame reads as the low rate it was, not the last frame's", () => {
    expect(new FpsSampler(250).sample(300)).toBe(3);
  });

  it('keeps publishing on the window, once per window', () => {
    expect(run(new FpsSampler(250), 45, 16.67)).toEqual([60, 60, 60]);
  });

  it('counts every frame in the window, not just the one it publishes on', () => {
    // Ticker.FPS on the closing frame would read 60; the window held 30.
    const sampler = new FpsSampler(100);
    expect(run(sampler, 2, 41.665)).toEqual([]);
    expect(sampler.sample(16.67)).toBe(30);
  });
});
