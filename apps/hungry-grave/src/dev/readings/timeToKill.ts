// How fights resolved: what a mob type cost to kill, and what did not die.

import type { SimEvent } from '../../game/events';
import type { WeaponLine } from '../../game/lines/roster';
import type { DamageSource, MobType } from '../../game/mobs';
import { MOB_TYPE_NAMES } from '../../game/mobs';
import type { RunState } from '../../game/run';
import { addTo } from '../numbersByName';
import { greatestOf, leastOf, meanOf } from '../seriesSummary';

/**
 * One entry of a per-type accumulator seeded for every MOB_TYPE_NAMES entry
 * (noneByType, noTicksByType) before any tick runs, so a lookup by a type this
 * module itself produced is a bug rather than a case if it is ever absent.
 */
function entryOf<T>(record: Record<string, T>, key: string): T {
  const entry = record[key];
  if (entry === undefined) throw new Error(`no entry for ${key}`);
  return entry;
}

/**
 * The engagements a run fought, per mob type and per weapon line.
 *
 * Every mob that ever took damage lands in exactly one of killed, escaped and
 * aliveAtStop, so engaged is the three of them added up. Neither escaped nor
 * aliveAtStop is ever given a time: a fight that did not finish has no length,
 * and estimating one would be the report lying quietly.
 *
 * The tick and hit figures cover the kills a weapon line finished. A belch is a
 * wipe rather than a fight, so its kills are counted under fatalBlows.belch and
 * left out of the headline, which is why timedKills is its own count.
 *
 * hitsPerKill means something within one line across runs and tunings. Between
 * two lines with different behaviours it says nothing, because a stream of many
 * small hits and one large hit are both one kill.
 */
interface Engagements {
  readonly engaged: Record<MobType, number>;
  readonly killed: Record<MobType, number>;
  // Damaged, then gone from the field with no kill event.
  readonly escaped: Record<MobType, number>;
  // Damaged and still alive on the run's last tick.
  readonly aliveAtStop: Record<MobType, number>;
  // The kills the tick and hit figures below cover: every kill but the belch's.
  readonly timedKills: Record<MobType, number>;
  /**
   * Ticks from first damage to death, over those kills. A type with no timed
   * kill is absent rather than zero: there is no fight to have taken no time.
   */
  readonly ticksToKillMean: Readonly<Partial<Record<MobType, number>>>;
  readonly ticksToKillMin: Readonly<Partial<Record<MobType, number>>>;
  readonly ticksToKillMax: Readonly<Partial<Record<MobType, number>>>;
  readonly hitsPerKill: Readonly<Partial<Record<MobType, number>>>;
  // Hits behind those kills, under the line that dealt each.
  readonly hitsByLine: Record<DamageSource, number>;
  // Every kill, credited to the blow that landed last.
  readonly fatalBlows: Record<DamageSource, number>;
}

// One mob's fight, from the first damage it took until it left the run.
interface Engagement {
  readonly type: MobType;
  readonly firstDamageTick: number;
  hits: number;
  readonly hitsByLine: Record<string, number>;
  lastSource: DamageSource;
}

interface EngagementsAcc {
  readonly open: Map<number, Engagement>;
  readonly engaged: Record<string, number>;
  readonly killed: Record<string, number>;
  readonly timedKills: Record<string, number>;
  readonly ticks: Record<string, number[]>;
  readonly hits: Record<string, number>;
  readonly hitsByLine: Record<string, number>;
  readonly fatalBlows: Record<string, number>;
  readonly liveIds: Set<number>;
}

// Every mob type present from the first tick, so a type never met reads zero.
const noneByType = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const mob of MOB_TYPE_NAMES) counts[mob] = 0;
  return counts;
};

const noTicksByType = (): Record<string, number[]> => {
  const ticks: Record<string, number[]> = {};
  for (const mob of MOB_TYPE_NAMES) ticks[mob] = [];
  return ticks;
};

