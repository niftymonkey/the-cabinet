# The "before" harness batch (design record, "Values are data")

Agent output, 2026-09-20, on the untouched tree at `c041775efc` (the first-touch swallow rule). The same four commands run again after slice 1, and the two are compared with the repo's own comparison tools. The bot only dodges, so every figure measures the policy too: a size of shift, never a verdict.

## The commands, from `apps/hungry-grave/` in the worktree

```
pnpm vite-node --config vite.headless.config.ts scripts/batch.ts steady-far   1000 48 local/148-before-batch/batches rig=birthright
pnpm vite-node --config vite.headless.config.ts scripts/batch.ts shaky-short  1000 48 local/148-before-batch/batches rig=birthright
pnpm vite-node --config vite.headless.config.ts scripts/batch.ts steady-far   1000 48 local/148-before-batch/batches rig=maxed
pnpm vite-node --config vite.headless.config.ts scripts/batch.ts shaky-short  1000 48 local/148-before-batch/batches rig=maxed
```

Seeds 1000 to 1047 (`BATCH_SEEDS`, `src/dev/batchReport.ts:36`). The two hands are the sharp and the sloppy hand of `apps/hungry-grave/docs/design/playing-harness.md`. The default tuning candidate. About 31 minutes of wall clock for all four. For the "after" batch, change the output folder to `local/148-after-slice-1/batches`.

## The figures

| Hand / rig | Corpses swallowed (median, range) | Feasts | Power-ups | Peak grave size (median, range) | Contact hits (median, range) | Sealed / victory of 48 | Ticks (median) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| steady-far / birthright | 57 (19 to 210) | 2 (1 to 4, n=47) | 2 (1 to 12, n=30) | 67.5 (27.4 to 67.5) | 19 (2 to 33) | 36 / 12 | 22406 |
| shaky-short / birthright | 93 (8 to 798) | 2 (2 to 4, n=23) | 4 (1 to 18, n=26) | 28.4 (27.1 to 67.5) | 17 (4 to 60) | 37 / 11 | 8379 |
| steady-far / maxed | 383 (150 to 508) | 4 (1 to 4, n=47) | 8 (3 to 14) | 67.5 (33.3 to 67.5) | 0 (0 to 2) | 0 / 48 | 23235 |
| shaky-short / maxed | 1445 (1191 to 1699) | 4 | 19 (15 to 22) | 67.5 | 19 (9 to 30) | 0 / 48 | 22076 |

An `n` below 48 means the other runs swallowed none of that kind. Growth is the peak size per run (`tuning.gravePath.sizePerTick`, `src/dev/readings/gravePath.ts`). Swallows are `tuning.freshnessPaid.swallows.<kind>` (`src/dev/readings/freshness.ts`). Contact hits are `tuning.damageTaken.hits.contact` (`src/dev/readings/damageTaken.ts`). The outcome is `counts['run.ending']`.

All 192 runs verified, with no recorded fault, no readback fault, and no warning.

## The figure the harness cannot read

Food lost, for corpses and feasts. The `corpseLost` event exists (`src/game/events.ts:362-368`, fired at `src/game/corpses.ts:383`), and the only reading of it is `src/dev/readings/powerUpLedger.ts:146`, which keeps power-ups only. The design record asks for food swallowed against food lost, so the reading is part of the work. It must exist before the rule changes, because the 192 "before" tapes replay only on the old rule.

## The raw output (gitignored, this worktree)

`local/148-before-batch/run.log` and four folders under `local/148-before-batch/batches/`, each with 48 tapes and a `report.json`.

## A note on the claim in the old handoff

This batch has 12 and 11 fresh victories out of 48 for the two hands, while `bot.test.ts` pins `REACHES_VICTORY_FRESH = []`. The likely reason, not yet checked in the code: they are different players, the batch played by the harness hands (`src/dev/harnessPolicy.ts`, `src/dev/configurations.ts`) and the test by the dodge-only bot (`src/dev/bot.ts`) on five seeds. If that holds, the design record's sentence "no fresh run beats the Undertaker yet" is true of the bot only, and slice 5's entry should check it, because a winning fresh tape is a way to check the ending.

