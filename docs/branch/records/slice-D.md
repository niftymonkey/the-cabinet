# Slice D: the weapons behave right, a whole run watched, the proof, and the deploy (design record T10, A12, A20, A21, A22, A28, #159's done-when)

Follow-along row D: "Mark's condition: every weapon and the two bosses' patterns checked at the left edge, the middle and the right edge, measured and photographed; a whole run watched start to finish; the proof that the game underneath did not change; and the build on Mark's phone."

Non-coding dispatch: verification only, written so a Sonnet agent can run it. It writes no production code and no tests; scratch tools live under `local/`. It carries the old slice 15 and 16 entries whole, in order, and runs after slices A to C land. The deploy at its end is the main session's.

Inside the parts, the old slice numbers still appear and map as: slice 10 and 11 are this branch's slice B, slice 12 and 13 are slice C, slice 14 is slice A, slice 15 and 16 are slice D. The parts' scratch folders stay as named. The parts share one note, one uncommitted working tree and one return.

## Part 1: Slice 15: the weapons behave right (design record T10, A20, A21, A28)

Follow-along row 15: "Mark's condition for the tilt: every weapon is checked at the left edge, the middle and the right edge of the screen, measured and photographed, to show its shots and effects go straight and land where the game puts them."

Non-coding dispatch: this slice measures and photographs. It writes no production code and no tests. It builds a scratch recording tool under `local/` and writes one record. It is bound by `docs/branch/records/coder-contract.md` where that contract speaks of where to work, scratch files, never committing, stopping what you start, and the anomaly rule. Your scratch folder is `local/tilt-slice-14/`; the capture tool is `local/tilt-shots/` (read its README). Paths are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. It runs on the tree after slice 14 lands.

### What this slice proves, and why

Mark approved tilt 9 "as long as the weapons behave right" (T10). "Right" is his own earlier words: "When I shoot my main weapon, that goes straight forward", and "The mobs and the weapons should also not be dealing with that tilt." This slice is the evidence, line by line, on the real game, with the grave at the left edge, the middle and the right edge of the screen.

The four weapon lines are `skullStream`, `territory`, `wisps` and `bell` (`src/game/lines/roster.ts:4`), plus the belch (`src/game/belch.ts`) and mob fire (`src/app/screens/game/FieldRenderer.ts`, `syncShots`). The bosses' patterns count too, because the vision promises them readable: the Banshee's tear-rings with one clean gap (`src/game/bosses/banshee.ts:2`, `RING_ROWS`) and the Undertaker's curtains (`src/game/bosses/undertaker.ts`).

"Where the game puts them" is measured two ways at once. Across: a play thing's drawn column x is its field x (A18), which is also where the flat game drew it across, so the check against the flat game is exact. Down: its drawn row is the play layer's row for its field y (`playToColumn`, slice 10), and the check is against that.

### The steps

1. **A staged recording tool.** Write `local/tilt-shots/record-edge.ts` (a scratch tool, run with `pnpm vite-node --config vite.headless.config.ts` from `apps/hungry-grave/`), modelled on `scripts/record-conditioned.ts` (its `recordTape`, `headerFor` and levels parsing, `:108-260`), with its fixed wandering script (`steer`, `:241-246`) replaced by a hand that holds the grave at a chosen field x on its starting row and presses the belch whenever the reservoir is full. Record, from a condition with all four lines at level 5 (`uniformLevels`, `src/game/run.ts`), three tapes of about 3000 ticks each at seed 1000: the grave held at the left edge (field x = half its width), the middle (270) and the right edge (540 less half its width). Record the command lines in `local/tilt-slice-14/record.log`. Each tape must verify in the replay screen to its end; one that does not is an anomaly and a stop.
2. **Numbers from the renderers.** For each tape, in a scratch test or script under `local/tilt-slice-14/` that replays the tape headlessly and drives the renderers as the replay screen does, read every live skull, wisp, mob shot, scatter, Territory patch, bell cone and belch front each tick over the whole tape, and report for each line:
   - **Skulls:** the largest difference between a skull's drawn column x and its field x (must be 0 to 1e-9), and the largest sideways movement of a skull's drawn x over its life that its field x did not make (must be 0 to 1e-9).
   - **Wisps:** the same difference between drawn x and field x; and for each wisp, the angle its sprite is turned against the way its drawn point actually moved that tick (must be under 1 degree).
   - **Mob fire:** the same difference between drawn x and field x; the drawn size against its hitbox's image (never smaller, A21); and the bow of each shot's drawn path from the straight line between where it was first and last drawn, largest and median, in column units and CSS pixels on a 390-wide phone (A28, reported, not a pass mark).
   - **Territory, the bell, the belch:** for each drawn shape, sampled field points one unit inside and one unit outside its sim edge all around it: every inside point draws inside the drawn shape and every outside point outside (A20).
   - **Straight down:** every mob's drawn x against its field x (must be 0 to 1e-9).
   - **Lying things near the edges (A22):** for each corpse and patch that lands within 40 field units of a side edge, how far its drawn centre ends from the ground point it landed on, in column units and CSS pixels, largest and median, against the tech gate's 99 to 108 column units. Reported, not a pass mark.
