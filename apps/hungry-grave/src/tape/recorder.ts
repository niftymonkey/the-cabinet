/**
 * The tape recorder: what turns one run into a tape as it plays.
 *
 * It attaches to the one execution authority (ADR 0017) rather than to any
 * particular caller, so the rendered game, the bot and the golden scenario all
 * record through the same seam and a recording cannot be bypassed by whichever
 * path happens to reach the simulation.
 *
 * ITS LIFETIME IS THE RUN'S, exactly as the Execution's is. A recorder held
 * past its run would carry the previous run's commands into the next one, and a
 * pooled screen leaks anything nobody explicitly clears.
 *
 * The frame rows arrive from outside instead, because a frame is not a tick:
 * the tick listener fires once per executed tick and can only ever see the
 * simulation, while frame cadence lives above it.
 */

import type { Execution } from "../game/execution";
import type { FaultIdentity } from "../game/invariants";
import type { RunState, TickCommand } from "../game/run";
import { foldWitness } from "../game/witness";
import type {
  FaultObservation,
  FrameObservation,
  Observation,
  Tape,
  TapeCheckpoint,
  TapeHeader,
  TapeIntegrity,
  TapeTrailer,
} from "./tape";

export interface TapeRecorder {
  readonly header: TapeHeader;
  readonly commands: TickCommand[];
  readonly checkpoints: TapeCheckpoint[];
  readonly observations: Observation[];
  /**
   * The fault rows already in observations, by identity.
   *
   * It holds the same objects the section holds rather than copies, so a
   * climbing tally is one write. A linear search of the section instead would
   * be quadratic in the case ADR 0017 calls the normal one, a recoverable fault
   * that fires on every tick of a run with a frame row on every frame.
   */
  readonly faultRows: Map<FaultIdentity, FaultObservation>;
  /** Written once, at the stop. Null until then, which is itself the reading. */
  trailer: TapeTrailer | null;
}

export function createRecorder(header: TapeHeader): TapeRecorder {
  return {
    header,
    commands: [],
    checkpoints: [],
    observations: [],
    faultRows: new Map(),
    trailer: null,
  };
}

/** Whether a tick count lands on one of this tape's checkpoints. */
function isCheckpoint(recorder: TapeRecorder, ticksRun: number): boolean {
  return ticksRun % recorder.header.checkpointSpacing === 0;
}

/**
 * Stamps the witness for a tick count, which is the checkpoint's own index.
 *
 * Checkpoint indexing is defined once and unambiguously: index N is the fold of
 * the state after executeTick has run N times. An off-by-one here would make
 * every tape refuse itself against a reader counting the other way, and it
 * cannot be fixed after tapes exist.
 */
function stampCheckpoint(
  recorder: TapeRecorder,
  ticksRun: number,
  state: RunState,
): void {
  recorder.checkpoints.push({
    index: ticksRun,
    // From zero rather than from the previous checkpoint: each one is an
    // independent snapshot, so a divergence can be named at the first
    // checkpoint that disagrees instead of only somewhere before here.
    witness: foldWitness(state, 0),
  });
}

/**
 * Mirrors the authority's fault history into the observations section.
 *
 * The authority already de-duplicates by identity and keeps the first tick and
 * the count, which is what a persistent fault needs to stay diagnostically
 * useful, so this copies that shape rather than inventing a second one.
 */
function syncFaults(recorder: TapeRecorder, execution: Execution): void {
  if (execution.faults.length === 0) return;
  for (const record of execution.faults) {
    const seen = recorder.faultRows.get(record.identity);
    if (seen !== undefined) {
      seen.count = record.count;
      continue;
    }
    const row: FaultObservation = {
      kind: "fault",
      identity: record.identity,
      severity: record.severity,
      firstTick: record.firstTick,
      detail: record.detail,
      count: record.count,
    };
    recorder.faultRows.set(record.identity, row);
    recorder.observations.push(row);
  }
}

/**
 * Starts recording a run, stamping the checkpoint that precedes its first tick.
 *
 * Checkpoint zero is stamped here rather than on the first tick because it is
 * the state before any tick has run, and that is what "the very first tick is
 * witnessed" has to mean.
 */
export function recordInto(
  execution: Execution,
  header: TapeHeader,
): TapeRecorder {
  const recorder = createRecorder(header);
  stampCheckpoint(recorder, 0, execution.run);
  execution.listeners.push((ticksRun, command, _events, state) => {
    // The command the listener is handed is the quantised one the simulation
    // consumed, never the one a caller offered, which is the whole reason the
    // quantiser lives inside the authority.
    recorder.commands.push(command);
    if (isCheckpoint(recorder, ticksRun)) {
      stampCheckpoint(recorder, ticksRun, state);
    }
    syncFaults(recorder, execution);
  });
  return recorder;
}

/**
 * One rendered frame's row, handed in from the frame seam above the simulation.
 *
 * Rows still arrive after the trailer is written, because the frames a run
 * spends on its own end state are frames of that run. The encoder writes the
 * trailer last whatever order the sections were filled in, so a tape's bytes
 * end with it either way.
 */
export function recordFrame(
  recorder: TapeRecorder | null,
  observation: Omit<FrameObservation, "kind">,
): void {
  if (recorder === null) return;
  recorder.observations.push({ kind: "frame", ...observation });
}

/** Whether the run this authority ran was sound. */
export function integrityOf(execution: Execution): TapeIntegrity {
  return execution.faults.length === 0 ? "clean" : "faulted";
}

/**
 * Writes the trailer, once, at the stop.
 *
 * The stop reason is the authority's when it has one, because only the
 * authority writes "faulted", and otherwise it is read off the run: a run with
 * an ending finished, and a run without one was quit.
 *
 * A second call is ignored rather than overwriting. The stop happens once and a
 * later frame must not be able to rewrite how a run ended.
 */
export function sealTrailer(
  recorder: TapeRecorder,
  execution: Execution,
  debtTicks: number,
): void {
  if (recorder.trailer !== null) return;
  syncFaults(recorder, execution);
  recorder.trailer = {
    ending: execution.run.ending,
    stop:
      execution.stop ?? (execution.run.ending === null ? "quit" : "finished"),
    integrity: integrityOf(execution),
    debtTicks,
  };
}

/** The tape as it stands, which is a complete tape whether or not the run has stopped. */
export function tapeOf(recorder: TapeRecorder): Tape {
  return {
    header: recorder.header,
    commands: recorder.commands,
    checkpoints: recorder.checkpoints,
    observations: recorder.observations,
    trailer: recorder.trailer,
  };
}
