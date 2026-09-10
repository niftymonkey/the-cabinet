# Step 4 progress note: the mow, the ladder, the director (ticket #39)

The plan is `apps/hungry-grave/docs/design/step-4-mow-ladder-director-dispatch.md`. One section per slice at the end, and the cross-slice facts first. Written by each slice's coder, appended to and never rewritten.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| 0, the baselines | none | No commit by design. Section 6 says what it produced and where. |
| A0, the build identity | `26a064a064` | `feat(hungry-grave): the tape carries a build identity that a dirty tree changes (#82)` |
| 1, round 0, the frame budget | `c23be6156c` | `feat(hungry-grave): the frame budget has a reproducible instrument (#39)` |
| 1, the refusal | `3594fe154a` | `feat(hungry-grave): the frame budget refuses pools that cannot stand its table (#39)` |
| A0 follow-up, the cwd fix | `136a349aeb` | `fix(hungry-grave): the build identity reads untracked files from any cwd (#82)` |
| A, the mob table and fire | `d4dedf6d9a` | `feat(hungry-grave): the mow body never fires and dies to one skull (#39)` |

## 2. GOLDEN moves

One so far, slice A's. The plan permits five, in slices A, B, C, E and F, and a move anywhere else is a stop-and-report.

Slice A0: `GOLDEN` (`digest.ts:313`) did not move, and neither did `WITNESS_VERSION` (6), `FORMAT_VERSION` (3) or `READINGS_VERSION` (3). `git diff --stat` over `src/dev/digest.ts`, `src/game/witness.ts`, `src/tape/wireCodes.ts` and `src/dev/readingsVersion.ts` answered with nothing, so none of the four is inside the diff at all. Nothing this slice changed is folded: `buildIdentity` was already a header field (`tape.ts:114`), empty on every tape recorded so far, so what changed is the content of a slot the format already has. The playback result gained two fields the witness never sees, and the reader compares two opaque strings outside the fold.

**Slice A: `GOLDEN` re-pinned, which is the first of the five the plan permits.** `WITNESS_VERSION` is still 6, `FORMAT_VERSION` 3 and `READINGS_VERSION` 3, and none of `src/game/witness.ts`, `src/tape/wireCodes.ts` or `src/dev/readingsVersion.ts` is in the commit at all.

Three fields moved and the dated paragraph in `digest.ts`'s JSDoc names them:

| Field | Was | Now |
| --- | --- | --- |
| `checksum` | -36124581 | -279620599 |
| `shots` | 2 | 0 |
| `drawn.mobFire` | 1 | 0 |

The checksum moved because the witness folds every live mob's health and every live shot, and the scenario holds five live shamblers at tick 600 whose health went 40 to 8. The other two are the silence rather than the health: the scripted File's armed shambler was the only thing in the scenario that fired, and its first-shot jitter was the only draw the mobFire stream took there. Everything else held, the two scripted kills included: `mobs` 5, `corpses` 1, `skulls` 2, the grave's position and size, the reservoir, and every other stream cursor. The Procession's teaching Drip moved in the same commit and does not reach this window at all, because it stands at t=11 and the scenario is 600 ticks.

Slice 1: none of the four moved. `git diff --stat` from `0b5574fd63` to `c23be6156c` over `src/dev/digest.ts`, `src/game/witness.ts`, `src/tape/wireCodes.ts` and `src/dev/readingsVersion.ts` answered with nothing, so none of them is in the diff at all. `WITNESS_VERSION` is 6, `FORMAT_VERSION` 3, `READINGS_VERSION` 3. Nothing this slice touches is folded: the instrument stands a field, times it and prints, and it changes no rule the witness watches.

## 3. CodeRabbit

Slice A0: `coderabbit review --agent --uncommitted` from the repo root over the staged work, twenty-one files reviewed, **one finding, major, applied**, then a clean re-review over the same twenty-one files with **no findings**.

- **Applied, major.** The identity called a tree clean when the only uncommitted work was untracked. `git describe --dirty` and `git diff HEAD` both answer for tracked files alone, so a slice that writes a new module and records a tape before staging it, which is exactly what this slice itself did, would stamp two builds under two different rules with one identity. That is the confusion #82 exists to end, so the fix went in rather than to a ticket. `--dirty` came off the describe, `git status --porcelain --untracked-files=all` became the one authority on whether anything is uncommitted, and the digest now folds three things: `git diff HEAD`, the untracked paths, and the contents behind them. The digest deliberately does not read the porcelain output, because staging a file changes what `--porcelain` prints without changing the build it describes, and an identity that moved on staging would put a build note on readings that deserve none. One test came with it, `counts a file nobody has added yet as uncommitted work`, which is the eleventh name in section 7's diff.

Slice 1's second commit, `3594fe154a`: one file reviewed, **no findings**.

Slice 1: `coderabbit review --agent --uncommitted` from the repo root over the staged work, twelve files reviewed. **Two findings, both major, one applied.** Then a re-review over the same twelve files with **one minor finding, declined**.

- **Applied, major.** The field builder only filled shortages and never trimmed a surplus, so it held the field from one direction. A driven run does not only lose entities: the stage spawns bodies of its own and a kill drops food, so in a build whose pools are larger than the field being measured, the field drifts upward from the first tick. That is exactly the browser half, where the caps are the shipped ones and the smallest field is four mobs in a pool of a hundred and sixty. It is now held from both directions, last slot first so the trim is the same on every run, and a test starts both pools above the size and asserts the sizes come back. The browser's own numbers moved on the fix: 30 / 60 render CPU read 1.14 ms before it and 0.83 ms after.
- **Declined, major.** That the render span should start after `FieldRenderer.sync` rather than before it. The record's render CPU column is the whole render half of a frame, and its own sentence names the split inside that half rather than excluding one side of it: "at 200 mobs and 500 corpses, sync costs 0.47 ms against 2.25 ms for the Pixi pass" (`mow-ladder-director.md` section 4). A column that excluded sync would not be the column the record reads in. There is no unmeasured gap either way: the same reading ends the sim span and begins the render one.
- **Declined, minor.** A guard rejecting negative, fractional or non-finite field sizes. The only producer of a `FieldSize` is `ROUND_ZERO_FIELDS`, a literal in `src/dev/frameBudget.ts`, so the value's origin is our own code, which `code-core.md` says is never repaired because a bad one is a bug. A guard against a value no caller can produce is also generality for an absent caller, which the cited-future rule forbids.

