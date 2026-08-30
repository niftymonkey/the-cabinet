// How much live mob traffic stands up-field of the grave when ground is laid.

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
 * Territory's own reach or radius: an instrument that moves when the thing it
 * measures is retuned cannot judge the retune, and this reading exists to be
 * read against a targeting that is expected to change. It is a tenth of the
 * field, on the same footing as gravePath's bottom-edge margin, and because it
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
 * The field traffic standing up-field at the moment ground was laid.
 *
 * `perLay` is a mean over lays rather than a total, so two runs whose clocks
 * ran different lengths are comparable; `lays` sits beside it as the sample
 * size under every figure. Both the band width and the lateral reach are
 * reported, because a histogram whose axis is a compiled constant says
 * nothing on its own.
 *
 * What this reading is, said honestly: cadence-anchored field traffic, not
 * what the lay covered. A lay lands up to 180 units off the grave's column
 * while this instrument samples a 54-unit column at the grave's own x, so a
 * band says what stood over the grave when the clock fired, never what the
 * ground claimed. The targeting question belongs to `patchLaid.mobsUnder`
 * and to territoryPatches' `emptied`, and reading it off these bands would
 * be reading the wrong instrument.
 *
 * What it does not say is as fixed as what it does. It counts centres in a
 * column and never bodies against a radius. It does not know whether a mob it
 * counted is still alive when ground laid now opens. And it counts bodies
 * without their type: two types at one distance are one band's two mobs.
 */
interface UpfieldTraffic {
  readonly lays: number;
  readonly perLay: NumberRecord;
  readonly bandUnits: number;
  readonly lateralReach: number;
}

interface UpfieldTrafficAcc {
  lays: number;
  readonly perBand: number[];
}

const createUpfieldTraffic = (): UpfieldTrafficAcc => ({
  lays: 0,
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

// Whether this mob's column sits over the grave's own x.
const inTheColumn = (graveX: number, x: number): boolean =>
  Math.abs(x - graveX) <= LATERAL_REACH;

// Every live mob in the column, added to its band once per lay this tick.
const countTheField = (
  acc: UpfieldTrafficAcc,
  state: RunState,
  lays: number,
): void => {
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    if (!inTheColumn(state.grave.x, mob.x)) continue;
    const band = bandOf(state.grave.y - mob.y);
    if (band === null) continue;
    acc.perBand[band] += lays;
  }
};

/**
 * One tick's lays, each a sample of the field it was made in.
 *
 * The observation moment is the lay because the question this reading was
 * built for is what stood up-field when ground was laid, and that moment
 * moved from the swallow to the line's own clock. The reading reads the mobs
 * and never the patch pool.
 */
const observeUpfieldTraffic = (
  acc: UpfieldTrafficAcc,
  events: readonly SimEvent[],
  state: RunState,
): void => {
  let lays = 0;
  for (const event of events) if (event.type === 'patchLaid') lays += 1;
  if (lays === 0) return;
  acc.lays += lays;
  countTheField(acc, state, lays);
};

/**
 * The mean traffic per lay, band by band, keyed by the band's near edge.
 *
 * A run that laid nothing reports no bands at all: a measured zero is an
 * answer and an unmeasured one would be the instrument inventing a reading it
 * never took. Once one lay exists every band is present, zero included.
 */
const perLayOf = (acc: UpfieldTrafficAcc): NumberRecord => {
  const perLay: Record<string, number> = {};
  if (acc.lays === 0) return perLay;
  acc.perBand.forEach((total, band) => {
    perLay[`${band * BAND_UNITS}`] = total / acc.lays;
  });
  return perLay;
};

const upfieldTrafficOf = (acc: UpfieldTrafficAcc): UpfieldTraffic => ({
  lays: acc.lays,
  perLay: perLayOf(acc),
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
