// The event vocabulary the sim reports out (tracer plan section 3).

import type { GraveHitSource } from './grave';
import type { WeaponLine } from './lines/roster';
import type { PatchClosing } from './lines/territory';
import type { DamageSource, MobType } from './mobs';
import type { PhaseName } from './stage/stage';
import type { FoodKind } from './swallow';

// Food went in.
interface Swallowed {
  readonly type: 'swallowed';
  readonly kind: FoodKind;
  readonly freshness: number;
  readonly payout: number;
}

// The swallow chime, on every swallow from the very first, whatever the loadout.
interface Chimed {
  readonly type: 'chimed';
  readonly kind: FoodKind;
}

// The grave grew. Size is the new size, so a renderer needs nothing else.
interface Grew {
  readonly type: 'grew';
  readonly amount: number;
  readonly size: number;
}

// Growth the ceiling could not take, or a maxed line's drop, converted to score (ADR 0003).
interface Overflowed {
  readonly type: 'overflowed';
  readonly amount: number;
  readonly score: number;
}

// The reservoir took charge from a swallow (ADR 0008).
interface ReservoirCharged {
  readonly type: 'reservoirCharged';
  readonly amount: number;
  readonly reservoir: number;
}

// Charge past full, visibly wasted rather than silently clamped (ADR 0008).
interface Splashed {
  readonly type: 'splashed';
  readonly wasted: number;
  readonly reservoir: number;
}

// The reservoir reached capacity, so the one button is armed (ADR 0008).
interface ReservoirFull {
  readonly type: 'reservoirFull';
  readonly reservoir: number;
}

// A drop levelled its line (ADR 0002).
interface WeaponLeveled {
  readonly type: 'weaponLeveled';
  readonly line: WeaponLine;
  readonly level: number;
}

/**
 * Mob fire landed. ADR 0040's dim reads this, and the window is its refractory
 * interval. The source names who hurt the player (#48).
 */
interface GraveHit {
  readonly type: 'graveHit';
  readonly source: GraveHitSource;
  readonly size: number;
  readonly invulnerable: number;
}

// The floor ladder's first rung: the whole score, gone (ADR 0003).
interface ScoreBled {
  readonly type: 'scoreBled';
  readonly amount: number;
}

// The floor ladder's second rung: one level off every line at once (ADR 0003).
interface WeaponStripped {
  readonly type: 'weaponStripped';
  readonly lines: readonly WeaponLine[];
}

// The end of the ladder, and of the run (ADR 0003).
interface Sealed {
  readonly type: 'sealed';
  readonly tick: number;
}

// The mirror of sealed: the stage is behind the grave (ADR 0007's ending, stubbed here).
interface Victory {
  readonly type: 'victory';
  readonly tick: number;
}

/**
 * A mob took damage, the fatal blow included (#48). The id is the join key: an
 * instrument credits a kill to a weapon by matching mobKilled's id to the
 * mobDamaged that carried the fatal blow.
 */
interface MobDamaged {
  readonly type: 'mobDamaged';
  readonly id: number;
  readonly amount: number;
  readonly source: DamageSource;
}

/**
 * A mob died. The kill sound, and the instruments' kill count. The id joins to
 * the mobDamaged that carried the fatal blow, which is what names the killer.
 */
interface MobKilled {
  readonly type: 'mobKilled';
  readonly id: number;
  readonly mob: MobType;
  readonly x: number;
  readonly y: number;
}

// A mob put a shot on the field. The mob-fire sound, and ADR 0014's airborne-projectile instrument.
interface MobFired {
  readonly type: 'mobFired';
  readonly emitter: MobType;
  readonly x: number;
  readonly y: number;
}

// The dirt took an empty corpse under (ADR 0004). The missed-food instrument reads it.
interface CorpseExpired {
  readonly type: 'corpseExpired';
  readonly x: number;
  readonly y: number;
}

/**
 * The cap policy dropped the oldest corpse to make room. It is a separate event
 * from corpseExpired and not a reuse of it: the two look identical on screen
 * and mean opposite things to an instrument, one being greed that ran out of
 * time and the other being the game running out of slots, and folding them
 * would have the missed-food instrument counting evictions as player misses.
 */
