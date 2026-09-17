// The entity cap policy (tracer plan section 3).

import { TICK_HZ } from './clock';
import { FIELD_HEIGHT, FIELD_WIDTH } from './field';
import { BODY, MAX_ENTRY_DEPTH } from './stage/formations';
import type { FirePhase, ShotPattern } from './stage/waves';
import {
  BOSS_FIRE,
  largestCard,
  peakArrivals,
  peakArrivalsOf,
  REVENANT_FIRE,
} from './stage/waves';
import { FRESHNESS_SECONDS, SCROLL_SPEED } from './tuning';
import type { TuningRecord } from './tuningRecord';

/**
 * At the cap something must be dropped, and which one is a gameplay rule rather
 * than a housekeeping detail. That is why the policy lives in src/game and not
 * in invariants.ts: checking a cap is not enforcing one, and a policy in
 * src/dev would make the test rig load-bearing in the shipped game.
 *
 * Every capacity declared here is a safety net: a number far enough above the
 * densest thing its pool can hold that reaching it means something has gone
 * wrong. A capacity that decides how a line plays is not one of those and lives
 * in that line's own module, where the rows it is measured against are. That is
 * where TERRITORY_CAP is: it sets how long a trail of claimed ground may be,
 * which is a gameplay rule rather than a guard against a runaway.
 */

/**
 * The caps are a safety net and not a tuning knob, and they are identical on
 * every device and never lowered for a phone's frame budget: a device-varying
 * cap makes the same seed a different game and spends exactly what ADR 0015
 * paid for.
 *
 * The mob cap was a constant of 160, read off a 51-mob peak measured across
 * three seeds in docs/research/invariant-check-cost.md section 3a. The stage's
 * authored floor now grows over the run (ADR 0060) and a standing wave at
 * twelve bodies a second holds more than that in transit at any instant, so the
 * figure stopped describing the content it was taken from. It is a derivation
 * below, on ADR 0056's own terms: the content prices the cap and never the cap
 * the content.
 *
 * All three derivations take the run's tuning record, because the stage's own
 * magnitudes are rows of it now (ADR 0064) and a legal record is open: no
 * static worst case bounds a pool, so the bound is per run, which is what the
 * pools already are, built in createRun, at a cap, once (ADR 0056 as amended).
 * Nothing here holds a record of its own, and the caller hands one in.
 */

/**
 * What one run's pools are built at, and what every reader of a cap takes off
 * the run rather than out of this module.
 */
interface Caps {
  readonly mobs: number;
  readonly mobFire: number;
  readonly corpses: number;
}

/**
 * The longest a body can stand on the field, in seconds: the deepest a
 * formation may place it above the top edge, plus the field, plus its own
 * length before the cull lets go of it below the bottom edge, at the slowest
 * descent the sim allows.
 *
 * The scroll alone and never a mob type's own speed, for two reasons that agree.
 * Every body descends at the scroll plus its own motion, a faller's speed is
 * positive and a ghoul's chase is floored above zero, so the scroll is a floor
 * on every type's descent and this is therefore an upper bound on every type's
 * stay. And the mob table cannot be read from here at all: mobs.ts imports this
 * module, so reaching back for MOB_TYPES would close a cycle. The bound is
 * loose by design, which is the direction a safety net rounds.
 */
const TRANSIT_SECONDS =
  (MAX_ENTRY_DEPTH + FIELD_HEIGHT + BODY) / (SCROLL_SPEED * TICK_HZ);

/**
 * The most bodies the director can put on the field inside a window of this
 * length: one card at the window's opening and one more at every quiet interval
 * inside it, at this many bodies an add.
 *
 * One function for every window this module prices, because every cap here that
 * counts the director counts it the same way. Two terms reading the same
 * director through two different rules is the defect this replaces.
 *
 * It takes the card's bodies rather than a mob type, so the derivation still
 * names no type at all: the mob table cannot be read from here, and a caller
 * that wants one type's cards asks waves.ts for them and hands the answer in.
 *
 * The quiet interval's minimum is the divisor rather than its draw, because a
 * drawn interval is at least the minimum and the shortest one is what a worst
 * case prices (ADR 0056, the record's section 5 item 6). It arrives as a number
 * rather than as the record, because this is the one row every cap here reads
 * and a helper takes what it needs.
 */
const directedInside = (
  seconds: number,
  bodiesAnAdd: number,
  quietIntervalMinimumSeconds: number,
): number =>
  bodiesAnAdd * (Math.floor(seconds / quietIntervalMinimumSeconds) + 1);

