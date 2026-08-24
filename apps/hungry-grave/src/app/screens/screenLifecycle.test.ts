/**
 * The lifecycle rules a screen has to hold. Its transition guard comes back
 * down when the navigation rejects, because left up it deafens every retry;
 * on the game screen only the navigation half comes down, because the run is
 * over once its record is sealed and the frame seam retries the way out
 * itself. Its reset() is idempotent, because a pooled screen is reset once by
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
    // The game screen reads the renderer's backend and resolution once per run,
    // for the tape header's runtime context (ADR 0018).
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

const { saveTapeFile } = vi.hoisted(() => ({ saveTapeFile: vi.fn() }));

/** The browser download seam is stubbed; the file name stays the real one. */
vi.mock("../tapeExport", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../tapeExport")>()),
  saveTapeFile,
}));

import { TICK_MS } from "../../game/clock";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../../game/field";
import { MOB_TYPES } from "../../game/mobs";
import { SIZE_FLOOR } from "../../game/tuning";
import { FAULT_IDENTITIES } from "../../game/invariants";
import { pauseActions, PausePopup } from "../popups/PausePopup";
import { runHandoff } from "../runHandoff";
import { SettingsPopup } from "../popups/SettingsPopup";
import { EndScreen, FAULT_FONT_SIZE, faultCaption } from "./EndScreen";
import { STONES_BY_LEVEL } from "../../game/lines/headstones";
import { GameScreen } from "./game/GameScreen";
import { TitleScreen } from "./TitleScreen";
import { decodeTape } from "../../tape/decode";
import type { TapeRecorder } from "../../tape/recorder";
import { tapeOf } from "../../tape/recorder";
import { readBackForVerification } from "../../tape/verificationReadback";
import { tapeFileName } from "../tapeExport";
import type { FrameObservation } from "../../tape/tape";
import { faultObservations, frameObservations } from "../../tape/tape";
import { MAX_LEVEL } from "../../game/lines/roster";
import { uniformLevels } from "../../game/run";

const keyHandlers = new Set<(event: KeyboardEvent) => void>();

/** The URL the game screen reads its seed and starting size off (ADR 0012). */
const fakeLocation = { search: "", hash: "" };

