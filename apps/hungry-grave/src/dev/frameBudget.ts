// The frame budget of a stood field: what one frame costs at a size, reduced
// and printed in the columns the round 0 record reads in.

import type { FrameObservation } from '../tape/tape';
import type { Distribution } from './framePerformance';
import { performanceOf } from './framePerformance';
import type { FieldSize } from './syntheticField';

/**
 * The six fields round 0's table names
 * (docs/design/mow-ladder-director.md section 4). Data and never a target: the
 * two smallest describe the game as it is measured today, the middle two the
 * field step 4 authors, and the two largest the headroom above it.
 *
 * It lives beside the reduction rather than in either shell because both shells
 * measure the same six, and a table printed from two lists is two tables.
 */
const ROUND_ZERO_FIELDS: readonly FieldSize[] = [
  { mobs: 4, corpses: 10 },
  { mobs: 30, corpses: 60 },
  { mobs: 80, corpses: 200 },
  { mobs: 100, corpses: 250 },
  { mobs: 200, corpses: 500 },
  { mobs: 400, corpses: 1000 },
];

/** The timed spans of one size's frames, in milliseconds, one entry per frame. */
interface FrameSpans {
  // Time inside the executed tick, which is the simulation and its invariant checks.
  readonly sim: readonly number[];
  // Time inside the renderer's own pass, empty where no renderer was there to time.
  readonly render: readonly number[];
}

/** One size measured: the field it stood and what its frames cost. */
interface FrameBudgetRow {
  readonly size: FieldSize;
  readonly sim: Distribution;
  readonly render: Distribution;
}

/**
 * One measured span, worn as a frame observation so framePerformance can
 * reduce it.
 *
 * framePerformance owns this project's percentile convention and its empty
 * series answer, and a bench has no second convention to offer. It reduces a
 * frame's fields independently, so a bench frame's two spans are reduced as two
 * series rather than one, and only the span's own field is filled: the rest is
 * unmeasured here, and nothing reads it.
 */
const asTimedSpan = (ms: number): FrameObservation => ({
  kind: 'frame',
  reason: 'live',
  tickIndex: null,
  ticksExecuted: 1,
  intervalMs: 0,
  advanceMs: ms,
  updateMs: 0,
  debtTicks: 0,
});

const distributionOf = (spans: readonly number[]): Distribution =>
  performanceOf(spans.map(asTimedSpan), new Map()).advance;

/**
 * A row per size, in the order the sizes were given, each one driven by the
 * caller.
 *
 * Driving a field is a shell's job: it needs a clock, and on the render half a
 * renderer. What is here is the sequencing and the reduction, which is the part
 * a test can hold.
 */
const frameBudgetOver = (
  sizes: readonly FieldSize[],
  drive: (size: FieldSize) => FrameSpans,
): FrameBudgetRow[] =>
  sizes.map((size) => {
    const spans = drive(size);
    return {
      size,
      sim: distributionOf(spans.sim),
      render: distributionOf(spans.render),
    };
  });

// A millisecond figure as the record writes one, or the plain word for a span nobody timed.
const millis = (value: number, measured: boolean): string =>
  measured ? `${value.toFixed(2)} ms` : 'not measured';

const HEADER = [
  '| field (mobs / corpses) | sim tick mean | sim tick p95 | render CPU mean | render CPU p95 |',
  '| --- | --- | --- | --- | --- |',
];

const rowLine = (row: FrameBudgetRow): string => {
  const rendered = row.render.count > 0;
  const simmed = row.sim.count > 0;
  const cells = [
    `${row.size.mobs} / ${row.size.corpses}`,
    millis(row.sim.mean, simmed),
    millis(row.sim.p95, simmed),
    millis(row.render.mean, rendered),
    millis(row.render.p95, rendered),
  ];
  return `| ${cells.join(' | ')} |`;
};

/**
 * The rows as the record's own table, so a fresh measurement can be set beside
 * the one the record holds without either being retyped.
 */
const frameBudgetTable = (rows: readonly FrameBudgetRow[]): string =>
  [...HEADER, ...rows.map(rowLine)].join('\n');

export { frameBudgetOver, frameBudgetTable, ROUND_ZERO_FIELDS };
export type { FrameBudgetRow, FrameSpans };
