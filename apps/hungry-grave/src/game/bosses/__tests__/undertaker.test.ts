/**
 * The Undertaker's own grammar (ADR 0007, ADR 0052, game-concept.md:70): three
 * chunks of falling clod curtains, a slow shovel arm and the bodies it digs up,
 * and the two locked together in the last one.
 *
 * The machine he stands on is chunks.ts's and is tested there. What is here is
 * his: the curtains, the gap rule, the arm, the diggers, and the overlap.
 */

import { describe, expect, it } from 'vitest';

import undertakerSource from '../undertaker.ts?raw';

import { TICK_HZ } from '../../clock';
import type { TickCommand } from '../../command';
import type { SimEvent } from '../../events';
import { FIELD_WIDTH } from '../../field';
import { graveWidth } from '../../grave';
import { BELL_DAMAGE_NEAR, BELL_PERIOD } from '../../lines/bell';
import {
  COLUMNS_BY_LEVEL,
  SKULL_DAMAGE,
  STREAM_INTERVAL,
} from '../../lines/skullStream';
import type { FireKind } from '../../mobFire';
import type { Mob } from '../../mobs';
import { damageMob, MOB_TYPES } from '../../mobs';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { PHASES } from '../../stage/stage';
import { SIZE_CEILING, SIZE_FLOOR, SIZE_START } from '../../tuning';
import { stepping } from '../../../dev/stepping';
import type { Boss } from '../chunks';
import {
  bossChunks,
  CHUNK_FLASH_TICKS,
  CHUNK_HP,
  damageBoss,
  spawnBoss,
} from '../chunks';
import {
  ARM_REACH,
  CURTAIN_ROWS,
  curtainGap,
  DIGGER_TYPE,
  GAP_LAG_TICKS,
  GAP_MARGIN,
  GAP_WALK,
  SPIRAL_FIRE,
  SPIRAL_ROWS,
} from '../undertaker';

const SEED = 20260908;

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

/** The phase that carries him, so the fight is stood up where the stage puts it. */
const HIS_PHASE = PHASES.findIndex((phase) => phase.boss === 'undertaker');

/** A fight in progress: the run, the boss, and one tick of it at a time. */
interface Fight {
  readonly state: RunState;
  readonly boss: Boss;
  /** One tick, with the grave left at whatever size the test set. */
  readonly tick: () => readonly SimEvent[];
}

/** One tick of a fight: the clock it was spent on and what it put on the field. */
interface Beat {
  readonly at: number;
  readonly events: readonly SimEvent[];
  /** The shots the tick added, as bearings. A shot's velocity never changes. */
  readonly shots: readonly { kind: FireKind; vx: number; vy: number }[];
}

/**
 * A run standing in his own phase with him on the field.
 *
 * He is put there rather than reached through the stage: two sections and a
 * fight stand in front of the Vigil, and that his phase spawns him is
 * stage.ts's own test. His phase authors no rows, so everything that arrives on
 * the field below is his.
 *
 * The grave is held immortal and the live chunk is held full, both for the same
 * reason: these are tests about his patterns, and left alone a parked grave
 * under a curtain seals shut long before a chunk is over while the birthright
 * storm empties the chunk from under the pattern. What the storm takes off a
 * chunk is chunks.ts's and is tested there. The birthright cannot be switched
 * off instead: a run standing at level zero on its own birthright line is a
 * fatal invariant, which this rig found the honest way.
 */
function atTheUndertaker(seed = SEED): Fight {
  const state = createRun(seed);
  state.stage.phaseIndex = HIS_PHASE;
  state.stage.phaseTick = 0;
  state.stage.firedRows = 0;
  const step = stepping(state);
  const boss = spawnBoss(state, PHASES[HIS_PHASE].boss!);
  const tick = (): readonly SimEvent[] => {
    const held = state.grave.size;
    const events = step(STILL);
    state.grave.size = held;
    state.ending = null;
    if (state.boss !== null) {
      state.boss.hp = CHUNK_HP[state.boss.kind][state.boss.chunk];
    }
    return events;
  };
  return { state, boss, tick };
}

