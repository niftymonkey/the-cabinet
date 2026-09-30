# Handoff: the tilted view (#159)

Read the branch charter first: `docs/branch/charter.md`. Then this file. Every ruling this branch builds, with its evidence and how to reverse it, is in the design record `apps/hungry-grave/docs/design/tilted-view.md`: Mark's as T1 to T12, the agent's calls as A1 to A35, each with a status line. This file holds only what is open and what later work needs.

## Where the branch stands

**Every planned slice has landed and Mark has played the build (2026-09-29, desktop, the live deploy of `6f46b115d9`).** Tip `32c375abbd`, pushed, not deployed. His read: "pretty good", with three findings. (1) Corpses touched on a fast pass trail the grave instead of going in: not a missed test, it is decision 3's 55% share (`grave-in-the-ground.md`), and he wants "if you touch that thing, it should fall in"; his ruling on the value is open (first touch recommended). (2) A fall looked left behind where the grave had been: fixed in `32c375abbd`, the fall draws on build 7's own path camera (`FALL_CAMERA`, `fall.ts`) and spends its carried way per tick; CodeRabbit clean. (3) Territory patches warp into different eggs and slide across the ground: the play layer and the pinhole ground disagree by design (A22, A28); he questioned the split itself, and tilt 11 to 13 of the prototype (a Pinhole / Flat ground pair, a real ground photo) let him judge whether a ground on the play layer's own map still reads as tilted. If flat wins, one scenery-side slice moves `groundMesh`, the scroll, dressing and far headstones onto the play layer's map and A22's stretch goes.

## What is left, in order

1. Mark's swallow ruling: `tipThreshold` to the value he picks, a design-record note that decision 3 is superseded on his play of 2026-09-29, spec test, review, commit.
2. Mark's ground ruling from tilt 13: if flat, the scenery slice above; if pinhole, a shape rule for traced areas is a design conversation.
3. Deploy, then his confirming play on iPhone and desktop against "For Mark's next play" below.
4. The tip review, then the close: the three gates once on the built result, "For the close" worked through, `end-of-the-branch.md`, the glossary entries and the ADR 0003 amendment on his yes.

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

- The fall has its own path camera (`FALL_CAMERA`, build 7's height) beside T4's shared hole camera: one line in the design record.
- The weapons record's shots placeholder (CodeRabbit); the belch button overhangs the left bar at 390 by 600; the dev readout overlaps the score row; a big grave in a bottom corner overhangs by up to 17 px (A25); the 390 by 844 stage wording nit; bakes at 9.5 to 11.7 a second; a swallowed corpse turns pale at the handover (older than this branch); the Undertaker holds his height about six frames on 1168.

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
