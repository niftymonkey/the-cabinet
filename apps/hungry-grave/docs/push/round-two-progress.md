# Round two progress note: the push, the belch, the meter and the Wall (tickets #126, #124, #127, #123)

The record is `apps/hungry-grave/docs/design/round-two-wall-belch.md` and the prompts are `round-two-slice-prompts.md`. The coder contract is still `step-4-coder-contract.md`, with the three overrides at the top of the prompts file. One section per slice at the end, and the cross-slice facts first. Written by each slice's coder, appended to and never rewritten.

**Step 4's own note is `step-4-progress.md` and it is read and never appended to.** This round's slices carry their own tickets rather than `#39`.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| The ADR commit, both amendments | | |
| R-fix, three tech gate findings | `eddb32c4cb` | refactor(hungry-grave): the ceiling refuses a figure it cannot honour and the codec stops reaching for the director (#126) |
| H, the shove | | |
| H, the witness fold | | |
| I, the shove is measurable | | |
| J, the belch becomes a pushback | | |
| K, the meter fills and changes corner | | |
| L, the Wall is a wall | | |

Slice H carries two code commits, the fold and the rewiring, which is this round's one authorized departure from the contract's one-code-commit rule.

## 2. The version ledger

Where each constant stood when round two opened, where it is permitted to go, and where it actually went. **A move anywhere the plan does not name is a stop and report, never a re-pin and never a bump taken on the spot.**

| Constant | At slice G's tip | Permitted move | Owner | Landed |
| --- | --- | --- | --- | --- |
| `WITNESS_VERSION` (`src/game/witness.ts`) | 7 | 7 to 8, exactly once | Slice H, in its own commit | |
| `READINGS_VERSION` (`src/dev/readingsVersion.ts`) | 4 | 4 to 5, exactly once | Slice I | |
| `FORMAT_VERSION` (`src/tape/wireCodes.ts`) | 4 | none | nobody | |
| `GOLDEN` (`src/dev/digest.ts`), checksum `-489751710` | pinned | two re-pins | Slice H and slice J | |

**Round two's `GOLDEN` budget is two and it is its own.** Step 4's five slots were spent in slices A, C, E and F with one forfeit, and its spare is not this round's to take. **Slices R-fix, I, K and L are permitted none.**

**What the two version moves cost, stated rather than discovered.** `WITNESS_VERSION` 8 refuses every tape recorded before slice H's fold commit, which is the fourth time this step has made saved tapes a dead baseline, after the waves, the witness and the tape format. `READINGS_VERSION` 5 makes every step 4 batch incomparable with every post-belch batch, because the repel reading splits by source rather than being widened. Both are taken eyes open on the design record's rulings R1 and R9.

## 3. GOLDEN moves

One entry per slice that was permitted one, whether or not it moved, with the dated paragraph's location and every field that moved beside every field that held.

## 4. CodeRabbit

One entry per code commit: files reviewed, findings by severity, applied and declined, each decline with its reason.

**R-fix, `eddb32c4cb`.** All eleven files of the commit reviewed under `coderabbit review --agent --uncommitted`, **zero findings at any severity**, so nothing was applied and nothing declined.

## 5. Record and prompt claims found false against the tree

Every claim in the design record or in a slice prompt that did not survive contact, with the file and what is actually there. **The source's intent is followed rather than its stale letter, and an unclear intent is a stop.**

**R-fix. The formation ceiling column does not live in `waves.ts`.** The prompt's item (b) and its what-must-not-move list both place the `liveFormationCeiling` column and its cells in `src/game/stage/waves.ts`. The column is declared at `src/game/stage/stage.ts:90` and its seven cells are the seven sections of `SECTIONS` in the same file; `waves.ts` names it once, in the Procession's own prose at `waves.ts:238`, and states no cell. The intent was followed: the guard is on the column where the column is, and the test landed in `waves.test.ts` as the prompt asked, because that file already owns the section table's column tests (*declares both ceiling rows on every section*).

**R-fix. `boundary.test.ts` does have a fence over `src/tape`.** The prompt's read-first item 5 says it fences `src/game` and `src/dev` and has none over `src/tape`, "which is why finding 5 was not caught". `BOUNDARIES` carries a `tape` row at `boundary.test.ts:97`, `mayReach: ['tape', 'game']`, with its own paragraph saying why it reaches `src/game`: playback reproduces a run through the one execution authority. **Finding 5 was not caught because that reach is deliberately the whole of `src/game`**, not because nothing governed the folder. Item (e) was answered against what is actually there, below.

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

## 9. Slice I: the shove is measurable, and three readings the batch could not answer (#126)

## 10. Slice J: the belch becomes a pushback (#124)

## 11. Slice K: the meter fills and changes corner (#127)

## 12. Slice L: the Wall is a wall (#123)
