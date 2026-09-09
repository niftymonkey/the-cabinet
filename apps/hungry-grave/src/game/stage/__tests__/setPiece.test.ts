/**
 * The Waking (ADR 0042, ADR 0050): a source that rides the ground down at the
 * field's own scroll, opens a quarter of the way down and pours trash from its
 * one point while it drags across.
 *
 * The property it must keep is a comparison between two hands and never a
 * magnitude, so the two policies that carry it play whole ticks through the
 * execution authority; everything about the source's own machine is driven at
 * the module's seam instead, on a field nothing else is putting bodies on.
 *
 * Nothing in this file names a mob type. ADR 0042 rules that a set piece names
 * the property it must keep and never the cast, and the fence at the bottom is
 * that rule made mechanical over this file's own source.
 */

import { describe, expect, it } from 'vitest';

import setPieceTestSource from './setPiece.test.ts?raw';

import { divingPolicy, waitingPolicy } from '../../../dev/bot';
import { stepping } from '../../../dev/stepping';
import { TICK_HZ } from '../../clock';
import type { TickCommand } from '../../command';
import { asSwallowable, spawnFeast } from '../../corpses';
import type { SimEvent } from '../../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../field';
import { BELL_DAMAGE_NEAR, BELL_PERIOD } from '../../lines/bell';
import { BIRTHRIGHT, MAX_LEVEL } from '../../lines/roster';
import { advanceTerritory } from '../../lines/territory';
import {
  COLUMNS_BY_LEVEL,
  SKULL_DAMAGE,
  STREAM_INTERVAL,
} from '../../lines/skullStream';
import { MOB_TYPES, MOB_TYPE_NAMES, spawnMob } from '../../mobs';
import type { RunState } from '../../run';
import { createRun, uniformLevels } from '../../run';
import { swallow } from '../../swallow';
import {
  FEAST_PAYOUT,
  FRESHNESS_SECONDS,
  SCROLL_SPEED,
  SIZE_CEILING,
} from '../../tuning';
import {
  CROWD_ROWS,
  POUR_JITTER_X,
  POUR_LIP_X,
  POUR_SECONDS,
  SET_PIECE_BUDGET,
  SET_PIECE_HALF_HEIGHT,
  SET_PIECE_HP,
  SET_PIECE_OPEN_DEPTH,
  SET_PIECE_POUR_SECONDS,
  SET_PIECE_SWEEP_MAX_X,
  SET_PIECE_SWEEP_MIN_X,
} from '../rows';
import {
  advanceSetPiece,
  damageSetPiece,
  placeSetPiece,
  setPieceHitbox,
} from '../setPiece';
import { PHASES } from '../stage';

const SEED = 20260910;

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

/** The phase the stage authors the pour in. */
const WAKING = PHASES.findIndex((phase) => phase.name === 'waking');

/** How long the source is given to do whatever a test is waiting for. */
const SOURCE_TICKS = 4000;

/**
 * A full build's storm on one body directly above the grave, per second, from
 * the two lines that hold a share against a stationary target: the stream's
 * columns at its own interval and the bell at close range on its own period.
 *
 * Derived from the lines' own exported rows at their top level rather than
 * pinned, for the reason the same figure is derived in undertaker.test.ts: a
 * number read off three modules while they were being rewritten would keep
 * passing after the weapons had moved. Territory and the wisps are left out, so
 * this is a floor rather than a prediction.
 */
const FULL_BUILD_DAMAGE_PER_SECOND =
  (COLUMNS_BY_LEVEL[COLUMNS_BY_LEVEL.length - 1] * SKULL_DAMAGE) /
    (STREAM_INTERVAL / TICK_HZ) +
  BELL_DAMAGE_NEAR / (BELL_PERIOD / TICK_HZ);

interface Source {
  readonly state: RunState;
  /** One tick of the source's own machine, and what it reported. */
  readonly tick: () => SimEvent[];
}

/**
 * A run holding the source and nothing else, ticked at the module's own seam.
 *
 * The stage is stood in the phase the pour runs in so the source is where the
 * stage puts it, and nothing else ticks: what arrives on the field here is the
 * pour's, which is what lets a count of arrivals be a count of the pour.
 */
