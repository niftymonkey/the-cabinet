# Design record: round two of step 4, the push, the belch, the meter and the Wall (tickets #123 and #124)

Planning half only, written per `docs/agents/feature-playbook.md`. No production code was written and nothing in the worktree was edited. The research it stands on is `push-feel-precedent.md` beside it, and every craft number below traces to a source there.

## 0. What this record may claim, and what it cannot

Every claim about existing code cites a file and a line, read on 2026-09-15 at tip `524bb68447` with slice G and the batch still ahead, so **every line number goes stale the moment slice G lands** and a slice locates its site by content. **Mark's rulings of 2026-09-15 bind this record and are never reopened by it**, and where precedent disagrees with an ADR the record proposes re-ruling it rather than permitting both. Two ADRs are in that position: 0042 and 0008.

**How the current shove moves a body, exactly.** `pushTarget` (`src/game/lines/bell.ts:252-273`) computes `push = row.push * near` and calls `moveStormTarget` once with the destination already at full distance (`bell.ts:267`), and `moveStormTarget` (`stormTargets.ts:303-326`) writes `slot.mob.x` and `slot.mob.y` directly, clamped to the field plus the spawn margin. **The whole shove is a single-tick position write**, applied once per mob per toll because `toll.struck` refuses a second (`bell.ts:300`, `bell.ts:310`), up to 40 field units at level five (`bell.ts:108`). The renderer sets a sprite straight from the sim with no interpolation anywhere (`FieldRenderer.ts:216`), and a shambler is 22 field units wide (`mobs.ts:91`), so successive drawn positions leave an 18-unit hole between them. That is Mark's flicker, and it is arithmetic rather than a feeling.

The belch pushes nothing and says so deliberately (`belch.ts:78-81`): it cancels every live mob-fire shot and kills outright inside a 160-unit radius (`belch.ts:19`, `belch.ts:82-92`). The Wall is 22 shamblers in the `wall` formation, one authored row the director may not spend in (`waves.ts:492-501`), spaced at `FIELD_WIDTH / count`: 24.5 units holding 22 units of body, so the gap between neighbours is 2.5 against a grave 27 units wide at the starting size (`formations.ts:179-188`, `grave.ts:79-81`, `tuning.ts:58`).

## 1. The goal, and the done line

Round two makes force visible. A shove stops being a jump cut and becomes a body travelling: the bell's toll throws mobs out of the grave's space over a handful of ticks, and the belch, stripped of its kill, becomes the game's one big push, two or three shoves that clear the ground and open a way through what stands in front of it. The meter under the thumb stops being a light that turns on and becomes a thing that fills, in a corner the steering thumb is not already in. And the Wall, built to give a damaging belch a reason and left without one when the belch stopped damaging, gets a new one: a curtain costing more to cross than a player has.

**The done line, in gameplay terms.** A first-time player watching a toll land says the mob was pushed, not that it blinked. After spending a belch they can say what it did for them unprompted, which is ticket #124's done line. Without looking away from the field they can tell roughly how close the belch is to ready. And when the curtain comes down they try to get through, find they cannot, spend the belch, and go through the hole it makes, which is ticket #123's "a crossing reads as a cost in play".

## 2. The decisions the orchestrator must rule

### D1. What carries a shove across ticks, and does that move the witness

Every source that specifies a mechanism uses a velocity over several frames with decay, and **no source describes knockback as a single-frame position set**. So the shove needs state living longer than one tick, and the question is which.

**Option A, new per-body impulse fields.** `Mob` gains a shove vector and a countdown, both folded, so `WITNESS_VERSION` goes 7 to 8. It matches precedent exactly and leaves the body's own motion a free choice.

**Option B, the fields already folded.** `mob.vx`, `mob.vy` and `mob.beat` are all folded today (`witness.ts:177-178`), and `moveMob` already has the shape a shove needs: while `beat > 0` the walk does not run, the velocity is not rewritten, and `mob.x += mob.vx` still integrates (`mobs.ts:360-372`). That is precisely Vampire Survivors' mechanism, and **no new folded field means `WITNESS_VERSION` does not move**. Two costs: `canTouchGrave` reads `beat` for a body that appeared inside the field (`mobs.ts:286-288`), so a poured body would be harmless while it flies; and ADR 0041 gives `beat` one meaning, so a second owner needs that ADR amended, or a sibling countdown, which is a new folded field after all.

**Option C, renderer-only easing.** The sim keeps its one-tick write and the sprite catches up, with no determinism risk. But `FieldRenderer` has no interpolation layer at all, so this is new machinery, and while it runs the drawn body is somewhere the sim body is not, at exactly the moment the player is judging whether they will be hit.

