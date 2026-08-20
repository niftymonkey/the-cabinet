# Dispatch 3b gate findings, 2026-08-20

Raw findings from the review gates on `dispatch-3b-playable.md`, held here until they are folded into the plan.

Delete this file once every item below is folded in or recorded as declined, the way the 3a findings file was.

All three gates fired and all three returned findings. Markers are on #36.

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

## Game design gate, standard depth

Housewarming's does-not-apply list is not inherited. Each pilot-shaped item got its genre-native analogue named and judged.

Does not apply: dead turns (the whole of 3b carries no information and no decision by construction, which is correct for an instrument that reads steering alone), guessing economics (nothing is hidden in a shmup), the optimal line and safe income (no economy), choice windows and losing preserves something (no threats), endings enacted (none reachable), telegraphing (no threats), and solver numbers needing human anchoring (the inverse applies, and the plan gets it right that the only instrument is a human).

Applies: moments of play, stuck states, perceptually distinct content, feel drift checked in the numbers, and working memory weakly.

### ADJUST 1. The touch command is a position error applied several times per frame

Found independently by the tech gate as its DECIDE-NOW 1. The gameplay framing, which the tech report does not carry:

On a 120 Hz phone the grave tracks the thumb exactly. On 60 Hz it mostly tracks, then lurches twice as far as the thumb moved every few seconds. At 30 it alternates between tracking and doubling every frame. ADR 0015 buys a fixed clock so the sim is decoupled from the frame rate, and this one rule re-couples touch steering to it in the worst direction: the more a phone struggles, the more sensitive the control becomes.

The defect is invisible at 120 Hz, because a 120 Hz frame yields zero or one tick and never two. If Mark's phone is ProMotion, the one instrument in the plan cannot see the defect it exists to catch, and it ships to every 60 Hz phone.

Route: split the rule. Keyboard sampled once per frame and applied to every tick; touch recomputed per tick, or applied on the first tick and zeroed on the rest.

### ADJUST 2. Integrator windup gives every wall a dead zone, and test 3 pins it in

This one is new and neither other gate found it.

You hug the left edge to line up a lane. Your thumb keeps travelling past where the grave can go. A shot appears, you flick right, and the grave does not move: your thumb crosses an inch of nothing before it un-sticks. It happens at every edge and worst at the bottom edge, which is where a vertical shmup is played.

`moveGrave` clamps through `containGrave`. The drag target is absolute and knows nothing about the clamp, so the overshoot accumulates without bound. The control-theory name is integral windup: an accumulator that keeps integrating while its output is saturated, so reversing the input does nothing until the banked excess is repaid. Standard fixes are conditional integration (stop accumulating while saturated) or back-calculation. Rive shipped a commit titled "Fix clamped scroll drag accumulation" for exactly this.

Test 3 as written pins the bug in: "a drag ten times the field's width in one move still lands on the target in one tick, and nothing clamps it". After that drag the grave sits at the wall and the target is 5400 units away, so the player owes ten field-widths of thumb travel before anything happens.

This does not reopen ADR 0011. The ADR's uncapped rule is about speed, and the recorded pain was capping drag to keyboard speed. Anti-windup changes nothing about speed: the grave still reaches any point inside the field in one tick. Only the meaningless offset outside the field stops banking.

Route: `TouchSteer` re-anchors from the grave's actual position whenever the grave failed to reach the target, which it can detect from the `grave` it is already handed in `command(grave)`. Reword test 3 to assert what ADR 0011 actually protects: any distance inside the field is covered in one tick.

### ADJUST 3. The grave spawns inside the END RUN button at every viewport

Superseded by Mark's ruling above, but this gate's arithmetic is more general than the product gate's and is worth keeping.

The two are 0.02 of field height apart, which is `15.2 * scale` CSS pixels, against a combined half-extent of `42 + 27 * scale`. That inequality holds for every scale, so the grave is inside the button at every viewport, not just at 1440x900. Checked at 390x844, 430x932, 820x1180 and 1440x900, fully enclosed in all four.

The same cluster: the seed label at 22 percent, the TICK counter at 46 percent at font size 52, and the button at 78 percent are all three down the field's vertical centre line, which is the lane a vertical shmup is played in.

### ADJUST 4. Three input-wiring gaps

(a) The keyboard speed slider lands in a popup nothing opens, so ADR 0011's persisted setting ships as a `localStorage` key with no door, and the one dispatch whose purpose is reading input feel gets exactly 1.0x on device. Same finding as both other gates.

(b) Nothing arbitrates the two models. On a touchscreen laptop or an iPad with a keyboard both are live, and summing them is wrong on its face because they are in different units of meaning: one is a velocity and one is a position error. The natural rule is touch wins while a pointer is down, keyboard otherwise, and that rule has a consequence worth writing into the code: a resting finger silently disables the keyboard.

