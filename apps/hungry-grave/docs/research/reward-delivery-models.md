# Reward delivery models: how power arrives, and what shipped games paid for each way of handing it over

Research for Hungry Grave. Labels: **DOCUMENTED** = from shipped game data files, decompiled resources, a shipped behaviour transcribed by a wiki, or a developer statement (patch note, interview, talk). **COMMUNITY-MEASURED** = wiki or player-derived. **INFERRED** = my reading across sources.

This document sits beside [survivor-numbers.md](survivor-numbers.md), [progression-tuning-precedent.md](progression-tuning-precedent.md) and [shmup-stage-design.md](shmup-stage-design.md). Those already hold the Vampire Survivors offer weights and XP curve, Brotato's level and shop tiers, Halls of Torment's XP tables, Slay the Spire's rarity offset, Touhou's every-third-enemy 32-entry item cycle, DoDonPachi's four power-ups to max, Garegga's per-enemy fragments and rank cost per pickup, Iuchi's "items are very frequently the stupid cause of my death", ZeroRanger's one weapon per boss, and the survivors-like level-ups-per-minute table. Anything there is cited, never repeated. The new ground here is the delivery model itself: which mechanism hands the player their power, how often, what happens when a burst of kills lands at once, whether any shipped game lets the player choose among several powers on the field with the game running, and what each model's designers said it cost them.

The strongest sources are Hiroyasu Machiguchi's two interviews on why Gradius has a power meter at all, Hiroshi Iuchi's interview on why Radiant Silvergun has no items, Chasing Carrots' 2023-10-30 patch note explaining why Halls of Torment stopped reading its difficulty meter from kills, Hopoo's Duncan Drummond and Paul Morse on why Risk of Rain scales difficulty from time and not kill speed, and the Vampire Survivors and Brotato wikis' transcriptions of the shipped pickup caps. The gap is the same as in the sibling records: no developer in either lineage has said in public how often power should arrive.

Hungry Grave's current shape, for reference: a kill is credited against a rising price table (5, 6, 8, 10, 12, 15, 18, 23, 28, 35, 43, 53 kills, `src/game/drops.ts`), and when the count crosses the price a drop spawns as an offer of three options spinning on the field, the grave getting the one it touches (ADR 0034). That is Vampire Survivors' XP threshold with kills as the XP, the gem step folded into corpses, and the level-up menu moved onto the field. ADR 0034 names its own origin: the 2026-08-31 belch-thread tape reading, and "Vampire Survivors' level-up choice is the precedent, made diegetic." It is treated below as one option among five, with that origin, and never as a constraint.

---

## What is solid

These are the claims I would build on.

1. **Five delivery models cover every shipped game examined, and every model that offers a choice among several powers pauses the run to do it, with two exceptions.** Threshold plus choice (Vampire Survivors, Brotato, Halls of Torment, 20 Minutes Till Dawn, Nuclear Throne, Hades) pauses at a menu or defers the menu to a beat. Field items (Touhou, DoDonPachi, Garegga, Toaplan, Raiden) offer take-or-refuse and, at most, a single item cycling through options on a timer. Bank-then-buy (Gradius, Life Force, Parodius) is the one arcade model where the player chooses among six powers with the game running. Beat rewards (ZeroRanger, Downwell, Slay the Spire) hand power over at authored moments. No-items games (Ikaruga, Radiant Silvergun, Blue Revolver) grow power by play or not at all. The two on-field choices found are the Gradius meter and Risk of Rain 2's Multishop Terminal. DOCUMENTED per game, INFERRED as a taxonomy.

2. **Nothing shipped presents three distinct powers simultaneously on the field and lets the player take one by touching it while enemies attack, in either a shmup or a survivors-like.** The nearest shipped shapes are: Risk of Rain 2's Multishop Terminal, three items on three pedestals with enemies spawning, buying one locks the other two (COMMUNITY-MEASURED, wiki); Gradius's meter, six powers on one bar, chosen by capsule count and a button press (DOCUMENTED); and the timed-cycling single item of Twin Cobra, Raiden and Mushihimesama, one pickup that shows one option at a time and is taken at the moment it shows the wanted one (DOCUMENTED, wiki transcriptions of shipped behaviour). The search covered every game named in the brief plus Steredenn, Dead Cells, Nova Drift, Enter the Gungeon and the survivors-like field; Steredenn's post-boss pick turned out to be a paused five-option screen, Dead Cells' choose-one altars sit in safe rooms, Nova Drift pauses on level-up. Absence, searched for and not found.

3. **The designer who invented the arcade choice mechanic did it because take-or-skip was not enough of a decision, and the designer who removed items from his own game did it because choosing under fire killed him.** Machiguchi on Gradius: "We also tried out a system where you pick up individual items, like a 'speed up item' and 'missile item', but it somehow wasn't very satisfying. We wanted to give the players freedom in their choices. Not just the choice of whether to pick up an item or not pick it up, but something more detailed." Iuchi on Radiant Silvergun: "in Gradius, when you want to select Option but you accidentally take one power up too many and select Shield, or in Thunder Force, when you want to select Homing but you press the button too many times and end up dying as you try to cycle back to it." Both DOCUMENTED. Those two statements bracket the whole design space Hungry Grave is in.

4. **When a burst of kills lands at once, the survivors-likes consolidate the pickup and never the reward: every level earned is paid, one paused menu after another, with no cap.** Vampire Survivors caps gems on the ground at 400 and folds every further XP drop into a single red gem; that gem then pays every level it contains as consecutive level-up screens. Brotato caps materials on the ground at 50, adds the excess to the value of an existing blob, bags anything uncollected at wave end, and pays every level-up at the end of the wave, one menu per level. DOCUMENTED (wiki transcription of shipped caps) and COMMUNITY-MEASURED (the consecutive-screen behaviour). No shipped game pays two or three rewards for one burst as a single merged reward.