/**
 * The damage arms this run names: its own lines, with the belch beside them.
 * An arm that never dealt a hit reads zero rather than absent.
 */
const seedArms = (
  arms: Record<string, number>,
  lines: readonly WeaponLine[],
): void => {
  for (const line of lines) arms[line] ??= 0;
  arms.belch ??= 0;
};

/**
 * The accumulator, carrying every arm this run names before a tick has run. The
 * line set is known from the tape header, so an arm never waits on a hit to
 * exist and a run with nothing in it still reports its own lines at zero.
 */
const createEngagements = (lines: readonly WeaponLine[]): EngagementsAcc => {
  const acc: EngagementsAcc = {
    open: new Map(),
    engaged: noneByType(),
    killed: noneByType(),
    timedKills: noneByType(),
    ticks: noTicksByType(),
    hits: noneByType(),
    hitsByLine: {},
    fatalBlows: {},
    liveIds: new Set(),
  };
  seedArms(acc.hitsByLine, lines);
  seedArms(acc.fatalBlows, lines);
  return acc;
};

/**
 * Every mob type this tick can name, by id.
 *
 * THIS READING COVERS THE MOB POOL AND NOTHING ELSE. A boss takes storm damage
 * and reports it as mobDamaged like anything else, and a boss is not in the
 * pool, so its damage names no type here and no engagement is opened for it. A
 * fight against a boss is read from its own vocabulary instead, bossArrived,
 * chunkBroke and bossKilled.
 *
 * That is why a missing id answers nothing rather than throwing, and the guard
 * it used to carry has not been given up: an engagement that never closes is
 * caught on the kill side by closeEngagement, whose event is a mob's by
 * construction.
 *
 * The pool alone is not enough to name a tick's own kills. The belch fires
 * before the tick's spawns (step.ts), so a body it takes frees the slot that
 * the tick's next spawn claims, and by the time the observer reads the pool
 * that slot carries a newer mob's id. The kill event carries the type it took,
 * which is what keeps such a fight readable. Kills are laid over the pool
 * rather than under it, and the two never disagree: an id only ever increases,
 * so a reclaimed slot can never answer to the id it used to hold.
 */
const typesThisTick = (
  state: RunState,
  events: readonly SimEvent[],
): Map<number, MobType> => {
  const types = new Map<number, MobType>();
  for (const mob of state.mobs) types.set(mob.id, mob.type);
  for (const event of events) {
    if (event.type === 'mobKilled') types.set(event.id, event.mob);
  }
  return types;
};

const openEngagement = (
  acc: EngagementsAcc,
  tick: number,
  id: number,
  source: DamageSource,
  types: ReadonlyMap<number, MobType>,
): Engagement | null => {
  const type = types.get(id);
  if (type === undefined) return null;
  acc.engaged[type] = entryOf(acc.engaged, type) + 1;
  const engagement: Engagement = {
    type,
    firstDamageTick: tick,
    hits: 0,
    hitsByLine: {},
    lastSource: source,
  };
  acc.open.set(id, engagement);
  return engagement;
};

const takeHit = (
  acc: EngagementsAcc,
  tick: number,
  id: number,
  source: DamageSource,
  types: ReadonlyMap<number, MobType>,
): void => {
  const engagement =
    acc.open.get(id) ?? openEngagement(acc, tick, id, source, types);
  if (engagement === null) return;
  engagement.hits += 1;
  addTo(engagement.hitsByLine, source, 1);
  engagement.lastSource = source;
};

/**
 * A death closes its fight. The headline covers the kills a weapon line
 * finished; a belch-fatal kill is counted under its own arm and left out, so a
 * wipe cannot drag the per-type figure toward the reservoir's fill time.
 */
