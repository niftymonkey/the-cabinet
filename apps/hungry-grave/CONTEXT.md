# The Hungry Grave

A Halloween vertical shmup crossed with hole.io. The player is a moving open grave ascending a scrolling world, swallowing what it kills to fuel an ever-thickening storm of its own projectiles, with deliberate doses of bullet hell from bosses.

This file is the vocabulary. The traps this codebase has actually shipped are in `docs/lessons.md` beside it.

## Language

### The grave

**Grave**: The protagonist: a moving open grave, a hole in the ground shaped like a grave, taller than wide. It swallows and passes under; it never drives. _Avoid_: player character, hole, ship, hero.

**Swallow**: The one verb of collection: the grave passes under a corpse or drop and it falls in. Every payout in the game arrives through a swallow. _Avoid_: eat, collect, pick up, consume, drive over.

**Size**: The grave's one scalar, its half-height; width follows at a fixed aspect. Size is health: swallowing grows it, hits shrink it. _Avoid_: health, HP, radius, scale.

**Size floor**: The hard minimum size, so the recovery path never physically closes. Size never gates a swallow: whatever the grave passes under goes in. At the floor, hits bleed score, then weapon levels down to the birthright loadout, and only when nothing is left to bleed does the next hit seal the grave shut. _Avoid_: minimum health, death's door.

**Size ceiling**: The hard maximum size, the grave standing about a quarter of the field's width tall. Growth past it converts to score, so a big meal at full size is never worthless. _Avoid_: max level, size cap.

**Sealed shut**: Death: shrunk to nothing, filled in, and closed. The grave is never destroyed or killed; it is sealed. _Avoid_: dead, killed, game over, destroyed.

**Focus**: Hold-to-slow precise movement, keyboard only. On touch, drag precision is the fine control and focus is nothing. _Avoid_: slow mode, precision mode, walk.

### The food

**Corpse**: What a kill leaves behind, scrolling down the field. Fuel, common, and always decaying. _Avoid_: body, gem, pickup, loot.

**Corpse tier**: Which mob a corpse came off, read as a hue. Corpses hold one size across mob types, so a tier is the only thing that shows a payout, and every tier shares one brightness because brightness is freshness. _Avoid_: rarity, grade, quality.

**Freshness**: A corpse's one meter, running from kill to gone in seconds derived from scroll speed. It scales every payout down to a floor, and at empty the dirt takes the corpse under. _Avoid_: decay, timer, expiry, TTL.

**Drop**: A permanent upgrade a carrier leaves where it died. It spawns as an offer, and the grave gets the option it passes under. Drops never decay. _Avoid_: powerup, upgrade item, pickup, loot.

**Carrier**: A mob authored to carry a drop. Killing one is the only way power arrives, the director never places one, and the schedule holds more of them than a full build needs, so a missed carrier costs a step and not the run. _Avoid_: item enemy, power-up carrier, drop mob.

**Offer**: What a drop spawns: three option bodies falling side by side and apart, and the grave gets exactly the one it passes under while the others vanish. Options draw from unowned lines and level-ups of owned, un-maxed lines; a maxed line is never offered. One offer is live at a time, and a drop paid while one stands banks toward the next. _Avoid_: menu, loot table, choice wheel, spinner.

**Feast**: A boss-shed reward corpse that never decays, dropped at chunk breaks and at a miniboss death; the death feast is big enough to jump the grave's size. _Avoid_: bonus, health pack, jackpot.

**Treasure**: The never-decaying class of food: drops and feasts. Steady-bright beside fading corpses, so steady-bright always means treasure. _Avoid_: rare drop, special item.

**Overflow**: The payout when a swallow cannot pay its normal way: growth past the size ceiling converts to score. ADR 0002's other branch, a maxed weapon line's drop, is dormant under ADR 0034, which never offers a maxed line; a carrier's body with no option left to give is swallowed like any other food and pays growth, reservoir charge and overflow. Nothing swallowed is ever worthless. _Avoid_: waste, surplus, refund.

### The arsenal

