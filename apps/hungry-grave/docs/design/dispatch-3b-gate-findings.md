# Dispatch 3b gate findings, 2026-08-20

Raw findings from the review gates on `dispatch-3b-playable.md`, held here until they are folded into the plan.

Delete this file once every item below is folded in or recorded as declined, the way the 3a findings file was.

Gates fired: product vision (complete), tech architecture (complete), game design (still running when this file was written).

Two claims were verified in the main thread rather than trusted, and both held: Pixi 8.19.0 registers no `pointercancel` DOM listener and no `EventBoundary` mapping for it, and `src/engine/engine.ts` already owns a `document` `visibilitychange` listener that routes to optional `blur()` and `focus()` hooks on the current screen.

## Mark's own ruling, 2026-08-20, which supersedes part of both reports

The END RUN button must not be reachable while playing at all. Placement was the smaller half of the problem.

- Escape opens a pause menu; the menu holds End Run. Escape stops ending the run directly.
- A pause button in the top-right corner of the stage, outside the field, opens the same menu. Top because a phone in portrait puts both thumbs at the bottom, right because `FpsMeter` owns the top-left.
- The menu pauses the sim while it is up and calls `cancelAll` on the touch model, so a drag does not resume mid-flight. This gives the `cancelAll` call the real caller both gates found it was missing.
- The TICK readout comes off the play area for the same reason, since it sits at 46% of the field height.
- `PausePopup` already exists in the template with no call site. This is its first real caller.

Provenance of the button, since no design document ever mentioned it: it arrived with the dispatch-1 shell commit `0a0d4e8f1d` as scaffolding, because that shell's stub sim could never end a run and a button was the only way to reach the End screen. It then survived three dispatches because nothing had been drawn on the field yet.

## Tech architecture gate, standard depth

Verified every Pixi claim against the installed `pixi.js@8.19.0` source rather than from memory.

Judged not to apply, with reasons: save identity and versioned envelopes (3b persists one scalar that is not run state), persistence failure states (settled in `storage.ts` and correctly left alone), RNG saveability (no mid-run draw added, cursors already ship from 3a), telemetry and new dependencies (none), collision, balance, stage and meta (no field content in 3b).

### DECIDE-NOW 1. One touch sample applied to every tick overshoots

The touch command is a position delta, not a velocity, and it is not repeatable. With the grave at P and the target at T, tick one lands on T and tick two applies the same command again and lands on `2T - P`. On a 30 Hz frame a 100-unit drag moves the grave 200 units, 37 percent of the field's width, in one frame.

The plan's stated reason for sampling once contradicts its own section 4.2. It says the target would "chase itself", but 4.2 anchors the target to `graveAtAnchor`, not to the grave's current position, so both the anchor and the pointer position are frame constants and recomputing per tick gives zero on tick two. It converges rather than chasing.

The signatures already carry the tell: `KeySteer.command()` takes nothing and `TouchSteer.command(grave)` takes the grave. The keyboard is a true velocity and is unaffected, which is why this survives every planned test and appears only on the phone.

### DECIDE-NOW 2. `resetClock` on `visibilitychange` does not do what the plan says

`resetClock` sets `remainderMs = 0` and nothing else. The backgrounded gap does not live in the remainder, it lives in Pixi's `Ticker.lastTime`, which no game-side call can reach. `Ticker.update` computes `elapsedMS = currentTime - this.lastTime` and `lastTime` is not updated while rAF is paused, so the first frame back hands `ticksFor` the whole gap. A 30-second tab switch adds `floor((30000 - 250) / 16.667) = 1785` to `debtTicks`, and the readout then reads DEBT 1785 forever, which is precisely the lie the handler was supposed to prevent.

The fix is a skipped first frame after visibility returns, not a remainder reset.

