# The tilted view (#159)

The design record for the one step of the branch `tilted-view-build`. It holds the step's rulings, each with its evidence and how to reverse it. Mark's rulings come from his play of the throwaway prototype for #156 and #159 and are numbered T1 to T10 in his own words. The agent's calls are numbered A1 onward, each open to his overrule. No grill ran for this step: his words from the prototype play are the record, and `docs/branch/decision-log.md` carries them as numbered decisions. There is no ADR for this step; Mark ruled on #156 that the tilt is a design ruling and not an ADR.

Every ruling carries a status line: **stands**, **stands, amended** (what changed is named), **superseded** (by what, and what of it stood), or **dropped** (why). The branch planned on 2026-09-27 before Mark's correction is commit `d521b3555e`; the full text of every call dropped here is there.

## What was wrong

Mark, at the start of #156, after playing the built #148 branch: "I don't think I need to see the whole field on a lean-back. I don't even know how much it needs to lean back. I just feel like currently it feels very, very top-down even though the grave rendering seems to imply that it's tilted. I'm just trying to make the game kind of match up with the grave rendering a little bit."

The cause, found while building the prototype: the grave's hole is drawn from a camera about 12.2 degrees off straight down (`atan(1.07 / 4.95)`, design record `grave-in-the-ground.md` R4), and the hole reads as angled because it is deep. Nothing above the ground had any height and the ground itself did not lean, so the grave and the field it is cut into disagreed about where the player is looking from.

## The reference

The throwaway prototype for #156 and #159, file `apps/hungry-grave/src/prototypes/tilted-view/index.html`, in the worktree `.claude/worktrees/156-tilted-view`. **Tilt 9 is the reference for this step.** It is uncommitted there; tilt 7, which tilt 9 is built on, is kept beside it as `local/tilt9/index-tilt7.html`, and tilt 9's checks and their output are in `local/tilt9/` (`check9.cjs`, `check9-output.txt`: 9 of 9 passing). Tilt 6 is on the branch `prototype/156-tilted-view` at `63f34824f3`. Coders learn from the prototype and never lift a module out of it (`docs/agents/feature-flow.md`, "The prototype boundary").

Tilt 9 is tilt 7 with the play split off the scenery (its whole difference from tilt 7 is 178 lines of diff):

- Scenery (the ground mesh, its dressing, the far markers, the grass) is drawn through tilt 7's pinhole camera, unchanged.
- The play layer (every body, the grave, anything fired) is placed by `playToScreen` (tilt 9 `index.html:768-772`): across, a field unit is a screen unit at every row, so straight down the field is straight down the glass; down, a thing sits on the pinhole's own row for its ground y on the screen's centre column; its size is the pinhole's size at that row. `screenToPlay` (`:775-778`) is the exact inverse.
- The hole keeps tilt 7's shared-camera look: its stance is taken from the ground point under the grave's placed point (`aimHoleCamera`, `:1773-1788`), so its side walls change as the grave moves left and right exactly as tilt 7 showed them for a grave at that spot on the glass.
- Keys move the grave in plain field units (`:3640`); a drag goes through `screenToPlay` (`:3515`, `:3570`), and the grave's on-screen hold is `holdOnScreen` (`:3564`).

What the prototype taught, which the rulings below rest on:

- The hole's projection is the identity at depth zero, so putting the flat field under the grave's own camera draws nothing differently. The tilt has to be one camera for the whole scene.
- An orthographic lean (tilt 1) is invisible on even-noise ground. Only a real pinhole camera, where far things draw smaller, reads as tilted (tilt 2, Mark: "the ground itself, all of it, should adjust based on the tilt").
- One camera cannot both show the inside of the hole and give a sane field. Mark chose the flat dark hole (T4).
- A camera aimed at the grave swings the whole field as the grave moves. This game's camera is pinned to the screen and the grave moves about inside a still view (tilt 3).
- A pinhole converges lines of constant ground x on a vanishing point, so anything moving straight down the field drifts toward the middle of the screen as it comes near (tilts 5 to 7). Patching steering to hide that (tilt 6, and slice 4 of this branch) pushed the tilt into play.
- A projection with no vanishing point anywhere (tilt 8) reads flat and loses the side walls' change from left to right (T10).
- Splitting the play off the scenery (tilt 9, Ikaruga's flat play plane over perspective scenery, which the game design gate named as prior art) keeps tilt 7's look and keeps play straight.

## Mark's rulings

### T1. The game goes tilted, in V1, before the phone-first pass (#151)

**Stands.** On tilt 6, 2026-09-26: "This is looking real good. I think this is what we should be using as our guide for how we build the equivalent into the real app." He placed the build in V1 right after the `scripts/roadmap/v1.yaml` fix and before foundations (#152), and before #151, because the tilt touches all the art and #151 is the pass that sets the look.

### T2. The tilt is 32.5 degrees off straight down

**Stands.** Read off his phone on 2026-09-27 after 81 swallows.

### T3. The camera stands 42.50 grave half-lengths up, measured off the starting grave size, never the live grave

**Stands.** Read off the same screenshot. Measured off the starting size because a camera that rose with the live grave would flatten the view as the grave grows. The grave size of 48.0 in his shot is growth from swallowing, not a ruling.

### T4. The hole is cut by the shared scene camera, so it is a flat dark opening

**Stands, amended by T10.** He chose `shared` over the prototype's `own` camera, which kept build 7's low camera for the hole and showed its walls. Under T10 the camera's stance is taken over the ground point under the grave's placed point (A23).

### T5. Every other value stays at build 7's

**Stands.** The pull's reach 24 and strength 125, the tip threshold 0.55, the tip 0.3 s and the drop 0.75 s, and the headstone off.

### T6. The view is still and the grave moves inside it

**Stands.** Confirmed by Mark before tilt 3: a still rectangle of world seen at an angle, with the grave moving inside it, is exactly what he wants. On tilt 2 he named the difference from hole.io himself, where the hole is always in the middle.

### T7. The whole grave stays on screen

**Superseded in part by T10.** On tilt 4, which held the drawn lip inside the screen: "Yes this looks good. I like what we're doing here." The prototype held it with a screen hold on the grave's movement (`holdOnScreen`, tilt 9 `index.html:3564-3576`). In the real game that hold is the sim's (`containGrave`, `src/game/grave.ts:118-122`, which holds the opening and not the lip), and T10 rules the sim untouched by the tilt. What stands: the sim's own hold, exactly as the flat game has it. What it could not have known: that the hold is physics. What it costs is A25.

### T8. Mobs fill the whole screen, top and sides

**Stands, carried by T10 without a sim change.** His ask on tilt 4. Under the play layer the fixed 540 by 760 field fills the column: field x 0 to 540 draws across the whole width at every row, and field y 0 draws on the top row (A18). The plan's way of carrying it (the field becomes the trapezoid the camera sees, spawns laid across the far row) is dropped with A2 and A4.

### T9. A drag and a key both work on the glass

**Stands in its words; its mechanism for the keys is superseded by T10.** On tilt 5: "almost there", because W moved the grave in ground units under a pinhole and drifted toward the vanishing point. #159's done-when: "a drag moves the grave exactly under the finger and a held key moves it straight up the screen without drifting sideways, at any point on the screen". Under the play layer both still hold: a drag goes through the play layer's exact inverse, and a key moves the grave in plain field units, which on the play layer is straight up the screen because across a field unit is a column unit at every row. What changed: a key is no longer a step on the glass converted through the camera (A11 is superseded); its speed on the screen is the flat game's field speed, drawn faster near the bottom as the rows spread.

### T10. The tilt is drawing only (tilt 9)

**New, 2026-09-27.** Mark played slice 4's deploy and corrected the direction:

"The intent of the tilt is that you can see the world and the grave from a more isometric or 3D-ish feel but nothing should have changed about the physics of the game."

"When I shoot my main weapon, that goes straight forward. It now no longer goes straight forward; it goes in the direction of that tilt. The mobs and the weapons should also not be dealing with that tilt."

"there should be nothing happening with regards to the world underneath that is tied to the tilt at all."

"that whole 540 by 760, that's just the viewport... That part should still stay 540 by 760 even though other things might be going on outside of that cutout."

Tilt 8, a projection with no vanishing point anywhere, he rejected: "it's as though we went backwards in time. This just looks like a flat thing again... I don't know why you took away the left and right visibility change of the inside walls... Tilt 7 was way closer. All we need is for the bullets to go straight and the mobs to move straight. That's all... go back to 7 and just make those two things true without changing anything else." Tilt 8 is kept only as `local/tilt8/index-tilt8.html` in the prototype worktree.

Tilt 9 he approved: "yes it is as long as the weapons behave right".

What it rules: the sim is untouched by the tilt. The field stays 540 by 760, no tape, witness or readings version moves, `GOLDEN` holds, and the harness's hand plays in field units. The tilt is how the game is drawn: scenery through the pinhole camera (T2, T3), the play layer as tilt 9 places it (A18 to A21), the hole as tilt 7 cut it (T4, A23). His condition, the weapons behaving right, is proved in slice 15 by measurement and screenshots, and the one place the play layer does not keep a path straight is A28, which is his to rule.

## The correction, and what it replaces

What changed: the plan of `d521b3555e` made the sim field the trapezoid the pinhole camera sees (A2), spread spawns across its far row (A4), held the grave's drawn lip in the sim (A5), and converted keys and the harness hand onto the glass (A11). Slice 4 landed the steering conversion and the deploy of it showed Mark what it did to play: the tilt reached the physics. All of that is withdrawn: nothing in `src/game` or `src/tape` changes on this branch, and slice 4's conversion is taken back out (slice 14).

What stood: the camera and its values (slice 1, T2, T3, A6, A13's placement in drawing code), the ground as a screen-laid mesh (A9), standing and lying (A7) and near over far (A8), the hole cut by the scene camera (T4, slice 3) and its re-bake (A10), the capture tool, and the column: the window stays the 540 by 760 box `fitField` letterboxes (`src/app/layout.ts`), which is the answer to the question the plan asked him in A1.

What the plan could not have known: that "Mobs fill the whole screen" (T8) and "a key on the glass" (T9) were asks about the picture, not the physics, and that a pinhole makes straight motion drift on screen, so any field placed through it drags the tilt into play. Tilt 7 to tilt 9 found the split that keeps his picture and leaves the physics alone.

## The agent's calls, open to Mark's overrule

### A1. The column's shape

**Answered by T10.** The plan recommended keeping today's 540 by 760 column and asked Mark to rule it. His answer: "that whole 540 by 760, that's just the viewport... That part should still stay 540 by 760." The column is the box `fitField` letterboxes into any viewport (`src/app/layout.ts:218-257`), one fixed shape on every device, which keeps ADR 0003 ("no number anywhere is a device pixel") and ADR 0019's determinism across a phone and a desktop. His camera values are not retuned on it; he tuned them on the phone's own column and the 760 column shows the middle of that view.

### A2. The field is the exact patch of ground the column sees

**Dropped (T10).** It made the sim field a trapezoid and sent bodies off its slanted sides. The field stays today's rectangle.

### A3. The field keeps its origin, and the old width and height keep every job that is a scale

**Dropped (T10).** It split `FIELD_WIDTH` and `FIELD_HEIGHT` into a scale and a set of edges, which is why slice 6 renamed them `VIEW_WIDTH` and `VIEW_HEIGHT`. With the field unchanged the two are its edges and its scale, as they always were, and the rename is undone (A26).

### A4. Mobs arrive across the far row at today's density per unit of ground

**Dropped (T10).** It changed the formations' widths and counts and the mob cap's derivation. T8 is met by the play layer instead (A18), with every formation as authored.

### A5. The grave's hold covers its whole drawn lip, in field units

**Dropped (T10).** A sim hold; see T7 and A25.

### A6. The hole's camera is the true scene camera, off the starting size

**Stands.** The prototype's `shared` mode cut the hole with the live grave's size (`belowGround`, prototype `index.html:776-784` in tilt 6), while its scene camera used the starting size. The build cuts the hole from the camera that draws the ground: 1147.5 field units up, 42.5 half-lengths of the starting grave and 17 of a ceiling grave. At the starting size nothing differs from what Mark played; at size 48 a wall's deepest drawn point sits at 0.909 of the rim's distance from where the walls converge instead of 0.947, and at the ceiling at 0.876.

To reverse: cut the hole with the camera's height in the live grave's half-lengths.

### A7. What stands and what lies

**Stands, amended by A19.** A lying thing is laid on the ground: drawn at the camera's scale across and the scale squared times the lean down the screen. The grave's pit and lip are drawn as a perspective mesh through the four projected corners of a ground rectangle. A standing thing is drawn upright at the camera's scale, its feet on the near edge of its footprint. Airborne things (skulls, wisps, mob fire, scatters) draw upright at the camera's scale; mob fire never draws smaller than its hitbox (amended by A21). A lying thing that turns foreshortens along the screen's vertical. An art offset drawn in field units today becomes a column offset at the camera's scale. A heading drawn on a body follows the direction the body moves on the screen.

- Lying: the ground, the grave and its lip, corpses and treasure, the dressing's eyes and cracks, the Waking's source.
- Standing: mobs, bosses, the Undertaker in his ending scene until he goes over the rim, the dressing's statues and cliffs.
- Areas of effect whose edge is a sim reach (Territory's patches, the bell's cones, the belch's eruption) are drawn as the image of their sim shape (A20), not as lying art.

Under T10 these rules are evaluated at the ground point under a play thing's placed point for everything on the play layer (A19), and at the ground point itself for scenery.

### A8. Near draws over far inside a layer, and ADR 0014's layer order does not move

**Stands.** Standing things in `mobBodies` sort by their field y, nearer on top (`FieldRenderer.ts:226`, `:373`). The play layer's rows rise with field y, so the sort needs no change. The boss sorts with its adds.

### A9. The ground is a screen-laid mesh over today's baked ground, and there is no haze

**Stands, amended by A22 (its scroll rate).** The prototype's tilt 2 answer, a grid laid on the screen whose vertices ask the camera which ground they show, sampling #148's baked ground with repeat on both axes (`groundMesh.ts`, `BackgroundRenderer.ts`). No haze: the smallest scale on the column is 0.822. Grass blades draw 1.3485 times build 7's length.

### A10. The hole is baked for the near edge's scale and baked again when the grave moves a step

**Stands, amended by A23 (the step is measured in ground units).** Baked at the nearest row's scale (1.178), so moving up and down never forces a bake for resolution. Baked again when the ground point under the grave has moved more than 4.75 ground units from where it was baked (`STANCE_REBAKE_STEP`), which keeps a stale bake's two side walls within one CSS pixel of each other at the ceiling on the nearest row (the derivation is in `graveDrawingValues.ts`'s JSDoc on the constant).

### A11. Steering converts on the glass, around input models that do not change

**Superseded by T10.** Keys and the harness hand stepped on the glass through the camera (slice 4). Under T10 a key is a plain field move again and the harness hand plays in field units (slice 14). What stood: the input models work in column points (`ColumnPoint`, `src/input/touch.ts`; `screenToColumn`, `src/app/layout.ts`), because a drag is still a finger on the glass; only the conversion changes, to the play layer's exact inverse (slice 14).

### A12. The field change moves no tape version

**Stands, and is now trivially true.** Nothing in the sim changes, so no version moves, and tapes recorded before this branch replay and verify on it. Slice 16 proves it by replaying tapes recorded at `517ee0753e`.

### A13. The camera lives in the drawing code, and the sim holds only the field's six numbers

**Stands in part.** The camera and the play layer live in `src/app/screens/game` (they use cosines and sines, which `src/game` may not call, ADR 0019). The sim holds nothing of either: the six numbers were A2's and are dropped.

### A14. Food and fallen rungs land where the grave can still reach them

**Dropped (T10).** It held offers inside the trapezoid's near row. The offer's hold stays the flat game's.

### A15. The Waking's depth and sweep are read along the field's length

**Dropped (T10).** The field's length is unchanged.

### A16. A mob split by the far row's edge walks in

**Dropped (T10).** There is no far row in the sim.

### A17. The size floor's stated reason no longer holds at the top of the screen

**Stands as a fact, with no code change on this branch.** `SIZE_FLOOR`'s comment (`src/game/tuning.ts:59-66`) gives its reason as a floor grave being about 13 CSS pixels across on a 390-wide phone. The play layer draws the top row at 0.822, so a floor grave there is about 10.7 CSS pixels across. The comment lives in `src/game`, which this branch does not touch (T10), so the restatement goes to #39, which owns the floor, at the branch close's ticket pass.

### A18. The play layer spreads the fixed field over the pinhole's rows, top row to bottom row

**New.** Tilt 9 places a thing at screen x = field x and on the pinhole's row for its ground y. In the prototype the field was the ground itself (tilt 9's field on the phone was 540 by 1498 ground units, `check9-output.txt`); the real field is 540 by 760 and the column shows 930.585 ground units along its centre column (ground y -168.081604 under the top row to 762.503300 under the bottom row). So the play layer reads field y as the ground y `-168.081604 + 1.224454 * y` and places the thing on that ground's row: field y 0 draws on the column's top row and field y 760 on its bottom row, and every row in between is a pinhole row. Across, field x is column x.

The alternative, reading field y as ground y itself, puts field y 0 on column row 101.3 and leaves the top 13% of the column with no play in it: mobs waiting above the field would draw there before they can be hit, and a skull would vanish at row 98 on its way up. That breaks "the whole 540 by 760 ... is the viewport" (T10) and T8.

What the stretch costs, measured. A field unit along draws 1.224454 times the rows a ground unit draws at the same row. Drawn at tilt 7's size for its row, the grave would be 0.817 of its hitbox along (`graveHitbox`, `src/game/grave.ts:102-111`, which is the swallow's mouth, the box mob fire and contact hit, and the pull's target), so fire would land 4 CSS pixels short of the drawn rim at the start size and 11 at the ceiling. A29 draws the grave no smaller than its hitbox instead. Other lying things keep tilt 7's size (A19); their sim footprint has no edge a player reads as a hit.

Everything moving down the screen speeds up as it nears, because the rows spread: a field unit along draws as 0.70 rows at the top, 1.21 at the grave's starting row and 1.43 at the bottom. Mob fire that crosses the column at the flat game's speed arrives at the grave's row 21% faster on the screen than the flat game draws it, where the dodge happens. Tilt 7 did the same on its pinhole rows. It goes with the rows (A28) and is on "For Mark's next play".

The mapping is a fraction of two linear functions of field y, so it is exact both ways in closed form. Its numbers are in "Values are data".

To reverse: read field y as ground y (the stretch at one), which brings back the empty top strip.

### A19. Everything on the play layer draws at tilt 7's size for its row

**New.** A play thing is drawn exactly as tilt 7 drew a thing standing on the ground point under its placed point: at the pinhole's scale there, with A7's standing, lying and airborne rules. So sizes are tilt 7's (0.822 at the top row, 1.084 at the grave's start, 1.178 at the bottom), and the only thing tilt 9 changes about a body is where it is across the screen. Scenery keeps the pinhole's own placement. Two things are drawn no smaller than their hitbox's image, because their edges are where a hit lands: mob fire (A21) and the grave (A29).

To reverse: draw a play thing at scale one across, its sim footprint, which is closer to the flat game and loses the near-larger cue.

### A20. An area of effect is drawn as the exact image of its sim shape

**New.** The belch's eruption fronts, the bell's cones and Territory's patches have edges that are sim reaches: whatever lies inside is pushed, damaged or held. Drawn as lying art at one scale, the belch's 270-unit reach would be an ellipse, while its sim image on the play layer is egg-shaped: around a grave at its starting point it reaches from column row 272.5 at its far edge to past the column's bottom, and the rows per field unit along run from 0.93 at its far edge to 1.43 on the bottom row. So each of these shapes is built in field units and every point of its outline, straight edges included, goes through the play layer at steps of at most 4 field units (`OUTLINE_STEP`), so a body drawn inside the drawn shape is a body the sim counts inside. Stroke widths and the patch's hands keep their look at the pinhole's scale at the shape's centre. The pull is not drawn anywhere (no renderer under `src/app/screens/game` draws it), so it needs nothing.

To reverse: draw them as lying art at the scale at their centre.

### A21. Mob fire draws at the larger of the camera's scale, one, and the play layer's stretch along

**New, amends A7's exception.** A7 drew mob fire at the larger of the scale and one so it is never smaller than its hitbox. On the play layer a hitbox's image is one across and the stretch along, which passes both one and the scale below field y 380 (1.214 at the grave's start, 1.433 at the bottom row). So mob fire takes the largest of the three, and never draws smaller than its hitbox's image on either axis. Near the top it is today's size.

To reverse: the larger of the scale and one, which draws a shot up to 18% shorter than its hitbox's image near the bottom.

### A22. The ground scrolls at the stretch times the sim's scroll

**New, amends A9.** `GROUND_SPEED` is the sim's scroll in ground units (`BackgroundRenderer.ts:71`), so a Territory patch stays on the ground it landed on (Mark's slice 13b ruling, quoted there). On the play layer a field unit along is 1.224454 ground units, so the ground scrolls at 1.224454 times `SCROLL_SPEED` and a lying thing on the centre column stays on its ground all the way down. Off the centre column a lying thing keeps its x while the pinhole's ground spreads outward under it as it nears, which is tilt 9's own behaviour (its check "a lying body scrolls the whole trip at constant screen x"). How far, by the tech gate's arithmetic: a corpse landing near the top at field x 20 to 40 ends 99 to 108 column units (72 to 78 CSS pixels) off the ground it landed on by the bottom row. Slice 15 measures it. The dressing falls with the ground.

To reverse: `GROUND_SPEED` back to `SCROLL_SPEED`, and every patch and corpse slides against the ground.

### A23. The grave draws as tilt 7 drew a grave at its spot on the glass

**New, amends T4 and A10.** The grave's pit and lip are the perspective mesh through the projected corners of a ground rectangle sized to cover the grave's hitbox (A29), centred on the ground point under its placed point; the hole's stance is taken over that same ground point (tilt 9's `aimHoleCamera`); the falls are placed in the grave's frame there (A29). The re-bake step is measured between the ground points under the grave, in ground units, because A10's one-pixel bound is derived in ground units at the stance: measured in field units, a step of 4.75 is up to 5.82 ground units at the top of the column (1 / 0.822 across, 1.224 along), past the bound's 4.79.

To reverse: the grave's ground rectangle and stance at the field point itself, which is the pinhole's placement and puts the grave where the bodies are not.

### A24. A swallowed body and the Undertaker go over the rim from where they were drawn

**New.** A swallowed body's fall is drawn in the grave's own frame from its offset in grave units (`FallRenderer.swallowed`, `FallRenderer.ts:127-138`). On the play layer the body was drawn somewhere else: with the grave's frame of A29, a body at the far corner of a starting grave draws 1.22 column units from where the naive frame offset puts it (5.66 with tilt 7's frame). So the fall starts at the offset in the grave's frame where the frame draws the point the play layer drew, and its velocity is carried through the same local mapping. The fall's own rim rule already hinges a body lying outside the far lip on the far edge (`fall.ts:112-115`), so a start just past the drawn rim is a case it handles.

The Undertaker is hauled to a rim hinge in grave units and then falls about it (`endingScene.ts:120-141`, `:206-230`). His haul ends at the field point the play layer draws exactly where the grave's frame draws that hinge, so the drag and the fall meet at one point.

To reverse: start from the sim's offset, and every swallow jumps by up to about 1.2 column units at the handover.

### A25. The grave's hold stays the sim's, and the drawn opening may pass the side edges low on the screen

**New, supersedes T7 in part.** The sim holds the opening inside the field (`containGrave`, `src/game/grave.ts:118-122`); the lip's padding already hangs past the column's edge in the flat game and the field's clip cuts it (`GameScreen.ts:157-163`, `:261-263`). The grave's mesh (A23, A29) splays toward its near end, so at a side edge on the lowest row it can stand, the drawn opening's near corners pass the column's edge by 6.3 column units at the starting size, 11.0 at size 48 and 15.1 at the ceiling (4.6, 7.9 and 10.9 CSS pixels on a 390-wide phone), while its far corners stay inside; the field's clip cuts what passes. Slice 13 measures it at the near corners. The alternative is a hold computed from the camera, which ties the physics to the tilt (T10).

To reverse: hold the grave's drawn extent in the sim, which moves `GOLDEN` and the bot's lists.

### A26. The rename of slice 6 is undone

**New.** Slice 6 renamed `FIELD_WIDTH` and `FIELD_HEIGHT` to `VIEW_WIDTH` and `VIEW_HEIGHT` so that after the trapezoid no reader of them would mean an edge (A3). The trapezoid is dropped, so the two are the field's edges and its scale again. The glossary's word is Field, and it says to avoid "viewport" (`CONTEXT.md:123`); a public seam carries the glossary's word (`.claude/rules/code-core.md`, Naming). Undoing it is a clean revert scoped to `apps/hungry-grave`: no commit after `7fac05ff88` touches that folder, while the commit's own three doc files have moved on and stay as the record (the unscoped inverse refuses; the scoped one passes `git apply --check`). It takes 75 app files out of the branch's diff against `main`.

To reverse: re-apply `7fac05ff88`.

### A27. The two readings slice 4 added stay

**New.** `mobFireShots` and `timeOnScreen` were added to measure A4's field change. That change is dropped, but both have callers today (`BATCH_READINGS`, `src/dev/batchReport.ts`, and `READING_COMPARISONS`, `src/dev/compareRuns.ts`, which every batch prints and compares), they touch nothing in the sim, and the "before" batch's figures were measured with them. No ticket names them yet. Taking them out is a slice of churn for no behaviour.

To reverse: remove both readings and their declarations, which leaves `READINGS_VERSION` unmoved by that file's own rule.

### A28. How the play layer spaces its rows

**New, and for Mark's ruling after he plays tilt 10.** Tilt 10 of the prototype is tilt 9 plus mobs firing aimed shots, a rows knob (tilt 9's rows or evenly spaced rows) and the column defaulting to 760. He plays it before slice 10 is dispatched, because the answer decides slice 10's row function.

