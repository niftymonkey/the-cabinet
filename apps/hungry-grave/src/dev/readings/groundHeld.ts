// How much of the field open claimed ground holds, tick by tick: Territory
// measured as area, which a count of patches cannot say (#76's gate on #79).

import { FIELD_HEIGHT, FIELD_WIDTH } from '../../game/field';
import type { RunState } from '../../game/run';
import type { NumberRecord } from '../numbersByName';
import { greatestOf, lastOf, meanOf } from '../seriesSummary';

/**
 * The estimate's cell size in field units. The union is a deterministic fixed
 * grid, never the exact circle-union construction (#79 spec: resolution error
 * over a bug farm): a cell is counted once if its centre is inside any open
 * patch, so overlap is never counted twice, and the grid is anchored to the
 * field's own origin, so a cell's centre never sits outside the field and an
 * off-field slice of a patch drops out by construction.
 *
 * The error lives in the cells the patches' rims cross, a band of one cell
 * diagonal around each rim: at most 2 * pi * radius * CELL * sqrt(2) of area
 * per patch, about 0.9% of the field for the largest patch at 4. TERRITORY_CAP
 * is 8, so the walk is at most eight small boxes per tick.
 */
const GROUND_CELL = 4;

/**
 * The field fraction of open claimed ground after each tick, 0 to 1. Index N
 * is the field after tick N ran, fieldPerLine's own convention, and ground
 * still opening is not open: it holds nothing yet, so it counts for nothing.
 */
interface GroundHeld {
  readonly fraction: readonly number[];
}

interface GroundHeldAcc {
  readonly fraction: number[];
}

const createGroundHeld = (): GroundHeldAcc => ({ fraction: [] });

const GRID_COLUMNS = Math.ceil(FIELD_WIDTH / GROUND_CELL);
const GRID_ROWS = Math.ceil(FIELD_HEIGHT / GROUND_CELL);

/**
 * Marks every grid cell whose centre this patch covers, walking only the
 * patch's own bounding box clipped to the field. The shared set is what makes
 * the patches a union: a cell two patches cover is one cell.
 */
const markCellsUnder = (
  patch: { x: number; y: number; radius: number },
  counted: Set<number>,
): void => {
  const loX = Math.max(0, Math.floor((patch.x - patch.radius) / GROUND_CELL));
  const hiX = Math.min(
    GRID_COLUMNS - 1,
    Math.floor((patch.x + patch.radius) / GROUND_CELL),
  );
  const loY = Math.max(0, Math.floor((patch.y - patch.radius) / GROUND_CELL));
  const hiY = Math.min(
    GRID_ROWS - 1,
    Math.floor((patch.y + patch.radius) / GROUND_CELL),
  );
  const reach = patch.radius * patch.radius;
  for (let row = loY; row <= hiY; row++) {
    for (let column = loX; column <= hiX; column++) {
      const key = row * GRID_COLUMNS + column;
      if (counted.has(key)) continue;
      const dx = (column + 0.5) * GROUND_CELL - patch.x;
      const dy = (row + 0.5) * GROUND_CELL - patch.y;
      if (dx * dx + dy * dy <= reach) counted.add(key);
    }
  }
};

// The field fraction the open patches hold right now.
const heldFraction = (state: RunState): number => {
  const counted = new Set<number>();
  for (const patch of state.patches) {
    if (!patch.alive || patch.opening > 0) continue;
    markCellsUnder(patch, counted);
  }
  return (
    (counted.size * GROUND_CELL * GROUND_CELL) / (FIELD_WIDTH * FIELD_HEIGHT)
  );
};

const observeGroundHeld = (acc: GroundHeldAcc, state: RunState): void => {
  acc.fraction.push(heldFraction(state));
};

const groundHeldOf = (acc: GroundHeldAcc): GroundHeld => ({
  fraction: [...acc.fraction],
});

/**
 * What the fraction series reduces to, this reading's own summary declared
 * beside it, on fieldPerLine's precedent. No sum: fractions added across ticks
 * have no unit.
 */
const groundSummary = (fraction: readonly number[]): NumberRecord => ({
  max: greatestOf(fraction),
  mean: meanOf(fraction),
  last: lastOf(fraction),
});

export {
  createGroundHeld,
  observeGroundHeld,
  groundHeldOf,
  groundSummary,
  GROUND_CELL,
};
export type { GroundHeld, GroundHeldAcc };
