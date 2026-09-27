# Slice P2: the screen reads the run's shape and draws it (design record T12, A30, A34, A35)

Follow-along row P2: "On a phone the game fills the whole screen in portrait, top to bottom, whatever the phone's shape. Each run takes its shape from the screen when it starts and keeps it, and a replay shows a run in the shape it was played in, on any screen. A desktop plays today's shape with bars at the sides."

One slice for one coder, the second half of the old slice P (split on the tech gate's advice, #159 comment 5860078226). It runs after P1 lands and before slice B. It does not wait on Mark.

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice whole: the sim is untouched here, because P1 made every sim change this step needs. Load the `pixijs-skills:pixijs` skill before you touch Pixi code, and check every Pixi claim in `node_modules/pixi.js`. This entry is the planning half of the flow. Your scratch folder is `local/tilt-slice-P2/` in the worktree. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read at `c5b1423ce5`; P1 changed no file this entry names except `src/__tests__/boundary.test.ts`, so follow the name beside a number that has moved.

## What this slice builds, and why

After P1 a run can be any height from 760 to 1260 and the tape records it, but the app still starts every run at 760 and draws one fixed 760 column. Mark: "I want to be able to make sure that we're not building in weird black bars on the tops and bottoms just to fit some ridiculous number that we came up with at the very beginning." A phone's stage is taller than 760: under the small viewport a 390-wide iPhone 15 gives 540 by 906 and a Pixel 8 540 by 983 (`docs/design/show-what-you-have.md`, section 3.1).

When it works:

- A run started on a portrait phone has a field as tall as the stage's shape asks, from 760 to 1260, and fills the stage with no bar (A30).
- A run started on a desktop, a landscape window or anything squatter than 540 by 760 plays 760 with bars at the sides; anything taller than 540 by 1260 plays 1260 with bars above and below (A30).
- The field keeps its shape for the whole run; resizing the window mid-run adds bars and never changes the field (A35).
- A replay draws the tape's own field in that shape on any screen: a phone's tall run on a desktop is a tall portrait column between side bars (A35).
- The camera and the ground are drawn for the run's own column (A34); on a 1168 column (a 390 by 844 phone) the ground the camera shows is tilt 9's on Mark's phone.
- The frame budget is measured on the field the stage gives, so a phone's budget is a tall field's.

## Rulings this slice builds

T12, A30, A34 and A35 in `apps/hungry-grave/docs/design/tilted-view.md`. Read each.

## Module boundaries and public interfaces

**`src/game/field.ts` (the one sim file this slice touches, by deletion only).** `FIELD_HEIGHT` is deleted, and so are the two transitional defaults P1 left for this slice's callers (`capsFor`'s and `shareOverMouth`'s trailing `field = SHORTEST_FIELD`, in `caps.ts` and `tip.ts`). The typechecker then finds every caller under `src/app`, and each passes the run's field. Nothing else in those three files changes, and no rule's value changes: every sim caller already passes its field.

**`src/app/layout.ts`.** The one module that knows the stage:

- `fieldHeightForBox(width: number, height: number): number`: `Math.round(FIELD_WIDTH * height / width)` clamped to `SHORTEST_FIELD_HEIGHT` and `TALLEST_FIELD_HEIGHT`. An unmeasurable box (zero, negative, not finite) resolves to `SHORTEST_FIELD_HEIGHT` and warns once, the way `reportDegenerate` (`:129-140`) does, because it is a live input repaired to a safe value.
- `fitField(viewportWidth, viewportHeight, field: Field, reserve)`: `centred` (`:143-159`), `intersects` (`:162-176`) and the lowering read `field.height` where they read `FIELD_HEIGHT`. The field comes before the reserve, which has a default.
- The comment at `:152-155` ("height / FIELD_HEIGHT multiplied back by FIELD_HEIGHT") is restated for the field's height.
- `hudRow` (`:281-290`) is unchanged (it reads only the width).

**`src/app/screens/game/scene.ts` (new, pure: no Pixi import).** The run's drawing geometry:

- `interface Scene { readonly field: Field; readonly column: Column; readonly camera: Camera; readonly nearestScale: number }`.
- `sceneFor(field: Field): Scene`: the column is the field's shape; the camera is `makeCamera(CAMERA_VALUES.tiltDegrees, CAMERA_VALUES.heightInStartingHalfLengths, SIZE_START, column)` (`camera.ts:109-126`), which already targets the column's centre; `nearestScale` is the camera's scale at the column's bottom row (the value `GraveRenderer.ts:69-73` computes today for the fixed column).

Slice B adds the play layer to it. `camera.ts` loses `COLUMN` (`:77`) and `SCENE_CAMERA` (`:129-134`) and their exports; every reader takes the run's scene instead.

**The renderers and steering, handed the scene per run.** Each gains `useScene(scene: Scene): void`, called by `GameScreen.beginDrawing` (`GameScreen.ts:339-343`) and `ReplayScreen.beginDrawing` (`ReplayScreen.ts:225`) with the run's scene before its first frame, and reads the scene it was handed where it read `SCENE_CAMERA`, `COLUMN` or `FIELD_HEIGHT`:

- `BackgroundRenderer`: `SEEN` (`:49`), the dressing's range (`:56-57`), `FIELD` (`:46`), the ground grid (`:197`, rebuilt in `useScene`), `placementOf` (`:136-139`), the paint (`:347`), the Waking's source (`:441`). `GROUND_SPEED` (`:71`) is the sim's scroll and does not change here (slice C makes it the scene's).
- `FieldRenderer`: `:370`, `:378`, `:415`, `:457`, `:491`; the mask rect (`:333`) and the inside-the-field test (`:483-485`) read the scene's field; `shareOverMouth` at `:135` passes the scene's field.
- `StormRenderer`: `:715`, `:738`, `:755`, `:831-838`, `:854-865`, `:874`, `:916`.
- `BossRenderer`: `:56`.
- `GraveRenderer`: `NEAREST_ROW_SCALE` (`:69-73`) becomes the scene's `nearestScale` (1.177929 at 760, 1.273449 at 1168) and the hole's bake is sized from it; `:85`, `:134`, `:283`.
- `EndingSceneRenderer`: `:145`, `:206`.
- `fieldFrame.ts` (`:19`, `:45`): the frame and its mask take the field.
- `steering.ts`: `RunSteering` (`:62` onward) gains `useScene`; `graveOnColumn` (`:122-125`) and `dragOnField` read the scene.

