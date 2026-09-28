# Slice P2 coder note

## 1. What changed

- **Sim deletions:** `FIELD_HEIGHT`, and the `capsFor` and `shareOverMouth` defaults.
- **New:** `scene.ts` (`sceneFor`); `layout.ts` `fieldHeightForBox`, `StageBox`, `fitField(w, h, field, reserve)`.
- **`useScene`** on every renderer and steering; `COLUMN` and `SCENE_CAMERA` gone; frame and clip redrawn per field.
- **Screens:** GameScreen and FrameBudgetScreen read `stageBox`. ReplayScreen refits on the tape's field. Pools open at the tallest field's caps. `minHeight` is `SHORTEST_FIELD_HEIGHT`.
- **Scripts:** a shared `fieldArgument.ts`, and frame-budget takes `field=`.
- **Added items:** the fence ignores a size or length against 0 or 1; record-conditioned's `field=` test, mutation-checked.
- **Form changes:** about 30 test files; record-caps tests run 1260.

## 2. Verification results

- **Floor 1:** each new test was red first, except record-conditioned's, which a mutant caught.
- **Floor 2:** 2728 names, then 2744; lost only P1's fence, replaced by test 12.
- **Floor 3:** typecheck exits 0. `2733 passed | 11 expected fail | 2 todo`. `✓ built in 5.24s` with only #50/#51. `pnpm verify` exits 0.
- **Step 2:** only `field.ts`, `caps.ts`, `tip.ts` and their tests changed. The pins hold.
- **Step 3:** refused, naming `fieldHeight`.
- **Step 4:**
  - 390×844: the frame meets all four edges, 0 px off, and the ground reaches the top.
  - Resized to 390×600: still 1168, with 56 px side bars.
  - Desktop: 760, with 400 px side bars.
  - h1168 tape on the desktop: 416 wide, with 512 px side bars.
  - 760 tape on the phone: 147 px bars above and below.
  - Cold load: the headers say 1168 and 760.
- **Step 5:** headless largest row: 0.68/1.06 ms at 760, 0.44/0.58 at 1168; record 0.73/1.30. Browser render at 200/500: 7.01/10.40 against 7.96/12.30 (software renderer, not comparable).
- **Step 6:** only autoplay warnings, which baseline gives too.
- **Step 7:** open for Mark, as is T12's cost.

## 3. Where the entry was wrong about the code

Test 10 cannot live in `src/dev` (no reach into `src/app`); it is in `src/app/screens/__tests__/`. `FieldRenderer:333` is the hit dim, not a mask.

## 4. Decisions made

- **Ground texture freed one bake later.** Pixi's shared mesh bind group dies with its texture, so a scale-changing resize crashed (P1's tree too); P2 made that routine. Reverse: free in the swap.
- **Dressing interval kept at 760's.**
- **Other:** `leanOf` passes `run.field`.

## 5. Open items

The belch button overhangs the left bar at 390×600.

## 6. Stuck

None. Nothing left running.
