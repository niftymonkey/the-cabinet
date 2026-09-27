# Slice 7: the field is exactly what the camera sees (design record T7, T8, A1, A2, A3, A4, A5, A12, A13, A14, A15, A16, A17)

Follow-along row 7: "The playing field becomes exactly the patch of ground the tilted camera sees: wider at the top, narrower at the bottom. Nothing lives off the screen, mobs and food that drift out the sides just leave, and the grave's whole outline always stays on screen."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. Your scratch folder is `local/tilt-slice-5/` in the worktree; reuse the capture tool in `local/tilt-shots/` (slice 1). All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read on the tree at `517ee0753e`. Slice 4 changed `src/dev/bot.ts` and added two readings, and slice 6 renamed `FIELD_WIDTH` and `FIELD_HEIGHT` to `VIEW_WIDTH` and `VIEW_HEIGHT` everywhere, so the table below names each reader by its old spelling and its line at `517ee0753e`; follow the name beside a number that has moved.

**Before you start:** Mark rules on the column's shape (design record A1) before this slice. The main session's dispatch says which column he chose. If it is not the 540 by 760 column, the six numbers below are recomputed from slice 1's `visibleGround` for his column and every expected value in this entry that depends on them is recomputed by hand the same way; say so in your note.

## What this slice builds, and why

The sim runs in a fixed 540 by 760 rectangle (`VIEW_WIDTH`, `VIEW_HEIGHT` since slice 6, `src/game/field.ts:10-11`). Since slice 2 the column shows more ground than that: the camera sees a trapezoid 656.9 units wide at its far edge, 458.4 at its near edge, from 168.1 units above today's top edge to 2.5 below today's bottom. So today the top band and the top corners of the screen are ground with nothing on it, the grave cannot reach them, and the rectangle's bottom corners are off the screen, where a body can still live and a corpse can still lie. Mark ruled that mobs fill the whole screen (T8) and that the whole grave stays on screen (T7).

This slice makes the sim field that trapezoid, exactly (A2): one fixed shape in field units on every device (A1), six literal numbers in `src/game/field.ts` pinned to the camera by a cross test (A13). Everything that used today's rectangle as an edge moves to the shape; everything that used its width or height as a scale keeps `VIEW_WIDTH` and `VIEW_HEIGHT` (A3). Formations still lay their bodies across today's middle-row width in this slice; slice 8 lays them across the far row.

When it works, a player sees:

- Mobs enter from the top of the screen, above its top row, never popping in below it.
- A body falling near a side walks off the side of the screen as it comes nearer, and is gone once it is wholly past the edge. Nothing lives, fires or lies where the screen cannot see.
- A corpse that walks off the side is lost, the same as one that rides off the bottom.
- The grave can reach the top of the screen and its top corners, and it stops with its whole lip on the screen at every edge and every size, including the narrow bottom corners (A5).
- Skulls and wisps fly until they leave the top of the screen.
- An offer's three bodies and a strip's fallen rungs land where the grave can reach them all the way down (A14).
- The Waking's source enters at the top of the screen and opens and sweeps by its share of the field's length (A15).
- A full stage still plays from its first tick to won or lost with no fault.

## The order of work. It matters.

**The "before" is slice 5's.** `docs/branch/records/before-field-batch.md` holds the figures for today's field, played by the hand slice 4 put on the glass.

**Part A, the field.** Everything below, with its tests.

**Part B, the "after" batch.** With every test green, the four commands in `docs/branch/handoff.md` ("The harness batch") into `local/tilt-after-slice-7/batches` as full paths, compared with slice 5's batch by `scripts/compare-batches.ts`, written as `docs/branch/records/after-slice-7-batch.md` in the form of slice 5's record, with every figure that record carries plus food lost at a side against food lost at the bottom, per kind. Say which figures moved and by how much, beside what A4 predicts: bodies from the top reach the grave's row about 4.4 seconds later, so freshness at the swallow falls; revenants are on the screen longer and fire more, by the tech gate's arithmetic about 12.6 seconds and five shots; food is now lost at the sides. Figures only, no verdict, and no retune: the numbers are #39's.

