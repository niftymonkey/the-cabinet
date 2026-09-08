// The authored timeline (ADR 0006): the phase machine over the rows.

import { carrierRow, carriesAt } from '../carriers';
import { TICK_HZ } from '../clock';
import type { SimEvent } from '../events';
import { spawnMob } from '../mobs';
import type { RunState } from '../run';
import type { BossKind, StageRow } from './rows';
import { CROWD_ROWS, PROCESSION_ROWS, VIGIL_ROWS } from './rows';
import { place } from './templates';

type PhaseName =
  | 'procession'
  | 'banshee'
  | 'crowd'
  | 'waking'
  | 'vigil'
  | 'undertaker'
  | 'over';

/**
 * What ends a phase (ADR 0050, ADR 0051). A section ends on its own boundary
 * event rather than on an absolute clock, because a shootable boss dies when
 * killed and fight length varies per player.
 */
type PhaseEnd = 'rowsSpentAndFieldClear' | 'setPieceOpened' | 'bossKilled';

/**
 * Which loop plays under a phase, named for the phase the loop starts in and
 * never for a file. src/app resolves it to an asset alias; the sim never does.
 */
type PhaseMusic = 'procession' | 'crowd' | 'waking';

/**
 * The spawn silence that lets the field empty before a boss arrives (glossary:
 * drain-out). It is silence in the rows and not a special rule: no row falls
 * inside it. ADR 0051 supersedes it with a sparse last row, and the phase's own
 * end condition replaces this length; both land in the slice after this one.
 *
 * Twenty seconds was computed honestly for a build with no weapons in it: with
 * nothing able to kill a mob the only way the field empties is everything
 * falling, and for the slowest type that is a little over eighteen seconds. That
 * is a weaponless artifact. Under the storm trash dies in a second or two, so
 * the silence only has to cover stragglers plus a breath.
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
 * follows the property and the property is not in danger.
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
  readonly ends: PhaseEnd;
  /**
   * Which boss arrives in this phase, or null. A column and not a switch, so
   * enterNextPhase reads the phase rather than testing its name.
   */
  readonly boss: BossKind | null;
  // Whether the director may spend anywhere in this phase (ADR 0047, ADR 0056).
  readonly directed: boolean;
  // The loop this phase plays, or null for the ending's fade (ADR 0049).
  readonly music: PhaseMusic | null;
  /**
   * What the director may not push a live count past here, or null where the
   * phase's property is a floor rather than a ceiling (ADR 0047, ADR 0050).
   *
   * It gates a spend and never faults an authored spawn. The Procession's rows
   * stand about nine seconds apart against a roughly fifteen-second unkilled
   * descent, so a player who kills slowly holds two templates with nothing
   * wrong, and ADR 0023 puts every invariant in the player's own build: written
   * as a law these two rows would fire at that player and land in their tape as
   * a defect in the game.
   */
  readonly liveTemplateCeiling: number | null;
  readonly liveBodyCeiling: number | null;
  /**
   * Whether a banked offer may open in this phase (ADR 0034, ADR 0048). True
   * everywhere unless the record names a reason, written beside the row.
   */
  readonly bankOpens: boolean;
}

/**
 * The seven phases in order: three sections and the boundary events between
 * them (ADR 0049, ADR 0050). They chain on those events rather than on one
 * absolute clock, because a shootable boss dies when killed and fight length
 * varies per player. The printed clock marks in the concept doc are nominal
 * design intent.
 *
 * The two boss phases and the set piece are stubbed: a phase with no boss and
 * no rows has nothing to run, so it ends on the tick it begins. That is
 * deliberately the simplest possible stub, and the boss and set-piece slices
 * replace it without moving anything else about the timeline.
 *
 * Three loops cover the seven phases and the two changes fall on the two
 * boundary events decision 22's amendment names, the Banshee's death and the
 * eye opening. A phase that inherits its predecessor's loop names the same
 * alias, and the audio engine makes a play call on an unchanged alias a no-op,
 * so seven phases naming three aliases produce two audible changes.
 */
const PHASES: readonly Phase[] = [
  {
    name: 'procession',
    rows: PROCESSION_ROWS,
    ends: 'rowsSpentAndFieldClear',
    boss: null,
    directed: true,
    music: 'procession',
    liveTemplateCeiling: 1,
    liveBodyCeiling: null,
    bankOpens: true,
  },
  {
    name: 'banshee',
    rows: [],
    ends: 'bossKilled',
    boss: 'banshee',
    directed: false,
    music: 'procession',
    liveTemplateCeiling: null,
    liveBodyCeiling: null,
    bankOpens: true,
  },
  {
    name: 'crowd',
    rows: CROWD_ROWS,
    ends: 'setPieceOpened',
    boss: null,
    directed: true,
    music: 'crowd',
    liveTemplateCeiling: null,
    liveBodyCeiling: null,
    bankOpens: true,
  },
  {
    // It authors no rows and sheds no boss, so what clears its field is the
    // pour running out. Whether that wants a member of its own on PhaseEnd is
    // the set piece's own slice to rule.
    name: 'waking',
    rows: [],
    ends: 'rowsSpentAndFieldClear',
    boss: null,
    directed: false,
    music: 'waking',
    liveTemplateCeiling: null,
    liveBodyCeiling: null,
    bankOpens: true,
  },
  {
    name: 'vigil',
    rows: VIGIL_ROWS,
    ends: 'rowsSpentAndFieldClear',
    boss: null,
    directed: true,
    music: 'waking',
    liveTemplateCeiling: null,
    liveBodyCeiling: 4,
    bankOpens: true,
  },
  {
    name: 'undertaker',
    rows: [],
    ends: 'bossKilled',
    boss: 'undertaker',
    directed: false,
    music: 'waking',
    liveTemplateCeiling: null,
    liveBodyCeiling: null,
    bankOpens: true,
  },
  {
    // The run has ended here, so nothing opens and nothing plays: the fade out
    // is the ending. It is the one phase whose bank is shut, and the reason is
    // that there is no run left to spend an offer in.
    name: 'over',
    rows: [],
    ends: 'rowsSpentAndFieldClear',
    boss: null,
    directed: false,
    music: null,
    liveTemplateCeiling: null,
    liveBodyCeiling: null,
    bankOpens: false,
  },
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

// Whether a banked offer may open on this tick (ADR 0034's bank, ADR 0048).
const bankOpensNow = (state: RunState): boolean => {
  return PHASES[state.stage.phaseIndex].bankOpens;
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
 * The next phase, announced, and the run's end where the table runs out.
 *
 * It reads the table's own end rather than a phase's name, so a phase inserted
 * with its columns filled in needs no edit here. Victory itself is stubbed: in
 * the finished game the Undertaker's death is the ending and his swallow is the
 * animation (ADR 0007), and the stub exists so that every deploy is a complete
 * run in both directions.
 */
const enterNextPhase = (state: RunState, events: SimEvent[]): void => {
  const stage = state.stage;
  stage.phaseIndex += 1;
  stage.phaseTick = 0;
  stage.firedRows = 0;
  const phase = PHASES[stage.phaseIndex];
  events.push({ type: 'phaseChanged', phase: phase.name, tick: state.tick });
  if (stage.phaseIndex < PHASES.length - 1) return;
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
  bankOpensNow,
  DRAIN_OUT_SECONDS,
  PHASES,
};
export type { PhaseName, PhaseEnd, PhaseMusic, Phase, StageState };
