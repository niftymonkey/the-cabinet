/**
 * The authored timeline (ADR 0006) and the three named sections (ADR 0049,
 * ADR 0050). The row tables are data, so most of this file reads them directly;
 * the tests that need the clock, or a hand, run the whole stage through the one
 * execution authority (ADR 0017).
 *
 * Two hands appear here and each property names the one it is stated under,
 * because a section's property is a promise about what the game puts on the
 * field and is only a number once something is doing the killing.
 */

import { describe, expect, it } from 'vitest';

import stageSource from '../stage.ts?raw';

import { carrierRow } from '../../carriers';
import { stepping } from '../../../dev/stepping';
import { TICK_HZ } from '../../clock';
import type { SimEvent } from '../../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../field';
import { graveWidth } from '../../grave';
import { BIRTHRIGHT } from '../../lines/roster';
import type { MobType } from '../../mobs';
import {
  damageMob,
  GHOUL_DESCENT_FLOOR,
  hasEntered,
  MOB_TYPES,
  MOB_TYPE_NAMES,
  spawnMob,
  SPAWN_MARGIN,
} from '../../mobs';
import type { TickCommand } from '../../command';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { SCROLL_SPEED, SIZE_FLOOR, SIZE_START } from '../../tuning';
import type { StageRow } from '../rows';
import {
  CROWD_ROWS,
  PROCESSION_ROWS,
  SPARSE_LAST_ROW,
  sparseLastRow,
  VIGIL_ROWS,
} from '../rows';
import type { Phase, PhaseName } from '../stage';
import { advanceStage, PHASES, phaseEnded } from '../stage';
import { place } from '../templates';

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

const SECTION_NAMES: readonly PhaseName[] = ['procession', 'crowd', 'vigil'];

/**
 * The two sections a boss ends, which are the two that carry a sparse last row
 * and end on a field with nothing left alive on it (ADR 0051). The Crowd is not
 * among them and that is the ruling rather than an omission.
 */
const BOSS_BOUND_SECTIONS: readonly PhaseName[] = ['procession', 'vigil'];

/**
 * The longest a body can take to leave the field, in ticks: the whole distance
 * one can cross, the field plus the deepest a template places above it plus the
 * body's own half height, at the slowest total descent any type can hold, which
 * is the scroll plus its own speed. Every term is read from the tables, so the
 * bound follows the mob rows and the field rather than being written down.
 */
const SLOWEST_DESCENT_TICKS =
  (FIELD_HEIGHT +
    SPAWN_MARGIN +
    Math.max(...MOB_TYPE_NAMES.map((type) => MOB_TYPES[type].halfHeight))) /
  (SCROLL_SPEED +
    Math.min(
      MOB_TYPES.shambler.speed,
      MOB_TYPES.revenant.speed,
      GHOUL_DESCENT_FLOOR,
    ));

function phase(name: PhaseName): Phase {
  return PHASES.find((each) => each.name === name)!;
}

/** The phase whose boundary event ends this section, which is the phase after it. */
function boundaryAfter(name: PhaseName): Phase {
  return PHASES[PHASES.findIndex((each) => each.name === name) + 1];
}

/**
 * A hand playing the run: whatever it does to the field after the tick, and
 * whatever that reports.
 */
type Hand = (state: RunState) => readonly SimEvent[];

/**
 * The still hand: a grave that never moves and never dies, firing nothing but
 * the birthright it was born with. It is the weakest hand the sim can produce
 * and it is the build a run spends most of its length in, so it is what a
 * floor over live mobs is honestly read under.
 */
const stillHand: Hand = () => [];

/**
 * The sharp hand: every mob dies on the first tick the game lets it be read,
 * its arriving beat spent and its body fully on the field (ADR 0016's
 * readable-before-it-acts). It is the hand that kills what arrives, and a
 * ceiling on what a section holds is only a statement about the section under
 * one.
 *
 * It takes what it kills, so growth paid per second under it is the section's
 * own authored rate rather than a reading of how well something played.
 */
const sharpHand: Hand = (state) => {
  const events: SimEvent[] = [];
  for (const mob of state.mobs) {
    if (!mob.alive || !hasEntered(mob) || mob.beat > 0) continue;
    events.push(...damageMob(state, mob, mob.hp, BIRTHRIGHT[0]));
  }
  return events;
};

