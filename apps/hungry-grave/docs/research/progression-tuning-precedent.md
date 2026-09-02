# Progression tuning precedent: what ships as data, what gets measured, and which knob moves first

Research for Hungry Grave. Labels: **DOCUMENTED** = from shipped game data files, decompiled resources, or a developer statement (patch note, interview, talk). **COMMUNITY-MEASURED** = wiki or player-derived. **INFERRED** = my reading across sources.

This document sits beside [survivor-numbers.md](survivor-numbers.md), which already holds the enemy HP tables, the per-weapon level tables for Vampire Survivors, the Halls of Torment ability and trait data, and the 20 Minutes Till Dawn spawn schedule. Anything already there is cited, not repeated. The new ground here is the progression layer above the weapons: how fast power arrives, what decides what is offered, and how the games that shipped made those numbers editable.

The two lineages are treated separately because they answer the question differently. Survivors-likes ship a level price curve, an offer weight table, and per-level grant tables, and tune them in patches. Arcade shmups ship almost no progression numbers at all: power reaches its ceiling in the first stage, the item placement is hand-authored per enemy, and the tunable layer is the rank and resource economy underneath.

---

## What is solid

1. **The level price curve is the one progression number that is most often compiled rather than shipped as data, and the games that did ship it as a table are the ones that could tune it per stage.** DOCUMENTED. Vampire Survivors' 20 data files (`Weapon.json`, `Enemy.json`, `Stage.json`, `PowerUp.json`, `LimitBreak.json` and 15 others) contain no XP curve; the wiki's `Module:Experience` carries the game's own `calcXpFactor` as a transcribed function, so the curve lives in code. Halls of Torment ships a six-parameter XP formula whose factors are a per-Hall table (Hall I through Final and Bonus I each get their own row). Death Must Die ships no formula at all: levels 2 to 200 are 199 fixed integers. Brotato's `(Level + 3)²` and 20 Minutes Till Dawn's piecewise-linear table are transcribed by wikis from decompiled or observed code.

2. **Offer weights ship as data in every survivors-like that could be checked, and the weight is a per-item field, not a per-tier table.** DOCUMENTED. All 151 entries in VS `Weapon.json` carry `rarity`, an integer weight from 0 to 100: the four starter weapons and Santa Water sit at 100, Cross and Fire Wand at 80, Garlic and Clock Lancet at 70, Pentagram and Laurel at 60, and 20 entries at 0 (never offered by level-up). The wiki confirms the level-up roll is `P(item) = itemRarity / poolWeight`, three or four picks without repetition, with the all-DLC weapon pool summing to 8,130 and the passive pool to 1,370. Halls of Torment gates each trait and each of its four ranks behind a hero level window. Brotato gates upgrade tiers by level (level 1 is always Tier 1, level 5 always Tier 2, levels 10, 15 and 20 always Tier 3, 25 and every fifth level after always Tier 4) and shop tiers by wave with a published per-wave chance ramp.

3. **The two survivors-like curves that were tuned in public, VS and Halls of Torment, were both tuned by touching XP income rather than the price curve, and the one time VS changed the curve it shipped a compensating stat in the same patch.** DOCUMENTED. Chasing Carrots' 2023-03-15 patch: "XP distribution has been modified among monsters, giving early monsters more XP comparatively. Completed quests now only give 0.5% additional XP instead of 1%." Their 2024-05-14 patch: "Fix: The XP curves in some halls were off. This led to vastly different XP level thresholds post level 100 between different halls. Adjusted XP drops based on Agony to scale more similarly between all halls." VS's wiki records that at levels 20 and 40 "all characters gain +100% Growth to offset a formula change that makes leveling up harder... applied retroactively and makes it especially hard at the first level it changes." Brotato's Update 1.1 swapped a character's knob outright: "Mutant: +200% XP Gain => -66% XP required to level up."

4. **Slay the Spire's Mega Crit is the only developer in this set who named the metrics in public, and both are about what an offer contains, not how often offers arrive.** DOCUMENTED. "The two most important metrics, Giovannetti says, are how often a player picks a card when given the choice (too low and it's 'basically not a card in our game at that point'), and how often a card appears in a winning deck (too high and you know that card is overpowered)." The GDC 2019 talk adds that every run of every playtester was logged from the prototype stage, that two heavy playtesters were enough to skew blind averages, and that "data is incredibly useful but it can lie to you."

5. **Hades' Supergiant read a build-distribution metric, not a pacing metric, and stopped tuning a thing when feedback on it stopped.** DOCUMENTED. Amir Rao: "for the first time we also had large amounts of anonymous player data that would tell us stuff like what weapons players would get their first clear with, or where they'd get stuck." Greg Kasavin: "As soon as there's no more feedback on a thing, it's hands off."

6. **Hopoo's first two public dev posts on Risk of Rain 2 name progression rate as the first thing they checked, and power creep from buffing weak items as the standing risk.** DOCUMENTED. Development Thoughts #1: "Happy with progression rate for classes, a touch faster than intended but still OK" and "Curious about content distribution, are players progressing through unlocks too fast? How long do the more difficult item unlocks take?" Development Thoughts #3: "Will have to make sure the game isn't slowly power creeped by continually buffing underperforming items."

7. **Chasing Carrots tune Halls of Torment by spreadsheet plus play, and say so.** DOCUMENTED. "In very simplified terms, it's playing our own game a lot and making a ton of gut decisions based on our observations. We have a lot of spreadsheets lying about that we use to plan how different progressions should play out and that tell us how we should tweak certain values to arrive at a desired outcome." They also say the moment-to-moment rules come from "vertical-scrolling shooter arcade games (think DonPachi, Raiden, Crimzon Clover)."

