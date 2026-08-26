# Analytics and Replay Grill, The Hungry Grave

**Date:** 2026-08-22
**Skills:** `/grilling`, paired with `/architect-deep` and `/domain-modeling`
**Outcome:** Twelve decisions settled, seven modules named, the work split into dispatches 6a and 6b

## Why This Document Exists

Mark ruled on 2026-08-22 that analytics and replay deserved their own deep design effort before any ticket was drafted, and he named the reason: the two are very likely closely related and he did not want them thought through as two separate things. What follows is the dialogue that produced, in his words, and the evidence that was brought to each fork.

The summary in the gitignored `continue-hungry-grave.md` carries the verdicts. This carries the argument, which is the part nobody can rebuild.

Two things are flagged rather than smoothed over throughout. Where this record contradicts or sharpens that summary, it says so under **Contradiction**. Where a decision was made by the agent rather than by Mark, it says so under **Agent decision**, so it can be overruled later.

## The Brief

One tape, three uses. The tape is the seed plus the per-tick `TickCommand` at 60 Hz, so about 12,000 entries for a 200-second run. Recorded at the sim boundary and never as raw touch events, because touch handling differs per device and the command does not.

1. **Numbers.** Replay the tape headlessly and compute any metric. Because the metric is computed at replay time, runs recorded today answer questions invented next month.
2. **Pictures.** Replay a human run in a browser and screenshot it at chosen moments, so an agent can see render and weapon bugs that no number will ever show. Mark's own addition and the part he cares most about.
3. **Sharing.** Mark committed that replay ships in the final product, "100%": share a good run and a friend watches it like they were over your shoulder.

## The Twelve Questions

### Question 1: Who owns the tape?

**Options offered.** A, the sim owns it, with a `tape: TickCommand[]` on `RunState` that `step()` pushes to. B, a recorder wraps `CommandSource`, the seam at `advance.ts:31`. C, the sim emits the command as an event and an outside listener records it.

**Evidence brought.** The sim's one door is `CommandSource`, asked for a fresh command on every tick rather than every frame. `RunState` already carries `seed`, `tick`, and each stream's `drawn` cursor. The bot does not go through `advance` at all; it calls `stepChecked` in its own loop at `bot.ts:39`. Option C would push 12,000 extra events per run through sound and the renderers, which read every event.

**The agent recommended B**, on the grounds that record and replay become one seam pointing opposite ways and neither `RunState` nor the digest changes shape.

**Mark reshaped the question rather than answering it, and this is the most consequential moment in the grill.** He accepted that recording belongs outside the sim, then rejected the premise that `CommandSource` was the right seam simply because it was the closest seam available:

> That suggests `CommandSource` may not actually be the canonical boundary through which every executed tick passes. If legitimate execution paths can bypass the recording seam, I would rather refactor the architecture to create the correct seam than accept an observability gap or move recording into `RunState`.

> Treat observability here the same way we would treat testability: the current implementation is not a constraint.

He drew the shape he wanted: human `CommandSource`, bot policy and replay all converging on one authoritative execution boundary, which then reaches `step()` and separately exposes observable execution activity. The boundary should represent "this is the command the simulation is executing" rather than "this is where we happened to obtain a command", and he named those as subtly different responsibilities.

He also introduced RxJS here, with a hard limit attached:

> I do not want the deterministic simulation itself to become dependent on RxJS.

> Ticker for continuous simulation. Direct calls for authoritative state changes. RxJS for observation, coordination, and derived behaviour across systems.

**Ruling.** The tape lives outside the sim. Refactor until every executed tick crosses one authoritative boundary. Recording is not game state and never enters `RunState` or the digest.

### Question 2: Where does the authoritative boundary live?

**Options offered.** A, `executeTick` stays inside `src/game`, dependency-free, exposing a plain synchronous listener hook that `src/app` wraps in an RxJS `Subject`. B, `executeTick` moves out to a new folder that may import RxJS, so the boundary itself is the Observable.

**Evidence brought.** Only two paths reach `step` today, and both are already wrappers around it: `advance()` at `advance.ts:56`, whose single caller is `GameScreen.ts:538`, and `stepChecked()` at `invariants.ts:346`, used by every sim test plus `bot.ts:48` and `digest.ts:260`. So the refactor is a merge of two existing wrappers rather than an invention.

The rule Mark suspected was weak turned out to be weak and already broken. `invariants.ts:345` says "Every sim test steps through this, never through step directly", and that is a comment plus ADR 0013, enforced by nothing. `src/app/runHandoff.test.ts:18` imports `step` and calls it raw, four times.

Two facts decided the fork. `rxjs` is not a dependency anywhere in the monorepo. And `src/boundary.test.ts:40` and `:49` give **both** `src/game` and `src/dev` the rule `mayImport: []`, which is a failing test rather than a convention. Under Option B the bot, the digest and every sim test could no longer reach the boundary without widening `src/dev` and pulling RxJS into every headless test run.

