// The starting condition a tape records: the block written from a run, and the
// block read back into the condition this build can replay (ADR 0043, ADR 0063).

import type { StartingConditions } from '../game/run';
import { holdableSignal, SIGNAL_RAN_LIVE } from '../game/signalLock';
import type { TuningRecord } from '../game/tuningRecord';
import {
  DEFAULT_TUNING,
  resolveTuning,
  tuningRows,
} from '../game/tuningRecord';
import { resolveStartingLevels } from './startingLevels';
import type { StartingConditionBlock } from './tape';

// The size the run began at, which is the size the grave took.
const SIZE_ROW = 'startingSize';

// The figure the run held its pressure signal at, or the value that means it ran live.
const LOCK_ROW = 'signalLock';

// The score the run began holding, which a staged ladder run is the reason for.
const SCORE_ROW = 'startingScore';

/**
 * What a level entry's name opens with, one per line the run fielded.
 *
 * The roster is these entries in the order they are written and never a list of
 * its own: the set and the order are the same fact, so recording it twice would
 * be two spellings that can disagree (ADR 0043, ADR 0063).
 */
const LEVEL_PREFIX = 'levels.';

/**
 * The dotted name of every row of the tuning record, off the record's own
 * nesting rather than a list beside it, so a row added there is a row this
 * block requires without anybody rewriting a second list.
 */
const TUNING_ROW_NAMES: readonly string[] = tuningRows(DEFAULT_TUNING).map(
  (row) => row.name,
);

/**
 * The whole condition a run started from, as the names and values a tape holds.
 *
 * The order is the one a reader meets the run in: what it was, then what it
 * fielded, then what it was playing under. Only the level entries' order is
 * load-bearing, because it is the roster.
 */
const startingConditionBlock = (
  conditions: StartingConditions,
): StartingConditionBlock => [
  { name: SIZE_ROW, value: conditions.startingSize },
  ...conditions.roster.map((line) => ({
    name: `${LEVEL_PREFIX}${line}`,
    value: conditions.startingLevels[line],
  })),
  { name: LOCK_ROW, value: conditions.signalLock },
  { name: SCORE_ROW, value: conditions.startingScore },
  ...tuningRows(conditions.tuning),
];

/**
 * The block names a condition this build implements, so its values become the
 * run's own trusted record.
 */
interface ConditionImplemented {
  readonly outcome: 'implemented';
  readonly conditions: StartingConditions;
}

/**
 * The block names a condition this build cannot replay. The roster arm and the
 * condition arm are two outcomes and never one: a build without the lines
 * cannot simulate the run whatever its rows say, and reporting one as the other
 * would be the substitution ADR 0043 forbids.
 *
 * The reason is in the tape's own vocabulary, naming the row, because a refusal
 * a reader cannot act on is a blanket refusal wearing a longer sentence.
 */
interface ConditionNotImplemented {
  readonly outcome: 'notImplemented';
  readonly refusal: 'roster' | 'condition';
  readonly recordedRoster: readonly string[];
  readonly reason: string;
}

type StartingCondition = ConditionImplemented | ConditionNotImplemented;

/** The block's entries under their names, or the first name it states twice. */
const namedValues = (
  block: StartingConditionBlock,
): ReadonlyMap<string, number> | string => {
  const values = new Map<string, number>();
  for (const entry of block) {
    // A name stated twice leaves one of the two values unreachable by name,
    // which is the positional ambiguity this whole block exists to remove.
    if (values.has(entry.name)) return entry.name;
    values.set(entry.name, entry.value);
  }
  return values;
};

/** The lines the block names, in the order it names them, which is the roster. */
const rosterIn = (block: StartingConditionBlock): string[] =>
  block
    .filter((entry) => entry.name.startsWith(LEVEL_PREFIX))
    .map((entry) => entry.name.slice(LEVEL_PREFIX.length));

