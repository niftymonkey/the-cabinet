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

**Drop**: A permanent upgrade a kill sometimes leaves, priced in kills on a rising curve. Swallowing it levels one weapon line, chosen by the dice. Drops never decay. _Avoid_: powerup, upgrade item, pickup, loot.

**Feast**: A boss-shed reward corpse that never decays, dropped at chunk breaks and at a miniboss death; the death feast is big enough to jump the grave's size. _Avoid_: bonus, health pack, jackpot.

**Treasure**: The never-decaying class of food: drops and feasts. Steady-bright beside fading corpses, so steady-bright always means treasure. _Avoid_: rare drop, special item.

**Overflow**: The payout when a swallow cannot pay its normal way: a maxed weapon line's drop or growth past the ceiling converts to score, radius, or reservoir charge. Nothing swallowed is ever worthless. _Avoid_: waste, surplus, refund.

### The arsenal

**Weapon line**: One of the upgradable weapon systems, leveled one to five by drops. A weapon line owns its own properties: how it fires, whether the run starts with it, and how its levels grow. v1 ships four, the soul stream, Territory, the wisps and the bell, and the pool is open by design. Each level must look different on screen. Short form "line" is fine once the term is established in a passage. _Avoid_: gun, upgrade track, skill.

**Firing trigger**: How a weapon line fires: always-on, on each swallow, or on its own timer. A property each line owns, never a category of lines. _Avoid_: floor line, burst line, passive weapon, active weapon, proc.

**Birthright**: The weapon lines a run starts with, currently the soul stream and Territory. Damage at the size floor strips levels back to it. _Avoid_: starting loadout, base weapons.

**Soul stream**: Skulls pouring straight up out of the grave's mouth, in rigid fanned columns, surging after each swallow. It never homes. _Avoid_: main gun, vulcan, primary fire.

**Territory**: Ground the grave claims ahead of itself: on its own clock the line tears the earth open over the densest knot of mobs ahead of the grave, and after a short opening beat grasping hands pull, slow and pulse damage into any mob whose body is over them. Levels buy area and only area, so capability reads as size. Its job is reclaiming space when overwhelmed, never a big damage number, and the tearing and the hands are expression, not identity (ADR 0044). _Avoid_: zone, aura, trap, minefield, area denial.

**Wisps**: Will-o-wisps, fired on each swallow: each swallowed corpse's soul tears loose and hunts. At most one weapon line homes at a time, and a homing line is never always-on, so homing is always bought with a dive. _Avoid_: missiles, seekers, homing shots.

**Bell**: The funeral toll on its own clock: an always-on expanding damage ring, reaching a short way at level one and nearly across the field at level five, with pushback arriving as a higher-level property. Bosses take its damage but never its push. _Avoid_: shockwave, nova, AOE.

**Swallow chime**: The baseline sound and juice of every swallow, firing from the very first swallow regardless of loadout, so the early minutes are never silent. _Avoid_: eat-chime, pickup sound.

**Belch**: The one button. It vomits the full reservoir as a screen-clearing eruption: every mob-fire shot cancelled, big boss damage, no boss push. It fires only at a full reservoir. _Avoid_: bomb, ult, special, screen clear.

**Reservoir**: The capped belch charge, filled by swallows. Charge past full visibly splashes and wastes, so belching is the greedy play. _Avoid_: meter, gauge, mana, energy.

**Cancel scatter**: The read a cancelled shot leaves behind: a short burst of spokes at the shot's own position, so a shot that stops existing is seen to be cancelled rather than silently gone. One vocabulary for every cancellation, whether the grave's mouth ate the shot or the belch wiped the field. It must never read as a swallow, because the swallow is the one verb of collection. _Avoid_: puff, pop, particle burst, explosion.

**Storm**: The player's own airborne projectiles at saturation, the bullet heaven the player builds. Mob fire is never the storm. _Avoid_: bullet spam, DPS, firepower.

**Surge**: The soul stream's answer to a swallow: a fixed number of extra volleys at a shortened interval, never a damage bonus and never a time window. One swallow buys one burst, and a swallow chain overwrites an unspent one rather than banking a queue. _Avoid_: buff, haste, frenzy.

