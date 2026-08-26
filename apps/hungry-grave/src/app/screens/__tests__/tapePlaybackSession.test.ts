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
import { createTapePlaybackSession } from '../tapePlaybackSession';

/** The recorded debt the trailer carries, asserted against the debt readout. */
const RECORDED_DEBT = 5;

/** A header the recorder can write without a browser behind it. */
function headerFor(run: RunState): TapeHeader {
  return {
    seed: run.seed,
    startingSize: run.grave.size,
    startingLevels: { ...run.levels },
    tickRate: 60,
    checkpointSpacing: RECORDER_CHECKPOINT_SPACING,
    witnessVersion: WITNESS_VERSION,
    commitHash: 'test',
    buildIdentity: '',
    author: 'test',
    inputDevice: 'script',
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
});