/** The level each named line resolved to, in the tape's own vocabulary. */
const levelsIn = (block: StartingConditionBlock): Record<string, number> => {
  // Prototype-free, because the names are decoded bytes rather than our own
  // vocabulary. A line named `__proto__` assigned into an ordinary object is
  // swallowed by the prototype setter and reads back as an inherited object,
  // which is not the missing level it actually is.
  const levels: Record<string, number> = Object.create(null);
  for (const entry of block) {
    if (!entry.name.startsWith(LEVEL_PREFIX)) continue;
    levels[entry.name.slice(LEVEL_PREFIX.length)] = entry.value;
  }
  return levels;
};

/** Whether a name is one this build's own starting condition has a place for. */
const known = (name: string): boolean =>
  name === SIZE_ROW ||
  name === LOCK_ROW ||
  name === SCORE_ROW ||
  name.startsWith(LEVEL_PREFIX) ||
  TUNING_ROW_NAMES.includes(name);

/**
 * Whether a row counts whole things rather than measuring a quantity, so a
 * fraction of one is not a value it can take.
 *
 * Read off the names rather than listed beside them, because each of the three
 * is a naming convention the record already makes load-bearing: a level is a
 * rung, a score is points a run holds, and a purse is bodies a section gives
 * the director (`stage.ts` derives its own PurseRow off the same suffix). A
 * seconds row and every row stated as a multiple of a trash kill are quantities
 * and a fraction of one is an ordinary value.
 */
const countsWholeThings = (name: string): boolean =>
  name === SCORE_ROW || name.startsWith(LEVEL_PREFIX) || name.endsWith('Purse');

/**
 * Why this build cannot take the value written under a name, or null when it
 * can.
 *
 * A tape is a document, so a value it cannot support is rejected and never
 * repaired (repair by origin). Every row this asks about is non-negative: a
 * negative size, level, score, purse, interval or payment is a figure the thing
 * it names has no meaning below, and a non-finite one would carry the NaN into
 * the run and fault on every tick after. The lock is not one of them and never
 * reaches here, because the value that means the signal ran live is deliberately
 * a figure the scale cannot produce, which is minus one.
 */
const valueRefusal = (name: string, value: number): string | null => {
  if (!Number.isFinite(value)) {
    return `${name} is written as ${value}, which is not a number this build can start a run from`;
  }
  if (value < 0) {
    return `${name} is written as ${value}, and nothing this build starts from is negative`;
  }
  if (countsWholeThings(name) && !Number.isInteger(value)) {
    return `${name} is written as ${value}, and it counts whole things`;
  }
  return null;
};

/**
 * Why this build cannot hold the signal where the tape says, or null.
 *
 * `readHeader` asked this before the block existed. It moved here rather than
 * being lost, because which name is the lock is a question about this build's
 * vocabulary: a figure outside the signal's own scale would hold the gate where
 * the signal can never stand.
 */
const lockRefusal = (lock: number): string | null => {
  if (lock === SIGNAL_RAN_LIVE || holdableSignal(lock)) return null;
  return `${LOCK_ROW} is written as ${lock}, which the signal's own scale cannot stand at`;
};

/** The first thing the block says that this build cannot take, or null. */
const blockRefusal = (values: ReadonlyMap<string, number>): string | null => {
  for (const [name, value] of values) {
    if (!known(name)) {
      return `${name} is a starting condition this build does not have`;
    }
    // The lock has a scale of its own and every other row shares one rule.
    const refusal =
      name === LOCK_ROW ? lockRefusal(value) : valueRefusal(name, value);
    if (refusal !== null) return refusal;
  }
  for (const name of [SIZE_ROW, LOCK_ROW, SCORE_ROW, ...TUNING_ROW_NAMES]) {
    if (!values.has(name)) {
      return `${name} is a starting condition this build requires and this tape does not name`;
    }
  }
  return null;
};

/**
 * The value written under a name the block has already been checked to carry,
 * so an absence here is this module's own bug rather than anything a tape can
 * hold.
 */
const valueOf = (values: ReadonlyMap<string, number>, name: string): number => {
  const value = values.get(name);
  if (value === undefined) {
    throw new Error(`${name} passed the block's own check and is not in it`);
  }
  return value;
};

