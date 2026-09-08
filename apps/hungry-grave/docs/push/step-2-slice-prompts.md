# Step 2 slice prompts, drafted by session 11

Each block below is one slice's dispatch prompt as the session wrote it, in order: 12b, 13a, 13b, 14 (each begins with "Step 2 slice"). The launch preamble is the same for every slice: name the playbook and the plan sections carrying the contract items, then point at the prompt file. Before use, fill the SLICE_HASHES placeholder from the progress note's section 1 and replace the scratchpad path of the coder contract with the tracked copy at `apps/hungry-grave/docs/push/step-2-coder-contract.md`. Slices 15 and 16 have no draft; write them from plan section 10 in the same shape.

Step 2 slice 12b of The Hungry Grave (ticket #97): the loop gap, measured.

Read `/tmp/claude-1000/-home-mlo-dev-niftymonkey-the-cabinet--claude-worktrees-hungry-grave-v1/018b7216-2278-4bb1-a97d-1f7e26da76ef/scratchpad/coder-contract.md` first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it.

## Your slice

Plan section 10, **Slice 12b**: the loop gap, measured. **Verification step 13 runs here**, on the three loops slice 12a staged: measure each loop's real wrap in a browser (the built app through `pnpm exec vite preview` driven by `playwright-cli`, or a small page loading the file through the Web Audio API, decoding, and reporting the decoded length against the file's nominal duration and any silence at the ends), and put the three rows in the progress note's section 7. The expected result, per plan section 8 ("The loop gap is measured first"), is that the browsers already trim and nothing is built. If a gap survives on any loop, that loop gains a `start` and an `end` in seconds as data rows beside its alias in the same commit, mapped to `@pixi/sound`'s `loopStart` and `loopEnd`; nothing else. Module test 129 lands here either way: it guards the absence of any encoder-header parse in `src/`. If nothing is built, this slice is one test plus the note, and that is the point. The seams are plan section 4 (`src/app/sound.ts`); the tests are section 6 by number.

## State of the branch

