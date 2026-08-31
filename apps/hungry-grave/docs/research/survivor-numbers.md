# Survivor-like numeric design: enemy HP, damage, and weapon progression

Research for Hungry Grave. Labels: **DOCUMENTED** = from shipped game data files or a developer statement. **COMMUNITY-MEASURED** = wiki/player-derived. **INFERRED** = my reading across sources.

The strongest source in this document is the Vampire Survivors game data itself: `Enemy.json`, `Weapon.json`, `Stage.json` and `Character.json` extracted from the shipped build and mirrored at <https://github.com/Dezzelshipc/VampireSurvivorsFiles>. Every VS number below labelled DOCUMENTED was read out of those files directly, not from a wiki summary. 579 enemy entries and 151 weapon entries were parsed.

---

## What is solid

These are the claims I would build on.

1. **Trash HP and starting weapon damage live on the same small scale, and the base weapon one-shots the base trash enemy.** In VS's own units, a Zombie has 1 HP and the Whip does 1 damage. The weakest enemy in the game (Pipeestrello, the opening bat) has **0.1 HP** against that same 1.0 damage: a 10x overkill. Wikis display both numbers multiplied by 10, which is why the community talks about "10 HP zombies" and "10 damage Whip". The design ratio is unchanged.

   I checked the starting characters to be sure nothing modifies this: Antonio, Imelda, Pasqualina and Gennaro all ship `power: 1` (`Character.json`), so the multiplier is exactly 1.0 and **the Whip kills a Zombie in one hit with zero margin**. That is not an accident of rounding; it is the calibration point of the whole game.

   One unit caveat so nobody trips on it later: weapon `power` and enemy `maxHp` are both displayed at 10x their stored value, while enemy `power` (damage dealt to the player) and player `maxHp` are displayed 1:1. Antonio has 120 HP and a Zombie hits for 10, both as stored.

2. **Damage and HP are floats, not integers.** VS ships enemies at 0.1, 0.35, 0.65, 0.95, 1.1, 2.7 HP and weapons at 0.2, 0.5, 0.65, 1.65, 2.8, 7.7 power. Fine tuning resolution comes from the numbers being small **and fractional**, not from making them large.

3. **Not one of the six games lets trash HP carry the difficulty curve, and one of them pushes it down.** In VS, 16 of 24 stages have `EnemyHealthMultiplier: 1` and no per-minute scaling at all; the ~100x HP climb comes entirely from **swapping in tougher enemy types**. In Deep Rock Galactic: Survivor the basic-grunt HP scalar is **1.0 at Hazard 1 and 0.95 at Hazard 5**, so trash gets *weaker* as difficulty rises, while elites go to 1.3 and the boss to 1.4. In 20 Minutes Till Dawn the full 15-level difficulty ladder caps trash HP at **+75%** while bosses reach +150%. This is the most consistent finding in the whole document.

4. **Density scales harder than HP, and by a lot.** 20 Minutes Till Dawn's authored spawn table runs trash HP 24 to 500 (**21x**) while the concurrent-enemy cap goes 20 to 600 (**30x**), per-spawn count goes 4 to 26, and spawn cooldown drops from 3 s to 1 s. VS does the same thing more sharply: minimum concurrent enemies goes 15 to 300 on Mad Forest. The storm is bought with count, not with durability.

5. **The HP curve is deliberately non-monotonic.** Mad Forest alternates "few tough" minutes with "wall of trash" minutes: minute 5 is 15 HP mudmen at 10 on screen, minute 8 drops back to 1 HP zombies at 100 on screen, minute 11 is 300 skeletons at 1.5 HP. The storm-of-small-interactions feel is delivered by **count**, and on those minutes HP is pushed back down.

6. **Amount (projectile/instance count) is the most common first level-up; area is second; damage is third.** Across all VS weapons, the level-2 upgrade is `amount` for 29 weapons, `area` for 22, `power` for 12. Over all level-ups, the ranking is power (154) > amount (141) > area (108) > cooldown (65) > duration (64) > speed (56) > pierce (32).

7. **Area-as-primary progression has real precedent, and it is always paid for.** Song of Mana doubles its area at level 2 and takes area or duration at every subsequent level, but its **cooldown gets worse at levels 3, 5 and 7** (+0.75s each, 2.0s → 4.25s). Garlic, Cherry Bomb and Santa Water are also area-first. VS also caps total Area at **1000%**.

8. **Persistent-area weapons are expressed as a re-hit delay per enemy, not a damage-per-second rate.** Every VS ground effect carries `hitBoxDelay` in milliseconds: the same enemy cannot be hit again by that instance until it elapses. The values cluster hard at **500 ms and 1000 ms**. Damage per tick is the weapon's full `power`.

   There are three shipped models for this and they are genuinely different. VS: a per-enemy re-hit delay, full weapon damage per tick. PoE: continuous damage-per-second that explicitly does not "hit". Deep Rock Galactic: Survivor: **zone damage derived as a percentage of the parent weapon's hit damage**, plus status stacks equal to 50% of the weapon's potency, ticking on a global 0.5 s status clock.

9. **No mainstream survivor-like targets a dense cluster or leads a moving target.** Across all 151 `Weapon.json` descriptions the only targeting language is "nearest enemy" (4), "random enemy" (5), "random enemies" (1), and "faced direction" (2). Hungry Grave's predictive-lead cluster artillery has **no direct precedent** in this genre.

10. **Four independent precedents exist for a kill path that ignores or bypasses HP.** VS enemies carry `res_Rosary` (1 for normal enemies, 100 for immune bosses), and Pentagram, the screen-clear weapon, ships `power: 0`: it deals no damage at all, it erases. Halls of Torment pairs a `damagefactor = 0.1%` multiplier with a **hit-count death condition**: the Possessed Effigy dies after 21 hits and the Gold Slime after 25, regardless of damage. The hit-count version is the closer analogue to a grave that swallows.

   Two more games ship a **percent-max-HP execute that is explicitly role-gated**, and the ratios are striking. 20 Minutes Till Dawn's Frostbite strips **15% of max HP from trash and 1% from elites and bosses**, a 15:1 split, and its wiki documents that three copies one-shots small enemies. Death Must Die's Fatality is a **21% instant kill on a minion and 7% on an elite**, a 3:1 split, and its Shatter executes chilled enemies below 9-18% life. In every case the execute is gated behind a status effect rather than given free.

11. **The genre does not agree on number scale, and every scale ships successfully. What it *does* agree on is the hit count.** Vampire Survivors runs 1 HP trash against 1.0 damage weapons in floats, and Brotato sits at the same end (1 HP Chaser). Deep Rock Galactic: Survivor is mid-scale, 110 HP trash against 22-140 damage weapons. Halls of Torment is at the far end, 50-100 damage weapons against enemies in the thousands, and needs an explicit "damage reduction cannot reduce damage below 1" rule to stop its mitigation curve squashing hits.

    The invariant across all of them is **1 to 4 hits to kill trash at run start**: VS 1 hit, Brotato 1, DRG:S 1 to 4 depending on weapon, 20 Minutes Till Dawn 2. The absolute numbers are a free choice; the kill-time is not.

12. **There are three shipped answers to "stop the area weapon running away", and they point in different directions.** VS lets a zone's throughput grow with the crowd (per-puddle hit delays, overlapping puddles stack superlinearly, `amount` is a real axis). Halls of Torment's Radiant Aura **divides a fixed 3000 damage budget equally among everyone in range**, so it weakens per target as the crowd grows. PoE forbids same-type ground effects from stacking at all: highest DPS wins. Picking one of these three is a real design decision, not a tuning detail.

13. **Death Must Die writes explicit anti-scaling divisors so that count and pierce can be sold as upgrades without multiplying throughput.** `DamagePerShot = TotalDamage / (Count / (0.92 + 0.08 × Count))` and `Damage = TotalDamage / (sum / (0.66 + 0.34 × sum))` for pierce, which is penalised roughly **four times harder** than projectile count. The consequence shows in its catalogue: across 181 blessings, projectile count and pierce **do not exist as general upgrade axes at all**, and attack speed appears twice.

14. **The genre's own author does not treat balance as the goal.** Luca Galante: "I don't care for game balance that much. It's a singleplayer game... if there are some weapons that are completely broken, that's fine. As long as they're fun."

---

## Enemy HP table

### Vampire Survivors (DOCUMENTED, game data files)

Internal units. Multiply by 10 to match wiki/in-game display. Player base weapon damage is 1.0 in these same units.

