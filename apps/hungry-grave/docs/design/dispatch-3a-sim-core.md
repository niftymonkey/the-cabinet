# Tracer dispatch 3a: the headless sim core

This is the plan half of the feature playbook's dispatch contract for tracer plan section 6 item 3, which Mark split in two on 2026-08-20: 3a is the headless sim, 3b is the app wiring that makes it playable and ends at his on-device input check. The split reason is on the tracer plan.

You are writing production code in `/home/mlo/dev/niftymonkey/the-cabinet/apps/hungry-grave`.

Read `docs/agents/feature-playbook.md` at the repo root first and follow it. This prompt is the plan half of its dispatch contract; you execute.

Read these before you write anything: `apps/hungry-grave/docs/adr/0015-determinism-across-devices.md`, `0003-size-is-health.md`, `0004-one-freshness-meter.md`, `0002-hybrid-swallow-economy.md`, `0008-the-belch-full-only-the-bomb-everywhere.md`, `0013-the-sim-verification-contract.md`, `apps/hungry-grave/docs/design/tracer-plan.md` section 3 and section 5, and `apps/hungry-grave/CONTEXT.md` for the vocabulary.

**Never open `src/prototypes/` at all.** Not to read, not to copy, not to check. Everything you need is in this prompt and the docs above.

## 1. The thing, in observable terms

The game's rules exist as a headless sim before anything renders them: a run that advances only in fixed ticks, seeded streams that replay, a grave that moves and grows and shrinks and seals shut, and the swallow that pays for all of it.

Nothing on screen changes in this dispatch. That is deliberate, not a gap: the grave becomes visible and steerable in dispatch 3b, and every rule below is verified by test here so that 3b is wiring rather than rules.

When it works:

- A run advances in whole ticks of sixty per second, and a slow frame or a backgrounded tab cannot fire an unbounded burst of catch-up ticks.
- The same seed produces the same run, and a committed golden digest over a scripted scenario is what proves it across engines rather than within one.
- Two named streams from one seed never march in step.
- The grave crosses the field's width in about two seconds, grows on a swallow, shrinks on a hit, converts growth past its ceiling to score, and at its floor runs the damage ladder in order until it seals shut.
- Nothing under `src/game` can reach an implementation-approximated operation or `Math.random`, and lint says so rather than a comment asking nicely.

## 2. Verification steps, with actors

1. Every planned test in section 5 written and green. Actor: you.
2. `pnpm lint`, `pnpm typecheck`, and `pnpm build`, all clean. `vitest` alone is not enough: three dispatches have now shipped prettier errors that only `pnpm lint` sees. Actor: you.
3. The sim invariant harness runs on every step in every sim test, per ADR 0013. Not a test of its own: a helper every sim test steps through. Actor: you.
4. No rendered check in this dispatch, and that is deliberate rather than skipped: nothing player-visible changes. The rendered check returns in 3b when the grave is drawn. Say so in your report. Actor: nobody yet.
5. The on-device input check (tracer plan verification step 7) belongs to 3b, not here. Say so in your report. Actor: Mark, later.
6. Whether any tuning number feels right is a human call after playing. Never claim a number is right. Actor: Mark, at the dispatch-5 deploy.

## 3. The seams under test

- `step(state, command): SimEvent[]` and `createRun(seed?): RunState`, in `src/game/`. Both already exist as stubs; this dispatch fills them.
- `createClock()` and `ticksFor(clock, elapsedMs)`, in `src/game/clock.ts`.
- `stream(seed, name)` and the stream's `next()`, in `src/game/rng.ts`.
- `swallow(state, food): SimEvent[]`, in `src/game/swallow.ts`.
- The grave's public functions in `src/game/grave.ts`.
- `SimEvent` in `src/game/events.ts`.

Do not invent a seam. If the plan looks like it is missing one, stop and report rather than filling the gap.

## 4. Module boundaries

Everything below is under `src/game` and may import only from `src/game`. `src/boundary.test.ts` already enforces that and it is not yours to weaken, with the one stated exception in section 4.9.

