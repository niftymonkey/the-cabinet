# Round two progress note: the push, the belch, the meter and the Wall (tickets #126, #124, #127, #123)

The record is `apps/hungry-grave/docs/design/round-two-wall-belch.md` and the prompts are `round-two-slice-prompts.md`. The coder contract is still `step-4-coder-contract.md`, with the three overrides at the top of the prompts file. One section per slice at the end, and the cross-slice facts first. Written by each slice's coder, appended to and never rewritten.

**Step 4's own note is `step-4-progress.md` and it is read and never appended to.** This round's slices carry their own tickets rather than `#39`.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| The ADR commit, both amendments | | |
| R-fix, three tech gate findings | `eddb32c4cb` | refactor(hungry-grave): the ceiling refuses a figure it cannot honour and the codec stops reaching for the director (#126) |
| H, the witness fold | `2e90597cad` | feat(hungry-grave): a body carries the shove that landed on it and the witness folds it (#126) |
| H, the shove | `ed369353e2` | feat(hungry-grave): a toll starts a shove the body travels under, and the bell is its only caller (#126) |
| I, the shove is measurable | | |
| J, the belch becomes a pushback | | |
| K, the meter fills and changes corner | | |
| L, the Wall is a wall | | |

Slice H carries two code commits, the fold and the rewiring, which is this round's one authorized departure from the contract's one-code-commit rule.

## 2. The version ledger

Where each constant stood when round two opened, where it is permitted to go, and where it actually went. **A move anywhere the plan does not name is a stop and report, never a re-pin and never a bump taken on the spot.**

| Constant | At slice G's tip | Permitted move | Owner | Landed |
| --- | --- | --- | --- | --- |
| `WITNESS_VERSION` (`src/game/witness.ts`) | 7 | 7 to 8, exactly once | Slice H, in its own commit | **8**, in `2e90597cad` and nowhere else |
| `READINGS_VERSION` (`src/dev/readingsVersion.ts`) | 4 | 4 to 5, exactly once | Slice I | 4 after slice H, stated and unmoved |
| `FORMAT_VERSION` (`src/tape/wireCodes.ts`) | 4 | none | nobody | 4 after slice H, stated and unmoved |
| `GOLDEN` (`src/dev/digest.ts`), checksum `-489751710` | pinned | two re-pins | Slice H and slice J | re-pinned once in `2e90597cad`, checksum `-145039082` |

**Round two's `GOLDEN` budget is two and it is its own.** Step 4's five slots were spent in slices A, C, E and F with one forfeit, and its spare is not this round's to take. **Slices R-fix, I, K and L are permitted none.**

**What the two version moves cost, stated rather than discovered.** `WITNESS_VERSION` 8 refuses every tape recorded before slice H's fold commit, which is the fourth time this step has made saved tapes a dead baseline, after the waves, the witness and the tape format. `READINGS_VERSION` 5 makes every step 4 batch incomparable with every post-belch batch, because the repel reading splits by source rather than being widened. Both are taken eyes open on the design record's rulings R1 and R9.

## 3. GOLDEN moves

One entry per slice that was permitted one, whether or not it moved, with the dated paragraph's location and every field that moved beside every field that held.

**Slice H: re-pinned, the first of round two's two.** The checksum moved from `-489751710` to `-145039082` and **it is the only field that moved**. Every other field held exactly: tick 600, seed 20260820, `graveX` 365.625, `graveY` 318.875, `size` 24.10125, `score` 0, `reservoir` 0.10125, `mobs` 5, `shots` 0, `corpses` 1, `skulls` 2, `wisps` 0, `kills` 2, the levels record and every one of the eight stream cursors. The cause is mechanical and not anything the scenario does: every live body now carries an impulse of seven folded numbers, so seven more zeroes per live mob fold into the number. **No shove happens inside the window at all**, which is the thing to watch here rather than the checksum: `levels.bell` is 0 for the whole scenario, so no toll fires and every one of the seven fields sits at its resting zero on all 600 ticks. The dated paragraph is in `digest.ts`'s JSDoc. One re-pin remains, slice J's.

## 4. CodeRabbit

One entry per code commit: files reviewed, findings by severity, applied and declined, each decline with its reason.

**R-fix, `eddb32c4cb`.** All eleven files of the commit reviewed under `coderabbit review --agent --uncommitted`, **zero findings at any severity**, so nothing was applied and nothing declined.

**Slice H's fold commit, `2e90597cad`.** All eleven files reviewed, **two findings, both minor and both the same defect**, and it was real: a body killed or culled while a shove was still carrying it stopped carrying it without ever reporting what it had already been pushed, so the repel reading quietly lost that distance. The one-tick push could not have had this bug, because it reported before anything could kill the body. **Applied**: `reportShoveTravel` is now called on `damageMob`'s kill path and in `cullMobs` as well as when the impulse is spent, with two new tests pinning both halves, *reports what a body was already carried when it is killed in flight* and *reports nothing for a body killed on the tick the shove landed on it*. Nothing was declined.

**Slice H's bell commit, `ed369353e2`.** All eight files reviewed, **two findings, one minor and one major**. The minor one was real and applied: the clamped-shove test in `bell.test.ts` left its revenant on its own 64 health, which survives a level-five toll at that distance today but only by arithmetic nobody restated in the test, so it now carries `OUTLIVES_ANY_TOLL` like every other push fixture in the file. **The major one is declined, because its premise is what an uncommitted review can see**: it says `advanceMobs` does not advance shoves and asks for the advance to be added, and `advanceMobs` has advanced them since `2e90597cad`, which is not in an `--uncommitted` diff. **Its second half was real and is now written down**: a shove the bell starts inside `advanceLines` first carries the body on the tick after, because the lines run after the mobs in a tick (`step.ts`). That is the rule a shot already keeps, being left at its emitter for one tick, and it now sits in `pushTarget`'s own JSDoc. The test helper was flipped to the tick's own order in the same pass, so `tollAndTravelFor` advances the mobs before the bell rather than modelling an order the sim does not have.

## 5. Record and prompt claims found false against the tree

Every claim in the design record or in a slice prompt that did not survive contact, with the file and what is actually there. **The source's intent is followed rather than its stale letter, and an unclear intent is a stop.**

**R-fix. The formation ceiling column does not live in `waves.ts`.** The prompt's item (b) and its what-must-not-move list both place the `liveFormationCeiling` column and its cells in `src/game/stage/waves.ts`. The column is declared at `src/game/stage/stage.ts:90` and its seven cells are the seven sections of `SECTIONS` in the same file; `waves.ts` names it once, in the Procession's own prose at `waves.ts:238`, and states no cell. The intent was followed: the guard is on the column where the column is, and the test landed in `waves.test.ts` as the prompt asked, because that file already owns the section table's column tests (*declares both ceiling rows on every section*).

**R-fix. `boundary.test.ts` does have a fence over `src/tape`.** The prompt's read-first item 5 says it fences `src/game` and `src/dev` and has none over `src/tape`, "which is why finding 5 was not caught". `BOUNDARIES` carries a `tape` row at `boundary.test.ts:97`, `mayReach: ['tape', 'game']`, with its own paragraph saying why it reaches `src/game`: playback reproduces a run through the one execution authority. **Finding 5 was not caught because that reach is deliberately the whole of `src/game`**, not because nothing governed the folder. Item (e) was answered against what is actually there, below.

**Slice H. `mobs.ts` cannot call `moveStormTarget`, because `stormTargets.ts` imports `mobs.ts` and the core carries no import cycle.** The prompt's item (d) and the record's section 3 both ask for the shove's own travel to go through `moveStormTarget` while the advance runs inside `advanceMobs`. Those two cannot both hold: `stormTargets.ts:27-28` imports `damageMob`, `hasEntered`, `mobHitbox` and `SPAWN_MARGIN` from `mobs.ts`, so a call the other way closes a value cycle, and `boundary.test.ts`'s third fence, *the core has no import cycle*, holds `KNOWN_CORE_CYCLES` at an empty list with its own JSDoc saying that adding to it is the thing to argue about rather than reach for. The fences must not move, so the cycle was not available. **The intent was followed and both properties the instruction protects are held in one place each.** `pushable` is answered in `stormTargets.ts` and nowhere else, at the shove's start, through a new `shoveStormTarget` beside `moveStormTarget`; a boss and a set piece's source are refused there and a test pins it. The field-plus-margin bound moved up into `mobs.ts` as `moveMobInsideBounds`, beside the `SPAWN_MARGIN` it is made of, and `moveStormTarget` now calls it, so the bound is written once and both things that carry a body somewhere it did not walk read the same line.

**Slice H. The advance runs after the walk inside `advanceMobs` and not before it, and the reason is an off-by-one.** The prompt's item (d) says the advance runs before the walk. With `moveMob` standing down while `ticksLeft > 0`, running the travel first means the shove's last tick decrements `ticksLeft` to zero and `moveMob` then walks the body on that same tick, so the body both flies and walks once per shove. Running the walk first gives the shove precedence on every tick it is live and the walk back on the tick after, which is what the instruction is for. The order carries a comment saying so.

## 6. The ADR commit: the two amendments and the stale concept sentences (#124)

## 7. Slice R-fix: three tech gate findings, and no printed figure moves (#126)

Commit `eddb32c4cb`, eleven files, 159 insertions and 52 deletions, against the prompt's expected 4 to 10. The overshoot is import sites and nothing else: `SIGNAL_FULL` had to travel with `holdableSignal`, and five files read it.

**The slice started from `40adc7edd5` and sits on `775fba0587`.** The docs agent's handoff commit landed mid-slice, as the dispatch said it would; it touches `handoff.md` alone, so no code moved under this slice and every before-and-after proof below is against `775fba0587`.

**Nothing a player meets changed, nothing a batch prints changed, and nothing a tape replays changed.** What changed is where three things live and what the compiler now refuses. The proofs are at the end of this section and every one of them was run rather than assumed.

**Finding 4, the ceiling. The closer chosen is the type narrowing, and the reason is where the constraint has to be legible.** `Section.liveFormationCeiling` reads `1 | null` now instead of `number | null`, so authoring a 2 is a compile error at the cell being written, in the same file, ten lines under the declaration that says why. The gate offered a test in `waves.test.ts` as the alternative and named it the code rules' own idiom for a deliberate absence; the reason it lost is that the failure mode here is a one-cell data edit, and a test in another file cannot be read by the person making that edit. **The ceiling's grain is coupled to `Mob.from`'s grain, and that coupling is invisible from the editing site.** `Mob.from` says what put a body on the field and never which group it arrived in, so `ceilingMet` cannot tell one live formation from two and saturates at one; a table that wants two needs the bodies to carry their group first, and nothing in the tree does. The type is now where that sentence is, in the column's own JSDoc.

**The narrowing is asserted as well as written**, because a type that quietly widens again is the same silence one layer up. *fails loudly on a section stating a formation ceiling above one* in `waves.test.ts` builds a section with a 2 in the cell behind a `@ts-expect-error`, which is the repo's existing idiom for a member that deliberately does not exist (`execution.test.ts:244`). **Both directions were proved rather than assumed.** Widening the column back to `number | null` reddened `tsc` on that test file, `TS2578: Unused '@ts-expect-error' directive`. Authoring `liveFormationCeiling: 2` in the Procession's cell under the narrowed type reddened `tsc` at `stage.ts:138`, `TS2322: Type '2' is not assignable to type '1'`. Both were reverted.

**Finding 5, the codec's reach. `holdableSignal` and `SIGNAL_FULL` both moved into `signalLock.ts`, which still imports nothing.** The predicate cannot travel without the scale it reads, so the scale went with it, and neither name is exported from `director.ts` any more: a re-export would have left the moved names with two homes. `director.ts` imports `SIGNAL_FULL` from the lock's module beside `isLocked` and `SIGNAL_RAN_LIVE`, which is an edge that already existed. The five readers repointed are `src/tape/records.ts`, `src/app/seedFromUrl.ts` and the three test files that read the scale. **The parse-at-the-edge in `readHeader` is untouched**, refusal message included, and `codec.test.ts`'s four bad figures and three good ones still pin it. **`signalLock.ts` importing nothing is now asserted rather than commented**, in `boundary.test.ts`: *the lock's module imports nothing*, with teeth that count a bare package and a type-only import as readily as a path, because the promise is that the module depends on nothing at all and not that it depends on nothing at runtime.

**Finding 6, the allocation before the gates. The two scalar refusals now stand ahead of the affordable filter, and nothing else in `directorSpend` moved.** The order is the permission cell, the signal, the quiet interval, the affordable list, the ceiling, the span's permission cell. **No refusal can change another's answer**: each reads a different field, none of them writes, and every one of them returns null. **The refused-tick-draws-nothing property is untouched and held.** Both draws, the card and the quiet interval, still sit past the last refusal, so no cursor moves on a tick the gate refuses and #108's defect stays out by construction; `director.test.ts`'s existing promise over it is green unedited. What the reorder buys is the allocation: the quiet interval alone runs four to eight seconds, so the filter over `CARDS` was being built and discarded on well over ninety per cent of a directed section's ticks. The gate's JSDoc states the new order and says why it is not the order a reader would tell.

**The `src/tape` fence, which is the judgment item (e) asked for. It was done here, in the narrow form, and the prompt's premise was false.** `boundary.test.ts` already fences `src/tape`: the `tape` row reaches `tape` and `game`, deliberately, because playback reproduces a run through the one execution authority (ADR 0017). A folder rule therefore cannot say what finding 5 needs said, and narrowing that row is not available: `records.ts` legitimately reaches `game/faults` and `game/command`, and playback reaches `run.ts` and the execution module. **So the recurrence guard is directional and narrow**, the same instrument slice D used for the caps: *the tape codec imports nothing from the director*, reading every import of either kind, with the type-only reach as its teeth. It belongs in this slice because it costs one describe block, because the thing it guards is the thing this slice just undid, and because leaving it as a finding would file a ticket to write four lines. **No `BOUNDARIES` row was touched**, so the six fences are unmoved.

**`ceilingMet` also allocates, and it is recorded as seen and left.** It filters the whole 481-slot mob pool and runs an `includes` scan over `SHAPED_ORIGINS` per slot, building an array only to read its length. It sits past the quiet gate, so it runs on the few ticks that reach it rather than on nearly all of them, and it is not this slice's. **A counting loop over the pool is the better shape at that size**: one pass, no array, and the `includes` replaced by two comparisons.

**And one more seen and left, from the same family.** `signalLockFromUrl` in `src/app/seedFromUrl.ts` bounds-checks `?signal=` by hand against `SIGNAL_FULL` rather than asking `holdableSignal`. It is a live environment input, repaired to a safe value rather than rejected, so the two edges answer differently by design and consolidating them is a behaviour question rather than a move. Only its import specifier changed.

**The proof that nothing moved, each with its figure.**

- **`GOLDEN` untouched.** `git diff --stat` over `src/dev/digest.ts` between `775fba0587`, the tip below this commit, and this commit answers with nothing, the checksum still reads `-489751710`, and `digest.test.ts` is green, 1 test passed.
- **The other three version files absent from the diff entirely.** The same `git diff --stat` naming `src/game/witness.ts`, `src/tape/wireCodes.ts` and `src/dev/readingsVersion.ts` answers with nothing. `WITNESS_VERSION` 7, `FORMAT_VERSION` 4, `READINGS_VERSION` 4.
- **A tape recorded before this commit replays and verifies at this tip.** `local/step4/sliceG-hand.tape`, the hand tape slice G recorded through the built app, measures `outcome: 'verified'` at this commit: 1605 ticks, 27 checkpoints verified, none unreachable. Its whole measurement was compared field by field against the same measurement taken at the tip below, and the two are **identical apart from the build identity block**, which names the commit. That is what says the codec move cost nothing on the wire.
- **Two batches, one either side of the commit, same configuration and same seeds.** `shaky-short`, seeds 77, 78 and 79, birthright rig. **163 compared readings, every one flat**, through `compare-batches.ts`. The two `report.json` files differ in exactly two fields, the build identity's commit hash and the wall-clock stamp, and in nothing else. Tape lengths identical on all three seeds: 50782, 28014 and 141902 bytes.
- **Replay determinism at this tip.** The same three seeds played again at this commit. Each tape differs from its first play in **exactly two bytes, at offsets 203 and 204 in all three**, which is the header's `recordedAt` stamp; everything after the header is identical. So the tick counts (5397, 2965, 15123), the checkpoint witnesses and the stream cursors all rebuild, and the report differs only in that same stamp.

**The test-name diff: 2017 names to 2022, 5 added and 0 removed.** The baseline is my own, captured from this branch's tip before the first edit, and 2017 is the figure slice G left. All five added names are the planned tests and their teeth: *fails loudly on a section stating a formation ceiling above one*; *the lock's module imports nothing* and *counts a package as readily as a path, because either one is a dependency*; *the tape codec imports nothing from the director* and *fails a type-only reach, which a bundler would let through*.

**Verification.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` all green in `apps/hungry-grave/`. `pnpm verify` green twice on the committed tree at exit 0: 144 test files, 1999 passed, 23 expected fail, 2 todo, where slice G left it at 144 files, 1994 passed, 23 and 2. **The six fences green, each by title**: *src/game imports only from src/game*, *src/dev imports only from src/dev and src/game and src/tape*, *a policy names no weapon line*, *the step fence (ADR 0017) passes from the execution module alone*, *the harness reports and never judges: orders no reading against a number of its own / carries no verdict / prints no mean*, *every reading declares what comparing it means*, plus slice D's sixth, *the cap derivation reads tables and never the stage*. `scripts/__tests__/measure.test.ts` did not redden once across four `pnpm verify` runs; the tree was still for all of them.

**Left for later slices.** Nothing this slice owed anyone. The two allocations above are recorded as seen and left and neither is anybody's slice yet. **Slice H opens `director.ts` and `stage.ts` next**: the gate's order is now stated in its JSDoc and the ceiling column's type is a literal, so a fold commit that widens either one is changing a guard rather than tidying.

## 8. Slice H: the shove is a body travelling, and the bell alone uses it (#126)

Two code commits, `2e90597cad` the fold at eleven files, 857 insertions and 15 deletions, and `ed369353e2` the bell at eight files, 338 insertions and 60 deletions. Eighteen distinct files, against the prompt's expected 20 to 45; the reason is in "the diff, and why it is smaller than the prompt expected" below and it was looked for rather than assumed.

**What the engine does now.** A shove is a body travelling. A toll no longer writes a destination: it starts an impulse on every body its cones reach, and the body carries itself away from the grave over seven ticks, ten field units on the first and less on each one after, until the impulse is spent and it walks again on the tick after that. Its own walk stands down for those ticks and its arriving beat stands still with it. `WITNESS_VERSION` reads 8 and the fold carries the impulse, so a body three ticks into a shove is state a replay rebuilds rather than state it loses.

**What a player meets.** The bell's repel stops reading as a glitch, which is Mark's ruling 4 of 2026-09-15 and the only thing in this slice a person can see. One thing he should see coming is in "the push at the top rungs" below, because the mow has an opinion about where the push is visible.

### The impulse: seven fields, and what each one is

They live on `Mob.impulse` as a record `shove.ts` owns, blank in `blankMob` and cleared at every spawn, because a pooled slot may be one a shoved body died in.

- **`stepX` and `stepY`**, the travel the first tick of the current shove owes, in field units. Every later tick is `step * ticksLeft / SHOVE_TICKS` of them, so they are what the whole of the rest is computed from.
- **`ticksLeft`**, how much of the shove is left, this tick included. Zero is a body walking, and it is a rule and not only a clock: `moveMob` stands the walk down while it is above zero.
- **`travelled`**, what the body has really been carried, the bound included. It is what the one `mobShoved` reports, and it cannot be derived from the impulse because the bound can refuse part of a step.
- **`shovesLeft`, `nextIn` and `spacing`**, the wave structure. The bell passes one shove and no spacing. Slice J's belch passes three ten ticks apart (design record R3), and they are declared here rather than the day that caller is written, on `mobs[].from`'s own precedent: a field arriving later would change what every tape recorded in between folded. The multi-shove path is exercised at `shove.ts`'s own seam by three tests rather than left standing unused.

**The names were checked against `CONTEXT.md`'s Avoid lists before they were written.** Nothing here is called a wave, because Wave is the authored timeline's own entry and the Cone entry bans the word outright; the record's "waves" are shoves, and the fields say shove. Nothing is called a ring, a shockwave or a nova. **Whether the shove and the impulse earn glossary entries is a finding for whoever owns `CONTEXT.md` and not something this slice added**: the file gained nothing and lost nothing.

### The decay row, and the precedent beside it

`SHOVE_TICKS` is 7 and the fall is linear, and the whole of the reasoning sits in its own JSDoc citing `docs/research/push-feel-precedent.md` section 1 by path. Vampire Survivors runs a shove for 120 milliseconds, which is 7.2 ticks at this tick rate; the one fully numbered implementation found decays linearly rather than exponentially and gates the body's own motion off throughout; and no source anywhere describes knockback as a single-frame position set. A linear fall over seven ticks covers four times its first step, so the bell's level-five 40 units arrive as a first step of 10 and every step after it is smaller. **The readability criterion is arithmetic**: every step stays under a shambler's 22 units, the first by 12 and the rest by more, so successive drawn positions overlap. **No visual accompaniment was added**, because the research says plainly that a trail, a squash, a flash or an afterimage during a shove is documented by no source for any of these games.

**`BELL_CONE_ROWS` is untouched, push column included.** The level-five figure is still 40 and the shove spends it over seven ticks instead of one, which a test pins by name.

### The fold: seven fields, and the version paragraph

`WITNESS_VERSION` moves 7 to 8 in `2e90597cad` and nowhere else. The paragraph above the constant names all seven in the shape the version 6 and version 7 paragraphs use: what the fold gained, why each one folds, and what the move costs. **Nothing is excluded, and that was the easy half of the decision**: a shove is written by the rules and rebuilt by a replay, and a body three ticks into a forty-unit shove is in a state nothing else on the run shows, so a fold that carried only its position would call two different runs the same one on the tick the shove ends. The impulse folds after the body's own fields rather than beside the velocity it is not, because a widening appends and never reshuffles.

**Both partitions went red the moment the fields existed, which is the mechanism working.** `witness.test.ts` gained seven `FOLDED` paths with a perturbation each, and `invariants.test.ts` seven poison cases; `invariants.ts`'s existing no-NaN check reaches all seven, which is coverage and not a new check. **No fault identity was added and every wire number 1 to 22 is held.**

**What the move costs, and it is stated rather than discovered.** Every tape recorded before `2e90597cad` is refused by its version. Slice G's hand tape and a conditioned tape recorded at `997e8c1309` both answer `witnessVersionMismatch` with `tapeWitnessVersion` 7 and `readerWitnessVersion` 8, no tick reproduced and no checkpoint compared. That is the fourth time step 4 has made saved tapes a dead baseline and it is taken eyes open on ruling R1.

### The `mobShoved` shape, and what it was set against

**It fires once per impulse, on the tick the impulse is spent, carrying the distance the body really covered.** A body killed or culled mid-flight reports what it had already been carried; a body that covered nothing reports nothing, whether the bound refused the whole move or the toll killed it where it stood.

**What it was set against is the other honest shape the prompt names, firing once at the start with the distance the impulse will travel unclamped.** Two things decided it. The tree already promises the realized figure and says why: `events.ts`'s own paragraph, `pushTarget`'s, and `bell.test.ts`'s *carrying the distance the bound let the mob cover, not the nominal push*, all exist because a shove into the field's edge must report what it truly bought and never what was asked for. Start-firing reverses that promise. And `repel.ts` sums that figure per toll, so reversing it changes what the channel means with no `READINGS_VERSION` move under it, and this slice does not have one. **Firing per tick was never available** and would have multiplied the count by seven for the same reason. It is pinned by four tests at the mobs seam and one at the bell's.

### GOLDEN, and the versions

Section 3 carries the re-pin. `-489751710` to `-145039082`, the checksum alone, every other field held, and the scenario fires no toll at all because `levels.bell` is 0 through its 600 ticks, so the move is seven resting zeroes per live body and nothing else. **`READINGS_VERSION` is 4 and `FORMAT_VERSION` is 4**, neither touched by either commit and both stated here because the prompt asks for them stated.

### The measurements

**Replay determinism at this tip.** Seeds 909 and 910 under `shaky-short`, played twice through `scripts/batch.ts`. Same tick counts both times, 4552 and 2364; tapes of identical length, 42869 and 22385 bytes, **differing in exactly three bytes at offsets 202, 203 and 204 in both**, which is the header's `recordedAt` stamp; and the two `report.json` files differ in exactly one field, `identity.recordedAt`.

**Shoves in flight at a checkpoint, and this one could not be had: a tape's checkpoints can never catch a bell shove, by arithmetic.** The recorder writes a checkpoint every 60 ticks and `BELL_PERIOD` is 180, which is three times it, so a toll fires at a fixed phase against the checkpoint grid. A body is struck a fixed number of ticks into the expansion for a given distance, and only bodies far enough out to survive the strike are ever carried anywhere, so the ticks a body is mid-shove occupy a fixed residue band. Measured over 20000 ticks at seed 202 with the bell at rung 1: 47 shoves, 249 ticks with a body in flight, **residues mod 60 spanning 27 to 51 and never reaching 0**. Ten seeds and five rungs were swept and every one read zero checkpoints in flight. **So the property was proved the stronger way instead**: the witness was folded on every tick a body was flying rather than only on the grid, 249 of them on that seed, and all 249 are identical across two plays of the same seed, with identical stream cursors and the same tick count. The instrument is `local/round2/sliceH-determinism.ts` and it is scratch, outside version control.

**A conditioned tape at `bell=5`.** Seed 77, 6000 ticks, `outcome: 'verified'`, 101 checkpoints verified and none unreachable.

**A hand-recorded tape at this tip**, played against the built app through `vite preview` and driven with `playwright-cli`, sealed at 6535 ticks: `outcome: 'verified'`, 109 checkpoints verified, none unreachable, no build mismatch, `integrity: 'clean'`, no recorded or readback faults, 373 kills. **`state.refusals` totalled over its own replay: `food` 0, `carriers` 0, `offers` 0.** Its repel channel reads 36 tolls, 4 shoves and 36.07 field units.

**A batch at this tip.** Seeds 900 to 905 under `steady-far` and the same six under `loose-far`, birthright rig, **12 of 12 verified, none unfinished, `readingsVersion` 4 on both**. The repel channel per seed, which is this slice's own proof that the mechanic works on real tapes rather than only in tests:

| | tolls | shoves | distance |
| --- | --- | --- | --- |
| `steady-far` 900 to 905 | 0, 0, 171, 0, 29, 0 | 0, 0, 78, 0, 19, 0 | 0, 0, 160.2, 0, 11.7, 0 |
| `loose-far` 900 to 905 | 26, 0, 0, 0, 77, 150 | 14, 0, 0, 0, 51, 65 | 9.6, 0, 0, 0, 46.0, 38.3 |

**No cap bound in either batch and none moved.** `MOB_CAP` 481, `MOB_FIRE_CAP` 434, `CORPSE_CAP` 704, `WISP_CAP` 64 and `SKULL_CAP` 120 are where slice D left them and `caps.ts` was opened only to read.

### The push at the top rungs, and it is the reading Mark should have

**A body the toll kills is never pushed at all now, and at bell rung 5 that is almost every body it reaches.** Measured on one conditioned run, the same seed and the same 6000 ticks either side of the change, with the same 252 kills and the same 228 bell fatal blows on both: **the build below this slice reads 230 shoves and 1269.7 field units of pushback across 33 tolls, and this tip reads 2 shoves and 20.1 units across the same 33.**

The cause is not a defect and it is not a tuning figure, it is the ruling arriving: a shove takes seven ticks, so a body that dies on the tick the toll reaches it never travels. Under the one-tick push the same body was teleported forty units and then killed, so its corpse landed forty units further out; now the corpse lands where the body stood. **Push and damage share one falloff by design** (`proximity` in `bell.ts`, and its JSDoc says why), so the two are inversely bound: near the grave the toll kills and does not push, and far out it pushes a fraction of a unit and the body lives. The push a player can watch is therefore on bodies tough enough to survive a near strike, which today is the revenant and the ghoul and never the mow body.

**Nothing was done about it and nothing should be from here.** It follows from R2 and from the mow (ADR 0059) together, both of which are ruled, and the two ways out are both new mechanics nobody has ruled: shoving the corpse a kill leaves, or splitting the push's falloff from the damage's. **It is filed for Mark's read** and it is the number slice I's reading will make visible on every batch.

### The rendered check, and what it could not see

**Two runs in one session against the built app at `ed369353e2`**, through `vite preview` and `playwright-cli`, because a check that only ever plays run one is structurally blind. Run one played by hand to a sealed ending at 6535 ticks with its tape saved from the end screen; run two started from RISE AGAIN and was watched to tick 1712 with the pause button drawn, the stick drawn, the field, the corpses, the set piece and the Banshee's rings all rendering. Nothing leaked through the screen pool. The console carried no errors across either run, only the headless browser's own autoplay and WebGL readpixels warnings.

**What could not be obtained, said plainly: a photograph of one body at successive ticks inside a single shove.** The headless browser renders this build at 3 to 5 frames a second and the app answers by running twenty to thirty sim ticks per drawn frame, so a seven-tick shove completes inside one frame here whatever the sim is doing. Three attempts were made and all three are written down rather than dressed up: screenshotting a live toll, driving the replay route's `?at=` at four ticks across a shove, and stepping a Playwright fake clock frame by frame. The last one works far enough to render a pinned tape at a chosen tick with `ORIGINAL DEBT 0 TICKS`, and it still cannot stop the replay advancing past the tick asked for. **The property is real in the sim and pinned by tests** (*stands a shoved body somewhere different on every tick, none of them a body-width from the last*, and *draws a shoved body at a different place on every tick of its travel*), and `FieldRenderer` writes `sprite.position.set(mob.x, mob.y)` straight off the sim with no interpolation anywhere and was not touched by this slice. **So this property is human-checkable only, at 60 frames a second on a real device, and it is Mark's own verification step 10.**

### The diff, and why it is smaller than the prompt expected

Eighteen files against 20 to 45, and it was looked for rather than accepted. The prompt's estimate came from slice E's 55 and slice G's 53, and both of those moved a signature every module's tests reach: slice E added a required parameter to `spawnMob` and thirty of its fifty-five files were call sites. **This slice adds a field to a record that has exactly one constructor.** `blankMob` is the only place a `Mob` is built, in production and in tests alike, so a nested impulse reached no call site at all and the typecheck asked nobody a question. The reds that did arrive are every one the prompt listed except the ones that cannot exist: eight test files went red across the two commits, and the tape fixtures pinned at witness 7 are not in the tree to move, because the tapes this repo keeps are in `local/` and outside version control.

**What went red, and what each turned out to be.** The two partitions, as designed. `digest.test.ts`'s checksum. `bell.test.ts`'s whole push block, because the events now arrive from `advanceMobs` rather than from `advanceBell`, and **every one of its shove assertions would have passed vacuously if it had been left alone**, which is why the block was re-expressed through a helper that advances both rather than deleted or narrowed. `phases.test.ts`'s boss pushback, the same way. And two measured per-seed baselines, both re-measured with the reason beside them: `ENDS_ABOVE_THE_BIRTHRIGHT` went from `[505]` to empty and `WAITING_EATS_MORE` swapped 101 for 11, still four of twelve, with the Waking's own property and its totals unmoved. **Both move through the bell and only the bell**: a run that buys a bell rung has its bodies travel over seven ticks and die where they stand, so where corpses land and which bodies a lane meets move from the first toll onward.

### Verification

`pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/` before each commit. **`pnpm verify` green twice on each committed tree at exit 0**: 145 test files, 2039 passed, 23 expected fail, 2 todo, where slice R-fix left it at 144 files, 1999 passed, 23 and 2. **The six fences green, each by title**: *src/game imports only from src/game*, *src/dev imports only from src/dev and src/game and src/tape*, *a policy names no weapon line*, *the step fence (ADR 0017) passes from the execution module alone*, *the harness reports and never judges*, *every reading declares what comparing it means*, plus slice D's sixth, *the cap derivation reads tables and never the stage*. The core's cycle guard, *carries no value-import cycle beyond the ones written down*, is green with `KNOWN_CORE_CYCLES` still empty, which is the fence that decided this slice's module shape.

**The test-name diff, against this branch's own tip captured before the first edit: 2022 names to 2062, 41 added and 1 removed.** The one removal is a retitle, *carrying the distance the clamp let the mob move* becoming *carrying the distance the bound let the mob cover*, because the bound moved module and the word followed it. The 41 added are the shove module's twelve, the mobs seam's eight, the fold's seven perturbations, the no-NaN partition's seven poison cases, the storm seam's two, the bell's four and the version-seven refusal.

### Left for later slices, each named

**Slice I owns the reading and it inherits two things from here.** The first is the push-at-the-top-rungs finding above, which its batch will print on every run. The second is smaller and concrete: `repel.ts` was not touched at all, its shape and its per-toll window still mean what they meant, and `READINGS_VERSION` held at 4 on that basis. **One thing it should know about the window**: a shove now reports up to seven ticks after the toll's edge reached the body, and with the belch's three waves that becomes up to twenty-seven, so the window a reading holds a shove in has to be wide enough for the impulse and not only for the expansion.

**Slice J owns the belch and the wave fields are waiting for it.** `shovesLeft`, `nextIn` and `spacing` are declared, folded, tested at `shove.ts`'s own seam and named with slice J in their JSDoc; the belch passes three and ten and needs no new folded field and no second version move.

**Seen and left, for nobody in particular.** The checkpoint grid and the toll period being commensurate, above, means a tape's own checkpoints can never observe a bell shove mid-flight. Nothing is wrong today, because a divergence inside a shove shows at the next checkpoint through the position it produced, but it is a blind spot in the tape's own verification and it would be cheap to close by making the two incommensurate. It is written here rather than filed, because moving either number is a tuning decision and the tuning step is next.

## 9. Slice I: the shove is measurable, and three readings the batch could not answer (#126)

## 10. Slice J: the belch becomes a pushback (#124)

## 11. Slice K: the meter fills and changes corner (#127)

## 12. Slice L: the Wall is a wall (#123)
