# The "after" harness batch, slice 1 (design record, "Values are data")

Agent output, 2026-09-20, on the tree with slice 1's swallow rule in it and every test green. The same four commands as `before-batch.md`, the same seeds, the same two hands, the same two rigs, the same default tuning candidate. The bot only dodges and swallows by accident, so every figure measures the policy too: a size of shift, never a verdict. Figures only, and no verdict is offered anywhere below.

## The commands

The four commands of `before-batch.md` with the output folder changed to the absolute path of `local/148-after-slice-1/batches`, run from `apps/hungry-grave/`. The "before" record's own commands name a relative path they cannot have been run with, which that record's closing note now sets out.

All 192 runs verified, with no recorded fault, no readback fault, and no warning.

## The figures, in the "before" record's own form

| Hand / rig | Corpses swallowed (median, range) | Feasts | Power-ups | Peak grave size (median, range) | Contact hits (median, range) | Sealed / victory of 48 | Ticks (median) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| steady-far / birthright | 33 (13 to 76) | 2 (1 to 4) | 1 (1 to 6, n=25) | 67.5 (49.5 to 67.5) | 17 (11 to 27) | 45 / 3 | 20296 |
| shaky-short / birthright | 34 (5 to 454) | 2 (2 to 4, n=13) | 2 (1 to 15, n=22) | 27.2 (27.1 to 67.5) | 9 (1 to 43) | 44 / 4 | 6301 |
| steady-far / maxed | 244 (81 to 363) | 3 (1 to 4, n=44) | 5 (2 to 9) | 67.5 (29.5 to 67.5) | 1 (0 to 3) | 0 / 48 | 23181 |
| shaky-short / maxed | 1262 (352 to 1494) | 4 (2 to 4) | 17 (10 to 21) | 67.5 | 17 (2 to 24) | 0 / 48 | 22233 |

An `n` below 48 means the other runs swallowed none of that kind. The readings are the ones the "before" record names: growth is the peak size per run (`tuning.gravePath.sizePerTick`), swallows are `tuning.freshnessPaid.swallows.<kind>`, contact hits are `tuning.damageTaken.hits.contact`, and the outcome is `counts['run.ending']`.

## Food swallowed against food lost

The new reading, on both sides. The "before" column is each folder's `report.rebatch.json`, folded from its own stored tapes on this build, which is where that figure came from at all; the "after" column is each folder's own `report.json`, played on this build. Medians over 48 runs, with the range in brackets.

| steady-far / birthright | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| Corpses | 57 (19 to 210) to 33 (13 to 76) | 34 (0 to 435) to 24 (3 to 241) | 122 (20 to 400) to 96 (43 to 286) |
| Power-ups | 1 (0 to 12) to 1 (0 to 6) | 0 (0 to 6) to 0 (0 to 9) | 0 to 0 |
| Feasts | 2 (0 to 4) to 2 (1 to 4) | 0 (0 to 1) to 0 (0 to 2) | 0 to 0 |
| Fallen rungs | 0 (0 to 12) to 0 (0 to 7) | 0 (0 to 6) to 0 (0 to 4) | 0 to 0 |

| shaky-short / birthright | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| Corpses | 93 (8 to 798) to 34 (5 to 454) | 3 (0 to 344) to 3 (0 to 370) | 30 (0 to 599) to 31 (0 to 571) |
| Power-ups | 1 (0 to 18) to 0 (0 to 15) | 0 (0 to 3) to 0 (0 to 3) | 0 to 0 |
| Feasts | 0 (0 to 4) to 0 (0 to 4) | 0 to 0 (0 to 1) | 0 to 0 |
| Fallen rungs | 0 (0 to 21) to 0 (0 to 13) | 0 (0 to 7) to 0 (0 to 13) | 0 to 0 |

| steady-far / maxed | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| Corpses | 383 (150 to 508) to 244 (81 to 363) | 435 (234 to 889) to 533 (214 to 851) | 844 (627 to 1042) to 851 (655 to 1070) |
| Power-ups | 8 (3 to 14) to 5 (2 to 9) | 11 (5 to 14) to 12 (6 to 18) | 0 to 0 |
| Feasts | 4 (0 to 4) to 3 (0 to 4) | 0 (0 to 3) to 0 (0 to 3) | 0 to 0 |
| Fallen rungs | 0 to 0 | 0 to 0 | 0 to 0 |

| shaky-short / maxed | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| Corpses | 1445 (1191 to 1699) to 1262 (352 to 1494) | 97 (48 to 204) to 116 (70 to 699) | 601 (392 to 872) to 761 (595 to 956) |
| Power-ups | 19 (15 to 22) to 17 (10 to 21) | 3 (1 to 8) to 6 (2 to 10) | 0 to 0 |
| Feasts | 4 to 4 (2 to 4) | 0 to 0 (0 to 2) | 0 to 0 |
| Fallen rungs | 0 to 0 (0 to 8) | 0 to 0 (0 to 4) | 0 to 0 |

## The comparison the repo's own tool makes

Run as two corners per rig, the sharp hand against the sloppy hand, with the "before" side read off `report.rebatch.json` so both sides carry the food ledger:

```
pnpm vite-node --config vite.headless.config.ts scripts/compare-batches.ts \
  <before>/steady-far-<rig>/report.rebatch.json <after>/steady-far-<rig>/report.json \
  <before>/shaky-short-<rig>/report.rebatch.json <after>/shaky-short-<rig>/report.json
```

Both runs of it ordered every reading and withheld none: 370 and 362 readings for the birthright corners, 314 and 345 for the maxed ones, read together as 374 and 347. Both name the one row the two tunings differ in, `swallow.tipThreshold`, as null against 0.55: the "before" tapes were recorded before the row existed, so their headers carry no value for it.

What the tool orders is the quartile band against a separation row, so a reading whose runs sit on top of each other is flat however far its median moved. On the birthright rig every reading is flat on at least one corner, and the two corners agree on no direction at all: the bot's fresh runs vary from 1630 to 46344 ticks, so the bands swamp the shift. On the maxed rig, where runs are all about the same length, two readings move down on both corners and agree: `tuning.foodLedger.corpse.swallowed` and `tuning.freshnessPaid.swallows.corpse`, which are the same fact read twice. Everything else is flat, split between the corners, or incomparable.

## The raw output (gitignored, this worktree)

`local/148-after-slice-1/run.log` and four folders under `local/148-after-slice-1/batches/`, each with 48 tapes and a `report.json`. The two comparison documents are `local/148-slice-1/compare-birthright.json` and `local/148-slice-1/compare-maxed.json`.
