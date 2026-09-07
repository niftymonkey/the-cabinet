# The mid-stage set piece and the Undertaker's third chunk

Research for Hungry Grave. Labels: **DOCUMENTED** = a developer statement, shipped data, a script file, or decompiled code. **COMMUNITY-MEASURED** = wiki transcriptions of shipped behaviour, chapter markers on 1CC runs, forum reports by known players. **INFERRED** = my reading across sources.

Two questions, from the eight-to-ten minute stage in three sections. What shipped mid-stage set pieces, not bosses, punctuate a long stage while the player stays the aggressor, and what the swarm set piece near 5:00 should be. And what third pattern chunk fits the Undertaker inside his grammar of falling curtains and slow spirals.

Sits beside [stage-length-with-a-director.md](stage-length-with-a-director.md) (sections 4 and 5), [shmup-stage-design.md](shmup-stage-design.md) (midboss and boss sections) and [director-precedent.md](director-precedent.md) (the crescendo and finale scripts); their findings are cited, never repeated. Three project rules constrain every option: a set piece names the property it must keep and never the cast (ADR 0042), templates are placements and never casts (ADR 0016), and the Banshee owns expanding rings while the Undertaker owns falling curtains and slow spirals, exclusively (`docs/design/game-concept.md`).

---

## What is solid

1. **The industry standard mid-stage set piece is the ordinary spawn system run flat out, not a second system layered on a running one, and its length is a condition rather than a timer.** No shipped constant here gives one a duration in seconds. It suppresses bosses, not trash. DOCUMENTED.
2. **Survivors-likes announce a swarm with nothing; the arcade announces with music and scenery, never a banner.** COMMUNITY-MEASURED.
3. **Most set pieces get the field to themselves; Left 4 Dead's does not**, and it is the counter-case precisely because its set piece *is* the ordinary population turned up. That is what arriving into trash with no drain-out has to mean here.
4. **In every shipped survivors-like the swarm does not pay; a named single elite does.** This is the finding that does not transfer: mobs here are food by rule (ADR 0037), so a bigger swarm pays more by construction.
5. **Two shipped swarm shapes exist, the sweep and the closing ring**, and Vampire Survivors' 23 map events are all one or the other. Only the sweep leaves a corpse trail a hole can follow. COMMUNITY-MEASURED, INFERRED for the reading.
6. **A shipped set piece's size is usually a readout of something the player just did, shown as countable bodies**, in Garegga, Ikaruga and Crimzon Clover; and a big enemy's death spawning the swarm is a shipped idiom, used repeatedly in Ikaruga. That second one is the Banshee-then-Wall arrangement, already shipped several times. COMMUNITY-MEASURED.
7. **A boss's last chunk is a layering of what came before, not usually a new shape**, in Remilia, Ballos and Ran. The genre's most common finale device, a timeout survival card, is ruled out here by ADR 0007. COMMUNITY-MEASURED.
8. **Density alone is the weakest escalation, and ZUN says so directly.** "People often mistakenly think danmaku gets harder if you just add more bullets or make them faster, but in most danmaku the difficulty is designed with a great deal of thought. The harder it gets, the more it is designed to be learnable as a pattern." And: "Ideally, at the instant a player is hit, anyone can understand the solution." DOCUMENTED, <https://www.4gamer.net/specials/shanghai_alice/zone_t.shtml>, verified against the raw page rather than through a summariser.

---

## 1. Shipped mid-stage set pieces that are not bosses

**Left 4 Dead's crescendo event** (DOCUMENTED, shipped scripts and developer commentary). Valve splits them by avoidability: "unavoidable events are called Crescendo Events, and the avoidable ones like car alarms and metal detectors are Panic Events" (<https://left4deadwiki.com/wiki/Developer_Commentary_(Left_4_Dead)>). The entity splits differently: `PanicEvent` is the classic hold-out, `BeginScript`/`EndScript` runs a director VScript and builds every gauntlet, and `ScriptedPanicEvent` runs "a staged event similar to a finale" mid-level (<https://developer.valvesoftware.com/wiki/L4D2_Director_Scripts>).

