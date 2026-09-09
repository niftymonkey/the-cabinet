// The tests a vitest listing names, and what moved between two listings (#120).

// What stands between a test's file and its own name in a printed listing.
const SEPARATOR = ' :: ';

/** What moved between two listings, each name in the printed form. */
interface TestNameChanges {
  readonly added: readonly string[];
  readonly removed: readonly string[];
}

// One entry of vitest's own --json listing, which is all of it this reads.
interface ListedTest {
  readonly file: string;
  readonly name: string;
}

const isListedTest = (value: unknown): value is ListedTest =>
  typeof value === 'object' &&
  value !== null &&
  'file' in value &&
  typeof value.file === 'string' &&
  'name' in value &&
  typeof value.name === 'string';

// The array this text parses as from this line on, or null when it does not.
const arrayFrom = (
  lines: readonly string[],
  first: number,
): unknown[] | null => {
  try {
    const parsed: unknown = JSON.parse(lines.slice(first).join('\n'));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * The JSON array a capture holds, or null when it holds none.
 *
 * vitest shares stdout with whatever the config prints while it boots, so a
 * capture routinely carries an asset pipeline's log lines above the array.
 * Every line that opens a bracket is tried in turn, because the array is
 * pretty-printed on one machine and compact on another, and a log line may
 * open a bracket of its own without being the listing.
 */
const listingArrayIn = (text: string): unknown[] | null => {
  const lines = text.split('\n');
  for (let first = 0; first < lines.length; first++) {
    if (!lines[first].trimStart().startsWith('[')) continue;
    const array = arrayFrom(lines, first);
    if (array !== null) return array;
  }
  return null;
};

/**
 * The names a listing this module printed holds, or null when the text is not
 * one.
 *
 * Every line carries the separator or the text is something else: a file half
 * read would compare the lines it understood and call every other test
 * removed, which is the one wrong answer this comparison must never give.
 */
const printedNamesIn = (text: string): readonly string[] | null => {
  const lines = text.split('\n').filter((line) => line.trim() !== '');
  if (lines.length === 0) return null;
  if (!lines.every((line) => line.includes(SEPARATOR))) return null;
  return lines;
};

// The file as the folder vitest ran in sees it, so two machines print one name.
const pathUnder = (root: string, file: string): string =>
  file.startsWith(`${root}/`) ? file.slice(root.length + 1) : file;

/**
 * The tests a capture names, sorted, or null when the text is neither shape.
 *
 * The two shapes are vitest's own `--json` array and a listing printed from
 * one, so a comparison runs off whichever capture survived and a projection
 * nobody kept is made again rather than missed.
 */
const testNamesIn = (text: string, root: string): readonly string[] | null => {
  const listed = listingArrayIn(text);
  if (listed === null) {
    const printed = printedNamesIn(text);
    return printed === null ? null : [...printed].sort();
  }
  if (!listed.every(isListedTest)) return null;
  const names = listed.map(
    (test) => `${pathUnder(root, test.file)}${SEPARATOR}${test.name}`,
  );
  return names.sort();
};

/**
 * What moved between two listings: what the second holds and the first did
 * not, and what the first held and the second does not.
 *
 * A test that changed file is a loss and a gain rather than a match, because
 * the file is half of what identifies it: matching on the sentence alone would
 * let a whole file's tests move away and report nothing.
 */
const testNamesMoved = (
  before: readonly string[],
  after: readonly string[],
): TestNameChanges => {
  const held = new Set(before);
  const now = new Set(after);
  return {
    added: after.filter((name) => !held.has(name)),
    removed: before.filter((name) => !now.has(name)),
  };
};

export { testNamesIn, testNamesMoved };
export type { TestNameChanges };
