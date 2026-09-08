# Step 1 progress: after slice 8

Written for the agents taking slices 9 and 10. The plan is `docs/design/step-1-progression-dispatch.md`; everything below is what it does not say or what has moved since it was written.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| Commit 0 | `3aa21802e6` | docs(hungry-grave): dispatch plan for progression mechanics (#96) |
| 1 | `9654f6dd53` | refactor(hungry-grave): rename the soul stream to the skull stream (#96) |
| 2 | `f12c1004ff` | feat(hungry-grave): a run's roster is a resolved value the tape records (#96) |
| 3 | `3a88592513` | feat(hungry-grave): the birthright is the skull stream alone (#96) |
| 4 | `7476ce1c70` | feat(hungry-grave): freshness pays each line in its own currency (#96) |
| 5 | `cc8b87f496` | feat(hungry-grave): the belch splits into a field-wide gas and a local burst (#96) |
| 6 | `b93d68913d` | feat(hungry-grave): the bell throws cones that widen per level (#96) |
| 7 | `d06246c681` | feat(hungry-grave): carriers meter power and a missed carrier is missed (#96) |
| 8 | `3c9b932e96` | feat(hungry-grave): a drop is an offer of three and the grave swallows one (#96) |

Slice 0 recorded the baseline tapes and made no commit.

## 2. GOLDEN moves

- Slice 1: no move, which is the slice's own test. A rename that moved the digest would have been the wrong rename.
- Slice 2: no move. The roster defaults to the whole pool, so every run resolves exactly what it resolved before.
- Slice 3: two fields, `levels.territory` 1 to 0 and `checksum` -1401997495 to 1634744137. Every other field held, the two kills included. `drawn.territory` was already 0 because the 832-tick cadence contains no lay in a 600-tick scenario.
- Slice 4: no move, and this one is worth knowing rather than assuming. The scenario's surge had already been spent by tick 600 (`lines.surgeVolleys` is 0 at the fold) and its one swallowed corpse was fresh, so the fold cannot see freshness-scaled volleys at all. The golden digest is blind to slice 4, and the bot test is what caught it instead.
- Slice 5: no move. The scenario never belches.
- Slice 7: one field, `checksum` 1634744137 to -1694949037. Every other field held, the two kills and `drawn.drops` 0 included. The move is the fold's own: it stopped folding `killsSinceDrop` and `dropsPaid` and started folding each live mob's `carries`. The scenario's two kills are scripted mobs that carry nothing, so no drop is paid, and the two ramp rows inside the 600 ticks carry a carrier each without drawing from any stream.
- Slice 8: one field, `checksum` -1694949037 to -1111652845. Every other field held, the two kills and `drawn.drops` 0 included. The fold gained the live offer and the bank; the scenario kills no carrier, so what it actually folds for 600 ticks is the absent-offer sentinel and a zero.
- Slice 6: no move, and `src/dev/digest.ts` is not in the slice's diff at all. The scenario's `levels.bell` is 0, so it never tolls and the fold cannot see the cones. What caught the slice's behaviour instead was `step.test.ts` and the bot test, both below.

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

Received mid-slice-4 from the dispatching session. **All four have landed: 1 and 2 in slice 6 (`b93d68913d`), 3 in slice 7 (`d06246c681`), 4 in slice 8 (`3c9b932e96`).** Each was applied to the plan file in the same commit as the slice it changed.

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
- **Step 3, `pnpm build`.** Ran at slice 8, green, because the rendered check needs it. Slice 10 still owns it as a step.
- **Step 4, `pnpm verify` at the repo root.** Not run as one command; `format:check`, `lint` and the app's `typecheck` and tests were run separately after every slice, all green. Run it from inside the worktree, never from the main checkout, which reports the worktree's own files as unformatted.
- **Step 5, GOLDEN and the bot test per slice.** Ran. Section 2 above carries the moves. The bot test's drop band at `bot.test.ts:294-295` has not been rewritten; slice 7 owns it. `REACHES_VICTORY_FROM_THE_CEILING` emptied at slice 6 and section 9 carries the cause.
- **Step 6, headless conditioned run for offer and carriers.** Ran in full. The carrier half at slice 7 and the offer half at slice 8; section 11 carries the offer half's numbers.
- **Step 7, headless conditioned run for bell cones.** Ran at slice 6, under the corrected criterion. Half met, half unmeetable by this instrument; section 9 carries the three totals and the reason.
- **Step 8, old-tape decode check.** Ran at slice 2 and passed. `measure.ts` on `baseline-a.tape` returns `{"outcome":"rosterNotImplemented","recordedRoster":["soulStream","territory","wisps","bell"]}`: the tape decodes, reports its recorded roster verbatim in its own vocabulary, and refuses replay precisely rather than throwing a format error or coercing. `FORMAT_VERSION` did not move.
- **Step 9, rendered check.** Ran at slice 8 for the offer's two reads. Section 11 says which reads were obtained and which were not, with the screenshot paths. The level-five toll shot is slice 10's.
- **Step 10, fence and invariant guards.** Not run. Slice 9 owns it.
- **Steps 11, 12 and 13** are Mark's and stay open.

`WITNESS_VERSION` moved from 4 to 5 in slice 2 and must not move again in this step.

## 9. Slice 6, the bell arcs

Commit `b93d68913d`, twelve files, the two gate corrections in the same commit as the code. `pnpm typecheck`, `pnpm vitest run` (107 files, 1358 passed, 10 expected fail, 3 todo), `pnpm lint` and the repo-root `pnpm format:check` all green.

**GOLDEN did not move and `digest.ts` is not in the diff.** Section 2 says why.

**What the seam looks like now.** `ConeRow` is `{ headings, halfAngle, reach, push }` with headings in radians and the cone count as `headings.length`; `BELL_CONE_ROWS` is indexed by level with a silent row at level 0; `coneHeading`, `insideCone`, `tollReach` and `advanceBell` are the exports, and `BELL_RADIUS_BY_LEVEL` and `BELL_PUSH_BY_LEVEL` are gone. A bearing is measured from straight up, negative to the left, through `math.ts`'s `atan2` because the sim's lint fence forbids `Math.atan2` (ADR 0015).

**Two things the plan did not say, both of them rulings the next agent should know about:**

- **A cone seam needs a tolerance.** Level two's two cones both end at straight up and two of level four's seams do the same, so on exact arithmetic the arc ahead is unbroken. In floating point the seam bearing lands one part in 1e16 outside both cones, and a mob directly ahead of the grave at level two fell through the middle of the answer. `CONE_SEAM_TOLERANCE` in `bell.ts` closes it, with the reason on the constant, and a spec test asserts a mob dead ahead is answered at every level. Anyone retuning the headings inherits this: cones that touch exactly are legal and the tolerance is what makes them so.
- **A mob standing on the grave is inside every cone.** Distance zero has no bearing, and `atan2(0, -0)` is pi, so without the guard a mob on the mouth would read as dead astern and a level-five toll would decline it through the one slit it leaves. The sweep guards it and the existing spec test now runs at level one as well as level five.

**The `lines.ring` field kept its name.** The type is `BellToll`, `ringRadius` became `tollReach`, and the internal functions are toll vocabulary, but `RunState.lines.ring`, the witness partition paths `lines.ring.*` and the wire-coded fault identity `one live ring` all still say ring. The fault identity cannot move without a wire code, and the plan's readers list named only the type and the function. Left as it stands rather than half-renamed; it is a vocabulary sweep for whoever owns one, not a slice-6 edit.

**Plan claims found false against the tree: none.** Every line the plan's section 7 named for the bell was where it said it was.

**CodeRabbit, `-t uncommitted`, two findings.**

- Minor, `docs/design/step-1-progression-dispatch.md:555`, applied. The table's total-degrees column is the summed width of the cones, not the arc they cover, and level three is the one row where those differ: 228 summed against 196 covered, because its cones overlap. The reach derivation genuinely uses the summed width, since the area of `n` wedges is `n * halfAngle * R^2` however they point, so the column was renamed and the level-three overlap written down rather than the number changed.
- Major, `docs/push/handoff.md:27`, declined. That file is the dispatching session's own uncommitted work, this dispatch never touched it, and the finding is about the handoff's step-2 prerequisites rather than about anything in the slice.

**Two tests moved for reasons the cones made real, neither weakened.**

- `step.test.ts`, "credits every kill the tick made, the bell's included", stood its victim exactly on the grave with `vy: 1`. It drifts below the grave before the toll reaches it, which at level five is the one slit the surround leaves open. The victim now stands twenty units ahead. The assertion is unchanged.
- `bell.test.ts`, "keeps a pushed mob inside the field widened by SPAWN_MARGIN", stood four mobs at the field's own corners. Three of them are further from the grave than the top level's reach of 261, so the bound was being taken over mobs no toll ever touched. The mobs now stand at four bearings 150 units out and every one is asserted struck before the bound is read. The old test would have passed with the bell deleted.

**`REACHES_VICTORY_FROM_THE_CEILING` is now empty, and the cause is measured rather than guessed.** Seed 303 sealed at 11160 ticks and 37 kills where it used to run the full stage and win. Of the five ceiling runs, 303 is the only one that ever owns the bell at all: it tolls 31 times, every one of them at level 1, and it now shoves 24 mobs for 36.8 field units where the table it replaced pushed nothing below level 4. The other four seeds never toll and did not move. This is the same path effect the constant's own comment already carried twice, and the comment now carries it three times.

**Verification step 7, the three conditioned runs.** Recorded and measured at `skullStream=1 territory=0 wisps=0` with `bell=1`, `bell=3` and `bell=5`, seed 2093383922, 12000 ticks asked for. The repel totals, against #79's 42, 51 and 0 field units, reported and not judged:

| Run | Ticks | Tolls | Repel shoves | Repel distance | Bell damage |
| --- | --- | --- | --- | --- | --- |
| `bell=1` | 1655 | 8 | 0 | 0 | 0 |
| `bell=3` | 1851 | 9 | 2 | 3.95 | 18.6 |
| `bell=5` | 2554 | 11 | 5 | 25.34 | 48.5 |

`bell=3` meets the corrected criterion outright: two shoves and a non-zero total at a level that could not shove at all before. **`bell=1` reads zero, and it is the instrument rather than the mechanism.** The recorder's wandering script seals the run at about 1650 ticks on every seed tried (2093383922, 101, 202, 303, 404, 505: eight tolls each, zero strikes each), and a probe of the field at each toll's birth says why: for the first seven tolls nothing is alive within reach plus sixty, and the first mobs that do arrive stand at bearings of about seventy degrees either side, which level one's forty-five-degree cone declines and level three's answers. The level-one toll strikes nothing in that window, so it can shove nothing, and the old circle at radius 80 would have reached them no sooner. What does demonstrate the level-one push in a whole run is the bot's own ceiling run on seed 303 above: 31 tolls at level 1, 24 shoves, 36.8 field units, against zero before this slice. Both instruments are in the note because neither alone answers the question the correction asked.

**Two things for the harness at step 4, neither in scope here.** Level one answers a ninety-degree wedge dead ahead while the ramp's waves close on the grave at about seventy degrees either side, so a level-one toll in a played run may rarely touch anything; and level five's 25.34 against #79's 42 and 51 is a shorter run rather than a weaker bell, since these runs seal at a fifth of the tick count. The rows are all initial and both readings are the harness's to move.

**For slice 7.** Nothing in the bell blocks it. `mobs.ts` was not edited and `spawnMob`'s signature is untouched, and the only file slice 7 shares with slice 6 is `bot.test.ts`, where the drop band at `bot.test.ts:294-295` is still slice 7's to rewrite and `REACHES_VICTORY_FROM_THE_CEILING` is now `[]` rather than `[303]`.

## 10. Slice 7, carriers without the offer

Commit `d06246c681`, 41 files, gate correction 3 landed in the plan file in the same commit. `pnpm typecheck`, `pnpm vitest run` (108 files, 1365 passed, 10 expected fail, 3 todo), `pnpm lint` and the repo-root `pnpm format:check` all green. Section 2 above carries the GOLDEN move, which is the checksum alone.

**The schedule holds 25 carriers, which is `carriersScheduled()` exactly.** `carriersForFullBuild()` is 19, derived as the plan says, and `CARRIER_SLACK` is 1.3 rounded up because a schedule holds whole carriers. Fifteen carrying rows in the ramp and ten in the back half, roughly one every seven seconds of authored time, with the run's first row carrying so the first offer is not a long wait. Four rows are held clear with the reason on the table: the three teaching Drips at t=14, t=42 and t=62, and the back half's Wall. The whole column is initial and step 2 owns the authored schedule.

**The tint is `PALETTE.drop`, `src/app/palette.ts:160`, `0xd8a941` at luma 67.25 and hue 41.** Treasure's own colour, which is what the mob is carrying. It is under the field ceiling of 68 and far under the 88 mob fire reserves, it is outside fire's 20 to 39 hue exclusion, it is 85 hue degrees off a mob body and it is not the notch's `foodOutline`. `mobSprite.ts` grew `mobBodyColour(mob)` and `mobLook` grew the flag, so the sprite is still a dumb view and the driver still diffs on the look string. Three module tests hold it: the flag reaches the render data and the sprite fills from it, the mark adds no shape to any type's silhouette (a deliberate-absence guard against the ring), and the colour satisfies ADR 0014's declared bounds on every mob type.

**Where slice 8 replaces exactly one call.** `resolveDeaths` in `step.ts` walks the tick's accumulated kills and calls `dropForCarrier(state, event.x, event.y)` on each `mobKilled` whose `carried` is true. That one call is the whole of the old-style drop: `dropForCarrier` lives in `drops.ts`, rolls the line through `rollDropLine` and spawns one body through `corpses.ts`'s `spawnDrop`. Replacing it with `openOffer` retires `drops.ts` entirely, which is what the plan's slice 8 already says.

**The drop ordinal is now derived rather than stored.** `dropsPaid` is gone, so `dropForCarrier` reads `state.streams.drops.drawn + 1` as the ordinal, with the constraint on the function: `rollDropLine` draws from that stream exactly once per drop and nothing else in the sim draws from it at all. `invariants.ts:189` reads the same cursor for NaN and is the only other reader. Slice 8's offer will not need the ordinal at all, because ADR 0034's fixed first offer replaces the seeding drop it exists for.

**Plan claims found false against the tree: one, and it is a self-contradiction rather than a claim about the code.** Section 8's carrier craft call keyed the carrier to `SpawnOrder.index` on the arming precedent while stating one carrier per carrying row in the same sentence. On the two mirrored templates that index is the rank within an arm, repeated once per arm on purpose (`templates.ts:137,157`), so a V or a Pincer would have carried two. The row rule keys off the position in the row's placement order instead, which is what section 4's own seam comment says ("indices into the stage row's placement order"), and section 8 now says so too with the reason.

**Two seam deviations, both recorded rather than quiet.** `roster.ts` gained `BIRTHRIGHT_LEVEL`, because the plan's own derivation names it and `carriers.ts` may not import `run.ts` (`stage.ts` imports `carriers.ts` and `run.ts` imports `stage.ts`, so it would close a cycle); `run.ts` reads it too, so the level a birthright line is born at now has one declaration. And spec tests 1 and 2 landed in `carriers.test.ts` rather than in `offer.test.ts`, because in this slice they are the carrier rule and `offer.ts` does not exist yet; move them when slice 8 takes ownership of the sentence.

**CodeRabbit, `-t uncommitted`, two findings.**

- Minor, `src/dev/__tests__/digest.test.ts:24`, applied. The mock over `spawnMob` forwarded a hard `false` for the new fourth argument, so every mob in that test's scenario silently stopped carrying. Real, and the sort of thing only a reviewer reading the mock would catch.
- Minor, `src/game/events.ts:137`, declined. Give `carrierLost` a `y` beside its `x`. The seam is dispatched as `{ mob, x }` in the plan's section 4, no reader needs a position at all today, and the cited-future rule is what settles it: whoever builds the missed-supply reading adds the field with its caller named. A lost carrier's position is also the awkward half of the argument, since a bottom cull's `y` is off-field by construction and a side cull's `x` is.

**Verification step 6, the carrier half, two conditioned runs.** Seed 2093383922, 12000 ticks asked for, `territory=0 wisps=0 bell=0`, both tapes and their measurements in the scratchpad (`slice7-carriers.tape`, `slice7-carriers-s5.tape`).

| Run | Ticks | Kills | Carrier kills | Drops | `carrierLost` | Faults |
| --- | --- | --- | --- | --- | --- | --- |
| `skullStream=1` | 1746 | 3 | 2 | 2 | 0 | 0 |
| `skullStream=5` | 2554 | 4 | 3 | 3 | 1 | 0 |

Every drop in both runs landed on a tick whose carrier deaths exactly accounted for it, `measure.ts` reports `verified` with empty `recordedFaults` and `readbackFaults` on both, and the per-line readings name `skullStream`. **`carrierLost` is zero at level one and it is the instrument rather than the mechanism**, the same shape slice 6 met: the wandering script seals at 1746 ticks having met two carriers and killed both, so there was no carrier left to miss. At `skullStream=5` the run lives 800 ticks longer, meets a fourth carrier and loses it. The dodging bot is the other witness and a louder one: across the five fresh seeds a full run now reports 7 to 19 `carrierLost` each.

**The bot's pinned seed sets moved a long way, and the cause is the economy rather than a break.** A dodger is paid by the schedule now instead of by a price table fitted to a kill rate it never reaches, so the five fresh seeds spawn 3 to 9 drops against the 2 to 4 they used to. `SEALS_IN_THE_RAMP` went from `[202, 404]` to `[505]`, `NEVER_FEEDS` emptied, `REACHES_VICTORY_FRESH` went from `[]` to `[202, 303]`, and `REACHES_VICTORY_FROM_THE_CEILING` went from `[]` to `[101, 404, 505]`. `REACHES_VICTORY_MAXED` did not move. Which seeds land where is still path rather than strength, for the reason that constant's own comment has carried twice: a dodger steers off the field it is standing in.

**The `it.fails` drop band is now the schedule's own count.** It asks for `carriersForFullBuild()` drops in a full run and no seed comes near, which is the same tripwire in the same direction; the ordinary half's floors were re-measured to 12 kills and 3 drops, and it gained a real ceiling, the stage's authored carrier count, because no policy can ever be paid by carriers that do not exist.

**`hitTakingPolicy` now reaches ADR 0003's second rung.** `weaponStripped` used to be asserted at exactly zero, with the reason that a policy steering into the nearest threat collects nothing; a carrier drops its power inside the crowd that policy steers into, so it now swallows one and is stripped of it, once or twice depending on the seed. The assertion is the rung being reached plus the levels ending at the birthright, since the count is path.

**`measure.test.ts`'s rich fixture had gone blind to the belch and now runs 9000 ticks.** At 6000 it pressed the belch twice under the new economy and both presses caught an empty radius, so `damage.belch > 0` was being asserted over nothing. At 9000 it presses four times, lands nine hits and still has not sealed, which the fixture's `ending` assertion depends on. The recording moved into a `beforeAll` with its own budget at the same time: it is setup rather than a test, and billed to the first test it was timing out beside the rest of the suite.

**One record-versus-tree gap found, not this slice's to close.** ADR 0002 lists score among the jobs kills keep ("score is kills"), and nothing in the tree pays score for a kill: `swallow.ts:112` is the only writer and it pays from overflow alone. Spec test 2 asserts corpses rather than score because of it, with the reason in the test. Whoever owns scoring decides whether the ADR or the code is wrong.

**For slice 8.** `RunState` has no `offer` or `bankedOffers` yet and the witness partition names neither, so both are yours to add along with their `FIELD_CASES` entries; `WITNESS_VERSION` stays at 5. `witness.test.ts` gained `RETIRED_RUN_FIELDS`, which fails if `killsSinceDrop` or `dropsPaid` ever comes back, on the precedent of `RETIRED_HEADSTONES_CODE` in the same file. `drops.test.ts` still holds the dice tests and is yours to delete with `drops.ts`. The stage rows carry a `carries` boolean and `carrierRow(rowCarries, count)` is what turns it into positions, so a row that should pay twice is a data change plus a rule change in `carriers.ts`, not a change at the spawn site.

## 11. Slice 8, the offer of three and the bank

Commit `3c9b932e96`, 34 files, gate correction 4 in the plan file in the same commit as the code. `pnpm typecheck`, `pnpm vitest run` (108 files, 1394 passed, 10 expected fail, 3 todo), `pnpm lint`, `pnpm build` and the repo-root `pnpm format:check` all green. Section 2 above carries the GOLDEN move, which is the checksum alone.

**What the seam looks like now.** `offer.ts` exports `offerableLines`, `openOffer`, `chooseOfferBody`, `resolveOffer`, `loseOffer`, `OFFER_SIZE`, `OFFER_SPACING`, `OFFER_ENTRY_DEPTH` and the `Offer` record exactly as the plan's section 4 wrote them. `drops.ts` and `drops.test.ts` are gone. `step.ts` calls `openOffer` where `dropForCarrier` stood, asks `chooseOfferBody` before the swallow pass, and calls `loseOffer` after `cullCorpses`, which is a new line in the tick order and the order comment says so.

**Three seam deviations, all recorded rather than quiet.**

- **`Swallowable` gained an `id`.** The plan says `swallow.ts` routes a drop's level through `resolveOffer(state, takenId)`, and nothing in the seam gave `swallow` a body to name. The id is a value like every other field on that record, `asSwallowable` copies it off the corpse, and `corpses.test.ts` now asserts the copy cannot be aliased back to the entity.
- **`DropSpawned` gained an `id` and its `line` became optional.** The id is the join key `openOffer` reads back to learn which body carries which option, so the offer is built out of the bodies that actually stand rather than out of the ones it asked for; a refused spawn is then an option simply not on the field instead of an offer holding an id nothing answers to. The optional line is the maxed run's body, which carries no option at all.
- **`DropLedger` gained a `passed` count.** The plan's test 75 says "taken, passed, or lost, and the three sum to the bodies spawned", but `dropLedger.ts:23` already had a fourth end, `onFieldAtStop`, and the sum has always been over four. It is four ends now and the test asserts the four-way sum. `compareRuns.ts` gained the declared comparison meaning for it, which `comparisonDeclared.test.ts` demands.

**Three defects found by the tests rather than by reading, each worth knowing.**

- **A vanished sibling's pooled slot is reused by the offer that opens behind it.** `resolveSwallows` walked the covered food, swallowed the chosen body first, and skipped anything no longer alive. Taking a body vanishes its siblings and opens the banked offer in the same call, and the new offer's bodies claim the slots those siblings just freed, so the walk reached a live slot that was never covered and swallowed a brand-new body. The fix is that `coveredFood` remembers each body's id and the walk skips a slot whose id has moved. This is the "a recycled slot is a different body" hazard the design already names, met for real.
- **The fixed first offer came back empty on a part-built run.** Taking the birthright and filling from unowned lines gives nothing at all when the run holds its birthright maxed and every other line partway up, which is exactly what `measure.test.ts`'s rich fixture pins. Every carrier in that 9000-tick run paid a no-option body, the run levelled nothing and sealed. `fixedFirstOptions` now fills any room left from the rest of the offerable pool, a fresh run is unchanged because its unowned lines fill the offer first, and the plan's section 8 carries the rule.
- **The invariants fixture stood an option body on the field with no offer naming it,** which is the state `one live offer` exists to record. The fixture gained a matching offer. It is the new check working rather than a defect in the check.

**One pre-existing stale count, found and corrected.** `faults.ts`'s own header said "Twelve identities against fourteen checks ... the five bounds checks share one identity", and there were six bounds checks and fifteen checks before this slice touched anything. It now reads fifteen identities against eighteen checks with six bounds checks, and `faults.test.ts`'s title moved with it.

**Plan claims found false against the tree: two.**

- **Gate correction 4** (section 5 above) says `drawDropIcon` at `src/app/screens/game/foodSprite.ts:189` "requires a `WeaponLine`, so a body with no line has no look". True of `drawDropIcon`, false of the sprite: `foodSprite.ts:270` read `corpse.line ?? 'skullStream'`, so a body with no option drew as a skull-stream drop, which is a worse failure than no look at all. The no-line body now takes its own draw path before the icon is reached, and the fallback is gone rather than left standing beside it.
- **The plan's test 75** (section 6, `dropLedger.test.ts`) names three terminal ends against `dropLedger.ts:23`'s four. Corrected in the test and in the module's own header, per the deviation above.

**CodeRabbit, `-t uncommitted`, two findings, both minor, both applied, none declined.** One: `checkOfferBodies` counted and matched body ids without rejecting a duplicate, and one id twice is two options wearing one body, so the take resolves the first of them and pays a line the player never passed under. Two: `checkBank` rejected a negative bank and not a fractional one; half a banked offer still reads as one to open, so the next take spends it and the fault lands a tick after the write that caused it. Both have their own test in `invariants.test.ts`.

**Verification step 6, the offer half.** The conditioned tape is `slice8-offer.tape` in the scratchpad with its measurement in `slice8-offer.json`, recorded at `skullStream=1 territory=0 wisps=0 bell=0`, seed 2093383922, 12000 ticks asked for. `measure.ts` reports `verified` with empty `recordedFaults` and `readbackFaults`, and its per-line readings name `skullStream`. The conditioned run is thin at 1746 ticks, so the five bot seeds are reported beside it and the sequence properties are checked over all six (`slice8-step6.txt` in the scratchpad).

| Run | Ticks | Carrier kills | Offers opened | Bodies | Taken | Lost | Banked | Faults |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| conditioned 2093383922 | 1746 | 2 | 2 | 6 | 1 | 0 | 1 | 0 |
| bot 101 | 11420 | 7 | 7 | 21 | 6 | 1 | 1 | 0 |
| bot 202 | 12421 | 12 | 12 | 36 | 7 | 4 | 5 | 0 |
| bot 303 | 12421 | 12 | 12 | 36 | 8 | 4 | 3 | 0 |
| bot 404 | 12421 | 11 | 11 | 33 | 8 | 3 | 1 | 0 |
| bot 505 | 12421 | 9 | 9 | 27 | 4 | 4 | 3 | 0 |

Every criterion the plan names passes on all six: bodies are exactly three times the offers opened, every `offerOpened` is followed by exactly one `offerTaken` or `offerLost` before the next (zero alternation violations), taken plus lost never exceeds carriers killed, and no invariant fault fired. The `dropLedger` on the conditioned run reads spawned 6, swallowed 1, passed 2, lost 0, on-field-at-stop 3, which sums to spawned.

**The two-touch tie-break fired zero times across all six runs, and that is the instrument rather than the mechanism.** The case needs a grave wide enough to cover two bodies 90 apart, which is a catch reach over 45 and therefore a size over about 62; the largest grave any of these six runs reached is 33.03 (bot 505), and the conditioned run peaked at 27.51. So none of them could produce the case at all. That is the shape the spacing was chosen for, "possible at the size ceiling and impossible at the start size", and it means **no instrument in this step has exercised the tie-break in a played run**. What holds it is `offer.test.ts`, where two tests drive it at `SIZE_CEILING`: one asserts the nearer body wins over the middle one and one asserts a dead heat goes to the lower entity id. Step 4's harness is where a real hand near the ceiling can read it.

**One thing about the criterion itself, for step 4 and slice 10.** "Bodies equal three times the offers opened" is exact only while no line is maxed: the offer shrinks below three as lines max, and a maxed run opens no offer at all and pays one body carrying no option. All six runs above are below the ceiling on some line throughout, so the equality holds; a run that maxes will break it legitimately.

**Verification step 9, the rendered check.** `pnpm build && pnpm exec vite preview` on port 4173, driven with `playwright-cli` at a 900 by 1200 window. Two reads obtained, one not.

- **Three offer bodies side by side with three distinct silhouettes: obtained, twice.** `slice8-replay-tick1355.png` in the scratchpad, through the pinned-replay path (`#/replay?tape=/slice8-render.tape&at=1355`, the tape recorded at `skullStream=4 territory=2 wisps=2 bell=2`): three treasure-gold bodies at one y, 142 screen pixels apart, which is 90 field units at that scale, drawn as a tall hand, a pointed kite and a circle. `slice8-replay-tick250.png` is the same read earlier in the same tape with a different three.
- **The bank readout: obtained.** `slice8-game-run.png`, a live run at `#/?seed=2093383922&levels=4&size=67`. The corner stack reads DEBT, TICK, SEED PINNED, SIZE PINNED, **BANK 1**, LEVELS 4 PINNED, with the bank line between the size and the levels exactly as it is built, and three offer bodies stand on the field in the same frame.
- **The body a maxed run's carrier opens: not obtained.** `slice8-game-maxed.png` and `slice8-game-maxed2.png` are a `levels=5` run and neither frame caught one on screen; what is visible in them is corpses and, incidentally, the level-five toll's cones. The shape and the colour are held by the module test in `FieldRenderer.test.ts` instead, which asserts its drawn bounds differ from all four line silhouettes and its only fill is the feast's colour.

The screenshots live in the scratchpad at `/tmp/claude-1000/-home-mlo-dev-niftymonkey-the-cabinet/b2de3077-a53c-41d4-95e3-76b1e66dfc48/scratchpad/step1/`. Every one of them is a look and not a comparison: the frame-rate readout and the live field are both in shot.

**The bot's pinned seed sets moved again, and the cause is the offer's shape rather than more power.** A carrier used to leave one body where it died, which a dodger reached only when its lane already crossed that exact point; three bodies now stand 90 units apart, so the same lane crosses one of them far more often. `SEALS_IN_THE_RAMP` emptied (505 left, surviving the ramp and winning), `REACHES_VICTORY_FRESH` went from `[202, 303]` to `[202, 303, 404, 505]`, and `REACHES_VICTORY_FROM_THE_CEILING` went from `[101, 404, 505]` to `[101, 303, 404]`, the same size with different members. `REACHES_VICTORY_MAXED` did not move. The five fresh runs land 66 to 105 kills where they landed 11 to 35 under #79, which is the closest the storm has come to the authored half and still short of it.

**The bot test's band now counts `offerOpened` rather than `dropSpawned`,** because one carrier opens one offer of three bodies and the band has always been about carriers. The `it.fails` half asks for `carriersForFullBuild()` offers and no seed comes near, the ordinary half's floors were re-measured to 66 kills and 7 offers, its ceiling is the stage's authored carrier count, and it gained the three-bodies-per-offer relation beside them.

**For slices 9 and 10.**

- `WITNESS_VERSION` is still 5 and must not move again in this step. The partition in `witness.test.ts` names `offer.options[]`, `offer.bodyIds[]` and `bankedOffers` as folded, each with a perturbation, and `offer.bodyIds[]` is excluded from the no-NaN partition in `invariants.test.ts` as spawn identity.
- **The fence in slice 9 will read `offer.ts` and `carriers.ts` for weapon-line string literals, and neither holds one.** `offer.ts` reads `state.roster`, `MAX_LEVEL` and `BIRTHRIGHT` and names no line; `offer.test.ts` does name lines, and the fence is over production modules.
- `FAULT_IDENTITIES` is fifteen now, codes 13, 14 and 15 in `wireCodes.ts`, all three recoverable. `FORMAT_VERSION` did not move.
- The rendered check's tape is `slice8-render.tape` in the scratchpad and was served by copying it into `dist/` before `vite preview`; `dist/` is git-ignored, so nothing of that reached the commit. Slice 10's level-five toll shot can use the same path, and `slice8-game-maxed2.png` already shows the cones incidentally.
- `RunHud`'s stack is seven lines now: FPS, DEBT, TICK, SEED, BANK, LEVELS, FAULT. The bank sits at index 5 and the levels and fault lines moved down one, so `layering.test.ts`'s reserve-height rule is untouched (it covers the first five) and the three lines past it are bank, levels and fault.
- **One assertion is knowingly absent and it is slice 9's, not a defect to hunt.** `layering.test.ts`'s width rule for the lines past the reserve is titled and written for the levels and fault lines alone, and the bank line joined them without joining that assertion. It cannot fail today (`BANK 25` is seven characters against a budget of twenty-five) and it is a fence rather than a behaviour, so it belongs with slice 9's fence work rather than in the offer's own commit, which CodeRabbit had already reviewed at that point.

## 12. Slice 9, the fences

Commit `8a7ecc5c31`, two test files and no production change. `pnpm typecheck`, `pnpm lint`, `pnpm vitest run` (109 files, 1405 passed, 10 expected fail, 3 todo) and the repo-root `pnpm format:check` all green. `GOLDEN` did not move and could not: nothing outside a test file was touched.

**The fence reads source text, not imported values, and that is the ruling written into the file.** Neither property survives becoming a value: a string literal inside a function body and the name a constant is declared under are both invisible to an importer, which sees only what a module exports. A module could name every line in a private branch and export nothing that says so. Reading text is also what stays honest at a fifth line, because the line list comes from `WEAPON_LINES` and the module list comes from a walk of the disk, so a new line's module joins both fences the moment the file exists and the roster names it.

**Test 76 scans `game/offer.ts`, `game/carriers.ts` and `dev/bot.ts` for a line name in quotes,** in all three quote characters. Quoting is what makes a name a literal, so `state.levels.bell` passes and a quoted `'bell'` fails wherever it sits, a comment included. That strictness is deliberate: a fence that had to lex the file to tell a comment from a literal would be a parser wearing a fence's name, and the strict direction is the safe one. All three modules pass. `offer.ts` mentions the bell once in prose (`offer.ts:16`, "the bell's struck set"), which is an apostrophe rather than a quote and is not matched.

**Test 77 walks every production module under `src`** (prototypes and `__tests__` folders excluded, the second because a line's own test pins that line's ladder by name and that is the test doing its job) and fails any constant whose name carries a line's prefix outside `src/game/lines/<line>.ts`. The prefix is the leading lowercase run of the line's name uppercased, plus the singular when it ends in an s, so `wisps` claims both `WISPS_BY_LEVEL` and `WISP_FLOOR_SOULS`. The leading run alone and not every camel word, because the second word collides: `skullStream` reading STREAM as its own would claim `STREAM_ORDER` at `witness.ts:20`, which names the RNG streams and has nothing to do with a weapon line.

**The plan's test 77 does not hold against the tree as literally written, and the fence carries one narrow exception instead.** `src/game/caps.ts:94,95,115` declares `SKULL_CAP`, `WISP_CAP` and `TERRITORY_CAP`, which the plan's wording ("no module outside `src/game/lines/<line>.ts` declares a constant whose name begins with that line's own prefix") fails on. They are not per-level tuning rows, which is what the test's own title and the standing constraint are about: `caps.ts:1-21` rules that the entity cap policy is one table of safety nets read beside `MOB_CAP` and derived the same way, and a fifth line's pool needs its capacity there beside the others or the fifth-line recipe grows a registration. So the fence excuses a name ending `_CAP` **and only inside `game/caps.ts`**: a tuning row named for a line still fails inside `caps.ts`, and a `_CAP` constant still fails everywhere else. Both halves have their own assertion. This is the one place the fence departs from the plan's literal mechanism, and it is recorded rather than quiet because the alternative reading was to move three pool capacities into three line modules, which would scatter a policy the code deliberately keeps as one table.

**Neither fence passes over an empty set.** Test 76 carries a control that a planted `'bell'` is caught in all three quote forms and that a field read is not. Test 77 carries four: a row moved into `tuning.ts` is named, the same row inside `bell.ts` is not, the plural and singular wisp spellings are both caught, and the cap exception is shown to be narrow in both directions. The walk asserts it found modules at all and that every line in the pool has a `game/lines/<line>.ts` for the fence to excuse, so a line whose module were spelled anything else would fail rather than read green while holding nobody.

**Tests 78, 79 and 80 are green and were confirmed by reading them, not only by running them.**

- **78.** `witness.test.ts:738` asserts the partition in both directions, so a field in neither list fails and a listed name no field answers to also fails. `roster[]`, `offer.options[]`, `offer.bodyIds[]` and `bankedOffers` are all placed, and `witness.test.ts:722` holds `killsSinceDrop` and `dropsPaid` out of production and out of both halves. `witness.test.ts:747` is the guard's own control.
- **79.** `roster.ts` imports nothing, and the cycle guard that depends on it is `boundary.test.ts:702-705` with `KNOWN_CORE_CYCLES` still empty at `boundary.test.ts:634`. Worth knowing for slice 10: **the plan's section 6 groups test 79 under `quietOnTheHappyPath.test.ts` and `boundary.test.ts` together, and only `boundary.test.ts` holds it.** `quietOnTheHappyPath.test.ts` is about logging and says nothing about roster imports. Nothing was changed; the grouping is just imprecise.
- **80.** `boundary.test.ts`'s game row is `mayReach: ['game']` and its walk covers `offer.ts` and `carriers.ts` like any other file in the folder, so both are already held to reaching only `src/game`.

**The bank line's width assertion, left for this slice by section 11, has landed.** `layering.test.ts` now measures a widest bank line beside the levels and fault lines, and the widest case is `bankReadout(carriersScheduled())`, every scheduled carrier banked with the offer never resolved, so a stage that schedules more carriers moves the case rather than outrunning it. The test's title and the `RESERVED_LINES` comment name three lines past the reserve instead of two.

**CodeRabbit, `-t uncommitted`, one minor finding, applied, none declined.** `constantsDeclaredIn` matched `const NAME` and not `export const NAME`, so a row exported where it is declared would have walked through the fence. Nothing in the tree is written that way, because the module form puts one export block at the end, but a fence whose regex depends on a convention holds only as long as the convention does. The regex takes an optional export modifier now and there is an assertion for that form. **Note for the next slice: `-t uncommitted` reviews staged and modified files and does not see an untracked one.** The first run reported only `layering.test.ts` and found nothing; the new fence file had to be `git add`ed by path before CodeRabbit read it at all. A new file reviewed by nobody would have looked exactly like a clean review.

**Verification step 10 is discharged.** Steps 1 and 2 ran here as usual. Step 4's repo-root pieces were run separately again (`format:check`, `lint`, the app's `typecheck` and tests), all green. Steps 3, 5, 6, 7, 8 and 9 belong to earlier slices or to slice 10 and nothing here moved them. Steps 11, 12 and 13 are Mark's and stay open.

## 13. Slice 10, the verification pass

No production change and no test change. This slice ran the plan's section 3 over the finished step at commit `1761c50e9a` and wrote down what it read. Everything below lives in the scratchpad at `/tmp/claude-1000/-home-mlo-dev-niftymonkey-the-cabinet/f919cc25-2a72-4168-bc61-34ce0f21aabd/scratchpad/step1/`, named as `SCRATCH` from here on.

**Steps 1 to 4, `pnpm verify` at the worktree root, as one command, green.** `SCRATCH/verify.txt`, exit 0. `format:check` reports "All matched files use Prettier code style!", `lint` is silent, `typecheck` passes both apps, and `test` reports hungry-grave at **109 test files, 1405 passed, 10 expected fail, 3 todo (1418)** and housewarming at 7 files and 83 passed. That is the same count section 12 recorded at slice 9, which is what a slice with no code in it should produce. `pnpm build` from `apps/hungry-grave/` ran separately for the rendered check and exited 0 (`SCRATCH/build.txt`), so step 3 is discharged at the tip and not only at slice 8.

**Step 5 is per slice and belongs to the slices that changed behaviour.** Nothing here changed behaviour, so `GOLDEN` could not move; the digest test is inside the green run above, which is the standing check that it has not.

**Step 6, the offer and carriers run, every criterion met, and no number moved since slice 8.** Recorded at seed 2093383922, 12000 ticks asked for, `skullStream=1 territory=0 wisps=0 bell=0`, as `SCRATCH/slice10-offer.tape` with its measurement in `SCRATCH/slice10-offer.json` and the event counts in the transcript of `SCRATCH/step6.ts`.

| Reading | Slice 8 | Slice 10 |
| --- | --- | --- |
| Ticks | 1746 | 1746 |
| Carrier kills | 2 | 2 |
| Offers opened | 2 | 2 |
| Bodies spawned | 6 | 6 |
| Taken | 1 | 1 |
| Lost | 0 | 0 |
| Banked | 1 | 1 |
| Faults | 0 | 0 |
| Max grave size | 27.51 | 27.51 |
| `dropLedger` | 6 / 1 / 2 / 0 / 3 | 6 / 1 / 2 / 0 / 3 |

Criterion by criterion: the measurement names `skullStream` in `damage`, `endLevels` and `tuning.fieldPerLine.perLine`; `dropSpawned` is 6 against 3 times the 2 `offerOpened`; alternation violations are zero, so every `offerOpened` is followed by exactly one `offerTaken` or `offerLost` before the next, with the second offer still live when the run sealed; taken plus lost is 1 against 2 carriers killed; and `measure.ts` reports `verified` with empty `recordedFaults` and `readbackFaults`. The bank was held from tick 560 to tick 1016, which is the second carrier dying under the first offer and the banked offer opening when that offer resolved.

**Step 7, the bell runs, the same half met and the same half unmet, and every total moved.** Recorded at the same seed and conditions with `bell=1`, `bell=3` and `bell=5`, as `SCRATCH/slice10-bell1.tape`, `SCRATCH/slice10-bell3.tape` and `SCRATCH/slice10-bell5.tape` with their measurements beside them.

| Run | Ticks | Tolls | `mobShoved` | Repel distance | Bell damage |
| --- | --- | --- | --- | --- | --- |
| `bell=1`, slice 6 | 1655 | 8 | 0 | 0 | 0 |
| `bell=1`, slice 10 | 1746 | 9 | 0 | 0 | 0 |
| `bell=3`, slice 6 | 1851 | 9 | 2 | 3.95 | 18.6 |
| `bell=3`, slice 10 | 2648 | 10 | 2 | 3.9486 | 18.638 |
| `bell=5`, slice 6 | 2554 | 11 | 5 | 25.34 | 48.5 |
| `bell=5`, slice 10 | 2750 | 14 | 12 | 42.01 | 113.59 |

**The cause of every move is one thing, and it is measured rather than guessed: the offer now pays a rung in the middle of a conditioned run, and slices 7 and 8 are what put it there.** All four runs level a line at tick 1016 (`wisps` to 1 in the three bell runs, `bell` to 1 in the `bell=0` run) and the `bell=3` and `bell=5` runs level a second at tick 1963. Under the slice 6 tree power was priced in kills, and a run that kills three to five mobs bought nothing, so the strip ladder had only the conditioned starting rungs to eat and the run sealed sooner. A rung bought at 1016 is a rung the ladder must eat first, so every run lives longer and the bell throws more tolls: `bell=1` gains 91 ticks and a ninth toll, `bell=3` gains 797 ticks and a tenth, `bell=5` gains 196 ticks and three more.

Tick 1016 is also where the field itself diverges from the slice 6 reading, and the per-toll breakdown says so plainly. `bell=3`'s two shoves are still the eighth toll's alone and still 3.9486 field units, the same shove slice 6 read; only the extra tenth toll is new and it shoved nothing. `bell=5` diverges properly: its first eleven tolls now carry ten shoves and 39.37 units against slice 6's five and 25.34 over the same eleven, because the wisps bought at 1016 change which mobs are alive when tolls seven to ten arrive. Neither is a stronger bell. `BELL_CONE_ROWS` did not move in this slice or in any slice after 6.

**`bell=1` still reads zero shoves, which is the plan's step 7 criterion still not met by this instrument, exactly as slice 6 recorded.** Nine tolls, no strikes, no shoves. Section 9's probe is still the explanation and nothing in slices 7 to 9 touched it: the recorder's wandering script keeps the run in a window where the mobs that arrive stand at about seventy degrees either side, which level one's forty-five-degree cone declines and level three's answers. The other witness is unchanged too and it is in the green suite: the bot's ceiling run on seed 303 tolls at level 1 and shoves. This is carried forward as a finding, not closed.

**The `bell=5` total is reported beside #79's 42, 51 and 0 field units and not judged against them,** which is the plan's own instruction. It reads 42.01 over 2750 ticks. Section 9's note that these runs seal at a fifth of the tick count still applies and step 4's harness is what judges the magnitude.

**Step 8, the old-tape decode check, passed on both baseline tapes.** `measure.ts` on `baseline-a.tape` and on `baseline-b.tape` each returns exactly:

```json
{
  "outcome": "rosterNotImplemented",
  "recordedRoster": [
    "soulStream",
    "territory",
    "wisps",
    "bell"
  ]
}
```

Both exit 0 with empty stderr, so the tapes decode, report their recorded roster verbatim in their own pre-rename vocabulary, and refuse replay precisely rather than throwing a format error or coercing to today's roster. That is ADR 0043's contract and it is the proof the rename cost no format version. Saved as `SCRATCH/baseline-a.measure.json` and `SCRATCH/baseline-b.measure.json`. The tapes themselves were read and never moved or rewritten.

**Step 9, the rendered check. All four required reads obtained.** `pnpm build` then `pnpm exec vite preview` on port 4173, driven with `playwright-cli` at a 900 by 1200 window, every screenshot read.

- **Three offer bodies side by side with three distinct silhouettes: obtained.** `SCRATCH/run-2.png` at tick 391 and `SCRATCH/run-4.png` at tick 631, a live run at `#/?seed=2093383922&levels=4&size=67`. Three treasure-gold bodies at one y, 142 screen pixels apart, drawn as a filled circle, a trapezoid and a tall two-pronged shape.
- **The bank readout when a second carrier dies under a live offer: obtained.** `SCRATCH/run-4.png`, the same frame. The corner stack reads FPS, DEBT 176, TICK 631, SEED 2093383922 PINNED, SIZE 67 PINNED, **BANK 1**, LEVELS 4 PINNED, with the three offer bodies on the field beside it. Tick 631 was aimed rather than caught: `SCRATCH/idlebank.ts` replays the same seed with no input through the execution authority and reports the bank held from tick 539 to 965 and again from 2189 to 2240.
- **A level-one toll showing one forward cone: obtained.** `SCRATCH/U1-at1107.png` at tick 1092, twelve ticks into the toll at 1080, through the pinned-replay path on `slice10-bell1.tape`. One pale wedge opens upward from the grave, symmetric about straight ahead, with nothing to the sides and nothing behind. `SCRATCH/T1-at1105.png` at tick 1090 is the same read two ticks earlier.
- **A level-five toll showing the surround: obtained.** `SCRATCH/T5-at1125.png` at tick 1095, fifteen ticks into the toll at 1080, through the pinned-replay path on `slice10-bell5.tape` at `#/replay?tape=/slice10-bell5.tape&at=1125`. Six wedges wrap the grave with narrow seams between them and one narrow slit dead astern. It reads as cones and not as a circle.

**The pinned-replay path does not pin a tick, and the next agent who wants a toll shot should know why before spending an hour on it.** `?at=` is a fast-forward target: `tapePlaybackSession.ts`'s `begin` sets `session.target` and the replay then plays on in wall-clock time, so the tick on screen when a screenshot lands is `at` plus however long the tooling took. Worse, a bare screenshot burst samples about 120 ticks apart against the bell's 180-tick period, and 120 and 180 share a factor of 60, so the sampled phase can only ever take three values and one of them is exactly tick 45, the toll's last and fully transparent frame. Two bursts of ten found nothing for that reason and not by bad luck. What worked is `SCRATCH/sweep.sh`, which walks `at` in small steps and screenshots once per step, with `SCRATCH/conescan.py` counting `PALETTE.bellRing` pixels in a box around the grave so only the frames that actually hold a toll get read. A toll frame scores thousands against a baseline near 120. Reloading the page between steps does not help and costs more: it restarts the Pixi asset load and the screenshot catches the loading spinner.

**Step 10, the fence, confirmed in the green run.** `src/__tests__/lineAgnosticPolicies.test.ts` appears in `vitest list --filesOnly`, so it is collected by the suite that went green above and not merely present on disk. Run on its own with a verbose reporter it is 11 passing tests: `offer.ts`, `carriers.ts` and `dev/bot.ts` each scanning clean, the two controls on the quoted-name scan, and the six on the constant walk including the narrow `_CAP` exception shown narrow in both directions. The witness partition guard and the boundary fence are inside the same green run.

**Steps 11, 12 and 13 are Mark's and stay open.**

- **Step 11, whether the toll visibly shoves and whether the cone reads as an answer.** The two toll screenshots above are what a frame looks like and they are not the judgement. `T5-at1125.png` is a level-five surround and `U1-at1107.png` is the level-one cone. The measured push behind them is in the step 7 table.
- **Step 12, how fast a stripped player recovers.** This pass did produce strips, so the number is real rather than manufactured. **From the first `weaponStripped` at tick 1655 to the next `offerTaken` at tick 1963 is 308 ticks, 5.13 seconds at 60 Hz**, in both the `bell=3` and the `bell=5` runs. The second and third strips in those runs, at 1746 and 1851, reach the same take at 217 and 112 ticks. The `bell=0` and `bell=1` runs strip once at 1655 and seal without taking another offer, so their recovery is unmeasured rather than slow. These are one script's runs at one seed and they are not the harness.
- **Step 13, whether the gas becomes the new lean.** Untouched by this pass. The conditioned runs press the belch too rarely to say anything.

**Findings from this pass, all of them carried forward rather than fixed here.**

1. **`bell=1` shoves nothing in a conditioned run**, so the plan's step 7 criterion is still half met. Cause established at slice 6 and unchanged; the bot's seed 303 ceiling run is the standing counter-witness and it is green.
2. **Every conditioned run's totals moved since slice 6**, with the offer's mid-run rung at tick 1016 as the measured cause. Nothing to fix; it is the economy the step built.
3. **`?at=` names a fast-forward target rather than a paused tick**, which makes a rendered check of anything short-lived a sweep instead of a shot. Written down above with the tools that worked.

`WITNESS_VERSION` is still 5. `FORMAT_VERSION` is still 2. `GOLDEN` did not move and nothing outside this note was touched.
