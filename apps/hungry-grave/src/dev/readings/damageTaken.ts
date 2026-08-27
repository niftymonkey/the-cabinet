// What punished the player: the hits that landed and the floor ladder they ran.

import type { SimEvent } from '../../game/events';
import type { GraveHitSource } from '../../game/grave';
import { MOB_TYPE_NAMES } from '../../game/mobs';
import { addTo } from '../numbersByName';

/**
 * The damage the player took, as landed hits and never as a size figure.
 *
 * A grave hit carries no amount, and at the size floor it shrinks nothing at
 * all and runs ADR 0003's ladder instead, so a summed size-unit total would be
 * two different things added together. The ladder's own rungs are reported
 * beside the counts, and the shrink itself is visible in the size-per-tick
 * series.
 */
interface DamageTaken {
  readonly totalHits: number;
  // Hits under the mob type whose shot landed, or under body contact.
  readonly hits: Record<GraveHitSource, number>;
  // The ladder's first rung: how often it bled the score, and the score it took.
  readonly scoreBleeds: number;
  readonly scoreBled: number;
  // The ladder's second rung: how often it stripped, and the line-levels that cost.
  readonly weaponStrips: number;
  readonly linesStripped: number;
  // The end of the ladder. A run has at most one.
  readonly seals: number;
}

interface DamageTakenAcc {
  readonly hits: Record<string, number>;
  totalHits: number;
  scoreBleeds: number;
  scoreBled: number;
  weaponStrips: number;
  linesStripped: number;
  seals: number;
}

/**
 * Every mob type present from the first tick, so a type that never landed a hit
 * reads zero rather than absent, and body contact beside them.
 */
const noHits = (): Record<string, number> => {
  const hits: Record<string, number> = { contact: 0 };
  for (const mob of MOB_TYPE_NAMES) hits[mob] = 0;
  return hits;
};

const createDamageTaken = (): DamageTakenAcc => ({
  hits: noHits(),
  totalHits: 0,
  scoreBleeds: 0,
  scoreBled: 0,
  weaponStrips: 0,
  linesStripped: 0,
  seals: 0,
});

const observeDamageTaken = (
  acc: DamageTakenAcc,
  events: readonly SimEvent[],
): void => {
  for (const event of events) {
    if (event.type === 'graveHit') {
      addTo(acc.hits, event.source, 1);
      acc.totalHits += 1;
    }
    if (event.type === 'scoreBled') {
      acc.scoreBleeds += 1;
      acc.scoreBled += event.amount;
    }
    if (event.type === 'weaponStripped') {
      acc.weaponStrips += 1;
      acc.linesStripped += event.lines.length;
    }
    if (event.type === 'sealed') acc.seals += 1;
  }
};

const damageTakenOf = (acc: DamageTakenAcc): DamageTaken => {
  const hits: Record<string, number> = { ...acc.hits };
  return {
    totalHits: acc.totalHits,
    hits,
    scoreBleeds: acc.scoreBleeds,
    scoreBled: acc.scoreBled,
    weaponStrips: acc.weaponStrips,
    linesStripped: acc.linesStripped,
    seals: acc.seals,
  };
};

export { createDamageTaken, observeDamageTaken, damageTakenOf };
export type { DamageTaken, DamageTakenAcc };