8. **Survivors-like level-ups arrive at roughly one to five per minute over a 17 to 30 minute run; arcade shmups deliver all of their power steps in the first stage and then hold flat.** DOCUMENTED for the shmup side, COMMUNITY-MEASURED and INFERRED for the survivors-like rates. DoDonPachi: "It takes 4 power-ups to reach full power." Touhou's Mountain of Faith runs power from 0 to 5.00 in steps of 0.05 (small) and 1.0 (large). ZeroRanger hands out one new weapon per stage, after each boss. Brotato's wiki uses level 22 as its worked example for a full run, which is 1.3 level-ups per minute of wave time. Halls of Torment's own quests ask for level 100 within the 30-minute run, 3.3 per minute. VS players describe level 150 to 200 in 30 minutes as a good result on a normal character, about 5 per minute.

9. **The shmup lineage authors item cadence per enemy and per section, by hand, and the one Toaplan designer asked about it described it as working backwards from which weapon a section needs.** DOCUMENTED. Masahiro Yuge on Slap Fight: "We'd think of what weapon would be good for a certain part of the game, then we'd make sure there were enough power-ups for you to switch to it." Battle Garegga's stage guide records that specific minecarts, tanks and pipes drop an option or a weapon fragment depending on the order they are destroyed in. Touhou's Embodiment of Scarlet Devil drops a power or point item from every third enemy killed, in a fixed repeating order.

10. **In the rank games, picking up a power item is a cost with a published price.** COMMUNITY-MEASURED from disassembly. Battle Garegga adds 2,048 rank units (0.015%) for a small shot power-up, 8,192 for a large one, and 65,536 (0.48%) for an option or a large weapon fragment, against a rank range where enemy HP runs from 1x to 3x base. The shmups.wiki stage guide's summary of stage 1 is that it "serves mostly as an opportunity to power up and gather resources for key tricks in stage 2."

11. **Slay the Spire's rarity offset is the cleanest shipped example of a pity timer on offer weights, and it is a handful of numbers.** COMMUNITY-MEASURED (wiki transcription of game code). Base card reward odds are 3% rare, 37% uncommon, 60% common; an offset starts at -5%, rises 1% every time a common is rolled, resets to -5% on a rare, and caps at +40%.

12. **Death Must Die's fixed level table front-loads the price and then flattens.** DOCUMENTED. Level 2 costs 35 XP, level 8 costs 300, level 10 costs 332, and from there the per-level price rises by only 8 to 16 XP through level 30 (523). The cost of a level-up roughly triples over the first ten levels and then holds nearly constant, which is the opposite shape from VS and 20MTD, whose per-level increments keep growing.

---

## Sub-question 1: which progression numbers ship as data

### Vampire Survivors (DOCUMENTED, game data files)

The shipped build unpacks to 20 JSON files under `Data/Vampire Survivors/`: `Achievement`, `Adventure`, `AdventureMerchants`, `AdventureStage`, `AdventureStageSet`, `Album`, `Arcana`, `Character`, `Cpu`, `CustomMerchants`, `Enemy`, `HitVfx`, `Item`, `LimitBreak`, `Music`, `PowerUp`, `Props`, `Secret`, `Stage`, `Weapon`. Source: <https://github.com/Dezzelshipc/VampireSurvivorsFiles>.

| Progression number | Where it lives | Shape |
|---|---|---|
| Per-weapon level table | `Weapon.json` | array per weapon: full record at level 1, then a delta record per level (see survivor-numbers.md for the axis tally) |
| Offer weight | `Weapon.json` `rarity` on all 151 entries, `Item.json` for passives | integer 0 to 100 |
| Roster and unlock | `Weapon.json` `isUnlocked` (137 entries), `requires` (32), `requiresMax` (16), `evoInto`, `evoSynergy`, `hidden`, `isSpecialOnly` | flags and key lists |
| Merchant price and pool cap | `Weapon.json` `price` (124), `poolLimit` (124) | integers |
| Meta progression | `PowerUp.json`, `LimitBreak.json` | per-rank tables |
| Stage spawn schedule | `Stage.json` | per-minute records (see survivor-numbers.md) |
| **XP curve** | **not in any data file** | compiled |

The `rarity` distribution across all 151 weapon entries: 0 (20 entries), 0.1 (1), 1 (45), 2 (1), 10 (4), 20 (4), 30 (3), 40 (7), 50 (34), 60 (8), 70 (5), 80 (5), 90 (2), 100 (12). Whip, Magic Wand, Knife, Axe and Santa Water are all 100. Garlic 70, Clock Lancet 70, Cross 80, Fire Wand 80, Pentagram 60, Laurel 60.

The XP curve, as transcribed on the wiki's `Module:Experience` from the game code, has two forms that agree with each other. The per-level form: 5 XP for level 2, then +10 per level up to level 20, +13 per level from 21 to 40, +16 per level from 41 on, with an extra 600 XP at level 20 and 2,400 at level 40. The closed form is `calcXpFactor(level) = min(5 + 1.5 * floor(level / 20), 8) * level²`, i.e. cumulative XP is level squared times a factor that steps 5, 6.5, 8 by 20-level band. Source: <https://vampire.survivors.wiki/w/Module:Experience>, <https://vampire.survivors.wiki/w/Level_up>.

The level-up screen offers three or four items drawn without repetition, weighted by `rarity`. An item cannot be offered once six weapons or six passives are held, or once it is at max level; when nothing is left to upgrade the screen offers gold or a Floor Chicken instead. Source: <https://vampire.survivors.wiki/w/Level_up>.

Developer patch note, 13 February 2022 (Patch 0.2.12): "Minor tweaks to weapons rarity." No VS patch note in the version history mentions the XP curve directly; the level 20 and 40 Growth bonus is the only visible trace of a curve change. Source: <https://vampire.survivors.wiki/w/Updates/Patch_0.2.12_-_small_update>, <https://vampire.survivors.wiki/w/Growth>.

### Brotato (DOCUMENTED, decompiled Godot resources; COMMUNITY-MEASURED, wiki)

