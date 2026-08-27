/**
 * How much live mob traffic stands up-field of the grave at the moment the
 * grave swallows.
 *
 * The field is built through the sim's own spawner and every sample is taken
 * through the sim's own swallow, so a band holds positions the game really
 * produces rather than a hand-made list the reading was shown.
 */

import { describe, expect, it } from 'vitest';

import { TICK_HZ } from '../../../game/clock';
import type { SimEvent } from '../../../game/events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../../game/field';
import { moveGrave } from '../../../game/grave';
import type { Mob, MobType } from '../../../game/mobs';
import { spawnMob, SPAWN_MARGIN } from '../../../game/mobs';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import { swallow } from '../../../game/swallow';
import { BASE_SPEED, SCROLL_SPEED, SIZE_FLOOR } from '../../../game/tuning';
import type { UpfieldTraffic } from '../upfieldTraffic';
import {
  BAND_COUNT,
  BAND_UNITS,
  createUpfieldTraffic,
  LATERAL_REACH,
  observeUpfieldTraffic,
  upfieldTrafficOf,
} from '../upfieldTraffic';

const SEED = 20260827;

// The grave parked mid-field, so every case's distance up-field is its own.
const GRAVE_Y = 600;
const GRAVE_X = 270;

/** A run with the grave parked where these cases measure from. */
const parkedRun = (): RunState => {
  const run = createRun(SEED);
  run.grave.x = GRAVE_X;
  run.grave.y = GRAVE_Y;
  return run;
};

/** One swallow through the sim's own mouth, with the events it reported. */
const swallowOnce = (run: RunState): SimEvent[] =>
  swallow(run, { kind: 'corpse', freshness: 1, payout: 0.1 });

/** A live mob standing at a chosen place, through the sim's own spawner. */
const putMob = (
  run: RunState,
  x: number,
  y: number,
  type: MobType = 'shambler',
): Mob => {
  const mob = spawnMob(run, type, { x, y, vx: 0, vy: 0, index: 0 });
  if (mob === null) throw new Error('the mob pool refused a spawn');
  return mob;
};

/** Puts the grave's centre where the case wants it, through the sim's own mover. */
const placeGraveAt = (run: RunState, y: number): void => {
  moveGrave(run.grave, { x: 0, y: (y - run.grave.y) / BASE_SPEED });
};

// The key a band's near edge is reported under.
const bandKey = (band: number): string => `${band * BAND_UNITS}`;

// Every band's figure added up, which is the mobs counted per swallow.
const acrossTheBands = (traffic: UpfieldTraffic): number =>
  Object.values(traffic.perSwallow).reduce<number>(
    (sum, one) => sum + (one ?? 0),
    0,
  );

