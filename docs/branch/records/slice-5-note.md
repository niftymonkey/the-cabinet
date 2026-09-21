# Slice 5 coder note: the replay reaches the run's end (design record R6)

## What changed

Changed, in `apps/hungry-grave/`:

- `src/tape/recorder.ts`. One new private function, `stampFinalCheckpoint(recorder, execution)`: it reads the last stamped checkpoint's index (or -1 when there is none), returns when that index is at or above `execution.run.tick`, and otherwise stamps through the same `stampCheckpoint` the tick listener uses, with `execution.run` as the state. `sealTrailer` calls it once, after the second-seal guard and before `syncFaults`, so a second seal stamps nothing. `sealTrailer`'s JSDoc first line now says it stamps the run's last tick as well as writing the trailer. Nothing else in the file moved, and `RECORDER_CHECKPOINT_SPACING`, `isCheckpoint`, `stampCheckpoint` and `recordInto` are untouched.
- `src/tape/__tests__/recorder.test.ts`. A new `describe("the seal's final checkpoint")` holding the five planned tests.
- `src/tape/__tests__/verificationReadback.test.ts`. The two planned tests, plus the two pinned expectations the entry names, moved with a comment each carrying the arithmetic.
- `src/app/screens/__tests__/tapePlaybackSession.test.ts`. The planned test, on a 370-tick scripted tape against the recorder's spacing of 60.
- `src/app/__tests__/replayLifecycle.test.ts`. The two planned tests. Nothing existing in the file changed; the quit-at-180 test and its comment stand as written.

Nothing in `src/tape/playback.ts`, `src/tape/records.ts`, `src/tape/segments.ts`, `src/tape/wireCodes.ts`, `src/app/screens/tapePlaybackSession.ts`, `src/app/storeRecording.ts`, `src/game`, `src/dev` or the three seal sites changed. `FORMAT_VERSION` stays 5.

New, outside the app: `local/148-won-tape/3000.tape` and its README, the won tape slice 6 needs.

## Verification results

**Every planned test is written, was red on its own assertion, and is green.** The three absence guards were made red by writing the implementation wrong first, as an unconditional stamp placed above the second-seal guard, and the other seven by running them against the tree with the implementation's one call taken out.

- Test 1, `expected [ +0, 5, 10 ] to deeply equal [ +0, 5, 10, 12 ]`. Test 5, `expected { index: 10, witness: 1176373205 } to deeply equal { index: 12, witness: -310225512 }`.
- Test 2, `expected [ +0, 5, 10, 10 ] to deeply equal [ +0, 5, 10 ]`. Test 3, `expected [ +0, 5, 10, 12, 12 ] to deeply equal [ +0, 5, 10, 12 ]`. Test 4, `expected [ +0, +0 ] to deeply equal [ +0 ]`.
- Test 6, `expected [ +0, 20, 40, 60, 80 ] to deeply equal [ +0, 20, 40, 60, 80, 90 ]`. Test 8, `expected 360 to be 370`. Test 9, `expected 180 to be 190`. Test 10, `expected 2220 to be 2251`.
- Test 7 is the one that was green throughout, and deliberately so: it is the old-tape guard, and the path it covers is the path this slice must not move. Its presence check is test 6 beside it, built on the same 90-tick recording: with the seal's checkpoint the tape carries six and verifies to tick 90, and with that one checkpoint dropped it carries five and still verifies to tick 90.

**The two pinned counts moved, with the arithmetic.** Both are in `verificationReadback.test.ts` on a 90-tick tape at a spacing of 20. "reproduces the run a tape holds and agrees with every checkpoint" (`:107`): the five periodic checkpoints at 0, 20, 40, 60 and 80 gain the seal's one at 90, so `checkpointsVerified` is 6 rather than 5. "verifies a cut tape as far as it goes, and says how far that was" (`:272-273`): the body is cut to 45 ticks, so 0, 20 and 40 are still the three that verify and 60, 80 and now 90 are the three that cannot be reached, so `checkpointsUnreachable` is 3 rather than 2 and `checkpointsVerified` stays 3.

**A third existing expectation moved that the entry does not name, and I left it red.** See "Where the entry was wrong about the code".

**Test names compared before and after**, from two `vitest list --json` captures, the baseline taken before the first edit: 2528 before, 2538 after, 10 added, 0 removed, file-qualified and bare both. The ten added are exactly the ten planned names.

**The standing checks.**

