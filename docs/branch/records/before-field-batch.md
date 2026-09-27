# The "before" field batch (design record A4, A12)

Agent output, 2026-09-27, on the untouched tree at `328570e6233f03e2cfe8af91b3358d761e0042ce` (slice 4, steering on the glass). Slices 7 and 8 change the field's shape and the mobs' arrival, and this batch is the "before" the two after-slice batches are compared against. The bot only dodges, so every figure measures the policy too: a size of shift, never a verdict.

## The commands, from `apps/hungry-grave/` in a detached checkout of that commit

```
pnpm vite-node --config vite.headless.config.ts scripts/batch.ts steady-far   1000 48 <out> rig=birthright
pnpm vite-node --config vite.headless.config.ts scripts/batch.ts shaky-short  1000 48 <out> rig=birthright
pnpm vite-node --config vite.headless.config.ts scripts/batch.ts steady-far   1000 48 <out> rig=maxed
pnpm vite-node --config vite.headless.config.ts scripts/batch.ts shaky-short  1000 48 <out> rig=maxed
```

Seeds 1000 to 1047 (`BATCH_SEEDS`, `src/dev/batchReport.ts:36`), `<out>` the full path `local/tilt-before-field/batches` in this worktree. The two hands are the sharp and the sloppy hand of `apps/hungry-grave/docs/design/playing-harness.md`. The default tuning candidate. About 31 minutes of wall clock for all four.

All 192 runs verified, with no recorded fault, no readback fault, and no warning.

## Corpses swallowed, feasts, power-ups, peak grave size, hits, mob fire, ending

Swallows are `tuning.freshnessPaid.swallows.<kind>`. Peak grave size is the per-run peak of `tuning.gravePath.sizePerTick`, spread across the 48 runs. Contact hits are `tuning.damageTaken.hits.contact`. Fire hits are every other source of `tuning.damageTaken.hits.<source>` summed per run (`tuning.damageTaken.totalHits` minus `hits.contact`, matched by seed) and then spread, because the report only carries a spread per named source and not their sum. Mob fire shots are `tuning.mobFireShots.total`. The outcome is `counts['run.ending']` and the ticks are `run.ticks`.

| Hand / rig | Corpses | Feasts | Power-ups | Peak grave size | Contact hits | Fire hits | Mob fire shots | Sealed / victory of 48 | Ticks (median) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| steady-far / birthright | 98 (20 to 408) | 2 (2 to 4, n=46) | 3 (1 to 8, n=23) | 32.05 (27.46 to 40.80) | 9 (2 to 22) | 6 (1 to 26) | 958 (73 to 3065) | 33 / 15 | 19199 |
| shaky-short / birthright | 61 (16 to 654) | 2 (1 to 4, n=16) | 3 (1 to 16, n=18) | 27.18 (27.08 to 29.14) | 13 (4 to 62) | 3 (0 to 80) | 31 (5 to 2303) | 42 / 6 | 6168 |
| steady-far / maxed | 565 (469 to 719) | 4 (3 to 4) | 10 (6 to 14) | 62.59 (50.38 to 67.50) | 0 (0 to 2) | 7 (1 to 13) | 450 (354 to 739) | 0 / 48 | 23352 |
| shaky-short / maxed | 1573 (1092 to 1886) | 4 (4 to 4) | 19 (14 to 24) | 67.50 (41.01 to 67.50) | 21 (14 to 30) | 18 (7 to 33) | 287 (220 to 421) | 0 / 48 | 22014 |

An `n` in a cell means the other runs of that hand and rig swallowed, timed, or fired none of that kind, so the spread is over fewer than 48. No cell above is missing.

## Seconds on screen per mob type, median and largest

`tuning.timeOnScreen.byType.<type>.medianSeconds` and `.largestSeconds` are each a spread across the batch of that run's own median or largest. A run's own median or largest is null and drops out of the spread where a type finished no mob that run, which is why some cells carry an `n` below 48.

**steady-far / birthright**

| Mob type | Median seconds | Largest seconds |
| --- | --- | --- |
| shambler | 13.33 (13.33 to 13.33) | 14.10 (13.37 to 17.22) |
| revenant | 14.82 (13.35 to 14.82) | 14.82 (14.82 to 18.35) |
| ghoul | 6.46 (3.42 to 8.52, n=47) | 8.67 (5.83 to 10.47, n=47) |
| cairn | 16.33 (13.33 to 16.52) | 16.98 (13.33 to 18.30) |

**shaky-short / birthright**

| Mob type | Median seconds | Largest seconds |
| --- | --- | --- |
| shambler | 13.33 (13.33 to 13.33) | 13.37 (13.33 to 16.78) |
| revenant | 14.82 (9.75 to 15.05) | 14.82 (14.82 to 18.40) |
| ghoul | 6.67 (0.43 to 9.48, n=32) | 8.10 (0.43 to 10.83, n=32) |
| cairn | 13.33 (13.33 to 16.28, n=44) | 13.33 (13.33 to 18.78, n=44) |

**steady-far / maxed**

| Mob type | Median seconds | Largest seconds |
| --- | --- | --- |
| shambler | 6.33 (4.42 to 8.08) | 15.30 (13.82 to 16.97) |
| revenant | 5.88 (2.83 to 11.14) | 14.98 (14.82 to 17.73) |
| ghoul | 2.87 (2.01 to 4.01) | 8.85 (6.18 to 10.53) |
| cairn | 13.90 (13.33 to 17.58) | 17.55 (15.67 to 23.18) |