/** Every event of a kind a call reported, in order. */
function only<T extends SimEvent['type']>(
  events: readonly SimEvent[],
  type: T,
): Extract<SimEvent, { type: T }>[] {
  return events.filter(
    (event): event is Extract<SimEvent, { type: T }> => event.type === type,
  );
}

/** Every shot of one fire kind a tick reported. */
function firedOf(
  events: readonly SimEvent[],
  kind: FireKind,
): Extract<SimEvent, { type: 'mobFired' }>[] {
  return only(events, 'mobFired').filter((event) => event.kind === kind);
}

/** One tick, with what it added to the shot pool read off beside its events. */
function oneBeat(fight: Fight): Beat {
  const at = fight.state.boss?.patternTick ?? -1;
  const before = new Set(
    fight.state.mobFire.filter((shot) => shot.alive).map((shot) => shot.id),
  );
  const events = fight.tick();
  const shots = fight.state.mobFire
    .filter((shot) => shot.alive && !before.has(shot.id))
    .map((shot) => ({ kind: shot.kind, vx: shot.vx, vy: shot.vy }));
  return { at, events, shots };
}

/** A stretch of the fight, tick by tick. */
function play(fight: Fight, ticks: number): Beat[] {
  return Array.from({ length: ticks }, () => oneBeat(fight));
}

/** One curtain: where its clods fell, in field order, and the clock it fell on. */
interface Curtain {
  readonly at: number;
  readonly xs: number[];
}

/** Every curtain inside these beats. */
function curtainsIn(beats: readonly Beat[]): Curtain[] {
  return beats
    .filter((beat) => firedOf(beat.events, 'clod').length > 0)
    .map((beat) => ({
      at: beat.at,
      xs: firedOf(beat.events, 'clod')
        .map((event) => event.x)
        .sort((a, b) => a - b),
    }));
}

/**
 * The way through a curtain: its widest step and the field x that step is
 * centred on. It is read off where the clods actually fell, which is the only
 * reading the player has too, and the field's own edges close the ends of it,
 * so a way through against a wall is measured rather than missed.
 */
function wayThrough(curtain: Curtain): { width: number; at: number } {
  const walls = [0, ...curtain.xs, FIELD_WIDTH];
  const steps = walls.slice(1).map((x, index) => ({
    width: x - walls[index],
    from: walls[index],
  }));
  const widest = steps.reduce((most, step) =>
    step.width > most.width ? step : most,
  );
  return { width: widest.width, at: widest.from + widest.width / 2 };
}

/**
 * How far off the arm a way through may sit and still be the arm's: the clods
 * stand on a lattice of their own spacing, so an opening between two of them
 * can only ever land within half a step of where the pattern aimed it.
 */
function latticeTolerance(size: number, clods: number): number {
  return (FIELD_WIDTH - curtainGap(size)) / clods / 2;
}

/**
 * Where the arm stood on a given tick, read off the shot it left there rather
 * than off any number the pattern holds.
 */
function armSweptIn(beats: readonly Beat[], at: number, boss: Boss): number {
  const shot = beats
    .find((beat) => beat.at === at)
    ?.shots.find((each) => each.kind === 'spiral');
  if (shot === undefined) throw new Error(`the arm left nothing at ${at}`);
  return boss.x + (shot.vx / SPIRAL_FIRE.shotSpeed) * ARM_REACH;
}

/** One chunk emptied, with the flash after it run down the way a tick does it. */
function breakChunk(fight: Fight): void {
  const boss = fight.state.boss;
  if (boss === null) throw new Error('no boss is standing');
  damageBoss(fight.state, boss.hp, 'skullStream');
  for (let tick = 0; tick < CHUNK_FLASH_TICKS; tick++) fight.tick();
}

