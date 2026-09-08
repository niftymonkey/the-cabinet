/**
 * The one seam the storm finds its targets through.
 *
 * What is asserted here is the seam's own contract: what is in the list, in
 * what order, when a thing leaves it, and what a line may do to a target
 * without knowing what kind of thing it is holding. The five weapon lines
 * carry their own tests, and the fence that says none of them walks the mob
 * pool any more is src/__tests__/lineAgnosticPolicies.test.ts.
 */

import { describe, expect, it } from 'vitest';

import { spawnBoss } from '../bosses/chunks';
import type { Mob } from '../mobs';
import { MOB_TYPES, spawnMob } from '../mobs';
import type { RunState } from '../run';
import { createRun } from '../run';
import { SET_PIECE_HP } from '../stage/rows';
import {
  advanceSetPiece,
  placeSetPiece,
  setPieceHitbox,
} from '../stage/setPiece';
import {
  damageStormTarget,
  moveStormTarget,
  stormTarget,
  stormTargets,
} from '../stormTargets';

const SEED = 20260908;

/** A live mob past its arriving beat, standing where it is put. */
function putMob(state: RunState, x: number, y: number): Mob {
  const mob = spawnMob(
    state,
    'shambler',
    { x, y, vx: 0, vy: 0, index: 0 },
    false,
  );
  if (mob === null) throw new Error('the mob pool refused the fixture');
  mob.beat = 0;
  return mob;
}

describe('what the storm can hit', () => {
  it('holds the mob pool and the boss together, in one fixed order', () => {
    // A boss is one record on RunState and not a member of the mob pool, so a
    // line that walked the pool would go straight past it. The order is the
    // pool in slot order and then the boss, and it is as load-bearing as the
    // membership: lines resolve ties by taking the first target in the list, so
    // a fixed order is what makes the same seed produce the same kills in the
    // same order.
    const state = createRun(SEED);
    const first = putMob(state, 100, 200);
    const second = putMob(state, 140, 200);
    const boss = spawnBoss(state, 'banshee');

    expect(stormTargets(state).map((target) => target.id)).toEqual([
      first.id,
      second.id,
      boss.id,
    ]);
  });

  it('holds the set piece source once it has opened, and never while it is dormant', () => {
    // The source is the third thing in the list, after the boss, and what puts
    // it there is its own open state: a dormant one has no hitbox at all
    // (ADR 0050), so there is nothing on the field for a line to find. Its two
    // flags are the boss's, for its own reasons: a push would smear an authored
    // moment, and a kill rule may not take a body whose health is sized to
    // outlive its own pour.
    const state = createRun(SEED);
    const mob = putMob(state, 100, 200);
    const boss = spawnBoss(state, 'banshee');
    const piece = placeSetPiece(state);

    expect(stormTargets(state).map((target) => target.id)).toEqual([
      mob.id,
      boss.id,
    ]);
    expect(setPieceHitbox(piece)).toBeNull();

    piece.open = true;
    expect(stormTargets(state).map((target) => target.id)).toEqual([
      mob.id,
      boss.id,
      piece.id,
    ]);
    const asSource = stormTargets(state)[2];
    expect(asSource.pushable).toBe(false);
    expect(asSource.killableOutright).toBe(false);
    expect(asSource.entered).toBe(true);
    expect(asSource.hp).toBe(piece.hp);

    // And it leaves the list the tick it is gone, exactly as the boss does.
    state.setPiece = null;
    expect(stormTargets(state).map((target) => target.id)).toEqual([
      mob.id,
      boss.id,
    ]);
  });

  it('reads the source travelling at the fall the source actually takes', () => {
    // A line aiming ahead of a travelling body reads its velocity off the seam,
    // so what the seam answers and what the source does have to be one number.
    // The source rides the ground at the field's own scroll (Mark's ruling of
    // 2026-09-08, after ground adjustment 1), and a lead built on half of that
    // would aim where the mouth used to be. It is read off the source's own
    // fall rather than off a row, so the two cannot drift apart.
    const state = createRun(SEED);
    const piece = placeSetPiece(state);
    piece.open = true;
    const stood = piece.y;
    advanceSetPiece(state);
    const fell = piece.y - stood;

    expect(fell).toBeGreaterThan(0);
    expect(stormTargets(state)[0].vy).toBeCloseTo(fell, 10);
  });

  it('carries damage to an open source and moves it for nobody', () => {
    // The other half of the seam's contract for a target of a third kind: a
    // line damages it without learning what it is, and a push does nothing at
    // all rather than moving an authored moment out of its own place.
    const state = createRun(SEED);
    const piece = placeSetPiece(state);
    piece.open = true;
    const target = stormTargets(state)[0];
    const stood = { x: piece.x, y: piece.y };

    expect(damageStormTarget(state, target, 40, 'skullStream')).toHaveLength(1);
    expect(piece.hp).toBe(SET_PIECE_HP - 40);

    moveStormTarget(state, target, piece.x + 90, piece.y + 90);
    expect(`${piece.x} ${piece.y}`).toBe(`${stood.x} ${stood.y}`);

    // Emptied, it leaves the field and the list with it, which is the kill the
    // seam carries rather than one it decides.
    expect(
      damageStormTarget(state, target, piece.hp, 'skullStream').length,
    ).toBeGreaterThan(1);
    expect(state.setPiece).toBeNull();
  });

  it('drops each on the tick it stops being live', () => {
    // The list is answered for the moment it is asked. A dead mob and a boss
    // whose last chunk emptied are both gone from it, and a line asking again
    // in the same tick sees what is really there.
    const state = createRun(SEED);
    const mob = putMob(state, 100, 200);
    const boss = spawnBoss(state, 'undertaker');
    expect(stormTargets(state)).toHaveLength(2);

    mob.alive = false;
    expect(stormTargets(state).map((target) => target.id)).toEqual([boss.id]);

    state.boss = null;
    expect(stormTargets(state)).toEqual([]);
  });

  it('answers for one id, and answers null once that thing is gone', () => {
    // The wisps hold their target by id across ticks, so the seam has to be
    // able to say that the thing a wisp was flying at is no longer there.
    const state = createRun(SEED);
    const mob = putMob(state, 100, 200);

    expect(stormTarget(state, mob.id)?.id).toBe(mob.id);
    expect(stormTarget(state, mob.id + 500)).toBeNull();

    mob.alive = false;
    expect(stormTarget(state, mob.id)).toBeNull();
  });

  it('reads a mob as pushable and killable outright, and a boss as neither', () => {
    // The two flags are the whole of what a line needs to know, and they are
    // stated as properties of the target rather than as a kind, so a line asks
    // what it may do rather than what it is holding (ADR 0007).
    const state = createRun(SEED);
    const mob = putMob(state, 100, 200);
    const boss = spawnBoss(state, 'banshee');

    const [asMob, asBoss] = stormTargets(state);
    expect(asMob.id).toBe(mob.id);
    expect(asMob.pushable).toBe(true);
    expect(asMob.killableOutright).toBe(true);
    expect(asMob.hp).toBe(MOB_TYPES.shambler.hp);

    expect(asBoss.id).toBe(boss.id);
    expect(asBoss.pushable).toBe(false);
    expect(asBoss.killableOutright).toBe(false);
    expect(asBoss.entered).toBe(true);
  });

  it('says a mob above the top edge has not entered, which is the belch scope limit', () => {
    // ADR 0008's older scope limit: reaching past the edge would silently
    // delete authored content a player never saw arrive.
    const state = createRun(SEED);
    putMob(state, 100, -MOB_TYPES.shambler.halfHeight - 1);

    expect(stormTargets(state)[0].entered).toBe(false);
  });
});

