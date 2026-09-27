# Slice A coder note

## 1. What changed

- `src/input/steering.ts`: `combineSteer` takes a fourth argument, `dragOnField`. A drag goes through it and a key never does.
- `src/app/screens/game/steering.ts`: `groundMoveFor` is renamed `dragOnField`, with the same body. `commandSource` passes it into `combineSteer`, so keys are no longer converted.
- `bot.ts`, `bot.test.ts`, `harnessPolicy.test.ts`, `endings.test.ts` and `setPiece.test.ts` are restored to `544f0028d4`. Before restoring, I checked that each file's diff from that commit matched slice 4's diff byte for byte.
- `boundary.test.ts`: the `dev` row is back to `dev, game, tape`. `'src/dev reaches the camera and no other file of src/app'` is deleted, because it did not exist at `544f0028d4`. The camera row keeps `game/command`.
- Tests 4, 5 and 9 are new. Tests 4 and 5 replace `:183` and `:201`. Every existing `combineSteer` call now passes an identity conversion.

## 2. Verification results

- Floor 1: tests 4 and 9 each failed on their own assertion first. Test 5 was written after the code for test 4, so I proved it red by putting the key conversion back for one run: it was off by 2.29 at row 60. Then I restored the code.
- Floor 2: 2699 test names before, 2696 after. Every change is listed in section 1 or in section 3, and the harness and boundary titles are back to their names at `544f0028d4`.
- Floor 3: typecheck exits 0. Tests: `183 passed`, `2685 passed | 11 expected fail | 2 todo`. Build: `✓ built in 6.52s`, with only slice 1's two `(!)`. `pnpm verify` exits 0. The first build and verify run failed on Prettier in my two test files; I ran `prettier --write` and ran both once more.
- Pins: I ran slice 4's probe as `local/tilt-slice-A/sliceA-lists.test.ts`. Its output is byte-identical to `slice4-lists-before.json`: all 5 seeds and every field match.
- Step 3: only the two readings, their tests and their wiring differ. Both tapes verify, to ticks 23548 and 19991.
- Rendered drag check: rows 1 to 3 at CSS y 582, 482 and 382 are off by 0.15 to 0.39 px. PASS. At row 4 (y 282) the hole reader loses the opening (a core of 4 pixels). By eye from the shots, the grave moved 99.9 px. Held W drifted 15 px toward the middle, as the entry predicts.
- Console: only the AudioContext warnings.
- Nothing is left running.

## 3. Where the entry was wrong about the code

- `:292` drives held keys, so its promise cannot stay with keys. I kept the promise and drove it with a drag instead.

## 4. Decisions made

None beyond section 3.

## 5. Open items

- Above row 250 the rendered drag reads only by eye. On-device feel is still open for Mark.

## 6. Stuck

None.
