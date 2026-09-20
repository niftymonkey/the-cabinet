# The "after" harness batch, slice 2 (design record, "Values are data")

Agent output, 2026-09-20, on the tree with slice 2's pull in it and every test green. The same four commands as `before-batch.md`, the same seeds, the same two hands, the same two rigs, the same default tuning candidate. The bot only dodges and swallows by accident, so every figure measures the policy too: a size of shift, never a verdict. Figures only, and no verdict is offered anywhere below.

## The commands

The four commands of `before-batch.md` with the output folder changed to the absolute path of `local/148-after-slice-2/batches`, run from `apps/hungry-grave/`.

All 192 runs verified, with no recorded fault, no readback fault, and no warning.

## The figures, in the "before" record's own form

| Hand / rig | Corpses swallowed (median, range) | Feasts | Power-ups | Peak grave size (median, range) | Contact hits (median, range) | Sealed / victory of 48 | Ticks (median) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| steady-far / birthright | 85 (27 to 244) | 2 (2 to 4, n=47) | 3 (1 to 7, n=21) | 67.5 (29.0 to 67.5) | 19 (0 to 33) | 33 / 15 | 21119 |
| shaky-short / birthright | 53 (9 to 705) | 4 (2 to 4, n=12) | 3 (1 to 12, n=14) | 27.3 (27.1 to 67.5) | 11 (4 to 66) | 41 / 7 | 5983 |
| steady-far / maxed | 739 (642 to 857) | 4 (3 to 4) | 12 (8 to 16) | 67.5 | 1 (0 to 4) | 0 / 48 | 23275 |
| shaky-short / maxed | 1675 (1483 to 1910) | 4 | 20 (17 to 25) | 67.5 | 23 (13 to 35) | 0 / 48 | 21952 |

An `n` below 48 means the other runs swallowed none of that kind. The readings are the ones the "before" record names: growth is the peak size per run (`tuning.gravePath.sizePerTick`), swallows are `tuning.freshnessPaid.swallows.<kind>`, contact hits are `tuning.damageTaken.hits.contact`, and the outcome is `counts['run.ending']`.

## Food swallowed against food lost

Three columns per cell, in branch order: the first-touch rule, then slice 1's threshold, then slice 2's threshold with the pull. The first column is each "before" folder's `report.rebatch.json`, which is the only "before" report carrying the food ledger; the second and third are each folder's own `report.json`. Medians over 48 runs, with the range in brackets.

| steady-far / birthright | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| Corpses | 57 (19 to 210) to 33 (13 to 76) to 85 (27 to 244) | 34 (0 to 435) to 24 (3 to 241) to 10 (0 to 157) | 122 (20 to 400) to 96 (43 to 286) to 95 (10 to 236) |
| Power-ups | 1 (0 to 12) to 1 (0 to 6) to 0 (0 to 7) | 0 (0 to 6) to 0 (0 to 9) to 0 (0 to 12) | 0 to 0 to 0 |
| Feasts | 2 (0 to 4) to 2 (1 to 4) to 2 (0 to 4) | 0 (0 to 1) to 0 (0 to 2) to 0 (0 to 1) | 0 to 0 to 0 |
| Fallen rungs | 0 (0 to 12) to 0 (0 to 7) to 0 (0 to 8) | 0 (0 to 6) to 0 (0 to 4) to 0 (0 to 3) | 0 to 0 to 0 |

| shaky-short / birthright | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| Corpses | 93 (8 to 798) to 34 (5 to 454) to 53 (9 to 705) | 3 (0 to 344) to 3 (0 to 370) to 0 (0 to 83) | 30 (0 to 599) to 31 (0 to 571) to 4 (0 to 345) |
| Power-ups | 1 (0 to 18) to 0 (0 to 15) to 0 (0 to 12) | 0 (0 to 3) to 0 (0 to 3) to 0 (0 to 6) | 0 to 0 to 0 |
| Feasts | 0 (0 to 4) to 0 (0 to 4) to 0 (0 to 4) | 0 to 0 (0 to 1) to 0 | 0 to 0 to 0 |
| Fallen rungs | 0 (0 to 21) to 0 (0 to 13) to 0 (0 to 30) | 0 (0 to 7) to 0 (0 to 13) to 0 (0 to 8) | 0 to 0 to 0 |

