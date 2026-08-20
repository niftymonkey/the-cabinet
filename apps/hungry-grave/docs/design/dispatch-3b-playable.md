# Tracer dispatch 3b: making it playable

This is the plan half of the feature playbook's dispatch contract for tracer plan section 6 item 3, which Mark split in two on 2026-08-20: 3a was the headless sim, and 3b is the app wiring that makes it playable and ends at his on-device input check. The split reason is on the tracer plan.

3a landed the rules and verified them by test. Nothing here is a new rule. Everything here is wiring, one renderer, two input models, and the first thing a player can actually do.

You are writing production code in `/home/mlo/dev/niftymonkey/the-cabinet/apps/hungry-grave`.

Read `docs/agents/feature-playbook.md` at the repo root first and follow it. This prompt is the plan half of its dispatch contract; you execute.

Read these before you write anything: `apps/hungry-grave/docs/adr/0011-each-input-owns-its-speed.md`, `apps/hungry-grave/docs/adr/0012-fresh-seed-per-run.md`, `apps/hungry-grave/docs/adr/0003-size-is-health.md`, `apps/hungry-grave/docs/adr/0009-creation-web-template-base.md`, `apps/hungry-grave/docs/adr/0014-readability-layering.md`, `apps/hungry-grave/docs/adr/0015-determinism-across-devices.md`, `apps/hungry-grave/docs/design/tracer-plan.md` section 3 and section 5, `apps/hungry-grave/docs/design/dispatch-3a-sim-core.md` sections 4 and 6, and `apps/hungry-grave/CONTEXT.md` for the vocabulary.

**Never open `src/prototypes/` at all.** Not to read, not to copy, not to check. Everything you need is in this prompt and the docs above.

## 1. The thing, in observable terms

The grave becomes a thing on screen that a person steers, on a keyboard and on a phone, running on the fixed clock 3a built.

When it works:

- A grave is drawn in the field, at the size the sim says, and it moves where the player steers it.
- The sim advances on `clock.ts` and not on the frame, so a 144 Hz display and a 60 Hz display play the same game.
- Keyboard steering is normalized, so a diagonal is not faster than a cardinal, and holding the focus key halves the speed for fine dodging.
- Touch steering is a relative drag that lands the grave on the drag target every tick and is deliberately uncapped, and lifting the steering finger while a second finger is down never leaves a stale drag target.
- `?seed=` pins the run in either URL form, and a run without one rolls fresh dice.
- A tick-debt readout sits under the frame-rate readout, and backgrounding the tab does not make it lie.
- A dev route prints the golden digest in the browser, so ADR 0015's cross-engine claim can be checked on a phone rather than assumed until dispatch 7.
- The build is deployed and Mark has steered the grave on his own device.

## 2. Verification steps, with actors

1. Every planned test in section 5 written and green. Actor: you.
2. `pnpm lint`, `pnpm typecheck`, and `pnpm build`, all clean. `vitest` alone is not enough: three dispatches have now shipped prettier errors that only `pnpm lint` sees. Actor: you.
3. The sim invariant harness runs on every step in every sim test, per ADR 0013. Unchanged from 3a and not yours to weaken. Actor: you.
4. A rendered check of the built app via `vite preview`, screenshots actually read: the grave is visible in the field, the seed is visible, the tick and tick-debt readouts are visible, the grave moves under arrow keys, the digest route at `#/digest` prints a digest and its verdict, and the prototype list at `#/prototypes` is intact. Actor: you.

   This step is an addition to the tracer plan's list, which runs the rendered check at dispatches 1, 2, 6 and 7 and not here. It is added because 3b draws the first player-visible field content since dispatch 2, and a grave that never appears would otherwise be caught first by Mark on his phone. Say in your report that you added it and why.

5. Deploy to production, following `apps/hungry-grave/docs/deploy.md` exactly. Do not re-derive the recipe and do not reach for `-e` flags. Actor: you, **after** Mark says yes. Stop and ask.
6. The on-device input check, tracer plan verification step 7: steering the grave around an otherwise empty field from the deployed URL. The playbook makes this escalation mandatory for input-feel changes. Actor: Mark.
7. Whether any tuning number feels right is a human call after playing. Never claim a number is right. Actor: Mark.

## 3. The seams under test

