# Tracer dispatch 5: weapon lines and the economy

This is the plan half of the feature playbook's dispatch contract for tracer plan section 6 item 5.

Dispatch 4 filled the field and gave the player one verb: dodge. Nothing in that build kills a mob except `clearingPolicy`, the test rig's stand-in for the storm. This dispatch gives the grave its teeth. Four weapon lines fire, kills leave corpses that were already built to be swallowed, drops arrive on a rising price and level the lines, the reservoir fills and the belch fires, and the game makes sound for the first time.

It is also the dispatch the record has been deferring to. Section 9 of `dispatch-4-field.md` defers thirty items and section 10 records twenty-three more, found by the gate round. Section 11 of this plan lists every one of the fifty-three with what this plan does about it. Nothing on that list is dropped silently.

You are writing production code in `/home/mlo/dev/niftymonkey/the-cabinet/apps/hungry-grave`.

Read `docs/agents/feature-playbook.md` at the repo root first and follow it. This prompt is the plan half of its dispatch contract; you execute.

Read these before you write anything: `apps/hungry-grave/docs/adr/0005-weapon-lines-are-a-pool.md`, `apps/hungry-grave/docs/adr/0002-hybrid-swallow-economy.md`, `apps/hungry-grave/docs/adr/0008-the-belch-full-only-the-bomb-everywhere.md`, `apps/hungry-grave/docs/adr/0004-one-freshness-meter.md`, `apps/hungry-grave/docs/adr/0003-size-is-health.md`, `apps/hungry-grave/docs/adr/0014-readability-layering.md`, `apps/hungry-grave/docs/adr/0013-the-sim-verification-contract.md`, `apps/hungry-grave/docs/adr/0015-determinism-across-devices.md`, `apps/hungry-grave/docs/adr/0016-mob-types-and-templates-are-pools.md`, `apps/hungry-grave/docs/design/tracer-plan.md` sections 3, 4 and 5, `apps/hungry-grave/docs/design/dispatch-4-field.md` sections 9 and 10, and `apps/hungry-grave/CONTEXT.md` for the vocabulary.

**Never open `src/prototypes/` at all.** Not to read, not to copy, not to check. Everything you need is in this prompt and the docs above.

## 1. The thing, in observable terms

The grave stops being harmless. It kills, it collects, and it gets stronger inside a single run.

When it works:

- Skulls pour straight up out of the grave's mouth from the first tick of the run, in rigid fanned columns, and the column count grows with the soul stream's level. The stream never homes, and it surges for a moment after every swallow.
- Stones orbit the grave from the first tick, damaging what they touch, in counter-rotating rings at the higher levels.
- Every swallow tears wisps loose that hunt the nearest mob and expire if they find nothing. The wisps are the run's only homing line and they are never on unless a swallow bought them.
- A bell tolls on its own clock from level 1, an expanding ring whose damage falls off with distance, whose radius grows by level, and whose pushback arrives only at the higher levels. Bosses take its damage and never its push.
- A mob dying leaves a corpse, exactly as it does today, and the corpse now arrives because a weapon killed it rather than because the rig cleared it.
- Kills buy drops on a rising price, ten to twelve in a full run. Each drop is a steady-bright icon of its own line's silhouette, readable at a glance mid-dodge without looking at a HUD, and swallowing it levels that line.
- A maxed line's drop, and growth past the size ceiling, both convert to overflow rather than to nothing.
- Swallows fill the reservoir. Past full it visibly splashes and wastes. At full, and only at full, the belch fires: every mob-fire shot on the field is cancelled, the eruption reads across the whole field, and the reservoir empties.
- The game has sound: the swallow chime from the very first swallow whatever the loadout, a brighter chime for a drop, the bell's toll, a hit, and the eruption.
- A run can now be won by playing rather than by surviving, and the size floor's damage ladder has weapon levels to strip for the first time.
- The build is deployed and Mark has played it.

What this build is still **not** is v1. Both bosses are still empty phases that end on the tick they begin, victory is still the dispatch-4 stub firing on the `over` phase, and every magnitude here is a first pass that dispatch 7 tunes against instruments this dispatch does not build.

## 2. Verification steps, with actors

1. Every planned test in section 7 written and green. Actor: you.
2. `pnpm lint`, `pnpm typecheck`, and `pnpm build`, all clean. `vitest` alone is not enough: prettier errors have shipped three times and only `pnpm lint` sees them. Actor: you.
3. The sim invariant harness runs on every step in every sim test, per ADR 0013, and gains the checks in section 6.26. It is not yours to weaken. Actor: you.
4. `clearingPolicy` is deleted and the full-run tests pass without it. Until that deletion the run tests are measuring the rig rather than the game. Actor: you.
5. A rendered check of the built app via `vite preview`, screenshots actually read. **Play a run, end it, and play another**, because this app's defects live in the screen pool. Read: the soul stream's columns at more than one level, the headstones orbiting, wisps launching on a swallow and homing, a bell ring at its full radius, the four drop icons distinguishable from each other and from a corpse, the reservoir readout filling, the belch eruption, and mob fire still winning wherever the storm crosses it. Actor: you.
6. A grayscale check at the densest moment a played run reaches, converted with `filter: grayscale(1)`, read for whether mob fire wins wherever it overlaps the storm (ADR 0014), **and for whether a drop and a shot are tellable apart**, since section 6.8 spends the size channel between them. Dispatch 4's grayscale check was explicitly a floor because there was no storm; this is the first one that can produce the case the rule exists for. Actor: you.
7. Deploy to production, following `apps/hungry-grave/docs/deploy.md` exactly. Do not re-derive the recipe. Actor: you, **after** Mark says yes. Stop and ask.
8. The on-device play, using the read-list in section 10. This is tracer plan verification step 9 and it is the reason this dispatch exists before the bosses. Actor: Mark.
9. Whether any magnitude feels right is a human call after playing. Never claim a number is right. Actor: Mark.

## 3. The economy, derived here rather than assumed

### The drop price is a table, and the curve is its derivation

The authored stage spawns **268 trash mobs**: 101 in the ramp and 167 in the back half, summed from the row tables in `src/game/stage/stage.ts`. That is the whole currency supply of a tracer run, because the boss phases are still empty and adds arrive in dispatch 6.

The concept doc asks for ten to twelve drops per run, a first drop at about five kills, and a rising price. Fit a geometric curve to the supply: at a ratio of **1.24** from a base of **5**, the tenth drop lands at 160 cumulative kills, the eleventh at 203 and the twelfth at 256. Against 268 authored mobs that is exactly the ten-to-twelve band, and it produces it the honest way: a player who kills six mobs in ten gets ten drops, a player who clears nearly everything gets twelve. The band comes out of skill rather than out of a die.

The prices ship as **an authored table of twelve numbers**, `[5, 6, 8, 10, 12, 15, 18, 23, 28, 35, 43, 53]`, not as a `pow` evaluated at runtime. Two reasons, and the second is the load-bearing one: a table is reviewable at a glance and tunable per entry in dispatch 7, and `Math.pow` is an implementation-approximated operation that ADR 0015 keeps out of the sim entirely. Past the twelfth drop the price stays at the last entry rather than growing, because nothing in a tracer run can reach it and a rule nobody can see is not worth inventing.

**A record correction this derivation forces.** The concept doc says late prices reach "the hundreds". That was written before the row tables existed and it assumed a kill count the authored stage does not supply: at prices in the hundreds this stage pays two or three drops in a whole run. The authored counts win, because they are the thing a player actually meets, and the concept doc's sentence is superseded rather than quietly ignored. Dispatch 7 may move the counts, and if it does, the price table is the other half of that edit.

### What one swallow may kill

#36's criterion, quoted rather than paraphrased: "Wisps are meaningful ordnance: a few hits kill trash, about five kill a tougher mob, and nothing dies from corpse pickup alone." Read literally the last clause forbids the on-swallow line from killing anything, which contradicts the first two, so what it operationalizes to is that one pickup is never a wave-clear button. The bound is read over the **whole** payload of one swallow, the wisp volley and the stream's surge together, and it is that no single swallow clears a wave.

The worst case, with every line at its ceiling:

- Eight wisps at 1 damage, spread by the no-overkill targeting rule in section 6.5.
- One extra stream volley, which at five columns is five skulls at 1 damage.

Against the back half's V of **seven ghouls** at 2 health each, the worst case is four dead to the wisps and two to the volley, so one is still standing. Against **twenty-two shamblers** at 3 health, it is two dead to the wisps and one to the volley, so nineteen stand. The bound holds at the ceiling on both waves, by one body on the harder of the two, and it holds by arithmetic rather than by intention, so it is a spec test and not a tuning note. Both figures are the theoretical worst case: they assume every skull in the fan finds its own separate body, which the fan's geometry makes generous.

That one body of margin is why the surge is a **rate** change and never a damage bonus, and why it is capped at a fixed count of extra volleys rather than opened for a window. Section 6.3 carries the cap.

### The ghoul's health does not move, and the record says why

An earlier draft of this plan raised `ghoul.hp` from 2 to 3 to buy margin on the bound above. That margin was being bought against a surge that was then a **time window**, and the window was the defect. `SURGE_INTERVAL` 10 against `STREAM_INTERVAL` 30 across a 45-tick window is about three extra volleys, roughly fifteen extra damage on top of the wisps' eight, which is seven trash bodies against a V of seven. All three gates found that independently, from three different starting points. Mark ruled the fixed count on 2026-08-22, the window is gone, and with one extra volley the bound holds at 2 health with nothing left to buy.

So the ghoul keeps the health dispatch 4 gave it, which is what `mobs.ts`'s own comment asks for: the ghoul "has to die fast or positioning stops being the answer to it". Its threat is its body and its counter is a hard cut across it, and neither is a health question. **This dispatch changes no mob magnitude at all.** The spec test still asserts the bound over **every** trash type rather than over the shambler alone, because a test written against the shambler would have passed the ghoul's whole problem.

## 4. What already exists, and the seams it leaves

Dispatch 4 left this dispatch a deliberately clean shape. Read this before planning any new module: several things you would otherwise build already exist.

- **`src/game/lines/roster.ts` exists** and holds identity only: `WeaponLine`, `WEAPON_LINES`, `BIRTHRIGHT` (`soulStream`, `headstones`), `MAX_LEVEL` 5. A fresh run starts at `{soulStream: 1, headstones: 1, wisps: 0, bell: 0}`. The behaviour files are yours to add beside it.
- **`swallow.ts` already pays the reservoir and the levels.** `payReservoir` fills to `RESERVOIR_CAPACITY`, emits `reservoirCharged`, `reservoirFull` and `splashed` in that order, and `payLevel` levels a line or returns overflow at `MAX_LEVEL`. `swallow.ts`'s own header says `belch.ts` takes the firing and the eruption and that this dispatch is **purely additive** there. Do not grow `swallow.ts` into the belch.
- **The `drops` RNG stream already exists** on every run, unused. So does `shed`, which is dispatch 6's.
- **`touch.ts` already produces the belch edge.** `takeBelch()` reads it once and clears it, it is tested, and nothing calls it. That is the belch's input seam, already built.
- **`damageMob(state, mob, amount, _source)` is the one entry point for a mob being hit**, and its `DamageSource` union already names `storm`, `bell`, `headstone` and `contact`. The underscore comes off when the bell's push rule becomes the first rule that branches on the source.
- **`step.ts`'s documented tick order names a deaths phase that has no call in the body.** That is this dispatch's insertion point, and the order sentence in its header is the contract.
- **Four of the twelve draw layers are empty**: `belchEruption`, `bellRing`, `storm`, `treasure`. `palette.test.ts`'s `SPRITE_LAYER` already assigns every unbuilt sprite to one of them, so the layer for each new renderer is decided, not yours to choose.
- **`FieldRenderer` is the pattern to copy**, not to extend blindly: a sprite pool sized from the entity cap, slot-parallel iteration rather than a live list, a memo array so a sprite redraws only when its look changes, position set every frame, tint rather than alpha for continuous state, and `attach()` as the place per-run memory is forgotten. Its `Scatter` pool is the model for an effect with no sim entity behind it.

### Five tripwires this dispatch will trip, all of them on purpose

1. **`clearingPolicy` is deleted**, and `bot.test.ts` is written against it in four places. The full-run tests get rewritten onto real weapons in the same change.
2. **The `it.fails` tests go green and therefore go red.** `RAMP_RED_SEEDS` (101, 303, 505) and the whole size-ceiling block are declared `it.fails` precisely so that weapons landing turns them into failures that demand rewriting into ordinary assertions. That is the file asking for attention, not a regression.
3. **The golden digest checksum dies.** `digest.ts` pins `reservoir`, `levels` and every stream's draw count, and any change to the tick order, the pools or the draws invalidates it. Regenerate with `pnpm digest` and say so in the report. Its scripted deaths stay: section 6.28 says why removing them would tie the golden to the ramp's tuning.
4. **Every `AWAITING_A_COMPANION` entry must be deleted as its sprite is drawn.** All seven name dispatch 5. A colour that is in neither that allowlist nor `SPRITE_OUTLINE` fails assertion 1, which is the mechanism that stops a new sprite passing quietly. The `NOT_DRAWN_YET` separation exceptions come off in the same pass.
5. **`src/app/sound.ts` is governed by no import rule.** `boundary.test.ts` declares roots for `game`, `input` and `dev` only. Sound subscribes to events and must not reach back into the sim's internals, and nothing mechanical enforces that today.

### The one place the readouts have to grow

`GameScreen` holds five inline labels and a dirty-check `syncReadouts()`; there is no `GameHud` and no `DebugPanel`, whatever the tracer plan's module list says. The events `advance()` returns are dropped on the floor except for the run-ending check, and that single line in `update()` is where sound subscribes. `GraveRenderer.sync(grave)` takes a `Grave` and cannot see `run.reservoir`, so the diegetic reservoir tell needs its signature widened or a renderer of its own.

## 5. The seams under test

- `advanceStream(state)`, `surgeStream(state)` in `src/game/lines/soulStream.ts`.
- `advanceHeadstones(state)` in `src/game/lines/headstones.ts`.
- `launchWisps(state, events)`, `advanceWisps(state)` in `src/game/lines/wisps.ts`.
- `advanceBell(state)` in `src/game/lines/bell.ts`.
- `resolveStorm(state)` in `src/game/mobs.ts`, beside `damageMob`. There is no `storm.ts`; section 6.7 says why.
- `priceOfNextDrop(dropsPaid)`, `creditKill(state, x, y)`, `rollDropLine(state)` in `src/game/drops.ts`.
- `fireBelch(state)` in `src/game/belch.ts`.
- `swallow(state, food)` in `src/game/swallow.ts`, unchanged in signature and now firing the on-swallow lines.
- `step(state, command)` in `src/game/step.ts`, taking a `TickCommand` rather than a `MoveCommand`.
- `stepChecked(state, command)` in `src/dev/invariants.ts`, taking the same `TickCommand`. It is the most-called caller in the suite and it changes with `step`.
- `Policy = (state, caused) => TickCommand` in `src/dev/bot.ts`, for the same reason: a policy that cannot express a belch cannot carry ADR 0016's Wall property.
- `advance(run, clock, elapsedMs, source)` in `src/game/advance.ts`, with `SteerSource` widened to `CommandSource` in section 6.13.
- `damageMob(state, mob, amount, source)` in `src/game/mobs.ts`, unchanged.
- `spawnDrop(state, x, y, line)` in `src/game/corpses.ts`.
- `belchingPolicy` and `unloadedPolicy` in `src/dev/bot.ts`.
- `StormRenderer` in `src/app/screens/game/StormRenderer.ts`: `attach(layers)`, `sync(run)`, `detach()`.
- `GraveRenderer.sync(grave, reservoirFullness)`, widened.
- `playFor(event)` in `src/app/sound.ts`.

