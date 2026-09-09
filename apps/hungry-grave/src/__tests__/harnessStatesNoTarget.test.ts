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
const MODULES = ['dev/batchReport.ts', 'dev/compareBatches.ts'];

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

describe('the harness reports and never judges', () => {
  it('orders no reading against a number of its own', () => {
    // Guard 81. ADR 0053's comparisons-never-thresholds, as the one thing that
    // can carry a threshold: a literal on one side of an ordering.
    for (const module of MODULES) {
      expect(TARGET.test(codeOf(module)), `${module} names a target`).toBe(
        false,
      );
    }

    // The scan has teeth, from either side of the operator.
    expect(TARGET.test('if (spread.summary.max > 100) return;')).toBe(true);
    expect(TARGET.test('const passed = 40 <= spread.count;')).toBe(true);
    // And a bound taken off the reading itself is not a target.
    expect(TARGET.test('fires.filter((fire) => fire.tick >= span.from);')).toBe(
      false,
    );
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
