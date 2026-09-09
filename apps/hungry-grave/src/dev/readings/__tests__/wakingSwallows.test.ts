/**
 * What the grave ate while the Waking's source poured (ADR 0042, the record's
 * section 4 as amended). The span comes from the sim's own set piece, driven at
 * that module's seam the way setPiece.test.ts drives it, so the bounds are the
 * ones the game produces rather than events a test wrote.
 */

import { describe, expect, it } from 'vitest';

import { asSwallowable, spawnDrop } from '../../../game/corpses';
import type { SimEvent } from '../../../game/events';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import { advanceSetPiece, placeSetPiece } from '../../../game/stage/setPiece';
import { PHASES } from '../../../game/stage/stage';
import { swallow } from '../../../game/swallow';
import type { WakingSwallowsAcc } from '../wakingSwallows';
import {
  createWakingSwallows,
  observeWakingSwallows,
  wakingSwallowsOf,
} from '../wakingSwallows';

const SEED = 20260910;
// The phase the stage authors the pour in, so the source stands where the stage puts it.
const WAKING = PHASES.findIndex((phase) => phase.name === 'waking');
// How long the source is given to do whatever a test is waiting for.
const SOURCE_TICKS = 4000;

/** The reading driven a tick at a time, on its own clock, as the graph drives it. */
const watching = (acc: WakingSwallowsAcc) => {
  let tick = 0;
  return (events: readonly SimEvent[]): void => {
    observeWakingSwallows(acc, tick, events);
    tick += 1;
  };
};

/** One body swallowed through the sim's own swallow, and what it reported. */
const aSwallow = (state: RunState): SimEvent[] => {
  const spawned = spawnDrop(state, 100, 100);
  const born = spawned.find((event) => event.type === 'dropSpawned')!;
  const body = state.corpses.find(
    (corpse) => corpse.alive && corpse.id === born.id,
  )!;
  body.alive = false;
  return swallow(state, asSwallowable(body));
};

/** A run holding the source and nothing else, ticked at the set piece's own seam. */
const atTheSource = (): RunState => {
  const state = createRun(SEED);
  state.stage.phaseIndex = WAKING;
  placeSetPiece(state);
  return state;
};

describe('the Waking swallows', () => {
  it("counts the swallows inside the Waking's own span", () => {
    // The record's section 4 as amended: the Waking's property was listed as
    // the committing and waiting corpse counts, which is two hands compared,
    // and a batch runs one hand at a time. As a one-hand reading it is the
    // swallows between the source opening and the source closing, which is
    // what committing up the trail paid this build.
    const state = atTheSource();
    const acc = createWakingSwallows();
    const observe = watching(acc);
    const outside = 3;
    const inside = 5;

    // Swallows before the source opens, which the span must not reach back for.
    for (let each = 0; each < outside; each++) {
      expect(state.setPiece?.open).toBe(false);
      observe([...advanceSetPiece(state), ...aSwallow(state)]);
    }
    for (let tick = 0; tick < SOURCE_TICKS; tick++) {
      if (state.setPiece?.open === true) break;
      observe(advanceSetPiece(state));
    }
    expect(state.setPiece?.open).toBe(true);

    for (let each = 0; each < inside; each++) {
      observe([...advanceSetPiece(state), ...aSwallow(state)]);
    }
    for (let tick = 0; tick < SOURCE_TICKS; tick++) {
      if (state.setPiece === null) break;
      observe(advanceSetPiece(state));
    }
    expect(state.setPiece).toBeNull();

    // And swallows after it closes, which the span must not run on into.
    for (let each = 0; each < outside; each++) observe(aSwallow(state));

    const span = wakingSwallowsOf(acc).span!;
    expect(span.swallows).toBe(inside);
    expect(span.to).not.toBeNull();
    expect(span.from).toBeLessThan(span.to!);
  });

  it('reports no span at all for a run that never opened the Waking', () => {
    // The same terms as every other reading whose absence means the recording
    // cannot support it: a count of zero would say the grave ate nothing while
    // the source poured, where the truth is that no source ever poured.
    const state = createRun(SEED);
    const acc = createWakingSwallows();
    const observe = watching(acc);

    for (let tick = 0; tick < 20; tick++) observe(aSwallow(state));

    expect(wakingSwallowsOf(acc)).toEqual({ span: null });
  });
});