Do not invent a seam. If the plan looks like it is missing one, stop and report rather than filling the gap.

## 6. Module boundaries

`src/boundary.test.ts` already governs this and it is not yours to weaken. The rules that bite here:

- `src/game` imports only from `src/game`. The `lines/` folder is inside that, so `soulStream.ts` may reach `mobs.ts` and `math.ts` and may never reach `src/app` or `src/dev`.
- `src/input` imports only from `src/input` and `src/game`.
- `src/app` is the only place pixi lives, and `sound.ts` gains a rule of its own in section 6.25.

`src/app/palette.test.ts` runs a source scan over `src/app/screens/game`, `src/app/FpsMeter.ts` and `src/main.ts`. `StormRenderer.ts` and `BelchButton.ts` both land inside that scan, so every colour they draw comes from `PALETTE`, neither may reach a `MENU` colour, neither may write a colour literal, and neither may set `blendMode`. ADR 0014 forbids additive blending on the storm by name, so this is the rule and not a formality.

The `no-restricted-properties` lint rule keeps `src/game` and `src/input` off raw implementation-approximated operations and off `Math.random`. The headstones' orbit and the wisps' turn both need trigonometry and both go through `math.ts`.

### 6.1 `src/game/math.ts`, one rotation for two owners

`rotateToward(heading, target, turnCos, turnSin)` moves here from `mobs.ts`, where it is currently private.

Two things need it: the ghoul turns toward the grave and a wisp turns toward its target. They are the same six lines and the same hazard, and ADR 0015's preference for vector math over angle math is a rule about how turning is written rather than about who turns. Duplicating it would give the sim two rotations that can drift apart, and one of them would be the one nobody tested.

The turn's cosine and sine stay with their owners, computed once at module load in `mobs.ts` and in `wisps.ts` from each one's own degrees-per-second. Passing them in rather than passing an angle keeps `rotateToward` free of trigonometry and keeps each line's turn rate readable beside the line it belongs to.

This has a second effect that is worth stating because it closes a hole the record has been carrying: the headstones orbit through `sin` and `cos` on **every** tick of every run, so `math.ts` is permanently on the digest's path and no longer depends on a ghoul reaching the scenario. Section 11 retires that item.

### 6.2 `src/game/caps.ts`, two more pools

```ts
export const SKULL_CAP = 120;
export const WISP_CAP = 64;
```

Both refuse the spawn at the cap, the same policy mobs and mob fire already have, and for a simpler reason than theirs: it is the player's own fire, the lines emit continuously, and one missing skull out of a hundred is invisible where a vanishing mob shot is a lie.

The figures are derived from the densest thing each pool can produce, not picked. A skull at `SKULL_SPEED` crosses the field's height in 109 ticks, so a level-5 stream at its fixed `STREAM_INTERVAL` holds about 18 alive, and a swallow chained as often as the game allows adds one surged volley each time, which is where the real ceiling comes from rather than from the cadence. Eight wisps per swallow at a 90-tick life, with a swallow as often as every 20 ticks, holds 36; 64 is comfortably above it. Both caps sit far above their derivations on purpose: they are a safety net and not a tuning knob, exactly as `MOB_CAP` is, and a cap that binds in normal play is a bug rather than a policy.

Headstones need no pool. Their count is a function of the level and their positions are a function of one orbit phase, so they are computed each tick from `state.lines` and never spawned. That is not a shortcut: a pool would give the game a second, weaker source of truth for how many stones exist, and the level is already the answer.

### 6.3 `src/game/lines/soulStream.ts`, the saturation workhorse

Always on, from level 1, and it never homes (ADR 0005).

```ts
export interface Skull { alive: boolean; id: number; x: number; y: number; vx: number; vy: number; }
export function createSkullPool(): Skull[];
export function advanceStream(state: RunState): SimEvent[];
export function surgeStream(state: RunState): void;
export const SKULL_HALF_EXTENT = 4;
export const SKULL_DAMAGE = 1;
```

**The level curve is columns and nothing else.** `COLUMNS_BY_LEVEL = [0, 1, 2, 3, 4, 5]`, indexed by level, so level 5 is five columns. The interval stays fixed across levels and the count carries the whole growth, because "the saturation workhorse" is a statement about how much is on the field rather than about how fast one lane repeats, and a curve that moved both would make the two indistinguishable to anyone reading the code or the screen.

**`STREAM_INTERVAL = 30` ticks**, derived rather than picked. A shambler has 3 health and a skull does 1 damage, so a mob standing in one column dies to three volleys. Half a second between volleys puts a trash kill at about 1.5 seconds under a level-1 stream, which is the "trash dies in a second or two" that section 11's drain-out re-derivation depends on. A weaponless build kept a shambler alive for about thirteen seconds; this is the number that changes that.

**`SKULL_SPEED = 420 / TICK_HZ`.** Mob fire travels at 110 units per second and ADR 0014 makes it slow on purpose. The player's storm reading as unmistakably not mob fire is the same rule from the other side, so the skull is roughly four times faster. It crosses the field's height in about 1.8 seconds, which is a real lead time and is why the stream is a saturation weapon rather than a sniper.

**The fan is angular and rigid.** Columns are spaced `FAN_STEP_DEGREES = 6` apart, symmetric about straight up, so level 5 spans minus twelve to plus twelve degrees. Twelve degrees off vertical drifts a skull 128 units sideways over 600 units of travel, about a quarter of the field's width, so the widest column still lands inside the field from a centred grave and the fan reads as coverage rather than as a spray. Each skull's velocity is set once at launch from `normalize` and never changes: "rigid" and "never homes" are the same requirement said twice, and a test asserts a skull's velocity is identical on its first and last tick.

**The surge is a rate change, never a damage bonus, and it is counted rather than timed.** `surgeStream` sets `state.lines.surgeVolleys = SURGE_VOLLEYS`, and while that is above zero the next volley comes after `SURGE_INTERVAL = 10` ticks rather than 30, and firing it decrements the count. Section 3 gives the reason a surge must not add damage: the one-swallow bound has one body of margin at the ceiling and a damage surge would spend it.

**`SURGE_VOLLEYS = 1`, and Mark ruled the shape on 2026-08-22: a fixed number of extra volleys, never a time window.** The count is the whole mechanism, and one is what the bound in section 3 can afford: at the ceiling one extra volley is five skulls, and six of the back half's seven ghouls is not a cleared wave. A window is what the earlier draft had and all three gates broke it. `SURGE_INTERVAL` 10 against `STREAM_INTERVAL` 30 over a 45-tick window is roughly three extra volleys and fifteen extra damage, which is seven trash bodies and clears the V outright; and the window's uptime half is worse, because 0.75 seconds refreshing rather than stacking against a back half that spawns 2.1 mobs a second is a buff a collecting player never lets lapse. Crawl removed Stoneskin, Condensation Shield and Phase Shift for exactly that, that it was "totally possible to keep it running at all times, and generally a good idea to do so".

**`surgeStream` sets the count rather than adding to it**, which is Mark's ruling said in code: one swallow buys one burst, and a swallow chain overwrites an unspent volley instead of banking a queue. So the worst case in section 3 is the single-swallow case even under chaining, and there is no accumulator to hold open.

Whether one extra volley reads as a beat at all is a human call and it is on Mark's read list in section 10. If it reads as nothing, the count is the knob, and raising it re-opens section 3's arithmetic rather than being free.

Skulls launch from the grave's mouth, at `grave.y - grave.size`, so the stream visibly pours out of the hole rather than out of its centre.

### 6.4 `src/game/lines/headstones.ts`, last-ditch close defense

Always on, from level 1 (ADR 0005). No pool, no spawn, no cull.

```ts
export function advanceHeadstones(state: RunState): SimEvent[];
export function headstoneAt(state: RunState, index: number): { x: number; y: number } | null;
export const STONE_HALF_EXTENT = 5;
export const STONE_DAMAGE = 1;
```

**`STONES_BY_LEVEL = [0, 1, 2, 3, 4, 6]`.** The concept doc's endpoints are one slow stone and six in two counter-rotating rings, so the first ring holds up to three and a second ring appears at level 4 and counter-rotates. Level 4 is three plus one and level 5 is three plus three.

**The orbit is elliptical, not circular, and that is load-bearing.** The grave is twice as tall as it is wide (`GRAVE_ASPECT`), so a circular orbit sized to clear the rim horizontally passes straight through the grave vertically, and a stone would spend half its revolution invisible inside the mouth. The radii are `graveWidth(size) / 2 + STONE_STANDOFF` across and `size + STONE_STANDOFF` down, which is the grave's own hitbox pushed out by a fixed margin, so the ring reads as orbiting the grave rather than orbiting a point near it. It also scales with the grave for free, which a fixed radius could not: a ceiling grave is 135 units tall and would swallow its own defense.

**`STONE_STANDOFF = 14`.** A shambler's half-width is 11, so the stone's path sits a little outside where a shambler's own centre would be at the instant its body touched the rim. That is what makes it a close defense rather than a second stream: the stone meets a mob exactly as the mob becomes a contact threat, and no earlier.

**`ORBIT_TICKS = 120`**, two seconds per revolution, deliberately slower than the grave. `BASE_SPEED` crosses the field's width in two seconds, so a player who runs can outrun their own stones, which is exactly what "last-ditch" has to mean. The second ring runs the same period in the opposite direction, so the two rings cross twice per revolution and the pattern reads as two rings rather than as noise.

**A stone that hits goes inert rather than the mob going immune.** `STONE_RECHARGE = 30` ticks, held per stone slot in `state.lines.stoneRecharge`. The alternative, a per-mob cooldown, needs a field on every mob and a rule about what happens when the mob dies and its slot is recycled, which is the exact class of pooled-state bug this codebase has hit five times. One number on the stone, cleared by `attach`-equivalent run setup, has nowhere to leak to. An inert stone still draws, dimmed, so the player can see their defense is spent.

The orbit phase advances in `state.lines.orbitPhase`, wrapped into zero to two pi every tick so it cannot grow without bound across a long run and lose precision.

### 6.5 `src/game/lines/wisps.ts`, the run's only homing

Fires on each swallow and is never always-on (ADR 0005). Level 0 at the start of a run: it arrives only through a drop.

```ts
export interface Wisp { alive: boolean; id: number; x: number; y: number; vx: number; vy: number; life: number; targetId: number | null; }
export function createWispPool(): Wisp[];
export function launchWisps(state: RunState, events: SimEvent[]): void;
export function advanceWisps(state: RunState): SimEvent[];
export const WISP_HALF_EXTENT = 4;
export const WISP_DAMAGE = 1;
```

**`WISPS_BY_LEVEL = [0, 1, 2, 4, 6, 8]`.** The concept doc's endpoints are one lazy wisp and a converging flight of seven or eight, and section 3's bound is computed against a volley of eight, so level 5 is eight and the plan and the arithmetic agree.

**Targets are assigned so the volley cannot overkill, and this is what makes section 3's bound true rather than optimistic.** Eight wisps that all pick the nearest mob put eight damage into a three-health shambler and kill one thing. Section 3's worst case is computed against a volley whose damage spreads, so the assignment rule is what makes that arithmetic describe the game rather than something more forgiving than the game. It cuts both ways and both matter: without it a volley overkills one body and the run's only homing line stops being meaningful ordnance, and with it the volley kills exactly as many as the bound is checked against. So at launch the wisps are walked in slot order and each takes the nearest live mob that does not already have enough wisps committed to kill it. The rule is deterministic, it is a dozen lines, and without it the game's one stated ordnance bound is a sentence rather than a fact.

**Surplus wisps over-commit onto the last target assigned**, and this case is the common one rather than the corner: eight wisps against a Drip of one, or against three ghouls, runs out of uncommitted mobs immediately. Over-committing costs the bound nothing, because a dead mob does not die twice, and it looks like the converging flight the concept doc promises. The alternative, holding surplus wisps unlaunched, would make a levelled line visibly emit less against a thin field, which reads as the upgrade breaking.

A wisp re-targets by the same rule when its target dies. It does not re-target every tick: a flight launched from one point with one nearest answer would converge on one mob again and the assignment would be undone every tick it ran.

**`wisps.ts` may import only types from `mobs.ts`.** Targeting reads `mob.x`, `mob.y` and `mob.hp` off the `Mob` type and needs nothing at runtime, and `import type` is erased, so the import cannot become a cycle when section 6.7 puts `resolveStorm` in `mobs.ts` beside `damageMob`. This is the constraint that lets the overlap pass live with the thing it damages, and it is worth stating because a single value import would break it silently at build time.

**`WISP_SPEED = 300 / TICK_HZ` and `WISP_LIFETIME = 90` ticks.** That is 450 units of travel, more than half the field's height, so a wisp launched at the grave can reach a mid-field target and expire honestly if it finds nothing. Expiring rather than persisting is ADR 0005's own wording and it is what stops the homing line becoming a turret.

**`WISP_TURN_DEGREES_PER_SECOND = 180`**, through the shared `rotateToward`. A full reversal takes one second, which is generous enough that the run's homing line actually hits and slow enough that a wisp visibly curves rather than snapping. "Lazy" is a look and this is where it comes from.

**`advanceWisps` renormalizes its heading every tick**, exactly as `chase` already does at `mobs.ts:chase`: take `normalize(vx, vy)`, rotate it, then multiply by `WISP_SPEED`. Rotating the velocity in place instead would compound f32 rounding of the turn's cosine and sine over a 90-tick life and let wisp speed drift, and speed is what `WISP_LIFETIME` is derived against. The mob half of the codebase already solved this and the fix is to copy it rather than to rediscover it.

`launchWisps` is called from `swallow.ts` and never from the tick loop, so a wisp volley leaves on the tick the food went in. That is the tracer plan's own placement for the on-swallow lines, and a tick of lag would read as the burst arriving after the dive rather than out of it.

### 6.6 `src/game/lines/bell.ts`, the funeral toll

Always on from level 1, on its own clock, and never fired by a swallow (ADR 0005). Level 0 at the start of a run.

```ts
export interface BellRing { level: number; ticks: number; }
export function advanceBell(state: RunState): SimEvent[];
export function ringRadius(ring: BellRing): number;
```

