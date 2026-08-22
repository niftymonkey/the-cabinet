# Tracer plan, tickets #36, #38 and #39

This is the dispatch-contract planning half from `docs/agents/feature-playbook.md`: the definition, the verification steps, the module boundaries, the seams, and the test list. The coding dispatches execute it.

Ruling that opens this plan (Mark, 2026-08-19): the tracer starts the real base game. Built fresh from the blank scaffold per Hungry Grave ADR 0010, nothing lifted from `src/prototypes/ugly-slice`. `main.ts` is brought to playbook Rule 1 in the same work.

**Scope, stated plainly because the name misleads.** This build is v1 minus the Halloween art and theming pass. Every clause of the concept doc's v1 done-line appears in section 1, so "it is only the tracer" is not available as a reason to let one more thing in. Anything added from here argues against a v1 scope line.

The module architecture in section 3 was designed with the `architect-deep` skill and reviewed by Mark. The plan was then reviewed by all three gates on 2026-08-19 and revised; their markers are on #36.

## 1. Definition, in observable terms

A player who opens the deployed URL lands in the real game, not the prototype list, and starts a run from its title screen. They play the five-minute authored stage from the design record, rebuilt with the session-13 harvest folded in:

- Three mob types share the field, visibly different in behavior and readable before they act: base trash where only a share of each wave fires at all, a tougher type that fires a damaging shot the moment it enters, and a type whose body is the threat and which turns toward the grave (Hungry Grave ADR 0016).
- Wisps are meaningful ordnance: a few hits kill trash, about five kill a tougher mob, and one swallow's whole burst can never clear a wave by itself.
- The first minutes are quickly fun and real power arrives early, while the field grows teeth across the run: later phases bring the tougher and meaner types, not just more of the same.
- Every drop shows which weapon line it upgrades at a glance mid-dodge, on the drop itself, never via the HUD.
- The bell tolls on its own clock from level 1, heard and seen and felt by the mobs it reaches, its damage falling off with distance so the far edge of a big ring tickles rather than kills (Hungry Grave ADR 0005).
- One belch plus good maneuvering and guns beats the boss; two or three belches in one fight reads as skilled play.
- The grave-to-mob scale fits the density the field is tuned to hold.
- The field lays out for a phone browser as well as a desktop browser, through one fitted mapping of the fixed field into the viewport.
- Mob fire wins wherever it overlaps the storm, checkable in grayscale, at the density this build actually produces (Hungry Grave ADR 0014).
- Every run rolls a fresh seed, `?seed=` pins it, the run's seed is visible, and a pinned seed replays the same run on a phone and on a desktop (Hungry Grave ADRs 0012 and 0015).
- Prototypes stay reachable, moved behind `#/prototypes`; the ugly slice keeps working untouched.

Four weapon lines is the commitment. More than four is a stretch goal for this build and never a miss if it does not land (Mark, 2026-08-19).

A phone-specific layout mode is deferred behind a trigger, Mark's own read on a real phone. The fixed 540 by 760 unit field stays the sim's unit space (Hungry Grave ADR 0003), no number in the sim is ever a device pixel, and any phone difference stays in presentation and never touches a sim number, because a sim number that varies by device makes the same seed a different game and destroys the pinned-run instrument.

Belch fill and drop pricing are retuned only after the field has teeth, in the final tuning dispatch.

### The saturation number is a measurement here, not a target

The concept doc's "~300 airborne projectiles" was an assumption introduced to run an arithmetic check in the First Dig record, never a sourced or observed figure (raised by Mark, 2026-08-19).

The arithmetic it served does not depend on it: at 300 airborne over a 1.5 second life the strict one-corpse-one-bullet economy needs 200 kills per second, and at 100 airborne it still needs 67, so Hungry Grave ADR 0002 stands at any plausible number.

