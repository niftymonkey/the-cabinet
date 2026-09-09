# Step 4 progress note: the mow, the ladder, the director (ticket #39)

The plan is `apps/hungry-grave/docs/design/step-4-mow-ladder-director-dispatch.md`. One section per slice at the end, and the cross-slice facts first. Written by each slice's coder, appended to and never rewritten.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| 0, the baselines | none | No commit by design. Section 6 says what it produced and where. |
| A0, the build identity | `26a064a064` | `feat(hungry-grave): the tape carries a build identity that a dirty tree changes (#82)` |

## 2. GOLDEN moves

None so far. The plan permits five, in slices A, B, C, E and F, and a move anywhere else is a stop-and-report.

Slice A0: `GOLDEN` (`digest.ts:313`) did not move, and neither did `WITNESS_VERSION` (6), `FORMAT_VERSION` (3) or `READINGS_VERSION` (3). `git diff --stat` over `src/dev/digest.ts`, `src/game/witness.ts`, `src/tape/wireCodes.ts` and `src/dev/readingsVersion.ts` answered with nothing, so none of the four is inside the diff at all. Nothing this slice changed is folded: `buildIdentity` was already a header field (`tape.ts:114`), empty on every tape recorded so far, so what changed is the content of a slot the format already has. The playback result gained two fields the witness never sees, and the reader compares two opaque strings outside the fold.

## 3. CodeRabbit

Slice A0: `coderabbit review --agent --uncommitted` from the repo root over the staged work, twenty-one files reviewed, **one finding, major, applied**, then a clean re-review over the same twenty-one files with **no findings**.

- **Applied, major.** The identity called a tree clean when the only uncommitted work was untracked. `git describe --dirty` and `git diff HEAD` both answer for tracked files alone, so a slice that writes a new module and records a tape before staging it, which is exactly what this slice itself did, would stamp two builds under two different rules with one identity. That is the confusion #82 exists to end, so the fix went in rather than to a ticket. `--dirty` came off the describe, `git status --porcelain --untracked-files=all` became the one authority on whether anything is uncommitted, and the digest now folds three things: `git diff HEAD`, the untracked paths, and the contents behind them. The digest deliberately does not read the porcelain output, because staging a file changes what `--porcelain` prints without changing the build it describes, and an identity that moved on staging would put a build note on readings that deserve none. One test came with it, `counts a file nobody has added yet as uncommitted work`, which is the eleventh name in section 7's diff.

## 4. Plan claims found false against the tree

**1. Step 0a's "three format 3 tapes from Mark's Downloads folder" is two.** Verification step 4 of the slice, plan line 745, and the handoff's "three tapes from the current build verify". `/mnt/c/Users/markd/Downloads/` holds 31 tapes: eleven at format 1, eighteen at format 2, and two at format 3, `hungry-grave-1569855829-ad4657276e.tape` and `hungry-grave-242458454-ad4657276e.tape`, both recorded on `ad4657276e`. Read off the format word at byte 4 of each file, which is `HGTP` then the version as a little-endian uint16. Both were replayed and both verify with the build note; the plan's intent was followed over its count. Format 1 is a third refused shape the plan does not mention, refused for the same reason format 2 is.

**2. The A0 file table's identity recipe is superseded by the CodeRabbit finding.** Plan line 480 says the identity is "the Vercel sha, else `git describe --always --dirty --abbrev=40`, else unknown". The Vercel arm and the unknown arm stand. The git arm is now `git describe --always --abbrev=40` with a separate `git status --porcelain --untracked-files=all` deciding dirtiness, for the reason in section 3. The module boundary the plan set is untouched: the string is still produced only in the build shell and still parsed at the tape edge exactly once, and the core still compares two opaque strings.

## 5. Seams that moved

None against the plan. The four seams it named are the ones built: the header's build identity field encoded and decoded, `PlaybackResult`'s two new identity fields, `Measurement`'s `buildMismatch` on both the verified and the diverged arm, and the harness read-back's attribution line.