**Tilt 9's rows** (spaced as the camera spaces them) keep anything moving straight up, down or across perfectly straight, and draw things speeding up as they near. Their costs:

- A diagonal path draws with a slight bow, because the rows are spaced like the camera's and the columns are not, which is not a projection of the plane: an aimed shot from a mob at (100, 150) to a grave at its starting point bows 8.5 column units (6.2 CSS pixels on a 390-wide phone), one from (100, 300) 5.6 (4.1 px), a short diagonal of 140 by 200 2.3 (1.7 px), and a path from corner to corner 39.5 (28.5 px). Skulls do not bow; aimed mob fire, a ghoul's chase, a pincer's lead and a wisp's straight runs do. The Banshee's rings draw as eggs, and the gap lane through a ring bows.
- On-screen vertical speed doubles from the top of the column to the bottom (0.70 to 1.43 rows per field unit), mob fire included (A18).
- A lying thing stays on its ground only on the middle column; near the edges a corpse drifts sideways off it by up to 99 to 108 column units (72 to 78 CSS pixels) over the trip (A22).

**Evenly spaced rows** keep every motion exactly as the flat game draws it: every path straight, every speed constant, the Banshee's rings round. Their cost: the ground keeps the camera's rows, so a corpse or a patch slides up and down against the ground under it by up to 68 rows (49 CSS pixels) mid-screen and meets it again at the bottom, the slide Mark's slice 13b ruling on patches forbids, now on every lying thing.

