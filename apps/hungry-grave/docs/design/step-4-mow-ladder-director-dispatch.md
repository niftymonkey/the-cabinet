# Dispatch plan: path step 4, the mow, the ladder and the director (tickets #39 and #85)

Planning half only, written per `docs/agents/feature-playbook.md`. No production code was written and no repo file outside `docs/design/` was edited for this plan.

The design record it runs on is `mow-ladder-director.md`. Every magnitude appears only as a data row marked initial, and every one of them is stated as one thing against another rather than as a target (ADR 0053). The record's section 11 lists the commitments this step takes; the push runs in one-push mode, so they are taken under their defaults, filed in their own steps, and shown to Mark in the session recap, and **no step in this plan waits on a person**. The grave swallows and passes under; it never drives.

**This plan carries the three review gates' findings.** Every place a finding changed it says so and names the gate. The largest of them: the bank expiry is withdrawn from round one, so the slice that built it is gone and the slice letters below are A through G with the bank's place taken by the caps.

Gates never overrule Mark. A gate finding against any ruling in the record's section 2 is written into the note as "gate disagrees with ruling X", filed as a ticket, and the ruling is built on.

## 0. What this plan may claim, and what it cannot

Every claim about existing code below cites a file and a line. They were read in this worktree on 2026-09-09, at branch tip `9dfd0ca079`, with a clean working tree and `pnpm verify` green at `68c3960d5c`.

**Every line number here goes stale the moment step 5 lands.** A later slice locates its site by content, and a site it cannot find is a finding rather than something to skip (`docs/agents/lessons.md`, "a plan's line numbers go stale the moment its first phase lands").

**The record's section 13 lists ten claims in the brief that did not survive the read against the tree**, and three of them change this plan's shape rather than only its prose: there is no duration column on any phase, which under ADR 0060's re-ruling costs nothing, because a standing row carries its own phase-local time and holds until the next one; the bank never waits longer than one offer lifetime, which is why the record withdraws its expiry and this plan has no slice for it; and `GOLDEN` re-pins in five slices rather than one.

**One thing this plan found that the record does not carry.** `src/game/__tests__/touchCounts.test.ts` pins the #76 pass A touch counts against the real exported constants and the real health rows, and its own JSDoc says "a pinned count changes only by an explicit ruling, in the same motion as the ruling (#79)". Step 5 is that motion. The test is not weakened and not deleted: it is re-expressed against the mow ruling's counts, in the same commit that moves the health row, and if the ruling has not landed as an ADR by then the slice stops and reports rather than editing the test. **The stop condition is discharged: ADR 0059 landed at `9cba278131`, ahead of slice A**, so the ruling exists and the re-expression is ordinary work rather than a stop. What the counts are re-expressed to is an initial data row and not an invariant (Mark's ruling of 2026-09-09, the record's section 5 item 2), so the test pins where the curve starts and the batch is free to move it.

---

## 1. Definition, in observable terms

**A trash minute is a mow (ADR 0050, ADR 0059, the record's sections 1 and 5).** Bodies arrive faster than one at a time and die in one skull each at the run's first minute. The shambler's health moves from five skulls to one and its `fire` row becomes `NEVER_FIRES`, which is the row the ghoul already carries (`mobs.ts:76`, `:82-83`, `:120`, `mobFire.ts:70-77`). The ghoul stays at three skulls because it is the body threat, and the revenant stays at eight because it is the few-and-tough row. Fire on the field during a trash minute is bounded by the revenant share of the roster and never by the shambler share. **The hit counts are initial data rows and not invariants (Mark's ruling of 2026-09-09):** weapon damage steps with the rungs, so what a body costs in skulls is a curve the ladder walks down, and one skull is where it starts.

