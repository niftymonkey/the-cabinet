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

## Ground adjustment 1, as dispatched in session 13 (between 13b and 14)

The launch preamble was the session 12 one above, plus one sentence naming the playbook and where the dispatch contract items live, because the dispatch hook reads the launch text itself. Model: Opus, subagent type general-purpose.

Step 2 ground adjustment 1 of The Hungry Grave (ticket #97): the ground keeps what lands on it, reads as one floor, and is dressed thick.

Read `apps/hungry-grave/docs/push/step-2-coder-contract.md` (inside the worktree) first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it. The dispatch contract items the playbook asks for (definition, verification steps with actors, seams, module boundaries, the test list) are plan sections 1 to 8 of `apps/hungry-grave/docs/design/step-2-stage-floor-dispatch.md`; this adjustment is not in section 10's slice list, it is an iteration on slice 13b that Mark asked for on 2026-09-08 after playing the 13b deploy on his phone. Treat it as one slice: tests first, two commits, the note.

## Your slice

Three notes from Mark, in his framing, each with the facts the session already measured and the ruling that binds you. All three land in `BackgroundRenderer.ts` and `groundDressing.ts` (plan section 4's seam) and, for note 2, the import script `apps/hungry-grave/scripts/grayscale-import.ts` and its output under `raw-assets`. Nothing in `src/game/` changes. GOLDEN must not move: this is render side only, and if it moves, the slice is wrong.

**Note 1. "The territory splotch moves at a different rate than the ground under it", which makes it read as not real and not cohesive.** Territory is a lobbed thing that lands on the ground and becomes hands pulling at mobs; it belongs to the ground. Measured: a landed patch drifts in the sim at exactly `SCROLL_SPEED` (`src/game/lines/territory.ts`, the `patch.y += SCROLL_SPEED` line, the same step mobs and corpses take in `step.ts`), and `StormRenderer.ts` draws it where the sim says. The ground scrolls at `GROUND_PARALLAX` 0.5 of that (`BackgroundRenderer.ts`), so the rock slides out from under every patch at half its speed. Ruling: the ground layer scrolls at the field's own scroll, `GROUND_SPEED` equals `SCROLL_SPEED`, so a landed patch and the tile under it stay together; drop the parallax row and its comment rather than setting it to 1. The dressing falls with the ground as before. The existing test "runs the ground at half the field, so the rock reads as depth under the bodies" is superseded by this ruling: replace it with one whose promise is that the ground and a landed patch move at the same rate, asserted against the sim's own `SCROLL_SPEED` row (never against the renderer's constant, slice 13b's note section 22 says why). Plan section 8 and the design record `stage-floor.md` (the bullet "The ground itself, tiled from `Terrain/Tiles.png`, scrolling at half the field's scroll") say half: record both as superseded in the progress note's section 4, and amend the design record's bullet in place with a dated line ("Amended 2026-09-08, Mark's ruling after the 13b deploy: ...") rather than deleting the old sentence. Known consequence, already decided by the session and not yours to fix: the Waking's source drifts in the sim at `SET_PIECE_DRIFT_SHARE` 0.5 of the scroll, so after this change it slides against the ground at half the ground's rate; that is a sim row under an ADR and goes to Mark. Do not touch the share. Write one sentence in the note saying it now slides.

**Note 2. "The tiles are placed at random and spun"; he wants them fitted together so the ground reads as one real piece of ground, not randomized blocks, using the tileset's own edge and corner cells as a coherent layout.** Measured: the ground is a `TilingSprite` of the whole of `Terrain/Tiles.png`, 80 by 64 pixels, which is a five by four grid of twenty 16-pixel stone blocks, each block bordered by its own groove and carrying a highlight streak at its own angle; tiled whole, the sheet repeats every 150 by 120 field units and reads as a paving of twenty different, differently lit blocks. The pack has no edge or corner cells: the session read `Tileset.png` (128 by 880) and the terrain it holds is the same twenty blocks plus a plain, borderless dark rock fill with faint cracks (the region left of the blocks, and `Terrain/Cracks.png`, 32 by 32, fully opaque, which slice 13b's note records drew as a bright block when used as dressing). So "edge and corner cells" cannot be taken literally; the intent is what binds: one continuous floor. Ruling on the mechanism, a craft call the session leaves to you within these bounds: bake one floor texture at import time in `grayscale-import.ts` from an authored cell map (a fixed map, in the script, chosen so neighbouring blocks agree: streaks lit from one direction, no groove borders reading as a grid of loose blocks, and a repeat period large enough that the eye does not catch it on a 540 by 760 field), or lay the floor from the plain fill with the twenty blocks used sparingly as inset stones on it. Read the sheet at pixel level before you choose (the scratchpad has `tiles-x8.png` and `tileset-terrain-x6.png`, eight and six times zooms of the two sheets, from the session; make your own if you need them). The baked PNG stays grayscale (fence 122 reads every PNG under `raw-assets`) and goes through the same percentile stretch the other imports do, so the tint still reaches it; the runtime keeps drawing one texture through the `TilingSprite`, nearest-neighbour per texture, tinted `nightSpeckle`, and knows nothing of the map. A test pins that the floor the ground draws is the baked floor and not the raw sheet. Judge the result by looking: the rendered check below is the acceptance, and "reads as one floor" is the promise.

**Note 3. "The dressing is too sparse"; noticeably more statues, urns, rocks and the rest per screen, same families and colours.** He likes that the background scrolls; keep that. Measured: a placement every `DRESSING_INTERVAL_SECONDS` 5 with a crossing of about 51 seconds at the old speed put roughly ten pieces on a screen; at the field's scroll the crossing is about 25 seconds, so the same interval would halve that. Ruling: the density is authored as pieces on screen at once, a row named for that, and the interval is derived from it and the crossing time, never the other way round; set it so the field carries about two and a half to three times what 13b showed (roughly 25 to 30 pieces visible at once on the 540 by 760 field), then look, and move the row if the shot says otherwise. Placements may overlap; if two pieces stack ugly, a second draw off the index for a small x jitter is fine, a per-frame draw is not (the stream stays a function of the index, slice 13b's note section 22). The pool grows with the row. The pack holds pieces the sets do not use yet in the same families (`Statue C1/C2` for the Procession, the `Vein A/B` sheets for the Crowd, `Amalgam Arc 1/2` and `Book Altar` under Structures & Details); adding any is your craft call, importing them through the script and the same fence, colours unchanged; the five palette entries do not move. A test pins the on-screen count as the row says.