A second reason was raised: the invariant check must run synchronously and throw to fail a test, and a subscriber that throws inside `Subject.next()` takes the other subscribers down with it.

**The agent recommended A.** Mark agreed:

> Keep `executeTick()` inside `src/game` as the single authoritative, dependency-free, synchronous execution boundary. Adapt its observable activity to RxJS outside the deterministic core rather than making RxJS part of the boundary itself.

> Refactor existing seams as needed rather than preserving them for their own sake.

**Contradiction with the handoff summary.** The summary says `executeTick` "replaces both `advance()`'s inner loop and `stepChecked()`". That is right about `advance`, but how the invariant check survives was never actually settled. The dialogue said it runs inside `executeTick`, and separately said it wants to be a direct call rather than an observer. Neither addressed whether production pays for invariants on every tick or whether they are opt-in. **This is an open question the 6a spec has to close.** **SUPERSEDED 2026-08-23: the 6a spec closed it. The checks run on every tick in every build, the player's included, and Hungry Grave ADR 0023 carries the ruling. The question above is kept as what was open when the grill ended.**

### Question 3: What crosses the boundary?

**Options offered.** A, `{ tick, command }`. B, `{ tick, command, events }`. C, the same plus read access to the live `RunState`.

**Evidence brought.** Three findings made the answer non-obvious.

`DamageSource` is not just unused, it cannot do the job as written. `mobs.ts:489` ignores the parameter behind an eslint-disable, but worse, the soul stream's skulls pass `"storm"` at `mobs.ts:531` and the wisps also pass `"storm"` at `mobs.ts:567`. Two weapon lines, one tag. And `"contact"` is declared while nothing passes it.

There is no damage event at all. `damageMob` emits only `mobKilled`, and only at zero hp, so a shot that chips a revenant for 1 of 5 emits nothing.

There is no `mobSpawned` event either. So "mobs alive versus mobs killed over time" cannot be rebuilt from the event list.

That mattered because several metrics on the list are not events. Each line's level over time, mobs alive, how long the reservoir sat full, and the fraction of ticks with a mob in range of an owned line are all per-tick samples of state. Under Option B they would require rebuilding a shadow copy of the game from events, which is a second implementation of the rules that can drift.

The agent named the hazard in Option C plainly and did not hide it: `events.ts:3` already warns that payloads carry values and never entity references because the pools are mutated in place, and "never retain state" is a discipline rule, not a machine rule. B has no such hazard.

**The agent recommended C.** Mark agreed and then reshaped the rule:

> One clarification: I do not think the architectural rule should be that `RunState` can never cross into RxJS. The actual hazard is allowing a live mutable `RunState` reference to be retained, buffered, replayed, or otherwise treated as a historical value.

> For now, having the RxJS adapter immediately project `state` into safe value snapshots seems like a clean way to prevent that hazard. But please preserve that distinction in the design rather than treating RxJS itself as the boundary we cannot cross.

**Ruling.** The boundary hands listeners `{ tick, command, events, state }`. Snapshot projection at the adapter is the mechanism, not the principle.

### Question 4: How does damage get attributed to a line?

**Options offered.** A, kill credit only, by adding `source` to `mobKilled`. B, a `mobDamaged { source, amount, killed }` event on every hit, with `DamageSource` split per line and `mobKilled` untouched. C, both.

**Evidence brought.** Volume is a non-issue: the densest authored moment puts 47 mobs alive at once per `caps.ts:31`, and `SKULL_DAMAGE`, `STONE_DAMAGE` and `WISP_DAMAGE` are all 1, so a per-hit event is a handful per tick spiking to about 47 on a belch. **Correction 2026-08-23: the measured figure is 51, not 47.** The 47 is left as written because it is what the argument above was made on. `src/game/caps.ts` carries the current value and [research/invariant-check-cost.md](../research/invariant-check-cost.md) section 3a carries the measurement.

The decisive argument was that kill credit alone would answer the question wrong. At 1 damage per hit against 3-health shamblers and 5-health revenants, whichever line lands the last hit takes 100% of a kill it did 20% of. "Which upgrades are valuable" is the whole reason the instrument exists.

**The agent recommended B**, noting that `mobKilled` is load-bearing at `step.ts:137` where it drives `creditKill`, and in `sound.ts`, so leaving it alone costs nothing while per-line kill credit still falls out as the source of the `mobDamaged` that carried `killed: true`.

**Ruling.** Mark took B and confirmed the cleanup: "Delete the unused `"contact"` source as part of the cleanup; I do not have a future rule in mind for it."

### Question 5: Does the tape store the exact command, or a rounded one?

**Options offered.** A, store exact float64s. B, round the command at the input seam, before the sim ever sees it. C, keep the game exact and round only inside the tape.

