# The human tape that diverges on its own build

Recorded 2026-09-09, before step 4 rewrites the mob tables and the witness. Nothing here is a diagnosis. It is the evidence pinned so a test can hold the cause once the cause is known, because after step 4 no build in the tree can reproduce this run.

## The tape

`hungry-grave-1445730872-b1c3a584d1.tape`, in Mark's Downloads folder, 1719595 bytes, written 2026-09-08 21:26 local.

Seed 1445730872. Format version 2. Witness version 6. Checkpoint spacing 60. 24545 ticks recorded, 410 checkpoints, trailer present so the recording sealed. Input device `keyboard`. Starting size 27, four lines (`skullStream`, `territory`, `wisps`, `bell`) at levels 1/0/0/0, which is the birthright rig.

Header commit hash `b1c3a584d1608aeef235a0d9b0156c084fc19cfc`.

Its frame observations are 48893 `live`, 10106 `paused` and 581 `countdown`. It carries no recorded faults, and a replay raises no readback faults.

## What the current tip does with it

The tip (`9dfd0ca079`) refuses it before a tick runs: `this tape is format version 2 and this reader is version 3`. `FORMAT_VERSION` moved 2 to 3 at `4093d4be81`, inside step 3. So the tip cannot reproduce this divergence at all, and the copy of the tape file is the only surviving specimen.

The only two tapes the tip will read are the two format 3 tapes from `ad4657276e`, and both verify on the tip: seed 1569855829, 23731 ticks, 396 of 396 checkpoints, victory; seed 242458454, 24371 ticks, 407 of 407 checkpoints, victory. Both are `keyboard` and `person` on the birthright rig with no exclusions, so human replay is sound on the current tip. Note that these are human tapes, not bot tapes, which corrects the framing carried into this investigation.

## The divergence, on the build the tape names

A scratch worktree at `b1c3a584d1`, `pnpm install --frozen-lockfile`, then `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts` on the tape:

```
{ "outcome": "diverged", "firstDivergentCheckpoint": 16440, "checkpointsVerified": 274, "ticksReproduced": 16440 }
```

Run twice, byte-identical both times. The divergence is deterministic.

A throwaway probe on the same build printed the two numbers behind that verdict. The recorded witness at checkpoint 16440 is 764456418 and the replay recomputes 1741200866. The checkpoint before it, 16380, is 174537633 and agreed. So the first disagreement is at tick 16440, and because the spacing is 60 the true first divergent tick is somewhere in 16381 to 16440 inclusive.

No frame observation within 300 ticks either side of 16440 is anything but `live`, and none bought more than two ticks. The pause and countdown frames the run carries are elsewhere.

## Which folded field differs

The tooling cannot say, and no tooling in the tree can.

`measure` reports four things about a divergence: the outcome, the first divergent checkpoint index, how many checkpoints agreed, and how many ticks were reproduced. That is the whole of it.

The reason is the shape of the witness. `src/game/witness.ts` folds the entire run state into one chained 32-bit integer, through `fold(checksum, value)` over the grave, mobs, mob fire, corpses, skulls, wisps, patches, totals, levels, the stage and the stream cursors in a fixed order. A single integer carries no field identity, and the tape records only that integer.

Naming the field would need one of two things that do not exist. Either a debug fold that records a vector of per-group sub-witnesses on both the recording side and the replay side, so the two vectors can be diffed to a group; or a second independent recording of the same run to diff state against. Neither was built here, and neither should be built on the current tip, which is about to move the witness anyway.

## What verified where

| tape | its own build | on `b1c3a584d1` | on the tip |
| --- | --- | --- | --- |
| seed 1445730872, `b1c3a584d1` | diverged at 16440, 274 verified | diverged at 16440, 274 verified | refused, format 2 |
| seed 1532907850, `5d05c49509` | verified, 417 of 417, victory | diverged at 15180, 253 verified | refused, format 2 |
| seed 1918199170, `b8ea5dcc07` | verified, victory | diverged at 16440, 274 verified | refused, format 2 |
| seed 1569855829, `ad4657276e` | not run separately | not run | verified, 396 of 396, victory |
| seed 242458454, `ad4657276e` | not run separately | not run | verified, 407 of 407, victory |