The place the figure binds is Hungry Grave ADR 0014, whose grayscale readability check has to run at some stated density. So in this build the number is produced rather than assumed: the field is tuned until it is fun, the airborne-projectile instrument reads what that field holds, and the measured figure becomes the density the readability check must pass at. The figure is recorded with the tuning revision that produced it, so a later retune cannot silently move the bar it is checked against, and it is the peak across the bot's runs and Mark's own, because a headless bot measures the bot's storm and a greedier human produces a denser one.

## 2. Verification steps, each with its actor

1. Spec tests authored from the design record, the glossary, the ADRs, and the spec before implementation, each citing what it enforces (Hungry Grave ADR 0013). Actor: the agent.
2. Sim invariants (in bounds, size within floor and ceiling, no NaN, entity caps) checked on every step in every sim test. Actor: the agent.
3. The rendering-import boundary enforced mechanically as an allowlist, not a denylist: `src/game` may import only from `src/game`, and `src/input` only from `src/input` and `src/game`. An allowlist closes the transitive case by induction, where a shared engine util looks sim-shaped today and pulls rendering in behind the boundary after a later edit. No shipped file under `src/game` imports `src/dev`; test files under `src/game` may, because ADR 0013 requires the invariant harness on every step in every sim test and the harness lives in `src/dev` as the rig rather than the game, so the rule exists to keep the rig out of the build rather than out of the tests (qualified in the sim-core dispatch, 2026-08-20). Actor: the agent.
4. Full-run bot test asserting the run's shape (about five minutes in ticks, kills in band, ten to twelve drops, phases in order, zero invariant fires) across at least five distinct seeds. A second bot policy deliberately takes hits, because a policy that wins never touches the size floor and the whole damage ladder could be missing with every other assertion still passing; both endings need the two policies between them. Actor: the agent.
5. `pnpm typecheck` and the production build. Actor: the agent.
6. Rendered check of the built app via `vite preview`, screenshots actually read: the game's title screen serves the default route and starts a run, prototype list intact at `#/prototypes`, the four drop icons distinguishable, the seed visible, an armed shambler distinguishable from an unarmed one, the revenant's tell visible before its shot, a stale corpse visibly dimmer than a fresh one, and a revenant corpse distinguishable from a shambler's by hue. Those last four are render properties no sim test can see, and this is the only mechanism in the plan that catches them missing. Actor: the agent.
7. On-device input check from the deployed URL after the input dispatch, steering the grave around an otherwise empty field. The playbook makes this escalation mandatory for input-feel changes, and waiting until the end buries an input problem under five dispatches of content. Actor: Mark.
8. Grayscale readability check: a screenshot from the autopilot at the density the tuned field measures, converted to grayscale, with mob fire still winning everywhere it overlaps the storm. Actor: the agent for the check, Mark for the feel call.
9. A deploy and a short play at the end of dispatch 5, before bosses and tuning are built on top. Early-minutes fun, the bell's moment, drop legibility mid-dodge, and grave-to-mob scale are all judgeable there, and all four feed what dispatches 6 and 7 build. Actor: Mark.
10. Final deploy to hungry-grave.vercel.app, then the checks only a human can run: belch-versus-boss balance, the phone layout on a real phone, the recorded spiral-versus-comeback read that #36 requires, and the cross-device replay, opening the same `?seed=` on the phone and on a desktop and comparing the visible seed, the ending and the score. That last one is the only place ADR 0015's actual claim can be checked, because CI only ever proves determinism inside one engine. Actor: Mark. The agent delivers the build ready and reports it ready; it never claims the feel is right.

## 3. Module boundaries

One rule holds the whole design up: `src/game` and `src/input` are the game's rules and import no rendering code. Verification step 3 enforces it, because a single careless import destroys it silently and nothing else in the design would notice.

Every dependency here is pure in-process computation. There is no network, no third party, and no storage behind any of these interfaces, so the design has no ports and no adapters anywhere.

`step` mutates run state in place and returns the tick's events. At storm density, pooled entities mutated in place are the right answer and immutability would be a real trap; this is stated because the prototype collects events on the sim instead, and a coding agent reading it for pattern would otherwise guess differently.

### `src/game/`, the game's rules

