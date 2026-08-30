// The authored timeline (ADR 0006): the phase machine, and the rows as data.

import { TICK_HZ } from '../clock';
import type { SimEvent } from '../events';
import type { MobType } from '../mobs';
import { spawnMob } from '../mobs';
import type { RunState } from '../run';
import type { TemplateName } from './templates';
import { place } from './templates';

type PhaseName = 'ramp' | 'banshee' | 'backHalf' | 'undertaker' | 'over';

interface StageRow {
  // Phase-local seconds. Rows fire when the phase-local tick passes this time.
  readonly t: number;
  readonly template: TemplateName;
  /**
   * Count lives on the row and never on the template, so density tuning never
   * edits a playtest-proven shape.
   */
  readonly count: number;
  readonly type: MobType;
}

/**
 * The spawn silence that lets the field empty before a boss arrives (glossary:
 * drain-out). It is silence in the rows and not a special rule: no row falls
 * inside it.
 *
 * Twenty seconds was computed honestly for a build with no weapons in it: with
 * nothing able to kill a mob the only way the field empties is everything
 * falling, and for the slowest type that is a little over eighteen seconds. That
 * is a weaponless artifact. Under the storm trash dies in a second or two, so
 * the silence only has to cover stragglers plus a breath, and twenty seconds of
 * nothing twice in a three and a half minute run is a sixth of the run with
 * nothing to do.
 *
 * The new number cannot be derived from falling either, because under the storm
 * the field is emptied partly by kills. It is measured instead, across the five
 * full-run seeds and both drain-outs with the grave held immortal, which is the
 * same rig the property test uses. The storm is what buys the three seconds off
 * the weaponless twenty, and it buys no more than that at the birthright build
 * a run spends most of its length in.
 *
 * Seventeen was the smallest whole second that cleared every seed when it was
 * set: the field emptied 14.6 to 16.3 seconds after a phase's last row against
 * a storm whose level-1 ground released an ordinary shambler alive.
 * Re-measured after #76 pass D's delivery slice, which lays claimed ground
 * up-field of a crowd instead of around it, the range is 14.98 to 15.47 and the
 * smallest whole second that clears is sixteen. Seventeen is held rather than
 * followed down: it clears every seed with a second to spare, the magnitude
 * follows the property and the property is not in danger, and taking a second
 * of authored silence out of both drain-outs is a pacing change nobody asked
 * for. The slack is recorded here so the next pass sees it rather than
 * rediscovering it.
 *
 * What is pinned by test is the property, that the field is empty when the boss
 * phase begins, asserted across all five seeds in
 * src/dev/__tests__/bot.test.ts. This magnitude follows that property and never
 * the other way round.
 */
const DRAIN_OUT_SECONDS = 17;

/**
 * The first 45 seconds are Drips and one File; Files, Vs and Pincers then
 * overlap two at a time with Rain joining thin. A new mob type always arrives
 * first as a lone Drip, so ADR 0016's readable-before-it-acts rule has
 * somewhere to be read.
 *
 * Every count in this table and in BACK_HALF_ROWS is first-pass tuning owned by
 * the tuning dispatch. What is not tuning, and must not be quietly changed, is
 * the shape: teaching Drips before a type appears in numbers, the 45-second
 * ramp, a drain-out long enough that the field is empty at the boundary, and
 * the Wall's count matching the shambler's width.
 *
 * The Drip of three at t=14 is the game's first mob fire. Three shamblers
 * spread across the width arrive together and exactly one of them is armed, so
 * it is the only place in the game where a player sees armed and unarmed side
 * by side in one glance and can calibrate the marker.
 */
const RAMP_ROWS: readonly StageRow[] = [
  { t: 2, template: 'drip', count: 1, type: 'shambler' },
  { t: 8, template: 'drip', count: 1, type: 'shambler' },
  { t: 14, template: 'drip', count: 3, type: 'shambler' },
  { t: 20, template: 'file', count: 5, type: 'shambler' },
  { t: 30, template: 'drip', count: 2, type: 'shambler' },
  { t: 36, template: 'drip', count: 3, type: 'shambler' },
  { t: 42, template: 'drip', count: 1, type: 'revenant' },
  { t: 46, template: 'v', count: 5, type: 'shambler' },
  { t: 52, template: 'file', count: 6, type: 'shambler' },
  { t: 56, template: 'pincer', count: 6, type: 'shambler' },
  { t: 62, template: 'drip', count: 1, type: 'ghoul' },
  { t: 66, template: 'v', count: 7, type: 'shambler' },
  { t: 70, template: 'rain', count: 6, type: 'shambler' },
  { t: 74, template: 'file', count: 4, type: 'revenant' },
  { t: 78, template: 'pincer', count: 8, type: 'shambler' },
  { t: 83, template: 'v', count: 7, type: 'ghoul' },
  { t: 88, template: 'rain', count: 6, type: 'shambler' },
  { t: 92, template: 'file', count: 6, type: 'shambler' },
  { t: 96, template: 'pincer', count: 8, type: 'shambler' },
  { t: 101, template: 'rain', count: 8, type: 'shambler' },
  { t: 105, template: 'v', count: 7, type: 'shambler' },
];

/**
 * The Wall first, then a climb through Rain, Pincers and Vs overlapping two and
 * three at a time to a sustained peak just under Wall density.
 *
 * The Wall's clock anchors on the Banshee's death, and with the boss phase
 * stubbed to end on the tick it begins, its row at phase-local t=2 lands two
 * seconds into the back half, which is where the concept doc puts it.
 */
