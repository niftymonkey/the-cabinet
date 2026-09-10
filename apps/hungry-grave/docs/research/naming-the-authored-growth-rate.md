# Naming the authored growth rate: what shipped games call a time-keyed continuous spawn schedule

Research for Hungry Grave. Labels: **DOCUMENTED** = a shipped data file, decompiled source, a developer statement, or a modding reference generated from the shipped binary. **COMMUNITY-MEASURED** = a wiki transcription of shipped behaviour, a datamined table, a forum report. **INFERRED** = my reading across sources.

The question this answers: the design record adds a time-keyed enemy growth rate per section, a mob type plus a template plus a rate of bodies a second that ramps between two figures across the section's authored span and repeats down to a minimum interval. The step 4 brief called it a **floor stream**; the design record renamed it a **standing row** (`docs/design/mow-ladder-director.md` section 3, `CONTEXT.md` line 121). Craft calls are settled by research, so this record settles the word, and separately checks whether the shape the word names is one shipped games actually build.

This sits beside [director-precedent.md](director-precedent.md), [stage-length-with-a-director.md](stage-length-with-a-director.md) and [survivor-numbers.md](survivor-numbers.md). Those already hold Brotato's full `WaveGroupData` field list, the Left 4 Dead threat-population slides, the Vermintide and Darktide pacing states and Vampire Survivors' Mad Forest schedule. Anything there is cited, never repeated. The new ground here is the vocabulary itself: which word each shipped format puts on the continuous thing, which word it puts on the one-shot thing, and what happens when those words are laid against this project's glossary.

---

## What is solid

These are the claims I would build on.

