/**
 * Territory: the ground a swallow claims ahead of the grave.
 *
 * The planned list for #76, pinned before implementation. Each name is the
 * promise in plain words; the ruling behind it lives inside the test.
 */

import { describe, expect, it } from 'vitest';

import { TERRITORY_CAP } from '../../caps';
import type { SimEvent } from '../../events';
import { FIELD_HEIGHT } from '../../field';
import type { Mob } from '../../mobs';
import { MOB_TYPES, spawnMob } from '../../mobs';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { RAMP_ROWS } from '../../stage/stage';
import { swallow } from '../../swallow';
import type { Swallowable } from '../../swallow';
import { FRESHNESS_PAYOUT_FLOOR, SCROLL_SPEED } from '../../tuning';
import { MAX_LEVEL } from '../roster';
import {
  advanceTerritory,
  BITES_BY_LEVEL,
  patchAt,
  resolveTerritory,
  territoryCount,
  TERRITORY_DAMAGE,
  TERRITORY_FULL_RADIUS,
  TERRITORY_OFFSET,
  TERRITORY_OPENING_TICKS,
} from '../territory';

const FRESH_CORPSE: Swallowable = {
  kind: 'corpse',
  freshness: 1,
  payout: 0.1,
};

/**
 * A run with Territory owned and nothing else moving: the stage is marked fired
 * and the stream's clock is held off, so the only thing that ever damages a mob
 * in these tests is Territory itself.
 */
function armedRun(seed = 76): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  run.lines.streamIn = Number.MAX_SAFE_INTEGER;
  run.levels.territory = 1;
  return run;
}

function livePatches(state: RunState) {
  return state.patches.filter((patch) => patch.alive);
}

/** A live mob of a stated type, past its arriving beat. */
function putMob(state: RunState, x: number, y: number): Mob {
  const mob = spawnMob(state, 'shambler', { x, y, vx: 0, vy: 0, index: 0 })!;
  mob.beat = 0;
  return mob;
}

/** Runs the patch's opening beat down without moving anything else. */
function openTheHands(state: RunState): void {
  for (const patch of state.patches) if (patch.alive) patch.opening = 0;
}

/** Every mob the tick's events damaged, by id. */
function damagedIds(events: readonly SimEvent[]): number[] {
  const ids: number[] = [];
  for (const event of events) {
    if (event.type === 'mobDamaged') ids.push(event.id);
  }
  return ids;
}

/** A swallow laid at a chosen place, so a test can put ground where it wants it. */
function claimAt(state: RunState, x: number, y: number, freshness = 1): void {
  state.grave.x = x;
  state.grave.y = y + TERRITORY_OFFSET;
  swallow(state, { ...FRESH_CORPSE, freshness });
}

describe('a patch on the field', () => {
  it('a swallow lays exactly one patch', () => {
    // Nothing buys count: freshness buys area and level buys the bite budget,
    // and patches-per-swallow was rejected as a level channel, so the count is
    // the constant one.
    const run = armedRun();
    swallow(run, FRESH_CORPSE);
    expect(territoryCount(run)).toBe(1);
    swallow(run, FRESH_CORPSE);
    expect(territoryCount(run)).toBe(2);
  });

  it('a patch lands the placement distance straight above the grave, at the grave’s own x', () => {
    // The player's position at swallow time is the whole placement input:
    // no aim axis, and the offset is fixed at every vertical position.
    const run = armedRun();
    run.grave.x = 137;
    run.grave.y = 500;
    swallow(run, FRESH_CORPSE);
    const patch = patchAt(run, 0)!;
    expect(patch.x).toBe(137);
    expect(patch.y).toBe(500 - TERRITORY_OFFSET);
  });

  it('a patch moves down with the world at the scroll speed, and its x never changes', () => {
    // World-anchored and not screen-anchored: a mob closes on the patch at only
    // its own speed, so dwell time comes free out of the field's own motion.
    const run = armedRun();
    run.grave.x = 200;
    run.grave.y = 400;
    swallow(run, FRESH_CORPSE);
    const patch = patchAt(run, 0)!;
    const startY = patch.y;
    advanceTerritory(run);
    advanceTerritory(run);
    expect(patch.x).toBe(200);
    expect(patch.y).toBeCloseTo(startY + 2 * SCROLL_SPEED, 9);
  });

  it('a patch placed above the top edge still exists there and scrolls into view', () => {
    // Off-field is never clamped and never suppressed: the patch exists at that
    // world position immediately and scrolls in. Visibility is not an
    // activation condition.
    const run = armedRun();
    run.grave.y = run.grave.size;
    swallow(run, FRESH_CORPSE);
    const patch = patchAt(run, 0)!;
    expect(patch.y).toBeLessThan(0);
    for (let tick = 0; tick < 400; tick++) advanceTerritory(run);
    expect(patch.alive).toBe(true);
    expect(patch.y).toBeGreaterThan(0);
  });

  it('a patch that scrolls fully off the bottom is removed with its budget unspent', () => {
    // The world scroll owns a patch's natural lifetime; there is no timer.
    const run = armedRun();
    run.grave.y = 400;
    swallow(run, FRESH_CORPSE);
    const patch = patchAt(run, 0)!;
    const budget = patch.bites;
    let closings: string[] = [];
    for (let tick = 0; tick < 4000 && livePatches(run).length > 0; tick++) {
      closings = advanceTerritory(run)
        .filter((event) => event.type === 'patchClosed')
        .map((event) => (event.type === 'patchClosed' ? event.reason : ''));
    }
    expect(patch.y).toBeGreaterThan(FIELD_HEIGHT);
    expect(territoryCount(run)).toBe(0);
    expect(closings).toEqual(['scrolled']);
    expect(budget).toBeGreaterThan(0);
  });
});

