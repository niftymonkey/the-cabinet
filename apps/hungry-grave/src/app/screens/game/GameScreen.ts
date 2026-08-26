import type { FederatedPointerEvent, Ticker } from 'pixi.js';
import { BlurFilter, Container, Graphics, Rectangle } from 'pixi.js';

import type { CommandSource } from '../../../game/command';
import { advance } from '../../../game/advance';
import type { Clock } from '../../../game/clock';
import { createClock } from '../../../game/clock';
import type { Execution, FaultRecord } from '../../../game/execution';
import { createExecution, devBrokenHandler } from '../../../game/execution';
import type { FaultIdentity } from '../../../game/faults';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../../game/field';
import type { SimEvent } from '../../../game/events';
import type { WeaponLine } from '../../../game/lines/roster';
import { WEAPON_LINES } from '../../../game/lines/roster';
import type { RunState } from '../../../game/run';
import {
  createRun,
  isBirthrightLevels,
  uniformLevels,
} from '../../../game/run';
import { RESERVOIR_CAPACITY } from '../../../game/tuning';
import { encodeTape } from '../../../tape/encode';
import type { TapeRecorder } from '../../../tape/recorder';
import {
  recordFrame,
  recordInto,
  sealTrailer,
  tapeOf,
} from '../../../tape/recorder';
import type { FrameReason } from '../../../tape/tape';
import { KeySteer } from '../../../input/keys';
import { combineSteer } from '../../../input/steering';
import { TouchSteer } from '../../../input/touch';
import { meterLinePosition, METER_FONT_SIZE } from '../../FpsMeter';
import { engine } from '../../getEngine';
import type { FieldPlacement } from '../../layout';
import {
  BOUNDARY_STROKE,
  DEGENERATE_PLACEMENT,
  fitField,
  READOUT_RESERVE,
  screenToField,
} from '../../layout';
import { PALETTE } from '../../palette';
import { pauseActions, PausePopup } from '../../popups/PausePopup';
import { SettingsPopup } from '../../popups/SettingsPopup';
import { runHandoff, summarizeRun } from '../../runHandoff';
import { playFor } from '../../sound';
import type { StoreRecording } from '../../storeRecording';
import { recordRunToStore } from '../../storeRecording';
import type { TapeStore } from '../../tapeStore';
import { openTapeStore } from '../../tapeStore';
import { runConditionsHere, tapeHeaderFor } from '../../tapeHeader';
import { levelsFromUrl, seedFromUrl, sizeFromUrl } from '../../seedFromUrl';
import { Button } from '../../ui/Button';
import { Label } from '../../ui/Label';
import { bindKeyPress } from '../../utils/bindKeyPress';
import { userSettings } from '../../utils/userSettings';
import { EndScreen } from '../EndScreen';
import { BELCH_SIZE, BelchButton } from './BelchButton';
import { FieldRenderer } from './FieldRenderer';
import { GraveRenderer } from './GraveRenderer';
import { FieldLayers } from './layering';
import { StormRenderer } from './StormRenderer';

// The codes the page would otherwise scroll on. Space joins them so the page cannot scroll under a belch.
const SCROLL_CODES = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
];

/**
 * The belch's keyboard binding, as physical codes.
 *
 * Space is the free, unambiguous key on this layout: there is no manual shot to
 * bind it to, Shift is already focus, and WASD and the arrows are steering. KeyX
 * rides alongside it for the Touhou muscle memory, where X is the bomb.
 */
const BELCH_CODES = ['Space', 'KeyX'];

// The pointer kinds TouchSteer is reasoned about in. A mouse steers with the keyboard by design.
const STEERING_POINTERS = ['touch', 'pen'];

/**
 * How far a finger must travel to be the steering pointer, in stage units. It
 * is converted to field units against the live placement, because a
 * finger-jitter threshold is physical and a field-unit constant bakes in one
 * viewport. It is 3 CSS pixels wherever the stage is not itself scaled up, and
 * about 2.2 on a 390-wide phone, where it is.
 */
const STEER_SLOP_STAGE_UNITS = 3;

// The pause button's size, in stage units. Its corner inset comes from the readout reserve, which is what layout.ts fits the field around.
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

// How strong the countdown's blur is. It is the pause menu's own strength, because it is the same read continuing.
const COUNTDOWN_BLUR_STRENGTH = 5;

/**
 * The layers the countdown blurs. The grave and its rim are spared, exactly as
 * ADR 0014's hit dim spares them: re-finding the grave is what the countdown
 * exists for, so blurring it would defeat its own purpose, and the hit dim's
 * rule already settles the principle that the channel a player is being asked
 * to re-read is never occluded.
 */
