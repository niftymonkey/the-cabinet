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

## 2. GOLDEN moves

None so far. The plan permits five, in slices A, B, C, E and F, and a move anywhere else is a stop-and-report.

Slice A0: `GOLDEN` (`digest.ts:313`) did not move, and neither did `WITNESS_VERSION` (6), `FORMAT_VERSION` (3) or `READINGS_VERSION` (3). `git diff --stat` over `src/dev/digest.ts`, `src/game/witness.ts`, `src/tape/wireCodes.ts` and `src/dev/readingsVersion.ts` answered with nothing, so none of the four is inside the diff at all. Nothing this slice changed is folded: `buildIdentity` was already a header field (`tape.ts:114`), empty on every tape recorded so far, so what changed is the content of a slot the format already has. The playback result gained two fields the witness never sees, and the reader compares two opaque strings outside the fold.

Slice 1: none of the four moved. `git diff --stat` from `0b5574fd63` to `c23be6156c` over `src/dev/digest.ts`, `src/game/witness.ts`, `src/tape/wireCodes.ts` and `src/dev/readingsVersion.ts` answered with nothing, so none of them is in the diff at all. `WITNESS_VERSION` is 6, `FORMAT_VERSION` 3, `READINGS_VERSION` 3. Nothing this slice touches is folded: the instrument stands a field, times it and prints, and it changes no rule the witness watches.

## 3. CodeRabbit

Slice A0: `coderabbit review --agent --uncommitted` from the repo root over the staged work, twenty-one files reviewed, **one finding, major, applied**, then a clean re-review over the same twenty-one files with **no findings**.

- **Applied, major.** The identity called a tree clean when the only uncommitted work was untracked. `git describe --dirty` and `git diff HEAD` both answer for tracked files alone, so a slice that writes a new module and records a tape before staging it, which is exactly what this slice itself did, would stamp two builds under two different rules with one identity. That is the confusion #82 exists to end, so the fix went in rather than to a ticket. `--dirty` came off the describe, `git status --porcelain --untracked-files=all` became the one authority on whether anything is uncommitted, and the digest now folds three things: `git diff HEAD`, the untracked paths, and the contents behind them. The digest deliberately does not read the porcelain output, because staging a file changes what `--porcelain` prints without changing the build it describes, and an identity that moved on staging would put a build note on readings that deserve none. One test came with it, `counts a file nobody has added yet as uncommitted work`, which is the eleventh name in section 7's diff.

Slice 1's second commit, `3594fe154a`: one file reviewed, **no findings**.

Slice 1: `coderabbit review --agent --uncommitted` from the repo root over the staged work, twelve files reviewed. **Two findings, both major, one applied.** Then a re-review over the same twelve files with **one minor finding, declined**.

- **Applied, major.** The field builder only filled shortages and never trimmed a surplus, so it held the field from one direction. A driven run does not only lose entities: the stage spawns bodies of its own and a kill drops food, so in a build whose pools are larger than the field being measured, the field drifts upward from the first tick. That is exactly the browser half, where the caps are the shipped ones and the smallest field is four mobs in a pool of a hundred and sixty. It is now held from both directions, last slot first so the trim is the same on every run, and a test starts both pools above the size and asserts the sizes come back. The browser's own numbers moved on the fix: 30 / 60 render CPU read 1.14 ms before it and 0.83 ms after.
- **Declined, major.** That the render span should start after `FieldRenderer.sync` rather than before it. The record's render CPU column is the whole render half of a frame, and its own sentence names the split inside that half rather than excluding one side of it: "at 200 mobs and 500 corpses, sync costs 0.47 ms against 2.25 ms for the Pixi pass" (`mow-ladder-director.md` section 4). A column that excluded sync would not be the column the record reads in. There is no unmeasured gap either way: the same reading ends the sim span and begins the render one.
- **Declined, minor.** A guard rejecting negative, fractional or non-finite field sizes. The only producer of a `FieldSize` is `ROUND_ZERO_FIELDS`, a literal in `src/dev/frameBudget.ts`, so the value's origin is our own code, which `code-core.md` says is never repaired because a bad one is a bug. A guard against a value no caller can produce is also generality for an absent caller, which the cited-future rule forbids.

## 4. Plan claims found false against the tree

**1. Step 0a's "three format 3 tapes from Mark's Downloads folder" is two.** Verification step 4 of the slice, plan line 745, and the handoff's "three tapes from the current build verify". `/mnt/c/Users/markd/Downloads/` holds 31 tapes: eleven at format 1, eighteen at format 2, and two at format 3, `hungry-grave-1569855829-ad4657276e.tape` and `hungry-grave-242458454-ad4657276e.tape`, both recorded on `ad4657276e`. Read off the format word at byte 4 of each file, which is `HGTP` then the version as a little-endian uint16. Both were replayed and both verify with the build note; the plan's intent was followed over its count. Format 1 is a third refused shape the plan does not mention, refused for the same reason format 2 is.

