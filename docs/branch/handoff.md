# Handoff: the grave in the ground (#148)

Read the branch charter first: `docs/branch/charter.md`. Then this file.

## Where the branch stands

- Last landed slice: none. The branch holds planning files only.
- Step 1 of 1. The design record is written and the three gates have read it (2026-09-20, markers on #148). Every finding is folded into the design record, `apps/hungry-grave/docs/design/grave-in-the-ground.md`, or sits on a list below. No finding went against Mark's decisions 1 to 11.
- The coder contract is written: `docs/branch/records/coder-contract.md`.
- The five slice entries are NOT written. That is the next work: write `docs/branch/records/slice-1.md` to `slice-5.md` from the design record and the two fact reports below, each carrying every item of the feature flow's dispatch contract (definition, verification steps with actors, seams, module boundaries, planned test list) and a file and line for every claim about existing code. Then dispatch slice 1's coder. The dispatch is the entry plus pointers to the coder contract and `docs/agents/feature-flow.md`.
- The "before" harness batch: see "The before batch" below.
- The worktree has its packages installed, and typecheck and tests were green on the untouched tree (163 test files).

## The fact reports (agent output, gitignored, in this worktree)

- `local/148-slice-facts/sim.md`: the rules code for slices 1 and 2, every fact with a file and a line. `coveredFood`, `overlaps`, the two hitboxes, the corpse record and the four food kinds, `chooseOfferBody` and the `OFFER_SPACING` comment, the tuning record and the tests that pin its rows, the sim test files, the `stepping` helper, the bot's pinned seed lists, `GOLDEN` and its scenario, the grave's clamp and the corpse cull, `claimSlot`, the impulse's not-a-number check, the witness fold and every reader of its version, `math.ts`, the tick order, and the fence tests.
- `local/148-slice-facts/app.md`: the drawing code for slices 3 to 5. `GraveRenderer` and its three rim jobs, the layer stack, the ground, the food renderers, the `swallowed` and `bossKilled` events, the two event dispatches, the transients registry, the frame budget rows, `runEnding.ts` and every path to the end screen, the boss and field renderers, the URL parameters, and the fence tests.
- `local/148-plan/grill-inputs.md` in the main repo folder: the older report from the grill (sections 3 to 7 hold code facts).
- The main session spot-checked `tuningRecord.ts` and the glossary only. A coder that finds a cited fact false stops and reports, as the contract says.

## What the facts change in the plan (fold these into the entries)

- Slice 1, the field's edge. A corpse centred on the side edge caps at 50% under the plain rule. The design record now rules that both halves of the division count only the part of the food inside the field (R1, "Food at the field's edge", agent's call). Tests: a corpse on the side edge is swallowed; food wholly outside the field is not; a power-up on the edge at size 27.
- Slice 1, the offer. Options are 28 wide and 90 apart, so the gap is 62. Each needs about 15.4 of width over the mouth to reach 55%, so two at once need a mouth of about 92.8, and the ceiling is 67.5. Two options can never tip on one tick by width alone. The `OFFER_SPACING` comment (`offer.ts:29-41`, written from first-touch reach) is rewritten from this arithmetic, and `chooseOfferBody` stays as the guard.
- Slice 1, the tuning record. A new group needs: the type, the `TuningOverlay` member, `DEFAULT_TUNING`, the spread in `resolveTuning` (`tuningRecord.ts:328-337`), the literal row list and the count of 10 in `tuningRecord.test.ts:126-167`, and a reader in `src/game`, or `everyTuningRowHasAReader.test.ts` fails. Decide whether a threshold outside 0 to 1 is refused in `resolveTuning`. So slice 2's three pull rows cannot land before slice 2, because a row with no reader fails that test.
- Slice 1 exports the share as well as the yes or no, because slice 4's teeter reads the share (design record R5 is the citation for the second caller).
- Slice 2: the corpse's shove advances inside `advanceMobs` (`mobs.ts:646-649`), not in `advanceCorpses`. Speeds in the rules are per tick (`TICK_HZ = 60`, `clock.ts:4`; no `dt` exists), so the pull's per-second values are turned into per-tick values where they are read. `WITNESS_VERSION` (`witness.ts:196`) is pinned in `witness.test.ts:1544` and stamped in 13 fixture headers.
- Slice 3: `layering.ts:70` holds the one non-null assertion (#121). No fence forbids a Pixi import for one file under `src/app/screens/game`; the `sound.ts` row in `boundary.test.ts:114-120` is the pattern for a new row for the projection module. `GraveRenderer.test.ts` asserts the rim's outer bounds equal the hitbox and that a same-size `sync` does not clear; the second becomes "never clears after the build".
- Slice 4: every transient in the registry is already driven by the run's tick (`scatter.born = run.tick`, `FieldRenderer.ts:338`), so the fall copies that pattern. The rendered check of a fall is a replay of a pinned tape at a chosen tick (`tapeFromUrl`, `atFromUrl` in `src/app/seedFromUrl.ts`). No screenshot script exists; the coder uses `playwright-cli`.
- Slice 4 also carries a finding: the comment at `ReplayScreen.ts:196-200` says the loss announcement is mirrored from the game screen, and no `watchLoss` call exists in that file. The slice touches that loop, so it makes the comment true or reports why not.
- Slice 5: the replay screen has no ending path at all (it plays to the tape's end and stays, `ReplayScreen.ts:161-166`), so R6's "the replay screen gets the same hold" has nothing to hold. The replay needs the scene wired and no hold. Update R6 when the entry is written. Victory, loss, a fatal fault and the pause menu's quit all reach `ending.end()` through `GameScreen.endRun()` (`GameScreen.ts:667-669`), so the hold must tell victory apart there. `bossKilled` (`events.ts:290-295`) carries the kind and the position. The two comments that cite "game-concept.md:70" are stale; the sentence is at line 80, and slice 5 rewrites both comments anyway.
- Slice 5, reaching the ending in play: the app reads `seed`, `size`, `levels`, `signalLock` and `tuning` from the URL and has no stage or boss parameter, no rig picker and no dev menu. The bot wins only from a maxed build. The entry picks the way (rung 1 and 2 first).

## The before batch

Done on the untouched tree: `docs/branch/records/before-batch.md` holds the four commands, the figures and the raw output's place (`local/148-before-batch/`, 192 tapes, all verified, no fault). It took about 31 minutes.

The harness cannot count food lost for corpses and feasts: `corpseLost` is read only by `src/dev/readings/powerUpLedger.ts:146`, for power-ups. The design record asks for swallowed against lost, so the reading is work for slice 1. It must be built and run over the "before" tapes while the old rule still stands, because those tapes replay only on the old rule. So slice 1's entry orders it: the reading first, the "before" tapes read again with it, then the rule. The "after" batch runs when slice 1's code is done, before it lands.

The batch shows 12 and 11 fresh victories of 48 for the two harness hands, while `bot.test.ts` pins no fresh victory for the dodge-only bot. The record notes this. Slice 5's entry checks it, because a winning fresh tape is a way to check the ending.

## Facts a slice entry needs (from the grill session, still true)

- Slice 1: `GOLDEN` in `src/dev/digest.ts` should hold, because its one swallow is a corpse at the grave's exact centre; assert it. The bot's pinned seed lists move: report which, keep the faults empty, keep a winning seed for slice 5.
- Slice 2: the witness version moves 11 to 12 in this commit. The tick order is a ruling in the header of `step.ts`; the pull's place in it is named in the design record.
- Slices 3 to 5 move no pin in the rules. The proof: one full-stage harness tape recorded at slice 2's commit and replayed after slices 3, 4 and 5.
- A builder prompt must say: stop every server and browser you start. A prompt that writes no code opens with `Non-coding dispatch:`, and one that writes code names `docs/agents/feature-flow.md`. Give an agent a scratch folder under `local/` in this worktree, under a name no other agent uses.

## For Mark's read

- The edge rule in R1 is the agent's call and is open to his overrule.
- Decision 8: with no hands drawn, an unseen force drags the Undertaker the length of the field while the ordinary pull is short and gentle. #148's finish line needs only "the same fall", so the drag and the claw marks are the natural cut line if the branch runs long. Changes nothing unless he says so.
- `scripts/roadmap/v1.yaml` on `main` shows the reverse of the order he ruled. It is made true between branches, and any blocked-by edge in the tracker is a ticket change that needs his yes.
- Ticket draft E (the tilted view) and the hands have no ticket. #148 names the tilted view until it closes. Bring both up at the branch close.

## For Mark's next play

See the list at the end of the design record.

## After this branch (Mark's ruling, 2026-09-20)

All foundations work: the fingerprint (#152), the rest of the #86 doc sweep, all six #150 debts (one of #121's assertions is paid in this branch; #112 looks already paid, verify and close). #149 comes after foundations.