### 4.1 `src/game/math.ts`, the rounding gate

Every implementation-approximated operation the sim uses, rounded to single precision (ADR 0015). Nothing else in `src/game` may call these on `Math` directly, and section 4.10's lint rule is what enforces it.

```ts
/** One number rounded to single precision. The gate every approximated result passes through. */
export function f32(value: number): number;

export function sin(radians: number): number;
export function cos(radians: number): number;
export function tan(radians: number): number;
export function atan2(y: number, x: number): number;
export function exp(value: number): number;
export function log(value: number): number;
export function pow(base: number, exponent: number): number;
export function hypot(x: number, y: number): number;

/**
 * A vector as a unit direction and its length, using only multiply, divide and
 * square root. All three are exactly specified by IEEE 754, so this rounds
 * nothing and needs no gate. ADR 0015 states the preference for vector math
 * over angle math and this is the primitive that makes it available.
 */
export function normalize(x: number, y: number): { x: number; y: number; length: number };
```

Each wrapper is `f32(Math.X(...))`. `f32` is `Math.fround`, which is exactly specified and therefore safe.

`normalize` at a zero vector returns `{ x: 0, y: 0, length: 0 }` rather than `NaN`. A zero move command is the resting state of both input models, so this is the common case and not an edge case.

**Do not add operations that do not need the gate.** `Math.sqrt`, `Math.abs`, `Math.min`, `Math.max`, `Math.floor`, `Math.ceil`, `Math.round` and `Math.sign` are all exactly specified and the sim calls them directly. Wrapping them would round correct answers and imply a hazard that is not there.

### 4.2 `src/game/rng.ts`, named seeded streams

Named streams from one run seed, independent by construction (tracer plan section 3). The trap this closes is the Slay the Spire correlated-randomness one named in spec #37: two systems drawing from one sequence make one system's draws predict the other's.

```ts
export type StreamName = "spawns" | "drops" | "mobFire" | "shed";

export interface Stream {
  /** The next draw, 0 inclusive to 1 exclusive. */
  next(): number;
  /** An integer in [0, bound), by rejection so the low bits are not favoured. */
  nextInt(bound: number): number;
}

/** One named stream for one run seed. The same seed and name always give the same sequence. */
export function stream(seed: number, name: StreamName): Stream;
```

Use **mulberry32** for the generator and **FNV-1a** to fold the name into the seed. Both are integer-only, using `Math.imul`, `>>>`, `^` and `+`, every one of which is exactly specified, so a stream cannot diverge between engines. Do not reach for a floating-point generator and do not take a dependency: each is under fifteen lines.

`StreamName` lists four names now and only `drops` and `spawns` have callers before dispatch 4. That is intentional: naming the streams up front is what makes them independent, and adding a name later reseeds nothing that already exists.

### 4.3 `src/game/clock.ts`, real time into fixed ticks

The accumulator that turns real elapsed time into fixed ticks, and its catch-up clamp (ADR 0015). It lives in `src/game` rather than in a screen so the autopilot and the rendered game share one implementation; otherwise the bot's run is not the player's run.

```ts
export const TICK_HZ = 60;
export const TICK_MS = 1000 / TICK_HZ;

/**
 * The clamp, in ticks. A quarter second of catch-up, the figure Gaffer on
 * Games' "Fix Your Timestep" uses for the same purpose. Past this the dropped
 * time becomes debt rather than a burst of ticks the player cannot answer.
 */
export const MAX_CATCHUP_TICKS = 15;

export interface Clock {
  /** Real time carried over that did not add up to a whole tick yet. */
  remainderMs: number;
  /** Ticks the clamp has discarded over this clock's life. The tick-debt readout in 3b shows this. */
  debtTicks: number;
}

export function createClock(): Clock;

/** Whole ticks to run for this frame's elapsed real time, clamped, with the discarded ticks recorded as debt. */
export function ticksFor(clock: Clock, elapsedMs: number): number;
```