- `advance.ts`: the frame seam above `step.ts`. `advance(run, clock, elapsedMs, steer)` converts one frame's elapsed time into whole ticks through `clock.ts` and steps that many times, asking `steer` for a command per tick. It lives here rather than inside a pixi screen for the same reason `clock.ts` does: otherwise the accumulator is shared with the autopilot and the loop that consumes it is not, and dispatch 7 writes a second one. Added by the dispatch-3b plan, where the tech gate found the tick loop untested and untestable inside a screen.
- `step.ts`: the sim seam. `step(state, command)` advances one fixed tick and returns events. It hides the order of a tick: scroll, input, spawns, motion, overlap detection, deaths, decay, culling. It orchestrates and does not hold rules; every overlap's consequence belongs to the module that owns the rule, named below.
- `clock.ts`: the accumulator that turns real time into fixed ticks of sixty per second, and its catch-up clamp, so a backgrounded tab or a slow phone frame cannot fire a burst of ticks the player has no chance to answer. It lives here rather than in a screen so the autopilot and the rendered game share one implementation; otherwise the bot's run is not the player's run. A run's length is counted in ticks, never wall clock.
- `math.ts`: every implementation-approximated operation the sim uses, rounded to single precision (Hungry Grave ADR 0015): `sin`, `cos`, `tan`, `atan2`, `exp`, `log`, `pow`, `hypot`. Nothing else in `src/game` calls those or `Math.random` directly, and the lint rule covers both. The sim prefers vector math to angle math, because a normalized direction uses only exactly-specified operations and needs no rounding at all.
- `run.ts`: run state, the seed roll, score, and the ending.
- `events.ts`: the event vocabulary. Three subscribers now that the instruments live outside the sim, so the payloads must serve all three: freshness on the swallow event, a drop-expired event, and a reservoir-full event, or the instruments cannot measure missed drops or belch-rate-versus-full-time from outside. Payloads carry values, never entity references: entities are pooled and mutated in place, so a held reference is a recycled slot by the time a sound or an instrument reads it. This is the one type module in the game and it is not the old `types.ts`, which was a bag of everyone's entities.
- `tuning.ts`: the numbers that are not a single thing's own stats. A mob type owns its health, payout and size, and a weapon line owns its level curve, so those stat rows live as exported tables at the top of their own module and this file holds the rest. Two homes, stated, rather than one home and a claim that stopped being true.
- `rng.ts`: named seeded streams (Hungry Grave ADR 0006), independent by construction.
- `caps.ts`: the entity cap policy, identical on every device and never lowered for a phone's frame budget, since a device-varying cap makes the same seed a different game and spends exactly what Hungry Grave ADR 0015 paid for. Dropping is totally ordered by entity id so it is deterministic and unit-testable. At the cap something must decide which entity is dropped, and that is a gameplay rule; `invariants.ts` only checks the cap, and checking is not enforcing. If the policy lived in `src/dev` the test rig would be load-bearing in the shipped game.
- `overlap.ts`: rectangle overlap in field units. A leaf helper, not a seam.
- `grave.ts`: size, growth, shrink, the size floor's damage ladder, ceiling overflow, the hitbox, and the grave's motion under a move command. Owns the consequence of mob fire meeting the grave. Hides Hungry Grave ADR 0003 entirely.
- `swallow.ts`: the one verb. What a swallow pays: growth scaled by freshness, the on-swallow lines firing, the reservoir charging, the chime, and overflow when a weapon line is maxed or the grave is at its ceiling. Owns the consequence of food meeting the grave. Five ADRs (0002, 0003, 0004, 0005, 0008) meet at this one moment.
- `corpses.ts`: corpses, freshness, and feasts. Hides the decay curve, the scroll-speed coupling invariant, the payout scaling to its floor, and the dirt taking an empty corpse under (Hungry Grave ADR 0004).
- `drops.ts`: the rising kill price, the dice that pick which weapon line levels, and the drop's weapon line identity from spawn (Hungry Grave ADR 0002).
- `belch.ts`: reservoir fill per swallow, the cap, the visible splash past full, firing only at full, and the consequence of the eruption meeting the field (Hungry Grave ADR 0008).
- `mobs.ts`: the mob type table, one behavior function per type, trash mob fire, and the consequence of a mob being hit, whether by the storm, by the bell's ring, or by an orbiting headstone. The bell's case carries the exception that a boss takes its damage and never its push while adds are pushed normally, so no coding agent invents it later. One file rather than a folder because a mob type is a stat row plus a small rule, and the table reads best as a table. Each type owns how it moves, whether and how it fires, its health, its corpse payout, and its size (Hungry Grave ADR 0016).
- `lines/`: `soulStream.ts`, `headstones.ts`, `wisps.ts`, `bell.ts`. A folder rather than a table because each weapon line hides real machinery. Each owns its firing trigger: the stream and the headstones are always on, the wisps fire on each swallow, and the bell tolls on its own clock (Hungry Grave ADR 0005). The floor-versus-burst taxonomy is gone, so nothing in the code branches on a category.
- `stage/stage.ts`: the phase machine and the authored rows as data, phases chained by boundary events (Hungry Grave ADR 0006). Rows carry a mob-type column.
- `stage/templates.ts`: the placement library. A template says where a group arrives and how it is arranged, never which type is in it (Hungry Grave ADR 0016).
- `bosses/chunks.ts`: chunked health, the invincible flash at breaks, shed food, and immunity to bell push while adds are pushed normally (Hungry Grave ADR 0007).
- `bosses/banshee.ts`, `bosses/undertaker.ts`: one authored boss each.

