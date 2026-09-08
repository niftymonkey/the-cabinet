// The bell: the funeral toll, always on from level 1, on its own clock and
// never fired by a swallow (ADR 0005). What a toll throws is cones (ADR 0036).

import type { SimEvent } from '../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import { atan2, normalize } from '../math';
import type { Mob } from '../mobs';
import { damageMob, SPAWN_MARGIN } from '../mobs';
import type { RunState } from '../run';

/**
 * What one level's toll throws: where its cones point, how wide each one opens,
 * how far they reach and how hard they shove. Angles in radians, reach and push
 * in field units.
 *
 * The cone count is the length of `headings` rather than a field of its own, so
 * a row cannot declare a count its headings disagree with.
 */
interface ConeRow {
  readonly headings: readonly number[];
  readonly halfAngle: number;
  readonly reach: number;
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
  push: number,
): ConeRow => {
  return {
    headings: headings.map((degrees) => degrees * RADIANS_PER_DEGREE),
    halfAngle: halfAngle * RADIANS_PER_DEGREE,
    reach,
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
 * Push begins at level one, where the circle had it only at four and five. The
 * evidence is #79's own reading: 42, 51 and 0 field units of total pushback
 * across three runs, which ADR 0036 records as "a line that was never felt".
 *
 * Level 0 throws no cones at all, so the line is silent at the start of a run.
 */
const BELL_CONE_ROWS: readonly ConeRow[] = [
  coneRow([], 0, 0, 0),
  coneRow([0], 45, 160, 6),
  coneRow([-40, 40], 40, 183, 10),
  coneRow([-60, 0, 60], 38, 207, 16),
  coneRow([-108, -36, 36, 108], 36, 231, 26),
  coneRow([-144, -72, 0, 72, 144], 33, 261, 40),
];

// Damage at the grave itself. One shambler exactly, so a maxed bell kills trash outright only where the player is standing.
const BELL_DAMAGE_NEAR = 40;

// Damage at the far edge of a cone. The far edge tickles, which is Mark's 2026-08-19 ruling recorded in ADR 0005: eight tolls out here to take one trash body (#76 pass A).
const BELL_DAMAGE_FAR = 5;

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
 * at the cone's far edge.
 *
 * Damage and push share it deliberately, so the toll's power is concentrated
 * where the player is standing on both channels at once rather than falling off
 * two different ways.
 */
const proximity = (distance: number, full: number): number => {
  if (full <= 0) return 0;
  return Math.max(0, 1 - distance / full);
};

/**
 * Shoves a mob away from the grave, held inside the field widened by
 * SPAWN_MARGIN. Without the clamp a mob near an edge is pushed out of the box
 * the invariant harness checks, by the player's own weapon, and the harness
 * fires on a legal move.
 *
 * The force comes from the toll's own level, the level the reach and the sweep
 * are already working from, so a level-up mid-toll cannot shove harder than the
 * toll that is shoving reaches.
 *
 * A shove that lands returns its mobShoved event, carrying the distance the
 * clamped move really covered rather than the nominal push; a shove refused
 * (no push at this level, a non-finite strength, a mob with no away direction,
 * a clamp that let the mob move nowhere) returns null and reports nothing.
 */
const pushMob = (
  state: RunState,
  toll: BellToll,
  mob: Mob,
  distance: number,
  near: number,
): SimEvent | null => {
  const row = rowFor(toll.level);
  if (row === undefined) return null;
  const push = row.push * near;
  if (!Number.isFinite(push) || push <= 0 || distance === 0) return null;
  const away = normalize(mob.x - state.grave.x, mob.y - state.grave.y);
  if (away.length === 0) return null;
  const fromX = mob.x;
  const fromY = mob.y;
  mob.x = clamp(
    mob.x + away.x * push,
    -SPAWN_MARGIN,
    FIELD_WIDTH + SPAWN_MARGIN,
  );
  mob.y = clamp(
    mob.y + away.y * push,
    -SPAWN_MARGIN,
    FIELD_HEIGHT + SPAWN_MARGIN,
  );
  const movedX = mob.x - fromX;
  const movedY = mob.y - fromY;
  const displacement = Math.sqrt(movedX * movedX + movedY * movedY);
  if (displacement === 0) return null;
  return { type: 'mobShoved', id: mob.id, displacement };
};

const clamp = (value: number, low: number, high: number): number => {
  return Math.min(Math.max(value, low), high);
};

/**
 * Every mob a cone of this toll reached this tick: inside the leading edge,
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
  for (const mob of state.mobs) {
    if (!mob.alive || toll.struck.has(mob.id)) continue;
    const dx = mob.x - state.grave.x;
    const dy = mob.y - state.grave.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > now) continue;
    // A mob standing on the grave has no bearing to test and is inside every
    // cone: the toll leaves from under it.
    const held =
      distance === 0 || insideCone(toll.level, bearingFromGrave(dx, dy));
    if (!held) continue;
    toll.struck.add(mob.id);
    const near = proximity(distance, row.reach);
    const damage =
      BELL_DAMAGE_FAR + (BELL_DAMAGE_NEAR - BELL_DAMAGE_FAR) * near;
    const shoved = pushMob(state, toll, mob, distance, near);
    if (shoved !== null) events.push(shoved);
    events.push(...damageMob(state, mob, damage, 'bell'));
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
 * owned bell's first toll lands within one period of the drop rather than
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
  BELL_PERIOD,
  BELL_EXPAND_TICKS,
  BELL_CONE_ROWS,
  BELL_DAMAGE_NEAR,
  BELL_DAMAGE_FAR,
};
export type { BellToll, ConeRow };
