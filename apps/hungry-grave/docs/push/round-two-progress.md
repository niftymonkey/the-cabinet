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
| I, the shove is measurable | `157946940c` | feat(hungry-grave): a shove says which push threw it and the batch reads the two apart (#126) |
| H2, the push retuned and the bell's two reaches | `d6794f9836` | feat(hungry-grave): a toll's push runs long enough to watch and reaches further than its damage (#126) |
| J, the belch becomes a pushback | `eda21401a0` | feat(hungry-grave): the belch clears the ground in three waves and takes health off nothing (#124) |
| J-fix, the reach and the eruption made one circle | `6caa2fa72b` | fix(hungry-grave): the belch catches half the field's width and its eruption stops where the push stops (#124) |
| K, the meter fills and changes corner | `538fd21a9b` | feat(hungry-grave): the belch's ring fills with its reservoir and moves under the other thumb (#127) |
| L, the Wall is a wall | | |

Slice H carries two code commits, the fold and the rewiring, which is this round's one authorized departure from the contract's one-code-commit rule.

## 2. The version ledger

Where each constant stood when round two opened, where it is permitted to go, and where it actually went. **A move anywhere the plan does not name is a stop and report, never a re-pin and never a bump taken on the spot.**

| Constant | At slice G's tip | Permitted move | Owner | Landed |
| --- | --- | --- | --- | --- |
| `WITNESS_VERSION` (`src/game/witness.ts`) | 7 | 7 to 8, exactly once | Slice H, in its own commit | **8**, in `2e90597cad` and nowhere else |
| `READINGS_VERSION` (`src/dev/readingsVersion.ts`) | 4 | 4 to 5, exactly once | Slice I | **5**, in `157946940c` and nowhere else |
| `FORMAT_VERSION` (`src/tape/wireCodes.ts`) | 4 | none | nobody | 4 after slice I, stated and unmoved |
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

**Slice I, `157946940c`.** All twenty-one staged files reviewed, **one finding, major, declined**. It asks for `mobs[].impulse.source` to be folded rather than excluded and for `WITNESS_VERSION` to bump with it, which the slice's own fourth ruling and the design record's section 5 both forbid: the witness moves exactly once in round two and that move was slice H's. The reasoning behind the exclusion, and slice G's worked precedent for declining a reviewer's version move, are in section 9.

**Slice J-fix, `6caa2fa72b`.** All five staged files reviewed, **zero findings at any severity**, so nothing was applied and nothing declined.

**Slice K, `538fd21a9b`.** All six staged files reviewed, **one finding, minor, applied, and it was a real misread the tests had not caught**. The arc's segment count was `Math.round(filled * 64)`, which closes the ring at 63.5 segments, so a reservoir a half-segment short of full would have drawn the complete circle the ready state draws. It is now a named pure function, `filledSegments`, rounding down below full and answering the full count only at a full reservoir, with its own test, *closes the ring at a full reservoir and never a segment before one*. Nothing was declined.

## 5. Record and prompt claims found false against the tree

Every claim in the design record or in a slice prompt that did not survive contact, with the file and what is actually there. **The source's intent is followed rather than its stale letter, and an unclear intent is a stop.**

**R-fix. The formation ceiling column does not live in `waves.ts`.** The prompt's item (b) and its what-must-not-move list both place the `liveFormationCeiling` column and its cells in `src/game/stage/waves.ts`. The column is declared at `src/game/stage/stage.ts:90` and its seven cells are the seven sections of `SECTIONS` in the same file; `waves.ts` names it once, in the Procession's own prose at `waves.ts:238`, and states no cell. The intent was followed: the guard is on the column where the column is, and the test landed in `waves.test.ts` as the prompt asked, because that file already owns the section table's column tests (*declares both ceiling rows on every section*).

**R-fix. `boundary.test.ts` does have a fence over `src/tape`.** The prompt's read-first item 5 says it fences `src/game` and `src/dev` and has none over `src/tape`, "which is why finding 5 was not caught". `BOUNDARIES` carries a `tape` row at `boundary.test.ts:97`, `mayReach: ['tape', 'game']`, with its own paragraph saying why it reaches `src/game`: playback reproduces a run through the one execution authority. **Finding 5 was not caught because that reach is deliberately the whole of `src/game`**, not because nothing governed the folder. Item (e) was answered against what is actually there, below.

**Slice H. `mobs.ts` cannot call `moveStormTarget`, because `stormTargets.ts` imports `mobs.ts` and the core carries no import cycle.** The prompt's item (d) and the record's section 3 both ask for the shove's own travel to go through `moveStormTarget` while the advance runs inside `advanceMobs`. Those two cannot both hold: `stormTargets.ts:27-28` imports `damageMob`, `hasEntered`, `mobHitbox` and `SPAWN_MARGIN` from `mobs.ts`, so a call the other way closes a value cycle, and `boundary.test.ts`'s third fence, *the core has no import cycle*, holds `KNOWN_CORE_CYCLES` at an empty list with its own JSDoc saying that adding to it is the thing to argue about rather than reach for. The fences must not move, so the cycle was not available. **The intent was followed and both properties the instruction protects are held in one place each.** `pushable` is answered in `stormTargets.ts` and nowhere else, at the shove's start, through a new `shoveStormTarget` beside `moveStormTarget`; a boss and a set piece's source are refused there and a test pins it. The field-plus-margin bound moved up into `mobs.ts` as `moveMobInsideBounds`, beside the `SPAWN_MARGIN` it is made of, and `moveStormTarget` now calls it, so the bound is written once and both things that carry a body somewhere it did not walk read the same line.

**Slice H. The advance runs after the walk inside `advanceMobs` and not before it, and the reason is an off-by-one.** The prompt's item (d) says the advance runs before the walk. With `moveMob` standing down while `ticksLeft > 0`, running the travel first means the shove's last tick decrements `ticksLeft` to zero and `moveMob` then walks the body on that same tick, so the body both flies and walks once per shove. Running the walk first gives the shove precedence on every tick it is live and the walk back on the tick after, which is what the instruction is for. The order carries a comment saying so.

**Slice J-fix. The prompt says the clear-the-reach sentence is pinned in two places in `belch.test.ts` and it is pinned in three.** The third is inside *strikes each body once, and a body that walks in afterwards takes nothing*, which asserted the caught body ended past the reach and went red at the new figure. The intent was followed: it is re-expressed rather than deleted, and it keeps its own title because its subject is the strike-once rule and the reach was never what it was for.

**Slice J-fix. The ADR commit landed but never wrote its own note.** `ec87a2e9e7` moved ADR 0008's filename to `0008-the-belch-full-only-gas-everywhere-shove-nearby.md` and is in the tree, so the prerequisite every belch slice depends on is met. Section 6 below and its row in section 1 are still empty. Neither is this slice's to write and neither is filled in here.

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

One code commit, `157946940c`, twenty-one files, 698 insertions and 64 deletions, against the prompt's expected 10 to 25 files.

**What the instrument reads now.** A batch says what each push did and which push did it. `mobShoved` carries the push that threw it, the repel reading's toll arm counts the bell's shoves exactly as it did and a new belch arm counts the belch's beside it, and a belch shove arriving with no toll window open is no longer a bug. `READINGS_VERSION` reads 5. Beside that the report gained three readings the 48-seed batch asked for and could not get: the three cap refusal counters per run, the tick every directed add landed on, and a measure test that no longer reddens because two reads of the working tree disagreed.

**What a player meets: nothing.** No rule the simulation runs changed. The one field the sim gained is read by nothing but an event a reading counts off a tape, `FieldRenderer` and every screen were untouched, and the golden digest is unmoved.

### The discriminator, and what it was set against

**`MobShoved` gains `source`, one of `'bell'` and `'belch'`, and the field rides on the impulse because nothing else can carry it.** The one report a shove makes is taken when the impulse is spent, up to seven ticks after the push that threw it has finished and, with slice J's three waves, up to twenty-seven. Nothing at the report can name the pusher unless the body carried the name, so `Impulse` gains `source`, `startShove` takes it, `shoveStormTarget` passes it through and `bell.ts` fills it with `'bell'`. `ShoveSource` is declared in `shove.ts`, which is the module that owns the concept, and it is narrower than `DamageSource` on purpose: a weapon line that never shoves can never be a shove's source.

**What it was set against, and the tree really does show a cheaper shape, which is why it is written down rather than left implicit.** At the moment the event fires, `spacing` reads 10 for a belch and 0 for a bell, because `clearImpulse` runs only when the travel is taken, so the source could have been inferred from the wave structure with no new field at all. **It was rejected and the reason is the one the reading's own guards state**: `comparisonDeclared.test.ts` exists because a reading may not inherit a meaning from the shape its value happens to have, and this would be exactly that, one design-record table row away from being wrong. **A separate event type was the other candidate and it fails on the same fact as the field**: a belch cannot emit its own event at fire time, because the realized travel is not known for ticks afterwards, so a second type would still need the source on the impulse to know which type to emit.

**The field is excluded from the fold, not folded, and `WITNESS_VERSION` holds at 8.** It is `mobFire[].kind`'s precedent exactly: written once when the shove starts, never mutated, and no rule reads it, so it answers who pushed rather than where the body goes. A divergence in it also shows through the impulse's seven folded fields, because the bell starts one shove with no spacing and the belch three ten ticks apart (design record R3). The entry is in `witness.test.ts`'s `EXCLUDED` with that reasoning, and slice G's lock is the worked precedent for a new state field that owes no version move. It also joins `invariants.test.ts`'s own `EXCLUDED` on `ending`'s terms, because it is one of two words and never a number.

**A body a second push catches mid-flight reports its whole travel under the second push**, and that follows from slice H's ruling of one report per impulse rather than one per push. Splitting the travel would mean splitting the report. It is in `startShove`'s JSDoc beside the accounting rule it rides on.

### The reading, split by source, and the toll arm proved unchanged

**The toll arm keeps its exact name, its exact shape and its exact reduction.** `tolls`, `totalShoves` and `totalDistance` are untouched and now count bell shoves only. The throw is kept for a bell shove arriving with no toll window open, which is still impossible, and its comment says that is the case it is for.

**The belch arm is flat and never per belch**, two figures, `belchShoves` and `belchDistance`. What a batch asks of it is how much pushback the belch bought, and when each belch fired is already `tuning.belchCadence`'s answer; a window per belch would be structure built for a reader nobody has written down, which is the cited-future rule refusing it. Both fields name slice J in their comment.

**The toll arm is proved unchanged twice, once in a test and once on real tapes.** The test is *reads the toll arm exactly as it read before the split*, asserting the figures this file's own windowing tests asserted at slice H's tip. The tapes are in "the measurements" below and they agree with slice H's table to the digit.

**The belch arm is proved both ways.** *holds a belch's shoves without throwing* plants two belch shoves with no toll ever fired and reads 2 shoves and 7 units where slice H's build would have thrown; *attributes a shove to the belch rather than to the toll a window is open for* plants a belch shove inside a live toll's window and the toll arm still reads only its own. And *reads the belch arm as empty on every tape this build can produce* plays a real 2000-tick run at every line's top rung, fills the toll arm and leaves the belch arm at nothing. It is played rather than reasoned about, and it is the test slice J turns red.

### The version 5 note, and the incomparability stated plainly

**`READINGS_VERSION` moves 4 to 5 in `157946940c` and nowhere else**, with a dated paragraph in the shape the version 3 and version 4 paragraphs use. It says what changed meaning: `tuning.repel` used to mean every shove on the run, because the bell was the only thing that could throw one, and it now means the bell's shoves alone. It says the cost in the record's own words, that **every step 4 batch is incomparable with every post-belch batch by name**, because subtracting one build's `totalShoves` from the other's would be arithmetic across a definition that changed underneath it the moment a second pusher existed. That is exactly the case version 3 exists to make loud, and it is taken eyes open on ruling R9. **And it says which of this commit's readings are not what moved it**: the three refusal counters and the belch arm itself go in beside unchanged keys, and the batch report's `directedAdds` field is not a reading at all. The repel split is the whole of the move.

**`WITNESS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN` `-145039082` all hold**, each read out of the tree at the committed tip rather than assumed. No folded field was declared, nothing new was recorded in a header, nothing under `src/dev` is folded, and the golden scenario's six hundred ticks run exactly as they ran at slice H's tip. **Round two's second `GOLDEN` re-pin is still slice J's.**

### The three refusal counters, and which door they came through

**They came through the readings graph as a reading over the run's own state, not over events**, a new `src/dev/readings/refusals.ts` joining the graph in all four places `readings.ts` declares it, reporting `tuning.refusals.food`, `.carriers` and `.offers`. Three `spreadReading` entries in `BATCH_READINGS` and three `scalarReading` entries in `READING_COMPARISONS`, so both declaration guards hold them.

**What it was set against is a field on `Metrics` outside the graph, beside `run.kills`.** The graph won on two facts. `groundHeld` and `fieldPerLine` already take `RunState` and nothing else, so a reading over state is the graph's ordinary shape rather than an exception carved for this one. And the graph's own listener fires at the end of a tick, after the invariant harness has read the ledger and before the next tick clears it (`execution.ts`, `step.ts`), so the reading reads the same three numbers `checkRefusals` reads, at the same moment, with no second copy of when a refusal counts. That read point is pinned by its own test, *counts a refusal against the tick it happened on and never the one after*.

**The counters owe no witness move and slice E already ruled why**: they sit in `witness.test.ts`'s `EXCLUDED` as the harness's input rather than the run's state, and reading them into a report does not fold them.

**A non-zero counter is a fault and a finding and never a cap to raise**, which is written into the module's own JSDoc and into the table entry. The batch test asserts the row over a batch where all three read zero and over one where all three are non-zero, with the seed behind the fault named, so the row is proved able to say something as well as able to say nothing.

### The per-add tick

**`directedAdds` is a field on `BatchReport` and not a `BATCH_READINGS` entry**, on `unfinished` and `ceilingStops`'s exact precedent: the declaration guards walk a per-run `Metrics` report and the seed a figure came from does not live there. Each entry is a seed and the whole `DirectedCardSeen` beside it, carried rather than reduced, because a tick has no quartile across seeds: two runs cross a section at different clock times and the median of a set of add ticks answers nothing. **`tuning.pressure.adds` keeps its name, its shape and its by-section reduction**, which the batch test asserts alongside.

It exists because a section is not a moment: three of ADR 0047's four off-limits moments are tick ranges inside a section the director may otherwise spend in, so only the tick can place an add inside one. **It reports and rules nothing.** No range is named in `batchReport.ts`, no gate was added, and whether an add inside one of those ranges is a defect is ADR 0047's question and the orchestrator's. The test lays a range over the report from outside, which is what a reader does.

### The measure comparison, what it still covers and what it no longer compares

**It still asserts, byte for byte, that the shell prints exactly what the module returns**, formatting, indentation and trailing newline included, plus the exit status. **What it no longer compares is one field, `buildMismatch.running`**, the identity of the build that did the reading. Each side's own value is lifted out into one fixed marker and the rest of the text is compared whole; each side is separately asserted to name a build rather than an empty string, so the field is lifted out and never dropped. **`buildIdentity` itself was not touched**: a tree with untracked work is uncommitted work, that is #82's ruling and it is correct, and what must not depend on the tree standing still is this comparison.

**It was proved rather than assumed, in both directions, under a process writing an untracked file into the worktree every fifty milliseconds.** The old comparison reddens under that churn with a real assertion diff naming two different `-dirty-` digests, `...-dirty-aa1e725eec` against `...-dirty-44fb0629b9`, which is the reader's own suspicion pointed at the codec. The new one is green under the same churn, four of four. Churning `local/` proves nothing, because git ignores it and the digest never moves; the writes have to be somewhere git can see, which is what a docs agent on this branch actually does.

### The measurements

**A batch at this tip, and the toll arm agrees with slice H's to the digit.** Seeds 900 to 905 under `steady-far` and the same six under `loose-far`, birthright rig, **12 of 12 verified, none unfinished, no ceiling stop, `readingsVersion` 5 on both**.

| | tolls | shoves | distance |
| --- | --- | --- | --- |
| `steady-far` 900 to 905 | 0, 0, 171, 0, 29, 0 | 0, 0, 78, 0, 19, 0 | 0, 0, 160.2, 0, 11.7, 0 |
| `loose-far` 900 to 905 | 26, 0, 0, 0, 77, 150 | 14, 0, 0, 0, 51, 65 | 9.6, 0, 0, 0, 45.9, 38.3 |

Every figure is slice H's own. The one that reads differently, `loose-far` 904 at 45.9 against slice H's 46.0, is 45.94972802145916 rounded the other way at one decimal place and not a difference at all.

**The belch arm empty on every one of the twelve**, `belchShoves` 0 and `belchDistance` 0 per run, which is the cited future proved on real tapes beside the test that plays one.

**The toll arm at the top rung, which is where slice H's filed finding lives.** A conditioned tape at every line's rung 5, seed 77, 6000 ticks: `outcome: 'verified'`, 101 checkpoints verified, none unreachable, **33 tolls, 2 shoves and 20.09 field units**. Slice H reports 2 shoves and 20.1 units across the same 33 tolls at its own tip, so the two builds agree exactly and **agreeing is the pass**. The finding itself, that a body the toll kills on the tick it lands is never carried, is Mark's read in section 8 and nothing here touches it.

**The three refusal counters, off a batch report for the first time.** `tuning.refusals.food`, `.carriers` and `.offers` all read **zero on every one of the twelve runs** in both configurations, and zero on the conditioned rung-5 tape too. **No counter is non-zero anywhere, so there is no fault and no finding**, and verification step 10 is answered off a report rather than off a hand tape.

**The per-add ticks, off the same batch, laid against the wave schedule.** 121 directed adds across the twelve runs, 29 in the Procession and 92 in the Crowd. **Not one add landed in a Banshee, a Waking, a Vigil or an Undertaker span at all.** Against the sparse last wave, which opens at section-local second 112 in the Procession and 63 in the Vigil (`waves.ts`'s `sparseLastWave` call sites), **no Procession add came within 46 seconds of the window opening**, the latest of the 29 landing at local tick 3928 of a 7830-tick section. The Crowd has no sparse wave of its own, so the other 92 have no window to be measured against. **This is a reading and not a verdict**: what it says is where the adds landed, and whether any placement is a defect is ADR 0047's question.

**Replay determinism at this tip.** Seeds 909 and 910 under `shaky-short`, played twice through `scripts/batch.ts`. Same tick counts both times, 4552 and 2364; tapes of identical length, 42886 and 22402 bytes, **differing in exactly three bytes in both**, at the header's `recordedAt` stamp; and the two `report.json` files identical apart from `identity.recordedAt`.

**An anomaly that was chased rather than waved off: the tapes are 17 bytes longer than slice H's and the stamp sits 17 bytes further in.** Slice H records 42869 bytes for seed 909 at offsets 202 to 204; this tip records 42886 at 220 to 222. The cause is not the format, which has not moved, and not the fold. The header carries the build identity as a string, slice H recorded against a clean tree and so stamped a bare 40-character sha, and these were recorded before the commit landed and stamped `<sha>-dirty-<ten>`, which is 57 characters. 57 minus 40 is the 17 bytes, in the length and in the offset both. **That is `buildIdentity` working exactly as #82 ruled** and nothing about this slice.

**No cap bound in any of the fourteen runs measured and no cap moved.** `caps.ts` was opened only to read.

**No rendered check was owed and the claim was checked rather than assumed.** Nothing a player sees changes and the reason is structural rather than hopeful: the sim gained one field that no rule and no renderer reads, every reading module is under `src/dev` and `boundary.test.ts` proves `src/app` cannot reach it, `FieldRenderer` and every screen are untouched by the commit, and the golden digest is unmoved. `pnpm build` is green. **No browser run was made, which is stated plainly rather than implied**, so nothing is claimed about what the screen looked like.

### CodeRabbit, one iteration

**Twenty-one staged files reviewed under `coderabbit review --agent --uncommitted`: one finding, major, declined.**

- **Declined, major.** It asks for `mobs[].impulse.source` to move from `EXCLUDED` to `FOLDED` and for `WITNESS_VERSION` to be bumped with it. **It is the fourth ruling of this slice's prompt and the design record's section 5, neither of which is this slice's to revisit**: the witness moves exactly once in round two, in slice H, and a second move anywhere is a stop. The reasoning stands on its own beside the ruling: the field is provenance written once at the start of a shove and read by no rule, which is `mobFire[].kind`'s precedent for an exclusion, and a divergence in it shows through the seven impulse fields the walk already folds, because the two pushes start structurally different impulses. Slice G's declined finding is the worked precedent for this shape of decline, a reviewer asking for a version move a slice's own ruling forbids.

### Verification

`pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/` before the commit. **`pnpm verify` green twice on the committed tree at exit 0**: 146 test files, 2050 passed, 23 expected fail, 2 todo, where slice H left it at 145 files, 2039 passed, 23 and 2.

**The six fences green, each by title**: *src/game imports only from src/game*, *src/dev imports only from src/dev and src/game and src/tape*, *a policy names no weapon line*, *the step fence (ADR 0017)*, *the harness reports and never judges* in all three of its parts, *orders no reading against a number of its own*, *carries no verdict, because nothing it declares is a yes or a no* and *prints no mean, so every figure it prints keeps its own tail*, and *every reading declares what comparing it means*, plus slice D's sixth, *the cap derivation reads tables and never the stage*. Beside them *every reading declares how a batch reduces it* in both its parts, the core's cycle guard *carries no value-import cycle beyond the ones written down* with `KNOWN_CORE_CYCLES` still empty, and *a golden digest over a short scripted scenario matches the committed constant (ADR 0015)*.

**`harnessStatesNoTarget.test.ts`'s module list was not extended**, on slice G's own finding (`step-4-progress.md` section 19): it is three report modules and not the reading modules, and what holds a new reading is the two declaration guards. Nothing new in `batchReport.ts` orders a reading against a literal, answers a boolean or takes a mean.

**The test-name diff, against this branch's own tip captured before the first edit with the tree clean: 2062 names to 2073, 13 added and 2 removed.** The 2062 is exactly where slice H left it. **Both removals are retitles of tests that still exist and still assert what they asserted**: *prints what the module measures* became *prints what the module measures, without either side depending on the tree being still between the two reads*, and *a shove before any toll is a bug in the sim and fails loudly rather than being absorbed* became *a bell shove arriving with no toll open is still a bug and still fails loudly*, because the sentence is now about half a case rather than the whole of one. The 13 added are the repel suite's five, the refusals module's three, the batch report's two, the shove seam's two and the measure tool's retitled one.

### Record and prompt claims found false against the tree

**`CONTEXT.md` has no Repel, Reading or Refusal entry.** The prompt's read-first item 8 names four entries to read before naming anything, Repel, Reading, Batch and Refusal, and only Batch exists. Repel appears inside the Bell entry as the bell's job and nowhere else. The intent was followed against what is there: the Batch entry's Avoid list was read, and so were Bell, Belch, Burst, Cone and Toll, whose Avoid lists between them ban shockwave, nova, ring, wave, AOE, wipe and screen clear. **Nothing named in this slice uses any of them.** Whether the shove, the impulse and the refusal earn entries is a question for whoever owns `CONTEXT.md`, exactly as slice H left it, and the file gained nothing and lost nothing.

### Left for later slices, each named

**Slice J owns the belch and everything it needs is declared and proved.** `ShoveSource` carries `'belch'` today with no caller; `shoveStormTarget` takes the source as its third argument; `tuning.repel.belchShoves` and `belchDistance` are declared in both tables and print on every batch. **Two tests are slice J's to turn**: *reads the belch arm as empty on every tape this build can produce* goes red the moment a belch shoves, and it should be retitled rather than deleted, because what it pins after slice J is that the arm fills. The second `GOLDEN` re-pin is slice J's and it is the last of round two's two.

**For the orchestrator, one reading and no action.** The per-add placement above is the first time the batch could answer where a directed add landed, and across 121 adds the answer is that none is anywhere near an off-limits moment. That closes, for these twelve seeds, the half of ADR 0047 the 48-seed batch could not check. It is twelve runs and not forty-eight, so what it is evidence for is that the instrument works and that nothing obvious is wrong; the step 15 batch is where it answers at size.

## 10. Slice H2: the push is retuned to be watched, and the bell's kill reaches less far than its shove (#126)

One code commit, `d6794f9836`, nine files, 395 insertions and 135 deletions, against the prompt's expected 6 to 15 files.

**What the engine does now.** A toll's push runs half a second instead of a tenth of one, and it throws a body as fast as the cone edge that struck it: the first step is the edge's own advance and every step after it is smaller, so the body leaves with the front rather than being outrun by it. The bell's damage stops where its push does not. A cone is drawn at the reach it pushes to, and inside that a second, shorter reach is where the damage falls to nothing; past it a toll takes nothing at all off a body and emits no damage event, while still marking it struck. So the outer part of every drawn cone is push alone, and what a player watches travel is a living body rather than a corpse's last position.

**What a player meets.** At the rung a run is born on, a toll throws a body 55 field units where it threw 6, and at the top rung 90 where it threw 40. Roughly three struck shamblers in five now survive their toll and travel, where before round two a shambler survived nothing at rung three or above. That is Mark's ruling 4 and his ruling 8 of 2026-09-15, and his read of the deployed build is ticket #126's own done line.

### The decay row, and the JSDoc it carries

`SHOVE_TICKS` is 30 and the fall is still linear. The JSDoc was rewritten rather than edited: the citation moved off `docs/research/push-feel-precedent.md` and onto `docs/research/watched-pushback-duration.md` section 5, option 2, which is Mark's own pick. What it says the figure is derived from: thirty ticks is half a second at sixty ticks a second, and it sits inside the usable band the perception work names rather than at its floor, where 100 milliseconds is only just perceivable, a substantial change wants 200 to 300, duration grows with the distance travelled, and the Blank runs its own knockback at exactly 500 (research section 4). The linear fall stands as slow out, which Smash and Nuclear Throne both ship.

**The readability criterion stays and is restated in the row's own arithmetic.** A fall over thirty ticks covers 15.5 times its first step, so the top rung's 90 units open on 5.8, which is a quarter of a shambler's 22 and leaves every drawn position overlapping the last by most of a body. That is the same criterion the seven-tick figure met by a different route, and it is met more easily now rather than less.

**No visual accompaniment was added**, for the reason slice H gave and the new record repeats: a trail, a squash, a flash or an afterimage during a shove is documented by no source for any of these games, and the honest counterexample in section 4 is a game where something else carries the read, which this one has not got.

### The push column, re-derived, and all five rows

Every row is the throw its own `reach` earns: the cone edge crosses `reach` in `BELL_EXPAND_TICKS`, and a linear fall over `SHOVE_TICKS` from a first step s covers `s * (SHOVE_TICKS + 1) / 2`, so each row is its own reach over 45, times 15.5, in whole units. The arithmetic sits in `BELL_CONE_ROWS`'s own JSDoc with R2 and the research's section 5 cited by path.

| rung | reach | edge per tick | derived | push row | was |
| --- | --- | --- | --- | --- | --- |
| 1 | 160 | 3.56 | 55.1 | **55** | 6 |
| 2 | 183 | 4.07 | 63.0 | **63** | 10 |
| 3 | 207 | 4.60 | 71.3 | **71** | 16 |
| 4 | 231 | 5.13 | 79.6 | **80** | 26 |
| 5 | 261 | 5.80 | 89.9 | **90** | 40 |

**Level five is the check and it lands**: 261 over 45 is 5.8 a tick, and 5.8 spent down to nothing over 30 ticks covers 89.9, which rounds to the research's own 90. `reach`, `headings` and `halfAngle` did not move. A test pins the whole relation across every rung rather than the figures alone, *leaves at the speed the cone's leading edge advances, so its whole travel is the fall from that first step*.

### The damage reach, and the ratio it was set against

`ConeRow` gained `damageReach` beside `reach`, and `proximity` is now computed twice, once against `reach` inside `pushTarget` for the push and once against `damageReach` inside a new `tollDamageAt` for the damage. `reach` kept its name and both its meanings, the push's reach and the reach the cone is drawn at; `StormRenderer` draws off `tollReach`, which reads `row.reach`, so the drawn cone is the push reach with no renderer change at all.

| rung | reach (push, drawn) | damage reach | as a share |
| --- | --- | --- | --- |
| 1 | 160 | **112** | 0.70 |
| 2 | 183 | **128** | 0.70 |
| 3 | 207 | **145** | 0.70 |
| 4 | 231 | **162** | 0.70 |
| 5 | 261 | **183** | 0.70 |

**The ratio is 0.7, the shipped `Blank.prefab` reading, and that is a deliberate pick between the two figures research section 3 carries.** The prefab in the `fedes1to/EtG-source` decompile reads `knockbackRadius: 10` and `pushRadius: 10` against a damage radius of 7, and the record's own correction of 2026-09-15 says plainly that no prefab there carries the 15 the 0.47 reading came from. Picking the figure the shipped source states over the one the record first inferred is the whole of the reason. **The fringe below is what judges it, and at 0.7 it clears the bar**: about three in five struck shamblers travel alive at every rung measured. The figures are whole units like the push column, which also keeps the inclusive edge exact rather than resting on `160 * 0.7` landing on 112 in binary64.

`proximity`'s JSDoc no longer says damage and push "share it deliberately". It states the constraint the code cannot show: the two reaches are two rows, R10 is the ruling, and a falloff shared between them leaves no living body to watch, because the bodies near enough to be pushed hard are exactly the bodies the damage kills. It says nothing about what the code used to do; the two planned tests are what guard the absence.

### What a toll does outside its damage reach, and how it is pinned

**It takes nothing at all, and a zero-damage event is not the way to say so**, because a count a reading sums must never carry a hit that took nothing. `tollDamageAt` returns null past the damage reach and `sweepToll` skips `damageStormTarget` entirely on that answer. **`toll.struck` still marks the body**, before the damage is even asked about, because the one-strike rule is about the toll reaching the body and a shoved body carried back across the leading edge earns no second strike either way.

**The damage reach's own edge is inside it**, `distance > row.damageReach`, the same way `sweepToll`'s ring test is `distance > now`, so a body standing exactly at that edge is damaged and takes the far row.

Three tests pin it: *takes nothing at all off a body outside its damage reach, and marks it struck all the same*, *shoves a body in the outer part of its drawn cone and leaves it alive, because the damage reaches less far than the push*, and *takes exactly two tolls to kill a shambler at the far edge of its damage reach, at the rung a run is born on*.

### `bell.test.ts` re-handed, and one the prompt did not name

**Four measured baselines moved, each re-pinned with its triple in its own comment.** The prompt's item (g) names three kinds of change and lists three tests; the fourth is recorded below as a prompt claim found false against the tree.

- ***carries a body at level five the forty field units the row has always said*** became ***carries a body at level five the ninety field units its row now derives***. What stood: the row is exactly what the shove spends and the push column is still the tuning surface. What it replaced: the forty units held from before round two, which were the record's own arithmetic rather than anything Mark asked for. What it could not have known: that forty units reaches a living body as half a field unit, a fiftieth of a shambler's width (research section 1).
- ***takes exactly two tolls to kill a shambler at the cone's full reach*** became ***at the far edge of its damage reach***. The far row still says what it always said and the count is still two; what moved is which edge the promise is made at. Its helper stopped requiring a death and returns Infinity where the toll takes nothing, which is the honest count for a body outside the damage reach.
- ***deals the rung's near damage at the grave and its far damage at the cone's far edge*** became ***at the far edge of its damage reach***, and ***takes about three tenths of the near edge at eighty percent of the reach*** became ***of the damage reach***. Both are the same falloff read against the reach it actually falls off over, and the second one's figure did not move at all: eight tenths of the damage reach still carries three tenths of the near edge, because the curve is untouched.

**Both `it.fails` tripwires went green and are now ordinary assertions**, keeping their exact titles, so they show in the expected-fail count rather than the test-name diff. *still needs more than one toll at the far edge at the top rung* passes because the drawn cone's far edge is now outside the damage reach entirely, so the count is Infinity rather than one. *leaves survivors from that same curtain at the bell's top rung* passes because the bodies in the outer part of each cone are shoved and live. Neither needed a row moved, and each carries the ruling in its comment.

**The helpers widened with the constant and were checked rather than assumed.** `oneTollAndTravel` and the two loops over `BELL_PERIOD + BELL_EXPAND_TICKS + SHOVE_TICKS` now run 255 ticks instead of 232 and needed no edit. `putStill` was split so a test can stand a body still and keep its own health, which is what the first new promise needs: it is played on a revenant at rung two, where the near damage of 56 leaves its 64 alive to be watched.

### `shove.test.ts`, and a figure in it that was not only a comment

Its R2 block passes its own forty units and survives, with three comments corrected: the header's citation moved to the new record, the linear-decay comment now cites section 4's Smash and Nuclear Throne rather than the old record's Godot tutorial, and the overlap comment names the fall's own opening fraction instead of the old first step of ten. The "carries a body the whole distance it was given" comment no longer claims forty is the level-five push; it says plainly that forty is this file's own figure and that the bell's rows are pinned in `bell.test.ts`.

**Its R3 block did not survive untouched, and that is a prompt claim found false against the tree**, recorded below. The three multi-shove tests passed a spacing of 10, which was wider than a seven-tick shove and is narrower than a thirty-tick one, so the waves overlapped and each replaced the last: one test read 30 travel ticks where it asserted 90, and another lost 41 of the 120 units it asserts. The spacing is now a named local, `WAVES_APART = SHOVE_TICKS + 10`, with a comment saying the belch's real figure is its own row and slice J's, and the expected first wave is derived from `SHOVE_TICKS` rather than written out as seven integers. No assertion was weakened: each still promises exactly what it promised.

**One comment outside both files, and there were two rather than one.** `harnessPolicy.test.ts`'s narrative over `ENDS_ABOVE_THE_BIRTHRIGHT` now names `SHOVE_TICKS` instead of seven ticks, per the prompt, and no assertion moved; that set is still empty. `setPiece.test.ts` carried the same sentence and the prompt did not name it, so it is recorded below.

### The repel reading's window, checked by arithmetic

**One sentence in `Repel`'s own JSDoc**, "up to seven ticks of travel after it", now names `SHOVE_TICKS` and cites `shove.ts`. **The check owed beside it holds**: `BELL_EXPAND_TICKS` 45 plus `SHOVE_TICKS` 30 is 75 against a `BELL_PERIOD` of 180, so every shove still reports inside the toll window that opened it and attribution is unchanged. `READINGS_VERSION` did not move and the arm means exactly what it meant, over a shove that takes longer. **No red arrived in that suite and none should have**, and none did in the batches either: 34 tolls on the hand tape and 131 across the seven-seed sweep, with no throw anywhere.

### `CONTEXT.md`'s Cone entry

It now reads: *One expanding cone a toll throws, pushing what its leading edge crosses and damaging the nearer part of what it crosses, at every level and harder as the level rises (`bell.ts`, `BELL_CONE_ROWS`). Its angles, its reach, the shorter reach its damage falls off over and its push are tuning table rows. It is drawn at the reach it pushes to, so nothing is shoved by something the player cannot see. The Banshee's tear-rings are mob fire and are never a cone. Avoid: arc, ring, shockwave, wave, AOE.*

The Avoid list, the tuning-row sentence and the entry's shape are unchanged. **Its code citation was re-read rather than trusted**: it pointed at `bell.ts:101-107`, which is inside `BELL_CONE_ROWS`'s JSDoc at this tip and not the rows, so it now names the file and the constant, which is what survives an edit. **No other entry moved**, and the Bell entry was read and left: its "bosses take its damage but never its push" is still true, and whether the shove and the impulse earn entries is still the open question slices H and I both left.

### GOLDEN, and the versions

**`GOLDEN` held at `-145039082` and `digest.test.ts` is green.** It should have held and the reason is the one R9 records: `digest.ts`'s canonical scenario runs `levels.bell` at 0 for the whole of its six hundred ticks and scripts `belch: false` on every tick, so no toll fires, nothing calls a shove, and neither the decay row nor a second reach on the bell's rows can reach it. Round two's budget is still exactly two, one spent in slice H and the second still slice J's.

**`WITNESS_VERSION` 8, `READINGS_VERSION` 5 and `FORMAT_VERSION` 4**, each read out of the tree at this tip. No folded field was declared and none was needed: the impulse already carries everything a longer shove needs, which is exactly why slice H declared it. No fault identity was added.

### The fringe, per rung, and it is R10's own ask

**About three struck shamblers in five travel alive, at every rung measured.** A shambler counts as struck on the tick a toll first adds its id to that toll's `struck` set, and as travelling alive when it is still alive at the end of that tick with a shove in flight on it. The instrument is `local/round2/sliceH2-fringe.ts`, scratch and outside version control, driving the recorder's own wandering script through the one execution authority with the skull stream at the birthright rung and territory and wisps at zero, so the bell is the only thing beyond the birthright touching a body.

| rung | tolls | shamblers struck | travelling alive | share | field units each |
| --- | --- | --- | --- | --- | --- |
| 1 | 72 | 60 | 37 | **61.7%** | 9.3 |
| 3 | 131 | 344 | 211 | **61.3%** | 10.4 |
| 5 | 189 | 1083 | 672 | **62.0%** | 12.6 |

Seven seeds each, 77 and 900 to 905, 6000 ticks apiece. Seed 77 alone reads 33.3%, 59.8% and 63.2%; the rung-one figure there is six struck bodies on a run that sealed at 2249 ticks, which is why the sweep was widened rather than reported off one seed. **No rung reads zero**, so R10's trigger for the separate-clocks ruling is not fired.

**What is worth the orchestrator's eye is the distance rather than the share.** A surviving body travels about ten to thirteen field units, half a shambler's width, because the survivors are by construction the bodies out past the damage reach where the push's own falloff is small: at the top rung a body just outside it takes 27 units and one at the drawn edge takes none. The prompt's own note says the 0.47 ratio would make the living fringe roughly twice as wide and twice as fast. **That is a tuning input and not a row to move here**, and it is filed rather than acted on.

### The conditioned tape, beside slice I's

A conditioned tape at every line's rung 5, seed 77, 6000 ticks, the same rig slices H and I both measured on: `outcome: 'verified'`, 101 checkpoints verified, none unreachable, `integrity: 'clean'`, no recorded or readback faults, `readingsVersion` 5.

| | tolls | shoves | field units |
| --- | --- | --- | --- |
| slice I's tip | 33 | 2 | 20.09 |
| **this tip** | **33** | **116** | **1277.82** |

**The same 33 tolls, and the two later figures are what the slice is for.** For scale, the build below slice H, the one-tick teleport, read 230 shoves and 1269.7 units across those same 33 tolls. So the distance is back where it was and the shove count is half it, and the difference is that every one of these 116 is a body that survived its toll and travelled for half a second rather than a body teleported forty units and then killed.

### Replay determinism, and the residue answer

**Two runs on one seed rebuild identically.** Seeds 909 and 910 under `shaky-short`, played twice through `scripts/batch.ts`: same tick counts, 4552 and 2364, tapes of identical length, 42869 and 22385 bytes, **differing in exactly three bytes at offsets 202 to 204 in both**, which is the header's `recordedAt` stamp, and the two `report.json` files differing in exactly one field, `identity.recordedAt`. Every figure is slice H's own to the byte, which is the pass: that rig starts at the birthright, so its bell never tolls and nothing this slice changed can reach it.

**So it was run again on the maxed rig, where the bell tolls at rung five**, seeds 909 and 910 under `shaky-short`, 21885 ticks to a victory and 82227 ticks with no ending. Both verified on replay, and both tapes identical across two plays apart from the same three stamp bytes. That is the "shoves in flight at a checkpoint" half of the record's section 6, which slice H could not obtain.

**The residue answer, and it is the other one.** Slice H measured the in-flight ticks at seed 202, rung 1, over 20000 ticks and found 47 shoves, 249 in-flight ticks and residues mod 60 spanning 27 to 51, never reaching 0, so a tape's own checkpoints could never observe a bell shove. **At thirty ticks the same measurement reads 156 shoves, 2028 in-flight ticks, all 60 residues present and zero reached 56 times.** The blind spot has closed. It closed for two reasons at once and both are this slice's: a shove now spans half the gap between two checkpoints rather than an eighth of it, and R10 leaves far more bodies alive to be carried at all. The instrument is `local/round2/sliceH2-residues.ts`. **Nothing was wrong before and nothing is different now except what the tape can see**: a divergence inside a shove always showed at the next checkpoint through the position it produced, and it is now caught at the checkpoint itself.

### The hand tape

Recorded against the built app through `vite preview` and driven with `playwright-cli`, seed 88 with levels pinned at 5, sealed at 2333 ticks: `outcome: 'verified'`, 39 checkpoints verified, none unreachable, `integrity: 'clean'`, **`buildMismatch` null**, no recorded or readback faults, 30 kills. Its repel channel reads 12 tolls, 15 shoves and 193.64 field units. **`state.refusals` totalled over its own replay: `food` 0, `carriers` 0, `offers` 0.**

**An anomaly chased rather than waved off, and it cost a second recording.** The first hand tape stamped `ee82d23500...-dirty-40125bdb94`, the commit below this slice, while the running build read `d6794f9836`. The cause is neither the format nor the fold: `vite preview` serves `dist/`, and `dist/` had been built before the code commit, so the bundle carried the new code and the old identity string. It verified anyway, 104 checkpoints and integrity clean, which says the served bundle really was this slice's code. It was thrown away regardless and the app was rebuilt at the committed tip and replayed, because a tape stamped against a dirty pre-commit identity is a weaker artifact than one that names its commit. **That is `buildIdentity` working exactly as #82 ruled**, and the lesson worth keeping is narrow: rebuild after the commit, not before, or the preview serves a tape a stale name.

### The rendered check, what it saw and what it still could not

**Two runs in one session against the built app at `d6794f9836`**, through `vite preview` and `playwright-cli`, because a check that only ever plays run one is structurally blind. Run one played by hand to a sealed ending at 2333 ticks with its tape saved from the end screen; run two started from RISE AGAIN and was watched to tick 938 with the field, the bodies, the corpses, the power-ups, the Banshee's tear-ring, the stick and the pause button all drawing. Nothing leaked through the screen pool. **The console carried zero errors across both runs**, and seven warnings, all of them the headless browser's own autoplay and WebGL readpixels families.

**What was obtained, and slice H could not get it: a photograph of a level-five toll's cones drawn on the field with living bodies standing inside them.** Run two at tick 938 shows the five cones open around the grave at most of their reach, the five slits between them visible and one of them dead astern, with shamblers alive inside the outer part of the fan. That is R10's picture: the drawn cone reaches past what the toll kills.

**What could not be obtained, said plainly: a body photographed at successive positions inside one shove.** The headless browser draws this build at 4 to 5 frames a second and the app answers by running fifteen to twenty sim ticks per drawn frame, and **two consecutive screenshots from the driver land 98 ticks apart**, measured off the tick readout three times in a row. Ninety-eight is more than three times a thirty-tick shove, so the sampling cannot reach inside one however long the shove gets; the limit is the driver's own round trip and not the shove's length. A clipped burst inside one browser call did no better: a toll's cone present in one frame was gone by the next. **The property is real in the sim and pinned by tests** (*draws a shoved body at a different place on every tick of its travel*, *stands a shoved body somewhere different on every tick, none of them a body-width from the last*, and now *leaves at the speed the cone's leading edge advances*), and `FieldRenderer` still writes `sprite.position.set(mob.x, mob.y)` straight off the sim with no interpolation. **So this property is human-checkable only, at 60 frames a second on a real device, and it is Mark's own step.**

### The batch, on slice I's own seeds

Seeds 900 to 905 under `steady-far` and the same six under `loose-far`, birthright rig, **12 of 12 verified, none unfinished, no ceiling stop, `readingsVersion` 5 on both**.

| | tolls | shoves | distance |
| --- | --- | --- | --- |
| `steady-far` 900 to 905 | 0, 0, 103, 0, 30, 0 | 0, 0, 196, 0, 65, 0 | 0, 0, 1795.2, 0, 625.9, 0 |
| `loose-far` 900 to 905 | 21, 0, 0, 0, 32, 80 | 39, 0, 0, 0, 87, 111 | 357.9, 0, 0, 0, 903.1, 1011.7 |

Slice I's own table on the same twelve seeds reads 0, 0, 171, 0, 29, 0 tolls and 0, 0, 160.2, 0, 11.7, 0 units under `steady-far`, and 26, 0, 0, 0, 77, 150 tolls and 9.6, 0, 0, 0, 46.0, 38.3 units under `loose-far`. **Read it per toll rather than per run, because these are not the same runs**: a bell that throws bodies fifteen times further changes where corpses land, what the lane meets and how long a run lasts, so the same seed buys its rungs at different times and tolls a different number of times. Per toll, `steady-far` 902 goes from 0.94 field units a toll to 17.4, and `loose-far` 905 from 0.26 to 12.6.

**The belch arm is empty on all twelve**, `belchShoves` 0 and `belchDistance` 0, which is still the cited future waiting for slice J. **All three refusal counters read zero on all twelve** and on the conditioned tape and the hand tape too, so there is no fault and no finding there.

**No cap bound and none moved.** Peak live bodies reached 247 against a `MOB_CAP` of 481 and peak mob fire 71 against a `MOB_FIRE_CAP` of 434. `caps.ts` was opened only to read.

### CodeRabbit, one iteration

**All nine staged files reviewed under `coderabbit review --agent --uncommitted`: zero findings at any severity**, so nothing was applied and nothing declined.

### Verification

`pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/` before the commit. **`pnpm verify` green twice on the committed tree at exit 0**: 146 test files, 2055 passed, 21 expected fail, 2 todo, where slice I left it at 146 files, 2050 passed, 23 and 2. **The two expected fails that went away are the two tripwires**, which are ordinary assertions now.

**The six fences green, each by title**: *src/game imports only from src/game*, *src/dev imports only from src/dev and src/game and src/tape*, *a policy names no weapon line*, *the step fence (ADR 0017)*, *the harness reports and never judges* in all three parts, *orders no reading against a number of its own*, *carries no verdict, because nothing it declares is a yes or a no* and *prints no mean, so every figure it prints keeps its own tail*, and *every reading declares what comparing it means*, plus slice D's sixth, *the cap derivation reads tables and never the stage*. Beside them the core's cycle guard, *carries no value-import cycle beyond the ones written down*, is green with `KNOWN_CORE_CYCLES` still an empty list, and *a golden digest over a short scripted scenario matches the committed constant (ADR 0015)* is green at `-145039082`.

**The test-name diff, against this branch's own tip captured before the first edit with the tree clean: 2073 names to 2076, 7 added and 4 removed.** The 2073 is exactly where slice I left it. **All four removals are retitles of tests that still exist and still assert what they asserted**, each listed in the re-handed block above; the seven added are those four under their new names plus the three new promises.

### Record and prompt claims found false against the tree

**`shove.test.ts`'s R3 block does not survive the retune untouched.** The prompt's item (h) says its R2 and R3 blocks "pass their own figures rather than reading the bell's, so most of the file survives untouched" and that what does not survive is "a sentence in a comment". The R2 block is as described. The R3 block is not: its three tests pass `10` as the spacing between waves, which is narrower than a thirty-tick shove, so `countTowardTheNextShove` re-arms a shove that is still in flight and each wave replaces the last. *shoves again on the tick its row names* read 30 travel ticks against the 90 it asserts, *carries the whole of each shove* read 79.14 units against 120, and *is spent only once its last shove has run* read spent where it asserts not spent. **The intent was followed rather than the letter**: the spacing became a named local derived from `SHOVE_TICKS`, so the tests keep promising what they promised at any duration, and the belch's own figure stays slice J's.

**Two comments outside `shove.test.ts` name seven ticks, not one.** The prompt's item (h) says "one more comment sits outside that file" and names `harnessPolicy.test.ts`. `setPiece.test.ts` carries the same sentence in `WAITING_EATS_MORE`'s own JSDoc, "carry bodies over seven ticks now". Both were corrected to name the constant rather than a figure, and no assertion moved for either.

**A fourth `bell.test.ts` test is re-handed, not three.** The prompt's item (g) names three, and the damage-falloff block's *deals the rung's near damage at the grave and its far damage at the cone's far edge* is a fourth measured baseline whose input moved: at rung five its body stands at 260 units, which is outside the new damage reach, so it took nothing where it asserts the far row. Its sibling *takes about three tenths of the near edge at eighty percent of the reach* is a fifth, by the same cause. Both were re-pinned to the damage reach with their triples, and the second one's figure did not move at all.

### Findings filed rather than fixed

**The Waking's own property moved by a factor of four and a half, and it is a change to the game rather than noise.** `setPiece.test.ts`'s `WAITING_EATS_MORE` went from four seeds of twelve to none at all, and the totals behind it went from the committing hand taking 1.51 times the waiting hand to **413 corpses against 61**, which is 6.8 times. The mechanism is this slice and only this slice: a toll at the rung a run is born on throws a body 55 field units where it threw 6, so the bodies the bell strikes leave their corpses far enough up-field that a grave waiting at the bottom edge no longer has the scroll deliver them inside their freshness. **The property holds and holds harder**, and the assertion is still an equality, so the day any seed goes the other way it fires and says which. **Nothing was done about it**: whether a waiting grave should be left with that little is a tuning question and the tuning step is next. It is the loudest second-order consequence of the retune and it is worth Mark's eye before the sweeps are designed.

**The living fringe is wide but shallow.** Three struck shamblers in five travel, and they travel nine to thirteen field units. The 0.47 ratio would roughly double both the width and the speed of that fringe, and the prompt says so in as many words. Filed as an input to the first tuning sweeps, per Mark's ruling 1 that round two fixes only what is plainly broken.

**`repel.ts`'s `Repel` JSDoc carries a stale sentence this slice did not make stale.** It says a toll that shoved nothing still counts "because push only exists at bell levels 4 and 5", and push has begun at level one since ADR 0036's rows landed. The sentence's point survives, that zero is an honest reading for a toll that shoved nothing, but its reason no longer holds. It was left alone because the slice's item (i) is one sentence and this is not that sentence. **Trigger: whoever next edits that JSDoc.**

### Left for later slices, each named

**Slice J owns the belch and inherits a wave that is now worth counting.** `SHOVE_TICKS` is 30, so three waves plus their spacing is a second and a half of travel rather than a fifth of one, and R3 as superseded rules each wave a full watched push. **One concrete thing it should know**: the spacing it passes has to be at least `SHOVE_TICKS`, or a later wave re-arms a shove still in flight and replaces it rather than following it, which is exactly what reddened `shove.test.ts`'s R3 block here. The module's behaviour is right and was ruled in slice H; what the belch has to do is name a spacing wide enough for the waves to read apart.

**Slice J also inherits a wider window to check.** Three waves at 30 ticks, spaced, is longer than the 75 ticks the bell's shove now needs, so `repel.ts`'s attribution arithmetic has to be redone against `BELCH` cadence rather than `BELL_PERIOD` when the belch emits its own shoves.

**For the orchestrator, one reading and no action.** The tape's checkpoint blind spot over bell shoves, which slice H measured and left as "seen and left, for nobody in particular", is closed by this slice without anything being done about it. Both numbers it rested on moved: the shove is four times longer and far more bodies survive to carry one. Nothing needs doing and the note in section 8 can be read as answered.

## 11. Slice J: the belch becomes a pushback (#124)

One code commit, `eda21401a0`, twenty-two files, 686 insertions and 243 deletions, against the prompt's expected 15 to 35.

**What the engine does now.** A belch takes health off nothing at all, boss included, and leaves no corpse of its own because nothing died. It throws every body inside its reach away from the grave in three shoves the player can count, each one a full watched push of a toll's own length, and a body standing beside the grave ends twenty field units outside the reach the press itself uses. The gas is untouched and still smothers every mob-fire shot on the whole field. A boss and a set piece's source still stand where they are, refused at the seam rather than by a branch in the belch. The eruption draws one front per shove, each lasting exactly as long as its shove, so the picture and the push end together.

**What a player meets.** The belch stops deleting a handful of bodies and starts clearing the ground. Off a real tape a body carried by one press travels 180 field units against a reach of 160, and fourteen of the nineteen bodies two presses caught on seed 902 ended outside it. That is Mark's ruling 3 of 2026-09-15 and ticket #124's own done line is his, not this slice's.

### The wave row, and the reach re-read

`BELCH_SHOVES` is 3, `BELCH_SHOVE_THROW` is 60 field units and `BELCH_SHOVE_SPACING` is 30 ticks, all three in `belch.ts`'s own row with ruling R3 as superseded and the research's section 5 option 2 cited in the JSDoc, and with ruling R4's lever named beside them. **The spacing is a literal 30 rather than `SHOVE_TICKS`**, because `lineAgnosticPolicies.test.ts` binds the belch to the `stormTargets` seam and the belch imports `shove.ts` nowhere. That leaves the two figures in two modules with nothing holding them together, so a test does: *never re-arms a shove still in flight: its spacing is at least one shove's own length*, which is slice H2's own expensive finding turned into a guard.

**`BELCH_BURST_RADIUS` is re-read and never replaced.** It is still 160 and its JSDoc now says what changed: the reach is what it always was and only what happens inside it is different, a kill bounded by it becoming a push bounded by it.

### The killed count, and what it was set against

**`Belched.killed` becomes `Belched.shoved`, the count of bodies one press threw**, and `BelchFire.killed` in the belch cadence reading follows it. A count that is structurally always zero is a lie a reading can still be asked to answer, so leaving it was out.

**What it was set against is dropping the field entirely**, which was the other honest shape and is the one the deletion test points at, because `tuning.repel.belchShoves` already counts belch shoves across a run. **It loses on the event's own stated purpose.** `Belched`'s JSDoc says the counts are what the belch-on-wave instrument reads to tell a press that landed on a curtain from one spent on empty sky, and its next sentence says why the shot count alone cannot: a curtain of unarmed trash cancels nothing while being exactly the target the loaded belch exists for. Dropping the body count would take that ability away silently. And the two figures are not the same figure: `belchShoves` is a run total of impulses that reported travel, so it misses a body killed in flight and cannot tell one press from another, while `shoved` is per press and taken on the tick the press lands.

**`READINGS_VERSION` holds at 5 and the reason was checked rather than assumed.** No batch reading key, figure or reduction moves: `tuning.belchCadence.fires` keeps its name and is reduced by `belchesByBoss`, which reads `fire.tick` alone and was not touched, so no two batches can be subtracted across a changed definition, which is the whole of what the version guards. The field does ride inside `compareRuns`'s `listReading` entries, which are carried whole and paired on nothing.

**`DamageSource` keeps `'belch'` with no producer, deliberately**, so the damage reading keeps the arm it has always had and prints it at zero rather than losing a key and making every pre-amendment batch unmatchable by name. Its JSDoc says so and `mobs.test.ts`'s *is never named by a belch, because a belch damages nothing* is the guard on the absence.

### The four stale sentences, and the three that were actually there

**Three carried "three ten ticks apart" and all three are corrected to say the spacing is the row's**: `stormTargets.ts`'s `shoveStormTarget`, `witness.ts`'s version 8 paragraph, and `witness.test.ts`'s `EXCLUDED` entry for `impulse.source`, whose string is compared as prose and was checked after the edit. **The fourth, `shove.ts`'s `Impulse`, already said "spaced by its own row"**: slice H2 corrected it when it retuned the decay, so the prompt's count of four was one high against the tree. Its sentence was tightened anyway, from naming slice J as an absent caller to naming the belch as a present one, and it gained the one thing H2 learned that nothing else states: a spacing narrower than `SHOVE_TICKS` replaces a shove rather than following it. **`WITNESS_VERSION` stays 8**, because correcting a sentence in a version paragraph is not a move.

### The eruption, and what its reach was set against

**`ERUPTION_TICKS` is derived and never written twice.** It reads `(BELCH_SHOVES - 1) * BELCH_SHOVE_SPACING + SHOVE_TICKS`, which is 90 at today's rows, and `STORM_RENDERER_TRANSIENT_TICKS` registers the same constant and moves with it. `drawEruption` now takes the age in ticks rather than a share of the life, because each front runs on its own clock inside the whole and a single share cannot say which of them is out, and the fronts themselves are a value, `eruptionFrontsAt`, so the agreement between the picture and the push can be asserted rather than only looked at. With the spacing equal to `SHOVE_TICKS` exactly one front is ever live, each starting on the tick the one before it ends.

**The front's reach is unchanged at the field's diagonal, 932.31 units, and that is the authored call.** R3 rules the count and the duration and leaves the reach unruled, and the research's own 2026-09-15 correction drops its "about a third of today's speed" as not following from the figures beside it, so nothing was chased. **What the front pictures is the gas**, which this slice does not touch and which still smothers every shot on the whole field, so a front stopping short of the far corner would stop short of half of what the press does. **R10 is satisfied a fortiori**: a body starts inside the 160-unit reach and ends at most 340 units out, so every front passes over every body it threw and nothing is moved by something the player cannot see. **The Blank is the precedent for a front that runs past its own push**, sweeping to 25 tiles over a knockback ending at 10 (research section 3); here the ratio is 5.8 to the reach and 5.2 to the throw, larger because the Blank's clear front has an edge and this game's gas has none.

**The resulting speed, printed as the prompt asks.** 932.31 units over one shove's thirty ticks is **31.08 units a tick, 3.45 field widths a second**, against today's twenty-tick front at 46.62 a tick and 5.18 widths a second. So the front slows to two thirds of what it was, which moves it toward Gungeon's own 1.67 playfield widths a second rather than away from it.

### GOLDEN, and the versions

**`GOLDEN` held at `-145039082` and the permit went unused, which is what should have happened.** `digest.ts`'s canonical scenario scripts `belch: false` on every one of its six hundred ticks, so `fireBelch` is never called, no body is ever shoved by a press and nothing this slice changed can be reached by it. That is the same paragraph slice H2 was refused a re-pin on, standing. **Round two's budget of two is now spent one and forfeit one**: slice H took the first and this slice needed none. **`WITNESS_VERSION` 8, `READINGS_VERSION` 5 and `FORMAT_VERSION` 4 all hold**, each read out of the tree at the committed tip.

### The measurements

**A body's travel under one belch, counted off a tape.** Seed 902's `steady-far` tape at this tip, replayed through the one playback primitive: two belches at ticks 10524 and 15572, **19 bodies shoved, 2807.74 field units in all, a median and a maximum of exactly 180.00 units a body and a minimum of 27.35**. **Fourteen of the nineteen ended past the 160-unit reach**, and the five short ones are bodies the bound refused or that died mid-flight and reported what they had already been carried. So the sentence the figures were picked for holds on a real tape: three shoves of 60 carry a body 180, and 180 clears 160 by 20.

**Replay determinism with a belch's shoves in flight at a checkpoint, and this one was easy where slice H's was impossible.** A push spans 90 ticks and the recorder writes a checkpoint every 60, so **a belch always crosses at least one checkpoint by arithmetic**: seed 902's two presses have checkpoints at 10560, and at 15600 and 15660, inside their pushes, and the tape verifies at every one of them. Beside that, the seed was played twice through `scripts/batch.ts` under `steady-far` and **the two tapes are identical at 192089 bytes apart from three bytes at offsets 219 to 221**, which is the header's `recordedAt` stamp. The contract's own `shaky-short` pair was run too, seeds 909 and 910, **identical at 42886 and 22402 bytes apart from the same three stamp bytes**.

**A conditioned tape at every line's rung 5**, seed 77, 6000 ticks: `outcome: 'verified'`, **33 tolls, 116 shoves and 1277.82 field units**, which is slice H2's own figure to the digit, and `damage.belch` 0. **The recorder scripts `belch: false` on every tick** (`scripts/record-conditioned.ts:174`), so no belch fires on a conditioned tape at all and its rig was not touched, which is the harness's own row and not this slice's. What the tape says is therefore the useful half: **the belch changed nothing about the bell**.

**A batch at this tip on slice I's own seeds.** Seeds 900 to 905 under `steady-far` and the same six under `loose-far`, birthright rig, **12 of 12 verified, none unfinished, no ceiling stop, `readingsVersion` 5 on both**. The belch arm goes from provably empty to populated:

| | belch shoves | belch distance | tolls | toll shoves |
| --- | --- | --- | --- | --- |
| `steady-far` 900 to 905 | 6, 0, 19, 0, 5, 14 | 860.9, 0, 2807.7, 0, 642.5, 2197.5 | 0, 0, 90, 0, 0, 35 | 0, 0, 122, 0, 0, 121 |
| `loose-far` 900 to 905 | 13, 0, 0, 15, 14, 11 | 1992.9, 0, 0, 2257.9, 2082.3, 1834.3 | 0, 0, 0, 0, 0, 80 | 0, 0, 0, 0, 0, 82 |

**`damage.belch` and `tuning.engagements.fatalBlows.belch` read zero on all twelve**, which is the no-damage ruling proved on real tapes beside the test that states it. **All three refusal counters read zero on all twelve**, and on the conditioned tape, so there is no fault and no finding there. **No cap bound and none moved**; `caps.ts` was opened only to read.

**`belchWorthIt` priced a belch that kills nothing, and the row was not touched.** Its hand spent **1 or 2 belches a run on every one of the twelve**, `ticksAtFull` ran 2 to 1566 and wasted charge 1.10 to 32.85. The ticks-at-full figure splits cleanly into two populations, a handful of ticks on some seeds and around 1500 on others, which is a reading about the hand and is left exactly where it is.

### The rendered check, what it saw and what it could not

**Four runs played to an ending against the built app at `eda21401a0`** through `vite preview` and `playwright-cli`, plus replays of seed 902's tape, because a check that only ever plays run one is structurally blind. The console carried **one error across the whole session, `The AudioContext encountered an error from the audio device`**, which is the headless container having no audio device and the same family as the autoplay warnings slice H2 recorded. Nothing leaked through the screen pool.

**What was obtained, and it is the picture this slice is for.** Replaying seed 902 across its first belch: at **tick 10532**, eight ticks in, the crowd is still pressed against the grave and the field is covered in the cancel scatter of every shot the gas took. At **10576** and again at **10603** a pale eruption front is sweeping out past the grave, the second of them a complete ring most of the way across the field, with the bodies it threw standing in a ring around the grave. At **10681**, past the ninety ticks, there is no front, the ground around the grave is clear, and every body is alive and further out than it was. That is the whole promise in four frames.

**What could not be obtained, said plainly: three fronts photographed in one press.** The driver's own round trip puts consecutive screenshots 74 to 75 ticks apart here, measured off the tick readout, which is slice H2's 98-tick finding at this build's frame rate, and the whole eruption is 90 ticks. **So at most one front per press can be caught**, and two were, in their own separate windows thirty ticks apart. That three are drawn, each for exactly its own shove's length, is asserted instead by *draws as many fronts as the belch throws waves, each lasting as long as its wave*, which walks every tick of the span. **This property is human-checkable at sixty frames a second on a real device and it is Mark's own step.**

**The hand tape does not have a belch in it, and this is the measurement this slice owes and did not get.** Four runs were played to an ending trying for one, and the cause was measured rather than guessed: the tape carries **160 belch commands**, so the Space binding reaches the app exactly as it should, and the reservoir **peaked at 10.83 of a capacity of 30.375, 36 percent, across 116 swallows in 9146 ticks**. Filling it needs roughly 325 swallows at the freshness a blind keyboard hand achieves, which is about 25000 ticks of play, and none of these runs survived past 10738. Two hypotheses were tried and both are written down: at `levels=5` the storm kills far from the grave so corpses go stale before they are swallowed, and at the birthright the run reached **only 30 swallows and 5 percent** before sealing, which is worse. **What this is is a limit of a blind driver at four frames a second and not a fact about the game**, and the belch's own behaviour is measured off recorded tapes instead, above. **The hand tape that was recorded verifies**: seed 404, sealed at 9146 ticks, `outcome: 'verified'`, and `state.refusals` totalled over its own replay reads `food` 0, `carriers` 0, `offers` 0.

### CodeRabbit, one iteration

**All twenty-two staged files reviewed under `coderabbit review --agent --uncommitted`: zero findings at any severity**, so nothing was applied and nothing declined.

### Verification

`pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/` before the commit. **`pnpm verify` green twice on the committed tree at exit 0**: 146 test files, 2063 passed, 21 expected fail, 2 todo, where slice H2 left it at 146 files, 2055 passed, 21 and 2.

**The six fences green, each by title**: *src/game imports only from src/game*, *src/dev imports only from src/dev and src/game and src/tape*, *a policy names no weapon line*, *the step fence (ADR 0017) passes from the execution module alone*, *the harness reports and never judges* in all three of its parts, and *every reading declares what comparing it means*, plus slice D's sixth, *the cap derivation reads tables and never the stage*. Beside them the core's cycle guard, *carries no value-import cycle beyond the ones written down*, is green with `KNOWN_CORE_CYCLES` still empty; *src/game/belch.ts reaches what it can hit through the seam* is green and the belch imports `shove.ts` nowhere; the palette scan is green over the eruption's colour; and *a golden digest over a short scripted scenario matches the committed constant (ADR 0015)* is green at `-145039082`.

**The test-name diff, against this branch's own tip captured before the first edit: 2076 names to 2084, 23 added and 15 removed.** **Every one of the fifteen removals is a test whose subject the amendment took away, and each is replaced rather than dropped.** Six of them are `belch.test.ts`'s kill block, now a shove block of twelve. *kills nothing by itself, so a field of shots and no near mob pays no kill* becomes *kills nothing by itself, so a field of shots and no near body leaves the crowd whole*, with the body's position asserted as well. *names the belch's burst belch* becomes *is never named by a belch, because a belch damages nothing*, and *pays for a carrier its burst killed, on the same tick* becomes *opens no offer and leaves the whole wave standing*: both are the deliberate-absence guards the standard asks for and both fail the day a press damages anything again. `phases.test.ts`'s two boss tests become one, *takes no health off a boss and never moves it, at any distance*, which keeps both halves of ADR 0008's own sentence. The remaining four are retitles: the measure tool's damage-arms test, the cadence reading's fire test, the harness's seed 303 row, and `repel.test.ts`'s empty-arm test, which is the one slice I asked to be retitled rather than deleted and now reads *fills both arms on a real run where a belch is spent beside the tolls*.

### Record and prompt claims found false against the tree

**`shove.ts`'s `Impulse` JSDoc does not say "three ten ticks apart".** The prompt's item (f) names four sentences carrying the old figure and three do. Slice H2 corrected the fourth when it retuned the row, and the tree reads "spaced by its own row" there already. The intent was followed: the other three were corrected, and this one was tightened to name a caller that now exists.

### Findings filed rather than fixed

**At the top bell rungs a belch's own shoves never happen, because the storm kills the bodies first.** Measured over 3000 ticks with fourteen presses on one seed, the belch arm reads **35 shoves at rung 1, 32 at rung 2, 12 at rung 3, 1 at rung 4 and 0 at rung 5**. A body standing inside the belch's 160-unit reach at rung five dies to the storm before the press that just threw it can carry it anywhere, so a run can spend a belch and have the reading say it moved nothing. **It is the same mechanism as slice H's filed finding about the toll**, damage arriving before travel can be watched, reached from the other side, and the two levers the record already names are the same two: separate clocks for damage and travel, and R10's reach split applied to the storm. **Nothing was done about it**: it is a tuning question and the tuning step is next, and it is the reason `repel.test.ts`'s played-run test sits at rung three rather than five, with its own comment saying so.

**The hand now loses carriers the belch used to pay it for.** `harnessPolicy.test.ts`'s seed 303 moved from taking its offer to never reaching it, and the run behind it ends with **thirteen carriers lost and one offer that stood above the top edge, scrolled down and went unswallowed**. The press used to delete every body inside a radius of the grave, carriers included, and a deleted carrier pays an offer where a thrown one walks off the bottom. The baseline is re-measured into a third named set, `STOOD_BUT_NEVER_REACHED`, with both halves asserted so the day 303 takes its offer again the test fires and says so. **It is the stage and the walk rather than the policy**: the hand steers at the offer body nearest the grave exactly as it did.

**Two files that are not this slice's appeared in the worktree mid-run and one measurement carries the mark.** `u11.html` and `u11b.html`, a saved Steam news page, were written to the worktree root at 16:25 by another session and later removed by it. While they were there the tree read dirty, so the conditioned tape's measurement reports `buildMismatch.running` as `eda21401a0...-dirty-43d3fa2fa3` against a recorded identity of the bare commit. **Nothing of another session's was touched**, the tape itself is stamped clean and verifies, and this is recorded so nobody later reads that digest as this slice's own uncommitted work. A second untracked file, `docs/research/boss-hit-tell-and-resisted-push.md`, is in the tree at this slice's exit and is also not this slice's.

### Left for later slices, each named

**Slice K owns the meter and inherits nothing from here but a button that now does something visibly different.** `BelchButton` was not touched and neither was `GameScreen`'s corner.

**Slice L owns the Wall and this is the slice its lever was built for.** The count and the spacing are rows in `belch.ts` with ruling R4 named in their JSDoc, and what they buy is now measured: one press throws a body **180 field units, its whole travel, with a median and a maximum both at exactly that**, and fourteen bodies in nineteen clear the 160-unit reach. **Two things L should know before it measures the curtain.** A body directly above the grave gets no lateral component at all, which R4 names as a risk and which the row is the lever for. And a body a belch catches is thrown its whole 180 only where the field's bound does not refuse part of it, which near the top edge it does, so a curtain measured up-field will read short of the nominal throw.

**Seen and left, for nobody in particular.** `record-conditioned.ts` scripts `belch: false` on every tick, so no conditioned tape can ever carry a belch. That was correct while the belch only killed and is now the reason the belch's own change cannot be seen on the rig the tuning step will use most. Changing it would move a harness row between two builds, which is exactly what the record forbids, so the honest fix is a new named configuration rather than an edit, and that is the tuning step's call and not a slice's.

## 12. Slice J-fix: the belch's push reaches half the field's width and the eruption stops where the push stops (#124)

One code commit, `6caa2fa72b`, five files, 281 insertions and 79 deletions, against the prompt's expected 6 to 15 files.

**What the engine does now.** A press catches what stands within half the field's width of the grave rather than within 160 units of it, which is close to three times the ground. The eruption's three fronts sweep out to exactly that circle and stop, so nothing on screen promises ground the press did not touch. The drawn circle is centred where the belch measures its reach from, and it rides the field down at the scroll speed while it is out, so it keeps sitting over the bodies it caught. Nothing else about the belch moved: no damage of any kind, the gas still field-wide, each body struck once carrying three shoves, a boss and a set piece's source still never moved, and the count, the spacing and the per-shove throw exactly as slice J set them.

### The reach, and the two things it is derived from

**`BELCH_BURST_RADIUS` is now `FIELD_WIDTH / 2`**, imported from `src/game/field.ts`, which is the half-width ruling R11 names and is derived rather than typed. The basis is the width and never the height: the JSDoc says so and says why, that a reach off the height covers about three quarters of the field and is option 2, the whole screen, which Mark declined. What stood from the 160 is in the same JSDoc, that the shove is local rather than field-wide, ADR 0008's own "shove nearby".

**The old dominance paragraph was false as written and is corrected rather than left.** It said the 2026-08-31 tapes read the belch at 35 and 46 percent of all kills and that cutting the scope was the answer. A press that takes no health off anything cannot dominate a kill count at all, so that reason retired with the kill in slice J; the JSDoc now says that, and says what the narrow scope cost instead in the figures below.

**The import trips nothing, and it was run rather than taken on trust.** `src/game imports only from src/game` green, `the core has no import cycle > carries no value-import cycle beyond the ones written down` green with `KNOWN_CORE_CYCLES` still empty (`field.ts` imports nothing), `src/game/belch.ts reaches what it can hit through the seam` green, and `a line's constants are declared in that line's own module > no module outside a line declares a constant carrying that line name` green.

### The eruption: one circle, one centre, and a ring that rides the field

**`ERUPTION_REACH` reads `BELCH_BURST_RADIUS` and the diagonal derivation is deleted**, not left unused, so the renderer imports the belch's reach beside the two rows `ERUPTION_TICKS` already reads. Its JSDoc's argument is reversed to R11's: the front and the push name one circle because here the push is the payload, and the Blank's shipped 2.5 ratio is named as the precedent declined, with the reason, that in Gungeon the bullets are the Blank's payload and its front pictures the cancel. The front count and the per-front duration did not move.

**Two renderer bugs, both fixed, and the sim is untouched by both.** `erupt` anchored the ring at `run.grave.y - run.grave.size`, the mouth, while `insideBurst` measures from the grave's centre, so the drawn circle and the caught circle sat one grave-size apart; it now anchors at `run.grave.y`. `splashed` and `originOf` still anchor at the mouth, because the splash is a spray out of the mouth and is not this circle. And `syncBurst` re-positioned a burst from its frozen born-tick point every frame while every body it caught drifted with the field, so the ring was left behind by its own crowd; `Burst` now carries a `drift` in field units a tick, `SCROLL_SPEED` for the eruption and zero for the splash, and `syncBurst` adds `age * drift` to the sprite's y. **This is the renderer's answer to R11's fourth ruling** and it is why `step.ts` was not opened.

### The measurements

**The headline, off `local/belch-play.ts` at the tip before the first edit and again at the commit, unedited in between.** Eleven presses a seed under the diving bot, the median share of live bodies caught per press:

| seed | before | after | bodies caught across the eleven presses |
| --- | --- | --- | --- |
| 902 | 10.8% | **43.5%**, 4.04x | 64 to 265 |
| 17 | 16.1% | **35.0%**, 2.17x | 82 to 211 |
| 5150 | 12.3% | **48.9%**, 3.96x | 90 to 280 |

The before reproduces session 26 to the digit, 0 to 21 caught of 30 to 93 alive, typically 4 to 14. **The pass line was at least double on all three seeds and all three cleared it**, 17 by the narrowest margin.

**The second headline misses its pass line and this is reported rather than tuned.** `local/belch-reach.ts`, a still grave on seed 902 sealing at 1616 ticks: nothing at all inside the reach on **37.4 percent** of its ticks, against session 26's 58.0 percent reproduced exactly at the old reach. The pass line was below half of 58, which is 29.0, so it misses by 8.4 points. **What is inside that number was measured rather than guessed** (`local/round2/jfix-reach-split.ts`, which counts both reaches in one pass because a script that never presses runs the same sim under either): **7.5 percent of those ticks have no body alive on the field at all**, which no reach can do anything about, and the rest, bodies alive with none in reach, falls from **50.6 to 29.9 percent**. Read the other way round, the ticks where a press would land go from 42.0 to 62.6 percent. **Why it is sub-linear:** the circle's on-field area goes from 19.5 to 46.8 percent of the field, 2.4x, but the grave stands at 0.8 of the field's height and the bodies enter at the top, so a circle grown around the grave buys less than its own area. **This is a finding and not a row to move**: R11 rules the basis and Mark declined the whole screen.

**A body's net travel, up the field and down it, per the fourth ruling.** `scrollField` adds `SCROLL_SPEED` to a shoved body too, so over one press's 90 ticks the field carries every body 57.0 units down. A body thrown straight up nets **123.0** and one thrown straight down nets **237.0**, against the row's nominal 180. Both are asserted at the seam by *carries the field's own drift as well, so a throw up the field nets less than a throw down it*, which runs whole ticks through `executeTick` so no later slice can quietly exempt one line. **`step.ts` was not touched** and neither was the bell.

**The front's new speed, printed both ways.** 270 units over one shove's 30 ticks is **9.0 units a tick, 1.00 field widths a second**, against slice J's 31.08 and 3.45 and against Enter the Gungeon's Blank at 1.67. **It reads as gas spreading and not as a blast**, which is the third ruling's own expected answer and is what the screenshots show. **No lever was moved**: `ERUPTION_STROKE` is still 14 and the per-front fade is untouched, because a front stopping exactly where the push stops reads correctly on its own at this size and moving a lever to make a correct picture louder is a tuning call with no measurement behind it. **This is not filed as a finding, because Mark ruled it while this slice was in flight.** Ruling R12 of 2026-09-16 says the eruption may not read as a shockwave and that a belch of guts travels at the speed of what it is, so the slower front is the goal rather than a cost to watch, and the game design gate's own worry about a creeping front is answered and closed rather than carried. R12 lands as its own slice after this one, and this slice did not touch its scope.

**Off a real tape at this tip**, seed 902 under `steady-far`, two presses at ticks 10524 and 15572, the same two ticks slice J measured: **40 bodies shoved against slice J's 19, 6360.00 field units against 2807.74**, per body a median and a maximum of exactly **180.00** and a minimum of 27.35. **None of the forty cleared the reach**, which is R11's own arithmetic rather than a regression: 180 is less than 270 and the fifth ruling withdrew the clear-the-reach sentence rather than repairing it.

**A batch at this tip**, seeds 900 to 905 under `steady-far` and the same six under `loose-far`, birthright rig, **12 of 12 verified, none unfinished, no ceiling stop, `readingsVersion` 5 on both, build identity `6caa2fa72b` clean**. The belch arm against slice J's own table:

| | belch shoves, slice J | belch shoves, here |
| --- | --- | --- |
| `steady-far` 900 to 905 | 6, 0, 19, 0, 5, 14 | **20, 13, 40, 12, 17, 40** |
| `loose-far` 900 to 905 | 13, 0, 0, 15, 14, 11 | **32, 0, 10, 37, 32, 40** |

Totals go from 44 to 142 and from 53 to 151, both close to the area's own 2.85x. **`damage.belch` and `tuning.engagements.fatalBlows.belch` read zero on all twelve** and **all three refusal counters read zero on all twelve**. **`belchWorthIt` priced a belch whose scope just grew and the row was not touched**: its hand still spends 1 or 2 belches a run on every one of the twelve, and `ticksAtFull` still splits into the same two populations, a handful of ticks on some seeds and around 1500 on others.

**Replay determinism at this tip.** `shaky-short` seeds 909 and 910 played twice through `scripts/batch.ts`: identical tick counts, 4552 and 2364, identical byte lengths, 42869 and 22385, and **identical byte for byte apart from three bytes of the header's own recorded-at stamp**. All four tapes verify off their own headers, which is the witness checked at every checkpoint.

### GOLDEN, and the three versions

**`GOLDEN` held at `-145039082` and no re-pin was taken, which is what had to happen: round two's budget of two is spent, slice H took one and slice J forfeit the other.** Two facts carry it and both were read out of the tree rather than assumed. `digest.ts:271` scripts `belch: false` on every one of the canonical scenario's six hundred ticks, so `fireBelch` is never called and nothing this slice changed can be reached. And `levels.bell` is 0 for the whole scenario, so no toll fires either, which is the same fact ruling R9 used to deny slice H2 a re-pin. `digest.test.ts`'s *a golden digest over a short scripted scenario matches the committed constant (ADR 0015)* is green.

**`WITNESS_VERSION` 8, `READINGS_VERSION` 5 and `FORMAT_VERSION` 4 all hold**, each read out of the tree at the committed tip. The reach is a magnitude and no reading's meaning moved.

### The tests, and the three places the withdrawn sentence was pinned

**The prompt said two and there are three.** Slice J's sentence that three shoves carry a body clear of the belch's own reach was pinned near `belch.test.ts`'s lines 302 and 360 as the prompt says, and a third time inside *strikes each body once, and a body that walks in afterwards takes nothing*, which asserted the caught body ended past the reach. **All three are re-expressed to what now holds and none is deleted**, with the reason in a comment beside each:

- *carries a body standing beside the grave clear of the belch's own reach* becomes ***carries a body standing beside the grave the whole of what its three waves throw***, asserting the travel against `WHOLE_THROW` rather than against the reach.
- *still owes its later waves to a body its first wave carried out of reach* becomes ***still owes its later waves to a body its first wave already carried***, and its loose "greater than the reach" becomes the exact first throw.
- *strikes each body once* keeps its title, because the strike-once rule is its subject and the reach was never what it was for; its assertion now says the caught body took the whole press and the latecomer took none of it.

**Five tests added.** *shoves what stands inside the reach the row names and leaves what stands outside it* (written first, red first, both bodies expressed against the row and the far one asserted to have entered so the refusal is the reach's and not the entry gate's), *the reach is half the field's width, read off the field rather than written down*, *carries the field's own drift as well, so a throw up the field nets less than a throw down it*, *stops every front at the reach the belch shoves over, and never past it*, and *drifts the eruption down the field, so it still covers the bodies it caught when it ends*. One renderer test is retitled: *puts both at the grave's mouth, which is where they come out of* becomes ***centres the eruption where the belch measures its reach from, and leaves the splash at the mouth***, which is the two anchors asserted apart because they are now two anchors.

**One test in the four-directions case needed its fixture moved rather than its promise weakened.** *reaches the same distance in every direction from the grave* places a body at `NEAR` in each of four directions, and `NEAR` is derived from the reach, so at the new reach the body thrown down the field runs into the bottom bound and loses three units of its throw. The grave is moved to the middle of the field for that case with a comment saying why: that the bound refuses a throw is `mobs.ts`'s own promise, and what this test is for is that the reach and the throw are the same in every direction when nothing refuses them.

**Two measured per-seed baselines in `harnessPolicy.test.ts` moved and both are re-measured with the reason beside them**, which is the contract's rule for a measured baseline rather than a test weakened. `NEVER_PAID_AT_THE_BIRTHRIGHT` goes from `[202]` to empty, because the wider press keeps this hand's runs alive long enough to cross a carrier on 202 where it never used to; 202 joins `STOOD_BUT_NEVER_REACHED` beside 303, opening exactly one offer and taking none of it. `ENDS_ABOVE_THE_BIRTHRIGHT` goes from empty to `[101]`, **the largest move that set has made**: 101 now takes five of the six offers it is paid, ends holding all four lines above the birthright, and is the one seed of the five still unsealed when the stage's own budget runs out, at 27409 ticks. That is ticket #124's argument read off the hand: a press that clears the ground keeps the grave alive long enough to spend what it is paid.

### The rendered check, what it saw and what it could not

**Against the built app at `6caa2fa72b`** through `vite preview` and `playwright-cli`: seed 902's own tape served to `#/replay?tape=&at=`, then two live runs, the second taken from RISE AGAIN rather than from a fresh load, because a check that only ever plays run one cannot see a pooled sprite leaking between runs. Run one sealed at 8589 ticks on seed 404; run two was watched to tick 1108 with the field, the corpses, the skulls, a level-five toll's cones and the belch button all rendering and nothing left over from run one.

**What was obtained, and it is the picture this slice is for.** At **tick 10505**, nineteen ticks before the press, the grave is up under the Banshee and the crowd is scattered across the field. At **tick 10607**, 83 ticks into the eruption and inside its third front, there is **one khaki ring, unmistakably local, a little under half the field across, with bodies standing inside it and bodies standing outside it**, and the far corners of the field are untouched. That ring's centre sits about 101 field units below where the grave stood at tick 10505, which reconciles: **about 51 of that is the grave's own dive between 10505 and the press and about 52 is the eruption's drift over 83 ticks**, so the drift is visible on screen and not only in a test. At **tick 10625**, eleven ticks past the span, there is no ring, the ground around the grave is clear and the bodies are alive and further out. The colour is `belchEruption`'s own `0xb5ac8e` and not the bell's `0x9faebd`, so what is in the frame is the eruption.

**What could not be obtained, said plainly: three fronts photographed inside one press.** The driver's round trip puts consecutive frames **120 ticks apart** here, worse than slice J's 74 and worse than slice H's own finding, and the whole eruption is 90 ticks, **so at most one front per press can ever be caught**. That three are drawn, each for exactly its own shove's length and each stopping at the same circle, is asserted instead by *draws as many fronts as the belch throws waves, each lasting as long as its wave* and *stops every front at the reach the belch shoves over, and never past it*, both of which walk every tick of the span. **Whether three fronts read as three at sixty frames a second on a real device is human-checkable only, and it is Mark's own step.**

**The hand tape verifies at this tip and does not have a belch in it, and the cause is measured rather than guessed.** Seed 404 with `?size=67.5&levels=5`, sealed at 8589 ticks, recorded against the built app through `vite preview` and driven with `playwright-cli`, `outcome: 'verified'`, **recorded identity `6caa2fa72b` clean**. Its `buildMismatch.running` reads `6caa2fa72b...-dirty-3dde4aef80`, which is this note being uncommitted in the worktree at the moment the measurement ran and not any work of another session's: the tape itself is stamped clean and verifies. **All three `state.refusals` counters read zero**: `food` 0, `carriers` 0, `offers` 0.

**How the reservoir was chased.** The tape carries **57 belch commands**, so the Space binding reaches the app and every press was spent asking. `?size=` was pinned at ADR 0003's ceiling of 67.5 beside `?levels=5`, on the reasoning that a mouth two and a half times wider swallows more corpses per length of path. **It did not move the peak at all**: this run reached **7.28 of a capacity of 30.375, 24.0 percent, across 103 swallows**, where slice J reached 36 percent across 116 swallows at the starting size. A first attempt on seed 902 at the same pins sealed at 9645 ticks with 112 swallows and a 23.7 percent peak.

**Why, measured from the other side, and this is the useful half.** `RESERVOIR_CAPACITY` is `FEAST_PAYOUT` exactly, and a feast is spawned when a boss phase breaks (`bosses/phases.ts:171`), so the route to a full reservoir is a broken phase eaten rather than trash accumulated over a run. **Across all twelve batch tapes at this tip the bot's own first belch lands between ticks 10097 and 15534, eleven of the twelve between 10097 and 11519.** A blind keyboard driver seals at 8589 and at 9645. **So a hand tape misses its first belch by roughly five hundred to two thousand ticks of survival**, which is a limit of a driver that cannot see the field at four frames a second and not a fact about the belch. The belch's own behaviour is measured off recorded tapes instead, above, where the same two press ticks slice J measured are measured again.

**One console error was new and it was chased rather than written off.** The session carried two: `The AudioContext encountered an error from the audio device`, which is the headless container having no audio device and which slice J recorded, and `[Loader.load] Failed to load .../assets/main/ui.webp.json. TypeError: Failed to fetch`, which slice J did not. **It is the driver and not the build.** The network log shows `net::ERR_ABORTED` on the whole `/assets/main/*` batch at once, the atlas, the logo and all eight sounds, which is the asset bundle's background load being cancelled by a navigation; the file serves 200 to `curl` and is present in `dist/`. **Loaded once and left alone, the page reports zero errors**, which is the check that settles it. Nothing leaked through the screen pool in either run.

### CodeRabbit, one iteration

**All five staged files reviewed under `coderabbit review --agent --uncommitted`: zero findings at any severity**, so nothing was applied and nothing declined.

### Verification

`pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/` before the commit. **`pnpm verify` green twice on the committed tree at exit 0**: 146 test files, 2068 passed, 21 expected fail, 2 todo, where slice J left it at 146 files, 2063 passed, 21 and 2.

**The six fences green, each by title**: *src/game imports only from src/game*, *src/dev imports only from src/dev and src/game and src/tape*, *a policy names no weapon line*, *the step fence (ADR 0017) passes from the execution module alone*, *the harness reports and never judges* in all three of its parts, and *every reading declares what comparing it means*, plus slice D's sixth, *the cap derivation reads tables and never the stage*. Beside them: *carries no value-import cycle beyond the ones written down* green with `KNOWN_CORE_CYCLES` empty, *src/game/belch.ts reaches what it can hit through the seam* green, the palette scan green over the eruption's colour in all of its parts, and the golden digest green at `-145039082`.

**The test-name diff, against this branch's own tip captured before the first edit: 2084 names to 2089, 9 added and 4 removed.** **Every one of the four removals has its replacement in the nine**: the two clear-the-reach retitles, the renderer's two-anchors retitle, and `harnessPolicy.test.ts`'s seed 303 row, whose title is generated from which set the seed sits in and so followed 202 into `STOOD_BUT_NEVER_REACHED`. Against the step 4 baseline the figures are 1834 to 2089, 511 added and 256 removed.

### Record and prompt claims found false against the tree

**The withdrawn clear-the-reach sentence is pinned in three places in `belch.test.ts` and not two.** The prompt's fifth ruling names lines 302 and 360. A third assertion, inside *strikes each body once, and a body that walks in afterwards takes nothing*, said the caught body ended past the reach and went red at the new figure. The intent was followed: it is re-expressed rather than deleted, and it keeps its own title because its subject is the strike-once rule.

**Nothing else in the prompt or in either record failed against the tree.** All five named inputs verified present by name before the first edit.

### Left for later slices, each named

**Ruling R12's own slice owns the front's curve and its body, and it was ruled while this slice was in flight.** It lands after this one and nothing here anticipates it. What it inherits is `eruptionFrontsAt`, now a value returning one front per shove with each radius a linear share of `BELCH_BURST_RADIUS`, and the two tests that walk every tick of the span, so the curve can be changed underneath them and the count, the duration and the stopping point stay pinned. `ERUPTION_STROKE` and the per-front fade are untouched and are its levers.

**Slice K owns the meter and inherits nothing from here.** `BelchButton` and `GameScreen` were not opened.

**Slice L owns the Wall and its lever just got more expensive to reason about.** The reach is now 270 against a throw of 180, so **a body a press catches is no longer carried clear of the press's own circle**, and a curtain measured against the reach will read differently from one measured against the throw. The count and the spacing in `belch.ts` are still R4's named lever and they did not move. The two things slice J left for L still stand: a body directly above the grave gets no lateral component, and a body near the top edge is thrown less than the nominal because the bound refuses part of it.

**Filed for Mark's read, not applied.** The still-grave empty-reach share misses its pass line at 37.4 percent against 29.0, decomposed above. Nothing was tuned for it.

**Seen and left, for nobody in particular.** The old front swept the field's diagonal and was the only picture the gas had; stopped at the push reach it pictures only the push, so a press against a curtain of unarmed bodies now draws a local ring and nothing else. That is already the design record's section 7, filed as a tuning-step input by the game design gate, and no slice acts on it.

## 13. Slice K: the meter fills and changes corner (#127)

One code commit, `538fd21a9b`, six files, 406 insertions and 82 deletions, against the prompt's expected 4 to 10 files.

**What a player meets now.** The belch's control is a grey ring in the bottom-left corner with a charge arc filling it clockwise from the top, so a glance says roughly how close the belch is to ready without reading anything. At a full reservoir the arc is a closed circle in the grave's own amber and it pulses. Nothing about it gets brighter as it fills, and the steering thumb no longer shares its corner. No simulation rule moved at all: `src/game` was not opened.

### The fill's shape

**The ring became a track and an arc, and the arc is the charge.** The unfilled ring stays where it was, a full circle at `RING_STROKE` 5 in `hudInk`. Over it the charge draws as an arc at `CHARGE_STROKE` 9, starting at top centre and sweeping clockwise, both strokes inset by half their own width so the widest of them ends exactly on the button's diameter. **The arc is wider than the track on purpose**, and that is the whole grayscale reading: the two colours are held at one luma, so they measure APCA Lc 0.00 against each other and only width and length survive the hue being removed.

**The quantum is Territory's own construction, read out of `GraveRenderer` rather than invented.** `CHARGE_SEGMENTS` is 64 and the arc is rebuilt only when the charge crosses a segment, which keeps the redraw rate at the arc's visible resolution rather than the clock's. The alpha is set every frame, which is free, and the geometry is not.

**Two pixi facts were found by a red test rather than by reading, and both are written into the code.** An arc with a current point already set draws a line to its own start, so the arc following the track circle ran a chord back across the ring and pushed the control's footprint from 108 units to **112.21**; a `moveTo` to the arc's own start is what closes it. And a miter join at a sampled vertex bulges past the stroke's envelope, leaving the footprint at 108.02 rather than 108.00, so the arc is stroked with round caps and joins, which is `GraveRenderer.redrawArc`'s own recorded reason for the same choice. The footprint is now exactly 108 by 108 at every charge, asserted at seven of them rather than only at full.

### The colour, and what it is set against

**`PALETTE.reservoirCharge`, `0x76b7d7`, luma 67.25, hue 199.79, saturation 0.451.** It is declared beside `hudInk` and `hudDim` under the readouts that draw over the field, inside the live-field list and under the ceiling, and it is **not** on `palette.test.ts`'s `NOT_SPRITES` list, because it clears the full sprite-separation pair check on its own and an exemption it does not need would be an exemption nobody could see it did not need.

**The precedent is section 4 of `docs/research/push-feel-precedent.md`, and it is the form rather than the hex.** Brawl Stars shows the Super as "a gray circular meter with a slim yellow ring", a coloured fill on a neutral track, and Genshin fills the burst icon with the ability's own colour and announces ready with a glow and a pulse. The track is therefore the readouts' own near-neutral `hudInk` and the charge is a colour of its own. **The ready tell keeps the amber it already had**, `graveGlow`, because in this palette amber is treasure and the grave's glow, which is what a thing you can spend looks like, and because a state Mark has already played should not change under a slice about the state he has not.

**The three colours sit inside 0.02 luma of each other: `hudInk` 67.23, `reservoirCharge` 67.25, `graveGlow` 67.25.** That is the point rather than a coincidence, and a test holds it, *holds its three colours at one value, so no state of it is brighter than another*. Neither the charge nor the ready tell can announce by getting brighter whatever the drawing code does, which is the channel ADR 0054's reading of ADR 0014 closes.

**The hue was forced, the same way `territory`'s and `territoryGround`'s were.** Fire's 20-degree exclusion closes 20 to 39, amber at 41 is the ready tell itself, corpse and feast hold the warm bone, the green family from 76 to 155 is the mobs and the moss, purple is banned outright, and 237.5 is claimed ground. What is left at this luma is the grave's own cold family, 175 to 220, where the readouts already live. **199.79 is the one spot in it with room for real chroma**: it clears `wisp` at 172.24 by 27.5 hue degrees, `bellRing` at 210 on saturation by 0.292 against a 0.25 minimum, and the track by 0.406. Measured: APCA Lc 58.35 against night, and 37.25 luma above the Vigil's ground tint nine hue degrees away.

**One other colour's comment went stale on the same commit and was corrected rather than left.** `standInVigilTint`'s derivation said hue 175 to 205 "is entirely empty and it still is". It now says that of the sprites it still is, names `reservoirCharge` at 199.79 as a readout 37.25 luma above it, and says that neither of the Vigil's two named clearances moves. `palette.test.ts`'s own comment on that test carried the same claim and carries the corrected one now. **This is `docs/agents/lessons.md`'s own rule followed: after adding a declared value, grep the record for any count that ranges over its category.**

### The alpha step out, the pulse kept

**`QUIET_ALPHA` 0.32 and `ringAlpha`'s two-state shape are gone**, and `LIT_PULSE_DEPTH` 0.22 and `LIT_PULSE_TICKS` 40 are untouched. What replaced them is `chargeFace(charge, tick)`, a pure function returning the filled share of a turn, the ink and the alpha, testable with no renderer, which is what the old tests stood on. **Below a full reservoir the alpha is exactly 1 at every charge**, so the charge moves on area alone; at a full one the ink becomes `graveGlow` and the alpha pulses between 0.78 and 1. The clamp lives in the function rather than at the caller, because the reservoir's own fill can exceed its capacity by one ulp and a fraction a hair over one has to read as ready rather than wrap.

**Cited to ADR 0054**, whose reading of ADR 0014 binds the HUD to announce by count, by shape or by subtraction and never by getting brighter. The fill announces by area, which is the compliant channel, and the pulse is motion rather than a brightness comparison the player has to make against a remembered state.

### The corner, and the two rects re-derived

**One `position.set` in `GameScreen.resize`**, from `READOUT_RESERVE.margin` exactly as the pause button is, so the two cannot drift apart and the non-overlap rule stays one rule in one place. The comment above it keeps what the old one said about sitting over the field, Mark's 2026-08-22 ruling that the field never pays width for a readout, and adds his 2026-09-15 ruling of the corner and the fact that the reserve claims the two top corners only, which is why the move costs `fitField` nothing. **`READOUT_RESERVE`'s three figures, `fitField` and the 540 by 760 fit are untouched.**

**The old assertion was wrong rather than stale and was re-derived.** On the right the button's only neighbour was the pause button; on the left the corner it has to clear is the readout stack's own column. The test now builds the two reserved corners exactly as `layout.ts`'s `coversAReadout` builds them, both starting at the stage's top edge and 260 by 120, plus the pause button's own 132 by 68 rect, and asserts the belch rect overlaps none of the three at every viewport, with the same half-open convention `layout.ts` uses. It also asserts the rect's left edge is the margin and its bottom edge is the margin up from the stage's bottom, so a rect that drifted would fail rather than pass by overlapping nothing.

**A derived rect is not a reading of the code, so the real position is asserted too**, in `layering.test.ts` beside the pause button's own assertion, at a desktop and a phone viewport: *puts the belch's control in the bottom-left corner, inset by the same margin*, off a real `GameScreen` after a real `resize`.

### The target floor, at every viewport

**Held, and it is the existing assertion rather than a new one**: `BELCH_SIZE` 108 against 44 CSS pixels at phone, tablet and desktop, which measure **78.0, 108.0 and 108.0 CSS pixels**. A narrow 320 by 568 viewport, measured but not asserted because it is not in `VIEWPORTS`, gives 64.0.

**A second floor was added because this slice is what could break it**: *carries the same target at an empty reservoir as at a full one*. The hit area is now built once in the constructor rather than inside the drawing, so no state of the charge can reach it at all, and the test presses five points at three charges to say so.

### The rendered check, what it saw and what it could not

**Against the built app at this tip** through `vite preview` and `playwright-cli`, phone 390 by 844 and desktop 1440 by 900, **seven runs across two seeds**, every run started from the title or from RISE AGAIN, **zero console errors and zero warnings** over the whole session.

**Empty, read twice and on two different runs.** At tick 254 of run one and at tick 67 of run two, taken from RISE AGAIN rather than a fresh load, the control is a grey ring with the charge colour on the inner mark and no arc at all. **Run two mattering is the point**: a check that only ever plays run one is structurally blind, and the arc drawn partway through run one did not survive into run two.

**Partway, read at five charges.** A bare tick of arc at tick 3140 of one run, about a tenth at tick 5707, about a third at ticks 3765 and 3981, and about two fifths at tick 6552. In every one the arc starts at top centre, sweeps clockwise, and is visibly thicker than the ring it lies on.

**Desktop, at tick 2881 of run two.** The control sits in the bottom-left corner of the stage, clear of the letterboxed field, clear of the corner readout stack above it and the whole width of the stage away from the pause button, with the arc about a fifth round.

**What could not be obtained, said plainly: a full reservoir.** Seven runs, the best of them 11498 ticks, peaked at roughly two fifths of capacity. **This is the driver and not the build, and it is the same limit slice J-fix measured and wrote down**: `RESERVOIR_CAPACITY` is `FEAST_PAYOUT` exactly and a feast is shed when a boss phase breaks, so the route to full is a broken phase eaten rather than trash accumulated, and across J-fix's twelve batch tapes the bot's own first belch lands between ticks 10097 and 15534 while a blind keyboard or mouse driver at 4 to 6 frames a second seals between 6564 and 11498. Pins were spent trying: `?size=67.5` at ADR 0003's ceiling, `?levels=5`, `?signal=1` locking the pressure signal full, a still grave, keyboard sweeps and a 1:1 mouse serpentine over the whole field. **So the ready state's picture is pinned by test rather than by a screenshot**, by *changes colour and pulses at a full reservoir and at nothing below one* and *is a ring rather than a filled disc* at charge 1, and **whether a closed amber pulsing ring reads as ready at sixty frames a second is Mark's own step.**

### The grayscale read, measured off the pixels rather than eyeballed

**The full-reservoir frame was not available, so the read was taken at a two-fifths charge**, which is where the question actually bites: whether the filled share can be told from the unfilled one with the hue gone. `filter: grayscale(1)` on the page, a 120 by 114 crop of the corner, and the ring walked on twelve rays from its own centre.

**In colour, the two bands render at exactly their declared values.** The arc measures `rgb(118,183,215)`, luma **67.25**, on every ray from 0 to 4 o'clock; the track measures `rgb(168,172,176)`, luma **67.23**, on every ray from 5 to 11. The boundary between them sits between 4 and 5 o'clock, which is the charge itself. **0.02 luma apart, so in grayscale they are one value and the colour contributes nothing**, which is the honest limit of a hue-separated design and is exactly what the band ceiling forces.

**What carries the reading in grayscale is width, and it measures about double.** The filled band runs **6.25 to 7.50 CSS pixels** and the bare track **3.00 to 4.00**, at the phone viewport where the stage is smallest. The arc is still legible with the hue removed, by area rather than by value, which is what the design record's own test sentence promises.

### What did not move, each read out of the tree at the committed tip

**`WITNESS_VERSION` 8** (`src/game/witness.ts:108`), **`FORMAT_VERSION` 4** (`src/tape/wireCodes.ts:50`), **`READINGS_VERSION` 5** (`src/dev/readingsVersion.ts:87`) and **`GOLDEN`'s checksum `-145039082`** (`src/dev/digest.ts:443`). **None of the four files is in the commit**, and the commit's six files are all under `src/app`. No `GOLDEN` re-pin was taken and none was permitted.

**No tape, no batch and no determinism run is owed, and the claim was checked rather than assumed.** Nothing under `src/game`, `src/tape`, `src/dev` or `src/input` is in the commit, no rule the simulation runs was touched, and the one sim value the slice reads, `run.reservoir / RESERVOIR_CAPACITY`, is the expression `GameScreen` already handed the grave.

**Also untouched:** the layering, with the layering test green and nothing drawing above `mobFire`; the claimed-pointer field and the steer model's release path, with *claims the pointer that pressed it, so a thumb that rolls does not steer* and *drops every claim on release()* both green and unchanged; the template's shared `Button` in `src/app/ui`, which is #38's; and every ADR, none filed and none amended.

### Verification

`pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/` before the commit. **`pnpm verify` green twice on the committed tree at exit 0**: 146 test files, 2075 passed, 21 expected fail, 2 todo, where slice J-fix left it at 146 files, 2068 passed, 21 and 2.

**The six fences green, each by title**: *src/game imports only from src/game*, *src/dev imports only from src/dev and src/game and src/tape*, *a policy names no weapon line*, *the step fence (ADR 0017) passes from the execution module alone*, *the harness reports and never judges* in all three of its parts, and *every reading declares what comparing it means*, plus slice D's sixth, *the cap derivation reads tables and never the stage*. Beside them: *every test file imports only from inside its parent folder's subtree* green, *carries no value-import cycle beyond the ones written down* green, *a golden digest over a short scripted scenario matches the committed constant (ADR 0015)* green at `-145039082`, and **the palette scan green over the new colour in all of its parts**, including *puts every other field colour at or below FIELD_LUMA_CEILING* at luma 67.25, *keeps every non-fire hue at least 20 degrees off every mob-fire body hue* at a minimum gap of 164.23, *keeps every pair of field sprites apart on luma, hue or saturation*, *declares no brown*, and *reaches no MENU colour, writes no colour literal, and sets no blendMode*.

**The test-name diff, against this branch's own tip captured before the first edit: 2089 names to 2096, 11 added and 4 removed.** **Every one of the four removals has its replacement in the eleven.** *reads quiet below a full reservoir and lit at full* and *pulses at full, so full is a state rather than the top of a ramp* were `ringAlpha`'s two tests and are replaced by *never announces the charge by brightness alone* and *changes colour and pulses at a full reservoir and at nothing below one*, which is the ruling that retired them rather than a rename. *does not overlap the pause button at any of them* is replaced by *sits in the bottom-left corner and overlaps neither reserved corner nor the pause button*, which asserts strictly more. *draws only declared palette colours* is replaced by *draws only declared palette colours, all three inside the ceiling*. Against the step 4 baseline the figures are 1834 to 2096, 522 added and 260 removed.

### The fence that caught something, and it was right to

**`src/app`'s test-span allowance is `app/palette` and `app/layout` and nothing else**, so a first draft of the one-value test importing `luma` from `app/color` failed *every test file imports only from inside its parent folder's subtree* by name. **The fence was not touched.** The test reads the declared lumas instead, which is the right source anyway: `palette.test.ts` already holds every declared luma against its hex, so reading the declaration is reading the measurement rather than repeating it.

### Record and prompt claims found false against the tree

**None.** Every claim slice K's prompt and the record's ruling R7 make about the tree held: `QUIET_ALPHA` at `BelchButton.ts:40`, the pulse at 53 to 57, the ring at 119 to 126, `BELCH_SIZE` and its floor at 23 to 31, the two rects in `BelchButton.test.ts` at 53 to 64, `READOUT_RESERVE`'s two top corners in `layout.ts`, `graveGlow` at luma 67.25 and the ceiling at 68. The prompt's state-of-the-branch line naming slice J's docs commit as the tip was already corrected in the dispatch, and the tip was `7f5cb0105b`.

**One thing the prompt did not anticipate and it is not a contradiction.** It says to confirm the existing palette scan green over the new colour rather than writing a second one, which is what happened; what it could not know is that adding a colour at hue 199.79 makes another entry's derivation comment stale, so `standInVigilTint`'s paragraph and `palette.test.ts`'s comment on the Vigil test were corrected in the same commit. No assertion moved.

### Filed for Mark's read, not applied

**The bottom-left corner is the hard-reach corner for a right-handed one-handed grip.** The design record's section 7 already carries it with Hurff's map behind it. Mark ruled the corner and ruled handedness future work, so the move was made as ruled and nothing here acts on the finding. What this slice adds to his read is only that it is now true on screen at both viewports, so the question is answerable by grip rather than by argument.

### Left for later slices, each named

**Slice L owns the Wall and inherits nothing from here.** Nothing under `src/game` was opened and no belch rule moved.

**The shared widgets are still #38's.** The pause button remains the template's `Button` in the template's pink, outside the palette scan, at the one corner of the stage the scan cannot reach. This control is purpose-built for exactly that reason and the gap is unchanged.

**Seen and left, for nobody in particular.** The charging state is now drawn at full alpha where the old ring drew at 0.32, because the alpha step is what ADR 0054 forbids, so the corner is as loud while filling as it used to be only at ready. The track is held to the narrow stroke to pay for it, and whether the corner now reads as too loud on a real device is a feel call and Mark's.

## 14. Slice L: the Wall is a wall (#123)
