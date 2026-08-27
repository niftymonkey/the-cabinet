// Everything one replay pass collects through its observer: the damage, the
// level-ups, the mob population per tick, the field at sampled ticks, and the
// tuning readings the same pass drives.

import type { TickListener } from '../game/execution';
import type { WeaponLine } from '../game/lines/roster';
import type { DamageSource } from '../game/mobs';
import type { RunEnding, RunState } from '../game/run';
import type { NumberRecord } from './numbersByName';
import { addTo } from './numbersByName';
import type { ReadingsAcc } from './readings/readings';
import { observeReadings } from './readings/readings';
import { linesInRun } from './readings/runLines';
import { greatestOf, lastOf, meanOf } from './seriesSummary';

// One line reaching one level, at the tick the drop landed (#45).
interface LevelUp {
  readonly line: WeaponLine;
  readonly level: number;
  readonly tick: number;
}

// The live field at one tick, counted from the replayed run's pools.
interface FieldDensity {
  readonly mobs: number;
  readonly shots: number;
  readonly corpses: number;
  readonly skulls: number;
  readonly wisps: number;
}

interface ReplayTallies {
  readonly damage: Record<string, number>;
  readonly levelUps: LevelUp[];
  readonly mobsAlivePerTick: number[];
  // The field at each sampled tick, for the expensive-frame join.
  readonly densities: Map<number, FieldDensity>;
  // The tuning readings, collected off the same pass (#74).
  readonly readings: ReadingsAcc;
  kills: number;
  score: number;
  /**
   * The run's own levels record, held rather than copied. It is the one thing
   * here read after the pass instead of inside the call: a pool slot is reused
   * for a different subject and so has to be read as values at the tick, but
   * this record keeps the same keys for the whole run and only counts up and
   * down, so reading it once at the end is reading where every line finished.
   */
  levels: Readonly<Record<string, number>> | null;
  ending: RunEnding | null;
}

/**
 * Every damage arm this run names, present from the first tick, so a line the
 * run owns but never fired reads zero rather than absent.
 *
 * The arms are the run's own lines with the belch beside them, and never a list
 * of names compiled into the instrument: a line added to the roster appears in
 * the report with no edit here (#74 story 11).
 */
const seedDamage = (
  damage: Record<string, number>,
  lines: readonly WeaponLine[],
): void => {
  for (const line of lines) damage[line] ??= 0;
  damage.belch ??= 0;
};

const liveCount = (pool: readonly { alive: boolean }[]): number =>
  pool.reduce((count, slot) => count + (slot.alive ? 1 : 0), 0);

const densityOf = (run: RunState): FieldDensity => ({
  mobs: liveCount(run.mobs),
  shots: liveCount(run.mobFire),
  corpses: liveCount(run.corpses),
  skulls: liveCount(run.skulls),
  wisps: liveCount(run.wisps),
});

// The field before any tick has run: every pool starts empty.
const EMPTY_FIELD: FieldDensity = {
  mobs: 0,
  shots: 0,
  corpses: 0,
  skulls: 0,
  wisps: 0,
};

const createTallies = (readings: ReadingsAcc): ReplayTallies => ({
  damage: {},
  levelUps: [],
  // Index 0 is the empty starting field, matching ADR 0019's checkpoint
  // indexing: index N is the state after N ticks have run.
  mobsAlivePerTick: [0],
  densities: new Map(),
  readings,
  kills: 0,
  score: 0,
  levels: null,
  ending: null,
});

/**
 * The one observer the single replay pass drives. Everything off the live
 * state is read inside the call and stored as values, never as references,
 * because the pools are mutated in place (events.ts carries the same rule).
 * The one exception is the levels record, and the field it is held in says why.
 */
const observeInto = (
  tallies: ReplayTallies,
  sampleAt: ReadonlySet<number>,
): TickListener => {
  // The run's line set, read once for the whole measurement. It cannot change
  // mid-run: the sim only counts a level up and down and never adds or removes
  // a key, so a per-tick read would be the same answer at a per-frame cost, and
  // this listener is the same interface live execution accepts.
  let lines: readonly WeaponLine[] | null = null;
  return (tick, _command, events, state) => {
    lines ??= linesInRun(state);
    tallies.levels ??= state.levels;
    seedDamage(tallies.damage, lines);
    for (const event of events) {
      if (event.type === 'mobDamaged') {
        addTo(tallies.damage, event.source, event.amount);
      }
      if (event.type === 'mobKilled') tallies.kills += 1;
      if (event.type === 'weaponLeveled') {
        tallies.levelUps.push({ line: event.line, level: event.level, tick });
      }
    }
    observeReadings(tallies.readings, tick, events, state, lines);
    tallies.mobsAlivePerTick.push(liveCount(state.mobs));
    tallies.score = state.score;
    tallies.ending = state.ending;
    // The listener's tick count equals a frame row's tickIndex exactly when
    // the state is the one that frame began on.
    if (sampleAt.has(tick)) tallies.densities.set(tick, densityOf(state));
  };
};

/**
 * Damage dealt, as the report's own record. The tallies key their arms by the
 * run's own line names so a line the roster gains needs no edit here; the
 * narrowing to the report's type happens once, where the report is read out.
 */
const damageOf = (tallies: ReplayTallies): Record<DamageSource, number> => {
  const arms: Record<string, number> = { ...tallies.damage };
  return arms;
};

// Where every line finished, copied out of the run's own record once the pass is over.
const endLevelsOf = (tallies: ReplayTallies): Record<WeaponLine, number> => {
  const lines: Record<string, number> = { ...tallies.levels };
  return lines;
};

/**
 * The mob population across the run. There is no sum, because counts added
 * across ticks have no unit: a hundred ticks holding one mob is not a hundred
 * mobs.
 *
 * The summary is this reading's own, declared beside the series it summarises,
 * so comparing the population is one decision in one place rather than a shape
 * the comparer recognised.
 */
const populationSummary = (series: readonly number[]): NumberRecord => ({
  last: lastOf(series),
  max: greatestOf(series),
  mean: meanOf(series),
});

export {
  createTallies,
  observeInto,
  damageOf,
  endLevelsOf,
  populationSummary,
  EMPTY_FIELD,
};
export type { FieldDensity, LevelUp, ReplayTallies };
