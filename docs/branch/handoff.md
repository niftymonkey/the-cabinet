# Handoff: the grave in the ground (#148)

Read the branch charter first: `docs/branch/charter.md`. Then this file.

## Where the branch stands

- Last landed slice: none. The branch holds its planning files only, in one commit.
- Step 1 of 1. The design record is written and the three gates have read it (feature design on the core loop, all three at deep depth, 2026-09-20). Their markers are on #148. Every finding is folded into the design record, `apps/hungry-grave/docs/design/grave-in-the-ground.md`, or sits on a list below. No finding went against Mark's decisions 1 to 11.
- The worktree has its packages installed, and the game's typecheck and tests were green on the untouched tree (163 test files).
- Next, in the runbook's order for a step: write the coder contract and the five slice entries under `docs/branch/records/` from the design record, then dispatch slice 1. Before slice 1's coder starts, run the "before" harness batch the design record names under "Values are data".

## Facts a slice entry needs

The design record carries the rulings. These are the pointers a coder cannot cheaply find:

- The fact report for the grill, with file and line for the swallow code, every system keyed on a swallow, the boss's ending, the shove and Territory's pull, and every size: `local/148-plan/grill-inputs.md` in the main repo folder (gitignored, agent output; the tech architecture gate verified its tick order, swallow seam, sizes and shove facts).
- Slice 1: `coveredFood` in `src/game/step.ts` is where the share is read. The offer's tie rule is `chooseOfferBody` in `src/game/offer.ts`, and the comment on `OFFER_SPACING` there goes false in this slice. The bot's pinned seed lists are in `src/dev/__tests__/bot.test.ts`. `GOLDEN` in `src/dev/digest.ts` should hold; assert it.
- Slice 2: a corpse (`src/game/corpses.ts`) has no velocity today. The witness fold is in `src/game/witness.ts` and the version moves 11 to 12 in this commit. The impulse's clearing on a claimed slot and its not-a-number check in `src/game/invariants.ts` are the patterns to copy for the velocity. The tick order is a ruling stated in the header of `step.ts`; the pull's position in it is named in the design record.
- Slice 3: `GraveRenderer.ts` redraws on every size change today, and the rim carries three jobs. The layer stack is `src/app/screens/game/layering.ts`; one of #121's non-null assertions is there and is paid in slice 3 or 4.
- Slice 4: the `swallowed` event in `src/game/events.ts` has no position today. Transients are registered in `src/app/screens/game/transients.ts`. `ReplayScreen.ts` has its own copy of the event dispatch. `FrameBudgetScreen.ts` gets falls.
- Slice 5: `src/app/screens/game/runEnding.ts` seals and navigates in one call, and `GameScreen.ts` holds every frame after the ending. The boss is at `src/game/bosses/undertaker.ts` (the paths in #106's first comment are stale). `game-concept.md` tells the ending without the drag.
- A builder prompt must say: stop every server and browser you start. A prompt that writes no code opens with `Non-coding dispatch:`, and one that writes code names `docs/agents/feature-flow.md`. Give an agent a scratch folder under a gitignored `local/`, under a name no other agent uses.

## For Mark's read

- Decision 8: with no hands drawn, an unseen force drags the Undertaker the length of the field while the ordinary pull is short and gentle. #148's finish line needs only "the same fall", so the drag and the claw marks are the natural cut line if the branch runs long. Changes nothing unless he says so.
- `scripts/roadmap/v1.yaml` on `main` shows the reverse of the order he ruled (it has the fingerprint before #148 and #149 straight after #148, and #150 has no node). It is made true between branches, and any blocked-by edge in the tracker is a ticket change that needs his yes.
- Ticket draft E (the tilted view) and the hands have no ticket. #148 names the tilted view until it closes. Bring both up at the branch close.

## For Mark's next play

See the list at the end of the design record.

## After this branch (Mark's ruling, 2026-09-20)

All foundations work: the fingerprint (#152), the rest of the #86 doc sweep, all six #150 debts (one of #121's assertions is paid in this branch; #112 looks already paid, verify and close). #149 comes after foundations.