**Toll**: One firing of the bell, on its own clock and never bought by a swallow. _Avoid_: pulse, tick, cast.

**Ring**: The expanding circle a toll puts on the field, damaging what its leading edge crosses and pushing at the higher levels. The Banshee's tear-rings are mob fire and are never a ring. _Avoid_: shockwave, wave, AOE.

**Patch**: One piece of claimed ground, torn open by one lay. It belongs to the world rather than the screen, so it drifts down with the field while the grave keeps moving, and it is finished at birth: the radius its level bought never changes afterwards. The torn-open look is expression, not identity (ADR 0044). _Avoid_: zone, tile, puddle, hazard.

**Lay**: One act of Territory claiming ground, on its own clock and never bought by a swallow: the charge fills, the line picks the densest knot of mobs ahead of the grave with a small lead, and the ground is claimed there. A full charge with nothing ahead holds and claims the moment something is. How the ground arrives is expression, not identity (ADR 0044). _Avoid_: cast, deploy, drop, proc, shot.

**Claimed ground**: What Territory leaves on the field. Repeated lays march a trail of patches down the field, each torn open where mobs stood thickest, so the ground the grave has taken is readable as a shape rather than a count. The torn-open look is expression, not identity (ADR 0044). _Avoid_: zone of control, damage floor, territory (which is the line, not the ground).

**Opening beat**: The phase a patch spends before its hands come up: it exists, is visible and drifts with the world, and it cannot damage. It runs in world time and off-field too, because visibility is never an activation condition, and it is what keeps Territory from collapsing into a placed detonation. _Avoid_: arming time, wind-up, cast time, cooldown.

**Pulse**: One dwell hit from a patch: a mob standing on claimed ground takes a small fixed bite of damage every re-hit delay for as long as it stays. The pulse count is the patch's own record of the work it did. _Avoid_: tick damage, DoT, grab, bite budget.

**Price**: What the next drop costs, in kills, on a rising authored curve. A kill is a kill whatever weapon landed it. _Avoid_: threshold, cost curve, XP.

### The field and the stage

**Field**: The fixed logical playfield the sim runs in. Everything in the sim is field units, never device pixels; the renderer scales the whole field to any screen. The field's dimensions and aspect are tuning numbers, not vocabulary. _Avoid_: screen, viewport, canvas, arena.

**Scroll**: The constant downward drift of everything on the field. The scroll is the corpse deadline and the drop deadline both. _Avoid_: conveyor, drift, gravity.

**Mob**: Any hostile on the field. Live mobs are never food: contact shrinks the grave; only kills leave corpses. _Avoid_: enemy, monster, creature, unit.

**Mob fire**: Every hostile shot on the field, trash shots and boss patterns alike. Mob fire is never confusable with the storm; the render rule that guarantees it is Hungry Grave ADR 0014. _Avoid_: enemy fire, enemy bullets, hellfire.

**Armed**: Carrying fire. Only a fixed share of a wave is armed, and an armed mob looks armed, because picking targets is a skill only if the player can see which mob to pick. _Avoid_: shooter, ranged.

**Tell**: The visible change an armed mob makes before every shot, not only its first, always at the same lead. Without it a mob's only tell is the damage. _Avoid_: warning, wind-up, charge.

**Arriving beat**: The beat a mob holds the template's own motion for after it crosses the top edge, before its own movement takes over, so the placement's lesson reads whatever type is flying it. It governs movement only and never firing. _Avoid_: entry delay, spawn animation.

**Trash**: The ordinary mobs of the authored timeline, as opposed to bosses. _Avoid_: minions, creeps, fodder, popcorn.

**Mob type**: A kind of mob, owning how it moves, whether and how it fires, its health, its corpse payout, and its size. v1 ships three and the pool is open by design: the shambler falls, the revenant fires an aimed shot with a tell before it, and the ghoul is the closer, turning toward the grave so its body is the threat. A mob type must be readable before it acts. _Avoid_: enemy class, variant, archetype.

**Template**: A named placement from the library: where a group of mobs arrives and how it is arranged, never which mob type is in it. Each teaches a lesson, and the library is open. The starting six are Drips, the File, the V, the Pincer, the Rain, the Wall. _Avoid_: formation, pattern, spawn type.

