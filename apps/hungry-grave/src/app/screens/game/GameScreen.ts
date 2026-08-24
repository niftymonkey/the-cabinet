import type { FederatedPointerEvent, Ticker } from "pixi.js";
import { BlurFilter, Container, Graphics, Rectangle } from "pixi.js";

import type { CommandSource } from "../../../game/advance";
import { advance } from "../../../game/advance";
import type { Clock } from "../../../game/clock";
import { createClock } from "../../../game/clock";
import type { Execution } from "../../../game/execution";
import { createExecution, devBrokenHandler } from "../../../game/execution";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../../../game/field";
import type { SimEvent } from "../../../game/events";
import type { RunState } from "../../../game/run";
import { createRun } from "../../../game/run";
import { RESERVOIR_CAPACITY } from "../../../game/tuning";
import { KeySteer } from "../../../input/keys";
import { combineSteer } from "../../../input/steering";
import { TouchSteer } from "../../../input/touch";
import { meterLinePosition, METER_FONT_SIZE } from "../../FpsMeter";
import { engine } from "../../getEngine";
import type { FieldPlacement } from "../../layout";
import {
  BOUNDARY_STROKE,
  DEGENERATE_PLACEMENT,
  fitField,
  READOUT_RESERVE,
  screenToField,
} from "../../layout";
import { PALETTE } from "../../palette";
import { pauseActions, PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { runHandoff, summarizeRun } from "../../runHandoff";
import { playFor } from "../../sound";
import { invariantsFromUrl, seedFromUrl, sizeFromUrl } from "../../seedFromUrl";
import { Button } from "../../ui/Button";
import { Label } from "../../ui/Label";
import { bindKeyPress } from "../../utils/bindKeyPress";
import { userSettings } from "../../utils/userSettings";
import { EndScreen } from "../EndScreen";
import { BELCH_SIZE, BelchButton } from "./BelchButton";
import { FieldRenderer } from "./FieldRenderer";
import { GraveRenderer } from "./GraveRenderer";
import { FieldLayers } from "./layering";
import { StormRenderer } from "./StormRenderer";

/** The codes the page would otherwise scroll on. Space joins them so the page cannot scroll under a belch. */
const SCROLL_CODES = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
];

/**
 * The belch's keyboard binding, as physical codes.
 *
 * Space is the free, unambiguous key on this layout: there is no manual shot to
 * bind it to, Shift is already focus, and WASD and the arrows are steering. KeyX
 * rides alongside it for the Touhou muscle memory, where X is the bomb.
 */
const BELCH_CODES = ["Space", "KeyX"];

/** The pointer kinds TouchSteer is reasoned about in. A mouse steers with the keyboard by design. */
const STEERING_POINTERS = ["touch", "pen"];

/**
 * How far a finger must travel to be the steering pointer, in stage units. It
 * is converted to field units against the live placement, because a
 * finger-jitter threshold is physical and a field-unit constant bakes in one
 * viewport. It is 3 CSS pixels wherever the stage is not itself scaled up, and
 * about 2.2 on a 390-wide phone, where it is.
 */
const STEER_SLOP_STAGE_UNITS = 3;

/** The pause button's size, in stage units. Its corner inset comes from the readout reserve, which is what layout.ts fits the field around. */
const PAUSE_WIDTH = 132;
const PAUSE_HEIGHT = 68;

/**
 * How long resume counts down for, in milliseconds.
 *
 * pause() calls cancelAll(), so resuming drops the player into a live field
 * with no drag anchor and a full STEER_SLOP crossing before anything moves.
 * That was free on an empty field and it is not free now that something can
 * kill you. The count exists so a thumb can get down before it matters, and
 * touch and keyboard are both live while it runs.
 */
const COUNTDOWN_MS = 3000;

/**
 * When the pause blur clears, in milliseconds remaining. The blur is held
 * through three and two and cleared on one: a countdown over a frozen, sharp
 * field would hand the player three free seconds to study the curtain, and this
 * record has twice called that blur load-bearing against exactly that line. One
 * second of sharp static field is ample to re-find the grave and far too short
 * to plan a route through a wave.
 */
