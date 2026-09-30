# Slice F note: food goes in on first touch (R10)

## 1. What changed

- The rule, from the previous agent's reviewed change and kept whole: `src/game/tuningRecord.ts` sets `swallow.tipThreshold` to 0 and its bound now refuses only below 0 or above 1; `src/game/step.ts` reads food as over the mouth when `share > 0 && share >= threshold`, so a threshold of 0 is first touch and a body that only shares an edge with the mouth stays out. `docs/design/grave-in-the-ground.md` carries R10 with Mark's words and marks decision 3 superseded.
- The teeter reads the pull (the main session's ruling on this slice). With a threshold of 0 the old span from `TEETER_START` (0.12 of a share) to the threshold was empty and nothing leaned. Now a body inside the pull's reach leans toward the mouth and darkens by the pull's own nearness: nothing at the reach (24), the whole tilt and darkening at the rim, on R3's out-cubic. A body over the mouth is swallowed that tick, so no drawn body is past the rim.
  - `src/game/pull.ts`: `pullNearness(corpse, state)` exported, a pure reading over public state (the corpse's box, the grave's box, the run's swallow rows). It reads 0 for dead food, for an option of a live offer, and under a pull switched off by strength or reach 0, which is exactly the food `pullFood` never moves. No sim state added; `pullFood` is unchanged.
  - `src/app/screens/game/FieldRenderer.ts`: the lean is `pullNearness(corpse, run)` at the one call site. `leanOf` was a bare alias to it and is gone, with its `shareOverMouth`, `corpseHitbox` and `graveHitbox` imports.
  - `src/app/screens/game/graveDrawingValues.ts`: `TEETER_START` removed (no reader left); `TEETER_TILT` and `TEETER_DARKEN` comments say "at the rim" for "at the threshold". Values unchanged.
- `src/game/offer.ts`: the `OFFER_SPACING` comment argues from first touch. At the ceiling a 67.5 mouth spans the 62 gap between two options 90 apart, so it can touch two on one tick, and ADR 0034's one take rests on the tie-break: nearest centre first, the lower entity id on a dead heat. The value stays 90.
- `docs/branch/charter.md`: one sentence after the Goal's "nothing about how the game plays changes": the swallow rule changed to first touch on Mark's ruling of 2026-09-29 (R10), separate from the tilt.
- `docs/design/grave-in-the-ground.md`, R10's "What it moves": corrected to say the teeter now reads the pull and that the offer's one take rests on the tie-break. It had said no body teeters and that `offer.ts` still argued from 0.55, and both stopped being true in this slice.
- `src/game/__tests__/step.test.ts`: Prettier reformatted the previous agent's edits. Formatting only.

## 2. The pins that moved, and why

The rule is the record's re-pin note (`grave-in-the-ground.md`, "What each slice re-pins"): read which seeds moved, keep the faults empty, keep a winning seed. Every value was read from runs of this tree and of the tip `d3048996d5` (a `git archive` copy), played exactly as the tests play them, by `local/slice-F/measure-seeds.ts`. Every run recorded zero faults. `GOLDEN` did not move: its one swallow is a corpse at the grave's exact centre, which first touch takes on the same tick.

- `bot.test.ts`, `PASSES_THE_BANSHEE_FROM_THE_CEILING`: [101, 404] to [404]. From the ceiling, 101 now stays in her fight (51 kills; it passed her at 118). First touch runs the mechanism that brought 101 in the other way: a ceiling grave takes every corpse it touches again, so it grows back faster between her rings and spends her fight as the bigger target that takes more of them. 404 still passes her. The winning seeds are the maxed build's, all five, unmoved.
- `harnessPolicy.test.ts`, the hand's run of the stage:
  - `NEVER_PAID_AT_THE_BIRTHRIGHT`: [202, 404] to [202]. 404 now opens 2 offers where it opened none. The hand takes every corpse it touches, so it grows faster and meets the later waves at a different size and tick, which decides whether a lane crosses a carrier.
  - `STOOD_BUT_NEVER_REACHED`: [] to [505]. 505 opens 1 offer (2 before, 1 taken) and seals at tick 19164 with it untaken. This is the path, not reach: touching an option is a take again.
  - `ENDS_ABOVE_THE_BIRTHRIGHT`: [303] to [101, 303, 404]. 101 takes 4 of 7 offers and outlasts the budget holding Territory (before: 2 of 4, sealed at 20105, nothing above). 404 takes 2 of 2 and outlasts it holding a skull rung (before: never paid, sealed at 15490). 303 takes all 10 and ends four lines above (before: 2 of 3, Territory only). A rung or option the grave touches is taken on that tick.
- Two harness test names change with their seed's outcome: "is never paid a carrier on seed 404" is now "takes the offers it is paid on seed 404", and "takes the offers it is paid on seed 505" is now "never reaches the one offer that stands on seed 505".

## 3. Tests

Test names before (2782, at `d3048996d5`) against after (2790), compared file-qualified from `vitest list --json`. Every lost name is below.

- Rewritten to the pull, red first on their own assertions (the five that were red, plus the two that had to change setup with them):
  - "leans a corpse further the closer its share is to the threshold" is now "leans a corpse further the nearer it lies to the rim"
  - "leans a corpse at the threshold by the full tilt" is now "leans a corpse at the rim by the full tilt"
  - "stands a corpse back up when the grave slides out from under it" is now "stands a corpse back up when the grave moves out of reach of it"
  - "keeps a leaning corpse's freshness tint under the teeter's darkening": same name, staged at the rim
  - "reads the threshold off the run's own tuning record" is now "reads the pull's reach off the run's own tuning record"
  - "leaves a corpse with nothing over the mouth standing straight" is now "stands a corpse at or beyond the pull's reach straight, at its own freshness". The old staging sits at the rim, where the pull is whole.
  - The describe is now "the teeter (grave-in-the-ground R5 under R10)".
- Added: "leans a corpse by the pull's own nearness: seven eighths of the full lean halfway out", "darkens a corpse by its nearness, not at all at the reach and by the full darkening at the rim", "stands an offer's option straight at the rim, where a lone power-up leans", and in `pull.test.ts` "reads one at the rim, seven eighths halfway out, and nothing at the reach" and "reads nothing for food the pull never moves: an option, dead food, and any food under a pull switched off". Expected figures are worked by hand from R3's out-cubic, 1 - (gap / 24)^3.
- Retired: "stands every corpse straight under a threshold at or below where the teeter starts". The teeter no longer reads a threshold. Replaced by "stands every corpse straight when the run's pull is switched off".
- Updated, promise unchanged: the play-layer test "a corpse lies at its play point ... and its teeter turns it inside that foreshortening" went green with the renderer; only its comment changed ("at the rim").
- The absence guards (out of reach, pull switched off, option at the rim, dead food) cannot be red against a renderer that leans nothing. Their teeth were shown by mutation in a scratch copy instead: deleting the option check, the strength check or the alive check in `pullNearness` turns 2, 2 and 1 of them red.
- The previous agent's lost names (`step.test.ts`, `offer.test.ts`, `tuningRecord.test.ts`) are its reviewed renames and retirements for the rule. They are unchanged here.

## 4. Verification results

- `pnpm --filter hungry-grave typecheck`: exit 0.
- `pnpm --filter hungry-grave test`, twice at default workers: "Tests 3 failed | 2741 passed | 11 expected fail | 35 skipped | 2 todo (2792)" then "Tests 2 failed | 2742 passed | 11 expected fail | 35 skipped | 2 todo (2792)". Every failure was a timeout: `undertaker` "never throws a wall", `replayLifecycle` "a lost run's replay reaches the hit that ended it", `director` "two runs on one seed rebuild identically", harness seed 303 at 30 s, and `measure.test.ts`'s 60 s hook, which skips its 35 tests. Another session was driving a browser, and the load average was about 8 on 12 cores.
- Proved load, not this change: those four files pass alone, 86 of 86, at 2.3 to 2.6 s per timed-out test here against 1.9 to 3.1 s at the tip. The tip's own full suite on this machine at the same time failed the same way: "Tests 2 failed | 2734 passed | 11 expected fail | 35 skipped | 2 todo (2784)".
- `pnpm --filter hungry-grave test --maxWorkers=6`: "Test Files 188 passed (188)", "Tests 2779 passed | 11 expected fail | 2 todo (2792)". Expected-fail and todo counts are the same as slice E's.
- `pnpm --filter hungry-grave build`: exit 0, with the two Rollup warnings slice 1 recorded (chunk size, @pixi/sound import). ESLint clean and Prettier clean on every changed file.
- No tape batch was run. No rendered check was taken: the teeter's look at the rim is for Mark's play.

## 5. Decisions made

1. An option of a live offer never leans. R3 rules that the pull never moves an option, and a tell for a tug that is not there would lie. To reverse: drop the offer check in `pullNearness`, which the pull itself does not use.
2. A pull switched off by strength 0 leans nothing, although the reach still gives a nearness. R3's reversal line reads strength 0 as the pull off. To reverse: drop the strength check.
3. The lean is the pull's nearness itself (out-cubic), not the gap read linearly, because the ruling asked for the value the sim already has, and it keeps the tell and the tug from ever disagreeing.

## 6. Open items

- A seed-505 harness run now opens its one offer and leaves it. That is path, and the set says so. If it matters for #39 it is a batch question.
- For the close: the full suite at default workers times out on this machine under concurrent load, at the tip too. The budgets (`ONE_WHOLE_STAGE_MS`, the 5 s defaults, `measure`'s 60 s hook) are the fragile part, not the runs.
- CodeRabbit on this slice's commit (minor): `pullNearness` in `src/game/pull.ts` reads zero when strength or reach is zero but not when `pullResponse` is zero or less, though a zero response also moves nothing; return zero there too and add the case to the disabled-pull tests. For the close.

## 7. Stuck

None.