`src/engine/engine.ts` already owns a `document` `visibilitychange` listener routed through `navigation.blur()` and `focus()`, and `navigation.ts` declares both as optional screen hooks. A `blur()`/`focus()` pair on `GameScreen` needs no listener at all and cannot leak on a pooled screen. For the record, `visibilitychange` does bubble from Document to Window, so the plan's listener target was not wrong; the duplicate listener is.

### DECIDE-NOW 3. `pointercancel` is dead code in Pixi v8

`EventSystem._addEvents` attaches pointermove on document, pointerdown/pointerleave/pointerover on the canvas, pointerup on window, and wheel. No pointercancel, no touchcancel. `EventBoundary`'s mapping table registers pointerdown, pointermove, pointerout, pointerleave, pointerover, pointerup, pointerupoutside and wheel, with no `pointercancel` entry, so even a hand-fed event would warn "Event mapping not defined". The only occurrence in the package is a name in the `TOUCH_TO_POINTER` table.

When iOS takes over a gesture (edge swipe, palm rejection, an incoming call) it fires pointercancel and then sends no pointerup. `TouchSteer` keeps that pointer down forever, holding a stale drag target the grave parks on and cannot leave. That is the #33 failure class arriving through the one event the plan wired to prevent it.

Covering it needs a DOM `pointercancel` listener on the canvas, kept inside `src/app` like the rest of the pixi wiring.

### DECIDE-NOW 4. The rim stroke derivation destroys the grave at its size floor

Following `BOUNDARY_STROKE`'s reasoning gives 5.5 rendered pixels over 0.72 CSS px per field unit, which is 7.615 and rounds to 8. `docs/research/readability-value-band.md` pins exactly this at 5.78 CSS px for 8 field units.

At `SIZE_FLOOR` 18 the grave is 18 field units wide. Two 8-unit rims leave 2 units of mouth on a 13-CSS-pixel object, and with a corner radius of 3.6 the stroke self-overlaps and the grave is a solid blob. Even at `SIZE_START` 27 the rim is 60 percent of the width.

The derivation points at the wrong APCA bracket. `fieldFrame` was forced into the Lc 30 "solid non-text, no thinner than 5.5px" bracket because its colour cannot reach Lc 45 against `night` at all, and the research doc says so. `graveRim` over `graveHole` measures Lc -53.4 under this repo's own `apcaLc`, which clears the Lc 45 fine-detail bracket with headroom, and fine detail carries no 5.5-pixel floor. The rim can be much thinner on the same standard.

The plan also never says whether the rim strokes inward, centred or outward. `boundaryReadout` uses `alignment: 1` deliberately. A default centred stroke would draw the grave four units wider on every side than `graveHitbox` reports, which is 22 percent of the floor grave's width, and ADR 0003 makes the drawn grave the health bar.

### ADJUST, plan-changing

