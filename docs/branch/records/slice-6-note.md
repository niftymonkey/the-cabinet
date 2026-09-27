# Slice 6 coder note

## 1. What changed

- `FIELD_WIDTH` became `VIEW_WIDTH` and `FIELD_HEIGHT` became `VIEW_HEIGHT` (values unchanged) in 75 files under `apps/hungry-grave/src`: 31 production files (118 lines) and 44 test files (241 lines). `scripts` has no readers.
- `src/game/field.ts`: the JSDoc on the two constants now says they are the column the camera draws into, the field's middle row, and the scale for every speed and size in the rules (ADR 0003). One line says they are still the edges until the trapezoid, and the reason they live in that file is kept. The file header is not touched.
- Prettier collapsed two lines that the shorter names now fit: an import in `camera.ts` and one line in `powerUpLedger.test.ts`.

## 2. Verification results

- Test names: 2699 before and 2699 after. Bare and file-qualified lists are identical.
- Token proof: I compared all 75 files by their parser leaf tokens, with comments and JSDoc stripped and `VIEW_*` mapped back to the old names. 74 files are identical. `camera.ts` differs only by the trailing comma Prettier removed from the collapsed import. With trailing commas before a closing bracket dropped, all 75 are identical (226,696 tokens, 414 renamed identifiers). The instruments are in `local/tilt-slice-6/`.
- Typecheck: exit 0. Tests: `Test Files 183 passed (183)`, `Tests 2688 passed | 11 expected fail | 2 todo (2701)`. Build: exit 0, `✓ built in 7.46s`. `pnpm verify`: exit 0, "All matched files use Prettier code style!".
- `GOLDEN`, the seed lists and every version held, as the green suite shows.
- No timeouts. No rendered check, because nothing a player sees changes.

## 3. Where the entry was wrong about the code

Nowhere. The counts have moved since `517ee0753e` (118 lines in 31 files, not 120 in 30), as the entry expected.

## 4. Decisions made

- I also renamed the constants where comments name them (about 10 lines), so that no comment points at a name that no longer exists. To reverse, restore those comment lines.

## 5. Open items

- The build still prints slice 1's two Rollup `(!)` warnings, about the @pixi/sound dynamic import and the chunk size.

## 6. Stuck

None. I started no processes and nothing is running.
