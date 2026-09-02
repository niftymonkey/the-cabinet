# Director knobs and signal: what ships as data, what the signal reads, and what survives a replay

Research for Hungry Grave. Labels: **DOCUMENTED** = a shipped data or script file, decompiled or disassembled code, a convar table read out of the shipped binary, a developer statement, or a patch note. **COMMUNITY-MEASURED** = wiki or player-derived. **INFERRED** = my reading across sources.

This document sits beside [director-precedent.md](director-precedent.md), which already holds what each shipped director reads, what it may change, what it never touches, how it was tuned and what broke. Everything there is cited here, never repeated. The new ground is narrower and more mechanical: the knob surface itself, knob by knob, with defaults and units; whether any of those knobs moved after launch; the instrument a designer watched while tuning them; the exact weights on every signal input, with the near-kill term singled out; and whether a shipped director's state could be rebuilt from a seed and a tape.

The strongest sources are three shipped artifacts read directly. The Left 4 Dead 2 convar table extracted from `server_srv.so`, mirrored with defaults, flags and descriptions at <https://convars.l4d2node.org/>: 4,193 entries, of which 3,326 carry a default value, 122 begin `director_` and 657 begin `z_`. The Risk of Rain 2 decompiled `CombatDirector.cs`, `SpawnCard.cs`, `DirectorCard.cs` and `Run.cs` at <https://github.com/WarmBuns/DecompiledPile>. And the Fatshark decompiled Lua at <https://github.com/Aussiemon/Vermintide-2-Source-Code> and <https://github.com/Aussiemon/Darktide-Source-Code>. Barotrauma is open source and was read at <https://github.com/FakeFishGames/Barotrauma>.

---

## What is solid

These are the claims I would build on.

1. **A shipped director's knob surface is enormous, and almost none of it is the signal.** Left 4 Dead 2 exposes 122 `director_` convars and at least 102 named `DirectorOptions` keys a map script may override, on a page that says outright it is "by no means an exhaustive list." Of that whole surface, exactly seven convars define how the intensity value is produced, and three more read it as a threshold. Everything else is population, placement, item density, boss spacing and mode plumbing.

2. **The signal's own constants are convars with published units, not compiled magic.** `intensity_decay_time 30` ("Seconds to decay full intensity to zero"), `intensity_factor 0.25` ("How quickly intensity increases"), `intensity_enemy_death_near_range 150` and `intensity_enemy_death_far_range 500` (the two radii that grade a nearby death), `survivor_intensity_recent_enemy_duration 5` (the hold), `survivor_intensity_decay_threat_range 750` (how close an enemy must be to block decay), and `intensity_lock -1` ("Lock players' intensities at this value"). That last one is a tuning instrument, not a gameplay knob.

3. **Left 4 Dead's near-kill term is graded by two radii, and the confirmation is independent of the disassembly the sibling cites.** The shipped convar table names `intensity_enemy_death_near_range 150` and `intensity_enemy_death_far_range 500`, the same two distances the disassembly recovered on its categories 4 and 3 (where it attaches them to a Witch or Tank death specifically). Two independent artifacts agree on the numbers, and the convar names say the rule is about an enemy death and a distance, with nothing about who caused it.

4. **Vermintide 2 adds intensity for every enemy death near a player, weighted by inverse distance, and it does not care who killed it.** The whole function is four lines: `amount = 1 / dist * intensity_add_nearby_kill` for every alive player, on every enemy death. `intensity_add_nearby_kill` is 1, so a kill at one metre adds 1 and a kill at ten metres adds 0.1. A player mowing down a horde at contact range is raising their own measured intensity as fast as they are clearing it.

5. **Darktide, which is Fatshark's rewrite rather than Vermintide's code, deleted the kill term.** Its complete tension input set is five event keys (`knocked_down`, `died`, `pounced`, `netted`, `killed_by_daemonhost`) and two damage keys (`damaged`, `absorbed_damage`). There is no enemy-death input at all. The newer of the two directors by the same studio reads only harm.

6. **Risk of Rain 2's combat director runs entirely inside `FixedUpdate` and every one of its dice comes from a seeded stream chained off the run seed.** `rng = new Xoroshiro128Plus(Run.instance.stageRng.nextUint)` in `Awake`, and `Simulate(Time.fixedDeltaTime)` in `FixedUpdate`. The run clock is `fixedTime`, which is accumulated as `NetworkfixedTime = fixedTime + Time.fixedDeltaTime` inside the fixed step, so even the difficulty coefficient is tick-derived rather than wall-clock derived.

7. **Barotrauma's event director is the closer structural match, and it is a fixed 60 Hz accumulator with a clamp.** `Timing.FixedUpdateRate = 60`, `Timing.Step = 1.0 / 60`, `Timing.AccumulatorMax = 0.25`, and the main loop resets the accumulator to one step on overrun "to prevent spiral of death." The director's own randomness is an MT19937 seeded from the level seed: `RandomSeed = ToolBox.StringToInt(level.Seed)`, XORed with the previous events, then `random = new MTRandom(RandomSeed)`.

8. **Both of those codebases state the same caveat Hungry Grave's own glossary states: a seed pins the dice, not the outcome.** Barotrauma's `Rand.RandSync.ServerAndClient` carries the warning in its own doc comment: "The values are only guaranteed to be the same if the same seed is set on both sides, and then the same sequence of calls is made." Risk of Rain 2's wiki says the same from the player's side: "Player choices may affect some outcomes of the seed."

9. **Two studios, two opposite publishing practices.** Across the entire patch history of both Left 4 Dead games, no note names a director convar and changes its value; every pacing change is qualitative ("Reduced intensity of horde spawned from generators", "Tuned the horde numbers back a bit during the onslaught event", "Cut Special Infected spawn times by half in Realism Versus"), and exactly one note in either game states both an old and a new number. Fatshark publishes director changes under section headers named "Pacing" with dev notes attached, and because the decompiled source mirror snapshots nearly every shipped build, each note can be checked against the constant it moved. Even so, roughly a third of Fatshark's director changes ship with no note at all.

10. **What gets retuned is the gating, not the curve.** Darktide's answer to a ramp that never let up was two new data fields, `wait_for_ramp_clear` and `wait_for_ramp_clear_reset {80, 160}`, a mandatory quiet interval after a ramp. Vermintide's whole launch-window fix was threat-value gating, deferring a spawn while live threat is high. Meanwhile Darktide's tension thresholds and decay have been frozen since its 2022 closed test with exactly one threshold value ever moved post-launch, and Vermintide's `horde_frequency`, `peak_intensity_threshold`, `max_intensity` and `decay_per_second` are unchanged since its pre-order beta.

11. **Two shipped director faults were data plumbing rather than logic.** For its first month Vermintide 2 discarded the authored per-difficulty intensity and pacing overrides at load, because two loops at the end of the settings file overwrote them with near-empty tables; the 1.0.6 patch removed the loops rather than editing any value. And Darktide shipped a coordinated-strike chance of 0.9 where 0.25 was intended, for about a week, fixed by a hotfix whose note names the number.

12. **Three shipped directors, three different readouts, and all three are still in the retail build.** Left 4 Dead 2 ships `director_show_intensity` and `intensity_lock` as convars. Vermintide 2 ships a scrolling 120-second per-player intensity graph with a living-enemy count and a labelled reason at every state change, behind a launch flag. Risk of Rain 2 ships a decision log behind a convar that is not even cheat-flagged.

13. **Valve's playtest measurement was a scalar per chapter, not a curve.** Ambinder's worked Left 4 Dead case study measures "Deaths in 'No Mercy - The Apartments'" before and after one change, annotated "~40% Decrease", alongside "Surveys, Q&As, death rates". The intensity-over-time strip chart is an explanatory diagram, and no source shows anyone tuning against it. As late as 2011 Valve had a measured skin-conductance waveform and the director's estimated one in the same deck and posed connecting them as an open question.

14. **Left 4 Dead's automated stress rig is in the retail binary as four convars.** `director_test_loop` ("Allow a team of nothing but bots, advance through maps and loop back to start"), `director_test_loop_time 3` (minutes per map), `director_test_loop_rotate_maps 1`, `director_test_loop_restarts_before_rotate 4`, alongside `host_timescale` for the "accelerated game time" Booth's deck names.

15. **Darktide derives its five difficulty tiers from one authored number by a multiplier ladder rather than hand-tuning each tier.** Every pacing value in the default template is written once and expanded by `value × {1, 1.2, 1.35, 1.5, 1.75}`, and challenge ratings by `value × {1, 1.25, 1.5, 1.75, 2}`. Vermintide 2 does the opposite: its per-difficulty overrides are hand-written per tier and several of them invert, with damage sensitivity peaking at 1.5 on Hard and falling to 0.2 on Cataclysm.

16. **A timing or size knob ships as a min/max pair, not a value.** There are 39 explicit min/max pairs across Left 4 Dead 2's `director_` and `z_` convars, and Vermintide 2 and Darktide both express every duration as a two-element table. Booth's term for it is Structured Unpredictability, and his own description is "ranges of times when things that could potentially happen."

17. **Valve's own documentation warns that the knob surface is the hazard.** "often things don't work as expected, because the DirectorOptions have been set in ways that conflict, causing unexpected behaviors. You can set 3 variables to get what you want, but a 4th may default to something that thwarts you... it is very easy to over-constrain the Director."

---

## 1. What a shipped director exposes as data

### Left 4 Dead 2: three layers, and the signal is barely in any of them (DOCUMENTED)

The knob surface is stacked in three layers, and they are not equivalent.

**Layer one is the convar table compiled into the binary.** 122 names begin `director_` and 657 begin `z_`. Each convar row carries a default, a flag set and a description string, and many carry their unit in the description; the rows without a default are console commands rather than convars. These are the shipped values; a map script that never touches them gets these.