**Weapon line**: One of the upgradable weapon systems, leveled one to five by drops. A weapon line owns its own properties: how it fires, whether the run starts with it, and how its levels grow. v1 ships four, the skull stream, Territory, the wisps and the bell, and the pool is open by design. Each level must look different on screen. Short form "line" is fine once the term is established in a passage. _Avoid_: gun, upgrade track, skill.

**Firing trigger**: How a weapon line fires: always-on, on each swallow, or on its own timer. A property each line owns, never a category of lines. _Avoid_: floor line, burst line, passive weapon, active weapon, proc.

**Birthright**: The weapon line a run starts with, the skull stream at level 1. Damage at the size floor strips levels back to it. _Avoid_: starting loadout, base weapons.

**Skull stream**: Skulls pouring straight up out of the grave's mouth, in distinct parallel streams from mounts across its width, surging after each swallow. It never homes. Renamed from the soul stream 2026-08-31; the old name is unclaimed, not banned, and the code and tape identifier follow the rename. _Avoid_: main gun, vulcan, primary fire.

**Territory**: Ground the grave claims ahead of itself: on its own clock the line tears the earth open over the densest knot of mobs ahead of the grave, and after a short opening beat grasping hands pull, slow and pulse damage into any mob whose body is over them. Levels buy area and control strength, the pull, the slow and the pace of the dwell pulses, so capability reads as bigger ground that is harder to leave. Its job is reclaiming space when overwhelmed, never a big damage number, and the tearing and the hands are expression, not identity (ADR 0044). _Avoid_: zone, aura, trap, minefield, area denial.

**Wisps**: Will-o-wisps, fired on each swallow: each swallowed corpse's soul tears loose and hunts. A rotten corpse tears loose fewer souls and never fewer than one. At most one weapon line homes at a time, and a homing line is never always-on, so homing is always bought with a dive. _Avoid_: missiles, seekers, homing shots.

**Bell**: The funeral toll on its own clock: an always-on pulse that throws expanding cones, one forward at level one and more at each level, wrapping toward the sides as they multiply until the top of the line has the surround back at field scale. Its job is repel, pushing mobs off the space the grave wants; bosses take its damage but never its push. _Avoid_: shockwave, nova, AOE, ring.

**Swallow chime**: The baseline sound and juice of every swallow, firing from the very first swallow regardless of loadout, so the early minutes are never silent. _Avoid_: eat-chime, pickup sound.

**Belch**: The one button. It vomits the full reservoir in two scopes at once, the gas and the burst. It fires only at a full reservoir. _Avoid_: bomb, ult, special, screen clear.

**Gas**: The belch's field-wide half: it smothers every mob-fire shot on the field, boss patterns included, and kills nothing. _Avoid_: smoke, cloud, bullet clear.

**Burst**: The belch's local half: the eruption that kills the mobs within a radius of the grave, lands the boss chunk when the boss is inside it, and never pushes a boss. _Avoid_: explosion, nova, wipe.

**Reservoir**: The capped belch charge, filled by swallows. Charge past full visibly splashes and wastes, so belching is the greedy play. _Avoid_: meter, gauge, mana, energy.

**Cancel scatter**: The read a cancelled shot leaves behind: a short burst of spokes at the shot's own position, so a shot that stops existing is seen to be cancelled rather than silently gone. One vocabulary for every cancellation, whether the grave's mouth ate the shot or the belch wiped the field. It must never read as a swallow, because the swallow is the one verb of collection. _Avoid_: puff, pop, particle burst, explosion.

**Storm**: The player's own airborne projectiles at saturation, the bullet heaven the player builds. Mob fire is never the storm. _Avoid_: bullet spam, DPS, firepower.

**Surge**: The skull stream's answer to a swallow: a number of extra volleys at a shortened interval, never a damage bonus and never a time window. A rotten corpse buys a shorter surge and never a thinner one, because column count is what draws the line's levels. One swallow buys one surge, and a swallow chain overwrites an unspent one rather than banking a queue. _Avoid_: buff, haste, frenzy.

**Toll**: One firing of the bell, on its own clock and never bought by a swallow. _Avoid_: pulse, tick, cast.