| Enemy | Internal HP | Wiki display | Power | Speed | XP |
|---|---|---|---|---|---|
| Pipeestrello (BAT1) | **0.1** | 1 | 5 | 140 | 1 |
| Bat swarm (BATSWARM) | 0.1 | 1 | 1 | 700 | 1 |
| Bat 2/3 | 0.5 | 5 | 5 | 140 | 1 |
| Skeletone | 0.7 | 7 | 20 | 100 | 25 |
| **Zombie** | **1.0** | 10 | 10 | 100 | 1 |
| Ghost | 1.0 | 10 | 5 | 200 | 1.5 |
| Bloodbath bat | 1.1 | 11 | 5 | 140 | 1 |
| **Skeleton** | **1.5** | 15 | 10 | 100 | 2 |
| Flower | 3 | 30 | n/a | n/a | n/a |
| Skeleton Panther | 5 | 50 | 10 | 140 | 2 |
| Mudman (green) | 7 | 70 | 10 | 100 | 2.5 |
| Reaper Trainee | 8 | 80 | 20 | 120 | 25 |
| Skeleton Ninja | 13 | 130 | 8 | 200 | 4 |
| Mudman (gray) | 15 | 150 | 10 | 100 | 2.5 |
| **Werewolf** | **18** | 180 | 14 | 130 | 2 |
| Giant Skeleton | 21 | 210 | 20 | 80 | 6 |
| Giant Bat | 27 | 270 | 10 | 140 | 2.5 |
| Venus / Mantis / Mummy | 50 | 500 | 20 | 80 | 3 |
| LV128 Golden Bat | 128 | 1,280 | 10 | 140 | 10 |
| Colossal Werewolf | 1,000 | 10,000 | 20 | 130 | 30 |
| **The Reaper** | **65,535** | 655,350 | 65,535 | 1,200 | 0 |

Full distinct-HP set, lowest end: 0.1, 0.2, 0.3, 0.35, 0.4, 0.5, 0.6, 0.65, 0.7, 0.8, 0.95, 1, 1.1, 1.2, 1.25, 1.3, 1.4, 1.5, 1.6, 1.8, 2, 2.5, 2.7, 3. Highest end: 70, 80, 90, 100, 127, 128, 150, 200, 255, 1000, 1080, 3000, 5555, 8888, 65535. 69 distinct values across 579 entries.

### Mad Forest HP-over-time curve (DOCUMENTED, Stage.json cross-referenced to Enemy.json)

`EnemyHealthMultiplier: 1`, no `TimeMods` in normal mode. All of this climb is enemy-type substitution.

| Minute | Peak HP on screen | Min. concurrent enemies | Spawn interval | Composition |
|---|---|---|---|---|
| 0 | 0.5 | 15 | 1000 ms | bats |
| 1 | 1.0 | 30 | 1000 ms | zombies + bats |
| 2 | 0.5 | 50 | 500 ms | bats only |
| 3 | 1.5 | 40 | 250 ms | skeletons |
| 5 | **15** | 10 | 1000 ms | gray mudmen, few and tough |
| 8 | **1.0** | **100** | 1500 ms | zombies, many and weak |
| 9 | 27 | 30 | 500 ms | giant bats + zombies |
| 11 | **1.5** | **300** | 100 ms | skeletons, the wall |
| 12 | 18 | 20 | 250 ms | werewolves |
| 16 | 50 | 100 | 100 ms | mantises + mudmen |
| 21 | **3** | **300** | 100 ms | flowers, second wall |
| 25 | 50 | 100 | 100 ms | Venus |
| 30 | 65,535 | 1 | n/a | The Reaper |

Note minutes 8, 11 and 21. Peak HP **falls** while enemy count goes to 100–300. The game buys its densest moments by making the enemies weak again.

### Per-minute HP inflation: the stages that use it (DOCUMENTED, Stage.json)

| Stage | Base multiplier | hpPerMinute | speedPerMinute |
|---|---|---|---|
| The Coop | 1 | **+0.25** | 0 |
| The Bone Zone | 1 | **+0.15** | +0.025 |
| Bat Country | 1 | +0.10 | +0.0125 |
| Astral Stair | 1 | +0.10 | +0.001 |
| Mazerella | 1 | +0.10 | +0.001 |
| Tiny Bridge | 1 | +0.10 | +0.0125 |
| Green Acres | **1.5** | none | n/a |
| Boss Rash | **1.5** | none | n/a |
| Mad Forest and 15 others | 1 | none | n/a |

The multiplier is **linear and additive**, not compounding: Bone Zone at minute 30 is 1 + 0.15×30 = 5.5x, not 1.15^30. (The community wiki states Bone Zone as "+0.3 per minute"; the shipped data file says 0.15. I trust the data file and flag the discrepancy, likely version drift.)

Mad Forest **Inverse mode** does inflate: `EnemyHealthMultiplier: 2` with `hpPerMinute: 0.05`, `speedPerMinute: 0.005`. So per-minute inflation is what VS reaches for in its *hard* mode, not its base mode.

### The second inflation mechanism: HP × player level (DOCUMENTED)

`HP_x_Level` appears as a skill on **220 of 579** enemy entries, overwhelmingly bosses and elites. Enemy HP is multiplied by the player's level *at spawn time* and does not update if the player levels afterward. The Reaper is 65,535 × player level.

This is worth dwelling on: VS ties elite HP to the **player's own power proxy** rather than to the clock. It is a rubber band, not a curve.

### Brotato (COMMUNITY-MEASURED, fextralife/spellsandguns wiki)

Brotato is the counter-example: it *does* inflate per wave, additively, per enemy type.

| Enemy | Base HP | +HP/wave | Contact dmg | +dmg/wave |
|---|---|---|---|---|
| Chaser | **1** | +1.0 | 1 | +0.6 |
| Baby Alien | 3 | +2.0 | 1 | +0.6 |
| Charger | 4 | +2.5 | 1 | +0.85 |
| Spitter | 8 | +1.0 | 0.6 | +0.95 |
| Tree | 10 | +5 | 0 | 0 |
| Pursuer | 10 | +24.0 | 1 | +1.2 |
| Fly | 15 | +4.0 | 0.85 | +1.0 |
| Bruiser | 20 | +11.0 | 2 | +0.85 |
| Slasher | 50 | +25.0 | 1.15 | +1.0 |
| Tentacle | 100 | +20.0 | 1.0 | +1.0 |
| Elites (all) | 1 | **+750** | n/a | +1.5 |
| Bosses (wave 20) | 29,250 | n/a | 30 contact / 23 projectile | n/a |

Sources: <https://brotato.wiki.spellsandguns.com/Enemies> and <https://brotato.wiki.fextralife.com/Enemies>. The two wikis were cross-checked and agree on Chaser 1 (+1.0/wave), Baby Alien 3 (+2.0), Charger 4 (+2.5), Spitter 8 (+1.0), Bruiser 20 (+11.0). They disagree on Spitter contact damage (0.6 vs 1) and list "Tree" and "Corrupted Tree" as different enemies, so treat the trailing decimals as approximate and the leading digits as reliable.

Two things stand out. The basic Chaser is **1 HP**, the same order as VS. And the per-wave gain is **per enemy type**, so the designers control each enemy's individual curve slope independently (Chaser +1/wave stays trash forever; Pursuer +24/wave becomes a threat fast). Elites use base 1 / +750 per wave, i.e. their HP is *purely* a function of wave number.

### Halls of Torment (DOCUMENTED, wiki Lua data modules + Steam patch notes)

**Halls of Torment is the counter-example on number scale, and it matters.** Where VS runs trash at 1 HP against 1 damage, HoT runs player weapons at 50 to 100 damage per hit against enemies in the thousands.

| Hero | Weapon | Damage | Attack speed | Multihit | Crit | Crit bonus |
|---|---|---|---|---|---|---|
| Swordsman | Zweihander (45° cone, 7.0 m) | 100 | 0.90/s | 1.00 | 20% | 65% |
| Archer | Bow (18° cone, 75 m/s) | 60 | 0.95/s | 3.00 | 33% | 200% |
| Sorceress | Chain Lightning | 100 | 0.75/s | 5.00 | 20% | 100% |
| Exterminator | Flame Caster | 50 | 3.00/s | 1.00 | 5% | 100% |
| Warlock | Ravaging Specters | 50 | 0.60/s | 2.00 | 10% | 200% |

Base hero health: Swordsman 500, Archer 400, Sorceress 300, Exterminator 400, Warlock 350.

**Basic trash HP is genuinely unpublished.** It is not on the wiki and I could not find a datamine; the only route is unpacking `hallsoftorment.pck`. The published enemy HP figures are all special cases: Possessed Effigy 4,400; Marching Ghost 10,000; Vault Pylon 50,000.

