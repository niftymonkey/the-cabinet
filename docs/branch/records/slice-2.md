# Slice 2: the pull (design record R3)

Follow-along row 2: "The grave pulls nearby food gently toward its rim. Living mobs feel nothing."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. This entry is the planning half of the flow. Your scratch folder is `local/148-slice-2/` in the worktree. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read on the tree at `c309fc812b`, before slice 1 landed, so a line may have moved by a few; the name beside each number is what binds. A name that is gone, or that does something else, is a false claim: stop and report it.

## What this slice builds, and why

Mark, from play: things should feel "pulled or falling or sucked into it as you get close". Slice 1 made the swallow need most of the food over the mouth. This slice gives the grave a gentle tug on dead food near its rim, as real movement in the rules, so food leans in, gathers way, and arrives moving.

When it works, a player sees:

- A corpse near the rim slides toward the mouth, slowly at the edge of the reach and faster at the rim, and it keeps its way for a moment after the grave moves off.
- A corpse outside the reach does not move.
- A living mob beside the rim holds its course. The pull never touches a mob.
- The three option bodies of a power-up offer never move, even when the grave slips between two of them.
- A bell or belch shove can still carry a corpse away from the rim.

## The rule, exactly

Once a tick, for every live entry of `state.corpses` that is not an option body of the live offer (`state.offer.bodyIds`, `src/game/offer.ts:20-24`):

1. `gap` is the distance between the food's box (`corpseHitbox`, `src/game/corpses.ts:145-152`) and the mouth (`graveHitbox`, `src/game/grave.ts:99-107`): on each axis the separation is the larger of zero and the two one-sided distances, and the gap is the square root of the two separations squared and summed. Boxes that touch or overlap have a gap of zero.
2. `nearness` is zero when `gap >= reach` or `reach <= 0`, and otherwise `1 - (gap / reach)^3`, written as multiplication. This is the prototype's out-cubic ease (`index.html:2358-2360` and `:404` on the prototype branch) in exact arithmetic.
3. The direction is `normalize(grave.x - corpse.x, grave.y - corpse.y)` from `src/game/math.ts:60-67`. A zero length means no direction, and the wanted velocity is zero.
4. The wanted velocity is the direction times `strength * nearness`, turned from a per-second value into a per-tick value by dividing by `TICK_HZ` (`src/game/clock.ts:4`, value 60). The rules have no `dt`; every speed in `src/game` is per tick (`src/game/tuning.ts:27` shows the pattern).
5. The catch-up share is `1 - exp(-response / TICK_HZ)`, with the `exp` of `src/game/math.ts:39-41`, never `Math.exp`.
6. The corpse's velocity moves toward the wanted velocity by the catch-up share, on each axis: `v += (wanted - v) * catchUp`. Then the position moves by the velocity.

Out of the reach the wanted velocity is zero, so the same line is the ground's drag and a sliding corpse coasts to a stop. A corpse that was never pulled keeps a velocity of exactly zero. The prototype's jitter and its `atan2` are dropped (design record R3).

The move goes through the same bound the shove uses (`moveInsideBounds`, `src/game/mobs.ts:507-514`), or an equal bound written in the pull's module if that function is not reachable without a cycle. `boundary.test.ts:716-745` forbids an import cycle in `src/game`. Say in your note which you did and why.

The box-to-box gap is the main session's call. The prototype measured the gap from an ellipse round the hole to a point a third of the way into the body (`index.html:1647-1657`), which has no honest rectangle form. The values are data, so Mark's play tunes the difference. Do not reopen it.

## Parts of the code this slice touches

