# Slice 2: the whole field drawn through the camera (design record T1, T2, T6, A7, A8, A9, A10)

Follow-along row 2: "The whole field is drawn through the tilted camera: the ground leans away and scrolls, far things draw smaller, mobs and statues stand up with the near ones in front, corpses lie flat on the ground, and the grass grows a little longer. The grave's hole still looks the way it does today."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. Load the `pixijs-skills:pixijs` skill before you touch Pixi code, and check every Pixi claim in `node_modules/pixi.js`. Your scratch folder is `local/tilt-slice-2/` in the worktree; the capture tool is slice 1's, in `local/tilt-shots/`, with its "before" shots of today's game. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read on the tree at `517ee0753e`; follow the name beside a number that has moved.

## What this slice builds, and why

Slice 1 built the camera (`src/app/screens/game/camera.ts`, `SCENE_CAMERA`) and the two pure modules that say where things draw under it (`groundPlacement.ts`, `groundMesh.ts`). Today every renderer draws a sim position straight into the field container in field units (`sprite.position.set(x, y)`), and the container carries only `fitField`'s flat placement (`src/app/screens/game/GameScreen.ts:579-582`, `src/app/screens/ReplayScreen.ts:266`). This slice draws every piece of the field through the camera, so the ground leans away and far things draw smaller (T2), while the column the camera draws into stays exactly where `fitField` puts it.

The sim does not change. The field is still today's 540 by 760 rectangle in the sim, so on screen it reads as a rectangle of ground seen at an angle, narrower at the top than the column: this is the prototype's tilt 2 to tilt 4 look, and slice 7 widens the field to fill the column. The grave's hole is still cut by its own build 7 camera (`GRAVE_VIEW`, `src/app/screens/game/graveDrawingValues.ts:25-30`); slice 3 cuts it with the scene camera. Steering is still flat; slice 4 moves it onto the glass.

When it works, a player looking at a run sees:

- The ground leaning away: its grain, patches, tufts and gravel draw smaller toward the top of the column and larger toward the bottom, with no seam anywhere, and it still scrolls down at the sim's own scroll in ground units, so near ground runs faster on the screen than far ground and a Territory patch stays on the earth it landed on.
- Everything on the field at the camera's size for where it stands: 0.822 of its size at the top row, 1.0 on the middle row, 1.178 at the bottom row.
- Mobs, bosses and the dressing's statues and cliffs standing up (A7): upright, not squashed, their feet on the near edge of their footprint, and a nearer one drawn over a farther one (A8).
- Corpses, treasure, Territory's patches, the bell's cones, the belch's eruption, the dressing's eyes and the Waking's source lying on the ground, foreshortened down the screen with it.
- Skulls, wisps and cancel scatters drawn upright at their ground point at the camera's size, and mob fire the same but never smaller than today's size (A7).
- The ghoul's wedge and a wisp pointing the way they move on the screen.
- Grass tufts in the ground 1.3485 times as long as build 7's (A9).
- The grave sitting in the leaning ground, drawn through the four corners of its ground rectangle so its far end is smaller than its near end, with its build 7 hole and its falls inside it.
- The column's frame, its clip, the hit dim, the HUD row, the pause button and the belch button exactly where they are today.
- A replay drawing exactly what the live game draws, because both screens use the same renderers.

## Rulings this slice builds

- A7, what stands and what lies, and how each is placed. Read it in full.
- A8, near over far inside `mobBodies`, and `LAYER_ORDER` (`src/app/screens/game/layering.ts:16-31`) untouched.
- A9, the ground as a screen-laid mesh over today's baked ground, wrapped on both axes, no haze, and the grass blade reach.
- A10's first half: the grave's hole is baked at the column's nearest-row scale, so moving the grave up and down never re-bakes for resolution. The stance half is slice 3's.

## Parts of the code this slice touches

**Where each thing draws** is slice 1's `groundPlacement.ts` (`lyingAt`, `standingAt`, `airborneAt`, `hostileFireAt`, `headingOnColumn`, `liftOnColumn`) and the ground's grid is slice 1's `groundMesh.ts`. Read their JSDoc; this slice only calls them.

