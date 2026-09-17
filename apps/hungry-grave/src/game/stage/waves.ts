// The stage's authored waves as data (ADR 0006), the director's own table
// beside them, and the query over what the two can put on the field.

import type { MobType } from '../mobs';
import type { FormationName } from './formations';

/**
 * The repeat a wave fires on, or null on a wave that fires once (CONTEXT.md
 * Standing wave). Brotato's `repeating_interval`, `reduce_repeating_interval`
 * and `min_repeating_interval` on the resource that already carries the
 * one-shot groups: no shipped format found makes the continuous case a second
 * kind of entry (ADR 0060, docs/research/naming-the-authored-growth-rate.md).
 */
interface Repeat {
  // Seconds between two firings of this wave's own group.
  readonly intervalSeconds: number;
  /**
   * What each firing takes off that interval, and zero on a wave that holds one
   * rate, which is every standing wave the stage authors today. The field is
   * here for ADR 0060's own shape rather than for an absent caller: growth is
   * stepped at wave boundaries, and a wave that shrinks its own interval is the
   * half of Brotato's shape the ADR keeps.
   */
  readonly reduceSeconds: number;
  // The floor the interval shrinks to: a rate is a rate until it would put two groups on one tick.
  readonly minimumSeconds: number;
}

interface StageWave {
  // Section-local seconds. Waves fire when the section-local tick passes this time.
  readonly t: number;
  readonly formation: FormationName;
  /**
   * Count lives on the wave and never on the formation, so density tuning never
   * edits a playtest-proven shape.
   */
  readonly count: number;
  readonly type: MobType;
  /**
   * Whether one of this wave's mobs carries the offer (ADR 0002). Which one is
   * carriers.ts's rule and never the wave's, so a wave says only that it pays.
   */
  readonly carries: boolean;
  /**
   * Whether the director may spend in the span this wave opens (ADR 0047,
   * ADR 0056). A wave already owns a span, from its own fire until the next wave
   * fires, and a director briefed to fill gaps cannot tell an authored thin wave
   * from any other gap unless the wave itself says so. Its reader is the
   * director at step 4 (#85).
   */
  readonly directed: boolean;
  /**
   * Set on a standing wave and null on a wave that fires once. A wave with it
   * set holds its rate from its own `t` until the next standing wave the section
   * authors, so a section's growth is a run of these and nothing anywhere reads
   * a section's length (ADR 0049, ADR 0060). A section whose end waits on a
   * clear field closes its list with one authored at a rate of zero, at its
   * sparse last wave's time, or the field never reads clear and its boss never
   * arrives (ADR 0051).
   */
  readonly repeat: Repeat | null;
}

/**
 * The repeat a standing wave holds to land this many bodies a second, beside a
 * count of one, so the rate a section authors is the figure in its own table
 * and never arithmetic a reader has to do (the record's section 9).
 *
 * A rate of zero is a wave that stands and never fires again, which is what a
 * section closes on (ADR 0051).
 *
 * The floor is the interval itself, because a rate that never shrinks is
 * already sitting on its floor, and a floor written lower would be a figure
 * nothing in the run can reach.
 */
const bodiesASecond = (rate: number): Repeat => ({
  intervalSeconds: 1 / rate,
  reduceSeconds: 0,
  minimumSeconds: 1 / rate,
});

/**
 * The interval a repeat holds before its nth firing, shrunk by its own step and
 * never below its floor.
 */
const intervalBefore = (repeat: Repeat, firing: number): number =>
  Math.max(
    repeat.minimumSeconds,
    repeat.intervalSeconds - firing * repeat.reduceSeconds,
  );

/**
 * How many times a repeat has fired this many seconds after the wave's own
 * time. It walks the shrinking intervals and then divides through the one the
 * interval settles at, so a wave holding a single rate costs one division
 * however long its section runs.
 */
const repeatsBy = (repeat: Repeat, elapsed: number): number => {
  let fired = 0;
  let at = 0;
  while (intervalBefore(repeat, fired) > intervalBefore(repeat, fired + 1)) {
    at += intervalBefore(repeat, fired);
    if (at > elapsed) return fired;
    fired += 1;
  }
  return fired + Math.floor((elapsed - at) / intervalBefore(repeat, fired));
};

/**
 * How many times a wave has fired by this section-local second: once at its own
 * time, and again on every repeat since. A wave with no repeat answers 1 from
 * its own time onward and every wave answers 0 before it, which is what one
 * construct and one list means: the caller never asks which kind it holds.
 *
 * A count from the section's own start rather than a count on one tick, and
 * that is the whole of what makes it stateless: it is a pure function of the
 * time inside the section, so the stage keeps no cursor for a standing wave and
 * the witness folds no field for it. `firedWaves` exists because one-shot waves
 * are consumed; a repeat is not consumed, and a folded cursor beside it would
 * be a second source of truth for a number the time already determines.
 *
 * The stage differences two of these one tick apart, which is what the wave
 * fires on that tick. A per-tick answer read off a single time could not be
 * exact, because an interval is authored in seconds and a rate of three and a
 * half bodies a second lands nowhere near a tick boundary: every firing between
 * two boundaries would be dropped rather than delayed. A count differenced is
 * monotone, so a firing the clock rounds past arrives on the next tick instead
 * of vanishing.
 *
 * It takes section-local seconds and never ticks, because `t` and every field
 * on `Repeat` are authored in seconds and this module value-imports nothing: it
 * cannot reach TICK_HZ without taking an import that would cost it the property
 * the caps derivation depends on. stage.ts converts, through the `waveTicks` it
 * already has.
 */
const repeatingArrivals = (wave: StageWave, sectionSeconds: number): number => {
  if (sectionSeconds < wave.t) return 0;
  if (wave.repeat === null) return 1;
  return 1 + repeatsBy(wave.repeat, sectionSeconds - wave.t);
};

