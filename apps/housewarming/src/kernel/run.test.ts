import { describe, expect, it } from 'vitest';

import { at } from './rng.ts';
import { THE_HOUSE, type Ruleset } from './rules.ts';
import {
  arrived,
  leaveOffered,
  loose,
  namesStillOpen,
  nightCost,
  playNight,
  poolsOf,
  startRun,
  submitName,
  takeLeave,
  type Run,
} from './run.ts';
import type { Experiment, Spirit } from './types.ts';

// A house small enough to drive by hand. The shipped one lives in `rules.ts`.
const HOUSE: Ruleset = {
  generation: {
    traces: [
      { id: 'trace-knocking', name: 'Knocking' },
      { id: 'trace-scratching', name: 'Scratching' },
    ],
    stages: [
      {
        opensAfterNamed: 0,
        adds: {
          hour: [
            { id: 'hour-nightfall', name: 'Nightfall', watch: 1 },
            { id: 'hour-midnight', name: 'Midnight', watch: 2 },
          ],
          lure: [
            { id: 'lure-milk', name: 'A bowl of milk' },
            { id: 'lure-bread', name: 'A piece of bread' },
          ],
          aversion: [
            { id: 'aversion-iron', name: 'Cold iron' },
            { id: 'aversion-rowan', name: 'Rowan' },
          ],
          haunt: [
            { id: 'haunt-hearth', name: 'The hearth' },
            { id: 'haunt-cellar', name: 'The cellar' },
          ],
        },
        arrivals: 1,
      },
      {
        opensAfterNamed: 1,
        adds: { haunt: [{ id: 'haunt-attic', name: 'The attic' }] },
        arrivals: 1,
      },
    ],
  },
  economy: {
    startingWarmth: 20,
    candlePerWatch: 1,
    lure: 1,
    ward: 2,
    yieldPerNamedSpirit: 3,
    wrongName: 3,
    drain: [{ fromNight: 1, perLooseSpirit: 4 }],
    drainReliefPerSettledTrait: 1,
    leaveOfferedAt: 5,
    leaveWithdrawnAt: 2,
  },
};

const ward: Experiment = {
  room: 'haunt-hearth',
  candle: 2,
  lure: 'lure-milk',
  ward: 'aversion-iron',
};

function nameOf(spirit: Spirit) {
  return { trace: spirit.trace, name: spirit.name };
}

function wrongNameFor(spirit: Spirit) {
  return {
    trace: spirit.trace,
    name: { ...spirit.name, hour: 'hour-nowhere' },
  };
}

describe('a new run', () => {
  const run = startRun(HOUSE, 7);

  it('starts on the first night with the house still warm', () => {
    expect(run.night).toBe(1);
    expect(run.stage).toBe(0);
    expect(run.warmth).toBe(20);
    expect(run.status).toBe('keeping');
  });

  it('knows its whole roster while only the first of them has arrived', () => {
    expect(run.spirits).toHaveLength(2);
    expect(arrived(run)).toHaveLength(1);
    expect(loose(run)).toHaveLength(1);
  });
});

describe('a night', () => {
  it('is priced as its candle, its lure and its ward', () => {
    expect(nightCost(HOUSE.economy, [ward])).toBe(5);
  });

  it('takes its cost and the loose spirit takes its drain', () => {
    const { run } = playNight(HOUSE, startRun(HOUSE, 7), [ward]);
    expect(run.warmth).toBe(20 - 5 - 4);
    expect(run.night).toBe(2);
  });

  it('gives back a morning the keeper can read', () => {
    const { morning } = playNight(HOUSE, startRun(HOUSE, 7), [ward]);
    expect(morning.night).toBe(1);
    expect(morning.scenes).toHaveLength(1);
  });

  it('cannot be placed with warmth the house does not have', () => {
    const cold: Run = { ...startRun(HOUSE, 7), warmth: 3 };
    expect(() => playNight(HOUSE, cold, [ward])).toThrow(/costs 5 warmth/);
  });

  it('is kept in the run, so the keeper can be handed back what they saw', () => {
    const { run, morning } = playNight(HOUSE, startRun(HOUSE, 7), [ward]);
    expect(run.seen).toEqual([
      { night: 1, experiment: ward, scene: morning.scenes[0] },
    ]);
  });

  it('narrows the names still open on the spirit it watched', () => {
    const start = startRun(HOUSE, 7);
    const spirit = at(loose(start), 0);
    const before = namesStillOpen(HOUSE, start, spirit.trace);
    const { run } = playNight(HOUSE, start, [ward]);
    const after = namesStillOpen(HOUSE, run, spirit.trace);

    expect(before).toHaveLength(2 * 2 * 2 * 2);
    expect(after.length).toBeLessThan(before.length);
    expect(after).toContainEqual(spirit.name);
  });
});

