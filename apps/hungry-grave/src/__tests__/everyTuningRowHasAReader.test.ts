/**
 * A row of the tuning record with no reader is worse than no row at all.
 *
 * It is a cross-cutting guard rather than the record's own test, because the
 * property spans the record and every module that takes one: nothing inside
 * tuningRecord.ts can see whether anything reads what it declares. A candidate
 * could move a reader-less row and the run would play exactly the same, which
 * is a sweep that reports a number as tried when nothing tried it, so the
 * eligibility half of ADR 0064 is enforced here rather than remembered.
 *
 * The walk reads source for the row's own leaf name, which is why a reader
 * spells it at the site as a property or as a string literal and never
 * destructures it. Comments are taken out first: a row named in prose is a
 * mention and not a reader, and the import fence next door has already been
 * caught once by the word "import" inside a test title
 * (step-6-progress.md section 5).
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { DEFAULT_TUNING, tuningRows } from '../game/tuningRecord';

const SRC = resolve(import.meta.dirname, '..');

/** The core, which is the whole of where a row may be read. */
const THE_CORE = join(SRC, 'game');

/** The module that declares the record, whose own mentions are declarations. */
const DECLARES_THE_RECORD = join(SRC, 'game', 'tuningRecord.ts');

function typescriptFilesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return typescriptFilesUnder(path);
    return name.endsWith('.ts') ? [path] : [];
  });
}

/**
 * The source with every comment taken out, so a row named in prose cannot
 * answer for a row nothing reads.
 *
 * Block comments go first, so a line comment inside one cannot truncate the
 * strip. A `//` inside a string literal would take the rest of its line with
 * it, which can only ever hide a reader and never invent one, so the mechanism
 * fails toward the fence rather than past it.
 */
function codeOnly(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/** A row's own leaf name, which is the last segment of its dotted name. */
function leafOf(dotted: string): string {
  const leaf = dotted.split('.').at(-1);
  if (leaf === undefined) throw new Error(`${dotted} has no leaf name`);
  return leaf;
}

/** Whether a source names this row, as a property or as a string literal. */
function names(source: string, leaf: string): boolean {
  return new RegExp(`\\b${leaf}\\b`).test(codeOnly(source));
}

/** Every shipped core module but the one the record is declared in. */
function readersOfTheCore(): string[] {
  return typescriptFilesUnder(THE_CORE)
    .filter((file) => !file.endsWith('.test.ts'))
    .filter((file) => file !== DECLARES_THE_RECORD);
}

/** Which shipped core modules name this row, by their path under src. */
function modulesReading(leaf: string): string[] {
  return readersOfTheCore()
    .filter((file) => names(readFileSync(file, 'utf8'), leaf))
    .map((file) =>
      relative(SRC, file).split(/[/\\]/).join('/').replace(/\.ts$/, ''),
    );
}

describe('every row of the tuning record has a reader', () => {
  it('is read by at least one shipped core module outside the record itself', () => {
    const unread = tuningRows(DEFAULT_TUNING)
      .map((row) => leafOf(row.name))
      .filter((leaf) => modulesReading(leaf).length === 0);
    expect(unread).toEqual([]);
  });

  it('counts a string literal as readily as a property, because the purse is named that way', () => {
    // The ruling this test carries: a section names its purse row as a string
    // and the grant indexes the record with it (stage.ts), so a walk that only
    // matched `.rowName` would call three live rows dead. Both spellings are
    // reachable, and the Procession's is the literal one.
    expect(modulesReading('processionPurse')).toContain('game/stage/stage');
    expect(modulesReading('bleedCapInKills')).toContain('game/grave');
  });

  it('counts a row named only in prose as unread, so a comment cannot answer for a reader', () => {
    // The wrongness it guards: a row mentioned in a JSDoc argument and read
    // nowhere would pass a raw text search while a candidate moving it changed
    // nothing at all, which is the exact failure the rule exists to name.
    expect(names('// takes the bleedCapInKills off the run\n', 'x')).toBe(
      false,
    );
    expect(
      names('// takes the bleedCapInKills off the run\n', 'bleedCapInKills'),
    ).toBe(false);
    expect(
      names('/** the bleedCapInKills */\nconst a = 1;', 'bleedCapInKills'),
    ).toBe(false);
    expect(
      names('const cap = t.score.bleedCapInKills;', 'bleedCapInKills'),
    ).toBe(true);
  });

  it('would call a row nobody reads dead, so the rule has teeth', () => {
    // A name no module in the core spells at all, which is what a row added to
    // the record with no reader behind it looks like from here.
    expect(modulesReading('aRowNothingInTheCoreReads')).toEqual([]);
  });
});
