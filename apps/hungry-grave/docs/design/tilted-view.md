# The tilted view (#159)

The design record for the one step of the branch `tilted-view-build`. It holds the step's rulings, each with its evidence and how to reverse it. Mark's rulings come from his play of the throwaway prototype for #156 and are numbered T1 to T9 in his own words. The agent's calls are numbered A1 onward, each open to his overrule. No grill ran for this step: his words from the prototype play are the record, and `docs/branch/decision-log.md` carries them as numbered decisions. There is no ADR for this step; Mark ruled on #156 that the tilt is a design ruling and not an ADR.

## What was wrong

Mark, at the start of #156, after playing the built #148 branch: "I don't think I need to see the whole field on a lean-back. I don't even know how much it needs to lean back. I just feel like currently it feels very, very top-down even though the grave rendering seems to imply that it's tilted. I'm just trying to make the game kind of match up with the grave rendering a little bit."

The cause, found while building the prototype: the grave's hole is drawn from a camera about 12.2 degrees off straight down (`atan(1.07 / 4.95)`, design record `grave-in-the-ground.md` R4), and the hole reads as angled because it is deep. Nothing above the ground had any height and the ground itself did not lean, so the grave and the field it is cut into disagreed about where the player is looking from.

## The reference

The throwaway prototype for #156, built from #148's build 7 through six tilts. Branch `prototype/156-tilted-view` at `63f34824f3`, file `apps/hungry-grave/src/prototypes/tilted-view/index.html`, played at https://claude.ai/artifact/P7dbHNrp61T3d8wqQCSHAH (version 6, readout `TILT 6`). The camera is its `makeCamera`, `placeCamera`, `groundToScreen`, `screenToGround`, `belowGround`, `measureField` and `graveReach`. Coders learn from it and never lift a module out of it (`docs/agents/feature-flow.md`, "The prototype boundary"). Where an entry says a drawing piece is ported line for line, that is named in the entry, as #148's R7 did for the grave.

What the prototype taught, which the rulings below rest on:

- The hole's projection is the identity at depth zero, so putting the flat field under the grave's own camera draws nothing differently. The tilt has to be one camera for the whole scene.
- An orthographic lean (tilt 1) is invisible on even-noise ground. Only a real pinhole camera, where far things draw smaller, reads as tilted (tilt 2, Mark: "the ground itself, all of it, should adjust based on the tilt").
- One camera cannot both show the inside of the hole and give a sane field. Build 7's height pointed at the field is a fisheye; a high camera makes a graveyard but flattens the hole to a dark opening. Mark chose the flat dark hole (T4).
- A camera aimed at the grave swings the whole field as the grave moves. This game's camera is pinned to the screen and the grave moves about inside a still view (tilt 3).
- A clamp that holds only the opening lets the drawn lip hang off the screen (tilt 4).
- Under perspective the ground the screen sees is wider at the far edge, so spawning across the old width leaves the top corners empty (tilt 5).
- A key that moves the grave in ground units drifts sideways toward the vanishing point off the middle column (tilt 6). Keys and drag work on the glass.

## Mark's rulings

### T1. The game goes tilted, in V1, before the phone-first pass (#151)