const BLURRED_LAYERS = ['mobBodies', 'mobFire', 'corpses', 'treasure'] as const;

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
 * it, and inside the countdown it throws into a promise nobody is waiting on.
 *
 * Only success is remembered. A failure is not, because whether the shader can
 * be compiled is a property of the environment at that moment rather than of
 * this module, and caching the first failure would leave the field unblurred
 * for the rest of the session on the strength of one early attempt. Where no
 * shader can be compiled the field simply does not blur, which is the only
 * sensible answer there.
 */
let sharedBlur: BlurFilter | null = null;

const fieldBlur = (): BlurFilter | null => {
  if (sharedBlur !== null) return sharedBlur;
  try {
    sharedBlur = new BlurFilter({ strength: COUNTDOWN_BLUR_STRENGTH });
  } catch {
    return null;
  }
  return sharedBlur;
};

/**
 * The playfield's boundary readout. The engine's background and the field's
 * ground are both night, so this outline is the only visible edge of the field,
 * and that edge is the bound on the grave's movement. That makes it a readout
 * and not scenery, which is why it carries a contrast floor of its own and a
 * width the floor depends on. It strokes inward so the whole of it stays inside
 * the field's own 540 by 760.
 */
const boundaryReadout = (): Graphics => {
  return new Graphics().rect(0, 0, FIELD_WIDTH, FIELD_HEIGHT).stroke({
    width: BOUNDARY_STROKE,
    color: PALETTE.fieldFrame.hex,
    alignment: 1,
  });
};

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
const fieldClip = (): Graphics => {
  return new Graphics().rect(0, 0, FIELD_WIDTH, FIELD_HEIGHT).fill();
};

