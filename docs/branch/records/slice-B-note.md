# Slice B coder note

## 1. What changed

- **New:** `playLayer.ts` and `playPlacement.ts`, and their tests. `Scene` gains `playLayer`.
- **Placed on the play layer:** `FieldRenderer`, `StormRenderer`, `BossRenderer` and the Waking's source. The dressing stays on the camera.
- **groundPlacement:** `airborneAt`, `hostileFireAt`, `headingOnColumn` and `liftOnColumn` are deleted, with their five tests.
- **Boundary:** two new rules, a wider `scene.ts` rule, and test 11's fence.
- **Tests updated with their promise kept:** seven in StormRenderer (a skull's slot, a wisp's heading, the eruption's drift, four lob-mark tests) and one in BackgroundRenderer (the source's size, now read back into field units).

## 2. Verification results

- **Floor 1:** every planned test was red first on its own assertion, except test 13 (it pins P2's scene) and test 11 (a fence, shown red in a scratch copy).
- **Floor 2:** 2744 names became 2776. The only names lost are the planned replacements, the five deletions, the scene rule's new title, and the nearer-mob test, whose describe block was retitled.
- **Floor 3:** typecheck exits 0. Tests: `2765 passed | 11 expected fail | 3 todo`. Build: `✓ built in 6.26s`, with only #50 and #51. `pnpm verify` exits 0.
- **Part 1, step 1:** both tables match the record everywhere except the two rim rows (section 3). The output is in `local/tilt-slice-B/sliceB-tables-output.txt`.
- **Part 1, step 2:** both rules go red in a copy.
- **Tapes:** all four verify to their end.
- **Rendered check:** 29 shots on both field heights, read. Things lean and shrink toward the top, mobs reach the top corners, and patches lie flat. The frame, HUD and buttons have not moved. The before-and-after is `local/tilt-slice-B/sliceB-won-3700-before-after.png`.
- **Straightness:** on both field heights, three mobs and three skulls moved 0 in drawn x beyond what their field x moved.
- **Console:** a live run on phone and desktop showed no error and no warning.

## 3. Where the entry was wrong about the code

- **Test 27 cannot hold (a stop).** For every grave at a side edge, on both fields, two corners of the hitbox fall outside the drawn ground rectangle, by 1.2 to 7 column units. That is the outer far corner and the inner near corner. Graves in the middle pass. It is pinned as a todo, and test 32 leaves out that part. A29's widening needs a ruling before slice C.
- **Test 26:** the record's rim rows (527.244788 and 592.794441) are off by about 8e-5. The code sits exactly on the hitbox's rows.
- **Callers:** the tracing functions are called by slice C, not slice 11.

## 4. Decisions made

- **`headingOnPlay` takes no x,** because the heading never depends on it and the build rejects an unused parameter. To reverse, put `x` back.

## 5. Open items

- Test 27 needs a ruling.
- Headless live runs draw at 1 FPS on the software renderer.

## 6. Stuck

Only test 27 (section 3). Nothing left running.
