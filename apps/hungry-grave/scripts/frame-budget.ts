/**
 * The frame-budget entry: a synthetic field stood at each of round 0's sizes,
 * driven through the one execution authority with its invariants checked, and
 * printed as the record's own table. Run as
 * `pnpm vite-node --config vite.frame-budget.config.ts scripts/frame-budget.ts`.
 *
 * This half measures the simulation. There is no renderer in Node, so the
 * render columns say so rather than printing a zero; the same measurement with
 * both columns is the #/frame-budget route, which runs in whatever browser
 * opens it and therefore in whatever caps that build carries.
 *
 * The logic lives in src/dev, across syntheticField.ts and frameBudget.ts,
 * neither of which may touch a clock or a renderer. So this shell sizes the
 * pools, builds the runs, holds the stopwatch, and prints.
 *
 * A field standing at the pool's capacity means the corpse cap binds the moment
 * the storm kills anything, which the invariant harness reports as a fault, and
 * that is the honest reading of a field stood at exactly its own size rather
 * than a defect: the faults are printed under the table, per row, by identity.
 */

import {
  frameBudgetOver,
  frameBudgetTable,
  ROUND_ZERO_FIELDS,
} from '../src/dev/frameBudget';
import type { FrameSpans } from '../src/dev/frameBudget';
import type { FieldSize } from '../src/dev/syntheticField';
import { sizePoolsFor } from './frameBudgetCaps';

/**
 * The seed every row plays from, pinned so two runs of this tool measure the
 * same field rather than two different ones (ADR 0012).
 */
const SEED = 505;

/**
 * Ticks driven before the stopwatch starts, so every figure is a warm engine's.
 * The first field measured pays for the whole tool's compilation, and at sixty
 * it read four times the cost of the field above it.
 */
const WARM_UP_FRAMES = 600;

// Frames timed per field, three seconds of play at the tick rate.
const TIMED_FRAMES = 180;

// The largest field about to be measured, which is what the load-time arrays are sized against.
const largestField = (fields: readonly FieldSize[]): FieldSize =>
  fields.reduce((largest, field) =>
    field.mobs > largest.mobs ? field : largest,
  );

// One field's faults, by identity, or the plain word for a field that broke none.
const faultLine = (size: FieldSize, faults: readonly string[]): string =>
  `${size.mobs} / ${size.corpses}: ${faults.length === 0 ? 'no invariant broken' : faults.join('; ')}`;

/**
 * The driver, and the fault line each field it drives leaves behind. The two
 * travel together because the reduction takes timings alone, and a field that
 * broke an invariant while being measured is the first thing a reader of the
 * table needs to know about it.
 */
interface FieldDriver {
  readonly drive: (size: FieldSize) => FrameSpans;
  readonly faults: string[];
}

/**
 * The driver, and the game it drives, loaded only once the ceiling is raised.
 *
 * The import is dynamic because raising the ceiling is import-time work for
 * everything that reads a cap at module load, and a static import would have
 * read the shipped one before the first line of this file ran.
 */
const frameDriver = async (): Promise<FieldDriver> => {
  const { createExecution, executeTick } =
    await import('../src/game/execution');
  const { createRun } = await import('../src/game/run');
  const { standSyntheticField } = await import('../src/dev/syntheticField');

  const faults: string[] = [];
  const drive = (size: FieldSize): FrameSpans => {
    sizePoolsFor(size);
    const run = createRun(SEED);
    const execution = createExecution(run);
    const sim: number[] = [];
    for (let frame = 0; frame < WARM_UP_FRAMES + TIMED_FRAMES; frame++) {
      // Outside the stopwatch and before every tick: the field is what is being
      // measured, so it is put back to its size before each tick is timed.
      standSyntheticField(run, size);
      const before = performance.now();
      executeTick(execution, { move: { x: 0, y: 0 }, belch: false });
      const after = performance.now();
      if (frame >= WARM_UP_FRAMES) sim.push(after - before);
    }
    faults.push(
      faultLine(
        size,
        execution.faults.map(
          (fault) => `${fault.identity} on ${fault.count} ticks`,
        ),
      ),
    );
    return { sim, render: [] };
  };
  return { drive, faults };
};

const main = async (): Promise<void> => {
  sizePoolsFor(largestField(ROUND_ZERO_FIELDS));
  const driver = await frameDriver();
  const rows = frameBudgetOver(ROUND_ZERO_FIELDS, driver.drive);
  console.log(frameBudgetTable(rows));
  console.log('');
  console.log(`seed ${SEED}, ${TIMED_FRAMES} timed ticks per field`);
  for (const line of driver.faults) console.log(line);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