`useScene` is the driver handing a run's data in, because the screen and its renderers are pooled and built before any run exists (`GameScreen.ts:169-189`). It is this slice's one new seam that later slices depend on, and slices B and C extend what the scene carries.

**Pool sizing before a run.** `GameScreen.fieldCaps` (`:323-325`) and `ReplayScreen.fieldCaps` (`:145-147`) size the pools with no run in hand; they pass `fieldOfHeight(TALLEST_FIELD_HEIGHT)`, so a pool is never short for any run. `beginDrawing` re-attaches at the run's own caps as today.

**Where the shape is read.** `GameScreen.prepare` (`:363` onward) runs before the navigation's first `resize` of the screen (`src/engine/navigation/navigation.ts:83-90`), so the stage box comes from the navigation's last measured size (`navigation.ts:60-62`, `:184-186`). `GameScreen`'s props (`main.ts:257-270`) gain `stageBox: () => { width: number; height: number }`, reading `engine.navigation.width` and `height`. `prepare` reads `const box = this.props.stageBox()` and hands `fieldHeightForBox(box.width, box.height)` to `session.begin`, which passes it to `createRun` as `fieldHeight` (`runSession.ts:169-174`). `GameScreen.resize` (`:584-586`) and `ReplayScreen.resize` (`:271-272`) call `fitField` with the current run's field (the shortest field while no run is held).

**The frame budget.** `FrameBudgetScreen` (`:157-165`, `:247-256`) takes the same `stageBox` prop and starts its runs on `fieldHeightForBox` of it, with `capsFor` of that field, so a phone measures a tall field's caps and ground. `scripts/frame-budget.ts` (`:98`, `:107`) and its copy of the caps, `scripts/frameBudgetCaps.ts` (`:67`), take a `field=<height>` argument, 760 when absent, parsed at the edge like `batch.ts`'s.

**`src/main.ts`.** `resizeOptions.minHeight` (`:81`) becomes `SHORTEST_FIELD_HEIGHT`: it is the stage's floor, and the stage never needs more than the shortest field to fit. `showGame` and the frame budget's show pass `stageBox`.

**Test files.** The test files under `src/app` and `src/input` that name `FIELD_HEIGHT` (P1 left them) take `SHORTEST_FIELD_HEIGHT` or the run's field; each is a form change under the contract's stop rule, listed in your note by file with the count.

## What must stay unchanged

- Every rule of the game, every sim value, `GOLDEN`, `GOLDEN_1168`, every version, the bot's and the harness's lists.
- The camera's two values (T2, T3), `LAYER_ORDER`, every colour, every drawing's look at a point on the 760 field.
- `GROUND_SPEED` and every placement function: slices B and C change them.

## Planned tests

Pin every name as a `test.todo` first against stubs that return a wrong value of the right type. Expected values come from this entry and the design record, never from running the code. Each test cites the ruling it enforces.