The accumulator is fed wall-clock time, which differs on every device by nature, so **the accumulator itself is not deterministic and does not need to be**. What is deterministic is the sim, which only ever sees whole ticks. Say that in the module's JSDoc, or a later reader will try to make the wrong thing reproducible.

A negative, zero or non-finite `elapsedMs` yields zero ticks and leaves the remainder untouched. A browser reports all three across a tab switch.

### 4.4 `src/game/tuning.ts`, the numbers that are not one thing's own

A mob type owns its own stats and a weapon line owns its level curve, so those tables live in their own modules when they arrive. This file holds the rest.

**Every number here is a first pass owned by the tuning dispatch, section 6 item 7 of the tracer plan.** What this dispatch pins is not the magnitudes, it is the *derivations*, and the tests in section 5 assert the derivations rather than the values. That is deliberate: a test that pins 4.5 breaks on every retune and teaches nothing, while a test that pins "the grave crosses the field's width in about two seconds" is ADR 0003 and must never break.

```ts
/** Base speed in field units per tick. ADR 0003: crossing the field's width takes about two seconds. */
export const BASE_SPEED = FIELD_WIDTH / (2 * TICK_HZ);            // 4.5

/** ADR 0004: about ten seconds from kill to gone. */
export const FRESHNESS_SECONDS = 10;

/**
 * Scroll in field units per tick, derived from freshness rather than declared
 * beside it. ADR 0004 makes the coupling the invariant: a mid-field kill must
 * reach the bottom edge as a nearly empty scrap, so a scroll retune has to
 * retune the meter with it. Deriving one from the other is what makes that
 * true by construction instead of by two numbers that drift apart.
 */
export const SCROLL_SPEED = (FIELD_HEIGHT / 2) / (FRESHNESS_SECONDS * TICK_HZ);

/** ADR 0004: freshness scales every payout down to this floor, never to zero. */
export const FRESHNESS_PAYOUT_FLOOR = 0.25;

/** The grave is taller than wide (ADR 0003). Height over width. */
export const GRAVE_ASPECT = 2;

/** ADR 0003: the grave stands about a quarter of the field's width tall at its ceiling. */
export const SIZE_CEILING = FIELD_WIDTH / 8;                      // 67.5, a half-height

export const SIZE_START = 27;
export const SIZE_FLOOR = 18;
export const HIT_SHRINK = 3;

/** Post-hit invulnerability. See section 4.6 for why this number is a safety floor and not only feel. */
export const INVULNERABLE_TICKS = 60;

export const RESERVOIR_CAPACITY = 100;
```

`FIELD_WIDTH` and `FIELD_HEIGHT` are already declared in `src/app/layout.ts`, and `src/game` may not import `src/app`. **Declare them here as well, and add a test in `src/app/layout.test.ts` that the two agree.** Two declarations checked against each other is the honest answer to a boundary that forbids sharing; one declaration reaching across the boundary is not available and a silent divergence is what the test exists to catch.

The three hand-set numbers each carry a reason:

- `SIZE_FLOOR` is 18, so the grave is 18 units wide and 36 tall at its smallest. The resize plugin upscales a 390-wide phone window to a 540-wide stage, so a field unit is about a screen pixel on a phone, and a grave narrower than this stops reading as a grave shape on the device the floor matters most on.
- `SIZE_START` is 27, one and a half floors, so the first hit never puts a fresh run at the floor.
- `HIT_SHRINK` is 3, so three hits take a fresh run from its start to its floor. Three is the shmup convention for how much a player survives before the run is in trouble.

`GRAVE_ASPECT` is 2, which means the grave's width equals the size scalar exactly, since size is the half-height. Say that in a comment where the width is derived: it reads as a bug otherwise. Two to one is the shallowest ratio that still reads as clearly elongated rather than a rounded square at the floor's 18 units, and a real burial plot is about two and a half to one, so this is the readable end of the true range rather than an invention.

### 4.5 `src/game/lines/lines.ts`, weapon line identity