| Knob | Default | Unit, from the shipped description |
|---|---|---|
| `intensity_factor` | 0.25 | "How quickly intensity increases" |
| `intensity_decay_time` | 30 | "Seconds to decay full intensity to zero" |
| `intensity_averaged_following_decay` | 20 | "Seconds for the 'time averaged intensity' to meet the baseline intensity" |
| `intensity_enemy_death_near_range` | **150** | Hammer units, "the effective range for enemy death near" |
| `intensity_enemy_death_far_range` | **500** | Hammer units, "the effective range for enemy death far" |
| `survivor_intensity_recent_enemy_duration` | 5 | seconds, the hold before decay |
| `survivor_intensity_decay_threat_range` | 750 | Hammer units, how close an enemy must be to block decay |
| `intensity_lock` | -1 | "Lock players' intensities at this value" (off at -1) |
| `director_intensity_threshold` | **0.9** | normalized 0 to 1, ends Build Up |
| `director_intensity_relax_threshold` | **0.9** | normalized, ends Peak Fade |
| `director_intensity_relax_allow_wanderers_threshold` | 0.3 / 0.5 (Hard) / 0.8 (Expert) | normalized, wanderers may return during Relax |
| `director_sustain_peak_min_time` / `_max_time` | 3 / 5 | seconds |
| `director_relax_min_interval` / `_max_interval` | 30 / 45 | seconds |
| `director_relax_max_flow_travel` | 3000 | flow units toward the next safe room |
| `director_special_respawn_interval` | 45 | seconds |
| `director_special_initial_spawn_delay_min` / `_max` / `_max_extra` | 30 / 60 / 180 | seconds |
| `director_tank_min_interval` / `_max_interval` | 350 / 500 | flow units between boss placements |
| `director_tank_checkpoint_interval` | 15 | "Min time after leaving a checkpoint that a tank can spawn" |
| `director_threat_radius` | 1000 | "the effect radius for threat" |
| `director_max_threat_areas` | 4 | count of nav areas |
| `director_convert_pills_critical_health` | 50 | health points below which pills ahead become kits |
| `director_ammo_density` and 9 sibling item densities | 6.48 | **"Items per 100 yards square"** |
| `director_pistol_density` | 4 | same unit, the one item class with its own number |
| `z_common_limit` | 30 | "How many common infecteds we can have at once" |
| `z_background_limit` | 20 | commons on the background map |
| `z_wandering_density` | 0.03 | wanderers per nav area |
| `z_mob_population_density` | 0.0064 | **"per square inch (0.0064 = 4 per 1x1 nav area)"** |
| `z_mob_recharge_rate` | 0.0025 | mob budget regained per unit time |
| `z_mob_spawn_min_size` / `_max_size` | **10 / 30** | commons per mob |
| `z_mob_spawn_min_interval_normal` / `_max_interval_normal` | 90 / 180 | seconds (easy is 120 / 240) |
| `z_spawn_mobs_behind_chance` | 75 | "Percentage chance that a mob will spawn behind the Survivor team" |
| `z_spawn_const_pos` | 1500 | "Closest map-flow distance, in Infected ahead of the Survivors, at which the Director may spawn them" |
| `z_spawn_safety_range` / `z_safe_spawn_range` | 550 / 250 | Hammer units |

Two of those are worth pausing on. The item densities are all **6.48 items per 100 square yards**, one number reused across ammo, pills, molotovs, pipe bombs, defibrillators, melee weapons, oxygen tanks, gas cans, upgrade packs and vomit jars, with the pistol at 4 as the sole exception: one authored density, applied to ten item classes. And the shipped mob size is **10 to 30**, not the 20 to 30 the GDC deck states, which is the deck describing Left 4 Dead 1 and the table describing Left 4 Dead 2's retail binary.

**The shape of a knob is a pair, not a value.** Across the `director_` and `z_` prefixes there are **39 explicit min/max pairs**: `director_relax_min_interval 30` and `_max_interval 45`, `director_sustain_peak_min_time 3` and `_max_time 5`, `director_panic_wave_pause_min 5` and `_max 7`, `z_mob_spawn_min_size 10` and `_max_size 30`, `z_mega_mob_spawn_min_interval 420` and `_max_interval 900`, `z_skirmish_spawn_min_size 1` and `_max_size 4`, and the per-difficulty mob intervals four times over. Booth names the practice: "we have collections of interesting possibilities that we create from a library, and we select them at runtime using intentionally designed randomized constraints. So basically you've got ranges of times when things that could potentially happen." Source: <https://www.cs.drexel.edu/~santi/teaching/2012/CS680/papers/> (the 11 Secrets PDF, quoting the GDC talk). The corollary for a knob schema is that a timing knob that is one number will be two numbers within a week.

