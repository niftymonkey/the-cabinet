# Tracer dispatch 3a: the headless sim core

This is the plan half of the feature playbook's dispatch contract for tracer plan section 6 item 3, which Mark split in two on 2026-08-20: 3a is the headless sim, 3b is the app wiring that makes it playable and ends at his on-device input check. The split reason is on the tracer plan.

All three review gates ran on the first draft of this plan on 2026-08-20 and holed it in about thirty places. Markers are on #36: product vision `5361754391`, game design `5361767886`, tech architecture in the same thread. Everything they found is folded in below, so read this document rather than the markers.

You are writing production code in `/home/mlo/dev/niftymonkey/the-cabinet/apps/hungry-grave`.

Read `docs/agents/feature-playbook.md` at the repo root first and follow it. This prompt is the plan half of its dispatch contract; you execute.

Read these before you write anything: `apps/hungry-grave/docs/adr/0015-determinism-across-devices.md`, `apps/hungry-grave/docs/adr/0003-size-is-health.md`, `apps/hungry-grave/docs/adr/0004-one-freshness-meter.md`, `apps/hungry-grave/docs/adr/0002-hybrid-swallow-economy.md`, `apps/hungry-grave/docs/adr/0008-the-belch-full-only-the-bomb-everywhere.md`, `apps/hungry-grave/docs/adr/0011-each-input-owns-its-speed.md`, `apps/hungry-grave/docs/adr/0012-fresh-seed-per-run.md`, `apps/hungry-grave/docs/adr/0013-the-sim-verification-contract.md`, `apps/hungry-grave/docs/adr/0014-readability-layering.md`, `apps/hungry-grave/docs/design/tracer-plan.md` section 3 and section 5, and `apps/hungry-grave/CONTEXT.md` for the vocabulary.

**Never open `src/prototypes/` at all.** Not to read, not to copy, not to check. Everything you need is in this prompt and the docs above.

## 1. The thing, in observable terms

The game's rules exist as a headless sim before anything renders them: a run that advances only in fixed ticks, seeded streams that replay, a grave that moves and grows and shrinks and seals shut, and the swallow that pays for all of it.

Nothing on screen changes in this dispatch. That is deliberate, not a gap: the grave becomes visible and steerable in dispatch 3b, and every rule below is verified by test here so that 3b is wiring rather than rules.

When it works:

- A run advances in whole ticks of sixty per second, and a slow frame or a backgrounded tab cannot fire an unbounded burst of catch-up ticks, nor leave the accumulator holding time it refused to spend.
- The same seed produces the same run, and a committed golden digest over a scripted scenario is what proves it across engines rather than within one.
- Two named streams from one seed never march in step, and no pair of them is within a run's whole draw budget of each other.
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
- The field's dimensions in `src/game/field.ts`.

Do not invent a seam. If the plan looks like it is missing one, stop and report rather than filling the gap.

## 4. Module boundaries

Everything below is under `src/game` and may import only from `src/game`. `src/boundary.test.ts` already enforces that and it is not yours to weaken, with the one stated exception in section 4.10.

### 4.1 `src/game/math.ts`, the rounding gate

Every implementation-approximated operation the sim uses, rounded to single precision (ADR 0015). Nothing else in `src/game` may call these on `Math` directly, and section 4.11's lint rule is what enforces it.

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

**There is deliberately no `hypot` wrapper, and do not add one.** `Math.sqrt` became exactly specified in tc39/ecma262 PR #3345, merged 2024-08-17, so `Math.sqrt(x * x + y * y)` is fully deterministic while `Math.hypot` is implementation-approximated and would have to be gated and rounded. `Math.hypot` exists to avoid intermediate overflow, and in a 540 by 760 field there is no overflow range to protect. `normalize` already returns the length, which is what the sim actually wants. Say this in the module's JSDoc so the absence reads as a decision.

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
  /** How many draws this stream has made. The digest reads it, and 3b's replay resumes from it. */
  readonly drawn: number;
}

/** One named stream for one run seed. The same seed and name always give the same sequence. */
export function stream(seed: number, name: StreamName): Stream;
```

**Use `sfc32` for the generator, seeded through `xmur3`.** Both are integer-only, using `Math.imul`, `>>>`, `<<`, `^` and `+`, every one of which is exactly specified, so a stream cannot diverge between engines. Do not take a dependency: together they are under thirty lines.

**Do not reach for mulberry32, and this is the part to read twice.** mulberry32's state update is a fixed additive Weyl step over an odd constant, so every instance walks the same single 2^32 cycle and the seed only picks an entry point. Four named streams under it are four windows into one sequence, disjoint by arithmetic luck rather than by construction: the smallest pairwise gap on these four names is about 2.2e8 draws against a run's budget of roughly 1e4, which is comfortable until it is not. Slay the Spire 2 shipped exactly this seed-plus-name-hash design and correlated anyway, with real consequences: a card that became mathematically unobtainable, and potion drop rates swinging from 76 percent to 4 percent by act. mulberry32's own author withdrew his recommendation in 2022: it is not equidistributed, cannot produce about a third of all uint32 values, and fails PractRand at 32GB. sfc32 has 128 bits of state, so stream overlap stops being a number anyone has to compute, and PractRand lists it as recommended. **Do not substitute PCG either**: O'Neill concedes its streams are not statistically independent.

**Do not use FNV-1a to fold the name.** It fails SMHasher's avalanche test outright, and on these four actual stream names it differs in 7 of 32 bits where 16 is expected. `xmur3` is the standard companion to sfc32, produces the four 32-bit words sfc32's state needs, and passes avalanche.

**Fold the name into the seed with addition, never XOR.** With addition the pairwise offsets between streams are the same for every seed, so one test verifies them once and the property is real. With XOR the offsets vary per seed, the property becomes unverifiable, and a bad pairing turns into a heisenbug reachable on exactly one shared challenge URL.

`StreamName` lists four names now and only `drops` and `spawns` have callers before dispatch 4. That is intentional: naming the streams up front is what makes them independent, and adding a name later reseeds nothing that already exists. Test 9 is written so that adding a fifth name that collides fails loudly.

### 4.3 `src/game/clock.ts`, real time into fixed ticks

The accumulator that turns real elapsed time into fixed ticks, and its catch-up clamp (ADR 0015). It lives in `src/game` rather than in a screen so the autopilot and the rendered game share one implementation; otherwise the bot's run is not the player's run.

```ts
export const TICK_HZ = 60;
export const TICK_MS = 1000 / TICK_HZ;

