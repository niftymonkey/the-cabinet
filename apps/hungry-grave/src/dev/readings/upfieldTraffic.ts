// How much live mob traffic stands up-field of the grave when the grave swallows.

import { TICK_HZ } from '../../game/clock';
import type { SimEvent } from '../../game/events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../game/field';
import { SPAWN_MARGIN } from '../../game/mobs';
import type { RunState } from '../../game/run';
import { SCROLL_SPEED } from '../../game/tuning';
import type { NumberRecord } from '../numbersByName';

/**
 * How wide a band is, in field units: one second of scroll.
 *
 * The width is a derivation and not a taste number. A band's index is the
 * number of seconds a patch laid at that band's near edge takes to drift down
 * to the grave, because a patch drifts at exactly the scroll, so the histogram
 * reads in two units at once: field units for the placement constant, seconds
 * for the wait that placement buys.
 */
const BAND_UNITS = SCROLL_SPEED * TICK_HZ;

/**
 * The half-width of the column the count is taken in, either side of the
 * grave's x.
 *
 * This is a measurement boundary and nothing else. It is deliberately not
 * Territory's own radius: an instrument that moves when the thing it measures
 * is retuned cannot judge the retune, and this reading exists to be read
 * against a placement that is expected to change. It is a tenth of the field,
 * on the same footing as gravePath's bottom-edge margin, and because it
 * reaches either side it opens a column a fifth of the field wide. It is
 * reported on every report so the number is never silent.
 */
const LATERAL_REACH = FIELD_WIDTH / 10;

/**
 * How many bands there are, enough to reach every place a live mob may stand
 * up-field of the grave.
 *
 * The reach is the field's own height widened by the spawn margin: the grave's
 * centre is held inside the field and a mob is legal out to the margin above
 * it, so no live mob can stand further up-field than that and no band is ever
 * missing from the top of the histogram.
 */
const BAND_COUNT = Math.ceil((FIELD_HEIGHT + SPAWN_MARGIN) / BAND_UNITS);

/**
 * The traffic a swallow could have covered, by distance up-field.
 *
 * `perSwallow` is a mean over swallows rather than a total, so two runs that
 * swallowed different amounts are comparable; `swallows` sits beside it as the
 * sample size under every figure. Both the band width and the lateral reach
 * are reported, because a histogram whose axis is a compiled constant says
 * nothing on its own.
 *
 * The sweep rule is what turns the bands into a placement answer. A patch
 * drifts at exactly the scroll, so relative to a patch a mob closes at its own
 * speed alone: ground laid at distance `d` that survives the whole drift down
 * to the grave meets whatever stood in `[d, d * (1 + ownSpeed / SCROLL_SPEED)]`.
 *
 * That window is the geometric upper bound and nothing more. A patch that is
 * spent or evicted before it drifts that far stops sweeping early, and its
 * real window is cut short in the same proportion as its life. How short is
 * the run's own Territory readings to answer, never this one's: naming a
 * Territory number here would tie the instrument to the tuning it exists to
 * judge, so a reader carries the shortfall in from beside this reading.
 *
 * What it does not say is as fixed as what it does. It counts centres in a
 * column and never bodies against a radius, so it is not a count of grabs. It
 * does not know whether a mob it counted is still alive when ground laid now
 * arrives. And it counts bodies without their type: two types at one distance
 * are one band's two mobs, so a reader applying the sweep rule supplies
 * `ownSpeed` themselves. The window is not near enough between types to skip
 * that step, and it is widest by far for the chasing type, whose descent may
 * run to several times the scroll while the falling types close at a fraction
 * of it.
 */
interface UpfieldTraffic {
  readonly swallows: number;
  readonly perSwallow: NumberRecord;
  readonly bandUnits: number;
  readonly lateralReach: number;
}

interface UpfieldTrafficAcc {
  swallows: number;
  readonly perBand: number[];
}

const createUpfieldTraffic = (): UpfieldTrafficAcc => ({
  swallows: 0,
  perBand: new Array<number>(BAND_COUNT).fill(0),
});

/**
 * The band a distance up-field falls in, or nothing when it falls in none.
 *
 * Two distances fall in no band, for unlike reasons. At or below the grave is
 * an exclusion by design: no patch laid up-field can ever meet a mob there,
 * because a patch drifts at the scroll and a mob only ever closes on it from
 * above. Past the top band cannot happen today: BAND_COUNT spans the field's
 * height widened by the spawn margin, which is further than a live mob may
 * legally stand, and the reading's own reach test pins that bound.
 */
const bandOf = (distance: number): number | null => {
  if (distance <= 0) return null;
  const band = Math.floor(distance / BAND_UNITS);
  return band < BAND_COUNT ? band : null;
};

// Whether ground claimed at the grave's own x could reach this mob's column.
const inTheColumn = (graveX: number, x: number): boolean =>
  Math.abs(x - graveX) <= LATERAL_REACH;

/**
 * Every live mob in the column, added to its band once per swallow this tick.
 *
 * Two swallows on one tick are two samples of the same field, because two
 * patches were laid into it.
 */
const countTheField = (
  acc: UpfieldTrafficAcc,
  state: RunState,
  swallows: number,
): void => {
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    if (!inTheColumn(state.grave.x, mob.x)) continue;
    const band = bandOf(state.grave.y - mob.y);
    if (band === null) continue;
    acc.perBand[band] += swallows;
  }
};

/**
 * One tick's swallows, each a sample of the field it was made in.
 *
 * Every swallow counts whatever Territory's level is. A swallow at level 0
 * lays no patch, and the question is where ground could be claimed rather than
 * what this run's Territory did with it, so the reading reads the mobs and
 * never the patch pool.
 */
const observeUpfieldTraffic = (
  acc: UpfieldTrafficAcc,
  events: readonly SimEvent[],
  state: RunState,
): void => {
  let swallows = 0;
  for (const event of events) if (event.type === 'swallowed') swallows += 1;
  if (swallows === 0) return;
  acc.swallows += swallows;
  countTheField(acc, state, swallows);
};

/**
 * The mean traffic per swallow, band by band, keyed by the band's near edge.
 *
 * A run that swallowed nothing reports no bands at all: a measured zero is an
 * answer and an unmeasured one would be the instrument inventing a reading it
 * never took. Once one swallow exists every band is present, zero included.
 */
const perSwallowOf = (acc: UpfieldTrafficAcc): NumberRecord => {
  const perSwallow: Record<string, number> = {};
  if (acc.swallows === 0) return perSwallow;
  acc.perBand.forEach((total, band) => {
    perSwallow[`${band * BAND_UNITS}`] = total / acc.swallows;
  });
  return perSwallow;
};

const upfieldTrafficOf = (acc: UpfieldTrafficAcc): UpfieldTraffic => ({
  swallows: acc.swallows,
  perSwallow: perSwallowOf(acc),
  bandUnits: BAND_UNITS,
  lateralReach: LATERAL_REACH,
});

export {
  createUpfieldTraffic,
  observeUpfieldTraffic,
  upfieldTrafficOf,
  BAND_UNITS,
  LATERAL_REACH,
  BAND_COUNT,
};
export type { UpfieldTraffic, UpfieldTrafficAcc };
