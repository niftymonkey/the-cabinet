# Slice 5: a replay plays to the run's true end (design record R6, "The replay reaches the death")

Follow-along row 5: "A replay now plays to the very last moment of a run. Before, it stopped up to a second early, so it never showed how the run ended."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. This entry is the planning half of the flow. Your scratch folder is `local/148-slice-5/` in the worktree. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read on the tree at `c96aeabe3d`. The name beside each number is what binds. A name that is gone, or that does something else, is a false claim: stop and report it. The facts behind this entry are in `local/148-final-checkpoint/facts.md` (agent output; the main session checked the recorder and the playback bound itself).

## What this slice builds, and why

A replay never shows frames it cannot verify (ADR 0019, `docs/adr/0019-the-witness-and-the-refusal-rule.md`), so playback stops at the last verified checkpoint (`session.bound = lastVerifiedTick(...)`, `src/app/screens/tapePlaybackSession.ts:220`; `lastVerifiedTick`, `:112-124`). The recorder stamps a checkpoint every 60 ticks (`RECORDER_CHECKPOINT_SPACING`, `src/tape/recorder.ts:28`; `isCheckpoint`, `:64-67`) and sealing the trailer stamps none (`sealTrailer`, `:198-214`). A run stops on the tick it ends. So a replay cuts off 1 to 59 ticks before the run's end unless the run's tick count divides by 60, and those ticks hold the player's death or the last boss's death. Slice 6 puts the Undertaker's end in the replay, and today 59 replays of 60 would never reach it.

The fix: on the seal, the recorder stamps one final checkpoint at the run's last tick. The bound stays a witness comparison, which is what ADR 0019 promises, and it now reaches the run's end.

When it works, a player sees:

- A replay of a lost run plays through the hit that ended it.
- A replay of a won run plays through the last boss's death.
- A replay of a run quit from the pause menu plays to the tick of the quit.
- A tape recorded before this slice replays exactly as far as it did before.

## The rule, exactly

- In `sealTrailer` (`src/tape/recorder.ts:198-214`), after the second-seal guard and only on the first seal: if the run has played at least one tick and the last stamped checkpoint's index is below `execution.run.tick`, stamp a checkpoint at `execution.run.tick` through the same `stampCheckpoint` (`:77-89`) the tick listener uses, with `execution.run` as the state. Every caller of `sealTrailer` holds the execution it just finished ticking, so nothing new is threaded in.
- When the last tick already is a checkpoint, nothing is stamped. A second record with the same index is refused on decode (`readCheckpoints`, `src/tape/records.ts:194-208`, strictly increasing index at `:201-204`).
- A run sealed before its first tick stamps nothing.
- `FORMAT_VERSION` (`src/tape/wireCodes.ts:68`, value 5) does not move. Its own comment (`:17-67`) says it moves on a positional layout change, and the witness chunk is a list of same-shaped records read until the chunk's length runs out. No reader computes with the spacing: the one modulo in the tree is `isCheckpoint` on the write side. If you find a reader that assumes even spacing, stop and report.

## Parts of the code this slice touches

- `src/tape/recorder.ts`: `sealTrailer` as above. The JSDoc on the checkpoint indexing rule (`:72-76`) stays true: index N is the fold after N ticks. If a comment anywhere says checkpoints fall only on multiples of the spacing, make it true.
- Nothing in `src/tape/playback.ts`, `src/tape/records.ts`, `src/tape/segments.ts` or `src/app/screens/tapePlaybackSession.ts` changes. The three seal sites (`src/app/screens/game/runRecording.ts:94`, `src/dev/harnessRun.ts:178`, `scripts/record-conditioned.ts:271`) do not change, and `scripts/batch.ts` seals through `playHarnessRun`.
- `src/app/__tests__/replayLifecycle.test.ts:190-191` carries a comment that the quit landed on tick 180, a checkpoint, so the last verified checkpoint is the whole run. That test stays as written. The new test beside it quits off a checkpoint.

## What must stay unchanged

- Every rule in `src/game`. The witness fold, `WITNESS_VERSION`, `GOLDEN` and the bot's seed lists.
- The tape's wire format and `FORMAT_VERSION`.
- The bound's meaning: a replay shows only ticks at or before a checkpoint that verified. A tape that diverges still stops at the last checkpoint that agreed.
- A tape recorded before this slice decodes, verifies and replays as before.

## Pins

- Two existing tests state a count that this ruling changes, both in `src/tape/__tests__/verificationReadback.test.ts`, both built on a 90-tick tape with a spacing of 20: `:107` (`checkpointsVerified` 5 becomes 6) and `:272-273` (`checkpointsUnreachable` 2 becomes 3, `checkpointsVerified` stays 3). Change those expected values, and say so in your note with the arithmetic. The coder contract's rule against rewriting a test does not cover them, because the ruling changed. If any other existing test goes red, stop and report.
- The proof tape at `local/148-proof-tape/` must still verify (it was recorded before this slice, so it has no final checkpoint).

## Planned tests

Pin every name as a `test.todo` first, then make each red on its own assertion. Each test carries a comment that cites ADR 0019 and this entry's rule.

`src/tape/__tests__/recorder.test.ts`:

1. sealing a run that ended between checkpoints stamps one final checkpoint at the run's last tick
2. sealing a run whose last tick is already a checkpoint stamps nothing more
3. a second seal stamps nothing
4. a run sealed before its first tick carries no checkpoint
5. the final checkpoint holds the same witness a checkpoint stamped on that tick would hold

`src/tape/__tests__/verificationReadback.test.ts`:

6. a sealed tape that ended between checkpoints encodes, decodes and verifies through its last tick
7. a tape with no final checkpoint still verifies to its last periodic checkpoint (an old tape)

`src/app/screens/__tests__/tapePlaybackSession.test.ts`:

8. a replay of a run that ended between checkpoints plays to the run's last tick

`src/app/__tests__/replayLifecycle.test.ts`:

9. a run quit between checkpoints replays to the tick of the quit
10. a lost run's replay reaches the hit that ended it (stage it the way `src/app/__tests__/screenLifecycle.test.ts` stands a lost run, and play the loop from the first tick to the loss)

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. The proof tape: replay and verify the tape at `local/148-proof-tape/` with the command slice 2 left beside it.
2. Record one won tape for slice 6. Play maxed seeds through `playHarnessRun` (`src/dev/harnessRun.ts:154-187`; every maxed run of the "before" batch won) in your scratch folder until one wins on a tick count that does NOT divide by 60, write it as `local/148-won-tape/<seed>.tape` at the worktree's root with a one-line README that names the seed, the rig, the hand and the victory tick, and show by `scripts/measure.ts` that every checkpoint verified and that the last checkpoint's index equals the run's tick count.
3. The rendered check, through `vite preview` with `playwright-cli` at a phone's viewport (390 by 844, device scale 3): copy that tape into `apps/hungry-grave/public/`, open `#/replay?tape=/<name>.tape&at=<the victory tick>`, wait for playback to stop, photograph it, and read the screenshot. Say in your note what tick the replay says it stopped on and what is on the field. Do the same with one tape from `local/148-before-batch/batches/` only if it still replays after slices 1 and 2; it should not, so say what the replay says instead. Remove the copied tape from `public/` when you are done.
4. Stop every server and browser you start.

Open for the human after this slice: nothing. This is a mechanical fix.

## Done when

Every planned test is green, every verification step has a result in your note, the two counts moved only as this entry says, the won tape is in `local/148-won-tape/`, and the working tree holds the code, the tests and `docs/branch/records/slice-5-note.md`, uncommitted.
