// Where the player was standing when the ladder stripped, and what was on the field.

import type { SimEvent } from '../../game/events';
import { FIELD_HEIGHT } from '../../game/field';
import type { RunState } from '../../game/run';

/**
 * The circumstances of every strip the floor ladder ran (design record R6, and
 * section 7's bottom-clamp finding).
 *
 * `weaponStripped` carries the lines and no position, and `rungFell` carries
 * the body's own place rather than the grave's, so the grave is read off the
 * run's state at the end of the tick the strip fired on. That is
 * `tuning.gravePath`'s own read point and `refusals.ts` writes out why it is
 * the one a reading may take: the graph's listener runs after the tick's checks
 * and before the next tick clears anything.
 *
 * How often a strip landed against the bottom clamp is what the record's
 * bottom-clamp finding is answered with, and whether a boss was on the field is
 * what parts a strip with nothing left to rebuild from out of a strip in the
 * mow.
 */
interface StripsLanded {
  // The grave's y at each strip, in the order they landed.
  readonly graveY: readonly number[];
  /**
   * The field left under the grave's rim at each strip, in the same order.
   *
   * The rim and never the centre, exactly as `gapUnderGrave` computes it and
   * for that reading's own stated reason: containment holds the centre at
   * FIELD_HEIGHT minus the size, so a centre test measures a band that shrinks
   * as the grave grows and would invert the reading.
   */
  readonly gapUnderGrave: readonly number[];
  // Strips taken with nothing left under the rim, where the rungs fall above the grave.
  readonly atClamp: number;
  // Strips taken with a boss on the field, which is the worst moment for one.
  readonly inBoss: number;
}

interface StripsLandedAcc {
  readonly graveY: number[];
  readonly gapUnderGrave: number[];
  atClamp: number;
  inBoss: number;
  bossLive: boolean;
}

const createStripsLanded = (): StripsLandedAcc => ({
  graveY: [],
  gapUnderGrave: [],
  atClamp: 0,
  inBoss: 0,
  bossLive: false,
});

/**
 * How much field is left under the grave: the gap from its bottom rim to the
 * edge, never from its centre.
 *
 * It is `tuning.gravePath`'s own measurement and it is computed here rather
 * than shared, because the two readings ask it at different moments and a
 * helper passed between them would tie a strip's read point to a series'.
 */
const gapUnderGrave = (state: RunState): number =>
  FIELD_HEIGHT - (state.grave.y + state.grave.size);

/**
 * Whether a boss stands on the field after this tick's events.
 *
 * A fight opens on `bossArrived` and ends on `bossKilled` or on
 * `sectionChanged`, which are the two the stage already ends one with. The
 * events are read in the order the tick emitted them, so a strip and the event
 * that closed the fight on one tick are ordered by the sim rather than here.
 */
const observeBoss = (acc: StripsLandedAcc, event: SimEvent): void => {
  if (event.type === 'bossArrived') acc.bossLive = true;
  if (event.type === 'bossKilled' || event.type === 'sectionChanged') {
    acc.bossLive = false;
  }
};

const observeStripsLanded = (
  acc: StripsLandedAcc,
  events: readonly SimEvent[],
  state: RunState,
): void => {
  for (const event of events) {
    observeBoss(acc, event);
    if (event.type !== 'weaponStripped') continue;
    const gap = gapUnderGrave(state);
    acc.graveY.push(state.grave.y);
    acc.gapUnderGrave.push(gap);
    if (gap <= 0) acc.atClamp += 1;
    if (acc.bossLive) acc.inBoss += 1;
  }
};

const stripsLandedOf = (acc: StripsLandedAcc): StripsLanded => ({
  graveY: [...acc.graveY],
  gapUnderGrave: [...acc.gapUnderGrave],
  atClamp: acc.atClamp,
  inBoss: acc.inBoss,
});

export { createStripsLanded, observeStripsLanded, stripsLandedOf };
export type { StripsLanded, StripsLandedAcc };
