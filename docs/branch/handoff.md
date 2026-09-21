# Handoff: the grave in the ground (#148)

Read the branch charter first: `docs/branch/charter.md`. Then this file. Every ruling this branch made, with its evidence and how to reverse it, is in the design record `apps/hungry-grave/docs/design/grave-in-the-ground.md`, R1 to R9. This file holds only what is still open and what later work needs.

## Where the branch stands

All nine slices are landed, pushed and deployed. The three close-of-step gates ran at standard depth on the built result (markers on #148, reports under `local/148-gates/`), their real defects are fixed, and the step's working records are folded into the design record and deleted.

The build: `WITNESS_VERSION` is 13, `FORMAT_VERSION` is 5, `GOLDEN` is re-pinned, and the fault identity `growth owed in range` is fatal. Every tape recorded before slice 9 is refused, by a named starting condition one step before the witness version would refuse it too. **The won tape to use is `local/148-slice-9/won-tape/3000.tape`** (22,716 ticks, verified, with the replay command in its README).

The step's working records were deleted in commit `<HASH GOES HERE: the main session writes the deletion commit's hash on this line>`. Everything they held is reachable through it: the coder contract, the nine slice entries, the nine coder notes, the gate-fixes note and the four batch records.

## What is left, in order

1. The branch close: `.claude/skills/branch-runbook/end-of-the-branch.md`. It needs Mark for two things, his ADR rulings and his own yes for the merge, so the work stalls there where he can see it.
2. `docs/branch/ticket-drafts.md` holds 13 new tickets, 4 comments and one note that the hands need no ticket, each in his format. Nothing is created without his yes. Draft 11 sits under #141, which is under #31, and the tech gate would move it to #150; that is his move.
3. `scripts/roadmap/v1.yaml` on `main` shows the reverse of the order he ruled, and it has no node for #150 or #155. It is made true between branches, and any blocked-by edge in the tracker is a ticket change that needs his yes.

## For Mark's read

- **Food is hard to see on the new earth, and this is the colour talk he planned for after the exact look.** A fresh corpse reads APCA Lc 35 over the ground, but a corpse darkens as it goes stale and that fade crosses the earth's own brightness, so rotten food reads louder than half-fresh food. Every lever is on the corpse; the ground and the grave are his rulings and stay. Draft 2 carries it to #151 with the whole fade measured.
- **Did he mean the steady glow to go as well as the blink?** His words named the blinking border. The glow also rose steadily as the belch filled, and the build removed all of it, so the charge is now read only from the corner button. Ticket #155 wants the same band for Territory's countdown, so the two may want designing together. Draft 9 carries it.
- Two of the three section tints could not follow the ground up, so the Procession is now the brightest section and the Vigil the dimmest, the reverse of before. Raising the other two needs the Waking's source re-valued or an existing check re-argued, and both are colour decisions. Draft 5 carries it.
- The ground can come back blank after switching apps on a phone: a restored WebGL context returns the baked texture empty and nothing asks for a new bake. Not fixed on this branch, and it would read as a random break if he met it without knowing. Draft 4.
- Territory's hands draw above the grave, so a patch laid over it hides the top of the hole and anything falling in. The layer stack is ADR 0014's and no slice changed it. Draft 3.
- The 2.8 second ending is short by the one guideline the design gate found, and its held third of a second is longest at small graves, which slice 9 makes common.
- Slice 9's two growth rows are the agent's first values, and #39 sweeps them with `HIT_SHRINK` and `CORPSES_TO_CEILING` together. His two reads from play are whether the grave ever gets big and whether one hit feels like something he can mow back. Draft 1.
- Several calls in the design record are the agent's and are open to his overrule, each marked as such where it sits: the payout at the tip (R2, A1), food at the field's edge and the threshold's bounds (R1), the pull's form and its bounds (R3), the grave's bake and rebuild step (R7), and all four of slice 9's growth calls (R9).
- The main checkout's `node_modules` looks stale: a build there fails with `Unknown compiler option 'erasableSyntaxOnly'` and `Cannot find module 'pngjs'`, while the same build passes in this worktree. A `pnpm install` in the main checkout is his to run or allow.

## For Mark's next play

The list is at the end of the design record, `apps/hungry-grave/docs/design/grave-in-the-ground.md`. Every feel question this branch raised is on it, including the ones each slice left: the payout at the tip with weapons on, the 55% and the pull under fire, a slip between two power-up options, a very fast swipe, the fall and the teeter, the fall at the start size, the tufts' colour, the brighter earth, the ending scene at real speed, the ground on his phone, and the swell.

Every mechanical acceptance line of #148 and #106 is met. Every feel line waits on his play, which is what those lines ask for.

## Facts later work needs

- **A deploy builds from a clean detached checkout**, never from this worktree while anyone has uncommitted work in it: `git worktree add --detach <scratch> <commit>`, copy `apps/hungry-grave/.vercel` from the main repo folder, `pnpm install --frozen-lockfile --prefer-offline`, then the recipe in `apps/hungry-grave/docs/deploy.md`, then `vercel ls` and a `curl` of the alias to confirm.
- **Holding a frame in the rendered app.** The replay screen cannot be held at the tick `?at=` names: it fast-forwards and then plays on to its bound. Hold a tick from outside the app by replacing the page's `requestAnimationFrame` with a manual pump and also freezing `performance.now`, advancing it one tick's worth per pumped frame, because Pixi's ticker reads real elapsed time and a pumped frame otherwise advances up to fifteen ticks. The other way, for a state at the end of a run, is to record a tape of a chosen length with `scripts/record-conditioned.ts`, which freezes on its last verified checkpoint.
- **The batch tapes for #149's reading.** 192 tapes from slice 9's batch are at `local/148-slice-9/batches` in this worktree, and draft 8 asks for one reading off them (ticks spent within one hit of the floor) before #149's grill. Wall clock only, no database and no tokens.
- `pnpm vite-node` keeps the working directory it is called in, so a batch's out-root is given as a full path.
- A `vite preview` on port 4173 belongs to the `hungry-grave-v1` worktree. Use another port.
- A prompt that writes no code opens with `Non-coding dispatch:` and one that writes code names `docs/agents/feature-flow.md`, or the dispatch hook refuses it. Give an agent a scratch folder under `local/` in this worktree, under a name no other agent uses, as a full path.

## After this branch (Mark's ruling, 2026-09-20)

All foundations work: the fingerprint (#152), the rest of the #86 doc sweep, all six #150 debts (one of #121's assertions was paid in this branch, in slice 3; #112 looks already paid, verify and close). #149 comes after foundations.

For the #86 doc sweep: 153 comments under `src` and `scripts` cite ADR numbers the condensation retired; the ADR README maps each one. Draft 15 adds four more places the docs no longer name anything drawn.