Brotato is a Godot 3 game whose `Brotato.pck` (and `BrotatoAbyssalTerrors.pck`) unpack with GDRETools into an editable project. Every weapon, item and character is a `.tres` resource: `weapons/melee/`, `weapons/ranged/`, `items/`, `dlcs/dlc_1/`, and elites at `res://entities/units/enemies/elites/*.tres`. Stat logic lives in `weapons/weapon_stats/weapon_stats.gd` and `items/global/effect.gd`; weapon cooldown is authored in frames at 60 fps. Sources: <https://brotato.wiki.spellsandguns.com/Modding_Notes>, <https://github.com/SpenserHaddad/Brotato-ArchipelagoClient/blob/main/tools/extract_brotato.py>, <https://github.com/mojimoon/brotato> (a codex whose pipeline "parses Godot `.tres` resource files" into JSON).

| Progression number | Value | Source |
|---|---|---|
| Level price | `XP Required = (Level + 3)²`, so 16, 25, 36, ... | <https://brotato.wiki.spellsandguns.com/Experience> |
| Wave lengths | 20 s, then +5 s per wave to 60 s at wave 9, 60 s through wave 19, 90 s for the wave 20 boss; 1,050 s of wave time in a run | <https://brotato.wiki.spellsandguns.com/Waves> |
| Level-up offer | 4 upgrades, rerollable at the shop's reroll price | <https://brotato.wiki.spellsandguns.com/Upgrades> |
| Upgrade tier gating | level 1: 100% Tier 1; level 5: 100% Tier 2; levels 10, 15, 20: 100% Tier 3; level 25 and every 5th after: 100% Tier 4; otherwise by level and Luck as the shop does by wave | same |
| Shop tier ramp | Tier 2 from wave 2 at +6% per wave (cap 60%), Tier 3 from wave 4 at +2% (cap 25%), Tier 4 from wave 8 at +0.23% (cap 8%); `chance = ((perWave × (wave − minWave − 1)) + base) × (1 + Luck)`, checked Tier 4 first | <https://brotato.wiki.spellsandguns.com/Shop> |
| Shop offer | 4 items, lockable, rerollable; first 5 shops restricted | same |
| Danger scaling | Danger 3/4/5: +12/26/40% enemy HP and damage; Danger 0 to 2 add nothing to HP | <https://brotato.wiki.spellsandguns.com/Danger_Levels> |

The wiki's own worked example of a full run is "if you over the duration of a game would reach level 22 (5,511 XP)", and it uses that to show the diminishing return on XP Gain items: +20% XP buys about 1.5 extra levels, +200% buys 11. That quadratic price is what keeps XP items from running away. Source: <https://brotato.wiki.spellsandguns.com/Experience>.

Two developer patch lines bear directly on knobs. Update 1.1 (October 2024): "Mutant: +200% XP Gain => -66% XP required to level up." Patch 1.1.15 added "restricted level-up upgrades" per character, with Blobfish's stated goal: "The goal of this feature is not to remove options, but simply to avoid useless upgrades." Patch 0.8.0.3 buffed the XP items (Scar +15% to +20%, Black Belt +15% to +25%, Bean Teacher +30% to +40%). Sources: <https://store.steampowered.com/news/app/1942280> (Update 1.1), <https://brotato.wiki.fextralife.com/Patch_Notes>, <https://brotato.wiki.spellsandguns.com/Patch_0.8.0.03>.

### Halls of Torment (DOCUMENTED, wiki data modules and developer patch notes)

Halls of Torment is a Godot game; `hallsoftorment.pck` unpacks the same way Brotato does, and the fandom wiki mirrors the game's tables as Lua data modules (`Module:AbilityData`, `Module:AbilityTraitData`, `Module:ChampionData`, see survivor-numbers.md for the fetch route). Source: <https://github.com/OccultismCat/HallsOfTorment-CatModLoader>, <https://hot.fandom.com/wiki/Module:AbilityData>.

The XP curve is a formula whose six factors are a per-stage table:

`XP(L) = floor((fa × xa^L + fb × xb^L + k_linear) × L + k_base)`

| Hall | fa | xa | fb | xb | k_linear | k_base |
|---|---|---|---|---|---|---|
| I | 15 | 0.95 | 10 | 1.04 | 4 | -1 |
| II | 25 | 0.95 | 10 | 1.04 | 5 | 1 |
| III | 35 | 0.95 | 10 | 1.04 | 6 | 3 |
| IV | 45 | 0.95 | 10 | 1.04 | 7 | 4 |
| V | 55 | 0.95 | 10 | 1.04 | 8 | 5 |
| Final | 60 | 0.96 | 10 | 1.04 | 10 | 6 |
| Bonus I | 55 | 0.95 | 10 | 1.04 | 8 | 5 |

The decaying `15 × 0.95^L` term makes early levels cheaper in relative terms; the wiki notes that "the `10L × 1.04^L` term dominates at higher levels." At level 100 in Forgotten Viaduct the next level costs 53,679 XP and the cumulative total is 1,088,410. Source: <https://hot.fandom.com/wiki/XP>.

The trait pool is level-gated data: "Traits have Ranks indicated by Roman numerals, which are only added to the Trait Pool upon reaching a certain level," "Elevated Traits are traits that are added to the pool at a higher level," and for growth traits "the Hero's Level must be within a certain range for it to become available in the selection pool." Source: <https://hot.fandom.com/wiki/Trait>.

### 20 Minutes Till Dawn (COMMUNITY-MEASURED, wiki transcription; Unity, no public data files)

| Level range | XP to reach the level |
|---|---|
| 1 to 19 | `10 × level − 5` |
| 20 | `16 × level − 8` |
| 21 to 39 | `13 × level − 6` |
| 40 to 59 | `16 × level − 8` |
| 60+ | `level²` |

This is the same three-band 10/13/16 shape as VS with a hump at level 20, then a quadratic tail. Every small enemy drops one XP orb worth 1; elites drop a chest worth 36 XP; bosses drop no XP. The level-up offers 5 choices (4 at Darkness 9 and above). Source: <https://20minutestilldawn.wiki.gg/wiki/XP>.

The complete version history carries no line that changes this table; the tuning lines all touch enemy HP, spawn rate, and individual upgrades (see survivor-numbers.md). Source: <https://20-minutes-till-dawn.fandom.com/wiki/Versions>.