/**
 * The section-local second a standing wave's rate gives way to the next one's.
 *
 * A standing wave is replaced by the next wave that stands and by nothing else,
 * which is what the stage's own cursor reads: the active standing wave is the
 * last one the tick has passed. A section's shaped beats therefore fall through
 * the rate rather than ending it, which is what "the waves stay the floor"
 * asks of a floor that grows (ADR 0047, ADR 0060).
 */
const standingUntil = (waves: readonly StageWave[], index: number): number => {
  const next = waves.slice(index + 1).find((wave) => wave.repeat !== null);
  return next === undefined ? Number.POSITIVE_INFINITY : next.t;
};

/**
 * Which boss a section carries. It lives here rather than in the boss modules
 * because which boss arrives where is authored stage data, and the section column
 * that names one is written several slices before any boss module exists.
 */
type BossKind = 'banshee' | 'undertaker';

/**
 * The two kinds as a list, so a reader that has to name a wave per boss walks
 * them rather than spelling them out. The type is declared above rather than
 * derived from this, so a section column reads as a union and never as an index
 * into a table.
 */
const BOSS_KINDS: readonly BossKind[] = ['banshee', 'undertaker'];

/**
 * The three sections, as the tables' own key (ADR 0049, ADR 0050). It is the
 * key the pour's shares are read by, so a section and the rate it keeps firing
 * at under the pour cannot come apart.
 */
type TrashSectionName = 'procession' | 'crowd' | 'vigil';

/**
 * The sparse last wave's own shape (ADR 0051): how many bodies it lands, which
 * type they are, and how far apart they fall. It is a record rather than three
 * loose numbers because the three only mean anything together, and a tuning
 * pass moves the held breath by editing one wave.
 */
interface SparseShape {
  readonly bodies: number;
  // In the wave's own unit, seconds, so a table reads in one clock.
  readonly spacingSeconds: number;
  readonly type: MobType;
}

/**
 * The initial shape, from the design record: four bodies, shamblers, one every
 * ninety ticks, which is a second and a half in the wave's own unit.
 *
 * The type is the part worth reading rather than tuning. The ghoul closes,
 * which would turn a held breath into a chase, and every revenant is armed, so
 * a thin wave of revenants is less traffic and more fire, which is the opposite
 * of the beat this wave is.
 */
const SPARSE_LAST_WAVE: SparseShape = {
  bodies: 4,
  spacingSeconds: 1.5,
  type: 'shambler',
};

/**
 * The sparse last wave as waves (ADR 0051): one body at a time from `from`, the
 * shape's spacing apart, replacing the spawn silence a boss used to arrive
 * after. Each body is its own Drip, because a wave lands its whole count at once
 * and what this wave is for is bodies arriving one after another.
 *
 * It carries no offer, because a carrier here would pay a player for the beat
 * before a fight rather than for the section, and the director may not spend in
 * it: it is the held breath, and a director briefed to fill gaps would fill
 * this one (ADR 0047).
 */
const sparseLastWave = (
  from: number,
  shape: SparseShape,
): readonly StageWave[] =>
  Array.from({ length: shape.bodies }, (_body, index): StageWave => ({
    t: from + index * shape.spacingSeconds,
    formation: 'drip',
    count: 1,
    type: shape.type,
    carries: false,
    directed: false,
    repeat: null,
  }));

/**
 * The Procession, to the Banshee. It owns emptiness: a group arrives, the field
 * clears, and there is a beat of empty ground before the next falls. That gap is
 * where a corpse sits alone long enough for the player to decide to go and get
 * it, and where a revenant's tell is legible because nothing else is on screen.
 *
 * The property is one live shaped formation above the standing wave, held as
 * Section.liveFormationCeiling and read by the director rather than by an
 * invariant: these beats stand about nine seconds apart against a body that
 * takes roughly fifteen seconds to fall unkilled, so a player who kills slowly
 * holds two formations with nothing wrong.
 *
 * Three standing waves carry the mow under those beats, at two, three and a
 * half and five bodies a second, and a fourth closes the section at zero
 * (ADR 0060). They are Rains, because the Rain is the density filler a section
 * turns up when its property asks for it and a rate is exactly that ask: a Drip
 * repeating would be a column down one lane rather than ground filling in. The
 * shaped beats above the mow are still only Files and Vs beside the Drips, and
 * the Pincer is two files at once, which no section holding one shaped
 * formation live wants. No ghoul: the closer arrives in the next section. A
 * type arriving first as a lone Drip is the standing rule (ADR 0016's
 * readable-before-it-acts), which is why the cairn's own lone Drip stands here
 * and not in the Crowd, where its only appearance is eighteen at once.
 *
 * Which waves may carry is a property of the table rather than of the schedule,
 * so it is authored here and the placement is carriers.ts's. The Drips are held
 * clear on purpose. The opening shambler Drip is held clear because the first
 * kill of the run teaches the swallow; the lone revenant Drip after it is the
 * game's first mob fire, which the mow body can no longer teach because it
 * carries no fire (ADR 0059), so the lesson lands on one revenant standing by
 * itself with nothing else on screen (ADR 0016's readable-before-it-acts); and
 * the run's first tell and its first offer stay two different moments rather
 * than one body doing both jobs. No standing wave carries either: the
 * twenty-five carriers are authored placements and the ladder's whole supply
 * (ADR 0048), and a rate that carried would hand out rungs at a figure nobody
 * wrote down.
 *
 * Every count, every time and every rate here is an initial row owned by the
 * tuning pass. What is not tuning is the shape: one shaped formation live above
 * the mow, Drips before a type appears in numbers, no ghoul, a carrier on no
 * Drip and on no rate, and a rate of zero before the held breath.
 */
