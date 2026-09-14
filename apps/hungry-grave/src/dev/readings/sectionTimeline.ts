// Every section the tape crossed, and the ticks each one held.

import type { SimEvent } from '../../game/events';
import type { SectionName } from '../../game/stage/stage';
import { SECTIONS } from '../../game/stage/stage';

/**
 * One section's span on the tape, in ticks.
 *
 * `to` is the tick the section gave way on, which is the same tick its successor
 * began: a boundary is one tick and both spans name it, so the section held
 * `to - from` ticks. Null while the section is still live at the tape's end
 * (ADR 0026: a partial tape is a valid tape), which is every tape that stops
 * before the run ends and the last span of every tape that reaches the end.
 */
interface SectionSpan {
  readonly section: SectionName;
  readonly from: number;
  readonly to: number | null;
}

/**
 * Where the stage's sections fell on this tape. It is the instrument ADR 0049's
 * clock is measured with rather than intended by: the sections are as long as
 * the hand that played them made them, and this is what says how long that was.
 */
interface SectionTimeline {
  readonly spans: readonly SectionSpan[];
}

interface OpenSpan {
  readonly section: SectionName;
  readonly from: number;
  to: number | null;
}

interface SectionTimelineAcc {
  readonly spans: OpenSpan[];
}

/**
 * The timeline, opened on the section every run begins in.
 *
 * The stage announces crossings alone, so the first section has no sectionChanged
 * of its own and the opening span is this reading's to place. It is placed at
 * tick 0 of the table's first section, which is where a run begins (`createStage`
 * in `stage.ts`) and where a measured tape begins with it: a tape is a
 * recording of a run from its own first tick.
 */
const createSectionTimeline = (): SectionTimelineAcc => {
  const first = SECTIONS[0];
  if (first === undefined) throw new Error('SECTIONS is empty');
  return { spans: [{ section: first.name, from: 0, to: null }] };
};

/**
 * Every bound is the boundary event's own tick rather than the observer's,
 * because the two are one apart: the event carries the tick the sim was
 * spending when the section changed, where the observer is told how many ticks
 * have run. A timeline printed against arrivals and deaths reads on the sim's
 * clock, so that is the clock this keeps.
 */
const observeSectionTimeline = (
  acc: SectionTimelineAcc,
  events: readonly SimEvent[],
): void => {
  for (const event of events) {
    if (event.type !== 'sectionChanged') continue;
    const open = acc.spans[acc.spans.length - 1];
    if (open === undefined) throw new Error('spans is empty');
    open.to = event.tick;
    acc.spans.push({ section: event.section, from: event.tick, to: null });
  }
};

const sectionTimelineOf = (acc: SectionTimelineAcc): SectionTimeline => ({
  spans: acc.spans.map((span) => ({
    section: span.section,
    from: span.from,
    to: span.to,
  })),
});

export { createSectionTimeline, observeSectionTimeline, sectionTimelineOf };
export type { SectionSpan, SectionTimeline, SectionTimelineAcc };
