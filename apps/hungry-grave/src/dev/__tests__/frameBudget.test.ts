import { describe, expect, it } from 'vitest';

import { frameBudgetOver, frameBudgetTable } from '../frameBudget';
import type { FieldSize } from '../syntheticField';

// A series whose mean and nearest-rank p95 are both known by hand.
const ONE_TO_TWENTY = Array.from({ length: 20 }, (_, index) => index + 1);

describe('the frame budget', () => {
  it('answers the mean and the 95th percentile of the frames it was given', () => {
    // Nearest rank, which is framePerformance's convention and the one this
    // project keeps: the 19th of twenty ascending values, and the plain mean.
    const rows = frameBudgetOver([{ mobs: 1, corpses: 1 }], () => ({
      sim: ONE_TO_TWENTY,
      render: [],
    }));

    expect(rows[0]?.sim.mean).toBe(10.5);
    expect(rows[0]?.sim.p95).toBe(19);
  });

  it('answers one row per size, in the order the sizes were given', () => {
    const sizes: FieldSize[] = [
      { mobs: 4, corpses: 10 },
      { mobs: 30, corpses: 60 },
    ];

    const rows = frameBudgetOver(sizes, (size) => ({
      sim: [size.mobs],
      render: [],
    }));

    expect(rows.map((row) => row.size)).toEqual(sizes);
    expect(rows.map((row) => row.sim.mean)).toEqual([4, 30]);
  });

  it('prints the field and both spans in the columns the record reads in', () => {
    const rows = frameBudgetOver([{ mobs: 100, corpses: 250 }], () => ({
      sim: [0.16],
      render: [1.77],
    }));

    expect(frameBudgetTable(rows)).toBe(
      [
        '| field (mobs / corpses) | sim tick mean | sim tick p95 | render CPU mean | render CPU p95 |',
        '| --- | --- | --- | --- | --- |',
        '| 100 / 250 | 0.16 ms | 0.16 ms | 1.77 ms | 1.77 ms |',
      ].join('\n'),
    );
  });

  it('says a span nobody timed was not measured rather than printing a zero', () => {
    // A headless run has no renderer, and a zero there would read as a free
    // frame instead of as an absent instrument.
    const rows = frameBudgetOver([{ mobs: 4, corpses: 10 }], () => ({
      sim: [0.03],
      render: [],
    }));

    expect(frameBudgetTable(rows)).toContain('| not measured | not measured |');
  });
});