**`BELL_PERIOD = 180` ticks**, three seconds, and `BELL_EXPAND_TICKS = 45`. The ring expands from nothing to its full radius over one beat and then it is gone, so it finishes well inside its own period and the player never sees two rings at once. One live ring at a time is asserted by an invariant rather than assumed.

**`BELL_RADIUS_BY_LEVEL = [0, 80, 122, 165, 207, 250]`.** Level 5 reaches 250 units, which is nearly across the field's 540-unit width from a centred grave, exactly as the concept doc asks. Level 1's 80 units is three and a half shambler bodies out from the grave's centre, which is the range at which a mob is already close enough to be a contact threat, so the first toll has something in it whenever the player is in any danger at all. That is the concept doc's "the first toll always has a visible victim" turned into a derivation instead of an intention, and section 7 gives it a test.

**Damage falls off with distance, linearly**, from `BELL_DAMAGE_NEAR = 3` at the grave to `BELL_DAMAGE_FAR = 0.5` at the ring's full radius. Three is one shambler exactly, so a maxed bell kills trash outright only where the player is standing, and the damage crosses one point at eighty percent of the radius. The far edge tickles, which is Mark's own 2026-08-19 ruling recorded in ADR 0005, and a single toll cannot clear a wave of twenty-two.

**A mob is damaged on the tick the ring's leading edge crosses it, and only then.** The ring expands monotonically, so "the previous radius was under the distance and this radius is not" is exact, needs no per-mob bookkeeping, and cannot double-hit. A ring that tracked which mobs it had already touched would be another pooled-state field with a recycled slot behind it.

**Pushback arrives at level 4, not before.** `BELL_PUSH_BY_LEVEL = [0, 0, 0, 0, 20, 40]`, in field units, scaled by the same proximity falloff and directed away from the grave. ADR 0005 makes push a higher-level property rather than a level-1 one, and this is the ladder.

The push is clamped so a pushed mob stays inside the field widened by `SPAWN_MARGIN`, which is the box `invariants.ts` checks. Without the clamp a mob near the top edge is shoved out of the checked box by the player's own weapon and the harness fires on a legal move.

**Bosses take the damage and never the push (ADR 0007), and that rule is not written here.** There are no bosses in this build, so there is nothing for it to branch on. Section 11 records that this contradicts a prediction dispatch 4 made in `damageMob`'s own comment, and why the correction is the right way round.

### 6.7 The storm meeting a mob, inside `src/game/mobs.ts`

**There is no `storm.ts`, and an earlier draft of this plan built one.** The tracer plan's sentence forbidding a `projectiles.ts` has a third clause in it: "no `collide.ts` ... a module holding only all the overlap tests hides nothing". A module holding only the storm's overlap tests is that module. The same plan already names the owner in as many words: `mobs.ts` holds "the consequence of a mob being hit, whether by the storm, by the bell's ring, or by an orbiting headstone". The draft had already conceded the shape by resolving the bell inside `advanceBell` and then argued for a separate file anyway.

```ts
export function resolveStorm(state: RunState): SimEvent[];
```

It lives in `mobs.ts` beside `damageMob`, because the consequence of a hit is what that file is. The order is skulls, then headstones, then wisps, always, so the same seed produces the same kills in the same order, and `step.ts` states that order in one line as it already does for the rest of the tick. The bell resolves inside `advanceBell` rather than here, because its damage is a consequence of the ring expanding rather than of two boxes overlapping, and folding it into an overlap pass would mean giving the ring a hitbox it does not have.

**`cullStorm` does not exist either.** Each line culls its own pool: `advanceStream` drops a skull that has left the field, `advanceWisps` drops a wisp that has expired or left. A cull is motion's own consequence and it belongs with the motion, and a shared cull would be the second half of the module that just got deleted.

**The one import rule this depends on** is in section 6.5: `wisps.ts` may import only types from `mobs.ts`. `soulStream.ts` and `headstones.ts` need nothing from `mobs.ts` at all, and `bell.ts` imports `damageMob` in the one direction that is already fine. So `mobs.ts` reaching the three pools for the overlap pass creates no runtime cycle. If the dispatch finds one, that is a finding to report rather than a reason to reinstate the module.

- **A skull is consumed by the mob it hits**, one mob per skull, tested against `mobHitbox` through the existing `overlaps`.
- **A stone is not consumed.** It damages and goes inert for `STONE_RECHARGE`, so a stone can carry a mob out of the way rather than dying on it, which is what "orbiting solid" means.
- **A wisp is consumed by the mob it hits**, whether or not that mob was its target. A wisp that flies through something on the way is not saved for later.

Every one of these calls `damageMob(state, mob, amount, source)` and nothing else, with `source` being `storm`, `headstone` and `storm` respectively. `damageMob` is unchanged: the deaths, the corpses and the `mobKilled` events are all already there, which is the seam dispatch 4 built and this dispatch is the first to use for real.

Each line still owns its own pool, its own motion and its own numbers. What moves into `mobs.ts` is only the overlap-to-damage pass, which is the one thing that reads three pools at once.

### 6.8 `src/game/drops.ts`, the rising price and the dice

```ts
export const DROP_PRICES: readonly number[];
export function priceOfNextDrop(dropsPaid: number): number;
export function creditKill(state: RunState, x: number, y: number): SimEvent[];
export function rollDropLine(state: RunState): WeaponLine;
export const DROP_HALF_EXTENT = 8;
```

The price table and its derivation are section 3 and are not restated. `priceOfNextDrop` clamps past the twelfth entry to the last one.

**`creditKill` is called from the deaths phase, once for every `mobKilled` the tick produced, whatever killed it.** That includes the bell's kills, which resolve two phases earlier inside `advanceBell`, and contact kills. Drops are priced in kills and a kill is a kill: a price that depended on which weapon landed the last point of damage would move a drop boundary for a reason no player could read, and two runs would become different builds inside a minute. So the deaths phase walks the tick's accumulated `mobKilled` events rather than only the ones the overlap pass returned. An earlier draft of this plan said both things one section apart, and this is the one that holds.

**One second-order consequence, and it belongs in the tick-order contract**: a bell kill's corpse exists before `resolveSwallows` runs, so it is swallowable one tick sooner than a kill from the overlap pass. That is a real difference and it is small, deliberate, and stated here so nobody reads it later as a bug.

**The dice seed the first drop of each unowned line, then roll uniform. Mark ruled this on 2026-08-22 and it replaces a weighted roll an earlier draft invented.** Until every line has been dropped at least once, the roll picks among the lines that have never dropped; after that it is uniform over all four. The game design gate simulated 200,000 runs per scheme at eleven drops: runs missing a line entirely are 8.4% under a uniform roll, 1.25% under the weighting, and **0.000% under seeding**. The chance any line reaches level 5 is 0.725 uniform, 0.440 weighted, 0.626 seeded, and the modal build's share of runs is 0.17, 0.33 and 0.23. Seeding beats the weighting on every measure at once: it removes the missing-line defect outright, and it costs less of the ceiling and less of the run-to-run variety than a weighting does.

The precedent runs the same way. Vampire Survivors weights **toward** what you own and requires a maxed item to evolve it; Slay the Spire has no ownership bias at all, only rarity and no duplicates inside one offer; Risk of Rain 2 has none and stacking is the build engine; Hades concentrates deliberately, showing no new gods after four. The gate found no shipped game and no designer source arguing for anti-concentration weighting. Runs still differ, a maxed line is still reachable so ADR 0002's overflow rule stays live, and the rule is a pure function of the levels and the drop history, so it is testable without running a stage.

**ADR 0002 currently says the dice only pick which line levels, and that is now incomplete.** Section 6.30 records the amendment: this is a rule about the shape of a run and its home is the ADR, not a dispatch plan.

**`DROP_HALF_EXTENT = 8`**, giving a drop 16 field units. **The bound is `graveWidth(SIZE_FLOOR)`, which is 18 units, not the mouth's 10.** `dispatch-4-field.md` section 4.15.5's assertion 4 says so in as many words, "the mouth is not a gate and never was ... what actually binds is the grave's own width", and the shipped `it.todo` in `palette.test.ts` already carries the corrected title, "bounds DROP_SIZE by graveWidth(SIZE_FLOOR)". Section 9 of the same file carries a stale 9-to-10 window, an earlier draft of this plan sized the constant from that bullet, and the comment sitting above the `it.todo` still states the stale window: **fix that comment in the same pass, or the next reader inherits the same wrong number from a third place.**

Sixteen units is the size the drop's job wants. It is two units clear of the cap, and it is larger than a corpse's 14. **Mark ruled on 2026-08-22 that the corpse-reads-bigger-than-a-drop rule gives**, precisely so the drop can be sized for the at-a-glance line read that #36 makes a headline criterion: four silhouettes that must be told apart mid-dodge with no HUD glance. Steady-bright against fading corpses is the other half of that read, and it does not survive the icon being the smallest thing on the field.

**One consequence to state rather than discover:** section 6.20 draws mob fire at 16 units too, so a drop and a shot are now the same size on screen and size stops being a channel between them. Nothing is left resting on it. What separates them is what ADR 0014 already gives mob fire: the top layer, the reserved value band, and the three-colour construction, against a drop that is steady where a shot moves, scrolls where a shot falls, and carries its line's silhouette. **The grayscale check in verification step 6 reads exactly this pair**, and if a drop and a shot are hard to tell apart at density, that is a finding rather than a tune.

A drop's payout is `TRASH_CORPSE_PAYOUT` and its freshness is always 1, so a maxed line's drop still pays growth, reservoir and overflow. Nothing swallowed is ever worthless (ADR 0002).

### 6.9 `src/game/corpses.ts`, extended: drops ride the food pool

Two fields join `Corpse`, and the pool becomes the food pool in fact if not in name.

```ts
line?: WeaponLine;   // which line this drop levels, absent on corpses and feasts
halfExtent: number;  // CORPSE_HALF_EXTENT for a corpse, DROP_HALF_EXTENT for a drop
```

`corpseHitbox` reads `halfExtent` rather than the module constant. **So does `cullCorpses`**, which today tests `corpse.y - CORPSE_HALF_EXTENT <= FIELD_HEIGHT` at `corpses.ts:188`. Left on the module constant it would hold a drop on the field for a unit of extra travel past where a corpse goes, and the test named for that behaviour, "a drop never decays and only the bottom edge takes it", would pass without ever seeing it. Every reader of `CORPSE_HALF_EXTENT` inside `corpses.ts` moves to the field in the same edit; the renderer's own use of it for the corpse polygon is a draw size and stays.

`asSwallowable` passes `line` through, which is the field `Swallowable` has been declaring and nothing has ever set.

```ts
export function spawnDrop(state: RunState, x: number, y: number, line: WeaponLine): SimEvent[];
```

Fully fresh, never decaying, carrying its line and its extent. It reuses `claimSlot`, so it inherits spawning, scrolling, culling and swallowing for free, which is the whole reason not to build a second pool.

**The eviction policy must never take a drop, and today it would.** `claimSlot` evicts `oldestLive`, and a drop that has been on the field a while is the oldest thing in the pool. Evicting the scarcest object in the game to make room for a corpse inverts the policy's own reasoning, which is that the cheapest thing to lose should go. So eviction skips any food with `decays === false`, which covers drops and the boss feasts dispatch 6 adds, and if every slot holds treasure the spawn is refused instead. This is a real rule with a real test and it is the kind of thing that would have shipped silently.

**The type is not renamed.** `Corpse` now holds corpses, feasts and drops, which is honest vocabulary debt. Renaming it to `Food` touches the pool, the hitbox, the invariants, the digest, the renderer and six test files, and buys nothing a player can see. It is declined here deliberately and recorded in section 12 so the next planner inherits the decision rather than the confusion.

`CorpseLost` gains `kind: FoodKind`, so the missed-drops instrument can separate a corpse that scrolled away from a drop that did. Without it the instrument the concept doc names cannot be built from the event stream at all.

### 6.10 `src/game/mobs.ts`, the overlap pass and one behaviour fix

- **`resolveStorm` is added here**, per section 6.7. That is the substantial change to this file and it brings no new mechanism with it: the overlap test is the existing `overlaps` against `mobHitbox`, and the consequence is the existing `damageMob`.
- **An armed mob below the grave stops firing.** Mobs are culled only past the bottom edge, so dispatch 4 observed shots leaving from y=734 and y=763 at a grave at y=711: a mob that has already passed the player turns round and shoots upward at them. It follows from the aiming rule rather than being a bug, and it reads as unfair. `tickFire` returns early when the mob's top edge is below the grave's bottom edge.

**No magnitude in this file changes.** Two were proposed by an earlier draft and both are withdrawn, and the reasons are worth carrying because they are the same reason twice.

- **`ghoul.hp` stays 2.** Section 3 has the derivation: the change was buying margin against a surge that was a time window, the window is gone, and the bound holds at 2.
- **`shotHalfExtent` stays 5 on both firing types.** The draft raised it to 8 calling it a readability fix, and it is not a sprite size: `mobs.ts:425` writes it to `shot.halfExtent` and `shotHitbox` at `mobs.ts:284-287` builds the collision rect from it, so 5 to 8 is **2.56 times the hit area** in the build where Mark first reads the ramp's pacing, with two content edits already waiting on that read. The readability defect is real and it is fixed where it lives, in the drawing: section 6.20 widens the drawn star and leaves the box alone. Cave and Touhou both draw bullets larger than their hitboxes with a bright core approximating the true box, and ADR 0014's three-colour construction is already the mechanism for making mob fire read large.

`damageMob` keeps its underscore on `_source`, for the reason section 6.6 gives.

### 6.11 `src/game/run.ts`, what a run now holds

```ts
readonly skulls: Skull[];
readonly wisps: Wisp[];
readonly lines: LineState;
killsSinceDrop: number;
dropsPaid: number;
```

```ts
export interface LineState {
  streamIn: number;        // ticks to the next stream volley
  surgeVolleys: number;    // surged volleys still owed
  orbitPhase: number;      // headstone orbit, radians, wrapped
  readonly stoneRecharge: number[];  // per stone slot, MAX stones long
  tollIn: number;          // ticks to the next toll
  ring: BellRing | null;   // the one live ring
}
```

One record rather than six scattered fields, for readability rather than for leak safety. `RunState` is built fresh by `createRun` on every run, so nothing in it can survive a pooled screen and the five-leaks argument does not apply here at all: that argument is about renderer and screen fields, and sections 6.19 and 6.23 already apply it where it belongs. What the grouping actually buys is that the stream's clock, the orbit's phase and the bell's ring read as one subsystem's state instead of six loose numbers on the run, and that `createRun` initializes them in one place a reader can check at a glance.

`stoneRecharge` is pre-allocated at the maximum stone count and never resized, so a level change cannot reallocate mid-run.

### 6.12 `src/game/events.ts`, the new events

```ts
interface Tolled { type: "tolled"; level: number; radius: number; }
interface Belched { type: "belched"; cancelled: number; }
interface DropSpawned { type: "dropSpawned"; line: WeaponLine; x: number; y: number; }
```

