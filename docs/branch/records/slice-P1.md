# Slice P1: the field's height per run, in the rules, the recording and the test player (design record T12, A30 to A33)

Follow-along row P1: "Underneath, the game learns that a run's field can be taller than today's, from today's height up to a very tall phone's, and each recording remembers the height its run was played at. Nothing on screen changes yet: every run still plays today's shape until P2. Recordings made before this no longer play."

One slice for one coder, the first half of the old slice P (split on the tech gate's advice, #159 comment 5860078226). It runs after slice A lands. P2 follows it. It does not wait on Mark.

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice, with the exceptions below. This entry is the planning half of the flow. Your scratch folder is `local/tilt-slice-P1/` in the worktree. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read at `c5b1423ce5` with slice A's changes uncommitted in the tree; slice A touches `steering.ts`, `bot.ts` and tests only, so follow the name beside a number that has moved.

## Where this slice departs from the coder contract

Mark ruled on 2026-09-27 that the field's height is chosen per run (design record T12). That is a sim change, so for this slice:

- **The sim is not untouched.** This slice changes files under `src/game`, `src/tape`, `src/dev` and `scripts`, exactly the ones named below and no others. A file under those folders that this entry does not name is a stop. It changes no file under `src/app`, `src/input` or `src/main.ts`: those are P2's.
- **Every existing pin holds, and this slice proves it by measuring.** The default field is 760 tall (A31) and food's freshness scales with the field so it is exact at 760 (A32), so every run that asks for no shape plays today's game: `GOLDEN`, `WITNESS_VERSION`, `FORMAT_VERSION`, `READINGS_VERSION`, and the bot's and the harness's lists do not move. If any of them moves, stop and report with the value that moved.
- **One new pin.** `GOLDEN_1168` beside `GOLDEN` in `src/dev/digest.ts`: the digest scenario on a 1168 field, measured once on this slice's tree and pinned, so a path only a tall field takes is guarded by every later slice. Your note gives its value and says it is new, not moved.

The main session amends the contract's "The sim is untouched (T10)" and "A pin is never moved in silence" lines for P1 before dispatching it (the handoff's "What is left").

## What this slice builds, and why

Mark: "When we're on a phone I expect that the game will fill the whole screen... since different phones have different sizes, we need to make sure it can work no matter what on a mobile screen in portrait mode." And a replay of a run recorded on one phone "needs to make the viewport the same size as the recording of the device it was made on."

Today the field is one fixed 540 by 760 rectangle (`src/game/field.ts:10-11`). P1 makes the height a starting condition of the run: every rule that meets the field's bottom edge reads the run's own height, the tape's header records it, and a replay rebuilds the run on it. P2 then reads the height off the screen and draws it. Between P1 and P2 the app still starts every run at 760.

When it works:

