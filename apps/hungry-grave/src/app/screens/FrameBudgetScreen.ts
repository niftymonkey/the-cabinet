import { Container } from 'pixi.js';

import type { FrameSpans } from '../../dev/frameBudget';
import {
  frameBudgetOver,
  frameBudgetTable,
  ROUND_ZERO_FIELDS,
} from '../../dev/frameBudget';
import type { FieldSize } from '../../dev/syntheticField';
import { standSyntheticField } from '../../dev/syntheticField';
import { CORPSE_CAP, MOB_CAP } from '../../game/caps';
import type { Execution } from '../../game/execution';
import { createExecution, executeTick } from '../../game/execution';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import { MENU } from '../palette';
import type { ButtonChrome } from '../ui/Button';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
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
 * A field this build's pools cannot hold. The caps are compiled in and are
 * identical on every device (`caps.ts`), so which of round 0's fields can stand
 * at all is a fact about the build that opened this URL.
 */
const fits = (size: FieldSize): boolean =>
  size.mobs <= MOB_CAP && size.corpses <= CORPSE_CAP;

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
    this.fieldRenderer.attach(this.layers);
    this.queue = ROUND_ZERO_FIELDS.filter(fits);
    this.measured = [];
    this.current = this.beginNextField();
    this.heading.text = 'FRAME BUDGET';
    this.table.text = 'measuring';
    this.note.text = this.refusalNote();
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
    const beforeTick = performance.now();
    executeTick(measuring.execution, { move: { x: 0, y: 0 }, belch: false });
    const afterTick = performance.now();
    this.fieldRenderer.sync(measuring.run);
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

  /** The next field standing and its run fresh, or null once every field is measured. */
  private beginNextField(): Measuring | null {
    const size = this.queue[this.measured.length];
    if (size === undefined) return null;
    const run = createRun(SEED);
    this.fieldRenderer.forgetPreviousRun();
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
  private refusalNote(): string {
    const refused = ROUND_ZERO_FIELDS.filter((size) => !fits(size));
    if (refused.length === 0) return '';
    const named = refused
      .map((size) => `${size.mobs} / ${size.corpses}`)
      .join(', ');
    return `This build holds ${MOB_CAP} mobs and ${CORPSE_CAP} corpses, so it cannot stand ${named}. Those rows need a build made under vite.frame-budget.config.ts.`;
  }

  public reset() {
    this.queue = [];
    this.measured = [];
    this.current = null;
    this.fieldRenderer.detach();
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
