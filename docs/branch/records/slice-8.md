# Slice 8: mobs arrive across the whole top of the screen, and a whole run watched (design record T8, A4, and #159's done-when)

**Dropped, 2026-09-27.** Mark ruled the tilt is drawing only (design record T10): spawns stay as authored and the play layer draws the field's full width across the top row (T8, A18). The whole run watched end to end moves to slice 16. Kept as the record of the plan; never dispatch it.

Follow-along row 8: "Mobs arrive across the whole top of the screen, corner to corner, as thick per patch of ground as they are today. Then a whole run is recorded, replayed and watched from the first moment to the end, ready for Mark to play on his phone."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. Your scratch folder is `local/tilt-slice-6/` in the worktree; reuse the capture tool in `local/tilt-shots/` (slice 1). All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read on the tree at `517ee0753e`; slice 6 renamed `FIELD_WIDTH` to `VIEW_WIDTH` and slice 7 moved the formations' entry rows, so follow the name beside a number that has moved.

## What this slice builds, and why

After slice 7 the field is the trapezoid the camera sees, but every formation still lays its bodies across the middle row's 540 units (`src/game/stage/formations.ts:103-188`), so the far row's outer 58 units on each side, the screen's top corners, never receive a body. Mark ruled that mobs fill the whole screen (T8), and #159 says spawns cover the full far span at today's density per unit of ground.

The rule (A4): anything authored as spread across the field's width is authored against the middle row and laid across the far row at the same spacing. The far row is `FAR_SHARE` = 1.216440 times the middle row, so a Drip, a Rain and a Wall of `n` lay `round(n * FAR_SHARE)` bodies across the far row, and so does the Undertaker's curtain with its clods. A File keeps its count, and its lane is drawn across the far row. A V keeps its count and its shape and stays centred. A Pincer keeps its count and its shape and leads from the far row's corners. The count stays on the wave (ADR 0047's absorbed 0006); what changes is the width it is laid across. The mob cap prices what is placed, not what is authored. The director's purse charges a card as authored, and the section ceiling stays as authored (A4, "What does not scale").

Then the step's end-to-end proof: a whole run recorded under the finished build, replayed in the rendered game from its first tick to its last, watched and photographed, with a live run checked on a touch viewport, so the build is ready for the deploy and Mark's play.

When it works, a player sees:

- Rain and drips arriving across the whole top of the screen, into both top corners.
- A Wall still a wall: its bodies at today's spacing, edge to edge across the far row, still closed to a grave without a belch.
- A V still a V in the middle, a File down one lane anywhere across the top, a Pincer from the two top corners.
- About a quarter more bodies on the screen at once than before slice 7, smaller at the far end, the near third sparser than the far third.
- The Undertaker's curtain across the whole top of the screen, with its one way through the width of the grave.

## Parts of the code this slice touches

**`src/game/field.ts`.** `FAR_SHARE`: `(FIELD.farRight - FIELD.farLeft) / VIEW_WIDTH`, which is 1.2164403599173166. Its readers: `formations.ts` and `undertaker.ts` below, through `acrossTheFarRow`.

**`src/game/stage/formations.ts`.** Two public additions and four placements:

- `acrossTheFarRow(count: number): number`: `Math.floor(count * FAR_SHARE + 0.5)`, and never below one for a count of one or more. Plain arithmetic.
- `bodiesPlaced(formation: FormationName, count: number): number`: how many bodies `place` lays for a wave or a card of this count. `acrossTheFarRow(count)` for `drip`, `rain` and `wall`, the count itself for `file`, `v` and `pincer`.
- `drip` (`:103-111`): `bodiesPlaced` bodies evenly across the far row, `FIELD.farLeft + span * (index + 0.5) / n`.
- `file` (`:114-124`): its lane drawn across the far row less `EDGE_MARGIN` (`:63`) on each end. One draw, as today.
- `chevron` (`:127-140`): centred on `VIEW_WIDTH / 2`, which is the far row's middle too; unchanged.
- `pincer` (`:143-160`): leads at `FIELD.farLeft + EDGE_MARGIN` and `FIELD.farRight - EDGE_MARGIN`.
- `rain` (`:168-176`): `bodiesPlaced` bodies, each x drawn across the far row less the margin. One draw per body, as today.
- `wall` (`:179-188`): `bodiesPlaced` bodies at `span / n` spacing from `FIELD.farLeft`.