- **No rule for combining the two input models.** `GameScreen` holds a `KeySteer` and a `TouchSteer` and must produce one `MoveCommand`. Summing is wrong: a held key plus a live drag overshoots the target. Section 3 orders the agent to stall on a missing seam, so this stalls the dispatch as written.
- **Two designed moments are unreachable in the shipped build.** `SettingsPopup` has no call site outside its own file, so the ADR 0011 slider would be built into a popup nothing opens and Mark's device check cannot exercise it. `PausePopup` likewise has no call site and `GameScreen` has no `pause()`. Confirmed in `EventBoundary` that a container with `eventMode: "static"` stays in `_allInteractiveElements` even when `interactiveChildren` is false, so a finger already down when a popup opens keeps steering the grave underneath it. Mark's ruling above resolves the pause half.
- **Two existing tests break and the plan does not say how.** `screenLifecycle.test.ts` calls `screen.update()` with no argument and asserts `tick` is 2; once `update` takes a ticker and reads `elapsedMS` that throws. The same file constructs `GameScreen` and calls `prepare()` in four tests, and `prepare()` is about to touch `location.search`, `location.hash` and `document`. There is no vitest config for this app, so it runs in the default `node` environment where neither global exists, and the file's hand-rolled `window` mock is the only DOM it has.
- **Moving the digest strands its wall assertions.** `runScenario()` carries four `expect(box...)` calls that fail the run if the script reaches a field edge, which is recorded blindness two. `boundary.test.ts` gives `src/dev` `mayImport: []` with no test-file carve-out, so `expect` cannot travel with the function. Either `runScenario` returns the wall data for the test to assert, or the guard is silently dropped.
- **The frame loop gets no test and no headless seam.** Every planned test is on a pure model. `GameScreen.update` (the tick loop, the sample rule, the `screenToField` conversion, the two-model combination) has one test between it and production, and that one only counts window listeners. This is where the touch overshoot lives and it is invisible to the whole suite. It is also against ADR 0015's own reason for putting the accumulator in `src/game`, "so the autopilot and the rendered screen share one implementation": the accumulator is shared, the loop that consumes it would exist only inside a pixi screen, and dispatch 7's autopilot would write a second one. A small headless `advance(run, clock, elapsedMs, command)` in `src/game` fixes the seam and makes the overshoot a red test.
- **A tracer-plan checklist item is dropped without being named.** Section 5 input says the multiplier "steps 0.5x to 2.0x by 0.1 **and persists**". Nothing in the plan tests `userSettings.getKeyboardSpeed`/`setKeyboardSpeed` or the 0.1 step, and there is no `userSettings` test file in the plan.
- **`TouchSteer.move` must be idempotent and needs a test saying so.** `globalpointermove` on a `static` container with interactive children is dispatched twice per DOM move: `_allInteractiveElements.push(currentTarget)` runs in `hitTestMoveRecursive` when a child produced a hit and again unconditionally, and `all()` notifies each entry. Setting an absolute position is idempotent so the spec survives, but an implementation accumulating a delta would double every drag.
- **Say where the pixi listeners go.** "Added in `prepare()` and removed in `reset()`" is right for `window` and wrong for `this.on(...)`: screens are pooled by `BigPool`, so a `.on` added in `prepare` without a matching `.off` gives the second run two handlers and the third three. The planned lifecycle test counts only `window` handlers and cannot see it. The constructor is the right home for the pixi ones.
- **One record edit is missing.** The hash-query-beats-search ruling is a new rule about run identity, ADR 0012 owns run identity, and it belongs as a line on that ADR.

### Smaller

- `touch.test.ts` item 3 says an enormous drag "still lands on the target in one tick". Through `moveGrave` that is false, because `containGrave` clamps to the field. The assertion the model can make is that the returned command is unclamped.
- `GRAVE_CORNER_RATIO`'s justification says above roughly a third of the width it becomes a capsule. A rounded rect becomes a capsule at half the width. The number is fine, the reason is off.
- `METER_LINE_HEIGHT` does not exist in `FpsMeter.ts` and has to be created, not exported. The plan's own argument for exporting the two constants is the argument for one component owning both readouts.
- Vocabulary, twice: "leaves the grave driving into a wall forever" and "drives the grave into a wall for the rest of the run", the second of which would land in the code. The plan's own section 7 and `CONTEXT.md` ban "drives". "Wall" also collides with the Banshee's Wall set piece. The grave presses against the field boundary.
- Verification step 4's rendered check cannot see the two things most likely to be wrong: the rim at `SIZE_FLOOR` (it screenshots `SIZE_START`) and the settings popup (which nothing can open). A `GraveRenderer.test.ts` assertion that the mouth stays visible at `SIZE_FLOOR` is the instrument that survives a later retune of `SIZE_FLOOR`.

### Carried forward, not fixed here

