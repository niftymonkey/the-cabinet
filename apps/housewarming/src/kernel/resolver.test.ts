import { describe, expect, it } from 'vitest';

import { resolveNight, watchOf } from './resolver.ts';
import type { Experiment, Pools, Spirit } from './types.ts';

const pools: Pools = {
  hour: [
    { id: 'hour-nightfall', name: 'Nightfall', watch: 1 },
    { id: 'hour-midnight', name: 'Midnight', watch: 2 },
    { id: 'hour-small-hours', name: 'The small hours', watch: 3 },
    { id: 'hour-first-light', name: 'First light', watch: 4 },
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
};

const knocker: Spirit = {
  trace: 'trace-knocking',
  stage: 0,
  name: {
    hour: 'hour-small-hours',
    lure: 'lure-milk',
    aversion: 'aversion-iron',
    haunt: 'haunt-hearth',
  },
};

function experiment(over: Partial<Experiment> = {}): Experiment {
  return {
    room: 'haunt-hearth',
    candle: 4,
    lure: 'lure-milk',
    ward: null,
    ...over,
  };
}

describe('the watch an hour falls in', () => {
  it('comes from the hour itself rather than its place in the pool', () => {
    expect(watchOf(pools, 'hour-small-hours')).toBe(3);
  });

  it('refuses an hour this house does not have', () => {
    expect(() => watchOf(pools, 'hour-noon')).toThrow(/hour-noon/);
  });
});

describe('a watched room with nobody in it', () => {
  it('is silent', () => {
    const morning = resolveNight(
      pools,
      [knocker],
      [experiment({ room: 'haunt-cellar' })],
      1,
    );
    expect(morning.scenes).toEqual([{ scene: 'silent', room: 'haunt-cellar' }]);
  });
});

describe('a room the keeper did not watch', () => {
  it('produces no scene at all, so nothing happened is never ambiguous', () => {
    const morning = resolveNight(pools, [knocker], [], 1);
    expect(morning.scenes).toEqual([]);
    expect(morning.night).toBe(1);
  });
});

describe('a ward that is the aversion', () => {
  it('turns it back at the boundary and leaves the bowl untested', () => {
    const morning = resolveNight(
      pools,
      [knocker],
      [experiment({ ward: 'aversion-iron' })],
      1,
    );
    expect(morning.scenes[0]).toEqual({
      scene: 'turned-back',
      room: 'haunt-hearth',
      trace: 'trace-knocking',
      mark: 3,
      ward: 'aversion-iron',
    });
  });
});

describe('a ward that is not its aversion', () => {
  it('is crossed, and the crossing rules that ward out', () => {
    const morning = resolveNight(
      pools,
      [knocker],
      [experiment({ ward: 'aversion-rowan' })],
      1,
    );
    expect(morning.scenes[0]).toEqual({
      scene: 'came-in',
      room: 'haunt-hearth',
      trace: 'trace-knocking',
      mark: 3,
      bowlTaken: true,
      wardCrossed: 'aversion-rowan',
    });
  });
});

describe('the bowl', () => {
  it('empties only when the lure is its lure', () => {
    const morning = resolveNight(
      pools,
      [knocker],
      [experiment({ lure: 'lure-bread' })],
      1,
    );
    expect(morning.scenes[0]).toMatchObject({
      scene: 'came-in',
      bowlTaken: false,
    });
  });
});

describe('the candle', () => {
  it('takes a mark at the watch of the approach when it is still burning', () => {
    const morning = resolveNight(
      pools,
      [knocker],
      [experiment({ candle: 3 })],
      1,
    );
    expect(morning.scenes[0]).toMatchObject({ mark: 3 });
  });

  it('burns clean when it went out first, which narrows the hour to the dark watches', () => {
    const morning = resolveNight(
      pools,
      [knocker],
      [experiment({ candle: 2 })],
      1,
    );
    expect(morning.scenes[0]).toMatchObject({ mark: null });
  });
});

describe('a night the keeper could not have placed', () => {
  it('refuses two experiments in one room', () => {
    expect(() =>
      resolveNight(pools, [knocker], [experiment(), experiment()], 1),
    ).toThrow(/two experiments/);
  });

  it('refuses a room that is not open', () => {
    expect(() =>
      resolveNight(pools, [knocker], [experiment({ room: 'haunt-attic' })], 1),
    ).toThrow(/haunt-attic/);
  });

  it('refuses a lure the house does not have', () => {
    expect(() =>
      resolveNight(pools, [knocker], [experiment({ lure: 'lure-honey' })], 1),
    ).toThrow(/lure-honey/);
  });

  it('refuses a candle no keeper could buy, which is how a logged night replays safely', () => {
    // A night read back out of a playthrough log arrives untyped, so the check is real.
    const logged: Experiment[] = JSON.parse(
      '[{"room":"haunt-hearth","candle":9,"lure":"lure-milk","ward":null}]',
    );
    expect(() => resolveNight(pools, [knocker], logged, 1)).toThrow(
      /9 watches/,
    );
  });

  it('refuses a ward the house does not have', () => {
    expect(() =>
      resolveNight(
        pools,
        [knocker],
        [experiment({ ward: 'aversion-salt-line' })],
        1,
      ),
    ).toThrow(/aversion-salt-line/);
  });
});