function atTheSource(): Source {
  const state = createRun(SEED);
  state.stage.phaseIndex = WAKING;
  placeSetPiece(state);
  return { state, tick: () => advanceSetPiece(state) };
}

/** Ticks the source until it opens, and answers with the tick that opened it. */
function tickUntilItOpens(source: Source): number {
  for (let tick = 0; tick < SOURCE_TICKS; tick++) {
    source.tick();
    if (source.state.setPiece?.open === true) return tick;
  }
  throw new Error('the source never opened');
}

/** Every event the source reported from where it stands until it is gone. */
function tickUntilItCloses(source: Source): SimEvent[] {
  const events: SimEvent[] = [];
  for (let tick = 0; tick < SOURCE_TICKS; tick++) {
    events.push(...source.tick());
    if (source.state.setPiece === null) return events;
  }
  throw new Error('the source never closed');
}

/** Every event of one kind a run reported, in order. */
function only<T extends SimEvent['type']>(
  events: readonly SimEvent[],
  type: T,
): Extract<SimEvent, { type: T }>[] {
  return events.filter(
    (event): event is Extract<SimEvent, { type: T }> => event.type === type,
  );
}

interface Waking {
  readonly state: RunState;
  readonly tick: (command: TickCommand) => readonly SimEvent[];
}

/**
 * A whole run standing at the moment the source opens, ticked through the
 * execution authority (ADR 0017) so the pour lands into the rows the phase
 * authors and the grave meets all of it.
 *
 * The source is stood at its own opening depth rather than drifted down to it,
 * which is the same instrument endings.test.ts stands a fight on its last chunk
 * with: what is under test is the moment, not the twenty seconds of arrival in
 * front of it.
 *
 * The grave arrives at the ceiling on a full build, which is what the Waking is
 * authored to be met with: the twenty-five carriers stand eight and eleven
 * before it and a hand that kills them is at full power here (decision 10,
 * ADR 0049). It is pinned rather than played to for the reason every whole-run
 * pin in this tree is: none of these policies dives for an offer, so the loadout
 * one would reach by playing is the one it started with. Without it the storm
 * kills almost nothing, there is no trail to commit to, and the comparison the
 * property is about would be measured over an empty set.
 */
function atTheWaking(seed: number = SEED): Waking {
  const state = createRun(seed, SIZE_CEILING, uniformLevels(MAX_LEVEL));
  state.stage.phaseIndex = WAKING;
  const piece = placeSetPiece(state);
  piece.y = FIELD_HEIGHT * SET_PIECE_OPEN_DEPTH;
  const step = stepping(state);
  return { state, tick: (command) => step(command) };
}

/** What a hand swallowed and what it cost, playing from the source's opening. */
interface Played {
  readonly swallowed: number;
  readonly sealed: boolean;
  readonly events: SimEvent[];
  readonly state: RunState;
}

/**
 * One hand playing from the source's opening until the source is gone and the
 * trail it left has been eaten or has gone under.
 *
 * The tail is one freshness window past the source leaving, which is what the
 * property is about: a corpse made at the source's own depth reaches the bottom
 * edge as its freshness runs out, so a window that stopped at the last body
 * would read half the trail and a longer one would read the section after it.
 */
function playTheWaking(
  policy: (state: RunState, caused: SimEvent[]) => TickCommand,
  seed: number,
): Played {
  const waking = atTheWaking(seed);
  const events: SimEvent[] = [];
  let caused: SimEvent[] = [];
  let sealed = false;
  let gone = -1;
  for (let tick = 0; tick < SOURCE_TICKS; tick++) {
    const stepped = waking.tick(policy(waking.state, caused));
    caused = [...stepped];
    events.push(...stepped);
    if (waking.state.ending === 'sealed') {
      sealed = true;
      break;
    }
    if (waking.state.setPiece === null && gone < 0) gone = tick;
    if (gone >= 0 && tick - gone > FRESHNESS_SECONDS * TICK_HZ) break;
  }
  return {
    swallowed: only(events, 'swallowed').length,
    sealed,
    events,
    state: waking.state,
  };
}

