/**
 * The starting condition a tape records, written from a run and read back
 * against what this build implements (ADR 0043, ADR 0063).
 *
 * The seam is the pair: a block is what the tape holds and a `StartingConditions`
 * is what a run starts from, and this module is the one place either becomes the
 * other. A tape is a document, so what it says is reported as recorded and
 * refused for replay with the row named, never repaired.
 */

import { describe, expect, it } from 'vitest';

import { MAX_LEVEL, WEAPON_LINES } from '../../game/lines/roster';
import type { StartingConditions } from '../../game/run';
import { birthrightLevels, uniformLevels } from '../../game/run';
import { SIGNAL_FULL, SIGNAL_RAN_LIVE } from '../../game/signalLock';
import { SIZE_FLOOR, SIZE_START } from '../../game/tuning';
import type { TuningRow } from '../../game/tuningRecord';
import { DEFAULT_TUNING, tuningRows } from '../../game/tuningRecord';
import {
  resolveStartingCondition,
  startingConditionBlock,
  TUNING_ROW_NAMES,
} from '../startingCondition';
import type { StartingConditionBlock } from '../tape';

/** A condition stated whole, because the record is the resolved one (ADR 0063). */
const CONDITIONS: StartingConditions = {
  startingSize: SIZE_START,
  startingLevels: birthrightLevels(),
  roster: [...WEAPON_LINES],
  signalLock: SIGNAL_RAN_LIVE,
  startingScore: 0,
  tuning: DEFAULT_TUNING,
};

const BLOCK = startingConditionBlock(CONDITIONS);

/** The same block with one extra row wedged in. */
function withRow(name: string, value: number): StartingConditionBlock {
  return [...BLOCK, { name, value }];
}

/** The same block with one row taken out. */
function withoutRow(name: string): StartingConditionBlock {
  return BLOCK.filter((entry) => entry.name !== name);
}

/** The same block with one row written differently. */
function rowWritten(name: string, value: number): StartingConditionBlock {
  return BLOCK.map((entry) => (entry.name === name ? { name, value } : entry));
}

/**
 * The same row at a legal value this build is not compiled with.
 *
 * A purse counts whole bodies, so its move is a whole one; every other row is a
 * quantity, and halving one keeps a share inside the 0 to 1 the resolver
 * requires and a positive row above the zero it refuses.
 */
function movedValue(row: TuningRow): number {
  return row.name.endsWith('Purse') ? row.value + 1 : row.value / 2;
}

/** Why a block was refused, or a failure naming what it resolved to instead. */
function reasonFor(block: StartingConditionBlock): string {
  const resolved = resolveStartingCondition(block);
  if (resolved.outcome !== 'notImplemented') {
    throw new Error('the block resolved where a refusal was expected');
  }
  return resolved.reason;
}

describe('the block a run is written down as', () => {
  it('carries the whole condition and nothing the run has to be asked for', () => {
    // ADR 0063: one record, one spelling. Every field of the condition is a row
    // and the tuning record's own rows ride beside them under their dotted
    // names, which is the one addressable name every text surface uses.
    const names = BLOCK.map((entry) => entry.name);

    expect(names).toContain('startingSize');
    expect(names).toContain('signalLock');
    expect(names).toContain('startingScore');
    for (const row of tuningRows(DEFAULT_TUNING)) {
      expect(names).toContain(row.name);
    }
  });

  it('writes the roster as its level rows, in the order the run fielded them', () => {
    // The set and the order are one fact, so the roster is these entries and
    // never a list of its own: two spellings of one fact can disagree.
    const reversed = [...WEAPON_LINES].reverse();
    const block = startingConditionBlock({
      ...CONDITIONS,
      roster: reversed,
      startingLevels: uniformLevels(MAX_LEVEL),
    });
    const named = block
      .filter((entry) => entry.name.startsWith('levels.'))
      .map((entry) => entry.name.slice('levels.'.length));

    expect(named).toEqual(reversed);
  });

  it('requires every row of the tuning record, one by one', () => {
    // The fence between this module's own row list and the record's nesting: a
    // row the record gains and the header does not carry would be a row a
    // candidate could move with nothing to replay it, and a walk over a hand
    // list is the two-lists trap ADR 0019 closed for the witness fold.
    expect([...TUNING_ROW_NAMES]).toEqual(
      tuningRows(DEFAULT_TUNING).map((row) => row.name),
    );
    for (const name of TUNING_ROW_NAMES) {
      expect(reasonFor(withoutRow(name))).toContain(name);
    }
  });
});

