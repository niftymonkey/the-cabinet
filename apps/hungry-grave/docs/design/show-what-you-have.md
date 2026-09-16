# Design record: show what you have (path step 5, tickets #72 and #99)

Planning half only, written per `docs/agents/feature-playbook.md`. No production code was written and nothing in the worktree was edited while this record was made. The research it stands on is [`../research/portrait-hud-and-catchable-loss.md`](../research/portrait-hud-and-catchable-loss.md), and every craft number below traces to a section there or to a measurement in section 3.

**The step's number moved and its name did not.** The follow-along document calls this "Step 5: Show what you have" and the file `docs/push/drafts/step-5-tuning-record-draft.md` is the tuning-record step's draft, which Mark moved behind this one on 2026-09-16; that file keeps its filename and its own step is now step 6.

## 0. What this record may claim, and what it cannot

Every claim about existing code cites a file and, where the line matters, a line, read on 2026-09-16 at tip `55f05ccdd5`. **A line moves the moment a slice lands, so a slice locates its site by content and never by the number.**

**Round two's slice J2 was building while this record was written and landed before it was filed, at `3351044752`.** Two of the files this record cites are in that commit. `src/game/corpses.ts` gains a corpse's own shove, which widens the `Corpse` record and does not touch section 3.4's claim that a fallen rung is a fourth kind on an existing pool rather than a new one. `src/game/witness.ts` widens the fold and moves `WITNESS_VERSION` with it, which does not touch section 3.4's claim that `run.score` is already folded, and section 5's budget is step 5's own and is counted from whatever the tip carries when step 5.0 begins. **Every other citation is at `55f05ccdd5` untouched, and the first slice re-reads both of those two by content before it leans on them.**

**Mark's standing rulings bind this record and are never reopened by it.** Two bind hardest. The field never pays width for a readout, at any viewport (2026-08-22, `src/app/layout.ts` `fitField`, and `layout.test.ts`'s test of that name). And the belch's control sits in the bottom-left corner, with handedness ruled future work (2026-09-15, round two ruling R7). Section 7 carries a measured finding against each, filed and built past.

**Where precedent disagreed with our own record the record is re-ruled to precedent**, which is Mark's rule of 2026-09-09. That happens once here, to `CONTEXT.md`'s HUD entry, and once to ADR 0054's wording; both are section 2 rulings and both land in a docs commit ahead of every coder, exactly as round two's ADR commit did.

## 1. The goal, and the done line

A run today enforces a ladder nobody can see. The grave bleeds score and then weapon levels on the way to being sealed, and none of it reaches the screen: no score is drawn anywhere in `src/app`, nothing says which lines are owned or at what level, and a single rung subtracted inside a dense storm is invisible by construction. Step 5 makes the run legible while it is being played, and composes the space it is played in.

**What a player meets when this is done.** At the top of the play area a slim row carries the score and, for each weapon line the run is fielding, that line's rungs as marks. A power-up swallowed lights a mark on the beat of the swallow. A hit at the size floor takes the score first, and the number is seen to leave rather than to have left. A hit that takes levels darkens a mark on every line that paid and tips those rungs onto the field as bodies that drift down with the world, so the player at the floor, under the fire that just took them, decides whether to dive after one and which one. And the frame around the field is composed for a phone and for a desktop rather than fitted to each, with every control deliberately placed against it.

**The done line, in gameplay terms.** Without being told, a first-time player can say what the row at the top is telling them. After a hit at the floor they can name what it cost, which is #99's whole problem. They try for a falling rung at least once, and they sometimes decide not to. And Mark, playing on his phone and on his desktop, reads the same thing in the same glance on both.

## 2. The rulings

Every question this record's sources left open is ruled here. None of them is a slice's to reopen. Each carries the minimum rationale needed to understand why it was chosen; the evidence is in the research record or in section 3.

### R1. The HUD is one row at the field's top edge, outside the field where the stage offers room and over it where it does not

**Ruled: one form, one row, one placement rule, no viewport breakpoint.**

**The measurement decides this and nothing else could.** Section 3.1 has the table. A phone gives the field the full stage width and **no side gutter at all, exactly zero**, leaving only a band above and below whose size depends on the browser's chrome. A desktop gives the field the full stage height and a side gutter of 192 to 400 stage units, and **no band at all, exactly zero**. **There is no band that exists on both shapes and no gutter that exists on both shapes.** A HUD with one home therefore has to bind to the field's own rectangle, which is the only thing both shapes have.

**Outside the field where there is room, over its top edge where there is not.** This is the same trade `fitField` already takes and documents, a readout over the field being the cheaper of the two costs, and it keeps Mark's ruling that the field never pays width untouched. It is one rule with no wide-versus-tall branch, which is the principle `layout.ts` already states in prose.

**A first draft of this ruling claimed the row costs a phone nothing, and `svh` makes that false.** The game design gate caught it. Under `dvh` a phone left a band of 204 to 220 stage units above the field and the row sat in it for free; under `svh`, which R10 rules and which sizes the canvas for the chrome fully expanded, the same phone's top band falls to between 8 and 172 units depending on the device and the browser, and it is under the band the row needs on most of them (section 3.1). **So the row draws over the field's top edge on nearly every shape, and the free band is the exception rather than the phone's normal case.** The ruling stands because its reason was never the free band, it was that there is no home both shapes share; what changes is the cost, which is now paid everywhere and is priced below and filed in section 7.

**The top rather than the bottom or the side.** Every shipped readout of a level or a score in the record sits at the top of the play area: Cave Story's weapon experience bar with the level beside it, Vampire Survivors' experience bar "shown on the top of the game HUD", Danmaku Unlimited 3's graze counter top-left, Ikaruga's confirmed top-to-bottom order of score, enemy health, chain, energy, lives (research sections 3, 1, 5 and 7). The bottom is spoken for twice over: the grave itself lives low in a vertical shooter and would occlude a readout drawn there, and the belch's control already holds the bottom-left corner.

**The row is drawn in field units and scaled by the field's placement.** It is a sibling of the field container rather than a child, because a child would be clipped by the field's own clip and hidden on a phone where the row sits outside the field. Scaling it by the placement is what makes one mark subtend the same fraction of the field on a 320-wide phone and a 1440-wide desktop, which is what "the same glance on both" means. A row positioned in raw stage units would be smaller on the phone, which is the wrong way round.

**The mark is measured first and the band is declared from it, in that order.** A first draft declared a 26-unit band and left the mark to fall out of it, and the game design gate priced what that produced: a mark of 2 to 4 CSS pixels, an order below the 6.25 to 7.50 CSS pixel band slice K's area reading was actually proved on. **A reading proved at one size is not proved at a quarter of it**, so the derivation runs the other way here.

**The mark is 11 field units and the band is 28.** At the field's placement a mark of 11 units measures **6.5 CSS pixels at a 320-wide phone, 8.0 at an iPhone 15, 8.4 at a Pixel 8, 13.0 at a desktop and 16.7 at a portrait tablet** (section 3.1). The floor is K's own 6.25, the narrowest filled band it measured and proved legible in grayscale, and 11 units is the smallest whole number that clears it on the narrowest phone the sweep covers. The band is then what the content needs: an icon of 24 units with a row of five 11-unit marks beside it, two units of padding above and below, which is 28. Widthwise that is a group of 95 units per line, four groups plus their gaps at 410, and a score of about 110, inside the field's 540 with 10 units of margin each side.