`GitAnswers` inside `scripts/buildIdentity.ts` went from two members to three under the CodeRabbit finding. It is a private seam of the build shell with one production caller and one test caller, not a seam the plan named.

## 6. The baselines

**The test-name baseline is `apps/hungry-grave/local/step4/tests-baseline.txt` beside its `.json` sibling**, 1834 names, captured before any of slice A0's tests existed. `local/` is gitignored, so neither file ever enters a commit.

The clean route worked on the first attempt. A scratch git worktree at `e9957eebfb` was added under the session scratchpad, the branch worktree's root and app `node_modules` were symlinked into it rather than installed, `pnpm vitest list --json` ran there, and the capture's absolute paths were rehomed from the scratch path to the branch worktree's path so a later comparison run from the branch reads the same printed names. The scratch worktree was removed with `git worktree remove` afterwards and `git worktree list` no longer names it. The rehoming is why the `.json` holds branch paths for a listing taken elsewhere; the `.txt` is path-relative and carries no trace of it.

**The two tip tapes the plan's step 0 asks for were skipped, deliberately.** Step 0a changes the header those tapes would carry, so a tape recorded at the tip minutes before A0 lands would be a baseline of the shape the very next commit replaces. The evidence step 0 exists to preserve is the divergence note, and that is already on disk: `docs/push/divergence-b1c3a584d1.md`, present and written at this tip on 2026-09-09. The dead-baseline evidence section 8 of the record names is the step 3 batch report, which is untouched.

## 7. Verification steps run

All four of slice A0's steps carry the agent as their actor, and all four ran. No step of this slice has the human as its actor.

**Step 1, the standing checks.** `pnpm typecheck` and `pnpm vitest run` green in `apps/hungry-grave/`, then `pnpm verify` green from the worktree root, exit 0: 139 test files, 1835 passed, 10 expected fail, 2 todo. The 1834 that were passing before the slice plus A0's ten new names plus the CodeRabbit finding's one, minus nothing.

**The test-name diff (plan verification step 5).** Against the section 6 baseline: `1834 names in the baseline, 1845 now: 11 added, 0 removed`. Nothing was renamed and nothing was lost. The eleven added:

```
+ scripts/__tests__/buildIdentity.test.ts :: the build identity > counts a file nobody has added yet as uncommitted work
+ scripts/__tests__/buildIdentity.test.ts :: the build identity > marks a dirty working tree apart from the same commit clean
+ scripts/__tests__/buildIdentity.test.ts :: the build identity > reads the same tree the same way twice
+ scripts/__tests__/buildIdentity.test.ts :: the build identity > says unknown when git cannot answer
+ scripts/__tests__/buildIdentity.test.ts :: the build identity > takes the identity the CI environment names
+ scripts/__tests__/buildIdentity.test.ts :: the build identity > tells two dirty trees on one commit apart
+ src/dev/__tests__/measure.test.ts :: the build behind a reading > attributes a divergence to the build mismatch, naming both identities
+ src/dev/__tests__/measure.test.ts :: the build behind a reading > reports a plain divergence when the tape and the reader are one build
+ src/dev/__tests__/measure.test.ts :: the build behind a reading > reports a verified reading with a build note when the builds differ
+ src/dev/__tests__/measure.test.ts :: the build behind a reading > verifies a tape that carries no build identity at all
+ src/tape/__tests__/playback.test.ts :: the build identity on a playback > carries the tape build identity beside the reader own
```

**Step 2, a tape recorded and replayed on one build.** Recorded with `record-conditioned.ts` at seed 424242 for 600 ticks with every line at 1, then measured. Matching identities, no mismatch, verified:

```
{
  "outcome": "verified",
  "identity": {
    "commitHash": "e9957eebfbc513a8dbbeaadb7250a2d81946ac01",
    "buildIdentity": "e9957eebfbc513a8dbbeaadb7250a2d81946ac01-dirty-9340ae1554"
  },
  "buildMismatch": null,
```

