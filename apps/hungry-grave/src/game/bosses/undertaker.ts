// The Undertaker's own grammar (ADR 0007, ADR 0052, game-concept.md:70): the
// burial's falling clod curtains with one way through that always fits the
// grave, the exhumation's slow shovel arm and the bodies it digs up, and the
// two locked together in the last chunk.

import type { SimEvent } from '../events';
import { FIELD_WIDTH } from '../field';
import { graveWidth } from '../grave';
import { cos, sin } from '../math';
import type { FireRow } from '../mobFire';
import { fireDirectedShot } from '../mobFire';
import type { MobType } from '../mobs';
import { spawnMob } from '../mobs';
import type { RunState } from '../run';
import { TICK_HZ } from '../clock';
import type { Boss } from './chunks';

/**
 * One chunk's curtain (game-concept.md:70). Every number is an initial row
 * owned by the tuning pass at step 4; what is not tuning is the shape, one
 * curtain at a time with exactly one way through it.
 */
interface CurtainRow {
  // Ticks between curtains, which is also one full emit of this pattern.
  readonly period: number;
  /**
   * Clods in one curtain, beside the way through rather than counting it. The
   * count is what the last chunk thins to pay for the overlap, so the opening
   * is never what a busier screen is bought with.
   */
  readonly clods: number;
}

/**
 * One chunk's shovel arm. The same three initial rows describe both chunks that
 * turn one, because the escalation the last chunk buys is the curtain locked to
 * the arm rather than a faster arm.
 */
interface SpiralRow {
  // Ticks the arm takes to come all the way round, which is one full emit.
  readonly period: number;
  // Ticks between the shots that leave along the arm.
  readonly shotEvery: number;
  // Ticks between the bodies the arm digs up.
  readonly diggerEvery: number;
}

/**
 * His three chunks in order, one table per shape, each as long as his health
 * row: the burial throws curtains, the exhumation turns the arm, and the last
 * chunk does both (ADR 0052, decision 26). A chunk that does not run a shape
 * says so with a null rather than by being missing from the table, so a fourth
 * chunk is a row in three places and never a row in one.
 *
 * The last chunk's curtain carries two thirds of the first's clods, which is
 * the design record's Yuyuko trade: the shipped precedent buys simultaneity by
 * cutting density, and cutting it here also protects the never-a-wall rule.
 */
const CURTAIN_ROWS: readonly (CurtainRow | null)[] = [
  { period: 240, clods: 12 },
  null,
  { period: 240, clods: 8 },
];

const SPIRAL_ROWS: readonly (SpiralRow | null)[] = [
  null,
  { period: 300, shotEvery: 15, diggerEvery: 90 },
  { period: 300, shotEvery: 15, diggerEvery: 90 },
];

/**
 * How much wider than the grave the way through is cut (ADR 0003 through
 * game-concept.md:70). An initial row, and the reason it is a fixed addition
 * rather than a factor is the sentence it implements: size earned before the
 * fight is never punished, so a bigger grave gets a bigger opening and the
 * margin it steers with does not shrink as it grows.
 */
const GAP_MARGIN = 24;

/**
 * How far the way through walks between curtains, as a share of the field, when
 * nothing else places it. An initial row: at a fifth of the field per curtain
 * the opening crosses the whole field in five curtains, which is a walk the
 * grave has seconds to answer rather than a jump it has to be lucky about.
 */
const GAP_WALK = 0.2;

/**
 * How far behind the arm the way through sits in the locked overlap, in ticks.
 * A quarter of a revolution, and a whole number of the arm's own shot
 * intervals, so the opening is unmistakably somewhere the arm has been rather
 * than where it is standing now (decision 26).
 */
const GAP_LAG_TICKS = 75;

/**
 * How far the arm reaches, in field units. It is what the curtain reads to find
 * where the arm has swept, so it is a row rather than a drawing decision: at
 * two thirds of the field's half width the arm sweeps most of the field and
 * never past its edges.
 */
const ARM_REACH = 180;