The construction is Halls of Torment's shipped fix: the rungs are marks against the line's own icon rather than a number beside it, which is what let them fit a per-ability level into an icon's space four months after launch (research section 4). **`layout.ts` declares the band and the HUD's own test asserts the measured content fits inside it**, which is exactly the split `READOUT_RESERVE` already uses and states, and the slice takes a grayscale screenshot at the narrowest phone because 6.5 against a 6.25 floor is a margin worth seeing rather than asserting.

**What it costs, priced rather than asserted.** The scroll runs at 38 field units a second (`src/game/tuning.ts`), so a 28-unit band over the field's top edge hides **0.74 seconds** of a body's approach at the scroll. Under `svh` that is paid on nearly every shape rather than on the desktop alone. It is taken eyes-open and it is section 7's first finding, with the number Mark needs to overrule it.

### R2. A rung is a mark that fills, never a mark that brightens, and the filled and empty states differ by area alone

**Ruled: a filled mark against an outline of the same mark at the same luma.**

ADR 0014 binds every colour drawn while the field is live, and its own sentence includes "the readouts on top of it". ADR 0054 reads that as the HUD announcing by count, by shape or by subtraction and never by getting brighter. **So a lit mark and an unlit one cannot differ in value, and hue vanishes in grayscale, which leaves area.**

**This is slice K's own construction reused rather than a new one.** The reservoir's charge is a wide arc over a narrow track, `hudInk` at luma 67.23 against `reservoirCharge` at 67.25, 0.02 luma apart, and slice K measured the filled band at 6.25 to 7.50 CSS pixels against the bare track's 3.00 to 4.00 at the phone viewport (round two note section 13). The reading survived grayscale by width. A filled mark against an outlined one is the same trick at a smaller scale, it is already proved on this palette and on this device, and it needs no new colour.

**The count is the reading, five marks per line at `MAX_LEVEL` 5.** A rung is best expressed as a small count of objects: Gradius Options top out at four and Cave Story has three levels (`../research/visible-ladder-precedent.md` items 4 and 6), and Sky Force Reloaded shows a tier as ten blocks that progressively light up, which is the closest shipped portrait-mobile analogue anywhere in the record (research sections 2 and 3).

### R3. The HUD carries one row per line in the run's roster, in roster order, and never the build's four

**Ruled: driven by `RunState.roster`, not by `WEAPON_LINES`.**

`RunState.roster` is already resolved once at `createRun` from the pool the build holds and recorded in the tape header (ADR 0046, `src/game/run.ts`). The push's standing constraint is that weapon lines stay extensible and adding a fifth line is one weapon module plus its data rows. **A HUD that iterated the build's four would be the one place a fifth line needed a retune of the others**, and it would draw a row for a line the run never had.

A rostered line at level 0 draws its icon with every mark empty, because it can still be offered. A line outside the roster draws nothing at all.

### R4. Score is paid by kills and by overflow, and the two ADRs that say so do not conflict

**Ruled: both sources are built, and neither ADR is superseded.**

ADR 0002 says "score is kills, and killing buys room to live". ADR 0003 and decision-log entry 4 say growth past the size ceiling converts to score, so a big meal at full size is never worthless. **The tree implements only the second.** `state.score` is written in exactly one place in the sim, `src/game/swallow.ts`, and only from overflow; `git log -S` says that is the only site it has ever had. Nothing pays score for a kill and never has.

**Neither ADR says its source is the only one, so both are built and nothing is superseded.** Score becomes kills plus overflow.

**Why this belongs to step 5 rather than to a later ticket.** #99's acceptance criteria include "Score bleeding at the floor is visible as it happens", and ADR 0003's floor ladder spends the score before it spends a level. Under overflow alone a run that never reaches the size ceiling carries a score of exactly zero for its whole length, so the HUD would draw a number that never moves and the ladder's first rung would be dead in precisely the runs it exists for. **A readout the player learns to stop reading is worse than no readout**, and this is the step that would teach them.

**What a kill pays is a field on the mob row, exactly like `corpsePayout` beside it** (`src/game/mobs.ts`), never a compiled constant, per the standing rule that a number which must exist before it is measured is data. Every mob row carries it because every mob row carries `corpsePayout`, so a body without one is not a state the type permits. The score is paid on the kill and not on the swallow, which is what ADR 0002's sentence says and what keeps the two currencies clean: kills pay score, swallows pay size and reservoir.

**The rung the ladder bled stays bled until the grave grows off the floor.** Ruled by the orchestrator on 2026-09-16 after both the vision and the design gates raised the same thing independently, and it is the mechanism that keeps two of Mark's own rulings from cancelling each other.

**The problem, in the numbers the design gate brought.** The storm kills about 2.47 bodies a second (`step-4-progress.md`). If every kill pays score, then a floor hit bleeds the score, the next kill re-arms it within half a second, and the next floor hit bleeds it again. **The level strip and the fallen rung could then only ever fire where nothing is dying, and in the mow the floor would be immortality**, which is the one thing ADR 0003 says the floor is never. Autofire would be paying the ladder's toll for the player.

**The mechanism.** Once a floor hit bleeds the score rung, kills do not re-arm it while the grave is still at the floor: the ladder remembers the bled rung, so the second floor hit while small strips a level, and the third strips again. **Growing off the floor is what resets it**, and growing is the player's own act, a dive under food while small and under fire. Score itself keeps accruing from kills the whole time, so nothing is taken away from the player; what is withheld is the rung's ability to absorb a second hit for free.

**The precedent is Sonic's rings and it is the same shape.** Rings are both the score and the death buffer, and they refill only by the player's own act of collecting them (`floor-ladder-precedent.md`). Nothing in that game refills the buffer as a side effect of the player's weapon firing. Here, without this rule, it would.

**Both of Mark's rulings stand whole.** Score is kills (decision 10 and ADR 0002) and score bleeds before levels (ADR 0003). This is what lets both be true at once rather than a re-ruling of either, and section 7 carries what he will see so his own play can overrule it.

**The bled-rung memory is one folded field and it is the step's only witness move**, in slice M1 where the rule lands, because `witness.ts`'s own comment says the version moves when the field list moves and this adds to it.

### R5. The score's bleed is watched, and it is a countdown rather than a snap

**Ruled: the readout falls to zero over a held transient, shorter than the replay lead-in.**

The sim sets `state.score` to zero in one tick (`src/game/grave.ts`, `bleedScore`) and that does not move. The renderer animates the readout down, which is renderer state born of a past tick and therefore a held transient, and `transients.ts` already has the registry for exactly that.

**Nothing shipped subtracts from a running score on a hit, and that is recorded as ours rather than pushed against** (ADR 0054). What does ship, everywhere, is a chain or a multiplier visibly collapsing: DoDonPachi's hit counter, Battle Garegga's medal chain, Ikaruga's chain, Resogun's multiplier, Devil May Cry's style rank dropping two letter grades. **Every one of them is watched leaving.** A number that is 41,300 on one frame and 0 on the next has not been seen to leave, it has been seen to have left, which is the same failure ADR 0054 names for a rung inside a dense storm.

