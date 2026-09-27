# Handoff: the tilted view (#159)

Read the branch charter first: `docs/branch/charter.md`. Then this file. Every ruling this branch builds, with its evidence and how to reverse it, is in the design record `apps/hungry-grave/docs/design/tilted-view.md`: Mark's as T1 to T12, the agent's calls as A1 to A35, each with a status line. This file holds only what is open and what later work needs.

## Where the branch stands

**Replanned on 2026-09-27 after Mark's correction (T10): the tilt is drawing only.** He played slice 4's deploy and found the tilt had reached the physics: "When I shoot my main weapon, that goes straight forward. It now no longer goes straight forward." He rejected tilt 8 of the prototype (no vanishing point anywhere, "a flat thing again") and approved tilt 9 "as long as the weapons behave right". Tilt 9 draws scenery through tilt 7's pinhole camera and places everything that moves on a play layer: straight across the screen, on the camera's own rows down it, at the camera's size for its row.

Landed and pushed: the plan `d521b3555e`, slice 1 `1b728db1d3` (camera math, the capture tool), slice 2 `e8188848fc` (everything drawn through the camera), slice 3 `544f0028d4` (the hole cut by the scene camera), slice 4 `328570e623` (steering on the glass and two readings; deployed to https://hungry-grave.vercel.app, `dpl_CfuJeiLZxnNxJGQBRZjpmsiakd3E`), slice 6 `7fac05ff88` (the `FIELD_*` to `VIEW_*` rename), slice 5 `9b125bbc03` (the before batch). The replan is uncommitted in the worktree.

What of that stands: slices 1 to 3 stand for scenery and the hole; slices B and C move everything that moves onto the play layer, and slice C moves the hole's stance. Slice 4's steering conversion comes out in slices A and C; its two readings stay (A27). Slice 5's batch is not used. Slice 6 is undone in slice 9 (A26). The old slices 7 and 8 are dropped, their entries marked so.

**Two more rulings on 2026-09-27 (T11, T12).** Mark played tilt 10 and kept tilt 9's rows (T11, A28 answered). And he ruled that the field fills any portrait phone: each run's field is 540 wide and as tall as the phone's portrait shape asks, recorded in the tape's header and replayed in that shape on any screen (T12). That is a sim change, so it gets its own slice, P, split on the tech gate's advice into P1 (the rules, the tape and the test player) and P2 (the screen and the drawing), after A and before B; P1 changes named files under `src/game` and `src/tape`, and a run that asks for no shape still plays today's 760 field, so `GOLDEN`, every version and every pinned list still hold (A31, A33), and a second digest pin, `GOLDEN_1168`, guards the tall field. Tapes recorded before slice P1 stop replaying, refused by name.

Outside slices P1 and P2 nothing under `src/game` or `src/tape` changes on this branch, and after slice A `src/dev` differs from `main` only by the two readings and slice P1's changes. The bot's and harness's lists go back to their values before slice 4 in slice A, measured against slice 4's own per-seed record of that tree (`local/tilt-slice-4/slice4-lists-before.json`); the expectation is an exact match, because the hand's commands to the sim are the same functions of state as before slice 4.

## What is left, in order

Mark approved a lighter process on 2026-09-27: the rest of the branch is slice 9 plus four slices, A to D, each run as the charter's "How a slice runs" says (one review per slice, bugs fixed in the next commit, no gate rounds until the close).

1. Slice 9, the rename undone. Landed, `c5b1423ce5`.
2. Slice A, steering and the test player back in the field, with the pins measured back to their values before slice 4. Running.
3. **Before slice P1 is dispatched, the main session amends the coder contract** (`docs/branch/records/coder-contract.md`): its "The sim is untouched (T10)" rule and its version and `GOLDEN` pins name slice P1 as the one slice that changes `src/game` and `src/tape` (P2 touches `field.ts`, `caps.ts` and `tip.ts` only to delete what P1 left for it), under T12, with every existing pin still holding and `GOLDEN_1168` added. The contract says a coder stops where it and an entry disagree, so without this slice P1's coder stops at once. The charter's goal paragraph names T12 the same way.
4. Slice P1, the field's height per run in the rules, the tape and the test player (`docs/branch/records/slice-P1.md`). It does not wait on Mark.
5. Slice P2, the screen reads the run's shape and draws it (`docs/branch/records/slice-P2.md`).
6. Slice B, the play layer's math and every placement on it.
7. Slice C, the traced areas, the ground's scroll, the grave, and the drag on the play layer.
8. Slice D, the weapons check with the bosses' patterns and the edge slide, the whole run, the proof that `src/game` and `src/tape` are untouched; then the deploy, and Mark's play on his phone coached line by line ("For Mark's next play" below).
9. The tip review of the last commit, then the close: the three gates run once on the built result, "For the close" below is worked through, and the branch closes by `end-of-the-branch.md`, carrying the glossary entries and #39's size floor comment (A17).

## For Mark's read

- **ADR 0003's sentence "The sim runs in one fixed 540 by 760 unit field that the renderer scales to any screen" is now wrong (T12).** It is not edited on this branch; the branch close's ADR pass proposes the amendment for his yes. What stays true in it: the width, "no number anywhere is a device pixel", base speed crossing the width in about two seconds, and the ceiling as a share of the width.
- **Old tapes stop replaying without a format bump (A33).** He said "(format bump)"; the refusal he approved comes from the header's own starting-condition block, which refuses a tape missing a row this build requires and names the row. ADR 0043 rules a format version is spent only when the wire's grammar changes, and adding a named row does not, so `FORMAT_VERSION` stays. Named so the diff does not surprise him.
- **The range starts at 760, not 16:9 (A30).** A phone's browser gives the game a much squatter box than the phone's screen: his iPhone in Safari with its bars showing is about 540 by 906, squatter than 16:9. So the range is 760 (today's field, which covers every phone measured) to 1260 (21:9), and a desktop plays 760 with bars at the sides.
- **Food stays fresh longer on a taller phone (A32, the main session's call, open to his overrule).** Freshness keeps its old derivation on the run's own field (the time a mid-field kill takes to reach the bottom edge), so it is exactly today's ten seconds on the 760 field and about 15 seconds on a 390 by 844 phone's 1168 field. Held at ten seconds, food killed in the top 54% of a tall field would rot before reaching the grave's row, against 30% today; scaled, it is 37%. To overrule: freshness back to ten seconds everywhere.
- **A tall phone's enemy fire speeds up more on the screen near the grave (A18 under T12).** On a 390 by 844 phone's 1168 field, mob fire reaches the grave's row drawn about 45% faster than the flat game draws it, against 21% on the 760 field, because the camera's rows spread more on a longer column. It is on his next play.
- **The whole grave on screen gives way at the bottom corners (A25, T7 in part).** Holding the drawn grave on screen is a hold in the sim, which T10 rules out, so the sim's own hold stays. At a side edge on its lowest row the drawn opening's near corners pass the screen's edge by 4.6 CSS pixels at the start size and 10.9 at the ceiling, and the lip already hangs past the edge in today's game. The done-when line "the whole grave always stays on screen" is marked not carried in full.
- **The grave is drawn no smaller than the box it is hit in (A29), so it reads about 22% longer than tilt 7 drew it.** Drawn at tilt 7's size, enemy fire would hit 4 to 11 pixels short of the drawn rim, because the fixed 540 by 760 field is spread over 930 units of ground down the screen. The product and game design gates both asked for the rim to be where fire lands. It is on his next play.
- **The glossary gets two entries at the branch close if he says yes:** Camera and Play layer, worded in the design record. The Field entry stays as it is.
- **The rename is undone (A26)** and **slice 4's two readings stay (A27).** No action; named so neither surprises him in the diff.
- **A big grave's hole shows a little more wall than the prototype's (A6).** Unchanged from the first plan.

## For Mark's next play

After slice D's deploy, on his phone at https://hungry-grave.vercel.app:

- Does it look like tilt 9 did: the ground leaning away, the hole's side walls changing as the grave moves left and right?
- Fire the skull stream at the far left, the middle and the far right: does it go straight up every time? Do mobs walk straight down at the edges?
- The weapons, his condition: do the bell's cones, the belch's rings and Territory's patches sit over what they hit?
- The grave is drawn a little longer than tilt 7 drew it, so its rim is exactly where fire and food meet it (A29). Does the hole still read as the one he chose? Does fire land where the rim looks to be?
- Enemy fire speeds up on the screen as it comes down toward the grave, about 21% faster at the grave's row than today (A18). Does dodging near the bottom feel fair?
- The Banshee's rings on tilt 9's rows (T11): does the gap still read as a lane he can take?
- Does the game fill his phone top to bottom in portrait, with no bar above or below (T12)? With the browser's bars showing and, after a scroll, hidden: the field keeps the shape it started with.
- A taller phone sees more of the field ahead: does that read as more warning, or as a different game (T12's accepted cost)?
- A replay of a phone run opened on his desktop: a tall portrait column between bars at the sides (A35).
- A drag at the top and at the bottom of the screen: does the grave stay under his finger? Does W go straight up?
- Up and down with the keys the grave covers more of the screen per second near the bottom than near the top, because the rows spread as they near. Does that feel right, or does moving up near the bottom feel too fast?
- Far things draw at 0.82 of their size at the top: does mob fire there still read, and does a small grave near the top still read as a grave?
- Near the side edges a patch or a corpse keeps its place on the screen while the ground's texture spreads outward under it as it nears (tilt 9 did the same). Does that read as the ground moving or as the patch sliding?
- Drag the grave fast across the screen, small and big: does it stutter?

## For the close

Style, wording and nice-to-have findings from the per-slice reviews land here, never as a rerun. Each is worked or dropped at the close.

- (none yet)

## Facts later work needs

- **The tapes in `local/tilt-shots/tapes/` verify up to slice P1 and stop replaying at it** (their header has no `fieldHeight`, A33). Slice P1 re-records the two at 760, which are the same runs tick for tick, adds their `-h1168` twins, and moves the old two to `pre-P/`; from slice P1 on, those four verify on every slice. Record fresh ones only for new conditions (slice D's edge tapes and its runs).
- **A live run in the capture tool's 390 by 844 viewport plays a 1168 field after slice P2** (the stage is 540 by 1168), and a desktop viewport plays 760. A batch plays 760 unless given `field=<height>`.
- **There is no autopilot in the rendered game.** A whole run is watched by replaying a recorded tape in the replay screen (`?tape=` fetches a URL, `?at=` names a tick, `src/app/seedFromUrl.ts:159-183`). The capture tool is `local/tilt-shots/` (its README).
- **Holding a frame in the rendered app.** The replay screen cannot be held at the tick `?at=` names: it fast-forwards and then plays on. Hold a tick from outside the app by replacing the page's `requestAnimationFrame` with a manual pump and freezing `performance.now`, advancing it one tick's worth per pumped frame. The capture tool does this.
- **A deploy builds from a clean detached checkout**, never from this worktree while anyone has uncommitted work in it: `git worktree add --detach <scratch> <commit>`, copy `apps/hungry-grave/.vercel` from the main repo folder, `pnpm install --frozen-lockfile --prefer-offline`, then the recipe in `apps/hungry-grave/docs/deploy.md`, then `vercel ls` and a `curl` of the alias to confirm.
- A `vite preview` on port 4173 may belong to another worktree. Use another port.
- A prompt that writes no code opens with `Non-coding dispatch:` and one that writes code names `docs/agents/feature-flow.md`, or the dispatch hook refuses it. Give an agent a scratch folder under `local/` in this worktree, under a name no other agent uses, as a full path.
- Tilt 9 exposes its camera and play layer on `window.graveFall` (`playToScreen`, `screenToPlay` beside `groundToScreen` and `screenToGround`), which is how a coder measures it side by side with the game. Its column is the phone's own height, and its field is the ground itself (A18), so compare by column position and scale, not by field coordinates.
- The build's two Rollup warnings are #50 and #51, older than this branch.
- **The main session writes no code and no tests and hunts no bug.** A review finding or a small fix goes to a small agent briefed with the finding, the file, the test to write first with its expected red, and the checks to run.
- The harness batch commands, if a batch is ever wanted on this branch, are `#148`'s four, from `apps/hungry-grave/`: `pnpm vite-node --config vite.headless.config.ts scripts/batch.ts <steady-far|shaky-short> 1000 48 <full path out> rig=<birthright|maxed>`. No slice of this plan needs one: the sim is the flat game's, so the batch is `main`'s.
