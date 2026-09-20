# The grave in the ground, and the fall (#148, #106)

The design record for the one step of the branch `148-grave-in-the-ground`. It holds the step's rulings, each with its evidence and how to reverse it. The decisions Mark approved on 2026-09-20 are numbered in `docs/branch/decision-log.md`; this record says what they mean for the game and for the code.

## What was wrong

Mark, from play of the V1 build, 2026-09-18: "The idea is that the grave is on the ground and currently the way the app plays, it's like a rectangular ship that's hovering above and that's not at all what this should be. It should feel like the grave is part of the ground and that things are being pulled or falling or sucked into it as you get close." The grave swallowed food on the first touch of two hitboxes and the food was gone in the same tick, so nothing ever fell in. The glossary had promised the fall all along: "the grave passes under a corpse or power-up and it falls in."

The point of the change, in his words after the prototype: "I don't need it to be exactly like Hole. I don't need it to be wooden plank physics. I just need it to look good." The grave should be what "a human walking up to a grave in the ground" sees, "not just an empty rectangle".

## The reference

A throwaway web prototype, build 7, which Mark played for 403 swallows before he sent his final values. It lives on the branch `prototype/148-grave-fall` at `apps/hungry-grave/src/prototypes/grave-fall/index.html` and is played at https://claude.ai/artifact/1aenaz7XAYiHhg9DTGLmH7. It is there to learn from. No code is lifted out of it.

What the prototype taught, which the rulings below rest on:

- At the game's real scale the grave is about 25 px wide on a phone, and very little hole art survives at that size. Art for the grave is judged at real scale on a phone and nowhere else.
- Four builds drew the pit with a floor inset on every side, a wobbling outline and a bright ring of earth, and Mark read it as "misshapen" with "a weird border". The cause was geometry. The fix was one honest projection: a point below ground draws where the camera's ray through it meets the ground.
- When a body snapped to the middle of the hole before it fell, Mark read it as "transported to the middle, as opposed to falling in". A fall starts where the body crossed the rim.
- When the pit art drew over a body lying across the opening, the body seemed to vanish early. Food draws between the cut and the turf, so it stays visible until it tips.
- With hands hauling bodies in, Mark set a long strong pull and a low threshold. With a natural fall he came back to a short gentle pull and to "most of the body". The values below are the second set.
- hole.io was only Mark's example of a body that does not go "poof", and nothing in this record rests on how hole.io works. The agent research on it (`local/research/148-the-fall-and-the-grave-in-the-ground.md` in the main repo folder) was not spot-checked, and the game design gate could confirm from a primary source only a real-time physics fall, a size gate, and oversized objects blocking.

## Rulings

### R1. Food goes in when most of it is over the mouth (slice 1)

Food is swallowed when the share of it over the grave's mouth, divided by the most of it that could ever be over this mouth, reaches the swallow threshold. The threshold starts at 55%. The mouth is the grave's hitbox rectangle. The share is the area where the two boxes overlap, over the food's area. The most that could ever be over the mouth is min(food width, mouth width) times min(food height, mouth height), over the food's area. The prototype used mouth area over body area, which tips in a different place when food is wider than the mouth on one axis only, and that is the common case: a power-up and a fallen rung are 28 wide against a grave 27 wide at the start and 18 at the floor. The share is read once a tick inside `coveredFood`, as the overlap is today, with plain arithmetic that is exact on every engine. The division is what lets the grave take food of any size: food wider than the mouth can still reach the threshold, and a sliver over the edge never does. ADR 0003 already rules that size never gates a swallow, and this keeps it true.

