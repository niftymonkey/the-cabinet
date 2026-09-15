/**
 * The director's signal and its spend (ADR 0047, ADR 0056).
 *
 * The four deliberate absences are written first and stand at the top of the
 * file: a kill never raises the signal, the director never reads a weapon
 * level, it never places a carrier and it never removes an authored body. A
 * deliberate absence written after the code it guards is a test shaped by the
 * implementation rather than by the ruling.
 */

import { describe, expect, it } from 'vitest';

import directorSource from '../director.ts?raw';

import {
  advancePressure,
  directorSpend,
  FLOOR_EVENT_WEIGHT,
  GRAVE_HIT_WEIGHT,
  QUIET_MAX_TICKS,
  QUIET_MIN_TICKS,
  SIGNAL_DECAY_PER_TICK,
  SIGNAL_DECAY_TICKS,
  SIGNAL_FULL,
  SIGNAL_HOLD_TICKS,
  SIGNAL_LOW_THRESHOLD,
  STARTING_DIRECTOR,
  startingSignal,
} from '../director';
import type { PressureSignal } from '../director';
import type { TickCommand } from '../command';
import type { SimEvent } from '../events';
import { WEAPON_LINES } from '../lines/roster';
import type { MobOrigin } from '../mobs';
import { spawnMob } from '../mobs';
import type { StreamName } from '../rng';
import type { RunState } from '../run';
import { createRun } from '../run';
import { isLocked, SIGNAL_RAN_LIVE } from '../signalLock';
import { stepping } from '../../dev/stepping';
import { place } from '../stage/formations';
import type { Section, SectionName } from '../stage/stage';
import { SECTIONS, spendDirected } from '../stage/stage';
import {
  CARDS,
  cardCost,
  CROWD_WAVES,
  PROCESSION_WAVES,
  SPARSE_LAST_WAVE,
  sparseLastWave,
  VIGIL_PURSE,
} from '../stage/waves';

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

const REST: PressureSignal = STARTING_DIRECTOR.signal;

// A figure inside the signal's own scale, so a held run stands somewhere the
// signal could really have stood rather than at an end of it.
const HALF_SCALE = SIGNAL_FULL / 2;

const GRAVE_HIT: SimEvent = {
  type: 'graveHit',
  source: 'shambler',
  size: 24,
  invulnerable: 24,
};
const SCORE_BLED: SimEvent = { type: 'scoreBled', amount: 100 };
const WEAPON_STRIPPED: SimEvent = { type: 'weaponStripped', lines: [] };

// Everything the signal is deliberately deaf to, one of each shape it could
// plausibly have been given (ADR 0056).
const QUIET_EVENTS: readonly SimEvent[] = [
  { type: 'mobKilled', id: 1, mob: 'shambler', x: 10, y: 10, carried: false },
  { type: 'mobDamaged', id: 1, source: 'skullStream', amount: 8 },
  { type: 'mobFired', emitter: 'revenant', kind: 'trash', x: 10, y: 10 },
  { type: 'sealed', tick: 10 },
];

const STREAM_NAMES: readonly StreamName[] = [
  'spawns',
  'powerUps',
  'mobFire',
  'shed',
  'territory',
  'director',
  'bossFire',
  'pour',
];

const UNDIRECTED_SECTIONS: readonly SectionName[] = [
  'banshee',
  'waking',
  'undertaker',
  'over',
];

const sectionNamed = (name: SectionName): Section => {
  const section = SECTIONS.find((candidate) => candidate.name === name);
  if (section === undefined) throw new Error(`no section named ${name}`);
  return section;
};

const PROCESSION = sectionNamed('procession');

const cursors = (state: RunState): Record<StreamName, number> => {
  const read = {} as Record<StreamName, number>;
  for (const name of STREAM_NAMES) read[name] = state.streams[name].drawn;
  return read;
};

// A run with its director's gate wide open: nothing quiet, a purse to spend and
// a signal at rest, which is the state the spend is meant to fire in.
const runWithAnOpenGate = (seed: number, purse: number): RunState => {
  const state = createRun(seed);
  state.director = {
    signal: { value: 0, heldUntilTick: 0, lock: SIGNAL_RAN_LIVE },
    purseLeft: purse,
    quietUntilTick: 0,
  };
  return state;
};