5. **The arcade shmups throttle a burst three ways, and all three are conversions or caps rather than menus.** At maximum power, further power items convert to score (Touhou, up to 51,200 points each; Truxton and Raiden, 5,000 each; Twin Cobra, 2,000 for a same-colour weapon icon). Fire Shark allows at most four items on screen and an item whose carrier dies while four are out simply never appears. Gradius's meter wraps: one capsule past the last slot goes back to slot one. DOCUMENTED (wiki transcriptions of shipped behaviour). The Touhou and Raiden conversion is the same rule as Hungry Grave's overflow (ADR 0002).

6. **Brotato throttles kill income itself, by wave: the base material drop chance is 100% through wave 4 and falls 1.5% times the wave number from wave 5, to a 50% floor.** So a wave-20 player who kills twice as much gets 70% of the materials per kill that a wave-4 player gets, and Horde waves multiply that by 0.65. DOCUMENTED (wiki transcription). This is the one survivors-like with an explicit late-run damper on the kill-to-power rate, and it is a per-wave table, not a formula.

7. **Two shipped games read difficulty from the player's play while paying power from kills, and both backed away from it.** Halls of Torment shipped Agony on 2023-08-31 with "Each killed enemy increases agony, while monsters that are alive reduce agony over time," and XP drops scaled by Agony rank. On 2023-10-30 it changed: "Previously killing monsters was the way of increasing your Agony score, while the number of monsters that are still alive contributed to how fast this score was decaying. In some cases this led to some overly dramatic rubber-banding. In order to gain more control over the Agony dynamic, the score is increased over time independent of how many kills you make." Risk of Rain planned kill-speed scaling before release and cut it: "But from a design point, it took out your highs and lows... If we did the scaling with you correctly, I think it'd make every round feel the same" (Drummond); "Monsters would scale to you, so it wouldn't be that rewarding" (Morse). Both DOCUMENTED.

8. **The arcade rank games do couple power to difficulty, on purpose, and the coupling is capped and reversible by death.** Gradius's rank formula is `((survival frames / 1000) + (stages × 3) + power + (options × 2) + difficulty) / 2`, capped at 15, where lasers add 4, shields add 4, missiles 2. Truxton's bullet speed is `24 + rank/2 + difficulty/2 + power × 2 + loop × 2`. DoDonPachi adds +2 rank per shot power level and Garegga prices every pickup in rank (both in the siblings). Gradius II's stage 1 was authored so that "the more you tried to power up the more dangerous the enemy attacks would become." COMMUNITY-MEASURED (disassembly transcriptions) and DOCUMENTED (Gradius II interview). Every one of these games also lowers rank on death, which is the release valve.

9. **The documented failure of bank-then-buy is the overshoot, and the documented failure of losing power on death is the spiral, and Konami shipped fixes for both.** Nemesis (the Western Gradius) spawns "a large group of orange enemies to give the player a chance to recover" after a death. Gradius V leaves the dead ship's Options on screen for the new ship to recollect. Raiden's hidden Fairy "releases several power ups once the player dies"; DoDonPachi's Max Power item "only appears after the player loses their last life." DOCUMENTED (wiki transcriptions of shipped behaviour). The community name for the unfixed version is Gradius Syndrome (COMMUNITY-MEASURED).

10. **Vampire Survivors added every escape hatch to its level-up menu within five months of launch, and later an auto-pick that removes the menu entirely.** Reroll and Skip on 13 February 2022 (patch 0.2.12), Banish on 25 March 2022 (0.3.2), a brief invulnerability after leveling up on 13 February 2022, a gold-or-chicken fallback when nothing is left to upgrade (April and July 2022), Limit Break at 1.0, and on 29 February 2024 the Brave Story relic, which "will prevent level up screens from appearing and instead apply a random upgrade upon leveling up." Brotato's restricted upgrades exist "to avoid useless upgrades." DOCUMENTED (patch notes and wiki update histories). No poncle statement on why the hatches were added was found.

11. **Threshold-plus-choice games that did not want to pause moved the menu to a beat rather than onto the field.** Brotato: "Whenever you Level Up, you gain +1 Max HP and an Upgrade at the end of the wave." Nuclear Throne: rads fill a bar at 60 × level, and the mutation is chosen "at the end of a level if you have leveled up," four options. Downwell: one of three upgrades "at the end of every level." DOCUMENTED (wiki transcriptions). Deferral is the shipped answer to "the menu interrupts the fight"; no survivors-like put the choice into the fight.

12. **The one field-item design that rewards refusing a change is Toaplan's, and it puts a price on the skip.** Twin Cobra's weapon icon cycles red, blue, green, yellow on a timer as it floats; taking it at your current colour pays 2,000 points, taking any other colour pays 100. DOCUMENTED (wiki transcription). The item is both an offer and a bonus for declining it, which is the cheapest shipped version of "a skipped option is never worthless."

---

## Model 1: threshold plus choice

A counter crosses a rising price and the game offers a menu. This is the Hungry Grave shape with the menu moved onto the field.

### Vampire Survivors (DOCUMENTED, wiki transcription of shipped behaviour; COMMUNITY-MEASURED where noted)

The trigger is XP: 5 XP for level 2, +10 per level to 20, +13 to 40, +16 after, with 600 and 2,400 XP humps at 20 and 40 (the curve itself is in progression-tuning-precedent.md). "Upon leveling up, the game is paused and the player is given 3 or 4 unique options consisting of weapons and passive items to choose from." A fourth option arrives with Luck. Owned items are offered first with a Luck-scaled chance, checked twice. Source: <https://vampire.survivors.wiki/w/Level_up>.

The burst mechanism is on the pickup, not the reward. "Blue Experience Gems grant up to 2 XP, green Experience Gems up to 9 XP and red gems contain anything beyond. If there are more than 400 Experience Gems on the ground at a time, no more gems can be dropped and any experience gained is instead accumulated into a single red Experience Gem." Source: <https://vampire.survivors.wiki/w/Experience_Gem>. Players report that the consolidated gem "is why you sometimes get a gem with several levelups of XP all at once," that the accumulating gem is "the currently furthest gem from the player," and that moving sweeps the far gems so several red gems form; one poster gives the cap as 1,000 rather than 400, so treat the exact cap as unsettled and the mechanism as solid. Source: <https://steamcommunity.com/app/1794680/discussions/0/724650931393750279/> (COMMUNITY-MEASURED).

