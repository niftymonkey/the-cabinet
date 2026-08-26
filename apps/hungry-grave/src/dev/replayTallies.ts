// Everything one replay pass collects through its observer: the damage, the
// level-ups, the mob population per tick and the field at sampled ticks.

import type { TickListener } from '../game/execution';
import type { WeaponLine } from '../game/lines/roster';
import type { DamageSource } from '../game/mobs';
import type { RunEnding, RunState } from '../game/run';

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
  readonly damage: Record<DamageSource, number>;
  readonly levelUps: LevelUp[];
  readonly mobsAlivePerTick: number[];
  // The field at each sampled tick, for the expensive-frame join.
  readonly densities: Map<number, FieldDensity>;
  kills: number;
  score: number;
  ending: RunEnding | null;
}

// All five damage arms present from the first tick, so an unused line reads zero rather than absent.
const emptyDamage = (): Record<DamageSource, number> => ({
  soulStream: 0,
  headstones: 0,
  wisps: 0,
  bell: 0,
  belch: 0,
});

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

const createTallies = (): ReplayTallies => ({
  damage: emptyDamage(),
  levelUps: [],
  // Index 0 is the empty starting field, matching ADR 0019's checkpoint
  // indexing: index N is the state after N ticks have run.
  mobsAlivePerTick: [0],
  densities: new Map(),
  kills: 0,
  score: 0,
  ending: null,
});

/**
 * The one observer the single replay pass drives. Everything is read off the
 * live state inside the call and stored as values, never as references,
 * because the pools are mutated in place (events.ts carries the same rule).
 */
const observeInto = (
  tallies: ReplayTallies,
  sampleAt: ReadonlySet<number>,
): TickListener => {
  return (tick, _command, events, state) => {
    for (const event of events) {
      if (event.type === 'mobDamaged') {
        tallies.damage[event.source] += event.amount;
      }
      if (event.type === 'mobKilled') tallies.kills += 1;
      if (event.type === 'weaponLeveled') {
        tallies.levelUps.push({ line: event.line, level: event.level, tick });
      }
    }
    tallies.mobsAlivePerTick.push(liveCount(state.mobs));
    tallies.score = state.score;
    tallies.ending = state.ending;
    // The listener's tick count equals a frame row's tickIndex exactly when
    // the state is the one that frame began on.
    if (sampleAt.has(tick)) tallies.densities.set(tick, densityOf(state));
  };
};

export { createTallies, observeInto, EMPTY_FIELD };
export type { FieldDensity, LevelUp, ReplayTallies };