interface Played {
  /** Every phaseChanged, in order, as name and absolute tick. */
  readonly boundaries: { phase: PhaseName; tick: number }[];
  /** The absolute tick each group of mobs arrived on, with how many arrived. */
  readonly arrivals: { tick: number; count: number }[];
  /** How many of the stage's own groups have a body live on the field, per tick. */
  readonly liveTemplates: number[];
  /**
   * How many mobs were alive as each tick began, which is what the stage's own
   * end condition reads: advanceStage runs before the tick's deaths and its
   * cull, so a phase ends on the tick after its last body leaves.
   */
  readonly liveMobs: number[];
  /** Growth the tick's kills paid, in size units, per tick. */
  readonly foodPaid: number[];
  /** The stage's own index and clock after each tick. */
  readonly stageClock: { index: number; tick: number }[];
  readonly events: SimEvent[];
  readonly state: RunState;
}

/**
 * The whole stage under one hand, with the grave held immortal.
 *
 * The grave holds still and is restored to its starting size every tick,
 * because these tests are about the timeline and a grave left to be ground down
 * would seal shut inside the Procession and stop the stage's clock long before
 * the Vigil.
 *
 * A template is counted live while any body of the group one row put on the
 * field is alive and fully inside it. The group is the tick's own arrivals: no
 * two rows of a section share a phase-local second, so one tick's spawns are
 * one row's, and a body is held to its group by entity id because a pool slot
 * is recycled and an id never is.
 */
function playStage(seed: number, hand: Hand, ticks: number): Played {
  const state = createRun(seed);
  const step = stepping(state);
  const boundaries: { phase: PhaseName; tick: number }[] = [];
  const arrivals: { tick: number; count: number }[] = [];
  const liveTemplates: number[] = [];
  const liveMobs: number[] = [];
  const foodPaid: number[] = [];
  const stageClock: { index: number; tick: number }[] = [];
  const events: SimEvent[] = [];
  const groupOf = new Map<number, number>();
  let groups = 0;

  for (let tick = 0; tick < ticks && state.ending !== 'victory'; tick++) {
    const before = state.mobs.filter((mob) => mob.alive).length;
    liveMobs.push(before);
    // The tick the step is spending, so arrivals and phaseChanged are recorded
    // on the same clock: the event carries state.tick before step advances it.
    const at = state.tick;
    const stepped = step(STILL);
    events.push(...stepped);
    if (state.ending === 'sealed') state.ending = null;
    state.grave.size = SIZE_START;

    const alive = state.mobs.filter((mob) => mob.alive).length;
    if (alive > before) arrivals.push({ tick: at, count: alive - before });
    for (const event of stepped) {
      if (event.type !== 'phaseChanged') continue;
      boundaries.push({ phase: event.phase, tick: event.tick });
    }

    const fresh = state.mobs.filter((mob) => mob.alive && !groupOf.has(mob.id));
    for (const mob of fresh) groupOf.set(mob.id, groups);
    if (fresh.length > 0) groups += 1;
    const live = new Set<number>();
    for (const mob of state.mobs) {
      if (!mob.alive || !hasEntered(mob)) continue;
      const group = groupOf.get(mob.id);
      if (group !== undefined) live.add(group);
    }
    liveTemplates.push(live.size);

    const handed = hand(state);
    let paid = 0;
    for (const event of [...stepped, ...handed]) {
      if (event.type !== 'mobKilled') continue;
      paid += MOB_TYPES[event.mob].corpsePayout;
    }
    foodPaid.push(paid);
    stageClock.push({
      index: state.stage.phaseIndex,
      tick: state.stage.phaseTick,
    });
  }
  return {
    boundaries,
    arrivals,
    liveTemplates,
    liveMobs,
    foodPaid,
    stageClock,
    events,
    state,
  };
}

/** Where each phase ran, in absolute ticks, read off the run's own boundaries. */
function spanOf(played: Played, name: PhaseName): [number, number] {
  let from = 0;
  let current: PhaseName = PHASES[0].name;
  for (const boundary of played.boundaries) {
    if (current === name) return [from, boundary.tick];
    from = boundary.tick;
    current = boundary.phase;
  }
  return [from, played.liveTemplates.length];
}

/** Growth paid per second inside one phase, under whatever hand played it. */
function foodPerSecond(played: Played, name: PhaseName): number {
  const [from, to] = spanOf(played, name);
  const paid = played.foodPaid.slice(from, to).reduce((sum, at) => sum + at, 0);
  return paid / ((to - from) / TICK_HZ);
}

