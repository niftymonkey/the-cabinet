# Path to V1, draft for review (2026-09-07)

Draft only. Nothing here is created, closed or edited until Mark says so. Built from decisions 1 to 21 (`decisions.md` and `continue-hungry-grave.md`), the open-ticket summary (`open-tickets.md`) and `scripts/roadmap/v1.yaml`.

## The V1 line, restated

One stage of eight to ten minutes in three named sections, both bosses real, tunable through data tables, played by a harness that moves, dodges, feeds and takes offers under a sharp and a sloppy hand, read by a person on desktop and phone, with every run landing in one store. Not dressed: stand-in art, music and backgrounds mark the sections and nothing more.

## The order, with what each step needs

Decision 4 said progression, then harness, then density. That holds, with the stage floor inserted between progression and the harness, and the ladder running beside the harness and director as render work. Why the floor moves up: the director sits on the floor (decision 19's budget is per phase, and the phases are the new sections), and the harness's first real comparison is the director, so the harness wants the stage it will play to exist. Why the harness still precedes the director: it is what tunes the director without Mark as the choke point (decision 4's first reason, unchanged), and decision 10 removed the second reason (power out of the director's reach) without adding a reason to flip the order.

1. **Progression mechanics.** The unbuilt rulings that change how power arrives: carriers meter power with slack (decisions 10, 11), the offer of three side by side with the bank (8, 9), the thinned birthright (ADR 0045), the per-run roster (ADR 0046), the skull stream rename including the tape wire identity, the belch split (ADR 0008), and the bell arcs built (Mark, 2026-09-07, option A: the ring becomes forward cones that widen per level; timer and falloff stand; angles, reach and push per level are tuning rows). Needs: nothing. Produces: a choice for the harness to make and a ladder to show. The price table in drops.ts retires here.
2. **The stage floor.** Nine minutes nominal in three sections (13, 14), the Banshee real with the Wall, the swarm set piece (design work first), the Undertaker real with three chunks (16), both endings, the sparse last rows in place of drain-outs (15), the carrier schedule as rows with slack (10, 11), stand-in music and backgrounds per section (13, asset location from Mark at this step), the corpse cap re-sized and never evicting (19). Needs: step 1 for the carrier column. Produces: the floor the director adds to and the stage the harness plays. Carries #39's boss half and #37's stories 12 to 14 and 22.
3. **The harness, A then B.** The offer in the dodge policy (nearest body), a seed batch runner, a distribution report, the policy header field, then the two error knobs (17). Needs: step 1 for the offer, step 2 for the stage. Produces: the comparison instrument every later step is read with. Batches write local tapes until step 6 exists.
4. **The director.** A pressure signal reading damage and floor events, never nearby kills; a finite budget per phase from cards over the roster; a quiet interval after each add; a per-phase permission row with the boss chunks, the sparse rows and the set piece as off-limits cells; the mob cap re-derived above floor plus budget; the replay graph drawn from a tape and the signal lock (19, ADR 0047). Tuned by comparison through step 3. Needs: steps 2 and 3. Carries #85 rewritten. #39's tuning pass becomes this step's tuning, harness-driven, not a static-row tune.
5. **The ladder and the frame.** Each line's level carried by its projectile count, the strip with score and pips, loss shown as the line's projectiles blowing up and the pip going dark, the stripped rung falling as a body the dive can catch (18, 20); the play area designed for desktop and phone with the strip inside it (#72). Needs: step 1. Runs beside steps 3 and 4. Produces: what a person reads.
6. **The store and the gate.** Upload at run end with consent, header columns, byte-exact tape bytes, derived readings cached by replay and build-stamped; the harness pushes its batches to the same tables (21). The player build that ignores dev controls (#66). Needs: step 3 for the harness half. Must land before step 7.
7. **The human read.** A person plays on desktop and phone, and their runs land in the store. #31 rewritten with no names and no dates. Needs: everything above.

Standing constraint across every step (Mark, 2026-09-07): weapon lines stay extensible. Every tuning number is a data row keyed by line, never a constant in code. The harness reports by line. Policies walk to an offer by rule (nearest body, lowest level), never by a line's name. Adding a fifth line is one weapon module plus its data rows, never a retune of the others. The tech architecture gate checks each commit against this; the cited caller is the pool ruling that the offer grows past four lines.

Parallel lanes: 5 beside 3 and 4; 6 beside 4 and 5. The small hygiene tickets (#82, #64, #55) go wherever their file is next touched; #64 matters more once step 6 ingests tapes.

## Ticket dispositions, all nineteen

| # | Title (short) | Disposition | What survives and where |
|---|---|---|---|
| 85 | The stage answers a levelled player | **Rewrite** | The problem and the replay constraint survive. Body gains decision 19's budget shape, the signal caution, the set piece and sparse rows as off-limits, and drops "tuning pass first". Step 4. |
| 86 | Old design docs read as current | **Keep, rescoped** | Becomes the sweep after the ADR step: game-concept lines 44 and 64, VISION's boundary wording and its "not a survivors game with a director" line, ADR 0047's ordering note, the birthright sentence ADR 0045 names, #26's and #68's "soul stream". |
| 82 | Dirty tape label | **Keep** | As is. Lands when vite.config.ts is next touched; step 6 makes a clean label matter. |
| 81 | Bodies stack on one spot | **Keep, note added** | New callers: three offer bodies side by side (8), the rung body (20), the swarm set piece (14). Step 2 or earlier. |
| 72 | The play area was never designed | **Rewrite** | Frame, controls, phone layout survive. Gains the ladder strip (18) and the stand-in-friendly frame. Step 5. |
| 68 | Rotten food pays full | **Keep, renamed** | The ruling (wisps by count, stream surge by duration) survives and goes to an ADR at the ADR step. "soul stream" becomes skull stream. Step 1 or 2. |
| 67 | Is audio in V1? | **Close** | Answered by decisions 1 and 13: real audio is outside the line; stand-in music is inside as a section marker. The ADR step records it. |
| 66 | Two build flavours | **Keep** | As is. Step 6, before any outside read. |
| 64 | A cut tape kills the tool | **Keep** | As is. Step 6 ingests tapes, so truncation handling is on the road. |
| 55 | Fence counts comments as imports | **Keep** | Hygiene, off the critical path. |
| 51 | Pixi chunk over the warning line | **Keep, not on the road** | Unchanged. |
| 50 | Pixi sound does not split | **Keep, not on the road** | Stand-in music touches audio loading at step 2; look then. |
| 49 | Keep a replay, open one sent to you | **Rewrite** | Keep-and-watch survives (replay is a shipped feature). The file import and export half is superseded by the store (21): a run is kept by upload, opened by id. Step 6. |
| 47 | Real audio | **Keep, off the road** | Post-V1 want. The five placeholder moments survive as the list stand-ins must cover. |
| 39 | Finish v1: bosses, endings, tuning pass | **Rewrite** | The boss and ending half becomes step 2 with the third chunk; the tuning pass becomes step 4's harness-driven tuning. The instrument list (one belch plus play beats the boss, scale, airborne count, spiral versus comeback) survives into the batch report. |
| 38 | Dress the tracer for Halloween | **Keep, off the road** | Out of the line by decision 1. Its constraint comments (layering stack, palette split, drop silhouettes, no brown, no AI purple, hue band) bind the stand-ins at step 2. |
| 37 | Spec: the tracer bullet | **Close** | Delivered except stories 12 to 14 and 22, which move into step 2's ticket. Its "wave director out of scope" and fixed-rows assumptions are superseded. |
| 31 | Run the tracer playtest | **Rewrite** | Becomes step 7: the human read on desktop and phone, runs landing in the store. No tester names, no dates. |
| 26 | The wayfinder map | **Close** | Destination ("tracer played") is superseded by the V1 line; the roadmap page is the map. Its fog list and standing preferences get checked item by item for anything the learnings doc and decisions do not carry, before it closes. |

## New tickets to draft (after the ADR step, per the prompt's order)

One per step above where no ticket survives: progression mechanics (step 1, possibly two tickets: carriers plus offer, and roster plus birthright plus rename), the stage floor (step 2, absorbing #39's boss half and #37's stories), the harness (step 3), the ladder (step 5, unless folded into #72), the store (step 6). Bodies carry problem and need only; approach in a follow-up comment.

## ADRs the grill owes (the ADR step)

Decisions 8 and 9 (rewrite ADR 0034 in place), 10 and 11 (supersede ADR 0002, new ADR for carriers), 13 to 16 (stage shape; ADR 0047 edited in place for its off-limits list and ordering), 17 (harness), 18 and 20 (ladder), 19 (director budget; ADR 0047 or its own), 21 (the store), 1 (the V1 line; game-concept box and v1_in_one_line), the bell arcs (ADR 0036 in place), #68's ruling, #67's answer. Each through the game design gate before filing where it touches progression or density. Then the learnings doc gains what the grill taught.

## Roadmap changes (struck by Mark 2026-09-07)

No roadmap edits and no artifact republish during the push; tickets are the status source. The list below stays only so a later roadmap rebuild knows what changed. `v1_in_one_line` becomes the restated line. Cards: n39a and n39b retire into the stage floor and director cards; n85 rewritten; n31 rewritten; n67 closes; n38 and n47 move to not_on_the_road; new cards for steps 1, 2, 3, 5, 6 with blocked_by edges as the order above. p26 (pinned seed replays cross-device) is superseded by ADR 0047 and gets marked.