**Slice A:** `coderabbit review --agent --uncommitted` from the worktree root over the staged work, twenty-two files reviewed. **Two findings, both major, both declined, and neither is against this slice's work.** Nineteen of the twenty-two are this slice's and drew nothing at all; the other three are another agent's uncommitted standing-row documents, which the review picked up because they sit in the same working tree.

- **Declined, major, not this slice's file.** `step-4-mow-ladder-director-dispatch.md:47` still attributes the signal lock to ADR 0056's own trigger while the signal-lock paragraph now says that amendment is unfired. A real contradiction, in the plan document the standing-row work is currently rewriting.
- **Declined, major, not this slice's file.** `mow-ladder-director.md:435`'s Standing row glossary entry describes a separate ramping-row schema where ADR 0060 now rules ordinary `StageRow` entries with repeat fields. Also the standing-row work's, and `CONTEXT.md`'s Standing row entry is slice B's to write.

## 4. Plan claims found false against the tree

**1. Step 0a's "three format 3 tapes from Mark's Downloads folder" is two.** Verification step 4 of the slice, plan line 745, and the handoff's "three tapes from the current build verify". `/mnt/c/Users/markd/Downloads/` holds 31 tapes: eleven at format 1, eighteen at format 2, and two at format 3, `hungry-grave-1569855829-ad4657276e.tape` and `hungry-grave-242458454-ad4657276e.tape`, both recorded on `ad4657276e`. Read off the format word at byte 4 of each file, which is `HGTP` then the version as a little-endian uint16. Both were replayed and both verify with the build note; the plan's intent was followed over its count. Format 1 is a third refused shape the plan does not mention, refused for the same reason format 2 is.

**2. The A0 file table's identity recipe is superseded by the CodeRabbit finding.** Plan line 480 says the identity is "the Vercel sha, else `git describe --always --dirty --abbrev=40`, else unknown". The Vercel arm and the unknown arm stand. The git arm is now `git describe --always --abbrev=40` with a separate `git status --porcelain --untracked-files=all` deciding dirtiness, for the reason in section 3. The module boundary the plan set is untouched: the string is still produced only in the build shell and still parsed at the tape edge exactly once, and the core still compares two opaque strings.

**3. The shipped caps refuse half of round 0's own table, and one of the two the plan puts in its headline.** `MOB_CAP` is 160 and `CORPSE_CAP` is 233 (measured; it is derived, not written down). A pool is built at its cap, so a build carrying the shipped caps cannot stand 100 / 250, 200 / 500 or 400 / 1000 at all. The plan's step 1 line and the record's section 4 both name "a synthetic field of 100 mobs and 250 corpses" as the thing round 0 measures, and no shipped build can stand it. This is why the record's method needs its Vite alias, and it is a fact about the caps rather than a gap in the instrument: item 7 of the record derives the caps from the content, and until that lands, what the phone can be asked to draw is capped at 160 / 233. The step 4 peak the record names, 80 / 200, does fit, so the row that decides item 3 and item 7 is measurable on the phone today.

**4. The record's method sentence does not say the field is held, and a field that is not held is not what gets measured.** "A synthetic field drove the real step" reads as standing the field once. Measured: with the field stood once and six hundred warm-up ticks driven before the stopwatch, 400 / 1000 read 0.11 ms mean, cheaper than a held 30 / 60, because the scroll had carried the bodies off the bottom edge and freshness had emptied every corpse ten seconds in. The instrument stands the field before every tick, and the per-row caps are the other half of holding it: a pool sized to the field is what stops the run's own spawns and kills from standing more than the measurement asked for. That reading also makes sense of the record's own "pools sized per row", which would otherwise only be a way to reach the large rows.

**5. `scripts/buildIdentity.ts` drops untracked file contents whenever it runs from `apps/hungry-grave/`, which is where every headless script runs.** Not this slice's module and not fixed here. `git ls-files --others --exclude-standard | git hash-object --stdin-paths` prints `fatal: could not open 'scripts/frame-budget.ts' for reading` from the app directory and succeeds from the repo root: `ls-files` prints paths relative to the current directory and `hash-object --stdin-paths` resolves them against the repo root. The pipeline's exit status is the last command's, which succeeds, so the failure is stderr noise and the digest is taken over the tracked diff and the untracked *paths* only. Two dirty trees differing only in an untracked file's contents therefore carry one identity from any headless run, which is the confusion #82 exists to end. `git ls-files --others --exclude-standard --full-name` was tried from the app directory and gives the repo-root run's own three hashes; it also widens the listing from the app folder to the whole repo, which is a choice rather than a typo fix, so the call is left to whoever owns #82.

**6. Slice A's module boundary is wrong about its own blast radius, and this is the largest false claim in the plan so far.** The plan's module table gives slice A five files (`mobs.ts`, `touchCounts.test.ts`, the Procession row in `rows.ts`, `digest.ts`, `CONTEXT.md`) and section 2 of the plan says it found exactly one test outside them, `touchCounts.test.ts`. Landing the health row and the fire row turned **42 tests red across 13 files**. The commit is 19 files. The plan also calls slice B "the slice with the largest blast radius"; on the test-name diff that is now slice A, 47 added and 27 removed against slice B's yet-unknown count.

What went red, and why each is the same ruling rather than a separate decision:

