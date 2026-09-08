// The authored timeline (ADR 0006): the phase machine over the rows.

import { carrierRow, carriesAt } from '../carriers';
import { TICK_HZ } from '../clock';
import type { SimEvent } from '../events';
import { spawnMob } from '../mobs';
import type { RunState } from '../run';
import type { StageRow } from './rows';
import { CROWD_ROWS, PROCESSION_ROWS } from './rows';
import { place } from './templates';

type PhaseName = 'ramp' | 'banshee' | 'backHalf' | 'undertaker' | 'over';

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
  { name: 'ramp', rows: PROCESSION_ROWS },
  { name: 'banshee', rows: [] },
  { name: 'backHalf', rows: CROWD_ROWS },
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
    const carrying = carrierRow(row.carries, row.count);
    const orders = place(row.template, row.count, state.streams.spawns);
    orders.forEach((order, position) => {
      spawnMob(state, row.type, order, carriesAt(carrying, position));
    });
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
  PHASES,
};
export type { PhaseName, Phase, StageState };
