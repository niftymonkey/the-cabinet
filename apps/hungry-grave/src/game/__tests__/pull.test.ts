/**
 * The pull (design record `grave-in-the-ground.md` R3). Every test here steps
 * through the one execution authority (ADR 0017), and stepping() fails the test
 * on any fault the run records, which is ADR 0013's invariants checked on every
 * step.
 *
 * Every expected figure below is worked by hand from R3's own arithmetic at the
 * record's values, reach 24, strength 125 and response 4.6: the catch-up share
 * one tick closes is 1 - exp(-4.6 / 60), which is 0.0738, and the speed the
 * pull wants at a gap is 125 * (1 - (gap / 24)^3) / 60 field units a tick. At
 * the rim that wanted speed is 2.0833 and the first tick of it is 0.1538; at a
 * gap of 12 it is 1.8229 and the first tick is 0.1345; at a gap of 23 it is
 * 0.2496 and the first tick is 0.0184.
 */

import { describe, expect, it } from 'vitest';
import { stepping } from '../../dev/stepping';
import type { Corpse } from '../corpses';
import {
  CORPSE_HALF_EXTENT,
  FRESHNESS_PER_TICK,
  POWER_UP_HALF_EXTENT,
  spawnCorpse,
  spawnFallenRung,
  spawnFeast,
} from '../corpses';
import type { TickCommand } from '../command';
import { graveHitbox } from '../grave';
import type { Mob } from '../mobs';
import { MOB_TYPES, spawnMob } from '../mobs';
import { openOffer } from '../offer';
import type { RunState } from '../run';
import { createRun } from '../run';
import { PROCESSION_WAVES } from '../stage/waves';
import { SCROLL_SPEED } from '../tuning';
import type { TuningOverlay } from '../tuningRecord';
import { resolveTuning } from '../tuningRecord';

/** A tick that steers nowhere, which is every tick these tests are about. */
const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

/** Narrows a possibly-absent value, or fails loudly when the absence is a bug. */
function requireDefined<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

/** A run whose stage will not spawn on top of the food a test placed. */
function quietRun(overlay: TuningOverlay = {}): RunState {
  const run = createRun(21, { tuning: resolveTuning(overlay) });
  run.stage.firedWaves = PROCESSION_WAVES.length;
  return run;
}

/** A corpse standing exactly here, left by a body killed on the spot. */
function corpseAt(state: RunState, x: number, y: number): Corpse {
  const dead = spawnMob(
    state,
    'shambler',
    { x, y, vx: 0, vy: 1, index: 0 },
    false,
    'wave',
  )!;
  dead.alive = false;
  const row = MOB_TYPES[dead.type];
  spawnCorpse(state, dead, row.corpsePayout, row.corpseTier);
  return requireDefined(
    state.corpses.filter((each) => each.alive).at(-1),
    `no corpse at ${x}, ${y}`,
  );
}

/**
 * The x a body of this half extent stands at to leave exactly `gap` field units
 * between its own box and the mouth's left edge, worked from the mouth's own
 * box rather than from the grave's numbers.
 */
function leftOfTheRim(
  state: RunState,
  gap: number,
  halfExtent: number,
): number {
  return graveHitbox(state.grave).x - gap - halfExtent;
}

/** A body standing clear of the mouth on the right, which the pull must not touch. */
function besideTheRim(state: RunState): Mob {
  const mob = spawnMob(
    state,
    'shambler',
    { x: state.grave.x + 40, y: state.grave.y - 40, vx: 0, vy: 1, index: 0 },
    false,
    'wave',
  )!;
  mob.beat = 0;
  return mob;
}