**It must stay under `REPLAY_LEAD_IN_TICKS` 90**, because the lead-in is honest exactly when it is at least as long as the longest lifetime in the registry, and a bleed longer than 90 ticks moves that constant and the whole fast-forward with it. A declared starting figure of 40 ticks, two thirds of a second, sits well inside it and is long enough to be watched.

**The countdown starts from the `scoreBled` event and targets the live score, never a remembered zero.** R4 keeps kills paying score while the grave is at the floor, so the sim's score is climbing again before the animation finishes. A countdown that drove toward zero would land on a number the sim left behind and then jump; one that eases from the bled amount toward whatever `run.score` currently reads lands on the truth. **The view never diffs the score to find out a bleed happened**, because a diff cannot tell a bleed from an overflow that happened to be negative; the driver hands it the event, which is the seam R7 and the tech gate both name.

### R6. A stripped rung falls where the loss happened, spread at the offer's own spacing, and it never decays

**Ruled: the bodies spawn at the grave, spread in roster order at `OFFER_SPACING`, drift at the scroll, and belong to the treasure class.**

ADR 0055 rules the body and leaves where it lands, how fast it drifts and whether it decays as stage and tuning data. Decision 24 rules one body per rung stripped and that a swallowed rung restores its own line. **What the tree adds and neither has reckoned with is that `stripLevels` takes one level off every line that has one to give, all in the same tick** (`src/game/grave.ts`). So a single hit at the floor can strip four rungs and drop four bodies at once.

**They spread rather than stack, and the spacing is the offer's own.** #81 is open on bodies stacking on one spot and already names the rung body as a new caller. `OFFER_SPACING` is 90 field units and was derived from the grave's own reach so that two adjacent bodies are both reachable only from inside 45 units of their midpoint, which puts a two-body catch outside a start-size grave entirely (`src/game/offer.ts`). **Reusing it makes the loss the mirror of the gain**: a gain is three bodies side by side and the grave gets the one it passes under, a loss is up to four and the grave gets back the one it dives for. The choice of which line to save is a real move rather than a free sweep, which is what keeps the floor ladder's teeth in.

**They drift at the scroll and nothing else.** The scroll is already the corpse deadline and the power-up deadline both (`CONTEXT.md`), and a second speed would be a second rule for a reader to hold. The teeth are the scroll deadline and the position the player is in, which is decision 20 verbatim.

**They do not decay, and that is the fourth kind's default row rather than a class invariant.** `CONTEXT.md`'s Treasure entry makes never-decaying treasure's defining property, and a rung that faded would be the one exception to a rule the whole food grammar rests on. **But ADR 0055 and decision 20 both leave decay as data**, so the vision gate is right that a test asserting it can never decay would rule something Mark left open. The `Corpse` record already carries a `decays` flag per body (`src/game/corpses.ts`); the fallen rung's row sets it false, **the test asserts the default and not an impossibility**, and a later tuning pass may turn it on without a record to re-rule.

**An untaken fallen rung stays on the field until the scroll takes it.** The design gate found this unruled and it is Battle Garegga's own answer: a dropped power item is an ordinary field item on the ordinary clock, and all of them stay. Nothing about a rung expires early, which keeps the deadline exactly one thing, the scroll, as the paragraph above already rules.

**They spawn offset from the grave rather than on it.** The design gate found a lone body spawning at the grave's own position and landing inside the swallow box, which would hand the rung straight back on the tick it was lost and make the whole loss a flicker. The offset is enough to clear the grave's half-extent plus the body's own at the size floor, and it is a data row rather than a constant, so the spread and the offset are the same rule read on two axes.