describe('the hands', () => {
  it('a patch cannot damage anything during its opening beat', () => {
    // The beat is what keeps Territory from collapsing into a placed
    // detonation when a swallow happens under a dense group, so activation is
    // never immediate.
    const run = armedRun();
    claimAt(run, 200, 300);
    const mob = putMob(run, 200, 300);
    const patch = patchAt(run, 0)!;

    const beat = patch.opening;
    expect(beat).toBeGreaterThan(0);
    for (let tick = 0; tick < beat; tick++) {
      expect(resolveTerritory(run)).toEqual([]);
      patch.opening -= 1;
    }
    expect(mob.hp).toBe(MOB_TYPES.shambler.hp);
    expect(damagedIds(resolveTerritory(run))).toEqual([mob.id]);
  });

  it('a patch’s opening beat advances while it is off-field', () => {
    // Off-field is not inactive: the beat runs in world time, so a patch is
    // already open when it scrolls in. Visibility is never an activation
    // condition.
    const run = armedRun();
    run.grave.y = run.grave.size;
    swallow(run, FRESH_CORPSE);
    const patch = patchAt(run, 0)!;
    expect(patch.y).toBeLessThan(0);

    for (let tick = 0; tick < TERRITORY_OPENING_TICKS; tick++) {
      advanceTerritory(run);
    }
    expect(patch.opening).toBe(0);
    expect(patch.y).toBeLessThan(0);
  });

  it('after the beat, a mob already standing inside the patch is bitten', () => {
    // Territory never asks a mob to cross the boundary after activation: if the
    // hands are up and a mob is in them, that mob is eligible.
    const run = armedRun();
    claimAt(run, 200, 300);
    const mob = putMob(run, 200, 300);
    openTheHands(run);

    expect(damagedIds(resolveTerritory(run))).toEqual([mob.id]);
    expect(mob.hp).toBe(MOB_TYPES.shambler.hp - TERRITORY_DAMAGE);
  });

  it('a mob is bitten at most once by the same patch, however long it stays inside', () => {
    // One bite per patch per mob, held by the patch's own struck set. There is
    // no per-tick dwell damage and no per-mob cooldown.
    const run = armedRun();
    claimAt(run, 200, 300);
    const mob = putMob(run, 200, 300);
    openTheHands(run);

    resolveTerritory(run);
    const after = mob.hp;
    for (let again = 0; again < 10; again++) resolveTerritory(run);
    expect(mob.hp).toBe(after);
  });

  it('the same mob is bitten again by a different patch', () => {
    // Each patch owns its own struck set, so a mob that has been taken by one
    // piece of claimed ground is still fair game for the next.
    const run = armedRun();
    claimAt(run, 200, 300);
    const mob = putMob(run, 200, 300);
    openTheHands(run);
    resolveTerritory(run);
    const afterFirst = mob.hp;

    claimAt(run, 200, 300);
    openTheHands(run);
    resolveTerritory(run);
    expect(mob.hp).toBe(afterFirst - TERRITORY_DAMAGE);
  });

  it('a patch is removed the tick it has bitten its budget’s worth of distinct mobs', () => {
    // A spent patch closes and goes immediately: no inert ground is left
    // behind, and it stops holding one of the cap's slots.
    const run = armedRun();
    run.levels.territory = 1;
    claimAt(run, 200, 300);
    const budget = patchAt(run, 0)!.bites;
    for (let made = 0; made < budget; made++) {
      putMob(run, 200 + made * 4, 300);
    }
    openTheHands(run);

    const closings = resolveTerritory(run).filter(
      (event) => event.type === 'patchClosed',
    );
    expect(closings).toHaveLength(1);
    expect(closings[0]).toMatchObject({ reason: 'spent', bitten: budget });
    expect(territoryCount(run)).toBe(0);
  });

  it('a mob whose centre is outside the radius but whose body overlaps is bitten', () => {
    // The mob's body and never its centre point. The visible patch is the
    // ground it claims, so a mob standing in the hands must not be immune
    // because its centre sits a unit outside the rim.
    const run = armedRun();
    claimAt(run, 200, 300);
    const patch = patchAt(run, 0)!;
    const halfWidth = MOB_TYPES.shambler.halfWidth;
    // Just outside the rim by its centre, and overlapping it by its body.
    const mob = putMob(run, 200 + patch.radius + halfWidth / 2, 300);
    openTheHands(run);

    const centreDistance = Math.abs(mob.x - patch.x);
    expect(centreDistance).toBeGreaterThan(patch.radius);
    expect(damagedIds(resolveTerritory(run))).toEqual([mob.id]);
  });
});