describe('the pull (grave-in-the-ground R3)', () => {
  it('slides a corpse inside the reach toward the mouth', () => {
    // R3: food close to the rim is drawn toward the mouth as real movement in
    // the rules. At a gap of 12, half the reach, the wanted speed is 1.8229 a
    // tick and the first tick of it is 0.1345.
    const state = quietRun();
    const step = stepping(state);
    const corpse = corpseAt(
      state,
      leftOfTheRim(state, 12, CORPSE_HALF_EXTENT),
      state.grave.y,
    );
    const from = corpse.x;

    step(STILL);

    expect(corpse.alive).toBe(true);
    expect(corpse.vx).toBeGreaterThan(0);
    expect(corpse.x - from).toBeGreaterThan(0.13);
    expect(corpse.x - from).toBeLessThan(0.14);
  });

  it('gathers way, so a pulled corpse takes a longer second step', () => {
    // R3: food keeps its momentum, so the velocity climbs toward the wanted
    // speed rather than arriving at it. The second tick closes 0.0738 of what
    // is left of the same 1.83, which is 0.2596 against the first tick's
    // 0.1345.
    const state = quietRun();
    const step = stepping(state);
    const corpse = corpseAt(
      state,
      leftOfTheRim(state, 12, CORPSE_HALF_EXTENT),
      state.grave.y,
    );

    const start = corpse.x;
    step(STILL);
    const afterOne = corpse.x;
    step(STILL);

    const first = afterOne - start;
    const second = corpse.x - afterOne;
    expect(second).toBeGreaterThan(first);
    expect(second).toBeGreaterThan(0.25);
    expect(second).toBeLessThan(0.27);
  });

  it('leaves a corpse at the edge of the reach exactly where it stands', () => {
    // R3: the nearness is zero at the reach and beyond it, so a corpse there is
    // not pulled at all and its velocity is exactly zero rather than nearly so.
    // The reach itself is the first reading that is outside, which is the edge
    // the rule is written at.
    const state = quietRun();
    const step = stepping(state);
    const atTheEdge = corpseAt(
      state,
      leftOfTheRim(state, 24, CORPSE_HALF_EXTENT),
      state.grave.y,
    );
    const wellOutside = corpseAt(
      state,
      leftOfTheRim(state, 40, CORPSE_HALF_EXTENT),
      state.grave.y - 30,
    );
    const edgeFrom = { x: atTheEdge.x, y: atTheEdge.y };
    const outsideFrom = { x: wellOutside.x, y: wellOutside.y };

    step(STILL);

    expect(atTheEdge.x).toBe(edgeFrom.x);
    expect(atTheEdge.y).toBe(edgeFrom.y + SCROLL_SPEED);
    expect(atTheEdge.vx).toBe(0);
    expect(atTheEdge.vy).toBe(0);
    expect(wellOutside.x).toBe(outsideFrom.x);
    expect(wellOutside.y).toBe(outsideFrom.y + SCROLL_SPEED);
    expect(wellOutside.vx).toBe(0);
    expect(wellOutside.vy).toBe(0);
  });

  it('pulls a corpse at the rim harder than one at the edge of the reach', () => {
    // R3: the pull is slow at the edge of the reach and fastest at the rim,
    // which is the out-cubic ease. Its first tick is 0.1538 at the rim against
    // 0.0184 one unit inside the reach, eight times as far.
    const rim = quietRun();
    const atTheRim = corpseAt(
      rim,
      leftOfTheRim(rim, 0, CORPSE_HALF_EXTENT),
      rim.grave.y,
    );
    const rimFrom = atTheRim.x;
    const edge = quietRun();
    const atTheEdge = corpseAt(
      edge,
      leftOfTheRim(edge, 23, CORPSE_HALF_EXTENT),
      edge.grave.y,
    );
    const edgeFrom = atTheEdge.x;

    stepping(rim)(STILL);
    stepping(edge)(STILL);

    const atTheRimMoved = atTheRim.x - rimFrom;
    const atTheEdgeMoved = atTheEdge.x - edgeFrom;
    expect(atTheRimMoved).toBeGreaterThan(0.15);
    expect(atTheRimMoved).toBeLessThan(0.16);
    expect(atTheEdgeMoved).toBeGreaterThan(0.018);
    expect(atTheEdgeMoved).toBeLessThan(0.019);
  });

  it('lets a corpse the grave leaves behind coast to a stop, never back', () => {
    // R3: out of the reach the wanted velocity is zero, so the same line is the
    // ground's drag. The corpse keeps the way it gathered, slows by 0.0738 of
    // what is left every tick, and never turns around, which is what the grave
    // standing to its left is here to prove: a pull would drag it back.
    const state = quietRun();
    const step = stepping(state);
    const corpse = corpseAt(
      state,
      leftOfTheRim(state, 6, CORPSE_HALF_EXTENT),
      state.grave.y,
    );
    for (let tick = 0; tick < 5; tick++) step(STILL);
    state.grave.x = 100;
    const gathered = corpse.vx;

    const steps: number[] = [];
    for (let tick = 0; tick < 10; tick++) {
      const before = corpse.x;
      step(STILL);
      steps.push(corpse.x - before);
    }
    for (let tick = 0; tick < 50; tick++) step(STILL);

    expect(gathered).toBeGreaterThan(0);
    expect(steps[0]).toBeLessThan(gathered);
    for (const [index, covered] of steps.entries()) {
      expect(covered).toBeGreaterThan(0);
      if (index > 0) expect(covered).toBeLessThan(steps[index - 1]!);
    }
    expect(corpse.vx).toBeGreaterThan(0);
    expect(corpse.vx).toBeLessThan(gathered * 0.02);
  });

  it('never moves a living mob, which holds the course it holds unpulled', () => {
    // Mark's decision 2: a living mob is never food, and a pull on the living
    // would drag attackers onto the player. The same scene is played with the
    // pull on and with it off, and the mob's path is identical in both while
    // the corpse's is not.
    const pulled = quietRun();
    const pulledMob = besideTheRim(pulled);
    const pulledCorpse = corpseAt(
      pulled,
      leftOfTheRim(pulled, 12, CORPSE_HALF_EXTENT),
      pulled.grave.y,
    );
    const still = quietRun({ swallow: { pullStrength: 0 } });
    const stillMob = besideTheRim(still);
    const stillCorpse = corpseAt(
      still,
      leftOfTheRim(still, 12, CORPSE_HALF_EXTENT),
      still.grave.y,
    );
    const from = stillCorpse.x;

    const pulledStep = stepping(pulled);
    const stillStep = stepping(still);
    for (let tick = 0; tick < 5; tick++) {
      pulledStep(STILL);
      stillStep(STILL);
    }

    expect(pulledMob.x).toBe(stillMob.x);
    expect(pulledMob.y).toBe(stillMob.y);
    expect(pulledMob.vx).toBe(stillMob.vx);
    expect(pulledMob.vy).toBe(stillMob.vy);
    expect(stillCorpse.x).toBe(from);
    expect(pulledCorpse.x).toBeGreaterThan(from);
  });

  it('never moves the option bodies the grave slips between', () => {
    // R3 and ADR 0034: the options hold their places relative to each other, so
    // the choice is a place to be rather than a moment to hit. Bodies stand 90
    // apart and are 28 wide, so a grave halfway between two of them has both 17
    // and a half from its mouth, well inside the reach of 24. The corpse below
    // the mouth is at that same gap and is what says the pull is on at all.
    const state = quietRun();
    const step = stepping(state);
    openOffer(state, state.grave.x + 45, state.grave.y);
    const bodies = state.corpses.filter((body) => body.alive);
    const mouth = graveHitbox(state.grave);
    const control = corpseAt(
      state,
      state.grave.x,
      mouth.y + mouth.height + 17.5 + CORPSE_HALF_EXTENT,
    );
    const stood = bodies.map((body) => ({ body, x: body.x, y: body.y }));
    const controlFrom = control.y;

    for (let tick = 0; tick < 5; tick++) step(STILL);

    expect(stood).toHaveLength(3);
    for (const { body, x, y } of stood) {
      expect(body.alive).toBe(true);
      expect(body.x).toBe(x);
      expect(body.y).toBeCloseTo(y + SCROLL_SPEED * 5, 9);
      expect(body.vx).toBe(0);
      expect(body.vy).toBe(0);
    }
    expect(control.vy).toBeLessThan(0);
    expect(control.y).toBeLessThan(controlFrom + SCROLL_SPEED * 5);
  });

  it('pulls a feast and a fallen rung as it pulls a corpse', () => {
    // R3 names the three it moves: corpses, feasts and fallen rungs. Both are
    // staged at a gap of 12 from the mouth at their own widths, so both take
    // the same first tick of 0.1345 that the corpse takes.
    const feasting = quietRun();
    spawnFeast(
      feasting,
      leftOfTheRim(feasting, 12, CORPSE_HALF_EXTENT),
      feasting.grave.y,
      1,
    );
    const feast = requireDefined(
      feasting.corpses.find((each) => each.alive),
      'no feast',
    );
    const feastFrom = feast.x;
    const falling = quietRun();
    spawnFallenRung(
      falling,
      leftOfTheRim(falling, 12, POWER_UP_HALF_EXTENT),
      falling.grave.y,
      'bell',
    );
    const rung = requireDefined(
      falling.corpses.find((each) => each.alive),
      'no fallen rung',
    );
    const rungFrom = rung.x;

    stepping(feasting)(STILL);
    stepping(falling)(STILL);

    expect(feast.x - feastFrom).toBeGreaterThan(0.13);
    expect(feast.x - feastFrom).toBeLessThan(0.14);
    expect(rung.x - rungFrom).toBeGreaterThan(0.13);
    expect(rung.x - rungFrom).toBeLessThan(0.14);
  });

  it('leaves a corpse at the grave own centre finite and still', () => {
    // R3: a zero length means no direction, and the wanted velocity is zero.
    // The grave is put one scroll below the corpse so that the scroll lands the
    // corpse on the grave's exact centre on the tick the pull reads it, which
    // is the only staging where the two centres are the same double.
    const state = quietRun();
    const step = stepping(state);
    const corpse = corpseAt(state, state.grave.x, state.grave.y);
    state.grave.y = corpse.y + SCROLL_SPEED;

    const events = step(STILL);

    expect(corpse.vx).toBe(0);
    expect(corpse.vy).toBe(0);
    expect(events.map((event) => event.type)).toContain('swallowed');
  });

  it('is off at a strength of zero, leaving the scroll the only mover', () => {
    // R3's own reversal: strength zero turns the pull off and the threshold
    // rule stands without it. The corpse sits half a reach from the mouth and
    // moves by exactly the scroll, which is what a corpse did before this step.
    const state = quietRun({ swallow: { pullStrength: 0 } });
    const step = stepping(state);
    const corpse = corpseAt(
      state,
      leftOfTheRim(state, 12, CORPSE_HALF_EXTENT),
      state.grave.y,
    );
    const from = { x: corpse.x, y: corpse.y };

    step(STILL);

    expect(corpse.x).toBe(from.x);
    expect(corpse.y).toBe(from.y + SCROLL_SPEED);
    expect(corpse.vx).toBe(0);
    expect(corpse.vy).toBe(0);
  });

  it('reads the reach, the strength and the response off the run record', () => {
    // Values are data: all three are rows, so a run started under a record that
    // moves one plays differently. A reach of 6 puts the same corpse outside
    // it; twice the strength doubles the first tick to 0.2691; twice the
    // response takes the share one tick closes from 0.0738 to 0.1422, so the
    // first tick is 0.2592.
    const measure = (overlay: TuningOverlay): number => {
      const state = quietRun(overlay);
      const corpse = corpseAt(
        state,
        leftOfTheRim(state, 12, CORPSE_HALF_EXTENT),
        state.grave.y,
      );
      const from = corpse.x;
      stepping(state)(STILL);
      return corpse.x - from;
    };

    const byTheRecord = measure({});
    expect(measure({ swallow: { pullReach: 6 } })).toBe(0);
    expect(measure({ swallow: { pullStrength: 250 } })).toBeGreaterThan(
      byTheRecord * 1.9,
    );
    expect(measure({ swallow: { pullResponse: 9.2 } })).toBeGreaterThan(
      byTheRecord * 1.8,
    );
  });

  it('hands the next food in a pulled corpse slot a velocity of zero', () => {
    // Every spawn comes through claimSlot, and an inherited velocity would
    // carry new food away on a tug that never reached it. The corpse is pulled
    // until it carries real way, then rots where it stands, and the next food
    // claims the slot it left (caps.ts takes the first dead slot).
    const state = quietRun();
    const step = stepping(state);
    const corpse = corpseAt(
      state,
      leftOfTheRim(state, 6, CORPSE_HALF_EXTENT),
      state.grave.y,
    );
    for (let tick = 0; tick < 5; tick++) step(STILL);
    const carried = corpse.vx;
    corpse.freshness = FRESHNESS_PER_TICK / 2;
    step(STILL);

    spawnFeast(state, 60, 300, 1);
    const next = requireDefined(state.corpses[0], 'no corpse pool slot 0');

    expect(carried).toBeGreaterThan(0);
    expect(next.alive).toBe(true);
    expect(next.kind).toBe('feast');
    expect(next.vx).toBe(0);
    expect(next.vy).toBe(0);
  });
});