- Commits landed for step 2: through slice 12a: SLICE_HASHES. Read the progress note's section 1 for every hash and sections 2, 4, 5 and 7 for what slices 1 to 12a moved and handed forward.
- Baselines for verification step 5 are at `local/step2/tests-baseline.txt` (worktree root, gitignored). Diff your test names against it before you commit and report removed or renamed names, net of what earlier slices' notes already account for.
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`; slice 1's note records why. Write any measuring page or script to the scratchpad directory, never under the repo (a TypeScript file under `local/` breaks `pnpm build`, slice 10's note section 17).
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `test(hungry-grave): no loop is trimmed by a header parse, and the three wraps are measured (#97)` or better in the same form. Note: `docs(hungry-grave): step 2 progress note after slice 12b (#97)`.
Step 2 slice 13a of The Hungry Grave (ticket #97): the grayscale import, and the fence that holds it.

Read `/tmp/claude-1000/-home-mlo-dev-niftymonkey-the-cabinet--claude-worktrees-hungry-grave-v1/018b7216-2278-4bb1-a97d-1f7e26da76ef/scratchpad/coder-contract.md` first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it.

## Your slice

Plan section 10, **Slice 13a**: the import script at `apps/hungry-grave/scripts/grayscale-import.ts`; `pngjs` added as a devDependency (with `pnpm add -D` in `apps/hungry-grave/`, an exact pinned version, and the lockfile in the commit); the staged sprites and tiles desaturated through it from the gitignored `apps/hungry-grave/assets-staging/` packs (`crawling-depths`, `scarymobs`) into `raw-assets`, per the mapping the handoff and the design record agree on (skeleton shambler, ghost revenant, cat ghoul, golem carrier, big ghost Banshee, tall figure Undertaker, eldritch thing for the Waking's source; the brown werewolves, bears, gorillas and zombies stay out); and fence 122 reading the output (every imported PNG is grayscale: for every pixel, R equals G equals B). No palette entry and no renderer: those are slice 13b. The seams are plan section 4 and section 5's module table (`pngjs` as the fence's PNG reader); the tests are section 6 by number; the craft call (desaturated on import, coloured by tint, nearest-neighbour) is section 8 and the design record's section on dressing. Pixel art draws nearest-neighbour. Licences: itch.io free packs, personal and commercial use, confirmed by Mark on 2026-09-08; record nothing more.

## State of the branch

- Commits landed for step 2: through slice 12b: SLICE_HASHES. Read the progress note's section 1 for every hash and sections 2, 4, 5 and 7 for what slices 1 to 12b moved and handed forward.
- Baselines for verification step 5 are at `local/step2/tests-baseline.txt` (worktree root, gitignored). Diff your test names against it before you commit and report removed or renamed names, net of what earlier slices' notes already account for.
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`; slice 1's note records why. Raw asset packs never enter git; only the desaturated output under `raw-assets` does. Check the size of what you add: report the total bytes of imported PNGs in the note.
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `feat(hungry-grave): sprites and tiles are imported grayscale, and a fence keeps them so (#97)` or better in the same form. Note: `docs(hungry-grave): step 2 progress note after slice 13a (#97)`.
Step 2 slice 13b of The Hungry Grave (ticket #97): the ground and the dressing.

Read `/tmp/claude-1000/-home-mlo-dev-niftymonkey-the-cabinet--claude-worktrees-hungry-grave-v1/018b7216-2278-4bb1-a97d-1f7e26da76ef/scratchpad/coder-contract.md` first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it.

## Your slice

Plan section 10, **Slice 13b**: the five palette entries measured in tree (plan section 8 says how each is measured: outside the mob-fire value band per ADR 0014, not brown, not AI purple, and the design record's per-section colour families), the ground tiles, the three dressing sets, the drift window, nearest-neighbour per texture, and the Waking's source sprite in the Crowd's colour family at three times the dressing eyes' size. `BackgroundRenderer.ts` is the seam (plan section 4). Tests: spec 59, 60; module 105, 106; fences 113, 114. The boundary is section 5; the tests are section 6 by number; the craft calls are section 8 and the design record's dressing section. A display component is a dumb view: data in, pixels out, no data source, no loop subscription (`.claude/rules/code-core.md`). **Player-visible change: a rendered check of the built app** (`pnpm build` then `pnpm exec vite preview`, driven with `playwright-cli`), one screenshot per section read by you and described in the note, saved under the scratchpad, never the repo. Verification step 11's per-section rendered check is yours; its per-boss half is slice 14's.

## State of the branch

- Commits landed for step 2: through slice 13a: SLICE_HASHES. Read the progress note's section 1 for every hash and sections 2, 4, 5 and 7 for what slices 1 to 13a moved and handed forward; slice 13a's grayscale sprites and tiles under `raw-assets` are what you colour by tint.
- Baselines for verification step 5 are at `local/step2/tests-baseline.txt` (worktree root, gitignored). Diff your test names against it before you commit and report removed or renamed names, net of what earlier slices' notes already account for.
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`; slice 1's note records why.
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `feat(hungry-grave): each section dresses the ground in its own colour family (#97)` or better in the same form. Note: `docs(hungry-grave): step 2 progress note after slice 13b (#97)`.
Step 2 slice 14 of The Hungry Grave (ticket #97): the boss renderers and boss fire's own read.

Read `/tmp/claude-1000/-home-mlo-dev-niftymonkey-the-cabinet--claude-worktrees-hungry-grave-v1/018b7216-2278-4bb1-a97d-1f7e26da76ef/scratchpad/coder-contract.md` first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it.

## Your slice

Plan section 10, **Slice 14**: both bosses drawn (`BossRenderer.ts`, plan section 4, from slice 13a's grayscale sprites coloured by tint: big ghost Banshee, tall figure Undertaker), the chunk flash, both `dressField` sites wired, and boss fire's own read: `mobFireSprite.ts` stops naming `MOB_FIRE.trash` and reads the shot's own fire kind (slice 6 put it on `Shot` and `MobFired`), so the tear, the clod and the spiral draw in the three sprites `palette.ts` has carried since before any boss existed. Tests: module 107, 127. The boundary is section 5; the tests are section 6 by number; the constants and every reader are section 7 (`MOB_FIRE.trash` readers, `MobFired.emitter` readers); the craft calls are section 8. A display component is a dumb view: data in, pixels out (`.claude/rules/code-core.md`). **Player-visible change: a rendered check of the built app** (`pnpm build` then `pnpm exec vite preview`, driven with `playwright-cli`), one screenshot per boss mid-fight and one per boss fire kind, read by you and described in the note, saved under the scratchpad, never the repo. Verification step 11's boss half runs here. Name step 17 (whether the way through reads as following the arm) and step 19 as Mark's.

## State of the branch

- Commits landed for step 2: through slice 13b: SLICE_HASHES. Read the progress note's section 1 for every hash and sections 2, 4, 5 and 7 for what slices 1 to 13b moved and handed forward.
- Baselines for verification step 5 are at `local/step2/tests-baseline.txt` (worktree root, gitignored). Diff your test names against it before you commit and report removed or renamed names, net of what earlier slices' notes already account for.
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`; slice 1's note records why.
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `feat(hungry-grave): both bosses are drawn and boss fire draws in its own kind (#97)` or better in the same form. Note: `docs(hungry-grave): step 2 progress note after slice 14 (#97)`.

## Slice 14, as dispatched next (session 12, supersedes the session 11 draft above)

The launch preamble used in session 12, verbatim in the Agent call: name the worktree path and branch, say the main checkout is never touched, point at this prompt (copied to the scratchpad or read from this file), state the one-plain-command-per-call rule for anything mentioning git, no stash, no `git add -A`, no em dash, `pnpm` never `npm`, single-line `-m` commit messages ending in `(#97)`, `CI=true` if pnpm refuses a non-TTY, and the under-300-word report. Model: Opus, subagent type general-purpose.

Step 2 slice 14 of The Hungry Grave (ticket #97): the boss renderers and boss fire's own read.

Read `apps/hungry-grave/docs/push/step-2-coder-contract.md` (inside the worktree) first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it. The dispatch contract items the playbook asks for (definition, verification steps with actors, seams, module boundaries, the test list) are plan sections 1 to 8 of `apps/hungry-grave/docs/design/step-2-stage-floor-dispatch.md`; section 10 is the slice list.

## Your slice

Plan section 10, **Slice 14**: both bosses drawn (`BossRenderer.ts`, plan section 4), the chunk flash, both `dressField` sites wired, and boss fire's own read: `mobFireSprite.ts` stops naming `MOB_FIRE.trash` and reads the shot's own fire kind (slice 6 put it on `Shot` and `MobFired`), so the tear, the clod and the spiral draw in the three sprites `palette.ts` has carried since before any boss existed. Tests: module 107, 127. The boundary is section 5; the tests are section 6 by number; the constants and every reader are section 7 (`MOB_FIRE.trash` readers, `MobFired.emitter` readers); the craft calls are section 8.

**The bosses are vector silhouettes, not pixel art.** Plan section 8 ("The two bosses are vector silhouettes, not pixel art") and the design record `apps/hungry-grave/docs/design/stage-floor.md` (its dressing section, "The two bosses are not pixel art") both rule it: each boss is drawn in its existing palette pair (`banshee`/`bansheeDark`, `undertaker`/`undertakerDark`) by the same body-plus-near-black-companion construction the three mob types use, and pixel art stays on the ground layer. Slice 13a's note records that it imported grayscale creature cut-outs a boss could have used; they are not used here. If you find the two records disagree with each other on this, stop and report; do not choose.

A display component is a dumb view: data in, pixels out (`.claude/rules/code-core.md`). **Player-visible change: a rendered check of the built app** (`pnpm build` then `pnpm exec vite preview`, driven with `playwright-cli`), one screenshot per boss mid-fight and one per boss fire kind, read by you and described in the note, saved under the scratchpad, never the repo. Reaching a boss in the browser takes minutes of play; a pinned loadout through `createRun`'s third parameter, or the seed and speed controls the dev build carries, are the ways earlier slices got there, and the progress note's slice 7 to 9 sections say how. Verification step 11's boss half runs here. Name step 17 (whether the way through reads as following the arm) and step 19 as Mark's.

## State of the branch

- Commits landed for step 2: planning read ed2ad14108; slice 1 6958cfdd28; slice 2 1e420aeb53; slice 3 4d0b156a72; slice 4 2567dd0e95; slice 5 b324994400; slice 6 5eaa6d2759; slice 7 c06f2e0c46; slice 8 31c48ee1e8; slice 9 e024ebb7c8; slice 10 b0b4f4a4f5; slice 11 55ed3230c7; slice 12a b640d4e424; slice 12b f23d8eb162; slice 13a 3a7a85d5b1; a docs-only commit f65dd15309 (#101, the path); slice 13b 7570270a80 (note 5d05c49509). Read the progress note's section 1 for every hash and sections 2, 4, 5 and 7 for what slices 1 to 13b moved and handed forward.
- Baselines for verification step 5 are at `local/step2/tests-baseline.txt` (worktree root, gitignored). Diff your test names against it before you commit and report removed or renamed names, net of what earlier slices' notes already account for.
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`; slice 1's note records why. Any scratch file or screenshot goes in the session scratchpad directory named in your system prompt, with `slice-14` in the filename; a TypeScript file under `local/` breaks `pnpm build` (slice 10's note section 17).
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `feat(hungry-grave): both bosses are drawn and boss fire draws in its own kind (#97)` or better in the same form. Note: `docs(hungry-grave): step 2 progress note after slice 14 (#97)`.