/**
 * The catch-up clamp, in ticks. A quarter second, which is the figure Gaffer on
 * Games' "Fix Your Timestep" uses as a safety valve. Treat it as a valve rather
 * than a derived truth: the source states no reason for the figure and peers
 * disagree freely (Unity 0.3333, Pixi 0.1, Godot caps steps instead).
 * Math.round, not Math.floor: 1000 / 60 rounds up in binary64, so 250 / TICK_MS
 * is 14.999999999999998 and floor would silently give 14.
 */
export const MAX_CATCHUP_TICKS = Math.round(250 / TICK_MS);

export interface Clock {
  /** Real time carried over that did not add up to a whole tick yet. */
  remainderMs: number;
  /** Ticks the clamp has discarded over this clock's life. The tick-debt readout in 3b shows this. */
  debtTicks: number;
}

export function createClock(): Clock;

/** Whole ticks to run for this frame's elapsed real time, clamped on the way in, with the discarded ticks recorded as debt. */
export function ticksFor(clock: Clock, elapsedMs: number): number;

/** Drops the accumulated remainder and the frame gap a tab switch created, without touching debt. 3b calls this on visibilitychange. */
export function resetClock(clock: Clock): void;
```

**Clamp `elapsedMs` on the way IN, never the tick count on the way out.** Gaffer clamps the frame time before it enters the accumulator, so the dropped time never accumulates. Clamping the returned count instead leaves the accumulator holding time it refused to spend: a 5000 ms frame leaves about 4750 ms behind, every later frame then clamps at the maximum forever, and that is the spiral of death arrived at through the clamp. Clamping `elapsedMs` to `MAX_CATCHUP_TICKS * TICK_MS` on entry makes the drain structural and the bug unwritable. Record the discarded ticks as debt from the amount you clamped off.

**`ticksFor` takes raw elapsed real time and never Pixi's `deltaMS`.** State this in the module's JSDoc as a contract even though the caller arrives in 3b. Read from the installed pixi.js 8.19.0 `Ticker.mjs`: `elapsedMS` is assigned the raw gap, then a local copy is clamped to `_maxElapsedMS` of 100 and only `deltaMS` receives the clamped value. Feed `deltaMS` and this module's own clamp is unreachable, `debtTicks` reads zero forever, and any `speed` change silently rescales the sim.

**That leaves one seam this module must provide: `resetClock`.** Feeding raw `elapsedMS` means a tab switch dumps its entire gap into the debt counter, so one backgrounding reads as a struggling phone and 3b's tick-debt readout is a lie. Pixi ships no `visibilitychange` handling of its own; Phaser's answer to the same problem is a cooldown after a tab switch. Without the reset seam, either the debt readout or the clamp is dishonest. 3b owns calling it; 3a owns providing it and testing it.

The accumulator is fed wall-clock time, which differs on every device by nature, so **the accumulator itself is not deterministic and does not need to be**. What is deterministic is the sim, which only ever sees whole ticks. Say that in the module's JSDoc, or a later reader will try to make the wrong thing reproducible.

A negative, zero or non-finite `elapsedMs` yields zero ticks and leaves the remainder untouched. A browser reports all three across a tab switch.

### 4.4 `src/game/field.ts`, the field's dimensions

```ts
/** The fixed field the sim runs in, in field units. The renderer scales it; the sim never knows the viewport (ADR 0003). */
export const FIELD_WIDTH = 540;
export const FIELD_HEIGHT = 760;
```

These live here and **`src/app/layout.ts` imports them from here**, so there is one declaration and nothing to keep in sync. The boundary permits it: `BOUNDARIES` governs `game`, `input` and `dev` only, `src/app` is ungoverned, and `GameScreen.ts` and `runHandoff.ts` already import from `src/game` today. ADR 0003 settles the ownership question: the sim runs in the fixed field and the renderer scales it, so the field is the sim's.

Move the two declarations out of `layout.ts` and re-export nothing. Update every importer. There is no agreement test to write, because there is nothing to disagree.

They are in their own file rather than in `tuning.ts` because they are ADR 0003 and not tunable.

### 4.5 `src/game/tuning.ts`, the numbers that are not one thing's own

A mob type owns its own stats and a weapon line owns its level curve, so those tables live in their own modules when they arrive. This file holds the rest.

**Every number here is a first pass owned by the tuning dispatch, section 6 item 7 of the tracer plan.** What this dispatch pins is not the magnitudes, it is the *derivations*, and the tests in section 5 assert the derivations rather than the values. That is deliberate: a test that pins 4.5 breaks on every retune and teaches nothing, while a test that pins "the grave crosses the field's width in about two seconds" is ADR 0003 and must never break.

```ts
/** Base speed in field units per tick. ADR 0003: crossing the field's width takes about two seconds. */
export const BASE_SPEED = FIELD_WIDTH / (2 * TICK_HZ);            // 4.5

