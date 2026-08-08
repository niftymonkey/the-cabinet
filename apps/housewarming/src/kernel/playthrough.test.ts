import { describe, expect, it } from 'vitest';

import { at } from './rng.ts';
import { experimentCost, THE_HOUSE } from './index.ts';
import {
  drainFor,
  loose,
  namedSpirits,
  namesStillOpen,
  playNight,
  poolsOf,
  startRun,
  submitName,
  type Run,
} from './run.ts';
import type { Experiment, Watch } from './types.ts';

const WATCHES: readonly Watch[] = [1, 2, 3, 4];

// A keeper with no strategy at all: watch every room that is not already solved, walk
// each room's instruments through their pools over successive visits, and submit a name
// the moment the evidence leaves only one. It is the worst competent play there is, so a
// house it can finish is a house that is finishable.
function playItOut(seed: number): Run {
  let run = startRun(THE_HOUSE, seed);
  const visits = new Map<string, number>();

  while (run.status === 'keeping' && run.night <= 80) {
    run = nameWhatIsCertain(run);
    if (run.status !== 'keeping') break;

    const pools = poolsOf(THE_HOUSE, run);
    const solved = new Set(
      namedSpirits(run).map((spirit) => spirit.name.haunt),
    );
    const experiments: Experiment[] = [];
    let spend = 0;

    for (const room of pools.haunt) {
      if (solved.has(room.id)) continue;
      const visit = visits.get(room.id) ?? 0;
      const experiment: Experiment = {
        room: room.id,
        candle: at(WATCHES, visit % 4),
        lure: at(pools.lure, visit % pools.lure.length).id,
        ward: at(pools.aversion, Math.floor(visit / 4) % pools.aversion.length)
          .id,
      };
      const cost = experimentCost(THE_HOUSE.economy, experiment);
      if (spend + cost > run.warmth - 1) continue;
      spend += cost;
      visits.set(room.id, visit + 1);
      experiments.push(experiment);
    }

    if (experiments.length === 0) break;
    run = playNight(THE_HOUSE, run, experiments).run;
  }

  return run;
}

function nameWhatIsCertain(run: Run): Run {
  let named = true;
  while (named && run.status === 'keeping') {
    named = false;
    for (const spirit of loose(run)) {
      const open = namesStillOpen(THE_HOUSE, run, spirit.trace);
      if (open.length !== 1) continue;
      const result = submitName(THE_HOUSE, run, {
        trace: spirit.trace,
        name: at(open, 0),
      });
      // The evidence left one name, so it had better be the right one.
      expect(result.held).toBe(true);
      run = result.run;
      named = true;
      break;
    }
  }
  return run;
}

describe('a whole playthrough of the house this game ships with', () => {
  it.each([1, 2, 3])(
    'can be finished from seed %i without ever guessing',
    (seed) => {
      const run = playItOut(seed);
      expect(run.status).toBe('won');
      expect(run.named).toHaveLength(run.spirits.length);
    },
  );

  it('charges a spirit less every time the keeper rules one of its traits in', () => {
    // The anti-spiral rule: a keeper who is behind but learning always pays less tonight
    // than they did last night, so falling behind is never unrecoverable.
    let run = startRun(THE_HOUSE, 1);
    const watched = at(loose(run), 0);
    const charged: number[] = [];

    for (let night = 0; night < 8 && run.status === 'keeping'; night += 1) {
      charged.push(drainFor(THE_HOUSE, run, watched));
      const pools = poolsOf(THE_HOUSE, run);
      run = playNight(
        THE_HOUSE,
        run,
        pools.haunt.map((room, index) => ({
          room: room.id,
          candle: at(WATCHES, (night + index) % 4),
          lure: at(pools.lure, (night + index) % pools.lure.length).id,
          ward: at(pools.aversion, night % pools.aversion.length).id,
        })),
      ).run;
    }

    expect(at(charged, 0)).toBe(4);
    expect(at(charged, charged.length - 1)).toBeLessThan(at(charged, 0));
    charged.forEach((tonight, index) => {
      if (index > 0)
        expect(tonight).toBeLessThanOrEqual(at(charged, index - 1));
    });
  });

  it('leaves no spirit that the evidence has argued out of existence', () => {
    // A late arrival used to be ruled out of its own room by the nights that room stood
    // empty before it moved in, which left it with no name that fitted at all.
    for (const seed of [1, 2, 3, 4, 5]) {
      const run = playItOut(seed);
      for (const spirit of run.spirits) {
        expect(
          namesStillOpen(THE_HOUSE, run, spirit.trace).length,
        ).toBeGreaterThan(0);
      }
    }
  });
});