The four lines exist as identity and levels in this dispatch. Their behavior is dispatch 5, and this folder is created now so dispatch 5 has one place to fill.

```ts
export type WeaponLine = "soulStream" | "headstones" | "wisps" | "bell";
export const WEAPON_LINES: readonly WeaponLine[];
/** The lines a run starts with (glossary: birthright). The floor's ladder strips back to exactly these. */
export const BIRTHRIGHT: readonly WeaponLine[];   // soulStream, headstones
export const MAX_LEVEL = 5;
```

### 4.6 `src/game/grave.ts`, size is health

Owns the grave's size, its motion, and the consequence of mob fire meeting it. Hides ADR 0003 entirely: no other module knows what a hit costs.

```ts
export interface Grave {
  x: number;
  y: number;
  /** The one scalar: the half-height. Width follows at a fixed aspect. */
  size: number;
  /** Ticks of invulnerability left. Zero means a hit lands. */
  invulnerable: number;
}

export interface Rect { readonly x: number; readonly y: number; readonly width: number; readonly height: number }

export function createGrave(): Grave;

/** Width from the one scalar, at the fixed aspect (ADR 0003). */
export function graveWidth(size: number): number;

/** The grave's hitbox in field units. It shrinks with size, so a smaller grave is a harder target. */
export function graveHitbox(grave: Grave): Rect;

/** Applies a move command in base-speed units, then holds the grave inside the field (ADR 0011). */
export function moveGrave(grave: Grave, command: MoveCommand): void;

/** Grows the grave and returns whatever did not fit under the ceiling, as overflow (ADR 0003). */
export function growGrave(grave: Grave, amount: number): number;

/** One tick of the grave: invulnerability counts down. */
export function ageGrave(grave: Grave): void;
```

The hit is not here, because a hit at the floor spends score and weapon levels, which are the run's and not the grave's:

```ts
/** Mob fire meeting the grave. Ignored while invulnerable. Runs ADR 0003's floor ladder when the grave cannot shrink. */
export function hitGrave(state: RunState): SimEvent[];
```

**The floor ladder, in order, one rung per hit (ADR 0003).** A hit at the floor never shrinks, because the floor is hard:

1. If the run has score, bleed it and stop.
2. Otherwise, if any weapon line sits above the birthright loadout, strip one level and stop.
3. Otherwise the grave seals shut.

The ladder must be **finite**: from any state, a bounded number of hits at the floor ends in sealed shut. That is the property section 5 tests, and it is what makes ADR 0003's "the floor is never immortality and death is never abrupt" both true at once. How much score one rung bleeds is a tuning number and the test must not assert its magnitude.

**`INVULNERABLE_TICKS` is a safety floor as well as a feel number, and this is the one place it is written down.** ADR 0014's hit signal dims the whole field, and a full-field swing on this palette clears WCAG SC 2.3.1's ten percent relative luminance threshold, which makes it a flash under that criterion. SC 2.3.1 permits at most three flashes in any one second. Because a hit can only land when invulnerability has run out, the invulnerability window *is* the dim's refractory interval, and there is no second number to keep in sync. At 60 ticks it is one flash per second at worst. Section 5 asserts the floor of 20 ticks, one third of a second, which is where three per second would be reached. This closes the open item the tracer plan carried as "the dim needs a stated refractory interval".

### 4.7 `src/game/swallow.ts`, the one verb

Every payout in the game arrives through a swallow, and five ADRs meet here. It takes **values, never an entity reference**, for the reason `events.ts` already states: entities are pooled and mutated in place, so a held reference is a recycled slot by the time anything reads it. Dispatch 4 and 5 hand it corpses, feasts and drops; this dispatch tests it on values directly, which is what makes it specifiable a dispatch before its callers exist.

