/**
 * Real time into fixed ticks, and the catch-up clamp (ADR 0015). The
 * accumulator is fed wall-clock time and is not itself deterministic; what is
 * deterministic is the sim, which only ever sees whole ticks.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createClock,
  MAX_CATCHUP_TICKS,
  resetClock,
  TICK_HZ,
  TICK_MS,
  ticksFor,
} from '../clock';

beforeEach(() => {
  vi.resetModules();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('an elapsed time that is no real span', () => {
  it('a negative or non-finite elapsed time is not silent', async () => {
    // A fresh module per test: the report is once per session, so a stale flag
    // would make a green test green for the wrong reason.
    const { createClock, ticksFor } = await import('../clock');
    const clock = createClock();

    expect(ticksFor(clock, Number.NaN)).toBe(0);

    const said = vi
      .mocked(console.warn)
      .mock.calls.map((call) => call.join(' '));
    expect(said).toHaveLength(1);
    // What happened, and what it costs.
    expect(said[0]).toContain('NaN');
    expect(said[0]).toContain('no ticks');
  });

  it('the repair logs once, not once per frame', async () => {
    const { createClock, ticksFor } = await import('../clock');
    const clock = createClock();

    for (let frame = 0; frame < 600; frame += 1) ticksFor(clock, -16.7);

    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('a zero elapsed time stays quiet, because the screen hands one over on purpose', async () => {
    // GameScreen.takeElapsed returns zero on the first frame back from a pause
    // or a backgrounded tab, so a zero is an expected input and not a repair.
    const { createClock, ticksFor } = await import('../clock');
    const clock = createClock();

    expect(ticksFor(clock, 0)).toBe(0);

    expect(console.warn).not.toHaveBeenCalled();
  });
});

describe('the tick accumulator', () => {
  it('emits whole ticks only and carries the remainder: 25 ms is one tick, and a second 25 ms is two', () => {
    const clock = createClock();
    // 25 ms is a tick and a half, so one tick runs and half a tick is carried.
    expect(ticksFor(clock, 25)).toBe(1);
    expect(clock.remainderMs).toBeCloseTo(TICK_MS / 2, 9);
    // The carried half plus another one and a half is three halves of a tick.
    expect(ticksFor(clock, 25)).toBe(2);
  });
  it('exactly TICK_MS yields exactly one tick and a zero remainder', () => {
    const clock = createClock();
    expect(ticksFor(clock, TICK_MS)).toBe(1);
    expect(clock.remainderMs).toBe(0);
    expect(clock.debtTicks).toBe(0);
  });
  it('catch-up is clamped: a 5000 ms frame yields MAX_CATCHUP_TICKS and never 300 (ADR 0015)', () => {
    const clock = createClock();
    // Five seconds of real time is three hundred ticks. A backgrounded tab
    // must not fire a burst the player has no chance to answer.
    expect(ticksFor(clock, 5000)).toBe(MAX_CATCHUP_TICKS);
    expect(MAX_CATCHUP_TICKS).toBeLessThan(300);
  });
  it('the clamp records what it discarded as debtTicks, so a struggling phone is not invisible behind a healthy frame rate', () => {
    const clock = createClock();
    ticksFor(clock, 5000);
    const ticksOfRealTime = (5000 / 1000) * TICK_HZ;
    expect(clock.debtTicks).toBe(ticksOfRealTime - MAX_CATCHUP_TICKS);
  });
  it('after a clamped frame a normal frame yields a normal tick count, which is the spiral of death arrived at through the clamp', () => {
    // Clamping the tick count instead of the elapsed time leaves the
    // accumulator saturated, and every later frame then clamps forever. The two
    // tests above both pass in that state, so this is the one that sees it.
    const clock = createClock();
    ticksFor(clock, 5000);
    expect(ticksFor(clock, 16.7)).toBe(1);
    expect(ticksFor(clock, 16.7)).toBe(1);
  });
  it('resetClock clears the remainder and does not touch debtTicks, so a tab switch does not read as a struggling phone', () => {
    const clock = createClock();
    ticksFor(clock, 5000);
    ticksFor(clock, 25);
    const debt = clock.debtTicks;
    expect(debt).toBeGreaterThan(0);
    expect(clock.remainderMs).toBeGreaterThan(0);
    resetClock(clock);
    expect(clock.remainderMs).toBe(0);
    expect(clock.debtTicks).toBe(debt);
  });
  it('zero, negative and non-finite elapsed times yield zero ticks and leave the remainder untouched', () => {
    // A browser reports all three across a tab switch.
    const clock = createClock();
    ticksFor(clock, 25);
    const carried = clock.remainderMs;
    for (const elapsed of [0, -1, -5000, NaN, Infinity, -Infinity]) {
      expect(ticksFor(clock, elapsed)).toBe(0);
      expect(clock.remainderMs).toBe(carried);
      expect(clock.debtTicks).toBe(0);
    }
  });
  it('two clocks fed the same elapsed sequence produce the same tick sequence, so the bot and the screen share one implementation (ADR 0015)', () => {
    const frames = [16.7, 16.6, 33.4, 8.2, 5000, 16.7, 12, 40, 0, 16.7];
    const bot = createClock();
    const screen = createClock();
    expect(frames.map((frame) => ticksFor(bot, frame))).toEqual(
      frames.map((frame) => ticksFor(screen, frame)),
    );
    expect(bot).toEqual(screen);
  });
});