**Evidence brought.** `BASE_SPEED` is `540 / 120`, so 4.5 field units per tick on a 540-wide field. `moveGrave` does `grave.x += command.x * BASE_SPEED` at `grave.ts:105`, and touch produces `(target.x - grave.x) / BASE_SPEED` at `touch.ts:237`, so the values are arbitrary floats rather than a small set.

Sizes: a 200-second run is about 12,000 ticks, which is roughly 200KB packed binary or 500KB as JSON at full precision, against about 60KB raw and 15 to 25KB gzipped when quantised to `int16`. A grid of 0.01 base-speed units is 0.045 field units, roughly one twelve-thousandth of the screen width.

The cheapness of B rested on one fact: the quantiser lives in `src/input`, above the sim, so `src/game` does not change, `step` does not change, and the golden digest does not change, because the digest scenario drives `stepChecked` with its own script at `digest.ts:260` and never goes through the input path.

Option C was presented specifically in order to reject it. Rounding after the sim saw the true value means replay feeds a different number in and the run drifts, which is exactly the divergence ADR 0015 and the digest exist to catch.

The agent also warned that even at 20KB a tape does not fit in a URL, so B does not buy link sharing on its own.

**The agent recommended B.** Mark took it and added the invariant:

> The important invariant should be: the tape always contains exactly the commands consumed by the deterministic simulation. Never round or otherwise transform them after that boundary.

That invariant turns out to be structural rather than a rule to remember, because recording happens at `executeTick`, which is by definition the command the sim consumed.

**Agent decision, unresolved.** The specific grid was never put to Mark. The agent's working figure is `int16` at a scale of 1/256 base-speed units, which gives a range of plus or minus 128 base-speeds and a resolution of 0.0039, and which renders the keyboard's diagonal `1/sqrt(2)` as 181/256 with an error of about 0.01%. The number said out loud in the dialogue was "0.01 base-speed units". **6a has to pick one, and the keyboard diagonal is the case that constrains it.** **SUPERSEDED 2026-08-23: 6a picked no grid at all. Steering is stored as two `float32` and never quantised, and Hungry Grave ADR 0030 carries the encoding decision that retired this working figure, which fails on range before resolution. The paragraph above is kept as the thinking of its day.**

### Question 6: Where does a tape live once a run ends?

**Options offered.** A, save a file. B, A plus keeping recent runs in `localStorage` with a dev screen. C, a real backend, uploading on run end so `#/watch/<id>` plays it for anyone.

**Evidence brought.** The game is a pure static site. No `api/` folder, no `vercel.json`, no server of any kind, and it deploys `--prebuilt` because a server-side install breaks on the pnpm catalog per `docs/deploy.md`. Option C therefore puts a server on a game that has none, changes a deploy recipe that took three hard-won constraints to get right, and adds an open upload endpoint.

The phone path for B already exists with no new plumbing: the file goes into Discord and the session pulls it out with `download_attachment`.

The agent flagged explicitly that this was a sequencing call and not a scope cut, since the tape format is identical under all three and C is a bolt-on rather than a rewrite.

**The agent recommended B now and C later.** Mark: "b now, c later".

### Question 7: How does a tape know it still replays the run it recorded?

**Options offered.** A, stamp the commit hash and refuse on mismatch. B, stamp a hash of `src/game`'s contents, injected at build time. C, stamp the run's own digest checksum at the end and at checkpoints, and recompute it on replay.

**Evidence brought.** A is far too broad: a typo in a README changes the commit hash and kills every tape, and this project commits several times a day. B is precise but still a proxy, saying the rules look the same rather than the run came out the same. C is not a proxy, and the machinery already exists as `foldEntities` and the `Digest` shape in `src/dev/digest.ts`.

C carries one real move: `foldEntities` lives in `src/dev`, which must never be load-bearing in the shipped game, and `caps.ts:10` says so outright. If replay ships, the fold has to move into `src/game`.

**The agent recommended C plus B**, on the grounds that they do different jobs: the checksum proves a single replay faithful, the rules hash stops metrics from two different games being averaged.

**Ruling.** Mark took C plus B, with the commit hash as informational metadata only, and confirmed moving the fold into `src/game`.

### Question 8: What module owns the tape?

**Options offered.** A, put the tape in `src/game` and the metrics in `src/dev/instruments.ts`. B, give the tape its own `src/replay` folder with its own row in `src/boundary.test.ts`.

**Mark stopped the question rather than answering it**, and he was right to:

> is all of this an architect-deep question?

The agent conceded: Question 8 is module structure, naming a boundary and classifying dependencies, which is exactly what `architect-deep` is for, and putting it as a two-way fork was the wrong shape. Questions 1 to 3 were genuine either/ors worth grilling; Question 8 was a design to be drawn.

`architect-deep` and `domain-modeling` were then run together, against five settled constraints. The full output is reproduced verbatim in section 3 below.