```ts
export type FoodKind = "corpse" | "drop" | "feast";

export interface Swallowable {
  readonly kind: FoodKind;
  /** 0 to 1. Treasure is always 1: drops and feasts never decay (ADR 0004). */
  readonly freshness: number;
  /** What this food pays before freshness scales it, in size units. */
  readonly payout: number;
  /** Which line a drop levels, decided by the dice at spawn (ADR 0002). Absent on corpses and feasts. */
  readonly line?: WeaponLine;
}

/** The grave passes under food and it falls in. The only way anything is ever paid (ADR 0002). */
export function swallow(state: RunState, food: Swallowable): SimEvent[];
```

What a swallow pays:

- **Growth**, the payout scaled by freshness down to `FRESHNESS_PAYOUT_FLOOR` and never to zero (ADR 0004). Growth past the ceiling converts to score as overflow (ADR 0003).
- **The reservoir**, charged by the same freshness-scaled amount. Charge past `RESERVOIR_CAPACITY` visibly splashes and is wasted, which is ADR 0008's documented cure for bomb hoarding, so the splash is an event and not a silent clamp.
- **A drop levels its line** (ADR 0002). A line already at `MAX_LEVEL` converts to overflow instead, so nothing swallowed is ever worthless.
- **The chime**, on every swallow from the very first, whatever the loadout (glossary: swallow chime).
- **A `swallowed` event** that the weapon lines subscribe to in dispatch 5. The lines do not exist yet and this dispatch does not fire them; emitting the event is how they will hook in without swallow.ts learning about them.

Size never gates a swallow (ADR 0003). There is no size check here at all, and if you find yourself writing one, that is the bug.

### 4.8 `src/game/run.ts`, `events.ts` and `step.ts`, filled in

`run.ts` gains the rest of the run state around the seed and tick it already holds: the grave, score, the reservoir, the weapon-line levels, the scroll distance, and the ending. The ending is `null` while the run is live, then `"sealed"` or `"victory"`. Victory has no producer until dispatch 4 stubs it, and that is correct: `run.ts` declares the shape and does not create it.

`events.ts` replaces its empty union with the members this dispatch produces. Keep its existing JSDoc rule that payloads carry values. The members: `swallowed`, `chimed`, `grew`, `overflowed`, `reservoirCharged`, `splashed`, `reservoirFull`, `weaponLeveled`, `graveHit`, `scoreBled`, `weaponStripped`, `sealed`. Give each a payload that serves a sound, a renderer and an instrument, because the tracer plan names all three as subscribers.

`step.ts` keeps its JSDoc and its shape and gains the tick order it currently only describes. What exists in this dispatch is: advance the scroll distance, apply the move command to the grave, age the grave's invulnerability, increment the tick. Spawns, motion, overlap, deaths, decay and culling arrive in dispatch 4. **Do not write empty functions as placeholders for them.** Name the full order in the JSDoc and implement the part that exists.

Delete the stub's `void command;` line and its comment. It says the command is ignored, and after this dispatch that is a comment about code that is no longer there.

### 4.9 `src/dev/invariants.ts`, and the one boundary change

ADR 0013 requires the sim invariants checked on **every step in every sim test**: in bounds, size within floor and ceiling, no NaN, entity caps. Entity caps have nothing to count yet and that rung is a `test.todo` naming dispatch 4 as its trigger.

```ts
/** Throws with the failing invariant named, on any state the rules must never produce (ADR 0013). */
export function checkInvariants(state: RunState): void;

/** step() with the invariants checked after it. Every sim test steps through this, never through step directly. */
export function stepChecked(state: RunState, command: MoveCommand): SimEvent[];
```

This lives in `src/dev` because it is the test rig and not the game; the tracer plan puts it there and shipping it inside `src/game` would make the rig load-bearing in the built app.

**That needs one change to `src/boundary.test.ts`, and it is the only weakening allowed anywhere in this dispatch.** Today `src/game` may reach only `src/game`, and that correctly forbids a sim test importing the rig. Add `dev` to `mayReach` **for test files under `game` only**, alongside the `TEST_PACKAGES` exception the file already makes for the same reason: a test file is not shipped, and the rule exists to keep the rig out of the build rather than out of the tests. Shipped code under `src/game` keeps reaching only `src/game`.