// The screens bind their keys on window, which node does not have. The pointer
// query and the pixel ratio are the tape header's, read once per run.
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

  it("the game screen holds an ended run still and retries the way out from the frame seam", async () => {
    // The quit sealed the trailer and captured the bytes, so the run is over
    // whatever the navigation did: a frame that stepped the sim now would
    // read live on a run whose own record says it stopped (ADR 0018). The
    // frame seam retries the navigation instead, until the end state takes.
    showScreen.mockRejectedValueOnce(new Error("no screen"));
    const screen = new GameScreen();
    screen.prepare();

    pauseActions.endRun();
    await settle();
    showScreen.mockResolvedValueOnce(undefined);
    screen.update(frame(TICK_MS * 2));

    expect(screen["run"]?.tick).toBe(0);
    expect(showScreen).toHaveBeenCalledTimes(2);
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

  it("a pointercancel drops the belch button's claim, the way pause and blur do", () => {
    // Pixi v8 maps no pointercancel, so no federated pointerup ever arrives to
    // clear the claim and this listener is the only thing that can. A claim
    // left standing is a pointer id the steer model goes on ignoring.
    const screen = new GameScreen();
    screen.prepare();
    const button = screen["belchButton"];
    button.emit("pointerdown", { pointerId: 5 } as never);
    expect(button.owns(5)).toBe(true);

    for (const cancel of canvasListeners) cancel();
    expect(button.owns(5)).toBe(false);
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

  it("the second run out of the pool gets its own execution, so nothing of run one is carried into it", () => {
    // The Execution's lifetime is the run's (ADR 0017). The stage watch used to
    // live in a WeakMap keyed by the run, which gave that away for free; held
    // by a pooled screen it is somebody's job, and a pooled screen leaking what
    // nobody clears is the class of defect this app has shipped five times. A
    // watch carried over would compare run two's first phase with run one's
    // last, and a stale fault history would belong to a run that is over.
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS * 3));
    const first = screen["execution"];
    expect(first?.run).toBe(screen["run"]);
    expect(first?.run.tick).toBe(3);

    screen.reset();
    expect(screen["execution"]).toBeNull();

    screen.prepare();
    screen.update(frame(TICK_MS * 3));
    const second = screen["execution"];
    expect(second).not.toBe(first);
    expect(second?.run).toBe(screen["run"]);
    expect(second?.run).not.toBe(first?.run);
    expect(second?.watch).not.toBe(first?.watch);
    expect(second?.faults).toEqual([]);
    expect(second?.stop).toBeNull();
    expect(second?.run.tick).toBe(3);
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
    // arrives in Pixi's elapsedMS and nothing game-side can reach it, and the
    // resume countdown then holds the field until a thumb can get down.
    screen.update(frame(10_000));
    expect(screen["countdownMs"]).not.toBeNull();
    screen.update(frame(3000));
    expect(screen["countdownMs"]).toBeNull();

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

  it("an abandoned run's pause transition finishing does not unlock the next run's guard", async () => {
    // The cleanup that lowers the guard rides on the navigation promise, and
    // that promise can settle after reset() and the next prepare() have run. An
    // old run's cleanup then lowers a new run's guard while the new menu is
    // still opening, and a further Escape tears that menu down to animate a
    // fresh one in: exactly what the guard exists to prevent. End Run inside
    // the menu is the only way to end a run today, so nothing can reach this
    // yet; a death landing while the menu animates reaches it in dispatch 4.
    const screen = new GameScreen();
    screen.prepare();

    let abandonedMenuUp!: () => void;
    presentPopup.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        abandonedMenuUp = resolve;
      }),
    );
    press("Escape");
    expect(presentPopup).toHaveBeenCalledTimes(1);

    screen.reset();
    screen.prepare();

    presentPopup.mockReturnValueOnce(new Promise<void>(() => {}));
    press("Escape");
    expect(presentPopup).toHaveBeenCalledTimes(2);

    abandonedMenuUp();
    await settleNavigation();

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

describe("the resume countdown (dispatch 4 section 4.17)", () => {
  beforeEach(() => {
    keyHandlers.clear();
    canvasListeners.clear();
    navigation.currentPopup = undefined;
    presentPopup.mockReset().mockResolvedValue(undefined);
    dismissPopup.mockReset().mockResolvedValue(undefined);
  });

  it("holds the sim still through three, two and one before the field is live again", () => {
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS * 3));
    expect(screen["run"]?.tick).toBe(3);

    void screen.pause();
    void screen.resume();
    expect(screen["countdownLabel"].visible).toBe(true);

    // The first frame back is skipped, so the count starts on the second.
    screen.update(frame(1000));
    screen.update(frame(1000));
    expect(screen["run"]?.tick).toBe(3);
    screen.update(frame(1000));
    screen.update(frame(1000));
    expect(screen["countdownMs"]).toBeNull();
    expect(screen["countdownLabel"].visible).toBe(false);

    screen.update(frame(TICK_MS * 2));
    expect(screen["run"]?.tick).toBe(5);
  });

  it("blurs the threat and food layers and spares the grave, then clears the blur on one", () => {
    // Sparing the grave and its rim is the same rule ADR 0014's hit dim
    // carries: never occlude the channel the player is being asked to re-read.
    //
    // Corpses and treasure are blurred too, which dispatch 4 shipped spared and
    // could not see: a played run then produced no corpses at all. The rule the
    // blur was written against is that a frozen sharp field hands the player
    // free seconds to plan, and a corpse field is exactly what a dive is
    // planned through, because freshness is a deadline.
    const screen = new GameScreen();
    screen.prepare();
    const layers = screen["layers"];
    void screen.pause();
    void screen.resume();

    expect(layers.layer("mobBodies").filters).toHaveLength(1);
    expect(layers.layer("mobFire").filters).toHaveLength(1);
    expect(layers.layer("corpses").filters).toHaveLength(1);
    expect(layers.layer("treasure").filters).toHaveLength(1);
    expect(layers.layer("graveRim").filters ?? []).toHaveLength(0);
    expect(layers.layer("graveMouth").filters ?? []).toHaveLength(0);

    screen.update(frame(0));
    screen.update(frame(1500));
    expect(layers.layer("mobBodies").filters).toHaveLength(1);
    screen.update(frame(1000));
    expect(layers.layer("mobBodies").filters).toHaveLength(0);
  });

  it("uses one BlurFilter instance across repeated countdowns", () => {
    // One was allocated per countdown and never destroyed, and the countdown
    // fires on every resume and every return from a backgrounded tab. Sharing
    // one is Pixi's own guidance, and it is also what settled the standing
    // unhandled rejection under node.
    const screen = new GameScreen();
    screen.prepare();
    const layers = screen["layers"];

    const seen = new Set<unknown>();
    for (let round = 0; round < 4; round++) {
      void screen.pause();
      void screen.resume();
      const filters = layers.layer("mobBodies").filters;
      expect(filters).toHaveLength(1);
      seen.add((filters as unknown[])[0]);
      screen.update(frame(0));
      screen.update(frame(4000));
    }
    expect(seen.size).toBe(1);
  });

  it("plays a whole run with weapons, seeded through the URL the screen really reads", () => {
    // Bounded in ticks rather than run to an ending, because what is being
    // checked is that the whole stack turns over together: the sim, both
    // renderers, the readouts and the sound subscription.
    // The run can reach its ending inside the window, so navigation has to be
    // able to answer: this file's other blocks mock it in a beforeEach.
    showScreen.mockReset().mockResolvedValue(undefined);
    fakeLocation.search = "?seed=7";
    try {
      const screen = new GameScreen();
      screen.prepare();
      screen.resize(390, 844);
      const run = screen["run"]!;
      expect(run.seed).toBe(7);

      for (let spent = 0; spent < 2400 && run.ending === null; spent += 10) {
        screen.update(frame(TICK_MS * 10));
      }

      expect(run.tick).toBeGreaterThan(1000);
      // The storm ran, which is what makes this a run with weapons in it: the
      // orbit turns on every tick of every run and the stream has fired.
      expect(run.lines.orbitPhase).not.toBe(0);
      expect(run.tick).toBeGreaterThan(run.lines.streamIn);
      screen.reset();
    } finally {
      fakeLocation.search = "";
    }
  });

  it("counts down on a tab return too, and never behind the pause menu", () => {
    const screen = new GameScreen();
    screen.prepare();

    screen.blur();
    screen.focus();
    expect(screen["countdownMs"]).not.toBeNull();

    // A focus() that lands while the menu is still up must not start one, or a
    // countdown runs behind the menu and a second stacks on resume.
    const guarded = new GameScreen();
    guarded.prepare();
    void guarded.pause();
    guarded.blur();
    guarded.focus();
    expect(guarded["countdownMs"]).toBeNull();
    void guarded.resume();
    expect(guarded["countdownMs"]).not.toBeNull();
  });

  it("clears the count and the blur on a pooled reuse", () => {
    // Per-run mutable state with a timer in it, on a pooled screen. This app
    // has now shipped three pooled-screen leaks.
    const screen = new GameScreen();
    screen.prepare();
    void screen.pause();
    void screen.resume();
    expect(screen["countdownMs"]).not.toBeNull();

    screen.reset();
    expect(screen["countdownMs"]).toBeNull();
    expect(screen["layers"].layer("mobBodies").filters).toHaveLength(0);

    screen.prepare();
    expect(screen["countdownMs"]).toBeNull();
    expect(screen["countdownLabel"].visible).toBe(false);
  });
});

describe("a second run on the pooled game screen (dispatch 4)", () => {
  beforeEach(() => {
    keyHandlers.clear();
    canvasListeners.clear();
    navigation.currentPopup = undefined;
    showScreen.mockReset().mockResolvedValue(undefined);
  });

  /** Ticks the sim, a frame at a time, because clock.ts clamps a long frame's catch-up. */
  function play(screen: GameScreen, ticks: number): void {
    for (let spent = 0; spent < ticks; spent += 10) {
      screen.update(frame(TICK_MS * 10));
    }
  }

  it("starts with an empty field, no live entities from the first run, and a live pause button", () => {
    const screen = new GameScreen();
    screen.prepare();
    // A first run with something on the field: the ramp's first row is at two
    // seconds, so this is the earliest the field is not empty.
    const first = screen["run"]!;
    // Far enough in that the storm cannot have cleared the field. Two hundred
    // ticks used to be enough, when the ramp's first two rows were Drips of one
    // and nothing could kill them; the birthright stream now does, so the run
    // is played to the File at twenty seconds instead.
    play(screen, 1400);
    expect(first.mobs.some((mob) => mob.alive)).toBe(true);
    expect(first.skulls.some((skull) => skull.alive)).toBe(true);

    // And a shot still on the field when the run ends, which is the ordinary
    // case and the one the field renderer's own memory spans. It is placed by
    // hand rather than waited for, so the test does not depend on which armed
    // mob the storm happened to leave standing.
    const shot = first.mobFire[0];
    shot.alive = true;
    shot.id = 1;
    shot.emitter = "shambler";
    shot.x = 200;
    shot.y = 300;
    shot.halfExtent = 5;
    // A live wisp and a live bell ring too, which are the storm's own per-run
    // state and the fields StormRenderer would leak through.
    const wisp = first.wisps[0];
    wisp.alive = true;
    wisp.id = 2;
    wisp.x = 200;
    wisp.y = 300;
    wisp.life = 60;
    first.lines.ring = { level: 3, ticks: 10, struck: new Set() };
    // A belch asked for and not spent, which is per-run mutable state on a
    // pooled screen and the class of defect this app has shipped five times.
    screen["belchRequested"] = true;
    screen.update(frame(TICK_MS));
    expect(first.mobFire.some((each) => each.alive)).toBe(true);

    screen.reset();
    // What navigation leaves behind on the way out.
    screen.interactiveChildren = false;
    screen.prepare();

    const second = screen["run"]!;
    expect(second).not.toBe(first);
    expect(second.tick).toBe(0);
    expect(second.mobs.some((mob) => mob.alive)).toBe(false);
    expect(second.corpses.some((corpse) => corpse.alive)).toBe(false);
    expect(second.mobFire.some((shot) => shot.alive)).toBe(false);
    expect(second.skulls.some((skull) => skull.alive)).toBe(false);
    expect(second.wisps.some((each) => each.alive)).toBe(false);
    expect(second.lines.ring).toBeNull();
    expect(screen["belchRequested"]).toBe(false);
    expect(screen.interactiveChildren).toBe(true);

    const layers = screen["layers"];
    for (const name of [
      "mobBodies",
      "corpses",
      "mobFire",
      "bellRing",
      "belchEruption",
    ] as const) {
      const children = layers.layer(name).children;
      expect(children.length).toBeGreaterThan(0);
      expect(children.every((child) => !child.visible)).toBe(true);
    }

    // The storm layer is not blanket-empty and must not be asserted as such:
    // the headstones are a birthright line and always on, so a fresh run draws
    // its level's own stones from the first tick. What must not survive is a
    // skull or a wisp, and both pools are empty above.
    const storm = layers.layer("storm").children;
    expect(storm.length).toBeGreaterThan(0);
    expect(storm.filter((child) => child.visible)).toHaveLength(
      STONES_BY_LEVEL[second.levels.headstones],
    );
  });

  it("ends the run on sealed, and on victory too, so the deploy is a complete run in both directions", () => {
    const sealing = new GameScreen();
    sealing.prepare();
    const run = sealing["run"]!;
    // At the floor with nothing left to bleed, so the next contact seals.
    run.grave.size = SIZE_FLOOR;
    const mob = run.mobs[0];
    mob.alive = true;
    mob.type = "shambler";
    mob.hp = MOB_TYPES.shambler.hp;
    mob.x = run.grave.x;
    mob.y = run.grave.y;

    sealing.update(frame(TICK_MS));
    expect(run.ending).toBe("sealed");
    expect(sealing["ending"]).toBe(true);
    expect(showScreen).toHaveBeenCalledTimes(1);
    expect(runHandoff.read()?.ending).toBe("sealed");

    const winning = new GameScreen();
    winning.prepare();
    // On the boundary of the last stubbed boss phase, which ends on the tick it
    // begins and hands the run to the over phase.
    winning["run"]!.stage.phaseIndex = 3;
    winning["run"]!.stage.phaseTick = 0;

    winning.update(frame(TICK_MS));
    expect(winning["run"]!.ending).toBe("victory");
    expect(winning["ending"]).toBe(true);
    expect(runHandoff.read()?.ending).toBe("victory");
  });
});

describe("a whole run through the live lifecycle (dispatch 4)", () => {
  beforeEach(() => {
    showScreen.mockReset().mockResolvedValue(undefined);
    fakeLocation.search = "?seed=5150";
  });
  afterEach(() => {
    fakeLocation.search = "";
  });

  it("plays a fresh run from prepare to its ending with nothing forced, so the live path is covered end to end", () => {
    const screen = new GameScreen();
    screen.prepare();
    const run = screen["run"]!;
    expect(run.seed).toBe(5150);
    expect(run.ending).toBe(null);

    // Parked, taking every hit the ramp offers. The tests around this one
    // reach their endings by writing to grave, mob or stage state, so none of
    // them proves that spawning, stepping and the ending handoff hold together
    // over a run nobody arranged.
    let spawned = false;
    let ticks = 0;
    // A parked run seals at tick 1118, on every seed measured. The bound is
    // three times that, so content that stops ending a parked run fails here
    // rather than hanging the suite.
    while (run.ending === null && ticks < 3600) {
      screen.update(frame(TICK_MS * 10));
      ticks += 10;
      spawned ||= run.mobs.some((mob) => mob.alive);
    }

    expect(spawned).toBe(true);
    expect(run.ending).toBe("sealed");
    expect(run.tick).toBeGreaterThan(1000);
    expect(screen["ending"]).toBe(true);
    expect(showScreen).toHaveBeenCalledTimes(1);
    expect(runHandoff.read()?.ending).toBe("sealed");
  });
});

describe("the end screen's endings (dispatch 4 section 4.18)", () => {
  it("renders the victory branch, which no played run in this dispatch can reach", () => {
    // Victory is unreachable by hand here and the played run always ends
    // sealed, so without this the victory copy ships drawn by nobody.
    const screen = new EndScreen();
    runHandoff.record(
      { seed: 3, ticks: 12780, ending: "victory", fault: null },
      null,
    );
    screen.prepare();
    expect(screen["title"].text).toBe("THE STAGE SURVIVED");

    runHandoff.record(
      { seed: 3, ticks: 400, ending: "sealed", fault: null },
      null,
    );
    screen.prepare();
    expect(screen["title"].text).toBe("SEALED SHUT");

    runHandoff.record({ seed: 3, ticks: 400, ending: null, fault: null }, null);
    screen.prepare();
    expect(screen["title"].text).toBe("THE RUN IS OVER");
  });

  it("tells a faulted run apart from a quit, in words that are neither a death nor a game over", () => {
    // ADR 0017 ruling 2: no new screen, and Mark must be able to tell "the
    // game needs tuning" from "the game malfunctioned" without being told
    // which. A fatal fault is never a player death, so the copy wears no
    // sealing vocabulary; the fault line is enough to file a bug from a phone
    // screenshot.
    const screen = new EndScreen();
    runHandoff.record(
      {
        seed: 3,
        ticks: 400,
        ending: null,
        fault: { identity: "no NaN", firstTick: 123 },
      },
      null,
    );
    screen.prepare();
    expect(screen["title"].text).toBe("THE GAME BROKE");
    expect(screen["faultLabel"].text).toBe("FAULT no NaN\nAT TICK 123");

    runHandoff.record({ seed: 3, ticks: 400, ending: null, fault: null }, null);
    screen.prepare();
    expect(screen["title"].text).toBe("THE RUN IS OVER");
    expect(screen["faultLabel"].text).toBe("");
  });

  it("keeps the fault caption on a 390-unit stage for every identity at a seven-digit tick", () => {
    // The fault line is what filing a bug from a phone screenshot relies on
    // (ADR 0017), so no identity's caption may clip: as one 18px line the
    // widest ran about 500 units centred on a 390-unit stage and the tick
    // number fell off both it and the screenshot. The caption is monospace,
    // so 0.62 em bounds the advance; the derivation of that bound is with
    // MONOSPACE_ADVANCE_MAX in layering.test.ts, and it is a bound rather
    // than a measurement because this environment has no renderer.
    const advanceMax = 0.62;
    for (const identity of FAULT_IDENTITIES) {
      const caption = faultCaption({ identity, firstTick: 9_999_999 });
      for (const line of caption.split("\n")) {
        expect(line.length * FAULT_FONT_SIZE * advanceMax).toBeLessThanOrEqual(
          390,
        );
      }
    }
  });
});

describe("the minimal export (dispatch 6a)", () => {
  beforeEach(() => {
    showScreen.mockReset().mockResolvedValue(undefined);
    saveTapeFile.mockClear();
  });

  it("hands the ended run's sealed tape to the handoff as decodable bytes", () => {
    // ADR 0020: the export is what first lets a tape outlive its run, because
    // reset() nulls the recorder and nothing else keeps the record.
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS * 3));

    pauseActions.endRun();

    const bytes = runHandoff.readTape();
    expect(bytes).not.toBeNull();
    const { tape } = decodeTape(bytes!);
    expect(tape.header.seed).toBe(screen["run"]!.seed);
    expect(tape.commands).toHaveLength(3);
    expect(tape.trailer).toMatchObject({ stop: "quit" });
  });

  it("exports the frame that executed the run-ending tick when the run ends by play", () => {
    // ADR 0018: every frame of a live run is recorded, and the exported bytes
    // are the artifact that claim is judged on. The run that ends by play ends
    // inside the frame's own work, so a capture taken there seals the tape one
    // row short: the frame with the death's tick index and timings on it.
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS * 2));
    const run = screen["run"]!;
    // At the floor with nothing left to bleed, so the next contact seals.
    run.grave.size = SIZE_FLOOR;
    const mob = run.mobs[0];
    mob.alive = true;
    mob.type = "shambler";
    mob.hp = MOB_TYPES.shambler.hp;
    mob.x = run.grave.x;
    mob.y = run.grave.y;

    screen.update(frame(TICK_MS));
    expect(run.ending).toBe("sealed");

    const { tape } = decodeTape(runHandoff.readTape()!);
    const rows = frameObservations(tape);
    expect(rows).toHaveLength(2);
    expect(rows[rows.length - 1]).toMatchObject({
      reason: "live",
      tickIndex: 2,
      ticksExecuted: 1,
    });
    expect(tape.trailer).toMatchObject({ ending: "sealed", stop: "finished" });
  });

  it("exports every recorded frame on a pause-menu quit, whose last frame came before the quit", () => {
    // The quit path calls endRun outside the frame seam, so its last live frame
    // was already recorded when the bytes are captured; the frames the run then
    // spends on its own end state stay in the recorder only.
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS * 3));
    screen.update(frame(TICK_MS));

    pauseActions.endRun();
    screen.update(frame(TICK_MS));

    const { tape } = decodeTape(runHandoff.readTape()!);
    const rows = frameObservations(tape);
    expect(rows).toHaveLength(2);
    expect(rows[rows.length - 1]).toMatchObject({
      reason: "live",
      tickIndex: 3,
      ticksExecuted: 1,
    });
    expect(tape.trailer).toMatchObject({ ending: null, stop: "quit" });
  });

  it("offers the save button only when the handoff holds a tape", () => {
    const screen = new EndScreen();

    runHandoff.record(
      { seed: 3, ticks: 400, ending: "sealed", fault: null },
      null,
    );
    screen.prepare();
    expect(screen["saveButton"].visible).toBe(false);

    runHandoff.record(
      { seed: 3, ticks: 400, ending: "sealed", fault: null },
      new Uint8Array([1]),
    );
    screen.prepare();
    expect(screen["saveButton"].visible).toBe(true);
  });

  it("saves the handoff's bytes under the run's own name, from the tap handler", () => {
    const bytes = new Uint8Array([72, 71, 84, 80]);
    runHandoff.record(
      { seed: 505, ticks: 400, ending: "sealed", fault: null },
      bytes,
    );
    const screen = new EndScreen();
    screen.prepare();

    screen["saveTape"]();

    expect(saveTapeFile).toHaveBeenCalledWith(
      bytes,
      tapeFileName(505, COMMIT_HASH),
    );
  });

  it("saves nothing when the last run left no tape", () => {
    runHandoff.record(
      { seed: 505, ticks: 400, ending: "sealed", fault: null },
      null,
    );
    const screen = new EndScreen();
    screen.prepare();

    screen["saveTape"]();

    expect(saveTapeFile).not.toHaveBeenCalled();
  });
});

