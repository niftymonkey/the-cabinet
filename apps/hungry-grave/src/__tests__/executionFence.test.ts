/**
 * The fence that makes ADR 0017's one authority a mechanism rather than a
 * convention: nothing under src may import the step module except the authority
 * itself.
 *
 * src/__tests__/boundary.test.ts cannot express this. Its game row reads
 * mayReach: ["game"], which is prefix-matched and covers game/step by
 * construction, so the rule has to be an ESLint one and this is where it is
 * tested.
 *
 * The spellings are the test. A paths entry on the literal "./step" passes
 * three of them, which is how the first draft of this fence failed, and a scope
 * of src/game/** misses the two roots that actually broke it. The fifth
 * spelling carries the extension, because the extensionless glob does not match
 * "./step.js" and Vite resolves that one happily. This file sits in
 * src/__tests__ because no boundary governs it there, which is what lets it
 * import eslint.
 */

import { resolve } from 'node:path';
import { ESLint } from 'eslint';
import { beforeAll, describe, expect, it } from 'vitest';

const APP = resolve(import.meta.dirname, '..', '..');
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
  return `import { step } from '${specifier}';\n`;
}

/** One blocked spelling: exactly one fence message, and it names the authority. */
async function expectFenced(
  relativePath: string,
  specifier: string,
): Promise<void> {
  const messages = await fenceMessages(relativePath, importing(specifier));
  expect(messages, `${relativePath} importing ${specifier}`).toHaveLength(1);
  expect(messages[0]).toContain('executeTick');
}

describe('the step fence (ADR 0017)', () => {
  // The first lint resolves and loads the flat config, which pulls in
  // typescript-eslint and eslint-plugin-prettier and costs about a second.
  // Warming it here keeps that one-off out of every test's own budget, so a
  // spelling that fails does so on the fence rather than on the clock.
  beforeAll(async () => {
    await fenceMessages('src/game/warmup.ts', importing('./neighbour'));
  });

  it("blocks './step' from src/game/sim.ts", async () => {
    await expectFenced('src/game/sim.ts', './step');
  });

  it("blocks '../step' from src/game/lines/sim.ts", async () => {
    // A paths entry on the literal "./step" passes this one, which is why the
    // rule is a patterns entry: patterns matches the specifier as written.
    await expectFenced('src/game/lines/sim.ts', '../step');
  });

  it("blocks '../game/step' from src/app/sim.ts", async () => {
    // src/app is one of the two roots the raw calls were actually in, so a
    // src/game/** scope would miss it. The rule covers src/**.
    await expectFenced('src/app/sim.ts', '../game/step');
  });

  it("blocks '../game/step' from src/dev/sim.ts", async () => {
    // The other root outside src/game: boundary.test.ts separately permits
    // src/dev to reach game, so only this fence stops it reaching game/step.
    await expectFenced('src/dev/sim.ts', '../game/step');
  });

  it("blocks './step.js' from src/game/sim.ts", async () => {
    // "**/step" does not match "./step.js", which Vite resolves happily, so
    // the group has to name both spellings.
    await expectFenced('src/game/sim.ts', './step.js');
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
