/**
 * The playback primitive (#58): one canonical loop drives a tape through the
 * execution authority, stepwise or to the end, and verification readback is a
 * thin adapter over it.
 */

import { describe, expect, it } from 'vitest';

import { MAX_LEVEL, WEAPON_LINES } from '../../game/lines/roster';

import { TICK_HZ } from '../../game/clock';
import { createExecution, executeTick } from '../../game/execution';
import type { SimEvent } from '../../game/events';
import type { TickCommand } from '../../game/command';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import { WITNESS_VERSION } from '../../game/witness';
import { RUNNING_BUILD } from '../buildIdentity';
import { createPlayback, playTape } from '../playback';
import { recordInto, sealTrailer, tapeOf } from '../recorder';
import type { Tape, TapeHeader } from '../tape';
import { SCRIPT_POLICY } from '../tape';
import { readBackForVerification } from '../verificationReadback';
import { SIGNAL_RAN_LIVE } from '../../game/signalLock';
import { SIZE_FLOOR } from '../../game/tuning';

const SEED = 20260823;
const SPACING = 20;
const TICKS = 200;

function header(run: RunState): TapeHeader {
  return {
    seed: run.seed,
    startingSize: run.grave.size,
    recordedRoster: [...WEAPON_LINES],
    startingLevels: { ...run.levels },
    tickRate: TICK_HZ,
    checkpointSpacing: SPACING,
    witnessVersion: WITNESS_VERSION,
    commitHash: 'de7fd05087',
    buildIdentity: '',
    author: 'unknown',
    inputDevice: 'script',
    policy: SCRIPT_POLICY,
    keyboardSpeed: 1,
    rendererBackend: 'webgl',
    rendererResolution: 2,
    devicePixelRatio: 2,
    recordedAt: 1_766_000_000_000,
    signalLock: SIGNAL_RAN_LIVE,
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

/**
 * The tick count a ladder run needs: the seed below first runs the ladder on
 * tick 501, and the tape has to carry checkpoints on both sides of it.
 */
const LADDER_TICKS = 700;

/** A seed whose storm reaches a full build parked at the size floor. */
const LADDER_SEED = 42;

/**
 * A run that starts at the size floor with a full loadout, so the storm's first
 * hit runs ADR 0003's ladder rather than shrinking anything. The size and the
 * levels both ride in the header, so a replay starts where the recording did.
 */
function recordALadderRun(): Tape {
  const run = createRun(LADDER_SEED);
  run.grave.size = SIZE_FLOOR;
  for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;
  const execution = createExecution(run);
  const recorder = recordInto(execution, header(run));
  for (let tick = 0; tick < LADDER_TICKS; tick++) {
    executeTick(execution, steer(tick));
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

  it('refuses a tape recorded at witness version six, which this step moved off', () => {
    // The cost of the move, stated as a test rather than discovered on a tape.
    // Version 6 is the fold every tape before this commit was recorded under,
    // and the widening it lost is three stream cursors, the director's own
    // state, a body's provenance and the wisps' volley clock. A tape carrying
    // it is refused by its version rather than diverging at a checkpoint, which
    // is ADR 0019's refusal rule doing its job.
    const superseded = 6;
    expect(WITNESS_VERSION).toBeGreaterThan(superseded);

    const tape = recordARun();
    const playback = createPlayback({
      ...tape,
      header: { ...tape.header, witnessVersion: superseded },
    });

    expect(playback.advanceTick()).toBe(false);
    const result = playback.result();
    expect(result.outcome).toBe('witnessVersionMismatch');
    expect(result.firstDivergentCheckpoint).toBeNull();
    expect(result.ticksReproduced).toBe(0);
    expect(result.tapeWitnessVersion).toBe(superseded);
    expect(result.readerWitnessVersion).toBe(WITNESS_VERSION);
  });

  it('refuses a tape recorded at witness version seven, which round two moved off', () => {
    // The same cost paid a second time, and stated the same way. Version 7 is
    // the fold every tape recorded across the whole of step 4 carries, and what
    // it lost is the impulse a shoved body travels under. A tape carrying it is
    // refused by its version rather than diverging at a checkpoint, and the
    // refusal names both numbers so a reader can see which fold it was made in.
    const superseded = 7;
    expect(WITNESS_VERSION).toBeGreaterThan(superseded);

    const tape = recordARun();
    const playback = createPlayback({
      ...tape,
      header: { ...tape.header, witnessVersion: superseded },
    });

    expect(playback.advanceTick()).toBe(false);
    const result = playback.result();
    expect(result.outcome).toBe('witnessVersionMismatch');
    expect(result.firstDivergentCheckpoint).toBeNull();
    expect(result.ticksReproduced).toBe(0);
    expect(result.tapeWitnessVersion).toBe(superseded);
    expect(result.readerWitnessVersion).toBe(WITNESS_VERSION);
  });

  it('refuses a tape recorded at witness version ten, which the score rung moved off', () => {
    // The cost of the move, stated as a test rather than discovered on a tape.
    // Version 10 is the fold every tape recorded across the whole of round two
    // carries, and what it lost is the floor ladder's memory of the score rung
    // it has already spent (design record R4). A tape carrying it is refused by
    // its version rather than diverging at a checkpoint.
    const superseded = 10;
    expect(WITNESS_VERSION).toBeGreaterThan(superseded);

    const tape = recordARun();
    const playback = createPlayback({
      ...tape,
      header: { ...tape.header, witnessVersion: superseded },
    });

    expect(playback.advanceTick()).toBe(false);
    const result = playback.result();
    expect(result.outcome).toBe('witnessVersionMismatch');
    expect(result.firstDivergentCheckpoint).toBeNull();
    expect(result.ticksReproduced).toBe(0);
    expect(result.tapeWitnessVersion).toBe(superseded);
    expect(result.readerWitnessVersion).toBe(WITNESS_VERSION);
  });

  it('rebuilds the bled score rung at every checkpoint (design record R4)', () => {
    // The mark is a rule the next floor hit reads and the run carries it across
    // ticks, so a replay that could not rebuild it would bleed where the
    // recorded run stripped. Both values are asserted to occur in the tape, so
    // the comparison cannot pass on a run where the mark never moved.
    const tape = recordALadderRun();
    const recorded = new Map<number, boolean>();
    const reference = createRun(LADDER_SEED);
    reference.grave.size = SIZE_FLOOR;
    for (const line of WEAPON_LINES) reference.levels[line] = MAX_LEVEL;
    const referenceExecution = createExecution(reference);
    const checkpointTicks = new Set(tape.checkpoints.map((one) => one.index));
    for (const command of tape.commands) {
      executeTick(referenceExecution, command);
      if (checkpointTicks.has(reference.tick)) {
        recorded.set(reference.tick, reference.grave.scoreRungBled);
      }
    }
    const marks = [...recorded.values()];
    expect(marks).toContain(false);
    expect(marks).toContain(true);

    const playback = createPlayback(tape);
    const replayed = new Map<number, boolean>();
    while (playback.advanceTick()) {
      const tick = playback.run.tick;
      if (checkpointTicks.has(tick)) {
        replayed.set(tick, playback.run.grave.scoreRungBled);
      }
    }

    expect(playback.result().outcome).toBe('verified');
    expect(playback.result().checkpointsVerified).toBe(tape.checkpoints.length);
    expect([...replayed.entries()]).toEqual([...recorded.entries()]);
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

describe('a roster this build does not implement (#76, ADR 0043)', () => {
  it('is refused for replay without running a tick, and the refusal names the roster', () => {
    // Reading and replaying are two different obligations. A simulation cannot
    // run a line it does not have, so this refuses precisely, naming what it
    // cannot implement, instead of failing to decode or fabricating a run over
    // a cast that never played.
    const tape = recordARun();
    const recorded = [...tape.header.recordedRoster, 'moonlight'];
    let observed = 0;

    const playback = createPlayback(
      {
        ...tape,
        header: {
          ...tape.header,
          recordedRoster: recorded,
          startingLevels: { ...tape.header.startingLevels, moonlight: 1 },
        },
      },
      () => {
        observed += 1;
      },
    );

    expect(playback.advanceTick()).toBe(false);
    expect(observed).toBe(0);
    const result = playback.result();
    expect(result.outcome).toBe('rosterNotImplemented');
    expect(result.unimplementedRoster).toEqual(recorded);
    expect(result.ticksReproduced).toBe(0);
    expect(result.checkpointsVerified).toBe(0);
  });

  it('is answered before the fold’s own version, so a run never attempted is not called a fold mismatch', () => {
    // The two versions answer different questions and neither may stand in for
    // the other (ADR 0043). A tape that is both unimplementable and folded
    // differently reports the cruder failure, because the fold was never
    // reached.
    const tape = recordARun();
    const result = playTape({
      ...tape,
      header: {
        ...tape.header,
        witnessVersion: WITNESS_VERSION + 1,
        recordedRoster: [...tape.header.recordedRoster, 'moonlight'],
        startingLevels: { ...tape.header.startingLevels, moonlight: 1 },
      },
    });

    expect(result.outcome).toBe('rosterNotImplemented');
  });

  it('a verified playback names no unimplemented roster', () => {
    // The field is null on every result that is not this refusal, so nothing
    // downstream can read a roster name out of a tape this build did run.
    expect(playTape(recordARun()).unimplementedRoster).toBeNull();
  });
});

describe('the build identity on a playback', () => {
  it('carries the tape build identity beside the reader own', () => {
    // #82. The playback reports both and judges neither: a difference is not a
    // refusal, because the witness version is the rules identity (ADR 0019)
    // and replay is a shipped feature (ADR 0020). Every arm carries them, the
    // refusal included, so a reader is never left without the pair.
    const recorded = 'aa038cb310cafe-dirty';
    const sound = recordARun();
    const elsewhere: Tape = {
      ...sound,
      header: { ...sound.header, buildIdentity: recorded },
    };

    const verified = playTape(elsewhere);
    const refused = playTape({
      ...elsewhere,
      header: { ...elsewhere.header, witnessVersion: WITNESS_VERSION + 1 },
    });

    expect(verified.outcome).toBe('verified');
    expect(verified.tapeBuildIdentity).toBe(recorded);
    expect(verified.readerBuildIdentity).toBe(RUNNING_BUILD);
    expect(refused.outcome).toBe('witnessVersionMismatch');
    expect(refused.tapeBuildIdentity).toBe(recorded);
    expect(refused.readerBuildIdentity).toBe(RUNNING_BUILD);
  });
});
