# Step 3 slice prompts, drafted by session 17

One block per slice, in the order plan section 10 dispatches them. The launch preamble is the same for every slice: name the playbook and the plan sections carrying the contract items, then point at the coder contract. Slice 0 has no block of its own because it makes no commit: it is the first act of slice 1, below. Slices 2 onward have no draft yet; write them from plan section 10 in the same shape.

## Slice 1, as dispatched in session 17 (after the three gates and the fixer)

Model: Opus, subagent type general-purpose. Commit messages end in `(#98)`.

Step 3 slice 1 of The Hungry Grave (ticket #98): the hand.

Read `apps/hungry-grave/docs/push/step-3-coder-contract.md` (inside the worktree) first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it. The dispatch contract items the playbook asks for (definition, verification steps with actors, seams, module boundaries, the test list) are sections 1 to 8 of `apps/hungry-grave/docs/design/step-3-playing-harness-dispatch.md`; your slice is section 10's slice 1. The design record behind it is `apps/hungry-grave/docs/design/playing-harness.md`, whose amendments dated 2026-09-09 are the three gates' findings applied: read the amendment and not only the paragraph above it.

## Your slice

**First, slice 0, which makes no commit.** Before any edit: capture `pnpm vitest list --json` to `local/step3/tests-baseline.txt` (worktree root, outside version control), and record two tapes at the tip with `scripts/record-conditioned.ts`, saved outside the repo. They are format version 2 and they are slice 3's input for verification step 7, the old-tape refusal, so say in the note exactly where you put them.

**Then slice 1, per plan section 10.** `bot.ts`'s look-ahead becomes a parameter on `scoreMove` and `bestMoveToward`, `LOOKAHEAD_TICKS` retires (the settled point reads the last element of the list it was passed), and `bestMoveToward`, `nearestFood` and `LOOKAHEAD_SAMPLES` are exported. The three existing call sites pass `LOOKAHEAD_SAMPLES` by name and there is no default, because a default would hide which horizon a policy reads at the moment the file gains one that reads a different horizon. **The six existing policies do not move in behaviour**: module test 75 is the mechanical form of that promise and every figure they have produced has to keep meaning what it meant.

`configurations.ts` lands with **one row, `steady-far`**, plus `SHARP_HAND`, `RESERVED_POLICIES` and the parse. `PERSON_POLICY = 'person'` and `SCRIPT_POLICY = 'script'` are declared in `src/tape/tape.ts` beside `TAPE_INPUT_DEVICES` in this slice, because `RESERVED_POLICIES` is built from them and `src/dev` may not reach `src/app` (`boundary.test.ts:69-74`); nothing writes either into a header until slice 3.

`harnessPolicy.ts` lands with the three-clause wanting rule (the live offer's nearest body, else the nearest food, else `HOME`), the belch on the configuration's own threshold, and **no hold and no stream**, so its signature here is `harnessPolicy(configuration)`. Slice 5 widens it to take the seed; a `seed` parameter nothing reads fails `noUnusedParameters`. The body rule is nearest by centre distance with ties to the lower entity id, which is `chooseOfferBody`'s own rule written again rather than called, and spec test 1 is what holds the two together.

Spec tests 1 to 9 and 17, module tests 46 to 48, 52, 54 and 75, and fences 76 to 78 land here, by the numbers in plan section 6.

**Spec test 7 reports as well as passes.** It plays the pinned seeds, so put the reach it saw on them in the note beside the pass: a birthright hand crossing a stage no birthright run has crossed is this step's riskiest assumption (hand-forward (g)). A low reach is a finding for #39's tuning pass and never a reason to sharpen the hand or move a row in this slice.

**Three records say the harness has four verbs and this slice restates all three.** ADR 0053 is amended in place, dated, in the what-stood, what-it-replaced, what-it-could-not-have-known form: what stood is the whole ruling, what changed is the verb list, what it could not have known is that #37's story 12 would still have no hand two steps later (#98's third comment). The glossary's Playing harness entry (`CONTEXT.md:201`) and the V1 line in the concept box (`game-concept.md:11`) are restated the same way with a citation to that amendment, the second carrying a dated note that the widening is the session's commitment under Mark's review, because that line is his own restated wording and is not silently rewritten. `CONTEXT.md` also gains Configuration, Rig, and Sharp hand and sloppy hand, from the record's section 9.

**`GOLDEN` must not move**, and neither may `WITNESS_VERSION` or `READINGS_VERSION`. If any of them moves, stop: the slice is wrong.

`.claude/rules/code-core.md` rules the shape: guards at the top, one concept per file, the public interface at the module's end, nothing abnormal silent.

## State of the branch

- The tip is `d3db6f4b31`: the two records after the three gates at `c8ee3cb42e`, the coder contract at `d3db6f4b31`. Nothing of step 3's code exists yet; yours is the first slice.
- There is no test baseline yet. Slice 0 above is where you make it, at `local/step3/tests-baseline.txt`; every later slice diffs against it.
- `pnpm verify` was green at the last code commit, adjustment iteration 4 at `311cc7b8a8`; every commit since is documentation. A timeout with no assertion is contention, not a failure: run the suite alone once more before calling it red (`docs/agents/lessons.md`).
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`. Any scratch file goes in the session scratchpad directory named in your system prompt. `local/` is reached by none of the standing checks: it is outside version control, outside eslint, outside prettier and outside `tsconfig.json`'s `include`. The one thing that does reach it is vitest, which has no config of its own, so a `*.test.ts` left under `local/` runs in the suite. Batch tapes go under `local/batches/` and nothing under `local/` ever enters a commit. Editor diagnostics name scratch files and stale states; `pnpm typecheck` is the judge. Nothing under `docs/` is ever handed to prettier by name.
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `feat(hungry-grave): the harness hand feeds, takes offers and belches (#98)` or better in the same form. Note: `docs(hungry-grave): step 3 progress note after slice 1 (#98)`. Your note commit creates `apps/hungry-grave/docs/push/step-3-progress.md` with the layout the coder contract names: 1 slices committed, 2 GOLDEN moves, 3 CodeRabbit, 4 plan claims found false against the tree, 5 seams that moved, 6 the baseline tapes, 7 verification steps run, then one section per slice.