/** The fight stood at the chunk asked for, with that chunk's clock at zero. */
function atChunk(fight: Fight, chunk: number): Fight {
  while ((fight.state.boss?.chunk ?? chunk) < chunk) breakChunk(fight);
  return fight;
}

/** Every mob alive on the field, which in his phase is every body he dug up. */
function diggers(state: RunState): Mob[] {
  return state.mobs.filter((mob) => mob.alive);
}

/**
 * The next curtain to fall with the grave held at this size, which is how a
 * curtain is read at a size the run did not start on.
 */
function nextCurtainAt(fight: Fight, size: number, within: number): Curtain {
  fight.state.grave.size = size;
  for (let tick = 0; tick < within; tick++) {
    const curtains = curtainsIn([oneBeat(fight)]);
    if (curtains.length > 0) return curtains[0];
  }
  throw new Error(`no curtain fell inside ${within} ticks`);
}

/**
 * What a full build lands on one body standing above the grave, per second,
 * computed from the lines' own exported rows at their top level.
 *
 * It is derived here and never pinned. The design record reads about 150 off
 * three modules step 1 was rewriting at the time, and a test carrying that
 * figure would keep passing after the weapons moved, which is the one failure
 * mode a property test of this shape has.
 *
 * Territory and the wisps are left out exactly as the record leaves them out:
 * Territory claims the densest knot of mobs ahead of the grave and the wisps
 * hunt bodies, so neither is a dependable share against one body standing at
 * the top of the field. Both add on top, so this is a floor rather than a
 * prediction, and the harness measures the real number at step 4.
 */
const FULL_BUILD_DAMAGE_PER_SECOND =
  (COLUMNS_BY_LEVEL[COLUMNS_BY_LEVEL.length - 1] * SKULL_DAMAGE) /
    (STREAM_INTERVAL / TICK_HZ) +
  BELL_DAMAGE_NEAR / (BELL_PERIOD / TICK_HZ);

/** One full emit of a chunk: the longest cycle any pattern live in it runs. */
function emitTicks(chunk: number): number {
  return Math.max(
    CURTAIN_ROWS[chunk]?.period ?? 0,
    SPIRAL_ROWS[chunk]?.period ?? 0,
  );
}

describe('the Undertaker fights in three chunks (ADR 0052)', () => {
  it('runs three chunks, and his death pays nothing of its own', () => {
    // ADR 0052: "it gets there across three chunks rather than across a bigger
    // health bar". The chunk count is the length of his own health row and both
    // pattern tables are the same length, so a fourth chunk is a row in three
    // places rather than a number in one and a pattern nowhere.
    expect(bossChunks('undertaker')).toBe(3);
    expect(CHUNK_HP.undertaker).toHaveLength(3);
    expect(CURTAIN_ROWS).toHaveLength(3);
    expect(SPIRAL_ROWS).toHaveLength(3);

    const fight = atTheUndertaker();
    const events: SimEvent[] = [];
    for (let chunk = 0; chunk < CHUNK_HP.undertaker.length; chunk++) {
      const boss = fight.state.boss!;
      events.push(...damageBoss(fight.state, boss.hp, 'skullStream'));
      for (let tick = 0; tick < CHUNK_FLASH_TICKS; tick++) fight.tick();
    }

    expect(only(events, 'chunkBroke').map((event) => event.chunk)).toEqual([
      1, 2,
    ]);
    expect(only(events, 'bossKilled').map((event) => event.boss)).toEqual([
      'undertaker',
    ]);
    expect(fight.state.boss).toBeNull();

    // game-concept.md:70: "no payout, the grave swallows the gravedigger." So
    // what stands on the field is the two chunk breaks' feasts and nothing the
    // death itself added; the ending is the stage's and lands with victory.
    expect(fight.state.corpses.filter((corpse) => corpse.alive)).toHaveLength(
      2,
    );
  });

  it('makes the last chunk his two shapes at once rather than a new one', () => {
    // ADR 0052: "a new authored pattern inside the Undertaker's own grammar of
    // falling curtains and slow spirals, so the grammar stays exclusive to
    // him." The novelty is the locking, and the tables say so: the burial has
    // the curtain, the exhumation the arm, and the last chunk both.
    expect(CURTAIN_ROWS.map((row) => row !== null)).toEqual([
      true,
      false,
      true,
    ]);
    expect(SPIRAL_ROWS.map((row) => row !== null)).toEqual([false, true, true]);

    // Read off the field rather than off the tables: what each chunk actually
    // puts up is one shape, then the other, then both.
    const shapesOf = (chunk: number): string[] => {
      const fight = atChunk(atTheUndertaker(), chunk);
      const beats = play(fight, emitTicks(chunk) + 1);
      const kinds = new Set(
        beats.flatMap((beat) =>
          only(beat.events, 'mobFired').map((event) => event.kind),
        ),
      );
      return [...kinds].sort();
    };
    expect(shapesOf(0)).toEqual(['clod']);
    expect(shapesOf(1)).toEqual(['spiral']);
    expect(shapesOf(2)).toEqual(['clod', 'spiral']);
  });
});