### Deep Rock Galactic: Survivor (DOCUMENTED, patch notes; level curve unpublished)

Funday Games publishes weapon and enemy tables through the wiki's Cargo tables (cited in survivor-numbers.md) but no player XP curve. The visible knobs are all on income and on meta: Update 03 raised the Clipboard of Grudges artifact's "Experience gain increased to 7-12 (was 5-10)" and made the XP Scanner find "experience twice as often"; the same update added meta upgrades that "Instantly gain three levels", give "1% increased damage for every player level", and spawn a stage-end magnet that "collects 50% of the remaining XP." A 2023 dev post set Bosco's upgrade cadence at "every few level-ups (currently 5)." Sources: <https://patchtracker.gg/deep-rock-galactic-survivor/update-03-masteries>, <https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/6539831519503503732>.

### Death Must Die (DOCUMENTED, wiki-hosted datamined tables)

"There is no formula for the Level Requirements in Death Must Die. Instead, the level requirements for levels 2 to 200 are fixed values. The maximum level is 200."

| Level | XP for this level | Cumulative |
|---|---|---|
| 2 | 35 | 35 |
| 3 | 90 | 125 |
| 5 | 180 | 445 |
| 8 | 300 | 1,245 |
| 10 | 332 | 1,897 |
| 15 | 381 | 3,711 |
| 20 | 419 | 5,730 |
| 25 | 458 | 7,940 |
| 30 | 523 | 10,411 |

Source: <https://dmd.fandom.com/wiki/Experience>. The blessing tables (offer contents) are the datamined JSON already cited in survivor-numbers.md.

### Slay the Spire and Hades, for the offer-weight shape (COMMUNITY-MEASURED)

Slay the Spire card rewards roll each card's rarity independently: 3% rare, 37% uncommon, 60% common after a normal fight; 10/40/50 after an elite; 100% rare after a boss. A rarity offset starts at -5%, rises by 1% for every common rolled, resets to -5% when a rare is rolled, and caps at +40%; boss rewards do not use the offset but a rare rolled anywhere resets it. Source: <https://slay-the-spire.fandom.com/wiki/Card_Rewards>.

Hades keeps its boon data in Lua scripts; a player reading `HeroData.lua` reported `RareChance = 0.10, EpicChance = 0.05, LegendaryChance = 0.12, ReplaceChance = 0.1`. The wiki adds that boons from Erebus gates, mini-boss rooms, and the more expensive Charon offers "are more likely to have higher rarities," and that an exchange raises the slot's rarity by one. Sources: <https://steamcommunity.com/app/1145360/discussions/0/2784864483548407451/>, <https://hades.fandom.com/wiki/Boons>.

### Risk of Rain 2, for the pacing-versus-time formula (COMMUNITY-MEASURED, wiki transcription of code)

RoR2 has no level-up offers, but it is the clearest shipped example of run length driving difficulty through one coefficient:

```
playerFactor = 0.7 + 0.3 × playerCount
timeFactor   = 0.0506 × difficultyValue × playerCount^0.2
stageFactor  = 1.15^stagesCompleted
coeff        = (playerFactor + timeInMinutes × timeFactor) × stageFactor
```

Drizzle runs time at 50% of normal pace, Monsoon at 150%. Enemies gain 30% HP and 20% damage per enemy level. Source: <https://riskofrain2.fandom.com/wiki/Difficulty>.

---

## Sub-question 2: what developers say they measure

### Mega Crit, Slay the Spire (DOCUMENTED, GDC 2019 talk and 2018 interview)

From the talk: "we built an in-house metric server that collects data from the players whenever they play a run." The passive collection mattered because "even the quiet players that just played new builds and only rarely if ever gave feedback... their data was still useful." Ascension levels were used to sort the data by player skill: "we can actually sort our metric data" and make "targeted changes for more or less hardcore players." Two cautions are given in the talk. One: Madness looked overpowered because most decks that had it "were getting it at an event that happened late in the third act," so "data is incredibly useful but it can lie to you." Two: two obsessive playtesters "were dwarfing the other players," so blind averages "basically just sampling those two people." Source: <https://www.youtube.com/watch?v=7rqfbvnO_H0> (transcript), <https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics>.

From the interview: the server logged "how often players selected a particular card when it was offered to them during their dungeon crawl, what they chose it over, how often that card appeared in winning decks, and how much damage players using that card, on average, took from a particular enemy." "The first time we made our metrics, we had three graphs; now we have at least 90." Acting on the data "was not a 'mathematical' approach"; and "Going infinite is the number one thing we try to make really rare." Source: <https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder>.

### Supergiant, Hades (DOCUMENTED, interviews)

Rao on what the data showed: "what weapons players would get their first clear with, or where they'd get stuck." On reading feedback against data: "sometimes the thing that players are the most vocal about might not even be the thing we need to look at most urgently. For example, something that wasn't upvoted a lot but appeared frequently were requests for more ways to earn gems." Kasavin on the stop condition: "As soon as there's no more feedback on a thing, it's hands off." And on the target: "Making every weapon equally balanced wasn't necessarily the end goal." Source: <https://www.pcgamer.com/a-journey-through-early-access-helped-make-hades-a-masterpiece/>.

### Hopoo Games, Risk of Rain 2 (DOCUMENTED, Development Thoughts)

DT #1 (launch week): "Happy with progression rate for classes, a touch faster than intended but still OK." "Curious about content distribution, are players progressing through unlocks too fast? How long do the more difficult item unlocks take?" "Very happy with secret progressions, players are finding it at the ideal rate." DT #3: "Noting player thoughts about specific white items (APR Rounds, Medkit, etc) feeling weak. Will have to make sure the game isn't slowly power creeped by continually buffing underperforming items." DT #13, on Artifacts: "the design of Artifacts, and the systems around it, won't prioritize balance." Sources: <https://www.tumblr.com/hopoo/183824942129/hopoo-games-development-thoughts-1>, <https://www.tumblr.com/hopoo/184461870729/hopoo-games-development-thoughts-3-hi-it-has-been>, <https://devtrackers.gg/risk-of-rain/p/d97a58d4-development-thoughts-13-artifacts-update>.