describe('the economy', () => {
  it('a new swallow at the cap evicts the oldest live patch and not any other', () => {
    // The cap is housekeeping, never a refusal: old trailing ground has
    // stopped contributing by the time it is taken, so the new claim is worth
    // more than the one it displaces. Oldest by id and never by slot.
    const run = armedRun();
    const laid = [];
    for (let claim = 0; claim < TERRITORY_CAP; claim++) {
      claimAt(run, 100 + claim, 300);
      laid.push(patchAt(run, claim)!.id);
    }
    expect(territoryCount(run)).toBe(TERRITORY_CAP);

    const events = swallow(run, FRESH_CORPSE);
    const evicted = events.filter((event) => event.type === 'patchClosed');
    expect(evicted).toHaveLength(1);
    expect(evicted[0]).toMatchObject({ reason: 'evicted' });
    expect(territoryCount(run)).toBe(TERRITORY_CAP);

    const stillLive = livePatches(run).map((patch) => patch.id);
    expect(stillLive).not.toContain(laid[0]);
    for (const id of laid.slice(1)) expect(stillLive).toContain(id);
  });

  it('a spent patch frees its slot, so it never counts against the cap', () => {
    // A patch that has used its budget closes immediately, and no inert ground
    // is left holding a slot the next claim needs.
    const run = armedRun();
    // Spread far enough apart that no two patches can reach the same mob, so
    // exactly one of them spends.
    for (let claim = 0; claim < TERRITORY_CAP; claim++) {
      claimAt(run, 270, -120 + claim * 100);
    }
    const spending = patchAt(run, 0)!;
    for (let made = 0; made < spending.bites; made++) {
      putMob(run, spending.x, spending.y);
    }
    openTheHands(run);
    resolveTerritory(run);
    expect(territoryCount(run)).toBe(TERRITORY_CAP - 1);

    const events = swallow(run, FRESH_CORPSE);
    expect(events.filter((event) => event.type === 'patchClosed')).toEqual([]);
    expect(territoryCount(run)).toBe(TERRITORY_CAP);
  });

  it('a swallow at the freshness floor claims a quarter of the area and half the radius', () => {
    // Freshness scales the claimed AREA and the radius is derived from it,
    // never multiplied by freshness directly. At ADR 0004's 0.25 floor that is
    // a quarter of the area and therefore half the radius.
    const run = armedRun();
    claimAt(run, 200, 300, 1);
    claimAt(run, 240, 300, FRESHNESS_PAYOUT_FLOOR);
    const fresh = patchAt(run, 0)!;
    const stale = patchAt(run, 1)!;

    expect(fresh.radius).toBeCloseTo(TERRITORY_FULL_RADIUS, 9);
    expect(stale.radius).toBeCloseTo(fresh.radius / 2, 9);
    const area = (radius: number) => Math.PI * radius * radius;
    expect(area(stale.radius) / area(fresh.radius)).toBeCloseTo(
      FRESHNESS_PAYOUT_FLOOR,
      9,
    );
  });

  it('a patch at the freshness floor still claims real ground, never zero', () => {
    // The floor exists so stale food is meaningfully weaker without being
    // worthless. Half a full radius still covers more than a shambler's body.
    const run = armedRun();
    claimAt(run, 200, 300, 0);
    const patch = patchAt(run, 0)!;

    expect(patch.radius).toBeGreaterThan(MOB_TYPES.shambler.halfWidth);
  });

  it('a patch captures the Territory level at creation, and a later level-up does not change its budget', () => {
    // Frozen at birth, on bell.ts's own precedent: a live ring keeps the level
    // it was born with, and level-ups reach only patches laid afterwards.
    const run = armedRun();
    run.levels.territory = 1;
    claimAt(run, 200, 300);
    const early = patchAt(run, 0)!;
    const born = early.bites;

    run.levels.territory = MAX_LEVEL;
    claimAt(run, 240, 300);
    const late = patchAt(run, 1)!;

    expect(born).toBe(BITES_BY_LEVEL[1]);
    expect(early.bites).toBe(born);
    expect(late.bites).toBe(BITES_BY_LEVEL[MAX_LEVEL]);
    expect(late.bites).toBeGreaterThan(born);
  });

  it('a patch captures freshness at creation, so a later swallow does not change its radius', () => {
    const run = armedRun();
    claimAt(run, 200, 300, 1);
    const first = patchAt(run, 0)!;
    const radius = first.radius;

    claimAt(run, 240, 300, FRESHNESS_PAYOUT_FLOOR);
    expect(first.radius).toBe(radius);
  });

  it('Territory fires on every food kind: corpse, drop and feast', () => {
    // swallow.ts treats all three the same for the on-swallow lines, and drops
    // and feasts never decay, so both lay a full-freshness patch.
    for (const kind of ['corpse', 'drop', 'feast'] as const) {
      const run = armedRun();
      swallow(run, { kind, freshness: 1, payout: 0.1 });
      expect(`${kind} ${territoryCount(run)}`).toBe(`${kind} 1`);
    }
  });

  it('a drop that levels Territory lays that same swallow’s patch at the new level', () => {
    // Shipped order rather than a fresh rule: payLevel runs before the
    // on-swallow lines, so the drop that raises the level pays out at it.
    const run = armedRun();
    run.levels.territory = 1;
    swallow(run, {
      kind: 'drop',
      freshness: 1,
      payout: 0.1,
      line: 'territory',
    });

    expect(run.levels.territory).toBe(2);
    expect(patchAt(run, 0)!.bites).toBe(BITES_BY_LEVEL[2]);
  });

  it('Territory never reads the mob list to choose where a patch goes', () => {
    // A deliberate-absence test, per code-core: it fails if targeting appears.
    // The player's position at swallow time is the whole placement input, so
    // the same grave lays the same ground whatever the field holds, and a mob
    // list that could move a patch would show up here as a moved patch.
    const empty = armedRun();
    empty.grave.x = 260;
    empty.grave.y = 500;
    swallow(empty, FRESH_CORPSE);
    const alone = patchAt(empty, 0)!;

    const crowded = armedRun();
    crowded.grave.x = 260;
    crowded.grave.y = 500;
    for (const [x, y] of [
      [60, 60],
      [480, 90],
      [120, 620],
      [300, 200],
      [40, 400],
    ]) {
      putMob(crowded, x, y);
    }
    swallow(crowded, FRESH_CORPSE);
    const among = patchAt(crowded, 0)!;

    expect(livePatches(crowded)).toHaveLength(1);
    expect(`${among.x},${among.y}`).toBe(`${alone.x},${alone.y}`);
    expect(among.radius).toBe(alone.radius);
  });
});