There is no cap on levels paid per pickup. A gem worth several levels produces several consecutive level-up screens, each pausing the run. The wiki's own thread titles carry the failure mode: "I am in an endless loop of level-ing up, imprisoned in my own op-ness" (<https://steamcommunity.com/app/1794680/discussions/0/3549427890066531343/>, COMMUNITY-MEASURED, title only; the body did not fetch). The 21 January 2022 patch fixed "gems sometimes not merging if the player stands still for a long time," so the merge is deliberate and maintained.

Every escape hatch is dated. Patch 0.2.12, 13 February 2022: "2 new minor game mechanics/PowerUps" (Reroll and Skip), "Added a brief moment of invulnerability after leveling up," "Minor tweaks to weapons rarity." Source: <https://vampire.survivors.wiki/w/Updates/Patch_0.2.12_-_small_update>. Banish, 25 March 2022, patch 0.3.2: "allows you to remove an item from level up choices, for the rest of the run." Skip gives "Experience instead," 20% of the next level per the wiki's tip. On 24 April 2022 a "Tentative fix to chicken/coinbag choice presenting itself when there are still items that can be leveled up," and on 7 July 2022 an "option to always pick Coin Bag or Floor Chicken when leveling up after maxing out all weapons." Sources: <https://vampire.survivors.wiki/w/Reroll>, <https://vampire.survivors.wiki/w/Skip>, <https://vampire.survivors.wiki/w/Banish>, <https://vampire.survivors.wiki/w/Level_up>.

The auto-pick came two years later. Brave Story, 29 February 2024: "Once collected, it permanently unlocks Random LevelUp in the stage selection menu. This will prevent level up screens from appearing and instead apply a random upgrade upon leveling up." A 1 April 2026 beta made it toggleable mid-run. Source: <https://vampire.survivors.wiki/w/Brave_Story>. A game whose central verb is the level-up menu shipped a way to never see it.

Kill-rate scaling: linear in XP, and XP is per kill, so a player who kills more levels more, throttled only by the rising price and by the consolidation of the pickup. The reward count is never throttled.

On-field choice: none. The choice is a pause.

Failure modes, with evidence: useless offers (Banish, restricted upgrades in Brotato), unwanted offers (Reroll, Skip), the menu itself as an interruption (Brave Story), and resuming into the crowd the pause froze (the 0.2.12 invulnerability). No developer statement on any of these was found; the patch history is the record.

### Brotato (DOCUMENTED, wiki transcription of shipped behaviour)

The trigger is XP at `(Level + 3)²`, and the reward is deferred: "Whenever you Level Up, you gain +1 Max HP and an Upgrade at the end of the wave." The upgrade menu offers four stat upgrades in four tiers, rerollable at the shop's reroll price. Sources: <https://brotato.wiki.spellsandguns.com/Experience>, <https://brotato.wiki.spellsandguns.com/Upgrades>.

The burst mechanism has three parts. A ground cap: "There is a limit of 50 materials that can be on the map at once. If more than 50 materials would drop on the ground, the new materials is added to the value of one of the already existing blobs." A bag: "Whenever you fail to pick up Materials before a wave ends, any remaining materials on the map is collected and put into the Bag," and on a later wave "one material is extracted from the bag and is added to the value of the dropped materials." And a per-wave damper on the drop rate itself: "The base chance for enemies to drop materials is 100%. Starting at Wave 5, the chance is decreased by 1.5% times the wave number... until it hits the minimum of 50%." Wave 10 is 85%, wave 20 is 70%, wave 34 and after 50%. Horde waves multiply by 0.65. Source: <https://brotato.wiki.spellsandguns.com/Materials>.

Kill-rate scaling: sublinear late, by construction. The quadratic price plus the drop-chance decay means the kill-to-level rate falls across the run, and the wave-end deferral means the number of menus in a row is the number of levels earned that wave. Brotato is the one survivors-like with an explicit late-run damper on kill income, and it ships as a per-wave table.

On-field choice: none. The menu is between waves, in silence.

### Halls of Torment, 20 Minutes Till Dawn, Nuclear Throne, Hades (DOCUMENTED, wiki transcriptions)

Halls of Torment pauses on level-up and gates each trait and rank behind a hero level window (progression-tuning-precedent.md). 20 Minutes Till Dawn offers five choices per level, four at Darkness 9 and above (same record). Nuclear Throne: "Mutations are extra abilities that are given to you at the end of a level if you have leveled up. To level up, you need to get 60 Rads multiplied by your current level number... you can choose between 4 randomly-rolled mutations per level up." Source: <https://nuclear-throne.fandom.com/wiki/Mutations>. Hades pays boons as room rewards, and "Equipping a keepsake given by one of the gods... ensures that the next time a boon is offered, it will be from that specific god." Source: <https://hades.fandom.com/wiki/Boons>.

Nuclear Throne is the clean precedent for a kill-priced counter whose reward is paid at a beat: the rads are kill income, the bar is a threshold, and the mutation waits for the level to end. No shipped survivors-like moves the choice into the fight.

---

## Model 2: field items, taken or skipped

Power arrives as a pickup on the field. The player's choice is whether to take it and, in the cycling variants, when.

### Touhou (DOCUMENTED, wiki transcription of shipped behaviour)

The cadence and the 32-entry cycle are in shmup-stage-design.md. The throttle at the top: "When the player reaches MAX power, all bullets on the screen cancel out and become star items," and "once maximum shot power has been reached, each additional power item collected will be worth more than the previous one collected, up to a maximum of 51,200 points per power item." Large power items count as eight. Losing power drops the value back to 10. The bulk-take is diegetic: "The auto-item-collect line is the same height as the height where point items reach their maximum value," so moving to the top of the screen collects everything and pays the most, and the bomb "automatically collect[s] every item on screen." Source: <https://en.touhouwiki.net/wiki/Embodiment_of_Scarlet_Devil/Gameplay>.

