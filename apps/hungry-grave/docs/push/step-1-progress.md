# Step 1 progress: after slice 7

Written for the agent taking slice 8. The plan is `docs/design/step-1-progression-dispatch.md`; everything below is what it does not say or what has moved since it was written.

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

Slice 0 recorded the baseline tapes and made no commit.

## 2. GOLDEN moves

- Slice 1: no move, which is the slice's own test. A rename that moved the digest would have been the wrong rename.
- Slice 2: no move. The roster defaults to the whole pool, so every run resolves exactly what it resolved before.
- Slice 3: two fields, `levels.territory` 1 to 0 and `checksum` -1401997495 to 1634744137. Every other field held, the two kills included. `drawn.territory` was already 0 because the 832-tick cadence contains no lay in a 600-tick scenario.
- Slice 4: no move, and this one is worth knowing rather than assuming. The scenario's surge had already been spent by tick 600 (`lines.surgeVolleys` is 0 at the fold) and its one swallowed corpse was fresh, so the fold cannot see freshness-scaled volleys at all. The golden digest is blind to slice 4, and the bot test is what caught it instead.
- Slice 5: no move. The scenario never belches.
- Slice 7: one field, `checksum` 1634744137 to -1694949037. Every other field held, the two kills and `drawn.drops` 0 included. The move is the fold's own: it stopped folding `killsSinceDrop` and `dropsPaid` and started folding each live mob's `carries`. The scenario's two kills are scripted mobs that carry nothing, so no drop is paid, and the two ramp rows inside the 600 ticks carry a carrier each without drawing from any stream.
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

Received mid-slice-4 from the dispatching session. **Corrections 1 and 2 landed in the plan file and the code in slice 6 (`b93d68913d`); 3 and 4 are still open, for the agents taking slices 7 and 8.** Each is applied to the plan file in the same commit as the slice it changes.

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
- **Step 5, GOLDEN and the bot test per slice.** Ran. Section 2 above carries the moves. The bot test's drop band at `bot.test.ts:294-295` has not been rewritten; slice 7 owns it. `REACHES_VICTORY_FROM_THE_CEILING` emptied at slice 6 and section 9 carries the cause.
- **Step 6, headless conditioned run for offer and carriers.** Not run. Slices 7 and 8 own it.
- **Step 7, headless conditioned run for bell cones.** Ran at slice 6, under the corrected criterion. Half met, half unmeetable by this instrument; section 9 carries the three totals and the reason.
- **Step 8, old-tape decode check.** Ran at slice 2 and passed. `measure.ts` on `baseline-a.tape` returns `{"outcome":"rosterNotImplemented","recordedRoster":["soulStream","territory","wisps","bell"]}`: the tape decodes, reports its recorded roster verbatim in its own vocabulary, and refuses replay precisely rather than throwing a format error or coercing. `FORMAT_VERSION` did not move.
- **Step 9, rendered check.** Not run. Slice 8 owns it.
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
