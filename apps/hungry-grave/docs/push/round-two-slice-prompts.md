# Round two slice prompts

One block per slice, in the order the design record's section 4 dispatches them. The launch preamble is the same for every slice: name the playbook, name the record sections carrying the dispatch contract items, then give the slice.

**Round two's coder contract is `step-4-coder-contract.md`, unchanged and still binding.** It carries how to work in the worktree, the commit and review rules, the progress note, the verification commands, what must not move in any slice, what is never a slice's job, and the stuck rule. Every block below names it and holds only what is its own.

**Three standing overrides of that contract, and they apply to every block below.**

1. **The ticket in the commit message is this slice's own, not `#39`.** The contract's "(#39), which is the ticket every step 4 docs and code commit cites" is step 4's. Round two's slices cite `#126` (H, I and H2), `#124` (the ADR commit, J, J-fix and J2), `#127` (K) and `#123` (L).
2. **The progress note is `apps/hungry-grave/docs/push/round-two-progress.md`, not step 4's.** The section numbers are fixed: **the ADR commit is 6, R-fix is 7, H is 8, I is 9, H2 is 10, J is 11, J-fix is 12, K is 13, L is 14, J2 is 15.** J2 dispatches before L and carries the higher number deliberately, because L's heading is already in the note and the note is appended to and never renumbered. Step 4's note is read and never appended to.
3. **Scratch under `local/` goes in `local/round2/`, and every file in it carries your slice's letter**, because the scratchpad is shared between agents and a generic baseline filename gets clobbered by another agent's.

**The design record is `apps/hungry-grave/docs/design/round-two-wall-belch.md`.** Its section 2 is ten rulings, each final, and **no slice reopens one**. Its section 5 is what must not move. Its section 6 is the verification list and the test sentences. Its section 7 is the two findings already filed for Mark, which no slice acts on.

**Line numbers in these prompts were read at tip `97fc911527`, and every slice moves some of them. Find the name, never the line.**

---

## The ADR commit: the two amendments and the stale concept sentences (#124)

Model: Opus, subagent type general-purpose. **One docs commit and no code commit at all.** The message ends in `(#124)`.

This is the design record's steps R1 and R2, folded into one commit because both land before the first coder and neither is code. **No coding slice may start until this commit is in the tree**: ADR 0008 as it stands says the belch kills and that nothing is pushed ever, so a belch test written before it is written against a rule that no longer holds.

**The standing rules are in `step-4-coder-contract.md`; read it first.**

### The work, in this order

**(a) ADR 0008 is amended in place and its filename moves with its title.** From `docs/adr/0008-the-belch-full-only-gas-everywhere-burst-nearby.md` to `docs/adr/0008-the-belch-full-only-gas-everywhere-shove-nearby.md`. **Move it with `git mv` and never copy-and-delete**, so the history follows the file, which is slice B0's precedent (`step-4-progress.md` section 13). The body's second paragraph states the decision as it now is, and a new dated paragraph carries the what-stood, what-it-replaced, what-it-could-not-have-known triple. The record's ruling R6 words all three parts and the wording there is the wording to use.

**(b) The two documents that link ADR 0008 by filename are repointed.** They are `docs/push/step-4-progress.md` and `docs/push/step-4-slice-prompts.md`, and the link text is the only thing that moves in either. **Say in the note that both are append-only process history and that only the link target was touched**, so nobody later reads the diff as a rewrite. `docs/design/dispatch-5-weapons.md:13` links a filename that has never existed, `0008-the-belch-full-only-the-bomb-everywhere.md`; that is pre-existing, it is not yours, and slice B0 already left it alone deliberately.

**(c) ADR 0042 is amended in place and its filename does not move.** The decision its title names is unchanged: a set piece names the property it must keep and never the cast. What moves is the Wall's own property, from the two-sided "stays crossable unloaded, and is never crossable for free" to a curtain costing more to cross than an unloaded grave has, opened by a belch. **Cannot pass means blocked by cost and never by an impassable body**, and the record's ruling R4 says why. The dated triple is worded in ruling R6 and the pre-ruled cut belongs to the Wall rather than to the rule.

**(d) The concept doc's two stale sentences, in its own voice.** `docs/design/game-concept.md` still says the belch's burst kills what it hits, in its belch section and again in its boss section, and still says the wisps pay "one corpse in, one theatrical volley out", which slice E's floored cadence ended: two swallows inside the floor pay one volley and the second is not banked (`step-4-progress.md` section 17). Correct exactly those claims and nothing else.

**(e) What you leave alone, and you say so in the note.** The concept doc's Wall paragraph still describes a lane's corpses raining down as the reward and the curtain's bodies as the ordinary trash mob. Both go stale under slice L rather than under this commit, and rewriting the Wall's paragraph ahead of the slice that decides it would put a guess in the doc. **Record it as a known stale passage with slice L as its trigger.**

**(f) No ADR gains a combat magnitude.** Not the shove's distance, not the wave count, not the new body's health. Those are data rows in the module that owns them, cited to the design record.

**(g) The note**, section **6**, titled "The ADR commit: the two amendments and the stale concept sentences (#124)". Say: both triples in one sentence each, the filename that moved and the two links repointed, the two concept sentences as they now read, and the Wall paragraph left for slice L.

**(h) Stop and report.** Under 150 words: the commit hash, the slug before and after, the two links repointed, the concept sentences corrected, and anything you left.

### What must not move

`step-4-coder-contract.md`'s list, whole. Plus: no code file is in this commit at all, no test moves, and no version constant moves. **If `pnpm verify` is not green before you commit, that is a stop**, because a docs-only commit that reddens the suite means you touched something you were not asked to.

---

## Slice R-fix: three tech gate findings, and no printed figure moves (#126)

Model: Opus, subagent type general-purpose. One coder, **one code commit and one docs commit**. Messages end in `(#126)`.

