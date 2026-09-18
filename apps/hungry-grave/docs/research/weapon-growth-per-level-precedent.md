# Weapon growth per level: what a shipped rung buys, and what it costs trash

Research for Hungry Grave. Labels: **DOCUMENTED** = a shipped data file, decompiled source, a developer statement, or a modding reference generated from the shipped binary. **COMMUNITY-MEASURED** = a wiki transcription of shipped behaviour, a datamined table, a forum report. **INFERRED** = my reading across sources.

The question this answers: step 4 slice C sets the damage rows a rung buys, and the rows have to come from precedent rather than from a guess. Four things are wanted, in order: the shape shipped games use for damage per level, whether trash ever stops dying in one or two hits over a run, the data rows slice C should carry, and what the ladder ruling implies about where in the ladder the growth sits.

This sits beside [survivor-numbers.md](survivor-numbers.md), [progression-tuning-precedent.md](progression-tuning-precedent.md) and [naming-the-authored-growth-rate.md](naming-the-authored-growth-rate.md). Those already hold the Vampire Survivors enemy health table and its Mad Forest minute schedule, the Halls of Torment ability and defence data, the 20 Minutes Till Dawn spawn sessions, the Deep Rock Galactic: Survivor weapon and creature tables, the axis tallies across all 151 `Weapon.json` entries, the level price curves, and the offer weights. Anything there is cited, never repeated. The new ground here is three things none of them carries: the per-level **damage** table for the five starting Vampire Survivors weapons read as increments rather than as an axis tally, the **ratio** of player damage growth to enemy health growth over a run, and the **hits-to-kill curve** that falls out of both, computed for this game's own mobs against this game's own lines.

---

## What is solid

These are the claims I would build on.