- `KeySteer` in `src/input/keys.ts`: `press(code)`, `release(code)`, `releaseAll()`, `command()`.
- `TouchSteer` in `src/input/touch.ts`: `down(id, point)`, `move(id, point)`, `up(id)`, `cancelAll()`, `command(grave)`, `takeBelch()`.
- `seedFromUrl(search, hash)` in `src/app/seedFromUrl.ts`.
- `resolveRoute(hash)` in `src/app/routes.ts`, gaining one route.
- `runScenario()` and `GOLDEN` in `src/dev/digest.ts`, moved out of the test.
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
  /** The persisted player speed setting, 0.5 to 2.0 (ADR 0011). */
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

Normalize by dividing both components by `Math.sqrt(x * x + y * y)` when that length exceeds 1. `Math.sqrt` is exactly specified in ECMAScript, unlike `Math.hypot`, so this needs no rounding gate and must not reach for `math.ts`.

Opposed keys cancel: holding left and right at once is zero on that axis, not left-wins. This is the only reading that survives a player rolling their hand across a keyboard.

The order is: sum the held directions, normalize, then multiply by the speed setting, then halve if focus is held. Focus multiplies by `FOCUS_FACTOR`, declared in this file as `0.5`, matching the test list's "focus halves keyboard speed while held".

`releaseAll` exists because a window that loses focus never delivers the `keyup`. Without it, alt-tabbing while holding a direction leaves the grave driving into a wall forever, and the player has no way to stop it.

