# Slice 4: the fall (design record R5)

Follow-along row 4: "Swallowed food tips over the rim where it crossed and falls into the dark. Food lying across the mouth leans in first, which is the tell for the new swallow rule."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. This entry is the planning half of the flow. Your scratch folder is `local/148-slice-4/` in the worktree. Load the `pixijs-skills:pixijs` skill before you write Pixi code. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read on the tree at `c96aeabe3d`, before slices 1, 2 and 3 landed; nothing under `src/` changed between `c309fc812b` and that commit, so the earlier entries' numbers and these agree. The name beside each number is what binds. A name that is gone, or that does something else, is a false claim: stop and report it.

Slices 1 to 3 have landed, so the four named things below exist now; check each by name before you start. In `GraveRenderer.test.ts` the mouth layer holds four children (`MOUTH_CHILDREN`), and the file's `mouthOf` helper answers `children[1]`, the cut and its walls; `falls` is the third. Four named things did not exist when this entry was written, because an earlier slice creates them. `shareOverMouth` in `src/game/tip.ts` and the `swallow.tipThreshold` row (slice 1). The corpse's velocity `vx` and `vy` (slice 2). The `falls` container on the grave's renderer, `src/app/screens/game/graveProjection.ts` and `src/app/screens/game/graveDrawingValues.ts` (slice 3). If one of them is missing when you start, stop and report rather than building it yourself.

## What this slice builds, and why

Mark, from play: food should look "pulled or falling or sucked into it as you get close", and a body that goes in should not "poof". Slices 1 to 3 made food need most of itself over the mouth, gave the grave a pull, and cut the grave into the ground. Nothing falls in yet: the corpse's sprite is hidden on the tick it is swallowed (`FieldRenderer.syncCorpses` sets `visible` from `corpse.alive`, `:303-305`). This slice draws the fall, and it draws the teeter that tells a player the new rule is there.

When it works, a player sees:

- A swallowed corpse goes over the edge at the point of the rim it crossed, never from the middle of the hole, then drops into the dark, shrinking and darkening until the dark takes it. It never lands.
- The fall keeps up with a moving grave, because it is drawn inside the hole.
- A feast falls from the rim while the grave roughly doubles on the same tick, and it still looks like it went over the edge it crossed.
- Many swallows at once all show their own fall.
- A corpse lying across the mouth leans toward the hole, shakes and darkens, more as it nears the threshold, and stands back up if the grave slides out from under it.
- A replay shows the same fall the live game showed.
- The payout is still seen at the tip: the growth, the "+1" and the chime all land when the body goes over, not when it reaches the dark.

Build 7 of the prototype is the reference for how the fall looks and eases (`.claude/worktrees/148-grave-fall`, `apps/hungry-grave/src/prototypes/grave-fall/index.html`). Learn from it. Copy no code out of it.

## The event, exactly

The rules decide the tip; the drawing code shows the fall from the swallow's event (R5, agent's call A6). So the event carries what the rules know at the tip, as values and never as a reference to the corpse, because slots are reused inside a fall's lifetime (`corpses.ts:155-159` states that rule already).

`Swallowed` (`src/game/events.ts:13-19`, in the `SimEvent` union at `:706`) gains, beside the `kind`, `freshness` and `payout` it carries today: the food's centre as an offset from the grave's centre (`offsetX`, `offsetY`), its `halfExtent`, its way (`vx`, `vy`), the `graveSize` at the tip, and its look (`tier`, `treasureBody`, `line?`). `Swallowable` (`src/game/swallow.ts:21-44`) gains the food's `x`, `y`, `halfExtent`, `vx` and `vy`; it already carries the look. `asSwallowable` (`src/game/corpses.ts:160-170`) fills them from the corpse. `swallow` (`src/game/swallow.ts:111-121`) is the one place that subtracts: it reads `state.grave` for the centre and the size and writes the offsets, so the offset arithmetic lives once. It is the only caller of `swallow` in the tree (`src/game/step.ts:141`, inside `swallowFood`, `:134-142`).

