import { describe, expect, it } from 'vitest';

import { assertRosterFits, rollSpirits } from './generator.ts';
import { mulberry32 } from './rng.ts';
import {
  GENERATION,
  poolsAtStage,
  rosterSize,
  type GenerationRules,
} from './rules.ts';
import type { Spirit } from './types.ts';

const SEEDS = [1, 2, 3, 7, 42, 99, 1234, 65536];

function houses(): Spirit[][] {
  return SEEDS.map((seed) => rollSpirits(GENERATION, mulberry32(seed)));
}

describe('the house this game ships with', () => {
  it('can seat its whole roster', () => {
    expect(() => assertRosterFits(GENERATION)).not.toThrow();
  });

  it('rolls the roster the rules ask for', () => {
    for (const spirits of houses()) {
      expect(spirits).toHaveLength(rosterSize(GENERATION));
    }
  });
});

describe('rolling a house', () => {
  it('gives the same house back for the same seed', () => {
    const once = rollSpirits(GENERATION, mulberry32(2026));
    const again = rollSpirits(GENERATION, mulberry32(2026));
    expect(again).toEqual(once);
  });

  it('gives different houses for different seeds', () => {
    const rolled = houses().map((spirits) => JSON.stringify(spirits));
    expect(new Set(rolled).size).toBe(SEEDS.length);
  });
});

describe('the invariants the night contract rests on', () => {
  it('never gives two spirits the same haunt, whatever order names fall in', () => {
    for (const spirits of houses()) {
      const haunts = spirits.map((spirit) => spirit.name.haunt);
      expect(new Set(haunts).size).toBe(spirits.length);
    }
  });

  it('never gives two spirits the same trace, so a trace is an identity', () => {
    for (const spirits of houses()) {
      const traces = spirits.map((spirit) => spirit.trace);
      expect(new Set(traces).size).toBe(spirits.length);
    }
  });
});

describe('a spirit and the stage it arrives with', () => {
  it('only ever holds traits the house had open when it arrived', () => {
    for (const spirits of houses()) {
      for (const spirit of spirits) {
        const pools = poolsAtStage(GENERATION, spirit.stage);
        expect(pools.hour.map((hour) => hour.id)).toContain(spirit.name.hour);
        expect(pools.lure.map((lure) => lure.id)).toContain(spirit.name.lure);
        expect(pools.aversion.map((ward) => ward.id)).toContain(
          spirit.name.aversion,
        );
        expect(pools.haunt.map((room) => room.id)).toContain(spirit.name.haunt);
      }
    }
  });

  it('arrives in the numbers each stage says', () => {
    for (const spirits of houses()) {
      GENERATION.stages.forEach((stage, index) => {
        const arrivals = spirits.filter((spirit) => spirit.stage === index);
        expect(arrivals).toHaveLength(stage.arrivals);
      });
    }
  });
});

describe('rules that cannot make a legal house', () => {
  const rooms = [
    { id: 'haunt-hearth', name: 'The hearth' },
    { id: 'haunt-cellar', name: 'The cellar' },
  ];
  const oneOfEach = {
    hour: [{ id: 'hour-midnight', name: 'Midnight', watch: 2 as const }],
    lure: [{ id: 'lure-milk', name: 'A bowl of milk' }],
    aversion: [{ id: 'aversion-iron', name: 'Cold iron' }],
    haunt: rooms,
  };

  it('are refused when the roster outnumbers the rooms', () => {
    const tooMany: GenerationRules = {
      traces: [
        { id: 'trace-knocking', name: 'Knocking' },
        { id: 'trace-scratching', name: 'Scratching' },
        { id: 'trace-moved-objects', name: 'Objects moved' },
      ],
      stages: [{ opensAfterNamed: 0, adds: oneOfEach, arrivals: 3 }],
    };
    expect(() => assertRosterFits(tooMany)).toThrow(/rooms/);
    expect(() => rollSpirits(tooMany, mulberry32(1))).toThrow(/rooms/);
  });

  it('are refused when there are not enough traces to tell the spirits apart', () => {
    const tooFew: GenerationRules = {
      traces: [{ id: 'trace-knocking', name: 'Knocking' }],
      stages: [{ opensAfterNamed: 0, adds: oneOfEach, arrivals: 2 }],
    };
    expect(() => assertRosterFits(tooFew)).toThrow(/traces/);
  });
});
