/**
 * The cap refusals a run made, summed over its ticks. The counters are the
 * run's own per-tick state rather than anything an event carries, so every case
 * drives a real run and reads where the invariant harness reads.
 */

import { describe, expect, it } from 'vitest';

import { createExecution, executeTick } from '../../../game/execution';
import { clearRefusals, createRun } from '../../../game/run';
import { createRefusals, observeRefusals, refusalsOf } from '../refusals';

const still = { move: { x: 0, y: 0 }, belch: false };

describe('cap refusals', () => {
  it('reads zero on a run where no cap turned anything away', () => {
    // Every cap is a safety net sized above the densest thing its pool holds,
    // so zero is what an honest run says and the reading exists to let a batch
    // report say it (ADR 0056).
    const run = createRun(20260915);
    const execution = createExecution(run);
    const acc = createRefusals();
    for (let tick = 0; tick < 200; tick++) {
      executeTick(execution, still);
      observeRefusals(acc, run);
    }

    expect(refusalsOf(acc)).toEqual({ food: 0, carriers: 0, offers: 0 });
  });

  it('adds each counter up over the run', () => {
    // Three separate counts because what the player lost differs in each: a
    // corpse is food, a carrier is power, and an offer is a whole carrier's
    // payment.
    const run = createRun(20260915);
    const acc = createRefusals();
    // Each tick's ledger, cleared between the two the way step.ts clears it.
    run.refusals.food = 2;
    run.refusals.carriers = 1;
    observeRefusals(acc, run);
    clearRefusals(run);
    run.refusals.food = 3;
    run.refusals.offers = 4;
    observeRefusals(acc, run);

    expect(refusalsOf(acc)).toEqual({ food: 5, carriers: 1, offers: 4 });
  });

  it('counts a refusal against the tick it happened on and never the one after', () => {
    // The ledger is cleared at the top of every tick and the listeners fire at
    // the end of one, so the reading sees the tick's own count exactly as
    // checkRefusals does. A reading that ran a tick late would file every
    // refusal under the wrong tick and double nothing, which is why the second
    // read below has to be zero rather than two.
    const run = createRun(20260915);
    const execution = createExecution(run);
    const acc = createRefusals();
    run.refusals.food = 2;
    observeRefusals(acc, run);
    executeTick(execution, still);
    observeRefusals(acc, run);

    expect(refusalsOf(acc).food).toBe(2);
  });
});