2b. **The bosses' patterns.** On `local/tilt-shots/tapes/won-maxed-1000.tape` (recorded at `517ee0753e`, still verifying; its README gives the Banshee's section as ticks 7410 to 8170 and the Undertaker's as 21093 to 23548), read every tear-ring and every curtain the renderers draw: the shots' drawn x against their field x (0 to 1e-9), each ring's drawn shape against a circle (its largest departure, in column units, reported: the rings draw as eggs under tilt 9's rows, A28), and the gap lane's drawn bow from the straight line through its ends (reported). Shoot at least two rings mid-flight and two curtains, read each, and say whether the gap reads as a lane the grave can take.
3. **Screenshots, read.** With the capture tool, shoot each of the three tapes at a tick where the skull stream, wisps, a Territory patch, a bell toll and mob fire are all on screen, and one belch mid-sweep, twelve shots or more. Read each and say what you see: skulls in straight vertical columns above the grave; wisps curving only as they home; the patch's hands over the ground it claims; the cones and the belch's fronts over the bodies they catch; mob fire aimed at the grave. Crop and keep the three skull columns side by side (left, middle, right) in `local/tilt-slice-14/`.
4. **Against the flat game.** `git diff 517ee0753e -- apps/hungry-grave/src/game/lines apps/hungry-grave/src/game/belch.ts apps/hungry-grave/src/game/mobs.ts` from the worktree root must list no production file: the weapons' sim is byte for byte the flat game's, so what moves in the field moves as it did. Paste the output.
5. **Record.** Write `docs/branch/records/weapons-check.md`: the tool and the commands, each line's figures from step 2 with pass or fail against its mark, the bow, the rings' and the gap lane's figures and the edge slide for Mark's read, the shots with what each shows, and step 4's result. Figures only: no verdict on the bow, which is his (A28).

Stop every server and browser you start. A failure against a mark in step 2 is not fixed here: it is reported with the tick, the line and the figure, and the main session sends it to a small agent.


## Part 2: Slice 16: a whole run played end to end, and the deploy for Mark's phone (design record T10, A12, #159's done-when)

Follow-along row 16: "A whole run is replayed and watched in the real game from its first moment to its end, the proof that the game underneath did not change is run, and the build goes to Mark's phone."

Non-coding dispatch for the watch and the proof: they write no production code and no tests. It is bound by `docs/branch/records/coder-contract.md` where that contract speaks of where to work, scratch files, never committing, stopping what you start, and the anomaly rule. Your scratch folder is `local/tilt-slice-15/`. Paths are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. The deploy is the main session's, under the charter's pre-authorization, after this dispatch reports. It runs on the tree after slices 9 to 15 land.

### What this slice proves, and why

#159's done-when: "A run plays from its first night to won or lost, and a replay of it verifies." `docs/agents/feature-flow.md` asks for a whole run watched in the rendered game for a change with a loop, and `AGENTS.md`: "Play the whole thing, do not only unit-test it." T10 rules the sim untouched, which this slice proves outright rather than by the suite alone.

### The steps

1. **The sim is untouched.** From the worktree root: `git diff 517ee0753e -- apps/hungry-grave/src/game apps/hungry-grave/src/tape` lists nothing but test files, and every test file it lists is one slice 4 or slice 14 names (expected: none). `git diff 517ee0753e --stat -- apps/hungry-grave/src/dev` lists only the two readings of A27 and their wiring. Paste both outputs.
2. **Old tapes still verify.** The tapes in `local/tilt-shots/tapes/` were recorded at `517ee0753e`. Replay each to its end in the built app through `vite preview` and read the verdict: each verifies to its last checkpoint. Also run `scripts/rebatch.ts` over the "before" batch folders under `local/tilt-before-field/batches/` if it re-verifies a batch (read its header first); if it does not, say so and skip.
3. **A whole run watched.** Record a fresh won run on the tip (`scripts/batch.ts steady-far 1000 1 <out> rig=maxed`, as `local/tilt-shots/README.md` says) and a sealed one (`rig=birthright`). Replay each in the built app with the capture tool at tick zero, then every 600 ticks to the end (about forty shots for the won run), plus the Banshee's kill, the Undertaker's kill and 1.5 seconds into the ending scene. Read every shot and write one line each: what section, what is on screen, and anything wrong (a thing off its row, a thing drifting sideways that moves straight in the field, a hole that does not sit among the bodies, an effect not over what it catches, a flicker between frames, anything cut off at the column's edge other than A25's opening). A shot that shows something wrong is an anomaly: report it with its tick.
4. **Browser boot check.** Load the built app fresh, start a run from the title screen, play it with keys for thirty seconds, then open a replay from `?tape=`: canvas present, input moves the grave, no console error or warning.
5. **Record.** Write `docs/branch/records/whole-run.md`: the commands, step 1's outputs, step 2's verdicts, one line per shot from step 3 with its file, and step 4's result.

### After the dispatch: the deploy (the main session)

1. `git worktree add --detach <scratch> <the tip>` from the main repo folder; copy `apps/hungry-grave/.vercel` from the main repo folder; `pnpm install --frozen-lockfile --prefer-offline`; the recipe in `apps/hungry-grave/docs/deploy.md`; `vercel ls` and a `curl` of https://hungry-grave.vercel.app to confirm it serves the tip. Remove the scratch worktree.
2. The build's warnings are the known #50 and #51 only (check the output).
3. Hand Mark the link with "For Mark's next play" from `docs/branch/handoff.md`, and coach his first play line by line.



## Done when (the whole slice)

`docs/branch/records/weapons-check.md` and `docs/branch/records/whole-run.md` hold every step's result, nothing in the worktree changed except those two records and one note, `docs/branch/records/slice-D-note.md` (the contract's short form), uncommitted, and after the dispatch the main session's deploy is confirmed serving the tip.