**How a pooled drawing takes its placement.** A lying drawing that turns (a corpse's teeter, `FieldRenderer.ts:409`) must foreshorten along the screen's vertical, never along its own axis (A7), and a treasure body's breath is held by its own scale (`FieldRenderer.test.ts`, `'holds the on-screen stroke at SPRITE_STROKE through every phase of the breath'`, `:1077`). Pixi applies a node's own scale before its rotation, so the camera's placement cannot ride on the same node. The placement rides on a parent `Container` of each pooled drawing, one per slot, allocated with the pool and never per frame: the parent takes the position and the camera's scale, and the drawing inside keeps its own rotation, scale, tint and look. Check the transform order in `node_modules/pixi.js` before you build on it. Where a test reaches a pooled drawing through a helper (`spriteAt` in the renderer tests), the helper reaches the drawing inside its placement; list each helper you change in your note.

**`src/app/screens/game/groundPainting.ts`.** Two additions to a line-for-line port (R8), each the tilted prototype's own:

- The picture wraps across its side edges as it already wraps across its top and bottom (`wrapsAt`, `:84`, used at `:119`, `:150`, `:174`, `:205`, `:229` and `:264`): every shape whose extent crosses the left or right edge is painted a second time a field width away, and a shape crossing a corner four times. This is an addition, never a change to a colour, a count or a placement, exactly the rule R8's slice 8 was given for the vertical wrap.
- `paintBlade` (`:212-233`) multiplies a blade's length by the grass's blade reach, as the prototype's tilted tuft painter does (`index.html:1910-1916`, `const up = lerp(2.4, 6, random()) * reach`). `paintGround` (`:275-287`) gains the reach as an argument, and at a reach of one it paints exactly today's picture, call for call.

**`src/app/screens/game/BackgroundRenderer.ts`.** The ground stops being a `TilingSprite` (`:138-142`, `syncGround` at `:203-205`) and becomes a Pixi `Mesh` over `groundMesh.ts`'s grid, sampling the same baked texture, with the texture's address mode set to repeat on both axes. The bake stays where it is (`onRender`, `askForABake`, `bakeIfAsked`), painted with `bladeReach(SCENE_CAMERA)`. `groundResolution` is asked for the column's view scale times the nearest row's scale (1.178), so the near ground is baked as sharp as it draws (A10's rule, applied to the ground). The grid is updated every frame from the run's tick exactly as `syncGround` (`:203-205`) sets `tilePosition.y` today: the ground's whole state is a function of the tick, so a replay at a tick draws the ground the run drew. `GROUND_SPEED` (`:40`) keeps its value and its reason.

The dressing (`placeDressing`, `:308-327`) is laid across the ground the camera sees rather than the field's rectangle: across `visibleGround(SCENE_CAMERA, COLUMN)`'s far row instead of `FIELD_WIDTH` (`:324`), falling from its top row to past its bottom row instead of from 0 to `FIELD_HEIGHT` (`:318`), and `DRIFT_WINDOW_TICKS` (`:73-75`) is the time to fall that far. Which dressing stands and which lies: art drawn front-on stands, art drawn from above lies (A7). Your note lists every alias in `DRESSING_SETS` (`groundDressing.ts`) with which it is and how you read that off the art. The dressing sprites are already anchored at their foot (`:187`), which is what standing wants. The Waking's source (`syncSource`, `:348-365`) lies at the set piece's ground point.

**`src/app/screens/game/GraveRenderer.ts`.** The pit and the lip are drawn as Pixi `PerspectiveMesh`es (`pixi.js` 8.19, `lib/scene/mesh-perspective/PerspectiveMesh`, `setCorners`; read its declaration before building on it), each textured with its bake and cornered at the four `groundToColumn` points of the ground rectangle its bake covers: the grave's centre plus and minus half its width and its padding across, and its size and its padding along, at the size the sim says. So the stretch between bakes (`stretchArtToSize`, `:202-207`) becomes the corners' own size, and the drawn grave is exactly the projection of its ground rectangle, which is what lets slice 7 hold the whole lip on the screen exactly (A5, the tech gate's finding that one scale for the whole lip leaves it 1.5 units over at the top edge). The falls container (`:101-110`) is placed with `lyingAt` at the grave's centre, and still never takes the grave's size (its JSDoc says why, and that stays true). The view scale the bake reads (`viewScaleFor`, `:158-174`) is read off the unscaled layer the pieces sit in, never off a piece the camera now draws, and the bake's pixels per unit are that times the nearest row's scale (A10); otherwise a grave moving up the column would re-bake on every frame. The hole's art itself is not touched in this slice: `GRAVE_VIEW` and every painter stay exactly as they are. The grave's public interface gains the four corners it hands its meshes, read-only, so slice 7's cross test measures the drawn placement and not a recomputation of it.

**`src/app/screens/game/FieldRenderer.ts`.** Mobs (`syncMobs`, `:316-333`) stand, with their feet at `MOB_TYPES[mob.type].halfHeight` (`src/game/mobs.ts:117` onward); the chaser's wedge (`:328-332`) turns by `headingOnColumn`. The `mobBodies` layer sorts its children by ground y, nearer on top (A8), which is a property of that layer's container and not of `LAYER_ORDER`. Shots (`syncShots`, `:337-370`) draw at `hostileFireAt`, never smaller than today; cancel scatters (`cancelAt`, `:424-437`) are airborne. Corpses and treasure (`syncCorpses`, `:372-418`) lie, with the teeter's turn inside the placement. The hit dim (`:289-292`) stays a column-space rectangle. `cancelAt`'s "inside the field" test (`:426-429`) stays against the sim's field as it is in this slice; slice 5 moves it.

**`src/app/screens/game/StormRenderer.ts`.** Skulls (`syncSkulls`, `:700-712`) and wisps (`:812-814`, turned by `headingOnColumn`) are airborne. Territory's patches (`syncPatches`, `:714-762`) lie; the lob mark's arc (`syncArrivals`, `:764-800`, the lift at `:794-798`) lifts by `liftOnColumn` of the offset it lifts by today. The bell's cones (`syncRing`, `:818-828`), the belch's eruption (`erupt`, `:671-675`) and the splash (`splashed`, `:694-698`) lie at their ground points. Bursts (`:850-861`) are airborne and drift by `liftOnColumn` of today's drift. The loss pops (`weaponStripped`, `:684-692`) are airborne at the skulls' ground points.

**`src/app/screens/game/BossRenderer.ts`.** The boss (`:51`) stands, feet at its half-height (`BOSS_HALF_HEIGHT`, `src/game/bosses/phases.ts:75`).

**`src/app/screens/game/EndingSceneRenderer.ts`.** The dragged Undertaker (`show`, `:108-124`) stands at the ground point the scene draws him at, until the scene says he is in the hole; in the hole he is drawn the way the falls are, inside the grave's placement. The furrows lie.

**`src/app/screens/game/FallRenderer.ts` and `fall.ts`.** Unchanged: a fall is drawn in the grave's own frame (`FallRenderer.ts:127-141`), and that frame now carries the camera.

**`src/app/screens/game/GameScreen.ts`, `src/app/screens/ReplayScreen.ts`, `src/app/layout.ts`.** Unchanged. `fitField`'s placement still puts the column in the viewport, and every renderer draws into the column through the camera.

## What must stay unchanged

- Everything under `src/game`, `src/input`, `src/tape` and `src/dev`. `GOLDEN`, the bot's seed lists and every version number hold.
- `LAYER_ORDER`, the palette, every colour, every painter of the grave (`graveWalls.ts`, `graveLip.ts`, `graveMouth.ts`, `graveProjection.ts`, `graveDrawingValues.ts`), and the hole's look.
- The column's placement, the frame, the clip, the hit dim, the HUD row, the ladder, the buttons and the countdown.
- The ground's picture at a blade reach of one, call for call.

## Planned tests

Pin every name as a `test.todo` first. Expected values for the placement tests come from slice 1's pinned numbers and the design record's table, worked by hand, never from running the code. Each test cites the ruling it enforces.

`src/app/screens/game/__tests__/groundPainting.test.ts`:

1. at a blade reach of one the ground is painted exactly as before, call for call
2. at a blade reach of 1.3485 every blade is that many times as long and nothing else moves
3. a shape crossing the left or right edge is painted again a field width away, so the picture meets itself across its sides
4. a shape crossing a corner is painted four times

`src/app/screens/game/__tests__/BackgroundRenderer.test.ts`:

5. the ground is a mesh over the baked picture, repeating on both axes
6. the ground runs at the rate a landed patch drifts: over a number of ticks its texture moves by that many ticks of the sim's scroll, in ground units
7. the dressing is laid across the far row of the ground the camera sees and falls from its top row to past its bottom row
8. a statue stands and an eye lies

`src/app/screens/game/__tests__/FieldRenderer.test.ts`:

9. a mob stands on its footprint where the camera puts its feet
10. a nearer mob draws over a farther one
11. a corpse lies on the ground, foreshortened down the column, and its teeter turns it inside that foreshortening
12. a shot draws at its ground point at the camera's size near the bottom and never smaller than today's size near the top (A7)
13. the ghoul's wedge points the way it moves on the column

`src/app/screens/game/__tests__/StormRenderer.test.ts`:

14. a skull and a wisp draw at their ground points at the camera's size
15. a patch lies on the ground, and the lob mark lifts off its path straight up the column

`src/app/screens/game/__tests__/GraveRenderer.test.ts`:

16. the grave's pit and lip are drawn through the four projected corners of their ground rectangle, at the size the sim says, and a grave near the top draws its far end narrower than its near end
17. moving the grave up and down the column does not bake the hole again
18. the hole is baked at the view's pixels times the nearest row's scale times the device pixel ratio

`src/app/screens/game/__tests__/BossRenderer.test.ts`:

19. the boss stands on its footprint where the camera puts its feet

**Existing tests whose premise the camera changes.** Each asserts that a thing draws at its sim position in field units, or that the ground is a tiling sprite, which T2 and A7 change. Replace each with the new test named beside it, keep its promise where it has one beyond the position, and list every replacement in your note:

- `FieldRenderer.test.ts` `'shows a sprite only while its slot is alive'` (`:167`, the position at `:179`) and `'pools its sprites the way the entities are pooled: a spawn after a death reuses one'` (`:186`, `:203`): the visibility and pooling promises stay; the positions become test 9's.
- `BackgroundRenderer.test.ts` `'moves the ground at the rate a landed patch drifts, so a patch stays on its rock'` (`:189`) and `'the ground still runs at the rate a landed patch drifts'` (`:350`): become test 6. `'draws at three times the dressing eyes, in the Crowd colour and never the Vigil one'` (`:475`): the size and colour promise stays; its position lines (`:495-496`) move to the camera's point.
- `StormRenderer.test.ts` `'shows a live slot at its own position and hides a dead one'` (`:158`): the promise stays in column units. `'drifts the eruption down the field, so it still covers the bodies it caught when it ends'` (`:366`): the eruption and the splash are asserted at the camera's points for the grave's ground point and the rim. The lob mark's tests (`:568` to `:689`): each relation they assert (between the grave and the ground, above its path, less than a straight run, keeps its origin) is asserted in column units at the camera's points for the same ground points.
- `GraveRenderer.test.ts` `'position follows grave.x and grave.y'` (`:150`): becomes test 16. `'the baked hole is centred on the grave, sized to it with the prototype padding round it'` (`:194`): the bake's own bounds in the grave's units stay; the drawn corners are test 16's. `'the drawn grave grows with every swallow, not only when it is repainted'` (`:177`): the promise stays, read off the corners rather than the stretch. `'bakes at the pixels the phone shows, the view times the device pixel ratio'` (`:219`): becomes test 18. `'the place for falls follows the grave and is never scaled'` (`:266`): the falls follow the grave's column point and take the camera's scale and never the grave's size.
- `BossRenderer.test.ts` `'stands where the sim says it stands'` (`:202`): becomes test 19.

Any other test that goes red is a stop and report.

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. **The "before" shots.** Slice 1 built `local/tilt-shots/` and shot today's game. Use those tapes and ticks.
2. **Rendered check.** With the tool, shoot the same ticks after the change, plus one tick in each section with the most bodies on screen, a boss, and the Undertaker's end. Read every shot and say in your note: the ground leans and has no seam at the tile's edges; far things are smaller; mobs and statues stand, the nearer over the farther; corpses and patches lie; the grave sits in the ground with today's hole; the frame, the HUD and the buttons have not moved. Put one "before" and one "after" of the same tick side by side in your note's folder and describe the difference.
3. **Against the prototype.** Open the tilted prototype (the prototype worktree's file, served locally) at tilt 32.5, camera 42.5, hole camera `own`, on the same phone viewport, and shoot it. Say where the game's picture and the prototype's differ, other than the field's width (slice 7) and the art itself.
4. **Frame budget.** Run the frame budget tool (`scripts/frame-budget.ts`, and its screen) before and after, and give both figures.
5. **Console.** A live run in the built app, played with a few key presses, shows no error and no warning in the console.

Open for the human after this slice (say so in your note): whether the leaning ground reads as the angle he chose, and whether the placeholder mobs read as standing.

## Done when

Every planned test is green, every replaced test is listed, every verification step has a result in your note, no pin moved, and the working tree holds the code, the tests and `docs/branch/records/slice-2-note.md`, uncommitted.
