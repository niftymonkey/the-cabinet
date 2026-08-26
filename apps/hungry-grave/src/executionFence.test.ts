/**
 * The fence that makes ADR 0017's one authority a mechanism rather than a
 * convention: nothing under src may import the step module except the authority
 * itself.
 *
 * src/boundary.test.ts cannot express this. Its game row reads
 * mayReach: ["game"], which is prefix-matched and covers game/step by
 * construction, so the rule has to be an ESLint one and this is where it is
 * tested.
 *
 * The spellings are the test. A paths entry on the literal "./step" passes
 * three of them, which is how the first draft of this fence failed, and a scope
 * of src/game/** misses the two roots that actually broke it. The fifth
 * spelling carries the extension, because the extensionless glob does not match
 * "./step.js" and Vite resolves that one happily. This file sits at the src
 * root because no boundary governs it, which is what lets it import eslint.
 */

import { resolve } from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const APP = resolve(import.meta.dirname, '..');
const RULE = 'no-restricted-imports';

const eslint = new ESLint({ cwd: APP });

/** The messages the step fence produced for one source string at one path. */
async function fenceMessages(
  relativePath: string,
  source: string,
): Promise<string[]> {
  const [result] = await eslint.lintText(source, {
    filePath: resolve(APP, relativePath),
  });
  return result.messages
    .filter((message) => message.ruleId === RULE)
    .map((message) => message.message);
}

/** One import declaration, formatted so prettier has nothing to say about it. */
function importing(specifier: string): string {
  return `import { step } from "${specifier}";\n`;
}

describe('the step fence (ADR 0017)', () => {
  it('blocks every spelling that reaches the step module', async () => {
    const spellings: [string, string][] = [
      ['src/game/sim.ts', './step'],
      ['src/game/lines/sim.ts', '../step'],
      ['src/app/sim.ts', '../game/step'],
      ['src/dev/sim.ts', '../game/step'],
      ['src/game/sim.ts', './step.js'],
    ];
    for (const [path, specifier] of spellings) {
      const messages = await fenceMessages(path, importing(specifier));
      expect(messages, `${path} importing ${specifier}`).toHaveLength(1);
      expect(messages[0]).toContain('executeTick');
    }
  });

  it('passes from the execution module alone', async () => {
    for (const specifier of ['./step', './step.js']) {
      const messages = await fenceMessages(
        'src/game/execution.ts',
        importing(specifier),
      );
      expect(messages, specifier).toEqual([]);
    }
  });

  it('leaves every other import alone, so the glob is a fence and not a net', async () => {
    for (const specifier of ['./stepper', './stage/stage', './lines/bell']) {
      const messages = await fenceMessages(
        'src/game/sim.ts',
        importing(specifier),
      );
      expect(messages, specifier).toEqual([]);
    }
  });
});
