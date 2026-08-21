# Tracer dispatch 3b: making it playable

This is the plan half of the feature playbook's dispatch contract for tracer plan section 6 item 3, which Mark split in two on 2026-08-20: 3a was the headless sim, and 3b is the app wiring that makes it playable and ends at his on-device input check. The split reason is on the tracer plan.

3a landed the rules and verified them by test. Nothing here is a new rule. Everything here is wiring, one renderer, two input models, and the first thing a player can actually do.

Three review gates ran on the first draft of this plan and all three returned findings. Their results are folded in below and every changed decision carries its reason inline, so this document is the whole plan and no separate findings file needs reading.

You are writing production code in `/home/mlo/dev/niftymonkey/the-cabinet/apps/hungry-grave`.

Read `docs/agents/feature-playbook.md` at the repo root first and follow it. This prompt is the plan half of its dispatch contract; you execute.

Read these before you write anything: `apps/hungry-grave/docs/adr/0011-each-input-owns-its-speed.md`, `apps/hungry-grave/docs/adr/0012-fresh-seed-per-run.md`, `apps/hungry-grave/docs/adr/0003-size-is-health.md`, `apps/hungry-grave/docs/adr/0009-creation-web-template-base.md`, `apps/hungry-grave/docs/adr/0014-readability-layering.md`, `apps/hungry-grave/docs/adr/0015-determinism-across-devices.md`, `apps/hungry-grave/docs/design/tracer-plan.md` section 3 and section 5, `apps/hungry-grave/docs/design/dispatch-3a-sim-core.md` sections 4 and 6, and `apps/hungry-grave/CONTEXT.md` for the vocabulary.

**Never open `src/prototypes/` at all.** Not to read, not to copy, not to check. Everything you need is in this prompt and the docs above.

## 1. The thing, in observable terms

The grave becomes a thing on screen that a person steers, on a keyboard and on a phone, running on the fixed clock 3a built.

When it works:

- A grave is drawn in the field, at the size the sim says, and it moves where the player steers it.
- Nothing else is drawn inside the field. Every readout and every control sits in the stage gutter, outside the field rectangle, at the viewports this dispatch is read on. That invariant has a condition on it: the gutter shrinks as the viewport's aspect approaches the field's own 540 by 760, and on an iPad in portrait at 820 by 1180 it is 13 CSS pixels, so the readout stack and the pause button do sit over the top of the field there. Harmless on an empty field and wrong from dispatch 4, when mob fire comes down that lane. Section 9 carries it.
- The sim advances on `clock.ts` and not on the frame, so a 144 Hz display and a 60 Hz display play the same game.
- Keyboard steering is normalized, so a diagonal is not faster than a cardinal, and holding the focus key halves the speed for fine dodging.
- Touch steering is a relative drag that lands the grave on the drag target every tick and is deliberately uncapped, and it never banks travel the grave could not take.
- Lifting the steering finger while a second finger is down never leaves a stale drag target, and neither does a gesture the operating system takes away.
- Escape or the pause button opens a pause menu that holds Resume, Settings and End Run. The run cannot be ended by accident from the field.
- `?seed=` pins the run in either URL form, `?size=` pins the grave's starting size, and a run without either rolls fresh dice and starts at `SIZE_START`.
- A tick-debt readout sits under the frame-rate readout, and backgrounding the tab does not make it lie.
- A dev route prints the golden digest in the browser, so ADR 0015's cross-engine claim can be checked on a phone rather than assumed until dispatch 7.
- The build is deployed and Mark has steered the grave on his own device.

## 2. Verification steps, with actors

1. Every planned test in section 5 written and green. Actor: you.
2. `pnpm lint`, `pnpm typecheck`, and `pnpm build`, all clean. `vitest` alone is not enough: three dispatches have now shipped prettier errors that only `pnpm lint` sees. Actor: you.
3. The sim invariant harness runs on every step in every sim test, per ADR 0013. Unchanged from 3a and not yours to weaken. Actor: you.
4. A rendered check of the built app via `vite preview`, screenshots actually read: the grave is visible in the field, the field itself holds nothing but the grave, the readout stack in the corner is visible, the pause button is visible and opens the menu, the menu's Settings shows the keyboard speed slider, the grave moves under arrow keys, the digest route at `#/digest` prints a digest and its verdict, and the prototype list at `#/prototypes` is intact. Also screenshot `?size=18` and read the grave's mouth, because the rim at the size floor is the geometry most likely to be wrong and the start size cannot show it. Actor: you.

   This step is an addition to the tracer plan's list, which runs the rendered check at dispatches 1, 2, 6 and 7 and not here. It is added because 3b draws the first player-visible field content since dispatch 2, and a grave that never appears would otherwise be caught first by Mark on his phone. Say in your report that you added it and why.

5. Deploy to production, following `apps/hungry-grave/docs/deploy.md` exactly. Do not re-derive the recipe and do not reach for `-e` flags. Actor: you, **after** Mark says yes. Stop and ask.
6. The on-device input check, tracer plan verification step 7: steering the grave around an otherwise empty field from the deployed URL, using the read-list in section 8. Also opening `#/digest` on the same phone and reading the verdict, which is the only browser engine outside CI's Node that this dispatch can reach. The playbook makes this escalation mandatory for input-feel changes. Actor: Mark.
7. Whether any tuning number feels right is a human call after playing. Never claim a number is right. Actor: Mark.

## 3. The seams under test

- `KeySteer` in `src/input/keys.ts`: `press(code)`, `release(code)`, `releaseAll()`, `setMultiplier(value)`, `command()`.
- `TouchSteer` in `src/input/touch.ts`: `down(id, point, grave)`, `move(id, point)`, `up(id)`, `cancelAll()`, `isSteering()`, `command(grave)`, `takeBelch()`.
- `combineSteer(keyCommand, touch, grave)` in `src/input/steering.ts`.
- `advance(run, clock, elapsedMs, steer)` in `src/game/advance.ts`.
- `seedFromUrl(search, hash)` and `sizeFromUrl(search, hash)` in `src/app/seedFromUrl.ts`.
- `resolveRoute(hash)` in `src/app/routes.ts`, gaining one route.
- `runScenario()` and `GOLDEN` in `src/dev/digest.ts`, moved out of the test.
- `meterLinePosition(index)` in `src/app/FpsMeter.ts`.
- `GraveRenderer` in `src/app/screens/game/GraveRenderer.ts`: `attach(layers)`, `sync(grave)`, `detach()`.

Do not invent a seam. If the plan looks like it is missing one, stop and report rather than filling the gap.

## 4. Module boundaries

`src/boundary.test.ts` already governs this and it is not yours to weaken. The rules that bite in this dispatch:

- `src/input` may import from `src/input` and `src/game`, and no bare packages at all. **No pixi in `src/input`.** Both input models are pure: they take points already in field units and return a move command. The pixi event wiring lives in `src/app/screens/game/GameScreen.ts` and converts through `screenToField`, which is exactly what `layout.ts`'s own JSDoc says this seam exists for.
- `src/dev` may import from `src/dev` and `src/game`, and no bare packages. The digest module you move there stays pixi-free, which is what lets a screen in `src/app` and a test in `src/game` both use it.
- `src/app` is unconstrained by the boundary test and is the only place pixi lives.

`src/app/palette.test.ts` runs a source scan over `src/app/screens/game`, `src/app/FpsMeter.ts` and `src/main.ts`. Anything you add under `src/app/screens/game` may not reach a `MENU` colour, may not write a colour literal, and may not set `blendMode`. The grave renderer lands inside that scan, so every colour it draws comes from `PALETTE`.

### 4.1 `src/input/keys.ts`, keyboard steering

A pure model with no DOM in it. It holds the set of held key codes and turns them into a move command.

**Physical codes only, never `event.key`.** An `ev.key` character fallback is a recorded dead end from session 10: on the iPad-over-Windows remote path it caused stuck keys and was reverted. Accept `KeyW`, `KeyA`, `KeyS`, `KeyD`, the four `Arrow` codes, and `ShiftLeft` and `ShiftRight` for focus.

```ts
export interface KeySteerOptions {
  /** The persisted player speed setting, 0.75 to 1.5 (ADR 0011). */
  readonly multiplier: number;
}
export class KeySteer {
  press(code: string): void;
  release(code: string): void;
  releaseAll(): void;
  setMultiplier(value: number): void;
  command(): MoveCommand;
}
```

**Normalization lives here, and the diagonal assertion belongs to this file.** ADR 0011 puts normalization in each input model, and `moveGrave` deliberately applies the command as given and says so in its own JSDoc. A cap or a normalization in the sim would silently undo the ADR's uncapped touch, so the assertion that a diagonal is not faster than a cardinal is a `keys.test.ts` test and never a `grave.test.ts` one.

Normalize by dividing both components by `Math.sqrt(x * x + y * y)` when that length exceeds 1. `Math.sqrt` is required by ECMAScript to be correctly rounded, unlike `Math.hypot`, so this needs no rounding gate and must not reach for `math.ts`. Cite the reason in the comment, because it is newer than most readers expect: `Math.sqrt` was only fully specified by TC39 PR 3345 in 2024, and a reader working from the 2024 edition will find it listed as implementation-approximated and think this is wrong. V8, SpiderMonkey and JavaScriptCore all comply.