- New module `src/game/pull.ts`. Its concept is the Pull of the glossary. One public seam: `pullFood(state: RunState): void`. It imports from `src/game` only.
- `src/game/corpses.ts`: the `Corpse` record (`:76-121`) gains a velocity, two numbers named `vx` and `vy`. `claimSlot` (`:183-196`) clears it where it clears the impulse, because every spawn comes through that door. Every place that builds a `Corpse` literal sets both to zero; find them with the typechecker.
- `src/game/step.ts`: `step` (`:301-340`) calls `pullFood(state)` immediately before `resolveOverlaps` (`:320`). That is after `advanceMobs` (`:315`), which is where a corpse's shove travels (`src/game/mobs.ts:646-649`), and after every rule that can put new food on the field this tick. It reads the grave after `moveGrave` (`:307`). The header's order sentence (`:254-257`) gains the pull in its place.
- `src/game/tuningRecord.ts`: the `swallow` group that slice 1 added gains three rows: `pullReach` 24 (field units), `pullStrength` 125 (field units a second at the rim), `pullResponse` 4.6 (a second). Each gets a JSDoc like its neighbours. Do everything slice 1's note says a new row needs: the type, the overlay member, `DEFAULT_TUNING`, the spread in `resolveTuning`, and the literal row list and its count in `src/game/__tests__/tuningRecord.test.ts`. `src/__tests__/everyTuningRowHasAReader.test.ts:82-88` fails a row that no shipped `src/game` file reads, so the rows and `pull.ts` land together.
- `src/game/invariants.ts`: `checkCorpsesNoNaN` (the caller at `:133`) checks `vx` and `vy` with `checkSlotFinite`, as `checkImpulseNoNaN` (`:72-87`) does for the impulse. The closed-coverage test (`invariants.test.ts`, the block "the no-NaN coverage is closed (ticket #54)") must name the two fields.
- `src/game/witness.ts`: `foldCorpses` (`:345-357`) folds `vx` and `vy`. `WITNESS_VERSION` (`:196`) moves from 11 to 12, and the history JSDoc above it (`:37-195`) gains the 11 to 12 move in the form of the earlier moves. The direct pin is `src/game/__tests__/witness.test.ts:1544`. The readers in `src/tape/playback.ts`, `src/dev/harnessRun.ts`, `src/app/tapeHeader.ts` and the thirteen test fixtures import the constant, so they follow without an edit; if one holds a literal 11, report it.
- `apps/hungry-grave/CONTEXT.md` and the design record are not yours to edit. Report a needed change in your note.

Rule of three: Territory's pull on mobs (`src/game/lines/territory.ts:521-545`) is the first per-tick pull and this is the second. Write this one on its own. Extract no shared helper.

## What must stay unchanged

- A living mob's path. `pullFood` never reads or writes `state.mobs`.
- The offer's option bodies: position and velocity never change while they are option bodies (ADR 0034).
- The shove. `travelShove` writes no velocity, and the pull writes no impulse, so the two displacements add and never double count.
- Slice 1's swallow rule and every payout.
- `src/game` imports nothing from `src/app`, `src/dev` or Pixi.
- No drawing code changes in this slice.

## Pins

- `WITNESS_VERSION`: 11 to 12, as above.
- `GOLDEN` (`src/dev/digest.ts:488-519`): `checksum` moves, because two new fields are folded for every live corpse. Every other field should hold: the scenario's one swallowed corpse is born at the grave's exact centre (`digest.ts:225-227`), where the pull has no direction, and its other corpse lies at `{ x: 60, y: 300 }` (`digest.ts:227`), far outside a reach of 24 from a grave near `365, 318`. If any field but `checksum` moves, stop and report.
- The bot's seed lists (`src/dev/__tests__/bot.test.ts:130`, `:152`, `:193`, `:260`, `:320`, `:366`, `:397`, `:768`, `:1012`, `:1033`) may move. For each that moves, your note says from what to what. The faults stay empty. `REACHES_VICTORY_MAXED` must keep at least one seed, because slices 5 and 6 need a won run; if it would empty, stop and report.
- Tapes recorded before this slice are refused by version. That is expected.
- Learned in slice 1, and they hold here too. `src/dev/__tests__/harnessPolicy.test.ts` holds three pinned seed lists of the same kind as the bot's (`NEVER_PAID_AT_THE_BIRTHRIGHT`, `STOOD_BUT_NEVER_REACHED`, `ENDS_ABOVE_THE_BIRTHRIGHT`); they may move on the same terms, and your note says from what to what. Two closed lists make every new tuning row answer for itself: `EXCLUDED` in `src/game/__tests__/witness.test.ts` and the exclusion table in `src/game/__tests__/invariants.test.ts`; each of the pull's rows goes into both with its reason, as slice 1's `swallow.tipThreshold` did. Line numbers in this entry were read before slice 1 landed, so the name beside each number is what binds. For the batch, `pnpm vite-node` keeps the working directory it is called in, so give the out-root as a full path: `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/148-grave-in-the-ground/local/148-after-slice-2/batches`. Compare against slice 1's "after" batch at `local/148-after-slice-1/batches` in the worktree's root, and against the "before" folders through their `report.rebatch.json`, which is the only "before" report that carries the food ledger.

