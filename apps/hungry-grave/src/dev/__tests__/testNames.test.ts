/**
 * The test-name listing: what a capture names, and what moved between two of
 * them (#120).
 *
 * The seam is text in and names out, because the two things a step compares are
 * two files somebody captured, and one of them was captured months of work ago
 * on a machine nobody has any more.
 */

import { describe, expect, it } from 'vitest';

import { testNamesIn, testNamesMoved } from '../testNames';

const ROOT = '/somewhere/apps/hungry-grave';

/** vitest's own listing, which is a flat array of a file and a name. */
const listing = (...tests: readonly (readonly [string, string])[]): string =>
  JSON.stringify(
    tests.map(([file, name]) => ({ name, file: `${ROOT}/${file}` })),
    null,
    2,
  );

describe('the test-name listing', () => {
  it('names every test as its file and its name', () => {
    // The file is half of what identifies a test: two files may hold the same
    // sentence, and a comparison over bare names would call that one test.
    const text = listing(
      ['src/dev/__tests__/measure.test.ts', 'reads a sealed tape'],
      ['src/game/__tests__/swallow.test.ts', 'pays for what it ate'],
    );

    expect(testNamesIn(text, ROOT)).toEqual([
      'src/dev/__tests__/measure.test.ts :: reads a sealed tape',
      'src/game/__tests__/swallow.test.ts :: pays for what it ate',
    ]);
  });

  it('names them in one order, so two captures compare line for line', () => {
    // vitest lists in whatever order it walked the files, and two runs need
    // not walk them the same way, so the order is this module's and not its.
    const text = listing(
      ['b.test.ts', 'second'],
      ['a.test.ts', 'first'],
      ['b.test.ts', 'another'],
    );

    expect(testNamesIn(text, ROOT)).toEqual([
      'a.test.ts :: first',
      'b.test.ts :: another',
      'b.test.ts :: second',
    ]);
  });

  it('reads a capture that carries a build tool log before the listing', () => {
    // vitest shares stdout with whatever the config prints while it boots, and
    // the asset pipeline prints several lines there. One captured baseline was
    // edited by hand to make it parse, which is the kind of repair that leaves
    // a file only one machine ever had.
    const text = [
      '> Info: [AssetPack] cache found.',
      'Building: /somewhere/raw-assets [not json]',
      listing(['a.test.ts', 'first']),
    ].join('\n');

    expect(testNamesIn(text, ROOT)).toEqual(['a.test.ts :: first']);
  });

  it('reads a capture printed compact as readily as one printed wide', () => {
    // The baseline on disk is pretty-printed and the next capture need not be,
    // so the comparison must not rest on which shape vitest happened to print.
    const compact = JSON.stringify([
      { name: 'first', file: `${ROOT}/a.test.ts` },
    ]);

    expect(testNamesIn(compact, ROOT)).toEqual(['a.test.ts :: first']);
  });

  it('reads back a listing it printed itself', () => {
    // The printed form is the shape a step keeps beside the raw capture, so
    // either file answers the comparison and neither is the only copy.
    const text = 'b.test.ts :: second\na.test.ts :: first\n';

    expect(testNamesIn(text, ROOT)).toEqual([
      'a.test.ts :: first',
      'b.test.ts :: second',
    ]);
  });

  it('reads nothing out of text that is neither shape', () => {
    // A capture is an artifact, so it is refused rather than guessed at: a file
    // half read would compare the tests it managed to parse and call the rest
    // removed.
    expect(testNamesIn('no listing here', ROOT)).toBe(null);
    expect(testNamesIn('', ROOT)).toBe(null);
    expect(testNamesIn('[\n{ "name": 4 }\n]', ROOT)).toBe(null);
  });

  it('names what one listing added and what it lost against another', () => {
    const before = ['a :: kept', 'a :: gone'];
    const after = ['a :: kept', 'a :: new'];

    expect(testNamesMoved(before, after)).toEqual({
      added: ['a :: new'],
      removed: ['a :: gone'],
    });
  });

  it('reads a test that changed file as a loss and a gain, never a match', () => {
    // A test moved between files keeps its sentence and changes its home, and
    // the comparison exists to see exactly that: matching on the bare name
    // would let a whole file's worth of tests vanish and report nothing.
    expect(
      testNamesMoved(
        ['old.test.ts :: same words'],
        ['new.test.ts :: same words'],
      ),
    ).toEqual({
      added: ['new.test.ts :: same words'],
      removed: ['old.test.ts :: same words'],
    });
  });

  it('names nothing moved between one listing and itself', () => {
    const names = ['a :: one', 'b :: two'];

    expect(testNamesMoved(names, names)).toEqual({ added: [], removed: [] });
  });
});