describe('a block this build can start a run with', () => {
  it('resolves to the condition the run was written down as', () => {
    const resolved = resolveStartingCondition(BLOCK);

    expect(resolved.outcome).toBe('implemented');
    if (resolved.outcome !== 'implemented') return;
    expect(resolved.conditions).toEqual(CONDITIONS);
  });

  it('resolves a condition whose values are not this build own', () => {
    // The point of carrying values at all: a tape replays under the record it
    // was played under, whatever this build compiles.
    const staged: StartingConditions = {
      ...CONDITIONS,
      startingSize: SIZE_FLOOR,
      startingLevels: uniformLevels(MAX_LEVEL),
      signalLock: SIGNAL_FULL,
      startingScore: 6000,
      tuning: {
        ...DEFAULT_TUNING,
        score: { ...DEFAULT_TUNING.score, trashKillScore: 250 },
      },
    };
    const resolved = resolveStartingCondition(startingConditionBlock(staged));

    expect(resolved.outcome).toBe('implemented');
    if (resolved.outcome !== 'implemented') return;
    expect(resolved.conditions).toEqual(staged);
    expect(DEFAULT_TUNING.score.trashKillScore).not.toBe(250);
  });

  it('resolves every tuning row to the value the block states, one by one', () => {
    // The other half of the fence above: that one holds the rows the header
    // requires against the record's nesting, and this one holds the record the
    // header resolves to against the same walk, so a row a tape names and the
    // replay fills from the build's own default cannot pass. ADR 0027's promise
    // is that a tape replays under the record it names, whatever this build
    // compiles, and a row read back as the default is that promise broken with
    // the header still saying otherwise.
    for (const row of tuningRows(DEFAULT_TUNING)) {
      const moved = movedValue(row);
      const resolved = resolveStartingCondition(rowWritten(row.name, moved));

      expect(resolved.outcome).toBe('implemented');
      if (resolved.outcome !== 'implemented') return;
      expect(
        tuningRows(resolved.conditions.tuning).find(
          (resolvedRow) => resolvedRow.name === row.name,
        ),
      ).toEqual({ name: row.name, value: moved });
    }
  });

  it('resolves a roster naming fewer lines than this build has, and fields exactly those', () => {
    // ADR 0046: a run fields a roster drawn from a growing pool, so a block
    // naming three lines is an ordinary run rather than an unreadable one, and
    // the line it does not name is unowned rather than unsaid.
    const smaller = [...WEAPON_LINES].filter((line) => line !== 'bell');
    const resolved = resolveStartingCondition(
      startingConditionBlock({ ...CONDITIONS, roster: smaller }),
    );

    expect(resolved.outcome).toBe('implemented');
    if (resolved.outcome !== 'implemented') return;
    expect([...resolved.conditions.roster]).toEqual(smaller);
    expect(resolved.conditions.startingLevels.bell).toBe(0);
  });
});

