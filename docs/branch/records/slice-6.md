# Slice 6: the Undertaker's end (design record R6, #106)

Follow-along row 6: "Beating the Undertaker ends the run with a scene: the grave drags him to the rim, he claws the ground, and he tips in and falls. Then the end screen."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. This entry is the planning half of the flow. Your scratch folder is `local/148-slice-6/` in the worktree. Load the `pixijs-skills:pixijs` skill before you write Pixi code. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read on the tree at `c96aeabe3d`, before slices 1 to 5 landed; nothing under `src/` changed between `c309fc812b` and that commit, so the earlier entries' numbers and these agree. The name beside each number is what binds. A name that is gone, or that does something else, is a false claim: stop and report it.

Four named things do not exist yet, because an earlier slice creates them. `src/app/screens/game/graveProjection.ts` and `graveDrawingValues.ts`, and the `falls` container on the grave's renderer (slice 3). `src/app/screens/game/fall.ts` and its `FALL_TICKS` (slice 4). If one is missing when you start, stop and report rather than building it yourself.

## What this slice builds, and why

Mark ruled on 2026-09-20 that the Undertaker's death ends the run as a scene the player watches: the grave drags him across the ground to the rim, he claws at the ground and leaves marks, he tips, folds in, and falls with the same fall a corpse takes. No payout. Today the run's end seals the tape and moves to the next screen in one call, so there is no frame in which a scene could draw, and two comments in the rules credit a renderer's animation that nobody ever wrote.

When it works, a player sees:

- The Undertaker's last point of health goes, and instead of the field cutting to the end screen, the grave takes him: he is dragged to the rim, leaving furrows behind him.
- At the rim he tips, folds to fit the opening, and falls into the dark exactly as a swallowed corpse does.
- Nothing is paid for it. The score, the size and the rungs stand still.
- The field under the scene is frozen: the shots in the air fade out, and the mobs stay where they were, dimmed.
- When the scene is done the end screen arrives, as it always did.
- A loss, a fatal fault and quitting from the pause menu go straight to the end screen, with no scene and no wait.
- A replay of a won run shows the same scene.

## The hold, exactly

Today `end` seals the record and calls `showEnd()` in the same call (`src/app/screens/game/runEnding.ts:66-87`), and every four ways a run can end reach it through one door, `GameScreen.endRun()` (`:667-669`): victory and loss through `endedIn` on the frame's events (`GameScreen.ts:460-462`), a fatal fault through `execution.stop`, and the pause menu's quit through the closure at `:613`.

- The seal does not move. On the ending tick the record is sealed exactly as today, once, inside the `if (!ending.ended)` block. A drawing bug must never be able to cost a player the tape.
- Only a won run holds. `end` already has the run and the execution, and the run says which ending it reached: `run.ending` is `'sealed' | 'victory'` (`src/game/run.ts:38`, the field at `:197`), and a fatal fault and a quit leave it null. So the hold's condition is `execution.stop === null && run.ending === 'victory'`, read inside `end`. No new argument.
- The hold is counted on the frame clock, because the run's tick has stopped. `RunEnding` gains `advance(elapsedMs: number): void` and a read-only progress from 0 to 1 while the scene is running, null when none is. The length is one row in `graveDrawingValues.ts`, starting at 2.8 seconds, which is where the first prototype put the whole ending.
- The ending module owns when the hold ends and the drawing code has no say in it, so a drawing bug cannot strand a won run. The scene is handed a progress number and answers with pixels.
- When the hold is spent, the way out runs exactly as it runs today, including the `navigating` guard and the retry from the frame seam on a rejected navigation. Put that navigation in one private function called from both places rather than writing it twice.
- No tap skips the scene in this step. The hold is spent by elapsed time alone and no input reaches it.

## Where the scene's frames come from

After the ending latch is up, `framePolicy.reason` answers `'ending'` first (`src/app/screens/game/framePolicy.ts:52-58`), and `spendFrame` returns a held frame for every reason but `'live'` (`GameScreen.ts:474-492`, the guard at `:483`). `syncScreen` has exactly two call sites, the run's opening frame (`:369`) and the live branch (`:489`), so no frame reaches a renderer after the ending. The scene needs its own path:

