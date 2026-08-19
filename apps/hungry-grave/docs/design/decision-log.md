# Decision log, The Hungry Grave

Newest entries at the top. One entry per decision moment, dated, with enough context to stand alone. Reopening any logged decision is welcome; argue from the game.

## 2026-08-19, entry 13: every fresh run rolls fresh dice; a pinned seed is a shareable run

Ruled by Mark after playing the slice on several seeds. The seed had silently defaulted to 42, so his dozen playthroughs were the identical run; different seeds felt like meaningfully different games, and that variety is a keeper.

1. The player default is a randomly rolled seed per run: first play, R restart, and play again each roll fresh dice.
2. A seed in the URL pins the run, in either form: `?seed=7` before the hash or after the prototype route. Pinning is now the playtest instrument: entry 5's identical-run comparisons and entry 8.2's shared-baseline rationale live behind an explicit pinned URL, not the default.
3. Kept game idea for the real build: seeds are shareable challenges ("can you beat this run?"), so a run's seed stays visible in the UI.

## 2026-08-19, entry 12: each input owns its speed; touch is the finger, keys are a tunable setting

Ruled by Mark after playing the deployed slice on iPad. The touch layer built for #33 capped drag movement at the keyboard's speed "for fairness", and that cap was the input lag he felt: a thumb moving faster than the designated key speed watched the grave trail behind. Diagnosed with the on-device touch instruments; the event pipeline measured fast, the cap was the delay.

1. Touch is uncapped. The grave lands on the drag target every step, at any finger speed, times the drag ratio. There is no touch equivalent of "keys move at a designated speed", so touch borrows no cap from the keyboard.
2. The keyboard keeps a designated speed, and that speed becomes a player setting: a multiplier on the base speed (0.5x to 2.0x in 0.1 steps, Mark widened the range after feel-testing; - and = keys, persisted between runs). Mark had asked for a speed setting before and was argued out of it when focus mode landed (entry 8); that argument is retired.
3. Focus mode (entry 8) stands for keyboard as the hold-to-halve fine-dodge tool, and composes with the multiplier. On touch, focus mode is nothing: drag precision is the fine control. This closes #33's open focus-on-touch question.
4. Sim contract: Input.moveX/moveY is a bare velocity command in base-speed units; each input source owns its own normalization and cap. The spec test asserting touch could never out-dodge the keyboard is retired with the ruling that spawned it.

Cross-input fairness by capping one input to another's feel is a dont-build; feel knobs are per-input player settings.

## 2026-08-18, entry 11: the slice is a prototype route, never the base of the game

Ruled by Mark at the #30 commit gate, before any push or PR. The slice was set up as a task, but it is a prototype: it exists to teach what is possible, what feels right, what is missing, and what needs more work, and it must never become the code future iterations extend.

1. The base app at the root is a blank creation-web scaffold whose only screen lists the prototypes. It statically imports no prototype code; it reaches a prototype only through the registry's dynamic import.
2. Each prototype is one self-contained folder under `src/prototypes/<name>` plus one registry entry, served under a `#/prototypes/<name>` hash route. Removing a prototype is deleting its folder and its entry, nothing else.
3. The slice lives at `src/prototypes/ugly-slice`. When the grilling and prototype sessions have answered their questions, the real game starts from the blank scaffold, from absolute scratch, and this folder can be deleted.
4. This is the standing shape for every future prototype in this app, not a one-off for the slice.

## 2026-08-18, entry 10: the field contests the dive before the playtest

From Mark's playtest verdict ("easy to beat except the boss fights") and the game design gate on #30: trash fired only in the top 60 percent of the field every 2.6 to 5.2 seconds, so diving to eat cost nothing, and the central bet (greed under fire reads delicious, the Downwell shape) could not be tested. Ruled with Mark: raise trash threat modestly now, before playtest #31, so the named tester measures the real bet and not a safe field.

1. The step is modest: faster fire and a deeper fire zone, both plain tuning knobs; Mark judges the result by feel and the bot's full-run data keeps it honest.
2. The numbers stay in tuning, not here; this entry records the why, so a later "too hard" retune argues against the bet, not against a lost reason.

