import { describe, expect, it } from 'vitest';

import {
  allNames,
  consistentNames,
  settledAxes,
  traitsStillPossible,
} from './deduction.ts';
import type { Observation } from './deduction.ts';
import { rollSpirits } from './generator.ts';
import { at, mulberry32 } from './rng.ts';
import { resolveNight } from './resolver.ts';
import { GENERATION, poolsAtStage } from './rules.ts';
import type { Experiment, Pools, Spirit, TraitId, Watch } from './types.ts';

const SEEDS = [1, 5, 17, 42, 404, 2026];

function watchFor(count: number): Watch {
  switch (count % 4) {
    case 0:
      return 1;
    case 1:
      return 2;
    case 2:
      return 3;
    default:
      return 4;
  }
}

// A mechanical keeper: watch every open room every night, and walk each room's candle,
// lure and ward through their pools across successive visits. Deliberately strategyless,
// so what it manages is a floor on what the morning carries rather than a ceiling.
//
// The counting is per room on purpose. Keying the instruments off the night number
// instead lets them alias with the rota of which rooms get watched, so a room can end up
// getting the identical experiment every single time and the deduction stalls forever.
function nightFor(pools: Pools, visit: number): Experiment[] {
  return pools.haunt.map((room) => ({
    room: room.id,
    candle: watchFor(visit),
    lure: at(pools.lure, visit % pools.lure.length).id,
    ward: at(pools.aversion, Math.floor(visit / 4) % pools.aversion.length).id,
  }));
}

function watchTheHouse(
  pools: Pools,
  loose: readonly Spirit[],
  nights: number,
): Observation[] {
  const observations: Observation[] = [];
  for (let night = 1; night <= nights; night += 1) {
    const experiments = nightFor(pools, night - 1);
    const morning = resolveNight(pools, loose, experiments, night);
    experiments.forEach((experiment, index) => {
      const scene = morning.scenes[index];
      if (scene) observations.push({ night, experiment, scene });
    });
  }
  return observations;
}

function stageZero(seed: number): { pools: Pools; loose: Spirit[] } {
  const pools = poolsAtStage(GENERATION, 0);
  const loose = rollSpirits(GENERATION, mulberry32(seed)).filter(
    (spirit) => spirit.stage === 0,
  );
  return { pools, loose };
}

describe('the candidates a set of mornings still allows', () => {
  it('never rules out the name that is actually true', () => {
    for (const seed of SEEDS) {
      const { pools, loose } = stageZero(seed);
      for (let nights = 1; nights <= 8; nights += 1) {
        const seen = watchTheHouse(pools, loose, nights);
        for (const spirit of loose) {
          const still = consistentNames(pools, spirit.trace, seen);
          expect(still).toContainEqual(spirit.name);
        }
      }
    }
  });

  it('closes on one name for every loose spirit inside a dozen nights', () => {
    for (const seed of SEEDS) {
      const { pools, loose } = stageZero(seed);
      const seen = watchTheHouse(pools, loose, 12);
      for (const spirit of loose) {
        expect(consistentNames(pools, spirit.trace, seen)).toEqual([
          spirit.name,
        ]);
      }
    }
  });

  it('keeps two loose spirits two separate puzzles behind their traces', () => {
    const { pools, loose } = stageZero(42);
    const seen = watchTheHouse(pools, loose, 4);
    const haunts = loose.map(
      (spirit) =>
        new Set(
          consistentNames(pools, spirit.trace, seen).map((name) => name.haunt),
        ),
    );
    expect(haunts).toEqual(loose.map((spirit) => new Set([spirit.name.haunt])));
  });
});

describe('what a single room tells the keeper', () => {
  const { pools, loose } = stageZero(42);
  const spirit = at(loose, 0);

  it('rules out a haunt when a watched room is silent', () => {
    const seen = watchTheHouse(pools, loose, 1);
    const still = consistentNames(pools, spirit.trace, seen);
    const haunts: TraitId[] = still.map((name) => name.haunt);
    expect(new Set(haunts)).toEqual(new Set([spirit.name.haunt]));
  });

  it('rules out a haunt when somebody else left the trace there', () => {
    const seen = watchTheHouse(pools, loose, 1);
    // A room where another spirit turned up, so this tests the foreign trace rather
    // than falling back on the silent-room rule.
    const anothers = seen.find(
      (observation) =>
        observation.scene.scene !== 'silent' &&
        observation.scene.trace !== spirit.trace,
    );
    expect(anothers).toBeDefined();
    const still = consistentNames(pools, spirit.trace, seen);
    expect(still.every((name) => name.haunt !== anothers?.scene.room)).toBe(
      true,
    );
  });
});

describe('a spirit that moved in partway through', () => {
  // The nights before a spirit arrived are not evidence about it. Counting them ruled
  // out the very room it lives in, and left a late arrival with no name that fitted at
  // all: a puzzle the keeper could not solve however well they played.
  const pools = poolsAtStage(GENERATION, 0);
  const room = at(pools.haunt, 2);
  const experiment: Experiment = {
    room: room.id,
    candle: 4,
    lure: at(pools.lure, 0).id,
    ward: null,
  };
  const seen: Observation[] = [
    { night: 1, experiment, scene: { scene: 'silent', room: room.id } },
    {
      night: 6,
      experiment,
      scene: {
        scene: 'came-in',
        room: room.id,
        trace: 'trace-knocking',
        mark: 2,
        bowlTaken: true,
        wardCrossed: null,
      },
    },
  ];

  it('is not ruled out of the room that was empty before it got there', () => {
    const still = consistentNames(pools, 'trace-knocking', seen);
    expect(still.length).toBeGreaterThan(0);
    expect(still.every((name) => name.haunt === room.id)).toBe(true);
  });

  it('has no evidence against it at all until its trace turns up', () => {
    const before = seen.slice(0, 1);
    expect(consistentNames(pools, 'trace-knocking', before)).toEqual(
      allNames(pools),
    );
  });
});

describe('how many traits the evidence has ruled in', () => {
  it('is none of them before a single night has been watched', () => {
    const { pools, loose } = stageZero(17);
    const spirit = at(loose, 0);
    expect(settledAxes(consistentNames(pools, spirit.trace, []))).toBe(0);
  });

  it('climbs as the mornings come in, and reaches all four with the name', () => {
    const { pools, loose } = stageZero(17);
    const spirit = at(loose, 0);
    const early = settledAxes(
      consistentNames(pools, spirit.trace, watchTheHouse(pools, loose, 1)),
    );
    const late = settledAxes(
      consistentNames(pools, spirit.trace, watchTheHouse(pools, loose, 12)),
    );
    expect(early).toBeGreaterThan(0);
    expect(early).toBeLessThan(4);
    expect(late).toBe(4);
  });
});

describe('what the book draws', () => {
  it('is the values each axis still allows', () => {
    const { pools, loose } = stageZero(17);
    const spirit = at(loose, 0);
    const seen = watchTheHouse(pools, loose, 12);
    expect(
      traitsStillPossible(consistentNames(pools, spirit.trace, seen)),
    ).toEqual({
      hour: [spirit.name.hour],
      lure: [spirit.name.lure],
      aversion: [spirit.name.aversion],
      haunt: [spirit.name.haunt],
    });
  });
});
