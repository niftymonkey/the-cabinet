/**
 * The record is now the only spelling of its ten magnitudes: the constants they
 * were lifted out of are gone, so the identity suite that held each row equal
 * to its constant went with them, exactly as the module's own JSDoc said it
 * would. What is left to pin here is the resolver and the walk.
 */

import { describe, expect, it } from 'vitest';
import { DEFAULT_TUNING, resolveTuning, tuningRows } from '../tuningRecord';

describe('the default tuning record', () => {
  it("stands inside the quiet interval's own bound", () => {
    expect(() => resolveTuning({})).not.toThrow();
  });
});

describe('resolving a partial tuning record', () => {
  it('leaves every other row at its default when one stage row is named', () => {
    const resolved = resolveTuning({ stage: { crowdPurse: 500 } });

    expect(resolved.stage.crowdPurse).toBe(500);
    expect(resolved.stage.processionPurse).toBe(
      DEFAULT_TUNING.stage.processionPurse,
    );
    expect(resolved.stage.vigilPurse).toBe(DEFAULT_TUNING.stage.vigilPurse);
    expect(resolved.stage.quietIntervalMinimumSeconds).toBe(
      DEFAULT_TUNING.stage.quietIntervalMinimumSeconds,
    );
    expect(resolved.stage.quietIntervalMaximumSeconds).toBe(
      DEFAULT_TUNING.stage.quietIntervalMaximumSeconds,
    );
  });

  it('leaves every other row at its default when one score row is named', () => {
    const resolved = resolveTuning({ score: { bleedCapInKills: 30 } });

    expect(resolved.score.bleedCapInKills).toBe(30);
    expect(resolved.score.trashKillScore).toBe(
      DEFAULT_TUNING.score.trashKillScore,
    );
    expect(resolved.score.bossHealthPerKill).toBe(
      DEFAULT_TUNING.score.bossHealthPerKill,
    );
    expect(resolved.score.sourceKillInKills).toBe(
      DEFAULT_TUNING.score.sourceKillInKills,
    );
    expect(resolved.score.mealAtMaxedInKills).toBe(
      DEFAULT_TUNING.score.mealAtMaxedInKills,
    );
  });

  it('answers the default record when no row is named at all', () => {
    // Which is what an unnamed candidate resolves to, so the run a person
    // starts with nothing named is the run the build compiles.
    expect(resolveTuning({})).toEqual(DEFAULT_TUNING);
  });

  it('leaves the other group whole when one group is named', () => {
    const resolved = resolveTuning({ stage: { vigilPurse: 7 } });

    expect(resolved.score).toEqual(DEFAULT_TUNING.score);
  });

  it('answers a complete record, so nothing downstream ever handles an absent row', () => {
    const rows = tuningRows(resolveTuning({ score: { trashKillScore: 50 } }));

    expect(rows).toHaveLength(tuningRows(DEFAULT_TUNING).length);
    expect(rows.every((row) => Number.isFinite(row.value))).toBe(true);
  });

  it('rejects a record whose quiet-interval minimum sits above its maximum, naming both rows', () => {
    // The bound lives here rather than in a candidate table because every
    // record in the tree enters through this function, and a tape header
    // replaying under its own values would otherwise reach stream.nextInt with
    // a negative span.
    const inverted = {
      stage: { quietIntervalMinimumSeconds: 9, quietIntervalMaximumSeconds: 8 },
    };

    expect(() => resolveTuning(inverted)).toThrow(
      /stage\.quietIntervalMinimumSeconds.*stage\.quietIntervalMaximumSeconds/,
    );
  });
});

describe("the tuning record's rows", () => {
  it("read as dotted names off the record's own nesting", () => {
    // Each name is paired with the row it is the name of, spelled out one at a
    // time rather than walked: walking the record here would be the walk under
    // test and would pass on any pairing at all.
    expect(tuningRows(DEFAULT_TUNING)).toEqual([
      {
        name: 'stage.processionPurse',
        value: DEFAULT_TUNING.stage.processionPurse,
      },
      { name: 'stage.crowdPurse', value: DEFAULT_TUNING.stage.crowdPurse },
      { name: 'stage.vigilPurse', value: DEFAULT_TUNING.stage.vigilPurse },
      {
        name: 'stage.quietIntervalMinimumSeconds',
        value: DEFAULT_TUNING.stage.quietIntervalMinimumSeconds,
      },
      {
        name: 'stage.quietIntervalMaximumSeconds',
        value: DEFAULT_TUNING.stage.quietIntervalMaximumSeconds,
      },
      {
        name: 'score.trashKillScore',
        value: DEFAULT_TUNING.score.trashKillScore,
      },
      {
        name: 'score.bleedCapInKills',
        value: DEFAULT_TUNING.score.bleedCapInKills,
      },
      {
        name: 'score.bossHealthPerKill',
        value: DEFAULT_TUNING.score.bossHealthPerKill,
      },
      {
        name: 'score.sourceKillInKills',
        value: DEFAULT_TUNING.score.sourceKillInKills,
      },
      {
        name: 'score.mealAtMaxedInKills',
        value: DEFAULT_TUNING.score.mealAtMaxedInKills,
      },
    ]);
    // Ten distinct names, so a walk answering one row ten times could not have
    // produced the list above.
    expect(
      new Set(tuningRows(DEFAULT_TUNING).map((row) => row.name)).size,
    ).toBe(10);
  });
});