/**
 * Every window in a table where nothing is due for longer than a body takes to
 * leave the field, which is a window the field can be empty through.
 */
function silentGapsIn(rows: readonly StageRow[]): string[] {
  const bound = SLOWEST_DESCENT_TICKS / TICK_HZ;
  return rows
    .map((row, index) => ({
      row,
      gap: index === 0 ? row.t : row.t - rows[index - 1].t,
    }))
    .filter((each) => each.gap > bound)
    .map(
      (each) => `${each.row.template} at t=${each.row.t} after ${each.gap}s`,
    );
}

/** How long one phase ran, in ticks, under whatever hand played it. */
function lengthOf(played: Played, name: PhaseName): number {
  const [from, to] = spanOf(played, name);
  return to - from;
}

/** The live-template count through one phase. */
function liveThrough(played: Played, name: PhaseName): number[] {
  const [from, to] = spanOf(played, name);
  return played.liveTemplates.slice(from, to);
}

/** The phase-local second a table's last row fires. */
function lastRowAt(rows: readonly StageRow[]): number {
  return rows[rows.length - 1].t;
}

/**
 * A budget for one whole run rather than a length. Every phase ends on its own
 * condition (ADR 0051), so how long a run takes is decided by the hand playing
 * it, and what can be written down is a ceiling: each phase's own rows plus a
 * whole descent for whatever they leave falling.
 */
const STAGE_TICKS = Math.ceil(
  PHASES.reduce(
    (total, each) =>
      total +
      (each.rows.length > 0 ? lastRowAt(each.rows) * TICK_HZ : 0) +
      SLOWEST_DESCENT_TICKS,
    0,
  ),
);

const SHARP = playStage(77, sharpHand, STAGE_TICKS);
const STILL_PLAY = playStage(77, stillHand, STAGE_TICKS);

describe('the three sections and their boundary events (ADR 0050)', () => {
  it('runs three sections, with the Banshee, the set piece and the Undertaker as their boundary events', () => {
    // ADR 0050: "The Banshee ends the first, a swarm set piece ends the second,
    // and the Undertaker ends the third and the stage."
    expect(PHASES.map((each) => each.name)).toEqual([
      'procession',
      'banshee',
      'crowd',
      'waking',
      'vigil',
      'undertaker',
      'over',
    ]);
    expect(
      SECTION_NAMES.map(
        (name) => `${name} ends on ${boundaryAfter(name).name}`,
      ),
    ).toEqual([
      'procession ends on banshee',
      'crowd ends on waking',
      'vigil ends on undertaker',
    ]);

    // The middle boundary is deliberately not a boss, which is the ruling's own
    // second half, so the phase that ends the Crowd carries none.
    expect(SECTION_NAMES.map((name) => boundaryAfter(name).boss)).toEqual([
      'banshee',
      null,
      'undertaker',
    ]);
    expect(phase('crowd').ends).toBe('setPieceOpened');
  });

  it('makes the opening section the shortest, the middle the longest and the last shorter again', () => {
    // ADR 0050: "The opening section is the short one, the middle section is
    // the longest, and the last is shorter again, Ikaruga's shape." The
    // magnitudes are initial rows; the shape is not.
    //
    // It is read off a run rather than off the tables, because a section ends
    // on its own condition and not on a clock: what a hand that kills what
    // arrives spends in each one is the honest length.
    const [procession, crowd, vigil] = SECTION_NAMES.map((name) =>
      lengthOf(SHARP, name),
    );
    expect(procession).toBeLessThan(crowd);
    expect(vigil).toBeLessThan(procession);
  });

  it('puts each boundary where the rows put it, so moving a row moves the boundary', () => {
    // ADR 0050: "where each boundary falls on the clock is stage data." The
    // same section with one more row has not run out where the authored one
    // has, and nothing else in the machine has an opinion about it.
    const state = createRun(1);
    for (const name of SECTION_NAMES) {
      const each = phase(name);
      const last = each.rows[each.rows.length - 1];
      const stretched: Phase = {
        ...each,
        rows: [...each.rows, { ...last, t: last.t + 30 }],
      };
      state.stage.firedRows = each.rows.length;
      expect(`${name} ${phaseEnded(state, each)}`).toBe(`${name} true`);
      expect(`${name} ${phaseEnded(state, stretched)}`).toBe(`${name} false`);
    }
  });

  it('buys no power with length: a longer section carries the carriers it authored', () => {
    // ADR 0049: "so a longer stage is a longer stage and not a richer one
    // unless the carrier rows say so." The same rows spread over twice the time
    // pay exactly what they paid before.
    const carriersIn = (rows: readonly StageRow[]): number =>
      rows.reduce(
        (total, row) =>
          total + carrierRow(row.carries, row.count).carrying.length,
        0,
      );
    const stretched = PROCESSION_ROWS.map((row) => ({ ...row, t: row.t * 2 }));
    expect(lastRowAt(stretched)).toBeGreaterThan(lastRowAt(PROCESSION_ROWS));
    expect(carriersIn(stretched)).toBe(carriersIn(PROCESSION_ROWS));
  });
});

