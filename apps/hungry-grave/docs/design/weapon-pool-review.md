# The first weapon pool: the review and Mark's ruling

> Reviewed 2026-08-27 against `main` at `56a2d4dd23`. Three gates fired: product vision, game design, tech architecture. Ruled by Mark the same day.

## Mark's ruling, 2026-08-27

**Repel stays the bell behaviour already ruled by ADR 0036: a field-scale ring on a fixed clock.** The theme may still change later. It must not be redefined as short-range close defence.

**The measured bell result is not evidence that Repel failed.** The bell reached level 2 on the only tape, and `BELL_PUSH_BY_LEVEL[2]` is zero, so the knockback that makes it Repel was never on the field.

**Close pressure is intentionally unowned for now.** The close-pressure reading is not built. It only became necessary because the brief treated Repel as close defence, and under this ruling it is side work until bosses or other content make the question real.

### The ordered sequence Mark set

1. Keep Pressure as the soul stream.
2. Keep Pursuit as the wisps.
3. Keep Repel as the existing field-scale rhythmic bell.
4. Replace headstones with Territory. **Grasping hands is the current preferred expression**, because it cleanly takes the silhouette axis headstones vacates.
5. Bring Mark the birthright and floor-ladder question that removing headstones creates, **before** implementing that consequence.
6. Once the first pool is playable, begin measured tuning.
7. Revisit close-pressure defence only when the game creates enough of that pressure to evaluate it.

Nothing is implemented. Nothing may be implemented from this document without its own dispatch.

## The recommended first pool, as ruled

| Behaviour | Line | State | Firing trigger (ADR 0005 property) |
| --- | --- | --- | --- |
| Pressure | `soulStream.ts` | Ships today, unchanged | Always-on, plus a surge on each swallow |
| Pursuit | `wisps.ts` | Ships today, unchanged | On each swallow |
| Repel | `bell.ts` | Ships today, unchanged behaviour; theme open | On a timer |
| Territory | none | Trigger and placement ruled; rest open | **On each swallow** (ruled 2026-08-27) |

Read by where and when each line acts, the pool is: **my lane / anywhere / around me at field scale / ahead of me.** The roster it replaces put two of four lines at "at me", which is why headstones and the bell overlapped.

**Sweep stays parked.** A returning solid is the "circling solids" motion class this pool retires with the headstones, and the four-motions contract in `game-concept.md` is what keeps the storm readable at density. Good idea, wrong pool.

**Detonation stays parked, and is a contingency rather than a slot.** It shares Territory's battlefield space (up-field, density-scaling) and its non-aiming placement. It would replace Repel only if the decision were made to tune the pool before the bosses exist, which Mark's step 7 declines.

## Territory is a swap, never a fifth line

Two independent hard reasons, both verified in the main thread rather than taken from a report.

**The tape format refuses growth.** `decode.ts:189` compares the file's format version against `FORMAT_VERSION` with strict equality and throws. `HEADER_LEVELS_ORDER` in `wireCodes.ts:130` writes exactly four level bytes, positionally, and its own comment calls the layout "permanent from the first tape". A fifth line grows the header, which is a layout change, so every tape ever recorded would stop decoding at all. Not degrade: refuse. ADR 0020 commits player-facing replay to v1.

**The drop silhouettes are full.** `docs/design/drop-legibility-fix.md` splits the four drops on tall, round, pointed, wide, and states that the coarse axis is exhausted at four lines. Colour is closed as a substitute (hue is fenced by mob fire and the brown ban, and three of the four line colours already sit within two degrees of each other) and brightness is closed because steady-bright means treasure under ADR 0004.

Because this is a swap, that document's stated "first proposal for a fifth line" trigger did **not** fire. It stays armed.

**Replacement is graceful.** The header stays four bytes wide, every existing tape still decodes, and the new line's state must be folded, so `WITNESS_VERSION` goes to 2 and old tapes report a version mismatch rather than a fabricated divergence. That is ADR 0019 working as designed.

**And it is why Mark's step 6 is in the right place.** A witness bump means no tape recorded before the swap can ever be one side of a `compareRuns` against a post-swap build. The pool has to settle before the measured tuning runs, or every tuning tape shot beforehand is thrown away.

## The evidence, corrected

The framing that survives is narrower than the one this review opened with, and Mark restated it himself.