There is deliberately no `projectiles.ts`, no `movement.ts`, and no `collide.ts`. The storm is what the weapon lines emit and mob fire belongs to the mobs and the bosses; applying a velocity is ten lines and belongs to the grave; and a module holding only "all the overlap tests" hides nothing, because a caller still has to know which pairs matter and what each one does. What that last omission needs, and now has, is every consequence named on an owner above.

### `src/input/`, pure input models

- `keys.ts`: keyboard steering, the persisted speed setting from 0.75x to 1.5x, and the hold-to-focus key.
- `steering.ts`: the one rule that turns a live keyboard and a live drag into a single move command. Touch wins while it is steering, keyboard otherwise; they are never summed, because one is a velocity and one is a position error. Added by the dispatch-3b plan, where all three gates found the seam missing.
- `touch.ts`: uncapped drag steering onto the drag target, and the second finger as the belch.

Both produce the same bare move command in base-speed units, and each owns its own normalization and cap (Hungry Grave ADR 0011). The stale-drag-target handoff lesson from #33 is pinned as a spec test here.

### `src/app/`, rendering. Pixi lives here and only here

- `main.ts`: rewritten to playbook Rule 1. The router serves the game at the default route and the prototype list behind `#/prototypes`. Rule 1's specimen is the shape to copy, never the routing to copy: its routing goes stale the moment this rewrite lands.
- `layout.ts`: one fitted mapping of the fixed field into any viewport, inside the create-pixi template's letterbox resize rather than bolted beside it (Hungry Grave ADR 0009). It hides every device pixel in the app.
- `palette.ts`: every colour the game draws, each declared with its luminance, so the value band Hungry Grave ADR 0014 reserves for mob fire is a data rule a unit test can check. Without it the band can only be checked by a grayscale screenshot, which is structurally blind to anything not on screen at that instant: a later phase's boss pattern, the invincible flash, the last-chance flicker.
- `screens/game/layering.ts`: the fixed draw stack (Hungry Grave ADR 0014). Container order only; the band is `palette.ts`'s.
- `sound.ts`: subscribes to the event list and makes the game audible. The swallow chime from the first swallow and the bell's toll are both headline criteria, and the create-pixi template ships the audio plugin (Hungry Grave ADR 0009), so this is wiring plus an asset source, not a new dependency.
- `screens/game/FieldRenderer.ts`, `screens/game/GameHud.ts`, `screens/game/DebugPanel.ts`, `screens/TitleScreen.ts`, `screens/EndScreen.ts`: render only, subscribing to sim state and events. No game rules.