- `GameScreen.spendFrame` gains an ending branch above the countdown branch: it spends the frame's elapsed time through `this.framePolicy.takeElapsed(...)` exactly as the countdown does (`:480`), hands it to `this.ending.advance(...)`, hands the ending's progress to the scene, and returns the held frame. The victory frame itself is still a live frame, because the reason is read before the frame's work (`:427-430`), so the scene is begun from the `bossKilled` event in `announce` (`:529-540`) on that same frame and advances from the next one.
- The replay is the same shape with no hold and no navigation. `ReplayScreen` has no ending path at all: playback stops at the last verified checkpoint, `advance` then returns nothing drawn (`src/app/screens/tapePlaybackSession.ts:371-376`) and `ReplayScreen.update` stops calling `syncScreen` (`:161-166`). So the replay begins the scene from `bossKilled` in its own event loop (`:193-204`) and advances it on every later frame from `ticker.elapsedMS`, past the tape's end, then leaves it on its last frame. The replay keeps its own two-line elapsed counter for this. That is the second copy of two lines of arithmetic and the rule of three says a second copy is fine: extract nothing.
- A replay reaches the death tick because slice 5 made the recorder stamp a final checkpoint on the seal, so the last verified checkpoint of a tape recorded since then is the run's last tick. A tape recorded before slice 5 still stops short of it. If `sealTrailer` (`src/tape/recorder.ts`) stamps no final checkpoint when you start, stop and report.

## The scene, exactly

`bossKilled` (`src/game/events.ts:290-295`) carries the kind and where the body fell, and that is what the scene fires on. On the death tick `killBoss` sets `state.boss = null` before it announces (`src/game/bosses/phases.ts:180-187`), and `BossRenderer.sync` hides its body the moment the boss is null (`src/app/screens/game/BossRenderer.ts:42-52`). So the scene draws the Undertaker itself, from the event's kind and place, at the same half extents the sim gave him: 60 by 40 (`phases.ts:75-76`).

The scene's own record is taken once, at the death: the event's kind and place, and the grave's place and size on that tick, as values. It runs through four beats whose shares of the length are rows in `graveDrawingValues.ts`:

1. The drag: he crosses the ground from where he fell to the grave's rim, on the easing the row names.
2. The claw marks: furrows left in the ground behind him as he comes, as prototype build 5 drew for the hands. They stay until the scene ends.
3. The tip: at the rim he turns about the point he crossed, and folds to fit the opening.
4. The fall: he drops with the shared fall, through `fall.ts` (slice 4), so he shrinks and darkens on the walls' own curve and never lands.

The field under him is frozen and does not fight for attention: the shots in the air fade out as the scene starts, which is what the genre does on a boss's death, and the mobs stay where they are and dim. The grave keeps its own look.

The scene is drawing only. It changes no rule, pays nothing, and a run plays out the same whether or not it is drawn.

## Parts of the code this slice touches