- **The same #76 pass A pin, in four more files.** `skullStream.test.ts` (five volleys), `wisps.test.ts` (four wisps), `bell.test.ts` (eight far tolls), `territory.test.ts` (eight pulses). `touchCounts.test.ts`'s own JSDoc rule, that a pinned count changes only by an explicit ruling in the same motion as the ruling, is what governs all five files and not only the one the plan found. All re-expressed against ADR 0059's counts.
- **The armed share and the first-shot jitter lost their only carrier.** `mobFire.test.ts` used the shambler as the specimen for `everyThird` and for the jitter, and `FieldRenderer.test.ts` used two shamblers to contrast an armed drawing with an unarmed one. Under the mow no mob type carries either. The rules are unchanged and are now read off `isArmed` and `firstShotOffset` directly, and the renderer's contrast is two revenants with the flag set by hand, which is what a display component's test is supposed to fake.
- **Four measured per-seed baseline tables.** `NEVER_PAID` `[505]` to `[]`, `MEETS_THE_TIMELINE` `[]` to `[404]`, `STRIPS_A_RUNG` `[]` to all five, and `NEVER_PAID_AT_THE_BIRTHRIGHT` `[101, 404]` to `[]` with `ENDS_ABOVE_THE_BIRTHRIGHT` going to all five. These are the dead baselines the handoff took eyes-open; each comment now says what it held and why it moved.
- **Two run-length bounds.** A parked run seals at tick 6135 where it used to seal at 1118 (`screenLifecycle.test.ts`), and two seeds played from one script now stay identical for 1260 ticks where they used to part at 840 on a revenant's first-shot jitter (`verificationReadback.test.ts`). Both budgets were raised; neither promise moved.

**7. Nothing in the plan owns the Wall, and the mow takes ADR 0042's second half away.** Not applied, filed here for Mark. The Wall is 22 shamblers (`rows.ts`, the Crowd's t=2 row) and ADR 0042 makes it two-sided: crossable unloaded at the floor build, and never crossable for free. Measured on this commit at the floor build over 1400 ticks on seeds 101 and 505, with the mob table as the only variable:

| Rows | Killed of 22 | Grave hits | Size 27 to |
| --- | --- | --- | --- |
| 40 health, every third armed | 2 | 2 | 21 |
| 8 health, every third armed | 10 | 0 | grew |
| 8 health, silent (this commit) | 2 | 0 | 27 |

So the cost was the health rather than the fire: at 8 health the storm thins the curtain enough for a dodging lane to open, and the grave crosses untouched. The loaded half goes with it, because `belchingPolicy` spends a belch at `BELCH_WORTH_IT` shots in the air and a curtain of silent bodies never puts any there. Both halves that still hold are asserted outright; the two that do not are `it.fails` tripwires with the measurement in the describe's JSDoc, which is that file's own idiom for a band the game does not reach, and they go red the day the Wall costs something again. **No hand row was moved**, per the dispatch. Re-authoring the Wall's row belongs to slice B, which owns the Crowd's table.

**8. The mow reverses a reading of Mark's #79 dwell-ladder ruling, in Territory's bottom rung.** Not applied beyond the test's own wording, filed for his read. The ladder rules a pace and its own describe says so: "the ruled touch counts do not move with it, only the time the ground takes to deliver them, which is what makes an early rung survivable". Two Territory pulses is a shambler now, and a level-one crossing lands five, so the mow body dies in the slowest ground there is. The pace pin is kept whole by reading it on a revenant, which walks out chipped 8 pulses of its 13, and a second test pins that the mow body does not. Nothing in step 4's plan owns Territory's rungs.

**9. `everyThird` and `firstShotJitter` now have no producer anywhere in the mob table.** `firstShotJitter` is 0 on all three types and on all three boss rows, so `firstShotOffset` can never draw and the whole `mobFire` seeded stream is drawn only by the Banshee's own nudge (`banshee.ts:143`). `everyThird` is a live `ArmedShare` variant no row names. Both are left in place: `mobFire.ts` is not in this slice's boundary, ADR 0059 records the low-armed-share alternative as considered and rejected rather than impossible, and removing a variant is a decision rather than a tidy-up. Two tests pin the absence so a jitter reappearing on a mob row is a change somebody made.

**10. The drain-out's "trash dies in a second or two" derivation is now 0.3 seconds.** `skullStream.ts`'s own JSDoc still derives `STREAM_INTERVAL` against five skulls to a shambler, and `wisps.ts:70`, `skullStream.ts:85`, `bell.ts:113` and `territory.ts:121` all carry a sentence stating a superseded touch count. None was edited: those files are outside this slice's boundary and slice C opens two of them. The damage rows themselves are unmoved and correct; it is the derivation prose beside them that is stale.

## 5. Seams that moved

None against the plan. The four seams it named are the ones built: the header's build identity field encoded and decoded, `PlaybackResult`'s two new identity fields, `Measurement`'s `buildMismatch` on both the verified and the diverged arm, and the harness read-back's attribution line.

`GitAnswers` inside `scripts/buildIdentity.ts` went from two members to three under the CodeRabbit finding. It is a private seam of the build shell with one production caller and one test caller, not a seam the plan named.

Slice 1: none against the plan. The four seams the dispatch named are the ones built: the synthetic field builder, the stats reduction, the row formatter, and the orchestration over a list of sizes.

Two seams the dispatch did not name were needed and are new. `scripts/frameBudgetCaps.ts` exports `sizePoolsFor`, which is the bench's own caps ceiling, and `src/app/routes.ts` gains `FRAME_BUDGET_HASH` and a `frame-budget` route kind, which is the browser entry the dispatch asked for in whatever shape the codebase already had: the `#/digest` route is that shape, a hash route whose screen is imported dynamically so `src/dev` never lands in the boot chunk. The built bundle confirms it: `FrameBudgetScreen` is its own 5.66 kB chunk.

`harnessStatesNoTarget.test.ts` was read and neither new module joins its list. Its `MODULES` are the batch report's own three, and its rules are ADR 0053's for the harness report: no ordering against a literal, no boolean, and no mean. The frame budget prints a mean on purpose, because that is the column the record's table carries, so adding it would be asserting the wrong rule about the wrong instrument.