On tilt 6, 2026-09-26: "This is looking real good. I think this is what we should be using as our guide for how we build the equivalent into the real app." He placed the build in V1 right after the `scripts/roadmap/v1.yaml` fix and before foundations (#152), and before #151, because the tilt touches all the art and #151 is the pass that sets the look.

### T2. The tilt is 32.5 degrees off straight down

Read off his phone on 2026-09-27 after 81 swallows.

### T3. The camera stands 42.50 grave half-lengths up, measured off the starting grave size, never the live grave

Read off the same screenshot. Measured off the starting size because a camera that rose with the live grave would flatten the view as the grave grows. The grave size of 48.0 in his shot is growth from swallowing, not a ruling.

### T4. The hole is cut by the shared scene camera, so it is a flat dark opening

He chose `shared` over the prototype's `own` camera, which kept build 7's low camera for the hole and showed its walls. The prototype's own words for the pair: the two "agree at the rim because the rim is the target", which is a cheat, and `shared` is the one honest camera.

### T5. Every other value stays at build 7's

The pull's reach 24 and strength 125, the tip threshold 0.55, the tip 0.3 s and the drop 0.75 s, and the headstone off. None of them moves in this step.

### T6. The view is still and the grave moves inside it

Confirmed by Mark before tilt 3: a still rectangle of world seen at an angle, with the grave moving inside it, is exactly what he wants. On tilt 2 he saw the field swing as he dragged and named the difference from hole.io himself, where the hole is always in the middle.

### T7. The whole grave stays on screen

On tilt 4, which held the drawn lip rather than the opening inside the screen: "Yes this looks good. I like what we're doing here."

### T8. Mobs fill the whole screen, top and sides

His ask on tilt 4: the tilt pulled build 7's rectangle in from the top and the sides, and mobs must fill the whole viewport. Tilt 5 made the field everything the screen sees and spawned across the full far edge at build 7's density per unit of ground.

### T9. A drag and a key both work on the glass

On tilt 5: "almost there", but W moved the grave in ground units, so off the middle column it drifted toward the vanishing point. Tilt 6 made a key a step on the screen, converted back to the ground through the camera's exact inverse, the same as the drag. #159's done-when says it plainly: "a drag moves the grave exactly under the finger and a held key moves it straight up the screen without drifting sideways, at any point on the screen".

## The agent's calls, open to Mark's overrule

### A1. The field is fixed to today's 540 by 760 column for this step, and the column's shape is Mark's to rule before the field slice

The agent's recommendation, and a decision Mark makes before slice 7 (the field) starts. The game's screen column is the 540 by 760 box `fitField` letterboxes into any viewport (`fitField`, `src/app/layout.ts:218-257`, through `centred`, `:143-159`: a uniform scale with the aspect kept). No ruling has set that shape for the phone: Mark's phone-first ruling of 2026-09-19 says the phone sets the look and the layout and the desktop shows the phone's design with bars at its sides, and #151 is the pass that sets the phone's layout, including the column. On a 390 by 844 phone today the column draws about 390 by 549 CSS pixels with bars above and below.

What is decided here: the column is one fixed shape on every device, whatever shape that is, so the ground the camera sees is one shape computed once in field units, identical on every build and device, and the sim can run on it without learning the viewport. That keeps ADR 0003's "no number anywhere is a device pixel" and ADR 0019's determinism across a phone and a desktop, which a field measured off each device's own screen, as the prototype's was, would break.

What is recommended, not decided: keep the 540 by 760 column in this step. A phone-tall column makes the field longer, and a longer field lengthens every time on screen: how long a body is in view before it reaches the grave, how long a revenant fires, how far food rides before it rots. That is a balance change across the whole game, and it belongs with #151, which sets the column, and #39, which tunes. The cost is that Mark tuned his values on a taller column: the prototype's column was the whole phone (`#column`, `width: min(100vw, 50vh)`, prototype `index.html:44-50`), 540 by 1169 field units on his 390 by 844 phone (`BUILD_7_FIELD_H = 1169`, `index.html:1835`). With his camera, a 760 column shows the middle of what he saw: the far edge 168 units up the field where his was 370 up, and the near edge 762 down where his was 1129 down. Near the middle of the screen everything draws exactly as he saw it. T2 and T3 are not retuned on this interim column; they are his values as he ruled them.

To reverse or change: the column's shape is one input to the camera (`COLUMN` in slice 1's camera module), and the field's six numbers follow from it. A taller column is a layout change (`fitField`, the HUD row) plus new field numbers, and tapes recorded before it stop at their first diverging checkpoint.

### A2. The field is the exact patch of ground the column sees, a trapezoid, not its bounding rectangle

The prototype's field is the rectangle around what the screen sees: its width is the far row's, so its bottom corners run past the screen (`measureField`, `index.html:1771-1778`, "bodies that drift out there have left the screen and are simply not drawn anywhere it looks"). The real game has mob fire and the prototype had none. A mob alive in a bottom corner is off the screen and can still aim at the grave, and it still counts against the section's live-body ceiling and the caps. So the sim field is the trapezoid itself: a body leaves when it is wholly past a slanted side edge, exactly as it leaves past the bottom today. Every point in the field is on the screen and every point of ground on the screen is in the field.

The trapezoid's sides are straight lines in ground units, because a screen column's edge projects to a straight line on the ground (checked numerically in slice 1). So the shape is six numbers and two straight-line functions, and every sim reader uses add, subtract, multiply and divide only.

