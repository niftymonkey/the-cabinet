/**
 * The boss machine (ADR 0007, ADR 0052): chunked health, the invincible flash
 * between chunks, the food a break sheds, and what the storm may and may not do
 * to a body whose health is bought in pieces.
 *
 * The patterns themselves are not here. banshee.ts owns the tear-rings and
 * undertaker.ts the curtains and the spiral, and each carries its own tests;
 * what is here is the machine every boss stands on.
 */

import { describe, expect, it } from 'vitest';

import { BELCH_CHUNK_DAMAGE, fireBelch } from '../../belch';
import type { SimEvent } from '../../events';
import {
  advanceBell,
  BELL_DAMAGE_FAR,
  BELL_DAMAGE_NEAR,
} from '../../lines/bell';
import { SKULL_DAMAGE } from '../../lines/skullStream';
import type { Mob } from '../../mobs';
import { cullMobs, MOB_TYPES, spawnMob } from '../../mobs';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { PHASES } from '../../stage/stage';
import { resolveStorm } from '../../storm';
import { FIELD_HEIGHT } from '../../field';
import { RESERVOIR_CAPACITY } from '../../tuning';
import type { Boss } from '../chunks';
import {
  advanceBoss,
  BOSS_ARRIVAL_Y,
  bossHitbox,
  CHUNK_FLASH_TICKS,
  CHUNK_HP,
  damageBoss,
  spawnBoss,
} from '../chunks';

/** Narrows a possibly-absent value, or fails loudly when the absence is a bug. */
function requireDefined<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

/** The one item this file only ever asks about right after asserting a length of one. */
function firstOf<T>(items: readonly T[]): T {
  return requireDefined(items[0], 'no first item');
}

const SEED = 20260908;

/** A run with nothing else on the field, which is what a boss phase hands over. */
function emptyRun(seed = SEED): RunState {
  return createRun(seed);
}

/** The boss standing alone, and the run it stands in. */
function fighting(kind: Boss['kind'] = 'undertaker'): {
  state: RunState;
  boss: Boss;
} {
  const state = emptyRun();
  return { state, boss: spawnBoss(state, kind) };
}

/** Every event of a kind a call reported, in order. */
function only<T extends SimEvent['type']>(
  events: readonly SimEvent[],
  type: T,
): Extract<SimEvent, { type: T }>[] {
  return events.filter(
    (event): event is Extract<SimEvent, { type: T }> => event.type === type,
  );
}

/**
 * The whole fight, damaged to death a chunk at a time, with the flash counted
 * down between chunks the way a tick does it.
 */
function fightToDeath(state: RunState, boss: Boss): SimEvent[] {
  const events: SimEvent[] = [];
  for (let chunk = 0; chunk < CHUNK_HP[boss.kind].length; chunk++) {
    events.push(...damageBoss(state, boss.hp, 'skullStream'));
    for (let tick = 0; tick < CHUNK_FLASH_TICKS; tick++) advanceBoss(state);
  }
  return events;
}

/** A skull sitting exactly on a point, so the storm's pass meets what is there. */
function skullAt(state: RunState, x: number, y: number): void {
  const skull = requireDefined(state.skulls[0], 'no skull pool slot 0');
  skull.alive = true;
  skull.id = 900;
  skull.x = x;
  skull.y = y;
  skull.vx = 0;
  skull.vy = 0;
}

/**
 * One whole toll, from the tick it is armed to the tick its cones reach full,
 * with every event it dealt on the way.
 *
 * The edge only ever grows, so a body is struck on the tick the edge first
 * reaches it and a toll read at one tick has reached almost nothing.
 */
function tollThrough(state: RunState, level: number): SimEvent[] {
  state.levels.bell = level;
  state.lines.tollIn = 1;
  const events = [...advanceBell(state)];
  while (state.lines.ring !== null) events.push(...advanceBell(state));
  return events;
}

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

