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
  /**
   * The bodies the Procession gives the director (ADR 0056), about a third of
   * what its own standing waves land over the section.
   *
   * Its three rates land 349 bodies: two a second from t=12 to t=45, three and
   * a half to t=78, five to t=111.5, and nothing after the rate of zero. A
   * third of that is 116, which is the design record's own rule (its section 5
   * item 6) and what "when the purse is empty the section runs at its authored
   * floor for whatever is left of it" is measured against.
   */
  processionPurse: number;
  /**
   * The bodies the Crowd gives the director, on the same third (ADR 0056).
   *
   * Its three rates land 1164 bodies: eight a second from t=6 to t=57, three
   * through the trough to t=81, and twelve to its last wave at t=138. A third
   * of that is 388. It is the largest of the three because the Crowd is the
   * section that owns overlap, so the floor the director adds over is the
   * highest the stage authors anywhere.
   */
  crowdPurse: number;
  /**
   * The bodies the Vigil gives the director, and it is zero (ADR 0056).
   *
   * Zero on two counts that agree. The section authors no standing wave at all,
   * so a third of its standing total is a third of nothing; and it owns
   * scarcity, so a purse spent here would buy exactly the growth the property
   * forbids.
   *
   * It is zero and never absent. A section the director may not touch at all
   * names no row (stage.ts's Section.purse), and this is a section it may look
   * at and find nothing in, which a reading can see from the first tick
   * (CONTEXT.md Purse).
   */
  vigilPurse: number;
  /**
   * The shortest the director may ever go between two adds, in seconds. The
   * design record's section 9 gives the interval as four to eight seconds and
   * ADR 0056 leaves its bounds open as design work.
   *
   * Two readers, and they must not disagree: the director draws its own quiet
   * interval off this floor, and the corpse and mob caps derive from the most
   * the director can add inside a window, which is the cards this minimum
   * leaves room for. Both take it off the same run's record, which is what
   * makes a second copy inexpressible.
   */
  quietIntervalMinimumSeconds: number;
  /**
   * The longest, in seconds, from the same four-to-eight band. Nothing derives
   * from it, and it is a row rather than a figure in the director so that the
   * resolver can assert the minimum sits at or below it without importing
   * anything (resolveTuning below).
   */
  quietIntervalMaximumSeconds: number;
};

/**
 * The score's inputs, each stated against a trash kill (design record R4).
 *
 * Every row but the unit itself is a multiplier and never a product, because
 * the sentence each one exists to make sayable is about the income it comes out
 * of: "a hit at the floor costs you twenty kills" says something a bare two
 * thousand does not. That form is also what moves a whole economy from one row:
 * a record that moves the unit moves every payment with it.
 */