/**
 * What he digs up: base trash through the ordinary spawn, so an add is pushed,
 * killed and eaten exactly like a body the timeline authored and no new mob
 * type is minted for the fight (game-concept.md:70, CONTEXT.md's adds rule).
 */
const DIGGER_TYPE: MobType = 'shambler';

// Where a curtain falls from: the top edge, because the dirt is thrown up and lands.
const CURTAIN_Y = 0;

// Straight down, which is the one bearing a curtain ever fires along.
const FALLING = { x: 0, y: 1 };

/**
 * What a clod is as mob fire. Slow is the part that is not tuning: dirt falls
 * slower than the trash shot the player has read all run, so a curtain is a
 * shape to cross rather than a reaction test, and it is wide enough to read as
 * a shovelful.
 */
const CLOD_FIRE: FireRow = {
  armedShare: 'none',
  interval: 0,
  firstShotJitter: 0,
  tellTicks: 0,
  shotSpeed: 95 / TICK_HZ,
  shotHalfExtent: 7,
};

// What leaves along the arm. Slower again, so the spiral reads as the arm's own trail.
const SPIRAL_FIRE: FireRow = {
  armedShare: 'none',
  interval: 0,
  firstShotJitter: 0,
  tellTicks: 0,
  shotSpeed: 85 / TICK_HZ,
  shotHalfExtent: 6,
};

/**
 * The way through a curtain: the grave's own width plus a fixed margin
 * (ADR 0003, game-concept.md:70).
 *
 * It takes the size scalar rather than the grave, so the one place in the game
 * where a boss's pattern reads the player's state holds no entity and is one
 * arithmetic function a test can walk from the size floor to the ceiling.
 */
const curtainGap = (graveSize: number): number => {
  return graveWidth(graveSize) + GAP_MARGIN;
};

const clamp = (value: number, low: number, high: number): number => {
  return Math.min(Math.max(value, low), high);
};

/**
 * Whether this tick is one the pattern acts on. The clock is read before it
 * moves, so a chunk's first tick is its pattern's zero and a chunk opens on the
 * beat rather than part-way through its own first cycle.
 */
const dueEvery = (every: number, patternTick: number): boolean => {
  return patternTick > 0 && patternTick % every === 0;
};

/**
 * A walk that turns back at the ends rather than jumping across, in [0, 1]. The
 * opening has to stay somewhere the grave could have followed it to, and a saw
 * tooth would teleport it across the whole field once a cycle.
 */
const walked = (turns: number): number => {
  const wrapped = ((turns % 2) + 2) % 2;
  return wrapped <= 1 ? wrapped : 2 - wrapped;
};

/**
 * The field x the arm reaches on this tick of its own clock. The arm is the
 * line the spiral's shots leave along, and this is where that line stands at
 * the arm's own reach.
 */
const armSweptX = (boss: Boss, row: SpiralRow, patternTick: number): number => {
  const turns = (patternTick / row.period) * 2 * Math.PI;
  // Through the sim's own trigonometry, which rounds to single precision, so
  // the arm sweeps the same way on every engine (ADR 0015).
  return boss.x + sin(turns) * ARM_REACH;
};

/**
 * Where a curtain opens. With no arm turning it walks the field on its own;
 * with one it opens where the arm has just swept, which is the whole of the
 * locked overlap (decision 26). Both read the one pattern clock, so the two
 * emitters cannot drift apart part-way through a chunk.
 *
 * It is held far enough from either edge that the whole opening is on the
 * field, because half an opening against a wall is not the width the gap rule
 * promised.
 */
const gapCentre = (
  boss: Boss,
  row: CurtainRow,
  spiral: SpiralRow | null,
  gap: number,
): number => {
  const wanted =
    spiral === null
      ? FIELD_WIDTH * walked(0.5 + (boss.patternTick / row.period) * GAP_WALK)
      : armSweptX(boss, spiral, boss.patternTick - GAP_LAG_TICKS);
  return clamp(wanted, gap / 2, FIELD_WIDTH - gap / 2);
};

/**
 * One curtain: its clods spread evenly across everything the opening does not
 * take. The count is the row's whatever the grave's size is, so a bigger grave
 * buys a wider way through and never a thinner curtain, and there is always a
 * way through by construction rather than by arithmetic that happens to work.
 */
