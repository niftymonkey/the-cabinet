# The Hungry Grave

A Halloween vertical shmup crossed with hole.io. The player is a moving open grave ascending a scrolling world, swallowing what it kills to fuel an ever-thickening storm of its own projectiles, with deliberate doses of bullet hell from bosses.

This file is the vocabulary. The traps this codebase has actually shipped are in `docs/lessons.md` beside it.

## Language

The system layer uses the words the genre's designers and players already use, and a flavor word survives only at the surface the player touches: the fiction owns the noun the player hears, and the machinery owns the noun every developer already knows. Hades is the precedent, where the player is offered Boons from the gods and the code that resolves them calls them Traits. A term the genre has no settled word for stays as it is.

### The grave

**Grave**: The protagonist: a moving open grave, a hole in the ground shaped like a grave, taller than wide. It swallows and passes under; it never drives. _Avoid_: player character, hole, ship, hero.

**Swallow**: The one verb of collection: the grave passes under a corpse or power-up, and when most of it is over the mouth it tips at the rim and falls in. Every payout of collection arrives through a swallow, at the tip: growth, the reservoir's charge, the level a power-up's offer gives and the score an overflow or a rich meal at full power pays. A kill pays score at the kill instead, which is what keeps the two currencies clean. _Avoid_: eat, collect, pick up, consume, drive over.

**Pull**: The grave's tug on food close to its rim. It moves food only, never a living mob. Territory's hands have their own pull, which belongs to that line. _Avoid_: suck, vacuum, magnet.