// One line of the corner readout stack, in the shared size and anchored to its top-left.
const stackLine = (index: number): Label => {
  const label = new Label({
    style: {
      fontFamily: 'monospace',
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
};

/**
 * What one frame's work tells the frame seam above it.
 *
 * endedRun is a report and not an action, so the seam can record the frame's
 * own row before the run is ended: endRun captures the sealed bytes, and a
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
 * The most characters the fault line may carry, prefix included. It is
 * READOUT_RESERVE.width spent as corner-stack characters: layering.test.ts
 * holds the two together through the same advance bound the rest of the stack
 * is held by, so the line hugs the corner on a 390-unit phone stage instead of
 * running nearly the full width of it.
 */
const FAULT_LINE_MAX_CHARS = 25;

// The fault line's prefix, counted inside FAULT_LINE_MAX_CHARS.
const FAULT_PREFIX = 'FAULT ';

/**
 * A fault's identity, cut to the line's budget where it must be.
 *
 * The identities are a closed list (ADR 0017), so the cut forms are checkable
 * against every member: layering.test.ts asserts no two identities render the
 * same line, which is what keeps a cut form unambiguous. The ellipsis says
 * honestly that the name is cut, and the full identity is in the tape's own
 * fault record either way.
 */
const shortIdentity = (identity: FaultIdentity): string => {
  const budget = FAULT_LINE_MAX_CHARS - FAULT_PREFIX.length;
  if (identity.length <= budget) return identity;
  return `${identity.slice(0, budget - 1).trimEnd()}…`;
};

/**
 * The HUD's fault line (ADR 0017 ruling C): a recoverable fault shows live,
 * minimally, while the run continues, so a read is never taken for minutes on
 * a run whose tuning evidence is already compromised. It reads the authority's
 * own de-duplicated record rather than keeping a second tally, it appears when
 * the first fault fires and stays for the rest of the run, and it never
 * terminates or pauses anything, in any build.
 */
const faultReadout = (faults: readonly FaultRecord[]): string => {
  if (faults.length === 0) return '';
  if (faults.length === 1) {
    return `${FAULT_PREFIX}${shortIdentity(faults[0].identity)}`;
  }
  return `FAULTS ${faults.length}`;
};

/**
 * The pinned-levels line's figure: one number when the four lines agree, which
 * is the only shape the pin produces, and all four in roster order otherwise.
 */
const levelsReadout = (
  levels: Readonly<Record<WeaponLine, number>>,
): string => {
  const values = WEAPON_LINES.map((line) => levels[line]);
  return values.every((value) => value === values[0])
    ? `${values[0]}`
    : values.join('/');
};

/**
 * The screen a run plays on. Render only: it owns this run's state and shows
 * it, and holds no game rules. The rules live in src/game and reach the screen
 * through advance(), which converts one frame's elapsed time into whole ticks.
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

  private readonly debtLabel: Label;
  private readonly tickLabel: Label;
  private readonly seedLabel: Label;
  private readonly sizeLabel: Label;
  /**
   * The loadout pin's readout, beside the seed's and the size's. It shows the
   * run's already-resolved start levels and never re-reads the URL, and only
   * when they differ from the birthright, so ordinary runs are untouched.
   */
  private readonly levelsLabel: Label;
  // The recoverable-fault line, filled by syncReadouts (see faultReadout).
  private readonly faultLabel: Label;
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
  /**
   * The tape this run is being recorded onto. Its lifetime is the run's, the
   * same as the Execution's: a pooled screen leaks anything nobody explicitly
   * clears, and a recorder held past its run would carry one run's commands
   * into the next.
   */
  private recorder: TapeRecorder | null = null;
  /**
   * The spool feeding this run's recording into the browser store. Its
   * lifetime is the run's, like the recorder's: a pooled screen leaks anything
   * nobody explicitly clears, so reset() detaches and nulls it.
   */
  private storeRecording: StoreRecording | null = null;
  /**
   * The store connection, deliberately not per-run: opening IndexedDB is
   * async and once per screen life, and a null resolution is the designed
   * store-unavailable state the spool quietly drops writes into. Not cleared
   * in reset() because it holds no run state at all.
   */
  private tapeStore: Promise<TapeStore | null> | null = null;
  private releaseKeys: (() => void) | null = null;
  private releaseListeners: (() => void) | null = null;
  /**
   * Whether this run is over: the trailer is sealed, the handoff holds the
   * captured bytes, and the frame seam holds every later frame still. It
   * latches up at the first endRun and only prepare() lowers it, because a
   * lowered latch would let a post-stop frame read live and step a run whose
   * own record says it stopped.
   */
  private ending = false;
  /**
   * Whether a navigation to the end state is in flight. It is the half of the
   * old ending guard that does come back down on a failed showScreen, so the
   * frame seam can retry the way out while the sealed record stays sealed.
   */
  private navigating = false;
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
   * How many fault records the HUD line has been written from, so the label is
   * only touched when the authority's record grows. Per-run mutable state on a
   * pooled screen, so prepare() resets it beside the label.
   */
  private shownFaults = 0;
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
    // Lines five and six sit past the readout reserve and draw over the field,
    // which is the meter's own allowance under ADR 0014. Growing the reserve
    // instead would move the field on every ordinary run: the levels line is
    // empty on an ordinary run, and the fault line is empty on a healthy one,
    // because ADR 0017 shows a recoverable fault live on an ordinary run.
    this.levelsLabel = stackLine(5);
    this.faultLabel = stackLine(6);
    this.countdownLabel = new Label({
      style: {
        fontFamily: 'monospace',
        fill: PALETTE.hudInk.hex,
        fontSize: 72,
      },
    });
    this.countdownLabel.visible = false;

    this.pauseButton = new Button({
      text: 'PAUSE',
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
      this.levelsLabel,
      this.faultLabel,
      this.countdownLabel,
      this.pauseButton,
      this.belchButton,
    );

    this.keys = new KeySteer({ multiplier: userSettings.getKeyboardSpeed() });

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

  // A belch asked for, by the button or by the keyboard.
  private requestBelch(): void {
    this.belchRequested = true;
  }

  public prepare() {
    this.ending = false;
    this.navigating = false;
    this.menuPaused = false;
    this.backgrounded = false;
    this.menuTransition = null;
    this.skipElapsed = false;
    this.clock = createClock();
    this.shownDebt = null;
    this.shownTick = null;
    this.shownFaults = 0;
    this.faultLabel.text = '';
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

    this.run = this.startRun();
    this.execution = this.startExecution(this.run);
    // Before the first tick, because the header is written before the first
    // tick and checkpoint zero is the state before any tick has run.
    this.recorder = recordInto(
      this.execution,
      tapeHeaderFor(this.run, runConditionsHere()),
    );
    this.tapeStore ??= openTapeStore();
    this.storeRecording = recordRunToStore(this.tapeStore, this.recorder);
    this.syncScreen(this.run);
    this.syncReadouts();

    pauseActions.setEndRun(() => this.endRun());
    this.releaseKeys = bindKeyPress('Escape', () => this.togglePause());
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
    // The loadout pin (ADR 0020): a testing control, never player-facing, and
    // it belongs behind the instrumentation build's gate.
    const levels = levelsFromUrl(search, hash);
    // The size goes in rather than being written afterwards: ADR 0003's floor
    // and ceiling are grave.ts's to hold, and hitGrave is then the only thing
    // outside it that changes size at all. The levels go in the same door, so
    // the run is born with them and the tape's header records what it was born
    // with.
    const run = createRun(
      seed ?? undefined,
      size ?? undefined,
      levels === null ? undefined : uniformLevels(levels),
    );

    this.seedLabel.text =
      seed === null ? `SEED ${run.seed}` : `SEED ${run.seed} PINNED`;
    this.sizeLabel.text = size === null ? '' : `SIZE ${run.grave.size} PINNED`;
    // The resolved start levels and never the parameter (Mark's ruling): what
    // the run was actually born with, read before any tick can level it up.
    // Gated on differing from the birthright rather than on the parameter's
    // presence, which is what keeps ordinary runs untouched.
    this.levelsLabel.text = isBirthrightLevels(run.levels)
      ? ''
      : `LEVELS ${levelsReadout(run.levels)} PINNED`;
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

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    canvas?.addEventListener('pointercancel', onPointerCancel);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      canvas?.removeEventListener('pointercancel', onPointerCancel);
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
    // The spool goes before the recorder: its detach flushes what is pending,
    // the post-stop frame rows included, and a detached spool is inert however
    // often reset runs.
    this.storeRecording?.detach();
    this.storeRecording = null;
    this.recorder = null;
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
    const run = this.run;
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
    // frame was spent in: the countdown's last frame clears countdownMs, and
    // that frame was still a countdown frame.
    const reason = this.frameReason();
    const work = this.updateRun(ticker, run, execution, reason);
    const ticksExecuted = run.tick - ticksBefore;
    recordFrame(this.recorder, {
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
      debtTicks: this.clock.debtTicks,
    });
    // After the frame's own row and outside the timed window, so the
    // instrument cannot measure itself: updateMs closed at the call above.
    this.storeRecording?.flush();
    // A fatal fault stops the run through the authority and never through an
    // ending (ADR 0017), so the transition keys off execution.stop and this is
    // the frame that takes the run to the end state. It is the same handoff an
    // end by play takes, below the seam on purpose: the faulting frame's own
    // row is already in the recorder when endRun captures the sealed bytes, so
    // the exported tape ends on the frame that broke. A capture above the
    // recordFrame call would seal the tape without the frame that executed the
    // run-ending tick, which is exactly the row ADR 0018's "every frame of a
    // live run is recorded" is judged on in the exported artifact; that is why
    // updateRun reports endedRun rather than acting on it. The pause-menu quit
    // calls endRun outside this seam, where its last live frame is already
    // recorded, so it needs no deferral. And this.ending re-enters on every
    // later frame so a failed navigation is retried from the seam: endRun
    // captures nothing twice, so the retries are navigation alone.
    if (execution.stop !== null || work.endedRun || this.ending) this.endRun();
  }

  /**
   * Why this frame is what it is, in the guard's own order (ADR 0018).
   *
   * This is the one enumeration of the hold conditions: updateRun gates on
   * the reason this returns rather than re-reading the conditions, so a hold
   * condition added here holds the frame and records it in the same breath.
   * The short-circuit order lives here alone, so when two conditions are true
   * at once the recorded reason is the one that actually decided the frame.
   * Live says only that the frame reached the simulation; whether it bought a
   * tick is the tick index's fact, not this one's.
   */
  private frameReason(): FrameReason {
    if (this.ending) return 'ending';
    if (this.menuPaused) return 'paused';
    if (this.backgrounded) return 'backgrounded';
    if (this.countdownMs !== null) return 'countdown';
    return 'live';
  }

  /**
   * The frame's work, once the seam above has a run and an authority to
   * attribute it to.
   *
   * advanceMs is measured here and not read off the ticker because the ticker
   * cannot give it: elapsedMS is the gap between one frame and the last, so it
   * says a frame was late and never what made it late. Advance is where the
   * simulation and its invariant checks both sit, which is the part a
   * checks-on and a checks-off reading are differenced on, and the frame's
   * total says how much of a bad frame was anything else.
   *
   * endedRun is reported rather than acted on, because the seam above ends the
   * run only after this frame's row is recorded.
   *
   * The frame is held on the recorded reason and never on the raw hold
   * conditions: frameReason() is the single authority, so a frame this method
   * holds still is a frame the tape says was held, by construction.
   */
  private updateRun(
    ticker: Ticker,
    run: RunState,
    execution: Execution,
    reason: FrameReason,
  ): FrameWork {
    if (reason === 'countdown') {
      this.countDown(this.takeElapsed(ticker.elapsedMS));
      return HELD_FRAME;
    }
    if (reason !== 'live') return HELD_FRAME;
    const keyCommand = this.keys.command();
    const source: CommandSource = (grave) => {
      // Read and cleared here rather than in advance: the closure is only
      // called when a tick runs, so this is the one place that can tell a frame
      // that bought ticks from one that did not.
      const belch = this.belchRequested;
      this.belchRequested = false;
      return { move: combineSteer(keyCommand, this.touch, grave), belch };
    };
    const startedAdvance = performance.now();
    const events = advance(
      execution,
      this.clock,
      this.takeElapsed(ticker.elapsedMS),
      source,
    );
    const advanceMs = performance.now() - startedAdvance;
    this.announce(run, events);
    this.syncScreen(run);
    this.syncReadouts();
    return { advanceMs, endedRun: endedIn(events) };
  }

  /**
   * Writes the tape's trailer, once, at the stop.
   *
   * A second call is ignored by the recorder rather than overwriting, so the
   * run that ends by play and is then left by the pause menu still says it
   * finished.
   */
  private closeTape(): void {
    const execution = this.execution;
    if (execution === null || this.recorder === null) return;
    sealTrailer(this.recorder, execution, this.clock.debtTicks);
    this.storeRecording?.seal();
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
      playFor(event);
      if (event.type === 'belched') this.stormRenderer.erupt(run);
      if (event.type === 'splashed') this.stormRenderer.splashed(run);
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

  // The threat layers, blurred. The grave and its rim are spared, so the player can re-find them.
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

  // Each readout writes only when its own number changes, as the meter already does.
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
    const faults = this.execution?.faults ?? [];
    if (faults.length !== this.shownFaults) {
      this.shownFaults = faults.length;
      this.faultLabel.text = faultReadout(faults);
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

  // A finger landing, in field units. A mouse is filtered out: desktop steering is the keyboard by design.
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

  // A lost keyup or a drag interrupted by a popup must not survive into the resumed run.
  private goQuiet(): void {
    this.keys.releaseAll();
    this.touch.cancelAll();
    this.belchRequested = false;
    this.belchButton.release();
    this.countdownMs = null;
    this.shownCount = null;
    this.countdownLabel.visible = false;
  }

  // The first frame back is skipped whichever reason lifted, because either one leaves a gap in Ticker.lastTime.
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

  /**
   * The run's tape as sealed encoded bytes, made at the stop because nothing
   * else outlives it: reset() nulls the recorder when this pooled screen is
   * taken away, and the end screen needs the run's record after that. The
   * frames the run spends on its own end state arrive after this and stay in
   * the recorder only; the trailer is already written, so the bytes are the
   * sealed record of the run up to its stop.
   */
  private sealedTape(): Uint8Array | null {
    if (this.recorder === null) return null;
    return encodeTape(tapeOf(this.recorder));
  }

  /**
   * Takes the run to its end state, sealing the record exactly once.
   *
   * The capture is once-only and only the navigation retries. showScreen can
   * reject, and the frame seam then calls back in while the run stays over: a
   * retry that re-entered the capture would re-encode the tape and re-record
   * the handoff on every failing frame, folding the frames after the stop into
   * the exported artifact. Captured once, the artifact is frozen at the stop
   * however many retries the way out takes.
   */
  private endRun() {
    if (!this.run || !this.execution) return;
    if (!this.ending) {
      this.ending = true;
      this.clearFieldBlur();
      this.closeTape();
      runHandoff.record(
        summarizeRun(this.run, this.execution),
        this.sealedTape(),
      );
    }
    if (this.navigating) return;
    this.navigating = true;
    engine()
      .navigation.showScreen(EndScreen)
      .catch((error) => {
        // A failed navigation releases the navigation guard alone, so the
        // frame seam retries the way out. The ending latch stays up: lowering
        // it would let a post-stop frame read live and step a stopped run.
        this.navigating = false;
        console.error(error);
      });
  }
}

// Whether this frame's events ended the run, either way (ADR 0003 and ADR 0007).
const endedIn = (events: readonly SimEvent[]): boolean => {
  return events.some(
    (event) => event.type === 'sealed' || event.type === 'victory',
  );
};

export { faultReadout, levelsReadout, GameScreen, FAULT_LINE_MAX_CHARS };
