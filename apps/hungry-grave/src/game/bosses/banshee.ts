// The Banshee's own grammar (ADR 0007, game-concept.md:68): expanding
// tear-rings with one clean gap, and the feast her death sheds (ADR 0004).

import { TICK_HZ } from '../clock';
import { spawnFeast } from '../corpses';
import type { SimEvent } from '../events';
import { cos, sin } from '../math';
import type { FireRow } from '../mobFire';
import { fireDirectedShot } from '../mobFire';
import type { RunState } from '../run';
import { FEAST_PAYOUT } from '../tuning';
import type { Boss } from './chunks';

/**
 * One point a ring leaves from, offset from where she stands, and the bearing
 * its opening starts at in turns clockwise from straight down.
 *
 * The offsets are what chunk two escalates with: two sources whose openings
 * point the same way would still leave the player one way through, so the
 * bearing is per source rather than per ring.
 */
interface RingSource {
  readonly dx: number;
  readonly dy: number;
  readonly gapAt: number;
}

/**
 * One chunk's ring pattern (game-concept.md:68). Every number is an initial row
 * owned by the tuning pass at step 4; what is not tuning is the shape, one
 * clean gap per source and a gap that walks around the ring rather than
 * standing still.
 */
interface RingRow {
  // Ticks between rings.
  readonly period: number;
  // Spokes in a full ring, before the opening is taken out of it.
  readonly spokes: number;
  // How many adjacent spokes the opening replaces, which is the way through.
  readonly gapSpokes: number;
  // How far the opening turns from one ring to the next, in turns.
  readonly drift: number;
  /**
   * How far a ring's whole bearing may be nudged, in turns, drawn from the fire
   * stream. It is small against the drift on purpose: the walk of the gap is
   * what the player reads, and the nudge only stops a ring being the same
   * bearing at the same tick in every run ever played.
   */
  readonly jitter: number;
  readonly sources: readonly RingSource[];
}

/**
 * Her two chunks, in order: one ring source, then two offset ones so the gaps
 * stop lining up. The second chunk's openings sit half a turn apart, which is
 * the widest they can be, and its drift runs the other way so the escalation
 * reads as a change rather than as more of the same.
 */
const RING_ROWS: readonly RingRow[] = [
  {
    period: 120,
    spokes: 16,
    gapSpokes: 3,
    drift: 0.07,
    jitter: 0.02,
    sources: [{ dx: 0, dy: 0, gapAt: 0 }],
  },
  {
    period: 120,
    spokes: 16,
    gapSpokes: 3,
    drift: -0.05,
    jitter: 0.02,
    sources: [
      { dx: -70, dy: 0, gapAt: 0 },
      { dx: 70, dy: 0, gapAt: 0.5 },
    ],
  },
];

/**
 * What a tear is as mob fire. A directed shot reads the speed and the extent
 * and nothing else, because who fires and how often is the pattern's business
 * rather than a mob table row's; the other fields are declared so nothing
 * branches on a missing one, exactly as NEVER_FIRES does.
 *
 * Both are initial rows. Slow is the part that is not tuning: a tear travels
 * slower than the trash shot the player has been reading all run, which is what
 * makes a ring a shape to move through rather than a reaction test.
 */
const TEAR_FIRE: FireRow = {
  armedShare: 'none',
  interval: 0,
  firstShotJitter: 0,
  tellTicks: 0,
  shotSpeed: 80 / TICK_HZ,
  shotHalfExtent: 6,
};

// Whether this tick is one a ring leaves on.
const ringDue = (row: RingRow, patternTick: number): boolean => {
  return patternTick > 0 && patternTick % row.period === 0;
};

/**
 * One ring from one source: every spoke but the ones the opening replaces, each
 * fired along its own bearing and never re-aimed, so the shape the player reads
 * is the shape that arrives.
 */
const throwRing = (
  state: RunState,
  boss: Boss,
  row: RingRow,
  source: RingSource,
  rotation: number,
): SimEvent[] => {
  const from = { x: boss.x + source.dx, y: boss.y + source.dy };
  const events: SimEvent[] = [];
  for (let spoke = row.gapSpokes; spoke < row.spokes; spoke++) {
    const turns = (rotation + source.gapAt + spoke / row.spokes) * 2 * Math.PI;
    // Through the sim's own trigonometry, which rounds to single precision, so
    // a ring is the same ring on every engine (ADR 0015).
    const direction = { x: sin(turns), y: cos(turns) };
    events.push(
      ...fireDirectedShot(state, from, direction, TEAR_FIRE, 'banshee', 'tear'),
    );
  }
  return events;
};

/**
 * One tick of whichever chunk is live: a ring from every source of that chunk,
 * on the chunk's own clock.
 *
 * All of a tick's sources share one drawn nudge, so the offset between two
 * sources is exactly the authored one and never a pair of independent rolls
 * that could quietly close the gap between them.
 */
const advanceBanshee = (state: RunState, boss: Boss): SimEvent[] => {
  const row = RING_ROWS[boss.chunk];
  if (row === undefined || !ringDue(row, boss.patternTick)) return [];
  const ring = boss.patternTick / row.period;
  const nudge = (state.streams.mobFire.next() - 0.5) * row.jitter;
  const rotation = row.drift * ring + nudge;
  return row.sources.flatMap((source) =>
    throwRing(state, boss, row, source, rotation),
  );
};

/**
 * Her death: a feast where she fell, worth nine fresh trash corpses and never
 * decaying (ADR 0004, game-concept.md:68).
 *
 * The Wall her death launches is not fired from here. Her phase ends because
 * she is gone and the Crowd's own first row is the curtain, so the anchor
 * game-concept.md:56 names is the boundary itself: the stage never waits on the
 * swallow, and a player who never dives meets the Wall unloaded.
 */
const bansheeDied = (state: RunState, boss: Boss): SimEvent[] => {
  return spawnFeast(state, boss.x, boss.y, FEAST_PAYOUT);
};

export { advanceBanshee, bansheeDied, RING_ROWS, TEAR_FIRE };
export type { RingRow, RingSource };