The two control tapes verify on the builds that recorded them. Only this one fails against its own label.

Their divergence on `b1c3a584d1` is expected rather than a second defect. `WITNESS_VERSION` is 6 at `5d05c49509`, `b8ea5dcc07`, `b1c3a584d1` and `ad4657276e` alike, so the version gate never fires between those builds and any change in simulation behaviour between them surfaces as a divergence instead of a refusal. Cross-build replay of a tape is not a claim the format makes.

One thing in that table is odd and is recorded without an explanation. Two different tapes, different seeds and different recording builds, diverge on `b1c3a584d1` at exactly the same checkpoint, 16440. The 5d05 tape diverges at a different one, 15180, so it is not a fixed property of the build alone.

## Candidate commits

`git log b1c3a584d1..HEAD -- src/game/witness.ts src/game/execution.ts src/game/advance.ts src/tape/playback.ts` is empty. The fold, the tick loop, the advance guard and the replay primitive are byte-identical between the build the tape names and the current tip. So nothing that landed after `b1c3a584d1` can be the cause of a divergence observed at `b1c3a584d1`.

Everything that touches `src/game` or `src/tape` between the two, in order:

- `311cc7b8a8`, killing the Waking's source removes its body, the one commit that changes simulation behaviour. The tape was replayed on this commit too and diverges identically, at 16440 with 274 verified, so it is neither cause nor cure.
- `66dfcea268`, `c784a356e5`, `6abdb4255c`, `6eb7d03ffa`, the harness hand, the offer events and the pinned build, all under `src/dev`.
- `4093d4be81`, the policy field and `FORMAT_VERSION` 2 to 3. This is why the tip refuses the tape.
- `cd00e5af13`, `60707ea831`, `15a00e1021`, `e1b04188c8`, the shared tsconfig and the `noUncheckedIndexedAccess` type-check passes.

That leaves the label itself as the live candidate, and it is not a commit. `vite.config.ts` writes the header's commit hash from `VERCEL_GIT_COMMIT_SHA` when set and otherwise from `git rev-parse HEAD`, and its own comment says it is metadata and never a fidelity gate. Neither source sees an uncommitted working tree. A bundle built while adjustment 4's code was still uncommitted would carry the label `b1c3a584d1` over a simulation nobody can check out today. That is consistent with every measurement above and it is not provable from what survives.

## What a future test would need to hold this

Keep the tape file. It is format 2 and the tip cannot read it, so the specimen is the bytes and nothing in the repo can regenerate them.

The property that failed is same-build replay: a tape recorded by build X must verify on build X. That is the assertion worth a test, and it is a stronger promise than any of the current tests make, because every existing determinism check replays a tape the same process just recorded.

A test that holds the cause needs three things this evidence does not supply. It needs the divergence narrowed from a 60 tick window to one tick, which needs a recording with spacing 1 or a bisect harness. It needs the differing field named, which needs the per-group witness vector described above. And it needs the recording build to be identifiable from the tape, which the current header cannot do, because the commit hash is written from a source that cannot see a dirty tree.

The cheapest step toward all three is to make the header say when the tree was dirty, so a tape's build identity is a fact rather than a label. The `buildIdentity` field is already in the format and is empty on every tape here.

## Every tape in the Downloads folder

Thirty one files, read without being modified, by a throwaway reader that walks the chunk frames and parses the header up to the commit hash. Eleven are format 1, eighteen are format 2, two are format 3. The tip reads only the format 3 pair.

The format 1 header has a different layout, so for those rows only the format version and the seed are trustworthy. The v2-shaped parse returns a commit label shifted by one character against the filename and reads the witness version and checkpoint spacing as nonsense, and those readings are omitted below rather than repeated. The filename's own suffix is the commit label for them.