**Cone**: One expanding cone a toll throws, damaging what its leading edge crosses and pushing at every level, harder as the level rises (`bell.ts:101-107`). Its angles, reach and push are tuning rows. The Banshee's tear-rings are mob fire and are never a cone. _Avoid_: arc, ring, shockwave, wave, AOE.

**Patch**: One piece of claimed ground, torn open by one lay. It belongs to the world rather than the screen, so it drifts down with the field while the grave keeps moving, and it is finished at birth: the radius its level bought never changes afterwards. The torn-open look is expression, not identity (ADR 0044). _Avoid_: zone, tile, puddle, hazard.

**Lay**: One act of Territory claiming ground, on its own clock and never bought by a swallow: the charge fills, the line picks the densest knot of mobs ahead of the grave with a small lead, and the ground is claimed there. A full charge with nothing ahead holds and claims the moment something is. How the ground arrives is expression, not identity (ADR 0044). _Avoid_: cast, deploy, drop, proc, shot.

**Claimed ground**: What Territory leaves on the field. Repeated lays march a trail of patches down the field, each torn open where mobs stood thickest, so the ground the grave has taken is readable as a shape rather than a count. The torn-open look is expression, not identity (ADR 0044). _Avoid_: zone of control, damage floor, territory (which is the line, not the ground).

**Opening beat**: The phase a patch spends before its hands come up: it exists, is visible and drifts with the world, and it cannot damage. It runs in world time and off-field too, because visibility is never an activation condition, and it is what keeps Territory from collapsing into a placed detonation. _Avoid_: arming time, wind-up, cast time, cooldown.

**Pulse**: One dwell hit from a patch: a mob standing on claimed ground takes a small fixed bite of damage every re-hit delay for as long as it stays. The pulse count is the patch's own record of the work it did. _Avoid_: tick damage, DoT, grab, bite budget.

**Rung**: One step of one weapon line's level, the unit the ladder shows, gains and loses. A rung is carried by that line's own projectiles, and a rung stripped at the size floor falls onto the field as a body the dive can catch. _Avoid_: rank, tier, pip (which is the mark, not the step).

**Strip**: The slim readout inside the field frame carrying the score and a row of level pips per line: the ladder's second channel, and the one that makes a rung lost legible inside a dense storm. It announces by count, shape or subtraction, never by brightness. _Avoid_: HUD, bar, panel, overlay.

### The field and the stage

**Field**: The fixed logical playfield the sim runs in. Everything in the sim is field units, never device pixels; the renderer scales the whole field to any screen. The field's dimensions and aspect are tuning numbers, not vocabulary. _Avoid_: screen, viewport, canvas, arena.

**Scroll**: The constant downward drift of everything on the field. The scroll is the corpse deadline and the drop deadline both. _Avoid_: conveyor, drift, gravity.

**Mob**: Any hostile on the field. Live mobs are never food: contact shrinks the grave; only kills leave corpses. _Avoid_: enemy, monster, creature, unit.

**Mob fire**: Every hostile shot on the field, trash shots and boss patterns alike. Mob fire is never confusable with the storm; the render rule that guarantees it is Hungry Grave ADR 0014. _Avoid_: enemy fire, enemy bullets, hellfire.

**Armed**: Carrying fire. An armed mob looks armed, because picking targets is a skill only if the player can see which mob to pick. Under a mow that visible minority is a mob type rather than a share of a row: the revenant is armed and the mow body is not, so the player picks the revenant out of the mow rather than one body out of a file (ADR 0059). _Avoid_: shooter, ranged.

**Tell**: The visible change an armed mob makes before every shot, not only its first, always at the same lead. Without it a mob's only tell is the damage. _Avoid_: warning, wind-up, charge.

**Arriving beat**: The beat a mob holds the template's own motion for after it crosses the top edge, before its own movement takes over, so the placement's lesson reads whatever type is flying it. It governs movement only and never firing. _Avoid_: entry delay, spawn animation.

