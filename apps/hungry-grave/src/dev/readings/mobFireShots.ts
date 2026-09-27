// Every shot the mobs and the bosses fired over a run, counted under who fired it.

import type { SimEvent } from '../../game/events';
import { MOB_TYPE_NAMES } from '../../game/mobs';
import { BOSS_KINDS } from '../../game/stage/waves';
import { addTo } from '../numbersByName';

/**
 * The shots fired over a run (tilted view A4): the whole count and the count
 * under each mob type and each boss. The hits those shots landed are
 * `damageTaken.hits` by source, so this reading counts what was fired and
 * never what landed.
 */
interface MobFireShots {
  readonly total: number;
  readonly byEmitter: Readonly<Record<string, number>>;
}

interface MobFireShotsAcc {
  readonly byEmitter: Record<string, number>;
  total: number;
}

/**
 * Every mob type and every boss present from the first tick, so one that never
 * fired reads zero rather than absent, the same rows `damageTaken.hits` keeps.
 */
const noShots = (): Record<string, number> => {
  const byEmitter: Record<string, number> = {};
  for (const mob of MOB_TYPE_NAMES) byEmitter[mob] = 0;
  for (const boss of BOSS_KINDS) byEmitter[boss] = 0;
  return byEmitter;
};

const createMobFireShots = (): MobFireShotsAcc => ({
  byEmitter: noShots(),
  total: 0,
});

const observeMobFireShots = (
  acc: MobFireShotsAcc,
  events: readonly SimEvent[],
): void => {
  for (const event of events) {
    if (event.type !== 'mobFired') continue;
    addTo(acc.byEmitter, event.emitter, 1);
    acc.total += 1;
  }
};

const mobFireShotsOf = (acc: MobFireShotsAcc): MobFireShots => ({
  total: acc.total,
  byEmitter: { ...acc.byEmitter },
});

export { createMobFireShots, mobFireShotsOf, observeMobFireShots };
export type { MobFireShots, MobFireShotsAcc };