(c) "The steering finger is the oldest pointer down" dies on a normal phone grip. You pick up the phone, your off-hand thumb brushes the glass at the edge, then you reach in with your steering thumb. The brushing thumb is now the steering pointer and never moves, so the grave sits still, and every steering drag registers as a second pointer, which sets the belch edge. The control is dead and the bomb fires.

A developer hit precisely this and published the fix: lock to one touch, accept a new touch only within a distance threshold of the previous one, and add a failsafe timer so a dropped release cannot freeze the ship. The cheap version here is that the steering pointer is the first pointer to move past a small threshold, not the first to land.

### DECIDE-NOW 5. A 4x speed range beside a focus key has no shipped precedent and breaks at both ends

This is new information rather than a fresh opinion, so it is a legitimate reopening of ADR 0011. It is Mark's call.

Two players sit down. One sets 2.0x and crosses the field in one second; their focus key gives them 4.5 units a tick, which is precisely the speed the other player calls flat out. The other sets 0.5x, crosses in four seconds, and their focus key gives 1.125 units a tick, a quarter of the pace the boss curtain will be authored against. Neither is playing the game the gaps were designed for, and for the first player focus has stopped being a precision tool: it is a return-to-normal key.

What the genre does: focused speed is an absolute value, not a factor, and it is a shared constant while unfocused speed is what varies. In Touhou from Mountain of Faith onward, Marisa runs 5.0 pixels per frame and everyone else 4.5, but every character focuses to exactly 2.0. SHMUP Creator's player editor does the same, taking an absolute Speed value for focus. The reason is structural: bullet gaps are authored once, so the speed you thread them with has to be the same for everybody.

The unprecedented part is the range, not the composition rule. No shipped shmup offers a player-configurable movement speed alongside an independent focus key, so nobody has solved the interaction in public. The genre's entire per-character speed spread is about 1.1x, where ADR 0011 asks for 4x. Multiplicative focus breaks at the top (2.0x focused equals default); absolute focus breaks at the bottom (0.5x normal already equals the focused speed).

Three ways out, all cheap now and all expensive after dispatch 6 authors the Undertaker's curtain:

- Narrow the range, say 0.75x to 1.5x, and keep focus multiplicative. Both ends stay inside a regime the gaps can be authored for.
- Make focus absolute. The multiplier governs traversal, focus resolves to one shared speed, and everyone threads gaps identically. This still wants a narrower low end.
- Collapse the two into one axis. Eschatos ships a Change Speed button cycling Fast, Medium and Slow with no separate focus at all, and Crimzon Clover ties slow to the lock button rather than a dedicated focus.

`FOCUS_FACTOR` 0.5 itself is fine and is not in question: Touhou's derived ratios land at 0.40 to 0.44 and Reimu's is exactly 0.5 in the older frame data. The number is not the problem, the range it multiplies is.

### ADJUST 6. The rim stroke gets a floor and no ceiling

Third independent finding of the same defect. This gate's additions:

An 18-unit-wide floor grave with an inward 8-unit rim has a mouth interior 2 units wide, against drops the tracer plan sizes up from 9 units. The grave looks sealed shut in exactly the state where the player is one hit from actually being sealed shut, and ADR 0014's "food still visibly falls in" stops being true.

Measured on this palette: `graveRim` on `night` is APCA Lc 53.8, while `fieldFrame` on `night` is Lc 34.3 and only just clears the Lc 30 level the `BOUNDARY_STROKE` JSDoc's 5.5-pixel minimum belongs to. A stroke twenty points brighter qualifies at the same level while being thinner, so "follow the same reasoning" should not land on 8 and the plan gives the agent nothing to stop it.

`graveHole` on `night` measures APCA Lc 0.0. The mouth carries no contrast against the ground at all, which is right for a hole, but it means the rim stroke is the entire visible grave and the entire size-is-health readout. A fixed-width rim also compresses the size signal: floor to ceiling reads as 2.9x on screen where the sim spans 3.75x.

The alignment question the plan never answers: the visible outer edge is what a player reads as "what I pass under gets swallowed", and `graveHitbox` is exactly the sim rect. An outward stroke means food that visually touches the grave is not swallowed; an inward stroke keeps visible equal to hitbox but eats the mouth.

Route: state a ceiling as well as a floor, name the alignment, and pick the number against the size floor rather than the start size.

### ADJUST 7. The on-device check needs a read-list, including a negative one

Reads well: does the grave track the thumb with no lag (findings 1 and 2 both surface here); does the boundary behave; is two seconds to cross the field right; is a diagonal not faster than a cardinal. Worth adding: anchor the thumb on the grave, and try a panic reverse (slide left, stab right without releasing left), since the plan chooses cancel-to-zero.

Blind, and this should be said up front so a note from a blind instrument does not get acted on:

- Focus. `FOCUS_FACTOR` exists to thread gaps and there are no gaps.
- The drag ratio's dodging consequence. Thumb reach and occlusion read fine; "can I get out of the way in time" does not.
- Two of the three size regimes. The grave is unfeedable and undamageable in 3b, so it steers at `SIZE_START` 27 only. The range is 18 to 67.5, a 3.75x span, and `BASE_SPEED` is size-independent, so a floor grave covers 15 of its own body-widths per second where a ceiling grave covers 8. That is the hole.io growth arc, and it is the part of steering feel that changes most across a run. A dev `?size=` beside the `?seed=` machinery this dispatch is already writing is about fifteen lines and turns one steering read into three.

Also in this cluster: the seed label reads `SEED 1234` whether the seed was rolled or pinned. ADR 0012 exists because a silently defaulted seed made a dozen playthroughs the identical run, and 3b does not close it: a tester handed a `?seed=` link plays fifty identical runs with nothing on screen saying so. `SEED 1234 PINNED` costs one word.

### DEFER 8. Two carried forward, with triggers

(a) The belch fires on any second pointer, anywhere. A resting or brushing finger discharges the screen-clearing eruption, which ADR 0008 makes fire only at a full reservoir, so a misfire spends the scarcest thing in the game. In fairness to the plan, second-finger-as-bomb is well precedented and is Bullet Hell Monday's default, and no documented case of accidental discharge in any mobile shmup was found. What the record does show is that every serious mobile shmup ships the binding as a choice: Bullet Hell Monday offers two-finger tap, button, or double tap; Aka to Blue offers multitap or double tap; DoDonPachi Resurrection iOS uses a placeable on-screen button. BOSSGAME's developer states the principle directly, that on a phone it is easy to slide fingers over buttons without resistance, so high-commitment actions get hold-and-release. Trigger: dispatch 5, when `belch.ts` consumes the edge.

(b) `DRAG_RATIO` is the input-parity and occlusion dial, not a feel nicety. Touch is bounded by thumb speed and not by `BASE_SPEED`, so at ratio 1 a touch player reaches a given point roughly an order of magnitude faster than a keyboard player at 1.0x. ADR 0011 accepts that deliberately, but the consequence needs writing down: dodge windows have to be authored against the slower input, most sharply for the Undertaker, whose curtain gap is grave width plus a margin. For a keyboard player that is a movement problem; for a touch player it is a placement problem. Espgaluda II's iOS port is the cautionary precedent, where relative touch erased per-character speed differentiation entirely because the speed became the finger's.

Second, the plan's stated reason for relative drag, that the finger is never on top of the grave, is only true if the player anchors away from it: the offset is whatever it was at pointer-down and never changes, so anchoring on the grave occludes it permanently. What actually breaks occlusion is a ratio above 1, which is the recorded reason players are advised to raise Bullet Hell Monday's sensitivity. Casiez et al. is the citable frame for why this wants a slider rather than a bolder default: control-display gain performance is U-shaped, and gain above 1 cuts clutching but degrades target acquisition. Trigger: dispatch 6 for the Undertaker, dispatch 7 for tuning.

### Checked and left alone, where research beat the gate's first instinct

- Relative drag over absolute, and uncapped. Confirmed correct. Cave went relative across its whole iOS line, and Aka to Blue, made by ex-Cave staff, is effectively uncapped 1:1.
- `DRAG_RATIO` 1 as the first pass. No shipped game publishes its drag ratio, slider range, or default. There is no number to look up, so 1 is as defensible a first pass as anything.
- Opposed keys cancelling to zero. The evidence is genuinely split rather than supporting a change. Cancel-to-zero is Godot's default and the tournament standard, and diagonal normalization is the engine default in both Unity and Godot. But Godot proposal 12235 calls last-input-priority "generally the most desired mode for fighting games and shooters", and Valve banned Razer Snap Tap and Wooting's SOCD in CS2 because the responsiveness gain is real. In a single-player shmup no ruleset applies, so it is purely feel. The plan's stated reason is weak, the choice is fine, and the fix is two lines if it feels wrong. It belongs on the on-device read-list, not in a redesign.
- Page-level touch behaviour. `public/style.css` sets `touch-action: none` and `overscroll-behavior: none`, and `index.html` sets `user-scalable=no`, all credited to ticket #33. Scroll, pull-to-refresh and pinch-zoom will not corrupt the check.
- ADR 0012 compliance. The hash-query tie-break and a pinned seed surviving a restart are both consistent with the ADR rather than against it. Warn-and-roll-fresh on a bad seed is the right call for a playtester.
- `GRAVE_CORNER_RATIO` 0.2. Argued against the right number, the 13 CSS pixel floor grave, and lands fine at both ends.
- The `#/digest` route. The strongest idea in the plan.

Sources: shmuptheory and shmups.wiki on Cave and Aka to Blue relative drag, Shrine Maiden frame data and SHMUP Creator on absolute focus speed, integral windup on Wikipedia and MathWorks, pixijs.com events guide, Godot proposal 12235 and Evo rules on SOCD, Casiez et al. on control-display gain, APCA measured on this palette.