`tolled` is the bell's sound cue and the concept doc makes an audible toll from level 1 a headline criterion. `belched` carries how many shots were cancelled, which is what the belch-on-wave instrument reads to tell a wipe that landed on a curtain from one spent on empty sky. `dropSpawned` is the denominator for drops-swallowed-versus-scrolled-off.

No event carries an entity. `weaponLeveled`, `reservoirFull`, `splashed` and `chimed` already exist and are unchanged.

### 6.13 `src/game/step.ts` and `advance.ts`, the tick order and the one-shot edge

**`step` takes a `TickCommand`, not a `MoveCommand`.**

```ts
export interface TickCommand { readonly move: MoveCommand; readonly belch: boolean; }
```

The belch is a rule of the sim and it has to have a place in the tick order, so it arrives through the same door the move does. Every caller changes: `advance`, the bot policies, the digest's script, and `GameScreen`. That is a wide mechanical edit and it is the right one: the alternative is `GameScreen` calling `fireBelch` beside `advance`, which puts a game rule in a screen and puts the belch outside the order the tick documents.

**The full order becomes:** scroll, the move command, **the belch**, spawns, mob motion and fire, **the weapon lines**, overlap detection, **deaths**, decay, culling, the grave's own tick, the counters.

Two placements carry reasons.

**The belch runs before spawns and before every overlap.** A bomb pressed on the frame a shot would land has to save the player, or the button is a lie at the only moment it matters. Running it after `resolveOverlaps` would cancel the shot on the tick after it hit.

**The weapon lines run after mob motion and before overlap detection.** A skull launched this tick does not also move this tick, the same rule mob fire already has, which is what puts it at the mouth for one tick and makes the stream read as pouring out of the grave.

The deaths phase, which dispatch 4 documented and left empty, is now `resolveStorm` plus `creditKill` over **every** `mobKilled` the tick has accumulated, the bell's included. Section 6.8 gives the reason. That is the insertion point dispatch 4 named.

**`SteerSource` becomes `CommandSource = (grave: FieldPoint) => TickCommand`**, and that is the whole change to `advance`.

**The one-shot rule lives in the command source and in `fireBelch`, not in `advance`.** An earlier draft put a force-false in `advance` so that a frame buying three ticks could not become three belches, and claimed "both the bot and the screen inherit it". Neither does. `runPolicy` at `src/dev/bot.ts:44` calls `stepChecked` directly and has never called `advance` at all, and `GameScreen` already read-and-clears the flag inside the closure, so the later ticks of a frame read false and the force-false line is unreachable. Adding a rule to a seam where it is dead code is worse than not adding it, because the next reader trusts it.

What actually holds the rule is stronger than the draft's line and it is already in the design: `fireBelch` does nothing below a full reservoir (ADR 0008), and the first call empties it, so repeat calls inside one frame are no-ops by the resource rather than by a flag. That is not "harmless because of what a different module does"; it is the ADR's own full-only rule doing the work it exists for, and `belch.test.ts` already asserts it. `advance.test.ts` asserts the frame-level behaviour through a source that read-and-clears, which is the screen's real contract.

**Two options were considered and rejected, and they are recorded so they are not rediscovered.** Routing `runPolicy` through `advance` would put the rule somewhere both callers share, and it would repair ADR 0015's stated reason for the accumulator's home, "so the autopilot and the rendered screen share one implementation", which is untrue today. It also reshapes the rig in the same dispatch that rewrites every full-run test, so section 12 carries it instead. A latch in `src/input` was the other, and section 6.16 already rules that the belch is not a steering command.

### 6.14 `src/game/belch.ts`, the one button

```ts
export function fireBelch(state: RunState): SimEvent[];
```

Fires only at a full reservoir and does nothing otherwise, which is ADR 0008 and is why there is no partial bomb anywhere in the signature. It kills every live shot in `state.mobFire`, empties the reservoir, and emits `belched` with the count.

Boss damage is dispatch 6's and there is no boss to take it. That is a stub and it is reported as one.

`swallow.ts` does not grow into this file, exactly as its own header demands: the charge stays there and the firing is here, so this dispatch is purely additive on that seam.

### 6.15 `src/game/swallow.ts`, the on-swallow lines

Two lines join `swallow()`, after the payouts and before the return:

```ts
surgeStream(state);
launchWisps(state, events);
```

This is the tracer plan's own placement for the on-swallow lines and it is the reason `swallow.ts` is described as the moment five ADRs meet. Nothing else in the file changes: the payout order, the event order, and the absence of any size check all stay exactly as they are.

### 6.16 `src/input`, the belch's binding

**Mark ruled on 2026-08-22: a dedicated belch button in a corner, not any second pointer.**

The evidence behind the option list: Cave's mobile ports, DoDonPachi Blissful Death and Espgaluda II, ship a dedicated on-screen soft button precisely because their 1:1 touch movement means a bomb bound to a second finger competes with steering. Bullet Hell Monday ships the binding as a player setting across two-finger tap, button and double tap, which is the shape ADR-level flexibility would eventually take here. What the corner button buys over the second finger is that it cannot misfire: the belch is the scarcest object in the game, it is only spendable at exactly the moment it is worth most, and the post-Banshee wipe is the beat the whole feast set piece is built around.

So:

- **`TouchSteer` loses `belchEdge`, `takeBelch()` and the "every pointer past the steering one is the belch" rule.** Delete them, and delete the comment that describes them. A rule that has been replaced does not stay in the file as a comment.
- **`KeySteer` gains no belch either.** The belch is not a steering command and neither model is where a one-shot edge belongs.
- **`GameScreen` owns one `belchRequested` flag**, set by the button and by the keyboard, and read-and-cleared inside the command closure. Because the closure is only called when a tick actually runs, a press during a zero-tick frame survives to the next one rather than being eaten.

**The keyboard binding is `Space` and `KeyX`, both physical codes.** Space is the free, unambiguous key on this keyboard layout: there is no manual shot to bind it to, `Shift` is already focus, and `WASD` and the arrows are steering. `KeyX` rides alongside it for the Touhou muscle memory, where X is the bomb. `Space` joins `SCROLL_CODES` so the page cannot scroll under a belch. This is a craft default and it is mine, recorded here rather than asked.

### 6.17 `src/app/screens/game/BelchButton.ts`, the button and the tell

A `Container` holding a `Graphics`, not the template's `Button`.

The template's `Button` carries hardcoded pinks and lives in `src/app/ui`, which `palette.test.ts`'s source scan does not reach, so using it for a control that draws over a live field would put unbounded colour on the field with no test able to see it. #38 dresses the shared widgets and must not be pre-empted here; a purpose-built button inside `src/app/screens/game` is bound by the palette scan from its first commit, which is where a live-field control belongs.

- **Bottom right**, positioned from `READOUT_RESERVE.margin` the same way the pause button is, so the two cannot drift apart and the non-overlap rule stays one rule in one place. It sits over the field, which is Mark's 2026-08-22 ruling: the field never pays width for a readout.
- **At least 44 by 44 CSS pixels** at every viewport the game runs at, which is the smaller of the two published touch-target floors and is asserted rather than eyeballed.
- **It is the loaded tell.** Quiet while the reservoir fills, lit at full. The player learns where their belch lives by seeing the thing under their thumb change, without reading a meter.
- Its colours come from `PALETTE`. It is not a `hudInk` label: it is a control, and it draws in the reserved-ceiling range like everything else over the field.

**Three rules the button needs that an earlier draft did not state.** Each is a way the button fails on a real thumb rather than in a test.

- **It fires on press, never on release.** Section 6.13 spends its whole argument for running the belch before overlap resolution on the frame a shot would land, and firing on release gives that back as input latency at exactly that moment.
- **The pointer that fires it never becomes the steering pointer, and a drag that starts inside its rect never belches.** `GameScreen` listens on itself with a stage-wide `hitArea` and pixi's federated events bubble, so today a press on the button also reaches `TouchSteer`. `STEER_SLOP` saves a clean tap and does not save a thumb that rolls. The button claims its pointer id on `pointerdown` and the steer model ignores that id until it lifts.
- **Its geometry must not occlude mob fire.** `this.field` is added first and carries all eleven layers, so anything added as a sibling of the field on the screen draws above `mobFire`, which ADR 0014 lets nothing do. A hollow ring or a low-fill outline gets the loaded tell without filling the corner, and the check belongs in the rendered read rather than only in a test.

**Bottom-right is also the corner the grave dodges into**, and published mobile guidance says to keep critical elements out of the bottom corners for that reason. Whether it gets in the way is a human read and it is on Mark's list in section 10.

### 6.18 `src/app/screens/game/GraveRenderer.ts`, the diegetic reservoir tell

`sync(grave)` becomes `sync(grave, reservoirFullness)`, a number from 0 to 1 and never the `RunState`. Handing the renderer live sim state is the thing the rest of this design works to avoid, and fullness is everything it needs.

`graveGlow` is already declared in the palette and already sits in the `graveRim` layer, waiting for exactly this. The glow builds with fullness and pulses at full, which is the concept doc's own language for the feast beat. Two tells rather than one is deliberate: the button is where the thumb is and the glow is where the eyes are, and a player mid-dodge is looking at the grave.

`graveGlow` leaves `AWAITING_A_COMPANION` and gains a dark companion in section 6.21.

### 6.19 `src/app/screens/game/StormRenderer.ts`, the player's fire on screen

A new renderer beside `FieldRenderer`, built on exactly its pattern and not by extending it: a sprite pool sized from each entity cap, slot-parallel iteration rather than a live list, a memo array so a sprite redraws only when its look changes, position set every frame, tint rather than alpha for continuous state, and one `forgetPreviousRun()` called from `attach()` where per-run memory is cleared.

It is a second file rather than four more methods on `FieldRenderer` because that file is already 489 lines and holds the field's own entities; the storm is a different owner with its own pools, and the two share no state.

Four sprites, each in the layer `SPRITE_LAYER` already assigns it:

- **Skulls** in `storm`. A small round-topped silhouette, drawn once per look and reused, since every skull looks the same.
- **Stones** in `storm`. A squat headstone silhouette. An inert stone draws dimmed, so a spent defense is visible.
- **Wisps** in `storm`. A trailing teardrop oriented to its heading, which is the curving-trail motion ADR 0005 says must never blur with the other three.
- **The bell ring** in `bellRing`. A stroked circle at the live radius, fading as it expands, so the falloff in damage is visible as a falloff on screen.
- **The eruption** in `belchEruption`, and **the splash** in `belchEruption`. The eruption reads across the whole field. The splash marks charge wasted at a full reservoir, which ADR 0008 makes visible on purpose rather than a silent clamp.

The four motions must stay tellable at full density, which is ADR 0005's generative rule: straight columns, circling solids, curving trails, expanding rings. That is a silhouette-and-motion requirement, not a colour one, and it is on Mark's read list because no test can see it.

**Cancelled shots use the existing cancel scatter.** `FieldRenderer` already draws one when a shot dies without leaving the field, and the belch cancels up to four hundred shots at once. Dispatch 4's plan committed to this in as many words, so that cancellation has one vocabulary from the start. The scatter pool is 24 slots and a belch will overrun it: the oldest is reused, which is what that pool was built to do.

**The eruption's punch is budgeted here, because #36 asks for it by name and an earlier draft only promised it.** The ticket's own words are that the punch "must be budgeted as scale, speed and hitstop", and one of those three is not available:

- **Scale.** The ring leaves the grave's mouth and expands past the field's far corner, so its radius reaches the field's diagonal rather than its width. Anything short of that reads as a large bell toll, and the bell is a different line.
- **Speed.** It gets there in about twenty ticks, a third of a second, so it reads as a shock front rather than a bloom. The bell's ring takes 45 ticks to a quarter of the distance, which is what keeps the two tellable apart under ADR 0005's generative rule.
- **Hitstop is refused, and this is the finding rather than an omission.** A sim pause changes the tick count and ADR 0015 makes the tick count the run, so a real hitstop is a determinism change; a render-only hold desynchronizes the screen from a sim that keeps stepping. Neither is worth a frame of punch.

**What actually carries the read is the scatter storm, not the eruption**, and the layer order forces that: `belchEruption` is third from the bottom of `LAYER_ORDER` at `layering.ts:16-29`, under corpses, mob bodies, treasure and mob fire, exactly as ADR 0014 requires. The scatters are added to the `mobFire` layer at `FieldRenderer.ts:301`, which is the top of the stack, so up to four hundred of them appear above everything on the tick the belch lands. The eruption is the ground shock underneath and the scatters are the punch. Whether the two together land as one earned moment is Mark's read, and section 10 says plainly that this build reads it without sound and without the Banshee's death behind it.

### 6.20 `src/app/screens/game/FieldRenderer.ts`, four readability fixes

All four are dispatch 4's implementation-gate findings whose trigger is this dispatch. None is dressing and none is #38's.

- **Mob fire is drawn larger than its hitbox, and the hitbox does not move.** `drawShot` at `FieldRenderer.ts:193-208` builds the whole sprite from `shot.halfExtent`, which is the collision box, so at 5 the sprite is 10 field units, about 7.2 CSS pixels on a 390-wide phone, on the object ADR 0014 calls large and that 15 of 18 bot deaths came from. The star's outer radius becomes `shot.halfExtent * SHOT_DRAW_SCALE` with `SHOT_DRAW_SCALE = 1.6`, so it draws at 16 units, about 11.5 CSS pixels, still smaller than every mob body. **The core stops being a fraction of the drawn star and becomes the hitbox itself**, drawn at `shot.halfExtent * 0.9`: that is Cave's and Touhou's own convention, a bright core the player can read as the true box under a larger body, and it makes the sprite growing an honest change rather than a bigger lie about where the danger is. The three-colour construction, the alpha and the blend mode are all untouched, and so is the memo that redraws only when the extent changes.

- **The corpse flicker drops to 2.5 Hz and gains a per-corpse phase.** `FLICKER_HALF_PERIOD` goes from 6 to 12, which clears the 11-tick floor `tuning.ts` already derives from WCAG SC 2.3.1's three-flashes-per-second limit, and each corpse's phase is offset by its id so a burst-killed wave does not flicker in lockstep. Dispatch 4 deferred exactly this case to this dispatch because nothing could produce a burst kill before the storm existed. A single corpse was covered by SC 2.3.1's small-area exemption; a whole wave flashing together is not, and the criterion invokes Non-Interference so there is no essential-to-functionality carve-out for a game.
- **The revenant's tell gains something that grows.** The closing iris stays, because a closing read is a countdown and it works; it is paired with an outer ring that brightens as the shot approaches, so salience rises into the moment of maximum urgency instead of falling to a 1.6-pixel radius. Dispatch 4 measured that and named the fix.
- **The armed marker stops borrowing the ghoul's silhouette.** `drawArmedMark` currently draws a down-pointing triangle, which is the ghoul's own body shape at 0.55 of the mob's half-width. ADR 0014 makes silhouette the first discriminator between types and this spends that channel on a fourth meaning. It becomes a horizontal notch cut through the body, which is in no type's vocabulary, still a hole rather than a second colour, and still survives grayscale.