On screen, a body that falls straight down near an edge walks off the side of the screen as it comes nearer, because nearer ground draws wider. That is the look of perspective and it is what "bodies leaving the narrower near span just leave" (#159) means.

To reverse: the bounding rectangle is the shape's four outer numbers; the side-line culls go back to the far row's span.

### A3. The field keeps its origin, and the old width and height keep every job that is a scale

The camera looks at the ground under the middle of the column, and the column is laid out so one field unit draws as one column unit there. So the column's middle row is still field x 0 to 540 at y 380, and the column itself is still 0 to 540 by 0 to 760 in column units. The layout, the HUD row, the field's clip, the boundary readout and the hit dim all work in column units and do not change.

`FIELD_WIDTH` and `FIELD_HEIGHT` (`src/game/field.ts:10-11`) are renamed `VIEW_WIDTH` and `VIEW_HEIGHT` and keep their values, in a slice of their own (slice 6) that changes no behaviour. Every reader that uses them as a scale keeps them: the base speed (ADR 0003, "crossing the field's width takes about two seconds", now true of the middle row, `src/game/tuning.ts:18`), the freshness (`tuning.ts:37`), the size ceiling (`tuning.ts:53`), the belch's burst radius (`src/game/belch.ts:38`). Every reader that uses them as an edge moves to the field's shape. The rename is what makes a stale edge reader visible: after slice 7 no reader of `VIEW_*` means an edge.

To reverse: re-origin the field so its far-left corner is zero, which moves every coordinate in the sim and the column mapping with it.

### A4. Mobs arrive across the far row at the density they arrive at today, per unit of ground

"Spawns cover the full far span at build 7's density per unit of ground" (#159). The far row is 656.88 units wide, 1.2164 times the middle row's 540 (`FAR_SHARE`). The rule: anything authored as spread across the field's width is authored against the middle row and is laid across the far row at the same spacing. So a Drip, a Rain and a Wall take `round(count * FAR_SHARE)` bodies across the far row, and the Undertaker's curtain takes `round(clods * FAR_SHARE)` clods across it. A File keeps its count and its lane is drawn across the far row. A V keeps its count and its shape and stays centred. A Pincer keeps its count and its shape and leads from the far row's corners. The mob cap's derivation counts arrivals by the same rule, because a cap that counted the authored numbers would be a bound below what the stage lands. The count stays on the wave (ADR 0047's absorbed 0006: "density tuning never edits a formation"); what changes is the width the count is laid across.

What it does, measured on paper: the screen shows 1.264 times as much ground as today (518,945 square units against 540 by 760), so at held density about a quarter more bodies are on screen at once, smaller at the far end. The near third reads sparser than the far third, which is density per unit of ground under perspective and was the same in the prototype.

What does not scale, and it is for Mark's read: the director's purse charges a card as authored, and the one section live-body ceiling in the stage (28, `src/game/stage/stage.ts:210`) stays as authored, so with more bodies per formation that ceiling binds sooner and the director adds less there.

What the longer field does, which is A2's and not the spawn rule's, and it is named here because it lands in the same batch: the field is 930.6 units long against today's 760, and every speed is held (A3). So everything is on the field longer. A body from the top of the field reaches the grave's starting row about 4.4 seconds later than a body from today's top edge did (168 units at the scroll of 38 a second), against a freshness window of about ten seconds (`FRESHNESS_SECONDS`, `src/game/tuning.ts:37`, which stays tied to half the old height), so food from a top kill arrives staler. With `hasEntered` at the field's top (`src/game/mobs.ts:390-392`), a revenant is armed for longer; the tech gate's arithmetic puts it at about 12.6 seconds longer, about five more shots, and the batch measures it. And the far row's outer quarter walks off the sides before the grave's starting row: at y 608 the field is 491.4 wide against the far row's 656.9, so about 25% of a Drip, Rain or Wall laid across the far row leaves at a side without ever passing the grave's row. None of this is retuned here; the numbers are #39's. Slice 7's and slice 8's batches report each one (mob fire shots, hits from fire, seconds on screen per mob, freshness at the swallow, food lost at a side against at the bottom) so the drift is a figure rather than a guess.

To reverse: `FAR_SHARE` at one keeps today's counts across the wider row, which is the same number of bodies on screen at a lower density per unit of ground.

### A5. The grave's hold covers its whole drawn lip, in field units

T7 in sim numbers: the grave is held so that its opening plus the lip's bake padding lies inside the field's trapezoid. The lip is baked with a padding of 0.3 of the grave's width on every side (`BAKE_PADDING.lip`, `src/app/screens/game/graveDrawingValues.ts:92`), and the bake's canvas is exactly that size (`GraveRenderer.ts:49-80`), so nothing of the lip can draw past it. The sim carries the share as its own named number and a cross test pins the two equal. The grave's pit and lip are drawn as a perspective mesh through the four corners of that ground rectangle (A7), and a projection carries a ground rectangle inside the trapezoid to a quadrilateral inside the column, so the drawn grave stays on the screen exactly, not to first order.

What it costs: a strip at each edge, 0.3 of the grave's width, where the opening cannot reach. A corpse lying in it cannot be swallowed and leaves the field; slice 7 pins that as a test, so it is a known property rather than something for Mark to discover in play. An offer's bodies and a strip's fallen rungs are already held clear of it (A14), and a feast lands at the boss's x, in the middle. If slice 7's or slice 8's batch shows treasure lost at a side, A14's hold extends to it. The prototype had the same strip (tilt 4).

To reverse: hold the opening alone (the share at zero), and the lip hangs off the screen at the edges again.

### A6. The hole's camera is the true scene camera, off the starting size

T4 chose the one honest camera. The prototype's `shared` mode cuts the hole with `holeCamera.height * size` using the live grave's size (`belowGround`, `index.html:776-784`), while its scene camera uses the starting size (`refreshView`, `index.html:1725`). So in the prototype the hole's camera rose with the grave, which is the very thing T3 rules out for the scene. The build cuts the hole from the camera that draws the field: 1147.5 field units up, which is 42.5 half-lengths of the starting grave and 17 half-lengths of a ceiling grave.

What it changes against what Mark played: at the starting size, nothing. At bigger sizes the walls show a little more: a wall's deepest drawn point sits at 0.947 of the rim's distance from the point the walls converge on at every size in the prototype, and at 0.909 at size 48 and 0.876 at the ceiling in the build. It is for his next play.

To reverse: cut the hole with the camera's height in the live grave's half-lengths.

### A7. What stands and what lies

A lying thing is laid on the ground: drawn at the camera's scale across and at the camera's scale squared times the lean down the screen, which is how fast the ground's own image changes down the screen at that point, so it foreshortens with the ground exactly where it lies (at the grave's starting point, 1.0989 across and 1.0185 down). The grave's pit and lip, which are large enough for the scale to change across them, are drawn as a perspective mesh through the four projected corners of their ground rectangle rather than at one scale. A standing thing is drawn upright at the camera's scale, with no lean, its feet on the near edge of its footprint so it rises from where it stands. The sim's footprint stays the collision box; the sim has no heights.

- Lying: the ground, the grave and its lip, corpses and treasure, Territory's patches, the bell's cones, the belch's eruption, the dressing's eyes and cracks, the Waking's source.
- Standing: mobs, bosses, the Undertaker in his ending scene until he goes over the rim, and the dressing's statues and cliffs.
- Airborne things have no height in the sim (skulls, wisps, mob fire, scatters): drawn upright at their ground point at the camera's scale. Mob fire is the one exception to shrinking: a hostile shot draws at the larger of the camera's scale and one, so near the top it keeps today's size and is never drawn smaller than its hitbox, and near the bottom it grows with everything else.
- A lying thing that turns (a corpse's teeter) foreshortens along the screen's vertical, never along its own axis.
- An art offset drawn in field units today (a patch's lob arc, a burst's drift) becomes a column offset at the camera's scale at that thing's ground point.
- A heading drawn on a body (the ghoul's wedge, a wisp) follows the direction the body moves on the screen.

"Headstones" in #159's done-when: the grave's own headstone is off (T5, and #148's decision 5), and #148 did not port the prototype's far markers (R8). The standing stone furniture of the real game is the dressing's statues, and they stand.

To reverse: anchor a standing thing at its footprint's centre, which trades rising from the ground for a drawn body centred on its box.

### A8. Near draws over far inside a layer, and ADR 0014's layer order does not move

Standing things in `mobBodies` are sorted by their ground y, nearer on top. The twelve layers (`src/app/screens/game/layering.ts:16-30`) keep their order, so mob fire still draws over everything and treasure still draws over mobs. No lit scene, so every colour stays declared and ADR 0014's value band is untouched. The boss sorts by depth with its adds, so a nearer add draws over it; this is the agent's call, reversible by lifting the boss into its own layer above the sorted bodies.

To reverse: drop the sort; the layer order was never touched.

### A9. The ground is a screen-laid mesh over today's baked ground, and there is no haze

The prototype's tilt 2 answer: a grid laid on the screen, each vertex asking the camera which ground it stands on, sampling a repeating tile (`buildGroundMesh`, `updateGroundMesh`, `index.html:2012-2026` and `2079-2106`). The build keeps #148's baked ground (R8) as the tile, adds a wrap across its side edges the way R8 added one across its top and bottom, and samples it with repeat on both axes. The prototype's grid (18 columns, 40 rows, 0.08 overshoot, `index.html:1962-1966`) is the starting value. The ground's scroll stays the sim's own scroll, in ground units, so near ground runs faster on the screen than far ground.

No haze: the prototype hazes the ground where it draws below 0.15 of its size (`GROUND_FADE_SCALE`, `index.html:1975`). At his values the smallest scale on the column is 0.822, at the top row, so there is nothing to haze.

Grass: the prototype draws a tuft's blades longer as the camera tilts (`BLADE_LEAN` and `bladeReach`, `index.html:752-761`), because a blade leans back 62 degrees off the vertical and the tilt shows more of it. At 32.5 degrees that is 1.3485 times build 7's length. The ground's tufts take it.

To reverse: the ground is one renderer, and the flat tiling sprite is one commit back.

### A10. The hole is baked for the near edge's scale and baked again when the camera's stance over it moves

The shared camera's stance over the grave (where it stands, in the grave's half-lengths) moves as the grave moves, and which walls show moves with it. The hole is baked again when the stance moves more than half a half-length, the prototype's own threshold (`keepHoleCurrent`, `index.html:2999-3004`). It is baked at the pixel density of the column's nearest row (scale 1.178), so moving the grave up and down never forces a bake for resolution.

What it costs: a bake is 1.5 ms at the start size and 2.1 ms near the ceiling on a desktop (R7), and a fast drag across the field bakes several times a second. Slice 3 measures it with the frame budget tool.

To reverse: the threshold is one number; at zero the hole bakes every frame the grave moves.

### A11. Steering converts on the glass, around input models that do not change

`TouchSteer` and `KeySteer` (`src/input/touch.ts:82-243`, `src/input/keys.ts:88-134`) stay pure and keep their logic. They are handed points in column units and the grave's drawn point, and what they return is a step on the column. The app turns that step into a ground move through the camera at the grave's drawn point (`stepOnColumn`), for a drag and a key alike. The tape records the move the sim consumed, so a replay never recomputes the camera.

A key moves the grave at one speed on the screen everywhere. In ground units that is faster near the top and slower near the bottom: one column unit across is 1.216 field units at the top row, 1.000 on the middle row, 0.910 at the grave's starting row and 0.849 at the bottom row; one column unit along is 1.754, 1.186, 0.982 and 0.855. ADR 0003's two-second crossing holds across the middle row. The harness's hand moves on the glass the same way (slice 4), so its figures measure the game a player steers.

What the screen-constant speed means on screen, and it stays: everything the scroll carries (bodies, corpses, fire moving down) speeds up on the screen as it comes nearer, from 0.57 of its ground speed at the top row to 1.17 at the bottom row, while the grave keeps one speed on the glass. So near the bottom the grave is slow against what it dodges, compared with today. The game design gate's prior art: Ikaruga keeps its play on a flat plane and uses perspective for the scenery. This build keeps the grave's speed flat on the glass, which is Mark's T9, and puts the question on his next play.

To reverse: hand the input models ground points again, which brings back the sideways drift T9 ruled out.

### A12. The field change moves no tape version; older tapes stop at their first diverging checkpoint

The planning brief called for bumping the tape format and witness versions. ADR 0043 keeps three boundaries apart: the format version is the wire's grammar, the witness version is the fold's definition, and "none of them may ever substitute for another". This step changes neither the bytes nor what the witness folds. A tape recorded before slice 7 replays under the new field, diverges at its first checkpoint after something touches an edge or a spawn lands, and stops there and says so, which is ADR 0019's rule and exactly how #148's slice 1 treated a rule change ("Tapes recorded before this slice stop replaying at their first diverging checkpoint. That is what ADR 0019 intends"). No run is stored for anyone else yet. `GOLDEN` in `src/dev/digest.ts` re-pins wherever its scenario's state moves, with the cause written beside it. If a slice does widen the fold or the wire, that slice moves the version it changed and says why.

To reverse: a precise refusal would record the field's shape in the tape's starting condition, which ADR 0056's amendment argues against for anything pinned to the build.

### A13. The camera lives in the drawing code, and the sim holds only the field's six numbers

The camera needs cosines and sines, and code under `src/game` may not call them (ADR 0019). So the camera module is drawing code under `src/app/screens/game`, and `src/game/field.ts` carries the trapezoid as six literal numbers. A cross test asserts that the camera's visible ground equals those numbers to 1e-9, so neither can move alone.

To reverse: nothing to reverse; it is where the code lives.

### A14. Food and fallen rungs land where the grave can still reach them

An offer's three bodies and a strip's fallen rungs are shifted whole to stay inside the field (`groupCentre`, `src/game/offer.ts:158-161`). They fall straight, and the field narrows toward the bottom, so a group held inside the far row could walk off the side before it reached the grave. They are held inside the near row's span instead, less the grave's reach, so the whole group stays swallowable all the way down.

If a batch shows other treasure lost at a side (A5), the same hold extends to it.

To reverse: hold them inside the row they land on.

### A15. The Waking's depth and sweep are read along the field's length

The source opens at a share of the field's height and sweeps by its share down the field (`OPENS_BELOW`, `sweptTo`, `src/game/stage/setPiece.ts:73`, `:93-99`). Both are read as a share of the field's length from its top edge to its bottom edge.

To reverse: read them against the middle row's height again, which opens the source higher on the screen than before.

### A16. A mob split by the far row's edge walks in; inside the field, a mob falls straight

#76's walk-in (`fall`, `src/game/mobs.ts:475-485`) keeps a body placed outside the field from descending unseen at the edge. It is measured against the far row's span, where every formation places its bodies. Inside the field a faller falls straight and leaves when it is wholly past a side edge (A2). Measuring the walk-in against the slanted edge instead would march every edge faller down the side of the screen.

To reverse: measure the walk-in against the side edge at the mob's own y.

### A17. The size floor's stated reason no longer holds at the top of the screen, and its comment says so

`SIZE_FLOOR`'s comment (`src/game/tuning.ts:59-66`) gives its reason as a floor grave being about 13 CSS pixels across on a 390-wide phone, "narrower than this and it stops reading as a grave shape". At the top row the camera draws at 0.822, so a floor grave there is about 10.7 CSS pixels across. The floor is not moved (it is #39's), and its comment is restated in slice 7 to say the reason holds on the middle row and what it comes to at the top, so the next reader does not trust a figure the camera broke.

To reverse: nothing to reverse; it is a comment made true.

## What the build must carry, from #159

#159's context comment lists what the real build must carry from tilt 6. Each item, and where it lands:

- One still perspective camera pinned to the screen, target the ground under the screen's centre, tilt 32.5, height 42.5 starting half-lengths: slice 1 builds it, slice 2 draws with it. Carried.
- The field is everything the screen sees, far edge under the top, width the far row's, near edge under the bottom: slice 7, as the exact trapezoid (A2). Carried, with the shape changed from the prototype's rectangle and the reason recorded.
- Spawns cover the full far span at build 7's density per unit of ground: slice 8 (A4). Carried.
- Bodies leaving the narrower near span just leave: slice 7 (A2, A16). Carried.
- Standing things rise along the screen vertical and scale with distance; lying things lean with the ground; near draws over far: slice 2 (A7, A8). Carried. Walkers are the placeholder mob silhouettes, which #38 owns; the prototype's topple animation is not carried (outside this step).
- The hole is cut with the shared scene camera, flat and dark: slice 3 (T4, A6). Carried.
- Input on the glass, drag and keys as column steps through the exact inverse at the grave's drawn point: slice 4 (A11). Carried.
- The grave's whole drawn extent held inside the field, then the screen: slice 7 (A5). Carried as one hold, because the field is the screen.

What #159's context comment says the prototype does not answer:

- The field staying one size on every device: A1.
- The glossary's Field entry and ADR 0003's "one fixed 540 by 760 unit field that the renderer scales to any screen": the glossary is edited in slice 7 (below); ADR 0003 is not edited and its stale sentences are on the handoff's "For Mark's read".
- ADR 0003's ceiling and base speed stated against the field's width: A3, measured on the middle row.
- The shared camera replacing R4's camera for the hole: "What this replaces" below.
- Things near the top draw smaller, mob fire included: A7, and on "For Mark's next play".

#159's done-when, and the slice each line is proved in:

- The ground leans away and far things draw smaller: slice 2, rendered check.
- Walkers, headstones and grass stand up: slice 2 (A7, A9).
- The grave reads as a hole cut into the same leaning ground: slice 3.
- The view stays still while the grave moves: slice 2 (the camera is a constant) and slice 4 (drag on the glass).
- A drag moves the grave exactly under the finger; a held key goes straight up the screen without drifting: slice 4, tests and a rendered check; Mark's on-device check after the deploy.
- The whole grave always stays on screen: slice 7.
- Mobs arrive across the full width of the top of the screen: slice 8.
- A run plays from its first night to won or lost, and a replay of it verifies: slice 8, a whole run recorded, replayed and watched.

## What this replaces, and what stood

R4 of `grave-in-the-ground.md` cut the hole with its own camera, 4.95 half-lengths up and 1.07 behind, about 12.2 degrees off straight down, and R7 ported build 7's painters that read it. What changed: the hole is cut by the scene camera (T4), 42.5 starting half-lengths up at 32.5 degrees, standing wherever that camera stands over the grave, so the hole is a flat dark opening with thin walls and which walls show depends on where the grave is on the screen. What stood: the one projection (a point below the ground draws where the camera's ray through it meets the ground), its dark depth 2.4 and falloff 2.6, the three faces, no near wall and no floor, the mouth, the lip and every painter's colours, counts and seeds. What R4 could not have known: that the field would be drawn through a camera too, and that one camera cannot show both the hole's walls and a sane field.