/**
 * The most bodies the stage can hold alive at once, derived from the stage's
 * own waves rather than written down (ADR 0056).
 *
 * A proof and not an estimate, in the shape the corpse cap below already uses.
 * Nothing removes a body but a kill, a cull at the bottom edge, or the end of a
 * run, so every body alive at an instant arrived inside one transit window; and
 * what the stage can land in a window is exactly what peakArrivals answers,
 * over the same section walk, counting a standing wave's rate and the shaped
 * beats that fall inside it together. A field nobody clears is the worst case,
 * and that is the case this prices.
 *
 * The director's own term is the cards a transit window holds and never a
 * section's purse (ADR 0056, ruled 2026-09-14). A purse is what a section may
 * spend over its whole length, so a purse-sized addend prices a moment the
 * quiet interval forbids; what the window does hold is one card at its opening
 * and one more at every quiet interval inside it, because bodies from several
 * adds are in transit at once.
 *
 * The headroom a safety net needs is inside the derivation rather than bolted
 * onto it: the transit bound above prices every body at the slowest descent the
 * sim allows, and peakArrivals maximises over window placements rather than
 * reading one.
 */
const peakLive = (tuning: TuningRecord): number =>
  peakArrivals(TRANSIT_SECONDS) +
  directedInside(
    TRANSIT_SECONDS,
    largestCard(null),
    tuning.stage.quietIntervalMinimumSeconds,
  );

// The most bodies a run under this record can hold alive at once.
const mobCap = (tuning: TuningRecord): number => peakLive(tuning);

/**
 * The longest straight line a shot can travel and still be on the field, so it
 * is an upper bound on any shot's flight whatever bearing it left on. Aimed
 * fire and every authored pattern alike leave a point inside the rectangle, and
 * a line from inside a rectangle exits within its diagonal.
 *
 * Math.sqrt over a product and never Math.hypot or an exponent: the caps are
 * identical on every device (ADR 0015), sqrt and multiplication are exactly
 * rounded by the language's own spec, and hypot's precision and the exponent
 * operator's are both left to the engine.
 */
const FIELD_SPAN = Math.sqrt(
  FIELD_WIDTH * FIELD_WIDTH + FIELD_HEIGHT * FIELD_HEIGHT,
);

/**
 * The shots one pattern holds in the air at once: every emit whose shots have
 * not yet left the field, which is the flight a shot survives divided through
 * the interval between emits, plus the one just fired.
 */
const shotsInTheAir = (pattern: ShotPattern): number =>
  pattern.shots *
  (Math.floor(FIELD_SPAN / pattern.unitsASecond / pattern.everySeconds) + 1);

/**
 * The trash half of the mob-fire pool: every revenant the stage can hold alive
 * at once, each holding its own shots in the air.
 *
 * The revenant is the only trash type that fires, because the mow body carries
 * no fire and the ghoul closes instead (ADR 0059), so the peak is a per-type
 * one over the same transit window MOB_CAP uses. The director can add revenants
 * too, and its term here is the revenant cards that window holds, on the same
 * rule and through the same function: a pool counted per add where the one
 * beside it counts per window would be the same defect wearing a second coat.
 */
const revenantFirePeak = (tuning: TuningRecord): number =>
  (peakArrivalsOf('revenant', TRANSIT_SECONDS) +
    directedInside(
      TRANSIT_SECONDS,
      largestCard('revenant'),
      tuning.stage.quietIntervalMinimumSeconds,
    )) *
  shotsInTheAir(REVENANT_FIRE);

// What one boss phase holds in the air at once, its emitters together.
const shotsInThePhase = (phase: FirePhase): number =>
  phase.reduce((shots, pattern) => shots + shotsInTheAir(pattern), 0);

/**
 * The boss half: the most one boss can hold in the air at once, which is a
 * phase and the one after it rather than a phase alone.
 *
 * A phase break clears nothing. The flash between two phases is thirty ticks
 * and a tear crosses the field in about twelve seconds, so the phase that just
 * ended is still flying while the next one opens, and a cap priced on one phase
 * would bind on exactly the beat it named.
 *
 * Consecutive within one boss and never across two, because the Banshee dies a
 * whole section before the Undertaker arrives. A maximum and never a sum for
 * the same reason: one boss fights at a time.
 */
const WORST_BOSS_PATTERN = Math.max(
  ...Object.values(BOSS_FIRE).flatMap((phases) =>
    phases.map(
      (phase, index) =>
        shotsInThePhase(phase) + shotsInThePhase(phases[index + 1] ?? []),
    ),
  ),
);

/**
 * Room for every shot the field can hold at once, derived from the stage's own
 * waves and the bosses' own patterns rather than written down (ADR 0056). It
 * was a constant of 400.
 *
 * The two terms are added because boss fire and trash fire share one pool: the
 * Banshee's tears and the Undertaker's clods and spiral shots go through
 * fireDirectedShot into the shots the revenants use, so a derivation that read
 * the revenant peak alone would size a pool for a field that never happens. The
 * trash a boss section inherits from the section before it is still falling
 * while the fight opens, which is the case this prices.
 *
 * Tight and not padded, and the fault is what protects it: FieldRenderer
 * allocates a sprite per slot and every pool is walked whole whether or not a
 * slot is alive, so padding is paid on every tick of every run. A bound cap
 * refuses the shot, removes nothing, and raises a recoverable fault.
 */
const mobFireCap = (tuning: TuningRecord): number =>
  revenantFirePeak(tuning) + WORST_BOSS_PATTERN;