No placement gives all three of: verticals straight and parallel, every straight path straight, and lying things staying on the ground, while the ground keeps the camera's rows. The row rule is one function in one pure module, so either answer is a one-function change.

**Deferred, with its trigger:** drawing the ground itself on the play layer's rows (the game design gate's third option) might keep lying things on the ground with even rows. It is untested and changes the scenery Mark approved. Its trigger: Mark rejects both choices on his play of tilt 10.

What the build does until he rules: slice 9 runs; slice 10 waits for his answer.

### A29. The grave is drawn no smaller than its hitbox

**New, from the product and game design gates.** `graveHitbox` (`src/game/grave.ts:102-111`) is the swallow's mouth and the box mob fire and contact hit. Drawn at tilt 7's size for its row (A19), the grave would be 0.817 of that box along (A18), so fire would hit 4 to 11 CSS pixels short of the drawn rim. So the ground rectangle the grave's mesh is drawn through (A23) is widened until its image covers the hitbox's image: its half extents across times the larger of one and one over the camera's scale at its far edge, along times the stretch, 1.224454. Along, the drawn rim then lies exactly on the hitbox's rows; across it is never inside the hitbox's edge. The falls are placed in a frame of the same proportions: across the larger of the scale and one, along the rows per field unit. The hole's stance stays A23's.

