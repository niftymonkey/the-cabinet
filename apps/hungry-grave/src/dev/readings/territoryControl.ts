// What Territory's open ground did to the traffic that crossed it: every
// crossing's dwell, how it ended, and the observed pace of the pulses.

import type { SimEvent } from '../../game/events';
import { holdingPatch } from '../../game/lines/territory';
import type { MobType } from '../../game/mobs';
import type { RunState } from '../../game/run';
import type { NumberRecord } from '../numbersByName';
import { greatestOf, leastOf, meanOf } from '../seriesSummary';

// How a crossing ended, kept apart so dwell over ground that killed is never
// averaged with dwell over ground that was walked out of.
type CrossingEnd = 'death' | 'escape' | 'closed';

/**
 * One finished crossing: one mob's continuous stay over open claimed ground.
 *
 * The rung is the holding patch's own birth rung and never the run's level at
 * the time, because a patch controls at the strength it was born with (#79).
 * The type rides along because every band the ladder claims is per-type.
 */
interface Crossing {
  readonly mob: MobType;
  readonly rung: number;
  readonly end: CrossingEnd;
  // Ticks the mob was observed held, over the crossing's whole stay.
  readonly dwell: number;
}

// One end's dwell figures. Absent rather than zero where no crossing ended
// this way: there is no stay to have taken no time (seriesSummary's own rule).
interface EndSummary {
  readonly count: number;
  readonly dwellMean?: number;
  readonly dwellMin?: number;
  readonly dwellMax?: number;
}

/**
 * The control reading: did the ground hold what crossed it, and for how long.
 *
 * A crossing is one mob's continuous stay over open ground (opening beat
 * elapsed), keyed by mob id. Attribution is the seam's: a mob over overlapping
 * ground belongs to the first holding patch in slot order, and the tag is
 * captured when the crossing starts. A mob handed between overlapping patches
 * keeps its one crossing and its original tag, because its stay over open
 * ground is continuous.
 *
 * The ends are counted apart: death joins on the mobKilled id; escape is the
 * mob leaving the ground, or the field, alive (a mob gone with no kill event
 * left, on the engagements reading's own precedent); closed is the ground
 * going away under a mob still standing on it. A crossing still live when the
 * run stops is counted apart and kept out of every dwell figure, on the patch
 * reading's no-closing precedent.
 *
 * Pulse intervals are the observed pace of the grind: ticks between successive
 * territory-sourced damage events on one mob id, whatever ground dealt them.
 */
interface TerritoryControl {
  readonly crossings: readonly Crossing[];
  readonly dwellByEnd: Readonly<Record<CrossingEnd, EndSummary>>;
  readonly unfinishedAtStop: number;
  readonly pulseIntervals: readonly number[];
}

// One still-open crossing, keyed by mob id in the accumulator's map.
interface LiveCrossing {
  readonly mob: MobType;
  readonly rung: number;
  // The patch holding the mob on its last observed tick, for the end call.
  lastPatchId: number;
  dwell: number;
}

interface TerritoryControlAcc {
  readonly open: Map<number, LiveCrossing>;
  readonly crossings: Crossing[];
  readonly pulseIntervals: number[];
  readonly lastPulseAt: Map<number, number>;
}

const createTerritoryControl = (): TerritoryControlAcc => ({
  open: new Map(),
  crossings: [],
  pulseIntervals: [],
  lastPulseAt: new Map(),
});

// Ends the mob's crossing, where one is open, with the reason given.
const endCrossing = (
  acc: TerritoryControlAcc,
  id: number,
  end: CrossingEnd,
): void => {
  const live = acc.open.get(id);
  if (live === undefined) return;
  acc.open.delete(id);
  acc.crossings.push({
    mob: live.mob,
    rung: live.rung,
    end,
    dwell: live.dwell,
  });
};

/**
 * Whether the patch that last held a mob is still standing. Ids only ever
 * increase and a recycled slot arrives with a new one, so the id is the
 * identity and never the slot.
 */
const groundStillStands = (state: RunState, patchId: number): boolean => {
  for (const patch of state.patches) {
    if (patch.alive && patch.id === patchId) return true;
  }
  return false;
};

const observeTerritoryControl = (
  acc: TerritoryControlAcc,
  tick: number,
  events: readonly SimEvent[],
  state: RunState,
): void => {
  for (const event of events) {
    if (event.type === 'mobDamaged' && event.source === 'territory') {
      const last = acc.lastPulseAt.get(event.id);
      if (last !== undefined) acc.pulseIntervals.push(tick - last);
      acc.lastPulseAt.set(event.id, tick);
    }
    if (event.type === 'mobKilled') {
      // The pace map dies with the mob: ids never recur, so the entry is done.
      acc.lastPulseAt.delete(event.id);
      endCrossing(acc, event.id, 'death');
    }
  }
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    const patch = holdingPatch(state, mob);
    const live = acc.open.get(mob.id);
    if (patch === null) {
      if (live === undefined) continue;
      const end = groundStillStands(state, live.lastPatchId)
        ? 'escape'
        : 'closed';
      endCrossing(acc, mob.id, end);
      continue;
    }
    if (live === undefined) {
      acc.open.set(mob.id, {
        mob: mob.type,
        rung: patch.level,
        lastPatchId: patch.id,
        dwell: 1,
      });
      continue;
    }
    live.dwell += 1;
    live.lastPatchId = patch.id;
  }
  for (const id of acc.open.keys()) {
    // Gone from the field with no kill event behind it: the cull took a mob
    // the ground was still holding, and it left alive (the engagements
    // reading's own precedent), so its crossing is an escape.
    if (!state.mobs.some((mob) => mob.alive && mob.id === id)) {
      endCrossing(acc, id, 'escape');
    }
  }
};

// One end's dwell figures over the crossings that ended this way.
const endSummary = (
  crossings: readonly Crossing[],
  end: CrossingEnd,
): EndSummary => {
  const dwells = crossings
    .filter((crossing) => crossing.end === end)
    .map((crossing) => crossing.dwell);
  return {
    count: dwells.length,
    dwellMean: meanOf(dwells),
    dwellMin: leastOf(dwells),
    dwellMax: greatestOf(dwells),
  };
};

const territoryControlOf = (acc: TerritoryControlAcc): TerritoryControl => ({
  crossings: [...acc.crossings],
  dwellByEnd: {
    death: endSummary(acc.crossings, 'death'),
    escape: endSummary(acc.crossings, 'escape'),
    closed: endSummary(acc.crossings, 'closed'),
  },
  unfinishedAtStop: acc.open.size,
  pulseIntervals: [...acc.pulseIntervals],
});

// An end's figures as names to numbers, since an interface carries no index signature.
const endNumbers = (end: EndSummary): NumberRecord => ({
  count: end.count,
  dwellMean: end.dwellMean,
  dwellMin: end.dwellMin,
  dwellMax: end.dwellMax,
});

/**
 * The pacing distribution's own summary, declared beside the intervals it
 * reduces, so comparing the pace is one decision in one place. The figures are
 * absent for a run with no second pulse rather than zero, seriesSummary's own
 * rule.
 */
const pacingSummary = (intervals: readonly number[]): NumberRecord => ({
  count: intervals.length,
  mean: meanOf(intervals),
  min: leastOf(intervals),
  max: greatestOf(intervals),
});

export {
  createTerritoryControl,
  observeTerritoryControl,
  territoryControlOf,
  endNumbers,
  pacingSummary,
};
export type {
  TerritoryControl,
  TerritoryControlAcc,
  Crossing,
  CrossingEnd,
  EndSummary,
};