describe('one property per section (game-concept.md:48)', () => {
  it('holds the Procession to its declared live-template ceiling under a hand that kills what arrives', () => {
    // "the first owns emptiness, never more than one template live." The
    // ceiling is read off the phase rather than restated here, because it is
    // the row the director at step 4 may not spend past (ADR 0047).
    const ceiling = phase('procession').liveTemplateCeiling!;
    expect(ceiling).toBe(1);
    expect(Math.max(...liveThrough(SHARP, 'procession'))).toBeLessThanOrEqual(
      ceiling,
    );

    // And the emptiness it buys is real rather than a consequence of the hand:
    // under the same still grave the Procession's field is empty many times
    // more often than the Crowd's.
    const emptyShare = (name: PhaseName): number => {
      const window = liveThrough(STILL_PLAY, name);
      return window.filter((count) => count === 0).length / window.length;
    };
    expect(emptyShare('procession')).toBeGreaterThan(4 * emptyShare('crowd'));
  });

  it('raises no fault when a slower hand leaves two templates on the Procession at once', () => {
    // The deliberate absence beside the ceiling. The authored rows are the
    // floor ADR 0047 keeps, and ADR 0023 runs every invariant in every build a
    // player is handed, so a ceiling written as a law would fire at a player
    // who kills slowly and land in their own tape as a defect in the game.
    //
    // The rig throws on the first tick that records a fault, so a run that
    // reaches two live templates and then crosses the whole stage is the proof:
    // the still hand exceeds the ceiling for most of the section and nothing
    // anywhere calls it wrong.
    const procession = liveThrough(STILL_PLAY, 'procession');
    const ceiling = phase('procession').liveTemplateCeiling!;
    expect(Math.max(...procession)).toBeGreaterThan(ceiling);
    expect(
      procession.filter((count) => count > ceiling).length,
    ).toBeGreaterThan(TICK_HZ);
    expect(STILL_PLAY.boundaries.map((each) => each.phase)).toContain('over');
  });

  it('never lets the Crowd fall below two live templates once it has them', () => {
    // "the middle owns overlap, never fewer than two templates live." It is a
    // floor over live mobs and it carries no ceiling row, because a director
    // that adds and never removes cannot break a floor.
    //
    // The window is the section's own body: from the tick it first holds two
    // through to its last row firing. Before that the section is filling and
    // after it the rows have run out, and what the sparse last row does to that
    // tail is ADR 0051's, not this property's.
    const crowd = liveThrough(STILL_PLAY, 'crowd');
    const lastRow = CROWD_ROWS[CROWD_ROWS.length - 1].t * TICK_HZ;
    const opened = crowd.findIndex((count) => count >= 2);
    expect(opened).toBeGreaterThanOrEqual(0);
    expect(opened).toBeLessThan(lastRow);
    expect(crowd.slice(opened, lastRow).filter((count) => count < 2)).toEqual(
      [],
    );

    // The same hand on the section next door does not hold it, which is what
    // says the floor is the Crowd's own authoring rather than a property of
    // the rig: the Procession drops below two again and again.
    const procession = liveThrough(STILL_PLAY, 'procession');
    const first = procession.findIndex((count) => count >= 2);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(
      procession.slice(first).filter((count) => count < 2).length,
    ).toBeGreaterThan(TICK_HZ);
  });

  it('pays less growth per second in the Vigil than in the Crowd', () => {
    // "the last owns scarcity." The quantity is growth paid per second and
    // never corpses per second: a revenant corpse pays double a shambler's, so
    // a corpses-per-second rule would pass while the section fed better than
    // the one before it (mobs.ts's own payout rows).
    //
    // It runs under the sharp hand, which takes what it kills, so what is
    // compared is the two sections' own authored rates rather than how well
    // something played. The relation is what is pinned and both magnitudes are
    // initial rows.
    expect(foodPerSecond(SHARP, 'vigil')).toBeLessThan(
      foodPerSecond(SHARP, 'crowd'),
    );
    expect(foodPerSecond(SHARP, 'crowd')).toBeGreaterThan(0);

    // The comparison is against the Crowd rather than the Procession, which
    // owns emptiness rather than a feeding rate and pays least of the three.
    expect(foodPerSecond(SHARP, 'procession')).toBeLessThan(
      foodPerSecond(SHARP, 'vigil'),
    );
  });
});