Kill-rate scaling: fixed by authoring, one item per third kill; more kills means more items until MAX, then score. The cap plus conversion is the throttle.

### Truxton / Tatsujin (DOCUMENTED, wiki transcription; COMMUNITY-MEASURED for the formulas)

"Collect 5 of these icons to power up weapon level. Receive 5000 pts if already at max weapon power." A large power-up "Instantly powers up weapon to the next level. Appears in place of small powerups when enough are collected." Weapon change items are fixed colours (red, blue, green), 5,000 points if already equipped. "The item dropped by each successive item carrier cycles according to the table below. A death will reset the cycle to the beginning." The table has 60 entries. Bullet speed is `24 + rank/2 + difficulty/2 + power × 2 + loop × 2`, maximum 80. Source: <https://shmups.wiki/library/Truxton>.

Two things to carry. The item cycle is per carrier, so the player's kill rate cannot change what arrives, only whether it is released. And power is written straight into enemy bullet speed at `power × 2`: the coupling of power to difficulty is a literal term in the formula.

### Twin Cobra / Kyuukyoku Tiger (DOCUMENTED, wiki transcription and Wikipedia)

"Weapon Pickup: Switches the weapon the player is using based on the color. Awards 2000pts on collection if the color is the same as the shot already used, 100pts otherwise. Power Up: Increases the player's weapon power level by 1. Once the player is fully powered up, the item is replaced by the Weapon Pickup." Source: <https://shmups.wiki/library/Kyuukyoku_Tiger>. The icon is "color-changing... ranging from red, blue, green and yellow" (<https://en.wikipedia.org/wiki/Twin_Cobra>); it cycles on its own timer as it floats, and shooting it does not change it (checked against the Genesis manual and the Toaplan wiki via Exa, COMMUNITY-MEASURED for the timer detail). Uemura, on the yellow four-way arriving right after the useful blue, says it was not deliberate (shmup-stage-design.md).

This is the one shipped field item that is simultaneously an offer of four (over time) and a reward for not changing (2,000 versus 100). The choice is made by timing the take, under fire, with the icon drifting.

### Raiden (DOCUMENTED, wiki transcription)

Red powers the Vulcan, blue the Laser, and the icon alternates on its own; a "Fairy... Releases several power ups once the player dies"; a "P" item "Instantly maxes out the main weapon and missiles"; surplus power-ups and missiles pay 5,000, a surplus P 10,000. Boss HP is set by the weapon equipped when the boss music starts. Source: <https://shmups.wiki/library/Raiden>. The Fairy is a shipped answer to the death spiral, and the boss-HP rule is a second coupling of power to difficulty, per boss.

### Fire Shark / Same! Same! Same! (DOCUMENTED, wiki transcription)

"Only four items may exist on screen at any one time. If there are already four items on screen and an enemy that carries another item is destroyed, that item will not appear." Items expire: power, speed and bomb after 512 frames (8.89 s), the blue and green weapon icons after 1,408 frames (24.44 s). Carriers draw from a hidden 71-entry table that resets on death, and 75 carriers across ten stages means "every loop of the game will begin four items ahead of the previous one." Source: <https://shmups.wiki/library/Same!_Same!_Same!>. The on-screen cap is a hard throttle that discards, and the wiki calls recovering from a death "very complicated" because the reset moves every later item.

### Mushihimesama and 1943 (COMMUNITY-MEASURED and DOCUMENTED)

Mushihimesama: "When a power up item is released it will have a small timer beside it, when the timer expires it changes to the next power up type. It will always start on the type selected at the beginning of the game." The same is true of Option items. Source: <https://www.world-of-arcades.net/Cave/Mushihimesama/System.htm>. 1943: shooting the POW icon cycles it through weapons, and cycling far enough turns it into an energy tank (checked via Exa against StrategyWiki and the Wikipedia entry, COMMUNITY-MEASURED). So the two shipped ways to cycle a single field item are a visible timer (Cave) and the player's own shots (Capcom); Toaplan and Seibu use a hidden timer.

### DoDonPachi and Garegga

Both are in the siblings: four power-ups to full power, Max Power only after the last life is lost, per-carrier authoring; Garegga's 30 stage-1 tanks and its rank price per pickup. What this record adds is the reading: Garegga is the extreme case of a field-item game where taking power is itself the difficulty knob, and the community's "rank suicide" (dying on purpose to shed rank) is the player's answer to a coupling with no other release valve.

### What this model does with kill rate, choice, and failure