If you cannot make that change without also loosening shipped code, stop and report. Do not move `invariants.ts` into `src/game` to avoid the problem.

### 4.10 The lint rule, in `apps/hungry-grave/eslint.config.mjs`

ADR 0015 requires that the rest of the sim cannot reach around `math.ts`, and a comment asking nicely is not that. Add an override block for `src/game/**/*.ts`, excluding `src/game/math.ts` and `src/game/rng.ts`:

- `no-restricted-properties` on `Math.sin`, `Math.cos`, `Math.tan`, `Math.atan2`, `Math.exp`, `Math.log`, `Math.pow`, `Math.hypot` and `Math.random`, each with a message naming `math.ts` or `rng.ts` as the way through.
- `no-restricted-globals` or the equivalent on `Date` and `performance`. Wall clock inside the sim breaks determinism exactly as a raw transcendental does, and a run's length is counted in ticks (ADR 0015).
- `no-restricted-syntax` on `BinaryExpression[operator="**"]`. **`x ** y` is `Math.pow` under a different spelling and is approximated identically.** A rule that blocks only the named method leaves the operator wide open, which is the hole this bullet exists to close.

`rng.ts` is excluded from the `Math` restriction because `Math.imul` is exactly specified and is the generator's core operation; it is not excluded from the `Math.random` restriction, so state that separately rather than exempting the file wholesale.

Verify the rule actually fires. Write a line that should trip it, run `pnpm lint`, see it fail, then delete the line. A lint rule nobody has seen fail is a lint rule that does not work.

## 5. The planned test list

Pin every one of these as a named `test.todo` on a stub before you implement anything, per the playbook. Every test cites what it enforces in its name or a comment. Every test that steps the sim goes through `stepChecked`.

### `src/game/math.test.ts`

1. `f32` returns exactly `Math.fround` for a value that needs rounding, and leaves an exactly representable value alone.
2. Every wrapper returns a single-precision value: `f32(result) === result` for each of the eight, over a spread of inputs.
3. Each wrapper agrees with its `Math` counterpart to within single-precision tolerance, so the gate rounds rather than changes the answer.
4. `normalize(3, 4)` is exactly `{ x: 0.6, y: 0.8, length: 5 }`, unrounded, which is ADR 0015's claim that vector math needs no gate.
5. `normalize(0, 0)` is `{ x: 0, y: 0, length: 0 }` and never `NaN`, because a zero move command is the resting state of both input models.

### `src/game/rng.test.ts`

6. The same seed and name give an identical sequence over the first 64 draws (ADR 0012).
7. Every draw is in `[0, 1)`, over a long sequence and several seeds.
8. `nextInt(bound)` stays in `[0, bound)` and covers every value over enough draws.
9. **No two named streams from one seed emit an identical sequence**, checked over every pair of `StreamName` values across at least 100 seeds. This is spec #37's Slay the Spire correlated-randomness trap and it is the reason the streams are named at all.
10. Two different seeds give different sequences for the same name.
11. `createRun()` with no seed rolls a fresh seed: many calls produce more than one distinct value (ADR 0012).
12. `createRun(seed)` pins: the run's seed is exactly the one given.

### `src/game/clock.test.ts`

13. `ticksFor` emits whole ticks only, and carries the remainder: 25 ms yields 1 tick and leaves about 8.33 ms behind; a second call of 25 ms then yields 2.
14. Exactly `TICK_MS` yields exactly 1 tick and a zero remainder.
15. Catch-up is clamped: 5000 ms yields `MAX_CATCHUP_TICKS`, never 300 (ADR 0015).
16. The clamp records what it discarded as `debtTicks`, so 3b's readout has something to show and a struggling phone is not invisible behind a healthy frame rate.
17. Zero, negative and non-finite elapsed times yield zero ticks and leave the remainder untouched. A browser reports all three across a tab switch.
18. Two clocks fed the same elapsed sequence produce the same tick sequence, which is the bot and the screen sharing one implementation (ADR 0015).

