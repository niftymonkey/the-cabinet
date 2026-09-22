/**
 * The required pooled-lifecycle test (#58): play a run, end it, open its tape
 * in the replay screen, and show the pooled screens carry nothing between
 * showings. A rendered check that only ever plays run one is structurally
 * blind, and a pooled screen leaks anything nobody explicitly clears.
 */

import { Container } from 'pixi.js';
import type { Ticker } from 'pixi.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { navigation, canvasListeners } = vi.hoisted(() => ({
  navigation: {
    showScreen: vi.fn(),
    presentPopup: vi.fn(),
    dismissPopup: vi.fn(),
    currentPopup: undefined as object | undefined,
  },
  canvasListeners: new Set<() => void>(),
}));

/** The real widgets need a renderer: text metrics and a loaded texture. */
vi.mock('../ui/Label', () => ({
  Label: class extends Container {
    public text: string;
    public anchor = { set: () => {} };
    public style: Record<string, unknown> = {};
    constructor(options: { text?: string } = {}) {
      super();
      this.text = options.text ?? '';
    }
  },
}));

vi.mock('../ui/Button', () => ({
  Button: class extends Container {
    public onPress = { connect: (handler: () => void) => void handler };
  },
}));

import { TICK_MS } from '../../game/clock';
import type { SimEvent } from '../../game/events';
import { spawnMob } from '../../game/mobs';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import { STORM_RENDERER_TRANSIENT_TICKS } from '../screens/game/StormRenderer';
import { PausePopup } from '../popups/PausePopup';
import { runHandoff } from '../runHandoff';
import { GameScreen } from '../screens/game/GameScreen';
import { REPLAY_LEAD_IN_TICKS } from '../screens/game/transients';
import { ReplayScreen } from '../screens/ReplayScreen';

/** The canvas the run listens on for a gesture the platform took away. */
const canvas = {
  addEventListener: (_type: string, handler: () => void) =>
    canvasListeners.add(handler),
  removeEventListener: (_type: string, handler: () => void) =>
    canvasListeners.delete(handler),
} as unknown as HTMLCanvasElement;

/** The End Run the fake driver armed the pause menu with. */
const armed: { endRun: (() => void) | null } = { endRun: null };

/** A game screen holding faked powers, the way navigation hands them in. */
function gameScreen(): GameScreen {
  const screen = new GameScreen();
  screen.init({
    openMenu: (endRun) => {
      armed.endRun = endRun;
      return Promise.resolve(navigation.presentPopup(PausePopup));
    },
    closeMenu: () => Promise.resolve(navigation.dismissPopup()),
    menuShowing: () => navigation.currentPopup instanceof PausePopup,
    showEnd: () => Promise.resolve(navigation.showScreen()),
    playSound: () => {},
    playMusic: () => {},
    standInArt: () => null,
    playButtonSound: () => {},
    canvas,
    // The tape header records the renderer's backend and resolution once per
    // run, for its runtime context (ADR 0018).
    renderer: { name: 'webgl', resolution: 2 },
  });
  return screen;
}

/** A replay screen holding faked powers, the way navigation hands them in. */
function replayScreen(): ReplayScreen {
  const screen = new ReplayScreen();
  screen.init({
    onBack: () => {},
    playButtonSound: () => {},
    standInArt: () => null,
  });
  return screen;
}

/**
 * End Run, reached the way a player reaches it: Escape opens the pause menu,
 * which is where the action lives, and its End Run is pressed.
 */
function endRunFromMenu(): void {
  const event = { key: 'Escape', code: '', preventDefault: () => {} };
  for (const handler of [...keyHandlers]) handler(event as KeyboardEvent);
  armed.endRun!();
}

const keyHandlers = new Set<(event: KeyboardEvent) => void>();

/** The URL both screens read: the game its seed, the replay its tape and tick. */
const fakeLocation = { search: '', hash: '' };

Object.defineProperty(globalThis, 'window', {
  value: {
    addEventListener: (_type: string, handler: (e: KeyboardEvent) => void) =>
      keyHandlers.add(handler),
    removeEventListener: (_type: string, handler: (e: KeyboardEvent) => void) =>
      keyHandlers.delete(handler),
    location: fakeLocation,
    matchMedia: () => ({ matches: false }),
    devicePixelRatio: 2,
  },
  configurable: true,
});

Object.defineProperty(globalThis, 'localStorage', {
  value: { getItem: () => null, setItem: () => {} },
  configurable: true,
});