Opposed keys cancel: holding left and right at once is zero on that axis, not left-wins. This is the only reading that survives a player rolling their hand across a keyboard. The evidence on this is genuinely split rather than one-sided, so it is a feel choice and not a rule: cancel-to-zero is Godot's default and the fighting-game tournament standard, while Godot proposal 12235 argues last-input-priority is what shooters usually want and Valve banned SOCD hardware in CS2 because the responsiveness gain is real. In a single-player shmup no ruleset applies. It goes on the on-device read-list in section 8 and the fix is two lines if it feels wrong.

The order is: sum the held directions, normalize, then multiply by the speed setting, then halve if focus is held. Focus multiplies by `FOCUS_FACTOR`, declared in this file as `0.5`, matching the test list's "focus halves keyboard speed while held".

**`FOCUS_FACTOR` is a first pass and dispatch 7 owns it.** Say so in its comment, the same way `DRAG_RATIO` does. Touhou tunes focused speed per character rather than at a fixed fraction, and its derived ratios land at 0.40 to 0.44 with Reimu at exactly 0.5 in the older frame data, so 0.5 is a defensible opening number and definitely a feel number. Without that sentence a retune after Mark plays reddens a spec test and reads as a rules change.

`setMultiplier` clamps to 0.75 through 1.5. See section 4.7 for why the range moved and what has to be edited alongside it.

### 4.2 `src/input/touch.ts`, uncapped relative drag

A pure model, again with no DOM. It takes pointer ids and points already in field units.

```ts
export interface FieldPoint {
  readonly x: number;
  readonly y: number;
}
export class TouchSteer {
  down(id: number, point: FieldPoint, grave: FieldPoint): void;
  move(id: number, point: FieldPoint): void;
  up(id: number): void;
  cancelAll(): void;
  isSteering(): boolean;
  command(grave: FieldPoint): MoveCommand;
  takeBelch(): boolean;
}
```

**Relative drag, not absolute.** The steering finger anchors where it went down, along with where the grave was at that moment. The drag target is `graveAtAnchor + (current - anchor) * DRAG_RATIO`. Relative is the right model on a phone because the player can anchor away from the grave, so their own hand need not occlude the thing being steered, and because an absolute model teleports the grave to wherever a finger first lands. This is confirmed against the genre rather than assumed: Cave went relative across its whole iOS line, and Aka to Blue, made by ex-Cave staff, is effectively uncapped one to one.

`DRAG_RATIO` is declared in this file as `1`, a one to one drag. It is a first pass and the tuning dispatch owns it. Say so in its comment. No shipped game publishes its drag ratio, slider range or default, so there is no number to look up and 1 is as defensible an opening as anything.

**The command lands the grave on the target every tick, and is deliberately uncapped.** Return `(target - grave) / BASE_SPEED`, so `moveGrave` multiplies it back out and arrives exactly. ADR 0011 records that capping the touch drag at keyboard speed for fairness **was** the input lag felt on device, so no clamp goes here and none goes in `moveGrave`. Write that reason in the code, not just here.

**`command` is recomputed on every tick, not sampled once per frame.** This is the rule the first draft got backwards and all three gates caught, so it is spelled out. The touch command is a position error and not a velocity, and it is not repeatable: with the grave at P and the target at T, tick one lands the grave on T, and applying the same command again on tick two lands it on `2T - P`. On a 30 Hz frame a 100-unit drag would move the grave 200 units, 37 percent of the field's width, in one frame. Recomputing per tick converges instead: the anchor and the pointer position are both frame constants, so once the grave is on the target the recomputed command is zero and every later tick in that frame is a no-op. The first draft's stated reason for sampling once, that the target would chase itself, was wrong because the target is anchored to `graveAtAnchor` and not to the grave's current position. The keyboard is a true velocity and is unaffected, which is why sampling it once per frame is correct and why this defect was invisible to every planned test and would have shipped to every 60 Hz phone.

**The drag never banks travel the grave could not take.** `moveGrave` clamps through `containGrave`, and the drag target knows nothing about that clamp, so without a rule the overshoot accumulates without bound. That is integral windup, the control-theory failure where an accumulator keeps integrating while its output is saturated so reversing the input does nothing until the banked excess is repaid. In play it gives every field edge a dead zone, worst at the bottom edge where a vertical shmup is actually played: you hug the edge, your thumb keeps travelling, a shot appears, you flick away and the grave does not move until your thumb has crossed an inch of nothing. The fix is conditional integration, and **the position it re-anchors to is the whole of it**. At the top of `command(grave)`, if a target was issued on the previous call and the grave is not standing on it, the grave was clamped, so re-anchor: set `graveAtAnchor` to the grave's current position and the anchor to **the pointer position that produced the previous target**, not to the pointer's current position. Then compute the target from the fresh anchor. `TouchSteer` therefore holds the previous call's pointer position alongside the previous target.

Re-anchoring to the current pointer position looks equivalent and is not, because it discards the pointer's movement since the last command along with the banked overshoot. Simulated at 60 Hz with the grave pressed against the bottom edge and the thumb sliding down and to the right at 6 units a frame, the two rules give:

```
re-anchor to the current pointer:   6, 0, 6, 0, 6, 0, 6, 0
re-anchor to the previous pointer:  6, 6, 6, 6, 6, 6, 6, 6
```

The y clamp fires on every tick, so the re-anchor fires on every tick, and it zeroes the x delta too. Lateral speed halves and it stutters rather than lagging, which reads worse than the dead zone it was meant to cure, and it happens along the bottom edge where a vertical shmup is actually played.

**"Not standing on it" needs a named tolerance, never an exact comparison.** `moveGrave` computes `grave.x += ((target - x) / BASE_SPEED) * BASE_SPEED`, and that round trip is not exact in binary64 for most positions, so an exact test re-anchors constantly and silently drops steering. `clock.ts` already carries `TICK_TOLERANCE` for this class of thing and explains itself in its own comment; declare the same kind of named constant here and say what it is for.

A consequence to write into the code rather than leave for dispatch 4 to find: this re-anchor fires whenever the grave is not where the command put it, for any reason at all. When mob contact arrives, anything that displaces the grave silently resets the offset and the grave stays where it was left rather than snapping back under the finger. That is the wanted behaviour, and it is a rule nobody has decided yet.

This does not reopen ADR 0011. The ADR's uncapped rule is about speed and the recorded pain was capping drag to keyboard speed. Anti-windup changes nothing about speed: the grave still reaches any point inside the field in one tick. Only the meaningless offset outside the field stops banking.

**The steering finger is the first pointer to move past `STEER_SLOP`, not the first to land.** Oldest-pointer-down dies on a normal phone grip: you pick the phone up, your off-hand thumb brushes the glass at the edge, then you reach in with your steering thumb. Under oldest-wins the brushing thumb is the steering pointer and never moves, so the grave sits still, and every real steering drag registers as a second pointer and sets the belch edge. The control is dead and the bomb fires. A developer hit exactly this on a mobile shmup and published the fix as lock-to-one-touch plus a distance threshold. `STEER_SLOP` is declared in this file as `4` field units, and the pointer that crosses it anchors **at the crossing point**, not at where it went down.

Both halves moved from the first fold and both have the same reason. Anchoring at the down position sounds better because no travel is lost, but it means the grave sits still for the whole slop distance and then teleports that distance in one tick. Android's `ScrollView.onTouchEvent` does the opposite on purpose, literally subtracting the slop from the first delta, and `UIScrollView` behaves the same way: cross the threshold, discard the threshold travel, then move continuously. They chose losing the travel over the jump, and the case is stronger here, because the thing that would jump is the player's own avatar under direct manipulation rather than a list of content.

On the number: 8 dp, which is Android's `ViewConfiguration` touch slop and converts to 11 field units at the phone's 0.72 CSS pixels per field unit, is calibrated for a harder job than this one. It exists to stop a deliberate **tap** being read as a scroll, so it has to survive the finger roll of a press. Telling a resting thumb from a steering thumb needs far less. 4 units is about 3 CSS pixels on the phone, which clears touchscreen jitter comfortably.

Below the slop no pointer steers and `command` returns zero.

`STEER_SLOP` is a finger-jitter threshold in physical units, so expressing it in field units bakes in one viewport: 4 units is 3 CSS pixels on a 390-wide phone and about 4.5 on a desktop touchscreen. `GameScreen` holds the live placement and can hand `TouchSteer` `3 / placement.scale` instead. Low stakes on the device this dispatch is read on, and exactly the class of viewport-baked constant section 4.6 spends a page unwinding, so do it the right way now.

**Every other pointer is the belch, and the belch is edge-triggered and unconsumed in this dispatch.** A `down` for a pointer while a steering pointer already exists sets the belch edge; `takeBelch()` returns true once and clears it. `belch.ts` arrives in dispatch 5 and will consume it. It is built here rather than deferred because the stale-drag-target rule only exists in the presence of a second finger, and a two-finger rule with no second finger in the code is a rule nothing exercises. Section 9 carries forward a real risk with this binding that dispatch 5 must settle before it fires anything.