**The one clean time-based HP curve in the game is linear.** Champion HP is `BaseHealth + HallStrength × WorldHealthMultiplier`, where `HallStrength` interpolates linearly on stage progress. Nearly every Champion is `BaseHealth 5000, WorldHealthMultiplier 1.0`. Hall I runs 500 → 19,000, so a Champion goes **5,500 HP at 0:00 to 24,000 HP at 30:00, a 4.4x linear ramp**. Hall III is 11,000 → 81,000 (7.4x). Source: [Hall](https://hot.fandom.com/wiki/Hall), [Module:ChampionData](https://hot.fandom.com/wiki/Module:ChampionData).

**Trash HP over time is performance-driven, not clock-driven.** Agony Mode scales "monster count, monster health, and XP drops... based on your performance". A 2023-03-15 patch line reads "Health of monsters now doesn't increase over time in Ember Grounds", which is direct evidence that a per-hall time ramp existed and was deliberately switched off. No per-minute multiplier for base mobs is published.

**Correction to the widely-quoted Torment numbers.** The wiki's ×1.11 health / ×1.10 defense per Torment Rank is pre-Boglands. The Boglands patch (2025-10-28) states: "Done a slight rebalancing of the Torment Ranks to have a less drastic increase per level. (Health x1.11 -> x1.09, Defense x1.10 -> x1.09, Movement Speed +1.5% -> +1.0%)". Current values are **×1.09 health, ×1.09 defense, +1.0% speed per Rank**. Source: <https://store.steampowered.com/news/app/2218750/view/1814309641609664>

Past 30 minutes a separate axis takes over: "Health will be changed to scale x1.12 instead of x1.2. Defense scaling will be added with x1.12... Damage scaling will be changed from +4% to +5% per level." The stated reason is worth reading twice: "some enemies were approaching and hit the highest HP possible in the game, causing bugs." Source: <https://store.steampowered.com/news/app/2218750/view/6931694080291548684>

**Enemy Defense is a curve with an explicit damage floor.** Not subtraction, not a flat percentage:

```
DamageReduction   = InverseHyperbolic + ClippedLinear
InverseHyperbolic = sgn(D) * (0.6 - 24/(|D| + 40))
ClippedLinear     = min(0.4, 0.004 * D)
```

| Defense | Damage reduction | 100 damage becomes |
|---|---|---|
| 1 | 1.86% | 98.1 |
| 5 | 8.67% | 91.3 |
| 10 | 16.00% | 84.0 |
| 20 | 28.00% | 72.0 |
| 40 | 46.00% | 54.0 |
| 100 | 82.86% | 17.1 |
| 200 | 90.00% | 10.0 |

The wiki states outright: **"Damage Reduction cannot reduce damage to below 1."** That is the floor, and it is the direct answer to whether small damage numbers get squashed. Note also how soft the curve is at the low end: 1 point of Defense is worth under 2%, and at Agony rank 5 an enemy has roughly 5 Defense, i.e. about 8.7% mitigation across a fully-ramped run. Enemy defense is texture, not a wall. Source: <https://hot.fandom.com/wiki/Game_Mechanics>

**HoT builds its unkillable enemies with a multiplier plus a hit-count death condition, not with HP.** Possessed Effigy and Marching Ghost carry `damagefactor = 0.1%`: "all damage is reduced to 0.1% against them." Paired with that, the Effigy **dies after 21 hits regardless of damage**, and the Gold Slime has 999,999,999 HP and dies after 25 hits.

That pairing is the important part. A 0.1% multiplier would otherwise floor every hit to 1 and make the enemy a damage sponge, so the designers bolted on a **hit-count kill threshold** as the actual death condition. This is a second, independent precedent for a kill path that ignores HP, and it is closer to Hungry Grave's swallow than VS's Rosary is: the thing dies from *being hit enough times*, not from accumulated damage.

**Halls of Torment has almost no persistent damaging ground zones.** Across all 28 abilities in `Module:AbilityData` there is exactly **one** `Damage Interval` field, and it is switched off: Arcane Rift's lingering rift ships `Damage 0, Damage Interval x9999, Area Radius 5.0m, Despawn Time 5.00s`. The engine supports ticking areas; the base kit declines to use them.

Everything that reads as area damage is an **instantaneous pulse on an attack interval**:

| Ability | Damage | Interval | Radius | Notes |
|---|---|---|---|---|
| Radiant Aura | 3000 | 3.00 s | 5.0 m | **Damage is split equally among all enemies in range** |
| Punitive Light | 2400 | 3.00 s | 5.0 m | 100% Fragile + 100% Affliction on hit |
| Pyrotechnics | 200 | n/a | 2.0 m | 4 emit areas at 6.0 m |
| Meteor Strike | 150 | 5.99 s | 2.5 m | 4 emits, 100% crit chance |
| Kugelblitz | 20 per shockwave | n/a | 2.5 m | orb travels 5.0 m/s for 4.00 s |
| Hailstorm | 500 | n/a | 3.0 m max damage / 6.0 m max effect | 2 satellites, 33% Frost |
| Wall of Death | 200 | n/a | 7.0 m | 3.00 s, **+100% damage bonus per second alive** |

Radiant Aura is the one to dwell on. **A control ability whose fixed damage budget is divided across everyone in range** gets weaker per target as the crowd grows, which is the exact inverse of the VS area weapon whose throughput grows with the crowd. Those are the two opposite answers to "how do I stop an area weapon from scaling out of control", and HoT picked the harsher one.

**HoT's actual DoT model is per-enemy stacks, not per-area ticks.**

| Effect | Damage per stack | Tick | Duration | Max stacks |
|---|---|---|---|---|
| Burn | 60 | 0.33 s | 2.5 s | 20 |
| Spark | 120 | 2 s base, **×0.854 per extra stack** | n/a | 20 |
| Decay | 10 | 1.0 s | none | none |
| Frost | 60 on release | n/a | 10 s | 20 |

Decay also applies -1 Defense and -0.05 Block per stack and stacks forever. Frost stores and releases as a wave whose radius is `2m × (1 + (StrongestHitDamage/200)^0.3)`, unaffected by Area or Range bonuses: **an area that scales off your biggest single hit, sublinearly.** That is an unusual and rather elegant way to let area grow without letting it run.

Two debuffs decay by **halving stacks each tick**, with tick time `5s - stacks × 0.05s`, so applying n stacks per second converges to `75n/(n+10)` and can never reach 100. Self-limiting by construction rather than by a cap.

**HoT's upgrade axes, tallied across all abilities** (from `Module:AbilityTraitData`): Damage 36, **Area Radius 23**, Base Damage 19, Attack Speed 15, Range 15, Force 12, Crit Chance 11, Crit Bonus 10, Base Crit Chance 6, Multistrike 5, then a long tail.

Three structural differences from VS worth noting:

- **There is no cooldown axis.** Attack Speed does that job everywhere, including on interval abilities.
- **There is no pierce axis.** `Force` is an umbrella stat that buys pierce, duration, knockback or chain count depending on the ability, through `FinalStat = BaseStat^(1/Force)`.
- **Duration is almost never an axis** (one instance in the whole table).
- **Roughly half of all traits carry an explicit penalty.** Radiant Aura's "Haste" is +0.066 base attack speed for **-300 base damage** on a 3000-damage ability.

**The first choice for an area ability is a tension, not a ladder.** At ability level 1 the offered pair is always damage-leaning versus area-leaning:

- Radiant Aura: **Focus** (+40% damage, **-10% area**) or **Strength** (+20% area radius, +10% total stacks)
- Arcane Rift: **Blast** (+5% area, +10% damage) or **Concentrate** (+20% damage, +20% crit, **-10% area**)
- Pyrotechnics: **Range** (+20% range) or **Area** (+10% area radius)
- Undergrowth: **Pain** (+20% damage) or **Spread** (+15% area radius)

Count-increasing traits (+1 Rift, +0.4 object count) are gated to ability level 3 at the earliest and always cost area or damage. So where VS hands the player *more of the weapon* as the opening move, HoT makes the opening move a *trade* between damage and footprint. Both are defensible; they produce very different first-upgrade feelings.

**Crit is the only source of damage variance in HoT, and there is no damage roll.** `FinalDamage = Damage × (1 + CritBonus × CritStacks)`. No variance stat exists anywhere in the glossary, no min/max damage field appears in any of the 28 abilities, and the wiki's own DPS calculator is fully deterministic. A non-crit hit deals the same number every time. Elemental effects cannot crit at all.

One mechanic worth stealing: **HoT resolves fractional stacks differently per stat, on purpose.** Crit above 100% uses *random* stacks (3.1 becomes 3 plus a 10% chance of a 4th), while Multistrike uses *deterministic* stacks, an accumulator producing a repeating pattern (2.6 yields the loop 2,3,2,3,3) so multistrike never spikes. Variance is granted where it is fun and denied where it would be noise.

Integer versus float in HoT is **INFERRED, not settled**: the Defense worked example resolves to exactly 27, regeneration is "1 point at a time", and the floor is stated as 1, all suggesting integers at the application layer; but base stats carry decimals throughout (0.33 defense per Torment Level, 0.02 piercing per level, the 0.854 tick factor). Probably float accumulation with rounding at application, but no source says so.


### 20 Minutes Till Dawn (DOCUMENTED, wiki tables transcribed from game data)

**There is no scaling formula in the main game.** The run is a hand-authored **spawn session table** per map. Each row names an enemy, a start and end time on the 20:00 countdown, a fixed HP, a concurrent cap, a spawn cooldown, and a count per spawn. Higher HP arrives by starting a new session, never by multiplying a base. Source: <https://20minutestilldawn.wiki.gg/wiki/Forest>

| Time | Enemy | HP | Max concurrent | Spawn CD | Num per spawn |
|---|---|---|---|---|---|
| 20:00 | Tentacle Monster | **24** | 20 | 3 s | 4 |
| 19:00 | Tentacle Monster | 24 | 50 | 4 s | 10 |
| 18:00 | Tentacle Monster | 30 | 200 | 2 s | 7 |
| 14:00 | Tentacle Monster | 60 | 400 | 2 s | 12 |
| 12:00 | Tentacle Monster | 80 | 600 | 1 s | 16 |
| 9:55 | Lamprey | 200 | 30 | 1 s | 3 |
| 7:00 | Lamprey | 400 | 300 | 1 s | 14 |
| 4:00 | Tentacle Monster | 250 | 600 | 1 s | 26 |
| 2:00 | Lamprey | **500** | 300 | 1 s | 20 |

Mini-bosses and bosses sit outside this: Elder 1,000 at 17:00; Shub-Niggurath 2,500 at 15:00; Spawner 10,000 at 8:40; Shoggoth 35,000 at 5:00; Winged Terror 18,000 at 4:00.

**Density scales harder than HP.** Trash HP goes 24 to 500, about **21x**. Concurrent cap goes 20 to 600, **30x**, and per-spawn count goes 4 to 26 while spawn cooldown drops from 3 s to 1 s. The primary trash line only runs 24 → 30 → 60 → 80 across the first ten minutes (3.3x); a *different, tougher unit* then takes over the trash role for the back half.

**Difficulty tiers inflate elites far more than trash.** Across the full 15-level "Darkness" ladder, trash HP tops out at **+75%**, elites reach **+125%**, bosses **+150%**. Source: <https://20minutestilldawn.wiki.gg/wiki/Darkness>

**Endless mode is the only real formula, and it is linear**: every 10 minutes, `newHP = oldHP + (5 × baseHP)`, `newMoveSpeed = oldMoveSpeed + (baseMoveSpeed × 0.2)`. Additive on the base, +500% of base per 10 minutes.

**Trash does not die in one hit at run start here.** The free starter Revolver does **20 damage** against **24 HP** trash: a two-shot kill. Fire rate 4/s, magazine 6, reload 1.0 s, so about 48 DPS and roughly 3 kills per magazine. Against the 500 HP late trash the same unmodified revolver needs 25 shots, so the build has to grow damage roughly **25x** across the run just to hold kill-time constant.

**Damage is float and there is no crit stat.** The composition rule is unusual and worth noting: positives add, negatives multiply. `value = (base × (1 + Σ positives) × Π(1 − each negative)) + flat`. The wiki's own example nets **-13.2%** from 55% positives against 50% negatives. Crit-like behaviour is sold per weapon at level 20 instead (the Revolver's Headshot: "30% chance to deal 3 times damage").