### 6.21 `src/app/palette.ts` and `palette.test.ts`, paying dispatch 4's bill

**Every `AWAITING_A_COMPANION` entry is deleted as its sprite is drawn.** All seven name dispatch 5: `graveGlow`, `skull`, `stone`, `wisp`, `bellRing`, `belchEruption`, `splash`. A colour that is in neither that allowlist nor `SPRITE_OUTLINE` fails assertion 1, which is the mechanism that stops a new sprite passing quietly. The allowlist must be empty when this dispatch lands, and if a sprite cannot be given a companion, that is a finding to report rather than an entry to keep.

Each gains an entry in `SPRITE_OUTLINE`. `foodOutline` at luma 10.04 is the existing dark companion for the food, mob and treasure layers, and it is the right one here too: it clears the Lc 45 fine-detail bracket against every one of these bodies and costs nothing over bare field, being 3.4 luma above `night`. Do not invent a new near-black. Measure each pair and report the figures.

**The `NOT_DRAWN_YET` separation exceptions come off in the same pass.** Eighteen of the twenty-nine `SEPARATION_EXCEPTIONS` involve a sprite this dispatch draws: seven against `skull`, eight against `splash`, one each for `stone`, `belchEruption` and `graveGlow`. Each is currently excused with "nothing draws this colour until the weapon-lines dispatch, which builds the renderer and inherits the requirement". That inheritance is now due. An exception that survives must be re-argued on what it is rather than on when it is drawn, with its measured figure, and the threshold is never lowered.

**Assertion 4 pins the drop's size** the moment `DROP_HALF_EXTENT` exists, against `graveWidth(SIZE_FLOOR)` as its own `it.todo` title already says. **The comment sitting above that `it.todo` still states the superseded 9-to-10 window and must be rewritten in the same edit.** It is a summary line that outlived the correction below it, it is the third place this number is written down, and it is the one an earlier draft of this plan read.

**The grayscale check is the real one for the first time.** Dispatch 4's was explicitly a floor because there was no storm to produce the density the rule exists for. Verification step 6 runs it at the densest moment a played run reaches.

### 6.22 `src/app/sound.ts`, the game becomes audible

```ts
export function playFor(event: SimEvent): void;
export function primeSound(): void;
```

It subscribes to the event list and nothing else. It never reads `RunState`, never imports a sim module other than `events.ts`, and holds no game rules: the events carry values for exactly this reason.

`GameScreen`'s `update()` currently drops every event on the floor except the run-ending check, and that one line is where sound subscribes.

**Five sounds this dispatch.** An earlier draft shipped two, and the gate round found that both of them landed on the two commonest events in the game while the scarcest objects stayed silent. `chimed` fires on every swallow and `tolled` every three seconds; there was no hit sound, no treasure sound and no belch, so a drop sounded exactly like a corpse and the belch, which the whole feast set piece is built around, made no noise at all. Touhou's Mountain of Faith bank is the shape to copy: `se_item00`, `se_powerup` and `se_extend` alongside `se_damage00/01` and `se_pldead`. Once the synthesis script exists each additional clip is a few lines of it, so the marginal cost is close to zero and the coverage is what matters.

- **The swallow chime**, on `chimed`, from the very first swallow whatever the loadout. This is the headline criterion that stops an unlucky drop sequence leaving the early minutes silent.
- **The treasure chime**, on `chimed` when the event's `kind` is a drop. `Chimed` already carries `kind: FoodKind` at `events.ts:26-29`, so this needs no event change and no game rule in `sound.ts`: it is a lookup from the kind the event already states. Brighter and longer than the corpse chime, because the scarcest object in the game must not sound like the commonest.
- **The bell's toll**, on `tolled`.
- **The hit**, on `graveHit`. ADR 0014's own text says the rim is the second damage channel "until sound arrives", and this is the dispatch where sound arrives and where the floor ladder first has real weapon levels to strip. Shipping audio with no hit sound would leave that sentence standing while its condition expired.
- **The eruption**, on `belched`. The belch fires once or twice in a run at most, it is the single loudest thing the player can do, and a silent one is the read Mark is being asked to give in section 10.

**The assets are synthesized, committed, and reproducible.** `@pixi/sound` is already a dependency, the engine ships `audio/audio.ts` with a `SFX` class, and AssetPack already builds `raw-assets/main{m}/sounds` into mp3 and ogg, so the pipeline exists and the template's own `sfx-press` and `sfx-hover` are the precedent. The two new sounds are generated by a committed script rather than sourced, so there is no licensing question and a regeneration is a diff rather than a binary anyone has to trust. A bell is genuinely synthesizable as a few inharmonic partials under an exponential decay; a chime is a shorter, brighter version of the same shape. Placeholder audio is the standing expectation here exactly as placeholder art is.

**If AssetPack's audio pipe will not take the generated file's format, stop and report.** Do not hand-place files into `public/assets` to work around it: that path is generated and a hand-placed file is deleted by the next `pnpm assets`.

Browser autoplay policy blocks audio before a user gesture, and the boot already logs three warnings about it. The first gesture in this game is RISE on the title screen. `primeSound` is called there.

### 6.23 `src/app/screens/game/GameScreen.ts`, rewired

- Holds `belchRequested`, sets it from `BelchButton` and from the `Space` and `KeyX` key handlers, and clears it inside the command closure.
- Builds the `TickCommand` the closure returns: `combineSteer` for the move, the flag for the belch.
- Attaches `StormRenderer` in `dressField()`, beside `FieldRenderer` and `GraveRenderer`, and never in `reset()`. `reset()` clears the layers and `dressField()` is the one place renderers go back; a renderer attached anywhere else leaves the second run out of the pool with no storm at all, and the lifecycle test goes green on exactly that.
- Passes `run.reservoir / RESERVOIR_CAPACITY` to `GraveRenderer.sync`.
- Passes every event to `sound.playFor` in the one line that already walks them.
- Positions the belch button in `resize()`, from the same reserve the pause button uses.
- Clears `belchRequested` in `prepare()`, `reset()` and `goQuiet()`, because it is per-run mutable state on a pooled screen, which is the class of defect this app has shipped five times.

**Two fixes to existing behaviour, both dispatch 4 findings whose trigger is now.**

- **The countdown blurs the corpse and treasure layers too**, so `BLURRED_LAYERS` becomes `mobBodies`, `mobFire`, `corpses` and `treasure`, and only the grave and its rim are spared. Dispatch 4 shipped the blur sparing corpses, which was invisible then because a played run produced none. The rule the blur was written against is that a frozen sharp field hands the player free seconds to plan, and a corpse field is exactly what a dive is planned through: freshness is a deadline, and three sharp seconds of it is the highest-value free read in the game. The principle that the grave is spared, because re-finding it is what the countdown is for, is unchanged.
- **One `BlurFilter` instance, built once and toggled with `filter.enabled`.** Today one is allocated per countdown and never destroyed, and the countdown fires on every resume and every return from a backgrounded tab. This is Pixi's own guidance, and it also settles the standing unhandled rejection in `screenLifecycle.test.ts`, where `new BlurFilter` has no document to compile a shader against under node. That rejection is the one pre-existing anomaly this dispatch is asked to clear.

### 6.24 `src/app/popups/PausePopup.ts`, End Run asks first

Dispatch 4 deferred this with the trigger "dispatch 5, when there is a score to lose". There is now: overflow pays score, drops level lines, and ending a run by mis-tapping a menu button costs a build.

The smallest thing that works: End Run's label becomes a question on first press and acts on the second, and it reverts whenever the menu closes or Settings is opened. No new popup, no new navigation path, and no new state that outlives the menu.

**Do not touch the blur.** `PausePopup`'s `BlurFilter` is load-bearing, not dressing: it is what stops a pause menu opening a "pause and read the curtain" line. The record has called it that twice and it arrived as template behaviour nobody chose, which is exactly how such things get deleted.

Nothing else in this file or in `SettingsPopup` or `VolumeSlider` is touched. #38 owns their dressing.

### 6.25 `src/boundary.test.ts`, a rule for sound

`Boundary` gains an optional `only?: string[]`, naming specific files under a root so a rule can govern one file rather than a folder. **That alone is not enough, and an earlier draft stopped there.** `folderReachedBy` at `boundary.test.ts:65-68` resolves a specifier and keeps `split(/[/\\]/)[0]`, the top-level folder and nothing more, so `mayReach: ["game"]` permits every module in the sim. The rule as drafted would have passed `sound.ts` importing `mobs.ts`, which is the exact thing it exists to forbid.

**So the narrowing has to be on the target, not only on the source.** `folderReachedBy` becomes `pathReachedBy`, returning the whole slash-normalized path relative to `src` with no extension, and an entry matches when it equals that path or is a prefix of it at a segment boundary. Existing entries keep working unchanged: `"game"` still matches `game/mobs`. New entries can be as narrow as one module.

```ts
{
  root: "app",
  only: ["sound.ts"],
  mayReach: ["game/events", "engine/audio/audio"],
  mayImport: ["@pixi/sound"],
}
```

**The rule also needs `engine`, and without it it red-lights on its own first commit.** The `SFX` class this dispatch builds on lives at `src/engine/audio/audio.ts` (`audio.ts:65`), which is outside `src/app` entirely, so a rule listing only `game` forbids the import the design requires.

`src/app/sound.ts` is governed by nothing today, which dispatch 4 named as a tripwire. A folder rule over `src/app` is the wrong instrument, because `src/app` legitimately imports pixi and reaches both `src/game` and `src/input`. What needs holding is narrower and is the thing that will otherwise rot: sound subscribes to events and must never reach back into the sim's internals. One file, one rule, one mechanism, rather than a comment asking nicely.

### 6.26 `src/dev/invariants.ts`, extended

- **Skulls are in bounds, checked against the field widened by their own extent**, the way shots are at `invariants.ts:132-136`. A skull is launched from the mouth, travels straight up, and is culled when it leaves, so its own extent is the right box.
- **Wisps are checked against the field widened by `SPAWN_MARGIN`**, the way mobs and corpses are, and **not** by `WISP_HALF_EXTENT`. An earlier draft used the extent for both and it would fire on a legal state: `cullMobs` at `mobs.ts:511-512` legitimately allows a mob out to `SPAWN_MARGIN`, a wisp homes on the mob it was given, and a wisp chasing a legal mob past the top edge is the harness catching the game playing correctly. Whichever box a wisp is checked against has to be the box its target is allowed to be in.
- No NaN in any skull's or wisp's position or velocity, or in any field of `state.lines`.
- The skull and wisp pools never exceed their caps and no two live slots share an id, through the existing `checkPool`.
- **`state.reservoir` is between zero and `RESERVOIR_CAPACITY` inclusive, within a stated tolerance.** It has never been checked and the belch now empties it. The tolerance is not slack: `payReservoir` at `swallow.ts:66-68` computes `taken = Math.min(amount, CAP - r)` and then `r += taken`, and `r + (CAP - r) > CAP` is reachable in binary64, which the gate measured at roughly 0.3% of fills with the real constants. So the check carries a `RESERVOIR_TOLERANCE` in the shape `checkInBounds` already uses for `BOUNDS_TOLERANCE` at `invariants.ts:88`, with the same kind of comment saying what physical quantity the tolerance is smaller than. The alternative, clamping in `payReservoir`, moves the arithmetic the digest pins and buys nothing the tolerance does not.
- Every level is between zero and `MAX_LEVEL`, and a birthright line is never below one. The floor ladder strips levels and `payLevel` raises them, and both write to the same record.
- At most one bell ring is live.

`checkStage`'s watch is not touched. Its record-after-validate ordering was fixed in the dispatch-4 review round and the reason is in its own comment.

### 6.27 `src/dev/bot.ts`, the policies

**`clearingPolicy` is deleted**, along with `CLEARING_RADIUS` and its four uses in `bot.test.ts`. It stands in for the storm and nothing else, and while it is there the full-run tests measure the rig instead of the game. The full-run tests are rewritten onto real weapons in the same change.

**`dodgePolicy` is not improved.** Its known limits are recorded and they are limits of a deliberate stand-in: it cannot cut across a ghoul, because that means accepting less clearance early to get behind the turn and its scoring dominates that; and it does not price the field edge, because `graveAfter` clamps, so a move into the wall scores the same as standing still. A bot proof is an upper bound on perfect play and never a fairness result. Do not tune it to make a test pass.

**Two new policies, both ADR 0016's Wall property**, which needs the belch and could not exist before this dispatch:

- **`belchingPolicy`**: dodges, and belches when the reservoir is full and there are shots on the field worth cancelling. It must cross the Wall clean.
- **`unloadedPolicy`**: dodges and never belches. It must cross the Wall alive, at a real cost in size or hits. Written as a plausible human and not as an optimizer, the same rule `dodgePolicy` is written under.

`Policy` becomes `(state, caused) => TickCommand`, because a policy that cannot express a belch cannot carry this property at all.

**Both policies run at a stated build, and that is the axis the property actually turns on.** ADR 0016's property is two-sided and both sides are claims about build strength: crossable unloaded has to hold at the **weakest** build a run can produce, and never crossable for free has to hold at the **strongest**. Whatever five seeds happen to roll is neither, and a run that rolled a level-5 bell would plausibly carve the Wall over the two or three tolls a crossing takes, failing the never-free half while every test stayed green. So the levels are set directly on the run before the crossing rather than left to the dice:

- **The floor build** is the birthright and nothing else: `{soulStream: 1, headstones: 1, wisps: 0, bell: 0}`, which is what `createRun` starts every run at. `unloadedPolicy` crosses at that build.
- **The ceiling build** is every line at `MAX_LEVEL`. `belchingPolicy` crosses at that build, with a full reservoir.

Dispatch 4 shipped the Wall untested against its own property and this is where that is paid.

**The `it.fails` tests go green and therefore go red.** `RAMP_RED_SEEDS` (101, 303, 505) and the whole size-ceiling block are declared `it.fails` precisely so that weapons landing turns them into failures demanding a rewrite. That is the file asking for attention. Rewrite them into ordinary assertions with the results the weapons actually produce, and report every seed's outcome.

**Section 5 of dispatch 4 asserted `dodgePolicy` reaches victory from the size ceiling and its own section 8 proved it cannot.** Section 8 had the arithmetic and was right. Do not reinstate the ceiling claim on the strength of the old test; assert what the weapons actually do and say so.

### 6.28 `src/dev/digest.ts`, extended