**Said plainly: option A needs a witness move, and that is a decision above this record.** Step 4's plan holds `WITNESS_VERSION` 7 still, so if A is picked the move is its own commit declaring every new folded field and it goes to Mark, never inside a slice.

### D2. How far a shove travels and over how many ticks

Vampire Survivors runs a shove for **120 milliseconds**, 7.2 ticks at 60Hz, and the only fully numbered implementation found decays **linearly** at a constant rate. The readability criterion is arithmetic: successive drawn positions must overlap, so the per-tick step stays under a body's full width, 22 units for a shambler, and today's 40 units in one tick fails by 18. A linear decay from `v0` to zero over 7 ticks covers `4 * v0`, so **holding today's level-five distance of 40 units gives `v0` of 10 units a tick**, a first step overlapping a shambler by 12 and every step after smaller. Precedent's duration and today's magnitude agree without either being bent, which is the row this record recommends and the orchestrator rules.

Whether the body keeps its own motion is the open half: every source that speaks to it suspends the walk, which is what option B gives for free, and adding on top has no source behind it. **Hit-stop is not a decision, it is already refused**: a sim pause changes the tick count and ADR 0015 makes the tick count the run, and the refusal already sits in `StormRenderer.ts`.

### D3. The belch's two or three shoves: waves in time, or one impulse with a longer tail

**Option A, discrete waves.** Two or three impulses spaced some ticks apart, each re-shoving every body in reach. Mark's words are "two or three shoves", and a wave the player can count makes that literal; the eruption already reads for 20 ticks out to the field's diagonal, so three shoves about 10 ticks apart sit inside a visual that exists, and the Flower Wall's five waves are precedent. **Option B, one impulse with a long tail**, is one decay row and cannot read as two or three, which is the ruling. Either way: does a later wave re-shove a body still flying. The bell holds the pattern in `toll.struck`, whose JSDoc records why a reach test alone is not enough once a push exists (`bell.ts:33-47`).

### D4. How a belch opens the Wall

**Option A, the bodies are shoved apart and the gap is geometry.** No special case anywhere: the shove is the same shove and a hole opens because bodies moved. Two neighbours must separate by about 24.5 more units to clear a 27-unit grave, 12.3 each laterally, and a 40-unit radial shove gives 28 units of lateral component at 45 degrees off the grave's axis and 20 at 30. **The risk, named rather than discovered: a body directly above the grave gets no lateral component at all**, so the curtain bows away up-field rather than parting and the lane opens as a cone either side of dead ahead. Whether that reads as a hole or a dent is the first thing the slice measures.

**Option B, the wall bodies are the only ones a belch kills**, and **option C, the wall parts on any belch regardless of reach**, are both rules keyed on which set piece is on the field, which is the fixed-membership club ADRs 0016 and 0042 exist to dismantle, and B contradicts the no-damage ruling besides.

A second half sits under the ruling's own words. **Nothing in this game blocks**: the grave swallows and passes under, so a curtain it cannot pass is one whose crossing costs more than a player has, which is how the Flower Wall works and why **no shipped event in the research is a true unescapable lock**. So the orchestrator rules: blocked by cost, needing no new concept, or by an impassable body, which is new physics against the grave's own verb.

### D5. Is the Wall body a new mob row or the shambler in a formation

**Option A, a new durable type in the pool**, high health and no fire, which the Crowd's Wall row happens to use. Ticket #123 says why the shambler cannot do it: at one skull the storm opens a lane and the bodies fire nothing, so the crossing costs nothing, and the Flower Wall is its own unit for the same reason. A type in the pool is not a cast pinned by the set piece, so ADR 0042 stands. **Option B, the shambler with count and spacing doing the work**, is what exists, and it is what measured out at the floor build and failed (`docs/push/step-4-progress.md` section 4 item 7).

### D6. What ADR 0042 says after re-ruling, and the second ADR nobody named

ADR 0042 is amended in place with the dated triple. **What stood:** a set piece names the property it must keep and never the cast allowed in it, which is the whole of the record; that the crossing is never free; and the caution that a bot proof is an upper bound on perfect play. **What it replaced:** the old form, "stays crossable unloaded, and is never crossable for free"; the unloaded half is withdrawn and a belch is what opens the curtain. **What it could not have known:** the mow, since at one-skull trash measured at the floor build the storm thins the curtain enough for a lane to open and the grave crosses untouched, so the unloaded half was already free and the loaded half went with it, silent bodies putting no shots in the air worth a belch; and the belch's own change, which ADR 0008 marked for a re-read in play and Mark's ruling completes.