**The multiplier is a value handed in, never read from storage here.** Storage lives in `src/app/utils/userSettings.ts` and `src/input` cannot reach it. Clamp what you are given to 0.5 through 2.0 anyway, because a hand-edited `localStorage` value is a real input.

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
  command(grave: FieldPoint): MoveCommand;
  takeBelch(): boolean;
}
```

**Relative drag, not absolute.** The steering finger anchors where it went down, along with where the grave was at that moment. The drag target is `graveAtAnchor + (current - anchor) * DRAG_RATIO`. Relative is the right model on a phone because the finger is not on top of the grave, so the player's own hand never occludes the thing being steered, and because an absolute model teleports the grave to wherever a finger first lands.

`DRAG_RATIO` is declared in this file as `1`, a one to one drag. It is a first pass and the tuning dispatch owns it. Say so in its comment.

**The command lands the grave on the target every tick, and is deliberately uncapped.** Return `(target - grave) / BASE_SPEED`, so `moveGrave` multiplies it back out and arrives exactly. ADR 0011 records that capping the touch drag at keyboard speed for fairness **was** the input lag felt on device, so no clamp goes here and none goes in `moveGrave`. Write that reason in the code, not just here.

**The steering finger is the oldest pointer down.** A second finger is the belch and never steers.

**The stale drag target is the #33 lesson and is a pinned spec test.** When the steering finger lifts while another finger is still down, the drag hands off to the oldest remaining pointer, re-anchored at that pointer's current position and the grave's current position. It never keeps the lifted finger's anchor, because that anchor would snap the grave by the whole distance between the two fingers on the very next tick.

**The belch is edge-triggered and unconsumed in this dispatch.** A `down` for a pointer while one is already down sets the belch edge; `takeBelch()` returns true once and clears it. `belch.ts` arrives in dispatch 5 and will consume it. It is built here rather than deferred because the stale-drag-target rule only exists in the presence of a second finger, and a two-finger rule with no second finger in the code is a rule nothing exercises.

`cancelAll` clears every pointer, the anchor and the belch edge. The pause popup calls it, per the test list's "pause cancels touch".

With no pointer down, `command` returns `{ x: 0, y: 0 }`.

### 4.3 `src/app/seedFromUrl.ts`, `?seed=` in both forms

A pure function over two strings, so it is testable without a browser.

```ts
export function seedFromUrl(search: string, hash: string): number | null;
```

ADR 0012 pins a run from `?seed=` before the hash or after the route, and treats the two forms as equal. They are not equal when both are present, so this plan rules it: **the hash's query wins.** The hash is this app's single navigation authority, stated in `routes.ts`, and it is the part that changes without a reload. A stale `?seed=` left in the search would otherwise silently override a fresh seed an in-app link had just written.

Accept a seed that the roll itself could have produced: a whole number, zero or greater, below `SEED_LIMIT`. Export `SEED_LIMIT` from `src/game/run.ts` for this; it is currently a private constant there. Anything else is ignored, with one `console.warn` naming the value, and the run rolls fresh: a playtester who fat-fingers a seed should still get a game rather than a blank screen.

`GameScreen.prepare()` reads it as `createRun(seedFromUrl(location.search, location.hash) ?? undefined)`. Pass `undefined` and not `null`, because `createRun`'s default parameter is what rolls.

A pinned seed stays pinned across a restart while the URL holds it. That is the point of pinning and it is not a conflict with ADR 0012's fresh dice, which govern a run with no seed in the URL.

### 4.4 `src/app/screens/game/GraveRenderer.ts`, the grave on screen

The first field content on screen. Render only: it reads a `Grave` and draws it, and holds no rules.

**Two Graphics in two different layers, not one.** ADR 0014's stack puts `graveMouth` beneath the food layers and `graveRim` above them, because the hole's interior must sit under whatever is falling into it while the rim stays legible over the top. One Graphics cannot be in two layers, so the renderer owns two and syncs both.

- The mouth: a rounded rectangle filled `PALETTE.graveHole`, in the `graveMouth` layer.
- The rim: the same rounded rectangle stroked `PALETTE.graveRim`, in the `graveRim` layer.

Geometry comes from the sim and nowhere else: half-height is `grave.size`, width is `graveWidth(grave.size)`. Do not re-derive the width from the aspect here; that is `grave.ts`'s and there must be one derivation.

`GRAVE_CORNER_RATIO` is declared in this file as `0.2` of the width. It is a render property and not a sim number, so it stays out of `tuning.ts`. Above roughly a third it stops reading as a rectangle at all and becomes a capsule, and at the size floor on a phone the whole grave is about 13 CSS pixels across, which is where that misreading would land first.

`GRAVE_RIM_STROKE` is declared here in field units and sized by the same argument that fixed `BOUNDARY_STROKE` at 8 in `layout.ts`: APCA grants its Lc 30 level to solid non-text no thinner than 5.5 rendered pixels, and a phone shows the field at about 0.72 CSS pixels per field unit. Read `BOUNDARY_STROKE`'s JSDoc and follow the same reasoning to a number. State the number you chose and why in your report.

**Redraw only when the size changes; move every tick.** Position is a container transform and is free. Rebuilding the rounded-rect geometry every frame is not, and the size only changes on a swallow or a hit. Hold the last drawn size and compare.

`detach()` removes both Graphics from their layers. `FieldLayers.clear()` empties every layer between runs, so the renderer must be able to put itself back rather than assume it is still attached, exactly as `GameScreen` already does with its boundary frame.

### 4.5 `src/app/screens/game/GameScreen.ts`, rewired

The changes, each with its reason.

**The clock replaces one tick per frame.** `update(ticker)` calls `ticksFor(this.clock, ticker.elapsedMS)` and steps that many times. **`elapsedMS`, never `deltaMS`**: Pixi assigns the raw gap to `elapsedMS` and clamps only `deltaMS` to its `_maxElapsedMS` of 100, so feeding `deltaMS` makes `clock.ts`'s own clamp unreachable, pins `debtTicks` at zero forever, and lets a change to the ticker's speed silently rescale the sim. `clock.ts` says this in its own header; the `update()` JSDoc that calls the current behaviour a placeholder comes out with the placeholder.

**One input sample per frame, applied to every tick in that frame.** Sample the command once, before the loop. Sampling inside the loop reads the same held keys several times and changes nothing; recomputing the touch command inside the loop is worse, because the drag target is relative to the grave's current position and would then chase itself.

**`createClock()` in `prepare()`.** A pooled screen must not inherit the previous run's remainder or its debt.

**`resetClock` on `visibilitychange`.** Register in `prepare()`, remove in `reset()`, or a pooled screen accumulates one listener per run. Without this, `ticksFor` receives the whole backgrounded gap as raw elapsed time and dumps it into `debtTicks`, so one tab switch reads as a struggling phone and the tick-debt readout becomes a lie about the thing it exists to measure.

`visibilitychange` fires on `document` and not on `window`. `src/app/screens/screenLifecycle.test.ts` stubs `window` because node has neither, so it needs a matching `document` stub, and `window.location` with an empty `search` and `hash` for the seed read. Extend that stub; do not work around it by having the screen skip the listener when `document` is missing, which would make the test pass while proving nothing.

**Pointer wiring.** Set `eventMode = "static"` on the screen and give it a `hitArea` covering the whole stage, refreshed in `resize`, so a drag that starts outside the letterboxed field still steers. Use `pointerdown`, `globalpointermove`, `pointerup`, `pointerupoutside` and `pointercancel`. Convert `event.global` with `screenToField(this.placement, ...)` using the **held** placement. **Never call `fitField` again at event time**: that computes the placement a second time in parallel with the one the field container is actually wearing, and the two agree only until something moves one of them. The field's own JSDoc already says this; do not break it.

**Screen shake, if it is ever added, goes on a child of `this.field` and never on `this.field` itself.** The comment saying so is already on the field. Leave it there and do not add shake in this dispatch.

**Keyboard wiring.** `window` `keydown` and `keyup` feeding `KeySteer.press` and `release` by `event.code`, plus `blur` feeding `releaseAll`. Call `preventDefault` for the arrow codes so the page does not scroll under the game. All listeners are added in `prepare()` and removed in `reset()`. `Escape` still ends the run through the existing `bindKeyPress`.

**The tick-debt readout.** A monospace `Label` reading `DEBT ${clock.debtTicks}`, in `PALETTE.hudDim`, directly under the frame-rate readout. Export `METER_MARGIN` and `METER_LINE_HEIGHT` from `src/app/FpsMeter.ts` and position from those two, so the corner geometry has one declaration and the two readouts cannot drift apart. It reads zero rather than hiding at zero: an absent readout and a healthy one look the same, and this is the only readout that separates "the game feels slow" from "we blew the frame budget" on a phone. Update it only when the number changes, as `FpsMeter` already does with its own.

**The seed comes from the URL.** Section 4.3.

**Events stay unconsumed.** `step` returns `SimEvent[]` and nothing in 3b produces one, because nothing yet damages or feeds the grave. Do not invent a consumer and do not swallow the array into a variable nobody reads; take the return value and drop it with a `//` comment naming dispatch 4 as the first producer.

