/**
 * The rows the harness plays under (ADR 0053, the playing-harness record's
 * section 3).
 */

import { describe, expect, it } from 'vitest';

import type { ConfigurationName } from '../configurations';
import {
  CONFIGURATIONS,
  CONFIGURATION_NAMES,
  isConfigurationName,
  RESERVED_POLICIES,
  SHARP_HAND,
  SLOPPY_HAND,
} from '../configurations';

// The hand words and the head words, said in that order, which is what a name is.
// The hands are written in ladder order, sharpest first, because the climbing
// test below reads the list as the ladder rather than as a set.
const HANDS = ['steady', 'loose', 'unsteady', 'wavering', 'faltering', 'shaky'];
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
    // Eighteen and not seventeen or nineteen: six hands crossed with three
    // heads, every pair present, so a comparison can hold one knob still and
    // move the other.
    expect([...CONFIGURATION_NAMES].sort()).toEqual(
      HANDS.flatMap((hand) => HEADS.map((head) => `${hand}-${head}`)).sort(),
    );
    expect(CONFIGURATION_NAMES).toContain(SHARP_HAND);
  });

  it('climbs from the sharp hand to the sloppy one one rung at a time', () => {
    // The record's section 3: a rung is not a separate character, it is the
    // same hand failing more often and worse, so the two dexterity numbers
    // both rise from one hand to the next and neither ever falls back. The
    // three hands between loose and shaky exist because the ladder had a gap
    // no batch had ever played, and a gap cannot be read.
    const rungs = HANDS.map(
      (hand) => CONFIGURATIONS[`${hand}-far` as ConfigurationName],
    );

    expect(rungs[0].lapsePerMille).toBe(0);
    expect(rungs[0].lapseBound).toBe(0);
    for (const [index, rung] of rungs.slice(1).entries()) {
      const sharper = rungs[index];
      expect(rung.lapsePerMille, rung.name).toBeGreaterThan(
        sharper.lapsePerMille,
      );
      expect(rung.lapseBound, rung.name).toBeGreaterThan(sharper.lapseBound);
    }

    // The two numbers belong to the hand and not to the head, so all three
    // heads of one hand carry the same pair and the knobs stay separable.
    for (const name of CONFIGURATION_NAMES) {
      const rung = rungs[HANDS.indexOf(name.split('-')[0])];
      expect(CONFIGURATIONS[name].lapsePerMille, name).toBe(rung.lapsePerMille);
      expect(CONFIGURATIONS[name].lapseBound, name).toBe(rung.lapseBound);
    }
  });

  it('names the sharp corner steady-far and the sloppy corner shaky-short', () => {
    // The two corners a finding has to agree across (ADR 0053) and the two the
    // done line names. They are the extremes of both knobs at once: the sharp
    // hand never lapses and reads the whole horizon, the sloppy one lapses
    // most often, deepest, and reads the least.
    expect(SHARP_HAND).toBe('steady-far');
    expect(SLOPPY_HAND).toBe('shaky-short');

    const sharp = CONFIGURATIONS[SHARP_HAND];
    const sloppy = CONFIGURATIONS[SLOPPY_HAND];
    expect(sharp.lapsePerMille).toBe(0);
    expect(sharp.lapseBound).toBe(0);
    for (const name of CONFIGURATION_NAMES) {
      const row = CONFIGURATIONS[name];
      expect(row.lapsePerMille, name).toBeLessThanOrEqual(sloppy.lapsePerMille);
      expect(row.lapseBound, name).toBeLessThanOrEqual(sloppy.lapseBound);
      expect(row.lookaheadSamples.length, name).toBeGreaterThanOrEqual(
        sloppy.lookaheadSamples.length,
      );
    }
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

  it('gives every configuration every knob and no optional field', () => {
    // A row with a field missing is a different row, and the tuning pass reads
    // these as a table. The dexterity error is two numbers and not one,
    // because a lapse is how often attention fails and how deep the lapse runs
    // when it does (the record's section 3, amended 2026-09-09).
    for (const name of CONFIGURATION_NAMES) {
      const row = CONFIGURATIONS[name];
      expect(Object.keys(row).sort(), name).toEqual([
        'belchWorthIt',
        'enoughClearance',
        'lapseBound',
        'lapsePerMille',
        'lookaheadSamples',
        'name',
      ]);
      expect(row.name, name).toBe(name);
      expect(Number.isInteger(row.lapsePerMille), name).toBe(true);
      expect(row.lapsePerMille, name).toBeGreaterThanOrEqual(0);
      expect(row.lapsePerMille, name).toBeLessThanOrEqual(1000);
      expect(Number.isInteger(row.lapseBound), name).toBe(true);
      expect(row.lapseBound, name).toBeGreaterThanOrEqual(0);
      expect(row.belchWorthIt, name).toBeGreaterThan(0);
      expect(row.enoughClearance, name).toBeGreaterThan(0);
      expect(row.lookaheadSamples.length, name).toBeGreaterThan(0);
    }
  });

  it('shortens each head from the far end and never thins it throughout', () => {
    // The record's section 3: a shorter head keeps the near samples and loses
    // the developing wave, because bot.ts's own argument for the near samples
    // is that a threat passing through the grave and gone by the far sample is
    // the one a horizon-only policy cannot see at all. A head thinned in the
    // middle would lose that instead, and would be a different knob.
    const heads = HEADS.map(
      (head) => CONFIGURATIONS[`steady-${head}` as ConfigurationName],
    ).map((row) => row.lookaheadSamples);

    for (const [index, shorter] of heads.slice(1).entries()) {
      const longer = heads[index];
      expect(shorter.length, `${HEADS[index + 1]}`).toBeLessThan(longer.length);
      expect(longer.slice(0, shorter.length)).toEqual([...shorter]);
    }
    // The same list whichever hand names it, so the two knobs stay separable.
    for (const name of CONFIGURATION_NAMES) {
      const head = name.split('-')[1];
      expect(CONFIGURATIONS[name].lookaheadSamples, name).toEqual([
        ...heads[HEADS.indexOf(head)],
      ]);
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
