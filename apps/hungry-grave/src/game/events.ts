// The event vocabulary the sim reports out (tracer plan section 3).

import type { GraveHitSource } from './grave';
import type { WeaponLine } from './lines/roster';
import type { PatchClosing } from './lines/territory';
import type { FireKind } from './mobFire';
import type { DamageSource, MobType } from './mobs';
import type { ShoveSource } from './shove';
import type { BossKind, DirectorCard } from './stage/waves';
import type { SectionMusic, SectionName } from './stage/stage';
import type { FoodKind } from './swallow';

// Food went in.
interface Swallowed {
  readonly type: 'swallowed';
  readonly kind: FoodKind;
  readonly freshness: number;
  readonly payout: number;
}

/**
 * The swallow chime, on every swallow from the very first, whatever the loadout.
 *
 * The treasure chime is chosen from the body's own row rather than from its
 * kind, so a fourth kind of food chimes correctly without src/app/sound.ts
 * learning that the kind exists (corpses.ts, design record R6).
 */
interface Chimed {
  readonly type: 'chimed';
  readonly kind: FoodKind;
  readonly treasureBody: boolean;
}

// The grave grew. Size is the new size, so a renderer needs nothing else.
interface Grew {
  readonly type: 'grew';
  readonly amount: number;
  readonly size: number;
}

// Growth the ceiling could not take, or a maxed line's power-up, converted to score (ADR 0003).
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

// A power-up levelled its line (ADR 0002).
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

/**
 * The floor ladder's first rung: a capped slice of the score, gone (ADR 0003 as
 * amended 2026-09-16).
 *
 * It carries what was taken and what is left standing, the shape `overflowed`
 * already uses, so a readout counting the digits down knows where the score
 * stood before the hit without diffing anything.
 */
interface ScoreBled {
  readonly type: 'scoreBled';
  readonly amount: number;
  readonly score: number;
}

// The floor ladder's second rung: one level off every line at once (ADR 0003).
interface WeaponStripped {
  readonly type: 'weaponStripped';
  readonly lines: readonly WeaponLine[];
}

/**
 * A stripped rung standing on the field as a body the dive can catch
 * (ADR 0055). One per rung the ladder took, at the point the body stands.
 *
 * It is not powerUpSpawned. That one is the offer's, it carries the body id the
 * offer joins on, and a fallen rung belongs to no offer: counting the two
 * together would move what the power-up ledger's denominator means.
 *
 * It is absent for a rung the corpse cap refused, because nothing fell onto the
 * field: the level is still gone and weaponStripped is what says so.
 */
interface RungFell {
  readonly type: 'rungFell';
  readonly line: WeaponLine;
  readonly x: number;
  readonly y: number;
}

/**
 * A fallen rung swallowed: the dive caught it (ADR 0055, decision 24). The
 * level is the line's after the catch, which is unchanged where the line had
 * climbed back to its cap in the meantime.
 *
 * It is not weaponLeveled. That one is a rung bought, which
 * src/dev/replayTallies.ts counts as a level-up, and a restore counted there
 * would quietly change what that reading has always meant.
 */
