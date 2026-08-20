/**
 * The event vocabulary the sim reports out (tracer plan section 3). Payloads
 * carry values, never entity references: entities are pooled and mutated in
 * place, so a held reference is a recycled slot by the time a sound or an
 * instrument reads it.
 *
 * Every payload here serves three subscribers at once, because the tracer plan
 * names all three: a sound, a renderer, and an instrument that lives outside
 * the sim.
 */

import type { WeaponLine } from "./lines/roster";
import type { FoodKind } from "./swallow";

/** Food went in. The weapon lines subscribe to this in dispatch 5. */
interface Swallowed {
  readonly type: "swallowed";
  readonly kind: FoodKind;
  readonly freshness: number;
  readonly payout: number;
}

/** The swallow chime, on every swallow from the very first, whatever the loadout. */
interface Chimed {
  readonly type: "chimed";
  readonly kind: FoodKind;
}

/** The grave grew. Size is the new size, so a renderer needs nothing else. */
interface Grew {
  readonly type: "grew";
  readonly amount: number;
  readonly size: number;
}

/** Growth the ceiling could not take, or a maxed line's drop, converted to score (ADR 0003). */
interface Overflowed {
  readonly type: "overflowed";
  readonly amount: number;
  readonly score: number;
}

/** The reservoir took charge from a swallow (ADR 0008). */
interface ReservoirCharged {
  readonly type: "reservoirCharged";
  readonly amount: number;
  readonly reservoir: number;
}

/** Charge past full, visibly wasted rather than silently clamped (ADR 0008). */
interface Splashed {
  readonly type: "splashed";
  readonly wasted: number;
  readonly reservoir: number;
}

/** The reservoir reached capacity, so the one button is armed (ADR 0008). */
interface ReservoirFull {
  readonly type: "reservoirFull";
  readonly reservoir: number;
}

/** A drop levelled its line (ADR 0002). */
interface WeaponLeveled {
  readonly type: "weaponLeveled";
  readonly line: WeaponLine;
  readonly level: number;
}

/** Mob fire landed. ADR 0014's dim reads this, and the window is its refractory interval. */
interface GraveHit {
  readonly type: "graveHit";
  readonly size: number;
  readonly invulnerable: number;
}

/** The floor ladder's first rung: the whole score, gone (ADR 0003). */
interface ScoreBled {
  readonly type: "scoreBled";
  readonly amount: number;
}

/** The floor ladder's second rung: one level off every line at once (ADR 0003). */
interface WeaponStripped {
  readonly type: "weaponStripped";
  readonly lines: readonly WeaponLine[];
}

/** The end of the ladder, and of the run (ADR 0003). */
interface Sealed {
  readonly type: "sealed";
  readonly tick: number;
}

/**
 * scoreBled, weaponStripped and sealed stay three events rather than one ladder
 * event. At the size floor there is no shrink, so ADR 0014's rim channel is
 * silent and these three are the only second channel left.
 */
export type SimEvent =
  | Swallowed
  | Chimed
  | Grew
  | Overflowed
  | ReservoirCharged
  | Splashed
  | ReservoirFull
  | WeaponLeveled
  | GraveHit
  | ScoreBled
  | WeaponStripped
  | Sealed;
