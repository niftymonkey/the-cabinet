# Slice 12: the areas of effect drawn over what they reach, and the ground kept under what lies on it (design record T10, A20, A22)

Follow-along row 12: "The belch's rings, the bell's cones and Territory's patches are drawn exactly over what they hit, and food and patches in the middle of the screen stay on the patch of ground they landed on as it scrolls."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. Load the `pixijs-skills:pixijs` skill before you touch Pixi code, and check every Pixi claim in `node_modules/pixi.js`. Your scratch folder is `local/tilt-slice-12/` in the worktree; the capture tool is `local/tilt-shots/`. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read at `9b125bbc03`; slice 11 changed the placement lines in `StormRenderer.ts` named below, so follow the name beside a number that has moved.

## What this slice builds, and why

After slice 11 the belch's eruption, the bell's cones and Territory's patches are placed on the play layer but still drawn as lying art at one scale. Their edges are sim reaches: whatever lies inside is pushed, damaged or held. On the play layer a field unit along draws as a different number of rows at each row (0.70 at the top to 1.43 at the bottom), so a circle's true image is egg-shaped, and art at one scale misstates the reach. The belch's 270-unit reach around a grave at its start runs from row 272.5 to past the bottom. Each area is drawn as the exact image of its sim shape (A20).

The ground's scroll is the sim's scroll in ground units (`GROUND_SPEED`, `BackgroundRenderer.ts:71`), so a patch stays on the ground it landed on (Mark's slice 13b ruling, quoted in that constant's JSDoc). On the play layer a field unit along is 1.224454 ground units, so the ground must scroll that much faster for a patch on the middle column to stay on its ground (A22). Off the middle column a lying thing keeps its x while the ground spreads outward under it, tilt 9's own behaviour; slice 15 measures how far.

## Parts of the code this slice touches

**`src/app/screens/game/StormRenderer.ts`, the three areas (A20).** Three drawers draw in field units about their own origin and are placed by slice 11's `lyingOnPlay`: `drawPatch` (`:275-293`, placed in `syncPatches` at `:755-757`), `drawCones` with `coneWedges` (`:351-386`, placed in `syncRing` at `:874-876`), and `drawEruption` with `eruptionFrontsAt` (`:407-435`, placed through `syncBurst` at `:916-918`). Each is changed to build its shape in field units about the thing's field point (the patch's centre; the grave's point for the cones, which point where `coneHeading` says, `:355`; the eruption's drifted point for the fronts), trace every outline with `traceOnColumn(SCENE_PLAY_LAYER, ...)` and `circleOutline` (slice 10), and draw in column units into a node left at the column's origin at scale one. That covers the patch's rim and each of its hands (`:282-292`), each cone's wedge, arc and both straight sides (`:356-359`), and each front's circle (`:428-433`).

- Stroke widths (`PATCH_STROKE`, `CONE_STROKE`, `SPRITE_STROKE`, each front's `width`) keep their look: each is multiplied by the camera's scale at the shape's field point, because the node no longer carries it. Their readers are these drawers alone.
- `eruptionFrontsAt` stays a value (exported and tested).
- The patch's cached look (`patchDrawn`, `:588`, `:751-752`) no longer suffices, because the traced shape moves with the patch: a patch is drawn every frame it shows.
- The ring's fade (`:877-878`) and the patch's tint and alpha (`:758-765`) stay.

**`src/app/screens/game/BackgroundRenderer.ts`, the scroll (A22).** `GROUND_SPEED` (`:71`) becomes `SCROLL_SPEED` times `SCENE_PLAY_LAYER.stretch` (1.224454), and its JSDoc (`:60-70`) says why. Its readers, every one of which takes the new rate with no other change: `DRIFT_WINDOW_TICKS` (`:104-106`), the ground's scroll (`:269`), the dressing's fall (`:382`), and the export (`:491`), read by `BackgroundRenderer.test.ts` only through `DRIFT_WINDOW_TICKS` (`:25`, `:243`, `:246`, `:424`, `:429`, `:439`, `:633-636`). `groundPainting.test.ts:432` names it in a comment and does not change.

## What must stay unchanged

- Everything under `src/game`, `src/input`, `src/tape` and `src/dev`. No pin moves.
- Every colour, alpha and count in the three drawers; slice 11's placements; the ground's mesh and bake.

## Planned tests

Pin every name as a `test.todo` first. Expected values come from the design record, worked independently. Each test cites the ruling it enforces.

`src/app/screens/game/__tests__/StormRenderer.test.ts`:

1. a Territory patch is drawn as the exact image of its sim circle: a field point one unit inside its radius draws inside the drawn rim and one unit outside draws outside, all around, for a patch at the left edge, the middle and the right edge (A20)
2. the bell's cones are drawn as the exact image of the sim's cones: the same test at the cone's reach and along both straight sides, at the left edge, the middle and the right edge (A20)
3. each of the belch's fronts is drawn as the exact image of its sim circle at the front's radius, about the eruption's drifted point (A20)
4. a patch's stroke keeps its drawn width: the traced rim's stroke is `PATCH_STROKE` times the camera's scale at the patch's point

`src/app/screens/game/__tests__/BackgroundRenderer.test.ts`:

5. the ground runs at the rate a lying thing on the middle column drifts: over a number of ticks its texture moves by that many ticks of the sim's scroll times 1.224454, in ground units (A22)
6. a patch on the middle column stays on its ground: a field point on column x 270 and the ground point under it at the start stay on one column row, within 1e-6, over the whole trip down the column (A22)
7. the dressing falls from the top row of the ground the camera sees to past its bottom row at the ground's speed

**Existing tests whose premise this changes.** Replace each with the new test named beside it, keep its promise, and list every replacement in your note:

- `StormRenderer.test.ts` `'draws at the radius the sim collides against, so a stale patch is visibly smaller'` (`:421`): its promise stays, asserted on the traced rim's extent in field terms (test 1 covers the rim). `'drifts the eruption down the field, so it still covers the bodies it caught when it ends'` (`:350`): its promise stays, asserted on the traced fronts. Slice 11's test "a patch, the bell's cones and the belch's eruption are placed at their play points" becomes tests 1 to 3.
- `BackgroundRenderer.test.ts` `"the ground runs at the rate a landed patch drifts: over a number of ticks its texture moves by that many ticks of the sim's scroll, in ground units"` (`:576`): test 5. `'the dressing is laid across the far row of the ground the camera sees and falls from its top row to past its bottom row'` (`:604`): its across half stays; its window lines (`:633-636`, against `SCROLL_SPEED`) become test 7.

Any other test that goes red is a stop and report.

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. **Rendered check.** From a maxed tape, shoot a belch mid-sweep, a bell toll at level 4 or 5, and a Territory patch with its hands, each with the grave near the left edge, the middle and the right edge where the tape offers it. Read every shot and say whether each shape reads as sitting over the bodies it catches, and describe its egg shape.
2. **The ground under a patch, stepped.** Step a tape through a patch's life on the middle column and near an edge: report, on the first and last frame, the column distance between the patch's centre and one ground feature it landed on. On the middle column it must be under 1 CSS pixel; near the edge give the figure (A22).
3. **Frame budget.** Run `scripts/frame-budget.ts` and its screen before and after, and give both figures; the traced patches are drawn every frame now.
4. **Console.** No error and no warning in a live run.

## Done when

Every planned test is green, every replaced test is listed, every verification step has a result in your note, no pin moved, and the working tree holds the code, the tests and `docs/branch/records/slice-12-note.md`, uncommitted.
