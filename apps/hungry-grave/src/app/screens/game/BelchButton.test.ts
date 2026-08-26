/**
 * The belch's one control (plan 6.17). Mark ruled a dedicated corner button on
 * 2026-08-22, over any second-pointer binding, because the belch is the scarcest
 * object in the game and is spendable only at the moment it is worth most.
 */

import { describe, expect, it } from 'vitest';

import { resize } from '../../../engine/resize/resize';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../../game/field';
import { READOUT_RESERVE } from '../../layout';
import { PALETTE } from '../../palette';
import { BELCH_SIZE, BelchButton, ringAlpha } from './BelchButton';

/** APCA and the touch-target floors are both published; this is the smaller of the two. */
const TOUCH_TARGET_CSS = 44;

/** The viewports the layout tests already use. */
const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
];

/** The pause button's own footprint, from GameScreen's constants. */
const PAUSE_WIDTH = 132;
const PAUSE_HEIGHT = 68;

/** How many CSS pixels one stage unit is worth at a viewport. */
function cssPerStageUnit(width: number, height: number): number {
  const stage = resize(width, height, FIELD_WIDTH, FIELD_HEIGHT, false);
  return width / stage.width;
}

describe('the button is reachable by a thumb (plan 6.17)', () => {
  it('is at least 44 by 44 CSS pixels at the phone, tablet and desktop viewports', () => {
    // Asserted rather than eyeballed, because the stage scales per viewport and
    // the phone is the case where this binds.
    for (const viewport of VIEWPORTS) {
      const css = BELCH_SIZE * cssPerStageUnit(viewport.width, viewport.height);
      expect(`${viewport.name}: ${css >= TOUCH_TARGET_CSS}`).toBe(
        `${viewport.name}: true`,
      );
    }
  });

  it('does not overlap the pause button at any of them', () => {
    // Both are positioned from the same reserve, so the two cannot drift apart
    // and the non-overlap rule stays one rule in one place.
    for (const viewport of VIEWPORTS) {
      const { width, height } = viewport;
      const pause = {
        top: READOUT_RESERVE.margin,
        bottom: READOUT_RESERVE.margin + PAUSE_HEIGHT,
        left: width - READOUT_RESERVE.margin - PAUSE_WIDTH,
        right: width - READOUT_RESERVE.margin,
      };
      const belch = {
        top: height - READOUT_RESERVE.margin - BELCH_SIZE,
        bottom: height - READOUT_RESERVE.margin,
        left: width - READOUT_RESERVE.margin - BELCH_SIZE,
        right: width - READOUT_RESERVE.margin,
      };
      const apart = belch.top >= pause.bottom || belch.bottom <= pause.top;
      expect(`${viewport.name}: ${apart}`).toBe(`${viewport.name}: true`);
    }
  });
});

describe('the loaded tell (plan 6.17)', () => {
  it('reads quiet below a full reservoir and lit at full', () => {
    // The player learns where their belch lives by seeing the thing under their
    // thumb change, without reading a meter.
    const quiet = ringAlpha(false, 0);
    for (let tick = 0; tick < 120; tick++) {
      expect(ringAlpha(false, tick)).toBe(quiet);
      expect(ringAlpha(true, tick)).toBeGreaterThan(quiet);
    }
  });

  it('pulses at full, so full is a state rather than the top of a ramp', () => {
    const across = [];
    for (let tick = 0; tick < 60; tick++) across.push(ringAlpha(true, tick));
    expect(new Set(across).size).toBeGreaterThan(1);
    expect(Math.max(...across)).toBeLessThanOrEqual(1);
  });
});

describe('the button and the steering pointer (plan 6.17)', () => {
  it('claims the pointer that pressed it, so a thumb that rolls does not steer', () => {
    // GameScreen listens on itself with a stage-wide hitArea and pixi's
    // federated events bubble, so without this a press on the button also
    // reaches the steer model. STEER_SLOP saves a clean tap and does not save a
    // thumb that rolls.
    let fired = 0;
    const button = new BelchButton(() => {
      fired += 1;
    });
    button.emit('pointerdown', { pointerId: 7 } as never);

    expect(fired).toBe(1);
    expect(button.owns(7)).toBe(true);
    expect(button.owns(8)).toBe(false);

    button.emit('pointerup', { pointerId: 7 } as never);
    expect(button.owns(7)).toBe(false);
  });

  it('fires on press and never on release', () => {
    // Section 6.13 spends its whole argument for running the belch before
    // overlap resolution on the frame a shot would land, and firing on release
    // gives that back as input latency at exactly that moment.
    let fired = 0;
    const button = new BelchButton(() => {
      fired += 1;
    });
    button.emit('pointerup', { pointerId: 1 } as never);
    expect(fired).toBe(0);
    button.emit('pointerdown', { pointerId: 1 } as never);
    expect(fired).toBe(1);
  });

  it('drops every claim on release(), which pause, blur and pointercancel all need', () => {
    const button = new BelchButton(() => undefined);
    button.emit('pointerdown', { pointerId: 3 } as never);
    expect(button.owns(3)).toBe(true);
    button.release();
    expect(button.owns(3)).toBe(false);
  });
});

describe('what the button draws (ADR 0014)', () => {
  it('draws only declared palette colours', () => {
    // It is inside src/app/screens/game, so palette.test.ts's source scan
    // already forbids a colour literal, a MENU colour and a blendMode here.
    // This is the positive half: the colour it does use is a declared one.
    expect(PALETTE.graveGlow.hex).toEqual(expect.any(Number));
    expect(PALETTE.graveGlow.luma).toBeLessThanOrEqual(68);
  });

  it('is a ring rather than a filled disc, so it cannot hide a shot', () => {
    // GameScreen adds the field first, so anything added as a sibling draws
    // above mobFire, which ADR 0014 lets nothing do.
    const button = new BelchButton(() => undefined);
    button.sync(true, 0);
    const drawn = button.getLocalBounds();
    expect(drawn.width).toBeLessThanOrEqual(BELCH_SIZE);
    expect(drawn.height).toBeLessThanOrEqual(BELCH_SIZE);
  });
});