/**
 * Scroll in field units per tick. This is the run's root pace number: it is the
 * reaction-time budget for every threat on the field and it sets how long any
 * mob is on screen, so it is declared and everything downstream derives from it.
 * Stated per second and divided by the tick rate, because a per-tick magnitude
 * is unreadable and a per-second one is the number a human retunes.
 */
export const SCROLL_SPEED = 38 / TICK_HZ;                         // 0.6333, giving ten seconds exactly

/**
 * ADR 0004: about ten seconds from kill to gone, derived from scroll speed
 * rather than declared beside it. The ADR and the concept doc both state the
 * causality in this direction: "the seconds are derived from scroll speed, so a
 * scroll-speed retune retunes the meter with it." A mid-field kill must reach
 * the bottom edge as a nearly empty scrap, and deriving is what makes that true
 * by construction instead of by two numbers that drift apart.
 */
export const FRESHNESS_SECONDS = (FIELD_HEIGHT / 2) / (SCROLL_SPEED * TICK_HZ);

/** ADR 0004: freshness scales every payout down to this floor, never to zero. */
export const FRESHNESS_PAYOUT_FLOOR = 0.25;

/** The grave is taller than wide (ADR 0003). Height over width. */
export const GRAVE_ASPECT = 2;

/** ADR 0003: the grave stands about a quarter of the field's width tall at its ceiling. */
export const SIZE_CEILING = FIELD_WIDTH / 8;                      // 67.5, a half-height

export const SIZE_START = 27;
export const SIZE_FLOOR = 18;
export const HIT_SHRINK = 3;

/** Post-hit invulnerability. See section 4.7 for why this number is a safety floor as well as feel. */
export const INVULNERABLE_TICKS = 24;

/** How many fully fresh trash corpses grow a run from its start to its ceiling. The economy's one declared magnitude. */
export const CORPSES_TO_CEILING = 80;

/** The unit of food. Every mob's payout in dispatch 4 is stated as a multiple of this. */
export const TRASH_CORPSE_PAYOUT = (SIZE_CEILING - SIZE_START) / CORPSES_TO_CEILING;

/** Decision-log entry 5.11: the Banshee's feast pays growth worth 8 to 10 fresh trash corpses. */
export const FEAST_PAYOUT = 9 * TRASH_CORPSE_PAYOUT;

/**
 * Entry 5.11 again: the same swallow slams the reservoir full. Capacity is the
 * feast's payout exactly, so a fully fresh feast fills the reservoir and wastes
 * nothing, and the run's most choreographed beat is true by construction. A
 * flat 100 here would have made it arithmetically impossible, because a full
 * reservoir would then cost more cumulative growth than the entire floor-to-
 * ceiling range, and no test would have noticed.
 */
export const RESERVOIR_CAPACITY = FEAST_PAYOUT;
```

The hand-set numbers each carry a reason:

- `SIZE_FLOOR` is 18, so the grave is 18 units wide and 36 tall at its smallest. On a 390-wide phone the field scales to about 0.72 CSS pixels per field unit, which is the figure `layout.ts` already documents, so the floor grave is roughly 13 CSS pixels across. Narrower than this and it stops reading as a grave shape on the device the floor matters most on.
- `SIZE_START` is 27, one and a half floors, so the first hit never puts a fresh run at the floor.
- `HIT_SHRINK` is 3, so three hits take a fresh run from its start to its floor. Three is the shmup convention for how much a player survives before the run is in trouble.
- `INVULNERABLE_TICKS` is 24, which is 0.4 seconds: the top of the 0.2-to-0.4-second convention that Brotato and Hollow Knight sit inside. The window exists to stop one attack landing several times, not to let a player tank a curtain. A full second would probably make deliberately eating a hit the dominant way to cross the Wall, which collides with decision-log entry 12: the Wall must be crossable unloaded and never crossable for free.
- `CORPSES_TO_CEILING` is 80, a first pass and the only magnitude the food economy declares. Everything else in the economy hangs off it, so the tuning dispatch retunes food by moving this one number.

`GRAVE_ASPECT` is 2, which means the grave's width equals the size scalar exactly, since size is the half-height. Say that in a comment where the width is derived: it reads as a bug otherwise. A standard adult grave space is 42 by 96 inches, which is 2.29 to 1, so two is an actual plot dimension at the readable end of the true range rather than an invention, and it is the shallowest ratio that still reads as clearly elongated rather than a rounded square at the floor's 18 units.

### 4.6 `src/game/lines/roster.ts`, weapon line identity

The four lines exist as identity and levels in this dispatch. Their behavior is dispatch 5, and this folder is created now so dispatch 5 has one place to fill.

The file is `roster.ts` and not `lines.ts`: `lines/lines.ts` stutters beside the `lines/soulStream.ts` and friends that dispatch 5 adds.

```ts
export type WeaponLine = "soulStream" | "headstones" | "wisps" | "bell";
export const WEAPON_LINES: readonly WeaponLine[];
/** The lines a run starts with (glossary: birthright). The floor's ladder strips back to exactly these. */
export const BIRTHRIGHT: readonly WeaponLine[];   // soulStream, headstones
export const MAX_LEVEL = 5;
```

### 4.7 `src/game/grave.ts`, size is health

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

/** Applies a move command in base-speed units exactly as given, then holds the grave inside the field. */
export function moveGrave(grave: Grave, command: MoveCommand): void;

/** Grows the grave and returns whatever did not fit under the ceiling, as overflow (ADR 0003). */
export function growGrave(grave: Grave, amount: number): number;

/** One tick of the grave: invulnerability counts down. */
export function ageGrave(grave: Grave): void;
```

