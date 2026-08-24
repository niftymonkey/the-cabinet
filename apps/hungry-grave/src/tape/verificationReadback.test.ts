/**
 * VERIFICATION READBACK, AND NOT REPLAY (ADR 0020).
 *
 * These tests prove that a newly recorded tape decodes and deterministically
 * reproduces. They prove nothing about the replay feature, which is 6b's, and
 * no replay story or acceptance criterion is satisfied by any of them passing.
 *
 * Authored from ADR 0019's refusal rule and #48's testing decisions: a tape
 * whose witness fails at checkpoint N reports N and stops there, a tape with an
 * older witness version says so rather than reporting a divergence, the
 * observations sit outside the witness, and one tape read back twice gives one
 * run.
 */

import { describe, expect, it } from "vitest";

import { TICK_HZ } from "../game/clock";
import { createExecution, executeTick } from "../game/execution";
import { MAX_LEVEL } from "../game/lines/roster";
import type { WeaponLine } from "../game/lines/roster";
import type { RunState, TickCommand } from "../game/run";
import { createRun, uniformLevels } from "../game/run";
import { WITNESS_VERSION } from "../game/witness";
import { decodeTape } from "./decode";
import { encodeTape } from "./encode";
import { recordFrame, recordInto, sealTrailer, tapeOf } from "./recorder";
import type { Tape, TapeHeader } from "./tape";
import { readBackForVerification } from "./verificationReadback";

const SEED = 20260823;
const SPACING = 20;
const TICKS = 90;

