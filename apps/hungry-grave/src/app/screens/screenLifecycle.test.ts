/**
 * The lifecycle rules a screen has to hold. Its transition guard comes back
 * down when the navigation rejects, because left up it deafens every retry and
 * on the game screen holds the ticker's work stopped for the rest of the run.
 * Its reset() is idempotent, because a pooled screen is reset once by
 * navigation and again by Pool.return. And every listener a run adds comes off
 * again, because a pooled screen that accumulates one set per run is the leak
 * this file exists to catch.
 */

import { Container } from "pixi.js";
import type { Filter, Ticker } from "pixi.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { navigation, canvasListeners } = vi.hoisted(() => ({
  navigation: {
    showScreen: vi.fn(),
    presentPopup: vi.fn(),
    dismissPopup: vi.fn(),
    // Mutable, because the screen's Escape handler branches on which popup is
    // up and the engine owns this field in production.
    currentPopup: undefined as object | undefined,
  },
  canvasListeners: new Set<() => void>(),
}));

const { showScreen, presentPopup, dismissPopup } = navigation;

vi.mock("../getEngine", () => ({
  engine: () => ({
    navigation,
    canvas: {
      addEventListener: (_type: string, handler: () => void) =>
        canvasListeners.add(handler),
      removeEventListener: (_type: string, handler: () => void) =>
        canvasListeners.delete(handler),
    },
  }),
}));

/** The real widgets need a renderer: text metrics and a loaded texture. */
vi.mock("../ui/Label", () => ({
  Label: class extends Container {
    public text = "";
    public anchor = { set: () => {} };
  },
}));

vi.mock("../ui/Button", () => ({
  Button: class extends Container {
    public onPress = { connect: (handler: () => void) => void handler };
  },
}));

import { TICK_MS } from "../../game/clock";
import { pauseActions, PausePopup } from "../popups/PausePopup";
import { SettingsPopup } from "../popups/SettingsPopup";
import { EndScreen } from "./EndScreen";
import { GameScreen } from "./game/GameScreen";
import { TitleScreen } from "./TitleScreen";

const keyHandlers = new Set<(event: KeyboardEvent) => void>();

// The screens bind their keys on window, which node does not have.
Object.defineProperty(globalThis, "window", {
  value: {
    addEventListener: (_type: string, handler: (e: KeyboardEvent) => void) =>
      keyHandlers.add(handler),
    removeEventListener: (_type: string, handler: (e: KeyboardEvent) => void) =>
      keyHandlers.delete(handler),
    location: { search: "", hash: "" },
  },
  configurable: true,
});

Object.defineProperty(globalThis, "localStorage", {
  value: { getItem: () => null, setItem: () => {} },
  configurable: true,
});

/**
 * Fans a press out to every registered handler, whatever the type it was
 * registered for. Once keydown, keyup and blur are all registered an Escape
 * press also calls release(undefined) and releaseAll(), which is harmless and
 * worth knowing before reading a confusing failure.
 */
function press(key: string, code = ""): void {
  const event = { key, code, preventDefault: () => {} } as KeyboardEvent;
  for (const handler of [...keyHandlers]) handler(event);
}

function frame(elapsedMS: number): Ticker {
  return { elapsedMS } as Ticker;
}

/**
 * Lets a navigation call finish the way it does in production, where a popup
 * is only ever up once presentPopup has resolved. Handing the mock a
 * currentPopup without this models a state the engine cannot be in: navigation
 * assigns the field last, after the screen's pause() and after the outgoing
 * popup's hide.
 */