/** The bodies a table's rows land inside the window opening at this second. */
function arrivalsFrom(
  rows: readonly { t: number; count: number }[],
  from: number,
  seconds: number,
): number {
  return rows
    .filter((row) => row.t >= from && row.t < from + seconds)
    .reduce((total, row) => total + row.count, 0);
}

describe('the Waking pours from one point (ADR 0042, ADR 0050)', () => {
  it('pours bodies out of the source and fires nothing at all', () => {
    // ADR 0050: "it fires no pattern the player has to dodge as a boss
    // pattern." Everything that arrives comes out of the mouth's own width, and
    // the source's own tick emits no shot in the whole of its stay.
    const source = atTheSource();
    tickUntilItOpens(source);
    const at = { ...source.state.setPiece! };
    const events = tickUntilItCloses(source);
    const poured = only(events, 'setPiecePoured');

    expect(poured.length).toBe(SET_PIECE_BUDGET);
    expect(only(events, 'mobFired')).toEqual([]);
    // Out of one point: every body lands inside the mouth, which is the lip
    // plus whatever the draw moved it.
    const mouth = POUR_LIP_X + POUR_JITTER_X;
    for (const body of source.state.mobs.filter((mob) => mob.alive)) {
      const from = poured.find((event) => event.y === body.y)!;
      expect(Math.abs(body.x - from.x)).toBeLessThanOrEqual(mouth);
    }
    // And it moved while it poured, so "one point" is the source's own place
    // rather than a fixed spot on the field.
    expect(source.state.setPiece).toBeNull();
    expect(poured[poured.length - 1].y).toBeGreaterThan(at.y);
  });

  it('opens at its authored depth and not one tick before', () => {
    const source = atTheSource();
    const opensAt = FIELD_HEIGHT * SET_PIECE_OPEN_DEPTH;
    let last = { ...source.state.setPiece! };
    for (let tick = 0; tick < SOURCE_TICKS; tick++) {
      const events = source.tick();
      const piece = source.state.setPiece!;
      if (!piece.open) {
        // Nothing pours before the mouth is open, and the depth is why.
        expect(only(events, 'setPiecePoured')).toEqual([]);
        expect(last.y).toBeLessThan(opensAt);
        last = { ...piece };
        continue;
      }
      expect(piece.y).toBeGreaterThanOrEqual(opensAt);
      expect(last.y).toBeLessThan(opensAt);
      expect(only(events, 'setPieceOpened')).toHaveLength(1);
      expect(only(events, 'setPieceOpened')[0].budget).toBe(SET_PIECE_BUDGET);
      // Which source opened, so a reading over a run holding two of them names
      // the one it measured rather than whichever opened first.
      expect(only(events, 'setPieceOpened')[0].id).toBe(piece.id);
      return;
    }
    throw new Error('the source never opened');
  });

  it('stops when its budget is spent and says so once', () => {
    const source = atTheSource();
    tickUntilItOpens(source);
    const events = tickUntilItCloses(source);
    const closed = only(events, 'setPieceClosed');

    expect(closed).toHaveLength(1);
    expect(closed[0].reason).toBe('spent');
    expect(closed[0].left).toBe(0);
    expect(only(events, 'setPiecePoured')).toHaveLength(SET_PIECE_BUDGET);
    expect(source.state.setPiece).toBeNull();
  });

  it('reports a scrolled source under its own reason', () => {
    // Two ends to one thing, so a reading groups by the reason rather than by
    // which of two events it met. The kill is not one of them: it is its own
    // event and it ends no pour (#104).
    const scrolled = atTheSource();
    tickUntilItOpens(scrolled);
    scrolled.state.setPiece!.y = FIELD_HEIGHT + SET_PIECE_HALF_HEIGHT;
    const off = tickUntilItCloses(scrolled);

    expect(only(off, 'setPieceClosed')).toHaveLength(1);
    expect(only(off, 'setPieceClosed')[0].reason).toBe('scrolled');
    expect(only(off, 'setPieceClosed')[0].left).toBeGreaterThan(0);
  });

  it('keeps pouring on its own schedule once its body is gone', () => {
    // Mark's ruling on #104, 2026-09-08: killing the source removes its body
    // and nothing else, so the remaining budget keeps pouring from the pour
    // point on the same clock. It supersedes the promise this test carried,
    // that the kill ends the moment early and the rest is never poured, which
    // rewarded the hand that held back over the hand that committed.
    const source = atTheSource();
    tickUntilItOpens(source);
    for (let tick = 0; tick < 5 * TICK_HZ; tick++) source.tick();
    const left = source.state.setPiece!.budget;
    damageSetPiece(source.state, SET_PIECE_HP, BIRTHRIGHT[0]);
    const at: number[] = [];
    const poured: { x: number; y: number }[] = [];
    for (let tick = 0; tick < SOURCE_TICKS; tick++) {
      for (const body of only(source.tick(), 'setPiecePoured')) {
        at.push(tick);
        poured.push(body);
      }
      if (source.state.setPiece === null) break;
    }

    expect(left).toBeGreaterThan(0);
    expect(poured).toHaveLength(left);
    // On the same clock: every gap between two bodies is the authored interval
    // and no gap is anything else.
    const gaps = at.slice(1).map((tick, index) => tick - at[index]);
    expect([...new Set(gaps)]).toEqual([SET_PIECE_POUR_SECONDS * TICK_HZ]);
    // And from the pour point, which is still drifting and sweeping: the trail
    // after the kill lies inside the same authored bounds as the trail before.
    expect(Math.min(...poured.map((body) => body.x))).toBeGreaterThanOrEqual(
      SET_PIECE_SWEEP_MIN_X,
    );
    expect(Math.max(...poured.map((body) => body.x))).toBeLessThanOrEqual(
      SET_PIECE_SWEEP_MAX_X,
    );
  });

  it('ends on its budget after a kill, and leaves only then', () => {
    // The kill takes a close reason away rather than adding one: what is left
    // is spent and scrolled, and a killed source reaches the ordinary one.
    const source = atTheSource();
    tickUntilItOpens(source);
    for (let tick = 0; tick < 5 * TICK_HZ; tick++) source.tick();
    damageSetPiece(source.state, SET_PIECE_HP, BIRTHRIGHT[0]);

    expect(source.state.setPiece).not.toBeNull();

    const events = tickUntilItCloses(source);
    const closed = only(events, 'setPieceClosed');

    expect(closed).toHaveLength(1);
    expect(closed[0].reason).toBe('spent');
    expect(closed[0].left).toBe(0);
    expect(source.state.setPiece).toBeNull();
  });

  it('loses its body and everything the storm can reach on the kill tick', () => {
    // The kill is the body and nothing else. What goes with it is the hitbox,
    // which is what empties the storm's target slot, and any further damage:
    // a body that is gone is not there to be hit again.
    const source = atTheSource();
    tickUntilItOpens(source);
    for (let tick = 0; tick < 5 * TICK_HZ; tick++) source.tick();
    const piece = source.state.setPiece!;
    const left = piece.budget;
    const killing = damageSetPiece(source.state, SET_PIECE_HP, BIRTHRIGHT[0]);

    expect(only(killing, 'mobDamaged')).toHaveLength(1);
    expect(only(killing, 'setPieceKilled')).toHaveLength(1);
    expect(only(killing, 'setPieceKilled')[0].left).toBe(left);
    expect(setPieceHitbox(piece)).toBeNull();

    const spent = piece.hp;
    expect(damageSetPiece(source.state, 100, BIRTHRIGHT[0])).toEqual([]);
    expect(piece.hp).toBe(spent);

    // And it stays gone while the pour goes on: the next body comes out of the
    // mouth and the box is still empty behind it.
    const next: SimEvent[] = [];
    for (let tick = 0; tick < SET_PIECE_POUR_SECONDS * TICK_HZ; tick++) {
      next.push(...source.tick());
    }

    expect(only(next, 'setPiecePoured')).toHaveLength(1);
    expect(source.state.setPiece!.budget).toBe(left - 1);
    expect(setPieceHitbox(source.state.setPiece!)).toBeNull();
  });

  it('never lands two bodies on the same point', () => {
    // The narrow no-stack rule this one caller carries (#81 stays unowned): the
    // mouth pours from alternating lips, so two bodies in a row stand clear of
    // each other rather than on top of each other.
    const source = atTheSource();
    tickUntilItOpens(source);
    const poured = only(tickUntilItCloses(source), 'setPiecePoured');
    const points = poured.map((event) => `${event.x},${event.y}`);

    expect(new Set(points).size).toBe(points.length);
    const widest = Math.max(
      ...MOB_TYPE_NAMES.map((type) => MOB_TYPES[type].halfWidth * 2),
    );
    for (let at = 1; at < poured.length; at++) {
      expect(Math.abs(poured[at].x - poured[at - 1].x)).toBeGreaterThan(widest);
    }
  });

  it('draws its pour from the spawns stream and from no other', () => {
    // ADR 0006's stream rule: what chance the sim spends comes from a named
    // seeded stream, so one seed pours one sequence. A pour is a spawn, so it
    // draws where every other placement scatter does.
    const source = atTheSource();
    tickUntilItOpens(source);
    const before = source.state.streams.spawns.drawn;
    const fired = source.state.streams.mobFire.drawn;
    const others = {
      drops: source.state.streams.drops.drawn,
      shed: source.state.streams.shed.drawn,
      territory: source.state.streams.territory.drawn,
    };
    const first = only(tickUntilItCloses(source), 'setPiecePoured');

    expect(source.state.streams.spawns.drawn).toBeGreaterThan(before);
    expect({
      drops: source.state.streams.drops.drawn,
      shed: source.state.streams.shed.drawn,
      territory: source.state.streams.territory.drawn,
    }).toEqual(others);
    // The fire stream moved too, and none of it is the source's: spawnMob draws
    // a first-shot offset for every armed body it puts on the field, so what is
    // there is one draw per armed body the pour landed and not one for the pour.
    const armed = source.state.mobs.filter(
      (mob) => mob.alive && mob.armed,
    ).length;
    expect(source.state.streams.mobFire.drawn - fired).toBe(armed);

    // One seed, one sequence: the same run played again lands the same trail.
    const again = atTheSource();
    tickUntilItOpens(again);
    const second = only(tickUntilItCloses(again), 'setPiecePoured');
    expect(second.map((event) => event.x)).toEqual(
      first.map((event) => event.x),
    );
    // And the draw really moves the trail, so the sequence is chance spent
    // rather than a metronome that would repeat under any stream at all.
    expect(new Set(first.map((event) => event.x)).size).toBeGreaterThan(2);
  });

  it("falls at the field's own scroll, so it stays in the rock it sits in", () => {
    // Mark's ruling of 2026-09-08, after ground adjustment 1 put the ground at
    // the field's own scroll: the source is a place on that ground rather than
    // a body falling through it, so the rock and the mouth in it move as one.
    // The rate is read by drifting a real patch beside the source rather than
    // off this module's own row, which is how the renderer's patch test reads
    // the same fact from the other side.
    const source = atTheSource();
    const patch = source.state.patches[0];
    patch.alive = true;
    patch.y = 100;
    patch.radius = 40;
    const patchStood = patch.y;
    const sourceStood = source.state.setPiece!.y;
    const ticks = 120;
    for (let tick = 0; tick < ticks; tick++) {
      advanceTerritory(source.state);
      source.tick();
    }
    const patchFell = patch.y - patchStood;
    const sourceFell = source.state.setPiece!.y - sourceStood;

    expect(patchFell).toBeGreaterThan(0);
    expect(sourceFell).toBeCloseTo(patchFell, 6);
    expect(sourceFell).toBeCloseTo(SCROLL_SPEED * ticks, 6);
  });

  it('spends its whole budget before the bottom edge, with a body of margin', () => {
    // The pour is the moment, so the ordinary end is the budget running out and
    // never the edge arriving: at the field's own scroll the opening depth is
    // the row that buys that, and what it has to buy is the whole pour plus at
    // least one more body's worth of fall.
    const source = atTheSource();
    const events = tickUntilItCloses(source);
    const closed = only(events, 'setPieceClosed');
    const poured = only(events, 'setPiecePoured');
    const spentAt = poured[poured.length - 1].y;
    const leavesAt = FIELD_HEIGHT + SET_PIECE_HALF_HEIGHT;

    expect(closed).toHaveLength(1);
    expect(closed[0].reason).toBe('spent');
    expect(poured).toHaveLength(SET_PIECE_BUDGET);
    expect(leavesAt - spentAt).toBeGreaterThan(
      SCROLL_SPEED * SET_PIECE_POUR_SECONDS * TICK_HZ,
    );
  });

  it('keeps the trail inside its authored sweep bounds at every tick', () => {
    // The trail never lays against a side, because a body walking in at an edge
    // leaves its corpse in a gutter the dive cannot follow as a curve.
    const source = atTheSource();
    const seen: number[] = [];
    for (let tick = 0; tick < SOURCE_TICKS; tick++) {
      source.tick();
      if (source.state.setPiece === null) break;
      seen.push(source.state.setPiece.x);
    }
    const poured = source.state.mobs
      .filter((mob) => mob.alive)
      .map((mob) => mob.x);

    expect(seen.length).toBeGreaterThan(0);
    expect(Math.min(...seen)).toBeGreaterThanOrEqual(SET_PIECE_SWEEP_MIN_X);
    expect(Math.max(...seen)).toBeLessThanOrEqual(SET_PIECE_SWEEP_MAX_X);
    expect(Math.min(...poured)).toBeGreaterThanOrEqual(SET_PIECE_SWEEP_MIN_X);
    expect(Math.max(...poured)).toBeLessThanOrEqual(SET_PIECE_SWEEP_MAX_X);
    // The bounds are inside the field rather than the field itself, which is
    // what says the trail is a curve rather than a wall of corpses.
    expect(SET_PIECE_SWEEP_MIN_X).toBeGreaterThan(0);
    expect(SET_PIECE_SWEEP_MAX_X).toBeLessThan(FIELD_WIDTH);
  });

  it('outlives its own pour under a full build', () => {
    // The health row's own reason since Mark's ruling on #104: it is the
    // source's stay, how long the body stays a target and a thing to read,
    // rather than what keeps the pour finishing, which the ruling now does
    // whatever the storm did. Both sides are derived, the storm from the lines'
    // own rows and the pour's length from its budget and interval.
    expect(SET_PIECE_HP).toBeGreaterThan(
      FULL_BUILD_DAMAGE_PER_SECOND * POUR_SECONDS,
    );
    expect(POUR_SECONDS).toBe(SET_PIECE_BUDGET * SET_PIECE_POUR_SECONDS);
  });

  it('pours denser than the densest ten seconds the sections author', () => {
    // The loudest beat in the run cannot arrive thinner than the section it
    // interrupts, and it is measured off the pour rather than off the row it
    // was authored from.
    const source = atTheSource();
    tickUntilItOpens(source);
    const at: number[] = [];
    for (let tick = 0; tick < SOURCE_TICKS; tick++) {
      const events = source.tick();
      for (let body = only(events, 'setPiecePoured').length; body > 0; body--) {
        at.push(tick);
      }
      if (source.state.setPiece === null) break;
    }
    const window = 10 * TICK_HZ;
    const densestPour = Math.max(
      ...at.map(
        (from) =>
          at.filter((each) => each >= from && each - from < window).length,
      ),
    );
    const densestCrowd = Math.max(
      ...CROWD_ROWS.map((row) => arrivalsFrom(CROWD_ROWS, row.t, 10)),
    );

    expect(at).toHaveLength(SET_PIECE_BUDGET);
    expect(densestPour).toBeGreaterThan(densestCrowd);
  });

  it('never touches the grave, whatever is parked under it', () => {
    // The parking rule, as an absence: the source has no hitbox against the
    // grave at all, so a grave sitting in the densest traffic it will meet all
    // run takes that traffic and nothing from the mouth above it.
    const waking = atTheWaking();
    const state = waking.state;
    // The section's own rows are marked fired and the pour is held off every
    // tick, so the only thing standing over the grave is the source itself:
    // what the poured bodies do to a parked grave is ordinary mob contact and
    // is not what this absence is about.
    state.stage.firedRows = PHASES[WAKING].rows.length;
    const events: SimEvent[] = [];
    for (let tick = 0; tick < SOURCE_TICKS; tick++) {
      if (state.setPiece === null) break;
      state.setPiece.pourIn = SOURCE_TICKS;
      // Parked under the mouth, wherever the sweep has carried it.
      state.grave.x = state.setPiece.x;
      state.grave.y = state.setPiece.y;
      events.push(...waking.tick(STILL));
    }

    expect(events.length).toBeGreaterThan(0);
    expect(only(events, 'graveHit')).toEqual([]);
    expect(state.grave.size).toBe(SIZE_CEILING);

    // And the input can produce presence: the same place with a body in it does
    // hit, so the absence above is a rule rather than an empty field.
    const body = atTheWaking();
    body.state.grave.x = body.state.setPiece!.x;
    body.state.grave.y = body.state.setPiece!.y;
    const standing = spawnMob(
      body.state,
      MOB_TYPE_NAMES[0],
      {
        x: body.state.grave.x,
        y: body.state.grave.y,
        vx: 0,
        vy: 1,
        index: 0,
      },
      false,
    )!;
    // Past its arriving beat, because a body placed inside the field holds that
    // beat before it can touch. What this half is asking is whether a body in
    // the mouth's place hits at all, not when it hits.
    standing.beat = 0;
    expect(only(body.tick(STILL), 'graveHit').length).toBeGreaterThan(0);
  });

  it('gives the reservoir nothing of its own', () => {
    // ADR 0050: "It is not a second feast, because the Wall stays the run's
    // outlier and its reservoir gift is the one that is choreographed." What
    // the source hands the player is a trail of ordinary corpses: it sheds no
    // treasure and charges nothing itself, so a whole pour that nobody eats
    // leaves the reservoir where it found it.
    const source = atTheSource();
    tickUntilItOpens(source);
    const events = tickUntilItCloses(source);

    expect(only(events, 'setPiecePoured')).toHaveLength(SET_PIECE_BUDGET);
    expect(only(events, 'reservoirCharged')).toEqual([]);
    expect(source.state.reservoir).toBe(0);
    expect(
      source.state.corpses.filter((corpse) => corpse.alive && !corpse.decays),
    ).toEqual([]);

    // And the same rig with a feast in it does charge, so the absence above is
    // a rule rather than a run where nothing could have paid.
    const fed = atTheSource();
    spawnFeast(fed.state, fed.state.grave.x, fed.state.grave.y, FEAST_PAYOUT);
    const feast = fed.state.corpses.find((corpse) => corpse.alive)!;
    const charged = swallow(fed.state, asSwallowable(feast));
    expect(only(charged, 'reservoirCharged').length).toBeGreaterThan(0);
    expect(fed.state.reservoir).toBeGreaterThan(0);
  });
});