const COUNTDOWN_CLEAR_BLUR_MS = 1000;

/** How strong the countdown's blur is. It is the pause menu's own strength, because it is the same read continuing. */
const COUNTDOWN_BLUR_STRENGTH = 5;

/**
 * The layers the countdown blurs. The grave and its rim are spared, exactly as
 * ADR 0014's hit dim spares them: re-finding the grave is what the countdown
 * exists for, so blurring it would defeat its own purpose, and the hit dim's
 * rule already settles the principle that the channel a player is being asked
 * to re-read is never occluded.
 */
const BLURRED_LAYERS = ["mobBodies", "mobFire", "corpses", "treasure"] as const;

/**
 * One BlurFilter for the whole app, built on first use and then reused.
 *
 * The countdown fires on every resume and every return from a backgrounded tab,
 * and an instance per countdown was allocated and never destroyed. Sharing one
 * is Pixi's own guidance.
 *
 * It is built on demand inside a try rather than at module load. Constructing a
 * BlurFilter compiles a shader, which needs a document, and under node there is
 * none: at module load that throws on import and takes every screen test with
 * it, and inside the countdown it threw into a promise and surfaced as the
 * standing unhandled rejection this dispatch was asked to clear.
 *
 * Only success is remembered. A failure is not, because whether the shader can
 * be compiled is a property of the environment at that moment rather than of
 * this module, and caching the first failure would leave the field unblurred
 * for the rest of the session on the strength of one early attempt. Where no
 * shader can be compiled the field simply does not blur, which is the only
 * sensible answer there.
 */
let sharedBlur: BlurFilter | null = null;

function fieldBlur(): BlurFilter | null {
  if (sharedBlur !== null) return sharedBlur;
  try {
    sharedBlur = new BlurFilter({ strength: COUNTDOWN_BLUR_STRENGTH });
  } catch {
    return null;
  }
  return sharedBlur;
}

/**
 * The playfield's boundary readout. The engine's background and the field's
 * ground are both night, so this outline is the only visible edge of the field,
 * and that edge is the bound on the grave's movement. That makes it a readout
 * and not scenery, which is why it carries a contrast floor of its own and a
 * width the floor depends on. It strokes inward so the whole of it stays inside
 * the field's own 540 by 760.
 */
function boundaryReadout(): Graphics {
  return new Graphics().rect(0, 0, FIELD_WIDTH, FIELD_HEIGHT).stroke({
    width: BOUNDARY_STROKE,
    color: PALETTE.fieldFrame.hex,
    alignment: 1,
  });
}

/**
 * The field's clip, exactly the field rect and nothing else.
 *
 * The sim legitimately holds mobs outside the field: a template may place a
 * file up to MAX_ENTRY_DEPTH above the top edge, and a mob is only culled once
 * it is a margin past an edge. Nothing else clipped them, so that off-field
 * approach drew into the letterbox. It shows on a phone and not on a desktop
 * because the field is width-limited on a tall viewport, which is the only
 * case with vertical letterbox for it to draw into.
 *
 * The rect matches boundaryReadout's, and the frame's stroke is inside-aligned,
 * so the clip takes nothing off the frame it shares an edge with.
 *
 * fill() is called bare on purpose. A mask is sampled for coverage and never
 * for colour, so naming one here would be a colour that reaches the field's
 * source and means nothing, which is exactly what palette.test.ts's literal
 * scan is there to stop. The bare call takes Pixi's opaque default.
 */
function fieldClip(): Graphics {
  return new Graphics().rect(0, 0, FIELD_WIDTH, FIELD_HEIGHT).fill();
}

/** One line of the corner readout stack, in the shared size and anchored to its top-left. */
function stackLine(index: number): Label {
  const label = new Label({
    style: {
      fontFamily: "monospace",
      fill: PALETTE.hudDim.hex,
      fontSize: METER_FONT_SIZE,
    },
  });
  // Label centres itself by default, so a line that inherited that would sit
  // on the x where the FPS line starts rather than beginning there.
  label.anchor.set(0, 0);
  const at = meterLinePosition(index);
  label.position.set(at.x, at.y);
  return label;
}

