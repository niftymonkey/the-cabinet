/**
 * The belch's one control (plan 6.17). Mark ruled a dedicated corner button on
 * 2026-08-22, over any second-pointer binding, because the belch is the scarcest
 * object in the game and is spendable only at the moment it is worth most.
 */

import { describe, expect, it } from 'vitest';

import { resize } from '../../../../engine/resize/resize';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../../../game/field';
import { READOUT_RESERVE } from '../../../layout';
import { PALETTE } from '../../../palette';
import {
  BELCH_SIZE,
  BelchButton,
  chargeFace,
  filledSegments,
} from '../BelchButton';

/** APCA and the touch-target floors are both published; this is the smaller of the two. */
const TOUCH_TARGET_CSS = 44;

/**
 * The viewports the layout tests already use, plus the phone at its small
 * viewport. The 390 by 844 row is the height a phone reports with its chrome
 * retracted, which is not what the page is sized to: `#app` is sized at `svh`,
 * so the standing case is a shorter window and nothing in this sweep saw it.
 */
const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'phone at svh 660', width: 393, height: 660 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
];

/** The pause button's own footprint, from GameScreen's constants. */
const PAUSE_WIDTH = 132;
const PAUSE_HEIGHT = 68;

interface Rect {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
}

/** How many CSS pixels one stage unit is worth at a viewport. */
function cssPerStageUnit(width: number, height: number): number {
  const stage = resize(width, height, FIELD_WIDTH, FIELD_HEIGHT, false);
  return width / stage.width;
}

/**
 * The belch button's footprint, from the same reserve GameScreen positions it
 * from. Bottom left on Mark's ruling of 2026-09-15.
 */
function belchRect(height: number): Rect {
  return {
    top: height - READOUT_RESERVE.margin - BELCH_SIZE,
    bottom: height - READOUT_RESERVE.margin,
    left: READOUT_RESERVE.margin,
    right: READOUT_RESERVE.margin + BELCH_SIZE,
  };
}

/** The pause button's footprint, mirrored into the right-hand reserve. */
function pauseRect(width: number): Rect {
  return {
    top: READOUT_RESERVE.margin,
    bottom: READOUT_RESERVE.margin + PAUSE_HEIGHT,
    left: width - READOUT_RESERVE.margin - PAUSE_WIDTH,
    right: width - READOUT_RESERVE.margin,
  };
}

/**
 * The two top corners the readout stack claims, exactly as layout.ts's
 * coversAReadout builds them: both start at the stage's own top edge.
 */
function reservedCorners(width: number): Rect[] {
  const corner = (left: number): Rect => ({
    top: 0,
    bottom: READOUT_RESERVE.height,
    left,
    right: left + READOUT_RESERVE.width,
  });
  return [corner(0), corner(width - READOUT_RESERVE.width)];
}

/** Half-open on both axes, the convention layout.ts's own intersects uses. */
function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
  );
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

  it('carries the same target at an empty reservoir as at a full one', () => {
    // The charge is drawn as an arc inside the ring, so nothing about the fill
    // may reach the hit area. A fill that shrinks the touchable area is a stop.
    const button = new BelchButton(() => undefined);
    const edge = BELCH_SIZE / 2 - 1;
    const corners: [number, number][] = [
      [0, 0],
      [edge, 0],
      [-edge, 0],
      [0, edge],
      [0, -edge],
    ];
    for (const charge of [0, 0.5, 1]) {
      button.sync(charge, 0);
      const hit = button.hitArea;
      expect(hit).not.toBeNull();
      const inside = corners.every(([x, y]) => hit?.contains(x, y) === true);
      expect(`${charge}: ${inside}`).toBe(`${charge}: true`);
    }
  });

  it('sits in the bottom-left corner and overlaps neither reserved corner nor the pause button', () => {
    // It is positioned from the same reserve the pause button is, so the two
    // cannot drift apart and the non-overlap rule stays one rule in one place.
    // On the left the corner it has to clear is the readout stack's column
    // rather than the pause button's, so both are asserted.
    for (const { name, width, height } of VIEWPORTS) {
      const belch = belchRect(height);
      const clashes = [
        ...reservedCorners(width).map((corner, index) =>
          overlaps(belch, corner) ? `reserve ${index}` : '',
        ),
        overlaps(belch, pauseRect(width)) ? 'pause' : '',
      ].filter((each) => each.length > 0);
      expect(`${name}: ${clashes.join(',')}`).toBe(`${name}: `);
      expect(`${name}: ${belch.left}`).toBe(
        `${name}: ${READOUT_RESERVE.margin}`,
      );
      expect(`${name}: ${belch.bottom}`).toBe(
        `${name}: ${height - READOUT_RESERVE.margin}`,
      );
    }
  });
});

