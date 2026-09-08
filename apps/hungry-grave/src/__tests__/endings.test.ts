/**
 * Both of a run's endings (ADR 0003, ADR 0007, ADR 0028): the stage won on the
 * Undertaker's death, and the grave sealed shut at the bottom of the floor
 * ladder.
 *
 * The file sits at the top of src because an ending spans the two halves that
 * produce it: the stage and the boss machine under src/game, and the playing
 * policy under src/dev that walks a grave into enough fire to reach the floor.
 *
 * Every test here drives a pinned phase rather than a played run. Both bosses
 * stand behind sections nothing at the birthright crosses headlessly, so a run
 * would measure the policy that got there rather than the ending it reached.
 * The endings' own full runs are the set piece's slice, which is the boundary
 * the stage is still missing.
 */

import { describe, expect, it } from 'vitest';

import { hitTakingPolicy } from '../dev/bot';
import { stepping } from '../dev/stepping';
import { CHUNK_HP, spawnBoss } from '../game/bosses/chunks';
import type { TickCommand } from '../game/command';
import type { SimEvent } from '../game/events';
import type { WeaponLine } from '../game/lines/roster';
import { BIRTHRIGHT, WEAPON_LINES } from '../game/lines/roster';
import { MOB_TYPES } from '../game/mobs';
import type { RunState } from '../game/run';
import { createRun, uniformLevels } from '../game/run';
import type { BossKind } from '../game/stage/rows';
import { PHASES } from '../game/stage/stage';
import { SIZE_CEILING, SIZE_FLOOR } from '../game/tuning';

const SEED = 20260909;

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

/** How long a pinned fight is given to reach what it is asked for. */
const FIGHT_TICKS = 6000;

/**
 * The build the ladder is walked under, above the birthright and well under a
 * full one.
 *
 * A rung is only strippable if the run bought one, and this policy cannot buy
 * anything: it steers into fire rather than at food, so the loadout it would
 * reach by playing is the one it started with. Pinning it through createRun's
 * third parameter is the same instrument the whole-stage victory runs use for
 * the same reason. Two rather than five because the storm has to leave the
 * fight standing while the grave is ground down: a full build empties a chunk
 * faster than the boss's own pattern reaches the floor.
 */
const LADDER_LEVEL = 2;

/**
 * The score the run brings to the fight, which the ladder's first rung bleeds
 * whole.
 *
 * It is pinned for the same reason the build above is: score arrives only as
 * overflow from a swallow at the size ceiling, and a rig standing in the last
 * fight is not the run that earned it. Measured rather than assumed: this
 * policy's first hit lands at tick 88 and the fight's first corpse at tick 307,
 * so a grave that dives is off the ceiling long before the fight pays it
 * anything. The figure itself is not a magnitude the test rests on, because the
 * score tier is one rung and bleeds whole whatever it holds, which the
 * assertion below reads.
 */
const SCORE_BROUGHT_TO_THE_FIGHT = 1200;

/** The phase the stage authors this boss's fight in. */
function phaseOf(boss: BossKind): number {
  return PHASES.findIndex((phase) => phase.boss === boss);
}

interface Fight {
  readonly state: RunState;
  /** One tick, spent under the command the caller hands it. */
  readonly tick: (command: TickCommand) => readonly SimEvent[];
}

/**
 * A run standing in a boss's own phase with him on the field.
 *
 * He is put there rather than fought to: the stage's own tests hold that a
 * phase spawns the boss its column names, and what is under test here is what
 * his death does to the run. His phase authors no rows, so everything that
 * arrives on the field is his.
 */
function atTheFight(boss: BossKind, size?: number, level?: number): Fight {
  const state = createRun(
    SEED,
    size,
    level === undefined ? undefined : uniformLevels(level),
  );
  state.stage.phaseIndex = phaseOf(boss);
  const step = stepping(state);
  spawnBoss(state, boss);
  return { state, tick: (command) => step(command) };
}

/** Puts the fight on its last chunk, which is the one that runs every pattern. */
function onItsLastChunk(state: RunState): void {
  const boss = state.boss!;
  boss.chunk = CHUNK_HP[boss.kind].length - 1;
  boss.hp = CHUNK_HP[boss.kind][boss.chunk];
}

/** Puts the fight on its last chunk with one point left, so the storm ends it. */
function onItsLastLegs(state: RunState): void {
  onItsLastChunk(state);
  state.boss!.hp = 1;
}

