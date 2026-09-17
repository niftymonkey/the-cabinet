/**
 * The playback primitive (#58): one canonical loop drives a tape through the
 * execution authority, stepwise or to the end, and verification readback is a
 * thin adapter over it.
 */

import { describe, expect, it } from 'vitest';

import type { WeaponLine } from '../../game/lines/roster';
import { MAX_LEVEL, WEAPON_LINES } from '../../game/lines/roster';

import { TICK_HZ } from '../../game/clock';
import { createExecution, executeTick } from '../../game/execution';
import type { SimEvent } from '../../game/events';
import type { TickCommand } from '../../game/command';
import type { RunState } from '../../game/run';
import { createRun, uniformLevels } from '../../game/run';
import { WITNESS_VERSION } from '../../game/witness';
import { RUNNING_BUILD } from '../buildIdentity';
import { createPlayback, playTape } from '../playback';
import { recordInto, sealTrailer, tapeOf } from '../recorder';
import { startingConditionBlock } from '../startingCondition';
import type { Tape, TapeHeader } from '../tape';
import { SCRIPT_POLICY } from '../tape';
import { readBackForVerification } from '../verificationReadback';
import { SIZE_FLOOR } from '../../game/tuning';
import { DEFAULT_TUNING } from '../../game/tuningRecord';

const SEED = 20260823;
const SPACING = 20;
const TICKS = 200;

function header(run: RunState): TapeHeader {
  return {
    seed: run.seed,
    startingCondition: startingConditionBlock(run.conditions),
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
  };
}

/** The same header with one extra row wedged into its block. */
function withRow(head: TapeHeader, name: string, value: number): TapeHeader {
  return {
    ...head,
    startingCondition: [...head.startingCondition, { name, value }],
  };
}

/** The same header with one row of its block taken out. */
function withoutRow(head: TapeHeader, name: string): TapeHeader {
  return {
    ...head,
    startingCondition: head.startingCondition.filter(
      (entry) => entry.name !== name,
    ),
  };
}

