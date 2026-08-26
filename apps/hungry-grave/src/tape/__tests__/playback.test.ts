/**
 * The playback primitive (#58): one canonical loop drives a tape through the
 * execution authority, stepwise or to the end, and verification readback is a
 * thin adapter over it.
 */

import { describe, expect, it } from 'vitest';

import { TICK_HZ } from '../../game/clock';
import { createExecution, executeTick } from '../../game/execution';
import type { SimEvent } from '../../game/events';
import type { TickCommand } from '../../game/command';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import { WITNESS_VERSION } from '../../game/witness';
import { createPlayback, playTape } from '../playback';
import { recordInto, sealTrailer, tapeOf } from '../recorder';
import type { Tape, TapeHeader } from '../tape';
import { readBackForVerification } from '../verificationReadback';

const SEED = 20260823;
const SPACING = 20;
const TICKS = 200;

function header(run: RunState): TapeHeader {
  return {
    seed: run.seed,
    startingSize: run.grave.size,
    startingLevels: { ...run.levels },
    tickRate: TICK_HZ,
    checkpointSpacing: SPACING,
    witnessVersion: WITNESS_VERSION,
    commitHash: 'de7fd05087',
    buildIdentity: '',
    author: 'unknown',
    inputDevice: 'script',
    keyboardSpeed: 1,
    rendererBackend: 'webgl',
    rendererResolution: 2,
    devicePixelRatio: 2,
    recordedAt: 1_766_000_000_000,
  };
}

/** A steering script with a shape, so a body of zeroes cannot pass by accident. */
function steer(tick: number): TickCommand {
  return {
    move: { x: (tick % 7) / 6 - 0.5, y: (tick % 5) / 4 - 0.5 },
    belch: false,
  };
}

/** One recorded run, played through the one execution authority the game plays through. */
function recordARun(commandAt: (tick: number) => TickCommand = steer): Tape {
  const run = createRun(SEED);
  const execution = createExecution(run);
  const recorder = recordInto(execution, header(run));
  for (let tick = 0; tick < TICKS; tick++) {
    executeTick(execution, commandAt(tick));
  }
  sealTrailer(recorder, execution, 0);
  return tapeOf(recorder);
}