**Ruling.** Mark accepted the seven-module shape and `src/replay`, accepted the `Execution` record and the `measure(tape): Metrics | Divergence` interface, and approved the glossary change that `src/replay` depends on:

> I also like Witness for the checksum concept; use it unless the implementation reveals a stronger domain term.

### Question 9: How much RxJS lands in this dispatch?

**Options offered.** A, no RxJS this dispatch; build the sync hook and wire the recorder with a plain listener. B, RxJS with one stream, `executedTicks$`, and the recorder as its only subscriber. C, B plus moving `sound.ts` and the renderers onto a `simEvents$` stream.

**Evidence brought, and it reframed the question.** `src/dev` carries `mayImport: []`, so the instruments, by far the largest set of observers being built, can never import RxJS. Its only possible home is `src/app`, where this dispatch would give it exactly one consumer: the tape recorder.

Mark then asked for the sound and render argument in depth rather than accepting "it would be churn". That analysis is reproduced in full in section 5.

**The agent recommended A, while flagging that it was arguing against something Mark had leaned toward, on evidence found after he said it.** The reasoning: the thing that would justify RxJS, many independent observers composing over shared activity, is real in `src/app` later and structurally impossible in `src/dev` where most observers live, so adding it now would be adding it for the tape, which is the one thing Mark said not to do.

**Ruling.** Mark took A:

> The sound/render analysis makes the boundary clearer: their existing frame-batched `SimEvent[]` path is intentionally well-suited to raw dispatch and should not be converted just to establish RxJS.

> I still expect RxJS to be valuable in this project; I just do not want to manufacture a use case for it before one exists.

He attached a requirement, recorded in section 5: the ADRs must capture RxJS as an intentional future candidate for the observation layer, chosen against for now only because the use case has not earned the dependency, and never written up as a rejection or as a seam designed away from it.

### Question 10: What happens when a tape does not match?

**A refinement was brought before the options, and it changed decision 7.** The rules hash should never be a gate, because it can differ while the run still replays perfectly: a comment edit in `mobs.ts` moves the hash and changes nothing else. The witness is the only honest gate because it tests the outcome instead of a proxy.

**Options offered, and only for watching, since `measure(tape): Metrics | Divergence` already encodes refusal for metrics.** A, refuse everywhere. B, play through the last verified checkpoint then stop and say so. C, play the whole thing marked as recorded on an older version.

**Evidence brought.** A means that once sharing ships, every shared replay dies the moment anyone touches the sim. C shows frames after divergence that are a different run wearing the player's name, and labelling does not fix that. B never shows a frame it cannot vouch for, degrades instead of dying, and checking the witness at each checkpoint in the browser is a trivial fold.

**The agent recommended B.** Mark took it and restated the rule in his own words:

> Never show frames after the replay can no longer be verified as the original run.

> The witness is the only fidelity gate. The rules hash is for grouping/version context and should never block replay.

**Contradiction with the handoff summary.** Decision 7 as written in `continue-hungry-grave.md` describes the three-part stamp without saying the hash cannot block, and read on its own it implies the hash might gate. Decision 10 corrects it. The correct single statement is the one above.

### Question 11: How does an agent drive a screenshot replay?

**Options offered.** A, play at normal speed and pause, which means 133 seconds of waiting to screenshot tick 8000. B, run the sim with no rendering to the target tick, then render one frame. C, fast-forward with no rendering to a short lead before the target, then render the lead ticks normally.

**Evidence brought.** B was named as the obvious answer that is quietly wrong for this codebase, because `GameScreen.announce` starts two momentary effects that have no sim entity behind them, `stormRenderer.erupt` and `splashed`, and its own JSDoc says so. Fast-forwarding past them means the eruption, the thing a rendered check most needs to see, never appears.

**Mark did not answer. He demanded verification first, and it found a real bug in the proposal:**

> Please verify that all persistent visual gameplay objects, especially mob projectiles/fire, are reconstructable entirely from `RunState` by `syncScreen()` after a headless fast-forward.

> I want to make sure no projectile, mob visual state, animation state, or other long-lived visual object is created only through `SimEvent` handling in the renderer. If any are, the fixed lead-in strategy would need to account for their maximum lifetime too.

The verification is reproduced in full in section 4. The short version: every persistent visual is reconstructable, three effects are renderer-held, and the scatter is created by a frame-to-frame diff rather than an event, so a naive fast-forward would paint a shower of false scatters at stale positions.

**Ruling.** Option C, with two corrections that came out of the verification: the lead only needs 20 ticks and 60 is used for margin, and the lead must open with a priming sync that fills `shotMemory` without firing cancels. Mark stated the invariant:

> Persistent visuals remain reconstructed from authoritative `RunState`, while the rendered lead-in exists only to faithfully reproduce renderer-held transient effects.

He also approved reference tapes living in `public/tapes/` and shipping in the build.