/** What a run held, read before a tick and again after it. */
interface Held {
  readonly score: number;
  readonly size: number;
  readonly reservoir: number;
  readonly levels: Record<WeaponLine, number>;
  readonly food: number;
  readonly feasts: number;
}

function held(state: RunState): Held {
  const alive = state.corpses.filter((corpse) => corpse.alive);
  return {
    score: state.score,
    size: state.grave.size,
    reservoir: state.reservoir,
    levels: { ...state.levels },
    food: alive.length,
    feasts: alive.filter((corpse) => corpse.kind === 'feast').length,
  };
}

/** The tick that killed the boss, and what the run held as that tick began. */
interface Fall {
  readonly events: readonly SimEvent[];
  readonly before: Held;
}

// Ticks until the boss on the field is gone, and answers with the tick that did it.
function tickUntilTheBossFalls(fight: Fight): Fall {
  for (let tick = 0; tick < FIGHT_TICKS; tick++) {
    const before = held(fight.state);
    const events = fight.tick(STILL);
    if (events.some((event) => event.type === 'bossKilled')) {
      return { events, before };
    }
  }
  throw new Error('the boss outlived the fight the test gave him');
}

/** The tick a fight standing on its last point of health is ended on. */
function tickOfTheFall(): number {
  const fight = atTheFight('undertaker');
  onItsLastLegs(fight.state);
  for (let tick = 0; tick < FIGHT_TICKS; tick++) {
    const events = fight.tick(STILL);
    if (events.some((event) => event.type === 'bossKilled')) return tick;
  }
  throw new Error('the boss outlived the fight the test gave him');
}

/**
 * A grave one hit from sealed, with a body standing on it: at the floor, with
 * no score and nothing above the birthright left to bleed, and out of its
 * invulnerable window.
 */
function oneHitFromSealed(state: RunState): void {
  state.grave.size = SIZE_FLOOR;
  state.grave.invulnerable = 0;
  state.score = 0;
  const mob = state.mobs.find((each) => !each.alive)!;
  mob.alive = true;
  mob.type = 'shambler';
  mob.hp = MOB_TYPES.shambler.hp;
  mob.x = state.grave.x;
  mob.y = state.grave.y;
}

/** Every event of one kind a tick reported, in order. */
function only<T extends SimEvent['type']>(
  events: readonly SimEvent[],
  type: T,
): Extract<SimEvent, { type: T }>[] {
  return events.filter(
    (event): event is Extract<SimEvent, { type: T }> => event.type === type,
  );
}

describe("the stage's ending (ADR 0007)", () => {
  it("fires victory on the Undertaker's death and never on reaching a phase", () => {
    // game-concept.md:70: "his death is the ending." ADR 0050: "the Undertaker
    // ends the third and the stage."
    const fight = atTheFight('undertaker');
    onItsLastLegs(fight.state);
    const { events } = tickUntilTheBossFalls(fight);

    expect(only(events, 'bossKilled').map((event) => event.boss)).toEqual([
      'undertaker',
    ]);
    expect(only(events, 'victory')).toHaveLength(1);
    expect(fight.state.ending).toBe('victory');
    // The death and the ending are one tick, not a death with a crossing behind
    // it: a run that has ended executes no further ticks, so an ending hung on
    // the stage reaching its last phase would arrive after the run was over.
    expect(only(events, 'phaseChanged').map((event) => event.phase)).toEqual([
      'over',
    ]);
    expect(only(events, 'victory')[0].tick).toBe(
      only(events, 'phaseChanged')[0].tick,
    );
  });

  it('ends nothing when the stage reaches its last phase without that death', () => {
    // The retired stub's own case: victory used to fire on entering the phase
    // after the last fight, whatever emptied it. A boss taken off the field
    // without dying leaves the phase's end condition met and the run unfinished,
    // which is unreachable in play and is exactly what says the ending is the
    // death rather than the crossing.
    const fight = atTheFight('undertaker');
    fight.state.boss = null;
    fight.tick(STILL);

    expect(PHASES[fight.state.stage.phaseIndex].name).toBe('over');
    expect(fight.state.ending).toBeNull();
  });

  it('leaves a run sealed on the tick that also wins the fight', () => {
    // Both endings can fall on one tick, and the grave's is first: hits resolve
    // before the tick's deaths do, so a grave the fight sealed lost the run
    // before the last chunk emptied. The fall's own tick is measured first and
    // the hit is then stood on it, because the two have to land together for
    // the rule to be about anything.
    const falls = tickOfTheFall();
    const fight = atTheFight('undertaker');
    onItsLastLegs(fight.state);
    let events: readonly SimEvent[] = [];
    for (let tick = 0; tick <= falls; tick++) {
      if (tick === falls) oneHitFromSealed(fight.state);
      events = fight.tick(STILL);
    }

    expect(only(events, 'bossKilled')).toHaveLength(1);
    expect(only(events, 'sealed')).toHaveLength(1);
    expect(only(events, 'victory')).toHaveLength(0);
    expect(fight.state.ending).toBe('sealed');
  });

  it('pays nothing for a victory, where a boss that is not the ending sheds a feast', () => {
    // game-concept.md:70: "no payout, the grave swallows the gravedigger." The
    // Banshee is the presence half: her death drops a feast on the same
    // machine, so the absence below is read against an input that can produce
    // one.
    const fight = atTheFight('undertaker');
    onItsLastLegs(fight.state);
    const { events, before } = tickUntilTheBossFalls(fight);
    const after = held(fight.state);

    expect(after.score).toBe(before.score);
    expect(after.size).toBe(before.size);
    expect(after.reservoir).toBe(before.reservoir);
    expect(after.levels).toEqual(before.levels);
    expect(after.feasts).toBe(before.feasts);
    expect(after.food).toBeLessThanOrEqual(before.food);
    expect(only(events, 'grew')).toHaveLength(0);
    expect(only(events, 'swallowed')).toHaveLength(0);

    const hers = atTheFight('banshee');
    onItsLastLegs(hers.state);
    const wake = tickUntilTheBossFalls(hers);
    expect(held(hers.state).feasts).toBe(wake.before.feasts + 1);
    expect(hers.state.ending).toBeNull();
  });
});

