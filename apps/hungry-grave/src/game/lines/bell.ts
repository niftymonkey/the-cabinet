// The bell: the funeral toll, always on from level 1, on its own clock and
// never fired by a swallow (ADR 0005). What a toll throws is cones (ADR 0036).

import type { SimEvent } from '../events';
import { atan2, normalize } from '../math';
import type { RunState } from '../run';
import type { StormTarget } from '../stormTargets';
import {
  damageStormTarget,
  shoveStormTarget,
  stormTargets,
} from '../stormTargets';
import { MAX_LEVEL } from './roster';

/**
 * What one level's toll throws: where its cones point, how wide each one opens,
 * how far they reach, how far inside that their damage reaches, and how hard
 * they shove. Angles in radians, both reaches and the push in field units.
 *
 * The cone count is the length of `headings` rather than a field of its own, so
 * a row cannot declare a count its headings disagree with.
 */
interface ConeRow {
  readonly headings: readonly number[];
  readonly halfAngle: number;
  readonly reach: number;
  readonly damageReach: number;
  readonly push: number;
}

interface BellToll {
  readonly level: number;
  ticks: number;
  /**
   * The mobs this toll has already struck, by entity id.
   *
   * A reach-crossing test alone does not hold "damaged once by one toll" as
   * soon as the toll pushes: the push carries a mob back outside the edge that
   * has just passed it, and the edge then catches it again, so a level-5 toll
   * strikes a mob at eighty percent of its reach six times for 58.4 damage
   * where the rule asks for one strike and 12.0. That is a shambler and a half
   * instead of three tenths of one.
   *
   * Keyed by entity id and never by slot, so this carries none of the recycled
   * slot hazard a per-mob cooldown field would: ids only ever increase, a
   * recycled slot arrives with a new one, and the set dies with the toll.
   */
  readonly struck: Set<number>;
}

// Ticks between tolls: three seconds, a rhythm to position against.
const BELL_PERIOD = 180;

/**
 * How long a toll takes to reach its full reach. It finishes well inside its
 * own period, so the player never sees two tolls at once and one live toll at a
 * time is an invariant rather than an assumption.
 */
const BELL_EXPAND_TICKS = 45;

const RADIANS_PER_DEGREE = Math.PI / 180;

const TWO_PI = Math.PI * 2;

/** One level's row, written in the degrees a person tunes in, converted once here. */
const coneRow = (
  headings: readonly number[],
  halfAngle: number,
  reach: number,
  damageReach: number,
  push: number,
): ConeRow => {
  return {
    headings: headings.map((degrees) => degrees * RADIANS_PER_DEGREE),
    halfAngle: halfAngle * RADIANS_PER_DEGREE,
    reach,
    damageReach,
    push,
  };
};

/**
 * What each level throws, indexed by level. Every number is an initial data row
 * and the harness tunes them all at step 4; none of them is a ruling.
 *
 * The headings are data rather than an even spacing, because an even spacing
 * puts level two's second cone dead astern, which is the opposite of ADR 0036's
 * "wrapping around toward the sides as they multiply". Every row is symmetric
 * about straight up so no player ever learns a left-handed bell. Levels one to
 * four meet or overlap into one contiguous arc ahead with the rear open; level
 * five is the surround, five cones with five six-degree slits between them, one
 * of them astern.
 *
 * Reach is derived area-preserving against the ring radii the circle used, which
 * is what ADR 0036's "reach grows with level to widen the answer" means in
 * numbers: holding a circle's area in a wedge of total angle t gives
 * R = r * sqrt(2 * pi / t).
 *
 * `reach` is the push's reach and the reach the cone is drawn at, both, so
 * nothing is ever shoved by something the player cannot see. `damageReach` is
 * where the damage falls to nothing and it is strictly inside `reach` at every
 * rung, which is ruling R10 of ../../../docs/design/round-two-wall-belch.md: on
 * one shared falloff the bodies near enough to be pushed hard are the bodies
 * the damage kills, so a shambler died everywhere inside a rung-three cone and
 * a survivor took half a field unit
 * (../../../docs/research/watched-pushback-duration.md section 1). The ratio is
 * Enter the Gungeon's Blank as its shipped prefab reads it, damage in a 7-tile
 * radius inside a knockback of 10, so seven tenths of the push's reach rounded
 * to whole units here (research section 3).
 *
 * Push is the throw a body earns when its first step matches the leading edge
 * of the cone that struck it, which is ruling R2 as superseded on 2026-09-15
 * and option 2 of the research record's section 5. That edge crosses `reach` in
 * BELL_EXPAND_TICKS ticks and a linear fall over SHOVE_TICKS ticks from a first
 * step s covers s * (SHOVE_TICKS + 1) / 2 (shove.ts, firstStepOf), so every row
 * is its own reach over 45, times 15.5, in whole units: 160 gives 55.1, 183
 * gives 63.0, 207 gives 71.3, 231 gives 79.6 and 261 gives 89.9, which is the
 * research's own 90 at the top rung.
 *
 * Push begins at level one, where the circle had it only at four and five. The
 * evidence is #79's own reading: 42, 51 and 0 field units of total pushback
 * across three runs, which ADR 0036 records as "a line that was never felt".
 *
 * Level 0 throws no cones at all, so the line is silent at the start of a run.
 */