**Amended 2026-09-08, after the game design gate on adjustment iteration 2:** for a body that appears inside the field rather than crossing the top edge, the beat also governs the grave's contact: no contact hit lands from a body that has not finished arriving. What stood: the beat itself, the movement it governs, that it never governs firing, and the template's lesson it exists to let the player read. What changed: contact, and only for a body that appeared inside the field; a body that crosses the top edge touches from the tick it overlaps, exactly as before. What the entry could not have known: no spawner put a body inside the field when it was written. Two do now, the Waking's pour and the Undertaker's dug-up bodies, and a body that materialised inside the grave's own box was a hit with nothing to see coming.

**Trash**: The ordinary mobs of the authored timeline, as opposed to bosses. _Avoid_: minions, creeps, fodder, popcorn.

**Mob type**: A kind of mob, owning how it moves, whether and how it fires, its health, its corpse payout, and its size. v1 ships three and the pool is open by design: the shambler falls, the revenant fires an aimed shot with a tell before it, and the ghoul is the closer, turning toward the grave so its body is the threat. A mob type must be readable before it acts. _Avoid_: enemy class, variant, archetype.

**Template**: A named placement from the library: where a group of mobs arrives and how it is arranged, never which mob type is in it. Each teaches a lesson, and the library is open. The starting six are Drips, the File, the V, the Pincer, the Rain, the Wall. _Avoid_: formation, pattern, spawn type.

**Row**: One entry of the authored timeline: a phase-local time, a template, a count, and a mob type. Count lives on the row, so density tuning never edits a template, and the mob type lives there too, because a template never names who is in it. _Avoid_: spawn event, wave entry, script line.

**Standing row**: A row that stands for its section rather than firing once: a mob type, a template, and a rate of bodies a second that ramps between two figures across the section's authored span, repeating down to a minimum interval. It is the growth a run feels over its length, keyed to the clock and never to anything the player did, and the director adds over it rather than owning it. A section may declare none. _Avoid_: floor stream, faucet, spawn rate, wave table.

**Phase**: One segment of the stage, chained to the next by a boundary event rather than an absolute clock, because a shootable boss dies when killed. _Avoid_: act, chapter.

**Section**: One of the stage's three named trash phases, each owning one property no other section has and each ending on a boundary event. The boss and set-piece phases between them are phases and not sections. _Avoid_: act, chapter, zone, area.

**The Procession**: The first section, ending on the Banshee. It owns emptiness: never more than one shaped group live above its standing row, so the field thins between beats and the corpses left behind are worth crossing it for. Named for the funeral filing past in single file. _Avoid_: the ramp, the lane, the opening.

**The Crowd**: The second and longest section, ending on the Waking. It owns overlap: never fewer than two templates live, so corpses stop being objects to choose between and become a floor the grave swims through. _Avoid_: the back half, the middle.

**The Vigil**: The third and shortest section, ending on the Undertaker. It owns scarcity: less growth paid per second than the Crowd, on a roster of revenants and ghouls with the shambler thinned, so the field is more fire and less food. Named for the watch kept before the gravedigger arrives. _Avoid_: the descent, the finale, the last stretch.

**Boundary event**: What ends a section: the Banshee, the set piece, the Undertaker. A boundary event is not always a boss. _Avoid_: transition, checkpoint, gate.

**Sparse last row**: The slow, thin final row of a section before a boss, the boss arriving as its last body leaves. It replaces the old spawn silence, so the field still empties and the emptiness is a beat rather than a pause. _Avoid_: drain-out, lull, break, intermission.

**Set piece**: An authored moment that names the property it must keep rather than the mob types allowed in it. The Wall is the first, and the swarm that ends the middle section is the second. The director adds nothing during one. _Avoid_: scripted event, cutscene, special wave.

**The Wall**: The feast wave: an edge-to-edge curtain of trash launched by the miniboss's death. _Avoid_: swarm wave, horde.

**The Waking**: The swarm set piece that ends the Crowd: a dormant eye placed by a Crowd row, riding the ground down until it opens around mid-field and pours trash from its one point while the source drags across. It fires nothing and never touches the grave, and its corpses are the payout. _Avoid_: the swarm, the eye event, the mouth.