describe("the grave's ending (ADR 0003)", () => {
  it('walks the whole ladder in order inside a boss fight', () => {
    // ADR 0003: "hits bleed score first, then weapon levels down to the
    // birthright loadout, and only when nothing is left to bleed does the next
    // hit seal the grave shut." Reachable inside a fight is the new half: the
    // ladder itself has been real since the grave was.
    const fight = atTheFight('undertaker', SIZE_CEILING, LADDER_LEVEL);
    // His last chunk, because it is the one that runs both patterns at once:
    // the fight the ladder is walked in is the fight at its loudest.
    onItsLastChunk(fight.state);
    fight.state.score = SCORE_BROUGHT_TO_THE_FIGHT;
    const rungs: SimEvent[] = [];
    let caused: SimEvent[] = [];
    for (let tick = 0; tick < FIGHT_TICKS; tick++) {
      // The tick before's events, which is what a policy is handed by the
      // harness it usually runs under.
      const events = fight.tick(hitTakingPolicy(fight.state, caused));
      caused = [...events];
      for (const event of events) {
        if (
          event.type === 'scoreBled' ||
          event.type === 'weaponStripped' ||
          event.type === 'sealed'
        ) {
          rungs.push(event);
        }
      }
      if (fight.state.ending !== null) break;
    }
    const order = rungs.map((rung) => rung.type);

    expect(fight.state.ending).toBe('sealed');
    // Score first, and the whole of it: the score tier is one rung and never
    // partly bleeds.
    expect(order[0]).toBe('scoreBled');
    expect(only(rungs, 'scoreBled')[0].amount).toBe(SCORE_BROUGHT_TO_THE_FIGHT);
    expect(fight.state.score).toBe(0);
    // Then the levels, then the seal, and the seal is the last thing that
    // happens because there is nothing left to bleed.
    expect(order.indexOf('weaponStripped')).toBeGreaterThan(
      order.indexOf('scoreBled'),
    );
    expect(order.indexOf('weaponStripped')).toBeLessThan(
      order.indexOf('sealed'),
    );
    expect(order.at(-1)).toBe('sealed');
    expect(only(rungs, 'sealed')).toHaveLength(1);
    // Inside the fight rather than after it: the boss was still standing when
    // the grave sealed, which is what makes this the ladder in a boss fight and
    // not the ladder in a section.
    expect(fight.state.boss).not.toBeNull();
    expect(PHASES[fight.state.stage.phaseIndex].boss).toBe('undertaker');
    // The floor a level falls to is the birthright, whatever the build.
    for (const line of WEAPON_LINES) {
      expect(`${line} ${fight.state.levels[line]}`).toBe(
        `${line} ${BIRTHRIGHT.includes(line) ? 1 : 0}`,
      );
    }
  });
});
