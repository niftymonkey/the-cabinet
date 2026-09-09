// The authored timeline (ADR 0006): the phase machine over the rows.

import { bossChunks, spawnBoss } from '../bosses/chunks';
import { carrierRow, carriesAt } from '../carriers';
import { TICK_HZ } from '../clock';
import type { SimEvent } from '../events';
import { spawnMob } from '../mobs';
import type { RunState } from '../run';
import type { BossKind, StageRow } from './rows';
import {
  CROWD_ROWS,
  PROCESSION_ROWS,
  SET_PIECE_PLACED_AT,
  VIGIL_ROWS,
  WAKING_ROWS,
} from './rows';
import { placeSetPiece } from './setPiece';
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
 *
 * Only the two boss boundaries wait for an empty field, which is ADR 0051's own
 * ruling: the Crowd hands the set piece a field with trash on it and the set
 * piece hands the Vigil the trail it poured, so each of those two ends on the
 * source's own event instead.
 */
type PhaseEnd =
  'rowsSpentAndFieldClear' | 'setPieceOpened' | 'setPieceClosed' | 'bossKilled';

/**
 * Which loop plays under a phase, named for the phase the loop starts in and
 * never for a file. src/app resolves it to an asset alias; the sim never does.
 */
type PhaseMusic = 'procession' | 'crowd' | 'waking';

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
 * Both boss phases end when their boss is gone and the Waking when its source
 * is, so the three boundary phases are each as long as what happens in them.
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
    // The source's own moment: it begins the tick the eye opens and ends the
    // tick the source is gone, whichever of its three ends took it. It waits
    // for no field to clear, because only the two boss boundaries do
    // (ADR 0051), so the trail it poured is still falling when the Vigil's
    // cooldown row lands under it. Its rows are the Crowd's own last groups
    // carried on at the share that section keeps firing under a pour.
    name: 'waking',
    rows: WAKING_ROWS,
    ends: 'setPieceClosed',
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

/**
 * The phase at this index. phaseIndex only ever increases and advanceStage's
 * own loop keeps it under PHASES.length - 1 before enterNextPhase advances it,
 * so an index outside the table here is a bug in that invariant rather than a
 * case to handle.
 */
const phaseAt = (index: number): Phase => {
  const phase = PHASES[index];
  if (phase === undefined) throw new Error(`no phase at index ${index}`);
  return phase;
};

// Every row this phase authors has fired.
const rowsSpent = (state: RunState, phase: Phase): boolean => {
  return state.stage.firedRows >= phase.rows.length;
};

// Nothing the stage put on the field is alive on it.
const fieldClear = (state: RunState): boolean => {
  return !state.mobs.some((mob) => mob.alive);
};

/**
 * The two boss boundaries' own condition (ADR 0051): every row fired and the
 * last of its bodies gone, so the boss arrives alone on an empty field. It
 * terminates by construction, because every mob type descends.
 */
const phaseSpent = (state: RunState, phase: Phase): boolean => {
  return rowsSpent(state, phase) && fieldClear(state);
};

/**
 * Whether this phase's own end condition is met on this tick (ADR 0050,
 * ADR 0051). The condition is a column on the phase, so where a boundary falls
 * is stage data rather than a branch on a phase's name.
 *
 * The field is read as the tick begins, because advanceStage runs before the
 * tick's deaths and its cull: a phase ends on the tick after its last body
 * leaves rather than on the tick it left.
 *
 * A boss phase ends when no boss is standing in it, which is the tick after the
 * one its own died on, so how long the phase runs is how long the fight took
 * and never a number in this table (ADR 0050, CONTEXT.md's Phase).
 *
 * The Crowd ends on the eye opening and the Waking on the source leaving, so
 * neither waits for a field to clear: the Crowd hands the set piece a field with
 * trash on it and the set piece hands the Vigil the trail it poured, which is
 * ADR 0051's "only the two boss boundaries need the field empty".
 *
 * Both terminate by construction. The source is placed inside the field and
 * drifts downward at a fixed rate, so it always reaches its opening depth; once
 * open it spends a finite budget on a fixed interval, and the bottom edge is
 * behind that either way.
 */
