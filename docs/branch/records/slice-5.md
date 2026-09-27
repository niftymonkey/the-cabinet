# Slice 5: the "before" batch (design record A4, A12)

Follow-along row 5: "The test player plays a big batch of runs on today's field, so the next two steps can be measured against it."

Non-coding dispatch: this slice runs the harness and writes one record. It writes no code and no tests, and a Sonnet agent can run it. It is still bound by `docs/branch/records/coder-contract.md` where that contract speaks of where to work, scratch files, never committing, and the anomaly rule. Your scratch folder is `local/tilt-slice-5/`.

## What this slice produces, and why

Slices 7 and 8 change the sim: the field becomes the trapezoid the camera sees, and mobs arrive across its far row. Both change how long things are on the screen, how much fires, and how food is lost (A4). The design record wants each of those as a figure before and after, never a guess, and the figures are only honest if the "before" is played by the same hand the "after" is. Slice 4 made the harness's hand steer on the glass and taught the harness to count mob fire and time on screen, and slices 5 and 6 do not touch the sim, so this batch runs on slice 4's commit.

It runs from its own detached checkout, so it can run while slice 6's coder works in the worktree.

## The steps

1. From the main repo folder: `git worktree add --detach /home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/tilt-before-batch <slice 4's commit>` (the main session gives the hash). In it, `pnpm install --frozen-lockfile --prefer-offline` from its root.
2. From `apps/hungry-grave/` in that checkout, run the four commands of `docs/branch/handoff.md`, "The harness batch", with the output folder `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/tilted-view-build/local/tilt-before-field/batches` as a full path. Run each in the background and wait for it; all four take about 31 minutes of wall clock. Keep the console output in `local/tilt-slice-5/run.log`.
3. Check every run verified, with no recorded fault, no readback fault and no warning. A run that did not is an anomaly: report it with its seed, and do not drop it from the figures silently.
4. Write `docs/branch/records/before-field-batch.md` in the worktree, in the form of #148's before-batch record (`git show 317c0a0c31^:docs/branch/records/before-batch.md`): the commit it ran on, the commands, and one table per hand and rig with the median and range over 48 runs of:
   - corpses swallowed, feasts, power-ups (`tuning.freshnessPaid.swallows.<kind>`);
   - peak grave size (`tuning.gravePath.sizePerTick`);
   - contact hits, and hits from fire, the sum of every other source (`tuning.damageTaken.hits.<source>`);
   - mob fire shots (the `mobFireShots` reading);
   - seconds on screen per mob type, median and largest (the `timeOnScreen` reading);
   - freshness paid at the swallow, median, per food kind (`tuning.freshnessPaid`);
   - food swallowed against food lost, per kind (`foodLedger`);
   - arrivals per section (`arrivals`);
   - sealed and won of 48, and median ticks.
5. Remove the detached checkout with `git worktree remove` when the record is written.

Figures only, and no verdict: the harness hand walks at the nearest food and only dodges, so every figure measures its policy too. A figure the report does not carry is named as missing in the record rather than worked out by hand.

## Done when

`docs/branch/records/before-field-batch.md` holds every figure above for all four hand and rig pairs, the batch folders are under `local/tilt-before-field/batches` in the worktree, the detached checkout is removed, and nothing in the worktree changed except the record, uncommitted. Your note, `docs/branch/records/slice-5-note.md`, has the contract's short form.