**Slice A: none against the plan.** The four seams the dispatch named are the ones changed: the mob table's shambler, ghoul and revenant rows; the Procession's teaching row; the witness digest; and the glossary's Armed entry. No new module, no new dependency, no new export, and no harness hand row.

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

**Slice 1, round 0, the frame budget. Four steps, all with the agent as actor, all run. One step of this slice has the human as its actor and it is open: the phone half.**

**Step 1, the standing checks.** `pnpm typecheck` and `pnpm vitest run` green in `apps/hungry-grave/`, then `pnpm verify` green from the worktree root, exit 0, at both of the slice's commits: 141 test files, 1846 passed, 10 expected fail, 2 todo. `pnpm build` green as well, and the browser entry lands in its own 5.66 kB lazy chunk rather than in the boot chunk.

**Step 2, the test-name diff.** Against the section 6 baseline: `1834 names in the baseline, 1856 now: 22 added, 0 removed`. Eleven of the twenty-two are A0's. The eleven this slice added:

```
+ src/app/__tests__/routes.test.ts :: resolveRoute > #/frame-budget resolves to the frame budget route, which is how a phone reports what it draws
+ src/app/__tests__/routes.test.ts :: resolveRoute > #/frame-budget-old does not, the same lookalike rule again
+ src/dev/__tests__/frameBudget.test.ts :: the frame budget > answers one row per size, in the order the sizes were given
+ src/dev/__tests__/frameBudget.test.ts :: the frame budget > answers the mean and the 95th percentile of the frames it was given
+ src/dev/__tests__/frameBudget.test.ts :: the frame budget > prints the field and both spans in the columns the record reads in
+ src/dev/__tests__/frameBudget.test.ts :: the frame budget > says a span nobody timed was not measured rather than printing a zero
+ src/dev/__tests__/syntheticField.test.ts :: a synthetic field > puts the field back to its size after the run has taken some away
+ src/dev/__tests__/syntheticField.test.ts :: a synthetic field > refuses out loud when the pools are smaller than the field asked for
+ src/dev/__tests__/syntheticField.test.ts :: a synthetic field > stands a field the run can be stepped from, breaking no invariant
+ src/dev/__tests__/syntheticField.test.ts :: a synthetic field > stands exactly the bodies and the food the size names
+ src/dev/__tests__/syntheticField.test.ts :: a synthetic field > takes the field back down to its size after the run has stood more
```

**Step 3, the headless run beside the record's table, with the drift in words.** Section 9. The record's table is not edited.

**Step 4, the browser run.** `pnpm build` then `pnpm exec vite preview`, opened at `#/frame-budget` and driven once with `playwright-cli`, never a `file:` URL. Its table is in section 9. It prints to the panel for a phone, which has no console, and to the console for an agent, which must not read a figure off a screenshot (ADR 0018).

**Open, actor Mark: the phone half of round 0.** The record's section 4 carries an explicit empty slot for it. The instrument is at `#/frame-budget` on any deployed build, it needs no flags and no typing, and it prints its own table on the panel. It will print three of the six fields, for the reason in section 4 item 3.

**Slice A. Five steps, all with the agent as actor, all run. One step has Mark as its actor and it is open: the felt check of whether the mow feels like a mow, after deploy.**

**Step 1, the standing checks.** `pnpm typecheck` and `pnpm vitest run` green in `apps/hungry-grave/`, then `pnpm verify` green from the worktree root, exit 0: 141 test files, 1860 passed, 19 expected fail, 2 todo. `pnpm build` green as well. The expected-fail count went 10 to 19 and the nine are section 4 item 7's Wall tripwires.

**The fence list (plan verification step 14), all five green, 71 tests.** `boundary.test.ts` (the rendering-import boundary), `lineAgnosticPolicies.test.ts` (no weapon line walks the mob pool; a policy names no weapon line; no boss and no set piece names a weapon line; a line's constants are declared in that line's own module; only the offer draws from the drops stream), `executionFence.test.ts`, `harnessStatesNoTarget.test.ts` (the harness reports and never judges) and `comparisonDeclared.test.ts`.

**Step 2, the test-name diff.** Against the section 6 baseline: `1834 names in the baseline, 1879 now: 72 added, 27 removed`. Twenty-five of the seventy-two are the earlier slices', so this slice added 47 and removed 27. Every removal is paired to the rename that replaced it:

| Removed | Replaced by |
| --- | --- |
| touchCounts: Territory pulses take a shambler in 8, a ghoul in 4, a revenant in 13 | ...take a shambler in 2, a ghoul in 4, a revenant in 13 |
| touchCounts: skull stream skulls take a shambler in 5, a ghoul in 3, a revenant in 8 | ...take a shambler in 1, a ghoul in 3, a revenant in 8 |
| touchCounts: wisps take a shambler in 4, a ghoul in 2, a revenant in 7 | ...take a shambler in 1, a ghoul in 2, a revenant in 7 |
| touchCounts: bell tolls at the far edge take a shambler in 8 | bell tolls take a shambler in 1 at the near edge and 2 at the far edge, plus the new ratio test |
| skullStream: kills a shambler standing in its column with exactly five volleys | ...with exactly one volley |
| skullStream: still spends about a second and a half killing that shambler | spends about a third of a second killing that shambler |
| wisps: takes exactly four wisps to kill a shambler | takes exactly one wisp to kill a shambler |
| bell: takes exactly eight tolls to kill a shambler standing at the cone's full reach | takes exactly two tolls... |
| bell: takes about three tenths of a shambler at eighty percent of the reach | takes about three tenths of the near edge at eighty percent of the reach |
| territory: a shambler held on ground start to death takes exactly 8 pulses | ...takes exactly 2 pulses |
| territory: a shambler walks out of level-one ground alive | walks a revenant out of level-one ground alive, chipped, plus kills the mow body in level-one ground |
| mobs: one swallow's surge clears two trash bodies > kills two bodies... | one swallow's surge clears ten trash bodies > kills ten bodies... |
| mobFire: spreads a File of armed shamblers with a per-mob offset | spreads a group of armed mobs with a per-mob offset, plus names no jitter on any mob type |
| digest: makes the spawns and mobFire streams both draw | makes the spawns stream draw, plus draws nothing at all on the mobFire stream |
| harnessPolicy: is never paid a carrier on seed 101, and on seed 404 | takes the offers it is paid on seed 101, and on seed 404 |
| bot: falls short of most of the authored timeline on seed 404 | meets most of the authored timeline on seed 404 |
| bot: is crossable unloaded at the floor build on seed N, and never for free (x5) | is crossable unloaded at the floor build on seed N, plus is never crossed for free at the floor build on seed N |
| bot: is crossed clean by a loaded belch at the ceiling build on seed N (x5) | is crossed clean at the ceiling build on seed N, plus spends a belch crossing at the ceiling build on seed N |

