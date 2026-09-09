/**
 * The test-name comparison: two captured `vitest list --json` listings in, what
 * the tree gained and what it lost out, and a non-zero exit the moment anything
 * was lost (#120).
 *
 * It exists because the comparison used to be a hand diff against one projected
 * file, and a projection is a file only the machine that made it ever had. The
 * reading lives in src/dev/testNames.ts, which may not touch node:fs; this
 * shell reads the two files, prints, and says why when one will not do.
 *
 * Capture the current side with
 * `pnpm vitest list --json > current.json`, from this folder. The capture may
 * carry the asset pipeline's log lines above the array and is read anyway, so
 * nobody has to edit one by hand again.
 */

import { readFileSync } from 'node:fs';

import { testNamesIn, testNamesMoved } from '../src/dev/testNames';

const USAGE = `usage: pnpm vite-node --config vite.headless.config.ts scripts/test-names.ts <baseline> <current>
  each file is a \`pnpm vitest list --json\` capture, or a listing this command printed
  capture the current side with: pnpm vitest list --json > current.json`;

/**
 * A flawed argument is an external failure and the person holding the command
 * line is the nearest owner who can act, so they get the reason and the cost
 * rather than a stack, plus the usage the flaw sat in.
 */
const refuse = (reason: string): null => {
  console.error(`${reason}; nothing was compared`);
  console.error(USAGE);
  return null;
};

/**
 * The names one file holds, or null once the file has been refused out loud.
 *
 * A path the filesystem will not read and a file that is not a listing are the
 * same external failure wearing two coats, and both leave the batch of one
 * comparison unmade rather than half made.
 */
const namesIn = (path: string): readonly string[] | null => {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch (error) {
    if (!(error instanceof Error) || !('errno' in error)) throw error;
    return refuse(`${path} could not be read (${error.message})`);
  }
  const names = testNamesIn(text, process.cwd());
  if (names === null) {
    return refuse(
      `${path} is not a test-name listing (a vitest list --json capture, or a listing this command printed)`,
    );
  }
  return names;
};

// What moved, one name per line, so a reader sees the names and not a tally.
const sayWhatMoved = (
  baseline: readonly string[],
  current: readonly string[],
): number => {
  const moved = testNamesMoved(baseline, current);
  console.log(
    `${baseline.length} names in the baseline, ${current.length} now: ${moved.added.length} added, ${moved.removed.length} removed`,
  );
  for (const name of moved.added) console.log(`+ ${name}`);
  for (const name of moved.removed) console.log(`- ${name}`);
  return moved.removed.length;
};

const main = (): void => {
  const [baselinePath, currentPath] = process.argv.slice(2);
  if (baselinePath === undefined || currentPath === undefined) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const baseline = namesIn(baselinePath);
  if (baseline === null) {
    process.exitCode = 1;
    return;
  }
  const current = namesIn(currentPath);
  if (current === null) {
    process.exitCode = 1;
    return;
  }
  // A removal is the one outcome this command exists to catch, so it leaves by
  // the door a script watching the command reads.
  if (sayWhatMoved(baseline, current) > 0) process.exitCode = 1;
};

main();