Food at the field's edge (agent's call, 2026-09-20, open to Mark's overrule). The grave's box is kept inside the field (`containGrave`, `src/game/grave.ts:113-118`) and food is not: nothing culls a corpse at a side edge (`cullCorpses`, `src/game/corpses.ts:376-391`, checks the bottom only), and a shove can carry one past the edge. A corpse centred on the side edge can never have more than half of itself over the mouth, at any grave size (7 by 14 over 14 by 14 is 50% at sizes 18, 27 and 67.5), so under the plain rule it could never be swallowed, and first touch swallows it today. So both halves of the division count only the part of the food that is inside the field: the most that could ever be over this mouth is min(width of the food inside the field, mouth width) times min(height of the food inside the field, mouth height). That is the ruling's own sentence read to the letter, because the part of the food outside the field can never be over any mouth. Food wholly outside the field has nothing that could be over a mouth and is not swallowed, as today. Evidence: the arithmetic in `local/148-slice-facts/sim.md`, section D (agent output, the 50% case checked by hand). To reverse: drop the clip, and food on the edge line stays out.

Every kind of food follows the one rule: a corpse, a power-up, a feast, a fallen rung (agent's call A4). For a power-up offer the rule of ADR 0034 stands as written: the offer's own body goes first, and the grave gets exactly the one option that reaches the threshold first. An accidental pick gets harder than today, because first touch no longer counts.

Freshness keeps its order in the tick: the swallow check still runs before decay, so food that reaches the threshold on its last tick is swallowed rather than taken under. Food that runs out of freshness before it reaches the threshold is lost as today (agent's call A2).

ADR 0042 says nothing in this game blocks. The rim is not a block: the grave still passes under everything, and food with a sliver over the edge simply is not swallowed yet.

Evidence: Mark's final values after 403 swallows on build 6, "these are the values that I want you to use." To reverse: the threshold is one data row; a threshold near zero is the old first-touch rule.

The threshold's own bounds (agent's call, 2026-09-20). The tuning record refuses a threshold at or below 0 or above 1. At 0 every piece of food on the field would tip at once, because every share is at least 0, and above 1 nothing could ever be swallowed. A tuning record comes from a document, so a bad one is rejected and never repaired. The share itself is one pure function of two boxes, `shareOverMouth` in `src/game/tip.ts`, so the drawing code's teeter (R5) asks the same question the rule asks. To reverse: drop the refusal.

### R2. The payout lands at the tip (slice 1)

The moment the threshold is reached is the tip. The swallow and every payout that arrives through it land on that tick, exactly as they land on the swallow tick today: growth, reservoir charge, the offer's resolution, the fallen rung's catch, the score, the skull stream's surge, the wisps, and the swallow chime. The food stops being food on that tick. What follows is the fall, and the fall pays nothing and can be interrupted by nothing.

This is the agent's call A1, open to Mark's overrule. Evidence: Mark played 403 swallows with the payout at the tip; `swallow.ts` fires the surge and the wisps on the swallow tick on purpose, "so the burst leaves on the tick the food went in", and a payout at the end of the fall would hold them back about one second. To reverse: move the call to the end of the fall. It goes on the list for Mark's next play as a feel check with weapons on.

The swallow's event carries what the rules know at the tip, as values and never as a reference to the corpse (slots are reused inside a fall's lifetime): the food's centre as an offset from the grave's centre, its half extent, its velocity, the grave's size, and its look (tier, treasure body, line). Where on the rim the food crossed is then a pure function in `src/app`, testable without Pixi, and the rules never learn the word hinge. The event is widened in slice 4, where its reader arrives. Tapes record commands, not events, so widening the event moves no tape and no version.

### R3. The pull (slice 2)

Food close to the rim is drawn toward the mouth as real movement in the game's rules: an acceleration toward the opening, so food keeps its momentum and arrives moving. Start values: reach 24 field units from the rim, strength 125 (about the speed, in field units a second, that food reaches at the rim), response 4.6 a second. The pull moves food only. A living mob is never moved by it (Mark's decision 2): a living mob is never food, and a pull on the living would drag attackers onto the player.