**The stale drag target is the #33 lesson and is a pinned spec test. On a steering lift, the drag clears; it does not hand off.** The tracer plan's input line offers both branches, "hands off **or clears** the drag target, never stale (the #33 lesson)", and the slop rule above is what makes clearing the right one. Handing off would promote a pointer that has never crossed `STEER_SLOP`, which rebuilds the exact grip disaster the slop rule was invented to prevent: your off-hand thumb rests on the glass, your steering thumb crosses the slop and steers, you clutch, the handoff promotes the resting thumb, the grave freezes, and when your steering thumb lands again a steering pointer already exists so that `down` sets the belch edge. Control dead, bomb fired, on every clutch, at a ratio where clutching is constant. So: clear the steering pointer on lift, and make any remaining pointer earn the role by crossing the slop from where it currently is. That keeps every property the #33 lesson cares about, no stale anchor and no jump by the distance between the two fingers, and it closes the freeze and the misfire together.

**`move` must be idempotent, and a test says so.** `globalpointermove` on a `static` container with interactive children is dispatched twice per DOM move: `EventBoundary.hitTestMoveRecursive` pushes the current target into `_allInteractiveElements` when a child produced a hit and again unconditionally, and `all()` notifies every entry. Setting an absolute position is idempotent so this spec survives, but an implementation that accumulated a delta would double every drag, so the property is pinned rather than left to luck.

`cancelAll` clears every pointer, the anchor and the belch edge. Section 4.5 names its three callers.

With no steering pointer, `command` returns `{ x: 0, y: 0 }` and `isSteering()` returns false.

### 4.3 `src/input/steering.ts`, one command from two models

`GameScreen` holds a `KeySteer` and a `TouchSteer` and must produce one `MoveCommand`. The first draft never said how, and section 3's stall rule would have stopped the dispatch here.

```ts
export function combineSteer(
  keys: MoveCommand,
  touch: TouchSteer,
  grave: FieldPoint,
): MoveCommand;
```

**Touch wins while it is steering, keyboard otherwise.** Summing is wrong on its face: the two are in different units of meaning, one a velocity and one a position error, so a held key plus a live drag overshoots the target. On a touchscreen laptop or an iPad with a keyboard both models are live at once and this rule decides between them.

The rule has a consequence worth writing into the code rather than discovering later: a resting finger that has crossed the slop silently disables the keyboard until it lifts.

### 4.4 `src/game/advance.ts`, the frame loop with a headless seam

The tick loop is a rule about how the sim consumes time, so it lives in `src/game` and not inside a pixi screen.

```ts
export type SteerSource = (grave: FieldPoint) => MoveCommand;
export function advance(
  run: RunState,
  clock: Clock,
  elapsedMs: number,
  steer: SteerSource,
): SimEvent[];
```

It calls `ticksFor(clock, elapsedMs)` and steps that many times, calling `steer(run.grave)` once per tick and concatenating the events.

`SteerSource` takes a `FieldPoint` and not a `Grave` deliberately. A position is everything the closure needs, and the closure is written in `src/app`, so typing it as `Grave` would hand live mutable sim state out across the boundary the rest of this plan works to keep.

**Why this is a seam and not four lines inside `GameScreen.update`.** Every other test in this dispatch is on a pure model, and the tick loop is where the touch overshoot lived: written inside a screen it has one test between it and production, and that one only counts window listeners. It is also against ADR 0015's own stated reason for putting the accumulator in `src/game`, "so the autopilot and the rendered screen share one implementation". With the loop inside a screen the accumulator is shared but the loop is not, and dispatch 7's autopilot would write a second one.

`SteerSource` is what makes the sample rule testable. The screen samples the keyboard once per frame and passes a closure that returns the frame-constant key command or the freshly recomputed touch command, per section 4.3. `advance` itself has no opinion about which.

### 4.5 `src/app/seedFromUrl.ts`, `?seed=` and `?size=` in both forms

Pure functions over two strings, so they are testable without a browser.

```ts
export function seedFromUrl(search: string, hash: string): number | null;
export function sizeFromUrl(search: string, hash: string): number | null;
```

ADR 0012 pins a run from `?seed=` before the hash or after the route, and treats the two forms as equal. They are not equal when both are present, so this plan rules it: **the hash's query wins.** The hash is this app's single navigation authority, stated in `routes.ts`, and it is the part that changes without a reload. A stale `?seed=` left in the search would otherwise silently override a fresh seed an in-app link had just written. Section 4.10 records this on ADR 0012, because it is a durable rule about run identity and a dispatch document is not the record.

Accept a seed that the roll itself could have produced: a whole number, zero or greater, below `SEED_LIMIT`. Export `SEED_LIMIT` from `src/game/run.ts` for this; it is currently a private constant there. Anything else is ignored, with one `console.warn` naming the value, and the run rolls fresh: a playtester who fat-fingers a seed should still get a game rather than a blank screen.

`?size=` follows the same parsing and the same warn-and-ignore rule, and is accepted from `SIZE_FLOOR` through `SIZE_CEILING` inclusive, fractional values allowed because the sim's sizes are fractional. **It exists because the on-device check is otherwise blind to two thirds of the game.** The grave is unfeedable and undamageable in 3b, so without it Mark steers at `SIZE_START` 27 only, while the run's real range is 18 to 67.5. `BASE_SPEED` is size-independent at 4.5 units a tick, 270 a second, and `graveWidth` equals the size exactly at `GRAVE_ASPECT` 2, so a floor grave covers `270 / 18` = 15 of its own body-widths per second where a ceiling grave covers `270 / 67.5` = 4. That 3.75x spread is the same 3.75x section 4.6 states for floor to ceiling, and it must be, since the speed is constant and the width is the size. It is both the hole.io growth arc and the part of steering feel that changes most across a run. Fifteen lines here turn one steering read into three.

`GameScreen.prepare()` reads both as `createRun(seedFromUrl(...) ?? undefined)` followed by applying `sizeFromUrl(...)` to the created grave when it is not null. Pass `undefined` and not `null` for the seed, because `createRun`'s default parameter is what rolls.

A pinned seed stays pinned across a restart while the URL holds it. That is the point of pinning and it is not a conflict with ADR 0012's fresh dice, which govern a run with no seed in the URL.

**A pinned run says it is pinned.** The seed readout reads `SEED 1234 PINNED` when the seed came from the URL and `SEED 1234` when it was rolled. ADR 0012 exists because a silently defaulted seed made a dozen playthroughs the identical run, and a tester handed a `?seed=` link would otherwise play fifty identical runs with nothing on screen saying so. The size readout appears only when `?size=` pinned it, since an unpinned size is just the start of a normal run.

### 4.6 `src/app/screens/game/GraveRenderer.ts`, the grave on screen

The first field content on screen. Render only: it reads a `Grave` and draws it, and holds no rules.

**Two Graphics in two different layers, not one.** ADR 0014's stack puts `graveMouth` beneath the food layers and `graveRim` above them, because the hole's interior must sit under whatever is falling into it while the rim stays legible over the top. One Graphics cannot be in two layers, so the renderer owns two and syncs both.

- The mouth: a rounded rectangle filled `PALETTE.graveHole`, in the `graveMouth` layer.
- The rim: the same rounded rectangle stroked `PALETTE.graveRim`, in the `graveRim` layer.

Geometry comes from the sim and nowhere else: half-height is `grave.size`, width is `graveWidth(grave.size)`. Do not re-derive the width from the aspect here; that is `grave.ts`'s and there must be one derivation.

`GRAVE_CORNER_RATIO` is declared in this file as `0.2` of the width. It is a render property and not a sim number, so it stays out of `tuning.ts`. A rounded rectangle becomes a capsule at half the width, so 0.2 has real headroom below that, and at the size floor on a phone the whole grave is about 13 CSS pixels across, which is where a misreading would land first.

**`GRAVE_RIM_STROKE` is `3` field units, stroked inward, and the derivation below is the whole reason.** Do not follow `BOUNDARY_STROKE`'s reasoning to a number of your own; that path gives 8 and destroys the grave, which is what all three gates independently found in the first draft.

The first draft told you to copy `BOUNDARY_STROKE`'s argument, which is APCA's Lc 30 bracket for solid non-text no thinner than 5.5 rendered pixels. At the phone's 0.72 CSS pixels per field unit that is 7.6 units, rounding to 8. At `SIZE_FLOOR` the grave is 18 units wide, so two 8-unit rims leave 2 units of mouth on a 13-CSS-pixel object, the stroke self-overlaps against a corner radius of 3.6, and the grave is a solid pill exactly when the player most needs to read it. That contradicts ADR 0014's requirement that food still visibly falls into the mouth, and it contradicts the identity in the concept doc and the glossary, where the grave is a hole in the ground.