describe('the rows as data (ADR 0006)', () => {
  it("holds only Drips and one File in the Procession's first 45 seconds", () => {
    const opening = PROCESSION_ROWS.filter((row) => row.t < 45);
    expect(opening.length).toBeGreaterThan(3);
    expect(opening.filter((row) => row.template === 'file')).toHaveLength(1);
    expect(
      opening.filter(
        (row) => row.template !== 'file' && row.template !== 'drip',
      ),
    ).toEqual([]);
  });

  it('introduces every mob type as a lone Drip before it appears in numbers (ADR 0016)', () => {
    const seen = new Set<MobType>();
    for (const row of [...PROCESSION_ROWS, ...CROWD_ROWS, ...VIGIL_ROWS]) {
      if (seen.has(row.type)) continue;
      seen.add(row.type);
      expect(`${row.type} ${row.template} ${row.count}`).toBe(
        `${row.type} drip 1`,
      );
    }
    expect(seen.size).toBe(3);
  });

  it('keeps the Procession clear of the closer and of the density templates', () => {
    // The section owns emptiness, so the Rain, which is the filler a section
    // turns up when its property asks for it, and the Pincer, which is two
    // files at once, both belong to the section after it. The ghoul closes,
    // which is the same argument one type down.
    const templates = new Set(PROCESSION_ROWS.map((row) => row.template));
    expect([...templates].sort()).toEqual(['drip', 'file', 'v']);
    expect(PROCESSION_ROWS.filter((row) => row.type === 'ghoul')).toEqual([]);
  });

  it("fills the Wall's width at the shambler's size, so no gap in the curtain is wider than a floor-size grave", () => {
    const wall = CROWD_ROWS.find((row) => row.template === 'wall')!;
    const placed = place('wall', wall.count, createRun(1).streams.spawns);
    const half = MOB_TYPES[wall.type].halfWidth;
    const edges = placed.map((at) => ({
      left: at.x - half,
      right: at.x + half,
    }));

    const gaps = [edges[0].left, FIELD_WIDTH - edges[edges.length - 1].right];
    for (let index = 1; index < edges.length; index++) {
      gaps.push(edges[index].left - edges[index - 1].right);
    }
    for (const gap of gaps) {
      expect(`gap ${gap < graveWidth(SIZE_FLOOR)}`).toBe('gap true');
    }
  });

  it('keeps SPAWN_MARGIN at least as deep as the deepest authored row', () => {
    const rows: readonly StageRow[] = [
      ...PROCESSION_ROWS,
      ...CROWD_ROWS,
      ...VIGIL_ROWS,
    ];
    const state = createRun(2);
    let deepest = 0;
    for (const row of rows) {
      for (const at of place(row.template, row.count, state.streams.spawns)) {
        deepest = Math.max(deepest, -at.y);
      }
    }
    expect(deepest).toBeGreaterThan(150);
    expect(SPAWN_MARGIN).toBeGreaterThanOrEqual(deepest);
  });
});