/**
 * The seeds the property is read over: the repo's standing five, and this
 * file's own beside them.
 */
const PROPERTY_SEEDS: readonly number[] = [SEED, 101, 202, 303, 404, 505];

/**
 * The seeds on which the waiting hand eats at least as much as the committing
 * one, and there are none.
 *
 * It is pinned as a set rather than left as a per-seed law because the
 * comparison is a quantity and not a survival: a sweep of twelve seeds while
 * this was written had eleven going the committing way and one the other, and
 * which seed that was moved with the window the trail was read over. What holds
 * across every sweep is the total, which the assertion below carries, and what
 * this set holds is that no seed in the standing five has gone the other way.
 * The day one does, this file goes red and says which.
 */
const WAITING_EATS_MORE: number[] = [];

/**
 * How much more the committing hand takes across the seeds. Half again is well
 * under what was measured, better than twice on every window the trail was read
 * over, so what is pinned is that the difference is one of kind and never the
 * figure.
 */
const COMMITTING_PAYS_OVER = 1.5;

/** The budget for the two tests that play a dozen whole Wakings each. */
const A_DOZEN_WAKINGS_MS = 30000;

describe("the Waking's own property (ADR 0042)", () => {
  it(
    'pays a grave that commits to the trail far more than one that waits at the bottom edge',
    () => {
      // The design record's property, first half: "a grave that commits to the
      // trail swallows the bulk of it before freshness runs out; one that stays
      // low and lets the scroll deliver gets scraps." Measured in corpses and
      // never in hits.
      const played = PROPERTY_SEEDS.map((seed) => ({
        seed,
        diving: playTheWaking(divingPolicy, seed),
        waiting: playTheWaking(waitingPolicy, seed),
      }));
      const total = (of: 'diving' | 'waiting'): number =>
        played.reduce((sum, each) => sum + each[of].swallowed, 0);

      // Waiting takes scraps and never nothing: paid nothing at all it would be
      // a loss rather than the other side of a choice.
      expect(total('waiting')).toBeGreaterThan(0);
      expect(total('diving')).toBeGreaterThan(
        total('waiting') * COMMITTING_PAYS_OVER,
      );
      expect(
        played
          .filter((each) => each.waiting.swallowed >= each.diving.swallowed)
          .map((each) => each.seed),
      ).toEqual(WAITING_EATS_MORE);
    },
    A_DOZEN_WAKINGS_MS,
  );

  it(
    'seals neither the grave that commits nor the one that waits',
    () => {
      // The second half, and it is load-bearing: if committing were lethal the
      // moment is a dose of hell rather than heaven at its loudest, which ADR
      // 0050 forbids in as many words.
      for (const seed of PROPERTY_SEEDS) {
        expect(`${seed} ${playTheWaking(divingPolicy, seed).sealed}`).toBe(
          `${seed} false`,
        );
        expect(`${seed} ${playTheWaking(waitingPolicy, seed).sealed}`).toBe(
          `${seed} false`,
        );
      }
    },
    A_DOZEN_WAKINGS_MS,
  );
});

