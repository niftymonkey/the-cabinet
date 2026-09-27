/**
 * Mob fire shots: every shot fired over a run, under who fired it (tilted view
 * A4), so the field change's effect on fire is a figure rather than a guess.
 */

import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../../../game/events';
import type { FireKind } from '../../../game/mobFire';
import type { MobType } from '../../../game/mobs';
import type { BossKind } from '../../../game/stage/waves';
import {
  createMobFireShots,
  mobFireShotsOf,
  observeMobFireShots,
} from '../mobFireShots';

// A shot on the field, as the sim reports one.
const fired = (emitter: MobType | BossKind, kind: FireKind): SimEvent => ({
  type: 'mobFired',
  emitter,
  kind,
  x: 100,
  y: 200,
});

describe('mobFireShots', () => {
  it("every shot a mob fires is counted under its type, and a boss's under its boss", () => {
    // A4: the longer field arms a revenant for longer, and the batch reads how
    // many more shots that is. A boss's rings are counted under the boss, apart
    // from the trash that fires beside it.
    const acc = createMobFireShots();
    observeMobFireShots(acc, [
      fired('revenant', 'trash'),
      fired('revenant', 'trash'),
    ]);
    observeMobFireShots(acc, [
      fired('banshee', 'tear'),
      fired('undertaker', 'clod'),
      fired('undertaker', 'spiral'),
      { type: 'graveHit', source: 'revenant', size: 27, invulnerable: 0 },
    ]);
    observeMobFireShots(acc, [fired('revenant', 'trash')]);

    const shots = mobFireShotsOf(acc);
    expect(shots.total).toBe(6);
    expect(shots.byEmitter.revenant).toBe(3);
    expect(shots.byEmitter.banshee).toBe(1);
    expect(shots.byEmitter.undertaker).toBe(2);
  });

  it('a run with no fire reports zero for every type and never a missing row', () => {
    // A type that never fired is a fact about the run, so it reads zero, and a
    // comparison across two batches never meets a row one side lacks.
    const acc = createMobFireShots();
    observeMobFireShots(acc, []);
    expect(mobFireShotsOf(acc)).toEqual({
      total: 0,
      byEmitter: {
        shambler: 0,
        revenant: 0,
        ghoul: 0,
        cairn: 0,
        banshee: 0,
        undertaker: 0,
      },
    });
  });
});