const BELL_CONE_ROWS: readonly ConeRow[] = [
  coneRow([], 0, 0, 0, 0),
  coneRow([0], 45, 160, 112, 55),
  coneRow([-40, 40], 40, 183, 128, 63),
  coneRow([-60, 0, 60], 38, 207, 145, 71),
  coneRow([-108, -36, 36, 108], 36, 231, 162, 80),
  coneRow([-144, -72, 0, 72, 144], 33, 261, 183, 90),
];

/**
 * Damage at the grave itself, at each rung, indexed by level. The bell is the
 * named exception to the roster's x2 damage ceiling and lands at x2.6
 * (docs/research/weapon-growth-per-level-precedent.md section 4): the far edge
 * is exactly an eighth of the near edge (ADR 0036), so a step of 25% of 40
 * would put the far edge at 6.25, and 40% of the rung-1 figure is the smallest
 * step that keeps both whole.
 *
 * At rung 1 the near edge takes a mow body five times over (ADR 0059), so what
 * the lane buys out here is the bodies the toll does not already delete: a
 * revenant is two tolls at rung 1 and one at rung 5.
 *
 * Level 0 throws no cones at all, so it takes nothing off anything.
 */
const BELL_DAMAGE_NEAR_BY_LEVEL: readonly number[] = [0, 40, 56, 72, 88, 104];

/**
 * Damage at the far edge of a cone's damage reach, at each rung. The far edge
 * tickles, which is Mark's 2026-08-19 ruling recorded in ADR 0036's own first
 * paragraph and held there as a ratio: an eighth of the near edge at every
 * rung, which is what sized the near edge's own step. At rung 1 that is two
 * tolls out here to take a mow body, against one at the grave.
 */
const BELL_DAMAGE_FAR_BY_LEVEL: readonly number[] = [0, 5, 7, 9, 11, 13];

/**
 * The row a level throws, and nothing at all past the authored rows. Every
 * reader below refuses on that rather than working from a number nobody
 * authored, which is the shape #53 asked for when the tables were arrays.
 */
const rowFor = (level: number): ConeRow | undefined => {
  if (!Number.isInteger(level)) return undefined;
  if (level < 0 || level >= BELL_CONE_ROWS.length) return undefined;
  return BELL_CONE_ROWS[level];
};

/**
 * What a toll at this rung takes at the grave, clamped at the last rung the
 * table authors rather than reading past it. A level below zero is not a rung
 * and fails loudly.
 */
const bellDamageNear = (level: number): number => {
  const damage = BELL_DAMAGE_NEAR_BY_LEVEL[Math.min(level, MAX_LEVEL)];
  if (damage === undefined) {
    throw new Error(`no bell damage at level ${level}`);
  }
  return damage;
};

// What a toll at this rung takes at the far edge of its damage reach, an eighth of the near edge.
const bellDamageFar = (level: number): number => {
  const damage = BELL_DAMAGE_FAR_BY_LEVEL[Math.min(level, MAX_LEVEL)];
  if (damage === undefined) {
    throw new Error(`no bell damage at level ${level}`);
  }
  return damage;
};

// How far the leading edge of this toll's cones stands from the grave, at this much of its life.
const tollReach = (toll: BellToll): number => {
  const row = rowFor(toll.level);
  if (row === undefined) return 0;
  return row.reach * (toll.ticks / BELL_EXPAND_TICKS);
};

// Where cone `index` of a toll at this level points, in radians, zero being straight up and negative to the left.
const coneHeading = (level: number, index: number): number => {
  const row = rowFor(level);
  if (row === undefined) return NaN;
  const heading = row.headings[index];
  if (heading === undefined) return NaN;
  return heading;
};