### `src/game/tuning.test.ts`

These assert the **derivations**, never the magnitudes. A test here breaking means a design rule broke, not that a number was tuned.

19. `BASE_SPEED * TICK_HZ * 2` equals `FIELD_WIDTH`: base speed crosses the field's width in two seconds (ADR 0003).
20. A corpse spawned at mid-field reaches the bottom edge in exactly `FRESHNESS_SECONDS`, computed from `SCROLL_SPEED` alone. This is ADR 0004's coupling invariant and the reason `SCROLL_SPEED` is derived rather than declared.
21. `SIZE_CEILING * 2` equals a quarter of `FIELD_WIDTH`: the grave stands about a quarter of the field's width tall at its ceiling (ADR 0003).
22. `SIZE_FLOOR < SIZE_START < SIZE_CEILING`, so the recovery path and the growth path both exist.
23. `INVULNERABLE_TICKS >= TICK_HZ / 3`. The dim is a flash under WCAG SC 2.3.1, which permits at most three per second, and the invulnerability window is its refractory interval. Cite the criterion in the test.
24. `FRESHNESS_PAYOUT_FLOOR` is 0.25 (ADR 0004).
25. `FIELD_WIDTH` and `FIELD_HEIGHT` in `tuning.ts` equal the ones in `src/app/layout.ts`. **Write this one in `src/app/layout.test.ts`**, which may import both sides; a test in `src/game` may not.

### `src/game/grave.test.ts`

26. `graveWidth` derives width from the one scalar at the fixed aspect, and the grave is taller than wide at every size from floor to ceiling (ADR 0003).
27. `graveHitbox` shrinks with size, so a smaller grave is a harder target.
28. `moveGrave` at full command moves exactly `BASE_SPEED` units in one tick, and a diagonal command is not faster than a straight one.
29. `moveGrave` holds the grave inside the field at every edge, accounting for its own width and height, so no part of it leaves.
30. `growGrave` grows by the amount given, below the ceiling.
31. `growGrave` past the ceiling stops at the ceiling and returns the remainder as overflow, never exceeding it (ADR 0003).
32. A hit shrinks the grave and starts invulnerability (ADR 0003).
33. A hit while invulnerable does nothing at all: no shrink, no ladder, no event.
34. `ageGrave` counts invulnerability down and stops at zero, and a hit lands again on the tick it reaches zero.
35. A hit never takes the grave below the floor (ADR 0003).
36. **At the floor the ladder runs in order**: with score, the hit bleeds score and nothing else; with no score and a line above birthright, it strips one level and nothing else; with neither, it seals shut (ADR 0003).
37. **The ladder is finite from any state**: from a maxed run at the floor, a bounded sequence of hits ends in sealed shut. Assert the bound and the ending, never the score magnitude, which is tuning.
38. Stripping stops at the birthright loadout exactly: the birthright lines are never taken below level 1 and the others are never taken below 0 (glossary: birthright).
39. Size never leaves floor-to-ceiling across any sequence of grows and hits, which is the invariant `checkInvariants` also asserts on every step.

### `src/game/swallow.test.ts`

40. Every payout arrives through a swallow: score, growth and reservoir charge are unchanged by a tick with no swallow in it (ADR 0002).
41. Growth scales by freshness, and a fully fresh corpse pays its full payout.
42. Freshness scales down to `FRESHNESS_PAYOUT_FLOOR` and never below, so a nearly gone corpse still pays a quarter (ADR 0004).
43. A swallow at the size ceiling converts its whole growth to score as overflow (ADR 0003).
44. **A swallow is never gated by size**: a floor-sized grave and a ceiling-sized grave both swallow the same food, and the only difference is where the payout goes (ADR 0003).
45. The reservoir charges on a swallow.
46. Charge past `RESERVOIR_CAPACITY` clamps and emits the splash, so hoarding visibly wastes rather than silently clamping (ADR 0008).
47. A drop levels the line it carries, and it carries that line from the value it was given rather than rolling one here (ADR 0002).
48. A drop for a line already at `MAX_LEVEL` converts to overflow instead, so nothing swallowed is ever worthless (ADR 0002).
49. A drop's freshness is always 1 and it is never scaled: treasure never decays (ADR 0004). Assert it on the value the test passes, and add a `test.todo` naming dispatch 4 as where the spawner's side of that guarantee gets tested.
50. The chime fires on **every** swallow including the very first, whatever the loadout, so the early minutes are never silent (glossary: swallow chime).
51. A `swallowed` event carries the freshness, the kind and the payout, because the weapon lines, the sound and the freshness-at-swallow instrument all read it and none of them can hold the entity.

