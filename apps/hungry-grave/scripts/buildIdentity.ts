// The identity of the build a bundle was made from, which every tape header
// records (#82).

import { execSync } from 'node:child_process';

/**
 * What the identity says when neither the CI environment nor git can name the
 * build. A tree with neither says so rather than inventing one, on the same
 * terms as the commit hash beside it (ADR 0018).
 */
const UNKNOWN_BUILD = 'unknown';

/**
 * The commit a tree stands on, and nothing about the tree itself.
 *
 * `--dirty` is deliberately absent: it answers only for tracked files, so a
 * tree carrying an uncommitted new module would describe itself as clean. The
 * state below is the one authority on whether anything is uncommitted.
 *
 * `--abbrev=40` rather than the default width so a local build and a Vercel
 * build of the same clean commit carry the same string, since the sha is what
 * Vercel supplies. The repo carries no tags, so `--always` returns the commit
 * itself.
 */
const DESCRIBE_COMMAND = 'git describe --always --abbrev=40';

/**
 * Whether the tree holds anything the commit does not, which is empty output
 * exactly when it holds nothing.
 *
 * `--untracked-files=all` so a file nobody has added yet counts: a slice writes
 * its new module before it stages it, and a rule living in that module is as
 * uncommitted as an edit to a tracked one.
 */
const UNCOMMITTED_STATE_COMMAND =
  'git status --porcelain --untracked-files=all';

// Every tracked change, staged or not, against the commit.
const TRACKED_DIFF = 'git diff HEAD';

// The untracked files a tree carries, first by path and then by content.
const UNTRACKED_PATHS = 'git ls-files --others --exclude-standard';
const UNTRACKED_CONTENTS = `${UNTRACKED_PATHS} | git hash-object --stdin-paths`;

/**
 * The uncommitted work itself, as one sha git computes.
 *
 * The three parts are what it takes to tell two dirty trees apart: an edit to a
 * tracked file, an untracked file appearing or moving, and an untracked file's
 * contents changing under a path that did not move. The state above is read
 * instead of the staging column here, because staging a file changes what
 * `--porcelain` prints without changing the build it describes.
 *
 * It is a pipe rather than a read so the diff never crosses this process: a
 * tree carrying a large uncommitted change would otherwise have to fit in a
 * buffer to be identified at all.
 */
const UNCOMMITTED_DIGEST_COMMAND = `{ ${TRACKED_DIFF}; ${UNTRACKED_PATHS}; ${UNTRACKED_CONTENTS}; } | git hash-object --stdin`;

/**
 * Where the repository holding a directory begins.
 *
 * Every command above runs there rather than wherever the process was started,
 * because two of them answer for the current directory alone: `git ls-files
 * --others` lists only the folder it runs in and prints its paths relative to
 * that folder, while `git hash-object --stdin-paths` reads the paths it is
 * handed against the repository root. Anywhere but the top level the two
 * disagree, the mismatch is stderr inside a pipe whose exit status is the last
 * command's, and every untracked file's contents fall out of the digest in
 * silence. Every headless script and every vite config in this app runs with
 * its cwd at `apps/hungry-grave` (#82).
 */
const TOP_LEVEL_COMMAND = 'git rev-parse --show-toplevel';

// What a described tree is suffixed with when it holds uncommitted work.
const DIRTY_MARKER = '-dirty';

// Enough of the digest to separate two trees, and short enough to read in a header.
const DIGEST_LENGTH = 10;

/** What git can be asked about the tree a build is being made from. */
interface GitAnswers {
  readonly describe: () => string;
  readonly uncommittedState: () => string;
  readonly uncommittedDigest: () => string;
}

/**
 * The identity of a described tree, with its uncommitted work folded in when
 * there is any.
 *
 * A marker alone says that a tree was dirty and cannot say which dirty tree, so
 * on its own two builds of one commit under two different uncommitted rules
 * carry one identity. That is the confusion #82 exists to end
 * (`docs/push/divergence-b1c3a584d1.md`), so a digest rides behind the marker
 * and separates them.
 */
const identityOfTree = (described: string, git: GitAnswers): string =>
  git.uncommittedState() === ''
    ? described
    : `${described}${DIRTY_MARKER}-${git.uncommittedDigest().slice(0, DIGEST_LENGTH)}`;

/**
 * The identity, from the CI environment when there is one and from git
 * otherwise.
 *
 * A CI value needs no marker and no digest: Vercel builds from a checkout of
 * the commit it names, so the sha is the whole truth about that tree.
 */
const buildIdentityOf = (
  fromCi: string | undefined,
  git: GitAnswers,
): string => {
  if (fromCi !== undefined && fromCi !== '') return fromCi;
  try {
    return identityOfTree(git.describe(), git);
  } catch {
    return UNKNOWN_BUILD;
  }
};

const askIn = (directory: string, command: string): string =>
  execSync(command, { cwd: directory, encoding: 'utf8' }).trim();

/**
 * What git says about the tree a directory sits in.
 *
 * The top level is looked up inside each answer rather than once here, so a
 * directory git cannot answer for at all fails where the identity is being
 * taken and becomes the unknown build, instead of throwing at construction
 * where nothing is watching.
 */
const gitAnswersIn = (directory: string): GitAnswers => {
  const askAtTheTopLevel = (command: string): string => {
    const topLevel = askIn(directory, TOP_LEVEL_COMMAND);
    return askIn(topLevel, command);
  };
  return {
    describe: () => askAtTheTopLevel(DESCRIBE_COMMAND),
    uncommittedState: () => askAtTheTopLevel(UNCOMMITTED_STATE_COMMAND),
    uncommittedDigest: () => askAtTheTopLevel(UNCOMMITTED_DIGEST_COMMAND),
  };
};

/** The identity of the tree this build is being made from. */
const buildIdentityHere = (): string =>
  buildIdentityOf(
    process.env.VERCEL_GIT_COMMIT_SHA,
    gitAnswersIn(process.cwd()),
  );

export { buildIdentityHere, buildIdentityOf, gitAnswersIn, UNKNOWN_BUILD };
export type { GitAnswers };