- `pnpm --filter hungry-grave typecheck`: clean, no diagnostic.
- `pnpm --filter hungry-grave build`: `✓ built in 6.38s`, lint and typecheck clean inside it, with the one pre-existing chunk-size warning on the Pixi bundle (589.65 kB) and no other warning. Two prettier errors in my own two test files were met on the first build and fixed with `eslint --fix` before it passed.
- `pnpm --filter hungry-grave test`: `Test Files 1 failed | 169 passed (170)`, `Tests 1 failed | 2526 passed | 11 expected fail | 2 todo (2540)`. The one failure is `measure.test.ts` above. No timeout, no other failure; I counted and read every one.
- `pnpm verify` from the repo root, run whole after the last edit on a quiet machine (load average 0.04) with nothing else of mine running: format, lint and both typechecks pass, `apps/housewarming test: Test Files 7 passed (7)`, `Tests 83 passed (83)`, and `apps/hungry-grave test: Test Files 1 failed | 169 passed (170)`, `Tests 1 failed | 2526 passed | 11 expected fail | 2 todo (2540)` in 176.05 s, ending `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL … Exit status 1` and `ELIFECYCLE Command failed with exit code 1` on that one test. No timeout anywhere, and the failure is `AssertionError: expected 378 to be 377` at `src/dev/__tests__/measure.test.ts:460`, identical to the two earlier runs.

**No pin moved that should hold.** `GOLDEN`, `WITNESS_VERSION`, the bot's seed lists and `FORMAT_VERSION` are untouched and their tests pass.

**1. The proof tape verifies on this tip.** `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts ../../local/148-proof-tape/2000.tape` reads `"outcome": "verified"`, 22,821 ticks, `"ending": "victory"`, 381 checkpoints verified, 0 unreachable, `"recordedFaults": []` and `"readbackFaults": []`. It was recorded before this slice, so it carries no final checkpoint and its bound stays at 22,800.

**2. The won tape for slice 6 is at `local/148-won-tape/3000.tape`**, with its README beside it. Four maxed seeds were played through `scripts/batch.ts` (`steady-far 3000 4 ../../local/148-slice-5/batches rig=maxed`) and all four won: 3000 at 23,470 ticks, 3001 at 23,127, 3002 at 24,890, 3003 at 22,171. 3000 is the one kept, and 23,470 does not divide by 60. `scripts/measure.ts` over it reads `"outcome": "verified"`, `"ending": "victory"`, `"checkpointsVerified": 393`, `"checkpointsUnreachable": 0` and both fault lists empty, so every checkpoint verified. Decoding it directly shows its last five checkpoint indices are 23280, 23340, 23400, 23460, 23470, so the last one equals the run's tick count of 23,470.

**3a. The rendered check**, on the built app through `vite preview` on port 4180, driven with `playwright-cli` at 390 by 844 with `deviceScaleFactor` 3 (the page reports `devicePixelRatio 3`, `innerWidth 390`), every shot taken through `page.screenshot({ scale: 'device' })` and read. `local/148-slice-5/screenshots/won-replay-at-bound.png`: the won tape opened at `#/replay?tape=/3000.tape&at=23470` and left to stop. The readout reads `PLAYED TO TICK 23470, THE LAST VERIFIED C…` (the rest sits under the Back button), `VERIFIED 23470 OF 23470 TICKS`, `ORIGINAL DEBT 0 TICKS`, `TICK 23470`. So the replay stopped on tick 23,470, the run's own last tick; before this slice that line would have read 23,460 of 23,470. On the field, frozen on that last frame: the grave is a tall dark hole low and right of centre with a green Territory patch laid around its rim and a second green patch out at the upper left, four rows of the player's star-shaped shots hang in the air unmoving, several tombstones and tentacle mobs stand dimmed across the ground, and a pale rounded shape sits half off the bottom edge of the field. The browser console carried 0 errors and 5 warnings, all of them the headless-Chrome audio-autoplay and WebGL ReadPixels notices.

**3b. The before-batch tape**, as the entry expected, does not replay. `scripts/measure.ts` over `local/148-before-batch/batches/steady-far-maxed-default-1789929821603/1000.tape` answers `"outcome": "conditionNotImplemented"`, `"reason": "swallow.tipThreshold is a starting condition this build requires and this tape does not name"`. So the refusal is by starting condition rather than by witness version. In the replay screen (`local/148-slice-5/screenshots/before-batch-tape-refused.png` and `-wide.png`) the same tape reads `PLAYED TO TICK 0, THE LAST VERIFIED CHECKPOINT` and `VERIFIED 0 OF 22967 TICKS`, drawing the starting field and nothing else; see the anomaly below.

