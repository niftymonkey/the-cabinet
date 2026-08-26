/**
 * The replay screen's own seams (#58): the fast-forward equivalence, the
 * last-verified-checkpoint bound, and the plain statements for a tape that
 * cannot be read whole.
 */

import { Container } from 'pixi.js';
import type { Ticker } from 'pixi.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** The real widgets need a renderer: text metrics and a loaded texture. */
vi.mock('../../ui/Label', () => ({
  Label: class extends Container {
    public text = '';
    public anchor = { set: () => {} };
    public style: Record<string, unknown> = {};
  },
}));

vi.mock('../../ui/Button', () => ({
  Button: class extends Container {
    public onPress = { connect: (handler: () => void) => void handler };
  },
}));

import { TICK_MS } from '../../../game/clock';
import { createExecution, executeTick } from '../../../game/execution';
import { createRun } from '../../../game/run';
import type { RunState } from '../../../game/run';
import { foldWitness, WITNESS_VERSION } from '../../../game/witness';
import { encodeTape } from '../../../tape/encode';
import { recordInto, sealTrailer, tapeOf } from '../../../tape/recorder';
import type { Tape, TapeHeader } from '../../../tape/tape';
import { RECORDER_CHECKPOINT_SPACING } from '../../../tape/recorder';
import { LAYER_ORDER } from '../game/layering';
import { REPLAY_LEAD_IN_TICKS } from '../game/transients';
import { ReplayScreen } from '../ReplayScreen';

/** The URL the replay screen reads its tape and tick off. */
const fakeLocation = { search: '', hash: '' };

/** A replay screen holding faked powers, the way navigation hands them in. */
function replayScreen(): ReplayScreen {
  const screen = new ReplayScreen();
  screen.init({ onBack: () => {} });
  return screen;
}

Object.defineProperty(globalThis, 'window', {
  value: { location: fakeLocation },
  configurable: true,
});

function frame(elapsedMS: number): Ticker {
  return { elapsedMS } as Ticker;
}

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

/** The recorded debt the trailer carries, asserted against the debt readout. */
const RECORDED_DEBT = 5;

/**
 * A scripted run recorded onto a sealed tape: deterministic steering with
 * turns in it, long enough for the stage's first rows to live and move.
 */