## Parts of the code this slice touches

**`src/game/field.ts`.** Its public interface becomes:

- `VIEW_WIDTH = 540` and `VIEW_HEIGHT = 760`, renamed in slice 6. Their JSDoc loses slice 6's line that they are still the edges, and keeps what they are: the column the camera draws into, in field units where one field unit draws as one column unit, which is the middle row of the field; every speed and size in the rules is measured against them (ADR 0003's numbers); they are never an edge.
- `interface FieldShape { readonly top: number; readonly bottom: number; readonly farLeft: number; readonly farRight: number; readonly nearLeft: number; readonly nearRight: number }`.
- `FIELD: FieldShape`, the six literals to full double precision, from the design record and slice 1's pinned test 11: top -168.08160441211555, bottom 762.5033003970973, farLeft -58.438897177675415, farRight 598.4388971776755, nearLeft 40.784202319659784, nearRight 499.2157976803402. The JSDoc says the camera decides them and the cross test holds them (A13), and that they are not tuning rows (the design record, "Values are data").
- `fieldLeftAt(y: number): number` and `fieldRightAt(y: number): number`: the side edges as the straight lines through the far and near ends, add, subtract, multiply and divide only. Past the top or the bottom they carry on along the same line; say so in the JSDoc, because a mob above the top edge is measured by other rules.
- `outsideField(x: number, y: number, halfExtent: number): boolean`: wholly past the top, the bottom, or a side edge measured at its own y.
- `FieldPoint` (`:19-22`) unchanged.

**The rename is done.** Slice 6 renamed every `FIELD_WIDTH` and `FIELD_HEIGHT`. This slice moves every edge reader onto the shape, per the table below. After it, a grep of `VIEW_WIDTH` and `VIEW_HEIGHT` finds scale readers only; your note carries that grep.

**Every production reader, and what it becomes.** "Keep" means a scale, left as slice 6 renamed it.