**3c. An old tape that still verifies replays exactly as far as it did.** `local/148-after-slice-2/batches/steady-far-maxed-default-1789943886409/1000.tape`, measured with my change in and again with it taken out: both read `verified`, 23,716 ticks, 396 checkpoints verified, so the last verified tick is 23,700 on both sides, 16 ticks short of that run's end, which is exactly the gap this slice closes for new tapes.

**4. Every server, browser and background process I started is stopped.** Checked by name at the end: no `vite preview` of mine, no `playwright-cli` session (`playwright-cli list` reads "no browsers"), no chrome, no vitest, no watcher. The `vite preview` on port 4173 belonging to another worktree was never touched.

Nothing on this slice is open for the human. It is a mechanical fix and the entry says so.

## Where the entry was wrong about the code

Three things.

**One existing test outside the entry's pins goes red, and I left it as written.** `apps/hungry-grave/src/dev/__tests__/measure.test.ts:460`, in "recomputes the run summary from the replay: ticks, ending, score and kills": `expect(rich.measured.run.checkpointsVerified).toBe(Math.floor(rich.ticks / RICH_SPACING) + 1)` reads 377 and gets 378. The entry's fact sheet (`local/148-final-checkpoint/facts.md`, section 5) dismissed this fixture with "RICH_TICKS = 25200 / RICH_SPACING = 60 (lines 224-225) is an exact multiple (420×60)". The fixture's own header comment at `measure.test.ts:214-223` says the opposite in as many words: "That makes this a ceiling and not the recording's length: the loop stops on the tick the run ends… What the fixture records is `RichRecording.ticks`, and every assertion over the tape's length reads that." The rich run ends before the ceiling, on a tick where `Math.floor(rich.ticks / 60)` is 376, so the run's last tick is not a multiple of 60 and the seal's checkpoint makes 378 where the formula predicts 377. The formula encodes the assumption this ruling retires, that checkpoints fall only on multiples of the spacing. It is the same one-per-run shift as the two pinned counts, at a third site the entry did not list, and the decision to move it is the entry's to make rather than mine.

**Planned test 10's staging instruction cannot work.** The entry says to stage the lost run "the way `src/app/__tests__/screenLifecycle.test.ts` stands a lost run", which is to write `run.grave.size = SIZE_FLOOR` and a live shambler onto the grave. That state is folded into the witness and a replay rebuilds the run from the seed and the commands alone, so it cannot reproduce it: staged that way at tick 90, the run sealed on tick 91 and the replay diverged, bounding at 60. Measured, with the change in: `expected 60 to be 91`. The entry's other half, "play the loop from the first tick to the loss", does work, and that is what the test does: a parked run on seed 5150 takes every hit the ramp offers and seals on tick 2251 with nothing forced, and the replay plays through 2251.

**Two citations are off by a line or a folder, and both names are present.** `sealTrailer` is `src/tape/recorder.ts:198-215` rather than `:198-214`. ADR 0019 is at `apps/hungry-grave/docs/adr/0019-the-witness-and-the-refusal-rule.md`, as the dispatch said. Every other file-and-line the entry cites checks out by name, including `isCheckpoint` at `:64-67`, `stampCheckpoint` at `:77-89`, `RECORDER_CHECKPOINT_SPACING` at `:28`, `readCheckpoints` at `src/tape/records.ts:194-208` with its strictly-increasing rule at `:201-204`, `FORMAT_VERSION` at `src/tape/wireCodes.ts:68`, `lastVerifiedTick` at `src/app/screens/tapePlaybackSession.ts:112-124` and `session.bound = lastVerifiedTick(...)` at `:220`.

I found no reader that assumes even spacing. The one modulo in the tree is `isCheckpoint` on the write side. `src/app/storeRecording.ts` is the reader that comes closest, and it does not: `queueCheckpointedSegments` walks the array and compares each `checkpoint.index` against the commands already queued, so the seal's off-spacing checkpoint simply queues the tail body and then its own witness record, in the same interleaved order `encodeTape` writes.

## Decisions made

**The stamp sits after the second-seal guard and before `syncFaults`.** The entry rules the placement relative to the guard; before `syncFaults` is mine, so the function reads as the story of a stop: witness the last tick, mirror the faults, write the trailer. To reverse: move the one call. Nothing depends on the order, because the faults ride the observations section and the checkpoint rides the witness chunk.