## 2026-08-18, entry 9: the belch fires only at a full reservoir

Raised by the product vision gate on #30: the build required a full reservoir, the record had never ruled it, and gauge-bomb shmups commonly allow partial fire. Ruled with Mark: full only, final, not provisional.

1. The belch is one big earned moment. A partial bomb would dilute the Wall set-piece and muddy the belch-timing instruments the playtest needs.
2. Hoarding keeps its cost either way: charge past a full reservoir visibly splashes and wastes (entry 1.7).

## 2026-08-18, entry 8: hold-to-focus movement, never a speed setting

From Mark's first playtest of the #30 slice: base movement felt slightly too fast for threading boss barrages, and he asked for some level of speed setting. Ruled with Mark:

1. The answer is a focus key, the Touhou / DoDonPachi lineage standard: hold Shift and the grave moves at reduced speed for fine dodging; release and it is back to full speed. The player chooses precision moment to moment instead of configuring it.
2. A per-player speed setting is rejected: every tester plays the identical seeded run so the playtest instruments compare cleanly (entry 5), and the roughly two-second field crossing is a pinned design number (entry 6.3). A slider breaks both; a focus key keeps the one shared baseline.
3. Focus speed is a tuning constant, starting at half speed; the value is slice tuning like any other number.
4. The bot never focuses, so recorded bot runs and the feel-number tests keep the unmodified baseline.

## 2026-08-18, entry 7: the app's base is the create-pixi creation-web template, and React leaves the stack

Mark stopped the build when the app shell turned out to be hand-rolled with the PixiJS scaffolding skill consulted only after rendering code was already being written. His standing rule, recorded here because it outlives this ticket: when tooling ships an official scaffold, the scaffold is generated FIRST and our code fits inside it; its patterns, practices, scripts, and tooling are the defaults, adjusted only when necessary, never bolted on at the end.

1. The base is the create-pixi `creation-web` template, chosen over `bundler-vite` (near-empty) and `framework-react` (its per-entity @pixi/react pattern fights a bullet-heaven field). It brings screen navigation with popup, pause, and focus handling, letterbox resize, an audio plugin with persistent volume settings, an @pixi/ui component kit, and an AssetPack asset pipeline wired into Vite, which is exactly what the Halloween art pass will need.
2. React is out of the stack, Mark's call. The done-contract's stack line (entry 6 era: PixiJS v8 + React + Vite + Vitest) becomes PixiJS v8 (creation-web template) + Vite + Vitest, with all UI in-canvas through the template's screens and @pixi/ui.
3. The sim and its spec tests moved in unchanged; the shell (GameScreen, TitleScreen, EndScreen, HUD, debug panel) was rebuilt as template navigation screens. The bot-driven autopilot, debug instrument panel, and dev phase-skip keys survive as GameScreen keys (P, backquote, 1-7).
4. Named adjustments to the template, each forced by the workspace or the contract: Vitest added (no create-pixi template ships any test tooling), `test` and `typecheck` scripts added because the repo's verify requires them, the resize minimum set to the sim's 540x760 field, the page title, and the app formats with its own template-default prettier config while the repo root ignores the directory.
5. Template defaults deliberately kept as-is: its tsconfig (looser than the repo base; the sim code satisfies both), its ESLint config, its pink UI button assets and PixiJS-logo load screen (placeholder skin until the art pass), and its demo background music on the title and game screens.

## 2026-08-18, entry 6: the grave's shape, units, ceiling, and the build's verification contract

Rulings from Mark's plan review of ticket #30 (the ugly slice build), agreed before code generation resumed.