Tapes record commands and the witness folds state, so a widened event moves no tape, no pin and no version. Its readers in shipped code are three readings and nothing else: `src/dev/readings/freshness.ts:34`, `src/dev/readings/wakingSwallows.ts:75`, `src/dev/readings/powerUpLedger.ts:135`. None of them reads a field this slice adds, so none of them changes. Sound never reads `swallowed`: `clipFor` branches on `chimed`, `tolled`, `graveHit` and `belched` and returns null for the rest (`src/app/sound.ts:55-63`), and the swallow clip comes off `chimed.treasureBody` (`:56-58`). Two tests build a `Swallowed` literal by hand and must gain the new fields: `src/game/__tests__/swallow.test.ts:303-308` and the `EVERY_EVENT` list at `src/app/__tests__/sound.test.ts:65`.

## The fall, exactly

A fall is drawing state born of a tick, in the pattern every transient in the registry already follows: `scatter.born = run.tick` (`FieldRenderer.ts:338`) and `const age = run.tick - scatter.born` (`:357`). Never a wall-clock tween, so pause, the resume countdown and a replay all show the same fall.

- A fall is born on the `swallowed` event, at the run's tick.
- Its place is kept in the grave's proportions and multiplied by the grave's size on every frame. At birth the unit place is `offsetX / graveSize`, `offsetY / graveSize`, and the unit way is `vx / graveSize`, `vy / graveSize`. In that space the mouth is `x` from -0.5 to 0.5 and `y` from -1 to 1, because the grave's half height is its size and `graveWidth` is `size * 2 / GRAVE_ASPECT` with `GRAVE_ASPECT` 2 (`src/game/grave.ts:91-93`, `src/game/tuning.ts:50`). This is what makes a feast fall from the rim while the mouth doubles under it: a feast pays 30.375 of size on the tip tick, and a place held in field units would start the next frame in mid-hole, which is the "transported to the middle" read Mark rejected.
- The food's drawn size stays in field units. The body does not grow because the grave grew; only the projection's own shrink with depth changes it.
- The hinge is the point of the rim the body crossed: the nearest point on the mouth's rectangle in unit space to the body's unit place. The body turns about it by the tilt (1.36 rad) over the tip time (0.30 s), keeping its way, and then falls under gravity over the drop time (0.75 s), easing toward the middle of the hole as it goes: Mark, decision 7, "it slides down the side until there's no more side and then it kind of eases towards the middle of the blackness". Take the easing's shape from build 7.
- Depth runs through the same projection and the same light curve the walls use: `belowGround` and `lightAtDepth` in `src/app/screens/game/graveProjection.ts` (slice 3). A body at the dark depth is as dark as the wall beside it.
- Food longer than the opening folds in to fit.
- The whole fall is 0.30 s plus 0.75 s, which is 63 ticks at 60 Hz (`TICK_HZ`, `src/game/clock.ts:4`). That is inside the replay lead-in of 90 (`REPLAY_LEAD_IN_TICKS`, `src/app/screens/game/transients.ts:35`) and under the registry's current longest lifetime of 68, so the lead-in does not move.

## The teeter, exactly

The teeter is the tell for the new rule. Without it a corpse lying 40% across the mouth tells the player nothing and "a sliver stays out" reads as a missed swallow.

