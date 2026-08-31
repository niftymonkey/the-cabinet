# Pricing the panic button: how other games keep a screen clear meaningful

Design research brief. Evidence only, no recommendation.

## What the evidence says about this exact problem shape

The reading from the tape (belch at 35-46% of kills, reservoir full 62-79% of the run) is not a shmup-unusual result. It is the expected result of a specific combination that almost no shipped game actually uses: a clear that costs nothing to hold, costs nothing to fire, and refills from the ordinary act of playing. Every game found in this research breaks at least one of those three legs. Most break two.

The genre's canon splits cleanly into two camps, and the split is not about how strong the clear is. It is about which leg is broken.

The first camp keeps the screen clear as powerful as ours and prices the *firing* of it, usually by taking away the thing the player actually wants (score, chain, multiplier, meter that would otherwise have been a damage spike). Cave, Touhou, and Crimzon Clover live here. In these games a full bomb stock is genuinely valuable to hold, and the whole tension is that spending it hurts a goal you care about.

The second camp attacks the clear itself: it downgrades it from "kill everything" to "clear the bullets and buy me half a second" (Enter the Gungeon), replaces it with a defensive verb the player has to aim and time (Ikaruga), or deletes it and compensates elsewhere (ZeroRanger).

The important negative finding for this game: **holding** is almost never priced directly in any of these games either. What makes holding non-free is that the meter is doing something else valuable while it sits full, or that the full meter is the reward line the player is chasing. Anti-hoarding pressure is almost always constructed, not by punishing the hold, but by making the same resource the source of the power curve. That is the family closest to the grave's shape, and it is section 3.