// Every live mob's id, so a test can say which bodies were on the field before.
const liveIds = (state: RunState): number[] =>
  state.mobs.filter((mob) => mob.alive).map((mob) => mob.id);

/**
 * A run standing in the Procession with a span open and its gate clear, which
 * is the state the spend is meant to fire in. The cursor is moved past the
 * section's first wave so a span exists to read a permission cell off.
 */
const aProcessionRun = (seed: number, purse: number): RunState => {
  const state = runWithAnOpenGate(seed, purse);
  state.stage.firedWaves = 1;
  return state;
};

/**
 * A run standing in the Crowd with a directed span open: the section carries
 * neither ceiling, so it is where the executor can be driven without the
 * Procession's emptiness gating every add.
 */
const aCrowdRun = (seed: number, purse: number): RunState => {
  const state = runWithAnOpenGate(seed, purse);
  state.stage.sectionIndex = SECTIONS.findIndex(
    (section) => section.name === 'crowd',
  );
  state.stage.firedWaves = CROWD_WAVES.findIndex((wave) => wave.directed) + 1;
  return state;
};

// Bodies stood on the field with a given provenance, so a ceiling can be read.
const standBodies = (state: RunState, count: number, from: MobOrigin): void => {
  const orders = place('drip', count, state.streams.spawns);
  for (const order of orders) spawnMob(state, 'shambler', order, false, from);
};

describe("the director's own state at the top of a run (ADR 0047, ADR 0056)", () => {
  it('starts with nothing granted, nothing held and no quiet owed', () => {
    // Field by field rather than against a whole-record literal, so a field
    // that arrives later cannot slip in undeclared: every field of this record
    // is folded (witness.ts's foldDirector), and a folded field the fold does
    // not know about is a witness that moved with no version behind it.
    //
    // The purse is still zero here and a run's is not: the module's value is
    // "no section has granted one yet", and createRun grants the opening
    // section's over it (stage.ts's openingPurse, run.test.ts's own pin).
    expect(STARTING_DIRECTOR.signal.value).toBe(0);
    expect(STARTING_DIRECTOR.signal.heldUntilTick).toBe(0);
    expect(STARTING_DIRECTOR.purseLeft).toBe(0);
    expect(STARTING_DIRECTOR.quietUntilTick).toBe(0);
  });

  it('declares exactly the three fields the signal carries', () => {
    // The lock is the signal's third field and it owed no second witness
    // version move: a lock is resolved before the first tick and never moves,
    // which is the run's identity in exactly the sense seed and roster[] are,
    // and all three are excluded from the fold with that reason beside them.
    expect(Object.keys(STARTING_DIRECTOR).sort()).toEqual([
      'purseLeft',
      'quietUntilTick',
      'signal',
    ]);
    expect(Object.keys(STARTING_DIRECTOR.signal).sort()).toEqual([
      'heldUntilTick',
      'lock',
      'value',
    ]);
    expect(STARTING_DIRECTOR.signal.lock).toBe(SIGNAL_RAN_LIVE);
  });
});

