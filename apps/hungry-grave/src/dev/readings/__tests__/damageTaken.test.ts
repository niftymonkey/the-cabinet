/**
 * What punished the player (#74 stories 1 and 2). The events come out of the
 * sim's own hit entry point rather than being written by hand, so the reading
 * is checked against the rule the game actually runs.
 */

import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../../../game/events';
import type { GraveHitSource } from '../../../game/grave';
import { ageGrave, hitGrave } from '../../../game/grave';
import type { WeaponLine } from '../../../game/lines/roster';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import { INVULNERABLE_TICKS, SIZE_FLOOR } from '../../../game/tuning';
import {
  createDamageTaken,
  damageTakenOf,
  observeDamageTaken,
} from '../damageTaken';

const SEED = 20260826;

/** One landed hit, with the invulnerability window it opens counted back down. */
const land = (run: RunState, source: GraveHitSource): readonly SimEvent[] => {
  const events = hitGrave(run, source);
  for (let tick = 0; tick < INVULNERABLE_TICKS; tick++) ageGrave(run.grave);
  return events;
};

const takenFrom = (
  run: RunState,
  sources: readonly GraveHitSource[],
): ReturnType<typeof damageTakenOf> => {
  const accumulator = createDamageTaken();
  for (const source of sources) {
    observeDamageTaken(accumulator, land(run, source));
  }
  return damageTakenOf(accumulator);
};

describe('damage taken', () => {
  it('counts each landed hit under the mob type that dealt it', () => {
    // Story 1: the sim already attributes a hit to what dealt it, so the
    // reading is a count under that attribution and never a re-derivation.
    const taken = takenFrom(createRun(SEED), ['shambler', 'ghoul', 'shambler']);

    expect(taken.hits).toEqual({
      shambler: 2,
      revenant: 0,
      ghoul: 1,
      contact: 0,
    });
    expect(taken.totalHits).toBe(3);
  });

  it('counts body contact as its own source beside the mob types', () => {
    // Story 2: fire pressure and body pressure are tuned as different
    // problems, so contact is a source of its own and never folded into a mob.
    const taken = takenFrom(createRun(SEED), [
      'contact',
      'revenant',
      'contact',
    ]);

    expect(taken.hits.contact).toBe(2);
    expect(taken.hits.revenant).toBe(1);
    expect(taken.hits.shambler).toBe(0);
    expect(taken.totalHits).toBe(3);
  });

  it("reports the floor ladder's own events beside the hit counts, and no summed size figure", () => {
    // At the size floor a hit shrinks nothing and runs ADR 0003's ladder
    // instead, so the ladder's rungs are the reading and a summed size-unit
    // total would be two different things added together. The key set is
    // asserted because the absence is the point.
    const levels: Record<WeaponLine, number> = {
      soulStream: 2,
      territory: 2,
      wisps: 1,
      bell: 1,
    };
    const run = createRun(SEED, SIZE_FLOOR, levels);
    run.score = 10;

    const taken = takenFrom(run, ['revenant', 'revenant', 'revenant']);

    expect(taken.totalHits).toBe(3);
    expect(taken.scoreBleeds).toBe(1);
    expect(taken.scoreBled).toBe(10);
    expect(taken.weaponStrips).toBe(1);
    expect(taken.linesStripped).toBe(4);
    expect(taken.seals).toBe(1);
    expect(run.grave.size).toBe(SIZE_FLOOR);
    expect(Object.keys(taken).sort()).toEqual([
      'hits',
      'linesStripped',
      'scoreBled',
      'scoreBleeds',
      'seals',
      'totalHits',
      'weaponStrips',
    ]);
  });
});
