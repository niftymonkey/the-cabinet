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
import { FIELD_HEIGHT, FIELD_WIDTH } from "../../game/field";
import { MOB_TYPES } from "../../game/mobs";
import { SIZE_FLOOR } from "../../game/tuning";
import { pauseActions, PausePopup } from "../popups/PausePopup";
import { runHandoff } from "../runHandoff";
import { SettingsPopup } from "../popups/SettingsPopup";
import { EndScreen } from "./EndScreen";
import { STONES_BY_LEVEL } from "../../game/lines/headstones";
import { GameScreen } from "./game/GameScreen";
import { TitleScreen } from "./TitleScreen";

const keyHandlers = new Set<(event: KeyboardEvent) => void>();

/** The URL the game screen reads its seed and starting size off (ADR 0012). */
const fakeLocation = { search: "", hash: "" };

// The screens bind their keys on window, which node does not have.
Object.defineProperty(globalThis, "window", {
  value: {
    addEventListener: (_type: string, handler: (e: KeyboardEvent) => void) =>
      keyHandlers.add(handler),
    removeEventListener: (_type: string, handler: (e: KeyboardEvent) => void) =>
      keyHandlers.delete(handler),
    location: fakeLocation,
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
    runHandoff.record({ seed: 3, ticks: 12780, ending: "victory" });
    screen.prepare();
    expect(screen["title"].text).toBe("THE STAGE SURVIVED");

    runHandoff.record({ seed: 3, ticks: 400, ending: "sealed" });
    screen.prepare();
    expect(screen["title"].text).toBe("SEALED SHUT");

    runHandoff.record({ seed: 3, ticks: 400, ending: null });
    screen.prepare();
    expect(screen["title"].text).toBe("THE RUN IS OVER");
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
