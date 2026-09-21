# Handoff: the grave in the ground (#148)

Read the branch charter first: `docs/branch/charter.md`. Then this file.

## Where the branch stands

- Last landed slice: slice 5, a replay plays to the run's true end. Its note is `docs/branch/records/slice-5-note.md`, with a Landing section. The won tape for slice 7 (the Undertaker's end) is `local/148-won-tape/3000.tape` (victory at tick 23,470; all 393 checkpoints verify). Before it, slice 4, the fall and the teeter (`slice-4-note.md`, screenshots under `local/148-slice-4/screenshots/`): the `swallowed` event carries the food's place, way, size and look, and `fall.ts` is the pure fall the Undertaker's end reuses. Slice 3 drew the grave as a hole (`slice-3-note.md`); it created `graveProjection.ts`, `graveDrawingValues.ts` and the `falls` container. Slice 2 is the pull (`slice-2-note.md`, figures in `after-slice-2-batch.md`). Slice 1 is the new swallow rule (`slice-1-note.md`, `after-slice-1-batch.md`, the last section of `before-batch.md`). `WITNESS_VERSION` is 12.
- **Mark's ruling, 2026-09-21, his words:** "this image does not look like the prototype. I feel like for the prototype we did a number of iterations to land on the right look and feel for the grave. That's what I want implemented here, exactly as it is in the prototype. That's all I'm going to say about that." This is a ruling, not a question. Do not ask him again, do not offer options, and do not argue the rim, ADR 0003 or ADR 0014 against it. The three rim options offered to him earlier are dead.
- Why slice 3 missed: it was built to R4, which kept the game's pale rim, and it was measured against the prototype's numbers and never against its look. The prototype (build 7, `apps/hungry-grave/src/prototypes/grave-fall/index.html` on `prototype/148-grave-fall`) draws no pale rim, and its `COLOR` comment (about lines 298 to 306) says why: four values stay apart in a grayscale squint, the moonlit ground is brightest, then the lit side wall, then the far wall and shaded side, and the depth is the only true black. Nothing at the rim is brighter than the ground. The trodden margin is overlapping patches, not a ring (about lines 906 to 912). The game's ground tile `nightSpeckle` is luma 13.99, and slice 3 capped `graveWall` under it at 13.71; the prototype's ground is `0x454f5d` with speckle `0x66748a`. The prototype also paints roughness, cracks, moss, a turf shadow inside the edge and heavy overhanging grass (its painters run from about line 700 to line 1060).
- Step 1 of 1, seven slices now. The new slice, "the grave looks exactly like the prototype's", is slice 6 and runs before the Undertaker's end, now slice 7 (entry `docs/branch/records/slice-7.md`, renamed from `slice-6.md`). The follow-along list is renumbered.
- The next work, in order. (1) Compare before building: take pictures of prototype build 7 (open the file with `playwright-cli` at 390 by 844, device scale 3) at the floor, start and ceiling sizes, beside the deployed game at the same sizes. A Sonnet agent can take them; the main session looks at them itself. (2) Write the new slice entry and correct R4 in the design record: the rim's three jobs (the hitbox edge, the reservoir's glow, Territory's arc) are re-homed or dropped so nothing round the opening is brighter than the ground; every painter, colour relation and proportion of the prototype's grave is carried over by name, item by item, each marked done or named as dropped with its reason. The look is the ruling; "a reference is not a template" governs copying code only. Where the game's dark ground makes the four-value rule impossible, solve that (the ground round the grave, or the grave's own values). `palette.test.ts` and `SEPARATION_EXCEPTIONS` will move; say what moved. In the same edit, the design record's mentions of the Undertaker as "slice 6" become slice 7. (3) The coder's done line includes a side-by-side picture at three sizes, which the main session reads before landing, and the step-close gates read the same pictures. (4) Deploy, and tell Mark plainly it is up, with no question. (5) Then slice 7.
- A deploy builds from a clean detached checkout, never from this worktree while a coder has uncommitted work in it: `git worktree add --detach <scratch> <commit>`, copy `apps/hungry-grave/.vercel` from the main repo folder, `pnpm install --frozen-lockfile --prefer-offline`, then the recipe in `apps/hungry-grave/docs/deploy.md`, then `vercel ls` and a `curl` of the alias to confirm. Slices 1 to 4 are live. A dispatch points the coder at its entry file, the coder contract and `docs/agents/feature-flow.md`.
- The main session never reads a fact report or a large file. Every agent writes its full report to a file at a full path and sends back five lines at most. A coder returns its note.

## Landing a slice

As `during-the-branch.md` says. In practice: `git add -N .` so CodeRabbit sees new files, then `coderabbit review --agent -t uncommitted` from the worktree's root; run typecheck, lint, `prettier --check .` and the tests yourself; fix or decline each finding; add a "Landing" section to the coder's note; rewrite this file; commit and push; set the row on `docs/branch/follow-along.md`; check usage.

## Agent reports (gitignored, in this worktree)