describe('up-field traffic', () => {
  it('counts a mob standing up-field of the grave in the band its distance falls in', () => {
    // The band is the distance over the band width, so a mob three and a half
    // bands up-field belongs to the third band and never the fourth.
    const run = parkedRun();
    putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 3.5);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, swallowOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.swallows).toBe(1);
    expect(traffic.perSwallow[bandKey(3)]).toBe(1);
    expect(traffic.perSwallow[bandKey(4)]).toBe(0);
  });

  it('takes no sample and moves no band on a tick that swallowed nothing', () => {
    // The question is where ground could be claimed, and a tick that swallowed
    // nothing laid none, so it is not an observation of it. Sampling every tick
    // would answer where traffic is on an average tick, and a patch is not laid
    // on an average one.
    const run = parkedRun();
    putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 2.5);
    const acc = createUpfieldTraffic();
    observeUpfieldTraffic(acc, swallowOnce(run), run);

    putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 2.5);
    observeUpfieldTraffic(acc, [], run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.swallows).toBe(1);
    expect(traffic.perSwallow[bandKey(2)]).toBe(1);
  });

  it('takes two samples from two swallows on one tick', () => {
    // Two swallows laid two patches into that one field, so the field counts
    // twice: once for each piece of ground the tick claimed.
    const run = parkedRun();
    putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 6.5);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, [...swallowOnce(run), ...swallowOnce(run)], run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.swallows).toBe(2);
    // Two samples of a field holding one mob is still one mob per swallow.
    expect(traffic.perSwallow[bandKey(6)]).toBe(1);
  });

  it('counts no mob standing at or below the grave', () => {
    // No patch laid up-field can ever meet one: a patch drifts at exactly the
    // scroll, so a mob only ever closes on it from above.
    const run = parkedRun();
    putMob(run, GRAVE_X, GRAVE_Y);
    putMob(run, GRAVE_X, GRAVE_Y + BAND_UNITS);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, swallowOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.swallows).toBe(1);
    expect(acrossTheBands(traffic)).toBe(0);
  });

  it('counts no mob outside the column ground claimed at the grave’s own x could reach', () => {
    // The ground lands at the grave's own x and nowhere else, so traffic off in
    // another column is traffic that placement was never going to answer.
    const run = parkedRun();
    putMob(run, GRAVE_X + LATERAL_REACH, GRAVE_Y - BAND_UNITS * 4.5);
    putMob(run, GRAVE_X + LATERAL_REACH + 1, GRAVE_Y - BAND_UNITS * 4.5);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, swallowOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.perSwallow[bandKey(4)]).toBe(1);
    expect(acrossTheBands(traffic)).toBe(1);
  });

  it('counts a mob in one band only, so the bands add up to the mobs seen', () => {
    // A body straddling two bands counted in both would make the histogram
    // stop adding up, and every sum a reader took off it would be wrong.
    const run = parkedRun();
    const distances = [1, BAND_UNITS, BAND_UNITS * 2.5, BAND_UNITS * 9.99];
    for (const distance of distances) putMob(run, GRAVE_X, GRAVE_Y - distance);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, swallowOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(acrossTheBands(traffic)).toBe(distances.length);
    expect(traffic.perSwallow[bandKey(0)]).toBe(1);
    expect(traffic.perSwallow[bandKey(1)]).toBe(1);
    expect(traffic.perSwallow[bandKey(2)]).toBe(1);
    expect(traffic.perSwallow[bandKey(9)]).toBe(1);
  });

  it('reports one mob per swallow in a band two swallows each saw one mob in', () => {
    // A mean over swallows and never a total: a run that swallowed twice as
    // often would otherwise report twice the traffic for the same field, and
    // two runs could not be read against each other at all.
    const run = parkedRun();
    const first = putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 5.5);
    const acc = createUpfieldTraffic();
    observeUpfieldTraffic(acc, swallowOnce(run), run);

    first.alive = false;
    putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 5.2);
    observeUpfieldTraffic(acc, swallowOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.swallows).toBe(2);
    expect(traffic.perSwallow[bandKey(5)]).toBe(1);
  });

  it('reports no bands rather than a row of zeroes for a run that never swallowed', () => {
    // A run with no samples has nothing to average, and answering zero across
    // the histogram would be the instrument inventing a reading it never took.
    const run = parkedRun();
    putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 3.5);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, [], run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.swallows).toBe(0);
    expect(Object.keys(traffic.perSwallow)).toEqual([]);
  });

  it('reads a measured but empty band as zero rather than absent', () => {
    // Once a swallow has been sampled every band was looked at, and a band
    // that was looked at and held nothing is a measured zero. That is the
    // finding: it is where a patch would meet no traffic at all.
    const run = parkedRun();
    putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 3.5);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, swallowOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(Object.keys(traffic.perSwallow)).toHaveLength(BAND_COUNT);
    expect(traffic.perSwallow[bandKey(0)]).toBe(0);
    expect(traffic.perSwallow[bandKey(BAND_COUNT - 1)]).toBe(0);
  });

  it('reports the band width and the lateral reach it counted with', () => {
    // A histogram whose axis is a compiled constant says nothing on its own,
    // and the column is the instrument's own boundary rather than the patch's,
    // so both travel on the report where a reader can see them.
    const run = parkedRun();
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, swallowOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.bandUnits).toBe(BAND_UNITS);
    expect(traffic.lateralReach).toBe(LATERAL_REACH);
    expect(traffic.lateralReach).toBe(FIELD_WIDTH / 10);
  });

  it('makes a band one second of scroll, so a band’s index is the seconds a patch laid at its near edge takes to reach the grave', () => {
    // The derivation and not the magnitude. A patch drifts at exactly the
    // scroll, so the wait a placement buys is the band index in seconds, and
    // the histogram reads in field units and seconds at once.
    expect(BAND_UNITS).toBe(SCROLL_SPEED * TICK_HZ);

    for (const band of [1, 4, BAND_COUNT - 1]) {
      const nearEdge = band * BAND_UNITS;
      const ticksToTheGrave = nearEdge / SCROLL_SPEED;
      expect(ticksToTheGrave / TICK_HZ).toBe(band);
    }
  });

  it('reaches every place a mob may legally stand, so nothing is truncated at the top', () => {
    // The furthest a live mob can ever stand up-field: the grave at its
    // smallest and highest, the mob at the top of its own spawn margin. A band
    // missing here would drop the far traffic silently, which is exactly the
    // traffic a longer placement exists to intercept.
    const run = parkedRun();
    const events = swallowOnce(run);
    // The swallow grew the grave; the floor is what its containment allows.
    run.grave.size = SIZE_FLOOR;
    placeGraveAt(run, FIELD_HEIGHT);
    expect(run.grave.y).toBe(FIELD_HEIGHT - SIZE_FLOOR);
    putMob(run, run.grave.x, -SPAWN_MARGIN);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, events, run);

    const traffic = upfieldTrafficOf(acc);
    expect(acrossTheBands(traffic)).toBe(1);
    expect(BAND_COUNT * BAND_UNITS).toBeGreaterThanOrEqual(
      FIELD_HEIGHT - SIZE_FLOOR + SPAWN_MARGIN,
    );
  });

  it('counts traffic whether or not Territory is owned', () => {
    // A swallow at level 0 lays no ground and is still a sample. The question
    // is where ground could be claimed, never what this run's Territory did,
    // so gating the reading on the line would answer a different question.
    const run = parkedRun();
    run.levels.territory = 0;
    putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 7.5);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, swallowOnce(run), run);

    expect(run.patches.some((patch) => patch.alive)).toBe(false);
    const traffic = upfieldTrafficOf(acc);
    expect(traffic.swallows).toBe(1);
    expect(traffic.perSwallow[bandKey(7)]).toBe(1);
  });

  it('counts a mob standing where no patch is laid', () => {
    // The reading reads the field and never the patch pool. Counting only mobs
    // a patch happened to be laid over would make the instrument measure
    // today's placement, and it exists to judge a change to that placement.
    const run = parkedRun();
    const far = GRAVE_Y - BAND_UNITS * 15.5;
    putMob(run, GRAVE_X, far);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, swallowOnce(run), run);

    const laid = run.patches.filter((patch) => patch.alive);
    expect(laid).toHaveLength(1);
    expect(Math.abs(laid[0].y - far)).toBeGreaterThan(BAND_UNITS);
    expect(upfieldTrafficOf(acc).perSwallow[bandKey(15)]).toBe(1);
  });

  it('counts two mob types at the same distance as one band’s two mobs, leaving the sweep each buys to the reader', () => {
    // The blindness to type is a promise the reading makes rather than a gap it
    // hides: the histogram counts bodies, and the sweep a placement buys over
    // one of them is the reader's to work out from its type. The reason is not
    // that the sweep is close between types, because it is not: the falling
    // types close on a patch at unlike fractions of the scroll, and the chasing
    // type's descent may run to several times it.
    const run = parkedRun();
    const distance = GRAVE_Y - BAND_UNITS * 8.5;
    putMob(run, GRAVE_X - 20, distance, 'shambler');
    putMob(run, GRAVE_X + 20, distance, 'revenant');
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, swallowOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.perSwallow[bandKey(8)]).toBe(2);
    expect(acrossTheBands(traffic)).toBe(2);
  });
});