Per live corpse, each frame, from state and nothing held: `share = shareOverMouth(corpseHitbox(corpse), graveHitbox(run.grave))` (`src/game/tip.ts`, slice 1; `src/game/corpses.ts:145-152`; `src/game/grave.ts:99-107`). The lean is `(share - teeterStart) / (threshold - teeterStart)`, clamped to 0 and 1, where `teeterStart` is a drawing row starting at 0.12 (the prototype's figure) and `threshold` is `run.conditions.tuning.swallow.tipThreshold`, read off the run and never off a constant. At a lean of 1 the body sits at the teeter's own tilt, leaning toward the mouth's centre, shaking at the teeter's amplitude and pace, and darkened by the teeter's darkening factor multiplied into the freshness tint rather than replacing it.

`syncCorpses` (`FieldRenderer.ts:288-324`) sets a food sprite's `visible` (`:303-305`), its geometry on a look change (`:307-318`), its `position` (`:319`) and its `tint` (`:322`), and never its `rotation`, `scale` or `alpha`. So the lean, the shake and the darkening are new per-slot work in that loop, and a lean of zero must be written every frame too: a sprite left rotated would stay rotated after the grave slid out from under it.

## Parts of the code this slice touches

- New module `src/app/screens/game/fall.ts`. Its concept is the Fall of the glossary: where a falling thing draws, how big and how dark, as a pure function of its age. No Pixi import at all, not even a type import, so its tests run without Pixi and slice 5's ending scene can use it for the Undertaker's own drop (design record R6, "he tips, folds in, and falls with the shared fall"). Name that citation at the export, as the cited-future rule requires. It works in the grave's unit space and calls `graveProjection.ts`. Public interface: the fall's own record (the unit place, the unit way, the half extent in field units, the born tick), a function that answers where it draws at an age, and the constant `FALL_TICKS`.
- New module `src/app/screens/game/FallRenderer.ts`: the pool that draws falling food. Its public interface takes the shape `StormRenderer` already has for a renderer with per-run memory: `attach(into: Container, caps: Caps)` (which forgets the previous run on its way through, as `StormRenderer.attach` does at `:585-587`), `detach()`, `forgetPreviousRun()`, `sync(run: RunState)`, and the birth seam `swallowed(run: RunState, event: Swallowed)`. It also exports `FALL_RENDERER_TRANSIENT_TICKS`, in the shape of `FIELD_RENDERER_TRANSIENT_TICKS` (`FieldRenderer.ts:38-40`). The pool is sized at the corpse cap through the same grow-only `fill` pattern (`FieldRenderer.ts:46-52`, `:192-197`), recycles the oldest fall when a tick swallows more than it holds, and says so out loud, because nothing abnormal is silent.
- It takes the container it draws into rather than a layer. This is the main session's call, and it is what lets the frame budget screen measure falls without a grave renderer. See "The frame budget screen" below.
- `src/app/screens/game/transients.ts`: `FALL_RENDERER_TRANSIENT_TICKS` joins the registry (`:15-19`) as a fourth owner. `src/app/screens/game/__tests__/transients.test.ts:21-27` sums three owners' key counts by name; that sum gains the fourth term, and the first test's `toMatchObject` list gains the fourth owner. Both are edits to existing tests that the ruling requires; say them in your note.
- `src/app/screens/game/graveDrawingValues.ts` (slice 3): this slice's rows. The tip time 0.30 s, the drop time 0.75 s, the tilt 1.36 rad, the gravity and the easing's constants, the teeter's start 0.12, its tilt, its shake and its darkening. This is the step's one table of drawing values, named for the grave because the grave is what this step draws. No number is compiled into a draw call.
- `src/app/screens/game/FieldRenderer.ts`: the teeter, inside `syncCorpses` (`:288-324`). It imports `shareOverMouth`, `corpseHitbox` and `graveHitbox` from `src/game`, as it already imports `INVULNERABLE_TICKS` and the field's bounds.
- `src/app/screens/game/GameScreen.ts`: construct the fall renderer beside the grave (`:247`), attach it in `dressField()` after `this.grave.attach(this.layers)` (`:333`) because `falls` is that renderer's child, forget the previous run where the field renderer does (`beginDrawing`, `:321-323`), add one line to `announce` (`:529-540`) for the `swallowed` event, and one `this.falls.sync(run)` to `syncScreen` (`:510-522`).
- `src/app/screens/ReplayScreen.ts`: the same four places, so a replay shows the same fall. `dressField` (`:125-133`, grave at `:132`), `beginDrawing` (`:179-183`, which calls `this.stormRenderer.forgetPreviousRun()` at `:182` for exactly this reason), the event loop inside `syncScreen` (`:193-204`), and the renderer calls at `:205-215`.
- A finding rides with this slice. The comment at `ReplayScreen.ts:196-200` says the loss announcement is mirrored from `GameScreen.announce`, and no `watchLoss` call exists in the file. What is mirrored is the weapon strip's blow-up, and nothing else. Make the comment true by rewriting it to say what the code does, and do not wire `watchLoss` into the replay: its product is `this.loss`, which `GameScreen` hands to the ladder (`GameScreen.ts:502`), and the replay carries no HUD to hand it to (`ReplayScreen.ts:26-34`), so a `watchLoss` there would be state with no reader. Say in your note that you did this and why.
- `src/app/screens/FrameBudgetScreen.ts`: falls in its rows. See below.
- `src/__tests__/boundary.test.ts`: a new row in `BOUNDARIES` (`:51-137`) that forbids any Pixi import in `fall.ts`, in the shape of the `sound.ts` row (`:114-120`) and of the row slice 3 adds for `graveProjection.ts`.

## The frame budget screen

`FrameBudgetScreen` builds a `FieldRenderer` and nothing else (`:98`), and its render column times exactly that one renderer's pass (`update`, `:156-175`, the sync at `:163`). It does own a full layer stack already (`private readonly layers = new FieldLayers();`, `:97`, added to its field container at `:130`).

The call, and it is settled here: the screen supplies the container and builds no grave renderer. The fall renderer takes the container it draws into at attach, exactly as every other renderer takes its layers (`GraveRenderer.attach`, `:184`; `StormRenderer.attach`, `:585`). The game screen and the replay screen hand it `this.grave.falls`; the frame budget screen hands it `this.layers.layer('graveMouth')`, which it already has. Two reasons. A grave renderer on that screen would fold the grave's own draw into every row, so slice 3's figures and this slice's figures would be measurements of two different things, and the point of the row is the falls' own cost. And the rules say it: a display component is a dumb view, and the driver owns the graph with every hop declared in one place (`.claude/rules/code-core.md`, "Control and state"), so each screen declares where falls draw.

Standing the falls is the screen's own work. A fall is drawing state and not field state, so `standSyntheticField` cannot stand one: `FieldSize` is how many bodies and how much food stand on the field (`src/dev/syntheticField.ts:12-16`), and nothing in the run knows a fall exists. `FieldSize`, `ROUND_ZERO_FIELDS` and the table's columns do not change (`src/dev/frameBudget.ts:18-25`, `:91-94`). Instead the screen births falls through the same public seam the game screen uses, `ceil(wanted / FALL_TICKS)` of them per frame, so after one fall's lifetime the row holds `wanted` falls in the air and holds there, and the pool never wraps and never logs a recycle. `wanted` is the row's own corpse count clamped to the pool, so falls scale with the row exactly as corpses do. Say in your note that this is a headroom figure and not a field a player can reach, which is what the record already says of its two largest rows (`src/dev/frameBudget.ts:9-17`). The fall renderer is forgotten between rows where the field renderer is (`beginNextField`, `:178-190`, the forget at `:182`) and detached in `reset()` (`:228-233`).

## What must stay unchanged

- Every rule and every payout. `src/game/step.ts`'s tick order, `src/game/swallow.ts`'s payouts and the tick they land on. The fall pays nothing and can be interrupted by nothing. A run plays out the same whether or not the fall is drawn, and the harness needs no renderer (R5, A6).
- `WITNESS_VERSION`, `GOLDEN` and the bot's seed lists. A widened event folds nothing.
- The tape format and the replay lead-in. 63 ticks is inside 90 and under the registry's current longest lifetime of 68 (`transients.ts:21-34`).
- The layer stack. Falls draw inside `graveMouth`, which is already under food and under `graveRim`, so ADR 0014 is untouched and no new layer appears (`layering.ts:16-29`).
- `GraveRenderer`'s public interface and everything slice 3 drew.
- `src/game` imports nothing from `src/app`, `src/dev` or Pixi.

## Pins

- No pin in the rules moves. The proof is verification step 1.
- If `GOLDEN`, `WITNESS_VERSION` or a bot seed list moves, stop and report: nothing in this slice can move one.

## Planned tests

Pin every name as a `test.todo` first, against stubs that return a wrong value of the right type, so each test is red on its own assertion and never on a missing module. Each test carries a comment that cites R5 or the decision it enforces. Expected values are worked by hand from the arithmetic above, never from running the code.

`src/app/screens/game/__tests__/fall.test.ts`:

1. a fall starts at the place the body crossed the rim, and not at the middle of the hole
2. a fall's place is held in the grave's proportions, so the same fall draws twice as far out once the grave has doubled
3. a falling body's own size stays in field units while the grave grows
4. the tip turns the body to the full tilt over the tip time and no further
5. the drop carries the body deeper on every tick of the drop time
6. a falling body eases toward the middle of the hole as it goes down (decision 7)
7. a body at the dark depth is as dark as the wall beside it, on the walls' own curve
8. a fall keeps the way the food was swallowed with, so a body pulled in fast starts out faster than one that crept in
9. a body longer than the opening folds to fit
10. a fall is over after the tip time and the drop time together, and never lands

`src/app/screens/game/__tests__/FallRenderer.test.ts`:

11. a swallowed event puts one fall in the air at the place the event names
12. a fall follows the grave, because it is drawn in the grave's own frame
13. a fall that is over hides its sprite
14. a tick that swallows more food than the pool holds recycles the oldest fall and says so
15. the falls draw into the container the renderer was attached to and add no layer
16. a new run forgets the falls of the one before it

`src/app/screens/game/__tests__/FieldRenderer.test.ts`, in a new block "the teeter (grave-in-the-ground R5)":

17. a corpse with nothing over the mouth stands straight
18. a corpse leans further the closer its share is to the threshold
19. a corpse at the threshold leans the full tilt
20. a corpse the grave slides out from under stands back up
21. the teeter reads the threshold off the run's own tuning record
22. a leaning corpse still wears its freshness tint under the teeter's darkening

`src/app/screens/game/__tests__/transients.test.ts`: 23. a fall is over well inside the replay lead-in, so a replay primed mid-run has seen every fall born. The two existing tests gain the fourth owner, in the list at `:16-19` and in the sum at `:21-27`.

`src/game/__tests__/swallow.test.ts`: 24. the swallowed event carries the food's place as an offset from the grave's centre; 25. the swallowed event carries the food's half extent, its way and the grave's size at the tip; 26. the swallowed event carries the food's look, so the drawing code never has to hold the corpse. The existing test at `:303-308` gains the new fields.

`src/app/__tests__/sound.test.ts`: the `EVERY_EVENT` literal at `:65` gains the new fields. No new name, and no sound changes.

`src/__tests__/boundary.test.ts`: the new row is itself the test that `fall.ts` imports no Pixi.

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. The proof tape: replay and verify the tape at `local/148-proof-tape/` with the command slice 2 left beside it. It must verify, which proves this slice moved no rule.
2. The rendered check of a fall. A fall is 63 ticks, so it is photographed by holding it rather than by catching it, and the replay screen holds exactly one frame for as long as you like: playback stops at the last verified checkpoint and never draws again (`session.bound = lastVerifiedTick(...)`, `src/app/screens/tapePlaybackSession.ts:220`; `playFrame`, `:272-287`; `advance` falls through to nothing drawn once the phase is `played`, `:371-376`; `ReplayScreen.update` then stops calling `syncScreen`, `:161-166`). Checkpoints are every 60 ticks (`RECORDER_CHECKPOINT_SPACING`, `src/tape/recorder.ts:28`, `isCheckpoint`, `:64-67`), and a fall lasts 63, so every fall contains at least one checkpoint. So: record a tape with `scripts/record-conditioned.ts <out> <seed> <ticks>` (it steers a fixed wandering script on purpose, `:236-244`, so the run swallows); step that same seed and condition headlessly to list the ticks that swallowed; pick a swallow tick S; let T be the smallest multiple of 60 at or above S; record a second tape of exactly T ticks from the same seed and condition; drop it in `apps/hungry-grave/public/` and open `vite preview` at `#/replay?tape=/<name>.tape&at=<T>` with `playwright-cli`, at a phone's viewport (390 by 844, device scale 3). The replay verifies, fast-forwards to T minus 90, renders the lead-in so the fall is seen born, and freezes on tick T with a fall of age `T - S` on screen. Photograph it, read it, and say in your note where the body is against the rim, how far it has turned, and how dark it is. Take a second one at another swallow tick where the grave is a different size.
3. The rendered check of the teeter. Same recipe, at a tick where a corpse lies across the rim with a share above the teeter's start and below the threshold; find one by the same headless stepping. Read the screenshot and say in your note how far the body leans and whether a player would read it as about to go in. Whether it feels right is Mark's, not yours.
4. The frame cost: open the frame budget screen in the built app and put its render figures in your note, and say what the falls added. Slice 3's coder found the screen noisy: two captures of one build differed by more than the two builds did. So take the "before" figures yourself, on your own starting tree, before your first edit, take three captures of each side on a quiet machine (check `uptime` first and say the load in your note), and report the spread beside the means. If the spread is larger than what the falls add, say so plainly rather than reading a cost off the noise.
5. No screenshot script exists in this repo; use `playwright-cli`. Stop every server and browser you start. If a check cannot be obtained, say which read you did not get rather than implying the rendered check was complete (`docs/agents/lessons.md:77`).

Open for the human after this slice (say so in your note): whether the fall reads as a body going over the edge rather than a body being deleted, whether the teeter reads as "nearly in" rather than as a glitch, and the tip and drop times on his phone.

## Done when

Every planned test is green, every verification step has a result in your note, the proof tape verifies, no pin moved, and the working tree holds the code, the tests and `docs/branch/records/slice-4-note.md`, uncommitted.
