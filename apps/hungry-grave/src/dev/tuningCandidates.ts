// The candidates: one named tuning record a run is played under, by name (ADR 0064).

import type { TuningRecord } from '../game/tuningRecord';
import { resolveTuning, tuningRows } from '../game/tuningRecord';

/**
 * The tuning records a batch or a build plays under, and never a description of
 * where the run starts or of the hand that steers: a figure names its candidate
 * beside its rig and its configuration, and no one of the three answers another
 * (CONTEXT.md Candidate, ADR 0053).
 */
const CANDIDATE_NAMES = ['default', 'spendable'] as const;

type CandidateName = (typeof CANDIDATE_NAMES)[number];

/**
 * One candidate: a name and the whole tuning record a run under it plays
 * (ADR 0064).
 *
 * The record is held whole rather than as the rows it moves, for the reason a
 * rig holds its condition whole (ADR 0063): a row that stated only its
 * differences would mean something new every time a default moved underneath
 * it, and a figure banded to it would name a tuning nobody played. Every row is
 * resolved, so what the name stands for is fixed at the commit it was read at.
 */
interface TuningCandidate {
  readonly name: CandidateName;
  readonly record: TuningRecord;
}

/**
 * A Procession purse the section is certain to be able to spend, in bodies. An
 * initial data row, and the one figure this table states of its own.
 *
 * What it is set against is the quiet interval rather than the section's
 * standing waves, which is the other half of the pricing the default row holds.
 * The Procession's directed span runs from its first wave at t=2 to the
 * standing wave at zero at t=111.5, which is the first cell the director may
 * not spend in, so the span is 109.5 seconds. Inside a window the director adds
 * once at its opening and once at every quiet interval (caps.ts's
 * directedInside), so at the record's own longest interval of 8 seconds that
 * span allows 14 adds, and the cheapest card is a Drip of one ghoul at 3 bodies
 * (waves.ts's CARDS and BODY_COST). Fourteen adds at three is 42: the most the
 * section can be certain to spend, against a default of 116 priced as a third
 * of what its own standing waves land.
 *
 * What would move it: the Procession's own wave table at either end of that
 * span, `stage.quietIntervalMaximumSeconds`, and the cheapest card in the
 * table. What it is read against is a sweep of the two rows, which is the first
 * thing that can say whether the purse binds this section at all: step 6's
 * slice 5 measured the Procession spending 8 to 11 bodies of its 116 under the
 * steady hand, because the section's ceiling of one live formation stops the
 * director long before any purse does.
 */
const SPENDABLE_PROCESSION_PURSE = 42;

/**
 * The rows, keyed by name.
 *
 * The default row is the resolved default, so a batch always names a candidate
 * and a folder always says which without the bare command meaning anything new.
 * It is asserted against the resolver rather than restated, because a second
 * copy of the build's own values is a copy that can go stale.
 *
 * The second row exists to prove the machinery rather than to answer the
 * finding behind it: the first sweep's own list says the purses are priced
 * above what the quiet interval lets a section spend, and moving a number is a
 * later round's after a sweep has read one.
 */
const CANDIDATES: Readonly<Record<CandidateName, TuningCandidate>> = {
  default: { name: 'default', record: resolveTuning({}) },
  spendable: {
    name: 'spendable',
    record: resolveTuning({
      stage: { processionPurse: SPENDABLE_PROCESSION_PURSE },
    }),
  },
};

// Whether a raw name is one the table holds, which is where a typed name is checked.
const isCandidateName = (raw: string): raw is CandidateName =>
  CANDIDATE_NAMES.some((name) => name === raw);

/** Whether two records state the same value under every row they name. */
const sameRows = (left: TuningRecord, right: TuningRecord): boolean => {
  const rights = new Map(tuningRows(right).map((row) => [row.name, row.value]));
  const lefts = tuningRows(left);
  return (
    lefts.length === rights.size &&
    lefts.every((row) => rights.get(row.name) === row.value)
  );
};

/**
 * Which candidate a run was played under, or null when no row holds that
 * record.
 *
 * Null rather than the nearest row, for the reason `rigOf` answers null: a
 * record nobody named is exactly what #107 asks a figure never to be banded
 * under, and a sweep comparing two candidates by name needs the naming to be
 * exact. It bands by the rows and never by the name a caller happened to hold,
 * so a record read back off a tape's own header bands the same way one taken
 * from this table does.
 *
 * Its caller is step 6's slice 8, the sweep runner, whose report says which
 * tuning it read (ADR 0064).
 */
const candidateOf = (record: TuningRecord): CandidateName | null =>
  CANDIDATE_NAMES.find((name) => sameRows(record, CANDIDATES[name].record)) ??
  null;

export { CANDIDATES, CANDIDATE_NAMES, candidateOf, isCandidateName };
export type { CandidateName, TuningCandidate };
