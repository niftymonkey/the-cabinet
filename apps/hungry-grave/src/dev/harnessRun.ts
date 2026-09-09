// One harness run, played under one configuration and sealed to bytes (ADR 0017, ADR 0053).

import { TICK_HZ } from '../game/clock';
import { createExecution } from '../game/execution';
import { FIELD_HEIGHT } from '../game/field';
import {
  GHOUL_DESCENT_FLOOR,
  MOB_TYPES,
  MOB_TYPE_NAMES,
  SPAWN_MARGIN,
} from '../game/mobs';
import type { RunEnding, RunState } from '../game/run';
import { createRun } from '../game/run';
import { PHASES } from '../game/stage/stage';
import { SCROLL_SPEED } from '../game/tuning';
import { WITNESS_VERSION } from '../game/witness';
import { encodeTape } from '../tape/encode';
import {
  RECORDER_CHECKPOINT_SPACING,
  recordInto,
  sealTrailer,
  tapeOf,
} from '../tape/recorder';
import type { TapeHeader } from '../tape/tape';
import { runPolicy } from './bot';
import type { Configuration, ConfigurationName } from './configurations';
import { harnessPolicy } from './harnessPolicy';

/**
 * How much longer than the authored rows a run may play, because a phase
 * boundary is a fight and a fight is not authored: it is the boss's health
 * against whatever the hand puts on it.
 *
 * An initial data row that step 4's tuning pass (#39) moves. It is a budget
 * above the worst case and never a prediction of any run, on the reasoning
 * bot.test.ts already writes out beside its own maxed budget: a maxed dodger
 * crosses the whole stage in 22000 to 48000 ticks where the rows alone bound
 * 27000, and the spread is the fight.
 */
const RUN_TICK_SLACK = 3;

/**
 * The longest a body can take to leave the field, in ticks: the whole distance
 * one can cross at the slowest total descent any type holds, which is the
 * scroll plus its own speed.
 */
const SLOWEST_DESCENT_TICKS =
  (FIELD_HEIGHT +
    SPAWN_MARGIN +
    Math.max(...MOB_TYPE_NAMES.map((type) => MOB_TYPES[type].halfHeight))) /
  (SCROLL_SPEED +
    Math.min(
      MOB_TYPES.shambler.speed,
      MOB_TYPES.revenant.speed,
      GHOUL_DESCENT_FLOOR,
    ));

/** How long one phase can hold a run: its own rows, then whatever they left falling. */
const phaseBudget = (phase: (typeof PHASES)[number]): number => {
  const lastRow = phase.rows[phase.rows.length - 1];
  return (
    (lastRow === undefined ? 0 : lastRow.t) * TICK_HZ + SLOWEST_DESCENT_TICKS
  );
};

/**
 * How long one harness run may play, derived from the stage's own rows rather
 * than written down, so re-authoring a phase moves it.
 *
 * It is a budget and never a length. A phase ends on its own condition
 * (ADR 0051), so a hand that clears the stragglers meets the boss sooner and
 * no two runs are the same length; what can be written down is the ceiling.
 */
const runTickBudget = (): number =>
  Math.ceil(PHASES.reduce((total, each) => total + phaseBudget(each), 0)) *
  RUN_TICK_SLACK;

// One harness run, played and sealed, as the bytes a tape file holds.
interface HarnessRun {
  readonly seed: number;
  readonly configuration: ConfigurationName;
  readonly bytes: Uint8Array;
  readonly ticks: number;
  readonly ending: RunEnding | null;
}

/**
 * The harness rig's header: the birthright start, the hand that steered, and
 * the two facts only the shell can answer.
 *
 * It is the second copy of a headless header literal in the tree beside
 * record-conditioned.ts's, which the rule of three allows; a third copy is the
 * trigger to extract one.
 *
 * The commit hash and the recorded-at stamp are arguments because asking git
 * and asking the clock are the shell's jobs, and src/dev may import no package.
 * A Date.now() here would also make one seed's bytes differ on every call,
 * which is a determinism the harness rests on rather than a convenience.
 */
const harnessHeader = (
  run: RunState,
  configuration: Configuration,
  commitHash: string,
  recordedAt: number,
): TapeHeader => {
  return {
    seed: run.seed,
    startingSize: run.grave.size,
    recordedRoster: [...run.roster],
    startingLevels: { ...run.levels },
    tickRate: TICK_HZ,
    checkpointSpacing: RECORDER_CHECKPOINT_SPACING,
    witnessVersion: WITNESS_VERSION,
    commitHash,
    buildIdentity: '',
    author: 'unknown',
    inputDevice: 'bot',
    policy: configuration.name,
    keyboardSpeed: 1,
    rendererBackend: 'headless',
    rendererResolution: 0,
    devicePixelRatio: 0,
    recordedAt,
  };
};

/**
 * Plays one seed under one configuration through the one execution authority
 * and seals it (ADR 0017), returning the bytes a tape file holds and never
 * writing them: the filesystem is the shell's.
 *
 * The rig is the harness rig, the only one that starts at the birthright,
 * which is what #98 asks the hand to play out of.
 */
const playHarnessRun = (
  configuration: Configuration,
  seed: number,
  commitHash: string,
  recordedAt: number,
): HarnessRun => {
  const run = createRun(seed);
  const execution = createExecution(run);
  const recorder = recordInto(
    execution,
    harnessHeader(run, configuration, commitHash, recordedAt),
  );
  // The hand's own stream is made off the run's seed, so one seed under one
  // configuration is one run and the hand's dice stay outside RunState.
  const { ticks } = runPolicy(
    execution,
    harnessPolicy(configuration, run.seed),
    runTickBudget(),
  );
  sealTrailer(recorder, execution, 0);
  return {
    seed,
    configuration: configuration.name,
    bytes: encodeTape(tapeOf(recorder)),
    ticks,
    ending: run.ending,
  };
};

export { playHarnessRun, runTickBudget, RUN_TICK_SLACK };
export type { HarnessRun };