describe("the loadout pin (dispatch 6a)", () => {
  beforeEach(() => {
    showScreen.mockReset().mockResolvedValue(undefined);
  });
  afterEach(() => {
    fakeLocation.search = "";
  });

  it("?levels= starts all four lines at the pinned level, through the URL the screen really reads", () => {
    // ADR 0020: the measurement's condition is a dense moment with the lines
    // levelled, and no reachable run produces one. It is a testing control and
    // never a player-facing feature; like ?invariants= beside it, it waits on
    // the instrumentation build's gate.
    fakeLocation.search = "?seed=7&levels=5";
    const screen = new GameScreen();
    screen.prepare();

    expect(screen["run"]!.levels).toEqual(uniformLevels(MAX_LEVEL));
    screen.reset();
  });

  it("records the resolved starting levels in the header for every run, birthright included", () => {
    // Ruled by Mark 2026-08-24: the resolved value and never a nullable
    // "pinned or not", so a later tune of the birthright cannot silently
    // change what an old tape replays as.
    const unpinned = new GameScreen();
    unpinned.prepare();
    expect(unpinned["recorder"]!.header.startingLevels).toEqual({
      soulStream: 1,
      headstones: 1,
      wisps: 0,
      bell: 0,
    });
    unpinned.reset();

    fakeLocation.search = "?seed=7&levels=2";
    const pinned = new GameScreen();
    pinned.prepare();
    expect(pinned["recorder"]!.header.startingLevels).toEqual(uniformLevels(2));
    pinned.reset();
  });

  it("shows a levels readout only when the run's start levels differ from the birthright", () => {
    // The pin showed nothing on screen while seed and size both had a
    // readout. The gate is the difference from the birthright rather than the
    // parameter's presence, so ordinary runs are untouched: a pinned run is by
    // definition not an ordinary run.
    const ordinary = new GameScreen();
    ordinary.prepare();
    expect(ordinary["levelsLabel"].text).toBe("");
    ordinary.reset();

    fakeLocation.search = "?seed=7&levels=3";
    const pinned = new GameScreen();
    pinned.prepare();
    expect(pinned["levelsLabel"].text).toBe("LEVELS 3 PINNED");
    pinned.reset();
  });

  it("reads the resolved start levels and never the parameter, so an unusable pin shows nothing", () => {
    // Mark's words: display the run's already-resolved start levels, never
    // parse the URL again. ?levels=9 is refused by the parser and the run
    // keeps its birthright, so the readout has nothing to say.
    fakeLocation.search = "?seed=7&levels=9";
    const screen = new GameScreen();
    screen.prepare();
    expect(screen["levelsLabel"].text).toBe("");
    screen.reset();
  });

  it("exports a pinned run as a tape that decodes and passes verification readback", () => {
    // The whole point of the header field: verification readback rebuilds the
    // run from the header alone, and the witness folds run.levels, so without
    // it a pinned run's tape diverges at checkpoint zero.
    fakeLocation.search = "?seed=7&levels=5";
    const screen = new GameScreen();
    screen.prepare();
    for (let spent = 0; spent < 120; spent += 10) {
      screen.update(frame(TICK_MS * 10));
    }

    pauseActions.endRun();

    const { tape, truncated } = decodeTape(runHandoff.readTape()!);
    expect(truncated).toBe(false);
    expect(tape.header.startingLevels).toEqual(uniformLevels(MAX_LEVEL));
    const result = readBackForVerification(tape);
    expect(result.outcome).toBe("verified");
    expect(result.ticksReproduced).toBe(120);
    expect(result.checkpointsVerified).toBe(3);
    screen.reset();
  });
});

