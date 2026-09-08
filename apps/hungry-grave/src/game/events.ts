// The event vocabulary the sim reports out (tracer plan section 3).

import type { GraveHitSource } from './grave';
import type { WeaponLine } from './lines/roster';
import type { PatchClosing } from './lines/territory';
import type { FireKind } from './mobFire';
import type { DamageSource, MobType } from './mobs';
import type { BossKind } from './stage/rows';
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

// The mirror of sealed: the stage is behind the grave, on the tick the last
// boss falls (ADR 0007's ending). It pays nothing.
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
  /**
   * Whether this mob carried the offer (ADR 0002). It travels as a value on
   * the event because the slot the carrier stood in is free the moment it
   * dies, so a reader that went back to the mob would be reading whoever took
   * the slot next.
   */
  readonly carried: boolean;
}

/**
 * How the run lost a carrier. One event with a closed reason rather than two
 * events, on the PatchClosed precedent: both are the same thing, supply the
 * player never converted, and an instrument reading the carrier ledger groups
 * by the reason.
 */
type CarrierLoss = 'leftField' | 'cap';

/**
 * A carrier the player never met (ADR 0048). It is a separate event from
 * corpseLost and not a reuse of it: nothing was ever on the field to lose, and
 * an instrument reading supply has to tell a carrier nobody killed from an
 * offer nobody dived for.
 *
 * The two reasons are opposite in blame and identical in cost. leftField is the
 * ordinary one, a carrier that descended past the grave unkilled, and the x is
 * where it went. cap is a carrier the mob pool refused to spawn, which is a
 * fault rather than play, and the x is where its row would have placed it.
 */
interface CarrierLost {
  readonly type: 'carrierLost';
  readonly mob: MobType;
  readonly x: number;
  readonly reason: CarrierLoss;
}

/**
 * A shot went on the field. The mob-fire sound, and ADR 0014's
 * airborne-projectile instrument.
 *
 * The emitter names who fired and the kind names what it looks like, and the
 * two are separate fields because neither answers the other: a boss's rings and
 * its adds' shots share an emitter and not a read.
 */
interface MobFired {
  readonly type: 'mobFired';
  readonly emitter: MobType | BossKind;
  readonly kind: FireKind;
  readonly x: number;
  readonly y: number;
}

/**
 * A boss arrived on a phase boundary, with the number of chunks it will run
 * (ADR 0007). It is the phase's own report of what it carries, so the section
 * timeline and the harness's boss report read the fight's shape without asking
 * the boss module anything.
 */
interface BossArrived {
  readonly type: 'bossArrived';
  readonly boss: BossKind;
  readonly chunks: number;
}

// One chunk of a boss emptied and the next is live (ADR 0007, ADR 0052).
interface ChunkBroke {
  readonly type: 'chunkBroke';
  readonly boss: BossKind;
  readonly chunk: number;
}

/**
 * A boss's last chunk emptied. It carries where the body fell, because what a
 * death sheds is placed there, and it is what the Undertaker's ending fires on
 * rather than a phase index (ADR 0007).
 */
interface BossKilled {
  readonly type: 'bossKilled';
  readonly boss: BossKind;
  readonly x: number;
  readonly y: number;
}

/**
 * The set piece's source opened and began to pour (ADR 0042, ADR 0050). It is
 * the Crowd's own boundary event, and the budget is what the pour has to spend.
 * Fired by stage/setPiece.ts, which owns the source's behaviour.
 */
interface SetPieceOpened {
  readonly type: 'setPieceOpened';
  readonly x: number;
  readonly y: number;
  readonly budget: number;
}

// One body poured from the source, and what is left of the budget behind it.
interface SetPiecePoured {
  readonly type: 'setPiecePoured';
  readonly x: number;
  readonly y: number;
  readonly left: number;
}

/**
 * How a set piece ended. One event with a closed reason rather than three
 * events, on the PatchClosed precedent: the three are ends of one thing rather
 * than opposite meanings, every set piece reaches exactly one of them, and a
 * reading groups by the reason.
 */
type SetPieceClosing = 'spent' | 'killed' | 'scrolled';

interface SetPieceClosed {
  readonly type: 'setPieceClosed';
  readonly reason: SetPieceClosing;
  readonly left: number;
}

// The dirt took an empty corpse under (ADR 0004). The missed-food instrument reads it.
interface CorpseExpired {
  readonly type: 'corpseExpired';
  readonly x: number;
  readonly y: number;
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

/**
 * A drop arrived on the field. The denominator for drops swallowed versus
 * scrolled off.
 *
 * The id is the join key the offer opens on: openOffer reads it back to learn
 * which body carries which option, so the offer never holds a pooled entity
 * reference. The line is absent on the body a maxed run's carrier opens, which
 * carries no option at all (ADR 0034's nothing-offerable branch).
 */
interface DropSpawned {
  readonly type: 'dropSpawned';
  readonly id: number;
  readonly line?: WeaponLine;
  readonly x: number;
  readonly y: number;
}

/**
 * An offer opened on the field (ADR 0034). The options are the lines its
 * bodies carry, in the order they were laid down, and `banked` is what still
 * waits behind it so a burst of paying kills reads as paid.
 */
interface OfferOpened {
  readonly type: 'offerOpened';
  readonly options: readonly WeaponLine[];
  readonly x: number;
  readonly y: number;
  readonly banked: number;
}

// A carrier died while an offer stood, so its offer waits its turn (ADR 0034).
interface OfferBanked {
  readonly type: 'offerBanked';
  readonly banked: number;
}

/**
 * The grave passed under one of the offer's bodies. `passed` names the options
 * that vanished with it, which is what lets an instrument tell a choice from
 * an offer nobody dived for.
 */
interface OfferTaken {
  readonly type: 'offerTaken';
  readonly line: WeaponLine;
  readonly passed: readonly WeaponLine[];
}

/**
 * Every body of an offer left the field untaken (ADR 0034). It is a separate
 * event from carrierLost and not a reuse of it: an offer nobody dived for and
 * a carrier nobody killed mean opposite things to an instrument.
 */
interface OfferLost {
  readonly type: 'offerLost';
  readonly options: readonly WeaponLine[];
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
  | CarrierLost
  | MobFired
  | BossArrived
  | ChunkBroke
  | BossKilled
  | SetPieceOpened
  | SetPiecePoured
  | SetPieceClosed
  | CorpseExpired
  | CorpseLost
  | Tolled
  | MobShoved
  | PatchLaid
  | PatchClosed
  | Belched
  | DropSpawned
  | OfferOpened
  | OfferBanked
  | OfferTaken
  | OfferLost
  | PhaseChanged;

export type { CarrierLoss, SetPieceClosing, SimEvent };
