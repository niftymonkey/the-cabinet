/**
 * The candidates: the named tuning records a batch or a play is run under, so a
 * figure always says which tuning produced it (CONTEXT.md Candidate, ADR 0064).
 *
 * The seam is the table and the naming, on the rigs' own terms: a batch is
 * played from a row here, and a record read back later is named by matching it
 * against the same rows.
 */

import { describe, expect, it } from 'vitest';

import {
  DEFAULT_TUNING,
  resolveTuning,
  tuningRows,
} from '../../game/tuningRecord';
import type { TuningRecord } from '../../game/tuningRecord';
import {
  CANDIDATES,
  CANDIDATE_NAMES,
  candidateOf,
  isCandidateName,
} from '../tuningCandidates';

/** The rows one record states, under the dotted name every text surface uses. */
const rowsOf = (record: TuningRecord): Map<string, number> =>
  new Map(tuningRows(record).map((row) => [row.name, row.value]));

/** The dotted names two records state different values under. */
const rowsDiffering = (left: TuningRecord, right: TuningRecord): string[] => {
  const rights = rowsOf(right);
  return tuningRows(left)
    .filter((row) => rights.get(row.name) !== row.value)
    .map((row) => row.name);
};

describe('the candidates a run is played under', () => {
  it('states a whole record in every row, resolved through the one resolver', () => {
    // Every record in the tree enters through resolveTuning (ADR 0064), so a
    // row that is half a record cannot exist and every committed row is proved
    // against the quiet interval's own bound rather than against a rule this
    // table keeps for itself.
    for (const name of CANDIDATE_NAMES) {
      const candidate = CANDIDATES[name];

      expect(candidate.name).toBe(name);
      expect([...rowsOf(candidate.record).keys()]).toEqual([
        ...rowsOf(DEFAULT_TUNING).keys(),
      ]);
      expect(() => resolveTuning(candidate.record)).not.toThrow();
      expect(resolveTuning(candidate.record)).toEqual(candidate.record);
    }
  });

  it('plays the build its own values under the default name', () => {
    // The default row is the resolved default and never a second copy of it, so
    // a batch always names a candidate and a folder always says which, without
    // the bare command meaning anything new.
    expect(CANDIDATES.default.record).toEqual(resolveTuning({}));
  });

  it('moves exactly one row in the candidate beside the default', () => {
    // What a comparison needs: two candidates differing in one row, so the
    // difference a reading shows has one name on it. Read off the rows rather
    // than restated, so a second moved row fails here rather than in a sweep.
    expect(
      rowsDiffering(CANDIDATES.spendable.record, CANDIDATES.default.record),
    ).toEqual(['stage.processionPurse']);
    expect(CANDIDATES.spendable.record.stage.processionPurse).toBeLessThan(
      DEFAULT_TUNING.stage.processionPurse,
    );
  });

  it('takes a candidate name off a command line or refuses it', () => {
    // Parse at the edge: a name becomes a candidate here or is refused here, so
    // nothing inside the harness or the sim ever holds a name it has not
    // checked.
    for (const name of CANDIDATE_NAMES)
      expect(isCandidateName(name)).toBe(true);
    expect(isCandidateName('spendable ')).toBe(false);
    expect(isCandidateName('lean')).toBe(false);
    expect(isCandidateName('')).toBe(false);
  });

  it('names the candidate a run was played under, off its record alone', () => {
    // The other direction, which is what a report bands by: a record read back
    // off a tape is named by matching its rows against the same table.
    for (const name of CANDIDATE_NAMES) {
      expect(candidateOf(CANDIDATES[name].record)).toBe(name);
    }
    expect(candidateOf(DEFAULT_TUNING)).toBe('default');
  });

  it('names no candidate for a record no row holds', () => {
    // A record nobody named is answered as unnamed rather than as the nearest
    // row, which is what #107 asks of every banding: a figure under a record
    // this table does not hold carries no candidate at all.
    expect(
      candidateOf(resolveTuning({ score: { trashKillScore: 7 } })),
    ).toBeNull();
    expect(
      candidateOf(
        resolveTuning({
          stage: {
            processionPurse:
              CANDIDATES.spendable.record.stage.processionPurse + 1,
          },
        }),
      ),
    ).toBeNull();
  });
});