`FIELD_WIDTH` and `FIELD_HEIGHT` stop being the field's edges (A3). The glossary's Field entry changes with slice 7, in this wording:

- **Field**: The patch of ground the sim runs on: exactly the ground the camera sees, wider at its far edge than at its near one. Everything in the sim is field units, never device pixels, and the field is one fixed shape on every screen. Its numbers are the camera's to decide and are not vocabulary. _Avoid_: screen, viewport, canvas, arena.

And a new entry beside it:

- **Camera**: The one still eye the whole field is drawn through, tilted off straight down and standing high over the ground, looking at the ground under the middle of the screen. It never moves and never follows the grave, so the grave moves about inside a view that stays put. Near things draw larger than far ones, and the hole is cut by the same camera. _Avoid_: view, lens, projection, zoom.

## Values are data

The drawing's values live in one table in the camera module under `src/app/screens/game`: the tilt (32.5 degrees) and the height (42.5 starting half-lengths). The prototype-derived drawing values (the ground grid's 18 by 40 and 0.08 overshoot, the stance threshold 0.5, the blade lean 62 degrees, the nearest share 0.12) live beside the renderer that reads them, each with the prototype line it came from.

The sim's values: the field's six numbers in `src/game/field.ts`, and the grave's reach share in `src/game/grave.ts`, each pinned to the drawing by a cross test. They are compiled constants, not tuning rows: the field is not tunable (it lived in `field.ts` rather than `tuning.ts` for that reason, `field.ts:4-9`), and a tuning row would travel in the tape header, which A12 argues against.