| steady-far / maxed | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| Corpses | 383 (150 to 508) to 244 (81 to 363) to 739 (642 to 857) | 435 (234 to 889) to 533 (214 to 851) to 176 (74 to 319) | 844 (627 to 1042) to 851 (655 to 1070) to 836 (744 to 976) |
| Power-ups | 8 (3 to 14) to 5 (2 to 9) to 12 (8 to 16) | 11 (5 to 14) to 12 (6 to 18) to 7 (1 to 13) | 0 to 0 to 0 |
| Feasts | 4 (0 to 4) to 3 (0 to 4) to 4 (3 to 4) | 0 (0 to 3) to 0 (0 to 3) to 0 (0 to 1) | 0 to 0 to 0 |
| Fallen rungs | 0 to 0 to 0 | 0 to 0 to 0 | 0 to 0 to 0 |

| shaky-short / maxed | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| Corpses | 1445 (1191 to 1699) to 1262 (352 to 1494) to 1675 (1483 to 1910) | 97 (48 to 204) to 116 (70 to 699) to 63 (31 to 123) | 601 (392 to 872) to 761 (595 to 956) to 462 (329 to 539) |
| Power-ups | 19 (15 to 22) to 17 (10 to 21) to 20 (17 to 25) | 3 (1 to 8) to 6 (2 to 10) to 3 (0 to 7) | 0 to 0 to 0 |
| Feasts | 4 to 4 (2 to 4) to 4 | 0 to 0 (0 to 2) to 0 | 0 to 0 to 0 |
| Fallen rungs | 0 to 0 (0 to 8) to 0 | 0 to 0 (0 to 4) to 0 | 0 to 0 to 0 |

## The comparison the repo's own tool makes

Run as two corners per rig, the sharp hand against the sloppy hand, slice 1's batch against slice 2's. Both sides carry the food ledger, so both are read off `report.json` this time:

```sh
pnpm vite-node --config vite.headless.config.ts scripts/compare-batches.ts \
  <after-slice-1>/steady-far-<rig>/report.json <after-slice-2>/steady-far-<rig>/report.json \
  <after-slice-1>/shaky-short-<rig>/report.json <after-slice-2>/shaky-short-<rig>/report.json
```

Both runs of it ordered every reading and withheld none: 370 and 364 readings for the birthright corners, read together as 374, and 315 and 344 for the maxed ones, read together as 348. Both name the three rows the two tunings differ in, `swallow.pullReach`, `swallow.pullStrength` and `swallow.pullResponse`, as null against 24, 125 and 4.6: slice 1's tapes were recorded before the rows existed, so their headers carry no value for any of them.

What the tool orders is the quartile band against a separation row, so a reading whose runs sit on top of each other is flat however far its median moved. On the birthright rig, where the bot's fresh runs vary from about 1,600 to 48,000 ticks, the bands swamp the shift as they did after slice 1: 351 of 370 readings are flat on the sharp corner and 341 of 364 on the sloppy one, and the two corners agree on exactly one direction, `tuning.wakingSwallows.span` up.

On the maxed rig, where runs are all about the same length, 22 readings move in the same direction on both corners. Six of them are the food ledger and the freshness reading of the same fact: corpses swallowed up, corpses lost off the bottom down, power-ups swallowed up on all three of their readings, and the mean freshness a swallowed corpse paid at up. The rest fall into three groups. The field is thinner, with `mobsAlivePerTick` down at every quartile. The storm's mix moves, with the skull stream's damage, hits and fatal blows all down and the wisps' all up, which is the line a swallow fires. And score overflows more often, with `tuning.scoreByInput.overflowPaid` and `overflowPayments` both up, which is a grave standing at the ceiling.

## The design record's question for #39

The question the record asks of this batch: the pull at the rim is 125 field units a second against a scroll of 38, so can food below the grave be held against its deadline? The figures that speak to it are the corpses lost off the bottom edge, the end a corpse reaches when the scroll wins.

On the maxed rig the median run loses 176 corpses off the bottom where slice 1's lost 533 and the first-touch build lost 435, and the sloppy hand loses 63 where slice 1 lost 116 and first touch lost 97. On the birthright rig the sharp hand loses 10 where slice 1 lost 24 and first touch lost 34, and the sloppy hand's median is 0 against 3 under both earlier builds. Corpses swallowed move the other way on every one of the four: 85 against 33, 53 against 34, 739 against 244, 1,675 against 1,262, and on three of the four that is above what the first-touch rule itself took. Rotted away, the other deadline, is flat on the sharp birthright corner and down on the other three, by a third on the sloppy maxed corner.

Those are the numbers, and they are a dodging bot's. It never routes toward food, so what they measure is what a pull of this reach does to food the hand happened to pass near, and what a player who dives for food would see is not in this batch.

## The raw output (gitignored, this worktree)

`local/148-after-slice-2/run.log` and four folders under `local/148-after-slice-2/batches/`, each with 48 tapes and a `report.json`. The two comparison documents are `local/148-slice-2/compare-birthright.json` and `local/148-slice-2/compare-maxed.json`.