**Contradiction with the handoff summary.** The summary records the 60-tick lead as settled and does not record that the agent's first proposal was 120 ticks, guessed rather than measured, and that the real maximum transient lifetime is 20 ticks. The 60 is margin over a measured 20, not a derived figure.

### Question 12: What ships in this dispatch?

**Options offered.** A, one dispatch carrying all nine pieces. B, two dispatches split at the seam.

**Evidence brought.** Dispatch 5 was thirty module sections and shipped two real defects that only Mark's play found, and this body of work is bigger.

The deciding property: 6a is a refactor of the deterministic core whose definition of success is that nothing changes. The digest folds state and stream cursors, never events, so `mobDamaged` cannot move it. The digest scenario drives `stepChecked` with its own `SCRIPT` and never touches the input path, so quantisation cannot move it either. So 6a's acceptance test is that `GOLDEN` does not move and the 653 tests stay green, and folding features in destroys that criterion, because a changed digest stops being unambiguous.

**The agent recommended B.** Mark took it:

> Preserve 6a as a tightly scoped deterministic-core refactor with the strongest possible acceptance criterion: the golden digest does not move and all existing tests remain green.

The split is set out in full in section 6.

## Rejected Alternatives

### Rejected on evidence

| Alternative | Why it failed |
|---|---|
| Tape on `RunState`, pushed by `step()` | Recording is not a game rule, and `RunState` is the digest's own subject. Rejected in principle by Mark, and the evidence for the alternative was that only two wrappers around `step` exist, so one authoritative boundary is a merge rather than an invention. |
| Tape as a `SimEvent` | 12,000 extra events per run flowing through sound and the renderers, which read every event. Cost with no payoff. |
| `executeTick` in a new RxJS-carrying folder | `src/dev` has `mayImport: []`, so the bot, the digest and every sim test could not reach it without widening that rule and pulling RxJS into every headless test run. |
| A listener array as an extra parameter on `executeTick`, `advance` and `runPolicy` | Makes the listeners optional at three call sites, and optional is how they get forgotten. Replaced by the `Execution` record. |
| `{ tick, command }` or `{ tick, command, events }` as the payload | Neither reaches the per-tick state samples on the metric list. Rebuilding them from events means a shadow copy of the rules that can drift. |
| Kill credit only, via `source` on `mobKilled` | At 1 damage per hit against 3 and 5 health, the last-hit line takes 100% of a kill it did 20% of. Wrong answer to the exact question the instrument exists for. |
| Both `mobDamaged` and a `source` on `mobKilled` | The same fact in two places, which goes out of step later. |
| Exact float64 commands in the tape | About 200KB packed or 500KB as JSON, per run. |
| Rounding inside the tape rather than at the input seam | Replay then feeds a different number in and the run drifts. Exactly the divergence ADR 0015 and the digest exist to catch. |
| Commit hash as the compatibility gate | A README typo invalidates every tape, and this project commits several times a day. |
| Rules hash as the fidelity gate | It can differ while the run replays perfectly. It is a proxy; the witness is the answer. |
| Refusing a diverged tape everywhere | Once sharing ships, every shared replay dies the moment anyone touches the sim. |
| Playing a diverged tape to the end with a version label | After divergence the frames are a different run wearing the player's name. |
| Real-time playback with a pause-at-tick | 133 seconds of waiting per screenshot at tick 8000. |
| Fast-forward with no rendering, then one frame | Misses the eruption and the splash, and paints false scatters. The obvious answer, and wrong for this codebase specifically. |
| Moving `sound.ts` and the renderers onto RxJS | Costs three guarantees and buys nothing for raw dispatch. Set out in full in section 5. |
| One dispatch carrying all nine pieces | Destroys 6a's acceptance criterion by making a changed digest ambiguous. |
| A separate Recorder module | Three lines in a listener. Folded into the tape module as an entry point. |
| A separate Player module | One line. Folded into the tape module. |
| A separate Quantiser module | One call site, the output of `combineSteer`. Inlined there. |
| A separate replay harness module | Folded into the instruments, which is what lets `measure` refuse to return numbers from a diverged replay. |

### Rejected on Mark's preference

| Alternative | His reason |
|---|---|
| Keeping `CommandSource` as the recording seam | Legitimate execution paths can bypass it. He chose to refactor the architecture rather than accept an observability gap. |
| The rule "`RunState` may never cross into RxJS" | He wanted the hazard named as a retained live mutable reference, not as RxJS itself, so the design does not treat RxJS as a wall. |
| Keeping `"contact"` in `DamageSource` | "I do not have a future rule in mind for it." |
| Bringing the backend with this work | Sequencing only. Sharing still ships, 100%. |
| Introducing RxJS now so the mechanism is ready | "I just do not want to manufacture a use case for it before one exists." |

## Section 3: The Module Sketch, Verbatim

Reproduced whole from https://md.niftymonkey.dev/v/3iNMJ8Vi. After this document exists, that URL is no longer load-bearing.

