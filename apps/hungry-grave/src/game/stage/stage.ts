// The authored timeline (ADR 0006): the section machine over the waves.

import { bossPhases, spawnBoss } from '../bosses/phases';
import { waveCarriers, carriesAt } from '../carriers';
import { TICK_HZ } from '../clock';
import type { SimEvent } from '../events';
import { spawnMob } from '../mobs';
import type { RunState } from '../run';
import type { DirectorState } from '../director';
import { directorSpend } from '../director';
import type { BossKind, StageWave } from './waves';
import {
  CROWD_PURSE,
  CROWD_WAVES,
  PROCESSION_PURSE,
  PROCESSION_WAVES,
  repeatingArrivals,
  SET_PIECE_PLACED_AT,
  VIGIL_PURSE,
  VIGIL_WAVES,
  WAKING_WAVES,
} from './waves';
import { placeSetPiece } from './setPiece';
import type { SpawnOrder } from './formations';
import { place } from './formations';

type SectionName =
  | 'procession'
  | 'banshee'
  | 'crowd'
  | 'waking'
  | 'vigil'
  | 'undertaker'
  | 'over';

/**
 * What ends a section (ADR 0050, ADR 0051). A section ends on its own boundary
 * event rather than on an absolute clock, because a shootable boss dies when
 * killed and fight length varies per player.
 *
 * Only the two boss boundaries wait for an empty field, which is ADR 0051's own
 * ruling: the Crowd hands the set piece a field with trash on it and the set
 * piece hands the Vigil the trail it poured, so each of those two ends on the
 * source's own event instead.
 */
type SectionEnd =
  | 'wavesSpentAndFieldClear'
  | 'setPieceOpened'
  | 'setPieceClosed'
  | 'bossKilled';

/**
 * Which loop plays under a section, named for the section the loop starts in and
 * never for a file. src/app resolves it to an asset alias; the sim never does.
 */
type SectionMusic = 'procession' | 'crowd' | 'waking';

interface Section {
  readonly name: SectionName;
  readonly waves: readonly StageWave[];
  readonly ends: SectionEnd;
  /**
   * Which boss arrives in this section, or null. A column and not a switch, so
   * enterNextSection reads the section rather than testing its name.
   */
  readonly boss: BossKind | null;
  // Whether the director may spend anywhere in this section (ADR 0047, ADR 0056).
  readonly directed: boolean;
  // The loop this section plays, or null for the ending's fade (ADR 0049).
  readonly music: SectionMusic | null;
  /**
   * What the director may not push a live count past here, or null where the
   * section's property is a floor rather than a ceiling (ADR 0047, ADR 0050).
   *
   * It gates a spend and never faults an authored spawn. The Procession's waves
   * stand about nine seconds apart against a roughly fifteen-second unkilled
   * descent, so a player who kills slowly holds two formations with nothing
   * wrong, and ADR 0023 puts every invariant in the player's own build: written
   * as a law these two waves would fire at that player and land in their tape as
   * a defect in the game.
   *
   * One is the only figure it can state, which is why the column's type is the
   * literal and not a number. The director counts live formations off
   * Mob.from, which says what put a body on the field and never which group it
   * arrived in, so shaped bodies alive mean at least one live formation and the
   * count cannot tell one from two. A two here would compile, pass, and quietly
   * gate at one; a table that wants two needs the bodies to carry their group
   * first, and nothing in the tree does.
   */
  readonly liveFormationCeiling: 1 | null;
  readonly liveBodyCeiling: number | null;
  /**
   * Whether a banked offer may open in this section (ADR 0034, ADR 0048). True
   * everywhere unless the record names a reason, written beside the wave.
   */
  readonly bankOpens: boolean;
  /**
   * The finite budget this section gives the director, counted in bodies
   * (ADR 0056). Null where the section is undirected, so a section that may not
   * spend has nothing to spend rather than a zero.
   *
   * The figure itself is a constant in waves.ts and this column is a reference
   * to it, on the same terms as `waves`, because caps.ts derives from the table
   * and may not import this module.
   *
   * A purse of zero is the third reading and not the same as either: a section
   * the director may look at and find empty from the first tick, which is the
   * Vigil's, against a spent purse, which is a section that has run its budget
   * out and stands at its authored floor for the rest of its length.
   */
  readonly purse: number | null;
}

