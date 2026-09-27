1. **What changed**, by file and by name.

- `docs/branch/records/before-field-batch.md`: new, the "before" field batch record, in the form of #148's `before-batch.md`.
- `local/tilt-slice-5/run.log`: new, the console output of the four batch commands.
- `local/tilt-before-field/batches/`: new, the four batch folders (`steady-far-birthright-default-1790517018256`, `shaky-short-birthright-default-1790517685727`, `steady-far-maxed-default-1790517977038`, `shaky-short-maxed-default-1790518933646`), each with 48 tapes and a `report.json`.

No source file, test, or any other doc changed. No code was written.

2. **Verification results**: each step of the floor and of your entry, with its result. Each step whose actor is the human is named as still open.

This is a non-coding dispatch; the verification floor (typecheck, test, build, `pnpm verify`, rendered checks) does not apply, and none of it was run.

Entry's own steps:

- Step 1: detached checkout at `328570e6233f03e2cfe8af91b3358d761e0042ce` created with `git worktree add --detach`, from the main repo folder, and `pnpm install --frozen-lockfile --prefer-offline` ran clean from its root (one pre-existing pnpm "ignored build scripts" notice, not a project warning, unrelated to this work).
- Step 2: all four commands ran in the background from `apps/hungry-grave/` of that checkout, with the full path `local/tilt-before-field/batches` in the `tilted-view-build` worktree as the out-root; console output kept in `local/tilt-slice-5/run.log`.
- Step 3: all 192 runs (48 seeds times four hand/rig pairs) verified, 0 not verified, 0 with no ending. No recorded fault, no readback fault, and no warning anywhere in the log. Nothing to report as an anomaly.
- Step 4: `docs/branch/records/before-field-batch.md` written with the commit, the commands, and one table per hand and rig (plus per-mob-type and per-kind detail tables) for every figure the entry lists: swallows (corpse, feast, power-up), peak grave size, contact hits, fire hits, mob fire shots, seconds on screen per mob type (median and largest), freshness paid per kind, food swallowed against lost per kind, arrivals per section, and sealed/victory of 48 with median ticks.
- Step 5: the detached checkout removed with `git worktree remove` after the record was written; confirmed gone from `git worktree list`.

3. **Where the entry was wrong about the code**, or "nowhere".

Nowhere.

4. **Decisions made**, each with its evidence and how to reverse it.

- "Hits from fire" is not a reading the report carries directly: `tuning.damageTaken.hits.<source>` is a spread per named source (contact, each mob type, each boss), with no combined non-contact spread. I derived it per run as `tuning.damageTaken.totalHits` minus `tuning.damageTaken.hits.contact`, matched by seed through each spread's own `samples` array, then took the median and range of that derived series myself (same nearest-rank convention as `src/dev/seriesSummary.ts`). Reversible by reading the per-source spreads in the record's own reference table instead (all six sources are listed there under "other damage sources" in my working notes, though I trimmed that row from the final table to keep it to what the entry asked; the raw `report.json` files still carry every source).
- "Freshness paid at the swallow, median, per food kind": the reading (`src/dev/readings/freshness.ts`) only ever computes a run's own mean, min, and max paid, never a median. I read `meanPaid` per kind as the closest available figure and reported the median and range of that mean across the 48 runs, with a note in the record saying so. If a raw-swallow median is wanted instead, the reading itself needs a median alongside its mean/min/max, which is a code change outside this slice.
- Two cells (`fallenRung` freshness paid, both maxed-rig rows) are reported as "absent (n=0)" rather than a number: no run of either maxed batch swallowed a fallen rung at all (confirmed against `tuning.foodLedger.fallenRung.swallowed`, which reads 0 for every run in both maxed batches), so the reading itself has nothing to average.

5. **Open items**.

None from this slice. The design comparison itself (this batch against slices 7 and 8's own batches) is for later work, not this slice.

6. **Stuck:** none.