**The useful evidence is not "the bell and the headstones consumed 55% of progression."** ADR 0034 rolls uniform after the seeded first drop, so 6 of 11 level-ups landing on two of four lines is roughly what the drop rule gives. Any line in a four-line pool costs about a quarter of progression by construction. Progression price is the roll's, not the roster's.

**The useful evidence is that headstones reached level 5 and still contributed almost nothing, while the bell never reached the level where its Repel behaviour existed.**

End levels on the only tape (`local/59/tapes/hungry-grave-2093383922-4421f728b5.tape`), re-measured in the main thread: soul stream **2**, headstones **5**, wisps **4**, bell **2**. Damage: soulStream 119, headstones 8, wisps 558, bell 2.92, belch 120. Fatal blows: soulStream 30, headstones 3, wisps 187, bell 0, belch 47.

Two further consequences of those end levels, both worth carrying:

- **The storm was never built on this tape.** The soul stream sat at 2 of 5 columns for the whole run, and mean objects on the field across all lines was about ten. VISION promises the player "ends as a screen-filling storm". No pool swap moves that number, and it is a tuning finding rather than a pool one.
- **The close-pressure job did not occur.** The run took 11 hits in 12301 ticks: 5 contact, 3 shambler, 3 revenant, and **0 from the ghoul**, which is the game's only chaser. Both boss phases are stubs. This is exactly why Mark ruled close pressure intentionally unowned rather than cutting it.

**The strongest surviving argument for cutting the headstones is a vision argument, not a damage one.** The dice pick the line (ADR 0034), so the player never chooses. A drop into a line that changes nothing is a dive the game threw away, and VISION's "greed is the right play" promises that nothing swallowed is ever worthless and the player never regrets diving. ADR 0002's overflow rule catches the maxed case only, never the useless one. That makes #65 an identity failure rather than a balance one.

## The gate findings, restated under the ruling

Three marker blocks are held and owed to an issue once one exists. What each finding became:

### Closed by the ruling

- **Repel versus ADR 0036** (raised independently by the product and game-design gates, and by the tech gate as a supersession). Ruled A: the bell's fixed clock and field scale stand. Nothing is superseded.
- **Territory's silhouette axis.** Ruled: grasping hands, taking the tall axis headstones vacates. Cursed ground would have read wide and collided with the bell.
- **The 55% progression framing.** Ruled: it is the uniform roll, and the record now says so.
- **The close-pressure reading.** Ruled out of scope for now. Revisit at step 7.
- **A fifth line, on format and silhouette grounds.** Confirmed: replacement only.

### Still open, and routed

- **Territory's firing trigger.** **RULED 2026-08-27: on each swallow.** See the section below. The blocker is now placement and scroll anchoring.
- **Territory would be the first player-owned entity in the world frame.** `scrollField` in `step.ts` moves mobs and corpses and nothing else; skulls, wisps, stones and the bell's ring are all screen-frame. Downstream of the trigger.
- **Territory's repeat-damage rule.** One bite per patch per mob is the bell's proven `struck` set, keyed by entity id, and is effectively free. Per-tick dwell damage reopens the per-mob cooldown hazard that `headstones.ts` refuses in writing ("the exact class of pooled-state bug this codebase has hit five times"). Downstream of the trigger.
- **A Territory that reads `state.mobs` to place itself fires ADR 0035's revisit trigger** and needs a stated rule for ADR 0034's roll. `nearestMob` in `wisps.ts` is the only place in the storm that reads the mob list to choose. Downstream of the trigger.
- **Grasping hands were cut on the record.** Decision log entry 3, point 5 cut them for three reasons: close defence was the headstones' job, crowd punctuation was the bell's, and they read on the ground layer where corpse-versus-drop legibility lives. The first two dissolve under this pool. The third stands. Reinstating them needs a written supersession naming what it replaced and what stood.
- **The ground layer versus #31.** A persistent bright ground effect under the food layer, added before #31 reads whether the #36 drop-legibility fix worked, makes tester confusion unattributable.
- **The birthright hole.** `roster.ts` sets `BIRTHRIGHT = ['soulStream', 'headstones']` and ADR 0003's floor ladder strips a dying player back to exactly that list. Mark scheduled this at step 5, before the consequence is implemented.
- **`fieldPerLine.ts` needs an entry for Territory.** Its `ON_FIELD_BY_LINE` map is deliberately partial and says so. It counts things rather than area, so one zone and one skull read the same.
- **Nothing answers Territory's own question:** did the prediction pay. How many mobs entered a placed zone, against how many zones expired empty. This is the direct analogue of the reading #65 says headstones never had, and building Territory without it repeats #65's mistake.

