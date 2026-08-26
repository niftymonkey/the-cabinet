/**
 * The headstones: orbiting stones, last-ditch close defense, always on from
 * level 1 and counter-rotating in two rings at the higher levels (ADR 0005).
 *
 * No pool, no spawn, no cull. The count is a function of the level and the
 * positions are a function of one orbit phase, so the stones are computed each
 * tick from state.lines. A pool would give the game a second, weaker source of
 * truth for how many stones exist, and the level is already the answer.
 */

import type { SimEvent } from '../events';
import { graveWidth } from '../grave';
import { cos, sin } from '../math';
import type { RunState } from '../run';

/**
 * How many stones each level orbits, indexed by level. The concept doc's
 * endpoints are one slow stone and six in two counter-rotating rings, so the
 * first ring holds up to three and a second ring appears at level 4 and counter
 * rotates: level 4 is three plus one and level 5 is three plus three.
 */
export const STONES_BY_LEVEL: readonly number[] = [0, 1, 2, 3, 4, 6];

/** How many stones the first ring holds before a second ring opens. */
export const RING_CAPACITY = 3;

/** The most stones any level orbits, which is how long stoneRecharge is pre-allocated. */
export const MAX_STONES = STONES_BY_LEVEL[STONES_BY_LEVEL.length - 1];

/**
 * How far outside the grave's own hitbox a stone's path runs, in field units. A
 * shambler's half-width is 11, so the path sits a little outside where a
 * shambler's own centre would be at the instant its body touched the rim. That
 * is what makes this a close defense rather than a second stream: the stone
 * meets a mob exactly as the mob becomes a contact threat, and no earlier.
 */
export const STONE_STANDOFF = 14;

/**
 * Ticks per revolution, deliberately slower than the grave. BASE_SPEED crosses
 * the field's width in two seconds, so a player who runs can outrun their own
 * stones, which is exactly what "last-ditch" has to mean.
 */
export const ORBIT_TICKS = 120;

/**
 * How long a stone that hits stays inert, in ticks. The alternative, a per-mob
 * cooldown, needs a field on every mob and a rule about what happens when the
 * mob dies and its slot is recycled, which is the exact class of pooled-state
 * bug this codebase has hit five times. One number on the stone has nowhere to
 * leak to.
 */
export const STONE_RECHARGE = 30;

/** How far the orbit turns in one tick, in radians. */
const ORBIT_STEP = (2 * Math.PI) / ORBIT_TICKS;

export const STONE_HALF_EXTENT = 5;
export const STONE_DAMAGE = 1;

/** How many stones this run's headstone level orbits. */
export function stoneCount(state: RunState): number {
  return STONES_BY_LEVEL[state.levels.headstones];
}

/**
 * Where one stone stands this tick, or null past the level's own count.
 *
 * The orbit is elliptical and that is load-bearing. The grave is twice as tall
 * as it is wide, so a circular orbit sized to clear the rim horizontally passes
 * straight through the grave vertically and a stone would spend half its
 * revolution invisible inside the mouth. The radii are the grave's own hitbox
 * pushed out by a fixed margin, so the ring reads as orbiting the grave rather
 * than a point near it, and it scales with the grave for free.
 */
export function headstoneAt(
  state: RunState,
  index: number,
): { x: number; y: number } | null {
  const count = stoneCount(state);
  if (index < 0 || index >= count) return null;

  const ring = index < RING_CAPACITY ? 0 : 1;
  const inRing = ring === 0 ? index : index - RING_CAPACITY;
  const ringSize =
    ring === 0 ? Math.min(count, RING_CAPACITY) : count - RING_CAPACITY;
  // The second ring runs the same period the opposite way, so the two cross
  // twice per revolution and the pattern reads as two rings rather than noise.
  const direction = ring === 0 ? 1 : -1;
  const angle =
    direction * state.lines.orbitPhase + (inRing / ringSize) * 2 * Math.PI;

  const grave = state.grave;
  return {
    x: grave.x + cos(angle) * (graveWidth(grave.size) / 2 + STONE_STANDOFF),
    y: grave.y + sin(angle) * (grave.size + STONE_STANDOFF),
  };
}

/**
 * The orbit's phase and every stone's recharge, one tick on. The damage is not
 * here: a stone meeting a mob is an overlap, and mobs.ts owns the consequence of
 * a mob being hit.
 */
export function advanceHeadstones(state: RunState): SimEvent[] {
  const lines = state.lines;
  // Wrapped every tick rather than left to grow, so a long run cannot lose
  // precision in the phase. The orbit is on the digest's path on every tick of
  // every run, which is what puts math.ts there too.
  lines.orbitPhase = (lines.orbitPhase + ORBIT_STEP) % (2 * Math.PI);
  for (let slot = 0; slot < lines.stoneRecharge.length; slot++) {
    if (lines.stoneRecharge[slot] > 0) lines.stoneRecharge[slot] -= 1;
  }
  return [];
}
