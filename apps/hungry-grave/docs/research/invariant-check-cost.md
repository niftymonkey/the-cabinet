# Invariant check cost: what always-on costs a frame, and why the first figure was wrong

Research pass for the always-on simulation invariants of [#45](https://github.com/niftymonkey/the-cabinet/issues/45), answering two questions: was the cost figure the ruling was made on right, and what does the cost actually look like once it is measured on a field that has a storm in it.

**Section 0 is the whole finding and stands on its own.** Everything after it is the evidence, there to be cited and spot-checked rather than re-read.

## 0. The finding

The ruling that the simulation invariants run on every tick in every build was made against a cost of **1.59 milliseconds** on a catch-up frame. That figure came from bot runs, and it was wrong by roughly threefold: measured with all four weapon lines maxed, the same catch-up frame cost about **5.58 milliseconds**, a third of a desktop frame rather than a tenth.

The `checkNoNaN` rewrite in commit `0a43746948`, which builds a no-NaN message only when a number actually fails, then dropped that by roughly tenfold. On the same seeds and the same busiest ticks, `checkInvariants` went from 298 to 372 microseconds a tick down to **23 to 37**, which puts a catch-up frame's check cost at about **0.56 milliseconds**, about **3.3%** of a 16.7 millisecond desktop frame. Both catch-up figures are the top of their band, fifteen ticks at 37 microseconds against fifteen at 372, so the two are end-matched and the tenfold drop per tick is the same tenfold per frame. An earlier draft paired 15 times 372 with 15 times 30, which read as 5.6 to 0.45 and produced a false "under 3% of a desktop frame". The always-on ruling is comfortable at that price on desktop, and the price of the harness reaching the shipped bundle is 4.3 kB raw and 1.3 kB gzipped.

Nothing here is measured on a phone, and that is the one thing that could still move the ruling. The trigger is in section 5.

## 1. Why a performance number was measured at all

The instrument this measurement belongs to is not a replay feature that happens to expose a frame cost. **Its purposes are an open pool, by the same design idiom as weapon lines and mob types (ADRs 0005 and 0016), and gameplay and performance are simply the two in hand.** A kind of evidence nobody has named yet joins them in the same instrument rather than needing a new one, which is what makes performance evidence first-class here.

The two kinds of signal split cleanly, and the split is why this particular number had to be measured deliberately rather than looked up.

**Anything recomputable from deterministic state is open for free, forever.** A replay rebuilds authoritative `RunState` at every tick, so any question about what was on the field, what the economy did, or when a level landed can be asked of a tape recorded long before anybody thought of the question.

**Anything measured outside the simulation exists only if it was written down at record time.** Wall clock is the obvious case, and frame cost is this one. No replay of any existing tape could have produced the numbers below, because no tape carries them. That is the whole reason this was a deliberate measurement pass rather than a query.

The standing goal it feeds is correlating performance with gameplay load, and comparing representative behaviour across desktop and phone. Everything measured here is desktop, so it is half of that goal, and section 5 says which half is missing.

The architecture itself is owned by ADRs 0017 to 0020 and is not restated here.

## 2. The storm versus the birthright

Every earlier figure came from `belchingPolicy` at `src/dev/bot.ts:253`. The bot only dodges, so it never swallows a drop and never levels a weapon line, and it plays the whole run on the birthright loadout. Its busiest tick therefore holds one to four skulls and no wisps at all: it is measuring a field with no storm in it, which is exactly the thing the entity walk in `checkInvariants` is proportional to.

Re-measured with `run.levels` set to 5 across all four lines, on seeds 505, 404 and 303, each seed at its own busiest tick:

- **Live entities at the busiest tick: 94 to 110 on maxed weapons, against 74 to 79 for the same seeds on the birthright loadout.**
- **`checkInvariants` at 298 to 372 microseconds a tick**, against a bare `step` at 16 to 30.

**The maxed pass is a synthetic ceiling the stage cannot supply, and that is stated here rather than left to be discovered.** Setting `run.levels` to 5 across all four lines is not a hard run, it is an impossible one. From the birthright of soul stream and headstones at level 1 with wisps and bell unopened, reaching 5/5/5/5 costs **18 drops**. `DROP_PRICES` in `src/game/drops.ts` holds twelve entries summing to 256 cumulative kills, so twelve is the ceiling the whole stage can pay for, and the floor ladder strips a level off every line on each floor hit, putting a run that took damage further behind still. So the 94 to 110 entity figure describes a field no player can reach.

The direction is conservative, so nothing built on it is in danger: the real ceiling is lower, the cost is lower with it, and post-rewrite the checks are 3.3% of a desktop frame anyway. What is worth naming is that this is the same failure this document is about, arriving from the other side. The lesson this pass wrote is that a bot's numbers measure the bot's policy; the correction it drove replaced a policy-blind figure with an unreachable one. **A representative worst case and a synthetic one are different instruments and the document has to say which it used.** Section 3a's mob count is the representative kind and says so explicitly; this entity count is the synthetic kind and now says so too.

**The checks cost roughly twelve times the simulation they check.** That ratio, not the absolute number, is what makes the always-on ruling worth measuring rather than assuming: the sim is cheap and the checker was not.

One tick of checking at 298 to 372 microseconds is about 2% of a 60Hz frame, which is unremarkable. The number that matters is the catch-up frame. `MAX_CATCHUP_TICKS` at `src/game/clock.ts:29` is 15, so a frame that spends its full catch-up budget runs the checks fifteen times, and that came to about 5.58 milliseconds against the 1.59 quoted when the ruling was made.

**`foldEntities` measured 4 to 8 microseconds a tick**, against the same pass's 298 to 372 for the checks. The fold's CPU cost was therefore never what decided where the witness fold runs. The checkpoints-only ruling turned on bytes instead, and this measurement is the reason that reasoning is stated in bytes rather than in time.

## 3. What the `checkNoNaN` rewrite bought

Commit `0a43746948` builds the no-NaN failure message only on the branch where a number actually fails, rather than composing it on every tick for a check that almost always passes. The harness has since moved to `src/game/invariants.ts` so that `advance` can call it, in `6b0c5c633e`. Both commits are production architecture and survive into dispatch 6a; the only throwaway from this pass is the temporary `?invariants=` measurement switch and its wiring.

Re-measured by the same method, on the same three seeds at their busiest ticks: **8210** at 110 entities, **11440** at 94, and **10261** at 106.

| | before | after |
| --- | --- | --- |
| `checkInvariants`, per tick | 298 to 372 microseconds | 23 to 37 microseconds |
| a full catch-up frame's checks, 15 ticks at the top of the band | about 5.58 ms | about 0.56 ms |
| share of a 16.7 ms desktop frame | about a third | about 3.3% |

**The checks now cost about what one bare `step` costs.** `step` measured 17 to 25 microseconds in this pass, matching the 16 to 30 of the earlier one, so the twelvefold gap in section 2 closed to roughly parity. The checker is no longer the expensive half of the tick.

The cost of the harness entering the shipped bundle, measured on the production build: **4.3 kB raw, 1.3 kB gzipped.**

## 3a. The densest authored moment, measured

`src/game/caps.ts` states the densest authored moment as a mob count, and that sentence is the justification for where `MOB_CAP` sits. It said 47 and now says 51, and the 51 had no measurement behind it anywhere in the tree until this section. That is the same failure this whole document is about, arriving one document later, so the figure is measured and its method is written down rather than cited to a file that does not carry it.

Measured on this tree at commit `91a47bb966`, driving `belchingPolicy` from `src/dev/bot.ts` from tick 0 to the end of the run and reading `liveCount(state.mobs)` from `src/game/caps.ts` after every tick, on three seeds:

| seed | peak live mobs | at tick | run length | ending |
| --- | --- | --- | --- | --- |
| 505 | **51** | 11341 | 12301 ticks | victory |
| 404 | 49 | 11341 | 11434 ticks | sealed |
| 303 | 48 | 11341 | 11478 ticks | sealed |

**The peak lands at the same tick on all three seeds**, which is what an authored stage should do: the seed varies template column placement, drop kind and first-shot jitter, and none of those change how many mobs a row puts on the field. So 51 is a property of the authored content rather than of a lucky run, and the tick is citable.

**This figure is not affected by the bot's blindness**, unlike every cost figure in this document, because mob count is driven by the authored timeline and not by the policy. Reading the same three seeds under `dodgePolicy` gives an identical peak and an identical tick. That is worth stating because the lesson this pass produced is to distrust bot-sourced figures, and the honest form of that lesson names the figures it does not apply to.

`MOB_CAP` is 160, so nothing binds and no test asserts either number. The 47 predates dispatch 5 and the current count is what dispatch 5's weapons and pacing produce.

**Method note.** The measurement was a temporary test file using the deliberate-assertion-failure reporting shape in section 4, deleted afterwards; the tree is clean of it.

## 4. Method

A temporary test file drove `belchingPolicy` per seed to find the tick with the most live entities, replayed the run to that tick, and then timed each function in isolation over 20,000 repetitions after a 500-repetition warm-up. For the maxed pass, `run.levels` was set to 5 across all four weapon lines before the timed loop. The file was deleted afterwards and the tree is clean of it: this is a measurement, not a committed benchmark, and a benchmark that lives in the suite is a flaky test waiting to happen.

**One trap worth recording, because it cost the first attempt entirely.** Vitest on this tree swallows `console.log` and does so silently: a benchmark that reports through `console.log` produces no output at all and no indication that anything was suppressed. Report through a deliberate assertion failure instead, which prints the whole thing in the failure diff:

```ts
expect("REPORT\n" + lines.join("\n")).toBe("");
```

Anything that has to get numbers out of a vitest run here should use that shape rather than logging and wondering.

## 5. What is still open

**All of this is desktop.** A phone is slower, by a margin nobody here has measured, and the always-on ruling puts the check on the player's frame budget on every device. Section 0's comfortable figure is comfortable on one class of machine.

The trigger for reconsidering the ruling is a confirming play on a phone. `clock.debtTicks` is the instrument: tick debt is what says whether the cost is real to a player, or real only to a benchmark. Until a run has been played on a phone and its debt read, the ruling stands on desktop evidence.

**How that phone reading is taken has since been ruled, and it is not by eye.** The first plan was two runs off the deployed measurement build at `?seed=505&invariants=off` and `?seed=505&invariants=on`, with the `DEBT` label watched and typed back. Those URLs are superseded for the comparison and keep one job only: the deploy they name, commit `91a47bb966`, is the provenance baseline the recorder build is measured against. The reading itself comes from a recorder that writes structured per-frame evidence and exports it as a file, because Hungry Grave ADR 0018 rules out a number reaching an agent through somebody's eyes and fingers (ruled by Mark 2026-08-23).

**One device fact shapes what that recorder can honestly claim.** WebKit floors `performance.now()` and `requestAnimationFrame` timestamps to a 1 millisecond grid, and the escape hatch is cross-origin isolation, which needs COOP and COEP headers this site does not send. The per-tick figures in section 3 are 23 to 37 microseconds and a full catch-up frame is about 0.56 milliseconds, so both sit under that grid: a sub-tick timer on an iPhone reads zero or one and nothing between. The phone comparison is therefore judged on observable player-runtime effects, frame and FPS distribution and debt growth, and the invariant cost falls out of the difference between the two conditions rather than out of a timer. Do not add a sub-millisecond invariant timing field on iOS to fill a column; it would carry no information.

That is also the missing half of section 1's standing goal. Correlating frame cost against gameplay load needs the load and the cost recorded together, on both classes of device, and a tape's third section is where that join becomes possible: it carries only what cannot be recomputed from deterministic state, and timings are merely its first inhabitants. This pass measured the cost side on one device by hand, which is exactly the manual work that section exists to remove.