### Findings outside the pool question, preserved

- **The wisps carried 187 of 267 kills and 81% of line damage.** The genre rations homing to the weakest line, and ADR 0036's own rationale for taking the bell off the swallow trigger ("a late run swallowing roughly once a second cleared the field as a side effect of collecting") indicts the wisps' trigger by the same argument. Watch across the next tapes. Reopening ADR 0035 is Mark's.
- **The storm's saturation.** Decision log entry 3, point 7 claims roughly 300 airborne objects from a maxed stream. `caps.ts` derives about 18 from a level-5 stream at its fixed interval, and the code agrees with itself. The record is out against its own code by roughly six times. Tuning finding.
- **A lost drop's line is unrecorded.** `CorpseLost` carries `kind` without `line`, so "the player deliberately let a weak line's drop scroll away" is invisible. Events are free to extend, because replay regenerates them and they are never folded.
- **The tape reader has no forward path for a growing header.** Resolved for now by choosing replacement, but ADR 0005 declares the line pool open, so the header growing is a matter of when. Cheap to decide with two versions and a handful of tapes. Trigger: the next proposal that would change the tape header's layout.

## Territory's firing trigger, ruled 2026-08-27

**Territory fires on each swallow.** Mark's ruling. It ties the line directly to the game's central feed loop and makes the swallow itself the event that creates Territory. Territory therefore shares the swallow trigger with the wisps, and the pool's three ADR 0005 modes now read: soul stream always-on with a surge, wisps and Territory on each swallow, bell on a timer.

**The trigger does not decide placement, and must not be read as deciding it.** Mark's words: do not lock the patch to the corpse's swallow location just because the trigger is the swallow. Territory's job stays predictive space control. It must influence where mobs are *about to travel*, and it must do that without introducing manual aiming.

## Territory's placement and scroll anchoring, ruled 2026-08-27

**A Territory patch appears a fixed distance straight up-field from the grave when a swallow triggers it, and it is anchored to the world and the ground rather than to the screen.** Mark's ruling.

**The player's position at swallow time is the placement input.** There is no aim axis and no mob targeting. The patch then drifts with the world while mobs move through it.

**This does not settle Territory's lifetime, size, damage cadence, stacking, or level curve.** Those are open and none of them may be assumed from this ruling.

**Why world anchoring, kept because it is the arithmetic the ruling rests on.** `SCROLL_SPEED` is 38 units per second (`tuning.ts:27`). A shambler adds 0.5 of that and a revenant 0.35 (`mobs.ts:72`, `:89`), so they descend at about 57 and 51. A world-anchored patch drifts at 38, so a mob closes on it at only its own speed, about 19 for a shambler and 13 for a revenant. Dwell time comes free out of the field's own motion. A screen-anchored patch would be crossed at the full 57 and 51, roughly a third of the dwell.

**Two consequences the spec must carry.**

Territory would be the first player-owned entity in the world's frame. `scrollField` (`step.ts:32`) moves mobs and corpses and nothing else; skulls, wisps, stones and the bell's ring are all screen-frame. That is a new property of the sim.

Corpses and drops drift at exactly `SCROLL_SPEED`, so a world-anchored patch shares its motion precisely with the food layer, and `game-concept.md` promises the four line motions never blur. The patch needs internal motion of its own, hands that grab, rather than being an inert mark on the ground.

## Territory's damage rule, ruled 2026-08-27

**One bite per patch per mob.** Each patch owns its own struck set. A given patch damages a mob at most once, and that same mob can be damaged again by a different patch.

**`bell.ts`'s `BellRing.struck` is the implementation precedent.** Keyed by entity id and never by slot, so it carries none of the recycled-slot hazard, and the set dies with the patch. **Do not introduce per-tick dwell damage, and do not introduce a per-mob cooldown system for Territory.** `headstones.ts` refuses the per-mob cooldown in writing and names the reason: it needs a field on every mob and a rule for what happens when the mob dies and its slot is recycled, which is the exact class of pooled-state bug this codebase has hit five times.