`grave.ts` imports `RunState` with **`import type`**. A runtime import closes a real cycle, because `run.ts` imports `createGrave`.

`Rect` is declared here for now and dispatch 4's `overlap.ts` will want to own it. Leave the move to dispatch 4 rather than creating a module with one type in it.

**`moveGrave` applies the command as given and does not normalize or cap it.** ADR 0011 puts normalization and the diagonal cap in each input model, and deliberately leaves touch uncapped, recording that capping touch to keyboard feel WAS the input lag felt on device. A cap here would silently undo that for touch. The diagonal assertion belongs to `keys.ts` in 3b and section 5 does not ask for it here.

The hit is not on the grave either, because a hit at the floor spends score and weapon levels, which are the run's and not the grave's:

```ts
/** Mob fire meeting the grave. Ignored while invulnerable. Runs ADR 0003's floor ladder when the grave cannot shrink. */
export function hitGrave(state: RunState): SimEvent[];
```

**`hitGrave` is the single entry point for every kind of damage.** Dispatch 4's mob contact damage (ADR 0016) routes through it rather than shrinking the grave itself, so the invulnerability window, the ladder and the events stay in one place. State that in its JSDoc.

**Every landed hit starts invulnerability, including a floor hit that does not shrink.** This is not a detail. Section 4.7's whole accessibility argument rests on the invulnerability window being the hit dim's refractory interval, and a floor hit that skipped the window would let the ladder run in consecutive ticks: sixty dims a second, in the exact state where the player is one hit from sealed shut.

**The floor ladder, in order, one rung per hit (ADR 0003).** A hit at the floor never shrinks, because the floor is hard:

1. If the run has score, bleed **all of it** and stop.
2. Otherwise, if any weapon line sits above the birthright loadout, **take one level off every line at once** and stop.
3. Otherwise the grave seals shut.

Rung 1 bleeds the whole score rather than a portion, so the score tier is exactly one rung. A proportional bleed never reaches zero and a fixed amount makes the ladder's length depend on a magnitude the tests are forbidden to know. Sonic is the precedent and it is on this side: the later games' partial ring loss reduced tension, because a large total trivialised the risk.

Rung 2 is Mark's ruling of 2026-08-20 and it replaces one-level-from-one-line. Taking a level off every line bounds the whole ladder at five rungs whatever the build, because `MAX_LEVEL` is 5, so a great run and a poor one die at the same length, and each rung visibly thins the entire storm in one beat. One-level-per-hit gave about eleven rungs on a good run, which is roughly thirteen seconds of low-agency dismantling that got *longer* the better the player had done: the slow-motion execution the shmup literature names. Stripping still stops at the birthright loadout exactly, so the birthright lines floor at level 1 and the others floor at 0.

The ladder must be **finite**: from any state, a bounded number of hits at the floor ends in sealed shut. From a maxed run holding score that bound is 7 hits, one for the score and five for the levels and one to seal. Assert the bound and the ending, never the score magnitude, which is tuning.

**`INVULNERABLE_TICKS` is a safety floor as well as a feel number, and this is the one place it is written down.**

ADR 0014's hit signal dims the whole field. Quote WCAG SC 2.3.1 in full in the code comment, both halves of its conjunction, because an abbreviated citation is the exact shape this project has been burned on twice: a general flash is a pair of opposing changes in relative luminance of 10 percent or more **where the darker image is below 0.80 relative luminance**. Both halves are trivially satisfied on this palette, so the dim is a flash under the criterion, and the criterion permits at most three flashes in any one second period.

Because a hit can only land when invulnerability has run out, the invulnerability window *is* the dim's refractory interval, and there is no second number to keep in sync. Two things follow that the first draft of this plan got wrong. The window must be **strictly greater** than a third of a second, not at least: at exactly 20 ticks the hits land at ticks 0, 20, 40 and 60, and 0 through 60 is one second, so that is four flashes. The general rule for the worst case is `floor(1 / period) + 1`, so the floor is 21 ticks at 60 Hz. And the small-area escape hatch cannot apply to a full-field dim, while SC 2.3.1 invokes Conformance Requirement 5 Non-Interference, so unlike SC 2.3.3 there is no "essential to functionality" carve-out: a game gets no exception here.

24 ticks clears that floor with room. The old 60 was not load-bearing for the accessibility argument and dropping to 24 costs nothing there.

This closes the open item ADR 0014 carries as "the dim needs a stated refractory interval". Section 4.11 has the record edit.

### 4.8 `src/game/swallow.ts`, the one verb

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

**`belch.ts` is not this dispatch and this file does not grow into it.** Tracer plan section 3 gives `belch.ts` the reservoir fill per swallow, the cap and the visible splash past full. The charge stays in `swallow.ts`, because the swallow is what charges it; `belch.ts` takes the firing and the eruption when dispatch 5 arrives, so that dispatch is purely additive. Say so in `swallow.ts`'s JSDoc so the split reads as a decision rather than an omission.

### 4.9 `src/game/run.ts`, `events.ts` and `step.ts`, filled in