### 4.6 `src/dev/digest.ts` and the `#/digest` route

**Move the scenario, the digest shape and `GOLDEN` out of `src/game/digest.test.ts` into `src/dev/digest.ts`.** Move the never-update warning with `GOLDEN`; the constant and the warning must never be in different files. The test then imports both and keeps only its own assertion and its two recorded blindnesses. `src/dev` may reach `src/game` and imports no bare packages, so the module stays pixi-free and a screen can use it.

**Why this route exists.** ADR 0015's whole claim is cross-engine, and CI and the developer's machine are the same Node. Without a browser that runs the digest, the claim goes unchecked until dispatch 7. 3b already deploys, so this makes the check "open the URL on a phone and compare one word".

`routes.ts` gains `{ kind: "digest" }` at `#/digest`, matched exactly the way `PROTOTYPES_HASH` is: the hash itself, or the hash followed by `/` or `?`, so `#/digest-old` is not it.

`src/app/screens/DigestScreen.ts` shows the verdict as one large word, `MATCH` or `DIVERGED`, then the digest as text, then a back button to the title. It lives under `src/app/screens` and not under `src/app/screens/game`, so it is outside the palette source scan and may use `MENU` colours: it never draws while a field is live.

A digest that diverges is a real finding on that device, not a test failure. The screen names the fields that differ, because a phone shows no console.

### 4.7 The persisted keyboard speed setting

ADR 0011 makes the keyboard multiplier a player setting from 0.5x to 2.0x, persisted. Storage already exists and already has the right failure behaviour: `src/engine/utils/storage.ts` guards every read and write and warns once through `warnOnce`, so blocked storage in a private-mode browser is a console warning and never a state the game branches on. Do not add a state for it and do not re-fix that path.

- `userSettings` gains `getKeyboardSpeed()` and `setKeyboardSpeed(value)`, keyed `keyboard-speed`, defaulting to `1`, clamped to 0.5 through 2.0 on read as well as on write. A stored value from a hand-edited `localStorage` is a real input.
- `SettingsPopup` gains a "Keyboard Speed" slider beside the three volume sliders, because that is where every persisted setting in this app already lives.
- **Rename `src/app/ui/VolumeSlider.ts` to `src/app/ui/SettingSlider.ts`, class and all**, and update its three existing call sites. It already takes a label, a min, a max and a value, so it needs no redesign; only its name is now a lie. This is a rename and not a rework: leave its template colours alone, because #38 dresses the shared widgets.
- The slider runs 5 to 20 and the setting is `Math.round(value) / 10`, which gives the 0.1 steps the test list names on a control that is continuous.