Tick counts are derived from the body chunk payloads and checkpoint counts from the witness chunk payloads, both at the byte level, so they hold for every format.

| tape | format | seed | commit | witness | ticks | checkpoints |
| --- | --- | --- | --- | --- | --- | --- |
| hungry-grave-100625276-c35d79de72.tape | 2 | 100625276 | c35d79de72 | 2 | 12301 | 206 |
| hungry-grave-1057105590-35ead20a74.tape | 2 | 1057105590 | 35ead20a74 | 4 | 12421 | 208 |
| hungry-grave-1100106568-f6128e04db.tape | 2 | 1100106568 | f6128e04db | 4 | 12421 | 208 |
| hungry-grave-1115524926-e05302188c.tape | 1 | 1115524926 | e05302188c | not readable | 12301 | 206 |
| hungry-grave-1135563333-f6128e04db.tape | 2 | 1135563333 | f6128e04db | 4 | 12421 | 208 |
| hungry-grave-1205060098-2e5f8fb3df.tape | 1 | 1205060098 | 2e5f8fb3df | not readable | 12301 | 206 |
| hungry-grave-1299663326-f10cda50aa.tape | 1 | 1299663326 | f10cda50aa | not readable | 12301 | 206 |
| hungry-grave-1445730872-b1c3a584d1.tape | 2 | 1445730872 | b1c3a584d1 | 6 | 24545 | 410 |
| hungry-grave-1532907850-5d05c49509.tape | 2 | 1532907850 | 5d05c49509 | 6 | 25004 | 417 |
| hungry-grave-1545956177-e05302188c.tape | 1 | 1545956177 | e05302188c | not readable | 12301 | 206 |
| hungry-grave-1569855829-ad4657276e.tape | 3 | 1569855829 | ad4657276e | 6 | 23731 | 396 |
| hungry-grave-1796853541-c77622c7ce.tape | 2 | 1796853541 | c77622c7ce | 4 | 12421 | 208 |
| hungry-grave-1862405697-6eb5cd1741.tape | 2 | 1862405697 | 6eb5cd1741 | 4 | 12421 | 208 |
| hungry-grave-1862710606-426576d489.tape | 2 | 1862710606 | 426576d489 | 3 | 12301 | 206 |
| hungry-grave-1904727007-426576d489.tape | 2 | 1904727007 | 426576d489 | 4 | 12301 | 206 |
| hungry-grave-1918199170-b8ea5dcc07.tape | 2 | 1918199170 | b8ea5dcc07 | 6 | 24428 | 408 |
| hungry-grave-1991298678-e164ed724d.tape | 1 | 1991298678 | e164ed724d | not readable | 12301 | 206 |
| hungry-grave-2074189477-981c0893e6.tape | 2 | 2074189477 | 981c0893e6 | 2 | 12301 | 206 |
| hungry-grave-2093383922-4421f728b5.tape | 1 | 2093383922 | 4421f728b5 | not readable | 12301 | 206 |
| hungry-grave-2107893011-c77622c7ce.tape | 2 | 2107893011 | c77622c7ce | 4 | 12421 | 208 |
| hungry-grave-242458454-ad4657276e.tape | 3 | 242458454 | ad4657276e | 6 | 24371 | 407 |
| hungry-grave-253553320-6606a3f845.tape | 2 | 253553320 | 6606a3f845 | 3 | 12301 | 206 |
| hungry-grave-363921584-2e5f8fb3df.tape | 1 | 363921584 | 2e5f8fb3df | not readable | 12301 | 206 |
| hungry-grave-614910114-1761c50e9a.tape | 2 | 614910114 | 1761c50e9a | 5 | 12421 | 208 |
| hungry-grave-68684426-67c59a955e.tape | 2 | 68684426 | 67c59a955e | 2 | 12301 | 206 |
| hungry-grave-779350383-eeda8b5f14.tape | 1 | 779350383 | eeda8b5f14 | not readable | 12301 | 206 |
| hungry-grave-787479202-4fa4083666.tape | 2 | 787479202 | 4fa4083666 | 5 | 12421 | 208 |
| hungry-grave-794595239-c77622c7ce.tape | 2 | 794595239 | c77622c7ce | 4 | 12421 | 208 |
| hungry-grave-820111237-59efb6a193.tape | 1 | 820111237 | 59efb6a193 | not readable | 12301 | 206 |
| hungry-grave-842292230-031736a287.tape | 1 | 842292230 | 031736a287 | not readable | 12301 | 206 |
| hungry-grave-911422158-f10cda50aa.tape | 1 | 911422158 | f10cda50aa | not readable | 12301 | 206 |