Nothing was lost. Every removed name is a rename or a split, and the eleven purely new names are the mow's own spec tests: four under `the mow (ADR 0059)`, two under `the Procession's first mob fire`, one ratio test in `touchCounts`, and four deliberate-absence pins.

**Step 3, the rendered check.** `pnpm build` then `pnpm exec vite preview` on port 4173, driven with `playwright-cli` against `http://localhost:4173/?seed=505` and never a `file:` URL. The run was played by hand from the RISE button and screenshotted inside the Procession at tick 2697: `apps/hungry-grave/.playwright-cli/slice-a-mow-procession-seed505-tick2697.png`. Read rather than filed: shamblers across the field, the skull column rising out of the mouth, a trail of corpses behind where it has been, two drops standing, and **not one enemy shot on the field**. Zero console errors; the seven warnings are the audio autoplay policy and headless Chrome's software renderer, both pre-existing.

**Step 4, two tapes at the new tip, both verified.** A conditioned tape (`record-conditioned.ts`, seed 505, 6000 ticks, `skullStream=1 territory=0 wisps=0 bell=0`) and, beyond what this slice was asked for, the hand tape the plan's verification step 9a wants: the browser run above was played to its ending and saved through the game's own SAVE TAPE button, which is a different input path from any script. Both were replayed with `measure.ts`.

```
conditioned  "outcome": "verified"   6000 ticks, 101 checkpoints verified, buildMismatch null
hand         "outcome": "verified"   6119 ticks, 102 checkpoints verified, ending "sealed"
```

The per-source counts are identical on both, which is the mow stated as a measurement:

```
hitsPerKill   { shambler: 1, revenant: 8 }
fatalBlows    { skullStream: 3, territory: 0, wisps: 0, bell: 0, belch: 0 }
arrivals      { shambler: 38, revenant: 8, ghoul: 0 }  over the Procession's first 100 seconds
```

