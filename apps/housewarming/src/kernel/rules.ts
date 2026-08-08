// Every rule the kernel obeys, as data it is handed rather than logic it contains
// (Housewarming ADR 0001). Swapping this object swaps the house; no other file changes.

import {
  AVERSIONS_AT_FIRST,
  HOURS,
  LURES_AT_FIRST,
  LURES_WHEN_THE_LARDER_OPENS,
  ROOMS_AT_FIRST,
  ROOMS_WHEN_THE_HOUSE_OPENS,
  TRACES,
} from './pools.ts';
import type { Pools, TraitValue } from './types.ts';

// One state of the house. Stage 0 is the house as the keeper inherits it; every stage
// after it is an opening, triggered by naming rather than by a date.
export interface HouseStage {
  // How many spirits must be named for this stage to open. 0 for the first stage.
  readonly opensAfterNamed: number;
  // What this opening widens. The first stage's `adds` is the whole starting pool.
  readonly adds: Partial<Pools>;
  // How many of the roster arrive with this stage. Spirits arrive staggered, and the
  // roster's total size is visible to the keeper from the first night.
  readonly arrivals: number;
}

export interface GenerationRules {
  readonly traces: readonly TraitValue[];
  readonly stages: readonly HouseStage[];
}

// Warmth worsens as autumn turns into winter. A step applies from its night onward.
export interface DrainStep {
  readonly fromNight: number;
  readonly perLooseSpirit: number;
}

// Every number here is a stand-in, invented for pressure in the morning-signals
// playtest and owed to the warmth economy ticket #15. They are here so that ticket has
// dials to turn and so the kernel can be played against; none of them is a decision.
export interface Economy {
  readonly startingWarmth: number;
  readonly candlePerWatch: number;
  readonly lure: number;
  readonly ward: number;
  readonly yieldPerNamedSpirit: number;
  readonly wrongName: number;
  readonly drain: readonly DrainStep[];
  // The anti-spiral rule: every trait the evidence has ruled in takes this much off the
  // spirit's drain, so falling behind always has a way back and partial knowledge pays
  // immediately rather than only on the night a name completes.
  readonly drainReliefPerSettledTrait: number;
  // Warmth at or below which the Leave action appears, and at or below which it is gone.
  readonly leaveOfferedAt: number;
  readonly leaveWithdrawnAt: number;
}

export interface Ruleset {
  readonly generation: GenerationRules;
  readonly economy: Economy;
}

// The rooms have to outnumber the roster, because no two loose spirits may share a
// haunt and the keeper decides the order names fall in, so the generator cannot know
// which pairs will be loose together and has to keep every haunt distinct. That is why
// the first opening spends itself on rooms.
export const GENERATION: GenerationRules = {
  traces: TRACES,
  stages: [
    {
      opensAfterNamed: 0,
      adds: {
        hour: HOURS,
        lure: LURES_AT_FIRST,
        aversion: AVERSIONS_AT_FIRST,
        haunt: ROOMS_AT_FIRST,
      },
      arrivals: 3,
    },
    {
      opensAfterNamed: 2,
      adds: { haunt: ROOMS_WHEN_THE_HOUSE_OPENS },
      arrivals: 2,
    },
    {
      opensAfterNamed: 4,
      adds: { lure: LURES_WHEN_THE_LARDER_OPENS },
      arrivals: 1,
    },
  ],
};

// The prices come from the morning-signals playtest. The starting warmth does not: it
// was measured here, because the playtest's number left every house in a forty-seed sweep
// unplayable, the warmth gone by the third night with nothing named. 400 is the smallest
// round figure at which a keeper with no strategy beyond not paying to watch rooms they
// have already solved finishes all forty, in 15 to 29 nights. It is a floor for the worst
// play rather than a decision, and #15 prices it properly against the solver.
export const ECONOMY: Economy = {
  startingWarmth: 400,
  candlePerWatch: 1,
  lure: 1,
  ward: 2,
  yieldPerNamedSpirit: 3,
  wrongName: 3,
  // Higher than the playtest's flat 2, because the relief below has to have somewhere to
  // bite: a fully unknown spirit costs 4 a night and each trait ruled in takes one off it.
  drain: [
    { fromNight: 1, perLooseSpirit: 4 },
    { fromNight: 15, perLooseSpirit: 6 },
    { fromNight: 25, perLooseSpirit: 8 },
  ],
  drainReliefPerSettledTrait: 1,
  leaveOfferedAt: 8,
  leaveWithdrawnAt: 3,
};

export const THE_HOUSE: Ruleset = { generation: GENERATION, economy: ECONOMY };

export function rosterSize(rules: GenerationRules): number {
  return rules.stages.reduce((total, stage) => total + stage.arrivals, 0);
}

// The pools in force once `stage` has opened: every earlier stage's additions plus its own.
export function poolsAtStage(rules: GenerationRules, stage: number): Pools {
  if (!Number.isInteger(stage) || stage < 0 || stage >= rules.stages.length) {
    throw new Error(`no stage ${stage} in this house`);
  }
  const pools: Pools = { hour: [], lure: [], aversion: [], haunt: [] };
  return rules.stages.slice(0, stage + 1).reduce(
    (open, current) => ({
      hour: [...open.hour, ...(current.adds.hour ?? [])],
      lure: [...open.lure, ...(current.adds.lure ?? [])],
      aversion: [...open.aversion, ...(current.adds.aversion ?? [])],
      haunt: [...open.haunt, ...(current.adds.haunt ?? [])],
    }),
    pools,
  );
}

export function drainPerLooseSpirit(economy: Economy, night: number): number {
  const step = [...economy.drain]
    .reverse()
    .find((candidate) => night >= candidate.fromNight);
  if (!step) {
    throw new Error(`the drain schedule does not cover night ${night}`);
  }
  return step.perLooseSpirit;
}