**The guard reads the last stamped index rather than calling `isCheckpoint`.** `isCheckpoint` answers about the spacing, and what the seal needs to know is whether this exact index is already on the tape, which is what the decoder's rule is about. Reading the array's own tail also covers a recorder built by `createRecorder` alone, with no checkpoint zero, where an `isCheckpoint` test would be answering a different question. To reverse: swap the body of `stampFinalCheckpoint` for `if (isCheckpoint(recorder, execution.run.tick)) return;`, which passes the five recorder tests and is wrong for that one case.

**Test 10 uses seed 5150 played to its own loss**, for the reason above, with the `at` set 40 ticks before the death so the fast-forward does the long part. It asserts `died % 60` is not 0, which is what keeps the test about the gap rather than accidentally about a checkpoint tick. If a later gameplay change lands that seal on a multiple of 60 the assertion fires and says so, which is the honest failure rather than a silently vacuous test. To reverse: drop that one line.

**Test 4 keeps the entry's name, "a run sealed before its first tick carries no checkpoint", while asserting `[0]`.** The tape does carry checkpoint zero, which `recordInto` stamps; what the name means is that the seal adds none. The comment inside the test says so. Renaming it would have been inventing a name the entry did not plan.

## Open items

- **`measure.test.ts:460` is red and untouched**, as above. Nothing else in the suite is.
- **A tape refused for a starting condition says nothing on the replay screen.** `primePlayback` (`src/app/screens/tapePlaybackSession.ts:219-256`) speaks a refusal for `rosterNotImplemented` and for `witnessVersionMismatch` only, so a `conditionNotImplemented` tape falls through to a bound of zero and the screen reads `PLAYED TO TICK 0, THE LAST VERIFIED CHECKPOINT` over a drawn starting field, with no reason given, while `measure` over the same bytes names the missing row exactly. It is pre-existing, and it became reachable when slice 2 added `swallow.tipThreshold` to the starting condition. Not widened into this slice.
- **A stale number beside a seed.** `src/app/__tests__/screenLifecycle.test.ts:936` says "A parked run seals at tick 1043 on this seed", of seed 5150. On this tip it seals at 2251, measured twice: through the game screen in my own test and again through a bare parked `executeTick` loop in the scratch folder, which agree exactly. That test asserts only `toBeGreaterThan(700)`, so nothing is red, and the comment predates this branch's gameplay slices.
- **One test name now reads oddly beside the new ones.** `recorder.test.ts:82`, "stamps a checkpoint at the tape's own spacing and nowhere else", is still true of what it tests, the tick listener on a recorder that is never sealed, but "nowhere else" now has one exception that the new describe block states. I left the name alone rather than spend a pinned name on a cosmetic edit the entry did not ask for.
- **The Pixi chunk-size warning** in `vite build` is pre-existing and unrelated to anything here.
- Screenshots, in full: `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/148-grave-in-the-ground/local/148-slice-5/screenshots/won-replay-at-bound.png`, `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/148-grave-in-the-ground/local/148-slice-5/screenshots/before-batch-tape-refused.png`, `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/148-grave-in-the-ground/local/148-slice-5/screenshots/before-batch-tape-refused-wide.png`.

## Stuck

None. The slice is built and everything it promised is measured. The one thing waiting on the main session is the third expectation above, which I stopped on and did not change.

## Landing (the main session)

- The third expectation the coder stopped on is moved, by the main session, whose entry missed it: `src/dev/__tests__/measure.test.ts`, "recomputes the run summary from the replay". Its formula counted checkpoint zero and one per whole spacing, which is the assumption this ruling retires, so it now adds the seal's checkpoint when the run's last tick is off the spacing. So this slice changes six test files and not five, and no test is red: the note's statements above that `measure.test.ts` is red and untouched describe the tree as the coder left it.
- The stale comment in `src/app/__tests__/screenLifecycle.test.ts` is made true: a parked run on seed 5150 seals at tick 2251 now, and the comment no longer tells the figure's history.
- CodeRabbit, one minor finding, that this note called `measure.test.ts` untouched. The paragraph above answers it.
- Two findings ride with the Undertaker's end (slice 7 since the prototype-look slice was added; its entry is `docs/branch/records/slice-7.md`): `?levels=0` faults at tick 1, and a tape refused as `conditionNotImplemented` says nothing on the replay screen.
- Checked by the main session: `pnpm verify` passes whole, 170 test files and 2527 tests green.