describe('the deliberate absences (ADR 0047, ADR 0056)', () => {
  /**
   * Vermintide 2 adds intensity for every enemy death near a player; Darktide,
   * the same studio's rewrite, deleted the kill term outright. Here a kill up
   * close is food, so a near-kill term would read a player doing exactly what
   * the design asks and answer it by holding back (ADR 0056).
   */
  it('never raises the signal on a kill beside the grave', () => {
    const state = createRun(1);
    const kill: SimEvent = {
      type: 'mobKilled',
      id: 1,
      mob: 'shambler',
      x: state.grave.x,
      y: state.grave.y,
      carried: false,
    };
    const raised = advancePressure(STARTING_DIRECTOR.signal, [kill], 0);
    expect(raised.value).toBe(0);
  });

  /**
   * ADR 0047's "reads pressure, never power", from the side the fence cannot
   * see: lineAgnosticPolicies.test.ts sweeps the module for a line's name, and
   * this says the module reads no level either.
   */
  it('names no weapon line and reads no level', () => {
    for (const line of WEAPON_LINES) {
      expect(directorSource).not.toContain(line);
    }
    expect(directorSource).not.toContain('levels');
  });

  /**
   * The twenty-five authored carriers are the ladder's whole supply (ADR 0048),
   * so a directed carrier would hand out rungs at a figure nobody wrote down
   * (CONTEXT.md Card).
   */
  it('never places a carrier', () => {
    const state = aCrowdRun(77, 4000);
    for (let tick = 0; tick < 2000; tick++) {
      state.tick = tick;
      state.director = { ...state.director, quietUntilTick: 0 };
      spendDirected(state);
    }
    const directed = state.mobs.filter(
      (mob) => mob.alive && mob.from === 'directed',
    );
    expect(directed.length).toBeGreaterThan(0);
    expect(directed.every((mob) => !mob.carries)).toBe(true);
  });

  /**
   * ADR 0047's "the waves stay the floor": lowering means the director
   * withholds what it would otherwise have added, never that it removes
   * authored content.
   */
  it('never removes an authored body', () => {
    const state = aCrowdRun(303, 4000);
    const orders = place('file', 6, state.streams.spawns);
    for (const order of orders)
      spawnMob(state, 'shambler', order, false, 'wave');
    const authored = liveIds(state);
    expect(authored.length).toBe(6);

    for (let tick = 0; tick < 600; tick++) {
      state.tick = tick;
      state.director = { ...state.director, quietUntilTick: 0 };
      spendDirected(state);
    }
    const after = liveIds(state);
    expect(authored.every((id) => after.includes(id))).toBe(true);
    expect(after.length).toBeGreaterThan(authored.length);
  });
});

describe('the pressure signal (ADR 0056)', () => {
  it('rises on harm and on a floor event and on nothing else', () => {
    const hit = advancePressure(REST, [GRAVE_HIT], 0);
    expect(hit.value).toBeCloseTo(GRAVE_HIT_WEIGHT);

    const bled = advancePressure(REST, [SCORE_BLED], 0);
    expect(bled.value).toBeCloseTo(FLOOR_EVENT_WEIGHT);

    const stripped = advancePressure(REST, [WEAPON_STRIPPED], 0);
    expect(stripped.value).toBeCloseTo(FLOOR_EVENT_WEIGHT);

    // One strip is worth three hits, which is the walk a starting grave takes
    // to reach the floor at HIT_SHRINK a hit.
    expect(FLOOR_EVENT_WEIGHT / GRAVE_HIT_WEIGHT).toBeCloseTo(3);

    for (const quiet of QUIET_EVENTS) {
      expect(advancePressure(REST, [quiet], 0).value).toBe(0);
    }
  });

  it('a locked signal never moves, whatever the tick events', () => {
    // Spec test 35. The lock's whole purpose: the gate and the population are
    // tuned against a held signal, so nothing a tick does may move it. The
    // three raising events and the whole hold-and-decay window are all walked,
    // because a guard that only covered the raise would let the decay drain a
    // held signal over thirty seconds instead.
    const held = startingSignal(HALF_SCALE);
    expect(isLocked(held.lock)).toBe(true);
    expect(held.value).toBe(HALF_SCALE);

    for (const event of [GRAVE_HIT, SCORE_BLED, WEAPON_STRIPPED]) {
      expect(advancePressure(held, [event], 0).value).toBe(HALF_SCALE);
    }

    let signal = held;
    for (let tick = 0; tick <= SIGNAL_HOLD_TICKS + SIGNAL_DECAY_TICKS; tick++) {
      signal = advancePressure(
        signal,
        tick % 97 === 0 ? [GRAVE_HIT] : [],
        tick,
      );
    }
    expect(signal.value).toBe(HALF_SCALE);
    expect(signal.heldUntilTick).toBe(held.heldUntilTick);

    // And the live half still moves, so the assertion above is a guard rather
    // than a signal that was never going to move anyway.
    expect(advancePressure(REST, [GRAVE_HIT], 0).value).toBe(GRAVE_HIT_WEIGHT);
  });

  it('holds for five seconds at what it reached, then falls at a fixed rate', () => {
    const raised = advancePressure(REST, [GRAVE_HIT], 100);
    expect(raised.heldUntilTick).toBe(100 + SIGNAL_HOLD_TICKS);

    // On the last tick of the hold nothing has fallen yet.
    const atTheBoundary = advancePressure(raised, [], raised.heldUntilTick);
    expect(atTheBoundary.value).toBe(raised.value);

    const justAfter = advancePressure(raised, [], raised.heldUntilTick + 1);
    expect(justAfter.value).toBeCloseTo(raised.value - SIGNAL_DECAY_PER_TICK);
  });

  it('falls from full to nothing over the decay interval and no further', () => {
    let signal = advancePressure(REST, [WEAPON_STRIPPED], 0);
    expect(signal.value).toBe(SIGNAL_FULL);
    for (let tick = 1; tick <= SIGNAL_HOLD_TICKS + SIGNAL_DECAY_TICKS; tick++) {
      signal = advancePressure(signal, [], tick);
    }
    expect(signal.value).toBeCloseTo(0);

    signal = advancePressure(
      signal,
      [],
      SIGNAL_HOLD_TICKS + SIGNAL_DECAY_TICKS + 1,
    );
    expect(signal.value).toBe(0);
  });

  it('a tick under sustained harm never starts decaying', () => {
    let signal = REST;
    for (let tick = 0; tick < SIGNAL_HOLD_TICKS * 3; tick++) {
      signal = advancePressure(
        signal,
        tick % 60 === 0 ? [GRAVE_HIT] : [],
        tick,
      );
    }
    expect(signal.value).toBe(SIGNAL_FULL);
  });
});