- New module `src/app/screens/game/endingScene.ts`: the scene's own record and its arithmetic, as a pure function of progress. No Pixi import at all, not even a type import, so its tests run without Pixi. It calls `fall.ts` and `graveProjection.ts` for the last beat. Public interface: the record the death hands it, a function that answers where the body is, how far it has turned, how folded it is, how deep it has fallen and how far the furrows have been drawn at a progress from 0 to 1, and nothing else.
- New module `src/app/screens/game/EndingSceneRenderer.ts`: the dumb view. `attach(layers: FieldLayers, falls: Container)`, `detach()`, `forgetPreviousRun()`, `begin(killed: BossKilled, grave: Grave)`, `show(progress: number | null)`. It holds three pieces in three places, in the pattern `GraveRenderer.attach` already uses for its four (`:184-192`): the furrows in `ground`, so the grave passes over them; the body being dragged in `mobBodies`, where `BossRenderer` draws him (`BossRenderer.ts:37-39`); and the falling body in the grave's `falls` container, so he goes under the turf and inside the hole like any other fall (`layering.ts:16-29`). A progress of null draws nothing. It draws him through `drawBoss` (`src/app/screens/game/bossSprite.ts:197-218`) rather than a second silhouette, so the man who falls is the man who fought.
- `src/app/screens/game/runEnding.ts`: the hold, as above. `RunEnding` gains `advance(elapsedMs: number): void` and the read-only progress; `reset()` lowers the hold as well as the latch, because screens are pooled.
- `src/app/screens/game/graveDrawingValues.ts` (slice 3): the scene's length, its four beats' shares, the drag's easing, the furrows' look and the dimming of the frozen field.
- `src/app/screens/game/GameScreen.ts`: construct the scene renderer, attach it in `dressField()` (`:326-334`) after the grave (`:333`), forget the previous run where the field renderer does (`beginDrawing`, `:321-323`), begin the scene from `bossKilled` in `announce` (`:529-540`), and the ending branch in `spendFrame` (`:474-492`).
- `src/app/screens/ReplayScreen.ts`: the same, in `dressField` (`:125-133`), `beginDrawing` (`:179-183`), the event loop (`:193-204`) and `update` (`:161-166`).
- `src/app/screens/game/FieldRenderer.ts`: one new public seam, `fadeForEnding(progress: number)`, which fades the shot sprites out and dims the mob sprites, called from both screens' ending path. `forgetPreviousRun` (`:153`) must put both back to full, or a pooled screen's next run opens with a faded field. The renderer sets no per-sprite alpha today, so this is new per-slot work beside `syncShots` (`:253-286`) and `syncMobs` (`:232-251`).
- `src/game/stage/stage.ts`: the comment at `:605-607` says the topple is the renderer's animation, and now it is. Rewrite it to say what the drawing code actually draws. Its citation at `:594` says `game-concept.md:70` and the sentence is at `:80`: cite the file and the boss's own paragraph, never a line number, because this one has already drifted ten lines.
- `src/game/bosses/undertaker.ts`: the same at `:314-320`, which quotes the old sentence and cites the same stale line.
- `apps/hungry-grave/docs/design/game-concept.md:80`, the last sentence of the Undertaker's paragraph. Replace exactly this sentence: "His death is the ending: he topples into the grave and the swallow is the victory animation, no payout, the grave swallows the gravedigger." With this one: "His death is the ending: the grave drags him across the ground to the rim, he claws furrows in the earth, and he tips, folds in and falls the way a corpse falls, no payout, the grave swallows the gravedigger." Change nothing else in that file.
- `apps/hungry-grave/CONTEXT.md` and the design record are not yours to edit. Report a needed change in your note.

## What must stay unchanged

- Every rule and every payout. Victory still pays nothing, the run still ends on the tick the last boss falls, and `winStage` (`src/game/stage/stage.ts:613-624`) does not change.
- The seal. The trailer is written on the ending tick, once, before any hold (`runEnding.ts:72-77`). The exported tape gains the scene's frames as frame rows, which is what the recorder already says it records: the frames a run spends on its own end state are frames of that run (`src/tape/recorder.ts:154-157`).
- A loss, a fatal fault and the pause menu's quit leave at once.
- `src/game` imports nothing from `src/app`, `src/dev` or Pixi, and learns no word of the scene.
- The replay screen grows no player feature and stays silent (`ReplayScreen.ts:26-34`).
- `src/app/__tests__/screenLifecycle.test.ts:864-911` stands as written: it asserts the seal, the latch and the handoff on both endings, and the one navigation it counts is the lost run's (`:881`). If any existing test does assert that a won run leaves at once, that is a test this ruling changed: say which, replace it with the matching name from the list below, and say so in your note. Weaken nothing else.

## Pins

- No pin in the rules moves. The proof is verification step 1.
- If `GOLDEN`, `WITNESS_VERSION` or a bot seed list moves, stop and report: nothing in this slice can move one.

## Planned tests

Pin every name as a `test.todo` first, against stubs that return a wrong value of the right type, so each test is red on its own assertion. Each test carries a comment that cites R6 or the decision it enforces. `runEnding.ts` has no test file anywhere in the tree today, and the hold is new behaviour in it, so this slice writes its first tests. They live at `src/app/screens/game/__tests__/runEnding.test.ts` and import only from inside that folder's subtree, which the span fence requires (`src/__tests__/boundary.test.ts:441-446`, and the app allowance at `:495-503` is palette and layout alone). Fake the four `EndingPowers` (`runEnding.ts:9-19`); `runHandoff` is a plain in-memory singleton (`src/app/runHandoff.ts:35`), so `end` may record into it.

`src/app/screens/game/__tests__/runEnding.test.ts`:

1. a won run seals its record on the ending tick, exactly as a lost one does
2. a won run does not leave for the next screen on the ending tick
3. a won run leaves for the next screen once the scene's length has been spent
4. a lost run leaves at once
5. a run stopped by a fatal fault leaves at once
6. a run quit from the pause menu leaves at once
7. the record is sealed once however many frames the hold lasts
8. a rejected way out is tried again on the next frame, and the record stays sealed
9. the hold ends on the frame clock alone, so nothing a player does can shorten it
10. the hold reports no progress before it starts, and runs from nothing to whole while it holds
11. a reset lowers the hold as well as the latch, so a pooled screen's next run starts clean

`src/app/screens/game/__tests__/endingScene.test.ts`:

12. the scene starts where the Undertaker fell, from the death's own event
13. the grave drags him from there to the rim over the drag's share of the scene
14. the furrows follow him, and they are as long as the ground he has crossed
15. he tips about the rim he reached and folds to fit the opening
16. he falls the way a corpse falls, on the same projection and the same light curve
17. the scene is whole exactly when its length is spent, and never before

`src/app/screens/game/__tests__/EndingSceneRenderer.test.ts`:

18. the furrows draw in the ground, the dragged body over the field, and the falling body inside the hole
19. the scene draws the Undertaker itself, because the sim took him off the field on the tick he died
20. a scene that has not begun draws nothing
21. a new run forgets the scene of the one before it

`src/app/screens/game/__tests__/FieldRenderer.test.ts`, in a new block "the field under the ending (grave-in-the-ground R6)":

22. the shots in the air fade out as the ending runs, and the mobs dim
23. a new run gets its shots and its mobs back at full strength

`src/app/__tests__/screenLifecycle.test.ts`, beside the existing endings block, staged the way that file already stands a won run (the last boss on his last point of health, `:884-911`):

24. a won run holds the field for the scene and only then shows the end screen
25. a lost run shows the end screen on the tick it seals

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. The proof tape: replay and verify the tape at `local/148-proof-tape/` with the command slice 2 left beside it. It must verify, which proves this slice moved no rule.
2. The rendered check of the scene, and how to reach an ending without a new URL parameter. Slice 5 left one won tape at `local/148-won-tape/<seed>.tape` in the worktree's root, with a README that names its seed, rig, hand and victory tick, and it carries the final checkpoint, so its replay reaches the death tick. First verify it on your tree with `scripts/measure.ts`, which also proves this slice moved no rule on a won run. If it does not verify, stop and report. The scene in a replay runs on the frame clock, so photograph it by replacing the page's `requestAnimationFrame` with a manual pump and stepping the frames one at a time, which is how slice 1's coder held a tick (`docs/branch/records/slice-1-note.md`, the rendered check).
3. With that tape: drop it in `apps/hungry-grave/public/`, which `vite preview` serves at the site root, and open `#/replay?tape=/<name>.tape&at=<the victory tick>` with `playwright-cli` at a phone's viewport (390 by 844, device scale 3). The replay fast-forwards to 90 ticks short of the death, renders the lead-in, reaches the death tick, and the scene runs on the frame clock from there. Photograph the drag, the tip and the fall, and then the frame it holds on once the scene is over, which is frozen and can be read at leisure. Read every screenshot. Say in your note what the body is doing in each, whether the furrows read as claw marks, whether the field behind it is frozen and dim, and which reads you did not obtain, rather than implying the check was complete (`docs/agents/lessons.md:77`).
4. The live way in, for Mark and not for you: `?levels=5` gives a fresh run the maxed rig's starting conditions. `levelsFromUrl` (`src/app/seedFromUrl.ts:103-110`) takes one whole number up to `MAX_LEVEL`, `runSession.begin` passes `uniformLevels(levels)` into `createRun` (`:152-175`), and every other field of the `maxed` rig (`src/dev/rigs.ts:100-110`) is already what `createRun` resolves on its own. Prove that by a test or by a headless read of the resolved starting condition, not by playing for six minutes, and put the URL in your note for him.
5. Run the whole suite and report any existing test whose promise this ruling changed, by name, with what you did about it.
6. Stop every server and browser you start.

Open for the human after this slice (say so in your note): whether 2.8 seconds is the right length, whether the drag reads as the grave taking him rather than him walking in, and whether the end screen arrives too late.

## Done when

Every planned test is green, every verification step has a result in your note, the proof tape verifies, no pin moved, the two comments and the one sentence in `game-concept.md` tell the ending as built, and the working tree holds the code, the tests and `docs/branch/records/slice-6-note.md`, uncommitted.