The bracket was the error, not the arithmetic. `fieldFrame` sits in the Lc 30 bracket because it cannot be raised far enough to reach Lc 45 against `night` without breaking something else, and `graveRim` is not in that position.

Be careful with the reason, because the research doc states it wrongly and this plan's first fold repeated it. `readability-value-band.md` says the fine-detail bracket is one "where no colour under the ceiling can reach Lc 45 against `night` at all". That sentence is false, measured in-tree: a neutral gray at ADR 0014's luma ceiling of 68 is Lc 57.4 against `night`, and even at luma 62 it is Lc 49.3. The real cap is the same doc's assertion 8, which requires every mob-fire core to clear Lc 45 against `fieldFrame` **as a background**, so every point `fieldFrame` rises is spent out of that margin. `BOUNDARY_STROKE` at 8 is still correct; only its stated reason was. Section 4.10 corrects the doc. Measured in-tree with this repo's own `apcaLc` over the landed palette, `graveRim` is Lc 52.9 against `night` and Lc 53.4 against `graveHole`, both clearing APCA's Lc 45 fine-detail bracket with headroom, and that bracket carries no 5.5-pixel floor. An APCA bracket is not transferable between elements.

With no floor from APCA, the number is bracketed from both ends instead:

- **Not thinner than 2 CSS pixels at the phone viewport**, which is 2.77 field units. There is no published minimum thickness for a general UI outline, so this borrows the nearest published figure: WCAG 2.2 SC 2.4.13 sets a floor for a focus indicator equal to the area of a 2 CSS pixel perimeter, and SC 1.4.11's note warns that very thin lines render much fainter than their nominal colour because of anti-aliasing. Borrowed loosely, not claimed, and stated precisely because the loose version is wrong twice over: SC 2.4.13 is an **area** minimum rather than a thickness minimum, W3C's own understanding page says a literal 2px outline is not required, and the criterion governs focus indicators rather than game sprites. It is cited as the closest published number for "a thin outline a person must see" and nothing more. The binding constraint on the number is the ceiling below, not this.
- **Not thicker than 4 units**, so that at `SIZE_FLOOR` the mouth's interior stays wider than a drop. Drops are sized up from 9 units, and an interior of 18 minus twice the stroke has to leave a drop visibly inside a hole.

3 is the only integer in that bracket with margin at both ends. It renders 2.17 CSS pixels on a 390-wide phone and 3.55 on a 1440x900 desktop, where the height and not the width binds the fit, and it leaves a floor grave a mouth 12 units wide, two thirds of the grave's width.

**Stroke inward, `alignment: 1`, the same as `boundaryReadout`.** The first draft never said, and a default centred stroke would draw the grave 1.5 units wider on every side than `graveHitbox` reports. ADR 0003 makes the drawn grave the health bar and `graveHitbox` is exactly the sim rect, so the visible outer edge must equal the hitbox: a player reads the outer edge as what they pass under and swallow. Inward alignment also keeps the size signal exact, since the outer edge then spans the sim's full 3.75x from floor to ceiling. The cost is that the stroke eats into the mouth, which is why it is thin.

**Redraw only when the size changes; move every tick.** Position is a container transform and is free. Rebuilding the rounded-rect geometry every frame is not, and the size only changes on a swallow or a hit. Hold the last drawn size and compare.

`detach()` removes both Graphics from their layers. `FieldLayers.clear()` empties every layer between runs, so the renderer must be able to put itself back rather than assume it is still attached, exactly as `GameScreen` already does with its boundary frame.

### 4.7 `src/app/screens/game/GameScreen.ts`, rewired

The changes, each with its reason.

**The clock replaces one tick per frame, through `advance`.** `update(ticker)` samples the keyboard once, builds the `SteerSource` closure, and calls `advance(this.run, this.clock, ticker.elapsedMS, steer)`. **`elapsedMS`, never `deltaMS`**: Pixi assigns the raw gap to `elapsedMS` and clamps only `deltaMS` to its `_maxElapsedMS` of 100, so feeding `deltaMS` makes `clock.ts`'s own clamp unreachable, pins `debtTicks` at zero forever, and lets a change to the ticker's speed silently rescale the sim. `clock.ts` says this in its own header; the `update()` JSDoc that calls the current behaviour a placeholder comes out with the placeholder.

**`update` takes a ticker now, and one existing test calls it with nothing.** `src/app/screens/screenLifecycle.test.ts` calls `screen.update()` and asserts `tick` is 2. Update it to pass a ticker-shaped `{ elapsedMS }` and assert against the tick count that elapsed time actually buys. This is a test the signature change invalidates, not a test you are weakening.

**`createClock()` in `prepare()`.** A pooled screen must not inherit the previous run's remainder or its debt.

**The input models are constructed in the constructor and cleared in `prepare()` and `reset()`.** `KeySteer` and `TouchSteer` hold per-run state, so a run that ends mid-drag and a pooled screen coming back would otherwise carry the previous run's anchor and pointer set into the next one. The first draft was careful about exactly this for the clock and the listeners and silent about the input models, which it never said where to construct.

**Pausing and backgrounding go through hooks the engine already owns. Add no listener for either.**

`src/engine/engine.ts` already registers one `document` `visibilitychange` listener and routes it to optional `blur()` and `focus()` hooks on the current screen, declared in `navigation.ts`. `navigation.presentPopup` and `dismissPopup` already call optional `pause()` and `resume()` hooks. Implement the four hooks on `GameScreen` and nothing else:

- `blur()` and `pause()`: set `paused`, then `keys.releaseAll()` and `touch.cancelAll()`. A lost `keyup` or a drag interrupted by a popup must not survive into the resumed run.
- `focus()` and `resume()`: clear `paused` and set a flag that makes the next `update` skip its elapsed time entirely.

**The skipped frame is the fix, and a clock reset is not.** The first draft called for `resetClock` on `visibilitychange`, which does not do what it says. `resetClock` sets `remainderMs = 0` and nothing else, but the backgrounded gap does not live in the remainder: it lives in Pixi's `Ticker.lastTime`, which no game-side call can reach. `Ticker.update` computes `elapsedMS = currentTime - this.lastTime` and `lastTime` does not advance while rAF is paused, so the first frame back hands `ticksFor` the whole gap. A 30-second tab switch adds `floor((30000 - 250) / 16.667) = 1785` to `debtTicks` and the readout then reads DEBT 1785 for the rest of the run, which is precisely the lie the handler existed to prevent. Skipping one frame's elapsed time is what actually works.

**Pointer wiring.** Set `eventMode = "static"` on the screen and give it a `hitArea` covering the whole stage, refreshed in `resize`, so a drag that starts outside the letterboxed field still steers. **Set `this.field.interactiveChildren = false` in the same breath.** `_interactivePrune` skips a `passive` container whose `interactiveChildren` is false, and `Container`'s default `eventMode` is `passive`, so that one line prunes the field, the `FieldLayers` root and all eleven layers out of `hitTestMoveRecursive` on every pointer move. The layers are empty today and hold every corpse, mob body and bullet from dispatch 4, on a phone, on every move. The dispatch that adds the `hitArea` is the dispatch that owes the guard. Use `pointerdown`, `globalpointermove`, `pointerup` and `pointerupoutside`. Convert `event.global` with `screenToField(this.placement, ...)` using the **held** placement. **Never call `fitField` again at event time**: that computes the placement a second time in parallel with the one the field container is actually wearing, and the two agree only until something moves one of them. The field's own JSDoc already says this; do not break it.

**Filter to `pointerType` `touch` and `pen`.** A mouse fires the same three events, so without a filter a desktop click-drag steers through `TouchSteer` uncapped, and `TouchSteer` is reasoned about entirely in fingers. Desktop steering is the keyboard by design, and the concept doc's controls box is "steering, hold-to-focus, autofire, one button. Nothing else." The concrete hazard is that verification step 6 is a keyboard feel read on a machine with a mouse in it, and a stray click-drag yanking the grave across the field would corrupt the one instrument this dispatch ships. This is one condition and it is reversible if a mouse path is ever wanted deliberately.

**`pointercancel` needs a DOM listener, because Pixi v8 does not carry it.** `EventSystem._addEvents` attaches `pointermove` on document, `pointerdown`, `pointerleave` and `pointerover` on the canvas, `pointerup` on window, and `wheel`. There is no `pointercancel` and no `touchcancel`, and `EventBoundary`'s mapping table has no `pointercancel` entry, so even a hand-fed event would warn "Event mapping not defined". The only occurrence of the name in the package is in the `TOUCH_TO_POINTER` table. This matters because when iOS takes a gesture away, through an edge swipe, palm rejection or an incoming call, it fires `pointercancel` and then never sends `pointerup`: `TouchSteer` would keep that pointer down forever, holding a stale drag target the grave parks on and cannot leave. That is the #33 failure class arriving through the one event the first draft wired to prevent it. Add a real DOM `pointercancel` listener on the canvas, in `src/app` with the rest of the pixi wiring, calling `touch.cancelAll()`. Added in `prepare()`, removed in `reset()`. No failsafe timer: `pointercancel` plus the `blur()` hook cover the recorded failure, and a timer would be a second mechanism for the same thing.