### Chasing Carrots, Halls of Torment (DOCUMENTED, interview and patch notes)

The interview quote in finding 7 is the whole of their public method: play, gut, spreadsheets that plan "how different progressions should play out," then community sentiment. Their patch notes show what that produced: the 2023-03-15 note moved XP among monsters and halved the quest XP bonus; the 2023-08-31 note introduced Agony Mode where "Monster count, monster health, and XP drops are dynamically scaled based on your performance"; the 2024-05-14 note fixed per-hall XP curves and rescaled Agony XP drops; the 1.0 note made "Jade Amulet now converts collected gold to XP"; and the 2025 experimental branch raised Sage trait XP gain from 3/5/7/10% to 5/8/12/16% and lowered the "Experience Horde" quest from level 150 to 140. Sources: <https://fullcleared.com/features/inside-halls-of-torment-an-interview-with-chasing-carrots/>, <https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/5125698536850114544>, <https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/5141476355657088929>, <https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/5768625435399294703>, <https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/6341720536520860655>, <https://consolepcgaming.com/exciting-changes-coming-to-halls-of-torments-experimental-branch/>.

### poncle, flanne, Blobfish, Funday Games, Realm Archive (DOCUMENTED where quoted)

Luca Galante has said he does not care much for balance (survivor-numbers.md) and that his gambling background influenced "just the treasure chest openings." No poncle statement on XP tuning or metrics was found. Source: <https://www.gamedeveloper.com/design/vampire-survivors-development-sounds-like-an-open-source-fueled-fever-dream>.

flanne, on 20 Minutes Till Dawn's design target: "I think there is an audience that wants a game that has depth in mechanics but with short, casual play sessions," and the demo was built in two weeks and posted for feedback before anything else. No statement on measurements. Source: <https://howtomarketagame.com/2022/06/14/20-minutes-till-dawn/>.

Blobfish's only progression statement found is the restricted-upgrades rationale in the Brotato section. Funday Games' Update 03 states that Masteries "makes fundamental changes to the way you gain power between dives," with no measurement named. Realm Archive's statement that they "don't track any metrics on what gear most players have" is in survivor-numbers.md.

### Cave and Toaplan (DOCUMENTED, interviews)

Ikeda, Kouyama and Ichimura on DoDonPachi's process: difficulty is "done in parallel with the rest of the development, by the programmers themselves who test for bugs and adjust the difficulty as they go. Then, 2 to 3 weeks before the master app is due, we use that time to playtest extensively and debug." Hibachi's tuning target was a yes-or-no question: "can this be done on one credit? And during our final stage of fine-tuning Dodonpachi we determined it was possible, and that's the difficulty we left it at." Source: <https://shmuplations.com/dodonpachi/>.

Toaplan's Yuge, on Hishouzame: "If there were something I could change about Hishouzame, I'd like to try making the stages longer." Uemura on how he got good at tuning: "Since I intentionally programmed the strategic patterns needed for each area, I know when and where enemies appear. I really did a lot of experimenting with tuning the difficulty." Source: <https://shmuplations.com/toaplan-chronicleqa/>.

---

## Sub-question 3: cadence against run length

### Arcade shmup stage lengths (COMMUNITY-MEASURED, speedrun boards and wikis)

Speedrun times are a floor on stage length, since scrolling is fixed and only bosses can be shortened; typical clears run a few minutes longer.

| Game | Stages | Record full run | Per stage | Source |
|---|---|---|---|---|
| DoDonPachi (1997) | 6 (+ second loop) | 16:33 (1P Normal) | ~2:45 | <https://www.speedrun.com/dodonpachi> |
| Mushihimesama (2004) | 5 | 17:05 (2P), 18:40 (1P) | ~3:30 to 3:45 | <https://www.speedrun.com/mushihimesama> |
| Battle Garegga (1996) | 7 | 23:04 (1P) | ~3:20 | <https://www.speedrun.com/battle_garegga> |
| Ikaruga (2001) | 5 chapters | 20:19 (1CC), 25:53 (any); wiki: "about 25 minutes" | 4 to 5 min | <https://www.speedrun.com/ikaruga>, <https://shmups.wiki/library/Ikaruga> |
| ZeroRanger (2018) | Green Orange (main mode) | 39:54 true ending, 28:53 any%; White Vanilla 9:45 | not published per stage | <https://www.speedrun.com/zeroranger> |
| Devil Engine (2019) | 6 | no leaderboard; a full clear video runs about 28 minutes | ~4:30 | INFERRED from <https://howlongtobeat.com/game/65123> and review descriptions |

### How shmup power-up cadence is authored

DoDonPachi (DOCUMENTED, shmups.wiki): "It takes 4 power-ups to reach full power. Dying will reduce the player's strengthened weapon by one level and the non-strengthened weapon reverts back to level 1." Bombs start at 3 and gain 1 per death to a max of 6; a Max Power item "only appears after the player loses their last life." Each stage hides 13 bee medals. Source: <https://www.shmups.wiki/library/DoDonPachi>, <https://www.world-of-arcades.net/Cave/DoDonpachi/ItemsAndScores.htm>.

Mushihimesama (COMMUNITY-MEASURED): a `FirePower` variable counts power-ups received, starting at 1; up to 4 options; each dropped item carries a timer and cycles type when it expires, always starting on the type chosen at the start. The score counter formula includes `(5 − StageNumber)`, so the stage index is itself a term. Source: <https://www.world-of-arcades.net/Cave/Mushihimesama/System.htm>.

Ikaruga (DOCUMENTED, shmups.wiki): "There are no power-ups or items to pick up and there is no rank system." The only resource is the Energy Bar: twelve blocks, ten absorbed bullets per block, released as up to twelve homing lasers each worth five single shots. Source: <https://shmups.wiki/library/Ikaruga>.