const throwCurtain = (
  state: RunState,
  boss: Boss,
  row: CurtainRow,
  spiral: SpiralRow | null,
): SimEvent[] => {
  const gap = curtainGap(state.grave.size);
  const opensAt = gapCentre(boss, row, spiral, gap) - gap / 2;
  const spacing = (FIELD_WIDTH - gap) / row.clods;
  const events: SimEvent[] = [];
  for (let clod = 0; clod < row.clods; clod++) {
    const along = (clod + 0.5) * spacing;
    const from = { x: along < opensAt ? along : along + gap, y: CURTAIN_Y };

    events.push(
      ...fireDirectedShot(
        state,
        from,
        FALLING,
        CLOD_FIRE,
        'undertaker',
        'clod',
      ),
    );
  }
  return events;
};

/**
 * One body dug up where the arm is standing, at his own depth so it arrives on
 * the field rather than above it.
 *
 * A body the mob cap refuses is density the player never meets, which is the
 * same answer the authored rows give a refused non-carrier: an add carries no
 * offer, so nothing is lost that supply has to account for (ADR 0048).
 */
const digUpBody = (state: RunState, boss: Boss, row: SpiralRow): void => {
  spawnMob(
    state,
    DIGGER_TYPE,
    {
      x: armSweptX(boss, row, boss.patternTick),
      y: boss.y,
      vx: FALLING.x,
      vy: FALLING.y,
      index: 0,
    },
    false,
  );
};

/**
 * One tick of the arm: a shot along wherever it is pointing, and a body on its
 * own slower clock, so the exhumation feeds the fight while it is fired at
 * (ADR 0007's shed food).
 */
const turnArm = (state: RunState, boss: Boss, row: SpiralRow): SimEvent[] => {
  const events: SimEvent[] = [];
  if (dueEvery(row.shotEvery, boss.patternTick)) {
    const turns = (boss.patternTick / row.period) * 2 * Math.PI;
    const along = { x: sin(turns), y: cos(turns) };
    events.push(
      ...fireDirectedShot(
        state,
        { x: boss.x, y: boss.y },
        along,
        SPIRAL_FIRE,
        'undertaker',
        'spiral',
      ),
    );
  }
  if (dueEvery(row.diggerEvery, boss.patternTick)) digUpBody(state, boss, row);
  return events;
};

/**
 * One tick of whichever chunk is live: the arm first, then the curtain that
 * follows it, on the chunk's own clock.
 *
 * The arm goes first because the curtain reads where it has been, so a reader
 * meets the two in the order the pattern means them, and a chunk running both
 * is the two calls beside each other rather than a third pattern.
 */
const advanceUndertaker = (state: RunState, boss: Boss): SimEvent[] => {
  const curtain = CURTAIN_ROWS[boss.chunk] ?? null;
  const spiral = SPIRAL_ROWS[boss.chunk] ?? null;
  const events: SimEvent[] = [];
  if (spiral !== null) events.push(...turnArm(state, boss, spiral));
  if (curtain !== null && dueEvery(curtain.period, boss.patternTick)) {
    events.push(...throwCurtain(state, boss, curtain, spiral));
  }
  return events;
};

/**
 * His death sheds nothing of its own. game-concept.md:70: "his death is the
 * ending: he topples into the grave and the swallow is the victory animation,
 * no payout, the grave swallows the gravedigger." What the fight paid was paid
 * at the chunk breaks and by the bodies he dug up, and the ending itself is the
 * stage's rather than his module's.
 */
const undertakerDied = (): SimEvent[] => {
  return [];
};

export {
  advanceUndertaker,
  undertakerDied,
  curtainGap,
  CURTAIN_ROWS,
  SPIRAL_ROWS,
  CLOD_FIRE,
  SPIRAL_FIRE,
  ARM_REACH,
  DIGGER_TYPE,
  GAP_LAG_TICKS,
  GAP_MARGIN,
  GAP_WALK,
};
export type { CurtainRow, SpiralRow };