### `src/dev/`, the test rig, not the game

- `bot.ts`: the deterministic headless player, two policies (a competent one and one that deliberately takes hits), and the same bot as the dev-only autopilot in the rendered game (Hungry Grave ADR 0013).
- `invariants.ts`: in bounds, size within floor and ceiling, no NaN, entity caps.
- `instruments.ts`: the design reads, including the after-hit spiral-versus-comeback instrument and the airborne-projectile count that becomes ADR 0014's density figure.

### The seams under test

- `step(state, command): SimEvent[]` and `createRun(seed?): RunState`: the sim seam.
- The stage rows as plain data.
- `KeySteer` and `TouchSteer` producing a move command in base-speed units.
- The event list in `events.ts`.
- `layout.ts`'s viewport-to-field mapping, the pure function that guarantees no sim number is ever a device pixel.

## 4. Design proposals folded in, for Mark's review

Mob roster, working names, Halloween theming later. All three obey Hungry Grave ADR 0016's readability rule: a mob is readable before it acts.

- Shambler, the base trash: falling mover, only a fixed share of each wave fires at all, and **the armed ones look armed**, or "picking targets matters" is a difficulty knob rather than a skill. Dies to two or three wisp hits.
- Revenant, the tougher type: fires one aimed damaging shot immediately on entry, then on a slow interval; about five wisp hits; bigger corpse payout. It needs a visible tell that precedes the shot, because otherwise its only tell is the damage.
- Seeker, the body threat: turns toward the grave and its contact shrinks you. Its turn rate is slow enough that cutting hard across it beats it, and that relation is a spec test rather than a tuning number, because a thing that is fast and turns perfectly is what players call cheap.

Corpse size is constant across mob types even though the revenant's payout is bigger: the payout is data and the size is not, or the corpse-versus-treasure silhouette rule breaks. That leaves payout unreadable, so corpses carry a per-tier hue. Brightness is spoken for by freshness and luminance by the reserved value band, but hue is free, and without it the player is asked mid-dodge to remember which of five corpses came off the tougher mob they killed eight seconds ago. Vampire Survivors tiers its XP gems by colour for the same reason. Size never gates a swallow, whatever the food and whatever the grave (Hungry Grave ADR 0003).

Drop legibility: each drop is a steady-bright icon of its weapon line's projectile silhouette (skull, headstone, flame, bell) in a per-line colour, sized up from the slice's 9 units so it reads mid-dodge. No brown, no purple.

Freshness legibility: corpses hold constant size and visibly fade as freshness drains, with a last-chance flicker near empty. Without it freshness is a hidden multiplier and the greed-has-a-deadline choice never presents itself, and the steady-bright-means-treasure cue only works as a contrast.

Bell: an audible toll from level 1 on its own clock, its radius reaching a short way at level 1 and nearly across the field at level 5, its damage falling off with distance from the grave, and pushback arriving at the higher levels. Level 1's radius and period are tuned so the first toll always has a visible victim. The maxed bell starving its own corpse supply is deliberate and recorded in ADR 0005 as the bell's price, watched by the freshness-at-swallow instrument.

Wisp ordnance numbers: wisp damage 1; shambler HP 3, revenant HP 5. The relation the spec test enforces reads over one swallow's **whole** burst payload, not the wisps alone, because the bell and the soul stream's post-swallow surge are on the same field.

Scale: mobs shrink relative to the field and per-wave counts rise, sized by the density instruments. The grave's floor and ceiling get re-judged against the new mob size by feel, Mark's call.

## 5. The planned test list, categorized

Pinned as `test.todo` on stubs at each dispatch. Every test cites the ADR, spec line, or decision log entry it enforces.

