# Slice C coder note

## 1. What changed

- **`playPlacement.ts`:** `graveOpeningOnColumn` (new). The grave's ground rectangle is widened across, about its centre, by the least factor that holds the hitbox's four corners. The opening's centre is exactly the play point.
- **`GraveRenderer.ts`:** the pit and lip are carried out from that opening in its own perspective. The stance is over the ground under the play point, the falls use the grave's frame, and the re-bake step is measured in ground units. `graveDrawingValues.ts` JSDoc updated to match.
- **`FallRenderer.ts`:** a fall starts from `graveFrameOffset` and `graveFrameVelocity`. It gains `useScene`, wired on all three screens.
- **`endingScene.ts`, `EndingSceneRenderer.ts`:** the scene keeps its `hinge`. The haul ends at `fromGraveFrame`. The dragged body and the furrows are placed on the play layer.
- **`StormRenderer.ts`:** patches, cones and fronts are traced. The patch cache is keyed on look plus place.
- **`BackgroundRenderer.ts`:** the ground's speed is the scroll times the scene's stretch.
- **`steering.ts`:** the drag goes through `columnToPlay`. `stepOnColumn` and `groundMoveOnColumn` are deleted, with their 4 tests and `game/command`.
- **Also:** the play-layer boundary fence gains the grave, fall and ending-scene renderers; `touch.ts` comments are restated; A29 amended.
- **Tests:** all planned tests, plus the opening-centre test and the least-widening test. Replacements are as listed in the entry. Updated in form only: the swallow-grows test, the fall-view test, the hand and wedge counts, the steering helpers.

## 2. Verification results

- **Red first:** every test was red first on its own assertion, except 4, 9, P3-2, the fence and the least-widening test. Those were shown red by mutation.
- **Names:** 2776 before, 2789 after. The 12 lost are all planned replacements or deletions.
- **Checks:** typecheck 0; tests `2778 passed | 11 expected fail | 2 todo`; `✓ built in 7.37s` (#50/#51 only); verify 0.
- **Handover:** the fall starts within 0.09 px of the drawn body.
- **Fire:** every hit lies 0.00 px outside the drawn opening.
- **Swallow share:** the drawn share is never more than 0.1 below the sim's.
- **Pit length:** +22.5% on 760, +28.2% on 1168.
- **Overhang:** 6.0/10.7/15.0 px on 760; 6.8/12.1/17.0 px on 1168.
- **Drag:** within 1.12 px. Row-1 up is unreadable (a skull over the lip).
- **Held W:** 0.84 and 0.25 px.
- **Ground under a patch:** middle column within the float32 grid.
- **Frame budget:** within noise.
- **Console:** AudioContext only.

## 3. Where the entry was wrong about the code

- **Undertaker:** the dragged body stands, so his drawn centre jumps 4.3 px on 760 (1.6 on 1168) at the tip.
- **Test 6:** the texture rows are float32, so 1e-6 cannot hold; the bound is the float32 grid.
- **Slice A's drag tests:** their helpers read the camera.

## 4. Decisions made

- **Hands:** placed on the play layer and drawn at the look of the centre's scale (A20's words). Reverse: trace them.
- **Pit and lip:** share the opening's widening. Reverse: widen each by its own far edge.

## 5. Open items

- **Undertaker fix:** choose his haul end so his standing centre lands on the hinge.
- **Bakes:** 9.5 to 11.7 a second, 60 in the busiest second, against slice 3's 7.2 and 31.
- **Storm sync:** 0.02 to 0.32 ms mean.
- **Pale fall:** a swallowed corpse turns pale at the handover.
- **Mark's read:** the longer grave.
- **Mark's check:** drag on device.

## 6. Stuck

None. Nothing left running.

## 7. Fix after landing

- **What changed:** `playPlacement.ts` gains `standingCentredOnPlay`, the closed-form inverse of `standingOnPlay` for a centre. In `EndingSceneRenderer.begin`, the haul now ends where his standing centre lands on the hinge's column point. Nothing under `src/game` or `src/tape` changed.
- **Test:** a new six-case test covers the 760 and 1168 fields with the grave at its left edge, centre and right edge. It was red first on its own assertion (4.34 against 4.08, 4.31 against 3.04, and 10.61 against 3.64 column units) and is green now. The bound is his centre's move from the fall's first frame to its second, one 60 Hz frame apart, because a handover inside that reads as the fall's own motion.
- **Updated in form:** the handover test now reads his drawn centre, not the play point of the haul's end, and is renamed to match (the only lost name, 2789 before and 2795 after). The furrow test's haul end is now computed the new way.
- **Checks:** typecheck 0. Tests `2784 passed | 11 expected fail | 2 todo`. Build `✓ built in 10.02s`, with #50/#51 only. `pnpm verify` 0.
- **Rendered:** both won tapes were stepped +102 to +107 frames and read by eye (`local/tilt-fix-undertaker/shots-*`). His centre holds across +104 to +105.
- **Finding:** his drawn height still pops at the tip, 1.085 to 1.204 on 760 and 1.158 to 1.440 on 1168, because the fall's vertical scale is the grave frame's rows per unit (A29). On the 1168 tape the fallen body also draws under the skulls and dots.
- **Anomalies:** the 1168 jump was 10.6 with the grave near the bottom and 0.2 at row 600, so the note's 1.6 depends on the row. `shoot.mjs` intermittently fails with "never reached tick" (load 8). Running one shot per call worked.
