# Open tickets: what each asks for and what it assumes

Pulled with `gh issue view <n> --json` on 2026-09-01 from niftymonkey/the-cabinet. All nineteen are OPEN. Quotes are verbatim from the body or comments. "None stated" means the ticket carries no sentence on that axis.

Axes per ticket:
- (a) how mob density is set: fixed authored rows vs directed
- (b) how weapon progression works: uniform roll of four compiled lines vs offer of three, per-run roster, skull-stream-only birthright
- (c) which weapon lines exist and what they are called (soul stream vs skull stream)
- (d) sequencing stated relative to other tickets

---

## #85 Nothing in the stage answers a levelled player

Labels: none

Asks for the mechanism that delivers ADR 0047: directed density inside the authored beats, driven by the pressure the player is under rather than the power they hold, layered on top of the authored floor, with replay from seed plus inputs as the binding constraint. It also folds in a re-evaluation of total on-screen bullet and mob volume, since directed fill stacks on the player's own storm. Five acceptance criteria: a levelled player is threatened in the back half, a weak player faces the unchanged baseline, shedding power is never the stronger line, replay from seed plus inputs matches exactly, and combined volume stays inside the readability band.

Assumptions:
- (a) The body describes the current state as fixed rows and the target as directed: "The stage is a fixed authored timeline and nothing in it responds to how strong the player has become." / "The same rows, the same counts, the same types arrive at the same times whether a player reaches the back half fully levelled or nearly dead." / "ADR 0047 supersedes the authored-rows ruling: the stage keeps its authored beats while density and timing inside each phase are directed by the pressure the player is under and never by the power they hold, added on top of the authored floor, with replay from seed plus inputs as the binding constraint and shareable-seed comparability dropped." Comment 1: "`RAMP_ROWS` and `BACK_HALF_ROWS` in `apps/hungry-grave/src/game/stage/stage.ts` are static arrays of time, template, count and type, and nothing in that module reads grave size or any weapon level."
- (b) Assumes drop choice and per-run rosters are already ruled: "Since then, drop choice and per-run rosters have widened build divergence, so one fixed density cannot be balanced against every combination of weapon lines." Comment 1 names the birthright: "should be re-read against tape from the post-2026-08-31 build (drop choice, skull-stream birthright, belch changes)".
- (c) Uses "skull-stream" (comment 1, quoted above). No line list given.
- (d) Comment 2 (gate markers) records that tuning goes first: "Mark ruled: softened to a reason to look, with #39's tuning pass first (ADR 0047, a25e711b2c)". Roadmap edges deliberately left unset: "n85 and n86 carry no edges in a block declaring itself complete, while n39b tunes a static density now that n85 rebases as a floor next, and n31 waits behind n39b. -> deliberately not added; the ordering is Mark's call and is the next session's work". Also: "n85 carries no edge to #39's tuning half. -> ... the edge stays Mark's call".

Gate markers: comment 2 carries three gate markers dated 2026-09-01 on the ADR 0047 doc diff, each with resolutions: `gate:game-design v1 depth:standard verdict:findings`, `gate:product-vision v1 depth:standard verdict:findings`, `gate:tech-architecture v1 depth:standard verdict:findings`. Rows still open and assigned to this ticket: the bot never levels so it measures the floor alone; MOB_CAP 160 / CORPSE_CAP 200 need re-deriving or a live-mob budget; the clear-rate-outrunning-fill-rate guard; WITNESS_VERSION 4 to 5 and `foldStage` folding only `firedRows` (carried to the build dispatch). Noted loose end: "0046's roster paragraph is still unmarked and is a loose end".

---

## #86 Early design docs still read as current truth

Labels: none

Asks for a doc-by-doc pass over `docs/design/` and the north star (`VISION.md`), deciding for each whether it is updated to the rulings, pruned, or kept and visibly marked as a historical stage record, so that nothing presented as current is stale. Widened on 2026-09-01 to include VISION.md after two gates found it contradicting ADR 0047.