function frame(elapsedMS: number): Ticker {
  return { elapsedMS } as Ticker;
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

async function settled(screen: ReplayScreen): Promise<void> {
  await vi.waitFor(() => expect(screen['session'].phase).not.toBe('fetching'));
}

function driveTo(screen: ReplayScreen, phase: string): void {
  for (let each = 0; each < 2000 && screen['session'].phase !== phase; each++) {
    screen.update(frame(TICK_MS));
  }
  expect(screen['session'].phase).toBe(phase);
}

describe('a played run opens in replay', () => {
  beforeEach(() => {
    keyHandlers.clear();
    canvasListeners.clear();
    navigation.currentPopup = undefined;
    navigation.showScreen.mockReset().mockResolvedValue(undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    fakeLocation.search = '';
    fakeLocation.hash = '';
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('plays a run, ends it, and the pooled replay screen renders the kept tape to its bound, twice', async () => {
    // The run, played through the URL the game screen really reads.
    fakeLocation.search = '?seed=7';
    const game = gameScreen();
    game.prepare();
    for (let spent = 0; spent < 180; spent += 10) {
      game.update(frame(TICK_MS * 10));
    }
    endRunFromMenu();
    const bytes = runHandoff.readTape();
    expect(bytes).not.toBeNull();
    game.reset();
    fakeLocation.search = '';

    // The kept bytes, opened in replay by URL exactly as the runs screen
    // assigns it. The quit landed on tick 180, a checkpoint, so the last
    // verified checkpoint is the whole run.
    serveTape(bytes!);
    fakeLocation.hash = '#/replay?tape=blob%3Akept&at=100';
    const replay = replayScreen();
    // What navigation leaves behind on the way out.
    replay.interactiveChildren = false;
    replay.prepare();
    expect(replay.interactiveChildren).toBe(true);
    await settled(replay);
    driveTo(replay, 'playing');
    expect(replay['session'].playback!.run.seed).toBe(7);
    expect(replay['session'].playback!.run.tick).toBe(
      100 - REPLAY_LEAD_IN_TICKS,
    );

    driveTo(replay, 'played');
    expect(replay['session'].playback!.run.tick).toBe(180);
    expect(replay['session'].bound).toBe(180);
    expect(replay['session'].lines.posture).toContain('PLAYED TO TICK 180');
    const firstPlayback = replay['session'].playback;

    // The pooled second showing starts clean: an idempotent reset, a fresh
    // playback, and the same honest priming again.
    replay.reset();
    replay.reset();
    expect(replay['session'].playback).toBeNull();
    replay.prepare();
    await settled(replay);
    driveTo(replay, 'playing');
    expect(replay['session'].playback).not.toBe(firstPlayback);
    expect(replay['session'].playback!.run.tick).toBe(
      100 - REPLAY_LEAD_IN_TICKS,
    );
    driveTo(replay, 'played');
    expect(replay['session'].playback!.run.tick).toBe(180);
    replay.reset();
  });

  it('a run quit between checkpoints replays to the tick of the quit', async () => {
    // ADR 0019: a replay stops at the last checkpoint that verified, and the
    // seal now stamps one at the run's own last tick, so a quit that landed
    // between the periodic checkpoints is still watched to the quit. 190
    // against the recorder's spacing of 60 leaves 10 ticks past the last one.
    fakeLocation.search = '?seed=7';
    const game = gameScreen();
    game.prepare();
    for (let spent = 0; spent < 190; spent += 10) {
      game.update(frame(TICK_MS * 10));
    }
    endRunFromMenu();
    const bytes = runHandoff.readTape();
    expect(bytes).not.toBeNull();
    game.reset();
    fakeLocation.search = '';

    serveTape(bytes!);
    fakeLocation.hash = '#/replay?tape=blob%3Akept&at=100';
    const replay = replayScreen();
    replay.prepare();
    await settled(replay);
    driveTo(replay, 'played');

    expect(replay['session'].bound).toBe(190);
    expect(replay['session'].playback!.run.tick).toBe(190);
    expect(replay['session'].lines.posture).toContain('PLAYED TO TICK 190');
    replay.reset();
  });

  it("a lost run's replay reaches the hit that ended it", async () => {
    // The whole point of the slice, at the layer a player sees it: a run that
    // ends on contact ends on whatever tick the contact fell on, and the
    // replay plays through that tick rather than stopping up to 59 short of it
    // (ADR 0019, design record R6).
    // A parked run on this seed takes every hit the ramp offers and seals on a
    // tick nobody arranged, which is the only loss a replay can reproduce: a
    // loss staged by writing grave or mob state is state the replay cannot
    // rebuild from the seed, so its witness disagrees at the next checkpoint.
    fakeLocation.search = '?seed=5150';
    const game = gameScreen();
    game.prepare();
    const run = game['session'].run!;
    for (let ticks = 0; run.ending === null && ticks < 7500; ticks += 10) {
      game.update(frame(TICK_MS * 10));
    }
    expect(run.ending).toBe('sealed');
    const died = run.tick;
    expect(died % 60).not.toBe(0);
    const bytes = runHandoff.readTape();
    expect(bytes).not.toBeNull();
    game.reset();
    fakeLocation.search = '';

    serveTape(bytes!);
    fakeLocation.hash = `#/replay?tape=blob%3Akept&at=${died - 40}`;
    const replay = replayScreen();
    replay.prepare();
    await settled(replay);
    driveTo(replay, 'played');

    expect(replay['session'].bound).toBe(died);
    expect(replay['session'].playback!.run.tick).toBe(died);
    expect(replay['session'].playback!.run.ending).toBe('sealed');
    replay.reset();
  });
});

/**
 * The loss announcement reaching a replay (#58). ReplayScreen.syncScreen
 * hand-mirrors GameScreen.announce, so a channel wired into one and not the
 * other simply does not play on a replay, and the lead-in's whole promise is
 * that a replay shows what the live run showed.
 */
describe('a replay plays the loss the live run played', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** The loss announcement's own sprite: last into the replay's storm layer. */
  function blowUp(screen: ReplayScreen): Container {
    const storm = screen['layers'].layer('storm').children;
    const sprite = storm[storm.length - 1];
    if (sprite === undefined) throw new Error('no loss sprite in the storm');
    return sprite as Container;
  }

  /** One playback frame, as the session hands one to the screen. */
  function playing(run: RunState, events: readonly SimEvent[]) {
    return { run, events, forgetPreviousRun: false };
  }

  it('blows up a stripped line on a replay, through the same renderer the run drew with', () => {
    const screen = replayScreen();
    const run = createRun(7);
    run.tick = 30;
    const skull = run.skulls[0];
    if (skull === undefined) throw new Error('no skull pool slot 0');
    skull.alive = true;
    skull.id = 1;
    skull.x = 200;
    skull.y = 300;

    const advance = vi.spyOn(screen['session'], 'advance');
    advance.mockReturnValue(
      playing(run, [{ type: 'weaponStripped', lines: ['skullStream'] }]),
    );
    screen.update(frame(TICK_MS));
    expect(blowUp(screen).visible).toBe(true);

    // And it ends on its own declared lifetime, exactly as it does live.
    run.tick = 30 + STORM_RENDERER_TRANSIENT_TICKS.lossBlowUp;
    advance.mockReturnValue(playing(run, []));
    screen.update(frame(TICK_MS));
    expect(blowUp(screen).visible).toBe(false);
  });

  /** Whether anything in the mobs' layer has been dimmed. */
  function mobsDimmed(screen: ReplayScreen): boolean {
    const bodies = screen['layers'].layer('mobBodies').children;
    return bodies.some((body) => body.visible && body.alpha < 1);
  }

  /** A replay frame on which this boss dies, then a second of frames after it. */
  function replayADeath(boss: 'banshee' | 'undertaker'): ReplayScreen {
    const screen = replayScreen();
    const run = createRun(7);
    spawnMob(
      run,
      'shambler',
      { x: 100, y: 100, vx: 0, vy: 1, index: 0 },
      false,
      'wave',
    );
    const advance = vi.spyOn(screen['session'], 'advance');
    advance.mockReturnValue(
      playing(run, [{ type: 'bossKilled', boss, x: 270, y: 200 }]),
    );
    screen.update(frame(TICK_MS));
    advance.mockReturnValue(playing(run, []));
    for (let i = 0; i < 60; i += 1) screen.update(frame(TICK_MS));
    return screen;
  }

  it("the Banshee's death fades nothing on a replay, because the run goes on after her", () => {
    // bossKilled fires for both bosses and only the Undertaker's ends the run
    // (R6). A scene clock started at the Banshee's death would fade the shots
    // out and leave the mobs dim for the whole rest of the replay.
    expect(mobsDimmed(replayADeath('banshee'))).toBe(false);
  });

  it("the Undertaker's death dims the field on a replay, as it does live", () => {
    expect(mobsDimmed(replayADeath('undertaker'))).toBe(true);
  });
});