**The standout mechanic: a percent-max-HP execute, role-gated.** Frostbite: "When an enemy is inflicted with Freeze, they lose **15% of their Max HP**. Elites and bosses lose **1%** of their max HP." Shatter: frozen enemies explode on death for **7% of their Max HP** to nearby enemies. The wiki states the outcome outright: seven copies of Frostbite reaches 105% total and instantly kills small enemies, and three copies already one-shots them.

That 15%-versus-1% split is the whole trick. **One mechanic, fifteen times harsher on trash than on elites**, so an execute build erases fodder without trivialising bosses. Both numbers were nerfed over time (Frostbite 25% → 15%, Shatter 10% → 7%). Sources: <https://20-minutes-till-dawn.fandom.com/wiki/Frostbite>, <https://20-minutes-till-dawn.fandom.com/wiki/Shatter>

**The closest thing to a control weapon is an aura whose radius is a stat.** Glare: "Vision Range +25%. All enemies within your vision range take **15 damage every 1 second**." The radius axis is the player's Vision Range, which other upgrades also buy. (Caveat: the infobox on the same page says "25 damage every 2 seconds" while the body says 15 every 1 second; both wikis carry the contradiction, so treat it as 12.5 to 15 DPS with the exact figure unconfirmed.) Napalm makes Bullet Size increase the grenade AoE, the game's only true radius axis. Luna's Black Hole pulls enemies in but lasts only **1 second**, and bosses are immune.

**Developer commentary, and it is directly on point.** From the changelogs: *"HP of enemies from 10 minutes to 18 minutes reduced for a smoother difficulty ramp"* and *"Enemy spawn rate slightly reduced at the 8-10 minutes mark"*. The mid-run trough is a deliberate, measured intervention, not an accident. On area control: *"Black Hole restricts players' movement too much, so hopefully the shorter duration and further spawn distance will be less restricting."* **Area denial that constrains the player was treated as a bug.** Source: <https://20-minutes-till-dawn.fandom.com/wiki/Versions>

### Death Must Die (DOCUMENTED, wiki-hosted datamined JSON of the game's data files)

Version caveat: the wiki reflects the pre-Act-4 build, and the developer has said the god system was rebuilt from the ground up for Act 4.

**Absolute enemy HP is not published anywhere.** The wiki's Monster page has a Stats column for all 9 minion types and all 4 bosses and **every cell is empty**. A COMMUNITY-MEASURED anchor puts Act 1 skeletons in the low tens of HP against roughly 14 to 20 damage hits, but that is back-solved from a forum post.

HP progression is spawn-timetabled the same way 20MTD does it, plus a selectable difficulty ladder ("Darkness" 0 to 30, later 0 to 100) whose only published figure is on the boss side: *"Boss Life gain difficulty modifier 40% → 35% per level (120% → 105% max)"*.

**Damage is float, and every hit rolls variance**: "The game takes the attacker's Min Power and Max Power. A random number is rolled between these two values." The spread width is unpublished. Crit is **300%** of normal, purely additive with no curve and able to reach 100%, and it is **additive with gear damage rather than multiplicative**: +100% item damage with a 200% crit multiplier yields 3x, not 4x, so crits get relatively weaker the more gear damage you stack.

**The most transferable thing in this game is its pair of explicit anti-scaling divisors:**

```
DamagePerShot = TotalDamage / (Count / (0.92 + 0.08 × Count))
Damage        = TotalDamage / (sum   / (0.66 + 0.34 × sum))    # pierce / bounce
```

More projectiles raises total output only slightly while sharply lowering per-hit damage, and **pierce is penalised roughly four times harder than projectile count**. The crit roll happens after the division, and each split hit rolls its own crit.

This is why the axis tally looks the way it does. Across all 181 blessings: Damage 49, Chance 31, Cooldown 30, **Area 25**, Duration 20, Damage-per-second 12, Knockback 8, Velocity 6, **Attack Speed 2**. Projectile count, pierce and chain **do not exist as general axes at all**; they appear only as per-ability stats bound to one specific ability. The game refuses to sell count generically because count is mathematically penalised.

**Two zone abilities that make opposite scaling choices.** Values as `[Novice, Adept, Expert, Master]`:

| Time Field (Time, Cast) | Lv1 | Lv10 |
|---|---|---|
| Cooldown | 30 s | 10.7 s |
| **Duration** | **7 s (fixed at every level)** | 7 s |
| Damage per second | 1 / 1.2 / 1.5 / 1.8 | 3.5 / 4.4 / 5.3 / 6.4 |
| Area | 10 / 10.4 / 10.9 / 11.5 | 14.9 / 16.5 / 18.3 / 20.4 |
| **Slow** | **-0.8 attack and move (fixed)** | -0.8 |

| Frost Zones (Winter, Cast) | Lv1 | Lv10 |
|---|---|---|
| Zone count | 3 / 3 / 4 / 4 | 6 / 6 / 7 / 8 |
| Damage | 1 / 1.2 / 1.5 / 1.8 | 6.9 / 8.5 / 10.2 / 12.2 |
| **Area** | **2.01 (fixed at every level and rarity)** | 2.01 |
| Frost trail duration | 2.2 s | 4.2 s |

**Time Field grows its radius and freezes its duration; Frost Zones freezes its radius and grows its count.** Two persistent-zone abilities in one game, deliberately given different growth axes so they do not feel like the same upgrade. Time Field's 80% slow never changes at any level: the control is a constant, and only damage, area and uptime scale.

**Two more execute mechanics, both role-gated:** Shatter (Winter, passive) instantly shatters chilled or frozen enemies below **9 / 12 / 15 / 18%** life. Fatality (Krom, passive) is a **21% instant kill on a minion and 7% on an elite**. The same 3:1 trash-versus-elite statement 20MTD makes at 15:1.

**Developer commentary, and it is the clearest statement of principle found in this whole research:**

> "...thanks to our enemy AI refactors, we can actually make enemies **faster and smarter, instead of just adding more hp and damage**."

Source: <https://store.steampowered.com/news/app/2334730/view/6909171012600489656>

Also worth recording, on tuning without data: *"we also **don't track any metrics on what gear most players have** and it seems we've missed the mark on the difficulty. To adjust that, we are reducing **enemy health by 30% and enemy damage by 20% across the board**."* Source: <https://store.steampowered.com/news/app/2334730/view/1797820624532108>

### Deep Rock Galactic: Survivor (DOCUMENTED, wiki Cargo tables transcribed from game data files)

| Enemy | HP | Damage | Move | XP | haz1 scalar | haz5 scalar |
|---|---|---|---|---|---|---|
| Fast Grunt | 80 | 10 | 2.30 | 1 | 1.0 | **0.95** |
| Acid Spitter | 100 | 10 | 1.38 | 1 | 1.0 | **0.95** |
| **Brown Grunt** (base trash) | **110** | 10 | 1.26 | 1 | 1.0 | **0.95** |
| Tier 2 Grunt | 135 | 10 | 1.26 | 1 | 1.0 | 0.95 |
| Flying Seeker | 250 | 10 | 1.80 | 1 | 1.0 | 0.95 |
| Slasher | 400 | 15 | 1.44 | 3 | 1.0 | 0.95 |
| Praetorian | 1,450 | 20 | 1.20 | 15 | 1.0 | 1.3 |
| Purple Champion Grunt | 1,750 | 15 | 1.38 | 20 | 1.0 | **1.2** |
| Elite Acid Spitter | 4,750 | 25 | 2.20 | 50 | 1.0 | **1.3** |
| Praetorian Elite | 6,250 | 27 | 2.00 | 50 | 1.0 | 1.3 |
| **Glyphid Dreadnought** (boss) | **16,500** | 66 | 2.40 | 100 | 1.0 | **1.4** |