function header(run: RunState): TapeHeader {
  return {
    seed: run.seed,
    startingSize: run.grave.size,
    startingLevels: { ...run.levels },
    tickRate: TICK_HZ,
    checkpointSpacing: SPACING,
    witnessVersion: WITNESS_VERSION,
    commitHash: "f389eb55ff",
    buildIdentity: "",
    author: "unknown",
    inputDevice: "script",
    keyboardSpeed: 1,
    rendererBackend: "webgl",
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
function recordARun(
  ticks = TICKS,
  levels?: Readonly<Record<WeaponLine, number>>,
): Tape {
  const run = createRun(SEED, undefined, levels);
  const execution = createExecution(run);
  const recorder = recordInto(execution, header(run));
  for (let tick = 0; tick < ticks; tick++) {
    executeTick(execution, steer(tick));
    recordFrame(recorder, {
      reason: "live",
      tickIndex: tick,
      ticksExecuted: 1,
      intervalMs: 16.7,
      advanceMs: 0.2,
      updateMs: 0.9,
      debtTicks: 0,
    });
  }
  sealTrailer(recorder, execution, 0);
  return tapeOf(recorder);
}

describe("verification readback", () => {
  it("reproduces the run a tape holds and agrees with every checkpoint", () => {
    const result = readBackForVerification(recordARun());

    expect(result.outcome).toBe("verified");
    expect(result.firstDivergentCheckpoint).toBeNull();
    expect(result.ticksReproduced).toBe(TICKS);
    expect(result.checkpointsVerified).toBe(5);
    expect(result.checkpointsUnreachable).toBe(0);
  });

  it("survives the bytes, so the artifact is what was verified and not the record in memory", () => {
    const { tape, truncated } = decodeTape(encodeTape(recordARun()));

    expect(truncated).toBe(false);
    expect(readBackForVerification(tape).outcome).toBe("verified");
  });

  it("gives the same run twice from one tape", () => {
    // ADR 0015 already records that this is structurally blind to the engine,
    // so it is a regression test and never the cross-device claim.
    const tape = recordARun();

    const first = readBackForVerification(tape);
    const second = readBackForVerification(tape);

    expect(second).toEqual(first);
    expect(second.finalWitness).toBe(first.finalWitness);
  });

  it("names the first checkpoint that disagrees, and stops there", () => {
    // ADR 0019: each checkpoint is an independent snapshot rather than a link
    // in a chain, which is what lets the first failing one be named at all.
    const sound = recordARun();
    const bent = sound.checkpoints.map((checkpoint) =>
      checkpoint.index === 40
        ? { index: 40, witness: checkpoint.witness + 1 }
        : checkpoint,
    );

    const result = readBackForVerification({ ...sound, checkpoints: bent });

    expect(result.outcome).toBe("diverged");
    expect(result.firstDivergentCheckpoint).toBe(40);
    expect(result.checkpointsVerified).toBe(2);
    expect(result.ticksReproduced).toBe(40);
  });

  it("refuses a run whose starting size is not the tape's, before a tick has run", () => {
    // The refusal rule from the reader's side: a tape that cannot prove itself
    // reports nothing rather than reporting wrongly. The starting size is
    // folded, so a header that lies about it is caught at index zero, which is
    // what makes recording the resolved number rather than "pinned or not"
    // worth doing.
    const tape = recordARun();

    const result = readBackForVerification({
      ...tape,
      header: { ...tape.header, startingSize: tape.header.startingSize + 1 },
    });

    expect(result.outcome).toBe("diverged");
    expect(result.firstDivergentCheckpoint).toBe(0);
  });

  it("verifies a run recorded under pinned levels, rebuilt from the header alone", () => {
    // The header records the resolved starting levels for every run (ruled by
    // Mark 2026-08-24) so a ?levels= run's tape verifies instead of diverging
    // at checkpoint zero: the witness folds run.levels, and a readback seeded
    // with the birthright would disagree before a single tick had run.
    const pinned = decodeTape(
      encodeTape(recordARun(TICKS, uniformLevels(MAX_LEVEL))),
    ).tape;

    expect(pinned.header.startingLevels).toEqual(uniformLevels(MAX_LEVEL));
    const result = readBackForVerification(pinned);
    expect(result.outcome).toBe("verified");
    expect(result.ticksReproduced).toBe(TICKS);
  });

  it("refuses a run whose starting levels are not the tape's, before a tick has run", () => {
    // The same refusal as the size above: the levels are folded, so a header
    // that lies about them is caught at index zero.
    const tape = recordARun();

    const result = readBackForVerification({
      ...tape,
      header: {
        ...tape.header,
        startingLevels: { ...tape.header.startingLevels, bell: 5 },
      },
    });

    expect(result.outcome).toBe("diverged");
    expect(result.firstDivergentCheckpoint).toBe(0);
  });

  it("refuses a run whose dice are not the tape's", () => {
    // How long that takes is a property of the stage rather than of the
    // witness, and it is deliberately not pinned to a number here: the seed
    // drives only column placement, drop kind and fire jitter, so two seeds
    // played from the same script were measured identical for their first 840
    // ticks and parted on a revenant's first-shot jitter. A tuning change moves
    // that tick, and this test is about the refusal rather than about the
    // stage's opening.
    const tape = recordARun(1000);

    const result = readBackForVerification({
      ...tape,
      header: { ...tape.header, seed: tape.header.seed + 1 },
    });

    expect(result.outcome).toBe("diverged");
    expect(result.firstDivergentCheckpoint).not.toBeNull();
    expect(result.ticksReproduced).toBeLessThan(1000);
  });

  it("says a tape was recorded against a different fold, and never that it diverged", () => {
    // ADR 0019: the fold demonstrably widens, so without this every tape
    // recorded before a widening would read as a run that did not happen.
    const tape = recordARun();

    const result = readBackForVerification({
      ...tape,
      header: { ...tape.header, witnessVersion: WITNESS_VERSION + 1 },
    });

    expect(result.outcome).toBe("witnessVersionMismatch");
    expect(result.firstDivergentCheckpoint).toBeNull();
    expect(result.ticksReproduced).toBe(0);
    expect(result.tapeWitnessVersion).toBe(WITNESS_VERSION + 1);
    expect(result.readerWitnessVersion).toBe(WITNESS_VERSION);
  });

  it("obeys the tape's own checkpoint spacing rather than a constant in the reader", () => {
    // A tape written at a different spacing verifies here unchanged, which is
    // the property that lets a later measurement move the spacing without
    // invalidating a tape already recorded.
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, {
      ...header(run),
      checkpointSpacing: 7,
    });
    for (let tick = 0; tick < 28; tick++) executeTick(execution, steer(tick));

    const result = readBackForVerification(tapeOf(recorder));

    expect(recorder.checkpoints.map((point) => point.index)).toEqual([
      0, 7, 14, 21, 28,
    ]);
    expect(result.outcome).toBe("verified");
    expect(result.checkpointsVerified).toBe(5);
  });

  it("verifies a cut tape as far as it goes, and says how far that was", () => {
    const whole = recordARun();
    const cut: Tape = {
      ...whole,
      commands: whole.commands.slice(0, 45),
      trailer: null,
    };

    const result = readBackForVerification(cut);

    expect(result.outcome).toBe("verified");
    expect(result.ticksReproduced).toBe(45);
    expect(result.checkpointsVerified).toBe(3);
    expect(result.checkpointsUnreachable).toBe(2);
  });

  it("keeps the observations outside the witness, so a tape verifies whatever they say", () => {
    // ADR 0018: a tape recorded on a phone must not refuse itself when it is
    // read back on a desktop, which is why the wall-clock section sits outside
    // the fold entirely.
    const tape = recordARun();

    const withOtherTimings = readBackForVerification({
      ...tape,
      observations: tape.observations.map((observation) =>
        observation.kind === "frame"
          ? { ...observation, updateMs: 99, intervalMs: 250 }
          : observation,
      ),
    });

    expect(withOtherTimings.outcome).toBe("verified");
    expect(withOtherTimings.finalWitness).toBe(
      readBackForVerification(tape).finalWitness,
    );
  });

  it("reproduces every tick of a tape that carries ticks after its ending", () => {
    // The frame loop stops on run.ending now (#52), but a sealed
    // FORMAT_VERSION 1 tape recorded before that guard can carry ticks after
    // the ending, and a readback obliged to reproduce a tape in full must keep
    // feeding every command it holds. This builds such a tape exactly as an
    // old build did: the authority looped straight past the seal, recorder
    // listening.
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));
    for (let tick = 0; tick < 6000 && run.ending === null; tick++) {
      executeTick(execution, steer(tick));
    }
    expect(run.ending).toBe("sealed");
    const endedAt = run.tick;
    for (let extra = 0; extra < 30; extra++) {
      executeTick(execution, steer(endedAt + extra));
    }
    const tape = tapeOf(recorder);
    expect(tape.commands.length).toBe(endedAt + 30);

    const result = readBackForVerification(tape);
    expect(result.outcome).toBe("verified");
    expect(result.ticksReproduced).toBe(tape.commands.length);
    expect(result.checkpointsUnreachable).toBe(0);
  });

  it("reports the tape's own faults without rewriting them, and today's checks separately", () => {
    // ADR 0017: recorded faults are the original run's history. Invariant
    // definitions and severity policy both change, so a readback must never
    // merge what the tape says with what the checks say now.
    const tape = recordARun();
    const carrying: Tape = {
      ...tape,
      observations: [
        ...tape.observations,
        {
          kind: "fault",
          identity: "reservoir in range",
          severity: "recoverable",
          firstTick: 12,
          detail: "reservoir is 1.4",
          count: 3,
        },
      ],
    };

    const result = readBackForVerification(carrying);

    expect(result.recordedFaults).toEqual([
      {
        kind: "fault",
        identity: "reservoir in range",
        severity: "recoverable",
        firstTick: 12,
        detail: "reservoir is 1.4",
        count: 3,
      },
    ]);
    expect(result.readbackFaults).toEqual([]);
  });
});