// Where a mob stands as seen from the grave: zero straight up the field, negative to the left.
const bearingFromGrave = (dx: number, dy: number): number => {
  return atan2(dx, -dy);
};

/**
 * How far past a cone's half-angle a bearing still counts as inside, in
 * radians.
 *
 * The rows are authored so that neighbouring cones meet exactly: at level two
 * both cones end at straight up, and at level four two of the seams do. On
 * exact arithmetic the arc ahead is unbroken, but the seam bearing lands one
 * part in 1e16 outside both cones, so without this a mob directly ahead of the
 * grave at level two falls through the middle of the answer. The tolerance is
 * wider than a single-precision bearing's own step and narrower than any
 * distance the field can show: at the top level's reach it is a quarter of a
 * thousandth of a field unit.
 */
const CONE_SEAM_TOLERANCE = 1e-6;

// The turn from a cone's heading to a bearing, the short way around.
const turnBetween = (heading: number, bearing: number): number => {
  const turn = (bearing - heading + Math.PI) % TWO_PI;
  return (turn < 0 ? turn + TWO_PI : turn) - Math.PI;
};

// Whether a bearing from the grave falls inside any cone of this level.
const insideCone = (level: number, bearing: number): boolean => {
  const row = rowFor(level);
  if (row === undefined) return false;
  return row.headings.some((heading) => {
    const turn = Math.abs(turnBetween(heading, bearing));
    return turn <= row.halfAngle + CONE_SEAM_TOLERANCE;
  });
};

/**
 * How much of the toll's power reaches this far out: one at the grave, nothing
 * at the reach it is asked about.
 *
 * It is called once against a row's `reach` for the push and once against its
 * `damageReach` for the damage, because the two reaches are two rows (design
 * record R10). A falloff shared between them leaves no living body to watch:
 * the bodies near enough to be pushed hard are the bodies the damage kills
 * (../../../docs/research/watched-pushback-duration.md section 1).
 *
 * It clamps at zero rather than going negative, so a body past the reach it is
 * asked about reads as nothing reaching it and never as power pulling the other
 * way.
 */
const proximity = (distance: number, full: number): number => {
  if (full <= 0) return 0;
  return Math.max(0, 1 - distance / full);
};

/**
 * Starts a shove on a target, away from the grave. The line keeps its own push
 * arithmetic and its own row and only asks the seam to start the shove: how the
 * shove then spends itself is shove.ts's, and whether the target may be shoved
 * at all is the seam's, which is what keeps a push off an authored pattern
 * (ADR 0007) and inside the field widened by SPAWN_MARGIN.
 *
 * The force comes from the toll's own level, the level the reach and the sweep
 * are already working from, so a level-up mid-toll cannot shove harder than the
 * toll that is shoving reaches. The falloff is read against the row's `reach`,
 * which is the reach the cone is drawn at, so the push carries exactly as far
 * as the picture does and nothing is shoved by something the player cannot see
 * (design record R10). The row is spent over several ticks rather than in one
 * write, which is Mark's ruling 4 of 2026-09-15.
 *
 * The shove is what reports itself, once, when the body it is carrying has
 * finished travelling (mobs.ts, reportShoveTravel), because a shove that takes
 * ticks has no realized displacement on the tick it starts. The refusals here
 * are one list whatever the reason: no push at this level, a non-finite
 * strength, or a target with no away direction.
 *
 * A shove started here first carries the body on the tick after, because the
 * lines run after the mobs in a tick (step.ts). That is the rule a shot already
 * keeps, being left at its emitter for one tick, and here it leaves the body
 * standing where the leading edge found it for one frame before it goes.
 */
const pushTarget = (
  state: RunState,
  toll: BellToll,
  target: StormTarget,
  distance: number,
): void => {
  const row = rowFor(toll.level);
  if (row === undefined) return;
  const push = row.push * proximity(distance, row.reach);
  if (!Number.isFinite(push) || push <= 0 || distance === 0) return;
  const away = normalize(target.x - state.grave.x, target.y - state.grave.y);
  if (away.length === 0) return;
  // One shove, and no spacing because there is no second one to space from: a
  // toll's push is one push, and the wave structure belongs to the belch
  // (design record R3, slice J).
  shoveStormTarget(state, target, 'bell', away.x, away.y, push, 1, 0);
};