**Amended 2026-09-08, Mark's ruling after ground adjustment 1:** the eye rides the ground at the field's own scroll and opens a quarter of the way down, not around mid-field. What stood: everything else in the entry, the placing row, the pour from one point, the drag across, the silence, the parking rule, and the corpses as the payout. What changed: the opening depth, and with it the time the eye is on screen, about one crossing rather than several times a mob's. What the entry could not have known: the ground was at half the field's scroll when it was written.

**Amended 2026-09-08, Mark's ruling on #104:** killing the source removes its body and the pour finishes anyway, from the same pour point on the same clock, until the budget is spent. What stood: everything else in the entry. What changed: what a kill costs, the body and the rest of the source's stay rather than the rest of the trail. What the entry could not have known: it was written while the kill closed the set piece, which paid the hand that held back over the hand that committed.

**Stage**: The content from first row to final boss, authored beats filled with directed density; a run is one playthrough of it. _Avoid_: level, map, world.

**Run**: One playthrough of a stage, from its seed roll to sealed shut or victory. _Avoid_: game, session, attempt, playthrough.

**Seed**: The dice a run rolls from. Every fresh run rolls a fresh seed, and a seed in the URL pins the run. _Avoid_: RNG state, random seed value.

**Pinned run**: A run whose seed came from the URL, so it rolls the same dice every time. It pins the dice, not the stage, because directed density answers the hands that play it. _Avoid_: fixed run.

**Directed density**: The mobs the game adds between the authored rows, raised and lowered by the pressure the run is putting on the player. It never removes an authored row, so it rises and falls only over what it added itself, and it is silent during boss phases, the sparse last rows and the set pieces. _Avoid_: faucet, spawn rate, dynamic difficulty.

**Director**: What produces directed density: it spends a finite budget per phase on mobs drawn from the run's roster, only while pressure reads low, and goes quiet for an interval after each add. It never places a carrier, so it can never hand out power. _Avoid_: AI director, spawner, difficulty manager.

**Purse**: The finite budget one phase gives the director, counted in bodies and spent on cards. When it is empty the phase runs at its authored floor for the rest of its length, so the storm is seen to win. A phase the director may not touch at all has no purse, which is a different thing from a purse of zero, where it may look and finds nothing to spend. _Avoid_: budget, credits, pool, allowance.

