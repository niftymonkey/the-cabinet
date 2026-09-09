# Design record: the stage floor (path step 2, ticket #97)

The craft calls this step runs on, each taken by the dispatching session under the push's pre-authorization item 8 (`docs/push/pre-authorizations.md:14`: set piece identity, boss chunk pattern, section feel, tuning data, asset choices), each backed by research or by a measurement in the tree, each open to Mark's overrule on the branch before merge.

Every magnitude below is an initial data row. The harness (step 3) reads it and the tuning pass (step 4, #39) moves it. Nothing here is a ruled number, and nothing here belongs in an ADR.

The game is bullet heaven with doses of bullet hell from bosses, said in that order. The three sections are the heaven. The Banshee and the Undertaker are the doses. The set piece is heaven at its loudest and is not a dose.

Line citations were read in this worktree while path step 1 was mid-build; section 10 says which of them will have drifted by the time this dispatch starts.

---

## 1. The three sections, named, and what each feels like in play

The committed research record `docs/research/section-feel-consent-and-rung-restore.md`, section 1 ("Three sections, as moments of play"), writes all three as moments of play, and its Crowd stands unchanged: the word follows the argument.

Its other two words do not survive, because both collide with words already in use. "Lane" is the File's single-file lane and the skull stream's own reading of the pool, "my lane" (`game-concept.md:52`, `game-concept.md:34`), so a section called the Lane and a template called the File would both be lanes. "Descent" is the mob motion word in the same paragraph and in the code (`GHOUL_DESCENT_FLOOR`, `mobs.ts:153`), so a section called the Descent would share its name with what every body on the field is doing. The first section is therefore the Procession, for the funeral filing past in single file, and the last is the Vigil, for the watch kept before the gravedigger arrives. Both are the moment of play the record already describes, renamed rather than re-argued, and a grep of `apps/hungry-grave/src`, `CONTEXT.md` and `scripts` finds neither new word in use.

`game-concept.md:46` fixes the shape (short opening, longest middle, shorter last, Ikaruga's short-longest-short) and `game-concept.md:48` fixes the one-property-per-section rule. `CONTEXT.md:121` already defines Section as "one of the stage's three named trash phases" and does not name them, so naming them is what this record adds.

### The Procession, to the Banshee. It owns emptiness.

Never more than one template live. A group arrives, the field clears, and there is a beat of empty ground before the next group falls. That gap is the whole lesson of the section: it is where a corpse sits alone long enough for the player to decide to go and get it, which is the one verb the game is built on, and it is where a revenant's tell is legible because nothing else is on screen.

**The property is a gate on the director's spend, not a description of the authored rows.** It is written as a row the director reads: a live-template ceiling of one, which the director at step 4 may not add past. Initial, tuned by the harness at step 4. The reason it has to be a row is that emptiness is exactly what a low-pressure director fills, and a director briefed to fill gaps has no way to tell this section's gaps from any other section's unless the section says so, which is ADR 0047's own reason for authoring the thin row as a row and ADR 0056's per-phase permission cells applied one level down. Vampire Survivors ships the same protection from the other side: Mad Forest's per-minute enemy minimum runs 15, 30, 50, 40, 30 and drops to 10 on both guaranteed Flower Wall minutes, so the table thins the field for its own event rather than trusting the event to survive the floor (`docs/research/set-piece-and-final-boss-chunk.md` section 2).

**It is a permission and not a law over the field, and the difference is the player.** The authored rows are never measured against the ceiling. This section's rows stand about nine seconds apart against a body that takes roughly fifteen seconds to fall unkilled (`stage.ts:48-50`, the measured drain-out), so a player who kills slowly holds two templates on the field with nothing whatever wrong. ADR 0023 runs every invariant in every build a player is handed, so the same row written as a law would fire at that player and land in their own tape as a defect in the game. The property test therefore states the hand it runs under, the sharp one, and the section's emptiness is a promise about what the game will add rather than a rule about what the player must clear.

The roster is the shambler, then one lone revenant Drip so the tell can be read once against nothing, then shamblers again. No ghoul: the closer arrives in the next section, and a type arriving first as a lone Drip is the standing rule (`stage.ts:64-70`, and ADR 0016's readable-before-it-acts).

**Which rows carry.** Initial rows: thirteen rows over the two minutes, of which eight are File or V rows and carry, four are Drips and do not, and the last is the sparse row. Only File and V rows appear beside the Drips, because the Rain is the density filler a section turns up when its property asks for it and the Pincer is two files at once, and neither belongs in a section that holds one template live. The constraint that matters is the lone revenant Drip: it teaches the tell and it does not carry, so the run's first tell and its first offer are two different moments rather than one body doing both jobs. The first shambler Drip does not carry either, because the first kill of the run teaches the swallow.

The opening is thinner in two directions at once now, and that is the thing this section has to answer. The player starts on the skull stream alone at level one (ADR 0045), and the section owns emptiness, so there is less firepower and less to shoot than the old ramp had. What carries it is the carrier schedule: eight of the run's twenty-five carriers stand in the Procession, so the first two minutes are where power arrives fastest, which is where every shipped shmup puts it (`docs/research/stage-length-with-a-director.md` section 5, the Cave model). That answers the wayfinder-map fog item recorded on #97's second comment, which asked what the early minutes concretely are.

Precedent: Downwell's Caverns, the area with the fewest hazards; Mad Forest's first two minutes on one enemy family at a one-second interval; DoDonPachi's 2:05 stage one. All in the research record's claims 1 and 3 and in `docs/research/shmup-stage-design.md` claim 1.

Nominal clock: about two minutes to the Banshee. Initial row.

### The Crowd, to the Waking. It owns overlap.

Never fewer than two templates live. Rain under a Pincer, a V through Rain. Corpses stop being objects the player chooses between and become a floor the grave swims through, and the question turns from "can I reach that one" into "which of these can I still reach".

It opens on the Wall, two seconds after the Banshee dies. The anchor is split and both halves are load-bearing: her death starts the Wall clock, and the swallow of her corpse is what slams the reservoir full, so the stage never waits on a pickup and a player who misses the feast meets the curtain unloaded (`game-concept.md:56`, ADR 0042's two-sided property). For the player who dived, the section's first beat is the run's first loaded belch against the curtain: the gas clears its fire and the burst opens a lane, and the reward is that lane's corpses raining down while the rest of the width comes to the storm (ADR 0008, the split scope; the set-piece property is re-read in play). Then it climbs back toward the Wall's figure without reaching it, so the feast stays the run's outlier.

The ghoul arrives here, first as a lone Drip.

One deliberate trough sits mid-section: thin Drips and nothing else, so the Waking at the end lands against something rather than against a sustained peak. Iuchi's mountain-and-valley curve, and Boghog's naming of constant intensity as the failure mode (research record claims 5 and the sibling record's section 4). The trough is a row and nothing more: an earlier draft asked for a held bar of music under it, and that is dropped rather than mechanised, because under one loop per section the music does not change inside a section and a held bar would be an audio state built for one row.

**The eye is placed by a Crowd row, and the section ends when it opens.** The dormant source is not a phase that starts itself: a Crowd row places it, it rides the ground layer down on a slower parallax, and the Crowd's boundary event is the eye opening around mid-field. So the Crowd never drains to empty before the set piece, and the dormant eye has a row to be placed from. ADR 0051 rules exactly this already ("there is no drain-out before the set piece", and it "arrives into trash the way the Wall does").

**Amended 2026-09-08, Mark's ruling after ground adjustment 1:** the source rides the ground at the field's own scroll, not on a slower parallax, and it opens a quarter of the way down rather than around mid-field. What stood: the pour, its budget of 75 and its rate of one body every fifth of a second; the tick the eye opens, second 140 of the Crowd, so the section's own last group at second 138 still falls before the boundary; the property the tests hold. What changed: the placing row moved from the Crowd's second 120 to its second 135, because the fall to the opening depth is five seconds now rather than twenty. What the paragraph could not have known: it was written while the ground itself ran at half the field's scroll, so "rides the ground" and "on a slower parallax" were one sentence; adjustment 1 put the ground at the field's own scroll and made them two, and the eye then slid upward against the rock it is supposed to sit in.

Whether the Crowd's rows keep firing through the pour is a data row. Initial: they keep firing at a reduced share, one third of the Crowd's authored rate, so the pour is unmistakably the loudest thing on the field while the section under it does not go silent. Initial, tuned by the harness at step 4.

Nominal clock: about two minutes thirty-five to the Waking, the longest of the three. Initial row.

### The Vigil, to the Undertaker. It owns scarcity.

Less growth paid per second than the Crowd, and tougher bodies. The roster inverts to revenants and ghouls with the shambler thinned, so the field is more fire and less food, and the swallow cadence drops without a single new system being added.

**The quantity is food swallowed per second, not corpses per second.** Corpses per second is the wrong meter and would let the section pass its own test while feeding better than the one before it: a revenant corpse pays `2 * TRASH_CORPSE_PAYOUT` against a shambler's one (`mobs.ts:94`, `mobs.ts:77`), so a roster that halves the bodies and doubles their payout is flat rather than scarce. Growth paid per second is the honest quantity, and it is what the spec test holds. That correction is section 10, item 1.

The arithmetic, all initial rows. The Crowd runs about 1.8 bodies a second averaged over the section, 3.6 at its densest ten seconds, mostly shamblers and ghouls at one payout unit each, so about 1.8 units a second. The Vigil runs about 0.8 bodies a second, half revenants at two units and half shamblers and ghouls at one, so about 1.2 units a body and about 0.96 units a second, a little over half the Crowd's. What keeps it there is time to kill as much as arrivals: a revenant costs 64 points of storm against a shambler's 40 (`mobs.ts:93`, `mobs.ts:76`), so the same storm clears fewer bodies a second. The fall is the property; the numbers move at step 4.

The comparison is against the Crowd and not against the Procession. The Procession owns emptiness, which is a statement about how many templates are live rather than about how much a section feeds, and at one template at a time it pays less per second than either of the other two. Scarcity is felt as a fall from what came just before, so the Crowd is what the Vigil is measured against.

**The property is a gate on the director's spend.** Like the Procession's, it is a row the director reads: a live-body ceiling of four, initial, against the section's own authored steady state of about two live bodies, so the director has about two bodies of headroom and no more. Only a ceiling can be gated here, because a director that adds and never removes cannot break the Crowd's floor of two live templates. That is why the Crowd carries no such row and the other two do. And like the Procession's, it binds the director and never the authored rows: this section arrives at about 0.8 bodies a second against a ceiling of four, so a hand that kills slowly puts a fifth body on the field in ordinary play, and a row written as a law would fault a player for that under ADR 0023. The spec test states the hand it runs under and the ceiling stays a permission.

This is the section that spends the palette: the one real tint departure, named in section 7.

Shortest of the three on purpose, because the Undertaker has to carry the end. Shepardus's rule for the genre, that Garegga and most Touhou games keep last stages short to put the focus on the bosses, and Ikaruga's chapters dropping back to 3:26 for the last (sibling record section 4).

Nominal clock: about one minute fifteen of trash to the Undertaker. Initial row.

### The clock, end to end

| Phase | Nominal | Note |
| --- | --- | --- |
| The Procession | 0:00 to 2:00 | ends on the sparse row emptying |
| The Banshee | 2:00 to 2:45 | two chunks |
| The Crowd | 2:45 to 5:20 | opens on the Wall, ends on the eye opening, no sparse row |
| The Waking | 5:20 to 6:05 | the set piece |
| The Vigil | 6:05 to 7:20 | cooldown row, then the climb, then the sparse row |
| The Undertaker | 7:20 to 9:00 | three chunks |

Nine minutes nominal, inside ADR 0049's eight-to-ten band. Every figure is an initial row, and the clock is nominal design intent rather than one absolute run clock, because a shootable boss dies when killed (`game-concept.md:52`, ADR 0006's own wording carried forward).

### How a section ends, and why it is a condition rather than a clock

Two of the three sections end the same way and the middle one does not, and what differs is which boundary event ends them.

**The Procession and the Vigil.** Each one's last row is the sparse row: slow, thin, further apart (ADR 0051). The section ends when every row has fired and no mob is alive, and the boss enters on that tick. That is ADR 0051's own sentence made literal ("the boss arrives as the last of them leaves the field"), and it makes the storm matter at the boundary: a player who kills the stragglers meets the boss sooner. Initial rows for the sparse row: four bodies, shamblers, one every ninety ticks. The type is the part worth reading: the ghoul closes, which would make a held breath into a chase, and every revenant is armed (`mobs.ts:99`, `armedShare: 'all'`), so a thin row of revenants is less traffic and more fire, which is the opposite of the beat.

**The Crowd.** It ends on the eye opening and never on an empty field. Its rows keep firing through the pour at their reduced share, so there is nothing for a rows-spent condition to wait on, and if the Crowd had to empty first the dormant eye would have no row to be placed from and the set piece would arrive into silence. ADR 0051 rules this in as many words ("there is no drain-out before the set piece ... only the two boss boundaries need the field empty"), so it is the ruling implemented rather than a departure from it.

The end condition is therefore a column on the phase rather than one rule in code: rows spent and the field clear for the two boss boundaries, the eye opening for the Crowd, and the boss's death for the two boss phases.

The two rows-spent conditions terminate by construction. Every mob type descends: the shambler and the revenant fall, and the ghoul carries a hard descent floor (`mobs.ts:153`, `GHOUL_DESCENT_FLOOR`). The slowest total descent is the scroll plus the slowest type's own speed, 1.35 times `SCROLL_SPEED` (`tuning.ts:27`, `mobs.ts:96`), which crosses the field's 760 units in about 890 ticks, so the tail is bounded near fifteen seconds. That matches the 14.98 to 15.47 seconds `stage.ts:48-50` records from the measured drain-out, which is the same physics measured a different way.

The Crowd has no sparse row, for the same reason: the set piece is a swarm and arrives into trash the way the Wall does (ADR 0051).

---

## 2. The set piece: the Waking, and the one property it must keep

### Identity

Mark chose it and endorsed the scroller resolution (decision 25, `docs/push/decisions.md:103`). It is written into `game-concept.md:50` already.

A dormant eye rides the ground layer down from the top edge on a slower parallax, so it is on screen several times longer than a mob. It opens around mid-field. It pours trash out of its one point while its source drags across the field and drifts down. It fires nothing. It is shootable, so killing it ends the moment early. It leaves off the bottom edge when its budget is spent. A cooldown row follows it before the Vigil climbs.

**Amended 2026-09-08, Mark's ruling after ground adjustment 1:** the eye rides the ground at the field's own scroll and opens a quarter of the way down, so it is on screen for about one crossing of the field, twenty seconds, rather than several times a mob's. What stood: everything else in the paragraph, the pour and its one point, the drag across, the silence, the shootability, the leaving when the budget is spent, and the cooldown row. What changed: the on-screen time, which Mark chose as the cost of the eye staying in its rock, and the opening depth, which is what keeps the pour ending on its budget rather than at the bottom edge now that the fall is twice as fast. What the paragraph could not have known: it was written while the ground ran at half the field's scroll, so a source on a slower parallax was a source sitting still in its own rock; adjustment 1 put the ground at the field's own scroll and the two parted.

The art is already in the staged pack and is on the nose: `assets-staging/crawling-depths/Creatures/Eldritch Entity Dormant.png` and `Eldritch Entity Awaken.png`. The dormant sprite is a background dressing element until it opens, at which point it swaps to the awake sheet. That is the design's own two-state shape delivered by two files, and it is why the Waking is drawn as background art while the two bosses are drawn as vector silhouettes (section 7).

### The property it must keep (ADR 0042)

**The trail pays a grave that commits to it far more than one that waits at the bottom edge, and neither way is death.**

Two-sided, and both halves load-bearing, on the Wall's own pattern (ADR 0042: "its property is two-sided with both halves load-bearing"). If waiting paid as well, the moment is a corpse delivery and the dive is deleted. If committing were lethal, it is a second dose of hell rather than heaven at its loudest, which ADR 0050 forbids in as many words.

It is carried by two bot policies, exactly as the Wall's property is: one that dives up the trail and one that holds low and lets the scroll deliver. Neither seals. The difference between them is corpses, not hits. The unloaded-crossing precedent applies here too: the waiting policy is written as a plausible human rather than an optimizer, because a bot proof is an upper bound on perfect play and never a fairness result.

**Amended 2026-09-08, after the game design gate on adjustment iteration 2:** the mechanism that keeps a hit readable is the mob's own arriving beat. Since the source rides the ground at the field's scroll the pour reaches the bottom edge, so its last bodies materialise inside the box of a grave parked there, and no contact hit lands from a body that has not finished arriving: a body that appears inside the field holds its arriving beat before it can touch, and three quarters of a second is what the player gets to read a body that never crossed an edge. What stood: the property and both its halves, the parking paragraph below, and the hits a hand parked under the mouth takes as the price of the densest traffic in the run. What changed: only which hits land, and barely, since the hand that parks under the mouth across the whole pour takes 31 hits over six seeds at the size ceiling where it took 36; what it no longer takes is a hit on the tick a body appeared. What the paragraph could not have known: the pour ended at y 665 when it was written, above any parked grave's box, so no body had ever appeared inside one.

Precedent, from `docs/research/set-piece-and-final-boss-chunk.md` section 2, option C and its recommendation: the corpse arithmetic decides the shape, because the two shipped swarm shapes are the sweep and the closing ring, and a grave that must pass under its food can only be paid by the sweep. Gradius's ordinary Moai, which die to a shot in the mouth, against Gradius III's indestructible Rolling Moai, is the shipped answer to the shootable question, and the version that fits is the first: killing it shortens the moment rather than skipping it. Pawarumi's stone doors disgorging hundreds of fighters, Ikaruga's idiom of a big enemy's death spawning the bonus swarm, and Left 4 Dead's crescendo as a place on the map with a visible marker are the announcement precedents, all diegetic and none a banner.

The tests hold the property and never the cast (ADR 0042). Nothing in the test list names a mob type the Waking pours.

### Two sentences under it that the harness can check

The property above is a comparison between two bot policies. Two more sentences sit under it, both magnitudes rather than comparisons, and both exist because the loudest beat in the run must not be deleted by playing well.

**The source outlives its own pour under the sharp hand.** Its health is a data row. The derivation, all initial. A full build at full uptime on one body directly above the grave does about 150 points of storm a second: the skull stream's five columns at eight damage a skull every eighteen ticks (`skullStream.ts:25`, `skullStream.ts:86`, `skullStream.ts:41`), which is 5 x 8 / 0.3 = 133.3 a second, plus the bell's forty at close range every hundred and eighty ticks (`bell.ts:54`, `bell.ts:32`), which is 40 / 3 = 13.3 a second, for 146.6. Territory and the wisps are left out of that figure rather than counted in it: Territory claims the densest knot of mobs ahead of the grave and the wisps fire on a swallow and hunt bodies, so neither is a dependable share against one stationary source. Both add on top, and the harness measures the real number at step 4. The pour is 75 bodies at one every twelve ticks, which is fifteen seconds, so the floor on the source's health is 150 x 15 = 2250 and the initial row is **2400**, a second of margin above it.

**The pour is denser than anything the Crowd authored.** The Crowd's densest authored ten seconds is 3.6 bodies a second. A pour at 3 a second, which is where this record's first draft put it, is under that, so the loudest beat in the run would arrive thinner than the section it interrupts. The initial row is one body every twelve ticks, **5.0 a second**, a little under half again the Crowd's peak. Initial, tuned by the harness at step 4.

**The shape is Gradius's Moai: vulnerable only while open.** The dormant source takes no damage at all; the storm can touch it only once it has opened and is pouring. Gradius's ordinary Moai are background statuary that die to a shot in the mouth, and the mouth is there to shoot only while the statue is firing (`docs/research/set-piece-and-final-boss-chunk.md` section 2). With the health row beside it, that means a fast kill never deletes the moment: it ends the source's stay rather than its pour, which is Ikaruga's bunretsu read the same way round, where speedkilling the midboss buys the player a longer payout rather than a shorter one (the same record, section 2). What the storm still buys is the tail. The source leaves the moment it dies rather than drifting off the bottom edge, so the Vigil's cooldown row starts sooner.

This refines `game-concept.md:50`'s "killing it ends the moment early" into killing it ending the source's *stay* early. The pour is what the moment is. The three close reasons stand unchanged, the budget spent, the mouth killed, or the source off the bottom edge, with the budget the ordinary one by construction. The plan carries this as a new commitment, for Mark to overrule if he reads that sentence as the ruling rather than as the description.

### The two rules the craft call left to write

**Parking under the mouth.** No special rule, and the absence is the design. The mouth has no hitbox against the grave: it rides the ground layer, below the mob layer, and only the storm can touch it. So a grave parked under the source sits in the densest incoming traffic it will meet all run, taking contact shrink from bodies and fire from whichever of them are armed, and eating the corpses at full freshness. Danger and opportunity in the same place is the project's central bet (`VISION.md:21`), and this is the loudest instance of it. What the code must state, and what a test must hold, is the absence: the source is never in the mob-contact pass and never damages the grave.

**The trail near a field edge.** The source's sweep is bounded to the field's middle three fifths, so the trail never lays against a side. Initial rows: the sweep runs between x = 108 and x = 432 of the field's 540 (`field.ts:10`). The reason is not the grave's reach, which covers the whole width because `containGrave` keeps the grave centre inside its own half width (`grave.ts:94-95`); it is that a body walking in at an edge picks up the edge walk-in (`mobs.ts:288-298`) and its corpse lands in a narrow band the dive cannot follow as a curve. The sweep bound keeps the trail a curve rather than a wall of corpses in a gutter.

### Budget and end condition

The Waking pours a finite budget and ends on a condition, never on a timer. That is the industry standard for a mid-stage set piece and the research found no shipped duration in seconds for any of them (research record, "What is solid" claim 1 and the Open items). It ends three ways: the budget spent, the mouth killed, or the source off the bottom edge.

Initial rows: a budget of 75 bodies, poured at one body every 12 ticks, the source drifting at half the scroll and sweeping across the field once, and 2400 points of health that only the open source can lose. That is 900 ticks of pour, fifteen seconds, which is shorter than the source's own descent, so the ordinary end is the budget.

**Amended 2026-09-08, the drift row this paragraph names, left stale by adjustment iteration 2 and found by the reviewer on iteration 3:** the source drifts at the field's own scroll, not at half of it, and it opens a quarter of the way down. What stood: the budget of 75, the rate of one body every 12 ticks, the single sweep, the health row, and the conclusion, that the ordinary end is the budget. What changed: only the margin behind that conclusion, which is now 47 ticks rather than the whole second half of the field: the fall from the opening depth to the close is 947 ticks against the pour's 900. What the paragraph could not have known: the ground was at half the field's scroll when it was written, and the opening depth moved to 0.25 with the drift to keep the pour inside the field.

The pour spaces bodies at the source so two do not arrive on the same point. That is the narrow answer to #81 for this one caller; the general mechanism stays unowned and its trigger is named in the plan.

Not a second feast, and no second reservoir gift: the Wall stays the run's outlier (ADR 0050).

---

## 3. The Banshee and the Wall: as built against as ruled

### As built

Nothing of the Banshee exists. The `banshee` phase is a stub with no rows at `stage.ts:152`, and `stage.ts:145-150` states why in the file: a boss phase with no boss has no rows, so it ends on the tick it begins.

The Wall exists as half of itself. The template is built (`templates.ts:179-189`), and its one authored row is `{ t: 2, template: 'wall', count: 22, type: 'shambler' }` at `stage.ts:114`, whose comment at `stage.ts:107-112` says the clock anchors on the Banshee's death and that with the boss phase stubbed the row lands two seconds into the back half. The count is load-bearing and not tuning: 22 shamblers at 22 units wide fill the field's 540 leaving gaps of 2.5 units, against a floor grave 18 units wide, so the curtain has no gap the grave can slip through at any size (`mobs.ts:70-73`).

The feast machinery is built and unused. `spawnFeast` is at `corpses.ts:216` with a comment at `corpses.ts:211-215` saying nothing spawns one yet and the boss dispatch inherits the mechanism. `FEAST_PAYOUT` is nine trash corpses (`tuning.ts:102`) and `RESERVOIR_CAPACITY` is exactly that (`tuning.ts:109`), so one fully fresh feast fills the reservoir and wastes nothing, by construction rather than by two numbers agreeing.

The palette already declares her: `banshee` at hex 0x98b2a7 luma 67.32 and `bansheeDark` at 0x3f7a68 luma 42.41 (`palette.ts:57-58`).

The Wall has never been tested against ADR 0042's own property, because both bot policies that carry it need the belch, which arrived later (`tracer-plan.md:176`).

### As ruled

ADR 0007: she arrives alone on a phase boundary with chunked health, one authored pattern per chunk, and a short invincible flash at chunk breaks. No pure-dodge phase. Full bell damage and no bell pushback, while her adds are pushed normally. She sheds food throughout.

`game-concept.md:68`: chunk one is slow expanding tear-rings each with one clean gap; chunk two is a second offset ring source so the gaps stop lining up. Her death drops a feast corpse that never decays, worth roughly eight to ten fresh trash corpses, and swallowing it slams the reservoir to full. Her death launches the Wall, deliberately oversized and already arriving as the dive completes.

`game-concept.md:56` splits the anchor and it matters: her *death* starts the Wall clock, and only the *swallow* of her corpse slams the reservoir. So the stage never waits on a pickup, and a player who misses the feast meets the Wall unloaded. That is what makes the Wall's two-sided property live rather than decorative.

`game-concept.md:72`: the ring is hers alone now that the bell throws cones, so the grammar separation no longer leans on a shared shape.

### What this step builds

Two chunks, the feast on death, the Wall row two seconds later, and the two bot policies that carry the Wall's property at last. Health per chunk is tuning data. Her fight is nominally forty to fifty seconds, which is DoDonPachi's stage-one boss at 0:45 (`docs/research/shmup-stage-design.md` section 1) and is a miniboss share of the stage rather than a boss share.

Her tear-rings are mob fire, drawn in the reserved value band, and are never a cone (`CONTEXT.md:79`). They draw in their own colour rather than in the trash shot's: `palette.ts:256` already declares `tear`, `clod` and `spiral` beside `trash`, and `palette.ts:270-290` already gives each its three colours, so the palette anticipated boss fire the way it anticipated the two boss bodies. What that costs is a fire kind on the shot itself, because who fired a shot and what the shot looks like are two different questions: her rings and her adds' shots share an emitter and not a read.

---

## 4. The Undertaker's three chunks, as patterns

ADR 0052 rules the length and the chunk count: about a minute and a half to two minutes, bought across three chunks rather than across a bigger health bar, with the third chunk a new pattern inside his own grammar. `game-concept.md:70` and `game-concept.md:72` fix the grammar: falling curtains and slow spirals, exclusive to him.

### Chunk one, the burial

Shovelfuls of dirt fall from the top as slow clod curtains with one moving gap. The gap always fits: gap width is the current grave width plus a fixed margin, so size earned before the fight is never punished (`game-concept.md:70`, ADR 0003's coupling of the gap rule to grave width, `grave.ts:71` for `graveWidth`). Clods are ordinary mob fire, one small shrink on touch, and never a wall.

Precedent: Cave's stage-ending bosses at roughly a minute to a minute and a half with three chunks (ADR 0052). The never-a-wall rule is the danmaku literature's own definition, "any Group or formation of bullets where a player cannot move through the constituent bullets", cited in `docs/research/set-piece-and-final-boss-chunk.md` section 3.

Initial rows: curtain period, clod count per curtain, gap margin, fall speed.

### Chunk two, the exhumation

A slow one-arm shovel spiral, plus summoned digger zombies. Diggers are base trash respawned by the boss, so no new mob budget, and their corpses land inside the fight and keep the swallow economy and the bell alive at the climax (`game-concept.md:70`, ADR 0007's shed food).

Precedent: the single-emitter spiral is the shipped base every escalation in the research's taxonomy is measured against; the second emitter of the same kind is the move the Banshee already owns, which is why the Undertaker does not spend it (research record section 3, and the taxonomy row "Add a second emitter of the same kind: yes, and already spent by the Banshee").

Initial rows: spiral period, arm sweep rate, shots per revolution, digger cadence.

### Chunk three, the locked overlap, placed last

Mark's choice (decision 26, `decisions.md:104`), recommended by `docs/research/set-piece-and-final-boss-chunk.md` section 4 as option C. Clods fall while the shovel spirals, the curtain's gap sits where the arm has just swept, the curtain thins to pay for the overlap, and the diggers keep coming.

Precedent, all from that record's section 4: Yuyuko's "-Trackless Path-", which fires two previously alternating waves together and pays for it by dropping density "to a much lesser" level; Orin's Lunatic cycle compression "making the waves overlap"; Remilia's final card cycling four of the fight's motifs; Ballos's final form layering three earlier threats; Ran's six-emitter pile-up. The record's summary is that a boss's last chunk is a layering of what came before rather than a new shape.

**Take Yuyuko's trade with it.** The curtain is thinner in chunk three than in chunk one, not denser. The shipped precedent buys simultaneity by cutting density, and doing the same here also protects the never-a-wall rule and the gap rule. Initial row: the chunk-three curtain carries about two thirds of chunk one's clod count.

**Last, and the reason is food.** Chunk two is the one that summons diggers. A third chunk placed last that dropped them would end the game on its only foodless stretch, so the diggers run through the overlap, which makes the final chunk both the busiest pattern and the richest feeding of the fight.

**Legibility is proven, not assumed.** The player has to see that the gap follows the arm, or it reads as a random gap in a busier screen and the twist is wasted. ZUN's bar is the one to hold it to: "Ideally, at the instant a player is hit, anyone can understand the solution." No test can see this, so it is named as a human-only property in the plan.

### Does a pattern ever complete uncancelled?

An open play question in the handoff (`docs/push/handoff.md:59`), with no ruling. **The assumption this design runs under: yes, and it is the baseline rather than the exception.**

The reasoning is the reservoir's arithmetic. The belch fires only at a full reservoir, never as a partial bomb (ADR 0008, `belch.ts:57`), and capacity is one whole feast (`tuning.ts:109`). Inside the Undertaker fight the only fill is the diggers' corpses and the chunk-break feasts, so a player earns at most one or two belches across ninety to a hundred and twenty seconds. Three chunks running several pattern cycles each therefore contain many more cycles than the player can cancel, so most cycles complete uncancelled by construction.

Two things follow, and both are what the design wants. Every chunk's pattern is authored to be survivable uncancelled, so the belch is a relief valve rather than the answer, which is what makes #37 story 12 ("one belch plus good manoeuvring and guns is enough to beat the boss") a statement about skill rather than about resources. And the belch buys a breath and a repositioning rather than a skip, which `VISION.md:25` already states as a bet.

The caution the research names travels with chunk three: the belch cancels every shot on the field and the pattern resumes emitting immediately, so against two overlapped emitters that resume together it buys noticeably less breathing room than against one. That wants a number out of the belch-in-boss instrument rather than a guess, and it is the tuning pass's (#39).

`game-concept.md:104` already lists "whether a pattern chunk ever ends before finishing one full emit" as a slice instrument, so the question has a watcher.

### And does a chunk ever complete uncancelled by the storm?

The answer above is about the belch, and the belch is only one of the two ways a chunk can end before its pattern does. The other is the storm: a full build killing a chunk mid-pattern means the best player in the game is the one who never sees the pattern the chunk was written for, and the dose of hell is deleted by playing well. `game-concept.md:104`'s instrument names the symptom for both.

**The property: every chunk survives one full emit under the sharp hand.** It is the same shape as the set piece's health row, and `CHUNK_HP` is what holds it.

The floor, arithmetic shown, all initial. One emit is one complete cycle of the chunk's live pattern: one clod curtain falling from the top edge with its gap sweeping once, four seconds; one full revolution of the shovel arm, five seconds; and in chunk three the longer of the two, five seconds. Against the same 150 points of storm a second the set piece is sized against (section 2), the floor per chunk is 150 x 5 = 750.

The initial rows sit well above that floor, because the floor is not the fight's length. ADR 0052 buys ninety to a hundred and twenty seconds across three chunks. A boss stands at the top of the field while the grave dodges, so the share of that 150 which actually lands is far below full uptime; the initial assumption is one third, 50 points a second, which makes a hundred-second fight 5000 points across three chunks. `CHUNK_HP` for the Undertaker is therefore **1700, 1700, 1700** initially: 5100 at 50 a second is 102 seconds, and every chunk clears the 750 floor by more than double. The Banshee's rows are derived the same way against her nominal forty-five seconds, **1100 and 1100**: 2200 at 50 a second is 44 seconds, and each chunk clears the floor of one full tear-ring cycle. The effective share and the health rows are both among the first things the harness measures at step 4, and ADR 0052 already calls health per chunk tuning data.

---

## 5. Both endings, as observable moments

### Sealed shut

Built and real (`grave.ts:161-163`, `events.ts:89-92`). What a player sees: at the size floor, the next hit bleeds the whole score, then the hit after that strips one level off every line down to the birthright, and only when nothing is left to bleed does the next hit seal the grave shut. The end screen reads SEALED SHUT (`EndScreen.ts:20`). The grave is never destroyed or killed; it is sealed (`CONTEXT.md:21`).

Nothing in this step changes it. What changes is that a run can now reach it inside a real boss fight, which is where the floor ladder was always meant to be read.

### Victory

Stubbed today: `stage.ts:214-216` sets `ending = 'victory'` the moment the stage advances into the `over` phase, and both boss phases end on the tick they begin, so the stub is the only victory the game has ever produced. `EndScreen.ts:15-17` says in its own comment that the victory line is a stub's line only in the sense that the Undertaker is not built yet.

What a player sees after this step: the Undertaker's third chunk empties, his last shots are already on the field and keep travelling, he topples into the grave, and the swallow is the victory animation. No payout. The grave swallows the gravedigger (`game-concept.md:70`).

The sim fires `victory` on his death. The topple and the swallow are the renderer's animation over a run that has already ended, not a condition on it, because gating the ending on a dive would let a player who never dives leave the run running with nothing left to play. The end screen reads THE STAGE SURVIVED (`EndScreen.ts:21`), which stops being a stub's line the moment there is a boss behind it.

---

## 6. The carrier schedule across the new rows

Step 1 builds the carrier column on `StageRow` and a first schedule on the old rows; step 2 re-authors the rows and re-places the carriers. The derivation is step 1's and does not move: nineteen carriers for a full build from the birthright, times `CARRIER_SLACK` 1.3, is twenty-five scheduled (step 1 plan, section 8).

Initial distribution: eight in the Procession, eleven in the Crowd, six in the Vigil.

The reason it is front-loaded twice over. A player who kills every carrier in the Procession and the Crowd has taken nineteen offers by the Waking, which is a full build, so the storm is at its loudest for the moment the storm is supposed to shred (ADR 0050). That is decision 10's own condition, in Mark's words, that a player who kills every carrier reaches the storm well before the boss. And every shipped shmup on record puts its power ceiling in the first stage or two (ADR 0049's closing paragraph). The Vigil's six are pure slack: they are what makes a miss cost a step rather than the run (ADR 0048).

A carrier the player never kills pays nothing and nothing reaches after the player to make it up (ADR 0048). The Vigil's six are the schedule absorbing that, not a catch-up mechanism.

Which mob in a row carries stays step 1's rule: the row's middle placement index, one carrier per carrying row, keyed to the row's own placement order and not to `SpawnOrder.index` (`stage.ts:267-271`, `carriers.ts:57-70`). The armed share is keyed to `SpawnOrder.index` (`templates.ts:23-28`, `mobFire.ts:114`) and the carrier deliberately is not: a mirrored template repeats that index once per arm, so keying the carrier to it would put one on each arm and break the one-per-row contract.

---

## 7. The stand-ins, per section

Decision 1 draws the line: stand-in art, music and backgrounds mark the sections and nothing more (`handoff.md:42`). ADR 0049 says the same from the other side: they enter V1 as the thing that makes a section tellable rather than as dressing. Decision 22's amendment (`decisions.md:101`) sets the form: no section card, the boundaries carried by a music change at the boundary event and by the background drifting continuously between them, with the tint departure in the last section.

### Music

The engine already loops and cross-fades. `engine/audio/audio.ts:38` is the only `loop: true` in the app, `audio.ts:24-31` fades the previous track out over a second, `audio.ts:40-44` fades the new one in, and `audio.ts:21` makes `play` a no-op when the alias has not changed, which makes it safe to call on every `phaseChanged`. Nothing in `src/app` has ever called it: the only callers are in the prototype (`prototypes/ugly-slice/screens/TitleScreen.ts:128` and `.../game/GameScreen.ts:392`). `events.ts:241` says in its own comment that the music cue hangs on `phaseChanged`, and `sound.ts:61` deliberately returns null for it today.

So the music work is a caller, a per-phase data row, and a bundle. **What is ruled is three loops, one per section, with the two changes at the two boundary events.** Decision 22's amendment (`decisions.md:101`) names two music changes and names where they fall: the Banshee's death, and the eye opening. Three loops and two changes is that sentence exactly, and it is what this step builds. From the staged pack at `assets-staging/music/`:

| From | To | Loop | Length | Why |
| --- | --- | --- | --- | --- |
| The run's first tick | The Banshee's death | `bells-of-death.mp3` | 118.2 s | a funeral toll under a section that is a funeral filing past, and the right register when she arrives; it covers the Procession and her fight, two minutes forty-five, with one repeat |
| The Banshee's death | The eye opening | `seek-n-slaughter.mp3` | 103.4 s | driving, under the section that owns overlap, entering on the Wall; it covers the Crowd's two thirty-five with one repeat |
| The eye opening | The end | `a-hollow-call.mp3` | 147.7 s | the longest loop in the pack, so the run's longest musical stretch, the Waking through the Vigil to the Undertaker's death and about three minutes forty, repeats once rather than three times; a hollow call is the eye's own announcement carried into the burial |

The `over` phase plays nothing: the fade out is the ending.

**The per-phase row stays, and it is what makes six a data-row edit rather than a rebuild.** `Phase.music` names one alias per phase. Under the ruled three, the Banshee's phase names the Procession's alias, and the Vigil's and the Undertaker's both name the Waking's; `audio.ts:21` makes `play` a no-op on an unchanged alias, so no change fires where none is wanted. The mechanism is identical either way and the difference between three loops and six is three strings in a data table.

**Six loops, one per phase, is a proposal and not what this step ships.** The argument for it is Iuchi's, and it is specific: he wrote downbeat music for the stage-two boss because "had we used a really uptempo, aggressive musical theme for the stage 2 boss, it would have destroyed this pacing" (`docs/research/stage-length-with-a-director.md` section 4), so a boss inheriting its section's loop is the mistake he names. The argument against is that decision 22's amendment ruled two changes, and six loops gives the two bosses and the set piece themes of their own, which is the one place this step would dress past the line decision 1 drew. No test and no harness reading can separate the two, because neither can hear. It is a thing Mark's play can ask for, and the ask costs three strings. Three ships, and the three are chosen so each still sits under its own boss: a funeral toll under the Banshee, a hollow call under the burial.

**Encoding.** The three chosen loops run 118.2, 103.4 and 147.7 seconds, 369.3 seconds in all, at about 167 kbps stereo as staged, which is 7.7 MB. AssetPack's audio pipe emits both mp3 and ogg per source (`public/assets/main/sounds/`), so shipped that is roughly 15 MB. Re-encoding the three to 96 kbps mono under pre-authorization item 9 brings them to about 4.4 MB and the shipped pair to about 8.9 MB. Initial figures; the coding agent reports what it measures.

**Bundle.** Not `main`. `engine/engine.ts:61-63` background-loads every bundle, and `navigation/navigation.ts:156-158` awaits a screen's declared bundles before constructing it, so putting music in `main` would make every screen in the app wait on eight megabytes. The stand-ins get their own bundle from a new `raw-assets/music{m}` folder, background-loaded and never declared by a screen, and the section cue is applied both on `phaseChanged` and again when the bundle resolves, so an early boundary is not silently silent.

**The loop gap, measured before anything is built for it.** Mp3 loop gaps are a known browser issue and the encoder wrote LAME headers (`handoff.md:33`), and an earlier version of this record turned that into a design: decode the file, read the header's delay and padding, loop a buffer sliced by them. That is withdrawn, because the premise under it is stale. Every engine the game runs on now trims the encoder's delay and padding on decode: Firefox since 83 (Bugzilla 1566389), Chrome, and WebKit (bug 223519). So the app builds no trim, and it certainly does not ship an mp3 header parser to work around a browser bug that no longer exists.

What stands is the measurement, and it comes first: the three loops are staged, then played through the app's own audio path, and the wrap of each is measured off the output rather than off a number. The expected reading is no gap. If a gap survives on any loop, the answer is that loop's own `start` and `end` in seconds as data rows beside its alias, which is three numbers and no code: `@pixi/sound` 6 already maps `start` and `end` to the source node's `loopStart` and `loopEnd`, and also takes a decoded `AudioBuffer` directly if a loop ever needs one prepared. Initial rows if they are needed at all, like every other number here.

**Licence, settled.** `assets-staging/music/manifest.md:24` records "License file: none found," and that is a stale reading rather than an open item: Mark settled it on 2026-09-08 (`handoff.md:30`), the pack came from itch.io the same way as the pixel packs, free for personal and commercial use, and it is a placeholder in any case. Nothing waits on it.

### Backgrounds

The field draws no ground today. `layering.ts:17` declares a `ground` layer and nothing ever calls `layers.layer('ground')`, so the container is created empty and stays empty, and the engine's clear colour (`main.ts:38`, `PALETTE.night.hex`) is both the surround and the field's ground. `fieldFrame.ts:10-12` says so in its own comment, which is why the boundary stroke is the entire visual statement of where the world ends.

The stand-in background fills `ground`, which is already masked to the field rect (`GameScreen.ts:171-173`), so nothing new about clipping is needed and no new layer is added. That last point matters: `layering.ts:16-29`'s order is ADR 0014's stack, pinned as a literal at `src/app/__tests__/layering.test.ts:73-86`, so adding a layer name would be an ADR 0014 change. Ordering inside `ground` costs nothing.

Two parts, both from `assets-staging/crawling-depths/`:

- **The ground itself**, tiled from `Terrain/Tiles.png`, scrolling at half the field's scroll so it reads as parallax depth under the mobs. One tile set for all three sections, because the rock is the same rock.

  **Amended 2026-09-08, Mark's ruling after the 13b deploy:** the ground scrolls at the field's own scroll and not at half of it, because Territory is lobbed onto the ground and belongs to it, and a patch drifts in the sim at `SCROLL_SPEED`; at half, the rock slid out from under every landed patch and the field stopped reading as one place. The parallax row is gone rather than set to one. **Amended in the same breath:** the ground is not tiled from `Terrain/Tiles.png` at all. That sheet is twenty bordered blocks lit at twenty angles, and tiled whole it read as a lattice of loose blocks placed at random and spun. The floor is baked at import from an authored layout of five of those cells, laid as large slabs whose grooves survive only where two slabs meet, so the floor reads as one paved piece of ground. The bake lives in `scripts/grayscale-import.ts`; the runtime still draws one tiling texture and knows nothing of the layout.
- **Dressing**, sprites placed on a seeded stream and drifting at the ground's speed, from `Structures & Details/` and `Terrain/`. The set turns over per section and that is what makes a section tellable:
  - The Procession: `Statue A1/A2`, `Statue B1/B2`, `Cliff`, `Cracks`. Bare rock with a statue every few seconds.
  - The Crowd: `Urn 1/2`, `Short Vein Column 1/2`, `Tall Vein Column 1/2`, `Little Eyes 1 Sheet`. The same rock, veined and wet.
  - The Vigil: `Floating Rock A1/A2`, `Floating Rock B1/B2`, `Eye 1 Sheet`, `Tentacle 1 Sheet`. The rock stops reading as rock.

  **Amended 2026-09-08, Mark's ruling after the 13b deploy:** the dressing was too sparse, so the density is authored as pieces standing on the field at once and the placement interval is derived from it and the crossing, never the other way round. The three sets grow with the row, in their own families and colours: the Procession takes `Statue C1/C2` and `Book Altar`, the Crowd takes the `Vein A` and `Vein B` sheets, and the Vigil takes `Amalgam Arc 1/2`. `Cracks` is still not in the Procession's set, for the reason slice 13b recorded.

**The drift between sections.** Decision 22's amendment takes Einhänder's answer: the background drifts continuously rather than cutting. Mechanically that is a cross-over window at each boundary, during which the outgoing section's dressing stops being placed and the incoming section's starts, so the two families are on screen together for as long as it takes the last of the old to scroll off. No fade, no cut, no card. Initial row: the window opens at the boundary event and closes when the last outgoing dressing sprite leaves the bottom edge.

**Nearest-neighbour.** There is no scale mode set anywhere in the app, so pixel art would land bilinear-filtered. It is set per texture on the stand-in sprites rather than globally, because the existing UI art (`raw-assets/main{m}/ui{tps}/button.png` and friends) is not pixel art and a global default would soften nothing usefully and harden the buttons' edges.

**The two bosses are not pixel art.** They are drawn as vector silhouettes in the palette entries that already exist for them, `banshee`/`bansheeDark` and `undertaker`/`undertakerDark` (`palette.ts:57-60`), by the same construction the three mob types use: a body plus a near-black companion, which is ADR 0014's answer to the 62-of-66 pairs measuring Lc 0.00 at the top of the value budget. That keeps the stand-in question off the readability-critical path and confines pixel art, and the smoothing question with it, to the ground layer. The Waking is the exception and is background art by construction, because decision 25 puts it on the ground layer riding a slower parallax.

**Amended 2026-09-08, Mark's ruling after ground adjustment 1:** the source rides the ground at the field's own scroll and not on a slower parallax. What stood: the sentence's own conclusion, that the Waking is background art on the ground layer, which is if anything firmer now that it moves at exactly the rock's rate. What changed: only the reason, the parallax half of it. What the sentence could not have known: the ground was itself at half the field's scroll when it was written.

### The palette check, against #38's constraint comments

#38's constraint comment (posted 2026-09-07) is the only place the colour bans are written down, and it binds the stand-ins in full: no brown, no AI purple, no non-fire art in hue 20 to 39, the ADR 0014 layering stack and its value band, the grayscale check at target density, and every mob still readable before it acts.

What is mechanically enforced today, from `src/app/__tests__/palette.test.ts`:

- Every non-fire field colour is at or below luma 68 (`FIELD_LUMA_CEILING`, `palette.ts:16`), and every mob-fire core is at or above 88 (`MOB_FIRE_BAND_MIN`, `palette.ts:13`), with a 20-point margin between them.
- Every non-fire hue is at least 20 degrees off every mob-fire body hue (`FIRE_HUE_EXCLUSION`). The fire body hues run from about 4 to about 19 degrees, so the closed band is hue 0 to 39, which is exactly #38's pumpkin exclusion.
- The brown ban is a real test at `palette.test.ts:479-493`, measured as hue in [20, 50) with saturation at or above 0.5 and value below 0.55.
- **There is no purple assertion.** "Purple is banned outright" appears only as prose at `palette.ts:84` and `palette.ts:123`. A purple stand-in would be caught by review and not by a test, so the tint departure below is chosen so that the question never comes up.
- Every file under `src/app/screens/game/` is source-scanned and may contain no hex literal and no `blendMode` (`palette.test.ts:781-788`). A background module lands inside that scan, so every colour it draws is a `PALETTE` entry and every new entry carries the ceiling and the separation checks.

**Every imported sprite and tile is desaturated to grayscale on import.** This is the one mechanical answer to the purple ban, and it is needed because both of the things that would otherwise catch a violet texture fail here. The staged pixel art is violet-blue, measured rather than eyeballed: the tileset's median hue is 234, the statues 252, the Waking sprite 234, and the Vigil's floating rocks hue 265 at 0.59 saturation. A PixiJS tint multiplies the texture's own colour and cannot move a hue, so tinting a violet rock with a teal entry yields a darker violet rock. And the palette suite's source scan cannot see a texture at all: it reads the modules under `src/app/screens/game/` for hex literals (`palette.test.ts:781-788`), and a PNG carries no hex literal.

So the asset pipeline desaturates every imported sprite and tile before it reaches `raw-assets`, with ImageMagick (`magick in.png -colorspace Gray out.png`; ffmpeg's `hue=s=0` does the same job and both are installed), and the art is coloured only by its palette entry through tint. That makes the existing palette tests binding on the stand-in art for free: a grayscale texture has no hue of its own, so the only hue on screen is the entry's, and the entry already carries the ceiling, the fire exclusion and the brown check. It is also what turns the grayscale check at target density into a check of the palette rather than a check of the pack.

The pipeline is a committed script rather than a step somebody performs, because it runs again every time an asset is restaged and an unowned import step is one that gets done by hand once. The guard beside it is a test that reads the staged PNGs and fails on any pixel with saturation above zero, which is the one test in the suite that sees a texture and exists because nothing else can. That test needs a PNG decoder under vitest and the tree has none it can rely on, so it gets a declared one of its own rather than borrowing whatever another package happened to install: a fence whose decoder arrives transitively is a fence that stops running the day that package changes, silently and with every test still green.

**The tint departure, named before it is authored.** #97's second comment asks for exactly this, because the last section's one real departure is a deliberate colour decision made against a two-colour ban.

It departs to deep teal-cyan, hue about 190. The reason is that `docs/research/readability-value-band.md` section 7.5, quoted in #38's second comment, records hue 50 to 125 and 175 to 205 as entirely empty, and 175 to 205 is the half of that still empty today: `territory` sits at hue 95 and `mob` at about 127, so the 50 to 125 band is spoken for, while the nearest occupants of the teal band are `wisp` at 172.24 and `skull` at 208.24, leaving 190 eighteen degrees clear of each. Eighteen clears the sprite-separation minimum of fifteen degrees, and the ground sits tens of luma points below both anyway.

It is spent Downwell's way: two sections on the base palette with dressing changes only, and the fourth colour held back for the last, so the addition is itself the event (`docs/research/section-feel-consent-and-rung-restore.md` claims 1 and 2). It is not brown, it is not purple, and it is outside the fire exclusion by a wide margin.

Initial palette rows, each to be measured in tree by the coding agent before it is written down, under this repo's own `color.ts` and never carried over from here:

| Name | Role | Target |
| --- | --- | --- |
| `groundTile` | the ground the field stands on, every section | the `nightSpeckle` family, hue about 215, luma near 14 |
| `groundDressCold` | the Procession's statues and cliff | hue about 215, luma near 22 |
| `groundDressWet` | the Crowd's urns and veins | hue about 165, luma near 24 |
| `vigilTint` | the Vigil's eyes, tentacles and floating rocks; the one departure | hue about 190, luma near 30, the highest saturation of the four |
| `waking` / `wakingDark` | the set piece's source, dormant and awake | the Crowd's own family, hue about 165, body at or below luma 68 with a near-black companion |

`nightSpeckle` (0x1d2434, luma 13.99, `palette.ts:33`) is already declared and used nowhere in `src/app`; it is a ready-made ground colour with no consumer, and the ground tile is its consumer.

**The Waking takes the Crowd's colour, not the Vigil's.** The source is placed by a Crowd row, rides down through the Crowd, and opens as the Crowd's boundary event, so it belongs to that section's family at hue about 165. Giving it the hue 190 entry would spend the fourth colour a section early, and Downwell's move is spent once or not at all: the addition has to be the event, and it cannot be if it has already been on screen for a minute and a half.

That puts the source in the same family as the Crowd's own eye dressing (`Little Eyes 1 Sheet`), which is the point, and it leaves one thing the player has to be able to read: which eye is going to wake. The stand-in answer is **size**. The source draws at three times the dressing eyes' footprint, initial row, so the eye that wakes is the one that was always too big to be dressing. A slow blink was the alternative and is not chosen, because it needs frames the staged pack does not carry while a stand-in should cost a scale factor. Marked stand-in and tagged with the rest of them; whether it actually reads is a verification step and not a test.

**The grayscale check runs at target density**, which is #38's own criterion and the one that catches a texture, since the source scan cannot see one.

**Tagging the stand-ins so a look is never counted as data.** Decision 13 asks for it and #38's closing comment repeats it. The stand-in assets live under their own bundle and folder names (`raw-assets/music{m}`, and a `standIn` prefix on the palette entries and the background module), so a run's report can say which build drew stand-ins, and a tester's reaction to the look is separable from a reaction to the game. The tape header already carries the commit hash and build identity, so the join is free.

---

## 8. The corpse cap, re-sized and never evicting

Decision 19 and ADR 0056 rule it: the corpse cap is sized from scroll physics so that it cannot bind in normal play, never evicts food, and raises a fault if it ever binds. ADR 0056 says explicitly that this is the code's own rule about caps applied and not a new one, and `caps.ts:64-67` is the rule it means: nothing already on the field is ever removed, because a shot the player has read and started dodging cannot vanish.

### What is built today, and why it contradicts the ruling

`CORPSE_CAP` is 200 (`caps.ts:24`). `claimSlot` at `corpses.ts:160` takes a free slot when there is one and otherwise evicts the oldest decaying corpse through `oldestEvictable` (`corpses.ts:144`), emitting `corpseEvicted` (`corpses.ts:168-173`, `events.ts:146-151`). The eviction has a written rationale at `corpses.ts:153-159`: the freshest corpse is the one worth diving for and the oldest is nearly worthless, so dropping the oldest costs the player least, and refusing the spawn would silently punish killing a lot at once.

That rationale is coherent and it is now superseded, because ADR 0056 rules that a cap which binds in normal play is a bug rather than a policy, and the answer to a bug is a fault and not a graceful degradation. Under the new rule the eviction path cannot be reached in normal play, so keeping it means keeping a branch nothing exercises, and reaching it means a fault that eviction would hide.

### The derivation

Not an estimate. A proof, from the two clocks the game already has.

A decaying corpse lives at most `FRESHNESS_SECONDS`, which is derived from the scroll rather than declared (`tuning.ts:37`: `FIELD_HEIGHT / 2 / (SCROLL_SPEED * TICK_HZ)`, ten seconds exactly at today's rows), and expires at zero (`corpses.ts:272-282`). So every decaying corpse alive at any instant was created inside the last ten seconds.

Every one of them came from a body the stage put on the field. The bodies killed inside a ten-second window are at most those alive when the window opened, plus those that arrived during it. The first term is bounded by `MOB_CAP` (`caps.ts:22`). The second is bounded by the stage's own content, and the stage's own content means the section tables, the set piece's pour, the bosses' adds and the rungs a hit can strip, never the section tables alone.

Treasure does not decay and lives until the bottom edge, at most `FIELD_HEIGHT / SCROLL_SPEED`, twenty seconds. Its count is bounded by design: three offer bodies at most, because exactly one offer is live at a time (ADR 0034), plus the feasts a fight can have shed.

So:

```
CORPSE_CAP = MOB_CAP + peakArrivals(FRESHNESS_SECONDS) + TREASURE_ALLOWANCE
```

`peakArrivals(seconds)` is a query over every body the stage itself can put on the field: the maximum, across every window of that length anywhere in the stage, of four terms. The section tables and the set piece's pour are the first two. **Boss-summoned adds are the third**, the Undertaker's diggers and the Banshee's, because shedding food throughout a fight is ADR 0007's own requirement and those adds leave ordinary corpses (`CONTEXT.md:157`). **Stripped rung bodies are the fourth** (ADR 0055), because a hit at the floor puts a body on the field that behaves like food and the corpse pool is what holds it. Without the last two the query never looks inside a boss phase at all, and the one place a refused corpse costs the player most is the climax of the Undertaker fight, where the diggers are the only food there is. It is computed rather than written down, which is what "make it data rather than a compiled constant" means here.

`TREASURE_ALLOWANCE` is an initial row of 10: three offer bodies, the Banshee's death feast, her one chunk-break feast, the Undertaker's two chunk-break feasts, and three spare.

### The initial number

At today's `MOB_CAP` of 160 and the new tables, the query's maximum falls on the pour. Two windows are worth writing out.

**The Waking.** The pour is one body every 12 ticks, 50 in ten seconds, and the Crowd's rows keep firing under it at a third of their authored rate, which is 12 in ten seconds against the Crowd's own densest 36 (rows of the shape `BACK_HALF_ROWS` already carries, `stage.ts:113-133`). Sixty-two.

**The Undertaker.** The diggers run at an initial one every ninety ticks through chunks two and three, about 7 in ten seconds. Stripped rung bodies are bounded twice over: by the hit clock, since `INVULNERABLE_TICKS` is 24 (`tuning.ts:93`) and no more than 25 hits fit in ten seconds, and by the build, since a full build from the birthright is nineteen rungs. Nineteen plus 7 is 26.

The maximum is 62, so `CORPSE_CAP` is 160 + 62 + 10 = **232**, against today's 200. The Undertaker's window sits well inside it, which is the thing the third and fourth terms exist to prove: the cap cannot bind at the climax, where a refused corpse would be food taken from the player in the one fight that feeds least.

So the cap rises, and it rises for a reason the derivation names rather than because a number felt low. Every input is an initial row and the number moves with them.

The director's budget is the term this derivation is missing, and it is missing on purpose: ADR 0056 says a phase's worst case is its floor plus its budget, and the budget does not exist until step 4. The plan records that as an unowned row with #85 as its trigger, and `peakArrivals` is written so the budget is one more addend when it arrives.

### What binding means afterwards

`claimSlot` refuses the spawn at the cap, exactly as mobs and mob fire already do (`caps.ts:60-69`), and the invariant harness raises a recoverable fault naming the corpse pool. Nothing on the field is removed and no food is ever taken from the player by housekeeping. `corpseEvicted` retires with the path that produced it; the event vocabulary is not on the wire (`wireCodes.ts` carries fault identities, stop reasons, endings, integrity and input device, and no event codes), so retiring it costs no format version.

---

## 9. Magnitudes

Every number in this record is an initial data row, tuned at step 4 by the harness (#98) and the tuning pass (#39). That covers: the six section and phase clocks; the row counts and spacings inside each section, including the Procession's thirteen rows and the eight of them that carry; the sparse row's four shamblers ninety ticks apart; the Crowd's reduced share of one third through the pour; the Procession's live-template ceiling of one and the Vigil's live-body ceiling of four; the Crowd's 1.8 and the Vigil's 0.96 food units a second; the carrier distribution of eight, eleven and six; the Waking's budget of 75, its pour interval of 12 ticks, its health of 2400 and its sweep bounds of 108 to 432; the source's three-times dressing size; the storm's 150 points a second at full uptime and the one-third effective share against a boss; the Banshee's health per chunk of 1100 and the Undertaker's of 1700; every curtain, spiral and ring period, including the four-second curtain and the five-second revolution that one emit is measured against; the chunk-three curtain's two-thirds density; the three music loops and their encoding; the five palette entries; `TREASURE_ALLOWANCE` of 10; and the corpse cap of 232 that falls out of them.

What is not a magnitude, and must not be quietly changed: the Wall's count of 22 against the shambler's half-width of 11 (`mobs.ts:74`), which is a derivation and not tuning; the gap rule tracking grave width; the one-property-per-section rule and the two ceiling rows that gate what the director may add, together with the fact that they gate a spend and never fault an authored spawn; which boundary event ends each section, and in particular the Crowd ending on the eye opening; and the shape of the clock, short opening, longest middle, shorter last.

---

## 10. Claims in the record found false against the code

**1. "A revenant-heavy roster whose kills pay less food" is backwards per kill.**

`game-concept.md:48` and `decisions.md:97` both state the Vigil's scarcity as a revenant-heavy roster "whose kills pay less food". `docs/research/section-feel-consent-and-rung-restore.md` carries the same phrase as "fewer corpses per kill".

Against the code: `mobs.ts:94` gives the revenant `corpsePayout: 2 * TRASH_CORPSE_PAYOUT` against the shambler's `TRASH_CORPSE_PAYOUT` at `mobs.ts:77`. A revenant kill pays double, not less.

The property the sentence wanted is real and reachable, and the honest quantity is food per minute rather than corpses. `mobs.ts:93` gives the revenant 64 health against the shambler's 40 (`mobs.ts:76`), and a revenant-heavy roster arrives in smaller groups, so the growth the section pays per second falls even though the growth per corpse rises. Corpses per second is not the meter either: it would pass while the section fed better, because a revenant corpse pays double. The design record above states it as food per second, and the spec test holds food per second per section rather than payout per kill or corpses per second.

The correction `game-concept.md:48` wants when the record is next touched is one phrase: **the section pays less food per minute**. Not "kills pay less food," which is false against `mobs.ts:94`, and not "fewer corpses," which is true and does not say the thing that matters. It is the kind of summary line that outlives the derivation and gets read as the rule, so the word it needs is the quantity.

**2. Ticket #50's file citations have drifted, and one path is wrong.**

Not this step's ticket, but this step touches the audio path and will read it. #50's comment cites `src/app/sound.ts:86` for the dynamic import and `:81` for its JSDoc; they are at `sound.ts:115` and `sound.ts:102-113`. It cites `src/main.ts:15` for the static side-effect import; it is at `main.ts:30`. It cites `src/boundary.test.ts:73`; the file is `src/__tests__/boundary.test.ts` and the allowlist row is at `:108-114`. The substance of #50 holds exactly as written: four modules import `@pixi/sound` statically (`main.ts:30`, `engine/engine.ts:1`, `engine/audio/AudioPlugin.ts:1`, `engine/audio/audio.ts:2`), so the dynamic import at `sound.ts:115` cannot move the package into a chunk of its own.

**3. The tracer plan's stage is superseded and still reads as current in two places that matter to this step.**

`tracer-plan.md:13` says "the five-minute authored stage" and `tracer-plan.md:46` says "about five minutes in ticks, ten to twelve drops"; `game-concept.md:46` now says eight to ten minutes in three named sections at nine nominal, and power is metered by carriers rather than by drop count. `tracer-plan.md:184` lists dispatch 6 as "the Banshee with the Wall set-piece, the Undertaker, both endings" with no set piece and no third section. And `tracer-plan.md:197-198` puts "the Wall's oversizing" and "the miniboss" at positions 3 and 4 of the cut order, a coupling that no longer works: `game-concept.md:56` makes the Banshee's death the anchor of the Wall clock and her corpse the reservoir slam, so cutting the miniboss now cuts the Wall's gift with it. #86's stale-docs sweep owns these; they are recorded here because the coding agent will read that plan for the boss modules' names.