describe("the field's clip", () => {
  it("masks the field to exactly its own rect, and keeps it across a pooled run", () => {
    const screen = new GameScreen();
    screen.prepare();

    const field = screen["field"];
    const clip = screen["clip"];
    expect(field.mask).toBe(clip);
    expect(clip.parent).toBe(field);
    // Local, because resize() has not run and the field is at the identity.
    const rect = clip.getLocalBounds();
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
    expect(rect.width).toBe(FIELD_WIDTH);
    expect(rect.height).toBe(FIELD_HEIGHT);

    // A mask is not a layer, so clear() cannot reach it, and reset() plus a
    // second prepare() is how a pooled screen would lose one that was dressed
    // on rather than built in.
    screen.reset();
    screen.prepare();
    expect(screen["field"].mask).toBe(clip);
    expect(clip.parent).toBe(field);
  });

  it("has something to clip: the sim really does hold mobs above the top edge", () => {
    // Without this the first test passes over a clip that never cuts anything,
    // and the defect it exists for would be invisible to the suite.
    const screen = new GameScreen();
    screen.prepare();

    let sawOffField = false;
    for (let step = 0; step < 900 && !sawOffField; step += 1) {
      screen.update(frame(TICK_MS));
      const run = screen["run"];
      if (!run) break;
      sawOffField = run.mobs.some((mob) => mob.alive && mob.y < 0);
    }
    expect(sawOffField).toBe(true);
  });
});