**Where each listener lives, because pooling punishes getting it wrong.** `window` and canvas DOM listeners are added in `prepare()` and removed in `reset()`. Pixi's own `this.on(...)` handlers go in the **constructor**: screens are pooled by `BigPool`, so a `.on` added in `prepare` without a matching `.off` gives the second run two handlers and the third three, and the lifecycle test counts only `window` handlers and cannot see it.

**Keyboard wiring.** `window` `keydown` and `keyup` feeding `KeySteer.press` and `release` by `event.code`, plus `blur` feeding `releaseAll`. Call `preventDefault` for the arrow codes so the page does not scroll under the game.

**`Escape` opens the pause menu and no longer ends the run.** Section 4.8.

**The field holds the grave and nothing else.** Move the tick readout and the seed readout out of the field and into the corner readout stack below. The first draft left them centred on the field: `placeReadouts` put a 52px TICK label at 46 percent of the field height and the seed label at 22 percent, both down the field's vertical centre line, which is the lane a vertical shmup is played in.

**The corner readout stack.** `src/app/FpsMeter.ts` gains one export, `meterLinePosition(index)`, returning the position of line `index` in the corner stack. `FpsMeter` uses it for line 0. `GameScreen` owns lines 1 through 3 and positions them from the same function, so the corner geometry has exactly one declaration and the readouts cannot drift apart. Do not export a margin and a line height as two loose constants; a single function that returns the position is what removes the drift, and `METER_LINE_HEIGHT` does not exist in `FpsMeter.ts` today and would have to be invented for the other component's benefit.

Set each label's anchor to `(0, 0)` and give the stack one declared font size. `Label`'s constructor sets `anchor.set(0.5)` and `FpsMeter` overrides it to `(0, 0)` for exactly this reason, so a line that inherits the default centres itself on the x where the FPS line starts, and a shared line height presumes a shared size.

- Line 1: `DEBT ${clock.debtTicks}`.
- Line 2: `TICK ${run.tick}`.
- Line 3: the seed, per section 4.5.

All three are monospace `Label`s in `PALETTE.hudDim`, direct children of the screen and never of `this.field`, since the navigation container is added to the stage untransformed and `this.field` is not. Each updates only when its number changes, as `FpsMeter` already does with its own. DEBT reads zero rather than hiding at zero: an absent readout and a healthy one look the same, and this is the only readout that separates "the game feels slow" from "we blew the frame budget" on a phone.

**Screen shake, if it is ever added, goes on a child of `this.field` and never on `this.field` itself.** The comment saying so is already on the field. Leave it there and do not add shake in this dispatch.

**Events stay unconsumed.** `advance` returns `SimEvent[]` and nothing in 3b produces one, because nothing yet damages or feeds the grave. Do not invent a consumer and do not swallow the array into a variable nobody reads; take the return value and drop it with a `//` comment naming dispatch 4 as the first producer.

### 4.8 The pause menu, and taking END RUN off the field

Mark ruled on 2026-08-20 that the END RUN button must not be reachable while playing at all, and that placement was the smaller half of the problem.

The button was never designed. It arrived with the dispatch-1 shell commit `0a0d4e8f1d` as scaffolding, because that shell's stub sim could never end a run and a button was the only way to reach the End screen. It then survived three dispatches because nothing had been drawn on the field yet, and the first thing drawn lands underneath it: `createGrave` starts the grave at `FIELD_WIDTH / 2, FIELD_HEIGHT * 0.8` and the button sat at 78 percent of the field height, 0.02 of field height apart against a combined half-extent of `42 + 27 * scale`. That inequality holds for every scale, so the grave was fully inside the button at every viewport, and Pixi hit-tests to the deepest interactive target and then propagates root to target, so a tap there would have fired both the button's press and the screen's drag anchor.

What to build:

- **A pause button in the top-right corner of the stage**, outside the field, mirroring `FpsMeter` in the top-left. Top because a phone held in portrait puts both thumbs at the bottom, right because `FpsMeter` owns the left. Its tap target is at least 44 by 44 CSS pixels. It is a child of `GameScreen`, so it exists only during a run and not on the title or end screens.
- **The pause button calls `stopPropagation`**, or the screen ignores a `pointerdown` whose target is not the screen itself. This section condemns the old END RUN button for firing both its own press and the screen's drag anchor, and a button parented to a screen that now carries a full-stage `hitArea` reproduces that exactly. A clean tap is benign because it never crosses the slop, but a finger that slides off the button does, and lurches the grave from a gesture aimed at the menu. From dispatch 5 it is worse than a lurch: the `pointerdown` while a steering finger is down sets the belch edge, so tapping Pause mid-drag would spend a full reservoir. Section 9 carries that risk as an accidental one; this would make it deterministic.
- **`Escape` and the pause button both open `PausePopup`.** `src/app/popups/PausePopup.ts` exists in the create-pixi template with no call site anywhere; this is its first real caller. It ships with a Resume button. Add **Settings** and **End Run**.
- **Escape must also close the menu, and today it cannot.** `bindKeyPress` is a bare `window` keydown listener with no popup guard, and `GameScreen` binds it in `prepare()` and releases it in `reset()`, so it stays live while the popup is up. `presentPopup` starts with `if (this.currentPopup) await this.hideAndRemoveScreen(this.currentPopup)`, so a second Escape animates the menu out, returns it to the pool, and animates a fresh one back in, still paused. Escape as the universal cancel is not negotiable. Guard the handler on `navigation.currentPopup` and make Escape a toggle.
- **Order the menu Resume, Settings, End Run, with End Run set visually apart and last.** End Run is the destructive item and it must not sit next to the one tapped most.
- **Settings' OK returns to the pause menu, not to the run.** `presentPopup` replaces rather than stacks, so opening Settings destroys the pause menu, and `SettingsPopup`'s OK calls `dismissPopup`, which ends by calling `currentScreen.resume?.()`. Left alone, the player pauses, opens Settings, drags the keyboard speed slider, taps OK, and is instantly back in live play holding nothing. That is precisely the flow section 4.9 says the slider exists for, so it is the path Mark walks every time he changes the number. Wire Settings' OK to `presentPopup(PausePopup)`.
- **End Run dismisses the popup first, and `reset()` clears `filters`.** This is the worst defect the gates found in the first fold and it is worth stating in full. `PausePopup.show()` sets `navigation.currentScreen.filters = [new BlurFilter({ strength: 5 })]` and only `PausePopup.hide()` clears it. `showScreen` never touches `currentPopup` and never touches filters. So End Run from inside the menu hands the player an `EndScreen` with the "Paused" panel and its 80 percent black scrim still sitting on top of their result, and returns `GameScreen` to `BigPool` still wearing the blur. The pooled screen comes back for the next run **permanently blurred**, paying a full-screen blur pass every frame, which corrupts the frame-rate readout and the steering feel that are the only two instruments this dispatch produces, silently, from the second run onward. Dismiss the popup before changing screens, and clear `filters` in `reset()` as well, because two mechanisms for a defect this quiet is the right number.
- **Leave the popups' template colours alone, but know the blur is load-bearing.** `PausePopup`, `SettingsPopup` and the slider all carry hardcoded template pinks. #38 dresses the shared widgets and this is a wiring dispatch, not a dressing one; they are outside `palette.test.ts`'s source scan, which covers `src/app/screens/game`, `FpsMeter.ts` and `main.ts` only. The `BlurFilter` is not dressing, though: a pause menu in a score game normally opens a "pause and read the curtain" line, and the blur is what closes it. Section 9 records that #38 must not strip it.
- **The sim is paused while the menu is up.** This comes free from `navigation.presentPopup` calling `pause()`, per section 4.7, and it is why the `cancelAll` the first draft could not find a caller for now has one. It is needed: a container with `eventMode: "static"` stays in `EventBoundary`'s `_allInteractiveElements` even when `interactiveChildren` is false, so a finger already down when a popup opens would keep steering the grave underneath it.
- **`pause` and `resume` are typed `Promise<void>` on `AppScreen` while `blur` and `focus` are `void`.** Implementing all four as plain void methods fails typecheck. The four hooks are not the same shape; match each one.
- **No confirm on End Run and no countdown on Resume, deliberately.** Both are free in 3b: nothing scores and nothing kills, so there is no work to lose and no danger to be dropped into. They are recorded in section 9 with triggers rather than built here.

### 4.9 The persisted keyboard speed setting

ADR 0011 makes the keyboard multiplier a player setting, persisted. Storage already exists and already has the right failure behaviour: `src/engine/utils/storage.ts` guards every read and write and warns once through `warnOnce`, so blocked storage in a private-mode browser is a console warning and never a state the game branches on. Do not add a state for it and do not re-fix that path.

**The range narrows from 0.5x to 2.0x down to 0.75x to 1.5x, and focus stays multiplicative at 0.5x.** This reopens ADR 0011, which fixed the wider range, and Mark ruled it on 2026-08-20 on new evidence rather than a fresh opinion.