/**
 * The seven sections in order: three sections and the boundary events between
 * them (ADR 0049, ADR 0050). They chain on those events rather than on one
 * absolute clock, because a shootable boss dies when killed and fight length
 * varies per player. The printed clock marks in the concept doc are nominal
 * design intent.
 *
 * Both boss sections end when their boss is gone and the Waking when its source
 * is, so the three boundary sections are each as long as what happens in them.
 *
 * Three loops cover the seven sections and the two changes fall on the two
 * boundary events decision 22's amendment names, the Banshee's death and the
 * eye opening. A section that inherits its predecessor's loop names the same
 * alias, and the audio engine makes a play call on an unchanged alias a no-op,
 * so seven sections naming three aliases produce two audible changes.
 */
const SECTIONS: readonly Section[] = [
  {
    name: 'procession',
    waves: PROCESSION_WAVES,
    ends: 'wavesSpentAndFieldClear',
    boss: null,
    directed: true,
    music: 'procession',
    liveFormationCeiling: 1,
    liveBodyCeiling: null,
    bankOpens: true,
    purse: PROCESSION_PURSE,
  },
  {
    name: 'banshee',
    waves: [],
    ends: 'bossKilled',
    boss: 'banshee',
    directed: false,
    music: 'procession',
    liveFormationCeiling: null,
    liveBodyCeiling: null,
    bankOpens: true,
    purse: null,
  },
  {
    name: 'crowd',
    waves: CROWD_WAVES,
    ends: 'setPieceOpened',
    boss: null,
    directed: true,
    music: 'crowd',
    liveFormationCeiling: null,
    liveBodyCeiling: null,
    bankOpens: true,
    purse: CROWD_PURSE,
  },
  {
    // The source's own moment: it begins the tick the eye opens and ends the
    // tick the source is gone, whichever of its three ends took it. It waits
    // for no field to clear, because only the two boss boundaries do
    // (ADR 0051), so the trail it poured is still falling when the Vigil's
    // cooldown wave lands under it. Its waves are the Crowd's own last groups
    // carried on at the share that section keeps firing under a pour.
    name: 'waking',
    waves: WAKING_WAVES,
    ends: 'setPieceClosed',
    boss: null,
    directed: false,
    music: 'waking',
    liveFormationCeiling: null,
    liveBodyCeiling: null,
    bankOpens: true,
    purse: null,
  },
  {
    name: 'vigil',
    waves: VIGIL_WAVES,
    ends: 'wavesSpentAndFieldClear',
    boss: null,
    directed: true,
    music: 'waking',
    liveFormationCeiling: null,
    // Twenty-eight, which is twice the fourteen shaped bodies this section now
    // actually stands live, so the headroom the director may spend into is the
    // section's own floor again and no more, which is the relation the figure
    // it replaces was set on. It was 4 against a steady state of about two,
    // and slice B's re-authored table left that stale: measured with the grave
    // held at the ceiling on seed 77, a diving hand, the Vigil's own waves
    // stand a mean of 12.6 shaped bodies live at rung 5 and 15.8 at rung 1,
    // peaking at 38 and 40. It gates nothing today, because VIGIL_PURSE is
    // zero and a section with nothing to spend never reaches a ceiling.
    liveBodyCeiling: 28,
    bankOpens: true,
    purse: VIGIL_PURSE,
  },
  {
    name: 'undertaker',
    waves: [],
    ends: 'bossKilled',
    boss: 'undertaker',
    directed: false,
    music: 'waking',
    liveFormationCeiling: null,
    liveBodyCeiling: null,
    bankOpens: true,
    purse: null,
  },
  {
    // The run has ended here, so nothing opens and nothing plays: the fade out
    // is the ending. It is the one section whose bank is shut, and the reason is
    // that there is no run left to spend an offer in.
    name: 'over',
    waves: [],
    ends: 'wavesSpentAndFieldClear',
    boss: null,
    directed: false,
    music: null,
    liveFormationCeiling: null,
    liveBodyCeiling: null,
    bankOpens: false,
    purse: null,
  },
];

