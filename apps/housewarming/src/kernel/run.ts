// The playthrough: one house, its nights, and the warmth running through them.
//
// A run is a plain value and every function here returns a new one, so a caller can hold
// history, replay from a seed, or hand a state to the solver without any of it reaching
// back into the kernel.

import { mulberry32 } from './rng.ts';
import {
  consistentNames,
  firstSighting,
  settledAxes,
  type Observation,
} from './deduction.ts';
import { rollSpirits } from './generator.ts';
import { resolveNight } from './resolver.ts';
import {
  drainPerLooseSpirit,
  poolsAtStage,
  type Economy,
  type Ruleset,
} from './rules.ts';
import type {
  Experiment,
  Morning,
  NameSubmission,
  Pools,
  Spirit,
  TraitId,
  TrueName,
} from './types.ts';

// `keeping` is play. `won` is every spirit named. `lost` is the warmth gone, which is
// how the last keeper died. `left` is the keeper taking the exit while it was still open.
export type RunStatus = 'keeping' | 'won' | 'lost' | 'left';

export interface Run {
  readonly seed: number;
  // The night about to be played, counting from 1.
  readonly night: number;
  readonly stage: number;
  readonly warmth: number;
  readonly spirits: readonly Spirit[];
  // Trace ids, in the order the names fell.
  readonly named: readonly TraitId[];
  // Every watched room of every night played, oldest first. The keeper's evidence lives
  // here rather than in the interface, so a save restores the book along with the house
  // and the solver reads the same history the keeper does.
  readonly seen: readonly Observation[];
  readonly status: RunStatus;
}

export interface NightResult {
  readonly run: Run;
  readonly morning: Morning;
}

export interface NamingResult {
  readonly run: Run;
  readonly held: boolean;
}

export function startRun(rules: Ruleset, seed: number): Run {
  return {
    seed,
    night: 1,
    stage: 0,
    warmth: rules.economy.startingWarmth,
    spirits: rollSpirits(rules.generation, mulberry32(seed)),
    named: [],
    seen: [],
    status: 'keeping',
  };
}

// The names the mornings still allow for one spirit. This is what the book draws and
// what the solver reads; it is derived from the run rather than stored in it, so there
// is only ever one account of what the keeper knows.
//
// It narrows against the pools that were open when the spirit arrived, not the wider
// ones the keeper can see now, so a page that has been solved stays solved when the house
// opens. A room sealed until tonight cannot hold the thing that has been knocking since
// the first week, and the fiction carries that without a word of explanation.
export function namesStillOpen(
  rules: Ruleset,
  run: Run,
  trace: TraitId,
): TrueName[] {
  const spirit = run.spirits.find((candidate) => candidate.trace === trace);
  if (!spirit) throw new Error(`no spirit in this house leaves ${trace}`);
  return consistentNames(
    poolsAtStage(rules.generation, spirit.stage),
    trace,
    run.seen,
  );
}

export function poolsOf(rules: Ruleset, run: Run): Pools {
  return poolsAtStage(rules.generation, run.stage);
}

// Spirits the house has let in so far. The roster's size is known from the first night
// even though its members are not.
export function arrived(run: Run): Spirit[] {
  return run.spirits.filter((spirit) => spirit.stage <= run.stage);
}

export function loose(run: Run): Spirit[] {
  return arrived(run).filter((spirit) => !run.named.includes(spirit.trace));
}

export function namedSpirits(run: Run): Spirit[] {
  return run.spirits.filter((spirit) => run.named.includes(spirit.trace));
}

// Spirits whose trace the keeper has actually seen. A spirit can have arrived without
// having been met, if its room has not been watched since, and the book has no page for
// something nobody has seen.
export function sighted(run: Run): Spirit[] {
  return arrived(run).filter(
    (spirit) => firstSighting(spirit.trace, run.seen) !== null,
  );
}