What it costs: the pit and the lip read about 22% longer along than tilt 7 drew them (the stretch), and near the top a little wider. It is on "For Mark's next play". As A21 does for mob fire, the readable edge wins over the look.

To reverse: the ground rectangle at the grave's own size (tilt 7's look), and fire lands short of the drawn rim.

## What the build must carry, from #159 and T10

- One still perspective camera pinned to the screen, tilt 32.5, height 42.5 starting half-lengths: slice 1. Carried, for scenery and the hole.
- The field is everything the screen sees: carried by the play layer over the unchanged field (A18), not by a sim change.
- Spawns cover the full far span: every formation already spans field x 0 to 540, which the play layer draws across the whole top row (T8, A18).
- Standing things rise along the screen vertical and scale with distance; lying things lean with the ground; near draws over far: slice 2 (A7, A8), evaluated on the play layer (A19) in slices 11 to 13.
- The hole is cut with the shared scene camera, flat and dark: slice 3, stance under the placed point in slice 13 (A23).
- Input: a drag through the exact inverse, keys in field units: slice 14.
- The whole grave on screen: not carried in full; the sim's hold, with the cost in A25.
- The weapons behave right: slice 15.

#159's done-when, and the slice each line is proved in:

- The ground leans away and far things draw smaller: slice 2, and slices 11 to 13 for play things.
- Walkers, headstones and grass stand up: slice 2 (A7, A9), and slice 11 for walkers on the play layer.
- The grave reads as a hole cut into the same leaning ground: slices 3 and 13.
- The view stays still while the grave moves: slice 1 (the camera is a constant) and slice 14 (a drag under the finger).
- A drag moves the grave exactly under the finger; a held key goes straight up the screen without drifting: slice 14, tests and a rendered check; Mark's on-device check after the deploy.
- The whole grave always stays on screen: **not carried in full.** The sim's hold keeps the opening inside the field, and at a side edge on its lowest row the drawn opening's near corners pass the column's edge by up to 10.9 CSS pixels at the ceiling (A25). For Mark's read.
- Mobs arrive across the full width of the top of the screen: slice 11's rendered check.
- A run plays from its first night to won or lost, and a replay of it verifies: slice 16.