- **The scripted deaths stay, and the scenario keeps its length.** An earlier draft removed `scriptedKills` and ran the scenario to 1300 ticks, and both changes make the golden depend on things dispatch 7 retunes. ADR 0015 says in as many words that "the scenario stays short and tuning-stable, or the final tuning dispatch reddens it on every retune", and a scenario whose kills come from the real weapon lines against the real ramp is neither short nor tuning-stable. A scripted death is a scripted death whether or not a weapon could also produce one.
- **The fold gets finer, and this one is kept.** `Math.round(value * 1e6)` becomes `1e9`. One f32 ulp at the ghoul's turn cosine is about 1.19e-7, which is below the current quantum: a single-tick divergence of exactly the size ADR 0015 exists to catch is invisible today and is only caught once it accumulates into position. The tech gate verified the arithmetic independently: that ulp moves the 1e6 fold by 0 and the 1e9 fold by 60, and `Math.round(760 * 1e9)` stays inside `ToInt32`'s range deterministically. The assertion moves to ulp scale with it, because a test asserting detection at 1e-5 pins nothing about the instrument's real resolution.
- **The RNG streams are reached by scripting a spawn, not by running longer.** At 600 ticks the scenario makes zero draws on every stream, because the only rows inside the window are two Drips of one, a Drip draws nothing, and index 0 is never armed. The fix is a scripted `file` spawn inside the existing window, which draws from `spawns` and arms a mob that draws from `mobFire`, so `drawn` measures something without the scenario inheriting the ramp's tuning. `drawn` is in the digest so that a divergence in how many draws a tick made is visible, and today it cannot see one.
- The skull and wisp pools join `foldEntities`, in slot order, alongside the mobs, shots and corpses. Iteration order is verified rather than assumed, which is what that function is for.
- `GOLDEN` regenerates with `pnpm digest`. **Say in your report that it was regenerated and why.** The constant is never updated to make a failing test pass; this dispatch changes the tick order, the pools, the draws and the fold, so a regeneration is the deliberate part of a deliberate change.

### 6.29 `src/game/stage/stage.ts`, the drain-out re-derived

`DRAIN_OUT_SECONDS` goes from 20 to 10, and the guarantee moves from the magnitude to a property test.

Dispatch 4's twenty seconds was computed honestly for the build it was written in: with nothing able to kill a mob, the only way the field empties is everything falling, and a mob spends a spawn margin above the edge, then its arriving beat, then the field's height plus its own half-height, which for the slowest type is a little over eighteen seconds. That is a weaponless artifact. Under the storm trash dies in a second or two, so the silence only has to cover stragglers plus a breath, and twenty seconds of nothing twice in a three and a half minute run is a sixth of the run with nothing to do.

The new number cannot be derived from falling, because under the storm the field is emptied by kills rather than by gravity. Ten seconds is 380 units of fall, which puts a mob spawned on the last row at mid-field and inside a level-3 bell's radius, so the storm is what closes it. **The property is what is pinned: the field is empty when the boss phase begins, asserted across the five full-run seeds.** If it fails on any seed the number goes up, and you report the number you landed on and which seeds forced it.

This is the recorded shape for this codebase and not an improvisation: pin relations by test, never magnitudes. The drain-out was derived twice and wrong twice on a number a player settles in ten seconds, and the test that survives is the property.

A boss's warning telegraph is the other half of shortening this, and it is dispatch 6's, with the bosses.

### 6.30 Record edits

- `apps/hungry-grave/CONTEXT.md`: the glossary gains **surge**, **toll**, **ring**, **inert** (a spent headstone), and **price** (the kill cost of the next drop). Vocabulary that reaches the screen belongs in the glossary, and the cancel scatter's absence from it was a dispatch-4 finding.
- **`docs/adr/0002-hybrid-swallow-economy.md`: the drop dice.** The ADR currently says the dice only pick which line levels, and section 6.8 now also rules how they pick: seed the first drop of each unowned line, then roll uniform. That is a rule about the shape of a run, Mark decided it on 2026-08-22, and its durable home is the ADR rather than a dispatch plan nobody reads again.
- **`docs/adr/0011`, the input ADR: the belch's binding.** Mark ruled a dedicated corner button on 2026-08-22 and that ruling currently lives only in section 6.16 of this plan.
- **`docs/design/tracer-plan.md` section 3: a correction.** It still says `touch.ts` carries "the second finger as the belch", which section 6.16 deletes. Fix the sentence rather than leaving the superseded rule standing in the plan every later dispatch reads.
- `docs/adr/0005-weapon-lines-are-a-pool.md`: no change. Every rule in it is implemented as written.
- `docs/design/tracer-plan.md` section 6, dispatch 5's entry: mark it done and record what shipped stubbed, in the shape dispatch 4's entry already uses.

## 7. The planned test list

Every test cites the ADR, plan section or decision-log entry it enforces. Expected values come from the ADRs and this plan, never from running your own code and pasting the output.

### `src/game/lines/soulStream.test.ts`

- The column count is the level, from one at level 1 to five at level 5.
- Columns are symmetric about straight up and spaced `FAN_STEP_DEGREES` apart.
- A skull's velocity is identical on its first tick and its last: the stream never homes (ADR 0005).
- A skull launches from the grave's mouth, not its centre, and does not move on the tick it launches.
- A swallow sets the surge, the surge shortens the interval, and it is spent after exactly `SURGE_VOLLEYS` volleys.
- **A swallow chain cannot hold the surge open.** Ten swallows across a window buy no more surged volleys than the count each one sets, because `surgeStream` sets rather than adds. This is Mark's 2026-08-22 ruling and it is the half of the fix a count alone would not give.
- **The surge changes no damage.** Total damage over a fixed window with and without a surge differs only by the number of volleys, never by the damage per skull. This is what section 3's one-body bound margin rests on.
- At the cap the spawn is refused and nothing already on the field is removed.

### `src/game/lines/headstones.test.ts`

- The stone count per level is `[0, 1, 2, 3, 4, 6]`, and levels 4 and 5 split across two rings.
- The two rings counter-rotate.
- **A stone's path clears the grave's hitbox at the size floor and at the size ceiling both**, on both axes. This is the elliptical-orbit rule and a circular orbit fails it at the ceiling.
- The orbit period is `ORBIT_TICKS` and the phase wraps rather than growing without bound.
- A stone that hits goes inert, damages nothing while inert, and recovers after `STONE_RECHARGE`.
- A stone is not consumed by a hit.

### `src/game/lines/wisps.test.ts`

- A run starts with no wisps and a swallow launches none until the line is levelled.
- The count per level is `[0, 1, 2, 4, 6, 8]`.
- Wisps launch on the swallow, on the same tick the food went in.
- **A volley never commits more wisps to one mob than its health**, over a field of mixed types. This is the rule section 3's bound depends on and it is the test that makes the bound a fact.
- A wisp re-targets when its target dies and does not re-target while its target lives.
- A wisp expires at `WISP_LIFETIME` with nothing to hunt.
- A wisp's turn is bounded: it cannot reverse in under a second.

### `src/game/lines/bell.test.ts`

- The toll fires on `BELL_PERIOD` regardless of swallows, kills, or anything else on the field (ADR 0005: it left the swallow deliberately).
- The radius per level is the declared table, and level 5 reaches nearly the field's width.
- At most one ring is live at any tick, and a ring's life is shorter than its period.
- Damage falls off with distance, is `BELL_DAMAGE_NEAR` at the grave and `BELL_DAMAGE_FAR` at the edge.
- **A mob is damaged once by one ring**, on the tick the leading edge crosses it, never twice and never on the tick after.
- **One toll alone cannot clear a wave.** Twenty-two shamblers across the field's width, a level-5 toll centred on the grave, and survivors remain. This is the bound the wisps already carry and the one the bell walked out from under when it left the swallow.
- **The first toll after the bell's drop lands damage within a bounded time**, at level 1, with the ramp's own density around the grave. The concept doc promises the first toll always has a visible victim and this is its watcher rather than a tuning intention.
- Pushback is zero below level 4 and non-zero at 4 and 5.
- A pushed mob stays inside the field widened by `SPAWN_MARGIN`.

### `src/game/mobs.test.ts`, the storm's overlap pass

These live beside the existing mob tests, because section 6.7 puts `resolveStorm` in `mobs.ts`. There is no `storm.test.ts`.

- The resolve order is skulls, headstones, wisps, and it is stable across runs.
- A skull is consumed by the mob it hits; a wisp is; a stone is not.
- Every death goes through `damageMob`, so a kill leaves a corpse and emits `mobKilled` with no second path.
- **One swallow's whole burst payload never clears a wave, over every trash type, at every level.** The payload is the wisp volley **and** the surged volley together, which is what section 3 derives; asserting the wisps alone would pass the defect all three gates found. Assert it over the roster rather than over the shambler alone, on the two waves the authored stage really contains: seven ghouls and twenty-two shamblers.

### `src/game/drops.test.ts`

- The price table is the declared twelve and the price rises.
- Past the twelfth drop the price holds at the last entry.
- The price is a table lookup and never a `pow`, which ADR 0015 keeps out of the sim.
- The first drop costs about five kills, which is the concept doc's founding rhythm.
- **Ten to twelve drops land across the authored stage's 268 mobs**, computed from the table rather than by running a stage: six kills in ten pays ten drops, near-total clearance pays twelve.
- The dice pick only which line levels, never whether a drop appears.
- **The dice seed before they roll**: while any line has never dropped, the roll only picks among those, and once all four have dropped it is uniform over all four.
- **No run of four or more drops can miss a line**, which is the whole point of seeding and is the measure the weighted scheme could only push to 1.25%.
- A maxed line is still reachable by the dice, so ADR 0002's overflow path stays live.
- **`creditKill` pays for a bell kill exactly as it pays for a skull kill.** Set up a kill from each source and assert the counter moves the same. A price that depended on which weapon landed the last damage is the defect this asserts against.
- A drop never decays and only the bottom edge takes it. **Watch it go red with `cullCorpses` left on the module constant**, which is how the plan's own section 6.9 defect would have shipped.

### `src/game/belch.test.ts`

- It does nothing below a full reservoir, at any level of charge (ADR 0008: there is no partial bomb).
- At full it cancels every live shot on the field and empties the reservoir.
- It emits `belched` with the count cancelled.
- A second press immediately after does nothing.

### `src/game/swallow.test.ts`, extended

- A swallow surges the stream and launches the wisps, in the same call, after the payouts.
- A drop's `line` reaches `payLevel`, which is the field `Swallowable` has been declaring and nothing has ever set.
- Nothing about the existing payout order, event order, or the absence of a size check changes.

### `src/game/corpses.test.ts`, extended

- A drop is fully fresh, never decays, carries its line, and uses `DROP_HALF_EXTENT`.
- **Eviction never takes a drop or a feast.** At a full pool of treasure the spawn is refused instead.
- `corpseLost` carries the food's kind.

### `src/game/mobs.test.ts`, extended

- **An armed mob below the grave does not fire.** Watched go red with the fix removed.
- The existing type, motion, tell and turn-rate tests are unchanged, **including the ghoul's 2 health**. Section 3 withdraws the change an earlier draft made to it.

### `src/game/step.test.ts`, extended

- The tick order is the documented one, with the belch before spawns and the lines after mob motion.
- **A belch cancels a shot that would have hit this tick.** Ordering the belch after overlap resolution makes this fail, which is the point of the test.
- A skull launched this tick does not move this tick.
- The determinism snapshot spreads the two new pools and the whole `lines` record. The existing snapshot already covers the stage, `nextEntityId` and the three older pools, and a pool left out of it lets two runs diverge inside it and pass.

### `src/game/advance.test.ts`, extended

- **A frame that buys three ticks belches once**, through a command source that read-and-clears its own flag, which is the screen's real contract. Assert the count of `belched` events.
- A frame that buys zero ticks does not consume the flag.
- `advance` calls the command source once per tick and passes the whole `TickCommand` through unchanged. This is what makes the two above properties of the seam rather than of the caller.

### `src/game/digest.test.ts`, extended

- The golden constant matches, regenerated deliberately.
- **Detection at ulp scale**: perturbing an entity by one f32 ulp moves the checksum. Today's assertion is at 1e-5, a hundred times coarser than the divergence ADR 0015 exists to catch.
- **The `spawns` and `mobFire` streams have both drawn** by the end of the scenario, which is what the scripted `file` spawn is for. Today all four read zero. `drops` draws only if the scripted kills reach the first price of five, so assert what the scenario actually produces and report the figure rather than assuming it. **`shed` is deliberately excluded and stays at zero**: nothing consumes it until dispatch 6 authors the Banshee's shed, so an "every stream has drawn" assertion could not pass in this build and would have to be weakened on its first run.

### `src/game/stage/stage.test.ts`, extended

- `DRAIN_OUT_SECONDS` is 10 and `phaseLengthTicks` follows it.
- Drain-out windows still spawn nothing.

### `src/dev/invariants.test.ts`, extended

Each new check gets a test that constructs the illegal state by hand and watches the harness throw: skull and wisp bounds, NaN in `lines`, the two new pool caps, the reservoir's range, the level range with the birthright floor, and one live ring.

### `src/dev/bot.test.ts` and the full-run tests

- Five seeds, run end to end on real weapons with `clearingPolicy` gone.
- **ADR 0013's full-run assertions, all six of them, measured from a real run**: length in band, **kills in band**, **ten to twelve drops**, phases in order, both endings reachable, zero invariant fires. The first version of this list carried three. The two added here are the ones that cannot be computed from the table: section 3's price curve is derived against 268 authored mobs and the derivation is sound, but only a run says whether the storm's real kill rate against the real rows lands in the ten-to-twelve band. Assert the band, and if a seed falls outside it, report the count and which seed rather than moving the table.
- `dodgePolicy` reaches the `over` phase, or does not, and the test asserts what it actually does. **Do not assert victory because dispatch 4's section 5 did**; its section 8 proved the ceiling claim false and this build is a different game again.
- The three `RAMP_RED_SEEDS` and the size-ceiling block are rewritten from `it.fails` into ordinary assertions.
- `hitTakingPolicy` walks the whole ADR 0003 ladder now that score and strippable levels both exist: score bleeds, levels strip to the birthright, then sealed. Dispatch 4 could only test the ladder against hand-seeded state.
- **`unloadedPolicy` crosses the Wall alive and pays for it**, in size or in hits, **at the floor build**: the birthright and nothing else.
- **`belchingPolicy` crosses the Wall clean, at the ceiling build**: every line at `MAX_LEVEL` with a full reservoir. Section 6.27 gives the reason both builds are pinned rather than rolled: the property is two-sided over build strength and whatever the seeds happen to roll tests neither side.
- **The field is empty when each boss phase begins**, on all five seeds. This is the drain-out's property.

### `src/app/palette.test.ts`, extended

- `AWAITING_A_COMPANION` is empty.
- Every storm and effect colour has a companion in `SPRITE_OUTLINE` and clears the fine-detail bracket against it, with the measured figure reported.
- Every `NOT_DRAWN_YET` exception is gone or re-argued on what it is.
- Assertion 4 bounds `DROP_HALF_EXTENT * 2` by `graveWidth(SIZE_FLOOR)`, which is 18 units, and the stale 9-to-10 comment above the `it.todo` is rewritten with it.
- The existing band, ceiling and layer assertions are untouched.

