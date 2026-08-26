/**
 * One run's life on the screen: the state the URL asked for, the one authority
 * its ticks cross, and the clock that spends a frame of real time. No display
 * tree.
 */

import { advance } from '../../../game/advance';
import type { Clock } from '../../../game/clock';
import { createClock } from '../../../game/clock';
import type { CommandSource } from '../../../game/command';
import type { Execution, FaultRecord } from '../../../game/execution';
import { createExecution, devBrokenHandler } from '../../../game/execution';
import type { SimEvent } from '../../../game/events';
import type { WeaponLine } from '../../../game/lines/roster';
import type { RunState } from '../../../game/run';
import {
  createRun,
  isBirthrightLevels,
  uniformLevels,
} from '../../../game/run';
import { levelsFromUrl, seedFromUrl, sizeFromUrl } from '../../seedFromUrl';

/**
 * What the run was born with, read once when it starts (ADR 0012, ADR 0020).
 *
 * Every pin is the resolved value and never the parameter (Mark's ruling): what
 * the run actually opened with, read before any tick can level it up, so an
 * unusable pin the parser refused has nothing to show.
 */
interface RunIdentity {
  readonly seed: number;
  // Whether the URL named the seed, which is the only thing that makes it a pin.
  readonly seedPinned: boolean;
  // The size the run opened at when the URL pinned it, and null on an ordinary run.
  readonly pinnedSize: number | null;
  // The start levels when they differ from the birthright, and null when they do not.
  readonly pinnedLevels: Readonly<Record<WeaponLine, number>> | null;
}

/** What the run's readout is written from, as the run goes. */
interface RunReadout {
  readonly debtTicks: number;
  readonly tick: number;
  // The authority's own de-duplicated record, never a second tally (ADR 0017).
  readonly faults: readonly FaultRecord[];
}

/** A run just begun: the state, the authority its ticks cross, and what it was born with. */
interface StartedRun {
  readonly run: RunState;
  readonly execution: Execution;
  readonly identity: RunIdentity;
}

/** What one frame's ticks cost and what they announced. */
interface FrameAdvance {
  /**
   * Milliseconds spent inside advance, measured here because the ticker cannot
   * give it: elapsedMS is the gap between one frame and the last, so it says a
   * frame was late and never what made it late. Advance is where the simulation
   * and its invariant checks both sit, which is the part a checks-on and a
   * checks-off reading are differenced on.
   */
  readonly advanceMs: number;
  readonly events: readonly SimEvent[];
}

/** One run, begun, advanced a frame at a time, and read off as it goes. */
interface RunSession {
  readonly run: RunState | null;
  readonly execution: Execution | null;
  readonly clock: Clock;
  readonly readout: RunReadout;
  // Starts the run the URL asks for and hands it to the screen around it.
  begin(): StartedRun;
  // One frame's elapsed time, already spent by the frame policy, turned into whole ticks.
  advanceFrame(elapsedMs: number, source: CommandSource): FrameAdvance;
  end(): void;
}

/**
 * One session's own state. It is the module's private machine and never leaves
 * it; a caller only ever sees the RunSession above.
 */
interface Session {
  run: RunState | null;
  /**
   * The one authority every tick of this run crosses (ADR 0017).
   *
   * Its lifetime is the run's, so it is made in begin() beside the run and
   * cleared in end() beside it. The screen driving this is pooled, and a pooled
   * screen leaks anything nobody explicitly clears; carried across runs, its
   * stage watch would compare run two's first phase against run one's last and
   * its fault history would belong to a run that is over.
   */
  execution: Execution | null;
  clock: Clock;
}

// No faults at all, shared rather than allocated on every frame that reads the readout.
const NO_FAULTS: readonly FaultRecord[] = [];

/**
 * The run the URL asks for (ADR 0012). undefined and not null for the seed,
 * because createRun's default parameter is what rolls the fresh dice.
 *
 * The size goes in rather than being written afterwards: ADR 0003's floor and
 * ceiling are grave.ts's to hold, and hitGrave is then the only thing outside
 * it that changes size at all. The levels go in the same door, so the run is
 * born with them and the tape's header records what it was born with.
 */
const begin = (session: Session): StartedRun => {
  const search = window.location.search;
  const hash = window.location.hash;
  const seed = seedFromUrl(search, hash);
  const size = sizeFromUrl(search, hash);
  // The loadout pin (ADR 0020): a testing control, never player-facing, and
  // it belongs behind the instrumentation build's gate.
  const levels = levelsFromUrl(search, hash);
  const run = createRun(
    seed ?? undefined,
    size ?? undefined,
    levels === null ? undefined : uniformLevels(levels),
  );
  const execution = startExecution(run);
  session.run = run;
  session.execution = execution;
  session.clock = createClock();
  return {
    run,
    execution,
    identity: {
      seed: run.seed,
      seedPinned: seed !== null,
      pinnedSize: size === null ? null : run.grave.size,
      // Gated on differing from the birthright rather than on the parameter's
      // presence, which is what keeps ordinary runs untouched.
      pinnedLevels: isBirthrightLevels(run.levels) ? null : run.levels,
    },
  };
};

/**
 * The authority this run's ticks cross (ADR 0017), made here because its
 * lifetime is the run's.
 *
 * The broken-invariant handler is a notification and never the decider: the
 * authority sets the stop reason, and only the build decides how loud a fault
 * is. import.meta.env.DEV is a stand-in for that choice until the two deployed
 * build flavours exist, and it is what keeps the handler's debugger statement
 * out of a built bundle.
 */
const startExecution = (run: RunState): Execution => {
  return createExecution(run, {
    onBroken: import.meta.env.DEV ? devBrokenHandler : undefined,
  });
};

/**
 * One frame of real time, spent as whole ticks (ADR 0015).
 *
 * The keyboard is sampled once per frame because it is a true velocity. The
 * drag is recomputed inside the source closure on every tick because it is a
 * position error, and applying one twice doubles the travel.
 */
const advanceFrame = (
  session: Session,
  elapsedMs: number,
  source: CommandSource,
): FrameAdvance => {
  const execution = session.execution;
  if (execution === null) return { advanceMs: 0, events: [] };
  const startedAdvance = performance.now();
  const events = advance(execution, session.clock, elapsedMs, source);
  return { advanceMs: performance.now() - startedAdvance, events };
};

const end = (session: Session): void => {
  session.run = null;
  session.execution = null;
};

const createRunSession = (): RunSession => {
  const session: Session = {
    run: null,
    execution: null,
    clock: createClock(),
  };
  return {
    get run() {
      return session.run;
    },
    get execution() {
      return session.execution;
    },
    get clock() {
      return session.clock;
    },
    get readout() {
      return {
        debtTicks: session.clock.debtTicks,
        tick: session.run?.tick ?? 0,
        faults: session.execution?.faults ?? NO_FAULTS,
      };
    },
    begin: () => begin(session),
    advanceFrame: (elapsedMs, source) =>
      advanceFrame(session, elapsedMs, source),
    end: () => end(session),
  };
};

export { createRunSession };
export type { FrameAdvance, RunIdentity, RunReadout, RunSession, StartedRun };