What arrives is a budget metered by the player's clear rate. `c1_mall_crescendo.nut` sets `MobMinSize = MobMaxSize = 120` with `MobMaxPending = 90` and a mob interval of 1 second; against the default `CommonLimit` of 30 alive that is a 120-body budget released 30 at a time as the player kills. The quiet half of the loop is crushed rather than the loud half added to: the relax interval falls from 30 to 45 seconds down to between 1 and 5, `RelaxMaxFlowTravel` from 3000 to 600 or to 0, and `IntensityRelaxThreshold` rises from 0.9 to 0.95 or 1.0. `ProhibitBosses = true` is in essentially every such script, commented "This turns off tanks and witches", while special-infected respawn drops from 45 seconds to 1.0. The shipped arc is three director states: `director_quiet.nut` (`CommonLimit = 0`) before, the crescendo during, `c1_mall_crescendo_cooldown.nut` after, so the decompression is authored as explicitly as the peak. <https://github.com/Stabbath/L4D2-Decompiled/tree/master/Decompiled%20VScripts>

It is announced on four channels at once: a `func_button` the player presses, so the player picks the moment; a Game Instructor hint fired when first seen at range 75 and killed on press; `Director.PlayMegaMobWarningSounds()`, annotated "Plays the incoming mob sound effect"; and music keyed to population rather than to the event (`MusicDynamicMobSpawnSize` 25 starts the horde track, 8 stops it). Its end is a condition, not a timer: a spent budget, the battlefield nav boundary, or map logic firing `EndScript`. <https://developer.valvesoftware.com/wiki/L4D_Level_Design/Panic_Events>

It pays passage and a setup phase, nothing material. Miles Estes names the real payout: "What playtesters liked most about the finale was that it was the one time they were able to stop, catch a breath, make plans and set up traps for the Infected." Dario Casali on why they exist: playtesters "found the experience of going through a campaign fairly flat, with not enough peak moments."