Kill-rate scaling: authored per carrier, so a better player gets exactly the authored count, faster; at the cap the item converts to score (Touhou, Truxton, Raiden, Twin Cobra) or is discarded (Fire Shark's four-on-screen limit). Power is not linear in kills past the first stage because the ceiling arrives in the first stage (progression-tuning-precedent.md).

On-field choice: yes, in two forms. Refusal, which Twin Cobra rewards. And timing a cycling item, which is choosing among four powers under fire with one body on screen. Iuchi's death-by-item is the documented cost of the second form.

Failure modes: mis-selection under pressure (Iuchi, DOCUMENTED); the rank cost of taking power (Garegga, sibling); the reset of the item table on death making recovery routes shift stages later (Fire Shark, DOCUMENTED); power loss on death (Gradius Syndrome, the community term, COMMUNITY-MEASURED: "the mismatch between the condition in which the player respawns and the condition the game expects them to be in," <https://www.mothershmupper.com/power-loss-gradius-syndrome-and-the-value-of-a-bad-run/>).

---

## Model 3: bank then buy

Pickups fill a bar, and the player chooses through timing. This model had not been researched before this record.

### Gradius, 1985 (DOCUMENTED, developer interviews and wiki transcription)

The mechanism: "With every red Power Capsule collected, the highlighted power-up on the Power Meter at the bottom of the screen will change. When the power-up that you want is selected, press A to receive it. This will reset the process, and you will need to collect more Power Capsules to 'purchase' additional power-ups. If the last choice is highlighted and another Power Capsule is collected, the choice will wrap around to the start of the Power Meter." The six slots in order are Speed Up (up to 5), Missile, Double, Laser, Option (up to 4), and the ? shield. A blue capsule "Destroys or damages all enemies on-screen when collected. Appears after every 15 Red Capsules." Source: <https://shmups.wiki/library/Gradius>. So a Laser costs four capsules held without spending, an Option five, and the wrap means a sixth capsule while holding five throws the bank back to slot one. A per-stage capsule count for stage 1 could not be found (Open items).

Why it exists, in the director's words. Machiguchi, 1999: "Another thing we struggled with was the power-up gauge. This was the most difficult. We also tried out a system where you pick up individual items, like a 'speed up item' and 'missile item', but it somehow wasn't very satisfying. We wanted to give the players freedom in their choices. Not just the choice of whether to pick up an item or not pick it up, but something more detailed. So we figured we'd have players pick up power-ups that they could store, but we really struggled with how they would be used and what kind of selection system there would be. We got a flash of inspiration from the way the function keys on personal computers of that time were laid out." And 1996: "The capsule powerup system was at first an item power-up system. It probably makes more sense if I call it the 'Salamander' system. But we wanted players to be able to choose how to power up their ship, so we left it as you see it today." The choice cost a button: "At that time there were almost no 3 button control panels. So we also made a 2 button version of Gradius, but as we expected, it wasn't very fun. In the end, after thinking about the players' responses from the location test, we decided on the 3-button setup." Source: <https://shmuplations.com/gradius/>.

Konami's Nagata Akihiko, in the same collection, on where the idea came from: "Western computer RPGs were coming into Japan, and 'building your character' was a kind of new gaming buzzword. We were thinking of ways to bring that concept into the STG genre." Same source.

The rank formula prices the bank: `rank = ((survival frames / 1000) + (stages completed × 3) + power + (number of options × 2) + difficulty variable) / 2`, capped at 15, where "Missiles add 2... Lasers add 4... Shields add 4" to power. Source: <https://shmups.wiki/library/Gradius> (COMMUNITY-MEASURED, disassembly transcription). Nemesis, the Western version, adds a recovery: "Losing a life and respawning spawns in a large group of orange enemies to give the player a chance to recover." Same source (DOCUMENTED, version difference).

### Gradius II, Salamander, Life Force, Gradius V (DOCUMENTED)

Gradius II, 1988: "At first we only had one selection for power-ups... Eventually we settled on the current scheme of 4 separate power-up selections. The goal for our staff was to make each option about the same power." And the stage-1 principle: "The point of that stage is to give the player a chance to power up. But if you just give the player a bunch of power-ups, it will be boring, so we wanted something where skilled players could get powerups easily, and where the more you tried to power up the more dangerous the enemy attacks would become." Source: <https://shmuplations.com/gradiusii/>.

Salamander, 1986: "Instead of capsules, enemies drop modules that activate automatically. Excess modules can be picked up for 2k each." Life Force (JP, 1987) reverted: "Power-up system was changed to a Gradius-style meter. 1P meter uses a arrangement of Speed > Missile > Pulse > Laser > Multiple > Shield; 2P meter is arranged as Missile > Laser > Multiple > Pulse > Speed > Shield. Taking power-ups no longer grants a score bonus." Source: <https://shmups.wiki/library/Salamander>. So Konami shipped the direct-pickup model and the bank model side by side in the same series, and the bar order is per player, which is a shipped example of the bar's order being a tuning knob.

Gradius V, 2004 (Treasure): "Gradius V marks the first time in the series in which players can reappear immediately and resume the game from where they lose a life ever since Salamander series," with a "Select Weapon Array" and "Weapon Edit" before the run. Source: <https://en.wikipedia.org/wiki/Gradius_V>. The dead ship's Options are left on screen for the new ship to recollect (checked via Exa against Giant Bomb and the Gradius wiki, COMMUNITY-MEASURED). The team that built it is the team whose director said items killed him; the fix they shipped for the meter's spiral was recovery, not removal.

### What this model does with kill rate, choice, and failure

Kill-rate scaling: capsules are per carrier, so kill rate sets how fast the bank fills, and the price per slot is fixed. More capsules than the player can spend well produces the wrap, so the model has an overshoot rather than a cap. Excess is not converted to score in Gradius; it is a mis-buy.

On-field choice: yes, by definition, and it is the only arcade model where the choice is among six powers with the game running. The cost is one extra button and the overshoot.

Survivors-likes: no shipped survivors-like with a Gradius-style bar was found. Brotato's bank (materials to gold to shop) is spent in a paused menu between waves, not by timing.

Failure modes: Iuchi's overshoot, "you accidentally take one power up too many and select Shield" (DOCUMENTED); the spiral on death, with Nemesis's recovery wave, Gradius V's recollectable Options and Raiden's Fairy as shipped fixes (DOCUMENTED); the rank price of the bank (COMMUNITY-MEASURED).

---

## Model 4: beat rewards

Power arrives at authored moments only.

ZeroRanger (one weapon per boss), Slay the Spire (boss rewards all rare), and Hades (raised rarity after mini-boss rooms) are in progression-tuning-precedent.md. Downwell: "Upgrades can be chosen at the end of every level. There are 20 upgrades in Downwell. You can choose 1 upgrade per level. A choice of 3 random upgrades is offered by default." Source: <https://downwell.fandom.com/wiki/List_of_Upgrades>. Nuclear Throne's mutation at level end and Brotato's wave-end upgrade (Model 1) are threshold games paid at a beat. Steredenn offers five upgrades after each boss on a paused selection screen, one taken (checked via Exa against three reviews, COMMUNITY-MEASURED).

### Risk of Rain and Risk of Rain 2 (DOCUMENTED, developer interview; COMMUNITY-MEASURED, wiki)

Hopoo's feature-list term is "Time = difficulty": "The longer you play, the harder the game gets." Alex Wiltshire's account: "Without time = difficulty, its levels would be endless sources of XP." Drummond: "There are two extremes. One where you run right to the teleport and turn it on and then go right in. That's how I like to play. But a lot of people have success where they clear the entire map and open all the chests." On the road not taken: "They'd also planned at this stage that the speed at which you killed monsters would adapt the scaling. 'But from a design point, it took out your highs and lows, and I think that's what's really interesting about the game: when you feel you've broken it, for a little bit at least. Or if you feel absolutely overwhelmed,' says Drummond. 'If we did the scaling with you correctly, I think it'd make every round feel the same.' 'Monsters would scale to you, so it wouldn't be that rewarding,' adds Morse." And on the shape it produced: "as you gain items, you get sudden boosts in power, lending the game a rhythm of power and weakness as you surge ahead of the monsters, and then find them catching up." Source: <https://www.rockpapershotgun.com/risk-of-rain-difficulty>.

In Risk of Rain 2 the coupling runs through gold: enemy gold is `2 × coefficient × base value × reward multiplier`, and chest cost is `base × coefficient^1.25`, so kill income and item price both scale with the same time-keyed coefficient (checked via Exa against the wiki.gg Difficulty and Directors pages, COMMUNITY-MEASURED; the coefficient formula is in progression-tuning-precedent.md). A player who kills more earns more gold, but the price of the next item rose with the clock, not with their kills.

The Multishop Terminal is the one on-field choice of three found anywhere: "It features a choice out of three Items for you to buy, costing the same as either a Small Chest or a Large Chest, depending on the rarity. After buying one Item the other items are locked and cannot be obtained from this Terminal anymore. A Question Mark indicates that the item in the corresponding slot will be a random item of that rarity." Source: <https://riskofrain2-archive.fandom.com/wiki/Multishop_Terminal>. It is a stationary structure on a map that spawns enemies continuously, the choice is made by walking to one pedestal and paying, and the two unchosen items visibly lock.

Kill-rate scaling: decoupled by construction. RoR pays items from chests and shrines gated by gold and time; ZeroRanger, Downwell and Slay the Spire pay at the beat regardless of kills.

On-field choice: RoR2's Multishop, under fire, one of three, with a price. Everything else in this model is a paused screen or a safe room.

Failure modes: the rush-versus-clear tension is the design, not a failure, and Hopoo balanced it "so that both options are viable." Housemarque's Resogun postmortem records the failure of a shop that broke pacing (shmup-stage-design.md).

---

## Model 5: no items

Ikaruga: "There are no power-ups or items to pick up and there is no rank system." The only resource is the energy bar (shmup-stage-design.md, <https://shmups.wiki/library/Ikaruga>). Radiant Silvergun: no items, and the weapons level by use, gaining experience from the score dealt with them, saved across runs in Saturn mode (checked via Exa against the shmups.wiki entry and HG101, COMMUNITY-MEASURED). Blue Revolver ships no shot-powering items, only ammo, bombs and lives (COMMUNITY-MEASURED). Crimzon Clover does have in-run power steps, from star items at thresholds, so it does not belong here.

Iuchi's reason, in full: "The reason I didn't include items in Radiant Silvergun is simply that when I play STGs, items are very frequently the stupid cause of my death... That's why, this time I wanted to confront that problem head-on, and create a game that progresses simply through shooting and dodging. There's been many previous games where you swap weapons, so adding a button just for switching weapons seemed too boring, and you always have to be keeping track of where your weapon gauge is. I wanted something where the way you used your hands was managed mentally. If the different weapons were all based on finger combinations, you wouldn't need to visually confirm weapons, you'd just automatically know what you were using." Source: <https://shmuplations.com/radiantsilvergun/>. DOCUMENTED.

What it costs: there is no build. Every run of Ikaruga is the same ship, and the whole of the progression is the player. Radiant Silvergun's answer is to grow the weapons by how much they are used, so the build is the play itself, which is the one shipped model where "power arrives from kills" without any pickup at all. Iuchi's "managed mentally" is also the sharpest statement found of what an on-field choice has to be to survive under fire: known without looking.

---

## The four questions, answered directly

**Does one drop per N kills scale?** In every shipped game the counter is linear in kills and the throttle is somewhere else. Vampire Survivors throttles the pickup (400 gems, then one red gem) and never the reward; several levels from one gem means several paused menus in a row, uncapped. Brotato throttles the pickup (50 blobs, the bag), the income (drop chance 100% to 50% by wave), and the delivery (all level-ups at wave end). Nuclear Throne defers to level end. Touhou, Truxton, Raiden and Twin Cobra cap power and convert the surplus to score. Fire Shark caps items on screen and discards. Gradius wraps. No shipped game pays a burst as a single merged reward; the shipped answers are consolidate the pickup, defer the menus, convert the surplus, or discard. For a swath of fifty kills crossing several prices in Hungry Grave's table, the closest precedents are VS's single red gem (one pickup carrying several rewards) and Brotato's bag (excess banked toward later payment).

**Is there precedent for a spinning offer of three on the field, chosen by touching one under fire?** No. What exists: Gradius's bar (six powers, chosen by count and a button, under fire, since 1985); one cycling item chosen by timing (Twin Cobra, Raiden, Mushihimesama, 1943); Risk of Rain 2's Multishop (three items on three pedestals, walk to one and pay, the others lock, enemies live). What was searched and not found: any shmup or survivors-like with several distinct powers visible at once on the field and taken by contact while the run continues. Steredenn pauses; Dead Cells' choose-one altars are in safe rooms; Nova Drift pauses; Hades, Halls of Torment, 20MTD and VS pause; Brotato, Nuclear Throne and Downwell defer to a beat.

**What are the documented failure modes of each model?** Threshold plus choice: useless offers (Banish 2022, Brotato's restricted upgrades), unwanted offers (Reroll and Skip 2022), the menu as an interruption (VS auto-pick 2024, Brotato and Nuclear Throne deferring), resuming into a frozen crowd (VS post-level invulnerability 2022), chained menus from one pickup (community thread). Field items: mis-selection under fire (Iuchi), rank cost per pickup and rank suicide (Garegga), item-table reset on death (Fire Shark), power loss on death (Gradius Syndrome). Bank then buy: the overshoot (Iuchi's Shield), the spiral (Nemesis recovery wave, Gradius V recollectable Options, Raiden's Fairy, DoDonPachi's Max Power as shipped fixes), rank pricing the bank. Beat rewards: a shop that breaks pacing (Resogun cut it); otherwise the tension is the design. No items: no build, and every run the same ship.

**How does each model behave when difficulty reads pressure and power is paid from kills?** Two games coupled a play-read difficulty to kill-paid power and both stepped back. Halls of Torment shipped a kill-driven Agony meter with XP scaled by Agony and, two months later, moved the meter to a clock because of "overly dramatic rubber-banding," keeping only the decay from living monsters as the play-read term. Risk of Rain cut kill-speed scaling before release because "it'd make every round feel the same" and "Monsters would scale to you, so it wouldn't be that rewarding," and keyed difficulty to time while gold and chest price scale with the same clock. The arcade rank games couple on purpose and cap it (Gradius 15, DoDonPachi 63, EoSD 32, Truxton 24), and every one of them lowers rank on death, which is the valve; Gradius II authored its first stage so that reaching for power raised the danger. The shipped pattern is: either couple explicitly through one capped, reversible number, or read difficulty from a clock and let power run free. Hungry Grave's director reads pressure, not kills, which is already closer to the HoT decay term than to the HoT kill term; the thing the precedent warns about is any path by which more drops raise the pressure signal, because that is the loop HoT and Hopoo both cut.

---

## Open items

- No developer statement on why Reroll, Skip or Banish were added to Vampire Survivors was found; the patch notes list them without a reason, and the 2024 and 2025 poncle interviews found do not touch the level-up menu.
- No survivors-like was found with a timing-chosen bank (a Gradius-style bar). The search returned only Konami titles and Steam listings.
- No shipped game was found presenting three distinct powers simultaneously on the field, taken by contact with the run live. The nearest are the Gradius meter, the timed-cycling single item, and Risk of Rain 2's Multishop, all recorded above.
- A per-stage capsule count for Gradius stage 1 could not be found; the wiki says the number depends on which enemies and formations are destroyed.
- The Vampire Survivors gem cap is 400 on the wiki and 1,000 in one player post; the mechanism is not in dispute, the number is.
- Whether Vampire Survivors caps the number of levels paid from one gem is COMMUNITY-MEASURED only (player reports say uncapped); the wiki does not state it either way.
- Halls of Torment's current Agony meter is described on its wiki as one rank per 4m48s plus decay from living monsters and a 20% loss on revive; the per-rank XP scaling per hall (13% to 52.9% base XP per rank) is on the same page, but the decay rate itself is not published.
- Salamander's 1997 developer commentary at shmuplations does not discuss why the direct-pickup system was used; the only developer statement on it is Machiguchi's "Salamander system" remark.
- Hades' boon offer count and pause behaviour rest on the sibling record's sources; the wiki page fetched here confirms the room-reward and keepsake mechanics only.
- No developer statement was found, in either lineage, on how many rewards per minute a run should deliver, which the sibling records also report.
- The designer reports seeing a spinning multi-option pickup in a shmup he was looking at when the offer of three was conceived; the game is unnamed. The absence recorded above is an absence in this search, not proof the shape was never shipped.

---

## What this implies for Hungry Grave

Stated as implications, not decisions. INFERRED throughout. The designer likes the offer of three and wants it to land; the aim here is to check it against industry standard and say what each other model could lend it.

**Option A: ADR 0034's offer of three, kept, with the precedent's guard rails.** Origin: the 2026-08-31 belch-thread tape reading, and Vampire Survivors' level-up choice made diegetic. What industry standard says makes it land: Machiguchi's rationale is the strongest developer statement in this record, and it is in the offer's favour, since take-or-skip "somehow wasn't very satisfying" and the team wanted a choice "more detailed" than that; the Gradius meter proves an on-field choice among several powers has been played under fire for forty years; and the offer of three has structural advantages over both shipped on-field forms, because three bodies visible at once has no overshoot (Gradius's Shield) and no cycle to mis-time (Twin Cobra, Thunder Force). What the precedent says will make it fail: Iuchi's death-by-item is specifically the cost of choosing among options while dodging, and his own fix was "managed mentally... you wouldn't need to visually confirm," so an option the grave cannot read at a glance, or a spin fast enough that the touch lands on the neighbour, reproduces the exact failure he named. The spin is the risk, not the offer. Three shipped fixes transfer directly: VS's post-level invulnerability (the moment after a take is when the crowd the offer distracted from arrives), Twin Cobra's 2,000 points for the same-colour take (a refused or maxed option is never worthless, which ADR 0002's overflow already promises), and the ADR's own fixed first offer, which is Hades' keepsake steer in miniature.

**Option B: borrow the bank from Gradius and Brotato for the burst.** The unsettled question in the current table is what happens when fifty kills cross three prices in one breath. Every shipped answer consolidates the pickup or defers the reward; none spawns three menus at once, and VS, which comes closest by paying every level from one red gem, is the game whose players describe being "imprisoned" in the loop. The borrow is one live offer at a time: kills paid while an offer is on the field bank toward the next offer rather than spawning a second one beside it, which is Brotato's bag and Gradius's stored capsules in the game's own words (the drop never decays, so the bank is the offer waiting to be touched). A second borrow from the same model is the Gradius II stage-1 principle, "the more you tried to power up the more dangerous the enemy attacks would become," which in Hungry Grave's terms is letting the offer sit where the mobs are thickest rather than where the last kill happened.

**Option C: borrow the beat from ZeroRanger, Hades and Risk of Rain 2 for the miniboss and the boss.** The sibling record already notes three precedents for a guaranteed or upgraded offer pinned to a boss. This record adds the one shipped on-field choice of three, the Multishop Terminal, which is a structure the player walks to while enemies spawn, and the lesson that its two unchosen items lock visibly. A feast-scale offer at the miniboss kill (priced at zero on the table, options from the lines the run has been building) is the shape all three games share, and it is the one place in a five-minute stage where the offer can be bigger than three without the spin problem, because the drain-out empties the field.

**On the coupling.** The two games that read difficulty from play while paying power from kills both stepped back within months, and the reason both gave is the same: the loop flattened the highs and lows (Hopoo) or rubber-banded (Chasing Carrots). Hungry Grave's director reads pressure, which is the HoT decay term rather than the HoT kill term, so the shipped precedent does not say the design is wrong; it says to watch the tape for any path by which a drop raises pressure and pressure raises density and density raises kills and kills buy the next drop. The arcade rank games show the other way to live with it: one capped number that death lowers. If the tape ever shows the loop, the shipped fix is to read the director from the clock for the drain-out and the boss (which ADR 0047 already does) and to cap what directed density can add, not to change how drops are priced.

**Recommendation.** Keep ADR 0034 (Option A) and take the burst rule from Option B: one live offer, further paid drops bank toward the next, the bank visible on the offer itself so nothing swallowed reads as wasted. Make the spin slow enough or the bodies distinct enough that Iuchi's test holds, known without looking. Pin one larger offer to the miniboss (Option C) and leave the boss alone, as the siblings already suggest. This rests on Machiguchi's rationale for choice over take-or-skip, Iuchi's naming of what breaks an on-field choice, VS's consolidation of the pickup and its five-month patch history of menu escape hatches, Brotato's bag and wave-end deferral, and the HoT and Hopoo statements on kill-read difficulty. The designer decides.

---

## Sources

Primary (developer statements, patch notes, shipped-behaviour transcriptions):
- Gradius 1996 and 1999 Machiguchi interviews, Nagata Akihiko excerpt: <https://shmuplations.com/gradius/>
- Gradius II 1988 developer interview: <https://shmuplations.com/gradiusii/>
- Radiant Silvergun Iuchi interview: <https://shmuplations.com/radiantsilvergun/>
- Halls of Torment patch notes via the Steam news API (app 2218750): 2023-07-31 <https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/5124584686261074502>, 2023-08-31 <https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/5141476355657088929>, 2023-10-30 <https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/5229301621590571094>, 2023-11-24 <https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/5382426458980229481>
- Hopoo Games on time = difficulty (Drummond and Morse, interviewed by Alex Wiltshire): <https://www.rockpapershotgun.com/risk-of-rain-difficulty>
- Vampire Survivors patch 0.2.12: <https://vampire.survivors.wiki/w/Updates/Patch_0.2.12_-_small_update>
- Gradius V: <https://en.wikipedia.org/wiki/Gradius_V>; Twin Cobra: <https://en.wikipedia.org/wiki/Twin_Cobra>

Community wikis (shipped-behaviour transcriptions and disassembly):
- <https://vampire.survivors.wiki/w/Experience_Gem>, <https://vampire.survivors.wiki/w/Level_up>, <https://vampire.survivors.wiki/w/Reroll>, <https://vampire.survivors.wiki/w/Skip>, <https://vampire.survivors.wiki/w/Banish>, <https://vampire.survivors.wiki/w/Brave_Story>
- <https://brotato.wiki.spellsandguns.com/Materials>, <https://brotato.wiki.spellsandguns.com/Experience>, <https://brotato.wiki.spellsandguns.com/Upgrades>
- <https://hot.fandom.com/wiki/Agony>
- <https://nuclear-throne.fandom.com/wiki/Mutations>, <https://downwell.fandom.com/wiki/List_of_Upgrades>, <https://hades.fandom.com/wiki/Boons>
- <https://riskofrain2-archive.fandom.com/wiki/Multishop_Terminal>
- <https://shmups.wiki/library/Gradius>, <https://shmups.wiki/library/Salamander>, <https://shmups.wiki/library/Kyuukyoku_Tiger>, <https://shmups.wiki/library/Truxton>, <https://shmups.wiki/library/Raiden>, <https://shmups.wiki/library/Same!_Same!_Same!>, <https://shmups.wiki/library/Ketsui>, <https://shmups.wiki/library/Steredenn>
- <https://www.world-of-arcades.net/Cave/Mushihimesama/System.htm>
- <https://en.touhouwiki.net/wiki/Embodiment_of_Scarlet_Devil/Gameplay>

Community essays and threads:
- Gradius Syndrome: <https://www.mothershmupper.com/power-loss-gradius-syndrome-and-the-value-of-a-bad-run/>
- Vampire Survivors gem cap and chained level-ups: <https://steamcommunity.com/app/1794680/discussions/0/724650931393750279/>, <https://steamcommunity.com/app/1794680/discussions/0/3549427890066531343/>

Checked through Exa's grounded answer against multiple pages, recorded as COMMUNITY-MEASURED: Twin Cobra icon timing (Genesis manual, Toaplan wiki), Raiden icon timing (StrategyWiki, HG101), 1943 POW cycling (StrategyWiki, arcanelore), Gradius V Option recollection (Giant Bomb, Gradius wiki), Steredenn's paused five-option screen (Cubed3, Nintendo Life, PS3Blog), Dead Cells altars (deadcells.wiki.gg Objects), Nova Drift pause (patch notes), Risk of Rain 2 gold and chest scaling (riskofrain2.wiki.gg Difficulty and Directors), Radiant Silvergun weapon experience (shmups.wiki, HG101), Blue Revolver and Crimzon Clover items (Steam and namu.wiki).

Sibling records cited rather than repeated: [survivor-numbers.md](survivor-numbers.md), [progression-tuning-precedent.md](progression-tuning-precedent.md), [shmup-stage-design.md](shmup-stage-design.md).

---

## Reproducing the checks

Halls of Torment patch bodies, filtered to the Agony lines:

```
curl -s 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=2218750&count=300&maxlength=0&format=json' \
  | python3 -c "import json,sys,re,html; d=json.load(sys.stdin)
for n in d['appnews']['newsitems']:
    c=html.unescape(re.sub(r'\[/?[a-z*]+[^\]]*\]','',n['contents']))
    for l in c.split('\n'):
        if 'agony' in l.lower(): print(n['title'][:40],'|',l.strip()[:200])"
```

The Rock Paper Shotgun article body is behind a script-heavy page; `curl -sL -A 'Mozilla/5.0'` and stripping tags returns the full text where the Exa fetch returned only the opening paragraph.