1. **The genre's damage-per-level increment sits between +25% and +50% of the level-1 value per step, and it is delivered either as a flat add on the base or as a multiplicative step, never as a compounding curve fitted to a formula.** HoloCure's Psycho Axe steps `damage1 = {{ls|1=1.2|2=1.56|4=2.07|7=3.11}}`, which is x1.30, x1.327 and x1.502 (<https://holocure.wiki.gg/wiki/Psycho_Axe>). Deep Rock Galactic: Survivor's damage card is "+10% / 15% / 25% / 35% / 50% damage" by rarity, stacking additively so "two 50% bonuses are effectively a 100% increase from the base value, not 225%" (<https://deeprockgalactic.wiki.gg/wiki/Survivor:Mid-dive_Upgrades>, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Weapons>). 20 Minutes Till Dawn's five damage upgrades are +40%, +45%, +20%, +15% and +10% (<https://20minutestilldawn.wiki.gg/wiki/Upgrades>). Vampire Survivors ships flat adds sized as a large fraction of base: the Whip is `{"power": 0.5}` six times on a base of `1`, so +50% of base per step. DOCUMENTED.

2. **Base to max on damage alone is 2.5x to 4x, and it takes six or seven steps to get there.** Vampire Survivors, summing the shipped deltas in `Weapon.json`: Whip 1 to 4.0 (4x), Magic Wand 1 to 3 (3x), Knife 0.65 to 1.65 (2.54x), Garlic 0.5 to 1.5 (3x), Santa Water 1 to 4.0 (4x), all across seven level steps. HoloCure's Psycho Axe is 2.59x across six. Brotato's four weapon tiers run 2.00x (Wrench) to 4.17x (Pistol). DOCUMENTED, sources in section 1.

3. **Damage is the minority axis on a rung everywhere it was counted.** HoloCure spends 12 of 44 attribute mentions across six weapons on damage, 27%; count takes 20%, area 18%, a new effect 14%. 20 Minutes Till Dawn puts a flat damage percentage on 5 of its 100 upgrades, and two more upgrades **subtract** damage to buy projectiles (Double Shot: Projectiles +1, Bullet Damage -10%; Fusillade: Projectiles +1, Bullet Damage -25%). Deep Rock Galactic: Survivor offers exactly one damage card out of the five card types a projectile weapon can draw. Vampire Survivors grants `power` 154 times against `amount` 141 and `area` 108 across all 151 weapons, and `amount` is the level-2 upgrade 29 times against `power`'s 12 ([survivor-numbers.md](survivor-numbers.md)). DOCUMENTED.

4. **A whole ladder buys 8x to 16x of throughput, not 3x, and the difference between the damage ratio and the throughput ratio is where the other axes went.** Vampire Survivors level 8 against level 1, multiplying power by amount by rate: Whip x8.0, Magic Wand x14.4, Knife x15.2, Santa Water x16.0, Garlic x3.9 on power and cadence alone with an area scalar doubling on top. HoloCure's Psycho Axe is 2.59x on damage and 3.24x on sustained rate once the 240-to-192-frame attack time is counted. Brotato's tier IV against tier I is 2.48x to 6.92x on DPS. DOCUMENTED, computed from the tables in section 1.

5. **Vampire Survivors' evolution is not a damage step.** Four of five evolutions inherit the max-level base weapon's `power` verbatim: Bloody Tear 4 against a maxed Whip's 4.0, Holy Wand 3 against 3, Thousand Edge 1.65 against 1.65, La Borra 4 against 4.0. Only Soul Eater moves it, 1.5 to 2, x1.33. The reward is paid in cadence, speed, area, uptime and a new behaviour: Holy Wand halves `interval` 1000 to 500, Thousand Edge takes it 1000 to 350, La Borra takes `duration` 3000 to 4000 against an `interval` of 4000 for continuous uptime, Bloody Tear adds "Restores 8 HP/attack if it hits any enemies with a crit". DOCUMENTED (`Weapon.json`, <https://vampire.survivors.wiki/w/Bloody_Tear>).

6. **The gate on the evolution is the whole ladder, stated as a rule.** The wiki's evolution rule verbatim: "The player must have a fully leveled base weapon and its counterpart (required level varies by case) in their inventory" (<https://vampire.survivors.wiki/w/Evolution>). HoloCure gates its Awakening at weapon level 7, the top rung, and its collabs behind a maxed main weapon plus a maxed item (<https://holocure.wiki.gg/wiki/Weapon>). 20 Minutes Till Dawn's weapon evolution lands at character level 20 (<https://20minutestilldawn.wiki.gg/wiki/Weapon_Evolutions>). So three games back-load a **kind** change onto the top of the ladder while keeping the numeric steps below it even. DOCUMENTED.

7. **Where a numeric curve is back-loaded, the back-loading is modest and the last step is roughly 1.5x against 1.3x for the steps before it, never a cliff.** HoloCure's Psycho Axe: x1.30, x1.327, x1.502. Brotato back-loads three of five weapons checked (Knife x1.5, x1.333, x1.667; SMG x1.333, x1.25, x1.6; Pistol x1.667, x1.5, x1.667) and front-loads two (Wrench x1.333, x1.25, x1.2; Screwdriver x1.5, x1.333, x1.25). Vampire Survivors is even (the Whip's six identical +0.5 steps) or front-loaded (Santa Water +1, +1, +0.5, +0.5). DOCUMENTED, computed from the tables in section 1.

8. **Two of the five games refuse to let enemy health grow on the clock at all during the main run, and both are the ones this game most resembles.** Vampire Survivors' Mad Forest carries no `TimeMods` block in normal mode: its `mods` is `{"TimeLimit": 1800, "ClockSpeed": 1, "PlayerPxSpeed": 1.1, "EnemySpeed": 1.1, "ProjectileSpeed": 1, "GoldMultiplier": 1, "EnemyHealthMultiplier": 1, "LuckBonus": 0, "XPBonus": 1}`, and the `hpPerMinute` figure lives under `inverse`. Deep Rock Galactic: Survivor has no time-based or stage-based health scaling; difficulty arrives through named mutators at +10%, +20%, +30% and +50% health. DOCUMENTED (`Stage.json`, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Mutators>).

9. **Where per-minute health growth does ship, it is additive on the base multiplier and it runs +0.05 to +0.25 per minute, and it is a minority of stages.** Six of Vampire Survivors' 24 stages carry a `TimeMods` block under `mods`, so in normal play: BONEZONE `{"start": 0, "hpPerMinute": 0.15, "speedPerMinute": 0.025}`, COOP `hpPerMinute: 0.25`, BATCOUNTRY, TOWERBRIDGE, ASTRALSTAIR and EX_MAZERELLA at `0.1`. Under `inverse`, 21 stages carry one and 19 are the identical `{"start": 0, "hpPerMinute": 0.05, "speedPerMinute": 0.005}`. It applies as `hp x (EnemyHealthMultiplier + hpPerMinute x minutes)`, which the wiki states as "enemies start with +200% HP and acquire +5% HP and +0.5 movement speed per minute. This effect is additive with other enemy bonus modifiers" (<https://vampire.survivors.wiki/w/Stages>). DOCUMENTED.

10. **Brotato is the one game that grows every enemy's health on a clock, and it is strictly linear for the whole 20-wave run.** `Brotato/entities/units/unit/stats.gd` verbatim: `func get_base_health(wave: int) -> int: return health + health_increase_each_wave * (wave - 1)`. Danger levels multiply on top, and Danger 1 and 2 add no health at all: only Danger 3, 4 and 5 carry `danger_enemy_health` of 12, 26 and 40. The quadratic blow-up is quarantined in `get_endless_factor`, which returns 1.0x at wave 20. DOCUMENTED.

11. **Roster substitution does far more of the work than any clock does, in every game where both exist.** Mad Forest goes from `["BAT3"]` at `maxHp: 0.5` in minute 0 to `XLMUMMY` at `maxHp: 50` by minute 17, a 100x step delivered in discrete jumps at the 5, 10, 12, 17 and 20 minute boundaries, against a per-minute curve that would contribute `1 + 0.05 x 17 = 1.85x` if it were switched on. Deep Rock Galactic: Survivor's creature table spans 80 to 16,500 health, a 206x spread carried entirely by which bug spawns. Halls of Torment's decompiled `StartHealth` fields jump by orders of magnitude between named monster files. DOCUMENTED.

12. **Whether trash stops dying in one or two hits splits the field, and it splits on whether the game has a second growth channel.** Vampire Survivors' trash line stays at 0.5 to 3 health across a 30-minute run against a Whip growing 1 to 4, so it never stops dying in one hit; Deep Rock Galactic: Survivor's trash sits at its base health at every hazard. HoloCure's trash runs 8 to 3000 health, 375x, against a weapon damage ladder of 2.59x, and 20 Minutes Till Dawn's runs 24 to 500, 21x, against a starter revolver that never levels at all. The two that let trash outgrow the weapon close the gap with six weapon slots, an ATK stat, items and collabs, which is a channel this game does not have. DOCUMENTED for the numbers, INFERRED for the split.

13. **Today this game has no damage growth on any rung at all, and no health growth on any clock.** Every line's ladder is count, coverage or cadence: `COLUMNS_BY_LEVEL` on the skull stream, `WISPS_BY_LEVEL` on the wisps, `RADIUS_BY_LEVEL` with `REHIT_BY_LEVEL` on Territory, `BELL_CONE_ROWS` on the bell. `SKULL_DAMAGE`, `WISP_DAMAGE`, `TERRITORY_DAMAGE`, `BELL_DAMAGE_NEAR` and `BELL_DAMAGE_FAR` are single constants with no level index, and `MOB_TYPES` carries three fixed `hp` rows read once at spawn (`mobs.ts:284`). DOCUMENTED, section "Where the game is".

14. **The load-bearing arithmetic for slice C is one number: at Vampire Survivors' smallest shipped rate, +0.05 per minute, this game's mow body leaves the one-skull kill at minute 2.5.** A shambler at 8 health against a skull at 8 damage needs `8 x (1 + 0.05m) > 8`, which is true for any `m > 0`, and crosses the second whole skull at `m = 0`+ and the third at `m = 8`. Rounded to whole touches it is 2 skulls from the first minute the multiplier is nonzero. Any nonzero per-minute health row on the mow body contradicts ADR 0059's one-skull ruling inside the first section. INFERRED from the shipped rate and the repo constants.

---

## Where the game is

Every figure here is read off the source. `TICK_HZ` is 60 (`src/game/clock.ts:4`), so a tick is 1/60 of a second.

**The ladder.** `MAX_LEVEL` is 5 and `BIRTHRIGHT_LEVEL` is 1, with the skull stream the only birthright line (`src/game/lines/roster.ts:14`, `:16`, `:19`). `carriersForFullBuild` is `(MAX_LEVEL - BIRTHRIGHT_LEVEL) * 1 + MAX_LEVEL * 3`, which is 19 rungs (`src/game/carriers.ts:31`), and the schedule holds `ceil(19 * 1.3)` = 25 carriers (`src/game/carriers.ts:45`, `:53`). A rung is gained only by taking a body from a dead carrier's offer: `resolveOffer` is the single site that writes `state.levels[line] += 1` (`src/game/offer.ts:322`), and a maxed line is never offered (`src/game/offer.ts:61`). Over an eight-to-ten-minute stage (ADR 0049) that is roughly two rungs a minute across four lines.

**The four lines, per rung.**

| Line | Damage | Rate | What the rung actually buys |
|---|---|---|---|
| Skull stream | `SKULL_DAMAGE = 8`, flat (`skullStream.ts:86`) | `STREAM_INTERVAL = 18` ticks, 0.3 s, flat; `SURGE_INTERVAL = 6` (`skullStream.ts:41`, `:81`) | `COLUMNS_BY_LEVEL = [0, 1, 2, 3, 4, 5]` (`skullStream.ts:25`) |
| Wisps | `WISP_DAMAGE = 10`, flat (`wisps.ts:71`) | per swallow, not a timer | `WISPS_BY_LEVEL = [0, 1, 3, 5, 8, 11]` (`wisps.ts:41`) |
| Territory | `TERRITORY_DAMAGE = 5`, flat (`territory.ts:125`) | `REHIT_BY_LEVEL = [0, 80, 62, 48, 38, 30]` ticks; a lay every `TERRITORY_PERIOD = 832` (`territory.ts:155`, `:37`) | `RADIUS_BY_LEVEL = [0, 32, 43, 58, 77, 104]`, `PULL_BY_LEVEL`, `SLOW_BY_LEVEL` (`territory.ts:62`, `:170`, `:182`) |
| Bell | `BELL_DAMAGE_NEAR = 40`, `BELL_DAMAGE_FAR = 5`, both flat (`bell.ts:111`, `:114`) | `BELL_PERIOD = 180` ticks, 3 s, flat (`bell.ts:50`) | `BELL_CONE_ROWS`, cones 1 to 5, half-angle 45 to 33 degrees, reach 160 to 261 (`bell.ts:101`) |

**What a full ladder buys today**, level 5 against level 1: skull stream **x5.0** (columns), wisps **x11.0** (souls a swallow), Territory **x10.6** on claimed area and **x2.67** on per-target pulse rate, bell **x9.8** on swept area per toll. Against the genre's x8 to x16 (claim 4) the skull stream is the short ladder and Territory the long one.

**The mobs.** `shambler` 8 health, `ghoul` 20, `revenant` 64 (`src/game/mobs.ts:77`, `:110`, `:91`). The rows are fixed constants copied at spawn, `mob.hp = row.hp` (`src/game/mobs.ts:284`); a repo-wide grep for `healthPerMinute`, `hpPerMinute`, `healthScal` and `hpScaling` returns nothing, so nothing in the build grows a mob's health with the clock.

**Today's hits to kill**, at every rung, because no line's damage moves with level. These are pinned by `src/game/__tests__/touchCounts.test.ts` and are the ruled counts under ADR 0059, not a reading:

| Mob | Health | Skull | Wisp | Territory pulse | Toll at the grave | Toll at the far edge |
|---|---|---|---|---|---|---|
| Shambler | 8 | **1** | **1** | 2 | 1 | 2 |
| Ghoul | 20 | 3 | 2 | 4 | 1 | 4 |
| Revenant | 64 | 8 | 7 | 13 | 2 | 13 |

The shambler already dies to one skull and one wisp at rung one, which is the ceiling of what a damage row can do for the mow body: no damage lane can make a one-touch kill faster. Any damage rows slice C writes bite on the ghoul and the revenant only, unless the health row moves first.

---

## 1. What shape shipped games use for damage per level

### Vampire Survivors: flat adds on the base, on most steps, from `Weapon.json` (DOCUMENTED)

Levels 2 to 8 are deltas, not absolutes; index 0 is the only complete record. Confirmed two ways: `WHIP` level 2 is `{"amount": 1}` against a wiki max Amount of "2 (+1)", and summing the seven `power` deltas gives 4.0 against a wiki max-damage of "40 (+30)" on a displayed base of 10, the /10 convention [survivor-numbers.md](survivor-numbers.md) already records.

```
WHIP     L1 {"interval": 1350, "power": 1, "area": 1, "amount": 1, "critChance": 0.2, "critMul": 2}
         L2 {"amount": 1}   L3 {"power": 0.5}   L4 {"power": 0.5, "area": 0.1}
         L5 {"power": 0.5}  L6 {"power": 0.5, "area": 0.1}
         L7 {"power": 0.5}  L8 {"power": 0.5, "addEvolvedWeapon": "VAMPIRICA"}

MAGIC_MISSILE  L1 {"interval": 1200, "power": 1, "amount": 1, "penetrating": 1}
         L2 {"amount": 1}   L3 {"interval": -200}   L4 {"amount": 1}
         L5 {"power": 1}    L6 {"amount": 1}        L7 {"penetrating": 1}
         L8 {"power": 1, "addEvolvedWeapon": "HOLY_MISSILE"}

KNIFE    L1 {"interval": 1000, "power": 0.65, "amount": 1, "penetrating": 1, "critChance": 0.3, "critMul": 3}
         L2 {"amount": 1}   L3 {"amount": 1, "power": 0.5}   L4 {"amount": 1, "repeatInterval": -20}
         L5 {"penetrating": 1}   L6 {"amount": 1, "repeatInterval": -20}
         L7 {"amount": 1, "power": 0.5}   L8 {"penetrating": 1, "repeatInterval": -20, ...}

GARLIC   L1 {"interval": 1300, "duration": 1300, "power": 0.5, "area": 1, "knockback": 0}
         L2 {"area": 0.4, "power": 0.2}   L3 {"interval": -100, "power": 0.1}
         L4 {"area": 0.2, "power": 0.1}   L5 {"interval": -100, "power": 0.2}
         L6 {"area": 0.2, "power": 0.1}   L7 {"interval": -100, "power": 0.1}
         L8 {"area": 0.2, "power": 0.2, "addEvolvedWeapon": "VORTEX"}

HOLYWATER  L1 {"interval": 4500, "power": 1, "area": 1, "amount": 1, "duration": 2000, "hitBoxDelay": 500}
         L2 {"amount": 1, "area": 0.2}   L3 {"power": 1, "duration": 500}
         L4 {"amount": 1, "area": 0.2}   L5 {"power": 1, "duration": 250}
         L6 {"amount": 1, "area": 0.2}   L7 {"power": 0.5, "duration": 250}
         L8 {"power": 0.5, "area": 0.2, "addEvolvedWeapon": "BORA"}
```

Source: <https://github.com/Dezzelshipc/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Weapon.json>. The wiki's rendered versions agree: <https://vampire.survivors.wiki/w/Whip>, `/Magic_Wand`, `/Knife`, `/Garlic`, `/Santa_Water`.

Read as increments on the level-1 value: the Whip is +50% of base six times; the Magic Wand is +100% of base twice; the Knife is +77% of base twice; Garlic is +40%, +20%, +20%, +40%, +20%, +20%, +40%; Santa Water is +100%, +100%, +50%, +50%. Every one of them is a flat add to the base value, so the damage curve is **linear in level** and the increments are sized as a large fraction of the base rather than as a small compounding percentage.

The end ratios and how the rest of the ladder is spent:

| Weapon | power | amount | rate | area | ladder throughput |
|---|---|---|---|---|---|
| Whip | 1 to 4.0, **x4.0** | 1 to 2 | flat | 1 to 1.2 | **x8.0** |
| Magic Wand | 1 to 3, **x3.0** | 1 to 4 | 1200 to 1000 ms | flat | **x14.4** |
| Knife | 0.65 to 1.65, **x2.54** | 1 to 6 | repeat 100 to 40 ms | flat | **x15.2** |
| Garlic | 0.5 to 1.5, **x3.0** | flat | 1300 to 1000 ms | 1 to 2.0 scalar | **x3.9** before area |
| Santa Water | 1 to 4.0, **x4.0** | 1 to 4 | flat | 1 to 1.8 | **x16.0** |

### HoloCure: stepped percent, multiplicative, and it back-loads (DOCUMENTED)

Seven levels, six steps. Damage is stored as a multiplier and level-up weapon multipliers "stack multiplicatively" (<https://holocure.wiki.gg/wiki/Damage>). Psycho Axe, the full table from the wiki's own datamined fields `damage1 = {{ls|1=1.2|2=1.56|4=2.07|7=3.11}}`, `attackTime1 = {{ls|1=240|3=192}}`, `area1 = {{ls|1=1|2=1.2|4=1.44|6=2.16}}`, `hitLimit1 = {{ls|1=10|5=-1}}`, `duration1 = {{ls|1=180|5=240}}`:

| Level | Damage | Attack time | Hit limit | Area | Duration |
|---|---|---|---|---|---|
| 1 | 120% | 240 frames, 4 s | 10 | 100% | 180 |
| 2 | 156% (**x1.30**) | 240 | 10 | 120% | 180 |
| 3 | 156% | 192, 3.2 s | 10 | 120% | 180 |
| 4 | 207% (**x1.327**) | 192 | 10 | 144% | 180 |
| 5 | 207% | 192 | infinite | 144% | 240 |
| 6 | 207% | 192 | infinite | 216% | 240 |
| 7 | 311% (**x1.502**) | 192 | infinite | 216% | 240 |

Base to max is 2.59x on damage and 3.24x on sustained rate. Damage moves on three of six steps and the largest step is the last. Other weapons on the same page family: Axe Swing `{{ls|1=1.2|2=1.56|5=2}}` is 1.67x, Bright Star `{{ls|1=0.8|2=1}}` is 1.25x with growth going into count, Pistol Shot `{{ls|1=1|3=1.2|6=1.44}}` is 1.44x with count 3 to 5.

### Brotato: four hand-tuned tiers, no shared multiplier (DOCUMENTED)

`weapons/weapon_stats/weapon_stats.gd` verbatim: `export(int) var cooldown := 60 # ticks - we have 60 ticks per second`. Damage and cooldown per tier from `Brotato/weapons/{melee,ranged}/<name>/<tier>/<name>_stats.tres`:

| Weapon | damage T1 to T4 | T4/T1 | cooldown ticks | DPS T1 | DPS T4 | DPS ratio |
|---|---|---|---|---|---|---|
| Pistol | 12, 20, 30, 50 | **x4.17** | 60, 55, 50, 40 | 12.0 | 75.0 | x6.25 |
| SMG | 3, 4, 5, 8 | **x2.67** | 4, 4, 4, 3 | 45.0 | 160.0 | x3.56 |
| Knife | 6, 9, 12, 20 | **x3.33** | 27, 22, 18, 13 | 13.3 | 92.3 | x6.92 |
| Wrench | 12, 16, 20, 24 | **x2.00** | 67, 63, 58, 54 | 10.7 | 26.7 | x2.48 |
| Screwdriver | 8, 12, 16, 20 | **x2.50** | 31, 28, 26, 20 | 15.5 | 60.0 | x3.88 |

Crit rises with tier as well: Knife `crit_chance` 0.2 / 0.3 / 0.4 / 0.5 and `crit_damage` 2.5 / 3.0 / 3.5 / 4.0. The per-tier step is authored per weapon rather than shared, which is why the damage ratios spread 2.0x to 4.2x across five weapons.

The absolute damage column is build-specific and the ratios are not: the decompiled build and both community wikis agree on cooldown, crit and stat scaling and diverge on damage by a consistent 1.25x to 1.5x (repo Knife 6/9/12/20 against wiki 9/13/18/25). Two independent wikis agreeing against the decompile reads as a balance-version gap rather than a misread. Sources: <https://github.com/Yeet195/BrotatoDecompiled>, <https://brotato.wiki.spellsandguns.com/Weapons>.

### Deep Rock Galactic: Survivor and 20 Minutes Till Dawn: no per-weapon damage ladder at all (DOCUMENTED)

Deep Rock Galactic: Survivor's weapon level is a counter rather than a stat table. Each upgrade card taken raises the level by 1 and the card is drawn from a fixed pool with five rarity tiers, of which exactly one type is raw damage: "Bigger Cogs, +10% / 15% / 25% / 35% / 50% damage". The others are fire rate, reload, pierce, potency, range, and a card called Paint Job that does nothing at all but grants +2 or +3 levels. Overclock choices land at weapon level 6, 12 and 18. The stat formula is `Stat = ((Base x Skill) + Flat) x Meta x Overclock x Artifact`, with card damage inside the additive `Skill` term. Sources: <https://deeprockgalactic.wiki.gg/wiki/Survivor:Mid-dive_Upgrades>, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Weapons>.

20 Minutes Till Dawn has no weapon levels. Five of its 100 upgrades carry a flat damage percentage: Power Shot +40%, Big Shot +45%, Reaper Rounds +20%, Sniper +15%, Scythe Mastery +10%. Two more trade damage away for projectiles. Runes, the permanent meta layer, are +2% per rank to a 10% maximum. Source: <https://20minutestilldawn.wiki.gg/wiki/Upgrades>, <https://20minutestilldawn.wiki.gg/wiki/Runes>.

### Halls of Torment: a branching tree with a penalty on nearly every strong branch (COMMUNITY-MEASURED)

Ten ability levels, and at each the player picks one of two to four named branches rather than receiving a step. Lightning Strike's level X, verbatim from a community scrape of the wiki's trait tables:

```json
"X": {
  "Capacity":     { "Base Damage (Ability)": "+100", "Effect On Hit Chance (Ability)": "-50%" },
  "Charges":      { "Lightning Strike (Ability)": "+2", "Damage (Ability)": "-20%" },
  "Conductivity": { "Base Crit Chance (Ability)": "+0.2", "Area (Ability)": "+30%", "Attack Speed (Ability)": "-10%" },
  "Repercussion": { "Electrify Chance (Ability)": "+100%", "Base Damage (Ability)": "-50" }
}
```

Every branch mixes a flat additive damage number, a percentage, and a stepped unlock, and nearly every strong branch carries an explicit negative on another stat, which [survivor-numbers.md](survivor-numbers.md) already records as "roughly half of all traits carry an explicit penalty". A base-to-max ratio is not computable: no source publishes an ability's level-1 base damage. Source: <https://raw.githubusercontent.com/gizix/HoT_SkillTracker/windows-exe/app/static/data/h_o_t_traits.json>.

### Recommendation

**The shape is a stepped increment on the level-1 value, in the +25% to +50% band, applied to a minority of the rungs, against a full-ladder throughput of 8x to 16x carried mostly by count, coverage and cadence.** Whether the step is added flat (Vampire Survivors) or multiplied (HoloCure) barely matters at four rungs: +50% of base flat four times is 3x, and x1.32 four times is 3.0x. What does matter is that no shipped game fits a formula to the ladder. Every one of them authors the row per weapon and per level, which is what makes the damage lane a set of data rows rather than a curve, and is the same conclusion [naming-the-authored-growth-rate.md](naming-the-authored-growth-rate.md) reached for spawn schedules.

---

## 2. Whether trash ever stops dying in one or two hits

### The two games that refuse to let it

**Vampire Survivors.** Mad Forest's trash line is 0.5 health at minute 0 (`BAT3`), 1 at minute 8 (`ZOMBIE`), 1.5 at minute 11 (`SKELETON`) and 3 at minute 21 (`FLOWER`), against a Whip going 1.0 to 4.0. That is one hit at every point in the run, with the overkill margin growing rather than shrinking. The 100x climb to `XLMUMMY` at 50 health belongs to a **tougher type standing beside the trash**, not to the trash. The game deliberately steps trash health back down at its densest minutes: minute 8 is `ZOMBIE` at 1 health with a live minimum of 100, minute 11 is `SKELETON` at 1.5 with a minimum of 300 and a 0.1-second interval, minute 21 is `FLOWER` at 3 with 300. [survivor-numbers.md](survivor-numbers.md) records the same finding from the other side and this record adds the weapon column to it. DOCUMENTED (`Stage.json`, `Enemy.json`, <https://vampire.survivors.wiki/w/Mad_Forest>).

**Deep Rock Galactic: Survivor.** There is no time-based or stage-based health scaling. Difficulty arrives as named mutators, Hardened Carapace I/II/III at +10% / +20% / +30% health and the top tier at +50%, and as a 206x roster spread from an 80-health Fast Grunt to a 16,500-health Dreadnought. A build that reaches the one-shot state on trash stays there. DOCUMENTED (<https://deeprockgalactic.wiki.gg/wiki/Survivor:Mutators>, the `SurvivorCreaturesStats` Cargo table).

### The two games that let it, and what closes the gap

**HoloCure.** Stage 1 trash runs Chumbud 8 health at 0:00, Takodachi 80 at 3:00, Investi-Gator 180 at 6:30, Kronie 450 at 12:00, Sapling 900 at 15:45, Swarming King Kronie 3000 at 19:00. That is 125x to 375x against a weapon damage ladder of 2.59x. Trash absolutely stops dying in one hit to any single weapon. The gap is closed by six weapon slots, an ATK stat, items, weapon Awakening and collabs, of which MiComet against a maxed Psycho Axe is roughly three times the hit rate at similar per-hit damage plus a persistent ground pool. DOCUMENTED (<https://holocure.wiki.gg/wiki/Stage_1_-_Grassy_Plains>, <https://holocure.wiki.gg/wiki/MiComet>).

**20 Minutes Till Dawn.** The Forest's common trash is 24 health at 0:00, 30 at 3:00, 60 at 6:00, 80 at 8:00, then a tougher type takes the trash role at 200 to 500 for the back half. The free starter Revolver does 20 damage and never levels: two shots at minute 0, twenty-five shots against the 500-health late trash. The build has to grow roughly 25x out of a pick pool that puts flat damage on 5 of 100 upgrades, so the answer is piercing, summons, on-kill explosions and a level-20 evolution rather than a bigger number. DOCUMENTED (<https://20minutestilldawn.wiki.gg/wiki/Forest>, <https://20minutestilldawn.wiki.gg/wiki/Upgrades>).

### The structural reason it splits, and which side this game is on

INFERRED, and this is the part that decides slice C.

A game may let trash outgrow one weapon's ladder only if it has a second growth channel wide enough to close a 20x to 400x gap: more weapon slots, a global damage stat, items, and an evolution. HoloCure and 20 Minutes Till Dawn have all four. Vampire Survivors has them too and still declines to use them on trash, which is the stronger evidence, because it shows the choice is a design preference rather than a constraint.

Hungry Grave has none of them. Four lines is the whole build, there is no global damage stat, there are no items, and there is no evolution. The entire growth channel is 19 rungs across four ladders. Whatever those ladders buy is all the growth there is, so a trash health curve that outruns them has nothing behind it to close the gap. That puts this game structurally on the Vampire Survivors and Deep Rock Galactic: Survivor side of the split, and ADR 0059 has already ruled it there from the play side: "density is bought with weak bodies, never tough ones."

---

## 3. How enemy health grows beside the player, as a ratio

**Vampire Survivors, Mad Forest, normal mode.** Enemy health growth from the clock is exactly 1.0x for the whole 30 minutes, because there is no `TimeMods` block outside `inverse`. Player damage growth on one weapon is 4x on `power` and 8x on throughput, and the player fields six weapons. The ratio of player growth to trash health growth is therefore unbounded in the player's favour, and the game spends the difference on count: the live minimum goes 15 to 300 and the spawn interval 1000 ms to 100 ms.

**Vampire Survivors, The Bone Zone, the steepest normal-mode curve shipped.** `hpPerMinute: 0.15` additive gives `1 + 0.15 x 30 = 5.5x` at minute 30 against a Whip at 4x on damage and 8x on throughput, times six slots. Player growth still wins comfortably.

**Vampire Survivors, Mad Forest Inverse, the mode where the curve is switched on.** `EnemyHealthMultiplier: 2` with `hpPerMinute: 0.05` gives `2 + 0.05 x 30 = 3.5x` at minute 30. The genre's per-minute health curve is a hard-mode garnish on top of roster substitution, never the main line.

**Brotato.** Enemy health is linear in wave and the player's is a step function in tiers. A Chaser is `1 + 1.0 x (wave - 1)`, so 1 at wave 1 and 20 at wave 20, a 20x climb; a Pistol goes 12 to 50 damage and 12 to 75 DPS, a 6.25x climb, and the player also carries up to six weapons and a full stat sheet. Danger 1 and 2 add no health at all, which is Brotato's own statement that the first two difficulty steps are variety rather than durability.

**HoloCure and 20 Minutes Till Dawn** invert it, at 375x and 21x on trash health against 2.6x and 1.0x on a single weapon, as section 2 records.

**The curve, stated for this game.** Over an eight-to-ten-minute stage the player gains 19 rungs, roughly two a minute, and a single line reaches its ceiling after four or five of them. If a line's ladder buys the genre's 8x to 16x, the player's throughput roughly doubles every two to three minutes early and flattens once lines max. Against that, a health curve of +0.05 per minute is +45% over nine minutes and +0.25 per minute is +225%. Both are far inside the player's curve, which is the shape every shipped game holds: **the player's growth outruns the clock's, and the clock's job is to keep the field interesting rather than to keep the trash alive.**

---

## 4. Recommended data rows for slice C

Every row here is stated as one thing against another and never as a target, on ADR 0053's constraint that the harness reports "this build against that build, this configuration against that one, never this number against a target". Each row names what it is traded against, so a later reading can move it in a direction rather than toward a number.

### The damage lane per rung

The precedent band is a step of +25% to +50% of the level-1 value, on a minority of rungs, to a base-to-max ratio of 2.5x to 4x (claims 1 and 2). This game has four steps against the genre's six or seven, so holding the genre's end ratio means larger steps, and holding the genre's step size means a smaller end ratio. The recommendation takes the second trade, at **+25% of base per rung to a 2x ceiling**, against the alternative of +50% per rung to 3x, for one reason: the skull stream's own ladder is already the genre's shortest at x5.0 throughput (claim 13), and a x2 damage lane over the top of it lands the line at x10, inside the x8 to x16 band, where a x3 lane would put it at x15 and make the stream the strongest ladder in the game rather than the workhorse.

| Rung | Skull | Wisp | Territory pulse | Toll at the grave | Toll at the far edge |
|---|---|---|---|---|---|
| 1 | 8 | 10 | 5 | 40 | 5 |
| 2 | 10 | 12 | 5 | 56 | 7 |
| 3 | 12 | 15 | 5 | 72 | 9 |
| 4 | 14 | 17 | 5 | 88 | 11 |
| 5 | 16 | 20 | 5 | 104 | 13 |

Four notes on the rows, each naming what it is traded against.

**The Territory column is flat because a ruling holds it flat, not because precedent does.** ADR 0044 as amended on 2026-08-28: "The ruled per-mob touch counts are untouched, a shambler is still eight pulses, and only the time the ground takes to deliver them moves with the level." Territory's rung already buys area, pull, slow and pulse rate, which is a x10.6 footprint and a x2.67 rate, the longest ladder in the game. A damage lane on top would need that ruling reopened, and this record does not reopen it.

**The bell column moves in steps of 16 near and 2 far because a test pins the ratio.** `touchCounts.test.ts` asserts `BELL_DAMAGE_FAR * 8 === BELL_DAMAGE_NEAR`, so the near figure must stay a multiple of 8 and the far figure follows it. +40% of base per rung is the smallest step that keeps both whole and lands the bell at x2.6, which is where the genre's damage ratios cluster. ADR 0036 explicitly leaves this open: "Angles, reach, damage and push per level are tuning rows, never numbers this record carries."

**The skull stream column runs into ADR 0058's wording rather than a ruling.** That record says freshness scales the surge in volleys "rather than how wide it fires, because the column count is exactly what draws the line's five levels". A damage lane means columns are no longer exactly what draws them. The record's own subject is which axis freshness scales, not whether damage may grow, so this is a wording collision rather than a contradiction, and it is named here so the orchestrator decides it rather than the code.

**The wisp column is the one with no ruling in its way.** ADR 0058 rules that the wisps pay in souls and freshness scales the count; nothing rules the damage a wisp carries.

### The health step

The precedent is unambiguous about form and about size. On form, ADR 0060 as re-ruled on 2026-09-09 says growth is "authored as stepped values and never as a ramp" and that it "steps enemy health on the clock as well as arrivals", and the build has no absolute stage clock at all: the seven phases chain on events, not on minutes (`src/game/stage/stage.ts:96`). So the honest row is a **stepped multiplier per section**, not a per-minute rate, and the per-minute figure is what sizes the step.

On size, Vampire Survivors' shipped rates are +0.05 per minute in Inverse across 19 stages and +0.10 to +0.25 across the six normal-mode stages that use one, applied as `hp x (base + rate x minutes)` (claim 9). At three nominal minutes per section, +0.05 per minute is a section step of x1.00, x1.15, x1.30.

| Section | Health multiplier | Equivalent per-minute rate |
|---|---|---|
| Procession | x1.00 | 0.05, at minute 0 |
| Crowd | x1.15 | 0.05, at minute 3 |
| Vigil | x1.30 | 0.05, at minute 6 |

**And the mow body is exempt from it.** This is the trade the whole record turns on. A shambler at 8 health against a skull at 8 damage costs one skull, which is ADR 0059's ruling and is pinned in `touchCounts.test.ts`. Any multiplier above 1.00 on that row makes it two skulls, at every rung, because a whole touch is `ceil(hp / damage)`. Applied to all three types, the smallest shipped rate takes the mow body off its one-skull kill in the second section and never gives it back. Applied to the ghoul and the revenant only, the step costs the ghoul one extra skull by the Vigil and the revenant three, and the mow stays a mow. The exemption is not an invention: Deep Rock Galactic: Survivor ships trash that does not scale with difficulty at all while elites go to 1.3x and the boss to 1.4x, and Mad Forest steps its trash health **down** at its densest minutes.

The alternative, stated so it is a choice rather than an omission: put the step on every type and let the mow body cost two skulls from the Crowd onward. That buys a visibly tougher trash body in the back half and it spends ADR 0059's ruling to do it.

### The hits-to-kill curve that results

Against the recommended damage lane, a health step of x1.00 / x1.15 / x1.30 on the ghoul and revenant with the shambler exempt, and a line at rung 1 at minute 0, rung 2 at minute 3 and rung 3 at minute 6, which is what two rungs a minute across four lines buys:

| Minute | Rung | Mob | Health | Skull | Wisp | Pulse | Toll near | Toll far |
|---|---|---|---|---|---|---|---|---|
| 0 | 1 | Shambler | 8.0 | **1** | **1** | 2 | 1 | 2 |
| 0 | 1 | Ghoul | 20.0 | 3 | 2 | 4 | 1 | 4 |
| 0 | 1 | Revenant | 64.0 | 8 | 7 | 13 | 2 | 13 |
| 3 | 2 | Shambler | 8.0 | **1** | **1** | 2 | 1 | 2 |
| 3 | 2 | Ghoul | 23.0 | 3 | 2 | 5 | 1 | 4 |
| 3 | 2 | Revenant | 73.6 | 8 | 7 | 15 | 2 | 11 |
| 6 | 3 | Shambler | 8.0 | **1** | **1** | 2 | 1 | 1 |
| 6 | 3 | Ghoul | 26.0 | 3 | 2 | 6 | 1 | 3 |
| 6 | 3 | Revenant | 83.2 | 7 | 6 | 17 | 2 | 10 |

The shape to read off it: the mow body holds at one touch on both projectile lines for the whole run, which is ADR 0059 kept; the ghoul holds flat because the damage lane and the health step cancel almost exactly; the revenant softens slowly on the two lines whose damage grows and hardens on Territory, whose damage is held flat by ADR 0044 while its health climbs. That last row is the visible consequence of the Territory exemption, and it is the reason the Territory column is worth Mark's read rather than mine.

For contrast, the same health step against **today's** flat damage, which is what happens if slice C writes the health rows and no damage rows: the shambler holds at one skull, the ghoul goes 3 skulls to 4 by the Vigil, and the revenant goes 8 to 11 and its Territory cost goes 13 pulses to 17. The lines get slower against the two tough types over the run and nothing gets faster, which is growth pointed the wrong way.

---

## 5. What the ladder ruling implies about where the growth sits

The ruling in play is that reaching the top of a ladder is rare and the ceiling is high and visible. Two questions follow: whether the last rungs should carry a bigger share of the numbers, and what the top rung should be.

**On back-loading the numbers, precedent is mixed and mild.** HoloCure back-loads: x1.30, x1.327, x1.502. Brotato back-loads three of five weapons checked and front-loads two. Vampire Survivors is even (the Whip's six identical +0.5 steps) or front-loaded (Santa Water's +100%, +100%, +50%, +50%). Nothing in the record back-loads hard, and the largest last step found anywhere is 1.5x against 1.3x for its neighbours.

**And the ruling argues against back-loading, on its own terms.** If reaching max is rare, then a curve whose growth sits in the last rungs is a curve most runs never see. Back-loading concentrates the reward where the fewest players stand, which is the opposite of what a high, visible ceiling is for: the ceiling has to be legible from below, and it is legible from below only if the rungs the player does climb each read as a real step.

**What shipped games do instead is put a kind change at the top and keep the numeric steps even underneath it.** Vampire Survivors gates the evolution on the whole ladder, "The player must have a fully leveled base weapon and its counterpart", and then pays nothing in damage for it: Bloody Tear is 4 against a maxed Whip's 4.0, Holy Wand 3 against 3, Thousand Edge 1.65 against 1.65, La Borra 4 against 4.0, and only Soul Eater moves at x1.33. The whole prize is behaviour: Holy Wand halves its interval, Thousand Edge cuts its to a third, La Borra reaches 100% uptime, Bloody Tear heals on a crit. HoloCure does the same at level 7, where Axe Swing's Awakening is "Crit is guaranteed and crits deal 3x damage" rather than a bigger damage field, and its collabs are a new weapon rather than a bigger one. 20 Minutes Till Dawn's level-20 evolutions are trades: Melee Shot is +200% damage and +2 projectiles bought with +50 spread.

**So the implication for slice C is the opposite of a back-loaded damage curve.** Keep the per-rung damage steps even, which is what the recommended lane does at a flat +25% of base per rung, and let the ceiling be visible through what the top rung **is** rather than through how much it adds. Three of this game's four lines already do exactly that and did it before the precedent was read: the skull stream's fifth column, the wisps' flight of eleven, the bell's fifth cone closing the surround, Territory's level 5 holding a shambler at 0.127 against a pull of 0.6. Those are kind changes at the top of an even ladder, and they are the shipped shape.

The one thing precedent does support back-loading is **cadence**, which is where three of the five Brotato weapons put their biggest last step (Knife 18 to 13 ticks, Pistol 50 to 40, SMG 4 to 3) and where HoloCure's Psycho Axe puts its 240-to-192 step. If a rung has to feel bigger at the top of a ladder, precedent says buy it with rate rather than with damage.

---

## Open items

- **Three weapon-line source files carry damage comments written against the retired shambler health, and the tests disagree with them.** `skullStream.ts:41` and `:86` say "A shambler takes five skulls" and "Five of these is a shambler exactly", `territory.ts:120` says "a shambler's 40 is 8 pulses exactly", and `bell.ts:111` says the near damage is "One shambler exactly" while `:114` says "eight tolls out here to take one trash body". The mow commit (`d4dedf6`) moved the shambler to 8 health and rewrote every affected test, including `touchCounts.test.ts`, but did not rewrite these comments. The pinned counts are one skull, two pulses and two far tolls. Nothing is broken and the rulings are safe, because the test file is the record; the comments are stale prose beside correct code. Filed rather than fixed, on the rule that a gate finding becomes a ticket unless it blocks the next slice.
- **ADR 0044 holds Territory's touch counts flat across its ladder, so Territory has no damage row available to slice C.** That is a ruling and this record does not reopen it, but the consequence is worth Mark's read: if the health step lands and Territory's damage cannot move, the line's cost against a revenant goes 13 pulses to 17 over the run while the other three lines get cheaper.
- **ADR 0058's wording says the column count is "exactly what draws" the skull stream's five levels.** A damage lane makes that no longer exactly true. The record's subject is which axis freshness scales, so this is a collision of wording rather than of rulings, and it needs a decision rather than an inference.
- **No shipped game found publishes a damage-per-level table for a weapon whose ladder is only four steps.** Every table in this record is six, seven or ten steps, or four tiers bought with gold rather than earned in a run. The +25% to +50% band is read off longer ladders and compressed here, which is an assumption rather than a measurement.
- **Halls of Torment's ability base damage is unpublished, so no base-to-max ratio exists for it.** The one repository that parses real game files has a monster parser and an item parser and no ability parser. Both of its wikis refused: `hallsoftorment.wiki.gg` returned Cloudflare 401 and 403 on two attempts, `hot.fandom.com` returned 402 and 403 twice. The trait tree above comes from a community scrape of the wiki's trait tables, which is tabular and consistent across all 18 abilities but is not a game file.
- **Brotato's absolute weapon damage numbers differ between the decompiled build and both community wikis, by a consistent 1.25x to 1.5x, and nothing dates either.** Cooldown, crit chance, crit damage and stat scaling corroborate to within a tick. The ratios in section 1 are safe; the absolute damage column is build-specific and is quoted from the decompile.
- **Deep Rock Galactic: Survivor's creature table carries `hazard1Scalar` and `hazard5Scalar` fields that are rendered nowhere and documented nowhere.** Trash carries 0.95 at hazard 5 and elites 1.3. [survivor-numbers.md](survivor-numbers.md) reports these as health scalars; the field's meaning could not be confirmed from any source, `Survivor:Difficulty` is an explicit stub, and a Steam thread asking for the hazard modifiers has no developer reply. This record leans on the mutator percentages instead, which are stated.
- **The application site for Vampire Survivors' `hpPerMinute` does not exist in public.** The one decompiled-source repository contains `TimeMods.cs` declaring `public float? Start; public float? HpPerMinute; public float? SpeedPerMinute;` with a `[Title("HP Per Minute")]` attribute, but it is an Il2CppInspector scaffold with every method body stripped to `{}`. The additive reading in claim 9 rests on the wiki's own prose and on the infobox parameter documentation, both of which state it plainly and agree with each other, rather than on code.
- **The wiki's Mad Forest page shows "Enemy health per min3: +0.05" in its normal-mode column with a footnote marker.** The shipped `Stage.json` puts that block under `inverse` and gives `FOREST` a null `TimeMods` in `mods`. The data file is trusted here, as [survivor-numbers.md](survivor-numbers.md) already did for The Bone Zone, where the wiki's "+0.3 per minute" is exactly double the shipped 0.15.
- **`WHITEOUT` and `COOP` carry `speedPerMinute: 0.3` under `inverse` against 0.005 on the other nineteen stages, sixty times the standard rate, beside an `hpPerMinute` only twice the standard.** Whether that is a deliberate gimmick or a decimal slip in the shipped data could not be determined and no source documents those stages' Inverse behaviour. It touches nothing here and is recorded so it is not rediscovered as a finding.
- **No developer of any of these games was found stating why the damage step is the size it is.** Every number in this record is read off data or off a wiki transcription of data. The nearest thing to reasoning evidence is Death Must Die's "we can actually make enemies faster and smarter, instead of just adding more hp and damage", already in [survivor-numbers.md](survivor-numbers.md).

---

## What this settles

**The shape is a stepped increment on the level-1 value, sized between +25% and +50% of it, applied to a minority of the rungs.** Vampire Survivors adds a flat fraction of base (the Whip's six +50% steps), HoloCure multiplies (x1.30, x1.327, x1.502), Deep Rock Galactic: Survivor draws a rarity-tiered card (+10% to +50%) and 20 Minutes Till Dawn a fixed pick (+10% to +45%). None of them fits a formula to the ladder; every one authors the row per weapon and per level. Base to max on damage alone lands at 2.5x to 4x, and the full ladder buys 8x to 16x of throughput because count, area and cadence carry the rest.

**Trash stops dying in one or two hits in exactly the games that have a second growth channel to close the gap, and this game does not have one.** Vampire Survivors holds its trash line at 0.5 to 3 health for thirty minutes against a weapon going 1 to 4, and steps trash health back down at its densest minutes. Deep Rock Galactic: Survivor refuses time-based health scaling outright. HoloCure lets trash run 375x against a 2.59x weapon ladder and closes it with six slots, an ATK stat, items and collabs; 20 Minutes Till Dawn lets it run 21x against a starter weapon that never levels. Hungry Grave's whole growth channel is 19 rungs across four lines, so it belongs with the first pair, which is where ADR 0059 already put it from the play side.

**The rows recommended for slice C are a damage lane of +25% of the rung-1 value per rung to a x2 ceiling, and a health step of x1.00, x1.15, x1.30 by section that exempts the mow body.** The damage lane is the smaller of the two precedent trades, taken because the skull stream's own ladder is the genre's shortest at x5.0 and a x2 lane lands it at x10 rather than x15. The health step is the smallest shipped per-minute figure, +0.05, converted to a per-section step because ADR 0060 rules growth stepped and never ramped and the build has no absolute stage clock. The mow exemption is the load-bearing part: at the smallest shipped rate the shambler leaves its one-skull kill inside the second section, so every nonzero multiplier on that row spends ADR 0059's ruling. Territory carries no damage row because ADR 0044 holds its touch counts flat, and the bell's row moves in eights because a test pins the far edge at an eighth of the near.

**The resulting curve holds the mow at one touch for the whole run, holds the ghoul flat, and softens the revenant on the two lines whose damage grows while hardening it on the one whose damage cannot.** That last asymmetry is a consequence of a ruling rather than a tuning choice, and it is the row worth Mark's read.

**The ladder ruling argues against back-loading the numbers and for a kind change at the top.** Precedent for back-loaded damage is mixed and mild, the largest last step found anywhere being 1.5x against 1.3x for its neighbours. What every game with a rare ceiling does instead is gate a change of kind on the whole ladder and pay nothing in damage for it: four of five Vampire Survivors evolutions inherit the maxed weapon's `power` verbatim and buy cadence, uptime and behaviour with the reward. Three of this game's four lines already do that at their top rung. Where a rung genuinely has to feel bigger at the top, precedent says buy it with rate, which is where Brotato and HoloCure put their largest last steps.

---

## Sources

Shipped data and decompiled source:
- Vampire Survivors `Weapon.json`, `Enemy.json`, `Stage.json`: <https://github.com/Dezzelshipc/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Weapon.json>, `.../Enemy.json`, `.../Stage.json`
- Brotato decompiled source: <https://github.com/Yeet195/BrotatoDecompiled/blob/main/Brotato/entities/units/unit/stats.gd>, `.../singletons/entity_service.gd`, `.../singletons/run_data.gd`, `.../entities/units/enemies/boss/boss.gd`, `.../weapons/weapon_stats/weapon_stats.gd`, `.../weapons/melee/knife/1/knife_stats.tres`, `.../items/difficulties/5/difficulty_5_effect_2.tres`
- Halls of Torment monster health, from a community parse of the game files: <https://raw.githubusercontent.com/barnden/HoT/master/output/monsters.tsv>
- Halls of Torment ability trait tree, a community scrape of the wiki's trait tables: <https://raw.githubusercontent.com/gizix/HoT_SkillTracker/windows-exe/app/static/data/h_o_t_traits.json>

Wiki transcriptions of shipped data:
- Vampire Survivors per-weapon level tables: <https://vampire.survivors.wiki/w/Whip>, `/Magic_Wand`, `/Knife`, `/Garlic`, `/Santa_Water`, `/Bloody_Tear`
- Vampire Survivors evolution rule and post-ceiling growth: <https://vampire.survivors.wiki/w/Evolution>, <https://vampire.survivors.wiki/w/Limit_Break>
- Vampire Survivors stage modifiers and Mad Forest schedule: <https://vampire.survivors.wiki/w/Stages>, <https://vampire.survivors.wiki/w/Mad_Forest>, <https://vampire.survivors.wiki/w/Template:Infobox_Stage/doc>
- HoloCure weapon levels, damage model and stage roster: <https://holocure.wiki.gg/wiki/Psycho_Axe>, <https://holocure.wiki.gg/wiki/Weapon>, <https://holocure.wiki.gg/wiki/Damage>, <https://holocure.wiki.gg/wiki/MiComet>, <https://holocure.wiki.gg/wiki/Stage_1_-_Grassy_Plains>
- Deep Rock Galactic: Survivor upgrade cards, stat formula, mutators and creature table: <https://deeprockgalactic.wiki.gg/wiki/Survivor:Mid-dive_Upgrades>, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Weapons>, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Mutators>, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Elimination>, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Deepcore_GK2/Data>
- 20 Minutes Till Dawn upgrades, runes, evolutions and spawn sessions: <https://20minutestilldawn.wiki.gg/wiki/Upgrades>, <https://20minutestilldawn.wiki.gg/wiki/Runes>, <https://20minutestilldawn.wiki.gg/wiki/Weapon_Evolutions>, <https://20minutestilldawn.wiki.gg/wiki/Forest>
- Brotato wiki cross-check: <https://brotato.wiki.spellsandguns.com/Weapons>, <https://brotato.wiki.spellsandguns.com/Enemies>

Project records and rulings cited rather than repeated:
- [survivor-numbers.md](survivor-numbers.md), [progression-tuning-precedent.md](progression-tuning-precedent.md), [naming-the-authored-growth-rate.md](naming-the-authored-growth-rate.md)
- `docs/adr/0036-the-bell-is-a-timed-pulse-of-cones.md`, `docs/adr/0044-territory-is-autonomous-controlling-ground.md`, `docs/adr/0049-the-stage-runs-eight-to-ten-minutes-in-named-sections.md`, `docs/adr/0053-the-playing-harness-is-one-policy-over-many-seeds.md`, `docs/adr/0058-each-on-swallow-line-pays-in-its-own-currency-at-its-own-cadence.md`, `docs/adr/0059-a-trash-minute-is-a-mow-and-density-is-bought-with-weak-bodies.md`, `docs/adr/0060-growth-over-the-run-is-authored-per-section-and-the-director-never-owns-it.md`
- `src/game/lines/skullStream.ts`, `src/game/lines/wisps.ts`, `src/game/lines/territory.ts`, `src/game/lines/bell.ts`, `src/game/lines/roster.ts`, `src/game/mobs.ts`, `src/game/carriers.ts`, `src/game/offer.ts`, `src/game/stage/stage.ts`, `src/game/__tests__/touchCounts.test.ts`

---

## Reproducing the checks

The Vampire Survivors per-level deltas for the five starting weapons:

```
curl -sL -o Weapon.json "https://raw.githubusercontent.com/Dezzelshipc/VampireSurvivorsFiles/main/Data/Vampire%20Survivors/Weapon.json"
python3 -c "import json; d=json.load(open('Weapon.json')); [print(k, [json.dumps(l) for l in d[k]]) for k in ('WHIP','MAGIC_MISSILE','KNIFE','GARLIC','HOLYWATER')]"
```

Which Vampire Survivors stages grow enemy health on the clock, and by how much:

```
curl -sL -o Stage.json "https://raw.githubusercontent.com/Dezzelshipc/VampireSurvivorsFiles/main/Data/Vampire%20Survivors/Stage.json"
python3 -c "
import json; d=json.load(open('Stage.json'))
for k,a in d.items():
    h=a[0]; print(k, 'mods:', json.dumps((h.get('mods') or {}).get('TimeMods')), '| inverse:', json.dumps((h.get('inverse') or {}).get('TimeMods')))"
```

Brotato's whole enemy health formula, which is four lines:

```
curl -sL "https://raw.githubusercontent.com/Yeet195/BrotatoDecompiled/main/Brotato/entities/units/unit/stats.gd"
```

The HoloCure per-level fields, which the rendered stat table is generated from:

```
curl -sL "https://holocure.wiki.gg/wiki/Psycho_Axe?action=raw" | grep -E "damage1|attackTime1|area1|hitLimit1|duration1"
```

This game's own ladder and mob rows, and the ruled touch counts:

```
grep -n "BY_LEVEL\|_DAMAGE = \|_INTERVAL = \|_PERIOD = " apps/hungry-grave/src/game/lines/*.ts
grep -n "hp: " apps/hungry-grave/src/game/mobs.ts
cd apps/hungry-grave && npx vitest run src/game/__tests__/touchCounts.test.ts
```

The hits-to-kill curve in section 4, recomputed from any candidate rows:

```
python3 -c "
import math
skull=[0,8,10,12,14,16]; wisp=[0,10,12,15,17,20]; terr=[0,5,5,5,5,5]
near=[0,40,56,72,88,104]; far=[0,5,7,9,11,13]
step={0:1.00,3:1.15,6:1.30}; rung={0:1,3:2,6:3}
for m in (0,3,6):
    L=rung[m]
    for mob,h0,scales in (('shambler',8,False),('ghoul',20,True),('revenant',64,True)):
        h=h0*(step[m] if scales else 1.0)
        print(m, L, mob, round(h,1), [math.ceil(h/t[L]) for t in (skull,wisp,terr,near,far)])"
```
