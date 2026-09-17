/**
 * The boss machine (ADR 0007, ADR 0052): phased health, the invincible flash
 * between phases, the food a break sheds, and what the storm may and may not do
 * to a body whose health is bought in pieces.
 *
 * The patterns themselves are not here. banshee.ts owns the tear-rings and
 * undertaker.ts the curtains and the spiral, and each carries its own tests;
 * what is here is the machine every boss stands on.
 */

import { describe, expect, it } from 'vitest';

import { fireBelch } from '../../belch';
import type { SimEvent } from '../../events';
import { advanceBell, bellDamageFar, bellDamageNear } from '../../lines/bell';
import { skullDamage } from '../../lines/skullStream';
import type { Mob } from '../../mobs';
import { advanceMobs, cullMobs, MOB_TYPES, spawnMob } from '../../mobs';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { SHOVE_TICKS } from '../../shove';
import { SECTIONS } from '../../stage/stage';
import { resolveStorm } from '../../storm';
import { FIELD_HEIGHT } from '../../field';
import { RESERVOIR_CAPACITY, SCORE_PER_BOSS_HEALTH } from '../../tuning';
import type { Boss } from '../phases';
import {
  advanceBoss,
  BOSS_ARRIVAL_Y,
  bossHitbox,
  PHASE_FLASH_TICKS,
  PHASE_HP,
  damageBoss,
  spawnBoss,
} from '../phases';

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

/** A run with nothing else on the field, which is what a boss section hands over. */
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
 * The whole fight, damaged to death a phase at a time, with the flash counted
 * down between phases the way a tick does it.
 */