Assumptions:
- (a) States the ruling is directed density and that VISION.md still carries the authored-stage bet: "It still carries the authored-stage bet, a proposal question every future stage proposal is measured against, and a line ruling out a performance-reading director. The directed-density ruling answered all three the other way". Comment 2 names the three VISION.md spots: "The section 2 bet, \"the stage is authored and a seed is the same run anywhere\", including \"nothing reads the player's performance to reshape it\" and \"every tester on a seed plays the identical run\"." / "Proposal question 9, \"Does a pinned seed still replay the same run anywhere?\"" / "Section 6's \"Not a survivors game with a director. No spawn faucet, no performance-reading waves.\""
- (b) Names the weapon pool, belch and birthright as already-changed rulings: "the design has since evolved through recorded rulings: the weapon pool, the belch, the birthright, and now stage direction have all changed shape." Comment 1: "`game-concept.md` predates the 2026-08-31 belch and drop-choice rulings and the ADR 0047 stage ruling".
- (c) None stated.
- (d) None stated. Comment 1 fixes the canon: "The canonical current record is the ADRs plus `CONTEXT.md`." and "`decision-log.md` is frozen by standing ruling and is not to be rewritten."

Gate markers: none on this issue; comment 2 cites the gates on #85 as the reason for the widening.

---

## #82 A tape's commit label can name a build it was never recorded on

Labels: none

Asks that a tape recorded from a dirty working tree be visibly marked as such, so a reader can tell a clean-build tape from a dirty-build tape without checking by hand, while existing tapes still decode and replay. Motivated by one #79 tape labelled with the glossary commit but playing the 832 Territory lay period that was uncommitted at the time. Candidate fix is `git describe --always --dirty` at the single site in `vite.config.ts`, with filling the empty `buildIdentity` header field as the alternative.

Assumptions:
- (a) None stated.
- (b) None stated.
- (c) Names Territory as a line via its constant: "labelled `35ead20a74` (the glossary commit, which carries `TERRITORY_PERIOD` 500)".
- (d) None stated beyond the #79 origin: "One of the three tapes recorded for #79 is labelled with the glossary commit".

Gate markers: none.

---

## #81 Nothing keeps two bodies off the same spot

Labels: none

Asks for a deterministic separation mechanism so live mobs never come to rest fully overlapping and falling corpses settle beside, not inside, bodies already down, in place early enough that future mob design (every mob seeks the grave at a type-specific speed) can lean on it. Candidate directions listed and none chosen: separation steering, corpse settle offsets, a shared spatial partition.

Assumptions:
- (a) None stated on how density is set; it takes crowd density as given: "At crowd density, mobs and corpses stack directly on top of one another".
- (b) None stated.
- (c) None stated.
- (d) "#79 carries the verdict but rules this build out of its own scope; this issue is that build's home." / "The future mob design work (mobs have never been designed; all mobs eventually seek the grave) does not have a ticket yet; when it gets one, it should lean on this mechanism".

Gate markers: none. Comment 2 records a Mark refinement of 2026-08-30 on seek speed.

---

## #72 The play area is fitted, not designed: layout, controls, and presentation

Labels: none

Asks for the frame around the field to be designed deliberately across desktop and phone: composed layouts per screen shape, every control placed and styled (including a left-handed reach for the belch button), a first-time player understanding what to touch, HUD and readouts at the field's craft bar, with the field's readability rules holding wherever the design touches.

Assumptions:
- (a) None stated.
- (b) None stated.
- (c) None stated.
- (d) Boundary with #38: "Boundary with #38: that ticket owns the field's Halloween art and theming. This ticket owns the frame around the field, the layout, and the controls." Also claims `GameHud.ts` and `DebugPanel.ts` as unowned and inside scope, and "The v1 roadmap's phone card is fitted at 390x844 and its sign-off has not been run."

Gate markers: none.

---

## #68 Freshness does not scale the burst, so a rotten corpse buys a full volley

Labels: bug