interface StageState {
  // Which section of SECTIONS the run is in. It only ever increases.
  sectionIndex: number;
  // Ticks since this section began. It resets to zero at a boundary.
  sectionTick: number;
  // How many of this section's waves have fired.
  firedWaves: number;
}

const createStage = (): StageState => {
  return { sectionIndex: 0, sectionTick: 0, firedWaves: 0 };
};

/**
 * The section at this index. sectionIndex only ever increases and advanceStage's
 * own loop keeps it under SECTIONS.length - 1 before enterNextSection advances it,
 * so an index outside the table here is a bug in that invariant rather than a
 * case to handle.
 */
const sectionAt = (index: number): Section => {
  const section = SECTIONS[index];
  if (section === undefined) throw new Error(`no section at index ${index}`);
  return section;
};

// Every wave this section authors has fired.
const wavesSpent = (state: RunState, section: Section): boolean => {
  return state.stage.firedWaves >= section.waves.length;
};

// Nothing the stage put on the field is alive on it.
const fieldClear = (state: RunState): boolean => {
  return !state.mobs.some((mob) => mob.alive);
};

/**
 * The two boss boundaries' own condition (ADR 0051): every wave fired and the
 * last of its bodies gone, so the boss arrives alone on an empty field. It
 * terminates by construction, because every mob type descends.
 */
const sectionSpent = (state: RunState, section: Section): boolean => {
  return wavesSpent(state, section) && fieldClear(state);
};

/**
 * Whether this section's own end condition is met on this tick (ADR 0050,
 * ADR 0051). The condition is a column on the section, so where a boundary falls
 * is stage data rather than a branch on a section's name.
 *
 * The field is read as the tick begins, because advanceStage runs before the
 * tick's deaths and its cull: a section ends on the tick after its last body
 * leaves rather than on the tick it left.
 *
 * A boss section ends when no boss is standing in it, which is the tick after the
 * one its own died on, so how long the section runs is how long the fight took
 * and never a number in this table (ADR 0050, CONTEXT.md's Section).
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
const sectionEnded = (state: RunState, section: Section): boolean => {
  if (section.ends === 'wavesSpentAndFieldClear')
    return sectionSpent(state, section);
  if (section.ends === 'bossKilled') return state.boss === null;
  if (section.ends === 'setPieceClosed') return state.setPiece === null;
  return state.setPiece !== null && state.setPiece.open;
};

// Whether a banked offer may open on this tick (ADR 0034's bank, ADR 0048).
const bankOpensNow = (state: RunState): boolean => {
  return sectionAt(state.stage.sectionIndex).bankOpens;
};

const waveTicks = (wave: StageWave): number => {
  return wave.t * TICK_HZ;
};

/**
 * One wave's bodies, placed. A body the mob cap refuses is density the player
 * never meets and the director's problem rather than the schedule's, but a
 * carrier it refuses is supply, and supply must not vanish at a cap (ADR 0048):
 * it is announced as lost with the cap as its reason, so the carrier ledger's
 * taken plus lost plus live still accounts for every carrier the stage
 * scheduled. The refusal is counted for the harness beside it, because a mob
 * cap that binds is a bug in the same way the corpse cap's is.
 */
