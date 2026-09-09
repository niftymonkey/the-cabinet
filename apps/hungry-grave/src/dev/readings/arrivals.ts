// Every body that came onto the field, counted where and as what it arrived.

import type { SimEvent } from '../../game/events';
import { MOB_TYPE_NAMES } from '../../game/mobs';
import type { RunState } from '../../game/run';
import { PHASES } from '../../game/stage/stage';
import { addTo } from '../numbersByName';

/**
 * What arrived over a run: the whole count, the count under each phase, and
 * the count of each type.
 *
 * It is the arrival side of the field, where `mobsAlivePerTick` is the
 * survivor side. A schedule authors a rate and a count per spawn (#39's mow
 * ruling, and the spawn tables in `docs/research/survivor-numbers.md`), and a
 * count of what was still alive at a tick answers neither: a hand that kills
 * fast and one that never arrives read the same there.
 *
 * A phase the run never entered carries no count rather than a zero, because
 * nothing arrived nowhere. Every type is named, zero included, because a type
 * the schedule never sent is a fact about the schedule.
 */
interface Arrivals {
  readonly total: number;
  readonly byPhase: Readonly<Record<string, number>>;
  readonly byType: Readonly<Record<string, number>>;
}

interface ArrivalsAcc {
  readonly byPhase: Record<string, number>;
  readonly byType: Record<string, number>;
  /**
   * The largest mob id counted so far. Entity ids only ever increase
   * (`mobs.ts` takes each from the run's own counter), so an id above this
   * mark is a body this reading has not seen and an id at or below it is one
   * it has.
   */
  highestId: number;
  total: number;
}

const createArrivals = (): ArrivalsAcc => {
  const byType: Record<string, number> = {};
  for (const type of MOB_TYPE_NAMES) byType[type] = 0;
  return { byPhase: {}, byType, highestId: 0, total: 0 };
};

// One body that came onto the field, as the two things this reading files it under.
interface Arrival {
  readonly id: number;
  readonly type: string;
}

/**
 * Every body on the field this tick, and every body a death took this tick.
 *
 * Both halves are needed and neither is enough. The tick order spawns before
 * it resolves deaths and culls (`step.ts`), so a body can arrive and be gone
 * from the pool before this reading looks; the death event carries the id,
 * which is what makes that arrival recoverable. A body that arrives and leaves
 * the field in one tick is not a case: a spawn places bodies above the top
 * edge or at the pour point, and the cull takes them at the bottom.
 */
const bodiesSeen = (
  events: readonly SimEvent[],
  state: RunState,
): Arrival[] => {
  const seen: Arrival[] = [];
  for (const mob of state.mobs) {
    if (mob.alive) seen.push({ id: mob.id, type: mob.type });
  }
  for (const event of events) {
    if (event.type === 'mobKilled')
      seen.push({ id: event.id, type: event.mob });
  }
  return seen;
};

/**
 * The phase the run is in as this tick ends, which is what the arrivals in it
 * are filed under.
 *
 * A body that arrived in the same tick its phase gave way is filed under the
 * phase that took over, because the tick's own crossing and its spawns are not
 * separable from out here. That is one tick at each of six boundaries, against
 * a schedule authored in seconds.
 */
const phaseNow = (state: RunState): string => {
  const phase = PHASES[state.stage.phaseIndex];
  if (phase === undefined) throw new Error('phaseIndex out of range');
  return phase.name;
};

const observeArrivals = (
  acc: ArrivalsAcc,
  events: readonly SimEvent[],
  state: RunState,
): void => {
  const phase = phaseNow(state);
  let highest = acc.highestId;
  for (const body of bodiesSeen(events, state)) {
    highest = Math.max(highest, body.id);
    if (body.id <= acc.highestId) continue;
    acc.total += 1;
    addTo(acc.byPhase, phase, 1);
    addTo(acc.byType, body.type, 1);
  }
  acc.highestId = highest;
};

const arrivalsOf = (acc: ArrivalsAcc): Arrivals => ({
  total: acc.total,
  byPhase: { ...acc.byPhase },
  byType: { ...acc.byType },
});

export { arrivalsOf, createArrivals, observeArrivals };
export type { Arrivals, ArrivalsAcc };
