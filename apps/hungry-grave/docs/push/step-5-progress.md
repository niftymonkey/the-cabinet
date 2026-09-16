# Step 5 progress note: show what you have (tickets #72 and #99)

The record is `apps/hungry-grave/docs/design/show-what-you-have.md` and the prompts are `step-5-slice-prompts.md`. The coder contract is still `step-4-coder-contract.md`, with the three overrides at the top of the prompts file. One section per slice at the end, and the cross-slice facts first. Written by each slice's coder, appended to and never rewritten.

**Round two's note is `round-two-progress.md` and step 4's is `step-4-progress.md`, and both are read and never appended to.** This step's slices carry `#72` or `#99` rather than `#39` or round two's tickets.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| 5.0, the docs commit | | |
| M1, the fold | | |
| M1, a kill pays score | | |
| M2, the frame composed and the band reserved | | |
| M3, the HUD carries the ladder and the score | | |
| M4, the loss is watched | | |
| M5, the stripped rung falls | | |
| M6, the ladder's cost is measurable | | |

Slice M1 carries two code commits, the fold and the rule, which is this step's one authorized departure from the contract's one-code-commit rule.

## 2. The version ledger

Where each constant stood when step 5 opened, where it is permitted to go, and where it actually went. **A move anywhere the plan does not name is a stop and report, never a re-pin and never a bump taken on the spot.**

| Constant | At slice J2's tip | Permitted move | Owner | Landed |
| --- | --- | --- | --- | --- |
| `WITNESS_VERSION` (`src/game/witness.ts`) | 9 | 9 to 10, exactly once | Slice M1, in its own commit | |
| `READINGS_VERSION` (`src/dev/readingsVersion.ts`) | 6 after slice J2's second code commit | 6 to 7, exactly once | Slice M1, in the same commit as the score change | |
| `FORMAT_VERSION` (`src/tape/wireCodes.ts`) | 4 | none | nobody | |
| `GOLDEN` (`src/dev/digest.ts`), checksum `1275540894` | pinned by slice J2 | one re-pin, plus one at-most permit | Slice M1 takes the one; slice M5 holds the permit and is expected not to use it | |

**The step's whole budget is one `GOLDEN` re-pin, one at-most permit, one witness move and one readings move, each named by its slice** (record section 5, orchestrator 2026-09-16 under one-push mode). **Slices M2, M3, M4 and M6 are permitted none**, and a move in any of them is a stop and report, because none of them opens `src/game`.

**The readings move was not in the record when it was filed.** Section 5 said `READINGS_VERSION` does not move in this step at all, on the reasoning that M6's two readings are new beside unchanged ones. `run.score` is itself a declared reading and slice M1 changes what it means, which is `readingsVersion.ts`'s own rule for a bump, so **the orchestrator corrected the sentence on 2026-09-16 rather than obeying it** and section 5 now names the one move.

**What the moves cost, stated rather than discovered.** Each slice that moves a constant writes its own sentence here.

## 3. GOLDEN moves

One entry per slice that was permitted one, whether or not it moved, with the dated paragraph's location and every field that moved beside every field that held.

## 4. CodeRabbit

One entry per code commit: files reviewed, findings by severity, applied and declined, each decline with its reason.

## 5. Record and prompt claims found false against the tree

Every claim in the design record or in a slice prompt that did not survive contact, with the file and what is actually there. **The source's intent is followed rather than its stale letter, and an unclear intent is a stop.**

## 6. Step 5.0: the docs commit, ADR 0054 amended and the glossary gains three terms (#99)

## 7. Slice M1: a kill pays score, and a bled rung stays bled until the grave grows (#99)

## 8. Slice M2: the frame is composed, and the band is reserved (#72)

## 9. Slice M3: the HUD carries the ladder and the score (#99)

## 10. Slice M4: the loss is watched (#99)

## 11. Slice M5: the stripped rung falls and the dive catches it (#99)

## 12. Slice M6: the ladder's cost is measurable (#99)