describe('a boss arrives with chunked health (ADR 0007)', () => {
  it('arrives alone on a phase boundary, with one authored pattern per chunk', () => {
    // ADR 0007's first sentence: "Bosses arrive alone on a phase boundary with
    // chunked health, one authored pattern per chunk". The chunk count is the
    // length of the boss's own health row, so what the fight runs and what it
    // is worth cannot come apart, and ADR 0052's "it gets there across three
    // chunks rather than across a bigger health bar" is the row's shape rather
    // than a number written somewhere else.
    const bossPhases = PHASES.filter((each) => each.boss !== null);
    expect(bossPhases.map((each) => each.boss)).toEqual([
      'banshee',
      'undertaker',
    ]);

    for (const phase of bossPhases) {
      const kind = phase.boss!;
      const { state, boss } = fighting(kind);
      expect(state.mobs.filter((mob) => mob.alive)).toEqual([]);
      expect(boss.kind).toBe(kind);
      expect(boss.chunk).toBe(0);
      expect(boss.hp).toBe(CHUNK_HP[kind][0]);
      expect(CHUNK_HP[kind].length).toBeGreaterThanOrEqual(2);
      expect(state.boss).toBe(boss);
    }
  });

  it('stands at the top of the field, with the whole field between it and the grave', () => {
    // A boss the grave already overlaps on arrival would take its first chunk
    // before the player had read the pattern, and ADR 0007's own reason for a
    // boss is that the storm must always matter rather than that it must
    // always reach.
    const { state, boss } = fighting();
    expect(boss.y).toBe(BOSS_ARRIVAL_Y);
    expect(boss.y).toBeLessThan(state.grave.y);
    expect(bossHitbox(boss).y).toBeGreaterThanOrEqual(0);
    expect(bossHitbox(boss).y + bossHitbox(boss).height).toBeLessThan(
      FIELD_HEIGHT,
    );
  });
});

describe('the flash between chunks (ADR 0007)', () => {
  it('separates the chunks, and player shots do nothing while it burns', () => {
    // ADR 0007: "a short invincible flash at chunk breaks". The flash is what
    // makes a chunk a beat rather than a health bar with a line drawn on it,
    // and a shot that landed through it would delete the beat.
    const { state, boss } = fighting();
    damageBoss(state, boss.hp, 'skullStream');

    expect(boss.chunk).toBe(1);
    expect(boss.flash).toBe(CHUNK_FLASH_TICKS);

    const standing = boss.hp;
    damageBoss(state, 500, 'skullStream');
    expect(boss.hp).toBe(standing);

    for (let tick = 0; tick < CHUNK_FLASH_TICKS; tick++) advanceBoss(state);
    expect(boss.flash).toBe(0);
    damageBoss(state, 500, 'skullStream');
    expect(boss.hp).toBe(standing - 500);
  });

  it('reports a shot that landed on the flash, with nothing applied', () => {
    // The storm is still working and an instrument reading damage by line has
    // to see the shots that landed on an invincible body, or the record goes
    // quiet exactly where the player is hitting hardest.
    const { state, boss } = fighting();
    damageBoss(state, boss.hp, 'skullStream');

    const blocked = only(damageBoss(state, 500, 'bell'), 'mobDamaged');
    expect(blocked).toHaveLength(1);
    expect(firstOf(blocked).id).toBe(boss.id);
    expect(firstOf(blocked).amount).toBe(0);
    expect(firstOf(blocked).source).toBe('bell');
  });

  it('cannot be killed while the flash burns, however much lands on it', () => {
    // The last chunk is the one this matters on: a killing blow that landed
    // through the flash would end the fight on a beat the player was never
    // given, and the flash is invincibility rather than a damage reduction.
    const { state, boss } = fighting('banshee');
    damageBoss(state, boss.hp, 'skullStream');
    damageBoss(
      state,
      requireDefined(CHUNK_HP.banshee[1], 'no chunk 1 for banshee') * 10,
      'skullStream',
    );

    expect(state.boss).toBe(boss);
    expect(boss.hp).toBe(
      requireDefined(CHUNK_HP.banshee[1], 'no chunk 1 for banshee'),
    );
  });

  it('holds the pattern clock still through the flash, so a chunk begins at its own start', () => {
    // A chunk whose pattern ran while the player could not touch it would open
    // part-way through its own first cycle, which is the beat arriving late.
    const { state, boss } = fighting();
    damageBoss(state, boss.hp, 'skullStream');
    expect(boss.patternTick).toBe(0);

    for (let tick = 0; tick < CHUNK_FLASH_TICKS; tick++) advanceBoss(state);
    expect(boss.patternTick).toBe(0);

    advanceBoss(state);
    expect(boss.patternTick).toBe(1);
  });
});