**Why, in Mark's words:** it keeps the line's job clear. The player claims a piece of ground, and mobs are punished for crossing that claimed space. It also gives the tuning instrument a clean behavioural question later: how many mobs entered each patch, how many were actually hit, and how many patches expired unused.

**This ruling does not decide lifetime, radius, stacking limits, or the level curve.**

## Territory's lifetime and stacking, ruled 2026-08-27

**A patch has no timer.** It moves with the world and dies naturally when it leaves the field.

**Separately, Territory has a cap on simultaneously live patches.** When a new swallow would exceed the cap, the oldest patch is evicted.

**These are different responsibilities and the spec must keep them apart.** The world scroll owns a patch's natural lifetime. The cap is housekeeping for high swallow rates, so old trailing patches do not accumulate after they have stopped contributing.

**Size the cap around the useful window, not the full on-screen lifetime.** The useful window is while a patch is still above the grave and mobs can meaningfully enter it, about `D / 38` seconds for a placement distance D, against a full on-field life of about `(152 + D) / 38`.

**Several patches coexist, and that is the point.** Repeated swallows leave a moving trail of claimed ground, and player movement smears that trail across the field. Preserve that behaviour. Territory is not one-at-a-time.

**The exact cap number is not locked.** It is a tuning value established once Territory is playable.

## An anomaly found 2026-08-27, preserved and not fixed

**ADR 0004 says freshness scales every payout, naming growth, burst and reservoir charge. The code scales growth and the reservoir only. The two on-swallow weapon lines fire at full strength whatever the corpse's freshness.**

`swallow.ts:100` computes `paid = food.payout * freshnessScale(food.freshness)`, and `paid` feeds `payGrowth` and `payReservoir`. `surgeStream(state)` and `launchWisps(state, events)` are then called at `:124` and `:125` with no freshness argument at all. `surgeStream` sets `SURGE_VOLLEYS`, a fixed 1. `launchWisps` reads `WISPS_BY_LEVEL[state.levels.wisps]`, a fixed count. So a nearly rotten scrap at the 0.25 floor buys the same surge and the same wisp volley as a corpse caught the instant it fell.

`game-concept.md` states the same rule as the ADR: freshness "multiplies all three payouts (growth, burst, belch charge)". The glossary at `CONTEXT.md:45` has since retired "burst line" as a category term under ADR 0005, but "burst" in ADR 0004 predates that and names the on-swallow weapon fire, which is what `game-concept.md` calls the corpses erupting back out as burst weapons.

**Ruled by Mark 2026-08-27: this is a defect against the existing rule, not a reason to weaken ADR 0004.** The durable rule stands as written: freshness scales every swallow payout, growth, burst and reservoir charge. The soul stream's surge and the wisp volley do not obey it. **The defect is recorded separately and must NOT be fixed opportunistically inside #76**, unless the Territory implementation genuinely requires changing the same seam.

**Not fixed here, and not in the weapon-pool work's scope.** It is preserved here because it gates a Territory decision: whether a stale corpse claims weaker ground. Either the record is wrong about what freshness was ever meant to scale, or two shipped lines do not honour it. That is Mark's to rule, and the ruling decides Territory's answer at the same time.

## Territory and freshness, ruled 2026-08-27

**Territory's on-swallow payout is freshness-scaled.** The ruling is deliberately narrow and stops there.

**What property carries the scaling is NOT decided.** Do not assume radius, and do not assume patch count.

**Freshness must never turn one bite into repeated damage.**

### Territory's ruled properties, as they stand