**Row**: One entry of the authored timeline: a phase-local time, a template, a count, and a mob type. Count lives on the row, so density tuning never edits a template, and the mob type lives there too, because a template never names who is in it. _Avoid_: spawn event, wave entry, script line.

**Phase**: One segment of the stage, chained to the next by a boundary event rather than an absolute clock, because a shootable boss dies when killed. _Avoid_: act, section, chapter.

**Drain-out**: The deliberate spawn silence before a boss, letting the field empty so the boss arrives alone. _Avoid_: lull, break, intermission.

**The Wall**: The feast wave: an edge-to-edge curtain of trash launched by the miniboss's death, deliberately oversized as the loaded belch's target. _Avoid_: swarm wave, horde.

**Stage**: The authored content from first row to final boss; a run is one playthrough of it. _Avoid_: level, map, world.

**Run**: One playthrough of a stage, from its seed roll to sealed shut or victory. _Avoid_: game, session, attempt, playthrough.

**Seed**: The dice a run rolls from. Every fresh run rolls a fresh seed, and a seed in the URL pins the run. A run's seed stays visible so it can be shared. _Avoid_: RNG state, random seed value.

**Pinned run**: A run whose seed came from the URL, so it rolls the same dice every time. The playtest instrument. _Avoid_: fixed run.

**Challenge**: A seed shared so somebody else can play it. Same dice, their hands, their run. A challenge is played, never watched. _Avoid_: seed share, ghost, replay.

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

**Trailer**: The summary a tape carries at its end: how the run ended, how it stopped, and its integrity. It is written last on purpose, so a tape off a tab somebody simply closed has no trailer and reads as a stop of unknown. _Avoid_: footer, summary block, header field.

**Observation**: Something a tape records because replaying it could never recompute it: frame timings, runtime errors and warnings, whether audio dropped, and the pauses and tab-switches a run took. Fault records are observations. Timings were merely the first inhabitants of the section, which is general on purpose. _Avoid_: metric, telemetry, log line, event.

**Fault**: What the simulation records when one of its own invariant checks fires. A fault is a defect in the game, never a thing the player did, and it never wears the vocabulary of death. _Avoid_: crash, error, exception, assertion.

**Fatal fault**: A fault after which continued execution would be unusable or untrustworthy, so the run stops. Stopping is not a death and not an ending: the run is over and the player was not sealed shut. _Avoid_: fatal error, crash, game over.

**Recoverable fault**: A fault the simulation can safely carry on through, recorded once with the tick it first fired on and the count, while the run continues. Safe to continue is not the same as harmless, and a run carrying one is not clean evidence. _Avoid_: warning, minor, cosmetic.

**Fault identity**: The name of one kind of fault, fixed as a closed list that only ever gains entries. An identity outlives the check that raises it, because a tape written today is read back after the checks have been rewritten, so it is never whatever string a check happens to carry. _Avoid_: error code, message, check name.

**Integrity**: Whether the run a tape holds was sound, meaning whether any fault fired in it at all. Clean when the checks ran and nothing fired, faulted when something fired, and unchecked when the run was recorded on an instrumentation build with the invariant checks switched off, which is the one case where an empty fault list is not evidence of a sound run. Separate from the witness, which asks a different question: the witness says whether this is the original run, integrity says whether the original run was worth trusting. _Avoid_: valid, clean, verified.

**Stop**: How a run stopped, as opposed to how it ended. A run finishes, is quit, or is stopped by a fatal fault, and a tape that simply breaks off says unknown. Ending and stop are two facts and never one. _Avoid_: status, outcome, result.

**Damage source**: What dealt a hit, carried on the event either way. On damage the player deals it is the weapon line or the belch; on damage the player takes it is mob fire, naming the type that fired, or a body landing on the grave. A hit with no source is a hit nothing can be learned from. _Avoid_: attacker, cause, origin.

**Prototype**: A self-contained teaching build in its own folder under its own route, listed by the base app and removable by deleting the folder and its registry entry. It exists to teach and is never extended into the game. _Avoid_: spike, demo, POC, MVP.