describe('the storm always matters (ADR 0007)', () => {
  it('damages the boss in every chunk, so no chunk is pure dodging', () => {
    // ADR 0007: "there are no pure-dodge survival phases anywhere in v1,
    // because the player's storm must always matter". It is asserted through
    // the storm's own pass rather than by calling the boss's damage directly,
    // because the thing that could fail is a weapon line walking past a body
    // that is not in the mob pool.
    const { state, boss } = fighting();

    for (let chunk = 0; chunk < CHUNK_HP.undertaker.length; chunk++) {
      expect(boss.chunk).toBe(chunk);
      skullAt(state, boss.x, boss.y);
      const landed = only(resolveStorm(state), 'mobDamaged').filter(
        (event) => event.id === boss.id,
      );
      expect(landed, `chunk ${chunk}`).toHaveLength(1);
      expect(firstOf(landed).amount).toBe(SKULL_DAMAGE);
      expect(
        requireDefined(state.skulls[0], 'no skull pool slot 0').alive,
      ).toBe(false);

      if (chunk === CHUNK_HP.undertaker.length - 1) break;
      damageBoss(state, boss.hp, 'skullStream');
      for (let tick = 0; tick < CHUNK_FLASH_TICKS; tick++) advanceBoss(state);
    }
  });

  it('takes the bell full damage at its own distance from the grave', () => {
    // The damage half of ADR 0007's "Bosses take full bell damage but no
    // pushback". A mob and the boss standing on the same point take the same
    // number, so the seam carries a line's damage to a target it does not know
    // the kind of.
    const { state, boss } = fighting();
    const standing = { x: state.grave.x, y: state.grave.y - 60 };
    boss.x = standing.x;
    boss.y = standing.y;
    const mob = putMob(state, standing.x, standing.y);

    const struck = only(tollThrough(state, 1), 'mobDamaged');

    const onBoss = struck.filter((event) => event.id === boss.id);
    const onMob = struck.filter((event) => event.id === mob.id);
    expect(onBoss).toHaveLength(1);
    expect(onMob).toHaveLength(1);
    // The same point, so the same number: full damage means the toll's own
    // falloff and never a share of it.
    expect(firstOf(onBoss).amount).toBe(firstOf(onMob).amount);
    expect(firstOf(onBoss).amount).toBeGreaterThan(BELL_DAMAGE_FAR);
    expect(firstOf(onBoss).amount).toBeLessThanOrEqual(BELL_DAMAGE_NEAR);
  });

  it('takes no bell pushback, while its adds are pushed by the same ring', () => {
    // The push half of the same sentence, split out from the damage half: one
    // test asserting both passes when either is right. The same ring in the
    // same tick has to move the add and leave the boss where it stands, which
    // is what "so authored patterns never smear" means.
    const { state, boss } = fighting();
    const standing = { x: state.grave.x, y: state.grave.y - 60 };
    boss.x = standing.x;
    boss.y = standing.y;
    const add = putMob(state, standing.x, standing.y);
    const addStoodY = add.y;

    const tolled = tollThrough(state, 1);
    const shoved = only(tolled, 'mobShoved');

    // The ring reached the boss, which is what makes "it was not shoved" a
    // statement about the boss rather than about an empty field: a boss the
    // toll never touched would pass this test standing anywhere.
    expect(only(tolled, 'mobDamaged').map((event) => event.id)).toContain(
      boss.id,
    );
    expect(shoved.map((event) => event.id)).toEqual([add.id]);
    expect(add.y).not.toBe(addStoodY);
    expect(boss.x).toBe(standing.x);
    expect(boss.y).toBe(standing.y);
  });

  it("passes over the belch's kill rule, which is a rule and not a number", () => {
    // The burst kills what it reaches outright, and a kill rule applied to a
    // body whose health is one chunk of several would break a chunk for one
    // press, which is a skip rather than the breath the belch buys. So the same
    // press that deletes the add beside it leaves the boss standing on the same
    // chunk it was on.
    const { state, boss } = fighting();
    boss.x = state.grave.x;
    boss.y = state.grave.y;
    const add = putMob(state, state.grave.x, state.grave.y);
    state.reservoir = RESERVOIR_CAPACITY;

    const belched = only(fireBelch(state), 'belched');

    // One killed, and it is the add: the count on the event is bodies killed,
    // so a boss that took damage is not among them.
    expect(firstOf(belched).killed).toBe(1);
    expect(add.alive).toBe(false);
    expect(state.boss).toBe(boss);
    expect(boss.chunk).toBe(0);
    expect(boss.hp).toBeGreaterThan(0);
  });

  it('takes its own chunk of boss damage from a boss inside the burst, and none from one outside it', () => {
    // ADR 0008: the burst "deals its big chunk of boss damage only when the
    // boss is inside that radius, and never pushes a boss". The amount is a row
    // rather than the kill rule, because the kill rule would break a chunk for
    // one press; the row is what makes a belch spent in a fight worth spending
    // rather than only a breath.
    const near = fighting();
    near.boss.x = near.state.grave.x;
    near.boss.y = near.state.grave.y;
    const stoodAt = { x: near.boss.x, y: near.boss.y };
    near.state.reservoir = RESERVOIR_CAPACITY;

    const landed = only(fireBelch(near.state), 'mobDamaged').filter(
      (event) => event.id === near.boss.id,
    );
    expect(landed).toHaveLength(1);
    expect(firstOf(landed).amount).toBe(BELCH_CHUNK_DAMAGE);
    expect(firstOf(landed).source).toBe('belch');
    expect(near.boss.hp).toBe(
      requireDefined(CHUNK_HP.undertaker[0], 'no chunk 0 for undertaker') -
        BELCH_CHUNK_DAMAGE,
    );
    // Never pushed, which is the other half of the same sentence and the reason
    // authored patterns do not smear.
    expect(near.boss.x).toBe(stoodAt.x);
    expect(near.boss.y).toBe(stoodAt.y);

    // And only when it is inside: a boss at its own arrival point, the whole
    // field away from the grave, takes nothing at all from the same press.
    const far = fighting();
    far.state.reservoir = RESERVOIR_CAPACITY;
    const missed = only(fireBelch(far.state), 'mobDamaged');
    expect(missed).toEqual([]);
    expect(far.boss.hp).toBe(
      requireDefined(CHUNK_HP.undertaker[0], 'no chunk 0 for undertaker'),
    );

    // One press never breaks a fresh chunk, whatever the row is retuned to,
    // which is what keeps a chunk's own emit out of the belch's reach.
    expect(BELCH_CHUNK_DAMAGE).toBeLessThan(
      Math.min(...Object.values(CHUNK_HP).map((row) => Math.min(...row))),
    );
  });
});