The design record `apps/hungry-grave/docs/design/stage-floor.md` section 7 (dressing) and ADR 0049 rule the ground; `.claude/rules/code-core.md` rules the shape (a display component is a dumb view, data in, pixels out; a row is data, not arithmetic in a rule). Every number above is a measurement or a first row, marked stand-in as the others are.

**Player-visible change: a rendered check of the built app** (`pnpm build` then `pnpm exec vite preview`, driven with `playwright-cli`), the way slice 13b did it: one screenshot per section off a taped run through `#/replay?tape=...&at=` (the note's section 22 names the seed and ticks that reach each section), plus one with a landed territory patch on screen, read by you and described in the note, saved under the scratchpad with `ground-adj-1` in the filename, never the repo. Your read answers three questions in plain words: does the patch stay on its rock; does the floor read as one floor; does the dressing read as thick. If any answer is no, the slice is not done.

## State of the branch

- Commits landed for step 2: planning read ed2ad14108; slice 1 6958cfdd28; slice 2 1e420aeb53; slice 3 4d0b156a72; slice 4 2567dd0e95; slice 5 b324994400; slice 6 5eaa6d2759; slice 7 c06f2e0c46; slice 8 31c48ee1e8; slice 9 e024ebb7c8; slice 10 b0b4f4a4f5; slice 11 55ed3230c7; slice 12a b640d4e424; slice 12b f23d8eb162; slice 13a 3a7a85d5b1; a docs-only commit f65dd15309 (#101, the path); slice 13b 7570270a80 (note 5d05c49509); then three docs-only handoff commits. Read the progress note's section 1 for every hash and sections 2, 4, 5 and 7 for what slices 1 to 13b moved and handed forward; read its sections 21 and 22 (slices 13a and 13b) in full, they are the code you are changing.
- Baselines for verification step 5 are at `local/step2/tests-baseline.txt` (worktree root, gitignored). Diff your test names against it before you commit and report removed or renamed names, net of what earlier slices' notes already account for; the replaced parallax test is one you report.
- Two full test runs timed out in session 12 under another agent's CPU load and idle runs were green: run the suite alone, and if it times out, run it again before you call it red.
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`; slice 1's note records why. Any scratch file or screenshot goes in the session scratchpad directory named in your system prompt; a TypeScript file under `local/` breaks `pnpm build` (slice 10's note section 17). ImageMagick is absent; `pngjs` is in `apps/hungry-grave/node_modules` and a scratch script reaches it by absolute path (the guard refuses `NODE_PATH` and shell variables next to a command).
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `feat(hungry-grave): the ground keeps what lands on it, lays as one floor, and is dressed thick (#97)` or better in the same form. Note: `docs(hungry-grave): step 2 progress note after ground adjustment 1 (#97)`, appended as a new section 23 titled "Ground adjustment 1".
