// Rolling a house. The whole roster is rolled up front from one seed, so a playthrough
// replays exactly and the solver can be handed the same house twice.
//
// Two invariants the night contract rests on, both enforced here rather than checked
// later: a trace kind belongs to exactly one spirit, and no two spirits share a haunt.
// The second is stronger than the contract's "no two loose spirits share a haunt at the
// same time", and it has to be: the keeper chooses the order names fall in, so any two
// spirits in the roster can be loose together and the generator cannot know which.
//
// A spirit's traits come from the pools in force at the stage it arrives with, which is
// what keeps a house opening from widening a puzzle already in progress.

import { pick, pickDistinct, type Rng } from './rng.ts';
import { poolsAtStage, rosterSize, type GenerationRules } from './rules.ts';
import type { Spirit, TraitId, TraitValue } from './types.ts';

export function rollSpirits(rules: GenerationRules, rng: Rng): Spirit[] {
  assertRosterFits(rules);

  const spirits: Spirit[] = [];
  const takenHaunts = new Set<TraitId>();
  const takenTraces = new Set<TraitId>();

  rules.stages.forEach((stage, index) => {
    const pools = poolsAtStage(rules, index);
    const rooms = untaken(pools.haunt, takenHaunts);
    const traces = untaken(rules.traces, takenTraces);

    const haunts = pickDistinct(rooms, stage.arrivals, rng);
    const marks = pickDistinct(traces, stage.arrivals, rng);

    haunts.forEach((haunt, arrival) => {
      const trace = marks[arrival];
      if (!trace) throw new Error(`stage ${index} rolled too few traces`);
      takenHaunts.add(haunt.id);
      takenTraces.add(trace.id);
      spirits.push({
        trace: trace.id,
        stage: index,
        name: {
          hour: pick(pools.hour, rng).id,
          lure: pick(pools.lure, rng).id,
          aversion: pick(pools.aversion, rng).id,
          haunt: haunt.id,
        },
      });
    });
  });

  return spirits;
}

// Rules that cannot produce a legal roster are a mistake in the data, and the place to
// find out is the moment the house is rolled rather than the night the last spirit fails
// to arrive.
export function assertRosterFits(rules: GenerationRules): void {
  const roster = rosterSize(rules);
  if (roster > rules.traces.length) {
    throw new Error(
      `${roster} spirits need ${roster} distinct traces and the pool holds ${rules.traces.length}`,
    );
  }
  let arrivedSoFar = 0;
  rules.stages.forEach((stage, index) => {
    arrivedSoFar += stage.arrivals;
    const rooms = poolsAtStage(rules, index).haunt.length;
    if (arrivedSoFar > rooms) {
      throw new Error(
        `stage ${index} has ${arrivedSoFar} spirits arrived and only ${rooms} rooms open, and no two spirits may share a haunt`,
      );
    }
  });
}

function untaken<T extends TraitValue>(
  values: readonly T[],
  taken: ReadonlySet<TraitId>,
): T[] {
  return values.filter((value) => !taken.has(value.id));
}