| Reader | Today | Becomes |
| --- | --- | --- |
| `game/tuning.ts:18` `BASE_SPEED` | width / two seconds | keep (the middle row, A3) |
| `game/tuning.ts:37` `FRESHNESS_SECONDS` | half the height at the scroll | keep |
| `game/tuning.ts:53` `SIZE_CEILING` | width / 8 | keep |
| `game/belch.ts:38` `BELCH_BURST_RADIUS` | width / 2 | keep |
| `game/grave.ts:28-29` `START_X`, `START_Y` | 270, 608 | keep (both inside the field) |
| `game/grave.ts:118-122` `containGrave` | opening inside the rectangle | the hold below (A5) |
| `game/grave.ts:289` `fallenRungY` | room below the bottom | `FIELD.bottom` |
| `game/offer.ts:158-161` `groupCentre` | inside 0 to width | inside the near row, less the lip's reach at the ceiling size (A14) |
| `game/corpses.ts:409` `cullCorpses` | past the bottom | past the bottom or wholly past a side edge at its y; the `corpseLost` event (`game/events.ts:400-405`) gains `edge: 'side' \| 'bottom'`, so a batch counts the two apart (the game design gate); `foodLedger` (`dev/readings/foodLedger.ts`) reports lost at a side and lost at the bottom per kind, and every reader of `corpseLost` is listed in your note |
| `game/tip.ts:32-33` the clip | 0 to width, 0 to height | the field's bounding rectangle: `farLeft` to `farRight`, `top` to `bottom` |
| `game/mobFire.ts:218-222` `cullShots` | outside the rectangle | `outsideField` |
| `game/mobs.ts:390-392` `hasEntered` | top edge at 0 | `FIELD.top` |
| `game/mobs.ts:475-485` `fall` | walk in from 0 and width | walk in from the far row's ends (A16) |
| `game/mobs.ts:507-514` `moveInsideBounds` | the rectangle widened by the spawn margin | at or below the field's top, the carrier's centre held on or inside the side edges at its own y, so a push can never carry a body past a slanted side where the cull would take it; above the top, within the far row widened by the spawn margin; along, from the top less the spawn margin to the bottom plus it. The tech gate's finding: the storm's push (`game/stormTargets.ts:331`), the shove (`game/mobs.ts:563`) and the pull all move bodies through this one bound, and its JSDoc (`game/mobs.ts:491-506`) promises "A push is never what takes something out of the world", which a bound wider than the cull would break near the lower sides |
| `game/mobs.ts:736-745` `cullMobs` | below the bottom, or beyond the width by the spawn margin | below the bottom; at or below the top, wholly past a side edge at its y; above the top, beyond the far row by the spawn margin |
| `game/stage/formations.ts:106`, `:119`, `:134`, `:154`, `:171`, `:183` | entry rows at `-ENTRY_DEPTH` | at `FIELD.top - ENTRY_DEPTH`; x is slice 8's |
| `game/stage/setPiece.ts:73` `OPENS_BELOW`, `:93-99` `sweptTo`, `:107-110` placed at y 0, `:242` scrolled past the bottom | the height, and 0 | read along the field's length from `FIELD.top` to `FIELD.bottom`; placed at `FIELD.top`; `FIELD.bottom` (A15) |
| `game/bosses/undertaker.ts:112` `CURTAIN_Y` | 0 | `FIELD.top`; the curtain's x is slice 8's |
| `game/bosses/phases.ts:126` boss x | width / 2 | keep (the middle column, 270) |
| `game/bosses/phases.ts:76` `BOSS_ARRIVAL_Y` | 110 | keep: the boss stands on the same ground and draws a little lower on the screen, about row 174 of 760 rather than 110; it goes on Mark's next play |
| `game/lines/skullStream.ts:193-198` `mountIntoField` | inside 0 to width | inside the field's row at the mount's y |
| `game/lines/skullStream.ts:250-257` cull | outside the rectangle | `outsideField` |
| `game/lines/wisps.ts:278-285` cull | outside the rectangle | `outsideField` |
| `game/lines/territory.ts:445` patch x and y | 0 to width; 0 to the grave's y | the field's row at the patch's y; `FIELD.top` to the grave's y |
| `game/lines/territory.ts:590` closes | past the bottom | `FIELD.bottom` |
| `game/caps.ts:76-77` `TRANSIT_SECONDS` | height | the field's length, `FIELD.bottom - FIELD.top` |
| `game/caps.ts:151-153` `FIELD_SPAN` | the rectangle's diagonal | the bounding rectangle's diagonal: the far row's span and the field's length |
| `game/invariants.ts:398-411` `checkInBounds` | hitbox inside the rectangle | the grave's opening inside the field, each corner against the side edge at its own y, with `BOUNDS_TOLERANCE` |
| `game/invariants.ts:415-422` `within` | the rectangle widened | the bounding rectangle widened |
| `game/invariants.ts:517-523` `checkPatchesInBounds` | beyond the width by the margin; past the bottom | beyond the far row by the margin; past `FIELD.bottom` |
| `dev/bot.ts:90` `HOME` | 270, 608 | keep |
| `dev/bot.ts:140-157` `graveAfter` | the old clamp | the sim's hold, `graveHeldAt` |
| `dev/harnessRun.ts:52-58` `SLOWEST_DESCENT_TICKS` | height plus margin | the field's length plus margin |
| `dev/syntheticField.ts:30-40` `placeOf` | a grid over the rectangle | a grid whose rows run across the field's row at each row's y |
| `dev/readings/stripsLanded.ts:65-66`, `dev/readings/gravePath.ts:32-33` `gapUnderGrave` | height less the grave's rim | `FIELD.bottom` less the grave's rim |
| `dev/readings/gravePath.ts:19` `BOTTOM_EDGE_MARGIN` | a tenth of the height | keep |
| `dev/readings/upfieldTraffic.ts:34` `LATERAL_REACH` | a tenth of the width | keep |
| `dev/readings/upfieldTraffic.ts:45` `BAND_COUNT` | height plus margin | the field's length plus margin |
| `dev/readings/groundHeld.ts:39-40`, `:81` | a grid over the rectangle and its area | a grid over the bounding rectangle, and the fraction of the field's own area, the trapezoid's |
| `app/layout.ts:1`, `:148-169`, `:287` | the column | keep |
| `main.ts:80-81` | the stage's floor | keep |
| `app/screens/game/fieldFrame.ts:19`, `:45` | the frame and the clip | keep (the column) |
| `app/screens/game/FieldRenderer.ts:291` | the hit dim | keep (the column) |
| `app/screens/game/FieldRenderer.ts:426-429` `cancelAt` | inside the rectangle | inside the field: `!outsideField(x, y, 0)` |
| `app/screens/game/BackgroundRenderer.ts:28`, `:74`, `:140-141`, `:318`, `:324` | the ground's tile, and whatever slice 2 left | keep the tile's size (the picture is a repeating tile, A9); anything else slice 2 moved to the camera's visible ground stays there |