### 4.8 The lint rule covers `src/input` too

`apps/hungry-grave/eslint.config.mjs` restricts the approximated `Math` operations and `Math.random` under `src/game/**` only. Add `src/input/**` to that same block.

Input is the sim's only external input, so an approximated operation there diverges a run exactly as one inside `src/game` would, and the golden digest cannot see it: the digest scripts move commands directly and never runs an input model. This is one glob, and it closes the only path into the sim that the determinism work left open.

Nothing in this dispatch trips it. Normalization divides by `Math.sqrt`, which is required to be correctly rounded and is deliberately absent from ADR 0015's approximated list, unlike `Math.hypot`, which is on it.

Verify the rule fires on the new folder the same way 3a did: write a line under `src/input` that should trip it, run `pnpm lint`, see it fail, then delete the line.

### 4.9 One record edit, in this dispatch

`docs/design/tracer-plan.md` section 6 item 3 describes 3b in one line and names no plan document, while 3a's bullet carries `Plan: docs/design/dispatch-3a-sim-core.md`. Add the matching pointer to this file on 3b's bullet.

## 5. The planned test list

Pin every one of these as a named `test.todo` on a stub before you implement anything, per the playbook. Every test cites what it enforces in its name or a comment.

### `src/input/keys.test.ts`

1. A single held direction gives a unit command on that axis and zero on the other.
2. Two held directions give a command whose length is 1 and not 1.414, so a diagonal is not faster than a cardinal (ADR 0011). This assertion lives here and not in `grave.test.ts`, because `moveGrave` applies the command as given by design.
3. Opposed keys on one axis cancel to zero on that axis.
4. Both `KeyW` and `ArrowUp` steer up, and an unrecognized code changes nothing.
5. Holding focus halves the command's length, and releasing it restores it.
6. The multiplier scales the command's length, and a multiplier outside 0.5 to 2.0 is clamped into it.
7. `releaseAll` zeroes the command with keys still notionally held, which is the window-blur case: without it a lost `keyup` drives the grave into a wall for the rest of the run.
8. Focus and the multiplier compose: 2.0x with focus held is 1.0x.

### `src/input/touch.test.ts`

1. With no pointer down the command is zero.
2. A drag of d field units from the anchor produces a command that lands the grave exactly `d * DRAG_RATIO` from where it was at the anchor, in one tick, once multiplied by `BASE_SPEED` (ADR 0011).
3. The command is uncapped: a drag ten times the field's width in one move still lands on the target in one tick, and nothing clamps it (ADR 0011's recorded reason).
4. A second pointer down does not steer, and the steering pointer stays the oldest one.
5. A second pointer down sets the belch edge, `takeBelch()` returns true once, and a second call returns false.
6. **The #33 lesson.** The steering finger lifts while a second finger is down: the drag hands off to the remaining pointer re-anchored at its current position, and the very next command does not jump the grave by the distance between the two fingers.
7. `cancelAll` clears the pointers, the anchor and the belch edge, which is what the pause popup calls.
8. An `up` for a pointer that was never down changes nothing.

### `src/app/seedFromUrl.test.ts`

1. `?seed=1234` in the search pins that seed (ADR 0012).
2. `#/?seed=1234` after the route pins that seed (ADR 0012).
3. With both present the hash's query wins, because the hash is this app's navigation authority.
4. No seed anywhere gives null, and the run rolls fresh.
5. A non-numeric, negative, fractional or out-of-range seed gives null and warns, so a typo still yields a game.
6. `SEED_LIMIT - 1` is accepted and `SEED_LIMIT` is not, so every pinned seed is one the roll could have produced.

### `src/app/routes.test.ts`, extended

1. `#/digest` resolves to the digest route.
2. `#/digest-old` does not, the same lookalike rule the prototype list already carries.
3. The existing route cases still hold.

### `src/app/screens/game/GraveRenderer.test.ts`