describe("the frame observation seam (dispatch 6a)", () => {
  beforeEach(() => {
    keyHandlers.clear();
    canvasListeners.clear();
    navigation.currentPopup = undefined;
    showScreen.mockReset().mockResolvedValue(undefined);
    presentPopup.mockReset().mockResolvedValue(undefined);
    dismissPopup.mockReset().mockResolvedValue(undefined);
  });

  function recorderOf(screen: GameScreen): TapeRecorder {
    const recorder = screen["recorder"];
    if (recorder === null) throw new Error("a live run has a recorder");
    return recorder;
  }

  function rowsOf(screen: GameScreen): FrameObservation[] {
    return frameObservations(tapeOf(recorderOf(screen)));
  }

  function lastRowOf(screen: GameScreen): FrameObservation {
    const rows = rowsOf(screen);
    const last = rows[rows.length - 1];
    if (last === undefined) throw new Error("no frame was observed");
    return last;
  }

  it("carries the tick the frame started at, and how many it bought", () => {
    const screen = new GameScreen();
    screen.prepare();

    screen.update(frame(TICK_MS * 3));
    screen.update(frame(TICK_MS * 2));

    expect(rowsOf(screen)).toHaveLength(2);
    expect(lastRowOf(screen)).toMatchObject({
      reason: "live",
      tickIndex: 3,
      ticksExecuted: 2,
    });
  });

  it("keeps a live frame that bought no tick live, with its index absent", () => {
    // ADR 0018: the reason and the tick purchase are separate facts. At a
    // 120Hz refresh against the 60Hz tick rate roughly half of ordinary live
    // frames buy no tick, and the reason byte is what tells such a frame from
    // a held one now that the export lets a tape outlive its run.
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS));

    screen.update(frame(TICK_MS / 2));

    expect(lastRowOf(screen)).toMatchObject({
      reason: "live",
      tickIndex: null,
      ticksExecuted: 0,
    });
  });

  it("marks a paused frame rather than omitting it, with no tick index", async () => {
    // ADR 0018 ruling F: a skipped frame has to be marked, or the record cannot
    // say the run stalled at all, and its tick index is absent rather than
    // fabricated because the frame bought no ticks.
    const screen = new GameScreen();
    screen.prepare();
    await screen.pause();

    screen.update(frame(TICK_MS * 4));

    expect(lastRowOf(screen)).toMatchObject({
      reason: "paused",
      tickIndex: null,
      ticksExecuted: 0,
    });
  });

  it("marks a backgrounded frame the same way", () => {
    const screen = new GameScreen();
    screen.prepare();
    screen.blur();

    screen.update(frame(TICK_MS * 60));

    expect(lastRowOf(screen)).toMatchObject({
      reason: "backgrounded",
      tickIndex: null,
      ticksExecuted: 0,
    });
  });

  it("marks a countdown frame, which is the resume the sim does not advance through", async () => {
    const screen = new GameScreen();
    screen.prepare();
    await screen.pause();
    await screen.resume();

    screen.update(frame(TICK_MS * 4));

    expect(screen["countdownMs"]).not.toBeNull();
    expect(lastRowOf(screen)).toMatchObject({
      reason: "countdown",
      tickIndex: null,
      ticksExecuted: 0,
    });
  });

  it("marks an ending frame, which is the one the run is already over on", () => {
    const screen = new GameScreen();
    screen.prepare();
    pauseActions.endRun();

    screen.update(frame(TICK_MS * 4));

    expect(lastRowOf(screen)).toMatchObject({
      reason: "ending",
      tickIndex: null,
      ticksExecuted: 0,
    });
  });

  it("writes no row at all once the screen has no run, because there is no tape to write it into", () => {
    // ADR 0018 ruling F, proven against a pooled screen still being ticked
    // after reset() rather than by reading the source. A row for a run-less
    // frame would have to be orphaned from every tape there is.
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS));
    const recorder = recorderOf(screen);
    const before = recorder.observations.length;

    screen.reset();
    screen.update(frame(TICK_MS));
    screen.update(frame(TICK_MS));

    expect(screen["recorder"]).toBeNull();
    expect(recorder.observations).toHaveLength(before);
  });

  it("gives a pooled screen's second run its own tape", () => {
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS * 5));
    const first = recorderOf(screen);

    screen.reset();
    screen.prepare();
    screen.update(frame(TICK_MS * 2));
    const second = recorderOf(screen);

    expect(second).not.toBe(first);
    expect(first.commands).toHaveLength(5);
    expect(second.commands).toHaveLength(2);
  });

  it("seals the trailer when the run is ended, so the tape says how it stopped", () => {
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS * 3));
    const recorder = recorderOf(screen);

    pauseActions.endRun();

    expect(recorder.trailer).toMatchObject({
      ending: null,
      stop: "quit",
      integrity: "clean",
    });
  });
});