**Tip**: The moment food goes over the rim, turning about the point of the rim it crosses. The payout of the swallow lands here. _Avoid_: topple (that word is the Undertaker's ending).

**Fall**: What follows the tip: the food drops into the dark, shrinks, darkens, and never lands. The grave has no bottom. _Avoid_: poof, vanish, sink.

**Swell**: The grave taking in the growth a swallow paid it, over the ticks after the tip, so that no swallow ever pops. The payout still lands whole at the tip and the grave is owed it at once; the size is the part that takes time. _Avoid_: grow instantly, jump, inflate, lerp.

**Dive**: The move that swallows: steering the grave under what it wants until the thing falls in. It is ordinary steering rather than a move of its own, so every payout is bought with position: growth, weapon levels and the belch's charge alike, and the way back from a rung the floor ladder took is the same verb as the way up. _Avoid_: dash, lunge, plunge, dip, special move.

**Size**: The grave's one scalar, its half-height; width follows at a fixed aspect. Size is health: swallowing grows it, hits shrink it. _Avoid_: health, HP, radius, scale.

**Size floor**: The hard minimum size, so the recovery path never physically closes. Size never gates a swallow: whatever the grave passes under goes in. At the floor, hits bleed score, then weapon levels down to the birthright loadout, and only when nothing is left to bleed does the next hit seal the grave shut. _Avoid_: minimum health, death's door.

**Size ceiling**: The hard maximum size, the grave standing about a quarter of the field's width tall. Growth past it converts to score, so a big meal at full size is never worthless. _Avoid_: max level, size cap.

**Sealed shut**: Death: shrunk to nothing, filled in, and closed. The grave is never destroyed or killed; it is sealed. _Avoid_: dead, killed, game over, destroyed.

**Score**: The run's worth in one number, fed by several inputs and never by kills alone: a kill pays it and growth past the size ceiling converts into it, so the storm and the swallow both feed it, and what else feeds it is open (ADR 0002 as amended, ADR 0003, #135). It is also what the floor ladder spends first, a hit at the size floor bleeding a capped slice of it before any weapon level goes, and the HUD carries it beside the rungs. _Avoid_: points, XP, experience, currency.

**Amended 2026-09-16, on Mark's own ruling, "Cap the bleed":** a hit at the size floor takes a bounded slice of the score and the rest stays. What stood: everything else in the entry, that the score is the run's worth in one number, that a kill pays it and growth past the ceiling converts into it, that the ladder spends it before any weapon level goes, and that the HUD carries it beside the rungs. What changed: what a hit costs, a bounded number of kills rather than every point the run has made, so a run that takes a late hit is still judged on how it was played. What the entry could not have known: it was written on the day a kill first paid, before anything had measured what a whole bleed takes, and the first measurement of it was most of the run.

**Focus**: Hold-to-slow precise movement, keyboard only. On touch, drag precision is the fine control and focus is nothing. _Avoid_: slow mode, precision mode, walk.

### The food

**Corpse**: What a kill leaves behind, scrolling down the field. Fuel, common, and always decaying. _Avoid_: body, gem, pickup, loot.

**Amended 2026-09-16, taking the separate-clocks lever the round two record holds at ruling R10:** a corpse left by a body that was in mid-flight carries the rest of that flight before it settles into the scroll, so for the length of one push it travels rather than only drifting. What stood: everything else in the entry, that a corpse is what a kill leaves, that it is fuel, that it is common, and that it is always decaying at the scroll's own rate. What changed: the drift is no longer the only thing that moves one, for the length of one shove and no longer; a thrown corpse lands further from the grave and has spent part of its freshness getting there, which is a real cost and is measured. What the entry could not have known: nothing pushed a body over several ticks when it was written, so a body killed mid-push and its corpse were the same place.

**Corpse tier**: Which mob a corpse came off, read as a hue. Corpses hold one size across mob types, so a tier is the only thing that shows a payout, and every tier shares one brightness because brightness is freshness. _Avoid_: rarity, grade, quality.

**Freshness**: A corpse's one meter, running from kill to gone in seconds derived from scroll speed. It scales every payout down to a floor, and at empty the dirt takes the corpse under. _Avoid_: decay, timer, expiry, TTL.

**Power-up**: A permanent upgrade a carrier leaves where it died. It spawns as an offer, and the grave gets the option it passes under. Power-ups never decay. _Avoid_: drop, item, upgrade item, pickup, loot.

**Carrier**: A mob authored to carry a power-up. Killing one is the only way power arrives, the director never places one, and the schedule holds more of them than a full build needs, so a missed carrier costs a step and not the run. _Avoid_: item enemy, power-up mob, drop mob.

**Offer**: What a power-up spawns: three option bodies falling side by side and apart, and the grave gets exactly the one it passes under while the others vanish. Options draw from unowned lines and level-ups of owned, un-maxed lines; a maxed line is never offered. One offer is live at a time, and a power-up paid while one stands banks toward the next. _Avoid_: menu, loot table, choice wheel, spinner.

**Feast**: A boss-shed reward corpse that never decays, dropped at phase breaks and at a miniboss death; the death feast is the largest single swallow in the game, a swell the player watches the grave take in, and it fills the reservoir whole on the tip. _Avoid_: bonus, health pack, jackpot, jump.

**Treasure**: The never-decaying class of food: power-ups and feasts. Steady-bright beside fading corpses, so steady-bright always means treasure. _Avoid_: rare drop, special item.

**Overflow**: The payout when a swallow cannot pay its normal way: growth past the size ceiling converts to score. ADR 0002's other branch, a maxed weapon line's power-up, is dormant under ADR 0034, which never offers a maxed line; a carrier's body with no option left to give is swallowed like any other food and pays growth, reservoir charge and overflow. Nothing swallowed is ever worthless. _Avoid_: waste, surplus, refund.

### The arsenal

**Weapon line**: One of the upgradable weapon systems, leveled one to five by power-ups. A weapon line owns its own properties: how it fires, whether the run starts with it, and how its levels grow. v1 ships four, the skull stream, Territory, the wisps and the bell, and the pool is open by design. Admission is generative rather than restrictive: a new line claims a motion no existing line owns, because the motions must never blur, and it answers the two standing constraints every line answers, the mob-fire value band (ADR 0014) and the homing cap, at most one line homing at a time and never a homing line that is always-on. The cap is empty while the wisps are the only homing line, and a second homing line entering the pool is the trigger to rule how the dice offer one to a player who already owns the other. Each level must look different on screen. Short form "line" is fine once the term is established in a passage. _Avoid_: gun, upgrade track, skill.

**Firing trigger**: How a weapon line fires: always-on, on each swallow, or on its own timer. A property each line owns, never a category of lines. _Avoid_: floor line, burst line, passive weapon, active weapon, proc.

**Birthright**: The weapon line a run starts with, the skull stream at level 1. Damage at the size floor strips levels back to it. _Avoid_: starting loadout, base weapons.

**Skull stream**: Skulls pouring straight up out of the grave's mouth, in distinct parallel streams from mounts across its width, surging after each swallow. It never homes. Renamed from the soul stream 2026-08-31; the old name is unclaimed, not banned, and the code and tape identifier follow the rename. _Avoid_: main gun, vulcan, primary fire.

**Territory**: Ground the grave claims ahead of itself: on its own clock the line tears the earth open over the densest knot of mobs ahead of the grave, and after a short opening beat grasping hands pull, slow and pulse damage into any mob whose body is over them. Levels buy area and control strength, the pull, the slow and the pace of the dwell pulses, so capability reads as bigger ground that is harder to leave. Its job is reclaiming space when overwhelmed, never a big damage number, and the tearing and the hands are expression, not identity (ADR 0044). _Avoid_: zone, aura, trap, minefield, area denial.

**Wisps**: Will-o-wisps, fired on each swallow: each swallowed corpse's soul tears loose and hunts. A rotten corpse tears loose fewer souls and never fewer than one. At most one weapon line homes at a time, and a homing line is never always-on, so homing is always bought with a dive. _Avoid_: missiles, seekers, homing shots.

**Bell**: The funeral toll on its own clock: an always-on pulse that throws expanding cones, one forward at level one and more at each level, wrapping toward the sides as they multiply until the top of the line has the surround back at field scale. Its job is repel, pushing mobs off the space the grave wants; bosses take its damage but never its push. _Avoid_: shockwave, nova, AOE, ring.

**Swallow chime**: The baseline sound and juice of every swallow, firing from the very first swallow regardless of loadout, so the early minutes are never silent. _Avoid_: eat-chime, pickup sound.

**Belch**: The one button. It vomits the full reservoir in two scopes at once, the gas and the burst. It fires only at a full reservoir. _Avoid_: bomb, ult, special, screen clear.

**Gas**: The belch's field-wide half: it smothers every mob-fire shot on the field, boss patterns included, and kills nothing. _Avoid_: smoke, cloud, bullet clear.

**Burst**: The belch's local half: the eruption that throws the bodies within a radius of the grave away from it, in three shoves a player can count, and takes health off nothing at all. A boss stands where it is; a set piece's source takes a fraction of the push a mob takes (ADR 0008 as re-ruled 2026-09-15). _Avoid_: explosion, nova, wipe.

**Amended 2026-09-16, on Mark's read of the deployed build:** each of the three shoves throws what stands inside the radius at its own tick rather than what stood there when the button was pressed. What stood: everything else in the entry, that the burst is the belch's local half, that it is three shoves a player can count, that it takes health off nothing at all, and that a boss stands where it is. What changed: a body that walks into the circle between shoves is thrown by the shoves that are left, and a body the press has already thrown keeps what it was given rather than being thrown again. What the entry could not have known: that the crowd walks back into the circle inside the ninety ticks a press lasts, so a burst that read the field once promised three throws and delivered one.

**Reservoir**: The capped belch charge, filled by swallows. Charge past full visibly splashes and wastes, so belching is the greedy play. _Avoid_: meter, gauge, mana, energy.

**Cancel scatter**: The read a cancelled shot leaves behind: a short burst of spokes at the shot's own position, so a shot that stops existing is seen to be cancelled rather than silently gone. One vocabulary for every cancellation, whether the grave's mouth ate the shot or the belch wiped the field. It must never read as a swallow, because the swallow is the one verb of collection. _Avoid_: puff, pop, particle burst, explosion.

**Storm**: The player's own airborne projectiles at saturation, the bullet heaven the player builds. Mob fire is never the storm. _Avoid_: bullet spam, DPS, firepower.

**Surge**: The skull stream's answer to a swallow: a number of extra volleys at a shortened interval, never a damage bonus and never a time window. A rotten corpse buys a shorter surge and never a thinner one, because column count is what draws the line's levels. One swallow buys one surge, and a swallow during a running one lengthens it toward a cap rather than starting a second beside it or banking a queue (ADR 0058 as amended). _Avoid_: buff, haste, frenzy.

**Toll**: One firing of the bell, on its own clock and never bought by a swallow. _Avoid_: pulse, tick, cast.

**Cone**: One expanding cone a toll throws, pushing what its leading edge crosses and damaging the nearer part of what it crosses, at every level and harder as the level rises (`bell.ts`, `BELL_CONE_ROWS`). Its angles, its reach, the shorter reach its damage falls off over and its push are tuning table rows. It is drawn at the reach it pushes to, so nothing is shoved by something the player cannot see. The Banshee's tear-rings are mob fire and are never a cone. _Avoid_: arc, ring, shockwave, wave, AOE.

**Patch**: One piece of claimed ground, torn open by one lay. It belongs to the world rather than the screen, so it drifts down with the field while the grave keeps moving, and it is finished at birth: the radius its level bought never changes afterwards. The torn-open look is expression, not identity (ADR 0044). _Avoid_: zone, tile, puddle, hazard.

**Lay**: One act of Territory claiming ground, on its own clock and never bought by a swallow: the charge fills, the line picks the densest knot of mobs ahead of the grave with a small lead, and the ground is claimed there. A full charge with nothing ahead holds and claims the moment something is. How the ground arrives is expression, not identity (ADR 0044). _Avoid_: cast, deploy, drop, proc, shot.

**Claimed ground**: What Territory leaves on the field. Repeated lays march a trail of patches down the field, each torn open where mobs stood thickest, so the ground the grave has taken is readable as a shape rather than a count. The torn-open look is expression, not identity (ADR 0044). _Avoid_: zone of control, damage floor, territory (which is the line, not the ground).

**Opening beat**: The beat a patch spends before its hands come up: it exists, is visible and drifts with the world, and it cannot damage. It runs in world time and off-field too, because visibility is never an activation condition, and it is what keeps Territory from collapsing into a placed detonation. _Avoid_: arming time, wind-up, cast time, cooldown.

**Pulse**: One dwell hit from a patch: a mob standing on claimed ground takes a small fixed bite of damage every re-hit delay for as long as it stays. The pulse count is the patch's own record of the work it did. _Avoid_: tick damage, DoT, grab, bite budget.

**Ladder**: The power staircase a run climbs, every weapon line's rungs together, from the birthright to a full build. It reads twice, in the storm and on the HUD (ADR 0054), and it runs both ways: rungs are gained from power-ups and stripped at the size floor. _Avoid_: progression, XP, levels, tech tree.

**Rung**: One step of one weapon line's level, the unit the ladder shows, gains and loses. A rung is carried by that line's own expression on the field, and a rung stripped at the size floor falls onto the field as a body the dive can catch. _Avoid_: rank, tier, pip (which is the mark, not the step).

**Fallen rung**: The body a stripped rung becomes, the same rung at a second moment: one body per rung the floor ladder takes, spread in roster order at the offer's own spacing and offset from the grave so the loss is never handed straight back, riding the scroll down and not decaying, and a swallow gives the rung back to the line it came off (ADR 0055). It wears the icon its HUD row taught, so one line's rung is told from another's. _Avoid_: dropped level, gem, refund, loot.

**HUD**: The slim readout at the field's top edge carrying the score and each line's rungs as marks: the ladder's second channel, and the one that makes a rung lost legible inside a dense storm. It sits in the band above the field where the screen leaves one and over the field's own top edge where it does not, and it announces by count, shape or subtraction, never by brightness. _Avoid_: strip, bar, panel, overlay.

**Amended 2026-09-16, at path step 5.** What stood: the readout's job, its content, and the announcing rule. What changed: "inside the field frame" becomes the field's top edge, because the readout has one home on both screen shapes and the frame's inside is not it. What the entry could not have known: a phone leaves no side gutter at all and a desktop leaves no band at all, both measured exactly zero, so the surround the readout wants is on a different axis on each shape (`docs/design/show-what-you-have.md` section 3.1).

### The field and the stage

**Field**: The fixed logical playfield the sim runs in. Everything in the sim is field units, never device pixels; the renderer scales the whole field to any screen. The field's dimensions and aspect are tuning numbers, not vocabulary. _Avoid_: screen, viewport, canvas, arena.

**Scroll**: The constant downward drift of everything on the field. The scroll is the corpse deadline and the power-up deadline both. _Avoid_: conveyor, drift, gravity.

**Mob**: Any hostile on the field. Live mobs are never food: contact shrinks the grave; only kills leave corpses. _Avoid_: enemy, monster, creature, unit.

**Mob fire**: Every hostile shot on the field, trash shots and boss patterns alike. Mob fire is never confusable with the storm; the render rule that guarantees it is Hungry Grave ADR 0014. _Avoid_: enemy fire, enemy bullets, hellfire.

**Armed**: Carrying fire. An armed mob looks armed, because picking targets is a skill only if the player can see which mob to pick. Under a mow that visible minority is a mob type rather than a share of a wave: the revenant is armed and the mow body is not, so the player picks the revenant out of the mow rather than one body out of a file (ADR 0059). _Avoid_: shooter, ranged.

**Tell**: The visible change an armed mob makes before every shot, not only its first, always at the same lead. Without it a mob's only tell is the damage. _Avoid_: warning, wind-up, charge.

**Arriving beat**: The beat a mob holds the formation's own motion for after it crosses the top edge, before its own movement takes over, so the placement's lesson reads whatever type is flying it. It governs movement only and never firing, because a type whose identity is firing the moment it enters would have that identity delayed by a rule meant to protect a lane's readability: an arriving mob flies the formation's shape, lights its tell during the beat, and then fires, so the warning window reaches the player as information rather than as a pause. _Avoid_: entry delay, spawn animation.

**Amended 2026-09-08, after the game design gate on adjustment iteration 2:** for a body that appears inside the field rather than crossing the top edge, the beat also governs the grave's contact: no contact hit lands from a body that has not finished arriving. What stood: the beat itself, the movement it governs, that it never governs firing, and the formation's lesson it exists to let the player read. What changed: contact, and only for a body that appeared inside the field; a body that crosses the top edge touches from the tick it overlaps, exactly as before. What the entry could not have known: no spawner put a body inside the field when it was written. Two do now, the Waking's pour and the Undertaker's dug-up bodies, and a body that materialised inside the grave's own box was a hit with nothing to see coming.

**Trash**: The ordinary mobs of the authored timeline, as opposed to bosses. _Avoid_: minions, creeps, fodder, popcorn.

**The mow**: What the storm does to a field of weak bodies, and the feel the whole density pass exists to produce. Density is bought by making bodies weaker, never tougher (ADR 0059). _Avoid_: grinding, farming, clearing, trash cleanup.

**Mob type**: A kind of mob, owning how it moves, whether and how it fires, its health, its corpse payout, and its size. v1 ships four and the pool is open by design: the shambler falls, the revenant fires an aimed shot with a tell before it, the ghoul is the closer, turning toward the grave so its body is the threat, and the cairn is the durable one, a wide stone slab that fires nothing and that the storm does not clear. A mob type must be readable before it acts, and no type fires a tracking shot, because fire that homes on the grave takes away the answer positioning is supposed to be. _Avoid_: enemy class, variant, archetype.

**Formation**: A named placement from the library: where a group of mobs arrives and how it is arranged, never which mob type is in it. Each teaches a lesson, and the library is open. The starting six are Drips, the File, the V, the Pincer, the Rain, the Wall. _Avoid_: template, pattern, spawn type, wave (which is the entry, not the shape).

**Wave**: One entry of the authored timeline: a section-local time, a formation, a count, and a mob type. Count lives on the wave, so density tuning never edits a formation, and the mob type lives there too, because a formation never names who is in it. A wave may also stand for a span rather than firing once, which is a standing wave. _Avoid_: row, spawn event, script line, formation (which is the shape, not the entry).

**Standing wave**: A wave with its repeat fields set: it holds a fixed rate from its own time until the next wave of any kind, repeating down to a minimum interval. What stands is the wave and never the bodies, which fall like any others. A section's growth is a run of them at stepped figures, and a section may declare none. It is the growth a run feels over its length, keyed to the clock and never to anything the player did, and the director adds over it rather than owning it (ADR 0060). _Avoid_: standing row, floor stream, faucet, spawn rate, wave table, repeating wave.

**Section**: One segment of the stage, chained to the next by a boundary event rather than an absolute clock, because a shootable boss dies when killed. Three of the seven are the named trash sections, the Procession, the Crowd and the Vigil, and each owns one property no other section has. The boss fights, the set piece and the ending are sections too, each one as long as what happens in it takes. _Avoid_: phase (which is the boss's), act, chapter, zone, area.

**The Procession**: The first section, ending on the Banshee. It owns emptiness: never more than one shaped group live above its standing wave, so the field thins between beats and the corpses left behind are worth crossing it for. Named for the funeral filing past in single file. _Avoid_: the ramp, the lane, the opening.

**The Crowd**: The second and longest section, ending on the Waking. It owns overlap: never fewer than two formations live, so corpses stop being objects to choose between and become a floor the grave swims through. _Avoid_: the back half, the middle.

**The Vigil**: The third and shortest section, ending on the Undertaker. It owns scarcity: less growth paid per second than the Crowd, on a roster of revenants and ghouls with the shambler thinned, so the field is more fire and less food. Named for the watch kept before the gravedigger arrives. _Avoid_: the descent, the finale, the last stretch.

**Boundary event**: What ends a section: the Banshee, the set piece, the Undertaker. A boundary event is not always a boss. _Avoid_: transition, checkpoint, gate.

**Sparse last wave**: The slow, thin final wave of a section before a boss, the boss arriving as its last body leaves. It replaces the old spawn silence, so the field still empties and the emptiness is a beat rather than a pause. _Avoid_: drain-out, lull, break, intermission.

**Set piece**: An authored moment that names the property it must keep rather than the mob types allowed in it. The Wall is the first, and the swarm that ends the middle section is the second. The director adds nothing during one. _Avoid_: scripted event, cutscene, special wave.

**The Wall**: The feast wave: an edge-to-edge curtain of cairns launched by the miniboss's death, costing more to cross than an unloaded grave has and opened by a belch. It is never an impassable body: the shove moves the cairns and a gap appears because they moved (ADR 0042 as amended). _Avoid_: swarm wave, horde.

**The Waking**: The swarm set piece that ends the Crowd: a dormant eye placed by a Crowd wave, riding the ground down until it opens around mid-field and pours trash from its one point while the source drags across. It fires nothing and never touches the grave, and its corpses are the payout. A toll pushes its source a fraction of the push a mob takes, so a high enough bell holds the grave under the pour (ADR 0008 as re-ruled 2026-09-15). _Avoid_: the swarm, the eye event, the mouth.

**Amended 2026-09-08, Mark's ruling after ground adjustment 1:** the eye rides the ground at the field's own scroll and opens a quarter of the way down, not around mid-field. What stood: everything else in the entry, the placing wave, the pour from one point, the drag across, the silence, the parking rule, and the corpses as the payout. What changed: the opening depth, and with it the time the eye is on screen, about one crossing rather than several times a mob's. What the entry could not have known: the ground was at half the field's scroll when it was written.

**Amended 2026-09-08, Mark's ruling on #104:** killing the source removes its body and the pour finishes anyway, from the same pour point on the same clock, until the budget is spent. What stood: everything else in the entry. What changed: what a kill costs, the body and the rest of the source's stay rather than the rest of the trail. What the entry could not have known: it was written while the kill closed the set piece, which paid the hand that held back over the hand that committed.

**Stage**: The content from first wave to final boss, authored beats filled with directed density; a run is one playthrough of it. _Avoid_: level, map, world.

**Run**: One playthrough of a stage, from its seed roll to sealed shut or victory. _Avoid_: game, session, attempt, playthrough.

**Seed**: The dice a run rolls from. Every fresh run rolls a fresh seed, and a seed in the URL pins the run. _Avoid_: RNG state, random seed value.

**Pinned run**: A run whose seed came from the URL, so it rolls the same dice every time. It pins the dice, not the stage, because directed density answers the hands that play it. _Avoid_: fixed run.

**Directed density**: The mobs the game adds between the authored waves, raised and lowered by the pressure the run is putting on the player. It never removes an authored wave, so it rises and falls only over what it added itself, and it is silent during boss sections, the sparse last waves and the set pieces. _Avoid_: faucet, spawn rate, dynamic difficulty.

**Director**: What produces directed density: it spends a finite budget per section on mobs drawn from the run's roster, only while pressure reads low, and goes quiet for an interval after each add. It never places a carrier, so it can never hand out power. _Avoid_: AI director, spawner, difficulty manager.

**Purse**: The finite budget one section gives the director, counted in bodies and spent on cards. When it is empty the section runs at its authored floor for the rest of its length, so the storm is seen to win. A section the director may not touch at all has no purse, which is a different thing from a purse of zero, where it may look and finds nothing to spend. _Avoid_: budget, credits, pool, allowance.

**Card**: One thing the director may buy with its purse: a formation, a mob type and a count, costing the sum of its bodies. Every directed add is a card, so what the director puts on the field is always a shape the player can read rather than a loose body. _Avoid_: spawn, wave (which is the authored entry), group, packet, add (which is the boss's summon).

**Pressure**: What the director reads: the harm the run is doing to the player, damage taken and floor events, and never a kill near the grave, because a kill up close is food here. _Avoid_: intensity, threat, difficulty, tension.

**Signal lock**: A figure a run resolves the pressure signal to and holds it at, for a tuning experiment. It is recorded in the tape header, because it is a value the run started from and never an absence (ADR 0027). _Avoid_: override, debug mode, freeze.

**Tape**: What one run is recorded onto: a header, three separable sections, and a trailer. The body holds the seed, the resolved starting size and the exact commands the grave was steered by, tick by tick; the second section holds the run's witness at checkpoints along the way; and the third holds the run's observations. A tape holds no field state, so anything a replay can rebuild is computed by replaying it, which is why a tape recorded today can answer a question nobody has thought of yet. It is bytes and never a JSON string, small enough that a whole stage's tape stays a file somebody can hold and send, and it carries a format version a reader refuses rather than guesses at. _Avoid_: recording, demo, log, save file, ghost.

**Replay**: Playing a tape back so the original run happens again exactly. A replay is watched, never played: same dice, the original hands. Shared, it is how somebody sees a run over the player's shoulder. _Avoid_: playback, rerun, ghost, pinned run.

### Bosses

**Boss**: A hostile that arrives alone on a section boundary with authored bullet-hell patterns and phased health. Bosses are always shootable and shed food throughout the fight. A landed toll shows on the boss's body every time, though it never moves the boss (ADR 0007 as amended 2026-09-15). _Avoid_: elite, guardian.

**Miniboss**: The mid-stage boss, fought before the feast. _Avoid_: midboss, sub-boss.

**Phase**: One segment of a boss's health bar, owning one authored pattern, ended by a short invincible flash. _Avoid_: chunk, health bar segment, stage (of a fight), section (which is the stage's).

**Add**: An ordinary mob summoned by a boss mid-fight. Adds are trash: normal pushback, normal corpses, and they keep the swallow economy alive at the climax. It is never the director's word: what the director puts down is a card. _Avoid_: summon, minion, spawn.

### The build

**Witness**: The number a run folds its own state down to, stamped on a tape at checkpoints along the way. A replay recomputes it and so can attest that it reproduced the run rather than merely resembling it, and because each checkpoint is an independent snapshot rather than a running total, a replay that diverges can name the first checkpoint that disagrees. It carries its own version, so a widened fold reads as a different witness rather than as a run that did not happen. Numbers from a replay whose witness does not match are never reported. _Avoid_: fingerprint, signature.

**Digest**: The witness of the one canonical scenario, committed as a constant so a change to the rules shows up as a moved number. Witness and digest name one fold used two ways: a tape's proof of its own run, and the tree's proof that the simulation still behaves. The constant itself is named `GOLDEN` in the code, which is the identifier and not the concept's name. _Avoid_: golden test, snapshot.

**Verification readback**: Decoding a tape and reproducing its run far enough to prove the tape is sound: that it decodes, that its witness recomputes, and that the same tape gives the same run twice. It proves an artifact and it is never the replay feature, so no replay obligation is met by it existing. The name is the protection, and it holds however much machinery the two share: a reader who finds code that decodes a tape and re-runs it will reach for a small replay on the way to a full replay, which is the framing that lets a player-facing obligation look discharged while nothing has been built. _Avoid_: replay, small replay, partial replay, playback.

**Checkpoint**: A tick at which a run stamps its witness onto a tape, at an authored spacing. Checkpoints are what let a replay name the first point it disagreed at rather than only report that it diverged somewhere. Never a section of the stage. _Avoid_: snapshot, save point, marker, section.

**Build identity**: The build a tape was recorded on, stamped into its header by the build shell. It is not the commit hash beside it: a commit cannot see a working tree, so a run played while a rule was uncommitted would carry the label of a build that never held it. The identity carries the tree's own dirty mark, so two builds of one commit under two different uncommitted rules are two identities. A replay reports the tape's identity and the reading build's and refuses on neither: a difference is a note on a verified reading and an attribution on a divergence, never a reason not to play a player's tape. _Avoid_: build number, version, commit hash.

**Trailer**: The summary a tape carries at its end: how the run ended, how it stopped, and its integrity. It is written last on purpose, so a tape off a tab somebody simply closed has no trailer and reads as a stop of unknown. _Avoid_: footer, summary block, header field.

**Instrument**: What the game observes itself with, the recorder, the readings and the harness together. Between two designs of it, the smaller one wins wherever both still preserve trustworthy, repeatable measurement, which is what keeps a field nobody has a question for out of a tape. _Avoid_: telemetry, analytics, instrumentation suite.

**Observation**: Something a tape records because replaying it could never recompute it: frame timings, runtime errors and warnings, whether audio dropped, and the pauses and tab-switches a run took. Fault records are observations. Timings were merely the first inhabitants of the section, which is general on purpose. _Avoid_: metric, telemetry, log line, event.

**Frame row**: The one row each rendered frame of a live run writes into a tape's observations, because a per-run aggregate cannot say which situations created a cost. A frame that bought no tick carries an absent tick index rather than an invented one, and why it bought nothing is its own field from a closed list, live, ending, paused, backgrounded and countdown, in the guard's own order where more than one holds. The row records what the frame seam really saw and never fabricates context, and the earlier shape, where a paused frame's row was byte-identical to a live sub-tick frame's, was ruled, tried and rejected, because why a frame bought nothing is runtime history no replay rebuilds. _Avoid_: perf sample, telemetry row, frame log.

**Fault**: What the simulation records when one of its own invariant checks fires. A fault is a defect in the game, never a thing the player did, and it never wears the vocabulary of death. _Avoid_: crash, error, exception, assertion.

**Fatal fault**: A fault after which continued execution would be unusable or untrustworthy, so the run stops. Stopping is not a death and not an ending: the run is over and the player was not sealed shut. _Avoid_: fatal error, crash, game over.

**Recoverable fault**: A fault the simulation can safely carry on through, recorded once with the tick it first fired on and the count, while the run continues. Safe to continue is not the same as harmless, and a run carrying one is not clean evidence. _Avoid_: warning, minor, cosmetic.

**Fault identity**: The name of one kind of fault, fixed as a closed list that only ever gains entries. An identity outlives the check that raises it, because a tape written today is read back after the checks have been rewritten, so it is never whatever string a check happens to carry. _Avoid_: error code, message, check name.

**Integrity**: Whether the run a tape holds was sound, meaning whether any fault fired in it at all. Clean when the checks ran and nothing fired, faulted when something fired, and unchecked when the run was recorded on an instrumentation build with the invariant checks switched off, which is the one case where an empty fault list is not evidence of a sound run. Separate from the witness, which asks a different question: the witness says whether this is the original run, integrity says whether the original run was worth trusting. _Avoid_: valid, clean, verified.

**Ending**: How a run ended: sealed, victory, or absent. A fault never appears in it, because sealed is this game's word for death and a fault is a defect in the game rather than a way a run can end, so a faulted run's ending says only what the play reached. _Avoid_: outcome, result, status, death.

**Stop**: How a run stopped, as opposed to how it ended. A run finishes, is quit, or is stopped by a fatal fault, and a tape that simply breaks off says unknown. Ending and stop are two facts and never one. _Avoid_: status, outcome, result.

**Damage source**: What dealt a hit, carried on the event either way. On damage the player deals it is the weapon line or the belch; on damage the player takes it is mob fire, naming the type that fired, or a body landing on the grave. A hit with no source is a hit nothing can be learned from. _Avoid_: attacker, cause, origin.

**Playing harness**: The instrument that plays the game for us: one policy that moves, dodges, feeds, takes offers and belches, run across many seeds, and then the same policy under a sharp hand and a sloppy one. It compares builds and configurations and it never says whether the game is fun. The belch is the fifth verb as of ADR 0053's amendment of 2026-09-09; this entry said four before it. _Avoid_: AI, autopilot, playtester, agent.

**Policy**: The rules one harness run steers by, named in the tape header beside the input device so a bot run is never mistaken for a person's. _Avoid_: behaviour, brain, difficulty setting.

**Configuration**: One hand the harness plays with: the base policy under one value of each knob, named by a word pair a person can say. Eighteen are named, six hands crossed with three heads, from `steady-far` to `shaky-short`, and the name is what a tape's header records. The heads are `far`, `middling` and `short`. The hands, sharpest first, with the two numbers of the dexterity error each one carries, how often attention fails and how deep a lapse runs when it does: `steady` never and none, `loose` 100 in 1000 and 0 to 15 ticks, `unsteady` 140 and 0 to 20, `wavering` 175 and 0 to 25, `faltering` 210 and 0 to 30, `shaky` 250 and 0 to 36. _Avoid_: difficulty, skill level, persona, profile.

**Dexterity error**: The knob that makes the hand's attention lapse. On nearly every decision attention holds and the hand acts on the tick; when it fails, the hand keeps the command it already had for a drawn number of ticks and the field moves under it. A hand carries two numbers for it, how often attention fails and how deep a lapse runs when it does, and the rungs nest, so one sloppy run holds attentive decisions and shallow and deep lapses alike. It is an error and not a skill: it takes something away from the hand rather than giving it something. _Avoid_: reaction time, lag, input delay, twitch.

**Strategy error**: The knob that shortens how far ahead the policy looks, from the far end so the near samples survive. An error on the same terms as the dexterity one. _Avoid_: intelligence, planning depth, foresight, IQ.

**Sharp hand, sloppy hand**: The two corner configurations, `steady-far` and `shaky-short`. A finding is believed only where both show the same ordering, so these two are what an agreement is between. _Avoid_: good bot, bad bot, expert, novice.

**Starting condition**: One record of how a run starts: the size, the levels, the roster, the signal lock, the starting score and the tuning record together, each absent field resolving to what the run would have resolved it to anyway. A rig is that record under a name, a tape's header carries it whole, and `createRun` takes it (ADR 0063). It is how a run began and never how it was played, so a figure says its starting condition beside the hand and the policy that steered it, and a field added to it cannot fall through the header or the rig. A figure is banded by the three fields a rig states of it, the size, the levels and the starting score, and never by the roster, the signal lock or the tuning record, which ride beside the rig because no row varies them. _Avoid_: initial state, preset, options, start state.

**Rig**: A starting condition under a name, so a figure always says which one produced it (ADR 0063). Three rows exist, `birthright`, `maxed` and `ladder` (`RIG_NAMES` in `src/dev/rigs.ts`): the birthright rig is the only one that starts at the birthright, the maxed rig starts at the same size with every line at the cap, which is where a person's own finished runs stand, and the ladder rig starts at the size floor with every line at the cap and a score for the floor ladder to bleed. The starting conditions the harness record names that nothing plays through the harness, the ceiling rig among them, have no row and wait for something that plays them. The rig is a run's starting condition alone and never the hand that steered it: a figure names its rig and its configuration, and neither answers the other. Figures from two rigs are never banded. _Avoid_: setup, harness, scenario, fixture.

**Amended 2026-09-17, at path step 5.** What stood: everything the entry says a rig is, that it is the starting condition alone and never the hand, and that figures from two rigs are never banded. What changed: the harness plays out of three rows rather than two, because `src/dev/rigs.ts` gained a `ladder` row, and a rig's starting condition is now the size, the levels and the score together rather than the size and the levels. The ladder row starts a run at the size floor with every line at the cap, holding a score for the floor ladder to bleed, which is what lets the harness play "go to the lowest level, then the level below" instead of waiting for a run to arrive there. What the entry could not have known: nothing could start a run holding a score at all when it was written, so a starting score was not a fact a rig could state, and a tape header carried none, which is why a figure was banded by the size and the levels alone; the header carries the starting condition whole now, so the banding reads all three fields.

**Amended 2026-09-17, at path step 6, before the record the step builds.** What stood: everything the entry says a rig is, that it is the starting condition alone and never the hand, that figures from two rigs are never banded, and the amendment above, including what it says a rig's starting condition holds. What changed: the count and the list, six named rigs becoming the three rows `RIG_NAMES` actually holds, with the ceiling rig named as unrowed and waiting because `src/dev/rigs.ts` says so in its own comment; and the entry cites Starting condition rather than restating it, because ADR 0063 makes that record the one thing a rig, a tape header and `createRun` all speak. What the entry could not have known: it was written when a rig was the only name any starting condition had, so counting rigs was the only way to count starting conditions, and `docs/design/playing-harness.md`'s own table has since reached seven while `RIG_NAMES` reached three.

**Tuning record**: The magnitudes a batch reading can move, held as one record grouped by the module that owns them, resolved once at a run's start and carried on the run rather than compiled into the build. The shell is what resolves it, from a named candidate or from the URL, and passes it inward on the run's starting condition, so the core never imports a record. Its one name on every text surface, a command line, a tape header, a report and a comparison alike, is the dotted path its grouping gives it, and a row exists only where something reads it (ADR 0064). It is not the caps and not the safety nets: a cap is derived from the stage's own tables and a safety net is there to catch a bug, so neither is a number a reading may move. _Avoid_: settings, parameters, config, balance table.

**Candidate**: A named tuning record, the thing a batch or a play is run under. The name is what a batch folder and a report carry, so the build a person plays and the batch a finding came from name the same tuning (ADR 0064). A candidate is a starting condition on exactly the terms a rig is, and never a description of the hand that steered: a figure names its candidate, its rig and its configuration, and no one of the three answers another. _Avoid_: variant, arm, treatment, recipe.

**Reading**: One named figure a report carries off a tape. Its meaning is declared, in its own entry in the declaration tables, and never taken from the shape, range, sign or type its value happens to have: an array of numbers is a per-tick series only where its reading says so, a discriminator is a field its producer writes rather than a pattern its consumer recognises, and a reading with no entry is a hole rather than a default. _Avoid_: metric, stat, datapoint, KPI.

**Batch**: One run per seed over a consecutive range of seeds under one configuration, played headlessly from one command, leaving a tape per seed and one report over all of them. Its size is seeds and never repeats, because a deterministic policy has nothing to learn from playing a seed twice. Its report is a distribution and never a mean: every reading prints as five numbers with the seeds behind the two extremes named and every run's own value kept beside them, so the tail is on the report and a rank test can read it, and no figure in it is a verdict. _Avoid_: sample, suite, trial, experiment.

**Amended 2026-09-17, at path step 6.** What stood: everything the entry says a batch is, one run per seed over a consecutive range under one configuration, its size counted in seeds and never in repeats, its tape per seed, and its report as a distribution and never a mean. What changed: the ban on "sweep", which now names a thing of its own, a list of candidates each played as an ordinary batch with one comparison printed across them; a sweep is therefore made of batches rather than being a loose word for one, and `sample`, `suite`, `trial` and `experiment` stay banned. What the entry could not have known: nothing could name a tuning at a run's start when it was written, so there was nothing a sweep could sweep over.

**Store**: Where every run lands, a person's and the harness's alike: the sealed tape bytes byte-exact, the header parsed into columns beside them, and readings derived by replay cached and stamped with the build that computed them. A person's run and a harness run land in the same tables, told apart by what the header already carries, the author, the input device and the policy that steered. Only the bytes are authoritative, and a build stamp says which build computed a reading and nothing more: whether a reading still holds is answered by replaying the tape and letting the witness attest the run, never by comparing stamps. _Avoid_: database, backend, telemetry, analytics.

**Prototype**: A self-contained teaching build in its own folder under its own route, listed by the base app and removable by deleting the folder and its registry entry. It exists to teach and is never extended into the game. _Avoid_: spike, demo, POC, MVP.