- `local/148-slice-facts/sim.md` and `app.md`, and `apps/hungry-grave/local/148-slice-facts/slice1-extra.md` and `slice45-extra.md`: the fact reports behind the entries. The drafter found five false claims in them, four of them line numbers off by one. The entries carry the corrected facts.
- `local/148-entry-drafts/summary.md`: the drafter's 19 calls for slices 4 and 6, each with its evidence.
- `local/148-final-checkpoint/facts.md`: the facts behind slice 5.
- A coder that finds a cited fact false stops and reports, as the contract says.

## The batches

`docs/branch/records/before-batch.md` holds the four commands and the figures. The 192 "before" tapes are at `local/148-before-batch/batches/<hand>-<rig>-default-<stamp>/`, and each folder now also holds `report.rebatch.json`, the only "before" report that carries the food ledger. They replay only on the old rule, so they cannot be read again. Slice 1's "after" batch is at `local/148-after-slice-1/batches/` and slice 2's at `local/148-after-slice-2/batches/`; tapes from before slice 2 are refused by version now. The proof tape for slices 3 to 6 is `local/148-proof-tape/2000.tape` (the sharp hand on the maxed rig, 22,821 ticks, a victory), with a README that carries the command that replays and verifies it. `pnpm vite-node` keeps the working directory it is called in, so a batch's out-root is given as a full path.

## Facts a dispatch needs

- A builder prompt must say: stop every server and browser you start. A prompt that writes no code opens with `Non-coding dispatch:`, and one that writes code names `docs/agents/feature-flow.md`, or the dispatch hook refuses it. Give an agent a scratch folder under `local/` in this worktree, under a name no other agent uses, as a full path.
- Cost so far: the coders of slices 1 to 3 each used about 500k to 560k tokens over 75 to 99 minutes, the entry drafter 330k, a Sonnet fact agent 150k to 335k.
- A `vite preview` on port 4173 belongs to the `hungry-grave-v1` worktree. A coder uses another port.
- The replay cannot be held at the tick `?at=` names: it fast-forwards and then plays on to its bound. The coders of slices 1 and 2 held a tick from outside the app: replace the page's `requestAnimationFrame` with a manual pump, and also freeze `performance.now` and advance it one tick's worth per pumped frame, because Pixi's ticker reads real elapsed time and a pumped frame otherwise advances up to fifteen ticks. Slice 4's entry holds a fall by recording a tape of a chosen length, which freezes on its last checkpoint.

## For Mark's read

- Claimed ground (Territory) loses 2.6 APCA points over the grave's new lit wall and tufts (43.30 and 41.30 against a bracket of 45). It is priced in `SEPARATION_EXCEPTIONS` in `palette.test.ts` with its argument, and slice 3's note gives the reasoning.
- The branch has seven slices now. Slice 5 (the replay's true end) was the agent's call, with its reason in the design record, R6. The prototype-look slice follows his ruling.
- The edge rule in R1 is the agent's call and is open to his overrule. So are the threshold's bounds, the pull's form, and what scales in the drawing (R1, R3, R4).
- Decision 8: with no hands drawn, an unseen force drags the Undertaker the length of the field while the ordinary pull is short and gentle. #148's finish line needs only "the same fall", so the drag and the claw marks are the natural cut line if the branch runs long. Changes nothing unless he says so.
- The hold adds the ending scene's frames to a won tape, about 170 frame rows at 2.8 seconds. The recorder already says it records those frames.
- `scripts/roadmap/v1.yaml` on `main` shows the reverse of the order he ruled. It is made true between branches, and any blocked-by edge in the tracker is a ticket change that needs his yes.
- Territory's hands draw in the `storm` layer, above `graveMouth`, so a patch laid over the grave hides the top of the hole and the falls in it. The layer stack is ADR 0014's and slice 4 changed none of it.
- Ticket draft E (the tilted view) and the hands have no ticket. #148 names the tilted view until it closes. Bring both up at the branch close.

## For Mark's next play

See the list at the end of the design record. From slice 1: how the 55% feels on real corpses under fire, and whether a very fast swipe under a corpse ever misses. From slice 4: whether the fall reads as a body going over the edge and not a body being deleted, whether the teeter reads as "nearly in" and not as a glitch, the tip and drop times, the warm grey a falling body darkens through, and that the drop's second half cannot be seen at the start size because the dark has the body by then. From slice 3: whether the grave reads as a grave in the ground at the start size, and the colour of the tufts (a dark grey-green, `graveTurf` `#263121`, parted from the ground by hue alone). From slice 2: whether the pull feels gentle and right under fire, and a slip between two power-up options to see that neither moves.

## After this branch (Mark's ruling, 2026-09-20)

For the #86 doc sweep: 153 comments under `src` and `scripts` cite ADR numbers the condensation retired; the ADR README maps each one.

All foundations work: the fingerprint (#152), the rest of the #86 doc sweep, all six #150 debts (one of #121's assertions is paid in this branch, in slice 3; #112 looks already paid, verify and close). #149 comes after foundations.
