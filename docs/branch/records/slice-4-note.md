# Slice 4 coder note

## 1. What changed

- `camera.ts`: `groundMoveOnColumn`, with `game/command` added to its boundary row.
- `layout.ts`: `screenToField` renamed `screenToColumn`, with its readers' comments updated, `layout.ts:12` and `GameScreen.ts` included.
- `touch.ts` now declares `ColumnPoint`, used by `TouchSteer` and `combineSteer`.
- `steering.ts`: `toColumn`, `graveOnColumn` and `groundMoveFor`. A move past the horizon is logged once.
- `bot.ts`: `onTheGlass`, used by `runPolicy` and the five ruled loops. `graveAfter` now predicts on the glass and is exported (see 4).
- The dev boundary row reaches the camera.
- New readings `mobFireShots` and `timeOnScreen`, wired into readings, `BATCH_READINGS` and `READING_COMPARISONS`.

## 2. Verification results

- Floor 1: 19 tests, each red on its own assertion first. Test 6's re-anchor was also mutation-checked. The 19th, "a drag that has settled on its target warns about nothing", pins a false horizon warning the rendered check found.
- Floor 2: names went from 2680 to 2699. The 7 lost are renames: the layout describe, two boundary titles, and three harness names that follow list membership.
- Floor 3: typecheck, lint, build and verify all exit 0 (2688 passed). The only build output is slice 1's two Rollup warnings.
- Rendered check (seed 1000, 390 by 844, touch, clock held): sideways 100 px moved the lip 100.15, 100.39 and 100.39 at column rows 610, 463 and 325. Up 100 px moved the centre 100.33 twice. PASS. At rows above about 250 no read is possible: the far wall fills the opening.
- W for 1 s from x 48: the right lip moved -1.93 px, of which about 1.2 is the grave drawing narrower as it rises. It rose 195.0 px, which is 270 column units at 4.5 a tick. PASS.
- Console: only the AudioContext warnings.
- Bot stages: zero faults. On-device check: open, for Mark.

## 3. Where the entry was wrong about the code

Two figures miss the sim's float32 move grid (`execution.ts:118`). Test 4's 1e-9 cannot hold, so its bound is the grid. And one tick of a fast drag rounds past `TARGET_TOLERANCE`, as before this slice, and harmlessly.

## 4. Decisions made

- `graveAfter` is exported so test 11 can read it. No public behavior separates the two predictions. To reverse, un-export it and drop test 11.
- The per-tick grid bound, `4.5 × 2 × 2^-24`, in tests 4, 8 and 11.

## 5. Open items

- Pins, why each moved: the hand moves at one screen speed, slower in ground units low on the field (A11). Measured runs are in `local/tilt-slice-4/slice4-lists-{before,after}.json`.
  - `NEVER_PAID` goes from [202] to [202, 505]: 505 now opens no offer.
  - `PASSES_THE_BANSHEE_FROM_THE_CEILING` goes from [101, 404] to []: both stay in her fight, at 58 and 57 kills.
  - `NEVER_PAID_AT_THE_BIRTHRIGHT` goes from [202, 404] to [].
  - `STOOD_BUT_NEVER_REACHED` goes from [] to [202, 303]. The sweep said [303]; the measurement wins.
  - `ENDS_ABOVE_THE_BIRTHRIGHT` goes from [303] to [101, 404, 505].
  - Every other list holds, `REACHES_VICTORY_MAXED` all five included.
- `hitTakingPolicy` aims on the ground but steers on the column, so its path curves slightly.

## 6. Stuck

None. Nothing is running.
