# Slice 16: a whole run played end to end, and the deploy for Mark's phone (design record T10, A12, #159's done-when)

Follow-along row 16: "A whole run is replayed and watched in the real game from its first moment to its end, the proof that the game underneath did not change is run, and the build goes to Mark's phone."

Non-coding dispatch for the watch and the proof: they write no production code and no tests. It is bound by `docs/branch/records/coder-contract.md` where that contract speaks of where to work, scratch files, never committing, stopping what you start, and the anomaly rule. Your scratch folder is `local/tilt-slice-15/`. Paths are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. The deploy is the main session's, under the charter's pre-authorization, after this dispatch reports. It runs on the tree after slices 9 to 15 land.

## What this slice proves, and why

#159's done-when: "A run plays from its first night to won or lost, and a replay of it verifies." `docs/agents/feature-flow.md` asks for a whole run watched in the rendered game for a change with a loop, and `AGENTS.md`: "Play the whole thing, do not only unit-test it." T10 rules the sim untouched, which this slice proves outright rather than by the suite alone.

## The steps

1. **The sim is untouched.** From the worktree root: `git diff 517ee0753e -- apps/hungry-grave/src/game apps/hungry-grave/src/tape` lists nothing but test files, and every test file it lists is one slice 4 or slice 14 names (expected: none). `git diff 517ee0753e --stat -- apps/hungry-grave/src/dev` lists only the two readings of A27 and their wiring. Paste both outputs.
2. **Old tapes still verify.** The tapes in `local/tilt-shots/tapes/` were recorded at `517ee0753e`. Replay each to its end in the built app through `vite preview` and read the verdict: each verifies to its last checkpoint. Also run `scripts/rebatch.ts` over the "before" batch folders under `local/tilt-before-field/batches/` if it re-verifies a batch (read its header first); if it does not, say so and skip.
3. **A whole run watched.** Record a fresh won run on the tip (`scripts/batch.ts steady-far 1000 1 <out> rig=maxed`, as `local/tilt-shots/README.md` says) and a sealed one (`rig=birthright`). Replay each in the built app with the capture tool at tick zero, then every 600 ticks to the end (about forty shots for the won run), plus the Banshee's kill, the Undertaker's kill and 1.5 seconds into the ending scene. Read every shot and write one line each: what section, what is on screen, and anything wrong (a thing off its row, a thing drifting sideways that moves straight in the field, a hole that does not sit among the bodies, an effect not over what it catches, a flicker between frames, anything cut off at the column's edge other than A25's opening). A shot that shows something wrong is an anomaly: report it with its tick.
4. **Browser boot check.** Load the built app fresh, start a run from the title screen, play it with keys for thirty seconds, then open a replay from `?tape=`: canvas present, input moves the grave, no console error or warning.
5. **Record.** Write `docs/branch/records/whole-run.md`: the commands, step 1's outputs, step 2's verdicts, one line per shot from step 3 with its file, and step 4's result.

## After the dispatch: the deploy (the main session)

1. `git worktree add --detach <scratch> <the tip>` from the main repo folder; copy `apps/hungry-grave/.vercel` from the main repo folder; `pnpm install --frozen-lockfile --prefer-offline`; the recipe in `apps/hungry-grave/docs/deploy.md`; `vercel ls` and a `curl` of https://hungry-grave.vercel.app to confirm it serves the tip. Remove the scratch worktree.
2. The build's warnings are the known #50 and #51 only (check the output).
3. Hand Mark the link with "For Mark's next play" from `docs/branch/handoff.md`, and coach his first play line by line.

## Done when

`docs/branch/records/whole-run.md` holds every step's result, nothing in the worktree changed except it and `docs/branch/records/slice-16-note.md` (the contract's short form), uncommitted, and the deploy is confirmed serving the tip.