---

### The Hungry Grave: Record and Replay Architecture Sketch

Both skills loaded. Here is the sketch.

#### The candidates, after the deletion test

Eleven candidates. **Four got deleted**, and that is the useful part.

**Dropped: a Recorder module.** Delete it and you write `tape.push(command)` in a listener. That is three lines. But it does hold one real rule, that the seed and starting size are captured at run start. So it becomes an entry point on the tape module, not a module of its own.

**Dropped: a Player module.** Same shape. It is one line: hand back `tape[tick]`. It folds into the tape module too.

**Dropped: a Quantiser module.** It is a rounding function with exactly one call site, the output of `combineSteer`. Inline it there.

**Dropped: a Replay Harness module.** It folds into the instruments, and folding it buys something real. See `measure` below.

**Seven survive.**

| Module | Where | What concentrates there |
|---|---|---|
| **Execution** | `src/game` | The one authority. Today this complexity is already duplicated across `advance` and `stepChecked`. |
| **Witness** | `src/game` | What counts as the run's state, and how it folds to a number. Moved out of `src/dev/digest.ts`. |
| **Tape** | `src/replay` | A run you can hold, record, play back, write, and read. |
| **Steering** | `src/input` | Existing module, gains the rounding. |
| **Tape store** | `src/app` | Quota, eviction, naming, the last-N list. |
| **Observation** | `src/app` | The RxJS adapter over the sync hook. |
| **Instruments** | `src/dev` | Every metric, and the refusal to report one from a diverged replay. |

#### Dependency categories

Every one of them is **category 1, in-process**. The tape store is category 2, and `src/engine/utils/storage.ts` already exists as its stand-in.

**No category 3 or 4 anywhere. So this design needs no ports and no dependency injection at all.** That is worth saying out loud because it is the kind of thing that gets added on reflex.

One seam is real by the two-adapter rule. The sync listener hook on Execution has **two** genuine adapters: RxJS in `src/app`, and a plain direct listener in `src/dev` that must be able to throw. That is what makes it a seam rather than indirection, and it is independent confirmation of the call you made in Question 2.

#### The two interfaces that matter

**Execution.** I designed it twice. The version I rejected passes a listener array as an extra parameter to `executeTick`, `advance`, and `runPolicy`. It works, but it makes the listeners optional at three call sites, and optional is how they get forgotten.

```ts
interface Execution { run: RunState; listeners: readonly TickListener[] }
type TickListener = (tick: number, command: TickCommand, events: readonly SimEvent[], state: RunState) => void
executeTick(execution: Execution, command: TickCommand): void
```

A plain record, not a class, and no global registry. Listener order is array order, so it stays deterministic and one test cannot leak into another. `advance` and `runPolicy` both become loops over it.

**Instruments.** One entry point, and it is the reason the harness folded in:

```ts
measure(tape: Tape): Metrics | Divergence
```

It replays, checks the witness at every checkpoint, and **returns numbers only if the replay was faithful**. Silently-wrong metrics are not a thing this interface can produce. That is the whole leverage.

#### The naming problem, and it is your call

`CONTEXT.md` currently **bans the word "replay"**. It sits in the avoid-list under **Pinned run**: "_Avoid_: fixed run, replay."

So the module cannot be called `src/replay` unless the glossary changes. And I think it should change, because we now have two genuinely different things that the glossary has been treating as one:

- **Challenge**: you share a *seed*. Your friend plays it. Same dice, their hands.
- **Replay**: you share a *tape*. Your friend watches it. Your hands.

Those are not variations on each other. Folding them under "pinned run" is what forced "replay" onto the banned list in the first place, and that fold no longer holds.

My proposal: drop "replay" from Pinned run's avoid-list, and add **Tape** and **Replay** as their own entries in the funeral language. I would also propose **Witness** for the checksum, because a witness attesting to what happened is both accurate and in voice.

Does this module shape stand, with `src/replay` named on the back of that glossary change, or do you want it shaped or named differently?

---

## Section 4: The Renderer Verification from Question 11

### What was verified reconstructable from `RunState`

Every `sync*` method walks a pool in `RunState` and writes visibility, position and look from state. Nothing persistent is created only through event handling.

| Visual | Rebuilt by | From |
|---|---|---|
| Mob fire | `FieldRenderer.syncShots` | `run.mobFire`, per slot: `visible`, position, `halfExtent` |
| Mobs | `FieldRenderer.syncMobs` | `run.mobs`, including the ghoul's rotation from `Math.atan2(mob.vy, mob.vx)` |
| Corpses and drops | `FieldRenderer.syncCorpses` | `run.corpses`, with the tint from `freshnessBrightness(corpse, run.tick)`, a pure function of state and tick |
| Skulls, stones, wisps | `StormRenderer.syncSkulls`, `syncStones`, `syncWisps` | their pools |
| Bell ring | `StormRenderer.syncRing` | `run` |
| Grave, rim, glow | `GraveRenderer.sync` | `grave`, reservoir fullness, tick |
| Hit dim | `FieldRenderer.sync` | `run.grave.invulnerable / INVULNERABLE_TICKS` |