/**
 * The screen a run plays on. Render only: it owns this run's state and shows
 * it, and holds no game rules. The rules live in src/game and reach the screen
 * through advance(), which converts one frame's elapsed time into whole ticks.
 */
export class GameScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ["main"];

  /**
   * The field, carrying exactly the placement fitField returns and nothing
   * else. Screen shake, if it is ever added, goes on a child of this container:
   * screenToField recomputes the placement in parallel with this transform, and
   * the two agree only while this transform is the placement alone. Shake
   * applied here would break touch input silently, with every test still green.
   */
  private readonly field: Container;
  private readonly layers: FieldLayers;

  /**
   * The boundary readout, held rather than rebuilt. reset() empties the layers,
   * so the frame has to be put back, and putting back this instance keeps a
   * pooled screen from allocating a new Graphics on every run.
   */
  private readonly frame: Graphics;

  /**
   * The field's clip. It is a child of the field so it inherits the placement,
   * and it is built once in the constructor rather than in dressField because
   * a mask is not a layer: layers.clear() cannot reach it and pooling cannot
   * drop it.
   */
  private readonly clip: Graphics;
  private readonly grave: GraveRenderer;
  private readonly fieldRenderer = new FieldRenderer();
  private readonly stormRenderer = new StormRenderer();

  private readonly debtLabel: Label;
  private readonly tickLabel: Label;
  private readonly seedLabel: Label;
  private readonly sizeLabel: Label;
  private readonly countdownLabel: Label;
  private readonly pauseButton: Button;
  private readonly belchButton: BelchButton;

  private readonly keys: KeySteer;
  private readonly touch = new TouchSteer();
  private clock: Clock = createClock();

  /**
   * The live placement, held rather than recomputed. A pointer handler converts
   * an event through screenToField with this exact value: calling fitField a
   * second time at event time computes the placement in parallel, and the two
   * agree only until something moves one of them.
   */
  private placement: FieldPlacement = DEGENERATE_PLACEMENT;
  private run: RunState | null = null;
  /**
   * The one authority every tick of this run crosses (ADR 0017).
   *
   * Its lifetime is the run's, so it is made in startRun() beside the run and
   * cleared in reset() beside it. This screen is pooled, and a pooled screen
   * leaks anything nobody explicitly clears; carried across runs, its stage
   * watch would compare run two's first phase against run one's last and its
   * fault history would belong to a run that is over.
   */
  private execution: Execution | null = null;
  private releaseKeys: (() => void) | null = null;
  private releaseListeners: (() => void) | null = null;
  private ending = false;
  /**
   * The two reasons the sim holds still, kept apart rather than as one flag.
   * They are independent: a popup can open, the tab can then be switched away
   * from and back, and the popup is still up. With one flag the focus hook
   * cleared it and the sim ran on under the blurred menu with the keyboard
   * still steering, which is section 4.8's invariant broken and the tick-debt
   * lie takeElapsed exists to prevent.
   */
  private menuPaused = false;
  private backgrounded = false;
  /**
   * The navigation transition opening the pause menu, while navigation has not
   * taken it up yet. presentPopup assigns currentPopup only after awaiting this
   * screen's async pause(), so a second Escape inside that window reads no
   * popup, asks again, and presentPopup hides the opening menu, returns it to
   * the pool and animates a fresh one back in: the tear-down-and-reanimate the
   * popup guard exists to prevent. Escape auto-repeats while it is held.
   *
   * The transition itself is the guard, rather than a flag it sets, because
   * this screen is pooled and the promise can settle after reset() and the next
   * prepare() have run. A flag would be lowered there by an abandoned run's
   * cleanup, leaving the new run unguarded while its own menu is still
   * animating in. Identity answers "is this still the transition I am waiting
   * on" without a second field for prepare() to keep in step. Unreachable while
   * End Run inside the menu is the only way to end a run; a death landing
   * mid-animation reaches it in dispatch 4.
   */
  private menuTransition: Promise<void> | null = null;
  private skipElapsed = false;
  private shownDebt: number | null = null;
  private shownTick: number | null = null;
  /**
   * Milliseconds left of the resume countdown, or null when the field is live.
   * It is per-run mutable state with a timer in it on a pooled screen, so
   * prepare() and reset() both clear it.
   */
  private countdownMs: number | null = null;
  private shownCount: number | null = null;
  /**
   * A belch asked for and not yet spent. It is read and cleared inside the
   * command closure, which is only called when a tick actually runs, so a press
   * during a zero-tick frame survives to the next one rather than being eaten.
   *
   * It is per-run mutable state on a pooled screen, which is the class of defect
   * this app has shipped five times, so prepare(), reset() and goQuiet() all
   * clear it.
   */
  private belchRequested = false;

  /**
   * Whether this run checks the sim invariants on every tick (ADR 0017).
   *
   * On unless ?invariants=off asks otherwise. The checks are always on in every
   * build a player is handed; the switch is a temporary experimental control on
   * the instrumentation build, so the confirming play's checks-off and checks-on
   * readings come off one instrument and can be differenced.
   *
   * prepare() writes it on every run rather than the constructor writing it
   * once, because it is per-run state on a pooled screen, which is the class of
   * defect this app has shipped five times.
   */
  private checkingInvariants = true;

  constructor() {
    super();

    this.field = new Container();
    // _interactivePrune skips a passive container whose interactiveChildren is
    // false, and Container's default eventMode is passive, so this one line
    // prunes the field, the layer root and all eleven layers out of
    // hitTestMoveRecursive on every pointer move. The layers carry every mob
    // body, corpse and mob-fire sprite on the field, so that is the whole
    // field's worth of children skipped rather than a handful.
    this.field.interactiveChildren = false;
    this.layers = new FieldLayers();
    this.layers.addTo(this.field);
    this.clip = fieldClip();
    this.field.addChild(this.clip);
    this.field.mask = this.clip;
    this.frame = boundaryReadout();
    this.grave = new GraveRenderer();
    this.dressField();

    this.debtLabel = stackLine(1);
    this.tickLabel = stackLine(2);
    this.seedLabel = stackLine(3);
    this.sizeLabel = stackLine(4);
    this.countdownLabel = new Label({
      style: {
        fontFamily: "monospace",
        fill: PALETTE.hudInk.hex,
        fontSize: 72,
      },
    });
    this.countdownLabel.visible = false;

    this.pauseButton = new Button({
      text: "PAUSE",
      width: PAUSE_WIDTH,
      height: PAUSE_HEIGHT,
      fontSize: 18,
    });
    this.pauseButton.onPress.connect(() => this.togglePause());
    this.belchButton = new BelchButton(() => this.requestBelch());

    this.addChild(
      this.field,
      this.debtLabel,
      this.tickLabel,
      this.seedLabel,
      this.sizeLabel,
      this.countdownLabel,
      this.pauseButton,
      this.belchButton,
    );

    this.keys = new KeySteer({ multiplier: userSettings.getKeyboardSpeed() });

    // Pixi's own handlers go in the constructor and never in prepare():
    // screens are pooled, so a .on added in prepare without a matching .off
    // gives the second run two handlers and the third three, and the lifecycle
    // test counts only window handlers and cannot see it.
    this.eventMode = "static";
    this.on("pointerdown", this.onPointerDown, this);
    this.on("globalpointermove", this.onPointerMove, this);
    this.on("pointerup", this.onPointerUp, this);
    this.on("pointerupoutside", this.onPointerUp, this);
  }

  /** The field's own furniture, put back after any clear() (see reset). */
  private dressField(): void {
    this.layers.layer("fieldBoundary").addChild(this.frame);
    this.fieldRenderer.attach(this.layers);
    this.stormRenderer.attach(this.layers);
    this.grave.attach(this.layers);
  }

  /** A belch asked for, by the button or by the keyboard. */
  private requestBelch(): void {
    this.belchRequested = true;
  }

  public prepare() {
    this.ending = false;
    this.menuPaused = false;
    this.backgrounded = false;
    this.menuTransition = null;
    this.skipElapsed = false;
    this.clock = createClock();
    this.shownDebt = null;
    this.shownTick = null;
    // A pooled screen must not inherit the previous run's held keys, drag
    // anchor or blur.
    this.keys.releaseAll();
    this.keys.setMultiplier(userSettings.getKeyboardSpeed());
    this.touch.cancelAll();
    this.filters = [];
    // The engine takes this screen's children away on the way out and never
    // gives them back. showScreen and hideAndRemoveScreen both set
    // interactiveChildren false, and addAndShowScreen only restores it inside
    // `if (screen.show)`, which this screen does not declare. Left alone, every
    // run after the first has a dead pause button while the stage-wide hitArea
    // goes on steering the grave, so the game looks alive and cannot be paused.
    this.interactiveChildren = true;

    this.countdownMs = null;
    this.shownCount = null;
    this.countdownLabel.visible = false;
    this.belchRequested = false;
    this.belchButton.release();
    this.clearFieldBlur();

    this.checkingInvariants = invariantsFromUrl(
      window.location.search,
      window.location.hash,
    );
    this.run = this.startRun();
    this.execution = this.startExecution(this.run);
    this.syncScreen(this.run);
    this.syncReadouts();

    pauseActions.setEndRun(() => this.endRun());
    this.releaseKeys = bindKeyPress("Escape", () => this.togglePause());
    this.releaseListeners = this.listen();
  }

  /**
   * The run the URL asks for (ADR 0012). undefined and not null for the seed,
   * because createRun's default parameter is what rolls the fresh dice.
   */
  private startRun(): RunState {
    const search = window.location.search;
    const hash = window.location.hash;
    const seed = seedFromUrl(search, hash);
    const size = sizeFromUrl(search, hash);
    // The size goes in rather than being written afterwards: ADR 0003's floor
    // and ceiling are grave.ts's to hold, and hitGrave is then the only thing
    // outside it that changes size at all.
    const run = createRun(seed ?? undefined, size ?? undefined);

    this.seedLabel.text =
      seed === null ? `SEED ${run.seed}` : `SEED ${run.seed} PINNED`;
    this.sizeLabel.text = size === null ? "" : `SIZE ${run.grave.size} PINNED`;
    return run;
  }

  /**
   * The authority this run's ticks cross (ADR 0017), made here because its
   * lifetime is the run's.
   *
   * The broken-invariant handler is a notification and never the decider: the
   * authority sets the stop reason, and only the build decides how loud a fault
   * is. import.meta.env.DEV is a stand-in for that choice until the two deployed
   * build flavours exist, and it is what keeps the handler's debugger statement
   * out of a built bundle.
   */
  private startExecution(run: RunState): Execution {
    return createExecution(run, {
      checking: this.checkingInvariants,
      onBroken: import.meta.env.DEV ? devBrokenHandler : undefined,
    });
  }

  /**
   * Every listener a run holds outside pixi, added here and released together.
   * The canvas pointercancel listener is a real DOM one because Pixi v8 does
   * not carry the event: EventSystem attaches pointermove, pointerdown,
   * pointerleave, pointerover, pointerup and wheel, and EventBoundary's mapping
   * table has no pointercancel entry at all. When iOS takes a gesture away it
   * fires pointercancel and then never sends pointerup, so without this the
   * drag target goes stale and the grave parks on it and cannot leave, and the
   * belch button's claim outlives the finger that made it.
   */
  private listen(): () => void {
    const onKeyDown = (event: KeyboardEvent) => this.onKeyDown(event);
    const onKeyUp = (event: KeyboardEvent) => this.keys.release(event.code);
    const onBlur = () => this.keys.releaseAll();
    const onPointerCancel = () => {
      this.touch.cancelAll();
      this.belchButton.release();
    };
    const canvas = engine().canvas;

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    canvas?.addEventListener("pointercancel", onPointerCancel);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      canvas?.removeEventListener("pointercancel", onPointerCancel);
    };
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (SCROLL_CODES.includes(event.code)) event.preventDefault();
    // The belch is not a steering command, so it never reaches KeySteer: the
    // one-shot edge belongs to the screen, and the key's auto-repeat is
    // harmless because fireBelch does nothing below a full reservoir.
    if (BELCH_CODES.includes(event.code)) this.requestBelch();
    this.keys.press(event.code);
  }

  public reset() {
    this.releaseKeys?.();
    this.releaseKeys = null;
    this.releaseListeners?.();
    this.releaseListeners = null;
    pauseActions.setEndRun(null);
    this.keys.releaseAll();
    this.touch.cancelAll();
    // The pause menu sets a BlurFilter on this screen and only its own hide()
    // clears it, so a run ended from inside the menu would otherwise come back
    // out of the pool permanently blurred, paying a full-screen blur pass every
    // frame. Two mechanisms for a defect this quiet is the right number.
    this.filters = [];
    this.clearFieldBlur();
    this.countdownMs = null;
    this.countdownLabel.visible = false;
    this.belchRequested = false;
    this.belchButton.release();
    this.run = null;
    this.execution = null;
    // The field renderer is not detached here. reset() clears the layers and
    // dressField() is the one place that puts renderers back, so a renderer
    // detached here would leave the second run out of the pool with no field
    // renderer at all, and the lifecycle test would go green on exactly that.
    this.layers.clear();
    this.dressField();
  }

  /**
   * One frame of real time, spent as whole ticks (ADR 0015).
   *
   * elapsedMS and never deltaMS: Pixi assigns the raw gap to elapsedMS and
   * clamps only deltaMS to its _maxElapsedMS of 100, so feeding deltaMS makes
   * clock.ts's own clamp unreachable, pins debtTicks at zero forever, and lets
   * a change to the ticker's speed silently rescale the sim.
   *
   * The keyboard is sampled once per frame because it is a true velocity. The
   * drag is recomputed inside the closure on every tick because it is a
   * position error, and applying one twice doubles the travel.
   */
  public update(ticker: Ticker) {
    const execution = this.execution;
    if (
      this.ending ||
      this.menuPaused ||
      this.backgrounded ||
      !this.run ||
      !execution
    ) {
      return;
    }
    if (this.countdownMs !== null) {
      this.countDown(this.takeElapsed(ticker.elapsedMS));
      return;
    }
    const keyCommand = this.keys.command();
    const source: CommandSource = (grave) => {
      // Read and cleared here rather than in advance: the closure is only
      // called when a tick runs, so this is the one place that can tell a frame
      // that bought ticks from one that did not.
      const belch = this.belchRequested;
      this.belchRequested = false;
      return { move: combineSteer(keyCommand, this.touch, grave), belch };
    };
    const events = advance(
      execution,
      this.clock,
      this.takeElapsed(ticker.elapsedMS),
      source,
    );
    this.announce(this.run, events);
    this.syncScreen(this.run);
    this.syncReadouts();
    if (endedIn(events)) this.endRun();
  }

  /**
   * Everything on screen, from the run the sim just advanced. The grave is
   * handed a number from 0 to 1 and never the RunState, because handing a
   * renderer live sim state is what the rest of this design works to avoid.
   */
  private syncScreen(run: RunState): void {
    this.grave.sync(run.grave, run.reservoir / RESERVOIR_CAPACITY, run.tick);
    this.fieldRenderer.sync(run);
    this.stormRenderer.sync(run);
    this.belchButton.sync(run.reservoir >= RESERVOIR_CAPACITY, run.tick);
  }

  /**
   * This frame's events, handed to everything that answers them.
   *
   * This is the one line that used to drop every event on the floor except the
   * run-ending check, and it is where sound subscribes and where the two
   * momentary effects that have no sim entity behind them are started.
   */
  private announce(run: RunState, events: readonly SimEvent[]): void {
    for (const event of events) {
      playFor(event);
      if (event.type === "belched") this.stormRenderer.erupt(run);
      if (event.type === "splashed") this.stormRenderer.splashed(run);
    }
  }

  /**
   * One frame of the resume countdown. The sim does not advance while it runs,
   * and the elapsed time is spent here rather than being handed to the clock,
   * so the tick-debt readout keeps telling the truth across a pause.
   */
  private countDown(elapsedMs: number): void {
    if (this.countdownMs === null) return;
    this.countdownMs -= elapsedMs;
    if (this.countdownMs <= COUNTDOWN_CLEAR_BLUR_MS) this.clearFieldBlur();
    if (this.countdownMs <= 0) {
      this.countdownMs = null;
      this.shownCount = null;
      this.countdownLabel.visible = false;
      return;
    }
    const showing = Math.ceil(this.countdownMs / 1000);
    if (showing === this.shownCount) return;
    this.shownCount = showing;
    this.countdownLabel.text = `${showing}`;
  }

  /**
   * Starts the count, unless the pause menu is up or on its way up. The guard
   * is the transition itself and never a flag a pooled run can lower: focus()
   * can fire while the menu is still up, which would either run a countdown
   * behind the menu or stack a second one on resume.
   */
  private startCountdown(): void {
    if (this.menuPaused || this.menuTransition !== null) return;
    this.countdownMs = COUNTDOWN_MS;
    this.shownCount = null;
    this.countdownLabel.text = `${Math.ceil(COUNTDOWN_MS / 1000)}`;
    this.countdownLabel.visible = true;
    this.setFieldBlur();
  }

  /** The threat layers, blurred. The grave and its rim are spared, so the player can re-find them. */
  private setFieldBlur(): void {
    const blur = fieldBlur();
    if (blur === null) return;
    blur.enabled = true;
    for (const name of BLURRED_LAYERS) {
      this.layers.layer(name).filters = [blur];
    }
  }

  private clearFieldBlur(): void {
    for (const name of BLURRED_LAYERS) this.layers.layer(name).filters = [];
  }

  /**
   * This frame's elapsed time, or none at all on the first frame back from a
   * pause or a backgrounded tab.
   *
   * Skipping the frame is the fix and resetting the clock is not. The
   * backgrounded gap does not live in the accumulator's remainder: it lives in
   * Pixi's Ticker.lastTime, which no game-side call can reach and which does
   * not advance while rAF is paused, so the first frame back hands ticksFor the
   * whole gap. A 30-second tab switch would add 1785 to debtTicks and the
   * readout would then lie for the rest of the run.
   */
  private takeElapsed(elapsedMs: number): number {
    if (!this.skipElapsed) return elapsedMs;
    this.skipElapsed = false;
    return 0;
  }

  /** Each readout writes only when its own number changes, as the meter already does. */
  private syncReadouts(): void {
    if (!this.run) return;
    if (this.clock.debtTicks !== this.shownDebt) {
      this.shownDebt = this.clock.debtTicks;
      // Zero reads rather than hides: an absent readout and a healthy one look
      // the same, and this is the only readout that separates "the game feels
      // slow" from "we blew the frame budget" on a phone.
      this.debtLabel.text = `DEBT ${this.shownDebt}`;
    }
    if (this.run.tick !== this.shownTick) {
      this.shownTick = this.run.tick;
      this.tickLabel.text = `TICK ${this.shownTick}`;
    }
  }

  public resize(width: number, height: number) {
    this.placement = fitField(width, height, READOUT_RESERVE);
    this.field.position.set(this.placement.offsetX, this.placement.offsetY);
    this.field.scale.set(this.placement.scale);
    // The whole stage, so a drag that starts outside the letterboxed field
    // still steers.
    this.hitArea = new Rectangle(0, 0, width, height);
    this.touch.setSlop(STEER_SLOP_STAGE_UNITS / this.placement.scale);
    // Positioned from the reserve layout.ts fits the field around, so the two
    // cannot drift and the non-overlap invariant is one rule in one place.
    this.pauseButton.position.set(
      width - READOUT_RESERVE.margin - PAUSE_WIDTH / 2,
      READOUT_RESERVE.margin + PAUSE_HEIGHT / 2,
    );
    this.countdownLabel.position.set(width / 2, height / 2);
    // Bottom right, from the same reserve the pause button is positioned from,
    // so the two cannot drift apart and the non-overlap rule stays one rule in
    // one place. It sits over the field: Mark ruled on 2026-08-22 that the
    // field never pays width for a readout.
    this.belchButton.position.set(
      width - READOUT_RESERVE.margin - BELCH_SIZE / 2,
      height - READOUT_RESERVE.margin - BELCH_SIZE / 2,
    );
  }

  /** A finger landing, in field units. A mouse is filtered out: desktop steering is the keyboard by design. */
  private onPointerDown(event: FederatedPointerEvent): void {
    // A tap on the pause button propagates root to target and would otherwise
    // anchor a drag as well, which is the defect the old END RUN button had.
    if (event.target !== this) return;
    if (!this.steersWith(event) || !this.run) return;
    // A press that started on the belch button never becomes the steering
    // pointer, so a thumb that rolls off it does not drag the grave.
    if (this.belchButton.owns(event.pointerId)) return;
    this.touch.down(event.pointerId, this.toField(event), this.run.grave);
  }

  private onPointerMove(event: FederatedPointerEvent): void {
    if (!this.steersWith(event)) return;
    if (this.belchButton.owns(event.pointerId)) return;
    this.touch.move(event.pointerId, this.toField(event));
  }

  private onPointerUp(event: FederatedPointerEvent): void {
    if (!this.steersWith(event)) return;
    this.touch.up(event.pointerId);
  }

  private steersWith(event: FederatedPointerEvent): boolean {
    return STEERING_POINTERS.includes(event.pointerType);
  }

  private toField(event: FederatedPointerEvent): { x: number; y: number } {
    return screenToField(this.placement, event.global.x, event.global.y);
  }

  /**
   * Escape opens the pause menu, returns to it from Settings, and closes it.
   *
   * Without the popup guard a second Escape reaches presentPopup, which hides
   * the menu, returns it to the pool and animates a fresh one back in, still
   * paused. The guard is two parts, because navigation's own currentPopup is
   * not set for the whole of the opening: menuTransition covers that window.
   *
   * Escape inside Settings is the same door as Settings' OK: both go back to
   * the pause menu, because presentPopup replaces rather than stacks, so
   * dismissing from Settings would drop the player into live play holding
   * nothing, on the very flow the speed slider exists for.
   */
  private togglePause(): void {
    const navigation = engine().navigation;
    const popup = navigation.currentPopup;
    const opensMenu = !popup || popup instanceof SettingsPopup;
    if (opensMenu && this.menuTransition) return;
    const change = opensMenu
      ? navigation.presentPopup(PausePopup)
      : navigation.dismissPopup();
    this.menuTransition = opensMenu ? change : null;
    change
      .catch((error) => console.error(error))
      .finally(() => {
        // Only this transition's own guard, never whatever a later run is
        // waiting on.
        if (this.menuTransition === change) this.menuTransition = null;
      });
  }

  /** A lost keyup or a drag interrupted by a popup must not survive into the resumed run. */
  private goQuiet(): void {
    this.keys.releaseAll();
    this.touch.cancelAll();
    this.belchRequested = false;
    this.belchButton.release();
    this.countdownMs = null;
    this.shownCount = null;
    this.countdownLabel.visible = false;
  }

  /** The first frame back is skipped whichever reason lifted, because either one leaves a gap in Ticker.lastTime. */
  private comeBack(): void {
    this.skipElapsed = true;
    this.keys.setMultiplier(userSettings.getKeyboardSpeed());
    // A tab return is the identical hazard to a resume, arriving without the
    // player having asked for it: goQuiet() cancelled the drag anchor, so the
    // field is live again with nothing under the thumb.
    this.startCountdown();
  }

  public blur(): void {
    this.backgrounded = true;
    this.goQuiet();
  }

  public focus(): void {
    this.backgrounded = false;
    this.comeBack();
  }

  public async pause(): Promise<void> {
    this.menuPaused = true;
    this.goQuiet();
  }

  public async resume(): Promise<void> {
    this.menuPaused = false;
    this.comeBack();
  }

  private endRun() {
    if (this.ending || !this.run) return;
    this.clearFieldBlur();
    this.ending = true;
    runHandoff.record(summarizeRun(this.run));
    engine()
      .navigation.showScreen(EndScreen)
      .catch((error) => {
        // A failed navigation releases the guard: left up it deafens every
        // retry and holds the ticker's work stopped for the rest of the run.
        this.ending = false;
        console.error(error);
      });
  }
}

/** Whether this frame's events ended the run, either way (ADR 0003 and ADR 0007). */
function endedIn(events: readonly SimEvent[]): boolean {
  return events.some(
    (event) => event.type === "sealed" || event.type === "victory",
  );
}