If you find a reader this table misses, it is a finding: rule on it by the same test (an edge moves to the shape, a scale keeps its name), and list it in your note under "Where the entry was wrong about the code".

**`src/game/grave.ts`, the hold (A5).** A new named value `GRAVE_REACH_SHARE = 0.3`: how far the grave's drawn lip reaches past its opening, as a share of its width, with a JSDoc naming the lip's bake padding and the cross test. A new public function `graveHeldAt(x: number, y: number, size: number): FieldPoint`: the nearest point to `(x, y)` where the opening widened by the reach on every side lies inside the field. The reach rectangle is `graveWidth(size) / 2 + share * graveWidth(size)` across and `size + share * graveWidth(size)` along. y is clamped first, to `FIELD.top + along` and `FIELD.bottom - along`; then x, against the side edges at the rectangle's nearest row, `y + along`, which is its narrowest because the field narrows toward the bottom. `containGrave` (`:118-122`) becomes a call to it, so `moveGrave` (`:133-137`) and `takeInOwedGrowth` (`:179-190`) hold the grave through it unchanged. Plain arithmetic only.

**`src/__tests__/fieldIsWhatTheCameraSees.test.ts` (new, cross-cutting, spans `src/game` and `src/app`).** The field's six numbers equal `visibleGround(SCENE_CAMERA, COLUMN)`; `GRAVE_REACH_SHARE` equals `BAKE_PADDING.lip`; and the held grave's drawn lip stays inside the column. Test names below.

**`src/game/tuning.ts`, `SIZE_FLOOR`'s comment (`:59-65`, A17).** It gives the floor's reason as a floor grave being about 13 CSS pixels across on a 390-wide phone. Restate it: that figure holds on the field's middle row, and at the top row, where the camera draws at 0.822, a floor grave is about 10.7 CSS pixels across. The value does not move; it is #39's.

**`apps/hungry-grave/CONTEXT.md`.** The Field entry (`:123`) is replaced by the design record's wording, and the Camera entry is added beside it, word for word from "What this replaces, and what stood". The Size ceiling entry (`:31`) says "the field's width": add "measured on the middle row" and nothing else.

## Pins

