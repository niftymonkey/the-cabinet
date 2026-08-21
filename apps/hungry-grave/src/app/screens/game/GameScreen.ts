import type { FederatedPointerEvent, Ticker } from "pixi.js";
import { Container, Graphics, Rectangle } from "pixi.js";

import type { SteerSource } from "../../../game/advance";
import { advance } from "../../../game/advance";
import type { Clock } from "../../../game/clock";
import { createClock } from "../../../game/clock";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../../../game/field";
import type { RunState } from "../../../game/run";
import { createRun } from "../../../game/run";
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
  screenToField,
} from "../../layout";
import { PALETTE } from "../../palette";
import { pauseActions, PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { runHandoff, summarizeRun } from "../../runHandoff";
import { seedFromUrl, sizeFromUrl } from "../../seedFromUrl";
import { Button } from "../../ui/Button";
import { Label } from "../../ui/Label";
import { bindKeyPress } from "../../utils/bindKeyPress";
import { userSettings } from "../../utils/userSettings";
import { EndScreen } from "../EndScreen";
import { GraveRenderer } from "./GraveRenderer";
import { FieldLayers } from "./layering";

/** The codes the page would otherwise scroll on. */
const SCROLL_CODES = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

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

/** The pause button's corner inset and size, in stage units. */
const PAUSE_MARGIN = 12;
const PAUSE_WIDTH = 132;
const PAUSE_HEIGHT = 68;

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
  private readonly grave: GraveRenderer;

  private readonly debtLabel: Label;
  private readonly tickLabel: Label;
  private readonly seedLabel: Label;
  private readonly sizeLabel: Label;
  private readonly pauseButton: Button;

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

  constructor() {
    super();

    this.field = new Container();
    // _interactivePrune skips a passive container whose interactiveChildren is
    // false, and Container's default eventMode is passive, so this one line
    // prunes the field, the layer root and all eleven layers out of
    // hitTestMoveRecursive on every pointer move. The layers are empty today
    // and hold every corpse, mob body and bullet from the field dispatch.
    this.field.interactiveChildren = false;
    this.layers = new FieldLayers();
    this.layers.addTo(this.field);
    this.frame = boundaryReadout();
    this.grave = new GraveRenderer();
    this.dressField();

    this.debtLabel = stackLine(1);
    this.tickLabel = stackLine(2);
    this.seedLabel = stackLine(3);
    this.sizeLabel = stackLine(4);

    this.pauseButton = new Button({
      text: "PAUSE",
      width: PAUSE_WIDTH,
      height: PAUSE_HEIGHT,
      fontSize: 18,
    });
    this.pauseButton.onPress.connect(() => this.togglePause());

    this.addChild(
      this.field,
      this.debtLabel,
      this.tickLabel,
      this.seedLabel,
      this.sizeLabel,
      this.pauseButton,
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
    this.layers.layer("ground").addChild(this.frame);
    this.grave.attach(this.layers);
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

    this.run = this.startRun();
    this.grave.sync(this.run.grave);
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
    const run = createRun(seed ?? undefined);
    const size = sizeFromUrl(search, hash);
    if (size !== null) run.grave.size = size;

    this.seedLabel.text =
      seed === null ? `SEED ${run.seed}` : `SEED ${run.seed} PINNED`;
    this.sizeLabel.text = size === null ? "" : `SIZE ${size} PINNED`;
    return run;
  }

  /**
   * Every listener a run holds outside pixi, added here and released together.
   * The canvas pointercancel listener is a real DOM one because Pixi v8 does
   * not carry the event: EventSystem attaches pointermove, pointerdown,
   * pointerleave, pointerover, pointerup and wheel, and EventBoundary's mapping
   * table has no pointercancel entry at all. When iOS takes a gesture away it
   * fires pointercancel and then never sends pointerup, so without this the
   * drag target goes stale and the grave parks on it and cannot leave.
   */
  private listen(): () => void {
    const onKeyDown = (event: KeyboardEvent) => this.onKeyDown(event);
    const onKeyUp = (event: KeyboardEvent) => this.keys.release(event.code);
    const onBlur = () => this.keys.releaseAll();
    const onPointerCancel = () => this.touch.cancelAll();
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
    this.run = null;
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
    if (this.ending || this.menuPaused || this.backgrounded || !this.run) {
      return;
    }
    const keyCommand = this.keys.command();
    const steer: SteerSource = (grave) =>
      combineSteer(keyCommand, this.touch, grave);
    // The events are dropped: nothing in this dispatch produces one, and
    // dispatch 4 is the first producer.
    advance(this.run, this.clock, this.takeElapsed(ticker.elapsedMS), steer);
    this.grave.sync(this.run.grave);
    this.syncReadouts();
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
    this.placement = fitField(width, height);
    this.field.position.set(this.placement.offsetX, this.placement.offsetY);
    this.field.scale.set(this.placement.scale);
    // The whole stage, so a drag that starts outside the letterboxed field
    // still steers.
    this.hitArea = new Rectangle(0, 0, width, height);
    this.touch.setSlop(STEER_SLOP_STAGE_UNITS / this.placement.scale);
    this.pauseButton.position.set(
      width - PAUSE_MARGIN - PAUSE_WIDTH / 2,
      PAUSE_MARGIN + PAUSE_HEIGHT / 2,
    );
  }

  /** A finger landing, in field units. A mouse is filtered out: desktop steering is the keyboard by design. */
  private onPointerDown(event: FederatedPointerEvent): void {
    // A tap on the pause button propagates root to target and would otherwise
    // anchor a drag as well, which is the defect the old END RUN button had.
    if (event.target !== this) return;
    if (!this.steersWith(event) || !this.run) return;
    this.touch.down(event.pointerId, this.toField(event), this.run.grave);
  }

  private onPointerMove(event: FederatedPointerEvent): void {
    if (!this.steersWith(event)) return;
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
  }

  /** The first frame back is skipped whichever reason lifted, because either one leaves a gap in Ticker.lastTime. */
  private comeBack(): void {
    this.skipElapsed = true;
    this.keys.setMultiplier(userSettings.getKeyboardSpeed());
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