// What one loose spirit takes tonight. The anti-spiral rule lives here: every trait the
// evidence has ruled in comes off the drain, so a keeper who is behind but learning is
// always paying less than they were, and there is no unrecoverable spiral.
export function drainFor(rules: Ruleset, run: Run, spirit: Spirit): number {
  const base = drainPerLooseSpirit(rules.economy, run.night);
  const settled = settledAxes(namesStillOpen(rules, run, spirit.trace));
  return Math.max(0, base - settled * rules.economy.drainReliefPerSettledTrait);
}

export function drainTonight(rules: Ruleset, run: Run): number {
  return loose(run).reduce(
    (total, spirit) => total + drainFor(rules, run, spirit),
    0,
  );
}

export function experimentCost(
  economy: Economy,
  experiment: Experiment,
): number {
  return (
    experiment.candle * economy.candlePerWatch +
    economy.lure +
    (experiment.ward === null ? 0 : economy.ward)
  );
}

export function nightCost(
  economy: Economy,
  experiments: readonly Experiment[],
): number {
  return experiments.reduce(
    (total, experiment) => total + experimentCost(economy, experiment),
    0,
  );
}

export function playNight(
  rules: Ruleset,
  run: Run,
  experiments: readonly Experiment[],
): NightResult {
  assertPlayable(run);

  const cost = nightCost(rules.economy, experiments);
  if (cost > run.warmth) {
    throw new Error(
      `this night costs ${cost} warmth and the house holds ${run.warmth}`,
    );
  }

  const pools = poolsOf(rules, run);
  const morning = resolveNight(pools, loose(run), experiments, run.night);

  const warmth =
    run.warmth -
    cost -
    drainTonight(rules, run) +
    rules.economy.yieldPerNamedSpirit * run.named.length;

  const seen = [
    ...run.seen,
    ...experiments.flatMap((experiment, index) => {
      const scene = morning.scenes[index];
      return scene ? [{ night: run.night, experiment, scene }] : [];
    }),
  ];

  return {
    morning,
    run: settle({ ...run, warmth, seen, night: run.night + 1 }),
  };
}

// A name is submitted whole or not at all, and a wrong one costs warmth, because the
// morning-signals playtest showed free attempts invite brute force on the last trait.
export function submitName(
  rules: Ruleset,
  run: Run,
  submission: NameSubmission,
): NamingResult {
  assertPlayable(run);

  const spirit = loose(run).find(
    (candidate) => candidate.trace === submission.trace,
  );
  if (!spirit) {
    throw new Error(`no loose spirit leaves ${submission.trace}`);
  }

  const held =
    spirit.name.hour === submission.name.hour &&
    spirit.name.lure === submission.name.lure &&
    spirit.name.aversion === submission.name.aversion &&
    spirit.name.haunt === submission.name.haunt;

  if (!held) {
    const warmth = run.warmth - rules.economy.wrongName;
    return { held, run: settle({ ...run, warmth }) };
  }

  const named = [...run.named, spirit.trace];
  return {
    held,
    run: settle({ ...run, named, stage: stageFor(rules, named.length) }),
  };
}

// The house opens as names fall, never on a date.
function stageFor(rules: Ruleset, named: number): number {
  const stages = rules.generation.stages;
  let stage = 0;
  while (stage + 1 < stages.length) {
    const next = stages[stage + 1];
    if (!next || named < next.opensAfterNamed) break;
    stage += 1;
  }
  return stage;
}

// The exit appears as the house cools and is gone once it is too cold to pack and go.
export function leaveOffered(rules: Ruleset, run: Run): boolean {
  return (
    run.status === 'keeping' &&
    run.warmth <= rules.economy.leaveOfferedAt &&
    run.warmth > rules.economy.leaveWithdrawnAt
  );
}

export function takeLeave(rules: Ruleset, run: Run): Run {
  if (!leaveOffered(rules, run)) {
    throw new Error('leaving is not on the table');
  }
  return { ...run, status: 'left' };
}

function settle(run: Run): Run {
  if (run.warmth <= 0) return { ...run, warmth: 0, status: 'lost' };
  if (run.named.length === run.spirits.length) return { ...run, status: 'won' };
  return run;
}

function assertPlayable(run: Run): void {
  if (run.status !== 'keeping') {
    throw new Error(`this run is over: ${run.status}`);
  }
}
