/**
 * The rows the harness plays under (ADR 0053, the playing-harness record's
 * section 3).
 *
 * Slice 1 ships one row and not nine, so test 16's nine names and test 18's
 * sloppy corner land at slice 5 with the other eight rows and the hold that
 * makes six of them differ from their head-only siblings.
 */

import { describe, expect, it } from 'vitest';

import {
  CONFIGURATIONS,
  CONFIGURATION_NAMES,
  isConfigurationName,
  RESERVED_POLICIES,
  SHARP_HAND,
} from '../configurations';

// The hand words and the head words, said in that order, which is what a name is.
const HANDS = ['steady', 'loose', 'shaky'];
const HEADS = ['far', 'middling', 'short'];

describe('the configurations the harness plays under (ADR 0053)', () => {
  it('names every configuration as a hand word and a head word', () => {
    // ADR 0053 asks for "a small set of named configurations from a sharp hand
    // to a sloppy one", and the record's section 3 makes a name a word pair a
    // person can say rather than a number, so a report names the hand it read
    // the game with in words the reader already has.
    for (const name of CONFIGURATION_NAMES) {
      const [hand, head, ...rest] = name.split('-');
      expect(HANDS, name).toContain(hand);
      expect(HEADS, name).toContain(head);
      expect(rest, name).toEqual([]);
    }
    expect(CONFIGURATION_NAMES).toContain(SHARP_HAND);
  });

  it('names no configuration after a policy the game itself writes', () => {
    // The record's section 5: the set the game writes and the set the harness
    // writes are disjoint by construction, which is how a bot run can never be
    // mistaken for a person's once the header carries the name.
    const taken = CONFIGURATION_NAMES.filter((name) =>
      RESERVED_POLICIES.includes(name),
    );
    expect(taken).toEqual([]);
    expect([...RESERVED_POLICIES].sort()).toEqual(['person', 'script']);
  });

  it('gives every configuration all four knobs and no optional field', () => {
    // A row with a field missing is a different row, and the tuning pass reads
    // these as a table. holdBound is on the row before anything reads it for
    // that reason: the sharp corner's own value is zero either way.
    for (const name of CONFIGURATION_NAMES) {
      const row = CONFIGURATIONS[name];
      expect(Object.keys(row).sort(), name).toEqual([
        'belchWorthIt',
        'enoughClearance',
        'holdBound',
        'lookaheadSamples',
        'name',
      ]);
      expect(row.name, name).toBe(name);
      expect(Number.isFinite(row.holdBound), name).toBe(true);
      expect(row.holdBound, name).toBeGreaterThanOrEqual(0);
      expect(row.belchWorthIt, name).toBeGreaterThan(0);
      expect(row.enoughClearance, name).toBeGreaterThan(0);
      expect(row.lookaheadSamples.length, name).toBeGreaterThan(0);
    }
  });

  it('resolves every configuration name and refuses an unknown one', () => {
    // Parse at the edge: a shell's argument becomes a name here or is refused
    // here, so nothing inside the harness ever holds a name it has not
    // checked.
    for (const name of CONFIGURATION_NAMES) {
      expect(isConfigurationName(name), name).toBe(true);
    }
    expect(isConfigurationName('steady-fart')).toBe(false);
    expect(isConfigurationName('')).toBe(false);
    expect(isConfigurationName('person')).toBe(false);
    expect(isConfigurationName('toString')).toBe(false);
  });
});