## What this replaces, and what stood

R4 of `grave-in-the-ground.md` cut the hole with its own camera, 4.95 half-lengths up and 1.07 behind, and R7 ported build 7's painters that read it. What changed: the hole is cut by the scene camera (T4), standing over the ground point under the grave's placed point (A23), so the hole is a flat dark opening with thin walls and which walls show depends on where the grave is on the screen. What stood: the one projection, its dark depth 2.4 and falloff 2.6, the three faces, no near wall and no floor, the mouth, the lip and every painter's colours, counts and seeds. What R4 could not have known: that the field would be drawn through a camera too, and that one camera cannot show both the hole's walls and a sane field.

The glossary: the Field entry (`CONTEXT.md:123`) stays true under T10 (the renderer draws the whole field into the column). Two entries are proposed for when the pre-authorization in the charter has Mark's yes, and are otherwise carried to the branch close:

- **Camera**: The one still eye the ground, its dressing and the grave's hole are drawn through, tilted off straight down and standing high over the ground, looking at the ground under the middle of the screen. It never moves and never follows the grave. Near ground draws larger than far ground. _Avoid_: view, lens, projection, zoom.
- **Play layer**: Where everything the sim moves is drawn: every body, the grave and anything fired, straight across the screen at one scale and on the camera's own rows down it, at the camera's size for its row. The tilt changes how the play layer looks and never how anything in it moves. _Avoid_: overlay, HUD, foreground.