**The ADR the brief did not name, and skipping it is a stop.** ADR 0008 says the burst "kills the mobs within a local radius of the grave" and that "nothing is pushed, ever". Ruling 1 reverses both halves, so it takes a second edit-in-place triple and the belch slice cannot start without it. What stands: full-only firing, the dedicated button, the field-wide gas that kills nothing, the scope limit to bodies that have entered. What it replaced: the burst as a kill rule, and the no-push rule. What it could not have known: that the split would leave the belch with nothing a player could name after spending one, which is ticket #124.

### D7. The meter's form, and the corner it moves to

**Form.** Every shipped phone precedent found is a radial fill: Brawl Stars' filling ring, Genshin's burst icon filling with the element's colour, and Riot's own name for it, "radial timer". **The claim that a radial is harder to read than a bar could not be sourced and is folklore.** The control is already a ring (`BelchButton.ts:118-131`), so a fill is the smaller and better-sourced change; a bar is the other option, with no shipped precedent in this set. **Ready** is a colour change plus a glow or pulse in every precedent, and the pulse already exists (`BelchButton.ts:53-57`). ADR 0054's reading of ADR 0014 binds the HUD to announce by count, shape or subtraction and never by getting brighter, so **a fill announces by area and is the compliant channel** where today's alpha swing is not.

**The corner, and it breaks no layout record.** `READOUT_RESERVE` reserves the two **top** corners only (`layout.ts:69-73`, `layout.ts:145-157`), and the belch button is positioned in `GameScreen.resize` (`GameScreen.ts:455-458`) independently of `fitField`. **So the move is one `position.set` plus the two rects in `BelchButton.test.ts:53-62`, and the 540 by 760 fit is untouched.** The floor that must hold is the 44 by 44 CSS pixel target at every viewport, already asserted against `BELCH_SIZE` 108 (`BelchButton.ts:23-31`). **One finding filed rather than applied:** Hurff puts the far bottom corner across from the holding hand in the hard-reach zone for a one-handed grip, against which the button already carries a claimed-pointer field because a press in the bottom right also reaches the steer model (`BelchButton.ts:62-70`), so the steering thumb and the belch share a corner today, and handedness is already ruled future work.

### D8. One shove function or two

Rule of three says two copies are fine, so the argument is the deletion test. A one-tick push is arithmetic at the call site, which is why `pushTarget` is local to the bell today and correctly so. A shove that persists across ticks is not: it is per-body state, a per-tick advance at one place in `step`, a fold site, and an invariant. Two copies means two of each, and the second copy is where they drift. **One module, two callers.**

### D9. What else moves

**`GOLDEN` re-pins** in the shove slice and the belch slice, because the canonical scenario folds live mob positions and its bell tolls. **The fences all hold and none moves**: `boundary.test.ts` gains a new core module to police, `lineAgnosticPolicies.test.ts` binds both the belch and the bell to `stormTargets`, and the two harness fences bind any reading added. **`READINGS_VERSION` 4 moves to 5, and it is not optional**: `observeRepel` throws outright on a `mobShoved` arriving with no toll window open (`repel.ts:41-47`), which is exactly what the first belch shove produces, so either the belch emits its own event or the reading is widened, and either way the comparison declaration changes shape. **`FORMAT_VERSION` 4 does not move**: nothing new is recorded in a header.

## 3. The proposed shape

**Core.** A new `src/game/shove.ts`, dependency-free apart from the math helpers and the mob type. It owns the impulse record, the decay row, the function that starts a shove, and the function that advances every live shove by one tick, and it imports nothing from `src/app`, `src/dev` or the lines.

**Satellites, each seeing the core and not each other.** `bell.ts` stops writing a destination and asks `shove.ts` to start one, keeping its own proximity arithmetic; `belch.ts` gains the same call and loses `burstNearbyTargets`' kill; `mobs.ts` calls the advance inside `advanceMobs` (`mobs.ts:404-416`), before the walk, because by then the shove is the body's own motion and no line owns it. `stormTargets.ts` stays the one way a body is moved and the one place `pushable` is answered, so a shove cannot start on a boss or a set piece and cannot leave the field plus its margin. **The arrows:** those three point at `shove.ts`, which points at nothing but math and the mob type, and nothing points back out.

**The shell.** `FieldRenderer` needs no change at all, which is the point: a body shoved over ticks is drawn at every intermediate position for free. `StormRenderer` gains the belch's push front on the `belchEruption` layer already below `mobFire`, `BelchButton` gains the fill and `GameScreen` moves the corner. **The adapter is unchanged**: pixi stays behind the renderers and no new library enters.

## 4. The slices, in one order

Each is one commit: tests, minimal implementation, record amendment, green before the next begins, with CodeRabbit CLI before each code commit and the test-name diff on every slice. One Opus coder per slice, each handed `docs/push/step-4-coder-contract.md` and the dispatch contract.

