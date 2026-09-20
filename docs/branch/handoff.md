# Handoff: the grave in the ground (#148)

Read the branch charter first: `docs/branch/charter.md`. Then this file.

## Where the branch stands

- Last landed slice: none. The branch holds planning files only.
- Step 1 of 1. The design record is written and the three gates have read it (2026-09-20, markers on #148). No finding went against Mark's decisions 1 to 11.
- The coder contract is written: `docs/branch/records/coder-contract.md`.
- The slice entries for slices 1, 2 and 3 are written: `docs/branch/records/slice-1.md`, `slice-2.md`, `slice-3.md`. Each carries every item of the feature flow's dispatch contract and a file and a line for its claims. The entries for slices 4 and 5 are NOT written.
- The next work, in order: check usage (`~/.claude/skills/stay-within-limits/usage.sh`), then dispatch slice 1's coder. The dispatch is the text of `slice-1.md` plus pointers to the coder contract and `docs/agents/feature-flow.md`. Slice 1 is long, because it runs a harness batch of about 31 minutes. While it runs, a subagent drafts the entries for slices 4 and 5 under `local/148-entry-drafts/` (gitignored), because one writer at a time holds for tracked files. Feed it this handoff, the design record, the coder contract, `slice-3.md` as the pattern, and the fact reports; the main session reads only the finished drafts and moves them into `docs/branch/records/` between slices. Ruled with Mark on 2026-09-20, after the main session filled its context by reading the fact reports itself: the main session never reads a fact report or a large file, and every agent writes its full report to a file at a full path and sends back five lines at most.
- The agent's calls made while the entries were planned are recorded in the design record with their evidence: the threshold's bounds (R1), the pull's exact form and its place in the tick (R3), what scales and what does not (R4), and the instrument for the measure ("Values are data").
- The worktree has its packages installed, and typecheck and tests were green on the untouched tree (163 test files).

## The fact reports (agent output, gitignored, in this worktree)

- `local/148-slice-facts/sim.md`: the rules code for slices 1 and 2. Folded into those two entries.
- `local/148-slice-facts/app.md`: the drawing code for slices 3 to 5. Folded into slice 3's entry; slices 4 and 5 still need it.
- `apps/hungry-grave/local/148-slice-facts/slice1-extra.md`: the readings, the food events, the batch scripts, the tuning record, and the tests that encode first touch. Folded into slice 1's entry. The agent wrote it under `apps/hungry-grave/`, not at the worktree's root. It also says the "before" tapes do not exist; that is false, it looked in the wrong folder.
- `apps/hungry-grave/local/148-slice-facts/slice45-extra.md` (1055 lines): for slices 4 and 5. The `swallowed` event's writer and readers, `syncCorpses`, the frame budget screen, the replay lead-in, `runEnding.ts` whole, the Undertaker on the victory tick, `ReplayScreen`'s frame seam, how a live run reaches the `maxed` rig's conditions, and how a tape file is written and fetched. Its main findings are folded into the two lists below.
- `local/148-plan/grill-inputs.md` in the main repo folder: the older report from the grill.
- The main session spot-checked little of this. A coder that finds a cited fact false stops and reports, as the contract says.

## What the entries for slices 4 and 5 must carry

Slice 4, the fall (R5):

- The `swallowed` event (`src/game/events.ts:13-19`) is widened here with what R2 lists. Tapes record commands, so no pin moves. List its readers from the fact report.
- Slice 3 builds an empty container named `falls` on the grave's renderer, between the walls and the overhanging grass, positioned at the grave and never scaled. The fall fills it. A fall's place is kept in the grave's proportions and multiplied by the grave's size each frame, so a feast falls from the rim while the grave doubles, and the food's drawn size stays in field units.
- The teeter reads `shareOverMouth` (`src/game/tip.ts`, slice 1) and the threshold off the run's tuning record.
- Every transient in the registry is driven by the run's tick (`scatter.born = run.tick`, `FieldRenderer.ts:338`), so the fall copies that pattern and is declared in the registry. The tip and the drop are 0.30 s and 0.75 s, 63 ticks, which is inside the replay lead-in of 90 (`transients.ts`).
- The rendered check of a fall is a replay of a pinned tape at a chosen tick (`tapeFromUrl`, `atFromUrl` in `src/app/seedFromUrl.ts`). No screenshot script exists; the coder uses `playwright-cli`.
- The fall is wired into both event dispatches (`GameScreen.announce`, `:529-540`, and the loop in `ReplayScreen.syncScreen`, `:193-204`), and falls are added to the frame budget rows.
- A finding rides with this slice: the comment at `ReplayScreen.ts:196-200` says the loss announcement is mirrored from the game screen, and no `watchLoss` call exists in that file. The slice touches that loop, so it makes the comment true or reports why not.
- From the second fact report. `asSwallowable` is in `src/game/corpses.ts:160-170`, and `Swallowable` is `src/game/swallow.ts:21-43`; both widen with the event. The event's readers in shipped code are three readings (`src/dev/readings/freshness.ts:34`, `wakingSwallows.ts:75`, `powerUpLedger.ts:135`); sound reads `chimed` and never `swallowed` (`src/app/sound.ts:50-63`). Two tests build a `Swallowed` literal by hand and must gain the new fields: `src/game/__tests__/swallow.test.ts:303-308` and `src/app/__tests__/sound.test.ts:65`.
- `syncCorpses` (`FieldRenderer.ts:288-324`) sets a food sprite's visibility, position and tint, and never its rotation, scale or alpha, so the teeter's lean, shake and darkening are new per-slot work there.
- The frame budget screen builds only a `FieldRenderer` (`FrameBudgetScreen.ts:98`, its per-frame driver is `update`, `:156-175`) and no grave renderer. Slice 3 puts the `falls` container on the grave's renderer, so the entry must say how the frame budget rows get falls to draw: either the screen gains a grave renderer, or the fall's pool can be attached to a container the screen supplies.
- `tapePlaybackSession.ts` is at `src/app/screens/`, not under `game/`; its one use of the lead-in is `fastForwardChunk` (`:189-211`). `transients.test.ts` has four tests, and its second one sums the key counts of three owners by name, so a fourth owner means an edit to that sum.
- The drawing's values (the tip and drop times, the tilt) are rows in `src/app/screens/game/graveDrawingValues.ts`, which slice 3 creates.

Slice 5, the Undertaker's end (R6):

- The replay screen has no ending path at all (it plays to the tape's end and stays, `ReplayScreen.ts:161-166`), so R6's "the replay screen gets the same hold" has nothing to hold. The replay needs the scene wired and no hold. Update R6 when the entry is written.
- Victory, loss, a fatal fault and the pause menu's quit all reach `ending.end()` through `GameScreen.endRun()` (`GameScreen.ts:667-669`), so the hold must tell victory apart there. `bossKilled` (`events.ts:290-295`) carries the kind and the position.
- The two comments that cite "game-concept.md:70" are stale; the sentence is at line 80, and slice 5 rewrites both comments and that sentence anyway.
- Reaching the ending in play. The app reads `seed`, `size`, `levels`, `signalLock` and `tuning` from the URL and has no stage or boss parameter. The main session's leaning, to check against the fact report: two ways and no new parameter. A replay link to a won harness tape, opened a few seconds before his death, lets Mark read the scene at once; and the URL that gives a live run the `maxed` rig's conditions lets him win by hand, because every maxed harness run wins. A parameter that starts a run at the boss would change the starting conditions in the tape's header, which is too much for this slice.
- From the second fact report. On the tick he dies `state.boss` is set to null (`killBoss`, `src/game/bosses/phases.ts:180-187`), and `BossRenderer.sync` hides the body when the boss is null (`BossRenderer.ts:42-52`). So the scene draws him itself, from `bossKilled`'s kind and place; his box is 60 by 40 half extents (`phases.ts:75-76`).
- After the ending no frame reaches `syncScreen`: the frame policy answers `'ending'` first (`framePolicy.ts:52-58`), and `syncScreen` is called only from the opening frame (`GameScreen.ts:369`) and the live branch of `spendFrame` (`:489`). The scene needs its own frame path during the hold. The replay is the same: after the tape's last frame `advance()` returns no run (`tapePlaybackSession.ts:371-376`) and `ReplayScreen.update` (`:161-166`) stops calling `syncScreen`, so the scene in a replay also needs frames past the tape's end.
- `runEnding.ts` has no test file anywhere. `createRunEnding` is called once, at `GameScreen.ts:257-263`. The hold is new behaviour in that module, so the entry plans its first tests.
- Reaching the ending: `?levels=5` alone gives a live run the `maxed` rig's conditions (`src/dev/rigs.ts:100-110`; the other defaults of `createRun` already match). A tape dropped in `apps/hungry-grave/public/` is fetched at `?tape=/<name>.tape` under `vite preview` (`fetchTape`, `tapePlaybackSession.ts:304-332`); tapes are raw binary, written as `<seed>.tape` (`scripts/batch.ts:298`).
- Confirmed: the batch's hands and the bot are different players. `bot.test.ts` measures `dodgePolicy` (`:540-554`), and `scripts/batch.ts` runs `harnessPolicy` (`src/dev/harnessRun.ts:154-187`). So "no fresh run beats the Undertaker" is true of the dodge-only bot alone, and a won fresh tape exists in the "before" batch. The design record's sentence in R6 should say so when the entry is written.
- The "before" batch shows 12 and 11 fresh victories of 48 for the two harness hands, while `bot.test.ts` pins no fresh victory for the dodge-only bot. They are likely different players. The entry checks it, because a winning fresh tape is a way to check the ending.

Slices 3 to 5 move no pin in the rules. The proof: one full-stage harness tape recorded at slice 2's commit (`local/148-proof-tape/`, slice 2's entry orders it) and replayed after slices 3, 4 and 5.

## The before batch

`docs/branch/records/before-batch.md` holds the four commands and the figures. The 192 tapes are at the worktree's root: `local/148-before-batch/batches/<hand>-<rig>-default-<stamp>/`, each folder with 48 `<seed>.tape` files and a `report.json`. The record says the commands ran from `apps/hungry-grave/` with a relative output path, which does not agree with where the tapes are; slice 1's entry tells the coder to find out how the path resolved.

## Facts a dispatch needs

- A builder prompt must say: stop every server and browser you start. A prompt that writes no code opens with `Non-coding dispatch:`, and one that writes code names `docs/agents/feature-flow.md`, or the dispatch hook refuses it. Give an agent a scratch folder under `local/` in this worktree, under a name no other agent uses. Tell an agent the exact folder for a report, as a full path; one agent wrote its report under `apps/hungry-grave/local/`.
- A Sonnet fact agent costs about 150k to 335k tokens.

## For Mark's read

- The edge rule in R1 is the agent's call and is open to his overrule. So are the calls listed under "Where the branch stands".
- Decision 8: with no hands drawn, an unseen force drags the Undertaker the length of the field while the ordinary pull is short and gentle. #148's finish line needs only "the same fall", so the drag and the claw marks are the natural cut line if the branch runs long. Changes nothing unless he says so.
- `scripts/roadmap/v1.yaml` on `main` shows the reverse of the order he ruled. It is made true between branches, and any blocked-by edge in the tracker is a ticket change that needs his yes.
- Ticket draft E (the tilted view) and the hands have no ticket. #148 names the tilted view until it closes. Bring both up at the branch close.

## For Mark's next play

See the list at the end of the design record.

## After this branch (Mark's ruling, 2026-09-20)

All foundations work: the fingerprint (#152), the rest of the #86 doc sweep, all six #150 debts (one of #121's assertions is paid in this branch, in slice 3; #112 looks already paid, verify and close). #149 comes after foundations.