describe('naming', () => {
  const run = startRun(HOUSE, 7);
  const first = at(loose(run), 0);

  it('costs warmth when the name does not hold', () => {
    const result = submitName(HOUSE, run, wrongNameFor(first));
    expect(result.held).toBe(false);
    expect(result.run.warmth).toBe(17);
    expect(result.run.named).toHaveLength(0);
  });

  it('takes the spirit out of the drain when it does hold', () => {
    const result = submitName(HOUSE, run, nameOf(first));
    expect(result.held).toBe(true);
    expect(result.run.named).toEqual([first.trace]);
    expect(loose(result.run).map((spirit) => spirit.trace)).not.toContain(
      first.trace,
    );
  });

  it('opens the house, and the next spirit arrives with it', () => {
    const { run: opened } = submitName(HOUSE, run, nameOf(first));
    expect(opened.stage).toBe(1);
    expect(arrived(opened)).toHaveLength(2);
    expect(loose(opened)).toHaveLength(1);
  });

  it('turns a named spirit into warmth on the nights after', () => {
    const { run: opened } = submitName(HOUSE, run, nameOf(first));
    const { run: after } = playNight(HOUSE, opened, [ward]);
    expect(after.warmth).toBe(20 - 5 - 4 + 3);
  });

  it('refuses a trace no loose spirit leaves', () => {
    const { run: opened } = submitName(HOUSE, run, nameOf(first));
    expect(() => submitName(HOUSE, opened, nameOf(first))).toThrow(
      /no loose spirit/,
    );
  });
});

describe('the end of a run', () => {
  const run = startRun(HOUSE, 7);

  it('is won when the last name in the roster falls', () => {
    const first = at(loose(run), 0);
    const { run: opened } = submitName(HOUSE, run, nameOf(first));
    const second = at(loose(opened), 0);
    const { run: done } = submitName(HOUSE, opened, nameOf(second));
    expect(done.status).toBe('won');
    expect(() => playNight(HOUSE, done, [ward])).toThrow(/this run is over/);
  });

  it('is lost when the warmth runs out in the night', () => {
    const cold: Run = { ...run, warmth: 9 };
    const { run: after } = playNight(HOUSE, cold, [ward]);
    expect(after.warmth).toBe(0);
    expect(after.status).toBe('lost');
  });

  it('is lost when a wrong name takes the last of the warmth', () => {
    const cold: Run = { ...run, warmth: 3 };
    const first = at(loose(cold), 0);
    const { run: after } = submitName(HOUSE, cold, wrongNameFor(first));
    expect(after.status).toBe('lost');
  });
});

describe('a puzzle in progress when the house opens', () => {
  // A page the keeper has solved stays solved. The rooms an opening adds were sealed for
  // every night this spirit has been here, so they were never candidates for it, and the
  // book does not hand back certainty the keeper had already earned.
  it('does not widen for a spirit that was here before the opening', () => {
    const start = startRun(THE_HOUSE, 2026);
    const first = at(loose(start), 0);
    const second = at(loose(start), 1);
    const third = at(loose(start), 2);

    const { run: one } = submitName(THE_HOUSE, start, nameOf(first));
    const beforeOpening = namesStillOpen(THE_HOUSE, one, third.trace);

    const { run: opened } = submitName(THE_HOUSE, one, nameOf(second));
    expect(opened.stage).toBe(1);
    expect(poolsOf(THE_HOUSE, opened).haunt.length).toBeGreaterThan(
      poolsOf(THE_HOUSE, one).haunt.length,
    );

    expect(namesStillOpen(THE_HOUSE, opened, third.trace)).toEqual(
      beforeOpening,
    );
  });

  it('gives a spirit that arrives with the opening the rooms it opened', () => {
    let run = startRun(THE_HOUSE, 2026);
    for (const spirit of [at(loose(run), 0), at(loose(run), 1)]) {
      run = submitName(THE_HOUSE, run, nameOf(spirit)).run;
    }
    const newcomer = arrived(run).find((spirit) => spirit.stage === 1);
    expect(newcomer).toBeDefined();
    if (!newcomer) return;

    const haunts = new Set(
      namesStillOpen(THE_HOUSE, run, newcomer.trace).map((name) => name.haunt),
    );
    expect(haunts.size).toBe(poolsOf(THE_HOUSE, run).haunt.length);
  });
});

describe('the exit', () => {
  const run = startRun(HOUSE, 7);

  it('is not on the table while the house is warm', () => {
    expect(leaveOffered(HOUSE, run)).toBe(false);
    expect(() => takeLeave(HOUSE, run)).toThrow(/not on the table/);
  });

  it('appears once the house has cooled', () => {
    const cool: Run = { ...run, warmth: 5 };
    expect(leaveOffered(HOUSE, cool)).toBe(true);
    expect(takeLeave(HOUSE, cool).status).toBe('left');
  });

  it('is gone once it is too cold to pack and go', () => {
    const freezing: Run = { ...run, warmth: 2 };
    expect(leaveOffered(HOUSE, freezing)).toBe(false);
  });
});