**Step R0. The witness question, answered first.** D1's answer decides whether `WITNESS_VERSION` moves; if it does, that is its own commit ahead of slice H declaring every new folded field, and Mark's read before it runs. **Steps R1 and R2. The two ADRs, amended in place**, one docs commit each: ADR 0008 before slice J and before any belch test is written, ADR 0042 before slice L.

**Slice H. The shove, and the bell alone uses it.** `shove.ts`, the impulse state D1 chose, the advance inside `advanceMobs`, `bell.ts` rewired, the fold and the invariant, `GOLDEN` re-pinned. **Push feel first is Mark's ruling and the only order that works**: a belch slice ahead of it would build the second copy D8 exists to prevent, and the Wall depends on a belch that can move a body.

**Slice I. The shove is measurable.** The repel reading widened or split per D9, `READINGS_VERSION` 4 to 5, every new reading declared in `compareRuns.ts` and the harness state list. Its own slice, because a reading landing with the mechanic hides which of the two moved a number.

**Slice J. The belch becomes a pushback.** The kill removed, the shove waves added per D3, the event the reading needs, `BELCH_BURST_RADIUS` re-read as a shove reach, the eruption's front, `GOLDEN` re-pinned.

**Slice K. The meter fills and changes corner.** The radial fill, the ready tell re-read against ADR 0014's ceiling, the corner moved with its test rects. No sim change, so no `GOLDEN` and no witness move, which is why it is separable. **Slice L. The Wall.** D5's body, D4's opening, the wave row, and the property asserted the way ADR 0042 now words it, last because it depends on all three before it. **Step R3. The gates, then CodeRabbit on the exact tip**, then the batch, then the deploy: gates before the reviewer, because a finding that changes code invalidates a review, and a finding against a ruling is filed and built past.

## 5. What must not move

The step 4 contract's what-must-not-move list stands whole and unabridged. This round adds four. **`FORMAT_VERSION` 4 stays.** **`WITNESS_VERSION` 7 stays unless D1 is answered otherwise above this record, and a slice may never move it alone.** **`moveStormTarget` stays the only way a body is moved and `pushable` the only answer to whether it may be**, so a shove can never smear an authored pattern (ADR 0007). **No hit-stop, no sim pause, no render hold.** And the harness's rows stay put: a row moved between two batches compares two builds through two instruments, so `belchWorthIt` becomes a new named configuration or it does not move.

## 6. Verification, and the tests that pin the promises

Actor agent unless named. `pnpm typecheck`, `pnpm vitest run`, `pnpm build` and `pnpm verify` green twice on the committed tree. Replay determinism at each slice's tip: one seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors. A tape measured to `outcome: 'verified'`, and a conditioned tape at `bell=5` the same way, because the bell's push exists only at the top rungs. The fences green, each named by title. A batch under `steady-far` and `loose-far` reporting the repel channel per toll and per belch. A rendered check that plays a run, ends it, and plays another, because one that only ever plays run one is structurally blind. **Actor Mark, blocking nothing**: a curtain met, a belch spent, a toll watched.

The tests, named as the sentences they promise.

- A shoved body is visible at intermediate positions: a body shoved 40 units stands somewhere different on each tick between, and no tick moves it further than its own width.
- A shove decays to nothing and the body resumes its own rule on the tick after it ends.
- A shove never carries a body outside the field plus the spawn margin, however large the impulse, and a boss and a set piece's source are never shoved at all.
- A second shove landing on a body already flying resolves to one answer, the same on every replay of the same seed.
- Two runs on one seed with the same inputs rebuild identically with shoves in flight at a checkpoint.
- The bell's toll strikes each body once, and a shove carrying a body back across the leading edge earns no second strike.
- A belch takes no health off anything, boss included.
- A belch shoves in the number of waves the row declares, and a player counting them counts that many.
- A belch landing on the curtain opens a gap at least as wide as the grave, and the grave crossing without one loses health.
- The meter reads partway full at a partway-full reservoir, its fill a function of the reservoir alone, and every colour it draws sits under the field's ceiling while the field is live.
- The belch's control sits in the bottom-left corner at every viewport, with a target at least 44 by 44 CSS pixels, overlapping neither the corner readout stack nor the pause button.
- The repel reading holds a belch's shoves without throwing, and attributes them to the belch rather than to a toll.

## 7. Open questions that need Mark

None. Every question in section 2 is a craft call the orchestrator rules from the evidence beside it, with one procedural exception: D1's option A moves `WITNESS_VERSION`, which step 4's plan holds still, so **if the orchestrator picks option A the version move goes to Mark as a plan change before slice H runs**.