## Values are data

The camera's two values live in `CAMERA_VALUES` in `src/app/screens/game/camera.ts`: the tilt (32.5 degrees) and the height (42.5 starting half-lengths). The play layer's two numbers follow from the camera and the column and are computed once (`SCENE_PLAY_LAYER`), never typed. `OUTLINE_STEP` (4 field units) lives in the play layer's own data table. The prototype-derived drawing values (the ground grid's 18 by 40 and 0.08 overshoot, the stance step 4.75 ground units, the blade lean 62 degrees, the nearest share 0.12) live beside the renderer that reads them.

The camera, for the 540 by 760 column:

| | Value |
| --- | --- |
| Camera height | 1147.5 field units (42.5 times 27) |
| Distance to the target along its axis | 1360.578 |
| Lean (cosine of the tilt) | 0.843391 |
| Rise (sine of the tilt) | 0.537300 |
| Ground under the top row, the bottom row | -168.081604, 762.503300 |
| Ground under the top row's ends | -58.438897 to 598.438897 |
| Ground under the bottom row's ends | 40.784202 to 499.215798 |
| Scale at the top row, the middle row, the bottom row | 0.822071, 1.000000, 1.177929 |
| The horizon | 2135.7 column units above the middle row, off the column |

The play layer, worked independently in double precision for slice 10's tests:

| Field point | Column point | Scale | Ground under it | Rows per field unit along |
| --- | --- | --- | --- | --- |
| (0, 0) | (0, 0) | 0.822071 | (-58.438897, -168.081604) | 0.697895 |
| (100, 100) | (100, 72.678500) | 0.856101 | (71.425376, -45.636222) | 0.756871 |
| (270, 380) | (270, 312.386873) | 0.968341 | (270, 297.210848) | 0.968341 |
| (270, 608), the grave's start | (270, 559.555815) | 1.084074 | (270, 576.386319) | 1.213640 |
| (0, 608) | (0, 559.555815) | 1.084074 | (20.939582, 576.386319) | 1.213640 |
| (540, 608) | (540, 559.555815) | 1.084074 | (519.060418, 576.386319) | 1.213640 |
| (400, 700) | (400, 676.868170) | 1.139004 | (384.134800, 689.036071) | 1.339745 |
| (540, 760) | (540, 760) | 1.177929 | (499.215798, 762.503300) | 1.432881 |