const spawnWave = (
  state: RunState,
  wave: StageWave,
  events: SimEvent[],
): void => {
  const carrying = waveCarriers(wave.carries, wave.count);
  const orders = place(wave.formation, wave.count, state.streams.spawns);
  // Where the body came from is read off the wave rather than passed in,
  // because a standing wave is a wave carrying repeat fields (ADR 0060) and
  // both of this function's callers fire through the same placement.
  const from = wave.repeat === null ? 'wave' : 'standingWave';
  orders.forEach((order, position) => {
    const carries = carriesAt(carrying, position);
    if (spawnMob(state, wave.type, order, carries, from) !== null) return;
    if (!carries) return;
    state.refusals.carriers += 1;
    events.push({
      type: 'carrierLost',
      mob: wave.type,
      x: order.x,
      reason: 'cap',
    });
  });
};

/**
 * Every wave whose section-local time this tick has passed. Every spawn draws from
 * the spawns stream and every placement scatter draws from it too, so an
 * identical seed gives an identical spawn sequence (ADRs 0006 and 0012).
 */
const spawnDueWaves = (
  state: RunState,
  section: Section,
  events: SimEvent[],
): void => {
  const stage = state.stage;
  while (stage.firedWaves < section.waves.length) {
    const wave = section.waves[stage.firedWaves];
    if (wave === undefined) {
      throw new Error(`no wave at fired index ${stage.firedWaves}`);
    }
    if (waveTicks(wave) > stage.sectionTick) return;
    stage.firedWaves += 1;
    spawnWave(state, wave, events);
  }
};

/**
 * The standing wave the section is holding: the last wave carrying a repeat
 * among the ones the cursor has already fired (ADR 0060).
 *
 * It is the whole of what the stage needs to stand a rate, and it is why no
 * column, no constant and no new stage state comes with the standing waves. The
 * wave that stands is by definition the most recent one the tick has passed, a
 * later wave that also stands replaces it, and the cursor the one-shot waves
 * already keep is what says which that is. A replay therefore rebuilds the rate
 * by rebuilding the cursor, and the witness folds nothing new.
 */
const standingWave = (state: RunState, section: Section): StageWave | null => {
  const fired = section.waves.slice(0, state.stage.firedWaves);
  return fired.reduce<StageWave | null>(
    (standing, wave) => (wave.repeat === null ? standing : wave),
    null,
  );
};

/**
 * How many of the standing wave's groups this tick is owed.
 *
 * The wave's own first group is fired by the cursor, on the tick spawnDueWaves
 * consumes it, exactly as a one-shot wave's is, so nothing is owed at or before
 * that time and nothing double-fires. After it, the answer is what the wave has
 * landed by this tick less what it had landed by the one before, which is the
 * stateless form of a timer: repeatingArrivals counts from the section's start,
 * so the difference is this tick's own.
 *
 * This is the one place the seconds a wave is authored in meet the ticks the
 * run is played in, because waves.ts value-imports nothing and cannot reach
 * TICK_HZ for itself.
 */
const standingArrivals = (wave: StageWave, sectionTick: number): number => {
  const seconds = sectionTick / TICK_HZ;
  if (seconds <= wave.t) return 0;
  const before = Math.max(wave.t, (sectionTick - 1) / TICK_HZ);
  return repeatingArrivals(wave, seconds) - repeatingArrivals(wave, before);
};

/**
 * The floor the section is standing at, landed (ADR 0060). The groups go down
 * through the same spawnWave a one-shot wave uses, because a standing wave is a
 * wave: what repeats is the firing and never the kind of body it lands.
 */
const spawnStandingRate = (
  state: RunState,
  section: Section,
  events: SimEvent[],
): void => {
  const wave = standingWave(state, section);
  if (wave === null) return;
  const due = standingArrivals(wave, state.stage.sectionTick);
  for (let landed = 0; landed < due; landed++) spawnWave(state, wave, events);
};

/**
 * The dormant source, placed by the section that ends on it (ADR 0050).
 *
 * The section's own end column is what says the section places it: the section
 * that ends on the eye opening is the section the eye is placed from, so which
 * one that is stays stage data and no name is tested here. It is placed once,
 * because a source on the field is what ends the section and the section after it
 * ends on the same one leaving.
 */
