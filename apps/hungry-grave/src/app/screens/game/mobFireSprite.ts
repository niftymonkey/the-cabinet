// One shot on screen, in ADR 0014's three colours, and the scatter a cancelled
// shot comes apart into.

import { Graphics } from 'pixi.js';

import type { Shot } from '../../../game/mobFire';
import { MOB_FIRE } from '../../palette';

/**
 * How much larger than its hitbox a shot is drawn.
 *
 * The whole sprite used to be built from shot.halfExtent, which is the collision
 * box, so at 5 it drew 10 field units, about 7.2 CSS pixels on a 390-wide phone,
 * on the object ADR 0014 calls large and that fifteen of eighteen bot deaths
 * came from. At 1.6 it draws 16 units, about 11.5 CSS pixels, still smaller than
 * every mob body. The hitbox does not move: this is a drawing constant and the
 * collision box stays where it is.
 */
const SHOT_DRAW_SCALE = 1.6;

/**
 * How much of the hitbox the bright core covers, so the core is the true box
 * rather than a fraction of the drawn star.
 *
 * That is Cave's and Touhou's own convention, a bright core the player can read
 * as the real danger under a larger body, and it is what makes the sprite
 * growing an honest change rather than a bigger lie about where the danger is.
 */
const SHOT_CORE_OF_HITBOX = 0.9;

// A soft star, alternating between two radii. Mob fire is large, slow and irregular, and this is the irregular half.
const star = (points: number, outer: number, inner: number): number[] => {
  const flat: number[] = [];
  for (let corner = 0; corner < points * 2; corner++) {
    const angle = (corner / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = corner % 2 === 0 ? outer : inner;
    flat.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  return flat;
};

/**
 * Mob fire, as ADR 0014's three colours: a near-black outline so the sprite
 * holds against a background the palette never planned for, a saturated body
 * carrying the hue, and a near-white core carrying the reserved value band.
 *
 * The three radii are close together on purpose. The core is what the band
 * guarantees, and at a shot's real size on screen a core drawn as a small
 * fraction of the sprite is a couple of pixels and reads as nothing at all, so
 * the outline is a rim rather than a third of the sprite.
 *
 * Alpha stays 1 and no compositing mode is set. Both are forbidden rather than
 * measured: a core at luma 90 drawn at alpha 0.90 over the night composites to
 * 81.7 and falls out of the band.
 */
const drawShot = (into: Graphics, shot: Shot): void => {
  const sprite = MOB_FIRE.trash;
  const outer = shot.halfExtent * SHOT_DRAW_SCALE;
  into
    .clear()
    .poly(star(5, outer, outer * 0.66))
    .fill({ color: sprite.outline.hex })
    .poly(star(5, outer * 0.86, outer * 0.56))
    .fill({ color: sprite.body.hex })
    // The core is a blob and not a third star. The outer shape already carries
    // the size-and-shape grammar that tells mob fire from the storm, and a core
    // drawn as a star loses most of its own area to the notches, which is the
    // area the value band is carried by.
    //
    // It is sized from the hitbox and never from the drawn star, so the bright
    // middle of the sprite is where the collision box really is.
    .circle(0, 0, shot.halfExtent * SHOT_CORE_OF_HITBOX)
    .fill({ color: sprite.core.hex });
};

// How long a cancelled shot's scatter reads for, in ticks.
const SCATTER_TICKS = 12;

// How far a scatter's spokes reach, as a multiple of the shot's own extent.
const SCATTER_REACH = 2.4;

// How many spokes a scatter throws.
const SCATTER_SPOKES = 6;

/**
 * A cancelled shot's read. A shot vanishing into the grave's mouth with no
 * effect is, in this game's grammar, the one verb of collection, so the cancel
 * is drawn as a scatter rather than a fall-in, and the belch uses the same read
 * when it cancels every shot on the field.
 *
 * The scatter shrinks rather than fading, because ADR 0014 forbids mob fire
 * drawing at anything but alpha 1.0 and this is mob fire coming apart.
 */
const drawScatter = (
  into: Graphics,
  extent: number,
  progress: number,
): void => {
  const sprite = MOB_FIRE.trash;
  const reach = extent * SCATTER_REACH * progress;
  const length = extent * (1 - progress) + extent * 0.2;
  into.clear();
  for (let spoke = 0; spoke < SCATTER_SPOKES; spoke++) {
    const angle = (spoke / SCATTER_SPOKES) * Math.PI * 2;
    const cx = Math.cos(angle) * reach;
    const cy = Math.sin(angle) * reach;
    into.circle(cx, cy, Math.max(0.5, length * 0.5));
  }
  into.fill({ color: sprite.body.hex });
};

export {
  drawScatter,
  drawShot,
  SCATTER_TICKS,
  SHOT_CORE_OF_HITBOX,
  SHOT_DRAW_SCALE,
};