**Each body wears the icon its HUD row taught.** A rung body has to be told from an offer's body and from another line's rung, and the design gate found no test pinning the second. **The HUD has already taught the player one icon per line** (R1's construction), so the body wears that same icon and the reading needs no second vocabulary. ADR 0014 makes the classes tellable by silhouette first and brightness second, so the icon parts one rung from another and the treasure class's own shape parts a rung from an offer, and #122's complaint that the offer is not separable at a glance is a reason to give the rung its own shape rather than to share one.

**Defender is the precedent for the catch and it names the risk variable.** A humanoid released by a shot Lander falls and can be caught mid-air, and a fall great enough kills it, so catching early is safer than catching late (research section 8). Here the equivalent is the distance left to the bottom edge at the moment of the strip, which is decided by where the player was standing. **That is the lever, and it is free: nothing has to be tuned to make a late-and-low strip harder to recover than an early-and-high one.**

### R7. The loss announces on three channels and one of them is already built

**Ruled: the mark goes dark, the line's field expression blows up, and the body departs.**

ADR 0054 rules two channels and ADR 0055 adds the departure. The events exist already and are deliberately three rather than one, for this exact reason: `scoreBled`, `weaponStripped` and `sealed` stay separate because at the size floor there is no shrink, so ADR 0040's rim channel is silent and these three are the only second channel left (`src/game/events.ts`).

**Every line that paid announces, because every line that could pay does.** With `stripLevels` taking one off all of them, ADR 0054's "the player sees which line paid" resolves to "all of them", and four marks going dark at once reads as the bigger event it is. That is a consequence rather than a defect and it is named here so no slice treats it as one.

### R8. ADR 0054's field channel is amended in place: a line's rung is carried by that line's own expression, not by its projectiles

**Ruled: amend ADR 0054 in place, same question, new answer, in the docs commit ahead of every coder.**

ADR 0054 says each line's level is carried by that line's own projectiles and that a stripped line's projectiles blow up. **Territory has no projectiles.** It claims ground, its level buys radius and control strength, and ADR 0044 rules the tearing and the hands expression rather than identity. Its level curve is `RADIUS_BY_LEVEL` `[0, 32, 43, 58, 77, 104]`, an area and not a count (`src/game/lines/territory.ts`). So one line of the four cannot satisfy ADR 0054's field channel as worded, and no amount of building will make it.

The amendment is one word's worth: **a line's rung is carried by that line's own expression on the field**, which covers the stream's columns, the bell's cones, the wisps' count and Territory's ground alike. What stood: both channels existing, and neither being the only reading of a loss. What changed: the word projectiles. What it could not have known: Territory shipped as ground rather than as a shot, which happened after the ADR was written.

**ADR 0054 is one Mark ruled, so the amendment carries ADR 0058's own line and is listed for him.** The vision gate is right that a step's docs slice editing a Mark-ruled ADR is not the same as a slice editing one of ours. The amendment therefore ends with the sentence ADR 0058 already uses for this case, that it is **taken under one-push mode and is Mark's to overrule before merge**, and it is named in section 7 so it reaches his read rather than only the file. `CONTEXT.md`'s Rung entry carries the same word and loses it in the same commit.

**Section 3.3 has the measured state of that channel per line, and it is why this record does not promise to finish it.** Step 5 builds the HUD channel whole and the field channel only as the loss announcement. Making each line's rung countable in its own expression is a per-line design job that belongs beside each line, not inside a HUD slice, and it is named in section 7 rather than built here.

### R9. `CONTEXT.md`'s HUD entry is amended, and three terms the game already speaks get entries

**Ruled: one docs commit, ahead of every coder.**

`CONTEXT.md` calls the HUD "the slim readout inside the field frame". Under R1 it is inside the frame on a desktop and above it on a phone, so the entry is amended to name the field's top edge rather than the frame's inside. Precedent outranks our own record and every shipped portrait shmup in the research record puts the readout in the surround where a surround exists.

Three terms are used across the glossary and the ADRs and have no entry of their own.

**Dive.** `CONTEXT.md` uses "the dive" in the Wisps entry and in the Rung entry and defines it nowhere. Step 5 is the step that makes the dive the recovery verb for a lost rung, so it gets an entry here.

**Score.** There is no Score entry, and score is about to be the largest number on the screen. R4 gives it two sources and the entry says so.

**Fallen rung**, or whatever the term lands as, for the body ADR 0055 rules. Rung already means the step; the body needs its own word.

**The Rung entry loses the word "projectiles" in the same commit.** It reads "A rung is carried by that line's own projectiles", which is the sentence R8 amends in ADR 0054 and it is wrong in `CONTEXT.md` for the same reason: Territory has none.

**The 540x760 doc fix is struck, because the disagreement no longer exists.** The tech gate deferred it pending a check and the check says the item is stale: `CONTEXT.md` contains no "540" anywhere at all, so the handoff's `CONTEXT.md:85` points at a line that has since been rewritten out, and the two legs that do exist, `src/game/field.ts` and `layout.test.ts:67`, both say 540 by 760 and agree. **Nothing is edited and the handoff's open item 4 is closed as already fixed rather than carried forward.**

The shove and the impulse still have no entry either (handoff open item 9). **That one is not step 5's and is not folded in here**, because it belongs to round two's slices and adding it from this record would hide it in an unrelated commit.

### R10. The frame's three regimes are named, and the squeeze is the one nobody has looked at

**Ruled: the layout work is specified against three measured regimes and not against two named devices.**

Section 3.1 is the table. **The regime nobody had designed for is the third**, where the viewport's aspect is near the field's own and neither a band nor a gutter is large enough for anything. **Under `svh` that regime stops being the corner case and becomes the phone's standing layout**, which the design gate caught and section 3.1 now measures: on every `svh` row the belch's control sits over the field, by 17 to 112 stage units depending on the device and on whether M2's even split is built. The portrait tablet stays in the table **as a test viewport only**; nobody plays this on a tablet and it is there because it is the cheapest shape that exercises the squeeze deterministically.

**M2 splits the slack evenly and that is the mitigation, not the fix.** `fitField`'s lowering branch centres the field inside the box *below* the reserve, so the reserve's 120 units land entirely on top and the bottom band takes what is left; that is what turns a symmetric band into 133 above and 13 below at an iPhone at `svh` 660. Centring the field in the whole box and pushing it down only far enough to clear the reserve gives 120 and 26 at the same viewport, and it takes the belch's overlap from 107 units to 94, from 80 to 39 at `svh` 700, and from 69 to 17 on a Pixel 8. **It does not reach zero anywhere and at the shortest viewports it changes nothing at all**, because there the field simply fills the stage. The overlap is section 7's second finding and Mark's corner ruling is why it is filed rather than solved.

**The page's own viewport declaration is inside this step's scope and two things in it are wrong.** `viewport-fit=cover` is set, so `env(safe-area-inset-*)` returns real insets and the canvas extends under the Dynamic Island and the home indicator, and **nothing in `public/style.css` or anywhere else reads those insets**. And `#app` is sized at `100dvh`, whose comment says it is there so the URL bar never hides the HUD; `dvh` updates live as the browser chrome retracts, which is what makes the stage height change mid-run and re-fit the field under the player. `svh` is the small viewport, the one that fits with the chrome fully expanded, and it is the unit for a canvas that must never be clipped and must never move (research section 10).

**Ruled: `svh`, on `#app`, with `resizeTo` pointed at `#app`, and the inset taken out of the measured box rather than read by the layout.**

**The `svh` change alone does nothing, and the tech gate caught why.** `engine.ts:46` does `opts.resizeTo ??= window`, and `ResizePlugin` reads `globalThis.innerWidth` and `globalThis.innerHeight` whenever `resizeTo` is the window. **So the canvas is sized from the window and never from `#app`**, whatever `#app`'s own height is, and on iOS `innerHeight` tracks the dynamic viewport, which is the clipping `svh` was supposed to prevent. **`resizeTo` must point at the `#app` element in the same commit as the `svh` change**, or the change is a stylesheet edit with no effect the player could see.

**The safe-area inset shrinks the measured box, and `layout.ts` stays viewport-blind.** A first draft said the stylesheet reads the insets "for the bottom control", which is incoherent: `BelchButton` is placed in stage units by `GameScreen.resize` and has no way to read a CSS environment variable. **The mechanism is `#app { height: calc(100svh - env(safe-area-inset-bottom)); }`**, so the box the engine measures is already clear of the home indicator and every stage unit inside it is safe by construction. `layout.ts` keeps knowing nothing about devices, insets or browsers, which is the property its own header claims and the one worth protecting.

**What that buys, at the numbers.** At an iPhone 15 viewport the belch button's bottom edge sits about 9 CSS pixels from the bottom of the screen, inside the roughly 34-point home-indicator region, so a press that starts low is a press the operating system may take. Shrinking the box lifts every stage unit clear of it at once, for the belch and for anything placed there later. The inset is read from `env()` rather than declared, because the numbers are empirical and Apple does not publish them (research section 9).

**#102 is not solved by any of this and this record does not claim it is.** `touch-action: none` and `overscroll-behavior: none` are already set in `public/style.css`, which is the whole documented mitigation, and the back-swipe still happens. No specification-level mechanism to suppress the system edge gesture in iOS Safari was found (research section 11). #102 stays where Mark put it, at the end of the push.

### R11. The bank moves out of the dev stack and into the HUD

**Ruled: `BANK n` leaves `RunHud` and becomes part of the row.**

`RunHud` is the dev corner stack and its own comment says the bank line is the stand-in form and that the field-side readout belongs to the ladder HUD (`src/app/screens/game/RunHud.ts`). #99's second comment records that #96's criterion "the bank is visible on the live offer" landed there as a recorded craft call deferred to this step, and that #99 closes it when the strip lands. **So it closes here, and it draws nothing at all at a bank of zero**, which is the existing rule and the reason for it is unchanged.

### R12. The dev corner stack stays, and the HUD does not replace it

**Ruled: they coexist, and the player build is #66's.**

The dev stack carries debt, tick, seed, pinned size, pinned levels and the fault line, none of which is the player's. `fitField`'s own comment says the corner readouts are dev-only and come out before v1, and #66 owns the build flavour that does the coming out. **Step 5 neither deletes them nor gates them**, because gating them is #66's whole job and doing half of it here would leave two mechanisms.

What this does mean is that on a phone the dev stack occupies stage y 12 to 172 and the HUD's band sits immediately above the field's top edge at roughly 178 to 204, which is tight and will overlap on a shortened window. That is a dev-build-only collision and it is not worth paying field area for; it is named so nobody reports it as a bug.

## 3. What already exists in the tree

Read at tip `55f05ccdd5`.

### 3.1 The frame, measured at eight viewports

Computed from `src/engine/resize/resize.ts` and `src/app/layout.ts`'s `fitField` with `READOUT_RESERVE` as declared, margin 12, width 260, height 120. The field is 540 by 760.

**Measured under `svh`, which is what R10 rules and what the player actually gets.** A phone's small viewport is its screen less the browser chrome, it is device and browser specific, and it is read at runtime rather than declared, so the phone rows are a spread across the heights a phone plausibly reports rather than a claim about any one device. The `lvh` row is kept for contrast: it is what the build gives today under `dvh` with the chrome retracted, and it is what a first draft of this record wrongly treated as the phone's normal case.

| viewport | stage | field scale | side gutter | band top / bottom, today | band, with M2's even split | belch over field |
| --- | --- | --- | --- | --- | --- | --- |
| iPhone 15, svh 600 | 540x824 | 1.0000 | 0 | 32 / 32 | 32 / 32 | **yes, 88** |
| iPhone 15, svh 660 | 540x906 | 1.0000 | 0 | 133 / 13 | **120 / 26** | **yes, 107 to 94** |
| iPhone 15, svh 700 | 540x961 | 1.0000 | 0 | 161 / 41 | **120 / 81** | **yes, 80 to 39** |
| iPhone 15, lvh 852 (contrast) | 540x1170 | 1.0000 | 0 | 205 / 205 | 205 / 205 | no |
| Pixel 8, svh 750 | 540x983 | 1.0000 | 0 | 172 / 52 | **120 / 103** | **yes, 69 to 17** |
| narrow phone, svh 460 | 540x776 | 1.0000 | 0 | 8 / 8 | 8 / 8 | **yes, 112** |
| tablet portrait, 820x1180 (test only) | 820x1180 | 1.5185 | 0 | 13 / 13 | 13 / 13 | **yes, 107** |
| narrow desktop, 1024x900 | 1024x900 | 1.1842 | 192 | 0 / 0 | 0 / 0 | no |
| desktop, 1440x900 | 1440x900 | 1.1842 | 400 | 0 / 0 | 0 / 0 | no |

All figures are stage units, and the belch column is the vertical overlap where both axes overlap.

**The three regimes are the table's three shapes.** A tall shape gives bands and no gutter. A wide shape gives gutters and no band. Between them, at a viewport aspect near the field's own 0.711, both collapse together and every control ends up over the field. **What `svh` changes is which regime a phone lives in**: under `dvh` with the chrome retracted it was the first, and under `svh` it is mostly the third.

Three things in the table are worth saying out loud. **The side gutter on every phone is exactly zero**, which is what closes R1 and is unchanged by `svh`. **The top band is under the HUD's 28 units on two of the five phone rows and only comfortably over it on two**, which is why R1's row draws over the field's top edge on nearly every shape rather than only on a desktop. And **the lowering branch puts the whole 120-unit reserve on top**, which is the 133/13 row, and M2's even split is what turns it into 120/26.

**The mark's size at each of these**, because R1 declares the band from the mark and not the other way round: an 11-unit mark measures **6.5 CSS pixels at the narrow phone, 8.0 at an iPhone 15, 8.4 on a Pixel 8, 13.0 on a desktop and 16.7 on the tablet**, against the 6.25 floor slice K measured and proved.

The belch's target holds its own floor everywhere: `BELCH_SIZE` 108 measures 64.0 CSS pixels at the narrow phone, 78.6 at an iPhone 15, 82.4 on a Pixel 8 and 108.0 on a desktop, against WCAG 2.5.5's 44 and Material's 48 (research section 9). **Its target is fine and its position is not**, which is the distinction section 7's finding turns on.

### 3.2 What draws today, and what does not

**No score is drawn anywhere in `src/app`.** Two comments in `PausePopup.ts` mention one; nothing renders it.

**`RunHud`** is the dev corner stack: debt, tick, seed, pinned size, pinned levels, bank and fault, all in `hudDim` at `METER_FONT_SIZE` 16, positioned from `cornerReadout.ts`'s `meterLinePosition`. Lines 5 to 7 already draw over the field by the meter's own ADR 0014 allowance.

**The palette already holds the HUD's colours and they are already inside the ceiling.** `hudInk` at luma 67.23, `hudDim` at 50.94, against `FIELD_LUMA_CEILING` 68, and `reservoirCharge` at 67.25 joined them in slice K. No new colour is needed for R2's filled-and-outlined marks; the pair is `hudInk` against itself.

**The layering stack** is `src/app/screens/game/layering.ts`, twelve named layers inside the field container with `mobFire` on top. The HUD is not one of them: it is a sibling of the field in `GameScreen`, which is where the corner stack and the two controls already live, and ADR 0014's own sentence contemplates that by binding "the readouts on top of it".

**The controls.** The pause button is the template's shared `Button` in the template's pink, outside the palette scan, at top-right from `READOUT_RESERVE.margin`. The belch's control is `BelchButton`, 108 units at the same margin in the bottom-left since slice K.

### 3.3 The field channel, per line, measured

ADR 0054's storm half is built for one line of four.

| line | level curve | is it a count | on screen between events |
| --- | --- | --- | --- |
| skull stream | `COLUMNS_BY_LEVEL` `[0,1,2,3,4,5]` | **yes, exactly** | continuously |
| bell | cones per level, 1 to 5 with the surround at 5 | yes | only during a toll |
| wisps | `WISPS_BY_LEVEL` `[0,1,3,5,8,11]` | nominally, but the live count varies as they hunt and die, and 8 against 11 is not countable | while any are alive |
| Territory | `RADIUS_BY_LEVEL` `[0,32,43,58,77,104]` | **no, it is an area** | while a patch lives |

**The stream is the only line whose rung a player could read off the field today**, and it is the birthright, so it is the one line every run has. Two of the four are invisible between their own events. This is R8's evidence and section 7's third finding.

### 3.4 The sim's side

`RunState` already carries `score`, `levels` keyed by line, `roster` and `bankedOffers` (`src/game/run.ts`). `run.score` is already folded into the witness (`src/game/witness.ts`), so **paying score on a kill moves no witness version**; it moves `GOLDEN`, because the canonical scenario kills things.

`runFloorLadder` bleeds the whole score, then strips one level off every line with one to give, then seals (`src/game/grave.ts`). The three events already exist and are already separate.

`Corpse` already carries `kind`, `line`, `decays` and `halfExtent`, and `FoodKind` is `'corpse' | 'powerUp' | 'feast'` (`src/game/corpses.ts`, `src/game/swallow.ts`). **A fallen rung is a fourth kind on an existing pool rather than a new pool**, which is the cheapest shape available and the one that gets the swallow path, the scroll, the containment and the renderer for free.

## 4. The slices, in one order

Each is one commit: tests, minimal implementation, record amendment, green before the next begins, with CodeRabbit CLI before each code commit and the test-name diff on every slice. One Opus coder per slice, each handed `step-4-coder-contract.md` and the dispatch contract.

**Step 5.0, the docs commit, ahead of every coder.** ADR 0054 amended in place per R8 and carrying ADR 0058's one-push overrule line, `CONTEXT.md`'s HUD entry amended and its Rung entry losing "projectiles", three entries added per R9, the research record cited from both, and **one line added to `visible-ladder-precedent.md` noting that its MAX-buffer recommendation is superseded by section 7's ruling**, so the research and the record do not point in opposite directions. **The 540x760 fix is struck rather than carried**, per R9: the check says the disagreement no longer exists. One commit, no code.

The HUD entry's amended text, so the docs slice writes it rather than composes it.

> **HUD**: The slim readout at the field's top edge carrying the score and each line's rungs as marks: the ladder's second channel, and the one that makes a rung lost legible inside a dense storm. It sits in the band above the field where the screen leaves one and over the field's own top edge where it does not, and it announces by count, shape or subtraction, never by brightness. _Avoid_: strip, bar, panel, overlay.
>
> **Amended 2026-09-16, at path step 5.** What stood: the readout's job, its content, and the announcing rule. What changed: "inside the field frame" becomes the field's top edge, because the readout has one home on both screen shapes and the frame's inside is not it. What the entry could not have known: a phone leaves no side gutter at all and a desktop leaves no band at all, both measured exactly zero, so the surround the readout wants is on a different axis on each shape (`docs/design/show-what-you-have.md` section 3.1).

The three new entries are **Dive**, the verb the grave recovers with, used in the Wisps and Rung entries today and defined nowhere; **Score**, which R4 gives two sources, kills and overflow; and **Fallen rung**, the body ADR 0055 rules, named so it is plainly the same thing as a Rung at a second moment.

**Slice M1. A kill pays score, and a bled rung stays bled until the grave grows.** R4, both halves. The score field on every mob row beside `corpsePayout`, paid where the kill is resolved and not at the swallow; the bled-rung memory, set when a floor hit bleeds the score and cleared when the grave grows off the floor; the invariant; and the fold. Sim only, no render. **This slice carries the step's one `WITNESS_VERSION` move, in its own commit**, because the memory is a new folded field and `witness.ts`'s own rule is that the version moves when the field list moves. **`GOLDEN` re-pins once**, because the golden scenario carries scripted kills (`src/dev/digest.ts`) and those now pay score. First, because everything the HUD shows about score is false until it lands, and because the memory is what keeps the strip and the fallen rung reachable at all.

**Slice M2. The frame is composed, and the band is reserved.** R1's placement rule and R10. `layout.ts` gains the HUD band as a declared reserve beside `READOUT_RESERVE` and the placement function that puts it outside the field where the band allows and over the field's top edge where it does not; `fitField`'s lowering branch centres the field in the whole box rather than in the box below the reserve, which is the even slack split; **`public/style.css` moves to `height: calc(100svh - env(safe-area-inset-bottom))` and `engine.ts` points `resizeTo` at the `#app` element in the same commit**, because the unit change without the `resizeTo` change is a stylesheet edit the canvas never sees; the three regimes get their tests. **No HUD content yet and no sim change, and `layout.ts` still knows nothing about devices or insets.** Second, because the HUD's slice needs a rectangle to draw into and the reserve is what the HUD's test measures itself against.

**Slice M3. The HUD carries the ladder and the score.** R1's form, R2's marks, R3's roster rows, R11's bank. A dumb view, data in and pixels out, with the driver outside owning the data and the diffing. No sim change.

**Its data seam, named here because the tech gate found it missing and `RunReadout` carries none of it today.** The roster arrives once, at the run's start, through `showIdentity`, which is already the seam for what a run was born with. The score, the levels and the bank arrive every frame through `render`, which means `RunReadout` gains three fields. **R5's countdown is driven from the `scoreBled` event in `GameScreen`'s own event handling and never from the view noticing the score fell**, because a view that inferred a bleed from a diff would be a second implementation of the rule and would read an overflow as a bleed. The HUD's rectangle is read from `fitField`'s output rather than recomputed, for the reason `GameScreen` already holds the placement rather than recomputing it at event time.

**Slice M4. The loss is watched.** R5 and R7. The score's countdown as a held transient declared in `transients.ts`, the mark going dark, and the field expression blowing up for the lines that can carry it today. Renderer only; the three events already exist. **A deploy with a rendered check Mark can see**, because the whole step's done line is his read.

**Slice M5. The stripped rung falls and the dive catches it.** R6. The fourth food kind, one body per rung stripped, spread at `OFFER_SPACING` in roster order and contained inside the field, drifting at the scroll, never decaying, and a swallow restoring its own line. **No witness move, and `GOLDEN` re-pins at most once.** The tech gate is right that this slice declares no new folded field: the fallen rung rides the corpse pool with a fourth `kind` and the `line` and `decays` fields the record already carries, so the fold's field list does not move and `witness.ts`'s own rule keeps the version still. And the golden scenario deliberately never grinds the grave to the size floor (`digest.ts`'s `FILE_X` is placed clear of the script's wander), so nothing in it can strip a rung; **the permit is "at most one" and an unused permit is the expected outcome, not a miss.** Last of the building slices, because it is the only one with real sim surface and it wants the three before it green.

**Slice M6. The ladder's cost is measurable.** Two readings the batch cannot print because it has not declared them. **The bot's take rate on fallen rungs**, because a body at the bottom of the field is something the base policy will always walk to (ADR 0055 and ADR 0053), so the number is a reading rather than a bug. And **strips per run**, which is what says whether R4's bled-rung memory left the level strip reachable in ordinary play or whether the storm's kill rate still buries it; the vision and design gates both asked for it and it is the evidence Mark's finding in section 7 is answered with.

**`READINGS_VERSION` does not move in M6**, and the tech gate is right to stop it there. `readingsVersion.ts`'s own rule is that the version moves when a reading's *meaning* changes, a split or a redefinition, and not when new readings arrive beside unchanged ones; both of these are new. **The step's one readings move is M1's, 6 to 7, for `run.score`'s own meaning changing under R4, and section 5 names it**; M6 arrives beside unchanged readings and spends nothing. It is still its own commit rather than part of M5, for round two's stated reason that a reading landing in the same commit as the mechanic hides which of the two moved a number.

**Notes a coder would otherwise find the hard way, each read out of the tree.**

- **`FieldRenderer` picks the treasure layer with `corpse.kind === 'powerUp'`** (`FieldRenderer.ts`), so a fourth kind draws as a plain corpse until that predicate is widened. M5 widens it by kind rather than by a new flag.
- **`stripLevels` walks `WEAPON_LINES` and not `state.roster`** (`grave.ts`), so the order the fallen bodies spawn in is the build's order rather than the run's. R3 and R6 both speak in roster order, so M5 makes the walk read the roster; it changes no behaviour today, because `implementsLines` already keeps a roster inside the pool, and it is the line a fifth weapon would break.
- **The HUD reads `fitField`'s output rather than recomputing a placement**, for the reason `GameScreen` already holds the placement rather than recomputing it at pointer time: two computations in parallel agree only until one of them changes.
- **`RunReadout` carries no score, levels or roster today.** M3 adds them; see its own paragraph for which arrive once and which arrive per frame.

**Step 5.7. The gates, then CodeRabbit on the exact tip**, then a batch, then the deploy. Gates before the reviewer, because a finding that changes code invalidates a review, and a finding against a ruling is filed and built past.

## 5. What must not move

The step 4 contract's what-must-not-move list stands whole and unabridged. This step adds six.

**`FORMAT_VERSION` 4 stays.** Nothing here changes the wire.

**The step's whole budget is one `GOLDEN` re-pin, one at-most permit, one witness move and one readings move, each named by its slice** (orchestrator, 2026-09-16, under one-push mode, restated after the tech gate and again when the readings move was seen), which is the shape round two's own section 5 uses.

**`WITNESS_VERSION` moves exactly once, in slice M1, in its own commit**, for R4's bled-rung memory, which is a new folded field. A second move anywhere is a stop. **M5 is permitted none**, because the fallen rung rides the corpse pool on fields the fold already carries and `witness.ts`'s rule is that the version moves when the field list moves.

**`GOLDEN` re-pins exactly once, in M1**, because the golden scenario carries scripted kills and those now pay score. **M5 is permitted at most one**, and the expected outcome is that it goes unused, because the scenario never grinds the grave to the size floor and so can never strip a rung; a move there is a finding to explain before it is a re-pin. **M2, M3, M4 and M6 are each permitted none**, and a move in any of them is a stop and report, because none of them opens `src/game`.

**`READINGS_VERSION` moves exactly once, in slice M1, in the same commit as the score change.** `run.score` is a declared reading in `batchReport.ts` and `compareRuns.ts`, and R4 changes what it means, from growth past the size ceiling alone to kills plus that growth: same name, different definition, which is `readingsVersion.ts`'s own rule for when the version moves. **M6's two readings still move nothing**, because new readings arriving beside unchanged ones never do, and **no other slice is permitted a move**.

**This paragraph said the version does not move in this step at all, and it was wrong rather than stale** (orchestrator, 2026-09-16, under one-push mode). What stood: M6's two readings not moving it, and the rule that decides both cases. What changed: `run.score` is itself a reading, so the step does carry one move. What the paragraph could not have known: it reasoned only about the readings M6 adds and never about the reading R4 redefines.

**No number in the layout is a sim number, and the field stays 540 by 760.** #72's own criterion. The HUD is drawn in field units and the sim never learns the viewport, so nothing about the frame changes what a seed plays.

**The field never pays width for a readout, at any viewport.** Mark's 2026-08-22 ruling and the test of that name. R1 is built so that it does not have to be reopened, and section 7 carries the finding that would reopen it.

**The belch's control keeps the bottom-left corner.** Mark's 2026-09-15 ruling. Section 7 carries a measurement against it and nothing in this record acts on it.

And the layering holds: nothing draws above `mobFire` inside the field stack, and the HUD is outside that stack rather than an exception to it.

## 6. Verification, and the tests that pin the promises

Actor agent unless named. `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, and `pnpm verify` green twice on the committed tree. Replay determinism at each sim slice's tip: one seed played twice, same tick count, same witness at every checkpoint, identical stream cursors. A tape measured to `outcome: 'verified'`, and a conditioned tape at the ladder rig with levels pinned, because the HUD is loudest with a full build. A pre-M1 tape refused by its witness version rather than diverging, once, in M1, which is where the witness moves. The fences green, each named by title. The palette scan green over anything the HUD declares. **A rendered check that plays a run, ends it, and plays another**, because one that only ever plays run one is structurally blind, and a grayscale screenshot of the HUD at a partway ladder, because R2's whole claim is that the reading survives grayscale.

**A headless browser cannot photograph a short-lived state** (handoff standing rule), so the score's countdown and the mark going dark are pinned by test in the renderer and their feel is Mark's own read at sixty frames a second.

**Actor Mark, blocking nothing**: a run played on the phone and on the desktop, a hit taken at the floor, and a falling rung chased once.

The tests, named as the sentences they promise.

- The HUD's row sits at the field's top edge at every viewport, outside the field where the band allows it and over the field's own top edge where it does not, and it is never clipped.
- The HUD's measured content fits inside the band `layout.ts` declares, at the narrowest shipped phone.
- One mark subtends the same fraction of the field's width at a phone viewport and at a desktop one, and measures at least 6.25 CSS pixels at the narrowest viewport in the sweep.
- The HUD draws one row per line in the run's roster, in roster order, and none for a line the roster does not name.
- A rostered line at level zero draws its marks and none of them filled.
- A filled mark and an empty one differ in grayscale by area and by no step in value, and every colour the HUD draws sits at or below the field's ceiling while the field is live.
- The HUD's row is never mistaken for the field's boundary: the boundary's stroke and the HUD's marks are separable in grayscale at the narrowest phone.
- A power-up swallowed fills exactly one mark, on the line it levelled, on the tick it was swallowed.
- A kill pays score from its own row, and the score a run ends on is the sum of what it killed and what it overflowed.
- A floor hit that bleeds the score leaves the rung bled: kills keep paying score, and the next floor hit while the grave is still at the floor strips a level rather than bleeding again.
- Growth that lifts the grave off the floor re-arms the score rung, so the next floor hit after it bleeds rather than strips.
- A hit at the size floor with score standing bleeds the score and takes no level, and the readout is seen at a value between the old one and zero on at least one frame.
- The bleed's held lifetime is declared in the transient registry and is shorter than the replay lead-in.
- A hit at the floor with no score takes one level off every line that has one to give, darkens exactly those marks, and drops exactly that many bodies.
- A stripped rung's bodies stand apart at the offer's own spacing, in roster order, every one of them inside the field.
- A fallen rung drifts at the scroll alone, never decays, and is lost off the bottom edge the way any body is.
- Swallowing a fallen rung restores the line it came from and no other, and a line at its cap is never restored past it.
- A fallen rung is told from an offer's body by silhouette with colour removed, and one line's fallen rung is told from another's by the icon its HUD row taught.
- A fallen rung nobody takes stays on the field until the scroll carries it off, and nothing else removes it.
- A fallen rung spawns clear of the grave's own swallow box at the size floor, so the body that was just lost is not handed back on the tick it fell.
- A fallen rung's row sets decay off by default, and a row that turns it on decays, so non-decay is the default rather than an impossibility.
- The bank reads on the HUD when carriers are waiting and draws nothing at all at zero.
- The page's canvas is sized to the small viewport and the renderer measures the element rather than the window, so the field's placement does not move when the browser's chrome retracts mid-run.
- A shortened window splits its slack evenly above and below the field rather than piling the reserve's whole height on top.
- The bottom control's target clears the safe-area inset the page reports, and still measures at least 44 CSS pixels at every viewport in the sweep.
- The frame's three regimes each place every control and readout deliberately, asserted at a tall viewport, a wide one and one at the field's own aspect.

## 7. Findings filed for Mark's read, not applied

Each is written down and built past, per the standing rule that a finding against something he ruled is filed rather than applied.

**The second hit while small now strips, and a dive that grows the grave resets it.** This is the one behaviour in the step he has not asked for and will feel first. Under R4 a kill pays score, so without a further rule the score rung would re-arm about twice a second at the storm's measured kill rate and the level strip would be nearly unreachable; with it, the rung the ladder bled stays bled until the grave grows off the floor. **What he will see**: take a hit at the floor and lose the score; take a second before growing and lose a level off every line, with the bodies falling; dive under food to grow, and the next hit costs score again. **Why it is not a question**: both of his own rulings, score is kills and score bleeds first, are true only if something stops autofire from paying the ladder's toll, and ADR 0003 says the floor is never immortality. **If it reads as too harsh, the lever is his and it is one rule**, not a tuning number. M6's strips-per-run reading is the evidence beside the question when he answers it.

**ADR 0054, which he ruled, is amended by a slice of ours rather than by him.** R8 changes the word "projectiles" because Territory has none, and `CONTEXT.md`'s Rung entry loses the same word. It is taken under one-push mode and carries ADR 0058's own overrule line inside the file. **It is listed here because a Mark-ruled ADR edited by a docs slice should reach his read and not only the tree**, which is the vision gate's point and it is right.

**The HUD over the field costs 0.74 seconds of a body's approach, on nearly every shape rather than on a desktop alone, and releasing his own ruling would buy it back for 3 percent of the field's width.** R1 puts the row over the field's top edge on a desktop because the band there is exactly zero and because his 2026-08-22 ruling says the field never pays width for a readout. The arithmetic of the alternative: reserving 26 units at the top of a 1440 by 900 stage takes the field's scale from 1.1842 to 1.1500, so the field goes from 640 by 900 to 621 by 874 and pays 19 stage units of width out of 640. **His ruling's own recorded reason was a phone whose URL bar ate the height and a refresh that gave the width back, and that the corner readouts were dev-only and would come out before v1.** The second half of that reason stops being true at this step, because this readout is the player's and permanent. **Nothing here acts on it; the number is his to overrule with.**

**Under `svh` the belch's control sits over the field on his phone, every run.** A first draft had this as a corner case at three of eight viewports; the design gate caught that `svh` makes the short-window row the phone's standing layout, and the re-measurement in section 3.1 says the overlap is on every phone row: 88 units at an iPhone at `svh` 600, 107 at `svh` 660, 80 at `svh` 700, 69 on a Pixel 8 and 112 on a narrow phone. **M2's even slack split is the mitigation and it does not reach zero**, taking those to 94, 39 and 17 on the three rows where the field has slack to move into and changing nothing at all on the two where it does not. **He ruled the corner and ruled handedness future work, so the corner does not move.** What is worth his eye is that the button's target was never the problem, 64 to 108 CSS pixels against a 44 floor, and its position always was.

**The play area on his phone gets slightly smaller, and stops moving.** Slice M2 sizes the canvas to `svh` rather than `dvh` (section 9 ruling 7), so the stage is sized for the browser chrome fully expanded and never grows when the chrome retracts. What he loses is the taller field a collapsed URL bar used to give him; what he gains is a field that does not re-fit underneath him mid-run, which is the bug his own 2026-08-22 phone read first caught from the other side. **This is the one change in the step whose whole verdict is his phone read after the deploy**, because no test can tell a field that is correctly smaller from one that is wrongly smaller.

**The belch's control extends into the home-indicator region on an iPhone.** Its bottom edge sits about 9 CSS pixels from the bottom of the screen at a 393 by 852 viewport, and the home indicator's region is about 34 points tall. R10 reads the inset and lifts the control clear of it, which is inside this step. **What is filed rather than built is that this is the same boundary #102 lives on**, and #102 is his to schedule at the end of the push.

**The ladder's field channel is built for one line of four.** Section 3.3 has the table. The stream's rung is exactly its column count and a player can read it; the bell's and the wisps' are countable only while their own event is on screen; Territory's is an area and never a count, and R8 amends ADR 0054 to stop asking it to be one. **Step 5 builds the HUD channel whole and does not finish the field one**, because making each line's rung readable in its own expression is a design job per line and belongs beside each line. It is worth his eye because ADR 0054's premise, that the storm is the primary channel and the HUD merely confirms it, is currently true for the birthright alone.

**Cave Story's MAX buffer is available, cheap, and ruled out of V1.** [`../research/visible-ladder-precedent.md`](../research/visible-ladder-precedent.md) calls it the single most transferable mechanic it found and recommends building it; **that recommendation is superseded by this ruling and the docs slice writes one line into that file saying so**, so the two records do not point in opposite directions. Its case: an over-full top rung that the first hit spends instead of a level, turning an invisible cliff into a visible cushion. **What he would see if it were built**: a line at its cap carrying one mark past the five, and the first hit at the floor taking that mark rather than the level, so a maxed build survives one touch with its ladder whole. **Why it is not built** (orchestrator, 2026-09-16): R4 already gives the floor ladder a first rung that always holds something, so in every run the first floor hit costs score rather than a level, and the buffer would be a second cushion stacked in front of the first. Two cushions is a floor ladder with no teeth at the top, and the teeth are the point. **It is filed rather than asked because the case for it is a feel he has never had the chance to have**: nobody has yet lost a rung and watched it go, and if his first play of this step says the loss lands too hard, the buffer is the smallest thing that softens it and it is one data row.

**Nothing shipped subtracts from a running score on a hit, and nothing shipped strips power on a hit and then lets the player chase it.** Both are already recorded as ours in ADR 0054 and ADR 0055 and neither is pushed against here. This record adds one negative result to the second: R-Type, Darius and Thunder Force were checked for this pass and all three implement a death's power loss as an immediate subtraction with nothing to chase, so there is no shmup precedent for the catchable version at all (research section 8). **Step 5 is where both of ours first reach a screen, which makes his first play of it the evidence.**

## 8. Open questions that need Mark

None. Every question this record raised is ruled, in section 2 from the evidence beside it and in section 9 by the orchestrator.

## 9. The orchestrator's rulings on this record

Seven calls this record could not close from its sources alone, all ruled by the orchestrator on 2026-09-16 under one-push mode, each on the record's own recommendation. None of them is a slice's to reopen.

1. **Slice M1 stays inside step 5.** ADR 0002 and ADR 0003's floor ladder both already assume a score that moves, #99's criteria require one, and a HUD shipped over a number that reads zero for a whole run would teach the player to stop reading it. The step's budget is two `GOLDEN` re-pins and one witness move, named by slice in section 5.

2. **`CONTEXT.md`'s HUD entry is amended.** The phone's side gutter and the desktop's top band both measure exactly zero, so "inside the field frame" can only be honoured on a phone by refusing a free band and paying play area for something that costs nothing. The amended text is written out in section 4 for the docs slice to copy rather than compose.

3. **ADR 0054 is amended in place, supersession note inside.** Same question, new answer, number stays, slug follows the title. The decision did not change; the word "projectiles" did, because Territory has none.

4. **The research is extracted to [`../research/portrait-hud-and-catchable-loss.md`](../research/portrait-hud-and-catchable-loss.md)**, cited by section throughout, so the labelled weak items stay visible to whoever leans on them next rather than being flattened into a design record's prose.

5. **The 540x760 doc disagreement rides in the docs slice.** Three lines, and the commit is already a docs commit; #72 says to fix it here and the handoff carries it as open item 4.

6. **The fallen rung is called a fallen rung.** A word further from Rung would hide that the two are the same thing at two moments.

7. **Slice M2 moves `public/style.css` from `100dvh` to `100svh`.** A field that re-fits under the player when the browser chrome retracts is the worse of the two costs, and the standing rule is to decide the value and keep moving. **His phone read after the deploy is the check**, and it is annotated as such in section 7.

**The three gates ran on this record before any slice prompt was written, and their findings are folded in above rather than answered here** (markers on #72, 2026-09-16). Two of them independently found the same thing, that R4's score-on-every-kill re-arms the bled rung between floor hits and makes the level strip and the fallen rung nearly unreachable in the mow; that is ruled in R4 and filed in section 7. The rest changed R1's band derivation, R5's countdown target, R6's four open craft calls, R8's overrule line, R9's glossary and struck doc fix, R10's `svh` mechanism, section 3.1's whole table, section 5's budget and section 6's test list. **No gate finding was declined**, and the one that touched a Mark-ruled ADR is listed in section 7 rather than only applied.

**And section 8's question is ruled rather than asked.** Cave Story's MAX buffer is out of V1, on this record's own reasoning that R4's first rung is already the cushion. It moved to section 7 as a finding, worded as what he would see if it were built and why it was not.

