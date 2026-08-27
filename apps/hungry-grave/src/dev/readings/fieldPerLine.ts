// What the storm held on the field, line by line.

import { stoneCount } from '../../game/lines/headstones';
import type { WeaponLine } from '../../game/lines/roster';
import type { RunState } from '../../game/run';
import type { NumberRecord } from '../numbersByName';
import { greatestOf, lastOf, meanOf } from '../seriesSummary';

// How many of one line's things stand on the field right now.
type OnFieldCount = (state: RunState) => number;

const liveCount = (pool: readonly { alive: boolean }[]): number =>
  pool.reduce((count, slot) => count + (slot.alive ? 1 : 0), 0);

/**
 * Each line's pinned on-field representation. The record is partial on purpose:
 * a line with nothing pinned here is absent from the reading rather than zero,
 * so absence keeps meaning the recording cannot support the reading.
 *
 * A future line with a new kind of presence extends this mapping. The promise
 * that a new line needs no instrument change covers the readings enumerated
 * from run data, never this one.
 */
const ON_FIELD_BY_LINE: Readonly<Partial<Record<WeaponLine, OnFieldCount>>> = {
  soulStream: (state) => liveCount(state.skulls),
  wisps: (state) => liveCount(state.wisps),
  headstones: (state) => stoneCount(state),
  bell: (state) => (state.lines.ring === null ? 0 : 1),
};

/**
 * What each line had on the field at every tick, with the total beside it.
 *
 * The number counts things. It is a proxy for density and claims nothing about
 * how much of the field anything covers: a beam that sweeps half the screen
 * counts as one.
 *
 * Index N is the field after tick N ran, so the arrays hold one entry per
 * executed tick. They carry no pre-run sample, because the headstones' count
 * before the first tick is a function of the starting levels rather than of
 * anything on the field.
 */
interface FieldPerLine {
  readonly perLine: Readonly<Partial<Record<WeaponLine, readonly number[]>>>;
  readonly total: readonly number[];
}

interface FieldPerLineAcc {
  readonly perLine: Map<WeaponLine, number[]>;
  readonly total: number[];
}

const createFieldPerLine = (): FieldPerLineAcc => ({
  perLine: new Map(),
  total: [],
});

const observeFieldPerLine = (
  acc: FieldPerLineAcc,
  state: RunState,
  lines: readonly WeaponLine[],
): void => {
  let total = 0;
  for (const line of lines) {
    const onField = ON_FIELD_BY_LINE[line];
    if (onField === undefined) continue;
    const count = onField(state);
    const series = acc.perLine.get(line);
    if (series === undefined) acc.perLine.set(line, [count]);
    else series.push(count);
    total += count;
  }
  acc.total.push(total);
};

const fieldPerLineOf = (acc: FieldPerLineAcc): FieldPerLine => {
  const perLine: Partial<Record<WeaponLine, readonly number[]>> = {};
  for (const [line, series] of acc.perLine) perLine[line] = [...series];
  return { perLine, total: [...acc.total] };
};

/**
 * What the whole storm held. No sum, because counts added across ticks have no
 * unit: a hundred ticks holding one skull is not a hundred skulls.
 */
const fieldSummary = (series: readonly number[]): NumberRecord => ({
  max: greatestOf(series),
  mean: meanOf(series),
  last: lastOf(series),
});

/**
 * Each line's own three, flattened into names keyed by line, so a line only one
 * of two runs names is one absent name rather than a missing summary.
 *
 * Both summaries are this reading's own, declared beside the series they
 * summarise, so comparing the field is one decision in one place rather than a
 * shape the comparer recognised.
 */
const perLineSummary = (
  perLine: Readonly<Partial<Record<WeaponLine, readonly number[]>>>,
): NumberRecord => {
  const summary: Record<string, number | undefined> = {};
  for (const [line, series] of Object.entries(perLine)) {
    if (series === undefined) continue;
    summary[`${line}.max`] = greatestOf(series);
    summary[`${line}.mean`] = meanOf(series);
    summary[`${line}.last`] = lastOf(series);
  }
  return summary;
};

export {
  createFieldPerLine,
  observeFieldPerLine,
  fieldPerLineOf,
  fieldSummary,
  perLineSummary,
  ON_FIELD_BY_LINE,
};
export type { FieldPerLine, FieldPerLineAcc };