**Card**: One thing the director may buy with its purse: a template, a mob type and a count, costing the sum of its bodies. Every directed add is a card, so what the director puts on the field is always a shape the player can read rather than a loose body. _Avoid_: spawn, wave, group, packet, add (which is the boss's summon).

**Pressure**: What the director reads: the harm the run is doing to the player, damage taken and floor events, and never a kill near the grave, because a kill up close is food here. _Avoid_: intensity, threat, difficulty, tension.

**Tape**: What one run is recorded onto: a header, three separable sections, and a trailer. The body holds the seed, the resolved starting size and the exact commands the grave was steered by, tick by tick; the second section holds the run's witness at checkpoints along the way; and the third holds the run's observations. A tape holds no field state, so anything a replay can rebuild is computed by replaying it, which is why a tape recorded today can answer a question nobody has thought of yet. _Avoid_: recording, demo, log, save file, ghost.

**Replay**: Playing a tape back so the original run happens again exactly. A replay is watched, never played: same dice, the original hands. Shared, it is how somebody sees a run over the player's shoulder. _Avoid_: playback, rerun, ghost, pinned run.

### Bosses

**Boss**: A hostile that arrives alone on a phase boundary with authored bullet-hell patterns and chunked health. Bosses are always shootable and shed food throughout the fight. _Avoid_: elite, guardian.

**Miniboss**: The mid-stage boss, fought before the feast. _Avoid_: midboss, sub-boss.

**Chunk**: One segment of a boss's health bar, owning one authored pattern, ended by a short invincible flash. _Avoid_: phase (belongs to the stage), health bar segment, stage (of a fight).

**Add**: An ordinary mob summoned by a boss mid-fight. Adds are trash: normal pushback, normal corpses, and they keep the swallow economy alive at the climax. _Avoid_: summon, minion, spawn.

### The build

**Witness**: The number a run folds its own state down to, stamped on a tape at checkpoints along the way. A replay recomputes it and so can attest that it reproduced the run rather than merely resembling it, and because each checkpoint is an independent snapshot rather than a running total, a replay that diverges can name the first checkpoint that disagrees. It carries its own version, so a widened fold reads as a different witness rather than as a run that did not happen. Numbers from a replay whose witness does not match are never reported. _Avoid_: fingerprint, signature.

**Digest**: The witness of the one canonical scenario, committed as a constant so a change to the rules shows up as a moved number. Witness and digest name one fold used two ways: a tape's proof of its own run, and the tree's proof that the simulation still behaves. The constant itself is named `GOLDEN` in the code, which is the identifier and not the concept's name. _Avoid_: golden test, snapshot.

**Verification readback**: Decoding a tape and reproducing its run far enough to prove the tape is sound: that it decodes, that its witness recomputes, and that the same tape gives the same run twice. It proves an artifact and it is never the replay feature, so no replay obligation is met by it existing. _Avoid_: replay, small replay, partial replay, playback.

**Checkpoint**: A tick at which a run stamps its witness onto a tape, at an authored spacing. Checkpoints are what let a replay name the first point it disagreed at rather than only report that it diverged somewhere. Never a segment of the stage. _Avoid_: snapshot, save point, marker, phase.

**Build identity**: The build a tape was recorded on, stamped into its header by the build shell. It is not the commit hash beside it: a commit cannot see a working tree, so a run played while a rule was uncommitted would carry the label of a build that never held it. The identity carries the tree's own dirty mark, so two builds of one commit under two different uncommitted rules are two identities. A replay reports the tape's identity and the reading build's and refuses on neither: a difference is a note on a verified reading and an attribution on a divergence, never a reason not to play a player's tape. _Avoid_: build number, version, commit hash.

**Trailer**: The summary a tape carries at its end: how the run ended, how it stopped, and its integrity. It is written last on purpose, so a tape off a tab somebody simply closed has no trailer and reads as a stop of unknown. _Avoid_: footer, summary block, header field.

**Observation**: Something a tape records because replaying it could never recompute it: frame timings, runtime errors and warnings, whether audio dropped, and the pauses and tab-switches a run took. Fault records are observations. Timings were merely the first inhabitants of the section, which is general on purpose. _Avoid_: metric, telemetry, log line, event.

**Fault**: What the simulation records when one of its own invariant checks fires. A fault is a defect in the game, never a thing the player did, and it never wears the vocabulary of death. _Avoid_: crash, error, exception, assertion.

**Fatal fault**: A fault after which continued execution would be unusable or untrustworthy, so the run stops. Stopping is not a death and not an ending: the run is over and the player was not sealed shut. _Avoid_: fatal error, crash, game over.

**Recoverable fault**: A fault the simulation can safely carry on through, recorded once with the tick it first fired on and the count, while the run continues. Safe to continue is not the same as harmless, and a run carrying one is not clean evidence. _Avoid_: warning, minor, cosmetic.

**Fault identity**: The name of one kind of fault, fixed as a closed list that only ever gains entries. An identity outlives the check that raises it, because a tape written today is read back after the checks have been rewritten, so it is never whatever string a check happens to carry. _Avoid_: error code, message, check name.

**Integrity**: Whether the run a tape holds was sound, meaning whether any fault fired in it at all. Clean when the checks ran and nothing fired, faulted when something fired, and unchecked when the run was recorded on an instrumentation build with the invariant checks switched off, which is the one case where an empty fault list is not evidence of a sound run. Separate from the witness, which asks a different question: the witness says whether this is the original run, integrity says whether the original run was worth trusting. _Avoid_: valid, clean, verified.

**Stop**: How a run stopped, as opposed to how it ended. A run finishes, is quit, or is stopped by a fatal fault, and a tape that simply breaks off says unknown. Ending and stop are two facts and never one. _Avoid_: status, outcome, result.

**Damage source**: What dealt a hit, carried on the event either way. On damage the player deals it is the weapon line or the belch; on damage the player takes it is mob fire, naming the type that fired, or a body landing on the grave. A hit with no source is a hit nothing can be learned from. _Avoid_: attacker, cause, origin.

**Playing harness**: The instrument that plays the game for us: one policy that moves, dodges, feeds, takes offers and belches, run across many seeds, and then the same policy under a sharp hand and a sloppy one. It compares builds and configurations and it never says whether the game is fun. The belch is the fifth verb as of ADR 0053's amendment of 2026-09-09; this entry said four before it. _Avoid_: AI, autopilot, playtester, agent.

**Policy**: The rules one harness run steers by, named in the tape header beside the input device so a bot run is never mistaken for a person's. _Avoid_: behaviour, brain, difficulty setting.

**Configuration**: One hand the harness plays with: the base policy under one value of each knob, named by a word pair a person can say. Eighteen are named, six hands crossed with three heads, from `steady-far` to `shaky-short`, and the name is what a tape's header records. The heads are `far`, `middling` and `short`. The hands, sharpest first, with the two numbers of the dexterity error each one carries, how often attention fails and how deep a lapse runs when it does: `steady` never and none, `loose` 100 in 1000 and 0 to 15 ticks, `unsteady` 140 and 0 to 20, `wavering` 175 and 0 to 25, `faltering` 210 and 0 to 30, `shaky` 250 and 0 to 36. _Avoid_: difficulty, skill level, persona, profile.

**Dexterity error**: The knob that makes the hand's attention lapse. On nearly every decision attention holds and the hand acts on the tick; when it fails, the hand keeps the command it already had for a drawn number of ticks and the field moves under it. A hand carries two numbers for it, how often attention fails and how deep a lapse runs when it does, and the rungs nest, so one sloppy run holds attentive decisions and shallow and deep lapses alike. It is an error and not a skill: it takes something away from the hand rather than giving it something. _Avoid_: reaction time, lag, input delay, twitch.

**Strategy error**: The knob that shortens how far ahead the policy looks, from the far end so the near samples survive. An error on the same terms as the dexterity one. _Avoid_: intelligence, planning depth, foresight, IQ.

**Sharp hand, sloppy hand**: The two corner configurations, `steady-far` and `shaky-short`. A finding is believed only where both show the same ordering, so these two are what an agreement is between. _Avoid_: good bot, bad bot, expert, novice.

**Rig**: One starting condition a run is played from, named so a figure always says which one produced it. Six exist: the ceiling rig, the start-size rig, the ladder rig, the conditioned rig, and the two the harness plays out of, the birthright rig and the maxed rig. The birthright rig is the only one that starts at the birthright, and the maxed rig starts at the same size with every line at the cap, which is where a person's own finished runs stand. The rig is a run's starting condition alone and never the hand that steered it: a figure names its rig and its configuration, and neither answers the other. Figures from two rigs are never banded. _Avoid_: setup, harness, scenario, fixture.

**Batch**: One run per seed over a consecutive range of seeds under one configuration, played headlessly from one command, leaving a tape per seed and one report over all of them. Its size is seeds and never repeats, because a deterministic policy has nothing to learn from playing a seed twice. Its report is a distribution and never a mean: every reading prints as five numbers with the seeds behind the two extremes named and every run's own value kept beside them, so the tail is on the report and a rank test can read it, and no figure in it is a verdict. _Avoid_: sample, suite, sweep, trial, experiment.

**Store**: Where every run lands, a person's and the harness's alike: the sealed tape bytes byte-exact, the header parsed into columns beside them, and readings derived by replay cached and stamped with the build that computed them. Only the bytes are authoritative. _Avoid_: database, backend, telemetry, analytics.

**Prototype**: A self-contained teaching build in its own folder under its own route, listed by the base app and removable by deleting the folder and its registry entry. It exists to teach and is never extended into the game. _Avoid_: spike, demo, POC, MVP.
