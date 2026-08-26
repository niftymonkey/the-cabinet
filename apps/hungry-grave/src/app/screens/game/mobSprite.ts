/**
 * One mob's body on screen: its type's silhouette, the mark an armed one wears,
 * and the tell that precedes its shot.
 *
 * The mob silhouettes are placeholders and ticket #38 owns the art. What they
 * have to do is satisfy ADR 0014's readability rules, and satisfying them is
 * the whole job: each type has its own outline, an armed mob looks armed, and a
 * revenant's tell is a visible change that precedes its shot. Deliberate
 * placeholder design is the standing expectation here and Halloween art is not.
 */

import { Graphics } from 'pixi.js';

import type { Mob, MobType } from '../../../game/mobs';
import { MOB_TYPES, mobTellLit } from '../../../game/mobs';
import { PALETTE } from '../../palette';
import { polygon, SPRITE_STROKE } from './foodSprite';

// How many steps the revenant's tell is quantized into, so a lit tell redraws a bounded number of times.
const TELL_STEPS = 6;

// What a mob's drawing depends on, so a sprite is rebuilt only when its look changes.
const mobLook = (mob: Mob): string => {
  const fire = MOB_TYPES[mob.type].fire;
  const lit = mobTellLit(mob);
  const step = lit
    ? Math.round((1 - mob.fireIn / Math.max(1, fire.tellTicks)) * TELL_STEPS)
    : -1;
  return `${mob.type}|${mob.armed}|${step}`;
};

// The body outline of one mob type. A shambler is squat, a revenant is a diamond, and a ghoul is a wedge that points where it is going.
const drawBody = (into: Graphics, type: MobType): void => {
  const row = MOB_TYPES[type];
  if (type === 'shambler') {
    into.roundRect(
      -row.halfWidth,
      -row.halfHeight,
      row.halfWidth * 2,
      row.halfHeight * 2,
      row.halfWidth * 0.3,
    );
    return;
  }
  if (type === 'revenant') {
    into.poly(polygon(4, row.halfWidth));
    return;
  }
  into.poly(polygon(3, row.halfWidth, Math.PI));
};

// How tall the armed notch is cut, as a share of the mob's half-width.
const ARMED_NOTCH_HEIGHT = 0.28;

/**
 * The mark an armed mob wears: a horizontal notch cut through the body.
 *
 * It is a hole rather than a second colour, so an armed mob and an unarmed one
 * differ in silhouette and in value at once and the marker survives grayscale.
 * It is a notch rather than a down-pointing triangle because the triangle was
 * the ghoul's own body shape, and ADR 0014 makes silhouette the first
 * discriminator between types: spending that channel on a fourth meaning is what
 * the notch avoids, since a horizontal bar is in no type's vocabulary.
 */
const drawArmedMark = (into: Graphics, type: MobType): void => {
  const row = MOB_TYPES[type];
  const height = row.halfWidth * ARMED_NOTCH_HEIGHT;
  into
    .rect(-row.halfWidth * 0.6, -height / 2, row.halfWidth * 1.2, height)
    .fill({ color: PALETTE.foodOutline.hex });
};

// How thick the tell's closing iris is drawn, in field units.
const TELL_STROKE = 2;

/**
 * The tell, drawn as a dark iris closing toward the centre and an outer ring
 * that grows into the shot.
 *
 * The closing iris reads as a countdown rather than as a state and is kept. What
 * it could not do alone is hold salience: it closes to a 1.6-pixel radius at the
 * moment of maximum urgency, so the announcement faded exactly as the danger
 * arrived. The outer ring is the half that grows, so the tell rises into the
 * shot instead of falling away from it.
 */
const drawTell = (into: Graphics, type: MobType, progress: number): void => {
  into.circle(0, 0, tellRadius(type, progress)).stroke({
    width: TELL_STROKE,
    color: PALETTE.foodOutline.hex,
    alignment: 0.5,
  });
  into.circle(0, 0, alarmRadius(type, progress)).stroke({
    width: TELL_STROKE * (0.4 + progress),
    color: PALETTE.foodOutline.hex,
    alignment: 0.5,
  });
};

// How wide the outer ring stands at this much of the way to the shot. It grows, where the iris closes.
const alarmRadius = (type: MobType, progress: number): number => {
  const row = MOB_TYPES[type];
  return row.halfWidth * (0.95 + 0.5 * progress);
};

// How wide the iris stands at this much of the way to the shot. It closes, so a player reads how long is left rather than only that something is coming.
const tellRadius = (type: MobType, progress: number): number => {
  const row = MOB_TYPES[type];
  return Math.max(TELL_STROKE, row.halfWidth * (0.9 - 0.7 * progress));
};

const drawMob = (into: Graphics, mob: Mob): void => {
  into.clear();
  drawBody(into, mob.type);
  into.fill({ color: PALETTE.mob.hex });
  drawBody(into, mob.type);
  into.stroke({
    width: SPRITE_STROKE,
    color: PALETTE.foodOutline.hex,
    alignment: 0.5,
  });
  if (!mob.armed) return;
  const fire = MOB_TYPES[mob.type].fire;
  if (mobTellLit(mob)) {
    drawTell(into, mob.type, 1 - mob.fireIn / Math.max(1, fire.tellTicks));
    return;
  }
  drawArmedMark(into, mob.type);
};

export { alarmRadius, drawMob, mobLook, tellRadius };