Battle Garegga (COMMUNITY-MEASURED, shmups.wiki): drops are authored per enemy and per kill order. "A minecart will drop an option power up or a small weapon fragment depending upon whether or not the cart ahead of it has already been destroyed." Tanks drop a medal if killed while crushing a house, otherwise a weapon fragment; a large pipe "always drops an option power-up." Every pickup adds rank (finding 10). Sources: <https://shmups.wiki/library/Battle_Garegga/Stages>, <https://www.shmups.wiki/library/Battle_Garegga/Advanced_Rank>.

Touhou (COMMUNITY-MEASURED, Touhou Wiki): EoSD: "Point Items and Power Items drop from every third enemy defeated. The drops follow this pattern in order, repeating after the end of the list." Perfect Cherry Blossom: power maxes at 128, "large power items are worth 8 power items," and at max power the power drops turn into score items. Mountain of Faith: power runs 0 to 5.00, small items +0.05, large +1.0, a bomb costs 1.0 power and an option, dying costs 3.20 power. Sources: <https://en.touhouwiki.net/wiki/Embodiment_of_Scarlet_Devil/Gameplay>, <https://en.touhouwiki.net/wiki/Perfect_Cherry_Blossom/Gameplay>, <https://en.touhouwiki.net/wiki/Mountain_of_Faith/Gameplay>.

ZeroRanger (DOCUMENTED, developer interview and wiki): "Getting an upgrade each stage making you more all-powerful in the journey was a good fit for that theme. The concept was partially inspired by the original Mega Man X." Weapons are awarded "after defeating bosses." The weapon that was cut, Trident, "got scrapped for serving pretty much no strategic purpose. The charge/lock-on mass destruction weapons worked way better to inform stage design." Sources: <https://www.lost-town.com/ZeroRangerInterview.php>, <https://en.wikipedia.org/wiki/ZeroRanger>.

Devil Engine (COMMUNITY-MEASURED, review): three weapon types switched by pickup; "collecting two more of the same power-up will enhance the strength of your current shot"; bombs refill from a 5,000-point gauge and an extra life arrives at 50,000. Source: <https://www.nintendolife.com/reviews/switch-eshop/devil_engine>.

A shmup design essay hosted on shmups.wiki states the community rule of thumb on power-up magnitude: "Increasing the damage in a straightforward manner will most likely lead to balancing issues... Shmups get around this problem by simply lying to the player about their power level, increasing damage by a very small amount (for example x1.1)." COMMUNITY-MEASURED, not a developer statement. Source: <https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101>.

### Survivors-like run lengths and level-ups per minute

| Game | Run length | Power steps | Rate | Label |
|---|---|---|---|---|
| Vampire Survivors | 30 min | level 150 to 200 reported as a good normal-character result | ~5 to 7 level-ups per minute | COMMUNITY-MEASURED, <https://steamcommunity.com/app/1794680/discussions/0/3717188244455231479/> |
| Brotato | 1,050 s of waves (17.5 min) plus 20 shops | wiki example: level 22; plus up to 4 shop buys per wave | 1.3 level-ups per minute of wave time; with shop buys roughly 3 to 4 power steps per minute | DOCUMENTED (wave table, example), INFERRED (combined rate) |
| Halls of Torment | 30 min | quests ask for level 100 (later "Experience Horde" at 150, then 140) | 3.3 level-ups per minute | DOCUMENTED (quest targets in patch notes) |
| 20 Minutes Till Dawn | 20 min | not published | unknown | none found |
| Deep Rock Galactic: Survivor | 5 stages per dive | not published; Bosco upgrade every 5 level-ups | unknown | DOCUMENTED for the Bosco cadence only |
| Death Must Die | ~20 to 25 min | max level 200 | unknown | DOCUMENTED for the cap only |

