// Which build recorded a tape, which build is reading it, and what it means
// when the two are not the same (#82).

/**
 * The identity of the build running this code, stamped into the bundle by the
 * build shell and read here exactly once.
 *
 * The shell is the only thing that can know it, because the identity is a fact
 * about a working tree at build time and nothing at run time can see one. What
 * reaches this side is an opaque string, and everything below compares it as
 * one: no reader of a tape knows anything about git.
 */
const RUNNING_BUILD: string = BUILD_IDENTITY;

/**
 * What a tape's identity says when the build that recorded it stamped none,
 * which is every tape recorded before this field was filled.
 *
 * It is an absence and not a build, so it can never match a running build. A
 * reading off such a tape says so and still reports what the tape holds.
 */
const UNSTAMPED_BUILD = '';

/**
 * The two builds behind a reading, named together because neither is readable
 * alone.
 *
 * On a divergence it is the attribution: two builds that disagree about the
 * rules will disagree about the fold, and a tape whose recording build cannot
 * be named was what turned one such divergence into a day of work
 * (`docs/push/divergence-b1c3a584d1.md`). On a verified reading it is a note:
 * the replay reproduced the run, and the reader is told anyway which build's
 * numbers these are.
 */
interface BuildMismatch {
  // What the tape's header carries, empty when its recording build stamped none.
  readonly recorded: string;
  // The build that did the reading.
  readonly running: string;
}

/**
 * The mismatch between a tape's build and the reader's, or null when they are
 * one build.
 *
 * It is never a refusal. The witness version is the rules identity (ADR 0019),
 * and a build that folds the same way must keep replaying a player's tape,
 * because replay is a shipped feature (ADR 0020).
 */
const buildMismatchOf = (
  recorded: string,
  running: string,
): BuildMismatch | null =>
  recorded === running ? null : { recorded, running };

export { buildMismatchOf, RUNNING_BUILD, UNSTAMPED_BUILD };
export type { BuildMismatch };