1. **"Wave" is a contested word inside the survivors-like lineage: it names the continuous schedule in the genre's biggest game and the one-shot group in four others.** Vampire Survivors' wiki: "Enemies normally arrive in waves - one wave every minute," and "Each wave specifies a minimum amount and a spawn interval for the enemies," against "Map events are short events that spawn groups of enemies outside the regular spawning cycle" (<https://vampire.survivors.wiki/w/Enemies>). Halls of Torment uses it for both, a two-minute "wave" against a "special wave". Death Must Die, Deep Rock Galactic: Survivor and Soulstone Survivors use "wave" for the one-shot and something else for the continuous thing. COMMUNITY-MEASURED, section 1.

2. **The shmup lineage uses "wave" for the one-shot group, which is the opposite assignment, and it has no word at all for the continuous trickle.** SHMUP Creator defines a wave as "a formation, a group of the same enemy starting from the same position" with a count and an interval and no loop or duration property; SHMUPKIT calls it an "attack wave"; Tyrian, Danmakufu, Taisei and the Lazy Devs Pico-8 kit have no group noun at all and call the unit an event, a task or a spawn. DOCUMENTED, section 2. Cross the two genres and the same five letters name the continuous schedule on one side and the one-shot group on the other, so "wave" cannot be borrowed here without reading backwards to half the audience.

3. **Vampire Survivors' shipped stage data has no name for the row at all: it is an anonymous object keyed by `minute`.** Each stage in `Stage.json` is a JSON array whose entries carry `"minute"`, `"minimum"`, `"frequency"`, `"enemies"`, `"bosses"` and `"events"`. Mad Forest minute 0 is `{"minute": 0, "minimum": 15, "frequency": 1000, "enemies": ["BAT3"], "bosses": []}`. The word "wave" is the community's, not the data's. DOCUMENTED (<https://github.com/Dezzelshipc/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Stage.json>).

4. **Brotato ships the continuous case and the one-shot case as one resource type distinguished by a field, and that field is called `repeating`.** `WaveGroupData` declares `repeating = 999`, `repeating_interval = 3`, `reduce_repeating_interval = 0`, `min_repeating_interval = 1`, alongside `is_boss`, `is_horde` and `is_loot`. A one-shot group is the same resource with `repeating` set low. DOCUMENTED (<https://github.com/Yeet195/BrotatoDecompiled/blob/main/Brotato/zones/wave_group_data.gd>).

5. **Half of the shape ADR 0060 rules is precedented and half is not.** The repeat-down-to-a-minimum-interval half is shipped in the genre: Brotato's `repeating_interval` reduces by `reduce_repeating_interval` toward a floor of `min_repeating_interval`, and a shipped mod's magician group reads `repeating = 999, repeating_interval = 11, reduce_repeating_interval = 1, min_repeating_interval = 8`. The ramp-between-two-figures-across-a-span half is not what survivors-likes do; the nearest shipped case is outside the genre, in GTFO's `m_populationPointsPerWaveStart`, `m_populationPointsPerWaveEnd` and `m_populationRampOverTime`, documented as "Lerp over time for start-end population point settings". DOCUMENTED both. Section 5 records the disagreement.

6. **Left 4 Dead's word for the continuous baseline is population, and it is deliberately not an entry in a timeline.** Booth's deck names a "Full Threat Population" of "Wanderers, Mobs, Special Infected" against a "Minimal Threat Population", and a separate "Boss Population" dealt from a shuffled deck. DOCUMENTED (deck, quoted in [director-precedent.md](director-precedent.md) claims 3 and 4). The word describes a level of occupancy the director maintains, never a row somebody authored at a time.

7. **Risk of Rain 2 has three separate words and none of them is a row: `DirectorCard`, `monsterCredit`, `difficultyCoefficient`, plus `minSeriesSpawnInterval` for the run of bodies one card pays out and `shouldSpawnOneWave` for the one-shot case.** DOCUMENTED (<https://github.com/DaveAldon/RiskOfRain2-Open-Source/blob/master/Assembly-CSharp/RoR2/CombatDirector.cs>). This game already took `Card` and `Purse` from that lineage, and the growth half it takes from the same source is a coefficient rather than a named entry.

8. **The design literature uses "wave" as the umbrella for both, and distinguishes them by method name rather than by noun.** Wyatt Cheng's chapter "Procedural Enemy Waves" runs "METHOD 1: SPAWN BY TIMER", "METHOD 2: SPAWN ON COMPLETION", "METHOD 3: CONTINUOUSLY ESCALATING TOTAL" and "METHOD 4: HITPOINT PROGRESSION", all four of them ways of authoring enemy waves. DOCUMENTED (chapter 14 of Short and Adams, *Procedural Generation in Game Design*, CRC Press).

9. **Every genre word for the continuous thing is already spent in this glossary.** Banned or taken across `CONTEXT.md`'s Avoid lists: wave, wave entry, wave table, special wave, swarm wave, spawn, spawn rate, spawn event, spawn type, spawner, faucet, formation, pattern, group, packet, horde, pool, unit, floor stream. "Stream" is taken twice over, by `StreamName` in `rng.ts` and by the skull stream weapon line. "Floor" is taken three times, by Size floor, floor events and the rows-are-the-floor language of ADR 0047. DOCUMENTED (the glossary and the source).

10. **So the pick cannot be a borrowed genre noun, and the real choice is which qualifier goes in front of "row".** That reframes criterion (a): precedent does not supply a usable word, but it does supply a usable qualifier, because Brotato's own distinguishing field is literally named `repeating`. INFERRED.

11. **Where a format holds both concepts, it almost never makes the continuous case a second kind of entry: it is the same entry with a different field.** Vampire Survivors puts `frequency`, `bosses` and `events` on one per-minute object. Brotato puts `repeating_interval` and `is_boss` on one `WaveGroupData`. Taisei writes `TASK(drop_swirls, { int cnt; ... })` and `TASK(sinepass_swirls, { int duration; ... })`, the same construct with a count in one and a duration in the other. DOCUMENTED. This is strong support for ADR 0060's "never a second timeline" and mild pressure against its "a second kind of row". Open items.

12. **The one shipped vertical shmup found carrying both puts the continuous half on the level and lets the timeline retune it.** Tyrian's `.lvl` file supplies `levelEnemyMax`, `levelEnemy[40]` and `levelEnemyFrequency`, run by an unnamed block commented `/* New Enemy */`, while scheduled arrivals are `event` records; event type 37 exists solely to write a new `levelEnemyFrequency` mid-stage. DOCUMENTED (<https://raw.githubusercontent.com/opentyrian/opentyrian/master/src/tyrian2.c>). That is a third shape neither ADR considered: not a standing entry, but an ordinary row that sets a rate. Open items.

13. **Every survivors-like with visible structure authors discrete rows at fixed values and steps them, rather than ramping between two figures.** Vampire Survivors, 20 Minutes Till Dawn, HoloCure and Halls of Torment all do this, and Mad Forest's `frequency` series is not even monotonic: 1000, 1000, 500, 250, 500, 1000, 500, 500, 1500, 500, 500, 100 across its first twelve minutes. Where the genre wants a real linear ramp it reaches for one, and applies it to enemy stats rather than to spawn rate: `"inverse": {"TimeMods": {"start": 0, "hpPerMinute": 0.05, "speedPerMinute": 0.005}}`. DOCUMENTED (`Stage.json`). This is the finding in section 5.

14. **One shipped word exists in this genre for exactly the continuous thing as distinct from the scripted thing, and it is "trickle".** Deep Rock Galactic: Survivor's wiki: "the player fights off a constant trickle of enemies until a larger wave appears," and "the background trickle of enemies". COMMUNITY-MEASURED (<https://deeprockgalactic.wiki.gg/wiki/Survivor:Elimination>). Darktide's shipped Lua carries the same word as a code term, `trickle_hordes`, toggled per pacing state beside `hordes`, `roamers` and `specials`. DOCUMENTED. It is the one genre candidate that does not collide, and section 4 says why it still loses.

---

## 1. Survivors-likes: what the data calls it, and what the players call it

### Vampire Survivors, from the shipped stage data (DOCUMENTED)

`Stage.json` holds one array per stage key (`FOREST`, `LIBRARY`, `WAREHOUSE`, and so on). Mad Forest is `FOREST` and holds 31 entries. The first is the stage header and the schedule row for minute 0 in one object; every entry after it is a bare schedule row.

| minute | minimum | frequency | enemies | bosses | events |
|---|---|---|---|---|---|
| 0 | 15 | 1000 | 1 type | none | none |
| 1 | 30 | 1000 | 2 types | `BAT4` | none |
| 2 | 50 | 500 | 3 types | none | one |
| 5 | 10 | 1000 | 1 type | `XLMANTIS` | one |
| 11 | 300 | 100 | 1 type | none | one |

`frequency` is the milliseconds between spawn ticks and `minimum` is the live-enemy floor the tick fills toward; the wiki transcribes them as "Spawn interval (seconds)" and "Enemy minimum" and heads the whole table "Waves" (<https://vampire.survivors.wiki/w/Mad_Forest>). An `events` entry is a separate object shape, `{"eventType": "BAT_SWARM", "delay": 5000, "repeat": 2}`.

Three things follow. The continuous schedule and the one-shot arrivals ride the same minute row, in different fields. The shipped data gives the row no noun at all. And the noun the community supplies is "wave", used for the continuous half.

The decompiled `StageData` class agrees on the field names and adds the containing concept: a stage is a `List<StageData>`, with `minute`, `minimum`, `frequency`, `enemies`, `bosses`, `events`, `startingSpawns`, `randomMinutes`, `poolsMapping` and `spawnType` among its properties (<https://github.com/n3rdyguy/VSEvolutionHelperEx/blob/main/game-api/VampireSurvivors.Data.Stage.StageData.decompiled.cs>). The modding reference names the live rate `_effectiveSpawnFrequency` and the placement modes `STANDARD`, `HORIZONTAL`, `VERTICAL`, `SCRIPTED`, `TILED`, `MAPPED` (<https://github.com/lukeod/vampiresurvivors-modding/blob/main/stage-system.md>). "Scripted" is the mode name for the one-shot case, which is the second time this lineage distinguishes the two by adjective rather than by noun.

### Brotato, from the decompiled resource scripts (DOCUMENTED)

The hierarchy is `ZoneData` holding `waves_data`, `groups_data_in_all_waves` and `horde_groups`; `WaveData` holding `wave_duration`, `max_enemies` and `groups_data`; and `WaveGroupData` holding the schedule itself (<https://github.com/Yeet195/BrotatoDecompiled/blob/main/Brotato/zones/zone_data.gd>, `.../wave_data.gd`, `.../wave_group_data.gd`).

`WaveGroupData` verbatim, with its declared defaults:

```
export (int) var spawn_timing = 1
export (int) var repeating = 999
export (int) var repeating_interval = 3
export (int) var reduce_repeating_interval = 0
export (int) var min_repeating_interval = 1
export (bool) var is_boss = false
export (bool) var is_horde = false
```

`spawn_timing` is the one-shot time. `repeating` is how many times it fires again. `repeating_interval` is the gap, `reduce_repeating_interval` shrinks that gap each repetition, and `min_repeating_interval` is the floor it shrinks to. A shipped balance mod's Wave 20 group reads `spawn_timing = 6, repeating = 999, repeating_interval = 6, reduce_repeating_interval = 0, min_repeating_interval = 1`, and its magician horde group reads `spawn_timing = 26, repeating = 999, repeating_interval = 11, reduce_repeating_interval = 1, min_repeating_interval = 8` (<https://github.com/DarkTwinge/Brotato-BalanceMod/blob/main/waves/wave20_fin.tres>, `.../horde_group_magician-spawner.tres`).

That second one is the design record's mechanism almost exactly: a group that arrives at an authored time, keeps arriving on an interval, and tightens that interval toward a floor. Brotato needs no second concept for it, because `repeating` is a field on the ordinary group.

`ZoneData.groups_data_in_all_waves` is the nearest thing in the genre to a standing declaration: a group list that applies to every wave in the zone rather than to one. It has no separate type; it is an array of the same `WaveGroupData`.

### The rest of the lineage (DOCUMENTED and COMMUNITY-MEASURED)

Seven more games, and the pattern is that the continuous thing is named for its interval field in data and for its rate in prose, while the one-shot thing gets the noun.

| Game | The continuous schedule | The one-shot group | Same word? |
|---|---|---|---|
| Vampire Survivors | `frequency` (ms) with `minimum`; "wave" in prose | `bosses`, and `events` with an `eventType` | no |
| Brotato | `repeating_interval` on a `WaveGroupData` | the same resource with `is_boss` or `is_horde` | one resource, two flags |
| 20 Minutes Till Dawn | a "spawn session" with `SpawnCD`, `Num p/spawn`, `Max` | nothing: a boss is a session with `Max: 1` over a five-second window | collapsed into one |
| HoloCure | "Spawn Rate", with a "Maximum Enemy Limit" | "Timed Events" | no |
| Halls of Torment | "spawn rate" toward a "spawn count", inside a two-minute "wave" | "special wave" | yes |
| Deep Rock Galactic: Survivor | "a constant trickle", "the background trickle" | "wave", then Elites, then the Dreadnought | no |
| Death Must Die | "normal time-based Minion spawns" | "Waves" | no |

Sources in order: <https://20minutestilldawn.wiki.gg/wiki/Forest>, <https://holocure.wiki.gg/wiki/Enemy>, <https://steamcommunity.com/app/2218750/discussions/5/4029096058473717882/>, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Elimination>, <https://dmd.fandom.com/wiki/Waves>. Halls of Torment's own wiki refused four URL forms with HTTP 402 and its figures here come from a Steam thread that quotes the same numbers; Death Must Die's Fandom wiki was reachable only through search snippets.

Three of these are worth more than a table row.

**20 Minutes Till Dawn calls it a session, and the word is already banned here.** The wiki's columns are `Enemy | Start | End | HP | Max | SpawnCD | Num p/spawn`, and `SpawnCD` is "Number of seconds the game waits before trying to spawn more enemies from the session". Density climbs not by ramping a rate but by overlapping sessions: the Tentacle Monster runs 20:00 to 19:00 at `Max 20 / 3s / 4`, then a second row runs 19:00 to 18:00 at `Max 50 / 4s / 10`. `CONTEXT.md` bans "session" under Run.

**Deep Rock Galactic: Survivor is the one game in the lineage with a dedicated word for the continuous thing, and the word is "trickle".** "In each stage, the player fights off a constant trickle of enemies until a larger wave appears," and the biome text is written on the same axis: "Instead of a steady background trickle of bugs, Azure Weald will have periods of relative quiet followed by heavy spawn rates" (<https://deeprockgalactic.wiki.gg/wiki/Survivor:Biomes>). The parent game splits it three ways: a Swarm is "an extended event ... [that] contains multiple large spawn events of enemies over time", a Normal Wave is "an instantaneous event where a large group of enemies suddenly spawns once", and a Pressure Wave is "an event where a smaller group of enemies spawns ... usually occur repeatedly over a specific time period" (<https://deeprockgalactic.wiki.gg/wiki/Swarm>). Pressure Wave is the closest shipped concept to the standing row and both of its words are spoken for here, Pressure by the director's signal and Wave four times over.

**HoloCure uses "Wave" for a spawn shape, not a schedule unit.** Its pattern vocabulary is Wall, Stampede, Cluster, Horde and Wave, where a Wave is "enemies fly rapidly across the screen in a sine-wave pattern". In this project's terms that is a template, not a row, which is one more reason the word cannot be reused for the schedule.

---

## 2. Shmups and wave-authored formats: the word points the other way, and the continuous thing mostly has no word at all

### What the one-shot group is called (DOCUMENTED)

Two vocabularies, split by who reads the format.

Formats written by and for the game's own programmer name the one-shot by its scheduling model, never by a group noun. Tyrian calls it an **event**: `JE_EventRecType` carries `eventtime`, `eventtype` and six `eventdat` fields, with `EVENT_MAXIMUM 2500`, and enemies arrive through `JE_createNewEventEnemy` one at a time, a formation being a run of events tied together by `enemy[b-1].linknum` (<https://raw.githubusercontent.com/opentyrian/opentyrian/master/src/varz.h>, `.../src/tyrian2.c`). Danmakufu ph3 has no group noun whatsoever: the whole stage-script enemy API is `CreateEnemyFromScript`, `CreateEnemyFromFile` and `CreateEnemyBossFromFile`, one enemy per call, sequenced by a `task` (<https://thelandofcodesandapertures.github.io/Danmakufu-ph3-Official-Documentation/th_dnh_help_v3_data/th_dnh_help_v2tov3/file/function_v2.html>, <https://sparen.github.io/ph3tutorials/ph3u3l28.html>). Taisei names its stage file `timeline.c` and its groups by pluralising the enemy: `burst_fairies_1`, `drop_swirls`, `circle_fairies_1`, each an `INVOKE_TASK_DELAYED` on the timeline (<https://raw.githubusercontent.com/taisei-project/taisei/master/src/stages/stage1/timeline.c>). The Lazy Devs Pico-8 shmup ships a schedule editor whose row is `Time | Enemy Type | X | Y | Brain Override`, so the unit is a **spawn** on a **schedule** (<https://raw.githubusercontent.com/Krystman/lazydevs-pico8-advanced-shmup/master/notes.txt>).

Formats with a visual editor, a kit or a tutorial audience call it a **wave**, and define it as the one-shot group. SHMUP Creator, verbatim: a wave is "a formation, a group of the same enemy starting from the same position", with properties "number of spawns", "start delay" and "spawn interval", and no loop, repeat, rate or duration property at all (<https://www.shmupcreator.com/doc/?docs=shmupcreator%2Fobjects-and-entities%2Fenemies-and-waves>). SHMUPKIT: "Extensible Enemy Spawners - allowing you to define the types of aliens spawned in each attack wave" (<https://minilop.itch.io/shmupkit>). Sébastien Bénard's LD39 vertical shmup names the class `WaveEmitter`, wave for the group and emitter for the mechanism (<https://raw.githubusercontent.com/deepnight/ld39-zeroVoltX/master/src/en/WaveEmitter.hx>).

So the shmup side's word for the one-shot is "wave" wherever the word appears at all, which is the opposite of Vampire Survivors' assignment. The shmups.wiki glossary declines to define "wave", "formation" or "midboss", and the only vocabulary it does supply for the mass of weak bodies is the enemy class rather than the schedule: "zako" and "popcorn", "common, weak enemies which appear in large numbers at a time" (<https://shmups.wiki/library/Help:Glossary>). "Popcorn" is already banned under Trash.

### What the continuous trickle is called (DOCUMENTED)

Mostly nothing. Three patterns cover every format examined.

**Same construct, a different parameter.** Taisei's `TASK(drop_swirls, { int cnt; ... })` and `TASK(sinepass_swirls, { int duration; ... })` are the same shape with a count in one and a duration in the other, and both are called swirls. The only names its authors reach for are a local and a comment: `int swirl_spam_time = 1260;` and `/*swirl_spam_time*/ filler_time`. Kenta Cho's STGL does the same at the language level, where `repeat count` bounds a group and a bare `repeat` defaults to infinite (<https://github.com/abagames/stgldemo>).

**A rate field on the level rather than an object.** This is Tyrian, and it is the one clean shipped precedent for both concepts side by side in a vertical shmup. `tyrian2.c` declares `levelEnemyMax`, `levelEnemy[40]` and `levelEnemyFrequency`, all read out of the `.lvl` file, and runs them in an unnamed block commented only `/* New Enemy */`: `if (enemiesActive && mt_rand() % 100 > levelEnemyFrequency)`. The timeline can retune it mid-stage, as event type 37: `case 37: levelEnemyFrequency = eventRec[eventLoc-1].eventdat; break;`. So Tyrian's split is event versus level-enemy-plus-frequency, and the continuous half has a pool and a knob but no noun.

**Emitter, turret or launcher, but at the bullet layer.** STGL's fourth actor type is `Turret`, whose canonical script is `firePeriod interval / repeat / variableSpeedBullet / wait interval`. Tyrian's enemy table carries `elaunchfreq` and `elaunchtype` for an enemy that continuously emits other enemies. Deepnight's `WaveEmitter` takes `freqS=0.5`. The genre does have a word for a thing that produces at a rate, and that word is "emitter", but it is applied to bullets and to spawning enemies, never to the stage's own background population.

**The modern hobbyist `waves.json` idiom inverts the whole vocabulary,** which is worth knowing as the trap it is. Three independent files found by code search key a "wave" to a `duration` plus a `spawn_rate` or `spawn_interval` plus an enemy pool, and one of them, `rusty-ship`, puts the shaped one-shot group *inside* it under the field name `formations`, as `{"type":"vee","count":5,"spacing":60.0}` (<https://raw.githubusercontent.com/rhettjay/rusty-ship/main/assets/content/waves.json>, <https://raw.githubusercontent.com/timdobras/astral_shards/main/assets/config/waves.json>). Under that idiom a wave is what this record calls the standing row and a formation is what this project calls a template. Both of those words are banned here, and this is why: they mean different things depending on which half of the lineage the reader comes from.

---

## 3. The formats that hold both, and what they call the difference

### GTFO: a ramp between two figures, called a ramp (DOCUMENTED)

`SurvivalWaveSettings` declares `m_populationPointsPerWaveStart` ("Population points for a group at start ramp"), `m_populationPointsPerWaveEnd` ("Population points for a group at end ramp") and `m_populationRampOverTime` ("Lerp over time for start-end population point settings"), against a soft cap that gates group spawning (<https://gtfo-modding.gitbook.io/wiki/reference/datablocks/main/survivalwavesettings>). This is the ramp-between-two-figures-over-a-span half of ADR 0060's shape, shipped, and the word the format puts on it is "ramp". Nothing in the format is called a stream, a faucet or a rate.

Worth noting for what it is not: GTFO's unit is still called a wave, and the thing that ramps is the population budget rather than an interval.

### Left 4 Dead: population, and why it is not a row (DOCUMENTED)

Booth's deck splits the world into "Full Threat Population", "Minimal Threat Population" and "Boss Population", the first two being what the director switches between and the third being map-placed and dealt from a shuffled deck (quoted in [director-precedent.md](director-precedent.md)). Wanderers are the continuous ambient occupancy; mobs of 20 to 30 every 90 to 180 seconds are the recurring burst; specials are the individually-timed one-shots.

"Population" is the most pedigreed word available for the continuous thing, and it is the one candidate that criterion (b) rejects outright. A population is a level maintained by a system, not an entry a designer wrote at a time. Calling the Crowd's growth a population would put it beside the stage list rather than in it, which is the second timeline ADR 0060 forbids in as many words: "It is a second kind of row and never a second timeline."

### Risk of Rain 2: series, card, coefficient (DOCUMENTED)

`CombatDirector` declares `monsterCredit`, `minSeriesSpawnInterval = 0.1`, `maxSeriesSpawnInterval = 1`, `shouldSpawnOneWave`, `moneyWaveIntervals` and `creditMultiplier`, and its `Update` takes a `difficultyCoefficient` (<https://github.com/DaveAldon/RiskOfRain2-Open-Source/blob/master/Assembly-CSharp/RoR2/CombatDirector.cs>). "Series" is the run of bodies one card pays out; "one wave" is the one-shot; the growth is a coefficient with no noun of its own.

This matters because ADR 0060 rests on Risk of Rain 2 for the growth-versus-answer split, and the source shows that game never gave its growth a name. It is a number the whole world multiplies by. Hungry Grave's growth is authored per section and placed on the timeline, so it needs a name Risk of Rain 2 never had to invent.

### Darktide: trickle, as a real shipped word (DOCUMENTED)

`default_pacing_template.lua` toggles `hordes`, `roamers`, `specials` and `trickle_hordes` per pacing state, and scales `trickle_hordes` by 1.5 and 2 in the later tiers (<https://github.com/Aussiemon/Darktide-Source-Code/blob/master/scripts/managers/pacing/templates/default_pacing_template.lua>). "Trickle" is the only shipped single word found for a low continuous flow as distinct from a burst. It is available, uncollided, and wrong on magnitude: the Crowd's figure is 8 to 12 bodies a second, which is not a trickle by any reading.

---

## 4. The candidates, against the three criteria

Criterion (a) is precedent and collision, (b) is whether the name keeps ADR 0047's "the rows stay the floor" and ADR 0060's "a second kind of row, never a second timeline" true, (c) is whether it reads as one thing in a designer's sentence.

Two words are ruled out before the shortlist, because they fail (a) or (b) outright rather than on balance.

**Wave** is banned in four glossary entries and means the opposite thing in the two parent genres (claims 1 and 2). It also collapses the distinction this record exists to draw, so it fails (b) as well as (a).

**Population** has the best pedigree of any word here, Booth's "Full Threat Population" against a "Minimal Threat Population", and no glossary collision at all. It fails (b): a population is a level a system maintains, not an entry a designer wrote at a time, so naming the growth that way is the first step toward the second timeline ADR 0060 forbids. It fails (c) for the same reason. "The Crowd's population ramps 8 to 12" reads as a fact about the field rather than as a thing somebody authored.

The shortlist, ranked.

### 1. Standing row

**(a)** No genre precedent for "standing", and no collision with anything. "Standing" is the ordinary English qualifier for a thing maintained rather than fired: a standing army, a standing order. Every genre noun that would have carried this meaning is spent (claim 9), and the two lineages between them supply exactly one usable qualifier, Brotato's `repeating`, plus one usable mechanism noun, the shmup side's "emitter" (STGL's `Turret`, Tyrian's `elaunchfreq`, deepnight's `WaveEmitter`). "Emitter row" was considered and dropped for the same reason as "repeating row": it names the machine, and in every source the emitter is an object on the field rather than an entry in the stage list. The one cost of "standing" is a possible misread as a row of mobs that stand still, which the entry's first clause closes.

**(b)** Strongest of the shortlist. The name is literally the ADR's ruling: it is a row, and what it does differently is stand. A reader who has only the word cannot arrive at a second timeline from it, because "row" is the timeline's own unit. Brotato's precedent points the same way at the level below (claim 11).

**(c)** "The Crowd's standing row ramps 8 to 12." Reads as one thing, and the verb belongs to the noun.

### 2. Repeating row

**(a)** The only candidate with a literal shipped field name behind it. Brotato's `repeating`, `repeating_interval`, `reduce_repeating_interval` and `min_repeating_interval` are the exact distinction, in the exact place, on the exact shape. No collision in the glossary.

**(b)** Also fine: it keeps the row.

**(c)** Where it loses. "Repeating" names the mechanism and not the role, and this codebase's naming rule is that a seam type is named for the role the consumer needs. Worse, it is ambiguous about what repeats: "the Crowd's repeating row" invites a File of eight arriving again every three seconds, which is a template firing on a loop, not a rate of bodies. The thing that repeats here is the tick, not the row's content. It also says nothing about standing for the section, which is the property the Procession and the Vigil are authored against.

### 3. Trickle row

**(a)** The only genre word that names this exact thing and does not collide with the glossary. Deep Rock Galactic: Survivor's wiki draws the same line this record draws, "a constant trickle of enemies until a larger wave appears", and Darktide ships `trickle_hordes` as a code term beside `hordes` and `roamers`. Nothing in `CONTEXT.md` claims "trickle".

**(b)** Fine on its own, and it keeps the row.

**(c)** Where it loses, on two counts. Magnitude: the Crowd's figure is 8 to 12 bodies a second against a `MOB_CAP` of 160, and no reading of "trickle" survives that. And in both shipped uses the trickle is the thin thing the scripted thing interrupts, which is the reverse of this stage, where the standing row is the mass the player mows and the templates are the shapes on top of it. Borrowing the word would import the wrong relative size.

### 4. Floor stream

**(a)** Fails twice. "Stream" is `StreamName` in `rng.ts` and the skull stream weapon line. "Floor" is Size floor, floor events, and ADR 0047's "the rows stay the floor", where every row is the floor and this one is not special.

**(b)** "Stream" also drifts toward a system rather than an entry, since a stream is a thing that runs beside the timeline.

**(c)** "The Crowd's floor stream ramps 8 to 12" reads acceptably, which is why the brief reached for it, but the collisions are fatal and the design record already retired it.

---

## 5. Precedent disagrees with ruling ADR 0060, on the ramp only

Recorded as a finding, not applied. The pick's shape is unchanged and this is the orchestrator's to file.

**The ruling.** ADR 0060: "It names a mob type, a template and a rate of bodies a second that ramps between two figures across the section's authored span, repeating down to a minimum interval."

**What shipped games do instead.** Four survivors-likes with visible structure author discrete rows at fixed values and step them at row boundaries. Vampire Survivors: one row per minute, `frequency` fixed for that minute, going 1000, 500, 250, 500, 1500, 100 across consecutive minutes, deliberately not monotonic. 20 Minutes Till Dawn: each session holds a constant `SpawnCD`, and density climbs because sessions overlap and the next one's numbers are larger. HoloCure: a "Spawn Rate" that "changes throughout the run" at breakpoints. Halls of Torment: a two-minute wave with a target spawn count the game fills in three to five seconds. Sources in section 1.

**The sharpest piece of it.** Vampire Survivors ships a genuine linear per-minute ramp and points it somewhere else: `"inverse": {"TimeMods": {"start": 0, "hpPerMinute": 0.05, "speedPerMinute": 0.005}}` ramps enemy health and speed, while spawn rate stays a stepped column. The genre had the tool and chose not to use it on this quantity.

**Corrected 2026-09-09, in the second gate round, and this paragraph read one mode for another.** The `inverse` key is Mad Forest's **Inverse** mode, which is that stage's hard mode. Normal Mad Forest carries no `TimeMods` at all and its whole climb is enemy type substitution, and six other stages do carry a normal-mode per-minute inflation, from 0.10 on Bat Country to 0.25 on The Coop (`survivor-numbers.md:87`, `:98`, `:123`, which is where all three facts already sat). So the genre does inflate on the clock in normal play, on six stages, and the stage this record quotes is not one of them. ADR 0060 briefly adopted a stat step on this paragraph's reading and then struck it; what stands from the section is the finding about the ramp, which is unaffected.

**What stands.** The repeating interval decaying to a floor is precedented in the genre, in Brotato's `repeating_interval` / `reduce_repeating_interval` / `min_repeating_interval`. The lerp between a start figure and an end figure over a span is precedented outside it, in GTFO's `m_populationRampOverTime`. So ADR 0060's shape is not unprecedented; it is a composition no shipped survivors-like makes.

**Why this is not a naming problem.** Every candidate in section 4 survives either shape, so the pick does not move. What the finding touches is whether the Crowd's growth should be a lerp from 8 to 12 or a short list of authored figures the section steps through, which is a tuning and authoring question the design record's own trough already gestures at.

---

## Open items

- **No shipped game found makes the continuous case a separate kind of entry.** Vampire Survivors puts `frequency` and `bosses` on one minute row; Brotato puts `repeating_interval` and `is_boss` on one `WaveGroupData`; Taisei writes both as the same task with a `cnt` or a `duration`. All three agree with ADR 0060's "never a second timeline" and none supports "a second kind of row" as a separate type. This is a naming record and does not rule the code shape, but a reader of ADR 0060 should know the precedent runs one level flatter than the ruling does.
- **Tyrian ships a third shape neither ADR considered: a rate that lives on the level and an ordinary timeline event that rewrites it.** `levelEnemyFrequency` is a level property, and event type 37 exists only to set it mid-stage. Under that model there is no standing entry at all, and a section's growth would be a handful of ordinary rows that each turn a knob. It is the shape closest to a shmup's own habits and it is not what ADR 0060 rules, so it is recorded rather than argued.
- **The chapter text of Cheng's "Procedural Enemy Waves" was reached once and its publisher pages twice refused.** Taylor and Francis returned 403 and a Google Books lookup returned the wrong volume; the section headings quoted in claim 8 come from a third host. Its definition of "wave" was not recovered, and the chapter appears not to give one.
- **No developer of any survivors-like was found stating why their spawn schedule is called a wave, or a session, or a trickle.** The words are inherited and unexplained everywhere I looked, so every naming claim in this record is usage evidence rather than reasoning evidence.
- **No shipped format found ramps a rate between two figures and repeats down to a minimum interval in the same declaration.** GTFO has the first, Brotato the second, and ADR 0060 composes them. Section 5.
- **Halls of Torment's own wiki refused four URL forms with HTTP 402** (the article, the parse API, `Special:Export` and `?action=raw`), so its wave figures come from a Steam thread quoting the same numbers rather than from the wiki itself. No public dump of its wave tables exists; the two datamining repos found parse only `GameElements/Monsters` and `GameElements/Items`.
- **Army of Ruin has no wiki mechanics page and no developer post on spawning.** Community usage on Steam is informal "waves" for both senses, which is not usable evidence either way.
- **No GDC talk or postmortem was found in which a shmup developer names the unit of stage authoring.** The vocabulary in section 2 is entirely read off formats and source, never off a developer explaining a choice. Tyrian's own `LEVELMAK.DOC`, referenced by an OpenTyrian source comment, was searched for twice and not found.
- **The Touhou wikis refused: en.touhouwiki.net returned 418 and touhou.fandom.com returned 402.** The official ph3 manual mirror and Sparen's tutorials covered the same ground, so nothing is missing, but the primary manual was reached through a mirror rather than at source.

---

## What this settles

**The pick is `standing row`, unchanged from the design record and the glossary.** The genre's own word for the time-keyed continuous schedule is "wave", that word means the opposite in the shmup half of this game's parentage and is banned four times over in `CONTEXT.md`, and every other borrowable noun (population, stream, faucet, spawn rate) either collides in the glossary or names a system running beside the timeline rather than an entry in it, which is exactly the second timeline ADR 0060 forbids.

The runner-up is `repeating row`, on Brotato's `repeating` field, and it loses on the sentence rather than on the evidence: it names the mechanism instead of the role, and invites the reading that the row's whole content fires again on a loop.

`trickle row` is the only genre word that fits the concept and clears the glossary, and it loses on magnitude: 8 to 12 bodies a second is not a trickle, and in both games that ship the word the trickle is the thin thing the scripted arrival interrupts, which is the reverse of this stage.

`floor stream` is retired for cause, not preference: "stream" is `rng.ts`'s `StreamName` and the skull stream weapon line, and "floor" is what ADR 0047 already calls every row.

Separately, and not a naming matter: precedent disagrees with ADR 0060 on the ramp. Section 5 has the evidence, the pick's shape is unchanged, and it is the orchestrator's to file.

---

## Sources

Shipped data and decompiled source:
- Vampire Survivors shipped stage data: <https://github.com/Dezzelshipc/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Stage.json>
- Vampire Survivors decompiled `StageData`: <https://github.com/n3rdyguy/VSEvolutionHelperEx/blob/main/game-api/VampireSurvivors.Data.Stage.StageData.decompiled.cs>
- Vampire Survivors modding reference, stage system: <https://github.com/lukeod/vampiresurvivors-modding/blob/main/stage-system.md>
- Brotato decompiled resource scripts: <https://github.com/Yeet195/BrotatoDecompiled/blob/main/Brotato/zones/wave_group_data.gd>, `.../zone_data.gd`, `.../wave_data.gd`
- Brotato shipped mod wave resources: <https://github.com/DarkTwinge/Brotato-BalanceMod/blob/main/waves/wave20_fin.tres>, `.../horde_group_magician-spawner.tres`
- Risk of Rain 2 `CombatDirector`: <https://github.com/DaveAldon/RiskOfRain2-Open-Source/blob/master/Assembly-CSharp/RoR2/CombatDirector.cs>
- Darktide pacing template: <https://github.com/Aussiemon/Darktide-Source-Code/blob/master/scripts/managers/pacing/templates/default_pacing_template.lua>
- GTFO `SurvivalWaveSettings` datablock reference: <https://gtfo-modding.gitbook.io/wiki/reference/datablocks/main/survivalwavesettings>
- Tyrian event records and level enemy frequency, via OpenTyrian: <https://raw.githubusercontent.com/opentyrian/opentyrian/master/src/varz.h>, <https://raw.githubusercontent.com/opentyrian/opentyrian/master/src/tyrian2.c>, <https://raw.githubusercontent.com/opentyrian/opentyrian/master/doc/files.txt>
- Taisei stage 1 timeline and enemy classes: <https://raw.githubusercontent.com/taisei-project/taisei/master/src/stages/stage1/timeline.c>, <https://raw.githubusercontent.com/taisei-project/taisei/master/src/enemy_classes.h>
- Kenta Cho's STGL actor types and sample scripts: <https://github.com/abagames/stgldemo>, <https://raw.githubusercontent.com/abagames/stgldemo/master/src/com/abagames/util/stgl/ActorType.hx>
- Lazy Devs Pico-8 shmup schedule format: <https://raw.githubusercontent.com/Krystman/lazydevs-pico8-advanced-shmup/master/notes.txt>
- Deepnight LD39 `WaveEmitter`: <https://raw.githubusercontent.com/deepnight/ld39-zeroVoltX/master/src/en/WaveEmitter.hx>
- Hobbyist `waves.json` idiom: <https://raw.githubusercontent.com/rhettjay/rusty-ship/main/assets/content/waves.json>, <https://raw.githubusercontent.com/timdobras/astral_shards/main/assets/config/waves.json>

Wiki transcriptions of shipped behaviour:
- Vampire Survivors enemy arrival rules: <https://vampire.survivors.wiki/w/Enemies>
- Vampire Survivors Mad Forest wave table: <https://vampire.survivors.wiki/w/Mad_Forest>
- Vampire Survivors stages: <https://vampire.survivors.wiki/w/Stages>
- Brotato waves: <https://brotato.wiki.spellsandguns.com/Waves>
- 20 Minutes Till Dawn spawn sessions: <https://20minutestilldawn.wiki.gg/wiki/Forest>, <https://20minutestilldawn.wiki.gg/wiki/Enemies>
- HoloCure spawn rate, enemy limit and timed events: <https://holocure.wiki.gg/wiki/Enemy>, <https://holocure.wiki.gg/wiki/Stage_1>
- Halls of Torment wave figures, quoted from the wiki: <https://steamcommunity.com/app/2218750/discussions/5/4029096058473717882/>
- Deep Rock Galactic: Survivor trickle and waves: <https://deeprockgalactic.wiki.gg/wiki/Survivor:Elimination>, <https://deeprockgalactic.wiki.gg/wiki/Survivor:Biomes>
- Deep Rock Galactic swarm, normal wave, pressure wave: <https://deeprockgalactic.wiki.gg/wiki/Swarm>
- Death Must Die waves versus time-based minion spawns: <https://dmd.fandom.com/wiki/Waves>

Authoring formats and their documentation:
- Danmakufu ph3 function reference: <https://thelandofcodesandapertures.github.io/Danmakufu-ph3-Official-Documentation/th_dnh_help_v3_data/th_dnh_help_v2tov3/file/function_v2.html>
- Sparen's ph3 stage tutorials, lessons 23 and 28: <https://sparen.github.io/ph3tutorials/ph3u3l23.html>, <https://sparen.github.io/ph3tutorials/ph3u3l28.html>
- SHMUP Creator, enemies and waves: <https://www.shmupcreator.com/doc/?docs=shmupcreator%2Fobjects-and-entities%2Fenemies-and-waves>
- SHMUPKIT spawners and attack waves: <https://minilop.itch.io/shmupkit>
- SHMµP Lua scripting, enemy patterns and wave patterns: <https://github.com/Sahnvour/shmup-scripting/blob/master/README.md>
- Shmups Wiki glossary, zako and popcorn: <https://shmups.wiki/library/Help:Glossary>

Design literature:
- Wyatt Cheng, "Procedural Enemy Waves", chapter 14 of Tanya Short and Tarn Adams (eds), *Procedural Generation in Game Design*, CRC Press: <https://www.taylorfrancis.com/chapters/edit/10.1201/9781315156378-16/procedural-enemy-waves-wyatt-cheng>, section headings via <https://vdoc.pub/documents/procedural-generation-in-game-design-723117lanvc0>
- Mike Booth, GDC 2009, "The AI Systems of Left 4 Dead": <https://steamcdn-a.akamaihd.net/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf>

Project records and rulings cited rather than repeated:
- [director-precedent.md](director-precedent.md), [stage-length-with-a-director.md](stage-length-with-a-director.md), [survivor-numbers.md](survivor-numbers.md)
- `docs/adr/0047-directed-density-inside-authored-beats.md`, `docs/adr/0060-growth-over-the-run-is-authored-per-section-and-the-director-never-owns-it.md`, `docs/design/mow-ladder-director.md`, `apps/hungry-grave/CONTEXT.md`, `src/core/rng.ts`

---

## Reproducing the checks

The Vampire Survivors per-minute rows:

```
curl -sL "https://raw.githubusercontent.com/Dezzelshipc/VampireSurvivorsFiles/main/Data/Vampire%20Survivors/Stage.json" \
  | python3 -c "import json,sys; [print({k:r.get(k) for k in ('minute','minimum','frequency')}, r.get('bosses'), r.get('events')) for r in json.load(sys.stdin)['FOREST'][:16]]"
```

The Brotato wave group fields:

```
curl -s "https://raw.githubusercontent.com/Yeet195/BrotatoDecompiled/main/Brotato/zones/wave_group_data.gd"
```

The glossary's full Avoid list, to re-check any new candidate against it:

```
grep -o '_Avoid_: [^*]*' apps/hungry-grave/CONTEXT.md | sed 's/_Avoid_: //' | tr ',' '\n' | sed 's/^ *//' | sort -u
```