- `GOLDEN` (`src/dev/digest.ts`, the constant and its dated comments): expected to move. The scenario's scripted File (`digest.ts:217-221`) and the stage's Drip of one enter from `FIELD.top` now, 168 units higher, so they arrive later; and the scenario's two skulls (`GOLDEN`'s comment, "skulls at 2") fly until they pass `FIELD.top` rather than 0, so they live longer. Re-pin it with a dated comment in the form of the ones above it, naming every field that moved, from what to what, and which of these two causes moved it. If a field moves that neither cause explains, stop and report. The digest's boundary guard (`BoundaryExtremes`, `:101-116`) is re-expressed against the field's edges.
- The bot's seed lists (`src/dev/__tests__/bot.test.ts`, `REACHES_VICTORY_FRESH` `:285`, `REACHES_VICTORY_FROM_THE_CEILING` `:345`, `REACHES_VICTORY_MAXED` `:430`, and every other pinned list): re-measured, never loosened. For each that moves, your note says from what to what, with the seeds' runs read for why (the grave's new reach, bodies leaving at the sides, the longer field). `REACHES_VICTORY_MAXED` must keep at least one seed, because slice 8 records a won run; if it would empty, stop and report. The faults stay empty.
- `WITNESS_VERSION` and `FORMAT_VERSION` hold (A12): this slice changes neither what the witness folds nor the bytes. Tapes recorded before this slice stop at their first diverging checkpoint, as ADR 0019 intends; say in your note which checkpoint the capture tool's slice 1 tapes now stop at.
- `READINGS_VERSION` (`src/dev/readingsVersion.ts:249`) moves once if any reading's definition moved (`gapUnderGrave`, `groundHeld`, `upfieldTraffic`'s bands), by the rule in that file's own comment. Read it and apply it.

## What must stay unchanged

- Every scale: the grave's speed, sizes, freshness, the belch's radius, the ceiling.
- The formations' x positions and counts (slice 8), the director, the purse, the ceilings.
- `LAYER_ORDER`, the palette, every drawing from slices 2 to 4 except `cancelAt`'s inside test.
- `src/game` imports nothing from `src/app`: the cross test lives in `src/__tests__`.

## Planned tests

Pin every name as a `test.todo` first, against stubs. Every sim test steps through `src/dev/stepping.ts`, so the invariants run on every tick. Expected values are worked by hand from the design record's table. Each test cites the ruling it enforces.

`src/__tests__/fieldIsWhatTheCameraSees.test.ts`:

1. the field is exactly the ground the camera's column shows, to 1e-9 (A2, A13)
2. the grave's reach share is the lip's bake padding (A5)
3. a grave held against every edge and every corner of the field, at the floor, starting and ceiling sizes, is drawn inside the column: the four corners the grave's renderer hands its perspective meshes (slice 2), read off the renderer and not recomputed, lie inside 0 to 540 by 0 to 760 within 1e-6 (T7)

`src/game/__tests__/field.test.ts` (new):

4. the field's middle row is 0 to 540, the column's own width (A3): `fieldLeftAt(380)` and `fieldRightAt(380)` are 0 and 540 to 1e-9
5. the side edges run straight from the far row's ends to the near row's
6. a body wholly past a side edge at its own row is outside the field, and one straddling it is not
7. a body wholly above the top edge or below the bottom edge is outside

`src/game/__tests__/grave.test.ts`:

8. the grave is held with its opening and its lip's reach inside the field at every edge and corner, at the floor, starting and ceiling sizes (A5)
9. a grave pressed into a near corner stops with its reach touching the side edge at the reach's nearest row
10. a grave already inside the held region does not move: the starting mark stays at (270, 608)
11. a grave that grows against an edge is held as it grows
12. a grave can reach the top of the field, which the old rectangle never let it (T8)

`src/game/__tests__/mobs.test.ts`:

13. a mob wholly past a side edge below the top is gone, and one straddling it is not (A2)
14. a mob above the top outside the far row but within the spawn margin lives, as a pincer's trailing rank must
15. a mob split by the far row's end walks inward until it is on the far row (A16)
16. a mob inside the field falls straight even where the side edge slants in toward it (A16)
17. a mob's arriving beat starts when its top crosses the field's top edge
18. a carried body pushed toward a side below the field's top is held on the side edge at its own y and never culled by the push; above the top it is held within the far row widened by the spawn margin (the tech gate's finding)
19. a belch's burst near a lower side edge takes no body out of the world: every body it shoved is alive the tick after

`src/game/__tests__/corpses.test.ts`:

20. a corpse wholly past a side edge is lost, and its `corpseLost` event says it left at a side; one off the bottom says the bottom
21. a corpse straddling a side edge stays
22. a corpse lying in the strip at a side edge the grave's lip cannot cross is never swallowed, whatever the grave does, and leaves at the side (A5)

