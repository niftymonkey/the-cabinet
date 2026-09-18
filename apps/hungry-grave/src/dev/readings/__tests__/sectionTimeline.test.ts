/**
 * The section timeline, read off a tape (#39's instrument list).
 *
 * The order and the bounds are held against the stage's own section table with
 * boundary ticks this file chooses, because a hand that crosses all seven
 * sections plays seven minutes of run and proves nothing more about a fold over
 * one event. The other half of the reading, what a real tape that stops inside
 * a section reports, is a claim about the measured report and spans src/dev
 * whole, so the test-span fence puts it in `src/dev/__tests__/measure.test.ts`
 * beside the up-field traffic reading's own claim.
 */

import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../../../game/events';
import { SECTIONS } from '../../../game/stage/stage';
import {
  createSectionTimeline,
  observeSectionTimeline,
  sectionTimelineOf,
} from '../sectionTimeline';

/**
 * A tick each boundary after the first section fell on, in the table's own order.
 * The figures are this test's own input and not a measurement: what the reading
 * promises is that it reports the ticks it was told about, against the sections
 * the stage authors.
 */
const CROSSED_AT = [900, 1400, 2600, 2900, 4100, 4600];

describe('section timeline', () => {
  it('reports one span per section, in order, with the tick each began on', () => {
    const accumulator = createSectionTimeline();

    SECTIONS.slice(1).forEach((section, at) => {
      const tick = CROSSED_AT[at];
      if (tick === undefined) throw new Error(`no crossing tick at ${at}`);
      const crossing: SimEvent = {
        type: 'sectionChanged',
        section: section.name,
        music: section.music,
        tick,
      };
      observeSectionTimeline(accumulator, [crossing]);
    });

    const timeline = sectionTimelineOf(accumulator);
    expect(timeline.spans).toEqual([
      { section: 'procession', from: 0, to: 900 },
      { section: 'banshee', from: 900, to: 1400 },
      { section: 'crowd', from: 1400, to: 2600 },
      { section: 'waking', from: 2600, to: 2900 },
      { section: 'vigil', from: 2900, to: 4100 },
      { section: 'undertaker', from: 4100, to: 4600 },
      { section: 'over', from: 4600, to: null },
    ]);
    // The order is the stage's own rather than a list written twice, and the
    // first section is in it although the stage announces only crossings.
    expect(timeline.spans.map((span) => span.section)).toEqual(
      SECTIONS.map((section) => section.name),
    );
  });
});