describe('the phase machine (ADR 0006)', () => {
  it('chains the seven phases in order and reports each boundary', () => {
    expect([
      PHASES[0].name,
      ...STILL_PLAY.boundaries.map((each) => each.phase),
    ]).toEqual([
      'procession',
      'banshee',
      'crowd',
      'waking',
      'vigil',
      'undertaker',
      'over',
    ]);
  });

  it('resets the phase clock at every boundary and never runs the phase index backwards', () => {
    const clock = STILL_PLAY.stageClock;
    for (let at = 1; at < clock.length; at++) {
      const moved = clock[at].index > clock[at - 1].index;
      expect(`${at} back ${clock[at].index < clock[at - 1].index}`).toBe(
        `${at} back false`,
      );
      // A boundary sets the phase clock to zero and the tick's own counter then
      // moves it to one, so the first tick of a phase reads one.
      expect(`${at} ${moved ? clock[at].tick : 'inside'}`).toBe(
        `${at} ${moved ? 1 : 'inside'}`,
      );
      if (!moved) {
        expect(`${at} ${clock[at].tick}`).toBe(
          `${at} ${clock[at - 1].tick + 1}`,
        );
      }
    }
  });

  it('begins and ends a stubbed boss phase on the same tick', () => {
    const at = (name: PhaseName): number =>
      STILL_PLAY.boundaries.find((each) => each.phase === name)!.tick;
    // The Waking is not among them: it ends on rows spent and a field clear
    // like the two sections, and the Crowd hands it a field with trash on it,
    // so it is the one boundary phase that has something to wait for today.
    expect(at('banshee')).toBe(at('crowd'));
    expect(at('undertaker')).toBe(at('over'));
    expect(at('vigil')).toBeGreaterThan(at('waking'));
  });

  it.todo('crosses no two boundaries on one tick, because no phase is empty');

  it('lands the Wall two seconds into the Crowd, which is what the stub buys', () => {
    const crowd = STILL_PLAY.boundaries.find(
      (each) => each.phase === 'crowd',
    )!.tick;
    const wall = STILL_PLAY.arrivals.find((each) => each.count === 22)!;
    expect(wall).toBeDefined();
    expect(wall.tick - crowd).toBe(2 * TICK_HZ);
  });

  it('fires the same phase-local time at two different absolute ticks', () => {
    // Both tables carry a row at t=2. Phase-local means the second one waits
    // for the boundary rather than for the run's own clock.
    const crowd = STILL_PLAY.boundaries.find(
      (each) => each.phase === 'crowd',
    )!.tick;
    const first = STILL_PLAY.arrivals[0].tick;
    const wall = STILL_PLAY.arrivals.find((each) => each.count === 22)!.tick;
    expect(first).toBe(2 * TICK_HZ);
    expect(wall).toBe(crowd + 2 * TICK_HZ);
    expect(wall).not.toBe(first);
  });

  it('ends the run in victory when the over phase is reached', () => {
    expect(STILL_PLAY.state.ending).toBe('victory');
    const victory = STILL_PLAY.events.filter(
      (event) => event.type === 'victory',
    );
    expect(victory).toHaveLength(1);
    const over = STILL_PLAY.boundaries.find((each) => each.phase === 'over')!;
    expect(victory[0].type === 'victory' && victory[0].tick).toBe(over.tick);
  });

  it('reads the phase table rather than switching on a phase name to end the run', () => {
    // A column and not a switch: a phase inserted with its columns filled in
    // needs no edit in enterNextPhase, which is what keeps the seven phases a
    // data-row edit. Read off the source text, because a name tested inside a
    // private function is gone by the time the module is a value.
    const from = stageSource.indexOf('const enterNextPhase');
    const body = stageSource.slice(from, stageSource.indexOf('\n};', from));
    expect(from).toBeGreaterThan(0);
    for (const each of PHASES) {
      expect(`${each.name} named ${body.includes(`'${each.name}'`)}`).toBe(
        `${each.name} named false`,
      );
    }
  });
});

