/**
 * The section timeline, read off a tape (#39's instrument list).
 *
 * The order and the bounds are held against the stage's own phase table with
 * boundary ticks this file chooses, because a hand that crosses all seven
 * phases plays seven minutes of run and proves nothing more about a fold over
 * one event. The other half of the reading, what a real tape that stops inside
 * a section reports, is a claim about the measured report and spans src/dev
 * whole, so the test-span fence puts it in `src/dev/__tests__/measure.test.ts`
 * beside the up-field traffic reading's own claim.
 */

import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../../../game/events';
import { PHASES } from '../../../game/stage/stage';
import {
  createSectionTimeline,
  observeSectionTimeline,
  sectionTimelineOf,
} from '../sectionTimeline';

/**
 * A tick each boundary after the first phase fell on, in the table's own order.
 * The figures are this test's own input and not a measurement: what the reading
 * promises is that it reports the ticks it was told about, against the phases
 * the stage authors.
 */
const CROSSED_AT = [900, 1400, 2600, 2900, 4100, 4600];

describe('section timeline', () => {
  it('reports one span per phase, in order, with the tick each began on', () => {
    const accumulator = createSectionTimeline();

    PHASES.slice(1).forEach((phase, at) => {
      const crossing: SimEvent = {
        type: 'phaseChanged',
        phase: phase.name,
        music: phase.music,
        tick: CROSSED_AT[at],
      };
      observeSectionTimeline(accumulator, [crossing]);
    });

    const timeline = sectionTimelineOf(accumulator);
    expect(timeline.spans).toEqual([
      { phase: 'procession', from: 0, to: 900 },
      { phase: 'banshee', from: 900, to: 1400 },
      { phase: 'crowd', from: 1400, to: 2600 },
      { phase: 'waking', from: 2600, to: 2900 },
      { phase: 'vigil', from: 2900, to: 4100 },
      { phase: 'undertaker', from: 4100, to: 4600 },
      { phase: 'over', from: 4600, to: null },
    ]);
    // The order is the stage's own rather than a list written twice, and the
    // first phase is in it although the stage announces only crossings.
    expect(timeline.spans.map((span) => span.phase)).toEqual(
      PHASES.map((phase) => phase.name),
    );
  });
});