- rng and determinism: identical seed gives identical streams; two named streams from one seed never emit identical sequences; no seed rolls fresh dice; `?seed=` pins in both URL forms (ADR 0012); the sim calls no raw implementation-approximated operation and no `Math.random`; and a committed golden digest over a short scripted scenario with fixed inputs matches, regenerated by a documented command. The digest is the test that can see the engine, which replaying one seed twice cannot (ADR 0015).
- clock: the accumulator emits whole ticks only; catch-up is clamped; the bot and the screen produce the same tick sequence for the same elapsed time.
- grave: width derives from the one scalar at fixed aspect; base speed crosses the field's width in about two seconds; hits shrink and start invulnerability; the hitbox shrinks with size; growth past the ceiling converts to overflow; at the size floor the damage ladder runs in order, bleeding score first, then dropping weapon levels back to the birthright, and only sealing the grave shut when nothing is left to bleed (ADR 0003).
- swallow: every payout arrives through a swallow; growth scales by freshness; the on-swallow lines fire on the swallow that earned them; the reservoir charges; the swallow chime fires from the very first swallow regardless of loadout; a maxed weapon line's drop pays overflow; a swallow at the ceiling pays overflow (ADRs 0002 and 0005).
- input: focus halves keyboard speed while held; the multiplier steps 0.75x to 1.5x by 0.05 and persists (narrowed on the 3b game design gate, see ADR 0011); touch is uncapped and lands on the drag target every step; the second finger belches, edge-triggered; a steering lift with the second finger down hands off or clears the drag target, never stale (the #33 lesson); pause cancels touch (a durable feel rule of this build's own, recorded in the dispatch-3b plan; ADR 0011 carries each input owning its speed and no pause rule at all).
- corpses: freshness seconds derive from scroll speed, the coupling invariant; payouts scale down to the 0.25 floor; an empty corpse is taken under; feasts never decay; corpse size is constant across mob types (ADRs 0004 and 0014).
- drops: the price rises on the curve; the dice pick only which weapon line levels; every drop carries its weapon line identity from spawn; drops never decay (ADR 0002); and across the seeds the full-run test uses, every weapon line reaches at least level 1, because eleven drops spread uniformly over four lines otherwise leaves about one run in twenty with no bell in it at all, and one pinned playtest seed is where that goes unnoticed.
- belch: the reservoir fills per swallow, caps, and visibly splashes past full; it fires only at full; it cancels every mob-fire shot on the field, damages a boss, and never pushes one (ADR 0008).
- caps: at the entity cap the drop policy is the one stated, deterministically, and the cap is never exceeded.
- mobs: each type's behavior; a mob holds the template's arriving motion for a beat before its own movement takes over, while its firing is not delayed by that beat (ADR 0016); the seeker's turn rate is beaten by a hard cut; wisp-hits-to-kill relations per type; one swallow's whole burst payload kills at most two trash (#36); live mobs are never food and contact shrinks the grave (ADRs 0005 and 0016).
- weapon lines: the soul stream never homes, columns by level, surging after a swallow; headstones orbit and tick damage by level; wisps home, count by level per swallow, and expire; the bell tolls on its period regardless of swallows, its radius grows by level, its damage falls off with distance, its pushback appears only at the levels that own it, and one toll alone cannot clear a wave, the bound the wisps already carry and which the bell walked out from under when it left the swallow; bosses are immune to its push while adds are pushed (ADR 0007); the first toll after the bell's drop lands damage within a bounded time, so "the first toll always has a visible victim" has a watcher rather than a tuning intention; at most one weapon line homes at a time and no homing line is always-on (ADR 0005).
- stage: rows are phase-local and phases chain on boundary events; counts live on rows; each template places its shape and names no mob type; drain-out windows spawn nothing; the ramp's first 45 seconds hold only Drips and one File; later phases introduce revenants and seekers on the rows; an identical seed gives an identical spawn sequence (ADRs 0006 and 0016).
- set pieces: the Wall stays crossable unloaded and is never crossable for free, asserted by two bot policies, one crossing without belching and surviving at a real cost in size or hits, one belching and crossing clean; the unloaded policy is written as a plausible human rather than an optimizer (ADR 0016); the Banshee's death starts the Wall clock and only her corpse's swallow slams the reservoir (entry 5.11); a bot policy that dives for her feast completes the swallow before the curtain reaches the grave, so the run's most choreographed beat is a red test rather than a silent tuning drift; the Undertaker's curtain gap tracks grave width plus the margin (ADR 0003); his swallow is the ending and pays nothing (ADR 0007).
- layering and palette: the draw stack holds its fixed order; every declared colour outside mob fire sits outside mob fire's reserved value band, checked as data; the belch eruption never occludes mob fire; the grave's rim draws above the food layer while the mouth's interior stays beneath it; a hit announces on at least two channels, one of them not the shrink; the grayscale check passes at the measured density (ADR 0014).
- layout: the sim's field units survive the mapping unchanged and no sim number is ever a device pixel; a phone viewport and a desktop viewport both present the whole field; the mapping sits inside the template's resize (ADRs 0003 and 0009).
- boundary: `src/game` imports only from `src/game`, `src/input` only from `src/input` and `src/game`, and no shipped file under `src/game` imports `src/dev`, while a test file under `src/game` may, because the invariant harness is the rig rather than the game (ADR 0013).
- full run, across at least five seeds: run shape in band, phases in order, zero invariant fires; the competent policy reaches victory and a bot that belches once inside the boss fight can win it, read as a perfect-play upper bound (#36); the hit-taking policy reaches sealed shut through the full damage ladder.
- instruments: time off the bottom edge; the after-hit spiral-versus-comeback read, recorded separately above the size floor and at it, because above it a hit shrinks the hitbox and helps while at it the ADR 0003 ladder strips weapon levels and hurts, and one averaged number describes neither; belch rate versus full time; drop count and spacing; missed drops; freshness at swallow; airborne projectile count; mobs on screen; the belch-on-wave three cases; and tick debt from the catch-up clamp, which is the only read that separates "the game feels slow" from "we blew the frame budget" on a phone.

## 6. Dispatch sequence

Seven dispatches, each carrying the full contract from the playbook. Dispatch 3 was split in two on 2026-08-20 and the sequence is eight items long as it stands.

1. Shell: `main.ts` to Rule 1, the router's default route becomes the game, `#/prototypes` keeps the list, Title, Game, and End screen skeletons over a stub sim, the allowlist boundary rule from the first commit, and a fix for a live bug on this path: `src/engine/utils/storage.ts` calls `localStorage` unguarded from `userSettings.init()` in `main()`, and a browser blocking cookies throws, giving a playtester a blank screen and a console error nobody reads. This dispatch adds a second persisted setting to that same path.
2. Render structure: `layout.ts`, `palette.ts`, and `layering.ts`, before any field content, so every later renderer attaches to a viewport mapping and a stack that already exist. Readability is a day-one rule and refitting a layout around finished renderers is rework. ADR 0014 was amended on 2026-08-19 to place the bell's ring and the belch's eruption in the stack and to forbid additive blending on the storm, so nothing here is blocked.
3. Sim core, split in two by Mark on 2026-08-20. One dispatch mixed the headless rules with the app wiring that makes them playable, and verification step 7 reads input *feel*: landing input beside ten headless modules buries the cause when it feels wrong.
   - **3a, the headless sim**: `math.ts`, `rng.ts`, `clock.ts`, `tuning.ts`, the grave, the swallow, run state, the event vocabulary, the tick order, the golden digest, and the lint rule that keeps the sim off raw implementation-approximated operations. Nothing player-visible changes and there is no deploy. Plan: `docs/design/dispatch-3a-sim-core.md`.
   - **3b, making it playable**: both input models, the `?seed=` URL in both forms, the grave renderer, `GameScreen` rewired onto `clock.ts`, and the tick-debt readout. Ends with the deploy and the on-device input check (verification step 7). Plan: `docs/design/dispatch-3b-playable.md`.
4. The field: the three mob types, templates, stage rows, overlap resolution, corpses and freshness, plus a stubbed victory on the stage's last row. The stub matters more than it sounds: without it the only ending reachable before dispatch 6 is sealed shut, so the deploy at dispatch 5 would be a play of a game that cannot be won, and "goes start to finish" would first exist two dispatches from the end. With it, every deploy from here on is a complete run and that property never regresses. Ends with the deploy and a play by Mark. Plan: `docs/design/dispatch-4-field.md`.

   **Done.** What shipped stubbed, and what it means for anyone reading a dispatch-4 build: victory is a stub that fires on reaching the `over` phase rather than on the Undertaker's death (ADR 0007); both boss phases are empty and end on the tick they begin; the feast's never-decaying flag is tested and unused by any spawner; the mob silhouettes are placeholders and #38 owns the art; and nothing kills a mob except `clearingPolicy`, the test rig's stand-in for the storm, which dispatch 5 deletes. The Wall ships untested against ADR 0016's own property, because both bot policies that carry it need the belch. `dodgePolicy` does not survive the ramp on every seed and does not reach the `over` phase from the size ceiling; that is a finding about content authored against a build with no weapons in it, and the dispatch-4 report carries the numbers.
5. Weapon lines and the economy: the four lines, drops with per-line legibility, pricing, the belch, `sound.ts`. Ends with the deploy and play at verification step 9.

The Halloween art and theming pass takes its slot here, immediately after that play, rather than waiting behind dispatch 7 (ruled by Mark 2026-08-19). It is now the only thing standing between this build and v1, and a Halloween game shipping on Halloween without the Halloween look is the one failure the date cannot absorb. Putting it after the first play means it dresses a game whose feel has been read once, and it stops being an open-ended trigger.
6. Bosses: the Banshee with the Wall set-piece, the Undertaker, both endings.
7. Tuning: density, scale, and ordnance, then belch fill and drop pricing last, against the instruments and across seeds. The airborne-projectile figure is read here and recorded with its tuning revision. Ends at the deploy for Mark's remaining feel checks.

Every dispatch ends green on its tests plus typecheck and build. The rendered check runs at 1, 2, 3b, 4, 6, and 7; the grayscale check at 4, 5 and 7. 3b was added to that list in its own plan, because it draws the first player-visible field content since dispatch 2. 4 was added in its own plan for both: it draws the first mobs, corpses and mob fire, and its grayscale check is explicitly a floor rather than the real one, because there is no storm yet and the density the check exists for cannot be produced.

## 7. The cut order, and what is never cut

Every open call this plan carried was ruled on 2026-08-19 and folded in above: the arrival beat is scoped to movement, a set piece names its property rather than its cast, size never gates a swallow, and ADR 0014's stack is amended.

What remains is the calendar. Ten weeks, evenings, seven dispatches plus an art pass, against a date that does not move. So the cut order is decided now, while it is calm, rather than in October:

1. Weapon lines beyond the four. Already stated as a stretch everywhere it appears, and a fifth line is not one thing: it is five level looks that must each read differently, plus a motion no line owns yet, plus a value-band check.
2. The third mob type. It is the newest content and the two remaining types already carry "reading the field is a skill" between them.
3. The Wall's oversizing, falling back to an ordinary dense wave. The stage still runs; the belch loses its showcase.
4. The miniboss. The v1 done-line names one authored stage plus a final boss, so the Banshee is content rather than a promise, and this is the last thing to go before the done-line itself breaks.

Never cut, because each is the reason a cut version would still be worth shipping: the art pass, the phone fit, the cross-device determinism work, and the readability rules. Cutting any of those saves a little time and costs the thing the build exists to prove.

Booting straight into the game came off that list on 2026-08-20, when Mark ruled that the title screen stays. It was not cut for time and it is not abandoned: the want is recorded in Hungry Grave ADR 0010 as a deferred item with its own trigger, the playtest link going out, and a mechanism still to be chosen.

Still unowned: no dispatch carries a date. Dating the first three would give a two-week read on a ten-week plan for almost nothing, and that is a call for Mark rather than a thing this plan can assert.
