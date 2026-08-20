/**
 * The numbers that are not a single thing's own stats (tracer plan section 3).
 * A mob type owns its own stats and a weapon line owns its level curve, so
 * those tables live in their own modules when they arrive; this file holds the
 * rest.
 *
 * Every number here is a first pass owned by the tuning dispatch. What is
 * pinned by test is not the magnitudes, it is the derivations: a test that
 * pinned 4.5 would break on every retune and teach nothing, while a test that
 * pins "the grave crosses the field's width in about two seconds" is ADR 0003
 * and must never break.
 */

import { TICK_HZ } from "./clock";
import { FIELD_HEIGHT, FIELD_WIDTH } from "./field";

/** Base speed in field units per tick. ADR 0003: crossing the field's width takes about two seconds. */
export const BASE_SPEED = FIELD_WIDTH / (2 * TICK_HZ);

/**
 * Scroll in field units per tick. This is the run's root pace number: it is the
 * reaction-time budget for every threat on the field and it sets how long any
 * mob is on screen, so it is declared and everything downstream derives from
 * it. Stated per second and divided by the tick rate, because a per-tick
 * magnitude is unreadable and a per-second one is the number a human retunes.
 */
export const SCROLL_SPEED = 38 / TICK_HZ;

/**
 * ADR 0004: about ten seconds from kill to gone, derived from scroll speed
 * rather than declared beside it. The ADR and the concept doc both state the
 * causality in this direction, so that a scroll-speed retune retunes the meter
 * with it. A mid-field kill must reach the bottom edge as a nearly empty scrap,
 * and deriving is what makes that true by construction instead of by two
 * numbers that drift apart.
 */
export const FRESHNESS_SECONDS = FIELD_HEIGHT / 2 / (SCROLL_SPEED * TICK_HZ);

/** ADR 0004: freshness scales every payout down to this floor, never to zero. */
export const FRESHNESS_PAYOUT_FLOOR = 0.25;

/**
 * The grave is taller than wide (ADR 0003). Height over width.
 *
 * Two is an actual plot dimension rather than an invention: a standard adult
 * grave space is 42 by 96 inches, which is 2.29 to 1, and two sits at the
 * readable end of that range while still reading as clearly elongated rather
 * than a rounded square at the floor's size.
 */
export const GRAVE_ASPECT = 2;

/** ADR 0003: the grave stands about a quarter of the field's width tall at its ceiling. */
export const SIZE_CEILING = FIELD_WIDTH / 8;

/**
 * One and a half floors, so the first hit never puts a fresh run at the floor.
 */
export const SIZE_START = 27;

/**
 * The hard minimum. On a 390-wide phone the field scales to about 0.72 CSS
 * pixels per field unit, so a floor grave is roughly 13 CSS pixels across.
 * Narrower than this and it stops reading as a grave shape on the device the
 * floor matters most on.
 */
export const SIZE_FLOOR = 18;

/** Three hits take a fresh run from its start to its floor, the shmup convention. */
export const HIT_SHRINK = 3;

/**
 * Post-hit invulnerability, 0.4 seconds: the top of the 0.2-to-0.4-second
 * convention that Brotato and Hollow Knight sit inside. The window exists to
 * stop one attack landing several times, not to let a player tank a curtain. A
 * full second would probably make deliberately eating a hit the dominant way to
 * cross the Wall, which collides with the Wall being crossable unloaded and
 * never crossable for free.
 *
 * It is a safety floor as well as a feel number, and this is the one place that
 * is written down. ADR 0014's hit signal dims the whole field, which is a
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
export const INVULNERABLE_TICKS = 24;

/** How many fully fresh trash corpses grow a run from its start to its ceiling. The economy's one declared magnitude. */
export const CORPSES_TO_CEILING = 80;

/** The unit of food. Every mob's payout in dispatch 4 is stated as a multiple of this. */
export const TRASH_CORPSE_PAYOUT =
  (SIZE_CEILING - SIZE_START) / CORPSES_TO_CEILING;

/** Decision-log entry 5.11: the Banshee's feast pays growth worth 8 to 10 fresh trash corpses. */
export const FEAST_PAYOUT = 9 * TRASH_CORPSE_PAYOUT;

/**
 * Entry 5.11 again: the same swallow slams the reservoir full. Capacity is the
 * feast's payout exactly, so a fully fresh feast fills the reservoir and wastes
 * nothing, and the run's most choreographed beat is true by construction.
 */
export const RESERVOIR_CAPACITY = FEAST_PAYOUT;