**Callers of `place`, each of which reads the placed orders' length rather than the wave's count wherever it counts bodies:**

- `src/game/stage/stage.ts:336-356` `spawnWave`: `waveCarriers(wave.carries, wave.count)` (`:341`) becomes `waveCarriers(wave.carries, orders.length)`, so a carrying wave's carrier is still its middle body (`src/game/carriers.ts:66-69`). One carrier per carrying wave, so the carrier schedule (`carriersScheduled`) does not move.
- `src/game/director.ts:348` `directorSpend`: the card's orders are what it lays; `cardCost` (`src/game/stage/waves.ts:1038-1039`) charges the card as authored and does not change.
- `src/dev/digest.ts:218`: a File, whose count does not scale, so its placement is unchanged.

**The caps (A4), which must price what is placed:**

- `src/game/stage/waves.ts:1463-1464` `bodiesOf`: `bodiesPlaced(wave.formation, wave.count)` for a wave of the type asked about.
- `src/game/stage/waves.ts:1078-1082` `largestCard`: the largest `bodiesPlaced` over the cards.
- `src/game/stage/waves.ts:1348-1370` `wavesUnderThePour`: it builds waves with a scaled count and hands them on to be priced; check that the pricing it feeds reads `bodiesOf`, and say in your note.
- `src/game/caps.ts` `peakLive` and `mobCap` (`:129-138`) then price the placed bodies with no change of their own. The caps are bug detectors (ADR 0056's amendment), so a cap that binds in any test is a stop and report.

**`src/game/bosses/undertaker.ts`.** `gapCentre` (`:199-210`) walks the gap across the far row: `FIELD.farLeft + span * walked(...)`, clamped to the far row less half the gap. `throwCurtain` (`:218` onward) lays `acrossTheFarRow(row.clods)` clods across the far row less the gap, at `(span - gap) / n` spacing from `FIELD.farLeft`, so the spacing between clods is today's and the one way through is still the gap the grave's width asks for (`curtainGap`). The spiral arm (`armSweptX`) is untouched.

**Nothing else.** The director's purse, its cards' costs, the section ceilings, the standing waves' rates, the stage's authored counts, and every drawing. The dressing already spans the ground the camera sees (slice 2).

## Pins

- `GOLDEN` (`src/dev/digest.ts`): expected to hold. Its File does not scale and its placement is overridden (`digest.ts:218-220`), and its window's only stage wave is a Drip of one, which lays one body at the far row's middle, x 270, exactly where it lies today. If it moves, stop and report.
- The bot's seed lists (`src/dev/__tests__/bot.test.ts`): re-measured, never loosened, each move explained with the seeds' runs read. `REACHES_VICTORY_MAXED` must keep at least one seed.
- `WITNESS_VERSION`, `FORMAT_VERSION` and `READINGS_VERSION` hold: no fold, no wire and no reading's definition changes.

## Planned tests

Pin every name as a `test.todo` first, against stubs. Every sim test steps through `src/dev/stepping.ts`. Expected values are worked by hand from `FAR_SHARE` = 1.2164403599173166 and the far row -58.438897177675415 to 598.4388971776755. Each test cites the ruling it enforces.

`src/game/stage/__tests__/formations.test.ts`:

1. a count across the far row is the middle row's count scaled by 1.216440 and rounded: 1 stays 1, 4 becomes 5, 7 becomes 9, 10 becomes 12 (A4)
2. a Drip of 10 lays 12 bodies evenly across the far row, the first at -31.068989 and the last at 571.068989
3. a Drip of one stands at the far row's middle, x 270
4. a Rain's bodies land anywhere across the far row, less the edge margin, and it lays the scaled count
5. a Wall keeps the middle row's spacing across the far row: a Wall of 10 lays 12 bodies 54.739816 apart, where today's lays 10 bodies 54 apart
6. a File keeps its count, and its lane can land anywhere across the far row less the edge margin
7. a V keeps its count and its shape, centred on the far row's middle
8. a Pincer keeps its count and leads from the far row's two corners
9. `bodiesPlaced` equals the length of what `place` lays, for every formation and every count from 1 to 12

`src/game/stage/__tests__/stage.test.ts`:

10. a carrying wave's carrier is the middle body of what it lays, not of what it authored

`src/game/__tests__/caps.test.ts`:

11. the mob cap prices every wave and card at the bodies it lays, and no cap binds in a full stage played with the invariants on

`src/game/bosses/__tests__/undertaker.test.ts`:

12. the curtain spans the far row with its one way through, at the middle row's spacing between clods
13. the curtain's way through walks across the far row and is always the width the grave asks

`src/dev/__tests__/bot.test.ts` or a new cross-cutting test named for the behaviour, `src/__tests__/mobsFillTheScreen.test.ts`:

14. over a full stage played by the dodge bot, bodies arrive in every eighth of the far row (T8)
15. over the same stage, live mobs stand at some tick in the top tenth of the field and within a tenth of the far row's span of each of its ends (T8)

**Existing tests whose premise this changes.** Formation tests that assert a count of bodies equal to the authored count for a Drip, a Rain or a Wall, or positions across 0 to 540, assert the middle row that A4 lays across the far row. Re-express each against `bodiesPlaced` and the far row, keeping its name and its promise, and list each in your note. Any other test that goes red is a stop and report.

## Verification steps

1. The coder contract's floor. Actor: the agent.
2. **The "after" batch.** Actor: the agent. The four commands in `docs/branch/handoff.md` ("The harness batch") into `local/tilt-after-slice-8/batches`, compared with slice 7's after-batch by `scripts/compare-batches.ts`, written as `docs/branch/records/after-slice-8-batch.md`. The figure A4 predicts: arrivals per section rise by about 1.22 for the Drip, Rain and Wall share of each section and not at all for the rest; report the ratio per section beside the prediction, and the rest of slice 5's figures, with food lost at a side, which A4 expects to rise with about a quarter of each far-row Drip, Rain and Wall walking off the sides before the grave's starting row. Figures only, no verdict.
3. **A whole run, recorded and watched.** Actor: the agent. Take one won run from the maxed batch and one sealed run from the birthright batch, both verified by the batch. Open each in the replay screen through the capture tool and step it from tick zero to its last verified tick, shooting at tick zero, the busiest tick of each section, the first tick of each boss, the tick of the Undertaker's death, the ending scene at its middle, and the last frame. Read every shot, and say for each: the ground leans; bodies are drawn in the top tenth of the column, in both top corners, and in the outer tenth of each side at the top, middle and bottom rows; the grave's whole lip is on the screen; the hole is the flat dark opening; mob fire draws over everything. Say that the replay verified to its end, and at which tick each ended.
4. **A live run on the glass.** Actor: the agent. In the built app on a 390 by 844 touch viewport, repeat slice 4's drag check at the top, middle and bottom, and its W check, under the new field. Then play a live run for two minutes with scripted drags and keys, and say it ran without an error or a warning in the console.
5. **Frame budget.** Actor: the agent. The frame budget tool's figure against slices 2 and 3's.
6. **Mark's play on his phone.** Actor: Mark, after the main session deploys to https://hungry-grave.vercel.app. The on-device glass check slice 4 names, and the list in the design record's "For Mark's next play". The agent never claims the feel is right.

## Done when

Every planned test is green, every changed test is listed, the agent's verification steps have results in your note, the pins moved only as this entry says, and the working tree holds the code, the tests, `docs/branch/records/after-slice-8-batch.md` and `docs/branch/records/slice-8-note.md`, uncommitted.