describe("a fatal fault reaches the end state (dispatch 6a)", () => {
  beforeEach(() => {
    keyHandlers.clear();
    canvasListeners.clear();
    navigation.currentPopup = undefined;
    showScreen.mockReset().mockResolvedValue(undefined);
    saveTapeFile.mockClear();
    // The dev broken handler reports the fault on the console by design
    // (ADR 0017 ruling H); the report is not what these tests assert.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  /** A state no rule produces, so the no NaN check fires on the next tick. */
  function breakRun(screen: GameScreen): void {
    screen["run"]!.grave.x = Number.NaN;
  }

  it("ends the run on screen through the authority, and never through an ending", () => {
    // ADR 0017: a fatal fault never sets run.ending, so the transition keys
    // off execution.stop. Before this, the field froze and the run never ended
    // on screen, which is the opening bug of that ADR minus the missing tape.
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS * 2));
    breakRun(screen);
    screen.update(frame(TICK_MS));

    expect(screen["execution"]!.stop).toBe("faulted");
    expect(screen["run"]!.ending).toBeNull();
    expect(screen["ending"]).toBe(true);
    expect(showScreen).toHaveBeenCalledTimes(1);
    const summary = runHandoff.read()!;
    expect(summary.ending).toBeNull();
    expect(summary.fault).toEqual({ identity: "no NaN", firstTick: 3 });
    screen.reset();
  });

  it("hands the sealed tape to the handoff with the faulting frame's row, so SAVE TAPE works on it", () => {
    // A faulted run's tape is precisely the evidence the instrument exists to
    // collect. The faulting frame's row reaches the recorder before the bytes
    // are captured, exactly as the end-by-play path records its death frame.
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS * 2));
    breakRun(screen);
    screen.update(frame(TICK_MS));

    const bytes = runHandoff.readTape();
    expect(bytes).not.toBeNull();
    const { tape } = decodeTape(bytes!);
    expect(tape.trailer).toMatchObject({
      ending: null,
      stop: "faulted",
      integrity: "faulted",
    });
    const rows = frameObservations(tape);
    expect(rows[rows.length - 1]).toMatchObject({
      reason: "live",
      tickIndex: 2,
      ticksExecuted: 1,
    });
    expect(faultObservations(tape).map((row) => row.identity)).toContain(
      "no NaN",
    );

    const end = new EndScreen();
    end.prepare();
    expect(end["saveButton"].visible).toBe(true);
    end["saveTape"]();
    expect(saveTapeFile).toHaveBeenCalledWith(
      bytes,
      tapeFileName(screen["run"]!.seed, COMMIT_HASH),
    );
    screen.reset();
  });

  it("keeps the frames after the stop out of the exported bytes, held by the ending guard", () => {
    // The evidence the deferred "stopped" frame reason was judged on: the
    // bytes are captured on the stop frame itself, so no frame between the
    // fatal stop and the end state exists in the exported artifact, and the
    // frames the run then spends on its own end state stay in the recorder
    // only, held and named by the same guard as an end by play.
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS));
    breakRun(screen);
    screen.update(frame(TICK_MS));
    const exported = frameObservations(decodeTape(runHandoff.readTape()!).tape);

    screen.update(frame(TICK_MS));
    screen.update(frame(TICK_MS));

    expect(
      frameObservations(decodeTape(runHandoff.readTape()!).tape),
    ).toHaveLength(exported.length);
    const recorded = frameObservations(tapeOf(screen["recorder"]!));
    expect(recorded).toHaveLength(exported.length + 2);
    expect(recorded[recorded.length - 1]).toMatchObject({
      reason: "ending",
      tickIndex: null,
      ticksExecuted: 0,
    });
    screen.reset();
  });

  it("retries a failed navigation without re-capturing, so the artifact stays frozen at the stop", async () => {
    // The retry is navigation-only. Re-entering the capture would re-encode
    // the tape and re-record the handoff on every failing frame, folding the
    // post-stop frames into the exported bytes; and the ending latch stays up
    // across the failure, so no post-stop frame ever reads live or steps the
    // stopped run.
    showScreen.mockRejectedValue(new Error("no screen"));
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS));
    breakRun(screen);
    screen.update(frame(TICK_MS));
    const exported = runHandoff.readTape();
    expect(exported).not.toBeNull();
    await settleNavigation();

    screen.update(frame(TICK_MS));
    await settleNavigation();
    screen.update(frame(TICK_MS));

    expect(showScreen).toHaveBeenCalledTimes(3);
    // The very same bytes: the handoff was recorded once and never again.
    expect(runHandoff.readTape()).toBe(exported);
    expect(frameObservations(decodeTape(exported!).tape)).toHaveLength(2);
    // The run held still, and the frames spent retrying read as what they
    // are, recorder-only ending frames.
    expect(screen["run"]!.tick).toBe(2);
    const retrying = frameObservations(tapeOf(screen["recorder"]!)).slice(-2);
    expect(retrying).toHaveLength(2);
    for (const row of retrying) {
      expect(row).toMatchObject({ reason: "ending", ticksExecuted: 0 });
    }
    screen.reset();
  });
});