function fightToDeath(state: RunState, boss: Boss): SimEvent[] {
  const events: SimEvent[] = [];
  for (let phase = 0; phase < PHASE_HP[boss.kind].length; phase++) {
    events.push(...damageBoss(state, boss.hp, 'skullStream'));
    for (let tick = 0; tick < PHASE_FLASH_TICKS; tick++) advanceBoss(state);
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

/**
 * The same toll with the bodies advancing beside it, and a shove's own length
 * past the ring's end so every shove it started has finished travelling. A
 * shove is the body's own motion from the moment it lands (shove.ts), so a
 * push read off advanceBell alone would read an empty set.
 */
function tollAndTravelThrough(state: RunState, level: number): SimEvent[] {
  state.levels.bell = level;
  state.lines.tollIn = 1;
  const events: SimEvent[] = [];
  do {
    events.push(...advanceBell(state));
    events.push(...advanceMobs(state));
  } while (state.lines.ring !== null);
  for (let tick = 0; tick < SHOVE_TICKS; tick++) {
    events.push(...advanceBell(state));
    events.push(...advanceMobs(state));
  }
  return events;
}

/** A live mob past its arriving beat, standing where it is put. */
function putMob(state: RunState, x: number, y: number): Mob {
  const mob = spawnMob(
    state,
    'shambler',
    { x, y, vx: 0, vy: 0, index: 0 },
    false,
    'wave',
  );
  if (mob === null) throw new Error('the mob pool refused the fixture');
  mob.beat = 0;
  return mob;
}

describe('a boss arrives with phased health (ADR 0007)', () => {
  it('arrives alone on a section boundary, with one authored pattern per phase', () => {
    // ADR 0007's first sentence: "Bosses arrive alone on a section boundary with
    // phased health, one authored pattern per phase". The phase count is the
    // length of the boss's own health wave, so what the fight runs and what it
    // is worth cannot come apart, and ADR 0052's "it gets there across three
    // phases rather than across a bigger health bar" is the wave's shape rather
    // than a number written somewhere else.
    const bossSections = SECTIONS.filter((each) => each.boss !== null);
    expect(bossSections.map((each) => each.boss)).toEqual([
      'banshee',
      'undertaker',
    ]);

    for (const section of bossSections) {
      const kind = section.boss!;
      const { state, boss } = fighting(kind);
      expect(state.mobs.filter((mob) => mob.alive)).toEqual([]);
      expect(boss.kind).toBe(kind);
      expect(boss.phaseIndex).toBe(0);
      expect(boss.hp).toBe(PHASE_HP[kind][0]);
      expect(PHASE_HP[kind].length).toBeGreaterThanOrEqual(2);
      expect(state.boss).toBe(boss);
    }
  });

  it('stands at the top of the field, with the whole field between it and the grave', () => {
    // A boss the grave already overlaps on arrival would take its first phase
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

describe('the flash between phases (ADR 0007)', () => {
  it('separates the phases, and player shots do nothing while it burns', () => {
    // ADR 0007: "a short invincible flash at phase breaks". The flash is what
    // makes a phase a beat rather than a health bar with a line drawn on it,
    // and a shot that landed through it would delete the beat.
    const { state, boss } = fighting();
    damageBoss(state, boss.hp, 'skullStream');

    expect(boss.phaseIndex).toBe(1);
    expect(boss.flash).toBe(PHASE_FLASH_TICKS);

    const standing = boss.hp;
    damageBoss(state, 500, 'skullStream');
    expect(boss.hp).toBe(standing);

    for (let tick = 0; tick < PHASE_FLASH_TICKS; tick++) advanceBoss(state);
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
    // The last phase is the one this matters on: a killing blow that landed
    // through the flash would end the fight on a beat the player was never
    // given, and the flash is invincibility rather than a damage reduction.
    const { state, boss } = fighting('banshee');
    damageBoss(state, boss.hp, 'skullStream');
    damageBoss(
      state,
      requireDefined(PHASE_HP.banshee[1], 'no phase 1 for banshee') * 10,
      'skullStream',
    );

    expect(state.boss).toBe(boss);
    expect(boss.hp).toBe(
      requireDefined(PHASE_HP.banshee[1], 'no phase 1 for banshee'),
    );
  });

  it('holds the pattern clock still through the flash, so a phase begins at its own start', () => {
    // A phase whose pattern ran while the player could not touch it would open
    // part-way through its own first cycle, which is the beat arriving late.
    const { state, boss } = fighting();
    damageBoss(state, boss.hp, 'skullStream');
    expect(boss.patternTick).toBe(0);

    for (let tick = 0; tick < PHASE_FLASH_TICKS; tick++) advanceBoss(state);
    expect(boss.patternTick).toBe(0);

    advanceBoss(state);
    expect(boss.patternTick).toBe(1);
  });
});

describe('the storm always matters (ADR 0007)', () => {
  it('damages the boss in every phase, so no phase is pure dodging', () => {
    // ADR 0007: "there are no pure-dodge survival sections anywhere in v1,
    // because the player's storm must always matter". It is asserted through
    // the storm's own pass rather than by calling the boss's damage directly,
    // because the thing that could fail is a weapon line walking past a body
    // that is not in the mob pool.
    const { state, boss } = fighting();

    for (let phase = 0; phase < PHASE_HP.undertaker.length; phase++) {
      expect(boss.phaseIndex).toBe(phase);
      skullAt(state, boss.x, boss.y);
      const landed = only(resolveStorm(state), 'mobDamaged').filter(
        (event) => event.id === boss.id,
      );
      expect(landed, `phase ${phase}`).toHaveLength(1);
      expect(firstOf(landed).amount).toBe(
        skullDamage(state.levels.skullStream),
      );
      expect(
        requireDefined(state.skulls[0], 'no skull pool slot 0').alive,
      ).toBe(false);

      if (phase === PHASE_HP.undertaker.length - 1) break;
      damageBoss(state, boss.hp, 'skullStream');
      for (let tick = 0; tick < PHASE_FLASH_TICKS; tick++) advanceBoss(state);
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
    // The rung the toll was thrown at, because the bell's damage climbs with
    // its rungs and a bound over a toll has to say which one it is.
    expect(firstOf(onBoss).amount).toBeGreaterThan(bellDamageFar(1));
    expect(firstOf(onBoss).amount).toBeLessThanOrEqual(bellDamageNear(1));
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
    // More health than the toll takes, because a body killed on the tick the
    // toll reaches it is never carried anywhere: the shove takes ticks now.
    add.hp = 1e6;
    add.beat = Number.MAX_SAFE_INTEGER;
    add.vx = 0;
    add.vy = 0;
    const addStoodY = add.y;

    const tolled = tollAndTravelThrough(state, 1);
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

  it('takes no health off a boss and never moves it, at any distance', () => {
    // ADR 0008 as amended and Mark's ruling 3 of 2026-09-15: the belch takes
    // health off nothing at all, boss included, so the phase of boss damage it
    // used to land is gone with the kill it sat beside. Never pushed is the
    // other half of the same sentence and the reason authored patterns do not
    // smear (ADR 0007), and it is answered at the seam rather than by a branch
    // in the belch.
    const near = fighting();
    near.boss.x = near.state.grave.x;
    near.boss.y = near.state.grave.y;
    const stoodAt = { x: near.boss.x, y: near.boss.y };
    const whole = requireDefined(
      PHASE_HP.undertaker[0],
      'no phase 0 for undertaker',
    );
    const add = putMob(near.state, near.state.grave.x + 1, near.state.grave.y);
    near.state.reservoir = RESERVOIR_CAPACITY;

    const events = fireBelch(near.state);

    expect(only(events, 'mobDamaged')).toEqual([]);
    expect(only(events, 'mobKilled')).toEqual([]);
    expect(near.boss.hp).toBe(whole);
    expect(near.boss.phaseIndex).toBe(0);
    expect(near.boss.x).toBe(stoodAt.x);
    expect(near.boss.y).toBe(stoodAt.y);
    // The add beside it is what the press does reach, so the boss standing
    // untouched is the seam refusing and not the press missing.
    expect(add.alive).toBe(true);
    expect(firstOf(only(events, 'belched')).shoved).toBe(1);

    // And a boss the whole field away from the grave is untouched the same way.
    const far = fighting();
    far.state.reservoir = RESERVOIR_CAPACITY;
    expect(only(fireBelch(far.state), 'mobDamaged')).toEqual([]);
    expect(far.boss.hp).toBe(whole);
  });
});

describe('boss damage pays score, per hit landed (design record R4)', () => {
  it('pays a landed hit from its own row, for the health the phase lost', () => {
    // R4's ruling: boss damage is paid per hit landed and never as a lump on
    // the kill, because a lump pays nothing at all to a run that fought the
    // Undertaker for ninety seconds and sealed before the last phase emptied.
    const { state, boss } = fighting();
    const landed = 40;

    const paid = only(damageBoss(state, landed, 'skullStream'), 'scorePaid');

    expect(paid).toHaveLength(1);
    expect(firstOf(paid).input).toBe('bossDamage');
    expect(firstOf(paid).amount).toBeCloseTo(landed * SCORE_PER_BOSS_HEALTH);
    expect(firstOf(paid).score).toBe(state.score);
    expect(boss.hp).toBe(
      requireDefined(PHASE_HP.undertaker[0], 'no phase') - landed,
    );
  });

  it('pays a phase-emptying hit for the health that was left and never for the overkill', () => {
    // What a hit pays for is the health the phase actually lost. damageBoss
    // subtracts unclamped, so the amount it reports can be far more than the
    // phase was holding, and the payment reads the health taken instead.
    const { state, boss } = fighting();
    const left = 3;
    boss.hp = left;

    const paid = only(
      damageBoss(state, left + 101, 'skullStream'),
      'scorePaid',
    );

    expect(paid).toHaveLength(1);
    expect(firstOf(paid).amount).toBeCloseTo(left * SCORE_PER_BOSS_HEALTH);
  });

  it('pays nothing for a hit the phase flash absorbed, because it took no health', () => {
    // The flash reports the hit as an amount of zero and applies nothing, so
    // there is no health lost for the payment to read.
    const { state, boss } = fighting();
    boss.flash = PHASE_FLASH_TICKS;
    const before = state.score;

    const events = damageBoss(state, 40, 'skullStream');

    expect(only(events, 'scorePaid')).toEqual([]);
    expect(state.score).toBe(before);
  });

  it("pays a whole fight the boss's own health at the row's rate", () => {
    // The swamping refusal, pinned as arithmetic rather than as a magnitude:
    // what a fight is worth is PHASE_HP times the row and nothing else, so a
    // step 6 retune of either moves it and no typed figure goes stale.
    const { state, boss } = fighting();
    const health = PHASE_HP.undertaker.reduce((sum, phase) => sum + phase, 0);

    const paid = only(fightToDeath(state, boss), 'scorePaid');

    expect(paid.reduce((sum, event) => sum + event.amount, 0)).toBeCloseTo(
      health * SCORE_PER_BOSS_HEALTH,
    );
    expect(state.score).toBeCloseTo(health * SCORE_PER_BOSS_HEALTH);
  });

  it('has still paid for every hit that landed on a boss that was never killed', () => {
    // The whole reason the payment is per hit: a run that fought the last
    // phase down and sealed before it emptied keeps what the fight paid.
    const { state, boss } = fighting();
    const landed = 40;

    damageBoss(state, boss.hp, 'skullStream');
    for (let tick = 0; tick < PHASE_FLASH_TICKS; tick++) advanceBoss(state);
    damageBoss(state, landed, 'skullStream');

    expect(state.boss).not.toBeNull();
    expect(state.score).toBeCloseTo(
      (requireDefined(PHASE_HP.undertaker[0], 'no phase') + landed) *
        SCORE_PER_BOSS_HEALTH,
    );
  });
});

describe('what a boss sheds (ADR 0007, ADR 0004)', () => {
  it('breaks each phase exactly once, and reports which phase is live', () => {
    // A break reported twice would pay the feast twice and move the fight's
    // own clock, and a break reported for a phase that never emptied would put
    // a pattern on the field with no health behind it.
    const { state, boss } = fighting();
    const broke = only(fightToDeath(state, boss), 'phaseBroke');

    expect(broke.map((event) => event.phaseIndex)).toEqual([1, 2]);
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
    for (let phase = 0; phase < PHASE_HP.undertaker.length; phase++) {
      damageBoss(state, boss.hp, 'skullStream');
      fed.push(state.corpses.filter((corpse) => corpse.alive).length);
      for (let tick = 0; tick < PHASE_FLASH_TICKS; tick++) advanceBoss(state);
    }

    // One more piece of food on the field after each of the two breaks, and
    // nothing new on the death: what the death sheds is the boss's own module's.
    expect(fed).toEqual([1, 2, 2]);
  });

  it('sheds a feast that never decays, exactly like an upgrade power-up', () => {
    // game-concept.md under ADR 0004: "the feast phase dropped at each phase
    // break never decays, exactly like an upgrade power-up". A break's reward that
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

  it('leaves the field on its last phase, reporting where it fell', () => {
    // The death is what victory fires on rather than a section index, and where
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