The numbers, for the 540 by 760 column, worked out independently for slice 1's tests:

| | Value |
| --- | --- |
| Camera height | 1147.5 field units (42.5 times 27) |
| Distance to the target along its axis | 1360.578 |
| Lean (cosine of the tilt) | 0.843391 |
| Rise (sine of the tilt) | 0.537300 |
| Field top (under the top row) | -168.0816 |
| Field bottom (under the bottom row) | 762.5033 |
| Far row | -58.4389 to 598.4389, 656.878 wide |
| Near row | 40.7842 to 499.2158, 458.432 wide |
| `FAR_SHARE` | 1.216440 |
| Scale at the top row, the middle row, the bottom row | 0.822, 1.000, 1.178 |
| The camera's foot on the ground | (270, 1111.04), below the screen |
| The horizon | 2135.7 column units above the middle row, off the column |
| Ground on screen against today | 1.264 times |
| Lying things down the screen (scale squared times lean) at the top, middle, start and bottom rows | 0.570, 0.843, 1.019, 1.170 |
| Field units per column unit across, at the top, middle, start and bottom rows | 1.216, 1.000, 0.910, 0.849 |
| Field units per column unit along, at the same rows | 1.754, 1.186, 0.982, 0.855 |

## The finish line of each slice

1. The camera and the pure placement math: its projection both ways, the ground the column sees, where it stands over a grave, a step on the column, where a lying, standing or airborne thing draws, and the ground's grid, all tested against the numbers above. The capture tool that later slices photograph with is proven on today's game. Nothing in the game changes.
2. The whole field drawn through the camera. The ground leans away and scrolls, far things draw smaller, mobs and statues stand up with the near ones in front, corpses and patches lie on the ground, grass is longer, mob fire never draws smaller than today, and the grave sits in the leaning ground as a perspective mesh with its build 7 hole. The column's frame, clip, HUD and buttons do not move. A replay draws the same way.
3. The hole cut by the same camera: a flat dark opening whose thin walls change as the grave moves about the screen, and a fall that goes into that same hole.
4. Steering on the glass: a drag keeps the grave under the finger and a held key moves it straight along the screen at one speed, at the top, the middle and the bottom of the screen. The harness's hand steps on the glass too, and the harness can read mob fire shots and each mob's seconds on screen.
5. The "before" batch: the harness's figures for today's field, played with the hand that steers on the glass.
6. The rename: `FIELD_WIDTH` and `FIELD_HEIGHT` become `VIEW_WIDTH` and `VIEW_HEIGHT`, and nothing plays differently.
7. The field is what the camera sees: nothing lives off the screen, bodies walk off the sides as they come near, a push never throws a body off the slanted sides, the grave's whole drawn lip stays on screen at every edge, food lost at a side is counted apart from food lost at the bottom, and a full stage still plays to won or lost with no fault.
8. Mobs arrive across the whole top of the screen at today's density per unit of ground, and a whole run is recorded, replayed and watched from its first tick to its end.

