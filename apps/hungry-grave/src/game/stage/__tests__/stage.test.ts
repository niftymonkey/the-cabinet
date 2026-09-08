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
import { FIELD_WIDTH } from '../../field';
import { graveWidth } from '../../grave';
import { BIRTHRIGHT } from '../../lines/roster';
import type { MobType } from '../../mobs';
import { damageMob, hasEntered, MOB_TYPES, SPAWN_MARGIN } from '../../mobs';
import type { TickCommand } from '../../command';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { SIZE_FLOOR, SIZE_START } from '../../tuning';
import type { StageRow } from '../rows';
import { CROWD_ROWS, PROCESSION_ROWS, VIGIL_ROWS } from '../rows';
import type { Phase, PhaseName } from '../stage';
import { DRAIN_OUT_SECONDS, PHASES, phaseLengthTicks } from '../stage';
import { place } from '../templates';

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

const SECTION_NAMES: readonly PhaseName[] = ['procession', 'crowd', 'vigil'];

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
  const foodPaid: number[] = [];
  const stageClock: { index: number; tick: number }[] = [];
  const events: SimEvent[] = [];
  const groupOf = new Map<number, number>();
  let groups = 0;

  for (let tick = 0; tick < ticks && state.ending !== 'victory'; tick++) {
    const before = state.mobs.filter((mob) => mob.alive).length;
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

/** The live-template count through one phase. */
function liveThrough(played: Played, name: PhaseName): number[] {
  const [from, to] = spanOf(played, name);
  return played.liveTemplates.slice(from, to);
}

const STAGE_TICKS =
  phaseLengthTicks(phase('procession')) +
  phaseLengthTicks(phase('crowd')) +
  phaseLengthTicks(phase('vigil')) +
  60;

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
    const [procession, crowd, vigil] = SECTION_NAMES.map((name) =>
      phaseLengthTicks(phase(name)),
    );
    expect(procession).toBeLessThan(crowd);
    expect(vigil).toBeLessThan(procession);
  });

  it('puts each boundary where the rows put it, so moving a row moves the boundary', () => {
    // ADR 0050: "where each boundary falls on the clock is stage data." The
    // same phase with one row thirty seconds later ends thirty seconds later,
    // and nothing else in the machine has an opinion about it.
    const crowd = phase('crowd');
    const last = crowd.rows[crowd.rows.length - 1];
    const stretched: Phase = {
      ...crowd,
      rows: [...crowd.rows, { ...last, t: last.t + 30 }],
    };
    expect(phaseLengthTicks(stretched) - phaseLengthTicks(crowd)).toBe(
      30 * TICK_HZ,
    );
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
    const asPhase: Phase = { ...phase('procession'), rows: stretched };
    expect(phaseLengthTicks(asPhase)).toBeGreaterThan(
      phaseLengthTicks(phase('procession')),
    );
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
  it("gives a phase a length of its last row's time plus the drain-out", () => {
    // The relation is what is pinned. The drain-out's own magnitude is stated
    // once, here, because it is re-derived against the storm whenever the storm
    // changes and a move should be a deliberate edit with a failing test
    // attached. It was 16 until #76 pass C weakened level-1 ground, and the
    // constant's own JSDoc carries the measurement behind 17.
    expect(DRAIN_OUT_SECONDS).toBe(17);
    for (const name of SECTION_NAMES) {
      const rows = phase(name).rows;
      expect(`${name} ${phaseLengthTicks(phase(name))}`).toBe(
        `${name} ${(rows[rows.length - 1].t + DRAIN_OUT_SECONDS) * TICK_HZ}`,
      );
    }
    expect(
      SECTION_NAMES.map((name) => phaseLengthTicks(phase(name)) / TICK_HZ),
    ).toEqual([120, 155, 75]);
  });

  it('leaves the drain-out silent: no row falls inside it', () => {
    for (const name of SECTION_NAMES) {
      const each = phase(name);
      const end = phaseLengthTicks(each) / TICK_HZ;
      const inside = each.rows.filter((row) => row.t > end - DRAIN_OUT_SECONDS);
      expect(inside).toEqual([]);
    }
  });

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
    expect(at('banshee')).toBe(at('crowd'));
    expect(at('waking')).toBe(at('vigil'));
    expect(at('undertaker')).toBe(at('over'));
    expect(at('banshee')).toBe(phaseLengthTicks(phase('procession')));
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

describe('determinism (ADRs 0006 and 0012)', () => {
  it('gives an identical spawn sequence for an identical seed, over a whole phase', () => {
    const ticks = phaseLengthTicks(phase('procession'));
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