Round two slice R-fix of The Hungry Grave (ticket #126): three findings from the step 4 tech architecture gate, each a consistency fix and none of them a behaviour change.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to this slice.

**It runs before slice H.** It is cheap, it touches two files slice H's fold commit will also touch, and a tidy tree makes that fold's diff readable. **The ADR commit lands before you and you verify it**, though nothing here depends on either ADR.

**One ruling shapes the whole slice and it is the acceptance criterion as well as the constraint.** **No printed figure moves.** `GOLDEN` holds, `WITNESS_VERSION` 7 holds, `READINGS_VERSION` 4 holds, `FORMAT_VERSION` 4 holds, no batch reading changes its name, shape, meaning or reduction, and no tape recorded before this commit stops replaying. **Any one of those moving is a stop and report, never a re-pin and never a version bump.** If a fix cannot be made without moving one, that fix is not this slice's and it goes back to the orchestrator.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/round-two-wall-belch.md` section 4, where this slice sits, and section 5, what must not move.
4. `apps/hungry-grave/docs/push/step-4-progress.md` sections 18 and 19, for what slices F and G actually did to the three files below.
5. The tree: `src/game/director.ts` whole, `src/game/signalLock.ts` whole, `src/tape/records.ts` whole, `src/game/stage/waves.ts`'s `liveFormationCeiling` column and every cell that states one, `src/game/__tests__/director.test.ts` and `waves.test.ts`, and `src/__tests__/boundary.test.ts`, which fences `src/game` and `src/dev` and has **no fence over `src/tape`**, which is why finding 5 was not caught.

### The definition, in observable terms

After this slice: authoring a formation ceiling above one fails loudly rather than compiling and quietly meaning one. The tape codec imports nothing from the director, and the lock's own module still imports nothing at all. The director's spend answers its two scalar refusals before it allocates anything.

**Nothing a player meets changes, nothing a batch prints changes, and nothing a tape replays changes.** That is the acceptance criterion and it is checked rather than assumed.

### The work, in this order

**(a) Verify the tree is clean, capture your own test-name baseline** into `local/round2/` under a name carrying the letters Rfix, then read the five files whole.

**(b) Finding 4, the silent formation ceiling.** `ceilingMet` reads only whether `liveFormationCeiling` is null, never its value, so **authoring `liveFormationCeiling: 2` in `waves.ts` is a one-cell data edit that compiles, passes every test, and quietly means one**. `director.test.ts` asserts the Procession's cell is 1, which pins the datum and not the column. The gate names two closers and **either one is acceptable**: narrow the column's type so a 2 is a compile error and reads as the constraint it is, or add a test in `waves.test.ts` that fails if any section states a ceiling above one, with the ruling in its own comment. **The second is the code rules' own idiom for a deliberate absence**, which is the reason to prefer it, but the type narrowing is the stronger guard. **Choose one, say in the note which and why**, and say plainly that the ceiling's grain is coupled to `Mob.from`'s grain and that the coupling is invisible from the editing site.

**(c) Finding 5, the codec's import of the director.** `src/tape/records.ts` imports `holdableSignal` from `src/game/director`, so the codec, which imported nothing from `src/game` before step 4, now pulls `director.ts` and through it `run.ts`, `stage/waves.ts`, `stage/formations.ts` and `tuning.ts`. **`signalLock.ts` was written to import nothing, and its own JSDoc gives the reason**: that is what lets the sim, the header and playback all own the same type without any of them importing a consumer. **Move `holdableSignal` and the scale it reads into `signalLock.ts`**, leaving that module importing nothing and letting `director.ts` import the scale from where the lock already lives. **The parse-at-the-edge itself is right and the refusal message is good**: only the home of the names moves. **If a cheaper honest shape exists in the tree, take it and say why.**

**(d) Finding 6, the allocation before the gates.** `directorSpend` filters `CARDS` into an affordable array and only then tests the signal threshold and the quiet interval. **The quiet interval is 240 to 480 ticks, so on well over ninety per cent of ticks in a directed section that array is allocated and discarded by the next two lines.** Move the two scalar comparisons above the filter. **No draw happens before the last refusal either way**, so the property that a refused tick draws nothing is untouched and no cursor moves, which is #108's defect kept out by construction. **`ceilingMet` also allocates**, through a filter over a 481-slot pool plus an `includes` scan per slot, **but it already sits past the quiet gate and is not this slice's**: record it in the note as seen and left, with a counting loop named as the better shape at that pool size.

**(e) A fence over `src/tape`, and this is a judgment call you make and record.** Nothing caught finding 5 because `boundary.test.ts` has no fence over `src/tape`. **A fence would stop it recurring and it is one more rule in a file that already holds six.** Decide whether it belongs in this slice or is its own decision, **do it or record it as a finding with its trigger, and say which you did and why.** What you may not do is add it silently.

**(f) The proof that nothing moved, and it is the slice's real work.** Each of these is stated in the note with its figure.

- `digest.test.ts` green with `GOLDEN` untouched, and `git diff --stat` over `src/dev/digest.ts` answering with nothing.
- `src/game/witness.ts`, `src/tape/wireCodes.ts` and `src/dev/readingsVersion.ts` all absent from the diff entirely.
- **A tape recorded before this commit replays and verifies at this tip**, unchanged, which is what says the codec move cost nothing on the wire.
- **A batch at this tip against a batch at the tip below it, on the same seeds and the same configuration**, with every figure identical. `compare-batches.ts` withholds orderings across configurations, so **run the same configuration on both sides**. A figure that moved is a stop and report.
- **Replay determinism at this tip.**

**(g) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `refactor(hungry-grave): the ceiling refuses a figure it cannot honour and the codec stops reaching for the director (#126)`.

**(h) The progress note**, section **7**, titled "Slice R-fix: three tech gate findings, and no printed figure moves (#126)". Beyond the contract's list, say: which closer you chose for the ceiling and why; what moved into `signalLock.ts` and that it still imports nothing; the gate reorder with the refused-tick-draws-nothing property named as held; what you did about the `src/tape` fence; and **every one of item (f)'s proofs with its figure**.

**(i) Stop and report.** Under 200 words. **Do not start slice H.**

### What must not move, and a move is a stop

- **Every printed figure.** The acceptance criterion above, and the whole point of the slice.
- **`GOLDEN`, `WITNESS_VERSION` 7, `READINGS_VERSION` 4 and `FORMAT_VERSION` 4.** None of the four files is in the commit.
- **Every reading's name, shape, meaning and reduction.**
- **The director's own rules.** The signal's scale, weights and threshold, the six refusals and their order of effect, the purse figures, the quiet interval's bounds. **You reorder two gates that cannot change an answer and you change nothing else.**
- **`holdableSignal`'s behaviour and the refusal message it produces.** The names move and what they do does not.
- **Every cell in `waves.ts`.** You guard the column; you do not author a cell.
- **The six fences**, all green by title.
- **No ADR is filed or amended, and no ADR gains a combat magnitude.**

### Seams under test

`src/game/stage/waves.ts`: the formation ceiling column, guarded. `src/game/director.ts`: `ceilingMet` unchanged in behaviour, `directorSpend`'s two scalar gates ahead of the filter, and the scale imported from the lock's module. `src/game/signalLock.ts`: `holdableSignal` and the scale, with the module still importing nothing. `src/tape/records.ts`: the parse-at-the-edge unchanged, importing the lock's module and not the director.

### Module boundaries

**Nothing is created, deleted, merged or split.** One import direction is removed: `src/tape` no longer reaches `src/game/director`, which restores what `signalLock.ts` was written for. **`signalLock.ts` still imports nothing**, and that is the property to assert rather than to assume. **`src/game` still imports nothing from `src/dev`**, and `boundary.test.ts` proves it.

### The planned test list

1. *A section stating a formation ceiling above one fails loudly.* Whichever closer you chose, the sentence is this.
2. *The lock's module imports nothing.* Asserted rather than commented, because the comment was true and the tree drifted past it anyway.
3. *The tape codec imports nothing from the director.*
4. *A signal the header cannot honour is still refused at the decode, with the same message.* The behaviour held across the move.
5. *A refused tick draws nothing.* The existing promise, confirmed green over the reorder rather than rewritten.
6. **The six fences**, green, each by title.
7. **The golden digest**, unmoved, confirmed.

**What this slice is expected to turn red.** Almost nothing, and that is the point: import sites for the two moved names, `director.test.ts` and `waves.test.ts` over the new guard. **A realistic count is 4 to 10 files.** A diff larger than that is a reason to check what you reached into.

### Verification steps, with actors

1. **Agent.** Every proof in item (f), each with its figure.
2. **Agent.** A pre-commit tape replaying and verifying at this tip.
3. **Agent.** Two batches on the same seeds and the same configuration, one either side of the commit, with every figure identical.
4. **Agent.** The four version constants and `GOLDEN` untouched, with none of the four files in the diff.
5. **Human (Mark), and none of these blocks you.** Nothing. This slice has no player-facing half at all.

### State of the branch

- The tip should be the ADR commit. **`WITNESS_VERSION` 7, `FORMAT_VERSION` 4, `READINGS_VERSION` 4, `GOLDEN` checksum `-489751710`.**
- At slice G's tip, `pnpm verify` was green twice at exit 0: 144 test files, 1994 passed, 23 expected fail, 2 todo. The test-name list stood at 2017 names.
- **`pnpm verify` at the repo root can go red on this branch for a reason that is not your code.** `scripts/__tests__/measure.test.ts` compares a subprocess's stdout against an in-process call made seconds later while both embed a live `git status` digest, so a concurrent write anywhere in the worktree reddens it with a real assertion diff rather than a timeout. **Slice I fixes it. Until then, read the failure before calling it red**: a diff inside `buildMismatch.running` is that, and re-running the file alone on a still tree is the check.

### The stuck rule

**Two things are already known to be a stop:** any printed figure, version constant or `GOLDEN` moving; and a fix that cannot be made without moving one. **And one thing is a judgment you record rather than a stop:** whether the `src/tape` fence belongs here.

### What is not your job

- **The tech gate's findings 1, 2, 3 and 7.** Finding 1 is the pool allocation against the derived caps and it is the orchestrator's; finding 2 is the tree-stable test and it is slice I's; finding 3 is the director's refusal instrument, deferred with its own trigger; finding 7 is a card the mob cap refuses, deferred with its own trigger. **You fix three and you name the other four as not yours.**
- **The shove, the belch, the meter and the Wall**, which are slices H through L.
- **The record's section 7 findings**, which no slice acts on.

---

## Slice H: the shove is a body travelling, and the bell alone uses it (#126)

Model: Opus, subagent type general-purpose. **Two code commits and one docs commit**, which is this slice's one authorized departure from the contract's one-code-commit rule, and the reason is item (e) below. Messages end in `(#126)`.

Round two slice H of The Hungry Grave (ticket #126): a shove stops being a one-tick position write and becomes a body travelling, decaying to nothing over seven ticks, drawn at every position between, and the bell is its only caller.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice H.

**The ADR commit and slice R-fix both land before you.** Verify before your first edit that `docs/adr/0008-the-belch-full-only-gas-everywhere-shove-nearby.md` exists and that `docs/adr/0042-a-set-piece-names-the-property-it-must-keep.md` carries a 2026-09-15 triple. **Either one missing is a stop and report**, because the belch's no-push rule is still live in the tree until they land and you are about to build the thing that reverses it. Read round two progress note section 7 for what R-fix did to `director.ts`, `signalLock.ts` and `waves.ts`, so you do not re-derive it.

**Five rulings shape this slice and none of them is yours to revisit.**

**First: the shove is new per-body impulse state on `Mob`, folded, and `WITNESS_VERSION` moves 7 to 8.** The record's ruling R1. **You do not reach for `mob.vx`, `mob.vy` or `mob.beat`**: `canTouchGrave` reads `beat` to decide whether a body may hurt the grave, so a shoved body riding `beat` would go harmless while it flies, and ADR 0041 gives `beat` one meaning. **The version move is the orchestrator's, taken under one-push mode as the arithmetic of Mark's push ruling, and it is already written into the record and the handoff for his read.** It is not yours to question and it is not yours to skip.

**Second: the numbers are 10 units a tick, decaying linearly to nothing over seven ticks, 40 units in total at bell level five.** The record's ruling R2, and the precedent is Vampire Survivors' 120 milliseconds and the one fully numbered implementation's linear decay (`docs/research/push-feel-precedent.md` section 1). **They are data in a row with the precedent cited in that row's own JSDoc, never compiled magic and never an ADR's.** Today's level-five distance is held exactly: `BELL_CONE_ROWS`'s push column is unchanged and the shove spends it over seven ticks instead of one.

**Third: the walk is suspended for the shove's duration and resumes on the tick after.** Every source that speaks to it suspends the body's own motion rather than adding the shove on top. **Hit-stop, a sim pause and a render hold are all refused and none of them is reopened**: a sim pause changes the tick count and ADR 0015 makes the tick count the run.

**Fourth: the impulse carries the wave structure, and slice J is the cited caller for more than one wave.** The belch shoves in three waves ten ticks apart (ruling R3), and a global belch clock would be a second folded field owing a second version move this round does not have. **So the wave count and the ticks between waves live on the per-body impulse you declare here**, the bell passes one wave, and slice J passes three. That is the cited-future rule satisfied by a caller written down in the design record's section 4, and **you test the multi-wave path at the shove module's own seam rather than leaving it unexercised**.

**Fifth: `GOLDEN` re-pins here, and it is the first of round two's two.** Step 4's five slots are spent or forfeit and its spare is not round two's. The move is expected and its cause is mechanical: the fold gains fields, so the checksum moves even where no toll lands inside the scenario's six hundred ticks. **If anything other than the checksum moves, the reason matters far more than the number** and it goes in the note.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. The six dispatch contract items are the sections below.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md` at the repo root, plus `docs/agents/code-examples.md` for any rule that leaves the path unclear, and `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/round-two-wall-belch.md`, the whole record. **Section 0 is how the current shove actually moves a body and it is the thing your first edit deletes.** Section 2's rulings R1, R2, R3 and R8 are yours. Section 3 is the module shape. Section 5 is what must not move. Section 6 is the verification list and the test sentences.
4. `apps/hungry-grave/docs/research/push-feel-precedent.md` section 1 in full, which is where every number in ruling R2 comes from and which also says plainly what no source answers: no source documents a trail, a squash, a flash or an afterimage during a shove, so **you add no visual accompaniment the research does not carry**. Its Megabonk caution is the other side: a shove too strong or too frequent reads as chaos rather than force.
5. `apps/hungry-grave/docs/adr/0041-a-mob-holds-the-formations-arriving-motion-for-a-beat.md`, which is why `beat` is not available to you; `0019-the-witness-and-the-refusal-rule.md` and `0015-determinism-across-devices.md`, which are why the state is folded and why there is no pause; `0036-the-bell-is-a-timed-pulse-of-cones.md`, whose push column you are spending differently and not changing; `0007-bosses-always-shootable.md`, which is why an authored pattern is never smeared.
6. `apps/hungry-grave/docs/push/step-4-progress.md` **section 17 in full**, which is the worked precedent for a `WITNESS_VERSION` move: nine fields declared in one commit, the two partitions going red and being decided explicitly, and the dated paragraph in `digest.ts`'s JSDoc. **Section 2** for the `GOLDEN` history and **section 19** for where slice G left the branch.
7. `apps/hungry-grave/docs/push/handoff.md`, the standing rules and Mark's rulings of 2026-09-15, ruling 4 in particular, which is the sentence this slice exists to answer.
8. `apps/hungry-grave/CONTEXT.md`, the entries Mob, Repel, Bell, Storm and Witness. **Read the Avoid lists before naming anything.** If the shove needs a glossary entry, that is a finding for the note and a decision above you, not an entry you add.
9. The tree itself, before you write anything: `src/game/lines/bell.ts` whole; `src/game/stormTargets.ts` whole, which is 329 lines and is the seam every push goes through; `src/game/mobs.ts`'s `Mob`, `moveMob`, `advanceMobs`, `canTouchGrave`, `hasEntered` and `SPAWN_MARGIN`; `src/game/witness.ts` whole; `src/game/invariants.ts`'s `checkFinite` partitions; `src/game/events.ts`'s `mobShoved`; `src/dev/readings/repel.ts`, all 59 lines; `src/dev/digest.ts`'s `GOLDEN` and its dated JSDoc paragraphs; `src/app/screens/game/FieldRenderer.ts` around its `sprite.position.set(mob.x, mob.y)`; and `src/__tests__/boundary.test.ts` and `lineAgnosticPolicies.test.ts`, the two fences a new core module meets.

### The definition, in observable terms

After this slice: a bell toll throws a body away from the grave over seven ticks rather than one, and the body is drawn at a different place on each of them, none of them further from the last than the body's own width. The body's walk does not run while it flies and resumes on the tick after the shove ends. A shove never carries a body outside the field plus the spawn margin however large the impulse, and a boss and a set piece's source are never shoved at all. The total distance is what it was: 40 field units at bell level five.

Two runs on one seed with the same inputs rebuild identically with shoves in flight at a checkpoint. `WITNESS_VERSION` reads 8, every folded field it gained is named in one commit's own paragraph, and every tape recorded before that commit is refused by its version rather than diverging.

What a player meets: the bell's repel stops reading as a glitch. That is Mark's ruling 4 and it is the only thing in this slice a person can see.

### The work, in this order

**(a) Verify the two ADRs, then read the tree.** Per the stop above. Then `git log --oneline -25` and `git status --short`, and **capture this branch's own test-name baseline before your first edit**, into `local/round2/` under a name carrying the letter H.

**(b) The tests first, red, from the planned list below.** Write the shove module's own tests against a stub before the bell is touched at all, because the module is the unit and the bell is a caller. **Write the determinism test and the refusal test early**: they are what the version move costs, stated as tests rather than discovered.

**(c) `src/game/shove.ts`, a new module in `src/game`.**

- It owns **the impulse record**, **the decay row**, **the function that starts a shove** and **the function that advances every live shove by one tick**. Nothing else.
- **It imports nothing from `src/app`, `src/dev` or `src/game/lines`**, and nothing but the math helpers and the mob type from `src/game`. `boundary.test.ts` is what holds you to it.
- **The decay row carries the precedent in its own JSDoc**: 120 milliseconds is 7.2 ticks at this game's tick rate, the one numbered implementation decays linearly, and the readability criterion is that a per-tick step stays under a shambler's 22 units. Cite `docs/research/push-feel-precedent.md` section 1 by path.
- **The wave fields are on the impulse**, per the fourth ruling, with slice J named in their JSDoc as the caller that passes more than one.
- **The module's public interface is one export block at its end**, and it names no weapon line. `lineAgnosticPolicies.test.ts` is what holds you to that.

**(d) `Mob` gains the impulse, and `advanceMobs` advances it.**

- The fields go on `Mob` beside `vx`, `vy` and `beat`, in the tree's own idiom. **Name them for what they are and read the Avoid lists first.**
- **The advance runs inside `advanceMobs`, before the walk**, because by then the shove is the body's own motion and no line owns it. `moveMob` reads the impulse and skips the walk while one is live.
- **The body's position still changes through `moveStormTarget` and never by a raw write**, so the field-plus-margin clamp and the `pushable` answer stay in one place. The record's section 5 makes that a stop.

**(e) `WITNESS_VERSION` 7 to 8, in its own commit, and this is the first of the slice's two code commits.** It declares every folded field the slice adds, with a dated paragraph in `witness.ts`'s own JSDoc in the shape the version 6 and version 7 paragraphs use: what fields the fold gained, why each one folds, and that every earlier tape is now refused. **Both partitions will go red the moment your fields exist**, `witness.test.ts`'s and `invariants.test.ts`'s, and that is the mechanism working: decide about each field explicitly, in `FOLDED` or in `EXCLUDED` with its reason in prose. **A shove is written by the rules and rebuilt by a replay, so it folds; nothing here belongs in `EXCLUDED`.** Slice E's section 17 is the worked precedent for the whole of this item.

**(f) `bell.ts` rewired, and this is the second code commit.** `pushTarget` stops computing a destination and asks `shove.ts` to start one, keeping its own proximity arithmetic and its own row. **`toll.struck` is untouched**: it exists because a reach test alone is not enough once a push exists and its JSDoc says why, and a body shoved back across the leading edge still earns no second strike.

**(g) The `mobShoved` event, and you author its honest shape.** It carries `id` and `displacement` today, read back off the target after the write, and `repel.ts` sums it per toll. A multi-tick shove has no realized displacement at the tick it starts. **Two honest shapes exist**: fire once at the start carrying the distance the impulse will travel unclamped, or fire once at the end carrying what it actually travelled. **Author one, say in the note what you set it against, and pin it with a test.** What you may not do is fire it per tick, which would multiply the event count by seven and change what `repel.ts` means without a `READINGS_VERSION` move this slice does not have. **`READINGS_VERSION` stays 4 in this slice** and slice I owns the reading.

**(h) The invariants, and you add no fault identity.** The existing no-NaN partition reaches the fields you create, which is coverage rather than a new check, exactly as slice G's lock was. **`FAULT_IDENTITY_CODES` is closed and append-only by its own JSDoc (ADR 0024) and identities 1 to 22 are all held.** If you believe a new check earns a new identity, that is a stop and report.

**(i) `GOLDEN` re-pinned, per the fifth ruling**, with its dated paragraph in `digest.ts`'s JSDoc naming every field that moved and why. **Report the before and after checksum and every other field, moved or held.**

**(j) The measurements this slice owes.**

- **Replay determinism at your own tip, with shoves in flight at a checkpoint.** One seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors, byte-identical tapes. Say how you got a shove in flight at a checkpoint rather than assuming one was.
- **A conditioned tape at `bell=5`**, measured to `outcome: 'verified'`, because the bell's push is loudest at the top rungs and the birthright rig barely tolls at all.
- **A hand-recorded tape at your tip** against the built app through `vite preview`, driven with `playwright-cli`, measured verified, with `state.refusals` printed, all three counters.
- **A pre-H tape refused by its witness version**, with the message naming both numbers, rather than diverging at a checkpoint. **Say in the note that every tape recorded before this commit is now refused**, which is expected and is what the move costs.
- **A rendered check, and this slice plainly owes one.** A toll watched landing on a body, in the built app, with the shove visible across ticks. **Play a run, end it, and play another**, because a check that only ever plays run one is structurally blind. Read the screenshots rather than collecting them.
- **A batch at your tip**, a handful of seeds under `steady-far` and the same under `loose-far`, with the repel reading printed. This is not the orchestrator's batch; yours is the proof the mechanic works on real tapes.

**(k) CodeRabbit CLI, one iteration, before each code commit.** The standing rules are in `step-4-coder-contract.md`.

**(l) The progress note**, section **8**, titled "Slice H: the shove is a body travelling, and the bell alone uses it (#126)". Beyond what the contract asks of every note, say: the impulse's field names and what each is; the decay row's figures and the precedent cited beside them; **the nine-or-however-many folded fields and why each folds**, with the version paragraph you wrote; the `mobShoved` shape you authored and what you set it against; `GOLDEN`'s before and after with every field that moved; the pre-H refusal; the determinism result with the shoves-in-flight half named; the rendered check and what you actually saw; and the batch's repel figures.

**(m) Stop and report.** Under 300 words: the commit hashes, `WITNESS_VERSION` 8 moved once, `GOLDEN` re-pinned with both checksums, `READINGS_VERSION` 4 and `FORMAT_VERSION` 4 held, the decay row's figures, the `mobShoved` shape, the test counts before and after, the test-name diff's two figures, the three refusal counters, the CodeRabbit outcome, and anything you could not do. **Do not start slice I.**

### What must not move, and a move is a stop

The standing rules are in `step-4-coder-contract.md`; read it first. These are the ones this slice adds.

- **The fences**, per the contract, all six by title. **`src/game` imports nothing from `src/dev`**, and `shove.ts` living in `src/game` is that rule doing its work. **`lineAgnosticPolicies.test.ts` binds the bell to `stormTargets.ts`**, and it will now bind it to `shove.ts` as well.
- **`moveStormTarget` stays the only way a body is moved and `pushable` the only answer to whether it may be.** A raw write to `mob.x` from the shove module is a stop, not a shortcut.
- **`READINGS_VERSION` 4 and `FORMAT_VERSION` 4.** Neither moves in this slice and a move in either is a stop.
- **`WITNESS_VERSION` moves exactly once, to 8.** A second move anywhere in round two is a stop.
- **`BELL_CONE_ROWS`'s every figure**, the push column included. You spend the push over seven ticks and you do not change what it is.
- **`toll.struck` and its JSDoc.** The one-strike-per-toll rule is not yours to relax.
- **`beat`, `canTouchGrave` and ADR 0041.** Untouched, per the first ruling.
- **`STREAM_SALTS`, `STREAM_ORDER`, every fault identity wire number, and every cap.** A cap that binds in your batch is a finding and never a number to raise.
- **The harness's own rows.** `enoughClearance`, `belchWorthIt` and every lapse rate belong to the hand, and a hand row moved between two batches compares two builds through two instruments.
- **No ADR gains a combat magnitude and you file no ADR and amend none.** The two amendments already landed.

### Seams under test

`src/game/shove.ts`: the impulse record, the decay row, the function that starts a shove, the function that advances every live shove, and the module's public interface at its end. `src/game/mobs.ts`: `Mob`'s impulse fields, the advance inside `advanceMobs`, and `moveMob` skipping the walk while a shove is live. `src/game/lines/bell.ts`: `pushTarget` starting a shove instead of writing a destination, with `toll.struck` unchanged. `src/game/stormTargets.ts`: still the only mover, unchanged. `src/game/witness.ts`: the new folded fields and `WITNESS_VERSION` at 8. `src/game/invariants.ts`: the existing no-NaN partition reaching the new fields. `src/game/events.ts`: `mobShoved`'s shape. `src/dev/digest.ts`: `GOLDEN` re-pinned with its paragraph.

### Module boundaries

**One module is created, `src/game/shove.ts`, and nothing is deleted, merged or split.** It is imported by `mobs.ts` and by `lines/bell.ts`, and in slice J by `belch.ts`, which is ruling R8's two callers. **It imports nothing of the game's but the math helpers and the mob type**, so the arrows point inward and nothing points back out.

**`bell.ts` keeps its own proximity arithmetic and its own row**, because the falloff is the bell's and the decay is the shove's. **`stormTargets.ts` stays the one seam a body moves through**, which is what keeps a shove off a boss and inside the field. **`src/game` still imports nothing from `src/dev`**, and `boundary.test.ts` proves it.

### The planned test list

Each written red first, and each named as the sentence it promises. The record's section 6 is the source.

1. *A shoved body is visible at intermediate positions.* A body shoved 40 units stands somewhere different on each tick between, and no tick moves it further than its own width.
2. *A shove decays to nothing and the body resumes its own rule on the tick after it ends.*
3. *A shoved body's walk is suspended while it flies and its arriving beat is untouched by the shove.* Pins the third ruling and pins that `beat` was not borrowed.
4. *A shove never carries a body outside the field plus the spawn margin, however large the impulse.*
5. *A boss and a set piece's source are never shoved at all.* Pins ADR 0007 through `pushable`.
6. *A second shove landing on a body already flying resolves to one answer, the same on every replay of the same seed.*
7. *An impulse carrying more than one wave shoves again on the tick its row names.* The multi-wave path at the module's own seam, with slice J cited.
8. *The bell's toll strikes each body once, and a shove carrying a body back across the leading edge earns no second strike.*
9. *A shove at bell level five carries a body forty field units in total.* Pins that today's distance is held exactly.
10. *Two runs on one seed with the same inputs rebuild identically with shoves in flight at a checkpoint.*
11. *A tape recorded before the witness moved is refused by its version rather than diverging at a checkpoint.* Follow the shape of the existing refusals and **do not move the tapes they hold**.
12. **The fold's partition**, in `witness.test.ts`, naming every new field and refusing to pass until it is decided; and `invariants.test.ts`'s no-NaN partition the same way.
13. **The six fences**, green, each named by title.
14. **The golden digest** at `digest.test.ts`, re-pinned, with the before and after in the note.

**What this slice is expected to turn red, so the diff is read against something.** Everything folding a mob, everything constructing one, `bell.test.ts` over the push, `repel.ts`'s own suite over the event's shape, `witness.test.ts` and `invariants.test.ts`'s partitions, `digest.test.ts`'s checksum, and every tape fixture pinned at witness 7. **A realistic count is 20 to 45 files.** Slice E touched 55 for a comparable fold move and slice G 53. A diff much smaller than that is a reason to look for the tests that should have moved and did not.

### Verification steps, with actors

The standing rules are in `step-4-coder-contract.md`; read it first. These are the checks this slice adds.

1. **Agent.** `WITNESS_VERSION` at 8, moved in exactly one commit, with its own dated paragraph naming every field.
2. **Agent.** `GOLDEN` re-pinned once, with both checksums and every other field stated as moved or held.
3. **Agent.** `READINGS_VERSION` 4 and `FORMAT_VERSION` 4 held, each stated.
4. **Agent.** Replay determinism at this tip with shoves in flight at a checkpoint.
5. **Agent.** A conditioned tape at `bell=5`, verified.
6. **Agent.** A hand tape at this tip, verified, with all three refusal counters printed.
7. **Agent.** A pre-H tape refused by its witness version with both numbers named.
8. **Agent.** A rendered check of a toll landing, across two runs in one session, with the screenshots read.
9. **Agent.** A batch at this tip under both configurations with the repel channel printed.
10. **Human (Mark), and none of these blocks you.** Whether a toll now reads as a push rather than a blink, which is ticket #126's own done line. **The push runs in one-push mode: you continue past it and he reads it on the branch.**

### State of the branch

- **The tip should be slice R-fix's docs commit.** Below it the ADR commit, then `97fc911527` and `cd07ffb3f5` the step 4 handoff and slice G's note, `7f18ec83fe` slice G, `524bb68447` and `982536a5d5` slice F.
- At slice G's tip, `pnpm verify` was green twice at exit 0: 144 test files, 1994 passed, 23 expected fail, 2 todo, six fences green. The test-name list stood at 2017 names.
- **`WITNESS_VERSION` 7, `FORMAT_VERSION` 4, `READINGS_VERSION` 4, `GOLDEN` checksum `-489751710`.**
- The caps as slice D left them: `MOB_CAP` 481, `MOB_FIRE_CAP` 434, `CORPSE_CAP` 704, `WISP_CAP` 64 and `SKULL_CAP` 120. None binds today and one that binds in your batch is a finding.
- **A recurring anomaly worth not rediscovering:** a sibling worktree's `pnpm install` can repoint this worktree's `node_modules` links and leave them dangling, so a missing-module error is a reason to check the link targets first. It has recurred under slices C, D and E.

### The stuck rule

The standing rules are in `step-4-coder-contract.md`; read it first.

**Four things in this slice are already known to be a stop or a ruling, so you do not have to discover them:** either ADR missing, which is the slice's first planned stop; a second `WITNESS_VERSION` move; a new fault identity; and a `GOLDEN` move in anything other than the one re-pin. **And one thing is ruled rather than open:** `beat` is not available to carry a shove, and the reasons are in the first ruling.

**Green tests plus wrong observed behaviour means the test plan has a hole**: pin the wrongness as a new red test first, never patch first. A claim in this prompt or in the record that is false against the tree is recorded in the note and the source's intent is followed rather than its stale letter.

### What is not your job

The standing rules are in `step-4-coder-contract.md`; read it first. These are the ones this slice adds.

- **The belch, in every part.** Its kill, its waves, its event, its radius. Slice J's, and `belch.ts` is opened only to read.
- **The reading.** The repel reading's shape and `READINGS_VERSION` are slice I's, and you leave `repel.ts` alone except where the event's shape forces a compile fix, which you record.
- **The meter and its corner**, slice K's. **The Wall and the new mob type**, slice L's.
- **Territory's rungs**, #125, and #122 the offer bubble. Neither is round two's at all.
- **The two findings in the record's section 7.** The thumb zone and the per-minute hits-to-kill fall are filed for Mark and no slice acts on either.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.** Each needs its own explicit yes.

---

## Slice I: the shove is measurable, and three readings the batch could not answer (#126)

Model: Opus, subagent type general-purpose. One coder, one code commit, one docs commit. Messages end in `(#126)`.

Round two slice I of The Hungry Grave (ticket #126): the batch can say what a shove did and which of the two pushes did it, before the belch exists to confuse the reading, and three questions the 48-seed batch asked and the report structurally could not answer are answerable.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice I.

**Slice H lands immediately before you.** **Your first act after reading is to verify each of these by name in the tree, and any one missing is a stop and report:** `src/game/shove.ts` exists with the impulse, the decay row, the start and the advance; `Mob` carries the impulse fields and `witness.ts` folds them; `WITNESS_VERSION` reads 8; `bell.ts`'s `pushTarget` starts a shove rather than writing a destination; and `mobShoved` carries whatever shape slice H authored, **which is your reading's whole input**. Read round two progress note section 8 for what slice H actually did rather than trusting that list.

**Four rulings shape this slice and none of them is yours to revisit.**

**First: `READINGS_VERSION` moves 4 to 5, and it is not optional.** The record's ruling R9. `observeRepel` throws outright on a `mobShoved` arriving with no toll window open (`src/dev/readings/repel.ts:36-49`), which is exactly what slice J's first belch shove produces. **The belch emits its own shove event rather than the repel reading being widened to swallow both**, so the two pushes stay separable in every batch, and that is a change of comparison semantics on an existing reading, which is `readingsVersion.ts`'s own rule for when the version moves. **Every step 4 batch is thereby incomparable with every post-belch batch. That is accepted, it is written into the design record's ruling R9, and you write it into the version 5 note in the file's own shape.** Version 3 is the worked precedent: `levelUps` went from one flat row to named siblings and no row could be subtracted from its predecessor by name.

**Second: the belch's arm is declared here and emitted in slice J, and that is a cited future rather than speculative generality.** The cited-future rule asks for a caller written down, and slice J is written down in the design record's section 4 and in this file. **So the reading carries a belch arm that is provably empty at your own tip, and you pin that with a test that plants a belch shove event rather than by hoping.** The site names slice J in its own comment.

**Third: three more readings ride here, because the version is already moving and a second move is not available.** The design record's section 4 names all three and the 48-seed batch brief is where each was found missing. They are item (f) below and they are not optional extras: **the refusal counters, the per-add tick, and the tree-stable measure test**. A slice that lands the shove split and leaves the other three would spend the version move and still leave the report unable to answer verification step 10 off a batch.

**Fourth: `WITNESS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN` all hold, and a move in any is a stop.** You declare no folded field, you record nothing new in a header, and nothing under `src/dev` is folded, so the scenario's six hundred ticks run exactly as they ran at slice H's tip. **Round two's second `GOLDEN` re-pin belongs to slice J and you are not permitted one.**

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/round-two-wall-belch.md`, **ruling R9 in full**, which is this slice's contract, plus section 4 for where you sit and section 6's last test sentence.
4. `apps/hungry-grave/docs/adr/0053-the-playing-harness-is-one-policy-over-many-seeds.md` in full, because **the harness reports and never judges**: comparisons and never thresholds, a distribution and never a mean. Beside it `0021-the-instruments-purposes-are-an-open-pool.md` and `0013-the-sim-verification-contract.md`.
5. `apps/hungry-grave/docs/push/step-4-progress.md` **section 19**, which is the worked precedent for adding readings without moving the version and for the two declaration guards, and **section 8** of the round two note for slice H.
6. `apps/hungry-grave/docs/push/round-two-progress.md` section 7 for slice R-fix, which took the tech gate's findings 4, 5 and 6 and left finding 2 to you.
7. The tree: `src/dev/readings/repel.ts` whole; `src/dev/readings/readings.ts` whole, which is the one place the graph is declared; `src/dev/readings/pressure.ts` whole, which already holds the per-add tick; `src/dev/readingsVersion.ts` and its version 3 and version 4 notes; `src/dev/batchReport.ts`'s `BATCH_READINGS`, its declaration types and its `unfinished` and `ceilingStops` fields, which are the precedent for a figure that is not a `BATCH_READINGS` entry; `src/dev/harnessRun.ts`, which is where a run's own state reaches a report; `src/dev/compareRuns.ts`'s `READING_COMPARISONS`; `src/dev/__tests__/batchReadingDeclared.test.ts` and `comparisonDeclared.test.ts`, the two guards that will hold you to the tables; `src/__tests__/harnessStatesNoTarget.test.ts`, whose three rules you are most likely to trip; `src/game/run.ts`'s `RunState.refusals`; `src/game/events.ts`; **`apps/hungry-grave/scripts/__tests__/measure.test.ts` and `src/dev/__tests__/measure.test.ts`, both of them**, plus `src/tape/buildIdentity.ts` and `scripts/buildIdentity.ts`; and `src/game/belch.ts`, to read and not to touch.
8. `apps/hungry-grave/CONTEXT.md`, the entries Repel, Reading, Batch and Refusal. **Read the Avoid lists before naming anything.**

### The definition, in observable terms

After this slice: a batch says what each push did and which push did it. A bell toll's shoves are counted and totalled per toll as they are today. A belch's shoves are counted and totalled in their own arm, attributable to the belch and never filed under a toll, and the reading holds a belch's shoves without throwing. `READINGS_VERSION` reads 5 with a note saying what moved and that step 4's batches no longer subtract from post-belch ones by name.

A batch report also says what each of the three refusal counters read on every run it played, and where each directed add landed by tick rather than only by section, so an add inside one of ADR 0047's tick-range off-limits moments is visible from the report alone. And `pnpm verify` at the repo root no longer goes red because two reads of the tree disagreed.

`WITNESS_VERSION` still reads 8, `FORMAT_VERSION` still reads 4, `GOLDEN` has not moved, and `pnpm verify` is green, twice, with other work running in the worktree.

What a player meets: nothing at all. This slice adds no rule the simulation runs.

### The work, in this order

**(a) Verify slice H's five inputs before you write a line**, per the list above, and stop on any that is missing. Then `git log --oneline -25`, `git status --short`, and your own test-name baseline into `local/round2/` under a name carrying the letter I.

**(b) The tests first, red.** **Write the two that state what the version move costs first**: the belch arm holding a planted belch shove without throwing, and the toll arm still reading exactly what it read.

**(c) `mobShoved` gains its source, and the shape is yours to author within one rule.** The rule is that a reading must be able to say bell or belch without inferring it from a toll window, because inference is what throws today. **Author the discriminator, say in the note what you set it against, and take a cheaper honest shape if the tree shows one.** The bell fills it with the bell's own value; nothing fills it with the belch's until slice J.

**(d) The reading, split by source.** The toll arm keeps its exact name, its exact shape and its exact reduction, because that is half of what the version note has to be able to say. The belch arm is new beside it. **A `mobShoved` with no toll window open is no longer a bug and no longer throws when its source is the belch; it is still a bug when its source is the bell**, and that distinction is the whole of this slice. Keep the throw for the case that is still impossible and say so in its comment.

**(e) The graph, and the two tables.** The reading joins `readings.ts` in all four places the graph is declared. **Every new reading declares how a batch reduces it** in `batchReport.ts`'s `BATCH_READINGS` or `batchReadingDeclared.test.ts` stays red, **and declares what comparing it means** in `compareRuns.ts`'s `READING_COMPARISONS` or `comparisonDeclared.test.ts` stays red. **No mean anywhere**: `harnessStatesNoTarget.test.ts` forbids `meanOf` inside `batchReport.ts` outright, and `fiveNumbersOf` is what a distribution prints as.

**(f) The three readings the 48-seed batch could not answer, per the third ruling.** Each goes in beside what exists, each declares its reduction in `BATCH_READINGS` and its comparison in `READING_COMPARISONS`, and none of them renames or reshapes an existing key.

- **The three refusal counters, as batch readings.** `food`, `carriers` and `offers` live on `RunState.refusals` and the harness already reads them per tick, but **`Metrics` never carries them and `BATCH_READINGS` never declares them, so no batch report can print that row at all**. Verification step 10 asks for those counters at zero on every run and every slice so far has answered it off hand tapes instead. **They are the run's own state rather than a reading over events**, so say in the note which door you brought them through and what you set it against. **A non-zero counter is a fault and a finding, never a cap to raise**, and the reading exists so a batch can say so.
- **The per-add tick, carried into the batch report.** Adds file under `tuning.pressure.adds.<section>` today, so **ADR 0047's first off-limits moment is checkable from the report and the other three are not**: the sparse wave before each boss, the Wall, and the swarm set piece are tick ranges inside the Procession and the Crowd, and only a per-add tick can place an add inside one. **`DirectedCardSeen` already holds the tick**, so this is carrying a figure the reading has rather than deriving one it does not. **You report where adds landed and you build no rule on it**: whether an add inside one of those ranges is a defect is ADR 0047's question and the orchestrator's, not a gate you add here.
- **`scripts/__tests__/measure.test.ts` made tree-stable, which is the tech gate's finding 2.** It compares a subprocess's stdout byte for byte against an in-process `measure()` call made seconds later, and **both sides embed `buildMismatch.running`, a digest over a live `git status --untracked-files=all` and the contents behind it**, so any write anywhere in the worktree between the two reads reddens it. On this branch a docs agent and a headless batch share the worktree, so the condition is ordinary. **It is an assertion and not a timeout, so the contract's contention escape hatch does not cover it**, and a reader hitting it sees a real diff and reasonably suspects the codec. **The promise is that the shell prints exactly what the module returns, and that promise survives comparing the two with the identity fields lifted out, or computing the expected value inside the same window.** Neither weakens it. **Do not weaken it any other way**, and do not touch `buildIdentity` itself, whose behaviour is #82's and is correct.

**(g) `READINGS_VERSION` 4 to 5, with its own dated note** in the shape the version 3 and version 4 notes use: what changed meaning, why old and new reports are not directly equivalent, and that every step 4 batch is now incomparable with every post-belch one, taken eyes open on the design record's ruling R9. **Say in the note that the three readings in item (f) go in beside unchanged keys and are not what moves the version**; the repel split is.

**(h) `harnessStatesNoTarget.test.ts`'s module list is three modules and not the sixteen reading modules.** Slice G confirmed it rather than extending it (`step-4-progress.md` section 19). **Do not add your reading to it**; the two declaration guards are what hold a new reading.

**(i) The measurements this slice owes.**

- **A batch at your tip**, a handful of seeds under `steady-far` and `loose-far`, with the toll arm printed beside what slice H's batch printed. **They should agree**, and a disagreement is a finding about one of the two slices rather than a number to accept.
- **The belch arm proved empty at your own tip and non-empty on a planted event.** Both, stated.
- **Replay determinism at your tip**, because a reading that reached the sim would show here.
- **The three refusal counters printed off that batch, per run**, which is verification step 10 answered off a report for the first time. **Any non-zero counter is a fault and a finding.**
- **The per-add ticks printed off that batch**, with each add placed against the wave schedule, stated as a reading and never as a verdict.
- **The tree-stable test proved rather than assumed.** Run `scripts/__tests__/measure.test.ts` **while writing to the worktree from another process**, and show it green. Then say plainly what the comparison now covers and what it no longer compares.
- **No rendered check is owed and the claim is checked rather than assumed.** Nothing a player sees changes. If anything on screen looks wrong while you verify, say so.

**(j) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): a shove says which push threw it and the batch reads the two apart (#126)`.

**(k) The progress note**, section **9**. Beyond the contract's list, say: the discriminator you authored and what you set it against; the toll arm proved unchanged; the belch arm's two proofs; the version 5 note as you wrote it and the incomparability stated plainly; `WITNESS_VERSION`, `FORMAT_VERSION` and `GOLDEN` named as held; **which door the refusal counters came through and what you set it against**; the per-add tick's shape; and **what the measure comparison now covers and what it no longer compares**, with the concurrent-write proof.

**(l) Stop and report.** Under 250 words. **Do not start slice J.**

### What must not move, and a move is a stop

- **The fences**, all six by title, and `harnessStatesNoTarget.test.ts`'s three rules in particular: no reading ordered against a number of its own, no boolean in the report modules, no mean in `batchReport.ts`.
- **`WITNESS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN`.** None moves and a move in any is a stop.
- **Every existing reading's name, shape, meaning and reduction except the repel reading's own split**, which is the one thing this slice is permitted and the whole reason the version moves.
- **Slice H's work.** The shove module, the decay row, the impulse fields, the advance, the bell's rewiring. You read every one and author none again.
- **`src/game/belch.ts`.** Opened to read and never edited. Its kill is slice J's.
- **Every cap, every fault identity, `STREAM_SALTS` and `STREAM_ORDER`.**
- **`buildIdentity` and what it folds.** Its behaviour is #82's and it is correct: a tree with untracked work is uncommitted work. **The test changes, never the identity.**
- **`measure.test.ts`'s promise.** The shell prints exactly what the module returns, and it is still asserted. **Deleting the comparison, skipping the test, or comparing only a subset chosen for convenience is a stop.**
- **The director's own rules.** You carry a tick a reading already holds; you add no gate on where an add may land.
- **No ADR is filed or amended, and no ADR gains a combat magnitude.** **ADR 0047 is applied and not amended**, and applying a rule is not amending it.

### Seams under test

`src/game/events.ts`: `mobShoved`'s source discriminator. `src/game/lines/bell.ts`: the bell filling it, and nothing else about the bell. `src/dev/readings/repel.ts`: the toll arm unchanged, the belch arm beside it, and the throw kept for the case still impossible. `src/dev/readings/readings.ts`: the graph declared in all four places. `src/dev/batchReport.ts` and `src/dev/compareRuns.ts`: one declaration per reading in each table. `src/dev/readingsVersion.ts`: the version at 5 with its note. `src/dev/harnessRun.ts` and `src/dev/batchReport.ts`: the three refusal counters reaching a per-run report and declared as readings. `src/dev/readings/pressure.ts`: the per-add tick carried through to the report. `apps/hungry-grave/scripts/__tests__/measure.test.ts`: the comparison made independent of two reads of the tree.

### Module boundaries

**Nothing is created, deleted, merged or split, and no import direction changes.** `repel.ts` stays in `src/dev/readings/` with the other seventeen, reads `SimEvent` types like every one of them, and reads no sim state. **`src/game` still imports nothing from `src/dev`**, which is why the shove's instrument is a reading computed off a tape rather than a hook inside the sim, and `boundary.test.ts` proves it. `src/dev` still may not reach `src/app`.

### The planned test list

1. *The shove reading holds a belch's shoves without throwing.*
2. *A shove is attributed to the belch rather than to a toll.*
3. *A bell shove arriving with no toll open is still a bug and still throws.* The half that is deliberately kept.
4. *The toll arm reads exactly what it read before the split.* The half that the version note has to be able to say.
5. *The belch arm is empty on every tape this build can produce.* The cited-future half, with slice J named in the test's own comment.
6. *A batch report says what each of the three refusal counters read, per run.* Asserted over a batch where one is non-zero as well as one where all three are zero, so the row is proved to be able to say something.
7. *An add can be placed inside a tick range, so a directed add inside an off-limits moment is visible from the report alone.* The reading, not a rule.
8. *The measure tool's output is compared to the module's without either side depending on the tree being still between two reads.* **Proved by writing to the tree between the two reads and watching it stay green**, not by reading the code.
9. **The two declaration guards**, green over every reading added.
10. **The six fences**, green, each by title.
11. **The golden digest**, unmoved, confirmed rather than assumed.

**What this slice is expected to turn red.** `repel.test.ts`, everything constructing a `mobShoved`, `batchReport.test.ts`, `compareRuns.test.ts`, `harnessRun.test.ts`, `measure.test.ts` in both its homes, the two declaration guards and the readings' own suites. **A realistic count is 10 to 25 files.**

### Verification steps, with actors

1. **Agent.** `READINGS_VERSION` at 5, moved in exactly one commit, with its own note.
2. **Agent.** `WITNESS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN` all held, each stated.
3. **Agent.** A batch at this tip with the toll arm agreeing with slice H's.
4. **Agent.** The belch arm empty at this tip and non-empty on a planted event.
5. **Agent.** Replay determinism at this tip.
6. **Agent.** The three refusal counters printed off a batch report, per run.
7. **Agent.** The per-add ticks printed off a batch report, placed against the wave schedule.
8. **Agent.** `measure.test.ts` green while another process writes to the worktree.
9. **Human (Mark), and none of these blocks you.** Nothing. This slice has no player-facing half.

### State of the branch

- The tip should be slice H's docs commit. **`WITNESS_VERSION` 8, `FORMAT_VERSION` 4, `READINGS_VERSION` 4 until you move it, `GOLDEN` as slice H re-pinned it.**
- **Round two's `GOLDEN` budget is two, slice H has spent one, and the other is slice J's. You are permitted none.**
- Read round two progress note section 8 for the test counts and the test-name list at slice H's tip.

### The stuck rule

The standing rules are in `step-4-coder-contract.md`. **Three things are already known to be a stop:** any of slice H's five inputs missing; a `GOLDEN` move; and a `WITNESS_VERSION` or `FORMAT_VERSION` move. **If `mobShoved` does not carry what your reading needs, that is a stop and not a payload you widen yourself**, because widening it would reach into slice H's authored shape. **And one thing is ruled rather than open:** the refusal counters sit in `witness.test.ts`'s `EXCLUDED` as the harness's input rather than the run's state, which slice E ruled (`step-4-progress.md` section 17), so **reading them into a report does not fold them and does not owe a witness move**.

### What is not your job

- **The belch's behaviour**, slice J's. You declare the channel; you do not emit into it.
- **The other four tech gate findings.** Findings 4, 5 and 6 were slice R-fix's and are done; **finding 1**, the pool allocation against the derived caps, is the orchestrator's; **finding 3**, the director's refusal instrument, and **finding 7**, a card the mob cap refuses, are both deferred with their own triggers. **Finding 2 is yours and it is the only one of the seven you touch.**
- **Any rule about where a directed add may land.** You report the ticks; ADR 0047's question is the orchestrator's.
- **Slice H's work**, in every part.
- **The meter**, slice K's. **The Wall and the new mob type**, slice L's.
- **The orchestrator's batch**, the gates and the deploy.
- **The record's section 7 findings**, which no slice acts on.

---

## Slice H2: the push is retuned to be watched, and the bell's kill reaches less far than its shove (#126)

Model: Opus, subagent type general-purpose. One coder, one code commit, one docs commit. Messages end in `(#126)`.

Round two slice H2 of The Hungry Grave (ticket #126): the shove stops being over before the eye catches it, and the bell's damage stops reaching as far as its push, so what a player watches travel is a living body.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice H2.

**Slices H and I both land before you.** **Verify each of these by name before your first edit and any one missing is a stop and report:** `src/game/shove.ts` with `SHOVE_TICKS`, the impulse and `startShove`; `bell.ts`'s `pushTarget` starting a shove rather than writing a destination; `WITNESS_VERSION` 8; `mobShoved` carrying slice I's `source`; and `READINGS_VERSION` 5. Read round two progress note sections 8 and 9 for what those two slices actually did, and section 5 for the two claims slice H's own prompt got wrong against the tree; slice I's found-false claims are a subsection of section 9 rather than of section 5.

**Five rulings shape this slice and none of them is yours to revisit.**

**First: a push wave runs about half a second, fast at the start and slow to settle.** The record's ruling R2 as superseded on 2026-09-15, on Mark's read of the slice H build: *"7 ticks is basically still nearly the same as a frame to the human eye."* **The figure is 30 ticks a wave and it is `docs/research/watched-pushback-duration.md` section 5, option 2, which Mark picked.** What stood from the first ruling is the whole of the curve: a linear decay of velocity, which is the animation principles' slow out and which Smash and Nuclear Throne both ship (research section 4), and a per-tick step under a body's own width so successive drawn positions overlap. **It is one data row with its precedent in its own JSDoc, never a compiled magnitude and never an ADR's.**

**Second: the toll's throw keeps pace with the cone that threw it, and that is a derivation rather than a pick.** R2 again: the total throw is the distance a body covers when its first step matches the leading edge of the cone that struck it. The cone's edge moves at its own row's `reach` over `BELL_EXPAND_TICKS`, and a linear decay over `SHOVE_TICKS` from a first step `s` covers `s * (SHOVE_TICKS + 1) / 2` (`shove.ts`, `firstStepOf`). **At level five that lands on option 2's own 90 field units**, which is the check that the derivation is the one the research did: 261 over 45 is 5.8 units a tick, and 5.8 spent down to nothing over 30 ticks covers 90. **Every row of the push column is re-derived the same way from its own `reach`**, because R2 makes the relation the ruling and the column the data; you report all five figures in the note.

**Third: the bell's damage reaches less far than its push, and the drawn cone is the push.** The record's ruling R10, new with Mark's pick. `proximity` is one falloff shared by damage and push today, and solved against a body's health it leaves a shambler dead everywhere inside a rung-three cone and shoved half a field unit at most where it survives (research section 1), so **no duration and no curve lets a shambler be seen travelling until the two reaches are two rows**. Enter the Gungeon's Blank is the shape that fixes it, damage in a 7-tile radius inside a wider knockback (research section 3, which is the primary source for the Blank and which (e) below reads in full, because the ratio has two readings), and it is what option 2 carries with it. **`reach` keeps its name and its meaning, the push and the drawn cone both**, and the damage reach is the new row beside it.

**Fourth: the fringe is measured here rather than assumed.** R10 states the gap it leaves plainly: inside the damage reach a body still dies where it stands, so what the player sees is a kill line with a pushed fringe, and the Blank's every-body-flies read needs the second lever too. **That second lever, damage and travel on separate clocks, is held and is not yours**: a corpse finishing a flight is a corpse carrying an impulse, which is new folded state and a second `WITNESS_VERSION` move this round does not have. **So you print the share of struck shamblers that travel alive at rungs one, three and five**, and a rung where none ever does is a finding for the note and the orchestrator's, never a row you move to fix it.

**Fifth: `GOLDEN` cannot move here, and a move is a stop and report rather than a re-pin.** The record's ruling R9 as held on 2026-09-15: `digest.ts`'s canonical scenario runs `levels.bell` at 0 for the whole of its six hundred ticks and scripts `belch: false` on every tick, so no toll fires and nothing this slice changes can reach it. **Round two's budget stays exactly two, one spent in slice H and the second still slice J's.** If the digest moves, the reason matters far more than the number: stop and report it rather than re-pinning.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. The six dispatch contract items are the sections below.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md` at the repo root, plus `docs/agents/code-examples.md` for any rule that leaves the path unclear, and `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/round-two-wall-belch.md`. **Rulings R2 and R10 in full are this slice's contract**, R9 is why `GOLDEN` is a stop, section 4 is where you sit in the order, section 5 is what must not move, and section 6 is the verification list and the test sentences, two of which are new promises this slice makes. The third new promise in the planned list below, that a toll takes nothing at all off a body outside its damage reach and marks it struck all the same, is this prompt's own and is in no record.
4. `apps/hungry-grave/docs/research/watched-pushback-duration.md`, **the whole record, and section 5's option 2 is where every figure in this slice comes from**. Section 0 is the post-mortem on the record it replaces and it is worth your time: a craft question framed as "how long is X in shipped games" instead of "how long must X be for the player to see it" produced `SHOVE_TICKS` 7. Section 1 is the finding that outranks every duration. Section 4 is the perception floor, and the honest counterexample in it is why no visual accompaniment is added here either.
5. `apps/hungry-grave/docs/research/push-feel-precedent.md` section 1, **only so you know what you are replacing**: it is the record `SHOVE_TICKS`'s JSDoc cites today and the citation moves off it in this slice.
6. `apps/hungry-grave/docs/adr/0036-the-bell-is-a-timed-pulse-of-cones.md`, which already makes every bell figure a tuning row and already says the push is the half that has to be felt, so **no ADR moves in this slice**; **Mark's 2026-08-19 ruling that the far edge tickles rather than kills is recorded in that same ADR 0036, in its own first paragraph**, which also says the curve behind it is tuning data; `0005-weapon-lines-are-a-pool.md`, which ADR 0036 was extracted from on 2026-08-26 and which is **not** where that ruling lives, though `bell.ts`'s `BELL_DAMAGE_FAR_BY_LEVEL` JSDoc credits it there and (f) below corrects that; `0059-a-trash-minute-is-a-mow-and-density-is-bought-with-weak-bodies.md`, whose one-touch mow body is why the far edge deletes trash at the top rung today; `0007-bosses-always-shootable.md` and `0015-determinism-across-devices.md`.
7. `apps/hungry-grave/docs/push/round-two-progress.md` **sections 8 and 9 in full**, which are slice H's and slice I's own accounts, and **section 5**, which is where slice H's own prompt was found false against the tree, slice I's found-false claims being a subsection of section 9. Section 8's "the push at the top rungs" is the measured finding R10 answers, and section 8's checkpoint arithmetic is in the measurements below.
8. `apps/hungry-grave/docs/push/handoff.md`, the standing rules and **Mark's rulings of 2026-09-15, ruling 8 above all**, which is the read this slice exists to answer.
9. `apps/hungry-grave/CONTEXT.md`, the entries Bell, Cone, Toll and Mob. **Read the Avoid lists before naming anything.** The Cone entry moves in this slice and the Bell entry does not.
10. The tree itself, before you write anything: `src/game/shove.ts` whole; `src/game/lines/bell.ts` whole, `BELL_CONE_ROWS`, `proximity`, `pushTarget`, `sweepToll`, `tollReach`, `bellDamageNear` and `bellDamageFar` above all; `src/game/lines/__tests__/bell.test.ts` whole, which is 817 lines and where most of your reds are; `src/game/__tests__/shove.test.ts` whole; `src/game/mobs.ts`'s `travelShove`, `reportShoveTravel` and `moveMob`; `src/dev/readings/repel.ts`, all of it, for the window a shove is held in; `src/dev/digest.ts`'s `GOLDEN` and its scenario; and `src/app/screens/game/FieldRenderer.ts` around its `sprite.position.set(mob.x, mob.y)`.

### The definition, in observable terms

After this slice: a body a toll strikes travels for about half a second rather than a tenth of one, settling to nothing, and it is drawn at a different place on every tick of it with no step wider than its own body. **The body that leaves at the speed of the cone edge that struck it is the body standing at the grave**, where `proximity` is one and the push row is spent whole; a body further out leaves slower by that same falloff, which is what the column's figure means and what a test pinning the relation has to stand on. A body in the outer part of a drawn cone is shoved and lives; a body in the nearer part is damaged as it always was. The drawn cone still marks how far the push reaches, so nothing is shoved by something the player cannot see.

`WITNESS_VERSION` reads 8, `READINGS_VERSION` reads 5, `FORMAT_VERSION` reads 4 and `GOLDEN` is exactly where slice H pinned it. The batch can still say what the bell's shoves did, in the toll arm slice I split out, and it now says it about bodies that are alive to be watched.

What a player meets: a toll reads as a force going out rather than as a blink, and the mow body is what he sees pushed. That is Mark's ruling 4 and ruling 8 of 2026-09-15 together, and his read of the deployed build is ticket #126's own done line.

### The work, in this order

**(a) Verify the five inputs**, per the stop above. Then `git log --oneline -25` and `git status --short`, and **capture this branch's own test-name baseline before your first edit**, into `local/round2/` under a name carrying the letters H2.

**(b) The tests first, red, from the planned list below.** **Write the two new promises first**, that a struck body keeps pace with the cone's leading edge and that a body at the drawn cone's far reach is shoved and survives, because they are the two sentences this slice exists to make true and everything else is a figure moving under them.

**(c) The decay row, in `shove.ts`.** `SHOVE_TICKS` moves to option 2's 30. **Its JSDoc is rewritten rather than edited**: the citation moves from `docs/research/push-feel-precedent.md` to `docs/research/watched-pushback-duration.md` section 5, option 2, and it carries what the new figure is derived from, that 30 ticks is half a second at this tick rate and sits inside the usable band the perception work names rather than at its floor (research section 4). **The readability criterion stays and is restated in the row's own arithmetic**: the first step of the level-five throw is well under a shambler's 22 units, so successive drawn positions still overlap, and that is the same criterion the old figure met by a different route. **Nothing else in `shove.ts` changes**: `firstStepOf`, the fall's shape, the wave fields and the accounting are all slice H's and all still right.

**(d) The push column, re-derived.** Every row of `BELL_CONE_ROWS`'s `push` column is the throw its own `reach` earns under the second ruling, and **the arithmetic goes in the column's own JSDoc beside the figures** with the record's R2 and the research's section 5 cited by path. **Level five is the check**: the derivation has to land on option 2's 90, and a row that does not is a reason to re-read the arithmetic rather than to pick a number. **The column is whole units**, so what the level-five derivation actually reads is 89.9 and the row is 90: the rounding is the check rather than an exact hit, and every other rung rounds the same way off its own `reach`. **`reach`, `headings` and `halfAngle` do not move.**

**(e) The damage reach, the new row beside `reach`.** `ConeRow` gains a second reach, the one damage falls off over, and **`proximity` is computed twice**: once against `reach` for the push and once against the damage reach for the damage. **Name it for what it is and read the Avoid lists first.** **`proximity` clamps at zero rather than going negative**, so the second call returns zero for every body outside the damage reach and the damage it feeds still reads the far row, 5 to 13, rather than nothing: **the nothing in (f) is a guard before `damageStormTarget` and never a consequence of the falloff**. **`proximity`'s own JSDoc, which says today that damage and push "share it deliberately", is rewritten to state the constraint the code cannot show**: there are two reaches, R10 is the ruling, and a falloff shared between them leaves no living body to watch (research section 1). It says nothing about what the code used to do, because planned tests 2 and 3 are what guard the absence.

**The Blank is the precedent for the ratio, and two figures for it are in front of you.** Research section 3 is the primary source and carries both after its 2026-09-15 correction: the 15-tile knockback the record first read against a 7-tile damage radius, a ratio of 0.47, and the shipped `Blank.prefab` in the `fedes1to/EtG-source` decompile, which reads `knockbackRadius: 10` and `pushRadius: 10` against the same damage radius of 7, a ratio of 0.7, with 15 appearing in no prefab at all. **The ratio is a row either way**: pick one, say in the note which and why, and **the fringe measurement in (l) is what judges it**, because at 0.47 the living fringe is roughly twice as wide and twice as fast as at 0.7. The rows are data and you print all five in the note.

**(f) What a toll does to a body outside its damage reach, and you author it.** R10 says the damage falls to nothing at a reach inside the push's. **The rows the damage is read off do not move**: `BELL_DAMAGE_NEAR_BY_LEVEL` and `BELL_DAMAGE_FAR_BY_LEVEL` keep their figures and their eighth-ratio, which is Mark's 2026-08-19 ruling held in ADR 0036, so what changes is where the far edge stands and not what it carries. **Outside the damage reach a toll takes nothing at all**, and a zero-damage event is not the way to say so: a count a reading can sum must never carry a hit that took nothing. **`toll.struck` still marks the body**, because the one-strike rule is about the toll reaching it and a shoved body crossing the edge again still earns no second strike. Pin all three with tests.

**The damage reach's own edge is inside it, and the test list needs that.** `sweepToll` already treats the expanding ring that way, `distance > now` and not `>=`, so the new guard reads `distance > damageReach` and a body standing exactly at the far edge of the damage reach is damaged, taking the far row, which is what planned test 7 stands on.

**One citation beside what you are already editing.** `BELL_DAMAGE_FAR_BY_LEVEL`'s JSDoc says Mark's 2026-08-19 far-edge ruling is "recorded in ADR 0005 and held as a ratio in ADR 0036". It is recorded in ADR 0036 itself, in that ADR's own first paragraph; ADR 0005 is the record ADR 0036 was extracted from on 2026-08-26 and it rules nothing about the far edge. **Correct the citation and move no figure**, and say in the note that you did.

**(g) `bell.test.ts` re-handed, and this is most of the diff.** Three kinds of change and each is named in the note.

- ***carries a body at level five the forty field units the row has always said*** is a measured baseline whose input moved. **Retitle it, re-pin it to the row's new figure, and put the triple in its own comment**: what stood (the row is what the shove spends, exactly, and the push column is still the tuning surface), what it replaced (the forty units held from before round two), and what it could not have known (that forty units reaches a living body as half a unit, research section 1). Slice D's spec test 26 is the worked precedent for this shape.
- ***takes exactly two tolls to kill a shambler at the cone's full reach, at the rung a run is born on*** now names a reach where nothing is damaged at all. **Its promise moves to the damage reach's own far edge**, where the far-edge row still says what it always said, and the drawn cone's full reach gets the new promise instead: shoved and alive.
- **The two `it.fails` tripwires are expected to go green, which means they stop being tripwires.** *still needs more than one toll at the far edge at the top rung* and *leaves survivors from that same curtain at the bell's top rung* both exist because at rung 5 the far edge carries 13 against a mow body's 8, and R10 removes that cause by putting the outer part of the cone outside the damage reach entirely. **Write each as an ordinary assertion with the ruling in its comment**, and **if either still fails, that is a finding for the note** and the reason goes with it, not a row you move to make it pass.
- The helpers `oneTollAndTravel` and the two loops over `BELL_PERIOD + BELL_EXPAND_TICKS + SHOVE_TICKS` widen with the constant and need no edit; check them rather than assume.

**(h) `shove.test.ts`.** Its R2 and R3 blocks pass their own figures rather than reading the bell's, so most of the file survives untouched. **What does not survive is a sentence in a comment**: the block's own reasoning cites the old record and the old first step. Re-read every comment in that file against the new figure and correct the ones that are now false, and say in the note which. One more comment sits outside that file: `src/dev/__tests__/harnessPolicy.test.ts` carries a measurement narrative saying a toll carries bodies "over seven ticks", and the retune makes that sentence false too. Correct it to name `SHOVE_TICKS` rather than a figure, moving no assertion, and say so in the note.

**(i) The repel reading's window, which is prose rather than a figure.** `observeRepel` throws outright on a `mobShoved` arriving with no toll window open, and the one report a shove makes now arrives up to thirty ticks after the toll's edge reached the body where it arrived seven before. **There is no tick bound in `repel.ts` to widen**: `countTollShove` lands every bell shove in the last toll window opened and throws only when no toll has ever fired. **The only seven in that file is one sentence in the `Repel` interface's own JSDoc**, "up to seven ticks of travel after it", and correcting that sentence is the whole of the edit. **What you owe beside it is the check**: `BELL_EXPAND_TICKS` 45 plus `SHOVE_TICKS` 30 is 75 against a `BELL_PERIOD` of 180, so every shove still reports before the next toll opens and attribution still holds. **Expect no red in that suite**, and a throw in your own batch would mean that arithmetic is wrong rather than that the reading is. **`READINGS_VERSION` does not move**: the arm means exactly what it meant, over a shove that takes longer.

**(j) `CONTEXT.md`'s Cone entry.** It reads today as a cone "damaging what its leading edge crosses and pushing at every level", and it moves to a cone that **pushes what its leading edge crosses and damages the nearer part of what it crosses**, which is R10's own wording. Keep the entry's shape, its tuning-row sentence and its Avoid list, and re-read its code citation rather than trusting the one that is there. **The Bell entry does not move** and neither does any other entry; if you think one should, that is a finding for the note.

**(k) `GOLDEN`, per the fifth ruling.** Run `digest.test.ts` and state the checksum. **If it holds, say why it should have.** If it moves, stop and report.

**(l) The measurements this slice owes.**

- **The fringe, per rung, and it is R10's own ask.** The share of struck shamblers that travel alive at rungs one, three and five, printed per rung, off a run rather than off the source. Slice H's scratch instrument under `local/round2/` is the precedent for how to get a number the tape cannot print; whatever you build, say what it measured and over how many tolls.
- **A conditioned tape at every line's rung 5, seed 77, 6000 ticks**, measured to `outcome: 'verified'`, **which is the same rig slice H and slice I both measured on** and reads 33 tolls, 2 shoves and 20.09 field units at slice I's tip. Print the same three figures at yours. The point of the slice is that the two later ones move.
- **A hand-recorded tape at your tip** against the built app through `vite preview`, driven with `playwright-cli`, measured verified, with `state.refusals` printed, all three counters.
- **Replay determinism at your tip.** One seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors. **The shoves-in-flight half is worth measuring again rather than inheriting**: slice H proved by arithmetic that a 60-tick checkpoint grid against a 180-tick bell period puts the in-flight ticks in a fixed residue band, measured at 27 to 51 mod 60 and never reaching 0, **and a thirty-tick shove is wider than that band was**. Measure the residues at your own figure and say which answer you got. If a checkpoint now catches a shove in flight, that is the blind spot closing and it is worth a paragraph.
- **A rendered check, and this slice plainly owes one, because the whole of it is a thing a person looks at.** A toll watched landing on a body in the built app. **Play a run, end it, and play another**, because a check that only ever plays run one is structurally blind. Read the screenshots rather than collecting them. **Slice H could not photograph a seven-tick shove and wrote down why**: the headless browser draws this build at 3 to 5 frames a second and the app answers by running twenty to thirty sim ticks per drawn frame. **A thirty-tick shove is four times longer and may well be catchable now**; try it, and if it is not, say so as plainly as slice H did rather than dressing up a screenshot that shows nothing.
- **A batch at your tip**, a handful of seeds under `steady-far` and the same under `loose-far`, with the repel reading printed, toll arm and belch arm both. Slice I's own twelve seeds are 900 to 905 under each hand and its table is in note section 9, so **use the same seeds and your figures are subtractable against it**.

**(m) CodeRabbit CLI, one iteration, before the code commit.** The standing rules are in `step-4-coder-contract.md`. Something in the shape of `feat(hungry-grave): a toll's push runs long enough to watch and reaches further than its damage (#126)`.

**(n) The progress note**, section **10**, titled "Slice H2: the push is retuned to be watched, and the bell's kill reaches less far than its shove (#126)". Beyond what the contract asks of every note, say: the new decay figure and the JSDoc you wrote for it; **all five push rows with their derivation**; **all five damage reaches with the ratio you used and what you set it against**; what a toll does outside its damage reach and how you pinned it; every `bell.test.ts` test you retitled, re-pinned or converted, with the triple for each baseline that moved; the two tripwires' fate; the repel window; the Cone entry as you rewrote it; `GOLDEN` held with the reason; **the fringe per rung**; the conditioned tape's three figures beside slice I's; the determinism result with the residue answer; and the rendered check and what you actually saw.

**(o) Stop and report.** Under 300 words: the commit hashes, the decay figure, the level-five push and damage reaches, `GOLDEN` held, `WITNESS_VERSION` 8, `READINGS_VERSION` 5 and `FORMAT_VERSION` 4 all held, the fringe per rung, the test counts before and after, the test-name diff's two figures, the CodeRabbit outcome, and anything you could not do. **The deploy is the orchestrator's and it comes straight after your report**, so say in one sentence what Mark should be looking for when he plays it. **Do not start slice J.**

### What must not move, and a move is a stop

The standing rules are in `step-4-coder-contract.md`; read it first. These are the ones this slice adds.

- **`WITNESS_VERSION` 8, `READINGS_VERSION` 5 and `FORMAT_VERSION` 4.** None moves and a move in any is a stop. **You declare no folded field**: the impulse already carries everything a longer shove needs, which is exactly why slice H declared it.
- **`GOLDEN`.** Not permitted, not budgeted, and a move is a stop and report, per the fifth ruling.
- **The fences**, per the contract, all six by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
- **`moveStormTarget`, `moveMobInsideBounds` and `pushable`.** Still the only way a body is moved and the only answer to whether it may be. A raw write is a stop, not a shortcut.
- **`toll.struck` and the one-strike rule.** A longer push gives the leading edge more chances to catch a body it already struck, which is the exact hazard the set exists for. Its JSDoc's arithmetic names the old figures; you may correct the figures and you may not relax the rule.
- **`BELL_DAMAGE_NEAR_BY_LEVEL` and `BELL_DAMAGE_FAR_BY_LEVEL`.** Every figure and the eighth-ratio between them. Mark ruled the far edge tickles on 2026-08-19 and ADR 0036 holds it; this slice moves where the far edge stands, not what it carries.
- **`beat`, `canTouchGrave` and ADR 0041.** Untouched, as in slice H.
- **`BELL_PERIOD` and `BELL_EXPAND_TICKS`.** The bell's clock is not this slice's, and a shove that outlived its own period would be, which is worth checking and is not in danger at these figures.
- **`STREAM_SALTS`, `STREAM_ORDER`, every fault identity wire number, and every cap.** A cap that binds in your batch is a finding and never a number to raise.
- **The harness's own rows.** `enoughClearance`, `belchWorthIt` and every lapse rate belong to the hand, and a hand row moved between two batches compares two builds through two instruments.
- **The belch, the meter and the Wall.** Slices J, K and L, and none of their files is in your commit.
- **No ADR gains a combat magnitude and you file no ADR and amend none.** R10 says so in its own words: ADR 0036 already makes every bell figure a tuning row.

### Seams under test

`src/game/shove.ts`: the decay row at its new figure and the fall it shapes, the module otherwise unchanged. `src/game/lines/bell.ts`: `ConeRow`'s two reaches, the push column re-derived, `proximity` computed twice, `pushTarget` spending the push row against the push reach, and `sweepToll` resolving damage against the damage reach and marking `struck` either way. `src/game/mobs.ts`: the travel and the one report, unchanged and asserted so. `src/dev/readings/repel.ts`: the `Repel` interface's JSDoc sentence naming seven ticks of travel, corrected; the window itself is not a figure and attribution is checked by arithmetic rather than changed. `apps/hungry-grave/CONTEXT.md`: the Cone entry.

### Module boundaries

**Nothing is created, deleted, merged or split, and no import direction changes.** `shove.ts` has no import line at all today and gains none, `bell.ts` still keeps its own falloff arithmetic and its own rows, and `stormTargets.ts` is still the one seam a body moves or starts flying through. **The two reaches both live on the bell's row** and neither is passed into `shove.ts`, because the falloff is the bell's and the decay is the shove's, which is the split slice H established and this slice deepens rather than rearranges.

### The planned test list

Each written red first, and each named as the sentence it promises. The record's section 6 is the source, and the first two sentences are new with this slice.

1. *A body struck by a toll leaves at the speed the cone's leading edge advances, its first step is its largest, and each step after is smaller, so its whole travel is `s * (SHOVE_TICKS + 1) / 2` from that first step `s`.* **That is R2's own wording and it is what the record's section 6 now says**: the edge advances `reach / BELL_EXPAND_TICKS` on every one of its 45 ticks, the shove's first step matches that one step rather than the whole expansion, and the shove starts a tick after the strike (`pushTarget`'s JSDoc), so a test asserting the body keeps pace with the edge for the length of its push cannot pass. **Pin it where the falloff is one or near it**: a body standing beside the grave (`pushTarget` refuses a distance of exactly zero), at a rung whose near damage leaves it alive, a revenant's 64 health against rung one's 40 or rung two's 56, or at the impulse seam in `shove.test.ts`. **Say which**, so the promise is not written against a corpse or against a body the row refuses.
2. *A body in the outer part of a toll's drawn cone, outside the damage reach and strictly inside the drawn edge, is shoved and survives, because the cone draws at the push reach and the bell's damage reaches less far.* **Strictly inside**: `proximity` is zero at the drawn edge itself, so a body standing exactly there is shoved by the row times zero, which is not shoved at all.
3. *A toll takes nothing at all off a body outside its damage reach, and marks it struck all the same.*
4. *A shoved body is visible at intermediate positions*, still true at the new duration: a body stands somewhere different on each tick of its travel and no tick moves it further than its own width.
5. *A shove decays to nothing and the body resumes its own rule on the tick after it ends*, over the new duration.
6. *A shove at bell level five carries a body the field units its row now says.* The re-pinned baseline, with its triple.
7. *It takes more than one toll to kill a shambler at the far edge of the damage reach, at the rung a run is born on.* The re-handed promise.
8. *The bell's toll strikes each body once, and a shove carrying a body back across the leading edge earns no second strike*, over a push that now gives the edge four times as long to catch it again.
9. *A shove never carries a body outside the field plus the spawn margin, however large the impulse*, which a longer throw leans on harder than the old one did.
10. *Two runs on one seed with the same inputs rebuild identically*, with the shoves-in-flight half measured rather than assumed.
11. **The six fences**, green, each named by title.
12. **The golden digest** at `digest.test.ts`, held, with the checksum stated.

**What this slice is expected to turn red, so the diff is read against something.** `bell.test.ts` throughout, above all its push block and both `it.fails` tripwires; `shove.test.ts` wherever a comment names the old figure; anything asserting the old forty units by name; **not** `repel.ts`'s suite, which (i) shows has no figure in it to move; and any measured per-seed baseline that moves through the bell, which slice H found is exactly two of them and both re-measurable with the reason beside them. **A realistic count is 6 to 15 files.** Slice H touched eighteen for the mechanic itself and this is the same mechanic retuned with one new column, so a diff much larger than that is a reason to ask what you reached into, and a diff of two or three is a reason to look for the tests that should have moved and did not.

### Verification steps, with actors

The standing rules are in `step-4-coder-contract.md`; read it first. These are the checks this slice adds.

1. **Agent.** The decay figure and all five push rows stated, each derived rather than picked, with level five landing on the research's own 90.
2. **Agent.** All five damage reaches stated, each inside its own push reach, with the ratio and its precedent named.
3. **Agent.** `GOLDEN` held, with the checksum printed and the reason it should have held stated.
4. **Agent.** `WITNESS_VERSION` 8, `READINGS_VERSION` 5 and `FORMAT_VERSION` 4, each read out of the tree and stated.
5. **Agent.** The fringe per rung at rungs one, three and five.
6. **Agent.** A conditioned tape at every line's rung 5, seed 77, 6000 ticks, verified, with the toll arm's three figures beside slice I's.
7. **Agent.** A hand tape at this tip, verified, with all three refusal counters printed.
8. **Agent.** Replay determinism at this tip, with the residue answer stated either way.
9. **Agent.** A rendered check of a toll landing, across two runs in one session, with the screenshots read and the photograph either obtained or its absence explained.
10. **Agent.** A batch at this tip under both configurations, on slice I's own seeds, with the repel channel printed.
11. **Human (Mark), and none of these blocks you.** Whether a toll now reads as a force going out rather than as a blink, and whether he can see what the push bought him. That is ticket #126's own done line and **the deploy that puts it in front of him is the orchestrator's, straight after your report**. **The push runs in one-push mode: you continue past every human step.**

### State of the branch

- **The tip should be the supersession's docs commit**, `58efd4a159`, or a docs commit above it. Below it `72b307d353` and `157946940c` are slice I's note and code, `2056264082`, `ed369353e2` and `2e90597cad` are slice H's, and `eddb32c4cb` is slice R-fix.
- At slice I's tip, `pnpm verify` was green twice at exit 0: 146 test files, 2050 passed, 23 expected fail, 2 todo, and the test-name list stood at 2073 names.
- **`WITNESS_VERSION` 8, `READINGS_VERSION` 5, `FORMAT_VERSION` 4, `GOLDEN` checksum `-145039082`.**
- **Every tape recorded before `2e90597cad` is refused at the decode**, on its witness version, so there is no pre-round-two tape to compare against and none is asked for here.
- The caps as slice D left them: `MOB_CAP` 481, `MOB_FIRE_CAP` 434, `CORPSE_CAP` 704, `WISP_CAP` 64 and `SKULL_CAP` 120. None bound in slice H's or slice I's batches and one that binds in yours is a finding.
- **A recurring anomaly worth not rediscovering:** a sibling worktree's `pnpm install` can repoint this worktree's `node_modules` links and leave them dangling, so a missing-module error is a reason to check the link targets first.

### The stuck rule

The standing rules are in `step-4-coder-contract.md`; read it first.

**Three things in this slice are already known to be a stop, so you do not have to discover them:** a `GOLDEN` move of any kind; a move in `WITNESS_VERSION`, `READINGS_VERSION` or `FORMAT_VERSION`; and a new fault identity. **And two things are ruled rather than open:** the figures are option 2's and the pick is Mark's, so a measurement arguing for option 1 or option 3 is a finding for the note and built past; and the separate-clocks lever is held for a later round, so a corpse never carries an impulse in this slice however plainly the fringe asks for it.

**Green tests plus wrong observed behaviour means the test plan has a hole**: pin the wrongness as a new red test first, never patch first. A claim in this prompt or in the record that is false against the tree is recorded in the note and the source's intent is followed rather than its stale letter.

### What is not your job

The standing rules are in `step-4-coder-contract.md`; read it first. These are the ones this slice adds.

- **The belch, in every part.** Its waves, its kill, its event, its eruption and its radius are slice J's, and `belch.ts` is opened only to read. **The wave figures the belch will pass are slice J's too**: you change what one wave is, not how many the belch throws.
- **The reading's shape.** Slice I's, and you touch `repel.ts` only for the one JSDoc sentence the new duration makes false, per (i), which you record.
- **The meter and its corner**, slice K's. **The Wall and the new mob type**, slice L's.
- **The corpse that inherits an impulse.** The held lever, named in R10, and it needs a witness move nobody has.
- **Territory's rungs**, #125, and #122 the offer bubble. Neither is round two's at all.
- **The record's section 7 findings**, which no slice acts on.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.** Each needs its own explicit yes.

---

## Slice J: the belch becomes a pushback (#124)

Model: Opus, subagent type general-purpose. One coder, one code commit, one docs commit. Messages end in `(#124)`.

Round two slice J of The Hungry Grave (ticket #124): the belch stops killing and becomes the game's one big push, three waves of shove that clear the ground around the grave.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice J.

**Slices H, I and H2 land before you.** **Verify each of these by name and any one missing is a stop and report:** `shove.ts` with an impulse carrying the wave structure and `SHOVE_TICKS` at slice H2's retuned figure; `WITNESS_VERSION` 8; `mobShoved` carrying slice I's source discriminator; the shove reading's belch arm, empty and waiting; `READINGS_VERSION` 5; `bell.ts` carrying two reaches, the push one drawn and the damage one inside it; and **`docs/adr/0008-the-belch-full-only-gas-everywhere-shove-nearby.md` in the tree**, because the ADR that still says the burst kills is the thing that must be gone before a belch test is written. Read round two progress note sections 8, 9 and 10 for what those slices actually did.

**Four rulings shape this slice and none of them is yours to revisit.**

**First: the belch takes health off nothing at all, boss included.** Mark's ruling 3 of 2026-09-15 and ADR 0008 as amended. `burstNearbyTargets`' kill goes, `BELCH_PHASE_DAMAGE` goes with it, and the belch's chunk of boss damage goes with both. **The gas is untouched**: it still smothers every mob-fire shot on the whole field, boss patterns included, and still kills nothing.

**Second: three discrete waves, each a full watched push, and the three together carry a body clear of the belch's own reach.** The record's ruling R3 **as superseded on 2026-09-15**, on Mark's read of the slice H build, and the figures are `docs/research/watched-pushback-duration.md` section 5, option 2, which he picked: **each wave throws 60 field units, three of them total 180, and a wave begins every 30 ticks so the three span 90**. **The wave count, the spacing and the per-wave throw are data** in the belch's own row, cited to the record and the research, and they are the lever ruling R4 names if the Wall's lane does not open. **What the supersession replaced is the prompt written at `40adc7edd5`, which is void**: waves ten ticks apart fitted inside the eruption's existing twenty-tick visual sized the push to the picture rather than the picture to the push, and a per-wave throw inherited from the bell's left three waves totalling 120 against the belch's own 160 burst radius, so a body at the grave ended still inside it. **The 180 clears it by 20**, which is the whole point: the Flower Wall's five waves are the precedent for countable waves (`docs/research/push-feel-precedent.md` section 2) and the Blank's throw of a third of its playfield is the precedent for the total (`docs/research/watched-pushback-duration.md` section 3).

**Third: one belch strikes each body once, and that one strike carries three waves.** That is the bell's `toll.struck` pattern applied, per ruling R3: the body set is captured when the belch fires, each body gets one impulse, and the impulse's own wave row is what re-shoves it as each later wave comes due. **A body shoved out of reach still gets its later waves**, because the strike was already made, and that is deterministic by construction rather than by a reach test run three times. **The impulse is slice H's and it already does this**: `startShove` takes the count and the spacing and `advanceShove` brings each later shove in, tested at the module's own seam by three tests that pass their own figures.

**Fourth: `GOLDEN` is permitted one re-pin here and it is round two's second and last.** Whether it actually moves is a question rather than a given, and the answer is probably not: `digest.ts`'s canonical scenario scripts `belch: false` on every tick, so nothing this slice changes is ever reached by it, which is the same reason slice H2 was permitted none. **If it does not move, say so and say why, and the permit goes unused.** If it moves, the reason comes before the re-pin: say what moved and why it was reachable at all, then re-pin once with its dated paragraph. **A move anywhere in slices K or L is a stop.**

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/round-two-wall-belch.md`: **rulings R3 as superseded and R8 are yours**, R2 as superseded is what one wave now is, R4 is why the wave row is a lever and not a magnitude you may tune, section 3 is the module shape, section 5 is what must not move, section 6's belch sentences are your tests.
4. `apps/hungry-grave/docs/research/watched-pushback-duration.md` **section 5 in full, option 2 above all**, which is where your three figures and the eruption's come from, plus section 3 for the Blank's throw against its own arena and section 4 for the perception band a wave has to sit inside.
5. `apps/hungry-grave/docs/research/push-feel-precedent.md` **sections 2 and 3 in full**. Section 2 is the Flower Wall's countable waves. Section 3 is the honest state of the evidence that a no-damage push reads as a boom: Smash's windbox deals knockback with no hitstun and F.L.U.D.D.'s payoff is positional rather than numeric, Lucio's boop is read for its displacement rather than its damage, and **the record says plainly that no GDC talk or dev blog was found arguing the case explicitly, so the rest is inference and is marked as such wherever it is cited**. Do not cite it as more than it is.
6. `apps/hungry-grave/docs/adr/0008-the-belch-full-only-gas-everywhere-shove-nearby.md` as amended, **which is the contract for what the belch now is**; `0038-the-belch-binds-to-a-dedicated-button.md`; `0014-readability-layering.md`, because the eruption may not occlude mob fire and ADR 0008 grants no invulnerability; `0007-bosses-always-shootable.md`, because an authored pattern is never smeared; `0034-a-power-up-is-an-offer-of-three-and-the-grave-swallows-one.md`, whose regeneration rule ADR 0008 names.
7. `apps/hungry-grave/docs/push/round-two-progress.md` sections 8, 9 and 10, **plus section 5**, which is where slice H's own prompt was found false against the tree and where the ordering fact below is written down. `step-4-progress.md` section 2 for the `GOLDEN` history.
8. `apps/hungry-grave/CONTEXT.md`, the entries Belch, Reservoir, Gas, Repel and Storm. **Read the Avoid lists before naming anything.** Nothing in this slice is called a wave in code: Wave is the authored timeline's own entry and the Cone entry bans the word outright, which is why slice H's fields say shove and yours do too.
9. The tree: `src/game/belch.ts` whole, all 119 lines; `src/game/shove.ts` as slices H and H2 left it; `src/game/stormTargets.ts`'s `shoveStormTarget`, `moveStormTarget` and `pushable`; `src/game/mobs.ts`'s `travelShove`, `reportShoveTravel` and `advanceMobs`; `src/game/events.ts`'s `belched` and `mobShoved`; `src/dev/readings/repel.ts` and `belchCadence.ts`; `src/app/screens/game/StormRenderer.ts`'s `ERUPTION_TICKS`, `ERUPTION_REACH`, `drawEruption`, `syncBursts`, `syncBurst`, `erupt` and `STORM_RENDERER_TRANSIENT_TICKS`; `src/app/palette.ts`'s `belchEruption` entry and the band ceiling; `src/dev/bot.ts`'s `belchWorthIt`, to read and never to touch.

### The definition, in observable terms

After this slice: a belch takes no health off anything, boss included, and no corpse of its own is left behind because nothing died. It throws every body inside its reach away from the grave in three waves the player can count, each one a full watched push the length of a toll's, and a body standing beside the grave ends outside the belch's own reach. A body caught by the belch travels over ticks and is drawn at every position between. The gas still smothers every mob-fire shot on the field. A boss and a set piece's source are still never moved.

The eruption draws one front per wave, each lasting as long as its wave, so the picture and the push end together. The batch can say what a belch's shoves did, in the arm slice I declared and left empty. `WITNESS_VERSION` still reads 8, `READINGS_VERSION` still reads 5, `FORMAT_VERSION` still reads 4, and `pnpm verify` is green.

What a player meets: the belch stops deleting a handful of bodies and starts clearing the ground. That is Mark's ruling 3 and ticket #124's done line is that after spending one they can say what it did for them, unprompted.

### The work, in this order

**(a) Verify the seven inputs**, per the stop above, then `git log --oneline -25`, `git status --short`, and your own test-name baseline into `local/round2/` under a name carrying the letter J.

**(b) The tests first, red.** **Write the no-damage test first**: a belch takes no health off anything, boss included. It is the ruling stated as a test rather than discovered, and it is the one a later change is most likely to quietly undo.

**(c) The kill comes out of `belch.ts`.** `burstNearbyTargets` stops calling `damageStormTarget`, `BELCH_PHASE_DAMAGE` goes, the `killed` count on the `belched` event has nothing left to count. **Decide what happens to that field explicitly rather than leaving a zero**: a count that is structurally always zero is a lie a reading can still read. **Author the honest shape, say in the note what you set it against**, and remember that `belchCadence.ts` and the sound layer read the `belched` event.

**(d) The shove goes in, through `shove.ts` and never a second copy.** Ruling R8: one module, two callers. **`belch.ts` has no push and no wave code at all today, so this is built rather than adapted**: the belch captures its body set once and starts one impulse per body through `shoveStormTarget(state, target, 'belch', away.x, away.y, <throw>, <shoves>, <spacing>)`, which is the seam slice H already built and the argument order it already has. **`BELCH_BURST_RADIUS` is re-read as a shove reach rather than replaced**, and its JSDoc says so, because the reach is what it always was and only what happens inside it changed. **`moveStormTarget` and `pushable` still answer whether a body may move**, so the boss and the set piece's source are excluded structurally rather than by a branch in `belch.ts`. **`belch.ts` may import `stormTargets.ts` and `mobs.ts` may not**, because `stormTargets.ts` imports `mobs.ts` and the core's cycle guard holds `KNOWN_CORE_CYCLES` empty; that is slice H's own finding and it is why the shove starts at the seam and travels inside `advanceMobs`. **Inside `advanceMobs` the shove's advance runs after the walk and not before it**, for an off-by-one slice H found and wrote down (note section 5): running the travel first lets the last tick of a shove both fly a body and walk it. You inherit that order and you do not reorder it. **A body at a distance of exactly zero from the grave has no away direction and is refused**, which is the rule the bell already keeps (`pushTarget` returns on `distance === 0`, and again on an away vector of zero length). **The belch follows the bell rather than writing a second answer**, so the sentence a test pins is one rule and not two.

**(e) The wave row, and it is data.** The count, the spacing and the per-wave throw in the belch's own row with the record's ruling R3 and the research's section 5 option 2 cited in the JSDoc, beside the note that they are ruling R4's lever for the Wall. **No ADR gains a combat magnitude**, ADR 0008 included.

**(f) Three JSDocs across the tree still say "three ten ticks apart" and they are now false.** `shove.ts`'s `Impulse`, `stormTargets.ts`'s `shoveStormTarget` and `witness.ts`'s version 8 paragraph all name the old figure as the belch's, and `witness.test.ts`'s `EXCLUDED` entry for `impulse.source` repeats the sentence. **Correct each to say that the spacing is the row's** rather than writing the new figure into four places a later retune would have to find. **Changing a comment in `witness.ts` is not a version move** and `WITNESS_VERSION` stays 8; check the prose the test asserts if you touch the entry, because that string is compared.

**(g) The event slice I declared, now emitted.** Every shove the belch starts emits `mobShoved` with the belch's source. **One impulse makes one report, at its end, carrying everything it carried** (`reportShoveTravel` in `mobs.ts`), so a three-wave belch on one body reports one event summing all three waves, which is what the reading's belch arm already expects and what slice H ruled when it chose one report per impulse. **The reading's belch arm should go from provably empty to populated, and you show both**: slice I's test that the arm is empty at slice I's tip is expected to change meaning here, so **retitle it rather than deleting it quietly**, because what it pins after you is that the arm fills.

**(h) The eruption's fronts, on the layer that already exists.** `ERUPTION_TICKS` is 20 today and `drawEruption` draws one circle whose radius scales with the progress `syncBurst` feeds it as `age / life`. **R3 as superseded makes it one front per wave, each lasting as long as its wave**, so the constant becomes the three-wave span the row names and the draw puts three staggered fronts on one sprite, each starting when its own wave does. `STORM_RENDERER_TRANSIENT_TICKS` registers the same constant and moves with it, which is what keeps a replay primed mid-run reaching far enough back (#58). **The eruption rides the `belchEruption` layer, which ADR 0014 already places below `mobFire`, and nothing you add may occlude mob fire.** **Every colour you draw sits under the band ceiling while the field is live**, and `palette.test.ts` is what says so. **The front and the shove have to agree**, which is the whole reason the constant moves: author that agreement and say in the note what you set it against.

**`ERUPTION_TICKS` is derived, not written a second time.** The span is `(count - 1) * spacing + SHOVE_TICKS`, which is the belch's own count and spacing rows plus `shove.ts`'s `SHOVE_TICKS`, and it reads 90 at these figures. Derive it from those exports rather than typing a second 90 a later retune would have to hunt for, which is the same thing (f) asks of the JSDocs. The front count and each front's start tick read the same row. **With the spacing equal to `SHOVE_TICKS` the three fronts are sequential and never concurrent**, each one starting as the one before it ends.

**The front's own reach is your authored call, and the research's figure for its speed is dropped.** Research section 5 first read each front as slowing to "about a third of today's speed", and its own 2026-09-15 correction drops that, because it does not follow from the figures beside it: `ERUPTION_REACH` is the field's diagonal, 932 units, crossed in 20 ticks today at 46.6 a tick, and the same reach over 30 ticks is 31 a tick, which is two thirds of today rather than a third. A third would need a 60-tick front or a front stopping near half the diagonal, and R3 rules the count and the duration and says nothing about speed or reach. **So do not chase the third**, and author the reach instead. The precedent for a picture that runs well past the push is the shipped Blank, whose clear front reaches 25 tiles over a knockback of 10 (research section 3), and the eruption's own JSDoc already calls it the ground shock under a field-wide scatter of cancelled shots. The competing principle is R10's, that a body moved by something the player cannot see fails the done line. **Say in the note which reach you chose and why, and print the resulting speed** in units a tick and in field widths a second.

**(i) `GOLDEN`, per the fourth ruling.** Run `digest.test.ts`. If it holds, say why it should have. If it moves, say what reached the scenario before you re-pin, then re-pin once with a dated paragraph naming every field that moved.

**(j) The measurements this slice owes.**

- **A hand-recorded tape with a belch spent in it**, at your tip, against the built app through `vite preview`, driven with `playwright-cli`, measured to `outcome: 'verified'`, with all three `state.refusals` counters printed. **A belch needs a full reservoir, so say how you got one** rather than leaving the reader to wonder whether the tape has one at all.
- **A rendered check, and this slice plainly owes one.** Read the screenshots: three waves, countable, the ground clearing, nothing dying, three fronts. **Play a run, end it, and play another.** **Slice H could not photograph a seven-tick shove and slice H2 tried again at thirty**; read what each of them found in note sections 8 and 10 before you spend the time, and say plainly what you could and could not see.
- **A conditioned tape**, measured, so the belch's change is visible against slices H, I and H2's own rigs.
- **A batch at your tip** under `steady-far` and `loose-far`, with the shove reading's belch arm printed and `belchCadence` beside it. **Use slice I's own seeds, 900 to 905 under each hand**, so your figures are subtractable against the tables in note sections 9 and 10. **`belchWorthIt` now prices a belch that kills nothing**, which is a reading about the hand and **never a row you touch**; print what it did and leave it alone.
- **Replay determinism at your tip**, with a belch's shoves in flight at a checkpoint. **The bell's shoves could not be caught at a checkpoint by arithmetic** and the whole derivation is in note section 8, but **a belch is player-timed rather than periodic**, so it may well be catchable and slice H2 re-measured the residues at the longer duration. Read both before you decide how to prove it, and **do not burn the slice proving the impossible again**: folding the witness on every flying tick across two plays of one seed is the stronger proof and it is already the worked precedent.
- **A body's total travel under one belch, counted off a tape rather than off the source**, and stated against the burst radius, because "clears its own reach" is the sentence the figures were picked for.

**(k) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the belch clears the ground in three waves and takes health off nothing (#124)`.

**(l) The progress note**, section **11**. Beyond the contract's list, say: what became of the `killed` count and what you set it against; the wave row's three figures; `BELCH_BURST_RADIUS` re-read rather than replaced; the four JSDocs corrected off the old spacing; the eruption's agreement with the waves and what you set it against; what you did with slice I's empty-arm test; `GOLDEN` moved or held with the reason; the hand tape with the belch in it and how you got the reservoir full; a body's measured travel against the burst radius; and the batch's belch arm.

**(m) Stop and report.** Under 300 words. **Do not start slice K.**

### What must not move, and a move is a stop

- **The fences**, all six by title. **`lineAgnosticPolicies.test.ts` binds `game/belch.ts` to the `stormTargets` seam and to nothing else**: its `STORM_MODULES` list carries the belch and its `TARGET_SEAM` is `stormTargets`, so what that fence asserts is the seam, and the belch never imports `shove.ts` at all. The core's cycle guard keeps `KNOWN_CORE_CYCLES` empty.
- **`WITNESS_VERSION` 8, `READINGS_VERSION` 5 and `FORMAT_VERSION` 4.** None moves and a move in any is a stop. **You declare no folded field**: the impulse's wave fields already exist and are already folded, which is exactly why slice H declared them, and correcting a sentence in the version paragraph is not a move. **`impulse.source` is excluded from the fold rather than folded**, on `mobFire[].kind`'s precedent, and it owes no witness move however many bodies the belch now writes it on; CodeRabbit asked slice I for that move and it was declined, with the reasoning beside the ruling in note section 9. **A reviewer asking you for it again is declined the same way.**
- **The shove's own arithmetic.** `SHOVE_TICKS`, the fall, `firstStepOf` and the accounting are slices H and H2's, and a belch that wanted a different wave length would be asking for a second decay row nobody has ruled.
- **The bell's two reaches and `toll.struck`.** Slices H and H2's, untouched.
- **The gas.** Its field-wide scope, its boss-pattern reach and its killing nothing are all ADR 0008's and none of them is touched.
- **`pushable` and `moveStormTarget`.** A raw position write from `belch.ts` is a stop.
- **The harness's own rows**, `belchWorthIt` above all. A hand row moved between two batches compares two builds through two instruments.
- **Every cap, every fault identity, `STREAM_SALTS` and `STREAM_ORDER`.**
- **You file no ADR and amend none.** ADR 0008 already landed and **applying a rule is not amending it**.

### Seams under test

`src/game/belch.ts`: `fireBelch` with no damage at all, the body set captured once, the shove started through `shoveStormTarget`, `BELCH_BURST_RADIUS` as a reach, and the wave row. `src/game/events.ts`: `belched`'s payload after the kill count's fate is decided, and `mobShoved` carrying the belch's source. `src/game/shove.ts`: the multi-shove path, now with a real caller. `src/dev/readings/repel.ts`: the belch arm populated. `src/app/screens/game/StormRenderer.ts`: one front per wave, over the span the row names.

### Module boundaries

**Nothing is created, deleted, merged or split, and no import direction changes.** **`belch.ts` already imports `stormTargets.ts`**, as `damageStormTarget, stormTargets`, so what moves is `damageStormTarget` off that line and `shoveStormTarget` onto it; the belch gains no import of `shove.ts` at all, which is ruling R8's second caller arriving through the seam rather than as a second copy of the shove. **`shove.ts` has no import line at all and gains none**, and `boundary.test.ts` does not name it: that fence polices `src/game` as one folder (`game: ['game']`) and the core's cycle guard, so the module's emptiness is yours to keep by reading it rather than a fence's to prove. `StormRenderer` stays behind the renderers, reads the run and never writes it, and no new library enters.

### The planned test list

1. *A belch takes no health off anything, boss included.* **Write it first.**
2. *A belch shoves in the number of waves the row declares, and a player counting them counts that many.*
3. *A belch's waves together carry a body standing beside the grave clear of the belch's own reach.* **Beside it, not on it**: a body at a distance of exactly zero has no away direction and is refused, the same way `pushTarget` refuses it.
4. *A belch strikes each body once, and its later waves re-shove the same impulse rather than starting a second.*
5. *A body shoved out of a belch's reach still takes the waves that belch already owed it.*
6. *One belch on one body reports one shove, carrying everything all three waves carried.*
7. *A boss and a set piece's source are never moved by a belch.*
8. *A belch's gas still smothers every mob-fire shot on the field and still kills nothing.* The half that did not change, asserted so it cannot drift out.
9. *A shove is attributed to the belch rather than to a toll*, now over a real belch rather than a planted event.
10. *The eruption draws as many fronts as there are waves, each lasting as long as its wave.*
11. *Two runs on one seed rebuild identically with a belch's shoves in flight at a checkpoint.*
12. **The palette scan**, green over anything the eruption draws.
13. **The six fences**, green, each by title.
14. **The golden digest**, held with its reason or moved once with its paragraph.

**What this slice is expected to turn red.** `belch.test.ts`, everything reading the `belched` event, `repel.test.ts`, `belchCadence.test.ts`, the sound layer's suite, `StormRenderer`'s suite, `witness.test.ts`'s `EXCLUDED` prose if you correct it there, `measure.test.ts`'s rich fixture whose belch arm slice E already had to re-hand, and `bot.test.ts` wherever `belchWorthIt` changes what a run does. **A realistic count is 15 to 35 files.**

### Verification steps, with actors

1. **Agent.** A belch proved to take no health off anything, boss included.
2. **Agent.** Three waves, counted off a tape rather than off the source.
3. **Agent.** A body's travel under one belch, measured and stated against the burst radius.
4. **Agent.** `WITNESS_VERSION` 8, `READINGS_VERSION` 5 and `FORMAT_VERSION` 4 all held.
5. **Agent.** `GOLDEN` held with its reason, or moved once with its paragraph and what reached the scenario.
6. **Agent.** A hand tape with a belch in it, verified, with the three refusal counters.
7. **Agent.** A rendered check across two runs with the screenshots read.
8. **Agent.** A batch at this tip on slice I's seeds, with the belch arm printed.
9. **Agent.** Replay determinism with belch shoves in flight, or the stronger proof with its reason.
10. **Human (Mark), and none of these blocks you.** Whether he can say what the belch did for him, unprompted, which is ticket #124's own done line. **The deploy that puts it in front of him is the orchestrator's, straight after your report.**

### State of the branch

- The tip should be slice H2's docs commit. **`WITNESS_VERSION` 8, `FORMAT_VERSION` 4, `READINGS_VERSION` 5, `GOLDEN` as slice H re-pinned it and slice H2 held it.**
- **Round two's `GOLDEN` budget is two, slice H spent one, slice H2 was permitted none, and this is the other.** Slices K and L are permitted none.
- Read round two progress note sections 8, 9 and 10 for the test counts and the test-name list.

### The stuck rule

**Three things are already known to be a stop:** any of the seven inputs missing, the ADR above all; a `WITNESS_VERSION`, `READINGS_VERSION` or `FORMAT_VERSION` move; and a second `GOLDEN` re-pin. **And two things are ruled rather than open:** the belch does no damage of any kind, and a measurement showing the belch is now weak is a finding for the note, never a reason to give it a point of damage back; and the three figures are option 2's and the pick is Mark's, so a measurement arguing for a different total is a finding too.

### What is not your job

- **The Wall**, in every part, including whether the belch opens it. Slice L's, and `waves.ts` and the mob table are opened only to read.
- **The meter and its corner**, slice K's.
- **Slices H, I and H2's work.** The shove module's arithmetic, the impulse, the bell's two reaches, the reading's shape and the version note.
- **The harness's rows and the orchestrator's batch.**
- **The record's section 7 findings.**

---

## Slice J-fix: the belch's push reaches half the field's width and the eruption stops where the push stops (#124)

Model: Opus, subagent type general-purpose. One coder, one code commit, one docs commit. Messages end in `(#124)`.

Round two slice J-fix of The Hungry Grave (ticket #124): slice J's belch pushes honestly and catches almost nobody, and the picture it draws promises the whole screen. This slice makes the reach and the picture one circle across half the field's width.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice J-fix.

**Slice J lands before you.** **Verify each of these by name and any one missing is a stop and report:** `BELCH_BURST_RADIUS`, `BELCH_SHOVES`, `BELCH_SHOVE_THROW` and `BELCH_SHOVE_SPACING` all exported from `src/game/belch.ts`; `shoveNearbyTargets` calling `shoveStormTarget` with the belch's source and no `damageStormTarget` anywhere in the file; `ERUPTION_TICKS` derived from the belch's own rows in `src/app/screens/game/StormRenderer.ts`; `eruptionFrontsAt` returning one front per shove; and the shove reading's belch arm populated in `src/dev/readings/repel.ts`. Read round two progress note section 11 for what slice J actually did, and section 5 for where a prompt was found false against the tree.

**Why this slice exists, and it is not a tuning pass.** Mark played the deployed slice J build on his phone and saw the three rings cross the whole screen with, in his words, "none of the mobs seem to be going anywhere on any of those waves". Session 26's diagnosis found the sim honest: every body inside 160 units moved about 150 net over the 90 ticks. What was wrong was how few bodies that is. Under a diving bot a press caught **0 to 21 of 30 to 93 live bodies, typically 4 to 14**, and on **58 percent** of a still grave's ticks there was nothing inside the reach at all. The push worked and the picture promised the field. **The gap between the two is the bug, and it closes from both ends.**

**Five rulings shape this slice and none of them is yours to revisit.**

**First: the push reaches half the field's width.** The record's ruling **R11**, Mark's option 1 of three, ruled 2026-09-16. `BELCH_BURST_RADIUS` is no longer the 160 it inherited from the kill it used to bound. **The basis is the field's width and not its height, not its diagonal and not its area**, because a reach off the height would cover about three quarters of the field and that is option 2, the whole screen, which Mark declined. **The figure is derived at build time from `FIELD_WIDTH`, it is a row with its derivation in its JSDoc, and it is not written as text in this prompt or in the record.** What stood from the 160 is that the shove is **local rather than field-wide**, which is ADR 0008's own "shove nearby".

**Second: the eruption's front stops where the push stops.** `ERUPTION_REACH` is the field's diagonal today, 932 units, chosen in slice J on the Blank's precedent of a clear front sweeping two and a half times its knockback. **That precedent does not transfer and R11 says why: in Gungeon the bullets are the Blank's payload and the front pictures the cancel, but here the push is the payload (R3), so the front and the push name one circle.** The reach becomes the belch's own row rather than the diagonal, and **reading the row is better than copying its figure**, on slice J's own precedent with `ERUPTION_TICKS`. **The front count and the per-front duration do not move**: R3 rules one front per shove, each lasting as long as its shove, and R11 rules only where a front stops.

**Third: the front gets much slower and you have to look at what that does.** Slice J printed 31.08 units a tick, 3.45 field widths a second. The same `SHOVE_TICKS` over the new reach is roughly a third of that, about one field width a second, which is under Enter the Gungeon's Blank at 1.67 and close to the speed a player reads as gas spreading rather than as a blast. **The front's clock is R3's and does not move**, so the only levers are `ERUPTION_STROKE` and the front's fade. **Print the new speed in units a tick and in field widths a second, read the screenshots for whether it still reads as a blast, and if you move a lever say what you set it against.** A front that reads as a creep rather than a blast is a finding for the note.

**Fourth: the field scroll is not changed, and this is ruled rather than open.** `scrollField` (`src/game/step.ts`) adds its per-tick drift to a shoved body too, so a throw up the field nets less than the row says and a throw down the field nets more. **Both ways of removing it are refused.** The throw row absorbing it means moving `BELCH_SHOVE_THROW` off Mark's own pick of option 2, which is a stop. And exempting a body under a shove is not belch-only: `bell.ts` starts its push through the same `shoveStormTarget`, so the exemption would silently take about 19 units off every bell toll, and the bell's two reaches are slice H2's and must not move. **Keying the exemption on the belch instead is refused outright**: a world rule keyed on which line pushed is the fixed-membership club ADRs 0016 and 0042 exist to dismantle. **So the scroll composes with the shove, in this slice and for both lines.** The instruments are already honest about this: `travelShove` (`src/game/mobs.ts`) accumulates the shove's own step and never the scroll, so `mobShoved`, `repel.ts`, `belchCadence` and every batch figure already report the row's throw rather than the net. **What you owe is the net, measured and stated**: a body's travel up the field and down the field, both printed, against the row's nominal. Any later move of this is the tuning step's with a measurement behind it.

**Fifth: the throw does not move, and the reach is no longer a thing a body is thrown clear of.** This is the arithmetic of Mark's own pick rather than a new decision, and it is recorded in R11's own last paragraph. `BELCH_SHOVE_THROW`, `BELCH_SHOVES` and `BELCH_SHOVE_SPACING` are option 2's, Mark picked them on 2026-09-15, and R11 moved the reach without touching them. So slice J's sentence that three shoves carry a body **clear of the belch's own reach** no longer holds and cannot be made to hold without overruling his pick. **What replaces it: the reach is what a press catches, and the throw is how far each caught body travels.** That sentence is pinned in **two places in `belch.test.ts`, near lines 302 and 360**, and **both are retitled to what now holds and neither is deleted quietly**, the same way slice J retitled slice I's empty-arm test. **Growing the throw so it clears the new reach is a stop and a finding, not a fix.**

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/round-two-wall-belch.md`: **ruling R11 including its last paragraph is yours and it is the whole of this slice**, R3 as superseded is what the shoves are and why the count and the duration do not move, R4 is why the wave row is a lever you may not tune, R8 is the one shove module, R10 is why nothing may be moved by something the player cannot see, section 5 is what must not move.
4. `apps/hungry-grave/docs/research/watched-pushback-duration.md` **section 3** for the Blank's own figures, its damage radius of 7 against `knockbackRadius: 10` and its clear front at 25 tiles, which is the precedent R11 declines to carry over and you should understand before you shorten a front.
5. `apps/hungry-grave/docs/adr/0008-the-belch-full-only-gas-everywhere-shove-nearby.md` as amended, **whose "shove nearby" is the half of the ruling that survived the reach change**; `0014-readability-layering.md`, because the eruption may not occlude mob fire and a larger, slower front sits on screen longer; `0016` and `0042`, for why a rule is never keyed on which line or which set piece; `0038-the-belch-binds-to-a-dedicated-button.md`.
6. `apps/hungry-grave/docs/push/round-two-progress.md` **section 11 in full**, plus sections 8 and 10 for the shove module and the bell's two reaches, and section 5 for prompt claims found false against the tree.
7. `apps/hungry-grave/CONTEXT.md`, the entries Belch, Gas, Repel and Storm. **Read the Avoid lists before naming anything.**
8. The tree: `src/game/belch.ts` whole; `src/game/field.ts`; `src/game/step.ts`'s `scrollField`, to read and not to touch; `src/game/lines/bell.ts`'s `shoveStormTarget` call, to read and not to touch; `src/game/shove.ts` and `src/game/stormTargets.ts`'s `shoveStormTarget`; `src/game/mobs.ts`'s `travelShove` and `reportShoveTravel`; `src/app/screens/game/StormRenderer.ts`'s `ERUPTION_TICKS`, `ERUPTION_REACH`, `ERUPTION_STROKE`, `eruptionFrontsAt`, `drawEruption`, `syncBurst`, `erupt`, `splashed`, `originOf` and `STORM_RENDERER_TRANSIENT_TICKS`; `src/dev/bot.ts`'s `belchWorthIt`, to read and never to touch.
9. `local/belch-play.ts` and `local/belch-reach.ts`, **which are session 26's uncommitted diagnosis scripts and are still in the worktree**. Both import `BELCH_BURST_RADIUS` from the source, so **they re-measure at your new figure with no edit**, and they are how the headline measurement below is taken rather than something you write from scratch. `local/belch-repro.ts` is beside them but **does not read the reach** and hand-places its bodies, so it is context and not an instrument here.

### The definition, in observable terms

After this slice: a press catches a large share of what is on the field rather than a handful, because the reach is half the field's width instead of under a third of it. The eruption's three fronts sweep out to exactly the circle the push caught and stop there, so nothing on screen promises ground the press did not touch and nothing is moved outside what was drawn. The drawn circle and the caught circle share a centre, and the drawn circle keeps sitting over the bodies it caught rather than being left behind by the field they ride.

Nothing else about the belch changes. It still takes health off nothing, the gas still smothers every mob-fire shot on the whole field, each body is still struck once and carries three shoves, a boss and a set piece's source are still never moved, and the count, the spacing and the per-shove throw all still read what slice J set them to. **The field scroll still composes with every shove, the bell's included.** `WITNESS_VERSION` still reads 8, `READINGS_VERSION` still reads 5, `FORMAT_VERSION` still reads 4, `GOLDEN` does not move, and `pnpm verify` is green.

What a player meets: the press that looked like weather becomes the press that clears the crowd. **Ticket #124's done line is Mark's, unprompted, on the deploy after you**, and the orchestrator takes it.

### The work, in this order

**(a) Verify the five inputs**, per the stop above, then `git log --oneline -25`, `git status --short`, and your own test-name baseline into `local/round2/` under a name carrying the letters `jfix`.

**(b) Measure before you change anything.** Run `local/belch-play.ts` and `local/belch-reach.ts` at the tip as it stands and keep the numbers. They should reproduce session 26's 0 to 21 of 30 to 93 and its 58 percent, and **a before and after off one script is the only honest way to say the slice worked**.

**(c) The tests first, red.** **Write the catch test first**: a body standing at a distance the row says is inside the reach is shoved, and one outside it is not, both expressed against the row rather than against a number typed in the test.

**(d) `BELCH_BURST_RADIUS` becomes the half-width row, and it stays in `belch.ts`.** Derive it from `FIELD_WIDTH` in `src/game/field.ts` rather than typing a figure. **That import is game to game and trips nothing**: `boundary.test.ts` permits it, `field.ts` imports nothing so the cycle guard stays empty, `lineAgnosticPolicies.test.ts` governs only the `.mobs` read and the `stormTargets` seam and says nothing about other imports, and the stray-constant fence keys on a `BELL_` prefix. **Run the fences and confirm that for yourself rather than taking this paragraph's word**, on note section 5's own history. The JSDoc states the derivation, cites ruling R11 and Mark's pick of 2026-09-16, names the width as the basis and the height as the thing declined, and keeps the sentence that the shove is local rather than field-wide with ADR 0008 named. **The paragraph about the 2026-08-31 tapes and the belch's dominance is about the old scope and is now false as written; correct it**, because a reach twice the old one under a comment saying the answer was cutting the scope is a contradiction the next reader has to resolve.

**(e) `ERUPTION_REACH` reads the belch's row.** Import it the way `ERUPTION_TICKS` already imports `BELCH_SHOVES` and `BELCH_SHOVE_SPACING`, and **delete the diagonal derivation rather than leaving it unused**. Its JSDoc's whole argument is now reversed: rewrite it to R11's, that the front and the push name one circle because the push is this belch's payload, and **say plainly that the Blank's 2.5 ratio is the precedent that was declined and why**. Then the third ruling: **print the front's new speed both ways and judge it off the screenshots**, with `ERUPTION_STROKE` and the fade as the only levers.

**(f) The eruption's anchor, and it is the one place the scroll is answered.** Two things are wrong with it and both are in the renderer. `erupt` anchors at `run.grave.y - run.grave.size`, the mouth, while `insideBurst` measures from the grave's centre, so the drawn circle and the caught circle are offset by the grave's own size: **the fix is `this.eruption.y = run.grave.y`, and `splashed` and `originOf` stay at the mouth because the splash is a spray from the mouth and is not this circle.** And `syncBurst` re-positions the sprite from the frozen born-tick point every frame while every body it caught drifts with the field, so over the eruption's own span the ring is left behind by the crowd it drew. **Make the ring drift with the field at `SCROLL_SPEED` from its born tick**, so the picture keeps sitting over the bodies. **The sim is untouched by both**, which is why this is the renderer's answer to the fourth ruling rather than a change to what a shove is.

**(g) `GOLDEN` cannot move and this is a stop.** **Two facts carry it and you say both**: `digest.ts`'s canonical scenario scripts `belch: false` on every tick, and its `levels.bell` is 0 for the whole scenario so no toll fires either, which is the same fact R9 used to deny slice H2 a re-pin. **Round two's budget of two is spent, slice H took one and slice J took the other.** Run `digest.test.ts` and say it held.

**(h) The measurements this slice owes.**

- **`local/belch-play.ts` re-run at your tip**, against the before you took in (b), printing for each of seeds **902, 17 and 5150** the share of live bodies caught per press and how far each caught body had moved 90 ticks later. **Print both numbers side by side.**
- **`local/belch-reach.ts` re-run**, for the share of a still grave's ticks with nothing at all inside the reach, against session 26's 58 percent.
- **The pass line, and it is named here rather than found after the deploy.** The caught area roughly triples on the geometry alone, so what the slice has to beat is modest: **on all three seeds the typical share of live bodies caught per press at least doubles, and the still-grave empty-reach share falls below half of 58 percent.** **If either misses, that is a finding you report before the deploy and never a row you tune**, because the rows are Mark's and the reach's basis is R11's.
- **A body's net travel, up the field and down the field, both printed against the row's nominal**, per the fourth ruling.
- **The front's speed in units a tick and field widths a second**, per the third ruling.
- **A rendered check, and read the screenshots.** Three fronts, countable, each stopping at the same circle, the ring still sitting over the crowd at the end of its span, and the crowd visibly moving inside it. **Play a run, end it, and play another.** Read note sections 8, 10 and 11 for what the earlier rendered checks could and could not catch before you spend the time, and **say plainly what you could and could not see**.
- **A hand-recorded tape with a belch spent in it**, at your tip, against the built app through `vite preview`, driven with `playwright-cli`, measured to `outcome: 'verified'`, with all three `state.refusals` counters printed. **Say how you got the reservoir full.**
- **A batch at your tip** under `steady-far` and `loose-far` on slice I's seeds, **900 to 905 under each hand**, with the shove reading's belch arm printed beside `belchCadence`, so your figures subtract against note sections 9, 10 and 11. **`belchWorthIt` prices a belch whose scope just grew**; print what it did and leave it alone.

**(i) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `fix(hungry-grave): the belch catches half the field's width and its eruption stops where the push stops (#124)`.

**(j) The progress note**, section **12**. Beyond the contract's list, say: the new reach with its derivation and the fences you actually ran; the before and after off `belch-play.ts` on all three seeds against the pass line; the still-grave empty-reach share against 58 percent; the net travel up and down the field; the front's new speed and whether it still reads as a blast; the two renderer anchor fixes; the eruption reach reading the row and the diagonal derivation deleted; the old dominance paragraph corrected; the two retitled clear-the-reach tests and their new sentences; the rendered check with what you could and could not see; `GOLDEN` held with both its reasons and all three version constants named as held.

**(k) Stop and report.** Under 300 words. **Do not start slice K.**

### What must not move, and a move is a stop

- **The fences**, all six by title. The core's cycle guard keeps `KNOWN_CORE_CYCLES` empty.
- **`WITNESS_VERSION` 8, `READINGS_VERSION` 5 and `FORMAT_VERSION` 4.** You declare no folded field and you change no reading's meaning. The reach is a magnitude, not a comparison semantic.
- **`GOLDEN`.** Round two's two re-pins are spent. A move is a stop and report.
- **`scrollField` and `src/game/step.ts`.** The fourth ruling. A skip keyed on a shove in flight retunes the bell, and a skip keyed on the belch is a rule keyed on a line.
- **The bell, in every part.** Its two reaches, its `toll.struck`, its push column and its call into `shoveStormTarget`. Slices H and H2's.
- **`BELCH_SHOVES`, `BELCH_SHOVE_THROW` and `BELCH_SHOVE_SPACING`.** Mark's pick of option 2 and R3 as superseded. A measurement arguing any of them should move is a finding for the note.
- **The shove module's arithmetic.** `SHOVE_TICKS`, the decay, `firstStepOf` and the accounting are slices H and H2's. `travelShove` accounting the shove's own step and never the scroll is the honest shape and it stays.
- **The gas**, in every part: field-wide, boss patterns included, killing nothing.
- **The belch's no-damage rule.** A measurement showing the belch is weak is never a reason to give it damage back.
- **`pushable` and `moveStormTarget`.** A raw position write from `belch.ts` or from the renderer is a stop.
- **The harness's own rows**, `belchWorthIt` above all.
- **Every cap, every fault identity, `STREAM_SALTS` and `STREAM_ORDER`.**
- **You file no ADR and amend none.** ADR 0008's "shove nearby" already covers a local shove at any radius, and **applying a rule is not amending it**.

### Seams under test

`src/game/belch.ts`: `fireBelch` and `shoveNearbyTargets` at the new reach, and the reach expressed as a derivation off the field's width. `src/app/screens/game/StormRenderer.ts`: `eruptionFrontsAt` stopping at the belch's row, `erupt`'s anchor against the core's measuring point, and the ring's drift with the field.

### Module boundaries

**Nothing is created, deleted, merged or split.** Two imports may be added: `FIELD_WIDTH` from `src/game/field.ts` into `belch.ts`, and the belch's reach into `StormRenderer.ts` beside the two rows it already reads. **The renderer reading the sim's row is the direction the arrows already point**, and `src/app`'s boundary row governs only `sound.ts`. `shove.ts` still has no import line and gains none. `step.ts` is not touched at all. `StormRenderer` stays behind the renderers, reads the run and never writes it, and no new library enters.

### The planned test list

1. *A body inside the belch's reach is shoved and a body outside it is not*, both expressed against the row. **Write it first.**
2. *The belch's reach is half the field's width, derived from the field rather than written down.*
3. *The eruption's fronts stop at the reach the belch shoves over, and never past it.*
4. *The drawn eruption and the measured reach share a centre.*
5. *The drawn eruption travels with the field, so it still covers the bodies it caught at the end of its span.*
6. *A belch still takes no health off anything, boss included.* The half that did not change, asserted so it cannot drift out.
7. *A belch still strikes each body once and its later shoves re-shove the same impulse.*
8. *A boss and a set piece's source are still never moved by a belch.*
9. *The eruption still draws as many fronts as there are shoves, each lasting as long as its shove.*
10. *A shoved body still carries the field's own drift, so its net travel is the throw against the scroll.* The fourth ruling asserted, so a later slice cannot quietly exempt one line.
11. **Slice J's two clear-the-reach assertions, retitled** to the sentence that now holds, per the fifth ruling.
12. **The palette scan**, green over anything the eruption draws.
13. **The six fences**, green, each by title.
14. **The golden digest**, held, with both the reasons it should have held.

**What this slice is expected to turn red.** `belch.test.ts`, `StormRenderer`'s suite, `repel.test.ts` and `belchCadence.test.ts` wherever a figure is asserted, `bot.test.ts` wherever `belchWorthIt` changes what a run does, and `measure.test.ts`'s rich fixture. **A realistic count is 6 to 15 files.**

### Verification steps, with actors

1. **Agent.** The before and after off `local/belch-play.ts` on seeds 902, 17 and 5150, read against the pass line.
2. **Agent.** The still-grave empty-reach share off `local/belch-reach.ts`, against 58 percent.
3. **Agent.** The eruption's front proved to stop at the shove's reach, and its new speed printed both ways.
4. **Agent.** A body's net travel up and down the field, against the row's nominal.
5. **Agent.** `WITNESS_VERSION` 8, `READINGS_VERSION` 5, `FORMAT_VERSION` 4 and `GOLDEN` all held, with both of `GOLDEN`'s reasons.
6. **Agent.** A hand tape with a belch in it, verified, with the three refusal counters.
7. **Agent.** A rendered check across two runs with the screenshots read.
8. **Agent.** A batch at this tip on slice I's seeds, with the belch arm printed.
9. **Human (Mark), and none of these blocks you.** Whether he can say what the belch did for him, unprompted, which is ticket #124's own done line. **The deploy that puts it in front of him is the orchestrator's, straight after your report.**

### State of the branch

- The tip should be the docs commit carrying this prompt. **`WITNESS_VERSION` 8, `FORMAT_VERSION` 4, `READINGS_VERSION` 5, `GOLDEN` as slice J left it.**
- **Round two's `GOLDEN` budget is two and both are spent.** Slices K and L are permitted none and neither are you.
- Read round two progress note sections 8 through 11 for the test counts and the test-name lists.

### The stuck rule

**Three things are already known to be a stop:** any of the five inputs missing; a `WITNESS_VERSION`, `READINGS_VERSION` or `FORMAT_VERSION` move; and any `GOLDEN` re-pin. **And four things are ruled rather than open:** the reach is half the field's width and the option Mark declined was the whole screen, so a measurement arguing for more is a finding and never a change; the count, the spacing and the per-shove throw are his pick and do not move; the scroll composes with the shove and `step.ts` is not touched; and the belch does no damage of any kind.

### What is not your job

- **The meter and its corner**, slice K's.
- **The Wall**, in every part, including whether a reach this size opens it. Slice L's, and `waves.ts` and the mob table are opened only to read.
- **The resisted push on the Waking's source and the boss's per-toll tell.** ADR 0008 and ADR 0007 as re-ruled on 2026-09-15, tickets **#131 and #132**, outside round two and Mark's to schedule. **A boss and a set piece's source are still never moved by this slice.**
- **A field-wide tell for the gas.** The old diagonal front was the only picture the gas had and this slice takes it away; that is filed as a tuning-step input and is not yours.
- **Slices H, I, H2 and J's work.** The shove module, the impulse, the bell's two reaches, the reading's shape and the version notes.
- **The harness's rows and the orchestrator's batch.**
- **The record's section 7 findings.**

---

## Slice K: the meter fills and changes corner (#127)

Model: Opus, subagent type general-purpose. One coder, one code commit, one docs commit. Messages end in `(#127)`.

Round two slice K of The Hungry Grave (ticket #127): the belch's control stops being a light that turns on and becomes a ring that fills, in the corner the steering thumb is not already in.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice K.

**This slice changes no simulation rule at all**, which is why it is separable from J and why it owes no `GOLDEN`, no witness move and no version move of any kind.

**Four rulings shape this slice and none of them is yours to revisit.**

**First: a radial fill of the ring that already exists.** The record's ruling R7. Every shipped phone precedent found is a radial fill: Brawl Stars' filling ring, Genshin's burst icon filling with the element's colour, and Riot's own name for the convention, "radial timer" (`docs/research/push-feel-precedent.md` section 4). **The claim that a radial is harder to read than a bar could not be sourced and is folklore; do not cite it and do not act on it.** A bar has no shipped precedent in this set and is not an option here.

**Second: ready is a colour change plus the pulse that already exists, and the dim-to-bright alpha step goes.** ADR 0054's reading of ADR 0014 binds the HUD to announce by count, by shape or by subtraction and **never by getting brighter**. The fill announces by area, which is the compliant channel. `QUIET_ALPHA` is the non-compliant one and it comes out. **The pulse stays**: it is motion rather than a brightness comparison the player has to make against a remembered state.

**Third: the corner is bottom-left.** Mark's ruling 5 of 2026-09-15. **A handedness setting is future work and is not this slice**, and **the thumb-zone finding against this corner is already filed for his read in the record's section 7 and is not yours to apply**. `READOUT_RESERVE` reserves the two **top** corners only and the belch button is positioned in `GameScreen.resize` independently of `fitField`, so the move is one `position.set` plus the two rects in `BelchButton.test.ts`, and the 540 by 760 fit is untouched.

**Fourth: the 44 by 44 CSS pixel target floor holds at every viewport.** It is asserted rather than eyeballed today, against `BELCH_SIZE` 108, because the stage scales per viewport and the phone is where it binds. **A fill that shrinks the touchable area is a stop.**

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/round-two-wall-belch.md`: **ruling R7 in full is this slice's contract**, and **section 7's first finding is the one thing about this corner that is filed and not applied**.
4. `apps/hungry-grave/docs/research/push-feel-precedent.md` **sections 4 and 5 in full**. Section 4 is the form; section 5 is the thumb zones and the touch-target floors, Apple's 44 points, Material's 48 dp and WCAG 2.5.5's 44 CSS pixels at AAA. **Section 5 also says plainly that no primary description of button geometry in a named portrait mobile shmup could be found**, so a 540 by 760 portrait layout has no shipped citation behind it and you do not invent one.
5. `apps/hungry-grave/docs/adr/0054-the-ladder-reads-twice-in-the-storm-and-on-the-hud.md` and `0014-readability-layering.md` in full, which are the second ruling's whole basis, plus `0038-the-belch-binds-to-a-dedicated-button.md` and `0039-the-field-boundary-is-a-readout.md`, because a second readout on the same frame has to be told apart from the first.
6. `apps/hungry-grave/CONTEXT.md`, the entries Belch, Reservoir and HUD. **Read the Avoid lists before naming anything.**
7. The tree: `src/app/screens/game/BelchButton.ts` whole, all 134 lines, and its test file whole; `src/app/screens/game/GameScreen.ts`'s `resize` around the pause button and the belch button; `src/app/layout.ts` whole, especially `READOUT_RESERVE` and the corner-intersection helpers; `src/app/palette.ts`'s `graveGlow`, `hudInk`, `hudDim`, the band constants and the live-field entry list; `src/app/__tests__/palette.test.ts`, which is the source scan that will hold you to the ceiling.

### The definition, in observable terms

After this slice: the belch's ring reads partway full at a partway-full reservoir, and its fill is a function of the reservoir alone. At a full reservoir it changes colour and pulses, and it never announces its charge by getting brighter. It sits in the bottom-left corner at every viewport the game runs at, with a touchable target at least 44 by 44 CSS pixels, overlapping neither the corner readout stack nor the pause button. Every colour it draws sits under the field's own band ceiling while the field is live.

No simulation rule changes at all. `WITNESS_VERSION` 8, `READINGS_VERSION` 5, `FORMAT_VERSION` 4 and `GOLDEN` are all untouched, and none of the four files is in the commit.

What a player meets: without looking away from the field they can tell roughly how close the belch is to ready, and their steering thumb is no longer in the same corner as the button. That is ticket #127's done line.

### The work, in this order

**(a) Read the four files whole before you edit one**, then `git log --oneline -25`, `git status --short`, and your own test-name baseline into `local/round2/` under a name carrying the letter K.

**(b) The tests first, red.** **Write the ceiling test and the target-floor test first**, because they are the two this slice is most likely to break and least likely to notice breaking.

**(c) The fill.** The ring becomes a radial fill of the reservoir's own fraction, drawn as an arc rather than as a second full ring at a different alpha. `sync` already takes the reservoir's loaded state and the tick (`GameScreen` passes `run.reservoir >= RESERVOIR_CAPACITY`); **it needs the fraction rather than the boolean**, and the fraction is the reservoir over its capacity. **Keep `GameScreen` the one place that reads the run**: the button takes numbers, not a `RunState`.

**(d) The ready tell, and the alpha step's removal.** Colour plus the existing pulse. `QUIET_ALPHA` comes out and `ringAlpha`'s two-state shape goes with it. **`LIT_PULSE_DEPTH` and `LIT_PULSE_TICKS` stay.** Whatever replaces `ringAlpha` keeps a pure function testable without a renderer, because that is what the existing tests stand on.

**(e) The colour, and this is the one craft choice you research rather than pick.** The button draws in `PALETTE.graveGlow` at luma 67.25 against a band ceiling of 68 that binds every colour drawn while the field is live, so **the filled and unfilled channels cannot separate by value and must separate by hue and by area**. **Research it before you choose it**: the precedent record's section 4 says what each shipped game uses as the fill's own colour, Genshin filling with the element's colour and Brawl Stars with a slim yellow ring on grey. **Say in the note what you chose, which precedent it came from, its luma, and what you set it against.** If no honest colour exists under the ceiling that separates from `graveGlow` by hue, that is a stop and report, not a ceiling you raise. The palette's live-field list and `palette.test.ts`'s source scan are what hold you.

**(f) The corner.** One `position.set` in `GameScreen.resize`, positioned from `READOUT_RESERVE.margin` the way the pause button and today's belch button both are, **so the two cannot drift apart and the non-overlap rule stays one rule in one place**. The comment above it says what the old one said about why it sits over the field, updated for the side it is now on.

**(g) The test rects, and this is where the old assertion becomes wrong rather than stale.** `BelchButton.test.ts` computes a pause rect and a belch rect and asserts they do not overlap. **The belch rect moves to the left edge and the assertion has to be re-derived rather than edited by hand**: on the left the button is now under the corner readout stack's column rather than the pause button's, so **the rect it must not overlap changes too**. `READOUT_RESERVE.width` 260 and `.height` 120 are what the stack claims. Assert against both corners rather than one.

**(h) The measurements this slice owes.**

- **A rendered check, and it is the point of this slice.** The built app through `vite preview`, driven with `playwright-cli`, at a phone viewport and at a desktop one. **Screenshots at an empty reservoir, a partway one and a full one**, read rather than collected, and say what you actually saw. **Play a run, end it, and play another**, because a check that only ever plays run one is structurally blind.
- **A grayscale read of the full-reservoir frame**, because the ceiling is a value rule and `filter: grayscale(1)` is exactly what the rule is measured in. Say whether the fill is still legible with the hue removed, which is the honest limit of a hue-separated design.
- **The target floor asserted at every viewport in `VIEWPORTS`**, not just at the phone.
- **No tape, no batch, no determinism run is owed**, and that claim is checked rather than assumed: nothing under `src/app/screens` is folded and no rule the simulation runs is in this commit. **If any of the four version constants or `GOLDEN` moves, that is a stop and report**, because it would mean something here reached the sim.

**(i) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the belch's ring fills with its reservoir and moves under the other thumb (#127)`.

**(j) The progress note**, section **13**. Beyond the contract's list, say: the fill's shape; the colour you chose with its precedent, its luma and what you set it against; the alpha step removed and the pulse kept, cited to ADR 0054; the corner moved and the two rects re-derived; the grayscale read and what it showed; the target floor at every viewport; and the four constants and `GOLDEN` all named as untouched.

**(k) Stop and report.** Under 250 words. **Do not start slice L.**

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 8, `READINGS_VERSION` 5, `FORMAT_VERSION` 4 and `GOLDEN`.** None moves, none of the four files is in the commit, and a move in any is a stop and report rather than a re-pin.
- **The band ceiling and the palette's live-field list.** A colour that will not fit under the ceiling is a stop, never a ceiling you raise or an exemption you claim. **The exemption list is for colours that only ever draw when the field is not live**, and this control draws over a live field.
- **`BELCH_SIZE` 108 and the 44 by 44 CSS pixel floor.**
- **The layering.** ADR 0014's stack is pinned by the layering test and nothing here draws above `mobFire`.
- **The claimed-pointer field and the steer model's release path.** A press on the button must still not anchor a drag, whichever corner it is in.
- **`READOUT_RESERVE`'s three figures and `fitField`.** The two top corners stay reserved and the field's fit is untouched, which is why this move is cheap.
- **The template's shared `Button` in `src/app/ui`.** It carries hardcoded pinks that the palette scan does not reach, which is why this control is purpose-built, and #38 owns the shared widgets.
- **No ADR is filed or amended, and no ADR gains a combat magnitude.**

### Seams under test

`src/app/screens/game/BelchButton.ts`: the fill as a pure function of the reservoir's fraction, the ready tell after the alpha step is gone, the drawing, the hit area and the claimed pointer. `src/app/screens/game/GameScreen.ts`: the one `position.set` and what it is positioned from. `src/app/palette.ts`: the fill's colour entry, under the ceiling and inside the live-field list.

### Module boundaries

**Nothing is created, deleted, merged or split, and no import direction changes.** `BelchButton` stays a dumb view: data in, pixels out, taking numbers from `GameScreen` and owning no data source, no loop subscription and no change detection. **`GameScreen` stays the driver that reads the run.** `src/app` still reaches `src/game` for types and nothing reaches back.

### The planned test list

1. *The meter reads partway full at a partway-full reservoir.*
2. *The fill is a function of the reservoir alone.* Same reservoir, same fill, whatever the tick.
3. *The meter's charge never announces by brightness alone.* The unfilled and filled channels differ by area rather than by a step in alpha, asserted over the pure function.
4. *The ready tell reads at a full reservoir and not below one.*
5. *Every colour the control draws sits under the field's ceiling while the field is live.* Through `palette.test.ts`'s existing scan; **confirm it green over your addition rather than writing a second one**.
6. *The belch's control sits in the bottom-left corner at every viewport.*
7. *It carries a target at least 44 by 44 CSS pixels at every viewport.* The existing assertion, held.
8. *It overlaps neither the corner readout stack nor the pause button, at every viewport.* The re-derived rect, against both corners.
9. *A press on the control still does not anchor a drag.* The claimed-pointer path, held.
10. **The layering test**, green.

**What this slice is expected to turn red.** `BelchButton.test.ts` throughout, `GameScreen`'s own resize tests, `palette.test.ts` over the new entry, and any screen-lifecycle test that asserts the button's position. **A realistic count is 4 to 10 files.** A diff larger than that is a reason to check what you reached into.

### Verification steps, with actors

1. **Agent.** A rendered check at a phone viewport and a desktop one, at three reservoir levels, screenshots read.
2. **Agent.** A grayscale read of the full-reservoir frame, with the honest limit stated.
3. **Agent.** The target floor asserted at every viewport.
4. **Agent.** The four version constants and `GOLDEN` all untouched, stated, with none of the four files in the commit.
5. **Agent.** The palette scan green over the new colour, with its luma printed.
6. **Human (Mark), and none of these blocks you.** Whether he can tell how close the belch is to ready without looking away from the field, and whether the corner is the right one under his own grip. **The thumb-zone finding in the record's section 7 is his read and not yours.**

### State of the branch

- The tip should be slice J's docs commit. **`WITNESS_VERSION` 8, `FORMAT_VERSION` 4, `READINGS_VERSION` 5, `GOLDEN` as slice H or slice J last pinned it.**
- **You are permitted no `GOLDEN` re-pin.** Round two's two are spent or accounted for.
- The headless browser runs at 3 to 21 FPS under SwiftShader, which slices B, D, F and G all recorded. That is the harness and not the build.

### The stuck rule

**Three things are already known to be a stop:** any version constant or `GOLDEN` moving; no honest fill colour existing under the band ceiling; and the target floor failing at any viewport. **And one thing is ruled rather than open:** the corner is bottom-left and the thumb-zone research against it is filed for Mark, so a measurement or a gate finding arguing for the other corner goes in the note and is built past.

### What is not your job

- **Handedness**, which Mark ruled future work.
- **The shared widgets in `src/app/ui`**, which are #38's.
- **The HUD's ladder pips and the field boundary's grading**, which are ADR 0054's and ADR 0039's own work and not this control's.
- **Slices H, I and J's work**, in every part. Nothing under `src/game` is in this commit.
- **The Wall**, slice L's.
- **The record's section 7 findings.**

---

## Slice J2: a body that dies mid-shove finishes its flight, and the press writes down every body it missed (#124)

Model: Opus, subagent type general-purpose. One coder, **two code commits and one docs commit**. Messages end in `(#124)`.

Round two slice J2 of The Hungry Grave (ticket #124): a press hands every body at one distance an identical impulse and half of them stop dead where they died, so the belch Mark watched threw part of the crowd and abandoned the rest at no distance the player can see. This slice makes a shove outlive the body carrying it, and makes every press write down what it missed and why.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice J2.

**Two things about this slice's own name and numbering, said here so nobody later reads either as a mistake.** It is **J2** rather than K2 because a suffix on this branch has always meant a later pass on the same subject and never a dispatch position: `H2` retuned `H`'s shove and `J-fix` repaired `J`'s belch. This is the third pass on the belch press and on the shove it rides, J's and H's, and it has nothing to do with K's meter. And **its progress note section is 15 rather than 14**, because section 14's heading for slice L is already in the tree and the note is appended to and never renumbered, so 15 is written before 14 is filled in.

**Two code commits, and it is this round's second authorized departure from the contract's one-code-commit rule.** The witness fold lands in its own commit declaring every new folded field, for the reason slice H's did: a version stamped before the fold stops moving names several folds (`apps/hungry-grave/docs/lessons.md`, The sim). The second commit is the rest.

**Slice K lands before you. Verify each of these by name and any one missing is a stop and report:** `Impulse`, `startShove`, `advanceShove`, `takeShoveTravel`, `clearImpulse`, `shoveInFlight`, `impulseSpent` and `SHOVE_TICKS` 30, all in `src/game/shove.ts`; `damageMob` in `src/game/mobs.ts` calling `reportShoveTravel` before `spawnCorpse`, and `cullMobs` calling it too; `advanceMobs` skipping a slot on `!mob.alive`; `Corpse` in `src/game/corpses.ts` carrying no velocity field of any kind; `Belched` in `src/game/events.ts` carrying exactly `cancelled` and `shoved` and nothing else; `filledSegments` in `src/app/screens/game/BelchButton.ts`, which is slice K's; and `WITNESS_VERSION` 8, `READINGS_VERSION` 5, `FORMAT_VERSION` 4 and `GOLDEN` at `-145039082`. Read round two progress note sections 11, 12 and 13 for what J, J-fix and K each landed.

**Why this slice exists, and it is a sighting rather than a measurement.** Mark played the deployed belch on 2026-09-16 and saw *"12 to 15 mobs get pushed and easily 5 or 6 that were right next to those other ones that did get pushed did not get pushed"*, all at about the same distance. **Session 27 proved the belch itself is fair**: twelve bodies placed on one ring at one distance were handed twelve identical impulses, `shoved: 12`, the same `stepX`, `stepY`, `ticksLeft` and `shovesLeft` on every one of them (`local/jfix-equal-distance.ts`, uncommitted scratch, still in the worktree and it is your before-measurement). **What is not fair is what happens next**: over the ninety ticks of flight six of the twelve died and stopped dead where they died, at flight ticks 18, 31, 31, 33, 66 and 66. So half the crowd travelled 180 units and half travelled a fraction of it, and nothing on screen says why.

**Six rulings shape this slice and none of them is yours to revisit.**

**First: R10's held separate-clocks lever is taken, and the trigger is pulled.** The record's ruling **R10** names this lever, defers it, and names its own trigger: *"A rung where no shambler is ever seen travelling is a finding for round two's close and the trigger for the separate-clocks ruling at the next witness move, and it is the orchestrator's under one-push mode."* The research calls the lever not optional (`docs/research/watched-pushback-duration.md` section 5) and names both shipped shapes, a body that flies and then dies, and a corpse that inherits the impulse and finishes the travel. **The second is what the pre-slice-H build did by accident and what slice H took away**, and it is what this slice builds back deliberately. **The trigger is now pulled by the orchestrator under one-push mode, on Mark's sighting, and it is written here for his read on the branch rather than asked of him**, on ruling R1's own precedent.

**Second: the press's record carries every body it looked at, and the reason for every one it did not move.** Mark's standing rule for the harness, 2026-09-16: *"Literally everything that we need to care about and measure should have some representation in our tape. That's the whole point of it so that we can measure things and iterate."* Today `Belched` carries `cancelled` and `shoved`, two counts of what happened, and **nothing at all about the misses**, so the exact thing he watched leaves no trace in any tape and no reading can be asked about it. **A press with a hundred bodies in the frame and none in reach and a press with nothing alive on the field both report `shoved: 0` today.** It rides with the first ruling rather than going alone, because that slice is already moving a version.

**Third: `WITNESS_VERSION` moves 8 to 9, in its own commit, and it is taken eyes open.** Whatever ends up carrying a shove after a body dies is state a replay must rebuild, which is folded state (ADR 0019), and folded state that gains a field moves the version (`witness.ts`'s own rule: *"it moves only when the order or the field list below moves"*). **This exceeds the design record's section 5, which says the witness moves exactly once in round two and that a second move anywhere is a stop.** It is the orchestrator's call under one-push mode, taken as the arithmetic of R10's own deferral rather than as a new decision, and **its cost is stated rather than discovered: every tape recorded before your fold commit is refused at the decode, which is the fifth time this step has made saved tapes a dead baseline.** The commit's own JSDoc declares every new field the way version 8's paragraph declares its seven.

**Fourth: `READINGS_VERSION` moves 5 to 6, it is not optional, and it moves for the bell as much as for the belch.** Three things change meaning at once. `tuning.repel.belchShoves` and `belchDistance` today count what a body was carried **before it died**, because `reportShoveTravel` fires on `damageMob`'s kill path; after this slice a shove's distance is what the whole flight covered. **And the bell is in exactly the same position, which is easy to miss because this slice's trigger was a belch sighting**: `sweepToll` (`src/game/lines/bell.ts`) calls `pushTarget` before `damageStormTarget`, so a body the cone kills on arrival dies holding a live impulse and reports nothing today and flies the whole push after you. **So `tuning.repel.totalDistance` and each toll's own `distance` move the same way `belchDistance` does**, and at the top rungs, where note section 10 measured the kill reaching most of the cone, that is where the change is largest. Third, the belch's own record gains the misses. All three are changes of comparison semantics on existing readings, which is `readingsVersion.ts`'s own rule for when the version moves. **Every batch recorded at slice J-fix's tip is incomparable with every batch recorded after you, on both arms**, and version 6's note says so naming the bell and the belch both.

**Fifth: `GOLDEN` re-pins exactly once, the re-pin is granted rather than yours to take, and it is granted against a proof.** Read this paragraph twice. **No shove happens anywhere in the canonical scenario**: `digest.ts`'s `runScenario` passes `belch: false` on every one of its six hundred ticks, `levels.bell` is 0 for the whole scenario so `tollClock` returns before it arms a ring, and `startShove` has exactly one production caller, `shoveStormTarget`, which has exactly two, `belch.ts` and `bell.ts`. **So the rule this slice changes cannot be reached by the scenario and the two scripted kills at ticks 240 and 540 are not deaths mid-shove.** What does reach the digest is the fold: `foldCorpses` folds seven fields of every live corpse and `GOLDEN` holds `corpses: 1` at tick 600, so a corpse record gaining folded fields moves the checksum at their resting zeroes, which is exactly what happened to `mobs: 5` when slice H folded the impulse onto `Mob`.

**That is a further re-pin beyond what round two budgeted, and the orchestrator granted it on 2026-09-16 under one-push mode.** Round two took one in slice H and slice J's went unused and was forfeit, and R9 allocated its two by slice name rather than as a pool, which is why a forfeit permit is not a draw you inherit. **The grant is a dated closing paragraph on ruling R9 in the record's section 2 and section 5 carries a pointer to it. Read both before you pin anything.** It is one re-pin, it reopens nothing, and every other slice is still permitted none.

**And it is granted against a proof rather than a promise, because a behavioural drift hiding inside a mechanical one is the exact thing the budget existed to catch.** Before you pin, show the diff has one cause: **run the canonical scenario with your new corpse field held at its resting value and folded the old way, and show the old digest `-145039082` returns whole**, every field and the checksum. Then fold the new field and pin what comes out. **Both runs go in the progress note.** **A digest diff with any other cause, a moved position, a moved count, a moved stream cursor, a moved level, is a stop and report and never a re-pin.** The new pin carries its own dated paragraph in `digest.ts`'s JSDoc naming every field that moved beside every field that held, the way slice H's does, and its own entry in the note's section 3.

**Sixth: the hard edge is named as open and is not your work.** A second cause of what Mark saw is not ruled out: the reach is a hard edge with no falloff, so a body just inside it and one just outside it are thrown differently at nearly the same distance, and before slice J-fix nothing on screen marked where that line was. **J-fix made the drawn ring and the real reach one circle, so his next play is evidence on whether that was part of it.** Nothing here softens the edge, moves the reach or draws anything new. **A measurement arguing the edge should have a falloff is a finding for the note.**

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/round-two-wall-belch.md`: **ruling R10 in full and its held-lever paragraph above all, which is the whole of your first half**, R1 for why per-body shove state is folded and what a witness move costs, R3 as superseded for the wave structure you must not disturb, R8 for the one shove module, R9 for the `GOLDEN` and `READINGS_VERSION` rules you are moving past, R11's closing paragraph for why the scroll composes with every shove, section 5 for what must not move, section 6 for the sentences already pinned, section 7 for the findings no slice acts on.
4. `apps/hungry-grave/docs/research/watched-pushback-duration.md` **section 5 in full**, which is where the separate-clocks lever is named not optional, where both shipped shapes are named, and where **the corpse's freshness cost is already priced**: a corpse carried up-field spends a second of its ten-second freshness per 38 units. At the current throw of 180 that is a real bite out of a corpse's life and you measure it rather than repeat this sentence.
5. `apps/hungry-grave/docs/adr/0019` for the fold and the refusal rule, `0004` for freshness and the decay curve the corpse module's own comment derives from the scroll, `0015` for the golden digest, `0008-the-belch-full-only-gas-everywhere-shove-nearby.md` as amended, `0007` for why a boss is never moved, and `0024` for the closed append-only fault identity list.
6. `apps/hungry-grave/docs/push/round-two-progress.md` **sections 11 and 12 in full**, section 8 for slice H's fold commit and the two tests CodeRabbit's finding added, section 4's slice H entry for what that finding actually was, section 2 for the version ledger and section 3 for how a `GOLDEN` entry is written.
7. `apps/hungry-grave/docs/push/handoff.md`, the section **"## Findings filed for Mark's read, not applied"**, read by heading with `sed` and not whole. Two entries are yours to know: the belch's shoves never happening at the top bell rungs, which is this same mechanism reached from the other side, and **`src/dev/readings/repel.ts` carrying a stale sentence, "push only exists at bell levels 4 and 5", in its JSDoc and again in `__tests__/repel.test.ts`, which the handoff assigns to the next slice that touches the readings. That is you.**
8. `apps/hungry-grave/CONTEXT.md`, the entries **Corpse, Freshness, Burst, Mob and Tape**. **Read the Avoid lists before naming anything.** The Corpse entry says a corpse is what a kill leaves behind *scrolling down the field*, and after this slice that is true of every corpse except one in flight, so **the entry is amended in place with a dated triple** the way that file's own amendments are worded.
9. The tree, whole where it is short and by function otherwise: `src/game/shove.ts` whole; `src/game/corpses.ts` whole, especially the `Corpse` interface's own JSDoc; `src/game/mobs.ts`'s `damageMob`, `cullMobs`, `travelShove`, `moveMobInsideBounds`, `reportShoveTravel`, `advanceMobs`, `spawnCorpse` and `spawnMob`'s impulse clear; `src/game/step.ts`'s `scrollField` and the phase order, to read and not to touch; `src/game/witness.ts`'s `WITNESS_VERSION` JSDoc, `foldMobs` and `foldCorpses`; `src/game/events.ts`'s `Belched`, `MobShoved` and `MobKilled`; `src/game/belch.ts`'s `fireBelch`, `shoveNearbyTargets` and `insideBurst`; `src/game/stormTargets.ts`'s `StormTarget`, `stormTargets`, `fillFromMob`, `fillFromBoss`, `fillFromSetPiece` and `shoveStormTarget`; `src/dev/digest.ts`'s `runScenario`, `scriptedKills` and `GOLDEN`; `src/dev/readingsVersion.ts`; `src/dev/readings/repel.ts` and `belchCadence.ts`; `src/dev/batchReport.ts` and `compareRuns.ts`.
10. `local/jfix-equal-distance.ts`, **session 27's uncommitted proof and your before-measurement**. It imports `BELCH_BURST_RADIUS` from the source and reads `!m.alive` per tick, so it re-measures at your tip with no edit.

### The definition, in observable terms

After this slice: a body caught by a press travels the whole of what the press threw, whether or not the storm kills it on the way, so twelve bodies at one distance end at twelve equal distances instead of six. A body that dies in flight leaves its corpse where the flight was going rather than where the storm caught it, and that corpse then drifts at the scroll like every other corpse. A corpse carried up the field is further from the grave when it lands and has spent part of its freshness getting there, which is a real cost and is measured rather than assumed. Nothing else about a shove moves: its length, its decay, its wave structure, its spacing and its throw are all exactly what slices H2, J and J-fix set.

And every press writes down what it did. The belch's own record carries, for each body in the frame, whether the press moved it and, when it did not, which gate refused it: not entered, out of reach, no direction to be thrown along, not pushable. **A press that catches nothing now says which of those it was**, and a batch can be asked what share of the field a press typically reaches and what the misses were made of.

`FORMAT_VERSION` still reads 4, because nothing new is recorded in a tape header and no sim event is ever encoded into a tape at all. `WITNESS_VERSION` reads 9, `READINGS_VERSION` reads 6, `GOLDEN` is re-pinned for the corpse fold and for nothing else, and `pnpm verify` is green.

What a player meets: the press that threw half the crowd throws all of it. **Ticket #124's done line is Mark's, unprompted, on the deploy after you**, and the orchestrator takes it.

### The work, in this order

**Five things the tech gate found before you started, each of which would have cost you a rebuild.**

1. **Build the fold commit whole and green, never split one afterwards.** The witness commit must stand on its own with `pnpm verify` green, so write the rule tests that need the new behaviour as `test.todo` inside it and fill them in the second commit. Splitting a finished body of work into two commits afterwards needs code edited or backed out, which is refused outright.
2. **Distance is `Math.sqrt(x * x + y * y)` and never `Math.hypot`.** `src/game/math.ts` has its own paragraph on this: `Math.sqrt` became exactly specified in tc39/ecma262 PR #3345 while `Math.hypot` is implementation-approximated, and a determinism-critical core cannot carry an approximated one. There is deliberately no hypot wrapper and you do not add one.
3. **The frame is `MOB_CAP + 2`**, the mob pool plus the boss plus the set piece's source, which is what `SLOTS` in `stormTargets.ts` is sized to. Anything that allocates per frame reads that and never `MOB_CAP`.
4. **The isolation proof asserts, it does not hold.** Assert the new corpse field sits at its resting value on all six hundred ticks rather than pinning it once and trusting it, and **run the proof at the fold commit's own tree** so nothing from the second commit is in it.
5. **Three exits end a shove, not two**, and they do not behave alike. Work item (f) rules each.

**(a) Verify the inputs**, per the stop above, then `git log --oneline -25`, `git status --short`, and your own test-name baseline into `local/round2/` under a name carrying the letters `j2`.

**(b) Measure before you change anything.** Run `local/jfix-equal-distance.ts` at the tip as it stands and keep the output whole. It should reproduce session 27's twelve bodies, six survivors, and deaths at flight ticks 18, 31, 31, 33, 66 and 66. **A before and after off one unedited script is the only honest way to say this slice worked**, and it is the same discipline slice J-fix used with `belch-play.ts`.

**(c) The tests first, red.** **Write the finish-the-flight test first**: a body given a shove and killed partway through ends where an identical body that lived ends. Express it against the row rather than against a number typed in the test.

**(d) The shape, and this is the one place you have a real choice.** R10 names the corpse inheriting the impulse and the research names it as shipped, and that is the shape to build unless the tree makes a better one. **Whatever you choose, three properties bind it.** `src/game` stays dependency-free and pure: no import of `src/app`, `src/dev` or `src/tape`, and the core's cycle guard keeps `KNOWN_CORE_CYCLES` empty. **`moveStormTarget` and `pushable` stay the only way a body is moved and the only answer to whether it may be**, so a raw position write is a stop. And **the bound's home is ruled rather than yours to pick, because as written it has no cycle-free one.** `corpses.ts` reaches `mobs.ts` type-only today, so a value import of `moveMobInsideBounds` would close a `mobs` and `corpses` value cycle, and `src/__tests__/boundary.test.ts`'s *the core has no import cycle > carries no value-import cycle beyond the ones written down* holds `KNOWN_CORE_CYCLES` empty, with its own JSDoc saying adding to it is the thing to argue about rather than reach for. **The ruling: the bound stays exactly where it is in `mobs.ts`, and `advanceMobs` advances both carriers.** A corpse in flight is advanced from the same loop that advances a body in flight, so one module owns the travel, the bound is written once and never moved, and **the kill-tick double advance goes away**: a body killed partway through `advanceMobs` cannot be advanced again by a second carrier's loop later in the same tick. **The `shove.ts` alternative was considered and not taken**: hosting the bound there needs two new imports into a module that imports nothing but math and types, and it still leaves the double advance, so it costs more and buys less. **A corpse thrown down the field meets `cullCorpses`' edge at `FIELD_HEIGHT` before it meets the bound at `FIELD_HEIGHT + SPAWN_MARGIN` and is lost as `corpseLost`; that is the existing rule doing its job and it is not a thing to repair.**

**(e) The corpse module's own comment is the constraint you are changing, and it must not be left standing false.** `Corpse`'s JSDoc says *"A corpse has no velocity of its own, and the scroll-speed coupling is the whole point of that. The scroll phase moves it and nothing else does, so a corpse drifts at exactly SCROLL_SPEED, and FRESHNESS_SECONDS is already derived as the time a mid-field corpse takes to reach the bottom edge at that speed."* After you, a corpse in flight is off that derivation for the length of its flight. **Rewrite it to what now holds**, stating the constraint the code cannot show: the derivation is correct for a corpse nothing threw, a thrown one is off it for its flight's length only, and the scroll composes with the throw exactly as it does for a body (R11's fourth ruling). **Amend `CONTEXT.md`'s Corpse entry in place with a dated triple** in that file's own voice. **Two more sentences say the same false thing and both are corrected in the same commit**: `spawnCorpse`'s own JSDoc and `scrollField`'s in `src/game/step.ts`, which between them promise that the scroll is the only thing that moves a corpse. **Find them by content, and grep for "velocity" and "scroll" across `src/game` before you call the sweep done.**

**ADR 0004's scroll-coupling invariant gains a stated exception and no ADR moves.** The derivation still holds: a corpse nothing threw drifts at exactly `SCROLL_SPEED`, and `FRESHNESS_SECONDS` is still the time a mid-field corpse takes to reach the bottom edge at that speed. What is new is that a thrown corpse is off it for the length of one flight, which is bounded and priced. **Say that in the progress note with the reason, and file no ADR and amend none**, on this slice's own no-ADR rule.

**(f) The one report, re-timed, and the two tests that pin today's timing are re-expressed and never deleted.** `reportShoveTravel` fires today on `damageMob`'s kill path and in `cullMobs`, which is CodeRabbit's real finding on slice H's fold commit (note section 4), and it reports **what the body had been carried so far**. **There are three exits and they do not all behave the same, and this is ruled rather than open.** **`damageMob` is the only one that hands the impulse over**, because it is the only one that spawns a corpse to carry it. **`cullMobs` keeps today's partial report exactly as it is**: a culled body leaves no corpse, so there is nothing to hand an impulse to and handing one to nothing is a leak. **And there is a third exit the first draft of this prompt missed**: `swallowFood` (`src/game/step.ts`) kills a corpse where it stands, so a corpse swallowed mid-flight would take its impulse out of the world unreported and uncleared. **That exit reports and clears the way a spent impulse does.** After you the flight finishes, so the honest report is one report when the impulse is actually spent, whoever is carrying it at the end. **`mobs.test.ts`'s *reports what a body was already carried when it is killed in flight* and *reports nothing for a body killed on the tick the shove landed on it* both state today's timing and both go red.** Retitle each to the sentence that now holds and say in the note what each now promises, the way slice J-fix handled the three clear-the-reach assertions. **Deleting either is a stop.** `mobShoved` carries a mob id, so if a corpse is what finishes the flight, decide once and say where: either the event keeps the id of the body the shove landed on, which is what the reading has always meant, or it is renamed, and **renaming an event is a comparison-semantics change that rides in the same `READINGS_VERSION` move rather than a second one**.

**(g) The witness fold, in its own commit.** Every field your shape adds that a replay must rebuild is folded, declared in `WITNESS_VERSION`'s JSDoc as a dated paragraph naming each field and why it is not excluded, and stamped in the same commit. **`witness.test.ts`'s `EXCLUDED` list is the precedent for anything that is pure provenance** (`impulse.source` is excluded and slice I's decline of CodeRabbit's contrary finding is the worked reasoning, note section 9). The cost paragraph says plainly that every tape recorded before this commit is refused at the decode and that it is the fifth such baseline death.

**(h) The press's record.** `Belched` gains a per-body record beside its two counts. **Carry each body's identity, its distance from the grave in field units, whether the press moved it, and the reason when it did not**, because Mark's sighting is about bodies *at about the same distance* and a record with no distance in it cannot answer the thing he saw. The reasons are the gates as the code actually runs them, in `shoveNearbyTargets` and in `shoveStormTarget`: **not entered, out of reach, no direction to be thrown along, not pushable.** **There is no already-dead reason and you do not invent one**: `stormTargets` skips a dead slot before the belch ever sees it, so a dead body is never in the frame at all, and the phenomenon the handoff calls "already dead" is the mid-flight death this slice's first half fixes. Say that in the note. `shoved` keeps its exact meaning, the count of bodies the press moved, and a test pins that the record's pushed count is that same number. **A press can put up to `MOB_CAP + 2` entries in one event, which is what `SLOTS` in `stormTargets.ts` is actually sized to, the mob pool plus the boss plus the set piece's source; no sim event is ever encoded into a tape, so this costs no tape bytes and `FORMAT_VERSION` does not move, and the tape carries it by construction because a replay rebuilds every event from the seed and the commands.**

**(i) The readings, and one stale sentence that is now yours.** The belch's record is declared as a reading in `batchReport.ts` and `compareRuns.ts` the way slice I declared the belch arm, reduced to something a batch can print: the share of bodies in the frame a press moved, and the misses by reason. **`READINGS_VERSION` moves 5 to 6 with version 6's own note naming all three things that changed meaning**, the belch's shove distance now covering a whole flight, **the bell's `totalDistance` and per-toll `distance` doing the same because `sweepToll` pushes before it damages**, and the press's record gaining the misses. **The readings declaration and the batch comparison name the bell beside the belch**, and your batch reads against note **section 10** for the toll arm as well as section 12 for the belch arm. And **`repel.ts`'s stale "push only exists at bell levels 4 and 5", in its JSDoc and again in `__tests__/repel.test.ts`, is corrected here**, because the handoff assigns it to the next slice that touches the readings.

**(j) `killableOutright` has no reader, and you file it rather than remove it.** `StormTarget.killableOutright` is set on all three fill paths and read by nothing in production; only `stormTargets.test.ts` asserts it, and its JSDoc still describes the belch's old kill burst, which Mark's ruling 3 of 2026-09-15 retired. **It is a finding for the note and it is not touched in this slice**, because a dead field is not what this slice is for and removing one inside a version move makes the diff harder to read, not easier. Say in the note that it has no production reader and that its JSDoc is stale.

**(k) `GOLDEN`, re-pinned once and proved to have one cause.** Run `digest.test.ts`. **If it is green, stop and report**, because a fold that widened over a pool the scenario holds live members of should have moved it, and a green digest means your shape did not widen one, which is worth saying before anything else. **If it is red, do the isolation run first**, per the fifth ruling: the scenario with the new field held at its resting value under the old fold, showing `-145039082` whole. Only then pin the new checksum, with the dated paragraph, the section 3 entry and both runs in the note.

**(l) The measurements this slice owes.**

- **`local/jfix-equal-distance.ts` re-run at your tip**, against the before you took in (b). **The pass line is named here rather than found afterwards: all twelve bodies travel the same distance, and the ones that die say so and travel it anyway.** Print the deaths and their flight ticks beside the distances.
- **A body's net travel, killed at flight tick 18 and at flight tick 66, up the field and down it**, against the row's nominal and against J-fix's own measured 123 up and 237 down. **The scroll still composes with the shove** and a corpse in flight rides it too, so say which of the two moved it.
- **The freshness a thrown corpse spends, measured.** How much of a corpse's ten seconds a throw up the field costs it, and what share of thrown corpses end unswallowed that would have been swallowed before. Against the research's own price of a second per 38 units. **If it reads as a real cost to the hand, that is a finding for the note and a tuning-step input, never a row you move.**
- **A rung-three toll, measured, because the bell changes as much as the belch and only the trigger was a belch sighting.** A conditioned tape at `bell=3` and one at `bell=5`: the share of cone-killed bodies whose corpses are thrown rather than left where the cone caught them, per rung, the freshness those corpses spend, and the toll arm's `totalDistance` against note section 10's own 33 tolls, 116 shoves and 1277.82 units. **A rung where the share is near one is the bell throwing most of its own food away, and that is a finding for the note**, never a row you move.
- **A batch at your tip** under `steady-far` and `loose-far` on slice I's seeds, **900 to 905 under each hand**, with the belch arm, the toll arm and the new press record printed beside `belchCadence`. **Compare the belch distances against note section 12's table and the toll distances against note section 10's, and say plainly that neither is subtractable any more**, which is what the version move declares on both arms. **All three refusal counters printed, `damage.belch` and `fatalBlows.belch` at zero on all twelve, `belchWorthIt` printed and left alone.**
- **Replay determinism at your tip with a corpse in flight at a checkpoint.** A push spans ninety ticks against a sixty-tick checkpoint grid, so a flight always crosses one by arithmetic, which is slice J's own finding. Two plays of one seed under `shaky-short`, and a seed with a belch in it played twice under `steady-far`.
- **A pre-fold tape refused by its witness version rather than diverging**, once, off your own fold commit. Slice H's own verification and the version move's whole point.
- **A hand-recorded tape at your tip**, against the built app through `vite preview`, driven with `playwright-cli`, measured to `outcome: 'verified'`, with all three `state.refusals` counters printed. **A blind driver cannot fill the reservoir and a hand tape will not carry a belch**; that is measured and written down twice already (note sections 11 and 12), so do not spend runs chasing one. Take the belch's own behaviour off recorded tapes, and say which route you used.
- **A rendered check, and read the screenshots.** A press with a high enough storm to kill bodies in flight, replayed, with the corpses visibly ending out where the flight was going rather than in a ring where the storm caught them. **And a toll at rung three in the same session, with one question answered in words: can you tell a flying corpse from a flying body?** ADR 0014 makes silhouette the first discriminator and a corpse is deliberately smaller than the smallest body, so the answer should be yes; **if it is not, that is a readability finding for the note and not a thing you fix here.** **Play a run, end it, and play another.** Read note sections 11 and 12 for what the earlier rendered checks could and could not catch before you spend the time, including the driver's 74 to 120 ticks between consecutive frames, and **say plainly what you could and could not see**.

**(m) CodeRabbit CLI, one iteration, then the code commits.** The fold commit first, something in the shape of `feat(hungry-grave): a shove outlives the body carrying it and the witness folds it (#124)`, then the rest, something in the shape of `feat(hungry-grave): a body killed in flight finishes its shove and the press records what it missed (#124)`.

**(n) The progress note**, section **15**. Beyond the contract's list, say: the shape you chose and what you set it against; the before and after off the equal-distance script with the deaths named; the re-timed report and the two retitled tests with their new sentences; the freshness cost measured; the corpse comment and the `CONTEXT.md` entry rewritten; the press record's fields and its four reasons, with the absent already-dead reason and why; the three exits and why only the kill exit hands over; the bell's own half, `sweepToll` pushing before it damages, with the rung-three and rung-five toll measurement and the flying-corpse readability answer; ADR 0004's coupling invariant gaining a stated exception for a flight's length, with the reason and with no ADR moved; `killableOutright` filed as a finding with its stale JSDoc named and nothing removed; the repel stale sentence corrected; `WITNESS_VERSION` 9 and `READINGS_VERSION` 6 with what each move costs; `GOLDEN` re-pinned with the isolation run's two digests printed side by side and the dated paragraph's location; and `FORMAT_VERSION` 4 named as held.

**(o) Stop and report.** Under 300 words. **Do not start slice L.**

### What must not move, and a move is a stop

- **`FORMAT_VERSION` 4.** Nothing new is recorded in a tape header and no sim event is ever encoded into a tape.
- **`GOLDEN` moves exactly once and only for the corpse fold.** The re-pin is granted in ruling R9's own closing paragraph of 2026-09-16 in the record's section 2, section 5 points at it, and the fifth ruling above says what you prove before you take it. **A second move, or a first with any cause other than the fold, is a stop and report.**
- **The fences**, all six by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty, plus *src/game/belch.ts reaches what it can hit through the seam* and *a policy names no weapon line*.
- **The shove's arithmetic.** `SHOVE_TICKS` 30, the linear decay, `firstStepOf`, the wave structure and `travelled` accumulating the shove's own step and never the scroll. Slices H and H2's, and R2 as superseded.
- **`BELCH_SHOVES`, `BELCH_SHOVE_THROW`, `BELCH_SHOVE_SPACING` and `BELCH_BURST_RADIUS`.** Mark's pick of option 2 and ruling R11. A measurement arguing any of them should move is a finding for the note.
- **The reach's hard edge.** The sixth ruling. No falloff, no softening, no second circle, and nothing drawn changes.
- **The eruption and everything the renderer draws.** `eruptionFrontsAt`, `ERUPTION_REACH`, `ERUPTION_TICKS`, `ERUPTION_STROKE`, the drift and the anchors are slice J-fix's, and R12's curve and body are demoted to tuning-step inputs and are not yours.
- **The bell, in every part.** Its two reaches, its `toll.struck`, and its call into `shoveStormTarget`. A shove outliving its body reaches the bell too, which is R8's one shove module working as intended and is not a second thing to build; **its arithmetic still does not move.**
- **`scrollField` and the phase order in `src/game/step.ts`.** The scroll composes with every shove for both lines, ruled in R11's closing paragraph.
- **The gas**, in every part, and **the belch's no-damage rule**. A measurement showing the belch is weak is never a reason to give it damage back.
- **`moveStormTarget` and `pushable`.** A raw position write from anywhere is a stop, and a boss and a set piece's source are still never moved.
- **`FRESHNESS_SECONDS`, the decay curve, the payout floor and `CORPSE_CAP`.** A thrown corpse spends freshness at the rate every corpse spends it. **Retuning freshness because a thrown corpse costs some is a finding, not a fix.**
- **Every cap, every fault identity, `STREAM_SALTS` and `STREAM_ORDER`.** The fault list is closed and append-only (ADR 0024).
- **The harness's own rows**, `belchWorthIt` above all.
- **`DamageSource`'s `'belch'` arm with no producer**, which slice J kept deliberately so no pre-amendment batch loses a key by name.
- **You file no ADR and amend none.** ADR 0008 already rules what a belch does and ADR 0019 already rules that folded state gets a version; **applying a rule is not amending it.** `CONTEXT.md` and a module JSDoc are not ADRs.

### Seams under test

`src/game/shove.ts`: the impulse surviving the body that carried it, and the one report made when it is actually spent. `src/game/mobs.ts`: `damageMob` handing a live shove across to the corpse it spawns, and `cullMobs` **not** doing so, because a culled body leaves nothing to carry it and keeps today's partial report. `src/game/step.ts`: `swallowFood` reporting and clearing an impulse it ends, and `advanceMobs` advancing both carriers from one loop. `src/game/corpses.ts`: a corpse that travels for exactly as long as something is carrying it and drifts at the scroll alone afterwards, bounded the way a body is. `src/game/belch.ts`: `fireBelch`'s record of every body in the frame with its distance, its outcome and its reason. `src/game/witness.ts`: the fold over whatever now carries a shove.

### Module boundaries

**Nothing is created, deleted, merged or split.** `corpses.ts` may gain an import of `shove.ts`, which closes no cycle because `corpses.ts` already imports `mobs.ts` and `mobs.ts` already imports `shove.ts`; **run the cycle guard and confirm that for yourself rather than taking this paragraph's word**, on note section 5's own history. The field-plus-margin bound moves to where both readers see it and is written once. `shove.ts` keeps importing nothing but the math helpers and the types. `stormTargets.ts` stays the one seam, `src/game` reaches nothing outward, and `src/dev` reads events and never writes the run. No new library enters and nothing under `src/app` is in this slice at all.

### The planned test list

1. *A body killed while a shove is carrying it still finishes the shove it was given.* **Write it first, red first**, expressed against the row.
2. *Twelve bodies at one distance all travel the same distance, whether they live or die.* Mark's own sighting, turned into a test.
3. *A body killed on the tick a shove landed on it is still carried the shove's whole length.* The boundary case, and slice H's second CodeRabbit test re-expressed.
4. *A shove reports its travel once, when the impulse is spent, whoever was carrying it at the end.* Slice H's first CodeRabbit test re-expressed.
5. *A corpse nothing is carrying drifts at the scroll alone.* The half that did not change, asserted so it cannot drift out.
6. *A corpse a shove is carrying rides the field's own drift as well.* R11's fourth ruling, held for the new carrier.
7. *A shove never carries a corpse outside the field plus the spawn margin, and one carried past the bottom edge is lost the way any corpse is.*
8. *A corpse thrown up the field has further left to drift than one that was not thrown.* **The cost is the drift left to the grave or to the bottom edge and never the freshness at the flight's last tick**, where a thrown corpse and an unthrown one are equally fresh, because freshness drains on the clock and not on the distance.
9. *The press records every body in the frame, moved or not.*
10. *A body that has not entered, one outside the reach, one with no direction to be thrown along and one that may not be pushed are each recorded with their own reason.*
11. *The press's moved count is the same number `shoved` has always been.*
12. *A boss and a set piece's source are recorded and are still never moved by a belch.*
13. *Every corpse spawn path hands out a cleared impulse.* Corpse, feast and power-up, so a slot a flying corpse died in never carries a new one away on a push that never reached it, which is `spawnMob`'s own precedent.
14. *A corpse swallowed while a shove is carrying it reports what it was carried and stops carrying it.* The third exit, `swallowFood`.
15. *A body culled off the field while a shove is carrying it still reports what it was carried and hands nothing on.* The cull exit, held exactly as it is, because a culled body leaves no corpse.
16. *A body the bell's cone kills on arrival is carried the whole of the toll's push.* The bell's half of this slice, which `sweepToll`'s push-then-damage order gives for free and which nothing asserts today.
17. *A replay with a shove in flight on a corpse at a checkpoint rebuilds identically.*
18. *A tape recorded before the witness moved is refused by its version rather than diverging at a checkpoint.*
19. *A belch still takes no health off anything, boss included, and still strikes each body once.* Held.
20. **The six fences**, green, each by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
21. **The golden digest**, re-pinned at the corpse fold and proved by the isolation run to have no other cause.

**What this slice is expected to turn red.** `mobs.test.ts` and `shove.test.ts` throughout, `corpses.test.ts`, `witness.test.ts`, `digest.test.ts` if the fold widens over corpses, `belch.test.ts` and `stormTargets.test.ts` over the record, `repel.test.ts` and `belchCadence.test.ts` wherever a distance or a count is asserted, `measure.test.ts`'s rich fixture, and `harnessPolicy.test.ts`'s measured per-seed baselines, which are **re-measured with the reason beside each and never re-pinned blind**. **A realistic count is 20 to 30 files**, against slice H's 18 and slice I's 21, both of which were version moves like yours. A diff much smaller than that is a reason to check what you have not reached.

### Verification steps, with actors

1. **Agent.** The before and after off `local/jfix-equal-distance.ts`, read against the pass line: all twelve travel the same distance and the deaths are named.
2. **Agent.** A body's net travel killed early and killed late, up the field and down it, against the row's nominal and against J-fix's 123 and 237.
3. **Agent.** The freshness a thrown corpse spends, against the research's price of a second per 38 units.
4. **Agent.** `WITNESS_VERSION` 9 and `READINGS_VERSION` 6 each stated with what the move costs, and `FORMAT_VERSION` 4 held.
5. **Agent.** The isolation run: the canonical scenario with the new corpse field at its resting value under the old fold returning `-145039082` whole, then the new pin beside it.
6. **Agent.** A pre-fold tape refused by its version rather than diverging.
7. **Agent.** Replay determinism with a corpse in flight at a checkpoint, on two seeds.
8. **Agent.** A hand tape verified with the three refusal counters, and the route you used to measure a belch said plainly.
9. **Agent.** A batch at this tip on slice I's seeds, with the belch arm and the new record printed, and the incomparability stated.
10. **Agent.** A rendered check across two runs with the screenshots read, covering a press and a rung-three toll, and saying in words whether a flying corpse is tellable from a flying body.
11. **Human (Mark), and none of these blocks you.** Whether the crowd now all goes, which is his own sighting answered, and whether the hard edge was part of what he saw. **The deploy that puts it in front of him is the orchestrator's, straight after your report.**

### State of the branch

- The tip should be the docs commit carrying this prompt. **`WITNESS_VERSION` 8, `READINGS_VERSION` 5, `FORMAT_VERSION` 4, `GOLDEN` at `-145039082` as slice H last pinned it.**
- **Round two took one re-pin in slice H and forfeit slice J's.** Yours is granted beyond that budget, for the corpse fold alone, in R9's closing paragraph of 2026-09-16. Slice L is permitted none.
- Read round two progress note sections 8 through 13 for the test counts and the test-name lists. Slice K left `pnpm verify` at 146 test files with 2075 passed, 21 expected fail and 2 todo, and the test-name baseline at 2096 names; confirm both off the tree rather than off this line.
- The headless browser runs at 3 to 21 FPS under SwiftShader and puts consecutive screenshots 74 to 120 ticks apart. That is the harness and not the build.

### The stuck rule

**Four things are already known to be a stop:** any of the named inputs missing; a `FORMAT_VERSION` move; a `GOLDEN` diff with any cause other than the corpse fold, or a green digest where the fold should have moved it; and a fence, a cap or a fault identity moving. **And four things are ruled rather than open:** the lever is taken and the witness moves to 9, so a finding that the cost is too high is written down and built past; the reach's hard edge is not softened in this slice; the shove's own arithmetic and the belch's three rows are Mark's and do not move; and the belch does no damage of any kind. **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **The Wall**, in every part. Slice L's, and `waves.ts` and the mob table are opened only to read.
- **The meter and its corner**, slice K's, and nothing under `src/app` is in this slice.
- **R12's curve and body**, which Mark demoted to tuning-step inputs on 2026-09-16 with *"I want a V1. Please help me get there."* The eruption's speed is closed at R3's own floor and nothing is built for it.
- **A field-wide tell for the gas**, and **a visible edge for the bell's damage step**. Both are filed tuning-step inputs and neither is yours.
- **Retuning freshness, the corpse cap or the decay curve** because a thrown corpse costs freshness. That is a measurement and a finding.
- **The resisted push on the Waking's source and the boss's per-toll tell.** Tickets **#131 and #132**, outside round two and Mark's to schedule.
- **The harness's rows, a new named configuration for a tape that can carry a belch, and the orchestrator's batch.**
- **Removing `StormTarget.killableOutright`.** It has no production reader and its JSDoc is stale, and both facts are filed in the note as a finding rather than fixed here.
- **The record's section 7 findings and the handoff's filed findings**, none of which any slice acts on.

---

## Slice L: the Wall is a wall (#123)

Model: Opus, subagent type general-purpose. One coder, one code commit, one docs commit. Messages end in `(#123)`.

Round two slice L of The Hungry Grave (ticket #123): the curtain gets a body the storm cannot thin, and a belch is what opens it.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice L.

**All six slices before you land first.** **Verify each of these by name and any one missing is a stop and report:** `shove.ts` with its impulse and its wave structure; `belch.ts` shoving in three waves, doing no damage, and reaching about half the field per slice J-fix, **which is the reach your curtain measurement is taken against**; `mobShoved` carrying its source and the reading's belch arm populated; and **`docs/adr/0042-a-set-piece-names-the-property-it-must-keep.md` carrying its 2026-09-15 triple**, because the property you are about to assert is the one that ADR now words. Read round two progress note sections 8 through 12.

**Five rulings shape this slice and none of them is yours to revisit.**

**First: the curtain's body is a new durable mob row in the pool, high health, no fire.** The record's ruling R5. The shambler cannot do it: at 8 health the storm opens a lane at one skull and the bodies fire nothing, so the crossing costs nothing, and that is measured rather than argued (`step-4-progress.md` section 4 item 7). **A type in the pool is not a cast pinned by the set piece**, so ADR 0042's own rule stands untouched: the Wall's wave names a type the way every wave names one.

**Second: the gap is geometry and there is no special case anywhere.** The record's ruling R4. The shove is the same shove and a hole opens because bodies moved. **No rule is keyed on which set piece is on the field**, which is the fixed-membership club ADRs 0016 and 0042 exist to dismantle. Killing only the wall bodies and parting the wall on any belch regardless of reach are both refused.

**Third: cannot pass means blocked by cost and never by an impassable body.** The grave swallows and passes under, nothing in this game blocks, and a body the grave cannot cross would be new physics against the grave's own verb. **You do not build a collision rule, a barrier, or a body that refuses to be passed.**

**Fourth: you measure whether the dead-ahead body leaves a dent or a hole, before you tune anything.** A body directly above the grave gets no lateral component from a radial shove at all, so the curtain may bow away up-field rather than part. **If it is a dent, the lever is the wave count and the spacing in slice J's row, and nothing else.** A second wave landing on a body that has already moved off the axis has a lateral component the first did not. **If no lane opens at any authored setting of the count and the spacing, that is the stop Mark pre-ruled: the Wall is cut, and you report it rather than deciding it.**

**Fifth: `GOLDEN` does not move and you are permitted none.** Round two's two re-pins belong to slices H and J. The Wall is a Crowd wave and the canonical scenario is six hundred ticks of the Procession, so nothing you author reaches inside that window. **A move is a stop and report**, and the reason matters far more than the number.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/round-two-wall-belch.md`: **rulings R4 and R5 in full are this slice's contract**, section 0's arithmetic of the curtain's spacing against the grave's width is the thing you re-derive rather than trust, and section 6's Wall sentences are your tests.
4. `apps/hungry-grave/docs/research/push-feel-precedent.md` **section 2 in full**. The Flower Wall blocks by durability and cost rather than by a rule and the wiki's own advice is to break through rather than stay trapped; the Coffin ring is cleared by ordinary damage; Risk of Rain 2's dome is explicitly leaveable. **None of the three is an unescapable lock, and that finding is what the third ruling stands on.**
5. `apps/hungry-grave/docs/adr/0042-a-set-piece-names-the-property-it-must-keep.md` as amended, **which is the property you assert**; `0016-mob-types-and-formations-are-pools.md`, which is why a new type is a pool member and never a cast; `0059-a-trash-minute-is-a-mow-and-density-is-bought-with-weak-bodies.md`, which is why the mow body is one touch and why the curtain cannot be made of it; `0006-authored-waves-not-a-director.md` and `0047-directed-density-inside-authored-beats.md`, because the Wall's wave is the one cell the director may not spend in; `0003-size-is-health.md` for the grave's width at the floor.
6. `apps/hungry-grave/docs/push/step-4-progress.md` **section 4 item 7**, which is the measured failure this slice exists to answer, and **section 2** for the `GOLDEN` history.
7. `apps/hungry-grave/CONTEXT.md`, the **Mob type** entry above all, which binds what a new type must own and says a mob type must be readable before it acts, plus Wave, Formation, Set piece and Mow. **Read the Avoid lists before naming anything.**
8. The tree: `src/game/mobs.ts`'s `MOB_TYPES`, `MobType`, `MOB_TYPE_NAMES` and the shambler row's own comment about the curtain; `src/game/stage/waves.ts`'s `CROWD_WAVES` and the Wall's wave with the comment above it; `src/game/stage/formations.ts`'s `wall`; `src/game/caps.ts`, to read; `src/app/screens/game/mobSprite.ts`, which is where a type's silhouette is drawn; `src/dev/bot.ts`'s policies, to read and never to touch; `src/__tests__/boundary.test.ts`'s cap-derivation fence.

### The definition, in observable terms

After this slice: the curtain that arrives two seconds after the Banshee dies is built from a body the rung-one storm does not delete on contact, so it is still a curtain when the grave reaches it. A grave crossing it without a belch loses health. A belch spent on it opens a gap at least as wide as the grave, because the bodies moved and for no other reason. Nothing anywhere is keyed on the Wall being the Wall.

The new type is a member of the mob pool like the other three: it owns how it moves, whether it fires, its health, its corpse payout and its size, and it is readable before it acts. Any wave may name it.

`WITNESS_VERSION` 8, `READINGS_VERSION` 5, `FORMAT_VERSION` 4 and `GOLDEN` are all untouched.

What a player meets: the curtain comes down, they try to get through, they find they cannot, they spend the belch and they go through the hole it makes. That is ticket #123's "a crossing reads as a cost in play".

### The work, in this order

**(a) Verify the four inputs**, per the stop above, then `git log --oneline -25`, `git status --short`, and your own test-name baseline into `local/round2/` under a name carrying the letter L.

**(b) Measure before you author, and this is the slice's first real act.** Stand the curtain as it is today and belch at it, in a test or a script, and **measure whether the dead-ahead body leaves a dent or a hole**. Print the geometry: the lateral separation each neighbour pair reaches, the widest gap, and where along the width it sits. **That measurement is what the fourth ruling turns on and everything after it depends on the answer.**

**(c) The tests first, red**, from the planned list. **Write the gap test and the no-special-case test first.**

**(d) The new mob row, and its name is research rather than a pick.** `CONTEXT.md`'s Mob type entry binds what it owns. **Research the name before you choose it**: it comes from the glossary's own register and from the silhouette the sprite module will draw, and the four shapes already taken are the shambler's squat body, the revenant's diamond, the ghoul's wedge and the boss forms. **Say in the note what you chose, what you set it against, and which Avoid list you checked it against.** It is not Mark's to pick and it is not a question for him.

- **High health, so the rung-one storm does not delete it on contact.** The figure is derived rather than felt: it is what survives long enough for the curtain to still be a curtain when the grave reaches it, against the storm's own measured throughput, and **the derivation goes in the row's JSDoc citing the design record**. **No ADR gains it.**
- **No fire**, per ruling R5. The cost of the crossing is the bodies themselves.
- **Its corpse payout and tier are a real decision, not a copy.** A durable body that dies to a belch's shove does not die at all, so what it pays when the storm finally kills one matters. **Author it, say what you set it against.**
- **Its width is what the curtain's count is derived from**, per the next item.

**(e) The Wall's wave, and the count is derived rather than kept.** `waves.ts`'s comment says twenty-two is not a density row: it is the field's width over a body's, and `wall()` spaces its bodies at the width divided by the count. **A new body of a different width therefore changes the count**, and the comment has to say so in the new body's terms. **The Wall's wave stays undirected**, which the comment above `CROWD_WAVES` already says and ADR 0047 requires.

**(f) The shambler row's own comment goes stale and you fix it.** It says an edge-to-edge curtain at 22 units wide needs 22 mobs to fill the field's 540 and that the size floor makes the grave 18 units wide, so the curtain has no gap the grave can slip through at any size. **That is the curtain's arithmetic living on the wrong row once the curtain is not shamblers.** Move the reasoning to where it now belongs and leave the shambler's row saying only what is the shambler's.

**(g) The caps, and you check rather than change.** `caps.ts` derives from the stage's tables and `boundary.test.ts` holds it to reading tables and never the stage. A curtain of a different count moves what the tables say. **Confirm the derivation still stands and report the figures. A cap that binds is a finding and never a number you raise.**

**(h) The property asserted the way ADR 0042 now words it.** Two bot policies carry it, one crossing without belching and paying a real cost, one belching and crossing clean, **and the unloaded policy is written as a plausible human rather than an optimizer**, because a bot proof is an upper bound on perfect play and never a fairness result. **The harness's own rows are not yours to tune**: if the existing policies cannot express the crossing, that is a finding for the note naming what is missing, not a row you move.

**(i) The measurements this slice owes.**

- **The dent-or-hole measurement from item (b), before and after**, with the geometry printed both times.
- **If it is a dent: the wave count and spacing swept**, and the widest gap at each setting printed. **The sweep is a measurement and the row stays where slice J put it unless a setting is chosen**, in which case you say which and why.
- **If no lane opens at any setting: stop and report it as Mark's pre-ruled cut.** Print every setting you tried and what each gave. **Do not decide the cut and do not remove the Wall.**
- **A rendered check, and this slice plainly owes one.** The curtain met, the belch spent, the hole gone through, in the built app. Screenshots read rather than collected. **Play a run, end it, and play another.**
- **A batch at your tip** under `steady-far` and `loose-far`, with the belch arm and the arrivals printed, plus whatever the bot policies say about the two crossings.
- **Replay determinism at your tip.**

**(j) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the curtain stands against the storm and a belch is what opens it (#123)`.

**(k) The progress note**, section **14**. Beyond the contract's list, say: the dent-or-hole measurement with its geometry, before and after; the new type's name, what you set it against and its Avoid check; its health's derivation; its payout and tier and what you set them against; the Wall's count re-derived and the shambler comment moved; the caps confirmed with their figures; the two bot policies and what they showed; and **`GOLDEN` and all three version constants named as held**.

**(l) Stop and report.** Under 300 words, and **if the lane does not open, that is the whole report**: every setting tried, what each gave, and the cut named as Mark's to take. **Do not start anything after this slice; the gates, the review, the batch and the deploy are the orchestrator's.**

### What must not move, and a move is a stop

- **The fences**, all six by title, and **slice D's cap-derivation fence in particular**: the derivation reads tables and never the stage.
- **`WITNESS_VERSION` 8, `READINGS_VERSION` 5, `FORMAT_VERSION` 4 and `GOLDEN`.** None moves. You declare no folded field: **`mob.type` is not folded, because a divergence in type shows through the health and the motion the walk already folds** (`step-4-progress.md` section 17).
- **No rule keyed on the set piece.** ADR 0042's whole point, and the second ruling.
- **No collision rule, no barrier, no impassable body.** The third ruling.
- **The shove, the belch and the reading.** Slices H, I and J's, read and never re-authored. **If the belch cannot open the curtain, that is the fourth ruling's measurement and a report, never a change to `belch.ts`'s reach or a point of damage given back.**
- **The harness's own rows**, every lapse rate and look-ahead list included.
- **Every existing mob row.** The shambler's, the revenant's and the ghoul's figures are untouched; what moves is one comment that was never the shambler's to hold.
- **`STREAM_SALTS`, `STREAM_ORDER` and every fault identity wire number.**
- **No ADR is filed or amended, and no ADR gains a combat magnitude.** ADR 0042 already landed and applying a rule is not amending it.

### Seams under test

`src/game/mobs.ts`: the new `MOB_TYPES` row, `MobType`, `MOB_TYPE_NAMES`, and the shambler row's comment relieved of the curtain's arithmetic. `src/game/stage/waves.ts`: the Wall's wave naming the new type with its count re-derived, still undirected. `src/game/stage/formations.ts`: `wall`, unchanged, confirmed. `src/game/caps.ts`: the derivation confirmed rather than changed. `src/app/screens/game/mobSprite.ts`: the new type's silhouette. `src/dev/bot.ts`: the two policies that carry ADR 0042's property.

### Module boundaries

**Nothing is created, deleted, merged or split, and no import direction changes.** The new type is a row in the table `mobs.ts` already owns, which is why a set piece can name it without anything being keyed on the set piece. **`caps.ts` still imports `waves.ts` and never `stage.ts`**, and **`waves.ts` still value-imports nothing**. **`src/game` still imports nothing from `src/dev`**, so the bot's policies read the game and the game knows nothing of them.

### The planned test list

1. *A belch landing on the curtain opens a gap at least as wide as the grave.*
2. *The gap opens because bodies moved, and no rule anywhere reads which set piece is on the field.* The no-special-case half, asserted structurally.
3. *The grave crossing the curtain without a belch loses health.*
4. *The curtain's body survives a rung-one storm long enough to still be a curtain when the grave reaches it.* The measured failure of the shambler, turned into the new body's promise.
5. *The curtain's body fires nothing.*
6. *A wave other than the Wall's may name the curtain's body.* The pool rule, asserted so the type never becomes a cast.
7. *The curtain spans the field edge to edge at its derived count, with no gap the grave can slip through at any size.* The arithmetic moved off the shambler's row and asserted rather than commented.
8. *The Wall's wave is undirected and the director never spends in it.* Held, per ADR 0047.
9. **The cap derivation**, confirmed green with its figures printed.
10. **The two bot policies**, one crossing unloaded at a real cost, one belching and crossing clean.
11. **The six fences**, green, each by title.
12. **The golden digest**, unmoved, confirmed rather than assumed.

**What this slice is expected to turn red.** `mobs.test.ts` over the table and over the guard that a body carries exactly its `MOB_TYPES` row, `waves.test.ts` and `stage.test.ts` over the Crowd's table, `formations.test.ts`, `caps.test.ts`, `mobSprite.test.ts`, `foodSprite.test.ts`'s per-type loop, `sound.test.ts` wherever a mob type is named, and `bot.test.ts`. **A realistic count is 12 to 30 files.**

### Verification steps, with actors

1. **Agent.** The dent-or-hole measurement, printed with its geometry, before any tuning.
2. **Agent.** If a dent, the wave-count and spacing sweep with the widest gap at each setting.
3. **Agent.** The gap at least as wide as the grave, asserted at the grave's start size and at its floor.
4. **Agent.** The unloaded crossing costing health, measured rather than asserted from the table.
5. **Agent.** The cap derivation confirmed with its figures.
6. **Agent.** A rendered check of the curtain met, the belch spent and the hole crossed, across two runs, screenshots read.
7. **Agent.** A batch at this tip under both configurations.
8. **Agent.** `GOLDEN` and all three version constants held, each stated.
9. **Human (Mark), and none of these blocks you.** Whether the curtain reads as a wall rather than as more stuff in a line, which is his own 2026-09-14 words and ticket #123's done line. **And, if the lane did not open, whether the Wall is cut, which is his pre-ruling and his call.**

### State of the branch

- The tip should be slice K's docs commit. **`WITNESS_VERSION` 8, `FORMAT_VERSION` 4, `READINGS_VERSION` 5, `GOLDEN` as slice H or slice J last pinned it.**
- **Round two's two `GOLDEN` re-pins are spent or accounted for and you are permitted none.**
- The caps as slice D left them: `MOB_CAP` 481, `MOB_FIRE_CAP` 434, `CORPSE_CAP` 704, `WISP_CAP` 64 and `SKULL_CAP` 120. **`WISP_CAP` stopped binding once slice E's volley clock landed.**
- **One fact worth not re-deriving:** nothing in a run draws from the `mobFire` stream at all, because the Banshee's nudge moved to its own stream and every `firstShotJitter` is zero. A new type with no fire does not change that; a new type with fire would, and this one has none.

### The stuck rule

**Four things are already known to be a stop:** any of the four inputs missing; a `GOLDEN` or version move; no lane opening at any authored setting, which is Mark's pre-ruled cut and which you report rather than take; and the existing bot policies being unable to express the two crossings. **And two things are ruled rather than open:** the body is a pool member and never a cast, and nothing blocks.

**Green tests plus a curtain that still opens to the storm means the test plan has a hole**: pin it as a red test first, never patch the health first.

### What is not your job

- **Cutting the Wall.** You report that the lane does not open; Mark takes the cut.
- **Slices H, I, J and K's work**, in every part.
- **Territory's rungs**, #125, and the offer bubble, #122. Neither is round two's.
- **The gates, the review on the tip, the orchestrator's batch and the deploy.**
- **The record's section 7 findings**, which no slice acts on.
