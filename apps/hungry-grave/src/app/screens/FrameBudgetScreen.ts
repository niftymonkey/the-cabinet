import { Container } from 'pixi.js';

import type { FrameSpans } from '../../dev/frameBudget';
import {
  frameBudgetOver,
  frameBudgetTable,
  ROUND_ZERO_FIELDS,
} from '../../dev/frameBudget';
import type { FieldSize } from '../../dev/syntheticField';
import { standSyntheticField } from '../../dev/syntheticField';
import type { Caps } from '../../game/caps';
import { capsFor } from '../../game/caps';
import { CORPSE_HALF_EXTENT } from '../../game/corpses';
import type { Execution } from '../../game/execution';
import { createExecution, executeTick } from '../../game/execution';
import { graveWidth } from '../../game/grave';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import { DEFAULT_TUNING } from '../../game/tuningRecord';
import { MENU } from '../palette';
import type { ButtonChrome } from '../ui/Button';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import type { Swallowed } from '../../game/events';
import { FALL_TICKS } from './game/fall';
import { FallRenderer } from './game/FallRenderer';
import { FieldRenderer } from './game/FieldRenderer';
import { FieldLayers } from './game/layering';

/**
 * What this screen was handed: the way out, and the renderer's own pass, which
 * is the half of a frame no headless run can time.
 */
interface FrameBudgetScreenProps extends ButtonChrome {
  onBack(): void;
  drawField(field: Container): void;
}

/**
 * The seed every field plays from, pinned so two openings of this URL measure
 * the same field rather than two different ones (ADR 0012).
 */
const SEED = 505;

// Frames thrown away per field before the stopwatch starts, so the figures are the warm engine's.
const WARM_UP_FRAMES = 60;

// Frames timed per field, three seconds of play at a sixty-hertz display.
const TIMED_FRAMES = 180;

// One field being measured, and everything the walk across its frames needs.
interface Measuring {
  readonly size: FieldSize;
  readonly run: RunState;
  readonly execution: Execution;
  readonly sim: number[];
  readonly render: number[];
  frame: number;
}

/**
 * A field the runs this screen makes cannot hold. The caps are derived per run
 * from the record it starts under (ADR 0056 as amended) and every run here
 * starts under the build's own, so which of round 0's fields can stand at all
 * is a fact about the build that opened this URL: the bench's config aliases
 * the derivation and the shipped build does not.
 */
const fits = (size: FieldSize, caps: Caps): boolean =>
  size.mobs <= caps.mobs && size.corpses <= caps.corpses;

/**
 * Round 0's frame budget, measured in whatever browser opened this URL.
 *
 * The headless script beside it (`scripts/frame-budget.ts`) times the
 * simulation and can raise the caps to stand every field; only a browser can
 * time a renderer, and only the deployed URL can time a phone's. So this is the
 * same measurement with the render half filled in, and it runs at the caps its
 * own build carries.
 *
 * It lives here rather than under screens/game because it never draws while a
 * field is live, so it is outside the palette scan and may use MENU colours.
 */
class FrameBudgetScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ['main'];

  private readonly heading: Label;
  private readonly table: Label;
  private readonly note: Label;
  private readonly backButton: Button;
  /**
   * The powers this showing was handed. The pool calls init() before the screen
   * reaches the stage, so it is set before the back button can be pressed.
   */
  private props!: FrameBudgetScreenProps;

  /**
   * The field, held off the screen on purpose. Only the timed pass draws it, so
   * what the stopwatch reads is one render of the field and not two.
   */
  private readonly field = new Container();
  private readonly layers = new FieldLayers();
  private readonly fieldRenderer = new FieldRenderer();
  /**
   * The falls, drawn straight into the mouth layer and not into a grave.
   *
   * This screen builds no grave renderer: a grave's own art would be folded
   * into every row, and what this column is for is the falls' own cost. The
   * renderer takes the container it draws into for exactly that reason (design
   * record R5).
   */
  private readonly falls = new FallRenderer();

  private queue: FieldSize[] = [];
  private measured: FrameSpans[] = [];
  private current: Measuring | null = null;

  constructor() {
    super();

    this.heading = new Label({
      style: { fill: MENU.menuInk.hex, fontSize: 32, letterSpacing: 3 },
    });
    this.table = new Label({
      style: {
        fontFamily: 'monospace',
        fill: MENU.menuDim.hex,
        fontSize: 12,
        align: 'left',
      },
    });
    this.note = new Label({
      style: { fill: MENU.menuDim.hex, fontSize: 14, wordWrap: true },
    });
    this.backButton = new Button({
      text: 'BACK',
      width: 220,
      height: 70,
      fontSize: 18,
      playSound: (alias) => this.props.playButtonSound(alias),
    });
    this.backButton.onPress.connect(() => this.props.onBack());

    this.layers.addTo(this.field);
    this.addChild(this.heading, this.table, this.note, this.backButton);
  }

  public init(props: FrameBudgetScreenProps) {
    this.props = props;
  }

  public prepare() {
    // The runs below are all made with no record of their own, so this is what
    // every one of them derives.
    const caps = capsFor(DEFAULT_TUNING);
    this.fieldRenderer.attach(this.layers, caps);
    this.falls.attach(this.layers.layer('graveMouth'), caps);
    this.queue = ROUND_ZERO_FIELDS.filter((size) => fits(size, caps));
    this.measured = [];
    this.current = this.beginNextField();
    this.heading.text = 'FRAME BUDGET';
    this.table.text = 'measuring';
    this.note.text = this.refusalNote(caps);
  }

  /**
   * One frame of one field: the tick, then the renderer's pass over what the
   * tick left. The two are timed apart because they answer different questions,
   * and the record's table carries a column for each.
   */
  public update() {
    const measuring = this.current;
    if (measuring === null) return;
    standSyntheticField(measuring.run, measuring.size);
    this.standFalls(measuring);
    const beforeTick = performance.now();
    executeTick(measuring.execution, { move: { x: 0, y: 0 }, belch: false });
    const afterTick = performance.now();
    this.fieldRenderer.sync(measuring.run);
    this.falls.sync(measuring.run);
    this.props.drawField(this.field);
    const afterDraw = performance.now();
    if (measuring.frame >= WARM_UP_FRAMES) {
      measuring.sim.push(afterTick - beforeTick);
      measuring.render.push(afterDraw - afterTick);
    }
    measuring.frame += 1;
    if (measuring.frame < WARM_UP_FRAMES + TIMED_FRAMES) return;
    this.measured.push({ sim: measuring.sim, render: measuring.render });
    this.current = this.beginNextField();
    this.showWhatIsMeasured();
  }

  /**
   * This frame's share of the falls the row wants in the air.
   *
   * A fall is drawing state and not field state, so standSyntheticField cannot
   * stand one: nothing in the run knows a fall exists. They are born through
   * the same seam the game screen uses instead, spread evenly over one fall's
   * own lifetime, so that after that first second the row holds its whole count
   * in the air and holds it there. The spread is exact, which is what keeps the
   * pool from ever wrapping and logging a recycle.
   *
   * The count is the row's own corpse count, so falls scale with the row
   * exactly as corpses do. It is a headroom figure and not a field a player can
   * reach: every body on the field going in on the same second is not play, it
   * is the ceiling, which is what the record already says of its two largest
   * rows.
   */
  private standFalls(measuring: Measuring): void {
    const wanted = measuring.size.corpses;
    const already = Math.floor((measuring.frame * wanted) / FALL_TICKS);
    const through = Math.floor(((measuring.frame + 1) * wanted) / FALL_TICKS);
    if (through === already) return;
    const overTheRim: Swallowed = {
      type: 'swallowed',
      kind: 'corpse',
      freshness: 1,
      payout: 0,
      offsetX: graveWidth(measuring.run.grave.size) / 2,
      offsetY: 0,
      halfExtent: CORPSE_HALF_EXTENT,
      vx: 0,
      vy: 0,
      graveSize: measuring.run.grave.size,
      tier: 'trash',
      treasureBody: false,
    };
    for (let born = already; born < through; born++) {
      this.falls.swallowed(measuring.run, overTheRim);
    }
  }

  /** The next field standing and its run fresh, or null once every field is measured. */
  private beginNextField(): Measuring | null {
    const size = this.queue[this.measured.length];
    if (size === undefined) return null;
    const run = createRun(SEED);
    this.fieldRenderer.forgetPreviousRun();
    this.falls.forgetPreviousRun();
    return {
      size,
      run,
      execution: createExecution(run),
      sim: [],
      render: [],
      frame: 0,
    };
  }

  /**
   * The table of every field measured so far, so a phone shows its progress
   * rather than a blank panel for half a minute.
   */
  private showWhatIsMeasured(): void {
    const sizes = this.queue.slice(0, this.measured.length);
    const spans = this.measured;
    const rows = frameBudgetOver(
      sizes,
      (size) => spans[sizes.indexOf(size)] ?? { sim: [], render: [] },
    );
    this.table.text = frameBudgetTable(rows);
    if (this.current !== null) return;
    this.heading.text = 'FRAME BUDGET, DONE';
    // A phone reads the table off the panel, because a phone has no console. A
    // desktop run reads it off the console, because a figure that reaches an
    // agent through a screenshot reaches it through somebody's eyes, which
    // ADR 0018 rules out.
    console.log(this.table.text);
  }

  /**
   * The fields this build cannot stand, named. Without it a short table reads
   * as a measurement that stopped rather than as a build whose pools are
   * smaller than the record's largest rows.
   */
  private refusalNote(caps: Caps): string {
    const refused = ROUND_ZERO_FIELDS.filter((size) => !fits(size, caps));
    if (refused.length === 0) return '';
    const named = refused
      .map((size) => `${size.mobs} / ${size.corpses}`)
      .join(', ');
    return `This build holds ${caps.mobs} mobs and ${caps.corpses} corpses, so it cannot stand ${named}. Those rows need a build made under vite.frame-budget.config.ts.`;
  }

  public reset() {
    this.queue = [];
    this.measured = [];
    this.current = null;
    this.fieldRenderer.detach();
    this.falls.detach();
  }

  public resize(width: number, height: number) {
    const cx = width / 2;
    this.heading.position.set(cx, height * 0.12);
    this.table.position.set(cx, height * 0.4);
    this.note.position.set(cx, height * 0.68);
    this.note.style.wordWrapWidth = Math.min(width - 64, 520);
    this.backButton.position.set(cx, height * 0.88);
  }
}

export { FrameBudgetScreen };
export type { FrameBudgetScreenProps };