1. The mouth lands in the `graveMouth` layer and the rim in the `graveRim` layer, which is ADR 0014's order and the reason there are two.
2. The drawn width is `graveWidth(grave.size)` and the drawn height is twice the size, at the floor, at the start size and at the ceiling.
3. Position follows `grave.x` and `grave.y`.
4. A sync at an unchanged size does not rebuild the geometry, and a sync at a changed size does.
5. `detach` then `attach` puts both pieces back, which is what `FieldLayers.clear()` between runs requires.

### `src/app/palette.test.ts`, unchanged but load-bearing

Its source scan now covers the grave renderer. If it fails, the renderer reached a `MENU` colour, wrote a hex literal, or set a blend mode. Fix the renderer, never the scan.

### `src/game/digest.test.ts`, after the move

1. The digest still matches `GOLDEN`, now imported from `src/dev/digest.ts`. The constant does not change in this dispatch: nothing here touches a sim rule, so a digest that moves means something in 3b reached into the sim and that is a finding, not a paste.
2. Both recorded blindnesses stay written down in this file.

### `src/boundary.test.ts`, unchanged but load-bearing

`src/input` reaching pixi, or `src/dev/digest.ts` reaching a bare package, fails here. That is the rule working. Fix the module, never the rule.

### `src/app/screens/screenLifecycle.test.ts`, extended

1. `GameScreen.reset()` removes every listener `prepare()` added: the key listeners, the blur listener and the `visibilitychange` listener. A pooled screen that accumulates one set per run is the leak this file exists to catch.

## 6. Carried forward, not this dispatch

Do not act on these. They are here so the next planner does not rediscover them.

- **`hitGrave` is the single entry point for every kind of damage.** Dispatch 4's mob contact (ADR 0016) routes through it rather than shrinking the grave itself, so the invulnerability window, the ladder and the events stay in one place.
- **Dispatch 4's hit-taking bot policy must start from a grown grave.** Size as health stops reading above roughly size 40, because a hit at the ceiling moves the half-height by 4.4 percent. A bot that starts fresh measures the three-hit opening and reports on a regime the player spends twenty seconds in.
- **`GRAVE_ASPECT` silently sets the Undertaker's difficulty.** His curtain gap is grave width plus a margin, and aspect 2 gives the narrowest width for a given size, so a shallower aspect means an easier boss.
- **The bled score does not scatter as swallowable scraps.** Parked by Mark on 2026-08-20, not refused. The trigger to revisit is the #31 playtest's spiral-versus-comeback read. Do not re-raise before then.
- **The digest is blind in two ways**, both written into `digest.test.ts`. Nothing on its path calls `math.ts`, so a green digest is not determinism verified, and later dispatches must extend the scenario as they add approximated operations.
- **The title screen's tagline has never been checked by eye on a phone.** "Swallow the dead. Feed the grave." is a longer string at the same 16px. Check its size and position during the dispatch-5 play.

## 7. How you work

- One vertical slice at a time: one test red, then the smallest implementation that makes it green, then the next. Never write the whole module and then the tests.
- Expected values come from the ADRs and this plan, not from running your own code and pasting the output. A test that asserts what the implementation already does is worth nothing.
- Small functions, each doing the one thing its name says. No IIFEs. Around forty lines is where splitting becomes the default.
- Comments: a JSDoc block on the declaration for anything that needs prose, `//` for a one-liner. Do not copy the comment style of whatever file you happen to be in. Never write a comment explaining code that is not there.
- No em dashes anywhere, in code, comments or your report. Comma, colon, parentheses, or two sentences.
- Use the vocabulary in `CONTEXT.md`. "Enemy" is banned; a hostile is a mob and its shots are mob fire. The grave swallows and passes under; it never drives.
- Assert every edit matched. A prettier rewrap made an exact-match edit silently miss in 3a, and a test was lost that way.
- Never weaken, skip or rewrite a test to reach green. If you think a test is wrong, that means the plan is wrong, and replanning is not yours: stop and report.
- Three strikes on the same wrong observed behaviour, then stop and report what you tried, what you saw, and your best guess. No fourth attempt.
- Do not commit anything and do not deploy. Leave the work in the tree. The deploy is verification step 5 and it waits for Mark.

End your report with each verification step from section 2 and its result. Name step 4 as an addition to the tracer plan's list and say why, and name steps 5, 6 and 7 as not yours to run and whose they are.
