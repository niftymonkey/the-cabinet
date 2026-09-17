// The numbers that are not a single thing's own stats (tracer plan section 3):
// a mob type owns its own stats and a weapon line owns its level curve, in
// their own modules, and this file holds the rest.

import { TICK_HZ } from './clock';
import { FIELD_HEIGHT, FIELD_WIDTH } from './field';

/**
 * Base speed in field units per tick. ADR 0003: crossing the field's width
 * takes about two seconds.
 *
 * Every number in this file is a first pass owned by the tuning dispatch. What
 * is pinned by test is not the magnitudes, it is the derivations: a test that
 * pinned 4.5 would break on every retune and teach nothing, while a test that
 * pins "the grave crosses the field's width in about two seconds" is ADR 0003
 * and must never break.
 */
const BASE_SPEED = FIELD_WIDTH / (2 * TICK_HZ);

/**
 * Scroll in field units per tick. This is the run's root pace number: it is the
 * reaction-time budget for every threat on the field and it sets how long any
 * mob is on screen, so it is declared and everything downstream derives from
 * it. Stated per second and divided by the tick rate, because a per-tick
 * magnitude is unreadable and a per-second one is the number a human retunes.
 */
const SCROLL_SPEED = 38 / TICK_HZ;

/**
 * ADR 0004: about ten seconds from kill to gone, derived from scroll speed
 * rather than declared beside it. The ADR and the concept doc both state the
 * causality in this direction, so that a scroll-speed retune retunes the meter
 * with it. A mid-field kill must reach the bottom edge as a nearly empty scrap,
 * and deriving is what makes that true by construction instead of by two
 * numbers that drift apart.
 */
const FRESHNESS_SECONDS = FIELD_HEIGHT / 2 / (SCROLL_SPEED * TICK_HZ);

// ADR 0004: freshness scales every payout down to this floor, never to zero.
const FRESHNESS_PAYOUT_FLOOR = 0.25;

/**
 * The grave is taller than wide (ADR 0003). Height over width.
 *
 * Two is an actual plot dimension rather than an invention: a standard adult
 * grave space is 42 by 96 inches, which is 2.29 to 1, and two sits at the
 * readable end of that range while still reading as clearly elongated rather
 * than a rounded square at the floor's size.
 */
const GRAVE_ASPECT = 2;

// ADR 0003: the grave stands about a quarter of the field's width tall at its ceiling.
const SIZE_CEILING = FIELD_WIDTH / 8;

/**
 * One and a half floors, so the first hit never puts a fresh run at the floor.
 */
const SIZE_START = 27;

/**
 * The hard minimum. On a 390-wide phone the field scales to about 0.72 CSS
 * pixels per field unit, so a floor grave is roughly 13 CSS pixels across.
 * Narrower than this and it stops reading as a grave shape on the device the
 * floor matters most on.
 */
const SIZE_FLOOR = 18;

// Three hits take a fresh run from its start to its floor, the shmup convention.
const HIT_SHRINK = 3;

/**
 * Post-hit invulnerability, 0.4 seconds: the top of the 0.2-to-0.4-second
 * convention that Brotato and Hollow Knight sit inside. The window exists to
 * stop one attack landing several times, not to let a player tank a curtain. A
 * full second would probably make deliberately eating a hit the dominant way to
 * cross the Wall, which collides with the Wall being crossable unloaded and
 * never crossable for free.
 *
 * It is a safety floor as well as a feel number, and this is the one place that
 * is written down. ADR 0040's hit signal dims the whole field, which is a
 * general flash under WCAG SC 2.3.1: a pair of opposing changes in relative
 * luminance of 10 percent or more where the darker image is below 0.80 relative
 * luminance. Both halves are trivially satisfied on this palette, and the
 * criterion permits at most three flashes in any one second period. Because a
 * hit can only land once invulnerability has run out, this window is the dim's
 * refractory interval, and there is no second number to keep in sync. The
 * worst case for a period of p seconds is floor(1 / p) + 1, so the floor is 21
 * ticks at 60 Hz and 24 clears it with room. The small-area escape hatch cannot
 * apply to a full-field dim, and SC 2.3.1 invokes Conformance Requirement 5
 * Non-Interference, so unlike SC 2.3.3 there is no "essential to functionality"
 * carve-out: a game gets no exception here.
 */
const INVULNERABLE_TICKS = 24;

/**
 * How many fully fresh trash corpses grow a run from its start to its ceiling.
 * The economy's one declared magnitude, and it is stated in corpses of expected
 * mowing rather than of the old trickle.
 *
 * What it is against: the ceiling lands late in the Procession rather than ten
 * seconds into it. At 80 a mow's first seconds bought the whole climb, so the
 * grave was full before the section it grows through had started.
 */