const placeDueSetPiece = (state: RunState, section: Section): void => {
  if (section.ends !== 'setPieceOpened' || state.setPiece !== null) return;
  if (state.stage.sectionTick < SET_PIECE_PLACED_AT * TICK_HZ) return;
  placeSetPiece(state);
};

/**
 * The boss this section carries, put on the field and announced (ADR 0007). It
 * reads the section's own column, so which boss stands where is stage data.
 */
const arriveBoss = (
  state: RunState,
  section: Section,
  events: SimEvent[],
): void => {
  if (section.boss === null) return;
  spawnBoss(state, section.boss);
  events.push({
    type: 'bossArrived',
    boss: section.boss,
    phases: bossPhases(section.boss),
  });
};

/**
 * The section the run stands in, said out loud, with the loop that section names
 * on it (ADR 0049).
 *
 * enterNextSection is the only site that announces a section, so the first section of
 * the table has no crossing of its own: a run begins already inside it. Anything
 * outside the sim that follows the section, the section's music above all, would
 * open a run deaf to the section it opens in, so the app asks for this once when
 * a run begins. It reports and changes nothing, so any tick may ask.
 */
const sectionUnderway = (state: RunState): SimEvent => {
  const section = sectionAt(state.stage.sectionIndex);
  return {
    type: 'sectionChanged',
    section: section.name,
    music: section.music,
    tick: state.tick,
  };
};

/**
 * The director's record with a section's purse granted into it, and the
 * director silent for the tick that section opens on (ADR 0056).
 *
 * The grant is not a spend. The opening tick has already put the section's own
 * due waves on the field by the time the director runs, and a card landing on
 * top of them would arrive before the player has seen the section open.
 *
 * A section with no purse grants nothing rather than carrying the last
 * section's over, so a section the director may not touch leaves it with
 * nothing to spend wherever it looks.
 */
const directorGranted = (
  director: DirectorState,
  section: Section,
  tick: number,
): DirectorState => {
  return {
    ...director,
    purseLeft: section.purse ?? 0,
    quietUntilTick: tick + 1,
  };
};

const grantPurse = (state: RunState, section: Section): void => {
  state.director = directorGranted(state.director, section, state.tick);
};

/**
 * Where a group landed, as the middle of its own bodies. A card is one shape,
 * so one x is what a reading needs to draw it against the tape (#85).
 */
const groupCentre = (orders: readonly SpawnOrder[]): number => {
  return orders.reduce((sum, order) => sum + order.x, 0) / orders.length;
};

/**
 * The next section, announced, with whatever boss it carries put on the field.
 *
 * It reads the table's own columns rather than a section's name, so a section
 * inserted with its columns filled in needs no edit here.
 */
const enterNextSection = (state: RunState, events: SimEvent[]): void => {
  const stage = state.stage;
  stage.sectionIndex += 1;
  stage.sectionTick = 0;
  stage.firedWaves = 0;
  events.push(sectionUnderway(state));
  arriveBoss(state, sectionAt(stage.sectionIndex), events);
  grantPurse(state, sectionAt(stage.sectionIndex));
};

/**
 * The director a run opens with, which no crossing grants for it:
 * enterNextSection is the only site that opens a section and a run begins
 * already inside the first one, which is the same gap sectionUnderway exists to
 * fill. It goes through the grant above rather than beside it, so the run's
 * first tick and every boundary after it are one rule.
 */
const openingDirector = (director: DirectorState): DirectorState => {
  return directorGranted(director, sectionAt(0), 0);
};

/**
 * The boss whose death ends the stage (ADR 0050: "the Undertaker ends the third
 * and the stage"). It is read off the table's own last fight rather than
 * written down, so a stage that gains a section ends on that section's boss
 * with no edit here.
 */
const FINAL_BOSS: BossKind | null = SECTIONS.reduce<BossKind | null>(
  (last, section) => section.boss ?? last,
  null,
);

