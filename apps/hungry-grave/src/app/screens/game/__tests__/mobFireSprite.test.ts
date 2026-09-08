/**
 * One shot on screen, and the scatter a cancelled shot comes apart into. Who
 * fired a shot and what the shot looks like are two different questions, and
 * this file covers the second one.
 */

import { Graphics } from 'pixi.js';
import { describe, expect, it } from 'vitest';

import type { FireKind, Shot } from '../../../../game/mobFire';
import type { FireEmitter } from '../../../palette';
import { MOB_FIRE } from '../../../palette';
import { drawScatter, drawShot } from '../mobFireSprite';

/**
 * A compile-time guard that the sim's word and the renderer's key are the same
 * four members. `pnpm typecheck` is what runs it: a kind added to one union and
 * not the other is a shot with no sprite, or a sprite no shot can ask for, and
 * neither has a runtime moment to be caught in.
 *
 * Both sides are wrapped in a tuple. A bare `A extends B` distributes over a
 * union, so it answers "does any member match" and would have passed while the
 * two drifted apart, which is the toothless-assertion shape this repo has
 * shipped once already.
 */
type SameMembers<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : never
  : never;
const KINDS_ARE_THE_EMITTERS: SameMembers<FireKind, FireEmitter> = true;

/** Every kind a shot can draw in, read off the table the renderer keys by. */
const FIRE_KINDS = Object.keys(MOB_FIRE) as FireKind[];

/** A shot of one kind, standing still, at the extent the mob table fires at. */
function shotOf(kind: FireKind): Shot {
  return {
    alive: true,
    id: 4,
    emitter: kind === 'trash' ? 'shambler' : 'banshee',
    kind,
    x: 100,
    y: 200,
    vx: 0,
    vy: 1,
    halfExtent: 5,
  };
}

/** The colours a sprite fills its shapes with, in the order it filled them. */
function fillColours(sprite: Graphics): number[] {
  return sprite.context.instructions
    .filter((instruction) => instruction.action === 'fill')
    .map((instruction) => instruction.data.style)
    .map((style) => (typeof style === 'number' ? style : style.color));
}

describe("a shot's own fire kind (module 127)", () => {
  it('names the same four kinds the sim does, on both sides of the boundary', () => {
    expect(KINDS_ARE_THE_EMITTERS).toBe(true);
    expect(FIRE_KINDS).toHaveLength(4);
  });

  it("draws every kind in that kind's own three colours, and in no other", () => {
    // palette.ts declared tear, clod and spiral beside trash before any boss
    // existed, and mobFireSprite hard-coded the trash sprite at both its draw
    // sites, so every boss shot in the game drew in the trash body colour. What
    // it reads now is the shot's own kind.
    for (const kind of FIRE_KINDS) {
      const sprite = MOB_FIRE[kind];
      const drawn = new Graphics();
      drawShot(drawn, shotOf(kind));
      expect(`${kind} ${fillColours(drawn).join(' ')}`).toBe(
        `${kind} ${[sprite.outline.hex, sprite.body.hex, sprite.core.hex].join(' ')}`,
      );
    }
  });

  it('leaves a trash shot exactly where it was, so the field a player knows is unchanged', () => {
    // The three boss kinds are the change; trash is every mob shot in the game
    // and it draws what it always drew.
    const drawn = new Graphics();
    drawShot(drawn, shotOf('trash'));
    expect(fillColours(drawn)).toEqual([
      MOB_FIRE.trash.outline.hex,
      MOB_FIRE.trash.body.hex,
      MOB_FIRE.trash.core.hex,
    ]);
  });

  it('gives the four kinds four different bodies, so a boss pattern is not a trash shot', () => {
    const bodies = FIRE_KINDS.map((kind) => {
      const drawn = new Graphics();
      drawShot(drawn, shotOf(kind));
      return fillColours(drawn)[1];
    });
    expect(new Set(bodies).size).toBe(FIRE_KINDS.length);
  });

  it('comes apart in its own colour, so a cancelled boss shot scatters as itself', () => {
    // The belch cancels every shot on the field, boss fire included, and a
    // scatter drawn in the trash body would recolour a whole boss pattern on
    // the tick it is smothered.
    for (const kind of FIRE_KINDS) {
      const drawn = new Graphics();
      drawScatter(drawn, 5, 0.5, kind);
      expect(`${kind} ${fillColours(drawn).join(' ')}`).toBe(
        `${kind} ${MOB_FIRE[kind].body.hex}`,
      );
    }
  });
});
