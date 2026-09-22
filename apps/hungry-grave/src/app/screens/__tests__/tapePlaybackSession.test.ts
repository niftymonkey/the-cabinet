/**
 * The session's own seam: a tape fetched, verified, fast-forwarded and played
 * with nothing on screen. Nothing here builds a container or a label, and that
 * absence is the assertion.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { TICK_MS } from '../../../game/clock';
import { createExecution, executeTick } from '../../../game/execution';
import { createRun } from '../../../game/run';
import type { RunState } from '../../../game/run';
import { WITNESS_VERSION } from '../../../game/witness';
import { encodeTape } from '../../../tape/encode';
import {
  RECORDER_CHECKPOINT_SPACING,
  recordInto,
  sealTrailer,
  tapeOf,
} from '../../../tape/recorder';
import type { Tape, TapeHeader } from '../../../tape/tape';
import { SCRIPT_POLICY } from '../../../tape/tape';
import { createTapePlaybackSession } from '../tapePlaybackSession';
import { startingConditionBlock } from '../../../tape/startingCondition';

/** The recorded debt the trailer carries, asserted against the debt readout. */
const RECORDED_DEBT = 5;

/** A header the recorder can write without a browser behind it. */
function headerFor(run: RunState): TapeHeader {
  return {
    seed: run.seed,
    startingCondition: startingConditionBlock(run.conditions),
    tickRate: 60,
    checkpointSpacing: RECORDER_CHECKPOINT_SPACING,
    witnessVersion: WITNESS_VERSION,
    commitHash: 'test',
    buildIdentity: '',
    author: 'test',
    inputDevice: 'script',
    policy: SCRIPT_POLICY,
    keyboardSpeed: 1,
    rendererBackend: 'test',
    rendererResolution: 1,
    devicePixelRatio: 1,
    recordedAt: 0,
  };
}

/** A scripted run recorded onto a sealed tape, deterministic and with turns in it. */
function scriptedTape(ticks: number): { tape: Tape; bytes: Uint8Array } {
  const run = createRun(7);
  const execution = createExecution(run);
  const recorder = recordInto(execution, headerFor(run));
  for (let tick = 0; tick < ticks; tick++) {
    executeTick(execution, {
      move: { x: Math.sin(tick * 0.1), y: Math.cos(tick * 0.13) },
      belch: false,
    });
  }
  sealTrailer(recorder, execution, RECORDED_DEBT);
  const tape = tapeOf(recorder);
  return { tape, bytes: encodeTape(tape) };
}

function serveTape(bytes: Uint8Array): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      status: 200,
      arrayBuffer: async () =>
        bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ),
    })),
  );
}

describe('the playback session', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('drives a tape with no display tree', async () => {
    const { tape, bytes } = scriptedTape(360);
    serveTape(bytes);

    const session = createTapePlaybackSession();
    session.begin('blob:tape', 300);
    await vi.waitFor(() => expect(session.phase).not.toBe('fetching'));

    let forgets = 0;
    let drawn = 0;
    for (let each = 0; each < 2000 && session.phase !== 'played'; each++) {
      const frame = session.advance(TICK_MS);
      if (frame.forgetPreviousRun) forgets += 1;
      if (frame.run !== null) drawn += 1;
    }

    expect(session.phase).toBe('played');
    expect(session.bound).toBe(360);
    expect(session.playback!.run.tick).toBe(360);
    expect(session.lines.verified).toBe(
      `VERIFIED 360 OF ${tape.commands.length} TICKS`,
    );
    expect(session.lines.debt).toBe(`ORIGINAL DEBT ${RECORDED_DEBT} TICKS`);
    expect(session.lines.posture).toContain('PLAYED TO TICK 360');
    expect(session.lines.tick).toBe('TICK 360');
    // The renderers' per-run memory is dropped once, where the lead-in begins.
    expect(forgets).toBe(1);
    expect(drawn).toBeGreaterThan(0);
  });

  it("a replay of a run that ended between checkpoints plays to the run's last tick", async () => {
    // ADR 0019: the bound is the last checkpoint that verified, and the seal
    // stamps one at the run's own last tick, so a run that stopped between
    // checkpoints is watched through the ticks that ended it. 370 against the
    // recorder's spacing of 60 leaves 10 ticks past the last periodic one.
    const { tape, bytes } = scriptedTape(370);
    serveTape(bytes);

    const session = createTapePlaybackSession();
    session.begin('blob:tape', 300);
    await vi.waitFor(() => expect(session.phase).not.toBe('fetching'));
    for (let each = 0; each < 2000 && session.phase !== 'played'; each++) {
      session.advance(TICK_MS);
    }

    expect(tape.checkpoints[tape.checkpoints.length - 1]?.index).toBe(370);
    expect(session.bound).toBe(370);
    expect(session.playback!.run.tick).toBe(370);
    expect(session.lines.posture).toContain('PLAYED TO TICK 370');
  });

  it('a tape that does not name a starting condition this build requires is refused by the name of the condition', async () => {
    // Nothing abnormal is ever silent. A tape recorded before a tuning row
    // existed used to fall through to a bound of zero, and the screen read
    // PLAYED TO TICK 0 over a drawn starting field with nothing said, while
    // measure.ts over the same bytes named the missing row.
    const { tape } = scriptedTape(120);
    const missing = 'swallow.tipThreshold';
    const older: Tape = {
      ...tape,
      header: {
        ...tape.header,
        startingCondition: tape.header.startingCondition.filter(
          (row) => row.name !== missing,
        ),
      },
    };
    expect(older.header.startingCondition.length).toBe(
      tape.header.startingCondition.length - 1,
    );
    serveTape(encodeTape(older));

    const session = createTapePlaybackSession();
    session.begin('blob:tape', 0);
    await vi.waitFor(() => expect(session.phase).not.toBe('fetching'));
    session.advance(TICK_MS);

    expect(session.phase).toBe('idle');
    expect(session.lines.posture).toBe('NO REPLAY');
    expect(session.lines.statement).toContain(missing.toUpperCase());
    expect(session.lines.statement).not.toContain('PLAYED TO TICK 0');
  });
});
