# Step 1 progress: after slice 5

Written for the agent taking slice 6. The plan is `docs/design/step-1-progression-dispatch.md`; everything below is what it does not say or what has moved since it was written.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| Commit 0 | `3aa21802e6` | docs(hungry-grave): dispatch plan for progression mechanics (#96) |
| 1 | `9654f6dd53` | refactor(hungry-grave): rename the soul stream to the skull stream (#96) |
| 2 | `f12c1004ff` | feat(hungry-grave): a run's roster is a resolved value the tape records (#96) |
| 3 | `3a88592513` | feat(hungry-grave): the birthright is the skull stream alone (#96) |
| 4 | `7476ce1c70` | feat(hungry-grave): freshness pays each line in its own currency (#96) |
| 5 | `cc8b87f496` | feat(hungry-grave): the belch splits into a field-wide gas and a local burst (#96) |

Slice 0 recorded the baseline tapes and made no commit.

## 2. GOLDEN moves

- Slice 1: no move, which is the slice's own test. A rename that moved the digest would have been the wrong rename.
- Slice 2: no move. The roster defaults to the whole pool, so every run resolves exactly what it resolved before.
- Slice 3: two fields, `levels.territory` 1 to 0 and `checksum` -1401997495 to 1634744137. Every other field held, the two kills included. `drawn.territory` was already 0 because the 832-tick cadence contains no lay in a 600-tick scenario.
- Slice 4: no move, and this one is worth knowing rather than assuming. The scenario's surge had already been spent by tick 600 (`lines.surgeVolleys` is 0 at the fold) and its one swallowed corpse was fresh, so the fold cannot see freshness-scaled volleys at all. The golden digest is blind to slice 4, and the bot test is what caught it instead.
- Slice 5: no move. The scenario never belches.

## 3. CodeRabbit

Declined:

- Slice 2, major, `witness.ts`: fold `run.roster` into the version-5 witness. Declined. `roster` follows `seed`'s form exactly, resolved once by `createRun`, never mutated by the rules, and carried in the tape header, and the witness partition names it excluded with that reason. ADR 0043 is the stronger argument: "the recorded identity answers interpretation and the witness answers fidelity, they are complementary, and neither is allowed to stand in for the other." Folding the roster would make the witness answer interpretation.
- Slice 4, minor, `docs/push/handoff.md`: record asset-license evidence for the music pack. Declined as out of dispatch. That file is the dispatching session's uncommitted work and this dispatch never touched it.

Applied, and it changed the plan's shape:

- Slice 2, major, `startingLevels.ts`: `implementsLines` had to refuse a roster with no skull stream in it. Real, and ADR 0046 says so ("with the skull stream the one constant every run"). It is implemented as **every `BIRTHRIGHT` line must be named**, derived rather than naming a line, so it collapsed on its own when slice 3 thinned the birthright. A roster short of the birthright describes a run that starts holding nothing, which `checkLevels` would fault on its first tick. The empty roster is refused by the same rule.
- Slice 1, major, `skullStream.test.ts`: the level-5 containment test read its bounds only after flying the volley the whole height of the field, by which point the volley is dead, so it passed over an empty set. Fixed by reading the bounds every tick and asserting at least one live skull was checked. Pre-existing, in a file the rename touched.

## 4. Plan claims found false against the tree

- **`step-1-progression-dispatch.md` section 7, the `BIRTHRIGHT` readers list**, names `grave.test.ts:234,274,280` among "every test that pins the old pair". Those three sites read `BIRTHRIGHT` symbolically (`BIRTHRIGHT.includes(line) ? 1 : 0`) and needed no edit at all. Only `roster.test.ts:12` pinned the pair literally. Nothing was done to the plan; the tests were left as they were and two new ADR 0045 tests were added beside them.
- The plan's slice-3 blast radius is much larger than section 7 lists. Thinning the birthright broke 71 tests across eight files, not the four the readers list names: Territory's own suite (37) and two Territory readings suites lost the level-1 line their fixtures assumed, `damageTaken` lost its one-strip ladder, and the bot test moved on seed outcomes. All were fixed by deriving the fixture from `BIRTHRIGHT` rather than by editing an assertion. Nothing was weakened.

## 5. The four gate corrections

Received mid-slice-4 from the dispatching session. **None has landed in the plan file or the code.** All four are for the agents taking slices 6, 7 and 8, and each is to be applied to the plan file in the same commit as the slice it changes.

1. **Slice 6, cone headings.** Drop the `k * (2*pi/n)` formula: it puts level two's second cone dead astern. Headings become a data row per level so the harness can tune them. `ConeRow` becomes `{ headings: readonly number[]; halfAngle; reach; push }` (headings in radians from straight up, negative left; the cone count is `headings.length`, so `cones` goes and the row still has four fields). `coneHeading(level, index)` reads the row. Initial rows in degrees: level 1 `[0]`; level 2 `[-40, +40]`; level 3 `[-60, 0, +60]`; level 4 `[-108, -36, +36, +108]`; level 5 `[-144, -72, 0, +72, +144]`. Half-angles, reach and push stay as the plan's table. Fix the plan sentence about a rear gap at level five: the surround has small slits, and that is what the ADR asks for. Spec test: every level's headings are symmetric about straight up, and the union of cones is contiguous forward at levels one to four.
2. **Slice 6, verification step 7.** The level-five push row of 40 cannot beat the #79 totals (42, 51, 0) by construction, since the falloff and reach barely move. Step 7's pass criterion becomes: `mobShoved` events and a non-zero repel total appear at `bell=1` and `bell=3`, which is impossible today, and the `bell=5` repel total is reported beside the #79 figures rather than judged. Level five stays at 40 as an initial row.
3. **Slice 7, the carrier stand-in mark.** Not a ring or an outline: the ring is the boss's shape, and ADR 0036 retired it from the player's grammar. Tint the carrier's body instead, the way Gradius, DoDonPachi and Garegga mark carriers by colour. Pick the tint from the existing palette module: outside the mob-fire value band (ADR 0014), distinct from the armed look, not in hue 20 to 39, not brown, not AI purple. Cite the palette line. Section 9 item 4 of the plan gets rewritten to say tint.
4. **Slice 8, the no-line body.** `drawDropIcon` at `src/app/screens/game/foodSprite.ts:189` requires a `WeaponLine`, so a body with no line has no look. Give it one: a treasure-coloured body with no silhouette, in the feast's colour family, so a maxed player reads permanent food with no build. Add the module test for it and put the choice in section 8 of the plan.

Two deferrals with triggers, no action asked: whether the bank should open during a boss phase or the sparse last row (step 2 decides it with the schedule), and the surge rounding rule at 1.2 volleys. The rounding one is already answered in code: slice 4 floors, with the reason in the comment on `surgeStream`.

## 6. The baseline tapes

Recorded at the branch tip before slice 1, so their headers name `soulStream` and they are the input to verification step 8. They cannot be made again.

- `/tmp/claude-1000/-home-mlo-dev-niftymonkey-the-cabinet/b2de3077-a53c-41d4-95e3-76b1e66dfc48/scratchpad/step1/baseline-a.tape` (seed 2093383922, 12000 ticks, `soulStream=1 territory=0 wisps=0 bell=0`)
- `/tmp/claude-1000/-home-mlo-dev-niftymonkey-the-cabinet/b2de3077-a53c-41d4-95e3-76b1e66dfc48/scratchpad/step1/baseline-b.tape` (the same, `bell=5`)

Both recorded with `territory=0`, which faulted `levels in range` at the time because Territory was still a birthright line. That fault is gone as of slice 3 and was expected.

## 7. What the plan does not say

- **`createRun`'s third parameter is now optional rather than defaulted.** `startingLevels?: Readonly<Record<WeaponLine, number>>`, resolved in the body as `startingLevels ?? birthrightLevels(roster)`. A default parameter cannot see a later one, and the birthright levels now depend on the roster.
- **`birthrightLevels(roster)` takes the roster.** A birthright line outside the run's roster starts unowned rather than at one.
- **`RosterImplemented` gained a `roster` field**, beyond the plan's seam. `runFromHeader` in `playback.ts` needs it to field the recorded roster on replay, so the caller exists today. `rosterOf` keeps the tape's own recorded order rather than reordering to `WEAPON_LINES`, because the roster is what the run fielded and reordering would be the reader editing the tape.
- **`freshnessScale` moved from `swallow.ts` to `tuning.ts`**, beside `FRESHNESS_PAYOUT_FLOOR`. Three payers read it now and a line importing `swallow.ts` for it would close a cycle. `src/dev/readings/freshness.ts` was the one other reader and now imports from `tuning`.
- **`launchWisps(state, events, freshness)` and `surgeStream(state, freshness)`** take the raw freshness and each scales its own currency. `soulsForSwallow` in `wisps.ts` is the seam for the count. Both floor a part unit rather than rounding.
- **`BELCH_BURST_RADIUS` is exported from `belch.ts`** and the belch test derives `NEAR` and `FAR` from it, so retuning the radius moves neither case across the line. `hasEntered` still gates the burst alongside the radius, which is ADR 0008's older scope limit standing through the split.
- **Test fixtures now derive from `BIRTHRIGHT` rather than naming lines.** `territoryRun(seed)` in `territory.test.ts`, `territoryRun()` in `territoryPatches.test.ts`, `parkedRun` in `upfieldTraffic.test.ts`. Reuse them rather than adding a second helper.
- **`bot.test.ts` gained `maxedRun(seed)` and `REACHES_VICTORY_MAXED`.** The birthright loadouts stopped reaching victory at all under the thinned birthright, so the both-endings property was asserting reachability over runs that could not produce it. The maxed build reaches victory on all five seeds and is now what the victory half reads. Every pinned seed set was re-measured with a throwaway script, twice, and the script was deleted both times.
- **A per-seed bot outcome swings either way on a change that only ever subtracts.** `dodgePolicy` steers off the field it stands in, so one fewer volley at tick 900 changes which mobs are alive at tick 901. Do not read a moved seed as a strength claim; re-measure and write the cause down.
- **The Wall's loaded-belch test still passes after the belch split**, but for a different reason: the maxed storm clears the curtain the one press no longer can. ADR 0008 anticipated this ("the Wall stops being one-press catharsis, and its set-piece property is re-read in play"), so the pass is honest and the re-read is still owed to play.
- **Two untracked files in `docs/design/` belong to step 2** (`stage-floor.md`, `step-2-stage-floor-dispatch.md`), and `docs/push/handoff.md` carries an uncommitted change that is not this dispatch's. Stage every commit by path. Never `git add -A`.

## 8. Verification steps already run

From the plan's section 3.

- **Step 1, unit tests.** Ran after every slice, green. 107 files, 1350 passed, 10 expected fail, 3 todo.
- **Step 2, `pnpm typecheck`.** Ran after every slice, green.
- **Step 3, `pnpm build`.** Not run yet. Slice 10 owns it.
- **Step 4, `pnpm verify` at the repo root.** Not run as one command; `format:check`, `lint` and the app's `typecheck` and tests were run separately after every slice, all green. Run it from inside the worktree, never from the main checkout, which reports the worktree's own files as unformatted.
- **Step 5, GOLDEN and the bot test per slice.** Ran. Section 2 above carries the moves. The bot test's drop band at `bot.test.ts:294-295` has not been rewritten; slice 7 owns it.
- **Step 6, headless conditioned run for offer and carriers.** Not run. Slices 7 and 8 own it.
- **Step 7, headless conditioned run for bell cones.** Not run. Slice 6 owns it, under the corrected criterion in section 5.
- **Step 8, old-tape decode check.** Ran at slice 2 and passed. `measure.ts` on `baseline-a.tape` returns `{"outcome":"rosterNotImplemented","recordedRoster":["soulStream","territory","wisps","bell"]}`: the tape decodes, reports its recorded roster verbatim in its own vocabulary, and refuses replay precisely rather than throwing a format error or coercing. `FORMAT_VERSION` did not move.
- **Step 9, rendered check.** Not run. Slice 8 owns it.
- **Step 10, fence and invariant guards.** Not run. Slice 9 owns it.
- **Steps 11, 12 and 13** are Mark's and stay open.

`WITNESS_VERSION` moved from 4 to 5 in slice 2 and must not move again in this step.