The pull never moves the option bodies of a power-up offer. It moves corpses, feasts and fallen rungs. ADR 0034 rules that the options "hold their places relative to each other ... so the choice is a place to be rather than a moment to hit". Options stand 90 apart and are 28 wide, so a grave of any size that slips between two of them would have both inside a reach of 24, and one would slide in and level a weapon line the player never chose. Prior art: in Vampire Survivors the experience gems are pulled inside the magnet radius and the treasure chest "doesn't get attracted to the player" (its wiki's Treasure Chest and Experience Gem pages). Both the game design gate and the product vision gate raised this. To reverse: one condition in the pull.

The pull's momentum is new saved state. A corpse has a position and a shove impulse today and no velocity, so the pull adds a velocity to the corpse, the witness folds it, and the witness version moves from 11 to 12 in slice 2's commit. Slice 1 adds no folded field. The velocity is cleared where a corpse slot is claimed and gets the same not-a-number check the impulse has. In the rules the pull uses exact arithmetic only (add, subtract, multiply, divide, min, max, square root, and the `normalize` and `exp` of `src/game/math.ts`), because `Math.exp` and `atan2` differ between engines and a tape must replay on a phone and a computer alike. The prototype's jitter is dropped. The pull is its own module, called from `step` after the mobs advance (so a shove has travelled) and before the overlaps resolve, reading the grave after it has moved. Pull and shove are two displacements in one tick and never double count, because the shove writes no velocity. A shove reaches a corpse only by inheritance from a mob killed in mid-shove, so that is how the shove case is staged.

A bell or belch shove adds to the pull (agent's call A3). A shove can carry food off the rim before the tip. After the tip the food is no longer in the rules, so nothing moves it.

Code that already moves things over several ticks: the shove (`shove.ts`, an impulse spent over 30 ticks) and Territory's pull on mobs (`lines/territory.ts`, a per-tick displacement toward a point). The pull is a per-tick force like Territory's. Rule of three: this is the second per-tick pull, so it is written on its own and no shared helper is extracted.

Evidence: Mark's final values. To reverse: strength zero turns the pull off, and the threshold rule stands without it.

The pull's exact form (agent's call, 2026-09-20, written when the slice entry was planned). The gap is the distance between the food's box and the mouth's box, zero when they touch. The nearness is `1 - (gap / reach)^3` inside the reach and zero outside it, which is the prototype's out-cubic ease in exact arithmetic. The velocity moves toward `direction * strength * nearness` by the share `1 - exp(-response / tick rate)` each tick, with the `exp` of `src/game/math.ts`, and the per-second values become per-tick values where they are read, because the rules have no `dt`. Out of the reach the wanted velocity is zero, so the same line is the ground's drag. The prototype measured its gap from an ellipse round the hole to a point a third of the way into the body, which has no honest rectangle form; the box gap reaches a little farther, and the reach is a data row that Mark's play tunes. In `step` the pull runs immediately before the overlaps resolve, so it follows every rule that can put food on the field that tick, the boss's sheds included. To reverse: the form lives in one module, `src/game/pull.ts`.

### R4. The grave is a hole cut in the ground (slice 3)

The grave is drawn from one projection: a point below the ground draws where the camera's ray through it meets the ground. The prototype's constants, in the grave's half-lengths, are the starting values: camera height 4.95, camera behind 1.07, dark depth 2.4, dark falloff 2.6 (light is `1 - (depth / dark depth) ^ 2.6`, one curve shared by the walls and by falling food).

- The mouth is a true rectangle with a few small outward bites. Black is laid first, and three wall faces are painted over it: far, right, left. The near wall is never drawn, because the near lip hides it. There is no floor: "I want the floor of it to be endless", and "the sides should also get darker as they go down".
- The moon is off to the left, so the right wall is lit and the left wall is in shade. Measured on the prototype at size 33: shaded side 12.3% of the opening's width, lit side 18.3%, far wall 29.1% of its length. These proportions came from Mark's two photos of real graves: "how the relationship is of side to back in that overhead view of a grave."
- No ring of earth. A narrow trodden margin, a turf shadow a hair inside the edge, and grass hanging over the far and side edges.
- Real build only (Mark's decision 7): translucent tufts grow round the grave, so they take on the ground under them as the grave moves. His words: "They don't have to be pure green. They could be a dark brownish, grayish, greenish thing." His standing no-brown rule is his to change, and he sees the colour in play.
- A headstone is not drawn. No hands for now (Mark's decision 6): "We might add it back later."
- The grave keeps its hitbox, its sizes and its growth. Only how it is drawn changes. Under R1 the mouth is the rule's own geometry, so the drawn mouth equals the hitbox rectangle. ADR 0003 describes the grave as a rounded rectangle; the true rectangle is a knowing departure in the drawing, and the hitbox was always a plain rectangle. The bites, the grass and the tufts sit outside the mouth, within a stated bound.
- The rim does three jobs today on one geometry, and each keeps a place on the new grave: the two-colour rim whose outer edge equals the hitbox (ADR 0003), the reservoir's glow, and Territory's charge arc.
- The grave's size changes on every swallow, so the art is built once in unit space and scaled by size, never cleared and rebuilt. Every proportion above is a share of the opening, which makes that possible. The projection is a pure module with no Pixi import, so the fall (slice 4) uses it without reopening the grave's renderer.

What scales and what does not (agent's call, 2026-09-20, written when the slice entry was planned). The hole's art (the black, the walls, the margin, the turf shadow, the grass, the tufts) is built once in unit space and scaled by the grave's size. The three rim jobs keep a fixed stroke width in field units and are redrawn only when the size changes, as today. Evidence: the why-comment on `GRAVE_RIM_STROKE` in `GraveRenderer.ts` brackets that width from a phone's pixels at the floor size, so a stroke scaled with the art would thin exactly where ADR 0014 needs it most; three strokes are cheap to redraw, and the art is not. The draw order inside the `graveMouth` layer is the ground art and the tufts, then the black and the walls, then an empty container for falling food that slice 3 builds and slice 4 fills, then the turf shadow and the overhanging grass. That fixes "between the cut and the turf" (R5) in one place. To reverse: scale the strokes with the art.

The readability rule of ADR 0014 (the value band) still holds for whatever is drawn on the field. The grave's art is checked against it at the floor size, the start size and the ceiling size.

To reverse: the grave's drawing is one renderer; the old flat grave is one commit back.

### R5. The fall (slice 4)

Swallowed food tips about the point of the rim it crossed, as if the rim were a hinge (tilt 1.36 rad over a tip time of 0.30 s), keeps its momentum, then falls under gravity through the same projection as the walls, shrinking and darkening on the walls' own curve, until the dark takes it (drop time 0.75 s). It never lands: no settle, no dust, no thud.

- Real build only (Mark's decision 7): "when things fall I want them to naturally fall towards the center not just down the sides. Maybe it's sort of an easing so that it slides down the side until there's no more side and then it kind of eases towards the middle of the blackness."
- Food longer than the opening folds in to fit.
- Food draws between the cut and the turf, so food lying across the mouth stays visible until it tips.
- A falling corpse moves with the grave (agent's call A5): it is inside the hole, so it is drawn in the grave's frame.
- The juice of the swallow (the "+1", the chime) plays at the tip, with the payout.
- The teeter is the tell for the new rule. In the prototype, food with more than about 12% of itself over the mouth leans toward the hole, shakes and darkens, more as it nears the threshold. Without it, a corpse lying 40% across the mouth tells the player nothing, and "a sliver stays out" reads as a missed swallow. It is drawing only, computed from state each frame. The game design gate found it in the prototype; the first draft of this record had missed it.
- The fall is anchored in the grave's proportions, not in field units. A feast pays 30.375 of size on the tip tick, so the mouth roughly doubles while the feast is still at the old rim; anchored in field units it would start in mid-hole, which is the "transported to the middle" read Mark rejected.
- Falling food has its own pool, because the corpse's own sprite is gone on the tip tick. A fall is born of a tick, is declared in the transients registry so a replay's lead-in covers it, and is driven by the run's tick and never by a wall-clock tween, so pause, the resume countdown and a replay all show the same fall. The pool is sized at the corpse cap, recycles the oldest when it runs out, and logs that.
- Falling food draws in a container in the existing `graveMouth` layer, positioned at the grave. That layer is already under food and under `graveRim`, which is "between the cut and the turf" with no new layer and no change to ADR 0014. A5 comes free, and falling food sits under the skull stream leaving the mouth.
- The replay screen has its own copy of the event dispatch, so the fall is wired into both screens, or replays keep the poof. The frame budget screen gets falls added to its rows, so the cost on a phone is measured and not reasoned.

The rules decide the pull and the tip. The drawing code shows the turn and the fall from the swallow's event (agent's call A6). The fall changes no rule and no payout, so a run plays out the same whether or not the fall is drawn, and the harness needs no renderer. To reverse A6: a fall that lives in the rules would add a falling state to food; nothing in this record depends on that.

The older animation for food that runs out of freshness ("at empty the dirt sucks the corpse under") is a different event and is not part of this step.

### R6. The Undertaker's end (slice 5, #106)

Ruled by Mark, 2026-09-20: the Undertaker's death ends the run. The grave drags him across the ground to the rim. He claws at the ground and leaves marks. He tips, folds in, and falls with the shared fall. No payout.

What stands from before: `game-concept.md`, "his death is the ending: he topples into the grave and the swallow is the victory animation, no payout, the grave swallows the gravedigger", and the rule in `stage.ts` that victory pays nothing and the run has already ended, "so a player who never dives is not left with a run still running and nothing to play". So the ending is a scene the player watches: the rules end the run on the tick he dies, and the drawing code plays the drag, the claw marks, the tip, the fold and the fall before the game moves to the next screen. The two code comments that credit "the renderer's animation" become true.

How the scene gets its frames (the tech architecture gate's finding, the agent's call): today the run's end seals the tape and moves to the next screen in one call, and every later frame is held, so no frame exists in which a scene could draw. The shape: seal exactly as today on the ending tick, then hold the move to the next screen for a length the ending module owns, counted on the frame clock because the run's tick has stopped. The drawing code shows progress and has no say in when the hold ends, so a drawing bug cannot strand a won run. Victory only: a loss, a fatal fault and the pause menu's quit move on at once as now. The replay screen gets the same hold. The scene's inputs exist already: the boss's death event carries his kind and position on that tick. The field under the scene is frozen: shots in the air fade out as the scene starts (clearing shots on a boss's death is common in the genre), and mobs stay frozen and dimmed. No tap skips the scene in this step.

The scene's length is a craft value set from how it reads in play, starting near the first prototype's 2.8 seconds for the whole ending. `game-concept.md` tells the ending as a topple with no drag and no claw marks, so slice 5 updates that sentence. No fresh run beats the Undertaker yet, so slice 5's finish line includes a way for Mark to reach the ending in play. The claw marks are furrows left in the ground behind him, as prototype build 5 drew for the hands.

To reverse: the scene is drawing code only; removing it returns the plain cut.

## Values are data

Every number in this record is a starting value and lives as data, never as a constant compiled into a rule. The numbers have two homes. The rules' values (the threshold, the pull's reach, strength and response) are a new group of rows in `src/game/tuningRecord.ts`, which every tape header carries by name. The drawing's values (the tip and drop times, the projection's constants, the ending scene's length) are one data table in `src/app` beside the renderer, because the core must not hold its caller's numbers and a wall's darkness must not change what a tape carries.

The harder swallow changes how fast the grave grows, which is the first tuning round's question (#39). This step still measures the size of the shift, at wall clock cost only: one harness batch before slice 1 and one after it, reading food swallowed against food lost, growth, and contact hits. The bot only dodges and swallows by accident, so the figures measure the policy too and are a size of shift, never a verdict. The pull at the rim is 125 a second against a scroll of 38, so food below the grave can be held against its deadline; that is also #39's question, read from the first batch after slice 2.

The instrument for that measure (agent's call, 2026-09-20). The harness could count lost power-ups only, and nothing could make a batch report from stored tapes, only from fresh runs. Slice 1 adds a food ledger reading (swallowed, lost off the bottom, and rotted away, for each kind of food; the `corpseExpired` event gains the food's kind for it) and a script that reads a folder of stored tapes again. Both are built and run over the "before" tapes while the old rule still stands, because those tapes replay only on the old rule. A batch also runs after slice 2, because the pull moves the same figures again.

## The finish line of each slice

1. The swallow rule. A corpse with only a sliver over the edge stays out and can still rot away. A corpse with most of itself over the mouth is swallowed and pays at once. Food larger than the mouth can still be swallowed. Every kind of food follows the one rule. A full stage still plays from its first tick to won or lost through the harness.
2. The pull. A corpse near the rim visibly slides toward the mouth. A corpse outside the reach does not move. A living mob beside the rim holds its course. A bell or belch shove can still push a corpse away from the rim.
3. The grave in the ground. The grave reads as a hole in the ground at the floor size, the start size and the ceiling size, at real scale on a phone. The walls get darker with depth and no floor shows. The growth round the edge lets the ground under it show through as the grave moves.
4. The fall. Every swallowed corpse goes over the edge and down. The fall starts where the corpse crossed the rim, never from the middle. The fall keeps up with a moving grave. Many swallows at once all show their fall. The payout is seen at the tip, not at the end of the fall.
5. The Undertaker's end. A winning run ends with the drag, the claw marks, the tip, the fold and the fall, and then the next screen. No comment in the rules credits the drawing code with something it does not draw.

Added to the finish lines by the gates: slice 1, food at the field's edge can still be swallowed, and the comment on the offer's spacing (derived from first-touch reach) is made true; slice 2, the option bodies of an offer do not move when the grave slips between them; slice 4, a feast falls from the rim while the grave doubles in size, a corpse near the threshold teeters, and a replay shows the same fall as the live game; slice 5, Mark can reach the ending in play, and `game-concept.md` tells the ending as built.

What each slice re-pins. Slice 1: the pinned `GOLDEN` digest probably holds, because its one swallow is a corpse at the grave's exact centre, which also means it cannot see the new rule; assert that it held, and let a held harness scenario carry the rule. The bot's pinned seed lists move: read which seeds moved, keep the faults empty, and keep a winning seed so slice 5 has a won run to check. Tapes recorded before slice 1 stop replaying at the first diverging checkpoint, as ADR 0019 intends, and no run is stored yet, so nothing is lost. Slice 2: `GOLDEN` re-pins (witness version 12), the bot's lists move again, and older tapes are refused by version. Slices 3 to 5 move no pin in the rules. The proof, in place of the fingerprint that Mark ruled comes after this branch: one full-stage harness tape recorded at slice 2's commit and replayed after slices 3, 4 and 5, where the witness verifies or refuses.

Code debt under #150 that these slices touch: one of #121's non-null assertions is in `layering.ts`, which slices 3 and 4 touch, and is paid there. #140 stays in foundations, because its proof is that `GOLDEN` holds by arithmetic, and a commit that also changes behaviour destroys that proof. #112 looks already paid; verify and close it in foundations. #110, #133 and #145 sit in files no slice touches.

One edge is stated and left to measure: the share is tested once a tick and not along the grave's path, and touch speed is uncapped by ruling (ADR 0011), so a very fast swipe can pass under a corpse without a swallow. Whether Mark swipes that fast while dodging is a play question, and the miss becomes a harness reading if play shows it.

Mechanical checks are proven by tests or by a held harness scenario (the feature flow's short-state check, #154), because the tip and the fall are too short to photograph. Mark's play carries feel only.

## For Mark's next play

- The payout at the tip with weapons on: do the surge and the wisps read as coming out of the swallow (A1)?
- The 55% and the pull on real corpses under fire. The prototype's bodies were 20 to 44 long and nothing hurt the grave; real corpses are 14 by 14, and the real game charges for every moment the grave dwells under food.
- A power-up offer with the pull on: slip between two options and check that neither moves.
- A very fast swipe under a corpse: does it ever miss in real play?
- The colour of the tufts, which he named "brownish" himself.
- Whether the grave reads as a grave in the ground on his phone, which is the ticket's own finish line.

## Outside this step

The tilted or 3D view, the hands, the grave's top size (67.5 today, a question for #39), and the tell for a living mob that touches the grave (#129).