describe("the curtain's way through always fits the grave (ADR 0003)", () => {
  it("cuts it to the grave's own width plus a fixed margin, from the size floor to the ceiling", () => {
    // game-concept.md:70: "the gap always fits (gap width = current grave width
    // plus a fixed margin) ... so size earned before the fight is never
    // punished." It is arithmetic over the whole range ADR 0003 allows, so it
    // is walked across that range rather than checked at one size.
    for (let size = SIZE_FLOOR; size <= SIZE_CEILING; size += 0.5) {
      expect(`at ${size}: ${curtainGap(size)}`).toBe(
        `at ${size}: ${graveWidth(size) + GAP_MARGIN}`,
      );
    }
    expect(GAP_MARGIN).toBeGreaterThan(0);
    expect(curtainGap(SIZE_CEILING)).toBeGreaterThan(curtainGap(SIZE_FLOOR));

    // And it is the opening the curtain actually leaves, read off where the
    // clods fell: a rule nothing fires by is a rule the player never meets.
    const fight = atTheUndertaker();
    const curtain = curtainsIn(play(fight, CURTAIN_ROWS[0]!.period + 1))[0];
    expect(curtain).toBeDefined();
    expect(wayThrough(curtain).width).toBeGreaterThanOrEqual(
      curtainGap(SIZE_START),
    );
  });

  it('never throws a wall: every curtain of every chunk has a way through', () => {
    // game-concept.md:70's "never a wall", against the danmaku definition the
    // research quotes: a formation the player cannot move through. Both chunks
    // that throw one are measured, at both ends of the size range and at the
    // size a run starts on.
    for (const size of [SIZE_FLOOR, SIZE_START, SIZE_CEILING]) {
      for (const chunk of [0, 2]) {
        const fight = atChunk(atTheUndertaker(), chunk);
        fight.state.grave.size = size;
        const row = CURTAIN_ROWS[chunk]!;
        const curtains = curtainsIn(play(fight, row.period * 6 + 1));

        expect(curtains.length).toBeGreaterThan(3);
        for (const curtain of curtains) {
          const way = wayThrough(curtain);
          const named = `chunk ${chunk} at ${size}, curtain ${curtain.at}`;
          expect(`${named}: ${way.width >= curtainGap(size)}`).toBe(
            `${named}: true`,
          );
          // The way through is on the field, which is the only place a grave
          // can take it.
          expect(`${named}: ${way.at - way.width / 2 >= 0}`).toBe(
            `${named}: true`,
          );
          expect(`${named}: ${way.at + way.width / 2 <= FIELD_WIDTH}`).toBe(
            `${named}: true`,
          );
          // And the curtain is still a curtain: the opening is never bought by
          // dropping clods out of it.
          expect(`${named}: ${curtain.xs.length}`).toBe(
            `${named}: ${row.clods}`,
          );
        }
      }
    }
  });

  it('walks the way through rather than opening it in the same place twice', () => {
    // game-concept.md:70: "slow clod-curtains with one moving gap". A curtain
    // that opened in the same place every time would pass every measurement
    // above and be one position to learn, and one that jumped across the field
    // would be luck rather than a walk. So both halves are held: it moves, and
    // it moves by no more than the row says it walks.
    const fight = atTheUndertaker();
    const row = CURTAIN_ROWS[0]!;
    const centres = curtainsIn(play(fight, row.period * 6 + 1)).map(
      (curtain) => wayThrough(curtain).at,
    );
    const step =
      GAP_WALK * FIELD_WIDTH +
      latticeTolerance(fight.state.grave.size, row.clods) * 2;

    expect(centres.length).toBeGreaterThan(4);
    expect(new Set(centres).size).toBeGreaterThan(1);
    for (const [index, centre] of centres.slice(1).entries()) {
      const walked = Math.abs(centre - centres[index]);
      expect(`curtain ${index + 1}: ${walked <= step}`).toBe(
        `curtain ${index + 1}: true`,
      );
    }
  });

  it('follows a grave that grows mid-fight', () => {
    // The rule reads the grave's current width, so size earned during the fight
    // widens the next curtain rather than the next fight's.
    const fight = atTheUndertaker();
    const within = CURTAIN_ROWS[0]!.period + 1;
    const openedAt = (size: number): number =>
      wayThrough(nextCurtainAt(fight, size, within)).width;

    const atStart = openedAt(SIZE_START);
    const atCeiling = openedAt(SIZE_CEILING);
    expect(atCeiling).toBeGreaterThan(atStart);
    expect(atCeiling).toBeGreaterThanOrEqual(curtainGap(SIZE_CEILING));
  });

  it('follows a grave that shrinks mid-fight, down to the size floor', () => {
    // The other direction, and the one that could hide: an opening that only
    // ever grew would pass the test above while punishing nobody.
    const fight = atTheUndertaker();
    const within = CURTAIN_ROWS[0]!.period + 1;
    const openedAt = (size: number): number =>
      wayThrough(nextCurtainAt(fight, size, within)).width;

    const atCeiling = openedAt(SIZE_CEILING);
    const atFloor = openedAt(SIZE_FLOOR);
    expect(atFloor).toBeLessThan(atCeiling);
    expect(atFloor).toBeGreaterThanOrEqual(curtainGap(SIZE_FLOOR));
  });
});

