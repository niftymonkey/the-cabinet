/**
 * How much live mob traffic stands up-field of the grave at the moment ground
 * is laid.
 *
 * The field is built through the sim's own spawner and every sample is taken
 * through the sim's own lay, so a band holds positions the game really
 * produces rather than a hand-made list the reading was shown.
 */

import { describe, expect, it } from 'vitest';

import { TICK_HZ } from '../../../game/clock';
import type { SimEvent } from '../../../game/events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../../game/field';
import { moveGrave } from '../../../game/grave';
import { advanceTerritory } from '../../../game/lines/territory';
import type { Mob, MobType } from '../../../game/mobs';
import { spawnMob, SPAWN_MARGIN } from '../../../game/mobs';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
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

/**
 * One lay through the line's own clock, with the events it reported.
 *
 * The trigger mob stands inside the scan's reach and outside the instrument's
 * column, so the lay really happens and the sample never counts the mob that
 * caused it. It leaves the field again so a later sample is its own.
 */
const layOnce = (run: RunState): SimEvent[] => {
  const trigger = putMob(run, run.grave.x + 100, run.grave.y - 300);
  trigger.beat = 0;
  run.lines.layIn = 1;
  const events = advanceTerritory(run);
  trigger.alive = false;
  return events;
};

/** A tick's events with the charge still filling, so nothing is laid. */
const noLay = (run: RunState): SimEvent[] => advanceTerritory(run);

/** Puts the grave's centre where the case wants it, through the sim's own mover. */
const placeGraveAt = (run: RunState, y: number): void => {
  moveGrave(run.grave, { x: 0, y: (y - run.grave.y) / BASE_SPEED });
};

// The key a band's near edge is reported under.
const bandKey = (band: number): string => `${band * BAND_UNITS}`;

// Every band's figure added up, which is the mobs counted per lay.
const acrossTheBands = (traffic: UpfieldTraffic): number =>
  Object.values(traffic.perLay).reduce<number>(
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

    observeUpfieldTraffic(acc, layOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.lays).toBe(1);
    expect(traffic.perLay[bandKey(3)]).toBe(1);
    expect(traffic.perLay[bandKey(4)]).toBe(0);
  });

  it('takes no sample and moves no band on a tick that laid nothing', () => {
    // The question is what stood up-field when ground was laid, and a tick
    // that laid none is not an observation of it. Sampling every tick would
    // answer where traffic is on an average tick, and a patch is not laid on
    // an average one.
    const run = parkedRun();
    putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 2.5);
    const acc = createUpfieldTraffic();
    observeUpfieldTraffic(acc, layOnce(run), run);

    putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 2.5);
    observeUpfieldTraffic(acc, noLay(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.lays).toBe(1);
    expect(traffic.perLay[bandKey(2)]).toBe(1);
  });

  it('counts no mob standing at or below the grave', () => {
    // No patch laid up-field can ever meet one: a patch drifts at exactly the
    // scroll, so a mob only ever closes on it from above.
    const run = parkedRun();
    putMob(run, GRAVE_X, GRAVE_Y);
    putMob(run, GRAVE_X, GRAVE_Y + BAND_UNITS);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, layOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.lays).toBe(1);
    expect(acrossTheBands(traffic)).toBe(0);
  });

  it('counts no mob outside the instrument’s own column', () => {
    // The column is a measurement boundary and not the scan's reach: a lay may
    // land well off the grave's x, and what the ground actually covered is
    // patchLaid's own mobsUnder to answer, never this reading's.
    const run = parkedRun();
    putMob(run, GRAVE_X + LATERAL_REACH, GRAVE_Y - BAND_UNITS * 4.5);
    putMob(run, GRAVE_X + LATERAL_REACH + 1, GRAVE_Y - BAND_UNITS * 4.5);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, layOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.perLay[bandKey(4)]).toBe(1);
    expect(acrossTheBands(traffic)).toBe(1);
  });

  it('counts a mob in one band only, so the bands add up to the mobs seen', () => {
    // A body straddling two bands counted in both would make the histogram
    // stop adding up, and every sum a reader took off it would be wrong.
    const run = parkedRun();
    const distances = [1, BAND_UNITS, BAND_UNITS * 2.5, BAND_UNITS * 9.99];
    for (const distance of distances) putMob(run, GRAVE_X, GRAVE_Y - distance);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, layOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(acrossTheBands(traffic)).toBe(distances.length);
    expect(traffic.perLay[bandKey(0)]).toBe(1);
    expect(traffic.perLay[bandKey(1)]).toBe(1);
    expect(traffic.perLay[bandKey(2)]).toBe(1);
    expect(traffic.perLay[bandKey(9)]).toBe(1);
  });

  it('reports one mob per lay in a band two lays each saw one mob in', () => {
    // A mean over lays and never a total: a run whose clock ran twice as long
    // would otherwise report twice the traffic for the same field, and two
    // runs could not be read against each other at all.
    const run = parkedRun();
    const first = putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 5.5);
    const acc = createUpfieldTraffic();
    observeUpfieldTraffic(acc, layOnce(run), run);

    first.alive = false;
    putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 5.2);
    observeUpfieldTraffic(acc, layOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.lays).toBe(2);
    expect(traffic.perLay[bandKey(5)]).toBe(1);
  });

  it('reports no bands rather than a row of zeroes for a run that never laid', () => {
    // A run with no samples has nothing to average, and answering zero across
    // the histogram would be the instrument inventing a reading it never took.
    const run = parkedRun();
    putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 3.5);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, noLay(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.lays).toBe(0);
    expect(Object.keys(traffic.perLay)).toEqual([]);
  });

  it('reads a measured but empty band as zero rather than absent', () => {
    // Once a lay has been sampled every band was looked at, and a band that
    // was looked at and held nothing is a measured zero. That is the finding:
    // it is where a patch would meet no traffic at all.
    const run = parkedRun();
    putMob(run, GRAVE_X, GRAVE_Y - BAND_UNITS * 3.5);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, layOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(Object.keys(traffic.perLay)).toHaveLength(BAND_COUNT);
    expect(traffic.perLay[bandKey(0)]).toBe(0);
    expect(traffic.perLay[bandKey(BAND_COUNT - 1)]).toBe(0);
  });

  it('reports the band width and the lateral reach it counted with', () => {
    // A histogram whose axis is a compiled constant says nothing on its own,
    // and the column is the instrument's own boundary rather than the scan's,
    // so both travel on the report where a reader can see them.
    const run = parkedRun();
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, layOnce(run), run);

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
    // smallest and lowest, the mob at the top of its own spawn margin. A band
    // missing here would drop the far traffic silently, which is exactly the
    // traffic the reading exists to see standing.
    const run = parkedRun();
    const events = layOnce(run);
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

  it('counts a mob standing where no patch is laid', () => {
    // The reading reads the field and never the patch pool. Counting only mobs
    // the ground happened to be laid over would make the instrument measure
    // today's targeting, and it exists to judge a change to that targeting.
    const run = parkedRun();
    const far = GRAVE_Y - BAND_UNITS * 15.5;
    putMob(run, GRAVE_X, far);
    const acc = createUpfieldTraffic();

    observeUpfieldTraffic(acc, layOnce(run), run);

    const traffic = upfieldTrafficOf(acc);
    expect(traffic.perLay[bandKey(15)]).toBe(1);
    expect(acrossTheBands(traffic)).toBe(1);
  });
});