/**
 * The gate, one test per refusal. A gate that answers null for the wrong reason
 * is a gate nobody tested, so each of the six is reached with the other five
 * standing open.
 */
describe('the gate, refusal by refusal (ADR 0047, ADR 0056)', () => {
  it("refuses where the section's own permission cell is false", () => {
    for (const name of UNDIRECTED_SECTIONS) {
      const section = sectionNamed(name);
      expect(section.directed).toBe(false);
      const state = aProcessionRun(77, 400);
      expect(directorSpend(state, section, state.streams.director)).toBeNull();
    }
  });

  it('refuses where the section carries no purse at all', () => {
    // Null and zero are different sections: this one may not be touched, and
    // the Vigil's zero is one the director may look at and find empty.
    for (const name of UNDIRECTED_SECTIONS) {
      expect(sectionNamed(name).purse).toBeNull();
    }
    const state = aProcessionRun(77, 400);
    const noPurse: Section = { ...PROCESSION, purse: null };
    expect(directorSpend(state, noPurse, state.streams.director)).toBeNull();
  });

  it('refuses where what is left will not cover the cheapest card', () => {
    const cheapest = Math.min(...CARDS.map(cardCost));
    const state = aProcessionRun(77, cheapest - 1);
    expect(directorSpend(state, PROCESSION, state.streams.director)).toBeNull();
  });

  it('refuses while the signal reads high', () => {
    const state = aProcessionRun(77, 400);
    state.director = {
      ...state.director,
      signal: {
        value: SIGNAL_FULL,
        heldUntilTick: 9999,
        lock: SIGNAL_RAN_LIVE,
      },
    };
    expect(directorSpend(state, PROCESSION, state.streams.director)).toBeNull();
  });

  it('refuses while the quiet interval is still running', () => {
    const state = aProcessionRun(77, 400);
    state.tick = 100;
    state.director = { ...state.director, quietUntilTick: 101 };
    expect(directorSpend(state, PROCESSION, state.streams.director)).toBeNull();
    // And the tick the interval ends on is a tick it may spend again.
    state.tick = 101;
    expect(
      directorSpend(state, PROCESSION, state.streams.director),
    ).not.toBeNull();
  });

  it("refuses where the section's own ceiling is already met", () => {
    const state = aProcessionRun(77, 400);
    standBodies(state, 1, 'wave');
    expect(PROCESSION.liveFormationCeiling).toBe(1);
    expect(directorSpend(state, PROCESSION, state.streams.director)).toBeNull();
  });

  it('refuses under a span whose own permission cell is false', () => {
    const state = aProcessionRun(77, 400);
    const undirected: Section = {
      ...PROCESSION,
      waves: [{ ...PROCESSION_WAVES[0]!, directed: false }],
    };
    expect(directorSpend(state, undirected, state.streams.director)).toBeNull();
  });

  it('refuses before a section has fired a wave, because no span is open yet', () => {
    const state = aProcessionRun(77, 400);
    state.stage.firedWaves = 0;
    expect(directorSpend(state, PROCESSION, state.streams.director)).toBeNull();
  });
});