const closeEngagement = (
  acc: EngagementsAcc,
  tick: number,
  id: number,
): void => {
  const engagement = acc.open.get(id);
  if (engagement === undefined) {
    throw new Error(`mob ${id} died with no damage behind it`);
  }
  acc.open.delete(id);
  acc.killed[engagement.type] = entryOf(acc.killed, engagement.type) + 1;
  addTo(acc.fatalBlows, engagement.lastSource, 1);
  if (engagement.lastSource === 'belch') return;
  acc.timedKills[engagement.type] =
    entryOf(acc.timedKills, engagement.type) + 1;
  entryOf(acc.ticks, engagement.type).push(tick - engagement.firstDamageTick);
  acc.hits[engagement.type] =
    entryOf(acc.hits, engagement.type) + engagement.hits;
  for (const [line, hits] of Object.entries(engagement.hitsByLine)) {
    addTo(acc.hitsByLine, line, hits);
  }
};

const observeEngagements = (
  acc: EngagementsAcc,
  tick: number,
  events: readonly SimEvent[],
  state: RunState,
): void => {
  const types = typesThisTick(state, events);
  for (const event of events) {
    if (event.type === 'mobDamaged') {
      takeHit(acc, tick, event.id, event.source, types);
    }
    if (event.type === 'mobKilled') closeEngagement(acc, tick, event.id);
  }
  acc.liveIds.clear();
  for (const mob of state.mobs) {
    if (mob.alive) acc.liveIds.add(mob.id);
  }
};

/**
 * The fights the run stopped in the middle of, split by the last tick's live
 * ids: a mob still on the field was interrupted, and one that is gone with no
 * kill event behind it left the field. Neither is ever given a time.
 */
const unfinished = (
  acc: EngagementsAcc,
): { escaped: Record<string, number>; aliveAtStop: Record<string, number> } => {
  const escaped = noneByType();
  const aliveAtStop = noneByType();
  for (const [id, engagement] of acc.open) {
    const bucket = acc.liveIds.has(id) ? aliveAtStop : escaped;
    bucket[engagement.type] = entryOf(bucket, engagement.type) + 1;
  }
  return { escaped, aliveAtStop };
};

// The four figures the timed kills produce, per mob type.
interface KillTimes {
  readonly mean: Partial<Record<MobType, number>>;
  readonly min: Partial<Record<MobType, number>>;
  readonly max: Partial<Record<MobType, number>>;
  readonly hitsPerKill: Partial<Record<MobType, number>>;
}

/**
 * What the fights that finished cost, over the kills a weapon line landed. A
 * type with no timed kill is absent from all four rather than zero: there is no
 * fight to have taken no time and no hits.
 */
const killTimesOf = (acc: EngagementsAcc): KillTimes => {
  const times: KillTimes = { mean: {}, min: {}, max: {}, hitsPerKill: {} };
  for (const type of MOB_TYPE_NAMES) {
    const ticks = entryOf(acc.ticks, type);
    if (ticks.length === 0) continue;
    times.mean[type] = meanOf(ticks);
    times.min[type] = leastOf(ticks);
    times.max[type] = greatestOf(ticks);
    times.hitsPerKill[type] = entryOf(acc.hits, type) / ticks.length;
  }
  return times;
};

const engagementsOf = (acc: EngagementsAcc): Engagements => {
  const times = killTimesOf(acc);
  const open = unfinished(acc);
  const engaged: Record<string, number> = { ...acc.engaged };
  const killed: Record<string, number> = { ...acc.killed };
  const timedKills: Record<string, number> = { ...acc.timedKills };
  const hitsByLine: Record<string, number> = { ...acc.hitsByLine };
  const fatalBlows: Record<string, number> = { ...acc.fatalBlows };
  return {
    engaged,
    killed,
    escaped: open.escaped,
    aliveAtStop: open.aliveAtStop,
    timedKills,
    ticksToKillMean: times.mean,
    ticksToKillMin: times.min,
    ticksToKillMax: times.max,
    hitsPerKill: times.hitsPerKill,
    hitsByLine,
    fatalBlows,
  };
};

export { createEngagements, observeEngagements, engagementsOf };
export type { Engagements, EngagementsAcc };
