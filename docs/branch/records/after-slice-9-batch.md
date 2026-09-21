# The "after" harness batch, slice 9 (design record, "Values are data")

Agent output, 2026-09-21, on the tree with slice 9's swell and its two growth rows in it and every test green. The same four commands as `before-batch.md`, the same seeds, the same two hands, the same two rigs, the same default tuning candidate. The bot only dodges and swallows by accident, so every figure measures the policy too: a size of shift, never a verdict. Figures only, and no verdict is offered anywhere below.

## The commands

The four commands of `before-batch.md` with the output folder changed to the absolute path of `local/148-slice-9/batches`, run from `apps/hungry-grave/`.

All 192 runs verified, with no unverified run, no unfinished run, no recorded fault, no readback fault and no warning. The comparison is `scripts/compare-batches.ts` over the two birthright corners and then the two maxed corners against `local/148-after-slice-2/batches`; it ordered 372 readings across the two corners and refused nothing, so no reading's meaning moved and `READINGS_VERSION` holds at 9. The only tuning rows it reports as differing are the two this slice adds, `growth.feastInCorpses` at 45 and `growth.swellPerSecond` at 4.5, both absent from slice 2's records.

## The figures, in the "before" record's own form

Slice 2's figure first, then slice 9's.

| Hand / rig | Corpses swallowed (median, range) | Feasts | Power-ups | Peak grave size (median, range) | Contact hits (median, range) | Sealed / victory of 48 | Ticks (median) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| steady-far / birthright | 85 (27 to 244) to 72 (27 to 319) | 2 (2 to 4, n=47) to 2 (2 to 4, n=47) | 3 (1 to 7, n=21) to 2 (1 to 6, n=17) | 67.5 (29.0 to 67.5) to 29.7 (27.3 to 40.4) | 19 (0 to 33) to 9 (0 to 19) | 33 / 15 to 38 / 10 | 21119 to 17545 |
| shaky-short / birthright | 53 (9 to 705) to 53 (9 to 613) | 4 (2 to 4, n=12) to 2 (2 to 4, n=13) | 3 (1 to 12, n=14) to 2 (1 to 13, n=16) | 27.3 (27.1 to 67.5) to 27.2 (27.1 to 28.4) | 11 (4 to 66) to 11 (4 to 68) | 41 / 7 to 43 / 5 | 5983 to 6005 |
| steady-far / maxed | 739 (642 to 857) to 611 (489 to 703) | 4 (3 to 4) to 4 (3 to 4) | 12 (8 to 16) to 11 (7 to 15) | 67.5 to 67.5 (50.6 to 67.5) | 1 (0 to 4) to 0 (0 to 2) | 0 / 48 to 0 / 48 | 23275 to 23548 |
| shaky-short / maxed | 1675 (1483 to 1910) to 1660 (1327 to 1906) | 4 to 4 (3 to 4) | 20 (17 to 25) to 21 (16 to 24) | 67.5 to 67.5 (52.9 to 67.5) | 23 (13 to 35) to 20 (12 to 28) | 0 / 48 to 0 / 48 | 21952 to 22044 |

An `n` below 48 means the other runs swallowed none of that kind. The readings are the ones the "before" record names: growth is the peak size per run (`tuning.gravePath.sizePerTick`), swallows are `tuning.freshnessPaid.swallows.<kind>`, contact hits are `tuning.damageTaken.hits.contact`, and the outcome is `counts['run.ending']`.

## What the score paid by overflow did

Overflow is growth the ceiling could not take, so it is the figure that reads the ceiling from the other side. Slice 2's figure first, then slice 9's, as points paid and as payments made (`tuning.scoreByInput.overflowPaid` and `.overflowPayments`).

| Hand / rig | Points paid by overflow | Payments |
| --- | --- | --- |
| steady-far / birthright | 3 (0 to 23) to 0 | 1 (0 to 7) to 0 |
| shaky-short / birthright | 0 (0 to 12) to 0 | 0 (0 to 5) to 0 |
| steady-far / maxed | 102 (60 to 124) to 1 (0 to 21) | 545 (283 to 702) to 2 (0 to 159) |
| shaky-short / maxed | 88 (56 to 117) to 11 (0 to 39) | 350 (7 to 738) to 165 (0 to 622) |

A run's whole score barely moves with it, because overflow was never a large share of it: the medians go 22,603 to 19,900, 5,000 to 5,000, 261,978 to 258,400 and 307,882 to 316,000.

## The peak that fell off the ceiling on the maxed corners

Both maxed corners hold their median at the ceiling and both now have runs that never reach it: the steady-far corner's minimum peak is 50.6 against 67.5 before, and the shaky-short corner's is 52.9. That is a finding and it is written out here rather than left in the table.

The arithmetic says which half of the change it comes from, and the mow is counted at the freshness it was actually paid at (`tuning.freshnessPaid.meanPaid.corpse`, 0.56 before and 0.543 now) rather than as fully fresh corpses. On the steady-far maxed corner a run now swallows 611 corpses where it swallowed 739, which is 33.6 units of growth against 41.9, and it takes 4 feasts worth 18.2 units where 4 feasts were worth 121.5. So the total paid over a run falls from about 164 units to about 52, against a climb of 40.5 from the starting size to the ceiling. Both figures are still over the climb, so a run that mows uninterrupted still reaches the ceiling, and the median says most of them do. What has gone is the margin: it was four climbs of headroom and it is now one and a quarter, and the grave takes its growth in at 4.5 units a second on top of that, so a run that is hit repeatedly spends longer climbing back and a run whose mowing is thin can finish under the ceiling.

The corpse count itself falls on that corner for the same reason read one step earlier: the grave is smaller for more of the run, so its mouth is narrower and fewer of the corpses it passes over reach the tip threshold. The shaky-short maxed corner barely moves on corpses (1675 to 1660), which is the corner whose hand crosses the most bodies.