describe('what a line may do to a target', () => {
  it('carries damage to whatever the target stands for, mob or boss', () => {
    // The damage is asked of the target rather than decided by the line, which
    // is the whole of the seam: the kill, the corpse and the chunk break are
    // the owning module's business and come back as events.
    const state = createRun(SEED);
    const mob = putMob(state, 100, 200);
    const boss = spawnBoss(state, 'banshee');
    const [asMob, asBoss] = stormTargets(state);

    const onMob = damageStormTarget(state, asMob, 5, 'skullStream');
    expect(onMob[0]).toEqual({
      type: 'mobDamaged',
      id: mob.id,
      amount: 5,
      source: 'skullStream',
    });
    expect(mob.hp).toBe(MOB_TYPES.shambler.hp - 5);

    const onBoss = damageStormTarget(state, asBoss, 7, 'bell');
    expect(onBoss[0]).toEqual({
      type: 'mobDamaged',
      id: boss.id,
      amount: 7,
      source: 'bell',
    });
    expect(boss.hp).toBeLessThan(asBoss.hp);
  });

  it('takes nothing and reports nothing for a target that has already gone', () => {
    // An ordinary outcome rather than an anomaly: one line's pass can kill a
    // target another line is still walking, and a line that had to check would
    // be a line branching on the seam's own bookkeeping.
    const state = createRun(SEED);
    const mob = putMob(state, 100, 200);
    const [target] = stormTargets(state);
    mob.alive = false;
    stormTargets(state);

    expect(damageStormTarget(state, target, 5, 'skullStream')).toEqual([]);
  });

  it('moves a pushable target and leaves an unpushable one where it stands', () => {
    // The caller never branches on what it hit: it asks for the move and reads
    // the displacement back off the target, so a boss that does not move
    // reports no shove at all rather than a shove of zero (ADR 0007).
    const state = createRun(SEED);
    const mob = putMob(state, 100, 200);
    const boss = spawnBoss(state, 'banshee');
    const [asMob, asBoss] = stormTargets(state);
    const bossStood = { x: boss.x, y: boss.y };

    moveStormTarget(state, asMob, 130, 240);
    expect(mob.x).toBe(130);
    expect(mob.y).toBe(240);
    expect(asMob.x).toBe(130);
    expect(asMob.y).toBe(240);

    moveStormTarget(state, asBoss, 400, 400);
    expect(boss.x).toBe(bossStood.x);
    expect(boss.y).toBe(bossStood.y);
    expect(asBoss.x).toBe(bossStood.x);
  });

  it("carries the target's box with the move, so a second test reads where it now is", () => {
    // A pass that pushes and then tests overlap again would otherwise read the
    // body where it stood when the list was filled, which is one displacement
    // behind: Territory's control moves a body under one patch and then asks
    // the next patch whether it is over that one.
    const state = createRun(SEED);
    putMob(state, 100, 200);
    const [target] = stormTargets(state);
    const stood = target.box.x;

    moveStormTarget(state, target, 130, 200);

    expect(target.box.x).toBe(stood + 30);
    expect(target.box.width).toBe(MOB_TYPES.shambler.halfWidth * 2);
  });

  it('holds a push inside the field it may stand in', () => {
    // The bounds are the seam's rather than the line's, so no weapon can push
    // a body out of the box the invariant harness checks and make the harness
    // fire on a legal move.
    const state = createRun(SEED);
    const mob = putMob(state, 100, 200);
    const [target] = stormTargets(state);

    moveStormTarget(state, target, 100000, 100000);

    expect(Number.isFinite(mob.x)).toBe(true);
    expect(mob.x).toBeLessThan(100000);
    expect(mob.y).toBeLessThan(100000);
  });
});