**Vampire Survivors and the survivors-likes** (DOCUMENTED, shipped tables transcribed at <https://vampire.survivors.wiki>). Two entry shapes cover all 23 events: line sweeps crossing the map and ignoring the player (Bat Swarm, Ghost Swarm, Skull Swarm, Minotaur Rush) and closing rings centred on the player (Flower Wall, Jellyfish Wall, Medusa Wall, Pile Assault). Bat Swarm is 50 mobs in a line that push other mobs along their path; Inlaid Library's 20:05 Skull Swarm doubles on a ten-second cadence, 1, 2, 4, 8, 16, 32, 32 across 55 seconds. Events land five seconds off the minute, separated from the boss and chest on :00. The field is thinned for the ring events, not filled: Mad Forest's enemy minimum runs 15, 30, 50, 40, 30 and drops to 10 on both guaranteed Flower Wall minutes.

The one shipped heaven moment with a scored payout is Gold Finger, described by its developers as "destroy a lot of enemies fast and win prizes": 14 seconds of invulnerability, enemy spawn count forced to 500, cooldown at -100%, five payout tiers on kills scaled by player level (Bronze at 0 + level up to Cosmic at 2500 + level x5). Elsewhere the payout hangs off one named elite. Halls of Torment's Champions run on a formula (150 seconds base, minus 9 per Agony rank, times 0.95 per Torment rank) and pay a guaranteed 150 gold floor plus a Red Chest at 20% rising to a 50% cap. Brotato's Horde wave pays 35% *fewer* materials per kill and reserves the guaranteed crate for Elite waves, telegraphed only in the shop screen between waves. Deep Rock Galactic: Survivor marks its swarm on the always-visible progress bar, and the base game splits its music by "During announced Swarms" against "During progress / time based Swarms".

**Arcade swarm set pieces** (COMMUNITY-MEASURED, wiki transcriptions of shipped behaviour). Galaga's Challenging Stage is the purest heaven moment the arcade shipped: every fourth stage from the third, forty enemies in five convoys of eight that "fly in a preset formation without firing at the player" (<https://en.wikipedia.org/wiki/Galaga>), named on screen with the words CHALLENGING STAGE, 100 points each or 10,000 for all forty. What rules it out here is that it is a separate stage, a full break in the run.

Ikaruga chapter 3 is the closest shipped analogue to the moment being designed. Its formations are built in threes because a chain is three same-coloured kills, and its Misosazai ram and never fire. After the midboss dies comes the bunretsu section: "speedkilling Shigi is essential in order to have more time available to chain as many Utatsugumi as possible in the following section". The player buys the length of the payout with their own speed, the screen is given over to it, and a safe wall-hug exists so it can be declined. Chapter 3 carries the game's highest max chain, 305 on Prototype Normal. <https://shmups.wiki/library/Ikaruga>

Battle Garegga's stages are chains of named formations paying items, and one is called The Wall: seven turrets, one central plus three per side, where the wiki's survival advice is the interesting part, "think of the spread shots as defining 'lanes' that you can safely (if briefly) fly in", with the fight easing as turrets die. Its stage 4 dock releases seven to eight medals per rail in one of three randomised orders the player reads off how the rail explodes, and trash keeps coming: it is done "while being harassed by the first form of the Stage 4 boss". <https://shmups.wiki/library/Battle_Garegga/Stages>

Gradius ships both a killable and an unkillable spawner. The Moai are background statuary that fire ion rings and die only to a shot in the mouth; Gradius III adds Rolling Moai, indestructible, that "shoot normal Moai out of their mouths". <https://gradius.fandom.com/wiki/Moai>. Pawarumi does the same in a modern game: "giant stone doors open and hundreds of fighters swarm out and surround you" (<https://shmups.system11.org/viewtopic.php?f=1&t=65857>). Einhänder instead gates its set pieces on a kill count and pays a weapon ("Destroy all of the falling KH-16 Floh enemies... If successful, a Flash will appear"), announced by an icon lighting on completion rather than on approach. <https://einhander.fandom.com/wiki/S._Bonuses>

The caution the experts state themselves, from the thread on spectacle: "how do you make a shoot em up full of 'wow' moments that doesn't also introduce dead air?... on a tenth or hundredth replay, you'd rather not be annoyed that that moment exists in the first place." That is the risk profile of one stage played hundreds of times.

---

## 2. Three options for the set piece near 5:00

All INFERRED. Each names the property it would keep, in ADR 0042's shape, because that is what makes it verifiable rather than a mood.

### Option A: the Second Wall, a full-width curtain in the Wall's own family

**The moment of play.** Around 5:00 the trash thickens without a break and the whole width arrives at once, unmistakably the Wall's shape, with one authored difference the player can name: it comes in two ranks a beat apart, so the lane carved through the first is not the lane through the second.

**Named games.** Vampire Survivors' Flower Wall at 5:00, 10:00, 15:00 and 25:10, escalating by duration and repeat count, and Bat Swarm's repeats climbing 1, 2, 5, 20; Left 4 Dead 2's finales stacking PANIC on PANIC, and Matt Scott's breakable walls; Garegga's stage 6 Wall, whose gaps are authored to read as lanes; Hayashida's four-step, where the third beat is the twist, "something crazy happens that makes you think about it in a way you weren't expecting" (<https://www.gamedeveloper.com/design/the-structure-of-fun-learning-from-i-super-mario-3d-land-i-s-director>).

**Property to keep.** The Wall's own, unchanged: crossable without a full reservoir and never crossable for free, verified by the same two bot policies.

**Buys and costs.** Nothing new to author, and a property already written and carried by tests, plus instant recognition that turns the Wall from a one-off into the stage's motif. Against that, the concept document says the back half "climbs back toward the Wall's figure without reaching it, so the feast stays the run's outlier", and a second Wall at 5:00 either breaks that or is a visibly smaller Wall, which reads as filler. Worse, the Wall's property depends on the belch, and at 5:00 nothing guarantees a full reservoir the way the Banshee's corpse does at 2:00. Without that gift it is a survival wall, the opposite of a heaven moment; with its own gift it duplicates the Banshee's job.

### Option B: the feeding frenzy, a bounded flood scored by what you swallowed

**The moment of play.** The trash rate climbs past anything the stage has shown, from every direction, for a bounded window. Nothing about it is new to read. The payout is the corpse field it leaves, and a tier is announced at the end for how much went in the hole.

**Named games.** Gold Finger and Gold Fever; Galaga's Challenging Stage; `c1_mall_crescendo` releasing a 120-body budget at the rate the player clears it; Einhänder's count-gated bonuses.

**Property to keep.** The window pays more to a grave that dives into it than to one that waits at the bottom edge, and the difference is visible in the tier at the end.

**Buys and costs.** It is the heaven moment by construction, needs no new art or mob, and the tier gives the moment a score a player chases across runs. But Gold Finger buys its heaven with 14 seconds of invulnerability, which this game cannot grant without breaking the bet that danger and opportunity sit in the same place, and without it a flood is the Wall again with a scoreboard. The corpse arithmetic is against it too: a simultaneous flood leaves more corpses than one grave can pass under inside the freshness meter, so most of the payout rots on screen, which is the failure the Wall avoids only because the belch clears it in one stroke.

### Option C: the waking, a mouth in the ground that pours the swarm out

**The moment of play.** For most of the middle section something has been visible in the background, dormant: an eye, or a mouth in the earth, from the tileset. Around 5:00 it opens, and trash pours out of that one point in a continuous stream instead of arriving from the top edge. The source drags across the field as it pours, so the corpse trail it lays is a curve, and swimming up that curve is the whole moment. It emits no mob fire of its own, ever, and it shuts when its budget is spent.

**Named games.** Gradius' Rolling Moai, an indestructible spawner that shoots enemies out of its mouth, inside a stage whose set piece is scenery waking up and which announces itself with its own music track; Pawarumi's stone doors disgorging hundreds of fighters; Ikaruga's idiom of a big enemy's death spawning the bonus swarm; Left 4 Dead's crescendo, a place on the map with a visible marker; Vampire Survivors' sweep family.

**Property to keep.** Two-sided, and both halves are the game's central bet. A grave that commits to the trail swallows the bulk of it before freshness runs out; one that stays low and lets the scroll deliver gets scraps. Neither policy dies, and the difference between them is corpses, not hits.

**Buys and costs.** It announces itself diegetically and for a long time, which is the Left 4 Dead pattern and the Gradius pattern and not the survivors-like silence, and it does so with no HUD and nothing new to read at density. It gives the middle section its own identity. It is a sweep and not a ring, so the corpses arrive in a following order the grave can physically eat. And it uses the art that exists. Against that, it is a new thing on the field rather than a row: a spawn source with a position, an open state and a budget. If it is shootable it edges toward a miniboss and the section stops being what it is. It also needs a rule for the grave parking under the mouth, and one for the trail when the source nears a field edge.

### Recommendation

**Option C, the waking. INFERRED.**

Four things point there. The corpse arithmetic decides it first: the two shipped swarm shapes are the sweep and the closing ring, and a hole that must pass under its food can only be paid by the sweep, so the verb settles the shape. The announcement is solved by the art rather than by a HUD, the only route here that is neither a warning banner nor pure memorisation. It gives the middle section the identity the stage-length record says the extra minutes have to buy. And it keeps the Wall the run's outlier, which Option A directly threatens.

**The shootable question has a shipped answer.** Gradius ships both: ordinary Moai die to a shot in the mouth, Rolling Moai cannot be killed at all. The version that fits is the first. The mouth is shootable, but killing it ends the set piece early rather than starting a fight: no health bar, no chunks, no pattern, no drain-out. The storm shortens the moment instead of skipping it, which keeps the storm-always-matters bet intact and makes greed the right play in both directions, since killing the mouth fast trades corpses for safety.

**One refinement, with its own caution.** Since a shipped set piece's size is usually a readout of what the player just did, the analogue here is the mouth pouring longer the faster its first bodies are cleared, which is Ikaruga's bunretsu and Crimzon Clover's caravan. It must read the moment and not the run: ADR 0047 keys the director to pressure rather than power precisely to avoid Garegga's suicide loop, and a readout keyed to grave size or weapon level would be that anti-pattern wearing a set piece's clothes.

**Two things to decide alongside it.** Left 4 Dead is the only shipped case that keeps trash flowing through a set piece, and it does so by turning the ordinary system up rather than layering a second one on a running one, which is what arriving into trash with no drain-out has to mean here. And Valve authored a cooldown script after every crescendo, while nothing in the plan says what follows the set piece before the last section climbs.

---

## 3. The escalation moves, and which stay inside the Undertaker's grammar

INFERRED as a taxonomy, COMMUNITY-MEASURED per case. Touhou entries are from <https://en.touhouwiki.net>, which carries per-card pattern text for three games only.

| Move | Shipped case | Inside the grammar? |
|---|---|---|
| Raise density of the same pattern | Rank in EoSD multiplies boss bullet counts up to 4x (sibling) | Yes, but capped twice |
| Add a second emitter of the same kind | Kogasa's "Umbrella Cyclone" is 2 simultaneous spirals on Hard and "3 simultaneous spirals per wave" on Lunatic; Yamame's "Unexplained Fever" adds "two smaller spirals... behaving the same as the central one"; the Banshee's own chunk two | Yes, and already spent by the Banshee |
| Move the anchor while it emits | Yuugi's "Wind Blowing Down from Mt. Ooe": the falling rain starts at the top left corner, and before it stops "another rain source appears at the top right corner, as they go alternating between left and right" | Yes, and it is a falling curtain specifically |
| Invert the gap or reverse the rotation | Ran's "Ultimate Buddhist": a blue manji "that spins left", then "a bigger, faster red manji that spins right"; Koishi's paired cards flow outward then inward | Yes |
| Run two earlier patterns at once | Yuyuko's "Death of One's Home" alternates two waves, and its Hard version fires "both waves of arrowhead bullets at the same time at a much lesser density"; Orin's "Vengeful Cannibal Spirit" on Lunatic shortens the cycle "making the waves overlap"; Remilia's final card cycles four of the fight's motifs; Ballos's final form layers three earlier threats | Yes, and it adds no new shape at all |
| Accumulate emitters, then pile them up on a clock | Ran's final card adds a spiral emitter at each health threshold, six in all, and at 30 seconds left "will immediately start shooting all the spirals at a faster speed than usual" | Yes |
| Trade one axis for another per phase | Koishi's "Subterranean Rose": each phase gives back one of firing rate, spin speed or bullets per circle to push another | Yes |
| Raise speed on the same shape | Giest118: "the boss gets more aggressive, occasionally tossing in a wave of faster bullets" | Yes |
| A new capability the earlier phases taught | Ikaruga's Tageri third form switches polarity after two forms that taught it | No such capability exists here |
| A timeout survival card | Flandre's final card; Touhou's Last Words | **Ruled out by ADR 0007** |

**Three constraints narrow this hard.** Density is capped twice: by ZUN's statement above, and by the danmaku design literature, which defines a wall as "any Group or formation of bullets where a player cannot move through the constituent bullets", reached purely by raising density (<https://sparen.github.io/ph3tutorials/ddsga3.html>, <https://sparen.github.io/ph3tutorials/ddsga4.html>); the Undertaker's clods are ruled never a wall and his gap always fits, so the curtain cannot be escalated into the genre's own definition of hard. The second emitter is already the Banshee's move, so spending it again would make the game's two bosses structurally the same fight in different costumes. And overlapping has a shipped price: Yuyuko's harder version pays for firing both waves together by dropping density "to a much lesser" level, so overlap is a trade rather than free difficulty.

---

## 4. Three options for the third chunk

All INFERRED.

**Option A: the tightened burial**, chunk one with density and speed turned up, the gap still fitting but the run to it longer. Named games: rank in EoSD doing this to a boss's own patterns; Giest118's "wave of faster bullets" near the end. It costs nothing to author and carries no legibility risk, but it is the escalation ZUN names as the common mistake, it is capped by the gap rule and the never-a-wall rule, and it alone punishes a large grave, since the gap is grave width plus a margin. A player who ate well is handed the worst version of the fight.

**Option B: the second shovel**, a mirrored arm opposite the first so the two spirals interleave and the safe wedges stop lining up. Named games: Kogasa's "Umbrella Cyclone" at 2 and then 3 simultaneous spirals; Yamame's twin corner spirals; the Banshee's chunk two. It is the cleanest escalation to read and a well-shipped move with a difficulty ladder proven on it. But it is the Banshee's move verbatim, one boss later: the grammar rule keeps the shapes apart and says nothing about structure, and a player who fought her will feel the repeat even if they cannot name it.

**Option C: the locked overlap.** Both earlier chunks run together: clod curtains fall while the shovel spirals, and the curtain's gap sits where the shovel arm just swept. The safe place is the place the arm has already been. Diggers keep coming. No new shape is introduced, and the twist is a relationship rather than an addition. Named games: Yuyuko's "-Trackless Path-", which fires two previously alternating waves together and pays for it with density; Orin's Lunatic cycle compression "making the waves overlap"; Remilia's final card cycling the fight's earlier motifs; Ballos's final form layering three earlier threats; Carotenuto's rule, in the sibling record, that a boss "should feel like a summary of everything you learned up to that point"; Hayashida's four-step twist.

It buys a strict superset of what the player already learned, needing no new teaching, and it stays inside the grammar by construction since both halves are already his. It keeps the diggers, so food keeps arriving at the climax, which the vision document requires of every boss. And it argues the game's central bet in the final pattern of the game: the safe ground is the ground the danger just left, which is the same sentence as steering into where the threat was in order to swallow. It costs the most to tune, because two clocks have to stay in phase, and its legibility must be proven rather than assumed: the player has to see that the gap follows the arm, or it reads as a random gap in a busier screen and the twist is wasted. ZUN's bar is the right one to hold it to, that at the instant a player is hit the solution should be understandable.

### Recommendation

**Option C, the locked overlap, placed last. INFERRED.**

It is the move the record shows final phases actually make: a layering of what came before rather than a new shape, in Remilia, in Ballos, in Ran's six-emitter pile-up, and most exactly in Yuyuko's harder version, which is this option with the shipped trade already attached. It is the only one of the three that neither spends a move the Banshee already owns nor leans on the density axis that ZUN and this game's own gap rule both cap. And it is the only one that says something: the last pattern of the last boss teaches the same lesson as the first corpse of the run.

**Take Yuyuko's trade with it.** The overlap should arrive with the clod curtain thinner than in chunk one, not denser: the shipped precedent buys simultaneity by cutting density, and doing the same here also protects the never-a-wall rule and ADR 0003's gap.

**Last, not middle, and the reason is food.** The vision document asks that a boss keep shedding food so the dive is still the answer at the climax, and chunk two is the one that summons diggers. A third chunk placed last that dropped them would end the game on its only foodless stretch. Keeping them running through the overlap makes the final chunk both the busiest pattern and the richest feeding of the fight, which is the shape the game has been arguing for throughout.

**One thing to watch, named now.** The belch cancels every mob-fire shot on the field and the pattern resumes emitting immediately (ADR 0008), so against two overlapped emitters that resume together it may buy noticeably less breathing room than against one. That is the boss-fight belch taming already on the map, and it wants a number from the belch-in-boss instrument rather than a guess.

---

## Open items

- **No duration in seconds exists for any mid-stage set piece in any game here.** Every crescendo, panic event and gauntlet ends on a condition; the arcade records duration structurally or not at all. Searched the decompiled VScripts, the Valve Developer Community pages, the convar dumps and shmups.wiki.
- **Mike Booth's GDC 2009 deck never mentions crescendo or panic events**, zero hits for either word, so it is citable for the pacing loop a crescendo interrupts and never for the crescendo. No Valve Developer Community page titled "Crescendo Event" exists either, and that site serves an anti-bot interstitial, so its quotes came through Wayback.
- **No Vampire Survivors source states whether a map event has an audio or visual cue**, and none is documented for a Halls of Torment Champion's arrival in either direction. Both no-telegraph readings are absence arguments rather than citations.
- **No named DoDonPachi popcorn-wall set piece exists**; shmups.wiki has no DoDonPachi stage page, and its chain system punishes flattening a wave ("taking out enemies as soon as they enter the screen isn't the best approach"), so the premise does not hold there. No Battle Garegga "bomber formation" is documented under that name either.
- **Counts and geometry are thin where it matters most.** The Ikaruga wiki gives no counts, duration or scoring figure for the bunretsu section; Einhänder's gives kill counts but no formation geometry. Touhou per-card pattern text covers only three games, so Imperishable Night onward could not be evaluated, and the danmaku taxonomy's guides on spirals and on pattern variation are listed but unpublished (<https://sparen.github.io/ph3tutorials/danmakudesign.html>).
- **No developer states a rule for how a boss's last pattern should relate to its earlier ones.** ZUN has statements on escalation philosophy and legibility, quoted above, but none on card ordering; Giest118's guide prescribes no phase count and no phase relationship, only that attacks be "clearly and obviously different". The layering finding is read off shipped fights.
- **Nothing was found on a set piece in a game where the enemies are the player's resource.** Every shipped set piece here either pays a separate reward for surviving it or taxes the kills inside it, which is why the survivors-like payout findings do not transfer.
- **An anomaly worth acting on outside this record.** While chasing ZUN quotes, the page-summarising fetch tool returned fabricated quotations for both 4gamer Shooting Methodology pages, including an invented Japanese sentence and two invented claims about spell card ordering. None of those strings exist on the pages. Every ZUN quote here was re-verified against the raw page bytes. Sibling records citing 4gamer ZUN quotes obtained the same way should be re-checked.

---

## Confidence notes

- The Left 4 Dead script parameters come from a decompiled repository, not a Valve source release; the values match the Valve Developer Community documentation of the same keys. The Vampire Survivors stage tables are transcribed field for field from shipped data by the community wiki: DOCUMENTED for the numbers, COMMUNITY-MEASURED for the framing.
- Galaga's convoy structure and perfect bonus come from walkthroughs and a fan wiki, not from Namco; only the frequency and the no-return-fire property have an encyclopedic source. Garegga's item counts and its four-to-six Black Hearts are community observation, not disassembly.
- Touhou and Cave Story pattern descriptions are wiki transcriptions of shipped behaviour, reliable for what happens and not for why, and several are difficulty-specific.