One more note before the families. The genre has a documented, decades-old opposite failure: players who hoard bombs and die with a full stock, which the community calls a lack of "bomb sense" and one writer calls "the #1 roadblock for people getting into this genre" ([Bomb sense, Dan Boland](https://danboland.net/2021/07/15/bomb-sense.html)). Our tape shows the reverse problem. Anything that raises the price of firing risks handing the game the roadblock instead, so several of these mechanisms come with a documented failure mode attached.

---

## 1. Price the fire by raising the difficulty (rank response)

**The moment of play.** You panic-fire the clear. The screen empties and you exhale. Ten seconds later the next wave comes in visibly faster and thicker than the one before it, and it stays that way. You bought calm now by buying a harder rest-of-run. Nothing on the HUD told you this. You feel it.

**Who does it.** Battle Garegga is the canonical case. Rank is an invisible difficulty value that climbs with almost everything you do, and the shmups wiki's frame-level rank documentation is explicit that firing the special weapon adds a fixed 16,384 rank "regardless of whether a full bomb stock was used" ([Battle Garegga / Advanced Rank](https://shmups.wiki/library/Battle_Garegga/Advanced_Rank)). The only thing that reduces rank is dying, and it reduces it *more* the fewer lives you hold, which is why high-level play involves deliberate suicides ([Hardcore Gaming 101](https://www.hardcoregaming101.net/battle-garegga/), [Shmups Wiki: Battle Garegga](https://shmups.wiki/library/Battle_Garegga)).

**Confidence flag.** Popular writeups (HG101, TV Tropes) repeatedly claim Garegga counts "how many bombs you hoard" into rank. The detailed frame-level rank documentation does not support that: it prices picking bomb items up (items raise rank) and prices *deploying* the bomb, and lists no rank term for simply holding stock. Treat "Garegga punishes hoarding" as community lore. What is documented is that Garegga punishes *bombing*, which is the opposite of what our problem needs, and Blue Revolver deliberately went the other way by making bombing "entirely rank-neutral" to stop score farming ([Shmups Wiki: Blue Revolver](https://shmups.wiki/library/Blue_Revolver)).

**What it would cost this game.** An invisible system the player has to infer. Garegga's rank is widely described as its most opaque feature, something you would not know existed without being told. It also fights the storm directly: if the belch makes the run harder, the storm has to be strong enough to absorb that, and the storm is the thing currently reported as too light.

---

## 2. Price the fire by forfeiting the thing you were chasing (score, chain, multiplier)

**The moment of play.** The wave gets ugly. You look at the number in the corner that you have been growing for two minutes, and you decide whether it is worth more than your life. Firing does not cost you a resource, it costs you the run's story.

**Who does it.** This is the Cave house style. Mushihimesama's counter (the multiplier that drives the whole score) drops hard when you bomb or take a hit, which is why practised players route stages to avoid ever needing to ([Shmups Wiki: Mushihimesama](https://shmups.wiki/library/Mushihimesama), [shmups.system11 Mushihimesama strategy thread](https://shmups.system11.org/viewtopic.php?t=4049)). Touhou makes it sharper and more local: clear a boss spell card without dying and without bombing and you take the Spell Card Bonus; bomb once and that specific bonus is gone, right there, on that attack ([Touhou Wiki: Embodiment of Scarlet Devil gameplay](https://en.touhouwiki.net/wiki/Embodiment_of_Scarlet_Devil/Gameplay), [Subterranean Animism strategy](https://en.touhouwiki.net/wiki/Subterranean_Animism/Strategy)). Blue Revolver resets the chain timer on bomb ([Shmups Wiki: Blue Revolver](https://shmups.wiki/library/Blue_Revolver)).

**What it would cost this game.** It needs a running number the player is emotionally invested in, on screen, that the belch visibly breaks. If the game does not have a chain or multiplier the player is already nursing, this mechanism has nothing to confiscate. Building one is a whole system, not a tuning change, and it prices the belch only for players who care about score.

---

## 3. The same meter is also your power spike (the closest shape to this game)

**The moment of play.** The meter is full. You are holding two different futures in the same hand: press it now and everything on screen dies, or hold it and press the other button and become monstrous for the next eight seconds. You are not choosing between safety and nothing. You are choosing between safety and being strong. Firing to save yourself is felt as *giving up the good part*.

**Who does it.**

*Crimzon Clover* is the single closest published match to the grave's shape and deserves the most attention here. One gauge, filled by shooting and killing (the ordinary act of playing, exactly like swallowing). From that one gauge you can either trigger Break Mode, which raises your damage, lock-on count, movement speed and scoring, and which also cancels every bullet on screen as it activates, or you can spend a slice of the same gauge on a bomb. The bomb is therefore always a direct subtraction from your next power spike. Crucially the game then adds a second lever: **the bomb line moves right every time you bomb**, so each successive bomb costs more meter than the last. Cost is only reset by death or by picking up specific Bomb Recovery items ([Shmups Wiki: Crimzon Clover](https://shmups.wiki/library/Crimzon_Clover), [Hardcore Gaming 101](https://www.hardcoregaming101.net/crimzon-clover/)). Community writeups describe the resulting moment exactly as a split-second decision between an instant screen clear and preserving the use for a more essential moment ([TheSixthAxis review](https://www.thesixthaxis.com/2020/12/01/crimzon-clover-world-explosion-review/)).

*Hollow Knight* is the cleanest non-shmup version, and the clearest to explain. SOUL is filled by hitting things. The same 33 SOUL either heals you or casts an attack spell, so every heal is a spell you did not cast, and the heal also demands you stand completely still and be interruptible while it happens ([Hollow Knight Wiki: Soul](https://hollowknight.wiki.fextralife.com/Soul), [Focus](https://hollowknight.wiki.fextralife.com/Focus)).

*Devil May Cry* runs the same gauge into offense and survival at once: the DT gauge fills from combat, and spending it buys damage, defense, and health regeneration together, so the panic use and the power use are literally the same button ([Devil May Cry Wiki: Devil Trigger](https://devilmaycry.fandom.com/wiki/Devil_Trigger), [Gauges](https://devilmaycry.fandom.com/wiki/Gauges)).

*Ikaruga* is the same idea with the polarity twist: bullets you absorb by matching polarity charge the homing laser, one level per ten bullets, up to twelve stored ([Shmups Wiki: Ikaruga](https://shmups.wiki/library/Ikaruga)). Note that the stored laser is offense, not a clear, and community writeups call it "the closest thing to a panic button Ikaruga has" ([AzorMX](https://www.azormx.com/azormx/action/the-search-for-the-greatest-shmup-episode-11-ikaruga/)).

*Radiant Silvergun* charges a gauge by absorbing pink bullets with the sword, and the release is a big attack with invincibility, again offense-flavoured rather than a clear ([Shmups Wiki / Treasure Wiki: Radiant Silvergun](https://www.hardcoregaming101.net/radiant-silvergun/)).

**What it would cost this game.** It requires the storm and the belch to draw on the same tank, which means the storm's growth stops being automatic and becomes something the player spends on. That is a real change to the run's feel: the grave stops passively getting stronger and starts being *invested in*. It also means a player who never belches gets visibly stronger than one who does, which is the pressure being asked for, and it means a player who belches often can dig themselves into a genuinely losing position. Crimzon Clover's answer to that last risk is the recovery item and the death reset.

---

## 4. Make the cost escalate per use

**The moment of play.** Your first clear of the run is cheap. Your fourth costs so much of the tank that you find yourself trying to survive the wave instead, and then noticing you could.

**Who does it.** Crimzon Clover, as above: the bomb line marches right with every bomb, reduced only by pickups, stars (very slightly), or death ([Shmups Wiki: Crimzon Clover](https://shmups.wiki/library/Crimzon_Clover)).

**What it would cost this game.** It is the smallest-surface option in this brief: a single moving threshold, no new systems, and it directly targets the observed behaviour (a run that leans on the belch gets progressively less leaning available). The cost is that it is invisible unless the HUD shows the line moving, and that it front-loads generosity, so the early run gets easier before the late run gets harder. It also does nothing about the 62-79% full figure on runs where the player only belches three times.

---

## 5. Make the full meter itself the reward line

**The moment of play.** The meter is full, and the game is actively paying you for every second you leave it that way. You watch the bonus tick. Firing means the payments stop.

**Who does it.** DoDonPachi is the famous case and it is worth noting it is the *inverse* of our design intent: pick up a bomb item at full stock and you get 10,000 points plus the MAXIMUM state, which then pays out bonus points every frame you continue to not die and not bomb ([Shmups Wiki: DoDonPachi](https://www.shmups.wiki/library/DoDonPachi), [Hardcore Gaming 101](https://www.hardcoregaming101.net/dodonpachi/)). Blue Revolver does a milder version: a bomb item picked up at max stock is worth 50,000 score ([Shmups Wiki: Blue Revolver](https://shmups.wiki/library/Blue_Revolver)).

**Why it is in this brief anyway.** It is the exact mechanism that produces the failure the community complains about, players hoarding and dying with a full stack. It is included because it names precisely what the current design accidentally half-does: the game currently pays nothing for a full reservoir, but it also charges nothing, and the splash is the only signal. Reading DoDonPachi backwards is instructive: if a full meter should not be a comfortable place to sit, the meter needs to be *doing* something while full, and the choices are pay for it (DoDonPachi, wrong direction here) or make it obviously wasted potential (section 3).

---

## 6. Turn the clear into currency rather than into safety

**The moment of play.** You fire the clear and the screen does not just empty, it turns into a shower of things worth collecting. The moment stops feeling like a rescue and starts feeling like a harvest you set up on purpose.

**Who does it.** Blue Revolver converts every second cancelled bullet into an ammo pickup on bomb ([Shmups Wiki: Blue Revolver](https://shmups.wiki/library/Blue_Revolver)). Cave's later games build entire scoring systems on bullet-cancel-to-item, with the Hyper in DoDonPachi DaiOuJou and its successors cancelling bullets and feeding the combo ([HYPER SYSTEM wiki: DDP DaiOuJou](http://a6productions.com/hypercounter/index.php?title=DoDonPachi_DaiOuJou), [Shmups Wiki: DDP DaiFukkatsu Black Label](https://shmups.wiki/library/DoDonPachi_DaiFukkatsu_Black_Label)). Battle Garegga inverts the shame entirely: bombs are used routinely as a scoring tool, fired at scenery to uncover hidden medals and items ([Hardcore Gaming 101](https://www.hardcoregaming101.net/battle-garegga/), [Shmups Wiki](https://shmups.wiki/library/Battle_Garegga)).

**What it would cost this game.** This does not reduce belch usage, it changes what the usage *means*. It moves the belch from "save me" to "cash in", which converts the complaint from "the belch bails me out" into "the belch is a play I set up". Whether that is a fix or a relabel depends on whether the designer's objection is to the frequency or to the feeling of being rescued. Note that in this game's case the belch already produces corpses, which are already food, so a version of this loop may already exist and may be part of why refilling feels so free.

---

## 7. Downgrade the clear: bullets, not kills

**The moment of play.** You are surrounded, you press it, and every bullet in the room vanishes. The enemies are all still there, still walking at you, and you now have about a second and a half of clean air to get somewhere better. The button gave you space, not a solution.

**Who does it.** Enter the Gungeon's Blank erases every bullet in the room and briefly suppresses firing, deals only light damage near you, and explicitly does not kill enemies. The community and wiki frame it as the last resort when the dodge roll has already failed ([Enter the Gungeon Wiki: Blank](https://enterthegungeon.wiki.gg/wiki/Blank)).

**What it changes about the moment.** A clear that removes the threat solves the wave. A clear that removes the bullets solves the next second and then hands the problem back. The player's next action after pressing it is a repositioning decision, not a breath. This is the single sharpest lever found for keeping the panic button without it answering the whole encounter.

**What it would cost this game.** In our terms, the belch currently kills every mob on screen *and* cancels every shot. Splitting those two effects apart is the mechanism: the shot-cancel is the panic value, the mass kill is the dominance. The cost is that a hole that swallows things not killing the things it belches at may fight the fiction, and the mob population would then have to be survivable by movement, which is a load the storm and the movement have to carry.

---

## 8. Replace the panic button with a defensive verb the player has to aim

**The moment of play.** There is no button that makes the danger go away. There is a button that makes *you* different for as long as you hold it right, and it only works if you read the screen correctly. Being saved is something you did, not something you spent.

**Who does it.** Ikaruga has no bomb at all, which reviewers consistently flag as a deliberate omission of a genre staple. The polarity switch is the defensive verb: match the incoming colour and those bullets become fuel instead of death ([Shmups Wiki: Ikaruga](https://shmups.wiki/library/Ikaruga), [Wikipedia: Ikaruga](https://en.wikipedia.org/wiki/Ikaruga)). Enter the Gungeon's dodge roll is the primary evasion, with the Blank as the admission that the roll failed ([Enter the Gungeon Wiki](https://enterthegungeon.wiki.gg/wiki/Blank)). Touhou's focus mode (slow movement, visible hitbox) is the same idea in a different direction: the safety is a movement state, not an expenditure.

**What it would cost this game.** The verb has to exist and has to be interesting. A hole that swallows has an obvious candidate family (something about depth, speed, or what passes under versus over), but this is a new core mechanic, not a price change, and it is the largest-surface option here.

---

## 9. Delete the bomb and compensate invisibly

**The moment of play.** There is no button. When the screen gets bad you either read it or you die, and the game quietly decides you have suffered enough and shaves the bullets a little without telling you.

**Who does it.** ZeroRanger ships with no annihilation bombs at all ([ZeroRanger wiki](https://zeroranger.miraheze.org/wiki/ZeroRanger), [NamuWiki](https://en.namu.wiki/w/ZeroRanger)). In their design interview, System Erasure describe the compensation directly: the game runs hidden dynamic difficulty, and in their words, "if you're in really big trouble it slows down bullets so it'll and reduces enemy Health a little but tries to do them in such numbers that you will actually never notice", with the stated purpose being to "give the player a slight push" so that they beat a boss slightly faster and then no longer need the training wheels ([The Design of ZeroRanger, System Erasure interview](https://www.youtube.com/watch?v=p6Q6NxvNeHA), roughly 74:00). They also state a general principle worth recording verbatim for this decision: "it's better to err on the side of the player being a little too powerful than a little too weak" (roughly 67:55). Their power curve is a permanent weapon-unlock progression through the run, and they note the progression exists partly to introduce systems gradually rather than dumping seven weapons on the player at once the way Radiant Silvergun does (roughly 57:22 to 58:18).

**What it would cost this game.** Deleting the belch moves the entire survival load onto the storm and onto movement, which is exactly the thing the tape says is currently too light. The ZeroRanger evidence suggests the replacement is not one mechanic but two: a real power progression the player feels arriving, plus an invisible safety net that keeps a bad moment from being fatal. Note that the safety net is the part players never see and never thank you for.

---

## 10. Take the trigger out of the player's hands

**The moment of play.** You are drowning and a thing drops on the floor nearby. Reaching it is a movement problem. Getting there empties the screen. You never decided to spend anything, you decided whether the trip was worth it.

**Who does it.** Vampire Survivors' Rosary kills everything on screen, but it is a random drop from light sources, gated behind reaching level 8, and weighted by the Luck stat ([Vampire Survivors Wiki: Rosary](https://vampire.survivors.wiki/w/Rosary)). There is no stock, so there is nothing to hoard and nothing to price.

**What it would cost this game.** It removes the decision entirely, which is either a relief or a loss depending on whether the belch is meant to be a skill expression. It also puts the clear on the game's schedule rather than the player's, so it cannot be the answer to every threat by construction. Given this game is in the auto-firing, swarm-facing family that Vampire Survivors defined, this is a well-precedented shape for the genre neighbours.

---

## 11. Price the refill instead of the fire

**The moment of play.** The meter is not full and you want it full. Getting it full means going *toward* the danger, right now, at close range, on purpose.

**Who does it.** Doom Eternal is the reference. Ammo is deliberately scarce and comes from chainsawing demons at melee range, health from glory kills, armour from the flame belch, so each survival resource is restocked by a different aggressive act ([Game Developer: The aggressive resource management of Doom Eternal](https://www.gamedeveloper.com/design/the-aggressive-resource-management-of-i-doom-eternal-i-)). Hugo Martin's stated ethos is "the solution to all the problems is to be aggressive ... you just take what you need when you need it" (same source). The chainsaw regenerates exactly one fuel pip on its own, sized to kill exactly one fodder demon, so the safety net exists but forces you into the fight to use it ([Doom Wiki: Chainsaw, Doom Eternal](https://doom.fandom.com/wiki/Chainsaw/Doom_Eternal)).

**What it would cost this game.** This is the direct answer to "I can always just eat more stuff and fill it up again". It does not price the belch, it prices the refill, by making swallowing something you have to go and earn rather than something that happens while you play. The cost is that it changes the core verb's feel: swallowing is currently the ordinary act of playing, and making it a positioning demand is a change to what the whole game is about, not a change to the belch.

---

## 12. Spend now or bank it (the same currency, two horizons)

**The moment of play.** You have four capsules. Spending them now makes the next thirty seconds survivable. Saving two more makes the rest of the stage survivable. You choose while things are already shooting at you.

**Who does it.** Gradius' power meter is the classic: one capsule currency, six slots, and the whole strategic identity of the game is which order you cash them in and how long you are willing to stay weak to reach the good one ([StrategyWiki: Gradius gameplay](https://strategywiki.org/wiki/Gradius/Gameplay), [Gradius Wiki gameplay guide](https://gradius.miraheze.org/wiki/Gradius/Gameplay_Guide)). The Binding of Isaac does the consumable version: bombs both damage enemies and open secret rooms and tinted rocks, and the community consensus is that they are usually worth more as keys than as weapons, so panic-bombing is felt as spending your loot ([Binding of Isaac Rebirth Wiki: Bombs](https://bindingofisaacrebirth.wiki.gg/wiki/Bombs)).

**What it would cost this game.** This is section 3 with a longer time horizon: instead of the meter feeding a power spike, it feeds a permanent purchase. It makes the belch cost a piece of the run's ending rather than a piece of the next ten seconds.

---

## Is the screen clear itself the problem?

The evidence says: usually not, but there is a real argument on the other side and it should be stated fairly.

**Against the clear itself.** The shmups community has a standing criticism that bombs let designers stop balancing patterns, that they exist to paper over encounters the designer did not make survivable, and that a bomb you can spam simply makes the game easier without making it better ([shmups.system11: How do you feel about BOMBS?](https://shmups.system11.org/viewtopic.php?t=54878), [shmups.system11: Bombing](https://shmups.system11.org/viewtopic.php?p=959845)). The autobomb debate is the sharpest version: the community's objection to games that auto-fire a full-strength bomb for you is that there is then "literally no reason to manual bomb", and that the player never learns the skill the button was supposed to test ([shmups.system11: I need your opinion on auto-bombing](https://shmups.system11.org/viewtopic.php?t=75516)). That criticism transfers directly here. A clear that is always available and always affordable is functionally an autobomb the player happens to press themselves.

**For the clear, priced.** Cave, Touhou, Crimzon Clover, Garegga and Blue Revolver all ship extremely powerful clears and are not considered broken by them, because in each case pressing it takes something the player wanted. The clear is not the mistake in those designs, the free-ness is.

**The honest middle.** Two of the mechanisms above (section 7, Gungeon's bullets-not-kills, and section 10, the Rosary as a floor drop) suggest a third reading: the specific thing that makes a clear dominant is that it *resolves the encounter*. A clear that only resolves the next second is not dominant no matter how often you press it. That is a claim about the clear's scope, not its price.

---

## Options that fit this game's shape, and the trade each makes

Ordered roughly by how much of the game they touch, smallest first. No recommendation.

**A. Escalating cost per belch (Crimzon Clover's moving line).** Trade: smallest possible change, directly targets lean-on-it runs, needs a visible HUD line to be learnable. Does nothing about a reservoir sitting full on a storm-first run.

**B. Split the belch's two effects and keep only the cheap one available freely (Gungeon's Blank).** Trade: the panic value survives, the dominance does not, but the wave still has to be beatable afterwards, which puts the load straight back on the storm. Also the strongest fiction risk: a hole that swallows but does not kill.

**C. One tank feeds both the storm and the belch (Crimzon Clover, Hollow Knight, Devil May Cry).** Trade: the closest match to this game's existing shape, and the only family that makes holding a full reservoir feel like *waste* rather than *insurance*, because full means unspent power. The price is that the storm stops growing on its own and becomes something the player invests in, which is a genuine change to the run's arc and probably to how the storm is described. It also makes the belch-heavy player measurably weaker later, which is the pressure being asked for and also the fastest route to an unrecoverable run. Crimzon Clover's mitigations are a recovery pickup and a reset on death.

**D. The full reservoir is a live buff, and belching spends it.** The mirror of DoDonPachi's MAXIMUM read backwards: rather than the reservoir being neutral while full, full does something for the storm continuously. Trade: it prices the fire without any new currency and without touching the refill, but it makes the 62-79% full time into an intended state rather than a symptom, which may not be what is wanted.

**E. Price the refill, not the fire (Doom Eternal).** Trade: this is the direct answer to "I can always just eat more stuff", but it changes the core verb. Swallowing is currently what playing *is*, and making it a positioning demand changes the identity of the game more than changing the belch does.

**F. Take the trigger away and make it a found thing (Vampire Survivors' Rosary).** Trade: hoarding becomes structurally impossible and the clear becomes a moment the game grants, not a button the player owns. Loses the belch as an expressive decision entirely.

**G. Remove it, and compensate (ZeroRanger, Ikaruga).** Trade: the honest version of the designer's instinct, but the evidence says removal is not one change. ZeroRanger pairs no-bomb with a felt permanent power progression *and* a hidden difficulty assist the player never notices. Ikaruga pairs no-bomb with a defensive verb that is the whole game. Removing the belch while the storm is reported as "way too light" means shipping the removal and the storm fix as one change, not two.

**H. Score or chain forfeiture (Cave, Touhou).** Trade: cheap to describe, but it only prices the belch for a player who is chasing a number. If this game does not yet have a number the player nurses, the mechanism has nothing to take.

**I. Rank response (Battle Garegga).** Trade: invisible, and it prices exactly the wrong direction relative to the tape unless inverted. Included because it is the only shipped mechanism found that makes the panic button change the shape of the *rest of the run*, which is a lever nothing else on this list pulls.

---

## Sources

- [Battle Garegga / Advanced Rank, Shmups Wiki](https://shmups.wiki/library/Battle_Garegga/Advanced_Rank) (frame-level rank documentation; bomb deployment adds 16,384 rank)
- [Battle Garegga, Shmups Wiki](https://shmups.wiki/library/Battle_Garegga)
- [Battle Garegga, Hardcore Gaming 101](https://www.hardcoregaming101.net/battle-garegga/)
- [Crimzon Clover, Shmups Wiki](https://shmups.wiki/library/Crimzon_Clover) (Break gauge, escalating bomb line)
- [Crimzon Clover, Hardcore Gaming 101](https://www.hardcoregaming101.net/crimzon-clover/)
- [Crimzon Clover: World EXplosion review, TheSixthAxis](https://www.thesixthaxis.com/2020/12/01/crimzon-clover-world-explosion-review/)
- [Blue Revolver, Shmups Wiki](https://shmups.wiki/library/Blue_Revolver) (stock system, rank-neutral bombing, max-stock score bonus, bullets to ammo)
- [DoDonPachi, Shmups Wiki](https://www.shmups.wiki/library/DoDonPachi) (MAXIMUM bonus for overstocking)
- [Dodonpachi, Hardcore Gaming 101](https://www.hardcoregaming101.net/dodonpachi/)
- [DoDonPachi DaiOuJou, HYPER SYSTEM wiki](http://a6productions.com/hypercounter/index.php?title=DoDonPachi_DaiOuJou)
- [DoDonPachi DaiFukkatsu Black Label, Shmups Wiki](https://shmups.wiki/library/DoDonPachi_DaiFukkatsu_Black_Label)
- [Mushihimesama, Shmups Wiki](https://shmups.wiki/library/Mushihimesama)
- [Mushihimesama basics, modes and scoring, shmups.system11](https://shmups.system11.org/viewtopic.php?t=4049)
- [Embodiment of Scarlet Devil gameplay, Touhou Wiki](https://en.touhouwiki.net/wiki/Embodiment_of_Scarlet_Devil/Gameplay) (Spell Card Bonus lost on bomb)
- [Subterranean Animism strategy, Touhou Wiki](https://en.touhouwiki.net/wiki/Subterranean_Animism/Strategy)
- [Ikaruga, Shmups Wiki](https://shmups.wiki/library/Ikaruga)
- [Ikaruga, Wikipedia](https://en.wikipedia.org/wiki/Ikaruga)
- [The search for the greatest shmup: Ikaruga, AzorMX](https://www.azormx.com/azormx/action/the-search-for-the-greatest-shmup-episode-11-ikaruga/)
- [Radiant Silvergun, Hardcore Gaming 101](https://www.hardcoregaming101.net/radiant-silvergun/)
- [ZeroRanger development, ZeroRanger Wiki](https://zeroranger.miraheze.org/wiki/ZeroRanger)
- [The Design of ZeroRanger, System Erasure interview (video)](https://www.youtube.com/watch?v=p6Q6NxvNeHA)
- [Enter the Gungeon Wiki: Blank](https://enterthegungeon.wiki.gg/wiki/Blank)
- [Vampire Survivors Wiki: Rosary](https://vampire.survivors.wiki/w/Rosary)
- [Hollow Knight Wiki: Soul](https://hollowknight.wiki.fextralife.com/Soul), [Focus](https://hollowknight.wiki.fextralife.com/Focus)
- [Devil May Cry Wiki: Devil Trigger](https://devilmaycry.fandom.com/wiki/Devil_Trigger), [Gauges](https://devilmaycry.fandom.com/wiki/Gauges)
- [The aggressive resource management of Doom Eternal, Game Developer](https://www.gamedeveloper.com/design/the-aggressive-resource-management-of-i-doom-eternal-i-)
- [Doom Wiki: Chainsaw (Doom Eternal)](https://doom.fandom.com/wiki/Chainsaw/Doom_Eternal)
- [Gradius gameplay, StrategyWiki](https://strategywiki.org/wiki/Gradius/Gameplay), [Gradius gameplay guide, Gradius Wiki](https://gradius.miraheze.org/wiki/Gradius/Gameplay_Guide)
- [Binding of Isaac Rebirth Wiki: Bombs](https://bindingofisaacrebirth.wiki.gg/wiki/Bombs)
- [Bomb sense, Dan Boland](https://danboland.net/2021/07/15/bomb-sense.html)
- [How do you feel about BOMBS?, shmups.system11](https://shmups.system11.org/viewtopic.php?t=54878)
- [Bombing, shmups.system11](https://shmups.system11.org/viewtopic.php?p=959845)
- [I need your opinion on auto-bombing, shmups.system11](https://shmups.system11.org/viewtopic.php?t=75516)

### Confidence notes

- Everything sourced to Shmups Wiki mechanics pages, Touhou Wiki, and the game-specific wikis is community documentation of observed game behaviour, not developer statement. It is high quality for this genre and frequently frame-accurate, but it is reverse-engineered.
- The ZeroRanger quotes are direct developer statements from a recorded interview, transcribed. Timestamps are approximate.
- The Doom Eternal quotes from Hugo Martin are developer statements relayed through Game Developer's article.
- "Battle Garegga punishes bomb hoarding" is widely repeated in popular writeups and is **not** supported by the detailed rank documentation, which prices deploying the bomb and prices collecting items, with no term for held stock. Treat as lore.
- Nothing here is a claim about what will work in this game. Every "what it would cost" paragraph is reasoning from the mechanism, not evidence.
