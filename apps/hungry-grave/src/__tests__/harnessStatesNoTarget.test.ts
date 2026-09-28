/**
 * The deliberate-absence guard over the harness's report: nothing it produces
 * is a verdict.
 *
 * ADR 0053 rules that the harness compares and never judges, "this build
 * against that build, this configuration against that one, never this number
 * against a target". That is a thing the code does not do, and a thing code
 * does not do is guarded by a test rather than by a comment.
 *
 * It sits here rather than under src/dev because it reads the module's own
 * source, and a test under src/dev may import no package but vitest
 * (`boundary.test.ts`'s dev row and its TEST_PACKAGES list), node:fs included.
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = resolve(import.meta.dirname, '..');

// Every module that turns a run's readings into a figure somebody reads.
const MODULES = [
  'dev/batchReport.ts',
  'dev/compareBatches.ts',
  'dev/rankTest.ts',
];

/**
 * The source with its comments taken out, because a comment may say "under 40"
 * in prose and every scan below is about code.
 */
const codeOf = (module: string): string =>
  readFileSync(join(SRC, module), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');

/**
 * A reading ordered against a number written into the code, which is what a
 * target is. Bounds a reading is measured against, a tick inside a span's own
 * ends, are not targets and are not what this finds.
 */
const TARGET = /(\s(<|>|<=|>=)\s-?\d)|(\d\s(<|>|<=|>=)\s)/;

/**
 * A collection's size ordered against none or one: whether it is empty, or
 * holds a second value. That is a question about the shape of what was
 * collected, like the bounds above, and never a reading judged against a
 * number. Any other literal beside a size is still a target.
 */
const CARDINALITY =
  /(\.(size|length)\s(<|>|<=|>=)\s[01]\b)|(\b[01]\s(<|>|<=|>=)\s[\w.]+\.(size|length)\b)/g;

// Whether this code orders a reading against a number of its own.
const namesATarget = (code: string): boolean =>
  TARGET.test(code.replace(CARDINALITY, ''));

describe('the harness reports and never judges', () => {
  it('orders no reading against a number of its own', () => {
    // Guard 81. ADR 0053's comparisons-never-thresholds, as the one thing that
    // can carry a threshold: a literal on one side of an ordering.
    for (const module of MODULES) {
      expect(namesATarget(codeOf(module)), `${module} names a target`).toBe(
        false,
      );
    }

    // The scan has teeth, from either side of the operator.
    expect(namesATarget('if (spread.summary.max > 100) return;')).toBe(true);
    expect(namesATarget('const passed = 40 <= spread.count;')).toBe(true);
    // And a bound taken off the reading itself is not a target.
    expect(
      namesATarget('fires.filter((fire) => fire.tick >= span.from);'),
    ).toBe(false);
  });

  it('carries no verdict, because nothing it declares is a yes or a no', () => {
    // Guard 81. A verdict has to be carried by something, and what carries one
    // is a boolean: no field of a batch report is one, and no helper behind it
    // answers one, so there is nothing in the module for a pass or a fail to
    // live in.
    for (const module of MODULES) {
      expect(codeOf(module), `${module} answers a question`).not.toContain(
        'boolean',
      );
    }
  });

  it('prints no mean, so every figure it prints keeps its own tail', () => {
    // Guard 81. seriesSummary.ts keeps meanOf for the per-run readings that
    // already use it, and the batch report is the one reader that must not:
    // ADR 0053 asks for a distribution because the interesting runs are in a
    // tail, and a mean is the one figure that hides one.
    for (const module of MODULES) {
      expect(codeOf(module), `${module} takes a mean`).not.toContain('meanOf');
    }
  });
});

describe('what the target scan does not count', () => {
  it('a count of how many distinct values a batch holds is not a target, while a reading ordered against a number still is', () => {
    // Guard 81, and the false positive the field height met (#159): a batch
    // that refuses to pool two fields asks how many distinct heights it holds,
    // and "is there a second one" is a question about the batch's own shape,
    // not a reading judged against a target. Both spellings of it pass.
    expect(namesATarget('if (fieldHeights.size <= 1) return;')).toBe(false);
    expect(namesATarget('if (1 < heights.length) throw error;')).toBe(false);
    expect(namesATarget('const [, second] = heights;')).toBe(false);

    // Every target the scan already caught is still caught, and a reading
    // that happens to be a length is judged like any other reading.
    expect(namesATarget('if (spread.summary.max > 100) return;')).toBe(true);
    expect(namesATarget('const passed = 40 <= spread.count;')).toBe(true);
    expect(namesATarget('if (kills.length > 40) return;')).toBe(true);
    expect(namesATarget('if (fieldHeights.size <= 3) return;')).toBe(true);
  });
});