**2. The A0 file table's identity recipe is superseded by the CodeRabbit finding.** Plan line 480 says the identity is "the Vercel sha, else `git describe --always --dirty --abbrev=40`, else unknown". The Vercel arm and the unknown arm stand. The git arm is now `git describe --always --abbrev=40` with a separate `git status --porcelain --untracked-files=all` deciding dirtiness, for the reason in section 3. The module boundary the plan set is untouched: the string is still produced only in the build shell and still parsed at the tape edge exactly once, and the core still compares two opaque strings.

**3. The shipped caps refuse half of round 0's own table, and one of the two the plan puts in its headline.** `MOB_CAP` is 160 and `CORPSE_CAP` is 233 (measured; it is derived, not written down). A pool is built at its cap, so a build carrying the shipped caps cannot stand 100 / 250, 200 / 500 or 400 / 1000 at all. The plan's step 1 line and the record's section 4 both name "a synthetic field of 100 mobs and 250 corpses" as the thing round 0 measures, and no shipped build can stand it. This is why the record's method needs its Vite alias, and it is a fact about the caps rather than a gap in the instrument: item 7 of the record derives the caps from the content, and until that lands, what the phone can be asked to draw is capped at 160 / 233. The step 4 peak the record names, 80 / 200, does fit, so the row that decides item 3 and item 7 is measurable on the phone today.

**4. The record's method sentence does not say the field is held, and a field that is not held is not what gets measured.** "A synthetic field drove the real step" reads as standing the field once. Measured: with the field stood once and six hundred warm-up ticks driven before the stopwatch, 400 / 1000 read 0.11 ms mean, cheaper than a held 30 / 60, because the scroll had carried the bodies off the bottom edge and freshness had emptied every corpse ten seconds in. The instrument stands the field before every tick, and the per-row caps are the other half of holding it: a pool sized to the field is what stops the run's own spawns and kills from standing more than the measurement asked for. That reading also makes sense of the record's own "pools sized per row", which would otherwise only be a way to reach the large rows.

**5. `scripts/buildIdentity.ts` drops untracked file contents whenever it runs from `apps/hungry-grave/`, which is where every headless script runs.** Not this slice's module and not fixed here. `git ls-files --others --exclude-standard | git hash-object --stdin-paths` prints `fatal: could not open 'scripts/frame-budget.ts' for reading` from the app directory and succeeds from the repo root: `ls-files` prints paths relative to the current directory and `hash-object --stdin-paths` resolves them against the repo root. The pipeline's exit status is the last command's, which succeeds, so the failure is stderr noise and the digest is taken over the tracked diff and the untracked *paths* only. Two dirty trees differing only in an untracked file's contents therefore carry one identity from any headless run, which is the confusion #82 exists to end. `git ls-files --others --exclude-standard --full-name` was tried from the app directory and gives the repo-root run's own three hashes; it also widens the listing from the app folder to the whole repo, which is a choice rather than a typo fix, so the call is left to whoever owns #82.

## 5. Seams that moved

None against the plan. The four seams it named are the ones built: the header's build identity field encoded and decoded, `PlaybackResult`'s two new identity fields, `Measurement`'s `buildMismatch` on both the verified and the diverged arm, and the harness read-back's attribution line.

`GitAnswers` inside `scripts/buildIdentity.ts` went from two members to three under the CodeRabbit finding. It is a private seam of the build shell with one production caller and one test caller, not a seam the plan named.

Slice 1: none against the plan. The four seams the dispatch named are the ones built: the synthetic field builder, the stats reduction, the row formatter, and the orchestration over a list of sizes.

Two seams the dispatch did not name were needed and are new. `scripts/frameBudgetCaps.ts` exports `sizePoolsFor`, which is the bench's own caps ceiling, and `src/app/routes.ts` gains `FRAME_BUDGET_HASH` and a `frame-budget` route kind, which is the browser entry the dispatch asked for in whatever shape the codebase already had: the `#/digest` route is that shape, a hash route whose screen is imported dynamically so `src/dev` never lands in the boot chunk. The built bundle confirms it: `FrameBudgetScreen` is its own 5.66 kB chunk.

`harnessStatesNoTarget.test.ts` was read and neither new module joins its list. Its `MODULES` are the batch report's own three, and its rules are ADR 0053's for the harness report: no ordering against a literal, no boolean, and no mean. The frame budget prints a mean on purpose, because that is the column the record's table carries, so adding it would be asserting the wrong rule about the wrong instrument.

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