- **`graveRim` measures APCA Lc 0.00 against `corpse`, `feast`, `drop` and `mob`, all four.** ADR 0014 requires the rim to read above the food layer even under a pile. The palette's sprite-separation test uses a 2.0-luma threshold and the gaps are 2.2 to 2.9, so it passes and is structurally blind to this. The field is empty in 3b so nothing can be checked yet. Trigger: dispatch 4 puts food under the rim.
- The `no-restricted-properties` fence covering `src/input` matters from dispatch 7, when the autopilot drives the sim through an input model. Live human input is never deterministic, so it does not matter today.
- **A phone MATCH on the digest licenses nothing at 3b.** Recorded blindness one says nothing on the digest path calls `math.ts`; the path is add, subtract, multiply, divide, `Math.min`/`max`/`floor`/`round`/`imul`, every one exactly specified. The phone will match, and it will read in the record as evidence for ADR 0015's cross-engine claim when it is evidence only that binary64 works. The screen should say what it did not test.

Sources: installed pixi.js 8.19.0 `Ticker.mjs:424`, `EventSystem.mjs:322-340`, `EventBoundary.mjs:67-74` and `:234`/`:244`; tc39/ecma262 PR 3345 on `Math.sqrt`; W3C Page Visibility on `visibilitychange` bubbling; `apcaLc` run in-tree over the landed palette.

## Product vision gate, standard depth

Judged not to apply, with reasons: content counting (3b ships no mobs, drops, lines or rows), playtest logistics (declined by standing rule), monetization, live-ops, ports and localization (never applied), combat balance (nothing damages or feeds the grave, and leaving `SimEvent[]` unconsumed with dispatch 4 named is right).