### `src/app/screens/game/StormRenderer.test.ts`

- A sprite pool per entity cap, no allocation on a spawn.
- Sprites follow their slots and a dead slot draws nothing.
- **A second run out of the pool starts with an empty storm.** Build a live skull, a live wisp and a live ring, reset, and assert nothing survives. Watch it go red with `forgetPreviousRun` removed: a guard nobody has seen fail is a claim, and this renderer holds exactly the per-run memory that leaked five times.
- The four motions draw in the four layers `SPRITE_LAYER` assigns.

### `src/app/screens/game/FieldRenderer.test.ts`, extended

- The flicker's half period clears the 11-tick WCAG floor.
- Two corpses killed on the same tick flicker out of phase.
- The revenant's tell has a component that grows as the shot approaches.
- The armed marker is not the ghoul's silhouette.
- **A shot's drawn extent is larger than `shot.halfExtent` and its core is not**, so the sprite grew and the collision box did not. This is the assertion that would have caught the change an earlier draft made to the wrong constant.

### `src/app/screens/game/BelchButton.test.ts`

- At least 44 by 44 CSS pixels at the phone, tablet and desktop viewports the layout tests already use.
- It does not overlap the pause button at any of them.
- It reads quiet below a full reservoir and lit at full.
- It draws only `PALETTE` colours.

### `src/app/sound.test.ts`

- `playFor` reacts to `chimed`, `tolled`, `graveHit` and `belched`, and ignores every other event.
- It plays a chime for a corpse and for a feast from the very first swallow whatever the loadout, **and a different clip for a drop**, chosen from the `kind` the `chimed` event already carries.
- It holds no game rule: given the same event it plays the same clip, whatever the run state is.
- Its imports are inside the new boundary rule.

### `src/app/screens/screenLifecycle.test.ts`, extended

- A whole run with weapons, seeded through the URL the screen really reads, bounded in ticks.
- Run two out of the pool starts with an empty storm, an empty field, and `belchRequested` clear.
- The countdown's blur covers corpses and treasure and spares the grave and its rim.
- One `BlurFilter` instance across repeated countdowns.

### `src/boundary.test.ts`, extended

- The `only` field governs one file, asserted the way the existing `mayReachInTests` case is: a hand-written source string for both the allowed and the forbidden import, with no file behind either.
- **The target narrows too.** Under the sound rule, importing `../game/events` is allowed and importing `../game/mobs` is a violation. Without the `pathReachedBy` change in section 6.25 the second one passes, so this is the assertion that makes the rule a rule.
- The existing folder-level entries still match, so `game` still reaches `game/mobs`.

## 8. What is deliberately not tested here, and why it matters

Say this in your report rather than leaving it implied.

**Every magnitude in section 6 is a first pass and none of it is proven right.** The stream's interval, skull speed, fan step, surge interval and surge count; the stone standoff, orbit period and recharge; the wisp speed, lifetime and turn; the bell's period, radius table, damage falloff and push; the drop's price table and its size; the shot's draw scale; the eruption's reach and speed. Every one has a derivation and not one has been felt by a person. A test that pinned any of these magnitudes would break on the first retune and teach nothing; what is pinned is the relations.

**No magnitude that already existed is changed.** An earlier draft moved two, the ghoul's health and mob fire's hitbox, and both are withdrawn in sections 3 and 6.10. That matters for this build in particular: it is the build where Mark first reads the ramp's pacing with weapons in it, and two content edits are already waiting on that read.

**Whether the storm is fun is unread.** The core bet of this whole design is steering into where danger just was, and this is the first build where there is anything to steer into. No test can see it.

**Saturation is measured and not targeted**, and this build does not measure it. The airborne-projectile instrument is `src/dev/instruments.ts`, which no dispatch owns and which section 12 hands to dispatch 7. So ADR 0014's density figure, which the readability check is supposed to run at, is still whatever a played run happens to reach.

**The four motions staying tellable at full density is a human read.** ADR 0005's generative rule is that straight columns, circling solids, curving trails and expanding rings never blur, and there is no test for "these two things look different in motion".

**Both bosses are still empty phases** that end on the tick they begin, and victory is still dispatch 4's stub firing on the `over` phase. So the belch's boss damage, the bell's boss push immunity, the Wall's real anchor to the Banshee's death, and the feast that slams the reservoir full are all unbuilt. The Wall in this build arrives on its own clock rather than on her death.

**The bell's own price is unmeasured.** ADR 0005 records it deliberately: a maxed bell kills at the top of the field, those corpses scroll the whole way down and arrive nearly empty, and higher-level push shoves mobs further up before they die, so the strongest bell starves the fuel that made it strong. The watcher is the freshness-at-swallow instrument, which does not exist.

**The drain-out's ten seconds is the number most likely to be wrong in this build.** It is pinned by a property test rather than by a derivation, and the property only speaks to whether the field is empty, never to whether ten seconds of quiet feels right twice in a run.

**`dodgePolicy` remains structurally incapable of the ghoul's own counter**, so ADR 0016's turn-rate fairness bound still has no evidence behind it. Read it by hand; do not improve the bot.

**The bell's bottom three rungs are flat by construction, and nothing here fixes it.** Levels 1 to 3 differ only in radius, and under a linear falloff to 0.5 damage against three-health trash the extra reach does close to nothing: what it adds is damage too small to kill. Levels 3 to 4 gain push and 4 to 5 gain push plus 21% more radius, so the ladder's whole visible shape is in its top half. The concept doc requires all five levels of a line to look different on screen, and the bell is the one line whose curve is a single scalar. This is stated rather than fixed because the fix is a magnitude question and Mark's read is the trigger; section 10 asks for it directly.

**The price table is derived against 268 trash mobs with empty boss phases.** That is the whole currency supply of a tracer run today, and it stops being true in dispatch 6, which adds the Banshee's shed and the Undertaker's digger adds. Both pay through `creditKill` and neither moves a row count, so the trigger section 3 hands to dispatch 7, "if it moves the counts", cannot see them. Section 12 carries the real trigger.

## 9. How you work

- One vertical slice at a time: one test red, then the smallest implementation that makes it green, then the next. Never write the whole module and then the tests.
- Expected values come from the ADRs and this plan, not from running your own code and pasting the output. A test that asserts what the implementation already does is worth nothing.
- Small functions, each doing the one thing its name says. No IIFEs. Around forty lines is where splitting becomes the default. This dispatch is the largest yet and that rule is what keeps it readable.
- Comments: a JSDoc block on the declaration for anything that needs prose, `//` for a one-liner. Do not copy the comment style of whatever file you happen to be in. Never write a comment explaining code that is not there, and delete the comments describing rules this dispatch removes.
- No em dashes anywhere, in code, comments or your report. Comma, colon, parentheses, or two sentences.
- Use the vocabulary in `CONTEXT.md`. "Enemy" is banned; a hostile is a mob and its shots are mob fire. The grave swallows and passes under; it never drives. It presses against the field boundary; there are no walls, because the Wall is the Banshee's set piece.
- **Never open `src/prototypes/` at all.** Not to read, not to copy, not to check.
- Assert every edit matched. A prettier rewrap made an exact-match edit silently miss in 3a and a test was lost that way.
- Never weaken, skip or rewrite a test to reach green. If you think a test is wrong, that means the plan is wrong, and replanning is not yours: stop and report.
- **The `it.fails` tests are the one exception and they are not a weakening.** They exist to go red when weapons land. Rewrite them into ordinary assertions of what the weapons actually do, and report every seed.
- Three strikes on the same wrong observed behaviour, then stop and report what you tried, what you saw, and your best guess. No fourth attempt.
- Do not commit anything and do not deploy. Leave the work in the tree. The deploy is verification step 7 and it waits for Mark.

End your report with each verification step from section 2 and its result, and name steps 7, 8 and 9 as not yours to run and whose they are. Also report, separately and plainly: every stub you shipped, every number you picked that this plan did not give you, the regenerated digest and why, the drain-out figure you landed on, **the kill count and drop count each of the five seeds produced**, every seed's outcome on the rewritten `it.fails` tests, every separation exception you removed with its measured figure, and anything you found that contradicts this plan.

## 10. The on-device play, for verification step 8

This is Mark's, not yours. It is here so the dispatch ships with it.

**What this build is.** The first playable version of the actual game. The grave kills, collects, and grows inside a run, and a run can be won by playing. Both bosses are still empty phases that end instantly, so the Banshee and the Undertaker are silences where fights go, and the Wall arrives on its own clock rather than on her death.

**Three things will look like bugs and are not.** Each boss phase ends on the tick it begins. The ten seconds of empty field before each one is the drain-out and it is deliberately shorter than the build you last played. And mob fire is visibly bigger than it was: the sprite grew and the hitbox did not move, because it was drawing at about seven pixels on a phone on the object ADR 0014 calls large, and fifteen of eighteen bot deaths came from it. The bright core is the true box.

### How to run this read

Twenty reads cannot be held in your head while playing a real-time shmup, and the one at the top of the list is the one that dies fastest under self-observation. So it goes in three passes:

1. **Play a run with no list in hand at all.** Then write down whatever you noticed, before reading further.
2. **Play again for the five bolded reads below**, and nothing else.
3. **Everything else, on a third run or on however many it takes.**

**Where the reads land:** in a new section 13 of this file, written by whoever is at the keyboard when you give them, and committed. #36's acceptance criteria require that "the reads on feel are recorded", and of dispatch 4's thirteen reads only two are written down anywhere in the repo. That is the gap this closes.

### The five

- **Is steering into where danger just was delicious or miserable.** This is the central bet of the whole design and this is the first build that can answer it. Everything else here is smaller.
- **Does a drop read as treasure mid-dodge**, at a glance, without looking at a readout, and can you tell which line it is from its silhouette. Steady-bright beside fading corpses is meant to be free legibility. The drop is larger than a corpse in this build, on purpose.
- **Can you tell the four weapon lines apart while they are all firing.** Straight columns, circling solids, curving trails, expanding rings: do they stay four things at the densest moment, or do they become one wash.
- **After a bad hit, does the comeback force or the spiral force win.** A smaller grave is a smaller target and a smaller mouth at once, and this is the first build where both halves exist.
- **The ramp's shape over the first two minutes, now that density means something.** Dispatch 4's read had to be told to ignore density entirely, because with no weapons a shambler lived thirteen seconds instead of one or two. This read is the real one, and two content edits are waiting on it: the ramp's pressure peaks at t=74 and then eases for seventeen seconds into its own boundary, and the ghoul goes from a lone teaching Drip at t=62 straight to a V of seven at t=83 with no rung between.

### The rest

- Does the grave feel like it is growing over a run, or does the size just drift.
- Do the five levels of a line look different, or does levelling read as nothing. **The bell is the one to watch**: its levels 1 to 3 differ only in radius and nothing else, which section 8 says is flat by construction. If the first three rungs read as nothing happening, that is the finding.
- **Does the surge read as a beat at all**, late in a run when a lot is already firing. One swallow buys exactly one extra stream volley, which is the cap that keeps the ordnance bound true; if it reads as nothing, the count is the knob and raising it re-opens the bound.
- Does the belch button fall under your thumb, and can you tell you are loaded without hunting for it. The grave's glow is the other half of that tell; say which one you actually used.
- **Does the belch button get in your way**, in the bottom-right corner the grave itself dodges into. It draws as a hollow shape so it cannot hide mob fire, but a thumb parked there is a different problem from an occluded shot.
- Does the belch land as one big earned moment, or as a button you press when it lights up. It has its own sound in this build; what it does not have is a boss dying in front of it.
- Does the splash read when you swallow at a full reservoir, and does wasting charge feel like your fault.
- Does the bell's toll give you a rhythm to position against.
- Does freshness present itself as a choice. Greed has a deadline only when there is something to be greedy about.
- Is the drain-out right at ten seconds, twice in a run.
- Does a swallow at a field edge feel right when the growth shoves the grave inward and it stays where the growth put it rather than snapping back under your finger. Nobody has decided this and it is now reachable.
- **Are you being hit by nothing.** Mob sprites are drawn smaller than their hitboxes, worst on the ghoul, whose whole threat is its body. If this reads as unfair the fix is growing the sprites and it is one change. Mob fire is the one thing that got the fix already.
- Is the ghoul beatable by cutting hard across it. No bot can answer this: the stand-in policy is structurally incapable of the manoeuvre, so ADR 0016's fairness bound rests entirely on your read.
- **Two mob-fire tells changed shape in this build and both were channels you read directly last time.** The armed marker is now a horizontal notch instead of a down-pointing triangle, because the triangle was the ghoul's own body shape. And the revenant's tell keeps its closing iris but gains an outer ring that brightens as the shot arrives. Do they still read, and does the notch still say "this one shoots" at a glance.
- **The victory copy.** This is the first build a run can be won by playing, so this is the first time `THE STAGE SURVIVED` appears at the end of a real run. The subject is wrong: the player survived the stage, and its mirror `SEALED SHUT` is a state of the grave in the game's own vocabulary. Two directions if you want one: `STILL HUNGRY` or `STILL OPEN` to rhyme with the pair, or `STAGE CLEAR` as the genre-safe option. Read it where it actually appears rather than deciding it cold.
- Does the title screen's tagline sit right on a phone. It has never been checked by eye there and it is a longer string at the same size.
- Do the five sounds land: the swallow chime on every swallow, a different chime for a drop, the toll, the hit, and the eruption.
- Does ending a run from the pause menu now feel safe.

Blind, so a note from this read should not be acted on:

- Anything about either boss fight, the Banshee's feast, or the choreographed loaded belch on the Wall. None of it exists.
- **How the belch feels as a set piece.** It has a sound and an eruption, and it has no target: the Wall arrives on its own clock rather than on the Banshee's death, so the choreographed wipe the belch is designed around is not in this build. What you can read is the button and the moment; what you cannot read is the beat.
- Whether the belch's boss damage is right. There is no boss to take it.
- Whether the endgame saturation is right. It is measured rather than targeted and the instrument that measures it does not exist yet.
- Whether the bell starves its own corpse supply at level 5. Real, recorded in ADR 0005 as the bell's price, and its watcher is an instrument that does not exist.

## 11. The inheritance ledger

`dispatch-4-field.md` section 9 defers thirty items and section 10 records twenty-three more. Every one is listed here with what this plan does about it. A drop that is not named is the failure, whatever the reason for the drop.

### From section 9, carried forward

