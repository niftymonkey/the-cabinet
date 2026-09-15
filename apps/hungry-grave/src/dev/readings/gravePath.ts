// What the grave itself did across the run: its size, and where it sat.

import { FIELD_HEIGHT } from '../../game/field';
import type { RunState } from '../../game/run';
import { SIZE_CEILING, SIZE_FLOOR } from '../../game/tuning';
import type { NumberRecord } from '../numbersByName';
import { firstOf, greatestOf, lastOf, leastOf, meanOf } from '../seriesSummary';

/**
 * How close to the bottom edge counts as near it, in field units.
 *
 * This is a measurement boundary and nothing else. It is not a healthy band, a
 * target, or a rule the game enforces, and no project source establishes one;
 * it sits here in the instrument row rather than in the sim's tuning for
 * exactly that reason. It is a tenth of the field, which leaves the grave's own
 * starting mark outside it, so the reading counts a player who went looking for
 * the edge rather than one who never left home.
 */
const BOTTOM_EDGE_MARGIN = FIELD_HEIGHT / 10;

/**
 * How much field is left under the grave: the gap from its bottom rim to the
 * edge, never from its centre.
 *
 * The rim is what the player sees touch the edge, and it is also the only
 * size-independent reading of the two. Containment holds the centre at
 * FIELD_HEIGHT minus the size, so a centre test measures a band that shrinks as
 * the grave grows, and the count would fall exactly when the grave is largest.
 * That would invert the reading: camping would look rarer the better the run
 * went.
 */
const gapUnderGrave = (state: RunState): number =>
  FIELD_HEIGHT - (state.grave.y + state.grave.size);

interface GravePath {
  /**
   * Index N is the grave's size after N ticks, matching the mob population's
   * indexing. Index 0 is the size the run's header resolved to, so a
   * conditioned run reports its real first sample.
   */
  readonly sizePerTick: readonly number[];
  // Ticks the grave's bottom rim spent within the margin of the edge.
  readonly ticksNearBottomEdge: number;
  // The margin the count above was taken with, so the reading says what it measured.
  readonly bottomEdgeMargin: number;
  /**
   * How many times the size series crossed down to SIZE_FLOOR, and how many of
   * those the run climbed back above it from.
   *
   * The two are the spiral-versus-comeback split: a visit on its own says only
   * that the run reached the floor, and what followed it is the reading. A run
   * that visited and never recovered ended at the floor, which the run's own
   * ending says beside this.
   *
   * A visit is a crossing and never a state, so a run that begins at the floor
   * has visited nothing until it climbs out and falls back.
   */
  readonly floorVisits: number;
  readonly floorRecoveries: number;
  /**
   * The first tick the size reached SIZE_CEILING, which is how long the run
   * took to grow all the way.
   *
   * Null on a run that never reached it, on the same terms the module's other
   * absent figures keep: a run that never got there has no tick to name, and a
   * zero would read as a run that started there.
   */
  readonly ticksToCeiling: number | null;
}

interface GravePathAcc {
  readonly sizePerTick: number[];
  ticksNearBottomEdge: number;
  atFloor: boolean;
  floorVisits: number;
  floorRecoveries: number;
  ticksToCeiling: number | null;
  // Samples taken, which is the tick each one belongs to: index N is after N
  // ticks, so the count before a push is that sample's own tick.
  ticks: number;
}

const atSizeFloor = (size: number): boolean => size <= SIZE_FLOOR;

const atSizeCeiling = (size: number): boolean => size >= SIZE_CEILING;

const createGravePath = (startingSize: number): GravePathAcc => ({
  sizePerTick: [startingSize],
  ticksNearBottomEdge: 0,
  atFloor: atSizeFloor(startingSize),
  floorVisits: 0,
  floorRecoveries: 0,
  ticksToCeiling: atSizeCeiling(startingSize) ? 0 : null,
  ticks: 0,
});

// The crossing this sample made, if it made one: down to the floor, or back above it.
const observeFloor = (acc: GravePathAcc, size: number): void => {
  const nowAtFloor = atSizeFloor(size);
  if (nowAtFloor === acc.atFloor) return;
  if (nowAtFloor) acc.floorVisits += 1;
  else acc.floorRecoveries += 1;
  acc.atFloor = nowAtFloor;
};

// The first tick the size stood at the ceiling, and never a later one.
const observeCeiling = (acc: GravePathAcc, size: number): void => {
  if (acc.ticksToCeiling !== null) return;
  if (atSizeCeiling(size)) acc.ticksToCeiling = acc.ticks;
};

const observeGravePath = (acc: GravePathAcc, state: RunState): void => {
  acc.ticks += 1;
  acc.sizePerTick.push(state.grave.size);
  observeFloor(acc, state.grave.size);
  observeCeiling(acc, state.grave.size);
  if (gapUnderGrave(state) <= BOTTOM_EDGE_MARGIN) {
    acc.ticksNearBottomEdge += 1;
  }
};

const gravePathOf = (acc: GravePathAcc): GravePath => ({
  sizePerTick: [...acc.sizePerTick],
  ticksNearBottomEdge: acc.ticksNearBottomEdge,
  bottomEdgeMargin: BOTTOM_EDGE_MARGIN,
  floorVisits: acc.floorVisits,
  floorRecoveries: acc.floorRecoveries,
  ticksToCeiling: acc.ticksToCeiling,
});

/**
 * The grave's size across the run: where it started, where it ended, and the
 * band between. There is no sum, because sizes added across ticks have no unit.
 *
 * The summary is this reading's own, declared here beside the series it
 * summarises, so comparing the grave's path is one decision in one place rather
 * than a shape the comparer recognised.
 */
const sizeSummary = (series: readonly number[]): NumberRecord => ({
  first: firstOf(series),
  last: lastOf(series),
  min: leastOf(series),
  max: greatestOf(series),
  mean: meanOf(series),
});

export {
  createGravePath,
  observeGravePath,
  gravePathOf,
  sizeSummary,
  BOTTOM_EDGE_MARGIN,
};
export type { GravePath, GravePathAcc };