interface RungCaught {
  readonly type: 'rungCaught';
  readonly line: WeaponLine;
  readonly level: number;
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
 * fault rather than play, and the x is where its wave would have placed it.
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
 * A boss arrived on a section boundary, with the number of phases it will run
 * (ADR 0007). It is the section's own report of what it carries, so the section
 * timeline and the harness's boss report read the fight's shape without asking
 * the boss module anything.
 */
interface BossArrived {
  readonly type: 'bossArrived';
  readonly boss: BossKind;
  readonly phases: number;
}

// One phase of a boss emptied and the next is live (ADR 0007, ADR 0052).
interface PhaseBroke {
  readonly type: 'phaseBroke';
  readonly boss: BossKind;
  readonly phaseIndex: number;
}

/**
 * A boss's last phase emptied. It carries where the body fell, because what a
 * death sheds is placed there, and it is what the Undertaker's ending fires on
 * rather than a section index (ADR 0007).
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
  /**
   * Which source opened, from the same counter every entity draws from. A
   * reading that watched for the first opening alone would silently measure
   * whichever set piece opened first the day a second one lands, and the id is
   * what lets it name the one it measured instead.
   */
  readonly id: number;
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
 * The storm emptied the source's health and took its body, with what the pour
 * still has to spend beside it (#104). It is its own event rather than a close
 * reason because it ends nothing: the remaining budget keeps pouring from the
 * pour point and the source closes later, under one of the two reasons below.
 */
interface SetPieceKilled {
  readonly type: 'setPieceKilled';
  readonly left: number;
}

/**
 * How a set piece ended. One event with a closed reason rather than two events,
 * on the PatchClosed precedent: the two are ends of one thing rather than
 * opposite meanings, every set piece reaches exactly one of them, and a reading
 * groups by the reason.
 */
type SetPieceClosing = 'spent' | 'scrolled';

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
 * expired. It carries the kind because the missed-power-ups instrument has to
 * separate a corpse that scrolled away from a power-up that did, and without it that
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
 * A mob finished being shoved (#79, #126). The repel reading is what reads it,
 * summing shoves per toll. It is one event per shove rather than a field on
 * `tolled` because the shoves land across the ring's expansion, after the
 * tolled event has already fired at ring birth, so no toll-time event can carry
 * them.
 *
 * It fires once per impulse and at the end of it rather than at the start,
 * because a shove spends itself over several ticks and has no realized
 * displacement on the tick it lands. `displacement` is therefore the distance
 * the mob actually covered, every tick of it, after the bound that holds a body
 * inside the field: a shove into the field's edge reports what it truly bought
 * and never the nominal push. A body killed or culled mid-flight reports what
 * it had already been carried, and a body that covered nothing reports nothing.
 *
 * One event per impulse and never one per tick: a per-tick event would multiply
 * the count the repel reading holds by the ticks a shove runs for, and change
 * what the channel means with no READINGS_VERSION move under it.
 */
interface MobShoved {
  readonly type: 'mobShoved';
  readonly id: number;
  readonly displacement: number;
  /**
   * Which push threw it. A reading has to be able to say bell or belch without
   * inferring it from whichever toll window happens to be open, because the
   * belch's own shoves arrive with no toll open at all and inference is what
   * used to throw there (design record R9, READINGS_VERSION 5).
   */
  readonly source: ShoveSource;
}

/**
 * Which gate turned a body away from a press, spelled as the gates the belch
 * actually runs (belch.ts, shoveNearbyTargets) and never as a diagnosis on top
 * of them.
 *
 * There is deliberately no already-dead reason. The storm's target seam skips a
 * dead slot before the belch ever sees it, so a dead body is never in the frame
 * at all.
 */
type PressRefusal =
  // Still above the top edge, so reaching it would move authored content a
  // player never saw arrive (ADR 0008's older scope limit).
  | 'notEntered'
  // Further from the grave than the reach the press catches (design record R11).
  | 'outOfReach'
  // Standing exactly on the grave, with no direction to be thrown along.
  | 'noDirection'
  // An authored pattern a push may not smear (ADR 0007), answered at the seam.
  | 'notPushable';

/**
 * Where one body stood when a shove of the press looked at it, in field units
 * centre to centre from the grave.
 *
 * The distance is the whole reason this record exists rather than a count of
 * misses: Mark's sighting of 2026-09-16 is bodies *at about the same distance*
 * going different ways, and a record with no distance in it cannot answer that.
 * It is measured the same way the reach is, and it is taken at the tick of the
 * shove that wrote the entry rather than at the tick the press landed.
 */
interface BodyInFrame {
  readonly id: number;
  readonly distance: number;
}

// One body this shove of the press threw.
interface MovedBody extends BodyInFrame {
  readonly outcome: 'moved';
}

/**
 * One body this press had already thrown, still travelling under the shoves it
 * was given.
 *
 * It is an outcome and never a refusal, and never an absence either. A shove
 * sweeping a crowd that is all in flight would otherwise read as an empty
 * frame, which is the same unreadable zero the record exists to kill, and
 * writing it down as unmoved with no reason against it would be a state
 * nothing explains.
 */
interface CarriedBody extends BodyInFrame {
  readonly outcome: 'carried';
}

// One body a shove of the press looked at and did not throw, with its gate.
interface RefusedBody extends BodyInFrame {
  readonly outcome: 'refused';
  readonly refusal: PressRefusal;
}

/**
 * One body in one shove's frame, and what that shove did about it: threw it,
 * found it already travelling under this press, or refused it at a named gate.
 *
 * A union rather than one record with optional fields, so an entry that is none
 * of the three cannot be built at all.
 */
type PressedBody = MovedBody | CarriedBody | RefusedBody;

/**
 * The belch fired (ADR 0008). The counts are what the belch-on-wave instrument
 * reads to tell a press that landed on a curtain from one spent on empty sky.
 * Cancelled is mob fire taken off the field and shoved is bodies thrown off the
 * ground around the grave, and the two are separate because a curtain of
 * unarmed trash cancels nothing while being exactly the target the loaded belch
 * exists for.
 *
 * Shoved is a body count and never a distance. It is taken the tick the press
 * lands, which is the only tick that can say how much the field gave this one
 * belch: what each body then really travels arrives up to ninety ticks later as
 * its own mobShoved, with no belch left to attribute it to.
 *
 * **`bodies` left this event on 2026-09-16 and lives on `burstShoved` below**,
 * one event per shove of the press. A press throws three times now and a frame
 * taken sixty ticks after this event was emitted cannot ride on it, and all
 * three shoves report through one shape so no reader special-cases the first.
 * A `Belched` with no frame in it is that move and never a regression.
 * `shoved` keeps its exact meaning, the bodies the press moved on the tick it
 * landed, which is the first shove's own moved count.
 */
interface Belched {
  readonly type: 'belched';
  readonly cancelled: number;
  readonly shoved: number;
}

/**
 * One shove of the burst went out, and this is the frame it swept (#124).
 *
 * One event per shove of a press, the first included, emitted on that shove's
 * own tick. Mark's ruling of 2026-09-16 is that everything within the eruption
 * is pushed on each erupt animation, so each shove re-reads the field at its
 * own tick and throws what stands inside the reach then; without a frame per
 * shove, a press whose later shoves moved nobody and a press whose three all
 * landed read identically in every tape we hold.
 *
 * It rides beside `belched` rather than replacing it, because the eruption, the
 * sound and the cadence reading's own tick all key on the press's own tick and
 * deferring that to the last shove would make the button lie at the one moment
 * it matters.
 *
 * One shove can put up to as many entries in `bodies` as the storm's target
 * seam has slots, the mob pool plus the boss plus the set piece's source, and a
 * press writes three such frames. That costs no tape bytes at all, because no
 * sim event is ever encoded into a tape: a replay rebuilds every event from the
 * seed and the commands, so the tape carries this by construction and
 * FORMAT_VERSION does not move.
 */
interface BurstShoved {
  readonly type: 'burstShoved';
  // The tick the press began on, which is what joins a shove to its press.
  readonly beganAt: number;
  // Which shove of the press this is, counting from one.
  readonly shove: number;
  readonly bodies: readonly PressedBody[];
}

/**
 * A power-up arrived on the field. The denominator for power-ups swallowed versus
 * scrolled off.
 *
 * The id is the join key the offer opens on: openOffer reads it back to learn
 * which body carries which option, so the offer never holds a pooled entity
 * reference. The line is absent on the body a maxed run's carrier opens, which
 * carries no option at all (ADR 0034's nothing-offerable branch).
 */
interface PowerUpSpawned {
  readonly type: 'powerUpSpawned';
  readonly id: number;
  readonly line?: WeaponLine;
  readonly x: number;
  readonly y: number;
}

/**
 * Where an offer stood: at the carrier's own death point, or out of the bank
 * (ADR 0034). A banked offer opens at the grave's own x above the top edge,
 * which is a different thing to walk to, and the site is recorded where it is
 * known rather than guessed from the point later.
 */
type OfferSite = 'death' | 'bank';

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
  readonly site: OfferSite;
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
  /**
   * The taken body's place among the offer's bodies, left to right from zero.
   * The sim knows it where the take happens, so it says so rather than leaving
   * a reader to index the line back into the options it remembered.
   */
  readonly slot: number;
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

// The stage crossed a section boundary (ADR 0006). The music cue hangs here.
interface SectionChanged {
  readonly type: 'sectionChanged';
  readonly section: SectionName;
  /**
   * The loop the section names, or null where it names none (ADR 0049).
   *
   * It rides the event rather than being looked up from the section table,
   * because src/app/sound.ts may reach the event list and nothing else
   * (src/__tests__/boundary.test.ts). The sim says which loop a section plays
   * and src/app resolves that name to a file, which is the split ADR 0049 asks
   * for: the authored fact stays in the sim, the filename stays in the app.
   */
  readonly music: SectionMusic | null;
  readonly tick: number;
}

/**
 * The director bought a card and the executor put it down (ADR 0047, ADR 0056).
 *
 * It is not on the wire and cannot be: OBSERVATION_KINDS in tape/wireCodes.ts
 * is ['frame', 'fault'], so a SimEvent reaches no encoder and FORMAT_VERSION
 * cannot move for one.
 *
 * It carries what a reading needs to draw the director's run against the tape
 * (#85): the card, where it landed, why the spend was permitted and what the
 * purse has left. A reading is computed from events and never from the
 * director's own state, so an event that left any of those out would force the
 * reading to re-derive the director's rules.
 *
 * The payload is the card, which is what keeps the name honest: CONTEXT.md's
 * Add entry reserves the bare word for a boss's summon, and its Card entry's
 * own prose reads "every directed add is a card".
 */
interface DirectedAdd {
  readonly type: 'directedAdd';
  readonly card: DirectorCard;
  // The middle of the group's own bodies, which is where the shape landed.
  readonly x: number;
  // The section whose permission cell and purse the spend read.
  readonly section: SectionName;
  // The signal the gate read low, which is why the spend was permitted.
  readonly signal: number;
  readonly purseLeft: number;
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
  | RungFell
  | RungCaught
  | Sealed
  | Victory
  | MobKilled
  | CarrierLost
  | MobFired
  | BossArrived
  | PhaseBroke
  | BossKilled
  | SetPieceOpened
  | SetPiecePoured
  | SetPieceKilled
  | SetPieceClosed
  | CorpseExpired
  | CorpseLost
  | Tolled
  | MobShoved
  | PatchLaid
  | PatchClosed
  | Belched
  | BurstShoved
  | PowerUpSpawned
  | OfferOpened
  | OfferBanked
  | OfferTaken
  | OfferLost
  | SectionChanged
  | DirectedAdd;

// SectionMusic is the stage's own type and is re-exported here because a section
// change carries it: src/app/sound.ts may reach this module and no other
// (src/__tests__/boundary.test.ts), so the vocabulary a subscriber reads has to
// be reachable from the vocabulary it subscribes to.
export type {
  BodyInFrame,
  CarrierLoss,
  OfferSite,
  PressedBody,
  PressRefusal,
  SectionMusic,
  SetPieceClosing,
  SimEvent,
};