## For Mark's next play

- Does the game now look like it agrees with the grave: does the ground lean the way the hole does?
- Far things draw at 0.82 of their size at the top of the screen. Does mob fire near the top still read, and does a floor-size grave near the top still read as a grave (about 10.7 CSS pixels across there on a 390-wide phone, against the 13 the size floor was set for)?
- The flat dark hole at a big grave shows a little more wall than the prototype did (A6): does it still read as the hole he chose?
- Do the placeholder mobs read as standing on the ground, with the near ones in front?
- Does the boss still read when a near add draws over it?
- Is a quarter more on screen at once (A4) a better field or a busier one, and does the sparser near third read as space to move or as empty?
- Bodies walk off the sides as they come near (A2): does that read as the field or as things escaping?
- A drag at the top and at the bottom of the screen, and a held key across the screen: does the grave go exactly where he means?
- Does dodging near the bottom feel slower? Everything coming down speeds up on the screen as it nears while the grave keeps one speed on the glass (A11).
- Revenants are on the field longer and fire more before they leave (A4): does the fire near the top read as more than before, and does it read fairly?
- The boss stands a little lower on the screen than today (slice 7): does it crowd the grave?

## Outside this step

A lit 3D scene (research route A), the hands, real art for standing mobs and the prototype's topple on death (#38 owns the mob art), the grave's headstone and the prototype's far markers (both off by ruling), any colour work (the ground and the grave are his rulings and the tufts' colour waits on his play), the column's shape on a phone and the HUD (#151, unless Mark rules otherwise on A1 before slice 7), haze, camera shake, a camera that follows the grave (T6 rules it out), and the grave's top size (#39).