Asks that the on-swallow burst scale with freshness on the same curve and to the same quarter floor as growth and reservoir charge, per ADR 0004, with a test that fails if the burst is ever paid without freshness applied. Comment 2 records Mark's 2026-08-25 ruling on the axis: wisps scale by count floored at one soul, the soul stream surge scales by duration, and the ruling wants promoting to its own ADR when picked up.

Assumptions:
- (a) None stated.
- (b) None stated on progression mechanics. It assumes the wisp flight has five levels: "a fresh one at level 5 tears loose the full flight" and "a bare proportional count pays zero at level 1, where the flight is a single wisp".
- (c) Names the two on-swallow lines as the soul stream and the will-o-wisps, with the file path `soulStream.ts`: "`src/game/lines/soulStream.ts:173` is `surgeStream(state: RunState): void`, and `src/game/lines/wisps.ts:161` is the same shape." / "The two on-swallow lines pay in different currencies. The soul stream pays as a surge, a beat of thickened fire, so freshness could scale its duration or its density. The wisps pay as a count of homing souls". Ruling comment: "**The soul stream surge scales by duration.**" and "column count is exactly what defines the five level silhouettes".
- (d) "Ruled by Mark 2026-08-25, as the starting point, with the repercussions to be dealt with during the tuning pass." Found "while rebuilding the v1 done-line on 2026-08-25; recorded in `apps/hungry-grave/docs/design/v1-done-line.md`."

Gate markers: none. Comment 2 is a ruling comment, not a gate.

---

## #67 Rule whether the real audio is inside the v1 done-line

Labels: wayfinder:grilling