describe('the exhumation and its diggers (game-concept.md:70, ADR 0007)', () => {
  it('digs up trash in the second chunk, and it leaves an ordinary corpse', () => {
    // game-concept.md:70: "summoned digger zombies, which are base trash
    // respawned by the boss (no new mob budget)", and CONTEXT.md's adds rule:
    // normal pushback, normal corpses. So a digger is a member of the ordinary
    // mob pool carrying the ordinary row, and no type is minted for the fight.
    const fight = atChunk(atTheUndertaker(), 1);
    const row = SPIRAL_ROWS[1]!;
    expect(diggers(fight.state)).toEqual([]);

    play(fight, row.diggerEvery + 1);
    const dug = diggers(fight.state);
    expect(dug).toHaveLength(1);
    expect(dug[0].type).toBe(DIGGER_TYPE);
    expect(dug[0].hp).toBe(MOB_TYPES[DIGGER_TYPE].hp);
    expect(dug[0].carries).toBe(false);

    // Killed the ordinary way, it pays its own row's payout and lands as food
    // the same as anything the timeline authored. It is told apart from the
    // chunk break's feast by id, because a break has already shed one.
    const standing = new Set(
      fight.state.corpses.filter((each) => each.alive).map((each) => each.id),
    );
    const events = damageMob(fight.state, dug[0], dug[0].hp, 'skullStream');
    expect(only(events, 'mobKilled').map((event) => event.mob)).toEqual([
      DIGGER_TYPE,
    ]);
    const shed = fight.state.corpses.filter(
      (each) => each.alive && !standing.has(each.id),
    );
    expect(shed).toHaveLength(1);
    expect(shed[0].payout).toBe(MOB_TYPES[DIGGER_TYPE].corpsePayout);
    expect(shed[0].decays).toBe(true);

    // And they keep coming, on the cadence the row authors.
    play(fight, row.diggerEvery * 3);
    expect(diggers(fight.state).length).toBeGreaterThanOrEqual(3);
  });

  it('keeps digging through the last chunk', () => {
    // The design record's "last, not middle, and the reason is food": a final
    // chunk that dropped the diggers would end the game on its only foodless
    // stretch, and ADR 0007's shed-food promise runs to the last chunk.
    const fight = atChunk(atTheUndertaker(), 2);
    const row = SPIRAL_ROWS[2]!;
    play(fight, row.diggerEvery * 3 + 1);
    expect(diggers(fight.state).length).toBeGreaterThanOrEqual(3);
  });
});

