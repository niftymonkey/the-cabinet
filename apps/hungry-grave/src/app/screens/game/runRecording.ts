// This run's tape: the recorder every tick is written into, and the spool feeding it to the browser store.

import type { Execution } from '../../../game/execution';
import type { RunState } from '../../../game/run';
import { encodeTape } from '../../../tape/encode';
import type { TapeRecorder } from '../../../tape/recorder';
import {
  recordFrame,
  recordInto,
  sealTrailer,
  tapeOf,
} from '../../../tape/recorder';
import type { FrameObservation } from '../../../tape/tape';
import type { StoreRecording } from '../../storeRecording';
import { recordRunToStore } from '../../storeRecording';
import type { RunConditions } from '../../tapeHeader';
import { tapeHeaderFor } from '../../tapeHeader';
import type { TapeStore } from '../../tapeStore';
import { openTapeStore } from '../../tapeStore';

interface RunRecording {
  readonly recorder: TapeRecorder | null;
  begin(run: RunState, execution: Execution, conditions: RunConditions): void;
  // One frame's row, then the spool's flush, in that order and only that order.
  recordRow(observation: Omit<FrameObservation, 'kind'>): void;
  // The tape's trailer, written once at the stop.
  seal(execution: Execution, debtTicks: number): void;
  bytes(): Uint8Array | null;
  end(): void;
}

/**
 * One recording's own state. It is the module's private machine and never
 * leaves it; a caller only ever sees the RunRecording above.
 */
interface Recording {
  /**
   * The tape this run is being recorded onto. Its lifetime is the run's, the
   * same as the Execution's: a pooled screen leaks anything nobody explicitly
   * clears, and a recorder held past its run would carry one run's commands
   * into the next.
   */
  recorder: TapeRecorder | null;
  /**
   * The spool feeding this run's recording into the browser store. Its
   * lifetime is the run's, like the recorder's, so end() detaches and nulls it.
   */
  spool: StoreRecording | null;
  /**
   * The store connection, deliberately not per-run: opening IndexedDB is
   * async and once per screen life, and a null resolution is the designed
   * store-unavailable state the spool quietly drops writes into. Not cleared
   * in end() because it holds no run state at all.
   */
  store: Promise<TapeStore | null> | null;
}

const begin = (
  recording: Recording,
  run: RunState,
  execution: Execution,
  conditions: RunConditions,
): void => {
  // Before the first tick, because the header is written before the first
  // tick and checkpoint zero is the state before any tick has run.
  recording.recorder = recordInto(execution, tapeHeaderFor(run, conditions));
  recording.store ??= openTapeStore();
  recording.spool = recordRunToStore(recording.store, recording.recorder);
};

const recordRow = (
  recording: Recording,
  observation: Omit<FrameObservation, 'kind'>,
): void => {
  recordFrame(recording.recorder, observation);
  // After the frame's own row and outside the timed window, so the instrument
  // cannot measure itself: updateMs closed when the row was built.
  recording.spool?.flush();
};

/**
 * Writes the tape's trailer, once, at the stop.
 *
 * A second call is ignored by the recorder rather than overwriting, so the
 * run that ends by play and is then left by the pause menu still says it
 * finished.
 */
const seal = (
  recording: Recording,
  execution: Execution,
  debtTicks: number,
): void => {
  if (recording.recorder === null) return;
  sealTrailer(recording.recorder, execution, debtTicks);
  recording.spool?.seal();
};

/**
 * The run's tape as sealed encoded bytes, made at the stop because nothing
 * else outlives it: end() nulls the recorder when the pooled screen is taken
 * away, and the end screen needs the run's record after that. The frames the
 * run spends on its own end state arrive after this and stay in the recorder
 * only; the trailer is already written, so the bytes are the sealed record of
 * the run up to its stop.
 */
const bytes = (recording: Recording): Uint8Array | null => {
  if (recording.recorder === null) return null;
  return encodeTape(tapeOf(recording.recorder));
};

const end = (recording: Recording): void => {
  // The spool goes before the recorder: its detach flushes what is pending,
  // the post-stop frame rows included, and a detached spool is inert however
  // often end runs.
  recording.spool?.detach();
  recording.spool = null;
  recording.recorder = null;
};

const createRunRecording = (): RunRecording => {
  const recording: Recording = { recorder: null, spool: null, store: null };
  return {
    get recorder() {
      return recording.recorder;
    },
    begin: (run, execution, conditions) =>
      begin(recording, run, execution, conditions),
    recordRow: (observation) => recordRow(recording, observation),
    seal: (execution, debtTicks) => seal(recording, execution, debtTicks),
    bytes: () => bytes(recording),
    end: () => end(recording),
  };
};

export { createRunRecording };
export type { RunRecording };