type ScoreTuning = {
  /**
   * The unit of score: what killing one mow body pays. Every mob's score payout
   * is stated as a multiple of this (mobs.ts's scorePayoutInKills), exactly as
   * every food payout is stated as a multiple of the trash corpse's.
   *
   * It is a first figure, and it is a figure rather than a derivation because
   * nothing can measure what a kill should pay before kills pay anything. Score
   * is one number fed by several inputs and the kill is only the first of them
   * (ADR 0002 as amended 2026-09-16, design record `show-what-you-have.md` R4),
   * so what this is read against is the score a whole run ends on, which is
   * M6's reading. A round hundred for the commonest body is the genre's own
   * convention, and it keeps the number legible beside the overflow's
   * fractions, which the same readout has to carry.
   */
  trashKillScore: number;
  /**
   * The most one hit at the size floor can bleed, in trash kills. The ladder's
   * first rung takes the lesser of this and what the run is holding, and the
   * remainder stays (ADR 0003 as amended 2026-09-16 on Mark's ruling "Cap the
   * bleed", design record `show-what-you-have.md` R4's closing amendment).
   *
   * It is a first figure inside the researched band of 10 to 40 trash kills
   * (`docs/research/score-loss-on-a-hit-precedent.md` section 5), and it sits
   * below that band's midpoint on purpose. What it is set against is the early
   * window rather than the middle of the band: until a run's score first
   * crosses the cap the cap does not exist for the player at all and the first
   * floor hit still takes everything, so the lower the figure the sooner the
   * rule is real. At the storm's measured 2.47 kills a second it is about eight
   * seconds of mowing, and against slice M1's own batch, where a run made
   * 12,400 to 58,112 points gross, a run that bleeds twice pays about a third
   * of the leanest run and a fifteenth of the richest.
   *
   * What it gets tuned against is slice M6's bleeds and strips per run, and it
   * is re-read after slice M7 rather than against M6 alone: the band's upper
   * end is argued against a run's gross, and M7's boss damage, source kill and
   * rich swallow all pay into that gross.
   */
  bleedCapInKills: number;
  /**
   * The points of boss health one trash kill is worth, so a fight's worth
   * follows a boss's own health (design record R4: boss damage is paid per hit
   * landed, never as a lump on the kill).
   *
   * The rate and not the fight: what a whole fight pays is the boss's own
   * PHASE_HP over this, so a retune of a boss's health moves the fight's worth
   * with it and no figure here goes stale. That is why the ratios are in prose
   * rather than typed: at this rate the Banshee's 2,200 health is 22 trash
   * kills and the Undertaker's 5,100 is 51, both inside the researched band of
   * 20 to 70 trash kills for a single input
   * (`docs/research/score-inputs-precedent.md` section 4).
   *
   * What it is set against is the swamping refusal. The mob table pays one
   * trash kill per 8 points of health, floored, and that rate applied to a boss
   * pays 637 trash kills for the Undertaker, more than the whole rest of a run
   * makes. Roughly a hundred points of boss health to one trash kill is what
   * the band converts to, so a boss's health pays at a far slower rate than the
   * mow's and a fight is felt without swamping what a run mows. The shape is
   * ours and not the genre's: almost nothing ships boss damage as a per-hit
   * trickle, and the reason the lump at the kill is refused is that it pays
   * nothing to a run that fought the Undertaker and sealed before the last
   * phase emptied (ADR 0007).
   *
   * It is a first figure. What it gets tuned against is each input's share of a
   * run that reached a boss, which slice M7's own batch prints.
   */
  bossHealthPerKill: number;
  /**
   * What killing the Waking's source pays, in trash kills, once, on the tick
   * its health empties (design record R4: one bonus on the kill and never a
   * rate).
   *
   * Twenty-four, derived rather than picked: at the same
   * hundred-health-per-trash-kill rate the row above carries, the source's
   * 2,400 health is 24 (`docs/research/score-inputs-precedent.md` section 4).
   *
   * What it is set against is the genre's two tiers, and the figure lands in
   * the gap between them on purpose. A spawner pays 6x to 10x a trash kill
   * across Robotron, Gradius and Defender; a structural core or a stage
   * objective pays 30x to 130x across Bosconian, Gradius and Xevious. The
   * source sits above the first because it is the section's objective rather
   * than roadside furniture, and below the second because a core kill in all
   * three of those games ends or denies something. Killing this one denies
   * nothing: #104 keeps the pour running from the pour point whatever the storm
   * did, so none of the denial premium the spawner tier is paid for applies
   * here and neither Xevious's milk-then-deny greed decision nor Robotron's
   * safety premium is the precedent to reach for. The bonus is a trophy for the
   * commitment up the trail (ADR 0042) and nothing else.
   *
   * It is a first figure, read against the same batch as the row above.
   */
  sourceKillInKills: number;
  /**
   * What one large meal taken at a maxed ladder pays, in trash kills, on top of
   * the growth, the charge and the overflow that swallow already pays (design
   * record R4: a swallow whose tier is rich, taken while every rostered line
   * stands at MAX_LEVEL, counted as items and never as a fraction of a unit).
   *
   * It is the smallest of the three because the count is what binds it: the
   * input pays per item and a run takes many. What it is set against is
   * measured rather than argued. Slice M7's batch on the maxed rig, twelve runs
   * played to the stage's end, took 24 to 47 large meals at full power per run,
   * so at one trash kill each the whole input is 2,400 to 4,700 points across a
   * run: between what the Banshee's whole fight pays and what the Undertaker's
   * does, which is the same band as one boss fight rather than above it, and
   * inside the researched 20 to 70 trash kills for a single input. At twice
   * this the top of that range reaches 9,400 and the input outgrows both
   * fights.
   *
   * No game in the research pass scores food at all, so there is no direct
   * anchor and this row says so (`docs/research/score-inputs-precedent.md`
   * section 3). What transfers is the band and the two named failure modes,
   * both with a community's verdict attached: too small to bother with, which
   * is Great Mahou Daisakusen's "extremely minuscule ... safely ignore" and
   * Battle Garegga's own "not recommended"; and large enough to farm, which is
   * Gunbird's scorers suiciding to stay at max and DoDonPachi's MAXIMUM bomb
   * bonus becoming the entire high-level game. The nearest structural match is
   * Bayonetta, which scales the payout with the pickup's tier, 50 halos for the
   * half-bar item and 100 for the full one, and the rich tier is the tier this
   * game already has.
   *
   * It is a first figure, read against the count the same batch prints.
   */
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
 * Every row is now the only spelling of its magnitude: the constants these
 * values were lifted out of are gone, and the readers named in this file's
 * header take theirs off the run's own record. A run started under no record
 * resolves to exactly this, which is what makes the default a rename of the
 * build rather than a retune of it.
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
 * The quiet interval's own bound, and the first of the three the resolver
 * refuses.
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
 * The stage's own divisor, and it is the same row both ends of the interval sit
 * around.
 *
 * Every cap prices a window as one card at its opening and one more at every
 * quiet interval inside it, so a zero here floors to Infinity, the pools open
 * at no capacity anybody can allocate, and a run never reaches a first tick to
 * fault on. Only zero is refused: whether a lower positive bound belongs here
 * is a data row a later round measures, and until it is measured a short
 * interval is a candidate. It is the one stage row that is a divisor, which is
 * why this names the row rather than sweeping the group: the Vigil's purse is
 * zero by ruling.
 */
const refuseZeroQuietIntervalMinimum = (stage: StageTuning): void => {
  if (stage.quietIntervalMinimumSeconds !== 0) return;
  throw new Error(
    `stage.quietIntervalMinimumSeconds is written as 0, and every cap prices the cards a window's shortest quiet interval leaves room for`,
  );
};

/**
 * The score's own bound, and it is the one row of the group that is a divisor.
 *
 * What a fight pays is the boss's own health over this rate, so a zero here
 * replays to an infinite score and the `no NaN` invariant fires a tick later.
 * Every other score row is a multiplier and zero is an ordinary value for it: a
 * candidate that pays nothing for a source kill is a candidate and not a
 * defect, which is why this names the row rather than sweeping the group.
 */
const refuseZeroBossHealthRate = (score: ScoreTuning): void => {
  if (score.bossHealthPerKill !== 0) return;
  throw new Error(
    `score.bossHealthPerKill is written as 0, and a fight's worth is the boss's own health over it`,
  );
};

/**
 * The complete record an overlay stands for, every absent row filled from the
 * default.
 *
 * Its input is already typed, because parsing a raw name a person typed is the
 * edge's job: there is no such thing as an unknown row reaching here. What it
 * refuses is the three bounds above and nothing else, and a record our own code
 * produced cannot fail any of them, which is repair by origin.
 */
const resolveTuning = (overlay: TuningOverlay): TuningRecord => {
  const resolved: TuningRecord = {
    stage: { ...DEFAULT_TUNING.stage, ...overlay.stage },
    score: { ...DEFAULT_TUNING.score, ...overlay.score },
  };
  refuseInvertedQuietInterval(resolved.stage);
  refuseZeroQuietIntervalMinimum(resolved.stage);
  refuseZeroBossHealthRate(resolved.score);
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