/**
 * The tuning record the block states, every row named.
 *
 * Written out row by row rather than walked, so the compiler holds it total: a
 * row added to the record fails to compile here, and the fence in
 * `startingCondition.test.ts` holds this list against the record's own nesting
 * so neither can gain a row the other has not heard of.
 */
const tuningIn = (values: ReadonlyMap<string, number>): TuningRecord => {
  const row = (name: string): number => valueOf(values, name);
  return resolveTuning({
    stage: {
      processionPurse: row('stage.processionPurse'),
      crowdPurse: row('stage.crowdPurse'),
      vigilPurse: row('stage.vigilPurse'),
      quietIntervalMinimumSeconds: row('stage.quietIntervalMinimumSeconds'),
      quietIntervalMaximumSeconds: row('stage.quietIntervalMaximumSeconds'),
    },
    score: {
      trashKillScore: row('score.trashKillScore'),
      bleedCapInKills: row('score.bleedCapInKills'),
      bossHealthPerKill: row('score.bossHealthPerKill'),
      sourceKillInKills: row('score.sourceKillInKills'),
      mealAtMaxedInKills: row('score.mealAtMaxedInKills'),
    },
  });
};

/**
 * The record the block states, or the resolver's own words for why it is not a
 * record at all.
 *
 * `resolveTuning` is the one door every record in the tree enters by and it
 * throws on the quiet interval's bound (ADR 0064). A record our own code
 * produced cannot fail it, which is why it throws rather than answering; a tape
 * is the one place an illegal record arrives from outside, so this is the one
 * call site that catches it and reports it as the document defect it is.
 */
const tuningOrRefusal = (
  values: ReadonlyMap<string, number>,
): TuningRecord | string => {
  try {
    return tuningIn(values);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    return error.message;
  }
};

const notImplemented = (
  refusal: 'roster' | 'condition',
  recordedRoster: readonly string[],
  reason: string,
): ConditionNotImplemented => ({
  outcome: 'notImplemented',
  refusal,
  recordedRoster,
  reason,
});

/**
 * The condition a block states, resolved against what this build implements.
 *
 * This is the parse-at-the-edge step for the header: recorded names and values
 * are checked exactly once, here, and become a trusted `StartingConditions` the
 * run keeps without re-checking. Reading and replaying are two obligations, and
 * this answers replaying: a block naming a row this build does not have is
 * still reported truthfully off the header, and only the simulation refuses.
 *
 * The roster is asked last of the three because it is the most specific: a
 * block that is not a condition at all cannot be said to name a roster, and a
 * tape whose rows this build has but whose lines it does not is exactly the
 * case ADR 0043's own refusal was written for.
 */
const resolveStartingCondition = (
  block: StartingConditionBlock,
): StartingCondition => {
  const recordedRoster = rosterIn(block);
  const values = namedValues(block);
  if (typeof values === 'string') {
    return notImplemented(
      'condition',
      recordedRoster,
      `${values} is named twice, so one of its two values is unreachable by name`,
    );
  }
  const refusal = blockRefusal(values);
  if (refusal !== null) {
    return notImplemented('condition', recordedRoster, refusal);
  }
  const tuning = tuningOrRefusal(values);
  if (typeof tuning === 'string') {
    return notImplemented('condition', recordedRoster, tuning);
  }
  const levels = resolveStartingLevels(recordedRoster, levelsIn(block));
  if (levels.outcome === 'notImplemented') {
    return notImplemented(
      'roster',
      recordedRoster,
      `this tape was recorded against the roster ${recordedRoster.join(', ')}, which this build does not implement`,
    );
  }
  return {
    outcome: 'implemented',
    conditions: {
      startingSize: valueOf(values, SIZE_ROW),
      startingLevels: levels.levels,
      roster: levels.roster,
      signalLock: valueOf(values, LOCK_ROW),
      startingScore: valueOf(values, SCORE_ROW),
      tuning,
    },
  };
};

export {
  startingConditionBlock,
  resolveStartingCondition,
  TUNING_ROW_NAMES,
  SIZE_ROW,
  LOCK_ROW,
  SCORE_ROW,
  LEVEL_PREFIX,
};
export type {
  StartingCondition,
  ConditionImplemented,
  ConditionNotImplemented,
};