describe('a block this build cannot start any run at all', () => {
  it('refuses a roster it does not implement, and says so as a roster', () => {
    // The roster arm and the condition arm are two refusals and never one: a
    // build without the lines cannot simulate the run whatever its rows say
    // (ADR 0043).
    const resolved = resolveStartingCondition(withRow('levels.moonlight', 2));

    expect(resolved.outcome).toBe('notImplemented');
    if (resolved.outcome !== 'notImplemented') return;
    expect(resolved.refusal).toBe('roster');
    expect(resolved.recordedRoster).toContain('moonlight');
    expect(resolved.reason).toContain('moonlight');
  });

  it('refuses a row this build does not have, and names it', () => {
    expect(reasonFor(withRow('weather.fogDensity', 0.5))).toContain(
      'weather.fogDensity',
    );
  });

  it('refuses a row this build requires and the block does not name', () => {
    for (const name of ['startingSize', 'signalLock', 'startingScore']) {
      expect(reasonFor(withoutRow(name))).toContain(name);
    }
  });

  it('refuses a value that is not a finite number, whatever row it sits under', () => {
    // A tape is a document, so a value it cannot support is rejected and never
    // repaired: a NaN carried into the run freezes it there and faults on every
    // tick after, which is a whole run spent on a reading nobody could use.
    for (const value of [Number.NaN, Infinity, -Infinity]) {
      expect(reasonFor(rowWritten('startingSize', value))).toContain(
        'startingSize',
      );
      expect(reasonFor(rowWritten('score.trashKillScore', value))).toContain(
        'score.trashKillScore',
      );
    }
  });

  it('refuses a negative where the row own meaning has no below', () => {
    expect(reasonFor(rowWritten('startingScore', -1))).toContain(
      'startingScore',
    );
    expect(reasonFor(rowWritten('stage.crowdPurse', -1))).toContain(
      'stage.crowdPurse',
    );
    expect(reasonFor(rowWritten('levels.bell', -1))).toContain('levels.bell');
  });

  it('refuses a fraction where the row counts whole things, and takes one where it measures', () => {
    // A level is a rung, a score is points a run holds and a purse is bodies a
    // section gives the director, so half of one is not a value any of them can
    // take. A seconds row and a payment stated in trash kills are quantities
    // and a fraction is an ordinary value for them.
    expect(reasonFor(rowWritten('levels.bell', 1.5))).toContain('levels.bell');
    expect(reasonFor(rowWritten('startingScore', 0.5))).toContain(
      'startingScore',
    );
    expect(reasonFor(rowWritten('stage.vigilPurse', 0.5))).toContain(
      'stage.vigilPurse',
    );
    expect(
      resolveStartingCondition(
        rowWritten('stage.quietIntervalMinimumSeconds', 4.5),
      ).outcome,
    ).toBe('implemented');
    expect(
      resolveStartingCondition(rowWritten('score.mealAtMaxedInKills', 0.5))
        .outcome,
    ).toBe('implemented');
  });

  it('refuses a lock the signal own scale could never stand at, and takes the two it can', () => {
    // The refusal readHeader used to hold, in the same shape: a figure outside
    // the scale would hold the gate where the signal can never stand. The value
    // that means the signal ran live is minus one on purpose, a figure the
    // scale cannot produce, so it is not caught by the negative rule above.
    for (const lock of [SIGNAL_FULL + 0.5, -2, Number.NaN]) {
      expect(reasonFor(rowWritten('signalLock', lock))).toContain('signalLock');
    }
    for (const lock of [SIGNAL_RAN_LIVE, 0, SIGNAL_FULL]) {
      const resolved = resolveStartingCondition(rowWritten('signalLock', lock));
      expect(resolved.outcome).toBe('implemented');
      if (resolved.outcome !== 'implemented') return;
      expect(resolved.conditions.signalLock).toBe(lock);
    }
  });

  it('refuses a quiet interval whose minimum sits above its own maximum', () => {
    // The resolver's own bound, reported in the tape's words rather than thrown
    // through a reader: a block replaying under its own values would otherwise
    // reach the director's draw with a negative span (ADR 0064).
    const reason = reasonFor(
      rowWritten('stage.quietIntervalMinimumSeconds', 30),
    );

    expect(reason).toContain('stage.quietIntervalMinimumSeconds');
    expect(reason).toContain('stage.quietIntervalMaximumSeconds');
  });

  it('refuses a boss-health rate of zero, because a fight divides by it', () => {
    // The resolver's second bound, reported here in the tape's words for the
    // same reason the first is: a block writing zero there replays to an
    // infinite score, which the header's own slice filed for the candidates'.
    expect(reasonFor(rowWritten('score.bossHealthPerKill', 0))).toContain(
      'score.bossHealthPerKill',
    );
  });

  it('refuses a quiet-interval minimum of zero, because every cap divides by it', () => {
    // The resolver's third bound, inherited here rather than written twice: a
    // block writing zero there derives caps of Infinity and the run's own
    // sprite pools never finish opening. Reading and replaying are two
    // obligations, so the recorded roster still comes back off the header and
    // only the replay refuses, with the row named (ADR 0043, ADR 0064).
    const resolved = resolveStartingCondition(
      rowWritten('stage.quietIntervalMinimumSeconds', 0),
    );

    expect(resolved.outcome).toBe('notImplemented');
    if (resolved.outcome !== 'notImplemented') return;
    expect(resolved.refusal).toBe('condition');
    expect(resolved.recordedRoster).toEqual([...WEAPON_LINES]);
    expect(resolved.reason).toContain('stage.quietIntervalMinimumSeconds');
  });

  it('refuses a name the block states twice', () => {
    // One of the two values is then unreachable by name, which is the
    // positional ambiguity the whole block exists to remove.
    expect(reasonFor(withRow('startingScore', 500))).toContain('startingScore');
    expect(reasonFor(withRow('levels.bell', 3))).toContain('levels.bell');
  });
});