Three checklist items apply and pass: solo sustainability (3b ends at a deploy and a play, which is what splitting dispatch 3 bought), vertical slice first (input to sim to render to deploy, falsifiable at every step), and DONT-BUILD recorded where it will be found (ADR 0011's capped-touch dont-build goes into the code comment, not just the plan).

### Scope

The `#/digest` route is not creep: the 3a product gate raised it as DECIDE-NOW in comment `5361754391` and 3a's section 6 carries it to 3b by name. The persisted keyboard speed is not creep either: ADR 0011 makes it a persisted player setting and the tracer plan's test list puts it under `input`. The slider and the rename are creep as built, because they deliver nothing a player can reach.

Nothing in the tracer plan's 3b line is missing.

### DECIDE-NOW 1. The field is not empty, and the grave spawns underneath the END RUN button

Superseded in part by Mark's ruling above, but the arithmetic is recorded because it fixes what "off the play area" has to mean.

`placeReadouts` puts a 52px TICK label at 46% of the field height and a 240x84 END RUN button at 78%, both centred against the field rectangle. `createGrave` starts the grave at `FIELD_WIDTH / 2, FIELD_HEIGHT * 0.8`, size 27, so width 27 and half-height 27.

At 1440x900 the fitted scale is 1.184, so the button spans x 600 to 840 and y 660 to 744 while the grave spans x 704 to 736 and y 687 to 751. The grave draws entirely inside the button's rectangle, and the button is added after the field so it draws on top. On a phone the grave is roughly 19 by 39 pixels against a 240 by 84 button. Verified independently in the main thread.

Pixi hit-tests to the deepest interactive target and then propagates root to target, so with the plan's full-stage `hitArea` a tap on the button fires both the button's press and the screen's drag anchor.

Run readouts and run controls belong off the field's play area, the way `FpsMeter` already sits at the stage corner. Both target aspects leave gutters, vertical on a phone and horizontal on a desktop, and the stage corner is outside the field on both.

### DECIDE-NOW 2. The rim stroke

Found independently by both gates. See the tech architecture entry above, which carries the APCA bracket argument and the measured Lc.

Additional framing from this lens: an 8-unit rim makes the grave stop being a hole and become a solid pill exactly when it is smallest, which is when the player most needs to read it. That contradicts ADR 0014's requirement that the mouth's interior stays beneath the food layer with food visibly falling in, and it contradicts the identity in the concept doc and the glossary, where the grave is a hole in the ground.

### ADJUST

- **The keyboard-speed slider goes into a popup nothing opens.** Same finding as the tech gate's. The sharpening detail from this lens: on a phone the multiplier does nothing, since touch has no multiplier by ADR 0011, so the slider's whole value during 3b is the desktop keyboard read, where Mark does have a keyboard in front of him. A reachable slider turns "1.0x feels wrong" into "it feels right at 1.4x" out of the same play. Options were: cut the slider and rename to #38 and keep only `setMultiplier` plus the default; or keep it and add one way in from the title screen; or build it unreachable, which has no argument for it.
- **The pause popup that calls `cancelAll` does not exist in the base game.** Resolved by Mark's ruling above. The caller the plan also needs and never names is `prepare`/`reset`, because a run that ends mid-drag and a pooled screen coming back for a new run would otherwise carry the previous run's anchor and pointer set into the next one. The plan is careful about exactly this for the clock and the listeners and misses it for the input models, which it never says where to construct.
- **Two durable rulings land only in the dispatch doc.** The hash-query seed precedence belongs on ADR 0012. And the tracer plan's section 6 line "The rendered check runs at 1, 2, 6, and 7" is now false; a report is not the record and section 4.9 does not fix it.
- **Mouse and pen become a third, undeclared steering path.** `pointerdown`, `globalpointermove` and `pointerup` fire for mouse and pen, and nothing filters on `pointerType`, so a desktop click-drag steers through `TouchSteer` uncapped. The module is reasoned about entirely in fingers and the concept doc's controls box is "steering, hold-to-focus, autofire, one button. Nothing else." During the keyboard feel read a stray click-drag yanks the grave across the field. Either filter to touch and pen, or accept mouse drag deliberately and give it its own line.
- **The digest route's claim is bigger than what 3b's digest can check.** Same as the tech gate's carried-forward item. Also: no verification step gives the phone digest read an actor. Step 4 has the agent open it in `vite preview`, which is the same engine family CI runs, and step 6 does not mention it. That is one clause on step 6, not a scheduling ask.

### DEFER

- `FOCUS_FACTOR` is declared 0.5 and pinned by test as "halves", with no statement that it is a first pass, while `DRAG_RATIO` beside it gets exactly that statement and names the tuning dispatch as owner. Touhou tunes focused speed per character rather than at a fixed fraction, so 0.5 is a defensible opening number and definitely a feel number. Without the same sentence, a retune after Mark plays reddens a spec test and reads as a rules change.
- The empty-field read is a floor, not a verdict. 3b answers "does uncapped relative drag steer sanely", not "does it feel right while diving under corpses through mob fire". The real read on the drag ratio is the dispatch-5 play at tracer step 9.
- Nothing owns retiring the on-field readouts. `TICK`, `FPS` and now `DEBT` are all unconditional and the v1 done-line is a game playable start to finish. #38 is the natural trigger and no document says so.

### Checked and closed rather than raised

- Touch drag on mobile needs `touch-action: none` or the browser eats the gesture. `public/style.css` already sets it, plus `overscroll-behavior: none`, from ticket #33.
- The plan's claim that `Math.sqrt` is exactly specified while `Math.hypot` is not is true, but only since TC39 PR #3345 landed in 2024; the 2024 edition still called `sqrt` implementation-approximated, and V8, SpiderMonkey and JavaScriptCore already comply. A reader working from an older spec will think it is wrong, so one clause of citation in that code comment would earn its space.
- The Pixi `elapsedMS` versus `deltaMS` claim and the 100ms `_maxElapsedMS` clamp are correct.
- Relative drag over absolute is well founded and matches the mobile shmup convention.
- The "about 13 CSS pixels across" arithmetic checks out.
- The `DEBT` readout's placement from the meter's constants works, because the navigation container is added to the stage untransformed.

Sources: tc39/ecma262 PR 3345 fully defining `Math.sqrt`, APCA in a Nutshell on the 5.5px solid non-text floor, PixiJS v8 Ticker docs on `elapsedMS` versus `deltaMS`, gamedev.stackexchange on relative drag in touch shmups, maribelhearn.com on Touhou per-character focused speed.

## Game design gate

Still running when this file was written. Append its findings here.
