/**
 * How fights resolved (#74 stories 3 and 4). Every hit and every death comes
 * out of the sim's own damageMob, so the ticks the reading reports are the ones
 * the game put between the events.
 */

import { describe, expect, it } from 'vitest';

import { FIELD_HEIGHT } from '../../../game/field';
import type { Mob, MobType } from '../../../game/mobs';
import { cullMobs, damageMob, spawnMob } from '../../../game/mobs';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import { linesInRun } from '../runLines';
import {
  createEngagements,
  engagementsOf,
  observeEngagements,
} from '../timeToKill';

const SEED = 20260826;

/** One mob standing inside the field, where the belch and the lines can reach it. */
const standing = (run: RunState, type: MobType, x: number): Mob => {
  const mob = spawnMob(run, type, { x, y: 200, vx: 0, vy: 1, index: 0 }, false);
  if (mob === null) throw new Error('the mob pool refused a spawn');
  return mob;
};

describe('time to kill', () => {
  it('reports ticks from first damage to death, per mob type', () => {
    // Story 3: a fight is measured from the first damage it took to its death,
    // per entity, and reported per type.
    const run = createRun(SEED);
    const accumulator = createEngagements(linesInRun(run.levels));
    const slow = standing(run, 'shambler', 100);
    const quick = standing(run, 'shambler', 200);

    observeEngagements(
      accumulator,
      10,
      damageMob(run, slow, 1, 'skullStream'),
      run,
    );
    observeEngagements(
      accumulator,
      12,
      damageMob(run, quick, 1, 'skullStream'),
      run,
    );
    observeEngagements(
      accumulator,
      17,
      damageMob(run, quick, quick.hp, 'skullStream'),
      run,
    );
    observeEngagements(
      accumulator,
      25,
      damageMob(run, slow, slow.hp, 'skullStream'),
      run,
    );

    const fights = engagementsOf(accumulator);
    expect(fights.engaged.shambler).toBe(2);
    expect(fights.killed.shambler).toBe(2);
    expect(fights.timedKills.shambler).toBe(2);
    expect(fights.ticksToKillMin.shambler).toBe(5);
    expect(fights.ticksToKillMax.shambler).toBe(15);
    expect(fights.ticksToKillMean.shambler).toBe(10);
    expect(fights.escaped.shambler).toBe(0);
    expect(fights.aliveAtStop.shambler).toBe(0);
  });

  it('leaves belch-fatal kills out of the per-type headline and counts them by their own arm', () => {
    // A belch is a wipe rather than a fight, so a mob that happened to be on
    // screen when the button went would drag the headline toward whatever the
    // reservoir's fill time was.
    const run = createRun(SEED);
    const accumulator = createEngagements(linesInRun(run.levels));
    const wiped = standing(run, 'shambler', 100);
    const shot = standing(run, 'shambler', 200);

    observeEngagements(
      accumulator,
      0,
      [
        ...damageMob(run, wiped, 1, 'wisps'),
        ...damageMob(run, shot, 1, 'wisps'),
      ],
      run,
    );
    observeEngagements(
      accumulator,
      4,
      damageMob(run, shot, shot.hp, 'wisps'),
      run,
    );
    observeEngagements(
      accumulator,
      10,
      damageMob(run, wiped, wiped.hp, 'belch'),
      run,
    );

    const fights = engagementsOf(accumulator);
    expect(fights.killed.shambler).toBe(2);
    expect(fights.timedKills.shambler).toBe(1);
    expect(fights.ticksToKillMean.shambler).toBe(4);
    expect(fights.ticksToKillMax.shambler).toBe(4);
    expect(fights.fatalBlows.belch).toBe(1);
    expect(fights.fatalBlows.wisps).toBe(1);
  });

  it('counts a damaged mob that left the field as escaped, never as a time', () => {
    // The cull is the sim's only silent removal: no event says the mob went, so
    // an engagement with no kill behind it and no live mob in front of it is
    // one that got away. It is never given a time.
    const run = createRun(SEED);
    const accumulator = createEngagements(linesInRun(run.levels));
    const fleeing = standing(run, 'ghoul', 100);

    observeEngagements(
      accumulator,
      0,
      damageMob(run, fleeing, 1, 'skullStream'),
      run,
    );
    fleeing.y = FIELD_HEIGHT * 2;
    cullMobs(run);
    observeEngagements(accumulator, 1, [], run);

    const fights = engagementsOf(accumulator);
    expect(fights.engaged.ghoul).toBe(1);
    expect(fights.escaped.ghoul).toBe(1);
    expect(fights.killed.ghoul).toBe(0);
    expect(fights.aliveAtStop.ghoul).toBe(0);
    expect(fights.timedKills.ghoul).toBe(0);
    expect('ghoul' in fights.ticksToKillMean).toBe(false);
  });

  it('counts a damaged mob still alive at the stop in its own bucket', () => {
    // A fight the run stopped in the middle of is not an escape and not a kill,
    // and merging it into either would move the headline.
    const run = createRun(SEED);
    const accumulator = createEngagements(linesInRun(run.levels));
    const survivor = standing(run, 'revenant', 100);

    observeEngagements(
      accumulator,
      0,
      damageMob(run, survivor, 1, 'bell'),
      run,
    );
    observeEngagements(accumulator, 1, [], run);

    const fights = engagementsOf(accumulator);
    expect(fights.engaged.revenant).toBe(1);
    expect(fights.aliveAtStop.revenant).toBe(1);
    expect(fights.escaped.revenant).toBe(0);
    expect(fights.killed.revenant).toBe(0);
  });

  it('counts each hit behind a kill under the line that dealt it, the kill credited to the fatal blow', () => {
    // Story 4: a stream of many small hits and one large hit read differently
    // even when both kill in the same time. The kill itself stays credited to
    // the blow that landed last, as the sim already does.
    const run = createRun(SEED);
    const accumulator = createEngagements(linesInRun(run.levels));
    const target = standing(run, 'revenant', 100);

    observeEngagements(
      accumulator,
      0,
      damageMob(run, target, 1, 'skullStream'),
      run,
    );
    observeEngagements(
      accumulator,
      1,
      damageMob(run, target, 1, 'skullStream'),
      run,
    );
    observeEngagements(
      accumulator,
      2,
      damageMob(run, target, 1, 'skullStream'),
      run,
    );
    observeEngagements(
      accumulator,
      3,
      damageMob(run, target, target.hp, 'territory'),
      run,
    );

    const fights = engagementsOf(accumulator);
    expect(fights.hitsByLine.skullStream).toBe(3);
    expect(fights.hitsByLine.territory).toBe(1);
    expect(fights.hitsByLine.wisps).toBe(0);
    expect(fights.hitsByLine.belch).toBe(0);
    expect(fights.fatalBlows.territory).toBe(1);
    expect(fights.fatalBlows.skullStream).toBe(0);
    expect(fights.hitsPerKill.revenant).toBe(4);
  });

  it('reads a belch kill whose pool slot a later spawn in the same tick reclaimed', () => {
    // step.ts fires the belch before the tick's spawns, so a body the belch
    // took can be gone from the pool by the time the observer reads it: the
    // first dead slot is the one takeSlot claims, and it arrives stamped with a
    // newer mob's id. The kill event carries the type, so the fight is still
    // readable without the slot.
    const run = createRun(SEED);
    const accumulator = createEngagements(linesInRun(run.levels));
    const wiped = standing(run, 'shambler', 100);
    // Read as a value before the slot is reclaimed: the pool mutates in place,
    // so the reclaimed slot is the very object wiped points at.
    const wipedId = wiped.id;
    const events = damageMob(run, wiped, wiped.hp, 'belch');
    const reclaimed = standing(run, 'ghoul', 200);
    expect(reclaimed.id).not.toBe(wipedId);
    expect(run.mobs.some((mob) => mob.id === wipedId)).toBe(false);

    observeEngagements(accumulator, 7, events, run);

    const fights = engagementsOf(accumulator);
    expect(fights.engaged.shambler).toBe(1);
    expect(fights.killed.shambler).toBe(1);
    expect(fights.fatalBlows.belch).toBe(1);
    expect(fights.timedKills.shambler).toBe(0);
    expect(fights.escaped.shambler).toBe(0);
  });

  it('refuses a death with no damage behind it', () => {
    // The guard is this reading's own bug detector and stays a guard. Every
    // death in the sim comes out of damageMob, which reports the damage before
    // the kill, so a kill with no fight open is a defect in the game rather
    // than a fight the reading may quietly drop.
    const run = createRun(SEED);
    const accumulator = createEngagements(linesInRun(run.levels));

    expect(() =>
      observeEngagements(
        accumulator,
        3,
        [
          {
            type: 'mobKilled',
            id: 4242,
            mob: 'shambler',
            x: 0,
            y: 0,
            carried: false,
          },
        ],
        run,
      ),
    ).toThrow('mob 4242 died with no damage behind it');
  });
});