- The stretch: 1.224454 ground units along per field unit. Scale one falls at field y 447.613.
- Column (123, 456) is field (123, 518.678147).
- Mob fire's size (A21) at field y 0, 190, 380, 608 and 760: 1, 1, 1, 1.213640, 1.432881.
- A lying thing at the grave's start draws at (270, 559.555815), 1.084074 across and 0.991168 down.
- A standing thing of half-height 11 at (270, 380): feet on column row 323.093772, its centre on row 312.386873, scale 0.973355.
- A body moving (3, 4) at field y 608 heads 1.017264 radians on the column (atan2 of down over across); straight down is 1.570796.
- The grave's frame (A29): across the larger of the scale and one, along the rows per field unit. At field y 608: 1.084074 and 1.213640; at field y 100: 1 and 0.756871.
- The grave's ground rectangle (A29): its half extent across times the larger of one and one over the scale at its far edge (1.191296 for a grave of size 48 at field y 100, 1 for size 27 at 608), along times 1.224454. For a grave of size 27 at (270, 608) its far and near ends draw on rows 527.244788 and 592.794441, which are its hitbox's rows.
- The grave's frame offset (A24), in grave units, for a grave at (270, 608) of size 27: a body at offset (13.5, -27) is (0.461223, -0.986044); at (0, 27), (0, 1.014357). For a grave at (40, 700) of size 27, offset (13.5, -27): (0.438980, -0.985347). For a grave at (270, 100) of size 48, offset (-24, -48): (-0.5, -0.980517). A velocity of (1, 2) field units per tick at a grave at field y 608 of size 27 is (0.034165, 0.074074) grave units per tick in the frame.
- The hole's stance (A23) over a grave of size 27 at field (40, 608), (270, 608) and (500, 608): ground (57.837422, 576.386319), (270, 576.386319) and (482.162578, 576.386319), nadir (7.857873, 19.801919), (0, 19.801919) and (-7.857873, 19.801919) half-lengths, height 42.5.
- A traced circle's largest gap between chord and arc at `OUTLINE_STEP` 4: 0.0625 field units at radius 32, 0.0074 at 270.

## The finish line of each slice

Mark approved a lighter process on 2026-09-27 (the branch charter, "How a slice runs"): the slices 10 to 16 named below were merged into four, **A** (old 14: steering back to plain field units, pins back), **B** (old 10 and 11: the play layer and every placement on it), **C** (old 12 and 13: traced areas, ground scroll, the grave, and the drag moved in from old 14) and **D** (old 15 and 16: the weapons check, the whole run, the deploy). Their entries are `docs/branch/records/slice-A.md` to `slice-D.md`; every test and check below is carried by one of them.

Slices 1 to 6 landed. Slices 7 and 8 of the first plan are dropped (T10). The rest, in the order they run (slice 11 of the first replan was split in two on the tech gate's advice, so the numbers after it moved up by one):

1. The camera and the pure placement math, tested; the capture tool. Landed.
2. The whole field drawn through the camera. Landed; slices 11 to 13 move the play things onto the play layer.
3. The hole cut by the same camera. Landed; slice 13 moves its stance.
4. Steering on the glass, and two readings. Landed; slice 14 takes the conversion back out and keeps the readings (A27).
5. The "before" batch on today's field. Landed; not used (its figures measure the hand slice 14 removes, and nothing compares against them).
6. The rename. Landed; undone in slice 9.
7. The field becomes the trapezoid. Dropped (T10).
8. Mobs across the far row, and a whole run watched. Dropped (T10); the whole run moves to slice 16.
9. The rename undone: the inverse of `7fac05ff88` scoped to `apps/hungry-grave`, and nothing plays differently.
10. The play layer's math, pure and tested against the table above. Nothing on screen changes.
11. Everything that moves, except the grave, placed on the play layer: mobs, the boss, mob fire and its scatters, corpses and treasure, skulls, wisps, the loss pops, the lob mark, the bursts, the Waking's source; mob fire's size (A21).
12. Territory's patches, the bell's cones and the belch's fronts drawn as exact images (A20), and the ground's scroll (A22).
13. The grave on the play layer (A23), drawn no smaller than its hitbox (A29): its mesh and hole at its spot on the glass, the re-bake in ground units, falls and the Undertaker going over the rim from where they were drawn (A24).
14. Steering back on the field: a key and the harness hand in plain field units, a drag through the play layer's inverse, and the bot's lists back to their values before slice 4, measured.
15. The weapons behave right: every weapon line's shots and effects, and the two bosses' patterns, measured and photographed at the left edge, the centre and the right edge.
16. A whole run played end to end in the rendered game, the proof that the sim is untouched, and the deploy for Mark's phone.

## For Mark's next play

The list is in `docs/branch/handoff.md`, "For Mark's next play".

## Outside this step

A lit 3D scene (research route A), the hands, real art for standing mobs and the prototype's topple on death (#38 owns the mob art), the grave's headstone and the prototype's far markers (both off by ruling), any colour work, the column's shape on a phone and the HUD (#151), haze, camera shake, a camera that follows the grave (T6 rules it out), the grave's top size and the size floor's comment (#39, A17), and any change to the sim.