## Planned tests

Pin every name as a `test.todo` first, against a stub `pullFood` that does the wrong thing of the right type (it leaves every corpse where it is), so each test is red on its own assertion. Every sim test steps through `stepping` (`src/dev/stepping.ts:26-51`), so the invariants run on every tick. Each test carries a comment that cites R3 or the decision it enforces. Expected values come from the rule above worked by hand, never from running the code.

`src/game/__tests__/pull.test.ts`:

1. a corpse inside the reach moves toward the mouth
2. a pulled corpse gathers way, so its second step is longer than its first
3. a corpse outside the reach does not move, and its velocity stays exactly zero
4. a corpse at the rim is pulled harder than a corpse at the edge of the reach
5. a corpse the grave leaves behind coasts to a stop and never turns back
6. a living mob beside the rim holds the course it holds with the pull turned off
7. the option bodies of an offer do not move when the grave slips between two of them
8. a feast and a fallen rung are pulled as a corpse is
9. a corpse at the grave's exact centre has no direction to go and stays finite
10. a strength of zero turns the pull off, and a corpse inside the reach moves by the scroll alone
11. the reach, the strength and the response are read off the run's own tuning record
12. a slot a pulled corpse died in hands the next food a velocity of zero

`src/game/__tests__/step.test.ts`, in a new block "the pull in the tick order (grave-in-the-ground R3)":

13. a corpse the pull carries to the threshold this tick is swallowed this tick
14. a shove and the pull add in one tick, staged by a mob killed in mid-shove (`handOverImpulse`, `src/game/corpses.ts:235`)
15. a shove away from the grave carries a corpse off the rim against the pull

`src/game/__tests__/invariants.test.ts`: 16. the no-NaN coverage names the corpse's velocity.

`src/game/__tests__/witness.test.ts`: 17. the fold reaches a corpse's velocity, one field at a time; 18. the witness version is 12 (the existing pin, moved).

`src/game/__tests__/tuningRecord.test.ts`: the row list and its count, moved by three rows.

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. `pnpm --filter hungry-grave test` runs the bot's full stages (`src/dev/__tests__/bot.test.ts`), which play the loop from the first tick to won or lost with the invariants on. Zero faults.
2. A rendered check of the built app through `vite preview`. The replay screen opens a tape from `?tape=` (a URL it fetches, `src/app/seedFromUrl.ts:154-162`) at the tick `?at=` names (`:176-183`). Record one harness tape with this slice's code, find by headless stepping a run of ticks where a corpse inside the reach slides toward the mouth, and photograph the replay at three ticks a few ticks apart. Read each screenshot and say in your note where the corpse is against the rim in each. Use `playwright-cli`. No screenshot script exists in the repo.
3. The proof tape for slices 3 to 6: record one full-stage harness tape with this slice's final code, verify it, and leave it at `local/148-proof-tape/` in the worktree with the exact command that replays and verifies it. Slices 3 to 6 replay it to prove they moved no rule.
4. The batch after slice 2: the four commands of `docs/branch/records/before-batch.md` with the output folder `local/148-after-slice-2/batches`. About 31 minutes of wall clock; run each in the background and wait for it. Write `docs/branch/records/after-slice-2-batch.md` in the form of the "before" record: the figures, the comparison with the slice 1 batch by the repo's own comparison tools, and one plain paragraph on the design record's question for #39 (the pull at the rim is 125 a second against a scroll of 38, so can food below the grave be held against its deadline). Figures only, no verdict: the bot only dodges.

Open for the human after this slice (say so in your note): whether the pull feels gentle and right on real corpses under fire, and the power-up offer with the pull on.

## Done when

Every planned test is green, every verification step has a result in your note, the pins moved only as this entry says, and the working tree holds the code, the tests, `docs/branch/records/slice-2-note.md` and `docs/branch/records/after-slice-2-batch.md`, uncommitted.
