// The screen a run plays on: the named children a run is made of, and the lifecycle they are forwarded.

import type { FederatedPointerEvent, Ticker } from 'pixi.js';
import { Container, Graphics, Rectangle } from 'pixi.js';

import type { SimEvent } from '../../../game/events';
import type { RunState } from '../../../game/run';
import { RESERVOIR_CAPACITY } from '../../../game/tuning';
import type { FrameReason } from '../../../tape/tape';
import type { FieldPlacement } from '../../layout';
import { DEGENERATE_PLACEMENT, fitField, READOUT_RESERVE } from '../../layout';
import type { RendererIdentity } from '../../tapeHeader';
import { runConditionsHere } from '../../tapeHeader';
import { Button } from '../../ui/Button';
import { bindKeyPress } from '../keyBinding';
import { BELCH_SIZE, BelchButton } from './BelchButton';
import { FieldRenderer } from './FieldRenderer';
import { boundaryReadout, fieldClip } from './fieldFrame';
import { createFramePolicy } from './framePolicy';
import { GraveRenderer } from './GraveRenderer';
import { FieldLayers } from './layering';
import type { ResumeCountdown } from './resumeCountdown';
import { createResumeCountdown } from './resumeCountdown';
import type { RunEnding } from './runEnding';
import { createRunEnding, endedIn } from './runEnding';
import { createRunHud } from './RunHud';
import { createRunRecording } from './runRecording';
import { createRunSession } from './runSession';
import type { RunSteering } from './steering';
import { createRunSteering } from './steering';
import { StormRenderer } from './StormRenderer';

// The pause button's size, in stage units. Its corner inset comes from the readout reserve, which is what layout.ts fits the field around.
const PAUSE_WIDTH = 132;
const PAUSE_HEIGHT = 68;

/**
 * What one frame's work tells the frame seam above it.
 *
 * endedRun is a report and not an action, so the seam can record the frame's
 * own row before the run is ended: the ending captures the sealed bytes, and a
 * capture taken mid-frame would cut the ending frame out of the exported tape.
 */
interface FrameWork {
  // Milliseconds spent inside advance, zero on a frame the sim held still through.
  readonly advanceMs: number;
  // Whether this frame's events ended the run by play.
  readonly endedRun: boolean;
}

// The report of a frame the sim held still through: no advance, no ending.
const HELD_FRAME: FrameWork = { advanceMs: 0, endedRun: false };

/**
 * What a run needs from the app around it. Every entry is a power the screen
 * cannot reach on its own; the graph they belong to lives in src/main.ts, and
 * this screen knows none of it.
 */
interface GameScreenProps {
  // Opens the pause menu over the live run, armed with what its End Run does.
  openMenu(endRun: () => void): Promise<void>;
  // Takes the pause menu away, back to the run.
  closeMenu(): Promise<void>;
  // Whether the pause menu itself is the popup currently up.
  menuShowing(): boolean;
  // The way out to the end state, retried from the frame seam when it rejects.
  showEnd(): Promise<void>;
  // Every sound this run's events make.
  playSound(event: SimEvent): void;
  // The canvas a gesture the platform took away is announced on.
  canvas: HTMLCanvasElement | null;
  // What the renderer says about itself, for this run's tape header.
  renderer: RendererIdentity;
}

/**
 * The screen a run plays on. Render only: it wires the drivers that own the
 * run to the children that show it, and holds no game rules. The rules live in
 * src/game and reach the screen through advance(), which converts one frame's
 * elapsed time into whole ticks.
 */
class GameScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ['main'];

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

  private readonly hud = createRunHud();
  private readonly countdown: ResumeCountdown;
  private readonly pauseButton: Button;
  private readonly belchButton: BelchButton;

  private readonly session = createRunSession();
  private readonly recording = createRunRecording();
  private readonly framePolicy = createFramePolicy();
  private readonly steering: RunSteering;
  private readonly ending: RunEnding;

  /**
   * The live placement, held rather than recomputed. A pointer handler converts
   * an event through screenToField with this exact value: calling fitField a
   * second time at event time computes the placement in parallel, and the two
   * agree only until something moves one of them.
   */
  private placement: FieldPlacement = DEGENERATE_PLACEMENT;
  private releaseKeys: (() => void) | null = null;
  private releaseListeners: (() => void) | null = null;
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
   * on" without a second field for prepare() to keep in step.
   */
  private menuTransition: Promise<void> | null = null;
  /**
   * The powers this showing was handed. The pool calls init() before the screen
   * reaches the stage, so it is set before prepare() and before any frame.
   */
  private props!: GameScreenProps;

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

    this.countdown = createResumeCountdown(this.layers);
    this.belchButton = new BelchButton(() => this.steering.requestBelch());
    this.steering = createRunSteering({
      claimsPointer: (pointerId) => this.belchButton.owns(pointerId),
      releaseClaim: () => this.belchButton.release(),
      canvas: () => this.props.canvas,
    });
    this.ending = createRunEnding({
      sealTape: (execution) =>
        this.recording.seal(execution, this.session.clock.debtTicks),
      tapeBytes: () => this.recording.bytes(),
      clearFieldBlur: () => this.countdown.clearBlur(),
      showEnd: () => this.props.showEnd(),
    });

    this.pauseButton = new Button({
      text: 'PAUSE',
      width: PAUSE_WIDTH,
      height: PAUSE_HEIGHT,
      fontSize: 18,
    });
    this.pauseButton.onPress.connect(() => this.togglePause());

    this.addChild(
      this.field,
      this.hud.view,
      this.countdown.view,
      this.pauseButton,
      this.belchButton,
    );

    // Pixi's own handlers go in the constructor and never in prepare():
    // screens are pooled, so a .on added in prepare without a matching .off
    // gives the second run two handlers and the third three, and the lifecycle
    // test counts only window handlers and cannot see it.
    this.eventMode = 'static';
    this.on('pointerdown', this.onPointerDown, this);
    this.on('globalpointermove', this.onPointerMove, this);
    this.on('pointerup', this.onPointerUp, this);
    this.on('pointerupoutside', this.onPointerUp, this);
  }

  // The field's own furniture, put back after any clear() (see reset).
  private dressField(): void {
    this.layers.layer('fieldBoundary').addChild(this.frame);
    this.fieldRenderer.attach(this.layers);
    this.stormRenderer.attach(this.layers);
    this.grave.attach(this.layers);
  }

  public init(props: GameScreenProps) {
    this.props = props;
  }

  public prepare() {
    this.ending.reset();
    this.framePolicy.reset();
    this.menuTransition = null;
    // A pooled screen must not inherit the previous run's held keys, drag
    // anchor, belch request or count.
    this.steering.goQuiet();
    this.steering.readKeyboardSpeed();
    this.countdown.stop();
    this.countdown.clearBlur();
    this.filters = [];
    // The engine takes this screen's children away on the way out and never
    // gives them back. showScreen and hideAndRemoveScreen both set
    // interactiveChildren false, and addAndShowScreen only restores it inside
    // `if (screen.show)`, which this screen does not declare. Left alone, every
    // run after the first has a dead pause button while the stage-wide hitArea
    // goes on steering the grave, so the game looks alive and cannot be paused.
    this.interactiveChildren = true;

    const started = this.session.begin();
    this.recording.begin(
      started.run,
      started.execution,
      runConditionsHere(this.props.renderer),
    );
    this.hud.showIdentity(started.identity);
    this.syncScreen(started.run);
    this.hud.render(this.session.readout);

    this.releaseKeys = bindKeyPress('Escape', () => this.togglePause());
    this.releaseListeners = this.steering.listen();
  }

  public reset() {
    this.releaseKeys?.();
    this.releaseKeys = null;
    this.releaseListeners?.();
    this.releaseListeners = null;
    this.steering.goQuiet();
    // The pause menu sets a BlurFilter on this screen and only its own hide()
    // clears it, so a run ended from inside the menu would otherwise come back
    // out of the pool permanently blurred, paying a full-screen blur pass every
    // frame. Two mechanisms for a defect this quiet is the right number.
    this.filters = [];
    this.countdown.clearBlur();
    this.countdown.stop();
    this.session.end();
    this.recording.end();
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
   */
  public update(ticker: Ticker) {
    const run = this.session.run;
    const execution = this.session.execution;
    // The four-condition guard is split, and where the split falls is a ruling
    // rather than a tidy-up (ADR 0017 and ADR 0018). Only a null run leaves a
    // frame with no tape to be written into, because a tape is one run's
    // recording, so that condition alone returns before the seam. Every other
    // frame of a live run is observed: a paused, backgrounded, ending or
    // countdown frame bought no ticks, and a skipped frame has to be marked
    // rather than omitted or the record cannot say the run stalled at all.
    if (run === null || execution === null) return;
    const startedAt = performance.now();
    const ticksBefore = run.tick;
    // Read before the frame's work runs, because the work can end the state the
    // frame was spent in: the countdown's last frame clears its own remainder,
    // and that frame was still a countdown frame.
    const reason = this.framePolicy.reason({
      ending: this.ending.ended,
      countingDown: this.countdown.remainingMs !== null,
    });
    const work = this.spendFrame(ticker, run, reason);
    const ticksExecuted = run.tick - ticksBefore;
    this.recording.recordRow({
      reason,
      // Absent rather than fabricated: a frame that bought no ticks has no tick
      // to attribute itself to, and a reader that finds the index missing
      // learns something true instead of reading a number somebody invented to
      // fill the column.
      tickIndex: ticksExecuted > 0 ? ticksBefore : null,
      ticksExecuted,
      intervalMs: ticker.elapsedMS,
      advanceMs: work.advanceMs,
      updateMs: performance.now() - startedAt,
      debtTicks: this.session.clock.debtTicks,
    });
    // The frame's own row goes in above, and only then is the run ended. A
    // fatal fault stops the run through the authority and never through an
    // ending (ADR 0017), so the transition keys off execution.stop and this is
    // the frame that takes the run to the end state. It is the same handoff an
    // end by play takes, below the row on purpose: the faulting frame's own row
    // is already in the recorder when the ending captures the sealed bytes, so
    // the exported tape ends on the frame that broke. A capture above the
    // recordRow call would seal the tape without the frame that executed the
    // run-ending tick, which is exactly the row ADR 0018's "every frame of a
    // live run is recorded" is judged on in the exported artifact; that is why
    // spendFrame reports endedRun rather than acting on it. The pause-menu quit
    // calls endRun outside this seam, where its last live frame is already
    // recorded, so it needs no deferral. And the ending latch re-enters on
    // every later frame so a failed navigation is retried from the seam: the
    // ending captures nothing twice, so the retries are navigation alone.
    if (execution.stop !== null || work.endedRun || this.ending.ended) {
      this.endRun();
    }
  }

  /**
   * The frame's work, given the reason the policy already recorded it under.
   *
   * The frame is held on that reason and never on the raw hold conditions, so
   * a frame this method holds still is a frame the tape says was held, by
   * construction. A held frame never asks for the elapsed time either, which is
   * what lets a skip survive a pause and be spent on the first frame that
   * reaches the sim or the count.
   */
  private spendFrame(
    ticker: Ticker,
    run: RunState,
    reason: FrameReason,
  ): FrameWork {
    if (reason === 'countdown') {
      this.countdown.advance(this.framePolicy.takeElapsed(ticker.elapsedMS));
      return HELD_FRAME;
    }
    if (reason !== 'live') return HELD_FRAME;
    const frame = this.session.advanceFrame(
      this.framePolicy.takeElapsed(ticker.elapsedMS),
      this.steering.commandSource(),
    );
    this.announce(run, frame.events);
    this.syncScreen(run);
    this.hud.render(this.session.readout);
    return { advanceMs: frame.advanceMs, endedRun: endedIn(frame.events) };
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
   * This frame's events, handed to everything that answers them. It is where
   * sound subscribes and where the two momentary effects that have no sim
   * entity behind them are started.
   */
  private announce(run: RunState, events: readonly SimEvent[]): void {
    for (const event of events) {
      this.props.playSound(event);
      if (event.type === 'belched') this.stormRenderer.erupt(run);
      if (event.type === 'splashed') this.stormRenderer.splashed(run);
    }
  }

  public resize(width: number, height: number) {
    this.placement = fitField(width, height, READOUT_RESERVE);
    this.field.position.set(this.placement.offsetX, this.placement.offsetY);
    this.field.scale.set(this.placement.scale);
    // The whole stage, so a drag that starts outside the letterboxed field
    // still steers.
    this.hitArea = new Rectangle(0, 0, width, height);
    this.steering.setSlop(this.placement.scale);
    // Positioned from the reserve layout.ts fits the field around, so the two
    // cannot drift and the non-overlap invariant is one rule in one place.
    this.pauseButton.position.set(
      width - READOUT_RESERVE.margin - PAUSE_WIDTH / 2,
      READOUT_RESERVE.margin + PAUSE_HEIGHT / 2,
    );
    this.countdown.resize(width, height);
    // Bottom right, from the same reserve the pause button is positioned from,
    // so the two cannot drift apart and the non-overlap rule stays one rule in
    // one place. It sits over the field: Mark ruled on 2026-08-22 that the
    // field never pays width for a readout.
    this.belchButton.position.set(
      width - READOUT_RESERVE.margin - BELCH_SIZE / 2,
      height - READOUT_RESERVE.margin - BELCH_SIZE / 2,
    );
  }

  private onPointerDown(event: FederatedPointerEvent): void {
    // A tap on the pause button propagates root to target and would otherwise
    // anchor a drag as well, which is the defect the old END RUN button had.
    if (event.target !== this) return;
    this.steering.pointerDown(
      event,
      this.placement,
      this.session.run?.grave ?? null,
    );
  }

  private onPointerMove(event: FederatedPointerEvent): void {
    this.steering.pointerMove(event, this.placement);
  }

  private onPointerUp(event: FederatedPointerEvent): void {
    this.steering.pointerUp(event);
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
    const opensMenu = !this.props.menuShowing();
    if (opensMenu && this.menuTransition) return;
    const change = opensMenu
      ? this.props.openMenu(() => this.endRun())
      : this.props.closeMenu();
    this.menuTransition = opensMenu ? change : null;
    change
      .catch((error) => console.error(error))
      .finally(() => {
        // Only this transition's own guard, never whatever a later run is
        // waiting on.
        if (this.menuTransition === change) this.menuTransition = null;
      });
  }

  // A lost keyup or a drag interrupted by a popup must not survive into the resumed run.
  private goQuiet(): void {
    this.steering.goQuiet();
    this.countdown.stop();
  }

  // The first frame back is skipped whichever reason lifted, because either one leaves a gap in Ticker.lastTime.
  private comeBack(): void {
    this.framePolicy.skipNextFrame();
    this.steering.readKeyboardSpeed();
    // A tab return is the identical hazard to a resume, arriving without the
    // player having asked for it: goQuiet() cancelled the drag anchor, so the
    // field is live again with nothing under the thumb.
    //
    // The count is guarded by the transition itself and never by a flag a
    // pooled run can lower: focus() can fire while the menu is still up, which
    // would either run a countdown behind the menu or stack a second one on
    // resume.
    if (this.framePolicy.menuPaused || this.menuTransition !== null) return;
    this.countdown.start();
  }

  public blur(): void {
    this.framePolicy.setBackgrounded(true);
    this.goQuiet();
  }

  public focus(): void {
    this.framePolicy.setBackgrounded(false);
    this.comeBack();
  }

  public async pause(): Promise<void> {
    this.framePolicy.setMenuPaused(true);
    this.goQuiet();
  }

  public async resume(): Promise<void> {
    this.framePolicy.setMenuPaused(false);
    this.comeBack();
  }

  private endRun(): void {
    this.ending.end(this.session.run, this.session.execution);
  }
}

export { GameScreen };
export type { GameScreenProps };
