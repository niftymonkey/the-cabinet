// The director's own state (ADR 0047, ADR 0056): what it holds across a run,
// and nothing it does with it.

/**
 * The pressure the run is putting on the player (CONTEXT.md Pressure): harm and
 * floor events only, held for an interval and then decaying linearly.
 *
 * It never reads a kill near the grave, because a kill up close is food here
 * and a near-kill term would answer a player doing exactly what the design asks
 * by holding back (ADR 0056).
 *
 * The plan's seam writes a third field here, the signal lock, and signalLock.ts
 * is slice G's module: a lock declared now would either import a module that
 * does not exist or stand as a placeholder type where the fold is meant to read
 * a real one. Slice G declares it, and it owes no second witness version move,
 * because a lock is a figure the run resolves before its first tick and never
 * moves, which is the run's identity in exactly the sense seed and roster[] are,
 * and both of those are excluded from the fold with that reason beside them.
 */
interface PressureSignal {
  readonly value: number;
  // The tick the held interval ends on, after which the value decays.
  readonly heldUntilTick: number;
}

/**
 * What the director holds across a run. It lives on RunState so the witness
 * folds it and a replay rebuilds it, which is ADR 0047's binding constraint.
 *
 * Every field is readonly and the record is replaced wholesale rather than
 * mutated, which is what lets one starting value be shared by every run.
 */
interface DirectorState {
  readonly signal: PressureSignal;
  /**
   * What is left of the section's purse, in bodies (ADR 0056). Nothing spends
   * it in this commit: the spend, and Section.purse that grants it, are the
   * plan's step 12, slice F.
   */
  readonly purseLeft: number;
  /**
   * The tick the quiet interval after an add ends on. Nothing draws it in this
   * commit either: the draw is the plan's step 12, slice F, and the minimum it
   * draws above is already authored beside the card table
   * (waves.ts's QUIET_INTERVAL_MINIMUM_SECONDS).
   */
  readonly quietUntilTick: number;
}

/**
 * The director at the top of a run: nothing granted, nothing held, no quiet
 * owed.
 *
 * A purse of zero here is "no section has granted one yet" and never "a section
 * with no purse": the purse is granted per section and Section.purse is slice
 * F's, so the Vigil's authored zero (waves.ts's VIGIL_PURSE) is a different
 * zero that nothing reads yet.
 */
const STARTING_DIRECTOR: DirectorState = {
  signal: { value: 0, heldUntilTick: 0 },
  purseLeft: 0,
  quietUntilTick: 0,
};

export { STARTING_DIRECTOR };
export type { DirectorState, PressureSignal };