The same article records the architectural rule the knob layout follows: each population layer (wanderers, mobs, specials, bosses, weapon caches, scavenge items) is its own simple system stacked on the others, and "Since there are no intricate dependencies between the systems, and no possible feedback loops, it becomes a much more straightforward system that's easier to adjust and experiment with" (COMMUNITY-MEASURED, AiGameDev's reading of the talk). The layers do not read each other; only the pacing state gates all of them at once.

**Layer two is `DirectorOptions`, a Squirrel table any map, mode or mutation script may define.** The community list names at least 102 keys and says plainly it is "by no means an exhaustive list." Source: <http://web.archive.org/web/2014/https://developer.valvesoftware.com/wiki/L4D2_Vscripts> (COMMUNITY-MEASURED; the live wiki is behind a proof-of-work wall). The keys are population and placement, not signal: per-class limits (`BoomerLimit`, `HunterLimit`, `TankLimit`, `WitchLimit`, `MaxSpecials`), wave composition (`TotalSpecials`, `TotalBoomers` and five siblings), spawn geometry (`PreferredMobDirection` with eight enumerated values, `SpawnSetRule`, `SpawnDirectionMask` relative to a map entity literally named "Compass"), tempo (`MobSpawnMinTime`, `LockTempo`, `PanicForever`, `RelaxMinInterval`), and eight `A_CustomFinaleX` slots that turn the finale into an authored row list.

The merge order is in the shipped `director_base.nut`: `DirectorScript.DirectorOptions`, then `MapScript.DirectorOptions`, then `MapScript.LocalScript.DirectorOptions`, then `ChallengeScript.DirectorOptions`, each delegating to the one below. Four override layers, and the base script itself sets exactly one value, `MaxSpecials = 2`. Source: <https://github.com/Stabbath/L4D2-Decompiled/blob/master/Decompiled%20VScripts/director_base.nut>.

**Layer three is a script function the map author writes.** `director_gauntlet.nut` declares its own knobs (`GauntletMovementThreshold 500.0`, `GauntletMovementTimerLength 5.0`, `BridgeSpan 20000`, `MobSpawnSizeMin 5`, `MobSpawnSizeMax 20`, `minSpeed 50`, `maxSpeed 200`, `speedPenaltyZAdds 15`, `CommonLimitMax 30`) and then a `RecalculateLimits()` called from `Update()` that recomputes `MobSpawnSize` and `CommonLimit` every frame from flow progress and team speed. The set piece that wants speed to cost something reads speed itself, in its own script, and writes back into the same options table the campaign director reads. Source: <https://github.com/Stabbath/L4D2-Decompiled/blob/master/Decompiled%20VScripts/director_gauntlet.nut>.

Valve's own documentation names the cost of a surface this wide: "often things don't work as expected, because the DirectorOptions have been set in ways that conflict, causing unexpected behaviors. You can set 3 variables to get what you want, but a 4th may default to something that thwarts you. So it is worth learning about all the options, because it is very easy to over-constrain the Director." Source: <http://web.archive.org/web/20250807092605/https://developer.valvesoftware.com/wiki/Left_4_Dead_2/Scripting/Expanded_Mutation_System/Appendix:_DirectorOptions>.

**What stayed compiled:** the intensity increment per event category, the category boundaries at 20% and 50% of health, the state machine's order, and the five-second hold. The increments are recoverable only by disassembly (the sibling cites one), and the two radii are the only part of the near-kill rule a convar exposes.

### Risk of Rain 2: serialized fields on a prefab, plus a card asset per monster (DOCUMENTED, decompiled C#)

The director is a Unity component whose tunables are serialized fields with defaults in code, grouped under two header attributes the decompile preserves, `[Header("Core Director Values")]` and `[Header("Optional Behaviors")]`.

| Field | Default | Unit |
|---|---|---|
| `monsterCredit` | 0 | credits |
| `expRewardCoefficient` | 0.2 | multiplier |
| `goldRewardCoefficient` | 1 | multiplier |
| `minSeriesSpawnInterval` / `maxSeriesSpawnInterval` | 0.1 / 1 | seconds between spawns inside a wave |
| `minRerollSpawnInterval` / `maxRerollSpawnInterval` | 2.333 / 4.333 | seconds after a failed spawn |
| `creditMultiplier` | 1 | "How much to multiply money wave yield by" |
| `spawnDistanceMultiplier` | 1 | "Used for combat shrines, to keep spawns nearby" |
| `maxSpawnDistance` | infinity | world units |
| `skipSpawnIfTooCheap` | true | flag |
| `maxConsecutiveCheapSkips` | int.MaxValue | count, "we'll behave as though it's not set after this many consecutive skips" |
| `maximumNumberToSpawnBeforeSkipping` | 6 | monsters per wave |
| `eliteBias` | 1 | multiplier |
| `resetMonsterCardIfFailed` | true | flag |
| `targetPlayers` | true | flag |
| `ignoreTeamSizeLimit` | false | flag |
| `moneyWaveIntervals` | authored per director | seconds |
| `baseEliteCostMultiplier` | 6 | **static readonly, not serialized** |
| player retarget timer | `rng.RangeFloat(1f, 10f)` | seconds, **hardcoded literal** |
| director deactivation handoff | 0.4 | fraction, **hardcoded local** |

The two hardcoded values at the bottom are the interesting half. The retarget window and the 40% credit handoff on deactivation are literals inside the method, not fields, so they are not tunable without a rebuild, while everything above them is editable on the prefab.

The content side is a separate asset per monster. `SpawnCard` carries `directorCreditCost`, `hullSize`, `nodeGraphType`, `requiredFlags`, `forbiddenFlags` and `eliteRules`; `DirectorCard` wraps it with `selectionWeight`, `spawnDistance` (an enum, Close, Standard, Far), `preventOverhead`, `minimumStageCompletions`, and a required or forbidden unlockable. Those cards group into a `DirectorCardCategorySelection`, whose categories each carry a `name` and their own `selectionWeight`, so a stage tunes the mix by moving a category weight without touching a card. Costs and weights per monster are in the sibling and in <https://riskofrain2.wiki.gg/wiki/Directors>, which also transcribes the per-director attribute schema: credits on activation, exp multiplier, credit multiplier, spawn interval during and between waves, elite bias, whether the enemy limit is ignored, max spawns per wave, and the spawn target.

### Vermintide 2: two Lua settings tables, one hand-written per difficulty (DOCUMENTED, decompiled Lua)

`IntensitySettings.default` is seven values plus a `difficulty_overrides` block; `PacingSettings.default` is the state machine's constants plus three threat gates and a `difficulty_overrides` block of the same shape. The sibling has the intensity weights and the state thresholds. What it does not have is the rest of the pacing table, which is where the tempo actually lives.

| Knob | Default | Unit |
|---|---|---|
| `multiple_hordes` | 3 | count |
| `peak_intensity_threshold` | 45 (50, 55, 70, 80, 90, 90 by difficulty) | intensity points out of 100 |
| `peak_fade_threshold` | 32.5 | intensity points |
| `sustain_peak_duration` | {3, 5} | seconds |
| `relax_duration` | {50, 70} | seconds |
| `horde_frequency` | {70, 150} | seconds |
| `multiple_horde_frequency` | {10, 15} | seconds |
| `max_delay_until_next_horde` | {160, 200} | seconds |
| `horde_startup_time` | {40, 120} | seconds after level start |
| `relax_rushing_distance` | 70 | metres travelled that ends a relax early |
| `mini_patrol.only_spawn_above_intensity` / `only_spawn_below_intensity` | 1 / 15 | intensity points |
| `mini_patrol.frequency` | {15, 20} | seconds |
| `mini_patrol.override_timer` | 20 | seconds |
| `delay_horde_threat_value` | 40 normal, 80 to 100 Cataclysm | threat points on the field |
| `delay_specials_threat_value` | 40 normal, **1000** Cataclysm | threat points, i.e. never delayed |
| `Pacing.get_roaming_density` | **returns 0.5, hardcoded** | density |

The last row is the pattern: a value that looks like a knob is a function returning a literal. Everything else in the pacing state machine is data, and the roaming density is not.

### Darktide: one authored number per knob, five tiers derived (DOCUMENTED, decompiled Lua)

Fatshark's rewrite changed the shape of the data as much as the signal. Every pacing value in `default_pacing_template.lua` is written once and expanded across five difficulty tiers by a function:

```lua
local function _multiplier_step(value)
	return { value * 1, value * 1.2, value * 1.35, value * 1.5, value * 1.75 }
end
local function _challenge_rating_multiplier_steps(value)
	return { value * 1, value * 1.25, value * 1.5, value * 1.75, value * 2 }
end
```

`max_tension` is `_multiplier_step(100)`. The decay rates are `_multiplier_step(1.25)` in the lowest build-up state, `1.5` in the middle, `2` in the high state, `0` while sustaining a peak, and `2` in fade and relax, all in tension points per second. The challenge-rating gates that delay a spawn type when the field is already busy are `_challenge_rating_multiplier_steps` of 40 (specials), 30 (hordes), 20 (trickle hordes), 90 (roamers) and 100 (terror events).

Two structures have no Vermintide equivalent. `DEFAULT_ALLOWED_SPAWN_TYPES` is an explicit six-state by six-type boolean matrix, so what each pacing state may spawn is a table a designer reads rather than a branch in code, and monsters are the one type set `true` in all six. And `DEFAULT_RAMP_UP_FREQUENCY_MODIFIERS` is a list of five ramp bands, each with a `ramp_duration` (1200, 600, 500, 400 and 200 seconds), a `max_duration` (50 to 100), a `travel_change_pause_time`, per-type `ramp_modifiers` (hordes ×1.25 to ×2, specials ×2 to ×3), and on the top three bands a `wait_for_ramp_clear` flag with a `wait_for_ramp_clear_reset` pair, all applying only in the build-up states. Mission length itself is a knob, expressed as how long the frequency takes to ramp.

### What is not data anywhere

No shipped director exposes its signal's event weights, its state ordering, or its cycle shape as content. Left 4 Dead exposes the thresholds and the radii but compiles the increments. Vermintide and Darktide ship the weights in Lua, which is data in form and shipped-bundle in practice, and both hardcode at least one value that reads like a knob. Risk of Rain 2 has no signal at all, and its two genuinely fixed numbers are a retarget window and a credit handoff fraction buried inside methods.

---

## 2. Which knobs moved after launch

### Left 4 Dead and Left 4 Dead 2: not one convar, ever (DOCUMENTED, patch notes)

**No patch note in either game's history names a director convar and changes its value.** Not `z_common_limit`, not `director_special_respawn_interval`, not a `z_mob_*` interval, not a wandering density, not an intensity threshold. Convars appear in the notes only as added (`director_allow_infected_bots`, 2010-11-19), removed (`director_no_human_zombies` and `director_holdout_mode`, 2009-04-21), or re-scoped for security (`director_log_scavenge_items` made server-only, 2018-11-01 and 2019-02-14).

What Valve did change, it described qualitatively. The verbatim record, in order:

| Date | Line | Source |
|---|---|---|
| 2009-01-14 | "Increased chance of getting the Tank or Witch"; "Made the Tank and Witch spawn directly on the escape route"; "Avoids spawning within a certain % of the tank" | <https://store.steampowered.com/oldnews/2162> |
| 2010-02-05 | "Mall: Tuned spawning for difficulty" | <https://store.steampowered.com/oldnews/3408> |
| 2010-11-19 | "Cut Special Infected spawn times by half in Realism Versus." | <https://store.steampowered.com/oldnews/4672> |
| 2010-12-03 | "Increased spawn times slightly for special infected in Realism Versus." | <https://store.steampowered.com/oldnews/4729> |
| 2012-01-13 | "Tuned the horde numbers back a bit during the onslaught event."; "Item spawn density revision." | <https://store.steampowered.com/oldnews/7162> |
| 2012-02-17 | "There are now slightly more infected coming at slightly faster intervals during the end-level onslaught." | <https://store.steampowered.com/oldnews/7367> |
| 2020-09-26 | "Reduced intensity of horde spawned from generators."; "Reduced intensity of horde during the Scavenge event." | <https://store.steampowered.com/news/75935/> |
| 2020-10-02 | "During the finale, the double-Tank spawns are now set to 40 seconds instead of the normal 20 second timer."; "Increased max ghost spawn timers to 24 seconds." | <https://store.steampowered.com/news/76155/> |
| 2023-08-22 | "Simplified finale difficulty scaling so it is now only increased on Advanced and Expert difficulties rather than scaling each difficulty differently; the intention is to curb player fatigue and confusion" | <https://store.steampowered.com/news/app/550/view/3646280012042428636> |

Three things fall out. The 2010-11-19 and 2010-12-03 pair is a halving and a partial walk-back fourteen days later: the correction is "slightly", not another halving. The 2012 pair does the same thing in the other direction on the same onslaught event, five weeks apart. And 2020-10-02 is the **only** note in either game that states both an old and a new number.

The Last Stand community update (2020-09-24) touched director logic without touching a number: "Revised the logic for fitting both tank and witch spawn locations into the flow"; "Fixed the director's 'arc value' not always handling campaigns shorter than five maps correctly"; "Always restore the default pain pills decay rate when the director resets." The "arc value" line is the nearest any note comes to naming the pacing curve, and it is a bug fix. Source: <https://store.steampowered.com/news/75849/>.

The one time a director number was made more tunable rather than retuned was 2013-08-05, when `ClearedWandererRespawnChance` was exposed to VScript. The number was handed to modders rather than changed.

### Fatshark: the opposite practice, and the knobs are legible in both directions (DOCUMENTED, patch notes and versioned decompiles)

Where Valve published nothing, Fatshark publishes director changes under section headers named "Pacing", with dev notes attached, and the decompiled source mirror snapshots essentially every shipped build, so a note can be checked against the constant it moved.

**Darktide's ramp bands are the knob that actually gets tuned.** The Traitor Curse Part 1 (1.2.10, 2023-11-14): "Increased the rate in which the conflict director ramps up difficulty on higher difficulties, mainly on Maelstrom missions." Three weeks later, Part 2 (1.2.20, 2023-12-05): "Reduced the amount the Conflict Director ramps up difficulty on low/mid difficulties. Dev Note: This is related to a similar patch note from Part 1, where we increased the rate at which the Conflict Director ramps up difficulties." Both are visible in `DEFAULT_RAMP_UP_FREQUENCY_MODIFIERS`:

| Band | Field | Before 1.2.10 | 1.2.10 | 1.2.20 |
|---|---|---|---|---|
| 1 | `ramp_duration` | 500 | 500 | **1200** |
| 1 | `ramp_modifiers.hordes` / `.specials` | 1.25 / 1.5 | 2 / 2 | **1.25** / 2 |
| 2 | `ramp_duration`, hordes / specials | 500, 1.25 / 2 | 500, 2 / 3 | **600**, 1.25 / 2 |
| 3 | `ramp_duration`, hordes / specials | 400, 1.25 / 2 | 400, 2 / 3 | **500**, 1.5 / 2.5 |
| 4 | `ramp_duration`, hordes / specials | 300, 1.5 / 2.5 | 300, 2 / 3 | **400**, 1.5 / 2.5 |
| 5 | `wait_for_ramp_clear` | absent | absent | **true** |

**The fix that stuck was not a curve, it was a cooldown.** At 1.2.30 the clear-gate spread: `wait_for_ramp_clear = true` extended to bands 3 and 4, and a new `wait_for_ramp_clear_reset` of `{80, 160}` on bands 3 and 4 and `{120, 200}` on band 5. That is a mandatory quiet interval after a ramp, arriving as two data fields, and it shipped with **no patch note at all**. In the same window `specials_pacing` flipped `move_timer_when_horde_active` and `move_timer_when_monster_active` from `true` to `false`, so a special's timer stops advancing while a horde is live: another gate rather than a smaller number.

**Vermintide 2's launch-window fix was the same shape, threat-value gating.** 1.0.4 dropped `delay_horde_threat_value.harder` from 80 to 70; 1.0.4.1 dropped it to 65 and **added a `hardest` key at 80 that had never existed**, alongside the note "Champion difficulty used the same peak clamp as Legendary difficulty resulting in a tad high peaks when everything wants to spawn at the same time." The same note continues, "Legendary has also received a suitably high clamp to keep the most extreme peaks in check", which is that key. 1.0.5 then dropped all three to 50, 60, 60, with the note "On Champion and Legend, the Director will less frequently spawn hordes and specials while the players still are engaged with enemies."

**A whole subsystem arrived as data with no value edits.** Patch 1.2.1 added `SpecialsSettings.default.speed_running_intervention`, with `total_travel_distance_scaling_thresholds = {80, 160, 240, 320}` and `delay_between_speed_running_intervention_special_spawn = {{15,30},{12,24},{8,18},{5,12}}`: a four-band escalation keyed to how far ahead of the pace the team has run, tightening the special-spawn delay at each band. The note says only "This lead to poor pacing when some players would run ahead. Now, the Director will try to spawn Specials to slow down players who outrun Bosses." That is the shipped answer to gaming the relax, and it is a table.

**One of those patches removed code that was throwing the data away.** Through 1.0.5, `conflict_settings.lua` ended with two loops that overwrote the per-difficulty intensity and pacing override tables with the near-empty ones from `difficulty_settings.lua`, so the authored `horde_frequency`, `relax_duration` and `multiple_hordes` values for Champion and Legend were assigned at load and then discarded. Both loops are gone at 1.0.6, with `peak_intensity_threshold` inlined as 50, 55 and 70 instead. That much is verified in the diff. Whether it is the mechanism behind that patch's note, "Skaven hordes will now spawn with a bit higher frequency and with higher numbers, on higher difficulties", is a reasonable reading and not something Fatshark said.

**A shipped chance was ninety percent for a week.** `chance_for_coordinated_strike` on the fifth resistance tier was 0.25, went to **0.9** at 1.9.0 (2025-09-24), and came back at 1.9.2 (2025-10-02) with the note "Pacing - Fixed an issue where coordinated strikes had a 90% chance to occur instead of the normal 30%." Note that the restored value is 0.3, not the 0.25 it was before, so the fix also retuned.

**About a third of the director changes ship with no note.** The 2024 Secrets of the Machine God build cut trickle-horde gating substantially (`trickle_horde_travel_distance_range` from `{90, 210}` to `{60, 160}` on the mid tier and `{70, 180}` to `{40, 120}` on the high tier, `trickle_horde_cooldown` from `{40, 45}` to `{30, 45}`, `num_trickle_hordes_active_for_cooldown` from 3 to 4), and neither part of its patch notes mentions pacing, hordes, trickle, roamers or the director.

**What Fatshark does not tune is the signal.** Darktide's tension thresholds, decay rate and modifier were set between its 2022 external and closed tests and then frozen; post-launch exactly one tension threshold value has ever moved. Vermintide's `horde_frequency {70, 150}`, `peak_intensity_threshold 45`, `max_intensity 100` and `decay_per_second 2` are unchanged since its pre-order beta, and its whole base-campaign director has been frozen since late 2019. Eight years of patches, and the reader itself was never retuned.

And the direction of travel over time, stated by Fatshark in a 2026 balance devblog: "Over time, as we've expanded and improved weapons, talents, and introduced new classes, the overall player power has increased in the game. To maintain the intended difficulty, we have increased the enemy density and spawn rates of elites, and while this has kept the game intense, it has also introduced new challenges for us." Source: <https://forums.fatsharkgames.com/t/devblog-incoming-balance-changes/121374>.

### Risk of Rain 2 (DOCUMENTED, patch notes)

The sibling has the sequence: the credit-per-second time factor raised from 0.046 to 0.0506 with the note "This is a bit of a sanity check, and shouldn't dramatically change the difficulty", the "too cheap" skip rule patched three times for stalling, and the aggressive director's spawn frequency reduced with a stated intent to trade small monsters for big ones. Those are all edits to the director's own constants and rules rather than to a spawn card, and they were shipped as patch notes with the reasoning attached, which is the opposite of Valve's practice.

### The tuning that reads as a director change but is not

Vampire Survivors, 20 Minutes Till Dawn and Deep Rock Galactic: Survivor all tune by editing a row or a scalar over rows, and both siblings hold the lines. Halls of Torment is the one case where a pressure-reading term itself was tuned by patch, four times in six weeks, and then deleted; that history is in [director-precedent.md](director-precedent.md) and [reward-delivery-models.md](reward-delivery-models.md).

---

## 3. How a designer reads the result

Three shipped directors carry three different instruments, all three still in the retail build, and the studio with the most famous director turns out to have tuned it against none of them.

### Vermintide 2: a scrolling graph with live annotations (DOCUMENTED, decompiled Lua)

This is the most designer-facing readout found anywhere, and it is a few dozen lines of shipped code. Behind the launch flag `debug_player_intensity`, `Pacing.intensity_graphs` creates a graph named "intensity" with axes "time" and "intensity", pins `y_max` to 100 (the intensity ceiling), unlocks horizontal scrolling, and sets `visual_frame.x_min = t - time_width` with `time_width = 120`. So the designer watches a **120-second scrolling window of the last two minutes**.

Four kinds of line go on it. One plot per player, named `player1` through `player4`. A red `sum` plot, which is actually the mean the pacing state machine reads. A blue `rats` plot, which is `count_units_by_breed("skaven_clan_rat")`, the living population of the commonest trash enemy. And live text annotations: every state transition writes its own name onto the graph in orange, and `advance_pacing` passes a `reason` string that is written in firebrick beside it, at a y-position that walks down from 70 to 30 and wraps so successive annotations do not overlap.

Read that as a specification. The instrument shows the signal, the per-player spread behind the mean, the field population that produced it, and a labelled reason at every moment the director changed its mind, over a two-minute window. Source: <https://github.com/Aussiemon/Vermintide-2-Source-Code/blob/master/scripts/managers/conflict_director/pacing.lua>.

### Left 4 Dead 2: convars, including one that pins the signal (DOCUMENTED, shipped convar table)

Valve's instruments are convars rather than a graph, and all of them are cheat-flagged.

| Convar | Default | What it is for |
|---|---|---|
| `director_show_intensity` | 0 | client-side, "toggles intensity" |
| `director_debug` | 0 | server-side director spew |
| `director_debug_threat_placement` | 0 | where threats were placed |
| `director_output_population_visit` | 0 | population as areas are visited |
| `director_item_placement_spew` | 0 | "Whether director item placement should spew a bunch of stats about what it did" |
| **`intensity_lock`** | -1 | **"Lock players' intensities at this value"** |
| `director_force_panic_event` | 0 | fire a panic on demand |
| `music_intensity_override` | -1 | "Overrides the player's music intensity track for testing" |

`intensity_lock` is the one to dwell on. It pins every player's intensity to a chosen value, which turns the director from a closed loop into an open one: hold the signal at 0.2 and watch what population the director builds, then hold it at 0.95 and watch the relax. That is how you tune a reader's consequences without having to produce the state that would trigger them.

### Left 4 Dead 2: the automated rig is four convars in the retail binary (DOCUMENTED)

Booth's deck names "Automated stress testing with 4 SurvivorBots and accelerated game time", and the mechanism shipped:

| Convar | Default | Description, verbatim |
|---|---|---|
| `director_test_loop` | 0 | "Allow a team of nothing but bots, advance through maps and loop back to start" |
| `director_test_loop_time` | 3 | "When looping, stay in each map for at most the amount of time, in minutes, specified" |
| `director_test_loop_rotate_maps` | 1 | "When looping, advance to the next map when reach end of campaign" |
| `director_test_loop_restarts_before_rotate` | 4 | "When looping and rotating, how many times to restart before moving to next campaign" |
| `host_timescale` | 1.0 | "Prescale the clock by this amount" |

Four restarts per campaign, at most three minutes per map, then rotate, with the clock scaled up. That is the overnight rig, and it is a handful of convars over the shipped game rather than a separate harness.

### Risk of Rain 2: a decision log, not cheat-flagged (DOCUMENTED, decompiled C#)

`director_combat_enable_internal_logs` is a plain `BoolConVar` with `ConVarFlags.None`, described as "Enables all combat directors to print internal logging." What it prints is the director narrating every branch of a spawn attempt: "Preparing monster wave {card}", "Elite tier index {i} is too expensive ({cost}/{credits})", "Found valid elite tier index {i}", "Spawn count has hit the max ({n}/{max}). Aborting spawn.", "Spawn card {card} is too expensive, aborting spawn.", "Spawn card {card} is invalid, aborting spawn.", and on deactivation "Transfered {n} monster credits from {a} to {b}". A budget director's failure modes are all refusals, so the readout is a log of refusals with the numbers that caused each one, which is exactly what the stall patches in the sibling needed. Source: <https://github.com/WarmBuns/DecompiledPile> (`RoR2/CombatDirector.cs`).

### Valve: the strip chart is a diagram, and the measurement was deaths per chapter (DOCUMENTED)

The picture everyone remembers from the Left 4 Dead talks is a three-lane strip chart, Desired Population over Survivor Intensity over Actual Population, with the Relax periods banded. It is real and it is Booth's, and Ambinder reproduces it in his 2011 Valve biofeedback deck. What is not on record is anyone tuning against it as a live instrument.

What Valve actually measured in a playtest was coarser and better aimed. From Ambinder's 2014 Steam Dev Days deck "Data to Drive Decision-Making" (<http://media.steampowered.com/apps/steamdevdays/slides/data.pdf>), the pipeline first: "OGS, Operational Game Stats. Platform for recording gameplay metrics. Kills, Deaths, Hero Selection, In-Game Purchases, Matchmaking wait times, Bullet trajectories, Friends in Party, Low-Priority Penalties, etc." And the policy around it: "Record lots and lots (and lots) of user behavior. If we're not recording it, we'll start recording it. Define questions first, then schema."

Then the worked Left 4 Dead case, on survivor visibility. The slide names the whole method in four lines:

> Explicit: Players letting teammates die
> Data-Driven: Surveys, Q&As, high death rates
> Theory-Driven: Lack awareness of teammate location
> Measurements: Surveys, Q&As, death rates

The readout is a two-bar chart, "Deaths in 'No Mercy - The Apartments'", pre against post on a nought-to-five axis, annotated "~40% Decrease", with the verdict "Survey ratings of enjoyment/cooperation increased / Anecdotal responses decreased / Deaths decreased". So the unit was **mean deaths in one named chapter, before and after one change**, plus surveys and observed sessions. A scalar per chapter, not a curve.

Valve did plot one time series against Left 4 Dead 2 events, and it was a body rather than the director. The 2011 biofeedback deck (<https://cdn.akamai.steamstatic.com/apps/valve/2011/ValveBiofeedback-Ambinder.pdf>) carries a skin-conductance trace in micro-Siemens against deciseconds, hand-annotated with the encounter that caused each rise ("Smoker Kill 0:54", "Tank Music 2:58", "Tank Appearance 3:01", "Tank Chase 3:22"), and the raw log behind it interleaves gameplay events and physiology on one timestamped stream:

```
1290891060  player_biofeedback_scl   1.161238   228
1290891061  item_pickup              63 first_aid_kit
1290891061  player_biofeedback_scl   1.145869   230
```

That is the measured arousal, and the same deck puts it beside the director's estimated one and then asks, as open research: "Will replacing estimated arousal with actual arousal create a more enjoyable experience? Can we determine optimal arousal patterns?" Three years after Left 4 Dead shipped, Valve had the real waveform and the modelled one in the same deck and had not connected them.

Two negatives worth recording. Valve published spatial death maps for Half-Life 2: Episode Two and Team Fortress 2 ("Death Maps (Colors show where players died most often in each map.)", <http://web.archive.org/web/20071118110944/http://www.steampowered.com/status/ep2/ep2_stats.php>) and never for Left 4 Dead; the Left 4 Dead stats Valve shipped were per-player pages, "Overview, Weapons, Versus and Survival" (<https://www.l4d.com/blog/post.php?id=2460>). And no source names what the shipped game's gamestats pipeline actually uploaded.

The conclusion is worth stating plainly, because it cuts against the obvious assumption: **Valve read the director by playing it nightly and watching recorded sessions, and read the game around it with per-chapter death counts and surveys. Nobody was tuning pacing off a plotted intensity curve.** The only shipped game found that draws that curve for a designer is Vermintide 2.

---

## 4. The signal: every input, every weight, and what happens to kills

### The shape all four share

Every shipped pressure signal is the same object: a float per player, raised by discrete events, held briefly, then decayed toward zero, with the director reading either the maximum or the mean across living players. The differences are in three places: the weights, whether a kill is an input, and what the value is normalized against.

| | Left 4 Dead 2 | Vermintide 2 | Darktide | Barotrauma |
|---|---|---|---|---|
| Range | 0 to 1 | 0 to 100 | 0 to `max_tension` (100 at tier 1) | 0 to 1 |
| Read as | max across eligible living survivors | mean across alive players | one team value plus per-player shadows | one crew value |
| Damage input | graded in three bands: under 20%, 20 to 50%, 50% and over of health | `1 × percent of health lost` | `damage × 0.3`, divided by living player count | crew health enters the target directly |
| Incapacitation | first incap saturates to 1.0 | `knockdown 50`, `pounced_down 10` | `knocked_down 120`, `died 60`, `pounced 60`, `netted 15` | not modelled |
| **Nearby enemy death** | **graded by two radii, 150 and 500 units** | **`1 / distance × 1`, every death, every player** | **no input exists** | **no input exists** |
| Hold | 5 s (`survivor_intensity_recent_enemy_duration`) | `decay_delay 3` s | `decay_tension_delay` 1 to 3 s by state | intensity recomputed every 5 s |
| Decay | linear to zero over 30 s (`intensity_decay_time`) | 2 per second (6 on Cataclysm) | 1.25 to 2 per second by state | rises over 25 s, falls over 400 s |
| Decay blocked | while an enemy is within 750 units | while in relax the delay is ignored | no equivalent | no equivalent |

The per-difficulty direction of travel is worth reading twice. Vermintide's damage sensitivity rises once and then **falls**, 1 by default, 1.5 on Hard, then 1, 0.5 and 0.2 as difficulty climbs to Cataclysm, while its decay rate **rises** the whole way, 2, 3, 3, 4, 6 per second. Darktide does the same by a different mechanism: `damaged` runs 0.3, 0.2, 0.175, 0.1, 0.05 across the five tiers. On both games' hardest settings the director notices harm five to seven times less and forgets it three times faster, which is to say the pressure reader is being turned off rather than retuned.

### The near-kill term, which is the question that matters here

Left 4 Dead counts a nearby death as intensity on purpose, because for Booth intensity is drama, and the sibling carries his slide and the recovered increments. The convar table adds the part the slide leaves out: the grading is purely distance, over two radii, `intensity_enemy_death_near_range 150` and `intensity_enemy_death_far_range 500`. A Witch or Tank dying inside 150 units is worth the same category as taking 50% of your health. Nothing in the rule asks who killed it.

Vermintide 2 is the clearest statement of the same idea because the whole function is readable:

```lua
Pacing.enemy_killed = function (self, killed_unit, player_units)
	for i = 1, #player_units do
		local dist = Vector3.distance(killed_pos, player_pos)
		local amount
		if dist > 0 then
			amount = 1 / dist * CurrentIntensitySettings.intensity_add_nearby_kill
		else
			amount = CurrentIntensitySettings.intensity_add_nearby_kill
		end
		status_ext:add_pacing_intensity(amount)
	end
end
```

Source: <https://github.com/Aussiemon/Vermintide-2-Source-Code/blob/master/scripts/managers/conflict_director/pacing.lua>. It fires on every enemy death, not on deaths the player caused, and it adds to every alive player weighted by that player's own distance to the corpse. With `intensity_add_nearby_kill = 1`, a kill one metre away is worth 1 point to that player and 0.1 to a player ten metres away, and the state machine advances on the mean crossing `peak_intensity_threshold`, 45 on Normal, against a decay of 2 per second after a three-second delay. So a team fighting together at contact range gains close to a point of mean intensity per corpse, and a hundred-odd rats killed in a doorway pushes the reader toward peak on kills alone. In a game whose fantasy is being surrounded and swinging, that is a real contributor and not a rounding error.

Darktide deleted it. The complete input set of the rewrite is five event types and two damage types, and the tables are short enough to be conclusive: `tension_to_add` holds `killed_by_daemonhost`, `knocked_down`, `netted`, `pounced` and `died`; `damage_tension_to_add` holds `damaged` and `absorbed_damage`. There is no enemy-death key anywhere in either. Source: <https://github.com/Aussiemon/Darktide-Source-Code/blob/master/scripts/settings/difficulty/minion_difficulty_settings.lua>. The only two entry points into the value are `add_damage_tension` and `add_tension_type`, both of which take the harmed player as their subject. Source: <https://github.com/Aussiemon/Darktide-Source-Code/blob/master/scripts/managers/pacing/pacing_manager.lua>.

So the count is: of the four shipped pressure readers, two read a nearby kill as pressure and two do not, and **the two that do are the two older ones**. The same studio, writing its second director, dropped the term. No source states why, and I could not find one.

### What no shipped director reads

None of the four reads what the player owns, kills per second, accuracy, or progress rate. Left 4 Dead's set pieces read progress and speed directly in their own scripts (`GetFurthestSurvivorFlow`, `GetAveragedSurvivorSpeed`) rather than routing them through intensity, which is the shipped answer to "we want speed to cost something": a local script, not a new signal input. Risk of Rain 2 reads no player state at all beyond headcount. Resident Evil 4's rank is the one shipped system that adds on kills and subtracts on damage, and it is also the one whose speedrunners take deliberate hits to hold it down; the sibling has both halves.

---

## 5. Determinism: fixed ticks and seeded streams

Hungry Grave's constraint is stated in ADR 0015 and narrowed by ADR 0047: the simulation advances only in fixed ticks of sixty per second, dice come only from named seeded streams, and a tape of the seed plus the per-tick inputs must rebuild the run exactly. A director that reads a wall clock or draws from an unseeded stream breaks that. The question is whether anything shipped has already done it.

### Risk of Rain 2: fixed tick and a seeded chain, and it was not built for replay (DOCUMENTED, decompiled C#)

Every director decision in Risk of Rain 2 is on the physics tick and comes from a seeded stream.

```csharp
private void Awake() {
    if (NetworkServer.active) {
        rng = new Xoroshiro128Plus(Run.instance.stageRng.nextUint);
        ...
    }
}
private void FixedUpdate() {
    ...
    Simulate(Time.fixedDeltaTime);
}
```

The stream is the leaf of a chain rooted at the run seed: `runRNG = new Xoroshiro128Plus(seed)`, then `nextStageRng` and `stageRngGenerator` from it, then per stage `stageRng = new Xoroshiro128Plus(stageRngGenerator.nextUlong)` and from that `bossRewardRng`, `treasureRng`, `spawnRng` and `randomSurvivorOnRespawnRng`. Each combat director then takes its own stream off `stageRng`. Named streams off one root, which is exactly the discipline ADR 0047 requires.

The clock is a tick counter, not a wall clock. `NetworkfixedTime = fixedTime + Time.fixedDeltaTime` accumulates inside the fixed step, `GetRunStopwatch()` returns `fixedTime + runStopwatch.offsetFromFixedTime`, and `RecalculateDifficultyCoefficentInternal` reads that stopwatch. So the difficulty coefficient, the credit income and every spawn timer are functions of elapsed ticks.

The honest limits, and they matter. The game ships seeded runs (the Prismatic Trial, one seed for every player on every platform for 72 hours) and the wiki states what a seed does and does not pin: "Seeds affect stage rotations, interactables' locations and drops, bosses, monster spawn timing, and activated artifacts", then "Player choices may affect some outcomes of the seed. For example, if the player visits the [Bazaar] after the 1st stage, the 2nd stage will have a different spawn location and teleporter location." Source: <https://riskofrain2.wiki.gg/wiki/Prismatic_Trials> (COMMUNITY-MEASURED). A patch line on the same page reads "Fix stage object rotation randomization not being seeded", which is a seeding hole shipped and later closed. And there is no input tape: the director reads live player positions to pick a spawn target, so the run is reproducible only if everything upstream of it is, which the game never claims.

### Barotrauma: a 60 Hz accumulator with a clamp, and a level-seeded stream (DOCUMENTED, open source)

Barotrauma is the closer structural match, and it is the smallest team to ship a pressure-reading director.

```csharp
public const int FixedUpdateRate = 60;
public const double Step = 1.0 / FixedUpdateRate;
public const double AccumulatorMax = 0.25f;
```

The main loop accumulates real time, clamps on overrun ("prevent spiral of death: if the game's running too slowly then we have no choice but to skip a bunch of steps, otherwise it snowballs and becomes unplayable"), and runs whole steps until the accumulator drains. `GameSession.Update` calls `EventManager.Update(deltaTime)` inside that step, so the director advances a fixed step at a time. Sources: <https://github.com/FakeFishGames/Barotrauma/blob/master/Barotrauma/BarotraumaClient/ClientSource/GameMain.cs>, <https://github.com/FakeFishGames/Barotrauma/blob/master/Barotrauma/BarotraumaShared/SharedSource/Timing.cs>.

That is the same accumulator-with-a-clamp that ADR 0015 rules for Hungry Grave, shipped by another game, for the same reason.

The event director's dice are seeded from the level: `RandomSeed = ToolBox.StringToInt(level.Seed)`, XORed with each previously fired event's identifier, then `random = new MTRandom(RandomSeed)`, and every event and event-set selection draws from that instance. Source: <https://github.com/FakeFishGames/Barotrauma/blob/master/Barotrauma/BarotraumaShared/SharedSource/Events/EventManager.cs>.

Barotrauma also ships the named-stream discipline explicitly, as an enum with three members (`Unsynced`, `ServerAndClient`, `ClientOnly`) and a doc comment that states the whole contract:

> "Please note that just using RandSync.ServerAndClient DOES NOT guarantee that the server and the client will generate the same values when doing some arbitrary calls to the methods in this class. The values are only guaranteed to be the same if the same seed is set on both sides, and then the same sequence of calls is made."

Source: <https://github.com/FakeFishGames/Barotrauma/blob/master/Barotrauma/BarotraumaShared/SharedSource/Utils/Rand.cs>. That sentence is the reason Hungry Grave's own glossary says a pinned run "pins the dice, not the stage": a seeded stream only reproduces if the call order reproduces, and directed density changes the call order when the hands change.

The limit here is the same one. Barotrauma's intensity reads crew health, hull integrity, flooding, fire and enemy proximity, all of which come out of a physics simulation the game does not claim to replay. The determinism discipline exists for client and server agreement, not for a tape.

### Left 4 Dead: the timers are ticked, the dice are not seeded (DOCUMENTED, INFERRED)

The Source server simulates in ticks, so the director's timers are not a wall clock in the strict sense. The convar table says so in passing: `sv_alternateticks` is described as "If set, server only simulates entities on even numbered ticks", and `sv_max_usercmd_future_ticks 8` counts player commands in ticks. The rate itself is compiled per game and is not a convar. The dice are the problem, not the clock. The shipped finale scripts call Squirrel's global `RandomInt` for their delays (the sibling quotes `DELAY RandomInt(5,10)` from the concert finale), and the special-class selection is described by the disassembly as choosing uniformly among due-and-eligible class IDs with no seeded stream anywhere in the path. Nothing in the 4,193-entry convar table sets or exposes a director seed. Valve did not need one: Source records a demo as network packets rather than as inputs, so playback never re-runs the simulation.

### Factorio: the one shipped game where a budgeted spawner and a seed-plus-input replay coexist (DOCUMENTED)

Factorio is not usually called a director, but its pollution system is one by every structural test: a currency that accrues from what the player is doing, a per-enemy cost table, and waves bought out of the budget.

> "If a chunk's pollution is greater than 20, each enemy spawner absorbs 20 + 0.01 * [chunk's pollution] every 64 ticks... After a certain amount of pollution is absorbed the spawner sends one of its biters/spitters to a rendezvous point. Every 1 to 10 minutes (random) the mustered biters launch an attack."

The cost table ("Required pollution to add an additional biter/spitter to the attack wave") runs small biter 4, medium 20, big 80, behemoth 400, which is a spawn card deck in another vocabulary. Source: <https://wiki.factorio.com/Pollution> (COMMUNITY-MEASURED, on the developer-run wiki). The absorption cadence is stated in ticks, not seconds.

That system runs inside a simulation that is deterministic by contract. "The base unit of all time inside Factorio... there should always be 60 ticks in every real-time second" (<https://wiki.factorio.com/Time>). "Factorio multiplayer code uses deterministic lockstep... by sending only the user inputs that control that game, rather than networking the state of the objects in the game itself. It means that all players' games need to simulate every single tick of the game identically" (<https://wiki.factorio.com/Desynchronization>). And a replay is a re-simulation, checked: "The game runs in a special mode when it makes a CRC from the whole map every tick... After a while we save the game and replay it. The replay also takes the CRC check every tick. In case this CRC doesn't correspond to the CRC generated during the game run, the desynchronization exception is thrown." Source: <https://www.factorio.com/blog/post/fff-47>.

The enforcement is the part worth stealing. Factorio does not ask mod authors to avoid nondeterminism, it removes the ability:

> "Factorio adds several functions and libraries to the Lua environment that cannot be found in standard Lua 5.2.1. Furthermore, it modifies several functions to be deterministic, notably `pairs()` and `math.random()`... Some modules that are part of standard Lua are not accessible in Factorio's Lua environment, mostly to ensure determinism. These inaccessible modules are: `loadfile()`, `dofile()`, `coroutine`, `io` and `os`."

Source: <https://lua-api.factorio.com/latest/auxiliary/libraries.html>. The wall clock is deleted, not discouraged, and hash iteration order is made deterministic too. That second one is a live hazard for a director, which will want to iterate a set of candidate spawn slots.

One shipped desync, because it is the exact failure a director invites. FFF #340: "the unit is part of a unit group, and this group was caching the value of its 'max speed' based on the slowest unit in the group. However this value was not saved with the save game, but was recalculated each time the game was loaded." Source: <https://www.factorio.com/blog/post/fff-340>. A cached pressure value that is recomputed rather than reproduced is the same bug.

### Two seeding architectures, and one of them has a shipped bug worth avoiding

Slay the Spire has twelve named per-subsystem streams and seeds every one of them from the same root value:

```java
monsterRng = new Random(Settings.seed);
eventRng   = new Random(Settings.seed);
cardRng    = new Random(Settings.seed);
```

The consequence is player-visible correlation: "the first value produced by `monsterRng` will match the first value produced by `eventRng`", so "If your first combat encounter is not a Cultist, then your first mystery room (? room) will be an event." Source: <https://forgottenarbiter.github.io/Correlated-Randomness/>. Risk of Rain 2 avoids this by chaining rather than repeating: each stream is constructed from the **next value** of its parent. Named streams are correct; naming them and then handing them all the same seed is not.

Noita takes a third road that is worth naming because it removes the whole class of problem. It carries no stream cursor at all; a roll is addressed by the world seed plus a coordinate, and "Some events are not inherently tied to a position (like rain and perk deck generation), these rolls use hard-coded numbers for the position... Other rolls use the frame counter in one or both coordinates." Source: <https://noita.wiki.gg/wiki/Technical:_Noita_PRNG> (COMMUNITY-MEASURED). A tick-indexed stateless roll cannot slip, because there is no cursor to slip: an extra draw somewhere else cannot shift it. Age of Empires reaches the same safety by the opposite move, saving and restoring the generator's state around a non-simulation draw: "saving and re-seeding the pseudo-random number generator with the last random number took care of things inside the simulation that we needed to be random but not change the simulation." Source: <https://zoo.cs.yale.edu/classes/cs538/readings/papers/terrano_1500arch.pdf>.

### The correction: Devil Daggers is not the precedent it looks like

Devil Daggers is the game most often named as proof that a seed plus inputs can rebuild a run, and its replay format says otherwise. The event types in a `.ddreplay` are spawn, entity position, entity orientation, entity target, hit, gem, transmute, inputs and end: the simulation's outputs are recorded alongside the inputs, not derived from them. And there is no director and no spawn RNG at all, because the spawnset is a static table of "Spawn enemy type, Spawn delay" pairs. Sources: <https://github.com/NoahStolk/ddinfo-core/blob/main/docs/game-formats/replay-events.md>, <https://github.com/NoahStolk/ddinfo-core/blob/main/docs/game-formats/spawnset-binary.md>. Its famous determinism is the determinism of an authored script.

### The plain negative

**No shipped game documents its director as deterministic or seeded, anywhere.** Booth's 95-slide deck contains no occurrence of "seed", "determinis" or "random number generator" as an engineering claim; the one near-hit is the design phrase "nor deterministically uniform", meaning "not evenly spaced". Fatshark has published nothing on the subject. Gearbox and Hopoo have published nothing on Risk of Rain 2's director determinism; it is legible only by reading the decompiled code and by player experiment on Prismatic Trials, where the finding is exactly the split the code predicts: "the same enemy spawned at the same time every time as far as I could tell", while "Lunar Coins are not deterministic" (<https://steamcommunity.com/app/632360/discussions/0/1812044473317846712/>, COMMUNITY-MEASURED).

So the precedent exists in shipped code and in one lockstep game's constraint, and it does not exist in shipped prose. Nobody has written down how to build a replayable director, and two of the three codebases that come closest sidestep the hard part: Risk of Rain 2 runs its director server-only and ships the results to clients, and Barotrauma does the same.

---

## Open items

- **No developer statement anywhere says a director is seeded or deterministic.** Not Valve, not Fatshark, not Gearbox or Hopoo, not Ghost Ship, not Creative Assembly. Risk of Rain 2's discipline is legible only by reading the decompiled code and by player experiment on a fixed daily seed. Searches for "deterministic AI director", "seeded spawn director", "director rng seed", "fixed timestep spawn director" and "lockstep determinism enemy spawner" returned only hobby repositories, an asset-store listing, and generated tutorial content.
- **No statement from Fatshark on why the nearby-kill term was dropped between Vermintide 2 and Darktide.** The absence is unambiguous in the code, the reason is not on record anywhere I could find.
- **Left 4 Dead's intensity increments per event category are not convars**, so the only route to them is a disassembly of `server_srv.so`; the sibling cites one. The convar table exposes the thresholds, the decay, the hold and the two death radii and nothing else about the signal.
- **No patch note in either Left 4 Dead names a director convar and changes its value**, so the record of what those defaults used to be does not exist in prose. Recovering it would mean diffing convar tables across shipped depot versions, which is a different exercise.
- **The live Valve Developer Community is behind a proof-of-work wall**, so the `DirectorOptions` key list here comes from a 2013 Wayback snapshot, which is itself community-written and says it is not exhaustive. No authoritative list with defaults exists publicly.
- **Devil Daggers' tick rate is not documented by any primary source.** The replay format confirms discrete ticks (inputs are the last event in each tick's group) and names no rate.
- **Risk of Rain 2's two hardcoded literals are unexplained**: the 1 to 10 second player retarget window and the 40% credit handoff on deactivation are method locals rather than serialized fields, and no note says why those two and not others.
- **Vermintide's intensity graph has no screenshot or developer statement.** What it draws is fully readable from the code, but nothing records how it was actually used during tuning, or whether it survived into Darktide's tooling.
- **No shipped single-player game distributes runs as seed-plus-input tapes for leaderboard verification.** Devil Daggers records the simulation's outputs alongside the inputs; Spelunky 2's input-tape playback is a community tool, not a shipped feature; Factorio's replay is shipped but is a viewing feature.
- **Roughly a third of Darktide's director changes ship with no patch note**, so a player complaint thread is not reliable evidence of what changed. The 2024 trickle-horde loosening is the clearest case: five constants moved and neither part of that update's notes mentions pacing.
- **No Fatshark "AI director rewrite" was ever announced**, despite the player forums describing one. `pacing_manager.lua` shows incremental commits at every build and no restructure.
- **Darktide's "hard terror point limit from 60 to 90" could not be located as a constant** in any tracked pacing file, so that note stands on the note alone.
- **No public source names what Left 4 Dead 2's shipped gamestats pipeline uploaded**, table by table or row by row. Valve's published stats pages for the game are per-player summaries, and no spatial death map for Left 4 Dead was ever published, though Valve published them for Half-Life 2: Episode Two and Team Fortress 2.
- **No source shows anyone tuning Left 4 Dead's pacing against the intensity strip chart.** The chart exists in the decks as an explanatory diagram; the measurements named in Valve's own playtest talk are deaths, surveys and Q&As.
- **Nothing was found on how a director's knobs interact with a replay format.** The problem ADR 0027 solves for starting values has no shipped analogue for tuning values, because no shipped director had to replay.

---

## What this implies for Hungry Grave

Stated as implications, not decisions. INFERRED throughout unless a source is named.

**The data boundary is also the tape header boundary, and that is the constraint no shipped director had to think about.** Every knob that ships as data and that changes what the simulation does is a value a tape's replay depends on. ADR 0027 already rules the answer for starting values: the header records the value the run actually resolved to, never an absence meaning "the default", because recording the absence "would let a later tune of the default silently change what every old tape replays as." A directed-density knob set is exactly that problem at larger scale, and ADR 0043 already names the general form. So the real cost of a knob is not the field, it is the header byte and the versioning it implies, and the cheapest knob is one that is compiled and therefore travels with the build identity rather than with the tape.

**Nobody exposes the whole surface at once, and the one team that did wrote a warning about it.** Left 4 Dead 2 has 122 director convars and at least 102 script keys, and Valve's own documentation says "it is very easy to over-constrain the Director." A first director does not need that surface; Risk of Rain 2's has about fifteen serialized fields plus a card asset per monster, and it carried the game. Booth's own summary of the three years is the same point from inside: "We tried several things. As I'm sure you've found, the more clever you get the more complicated and worse things end up. What we've found is that the simplest worked really effectively." (Source: the 11 Secrets PDF, quoting the GDC talk.)

**Put the unit in the name, because the shipped examples that are legible are the ones that did.** `z_mob_population_density` is documented as "per square inch (0.0064 = 4 per 1x1 nav area)", the item densities as "Items per 100 yards square", `intensity_decay_time` as "Seconds to decay full intensity to zero". The ones that are opaque are the ones whose description was autogenerated: "AI Director - the threshold for intensity. generated" tells a reader nothing. A knob whose unit is not written down is a knob nobody else can tune.

**On the kill term, the record now points one way rather than two.** The sibling left this as a fork: Left 4 Dead counts a nearby kill as intensity because for Booth intensity is drama, and for Hungry Grave a kill up close is food. Three things sharpen it. First, the L4D convar table shows the near-kill rule is nothing but two radii, 150 and 500 units, with no notion of who killed it. Second, Vermintide's four-line function shows the same, and its weight is large enough to matter: a corpse at contact range is worth about a point of mean intensity against a peak threshold of 45, so a horde cleared in a doorway moves the reader toward peak on kills alone. Third, and this is the new evidence, **Fatshark deleted the term when it rewrote the director for Darktide**. Two of the four shipped pressure readers count kills, and they are the two older ones. A grave that eats what it kills would be reading its own dinner as danger; the newer shipped precedent says do not.

**The signal's own constants are cheap to expose and the event weights are not.** Left 4 Dead ships the decay time, the hold, the two radii and the thresholds as convars, and compiles the increments. That split is defensible on its own terms: the time constants and thresholds are what a designer retunes while watching, and the increments define what the number *means*, so changing one silently redefines every threshold above it. Under ADR 0027 it is also the cheaper split, because thresholds can live in the header while the meaning of the signal stays pinned to the build.

**Build the instrument before the tuning pass, not after.** Vermintide's graph is a couple of dozen lines and it shows the signal, the per-player spread, the field population and a labelled reason at every state change, over a 120-second window. Hungry Grave already has the harder half of this: a tape replays exactly, so the graph can be drawn from a replay rather than only live, and ADR 0021 keeps the instrument's purposes an open pool. `intensity_lock` is the other half and it is one line: pin the signal to a value and watch what the density does, so the consequences can be tuned without having to produce the state that triggers them.

**Decide the measurement before the instrument, because Valve's was a scalar per chapter.** The graph is for watching; the thing that actually decided whether a change worked was "Deaths in 'No Mercy - The Apartments'" pre against post, next to survey answers, and Ambinder's stated policy is "Define questions first, then schema." Hungry Grave's equivalent unit is a number per phase off a tape, and the tape format already has the shape for it: the witness is stamped at checkpoints (ADR 0019), and anything recomputable is derived by replaying rather than recorded (ADR 0018). So the per-phase number does not need a new recording mechanism, it needs somebody to name which number, before the director exists rather than after.

**Tune with the rig, and write the number down, because half the industry does not.** Valve's overnight rig is four convars over the shipped game rather than a separate harness, and the bot in this project is the same shape. On publishing, the two practices are opposite and both are on record: Valve never names a director convar in a patch note across two games, while Fatshark ships "Pacing" sections with dev notes, and roughly a third of Fatshark's own director changes still ship silently. The tapes are the only tuning history this project gets for free, and a note naming the knob and the old and new value is the part that has to be written on purpose.

**The shipped answer to a player outrunning the director is also a table.** Vermintide added `speed_running_intervention` as a four-band ladder keyed to distance ahead of the pace, tightening the special-spawn delay from `{15,30}` down to `{5,12}` seconds, and shipped it with no value edits elsewhere. Left 4 Dead's bridge gauntlet does the same thing locally by reading `GetAveragedSurvivorSpeed` in its own script. Both treat "the player is skipping the pressure" as a separate ladder rather than as a term in the signal, which is the cheaper shape and keeps the reader meaning one thing.

**The fix for a director that will not let up is a gate, not a smaller number.** This is the clearest cross-game pattern in the patch record. Darktide's answer to a ramp that never relented was `wait_for_ramp_clear` plus a `wait_for_ramp_clear_reset {80, 160}`, a mandatory quiet interval; in the same window it stopped the specials timer from advancing while a horde is live. Vermintide's whole launch-window correction was threat-value gating, deferring a spawn while enough threat is already on the field, and its Cataclysm tier turns that gate off by setting the specials threshold to 1000. Left 4 Dead's Relax is the same idea in state-machine form. All of them are cheaper to reason about than a curve, and all of them are the thing ADR 0047's "lowering means withholding" clause already describes: a first director wants a gate that says not yet, before it wants a smooth response.

**Do not expect to retune the signal; expect to retune what it gates.** Darktide's tension thresholds and decay were set before launch and have moved once since. Vermintide's `peak_intensity_threshold 45`, `horde_frequency {70, 150}`, `max_intensity 100` and `decay_per_second 2` have not changed in eight years. What both studios tune, patch after patch, is the ramp bands, the spawn cooldowns, the threat gates and the population mix. That argues for spending the knob budget on the population side and letting the signal's constants settle early.

**Two shipped director faults were plumbing.** Vermintide's per-difficulty overrides were silently discarded at load for the game's first month because two loops at the end of the settings file overwrote them, and Darktide shipped a 0.9 chance where 0.25 was meant. Both are the failure mode of a layered override table, which is Option A's cost stated concretely. A test that asserts the resolved value of every knob at every phase would have caught both, and this project already has the mechanism for that shape of check in the invariants (ADR 0023).

**On determinism, the constraint is now precedented in pieces rather than unprecedented.** The sibling's open item said no shipped director derives its state from a seed and a tape, and that stands. What it can now be built against: Risk of Rain 2 runs its director in `FixedUpdate` off a stream chained from the run seed; Barotrauma runs its event director inside a 60 Hz accumulator with a spiral-of-death clamp, the same construction ADR 0015 rules, and draws from an MT19937 seeded off the level; and Factorio ships a budgeted, player-reading spawner inside a lockstep simulation whose replays are re-simulations verified by a per-tick CRC. The whole thing has been done, just never by one game.

**Three hazards come with names attached.** Correlated streams: Slay the Spire named twelve streams and seeded every one from the same root value, so its monster and event rolls move together. Chain instead, as Risk of Rain 2 does. Cursor slip: any extra or missed draw shifts everything downstream of it, which is why Spelunky 2's TAS documentation warns that spawning an entity anywhere can desync a run, and it is the argument for Noita's tick-addressed stateless roll, where there is no cursor to slip. And cached derived state: Factorio's FFF #340 desync was a cached group speed recomputed on load rather than saved, which is precisely what a cached pressure value would be to a replay.

**The one thing to check before any of this: what does the pressure value read from, and is all of it in the tape?** Every shipped signal reads damage taken and health, both of which Hungry Grave derives from size, which is derived from the tape. That is the fortunate case. A kill-distance term would read mob positions, which are also derived, so it is replay-safe even though it is design-unsafe. The unsafe inputs are the ones no shipped director has: anything read from a frame timing, an input event outside the tape, or a wall clock.

---

### Option A: the Left 4 Dead split. Time constants and thresholds are data, event weights are compiled.

Data: the peak threshold, the relax threshold, the hold, the decay rate, and the per-phase population caps and intervals, plus a per-phase override table in the shape of `DirectorOptions` so a phase can quiet the director by setting three values rather than by a special case in code. Compiled: what each event is worth in signal points, and the state machine's order.

Named precedent: Left 4 Dead 2 exactly, where `director_intensity_threshold`, `director_relax_min_interval`, `intensity_decay_time` and the two death radii are all convars while the increments are not, and `director_quiet.nut` is three keys.

Cost: the override table is the thing Valve warned about, and the more of it exists the more of it can conflict. Under ADR 0027 every exposed value that changes replay meaning needs a header field or a build pin.

Gains: it is the split the one game that tuned a director for three years arrived at, and the exposed set is exactly the set a designer changes while watching a graph.

### Option B: the Darktide split. One authored number per knob, the tiers and phases derived.

Data: one base value per knob, plus a small derivation table. Darktide writes `max_tension` once as 100 and derives five difficulty tiers by `×{1, 1.2, 1.35, 1.5, 1.75}`, and its allowed-spawn-types matrix is a six by six boolean table rather than branches in code. Hungry Grave's equivalent axis is the phase rather than a difficulty tier: one authored density knob per concept, with a per-phase multiplier row and a per-phase permission row, and the three off-limits moments in ADR 0047 become three `false` cells rather than three conditions.

Named precedent: Darktide for the derivation and the permission matrix; Vermintide 2 as the counterexample, where every difficulty is hand-written and several values invert between tiers.

Cost: derived tiers are only right while the tiers are genuinely a scaling of one thing. The moment one phase needs a different shape rather than a different amount, the ladder has to be broken open, and Vermintide's inverted damage sensitivity is what that looks like in practice.

Gains: the smallest knob count of the three, and the permission matrix makes the off-limits rule readable as data, which is the ADR 0047 clause most likely to be violated silently by a later change.

### Option C: the Risk of Rain 2 split. No signal knobs, because there is no signal; only the budget and the cards are data.

Data: a credit or budget rate, the spawn intervals inside and between attempts, the maximum count per attempt, the too-cheap skip rule and its consecutive-skip escape, and one card per mob type carrying its cost, weight, minimum phase and placement rule. Compiled: everything else, including the two literals Risk of Rain 2 itself never exposed, its retarget window and its 40% credit handoff.

Named precedent: Risk of Rain 2, whose combat director is roughly fifteen serialized fields plus an asset per monster, and whose per-run variation comes from card weights rather than from a reader.

Cost: it does not answer the case that opened this question, a levelled player clearing the back half unpressed, because nothing reads the player. It also brings Risk of Rain 2's own failure mode, which took three patches and a "nothing spawned for 60 seconds" escape hatch to close.

Gains: it is the cheapest thing to make replay-safe, because a budget plus a weighted card draw is a pure function of the tick count and one seeded stream, and it composes with the existing per-run roster (ADR 0046) without a new mechanism.

### Recommendation

INFERRED. Ship Option B's shape with Option A's exposed set, and keep the signal's event weights compiled.

Concretely: one authored number per knob with a per-phase multiplier row and a per-phase permission row, so the three off-limits moments in ADR 0047 are cells in a table rather than conditions in code; the peak threshold, the relax threshold, the hold and the decay rate exposed as data because those are what gets retuned while watching; and the event weights, the meaning of one point of pressure, compiled, so that a threshold in a tape header keeps its meaning and a retune of the weights reads as a different build rather than as a silently different replay. Give the first version a gate before a curve: a minimum quiet interval after the director has added anything, in Darktide's `wait_for_ramp_clear_reset` shape, because that gate is what both Fatshark games actually reached for when a director would not let up, and it is also the readable form of ADR 0047's rule that lowering means withholding. Write every timing and size knob as a min/max pair from the start, because 39 of Left 4 Dead 2's are and both Fatshark games express durations as two-element tables, so a single number becomes two the first time a beat needs to stop being metronomic. Build the graph before the first tuning pass, in Vermintide's shape, drawn from a replayed tape: the signal, the mobs alive, and a labelled reason at every state change. Add the `intensity_lock` equivalent at the same time, because it is one field and it converts the tuning problem from "produce the state" into "watch the consequence". Take the seeded stream from Risk of Rain 2's chain rather than Slay the Spire's repeated root, and consider Noita's tick-addressed roll for the director's own dice specifically, because a director whose draws are addressed by tick cannot slip its cursor when a later change adds a draw somewhere else.

This rests on: the convar table showing that only seven of Left 4 Dead's knobs define its signal while the event weights stay compiled; Valve's own "very easy to over-constrain the Director"; Darktide's multiplier ladder and its six by six permission matrix; the eight-year Fatshark record in which the ramp bands, spawn cooldowns and threat gates are retuned repeatedly while the tension curve is frozen, and in which the fix for a relentless director was a clear-gate rather than a smaller number; the absence of any patch note in either Left 4 Dead naming a director convar, so the tuning history is the tapes unless somebody writes it down; Vermintide's shipped graph as a specification for the instrument; Risk of Rain 2's `FixedUpdate` plus chained `Xoroshiro128Plus` and Barotrauma's 60 Hz clamped accumulator plus level-seeded MT19937 as the two halves of the determinism precedent; Factorio proving the two halves can be one system; and Fatshark dropping the nearby-kill term when it rewrote its own director. The designer decides.

---

## Sources

Shipped data, decompiled code and convar tables:
- Left 4 Dead 2 convar table with defaults, flags and descriptions: <https://convars.l4d2node.org/>
- Left 4 Dead 2 decompiled VScripts: <https://github.com/Stabbath/L4D2-Decompiled>, specifically `director_base.nut`, `director_gauntlet.nut`, `director_onslaught.nut`, `director_quiet.nut`, `c8m5_rooftop_finale.nut`
- `DirectorOptions` key list, 2013 snapshot: <http://web.archive.org/web/2014/https://developer.valvesoftware.com/wiki/L4D2_Vscripts>
- `DirectorOptions` appendix and the over-constraint warning: <http://web.archive.org/web/20250807092605/https://developer.valvesoftware.com/wiki/Left_4_Dead_2/Scripting/Expanded_Mutation_System/Appendix:_DirectorOptions>
- Risk of Rain 2 decompile: <https://github.com/WarmBuns/DecompiledPile>
- Vermintide 2 source mirror: <https://github.com/Aussiemon/Vermintide-2-Source-Code>
- Darktide source mirror: <https://github.com/Aussiemon/Darktide-Source-Code>
- Barotrauma: <https://github.com/FakeFishGames/Barotrauma>
- Devil Daggers replay and spawnset formats: <https://github.com/NoahStolk/ddinfo-core/blob/main/docs/game-formats/replay-events.md>, <https://github.com/NoahStolk/ddinfo-core/blob/main/docs/game-formats/spawnset-binary.md>
- Source demo format: <https://github.com/SizzlingStats/demboyz/blob/master/docs/DemFormat.md>

Developer statements and engineering write-ups:
- Mike Booth, "The AI Systems of Left 4 Dead", GDC 2009: <https://steamcdn-a.akamaihd.net/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf>
- Mike Ambinder, "Data to Drive Decision-Making", Steam Dev Days 2014, with the Left 4 Dead deaths-per-chapter case study: <http://media.steampowered.com/apps/steamdevdays/slides/data.pdf>
- Mike Ambinder, Valve biofeedback deck, 2011, with the annotated skin-conductance trace and the director strip chart: <https://cdn.akamai.steamstatic.com/apps/valve/2011/ValveBiofeedback-Ambinder.pdf>
- Charlie Burgin, "Left 4 Dead, by the Numbers", 2009: <https://www.l4d.com/blog/post.php?id=2460>
- Half-Life 2: Episode Two death maps, the spatial readout Valve published for another game and never for Left 4 Dead: <http://web.archive.org/web/20071118110944/http://www.steampowered.com/status/ep2/ep2_stats.php>
- AiGameDev, "11 Secrets about Left 4 Dead's AI Director", quoting the GDC talk: <https://www.cs.drexel.edu/~santi/teaching/2012/CS680/papers/>
- Factorio Friday Facts #47 on replay CRC checking: <https://www.factorio.com/blog/post/fff-47>
- Factorio Friday Facts #340 on a cached-state desync: <https://www.factorio.com/blog/post/fff-340>
- Factorio modding API, determinism constraints on the Lua environment: <https://lua-api.factorio.com/latest/auxiliary/libraries.html>
- Factorio wiki, tick rate, lockstep, replays and pollution: <https://wiki.factorio.com/Time>, <https://wiki.factorio.com/Desynchronization>, <https://wiki.factorio.com/Replay_system>, <https://wiki.factorio.com/Pollution>
- Terrano and Bettner, "1500 Archers on a 28.8", on synced seeded RNG in Age of Empires: <https://zoo.cs.yale.edu/classes/cs538/readings/papers/terrano_1500arch.pdf>
- Riot Games, determinism in League of Legends: <https://www.riotgames.com/en/news/determinism-league-legends-implementation>, <https://www.riotgames.com/en/news/determinism-league-legends-introduction>
- Glenn Fiedler, "Deterministic Lockstep" and "Floating Point Determinism": <https://gafferongames.com/post/deterministic_lockstep/>, <https://gafferongames.com/post/floating_point_determinism/>
- Forgotten Arbiter on Slay the Spire's correlated seeds: <https://forgottenarbiter.github.io/Correlated-Randomness/>

Patch notes:
- Darktide, the ramp spike and its walk-back: <https://forums.fatsharkgames.com/t/the-traitor-curse-part-1-anniversary-update/86764>, <https://forums.fatsharkgames.com/t/the-traitor-curse-part-2-anniversary-update-out-now/88606>
- Darktide, the "Pacing" section that names the most: <https://forums.fatsharkgames.com/t/nightmares-visions-patch-notes/106200>; the coordinated-strike hotfix: <https://forums.fatsharkgames.com/t/hotfix-78-1-9-2-patch-notes/113108>; the launch-window pacing tuning: <https://forums.fatsharkgames.com/t/1-0-7-update-expanded-patch-notes-balance-tweaks/58673>; the conflict-director horde types: <https://forums.fatsharkgames.com/t/patch-13-class-overhaul-part-1/83184>
- Darktide balance devblog on rising player power: <https://forums.fatsharkgames.com/t/devblog-incoming-balance-changes/121374>
- Vermintide 2 launch-window director patches: <https://store.steampowered.com/news/app/552500/view/2982945658369344056>, <https://store.steampowered.com/news/app/552500/view/2365952982532225023>, <https://store.steampowered.com/news/app/552500/view/4249665521686954219>, <https://store.steampowered.com/news/app/552500/view/2394102381817789191>
- Left 4 Dead and Left 4 Dead 2 updates: <https://store.steampowered.com/oldnews/2162>, <https://store.steampowered.com/oldnews/3408>, <https://store.steampowered.com/oldnews/4672>, <https://store.steampowered.com/oldnews/4729>, <https://store.steampowered.com/oldnews/7162>, <https://store.steampowered.com/oldnews/7367>, <https://store.steampowered.com/news/75849/>, <https://store.steampowered.com/news/75935/>, <https://store.steampowered.com/news/76155/>, <https://store.steampowered.com/news/app/550/view/3646280012042428636>

Community wikis and player experiment:
- Risk of Rain 2 Directors and Prismatic Trials: <https://riskofrain2.wiki.gg/wiki/Directors>, <https://riskofrain2.wiki.gg/wiki/Prismatic_Trials>
- Risk of Rain 2 seeded-run determinism test thread: <https://steamcommunity.com/app/632360/discussions/0/1812044473317846712/>
- Noita PRNG addressing: <https://noita.wiki.gg/wiki/Technical:_Noita_PRNG>
- Spelunky 2 TAS Wizard documentation on seed plus input playback: <https://github.com/Cosine256/spelunky-2-tas-wizard>
- CelesteTAS input file format: <https://github.com/EverestAPI/CelesteTAS-EverestInterop/wiki/Input-File>

---

## Reproducing the checks

**The Left 4 Dead 2 convar table.** Fetch <https://convars.l4d2node.org/> and parse the rows; each carries `data-n` (name), `data-f` (flags), `data-s` (client/server) and a `cv-default` span. 4,193 entries, 3,326 of them with a default, 122 beginning `director_`, 657 beginning `z_`.

```
curl -sL https://convars.l4d2node.org/ -o cv.html
python3 -c "
import re,html
s=open('cv.html',encoding='utf-8',errors='ignore').read()
rows=re.findall(r'<tr class=\"cv-row\"[^>]*data-n=\"([^\"]+)\".*?<span class=\"mono cv-default\">(.*?)</span>.*?<td class=\"cv-desc\">\s*(.*?)\s*</td>', s, re.S)
for n,d,desc in rows:
    if n.startswith(('director_','intensity_','z_mob','z_common','z_wandering')):
        print(n, '=', d, '|', html.unescape(re.sub(r'<[^>]+>','',desc)).strip())
"
```

**The `DirectorOptions` key list.** The live Valve wiki is behind a proof-of-work wall. The 2013 snapshot is readable and is where the 102-key count comes from: <http://web.archive.org/web/2014/https://developer.valvesoftware.com/wiki/L4D2_Vscripts>. The mutation-system appendix, with the over-constraint warning, is at <http://web.archive.org/web/20250807092605/https://developer.valvesoftware.com/wiki/Left_4_Dead_2/Scripting/Expanded_Mutation_System/Appendix:_DirectorOptions>.

**Risk of Rain 2.** The decompiled files used here:

```
base=https://raw.githubusercontent.com/WarmBuns/DecompiledPile/c406b061fb3e9b225919653569bd23c9693f1e96/RoR2_diff_20_05_2024-main/DecompilationOutput/RoR2
for f in CombatDirector DirectorCore Run DirectorCard SpawnCard DirectorCardCategorySelection; do curl -sLO "$base/$f.cs"; done
grep -n "Xoroshiro\|FixedUpdate\|fixedDeltaTime" CombatDirector.cs
grep -n "Rng\|seed" Run.cs
```

**Fatshark.** Raw files from the two source mirrors:

```
V=https://raw.githubusercontent.com/Aussiemon/Vermintide-2-Source-Code/master
D=https://raw.githubusercontent.com/Aussiemon/Darktide-Source-Code/master
curl -sL $V/scripts/settings/conflict_settings.lua           # IntensitySettings, PacingSettings
curl -sL $V/scripts/managers/conflict_director/pacing.lua    # enemy_killed, intensity_graphs, annotate_graph
curl -sL $D/scripts/managers/pacing/templates/default_pacing_template.lua
curl -sL $D/scripts/managers/pacing/pacing_manager.lua       # add_tension, add_damage_tension, add_tension_type
curl -sL $D/scripts/settings/difficulty/minion_difficulty_settings.lua   # tension_to_add, damage_tension_to_add
```

The Fatshark mirrors snapshot nearly every shipped build, so a constant's history is a commit list on one path. To check a patch note against the value it moved:

```
curl -s "https://api.github.com/repos/Aussiemon/Darktide-Source-Code/commits?path=scripts/managers/pacing/templates/default_pacing_template.lua&per_page=50"
# then fetch the same path at two SHAs and diff
curl -sL "https://raw.githubusercontent.com/Aussiemon/Darktide-Source-Code/<sha>/scripts/managers/pacing/templates/default_pacing_template.lua"
```

To confirm the Darktide negative on kills, list the keys of both tension tables and check that no enemy-death key exists: `tension_to_add` holds `killed_by_daemonhost`, `knocked_down`, `netted`, `pounced`, `died`; `damage_tension_to_add` holds `damaged`, `absorbed_damage`.

**Barotrauma.** Four files, all on `master`:

```
B=https://raw.githubusercontent.com/FakeFishGames/Barotrauma/master/Barotrauma
curl -sL $B/BarotraumaShared/SharedSource/Timing.cs                  # FixedUpdateRate 60, Step, AccumulatorMax
curl -sL $B/BarotraumaClient/ClientSource/GameMain.cs                # the accumulator loop and the clamp
curl -sL $B/BarotraumaShared/SharedSource/Events/EventManager.cs     # RandomSeed from level.Seed, MTRandom
curl -sL $B/BarotraumaShared/SharedSource/Utils/Rand.cs              # RandSync enum and its doc comment
```