The rate comparison worth carrying: a survivors-like delivers a power step every 12 to 45 seconds all the way through the run, with the price curve rising and the enemy count rising faster (VS's per-level increment grows by 10, 13, 16 while concurrent enemies go 15 to 300, per survivor-numbers.md). An arcade shmup delivers four power steps in its first stage, holds power flat for the remaining 15 to 20 minutes, and spends the run on a different economy: bombs, medals, rank, extends. INFERRED from the tables above.

---

## Sub-question 4: which knob first

No developer in this set states a knob order outright. What can be read from patch history and statements is consistent enough to report, with the label INFERRED on the ordering itself and DOCUMENTED on each supporting fact.

**Pool and contents were touched most often and first.** Slay the Spire's two named metrics are pick rate and win-deck rate, both properties of what is offered (DOCUMENTED). Brotato's restricted-upgrades feature edits the pool per character "to avoid useless upgrades" (DOCUMENTED). VS's 0.2.12 tweaked weapon rarity, i.e. the offer weights, three months into release (DOCUMENTED). Hades' data was read for which weapons cleared first and where players got stuck, i.e. contents and pacing of difficulty, not offer frequency (DOCUMENTED).

**Cadence was tuned through income, not through the price curve.** Halls of Torment moved XP among monsters and rescaled XP drops by Agony; DRG:S raised an XP artifact and doubled the XP Scanner; Brotato buffed three XP items in one patch (all DOCUMENTED). The one Brotato change that touched the price directly was a per-character swap from "+200% XP Gain" to "-66% XP required," which is arithmetically the same rate with a different diminishing-returns profile (DOCUMENTED).

**The price curve itself changed rarely, and when it did the change was either a fix or was compensated.** HoT's 2024-05-14 curve change is labelled "Fix." VS's level 20 and 40 humps ship with a matching +100% Growth "to offset a formula change" (both DOCUMENTED). Across the VS version history, the 20MTD version history, and the Brotato patch notes read for this document, no other line changes a level price.

**Per-level tables were tuned as individual weapon balance, not as progression.** Every per-level change found (Brotato Spoon IV, 20MTD Grenade Launcher, HoT Arcane Rift, DRG:S overclocks) is framed as a weapon change and sits in a weapon section of the notes (DOCUMENTED). RoR2's stated risk with that layer is creep: "make sure the game isn't slowly power creeped by continually buffing underperforming items" (DOCUMENTED).

**The stop condition was feedback, not a number.** Kasavin: "As soon as there's no more feedback on a thing, it's hands off." Ikeda on Hibachi: "can this be done on one credit?" Chasing Carrots: "read a lot of comments to get hold of the current sentiments regarding the balancing." All DOCUMENTED.

Reading those together, the order the shipped games actually followed is: fix what an offer contains (pool, weights, per-item power), then move income to hit the intended rate, and leave the price curve alone unless it is wrong. INFERRED.

---

## Open items

- No developer statement on level-ups per minute as a target was found for any survivors-like. The closest are HoT's quest thresholds (level 100, 150, 140 in 30 minutes) and Hopoo's "progression rate for classes, a touch faster than intended."
- Deep Rock Galactic: Survivor's player XP curve and level-up offer count are not published anywhere reachable; the wiki.gg site has no page for it and the patch notes only touch income.
- 20 Minutes Till Dawn's typical end-of-run level is not published, so its rate cannot be stated.
- Death Must Die's typical end-of-run level is not published; only the 200 cap and the price table are.
- Per-stage lengths for DoDonPachi, Mushihimesama and Garegga are derived from full-run speedrun times divided by stage count; no per-stage board was found. Devil Engine has no speedrun.com board at all, so its run length rests on a single clear video's duration.
- ZeroRanger's per-stage timing and stage count per mode are not on its wiki; only mode-level speedrun times are available.
- The Hades boon rarity numbers come from one forum reader of `HeroData.lua`, not from a published data file; the wiki confirms the qualitative behaviour only.
- Battle Garegga's designer Shinobu Yagawa has interviews in translation, but the one read for this document (on Daifukkatsu Black Label) does not discuss rank or item design; the rank numbers here are community disassembly.
- The HoT "level 80 as intended endgame" wording that circulates in Steam forum summaries could not be found in any Chasing Carrots patch note pulled through the Steam news API; what is in their own notes is that class master quests "supersede the character quests to reach level 100."
- No Cave or Treasure statement on why stages are the length they are was found; the Toaplan wish for longer stages is the only developer remark on stage length.

---

## What this implies for Hungry Grave

Stated as implications, not decisions. INFERRED throughout.

**On the kill-priced drop table.** The rising table of kill prices is the same object as a level price curve, and the two survivors-likes that could tune theirs per stage are the ones that shipped it as a table (Halls of Torment per Hall, Death Must Die as 199 fixed integers). VS, which compiled its curve, has changed it exactly once and had to ship a compensating stat to hide the seam. Ten to twelve rows for a five-minute stage is closer to Death Must Die's shape than to anyone's formula, which argues for the table being literal numbers in a data file rather than a formula with parameters.

**On what the table's shape should look like.** Death Must Die front-loads the price and then flattens, so the mid-run level-up rate is nearly constant; VS and 20MTD keep growing the increment and rely on enemy count outrunning it. For a five-minute run with no time to let density outrun price, the DMD shape (steep first three or four rows, then near-flat) is the one that keeps drops arriving at a readable rhythm through the miniboss and the boss.

**On the rate.** Ten to twelve drops in five minutes is 2 to 2.4 per minute. That is below Halls of Torment's 3.3 and VS's 5 or more, above Brotato's 1.3 level-ups per minute of wave time, and above every arcade shmup after its first stage. It is a survivors-like rhythm inside a shmup-length stage, and the shmup precedent says the first few steps should land fast: DoDonPachi reaches full power in four pickups inside stage 1, Touhou's early enemies drop a power item every third kill. A table whose first three rows are cheap gets the same effect.

**On four lines at five levels against ten to twelve drops.** Twenty possible levels and about eleven drops means a run maxes roughly two lines, or spreads four lines to level three. VS gets the same forced choice from its six-slot cap; Brotato from its four-slot shop and quadratic price. The cap is doing design work in both games, so the drop count is a real design number and not just pacing.

**On the offer of three.** The offer's contents are where every developer in this set looked first. If the offer ever gets weights, VS's precedent is a per-line integer, not a tier table, and Slay the Spire's precedent for keeping a line from never appearing is a small offset that climbs each time it is passed over and resets when it is taken. Both are a handful of numbers, and both belong in the same data file as the drop table. What an offer contains is also the most natural thing to log per drop: which three were shown, which was taken, at what kill count.

**On what to log and read.** The measurements with developer backing are: time of each drop (Hopoo's "progression rate"), which line was taken when offered and which lines are in runs that reach the boss (Mega Crit's pick rate and win-deck rate), and where runs end (Supergiant's "where they'd get stuck"). Kill rate around each drop is the Hungry Grave equivalent of Mega Crit's "damage taken from a particular enemy." Two cautions travel with those: a small number of heavy players will dominate any average, and a line that is taken late because that is when it is offered will look stronger than it is.

**On which knob first.** The shipped order was contents, then income, then curve. For Hungry Grave that reads as: fix what each line's five levels buy and what the offer of three can contain, then move kill income (enemy count, XP-equivalent per kill) to hit the intended drop rhythm, and treat the drop table itself as the thing that is changed last and least.

**On the miniboss and the boss.** ZeroRanger hands out its upgrade after each boss, Hades raises rarity after mini-boss rooms, and Slay the Spire makes the boss reward all-rare. All three tie a guaranteed or upgraded offer to the beat the player just survived. A drop pinned to the miniboss kill, priced at zero on the table, has three precedents.

**On the roster from a growing pool.** VS's roster is `isUnlocked` plus `requires` on each weapon record, so the pool and its growth are in the same file as the weights. Hades' keepsakes let the player bias the first offer toward one god without changing the pool. If Hungry Grave's per-run roster draws from a growing pool, the VS shape (flags on the line record, in the data file) is the cheapest, and the Hades shape is the one to reach for if the player ever needs to steer a draw.

**On the shmup economy underneath.** Once power plateaus, the arcade games run on bombs, extends, medals and rank, and Garegga prices every pickup in rank. Hungry Grave's drops are its power steps, but the shmup lineage suggests the second economy (the swallow, the close-pressure reward, whatever fills the role of bombs and medals) is where the last two minutes of a five-minute stage will get their texture once the lines are near max.

---

## Sources

Primary (game data, decompiled resources, developer statements):
- Vampire Survivors data files: <https://github.com/Dezzelshipc/VampireSurvivorsFiles> (`Weapon.json` parsed for `rarity`, `isUnlocked`, `requires`, `poolLimit`; repository tree checked for an XP file)
- Vampire Survivors patch 0.2.12: <https://vampire.survivors.wiki/w/Updates/Patch_0.2.12_-_small_update>
- Brotato decompilation route and resource layout: <https://brotato.wiki.spellsandguns.com/Modding_Notes>, <https://github.com/SpenserHaddad/Brotato-ArchipelagoClient/blob/main/tools/extract_brotato.py>, <https://github.com/mojimoon/brotato>
- Brotato patch notes: <https://brotato.wiki.fextralife.com/Patch_Notes>, <https://brotato.wiki.spellsandguns.com/Patch_0.8.0.03>, Steam news for app 1942280 (Update 1.1)
- Halls of Torment patch notes via the Steam news API (app 2218750): 2023-03-15, 2023-08-31, 2024-05-14, 1.0; experimental branch coverage: <https://consolepcgaming.com/exciting-changes-coming-to-halls-of-torments-experimental-branch/>
- Halls of Torment interview: <https://fullcleared.com/features/inside-halls-of-torment-an-interview-with-chasing-carrots/>
- Deep Rock Galactic: Survivor Update 03: <https://patchtracker.gg/deep-rock-galactic-survivor/update-03-masteries>; Bosco dev post via Steam news (app 2321470)
- Slay the Spire GDC 2019 talk: <https://www.youtube.com/watch?v=7rqfbvnO_H0>, <https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics>; interview: <https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder>
- Hades: <https://www.pcgamer.com/a-journey-through-early-access-helped-make-hades-a-masterpiece/>
- Risk of Rain 2 Development Thoughts #1, #3, #13: <https://www.tumblr.com/hopoo/183824942129/hopoo-games-development-thoughts-1>, <https://www.tumblr.com/hopoo/184461870729/hopoo-games-development-thoughts-3-hi-it-has-been>, <https://devtrackers.gg/risk-of-rain/p/d97a58d4-development-thoughts-13-artifacts-update>
- Cave and Toaplan interviews: <https://shmuplations.com/dodonpachi/>, <https://shmuplations.com/toaplan-chronicleqa/>
- ZeroRanger interview: <https://www.lost-town.com/ZeroRangerInterview.php>
- 20 Minutes Till Dawn developer quotes: <https://howtomarketagame.com/2022/06/14/20-minutes-till-dawn/>
- Vampire Survivors creator on tools: <https://www.gamedeveloper.com/design/vampire-survivors-development-sounds-like-an-open-source-fueled-fever-dream>

Community wikis and boards:
- <https://vampire.survivors.wiki/w/Module:Experience>, <https://vampire.survivors.wiki/w/Level_up>, <https://vampire.survivors.wiki/w/Growth>
- <https://brotato.wiki.spellsandguns.com/Experience>, <https://brotato.wiki.spellsandguns.com/Waves>, <https://brotato.wiki.spellsandguns.com/Upgrades>, <https://brotato.wiki.spellsandguns.com/Shop>, <https://brotato.wiki.spellsandguns.com/Danger_Levels>
- <https://hot.fandom.com/wiki/XP>, <https://hot.fandom.com/wiki/Trait>
- <https://20minutestilldawn.wiki.gg/wiki/XP>, <https://20-minutes-till-dawn.fandom.com/wiki/Versions>
- <https://dmd.fandom.com/wiki/Experience>
- <https://slay-the-spire.fandom.com/wiki/Card_Rewards>
- <https://hades.fandom.com/wiki/Boons>, <https://steamcommunity.com/app/1145360/discussions/0/2784864483548407451/>
- <https://riskofrain2.fandom.com/wiki/Difficulty>
- <https://www.shmups.wiki/library/DoDonPachi>, <https://shmups.wiki/library/Ikaruga>, <https://shmups.wiki/library/Battle_Garegga/Stages>, <https://www.shmups.wiki/library/Battle_Garegga/Advanced_Rank>, <https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101>
- <https://www.world-of-arcades.net/Cave/Mushihimesama/System.htm>, <https://www.world-of-arcades.net/Cave/DoDonpachi/ItemsAndScores.htm>
- <https://en.touhouwiki.net/wiki/Embodiment_of_Scarlet_Devil/Gameplay>, <https://en.touhouwiki.net/wiki/Perfect_Cherry_Blossom/Gameplay>, <https://en.touhouwiki.net/wiki/Mountain_of_Faith/Gameplay>
- <https://en.wikipedia.org/wiki/ZeroRanger>, <https://www.nintendolife.com/reviews/switch-eshop/devil_engine>, <https://howlongtobeat.com/game/65123>
- speedrun.com boards via the public API: <https://www.speedrun.com/dodonpachi>, <https://www.speedrun.com/mushihimesama>, <https://www.speedrun.com/battle_garegga>, <https://www.speedrun.com/ikaruga>, <https://www.speedrun.com/zeroranger>
- <https://steamcommunity.com/app/1794680/discussions/0/3717188244455231479/>

---

## Reproducing the checks

VS `Weapon.json` field census and `rarity` distribution:

```
curl -sL -O https://raw.githubusercontent.com/Dezzelshipc/VampireSurvivorsFiles/main/Data/Vampire%20Survivors/Weapon.json
python3 -c "import json,collections;w=json.load(open('Weapon.json'));print(collections.Counter(v[0].get('rarity') for v in w.values()))"
```

Developer patch note bodies for any Steam app, without the store's page chrome:

```
curl -s 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=2218750&count=300&maxlength=0&format=json'
```

Speedrun record times per category:

```
curl -s 'https://www.speedrun.com/api/v1/games/dodonpachi?embed=categories'
curl -s 'https://www.speedrun.com/api/v1/leaderboards/<gameId>/category/<categoryId>?top=1'
```