describe('the set piece names a property and never a cast (ADR 0042)', () => {
  it('names no mob type anywhere in its own tests', () => {
    // The fence form of ADR 0042: "A set piece names the property it must keep,
    // never the mob types allowed in it." What the pour is made of is a row in
    // rows.ts, so re-casting it is a data edit and nothing here goes red.
    const named = MOB_TYPE_NAMES.filter((type) =>
      [`'${type}'`, `"${type}"`, `\`${type}\``].some((literal) =>
        setPieceTestSource.includes(literal),
      ),
    );
    expect(named).toEqual([]);

    // And the scan can see a name, so the empty list above is a pass rather
    // than a decoration.
    expect(setPieceTestSource).toContain('MOB_TYPE_NAMES');
    expect(`const poured = '${MOB_TYPE_NAMES[0]}';`).toContain(
      MOB_TYPE_NAMES[0],
    );
  });

  it('has no hitbox at all while it is dormant', () => {
    // Gradius's ordinary Moai: the mouth is there to shoot only while the
    // statue is firing. A dormant source is background art the storm cannot
    // touch, which is what keeps a fast build from deleting the moment before
    // it starts.
    const source = atTheSource();
    expect(setPieceHitbox(source.state.setPiece!)).toBeNull();
    const hp = source.state.setPiece!.hp;
    expect(damageSetPiece(source.state, hp, BIRTHRIGHT[0])).toEqual([]);
    expect(source.state.setPiece!.hp).toBe(hp);

    tickUntilItOpens(source);
    expect(setPieceHitbox(source.state.setPiece!)).not.toBeNull();
    expect(
      damageSetPiece(source.state, 1, BIRTHRIGHT[0]).length,
    ).toBeGreaterThan(0);
    expect(source.state.setPiece!.hp).toBe(SET_PIECE_HP - 1);
  });
});
