# The visible ladder: how shipped games show power, power gain, and power loss without a HUD glance

Research for Hungry Grave. Labels: **DOCUMENTED** = from a developer statement, a shipped patch note, a manual, or a wiki transcription of shipped behaviour. **COMMUNITY-MEASURED** = wiki, guide or player-derived. **INFERRED** = my reading across sources.

This document sits beside [readability-value-band.md](readability-value-band.md), [floor-ladder-precedent.md](floor-ladder-precedent.md), [reward-delivery-models.md](reward-delivery-models.md) and [survivor-numbers.md](survivor-numbers.md). Those already hold the Cave hue reservation, Boghog's bright-core-and-dark-outline construction, the APCA and luma numbers, the Gradius Syndrome literature, Sonic's rings and Ghosts 'n Goblins' armour ladder, Machiguchi on wanting "something more detailed" than take-or-refuse, Iuchi on items killing him, DoDonPachi's four power-ups to max, Garegga's rank cost per pickup, and the Vampire Survivors weapon axis tallies. Anything there is cited, never repeated. The new ground here is the **display**: where on the screen a shipped game puts the player's current rung, how it announces a rung gained, how it announces a rung lost, and what the player is actually able to read while dodging.

The strongest sources are Hiroyasu Machiguchi's 1999 account of where the Gradius power-up gauge came from, the Cave Story wiki's verbatim description of a weapon experience bar that falls when the player is hit, the Battle Garegga shmups wiki on a rank the arcade release never showed and a 2016 port added as an optional widget, Chasing Carrots' 2023-09-21 Halls of Torment patch note adding upgrade chevrons to the HUD four months after launch, Boghog's statement that players do not have time to look at their own ship, and Chuck Beaver's own account of why Dead Space put the health meter on Isaac's spine, which turns out not to say what it is usually cited as saying.

The gap: **no shmup or survivors-like developer found in this pass states a rule about how much of a HUD a player can read under fire.** What exists is one designer-authored wiki sentence, one Cave statement about not assuming the player sees what you see, and the shipped constructions themselves.

---

## What is solid

These are the claims I would build on.