const BACK_HALF_ROWS: readonly StageRow[] = [
  { t: 2, template: 'wall', count: 22, type: 'shambler' },
  { t: 10, template: 'rain', count: 6, type: 'shambler' },
  { t: 14, template: 'pincer', count: 8, type: 'shambler' },
  { t: 19, template: 'v', count: 7, type: 'ghoul' },
  { t: 23, template: 'rain', count: 8, type: 'shambler' },
  { t: 26, template: 'file', count: 5, type: 'revenant' },
  { t: 30, template: 'pincer', count: 8, type: 'shambler' },
  { t: 32, template: 'rain', count: 8, type: 'shambler' },
  { t: 37, template: 'v', count: 7, type: 'shambler' },
  { t: 40, template: 'rain', count: 10, type: 'shambler' },
  { t: 43, template: 'pincer', count: 8, type: 'ghoul' },
  { t: 46, template: 'v', count: 7, type: 'shambler' },
  { t: 50, template: 'rain', count: 10, type: 'shambler' },
  { t: 53, template: 'file', count: 6, type: 'revenant' },
  { t: 56, template: 'pincer', count: 8, type: 'shambler' },
  { t: 58, template: 'rain', count: 12, type: 'shambler' },
  { t: 62, template: 'v', count: 7, type: 'ghoul' },
  { t: 65, template: 'pincer', count: 8, type: 'shambler' },
  { t: 68, template: 'rain', count: 12, type: 'shambler' },
];

interface Phase {
  readonly name: PhaseName;
  readonly rows: readonly StageRow[];
}

/**
 * The five phases in order. They chain on boundary events rather than on one
 * absolute clock, because a shootable boss dies when killed and fight length
 * varies per player. The printed clock marks in the concept doc are nominal
 * design intent.
 *
 * The two boss phases are stubbed: a boss phase with no boss has no rows, so it
 * ends on the tick it begins. That is deliberately the simplest possible stub,
 * and the boss dispatch replaces it without moving anything else about the
 * timeline.
 */
const PHASES: readonly Phase[] = [
  { name: 'ramp', rows: RAMP_ROWS },
  { name: 'banshee', rows: [] },
  { name: 'backHalf', rows: BACK_HALF_ROWS },
  { name: 'undertaker', rows: [] },
  { name: 'over', rows: [] },
];

interface StageState {
  // Which phase of PHASES the run is in. It only ever increases.
  phaseIndex: number;
  // Ticks since this phase began. It resets to zero at a boundary.
  phaseTick: number;
  // How many of this phase's rows have fired.
  firedRows: number;
}

const createStage = (): StageState => {
  return { phaseIndex: 0, phaseTick: 0, firedRows: 0 };
};

// A phase's length is its last row's time plus the drain-out. A phase with no rows ends on the tick it begins.
const phaseLengthTicks = (phase: Phase): number => {
  if (phase.rows.length === 0) return 0;
  const last = phase.rows[phase.rows.length - 1].t;
  return (last + DRAIN_OUT_SECONDS) * TICK_HZ;
};

const rowTicks = (row: StageRow): number => {
  return row.t * TICK_HZ;
};

/**
 * Every row whose phase-local time this tick has passed. Every spawn draws from
 * the spawns stream and every placement scatter draws from it too, so an
 * identical seed gives an identical spawn sequence (ADRs 0006 and 0012).
 */
const spawnDueRows = (state: RunState, phase: Phase): void => {
  const stage = state.stage;
  while (
    stage.firedRows < phase.rows.length &&
    rowTicks(phase.rows[stage.firedRows]) <= stage.phaseTick
  ) {
    const row = phase.rows[stage.firedRows];
    stage.firedRows += 1;
    for (const order of place(row.template, row.count, state.streams.spawns)) {
      spawnMob(state, row.type, order);
    }
  }
};

/**
 * Victory is stubbed. In the finished game the Undertaker's death is the ending
 * and his swallow is the animation (ADR 0007); the stub exists so that every
 * deploy is a complete run in both directions.
 */
const enterNextPhase = (state: RunState, events: SimEvent[]): void => {
  const stage = state.stage;
  stage.phaseIndex += 1;
  stage.phaseTick = 0;
  stage.firedRows = 0;
  const phase = PHASES[stage.phaseIndex];
  events.push({ type: 'phaseChanged', phase: phase.name, tick: state.tick });
  if (phase.name !== 'over') return;
  state.ending = 'victory';
  events.push({ type: 'victory', tick: state.tick });
};

/**
 * This tick's spawns, and any phase boundary it crosses. More than one boundary
 * can fall on one tick, because a stubbed boss phase ends on the tick it
 * begins, so the loop runs until a phase is still live or the stage is over.
 */
const advanceStage = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  while (state.stage.phaseIndex < PHASES.length - 1) {
    const phase = PHASES[state.stage.phaseIndex];
    spawnDueRows(state, phase);
    if (state.stage.phaseTick < phaseLengthTicks(phase)) return events;
    enterNextPhase(state, events);
  }
  return events;
};

export {
  createStage,
  phaseLengthTicks,
  advanceStage,
  DRAIN_OUT_SECONDS,
  RAMP_ROWS,
  BACK_HALF_ROWS,
  PHASES,
};
export type { PhaseName, StageRow, Phase, StageState };
