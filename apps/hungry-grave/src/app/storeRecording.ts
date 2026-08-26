/**
 * The spool that feeds one run's recording into the tape store as the run
 * plays (#58). It tracks cursors into the recorder's arrays and, at each
 * checkpoint boundary, queues the new segments; the store's failure posture
 * means nothing here can ever reach back into the run.
 */

import type { TapeRecorder } from '../tape/recorder';
import {
  bodySegment,
  headerSegment,
  observationsSegment,
  trailerSegment,
  witnessSegment,
} from '../tape/segments';
import type { FrameObservation, Observation } from '../tape/tape';
import type { RunSummaryValues, TapePart, TapeStore } from './tapeStore';

interface StoreRecording {
  /** Queues whatever a new checkpoint boundary makes appendable. Called outside the frame's timed window. */
  flush(): void;
  /** Appends everything up to the stop and then the trailer part. Called once, at the seal. */
  seal(): void;
  /** Flushes what is pending and detaches; every later call is a no-op. */
  detach(): void;
}

/** The summary row as the recorder can state it right now, header and trailer both its own. */
const summaryOf = (recorder: TapeRecorder): RunSummaryValues => ({
  seed: recorder.header.seed,
  recordedAt: recorder.header.recordedAt,
  inputDevice: recorder.header.inputDevice,
  ending: recorder.trailer === null ? null : recorder.trailer.ending,
  stop: recorder.trailer === null ? 'unknown' : recorder.trailer.stop,
  integrity: recorder.trailer === null ? null : recorder.trailer.integrity,
  debtTicks: recorder.trailer === null ? null : recorder.trailer.debtTicks,
});

const isFrame = (observation: Observation): observation is FrameObservation =>
  observation.kind === 'frame';

/**
 * crypto.randomUUID exists only in secure contexts, and a LAN-IP dev serve is
 * not one; the store is a convenience channel and never a dependency, so the
 * id falls back rather than letting prepare() throw. getRandomValues has no
 * secure-context requirement.
 */
const freshRunId = (): string =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('');

const recordRunToStore = (
  store: Promise<TapeStore | null>,
  recorder: TapeRecorder,
  runId: string = freshRunId(),
): StoreRecording => {
  let commandsQueued = 0;
  let checkpointsQueued = 0;
  let observationsSeen = 0;
  let sealed = false;
  let detached = false;
  /**
   * Frame rows collected but not yet appended. Fault rows never wait here:
   * their counts climb in place on the recorder, and an appended segment
   * cannot be rewritten, so they ride the seal where the counts are final.
   */
  const pendingFrames: FrameObservation[] = [];

  /**
   * Fire and forget on purpose. The open resolves once and a settled promise
   * runs its callbacks in queue order, so parts land in the order they were
   * queued; append itself swallows every store fault, so nothing here can
   * ever surface into the frame that queued it.
   */
  const queue = (part: TapePart): void => {
    void store.then((opened) => opened?.append(runId, part));
  };

  const collectNewFrames = (): void => {
    for (
      ;
      observationsSeen < recorder.observations.length;
      observationsSeen++
    ) {
      const observation = recorder.observations[observationsSeen];
      if (isFrame(observation)) pendingFrames.push(observation);
    }
  };

  /**
   * Witness and body up to the last stamped checkpoint, in the same
   * interleaved order encodeTape writes: each checkpoint, then the ticks that
   * follow it. Commands past the last checkpoint stay here until the next
   * boundary or the seal, which is what "kept up to its last checkpoint"
   * means for a tab that closes.
   */
  const queueCheckpointedSegments = (): void => {
    while (checkpointsQueued < recorder.checkpoints.length) {
      const checkpoint = recorder.checkpoints[checkpointsQueued];
      if (checkpoint.index > commandsQueued) {
        queue({
          kind: 'chunk',
          bytes: bodySegment(
            commandsQueued,
            recorder.commands.slice(commandsQueued, checkpoint.index),
          ),
        });
        commandsQueued = checkpoint.index;
      }
      queue({ kind: 'chunk', bytes: witnessSegment([checkpoint]) });
      checkpointsQueued += 1;
    }
  };

  const queuePendingFrames = (): void => {
    if (pendingFrames.length === 0) return;
    queue({ kind: 'chunk', bytes: observationsSegment(pendingFrames) });
    pendingFrames.length = 0;
  };

  const flush = (): void => {
    if (detached) return;
    collectNewFrames();
    // The append cadence rides the checkpoint spacing, one knob for two jobs,
    // knowingly: no boundary passed means nothing is written this frame.
    if (checkpointsQueued >= recorder.checkpoints.length) return;
    queueCheckpointedSegments();
    queuePendingFrames();
  };

  const seal = (): void => {
    if (detached || sealed || recorder.trailer === null) return;
    sealed = true;
    collectNewFrames();
    queueCheckpointedSegments();
    if (recorder.commands.length > commandsQueued) {
      queue({
        kind: 'chunk',
        bytes: bodySegment(
          commandsQueued,
          recorder.commands.slice(commandsQueued),
        ),
      });
      commandsQueued = recorder.commands.length;
    }
    const faults = recorder.observations.filter(
      (observation) => !isFrame(observation),
    );
    const atSeal = [...pendingFrames, ...faults];
    pendingFrames.length = 0;
    if (atSeal.length > 0) {
      queue({ kind: 'chunk', bytes: observationsSegment(atSeal) });
    }
    queue({
      kind: 'trailer',
      bytes: trailerSegment(recorder.trailer),
      summary: summaryOf(recorder),
    });
  };

  const detach = (): void => {
    if (detached) return;
    collectNewFrames();
    // Unsealed, this is the abandoned-run shape and keeps to the last
    // checkpoint; sealed, the pending rows are the run's own end-state frames,
    // which arrive behind the trailer part by design and the store's load
    // orders the trailer last.
    queueCheckpointedSegments();
    queuePendingFrames();
    detached = true;
  };

  queue({
    kind: 'header',
    bytes: headerSegment(recorder.header),
    summary: summaryOf(recorder),
  });

  return { flush, seal, detach };
};

export { recordRunToStore };
export type { StoreRecording };