describe('the spend (ADR 0047, ADR 0056)', () => {
  it('returns a card and never a loose body', () => {
    const state = aProcessionRun(77, 400);
    const spend = directorSpend(state, PROCESSION, state.streams.director);
    expect(spend).not.toBeNull();
    expect(CARDS).toContainEqual(spend?.card);
    expect(spend?.orders.length).toBe(spend?.card.count);
  });

  it('adds nothing while the signal reads high', () => {
    const state = aProcessionRun(77, 400);
    state.director = {
      ...state.director,
      signal: {
        value: SIGNAL_LOW_THRESHOLD,
        heldUntilTick: 9999,
        lock: SIGNAL_RAN_LIVE,
      },
    };
    expect(directorSpend(state, PROCESSION, state.streams.director)).toBeNull();

    // A hair below the threshold still reads low, so the gate is the threshold
    // and not a rounding of it.
    state.director = {
      ...state.director,
      signal: {
        value: SIGNAL_LOW_THRESHOLD - 1e-9,
        heldUntilTick: 9999,
        lock: SIGNAL_RAN_LIVE,
      },
    };
    expect(
      directorSpend(state, PROCESSION, state.streams.director),
    ).not.toBeNull();
  });

  it('goes quiet for a drawn interval of four to eight seconds after every add', () => {
    const state = aProcessionRun(77, 4000);
    const drawn: number[] = [];
    for (let attempt = 0; attempt < 200; attempt++) {
      const spend = directorSpend(state, PROCESSION, state.streams.director);
      if (spend === null) continue;
      drawn.push(spend.quietUntilTick - state.tick);
      state.director = { ...state.director, purseLeft: spend.purseLeft };
    }
    expect(drawn.length).toBeGreaterThan(50);
    expect(Math.min(...drawn)).toBeGreaterThanOrEqual(QUIET_MIN_TICKS);
    expect(Math.max(...drawn)).toBeLessThanOrEqual(QUIET_MAX_TICKS);
    // The band is drawn across rather than pinned at one end.
    expect(new Set(drawn).size).toBeGreaterThan(20);
  });

  it('draws nothing at all on a tick it refuses', () => {
    const state = aProcessionRun(77, 400);
    state.director = { ...state.director, quietUntilTick: 9999 };
    const before = state.streams.director.drawn;
    expect(directorSpend(state, PROCESSION, state.streams.director)).toBeNull();
    expect(state.streams.director.drawn).toBe(before);
  });

  it("the draws never move any other stream's cursor", () => {
    const state = aProcessionRun(77, 400);
    const before = cursors(state);
    const spend = directorSpend(state, PROCESSION, state.streams.director);
    expect(spend).not.toBeNull();
    const after = cursors(state);
    expect(after.director).toBeGreaterThan(before.director);
    for (const name of STREAM_NAMES) {
      if (name === 'director') continue;
      expect(after[name]).toBe(before[name]);
    }
  });

  it('runs at the authored floor once the purse is spent', () => {
    const cheapest = Math.min(...CARDS.map(cardCost));
    const state = aProcessionRun(77, cheapest);
    expect(
      directorSpend(state, PROCESSION, state.streams.director),
    ).not.toBeNull();

    // A purse with less left in it than the cheapest card is a section running
    // at its authored floor for the rest of its length (ADR 0056).
    state.director = { ...state.director, purseLeft: cheapest - 1 };
    expect(directorSpend(state, PROCESSION, state.streams.director)).toBeNull();
    state.director = { ...state.director, purseLeft: 0 };
    expect(directorSpend(state, PROCESSION, state.streams.director)).toBeNull();
  });

  it('spends nothing in the Vigil, which has a purse and finds it empty', () => {
    const vigil = sectionNamed('vigil');
    expect(vigil.purse).toBe(VIGIL_PURSE);
    expect(vigil.purse).not.toBeNull();
    expect(vigil.directed).toBe(true);

    const state = aProcessionRun(77, 0);
    expect(directorSpend(state, vigil, state.streams.director)).toBeNull();
  });

  it('adds nothing during a boss section, the sparse last wave, the Wall or the set piece', () => {
    // Every one of the four is a cell in the section's or the wave's own data,
    // read here rather than named in the gate (ADR 0047).
    expect(sectionNamed('banshee').directed).toBe(false);
    expect(sectionNamed('undertaker').directed).toBe(false);
    expect(sectionNamed('waking').directed).toBe(false);

    const sparse = sparseLastWave(0, SPARSE_LAST_WAVE);
    expect(sparse.every((wave) => !wave.directed)).toBe(true);

    const wall = CROWD_WAVES.filter((wave) => wave.formation === 'wall');
    expect(wall.length).toBeGreaterThan(0);
    expect(wall.every((wave) => !wave.directed)).toBe(true);

    // And the gate refuses under an undirected span rather than under a name.
    const state = aProcessionRun(77, 400);
    const undirected: Section = {
      ...PROCESSION,
      waves: [{ ...PROCESSION_WAVES[0]!, directed: false }],
    };
    state.stage.firedWaves = 1;
    expect(directorSpend(state, undirected, state.streams.director)).toBeNull();
  });

  it("a standing wave's arrivals never count against a section's ceiling", () => {
    const state = aProcessionRun(77, 400);
    standBodies(state, 12, 'standingWave');
    expect(
      directorSpend(state, PROCESSION, state.streams.director),
    ).not.toBeNull();

    const shaped = aProcessionRun(77, 400);
    standBodies(shaped, 1, 'wave');
    expect(
      directorSpend(shaped, PROCESSION, shaped.streams.director),
    ).toBeNull();
  });

  it("never adds past a section's own ceiling", () => {
    const vigil = sectionNamed('vigil');
    const ceiling = vigil.liveBodyCeiling ?? 0;
    expect(ceiling).toBeGreaterThan(0);

    // The Vigil's own purse is zero, so the ceiling is read here on a section
    // that carries one and a purse that could reach it.
    const spendable: Section = {
      ...vigil,
      purse: 400,
      waves: PROCESSION_WAVES,
    };
    const under = aProcessionRun(77, 400);
    standBodies(under, ceiling - 1, 'wave');
    expect(
      directorSpend(under, spendable, under.streams.director),
    ).not.toBeNull();

    const at = aProcessionRun(77, 400);
    standBodies(at, ceiling, 'wave');
    expect(directorSpend(at, spendable, at.streams.director)).toBeNull();
  });

  it('two runs on one seed rebuild identically, every directed add included', () => {
    const played = (seed: number): string => {
      const run = createRun(seed);
      const step = stepping(run);
      const adds: string[] = [];
      for (let tick = 0; tick < 4000; tick++) {
        for (const event of step(STILL)) {
          if (event.type !== 'directedAdd') continue;
          adds.push(
            `${tick}:${event.card.formation}:${event.card.type}:${event.card.count}:${event.x.toFixed(4)}:${event.purseLeft}`,
          );
        }
      }
      return `${adds.join('|')}#${run.streams.director.drawn}`;
    };
    const first = played(505);
    // The run has to actually contain adds, or two identical strings prove
    // nothing about the director at all.
    expect(first.split('|').length).toBeGreaterThan(1);
    expect(played(505)).toBe(first);
  });
});
