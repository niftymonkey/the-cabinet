// The pull: the grave's tug on food close to its rim (design record R3).

import { TICK_HZ } from './clock';
import type { Corpse } from './corpses';
import { corpseHitbox } from './corpses';
import type { Grave } from './grave';
import { graveHitbox } from './grave';
import { exp, normalize } from './math';
import { moveInsideBounds } from './mobs';
import type { Rect } from './overlap';
import type { RunState } from './run';
import type { SwallowTuning } from './tuningRecord';

/** A speed on the field, in field units a tick. */
interface Velocity {
  readonly x: number;
  readonly y: number;
}

const AT_REST: Velocity = { x: 0, y: 0 };

/**
 * How far apart two boxes are, and zero where they touch or overlap.
 *
 * On each axis the separation is the larger of the two one-sided distances and
 * never below zero, so a box beside another on one axis and level with it on
 * the other is exactly its side-to-side distance away. Multiply, subtract and
 * square root only, all three exactly specified, so the gap is the same number
 * on a phone and on a computer (ADR 0015).
 */
const gapBetween = (food: Rect, mouth: Rect): number => {
  const across = Math.max(
    0,
    mouth.x - (food.x + food.width),
    food.x - (mouth.x + mouth.width),
  );
  const down = Math.max(
    0,
    mouth.y - (food.y + food.height),
    food.y - (mouth.y + mouth.height),
  );
  return Math.sqrt(across * across + down * down);
};

/**
 * How much of the pull's strength reaches this far out: one at the rim, falling
 * to nothing at the reach and staying there beyond it.
 *
 * It is the prototype's out-cubic ease written as multiplication rather than as
 * a power, because `Math.pow` is implementation-approximated and a tape must
 * replay the same everywhere (ADR 0015). A reach at or below zero is a pull
 * switched off, which is the same reading a strength of zero gives.
 */
const nearnessAt = (gap: number, reach: number): number => {
  if (reach <= 0 || gap >= reach) return 0;
  const out = gap / reach;
  return 1 - out * out * out;
};

/**
 * The velocity the pull wants this food to be moving at, toward the grave's
 * centre.
 *
 * The strength is a speed a second and every speed in the rules is a speed a
 * tick, so it is divided by the tick rate where it is read: the rules have no
 * dt. Food at the grave's exact centre has no direction to go, which
 * `normalize` answers as a zero vector rather than as a division by nothing.
 */
const wantedVelocity = (
  corpse: Corpse,
  grave: Grave,
  mouth: Rect,
  tuning: SwallowTuning,
): Velocity => {
  const gap = gapBetween(corpseHitbox(corpse), mouth);
  const nearness = nearnessAt(gap, tuning.pullReach);
  if (nearness === 0) return AT_REST;
  const toward = normalize(grave.x - corpse.x, grave.y - corpse.y);
  const speed = (tuning.pullStrength * nearness) / TICK_HZ;
  return { x: toward.x * speed, y: toward.y * speed };
};

/**
 * The share of the difference between a velocity and the one the pull wants
 * that one tick closes.
 *
 * An exponential approach rather than a step toward the wanted speed, so the
 * pull reads as a tug and food arrives at the mouth moving. It uses the `exp`
 * of math.ts and never `Math.exp`, which is implementation-approximated.
 */
const catchUpShare = (response: number): number => {
  return 1 - exp(-response / TICK_HZ);
};

/**
 * The grave's tug on the food near its rim, once a tick (design record R3).
 *
 * Out of the reach the wanted velocity is zero, so the same line is the
 * ground's drag: a corpse the grave has left behind coasts to a stop and one
 * nothing ever pulled keeps a velocity of exactly zero. The move goes through
 * the bound the shove uses, because a pull is one more thing carrying a body
 * somewhere it did not walk (mobs.ts, moveInsideBounds).
 *
 * A living mob is never food and is never pulled (Mark's decision 2), and the
 * option bodies of a live offer stand still whatever the grave does, because
 * the options hold their places relative to each other and the choice is a
 * place to be rather than a moment to hit (ADR 0034). Both are absences, so the
 * tests that guard them are what say they are deliberate.
 */
const pullFood = (state: RunState): void => {
  const mouth = graveHitbox(state.grave);
  const tuning = state.conditions.tuning.swallow;
  const catchUp = catchUpShare(tuning.pullResponse);
  const options: readonly number[] = state.offer?.bodyIds ?? [];
  for (const corpse of state.corpses) {
    if (!corpse.alive || options.includes(corpse.id)) continue;
    const wanted = wantedVelocity(corpse, state.grave, mouth, tuning);
    corpse.vx += (wanted.x - corpse.vx) * catchUp;
    corpse.vy += (wanted.y - corpse.vy) * catchUp;
    // Food at rest is left alone rather than moved by nothing, because the
    // bound below would still clamp a body standing outside it.
    if (corpse.vx === 0 && corpse.vy === 0) continue;
    moveInsideBounds(corpse, corpse.x + corpse.vx, corpse.y + corpse.vy);
  }
};

export { pullFood };