Every tape carries a trailer and none is truncated, and every one carries all five chunk kinds.

The shape of the folder is worth one sentence. Every tape before 2026-09-07 stops at 12301 or 12421 ticks, which is the old run length, and the five recent ones run to between 23731 and 25004. The five long ones are the human runs that matter for step 4, and only two of them are readable by the tip.

## Diagnosis

Three hypotheses were tested in order, each on a scratch worktree at the build in question. The third one wins, and one of its steps is a proof rather than an elimination.

### Something rule-keyed fires in the window

It does, and it is the Waking. A probe replayed the tape through `executeTick` and printed the phase timeline and a per-tick state line. The Banshee dies at tick 8280, the Crowd begins at 8281, and `placeDueSetPiece` puts the dormant source on the field at tick 16381, which is the first tick after the last agreeing checkpoint. `SET_PIECE_PLACED_AT` is 135 phase-local seconds, so the placement is keyed to the phase clock and not to an absolute tick.

The same probe run on the other two long human tapes explains the thing the evidence above recorded as odd without an explanation. The b8ea run kills the Banshee at 8285, five ticks later than this one, so under this build its source is placed at 16386. Both placements land in the same sixty-tick checkpoint bucket, and that, and not an absolute clock, is why two tapes with different seeds and different recording builds both report 16440.

The 5d05 tape closes the pattern from the other side. Its Crowd begins at tick 7959, its own build places the source at phase-local second 120, so its recording placed one at tick 15160, and 15180 is the first checkpoint after that. Its divergence is the source appearing in the recording and not in the replay, which is the mirror of the b8ea case.

So all three divergences sit at the Waking. For the two control tapes that is a whole explanation and not a defect: their builds and this one disagree about when, or whether, the source exists.

### The live path reads something the replay cannot

Nothing in the repo supports this. `src/game` contains no `Math.random`, `Date.now`, `performance.now` or `requestAnimationFrame`. The only `performance.now` calls in the shell are the two that time `advance` in `runSession.ts` and `GameScreen.ts`, and neither value reaches the simulation. `BackgroundRenderer.ts` is the only place outside `src/game` that touches `state.setPiece` and it only reads it. The tape's input device is `keyboard`, so the per-tick command is a discrete velocity rather than a pointer position, which is the input shape least able to carry a precision difference.

One reading that would have fitted was tested and did not hold. If the recording and the replay had slipped by a tick, a recorded checkpoint would match the replay at some neighbouring tick. Every one of the tape's 410 checkpoints was compared against the replay's own witness at all 24545 ticks. The 274 that agree agree in place, and not one of the 136 that disagree matches the replay at any tick at all.

### The header's commit label is not the build

This is the one that stands, and it is provable on a different tape.

At `b8ea5dcc07`, `setPiece.ts` holds only the `SetPiece` type. No production code calls `placeSetPiece`, because that placement arrives later, at `b0b4f4a4f5`. The Crowd's only end condition at that build is `setPieceOpened`, which reads `state.setPiece !== null && state.setPiece.open`. A run on that build can never leave the Crowd, so it can never reach the Undertaker and can never win. The b8ea tape's trailer records `ending: victory`, `stop: finished`, `integrity: clean`. That run did not happen on the build its header names, and no reading of the fold is needed to say so.