/** The same header with one row of its block written differently. */
function rowWritten(head: TapeHeader, name: string, value: number): TapeHeader {
  return {
    ...head,
    startingCondition: head.startingCondition.map((entry) =>
      entry.name === name ? { name, value } : entry,
    ),
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

/** The condition a ladder run starts from: at the size floor, every line maxed. */
const LADDER_CONDITIONS = {
  startingSize: SIZE_FLOOR,
  startingLevels: uniformLevels(MAX_LEVEL),
};

/** A seed whose storm reaches a full build parked at the size floor. */
const LADDER_SEED = 42;

/**
 * A run that starts at the size floor with a full loadout, so the storm's first
 * hit runs ADR 0003's ladder rather than shrinking anything. The size and the
 * levels both ride in the header, so a replay starts where the recording did.
 */
function recordALadderRun(): Tape {
  // Staged through createRun's own record rather than by writing live state
  // after it: the header records the condition the run resolved (ADR 0063), so
  // a size written over the grave afterwards is a run the tape never describes.
  const run = createRun(LADDER_SEED, LADDER_CONDITIONS);
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

  it('rebuilds every score payment a maxed run made, and verifies at every checkpoint (design record R4)', () => {
    // run.score has been folded into the witness since ADR 0019, so a replay
    // that rebuilt one of the score's five inputs differently diverges at the
    // next checkpoint rather than passing quietly. Nothing here is folded state
    // of its own: no payment put a tally on the run, and witness.test.ts's own
    // completeness assertion is what says the field list did not move.
    const tape = recordALadderRun();
    const reference = createRun(LADDER_SEED, LADDER_CONDITIONS);
    const referenceExecution = createExecution(reference);
    const expected = tape.commands
      .map((command) => [...executeTick(referenceExecution, command)])
      .flat()
      .filter((event) => event.type === 'scorePaid');

    const replayed: SimEvent[] = [];
    const result = playTape(tape, (_tick, _command, events) => {
      for (const event of events) {
        if (event.type === 'scorePaid') replayed.push(event);
      }
    });

    expect(result.outcome).toBe('verified');
    expect(result.checkpointsUnreachable).toBe(0);
    expect(expected.length).toBeGreaterThan(0);
    expect(replayed).toEqual(expected);
  });

  it('rebuilds the run its header describes, every pinned fact of it at once', () => {
    // The starting condition is one record now (ADR 0063), and runFromHeader
    // builds it from the header's own fields. All four the header carries are
    // pinned away from their defaults in one tape, because a rebuild that
    // dropped any one of them would diverge rather than verify: the witness
    // folds the size, the levels and the signal, and the roster decides which
    // lines fire at all.
    const pinned: readonly WeaponLine[] = ['skullStream', 'territory', 'bell'];
    const run = createRun(SEED, {
      startingSize: SIZE_FLOOR,
      startingLevels: { ...uniformLevels(MAX_LEVEL), wisps: 0 },
      roster: pinned,
      signalLock: 0.25,
    });
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));
    for (let tick = 0; tick < TICKS; tick++)
      executeTick(execution, steer(tick));
    sealTrailer(recorder, execution, 0);

    const result = playTape(tapeOf(recorder));

    expect(result.outcome).toBe('verified');
    expect(result.checkpointsVerified).toBeGreaterThan(0);
    expect(result.checkpointsUnreachable).toBe(0);
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
    const reference = createRun(LADDER_SEED, LADDER_CONDITIONS);
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
    const recorded = [...WEAPON_LINES, 'moonlight'];
    let observed = 0;

    const playback = createPlayback(
      { ...tape, header: withRow(tape.header, 'levels.moonlight', 1) },
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
        ...withRow(tape.header, 'levels.moonlight', 1),
        witnessVersion: WITNESS_VERSION + 1,
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

/**
 * The run a tape rebuilds is the one its own header describes, values and all
 * (ADR 0027, ADR 0043, ADR 0063).
 */
describe('a run rebuilt from the header block (#142)', () => {
  it('starts from the block own values and never from this build defaults', () => {
    // Test 2. Every field of the condition, read back off the rebuilt run: a
    // header that carried a name and left the value to the reader would let a
    // later tune of a default silently change what an old tape replays as.
    const conditions = {
      startingSize: SIZE_FLOOR,
      startingLevels: uniformLevels(MAX_LEVEL),
      roster: [...WEAPON_LINES],
      signalLock: 0.25,
      startingScore: 6000,
      tuning: DEFAULT_TUNING,
    };
    const staged = createRun(SEED, conditions);
    const execution = createExecution(staged);
    const recorder = recordInto(execution, header(staged));
    sealTrailer(recorder, execution, 0);

    const playback = createPlayback(tapeOf(recorder));

    expect(playback.run.grave.size).toBe(SIZE_FLOOR);
    expect(playback.run.score).toBe(6000);
    expect(playback.run.director.signal.lock).toBe(0.25);
    expect([...playback.run.roster]).toEqual([...WEAPON_LINES]);
    for (const line of WEAPON_LINES) {
      expect(playback.run.levels[line]).toBe(MAX_LEVEL);
    }
    expect(playback.run.conditions.tuning).toEqual(DEFAULT_TUNING);
  });

  it('runs under the tape own tuning record and not under this build defaults', () => {
    // Test 3. The case that proves the block carries values rather than a name:
    // a tape recorded under a record this build does not compile replays under
    // that record, which is why a candidate can be replayed at all. The purse
    // is read because it is the row the run resolves into a visible figure
    // before a single tick has run.
    const moved = {
      ...DEFAULT_TUNING,
      stage: { ...DEFAULT_TUNING.stage, processionPurse: 12 },
    };
    const run = createRun(SEED, { tuning: moved });
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));
    sealTrailer(recorder, execution, 0);

    const playback = createPlayback(tapeOf(recorder));

    expect(playback.run.conditions.tuning.stage.processionPurse).toBe(12);
    expect(DEFAULT_TUNING.stage.processionPurse).not.toBe(12);
    // It reached the sim and not only the record: the opening section grants
    // its purse before the first tick.
    expect(playback.run.director.purseLeft).toBe(12);
  });
});

/**
 * A starting condition this build cannot start a run from is readable,
 * reportable and not replayable here (ADR 0043, ADR 0019).
 */
describe('a starting condition this build does not implement (#142)', () => {
  /** Whatever the playback concluded, with no tick ever fed in. */
  function refusedResult(head: TapeHeader) {
    const tape = recordARun();
    let observed = 0;
    const playback = createPlayback({ ...tape, header: head }, () => {
      observed += 1;
    });
    expect(playback.advanceTick()).toBe(false);
    expect(observed).toBe(0);
    return playback.result();
  }

  it('names a row this build does not have, rather than diverging at a checkpoint', () => {
    // Tests 4 and 5. The refusal is a named outcome beside the roster's own and
    // never a divergence discovered mid-run: a replay that cannot prove it is
    // the original run reports nothing rather than reporting wrongly
    // (ADR 0019). The header itself is untouched and still reports what the
    // tape said, because reading and replaying are two obligations.
    const tape = recordARun();
    const named = withRow(tape.header, 'weather.fogDensity', 0.5);

    const result = refusedResult(named);

    expect(result.outcome).toBe('conditionNotImplemented');
    expect(result.unimplementedCondition).toContain('weather.fogDensity');
    expect(result.firstDivergentCheckpoint).toBeNull();
    expect(result.ticksReproduced).toBe(0);
    // Readable and reportable: the block comes back as recorded.
    expect(named.startingCondition).toContainEqual({
      name: 'weather.fogDensity',
      value: 0.5,
    });
  });

  it('names a row this build requires and the tape does not carry', () => {
    // Test 6. The other half of the same rule, and the half a reader is most
    // likely to meet: a tape from an older build that never had the row.
    const tape = recordARun();

    const result = refusedResult(
      withoutRow(tape.header, 'score.trashKillScore'),
    );

    expect(result.outcome).toBe('conditionNotImplemented');
    expect(result.unimplementedCondition).toContain('score.trashKillScore');
  });

  it('refuses a quiet interval whose minimum sits above its own maximum', () => {
    // Test 7. The resolver's own bound, reported in the tape's words. It is
    // where it is because a table catches committed rows only: a header
    // replaying under its own values would otherwise reach the director's draw
    // with a negative span.
    const tape = recordARun();

    const result = refusedResult(
      rowWritten(tape.header, 'stage.quietIntervalMinimumSeconds', 30),
    );

    expect(result.outcome).toBe('conditionNotImplemented');
    expect(result.unimplementedCondition).toContain(
      'stage.quietIntervalMinimumSeconds',
    );
    expect(result.unimplementedCondition).toContain(
      'stage.quietIntervalMaximumSeconds',
    );
  });

  it('refuses a lock the signal own scale cannot stand at, which is where that refusal moved to', () => {
    // It was readHeader's before the block existed and it is here now, in the
    // same shape and never dropped quietly: a figure outside the scale would
    // hold the gate where the signal can never stand.
    const tape = recordARun();

    const result = refusedResult(rowWritten(tape.header, 'signalLock', 4));

    expect(result.outcome).toBe('conditionNotImplemented');
    expect(result.unimplementedCondition).toContain('signalLock');
  });

  it('names no unimplemented roster, because the lines are ones this build has', () => {
    // The two refusals stay apart on the way out as well as on the way in: a
    // block naming a row this build does not have still names a roster this
    // build implements, so reporting one here would say the lines cannot be
    // simulated when they can.
    const tape = recordARun();

    const result = refusedResult(withRow(tape.header, 'weather.fogDensity', 1));

    expect(result.outcome).toBe('conditionNotImplemented');
    expect(result.unimplementedRoster).toBeNull();
  });

  it('a verified playback names no unimplemented condition', () => {
    // The field is null on every result that is not this refusal, so nothing
    // downstream can read a reason out of a tape this build did run.
    const result = playTape(recordARun());

    expect(result.outcome).toBe('verified');
    expect(result.unimplementedCondition).toBeNull();
  });
});