1. **The drag re-anchor's feel rule.** Its trigger is this dispatch's play and food is now real. On Mark's read list in section 10. Nothing in the code changes.
2. **A drop must render under 10 field units.** Done, and **the item's own number was stale**. The 10 came from `dispatch-4-field.md` section 9's bullet; that same file's section 4.15.5 supersedes it in as many words and the real bound is `graveWidth(SIZE_FLOOR)`, 18 units. Section 6.8 sizes the drop at 16 and assertion 4 pins it against the right constant.
3. **The Wall's two bot policies.** Done: `belchingPolicy` and `unloadedPolicy` in section 6.27, each pinned at a stated build, with ADR 0016's two-sided property in section 7.
4. **The storm's four colours collide with each other and with the food.** Done: section 6.21 gives every one a companion and empties the allowlist.
5. **The dev-only autopilot in the rendered game.** Not this dispatch. Trigger stays dispatch 7, behind the `no-restricted-properties` fence over `src/input`. Re-listed in section 12.
6. **`clearingPolicy` is deleted by dispatch 5.** Done: section 6.27, with the full-run tests rewritten onto real weapons.
7. **End Run wants a confirm.** Done: section 6.24, a two-press label rather than a new popup.
8. **Victory is a stub and the Undertaker's swallow is the real ending.** Not this dispatch. Dispatch 6.
9. **The boss phases are empty.** Not this dispatch. Dispatch 6, and said plainly on Mark's read list so an empty phase does not read as a bug.
10. **The feast's never-decaying flag ships unused.** Still unused. Dispatch 6 authors the shed. This dispatch does use the flag, for drops, so the mechanism now has a caller even though the feast does not.
11. **Mob magnitudes are all first-pass.** Still dispatch 7's, **with no exceptions**. An earlier draft of this plan claimed two, the ghoul's health and mob fire's size, and both are withdrawn: section 3 shows the ghoul's health was buying margin against a defect that is now fixed at its cause, and section 6.10 shows mob fire's "size" was its collision box. The readability defect is real and section 6.20 fixes it in the drawing.
12. **A burst kill makes every corpse's flicker land in lockstep.** Done: section 6.20 drops the rate to 2.5 Hz, clearing the floor `tuning.ts` already derives, and offsets each corpse's phase by its id.
13. **The digest's `math.ts` coverage rides on the ghoul.** Retired: section 6.1 puts the headstones' orbit through `sin` and `cos` on every tick of every run, so the coverage no longer depends on a mob type that sits second on the cut order.
14. **The Wall's count-to-width relation is renegotiated when its property is finally tested.** Now tested, in section 7. If the unloaded crossing is not survivable, that is a finding about the Wall's count and it is reported rather than fixed by tuning the bot.
15. **The drain-out's 20 seconds is a weaponless artifact.** Done: section 6.29 re-derives it to 10 and moves the guarantee to a property test across five seeds.
16. **A boss needs a warning telegraph.** Not this dispatch. Dispatch 6, and it is the other half of shortening the drain-out, which section 6.29 says.
17. **A mid-band body colour is where neither companion reads.** Not this dispatch. `undertaker` and `bansheeDark` stay in `SEPARATION_EXCEPTIONS` with their figures. Dispatch 6.
18. **#38 inherits section 4.15 and needs to be told which parts it may re-decide.** Not the dispatch agent's: it is a comment on #38, posted by the main thread when this dispatch lands. Re-listed in section 12 so it cannot be lost.
19. **The ghoul's name carries a mechanic promise.** Not this dispatch. Mob variety, alongside banshee shedding.
20. **The instruments do not exist yet and `src/dev/instruments.ts` is unowned.** Not built here, and this dispatch is why it matters: five of the concept doc's instruments read events this dispatch emits. Section 12 claims it for dispatch 7 explicitly, which is what the item asked for.
21. **`user-scalable=no` fails WCAG SC 1.4.4.** Not this dispatch. #38.
22. **Nothing owns retiring the corner readouts, `?size=`, `#/digest` or `#/prototypes`.** Not this dispatch. #38. Note that this dispatch adds no new corner readout: the reservoir's tells are the grave's glow and the belch button.
23. **`PausePopup`'s `BlurFilter` is load-bearing.** This dispatch touches that file for the End Run confirm, so section 6.24 carries the warning into the work rather than leaving it in a plan #38 will read later.
24. **`GRAVE_ASPECT` silently sets the Undertaker's difficulty.** Not this dispatch. Dispatch 6. Worth noting that section 6.4 now also derives the headstone orbit from the aspect, so a change to it moves two things.
25. **`DRAG_RATIO` is the input-parity dial.** Not this dispatch. Dispatch 6 for the Undertaker, dispatch 7 for tuning.
26. **The belch firing on any second pointer is a misfire risk.** Decided by Mark on 2026-08-22 and done: a dedicated corner button, section 6.16 and section 6.17, with the second-pointer rule deleted rather than left as a comment. Section 6.30 also gives the ruling a durable home in ADR 0011 and corrects the tracer plan's section 3, which still describes the second finger as the belch.
27. **There is no render interpolation.** Not this dispatch. `clock.remainderMs` is already the alpha if it is ever built.
28. **`GRAVE_RIM_STROKE`'s 2 CSS pixel floor is a phone claim in a field-unit constant.** Not this dispatch. #38.
29. **The title screen's tagline has never been checked by eye on a phone.** On Mark's read list in section 10.
30. **The bled score does not scatter as swallowable scraps.** Parked by Mark on 2026-08-20. Not re-opened. Its trigger is the #31 playtest's spiral-versus-comeback read.

### From section 10, the implementation gate round

31. **The plan's ceiling test contradicted its own section 8.** Done: section 6.27 forbids reinstating the ceiling claim and section 7 asserts what the weapons actually do.
32. **`dodgePolicy` does not survive the ramp on three of five seeds, on aimed mob fire.** This dispatch is the fix by construction: the weapons cut how long an armed mob lives, and the record's own finding is that a weaponless build inflates mob fire by roughly a factor of five. The rewritten `RAMP_RED_SEEDS` tests are the measurement.
33. **The ramp's pressure peaks at t=74 and then declines into its own boundary.** Mark's, and his trigger is this play. On the read list. No row is edited by this dispatch.
34. **The ghoul has no develop rung.** Mark's, same trigger, on the read list. No row is edited.
35. **Mob sprites are materially smaller than their hitboxes.** Mark's read, on the list, and the ledger records that the fix is growing the sprites and does not touch the Wall's arithmetic. Not changed unasked.
36. **Mob fire renders about 7.2 CSS pixels on a phone.** Done, **and fixed in the right file**. Section 6.20 draws the star at 1.6 times the hitbox and makes the bright core the true box; section 6.10 leaves `shotHalfExtent` at 5. An earlier draft raised that constant, which is the collision box at `mobs.ts:425` and `mobs.ts:284-287`, and would have shipped 2.56 times the hit area as a readability fix in the build where the ramp's pacing is first read. It is still changed rather than asked, because it is a readability defect against ADR 0014's own words and readability is a day-one rule here rather than polish.
37. **The revenant's tell loses salience as the shot gets closer.** Done: section 6.20 pairs the closing iris with something that grows.
38. **The armed marker reuses the ghoul's silhouette.** Done: section 6.20 makes it a notch.
39. **The corpse last-chance flicker runs at 5 Hz.** Done, with item 12.
40. **`SEPARATION_EXCEPTIONS` shipped at 29 pairs where four were priced, and 18 involve a sprite this dispatch draws.** Done: section 6.21 pays the bill and re-argues or removes each one.
41. **Assertion 1 is recorded rather than inherited, behind the `AWAITING_A_COMPANION` allowlist.** Done: section 6.21 requires the allowlist empty, which is the only state that makes the assertion mean what it says.
42. **The cancel scatter is shared vocabulary and lives only in a finished dispatch's plan.** Already fixed: it entered `CONTEXT.md` on 2026-08-22, uncommitted at the time this plan was written. Section 6.19 uses that vocabulary for the belch, which is what the original commitment said it was for.
43. **The renderer's feel magnitudes are ADR 0014 announcement channels, not dressing.** Not fixed here as a rule, and this dispatch adds more of them: the storm's silhouettes, the ring's fade, the eruption's reach, the button's lit state. Section 12 hands #38 the whole class rather than the four names dispatch 4 listed.
44. **The countdown blurs `mobBodies` and `mobFire` and spares `corpses`.** Done: section 6.23 blurs corpses and treasure too, on the plan's own stated principle rather than on a new one.
45. **`dodgePolicy` is structurally incapable of the ghoul's own counter.** Not fixed, deliberately. Section 6.27 forbids improving the bot and section 10 puts the ghoul's fairness on Mark's read list, which is the only instrument that can answer it.
46. **The digest's fold is coarser than the divergence it exists to catch.** Done: section 6.28 takes the fold to 1e9 and the assertion to ulp scale.
47. **The digest still makes zero RNG draws.** Done: section 6.28 scripts a `file` spawn inside the existing window. An earlier draft ran the scenario to 1300 ticks instead, which reaches the ramp's own first drawing row and ties the golden to rows dispatch 7 retunes, against ADR 0015's stated requirement that the scenario stay short and tuning-stable.
48. **A File above count 6 stops being a file.** Not this dispatch. Dispatch 7, at the first File count above 6. Today's rows top out at 6.
49. **A `BlurFilter` is allocated per countdown and never destroyed.** Done: section 6.23 shares one instance and toggles `enabled`, which also settles the standing unhandled rejection under node.
50. **The reserve assertion is arithmetic, not the pixi measurement section 4.16 specified.** Not fixed. Nothing lengthens the readout stack here, and the belch button is positioned from the same reserve rather than inside it. Re-listed in section 12.
51. **`dodgePolicy` does not price the field edge.** Recorded and not acted on, per item 45. A capped room-to-move term was already written and re-run across five seeds and saved nothing.
52. **An armed mob that has passed the grave keeps firing upward at it from behind.** Done: section 6.10 stops it. The record's own note is that under the storm it is close to zero shots, which is an argument for it being cheap to fix rather than for leaving a thing that reads as unfair.
53. **The ghoul's turn rate, 60 degrees per second, is a number dispatch 4's plan did not give.** Not this dispatch. Dispatch 7. The pair test holds the relation without asserting the magnitude.

**The two items dispatch 4 fixed in its own round are closed and are not inherited**: the fifth pooled-screen leak in `FieldRenderer`, and the vacuous lifecycle test that could not see it. Both are in `c1f9c40153` with their reasoning. `StormRenderer` is written under the lesson they taught, which is section 6.19.

## 12. Carried forward, not this dispatch

Do not act on these. They are here so the next planner does not rediscover them.

- **`src/dev/instruments.ts` is claimed by dispatch 7, explicitly.** Five of the concept doc's instruments read events this dispatch emits and none of them exists: belch rate versus full-reservoir time, drop count and inter-drop spacing, drops swallowed versus scrolled off, freshness at swallow, and the airborne-projectile count that becomes ADR 0014's density figure. Until they exist, "saturation is measured rather than targeted" is a sentence with no measurement behind it.
- **The bell's own price is unwatched.** ADR 0005 records that a maxed bell kills at the top of the field and starves its own corpse supply, and names the freshness-at-swallow instrument as the watcher. Trigger: dispatch 7, with the instruments above.
- **`Corpse` now holds corpses, feasts and drops and is not renamed.** Section 6.9 declines it: the rename touches the pool, the hitbox, the invariants, the digest, the renderer and six test files and buys vocabulary only. Trigger: dispatch 6, which adds the boss feasts and is the last dispatch that can do it cheaply.
- **`damageMob`'s `_source` still wears its underscore, and dispatch 4 predicted it would come off here.** It does not, and the prediction was off by one dispatch rather than wrong: the first rule that branches on the source is a boss taking the bell's damage and never its push, and there is no boss. Trigger: dispatch 6. The parameter is still correct to carry.
- **#38 must be told which parts of dispatch 4's section 4.15 it may re-decide**, and now also that every feel magnitude in `FieldRenderer` and `StormRenderer` is an ADR 0014 announcement channel rather than dressing: the hit dim's alpha, the corpse fade floor, the flicker's period and depth, the scatter's reach, the countdown's blur strength, the ring's fade, the eruption's reach, and the belch button's lit state. The band's construction and the outline table are structural and survive a re-palette; the individual hexes are #38's inside those rules. **The same comment says that nothing owns audio past this dispatch's five placeholder clips**: they are synthesized stand-ins on the same footing as the placeholder art, and no dispatch and no ticket currently owns replacing them. Post it as a comment on #38 when this dispatch lands.
- **The pause button is template `Button` code drawing over a live field**, outside `palette.test.ts`'s source scan, which is the same hole section 6.17 refuses to dig for the belch button. Trigger: #38, with the shared widgets.
- **The belch's binding is not a player setting.** Bullet Hell Monday ships two-finger tap, button and double tap as a choice, and a left-handed player has no way to move this button. Trigger: #38's accessibility sweep, or the #31 playtest if a tester raises it.
- **The reserve assertion is still arithmetic rather than a pixi measurement.** Nothing measures the real readout width until a rendered check. Trigger: the first longer readout.
- **The dev-only autopilot** stays dispatch 7's, behind the `no-restricted-properties` fence over `src/input`.
- **A File above count 6 stops reading as a file.** Trigger: the first File count above 6, which is dispatch 7's density work.
- **The ghoul's turn rate, `GRAVE_ASPECT`'s effect on the Undertaker, and `DRAG_RATIO`'s input parity** are all unchanged and all still owned as dispatch 4 left them.
- **`user-scalable=no`, the corner readouts, `?size=`, `#/digest` and `#/prototypes`** are all still #38's, unowned by any dispatch before it.
- **The tracer plan's module list has never been swept for unowned modules.** `docs/agents/feature-playbook.md` now requires that sweep before the next dispatch is planned, and this is the instance: every module the tracer plan names either has a dispatch that owns it or is recorded here as unowned with a trigger. `src/dev/instruments.ts` is the one already known, and the sweep is what says whether there are others. **Trigger: before dispatch 6 is planned**, by the main thread rather than by a dispatch agent.
- **The drop price table must be re-derived when dispatch 6 lands, and section 3's stated trigger cannot see why.** Section 3 routes a re-derivation to dispatch 7 "if it moves the counts", and dispatch 6 moves the currency supply without moving a count: the Banshee's shed and the Undertaker's digger adds both pay through `creditKill` while the authored row tables stay at 268 trash. More kills against the same twelve prices is more drops per run, straight out of the ten-to-twelve band. **Trigger: dispatch 6, at the moment either boss produces a killable body.**
- **`runPolicy` does not go through `advance`, and ADR 0015's stated reason for the accumulator's home is untrue because of it.** The ADR says the accumulator lives where it does "so the autopilot and the rendered screen share one implementation", and `src/dev/bot.ts:44` calls `stepChecked` directly. Section 6.13 declines to fix it here because it reshapes the rig in the same dispatch that rewrites every full-run test. Trigger: dispatch 7, with the dev-only autopilot, which is the change that makes the ADR's sentence load-bearing.
- **The bell's levels 1 to 3 differ only in radius**, which section 8 argues is close to no visible ladder at all under a falloff to 0.5 damage against three-health trash. Trigger: Mark's read in section 10, and dispatch 7 if it reads as flat.
- **The bled score does not scatter as swallowable scraps.** Parked by Mark, trigger is the #31 playtest.
- **Banshee shedding** is parked by Mark. Do not re-ask; revisit with mob variety.