`src/game/__tests__/mobFire.test.ts`, `src/game/lines/__tests__/skullStream.test.ts`, `src/game/lines/__tests__/wisps.test.ts`:

23. a shot wholly past a side edge is gone, and a shot at y -100, above the old top but inside the field, lives
24. a skull flies until it is wholly past the field's top edge at -168.08, not the old zero
25. a wisp wholly past a side edge is gone

`src/game/stage/__tests__/formations.test.ts`:

26. every formation's leading body spawns above the field's top edge, so nothing appears on the screen

`src/game/stage/__tests__/setPiece.test.ts`:

27. the source is placed at the field's top edge, and opens and sweeps by its share of the field's length (A15)

`src/game/bosses/__tests__/undertaker.test.ts`:

28. the curtain falls from the field's top edge

`src/dev/readings/__tests__/foodLedger.test.ts`:

29. food lost at a side and food lost at the bottom are counted apart, per kind

`src/game/__tests__/offer.test.ts` and `grave.test.ts`:

30. an offer landing near a side is held inside the near row with the ceiling grave's reach, so each of its bodies can still be swallowed at the bottom of the field (A14)
31. a strip's fallen rungs are held the same way

`src/game/lines/__tests__/territory.test.ts`:

32. a patch is laid inside the field's row at its own y, never past a side edge

`src/game/__tests__/invariants.test.ts`:

33. a grave whose opening crosses a slanted side edge breaks the in-bounds invariant, and one held inside it does not

**Existing tests whose premise the field changes.** A test that asserts today's edges at 0, 540 or 760, by literal or through `FIELD_WIDTH` or `FIELD_HEIGHT` used as an edge, encodes the rectangle that A2 replaces. Re-express it against `FIELD`, keeping its name and its promise, and list each in your note with its old and new numbers. Two whose promise itself is gone are replaced:

- `src/game/__tests__/step.test.ts:965`, `'swallows a corpse on the field side edge under a grave flush to that edge'`: no grave can stand flush to an edge now (A5). It becomes "swallows a corpse at the edge of where the grave can reach when most of it is over the mouth".
- `src/game/__tests__/tip.test.ts:107`, `:117` and `:127` (`'is one for a corpse centred on the field side edge with the grave flush to it'`, `'is one for a power-up centred on the field side edge over a start-size grave'`, `'is one for a corpse centred on the field top edge with the grave flush to it'`): the clip is now to the field's bounding rectangle; each keeps its name and its promise, a share of 1 for food clipped at the edge over a mouth flush to it, with the edge taken from `FIELD`. These are tests of the pure share, so a mouth flush to the bounding rectangle is still a legal input there even though the hold never puts the grave there.

Any other test that goes red is a stop and report. `caps.test.ts`'s derived values move with the field's length and diagonal; each is re-derived by hand in your note.

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. Part B, with its record written.
2. `pnpm --filter hungry-grave test` runs the bot's full stages (`src/dev/__tests__/bot.test.ts`) from the first tick to won or lost with the invariants on. Zero faults.
3. **Rendered check.** Record fresh tapes with the capture tool's recipe (slice 1's tapes stop verifying here). Shoot the grave pressed into each top corner, each bottom corner, the top edge and the bottom edge, at the starting size and at a large size, and a busy tick. Read each shot: the grave's whole lip is on the screen; mobs enter above the top row; a body near a side walks off the side; nothing is drawn outside the column.
4. **The field's grep.** Your note carries the grep of `VIEW_WIDTH` and `VIEW_HEIGHT` across `src`, each hit marked as a scale.
5. **Console.** No error and no warning in a live run.

Open for the human after this slice (say so in your note): whether bodies walking off the sides read as the field, and where the boss now stands on the screen.

## Done when

Every planned test is green, every changed test is listed, every verification step has a result in your note, the pins moved only as this entry says, and the working tree holds the code, the tests, the glossary edit, the `SIZE_FLOOR` comment, `docs/branch/records/after-slice-7-batch.md` and `docs/branch/records/slice-7-note.md`, uncommitted.