const PROCESSION_WAVES: readonly StageWave[] = [
  {
    t: 2,
    formation: 'drip',
    count: 1,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 11,
    formation: 'drip',
    count: 1,
    type: 'revenant',
    carries: false,
    directed: true,
    repeat: null,
  },
  // The mow opens here, a second behind the lone revenant, because the first
  // swallow and the game's first mob fire each have to arrive alone
  // (ADR 0016) and because ADR 0015's golden scenario runs ten seconds from a
  // pinned seed and must keep roughly the field it has.
  {
    t: 12,
    formation: 'rain',
    count: 1,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: bodiesASecond(2),
  },
  {
    t: 21,
    formation: 'file',
    count: 10,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 31,
    formation: 'drip',
    count: 2,
    type: 'revenant',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 40,
    formation: 'drip',
    count: 4,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  /**
   * The cairn arrives here, first as a lone Drip, which is the standing rule
   * for a type before it appears in numbers (ADR 0016's readable-before-it-acts).
   * It is the Wall's own body and the Wall is a Crowd wave, so without this the
   * player's first cairn would be eighteen of them at once.
   *
   * The slot is this gap and not a later one. The lesson is that the storm does
   * not take this body down, which is only readable while the ground is thin:
   * the mow is still at two bodies a second until t=45, the section authors
   * nothing shaped between t=40 and t=50, and by here a run has rungs enough
   * that failing to kill one reads as the body rather than as the build. It
   * sits well outside the golden scenario's six hundred ticks (ADR 0015).
   */
  {
    t: 44,
    formation: 'drip',
    count: 1,
    type: 'cairn',
    carries: false,
    directed: true,
    repeat: null,
  },
  // The ground thickens, a third of the way through the section's own length.
  {
    t: 45,
    formation: 'rain',
    count: 1,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: bodiesASecond(3.5),
  },
  {
    t: 50,
    formation: 'v',
    count: 8,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 59,
    formation: 'file',
    count: 12,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 68,
    formation: 'v',
    count: 8,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 77,
    formation: 'file',
    count: 12,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  // And again, for the last third before the held breath.
  {
    t: 78,
    formation: 'rain',
    count: 1,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: bodiesASecond(5),
  },
  {
    t: 86,
    formation: 'v',
    count: 10,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 95,
    formation: 'file',
    count: 12,
    type: 'revenant',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 103,
    formation: 'v',
    count: 10,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  /**
   * The rate the section closes on (ADR 0051): a standing wave at zero, half a
   * second ahead of the sparse last wave so the mow's own last body is already
   * falling when the held breath opens. It is the pick the stage reads, so it
   * is what ends the rate above it, and without it the mow keeps arriving under
   * the held breath, the field never reads clear and the Banshee never comes.
   *
   * It lands no body, because the beat the section closes on is the sparse last
   * wave and not a group arriving beside it, and the director may not spend in
   * the span it opens for the same reason that wave's own cells say so.
   */
  {
    t: 111.5,
    formation: 'rain',
    count: 0,
    type: 'shambler',
    carries: false,
    directed: false,
    repeat: bodiesASecond(0),
  },
  // The section's own nine-second cadence carries into the last wave, so the
  // held breath is slower rather than empty.
  ...sparseLastWave(112, SPARSE_LAST_WAVE),
];

/**
 * The Crowd, to the Waking. It owns overlap: Rain under a Pincer, a V through
 * Rain. Corpses stop being objects the player chooses between and become a floor
 * the grave swims through, and the question stops being whether one corpse is
 * reachable and becomes which of these still is.
 *
 * It opens on the Wall two seconds after the Banshee dies, which is the anchor
 * the concept doc names, and the Wall's own wave is the one cell in this table
 * the director may not spend in: the curtain's property fails silently with
 * every test still green (ADR 0047), and its count is derived from the body's
 * own width rather than authored as density, so an added body thickens nothing
 * and only stands where the curtain has no room for it.
 *
 * The ghoul arrives here, first as a lone Drip.
 *
 * Three standing waves carry the mow, at eight, three and twelve bodies a
 * second (ADR 0060). The three is the deliberate trough, thin ground under thin
 * Drips, so the Waking at the end lands against something rather than against a
 * sustained peak, and it is a wave somebody wrote rather than a dip in a curve.
 * It is a run of waves and nothing more: the music does not change inside a
 * section, so a held bar under the trough would be an audio state built for one
 * wave.
 *
 * The section closes on no rate of zero, because it ends on the eye opening
 * rather than on a field that reads clear (ADR 0051), and the rate it is
 * standing at is carried into the Waking under the pour instead.
 *
 * The property is a floor of two live formations and it carries no ceiling row,
 * because a director that adds and never removes cannot break a floor.
 *
 * Every count, every time and every rate is an initial row. What is not tuning
 * is the shape: two formations always overlapping, the Wall first and
 * undirected, the ghoul's lone Drip before any ghoul in numbers, and one trough
 * before the end.
 *
 * The Wall's eighteen is not a density row and never doubles with the others:
 * it is the field's width over a body's, and `wall()` spaces its bodies at the
 * width divided by the count, so a count over the derivation would stack a
 * curtain on itself rather than thicken it and a count under it would leave a
 * hole the grave walks through unbelched. The body is the cairn, 30 units
 * wide, and 540 over 30 is eighteen exactly, so the curtain closes edge to edge
 * with no gap at all; it was twenty-two while the body was the 22-unit
 * shambler. A body of another width moves this count with it.
 */
const CROWD_WAVES: readonly StageWave[] = [
  {
    t: 2,
    formation: 'wall',
    count: 18,
    type: 'cairn',
    carries: false,
    directed: false,
    repeat: null,
  },
  // The mow opens four seconds behind the curtain, which is the beat the Wall
  // is crossed in: a rate running under it would fill the lane the storm opens
  // before the player has read the curtain at all.
  {
    t: 6,
    formation: 'rain',
    count: 1,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: bodiesASecond(8),
  },
  {
    t: 8,
    formation: 'rain',
    count: 12,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  // The ghoul's own teaching Drip, and the one shaped count in the section the
  // doubling does not reach: a type arrives first as a lone body with nothing
  // else of its kind on screen, which is ADR 0016's readable-before-it-acts.
  {
    t: 12,
    formation: 'drip',
    count: 1,
    type: 'ghoul',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 15,
    formation: 'pincer',
    count: 16,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 21,
    formation: 'v',
    count: 10,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 25,
    formation: 'rain',
    count: 16,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 29,
    formation: 'file',
    count: 10,
    type: 'revenant',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 33,
    formation: 'pincer',
    count: 16,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 36,
    formation: 'rain',
    count: 16,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 40,
    formation: 'v',
    count: 10,
    type: 'ghoul',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 44,
    formation: 'rain',
    count: 20,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 48,
    formation: 'pincer',
    count: 16,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 52,
    formation: 'v',
    count: 10,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  /**
   * The trough, and it is a standing wave somebody wrote rather than a dip in a
   * curve: a reader sees three consecutive rates instead of one rate with an
   * exception carved into it, which is what Mad Forest does at its own minutes
   * five and eight (the record's section 5 item 3).
   *
   * It steps a second ahead of the thin Drips it runs under, so the ground
   * thins first and the beats follow it down.
   */
  {
    t: 57,
    formation: 'rain',
    count: 1,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: bodiesASecond(3),
  },
  {
    t: 58,
    formation: 'drip',
    count: 4,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 64,
    formation: 'drip',
    count: 4,
    type: 'revenant',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 70,
    formation: 'drip',
    count: 6,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 76,
    formation: 'drip',
    count: 4,
    type: 'ghoul',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 79,
    formation: 'drip',
    count: 6,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  // Out of the trough and into the section's own climax, which the Waking then
  // lands on top of.
  {
    t: 81,
    formation: 'rain',
    count: 1,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: bodiesASecond(12),
  },
  {
    t: 82,
    formation: 'rain',
    count: 16,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 85,
    formation: 'pincer',
    count: 16,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 90,
    formation: 'v',
    count: 10,
    type: 'ghoul',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 94,
    formation: 'rain',
    count: 20,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 98,
    formation: 'file',
    count: 12,
    type: 'revenant',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 102,
    formation: 'pincer',
    count: 16,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 106,
    formation: 'rain',
    count: 20,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 110,
    formation: 'v',
    count: 10,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 114,
    formation: 'pincer',
    count: 16,
    type: 'ghoul',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 118,
    formation: 'rain',
    count: 24,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 122,
    formation: 'v',
    count: 10,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 126,
    formation: 'pincer',
    count: 16,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 130,
    formation: 'rain',
    count: 24,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 133,
    formation: 'v',
    count: 10,
    type: 'ghoul',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 136,
    formation: 'pincer',
    count: 16,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 138,
    formation: 'rain',
    count: 24,
    type: 'shambler',
    carries: true,
    directed: true,
    repeat: null,
  },
];

/**
 * The Vigil, to the Undertaker. It owns scarcity: less growth paid per second
 * than the Crowd, and tougher bodies. The roster inverts to revenants and ghouls
 * with the shambler thinned, so the field is more fire and less food and the
 * swallow cadence drops without a single new system being added.
 *
 * The quantity is growth paid per second and never corpses per second. A
 * revenant corpse pays double a shambler's, so a roster that halves the bodies
 * and doubles their payout is flat rather than scarce, and a corpses-per-second
 * rule would pass while the section fed better than the one before it. What
 * keeps the rate down is time to kill as much as arrivals: a revenant costs 64
 * points of storm against a shambler's 40, so the same storm clears fewer bodies
 * a second.
 *
 * The property is a ceiling of four live bodies against an authored steady state
 * of about two, which is the headroom the director may spend into and no more.
 * Like the Procession's it binds the director and never the authored waves.
 *
 * Shortest of the three on purpose, because the Undertaker has to carry the end.
 *
 * It authors no standing wave at all, and that absence is the section's own
 * property rather than an omission (ADR 0060): a rate here would pass a
 * corpses-per-second reading while feeding the player better than the Crowd
 * did, because a revenant corpse pays double. A test fails if a repeat appears
 * in this table.
 *
 * Every count and every time is an initial row. What is not tuning is the shape:
 * a fall in growth paid per second against the Crowd, a roster of revenants
 * and ghouls with the shambler thinned, and no standing wave.
 */
const VIGIL_WAVES: readonly StageWave[] = [
  {
    t: 2,
    formation: 'file',
    count: 8,
    type: 'revenant',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 8,
    formation: 'drip',
    count: 4,
    type: 'ghoul',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 14,
    formation: 'v',
    count: 10,
    type: 'revenant',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 19,
    formation: 'drip',
    count: 4,
    type: 'shambler',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 24,
    formation: 'file',
    count: 8,
    type: 'ghoul',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 29,
    formation: 'pincer',
    count: 12,
    type: 'revenant',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 34,
    formation: 'v',
    count: 10,
    type: 'ghoul',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 39,
    formation: 'drip',
    count: 4,
    type: 'revenant',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 44,
    formation: 'file',
    count: 8,
    type: 'revenant',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 49,
    formation: 'v',
    count: 10,
    type: 'ghoul',
    carries: false,
    directed: true,
    repeat: null,
  },
  {
    t: 53,
    formation: 'pincer',
    count: 12,
    type: 'revenant',
    carries: true,
    directed: true,
    repeat: null,
  },
  {
    t: 58,
    formation: 'v',
    count: 10,
    type: 'ghoul',
    carries: false,
    directed: true,
    repeat: null,
  },
  // The same beat on this section's own five-second cadence.
  ...sparseLastWave(63, SPARSE_LAST_WAVE),
];

/**
 * One thing the director may buy with a purse (CONTEXT.md Card): a formation, a
 * mob type and a count, which is the same triple a StageWave carries, because
 * an add is a card and never a loose body.
 *
 * It lives in this module rather than in the director's, and so does everything
 * below it, because caps.ts derives from these figures and may not import the
 * director: this is the one stage module that value-imports nothing, so it is
 * the one a derivation can read from without closing a cycle.
 */
interface DirectorCard {
  readonly formation: FormationName;
  readonly type: MobType;
  readonly count: number;
}

/**
 * What one body of each type costs a purse, against the roster's own health and
 * threat at 8, 20 and 64 (the record's section 5 item 6). Initial rows owned by
 * the tuning pass; what is not tuning is the order, which is the roster's.
 */
const BODY_COST: Readonly<Record<MobType, number>> = {
  shambler: 1,
  ghoul: 3,
  revenant: 4,
  // The dearest body in the table, because it is the one the storm does not
  // clear: at 2206 it stands its whole descent under the ceiling build, where
  // the other three are 1, 3 and 8 skulls apiece under a birthright. No card
  // names it, and this figure is what one would cost if a later card did.
  cairn: 8,
};

/**
 * What a card costs: the sum over its bodies. A purse spends on cards and never
 * on single bodies, so what arrives is always a shape the player can read.
 */
const cardCost = (card: DirectorCard): number =>
  BODY_COST[card.type] * card.count;

/**
 * The cards themselves. **The rows are authored here and no source states
 * them**: the record and the plan give the cost rule, the shape and two worked
 * examples, a File of four shamblers at 4 and a Drip of two revenants at 8
 * (the record's section 5 item 6), and both stand below as the cited rows. The
 * rest are set from the formations and types the section tables already use.
 *
 * Every count is small on purpose. The largest card is an addend on the mob cap
 * and a padded cap is paid on every tick of every run, so the table buys its
 * range with types rather than with counts: a Drip of two revenants costs twice
 * a Rain of six shamblers and puts a third of the bodies down.
 *
 * No Wall and no Pincer. The Wall is the one authored wave the director may not
 * add over (ADR 0047), and a Pincer is two Files at once, which is two shapes
 * arriving where a card is meant to be one.
 */
const CARDS: readonly DirectorCard[] = [
  { formation: 'drip', type: 'ghoul', count: 1 },
  // The record's own worked card, at a cost of eight.
  { formation: 'drip', type: 'revenant', count: 2 },
  // The record's own worked card, at a cost of four.
  { formation: 'file', type: 'shambler', count: 4 },
  { formation: 'file', type: 'ghoul', count: 3 },
  { formation: 'v', type: 'shambler', count: 5 },
  { formation: 'rain', type: 'shambler', count: 6 },
];

/**
 * The most bodies one card can put on the field at once: over the whole table,
 * or over one type's cards alone when a type is named.
 *
 * It is the mob cap's director term and never a purse. A purse is spent over a
 * section with a quiet interval between every add, so a purse-sized addend
 * would size the pool for a moment the quiet interval forbids; the largest card
 * is the most the director can put down at once, which is what a pool has to
 * hold (the record's section 5 item 6, the plan's first rule).
 */
const largestCard = (type: MobType | null): number =>
  CARDS.filter((card) => type === null || card.type === type).reduce(
    (most, card) => Math.max(most, card.count),
    0,
  );

/**
 * One emitter's fire, in the three figures a pool derivation needs and nothing
 * else: what one emit puts in the air, how often it emits and how fast a shot
 * travels.
 *
 * Every row below mirrors one that lives somewhere caps.ts cannot reach.
 * mobs.ts value-imports caps.ts and so does every boss module through it, so
 * reading the revenant's fire row or a boss's pattern from the derivation would
 * close a cycle. The mirror is guarded: waves.test.ts fails the day one of
 * these and the row it mirrors disagree.
 */
interface ShotPattern {
  readonly shots: number;
  readonly everySeconds: number;
  readonly unitsASecond: number;
}

/**
 * The revenant's fire, mirroring MOB_TYPES.revenant.fire in mobs.ts: one aimed
 * shot every 150 ticks at 110 field units a second. It is the only trash type
 * that fires at all, because the mow body carries no fire and the ghoul closes
 * instead (ADR 0059).
 */
const REVENANT_FIRE: ShotPattern = {
  shots: 1,
  everySeconds: 2.5,
  unitsASecond: 110,
};

/**
 * What one boss phase has firing at once. It is a list because the Undertaker's
 * last phase runs a curtain and an arm together, and what a pool has to hold at
 * that moment is both.
 */
type FirePhase = readonly ShotPattern[];

/**
 * One boss's phases, in the order its own module declares them. The order is
 * load-bearing rather than presentational: a phase break clears nothing from
 * the air, so what a pool meets at a break is the phase that just ended still
 * flying while the next one opens, and only a reader that knows which phase
 * follows which can price that.
 */
type BossFire = readonly FirePhase[];

/**
 * Every boss's fire, mirroring RING_ROWS and TEAR_FIRE in bosses/banshee.ts and
 * CURTAIN_ROWS, SPIRAL_ROWS, CLOD_FIRE and SPIRAL_FIRE in
 * bosses/undertaker.ts. A ring's shots are its spokes less the opening, once
 * per source; a curtain's are its clods; the arm fires one shot at a time.
 *
 * Kept per boss rather than as one flat list, because two phases share the pool
 * only where one follows the other, and the Banshee dies a section before the
 * Undertaker arrives.
 */
const BOSS_FIRE: Readonly<Record<BossKind, BossFire>> = {
  banshee: [
    // Her first phase: one source, thirteen spokes of a sixteen-spoke ring.
    [{ shots: 13, everySeconds: 2, unitsASecond: 80 }],
    // Her second: two offset sources, so the openings stop lining up.
    [{ shots: 26, everySeconds: 2, unitsASecond: 80 }],
  ],
  undertaker: [
    // The burial: a twelve-clod curtain every four seconds.
    [{ shots: 12, everySeconds: 4, unitsASecond: 95 }],
    // The exhumation: the arm alone, a shot every quarter second.
    [{ shots: 1, everySeconds: 0.25, unitsASecond: 85 }],
    // The two locked together, with the curtain thinned to pay for it.
    [
      { shots: 8, everySeconds: 4, unitsASecond: 95 },
      { shots: 1, everySeconds: 0.25, unitsASecond: 85 },
    ],
  ],
};

/**
 * The Waking's pour, as data (ADR 0042, ADR 0050). The source's behaviour is
 * setPiece.ts's and every magnitude it runs on is here, one direction only:
 * peakArrivals below needs the pour's rate, and setPiece.ts spawns through
 * mobs.ts, which reads caps.ts, which reads this query. A waves.ts that asked
 * setPiece.ts for the rate would close that circle.
 *
 * All initial rows, tuned by the harness at step 4, with the arithmetic in the
 * design record's section 2.
 */

/**
 * Bodies the source pours before it is spent. Seventy-five at the interval
 * below is seven and a half seconds of pour, which is shorter than the source's
 * own descent, so the ordinary end is the budget rather than the bottom edge.
 *
 * The figure itself did not move under the mow and the length it buys did: the
 * pour lands the same bodies in half the time, which is what keeps it the
 * loudest beat in the run rather than a longer one.
 */
const SET_PIECE_BUDGET = 75;

/**
 * How long the source waits between bodies, in the table's own clock. A tenth
 * of a second is one body every six ticks, ten a second, which is a little over
 * a third again the densest ten seconds the sections author: the loudest beat
 * in the run must not arrive thinner than the section it interrupts.
 *
 * It is that relation and never a figure, so it moves whenever the tables it
 * reads move. It was a fifth of a second against a densest ten seconds of 36,
 * and the mow's doubled shaped counts put that at 74 (ADR 0059, ADR 0060),
 * which the old interval no longer cleared. The section's own rate is thinned
 * to its share underneath the pour, so what the pour must out-pace is the
 * section's beats and not the rate it is standing on.
 *
 * Seconds and not ticks because this module value-imports nothing, so it cannot
 * know how long a tick is. setPiece.ts holds the clock and converts.
 */
const SET_PIECE_POUR_SECONDS = 0.1;

/**
 * The source's own health, which only the open source can lose (ADR 0050).
 *
 * What it buys is the source's stay: how long the body stands as a target the
 * storm can work on and a thing on the ground to read. The pour finishes on its
 * budget whatever the storm did (Mark's ruling on #104), so the wave no longer
 * carries that, and it stays an initial row for the step 4 harness to measure.
 */
const SET_PIECE_HP = 2400;

/**
 * The bounds the source sweeps between, in field units. The trail stays inside
 * the field's middle three fifths, so it is a curve the dive can follow rather
 * than a wall of corpses in the gutter a body walking in at an edge leaves.
 */
const SET_PIECE_SWEEP_MIN_X = 108;
const SET_PIECE_SWEEP_MAX_X = 432;

/**
 * The section-local second the Crowd places the dormant source (ADR 0050).
 *
 * Five seconds before the eye opens, so it opens a beat after the section's own
 * last group falls at second 138 and the Crowd's climax fires before the eye
 * ends the section. Placed any earlier the eye rides down through waves it is
 * about to cut off; any later and the Crowd holds a stretch with nothing due,
 * which is the spawn silence ADR 0051 retired.
 *
 * The five seconds are the fall to the opening depth below at the field's own
 * scroll, authored rather than computed: this module value-imports nothing, so
 * it cannot read the field's height or the scroll to derive it.
 */
const SET_PIECE_PLACED_AT = 135;

/**
 * How deep the source opens, as a share of the field's height. A share rather
 * than a depth in field units, because this module cannot read the field and
 * the fact being authored is where in the player's view it happens rather than
 * how many units down that is.
 *
 * A quarter down, so the pour's own seven and a half seconds at the field's
 * scroll fit between the opening and the bottom edge with room over: the
 * source's ordinary end is its budget running out and never the edge arriving.
 * Mark's ruling of 2026-09-08 supersedes decision 25's "opens around mid-field",
 * which was written while the source drifted at half the scroll.
 */
const SET_PIECE_OPEN_DEPTH = 0.25;

/**
 * The body the storm meets once the source has opened, in field units. Initial
 * waves: wide enough that a dive lands on it without aiming and smaller than a
 * boss, because it is a mouth on the ground rather than a fight standing up.
 */
const SET_PIECE_HALF_WIDTH = 45;
const SET_PIECE_HALF_HEIGHT = 30;

/**
 * What the pour puts on the field. It is a wave and not a name in setPiece.ts,
 * because ADR 0042 rules that a set piece names the property it must keep and
 * never the cast, so re-casting the pour is a data edit.
 *
 * The shambler and not the other two, and each for its own reason. The ghoul
 * closes, which would turn a trail the grave swims up into a chase that comes
 * to it, and the trail is the whole property. Every revenant is armed, so a
 * pour of them is a wall of fire, and ADR 0050 forbids the set piece being a
 * second dose of hell.
 */
const POUR_TYPE: MobType = 'shambler';

/**
 * How far off the source's centre a poured body lands, and how far a draw moves
 * it (ADR 0042's narrow answer to #81, for this one caller).
 *
 * The mouth pours from alternating lips rather than from one point, so two
 * bodies in a wave are never stacked on each other: the lips stand far enough
 * apart that the widest trash body fits between them, and the jitter is bounded
 * under that gap so a draw can never close it. The jitter is what keeps the
 * pour a spray rather than a metronome, and it is the one place chance enters
 * the moment.
 */
const POUR_LIP_X = 22;
const POUR_JITTER_X = 6;

/**
 * The share of its own authored rate a section keeps while the set piece pours,
 * so it thins under the pour rather than going silent (ADR 0051). One wave per
 * section and no optional key: only the Crowd is ever under a pour, because the
 * source is placed by one of its own waves, and the other two say 1 rather than
 * saying nothing.
 */
const POUR_SHARES: Readonly<Record<TrashSectionName, number>> = {
  procession: 1,
  crowd: 1 / 3,
  vigil: 1,
};

/**
 * How long a full pour lasts, in the table's own clock. It is the budget at the
 * interval and never a length written down, so a retune of either moves the
 * moment and everything sized against it together.
 */
const POUR_SECONDS = SET_PIECE_BUDGET * SET_PIECE_POUR_SECONDS;

/**
 * The waves a section keeps firing under a pour (ADR 0051: "there is no
 * drain-out before the set piece ... only the two boss boundaries need the
 * field empty").
 *
 * Its own last waves, carried on into the section the pour runs in and thinned to
 * the share it keeps: the same formations, the same types, in the same cadence,
 * with fewer bodies in each. A section that stopped would hand the loudest beat
 * in the run a silent field, which is the one thing ADR 0051 rules out here.
 *
 * A wave never thins to nothing, because a wave that lands no body is the silence
 * the share exists to avoid; and none of them carries, because the twenty-five
 * carriers are authored across the three sections and a pour pays in corpses
 * rather than in power (ADR 0048). The director may not spend in any of them:
 * the set piece is one of ADR 0047's four off-limits moments.
 *
 * The rate comes in with them. The standing wave the section is holding when
 * the pour opens is carried in at the pour's own first second, because a floor
 * that stopped at the boundary would hand the loudest beat in the run a field
 * that had just gone quiet. A rate thins by interval and never by count: its
 * count is one group's bodies and its rate is the seconds between them, so
 * thinning a count already at one would silence it while the interval said
 * otherwise.
 */
const thinnedByTheShare = (
  repeat: Repeat | null,
  share: number,
): Repeat | null =>
  repeat === null
    ? null
    : {
        intervalSeconds: repeat.intervalSeconds / share,
        reduceSeconds: repeat.reduceSeconds / share,
        minimumSeconds: repeat.minimumSeconds / share,
      };

/** The standing wave a section is holding at this section-local second, if any. */
const standingAt = (
  waves: readonly StageWave[],
  seconds: number,
): StageWave | null =>
  waves.reduce<StageWave | null>(
    (standing, wave) =>
      wave.repeat !== null && wave.t <= seconds ? wave : standing,
    null,
  );

const wavesUnderThePour = (
  waves: readonly StageWave[],
  share: number,
  seconds: number,
): readonly StageWave[] => {
  const lastWave = waves[waves.length - 1];
  if (lastWave === undefined)
    throw new Error('wavesUnderThePour given no waves');
  const opensAt = lastWave.t - seconds;
  const carried = waves
    .filter((wave) => wave.t > opensAt)
    .map((wave) => ({
      t: wave.t - opensAt,
      formation: wave.formation,
      count: Math.max(1, Math.round(wave.count * share)),
      type: wave.type,
      carries: false,
      directed: false,
      repeat: thinnedByTheShare(wave.repeat, share),
    }));
  const standing = standingAt(waves, opensAt);
  if (standing === null) return carried;
  return [
    {
      t: 0,
      formation: standing.formation,
      count: standing.count,
      type: standing.type,
      carries: false,
      directed: false,
      repeat: thinnedByTheShare(standing.repeat, share),
    },
    ...carried,
  ];
};

/**
 * The Waking's own waves: the Crowd's last groups, still falling under the pour
 * at the share that section keeps (ADR 0050, ADR 0051).
 *
 * The section itself is the source's moment and ends when the source is gone, so
 * these waves are what the pour lands into rather than what the section runs on.
 */
const WAKING_WAVES: readonly StageWave[] = wavesUnderThePour(
  CROWD_WAVES,
  POUR_SHARES.crowd,
  POUR_SECONDS,
);

/**
 * Bodies a boss's own adds may put on the field inside a freshness window
 * (ADR 0007). An initial row: diggers at one every ninety ticks through the
 * Undertaker's second and third phases are about seven in ten seconds.
 */
const BOSS_ADD_ALLOWANCE = 7;

/**
 * Rungs a hit can strip onto the field inside one (ADR 0055). An initial row,
 * bounded twice over: by the hit clock, since INVULNERABLE_TICKS is 24 and no
 * more than 25 hits fit in ten seconds, and by the build, since a full build
 * from the birthright is nineteen rungs. The build is the tighter bound.
 */
const RUNG_ALLOWANCE = 19;

// The three sections, under the key the pour's shares are read by.
const SECTION_TABLES: Readonly<Record<TrashSectionName, readonly StageWave[]>> =
  {
    procession: PROCESSION_WAVES,
    crowd: CROWD_WAVES,
    vigil: VIGIL_WAVES,
  };

/**
 * The section the pour ever falls on: the source is placed by one of the
 * Crowd's own waves and opens as the Crowd's boundary event, so the Crowd is the
 * one table that ever fires under a pour.
 */
const POURED_SECTION: TrashSectionName = 'crowd';

/**
 * What a standing wave lands inside a window beyond the first group the walk
 * below already counts: every repeat that falls in the window while this wave
 * is still the section's standing one (ADR 0056).
 *
 * The moment a table authors a rate this term is what keeps the corpse cap a
 * proof rather than an estimate, because a table that authors a rate would
 * otherwise price identically to one that does not.
 *
 * One firing more than the overlap holds, because a window slid off a wave's
 * own time can carry one firing more than the same length measured from it, and
 * a cap that priced the lower of the two would bind on the beat it named.
 */
const repeatsInWindow = (
  waves: readonly StageWave[],
  index: number,
  from: number,
  seconds: number,
  type: MobType | null,
): number => {
  const wave = waves[index];
  if (wave === undefined || wave.repeat === null) return 0;
  const opens = Math.max(from, wave.t);
  const closes = Math.min(from + seconds, standingUntil(waves, index));
  if (closes <= opens) return 0;
  const over =
    repeatingArrivals(wave, closes) - repeatingArrivals(wave, opens) + 1;
  return over * bodiesOf(wave, type);
};

/**
 * The bodies of a wave a walk counts: all of them, or none when a type is named
 * and the wave lands another. The walk that finds the standing wave a rate ends
 * at still reads every wave, so narrowing to a type never lets one section's
 * rate run on past the next.
 */
const bodiesOf = (wave: StageWave, type: MobType | null): number =>
  type === null || wave.type === type ? wave.count : 0;

// The bodies a table's waves put on the field in the window that opens at this second.
const arrivalsFrom = (
  waves: readonly StageWave[],
  from: number,
  seconds: number,
  type: MobType | null,
): number =>
  waves.reduce(
    (total, wave, index) =>
      total +
      (wave.t >= from && wave.t < from + seconds ? bodiesOf(wave, type) : 0) +
      repeatsInWindow(waves, index, from, seconds, type),
    0,
  );

/**
 * A table's densest window. Only a window that opens on a wave can be the
 * densest: sliding one earlier admits nothing and can only drop the wave it
 * opened on. A standing wave's rate is flat inside its own span, so sliding
 * cannot admit more of it either, and the firing the term above adds is what
 * covers the one a slide could move across the edge.
 */
const peakInTable = (
  waves: readonly StageWave[],
  seconds: number,
  type: MobType | null,
): number =>
  waves.reduce(
    (most, wave) => Math.max(most, arrivalsFrom(waves, wave.t, seconds, type)),
    0,
  );

/**
 * The pour's own window: what the source lands in a window of this length,
 * bounded by its budget, plus what the section under it keeps firing at its
 * reduced share.
 *
 * The share is rounded up, because a fraction of a body is a whole body
 * arriving and a cap that rounds its own worst case down can bind on the beat
 * the worst case named.
 */
const pourWindow = (seconds: number): number => {
  const poured = Math.min(
    SET_PIECE_BUDGET,
    Math.floor(seconds / SET_PIECE_POUR_SECONDS),
  );
  const under = peakInTable(SECTION_TABLES[POURED_SECTION], seconds, null);
  return poured + Math.ceil(POUR_SHARES[POURED_SECTION] * under);
};

/**
 * The most bodies the stage can put on the field inside any window of this
 * length, anywhere in the stage (ADR 0056). Every term is a wave in this module,
 * so the query reads data and calls nothing that spawns.
 *
 * It is a maximum over windows and never a sum of them. A boss section authors no
 * waves, so its window is what a boss sheds plus what a hit strips; the Waking's
 * is the pour plus the Crowd's reduced share; a section's is what its own table
 * authors. Taking the largest is the worst case, and adding them would price a
 * window the stage cannot produce.
 */
const peakArrivals = (seconds: number): number => {
  if (seconds <= 0) return 0;
  const sections = Object.values(SECTION_TABLES).map((waves) =>
    peakInTable(waves, seconds, null),
  );
  return Math.max(
    ...sections,
    pourWindow(seconds),
    BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE,
  );
};

// Every table the stage authors, the Waking's beside the three sections'.
const EVERY_TABLE: readonly (readonly StageWave[])[] = [
  ...Object.values(SECTION_TABLES),
  WAKING_WAVES,
];

/**
 * The most bodies of one type the stage's authored waves can land inside any
 * window of this length, anywhere in the stage.
 *
 * It is not peakArrivals narrowed to a type. peakArrivals also prices the
 * pour's own source, a boss's adds and the rungs a hit strips; the pour pours
 * POUR_TYPE and the Undertaker digs up his own DIGGER_TYPE, both shamblers, and
 * a rung is no body at all, so a per-type walk that carried those terms would
 * price a revenant window with shambler bodies in it. What it does walk is every
 * table, the Waking's included, because the Waking's own waves are the Crowd's
 * carried on and a type arrives in them like any other.
 *
 * The mob-fire cap is its reader: the only trash type that fires is the
 * revenant, so how many shots the mow can hold in the air starts with how many
 * revenants the stage can hold alive (ADR 0059).
 */
const peakArrivalsOf = (type: MobType, seconds: number): number => {
  if (seconds <= 0) return 0;
  return Math.max(
    ...EVERY_TABLE.map((waves) => peakInTable(waves, seconds, type)),
  );
};

export {
  BODY_COST,
  CARDS,
  cardCost,
  largestCard,
  peakArrivalsOf,
  REVENANT_FIRE,
  BOSS_FIRE,
  PROCESSION_WAVES,
  CROWD_WAVES,
  VIGIL_WAVES,
  WAKING_WAVES,
  SPARSE_LAST_WAVE,
  sparseLastWave,
  SET_PIECE_BUDGET,
  SET_PIECE_POUR_SECONDS,
  SET_PIECE_HP,
  SET_PIECE_SWEEP_MIN_X,
  SET_PIECE_SWEEP_MAX_X,
  SET_PIECE_PLACED_AT,
  SET_PIECE_OPEN_DEPTH,
  SET_PIECE_HALF_WIDTH,
  SET_PIECE_HALF_HEIGHT,
  POUR_TYPE,
  POUR_LIP_X,
  POUR_JITTER_X,
  POUR_SECONDS,
  POUR_SHARES,
  BOSS_ADD_ALLOWANCE,
  RUNG_ALLOWANCE,
  BOSS_KINDS,
  peakArrivals,
  repeatingArrivals,
};
export type {
  StageWave,
  Repeat,
  BossKind,
  TrashSectionName,
  SparseShape,
  DirectorCard,
  ShotPattern,
  FirePhase,
  BossFire,
};