function scriptedTape(
  ticks: number,
  seed = 7,
): { tape: Tape; bytes: Uint8Array } {
  const run = createRun(seed);
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

/** Waits out the async fetch prepare() starts. */
async function settled(screen: ReplayScreen): Promise<void> {
  await vi.waitFor(() => expect(screen['session'].phase).not.toBe('fetching'));
}

function drive(screen: ReplayScreen, frames: number): void {
  for (let each = 0; each < frames; each++) screen.update(frame(TICK_MS));
}

function driveTo(screen: ReplayScreen, phase: string): void {
  for (let each = 0; each < 1000 && screen['session'].phase !== phase; each++) {
    screen.update(frame(TICK_MS));
  }
  expect(screen['session'].phase).toBe(phase);
}

function tickOf(screen: ReplayScreen): number {
  return screen['session'].playback!.run.tick;
}

/**
 * What is actually visible in every layer's sprite pool. Hidden sprites keep
 * stale positions by design, so only a visible sprite's read is compared.
 */
function visiblePools(screen: ReplayScreen) {
  const layers = screen['layers'];
  return LAYER_ORDER.map((name) =>
    layers.layer(name).children.map((child) =>
      child.visible
        ? {
            x: child.position.x,
            y: child.position.y,
            rotation: child.rotation,
            alpha: child.alpha,
            tint: child.tint,
          }
        : null,
    ),
  );
}

describe('the replay screen', () => {
  beforeEach(() => {
    fakeLocation.search = '';
    fakeLocation.hash = '';
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fast-forward plus the lead-in equals real-time playback at the same tick, in witness fold and renderer-visible pool state', async () => {
    // The seam the lead-in exists for: a headless skip shows no held
    // transient, so the skip stops REPLAY_LEAD_IN_TICKS short, forgets the
    // renderers' per-run memory, and plays the lead-in normally. At the target
    // tick nothing may distinguish the two paths.
    const { bytes } = scriptedTape(360);
    serveTape(bytes);

    fakeLocation.hash = '#/replay?tape=blob%3Atape&at=300';
    const skipped = replayScreen();
    skipped.prepare();
    await settled(skipped);
    driveTo(skipped, 'playing');
    expect(tickOf(skipped)).toBe(300 - REPLAY_LEAD_IN_TICKS);
    drive(skipped, REPLAY_LEAD_IN_TICKS);
    expect(tickOf(skipped)).toBe(300);

    fakeLocation.hash = '#/replay?tape=blob%3Atape&at=0';
    const walked = replayScreen();
    walked.prepare();
    await settled(walked);
    driveTo(walked, 'playing');
    drive(walked, 300);
    expect(tickOf(walked)).toBe(300);

    expect(foldWitness(skipped['session'].playback!.run, 0)).toBe(
      foldWitness(walked['session'].playback!.run, 0),
    );
    expect(visiblePools(skipped)).toEqual(visiblePools(walked));

    skipped.reset();
    walked.reset();
  });

  it('never renders past the last verified checkpoint on a diverged tape, and states the bound', async () => {
    // ADR 0019: the witness is the only fidelity gate, and after a divergence
    // the frames are a different run wearing the player's name. Checkpoints 0,
    // 60 and 120 verify here and 180 does not, so the bound is tick 120.
    const { tape } = scriptedTape(360);
    const tampered: Tape = {
      ...tape,
      checkpoints: tape.checkpoints.map((checkpoint) =>
        checkpoint.index === 180
          ? { ...checkpoint, witness: (checkpoint.witness + 1) | 0 }
          : checkpoint,
      ),
    };
    serveTape(encodeTape(tampered));

    fakeLocation.hash = '#/replay?tape=blob%3Atape&at=9000';
    const screen = replayScreen();
    screen.prepare();
    await settled(screen);
    driveTo(screen, 'played');

    expect(screen['session'].bound).toBe(120);
    expect(tickOf(screen)).toBe(120);
    expect(screen['session'].lines.verified).toContain('VERIFIED 120');
    expect(screen['session'].lines.verified).toContain(
      'DIVERGED AT CHECKPOINT 180',
    );
    expect(screen['session'].lines.posture).toContain('PLAYED TO TICK 120');

    // And holds there: more frames render nothing further.
    drive(screen, 30);
    expect(tickOf(screen)).toBe(120);
    screen.reset();
  });

  it("states the verified length and the trailer's debt up front, before playback starts", async () => {
    const { tape, bytes } = scriptedTape(360);
    serveTape(bytes);
    fakeLocation.hash = '#/replay?tape=blob%3Atape&at=300';
    const screen = replayScreen();
    screen.prepare();
    await settled(screen);
    driveTo(screen, 'fastForwarding');

    expect(screen['session'].lines.verified).toBe(
      `VERIFIED 360 OF ${tape.commands.length} TICKS`,
    );
    expect(screen['session'].lines.debt).toBe(
      `ORIGINAL DEBT ${RECORDED_DEBT} TICKS`,
    );
    screen.reset();
  });

  it('shows a TapeFormatError as its own plain statement, and plays nothing', async () => {
    serveTape(new Uint8Array([9, 9, 9, 9, 9, 9]));
    fakeLocation.hash = '#/replay?tape=blob%3Agarbage';
    const screen = replayScreen();
    screen.prepare();
    await settled(screen);

    expect(screen['session'].phase).toBe('idle');
    expect(screen['session'].lines.statement).toContain('not a tape');
    expect(screen['session'].playback).toBeNull();
    screen.reset();
  });

  it('says a truncated tape is cut short, reads no trailer out of it, and still plays to its last verified checkpoint', async () => {
    const { bytes } = scriptedTape(360);
    serveTape(bytes.slice(0, bytes.length - 3));
    fakeLocation.hash = '#/replay?tape=blob%3Acut';
    const screen = replayScreen();
    screen.prepare();
    await settled(screen);
    driveTo(screen, 'playing');

    expect(screen['session'].lines.statement).toContain('CUT SHORT');
    expect(screen['session'].lines.debt).toContain('NO TRAILER');
    expect(screen['session'].bound).toBe(360);
    screen.reset();
  });

  it("hides the field on a pooled second showing that refuses, so the previous tape's last frame never lingers", async () => {
    // The screen is pooled: reset() empties the layers and dressField()
    // re-attaches the renderers, whose sprite pools still wear the previous
    // tape's frame. Only the first real frame may reveal the field.
    const { tape, bytes } = scriptedTape(360);
    serveTape(bytes);
    fakeLocation.hash = '#/replay?tape=blob%3Atape&at=300';
    const screen = replayScreen();
    screen.prepare();
    await settled(screen);
    driveTo(screen, 'playing');
    expect(screen['field'].visible).toBe(true);

    screen.reset();
    const mismatched: Tape = {
      ...tape,
      header: { ...tape.header, witnessVersion: WITNESS_VERSION + 1 },
    };
    serveTape(encodeTape(mismatched));
    screen.prepare();
    await settled(screen);
    driveTo(screen, 'idle');

    expect(screen['session'].lines.posture).toBe('NO REPLAY');
    expect(screen['field'].visible).toBe(false);
    screen.reset();
  });

  it('states that no tape was named when the URL names none', () => {
    fakeLocation.hash = '#/replay';
    const screen = replayScreen();
    screen.prepare();

    expect(screen['session'].phase).toBe('idle');
    expect(screen['session'].lines.statement).toContain('?tape=');
    screen.reset();
  });
});