The hand tape carries a build mismatch and the conditioned one does not. It is not a code difference: the browser bundle stamps its identity when `pnpm build` runs and the headless reader stamps its own when it reads, and another agent was writing an untracked research document in this worktree in between, which the digest folds by design (#82). The first conditioned tape carried the same mismatch for the same reason and a re-record minutes later carried none.

**Step 5, enemy shots in the air.** The measure reports `mobFireAlivePerTick`, so the peak is readable. **Peak 8 on the conditioned tape and 12 on the hand tape, against the old peak of 70.** The old roster was 356 shamblers to 47 revenants over a run, so the revenant share of 70 is about 7 to 10; the mow lands at that share and not above it, which is exactly what section 5 item 1 of the record predicts. Every shot in both tapes is a revenant's, because nothing else on the field can fire.

**Open, actor Mark: the felt check.** Whether the mow feels like a mow. It cannot be checked here and this slice does not claim it: slice A makes bodies weak and silent, and the density itself is slice B's standing rows. The tape's own arrivals say so, 46 bodies over the Procession's first 100 seconds, which is the schedule as authored and not a mow yet.

## 8. Slice A0: the tape carries a build identity that a dirty tree changes (#82)

Commit `26a064a064`, twenty-one files, ten planned tests plus one from the review.

**The planned test list, all five present and green.** A tape whose recorded identity differs and whose witness diverges reports a build-mismatch attribution naming both; a matching identity with a diverging witness reports a plain divergence; a differing identity that verifies reports verified with a build note; the encoder marks a dirty tree; a tape carrying no identity at all still decodes and still verifies. Nothing was added beyond the review's one.

**Two defects were fixed before the review, both found by reading the diff.**

- `src/tape/buildIdentity.ts` exported `UNSTAMPED_BUILD` with no caller anywhere, while `attribution()` in `scripts/batch.ts` hand-rolled `mismatch.recorded || 'no build identity'`, which is the case the constant exists for. The cited-future rule forbids an export with no caller today, so the constant took its caller: the batch's attribution now names the empty identity by comparing against it rather than by leaning on a falsy string.
- `src/app/tapeHeader.ts` carried two consecutive JSDoc blocks on `tapeHeaderFor`, of which only the last would attach. They are one block now, with the pre-existing content kept and the build identity paragraph added to its end.

**One minor thing, also pre-review.** The `buildIdentity` import in `src/dev/__tests__/measure.test.ts` sat below the `tape/tape` imports rather than in path order; it now sits where `src/tape/__tests__/playback.test.ts` puts its own.

**The module boundary held.** The identity is produced in the build shell (`scripts/buildIdentity.ts`, from `VERCEL_GIT_COMMIT_SHA` when CI names one, else git, else `unknown`), compiled into both bundles as `BUILD_IDENTITY` by `vite.config.ts` and `vite.headless.config.ts`, and read exactly once at the tape edge (`src/tape/buildIdentity.ts`). The core replay compares two opaque strings and knows nothing about git. No new dependency.

**`tsconfig.json`'s `include` gained `vite.headless.config.ts`**, because that config now imports a module and stopped being a file nothing typechecks.

## 9. Slice 1: round 0, the frame budget (#39)

Commit `c23be6156c`, twelve files, ten planned tests plus one from the review.

**What exists now.** `apps/hungry-grave/scripts/frame-budget.ts` stands a synthetic field at each of the six sizes the record's section 4 table names, drives the real step through `executeTick` with its invariants checked, and prints the record's own table. `src/dev/syntheticField.ts` builds and holds the field; `src/dev/frameBudget.ts` reduces the spans through `framePerformance.performanceOf` and formats the table; both are pure, both are tested, and the script holds no logic beyond sequencing. `vite.frame-budget.config.ts` aliases `src/game/caps` to `scripts/frameBudgetCaps.ts`, which is the record's own method and the only way to stand the three fields above the shipped caps.

**The two commands.**

```
pnpm vite-node --config vite.frame-budget.config.ts scripts/frame-budget.ts
```

prints all six rows with the sim columns filled. The plainer `--config vite.headless.config.ts` spelling the dispatch named runs the same script under the shipped caps, which cannot stand three of the six fields. It stack-traced out of the middle of the fourth one and lost the three good rows above it, so a second commit, `3594fe154a`, made it a refusal instead: it names the fields the pools cannot stand and the config that can, takes no measurement, and exits 1. A table missing a field is not the record's table, so a partial run is refused rather than printed.

The render columns need a renderer, so they come from the browser, at `#/frame-budget` on any build. `pnpm build` then `pnpm exec vite preview`, or the deployed URL on a phone, which is the half that is Mark's.

**The headless table, seed 505, 180 timed ticks per field after 600 warm-up ticks.**

```
| field (mobs / corpses) | sim tick mean | sim tick p95 | render CPU mean | render CPU p95 |
| --- | --- | --- | --- | --- |
| 4 / 10 | 0.05 ms | 0.12 ms | not measured | not measured |
| 30 / 60 | 0.07 ms | 0.13 ms | not measured | not measured |
| 80 / 200 | 0.27 ms | 0.57 ms | not measured | not measured |
| 100 / 250 | 0.38 ms | 0.72 ms | not measured | not measured |
| 200 / 500 | 0.60 ms | 1.38 ms | not measured | not measured |
| 400 / 1000 | 0.93 ms | 1.81 ms | not measured | not measured |
```

`100 / 250` reported `corpse cap never binds` on two of its ticks, which is a field standing at exactly its own pool's capacity being told so. Every other field broke no invariant.

**The browser table, the same six fields, `vite preview` of the normal build, headless Chrome, driven with `playwright-cli`.** Three rows, because the shipped caps refuse the other three.

```
| field (mobs / corpses) | sim tick mean | sim tick p95 | render CPU mean | render CPU p95 |
| --- | --- | --- | --- | --- |
| 4 / 10 | 0.25 ms | 0.50 ms | 0.52 ms | 1.10 ms |
| 30 / 60 | 0.22 ms | 0.50 ms | 0.83 ms | 1.90 ms |
| 80 / 200 | 0.31 ms | 0.60 ms | 1.81 ms | 3.70 ms |
```

**The drift against the record, in words. The record's table is not edited and no number here is asserted against it.**

Every cell of both columns is the same order of magnitude as the record's, and every one reads higher than the record's rather than lower. The sim column: 30 / 60 and 200 / 500 land within a few percent, 80 / 200 and 400 / 1000 are a little over twice, 100 / 250 is a little over twice, and 4 / 10 is the widest of them, near twice on the mean. The render column: 4 / 10 and 30 / 60 are within a fifth on the mean, 80 / 200 is a little over half again; on the p95 the same three run a fifth, a half and a bit over twice above the record's. So one cell of twelve, the browser's 80 / 200 render p95 at 3.70 ms against 1.6 ms, drifts by more than about a factor of two, and it is the noisiest reading of the set.

**Two things bound how far that drift can be read, and both are the instrument's rather than the game's.** First, this tool's own run-to-run spread is about a factor of two on this machine: three consecutive headless runs of the same seed read 0.05, 0.08 and 0.07 ms at 4 / 10 and 0.93, 0.85 and 0.60 ms at 400 / 1000. A single run cannot separate a real change from that. Second, the browser's sim column should not be read against the record's sim column at all: headless Chrome ran the page at nine to nineteen frames a second under a software renderer, with GPU stalls reported on the console, and Chrome coarsens `performance.now()` without cross-origin isolation, which is the same grid problem `docs/research/invariant-check-cost.md` records for WebKit. The browser reads 0.25 ms of sim at 4 / 10 where the headless run of the same field reads 0.05 ms. The browser run exists for the render column.

**What the numbers say about step 4, which is what round 0 was for.** The step 4 peak the record names, 80 / 200, costs about 0.3 ms of simulation and about 1.8 ms of render CPU on this desktop under a software renderer, against a 16.7 ms frame. The record's own conclusion holds: the field step 4 authors sits an order of magnitude under the frame, and the cost lives in the renderer.

**Where the method is followed and where it could not be.** The record's method is followed: the real step, `checkInvariants`, `FieldRenderer`, and pools sized per row through a Vite alias over `src/game/caps`. Two departures, both recorded above as findings rather than choices: the field is held at its size on every tick, because a field stood once is a field emptying; and the browser half runs at whatever caps its own build carries, so a shipped build measures three of the six. A build under `vite.frame-budget.config.ts` would render all six, and it is not built here: it needs the browser plugins and a second output directory, which is a second config rather than a flag, and the three fields it would add are headroom probes rather than anything step 4 is sized against.

**One thing the dispatch asked for that reads differently in the tree.** The dispatch says the instrument "reads the result through the existing `src/dev/framePerformance.ts`", and the record says that module "was not the instrument for this". Both are right about different halves. `performanceOf` is a pure reduction over frame rows and it is what reduces the bench's spans, so the project keeps one nearest-rank convention and one empty-series answer. Everything else in the module is about a tape's frames and none of it applies, and `framePerformance.ts` is unchanged, exactly as the plan's module table says.

## 10. A0 follow-up: the build identity reads untracked files from any cwd (#82)

Commit `136a349aeb`, two files, three tests added and none removed. This closes section 4 item 5, which found the defect and left the call to whoever owns #82.

**What it is now.** Every git command the identity asks runs at `git rev-parse --show-toplevel` rather than at the process's own directory. Two of the commands answered for the current directory alone: `git ls-files --others` lists only the folder it runs in and prints its paths relative to that folder, while `git hash-object --stdin-paths` reads the paths it is handed against the repository root. Anywhere but the top level the two disagree, and the mismatch is stderr inside a pipe whose exit status belongs to the last command, so the untracked contents fell out of the digest in silence. Item 5's `--full-name` was not the fix taken: measured on a throwaway repo, it prints repo-root paths but still lists only the folder it runs in, so an untracked file above `apps/hungry-grave` would stay invisible. Running at the top level answers both halves at once, and it also makes the untracked listing the same set the `git status --porcelain --untracked-files=all` beside it already read from any directory. The top level is looked up inside each answer rather than once at construction, so a directory git cannot answer for still becomes the unknown build rather than throwing where nothing is watching.

**The three tests, all red first.** The two that could see the defect failed with the empty blob's digest, `e69de29bb2`, which is what folding nothing hashes to.

```
+ scripts/__tests__/buildIdentity.test.ts :: the build identity > comes back to the clean identity when an untracked file is deleted
+ scripts/__tests__/buildIdentity.test.ts :: the build identity > reads one identity from the repository root and from a directory inside it
+ scripts/__tests__/buildIdentity.test.ts :: the build identity > tells two trees apart by an untracked file's contents, read from a directory inside the repository
```

**The live check, cwd `apps/hungry-grave`, on `a365a9bf8e` with this slice's own two edits uncommitted.** An untracked `src/scratchRule.ts` was written, rewritten and deleted, and the identity was read after each. A, B, C, A:

```
A (no scratch file):            a365a9bf8ee33a871c64830d2efa179f5b823515-dirty-88e68af026
B (scratch file, one skull):    a365a9bf8ee33a871c64830d2efa179f5b823515-dirty-62d3ef26d5
C (scratch file, three skulls): a365a9bf8ee33a871c64830d2efa179f5b823515-dirty-e15e840e54
A again (scratch file gone):    a365a9bf8ee33a871c64830d2efa179f5b823515-dirty-88e68af026
```

The same tree read from the worktree root gives `a365a9bf8ee33a871c64830d2efa179f5b823515-dirty-88e68af026`, the identical string, which is the other half of the definition. `git status --short` afterwards shows the scratch file gone and only the two edited files, both of which are this commit.

**CodeRabbit.** `coderabbit review --agent --uncommitted` from the worktree root over the staged work, two files reviewed, **no findings**.

**Verification steps run, all four with the agent as actor.** `pnpm typecheck` and `pnpm vitest run` green in `apps/hungry-grave/`: 141 test files, 1849 passed, 10 expected fail, 2 todo. `pnpm verify` green from the worktree root, exit 0. The test-name diff against the section 6 baseline: `1834 names in the baseline, 1859 now: 25 added, 0 removed`, of which twenty-two are the earlier slices' and three are this one's. The live check above is the fourth.

**`GOLDEN` did not move**, and neither did `WITNESS_VERSION` (6), `FORMAT_VERSION` (3) or `READINGS_VERSION` (3). None of `src/dev/digest.ts`, `src/game/witness.ts`, `src/tape/wireCodes.ts` or `src/dev/readingsVersion.ts` is in this commit at all, which is two files. Nothing here is folded: `src/tape/buildIdentity.ts` is untouched and the core still compares two opaque strings.

**One thing worth knowing about older tapes.** Any tape recorded by a headless script before this commit carries a digest taken over the tracked diff and the untracked paths alone. Two such tapes that differ only in an untracked file's contents still carry one identity, and nothing can separate them after the fact. Tapes recorded from here on separate.

## 11. Slice A: the mob table and fire (#39)

Commit `d4dedf6d9a`, nineteen files, 499 insertions and 213 deletions.

**What the game does now.** A shambler dies to one skull, one wisp, one toll at the grave, two tolls at the bell's far edge or two Territory pulses, and it never fires. A ghoul still dies to three skulls and a revenant to eight, and the revenant is the only trash type that carries fire, which makes the armed minority a mob type rather than a share of a row. The Procession's Drip of three with one armed is now a lone revenant Drip at t=11, so the game's first mob fire is one body standing by itself.

**The four data edits, and nothing else in production.** `mobs.ts`: `hp` 40 to 8, `fire` to `NEVER_FIRES`, and the derivation paragraph rewritten to state the new counts in the shape the old one used. `rows.ts`: the t=11 row from three shamblers to one revenant, and the paragraph above `PROCESSION_ROWS` that explained the Drip of three rewritten, because it described code that no longer exists. `digest.ts`: the re-pin and its dated paragraph, plus the `FILE_AT` JSDoc, which claimed the scripted File's armed mob drew from the mobFire stream. `CONTEXT.md`: the Armed entry, in the wording the dispatch supplied.

**The planned test list, all present and green.** Spec tests 1 to 6 and 14 from the plan, plus the module tests the dispatch named. Eleven of them are new names; the rest are the re-expressions section 7 lists.

- 1, 2: `the mow (ADR 0059) > kills a shambler with one skull` and `> kills a ghoul with three skulls and a revenant with eight`, landed through `damageMob` one skull at a time so the promise is the kill rather than the arithmetic.
- 3, 4: `> never arms a shambler, wherever it stands in its group`, walked across nine placements because the armed share used to be a position rule, plus 600 ticks with no `mobFired`; and `> arms the revenant, which is the one trash type that fires`, which reads the armed types off `MOB_TYPE_NAMES` and then watches a revenant actually fire.
- 5, 6: `touchCounts.test.ts` re-expressed whole, and the far-edge ruling held as ADR 0036's ratio (`BELL_DAMAGE_FAR * 8 === BELL_DAMAGE_NEAR`) rather than as the eight-toll count that ratio produced at 40 health.
- 14: `the Procession's first mob fire (ADR 0016, ADR 0059) > teaches the tell with a lone revenant Drip and never with the mow body`, read off the table, with a second test that the Drip stands ahead of every other body that can fire.
- The GOLDEN pin at tick 600, which is section 2.

**One thing worth knowing about the Procession's Drips.** There are now two lone revenant Drips in the section, at t=11 and at t=31. The plan and the record are both explicit that the Drip of three is replaced in place, and the record's section 3 counts the new t=11 row as one of "the Procession's first two authored rows", so it was taken at its word. The t=31 Drip's own job in the file's JSDoc was to teach the tell, and the tell is now taught at t=11. Nothing is broken by the pair, and folding it belongs to slice B, which re-authors the table.

**Nothing was weakened to reach green.** Every moved pin is a count the mow ruling supersedes, moved in the same motion as the ruling and with the ADR cited in the test's own comment, which is the rule `touchCounts.test.ts`'s header already carried. The two properties the mow genuinely takes away, ADR 0042's Wall cost and Territory's bottom rung, are in section 4 items 7 and 8 rather than quietly re-asserted in the other direction, and the Wall's two halves stand as `it.fails` tripwires carrying the measurement that made them fail.

## 12. Steps 2 and 3: the second gate round, folded (#39)

Commits `2120369437` (the naming research record) and `cb230c765c` (ADR 0060 re-ruled, both design records and the glossary). Docs only, no code, no tests.

**What the three gates said and what happened to each.**

- **Product vision, on the growth shape.** A standing row that held "until the phase ends" would keep arrivals coming under the sparse last row, so a phase that ends on `rowsSpentAndFieldClear` could never see a clear field and its boss would never arrive (ADR 0051). **Applied**: a standing row now ends at the next row of any kind, a section that ends that way closes its list with a standing row authored at zero at its sparse last row's time, and spec test 8 pins both halves.
- **Game design, on weapon growth per rung.** ADR 0060 was carrying the size of a weapon line's climb, which is not its decision to make. **Applied**: one sentence stays in the ADR pointing at ADR 0005, which already gives each line its own five levels; the design record's section 5 item 4 carries the substance; and spec test 19a becomes a per-line row rather than a band shared across the roster, because Territory and the bell buy area and repel rather than damage. Slice C reads `docs/research/weapon-growth-per-level-precedent.md`, marked research in flight.
- **Tech architecture, on the seams.** Eight findings, **all applied**: the stage picks the active standing row statelessly off `firedRows` and the cursor fires its first group; `Repeat` is authored in seconds and `stage.ts` converts through `rowTicks`, so `rows.ts` still value-imports nothing; `rowsUnderThePour` carries the active standing row in at `t: 0` with its interval widened by `1 / share`, because a rate thins by interval and not by count; `peakArrivals` gains the rate term in slice B rather than slice D, because it is the corpse cap's existing proof; `carries` is false on every standing row; the module table names `stage.ts` under slice B and slice B's expected reds are listed at 15 to 20 files; the `Mob` provenance mark moves to slice E's fold commit; and the seam text now says `spawnMob` has three callers and not one.

**The health and speed step is struck, and this is the evidence.** ADR 0060's first re-ruling adopted a per-minute step on trash health and fall speed at 0.05 and 0.005 of base, read off Vampire Survivors' shipped `TimeMods`. Both design gates found those figures are Mad Forest's **Inverse** mode, which is that stage's hard mode: normal Mad Forest carries no `TimeMods` at all and its whole climb is enemy type substitution. All three facts were already in the tree at `docs/research/survivor-numbers.md:87`, `:98` and `:123` before the step was proposed, so this is a misread rather than something the record could not have known, and the ADR's supersession note no longer claims it. ADR 0059 is Mark's ruling and it rules the direction: growth is more enemies and harder ones, never the same enemies wearing more health. The step is out of the ADR, out of the design record's section 5 item 3 and section 9, and out of the plan's definition line, its `mobs.ts` seam block, spec tests 4a to 4c, the slice B clause and the module table.

**What was kept instead.** The hits-to-kill-per-trash-type-per-minute reading stays whole: `timeToKill.ts` in slice G, verification step 12, step 15's batch and spec test 55a. It is the instrument that decides whether a stat step ever comes back, because with no step authored a body costs fewer hits every minute the ladder climbs. The design record's section 12 item 6 records the question with that reading as its trigger: six Vampire Survivors stages do carry normal-mode inflation of 0.10 to 0.25, and Deep Rock Galactic: Survivor's trash sits at base health at maximum hazard, so if the batch reads the mow ending early the candidate is enemy type substitution first and a stat step second, and either is a new ADR amending ADR 0059 for Mark's read.

**The glossary moved in this commit and not in a slice.** `CONTEXT.md` gains **The mow**, **Signal lock**, **Ladder** and the **Add** clause, the **Row** entry gains its standing clause, and the **Standing row** entry is rewritten to the stepped one-construct shape. Both design records and the plan now say so rather than owing it to slices B and G. A rename pass follows separately and none of these words were written in its vocabulary.

**One correction taken outside the dispatch's list.** `naming-the-authored-growth-rate.md`'s section 5 is where the Inverse-mode reading entered, so it carries a dated correction naming the mode and the six normal-mode stages rather than being committed unflagged. The finding it exists for, that precedent disagreed with the ramp, is untouched.

**One departure from the orchestrator's own citation, with the arithmetic.** The instruction was to cite Mad Forest's troughs as minutes 5 and 10 rather than 3 and 9. The series the research record quotes is minute-indexed, and it agrees with `survivor-numbers.md`'s table at minutes 0, 1, 2, 5 and 11, so the two thinnest spawn ticks fall at minute 5 (1000 ms) and minute 8 (1500 ms); minute 10 reads 500 ms like its neighbours. All three files say 5 and 8.