describe('the sparse last row (ADR 0051)', () => {
  it('keeps mobs arriving through the last row before a boss, thinly and further apart', () => {
    // ADR 0051: "Mobs keep arriving, thinly and further apart." The row before
    // a boss is the last thing the section does rather than a gap in front of
    // one, and it lands a body at a time where the section lands groups.
    for (const name of BOSS_BOUND_SECTIONS) {
      const rows = phase(name).rows;
      const tail = rows.slice(-SPARSE_LAST_ROW.bodies);
      const body = rows.slice(0, rows.length - SPARSE_LAST_ROW.bodies);
      expect(`${name} ${tail.map((row) => row.count).join()}`).toBe(
        `${name} ${tail.map(() => 1).join()}`,
      );
      expect(Math.max(...tail.map((row) => row.count))).toBeLessThan(
        Math.max(...body.map((row) => row.count)),
      );
      expect(tail[0].t).toBeGreaterThan(lastRowAt(body));

      // And they arrive: under a hand that kills nothing, every arrival after
      // the section's last group is one body on its own.
      const [from, to] = spanOf(STILL_PLAY, name);
      const inTail = STILL_PLAY.arrivals.filter(
        (each) => each.tick >= from + tail[0].t * TICK_HZ && each.tick < to,
      );
      expect(`${name} ${inTail.map((each) => each.count).join()}`).toBe(
        `${name} ${tail.map(() => 1).join()}`,
      );
    }
  });

  it('begins every boss phase on a field with no live mob', () => {
    // ADR 0051: "the boss arrives as the last of them leaves the field," and
    // "the Banshee and the Undertaker arrive alone on an empty field." Both
    // hands, because the boundary is the field's own state and not the hand's.
    for (const name of ['banshee', 'undertaker'] as const) {
      for (const played of [STILL_PLAY, SHARP]) {
        const at = played.boundaries.find((each) => each.phase === name)!;
        expect(`${name} ${played.liveMobs[at.tick]}`).toBe(`${name} 0`);
      }
    }
  });

  it('thins nothing before the set piece and hands it a field with trash on it', () => {
    // ADR 0051: "there is no drain-out before the set piece ... only the two
    // boss boundaries need the field empty." The Crowd's own table ends on the
    // groups it was authoring, and the phase after it opens into them.
    const crowd = phase('crowd').rows;
    const tail = crowd.slice(-SPARSE_LAST_ROW.bodies);
    expect(tail.filter((row) => row.count === 1)).toEqual([]);

    // Read on the Waking's first whole tick, because advanceStage runs before
    // the tick's deaths: the boundary tick reports the field the Crowd's last
    // row was fired into rather than the one it left behind.
    for (const played of [STILL_PLAY, SHARP]) {
      const at = played.boundaries.find((each) => each.phase === 'waking')!;
      expect(played.liveMobs[at.tick + 1]).toBeGreaterThan(0);
    }
  });

  it("takes the sparse row's count, type and spacing from stage data", () => {
    // ADR 0051: "The row itself, how many, which type, how far apart, is stage
    // data." Both sections close on the same authored shape, and a moved shape
    // is a moved row.
    for (const name of BOSS_BOUND_SECTIONS) {
      const rows = phase(name).rows;
      const tail = rows.slice(-SPARSE_LAST_ROW.bodies);
      expect(tail).toEqual(sparseLastRow(tail[0].t, SPARSE_LAST_ROW));
    }
    expect(
      sparseLastRow(10, {
        bodies: 2,
        spacingSeconds: 3,
        type: 'revenant',
      }).map((row) => `${row.t} ${row.type} ${row.count}`),
    ).toEqual(['10 revenant 1', '13 revenant 1']);
  });

  it('leaves no spawn silence anywhere in the stage', () => {
    // The deliberate-absence guard for ADR 0051's supersession: no window in
    // any phase has nothing due and nothing alive for longer than a body takes
    // to leave the field. The other half of it, the window after a section's
    // last row, is bounded by the test below.
    for (const name of SECTION_NAMES) {
      expect(`${name} ${silentGapsIn(phase(name).rows).join()}`).toBe(
        `${name} `,
      );
    }

    // The rule can see a silence, so the empty lists above are a pass rather
    // than an empty set.
    const silent: readonly StageRow[] = [
      PROCESSION_ROWS[0],
      { ...PROCESSION_ROWS[0], t: PROCESSION_ROWS[0].t + 40 },
    ];
    expect(silentGapsIn(silent)).toHaveLength(1);
  });

  it.todo('ends the Crowd on the eye opening and never on an empty field');
  it.todo(
    "keeps the Crowd's rows firing through the pour at the section's own reduced share",
  );
});

describe('the per-phase end condition (ADR 0050, ADR 0051)', () => {
  it('holds a rows-spent phase open while a body is still alive on the field', () => {
    const state = createRun(1);
    const procession = phase('procession');
    state.stage.firedRows = procession.rows.length;
    expect(phaseEnded(state, procession)).toBe(true);

    const [order] = place('drip', 1, state.streams.spawns);
    spawnMob(state, 'shambler', order, false);
    expect(phaseEnded(state, procession)).toBe(false);
  });

  it('holds a phase open while it has rows left, even on a field with nothing on it', () => {
    const state = createRun(1);
    const procession = phase('procession');
    expect(state.mobs.filter((mob) => mob.alive)).toEqual([]);
    state.stage.firedRows = procession.rows.length - 1;
    expect(phaseEnded(state, procession)).toBe(false);
  });

  it("bounds the tail after a section's last row by a body's own descent, on every seed", () => {
    // What replaces the drain-out's stated length: the tail is however long the
    // last bodies take to leave, which is bounded by the field and the mob
    // table rather than by a number, and a hand that kills them ends it sooner.
    for (const seed of [77, 4242, 909]) {
      const played =
        seed === 77 ? STILL_PLAY : playStage(seed, stillHand, STAGE_TICKS);
      for (const name of BOSS_BOUND_SECTIONS) {
        const [from, to] = spanOf(played, name);
        const last = played.arrivals.filter(
          (each) => each.tick >= from && each.tick < to,
        );
        const tail = to - last[last.length - 1].tick;
        // Bounded above, and a real window rather than an empty one: under a
        // hand that kills nothing the last body falls the whole way, so the
        // comparison has something in it to be a bound on. The bound is
        // rounded up because a tail is whole ticks and a descent is not: the
        // last tick of a full descent is spent whether or not it is a whole
        // one.
        expect(
          `${seed} ${name} ${tail > 0 && tail <= Math.ceil(SLOWEST_DESCENT_TICKS)}`,
        ).toBe(`${seed} ${name} true`);
      }
    }
  });
});