The evidence: a 4x range collides with a focus key at both ends. At 2.0x, focus gives exactly the default speed, so focus stops being a precision tool and becomes a return-to-normal key. At 0.5x, normal speed already equals what everyone else calls focused, so there is nothing left below it. The collision is the whole of the argument. The alternative, absolute focus, where the multiplier governs traversal and focus resolves to one shared speed, was considered and rejected as two changes rather than one, and it still wants a narrower low end. No shipped shmup offers a player-configurable movement speed alongside an independent focus key, so there is no worked example either way.

Do not reintroduce the genre argument that was in this plan's first fold. It claimed Touhou gives every character an identical focused speed while varying only unfocused speed, and that did not survive checking: one gate could not reproduce it and a separate lookup found focused speed varies per character. ADR 0011 carries the correction. `FOCUS_FACTOR` 0.5 itself was never in question.

What to build:

- `userSettings` gains `getKeyboardSpeed()` and `setKeyboardSpeed(value)`, keyed `keyboard-speed`, defaulting to `1`, clamped to 0.75 through 1.5 on read as well as on write. A stored value from a hand-edited `localStorage` is a real input, and so is a value persisted by an earlier build under the old range.
- **Rename `src/app/ui/VolumeSlider.ts` to `src/app/ui/SettingSlider.ts`, class and all**, and update its three existing call sites. It already takes a label, a min, a max and a value, so it needs no redesign; only its name is now a lie. This is a rename and not a rework: leave its template colours alone, because #38 dresses the shared widgets.
- `SettingsPopup` gains a "Keyboard Speed" slider beside the three volume sliders, because that is where every persisted setting in this app already lives, and Settings is reachable from the pause menu per section 4.8. Reachability is the point: all three gates found that the first draft built this slider into a popup nothing opened, so ADR 0011's persisted setting would have shipped as a `localStorage` key with no door and the one dispatch whose purpose is reading input feel would have run at exactly 1.0x.
- The slider runs 15 to 30 and the setting is `Math.round(value) / 20`, giving 0.05 steps across the narrowed range. The tracer plan's checklist says 0.1 steps across 0.5x to 2.0x; 0.1 does not divide 0.75 to 1.5 evenly, so the step moves with the range. Section 4.10 records the change on the tracer plan rather than dropping it silently.
- On a phone this slider does nothing, because touch has no multiplier by ADR 0011. Its whole value in 3b is the desktop keyboard read, where Mark has a keyboard in front of him, and where a reachable slider turns "1.0x feels wrong" into "it feels right at 1.4x" out of the same sitting.

### 4.10 Record edits

**These landed with this plan and are already in the tree. Do not go looking for the old strings to change; this list is provenance, so you know where the durable rules live and do not re-derive them from this document.**

1. `docs/adr/0011-each-input-owns-its-speed.md`: the keyboard multiplier range is 0.75x to 1.5x, with the reopening, the decider and the two-ended focus collision recorded, per section 4.9.
2. `docs/adr/0012-fresh-seed-per-run.md`: carries the hash-query-beats-search precedence rule from section 4.5 and the pinned-or-rolled readout rule.
3. `docs/design/tracer-plan.md` section 6 item 3: 3b's bullet points at this file, matching 3a's.
4. `docs/design/tracer-plan.md` section 6: the rendered-check list reads 1, 2, 3b, 6, 7.
5. `docs/design/tracer-plan.md` section 5 input line and section 3's `keys.ts` line: the narrowed range and the 0.05 step.
6. `docs/design/tracer-plan.md` section 3: `advance.ts` and `steering.ts` are named in the module lists and their seams added, because section 3 is the module architecture record and it enumerates both folders exhaustively.

**Two record corrections this dispatch owes, which are yours to make:**

7. `docs/research/readability-value-band.md`, line 673: the clause "where no colour under the ceiling can reach Lc 45 against `night` at all" is false and section 4.6 explains why. Correct it to the real cap, assertion 8's mob-fire margin against `fieldFrame` as a background. Add the transferability lesson beside it: an APCA bracket belongs to the element it was chosen for, and `graveRim` qualifies for the fine-detail bracket at Lc 52.9 where `fieldFrame` does not. Put it there and not only here, because that doc is where dispatch 4's corpse, mob and drop renderers will go looking for a stroke width, and it is what misled this plan's first draft.
8. `src/game/clock.ts`: `resetClock`'s JSDoc says "3b calls this on visibilitychange". After section 4.7 nothing calls it at all. Correct the comment or delete the function; do not leave the only caller-less export in `src/game` naming a caller that does not exist.

Also update `src/app/palette.test.ts`'s `DRAWS_DURING_A_RUN` comment, which names "GameScreen's END RUN button draws over the live field" as the thing #38 closes. That button is gone from the field and a pause button in template pink takes its place, so the anchor goes stale and the new element inherits the gap unnamed.

### 4.11 `src/dev/digest.ts` and the `#/digest` route

**Move the scenario, the digest shape and `GOLDEN` out of `src/game/digest.test.ts` into `src/dev/digest.ts`.** Move the never-update warning with `GOLDEN`; the constant and the warning must never be in different files. The test then imports both and keeps only its own assertion and its two recorded blindnesses. `src/dev` may reach `src/game` and imports no bare packages, so the module stays pixi-free and a screen can use it.

**`runScenario()` must return the boundary extremes, because its assertions cannot travel with it.** It currently carries four `expect(box...)` calls that fail the run if the script reaches a field edge, which is recorded blindness two. `boundary.test.ts` gives `src/dev` `mayImport: []` with no test-file carve-out, so `expect` cannot move into `src/dev`. Return the extremes the run reached alongside the digest and have `digest.test.ts` assert on them. Dropping the guard silently is not an option.

Name the returned thing for the field boundary, never "wall". `CONTEXT.md` reserves the Wall for the Banshee's set piece, and this name would live permanently in `src/dev`. `src/game/digest.test.ts` already carries the drift three times from 3a; correct those comments while the file is open.

**Why this route exists.** ADR 0015's whole claim is cross-engine, and CI and the developer's machine are the same Node. Without a browser that runs the digest, the claim goes unchecked until dispatch 7. 3b already deploys, so this makes the check "open the URL on a phone and compare one word".

`routes.ts` gains `{ kind: "digest" }` at `#/digest`, matched exactly the way `PROTOTYPES_HASH` is: the hash itself, or the hash followed by `/` or `?`, so `#/digest-old` is not it.

**`main.ts` needs the matching branch and the compiler will not tell you.** `resolveScreen` is an if-chain ending in `return TitleScreen`, so a new route kind with no branch compiles cleanly and silently sends `#/digest` to the title screen. Import `DigestScreen` dynamically the way the prototypes already are, or `src/dev/digest.ts` and `src/dev/invariants.ts` land in the boot chunk of every player's first load.

`src/app/screens/DigestScreen.ts` shows the verdict as one large word, `MATCH` or `DIVERGED`, then the digest as text, then a back button to the title. It lives under `src/app/screens` and not under `src/app/screens/game`, so it is outside the palette source scan and may use `MENU` colours: it never draws while a field is live.

A digest that diverges is a real finding on that device, not a test failure. The screen names the fields that differ, because a phone shows no console.

**The screen must also say what a MATCH does not prove.** Print a line under the verdict saying that the scenario's path uses only exactly-specified arithmetic and never calls `math.ts`, so a match is evidence that binary64 behaves and not yet evidence for ADR 0015's cross-engine claim over the approximated operations. That is recorded blindness one, and without the line on screen a phone MATCH will read in the record as more than it is.

### 4.12 The lint rule covers `src/input` too

`apps/hungry-grave/eslint.config.mjs` restricts the approximated `Math` operations and `Math.random` under `src/game/**` only. Add `src/input/**` to that same block.

Input is the sim's only external input, so an approximated operation there diverges a run exactly as one inside `src/game` would, and the golden digest cannot see it: the digest scripts move commands directly and never runs an input model. This is one glob, and it closes the last module-shaped path into the sim that the determinism work left open. It is not literally the last path: the `SteerSource` closure in section 4.4 is written in `src/app`, which no fence covers. In practice that closure only picks between two commands through `combineSteer`, so this is a limit worth knowing rather than a hole worth plugging.

Nothing in this dispatch trips it. Normalization divides by `Math.sqrt`, which is required to be correctly rounded and is deliberately absent from ADR 0015's approximated list, unlike `Math.hypot`, which is on it.

Verify the rule fires on the new folder the same way 3a did: write a line under `src/input` that should trip it, run `pnpm lint`, see it fail, then delete the line.

## 5. The planned test list

Pin every one of these as a named `test.todo` on a stub before you implement anything, per the playbook. Every test cites what it enforces in its name or a comment.

**On the test environment.** There is no vitest config for this app, so tests run in the default `node` environment where `window` and `document` do not exist, and `screenLifecycle.test.ts`'s hand-rolled `window` mock is the only DOM it has. Extend that mock with `window.location` carrying an empty `search` and `hash`, and read the URL through `window.location` in `GameScreen` so the existing stub mechanism covers it. Do not add jsdom for this: it would change how every other test in the app runs, and the two things needed are two properties. Do not make the screen skip work when a global is missing, which would make the test pass while proving nothing. `document` is not needed at all, because section 4.7 registers no `visibilitychange` listener.