1. The grave is a rounded rectangle, taller than wide: you are a hole in the ground in the shape of a grave. One scalar (the half-height) is the size; width derives from it at a fixed aspect. Corpses stay small simple shapes.
2. The verb, everywhere: the grave swallows, takes, and passes under. It never drives. This covers docs, code comments, UI copy, and conversation.
3. Logical field units: the sim runs in one fixed 540x760-unit field, the renderer scales it to fill any viewport at fixed aspect, and no number anywhere claims to be a device pixel. The tuned speed makes crossing the field's width take about two seconds.
4. Hard size ceiling, Mark's call: the grave caps at 64 half-height units, standing about a quarter of the field's width tall, because the slice has no zoom tiers to absorb unbounded growth (Katamari's answer is camera zoom, which is the deferred zoom-tiers feature) and the Undertaker's gap rule scales with grave width, so an unbounded grave degenerates the curtain. Growth at the ceiling converts to score, so nothing swallowed is ever worthless.
5. The verification contract, because tests written against existing code only prove the test agrees with the code: spec tests are authored from this design record before they ever run against the implementation, every one asserts a number or invariant from the record and cites the entry it enforces, and when a spec test fails the code is presumed wrong and gets fixed to meet the test, never the reverse; sim invariants (in bounds, size within floor and ceiling, no NaN, entity caps) are checked on every step in tests; a deterministic headless bot plays the full run in a test and asserts the run's shape (about five minutes, kills in band, ten to twelve drops, phases in order, both endings reachable, zero invariant fires); feel numbers are tests; the same bot runs as a dev-only autopilot in the rendered game with a debug overlay so full-stage rendering can be watched and screenshotted without a human; a browser boot check covers load, canvas, input, and console errors. Feel evaluation is Mark's, never the agent's.

## 2026-08-17, entry 5: the stage escalation curve

Resolved wayfinder ticket #32 with Mark. The five-minute slice stage is authored end to end: skeleton, wave model, starting loadout, drop pacing, and the feast wave.

1. Frame confirmed at Mark's raise: the five-minute stage is the proof slice, not the real game's stage. The full-length stage 1 (20-25 minutes, more enemy types, different movement and shot patterns) is map fog, authored after the slice answers the central bet. Within the slice, variety is wave shapes only.
2. Skeleton: Banshee at the ~2:00 midpoint (genre-standard midboss placement with a lull before each boss, per the shmup stage-construction guides), ~30 seconds of fight, Undertaker at ~4:00 for ~60 seconds, roughly ten-second drain-out silences before each, five minutes total including fights.
3. Wave model: fixed authored timeline written as data rows (time, template, placement) over a named wave-template library. Mark leaned hybrid director and asked for the game design gate mid-grilling; the gate's verdict was A-as-data (marker on ticket #32). Load-bearing findings: in a single run a player cannot tell an authored timeline from a seeded director; seeded comparability collapses once a director reads game state (Slay the Spire's documented seeded-run desyncs); the slice's three locked beats fight director pacing logic (Left 4 Dead's director imposes its own peaks); one enemy type makes director variety perceptually nil.
4. The director itself is deferred with triggers, not killed: hand-authoring the full stage proving too slow, or replayability demanding cross-run variety. The slice's playtest-proven templates become its vocabulary. Caution recorded: performance-reading directors invite Battle Garegga's rank failure, where deliberate suicide became optimal. The rate-based faucet is a dont-build (even Vampire Survivors runs authored wave tables underneath).
5. Starting loadout: both floor lines at level 1 (one skull column, one slow headstone), honoring the First Dig capture's "couple of weapon lines." The burst lines only ever arrive through eating, so everything eating gives fires on eating.
6. Drop pacing, reshaped by Mark's kill-explosion point: a flat every-Nth-kill cadence floods once the storm kills fifty in a breath. Drops are priced in kills on a rising curve (Vampire Survivors' leveling model, cited only for the rising price per level; VS also calms its late flood with gem coalescing, which drops here lack, so the payout tuning is the real guarantee), first drop at about kill 5, tuned to pay out ten to twelve drops per run; the dice only pick which line levels. The founding one-in-eight-to-ten reads true in the early minutes and is superseded as the literal mechanism.
7. Wave vocabulary, six shapes for one trash enemy, all top-entry: Drips, the File, the V, the Pincer, the Rain, the Wall. Each teaches a motion the bet depends on; the File's corpse-trail is the core dive made literal.
8. The feast wave is the Wall: edge to edge at 2.5 to 3 times the front half's densest wave (the back half climbs back toward the Wall's figure without reaching it), on screen within ~2 seconds of the full-belch glow, so the loaded belch is unmissable and the wipe is the run's first full-screen catharsis. The Flood (sustained pour) and the Encirclement (three-edge noose) were described and declined: the pour swallows the wipe and muddies the belch instrument, and the noose is the wrong emotion for a feast, plus a side-entry template class built for one moment.
9. Back half climbs to a sustained peak just under Wall density by ~3:30. Exact per-row counts are slice tuning, sized so total kills fund the drop price curve.
10. Close-out gates (all three, standard) on the doc diff. Product vision: VS citation trimmed to what it supports, drop-count instrument added. Game design: Wall density referent pinned to the front half's densest, missed-drops instrument added. Tech architecture: row time is phase-local with phases chained by boundary events, count lives on the row, and every die draws from its own named seeded stream (Slay the Spire's pattern). Two items stay open on the ticket: the feast anchor event (death or swallow fires the glow and the Wall) and no-belch Wall lethality versus the gate's proposed cushion, possibly a difficulty-modes lever; both go back through the gates before the ticket closes.
11. Gates reconvened on the two open items (game design and product vision markers on #32); Mark ruled. The feast anchor is split: the Banshee's death starts the Wall clock (Wall entry ~2 seconds after her death, corpse drop choreographed so a committed dive completes before the curtain closes), and only the swallow of her corpse slams the reservoir and fires the glow. Both pure anchors were dont-builds: death-fires-everything grants the run's loudest power without the mouth, and swallow-fires-everything lets the stage wait on a pickup (no scrolling shmup does; DoDonPachi, Gradius, Touhou) and needs a scroll-off fallback anyway. Her death-feast corpse joins the never-decaying treasure class, so the missed-feast path is scroll-off, not rot.
12. The no-belch Wall is emergent, Mark's call past both gates' proposed cushion: no scripted damage, no scripted death, and no shrink cap. The Wall's enemies are ordinary trash with ordinary contact shrink, and crossing it unloaded is carving a lane and weaving on skill, Vampire Survivors' swarm model, where the swarm is the threat, not a script. The cushion (capped total shrink under the feast payout) was declined as a new mechanism where none is needed. Consequence accepted: a bad crossing can end a run by physics; if playtest deaths cluster there, the knob is the Wall's count on its row, which doubles as the later difficulty lever, and the belch-on-wave instrument records the no-belch outcome as its third case.

## 2026-08-17, entry 4: the slice miniboss and boss

Resolved wayfinder ticket #29 with Mark. The slice miniboss is the Banshee, the boss is the Undertaker, bosses are always shootable and bell-push-immune, and both boss questions routed from ticket #28 are closed.

1. Skeleton: always shootable, health bar in chunks, one pattern per chunk, short invincible flash at chunk breaks during which player shots do nothing. Touhou-style pure-dodge survival phases were priced and declined v1-wide (see point 9). This dissolves the routed wisp question: homing wisps are plain damage against bosses, no boss-side rule needed.
2. Bell versus bosses (routed from #28): full bell damage, zero pushback on miniboss and boss, adds pushed normally. Vampire Survivors precedent: bosses and elites resist or ignore knockback so big enemies cannot bounce off their own threat; protecting authored patterns is the day-one readability rule.
3. The Banshee: chunk one is slow expanding tear-rings with one clean gap each; chunk two adds a second offset ring source so gaps desync. Rings beat aimed fans because slow curved shapes read through the player's own storm (Boghog's shmup 101, Sparen's danmaku design guide: low density and clear bullet direction carry readability). Her ring deliberately echoes the player's bell ring, two owners of one shape, split by layer and palette.
4. The Undertaker: chunk one is falling clod-curtains with one moving gap; chunk two is a slow shovel spiral plus summoned digger zombies whose corpses feed the fight. Mark's concern that a fixed gap punishes size earned before the fight produced the rule: gap width equals current hole diameter plus a fixed margin, and clods are ordinary bullets (one small shrink), never walls.
5. Freshness: shed armor and add corpses decay normally, the urgency being the point; phase-break feast chunks never decay, like upgrade drops, so the reward beat is calm and steady-bright keeps meaning treasure.
6. Banshee death feast: growth worth roughly 8 to 10 fresh trash corpses plus an instant full belch with a pulsing glow, and the next wave arrives deliberately oversized as the belch's target. Undertaker death: the swallow is the victory animation, no payout; the grave eats the gravedigger.
7. Raised by Mark at close-out, recorded as map fog rather than a slice change: difficulty modes for replayability (normal and up, tuning density and speed) and whether v1 is the polished slice stage itself, Vampire Survivors' one-map first version being the shape.
8. Belch versus bosses, the gap the product gate caught (neither the grilling nor the routed questions had ruled on the one button): the belch is the bomb everywhere, cancelling every enemy bullet on screen including boss patterns, dealing a big chunk of boss damage, never pushing a boss, with the pattern resuming immediately (genre standard: shmup bombs clear bullets and damage bosses). Mark's condition: the taming is tracked work, not a hope; the map's belch-tuning fog now covers boss fights and the slice instruments belch rate inside each boss fight.
9. Gate adjust (product vision): the no-survival-phase rule is v1-wide, not slice-only, argued from identity (the player's storm must always matter, and an untouchable boss suspends the fantasy); reopenable per this log's preamble if a later boss concept earns it.
10. Gate adjusts (game design + product vision) accepted: the oversized post-Banshee wave is already arriving when the full-belch glow lands, so the loaded belch is never reflexed into empty sky (slice instrument added); the digger zombies are the slice's one trash enemy re-spawned by the boss, no new enemy budget.
11. Shared ring shape deferred with a trigger, both gates converging: the Banshee's tear-ring deliberately shares the bell ring's shape, and if a slice tester misreads a tear-ring as their own bell or cannot say which ring hit them, the cure is shape-breaking the tears into teardrops before touching the pattern.

## 2026-08-17, entry 3: the four weapon lines

Resolved wayfinder ticket #28 with Mark. The v1 lines are the soul stream, orbiting headstones, will-o-wisps, and bell shockwaves; grasping hands are cut from the working set.

1. Floor versus burst: the stream and headstones are always on; the wisps and bells fire per swallow, so eating defends the dive at the exact moment of commitment and the funeral bell doubles as the eat-chime the First Dig flagged as load-bearing for the sparse early minutes.
2. Gate adjust (game design): the baseline eat-chime and swallow juice fire from the first swallow regardless of loadout, since lines arrive as RNG drops; the bell line upgrades the chime the player already knows into the damage ring. The alternative (bell as a guaranteed starting line) was not needed.
3. The soul stream never homes; levels add straight fanned columns. Homing is the wisps' identity only, with no cross-line homing upgrades: homing trades power for convenience, and in a game whose one skill is positioning it stays quarantined behind the eat verb (shmup homing-design writing; gate adjust trimmed the citation so Thousand Edge is cited only for straight high-count fire staying readable, while fanned density is vulcan-lineage grammar).
4. Live enemies are never food; contact shrinks the hole the same as enemy fire. This is the anti-cheese rule that stops "get big and drive under everything," raised by Mark's own question; the unopposed hole reading as shallow is the documented Donut County failure.
5. Grasping hands cut because their jobs are spoken for (close defense is the headstones', crowd punctuation the bells') and they read on the ground layer where corpse-versus-drop legibility lives. Close-defense orbiters are a proven archetype (King Bible and Garlic in Vampire Survivors).
6. Mouse-cursor aiming raised and declined; controls stay as boxed (entry 1, point 7). No-aim positioning is the genre's skill axis, and aim variants are a recorded different feel routed to the deferred arena mode. Both cuts are now dont-builds in the concept doc.
7. Saturation plausibility from geometry: five columns at 25-30 visible skulls each hold 100-150 airborne from the stream alone, independent of fire rate; with stones, wisp flights, rings, geysers, and belch spikes the ~300 target is tuning, not content, exactly what the numbers table demanded.
8. Watched risks routed onward: bell knockback pushing kills up-screen into staler corpses under the freshness meter (slice instrument added: average freshness at swallow), line distinguishability at full density (slice instrument added), both to #30; boss interactions (pushback immunity, wisp auto-DPS through dodge phases) to #29.

Level-1-versus-5 silhouettes for all four lines are in the concept doc's economy section and the ticket #28 resolution comment.

## 2026-08-17, entry 2: the conveyor cure is one freshness meter

Resolved wayfinder ticket #27 with Mark. The cure for bottom-edge camping is both candidate mechanisms folded into a single per-corpse freshness meter, not two systems.

1. Every corpse runs one meter, about 10 seconds from kill to gone. The seconds are derived and the coupling is the invariant (game design gate): a mid-screen kill must reach the bottom edge nearly empty, so any scroll-speed retune retunes the meter to hold that ratio.
2. Freshness multiplies all three payouts (size growth, burst volley, belch reservoir charge) down to a floor of about 25 percent; scraps are never worthless.
3. Slice read: fill brightness fades as the meter drains; corpse size stays constant so corpse-vs-drop shapes stay unmistakable and stale scraps stay easy to drive over. Near empty, a brief last-chance flicker (game design gate: Devil Daggers pairs its window with one, and a continuous fade alone reads "how much" but not "vanishing now"). At empty the dirt sucks the corpse under, a short swallowed-by-the-earth animation Mark wants even in the rectangle slice.
4. Upgrade drops never decay; the scroll is their only deadline. Permanent power never silently rots, and the steady-bright drop beside fading corpses is an extra legibility cue.
5. Boss-shed edible pieces inherit the same meter by default; ticket #29 may override for feast chunks.
6. Watched risk, deferred to the slice's after-hit instrument: freshness thumbs the spiral side of the open comeback-versus-spiral question, since the player pinned low after a hit is the one eating quarter-value scraps. Fallback cures if it bites (game design gate): a higher freshness floor at the smallest size tier, or freshness scaling only burst and belch while growth stays flat.

Success is measurable by the slice's off-bottom-edge instrument. Comparables that priced the call: Devil Daggers' ~10s gem decay (deadline produces the attack-then-scoop rhythm), DoDonPachi bees and Raiden medals (placement-scaled value), Vampire Survivors' persistent gems (what camping looks like when pickups never expire).

## 2026-08-17, entry 1: First Dig verdict is Pursue, and the founding decisions

First Dig (the /new-game-idea workflow) ran end to end: capture, grilling, three review gates plus a follow-up frame gate, verdict. Mark accepted Pursue and shelved housewarming to focus here. Full evidence and numbers: [first-dig-2026-08-17.md](first-dig-2026-08-17.md). Concept: [game-concept.md](game-concept.md).

Decisions locked in this entry, each Mark's explicit call:

1. The game: "The Hungry Grave", a Halloween vertical scrolling shmup crossed with hole.io; the protagonist is a moving open grave, chosen over hearse, war-wagon, and nine other candidates for having the highest weapon-line saturation potential (the swallow economy plus multiplicative growth).
2. Mechanical ending: authored stages capped by a final boss. v1 done-line is one stage plus final boss; three stages stay the target. Survival-timer and endless modes are future iterations.
3. Frame: pure vertical scroller for v1. The scroll is the corpse deadline. Free-roam arena is recorded as the deferred survival mode's native frame; a panning-wide playfield is a dont-build.
4. Economy: hybrid. Always-on free weapon lines carry saturation; each swallowed corpse erupts as a burst; strict corpse-per-bullet was killed by arithmetic (needs ~200 kills/s). Corpses must be physically eaten by driving over them.
5. Size is health, with a hard size floor (can always eat the current tier's smallest corpse) so the comeback path never closes.
6. Overflow rule: drops for maxed lines are still eaten (radius, score, bomb charge). Everything goes in the hole. Death costs a chunk of weapon levels and some radius, so late drops re-matter.
7. Controls: steering, autofire, one button, the belch (capped reservoir, visible overflow waste).
8. Gate adjustments accepted as design rules: conveyor cure required (decay or freshness, ticket open); bosses shed edible pieces; readability layering from day one; hits never zoom the camera back mid-stage; satellites (if ever) never automate eating; zoom tiers and satellites deferred with named triggers.
9. Sidecar and tracker: the game lives at apps/hungry-grave; planning runs on a Wayfinder map as GitHub issues per docs/agents/issue-tracker.md.
