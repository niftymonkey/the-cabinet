// The tuning record: the magnitudes a batch reading can move, grouped by the
// module that owns them, with the default the build compiles and the resolver
// every record in the tree enters through.

/**
 * The stage's own magnitudes: what each section gives the director to spend,
 * and the two ends of the interval the director waits out between two adds
 * (ADR 0056, ADR 0064).
 *
 * The group is the module that owns the numbers, which is what makes the dotted
 * name below readable as a place and not just a key.
 */
type StageTuning = {
  /** The bodies the Procession gives the director, about a third of what its own standing waves land. */
  processionPurse: number;
  /** The bodies the Crowd gives the director, on the same third, and the largest of the three. */
  crowdPurse: number;
  /** The bodies the Vigil gives the director, and it is zero because the section owns scarcity. */
  vigilPurse: number;
  /** The shortest the director may ever go between two adds, in seconds. */
  quietIntervalMinimumSeconds: number;
  /** The longest, in seconds, from the design record's four-to-eight band. */
  quietIntervalMaximumSeconds: number;
};

/**
 * The score's inputs, each stated against a trash kill exactly as the constants
 * that hold them are (design record R4).
 *
 * Every row here is a multiplier and never a product, because the sentence each
 * one exists to make sayable is about the income it comes out of: "a hit at the
 * floor costs you twenty kills" says something a bare two thousand does not.
 * That form is also what makes the default identical to the build's own values
 * by arithmetic rather than by a second copy of a number.
 */
type ScoreTuning = {
  /** The unit of score: what killing one mow body pays. A first figure, read against the score a whole run ends on. */
  trashKillScore: number;
  /** The most one hit at the size floor can bleed, in trash kills. A first figure inside the researched band of 10 to 40, read against the bleeds and strips a run takes. */
  bleedCapInKills: number;
  /** The points of boss health one trash kill is worth, so a fight's worth follows a boss's own health. A first figure, read against each input's share of a run that reached a boss. */
  bossHealthPerKill: number;
  /** What killing the Waking's source pays, in trash kills. A first figure, read against the same batch as the row above. */
  sourceKillInKills: number;
  /** What one large meal taken at a maxed ladder pays, in trash kills. A first figure, read against the count of such meals a run takes. */
  mealAtMaxedInKills: number;
};

/**
 * Every magnitude a batch reading can move, grouped by the module that owns it
 * (CONTEXT.md Tuning record, ADR 0064).
 *
 * A row exists only where something reads it, which is why this holds the rows
 * the first sweep names rather than every magnitude the rule admits. This
 * module imports nothing, which is what lets the sim, the tape header and
 * playback all own the same type without any of them importing a consumer, and
 * it is why a reader takes the record as an argument instead of reaching for it.
 */
type TuningRecord = {
  stage: StageTuning;
  score: ScoreTuning;
};

/**
 * A record with any row absent, which is what a candidate or a command line
 * names before the resolver completes it.
 *
 * Written out a group at a time rather than as one `Partial<TuningRecord>`,
 * because that would make a named group's own rows all required.
 */
interface TuningOverlay {
  stage?: Partial<StageTuning>;
  score?: Partial<ScoreTuning>;
}

/** One row under the one addressable name every text surface uses for it. */
interface TuningRow {
  name: string;
  value: number;
}

/**
 * The values the build is compiled with, row for row.
 *
 * Nothing reads this yet and nothing may: at this tip every row is a second
 * spelling of the constant it names, held equal to it by tuningRecord.test.ts
 * and by nothing else, and the duplicate lives until the slice that retires
 * those constants retires that test beside them.
 */
const DEFAULT_TUNING: TuningRecord = {
  stage: {
    processionPurse: 116,
    crowdPurse: 388,
    vigilPurse: 0,
    quietIntervalMinimumSeconds: 4,
    quietIntervalMaximumSeconds: 8,
  },
  score: {
    trashKillScore: 100,
    bleedCapInKills: 20,
    bossHealthPerKill: 100,
    sourceKillInKills: 24,
    mealAtMaxedInKills: 1,
  },
};

/**
 * The quiet interval's own bound, and the whole of what the resolver refuses.
 *
 * It lives here rather than in a candidate table because every record in the
 * tree enters through resolveTuning, and a table catches the rows somebody
 * committed only: a tape header replaying under its own values would otherwise
 * reach the director's draw with a negative span. Both ends are rows, so the
 * assertion imports nothing.
 */
const refuseInvertedQuietInterval = (stage: StageTuning): void => {
  if (stage.quietIntervalMinimumSeconds <= stage.quietIntervalMaximumSeconds) {
    return;
  }
  throw new Error(
    `stage.quietIntervalMinimumSeconds ${stage.quietIntervalMinimumSeconds} sits above stage.quietIntervalMaximumSeconds ${stage.quietIntervalMaximumSeconds}, so the director would draw over a negative span`,
  );
};

/**
 * The complete record an overlay stands for, every absent row filled from the
 * default.
 *
 * Its input is already typed, because parsing a raw name a person typed is the
 * edge's job: there is no such thing as an unknown row reaching here. What it
 * refuses is the one bound above and nothing else, and a record our own code
 * produced cannot fail it, which is repair by origin.
 */
const resolveTuning = (overlay: TuningOverlay): TuningRecord => {
  const resolved: TuningRecord = {
    stage: { ...DEFAULT_TUNING.stage, ...overlay.stage },
    score: { ...DEFAULT_TUNING.score, ...overlay.score },
  };
  refuseInvertedQuietInterval(resolved.stage);
  return resolved;
};

/** One group's rows under the dotted names its own nesting gives them. */
const rowsOfGroup = (
  group: string,
  rows: Record<string, number>,
): TuningRow[] =>
  Object.entries(rows).map(([row, value]) => ({
    name: `${group}.${row}`,
    value,
  }));

/**
 * Every row of a record as the one addressable name a command line, a tape
 * header, a report and a comparison all use, and its value.
 *
 * Walked off the nesting rather than read from a list beside it, because a list
 * somebody maintains by hand falls behind the type the first time a row is
 * added.
 */
const tuningRows = (record: TuningRecord): TuningRow[] =>
  Object.entries(record).flatMap(([group, rows]) => rowsOfGroup(group, rows));

export { DEFAULT_TUNING, resolveTuning, tuningRows };
export type {
  ScoreTuning,
  StageTuning,
  TuningOverlay,
  TuningRecord,
  TuningRow,
};
