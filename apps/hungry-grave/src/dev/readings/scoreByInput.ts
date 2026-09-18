// What each input paid into the score, so the number reads as its parts.

import type { ScoreInput, SimEvent } from '../../game/events';

/**
 * The score decomposed by the input that paid it (design record R4).
 *
 * It is built from the score's own event and never from the run's state, which
 * is the rule src/dev runs on: re-deriving each arm from the tables would be a
 * second copy of the payment rule living in a satellite.
 *
 * **The decomposition is gross and `run.score` is net.** The floor ladder
 * bleeds a capped slice of the score (ADR 0003 as amended), so in any run that
 * hit the floor the arms sum to more than the run ends holding and the
 * difference is `tuning.damageTaken.scoreBled`. That residual is the one a
 * reader would otherwise call a bug.
 *
 * **Every arm is a pair, what it paid and how many times it paid**, because the
 * count is the denominator the score is read against and the two answer
 * different questions. The pairs are flat rather than nested for the reason the
 * two nullable ones exist: a batch declares a reduction per reading, and a
 * nested arm that is null on a run carries its leaves out of reach of the walk
 * that checks every one of them is declared.
 *
 * **Two arms report nothing rather than zero on a run that never met the thing
 * they measure**, on `wakingSwallows.ts`'s own terms: a zero on the boss arm
 * would say the player fought one and scored nothing off it, and a zero on the
 * source arm would say the Waking opened and was left alive. The other three
 * are reachable in every run, so a zero on them is a real zero.
 *
 * `mealAtMaxedPaid` reading zero is the one figure that carries two stories at
 * once, a run that never reached full power and a run that reached it and took
 * no large food. Nothing in the events parts them, and the batch's `endLevels`
 * is what answers which.
 */
interface ScoreByInput {
  // Every point the run was paid, which is the gross and never run.score.
  readonly paid: number;
  // Denominator: the mobs this run killed.
  readonly killPaid: number;
  readonly killPayments: number;
  // Denominator: the swallows whose growth the ceiling could not take.
  readonly overflowPaid: number;
  readonly overflowPayments: number;
  /**
   * Denominator: the hits that took health off a boss. A hit the phase flash
   * absorbed takes no health and pays none, so it is in neither figure, and
   * both are null on a run that never met a boss at all.
   */
  readonly bossDamagePaid: number | null;
  readonly bossDamagePayments: number | null;
  // Denominator: the Waking's sources killed, which a run can do at most once. Null on a run that never opened one.
  readonly sourceKilledPaid: number | null;
  readonly sourceKilledPayments: number | null;
  // Denominator: the rich swallows taken while every rostered line stood at its top rung.
  readonly mealAtMaxedPaid: number;
  readonly mealAtMaxedPayments: number;
}

interface Tally {
  paid: number;
  payments: number;
}

interface ScoreByInputAcc {
  readonly byInput: Record<ScoreInput, Tally>;
  bossMet: boolean;
  sourceMet: boolean;
}

const emptyTally = (): Tally => ({ paid: 0, payments: 0 });

const createScoreByInput = (): ScoreByInputAcc => ({
  byInput: {
    kill: emptyTally(),
    overflow: emptyTally(),
    bossDamage: emptyTally(),
    sourceKilled: emptyTally(),
    mealAtMaxed: emptyTally(),
  },
  bossMet: false,
  sourceMet: false,
});

/**
 * Whether this run has met a boss and whether it has met the Waking's source,
 * which is what parts an arm that is truly zero from an arm that never had a
 * chance to be anything.
 *
 * A payment counts as having met one as well as the arrival does, because a
 * payment is proof the thing was on the field whatever else was reported.
 */
const observeWhatWasMet = (acc: ScoreByInputAcc, event: SimEvent): void => {
  if (event.type === 'bossArrived') acc.bossMet = true;
  if (event.type === 'setPieceOpened') acc.sourceMet = true;
  if (event.type !== 'scorePaid') return;
  if (event.input === 'bossDamage') acc.bossMet = true;
  if (event.input === 'sourceKilled') acc.sourceMet = true;
};

const observeScoreByInput = (
  acc: ScoreByInputAcc,
  events: readonly SimEvent[],
): void => {
  for (const event of events) {
    observeWhatWasMet(acc, event);
    if (event.type !== 'scorePaid') continue;
    const tally = acc.byInput[event.input];
    tally.paid += event.amount;
    tally.payments += 1;
  }
};

const scoreByInputOf = (acc: ScoreByInputAcc): ScoreByInput => {
  const { byInput } = acc;
  return {
    paid: Object.values(byInput).reduce((sum, tally) => sum + tally.paid, 0),
    killPaid: byInput.kill.paid,
    killPayments: byInput.kill.payments,
    overflowPaid: byInput.overflow.paid,
    overflowPayments: byInput.overflow.payments,
    bossDamagePaid: acc.bossMet ? byInput.bossDamage.paid : null,
    bossDamagePayments: acc.bossMet ? byInput.bossDamage.payments : null,
    sourceKilledPaid: acc.sourceMet ? byInput.sourceKilled.paid : null,
    sourceKilledPayments: acc.sourceMet ? byInput.sourceKilled.payments : null,
    mealAtMaxedPaid: byInput.mealAtMaxed.paid,
    mealAtMaxedPayments: byInput.mealAtMaxed.payments,
  };
};

export { createScoreByInput, observeScoreByInput, scoreByInputOf };
export type { ScoreByInput, ScoreByInputAcc };