const phaseEnded = (state: RunState, phase: Phase): boolean => {
  if (phase.ends === 'rowsSpentAndFieldClear') return phaseSpent(state, phase);
  if (phase.ends === 'bossKilled') return state.boss === null;
  if (phase.ends === 'setPieceClosed') return state.setPiece === null;
  return state.setPiece !== null && state.setPiece.open;
};

// Whether a banked offer may open on this tick (ADR 0034's bank, ADR 0048).
const bankOpensNow = (state: RunState): boolean => {
  return phaseAt(state.stage.phaseIndex).bankOpens;
};

const rowTicks = (row: StageRow): number => {
  return row.t * TICK_HZ;
};

/**
 * One row's bodies, placed. A body the mob cap refuses is density the player
 * never meets and the director's problem rather than the schedule's, but a
 * carrier it refuses is supply, and supply must not vanish at a cap (ADR 0048):
 * it is announced as lost with the cap as its reason, so the carrier ledger's
 * taken plus lost plus live still accounts for every carrier the stage
 * scheduled. The refusal is counted for the harness beside it, because a mob
 * cap that binds is a bug in the same way the corpse cap's is.
 */
const spawnRow = (state: RunState, row: StageRow, events: SimEvent[]): void => {
  const carrying = carrierRow(row.carries, row.count);
  const orders = place(row.template, row.count, state.streams.spawns);
  orders.forEach((order, position) => {
    const carries = carriesAt(carrying, position);
    if (spawnMob(state, row.type, order, carries) !== null) return;
    if (!carries) return;
    state.refusals.carriers += 1;
    events.push({
      type: 'carrierLost',
      mob: row.type,
      x: order.x,
      reason: 'cap',
    });
  });
};

/**
 * Every row whose phase-local time this tick has passed. Every spawn draws from
 * the spawns stream and every placement scatter draws from it too, so an
 * identical seed gives an identical spawn sequence (ADRs 0006 and 0012).
 */
const spawnDueRows = (
  state: RunState,
  phase: Phase,
  events: SimEvent[],
): void => {
  const stage = state.stage;
  while (stage.firedRows < phase.rows.length) {
    const row = phase.rows[stage.firedRows];
    if (row === undefined) {
      throw new Error(`no row at fired index ${stage.firedRows}`);
    }
    if (rowTicks(row) > stage.phaseTick) return;
    stage.firedRows += 1;
    spawnRow(state, row, events);
  }
};

/**
 * The dormant source, placed by the section that ends on it (ADR 0050).
 *
 * The phase's own end column is what says the section places it: the section
 * that ends on the eye opening is the section the eye is placed from, so which
 * one that is stays stage data and no name is tested here. It is placed once,
 * because a source on the field is what ends the phase and the phase after it
 * ends on the same one leaving.
 */
const placeDueSetPiece = (state: RunState, phase: Phase): void => {
  if (phase.ends !== 'setPieceOpened' || state.setPiece !== null) return;
  if (state.stage.phaseTick < SET_PIECE_PLACED_AT * TICK_HZ) return;
  placeSetPiece(state);
};

/**
 * The boss this phase carries, put on the field and announced (ADR 0007). It
 * reads the phase's own column, so which boss stands where is stage data.
 */
const arriveBoss = (
  state: RunState,
  phase: Phase,
  events: SimEvent[],
): void => {
  if (phase.boss === null) return;
  spawnBoss(state, phase.boss);
  events.push({
    type: 'bossArrived',
    boss: phase.boss,
    chunks: bossChunks(phase.boss),
  });
};

/**
 * The phase the run stands in, said out loud, with the loop that phase names
 * on it (ADR 0049).
 *
 * enterNextPhase is the only site that announces a phase, so the first phase of
 * the table has no crossing of its own: a run begins already inside it. Anything
 * outside the sim that follows the phase, the section's music above all, would
 * open a run deaf to the section it opens in, so the app asks for this once when
 * a run begins. It reports and changes nothing, so any tick may ask.
 */