/**
 * What a toll at this rung takes off a body this far out, or null where the
 * body stands outside the damage reach and the toll takes nothing at all.
 *
 * Null rather than zero, because a zero-damage event would put a hit that took
 * nothing into a count a reading sums. The edge of the damage reach is inside
 * it, the same way the expanding ring's own edge is: a body standing exactly
 * there is damaged and takes the far row.
 *
 * The rung is the toll's own, captured when it was armed, so a power-up taken
 * while a ring is still expanding never raises what that ring carries.
 */
const tollDamageAt = (
  row: ConeRow,
  level: number,
  distance: number,
): number | null => {
  if (distance > row.damageReach) return null;
  const far = bellDamageFar(level);
  return (
    far + (bellDamageNear(level) - far) * proximity(distance, row.damageReach)
  );
};

/**
 * Every target a cone of this toll reached this tick: inside the leading edge,
 * inside one of the cones, and not struck by this toll already.
 *
 * The toll's damage resolves here rather than in the storm's overlap pass,
 * because it is a consequence of the cones expanding rather than of two boxes
 * overlapping, and folding it into an overlap pass would mean giving the cones
 * a hitbox they do not have.
 *
 * The edge only ever grows, so "inside the edge, inside a cone and not yet
 * struck" is the tick the toll first reached the mob and no other. Stated that
 * way rather than as an annulus, it also catches a mob standing exactly on the
 * grave, which an annulus opening at zero never crosses, and it catches a mob
 * that walks into a live cone from the side rather than letting it through a
 * toll it stood in.
 */
const sweepToll = (
  state: RunState,
  toll: BellToll,
  now: number,
): SimEvent[] => {
  const events: SimEvent[] = [];
  const row = rowFor(toll.level);
  if (row === undefined) return events;
  for (const target of stormTargets(state)) {
    if (toll.struck.has(target.id)) continue;
    const dx = target.x - state.grave.x;
    const dy = target.y - state.grave.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > now) continue;
    // A body standing on the grave has no bearing to test and is inside every
    // cone: the toll leaves from under it.
    const held =
      distance === 0 || insideCone(toll.level, bearingFromGrave(dx, dy));
    if (!held) continue;
    // The strike is marked whatever the damage comes to, because the one-strike
    // rule is about the toll reaching the body: a shoved body carried back
    // across the leading edge earns no second strike either way.
    toll.struck.add(target.id);
    pushTarget(state, toll, target, distance);
    const damage = tollDamageAt(row, toll.level, distance);
    if (damage === null) continue;
    events.push(...damageStormTarget(state, target, damage, 'bell'));
  }
  return events;
};

// The live toll, one tick wider, and gone once its cones have reached full.
const expandToll = (state: RunState): SimEvent[] => {
  const toll = state.lines.ring;
  if (toll === null) return [];
  toll.ticks += 1;
  const events = sweepToll(state, toll, tollReach(toll));
  if (toll.ticks >= BELL_EXPAND_TICKS) state.lines.ring = null;
  return events;
};

/**
 * The toll's clock. It runs whatever the level is and re-arms either way, so an
 * owned bell's first toll lands within one period of the power-up rather than
 * waiting on a clock that only started then.
 */
const tollClock = (state: RunState): SimEvent[] => {
  const lines = state.lines;
  lines.tollIn -= 1;
  if (lines.tollIn > 0) return [];
  lines.tollIn += BELL_PERIOD;
  const level = state.levels.bell;
  if (level === 0) return [];
  lines.ring = { level, ticks: 0, struck: new Set() };
  return [{ type: 'tolled', level, radius: rowFor(level)?.reach ?? 0 }];
};

/**
 * The toll's clock, the live toll's expansion, and the damage its leading edge
 * deals as it crosses a mob.
 *
 * The cones expand before a new toll is armed, so a toll born this tick stands
 * at nothing until the next one, the same rule that puts a skull at the mouth
 * for one tick.
 */
const advanceBell = (state: RunState): SimEvent[] => {
  const events = expandToll(state);
  events.push(...tollClock(state));
  return events;
};

export {
  tollReach,
  coneHeading,
  insideCone,
  advanceBell,
  bellDamageNear,
  bellDamageFar,
  BELL_PERIOD,
  BELL_EXPAND_TICKS,
  BELL_CONE_ROWS,
  BELL_DAMAGE_NEAR_BY_LEVEL,
  BELL_DAMAGE_FAR_BY_LEVEL,
};
export type { BellToll, ConeRow };
