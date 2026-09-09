/**
 * The build identity the build shells stamp (#82): the string a tape header
 * records so a reading can say which build produced it, and the one thing the
 * commit hash beside it could never say, that the tree was dirty.
 */

import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import type { GitAnswers } from '../buildIdentity';
import { buildIdentityOf, gitAnswersIn, UNKNOWN_BUILD } from '../buildIdentity';

const made: string[] = [];

/**
 * A throwaway repository holding one commit, so a tree can be read on the same
 * commit more than once. It is a real repository and not a stub of one because
 * the thing under test is what git answers, and this session's own tree must
 * not be dirtied to ask it.
 */
const aRepoWithOneCommit = (): string => {
  const repo = mkdtempSync(join(tmpdir(), 'hungry-grave-identity-'));
  made.push(repo);
  const run = (command: string): void => {
    execSync(command, { cwd: repo, stdio: 'ignore' });
  };
  run('git init -q');
  run('git config user.email identity@example.invalid');
  run('git config user.name identity');
  writeFileSync(join(repo, 'rule.txt'), 'five skulls\n');
  run('git add rule.txt');
  run('git commit -q -m "one rule"');
  return repo;
};

const identityIn = (repo: string): string =>
  buildIdentityOf(undefined, gitAnswersIn(repo));

const writeRule = (repo: string, rule: string): void => {
  writeFileSync(join(repo, 'rule.txt'), rule);
};

afterAll(() => {
  for (const repo of made) rmSync(repo, { recursive: true, force: true });
});

describe('the build identity', () => {
  it('marks a dirty working tree apart from the same commit clean', () => {
    // The whole of #82: a tape recorded while a rule was uncommitted carried
    // the label of the commit before it, and no reader could tell the two
    // builds apart. The commit is the same in both readings here, so the mark
    // is the only thing that can separate them.
    const repo = aRepoWithOneCommit();

    const clean = identityIn(repo);
    writeRule(repo, 'one skull\n');
    const dirty = identityIn(repo);

    expect(clean).toMatch(/^[0-9a-f]{40}$/);
    expect(dirty).not.toBe(clean);
    expect(dirty.startsWith(`${clean}-dirty`)).toBe(true);
  });

  it('tells two dirty trees on one commit apart', () => {
    // A mark alone says a tree was dirty and cannot say which dirty tree, and
    // the two tapes this ticket is about were both recorded on one commit
    // under two different uncommitted rules. Without this they would carry one
    // identity and the divergence between them would still be unattributable.
    const repo = aRepoWithOneCommit();

    writeRule(repo, 'one skull\n');
    const oneRule = identityIn(repo);
    writeRule(repo, 'three skulls\n');
    const anotherRule = identityIn(repo);

    expect(oneRule).not.toBe(anotherRule);
  });

  it('reads the same tree the same way twice', () => {
    // An identity that moved on its own would put a build note on every
    // reading and mean nothing when it mattered.
    const repo = aRepoWithOneCommit();
    writeRule(repo, 'one skull\n');

    expect(identityIn(repo)).toBe(identityIn(repo));
  });

  it('takes the identity the CI environment names', () => {
    // Vercel builds from a checkout of the commit it names, so its sha is the
    // whole truth about that tree and git is never asked.
    const refuse = (): string => {
      throw new Error('git must not be asked when CI has named the build');
    };
    const unasked: GitAnswers = {
      describe: refuse,
      uncommittedState: refuse,
      uncommittedDigest: refuse,
    };

    expect(
      buildIdentityOf('9cba2781315b4b0bfe6d6e74d78a7ab57f527267', unasked),
    ).toBe('9cba2781315b4b0bfe6d6e74d78a7ab57f527267');
  });

  it('says unknown when git cannot answer', () => {
    // A tree with no git is an external failure the build shell can recover
    // from, and an invented identity would be worse than a named absence.
    const noGit: GitAnswers = {
      describe: () => {
        throw new Error('not a git repository');
      },
      uncommittedState: () => '',
      uncommittedDigest: () => '',
    };

    expect(buildIdentityOf(undefined, noGit)).toBe(UNKNOWN_BUILD);
    expect(
      buildIdentityOf('', {
        describe: () => 'from git',
        uncommittedState: () => '',
        uncommittedDigest: () => '',
      }),
    ).toBe('from git');
  });

  it('counts a file nobody has added yet as uncommitted work', () => {
    // A slice writes its new module before it stages it, so a rule can live in
    // an untracked file while every tracked file still matches the commit. A
    // reading of tracked files alone would call that tree clean and hand two
    // builds under two different rules one identity, which is the whole of #82.
    const repo = aRepoWithOneCommit();

    const clean = identityIn(repo);
    writeFileSync(join(repo, 'newRule.txt'), 'one skull\n');
    const withTheFile = identityIn(repo);
    writeFileSync(join(repo, 'newRule.txt'), 'three skulls\n');
    const withItRewritten = identityIn(repo);

    expect(withTheFile).not.toBe(clean);
    expect(withTheFile.startsWith(`${clean}-dirty`)).toBe(true);
    expect(withItRewritten).not.toBe(withTheFile);
  });
});