/**
 * Treasure the field can hold at once, which never decays and so is not covered
 * by the freshness window below. An initial row of ten: the three bodies of the
 * one live offer (ADR 0034), the Banshee's death feast, her phase break's, the
 * Undertaker's two, and three spare.
 */
const TREASURE_ALLOWANCE = 10;

/**
 * Room for every corpse the stage can leave alive at once, derived from the two
 * clocks the game already has rather than written down (ADR 0056).
 *
 * A proof and not an estimate. A decaying corpse lives at most
 * FRESHNESS_SECONDS, so every one alive at any instant was made inside that
 * window; every one came from a body that was either alive when the window
 * opened, which MOB_CAP bounds, or arrived inside it, which the stage's own
 * waves bound. Treasure does not decay and is bounded by design instead. So the
 * cap cannot bind in normal play, and binding at all is a bug rather than a
 * policy: the spawn is refused, nothing on the field is removed, and the
 * invariant harness raises a recoverable fault.
 *
 * The director's own adds are the fourth term, and they are the cards its quiet
 * interval leaves room for inside the window rather than a section's whole
 * purse: it goes quiet for a drawn interval after every add, so the most it can
 * put down inside a freshness window is one card at the window's opening and
 * one more at every minimum interval after it (ADR 0056, the record's section 5
 * item 7).
 */
const directedInsideFreshness = (tuning: TuningRecord): number =>
  directedInside(
    FRESHNESS_SECONDS,
    largestCard(null),
    tuning.stage.quietIntervalMinimumSeconds,
  );

const corpseCap = (tuning: TuningRecord): number =>
  mobCap(tuning) +
  peakArrivals(FRESHNESS_SECONDS) +
  TREASURE_ALLOWANCE +
  directedInsideFreshness(tuning);

/**
 * The three caps one run is built at, derived together because createRun needs
 * all three in the same call and a reader takes them off the run afterwards
 * (ADR 0056 as amended).
 */
const capsFor = (tuning: TuningRecord): Caps => ({
  mobs: mobCap(tuning),
  mobFire: mobFireCap(tuning),
  corpses: corpseCap(tuning),
});

/**
 * What every pooled entity carries. The id only ever increases and is not
 * cosmetic: the cap policy has to be totally ordered to be deterministic, and a
 * test that says "this corpse, not that one" needs a handle that a recycled
 * slot index cannot give it.
 */
interface PoolSlot {
  alive: boolean;
  id: number;
}

/**
 * A pool at full capacity, every slot dead. Pools are pre-allocated at
 * createRun and mutated in place, so a spawn never allocates.
 */
const createPool = <T extends PoolSlot>(
  capacity: number,
  make: () => T,
): T[] => {
  const pool: T[] = [];
  for (let index = 0; index < capacity; index++) pool.push(make());
  return pool;
};

/**
 * The first dead slot, claimed and stamped with the id, or null when the pool
 * is full. This is the refusal policy: mobs and mob fire take a null answer and
 * do not spawn.
 *
 * Nothing already on the field is ever removed, because a shot the player has
 * read and started dodging cannot vanish: that teaches the player that dodging
 * is optional, and it is the kind of lie that is invisible in a test and
 * infuriating in a hand.
 */
const takeSlot = <T extends PoolSlot>(pool: T[], id: number): T | null => {
  for (const slot of pool) {
    if (slot.alive) continue;
    slot.alive = true;
    slot.id = id;
    return slot;
  }
  return null;
};

// How many slots of a pool are live.
const liveCount = (pool: readonly PoolSlot[]): number => {
  return pool.reduce((count, slot) => count + (slot.alive ? 1 : 0), 0);
};

/**
 * The storm's two pools. Both refuse the spawn at the cap, the same policy mobs
 * and mob fire have, and for a simpler reason than theirs: it is the player's
 * own fire, the lines emit continuously, and one missing skull out of a hundred
 * is invisible where a vanishing mob shot is a lie.
 *
 * Both are derived from the densest thing each pool can produce and both sit
 * above that derivation on purpose. A skull crosses the field's height in 109
 * ticks, so a level-5 stream at its fixed interval holds about 30 alive, and a
 * swallow chained as often as the game allows adds one surged volley each time.
 * Eleven wisps per swallow at a 90-tick life, with a swallow as often as every
 * 20 ticks, holds 50. They are a safety net and not a tuning knob, exactly as
 * MOB_CAP is: a cap that binds in normal play is a bug rather than a policy.
 *
 * #76 pass A moved both densities up, the stream by shortening its interval and
 * the wisps by widening the level-5 volley, so the headroom either cap carries
 * is narrower than it was: the skulls keep four times their worst case and the
 * wisps keep a quarter over theirs.
 */
const SKULL_CAP = 120;
const WISP_CAP = 64;

export {
  createPool,
  takeSlot,
  liveCount,
  peakLive,
  TRANSIT_SECONDS,
  mobCap,
  revenantFirePeak,
  WORST_BOSS_PATTERN,
  mobFireCap,
  corpseCap,
  capsFor,
  TREASURE_ALLOWANCE,
  SKULL_CAP,
  WISP_CAP,
};
export type { Caps, PoolSlot };