**shaky-short / maxed**

| Mob type | Median seconds | Largest seconds |
| --- | --- | --- |
| shambler | 1.60 (1.35 to 2.47) | 14.02 (13.48 to 17.75) |
| revenant | 3.13 (1.75 to 6.12) | 15.08 (10.75 to 19.47) |
| ghoul | 1.92 (1.35 to 2.92) | 9.82 (6.95 to 11.13) |
| cairn | 13.97 (13.33 to 18.22) | 17.47 (14.13 to 22.88) |

## Freshness paid at the swallow, per food kind

The reading (`src/dev/readings/freshness.ts`) keeps a run's own mean, min and max paid per kind, never a median: the table below is the median and range, across the 48 runs, of each run's own mean paid (`tuning.freshnessPaid.meanPaid.<kind>`). A kind absent from a cell is a kind no run of that hand and rig swallowed at all.

| Hand / rig | Corpse | Feast | Power-up | Fallen rung |
| --- | --- | --- | --- | --- |
| steady-far / birthright | 0.61 (0.54 to 0.69) | 1 (1 to 1, n=46) | 1 (1 to 1, n=23) | 1 (1 to 1, n=17) |
| shaky-short / birthright | 0.79 (0.62 to 0.87) | 1 (1 to 1, n=16) | 1 (1 to 1, n=18) | 1 (1 to 1, n=16) |
| steady-far / maxed | 0.49 (0.43 to 0.62) | 1 (1 to 1) | 1 (1 to 1) | absent (n=0) |
| shaky-short / maxed | 0.70 (0.63 to 0.74) | 1 (1 to 1) | 1 (1 to 1) | absent (n=0) |

## Food swallowed against food lost, per kind

`tuning.foodLedger.<kind>.<swallowed/lost/rotted>` (`src/dev/readings/foodLedger.ts`). Lost is off the bottom edge with value left; rotted is a corpse's own decay, always zero for the other three kinds by construction. The three ends do not add up to what spawned: food still on the field when a run stopped reached no end at all.

**steady-far / birthright**

| Kind | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| corpse | 98 (20 to 408) | 15 (0 to 310) | 96 (16 to 355) |
| powerUp | 0 (0 to 8) | 0 (0 to 12) | 0 (0 to 0) |
| feast | 2 (0 to 4) | 0 (0 to 0) | 0 (0 to 0) |
| fallenRung | 0 (0 to 12) | 0 (0 to 3) | 0 (0 to 0) |

**shaky-short / birthright**

| Kind | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| corpse | 61 (16 to 654) | 0 (0 to 91) | 8 (0 to 415) |
| powerUp | 0 (0 to 16) | 0 (0 to 3) | 0 (0 to 0) |
| feast | 0 (0 to 4) | 0 (0 to 0) | 0 (0 to 0) |
| fallenRung | 0 (0 to 38) | 0 (0 to 6) | 0 (0 to 0) |

**steady-far / maxed**

| Kind | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| corpse | 565 (469 to 719) | 210 (79 to 455) | 905 (764 to 1025) |
| powerUp | 10 (6 to 14) | 9 (4 to 13) | 0 (0 to 0) |
| feast | 4 (3 to 4) | 0 (0 to 1) | 0 (0 to 0) |
| fallenRung | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |

**shaky-short / maxed**

| Kind | Swallowed | Lost off the bottom | Rotted away |
| --- | --- | --- | --- |
| corpse | 1573 (1092 to 1886) | 62 (27 to 146) | 552 (342 to 916) |
| powerUp | 19 (14 to 24) | 4 (1 to 9) | 0 (0 to 0) |
| feast | 4 (4 to 4) | 0 (0 to 0) | 0 (0 to 0) |
| fallenRung | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |

## Arrivals per section

`tuning.arrivals.bySection.<section>` (`src/dev/readings/arrivals.ts`). A section a run never entered carries no count at all, which is why some cells carry an `n` below 48 rather than a zero.

| Hand / rig | Procession | Crowd | Vigil | Waking | Undertaker | Total |
| --- | --- | --- | --- | --- | --- | --- |
| steady-far / birthright | 452 (442 to 458) | 1340 (207 to 1728, n=46) | 113 (55 to 113, n=18) | 113 (1 to 113, n=20) | 96 (18 to 209, n=15) | 1611 (442 to 2583) |
| shaky-short / birthright | 393 (114 to 460) | 1651 (180 to 1663, n=14) | 113 (21 to 113, n=11) | 113 (113 to 113, n=11) | 14 (7 to 142, n=6) | 393 (114 to 2487) |
| steady-far / maxed | 464 (452 to 480) | 1724 (1707 to 1748) | 113 (113 to 113) | 113 (113 to 113) | 18 (6 to 30) | 2431 (2408 to 2464) |
| shaky-short / maxed | 485 (471 to 509) | 1673 (1646 to 1709) | 113 (113 to 113) | 113 (113 to 113) | 8 (5 to 17) | 2396 (2354 to 2440) |

## The raw output (gitignored, this worktree)

`local/tilt-slice-5/run.log` and four folders under `local/tilt-before-field/batches/`, each with 48 tapes and a `report.json`: `steady-far-birthright-default-1790517018256`, `shaky-short-birthright-default-1790517685727`, `steady-far-maxed-default-1790517977038`, `shaky-short-maxed-default-1790518933646`.

