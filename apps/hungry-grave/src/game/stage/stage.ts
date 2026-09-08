// The authored timeline (ADR 0006): the phase machine over the rows.

import { bossChunks, spawnBoss } from '../bosses/chunks';
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
 * Both boss phases are real fights and end when their boss is gone. The set
 * piece is still stubbed: its phase authors no rows, so it ends when the trash
 * the Crowd handed it has left, and the slice that builds the source replaces
 * that without moving anything else about the timeline.
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
    // pour running out. Until the pour exists it stands on the condition below
    // and waits for the trash the Crowd handed it to leave. Whether the set
    // piece's own end wants a member of its own on PhaseEnd is its slice to
    // rule.
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
 * A phase whose column names something that does not exist yet ends on its own
 * rows running out. That is the Crowd's stand-in until the eye can open: the
 * Crowd hands the phase after it a field with trash on it, which is the half of
 * ADR 0051 that already holds.
 */
const phaseEnded = (state: RunState, phase: Phase): boolean => {
  if (phase.ends === 'rowsSpentAndFieldClear') return phaseSpent(state, phase);
  if (phase.ends === 'bossKilled') return state.boss === null;
  return rowsSpent(state, phase);
};

// Whether a banked offer may open on this tick (ADR 0034's bank, ADR 0048).
const bankOpensNow = (state: RunState): boolean => {
  return PHASES[state.stage.phaseIndex].bankOpens;
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
  while (
    stage.firedRows < phase.rows.length &&
    rowTicks(phase.rows[stage.firedRows]) <= stage.phaseTick
  ) {
    const row = phase.rows[stage.firedRows];
    stage.firedRows += 1;
    spawnRow(state, row, events);
  }
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
  const phase = PHASES[stage.phaseIndex];
  events.push({ type: 'phaseChanged', phase: phase.name, tick: state.tick });
  arriveBoss(state, phase, events);
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
  const fight = PHASES[state.stage.phaseIndex].boss;
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
    const phase = PHASES[state.stage.phaseIndex];
    spawnDueRows(state, phase, events);
    if (!phaseEnded(state, phase)) return events;
    enterNextPhase(state, events);
  }
  return events;
};

export {
  createStage,
  phaseEnded,
  advanceStage,
  winStage,
  bankOpensNow,
  PHASES,
};
export type { PhaseName, PhaseEnd, PhaseMusic, Phase, StageState };