- A run asked for a height from 760 to 1260 plays on a 540 wide field of that height: things fall past its own bottom edge, the grave is held inside it and starts 152 units above its bottom edge (A32).
- A run asked for no height plays on 760 and is the same run it is today, to the tick (A31).
- Food keeps its freshness over the same share of the run's field on every height: a corpse crossing half the field loses its whole freshness, on 760 and on 1168 alike (A32).
- The tape's header records the height as `fieldHeight`; a replay rebuilds the run on that field and verifies. A tape recorded before this slice is refused naming the row (A33).
- A batch takes `field=<height>`; every report names the height its runs played on, and runs or batches of two heights are never pooled or compared without saying so (A31, #107's rule).

## Rulings this slice builds

T12, A30, A31, A32 and A33 in `apps/hungry-grave/docs/design/tilted-view.md`. Read each; A32's reader table is repeated below with the code it binds.

## Module boundaries and public interfaces

**`src/game/field.ts`.** Owns the field's shape. After this slice it exports, in one block at the end:

- `FIELD_WIDTH = 540`, unchanged.
- `SHORTEST_FIELD_HEIGHT = 760` and `TALLEST_FIELD_HEIGHT = 1260`, with JSDoc stating A30's evidence.
- `interface Field { readonly width: number; readonly height: number }`.
- `fieldOfHeight(height: number): Field`: `{ width: FIELD_WIDTH, height }`. A height that is not a whole number or lies outside the two bounds throws: its callers hand it a value our code resolved or a tape value already checked at the edge, so a bad one is a bug.
- `SHORTEST_FIELD: Field`, `fieldOfHeight(SHORTEST_FIELD_HEIGHT)`.
- `FieldPoint`, unchanged.
- `FIELD_HEIGHT` stays exported in this slice for `src/app` alone, which P2 owns and which reads it at the lines P2's entry lists. Its JSDoc says so and names P2 as the slice that deletes it. A fence in `src/__tests__/boundary.test.ts` asserts no file under `src/game`, `src/tape`, `src/dev` or `scripts` imports it.

**Transitional defaults for P2's callers.** Two functions gain the field and have a caller under `src/app` that this slice may not touch: `capsFor` (called at `GameScreen.ts:324`, `ReplayScreen.ts:146`, `FrameBudgetScreen.ts:160`) and `shareOverMouth` (`tip.ts:65`, called at `step.ts:135` and `FieldRenderer.ts:135`). Each takes the field as a trailing parameter defaulting to `SHORTEST_FIELD`, with JSDoc naming P2 as the slice that removes the default. Every caller under `src/game`, `src/tape` and `src/dev` passes the field explicitly. No other function gets a default.

**`src/game/run.ts`.** `StartingConditions` (`:97-148`) gains `readonly fieldHeight: number` with JSDoc (T12, ADR 0027). `resolveConditions` (`:356-372`) resolves `asked.fieldHeight ?? SHORTEST_FIELD_HEIGHT`. `RunState` (`:158-265`) gains `readonly field: Field`, set in `createRun` (`:387-447`) from `fieldOfHeight(asked.fieldHeight)`; `capsFor` and `createGrave` take it.

**`src/game/tuning.ts`.** `FRESHNESS_SECONDS` (`:37`) becomes `freshnessSecondsFor(field: Field): number`, the same derivation on the run's height: `field.height / 2 / (SCROLL_SPEED * TICK_HZ)` (A32). At 760 it is exactly today's 10. Its JSDoc keeps the concept doc's reason (a mid-field kill reaches the bottom edge as a nearly empty scrap, `docs/design/game-concept.md`, the core loop) and adds that it is per field so that stays true on every height. Readers: `corpses.ts:58` (`FRESHNESS_PER_TICK`, which becomes a function of the field and is read where freshness falls, `:387`, with the run's field), `caps.ts:260` and `:267` (the corpse cap's two freshness terms, now of the run's field), and the export at `tuning.ts:145`.

**`src/game/grave.ts`.** `START_X` and `START_Y` (`:28-29`) become `startingPlace(field: Field): FieldPoint`: x `FIELD_WIDTH / 2`, y `field.height - START_ABOVE_BOTTOM` with `START_ABOVE_BOTTOM = 152` (760 times 0.2). `createGrave` takes the field.

**`src/game/caps.ts`.** `capsFor(tuning: TuningRecord, field: Field = SHORTEST_FIELD): Caps` (`:276-280`). `TRANSIT_SECONDS` (`:76-77`), `FIELD_SPAN` (`:151-153`) and the freshness terms of `corpseCap` (`:265-269`) become functions of the field; `mobCap`, `mobFireCap` and `corpseCap` take it. `corpseCap` adds `mobCap` (`:266`), so all three caps grow with the field.

**`src/game/tip.ts`.** `insideTheField` (`:22` onward, reading `FIELD_HEIGHT` at `:33`) and `shareOverMouth` (`:65-72`) take the field; `step.ts:135` passes the run's.

**`src/tape/startingCondition.ts`.** A row `FIELD_HEIGHT_ROW = 'fieldHeight'`: written by `startingConditionBlock` (`:49-60`) right after the size; named by `known` (`:124-129`) and the required list (`:194`); counted by `countsWholeThings` (`:142-143`); refused out of bounds beside `lockRefusal` (`:178-181`) with "fieldHeight is written as <v>, outside the 760 to 1260 this build plays"; returned by `resolveStartingCondition` (`:305-344`). `FORMAT_VERSION` (`src/tape/wireCodes.ts:68`) and `WITNESS_VERSION` (`src/game/witness.ts:235`) do not move (A33).

**`src/dev/rigs.ts`.** A rig row is a named starting condition (`CONTEXT.md`, Rig), so each row's `conditions` (`:88-120`) states `fieldHeight: SHORTEST_FIELD_HEIGHT`. `rigOf` (`:158-170`) keeps matching on the size, the levels and the score, and its JSDoc says why the height is not one of them: the height is banded beside the rig, as the tuning candidate already is (`measure.ts`'s `Provenance`, `:84-100`; `batchReport.ts:1042-1054`, `:1176`), so `field=1168` on the maxed rig is the maxed rig on a 1168 field and never a nameless condition. A figure names both.