`run.ts` gains the rest of the run state around the seed and tick it already holds: the grave, score, the reservoir, the weapon-line levels, the ending, and **the live streams**. The ending is `null` while the run is live, then `"sealed"` or `"victory"`. Victory has no producer until dispatch 4 stubs it, and that is correct: `run.ts` declares the shape and does not create it.

The streams are held on `RunState` rather than made on demand, and each exposes its `drawn` cursor. Nothing in 3a draws, so this dispatch cannot test the consequence, but the seam is pinned here for two reasons: without the cursor in the digest, a divergence in *how many* draws a tick made is invisible to the one test built to catch divergence, and 3b's `?seed=` replay cannot resume mid-run without it.

**Scroll distance is not stored.** It is `tick * SCROLL_SPEED` exactly, so derive it where it is read: one less field in the digest and one less thing that can drift out of step with the tick.

**The fresh-seed roll stays in `run.ts`** with a narrow documented lint exception, not moved to `src/app` to dodge the `Math.random` rule. ADR 0012 and `run.ts`'s own JSDoc both put the roll in the sim so that a run's identity is the sim's. Document the exception beside `clock.ts`'s "not deterministic and does not need to be" carve-out, in the same words, so the two read as one policy.

`events.ts` replaces its empty union with the members this dispatch produces. Keep its existing JSDoc rule that payloads carry values. The members: `swallowed`, `chimed`, `grew`, `overflowed`, `reservoirCharged`, `splashed`, `reservoirFull`, `weaponLeveled`, `graveHit`, `scoreBled`, `weaponStripped`, `sealed`. Give each a payload that serves a sound, a renderer and an instrument, because the tracer plan names all three as subscribers.

`scoreBled`, `weaponStripped` and `sealed` stay three separate events rather than one ladder event. At the size floor there is no shrink, so ADR 0014's rim channel is silent and these three are the only second channel left; keeping them separate also leaves the door open on a parked question (section 6).

`step.ts` keeps its JSDoc and its shape and gains the tick order it currently only describes. What exists in this dispatch is: apply the move command to the grave, age the grave's invulnerability, increment the tick. Spawns, motion, overlap, deaths, decay and culling arrive in dispatch 4. **Do not write empty functions as placeholders for them.** Name the full order in the JSDoc and implement the part that exists.

Delete the stub's `void command;` line and its comment. It says the command is ignored, and after this dispatch that is a comment about code that is no longer there.

### 4.10 `src/dev/invariants.ts`, and the one boundary change

ADR 0013 requires the sim invariants checked on **every step in every sim test**: in bounds, size within floor and ceiling, no NaN, entity caps. Entity caps have nothing to count yet and that rung is a `test.todo` naming dispatch 4 as its trigger.

```ts
/** Throws with the failing invariant named, on any state the rules must never produce (ADR 0013). */
export function checkInvariants(state: RunState): void;

/** step() with the invariants checked after it. Every sim test steps through this, never through step directly. */
export function stepChecked(state: RunState, command: MoveCommand): SimEvent[];
```

This lives in `src/dev` because it is the test rig and not the game; the tracer plan puts it there and shipping it inside `src/game` would make the rig load-bearing in the built app.

**That needs one change to `src/boundary.test.ts`, and it is the only weakening allowed anywhere in this dispatch.** Today `src/game` may reach only `src/game`, and that correctly forbids a sim test importing the rig. Add `dev` to `mayReach` **for test files under `game` only**, alongside the `TEST_PACKAGES` exception the file already makes for the same reason: a test file is not shipped, and the rule exists to keep the rig out of the build rather than out of the tests. Shipped code under `src/game` keeps reaching only `src/game`.

**That change needs a small refactor named here so it does not turn into a surprise fixture file.** `violationsIn(file, boundary)` reads the file from disk, so there is nothing to hand it for test 65's "a non-test file importing `src/dev` is still a violation" case. Split it: a pure inner function taking source text and a display path and returning the violations, with `violationsIn` reading the file and delegating. Test 65 calls the inner one.

If you cannot make the boundary change without also loosening shipped code, stop and report. Do not move `invariants.ts` into `src/game` to avoid the problem.

### 4.11 The lint rule, in `apps/hungry-grave/eslint.config.mjs`

ADR 0015 requires that the rest of the sim cannot reach around `math.ts`, and a comment asking nicely is not that. Add an override block for `src/game/**/*.ts`, excluding `src/game/math.ts` and `src/game/rng.ts`:

- `no-restricted-properties` on **all 22 of ECMA-262's implementation-approximated functions**, plus `Math.random`. The approximated set is `acos`, `acosh`, `asin`, `asinh`, `atan`, `atanh`, `atan2`, `cbrt`, `cos`, `cosh`, `exp`, `expm1`, `hypot`, `log`, `log1p`, `log10`, `log2`, `pow`, `sin`, `sinh`, `sqrt`, `tan` and `tanh`, minus `sqrt`, which tc39/ecma262 PR #3345 made exactly specified. Restrict the whole set even though `math.ts` wraps only seven of them. Blocking a name that has no wrapper yet is the feature, not an oversight: `asin`, `acos` and one-argument `atan` are exactly what dispatch 4's seeker turn and dispatch 5's wisp homing will reach for, and the block forces that conversation instead of letting an unrounded call through. The prior tech gate's finding on the tracer plan was to widen to the whole set, and naming only the wrapped ones would be quietly dropping it. Each message names `math.ts` or `rng.ts` as the way through.
- `no-restricted-globals` or the equivalent on `Date` and `performance`. Wall clock inside the sim breaks determinism exactly as a raw transcendental does, and a run's length is counted in ticks (ADR 0015).
- `no-restricted-syntax` on `BinaryExpression[operator="**"]`. **`x ** y` really is `Math.pow`**: both evaluate the spec's `Number::exponentiate`, so the operator is approximated identically. This is not theoretical. V8 shipped a real divergence between the two spellings, v8 issue 5848, where the same inputs gave different results depending on which one you wrote. Cite the bug in the message, not just the spec, because the bug is what makes the rule obviously necessary.