**The headline: basic trash HP goes DOWN at maximum difficulty, not up. The scalar is 1.0 at Hazard 1 and 0.95 at Hazard 5.** Only mini-elites (1.2), elites (1.3) and the Dreadnought (1.4) scale upward, and several enemy types carry `scalesWithHazard = No` outright.

Difficulty is carried by enemy count, enemy speed (+2% / +4% / +6% at haz 3/4/5) and the elite and boss HP ladder, and **never** by trash durability. That is the most direct answer in this entire document to "how do they keep popcorn dying in one or two hits": they simply refuse to let difficulty touch trash HP. Per-stage inflation is tiny and published only as prose: *"Enemy HP has been buffed about 5% on stages 2-5."*

The tough-enemy ladder is done by swapping the row, not scaling it: 110 → 135 → 1,750 → 4,750 → 16,500, a 16x jump from trash to champion and 150x to boss.

**Starting weapon damage against 110 HP trash** (`damage` is authored as an **Integer** in the schema; `roF`, `reloadTime`, `tickInterval` and radii are Floats):

| Weapon | Class | Damage | roF (shots/s) | Pierce | Hits to kill a grunt |
|---|---|---|---|---|---|
| M1000 Classic | - | 140 | 0.45 | 30 | **1** |
| Warthog Auto 210 | Engineer | 80 × **5 pellets** | 1.0 | 8 | 2 pellets |
| Jury-Rigged Boomstick | Scout | 60 × **7 pellets** | 2.0 | 3 | 2 pellets |
| Bulldog Heavy Revolver | Gunner | 100 | 0.83 | 20 | 2 |
| Subata 120 | Driller | 42 | 5.0 | 4 | 3 |
| Deepcore GK2 | Scout | 35 | 4.62 | 4 | 4 |
| Lead Storm Minigun | Gunner | 28 | 20.0 | 4 | 4 |
| Zhukov NUK17 | Scout | 22 | 6.67 | 4 | 5 |

So the design point is **1 to 4 hits at minute zero, with pierce spreading each shot across 4 to 30 bodies**. Because trash HP is flat across hazard and only about +5% per stage, once the build reaches the one-shot state it **stays** there for the rest of the run.

**Pierce is modelled as projectile HP**, which is an elegant substitute for an execute mechanic: "Piercing: How much 'HP' a projectile has; passing through enemies removes HP, and passing through elites and bosses removes extra HP." Values run GK2 4, Warthog 8, Bulldog 20, M1000 30, Nishanka 50, Impact Axe 100. DRG:S has **no execute or kill threshold at all**; pierce does the crowd-clearing job instead.

**Crit is a flat 5% base on all five classes**, 200% damage for Scout and 150% for everyone else, and **status effect damage cannot crit**. Across 173 overclocks, damage appears 58 times and crit only 4: crit is a player-stat axis, not a weapon axis. No damage variance mechanic appears anywhere in the schema.

**Two governing rules for ground zones, and they are the structurally important part:**

> "the ticking damage from this effect is usually equal to a percentage of the damage of a hit from the weapon itself, which is extremely strong for weapons that deal a lot of damage in one hit"

> "Most ground zones will also apply status effect stacks as a bonus, equal to **50% of the weapon's Potency**."

**Ground-zone damage is derived from the parent weapon's hit damage rather than authored independently.** That is a third model, distinct from both VS's per-enemy re-hit delay and PoE's damage-per-second.

| Weapon | Hit damage | Zone radius | Zone lifetime | Damage per tick | Zone potency |
|---|---|---|---|---|---|
| Incendiary Grenade (Gunner starter) | 95, blast r3 | **3.0** | **5 s** | **10** | 16 |
| Voltaic Field Generator | 10 | 3.0 | 5 s | 10 | 6 |
| Neurotoxin Grenade | 85, blast r3 | 3.0 | 5 s | 3 | 16 |
| Dragonstorm Incinerator (starter) | 18 | 1.4 | 4 s | 2 | 8 |
| CRSPR Flamethrower (starter) | 40 | 1.0 | 3 s | 4 | 8 |
| Corrosive Sludge Pump | 20 | 2.0 | 3 s | 2 | 8 |
| K1-P Viper Drone | 60 | 0.5 | 2 s | 6 | 8 |

Status effects all tick every **0.5 s** and lose **20% of stacks per tick**. On that clock an Incendiary Grenade pool delivers roughly 100 total direct damage plus 16 potency of Burn.

**Read the ratio, not the totals: ground-zone direct damage is small (2 to 10 per tick) and the status stacks are the actual weapon.** A 3.0-radius, 5-second pool doing ~100 damage is not a killer against 110 HP trash; the Burn it lays on everything walking through is.

**Every turret in the game shares one template.** LMG Gun Platform (Engineer starter) 20 damage at 3.33/s; Krakatoa Sentinel 10; Voltaic Shock Fence 18; Seismic Repulsor 18. **All four have lifetime exactly 10 s, reload exactly 6.0 s, and 2 charges** (Shock Fence 3). One deployment rhythm was picked and only damage, range and element vary on top of it. The LMG platform works out to roughly 666 damage per deployment, about 6 grunt kills per turret life at base.

**Control is full-strength on trash and near-useless on bosses, by explicit resist values.** Slow is 2.5% move speed per stack capped at 70%; Freeze triggers at 2% per slow stack. Resist values: all basic trash **0**, mini-elites 0.3, elites 0.5, Praetorian Elite and Dreadnought **0.9**, Q'ronar **1.0** (immune).

**The one DRG mechanic that is a literal area-denial bubble is the one they dropped.** The Gunner's shield does not exist in DRG:S. On the Cryo Cannon the developers say: *"we kept the damage type of the weapon but changed the shooting style from a single beam to multiple rotating beams around the player to better suit the genre and support positional gameplay."* There is no freeze-ground in the game (`leavesPoolsOnGround = No`, `puddleDuration = 0`).

Sources: <https://deeprockgalactic.wiki.gg/wiki/Special:CargoTables>, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Damage>, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Stats>, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Biomes>

---

## Tuning resolution: how popcorn still dies in one hit

**Finding 1: In the small-number games the base is ~1 and it is a float, which is where the resolution comes from.** DOCUMENTED.

VS trash sits at 0.1 to 1.5 HP against 0.5 to 2.0 starting weapon damage. Brotato's basic Chaser is 1 HP. Resolution comes from decimals: VS ships Knife at `power: 0.65` and Vento Sacro at `power: 0.2`, and enemies at 0.35 and 0.95. There is no integer floor to fight.

The big-number games get the same resolution the opposite way, by having so many points that integer steps are fine: DRG:S authors `damage` as an **Integer** (110 HP grunts against 22 to 140 damage weapons) and multiplies by float percentages at runtime; Halls of Torment runs 50 to 100 damage against thousands. Both approaches work. What does *not* work is the middle: a 30-HP trash enemy against integer damage gives you neither the decimal resolution nor the headroom.

The practical consequence: a 0.65-damage Knife takes **2 hits** to kill a 1 HP zombie, and **1 hit** to kill a 0.5 HP bat. That one-vs-two-hit distinction is the entire early-game texture, and it exists only because both sides of the comparison are sub-unit floats.

**Finding 2: Crit is per-weapon, not a global stat.** DOCUMENTED.

Of the 151 entries in `Weapon.json`, 127 are actual weapons (they carry an `interval`); the rest are passive items. **30 of those 127 weapons** carry intrinsic `critChance` / `critMul`, and 97 have none. Whip 20%/×2, Knife 30%/×3, Axe 30%/×2, Vento Sacro 5%/×2, Unearthly Bolt 5%/×1 (a crit that does nothing but flash). Every area and control weapon checked has **no crit at all**: Garlic, Soul Eater, Santa Water, La Borra, Song of Mana, Mannajja and Lightning Ring all have a null `critChance`. Variance is a property the designer grants to a weapon, not a stat the player accumulates.

Read that as a rule: **VS gives crit to single-target burst weapons and withholds it from area weapons.** An area weapon hitting 30 enemies does not need variance to feel alive; the crowd already supplies it.

**Finding 3: HP does not inflate in the base game; enemy types are swapped.** DOCUMENTED. See the stage table above. This is the single biggest structural difference from what most people assume.

**Finding 4: There is a real instant-kill channel with per-enemy immunity.** DOCUMENTED.

`res_Rosary` on enemies: value 1 = killable by the erase effect (64 entries carry it explicitly), value 100 = immune (12 entries, bosses). Pentagram ships `power: 0` and `description: "Erases everything in sight."` It is not a big damage number; it is a separate kill path. Its level-ups do not touch damage at all; they buy **cooldown** (90s → 60s) and an item-preservation `chance` (10% → 65%).

This is the precedent for a kill threshold that bypasses HP entirely, and note that the designers immunised bosses against it explicitly rather than relying on the boss's HP being large.

**Finding 5: Area is a multiplier on a per-weapon base size, and it is capped.** DOCUMENTED / COMMUNITY-MEASURED.

88 of ~130 VS weapons ship `area: 1`. Area is not an absolute radius; it is a scalar on whatever that weapon's sprite/hitbox is. The outliers are meaningful: Gaze of Gaea 0.5, Carréllo 0.6, Bracelet 0.9, Victory Sword 1.4, La Borra 2, Soul Eater 3, Mannajja **6**.