const CORPSES_TO_CEILING = 400;

// The unit of food. Every mob's payout is stated as a multiple of this.
const TRASH_CORPSE_PAYOUT = (SIZE_CEILING - SIZE_START) / CORPSES_TO_CEILING;

/**
 * Decision-log entry 5.11: the Banshee's feast pays growth worth a stated count
 * of fresh trash corpses, and the same swallow slams the reservoir full.
 *
 * The count is the reservoir stated in corpses, because the reservoir is
 * written as this payout and the two are one row. What it is against: a belch
 * roughly every forty seconds at Crowd rates rather than every two, so the
 * belch is a cadence the player waits for and spends rather than a reflex.
 */
const FEAST_PAYOUT = 300 * TRASH_CORPSE_PAYOUT;

/**
 * Entry 5.11 again: the same swallow slams the reservoir full. Capacity is the
 * feast's payout exactly, so a fully fresh feast fills the reservoir and wastes
 * nothing, and the run's most choreographed beat is true by construction.
 */
const RESERVOIR_CAPACITY = FEAST_PAYOUT;

/**
 * The unit of score: what killing one mow body pays. Every mob's score payout
 * is stated as a multiple of this, exactly as every food payout is stated as a
 * multiple of the trash corpse's.
 *
 * It is a first figure, and it is a figure rather than a derivation because
 * nothing can measure what a kill should pay before kills pay anything. Score
 * is one number fed by several inputs and the kill is only the first of them
 * (ADR 0002 as amended 2026-09-16, design record `show-what-you-have.md` R4),
 * so what this is read against is the score a whole run ends on, which is M6's
 * reading and not anything available here. A round hundred for the commonest
 * body is the genre's own convention, and it keeps the number legible beside
 * the overflow's fractions, which the same readout has to carry.
 */
const TRASH_KILL_SCORE = 100;

/**
 * The most one hit at the size floor can bleed. The ladder's first rung takes
 * the lesser of this and what the run is holding, and the remainder stays
 * (ADR 0003 as amended 2026-09-16 on Mark's ruling "Cap the bleed", design
 * record `show-what-you-have.md` R4's closing amendment).
 *
 * Stated as a multiple of the kill's own unit, exactly as every mob row's score
 * payout is, because the sentence a flat cap exists to make sayable is "a hit
 * at the floor costs you twenty kills" and a bare two thousand says nothing
 * about the income it comes out of.
 *
 * It is a first figure inside the researched band of 10 to 40 trash kills
 * (`docs/research/score-loss-on-a-hit-precedent.md` section 5), and it sits
 * below that band's midpoint on purpose. What it is set against is the early
 * window rather than the middle of the band: until a run's score first crosses
 * the cap the cap does not exist for the player at all and the first floor hit
 * still takes everything, so the lower the figure the sooner the rule is real.
 * At the storm's measured 2.47 kills a second it is about eight seconds of
 * mowing, and against slice M1's own batch, where a run made 12,400 to 58,112
 * points gross, a run that bleeds twice pays about a third of the leanest run
 * and a fifteenth of the richest.
 *
 * What it gets tuned against is slice M6's bleeds and strips per run, and it is
 * re-read after slice M7 rather than against M6 alone: the band's upper end is
 * argued against a run's gross, and M7's boss damage, source kill and rich
 * swallow all pay into that gross.
 */
const SCORE_BLEED_CAP = 20 * TRASH_KILL_SCORE;

/**
 * Freshness scales a payout down to a floor and never to zero (ADR 0004).
 *
 * It sits beside the floor rather than in swallow.ts, because three payers now
 * read it: growth and reservoir charge through the one verb, and the two
 * on-swallow lines each scaling the currency it pays in (ADR 0058). A line
 * importing swallow.ts for it would close a cycle, since swallow.ts fires
 * those lines.
 */
const freshnessScale = (freshness: number): number => {
  return Math.max(freshness, FRESHNESS_PAYOUT_FLOOR);
};

export {
  freshnessScale,
  BASE_SPEED,
  SCROLL_SPEED,
  FRESHNESS_SECONDS,
  FRESHNESS_PAYOUT_FLOOR,
  GRAVE_ASPECT,
  SIZE_CEILING,
  SIZE_START,
  SIZE_FLOOR,
  HIT_SHRINK,
  INVULNERABLE_TICKS,
  CORPSES_TO_CEILING,
  TRASH_CORPSE_PAYOUT,
  TRASH_KILL_SCORE,
  SCORE_BLEED_CAP,
  FEAST_PAYOUT,
  RESERVOIR_CAPACITY,
};