1. **The arcade shmup lineage puts the power ladder on the field and never on a bar, with exactly one famous exception, and the exception is a menu rather than a gauge.** DoDonPachi has five shot power levels reached with four items and shows the level nowhere on the HUD: the player reads it off the width of their own shot spread and the thickness of their laser (COMMUNITY-MEASURED, [shmups wiki](https://shmups.wiki/library/DoDonPachi), corroborated by the wiki's own item and HUD tables, which list bomb stock and "MAXIMUM" for bombs and nothing for shot power). Raiden is the same: no gauge, the level read from the width and density of the shot (COMMUNITY-MEASURED, [shmups wiki](http://shmups.wiki/library/Raiden)). Battle Garegga has five normal shot levels plus a secret sixth and shows none of them numerically. Gradius is the exception, and its bar is not a fill meter: it is six labelled slots with one highlight walking rightward, and pressing a button spends it (DOCUMENTED, [StrategyWiki](https://strategywiki.org/wiki/Gradius/Gameplay)).

2. **The Gradius meter's shape came from a computer keyboard, and Machiguchi names it as the hardest problem in the game.** "Another thing we struggled with was the power-up gauge. This was the most difficult... We got a flash of inspiration from the way the function keys on personal computers of that time were laid out. It was their layout and arrangement that gave us the image for the power up gauge. After that we made the power up button." DOCUMENTED, [shmuplations.com/gradius](https://shmuplations.com/gradius/). The meter is a row of function keys, not a thermometer. That distinction matters: a Gradius player does not read a level off it, they read *which purchase is currently affordable*.

3. **Konami shipped both answers to the same game within a year, and then shipped the reversal.** Salamander (1986) removed the selection bar and gave power instantly on pickup. The 1987 Japanese Life Force re-release "was also modified, with the Japanese Life Force using the same power-up gauge as the original Gradius", and the Famicom port used the bar too. DOCUMENTED, [Wikipedia, Salamander](https://en.wikipedia.org/wiki/Salamander_(video_game)), which is transcribing shipped behaviour. Two shipped readings, both by the same studio, neither one abandoned.

4. **Options are the industry standard's best-shipped example of a power ladder that is legible without any HUD, and their legibility is a count, not a state.** Gradius Options orbit the ship in a trailing snake, up to four, and you read your rung by counting orbs (COMMUNITY-MEASURED, [Gradius wiki](https://gradius.miraheze.org/wiki/Option)). Machiguchi: "with the Options, we must have tried out around 20 different movement patterns for them, proceeding by the process of elimination when something didn't work" (DOCUMENTED, shmuplations). Twenty movement iterations on the thing that carries the readout is the cost this shape has already been priced at once.

5. **Losing power is shipped as an object leaving the ship, not as a number going down, and three separate games make the lost power recoverable on the field.** Salamander's Options survive the ship's death: "the options float in space for a brief time before disappearing; the new ship can grab and retain them" (DOCUMENTED, Wikipedia). Gradius V keeps the dead ship's Options on screen for the new one. Battle Garegga's Large Shot Power Up is "Dropped by popcorn enemies based on the Item Drop Order, **or by the Player when losing a life**" (DOCUMENTED, [shmups wiki](https://www.shmups.wiki/library/Battle_Garegga)). The loss event and the recovery path are the same visible object.

6. **Cave Story is the closest shipped analogue to a ladder that falls when the player is hit, and it ships two channels for it at once.** Verbatim: "Unlike most games, the player loses experience if they take damage... All weapons have 3 levels. The experience bar of each weapon is the yellow bar atop the health bar in the top-left corner of the screen. Next to the bar is the current weapon's level... after filling level 3's gauge, added experience allows an extra bar to be filled, showing the word 'MAX' on the bar. This does not level up the weapon, but it acts as a buffer to prevent being reduced to level 2 on the first hit." DOCUMENTED (wiki transcription of shipped behaviour), [Cave Story wiki, Experience](https://cavestory.fandom.com/wiki/Experience). The second channel is the field: the Polar Star and Machine Gun projectiles visibly change size and count between levels (COMMUNITY-MEASURED, [Polar Star](https://cavestory.fandom.com/wiki/Polar_Star), [Machine Gun](https://cavestory.fandom.com/wiki/Machine_Gun)).

7. **The MAX buffer is the single most transferable mechanic found in this pass.** Cave Story's over-full top rung is not a bigger weapon, it is one free hit before the ladder falls. It converts an invisible cliff into a visible cushion, and it is the reason a maxed player is not punished the instant they are touched.

8. **Direct score subtraction on being hit was searched for and not found as a shipped pattern.** What ships instead, everywhere, is a chain or multiplier that visibly collapses: DoDonPachi's hit counter, Battle Garegga's medal chain falling back to a 100 point base, Ikaruga's chain, Resogun's on-screen multiplier resetting on death, Geometry Wars resetting the multiplier on a lost life. COMMUNITY-MEASURED across wikis. The nearest thing to a subtraction is Devil May Cry 3, 4 and 5, where taking damage drops the style rank by two letter grades and the letter is on screen (COMMUNITY-MEASURED, [Stylish Rank](https://devilmaycry.fandom.com/wiki/Stylish_Rank)). Sonic's rings and Ghosts 'n Goblins' armour are in [floor-ladder-precedent.md](floor-ladder-precedent.md).

9. **The survivors-likes put the ladder in a HUD corner and then discovered nobody could read it.** Halls of Torment shipped in May 2023 and on 2023-09-21 added, under a heading literally called UI, "**upgraded abilities are marked with chevrons in the HUD**", in the same patch as "increased sprite contrast of red and blue burning skull monsters" under a heading called Visibility. DOCUMENTED, [patch notes 2023-09-21](https://primagames.com/tips/halls-of-torment-update-2023-09-21-patch-notes). Four months after launch the level of an upgraded ability was not readable from its icon, and the fix was a mark drawn on the icon rather than a number.

10. **Brotato withholds the stat panel during the fight on purpose, and the top community mod exists to put it back.** Stats live in the shop between waves (COMMUNITY-MEASURED, [Brotato wiki, Shop](https://brotato.wiki.spellsandguns.com/Shop)). MoreUI2's own description: "This mods adds an In-Wave UI to display your current Primary Stats as well as Trees. The UI is updated every 0.5 Seconds." DOCUMENTED, [github.com/wvandenhaak/Brotato-MoreUI2](https://github.com/wvandenhaak/Brotato-MoreUI2). A player who wants their build legible mid-wave has to install something.

11. **Vampire Survivors' real ladder readout is the field, and the HUD icons are a reference, not a reading.** The inventory is six weapon slots and six passive slots with small level pips on each icon (COMMUNITY-MEASURED, guides; no wiki page dedicated to the HUD was found). What the player actually reads is the screen filling with their own effects, and the developer designed for exactly that feedback: Galante, on Bayonetta and Devil May Cry, "games that are actually rather complex and that ask a lot of effort from the players to get some strong feedback. Instead, I just made it very easy for the player to actually get the same kind of strong feedback." DOCUMENTED, [The Verge, 2022-02-19](https://www.theverge.com/2022/2/19/22941145/vampire-survivors-early-access-steam-pc-mac-luca-galante).

12. **The one designer-authored statement in this pass about what a player can read under fire says they cannot even look at their own ship.** Boghog: "During gameplay, players won't have the time to look at their ships, instead focusing on enemies, their patterns and places they are moving to. **They will roughly estimate the ship's position based on the stream of bullets they shoot out**, the general silhouette of the ship & additional visual elements (like HUD elements, flashing colours) near the ship." DOCUMENTED, [Boghog's bullet hell shmup 101](https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101). If the player is reading their own ship through their own bullets, the storm is already the highest-bandwidth readout on the screen.

13. **Battle Garegga is the shipped negative case: a ladder the game deliberately never showed, and a 2016 port that finally showed it as an optional widget.** "Although rank is hidden from the player in the arcade release, in the Battle Garegga Rev.2016 port rank may be displayed in a widget on the side of the screen. The rank is displayed on a graph as a percentage ranging from 0.0% to 100.0% that updates in real time during gameplay." DOCUMENTED, [shmups wiki](https://www.shmups.wiki/library/Battle_Garegga). Twenty years of players inferring a hidden ladder from enemy behaviour, then a port that draws it, off the play area, as a gadget the player opts into.

14. **The widely repeated rationale for Dead Space's diegetic HUD is not what its producer said.** Chuck Beaver's own account: "Glen was fired up about putting something cool and spine-like along Isaac's neck up the back of his skull that would somehow show his health. I beat him to the punch and said how about using his actual spine as the location of a spine-like thing, and run the health meter vertically along it... The RIG was born, and so was the idea of in-game HUD." His stated motive is science fiction flavour and holograms, not glance cost: "I'm a huge sci-fi geek... I like my worlds to be composed of force fields and holographic interfaces." DOCUMENTED, [Ars Technica, 2008-05](https://arstechnica.com/gaming/2008/05/guest-writer-dead-space-producer-chuck-beaver-on-story-ui/). The construction is a real precedent; "they did it so the player never looks away" is not sourced to the team.

---

## 1. Power shown on the field itself

### Gradius Options (DOCUMENTED and COMMUNITY-MEASURED)

An Option is a pulsating orb that trails the Vic Viper in a snake formation, mirrors its movement path, and fires whatever the ship fires. Up to four attach, fewer on constrained hardware. Sources: [Gradius wiki, Option](https://gradius.miraheze.org/wiki/Option), [shmups wiki, Gradius](https://shmups.wiki/library/Gradius).

Three properties make it legible without any HUD, and it is worth separating them because they are separable in a redesign.

The rung is a **count**, not a state. Four orbs is four, and counting is preattentive up to about four items. There is no colour, size or brightness to decode.

The rung is drawn **inside the player's existing gaze**, because the Options trail the ship the player is already tracking, and their motion is derived from the player's own recent path, so they cost nothing extra to follow.

The **loss is an event**, not a smaller number. On death the orbs are gone and the trail is empty, which is a shape change rather than a value change.

Two shipped mitigations of that loss exist, and both keep the loss visible instead of hiding it. Gradius V leaves the dead ship's Options on screen for the new ship to recollect. And the Option Hunter, a dedicated enemy that steals an active Option ([Gradius wiki](https://gradius.miraheze.org/wiki/Option_Hunter)), makes the loss channel do double duty as a threat: an enemy whose whole design is to reach into your readout and take a rung out of it.

Machiguchi's twenty movement patterns are the cost note. Whatever else Options are, the thing that made them work was iterated on more than any other element he names.

### Salamander and Life Force (DOCUMENTED)

Salamander removes the selection bar. "The player gains power-ups by picking up capsules left behind by certain enemies, as opposed to the selection bar used in other Gradius games." The result is that **the entire ladder is on the ship**: there is no other place to read it.

Its loss handling is the cleanest shipped version of a recoverable rung. "The only power-up that can survive the ship's destruction is the options... Upon the ship's destruction, the options float in space for a brief time before disappearing; the new ship can grab and retain them." Source: [Wikipedia, Salamander](https://en.wikipedia.org/wiki/Salamander_(video_game)).

Then Konami put the bar back. The 1987 Japanese Life Force re-release "using the same power-up gauge as the original Gradius", with the gauge "arranged differently for both players"; the Famicom port likewise uses the Gradius-style bar "in place of the original instant pick-up system". Same game, same studio, both displays shipped, neither retired.

### Battle Garegga (DOCUMENTED, wiki transcription)

Options orbit the ship and fire with it; the player cycles five preset formations with the C button, and specific formations are unlocked by *missing* certain items before collecting an option item ([shmups wiki](https://www.shmups.wiki/library/Battle_Garegga)).

The main shot has **five normal power levels plus a secret "special" level**, and the price rises steeply along the ladder: one small shot icon to go from level 1 to level 2, up to eight small icons for the top step. Nothing on screen states the level. The player reads it from the shot.

Rank is the game's other ladder and it is the negative case in item 13 above. Everything the player does moves it, including their own power: "Shots: rank increases by a set value for every shot fired, the value determined by the player's ship, shot level, and number of options" and "Items: rank increases every time an item is collected". Losing a life lowers rank, and lowers it more the fewer lives are in stock. So Garegga has a fully coupled power-and-difficulty ladder, and shows the player neither end of it.

The pickup-priced version of that coupling is in [reward-delivery-models.md](reward-delivery-models.md). What is new here is the display verdict: the arcade release showed nothing, and the 2016 port's answer was a real-time percentage graph in a side widget, off the play area, opt-in.

### What made these legible

INFERRED, but consistently supported by all four games above. The legible ones share three properties and the illegible one shares none of them.

The rung is a **discrete count of objects** rather than a position on a continuum. Four Options, three Options, two.

The objects **live inside the gaze the player already holds**, either attached to the avatar or derived from its motion.

The **loss is a departure**, a thing that leaves, rather than a decrement.

Garegga's rank has none of these: it is a continuous scalar with no object, no location, and no event. It is the one ladder in this set that players spent two decades reverse-engineering instead of reading.

---

## 2. Power shown as a bar or meter

### The Gradius power-up gauge (DOCUMENTED)

Six labelled selections along the bottom of the screen: Speed Up, Missile, Double, Laser, Option, ?. Each capsule collected moves one highlight rightward; at "?" it wraps back to Speed Up. The player presses a dedicated third button to spend the highlight. Source: [StrategyWiki, Gradius/Gameplay](https://strategywiki.org/wiki/Gradius/Gameplay).

Machiguchi's origin story, quoted in full in item 2, is that the layout came from the function key row on a personal computer. Read that as a design classification: **this is a toolbar, not a gauge.** It reports what is purchasable and where the cursor sits. It does not report how strong you currently are, which is why Gradius still needs the Options on the ship to carry that.

The three-button control panel it forced was a fight. "At that time there were almost no 3 button control panels. So we also made a 2 button version of Gradius, but as we expected, it wasn't very fun... Various departments at Konami exchanged their opinions about it, but in the end we made it a 3 button game." DOCUMENTED, shmuplations. A meter that has to be spent needs a button, and the button was the expensive part.

### DoDonPachi (COMMUNITY-MEASURED)

Five shot power levels, four power-up items to reach the top. On death "the player's strengthened weapon" drops one level and "the non-strengthened weapon reverts back to level 1", and the rule differs again in the second loop. Source: [shmups wiki, DoDonPachi](https://shmups.wiki/library/DoDonPachi).

There is no power gauge and no power number. The wiki's HUD-adjacent material lists bomb stock, the hit chain counter, and a "MAXIMUM" readout for bombs, and nothing for shot power. The level is read from the shot: spread width for Shot type, beam and aura for Laser type, and the wiki's own ship table describes ships by "Shot width" as the distinguishing visible property.

One item in the table is worth pulling out for the floor-ladder question. **Max Power: "Grants max power, only appears after the player loses their last life."** Cave's own reading of the bottom of the ladder is that a player who has fallen all the way down needs the whole thing handed back at once, and they gate the item on that exact state rather than on a difficulty setting.

### Raiden (COMMUNITY-MEASURED)

Death resets weapon power to the minimum. There is no on-screen gauge; players "determine their strength by observing the width, density, and behavior of their shots". The recovery is a hidden object: the Fairy, once collected, "releases several power ups once the player dies". Sources: [shmups wiki, Raiden](http://shmups.wiki/library/Raiden), [Raiden wiki](https://raiden.fandom.com/wiki/Raiden).

Same three-part shape as Salamander and Gradius V: the loss is total, it is instantly visible because the shot narrows, and the game ships a designed way to get it back that is itself an object on the field.

### R-Type's Force (COMMUNITY-MEASURED)

The Force is a glowing pod that attaches to the front or the rear of the ship, is indestructible, absorbs or blocks most enemy fire, deals contact damage, and can be detached and flown separately. If the ship is destroyed the Force is lost along with everything else and the player restarts at a checkpoint. Sources: [R-Type wiki, Force](https://rtype.fandom.com/wiki/Force), [StrategyWiki](https://strategywiki.org/wiki/R-Type/Gameplay), [shmups wiki, R-Type](http://shmups.wiki/library/R-Type).

The Force is the most extreme version of the field-as-readout idea in this document. It is simultaneously the power readout, a shield, a melee weapon and a positioning decision, and it is the largest single object attached to the player. There is nothing to glance at because the thing is the size of the ship.

### The pattern across sections 1 and 2

INFERRED. **A bar in this lineage exists to be spent, and a field object exists to be read.** Gradius has both and they do different jobs. Cave, Seibu and Raizing shipped no bar at all and put the entire ladder into the shot sprite. The one game in this document whose bar genuinely reports a current rung is Cave Story, and it puts that bar in physical contact with the health bar the player is already watching.

---

## 3. Survivors-like HUDs

### Vampire Survivors (COMMUNITY-MEASURED)

Six weapon slots and six passive slots, in two rows, in a screen corner, each icon carrying small level pips. Health bar and run timer alongside. The weapon axis data behind those levels is in [survivor-numbers.md](survivor-numbers.md).

The honest reading is that the icons are a reference the player consults between threats, and the readout they actually use is the field. A player at minute 18 does not count pips; they see the screen covered. Galante's own account of designing for exactly that feedback is in item 11. The Verge's contemporaneous description is a useful outside witness: "as you level up, get more weapons, and fight more monsters, your screen quickly becomes filled with a smorgasbord of magical weapons and fearsome enemies covering nearly every inch of the screen... Despite this apparent chaos, I promise you I felt fully in control."

Caveat, and it is the weakest sourcing in this document: no wiki page dedicated to the in-run HUD was found, and the pip description comes from third-party guides rather than from poncle or the community wiki. Treat the six-and-six slot layout as solid and the exact form of the level marker as approximate.

### Brotato (COMMUNITY-MEASURED and DOCUMENTED)

The wave is a fight and the shop is where the numbers live. Stats are documented as shop-side, the wave UI carries almost nothing, and the mod that adds in-wave primary stats is popular enough to sit on the Steam Workshop with a maintained fork history. Sources in item 10.

Two of the mod's own options are the interesting part, because they describe what a player actually wants mid-fight and it is not the stat sheet: "Enable 'What's new Mode' to only show Stats that received an Update in the current wave" and "Enable 'Show Stat difference from Wave-Start'". **The demand is for the delta, not the value.** Nobody is asking to read their armour number; they are asking what changed.

### Halls of Torment (DOCUMENTED and COMMUNITY-MEASURED)

The in-run HUD carries health against max, character level, an experience bar, active ability icons, active power-ups, gold, kill count and the timer. The full character sheet and damage statistics live behind the pause menu. Sources: [IGN beginner's guide](https://www.ign.com/wikis/halls-of-torment/Beginner's_Guide), [patch notes 2023-06-09](https://updatecrazy.com/halls-of-torment-update-patch-notes-june-9-2023/).

The 2023-09-21 patch is the finding, quoted verbatim in item 9. Chevrons on the icon, not a number beside it. The same patch refactored the character sheet, which is the paused view, and separately raised sprite contrast on two enemy types under a Visibility heading. Three months of shipped play told them the icon needed a mark.

### Where each put the information, and how much is readable mid-fight

INFERRED, from the three games above.

| game | ladder shown as | where | readable while dodging |
| --- | --- | --- | --- |
| Vampire Survivors | pips on 12 corner icons, plus the storm itself | corner, and the whole field | the storm yes, the pips no |
| Brotato | nothing during the wave | shop, between waves | nothing, by design |
| Halls of Torment | chevrons on ability icons, plus the storm | HUD bar, and the whole field | the chevrons at a glance, the sheet only on pause |

None of the three puts a number on the field. Two of the three carry a per-item mark on an icon and neither uses a digit. All three lean on the same unstated readout: the player's own effects filling the screen.

---

## 4. Power loss and damage feedback

### Cave Story, the headline case (DOCUMENTED)

The full mechanic is quoted in item 6. What matters for a design decision here is its shape, and it has five parts.

The ladder is **short**: three levels, so a rung is a large fraction of the whole.

The readout is **adjacent to the health bar**, not somewhere else on the screen. The player is already looking at that corner for the thing that kills them.

The loss is **continuous below the rung boundary and discrete at it**: a hit drains experience, and only a hit that drains past zero costs a level. So a hit always announces on the bar even when it does not cost a rung.

The top of the ladder has a **buffer**, the MAX overfill, worth one hit.

The **field changes too**: the projectile sprite differs by level, so the rung is legible from the bullets as well as from the bar.

And there is a purchasable mitigation, the Arms Barrier, which halves experience lost on damage. The game sells reduced ladder-fragility as an upgrade in its own right.

### Score subtraction on being hit

Searched for and not found as an industry-standard shipped pattern. The nearest shipped analogues, all COMMUNITY-MEASURED from wikis, are visible collapses of a multiplier or chain rather than subtraction from a total:

- DoDonPachi's hit chain counter breaks and resets, and it is a large number in the HUD.
- Battle Garegga's medal chain drops back to a 100 point base when a medal is missed.
- Ikaruga's chain resets when the required triples are broken or the player dies.
- Resogun displays the multiplier at the top of the screen and resets it on death.
- Geometry Wars: Retro Evolved resets the multiplier on a lost life.

The one shipped case that reads as a rank falling rather than a chain breaking is the Devil May Cry style meter, where taking damage drops the on-screen letter grade by two ranks in DMC3, 4 and 5, and did not affect rank at all in the original. Kevin Wong's analysis of what style meters do to play, at [gamedeveloper.com](https://www.gamedeveloper.com/design/style-meters-and-play-aesthetics-in-death-of-a-wish), is ANALYSIS rather than developer statement and is cited only for the framing that a style meter adds a second success metric alongside survival.

### A levelled weapon visibly stripping down

Three shipped shapes, none of them an explosion.

**The object leaves.** Gradius Options vanish on death; Salamander's float free and can be reclaimed; R-Type's Force is gone with the ship. Section 1.

**The shot narrows.** DoDonPachi drops the strengthened weapon one level and the other to level 1, Raiden resets to minimum, and in both the announcement is that the player's own fire visibly thins on the next trigger pull. Section 2.

**The bar falls and the sprite changes with it.** Cave Story, above.

**The lost rung becomes an item on the field.** Battle Garegga's player-dropped Large Shot Power Up, item 5. This is the only case found where the thing taken away is immediately re-presented as a thing to go and get.

What designers said about how that felt: the shipped record is thin and mostly negative. The whole Gradius Syndrome literature, which is the community's verdict on power loss done badly, is already in [floor-ladder-precedent.md](floor-ladder-precedent.md), and its finding stands unchanged here: the complaint is never that power was visibly lost, it is that the content after the loss still expected the power. Konami's own fixes are display-and-recovery fixes, not removals: the recovery enemies in Nemesis, the reclaimable Options in Gradius V, Raiden's Fairy, DoDonPachi's last-life Max Power.

---

## 5. What designers said about HUD legibility under fire

This is the thinnest section in the document and the label discipline matters most here.

**Boghog, designer of Gunvein, is the only source found who states the constraint directly.** Quoted in full in item 12: players do not have time to look at their own ship, and they estimate its position from their own bullet stream, the silhouette, and visual elements *near* the ship. DOCUMENTED, [shmups wiki](https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101). Note the last clause: HUD elements are useful to him when they sit next to the ship, not when they sit at the screen edge.

**Tsuneki Ikeda (Cave, DonPachi through Espgaluda) states the general principle without applying it to a HUD.** "It was then, working on V-V at Toaplan, that I learned you couldn't just assume that the player was going to see things in the same way as you, the creator, did." DOCUMENTED, [shmuplations.com/ikeda](https://shmuplations.com/ikeda/). The rest of that interview is about the pleasure of dodging, not about readouts.

**Cave's shipped readability rules are about hue, background and item colour, and are already recorded.** Tanaka on not using bullet colours in backgrounds, Wakabayashi on bullets, explosions and medals each getting their own colours, Kimura's "bullets you can see from 100 metres away": all in [readability-value-band.md](readability-value-band.md) with sources. **None of them is about the HUD.** Cave's own statements treat the play field as the thing that must be readable and never discuss the status bar.

**Treasure: nothing found.** Iuchi's on-record readability levers are bullet speed and removing things the eye must check, and his one statement about interface load is the items quote in [reward-delivery-models.md](reward-delivery-models.md), which is about choosing under fire rather than reading under fire.

**Michael Booth: nothing found on HUD glance cost.** His GDC 2009 decks and the shipped Left 4 Dead commentary, both catalogued in [director-precedent.md](director-precedent.md), are about pacing, intensity estimation and replayability. Searched and not found.

**The Dead Space precedent is real and its usual justification is not.** Item 14. The construction, health drawn vertically on the character's spine and ammunition on his forearm, is a genuine shipped example of a status readout placed inside the gaze the player already holds. Chuck Beaver's account of why is science fiction consistency: everything Isaac needs "better have a holographic interface or live a lonely untouched life". If this project cites Dead Space, cite it for the construction and not for a glance-cost rationale nobody at Visceral is on record giving.

---

## What this implies

INFERRED throughout this section.

**The field is the primary channel and the HUD is the secondary one, in every game examined, including the ones with a HUD.** Halls of Torment's chevrons were added to an icon the player already had; they did not replace the storm. Vampire Survivors' pips are a reference. Brotato refuses the question during the wave. The arcade lineage never had the option. Nothing in this pass supports building the ladder primarily as a HUD readout, and Hungry Grave's own VISION line, that the storm is the reward for swallowing, points the same way.

**A rung is best expressed as a count of objects, and the count wants to stay small.** Options top out at four. Cave Story has three levels. DoDonPachi has five, and it is the one where players habitually cannot say their level out loud. Hungry Grave's five levels per line, across a growing pool of lines (ADR 0005, ADR 0046), is more state than any of these games asks a player to read at once, which is an argument for showing the *line's* current rung on the line's own projectile and never showing the whole pool simultaneously.

**Loss needs its own event, because a decrement inside a dense storm is invisible.** This is the one place where the field alone demonstrably fails. Cave Story ships two channels for the loss. Gradius ships a shape change. Garegga ships a dropped item. ADR 0040 has already ruled that a hit announces on at least two channels and that one of them is never the shrink, and the same logic applies one rung down: a weapon level lost while the screen is full of the player's own projectiles will not read from the projectiles.

**The rim is already spoken for and adding the ladder to it is a real cost, not a free consolidation.** ADR 0003 makes the grave's rim the health bar and ADR 0040 makes it the second announcement channel for a hit, explicitly protected from the dim so the player can re-read their own size at the tick it changes. Anything else drawn on the rim competes for that at exactly the worst moment.

**Whatever is drawn has to clear the value band.** ADR 0014 binds every colour drawn while the field is live, readouts included, to the field ceiling, with the band above it reserved for mob fire. A ladder readout cannot announce by getting brighter. It has to announce by count, by shape, by position, or by subtraction, which is the same conclusion ADR 0040 reached for the hit.

**A recoverable loss is shipped more often than a permanent one, and the recoverable version is an object.** Salamander, Gradius V, Raiden's Fairy, DoDonPachi's last-life Max Power, Garegga's player-dropped power item. Hungry Grave already turns everything into a thing on the field that the grave passes under, which makes a dropped rung the cheapest possible fit with the existing verb.

**The MAX buffer is available and cheap.** One rung of overfill at the top, spent by the first hit instead of a level, gives the player a visible cushion and gives the top of the ladder a texture it otherwise lacks.

---

## Three HUD shapes for the ladder

Each is tied to named shipped games, and each is described as a moment of play rather than as a feature.

### Shape A: the storm is the meter

**Named precedent.** DoDonPachi and Raiden (the shot sprite is the only readout), Cave Story's projectile changes by level, Vampire Survivors' screen fill, Boghog's statement that players read their own ship through their own bullet stream.

**The moment.** The grave is mid-field with the storm at three lines. The bell's ring is two rings wide because the bell is at level 2, and when the next drop lands the ring comes back one beat later as three rings wide. The player never looked anywhere. A hit lands and takes a bell level; on the next pulse the ring is two rings wide again, and it is the ring that told them.

**What it costs.** Every level of every line needs a distinct, countable projectile state, which is five states per line across a growing pool, and they have to differ by count and size rather than by brightness because the band ceiling binds. The failure mode is the one this document keeps finding: at high density a single rung lost is not legible, which is why nothing in section 4 relies on the field alone for the loss.

### Shape B: the ladder rides the rim

**Named precedent.** Gradius Options (a countable set of objects attached to the avatar, lost visibly), Salamander (the objects float free and can be reclaimed), R-Type's Force (the readout is the largest object the player owns), Dead Space's spine (a status readout drawn on the body the player is already watching).

**The moment.** Small marks sit around the grave's rim, one per line the player owns, each showing that line's rung. The grave dives under a corpse, the rim grows, and the marks grow with it. A hit lands and one mark detaches, tumbles into the field, and drifts down with the scroll: the player can chase it and take the rung back, or let the scroll carry it away. The lost power is an object the game's one verb already knows how to handle.

**What it costs.** ADR 0040 protects the rim as the hit-announcement channel specifically because dimming it would occlude the announcing channel at the tick it changes; loading it with ladder marks is the same kind of competition by a different route. It also needs the rim to stay legible at the size floor, where it is smallest and where the ladder is being stripped fastest, which is the worst combination available.

### Shape C: a slim strip against the field frame

**Named precedent.** Cave Story's yellow experience bar drawn atop the health bar with the level number beside it, and the MAX buffer. Halls of Torment's chevrons on the ability icon. Vampire Survivors' pips. Gradius's six-slot toolbar, as the counter-example of a bar that reports purchasability rather than power.

**The moment.** A narrow column of pips runs down the inside of the field frame, one short row per line, filling as levels land. A drop is swallowed and a pip lights with the same beat as the swallow. A hit takes a level and a pip goes dark, with the row briefly holding the empty slot so the player sees which line paid.

**What it costs.** It is the glance the designer asked to avoid, and the shipped evidence says a corner readout is consulted between threats and not during them. The mitigation is Cave Story's: put it in contact with the readout the player already watches, which in this game is the grave itself and not a screen edge. ADR 0039 has already made the field boundary a readout with its own contrast requirement, so a second readout on the same frame has to be told apart from the first.

---

## The recommendation

**INFERRED.** Build shape A as the ladder and a narrow slice of shape B as the loss, and do not build shape C.

The reason is the split every shipped game in this document makes and none of them states out loud: **gain reads fine from the field and loss does not.** A rung gained arrives on a beat the player caused, at a moment the storm is about to change anyway, and Vampire Survivors, DoDonPachi, Raiden and Cave Story all let the projectile carry it. A rung lost arrives on someone else's beat, in the middle of the densest screen the run has produced, at the exact tick the player is re-reading the field from a new position, and every game that handles it well gives it a second channel: Cave Story's bar falls, Gradius's orb disappears, Garegga's power drops out as an item. Hungry Grave has already ruled the same thing one level up, in ADR 0040, for the hit itself.

Concretely: each line's rung lives in its own projectile, by count and size and never by brightness, so the player reads their whole ladder by looking at the storm they are already looking at. A rung lost ejects the rung as an object from the rim into the field, which announces the loss as a departure rather than a decrement, and hands the recovery to the verb the game is built on. And a top rung carries Cave Story's MAX buffer, so the first hit at the top of a line costs the buffer rather than the level.

What that leaves unresolved, and what no source in this pass settles, is whether the ejected rung should be catchable. Salamander, Gradius V and Raiden all say yes and all of them are recovering from a *death*, not from a hit at the floor. Hungry Grave strips levels on the way to death with the field intact ([floor-ladder-precedent.md](floor-ladder-precedent.md)), so a catchable rung might make the floor ladder toothless, and the scroll deadline might already be the right amount of teeth. That one is a play question rather than a precedent question, and the designer decides.

---

## Open items

Searched for and not found.

- **Any Cave, Treasure or Raizing statement about the status bar or the HUD.** Every readability statement found from those studios is about the play field: bullet colour, background colour, item colour, bullet speed. The absence is consistent across five interviews and is itself a finding, but it is an absence.
- **Any developer statement putting a number on how much a player can read while dodging.** Boghog's designer-authored wiki sentence is the closest thing in the industry-standard record, and it asserts a behaviour rather than a budget.
- **Michael Booth on HUD glanceability.** His decks, the transcribed talk and the shipped commentary all concern pacing and intensity. Nothing on readouts.
- **Eye-tracking or attention research specific to shmup or survivors-like HUDs.** Not searched exhaustively; nothing surfaced incidentally, and no games-industry source cited any.
- **A poncle or Chasing Carrots statement about why the HUD is shaped as it is.** Halls of Torment's chevron change is a patch line with no rationale attached, and no poncle statement on the inventory display was found.
- **A wiki page documenting the Vampire Survivors in-run HUD.** The six-and-six slot layout is corroborated across guides; the exact form of the level marker on the icon rests on third-party guide text only, so treat the pips as approximate.
- **A shipped game that subtracts score directly on being hit.** Multiplier and chain collapses are everywhere; a subtraction from the running total is not, in any of the games searched.
- **A shipped survivors-like that draws weapon levels on the avatar rather than in a corner.** Nova Drift changes the ship's silhouette with the build, but no developer statement was found framing that as a readout, and its detailed build state stays in menus.
- **Any statement from a designer about how losing a visible rung felt to players.** What exists is the community's Gradius Syndrome verdict, already recorded in the floor-ladder brief, and the shipped mitigations, which speak for themselves but say nothing about intent.
