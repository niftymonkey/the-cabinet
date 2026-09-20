# Handoff: the grave in the ground (#148)

Read the branch charter first: `docs/branch/charter.md`. Then this file.

## Where the branch stands

- Last landed slice: slice 2, the pull. Its note is `docs/branch/records/slice-2-note.md`, and its figures are `docs/branch/records/after-slice-2-batch.md`, which holds the one table where the first-touch build, slice 1 and slice 2 can be read side by side. Slice 1 (the new swallow rule) landed before it: `slice-1-note.md`, `after-slice-1-batch.md` and the last section of `before-batch.md`. `WITNESS_VERSION` is 12 now and `GOLDEN`'s checksum was re-pinned, as slice 2's entry ordered.
- Step 1 of 1, six slices. The branch grew from five on 2026-09-20: the new slice 5 makes a replay play to the run's true end, and the Undertaker's end is now slice 6. The reason and the evidence are in the design record, R6, "The replay reaches the death".
- Every slice entry is written: `docs/branch/records/slice-2.md` to `slice-6.md`. The entries for slices 4 and 6 were drafted by a subagent that opened every file it cites, and the main session read them. Slice 5's entry was written by the main session from a fact report. Slice 2's entry carries what slice 1 taught (the harness policy's pinned lists, the two closed lists a new tuning row must join, a full path for the batch).
- The next work, in order: check usage (`~/.claude/skills/stay-within-limits/usage.sh`), then dispatch slice 3's coder (Opus), the grave drawn as a hole in the ground. It is the first slice with Pixi code, so its prompt tells the coder to load the `pixijs-skills:pixijs` skill. The dispatch points the coder at its entry file, the coder contract and `docs/agents/feature-flow.md`, and need not paste the entry, because the dispatch hook checks only for the feature flow's path.
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
- Cost so far: the coders of slices 1 and 2 each used about 500k to 515k tokens over 85 to 99 minutes, the entry drafter 330k, a Sonnet fact agent 150k to 335k.
- A `vite preview` on port 4173 belongs to the `hungry-grave-v1` worktree. A coder uses another port.
- The replay cannot be held at the tick `?at=` names: it fast-forwards and then plays on to its bound. The coders of slices 1 and 2 held a tick from outside the app: replace the page's `requestAnimationFrame` with a manual pump, and also freeze `performance.now` and advance it one tick's worth per pumped frame, because Pixi's ticker reads real elapsed time and a pumped frame otherwise advances up to fifteen ticks. Slice 4's entry holds a fall by recording a tape of a chosen length, which freezes on its last checkpoint.

## For Mark's read

- The branch has six slices now, not five. The agent made that call; the reason is in the design record, R6.
- The edge rule in R1 is the agent's call and is open to his overrule. So are the threshold's bounds, the pull's form, and what scales in the drawing (R1, R3, R4).
- Decision 8: with no hands drawn, an unseen force drags the Undertaker the length of the field while the ordinary pull is short and gentle. #148's finish line needs only "the same fall", so the drag and the claw marks are the natural cut line if the branch runs long. Changes nothing unless he says so.
- The hold adds the ending scene's frames to a won tape, about 170 frame rows at 2.8 seconds. The recorder already says it records those frames.
- `scripts/roadmap/v1.yaml` on `main` shows the reverse of the order he ruled. It is made true between branches, and any blocked-by edge in the tracker is a ticket change that needs his yes.
- Ticket draft E (the tilted view) and the hands have no ticket. #148 names the tilted view until it closes. Bring both up at the branch close.

## For Mark's next play

See the list at the end of the design record. From slice 1: how the 55% feels on real corpses under fire, and whether a very fast swipe under a corpse ever misses. From slice 2: whether the pull feels gentle and right under fire, and a slip between two power-up options to see that neither moves. Nothing is deployed yet; the first deploy worth his time is after slice 4, when the rule, the pull, the hole and the fall can all be seen together.

## After this branch (Mark's ruling, 2026-09-20)

All foundations work: the fingerprint (#152), the rest of the #86 doc sweep, all six #150 debts (one of #121's assertions is paid in this branch, in slice 3; #112 looks already paid, verify and close). #149 comes after foundations.