`rng.ts` is excluded from the `Math` restriction because `Math.imul` is exactly specified and is the generator's core operation; it is not excluded from the `Math.random` restriction, so state that separately rather than exempting the file wholesale. `run.ts` gets the one narrow documented `Math.random` exception from section 4.9.

Verify the rule actually fires. Write a line that should trip it, run `pnpm lint`, see it fail, then delete the line. A lint rule nobody has seen fail is a lint rule that does not work.

### 4.12 Three record edits, in this dispatch

1. **`docs/design/tracer-plan.md` verification step 3** still says flatly "Nothing under `src/game` imports `src/dev`". After section 4.10 that disagrees with the boundary test. Add the test-file qualification.
2. **`docs/adr/0014-readability-layering.md`** still reads "the dim needs a stated refractory interval" as open, which section 4.7 closes. Close it there, citing `INVULNERABLE_TICKS`, and add that at the size floor a hit does not shrink, so the rim channel is silent and the ladder events (`scoreBled`, `weaponStripped`, `sealed`) are the only second channel left.
3. **`docs/adr/0015-determinism-across-devices.md`** gains one paragraph naming the escape hatch before anyone needs it: `math.ts` is where an integer-indexed sine table could later replace the trig wrappers and make that trig deterministic by construction. `Math.fround` does not shrink a divergence, it changes its shape, and if two engines straddle an f32 bucket midpoint a 1-ulp f64 difference becomes a 1-ulp f32 one, roughly 2^29 times larger. The ADR already states the honest limit, so this names the way out rather than contradicting it.

## 5. The planned test list

Pin every one of these as a named `test.todo` on a stub before you implement anything, per the playbook. Every test cites what it enforces in its name or a comment. Every test that steps the sim goes through `stepChecked`.

### `src/game/math.test.ts`

1. `f32` returns exactly `Math.fround` for a value that needs rounding, and leaves an exactly representable value alone.
2. Every wrapper returns a single-precision value: `f32(result) === result` for each of the seven, over a spread of inputs.
3. Each wrapper agrees with its `Math` counterpart to within single-precision tolerance, so the gate rounds rather than changes the answer.
4. `normalize(3, 4)` is exactly `{ x: 0.6, y: 0.8, length: 5 }`, unrounded, which is ADR 0015's claim that vector math needs no gate.
5. `normalize(0, 0)` is `{ x: 0, y: 0, length: 0 }` and never `NaN`, because a zero move command is the resting state of both input models.

### `src/game/rng.test.ts`

6. The same seed and name give an identical sequence over the first 64 draws (ADR 0012).
7. Every draw is in `[0, 1)`, over a long sequence and several seeds.
8. `nextInt(bound)` stays in `[0, bound)` and covers every value over enough draws.
9. **No two named streams from one seed are within a run's whole draw budget of each other.** For every pair of `StreamName` values, find the minimum offset at which one stream's sequence matches the other's and assert it exceeds a run's budget by a wide margin. Do not compare the two sequences from draw 0: that version passes even when two streams are offset by three draws, which is the actual failure mode. Because section 4.2 folds the name in by addition, the offsets are the same for every seed, so this is checkable once and stays true. This is spec #37's Slay the Spire correlated-randomness trap, and it is written this way so that adding a fifth colliding stream name fails loudly.
10. Two different seeds give different sequences for the same name.
11. `drawn` counts the draws a stream has made, so the digest and 3b's replay can read the cursor.
12. `createRun()` with no seed rolls a fresh seed: many calls produce more than one distinct value (ADR 0012).
13. `createRun(seed)` pins: the run's seed is exactly the one given.

### `src/game/clock.test.ts`

14. `ticksFor` emits whole ticks only, and carries the remainder: 25 ms yields 1 tick and leaves about 8.33 ms behind; a second call of 25 ms then yields 2.
15. Exactly `TICK_MS` yields exactly 1 tick and a zero remainder.
16. Catch-up is clamped: 5000 ms yields `MAX_CATCHUP_TICKS`, never 300 (ADR 0015).
17. The clamp records what it discarded as `debtTicks`, so 3b's readout has something to show and a struggling phone is not invisible behind a healthy frame rate.
18. **After a clamped frame, a normal frame yields a normal tick count.** This is the spiral-of-death test: clamping the tick count instead of the elapsed time leaves the accumulator saturated and every later frame clamps forever, and tests 16 and 17 both pass in that state. Feed 5000 ms, then 16.7 ms, and assert 1 tick.
19. `resetClock` clears the remainder and does not touch `debtTicks`, which is what lets 3b answer `visibilitychange` without a tab switch reading as a struggling phone.
20. Zero, negative and non-finite elapsed times yield zero ticks and leave the remainder untouched. A browser reports all three across a tab switch.
21. Two clocks fed the same elapsed sequence produce the same tick sequence, which is the bot and the screen sharing one implementation (ADR 0015).

### `src/game/tuning.test.ts`

These assert the **derivations**, never the magnitudes. A test here breaking means a design rule broke, not that a number was tuned.