describe("a recoverable fault shows live on the HUD (dispatch 6a)", () => {
  beforeEach(() => {
    keyHandlers.clear();
    canvasListeners.clear();
    navigation.currentPopup = undefined;
    showScreen.mockReset().mockResolvedValue(undefined);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  /** A corpse no rule produces, far from the grave, so freshness in range fires while the run plays on. */
  function rotCorpse(screen: GameScreen): void {
    const corpse = screen["run"]!.corpses[0];
    corpse.alive = true;
    corpse.id = 1;
    corpse.x = 50;
    corpse.y = 50;
    corpse.freshness = 5;
  }

  it("appears when the first recoverable fault fires, and the run continues", () => {
    // ADR 0017 ruling C: live, on the HUD, while the run continues, so Mark
    // never spends minutes evaluating feel without knowing the run's tuning
    // evidence may be compromised. Never a modal, an interruption or a
    // dedicated debugging surface, and it terminates nothing in any build.
    const screen = new GameScreen();
    screen.prepare();
    screen.update(frame(TICK_MS));
    expect(screen["faultLabel"].text).toBe("");

    rotCorpse(screen);
    screen.update(frame(TICK_MS));

    expect(screen["faultLabel"].text).toBe("FAULT freshness in range");
    expect(screen["execution"]!.stop).toBeNull();
    expect(showScreen).not.toHaveBeenCalled();

    screen.update(frame(TICK_MS * 2));
    expect(screen["run"]!.tick).toBe(4);
    screen.reset();
  });

  it("stays for the rest of the run after the fault stops firing", () => {
    const screen = new GameScreen();
    screen.prepare();
    rotCorpse(screen);
    screen.update(frame(TICK_MS));
    expect(screen["faultLabel"].text).toBe("FAULT freshness in range");

    screen["run"]!.corpses[0].alive = false;
    screen.update(frame(TICK_MS * 3));

    expect(screen["faultLabel"].text).toBe("FAULT freshness in range");
    screen.reset();
  });

  it("starts a pooled screen's next run with a clean line", () => {
    const screen = new GameScreen();
    screen.prepare();
    rotCorpse(screen);
    screen.update(frame(TICK_MS));
    expect(screen["faultLabel"].text).not.toBe("");

    screen.reset();
    screen.prepare();

    expect(screen["faultLabel"].text).toBe("");
    screen.reset();
  });
});