**Growth over the run is authored, stepped, and one construct in one list (ADR 0047, ADR 0060 as re-ruled, the record's section 5 item 3).** A `StageRow` gains repeat fields, an interval it fires again on, a step that shrinks that interval and the minimum it shrinks to, which is Brotato's `repeating` family on the resource that already carries the one-shot groups. A row with those fields unset fires once, exactly as today. A section's growth is a run of rows with them set, each holding a fixed rate from its own phase-local time until the next row of any kind, and a trough is a standing row somebody authored at a lower figure. A section whose phase ends on `rowsSpentAndFieldClear` closes its list with a standing row at zero, at its sparse last row's time, so the field can read clear and its boss can arrive (ADR 0051). Observably: the Procession steps 0, 2, 3.5, 5 bodies a second and the Crowd steps 8, 3, 12, and nothing anywhere reads a section's length. The shaped rows stay on top as beats. The Vigil authors no standing row, because it owns scarcity and the quantity that property is measured in is food swallowed per second rather than corpses per second (`mobs.ts:94`, `stage-floor.md` section 10 item 1).

**A trash type's stats never step on the clock, and that absence is the ruling (ADR 0059, ADR 0060 as re-ruled, struck by both design gates in the second round).** The first re-ruling adopted a per-minute step on health and fall speed at 0.05 and 0.005 of base; those figures are Mad Forest's Inverse mode, normal Mad Forest carries no `TimeMods` at all, and ADR 0059 rules growth as more enemies and harder ones rather than the same enemies wearing more health. Observably: a body created in the run's fifth minute carries exactly the same `MOB_TYPES` row as the same type in its first, and growth is arrivals and the roster alone. What would reopen it is the record's section 12 item 6.

**The teaching rows come first and the first standing row starts behind them (the game design gate and the tech architecture gate).** The Procession's rate is zero until its two teaching rows have fired, the first-swallow Drip at `rows.ts:133-140` and the lone revenant Drip that slice A puts where the Drip of three at `rows.ts:141-148` is, and its first standing row starts at 2 after them. Observably: a player's first swallow and the game's first mob fire each arrive alone, and only then does the field fill.

**The food economy is stated in corpses of expected mowing (the record's section 5 item 4).** `CORPSES_TO_CEILING` and the reservoir move together so that a belch is a cadence rather than a reflex, and `RESERVOIR_CAPACITY` stays written as `FEAST_PAYOUT` so the feast still fills the reservoir in one swallow (`tuning.ts:102`, `:104-109`, decision 5.11). Each on-swallow line gains a cadence floor: a minimum interval between wisp volleys, and one running skull surge whose duration extends to a cap rather than a chain of surges overwriting each other.

**Weapon damage per rung is set from a shipped weapon level table (Mark's ruling of 2026-09-09, the record's section 5 item 4).** The precedent is `docs/research/survivor-numbers.md`, which holds Vampire Survivors' worked per-weapon level tables and the axis tally over all 127 weapons: damage roughly triples to quadruples over a weapon's whole climb, damage is the filler axis rather than the headline one, and the first upgrade is the one the player must feel. Observably: a line's damage at its last rung is a multiple of its first that the shipped tables support, and the first rung is not one fifth of the climb. **If that record turns out not to carry enough of a table to sit against, the slice stops and reports "research owed before slice C" rather than inventing the curve**, and the orchestrator dispatches the research.

**The bank does not change (the product vision gate and the game design gate, the record's section 5 item 5).** The brief's expiry is withdrawn from round one: one bank happened in 48 sharp-hand runs and none under the sloppy hand, and `loseOffer` and `resolveOffer` each open the bank on the same tick they clear the live offer while `openBankedOffer` runs every tick (`offer.ts:295-299`, `:309-327`, `:337-346`), so a bank never waits longer than one offer lifetime. `state.bankedOffers` stays a count, no slice touches `offer.ts`, and ADR 0034 is not amended. What round one does about the ladder is read it: untaken offers by site, banks per run, and final rungs per line, against the 8-untaken-in-48 baseline the step 3 batch left.

**Caps are derived from data and a bound cap raises a fault (ADR 0056).** `MOB_CAP` becomes the worst standing-row peak plus the beats that overlap it plus the largest single card; `MOB_FIRE_CAP` is derived from the revenant peak plus the boss patterns that fire into the same pool; `CORPSE_CAP` keeps the shape it already has and gains, as the addend its own comment says is deliberately missing, the most the director can add inside the freshness window (`caps.ts:60-61`, `:43-59`). Nothing is ever evicted, which is the code's own rule already (`caps.ts:6-18`).

**The director spends a finite purse per phase over the authored floor (ADR 0047, ADR 0056).** Cards the purse buys, spent only while the pressure signal reads low, then quiet for a drawn interval. **An add is a card and never a body (the game design gate):** a card is a template group, the same triple an authored row is, and its cost is the sum over its bodies at shambler 1, ghoul 3 and revenant 4. The signal reads harm and floor events and never a kill near the grave. The four off-limits moments read off the phase's own data: `Phase.directed` is false on the Banshee, the Waking and the Undertaker (`stage.ts:110`, `:138`, `:160`), and the Wall is the one authored row with `directed: false` (`rows.ts:261-268`). **A standing row's arrivals never count against the Procession's live-template ceiling, and under the one-construct shape that needs saying mechanically rather than by kind.** A standing row is a row and it places a template group like any other, so "the floor and not a shaped group" is no longer a distinction the code can make. What the ceiling counts is what stands above the floor: live groups whose source row carries no `repeat`, plus the director's cards. A standing row's repeats are the floor itself, and a ceiling that counted them would forbid the section its own growth. That is exactly what the Procession's glossary entry already says, "never more than one shaped group live **above its standing row**". Lowering means withholding what would otherwise have been added; the rows stay the floor.

**Its dice come from its own named stream and the witness moves once (ADR 0047, ADR 0019).** `StreamName` has five members (`rng.ts:4`) and `STREAM_ORDER` folds exactly those (`witness.ts:23-31`), so a sixth moves `WITNESS_VERSION` from 6 to 7 (`witness.ts:41`). **The fold widens in its own slice ahead of the director (the tech architecture gate):** the stream names, the director's folded fields and the version move together in one commit whose only job is the fold, and the director slice fills what that commit declared. The project's lesson binds it that way: stamp the version in the commit that changes the fold and declare every new folded field in that same commit (`apps/hungry-grave/docs/lessons.md`, The sim).

**The instrument exists before anything is tuned (#85, the record's section 5 item 6).** A replay graph off a tape showing the pressure signal, the mobs alive and every add with its reason, plus a signal lock. #85's acceptance line asks for exactly this: "A run's pressure signal can be read back off its tape and drawn against what was added and when."

**The signal lock is a value the run resolves, so it is in the tape header and `FORMAT_VERSION` moves 3 to 4 (decided by the session on the tech architecture gate's finding).** A run resolves the lock from its URL the way it resolves `?size=` and `?levels=`, holds the signal at it, and the header records what it resolved to, never an absence. **Corrected 2026-09-09: this is not ADR 0056's trigger firing.** That trigger names the budget and only the budget, and the purse stays pinned to the build, so it is unfired and ADR 0056 is untouched here. The lock stands on ADR 0043, which is where header-or-build is decided and which puts a value the run resolves in the header, and on ADR 0027, which rules the form it takes there. Observably: a locked run's graph is a flat signal line with the director's spends on it, and a format 3 tape is refused by its version rather than at a checkpoint.

**A run that stops at the tick ceiling is counted and named (#118).** Across four 48-seed batches one run in each of three configurations stopped with neither seal nor victory, and a run that stops that way is dropped from every rate the batch reports. The batch says how many.

**Nothing the batch prints is a target.** `src/__tests__/harnessStatesNoTarget.test.ts` is the deliberate-absence guard over every module that turns readings into a figure somebody reads, and every new reading joins its list.

---

## 2. Already built, partly built, absent

| Ruling | Source | What exists today (file:line) | What is missing |
| --- | --- | --- | --- |
| A mob type owns its own health and fire | ADR 0016 | Built: `MOB_TYPES` at `mobs.ts:68`, `MobRow` at `:41-51` | Nothing; the rows move |
| A mob type that never fires | ADR 0016 | Built: `NEVER_FIRES` (`mobFire.ts:70-77`), carried by the ghoul (`mobs.ts:120`) | Nothing; the shambler takes the row |
| The ruled touch counts are pinned | #76, #79 | Built: `touchCounts.test.ts`, computed from the real constants against the real health rows | The re-expression, in the same motion as the ruling |
| A row is a phase-local time, a template, a count and a type | ADR 0047, ADR 0060 | Built: `StageRow` at `rows.ts:6-29`, with `carries` at `:20` and `directed` at `:28` | Repeat fields on that same row, unset on every row that exists today |
| A row already owns the span from its own fire until the next row fires | ADR 0047 | Built, and it is stated in `StageRow.directed`'s own JSDoc (`rows.ts:22-27`) | Nothing, and it is why a run of stepped rows needs no new concept for a span |
| A phase ends on an event and never on a clock | ADR 0049 | Built: `Phase.ends` (`stage.ts:51`), `phaseEnded` (`stage.ts:253-258`) | Nothing, and this is why nothing may compute against a section length |
| The section's last authored row time | ADR 0049 | Built as data: 116.5, 138 and 67.5 (`rows.ts:231`, `:525`, `:657`) | Nothing, and nothing reads it: it is where the last standing row's figure is chosen against and where the closing zero row is placed, and there is no authored span in the code |
| A trash type's stats are its own row for the whole run | ADR 0059, ADR 0060 as re-ruled | Built: `MOB_TYPES` rows are read as written (`mobs.ts:68`) | Nothing, and nothing is added: the per-minute stat step is struck |
| Six templates, and a template is a placement not a cast | ADR 0016 | Built: `TemplateName` at `templates.ts:12`, `place` at `:191-203` | Nothing |
| The Procession teaches mob fire on a Drip of three | ADR 0016 | Built: `rows.ts:141-148`, rationale at `:125-126` | A lone revenant Drip in its place |
| Corpses pay size and charge from one amount | ADR 0002, ADR 0003 | Built: one `paid` to growth and to the reservoir (`swallow.ts:83`, `:94-95`) | Nothing; the constants under it move |
| The feast fills the reservoir in one swallow | decision 5.11 | Built as an identity: `RESERVOIR_CAPACITY` is `FEAST_PAYOUT` (`tuning.ts:102`, `:109`) | Nothing; the identity is kept |
| Each on-swallow line scales what it pays in | ADR 0058 | Built: freshness scales wisp count and surge volleys | **Absent: any cadence limit at all.** One swallow buys one surge and a chain overwrites (`CONTEXT.md`, Surge) |
| A drop paid while an offer stands banks | ADR 0034 | Built: `offer.ts:213-219`, and a second site at `:188-192` when the pool refuses every body | Nothing. The expiry is withdrawn from round one, so no slice touches `offer.ts` |
| A banked offer opens at the grave's own x | ADR 0034 | Built: `openBanked` (`offer.ts:271-275`), site `'bank'`; the tick site is `openBankedOffer` (`offer.ts:295-299`) | Nothing, and this is the evidence for the withdrawal: every clear opens the bank on its own tick, so a bank never waits |
| A bank is permitted per phase | ADR 0034 | Built: `Phase.bankOpens` (`stage.ts:78`) read through `bankOpensNow` (`stage.ts:261-263`) | Nothing |
| Caps are bug detectors and never evict | ADR 0056 | Built as policy (`caps.ts:6-18`) and as a proof for one of three (`caps.ts:43-61`) | `MOB_CAP` and `MOB_FIRE_CAP` are still hand-derived constants (`caps.ts:32-33`) |
| `peakArrivals` takes one more addend | ADR 0056 | Built: `rows.ts:919-929`, and `caps.ts:43-59` names the purse as the missing one | The purse |
| A permission cell per phase and per row | ADR 0047, ADR 0056 | Built: `Phase.directed` (`stage.ts:58`), `StageRow.directed` (`rows.ts:28`, whose JSDoc names step 4 as its reader) | Nothing; the director reads them |
| The two section ceilings the director may not add past | ADR 0047 | Built: `liveTemplateCeiling` 1 on the Procession, `liveBodyCeiling` 4 on the Vigil (`stage.ts:99-108`, `:149-158`) | Nothing; the director reads them |
| The director itself | ADR 0047, ADR 0056, #85 | **Absent, entirely.** No purse, no cards, no signal, no quiet interval | The whole thing |
| Every die from its own named stream | ADR 0012, ADR 0047 | **Half built.** Five names (`rng.ts:4`), folded in order (`witness.ts:23-31`), and #108 records two draw sites sharing a stream with unrelated systems | A sixth name, and #108's two |
| The pressure signal read back off a tape | #85 | **Absent.** No event carries it and no reading computes it | The event, the reading, and the graph |
| What arrived, per phase and per type | #39 | Built: `readings/arrivals.ts`, declared in `BATCH_READINGS`, and its JSDoc already names the mow ruling as what it exists for | Arrivals as a rate rather than a count |
| Mobs alive over a run | #39 | **Half built.** `mobsAlivePerTick` is declared with the `peak` reduction | A distribution over ticks, which is a reduction the report does not have |
| Kills by source | #39 | Built: `tuning.engagements.fatalBlows` by name, and `damage` by name | Nothing |
| Time to ceiling | #39 | **Half built.** `tuning.gravePath.sizePerTick` is declared as a peak | The first tick the size reaches the ceiling |
| Belch cadence | #39 | **Half built.** `belchCadence` carries every fire with its tick, plus ticks at full and charge wasted | The interval between fires |
| Runs that stopped at the ceiling | #118 | **Absent.** `run.ending` counts `'none'` and nothing separates a ceiling stop from any other | The count, named on the report |
| Nothing the report prints is a target | ADR 0053 | Built: `harnessStatesNoTarget.test.ts` over every reading module | Every new module joining its list |
| The golden digest is re-pinned deliberately | ADR 0015, ADR 0019 | Built: `GOLDEN` at `digest.ts:313` with eight dated re-pin paragraphs at `:264-312` | Up to five more, one per slice permitted to re-pin |
| A starting value the run resolved is in the header | ADR 0027, ADR 0043 | Built: seed, size, levels, roster and the rest at `app/tapeHeader.ts:71-92`, read from the URL in `seedFromUrl.ts` | The signal lock, and the `FORMAT_VERSION` move that carries it |
| The batch runner and its report | ADR 0053, #98 | Built: `scripts/batch.ts`, `src/dev/batchReport.ts`, `compareBatches.ts`, `rankTest.ts` | The readings above |
| The frame budget on a synthetic field | #39 | **Half built.** `framePerformance.ts` reads a tape's frame rows (`:150-162`) | A synthetic field to read them off, which is round 0 |

Three structural facts the table rests on, verified rather than assumed:

- **`src/dev` may reach `src/game` and `src/tape` and may import no package**, so every reading this step adds is fenced out of `node:fs` and the filesystem work is a shell in `scripts/` (`boundary.test.ts`, and `scripts/measure.ts` is the shape already in use).
- **The event vocabulary is not on the wire.** `wireCodes.ts` carries input devices, integrities, stop reasons, run endings, fault identities, severities and frame reasons, and no event codes, so a new event for a directed add costs no format version. What does move `FORMAT_VERSION`, from 3 to 4 (`wireCodes.ts:36`), is the one new header field: the signal lock, which is a value the run resolves and which ADR 0027 therefore puts in the header. It moves once, in the instrument slice.
- **`digest.ts` scripts its own mobs and kills them at each victim's own health** (`digest.ts:203`, and the JSDoc at `:33-45`, whose own wording is that scripting rather than running longer "keeps the golden off the ramp's own tuning"). So a health row does not change its kills; what moves it is the witness fold. **That comment's word is stale under ADR 0060's re-ruling**, since there is no ramp and the thing it means is the stage's authored growth; slice B rewrites the sentence in the commit that makes it stale, and the property it states is untouched.

---

## 3. Verification steps

**Actor: agent.**

1. **Unit tests** at the seams in section 4, per the list in section 6. `pnpm vitest run` from `apps/hungry-grave/`.
2. **`pnpm typecheck`** from `apps/hungry-grave/`. Only this judges diagnostics.
3. **`pnpm build`** from `apps/hungry-grave/`.
4. **`pnpm verify`** at the repo root. A timeout with no assertion beside other running work is contention and not a failure; run the suite alone once more before calling it red (`docs/agents/lessons.md`, "contention is not flakiness").
5. **Test-name diff, per slice.** `pnpm vitest list --json` against the step 0 baseline, comparing file-qualified names as well as bare ones. It matters on every slice and never only on the one whose table looks widest: slice A's boundary said five files and the diff said 19, with 42 tests red across 13 (`docs/push/step-4-progress.md` section 4 item 6).
6. **The golden digest, per slice.** `GOLDEN` may move only in the **five** slices section 10 names, A, B, C, E and F, and every move lands with a dated paragraph in `digest.ts`'s JSDoc naming what moved, what held and why. **A re-pin in one of those five is planned and expected, never a stop-and-report** (the tech architecture gate): the coder re-pins it and writes the paragraph. A move in any slice not on the list is a stop-and-report, and so is a move with no paragraph even when the number is right. A slice on the list that does not move it is also expected, because whether a change reaches inside the scenario's 600 ticks is a fact about the window and not about the slice.
7. **`WITNESS_VERSION` moves exactly once, in slice E, in the same commit that declares every new folded field.** Slice E is the fold slice and its only job is the fold, so the stamp and the declaration are the same commit by construction. A version stamped before the fold stops moving names several folds, which cost this project a real defect (`apps/hungry-grave/docs/lessons.md`, The sim).

7a. **`FORMAT_VERSION` moves exactly once, from 3 to 4, in slice G, in the same commit that adds the signal lock to the header.** Nothing else in the step moves it, and a move anywhere else is a stop-and-report. Slice A0 fills the header's existing `buildIdentity` slot and adds no field, so it does not move it.
8. **Replay determinism, per behaviour-changing slice.** One seed played twice under `shaky-short` gives the same tick count and the same witness at every checkpoint, and the run's own stream cursors are identical between the two. Under the director this is the acceptance line #85 states outright.
9. **Verification readback on a played tape.** Decode one batch tape and assert `measure` answers `outcome: 'verified'` rather than a divergence or a refusal (ADR 0019, ADR 0033).

9a. **A hand-recorded tape, per slice (the tech architecture gate).** Beside the bot tapes: record a run by hand against the built app through `vite preview`, driven with `playwright-cli` and never the Playwright MCP, then run it through the measure script and assert `outcome: 'verified'`. A bot tape and a hand tape exercise different input paths, and the one undiagnosed divergence this branch has is on a human tape, so a slice that verifies only bot tapes is blind to exactly the class of defect the branch already has an open instance of. Every slice records one at its own tip, the two that change no player-visible thing included: slice E because it moves the witness version, and slice G because it moves the tape format.
10. **No cap binds in normal play, and a bound cap raises a fault.** Play a batch and assert the corpse, mob and mob-fire refusal counters are zero on every run; a non-zero counter is a reported fault and a finding, never a silently raised cap.
11. **The frame budget on the built app.** The synthetic field from step 1 of the order, on desktop through `vite preview` and on the phone from the deployed URL. The desktop half is the agent's; the phone half is Mark's.
12. **The 48-seed batch on `steady-far` and `loose-far`**, printed into the note in full: arrivals a second, the mobs-alive distribution, the enemy-shots peak, kills by source, hits to kill per trash type per minute, time to ceiling, belch cadence, final rungs per line, reach and seal rate, the untaken offers by site, the banks per run, and the count of runs that stopped at the tick ceiling. **A 192-seed batch runs only if a victory rate is the question the reading turns on** (the product vision gate, restoring the brief's own condition): reach was measured stable at 48 and a victory rate was not (`playing-harness.md` section 4, amended), so the larger batch is what a victory-rate question costs and not a routine second pass. If the 48-seed reading raises no victory-rate question, it does not run and the note says so.
13. **The batch's wall-clock cost**, split between playing and measuring, so round two is planned against a measured figure.
14. **The fences.** `boundary.test.ts`, `lineAgnosticPolicies.test.ts`, `executionFence.test.ts` and `harnessStatesNoTarget.test.ts`, plus `comparisonDeclared.test.ts`, each green and each named by test title in the note.
15. **CodeRabbit CLI before every commit that contains code**, per the branch's standing rule, with its findings addressed before the commit rather than after.

**Actor: human (Mark). None of these blocks a slice (the product vision gate). The push runs in one-push mode: the work continues past every one of them and he reads them on the branch.**

16. **The surfaced commitments in the record's section 11.** The cadence floor widening ADR 0058; the shambler never firing, which retires the armed share on the mow body; the standing row widening what a Row is; `WITNESS_VERSION` moving to 7; and `FORMAT_VERSION` moving to 4 for the signal lock. Every one is taken under its default, filed in its own step, and put in front of him in the session recap. His to overrule on the branch before merge, and no slice waits for the answer.
17. **The density ADR's game design gate. Already run, and it is a gate rather than a person.** Mark's ruling (pre-authorization 6) is that the gate sees the density decision before the ADR is filed, and it has: admissible as one ADR titled on the mow, with silent trash carried as the mow's cost, the revenant as the visible armed minority of a heaven minute, and "one skull" and the touch counts kept out of the ADR. Step 4 of the order files it in that form.
18. **Whether the mow feels like a mow.** No test can see it. The agent delivers the build deployed and reports it ready; only he can play it.
19. **Whether the ladder reads as rare rather than as capped.** The batch says how many seeds max out under each hand; whether that is rarity or a wall is his read.
20. **Whether an offer is still readable at mow density.** Slice B's report carries a screenshot of an open offer standing in a Crowd-density field, so the north star's sixth question, "can the player still read it at full density?", is asked of the one object the whole ladder runs through (`docs/VISION.md` section 4). The agent takes the shot and reads it; whether three bodies still read as a choice inside a mow is his.
21. **#117: which second configuration a finding must agree across.** The batches run `steady-far` and `loose-far` because the sloppy corner reached the Undertaker on 0 of 48 seeds. Every finding says which two it agreed across until he rules.
22. **Whether the Wall is still meant to cost something (ADR 0042, filed by slice A).** The mow takes both of ADR 0042's halves off it: at 8 health the curtain opens a lane and the grave crosses untouched at the floor build, and the loaded half goes with it because silent bodies put no shots in the air for a belch to be worth. The measurement is in `docs/push/step-4-progress.md` section 4 item 7, the two failing halves stand as `it.fails` tripwires, and slice B holds the Crowd's table. Not applied, and his to answer.
23. **Whether Territory's bottom rung still reads as his #79 ruling meant it (filed by slice A).** Two pulses is a shambler now and a level-one crossing lands five, so the mow body dies in the slowest ground there is, which is the opposite of the early-rung-survivable reading. The pace pin itself is kept whole on a revenant. `docs/push/step-4-progress.md` section 4 item 8, and no slice in this plan owns Territory's rungs. Not applied, and his to answer.

**No rendered check is owed by the readings slices and one is owed by every other slice.** The mow, the standing rows, the economy and the director all change what a player sees, and the playbook's escalation is mandatory when it applies: a rendered check of the built app through `vite preview`, with the screenshot actually read, and a run played, ended and played again, because a rendered check that only ever plays run one is structurally blind (`apps/hungry-grave/docs/lessons.md`, The screen pool).

**Slice B's rendered check carries one named shot (the product vision gate): an offer standing open in a Crowd-density field.** The offer is three bodies a player is meant to tell apart and choose between, and the mow is the first field it has ever had to be read against. The shot is taken, read in the slice's own report, and handed to Mark as verification step 20.

---

## 4. Seams under test

Signatures are the contract the coding agent implements. Every public name carries a glossary word. Public interfaces are one export block at each module's end.

### `src/game/stage/rows.ts` (changed): a row gains repeat fields

```ts
/**
 * The repeat a row fires on, or null on a row that fires once (CONTEXT.md
 * Standing row). Brotato's `repeating_interval`, `reduce_repeating_interval`
 * and `min_repeating_interval` on the resource that already carries the
 * one-shot groups: no shipped format found makes the continuous case a second
 * kind of entry (ADR 0060, docs/research/naming-the-authored-growth-rate.md).
 */
interface Repeat {
  // Seconds between two firings of this row's own group.
  readonly intervalSeconds: number;
  // What each firing takes off that interval, and zero on a row that holds one rate.
  readonly reduceSeconds: number;
  // The floor the interval shrinks to: a rate is a rate until it would put two groups on one tick.
  readonly minimumSeconds: number;
}

interface StageRow {
  // ... t, template, count, type, carries, directed
  /**
   * Set on a standing row and null on every row that exists today. A row with
   * it set holds its rate from its own `t` until the next row of any kind, so a
   * section's growth is a run of these and nothing anywhere reads a section's
   * length (ADR 0049, ADR 0060). A section whose phase ends on
   * `rowsSpentAndFieldClear` closes its list with one authored at a rate of
   * zero, at its sparse last row's time, or the field never reads clear and its
   * boss never arrives (ADR 0051).
   */
  readonly repeat: Repeat | null;
}

/**
 * How many times a row fires on this phase-local tick: once at its own time,
 * again on its repeat, and zero everywhere else.
 *
 * One function over any row, which is what one construct and one list means:
 * a row with `repeat` null answers 1 on its own tick and 0 forever after, and
 * the caller never asks which kind of row it holds.
 *
 * Stateless, and that is a requirement rather than a detail: it is a pure
 * function of the time inside the section, so the stage keeps no cursor for a
 * repeating row and the witness folds no field for it. `firedRows` exists
 * because one-shot rows are consumed (stage.ts:191, :311); a repeat is not
 * consumed, and a folded cursor beside it would be a second source of truth for
 * a number the time already determines.
 *
 * It takes phase-local seconds and never ticks, because `t` and every field on
 * `Repeat` are authored in seconds and `rows.ts` value-imports nothing: it
 * cannot reach `TICK_HZ` without taking an import that would cost it the
 * property the caps derivation depends on. `stage.ts` converts, through the
 * `rowTicks` it already has (`stage.ts:265-267`).
 */
const repeatingArrivals: (row: StageRow, phaseSeconds: number) => number;

/**
 * One thing the director may buy (CONTEXT.md Card): a template group, the same
 * triple a StageRow is, with a cost in bodies.
 *
 * It lives here rather than in director.ts because caps.ts derives from it and
 * caps.ts may not import the director; see the module boundary below.
 */
interface DirectorCard {
  readonly template: TemplateName;
  readonly type: MobType;
  readonly count: number;
}

// The cost of one body of each type, against the roster's own health and threat.
const BODY_COST: Readonly<Record<MobType, number>>;

// A card's cost: the sum over its bodies. The purse spends on cards and never on single bodies.
const cardCost: (card: DirectorCard) => number;

/**
 * The bodies each section gives the director, one named constant per section
 * beside that section's rows.
 *
 * Named constants rather than a record keyed by phase, because a phase name is
 * `stage.ts`'s type and this module must not know it, not even as a type
 * import: the rule below is a rule about direction and a type-only import is
 * how it gets dodged. `VIGIL_PURSE` is 0, which is a data row with its reason
 * in the record, and it is 0 rather than null because the director may look at
 * the Vigil and find nothing, which a reading can see.
 */
const PROCESSION_PURSE: number;
const CROWD_PURSE: number;
const VIGIL_PURSE: number;

export {
  repeatingArrivals,
  cardCost,
  CARDS,
  BODY_COST,
  PROCESSION_PURSE,
  CROWD_PURSE,
  VIGIL_PURSE,
};
export type { Repeat, DirectorCard };
```

**There are no standing-row constants, because a standing row is a row.** The Procession's standing rows sit in `PROCESSION_ROWS` and the Crowd's in `CROWD_ROWS`, in their own tables in time order beside the shaped rows they run under, which is what "one construct, one list" buys: a reader opens one table and sees the whole section, and `peakArrivals` walks the same list it already walks.

**The module boundary, and it is the reason these tables are here (the tech architecture gate).** `rows.ts` value-imports nothing: its two imports are `import type` (`rows.ts:3-4`), so it is the one stage module a derivation can read from anywhere. `caps.ts` already imports it and only it (`caps.ts:3-4`). `stage.ts` value-imports `mobs.ts` (`stage.ts:7`) and `mobs.ts` value-imports `caps.ts` (`mobs.ts:4`), so **`caps.ts` importing `stage.ts` would close a cycle**: caps to stage to mobs to caps. The standing rows, the card table and the purse table therefore live in `rows.ts`, where the caps derivation can read them, and `Phase` wires them in by reference exactly as it already wires in `PROCESSION_ROWS`. Any slice that finds itself wanting `import { PHASES } from './stage'` inside `caps.ts` has found the cycle and stops rather than reaching for a type-only import to dodge it.

**The pour carries the standing row in with the shaped rows, and it thins by interval (the tech architecture gate).** `rowsUnderThePour` re-times the Crowd's last groups into the Waking and multiplies each count by the share (`rows.ts:808-826`), and a standing row cannot be thinned that way: its count is one group's bodies and its rate is the interval. So the function also carries in the standing row active at the pour's own opening time, at `t: 0`, with its `intervalSeconds` widened by `1 / share` and its `reduceSeconds` and `minimumSeconds` widened with it. A rate thins by interval, never by count, and a rate carried through at full interval would put the Waking's pour on top of the Crowd's full mow. The pour test at `rows.test.ts:380` extends to it: the carried standing row's rate is below the Crowd's own and above zero, on the same terms the existing test holds the counts to.

**`peakArrivals` gains the rate term in slice B and not in slice D (the tech architecture gate).** It is the corpse cap's first clock and it already walks `SECTION_TABLES` (`rows.ts:920-929`), so the moment a standing row enters a section table its window is wrong: a table that authors a rate prices identically to one that does not, and `CORPSE_CAP` is a proof rather than an estimate. The term is the rate times the window, read off the same rows the section walk already reads, and the test is that a table carrying one standing row prices above the same table without it. **`MOB_CAP` and `MOB_FIRE_CAP` stay with slice D**, because those are new derivations rather than an existing proof going stale. **And slice B's report prints `state.refusals` off its own hand tape**, because a slice that multiplies arrivals under caps derived for a thinner field is the slice most likely to bind one, and a bound cap is a fault rather than a number to raise (`caps.ts:6-18`).

**`carries` is false on every standing row.** The twenty-five carriers are authored placements and the ladder's whole supply (ADR 0048, `carriers.ts:53-55`), and a rate that carried would hand out rungs at a figure nobody wrote down. It is guarded beside spec test 12, which is where the Vigil's absence is guarded, because both are mechanical facts about the section tables rather than behaviour under a tick.

**The Vigil declares no standing row and that absence is guarded by a test**, because a deliberate absence in production code is guarded by a test that fails if the absent thing appears. The guard is mechanical under the new shape: no row in `VIGIL_ROWS` carries a `repeat`. The section's property is food swallowed per second falling below the Crowd's, and a standing row in it would pass a corpses-per-second reading while feeding better.

**The trough is an authored standing row and not a dip in a curve.** One deliberate trough sits mid-section so the Waking lands against something rather than against a sustained peak (`stage-floor.md` section 1), and under the stepped shape it is simply the Crowd's middle standing row carrying a lower figure, which is what Mad Forest does at its own minutes 5 and 8, where its `frequency` column steps back up to 1000 and 1500 milliseconds between spawn ticks. A reader sees three consecutive rows rather than one rate with an exception carved into it.

### `src/game/stage/stage.ts` (changed): the stage stands the rate, and the phase gains a purse

```ts
interface Phase {
  // ... name, rows, ends, boss, directed, music, liveTemplateCeiling, liveBodyCeiling, bankOpens
  /**
   * The finite budget this phase gives the director, counted in bodies
   * (ADR 0056). Null where the phase is undirected, so a phase that may not
   * spend has nothing to spend rather than a zero.
   *
   * The figure itself is a constant in rows.ts and this column is a reference
   * to it, on the same terms as `rows`, because caps.ts derives from the table
   * and may not import this module.
   */
  readonly purse: number | null;
}
```

**How the stage stands a rate, and it keeps no state to do it (the tech architecture gate).** `spawnDueRows` already walks the phase's rows in time order and consumes them through `firedRows` (`stage.ts:300-315`), and that cursor is the whole answer. The active standing row is **the last row carrying a `repeat` among `rows[0..firedRows)`**: it is by definition the most recent standing row the tick has passed, and a later row of any kind that is also standing replaces it, which is what "a standing row ends at the next row of any kind" means mechanically. On each tick the stage asks `repeatingArrivals` of that one row alone, for the ticks after its own `t`, and fires that many of its groups through the `spawnRow` it already has. **The row's first group is fired by the cursor**, on the tick `spawnDueRows` consumes it, exactly as a one-shot row is, so `repeatingArrivals` answers only for the repeats and no row ever fires twice on its own tick.

**Nothing is folded for this and nothing needs to be.** The pick is a function of `firedRows` and the phase's own table, both of which the witness already holds, so a standing row costs the tape nothing and a replay rebuilds the rate by rebuilding the cursor.

**Every standing row sets `directed` deliberately, and it is not a default.** `StageRow.directed` says whether the director may spend in the span the row opens, and a row's span runs from its own fire until the next row fires (`rows.ts:21-27`). A standing row is therefore a span opener like any other, and the one the director sees for most of a section: the flag it carries is what says whether the mow's own minutes are directable ground. A standing row copied from a neighbour with the flag along for the ride is a permission nobody decided.

**`spawnRow` is not the only caller of `spawnMob`.** The Waking's pour spawns through it (`setPiece.ts:184`) and so do the Undertaker's dug-up bodies (`undertaker.ts:255`), plus the digest's own scripted mobs (`digest.ts:167`, `:188`, `:193`). Anything a slice adds at that seam is added for three callers and not one, which is why slice E rather than slice B owns the provenance mark below.

**The phase gains one column and not two.** There is no `Phase.standing`, because a standing row is a row and rows already reach the phase through its `rows` column. That is the whole of what "one construct, one list" buys at this seam: `stage.ts` learns nothing new about growth, and every reader that walks a phase's rows walks the standing ones for free.

**A purse of null and a purse of zero are different and the difference is guarded.** `Phase.directed` false plus a purse of null is a phase the director may not touch; a purse of zero is a phase it may touch and finds empty, which is what the Vigil carries; a spent purse is a phase whose field returns to its authored floor for the rest of its length, which is ADR 0056's "the storm is seen to win" and a thing a reading has to be able to see.

**The purse is pinned to the build and takes no header field**, which is ADR 0056's own open question as the step 3 record closed it. That closure rested on the shape step 4 would author, and this is that shape: the purse is authored stage data, no URL pins it and no seed draws it, so ADR 0027 does not reach it. **What does move `FORMAT_VERSION` is a different value entirely (the tech architecture gate, decided by the session): the signal lock**, which a run resolves from its URL for a tuning experiment. **Corrected 2026-09-09: that is not ADR 0056's trigger firing.** The trigger names the budget and only the budget, the purse stays pinned to the build, and so it is unfired. The lock reaches the header through ADR 0043, which is where header-or-build is decided, in the form ADR 0027 rules. The purse's closure is untouched by it.

### `src/game/director.ts` (new)

```ts
/**
 * The pressure the run is putting on the player (CONTEXT.md Pressure): harm
 * and floor events only, held for an interval and then decaying linearly.
 *
 * It never reads a kill near the grave, because a kill up close is food here
 * and a near-kill term would answer a player doing exactly what the design
 * asks by holding back (ADR 0056).
 */
interface PressureSignal {
  readonly value: number;
  readonly heldUntilTick: number;
  /**
   * The figure this run locked the signal to, for a tuning experiment, or the
   * value that means it ran live. It is resolved before the first tick and
   * recorded in the header, so a tape says what it was read against
   * (ADR 0027, ADR 0056's named trigger).
   */
  readonly lock: SignalLock;
}

/**
 * What the director holds across a run. It lives on RunState so the witness
 * folds it and a replay rebuilds it, which is ADR 0047's binding constraint.
 */
interface DirectorState {
  readonly signal: PressureSignal;
  readonly purseLeft: number;
  readonly quietUntilTick: number;
}

// The signal after one tick's events, which is the only thing that raises it.
const advancePressure: (
  signal: PressureSignal,
  events: readonly SimEvent[],
  tick: number,
) => PressureSignal;

/**
 * What the director spends this tick, or nothing. It returns the add rather
 * than performing it, so the one execution authority stays the caller's
 * (ADR 0017).
 */
const directorSpend: (
  state: RunState,
  phase: Phase,
  stream: Stream,
) => DirectedAdd | null;

export { advancePressure, directorSpend, DIRECTOR_STREAM, SIGNAL_HOLD_TICKS, SIGNAL_DECAY_TICKS, QUIET_MIN_TICKS, QUIET_MAX_TICKS };
export type { DirectorState, PressureSignal, DirectedAdd };
```

**It returns an add and never performs one.** `directorSpend` is a pure function of the run, the phase and the stream, so it is testable without a tick loop and the spawn stays where every other spawn is.

**What it returns is a card, never a body (the game design gate).** `DirectedAdd` carries the card it bought, the position the stream drew for it and the reason the spend was permitted, so what arrives is a template group a player can read and what a reading sees is the same group. The card table and the cost function are `rows.ts`'s, imported here, because the caps derivation reads them too and may not import this module.

**A locked signal never moves.** `advancePressure` returns the locked figure whatever the tick's events are, which is the whole point of the lock: the gate and the population are tuned against a held signal, and the signal's own weights are tuned separately or not at all.

**`directorSpend` takes its place in the tick order's JSDoc (the tech architecture gate).** `step.ts:205-208` names the order in prose, "scroll, the move command, the belch, spawns, mob motion and fire, the boss's own tick", and a new part that puts bodies on the field is invisible unless that sentence names it. It goes in immediately after spawns: the authored rows have fired for the tick, so the director never adds over a row that has not yet arrived, and mob motion has not run, so a directed body lives its first tick exactly as an authored one does. The slice that adds it edits that sentence, and the fold slice's own additions do not touch it because they add no tick part.

**Its stream is named `director` and it is the sixth name on `StreamName`**, folded in `STREAM_ORDER` after the five that are there (`witness.ts:23-31`). ADR 0047 requires it in as many words: its dice come from its own named seeded streams and never from the spawns stream, so authored placements downstream of a directed fill stay put.

**The four off-limits moments are read and never written here.** `directorSpend` returns null when the phase's `directed` is false, when the row it would add over carries `directed: false`, and when the phase's own ceiling is already met (`liveTemplateCeiling`, `liveBodyCeiling`). It never names a phase, a boss or a set piece, which is ADR 0047's own requirement that the moments read off the phase's data rather than out of code.

### `src/game/offer.ts`: unchanged, and the absence is the finding

**No slice in this step opens this file (the product vision gate and the game design gate).** The brief's bank expiry needed `state.bankedOffers` to become a list of ticks, an expiry constant, an `expireBanks` seam, a `bankExpired` event, an invariant, and both banking sites handled on the same terms. All of it is withdrawn from round one on the record's section 5 item 5, so all of it is out of this plan: no seam, no test, no event, no invariant, and `state.bankedOffers` stays the number it is at `run.ts:265`.

What replaces it is a reading the batch already has. Untaken offers split by site and banks per run come out of `offerChoices`, which shipped in step 3, so round one measures whether the mow itself is what makes a full build rare before anything on the ladder is moved.

### `src/game/lines/wisps.ts` and `src/game/lines/skullStream.ts` (changed): the cadence floor

```ts
// The fewest ticks between two wisp volleys, whatever the swallow rate (ADR 0058 as amended).
const WISP_VOLLEY_INTERVAL_TICKS: number;

// The longest a running surge may be extended by further swallows.
const SURGE_DURATION_CAP_TICKS: number;
```

**The floor is an interval and never a queue.** A swallow inside the interval does not bank a volley for later: the wisps pay what freshness says at the moment they fire, and a banked volley would pay a stale corpse's freshness on a fresh corpse's tick. The skull stream's is the opposite shape and that asymmetry is deliberate: one running surge extends toward a cap, because the glossary already rules that a swallow chain overwrites an unspent surge rather than banking a queue, and extending is what overwriting becomes once a chain is the normal case rather than the corner.

**ADR 0058's freshness axis is untouched.** Freshness still scales wisp count with a floor of one soul and surge volleys rather than columns, so a rotten corpse never makes a level-five stream look like a level-two one.

### `src/game/caps.ts` (changed): the caps become derivations

```ts
/**
 * The most mobs the stage itself can put on the field at once: the worst
 * standing-row peak, plus the beats that overlap it, plus the largest single
 * card (ADR 0056: "a phase's worst case is its floor plus its budget, which is
 * a number in data").
 *
 * A standing row's peak is not its rate. What is alive is what arrived and has
 * not yet died or left, so the term is the rate times an unkilled body's time
 * on the field, and a peak taken from the rate alone is a cap that binds the
 * first time nobody kills anything.
 */
const peakLive: () => number;

const MOB_CAP: number;
const MOB_FIRE_CAP: number;
```

**Three rules the derivation has to satisfy, all from the tech architecture gate.**

**The addend is the largest single card and never the purse.** A purse is spent over a phase with a quiet interval between every add, so a purse-sized addend sizes the pool for a moment the quiet interval forbids. The largest card is the most the director can put down at once, which is what a pool has to hold.

**`MOB_FIRE_CAP` counts the bosses.** The Banshee's tears and the Undertaker's shots go through `fireDirectedShot` into the same pool the revenants use (`bosses/banshee.ts:125`, `bosses/undertaker.ts:233`, `:280`, and the pool at `mobFire.ts:107`). The derivation is the revenant peak plus the worst boss pattern in the air, and a derivation that read the revenant peak alone would size a pool for a field that never happens.

**Tight, not padded.** A cap is a cost as well as a ceiling: `stormTargets.ts:113` sizes a scratch array from `MOB_CAP` at module load, `FieldRenderer.ts:175-178` allocates a sprite per slot for the mob, shot and corpse caps, and every pool is walked whole whether or not a slot is alive (round 0's second finding). Padding is paid on every tick of every run. What protects a tight cap is the fault: a bound cap raises one and nothing is ever evicted (`caps.ts:6-18`).

**`CORPSE_CAP` keeps its shape and gains one addend.** It is already `MOB_CAP + peakArrivals(FRESHNESS_SECONDS) + TREASURE_ALLOWANCE` (`caps.ts:60-61`), already a proof rather than an estimate, and `peakArrivals` is already written so one more term drops in (`rows.ts:919-929`, `caps.ts:43-59`). The standing rows become a fifth term inside `peakArrivals` beside the section tables, the pour, the boss adds and the stripped rungs, and the director's term is the most it can add inside the freshness window, which the quiet interval bounds.

**This module imports `rows.ts` and never `stage.ts`.** `caps.ts:3` already imports `peakArrivals` from `./stage/rows` and nothing else from the stage. `stage.ts` value-imports `mobs.ts` and `mobs.ts` value-imports `caps.ts`, so reaching for `PHASES` here closes a cycle. Every figure this derivation needs, the standing rows, the card table and the purses, is in `rows.ts` for that reason.

**No cap is lowered for a phone.** `caps.ts:20-31` rules that the caps are identical on every device, so round 0's phone figure is a reading and never a reason to move a cap. What to do if the phone cannot draw the field is open and it is Mark's (the record's section 12 item 4).

### `src/dev/readings/pressure.ts` (new)

```ts
/**
 * The director's own run, read back off a tape: the signal per tick, every add
 * with the tick it happened on and the reason it was permitted, and the purse
 * left per phase.
 *
 * It is #85's acceptance line as an instrument: a run's pressure signal can be
 * read back off its tape and drawn against what was added and when.
 */
interface PressureReading {
  readonly signalPerTick: readonly number[];
  readonly adds: readonly DirectedAdd[];
  readonly purseLeftByPhase: Readonly<Record<string, number>>;
  readonly quietTicks: number;
}
```

**It reads events and never the director's own state**, on the same terms as every other reading in `src/dev/readings/`, so an instrument that agreed with the director by construction is impossible.

### `src/game/signalLock.ts` (new): the lock the run resolves

```ts
/**
 * The figure a run holds its pressure signal at, or the value that means the
 * signal ran live (CONTEXT.md Signal lock).
 *
 * It is a resolved value and never an absence, because the header records what
 * the run started from and a later change of the default must not silently
 * change what an old tape replays as (ADR 0027).
 */
type SignalLock = number | typeof SIGNAL_RAN_LIVE;

// The resolved value that means no experiment held the signal.
const SIGNAL_RAN_LIVE: unique symbol | number;

// Whether the signal is held this run, which is the one question advancePressure asks of it.
const isLocked: (lock: SignalLock) => boolean;

export { isLocked, SIGNAL_RAN_LIVE };
export type { SignalLock };
```

**It is its own module in `src/game` and not a field on the director**, because three places read it and only one of them is the director: `advancePressure` holds the signal to it, `app/tapeHeader.ts` writes it, and `tape/playback.ts` rebuilds the run from it. A type owned by the module that all three import is what keeps the header and the sim reading the same value.

**The URL half lives where the other pins live.** `src/app/seedFromUrl.ts` already owns "what the URL asks of a run" as pure functions over two strings (`seedFromUrl.ts:1-2`), with `sizeFromUrl`, `levelsFromUrl` and `atFromUrl` in it, and a bad value is warned about once and ignored rather than blanking the screen (`:32-38`). `signalLockFromUrl` joins them on exactly those terms.

### `src/dev/seriesSummary.ts` and `src/dev/batchReport.ts` (changed): the readings this step adds

| Reading | Reduction | Why it is new |
| --- | --- | --- |
| `mobsAlivePerTick` | gains a **distribution** beside its peak | A peak says the worst tick and the mow is about the ordinary one |
| `tuning.arrivals.perSecond` | spread | The rate is the quantity the standing row authors; the count is what the run's length happened to produce |
| `tuning.gravePath.ticksToCeiling` | spread | Absent on a run that never reached the ceiling, on the same terms as the reading itself |
| `tuning.belchCadence.intervals` | spread | The fire list already carries the ticks; the interval is the cadence |
| `tuning.pressure.*` | spread and count | The director's own instrument |
| `tuning.timeToKill`'s hit figures, split by the minute the kill landed in | spread | The instrument that decides whether a stat step ever comes back. With no step authored a body costs fewer hits every minute the ladder climbs, and this is the reading that says whether the mow ends part-way through a run (the record's section 12 item 6). The module already carries hits per kill per type; the minute is the new axis |
| `run.ceilingStops` | count | #118: a batch of 48 that is quietly a batch of 47 |

**Every one joins `harnessStatesNoTarget.test.ts`'s module list and `compareRuns.ts`'s declared comparisons**, or `comparisonDeclared.test.ts` stays red. `READINGS_VERSION` does not move: its own rule is that adding a reading beside unchanged ones does not bump it (`readingsVersion.ts`), and every figure the existing readings printed still means what it meant.

---

## 5. Module boundaries

Every module is owned by this dispatch unless its row says otherwise.

| Module | New or changed | What it is for | Owner |
| --- | --- | --- | --- |
| `src/game/mobs.ts` | Changed | Slice A moves the shambler's health and fire rows, with no new field and no new type. **No slice adds a per-minute stat step**, which the second gate round struck. | Slice A |
| `src/game/__tests__/touchCounts.test.ts` | Changed | The pinned counts re-expressed against the mow ruling, in the same motion as the ruling. | Slice A |
| `src/game/stage/rows.ts` | Changed | `Repeat` and `StageRow.repeat` authored in seconds, `repeatingArrivals` over phase-local seconds, the standing rows written into the section tables in time order with each section's closing zero row, the rate term inside `peakArrivals`, the standing row carried into `rowsUnderThePour`, the re-authored one-shot rows, the Procession's revenant Drip, and, with the caps, the card table, `BODY_COST`, `cardCost` and the three purses. **No span helper and no standing-row constants: a standing row is a row.** **It value-imports nothing and that is what makes it the home for every table a derivation reads.** | Slices A, B and D |
| `src/game/stage/stage.ts` | Changed | **Slice B** stands the rate: the active standing row picked off `firedRows`, `repeatingArrivals` called on it alone, its groups fired through the `spawnRow` that already exists, and `rowTicks` doing the seconds-to-ticks conversion `rows.ts` may not do for itself. **Slice F** adds `Phase.purse` alone, a reference to a `rows.ts` constant. **No `Phase.standing`**, because the standing rows reach the phase through the `rows` column it already has, and no new stage state, because the pick is a function of the cursor. | Slices B and F |
| `src/game/tuning.ts` | Changed | `CORPSES_TO_CEILING` and the reservoir, with the feast identity kept. | Slice C |
| `src/game/lines/wisps.ts`, `src/game/lines/skullStream.ts` | Changed | The two cadence rows and the interval each pays on. | Slice C |
| `src/game/offer.ts` | **Unchanged** | The bank expiry is withdrawn from round one, so no slice opens this file. | **Nobody, by the gates' finding** |
| `src/game/caps.ts` | Changed | `MOB_CAP` and `MOB_FIRE_CAP` as derivations, `peakLive`, and `CORPSE_CAP`'s new addend. Imports `rows.ts` and never `stage.ts`. | Slice D |
| `src/game/rng.ts` | Changed | `StreamName` gains `director`, and #108's two names ride with it. | Slice E |
| `src/game/witness.ts` | Changed | `STREAM_ORDER` gains the new names, the director's state is folded, and `WITNESS_VERSION` moves 6 to 7 in this one commit. | Slice E |
| `src/game/run.ts` | Changed | `RunState.director` and the streams record, both declared in the fold slice so the fold has something real to read. | Slice E |
| `src/game/director.ts` | New | Slice E creates it with `DirectorState` and its initial value alone, because the fold has to read a real type; slice F adds the signal, the spend, the quiet interval and the lock's effect. Returns an add and never performs one. | Slices E and F |
| `src/game/mobs.ts`, provenance | Changed | A `Mob` gains a mark saying which row put it on the field, added in slice E's fold commit so spec test 43 can tell a standing body from a shaped one. **Slice B does not add it** and its `spawnMob` signature leaves no slot for it. | Slice E |
| `src/game/signalLock.ts` | New | The lock as a resolved value, shared by the sim, the header and playback. | Slice G |
| `src/game/events.ts` | Changed | `directedAdd`. It is not on the wire. | Slice F |
| `src/game/step.ts` | Changed | The one call site that asks the director for an add and performs it, and the tick order's own JSDoc naming where it runs. | Slice F |
| `src/game/invariants.ts` | Changed | The purse never going negative; no cap binding. | Slices D and F |
| `src/dev/digest.ts` | Changed | A dated re-pin paragraph and a `GOLDEN` value per slice that moves it, at most five. | Slices A, B, C, E and F |
| `scripts/buildIdentity.ts` | New | The identity the build shells stamp: the Vercel sha, else the described tree with its uncommitted work folded in, else unknown. One module so a bundle and a headless run cannot disagree. **Shipped, and the recipe is not the one this row planned.** `git describe --dirty` was dropped: it reads tracked changes only, so a tree carrying an uncommitted new module describes itself as clean, which is the exact defect `docs/push/divergence-b1c3a584d1.md` records. What shipped is `git describe --always --abbrev=40` plus a dirty marker and a digest over `git status --porcelain --untracked-files=all` and the contents behind it, every command run at the repo top level (`git rev-parse --show-toplevel`) so the answer does not depend on the cwd, which is what `136a349aeb` fixed. | Slice A0, shipped at `26a064a064` |
| `vite.config.ts`, `vite.headless.config.ts` | Changed | The `BUILD_IDENTITY` define, so every runtime that replays knows which build it is. | Slice A0 |
| `src/tape/buildIdentity.ts` | New | The define read once at the tape edge, and the comparison of two opaque strings. It knows nothing about git. | Slice A0 |
| `src/tape/playback.ts`, `src/dev/measure.ts` | Changed | Both identities on the playback result; the attribution on a divergence and the note on a verified reading. | Slice A0 |
| `src/app/tapeHeader.ts`, `src/dev/harnessRun.ts`, `scripts/record-conditioned.ts` | Changed | Every recorder stamps the identity where it wrote an empty string. | Slice A0 |
| `scripts/batch.ts`, `src/dev/batchReport.ts` | Changed | The harness read-back names the mismatch where it prints an unverified run. | Slice A0 |
| `src/app/tapeHeader.ts`, `src/tape/wireCodes.ts`, `src/tape/playback.ts` | Changed | The lock in the header and `FORMAT_VERSION` 3 to 4, in one commit. | Slice G |
| `src/app/seedFromUrl.ts` | Changed | `signalLockFromUrl`, beside the pins already there. | Slice G |
| `src/dev/readings/pressure.ts` | New | The director's run read back off a tape. | Slice G |
| `src/dev/readings/readings.ts` | Changed | Registers `pressure` in every place the graph is declared. | Slice G |
| `src/dev/readings/arrivals.ts`, `gravePath.ts`, `belchCadence.ts`, `timeToKill.ts` | Changed | The rate, the ticks to ceiling, the intervals, and the hit figures split per minute. `timeToKill.ts` already owns "what a mob type cost to kill" per type and per line, so what it gains is the minute the kill happened in and nothing else. | Slice G |
| `src/dev/batchReport.ts` | Changed | The new declarations and the mobs-alive distribution reduction. | Slice G |
| `src/dev/compareRuns.ts` | Changed | A declared comparison meaning for every new reading. | Slice G |
| `src/dev/bot.ts` | Changed | One comment. Its JSDoc at `:38-41` names this step as the autopilot's trigger; it is rewritten to cite the record's decline, so the file stops promising a step that has run. | Slice G |
| `src/dev/framePerformance.ts` | Unchanged | It already reads what round 0 needs; round 0 adds the field to read it off. | Step 1 |
| `scripts/frame-budget.ts` | New | The synthetic field of 100 mobs and 250 corpses, on desktop and on the phone. | Step 1 |
| `src/__tests__/harnessStatesNoTarget.test.ts` | Changed | Every new reading module joins its list. | Slice G |
| `apps/hungry-grave/CONTEXT.md` | Changed | **Nothing is owed to a code slice.** Standing row, Purse, Card and the restated Procession entry landed at `9cba278131`; the restated **Armed** entry landed with slice A; and the second gate round's docs pass rewrote **Standing row** to the stepped one-construct shape and landed **The mow**, **Signal lock**, **Ladder**, the widened **Row** clause and the **Add** clause. **No Bank expiry entry**, because there is no bank expiry. A rename pass follows separately. | Slice A, and the second gate round's docs pass |
| `docs/design/game-concept.md` | Changed | The stage paragraph gains the standing row, and the economy paragraph's density sentence is restated. Cited to the ADRs, dated, and never silently rewritten, because that page is Mark's own wording. | Slice B |
| `docs/adr/` the density ADR | New | The mow: weak bodies bought density, the shambler silent as the mow's cost, the health rows as counts. Titled on the mow, with "one skull" and the touch counts kept out, which is the game design gate's condition. | Step 4 of the order |
| `docs/adr/` the standing row ADR | New | Growth over the run is authored as a rate per section over the one-shot rows. | Step 5 of the order |
| `docs/adr/0034-*.md` | **Unchanged** | The bank expiry is withdrawn, so there is nothing to amend and no supersession to record. | **Nobody, by the gates' finding** |
| `docs/adr/0058-*.md` | Changed | Amended in place: a cadence floor per on-swallow line, beside the freshness axis rather than instead of it. | Step 6 of the order |
| ADR 0056's named trigger, pulled | **No ADR edit** | The signal lock is a value a run resolves for a tuning experiment, which is the case ADR 0056's amendment already named and ruled. Applying a rule is not amending it, and the purse stays pinned to the build. | Slice G, recorded in the branch note |
| The Undertaker deadlock, #118 | **Not built as its own work** | Folds into slice F or the boss row: boss phases author no adds, so the food economy starves there and the mow makes it worse. **Owned with a trigger:** slice G makes the ceiling-stop count a reported reading, and slice F is where the fix lands if the reading says the cause is the food. If the reading says the cause is elsewhere, it stays #118. | Slice G reports it, slice F owns the fix |
| #108, two draw sites on shared streams | **Rides with slice E** | The boss's ring and the set piece's pour each want their own name, and both moves land on `WITNESS_VERSION`. Riding with the fold slice means one bump rather than two. If slice E proves too large with them in, they come out and #108 stays open with its own trigger. | Slice E |
| The dev-only autopilot in the rendered game | **Not built, and the decline is now written down** | ADR 0013 makes the same bot the dev-only autopilot and `bot.ts:38-41` records that it is not wired in and names this step as the trigger. **The trigger has fired and this plan declines it**, because watching a hand play is not a reading and the batch is, and the bot only dodges. The record's section 6 carries the decline and slice G updates the comment to cite it, so the code stops pointing at a step that has run. | **Declined with a reason, comment owned by slice G** |
| The named persona roster | **Not built** | ADR 0053 holds it until friends' tapes exist. **Unowned, off the road.** | **Unowned, off the road** |
| A committed fixture tape | **Not built** | #109. This step re-authors every row, which is exactly when a fixture tape would have had to be regenerated, and there is none. **Unowned, #109 owns it.** | **Unowned, #109 owns it** |
| The store's policy column | **Not built** | #100. The tape bytes carry the policy already. **Unowned, #100 owns it.** | **Unowned, #100 owns it** |
| #116, the lapse depth's tail | **Not built** | The harness's own row, and the record's standing rule is that the hand's rows are never tuned with the game's. **Unowned, #116 owns it, and this step must not touch it.** | **Unowned, #116 owns it** |

**Where the rows live, and the direction of the arrows (the tech architecture gate).** The standing rows, the card table and the three purses live in `rows.ts`, which value-imports nothing, so `caps.ts` can derive from all of them while importing only that one module. `stage.ts` wires them onto `Phase` by reference, exactly as it already wires in `PROCESSION_ROWS`. The cadence floors live in each line's own module; the director's signal constants live in `director.ts`; the lock's type lives in `signalLock.ts` because the sim, the header and playback all read it; the caps live in `caps.ts` as derivations rather than as numbers. **`caps.ts` never imports `stage.ts`**, in either direction and by neither a value nor a type import: `stage.ts` imports `mobs.ts` and `mobs.ts` imports `caps.ts`, so that edge is a cycle. Nothing outside a module indexes another's rows.

**No module this step adds names a weapon line.** The director reads mob types and pressure and never `state.levels`, which is the standing extensibility constraint and what makes ADR 0047's "reads pressure, never power" mechanical rather than a promise. `lineAgnosticPolicies.test.ts` gains `game/director.ts` to its list.

---

## 6. Planned test list

Every test is written as a `test.todo` placeholder against a stub before implementation. Spec tests come from the design record and the ADRs first, and a failing spec test indicts the code rather than the test.

### Spec tests from the ADRs and the record

**`src/game/__tests__/mobs.test.ts`** (extended)

1. *A shambler dies to one skull at the run's first minute.* Pins the mow ruling: density is bought with weak bodies, never tough ones. The minute is in the name because the count is a data row on a curve and not an invariant (Mark's ruling of 2026-09-09).
2. *A ghoul dies to three skulls and a revenant to eight, at the same minute.* Pins the two rows that do not move, so the mow is a change to trash and not to the roster.
3. *The shambler never fires.* Pins the record's section 5 item 1 and ADR 0059: the mow body is a different thing from a shooter with worse odds.
4. *The revenant is the only trash type that fires.* The other half, held as its own promise so the roster split survives a later type being added.

**`src/game/__tests__/touchCounts.test.ts`** (re-expressed)

5. *Each line's touch count against each body at the run's first minute is what the mow's initial data rows say it is.* The re-expression of the #76 pass A pin, in the same motion as the ruling (ADR 0059, landed at `9cba278131`), computed from the real exported constants against the real health rows exactly as it is today. **What it pins is where the curve starts and never an invariant**, because weapon damage steps with the rungs and a body costs fewer hits every minute the ladder climbs.
6. *The bell's far edge takes more tolls than its near edge, in the ratio the record states.* Pins ADR 0036's far-edge-tickles ruling as a ratio, which is what survives the health move.

**`src/game/stage/__tests__/rows.test.ts`** (extended)

7. *A standing row puts bodies on the field at its own rate and the one-shot rows keep their times.* Pins ADR 0047's "the rows stay the floor": a standing row is a second floor and never a replacement.
8. *Consecutive standing rows step the rate at their own times, and a standing row ends at the next row of any kind.* Pins ADR 0060 as re-ruled: growth is authored as stepped standing rows rather than as a ramp, each starts at its own phase-local time, and nothing anywhere reads a section's length. **The second half is the one the tech architecture gate asked for**: no phase that ends on `rowsSpentAndFieldClear` has a standing row live at its last row's time, and a section's last standing row ends before its sparse last row begins. A rate still arriving under the sparse last row is a field that never clears, so the Banshee never arrives (ADR 0051, `stage.ts:101`, `:151`, `:253-258`).
8a. *A row with no repeat fires exactly once, on its own tick.* Pins one construct and one list: every row in the tree today is the same shape with `repeat` unset, and `repeatingArrivals` answers for it without being told which kind it is.
9. *A row's repeat interval shrinks by its own step and never below its minimum.* Pins Brotato's `repeating_interval`, `reduce_repeating_interval` and `min_repeating_interval`, which is the half of the shape precedent agreed with.
9a. *The Crowd's trough is a standing row somebody authored and not a dip in a curve.* Its middle standing row carries a lower figure than the rows either side of it, and there is no expression anywhere that produces a dip.
10. *The Procession's first standing row puts nothing on the field until its teaching rows have fired.* Pins the game design gate's finding: the first swallow and the first mob fire each arrive alone, and the mow starts behind them.
11. *`repeatingArrivals` is a pure function of its arguments, and a standing row fires once on its own tick.* Called twice for the same time it answers the same count, and the stage carries no cursor for a repeating row. The tech architecture gate's finding, held as a test because a folded cursor would be a second source of truth for a number the time already determines. The second half is the other side of that: the row's first group is fired by `firedRows` as a one-shot row's is, so `repeatingArrivals` answers zero at the row's own time and nothing double-fires.
12. *No row in the Vigil's table carries a repeat, and no standing row anywhere carries.* Two deliberate-absence guards, both mechanical under the one-construct shape. The Vigil owns scarcity and a standing row in it would pass a corpses-per-second reading while feeding better. And a standing row that carried would hand out rungs at a figure nobody wrote down, against twenty-five authored carriers that are the ladder's whole supply (ADR 0048).
13. *The Vigil pays less food per second than the Crowd.* Pins the property itself, in the quantity the stage-floor record corrected it to, so item 12's absence is guarded by the thing it exists for.
14. *The Procession's first mob fire is a lone revenant Drip.* Pins ADR 0016's readable-before-it-acts and the teaching row the silent shambler displaced.
15. *The Wall is still the one authored row the director may not add over.* Pins ADR 0047's third off-limits moment through the data rather than through code.
16. *A card costs the sum of its bodies at the table's per-body cost.* Pins the game design gate's ruling that an add is a card and never a body.
17. *The Vigil's purse is zero and the Procession's and the Crowd's are not.* Pins the Vigil's scarcity as a purse rather than as a rule inside the director, and pins zero as a real figure rather than the absence a null would be.

**`src/game/__tests__/tuning.test.ts`** (extended)

18. *A fully fresh feast fills the reservoir exactly and wastes nothing.* Pins decision 5.11 and the identity `RESERVOIR_CAPACITY` is written as.
19. *The ceiling is reached in the corpses the economy row names and not in a tenth of them.* Pins the record's section 5 item 4 as a relation rather than as a figure.

**`src/game/lines/__tests__/` per line, and `roster.test.ts`** (extended, in the economy slice)

19a. *Each line's climb over its five rungs is the one that line's own row states, and it is read per line.* Pins the record's section 5 item 4 and ADR 0005, which gives each line its own levels: there is no band shared across lines, because Territory and the bell buy area and repel rather than damage, so a single multiple held over all four would be a rule the roster does not have. Each line states its own climb, or the batch reads it; the precedent it is set against is `docs/research/weapon-growth-per-level-precedent.md`, **research in flight at the time of writing**, beside `survivor-numbers.md`'s worked tables.
19b. *The first rung buys more than an even share of a line's climb.* Pins the same record's finding that the first upgrade is the one the player must feel: Garlic's level 2 is the biggest area step in its own table.
19c. *No line buys its climb with a bare damage number.* Pins the axis finding, and it is a promise the tree already keeps: `COLUMNS_BY_LEVEL` buys columns (`skullStream.ts:22`), the wisps buy souls and the bell buys cones, which is the genre's headline axis rather than its filler one. Held as a test so a later line cannot quietly become a damage curve.

**`src/game/lines/__tests__/wisps.test.ts`** and **`skullStream.test.ts`** (extended)

20. *Two swallows inside the volley interval fire one volley.* Pins the cadence floor.
21. *A volley skipped by the interval is not banked for later.* The deliberate-absence half: a banked volley would pay a stale corpse's freshness on a fresh corpse's tick.
22. *A swallow during a running surge extends it toward the cap rather than starting a second.* Pins the glossary's Surge rule that a chain overwrites rather than banking a queue.
23. *Freshness still scales the wisp count with a floor of one soul, and the surge's volleys and never its columns.* Pins ADR 0058's freshness axis surviving the amendment untouched.

**`src/game/__tests__/caps.test.ts`** (extended)

24. *Every cap is above the worst case the stage's own data describes.* Pins ADR 0056's "a phase's worst case is its floor plus its budget, which is a number in data".
25. *The mob cap's standing-row term is the rate times an unkilled body's time on the field, and not the rate.* Pins the tech architecture gate's finding: a peak taken from arrivals alone binds the first time nobody kills anything.
26. *The mob cap's director term is the largest single card and never a phase's purse.* Pins the same gate's finding that a purse-sized addend sizes the pool for a moment the quiet interval forbids.
27. *The mob-fire cap is above the revenant peak plus the worst boss pattern in the air at once.* Pins that boss fire and trash fire share one pool (`mobFire.ts:107`).
28. *A bound cap raises a fault and removes nothing from the field.* Pins ADR 0056 and the code's own rule, and it is the guard that makes the mow's density safe rather than lucky.
29. *No corpse is ever taken off the field to make room for another.* Pins #85's acceptance line and ADR 0056, held as its own promise.

**`src/game/__tests__/witness.test.ts`** and **`rng.test.ts`** (extended, in the fold slice)

30. *The overlap search covers every stream a run holds, the new names included.* Pins ADR 0012, over a list derived from `createRun(0).streams` rather than hand-kept, which is how #113 was closed.
31. *The run holds exactly its own streams and the witness folds exactly those.* Pins ADR 0019's closed field list at the version this step moves it to.
32. *The witness folds the director's state.* Pins ADR 0019: a replay that could not rebuild the director would be a replay of a different run.

**`src/game/__tests__/director.test.ts`** (new file)

33. *The signal rises on harm and on a floor event and on nothing else.* Pins ADR 0056's own wording.
34. *A kill beside the grave never raises the signal.* The deliberate-absence guard, and the one Vermintide shipped and Darktide deleted. It is the difference between this director and a rank system.
35. *A locked signal never moves, whatever the tick's events.* Pins the lock's whole purpose: the gate and the population are tuned against a held signal.
36. *The director never reads a weapon level.* Pins ADR 0047's "the signal is the pressure the player is under, not the power the player holds", mechanically.
37. *The director adds nothing while the signal reads high.* Pins ADR 0056's spend condition.
38. *The director goes quiet for a drawn interval after every add.* Pins the quiet interval, which the research names as the part that does the work.
39. *What the director returns is a card and never a loose body.* Pins the game design gate's ruling, and it is what keeps a directed arrival a shape the player can read.
40. *A phase whose purse is spent runs at its authored floor for the rest of its length.* Pins ADR 0056's "the storm is seen to win", and #85's acceptance line that a spent purse is visible.
41. *The director spends nothing in the Vigil.* The purse-of-zero case, held apart from the spent-purse case, because zero from the first tick and zero from spending are different runs and a reading has to tell them apart.
42. *The director adds nothing during a boss phase, the sparse last row, the Wall or the set piece.* Pins ADR 0047's four off-limits moments, and it reads them off the phase's and the row's own data.
43. *A standing row's arrivals never count against a section's ceiling.* Pins that the rows are the floor: the Procession's live-template ceiling bounds what the director adds and not what the section authors.
44. *The director never adds past a section's own ceiling.* Pins the Procession's live-template ceiling and the Vigil's live-body ceiling as gates on the spend.
45. *The director never places a carrier.* Pins the glossary's Director entry: it can never hand out power.
46. *The director never removes an authored body.* Pins ADR 0047's "the rows stay the floor": lowering is withholding what it would have added.
47. *Two runs on one seed with the same inputs rebuild identically, every directed add included.* Pins ADR 0047's binding replay constraint and #85's acceptance line.
48. *The director's draws never move any other stream's cursor.* Pins ADR 0047's own-seeded-stream requirement, and it is the property #108 exists about.

**`src/game/__tests__/signalLock.test.ts`** and **`src/app/__tests__/seedFromUrl.test.ts`** (new file and extended)

49. *A run with no lock in its URL resolves the value that means the signal ran live.* Pins ADR 0027: the header records what the run started from and never an absence.
50. *A lock the URL states resolves to that figure, and the header records it.* The other half.
51. *A lock the module cannot use is warned about once and ignored, and the run plays.* Pins `seedFromUrl.ts`'s own standing rule for a fat-fingered value.
52. *A format 3 tape is refused by its version rather than at a checkpoint.* Pins what the `FORMAT_VERSION` move costs, stated as a test so the cost is visible rather than discovered.

**`src/dev/readings/__tests__/pressure.test.ts`** (new file)

53. *A run's signal can be read back off its tape and drawn against every add and its tick.* Pins #85's acceptance line as an instrument.
54. *The reading is computed from events and never from the director's own state.* The guard that stops the instrument agreeing with the thing it measures by construction.

**`src/dev/__tests__/batchReport.test.ts`** (extended)

55. *Mobs alive reports as a distribution over ticks beside its peak.* Pins the record's section 7: a peak says the worst tick and the mow is about the ordinary one.
55a. *Hits to kill report by the minute the kill landed in, per trash type.* Pins the record's section 7: a figure over a whole run cannot see the per-rung weapon climb eating into what a body costs, and this reading is the trigger the record's section 12 item 6 hangs on.
56. *A batch says how many of its runs stopped at the tick ceiling.* Pins #118's first acceptance criterion.
57. *No reading the report prints is stated as a target.* Pins ADR 0053 through the fence that already exists.

### Module tests

58 to 72, one group per new module: `repeatingArrivals` at its bounds (a row with no repeat, an interval of one tick, an interval already at its minimum, a time before the row's own, a time inside the teaching rows, and a section's last standing row running out at its sparse last row); `cardCost` over a card of one body and over the largest card in the table; the signal's decay at its hold boundary and at its decay end; the quiet interval's draw at its minimum and its maximum; the purse at zero, at null and at one card's cost minus one; `peakLive` over a stage with no standing rows; the lock at its bounds and at the value that means live; the pressure reading over a tape with no adds; and the new reductions over an empty series, which every existing reduction already guards.

### Invariants and the architecture fence

73. *The purse never goes negative.* An invariant, always on (ADR 0023), because a negative purse is a bug and a bug fails loudly.
74. *`game/director.ts` names no weapon line.* Fence, in `lineAgnosticPolicies.test.ts`.
75. *`src/game` imports nothing from `src/dev`.* Fence, unchanged, and the reason the director's instrument is a reading rather than a hook.
76. *`game/caps.ts` imports nothing from `game/stage/stage.ts`.* Fence, and it is the tech architecture gate's finding made mechanical: `stage.ts` imports `mobs.ts` and `mobs.ts` imports `caps.ts`, so that edge closes a cycle. A type-only import satisfies a bundler and fails this test on purpose.
77. *Every new reading module is in `harnessStatesNoTarget.test.ts`'s list.* Fence.
78. *Every new reading has a declared comparison meaning.* Fence, `comparisonDeclared.test.ts`.

---

## 7. Constants changed, with every reader

Each list is the full grep across `src` and `scripts`, excluding `src/prototypes/` (ADR 0010).

**`MOB_TYPES.shambler.hp` (`mobs.ts:76`): 40 becomes 8.**
Readers of the field: `touchCounts.test.ts` (four assertions against all three types), `mobs.test.ts:162-164`, `caps.ts`'s derivation prose, `bell.ts:110` and `:113`'s worked comments, `territory.ts:132`'s comment, `mobs.ts:60-66`'s own derivation paragraph, and every design record that states a touch count. The derivation paragraph at `mobs.ts:60-66` is the one that must be rewritten rather than renumbered: it says 40 is the smallest health that five skulls, four wisps, eight far tolls and one near toll all divide, and every one of those counts is what the mow ruling supersedes.

**`MOB_TYPES.shambler.fire` (`mobs.ts:81-88`): an inline `FireRow` becomes `NEVER_FIRES`.**
Readers: `mobFire.ts`'s `isArmed` (`:129-133`) and every armed-share path; `templates.ts:23-28` and `mobFire.ts:114`, which key the armed share to `SpawnOrder.index`; `rows.ts:125-126`'s teaching-row rationale; and the glossary's Armed entry. **The carrier is deliberately not keyed to that index** (`stage.ts:267-271`, `carriers.ts:57-70`), so nothing about which body carries moves with this.

**`CORPSES_TO_CEILING` (`tuning.ts:96`): 80 becomes about 400.**
Readers: `TRASH_CORPSE_PAYOUT` (`tuning.ts:99`), and through it `FEAST_PAYOUT` (`:102`), `RESERVOIR_CAPACITY` (`:109`), the revenant's `2 * TRASH_CORPSE_PAYOUT` (`mobs.ts:94`), the drop's payout (`corpses.ts:246`), `swallow.ts:83`'s `paid`, and every reading that prints a size. **This is the constant with the widest quiet blast radius in the step**: it is the denominator of the whole food economy, and a plan that changed it without this list would move the feast, the reservoir and the revenant's corpse together without saying so.

**`RESERVOIR_CAPACITY` (`tuning.ts:109`): stated in corpses, from 9 to about 300, and it stays written as `FEAST_PAYOUT`.**
Readers: `belch.ts`'s full-reservoir condition, `swallow.ts:95`, the HUD's reservoir readout, `bot.ts`'s belch rule, and the harness's `belchWorthIt` row. The identity is what is load-bearing: a plan that wrote a number here instead would break the Wall's choreography silently.

**`WISP_CAP` 64 and `SKULL_CAP` 120 (`caps.ts:131-132`): unchanged, and they are the reason the cadence floor exists.**
Readers: the two lines' own spawn paths. They are stated here rather than changed, because raising a cap to fit an unfloored volley rate is exactly the tuning-knob use of a cap that ADR 0056 forbids.

**`MOB_CAP` (`caps.ts:32`) and `MOB_FIRE_CAP` (`caps.ts:33`): constants become derivations.**
Readers: `caps.ts:60` (`CORPSE_CAP`'s first term), the mob spawn refusal path, the mob-fire refusal path, `invariants.ts`, `caps.test.ts:155-156` and `rows.test.ts:303-305` (which pin the corpse-cap identity), and `bot.test.ts`'s density figures. The corpse cap's identity tests are what keep the derivation honest when the first term stops being a literal.

**`StreamName` (`rng.ts:4`): five members become six, or eight with #108 riding.**
Readers: `STREAM_ORDER` (`witness.ts:23-31`), `RunState.streams` (`run.ts:108`), `rng.ts:71`, `rng.test.ts`'s derived overlap list, and `witness.ts`'s fold. Adding a name is append-only in `STREAM_ORDER` by that list's own rule.

**`WITNESS_VERSION` (`witness.ts:41`): 6 becomes 7, once, in the fold slice.**
Readers: `tape/playback.ts:121`, `:167`, `:266`; `app/tapeHeader.ts:82`; `dev/harnessRun.ts:116`; and every test header literal. It is stamped in the same commit that declares the new folded fields, per the lesson that a version stamped before the fold stops moving names several folds, and the fold slice exists so that commit has nothing else in it.

**`FORMAT_VERSION` (`wireCodes.ts:36`): 3 becomes 4, once, in the instrument slice.**
Readers: the encoder and decoder either side of the header (`tape/`), `app/tapeHeader.ts`, `dev/harnessRun.ts`, the store's own writer, and every test header literal. It moves because the header gains one field, the signal lock, which is a value a run resolves for a tuning experiment: ADR 0043 decides header-or-build and puts it in the header, and ADR 0027 rules the form it takes there. **Corrected 2026-09-09: it is not ADR 0056's trigger firing.** That trigger names the budget and only the budget. **The purse does not move it**: the purse is authored stage data, so the trigger is unfired and the step 3 record's closure of ADR 0056's open question holds untouched. What the move costs is that every format 3 tape is refused outright, which is a cost this step has already paid twice over through the rows.

**`READINGS_VERSION` (`readingsVersion.ts:38`): does not move.** Adding a reading beside unchanged ones does not bump it, and every figure the existing readings printed still means what it meant. Stated here rather than left implicit, because a bump would make every step 3 reading incomparable with every step 4 one for no reason.

**New rows, every one initial.** The Procession's and the Crowd's standing-row figures and the phase-local time each starts at, with their repeat intervals, steps and minimums; the per-rung figures each line's climb is set to; the shaped rows' doubled counts; the wisp volley interval and the surge duration cap; the three section purses, the Vigil's being zero; the card table and the three per-body costs; the quiet interval's two bounds; the signal's hold and decay. Their homes are section 5's last paragraph and the record's section 9. **`BANK_EXPIRY_TICKS` is not among them**, because the expiry is withdrawn. **And no `authoredSpanTicks` and no standing-row constants**, because a standing row carries its own time and is a row.

---

## 8. Craft calls, each backed by evidence

The full argument for each is in `mow-ladder-director.md`; what is here is the call, its evidence in one line, and the record's section.

**The shambler goes silent rather than lightly armed.** Record section 5 item 1: at eight bodies a second even one in ten is 48 shooters a minute, and the glossary's own reason for an armed share is that picking targets is a skill only if the player can see which mob to pick, which nobody can do inside a mow.

**Trash health lands on 8 rather than on a rescaled everything.** Record section 5 item 2: 8 gives an exact one-skull kill against today's damage rows without turning four damage rows into floats. **The hit count is an initial data row and not an invariant** (Mark's ruling of 2026-09-09), so it is where the curve starts and the batch moves it.

**Growth is stepped and never a ramp, and nothing measures a span.** Record section 5 item 3 and `docs/research/naming-the-authored-growth-rate.md` section 5: four survivors-likes with visible structure hold a fixed figure for as long as one authored entry stands and step it at row boundaries, and Mad Forest's own `frequency` column, milliseconds between spawn ticks, is deliberately non-monotonic. A standing row carries its own phase-local time and ends at the next row of any kind, so `stage.ts:51`'s rule that no phase carries a length costs nothing here rather than having to be worked around.

**A repeating row is an ordinary row with its repeat fields set, and never a second kind of row.** Record section 5 item 3, and the same research record's Open items: no shipped format found makes the continuous case a separate kind of entry. Vampire Survivors puts `frequency` and `bosses` on one per-minute object, Brotato puts `repeating_interval` and `is_boss` on one `WaveGroupData`, and Taisei writes both as the same task. ADR 0047 already rules the authored rows are the floor; what widens is what a row may be, and the glossary's Row entry gains a clause rather than the glossary gaining a parallel definition.

**No trash stat steps on the clock, and the strike is the call.** Record section 5 item 3: the 0.05 and 0.005 figures are Mad Forest's Inverse mode, normal Mad Forest carries no `TimeMods` and climbs by enemy type substitution (`docs/research/survivor-numbers.md:87`, `:98`, `:123`), and ADR 0059 rules growth as more enemies and harder ones. Six Vampire Survivors stages do inflate in normal mode, from 0.10 to 0.25, so the precedent is real on both sides; what settles it here is Mark's ruling, and the record's section 12 item 6 carries the reading that would reopen it.

**Weapon growth per rung is set from a shipped weapon level table.** Record section 5 item 4 and `docs/research/survivor-numbers.md`: damage roughly triples to quadruples over a weapon's whole climb, damage is the filler axis rather than the headline one, and the first upgrade is the one the player must feel. The tree already agrees with the axis half, because a line buys columns, souls and cones rather than a damage number (`skullStream.ts:22`), so what the slice sets is the size of the climb and the shape of its first step.

**The word is standing row rather than the brief's floor stream.** Record section 5 item 3 and section 10: a stream is a named seeded random stream and the skull stream is a weapon line, and the stage-floor record set the precedent by retiring "Lane" and "Descent" for the same collision. It is the brief's concept with a different word, and **the word is settled by research rather than by preference**: `docs/research/naming-the-authored-growth-rate.md` ran every borrowable noun in both parent genres against the glossary and found each one either spent or pointing both ways, with "repeating row" the runner-up on Brotato's own field name and "trickle row" the only uncollided genre word, losing on magnitude.

**The Vigil takes no standing row.** Record section 5 item 3: the section owns scarcity, the quantity is food per second rather than corpses per second, and Vampire Survivors' own table ships a minute of this shape deliberately.

**The bank is left alone and the ladder is read instead.** Record section 5 item 5: one bank in 48 sharp-hand runs and none under the sloppy hand, and `loseOffer`, `resolveOffer` and `openBankedOffer` between them open the bank on the tick it is made (`offer.ts:295-299`, `:309-327`, `:337-346`), so an expiry would fire only where a phase withheld permission or a cap bound. It would punish fast carrier kills rather than offers left standing.

**The teaching rows fire before the mow starts.** Record section 5 item 3: the Procession's first swallow and the game's first mob fire each have to arrive alone to be readable (ADR 0016), and it keeps ADR 0015's 600-tick scenario roughly the field it has, which that ADR asks of it by name.

**An add is a card and never a body.** Record section 5 item 6: a card is a template group, so a directed arrival is a shape a player can read, and the cost of one is the sum over its bodies.

**The Vigil's purse is zero rather than null.** Record section 5 item 6: null is a phase the director may not touch, zero is a phase it may touch and finds empty, and the Vigil's scarcity is a property of the section rather than a permission, so it reads as an empty purse.

**The card table and the purses live in `rows.ts`.** `rows.ts:3-4` are its only imports and both are `import type`, while `stage.ts:7` imports `mobs.ts` and `mobs.ts:4` imports `caps.ts`: putting the tables on `Phase` would make the caps derivation close a cycle.

**The cap derivation reads a lifetime and not a rate, and counts the bosses.** Record section 5 item 7: what is alive is what arrived and has not died or left, and `fireDirectedShot` puts boss patterns in the same pool the revenants use (`bosses/banshee.ts:125`, `bosses/undertaker.ts:233`).

**The witness fold widens in its own slice.** The lesson at `docs/lessons.md`, The sim, requires the version and every new folded field in one commit; giving that commit nothing else to do is what makes it reviewable, and it lets the director slice be about the director.

**The wisps floor an interval and the stream extends a surge, and the asymmetry is deliberate.** Record section 5 item 4: the glossary already rules that a chain overwrites an unspent surge rather than banking a queue, and extending is what overwriting becomes once a chain is the normal case.

**The director returns an add and never performs one.** Record section 5 item 6, ADR 0017: it makes the spend testable without a tick loop and keeps the spawn where every other spawn is.

**#108 rides with the fold slice.** Two draw sites want their own names, both moves land on `WITNESS_VERSION`, and the brief says the version goes 6 to 7 once. Riding is what makes "once" true. If the slice proves too large with them in, they come out and #108 keeps its own trigger.

**The signal lock goes in the header now rather than later.** Record section 8: this step already turns every saved tape into a dead baseline, so the second refusal costs nothing the step is not paying, and deferring it would spend that cost twice.

**The instrument is built before the tuning.** Record section 5 item 6: the research's strongest cross-game finding, and #85's own acceptance line asks for the same thing.

**The batches read `steady-far` and `loose-far`.** The brief's choice, because the sloppy corner reached the Undertaker on 0 of 48 seeds. It is #117 and it is Mark's, so every finding says which two configurations it agreed across.

**Two claims in the record found soft against the tree**, both restated from section 0 so a reader of this section alone sees them:

- **`GOLDEN` re-pins up to five times and not once.** The witness folds mob health and each mob's carrier flag, the grave's size and reservoir, and every stream cursor, so five slices are permitted to move it: the mob table, the re-authored rows, the economy rows, the widened fold and the director. The discipline that makes each move deliberate already exists as eight dated paragraphs in the constant's own JSDoc (`digest.ts:264-312`). A re-pin in one of those five is expected and never a stop-and-report; a re-pin anywhere else is.
- **`touchCounts.test.ts` is a red test this step must turn deliberately.** It pins the counts the mow ruling supersedes, and its own JSDoc says a pinned count changes only by an explicit ruling in the same motion as the ruling. **The stop condition is discharged: ADR 0059 landed at `9cba278131`, ahead of slice A**, which is what step 4 of the order being ahead of step 7 was for.

---

## 9. Anything that would be a new commitment rather than a craft call

Five, all carried from the record's section 11, all taken under their recommended defaults, all filed in their own step, and all Mark's to overrule on the branch before merge. **One-push mode: they reach him in the session recap and no step below waits on the answer.**

1. **The on-swallow cadence floor widens ADR 0058**, which carries no cadence limit of any kind today. **Filed: ADR 0058 amended in place at `9cba278131`.**
2. **The shambler never firing retires the armed share on the mow body**, moving "which mob to pick" from inside a row to between mob types. The game design gate has seen it and its condition is in step 4 of the order. **Filed: ADR 0059 at `9cba278131`.**
3. **The standing row widens what a Row is**, from a phase-local time to a row that fires again on an interval. **Filed: ADR 0060 at `9cba278131`, and re-ruled in place in the step 2 docs pass.** The re-ruling made it a smaller commitment than the one filed, repeat fields on the row that already exists rather than a second row type. **The per-minute stat step it also added was struck in the second gate round**, so no stat commitment stands.
4. **`WITNESS_VERSION` moves from 6 to 7**, which the step 3 record's pin permits because the pin was about the harness never being the cause, and this cause is a sim-side stream ADR 0019 requires folded. **Stands: unfiled and unbuilt, slice E owns it.**
5. **`FORMAT_VERSION` moves from 3 to 4** for the signal lock. **Corrected 2026-09-09: it is not ADR 0056's trigger firing**, because that trigger names the budget and the purse stays pinned to the build; the lock reaches the header on ADR 0043 with ADR 0027 ruling its form. Decided by the session on the tech architecture gate's finding, and taken now because the step has already made every saved tape a dead baseline. **Stands: unbuilt, slice G owns it.**

**Withdrawn rather than committed to: the bank expiry.** It was the second item on this list, that an expiry reverses a property ADR 0034 leaves standing. The gates withdrew it from round one on the measurement, so there is no commitment, no amendment and no slice.

**Three things this plan adds that are not commitments.** The `directedAdd` event payload, which is not on the wire and which ADR 0047 already rules everything about. `Phase.purse` as a column pointing at a constant in `rows.ts`, which ADR 0056 already rules as data, and it is one column and not two because there is no `Phase.standing`. And the mobs-alive distribution beside its peak, which is a reduction and not a reading.

---

## 10. Slices, gates and ADRs, in one order

Each coding slice is one commit: its tests, its minimal implementation, and its glossary entry or record amendment where section 5 names one. Each ends green on `pnpm typecheck` and `pnpm vitest run` before the next begins. CodeRabbit CLI runs before each code commit. The test-name diff runs on every slice. One Opus coder per slice, one at a time on the branch, each handed the full dispatch contract: an instruction to read `docs/agents/feature-playbook.md`, the definition in observable terms, the verification steps with their actors, the seams under test, the module boundaries, and the planned test list. **A coder handed a slice missing any of those stops and reports rather than filling the gap itself.**

**The ADR steps are steps in this order and not side notes.** Three of them, before any code, each one ahead of the slice that needs it. That differs from step 3's practice of amending each ADR in the slice that builds it, and the reason is that the record's surfaced commitments want one review point rather than several scattered through seven commits. **No step waits on a person (the product vision gate).** The ADRs are the session's call under one-push mode and Mark reviews them on the branch before merge; the one gate that runs ahead of a filing is the game design gate on the density decision, which is Mark's own ruling and which has already run.

**Step 0. Baselines, and one piece of evidence that this step destroys.** Before any edit: `pnpm vitest list --json` to `local/step4/tests-baseline.txt`; two tapes recorded at the tip and saved outside the repo; the current `GOLDEN` and the step 3 batch report kept as the dead baseline section 8 of the record names. **And the divergence evidence (the tech architecture gate), which is already captured:** `docs/push/divergence-b1c3a584d1.md` holds it, written at this tip on 2026-09-09. Seed 1445730872, first divergent checkpoint 16440 against a recorded witness of 764456418 and a recomputed 1741200866, the checkpoint before it agreeing, so the true first divergent tick is inside 16381 to 16440. Step 0 checks that file is present and reads it; it does not re-derive it. The reason it had to exist before any edit is that after slice A the tip cannot reproduce that run at all, so a question Mark has ruled cannot be allowed to fail would become unanswerable. No commit.

**Step 0a. Slice A0: the tape carries a build identity that a dirty tree changes (#82). DONE, shipped at `26a064a064` and fixed at `136a349aeb`.** Before slice A moves a single row, because step 4 records tapes at seven tips in a row and every one of them will be asked which build recorded it. **What shipped differs from what this step planned in one place, and it is the recipe:** `git describe --dirty` was dropped because it reads tracked changes only, so a tree carrying an uncommitted new module would describe itself as clean, which is the defect the divergence note records. What shipped is `git describe --always --abbrev=40` plus a dirty marker and a digest over `git status --porcelain --untracked-files=all` and the contents behind it, every command run at the repo top level so the answer does not depend on the cwd. It put a **Build identity** entry into `CONTEXT.md`.

*Definition, in observable terms.* The build identity stamped into a tape header changes when the working tree is dirty, so two tapes recorded on the same commit with different uncommitted rules carry different identities. The playback verification result carries both the tape's identity and the running build's. When the two differ and the replay diverges, the report attributes the divergence to the build mismatch and names both identities rather than reporting a bare divergence. When they match and the replay diverges, the report is the plain divergence it is today. When they differ and the replay verifies, that is verified with a build note and never a refusal: the witness version stays the rules identity (ADR 0019), and a rules-identical build must keep replaying a player's tape because replay is a shipped feature (ADR 0020). Nothing about a mismatch is silent. The measure script and the harness read-back surface the attribution where they print a divergence today.

*Why it is here rather than inside slice A.* `docs/push/divergence-b1c3a584d1.md` cost two agents a day attributing a divergence whose whole cause was a header label nobody could check: the tape named commit `b1c3a584d1` and the recording build was that tree with adjustment 4's code still uncommitted. That note's own closing section names this as the cheapest step toward all three things a test of same-build replay would need, and #82 is already open on the missing dirty marker.

*Verification steps, actor: agent.* `pnpm vitest run` and `pnpm verify` green. A short bot tape recorded on the current tree, replayed, showing a verified result with matching identities. A throwaway uncommitted change to one shambler health row, a second tape recorded under it, the change reverted, and that second tape replayed on the clean tree, showing the report attributing the divergence to the build mismatch with both identities named; the throwaway tape is then removed from the tree. The three format 3 tapes from Mark's Downloads folder, copied to a scratchpad and never written back, still verifying, with the build note where their identities differ.

*Seams under test.* The tape header's build identity field, encoded and decoded; the playback verification result type; and the measure script's printed report.

*Module boundaries.* The identity string is produced in the build shell, from the Vercel environment variable or from git, and parsed at the tape edge exactly once. The core replay compares two opaque strings and knows nothing about git. No new dependency. **`FORMAT_VERSION` does not move**, because `buildIdentity` is already a header field (`tape.ts:114`, written at `segments.ts:94`, read at `records.ts:113-114`) and empty on every tape recorded so far, so what changes is the content of a slot the format already has; verification step 7a's single move, 3 to 4 in slice G, still stands. **`GOLDEN` does not move**, because nothing inside the fold changes, and the count of re-pinning slices stays five: A, B, C, E and F.

*Planned test list.* A tape whose recorded build identity differs from the running build's and whose witness diverges reports a build-mismatch attribution naming both identities. A tape with a matching identity and a diverging witness reports a plain divergence. A tape with a differing identity that verifies reports verified with a build note. The identity encoder marks a dirty tree. A tape carrying no identity at all, which is every tape recorded before this slice, still decodes and still verifies.

One commit, after the CodeRabbit CLI review of exactly that change.

**Step 1. Round 0, the frame budget. DONE on desktop, shipped at `c23be6156c` with the pool refusal at `3594fe154a`.** `scripts/frame-budget.ts` stands a synthetic field of 100 mobs and 250 corpses and reads it through `framePerformance.ts`, on desktop through `vite preview` and on the phone from the first deploy. **Its numbers land in the record's section 4 slot and nowhere else, and nothing below is sized against a guess.** **It produced one finding slice D owns: the shipped caps cannot stand three of its six fields**, because `MOB_CAP` is 160 and `CORPSE_CAP` is 233, and the instrument refuses a field the pools cannot hold rather than quietly measuring a smaller one. The phone half is still owed and it is Mark's. Ran in parallel with step 2. One commit, tests and shell.

**Step 2. The records, grilled.** This plan and `mow-ladder-director.md` through `/grilling` paired with `/domain-modeling`, which is where the glossary words in section 10 of the record are challenged and where the standing-row naming call is settled. **What this step folds into the records is new design and step 3 gates it.** That is a different fold from the witness fold, which is slice E's and which the implementation gates see at step 14; the two share a word and nothing else. One commit, docs only, ticket numbers in the message.

**Step 3. The three gates on the records, and the findings folded in.** Product vision, game design and tech architecture, each on the folded records. **They have run once already, on the records as they stood at `b701716992`, and their findings are in both files with the gate named beside each.** This step is the second round and it is aimed at what step 2 changed rather than at the whole record again. Findings are folded and the fold is where the next defect gets made, so the grep for the old number and the old verb runs after it. **A finding against a ruling in the record's section 2 is written as "gate disagrees with ruling X" and the ruling is built on.** The surfaced commitments go into the session recap rather than in front of a slice. One commit, docs only.

**Step 4. The density ADR, filed in the shape the game design gate passed. DONE: ADR 0059, at `9cba278131`.** Mark's ruling is that the gate sees the decision before the ADR is written, and it has. What it passed: one ADR, titled on the mow, carrying silent trash as the mow's cost, with the revenant as the visible armed minority of a heaven minute and the doses of hell staying with the bosses (ADR 0050). "One skull" and the touch counts stay out of it, per the standing rule that no ADR carries a combat magnitude. One commit.

**Step 5. The standing row ADR, filed. DONE: ADR 0060, at `9cba278131`, and re-ruled in place in the step 2 docs pass.** Growth over the run is authored per section over the one-shot rows, behind the section's teaching rows, and the Vigil declares none. It cites ADR 0047 as the half it does not own. **The re-ruling is on the naming research's finding** (`docs/research/naming-the-authored-growth-rate.md`): growth is stepped and never a ramp, a repeating row is an ordinary row with its repeat fields set rather than a second kind of row, and nothing measures a span. **The second gate round then struck the per-minute health and speed step the first re-ruling had adopted, and ruled that a standing row ends at the next row of any kind**, and it moved the per-rung weapon climb out to each line's own data (ADR 0005). The number stays 0060, the filename stays, and the dated supersession triple is inside it. The glossary's Row entry widens in this docs pass rather than in a code slice. One commit for the filing, one for the re-ruling, one for the second gate round's fold.

**Step 6. ADR 0058, amended in place. DONE, at `9cba278131`.** It gains the cadence floor beside its freshness axis, with the dated what-stood, what-it-replaced, what-it-could-not-have-known triple. **ADR 0034 is not amended** and there is no second amendment step, because the bank expiry is withdrawn. One commit.

**Step 7. Slice A: the mob table and fire. DONE, at `d4dedf6d9a` with the progress note at `78344abb85`.** The shambler's health and `fire`; `mobs.ts:60-66`'s derivation paragraph rewritten rather than renumbered; `touchCounts.test.ts` re-expressed in the same motion as the ruling; the Procession's teaching Drip becomes a lone revenant Drip; the glossary's Armed entry restated. Spec tests 1 to 6 and 14, module tests, and the fence list. **`GOLDEN` re-pins here**, with its paragraph naming that the witness folds every live mob's health and that the scenario's two scripted kills held. A rendered check and a hand-recorded tape are owed. One commit.

**What slice A cost, against what this plan said it would.** The module table above gives slice A five files and section 2 says it found one test outside them. It landed **19 files, with 42 tests red across 13**, on a test-name diff of 47 added and 27 removed (`docs/push/step-4-progress.md` section 4 item 6). Four more files carried the same #76 pass A pin the plan found in one; the armed share and the first-shot jitter lost their only carrier, which took `mobFire.test.ts` and `FieldRenderer.test.ts` with them; four measured per-seed baseline tables moved; and two run-length bounds moved because a parked run now seals far later. **So the claim that slice B has the largest blast radius is not safe.** It may still be true, and the test-name diff is what will say so, but a slice that touches one data row in a table every other module reads is not bounded by the files that hold the row, and slice B's boundary should be read the same way before it starts.

**Two findings slice A filed rather than resolved, and they are Mark's read.** Both are findings against something he ruled, so they are written down and built past rather than applied (the record's section 2, the gates-never-overrule rule).

- **The mow takes ADR 0042's second half off the Wall** (`docs/push/step-4-progress.md` section 4 item 7). ADR 0042 makes the Wall two-sided, crossable unloaded at the floor build and never crossable for free. Measured at the floor build with the mob table as the only variable, the cost was the health rather than the fire: at 8 health the storm thins the curtain enough for a lane to open and the grave crosses untouched, and the loaded half goes with it because a curtain of silent bodies puts no shots in the air for a belch to be worth spending on. The two halves that still hold are asserted; the two that do not are `it.fails` tripwires carrying the measurement, so they go red the day the Wall costs something again. **Slice B owns the Crowd's table and must not re-author the Wall's row past this finding without his answer.**
- **The mow reverses a reading of Mark's #79 dwell-ladder ruling, in Territory's bottom rung** (`docs/push/step-4-progress.md` section 4 item 8). The ladder rules a pace, and its own words are that the touch counts do not move with it, only the time the ground takes to deliver them, which is what makes an early rung survivable. Two Territory pulses is a shambler now and a level-one crossing lands five, so the mow body dies in the slowest ground there is. The pace pin is kept whole by reading it on a revenant. **Nothing in this plan owns Territory's rungs**, so there is no slice to fold it into and it stays his.

**Step 8. Slice B: the standing rows and the re-authored rows.** `Repeat` and `StageRow.repeat` authored in seconds, `repeatingArrivals` over phase-local seconds, the Procession's standing rows at 0 through the teaching rows then 2, 3.5 and 5 bodies a second and then 0 at its sparse last row, the Crowd's at 8, 3 and 12, each written into its own section's row table in time order beside the shaped rows, the shaped rows' doubled counts, and the carriers re-placed across them. **And the stage side, which is this slice's too**: the active standing row picked statelessly as the last row carrying a `repeat` among `rows[0..firedRows)`, `repeatingArrivals` asked of that one row for the ticks after its own `t`, its groups fired through the existing `spawnRow`, and `rowTicks` doing the conversion `rows.ts` may not do for itself. **No `StandingRow` type, no `authoredSpanTicks`, no `Phase.standing`, no standing-row constants and no new stage state**: a standing row is a row, it carries its own phase-local time, it ends at the next row of any kind, and the cursor already knows which one is standing. **Three things ride with the tables**: `peakArrivals` gains the rate term, because it is the corpse cap's proof and a section table that authors a rate prices wrong without it; `rowsUnderThePour` carries the active standing row into the Waking at `t: 0` with its interval widened by `1 / share`, because a rate thins by interval and never by count; and `carries` is false on every standing row. Spec tests 7 to 15 and their module tests, plus the extended pour test at `rows.test.ts:380`. **No stat step on the clock**, which the second gate round struck. **`CONTEXT.md` gains nothing: the second gate round's docs pass landed the rewritten Standing row entry, the widened Row clause, The mow, Ladder, Signal lock and the Add clause**, and a rename pass follows separately. The Procession's restated wording is in the glossary already and is quoted here only as the reference to check against: *"**The Procession**: The first section, ending on the Banshee. It owns emptiness: never more than one shaped group live above its standing row, so the field thins between beats and the corpses left behind are worth crossing it for. Named for the funeral filing past in single file. Avoid: the ramp, the lane, the opening."* `game-concept.md`'s stage paragraph gains the standing rows, cited and dated, because that page is Mark's own wording. **`GOLDEN` re-pins here** if anything inside the scenario's first 600 ticks moves, and the teaching-row rule is what keeps that to the smallest possible change, by keeping standing arrivals out of the window. A rendered check and a hand-recorded tape are owed, and **the rendered check carries the named shot: an offer standing open in a Crowd-density field**, verification step 20. **And the slice's report prints `state.refusals` off its own hand tape**, because a slice that multiplies arrivals under caps derived for a thinner field is the one most likely to bind a cap, and a bound cap is a fault rather than a number to raise. **And one comment**: `digest.ts`'s JSDoc at `:33-45` says scripting keeps the golden off "the ramp's own tuning", and there is no ramp after this slice, so the sentence is rewritten to name the stage's authored growth in the commit that makes it stale. **And it owns the Wall's row, which is where slice A's ADR 0042 finding sits**: verification step 22 is Mark's answer and this slice must not re-author that row past it. One commit.

**What slice B is expected to turn red, listed so the test-name diff is read against something (the tech architecture gate).** Slice A landed 19 files where its table said five, and the lesson is that a slice touching a table every other module reads is not bounded by the files that hold the table. Expected: the key-shape pin at `rows.test.ts:737`, which asserts every row declares exactly six fields and now has to allow a seventh; the four row literals across the section tables; the `sparseLastRow` and `rowsUnderThePour` literals and the pour test that walks them; the per-seed baseline tables in `bot.test.ts` and `harnessPolicy.test.ts`, which are measured figures against a field that is about to change; `screenLifecycle.test.ts:918`, whose parked-run bound is three times a measured seal tick; `verificationReadback.test.ts`'s run-length bound; `digest.test.ts` with the re-pin; and `caps.test.ts` if a cap binds, which is a finding rather than a fix. **A realistic count is 15 to 20 files.** A diff much smaller than that is a reason to look for the tests that should have moved and did not.

**Step 9. Slice C: the economy rows, the burst cadence and the weapon climb.** `CORPSES_TO_CEILING`, the reservoir with its feast identity kept, and the two cadence rows with the intervals they pay on. **And the per-rung climb of each line, set from a shipped weapon level table (Mark's ruling of 2026-09-09).** **The source this slice reads is `docs/research/weapon-growth-per-level-precedent.md`, research in flight at the time of writing**, beside `docs/research/survivor-numbers.md`, which already holds Vampire Survivors' worked per-weapon level tables and the axis tally over all 127 weapons: damage roughly triples to quadruples over a weapon's whole climb, damage is the filler axis rather than the headline one, and the first upgrade is the one the player must feel. **It is set per line and never as one band across lines (ADR 0005, the tech architecture gate):** a line owns how its five levels grow, and Territory and the bell buy area and repel rather than damage, so a single multiple held over the roster would be a rule the roster does not have. The tree already agrees with the axis half, since a line buys columns, souls and cones rather than a damage number (`skullStream.ts:22`), so what moves is the size of each line's climb and the shape of its first step, and one thing the records cannot answer has to be read rather than assumed: VS's tables run eight levels and ours run five (`roster.ts:16`), so the shipped curve is a shape over a whole climb rather than a step-for-step copy. **If the two records turn out not to carry enough of a table to sit against, the slice stops and reports "research owed before slice C" rather than inventing the curve**, and the orchestrator dispatches the research. Spec tests 18 to 19c and 20 to 23, and their module tests. **`GOLDEN` re-pins here**, for the grave's size and reservoir at tick 600. A rendered check and a hand-recorded tape are owed. One commit.

**Step 10. Slice D: the caps become derivations.** `peakLive`, `MOB_CAP` and `MOB_FIRE_CAP` as derivations, the standing rows as a term inside `peakArrivals`, and the corpse cap's identity tests holding through it. The card table, `BODY_COST`, `cardCost` and the three section purses land here in `rows.ts`, with the caps derivation as their first reader, and **`caps.ts` imports `rows.ts` and never `stage.ts`**. Spec tests 16, 17 and 24 to 29, their module tests, and the new import fence. **`CONTEXT.md` gains nothing: Card landed at `9cba278131`.** **Round 0's refusals are this slice's input, not a note beside it:** the instrument refused three of its six fields against `MOB_CAP` 160 and `CORPSE_CAP` 233 (the record's section 4), so the derivation is what makes the step 4 field one the pools have slots for, and the record's section 5 item 7 is where the three rules it has to satisfy live. A hand-recorded tape is owed, because a derived cap changes what a refusal path does. `GOLDEN` does not move: no cap is folded. One commit.

**Step 11. Slice E: the witness fold, widened once.** `StreamName` gains `director` and #108's two names; `STREAM_ORDER` folds them; `director.ts` appears carrying `DirectorState` and its initial value and nothing else, so `RunState.director` exists and is folded against a real type rather than a placeholder; **`WITNESS_VERSION` moves 6 to 7 in this commit, with every new folded field declared in it**. Nothing else is in this commit, which is the point of splitting it: the lesson requires the stamp and the declaration together, and a commit that does only that is one a reviewer can check in full. **And one field the director slice needs and this commit is where it belongs (the tech architecture gate): a `Mob` gains a provenance mark saying which row put it on the field.** Spec test 43 has to tell a standing body from a shaped one, and the only honest way is for the body to say where it came from; slice B does not add it, and its `spawnMob` signature leaves no slot for it, so adding it here keeps `spawnMob`'s three callers moving once rather than twice (`stage.ts:283`, `setPiece.ts:184`, `undertaker.ts:255`). It is folded like every other field on a live mob, declared in this commit with the rest. Spec tests 30 to 32 and their module tests. **`GOLDEN` re-pins here**, for the new streams, the folded director state and the new mob field. No rendered check is owed, because nothing a player sees changes, and a hand-recorded tape is owed anyway because the witness version moves under it. One commit.

**Step 12. Slice F: the director's signal and purse.** `director.ts`, `Phase.purse`, the spend, the cards it buys, the quiet interval, the one call site in `step.ts` **and that file's tick-order JSDoc naming where it runs**, the `directedAdd` event, and the purse invariant. Spec tests 33 to 48 and their module tests. **`CONTEXT.md` gains nothing: Purse landed at `9cba278131` and the glossary's word for what the director reads is Pressure, which is already there.** `PressureSignal` is the type's name and never the glossary's. **`GOLDEN` re-pins here**, for the director's own state inside the scenario's 600 ticks. A rendered check and a hand-recorded tape are owed. **This is the slice #118's fix lands in if slice G's reading says the cause is the food economy starving inside a boss phase.** One commit.

**Step 13. Slice G: the instrument, and the lock.** `readings/pressure.ts` and its registration in every place the graph is declared; arrivals as a rate; ticks to ceiling; belch intervals; the mobs-alive distribution; the ceiling-stop count; every new module in `harnessStatesNoTarget.test.ts`'s list and every new reading in `compareRuns.ts`'s declarations. **And the signal lock: `signalLock.ts`, `signalLockFromUrl`, the header field, and `FORMAT_VERSION` 3 to 4 in this same commit.** `CONTEXT.md` gains nothing: Signal lock landed in the second gate round's docs pass. **And one comment: `bot.ts:38-41` is rewritten to cite the record's decline of the dev-only autopilot**, so the file stops naming a step that has run. Spec tests 49 to 57 and their module tests. A hand-recorded tape is owed, at format 4. `GOLDEN` does not move: nothing under `src/dev` is folded and the lock's default holds the signal live. One commit.

**Step 14. The implementation gates, then CodeRabbit on the exact tip.** Game design and tech architecture on what was built rather than on what was planned, because a plan gate cannot see what the build did, and a dispatch is gated twice. Gates run before the reviewer, not after, because any gate finding that changes code invalidates a review. The working tree is checked after every gate round, because a review gate will write to production code if it can.

**Step 15. The batch.** 48 seeds under `steady-far` and 48 under `loose-far`. It reports, printed into the note in full: arrivals a second; the mobs-alive distribution; the enemy shots in the air, peak; kills by source; **hits to kill per trash type per minute, which is the reading the record's section 12 item 6 hangs on**; time to ceiling; belch cadence; final rungs per line; untaken offers by site and banks per run; reach and seal rate; the count of runs that stopped at the tick ceiling; and the batch's own wall-clock cost split between playing and measuring. **A 192-seed batch runs only if the reading turns on a victory rate**, which is the brief's own condition: reach was measured stable at 48 and a victory rate was not. If no victory-rate question is raised, it does not run and the note says so. **The agent reports and does not judge.** It is read in the main thread on Fable, which is one of the four places the brief says Fable is worth spending.

**Step 16. Round two.** Pick the next move from that reading, dispatch it as one slice under this same contract, run one more batch, then stop and let Mark play. Nothing in round two is decided here.

**Eighteen steps in all: 0, 0a, and 1 through 16, of which eight are coding slices, A0 and A through G.** Step 0 makes no commit; step 0a makes one docs commit for its own place in this plan and one code commit; steps 2 to 6 make six doc and ADR commits, because step 5 files ADR 0060 and then re-rules it; steps 7 to 13 make seven code commits; steps 1, 14, 15 and 16 make one each or none. Two slices that were in the brief's seven are not here, the bank expiry and the director's fold riding inside the director slice; two that were not are, the caps promoted into the bank's place and the fold as its own commit.

**One thing no slice does: move a harness row.** `enoughClearance`, `belchWorthIt`, every lapse rate and every look-ahead list belong to the hand, and the record's standing rule is that the hand's rows are never tuned with the game's. A hand row moved between two batches would compare two builds through two instruments. If a hand row has to move, it becomes a new configuration with a new name and every earlier batch stays comparable. The record's section 7 names the one to watch: `belchWorthIt` prices live shots, and a silent shambler moves almost all of those onto the bosses.
