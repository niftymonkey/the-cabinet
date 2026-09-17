/**
 * The record's whole promise at this tip is that its default is the build's own
 * values, so the first suite below is ten assertions against ten constants and
 * never a loop over a pairing somebody typed: a loop proves the list and not the
 * values.
 */

import { describe, expect, it } from 'vitest';
import { TICK_HZ } from '../clock';
import { QUIET_MAX_TICKS } from '../director';
import {
  CROWD_PURSE,
  PROCESSION_PURSE,
  QUIET_INTERVAL_MINIMUM_SECONDS,
  VIGIL_PURSE,
} from '../stage/waves';
import {
  MEAL_AT_MAXED_SCORE,
  SCORE_BLEED_CAP,
  SCORE_PER_BOSS_HEALTH,
  SOURCE_KILL_SCORE,
  TRASH_KILL_SCORE,
} from '../tuning';
import { DEFAULT_TUNING, resolveTuning, tuningRows } from '../tuningRecord';

describe('the default tuning record', () => {
  it('holds exactly the values the build was compiled with', () => {
    // The four score rows below hold their constant's own multiplier rather
    // than its product, which is the form each constant is written in and why
    // the default is identical by arithmetic instead of by a second copy of a
    // number. Every row here is still a second spelling of its constant, held
    // equal by this test and nothing else, and it retires with the constants.
    expect(DEFAULT_TUNING.stage.processionPurse).toBe(PROCESSION_PURSE);
    expect(DEFAULT_TUNING.stage.crowdPurse).toBe(CROWD_PURSE);
    expect(DEFAULT_TUNING.stage.vigilPurse).toBe(VIGIL_PURSE);
    expect(DEFAULT_TUNING.stage.quietIntervalMinimumSeconds).toBe(
      QUIET_INTERVAL_MINIMUM_SECONDS,
    );
    expect(DEFAULT_TUNING.stage.quietIntervalMaximumSeconds).toBe(
      QUIET_MAX_TICKS / TICK_HZ,
    );
    expect(DEFAULT_TUNING.score.trashKillScore).toBe(TRASH_KILL_SCORE);
    expect(DEFAULT_TUNING.score.bleedCapInKills * TRASH_KILL_SCORE).toBe(
      SCORE_BLEED_CAP,
    );
    expect(TRASH_KILL_SCORE / DEFAULT_TUNING.score.bossHealthPerKill).toBe(
      SCORE_PER_BOSS_HEALTH,
    );
    expect(DEFAULT_TUNING.score.sourceKillInKills * TRASH_KILL_SCORE).toBe(
      SOURCE_KILL_SCORE,
    );
    expect(DEFAULT_TUNING.score.mealAtMaxedInKills * TRASH_KILL_SCORE).toBe(
      MEAL_AT_MAXED_SCORE,
    );
  });

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
    expect(tuningRows(DEFAULT_TUNING)).toEqual([
      { name: 'stage.processionPurse', value: PROCESSION_PURSE },
      { name: 'stage.crowdPurse', value: CROWD_PURSE },
      { name: 'stage.vigilPurse', value: VIGIL_PURSE },
      {
        name: 'stage.quietIntervalMinimumSeconds',
        value: QUIET_INTERVAL_MINIMUM_SECONDS,
      },
      {
        name: 'stage.quietIntervalMaximumSeconds',
        value: QUIET_MAX_TICKS / TICK_HZ,
      },
      { name: 'score.trashKillScore', value: TRASH_KILL_SCORE },
      {
        name: 'score.bleedCapInKills',
        value: SCORE_BLEED_CAP / TRASH_KILL_SCORE,
      },
      {
        name: 'score.bossHealthPerKill',
        value: TRASH_KILL_SCORE / SCORE_PER_BOSS_HEALTH,
      },
      {
        name: 'score.sourceKillInKills',
        value: SOURCE_KILL_SCORE / TRASH_KILL_SCORE,
      },
      {
        name: 'score.mealAtMaxedInKills',
        value: MEAL_AT_MAXED_SCORE / TRASH_KILL_SCORE,
      },
    ]);
  });
});