- Fires on each swallow.
- A patch appears a fixed distance straight up-field from the grave, anchored to the world and the ground, never the screen. The player's position at swallow time is the placement input. No aim axis, no mob targeting.
- One bite per patch per mob. Each patch owns its own struck set, on `bell.ts`'s `BellRing.struck` precedent.
- Multiple patches coexist, leaving a moving trail of claimed ground that player movement smears across the field.
- No timer. The world scroll owns a patch's natural lifetime.
- A live-patch cap is housekeeping only, sized around the useful window above the grave, evicting the oldest. The number is tuning and is not locked.
- The on-swallow payout is freshness-scaled, and **radius is the channel that carries it**. Freshness scales the **claimed area**, and the radius is derived from that area scaling. **Never multiply the radius by freshness directly.** At the 0.25 freshness floor a patch has 0.25 of the full-freshness area, which is 0.5 of the full-freshness radius. That keeps stale food meaningfully weaker without making its Territory payout nearly worthless.
- **Level progression must not buy the same property freshness buys.** Radius is now the freshness channel, so **Territory's levels must not simply increase radius**, or freshness and level visually confound each other.
- **Levels buy the bite budget: how many distinct mobs a patch can successfully grab before it is spent.** Once a patch has bitten its level-defined number of distinct mobs, it is spent and closes. The channels stay separate: freshness controls how much ground the patch claims, level controls how much traffic that claimed ground can punish, and one mob is still bitten at most once by each individual patch. **The five-level curve is NOT locked, and level 1 must not be assumed to equal one bite.** The curve is tuning.
- **The progression must be visibly legible on the field.** A higher-level patch should look more capable of repeated grabs than a lower-level one. The exact visual treatment is not chosen.
- **A patch has a distinct opening beat before it can bite.** During the beat the patch exists, is visible, and moves with the world normally, and it cannot damage mobs. After the beat, any mob touching the patch can be bitten, **including a mob that was already standing inside it when the patch opened**. One bite per patch per mob still applies, and the bite budget still decides when it is spent. **Territory must NOT require a mob to cross the boundary after activation:** if the hands are visibly active and a mob is standing in them, that mob is eligible. **Activation must NOT be immediate**, because the opening beat is what keeps Territory from collapsing into a placed detonation when a swallow happens under a dense group. **The beat's duration is a tuning number and is not chosen.**
- **The birthright becomes the soul stream and Territory.** Territory replaces the headstones in the existing birthright list, so a run starts with those two. **ADR 0003's floor ladder continues stripping back to that same birthright list. Do not split the starting loadout from the floor-ladder target.** The reasons to preserve: the first swallow immediately has a visible Territory payoff; Territory reinforces diving as the recovery path near the floor; a player who is already losing is not stripped down to only the thin starting soul stream; and start state and floor state keep one shared rule rather than a second hidden loadout. **Do not change ADR 0003 unless implementation exposes a contradiction with this ruling.**

  Superseded 2026-08-31: the birthright is the skull stream alone, ADR 0045.
- **A mob's body overlapping the patch counts as touching it, not its centre point.** If any part of the mob's collision body overlaps the active patch, that mob is eligible to be bitten, subject to the activation beat, the one-bite-per-patch-per-mob rule and the remaining bite budget. **Use a circle-versus-box overlap rule, and do NOT copy the bell's centre-point distance test.** The reason to preserve is readability: the visible patch size must match the gameplay area it represents; freshness scales that visible claimed area, so the collision rule must not silently make the effective area smaller; and a mob visibly standing in the hands must not be immune because its centre sits just outside the radius. **A small shared circle-versus-box helper is acceptable. Do NOT broaden this into a collision-system refactor and do NOT change the bell's existing geometry as part of #76.**
- **A patch is a finished gameplay object at birth, and never upgrades in place.** It captures, at the moment it is created, the player's Territory level, the bite budget derived from that level, and the freshness-derived radius. None of those changes afterwards. Level-ups affect only patches created after the upgrade. This matches `bell.ts`'s existing precedent, where an already-existing weapon effect keeps the level it was born with rather than changing strength underneath the player. **Do not special-case untouched patches or partially spent patches.**
- **A drop that levels Territory lays that same swallow's patch at the NEW level.** This follows shipped order rather than being a fresh ruling: `payLevel` runs at `swallow.ts:113`, before `surgeStream` and `launchWisps` at `:124` and `:125`, so the existing on-swallow lines already behave this way.
- **A spent patch is removed immediately.** Once it has used its level-defined bite budget it closes and goes. It does not remain on the field and it does not consume one of Territory's live-patch cap slots. **Do not add inert lingering ground.** That lower-level patches spend and vanish sooner while higher-level ones survive more crossings is a useful visible expression of the level curve, and it must not be emphasised by leaving dead ground behind.
- **Three removal reasons stay distinct, and must stay distinguishable for later measurement.** A patch spent its bite budget. A patch scrolled off the field with bites remaining, which includes patches never used at all. A patch was evicted by the live-patch cap. Any Territory reading must be able to tell the three apart.
- **Off-field placement: the patch still spawns at that world-space position and scrolls into view.** If the fixed offset puts a patch above the visible field, it is neither clamped to the top edge nor suppressed. **Off-field does not mean inactive.** The patch exists immediately in world space, moves with the world immediately, and participates in simulation there under the same rules as other entities living in the above-field margin. **Visibility must never become an activation condition.** The consequences are held deliberately: every swallow still pays; placement stays the same fixed offset from the grave at every vertical position; the player's position stays the input; and high play does not collapse the trail into a top-edge band. **No new top-edge measurement is added for this**, and if delayed visual feedback turns out to matter in play, that is a later tuning or feel finding.
- **Rejected for the level curve, with reasons, so they are not re-proposed.** Patches per swallow, because progression would then drive the same number the live-patch cap exists to hold down and the two would argue. Placement distance, because it would change how the player has to use the weapon as it levels.