### `src/input/keys.test.ts`

1. A single held direction gives a unit command on that axis and zero on the other.
2. Two held directions give a command whose length is 1 and not 1.414, so a diagonal is not faster than a cardinal (ADR 0011). This assertion lives here and not in `grave.test.ts`, because `moveGrave` applies the command as given by design.
3. Opposed keys on one axis cancel to zero on that axis.
4. Both `KeyW` and `ArrowUp` steer up, and an unrecognized code changes nothing.
5. Holding focus halves the command's length, and releasing it restores it.
6. The multiplier scales the command's length, and a multiplier outside 0.75 to 1.5 is clamped into it (ADR 0011, narrowed).
7. `releaseAll` zeroes the command with keys still notionally held, which is the window-blur case: without it a lost `keyup` leaves the grave pressing against the field boundary for the rest of the run.
8. Focus and the multiplier compose: 1.5x with focus held is 0.75x.

### `src/input/touch.test.ts`

1. With no pointer down the command is zero, and `isSteering()` is false.
2. A pointer that has not moved past `STEER_SLOP` does not steer, and the command stays zero.
3. A drag of d field units past the anchor produces a command that lands the grave exactly `d * DRAG_RATIO` from where it was, in one tick, once multiplied by `BASE_SPEED` (ADR 0011). The anchor is the crossing point and not the down position, so the slop distance is discarded rather than delivered as a jump, which is what `UIScrollView` and AOSP's `ScrollView` both do.
4. The command is uncapped: any target inside the field is reached in one tick however far away it is, with nothing clamping the command (ADR 0011's recorded reason).
5. **Two consecutive commands with pointer motion between them each move the grave by the pointer's delta**, asserted both mid-field and with the grave pressed against an edge. Nothing else in this list calls `command` twice with movement in between, which is structurally the same blindness that hid the once-per-frame sampling defect from every test in the first draft: an instrument that cannot see the property it exists to check.
6. **Anti-windup.** After a drag whose target lies outside the field, so `containGrave` clamped the grave short, reversing the pointer by a small amount moves the grave immediately by that amount. Without conditional integration the grave would not move at all until the whole overshoot was repaid.
7. **Anti-windup does not eat the delta.** With the grave clamped against the bottom edge and the pointer moving sideways on every call, each command moves the grave by the full sideways delta and never by half of it. This is the re-anchor-to-the-previous-pointer rule in section 4.2, and re-anchoring to the current pointer instead gives 6, 0, 6, 0 where this asserts 6, 6, 6, 6.
8. Calling `move` twice with the same point produces the same command as calling it once, because `globalpointermove` is dispatched twice per DOM move on a static container with interactive children.
9. A second pointer down does not steer, and the steering pointer does not change.
10. A second pointer down sets the belch edge, `takeBelch()` returns true once, and a second call returns false.
11. **The #33 lesson.** The steering finger lifts while a second finger is down: the steering pointer clears, the grave stops rather than being steered by a finger that never crossed the slop, and the remaining pointer takes over only once it crosses `STEER_SLOP` from where it now is. The very next command does not jump the grave by the distance between the two fingers.
12. `cancelAll` clears the pointers, the anchor and the belch edge, which is what pause, blur and `pointercancel` all call.
13. An `up` for a pointer that was never down changes nothing.

### `src/input/steering.test.ts`

1. With no pointer steering, the keyboard command passes through unchanged.
2. With a pointer steering, the touch command wins and the keyboard command is ignored entirely, never summed.

### `src/game/advance.test.ts`

1. `advance` steps exactly `ticksFor` times for a given elapsed time, and the run's tick count matches.
2. **The touch overshoot.** With a `SteerSource` that recomputes from the grave each tick, an elapsed time worth two ticks lands the grave on the target and leaves it there. With one that returns a frame-constant position error, it lands on `2T - P`. The second is the defect this seam exists to make visible.
3. Events from every tick in the frame are returned, in order.
4. Zero elapsed time steps nothing and returns no events.

### `src/app/seedFromUrl.test.ts`

1. `?seed=1234` in the search pins that seed (ADR 0012).
2. `#/?seed=1234` after the route pins that seed (ADR 0012).
3. With both present the hash's query wins, because the hash is this app's navigation authority.
4. No seed anywhere gives null, and the run rolls fresh.
5. A non-numeric, negative, fractional or out-of-range seed gives null and warns, so a typo still yields a game.
6. `SEED_LIMIT - 1` is accepted and `SEED_LIMIT` is not, so every pinned seed is one the roll could have produced.
7. `?size=` pins a starting size in either URL form, accepts `SIZE_FLOOR` and `SIZE_CEILING` at the ends, and warns and gives null outside them.

### `src/app/routes.test.ts`, extended

1. `#/digest` resolves to the digest route.
2. `#/digest-old` does not, the same lookalike rule the prototype list already carries.
3. The existing route cases still hold.

### `src/app/screens/game/GraveRenderer.test.ts`

1. The mouth lands in the `graveMouth` layer and the rim in the `graveRim` layer, which is ADR 0014's order and the reason there are two.
2. The drawn width is `graveWidth(grave.size)` and the drawn height is twice the size, at the floor, at the start size and at the ceiling.
3. **The mouth stays a hole at `SIZE_FLOOR`.** The interior left by the rim is wider than a drop, and the stroke does not self-overlap. This is the instrument that survives a later retune of `SIZE_FLOOR` or `GRAVE_RIM_STROKE`, and the rendered check in verification step 4 cannot replace it.
4. The rim strokes inward, so the drawn outer edge equals `graveHitbox` exactly (ADR 0003).
5. Position follows `grave.x` and `grave.y`.
6. A sync at an unchanged size does not rebuild the geometry, and a sync at a changed size does.
7. `detach` then `attach` puts both pieces back, which is what `FieldLayers.clear()` between runs requires.

### `src/app/utils/userSettings.test.ts`

The module is `src/app/utils/userSettings.ts` and this repo puts a test beside its source.

1. `getKeyboardSpeed` defaults to 1 with nothing stored.
2. A value set is a value read back, so it persists (tracer plan section 5).
3. A stored value outside 0.75 to 1.5 is clamped on read, which covers both a hand-edited `localStorage` and a value written by an earlier build under the old range.
4. The slider's 15 to 30 range maps to 0.05 steps across 0.75 to 1.5.

### `src/app/palette.test.ts`, unchanged but load-bearing

Its source scan now covers the grave renderer. If it fails, the renderer reached a `MENU` colour, wrote a hex literal, or set a blend mode. Fix the renderer, never the scan.

### `src/game/digest.test.ts`, after the move

1. The digest still matches `GOLDEN`, now imported from `src/dev/digest.ts`. The constant does not change in this dispatch: nothing here touches a sim rule, so a digest that moves means something in 3b reached into the sim and that is a finding, not a paste.
2. The boundary assertions still hold, now against the extremes `runScenario()` returns.
3. Both recorded blindnesses stay written down in this file, and the three "wall" comments inherited from 3a are corrected to the field boundary.

### `src/boundary.test.ts`, unchanged but load-bearing

`src/input` reaching pixi, or `src/dev/digest.ts` reaching a bare package, fails here. That is the rule working. Fix the module, never the rule.

### `src/app/screens/screenLifecycle.test.ts`, extended

1. `GameScreen.reset()` removes every listener `prepare()` added: the key listeners, the blur listener and the canvas `pointercancel` listener. A pooled screen that accumulates one set per run is the leak this file exists to catch.
2. `update` is called with a ticker and the tick count matches the elapsed time, replacing the old no-argument call.
3. `prepare()` twice on the same pooled screen starts the second run with no pointers down, no keys held, and **no filters**, so neither the input models nor the pause blur leaks into the next run.

Note while extending the mock: its `press()` helper ignores the event type and fans out to every registered handler, so once keydown, keyup and blur are all registered an Escape press also calls `release(undefined)` and `releaseAll()`. Harmless, and worth knowing before you read a confusing failure.

## 6. What is deliberately not tested here, and why it matters

Say this in your report rather than leaving it implied.

The empty-field read is a floor, not a verdict. 3b answers "does uncapped relative drag steer sanely", not "does it feel right while diving under corpses through mob fire". The real read on `DRAG_RATIO` is the dispatch-5 play at tracer step 9.

`FOCUS_FACTOR` cannot be read at all in 3b. Focus exists to thread gaps and there are no gaps.

The drag ratio's dodging consequence cannot be read either. Thumb reach and occlusion read fine on an empty field; "can I get out of the way in time" does not.

## 7. How you work

- One vertical slice at a time: one test red, then the smallest implementation that makes it green, then the next. Never write the whole module and then the tests.
- Expected values come from the ADRs and this plan, not from running your own code and pasting the output. A test that asserts what the implementation already does is worth nothing.
- Small functions, each doing the one thing its name says. No IIFEs. Around forty lines is where splitting becomes the default.
- Comments: a JSDoc block on the declaration for anything that needs prose, `//` for a one-liner. Do not copy the comment style of whatever file you happen to be in. Never write a comment explaining code that is not there.
- No em dashes anywhere, in code, comments or your report. Comma, colon, parentheses, or two sentences.
- Use the vocabulary in `CONTEXT.md`. "Enemy" is banned; a hostile is a mob and its shots are mob fire. The grave swallows and passes under; it never drives. It presses against the field boundary; there are no walls, because the Wall is the Banshee's set piece.
- Assert every edit matched. A prettier rewrap made an exact-match edit silently miss in 3a, and a test was lost that way.
- Never weaken, skip or rewrite a test to reach green. If you think a test is wrong, that means the plan is wrong, and replanning is not yours: stop and report.
- Three strikes on the same wrong observed behaviour, then stop and report what you tried, what you saw, and your best guess. No fourth attempt.
- Do not commit anything and do not deploy. Leave the work in the tree. The deploy is verification step 5 and it waits for Mark.

End your report with each verification step from section 2 and its result. Name step 4 as an addition to the tracer plan's list and say why, and name steps 5, 6 and 7 as not yours to run and whose they are.

## 8. The on-device read-list, for verification step 6

This is Mark's, not yours. It is here so the dispatch ships with it rather than leaving him to invent one.

Reads well on an empty field:

- Does the grave track the thumb with no lag, at a steady frame rate and while the phone is struggling.
- Anchor the thumb directly on the grave, then well away from it. Does either feel wrong.
- A panic reverse: slide left, then stab right without releasing. Opposed keys cancel to zero on the keyboard and this is the touch analogue.
- Press against each field edge, then reverse. Anything that feels like a dead zone is the windup fix failing.
- Lift your thumb mid-run and put it back down somewhere else, several times quickly. This is the clutch, it is where `STEER_SLOP` is actually felt, and at ratio 1 it happens constantly.
- Open the pause menu with the button and with Escape. Resume from it, visit Settings and come back, and check that a drag anchored up in the top gutter does not fight the button.
- With `?size=18` and `?size=67.5`, does steering feel like the same game at both ends of the grave's range.

Keyboard only, because they are structurally blind on touch:

- Is two seconds to cross the field right. That is `BASE_SPEED`, and ADR 0011 makes touch uncapped, so on a phone the crossing time is the thumb's and `BASE_SPEED` never gates it.
- Is a diagonal not faster than a cardinal. Normalization lives only in `KeySteer`; the touch command is a position error and is normalized nowhere.
- Does the speed slider land anywhere other than 1.0x. Note before reading it: the slider is linear in speed, so the 1.0 default sits at a third of the travel rather than the middle. If everything above 1.0 feels right, suspect the handle position before the number.

Blind, so a note from this read should not be acted on:

- Focus. There are no gaps to thread.
- Whether `DRAG_RATIO` lets you dodge in time. There is nothing to dodge.
- Anything about the belch. It is wired but consumes nothing.

## 9. Carried forward, not this dispatch

Do not act on these. They are here so the next planner does not rediscover them.

- **`hitGrave` is the single entry point for every kind of damage.** Dispatch 4's mob contact (ADR 0016) routes through it rather than shrinking the grave itself, so the invulnerability window, the ladder and the events stay in one place.
- **Dispatch 4's hit-taking bot policy must start from a grown grave.** Size as health stops reading above roughly size 40, because a hit at the ceiling moves the half-height by 4.4 percent. A bot that starts fresh measures the three-hit opening and reports on a regime the player spends twenty seconds in.
- **`graveRim` measures APCA Lc 0.00 against `corpse`, `feast`, `drop` and `mob`, all four**, verified in-tree over the landed palette. ADR 0014 requires the rim to read above the food layer even under a pile, and the palette's sprite-separation test uses a 2.0-luma threshold against gaps of 2.2 to 2.9, so it passes and is structurally blind to this. The field is empty in 3b so nothing can be checked yet. Trigger: dispatch 4, when food goes under the rim.
- **`GRAVE_ASPECT` silently sets the Undertaker's difficulty.** His curtain gap is grave width plus a margin, and aspect 2 gives the narrowest width for a given size, so a shallower aspect means an easier boss.
- **The belch firing on any second pointer is a misfire risk on the scarcest thing in the game.** ADR 0008 makes it fire only at a full reservoir, so a resting or brushing finger spends a whole run's saving. Second-finger-as-bomb is well precedented and is Bullet Hell Monday's default, and no documented case of accidental discharge in a mobile shmup was found, so this is a risk and not a defect. What the record does show is that every serious mobile shmup ships the binding as a choice: Bullet Hell Monday offers two-finger tap, button or double tap, Aka to Blue offers multitap or double tap, and DoDonPachi Resurrection on iOS uses a placeable on-screen button. BOSSGAME's developer states the principle, that on a phone fingers slide over buttons with no resistance, so high-commitment actions want hold-and-release. Trigger: dispatch 5, when `belch.ts` consumes the edge.
- **`DRAG_RATIO` is the input-parity and occlusion dial, not a feel nicety.** Touch is bounded by thumb speed and not by `BASE_SPEED`, so at ratio 1 a touch player reaches a given point roughly an order of magnitude faster than a keyboard player. ADR 0011 accepts that deliberately, but the consequence needs writing down: dodge windows have to be authored against the slower input, most sharply for the Undertaker, whose curtain gap is grave width plus a margin. Espgaluda II's iOS port is the cautionary precedent, where relative touch erased per-character speed differentiation entirely because the speed became the finger's. Note also that relative drag only breaks occlusion if the player anchors away from the grave, since the offset never changes after pointer-down; what actually breaks occlusion is a ratio above 1, which is the recorded reason players are advised to raise Bullet Hell Monday's sensitivity. Casiez et al. is the frame for why this wants a slider rather than a bolder default: control-display gain performance is U-shaped, and gain above 1 cuts clutching but degrades target acquisition. Trigger: dispatch 6 for the Undertaker, dispatch 7 for tuning.
- **The bled score does not scatter as swallowable scraps.** Parked by Mark on 2026-08-20, not refused. The trigger to revisit is the #31 playtest's spiral-versus-comeback read. Do not re-raise before then.
- **The digest is blind in two ways**, both written into `digest.test.ts` and one of them now printed on the digest screen. Nothing on its path calls `math.ts`, so a green digest is not determinism verified, and later dispatches must extend the scenario as they add approximated operations.
- **The `no-restricted-properties` fence over `src/input` matters from dispatch 7**, when the autopilot drives the sim through an input model. Live human input is never deterministic, so the fence buys nothing today and costs nothing to add now.
- **Nothing owns retiring the corner readouts.** FPS, DEBT, TICK and the seed are all unconditional, and v1's done-line is a game playable start to finish. #38 is the trigger, and this is the document that says so.
- **`user-scalable=no` in `index.html` is dead configuration that fails a WCAG level.** Raised by CodeRabbit on this plan's first draft and by no gate. SC 1.4.4 Resize Text treats blocking zoom as a failure, and the meta tag carries `maximum-scale=1.0, user-scalable=no` from ticket #33. Verified before recording: it buys nothing. iOS Safari has ignored `user-scalable=no` since iOS 10, `touch-action: none` on `body` already stops the pinch gesture reaching the browser on Android, and the page is one full-bleed canvas with no reflowable text for zoom to help. So it is redundant rather than harmful, but it is still a standard failing on a public build and it is one line. Trigger: #38, which owns the dressing and is the natural place for an accessibility sweep.
- **The pause menu's `BlurFilter` is load-bearing and #38 must not strip it as dressing.** A pause menu in a score game normally opens a "pause and read the curtain" line, and the blur is what closes it. It arrived as create-pixi template behaviour that nobody chose, which is exactly how such things get deleted in a dressing pass.
- **End Run wants a confirm and Resume wants a countdown, and both are free today.** Ending a run is destructive and non-undoable, which is the textbook case for a one-question confirm defaulting to the safe option; trigger is dispatch 5, when there is a score to lose. Touch action games commonly gate resume behind a 3-2-1 countdown so the player is not dropped back into danger before their thumb is down, and the cost is doubled here because `pause()` calls `cancelAll()`, so resume drops you in with no anchor and a full `STEER_SLOP` crossing before anything moves; trigger is dispatch 4, when something can kill you.
- **The gutter invariant fails as the viewport aspect approaches the field's.** At 820 by 1180 the gutter is 13 CSS pixels and the readout stack and pause button sit over the field's top edge. Empty field, so harmless now. Trigger: dispatch 4, when mob fire comes down that lane.
- **The `VolumeSlider` to `SettingSlider` rename is creep by the letter.** It delivers nothing a player can reach and the file belongs to #38 by this plan's own fencing. It stands anyway, because shipping a keyboard-speed slider inside a class named `VolumeSlider` is a lie in the code and the rename is four mechanical files. Recorded so it is not re-argued.
- **The title screen's tagline has never been checked by eye on a phone.** "Swallow the dead. Feed the grave." is a longer string at the same 16px. Check its size and position during the dispatch-5 play.