interface CorpseEvicted {
  readonly type: 'corpseEvicted';
  readonly x: number;
  readonly y: number;
  readonly freshness: number;
}

/**
 * A corpse left the bottom edge with value left, which is a different read from
 * expired. It carries the kind because the missed-drops instrument has to
 * separate a corpse that scrolled away from a drop that did, and without it that
 * instrument cannot be built from the event stream at all.
 */
interface CorpseLost {
  readonly type: 'corpseLost';
  readonly kind: FoodKind;
  readonly x: number;
  readonly y: number;
  readonly freshness: number;
}

/**
 * Territory claimed ground (#76). `mobsUnder` is the winning cluster score,
 * the count of projected mobs the lay's radius covered, which is the direct
 * read on whether the targeting found real traffic.
 */
interface PatchLaid {
  readonly type: 'patchLaid';
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly mobsUnder: number;
}

/**
 * A patch of claimed ground left the field, and how it ended (#76).
 *
 * The two reasons stay one event with a closed reason rather than two events,
 * because they are two ends of one thing rather than opposite meanings: a
 * reading groups by the reason, and every patch reaches exactly one of them.
 * `pulses` is what separates ground that left having touched nothing at all
 * from ground that ground down traffic first, which is the read the
 * headstones never had and the direct answer to whether the targeting paid.
 */
interface PatchClosed {
  readonly type: 'patchClosed';
  readonly reason: PatchClosing;
  readonly x: number;
  readonly y: number;
  readonly pulses: number;
}

// The bell rang. Its sound cue, and the radius the ring will reach.
interface Tolled {
  readonly type: 'tolled';
  readonly level: number;
  readonly radius: number;
}

/**
 * The ring shoved a mob (#79). The repel reading is what reads it, summing
 * shoves per toll. It is one event per shove rather than a field on `tolled`
 * because the shoves land across the ring's expansion, after the tolled event
 * has already fired at ring birth, so no toll-time event can carry them.
 * `displacement` is the distance the mob actually moved after the field
 * clamp, not the nominal push, so a shove into the field's edge reports what
 * it truly bought.
 */
interface MobShoved {
  readonly type: 'mobShoved';
  readonly id: number;
  readonly displacement: number;
}

/**
 * The belch fired (ADR 0008). The counts are what the belch-on-wave instrument
 * reads to tell a wipe that landed on a curtain from one spent on empty sky.
 * Cancelled is mob fire taken off the field and killed is mobs taken off it,
 * and the two are separate because a curtain of unarmed trash cancels nothing
 * while being exactly the target the loaded belch exists for.
 */
interface Belched {
  readonly type: 'belched';
  readonly cancelled: number;
  readonly killed: number;
}

// A drop arrived on the field. The denominator for drops swallowed versus scrolled off.
interface DropSpawned {
  readonly type: 'dropSpawned';
  readonly line: WeaponLine;
  readonly x: number;
  readonly y: number;
}

// The stage crossed a phase boundary (ADR 0006). The music cue hangs here.
interface PhaseChanged {
  readonly type: 'phaseChanged';
  readonly phase: PhaseName;
  readonly tick: number;
}

/**
 * Payloads carry values, never entity references: entities are pooled and
 * mutated in place, so a held reference is a recycled slot by the time a sound
 * or an instrument reads it.
 *
 * Every payload serves three subscribers at once, because the tracer plan names
 * all three: a sound, a renderer, and an instrument that lives outside the sim.
 *
 * scoreBled, weaponStripped and sealed stay three events rather than one ladder
 * event. At the size floor there is no shrink, so ADR 0040's rim channel is
 * silent and these three are the only second channel left.
 */
type SimEvent =
  | Swallowed
  | Chimed
  | Grew
  | Overflowed
  | ReservoirCharged
  | Splashed
  | ReservoirFull
  | WeaponLeveled
  | GraveHit
  | MobDamaged
  | ScoreBled
  | WeaponStripped
  | Sealed
  | Victory
  | MobKilled
  | MobFired
  | CorpseExpired
  | CorpseEvicted
  | CorpseLost
  | Tolled
  | MobShoved
  | PatchLaid
  | PatchClosed
  | Belched
  | DropSpawned
  | PhaseChanged;

export type { SimEvent };