Total Area from character, PowerUps and items is capped at **1000%**; Arcana bonuses bypass the cap. (COMMUNITY-MEASURED, <https://vampire.survivors.wiki/w/Area>)

---

## Weapon progression axis table

### Axis frequency across all 151 `Weapon.json` entries (DOCUMENTED)

| Axis | Times granted by a level-up | Times it is the **level-2** upgrade |
|---|---|---|
| `power` (damage) | 154 | 12 |
| `amount` (projectile count) | 141 | **29** |
| `area` | 108 | **22** |
| `interval` (cooldown) | 65 | 4 |
| `duration` | 64 | 9 |
| `speed` | 56 | 10 |
| `penetrating` (pierce) | 32 | 4 |
| `repeatInterval` (burst spacing) | 17 | 2 |
| `curse` | 21 | 3 |
| `chance` (proc rate) | 7 | n/a |
| `knockback` | **0** | n/a |
| `critChance` / `critMul` | **0** | n/a |
| `charges` | 2 | n/a |

Damage is granted most often overall, but **amount is the most common opening move**, and area is a close second. Damage is the *filler* axis, not the *headline* axis.

Note the two zeroes. **Knockback and crit are never granted by a level-up in VS.** They are fixed properties set at level 1 and never touched again. Whatever a weapon's knockback and crit are when you pick it up, they are that for the whole run.

### First-level-up by archetype (DOCUMENTED)

| Archetype | Weapons | Base stats | Level-2 axis |
|---|---|---|---|
| Directional melee | Whip (pow 1, cd 1350ms) | area 1, amount 1 | **amount** |
| Homing projectile | Magic Wand (pow 1, cd 1200ms, pierce 1) | amount 1 | **amount** |
| Fast forward projectile | Knife (pow 0.65, cd 1000ms) | pierce 1 | **amount** |
| Arcing heavy projectile | Axe (pow 2, cd 4000ms, pierce 3) | area 1 | **amount** |
| Orbital | King Bible (pow 1, cd 3000ms, dur 3000ms, hitDelay 1700ms) | amount 1 | **amount** |
| Random strike | Lightning Ring (pow 1.5, cd 4500ms, amount 2) | area 1 | **amount** |
| Orbiting bird | Peachone / Ebony Wings (pow 1, cd 1000ms, amount 4, dur 4000ms) | n/a | **amount + area** |
| **Ground puddle** | **Santa Water (pow 1, cd 4500ms, dur 2000ms, hitDelay 500ms)** | amount 1, area 1 | **amount + area** |
| **Player-centred aura** | **Garlic (pow 0.5, cd 1300ms, dur 1300ms, hitDelay 0)** | area 1 | **area + power** |
| **Wide screen sweep** | **Song of Mana (pow 1, cd 2000ms, dur 500ms, hitDelay 1000ms)** | area 1 | **area** (+100%) |
| Bouncing bomb | Cherry Bomb (pow 1, cd 3000ms, dur 2000ms) | area 1 | **area + speed** |
| Boomerang | Cross (pow 0.5, cd 2000ms) | area 1 | **power** |
| High-damage nuke | Fire Wand (pow 2, cd 3000ms, amount 3) | speed 0.75 | **power** |
| Trap / freeze | Clock Lancet (pow **0**, cd 2000ms, dur 2000ms) | area 1 | **duration** |
| Screen erase | Pentagram (pow **0**, cd 90000ms) | area 1 | **interval** |
| Defensive orbit | Laurel (pow 1, cd 10000ms, dur 5000ms) | n/a | **interval + shield time** |

The pattern is clean and directly usable:

- **Projectile weapons open on `amount`.** Every single one.
- **Area and control weapons open on `area`.** Santa Water, Garlic, Song of Mana, Cherry Bomb, Carréllo, Santa Javelin, Tonne.
- **`power` opens only for weapons whose identity is a big single hit** (Fire Wand, Cross, Bracelet, Vento Sacro).
- **`duration` opens for weapons whose identity is uptime, not damage** (Clock Lancet, Tonnado, Celestial Dusting, Spellbinder).
- **`pierce` is never an opening move.** It arrives at level 4 or later (Axe L4/L7, Magic Wand L7). It is a mid-run identity confirmation, not a first taste.

### Worked level tables for the control archetype (DOCUMENTED)

**Garlic** (aura, ticks on its own cooldown, `repeatInterval: 0`):
base `power 0.5, area 1.0, interval 1300ms, duration 1300ms, knockback 0`

| L | Grant |
|---|---|
| 2 | area **+0.4**, power +0.2 |
| 3 | interval −100ms, power +0.1 |
| 4 | area +0.2, power +0.1 |
| 5 | interval −100ms, power +0.2 |
| 6 | area +0.2, power +0.1 |
| 7 | interval −100ms, power +0.1 |
| 8 | area +0.2, power +0.2, evolves |

Max: power 1.5 (3x), area 2.0 (2x), interval 1000ms. **Area doubles, damage triples, cadence improves 23%.** The level-2 jump is the biggest area step in the whole table (+40%), the first upgrade is the one the player must *feel*.

**Santa Water** (thrown puddle):
base `power 1, area 1, interval 4500ms, duration 2000ms, hitBoxDelay 500ms, amount 1, knockback 0`

| L | Grant |
|---|---|
| 2 | amount +1, area +0.2 |
| 3 | power +1, duration +500ms |
| 4 | amount +1, area +0.2 |
| 5 | power +1, duration +250ms |
| 6 | amount +1, area +0.2 |
| 7 | power +0.5, duration +250ms |
| 8 | power +0.5, area +0.2, evolves |

Max: power 4, area 1.8, duration 3000ms, amount 4. It **strictly alternates**: odd levels buy damage and uptime, even levels buy count and size. Nothing about the weapon's shape changes; it just gets more of itself.

**Song of Mana** (the area-primary case):
base `power 1, area 1, interval 2000ms, duration 500ms, hitBoxDelay 1000ms`

| L | Grant |
|---|---|
| 2 | area **+1.0 (doubles)** |
| 3 | interval **+750ms (worse)**, duration +500ms |
| 4 | power +1, area +0.25 |
| 5 | interval **+750ms (worse)**, duration +500ms |
| 6 | power +1, area +0.25 |
| 7 | interval **+750ms (worse)**, duration +500ms |
| 8 | power +1, area +0.25, evolves |

Max: power 4, area **2.75**, duration 2000ms, interval **4250ms**. This is the answer to the area-as-primary question. VS lets area lead, and pays for it by **making the weapon fire less than half as often** while extending how long each activation persists. Net uptime goes 500/2000 = 25% to 2000/4250 = 47%. The weapon becomes a slower, bigger, longer-lasting presence rather than a faster one.

---

## Control / area weapons: the numbers

**Finding 6: Persistent-area damage is expressed as `hitBoxDelay` (per-enemy re-hit cooldown), not damage-per-second.** DOCUMENTED.

Full VS distribution of `hitBoxDelay` values in ms: 30 (×2), 100 (×1), 120 (×2), 200 (×1), 300 (×4), 350 (×1), **500 (×6)**, 750 (×2), **1000 (×10)**, 1500 (×2), 1700 (×2), 2000 (×2).

The two clusters are 500 ms (2 hits/sec) and 1000 ms (1 hit/sec). Fast-cycling contact weapons use 30–120 ms; orbital weapons use 1700 ms.

Each tick delivers the weapon's **full `power`**, not a fraction of it. There is no separate DoT stat. A puddle doing "damage over time" is simply a hitbox that re-arms per enemy.

**Finding 7: The area weapons' full numeric specs.** DOCUMENTED.

| Weapon | power | area | interval (cd) | duration | hitBoxDelay | amount | knockback | Ticks per enemy per instance |
|---|---|---|---|---|---|---|---|---|
| Garlic | 0.5 | 1.0 | 1300 ms | 1300 ms | 0 (uses interval) | 1 | **0** | 1 per 1.3 s, continuous |
| Soul Eater (evo Garlic) | **2** | **3** | 1000 ms | 1300 ms | 0 | 1 | 0 | 1 per 1.0 s, continuous |
| Santa Water | 1 | 1.0 | 4500 ms | 2000 ms | 500 ms | 1 | **0** | 4 |
| La Borra (evo) | **4** | **2** | 4000 ms | 4000 ms | 500 ms | **4** | 0 | 8 |
| Song of Mana | 1 | 1.0 | 2000 ms | 500 ms | 1000 ms | 1 | n/a | 1 |
| Mannajja (evo, **slows**) | **4** | **6** | 4500 ms | 2000 ms | 1000 ms | 1 | n/a | 2 |
| La Robba | 1 | 1.0 | 4500 ms | 2000 ms | 500 ms | 3 | n/a | 4 |
| Celestial Dusting | 0.5 | 1.0 | 6000 ms | 500 ms | 300 ms | 1 | n/a | 2 |
| Greatest Jubilee | 1 | 1.0 | 3000 ms | 100 ms | 500 ms | 1 | n/a | 1 |

Sanity-check against trash: Santa Water at level 1 delivers 4 ticks × 1.0 power = 4 total damage to an enemy that stands in it, against a 1 HP zombie and a 0.1 HP bat. **The zone one-shots trash on its first tick and the remaining three ticks are headroom for tougher spawns.** La Borra delivers 8 × 4 = 32 to the same enemy.

**Finding 8: How area DoT is made to feel fair.** INFERRED from the data patterns above, but the patterns are consistent enough that I'd act on them.

Four devices, all visible in the numbers:

- **Knockback is set to exactly 0** on Garlic, Soul Eater, Santa Water and La Borra. A zone that both damages and shoves would push enemies out of itself, so it would fight its own uptime. The control weapons deliberately do not knock back.
- **The re-hit delay is long relative to the tick weapons' delay.** 500–1000 ms versus 30–120 ms for contact weapons. This caps the zone's DPS against any *single* target while leaving its throughput against a *crowd* unbounded. That is exactly the trade a control weapon should make: it is not allowed to be a boss-killer, and it is allowed to be a crowd-eraser.
- **Base power is low, and the evolution multiplies it 4x.** Garlic 0.5 → Soul Eater 2. Santa Water 1 → La Borra 4. The base version is a chip-damage utility; the payoff version is a real weapon.
- **Duration and cooldown are tuned to a specific uptime fraction, and levels move it.** Santa Water goes 2000/4500 = 44% uptime at L1 to 3000/4500 = 67% at L8. La Borra is 4000/4000 = **100%**. The evolution's real prize is that the zones never lapse.

**Finding 9: Slow/pull as a zone effect exists, but only on evolutions.** DOCUMENTED. Mannajja (`description: "Evolved Song of Mana. Might slow enemies down."`, area 6, power 4) and Soul Eater are the two control payoffs. Garlic's base description is `"Damages nearby enemies. Reduces resistance to knockback and freeze."` The base aura's control contribution is a **debuff that makes other weapons' control work better**, not control itself. That is a cheap and interesting move worth stealing.

**Finding 10: Nothing in the genre does predictive-lead cluster targeting.** DOCUMENTED (absence).

Across all 151 `Weapon.json` descriptions the complete targeting vocabulary is: "nearest enemy" (4), "random enemy" (5), "random enemies" (1), "faced direction" (2). Everything else fires relative to the player or orbits. Brotato's Turret is stationary and shoots nearest. Soulstone Survivors added auto-aim that fires at the **nearest** enemy with a manual override.

I could not find a survivor-like that picks the densest cluster or leads a moving target. Hungry Grave's control weapon would be doing something the genre has not done. That is an opportunity and a risk: the closest thing players will have as a mental model is a MOBA/ARPG ground-targeted AoE cast by an AI, and their expectation will be that it **sometimes misses**, which is a feel problem to solve deliberately rather than inherit.

### Brotato structures (COMMUNITY-MEASURED, wiki)

| Structure | Damage | Cadence | Range / area | Scaling |
|---|---|---|---|---|
| Turret | 10 + 80% Engineering | every 0.73 s | 300 units | Engineering only |
| Landmines | 10 + 100% | 1 at wave start, then 1 per 12 s | explosion area, radius not published | Engineering, plus Explosion Damage and Explosion Size |

The design rule is the notable part: **structures ignore the player's primary stats entirely** (Damage, Life Steal, Attack Speed, Crit Chance) and scale only off a dedicated Engineering stat. That is Brotato's version of VS's per-weapon "Ignores:" list, done as a whole category rather than per weapon. An autonomous weapon that fights on its own is put on its own scaling currency so it cannot ride the player's build.

Sources: <https://brotato.wiki.spellsandguns.com/Turret>, <https://brotato.wiki.spellsandguns.com/Landmines>, <https://brotato.wiki.spellsandguns.com/Structures>

**Finding 10b: The ARPG model is the opposite of the survivor-like model, and its anti-stacking rule is the transferable part.** COMMUNITY-MEASURED (PoE wiki).

Path of Exile expresses ground effects as **damage per second**, continuous rather than ticked, and explicitly as a non-hit: "Damage over time... is damage inflicted continuously over a period of time. Unlike the other three damage sources, damage over time does not hit." Burning ground from map mods is 800 / 1200 / 1600 fire damage per second at low / mid / top tier.

The rule worth stealing is the stacking rule: "Characters and monsters can be affected simultaneously by different types of overlapping ground effects. Those of the same type do not cumulatively stack their effects. For ground effects that inflict damage, only one of each type with the highest damage per second will cause damage at any given moment."

That matters directly for Hungry Grave. An artillery weapon that lobs a zone on its own cadence will inevitably overlap its own zones, and there are three shipped answers.

VS lets overlap stack, and the exact mechanic is worth knowing: the hitbox delay is tracked **per puddle**, so four overlapping puddles are four independent damage sources, and on top of that the wiki reports that "because all active delays are reset simultaneously as soon as any one elapses, some enemies may get hit more often" than the 0.5 s delay would suggest. Overlap is therefore *superlinear* in VS, which is precisely why `amount` is a real upgrade axis for Santa Water and why La Borra ships with `amount: 4`.

PoE forbids same-type stacking outright: highest DPS wins, everything else is ignored.

Halls of Torment takes the third road with Radiant Aura, dividing one fixed damage budget across every enemy in range, so the zone is at its strongest against a single target and dilutes as the crowd grows.

Which of the three is picked decides whether the `amount` axis is meaningful at all for the Territory line, and whether a run that stacks four zones on one cluster is a satisfying payoff or an accidental infinite. (Source for the VS overlap behaviour: <https://vampire.survivors.wiki/w/Santa_Water>, COMMUNITY-MEASURED.)

Source: <https://pathofexile.fandom.com/wiki/Ground_effect>, <https://pathofexile.fandom.com/wiki/Burning_ground>

---

## Area as primary progression: what goes wrong

**Finding 11: It is precedented, and the failure mode is readability, not power.** DOCUMENTED (dev action) + COMMUNITY-MEASURED (player reports).

Deep Rock Galactic: Survivor's Update 02 ("Hoxxes Fights Back", May 2024) states the team "worked on a bunch of explosion and ground zone VFX to reduce screen clutter and improve visibility of other gameplay elements", and the game exposes settings to turn effects off. That is a developer shipping a fix for exactly this failure mode. Player reports across DRG:S and Soulstone Survivors describe late-run screens where "builds go so crazy I cannot see what is going on" and argue the real difficulty becomes visual noise rather than build quality.

Sources: <https://patchtracker.gg/deep-rock-galactic-survivor/update-02-hoxxes-fights-back>, <https://steamcommunity.com/app/2321470/discussions/0/4342103279859098015/>, <https://steamcommunity.com/app/2066020/discussions/0/603017842429854377/>

**Finding 12: VS's three structural defences against runaway area.** DOCUMENTED.

1. A **hard 1000% cap** on total Area from character, PowerUps and items.
2. **Cooldown penalties written into the level table** where area leads (Song of Mana +750 ms at L3/L5/L7).
3. **Per-weapon opt-outs.** Weapons carry an explicit `tips` field listing ignored stats. Garlic reads `"Ignores: Amount, Duration, Speed."`, Whip reads `"Ignores: Speed, Duration."`. A weapon simply does not participate in axes that would break it.

The third one is the cheapest and most transferable. Rather than balancing every stat against every weapon, VS declares per weapon which axes are inert.

**Finding 13: Area's compounding problem is that it multiplies enemy count, which multiplies every other axis.** INFERRED.

Multiplying a radius by k multiplies the covered area by k², and in a uniform-density crowd that is a quadratic increase in targets hit. Damage scales linearly with its own axis; area scales quadratically in throughput. This is why VS gives area weapons **no crit**, **zero knockback**, and **long re-hit delays**, and why the one weapon that leads on area pays in cadence. If Hungry Grave makes area the headline axis for its control weapon, the compensating axis has to be cadence or uptime, and the weapon should be excluded from crit.

---

## Open items

- Halls of Torment base trash-mob HP is genuinely unpublished. It is not on the wiki and no datamine surfaced; the only route is unpacking `hallsoftorment.pck` with GDRETools. Everything else about HoT below is sourced.
- Halls of Torment's per-minute or per-Agony-rank health multiplier for *normal* mobs is described qualitatively by both the wiki and the developers but never given a number.
- Death Must Die publishes **no absolute enemy HP value at all**: the wiki's Monster page has a Stats column for all 9 minion types and all 4 bosses and every cell is empty. Also missing there: base attack damage and attack time for any hero, base crit chance, the Min/Max Power spread width, and the DoT tick interval.
- Deep Rock Galactic: Survivor does not publish its per-stage HP multiplier table (only "about +5% on stages 2-5"), the hazard 2/3/4 scalars (only the haz1 and haz5 endpoints, implying linear interpolation), or the HP and damage percentages per Alien Threat Level tick.
- 20 Minutes Till Dawn's Glare is self-contradictory on both wikis: the infobox says "25 damage every 2 seconds", the body says "15 damage every 1 second". Treat it as 12.5 to 15 DPS, exact figure unconfirmed.
- No GDC talk or long-form developer interview on numeric tuning was found for any of these games. The patch notes are the closest thing to a design record.

---

## What this implies for Hungry Grave

Stated as implications, not decisions. INFERRED throughout.

**On the number scale.** The scale itself is a free choice, so pick the one that is cheapest to reason about, and pin the thing that actually matters: **trash should die in 1 to 4 hits at minute zero**, which every game examined holds to regardless of scale. Put trash at 1 HP and the starting weapon at 1 damage, in floats. That is literally what VS does, and it buys the one-hit/two-hit texture for free: a 0.65-damage weapon takes two hits on 1 HP trash and one hit on 0.5 HP trash. Do not reach for 30 or 300 HP trash to get tuning resolution; reach for decimals. VS and Brotato both put their weakest enemy at exactly 1 HP or below.

The honest caveat: Halls of Torment proves the opposite scale also ships, running 50 to 100 damage weapons against thousands of HP. But HoT then needs an explicit "damage cannot be reduced below 1" floor rule to stop its mitigation curve squashing hits, and it needs a separate hit-count death condition for enemies whose damage multiplier would otherwise floor everything. The big-number scale buys nothing here and costs two extra mechanics.

**On difficulty, if a difficulty setting ever appears.** Do not put it on trash HP. DRG:S makes trash *weaker* at max hazard (0.95) and spends the budget on count, speed and elite HP. 20MTD caps trash at +75% while bosses reach +150%. Death Must Die's developer says the reason out loud: *"we can actually make enemies faster and smarter, instead of just adding more hp and damage."*

**On HP over the run.** VS's base stages do not inflate HP at all. If Hungry Grave wants a storm of small interactions, the VS pattern says: hold trash HP flat, raise the enemy *count*, and introduce tougher *types* on a schedule, with deliberate dips back to weak-and-many. The per-minute multiplier is the hard-mode tool, and where it is used it is +0.10 to +0.25 per minute, linear.

**On the swallow.** Two precedents, and the second is the better fit. VS's `res_Rosary` is a kill path that bypasses HP with an explicit per-enemy immunity flag. Halls of Torment goes further: it makes *being hit n times* the death condition outright (Effigy 21 hits, Gold Slime 25 hits) and reduces incoming damage to 0.1% so that HP is decorative. If the grave swallowing a corpse is not a damage event, both games say that is genre-normal, and both put the rule on the enemy record rather than scattering a size comparison through the code.

**On whether the Territory zone should get stronger or weaker in a crowd.** This is a real fork with three shipped answers, and it should be decided before any numbers are picked. VS makes overlap superlinear, which is why `amount` is a meaningful upgrade there. HoT's Radiant Aura splits a fixed damage budget across everyone in range, so it is strongest against a lone elite and weakest in the storm. PoE refuses to let same-type zones stack at all. Hungry Grave wants a storm of many small interactions, which argues for the VS answer, but the VS answer is also the one that runs away.

**On the control weapon's level table.** The genre answer is: open on area, and pay for it in cadence. Song of Mana is the exact precedent, doubling area at level 2 and adding +750 ms of cooldown at three later levels while extending duration. Expect the tick model to be a per-enemy re-hit delay of 500 ms or 1000 ms, each tick dealing full damage, with knockback pinned at zero so the zone does not evict its own targets.

**On whether the first upgrade is a gift or a trade.** The two games answer differently and both are defensible. VS hands the player more of the weapon (amount, or area) with no downside, so the first level-up reads as pure reward. HoT makes the first offer a tension: +40% damage for -10% area, or +20% area radius, and roughly half of all its traits carry an explicit penalty. If Hungry Grave wants level-ups to be a decision rather than a dopamine tick, HoT is the model, and it costs nothing extra to build.

**On the axis order.** If the four weapon lines are Pressure, Pursuit, Repel and Territory, the VS data maps cleanly: projectile-shaped lines open on count, the Territory line opens on area, and damage is the filler axis that shows up at every other level rather than the headline. Pierce is never a first upgrade in VS; it arrives at level 4 or later.

**On the Territory zone's growth axis, if it needs a sibling later.** Death Must Die runs two persistent zones side by side and deliberately gives them different growth axes so they do not feel like the same upgrade: Time Field holds duration fixed at 7 s and grows its radius, while Frost Zones holds radius fixed at 2.01 and grows its count. Time Field's 80% slow never changes at any level, so the control is a constant and only damage, area and uptime scale. That is a clean way to make a control weapon feel reliable rather than swingy.

**On the thing with no precedent.** Predictive-lead targeting on the densest cluster does not exist in this genre. Nothing found in VS, Brotato or Soulstone Survivors goes past "nearest" or "random". That makes it a genuine differentiator and an unvalidated feel risk at the same time, and it is the part of the design most worth prototyping before committing numbers to it.

---

## Sources

Primary (shipped game data):
- Vampire Survivors `Enemy.json`, `Weapon.json`, `Stage.json`, `Character.json`: <https://github.com/Dezzelshipc/VampireSurvivorsFiles>

Community wikis:
- <https://vampire.survivors.wiki/w/Weapons>, and per-weapon pages for Garlic, Santa Water, La Borra, Song of Mana, King Bible, Whip, Axe, Magic Wand, Fire Wand, Lightning Ring, Cherry Bomb
- <https://vampire.survivors.wiki/w/Area>
- <https://vampire.survivors.wiki/w/Stages>, <https://vampire.survivors.wiki/w/The_Bone_Zone>
- <https://brotato.wiki.spellsandguns.com/Enemies>, <https://brotato.wiki.fextralife.com/Enemies>, <https://brotato.wiki.spellsandguns.com/Turret>, <https://brotato.wiki.spellsandguns.com/Landmines>, <https://brotato.wiki.spellsandguns.com/Structures>
- Halls of Torment: <https://hot.fandom.com/wiki/Game_Mechanics>, <https://hot.fandom.com/wiki/Damage>, <https://hot.fandom.com/wiki/Hall>, <https://hot.fandom.com/wiki/Torment>, <https://hot.fandom.com/wiki/Agony>, and the Lua data modules `Module:AbilityData`, `Module:AbilityTraitData`, `Module:ChampionData`. Note: the fandom pages block ordinary fetches but the MediaWiki API is open at `https://hot.fandom.com/api.php?action=parse&page=<Page>&prop=wikitext&format=json`, which returns the raw data modules.
- Path of Exile: <https://pathofexile.fandom.com/wiki/Ground_effect>, <https://pathofexile.fandom.com/wiki/Burning_ground>

Developer statements and patch notes:
- Luca Galante on balance: <https://www.pcgamer.com/vampire-survivors-creator-didnt-have-a-vision-when-he-started-making-the-game-that-allowed-him-to-quit-his-job/>
- DRG:S Update 02 VFX/clutter: <https://patchtracker.gg/deep-rock-galactic-survivor/update-02-hoxxes-fights-back>
- Halls of Torment Boglands Torment rebalance: <https://store.steampowered.com/news/app/2218750/view/1814309641609664>
- Halls of Torment post-30-minute scaling: <https://store.steampowered.com/news/app/2218750/view/6931694080291548684>

20 Minutes Till Dawn, Death Must Die, Deep Rock Galactic: Survivor:
- <https://20minutestilldawn.wiki.gg/wiki/Forest>, <https://20minutestilldawn.wiki.gg/wiki/Darkness>, <https://20minutestilldawn.wiki.gg/wiki/Weapons>, <https://20minutestilldawn.wiki.gg/wiki/Upgrades>, <https://20-minutes-till-dawn.fandom.com/wiki/Frostbite>, <https://20-minutes-till-dawn.fandom.com/wiki/Stats>, <https://20-minutes-till-dawn.fandom.com/wiki/Versions>
- <https://dmd.fandom.com/wiki/Template:JsonDumps/Blessings> (datamined game data), <https://dmd.fandom.com/wiki/Damage_Formula>, <https://dmd.fandom.com/wiki/Critical_Hits>, <https://store.steampowered.com/news/app/2334730/view/6909171012600489656>
- <https://deeprockgalactic.wiki.gg/wiki/Special:CargoTables> (game data tables), <https://deeprockgalactic.wiki.gg/wiki/Survivor:Damage>, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Stats>, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Biomes>

Player reports on area/readability:
- <https://steamcommunity.com/app/2321470/discussions/0/4342103279859098015/>
- <https://steamcommunity.com/app/2066020/discussions/0/603017842429854377/>

---

## Reproducing the Vampire Survivors numbers

Every VS figure here came from four JSON files. To re-derive or extend:

```
curl -sL -O https://raw.githubusercontent.com/Dezzelshipc/VampireSurvivorsFiles/main/Data/Vampire%20Survivors/Enemy.json
curl -sL -O https://raw.githubusercontent.com/Dezzelshipc/VampireSurvivorsFiles/main/Data/Vampire%20Survivors/Weapon.json
curl -sL -O https://raw.githubusercontent.com/Dezzelshipc/VampireSurvivorsFiles/main/Data/Vampire%20Survivors/Stage.json
curl -sL -O https://raw.githubusercontent.com/Dezzelshipc/VampireSurvivorsFiles/main/Data/Vampire%20Survivors/Character.json
```

Shapes: `Enemy.json` is `{ENEMY_KEY: [ {maxHp, power, speed, xp, knockback, skills, ...} ]}`. `Weapon.json` is `{WEAPON_KEY: [ level1_full_record, level2_deltas, ... ]}` where entries after the first contain only the stats that level grants, which is what makes the axis tally trivial. `Stage.json` is `{STAGE_KEY: [ header_with_mods, minute_records_with_enemies... ]}`.

The DLC folders (`Ode to Castlevania`, `Tides of the Foscari`, `Legacy of the Moonspell`, `Operation Guns`, `Emerald Diorama`, `Emergency Meeting`, `Ante Chamber`) carry their own `Enemy.json` / `Weapon.json` / `Stage.json` in the same shapes and were not parsed for this document.