describe('what a boss sheds (ADR 0007, ADR 0004)', () => {
  it('breaks each chunk exactly once, and reports which chunk is live', () => {
    // A break reported twice would pay the feast twice and move the fight's
    // own clock, and a break reported for a chunk that never emptied would put
    // a pattern on the field with no health behind it.
    const { state, boss } = fighting();
    const broke = only(fightToDeath(state, boss), 'chunkBroke');

    expect(broke.map((event) => event.chunk)).toEqual([1, 2]);
    expect(broke.every((event) => event.boss === 'undertaker')).toBe(true);
  });

  it('sheds food throughout the fight, and never only at the end of it', () => {
    // ADR 0007: "Bosses shed food throughout the fight, so the swallow economy
    // never goes dark at the climax". What the machine sheds is the break's
    // own feast, so food lands on every break rather than once on the death.
    const { state, boss } = fighting();
    const before = state.corpses.filter((corpse) => corpse.alive).length;
    expect(before).toBe(0);

    const fed: number[] = [];
    for (let chunk = 0; chunk < CHUNK_HP.undertaker.length; chunk++) {
      damageBoss(state, boss.hp, 'skullStream');
      fed.push(state.corpses.filter((corpse) => corpse.alive).length);
      for (let tick = 0; tick < CHUNK_FLASH_TICKS; tick++) advanceBoss(state);
    }

    // One more piece of food on the field after each of the two breaks, and
    // nothing new on the death: what the death sheds is the boss's own module's.
    expect(fed).toEqual([1, 2, 2]);
  });

  it('sheds a feast that never decays, exactly like an upgrade drop', () => {
    // game-concept.md under ADR 0004: "the feast chunk dropped at each chunk
    // break never decays, exactly like an upgrade drop". A break's reward that
    // rotted would punish a player for not being able to dive through the
    // pattern that was still running.
    const { state, boss } = fighting();
    damageBoss(state, boss.hp, 'skullStream');

    const shed = state.corpses.filter((corpse) => corpse.alive);
    expect(shed).toHaveLength(1);
    expect(firstOf(shed).kind).toBe('feast');
    expect(firstOf(shed).decays).toBe(false);
    expect(firstOf(shed).freshness).toBe(1);
    expect(firstOf(shed).x).toBe(boss.x);
    expect(firstOf(shed).y).toBe(boss.y);
  });

  it('leaves the field on its last chunk, reporting where it fell', () => {
    // The death is what victory fires on rather than a phase index, and where
    // the body fell is what a death's own reward is placed at, so the event
    // carries the point and never a reference to a record that is already gone.
    const { state, boss } = fighting('banshee');
    const killed = only(fightToDeath(state, boss), 'bossKilled');

    expect(killed).toHaveLength(1);
    expect(firstOf(killed).boss).toBe('banshee');
    expect(firstOf(killed).x).toBe(boss.x);
    expect(firstOf(killed).y).toBe(boss.y);
    expect(state.boss).toBeNull();
  });
});

describe("a boss's adds (CONTEXT.md, ADR 0016)", () => {
  it('are ordinary members of the mob pool, culled by the ordinary rule', () => {
    // CONTEXT.md: "Adds are trash: normal pushback, normal corpses". A summoned
    // body is spawnMob at a point of the boss's choosing and nothing more, so
    // there is no new mob type, no second pool and no second cull, and the mob
    // cap already covers what a fight can put on the field.
    const { state, boss } = fighting();
    const add = putMob(state, boss.x, boss.y + 20);

    expect(state.mobs).toContain(add);
    expect(add.type).toBe('shambler');
    expect(add.hp).toBe(MOB_TYPES.shambler.hp);

    add.y = FIELD_HEIGHT + MOB_TYPES.shambler.halfHeight + 1;
    const culled = only(cullMobs(state), 'carrierLost');

    expect(add.alive).toBe(false);
    // It carried nothing, so its leaving is silent: that is density the player
    // never met rather than power they missed.
    expect(culled).toEqual([]);
  });
});
