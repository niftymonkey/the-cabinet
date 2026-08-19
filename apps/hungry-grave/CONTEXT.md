# The Hungry Grave

A Halloween vertical shmup crossed with hole.io. The player is a moving open grave ascending a scrolling world, swallowing what it kills to fuel an ever-thickening storm of its own projectiles, with deliberate doses of bullet hell from bosses.

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

**Freshness**: A corpse's one meter, running from kill to gone in seconds derived from scroll speed. It scales every payout down to a floor, and at empty the dirt takes the corpse under. _Avoid_: decay, timer, expiry, TTL.

**Drop**: A permanent upgrade a kill sometimes leaves, priced in kills on a rising curve. Swallowing it levels one weapon line, chosen by the dice. Drops never decay. _Avoid_: powerup, upgrade item, pickup, loot.

**Feast**: A boss-shed reward corpse that never decays, dropped at chunk breaks and at a miniboss death; the death feast is big enough to jump the grave's size. _Avoid_: bonus, health pack, jackpot.

**Treasure**: The never-decaying class of food: drops and feasts. Steady-bright beside fading corpses, so steady-bright always means treasure. _Avoid_: rare drop, special item.

**Overflow**: The payout when a swallow cannot pay its normal way: a maxed weapon line's drop or growth past the ceiling converts to score, radius, or reservoir charge. Nothing swallowed is ever worthless. _Avoid_: waste, surplus, refund.

### The arsenal

**Weapon line**: One of the upgradable weapon systems, leveled one to five by drops. A weapon line owns its own properties: how it fires, whether the run starts with it, and how its levels grow. v1 ships four, the soul stream, the headstones, the wisps and the bell, and the pool is open by design. Each level must look different on screen. Short form "line" is fine once the term is established in a passage. _Avoid_: gun, upgrade track, skill.

**Firing trigger**: How a weapon line fires: always-on, on each swallow, or on its own timer. A property each line owns, never a category of lines. _Avoid_: floor line, burst line, passive weapon, active weapon, proc.

**Birthright**: The weapon lines a run starts with, currently the soul stream and the headstones. Damage at the size floor strips levels back to it. _Avoid_: starting loadout, base weapons.

**Soul stream**: Skulls pouring straight up out of the grave's mouth, in rigid fanned columns, surging after each swallow. It never homes. _Avoid_: main gun, vulcan, primary fire.

**Headstones**: Orbiting stones, last-ditch close defense, in counter-rotating rings at higher levels. _Avoid_: orbitals, satellites, shield.

**Wisps**: Will-o-wisps, fired on each swallow: each swallowed corpse's soul tears loose and hunts. At most one weapon line homes at a time, and a homing line is never always-on, so homing is always bought with a dive. _Avoid_: missiles, seekers, homing shots.

**Bell**: The funeral toll on its own clock: an always-on expanding damage ring, reaching a short way at level one and nearly across the field at level five, with pushback arriving as a higher-level property. Bosses take its damage but never its push. _Avoid_: shockwave, nova, AOE.

**Swallow chime**: The baseline sound and juice of every swallow, firing from the very first swallow regardless of loadout, so the early minutes are never silent. _Avoid_: eat-chime, pickup sound.

**Belch**: The one button. It vomits the full reservoir as a screen-clearing eruption: every mob-fire shot cancelled, big boss damage, no boss push. It fires only at a full reservoir. _Avoid_: bomb, ult, special, screen clear.

**Reservoir**: The capped belch charge, filled by swallows. Charge past full visibly splashes and wastes, so belching is the greedy play. _Avoid_: meter, gauge, mana, energy.

**Storm**: The player's own airborne projectiles at saturation, the bullet heaven the player builds. Mob fire is never the storm. _Avoid_: bullet spam, DPS, firepower.

### The field and the stage

**Field**: The fixed logical playfield the sim runs in. Everything in the sim is field units, never device pixels; the renderer scales the whole field to any screen. The field's dimensions and aspect are tuning numbers, not vocabulary. _Avoid_: screen, viewport, canvas, arena.

**Scroll**: The constant downward drift of everything on the field. The scroll is the corpse deadline and the drop deadline both. _Avoid_: conveyor, drift, gravity.

**Mob**: Any hostile on the field. Live mobs are never food: contact shrinks the grave; only kills leave corpses. _Avoid_: enemy, monster, creature, unit.

**Mob fire**: Every hostile shot on the field, trash shots and boss patterns alike. Mob fire is never confusable with the storm; the render rule that guarantees it is Hungry Grave ADR 0014. _Avoid_: enemy fire, enemy bullets, hellfire.

**Trash**: The ordinary mobs of the authored timeline, as opposed to bosses. _Avoid_: minions, creeps, fodder, popcorn.

**Mob type**: A kind of mob, owning how it moves, whether and how it fires, its health, its corpse payout, and its size. v1 ships three and the pool is open by design. A mob type must be readable before it acts. _Avoid_: enemy class, variant, archetype.

**Template**: A named placement from the library: where a group of mobs arrives and how it is arranged, never which mob type is in it. Each teaches a lesson, and the library is open. The starting six are Drips, the File, the V, the Pincer, the Rain, the Wall. _Avoid_: formation, pattern, spawn type.

**Row**: One entry of the authored timeline: a phase-local time, a template, a placement, and a count. Count lives on the row, so density tuning never edits a template. _Avoid_: spawn event, wave entry, script line.

**Phase**: One segment of the stage, chained to the next by a boundary event rather than an absolute clock, because a shootable boss dies when killed. _Avoid_: act, section, checkpoint.

**Drain-out**: The deliberate spawn silence before a boss, letting the field empty so the boss arrives alone. _Avoid_: lull, break, intermission.

**The Wall**: The feast wave: an edge-to-edge curtain of trash launched by the miniboss's death, deliberately oversized as the loaded belch's target. _Avoid_: swarm wave, horde.

**Stage**: The authored content from first row to final boss; a run is one playthrough of it. _Avoid_: level, map, world.

**Run**: One playthrough of a stage, from its seed roll to sealed shut or victory. _Avoid_: game, session, attempt, playthrough.

**Seed**: The dice a run rolls from. Every fresh run rolls a fresh seed; a seed in the URL pins the run; a run's seed stays visible so it can be shared as a challenge. _Avoid_: RNG state, random seed value.

**Pinned run**: A run whose seed came from the URL, so it replays exactly. The playtest instrument and the shareable challenge. _Avoid_: fixed run, replay.

### Bosses

**Boss**: A hostile that arrives alone on a phase boundary with authored bullet-hell patterns and chunked health. Bosses are always shootable and shed food throughout the fight. _Avoid_: elite, guardian.

**Miniboss**: The mid-stage boss, fought before the feast. _Avoid_: midboss, sub-boss.

**Chunk**: One segment of a boss's health bar, owning one authored pattern, ended by a short invincible flash. _Avoid_: phase (belongs to the stage), health bar segment, stage (of a fight).

**Add**: An ordinary mob summoned by a boss mid-fight. Adds are trash: normal pushback, normal corpses, and they keep the swallow economy alive at the climax. _Avoid_: summon, minion, spawn.

### The build

**Prototype**: A self-contained teaching build in its own folder under its own route, listed by the base app and removable by deleting the folder and its registry entry. It exists to teach and is never extended into the game. _Avoid_: spike, demo, POC, MVP.