describe('the playback', () => {
  it('reproduces the run a tape holds tick for tick, the observer seeing every command', () => {
    const tape = recordARun();
    const seen: { tick: number; command: TickCommand }[] = [];

    const result = playTape(tape, (tick, command) => {
      seen.push({ tick, command });
    });

    expect(result.outcome).toBe('verified');
    expect(result.ticksReproduced).toBe(TICKS);
    expect(seen.map((entry) => entry.tick)).toEqual(
      tape.commands.map((_, index) => index + 1),
    );
    expect(seen.map((entry) => entry.command)).toEqual([...tape.commands]);
  });

  it('hands the observer the events each tick produced, mob damage among them', () => {
    // The reference is the authority itself, fed the tape's own commands with
    // no playback in the path. mobDamaged is pinned present so the comparison
    // cannot pass on a run where nothing was hit (#58 slice 0).
    const tape = recordARun();
    const reference = createRun(SEED);
    const referenceExecution = createExecution(reference);
    const expected = tape.commands.map((command) => [
      ...executeTick(referenceExecution, command),
    ]);
    expect(expected.flat().some((event) => event.type === 'mobDamaged')).toBe(
      true,
    );

    const seen: SimEvent[][] = [];
    playTape(tape, (_tick, _command, events) => {
      seen.push([...events]);
    });

    expect(seen).toEqual(expected);
  });

  it('reproduces a tape carrying a fatal fault to its end and reports the fault', () => {
    // ADR 0024 and #58 ruling 5: a fault today's checks raise never stops the
    // loop. The invariant authority sets the stop reason, but a playback
    // reproduces every command a tape holds; truncating at the fault would
    // hide the ticks that carried it. The NaN command poisons the grave from
    // tick 50 on, exactly as an old build could have recorded it.
    const faulted = recordARun((tick) =>
      tick === 50
        ? { move: { x: Number.NaN, y: 0 }, belch: false }
        : steer(tick),
    );
    expect(faulted.trailer?.integrity).toBe('faulted');

    const result = playTape(faulted);

    expect(result.outcome).toBe('verified');
    expect(result.ticksReproduced).toBe(TICKS);
    expect(result.checkpointsUnreachable).toBe(0);
    expect(result.readbackFaults).toContainEqual(
      expect.objectContaining({ identity: 'no NaN', severity: 'fatal' }),
    );
  });

  it('stops at the first checkpoint that disagrees, and names it', () => {
    // ADR 0019: nothing after the first disagreeing checkpoint is the recorded
    // run, so reproduction ends there rather than carrying on.
    const sound = recordARun();
    const bent = sound.checkpoints.map((checkpoint) =>
      checkpoint.index === 40
        ? { index: 40, witness: checkpoint.witness + 1 }
        : checkpoint,
    );
    let lastTickSeen = 0;

    const result = playTape({ ...sound, checkpoints: bent }, (tick) => {
      lastTickSeen = tick;
    });

    expect(result.outcome).toBe('diverged');
    expect(result.firstDivergentCheckpoint).toBe(40);
    expect(result.checkpointsVerified).toBe(2);
    expect(result.ticksReproduced).toBe(40);
    expect(lastTickSeen).toBe(40);
  });

  it('refuses a tape recorded against a different fold without running a tick', () => {
    // ADR 0019: a mismatch is its own outcome and never a divergence, or every
    // tape recorded before a widening would read as a run that did not happen.
    const tape = recordARun();
    let observed = 0;

    const playback = createPlayback(
      {
        ...tape,
        header: { ...tape.header, witnessVersion: WITNESS_VERSION + 1 },
      },
      () => {
        observed += 1;
      },
    );

    expect(playback.advanceTick()).toBe(false);
    expect(observed).toBe(0);
    const result = playback.result();
    expect(result.outcome).toBe('witnessVersionMismatch');
    expect(result.firstDivergentCheckpoint).toBeNull();
    expect(result.ticksReproduced).toBe(0);
    expect(result.checkpointsVerified).toBe(0);
    expect(result.checkpointsUnreachable).toBe(tape.checkpoints.length);
    expect(result.tapeWitnessVersion).toBe(WITNESS_VERSION + 1);
    expect(result.readerWitnessVersion).toBe(WITNESS_VERSION);
  });

  it('reaches the same verdict stepwise as when driven in one call', () => {
    // The replay screen paces reproduction across frames (#58), and pacing
    // must change nothing: both forms are one loop, so the verdicts match to
    // the last field, the final witness included.
    const tape = recordARun();
    const stepwise = createPlayback(tape);

    let steps = 0;
    while (stepwise.advanceTick()) steps += 1;

    expect(steps).toBe(TICKS);
    expect(stepwise.ticksReproduced).toBe(TICKS);
    expect(stepwise.result()).toEqual(playTape(tape));
  });

  it("answers a verification readback with the playback's verdict in the readback's own shape", () => {
    // ADR 0033 still holds: readback is not replay. It is now a thin adapter
    // over the one loop, and the fatal-fault tape is the case that tells the
    // adapter from a second loop: a loop of its own that read the stop reason
    // would truncate where this one reproduces to the end.
    const tape = recordARun();
    const faulted = recordARun((tick) =>
      tick === 50
        ? { move: { x: Number.NaN, y: 0 }, belch: false }
        : steer(tick),
    );

    expect(readBackForVerification(tape)).toEqual(playTape(tape));
    expect(readBackForVerification(faulted)).toEqual(playTape(faulted));
    expect(readBackForVerification(faulted).ticksReproduced).toBe(TICKS);
  });
});