22. `BASE_SPEED * TICK_HZ * 2` equals `FIELD_WIDTH`: base speed crosses the field's width in two seconds (ADR 0003).
23. A corpse spawned at mid-field reaches the bottom edge in exactly `FRESHNESS_SECONDS`, computed from `SCROLL_SPEED` alone. This is ADR 0004's coupling invariant, and it holds in both directions, so it is the reason `FRESHNESS_SECONDS` is derived from the declared scroll speed rather than the other way round.
24. `SIZE_CEILING * 2` equals a quarter of `FIELD_WIDTH`: the grave stands about a quarter of the field's width tall at its ceiling (ADR 0003).
25. `SIZE_FLOOR < SIZE_START < SIZE_CEILING`, so the recovery path and the growth path both exist.
26. `INVULNERABLE_TICKS > TICK_HZ / 3`, strictly greater. WCAG SC 2.3.1 permits at most three flashes in any one second period, and the worst case for a period of `p` seconds is `floor(1 / p) + 1`, so at exactly 20 ticks four flashes fit inside one second. The invulnerability window is the dim's refractory interval. Quote the criterion in the test.
27. `FRESHNESS_PAYOUT_FLOOR` is 0.25 (ADR 0004).
28. `RESERVOIR_CAPACITY` equals nine fully fresh trash corpses' payout, which is decision-log entry 5.11's feast, so the Banshee beat is arithmetically reachable.

### `src/game/grave.test.ts`

29. `graveWidth` derives width from the one scalar at the fixed aspect, and the grave is taller than wide at every size from floor to ceiling (ADR 0003).
30. `graveHitbox` shrinks with size, so a smaller grave is a harder target.
31. `moveGrave` at full command moves exactly `BASE_SPEED` units in one tick, and applies a diagonal command exactly as given without normalizing it. ADR 0011 puts the cap in each input model and leaves touch deliberately uncapped; 3b asserts the keyboard cap in `keys.ts`.
32. `moveGrave` holds the grave inside the field at every edge, accounting for its own width and height, so no part of it leaves.
33. `growGrave` grows by the amount given, below the ceiling.
34. `growGrave` past the ceiling stops at the ceiling and returns the remainder as overflow, never exceeding it (ADR 0003).
35. A hit above the floor shrinks the grave and starts invulnerability (ADR 0003).
36. **A hit at the floor starts invulnerability too**, even though it does not shrink. Without this the ladder can run in consecutive ticks, which is sixty full-field dims a second and a flat SC 2.3.1 failure, in the one state where the player is a hit from sealed shut.
37. A hit while invulnerable does nothing at all: no shrink, no ladder, no event.
38. `ageGrave` counts invulnerability down and stops at zero, and a hit lands again on the tick it reaches zero.
39. A hit never takes the grave below the floor (ADR 0003).
40. **At the floor the ladder runs in order, one rung per hit**: with score, the hit bleeds all of the score and no weapon level is touched; with no score and a line above birthright, it takes one level off every line and seals nothing; with neither, it seals shut (ADR 0003). "Nothing else" here constrains **which rung runs**, not what else the hit does: the hit still starts invulnerability and still emits `graveHit`.
41. **The ladder is finite from any state**: from a maxed run at the floor holding score, at most 7 hits end in sealed shut, one for the score, five for the levels and one to seal. Age the grave past `INVULNERABLE_TICKS` between hits, or the later hits are all ignored. Assert the bound and the ending, never the score magnitude, which is tuning.
42. Stripping stops at the birthright loadout exactly: the birthright lines are never taken below level 1 and the others are never taken below 0 (glossary: birthright).
43. Size never leaves floor-to-ceiling across any sequence of grows and hits, which is the invariant `checkInvariants` also asserts on every step.

### `src/game/swallow.test.ts`

44. Every payout arrives through a swallow: score, growth and reservoir charge are unchanged by a tick with no swallow in it (ADR 0002).
45. Growth scales by freshness, and a fully fresh corpse pays its full payout.
46. Freshness scales down to `FRESHNESS_PAYOUT_FLOOR` and never below, so a nearly gone corpse still pays a quarter (ADR 0004).
47. A swallow at the size ceiling converts its whole growth to score as overflow (ADR 0003).
48. **A swallow is never gated by size**: a floor-sized grave and a ceiling-sized grave both swallow the same food, and the only difference is where the payout goes (ADR 0003).
49. The reservoir charges on a swallow.
50. Charge past `RESERVOIR_CAPACITY` clamps and emits the splash, so hoarding visibly wastes rather than silently clamping (ADR 0008).
51. A drop levels the line it carries, and it carries that line from the value it was given rather than rolling one here (ADR 0002).
52. A drop for a line already at `MAX_LEVEL` converts to overflow instead, so nothing swallowed is ever worthless (ADR 0002).
53. A drop's freshness is always 1 and it is never scaled: treasure never decays (ADR 0004). Assert it on the value the test passes, and add a `test.todo` naming dispatch 4 as where the spawner's side of that guarantee gets tested.
54. The chime fires on **every** swallow including the very first, whatever the loadout, so the early minutes are never silent (glossary: swallow chime).
55. A `swallowed` event carries the freshness, the kind and the payout, because the weapon lines, the sound and the freshness-at-swallow instrument all read it and none of them can hold the entity.

The feast is the only food that can cross the size ceiling and the reservoir cap in the same swallow, and its ordering is fully specifiable on plain values now, a dispatch before dispatch 6 makes it a beat:

56. **A fully fresh feast at an empty reservoir fills it exactly and splashes nothing**, which is decision-log entry 5.11's instant full belch and the reason `RESERVOIR_CAPACITY` is derived from the feast's payout.
57. A feast swallowed at a partly charged reservoir emits `reservoirFull` and `splashed`, and the events are in a stated order, so a sound and a renderer reading them in dispatch 6 are not reading an accident.
58. A feast at the size ceiling with a partly charged reservoir overflows growth to score **and** splashes charge in the same swallow, and neither cancels the other.

### `src/game/step.test.ts`

The file exists with the stub's tests; extend it.

59. One `step` advances the tick by exactly one.
60. Scroll distance derives from the tick, so after N steps it is exactly `N * SCROLL_SPEED` and there is no stored field to drift.
61. `step` applies the move command to the grave, so steering reaches the sim through the seam and not around it.
62. `step` ages invulnerability by one tick.
63. A run advanced N ticks with a fixed command sequence lands in exactly the same state as another run with the same seed and the same sequence, in-engine (ADR 0012).

### `src/game/digest.test.ts`, the golden digest

64. **A golden digest over a short scripted scenario matches a committed constant.** Fixed seed, a fixed command script of a few hundred ticks, and a digest over the run state at the end: tick, seed, grave position and size, score, reservoir, each stream's `drawn` cursor, and weapon levels.

Three things about how this is written, and none of them are optional.

**Not a vitest snapshot. A plain exported constant compared with `toEqual`.** `-u` maps to update mode `all` and rewrites every changed snapshot in the run, so a future unrelated `-u` for a renderer snapshot would silently rewrite the determinism digest. `CI=true` does not save it, because a truthy `update` skips the CI branch entirely, and `toMatchFileSnapshot` is writable by `--update` too. A prose warning is not a defense: that is the "comment asking nicely" that section 4.11 rejects one page earlier for the lint rule, and the argument applies with the same force here. This is the Go golden-file shape. Keep the readable object form rather than a hash, so a diff names the field that diverged.

**Regeneration is a human paste, and the documented command is `pnpm digest`.** Add `"digest": "vitest run src/game/digest.test.ts"` to `package.json`. When the comparison fails, the test logs the regenerated object as a paste-ready literal before it asserts. Do **not** document `pnpm test -- -u`: verified in this repo, pnpm 10 forwards the bare `--` through and vitest routes everything past it into a bucket it never reads, so `pnpm test -- --zzbogus` runs the whole suite and exits zero while `pnpm test --zzbogus` errors. A regeneration command that silently does nothing is worse than none.

**Two blindness notes, written into the test file where the next reader will find them.** Nothing on 3a's digest path calls `math.ts` at all, because the grave moves linearly and the scroll is linear, so a green digest in this dispatch is not determinism verified and later dispatches must extend the scenario as they add approximated operations. And `moveGrave` clamps to the field edges, so a script holding full-right pins `x` to the wall exactly and erases any divergence in it: keep the script off the walls, and accumulate a per-tick checksum alongside the end state so a divergence that later re-converges still shows.

ADR 0015 explains why this test and not the obvious one: replaying one seed twice runs both replays in the same engine, so it passes with a raw `Math.sin` still sitting in the sim. The engine is the varying input and a same-engine test is structurally blind to it. This digest is committed from one engine and checked on every other one CI and a developer ever runs. Write into the test file, where someone about to regenerate will read it: **the constant is never updated to make a failing test pass.** A change here is a deliberate tuning or rules change and the update is part of that change, with the reason in the commit message. Keep the scenario short and free of tuning-sensitive content, or the final tuning dispatch reddens it on every retune.

### `src/boundary.test.ts`

65. Shipped code under `src/game` still reaches only `src/game`, unchanged. The new `dev` allowance applies to test files alone, asserted by a case that a non-test file importing `src/dev` is still a violation, through the pure inner function section 4.10 asks you to split out.

### `src/dev/invariants.test.ts`

66. `checkInvariants` throws, naming the invariant, on a `NaN` coordinate, on a size below the floor, on a size above the ceiling, and on a grave outside the field.
67. `checkInvariants` passes on a fresh run and on a run stepped a few hundred ticks.
68. A `test.todo` for the entity-cap rung, naming dispatch 4 as its trigger, so the missing quarter of ADR 0013's invariant list is dated rather than silent.

## 6. Carried forward, not this dispatch

Do not act on these. They are here so the next planner does not rediscover them.

- **Dispatch 4's hit-taking bot policy must start from a grown grave.** Size-as-health stops reading as a health bar above roughly size 40, because a hit at the ceiling moves the half-height by 4.4 percent. Katamari's answer to making scale perceptible is camera zoom against fixed references and ADR 0003 deliberately has no zoom tiers, so the sprite against a fixed field carries it alone and ADR 0014's second channel does the work up there. A bot that starts fresh measures the three-hit opening and reports on a regime the player spends twenty seconds in.
- **`GRAVE_ASPECT` silently sets the Undertaker's difficulty.** His curtain gap is grave width plus a margin, and aspect 2 gives the narrowest width for a given size, so a shallower aspect would mean a wider required gap and an easier boss. Nothing in the tuning file says so, and the boss dispatch should know.
- **The bled score does not scatter as swallowable scraps.** Parked by Mark on 2026-08-20, not refused. The trigger to revisit is the #31 playtest's spiral-versus-comeback read, which is the instrument built to answer exactly the question the scraps answer. Do not re-raise before then. `scoreBled`, `weaponStripped` and `sealed` staying separate events is what leaves the door open.
- **Dispatch 3b carries a dev route that prints the digest in the browser**, named there rather than treated as a nice-to-have.

## 7. How you work

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