Asks for a citable ruling, as a new ADR, on whether the real audio (#47) is inside the v1 done-line or after it, with the v1 promise list moving to match.

Assumptions:
- (a) None stated.
- (b) None stated on progression. Cites the chime rule: "the baseline chime fires from the first swallow regardless of loadout. About RNG drops leaving the early minutes silent."
- (c) Names the bell as chime owner via ADR 0005's title: "`apps/hungry-grave/docs/adr/0005-weapon-lines-are-a-pool.md`, the bell as the eat-chime."
- (d) "#38's comment calls it a scope call with no home. #47's own comment ends \"Sequencing is open.\"" / "Whichever way it goes, the v1 promise list has to move with it, and #47 gains or loses its place inside the done-line." / "Where the ruling should land: a new ADR under `apps/hungry-grave/docs/adr/`, not the decision log. The log was frozen on 2026-08-19".

Gate markers: none.

---

## #66 Ship a player build that cannot hand itself weapon levels

Labels: wayfinder:task

Asks for two build flavours per ADR 0020 so the deployed player build ignores `?levels=` and `?size=` (starting every run at the birthright loadout and default size) while a development build still honours them, with a ruling on whether `#/replay` and `#/runs` sit behind the same gate, and a check that fails if a player build ever honours a dev control.

Assumptions:
- (a) None stated.
- (b) Assumes a birthright loadout exists as the run's start and that `?levels=` sets a "maxed loadout": "Anybody on the deployed URL who types either one gets a maxed loadout or a chosen starting size." / "The deployed player build starts every run at the birthright loadout and the default starting size, whatever `?levels=` and `?size=` say." Comment: "`apps/hungry-grave/src/app/seedFromUrl.ts:104`, `levelsFromUrl` reads the URL unconditionally."
- (c) None stated.
- (d) "since the `?invariants=` half of the same obligation was discharged by deletion in 3dce299ab4" (under #45). Constraint: "`apps/hungry-grave/src/tape/verificationReadback.test.ts:153` records Mark's 2026-08-24 ruling that a `?levels=` run's tape must still verify rather than diverge. The gate must change whether the parameter is honoured, never what a tape records." "No ticket carries this obligation, so it would reach a public playtest by default."

Gate markers: none.

---

## #64 A truncated tape crashes the measure tool instead of reporting it

Labels: none

Asks that measuring a truncated tape return a report naming truncation (distinct from trailerless and from sealed) and exit without throwing, per ADR 0019's three-arm answer, covered by a test. One of eight recorded runs on disk is truncated today and kills `scripts/measure.ts` with `TapeFormatError`.

Assumptions:
- (a) None stated.
- (b) None stated.
- (c) None stated.
- (d) None stated.

Gate markers: none.

---

## #55 The boundary fence counts module paths in comments as imports

Labels: none

Asks that the architecture fence in `src/boundary.test.ts` stop reporting module paths mentioned in comments as imports, while still failing a real cross-boundary import, both cases tested. Two JSDoc sentences were already reworded to get past the false alarm.

Assumptions:
- (a) None stated.
- (b) None stated.
- (c) None stated.
- (d) "Found by the technical architecture gate on #48 slice 3".

Gate markers: none on this issue; it cites a gate finding on #48.

---

## #51 The pixi bundle chunk is over vite's size warning line

Labels: enhancement

Asks that the roughly 589 kB pixi chunk warning become understood and intentional: either reduce the chunk or accept the size and raise `build.chunkSizeWarningLimit` with a comment recording what was measured and when. Explicitly not an instruction to reduce.

Assumptions:
- (a) None stated.
- (b) None stated.
- (c) None stated.
- (d) "This stays out of dispatch 6a unless measured evidence later points at it." / "`#50` is adjacent and should be looked at in the same sitting".

Gate markers: none.

---

## #50 @pixi/sound does not split into its own chunk

Labels: enhancement

Asks that the `@pixi/sound` deferral either work or be abandoned on purpose: the production build emits no split warning, and either the package lands in its own chunk or every import is static and no code claims deferral. Comment flags that the dynamic import's JSDoc reason is about deferring past a `document` probe, not bundle size, and that `main.ts:15`'s static side-effect import may already defeat it.

Assumptions:
- (a) None stated.
- (b) None stated.
- (c) None stated.
- (d) "It stays out of dispatch 6a unless measured evidence later points at it."

Gate markers: none.

---

## #49 Let a player keep a replay, and open one somebody sent them

Labels: wayfinder:task

Asks for player-usable replay: keep a run after it ends and find it later, watch it back exactly, export it as a file, import somebody else's file and watch it, playback bounded by verified checkpoints with a clear refusal, storage never losing a run silently, nothing about play changing. Reserved route `#/watch` with no id segment; IndexedDB not localStorage.

Assumptions:
- (a) None stated.
- (b) None stated.
- (c) None stated.
- (d) "**Blocked by #45**, the instrument, and its dispatch 6a spec is #48." / "dispatch 6a (#48) produces the tape bytes, and 6b's scope is a dev-facing tape store, the `#/replay?tape=<url>&at=<tick>` agent route and `measure(tape)`." / "Mark ruled on 2026-08-23 that replay stays in the v1 done-line, the box line is trimmed to what the dispatches deliver, and this ticket owns the rest." / "The link half is deferred in `game-concept.md` under \"Deferred, with triggers\"".

Gate markers: none. Comment 2 is an ownership-boundary note citing ADR 0033: "**Dispatch 6a's verification readback does not satisfy this ticket's replay obligation.**"

---

## #47 Give the game its real audio, replacing the five placeholders

Labels: wayfinder:task

Asks for the real audio replacing the five synthesized placeholders (`sfx-swallow`, `sfx-treasure`, `sfx-toll`, `sfx-hit`, `sfx-eruption`): Halloween read by ear within seconds, swallow chime from the first swallow reading as reward, audible toll on its own clock, unmistakable hit, eruption as the largest sound, every moment distinguishable by ear, balanced mixing, and a missing clip leaving the run playable and silent.

Assumptions:
- (a) None stated.
- (b) Assumes the chime fires regardless of loadout: "The swallow chime fires from the very first swallow and reads as a reward rather than a click."
- (c) Names the bell's toll and the belch eruption as sound moments: "The swallow chime and the bell's toll are both headline criteria of the tracer". No stream line is named.
- (d) "Sequencing is open. The natural slot is alongside or just after #38, for the same reason #38 waits: audio laid over a game whose feel has been read dresses something known." / "Relation to #38: that ticket is the visual art and theming pass and it stays visual. ... they are siblings rather than one inside the other." / "the tracer plan's never-cut list names the art pass and says nothing about sound, and section 6's dispatch sequence has no audio slot after 5."

Gate markers: none.

---

## #39 Finish v1: both bosses, both endings, and the tuning pass

Labels: wayfinder:task

Asks for the Banshee with the Wall set piece, the Undertaker, both endings, and a tuning pass read against instruments across several seeds: one belch plus play beats the boss, grave-to-mob scale fits, the airborne-projectile figure is measured and recorded with the tuning revision, and a spiral-versus-comeback read exists split at the size floor.

Assumptions:
- (a) The stage is treated as an authored artifact to tune, no director mentioned: "The tracer's stage runs to a stubbed victory, so the run has no real ending". Acceptance: "The grave-to-mob scale fits the intended density." / "Tuning reads are checked against several seeds, not one."
- (b) None stated.
- (c) Cut order names "weapon lines beyond the four": "Section 7 of that plan holds the cut order if the calendar tightens: weapon lines beyond the four, then the third mob type, then the Wall's oversizing, then the miniboss."
- (d) "Carries dispatches 6 and 7 of `apps/hungry-grave/docs/design/tracer-plan.md` section 6: the Banshee with the Wall set piece, the Undertaker, both endings, then the tuning pass." Per #26's map, blocked by #38. Per #85's gates, its tuning pass is now referenced as the thing to run first and as the instrument that dropped comparability affects.

Gate markers: none.

---

## #38 Dress the tracer for Halloween: the art and theming pass

Labels: wayfinder:task

Asks for the art and theming pass over a game whose feel has been read: Halloween within seconds, every mob still readable before it acts, corpses still read as food with tiers distinguishable, drops still say their weapon line mid-dodge, grayscale check passes, no brown, no AI purple, and no non-fire art in hue 20 to 39. Six comments accumulate inherited constraints: the ADR 0014 layering stack, the 4.15 palette split, the feel magnitudes in `FieldRenderer`/`StormRenderer`, the drop silhouette rule (tall, round, pointed, wide), the line-image-on-drop correspondence, and the audio scope question that became #47.

Assumptions:
- (a) None stated.
- (b) Assumes drops exist as the upgrade vehicle and are legible per line: "Drops still say which weapon line they upgrade, mid-dodge, with no HUD glance." / "A weapon line carries a representative image, and that same image appears on the line's drop." No offer-of-three or roster mentioned.
- (c) Four lines, named by imagery and palette keys: "Four drops, each drawn at 24 units, filling their box with no dark core, breathing on size alone, and split on the coarsest silhouette axis there is: tall, round, pointed, wide." / "a headstone is tall, a skull is round, a flame is pointed, a bell is wide." / "`skull` is hue 208.24, `stone` is 208.42 and `bellRing` is 210.00, three hues inside two degrees of each other at saturation 0.11 to 0.21. `wisp` at hue 172.24 is the only one that is genuinely distinct." / "Three of the four weapon lines are one colour on the field". Headstones (`stone`) are assumed present.
- (d) "Takes its slot immediately after #36's deploy and play, per Mark's ruling of 2026-08-19 recorded in `apps/hungry-grave/docs/design/tracer-plan.md` section 6, rather than waiting behind the tuning pass. That section's never-cut list includes it." / Body: "It is also the only thing standing between the playable tracer and v1." / "Related: the scan cannot see a texture at all ... it runs at the weapon-lines dispatch and again at tuning."

Gate markers: none on this issue. Comment 4 notes the render-structure gate raised `fieldFrame`; comment 6 cites "the implementation gate round on #36".

---

## #37 Spec: The Hungry Grave tracer bullet

Labels: ready-for-agent

The spec for the tracer build (#36): the deployed URL lands on a title screen, the five-minute authored stage rebuilt with three mob types from an open pool, wisps as ordnance, a field that grows teeth, drops legible by line, a gong bell, a belch that beats the boss, fresh seeds with URL pinning, and phone layout. Twenty-five user stories, implementation decisions, testing decisions, and an out-of-scope list. No comments.

Assumptions:
- (a) Fixed authored rows, and the wave director explicitly out of scope: "The five-minute authored stage carries over as the design record has it (authored rows over named templates, phase-local time, the miniboss, the Wall, the boss), with rows gaining a mob-type column so the timeline introduces the tougher and meaner types across the run." / Out of scope: "the wave director." / Story 9: "As a player, I want the field to grow teeth across the run, so that max power still has work to do." / Story 20: "As a playtester, I want a pinned URL to replay the identical run, so that reads compare cleanly across testers." / Story 17: "I want to pin a run with `?seed=` and see my run's seed on screen, so that I can share a run as a challenge." / "Any phone difference stays in presentation and never touches a sim number, because a sim number that varies by device makes the same seed a different game and destroys the pinned-run instrument."
- (b) Drops carry a line identity from spawn and are dived for; no offer, no roster: "Drop entities carry their weapon line identity from spawn; legibility renders from that identity on the drop itself, never via the HUD." / Story 10: "I want every drop to show which weapon line it upgrades at a glance mid-dodge, so that I can want a specific drop and dive for it." / Story 24: "I want the swallow chime and juice from my very first swallow regardless of loadout". Balance: "Belch fill and drop pricing are retuned only after the field has teeth, last in the tuning order."
- (c) Names wisps and the bell; no stream name appears in the spec. "wisps as meaningful ordnance" / "a maxed bell starving its own corpse supply is the bell's deliberate price (Hungry Grave ADR 0005)" / "the ticket's balance relations are spec-test material: wisp hits to kill per mob type, and, as the arithmetic consequence of wisps per swallow times hits per kill, a bound on how many trash one swallow's wisps can clear. There is no runtime cap; the storm always matters."
- (d) "The build runs under the feature playbook's dispatch contract; the dispatch plan (module boundaries, verification steps, the full test list) lives with ticket #36. The named playtest ticket runs against this build and is blocked by it." / "it lands before scale tuning locks, since scale tuning is its named trigger."

Gate markers: none. Spec comments: none (zero comments).

---

## #31 Run the tracer playtest with a named tester

Labels: wayfinder:task

Asks for the tracer playtest to be run (Mark and Richard at the deployed URL), with the resolution recording the three instruments' readings (time off the bottom edge, belch rate versus full-reservoir time, hit legibility), the observed felt arc, the verdict on the central bet, and what changes in the map's fog.

Assumptions:
- (a) None stated directly; it inherits #37's pinned-run instrument via "Waits on #36."
- (b) None stated.
- (c) None stated.
- (d) "Part of #26" / "Waits on #36. Mark plays, and Richard plays the tracer in the browser at the deployed URL (named 2026-08-19). The date gets written in when #36 lands." / "Richard is also the read on the dispatch-5 build, which is playable and completable well before the full tracer finishes, so this ticket becomes the second outside read rather than the only one." Per #85's product-vision gate: "n31 waits behind n39b."

Gate markers: none.

---

## #26 The Hungry Grave: way to the tracer, played

Labels: wayfinder:map

The wayfinder map: destination is a tracer played by Mark and one named tester with a recorded read on the central bet. Carries orientation instructions, standing preferences, a "Decisions so far" list of closed tickets, a "Not yet specified" list with triggers, an out-of-scope list, and the generated mermaid map.

Assumptions:
- (a) The map's closed-ticket summary records the stage as fixed authored rows, and the fog list holds density knobs as authored settings: "#32: five-minute skeleton with drain-outs before each fight, a fixed authored wave timeline as data rows (phase-local time, per-die seeded streams) over six named templates" / "Wave count-on-row is the built-in knob (ticket #32), and a lethal-density no-belch Wall is a candidate hard-mode setting of that same knob." / "Difficulty modes for replayability (normal and up, density and speed knobs)". Satellite mini-graves trigger: "maxed weapon lines leave the field feeling thin at the density the tracer measures."
- (b) The #28 gist records uniform-pool progression and a superseded-in-part note: "each weapon line now owns its own firing trigger and the line pool is open, the bell tolls on its own clock rather than per swallow, and homing is capped at one line at a time rather than quarantined to the wisps." Out of scope: "Pause-menu upgrade choices: progression is physical and in-run, per the founding capture." The 2026-08-31 gate comment names the newer machinery as under review: "the choice sphere's paused pick is a command class no tape section carries" / "the sphere concentrates the change's new machinery, a pause, a menu, a new recorded input, while the tapes argue only for the offer of three. -> **Human decides**" / "rosters varying by unlock state make a shared seed a different challenge per player, and no record rules what a challenge shares. -> **Human decides**".
- (c) Body names the four lines under the old name: "#28: soul stream, orbiting headstones, will-o-wisps and bell shockwaves; grasping hands cut". Destination: "the four weapon lines as meaningful ordnance". The 2026-08-31 gate comment names the rename: "belch-thread grilling record: ADR 0008 and 0034 rewrites, new ADR 0045 and 0046, the skull stream rename".
- (d) Map edges as drawn: #36 -> #31, #33 -> #31, #30 -> #31, #45 -> #36, #36 -> #38, #38 -> #39, #45 -> #49, #36 -> #59, #45 -> #59. Body: "The Halloween art and theme pass ... is now its own ticket, [Dress the tracer for Halloween](#38), sitting between the tracer's first play and the bosses". Map text: "**Frontier** (gold, thick border) is open, unblocked and unassigned: 3 of 15 ready to pick up now." The map does not include #85, #86, #82, #81, #72, #68, #67, #66, #64, #55, #51, or #50.

Gate markers: five. Four dated 2026-08-17/18 on the concept (First Dig receipts): `gate:game-design ... verdict:findings`, `gate:product-vision ... verdict:findings`, `gate:tech-architecture ... verdict:clear`, `gate:game-design ... verdict:findings` (playfield frame). One dated 2026-08-31: `gate:product-vision v1 depth:standard verdict:findings` on the belch-thread grilling record, with two rows marked "**Human decides**" and rows routed to ADR 0018, ADR 0046, game-concept.md and VISION.md.

---

## Cross-ticket index of the four axes

Tickets carrying a fixed-authored-rows assumption in their own words: #37 (spec, wave director out of scope), #26 (map gists and fog list), #39 (tunes the stage as-is). Tickets stating directed density as the ruling: #85, #86.

Tickets assuming a drop-dive uniform progression with no offer or roster: #37, #38 (drop-per-line correspondence), #26 body. Tickets naming drop choice, per-run rosters, or the birthright as ruled: #85, #86, #66 (birthright loadout), #26's 2026-08-31 gate comment (offer of three, rosters, "Human decides").

Tickets using "soul stream": #68 (ruling comment and file path `soulStream.ts`), #26 body (#28 gist). Tickets using "skull stream": #85 (comment 1), #26's 2026-08-31 gate comment ("the skull stream rename"). Tickets naming headstones or `stone` as a line: #38, #26 body. No ticket names Territory as a line except #82 via `TERRITORY_PERIOD`.

Stated sequencing chains: #37 -> #36 -> #31; #36 -> #38 -> #39 (per #26 map and #38 comment 1); #47 alongside or just after #38, with #67 deciding whether it is inside v1; #49 blocked by #45; #85 after #39's tuning pass per the gate resolution, with roadmap edges for #85/#86 deliberately unset; #31 recorded as waiting behind n39b in #85's gate comment; #50 and #51 out of dispatch 6a and looked at together.