const phaseUnderway = (state: RunState): SimEvent => {
  const phase = phaseAt(state.stage.phaseIndex);
  return {
    type: 'phaseChanged',
    phase: phase.name,
    music: phase.music,
    tick: state.tick,
  };
};

/**
 * The next phase, announced, with whatever boss it carries put on the field.
 *
 * It reads the table's own columns rather than a phase's name, so a phase
 * inserted with its columns filled in needs no edit here.
 */
const enterNextPhase = (state: RunState, events: SimEvent[]): void => {
  const stage = state.stage;
  stage.phaseIndex += 1;
  stage.phaseTick = 0;
  stage.firedRows = 0;
  events.push(phaseUnderway(state));
  arriveBoss(state, phaseAt(stage.phaseIndex), events);
};

/**
 * The boss whose death ends the stage (ADR 0050: "the Undertaker ends the third
 * and the stage"). It is read off the table's own last fight rather than
 * written down, so a stage that gains a section ends on that section's boss
 * with no edit here.
 */
const FINAL_BOSS: BossKind | null = PHASES.reduce<BossKind | null>(
  (last, phase) => phase.boss ?? last,
  null,
);

/**
 * Whether this tick's deaths hold the last fight the stage authors, won where
 * the stage authored it.
 *
 * The phase's own boss column is what says the fight is the one the run is
 * standing in, so a boss stood up outside its own phase by a rig ends nothing.
 */
const wonTheLastFight = (
  state: RunState,
  events: readonly SimEvent[],
): boolean => {
  const fight = phaseAt(state.stage.phaseIndex).boss;
  if (fight === null || fight !== FINAL_BOSS) return false;
  return events.some(
    (event) => event.type === 'bossKilled' && event.boss === fight,
  );
};

/**
 * ADR 0007's ending, on the tick the stage's last boss falls. game-concept.md:70
 * puts it plainly: "his death is the ending".
 *
 * It reads the tick's own bossKilled rather than the run reaching the last
 * phase. The stage crosses a phase at the top of a tick and a run that has
 * ended executes no further ticks (#52), so an ending hung on the crossing
 * would arrive a tick after the death or, once the run had ended on it, never.
 * The last boundary is announced here beside the ending because they are one
 * event: a tape that stopped on the fight would show six phases where the stage
 * has seven.
 *
 * Victory pays nothing. The topple into the grave is the renderer's animation
 * over a run that has already ended, so a player who never dives is not left
 * with a run still running and nothing to play.
 *
 * An ending already reached stands, because the same tick's hits resolve before
 * its deaths do: a grave sealed on the tick the last chunk empties lost the run
 * before the fight was won.
 */
const winStage = (
  state: RunState,
  tickEvents: readonly SimEvent[],
): SimEvent[] => {
  if (state.ending !== null) return [];
  if (!wonTheLastFight(state, tickEvents)) return [];
  const events: SimEvent[] = [];
  enterNextPhase(state, events);
  state.ending = 'victory';
  events.push({ type: 'victory', tick: state.tick });
  return events;
};

/**
 * This tick's spawns, and any phase boundary it crosses. It loops until a phase
 * is still live or the stage is over, because a phase whose end condition is
 * already met on the tick it begins hands straight on to the next one.
 *
 * The spawns come first, so a phase that fires its last row this tick is never
 * read as spent before the bodies that row put on the field are on it.
 */
const advanceStage = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  while (state.stage.phaseIndex < PHASES.length - 1) {
    const phase = phaseAt(state.stage.phaseIndex);
    spawnDueRows(state, phase, events);
    placeDueSetPiece(state, phase);
    if (!phaseEnded(state, phase)) return events;
    enterNextPhase(state, events);
  }
  return events;
};

export {
  createStage,
  phaseEnded,
  phaseUnderway,
  advanceStage,
  winStage,
  bankOpensNow,
  PHASES,
};
export type { PhaseName, PhaseEnd, PhaseMusic, Phase, StageState };