`src/app/__tests__/layout.test.ts`:

1. a portrait stage's field is as tall as its shape asks, in whole units: stages 540 by 906, 540 by 983, 540 by 1170 and 540 by 776 give 906, 983, 1170 and 776; a stage of 820 by 1180 gives 777 (A30)
2. a stage squatter than 540 by 760 gives 760 (1440 by 900, 540 by 700, 900 by 900) and one taller than 540 by 1260 gives 1260 (540 by 1700) (A30)
3. an unmeasurable stage gives 760 and warns once (A30, repair by origin)
4. the fit fits the run's field: a 1168 field in a 540 by 1168 stage has no bar on any side; a 1168 field in a 1440 by 900 stage fills the height with equal bars at the sides; a 760 field in a 540 by 1168 stage fills the width with bars above and below (T12, A35)

Existing `layout.test.ts` tests that call `fitField` take the shortest field as their new argument and keep their promises; list them.

`src/app/screens/game/__tests__/scene.test.ts` (new):

5. a scene's column is its field, and its camera looks at the column's centre with Mark's values: on a 760 field the ground under the top and bottom rows is -168.081604 and 762.503300, on a 1168 field -369.054371 and 1127.753451 (A34; the design record's values)
6. the scene's nearest scale is its bottom row's: 1.177929 at 760 and 1.273449 at 1168 (A34)

`src/app/__tests__/GameScreen.test.ts`:

7. a run begins on the field its stage asks for: a 540 by 906 stage begins a 906 run (T12)
8. a resize mid-run keeps the run's field and fits it with bars (T12, A35)

`src/app/screens/__tests__/ReplayScreen.test.ts`:

9. a replay draws the tape's own field: a 1168 tape in a 1440 by 900 stage is fitted at scale 900 / 1168 with bars at the sides (T12, A35)

`src/dev/__tests__/frameBudget.test.ts`:

10. the frame budget starts its runs on the field its stage asks for, with that field's caps: a 540 by 1168 stage measures a 1168 field (the gate's finding: a phone plays tall)

`src/__tests__/boundary.test.ts`:

11. `screens/game/scene.ts` may reach `app/screens/game/camera`, `game/field` and `game/tuning` and imports no package, in the shape of the camera's rule (`:180-204`)
12. nothing in the tree exports or imports `FIELD_HEIGHT` (P1's fence, widened to the whole tree now that it is deleted)

## Verification steps

1. The coder contract's floor. Actor: the agent.
2. **The sim is untouched here.** `git diff --stat <P1's commit> -- apps/hungry-grave/src/game apps/hungry-grave/src/tape apps/hungry-grave/src/dev` lists only `field.ts`, `caps.ts` and `tip.ts` (the deletions above) and their tests; the suite's pins pass unchanged, `GOLDEN_1168` included. Paste it. Actor: the agent.
3. **Old tapes are refused in the replay screen.** Open `local/tilt-shots/tapes/pre-P/won-maxed-1000.tape` in the built app's replay screen through `vite preview`: it shows the refusal naming `fieldHeight`. Screenshot and describe it. Actor: the agent.
4. **Rendered checks**, in the built app through `vite preview`, each screenshot read and described:
   - a live run in a 390 by 844 viewport fills the canvas: the field's frame meets all four edges of the stage within one CSS pixel, and the ground reaches the top;
   - a live run in a 1440 by 900 viewport plays a 760 field with bars at the sides;
   - `won-maxed-1000-h1168.tape` replayed in a 1440 by 900 viewport draws a tall portrait field with bars at the sides, and `won-maxed-1000.tape` replayed in a 390 by 844 viewport draws with bars above and below;
   - a live run started in 390 by 844 and resized to 390 by 600 keeps its field, now with bars at the sides;
   - the first run after a cold load (a fresh page, straight to a run) is sized from a measured stage, not the 760 fallback: read its header's `fieldHeight` off the recorded tape.
   Actor: the agent.
5. **Frame budget at two heights.** The frame budget screen in a 1440 by 900 viewport (760) and in a 390 by 844 viewport (1168), and `scripts/frame-budget.ts` with no `field=` and with `field=1168`: give each figure beside the other and beside the last recorded budget. Actor: the agent.
6. **Console.** No error and no warning in the live runs above. Actor: the agent.
7. **On-device.** Actor: Mark, after slice D's deploy: the game fills his phone in portrait with no bar above or below.

Open for the human after this slice: whether a taller phone's longer look up the field reads as more warning or as a different game (T12's accepted cost).

## Done when

Every planned test is green, every verification step has a result in `docs/branch/records/slice-P2-note.md`, and the working tree holds the code, the tests and the note, uncommitted.