The `mobLooks`, `corpseTiers` and `shotExtents` arrays are redraw caches keyed on a look string rather than on identity, so a stale one costs a redundant redraw and never a wrong picture.

### The three renderer-held effects

| Effect | Lifetime | Created by |
|---|---|---|
| Eruption | `ERUPTION_TICKS = 20` | the `belched` event, via `StormRenderer.erupt` |
| Splash | `SPLASH_TICKS = 18` | the `splashed` event, via `StormRenderer.splashed` |
| Scatter | `SCATTER_TICKS = 12` | a frame-to-frame diff, not an event |

The maximum is 20 ticks. The agent's initial guess of a 120-tick lead was made before these were read.

### The scatter trap, in full

`FieldRenderer.cancelAt` fires when `shotMemory[slot]` was alive and the shot now is not, and when the remembered position was inside the field. That is a diff between two consecutive syncs. It is not driven by any `SimEvent`.

After a headless fast-forward, `shotMemory` still holds the state from before the jump. Every one of up to 400 `mobFire` slots that went alive-then-dead during the jump reads as a cancel on the first rendered frame. Each paints a scatter at the position it held before the jump, stamped with the current tick through `scatter.born = run.tick`.

That is a shower of wrong pixels, in the exact screenshot taken to check for wrong pixels. It is worse than a missing effect, because a missing effect is a false negative and this is a false positive.

The cure already exists in the file. `forgetPreviousRun()` does `shotMemory.length = 0`, and `syncShots` treats `seen === undefined` as no cancel, since `seen?.alive` is falsy. Its JSDoc says it is there so a pooled screen does not fire "a cancel read for a shot nobody saw". The lead-in must call it before its first sync.

## Section 5: The RxJS Reasoning, Both Halves

### Why sound and the renderers must not move onto RxJS

`advance()` loops ticks and concatenates their events. `GameScreen.update` then does three things in order: `announce(run, events)`, `syncScreen(run)`, `endedIn(events)`. So the batch is per frame, not per tick, and it is consumed after every tick in that frame has run.

That gives sound and render four guarantees.

1. Frame-batched delivery with post-frame state. `announce` passes `run` to `stormRenderer.erupt(run)` and `splashed(run)`. On a 30 Hz frame that is two ticks' events read against the state after both. The renderers sync once, from final state.
2. Total synchronous ordering, in the frame's own call stack, with no scheduler.
3. Per-event failure isolation. `playFor` wraps `sfx.play` in try/catch, and its JSDoc says why: "Sound is the one subsystem whose failure must never take the run with it."
4. No lifecycle at all. `announce` is a method call. There is nothing to subscribe or unsubscribe.

Two of those are not weakened by a bare `Subject`, and saying otherwise would be overclaiming. `Subject.next()` is synchronous and ordered, so ordering and latency both survive.

The three that do weaken:

**Per-tick versus per-frame semantics.** An `executedTicks$` stream fires per tick by construction, so `erupt` would see the state at the belch tick rather than at the end of the frame. Arguably more correct, but a behaviour change to ADR 0014's announcement channel, to be decided on its merits and never inherited from a plumbing swap.

**Failure isolation inverts.** In RxJS an error reaching a subscriber terminates that subscription permanently. One throw and sound is dead for the rest of the run, silently. The guarantee would have to be rebuilt with `catchError` per subscriber, which is the same defence written where forgetting it is invisible.

**Lifecycle stops being free.** `runHandoff.ts:25` records that screens are pooled and constructed with no arguments. A pooled screen that subscribes on show and misses an unsubscribe on hide leaks a live subscription per run, and the leaked one keeps receiving.

There is also a boundary cost specific to one file. `sound.ts` is the only file in `src/app` with a row in `src/boundary.test.ts`, holding it to `mayReach: ["app/getEngine", "game/events", "engine/audio/audio"]` and `mayImport: ["@pixi/sound"]`. Its own header says a folder rule would be the wrong instrument and a comment would be no instrument at all. Putting RxJS in it means widening the one allowlist the design deliberately fenced.

### Why RxJS is recorded as an intentional future candidate, not a rejection

Mark asked for this to be captured explicitly, and the ADRs must carry it in these terms.

RxJS was not evaluated and found wanting. It was found to have exactly one consumer in this dispatch, the tape recorder, because `src/dev` carries `mayImport: []` and therefore the instruments, the largest set of observers being built, can never import it. Adding a dependency for one consumer is the thing Mark ruled out when he said not to introduce RxJS merely because we need to record a tape.