The same label is therefore unreliable for the tape under investigation, and everything measured about it is consistent with the label being wrong. The recording build does place a source at about 135 seconds, because the run reached a victory, which needs the Crowd to end, and because checkpoint 15540 agrees, which rules out the 120-second placement every build before `e636411950` uses. Every committed build that places at 135 seconds was replayed against the tape: `e636411950`, `d58448a6e3`, `715575a37d`, `5290784bab`, `b1c3a584d1` and `311cc7b8a8` all diverge at 16440 with 274 checkpoints verified. No commit in the readable range reproduces this run.

What the working tree held at the time has a name. `b1c3a584d1` is the commit that adds adjustment iteration 4's prompt, and the very next commit, `311cc7b8a8`, is that adjustment's code, which edits `setPiece.ts` and nothing else in the simulation. A recording taken while that adjustment was being written would carry the label `b1c3a584d1` and a `setPiece.ts` that is neither the commit before nor the commit after, and the first tick it could show that on is the tick the source is placed. That is tick 16381, which is where the divergence window opens.

### What could not be narrowed

The first divergent tick was not narrowed below the window. The tape carries a witness only every sixty ticks, and a finer fold cannot be reconstructed from a recording that does not hold one. What can be said is that the window's only rule-keyed event is at its first tick.

Which folded field differs was not named either, and the attempt is worth recording so nobody repeats it. A traced re-implementation of `foldWitness` reproduced the replay's checksum exactly and gave the fold's 324 values in order at tick 16440. Because the fold is a multiply-and-add chain, a single differing value implies one delta per position, and none of the 324 positions implied a plausible one. Nor is the difference confined to the source: the recorded witness matches none of the source-only states tried, which were the source absent with the entity counter at, above and below the replay's, the whole set-piece group missing from the fold, the source placed one to a hundred and twenty ticks later, the source drifting at a quarter, a half, three quarters and twice the scroll, the source never swept sideways, and the source one and two drift steps off. So whatever differed at 16381 had reached beyond the source itself by 16440.

One test that would have discriminated came back inconclusive rather than negative. Adjustment 4 edits `setPieceHitbox`, so a mid-edit tree could have made the dormant source a storm target. Dropping the `!piece.open` guard on this build still diverges at 16440, but the source sits between y 0 and y 38 through the whole window, which is the top edge, and the storm is around the grave at the bottom, so the change probably had nothing to reach. It neither supports nor refutes the reading.

Against all of that sits one fact that says the difference is small rather than structural. The replay consumes all 24545 commands and wins on the last one, which is the tape's own length and the tape's own ending, and it does so having disagreed at 136 consecutive checkpoints. The Waking still opens, the Vigil still runs, the Undertaker still arrives and still dies, all on the recorded schedule. Whatever differs is too small to change a decision anywhere in the following four minutes of play.

### The test a future slice writes

The property that failed is same-build replay, and the reason it cannot be asserted today is that a tape cannot say what build recorded it. The `buildIdentity` field is already in the format and is empty on every tape here, and `vite.config.ts` writes the commit hash from `VERCEL_GIT_COMMIT_SHA` or `git rev-parse HEAD`, neither of which sees an uncommitted working tree. Ticket #82 is already open on the missing dirty marker.

The assertion belongs at the playback interface and not inside the fold. Given a tape whose recorded build identity is not this build's, `playTape` returns a refusal outcome and reproduces no ticks, in the same shape as the witness version refusal it already has. A tape that cannot be told apart from this build's own output must not be reported as a divergence, because that is the reading that cost this investigation its day: a label nobody could check was read as a fact.

The fix, not applied here, is to stamp a build identity that a dirty tree changes, and to make playback refuse on a build identity mismatch rather than diverge.