**`src/dev/measure.ts`.** `Provenance` (`:84` onward) gains `readonly fieldHeight: number`, set in `provenanceOf` (`:269-288`) from the condition. `isConditioned` (`:246-249`) is unchanged: a person's run on a tall phone is not a pinned condition, it is a different field, and the field is banded, not excluded.

**`src/dev/batchReport.ts`.** The batch identity (`BatchOrigin` and its accumulator, `:67-93`, `:1042-1054`) gains `fieldHeights`, collected beside `rigs` at `:1176`. A report whose runs span more than one height refuses to aggregate them, naming both heights, the way ADR 0019 refuses rather than degrades: figures from two fields are never pooled.

**`scripts/batch.ts`.** `field=<height>` beside `rig=` and `tuning=` (`:5`, `:67`, `:430-440`), parsed at the edge (a whole number from 760 to 1260, else the usage line), handed into the rig's conditions as `fieldHeight`; absent means 760. The report's header names the height. `scripts/record-conditioned.ts` takes the same argument. `scripts/compare-batches.ts` reads `fieldHeights` off both identities (beside `rigs`, `:81`) and refuses a comparison whose two sides played different heights, naming both. `scripts/rebatch.ts` refuses a pre-P1 tape through the same starting-condition refusal and says so.

**`src/dev/digest.ts`.** `GOLDEN_1168` beside `GOLDEN` (`:522`): `runScenario` on a 1168 field, pinned from a measured run. Exported at `:555`.

## Every reader of `FIELD_HEIGHT` in this slice's files, and what each becomes (A32)

`FIELD_WIDTH` and every one of its readers are unchanged. `FIELD_HEIGHT`, by reader:

| Reader | What it is | Becomes |
| --- | --- | --- |
| `game/corpses.ts:409` | cull past the bottom edge | the run's height |
| `game/tuning.ts:37` `FRESHNESS_SECONDS` | time food keeps its value while it crosses the field | per field, `field.height / 2 / (SCROLL_SPEED * TICK_HZ)`, exact at 760 |
| `game/mobFire.ts:222` | cull | the run's height |
| `game/grave.ts:29` `START_Y` | a fraction of the height | `field.height - START_ABOVE_BOTTOM` (152) |
| `game/grave.ts:121` | the grave's hold | the run's height |
| `game/grave.ts:289` | room below for an offer | the run's height |
| `game/caps.ts:77` `TRANSIT_SECONDS` | a bound on a body's stay | the run's height |
| `game/caps.ts:152` `FIELD_SPAN` | a bound on a shot's flight | the run's height |
| `game/mobs.ts:513` | a carrier's clamp | the run's height |
| `game/mobs.ts:742` | cull | the run's height |
| `game/stage/setPiece.ts:73` `OPENS_BELOW` | a quarter down, so the pour fits above the bottom edge (`waves.ts:1236-1244`) | `SHORTEST_FIELD_HEIGHT * SET_PIECE_OPEN_DEPTH` (190 below the top, today's) |
| `game/stage/setPiece.ts:94` `sweptTo` | one traversal across the whole fall | the run's height |
| `game/stage/setPiece.ts:242` | cull | the run's height |
| `game/tip.ts:33` | food clipped at the bottom edge | the run's height |
| `game/invariants.ts:404`, `:420`, `:522` | bounds | the run's height |
| `game/lines/territory.ts:590` | cull | the run's height |
| `game/lines/wisps.ts:284` | cull | the run's height |
| `game/lines/skullStream.ts:256` | cull | the run's height |
| `dev/syntheticField.ts:38` | a fixture's grid over the field | the height of the run it builds for |
| `dev/bot.ts:90` `HOME` | the bot's home, today the grave's start | `startingPlace(run.field)` |
| `dev/bot.ts:156` | the bot's clamp, mirroring the grave's hold | the run's height |
| `dev/harnessRun.ts:53` `SLOWEST_DESCENT_TICKS` | a run's tick budget | the run's height |
| `dev/readings/stripsLanded.ts:66` | the gap under the grave | the run's height |
| `dev/readings/gravePath.ts:19` `BOTTOM_EDGE_MARGIN` | a margin in units | `SHORTEST_FIELD_HEIGHT / 10` (76, today's) |
| `dev/readings/gravePath.ts:33` | the gap under the grave | the run's height |
| `dev/readings/upfieldTraffic.ts:45` `BAND_COUNT` | bands to reach the top | the run's height, counted when the reading starts |
| `dev/readings/groundHeld.ts:40`, `:81` | the grid and the share of the field | the run's height |

A function that reads the run's height and does not hold the run gains the field as a parameter, never a module-level lookup. The test files under `src/game`, `src/tape`, `src/dev` and `scripts/__tests__` that name `FIELD_HEIGHT` take the bound or the run's field by the same table; each is a form change under the contract's stop rule, listed in your note by file with the count. The test files under `src/app` and `src/input` are P2's and keep `FIELD_HEIGHT` until then.

**Stale comments this slice owns**, each restated for the run's own height and nothing else changed in its file unless the table names it: `game/invariants.ts:388` ("FIELD_HEIGHT minus its size"), `game/mobs.ts:503` ("meets cullCorpses' edge at FIELD_HEIGHT"), `dev/readings/gravePath.ts:27`, `dev/readings/stripsLanded.ts:31`, `game/witness.ts:244` ("Math.round(760 * 1e9)": the claim holds for every height to 1260 and names the tallest), `game/math.ts:10` ("in a 540 by 760 field": 540 by up to 1260). `witness.ts` and `math.ts` change by that comment alone, and neither the fold nor `WITNESS_VERSION` moves.

## What must stay unchanged

- Every rule at 760, to the bit: `760 * 0.8` and `760 - 152` are both exactly 608, `760 * 0.25` is 190, `760 / 10` is 76, and `760 / 2 / 38` is today's freshness of 10 seconds.
- `GOLDEN`, every version, and the bot's and the harness's lists (measured below).
- The width, `BASE_SPEED`, `SIZE_CEILING`, the belch's reach, every formation, the scroll, the stage's clock, the director.
- Every file under `src/app`, `src/input` and `src/main.ts`.

## Pins

Measured, never assumed. The suite's pinned lists and `GOLDEN` must pass unchanged. Copy slice A's per-seed probe (in `local/tilt-slice-A/`) into `local/tilt-slice-P1/` under a name carrying the slice, run it on this tree, and compare every seed's ticks, ending, kills, offers, swallows, sections and faults field by field with slice A's result. A difference is a stop and report with the seed and the field. `GOLDEN_1168` is measured, pinned, and its value given in your note.

## Planned tests

Pin every name as a `test.todo` first against stubs that return a wrong value of the right type. Expected values come from this entry and the design record, never from running the code, except the one new pin, which is a measurement by definition. Each test cites the ruling it enforces.

`src/game/__tests__/field.test.ts` (new):

1. the field is 540 wide and from 760 to 1260 tall, in whole units (A30)
2. a field of a supported height carries that height; a height of 759, 1261 or 900.5 throws (A30, a bug)

`src/game/__tests__/run.test.ts`:

3. a run asked for no height plays on 760 and records 760 in its starting condition (A31, ADR 0027)
4. a run asked for 1168 has a 540 by 1168 field and its grave starts 152 above the bottom edge, at (270, 1016) (A32)

`src/game/__tests__/caps.test.ts`:

5. on the shortest field the caps are today's: mobs, mob fire and corpses equal the figures `capsFor(DEFAULT_TUNING)` gives at `c5b1423ce5` (read them from that tree and write them in the test with the commit named) (A31)
6. on a 1260 field all three caps are larger than on 760: a body's stay and a shot's flight grow with the field, and the corpse cap adds the mob cap and a freshness window that grows with it (`caps.ts:265-269`) (A32)

`src/game/__tests__/tuning.test.ts` and `corpses.test.ts`:

7. freshness is 10 seconds on the 760 field and 1168 / 76 seconds on the 1168 field (A32)
8. a corpse that crosses half the run's field loses its whole freshness, on the 760 field and on the 1168 field: stepped at the scroll for `height / 2` units, its freshness goes from 1 to 0 within one tick's worth (A32; the concept doc's "a mid-field kill reaches the bottom edge as a nearly empty scrap")

`src/game/__tests__/grave.test.ts`, `mobs.test.ts`, `mobFire.test.ts`, `corpses.test.ts`, `tip.test.ts`, `src/game/lines/__tests__/skullStream.test.ts`, `territory.test.ts`, `wisps.test.ts`, and `src/game/stage/__tests__/setPiece.test.ts`, one test in each for its own thing:

9. the grave is held inside the run's own field: pushed down on a 1168 field it stops at 1168 less its size (A32)
10. each thing culled at the bottom edge (a mob, a shot, a skull, a wisp, a patch, a corpse, the set piece) is still alive at y 900 on a 1168 field and gone once past 1168 and its own extent (A32)
11. food lying across the bottom edge counts only its part inside the run's field toward the mouth: a corpse straddling y 1168 on a 1168 field and one straddling y 760 on a 760 field (A32, `shareOverMouth`)
12. the set piece opens 190 below the top on a 760 and on a 1260 field, and its sweep reaches its far bound as it reaches the run's own bottom edge (A32)

`src/game/__tests__/invariants.test.ts`:

13. a body at y 1000 is in bounds on a 1168 field and out of bounds on a 760 field (A32)

`src/tape/__tests__/startingCondition.test.ts`:

14. the block carries the run's field height under `fieldHeight`, after the size (A33)
15. a block naming a field height resolves to a condition on that field (A33)
16. a block that names no field height is refused as a condition this build requires: "fieldHeight is a starting condition this build requires and this tape does not name" (A33, T12: old tapes stop replaying)
17. a field height of 700, 1300 or 900.5 is refused, naming the row (A33)

The file's fences over the block's required rows take the new row; list the ones that change.

`src/tape/__tests__/playback.test.ts`:

18. a run on a 1168 field recorded and replayed headlessly verifies at every checkpoint (T12)

`src/dev/__tests__/rigs.test.ts`:

19. every rig row starts on the shortest field, and `rigOf` names the maxed rig for a maxed condition on a 1168 field as on a 760 one (A31; the height is banded beside the rig)

`src/dev/__tests__/measure.test.ts`:

20. a tape's provenance carries the field height its run played on, and a person's run on a 1168 field is not counted as conditioned (A31, #107)

`src/dev/__tests__/batchReport.test.ts`:

21. a batch report's identity lists the field heights its runs played on, and a report over runs of two heights refuses to aggregate them, naming both (A31, #107: figures from two starting conditions are never banded)

`scripts/__tests__/batch.test.ts`:

22. `field=1168` plays every seed on a 1168 field and the report names it; no `field=` plays 760; `field=700` and `field=abc` print the usage line (A31)

`scripts/__tests__/compare-batches.test.ts`:

23. two reports of different field heights are refused as a comparison, naming both heights (A31)

`src/game/__tests__/digest.test.ts`:

24. the digest scenario on the 1168 field matches `GOLDEN_1168` (T12; the tall field's own pin)

`src/dev/__tests__/bot.test.ts`:

25. the bot plays a whole run on a 1168 field to an ending with no invariant fire, for seed 101, under the maxed and the birthright rigs; each run's ending and ticks go in your note (feature flow: a sim-bearing change runs the loop end to end; T12's accepted cost that tuning tests several shapes)

`src/__tests__/boundary.test.ts`:

26. no file under `src/game`, `src/tape`, `src/dev` or `scripts` imports `FIELD_HEIGHT` (P2 deletes it; until then only `src/app` may read it)

## Verification steps

1. The coder contract's floor. Actor: the agent.
2. **The pins, measured**, as "Pins" says. Actor: the agent.
3. **The diff is the plan.** `git diff --stat c5b1423ce5 -- apps/hungry-grave/src apps/hungry-grave/scripts` lists only the files this entry names, their tests, and slice A's files. No file under `src/app`, `src/input` or `src/main.ts` beyond slice A's. Paste it. Actor: the agent.
4. **Old tapes are refused by name.** Run `scripts/measure.ts` on `local/tilt-shots/tapes/won-maxed-1000.tape`: it reports the header and refuses to replay, naming `fieldHeight`. Paste what it printed. Actor: the agent.
5. **The tapes, recorded fresh.** Move the two tapes in `local/tilt-shots/tapes/` to `local/tilt-shots/tapes/pre-P/`. Re-record `won-maxed-1000.tape` and `sealed-birthright-1000.tape` with the README's own commands (no `field=`); run `local/tilt-shots/tape-ticks.ts` on each and show that the last tick and every section and boss-kill tick are the README's (23548 and 19991, and the section ticks listed there). Record the same two seeds and rigs with `field=1168` as `won-maxed-1000-h1168.tape` and `sealed-birthright-1000-h1168.tape` and print their ticks. Add all four to the README's "The tapes" with their commands and ticks. The replay screen shows these at 760 until P2; P2 checks them rendered. Actor: the agent.
6. **Short batches at two tall heights.** `scripts/batch.ts steady-far 1000 8 <full path> rig=maxed field=1168` and the same with `field=1260`: every run ends with no fault, and each report's header names its height. Paste each header and faults line. Then `scripts/compare-batches.ts` on the two reports: it refuses, naming both heights. Not a tuning read. Actor: the agent.

No rendered check: nothing on screen changes until P2.

## Done when

Every planned test is green, the pins are measured unchanged, `GOLDEN_1168` is pinned, every verification step has a result in `docs/branch/records/slice-P1-note.md`, and the working tree holds the code, the tests and the note, uncommitted.