The seam was deliberately shaped to accept RxJS later. `executeTick`'s synchronous listener hook is a real seam by the two-adapter rule, with RxJS in `src/app` as one adapter and a plain direct listener in `src/dev`, which must be able to throw, as the other. The adapter is about ten lines. Nothing in this design forecloses it, and nothing has been shaped around avoiding it.

Where RxJS genuinely earns its place, and where the agent expects it to arrive, is derived behaviour that the current path cannot express at all: throttling repeated hit sounds, debouncing a stutter, or combining two streams to say "belched while at the size floor". Those are compositions across time. Converting a synchronous ordered fan-out is not.

## Section 6: The 6a and 6b Split

### 6a, the deterministic core

`executeTick` as the single execution authority, replacing `advance()`'s inner loop and `stepChecked()`. The witness fold moved out of `src/dev/digest.ts` into `src/game`. `mobDamaged` added and `DamageSource` split per line, with `"contact"` deleted. The input quantiser in `src/input`. `src/replay` created with the `Tape` type, record, play, encode and decode, plus its row in `src/boundary.test.ts`. The two-replay determinism proof. The four ADRs. The glossary commit.

**The acceptance criterion is that `GOLDEN` does not move and the 653 tests stay green.**

That criterion holds because of two facts. The digest folds state and stream cursors and never events, so `mobDamaged` cannot move it. And the digest scenario drives `stepChecked` with its own `SCRIPT` at `digest.ts:260` and never touches the input path, so quantisation cannot move it either.

That is why nothing else may ride along. Fold a feature into 6a and a changed digest becomes ambiguous: refactor bug, or new feature. The one instrument that can prove the core untouched is lost on the exact dispatch that touches the core hardest.

**The confirming play for 6a** is that quantisation is the only thing in it a hand can feel, so "does the grave still steer the same" is a clean signal.

### 6b, the surfaces

The tape store, meaning file save plus `localStorage` with a dev screen for recent runs. The replay route at `#/replay?tape=<url>&at=<tick>`, taking a URL rather than a filename so the blob store later uses the same path, with the fast-forward, the priming sync and the 60-tick rendered lead-in. And `measure(tape): Metrics | Divergence` in `src/dev`.

## Agent Decisions, Open to Being Overruled

Everything here was decided by the agent rather than by Mark. Each is listed so it can be reversed without archaeology.

| Decision | Reasoning given |
|---|---|
| The ADRs wait for the 6a ticket rather than being written during the grill | Four are owed, and two of them came from questions 9 and 10, which were still open when the question was raised. Writing three early meant editing three later. |
| `src/app/runHandoff.test.ts:18`'s raw `step` calls are folded into 6a rather than fixed separately | It is precisely the rule break `executeTick` makes impossible, so an isolated fix would be a stray edit the refactor rewrites. |
| The `CONTEXT.md` glossary change stays uncommitted | Mark's standing rule is that ticket docs carry the ticket number in the commit message, and there is no ticket yet. |
| "digest" was left off the **Witness** avoid-list in `CONTEXT.md` | `Digest` is a distinct existing thing in the code, with a `#/digest` route and a `GOLDEN` constant, so banning the word would create a conflict rather than resolve one. |
| The quantisation grid is unset | The dialogue said "0.01 base-speed units"; the agent's working figure is `int16` at 1/256. Never put to Mark. The keyboard diagonal `1/sqrt(2)` is the constraining case. |
| The witness checkpoint interval is unset | The dialogue said "at the end and at a few checkpoints". The agent's working figure is every 600 ticks, about 20 per run. Never put to Mark. |
| The route shape `#/replay?tape=<url>&at=<tick>` was stated rather than asked | Mark said "proceed", so it is ratified by acceptance rather than chosen. |

## Open Questions the 6a Spec Must Close

- ~~**Do invariants run on every tick in production?**~~ **Closed by Mark on 2026-08-23: always on.** `stepChecked` ran the invariants on every step and only ever ran in dev; `executeTick` ships, and it carries them into production unconditionally. No build-time flag and no listener opt-in, because either one makes the honesty of a tape depend on which build recorded it. The cost lands on the player's frame budget and Mark accepted it knowing that. The 6a spec still owes the measurement of what that cost is at the densest authored moment, 47 mobs alive. **Correction 2026-08-23: the measured figure is 51, not 47.** The 47 is left as written because it is what the argument above was made on. `src/game/caps.ts` carries the current value and [research/invariant-check-cost.md](../research/invariant-check-cost.md) section 3a carries the measurement.
- **The quantisation grid**, per the table above.
- **The witness checkpoint interval**, per the table above.

## Continuation

- Handoff, gitignored: `continue-hungry-grave.md`
- Glossary, modified and uncommitted: `apps/hungry-grave/CONTEXT.md`
- Prior art for the instruments: `git show 5341031f47:apps/hungry-grave/src/game/instruments.ts`
- Founding ticket: #36. Map: #26.