describe('the locked overlap (decision 26)', () => {
  it('runs both patterns at once on a thinner curtain than the burial threw', () => {
    // The design record's Yuyuko trade: the shipped precedent buys simultaneity
    // by cutting density, and cutting it here also protects the never-a-wall
    // rule and the gap rule. So the last chunk's curtain is thinner than the
    // first's, never denser, and the table and the field agree on it.
    expect(CURTAIN_ROWS[2]!.clods).toBeLessThan(CURTAIN_ROWS[0]!.clods);

    const burial = curtainsIn(
      play(atTheUndertaker(), CURTAIN_ROWS[0]!.period + 1),
    )[0];
    const beats = play(
      atChunk(atTheUndertaker(), 2),
      CURTAIN_ROWS[2]!.period + 1,
    );

    expect(curtainsIn(beats)[0].xs.length).toBeLessThan(burial.xs.length);
    // Both at once is the chunk: the arm turns through the same window the
    // curtain falls in.
    expect(
      beats.flatMap((beat) => firedOf(beat.events, 'spiral')).length,
    ).toBeGreaterThan(0);
  });

  it("opens the last chunk's curtain where the arm has just swept", () => {
    // decision 26: "the safe place is the place the arm has already been." The
    // opening is read off the clods and the arm off the shot it left behind, so
    // what is held is that the two agree on the field rather than in the code.
    const fight = atChunk(atTheUndertaker(), 2);
    const beats = play(fight, CURTAIN_ROWS[2]!.period + 1);
    const curtain = curtainsIn(beats)[0];
    const way = wayThrough(curtain);
    const tolerance = latticeTolerance(
      fight.state.grave.size,
      CURTAIN_ROWS[2]!.clods,
    );

    expect(
      Math.abs(
        way.at - armSweptIn(beats, curtain.at - GAP_LAG_TICKS, fight.boss),
      ),
    ).toBeLessThanOrEqual(tolerance);
    // It follows rather than leads, which is the whole of the twist: the
    // opening is where the arm was and not where it is standing now.
    expect(
      Math.abs(way.at - armSweptIn(beats, curtain.at, fight.boss)),
    ).toBeGreaterThan(tolerance);
  });

  it('holds the two emitters in phase for the whole chunk', () => {
    // Both read the one pattern clock, so the opening cannot drift off the arm
    // part-way through a chunk: a lag that accumulated would leave the last
    // curtains opening nowhere in particular, which is exactly how a legible
    // twist becomes a random gap in a busier screen.
    const fight = atChunk(atTheUndertaker(), 2);
    const row = CURTAIN_ROWS[2]!;
    const beats = play(fight, row.period * 8 + 1);
    const curtains = curtainsIn(beats);
    const tolerance = latticeTolerance(fight.state.grave.size, row.clods);
    expect(curtains.length).toBeGreaterThan(6);

    for (const curtain of curtains) {
      const swept = armSweptIn(beats, curtain.at - GAP_LAG_TICKS, fight.boss);
      const off = Math.abs(wayThrough(curtain).at - swept);
      expect(`curtain ${curtain.at}: ${off <= tolerance}`).toBe(
        `curtain ${curtain.at}: true`,
      );
    }
  });
});