/**
 * Whether this tick's deaths hold the last fight the stage authors, won where
 * the stage authored it.
 *
 * The section's own boss column is what says the fight is the one the run is
 * standing in, so a boss stood up outside its own section by a rig ends nothing.
 */
const wonTheLastFight = (
  state: RunState,
  events: readonly SimEvent[],
): boolean => {
  const fight = sectionAt(state.stage.sectionIndex).boss;
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
 * section. The stage crosses a section at the top of a tick and a run that has
 * ended executes no further ticks (#52), so an ending hung on the crossing
 * would arrive a tick after the death or, once the run had ended on it, never.
 * The last boundary is announced here beside the ending because they are one
 * event: a tape that stopped on the fight would show six sections where the stage
 * has seven.
 *
 * Victory pays nothing. The topple into the grave is the renderer's animation
 * over a run that has already ended, so a player who never dives is not left
 * with a run still running and nothing to play.
 *
 * An ending already reached stands, because the same tick's hits resolve before
 * its deaths do: a grave sealed on the tick the last phase empties lost the run
 * before the fight was won.
 */
const winStage = (
  state: RunState,
  tickEvents: readonly SimEvent[],
): SimEvent[] => {
  if (state.ending !== null) return [];
  if (!wonTheLastFight(state, tickEvents)) return [];
  const events: SimEvent[] = [];
  enterNextSection(state, events);
  state.ending = 'victory';
  events.push({ type: 'victory', tick: state.tick });
  return events;
};

/**
 * This tick's spawns, and any section boundary it crosses. It loops until a section
 * is still live or the stage is over, because a section whose end condition is
 * already met on the tick it begins hands straight on to the next one.
 *
 * The spawns come first, so a section that fires its last wave this tick is never
 * read as spent before the bodies that wave put on the field are on it.
 */
const advanceStage = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  while (state.stage.sectionIndex < SECTIONS.length - 1) {
    const section = sectionAt(state.stage.sectionIndex);
    spawnDueWaves(state, section, events);
    spawnStandingRate(state, section, events);
    placeDueSetPiece(state, section);
    if (!sectionEnded(state, section)) return events;
    enterNextSection(state, events);
  }
  return events;
};

/**
 * The card the director bought, put down. It answers with the add and this is
 * where the add happens, so the one execution authority stays here (ADR 0017).
 *
 * It mirrors spawnWave: the placement is already drawn off the director's own
 * stream, so what is left is one spawnMob per order, marked as directed so a
 * shaped body can be told from a standing wave's (ADR 0060's mark). It passes
 * false for carries and never a value, because the twenty-five authored
 * carriers are the ladder's whole supply (ADR 0048) and a directed carrier
 * would hand out rungs at a figure nobody wrote down.
 *
 * A body the mob cap refuses is counted exactly as an authored one is, which is
 * to say by the same path and with no counter of the director's own: nothing
 * about a refusal here is different from a refusal under a wave.
 */
const spendDirected = (state: RunState): SimEvent[] => {
  const section = sectionAt(state.stage.sectionIndex);
  const spend = directorSpend(state, section, state.streams.director);
  if (spend === null) return [];
  for (const order of spend.orders) {
    spawnMob(state, spend.card.type, order, false, 'directed');
  }
  state.director = {
    ...state.director,
    purseLeft: spend.purseLeft,
    quietUntilTick: spend.quietUntilTick,
  };
  return [
    {
      type: 'directedAdd',
      card: spend.card,
      x: groupCentre(spend.orders),
      section: section.name,
      signal: spend.signal,
      purseLeft: spend.purseLeft,
    },
  ];
};

export {
  spendDirected,
  openingDirector,
  createStage,
  sectionEnded,
  sectionUnderway,
  advanceStage,
  winStage,
  bankOpensNow,
  SECTIONS,
};
export type { SectionName, SectionEnd, SectionMusic, Section, StageState };
