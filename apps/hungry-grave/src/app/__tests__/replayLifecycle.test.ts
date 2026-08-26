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
  screen.init({ onBack: () => {}, playButtonSound: () => {} });
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
});