## Food swallowed against food lost

Agent output, 2026-09-20, slice 1 part A. The figure the section above says the harness cannot read is read here, off these same 192 tapes, while the first-touch rule still stands. Two things were built for it: the food ledger reading (`src/dev/readings/foodLedger.ts`), which counts swallowed, lost off the bottom and rotted away for each of the four kinds of food, and `scripts/rebatch.ts`, which folds a batch's own stored tapes into a report again. Nothing was replayed twice or played afresh: each folder now carries `report.rebatch.json` beside the `report.json` its batch wrote.

Read from the folder each figure was folded from with:

```
pnpm vite-node --config vite.headless.config.ts scripts/rebatch.ts <batch-folder>
```

The refold is honest. Every figure in `report.rebatch.json` that also exists in the batch's own `report.json` is equal to it, folder by folder: 32,371 leaf figures for steady-far / birthright, 26,952 for shaky-short / birthright, 41,780 for steady-far / maxed and 38,993 for shaky-short / maxed, with nothing differing and nothing missing. The only new leaves are the 1,248 the food ledger adds to each. The swallow counts also agree, run for run, with the reading the table above was read from: `tuning.foodLedger.corpse.swallowed` gives the same median and range as `tuning.freshnessPaid.swallows.corpse` on every folder.

Medians over 48 runs, with the range in brackets. Every kind is reported, zero included, which is why these medians sit below the table above where that one counted only the runs that swallowed one.

| steady-far / birthright | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| Corpses | 57 (19 to 210) | 34 (0 to 435) | 122 (20 to 400) |
| Power-ups | 1 (0 to 12) | 0 (0 to 6) | 0 |
| Feasts | 2 (0 to 4) | 0 (0 to 1) | 0 |
| Fallen rungs | 0 (0 to 12) | 0 (0 to 6) | 0 |

| shaky-short / birthright | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| Corpses | 93 (8 to 798) | 3 (0 to 344) | 30 (0 to 599) |
| Power-ups | 1 (0 to 18) | 0 (0 to 3) | 0 |
| Feasts | 0 (0 to 4) | 0 | 0 |
| Fallen rungs | 0 (0 to 21) | 0 (0 to 7) | 0 |

| steady-far / maxed | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| Corpses | 383 (150 to 508) | 435 (234 to 889) | 844 (627 to 1042) |
| Power-ups | 8 (3 to 14) | 11 (5 to 14) | 0 |
| Feasts | 4 (0 to 4) | 0 (0 to 3) | 0 |
| Fallen rungs | 0 | 0 | 0 |

| shaky-short / maxed | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| Corpses | 1445 (1191 to 1699) | 97 (48 to 204) | 601 (392 to 872) |
| Power-ups | 19 (15 to 22) | 3 (1 to 8) | 0 |
| Feasts | 4 | 0 | 0 |
| Fallen rungs | 0 | 0 | 0 |

Only a corpse decays, so rotted is zero for the other three kinds by construction and not by luck. The three ends do not add up to what spawned: food still on the field when a run stopped reached no end at all, and a body the corpse cap evicted reports its own event rather than either loss here.

## A note on the commands above

The four commands in this record name a relative output path and say they were run from `apps/hungry-grave/`. Those two facts do not agree, and the tapes say which one is wrong: `run.log` records each batch's own stdout, which is the folder it wrote, and all four are absolute paths under the worktree root. `pnpm vite-node` keeps the working directory it was called in, checked here by running a one-line script through it from `apps/hungry-grave/`, so a relative `local/148-before-batch/batches` from there would have landed under `apps/hungry-grave/local/`, where nothing is. So the out-root argument was written out in full. The "after" batch is run the same way, with the absolute path of `local/148-after-slice-1/batches`.