describe('what his grammar excludes (game-concept.md:72)', () => {
  it('throws no cone and no expanding ring', () => {
    // game-concept.md:72: "the Banshee owns expanding rings, the Undertaker owns
    // falling curtains and slow spirals." An expanding ring is many bearings
    // leaving one point at one instant, so the absence is mechanical: nothing
    // he fires ever leaves one point twice in a tick. A curtain is one bearing
    // from many points and the arm is one point one bearing at a time.
    const fight = atTheUndertaker();
    const beats = [
      ...play(fight, CURTAIN_ROWS[0]!.period * 2 + 1),
      ...play(atChunk(fight, 2), CURTAIN_ROWS[2]!.period * 2 + 1),
    ];
    expect(beats.some((beat) => only(beat.events, 'mobFired').length > 0)).toBe(
      true,
    );

    for (const beat of beats) {
      const fromEach = new Map<string, number>();
      for (const event of only(beat.events, 'mobFired')) {
        const from = `${event.x},${event.y}`;
        fromEach.set(from, (fromEach.get(from) ?? 0) + 1);
      }
      for (const [from, count] of fromEach) {
        expect(`tick ${beat.at} from ${from}: ${count}`).toBe(
          `tick ${beat.at} from ${from}: 1`,
        );
      }
    }

    // The deliberate absence beside it, read off his own source: his module does
    // not reach for the other two shapes' vocabulary at all. Word boundaries
    // rather than substrings, because "during" carries a ring inside it.
    expect(undertakerSource).not.toMatch(/\bcones?\b/i);
    expect(undertakerSource).not.toMatch(/\btolls?\b/i);
    expect(undertakerSource).not.toMatch(/\brings?\b/i);
  });
});

describe('what a chunk of his health buys (ADR 0052)', () => {
  it('gives every chunk enough health to survive one full emit, and buys his length in chunks', () => {
    // game-concept.md:104 lists "whether a pattern chunk ever ends before
    // finishing one full emit" as an instrument, and the property under it is
    // that the best player in the game still sees the pattern each chunk was
    // written for. So no chunk's health falls below what a full build lands
    // across one emit of that chunk's own longest cycle.
    for (let chunk = 0; chunk < CHUNK_HP.undertaker.length; chunk++) {
      const floor = (FULL_BUILD_DAMAGE_PER_SECOND * emitTicks(chunk)) / TICK_HZ;
      expect(`chunk ${chunk}: ${CHUNK_HP.undertaker[chunk] > floor}`).toBe(
        `chunk ${chunk}: true`,
      );
      expect(emitTicks(chunk)).toBeGreaterThan(0);
    }

    // ADR 0052's own shape: the length is bought across chunks rather than
    // across a bigger bar. What has to be taken off him is the sum of his rows
    // and never the largest of them, and each row is a bar with a break behind
    // it.
    const fight = atTheUndertaker();
    let taken = 0;
    while (fight.state.boss !== null) {
      const boss = fight.state.boss;
      taken += boss.hp;
      damageBoss(fight.state, boss.hp, 'skullStream');
      for (let tick = 0; tick < CHUNK_FLASH_TICKS; tick++) fight.tick();
    }
    expect(taken).toBe(
      CHUNK_HP.undertaker.reduce((total, chunk) => total + chunk, 0),
    );
    expect(taken).toBeGreaterThan(Math.max(...CHUNK_HP.undertaker));
  });
});
