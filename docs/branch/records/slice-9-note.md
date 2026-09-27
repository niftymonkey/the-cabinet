# Slice 9 coder note

## 1. What changed

- The inverse of `7fac05ff88` scoped to `apps/hungry-grave`, applied with `git apply` (the check passed, and so did the apply). `VIEW_WIDTH` and `VIEW_HEIGHT` are back to `FIELD_WIDTH` and `FIELD_HEIGHT` in the same 75 files under `src`. The same apply restored the JSDoc in `src/game/field.ts`, the two lines Prettier had collapsed, and the comment lines. Nothing else changed.

## 2. Verification results

- Proof 3: all 75 files from `git diff --name-only 7fac05ff88^ 7fac05ff88 -- apps/hungry-grave` show an empty `git diff 7fac05ff88^` (0 lines). The modified set under `apps/hungry-grave` is exactly those 75 files.
- Test names: 2699 before and 2699 after, identical both bare and file-qualified.
- Tapes: `won-maxed-1000` verified to tick 23548 and `sealed-birthright-1000` to tick 19991.
- Typecheck exited 0. Tests: `Test Files 183 passed (183)`, `Tests 2688 passed | 11 expected fail | 2 todo (2701)`. Build: `✓ built in 8.19s`. `pnpm verify` exited 0 with "All matched files use Prettier code style!". Since the suite is green, `GOLDEN`, the seed lists and every version held.
- No rendered check was needed, because nothing a player sees changed.

## 3. Where the entry was wrong about the code

- Proof 4 is false as written. The grep finds two hits, both in `docs/design/tilted-view.md` (lines 110 and 236, in A3 and A26). The replan added them after `9b125bbc03`. `src` has none. Recommendation: keep both lines, because they record the rename, and narrow the proof to `src`.

## 4. Decisions made

None.

## 5. Open items

- The build still prints slice 1's two Rollup `(!)` warnings.
- During my run, files under `docs/branch` changed in this worktree: the charter, handoff, follow-along, contract and entries 10 to 16 were modified, and entries A to D are new. I did not make those changes.

## 6. Stuck

The only stop is the proof 4 claim in section 3. Nothing is running.