**Step 3, a tape recorded under a throwaway rule and replayed without it.** `mobs.ts:76` went from `hp: 40` to `hp: 41`, a second tape was recorded at the same seed, the row was put back, and `git diff HEAD --stat` over `src/game/mobs.ts` answered with nothing, so no trace of the change reached the commit. Replayed on the tree without it, the divergence is attributed to the build mismatch and both identities are named. The commit is the same on both sides and the digest is the only thing that separates them, which is the whole of #82:

```
{
  "outcome": "diverged",
  "firstDivergentCheckpoint": 180,
  "checkpointsVerified": 3,
  "ticksReproduced": 180,
  "buildMismatch": {
    "recorded": "e9957eebfbc513a8dbbeaadb7250a2d81946ac01-dirty-11c065105a",
    "running": "e9957eebfbc513a8dbbeaadb7250a2d81946ac01-dirty-9340ae1554"
  }
}
```

**Step 4, Mark's own tapes.** All 31 were copied to the session scratchpad and none was written back. Both format 3 tapes still verify, each with the build note an empty recorded identity earns. `hungry-grave-1569855829-ad4657276e.tape`, 23731 ticks, victory, 396 checkpoints verified:

```
{
  "outcome": "verified",
  "identity": {
    "commitHash": "ad4657276e69fee6514eca65b127be96df8d3c64",
    "buildIdentity": ""
  },
  "buildMismatch": {
    "recorded": "",
    "running": "e9957eebfbc513a8dbbeaadb7250a2d81946ac01-dirty-9340ae1554"
  },
```

`hungry-grave-242458454-ad4657276e.tape`, 24371 ticks, victory, 407 checkpoints verified, the same identity pair. A format 2 tape is refused at the decode, before any replay, which is expected and unchanged by this slice:

```
hungry-grave-1445730872-b1c3a584d1.tape is not a tape (this tape is format version 2 and this reader is version 3); no measurement was taken
```

The refusal arrives before playback, so no build note rides with it. That is right: a tape the reader cannot decode has no reading to annotate.

## 8. Slice A0: the tape carries a build identity that a dirty tree changes (#82)

Commit `26a064a064`, twenty-one files, ten planned tests plus one from the review.

**The planned test list, all five present and green.** A tape whose recorded identity differs and whose witness diverges reports a build-mismatch attribution naming both; a matching identity with a diverging witness reports a plain divergence; a differing identity that verifies reports verified with a build note; the encoder marks a dirty tree; a tape carrying no identity at all still decodes and still verifies. Nothing was added beyond the review's one.

**Two defects were fixed before the review, both found by reading the diff.**

- `src/tape/buildIdentity.ts` exported `UNSTAMPED_BUILD` with no caller anywhere, while `attribution()` in `scripts/batch.ts` hand-rolled `mismatch.recorded || 'no build identity'`, which is the case the constant exists for. The cited-future rule forbids an export with no caller today, so the constant took its caller: the batch's attribution now names the empty identity by comparing against it rather than by leaning on a falsy string.
- `src/app/tapeHeader.ts` carried two consecutive JSDoc blocks on `tapeHeaderFor`, of which only the last would attach. They are one block now, with the pre-existing content kept and the build identity paragraph added to its end.

**One minor thing, also pre-review.** The `buildIdentity` import in `src/dev/__tests__/measure.test.ts` sat below the `tape/tape` imports rather than in path order; it now sits where `src/tape/__tests__/playback.test.ts` puts its own.

**The module boundary held.** The identity is produced in the build shell (`scripts/buildIdentity.ts`, from `VERCEL_GIT_COMMIT_SHA` when CI names one, else git, else `unknown`), compiled into both bundles as `BUILD_IDENTITY` by `vite.config.ts` and `vite.headless.config.ts`, and read exactly once at the tape edge (`src/tape/buildIdentity.ts`). The core replay compares two opaque strings and knows nothing about git. No new dependency.

**`tsconfig.json`'s `include` gained `vite.headless.config.ts`**, because that config now imports a module and stopped being a file nothing typechecks.