function settleNavigation(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Waits for the rejection handler, which runs a microtask after the press. */
async function settle(): Promise<void> {
  await vi.waitFor(() => expect(console.error).toHaveBeenCalled());
}

describe("a screen whose navigation rejects", () => {
  beforeEach(() => {
    keyHandlers.clear();
    showScreen.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("the title screen offers the way in again", async () => {
    showScreen.mockRejectedValueOnce(new Error("no screen"));
    const screen = new TitleScreen();
    screen.prepare();

    press("Enter");
    await settle();

    showScreen.mockResolvedValueOnce(undefined);
    press("Enter");
    expect(showScreen).toHaveBeenCalledTimes(2);
  });

  it("the end screen offers another run again", async () => {
    showScreen.mockRejectedValueOnce(new Error("no screen"));
    const screen = new EndScreen();
    screen.prepare();

    press("Enter");
    await settle();

    showScreen.mockResolvedValueOnce(undefined);
    press("Enter");
    expect(showScreen).toHaveBeenCalledTimes(2);
  });

  it("the game screen lets the run be ended again", async () => {
    // End Run reaches the screen through the pause menu's handoff now, because
    // Escape opens the menu rather than ending the run.
    showScreen.mockRejectedValueOnce(new Error("no screen"));
    const screen = new GameScreen();
    screen.prepare();

    pauseActions.endRun();
    await settle();

    showScreen.mockResolvedValueOnce(undefined);
    pauseActions.endRun();
    expect(showScreen).toHaveBeenCalledTimes(2);
  });

  it("the game screen keeps stepping the sim while it is still playing", async () => {
    showScreen.mockRejectedValueOnce(new Error("no screen"));
    const screen = new GameScreen();
    screen.prepare();

    pauseActions.endRun();
    await settle();
    screen.update(frame(TICK_MS * 2));

    expect(screen["run"]?.tick).toBe(2);
  });
});

describe("the game screen's own lifecycle (dispatch 3b)", () => {
  beforeEach(() => {
    keyHandlers.clear();
    canvasListeners.clear();
    navigation.currentPopup = undefined;
    presentPopup.mockReset().mockResolvedValue(undefined);
    dismissPopup.mockReset().mockResolvedValue(undefined);
  });

  it("reset() removes every listener prepare() added: the key listeners, the blur listener and the canvas pointercancel listener", () => {
    const screen = new GameScreen();
    screen.prepare();
    // Escape, keydown, keyup and blur on window; pointercancel on the canvas.
    expect(keyHandlers.size).toBe(4);
    expect(canvasListeners.size).toBe(1);

    screen.reset();
    screen.reset();

    expect(keyHandlers.size).toBe(0);
    expect(canvasListeners.size).toBe(0);
  });

  it("update is called with a ticker and the tick count matches the elapsed time", () => {
    // One tick per rendered frame is gone: the sim advances on clock.ts, so a
    // 144 Hz display and a 60 Hz display play the same game (ADR 0015).
    const screen = new GameScreen();
    screen.prepare();

    screen.update(frame(TICK_MS * 3));
    expect(screen["run"]?.tick).toBe(3);

    screen.update(frame(TICK_MS * 0.5));
    expect(screen["run"]?.tick).toBe(3);

    screen.update(frame(TICK_MS * 0.6));
    expect(screen["run"]?.tick).toBe(4);
  });

  it("a tab switch and back while the pause menu is up leaves the sim paused and the tick debt honest", () => {
    // The engine's visibilitychange listener calls focus() on the current
    // screen with no regard for currentPopup, so one pause flag let the sim run
    // on under the blurred menu with the keyboard still steering, and the debt
    // readout then reported a gap the player never played through.
    const screen = new GameScreen();
    screen.prepare();
    void screen.pause();
    screen.blur();
    screen.focus();

    // Two frames, because comeBack() skips the first one either way and the
    // sim running on under the menu only shows from the second.
    screen.update(frame(10_000));
    screen.update(frame(10_000));
    expect(screen["run"]?.tick).toBe(0);
    expect(screen["clock"].debtTicks).toBe(0);

    void screen.resume();
    // The first frame back is skipped, because the whole backgrounded gap
    // arrives in Pixi's elapsedMS and nothing game-side can reach it.
    screen.update(frame(10_000));
    screen.update(frame(TICK_MS * 5));

    expect(screen["run"]?.tick).toBe(5);
    expect(screen["clock"].debtTicks).toBe(0);
  });

  it("Escape inside Settings goes back to the pause menu and never into live play", async () => {
    // presentPopup replaces rather than stacks, so dismissing from Settings
    // resumes the run instantly. That is the flow the keyboard speed slider
    // exists for, and it is the flow the on-device read walks every time.
    const screen = new GameScreen();
    screen.prepare();

    press("Escape");
    expect(presentPopup).toHaveBeenLastCalledWith(PausePopup);
    await settleNavigation();

    // Constructed without its constructor: the branch is about which popup is
    // up, and a real one needs a renderer.
    navigation.currentPopup = Object.create(SettingsPopup.prototype);
    press("Escape");
    expect(dismissPopup).not.toHaveBeenCalled();
    expect(presentPopup).toHaveBeenCalledTimes(2);
    expect(presentPopup).toHaveBeenLastCalledWith(PausePopup);
    await settleNavigation();

    navigation.currentPopup = Object.create(PausePopup.prototype);
    press("Escape");
    expect(dismissPopup).toHaveBeenCalledTimes(1);
  });

  it("a second Escape while the pause menu is still opening does not present a second menu", async () => {
    // presentPopup assigns currentPopup only after awaiting the screen's own
    // async pause(), so a second Escape inside that window still reads
    // undefined, opens again, and presentPopup tears the opening menu down to
    // animate a fresh one in. Escape auto-repeats while it is held, so one
    // finger reaches this.
    const screen = new GameScreen();
    screen.prepare();

    let menuUp!: () => void;
    presentPopup.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        menuUp = resolve;
      }),
    );

    press("Escape");
    press("Escape");
    expect(presentPopup).toHaveBeenCalledTimes(1);

    // Once the menu is up the guard is down again, and Escape closes it.
    menuUp();
    await settleNavigation();
    navigation.currentPopup = Object.create(PausePopup.prototype);

    press("Escape");
    expect(dismissPopup).toHaveBeenCalledTimes(1);
  });

  it("a pooled screen whose pause menu never finished opening can still be paused on the next run", () => {
    // The guard is a lifecycle flag, so it is cleared in prepare() with the
    // rest. Left set, a screen returned to the pool mid-open would come back
    // unpausable for the whole of the next run.
    const screen = new GameScreen();
    screen.prepare();
    presentPopup.mockReturnValueOnce(new Promise<void>(() => {}));

    press("Escape");
    expect(presentPopup).toHaveBeenCalledTimes(1);

    screen.reset();
    screen.prepare();

    press("Escape");
    expect(presentPopup).toHaveBeenCalledTimes(2);
  });

  it("prepare() twice on a pooled screen starts the second run with no pointers down, no keys held and no filters", () => {
    const screen = new GameScreen();
    screen.prepare();
    screen.resize(540, 760);

    const grave = screen["run"]!.grave;
    screen["touch"].down(1, { x: 100, y: 100 }, grave);
    screen["touch"].move(1, { x: 200, y: 100 });
    press("ArrowRight", "ArrowRight");
    // Standing in for the BlurFilter PausePopup.show() sets and only its own
    // hide() clears. A real one needs a document to compile its shader, and
    // this dispatch deliberately registers no document listener at all.
    screen.filters = [{} as Filter];

    screen.reset();
    screen.prepare();

    expect(screen["touch"].isSteering()).toBe(false);
    expect(screen["keys"].command()).toEqual({ x: 0, y: 0 });
    expect(screen.filters).toHaveLength(0);
  });

  it("prepare() gives a pooled screen its children back, so the pause button is tappable on every run and not only the first", () => {
    const screen = new GameScreen();

    // What navigation leaves behind on the way out: showScreen and
    // hideAndRemoveScreen both set interactiveChildren false, and
    // addAndShowScreen only sets it back inside `if (screen.show)`. This screen
    // declares no show(), so nothing in the engine ever restores it and the
    // second run out of the pool has a dead pause button while the stage-wide
    // hitArea keeps steering the grave.
    screen.interactiveChildren = false;
    screen.prepare();

    expect(screen.interactiveChildren).toBe(true);
  });
});

describe("a screen on its way back to the pool", () => {
  beforeEach(() => keyHandlers.clear());

  it("the title screen's reset runs twice and still unbinds its key", () => {
    const screen = new TitleScreen();
    screen.prepare();
    expect(keyHandlers.size).toBe(1);

    screen.reset();
    screen.reset();

    expect(keyHandlers.size).toBe(0);
  });

  it("the end screen's reset runs twice and still unbinds its key", () => {
    const screen = new EndScreen();
    screen.prepare();
    expect(keyHandlers.size).toBe(1);

    screen.reset();
    screen.reset();

    expect(keyHandlers.size).toBe(0);
  });

  it("the game screen's reset runs twice and still drops the run", () => {
    const screen = new GameScreen();
    screen.prepare();
    expect(keyHandlers.size).toBe(4);

    screen.reset();
    screen.reset();

    expect(keyHandlers.size).toBe(0);
    expect(screen["run"]).toBeNull();
  });
});
