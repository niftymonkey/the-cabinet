/**
 * One mob's body on screen: the tell that precedes its shot, read off the radii
 * the drawing is built from, and the tint a carrier wears.
 */

import { Graphics } from 'pixi.js';
import { describe, expect, it } from 'vitest';

import { MOB_TYPE_NAMES, spawnMob } from '../../../../game/mobs';
import { createRun } from '../../../../game/run';
import {
  FIELD_LUMA_CEILING,
  MOB_FIRE_BAND_MIN,
  PALETTE,
} from '../../../palette';
import { alarmRadius, drawMob, mobLook, tellRadius } from '../mobSprite';

/** The colours a sprite fills its shapes with, in the order it filled them. */
function fillColours(sprite: Graphics): number[] {
  return sprite.context.instructions
    .filter((instruction) => instruction.action === 'fill')
    .map((instruction) => instruction.data.style)
    .map((style) => (typeof style === 'number' ? style : style.color));
}

function put(carries: boolean) {
  const state = createRun(1);
  return spawnMob(
    state,
    'shambler',
    { x: 60, y: 40, vx: 0, vy: 1, index: 0 },
    carries,
  )!;
}

describe('the carrier tint (ADR 0002)', () => {
  it('reaches the render data as the flag, and the sprite draws its body from it', () => {
    // The flag travels as data and the sprite reads it: the look string is
    // what the driver diffs on, so a carrier whose sprite is already built
    // would keep an ordinary body without it.
    const carrier = put(true);
    const trash = put(false);
    expect(mobLook(carrier)).not.toBe(mobLook(trash));

    const drawn = new Graphics();
    drawMob(drawn, carrier);
    const plain = new Graphics();
    drawMob(plain, trash);
    expect(fillColours(drawn)[0]).toBe(PALETTE.drop.hex);
    expect(fillColours(plain)[0]).toBe(PALETTE.mob.hex);
  });

  it('marks the carrier by colour and never by a shape a type already owns', () => {
    // ADR 0036 retired the ring from the player's grammar and ADR 0014 makes
    // silhouette the first discriminator between mob types, so the mark may
    // not add a shape: a carrier and an ordinary mob fill the same geometry.
    const carrier = new Graphics();
    drawMob(carrier, put(true));
    const trash = new Graphics();
    drawMob(trash, put(false));
    const shapes = (sprite: Graphics) =>
      sprite.context.instructions.map((instruction) => instruction.action);
    expect(shapes(carrier)).toEqual(shapes(trash));
  });

  it('wears a declared colour that ADR 0014 lets a mob body wear', () => {
    // The tint is a stand-in and #38 owns the real one, so what is pinned is
    // the constraints rather than the hue: it is a palette colour, it is under
    // the field ceiling, it is nowhere near the band mob fire reserves, and it
    // parts from both the mob body it replaces and the mark an armed mob
    // wears.
    const declared = Object.values(PALETTE).map((entry) => entry.hex);
    expect(declared).toContain(PALETTE.drop.hex);
    expect(PALETTE.drop.luma).toBeLessThanOrEqual(FIELD_LUMA_CEILING);
    expect(PALETTE.drop.luma).toBeLessThan(MOB_FIRE_BAND_MIN);
    expect(PALETTE.drop.hex).not.toBe(PALETTE.mob.hex);
    expect(PALETTE.drop.hex).not.toBe(PALETTE.foodOutline.hex);
    // And every mob type wears it, because a carrier can be any of them.
    for (const type of MOB_TYPE_NAMES) {
      const state = createRun(2);
      const mob = spawnMob(
        state,
        type,
        { x: 60, y: 40, vx: 0, vy: 1, index: 0 },
        true,
      )!;
      const sprite = new Graphics();
      drawMob(sprite, mob);
      expect(`${type} ${fillColours(sprite)[0]}`).toBe(
        `${type} ${PALETTE.drop.hex}`,
      );
    }
  });
});

describe("dispatch 4's readability findings, fixed here (plan 6.20)", () => {
  it("gives the revenant's tell a component that grows as the shot approaches", () => {
    // The closing iris is a countdown and it stays. What it could not do alone
    // is hold salience: it closes to nothing at the moment of maximum urgency.
    const early = alarmRadius('revenant', 0);
    const late = alarmRadius('revenant', 1);
    expect(late).toBeGreaterThan(early);
    // And the iris still closes, so the pair is a countdown and an alarm.
    expect(tellRadius('revenant', 1)).toBeLessThan(tellRadius('revenant', 0));
  });
});