### `src/game/step.test.ts`

The file exists with the stub's tests; extend it.

52. One `step` advances the tick by exactly one.
53. `step` advances the scroll distance by `SCROLL_SPEED`.
54. `step` applies the move command to the grave, so steering reaches the sim through the seam and not around it.
55. `step` ages invulnerability by one tick.
56. A run advanced N ticks with a fixed command sequence lands in exactly the same state as another run with the same seed and the same sequence, in-engine (ADR 0012).

### `src/game/digest.test.ts`, the golden digest

57. **A golden digest over a short scripted scenario matches its committed snapshot.** Fixed seed, a fixed command script of a few hundred ticks, and a digest over the run state at the end: tick, seed, grave position and size, score, reservoir, scroll distance and weapon levels. Use a vitest snapshot so the documented regeneration command is `pnpm test -- -u` and no new tooling is needed.

    ADR 0015 explains why this test and not the obvious one: replaying one seed twice runs both replays in the same engine, so it passes with a raw `Math.sin` still sitting in the sim. The engine is the varying input and a same-engine test is structurally blind to it. This digest is committed from one engine and checked on every other one CI and a developer ever runs.

    Write into the test file, where someone about to run `-u` will read it: **the snapshot is never updated to make a failing test pass.** A change here is a deliberate tuning or rules change and the update is part of that change, with the reason in the commit message. Keep the scenario short and free of tuning-sensitive content, or the final tuning dispatch reddens it on every retune.

### `src/boundary.test.ts`

58. Shipped code under `src/game` still reaches only `src/game`, unchanged. The new `dev` allowance applies to test files alone, asserted by a case that a non-test file importing `src/dev` is still a violation.

### `src/dev/invariants.test.ts`

59. `checkInvariants` throws, naming the invariant, on a `NaN` coordinate, on a size below the floor, on a size above the ceiling, and on a grave outside the field.
60. `checkInvariants` passes on a fresh run and on a run stepped a few hundred ticks.
61. A `test.todo` for the entity-cap rung, naming dispatch 4 as its trigger, so the missing quarter of ADR 0013's invariant list is dated rather than silent.

## 6. How you work

- One vertical slice at a time: one test red, then the smallest implementation that makes it green, then the next. Never write the whole module and then the tests.
- Expected values come from the ADRs and this plan, not from running your own code and pasting the output. A test that asserts what the implementation already does is worth nothing.
- Small functions, each doing the one thing its name says. No IIFEs. Around forty lines is where splitting becomes the default.
- Comments: a JSDoc block on the declaration for anything that needs prose, `//` for a one-liner. Do not copy the comment style of whatever file you happen to be in. Never write a comment explaining code that is not there.
- No em dashes anywhere, in code, comments or your report. Comma, colon, parentheses, or two sentences.
- Use the vocabulary in `CONTEXT.md`. "Enemy" is banned; a hostile is a mob and its shots are mob fire. The grave swallows and passes under; it never drives.
- Never weaken, skip or rewrite a test to reach green. If you think a test is wrong, that means the plan is wrong, and replanning is not yours: stop and report.
- Three strikes on the same wrong observed behaviour, then stop and report what you tried, what you saw, and your best guess. No fourth attempt.
- Do not commit anything. Leave the work in the tree.

End your report with each verification step from section 2 and its result, and name steps 4, 5 and 6 as deliberately not run here and whose they are.
