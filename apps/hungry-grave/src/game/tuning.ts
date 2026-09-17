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
 * What one point of boss health taken pays, as a rate against the kill's own
 * unit (design record R4: boss damage is paid per hit landed, never as a lump
 * on the kill).
 *
 * The rate and not the fight: what a whole fight pays is this times the boss's
 * own PHASE_HP, so a step 6 retune of a boss's health moves the fight's worth
 * with it and no figure here goes stale. That is why the ratios are derived in
 * prose rather than typed: at this rate the Banshee's 2,200 health is 22 trash
 * kills and the Undertaker's 5,100 is 51, both inside the researched band of 20
 * to 70 trash kills for a single input
 * (`docs/research/score-inputs-precedent.md` section 4).
 *
 * What it is set against is the swamping refusal. The mob table pays one trash
 * kill per 8 points of health, floored, and that rate applied to a boss pays
 * 637 trash kills for the Undertaker, more than the whole rest of a run makes.
 * Roughly a hundred points of boss health to one trash kill is what the band
 * converts to, so a boss's health pays at a far slower rate than the mow's and
 * a fight is felt without swamping what a run mows. The shape is ours and not
 * the genre's: almost nothing ships boss damage as a per-hit trickle, and the
 * reason the lump at the kill is refused is that it pays nothing to a run that
 * fought the Undertaker and sealed before the last phase emptied (ADR 0007).
 *
 * It is a first figure. What it gets tuned against is each input's share of a
 * run that reached a boss, which slice M7's own batch prints.
 */
const SCORE_PER_BOSS_HEALTH = TRASH_KILL_SCORE / 100;

/**
 * What killing the Waking's source pays, once, on the tick its health empties
 * (design record R4: one bonus on the kill and never a rate).
 *
 * Stated as a multiple of the kill's own unit, exactly as every mob row's score
 * payout and the bleed's cap are. Twenty-four trash kills, derived rather than
 * picked: at the same hundred-health-per-trash-kill rate the boss row above
 * carries, the source's 2,400 health is 24
 * (`docs/research/score-inputs-precedent.md` section 4).
 *
 * What it is set against is the genre's two tiers, and the figure lands in the
 * gap between them on purpose. A spawner pays 6x to 10x a trash kill across
 * Robotron, Gradius and Defender; a structural core or a stage objective pays
 * 30x to 130x across Bosconian, Gradius and Xevious. The source sits above the
 * first because it is the section's objective rather than roadside furniture,
 * and below the second because a core kill in all three of those games ends or
 * denies something. Killing this one denies nothing: #104 keeps the pour
 * running from the pour point whatever the storm did, so none of the denial
 * premium the spawner tier is paid for applies here and neither Xevious's
 * milk-then-deny greed decision nor Robotron's safety premium is the precedent
 * to reach for. The bonus is a trophy for the commitment up the trail
 * (ADR 0042) and nothing else.
 *
 * It is a first figure, read against the same batch as the row above.
 */
const SOURCE_KILL_SCORE = 24 * TRASH_KILL_SCORE;

/**
 * What one large meal taken at a maxed ladder pays, on top of the growth, the
 * charge and the overflow that swallow already pays (design record R4: a
 * swallow whose tier is rich, taken while every rostered line stands at
 * MAX_LEVEL, counted as items and never as a fraction of a unit).
 *
 * Stated as the kill's own unit, one trash kill per meal, and it is the
 * smallest of the three because the count is what binds it: the input pays per
 * item and a run takes many. What it is set against is measured rather than
 * argued. Slice M7's batch on the maxed rig, twelve runs played to the stage's
 * end, took 24 to 47 large meals at full power per run, so at one trash kill
 * each the whole input is 2,400 to 4,700 points across a run: between what the
 * Banshee's whole fight pays and what the Undertaker's does, which is the same
 * band as one boss fight rather than above it, and inside the researched 20 to
 * 70 trash kills for a single input. At twice this the top of that range
 * reaches 9,400 and the input outgrows both fights.
 *
 * No game in the research pass scores food at all, so there is no direct
 * anchor and this row says so (`docs/research/score-inputs-precedent.md`
 * section 3). What transfers is the band and the two named failure modes, both
 * with a community's verdict attached: too small to bother with, which is Great
 * Mahou Daisakusen's "extremely minuscule ... safely ignore" and Battle
 * Garegga's own "not recommended"; and large enough to farm, which is Gunbird's
 * scorers suiciding to stay at max and DoDonPachi's MAXIMUM bomb bonus becoming
 * the entire high-level game. The nearest structural match is Bayonetta, which
 * scales the payout with the pickup's tier, 50 halos for the half-bar item and
 * 100 for the full one, and the rich tier is the tier this game already has.
 *
 * It is a first figure, read against the count the same batch prints.
 */
const MEAL_AT_MAXED_SCORE = TRASH_KILL_SCORE;

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
  SCORE_PER_BOSS_HEALTH,
  SOURCE_KILL_SCORE,
  MEAL_AT_MAXED_SCORE,
  FEAST_PAYOUT,
  RESERVOIR_CAPACITY,
};