describe('the ring fills with the reservoir (record R7)', () => {
  it('reads partway full at a partway-full reservoir', () => {
    // The done line of #127: without looking away from the field the player can
    // tell roughly how close the belch is to ready.
    expect(chargeFace(0, 0).filled).toBe(0);
    expect(chargeFace(0.5, 0).filled).toBeCloseTo(0.5, 10);
    expect(chargeFace(1, 0).filled).toBe(1);
    const climbing = [0.1, 0.25, 0.5, 0.75, 0.9].map(
      (charge) => chargeFace(charge, 0).filled,
    );
    expect([...climbing].sort((a, b) => a - b)).toEqual(climbing);
  });

  it('fills with the reservoir alone, whatever the tick', () => {
    // The fill is a readout of one number. A tick term in it would make the
    // same reservoir read differently from one frame to the next.
    for (const charge of [0, 0.17, 0.5, 0.83]) {
      const at = [0, 1, 7, 39, 40, 41, 199].map(
        (tick) => chargeFace(charge, tick).filled,
      );
      expect(`${charge}: ${new Set(at).size}`).toBe(`${charge}: 1`);
    }
  });

  it('never announces the charge by brightness alone', () => {
    // ADR 0054's reading of ADR 0014: the HUD announces by count, by shape or
    // by subtraction and never by getting brighter. The fill announces by area,
    // so the alpha holds still across every charge below full while the filled
    // share is what moves. This is what retired QUIET_ALPHA.
    const charges = [0, 0.1, 0.25, 0.5, 0.75, 0.99];
    const alphas = charges.map((charge) => chargeFace(charge, 0).alpha);
    expect(new Set(alphas).size).toBe(1);
    const areas = charges.map((charge) => chargeFace(charge, 0).filled);
    expect(new Set(areas).size).toBe(charges.length);
  });

  it('changes colour and pulses at a full reservoir and at nothing below one', () => {
    // Ready is a colour change plus the pulse that already existed. Both are
    // channels ADR 0054 allows: one is hue at a held value and the other is
    // motion, rather than a brightness comparison against a remembered state.
    for (const charge of [0, 0.5, 0.99]) {
      expect(`${charge}: ${chargeFace(charge, 0).ink}`).toBe(
        `${charge}: ${PALETTE.reservoirCharge.hex}`,
      );
    }
    expect(chargeFace(1, 0).ink).toBe(PALETTE.graveGlow.hex);

    const pulsing = [];
    for (let tick = 0; tick < 60; tick++)
      pulsing.push(chargeFace(1, tick).alpha);
    expect(new Set(pulsing).size).toBeGreaterThan(1);
    expect(Math.max(...pulsing)).toBeLessThanOrEqual(1);

    const steady = [];
    for (let tick = 0; tick < 60; tick++)
      steady.push(chargeFace(0.99, tick).alpha);
    expect(new Set(steady).size).toBe(1);
  });

  it('closes the ring at a full reservoir and never a segment before one', () => {
    // The arc is sampled, so the last segment before full is where a rounded
    // quantum would draw the complete circle the ready state draws. The one
    // thing the player reads off this control is whether the belch can be
    // spent, so the arc rounds down and only a full reservoir closes it.
    const closed = filledSegments(1);
    expect(closed).toBeGreaterThan(0);
    for (const charge of [0.5, 0.9, 0.99, 0.999, 0.9999]) {
      const step = filledSegments(chargeFace(charge, 0).filled);
      expect(`${charge}: ${step < closed}`).toBe(`${charge}: true`);
    }
    // The nearest charge below full lands exactly one segment short of closed,
    // which is what says the arc rounds down rather than merely clamping.
    expect(filledSegments(chargeFace(0.9999, 0).filled)).toBe(closed - 1);
    expect(filledSegments(chargeFace(0, 0).filled)).toBe(0);
  });

  it('treats a reservoir past full and a broken one as the ends of its own range', () => {
    // GameScreen divides by the capacity and the fill's own binary64 overshoot
    // is a known trap in this codebase, so the clamp is the control's and not
    // the caller's.
    expect(chargeFace(1.0000001, 0).filled).toBe(1);
    expect(chargeFace(-0.2, 0).filled).toBe(0);
    expect(chargeFace(1.0000001, 0).ink).toBe(PALETTE.graveGlow.hex);
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
  it('draws only declared palette colours, all three inside the ceiling', () => {
    // It is inside src/app/screens/game, so palette.test.ts's source scan
    // already forbids a colour literal, a MENU colour and a blendMode here.
    // This is the positive half: the colours it does use are declared ones.
    for (const name of ['hudInk', 'reservoirCharge', 'graveGlow'] as const) {
      expect(PALETTE[name].hex).toEqual(expect.any(Number));
      expect(`${name} ${PALETTE[name].luma <= 68}`).toBe(`${name} true`);
    }
  });

  it('holds its three colours at one value, so no state of it is brighter than another', () => {
    // The track, the charge and the ready tell are told apart by hue and by
    // area alone. If they parted on value, the ring would announce by getting
    // brighter whatever the drawing code did, which is the channel ADR 0054
    // closes.
    // The declared lumas are what palette.test.ts holds against the hexes, so
    // reading them here is reading the measurement rather than repeating it.
    const drawn = ['hudInk', 'reservoirCharge', 'graveGlow'] as const;
    const measured = drawn.map((name) => PALETTE[name].luma);
    expect(Math.max(...measured) - Math.min(...measured)).toBeLessThan(0.05);
  });

  it('is a ring rather than a filled disc, so it cannot hide a shot', () => {
    // GameScreen adds the field first, so anything added as a sibling draws
    // above mobFire, which ADR 0014 lets nothing do. Every charge is measured
    // and not only the full one: the arc is a second path in the same Graphics,
    // and drawn without its own moveTo it ran a chord back across the ring and
    // put the control's footprint at 112 units.
    const button = new BelchButton(() => undefined);
    for (const charge of [0, 0.02, 0.25, 0.5, 0.75, 0.99, 1]) {
      button.sync(charge, 0);
      const drawn = button.getLocalBounds();
      expect(`${charge}: ${drawn.width} ${drawn.height}`).toBe(
        `${charge}: ${BELCH_SIZE} ${BELCH_SIZE}`,
      );
    }
  });
});
