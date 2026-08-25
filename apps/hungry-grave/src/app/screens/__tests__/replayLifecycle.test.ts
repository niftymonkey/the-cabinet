/**
 * The required pooled-lifecycle test (#58): play a run, end it, open its tape
 * in the replay screen, and show the pooled screens carry nothing between
 * showings. A rendered check that only ever plays run one is structurally
 * blind, and a pooled screen leaks anything nobody explicitly clears.
 */

import { Container } from "pixi.js";
import type { Ticker } from "pixi.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { navigation, canvasListeners } = vi.hoisted(() => ({
  navigation: {
    showScreen: vi.fn(),
    presentPopup: vi.fn(),
    dismissPopup: vi.fn(),
    currentPopup: undefined as object | undefined,
  },
  canvasListeners: new Set<() => void>(),
}));

vi.mock("../../getEngine", () => ({
  engine: () => ({
    navigation,
    renderer: { name: "webgl", resolution: 2 },
    canvas: {
      addEventListener: (_type: string, handler: () => void) =>
        canvasListeners.add(handler),
      removeEventListener: (_type: string, handler: () => void) =>
        canvasListeners.delete(handler),
    },
  }),
}));

/** The real widgets need a renderer: text metrics and a loaded texture. */
vi.mock("../../ui/Label", () => ({
  Label: class extends Container {
    public text: string;
    public anchor = { set: () => {} };
    public style: Record<string, unknown> = {};
    constructor(options: { text?: string } = {}) {
      super();
      this.text = options.text ?? "";
    }
  },
}));

vi.mock("../../ui/Button", () => ({
  Button: class extends Container {
    public onPress = { connect: (handler: () => void) => void handler };
  },
}));

import { TICK_MS } from "../../../game/clock";
import { pauseActions } from "../../popups/PausePopup";
import { runHandoff } from "../../runHandoff";
import { GameScreen } from "../game/GameScreen";
import { REPLAY_LEAD_IN_TICKS } from "../game/transients";
import { ReplayScreen } from "../ReplayScreen";

const keyHandlers = new Set<(event: KeyboardEvent) => void>();

/** The URL both screens read: the game its seed, the replay its tape and tick. */
const fakeLocation = { search: "", hash: "" };

Object.defineProperty(globalThis, "window", {
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

Object.defineProperty(globalThis, "localStorage", {
  value: { getItem: () => null, setItem: () => {} },
  configurable: true,
});

function frame(elapsedMS: number): Ticker {
  return { elapsedMS } as Ticker;
}

function serveTape(bytes: Uint8Array): void {
  vi.stubGlobal(
    "fetch",
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
  await vi.waitFor(() => expect(screen["phase"]).not.toBe("fetching"));
}

function driveTo(screen: ReplayScreen, phase: string): void {
  for (let each = 0; each < 2000 && screen["phase"] !== phase; each++) {
    screen.update(frame(TICK_MS));
  }
  expect(screen["phase"]).toBe(phase);
}

describe("a played run opens in replay (dispatch 6b)", () => {
  beforeEach(() => {
    keyHandlers.clear();
    canvasListeners.clear();
    navigation.currentPopup = undefined;
    navigation.showScreen.mockReset().mockResolvedValue(undefined);
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    fakeLocation.search = "";
    fakeLocation.hash = "";
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("plays a run, ends it, and the pooled replay screen renders the kept tape to its bound, twice", async () => {
    // The run, played through the URL the game screen really reads.
    fakeLocation.search = "?seed=7";
    const game = new GameScreen();
    game.prepare();
    for (let spent = 0; spent < 180; spent += 10) {
      game.update(frame(TICK_MS * 10));
    }
    pauseActions.endRun();
    const bytes = runHandoff.readTape();
    expect(bytes).not.toBeNull();
    game.reset();
    fakeLocation.search = "";

    // The kept bytes, opened in replay by URL exactly as the runs screen
    // assigns it. The quit landed on tick 180, a checkpoint, so the last
    // verified checkpoint is the whole run.
    serveTape(bytes!);
    fakeLocation.hash = "#/replay?tape=blob%3Akept&at=100";
    const replay = new ReplayScreen();
    // What navigation leaves behind on the way out.
    replay.interactiveChildren = false;
    replay.prepare();
    expect(replay.interactiveChildren).toBe(true);
    await settled(replay);
    driveTo(replay, "playing");
    expect(replay["playback"]!.run.seed).toBe(7);
    expect(replay["playback"]!.run.tick).toBe(100 - REPLAY_LEAD_IN_TICKS);

    driveTo(replay, "played");
    expect(replay["playback"]!.run.tick).toBe(180);
    expect(replay["bound"]).toBe(180);
    expect(replay["postureLabel"].text).toContain("PLAYED TO TICK 180");
    const firstPlayback = replay["playback"];

    // The pooled second showing starts clean: an idempotent reset, a fresh
    // playback, and the same honest priming again.
    replay.reset();
    replay.reset();
    expect(replay["playback"]).toBeNull();
    replay.prepare();
    await settled(replay);
    driveTo(replay, "playing");
    expect(replay["playback"]).not.toBe(firstPlayback);
    expect(replay["playback"]!.run.tick).toBe(100 - REPLAY_LEAD_IN_TICKS);
    driveTo(replay, "played");
    expect(replay["playback"]!.run.tick).toBe(180);
    replay.reset();
  });
});