describe('a spawn the mob cap refuses (ADR 0048, ADR 0056)', () => {
  /** The first row of a section that pays, and the phase it belongs to. */
  const firstCarryingRow = (rows: readonly StageRow[]): StageRow =>
    rows.find((row) => row.carries)!;

  it('announces a refused carrier as lost with the cap as its reason, so the ledger still accounts for it', () => {
    // Supply must not vanish at a cap. spawnDueRows dropped spawnMob's null,
    // so a carrier the mob cap refused was never announced at all and the
    // carrier ledger's taken plus lost plus live silently stopped adding up to
    // the schedule. A carrier nobody could put on the field is still a carrier
    // the player never met.
    const state = createRun(1);
    const row = firstCarryingRow(PROCESSION_ROWS);
    while (
      spawnMob(
        state,
        'shambler',
        { x: 60, y: 40, vx: 0, vy: 1, index: 0 },
        false,
      ) !== null
    ) {
      // The loop condition is the fill: every slot taken, so the row's own
      // bodies have nowhere to go.
    }
    const before = state.mobs.filter((mob) => mob.alive).length;

    state.stage.phaseTick = row.t * TICK_HZ;
    const events = advanceStage(state);

    const lost = events.filter((event) => event.type === 'carrierLost');
    expect(lost).toHaveLength(
      carrierRow(row.carries, row.count).carrying.length,
    );
    expect(lost[0].reason).toBe('cap');
    expect(lost[0].mob).toBe(row.type);
    // Nothing was taken off the field to make room for it.
    expect(state.mobs.filter((mob) => mob.alive)).toHaveLength(before);
    expect(state.mobs.some((mob) => mob.alive && mob.carries)).toBe(false);
  });

  it('says nothing about a refused body that was carrying nothing', () => {
    // A trash body the cap refused is density the player never met and the
    // director's problem, not the carrier ledger's. Only supply is announced.
    const state = createRun(1);
    while (
      spawnMob(
        state,
        'shambler',
        { x: 60, y: 40, vx: 0, vy: 1, index: 0 },
        false,
      ) !== null
    ) {
      // The fill again.
    }
    // The section's own first row, which pays nothing on purpose: the first
    // kill of the run teaches the swallow rather than the offer.
    const row = PROCESSION_ROWS[0];
    expect(row.carries).toBe(false);

    state.stage.phaseTick = row.t * TICK_HZ;
    const events = advanceStage(state);

    expect(events.filter((event) => event.type === 'carrierLost')).toEqual([]);
  });
});

describe('determinism (ADRs 0006 and 0012)', () => {
  it('gives an identical spawn sequence for an identical seed, over a whole phase', () => {
    const ticks = lastRowAt(PROCESSION_ROWS) * TICK_HZ;
    const first = playStage(4242, stillHand, ticks);
    const second = playStage(4242, stillHand, ticks);
    expect(first.arrivals).toEqual(second.arrivals);
    expect(
      first.state.mobs.map((mob) => `${mob.alive} ${mob.id} ${mob.x} ${mob.y}`),
    ).toEqual(
      second.state.mobs.map(
        (mob) => `${mob.alive} ${mob.id} ${mob.x} ${mob.y}`,
      ),
    );
    expect(first.state.streams.spawns.drawn).toBe(
      second.state.streams.spawns.drawn,
    );
    expect(first.state.streams.spawns.drawn).toBeGreaterThan(0);
  });
});