## Still open on Territory

The remaining behavioural decisions, then the numbers.

**No behavioural decision remains that this review can name. The spec can be drafted.**

### Three follow-ons carried as assumptions, to be corrected rather than re-asked

They are consequences of rulings already made rather than open choices, and the spec states each explicitly.

- **One patch per swallow.** Freshness buys area and level buys the bite budget, and Mark rejected patches-per-swallow as a level channel, so nothing buys count and the count is a constant one.
- **Territory fires on every food kind: corpse, drop and feast.** `swallow.ts` treats all three identically for the on-swallow lines, and drops and feasts never decay, so both lay a full-freshness patch. The feast case cannot be exercised while both boss phases are stubs.
- **The opening beat runs in world time and ticks down while the patch is off-field**, which follows directly from "off-field does not mean inactive".

### What the spec still owes, none of it a decision

The numbers, all deferred to tuning by Mark's own rulings: the placement distance D, the full-freshness radius, the five-level bite-budget curve, the opening beat's duration, the live-patch cap, and damage per bite. The visual treatment of the patch and of its level progression, deliberately unchosen and adjacent to #38. The written supersession of decision log entry 3, point 5, which Mark ruled must be explicit because the ground-layer legibility concern survives. An `ON_FIELD_BY_LINE` entry in `fieldPerLine.ts`. Events enough to tell the three removal reasons apart.

### Two consequences of the birthright change, found while recording it

**`game-concept.md` becomes false in one sentence.** It states the run starts with "one thin skull column and one slow headstone". That sentence names the headstones as a birthright member and needs correcting with this work.

**The headless bot's runs change.** `bot.ts` only dodges and never swallows a drop, so it plays every run on the birthright loadout. Changing the birthright changes what the bot does, and ADR 0013's bot test asserts a ten-to-twelve drop band and zero invariant fires. Expect that test and ADR 0015's golden digest to need regenerating, and per ADR 0019 the regeneration commit comes first, before any refactor.

**A consequence of the off-field ruling, recorded rather than resolved, and NOT to be resolved as part of any adjacent decision:** because off-field is not inactive and mobs already exist in the above-field margin, a patch can bite a mob before either is visible, so a mob can arrive on screen already damaged. ADR 0040 rules that a hit announces by subtraction. Whether that reads is a feel question, and Mark's ruling stands regardless.

Then the placement distance D and the numeric curves.

**The freshness defect is #77**, created 2026-08-27: "The soul stream surge and the wisp volley ignore corpse freshness". It must not be fixed inside #76 unless the Territory implementation genuinely requires changing the same seam. Then radius, damage per bite, the placement distance D, and the level curve. The cap number is tuning rather than design.

### The numbers those decisions rest on, measured

**The swallow rate sets the patch count.** The measured run swallowed 252 corpses and 11 drops in 12301 ticks: **263 swallows, one every 46.8 ticks, about one every 0.78 seconds.** `caps.ts` sizes the wisp pool against a swallow as often as every 20 ticks, which is the chaining ceiling.

**The field already ends a patch.** The grave moves in both axes under player control (`grave.ts:111`, clamped at `:97`). A patch placed a distance D above the grave starts at roughly `y = 608 - D` and drifts down at `SCROLL_SPEED`, 38 units per second, so it leaves the field's 760-unit height after about `(152 + D) / 38` seconds: about 9.3 seconds for D = 200.

**Only part of that is useful.** Mobs descend from above, so a patch stops being able to catch anything once it has drifted below the grave. That window is about `D / 38` seconds, roughly 5.3 seconds for D = 200. The rest of a patch's on-field life is dead ground sitting in the food layer.

**So an uncapped Territory holds about twelve live patches at the measured swallow rate**, and about half of them are already useless.
