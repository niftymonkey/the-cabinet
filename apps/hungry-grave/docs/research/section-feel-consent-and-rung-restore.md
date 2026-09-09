# Section feel, consent wording, and the fallen rung

Research for Hungry Grave. Labels: **DOCUMENTED** = a developer statement, a shipped string table or data file, a patch note, a manual, or a wiki transcription of shipped behaviour. **COMMUNITY-MEASURED** = wiki, guide, chapter markers, or player-derived. **INFERRED** = my reading across sources.

Three questions: how shipped games make consecutive sections of one stage feel different on a small art budget, what they actually say on screen when asking to send run data to the developer, and whether a reclaimable power pickup restores the specific thing lost or a generic level.

This sits beside [stage-length-with-a-director.md](stage-length-with-a-director.md), [visible-ladder-precedent.md](visible-ladder-precedent.md), [shmup-stage-design.md](shmup-stage-design.md), [floor-ladder-precedent.md](floor-ladder-precedent.md) and [readability-value-band.md](readability-value-band.md). Those already hold Iuchi on the mountain-and-valley curve and the downbeat stage 2 boss music, gray117 on Ikaruga's preambles, Shepardus on distinguishable parts and short last stages, Boghog on section themes, Radiant Silvergun's punctuation, the Cave Story experience bar, Salamander's floating Options and Battle Garegga's player-dropped power item. All of it is cited here, never repeated.

The design context is fixed and this record does not reopen it: three sections in eight to ten minutes, one music loop and one tint and one dressing pass per section over a single 16 px tileset, three trash types, six wave templates, tapes uploaded on consent, and a lost weapon rung that falls on the field as a body to dive under. The ladder is Hungry Grave ADR 0003; the value band any new tint must satisfy is ADR 0014.

---

## What is solid

These are the claims I would build on. Sources sit at the claim or in the section named.

1. **A section is made its own by one rule nothing else in the run has, carried by the same art.** Downwell's four areas each run three levels on one three-colour palette and differ by a rule: most breakable blocks in the Caverns, spike-trap platforms in the Catacombs, an underwater breath timer counting 100 to 0 in the Aquifer, and no ground at all in Limbo, where floating doodads are the only recharge. Each also has one named music track and a near-disjoint enemy roster, and those are the only other channels used. DOCUMENTED (wiki transcription of shipped behaviour), [Caverns](https://downwell.fandom.com/wiki/Caverns), [Catacombs](https://downwell.fandom.com/wiki/Catacombs), [Aquifer](https://downwell.fandom.com/wiki/Aquifer), [Limbo](https://downwell.fandom.com/wiki/Limbo).

2. **Downwell spends its colour budget once, in one section, rather than in every one.** "Aquifer demonstrates the first use of a fourth color in Downwell. In the default palette, the additional color is blue (for water elements)." DOCUMENTED, same source. Three areas run on the base palette and the departure is the event.

3. **The survivors-likes change the mob mix about once a minute and that is the whole structure.** Mad Forest is a per-minute table, bats alone at 0:00 through mudmen at 5:00, spawn interval falling from 1.0s to 0.1s by minute 11. 20 Minutes Till Dawn's Forest holds 26 spawn sessions across 20 minutes, turning over at 1:00, 2:00, 6:00, 11:00, 13:00, 15:00, 16:00 and 18:00. DOCUMENTED (wiki transcriptions of the shipped tables), <https://vampire.survivors.wiki/w/Mad_Forest>, <https://20minutestilldawn.wiki.gg/wiki/Forest>.

4. **Ikaruga's chapter preambles are a named title card plus a short written passage.** Chapter 2: "The stronger the will you have, the more you will face various trials. Although you can choose to escape, 'Trial' has a message for you to conquer yourself." COMMUNITY-MEASURED (transcriptions of the shipped screens), <https://en.wikiquote.org/wiki/Ikaruga>. gray117's judgement of them is in [stage-length-with-a-director.md](stage-length-with-a-director.md) section 4.

5. **Boghog names set pieces as landmarks and constant intensity as the failure mode.** "You want some unique set pieces to punctuate levels and create landmarks the player can use when they are learning the layout," and "Constant intensity, heavy layering/overlap and high levels of challenge will blend together and wear out the player." DOCUMENTED, <https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101>.

6. **On-screen consent text that ships is short, benefit-first, and names the payload in one sentence.** Verbatim from 0 A.D., OpenTTD, Steam and Slime Rancher 2 in section 2.

7. **The shipped norm is a per-device setting asked once, not a per-run question,** and every shipped flow here leaves the player able to turn it off. The one exception on both counts, Minecraft, is the one players wrote mods to defeat. Section 2.

8. **Two shipped games let the player read the exact payload, and both put that next to the toggle.** OpenTTD's "Preview survey result" button, and 0 A.D.'s terms stating "The data can be reviewed before the UserReporter is enabled." DOCUMENTED, [Terms and Conditions](https://raw.githubusercontent.com/0ad/0ad/master/binaries/data/mods/public/gui/userreport/Terms_and_Conditions.txt) and the OpenTTD strings in section 2.

9. **Engines ship the mechanism and refuse to ship the words.** Unity's Analytics SDK "does not collect any personal data by default and initializes in a dormant state", and "You, the developer, are responsible for determining what data privacy legislation applies to the player and what consent is required before activating the SDK." No sample wording is given. DOCUMENTED, <https://docs.unity.com/ugs/en-us/manual/analytics/manual/manage-data-privacy>. Godot ships none.

10. **Valve's own one-line version is the shortest shipped precedent: "Participation in the survey is optional, and anonymous."** DOCUMENTED, <https://store.steampowered.com/hwsurvey/En>. Valve's requirement on developers is a policy rather than a prompt: the Steam Web API terms require a posted "privacy policy regarding the use of nonpublic end user data" and telling the user what you store. DOCUMENTED, <https://steamcommunity.com/dev/apiterms>.

11. **Four of the six shipped reclaimable power pickups restore a generic level; the other two restore an object that never stopped existing.** Battle Garegga, DoDonPachi, Raiden II and Cave Story all hand back a standard item from the standard pool, and Battle Garegga alone matches the count to what was taken. Salamander and Gradius V are the two exceptions: the Option itself survives and is picked up again as the same Option. Cave Story's are explicitly redirectable, raising the level of the *equipped* weapon. Case by case in section 3.

---

## 1. Section feel on a small art budget

### What the shipped games actually vary

Five channels do the work across the games checked, and no game uses more than four at once: music, palette or dressing, enemy roster, placement or density, and a boundary marker. INFERRED from the DOCUMENTED sources in claims 1 to 5.

Two things fall out. The mob roster and the pace are varied by everybody, including the games with no art budget at all: Downwell gives each area a near-disjoint roster and its own terrain rule, Mad Forest turns the roster over every minute or two while the spawn interval falls from 1.0s to 0.1s, and Ikaruga counted its enemies per chapter. The palette is the channel spent least, and Downwell holds a fourth colour back for one section out of four so that the addition is itself the event.

And the boundary marker is what turns a change into a section. Boghog's landmark advice (claim 5) and Radiant Silvergun's punctuation, argued in [stage-length-with-a-director.md](stage-length-with-a-director.md) section 4, agree with the two survivors-likes here: even Vampire Survivors and Halls of Torment, which refuse stage boundaries, still put a scheduled boss or elite on the clock so the minute has a name.

### Three sections, as moments of play

Each uses only the agreed tools: one music loop, dressing and tint over the one tileset, the three trash types, the six wave templates, and pace. Each is written so a player could name the section without being told it changed. INFERRED throughout.

**Section one, the lane (0:00 to about 2:00). Its own thing is emptiness.**

You come up out of the dark into bare rock with a statue every few seconds, lit coldest and least saturated of the three. One quiet loop. Shamblers arrive alone as Drips, then a File, then a revenant appears with its tell and you learn what a tell is. Nothing overlaps: one template runs, finishes, and the field is briefly empty before the next. There is time to look at a corpse and decide to go get it, and the gap between waves is where the dive gets taught. The ghoul does not exist yet.

Precedent: Downwell's Caverns, the area with the fewest hazards and the base shop prices (claim 1); Mad Forest's first two minutes on one enemy family at a 1.0s interval (claim 3); DoDonPachi's 2:05 stage 1 in [shmup-stage-design.md](shmup-stage-design.md); Inoue on stages 1 to 3 carrying the whole game, in [stage-length-with-a-director.md](stage-length-with-a-director.md) section 4.

**Section two, the crowd (about 2:00 to about 5:00). Its own thing is the third mob and the overlap.**

The rock is the same rock, now veined and wet, urns and mouths in it, tinted warmer. A driving loop. The ghoul arrives for the first time and the field never has fewer than two templates running: Rain under a Pincer, a V through Rain. Corpses stop being objects you choose and become a floor you swim through, and the question turns from "can I reach that one" into "which of these can I still reach". One deliberate trough sits mid-section, thin Drips over a held music bar, so the swarm set piece at the end lands against something.

Precedent: Downwell's Aquifer, where the fourth colour and the breath timer arrive together (claims 1 and 2); Mad Forest's minutes 3 to 7 and 20 Minutes Till Dawn's turnover points (claim 3); Iuchi's downbeat-by-design valley, in [stage-length-with-a-director.md](stage-length-with-a-director.md) section 4; Boghog on constant intensity (claim 5).

**Section three, the descent (about 5:00 to about 8:00). Its own thing is that the food thins.**

Eyes in the rock, then tentacles, then floating rocks with nothing behind them. This is the section that spends the palette: the tint departs hardest here, the only place the rock stops reading as rock. The slowest, heaviest loop. The roster inverts, fewer bodies and more revenants, so the field is more fire and fewer corpses per kill and the economy tightens without a single new system. Files and one Wall. Shortest of the three on purpose, because the Undertaker has to carry the end.

Precedent: Downwell's Limbo, where the ground is removed (claim 1) and the held-back fourth colour is spent once (claim 2); Shepardus on Garegga and Touhou keeping last stages short for the bosses, and Ikaruga's chapters dropping back to 3:26 for the last, both in [stage-length-with-a-director.md](stage-length-with-a-director.md) section 4.

### Recommendation

**Give each section exactly one property no other section has, and mark the boundary with a named card and a music cut. INFERRED.**

The one property per section: section one owns emptiness (never more than one template live), section two owns overlap (never fewer than two), section three owns scarcity (the revenant-heavy roster, so kills pay less food). Those three are free. They cost rows in the wave table and nothing in art, they are readable from play alone rather than from the background, and each is the kind of thing a player says out loud, which is Shepardus's test.

Spend the tint budget the way Downwell spends its fourth colour: two sections on the base palette with dressing changes only, and one, the last, where the tint genuinely departs. Three tints of equal weight read as one slowly shifting background, which is the Einhänder answer, and that answer needs continuously changing scenery this project is not building. The departing tint still has to clear ADR 0014's band ceiling like any other live-field colour.

Take the boundary marker from Ikaruga rather than Radiant Silvergun: a named card with one line on it, over a hard music cut, at each of the two boundaries. Radiant Silvergun's punctuation is a boss kill plus a tally screen plus a chain reset, and two of those do not exist here. Ikaruga's preamble is a title and a sentence, one text draw, and gray117's judgement in the sibling record is that it was the thematically effective thing.

The risk worth naming: this is a recipe for three tellable sections, not for three sections worth eight minutes. The pushback in [stage-length-with-a-director.md](stage-length-with-a-director.md) section 3 was about content, and a tint is not content. Mob mix and wave shape mix are the only channels here that add play, so if the minutes feel long, those are the ones to spend on.

---

## 2. Consent wording

### Verbatim, from shipped games and one platform

**0 A.D. (Wildfire Games), in-game panel.** DOCUMENTED, [shipped string table](https://raw.githubusercontent.com/0ad/0ad/master/binaries/data/mods/public/l10n/public-gui-other.pot).

> Help improve 0 A.D.!
> You can automatically send us feedback that can help us fix bugs, and improve performance and compatibility.

Buttons: `Enable Feedback` / `Disable Feedback`, plus `Terms` and the gate `Please read and accept the UserReporter Terms and Conditions.` When on, the same panel reads `Thank you for helping improve 0 A.D.!`, `Feedback is currently enabled.`, `Status: %(status)s.` The upload happens once per program launch and the terms document says so.

**OpenTTD, first-launch dialog and options page.** DOCUMENTED, [shipped string table](https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/lang/english.txt).

> Participate in automated survey?
> Would you like to participate in the automated survey?{}OpenTTD will transmit a survey when leaving a game.{}You can change this at any time under "Game Options".

Buttons on the dialog: `Yes`, `No`, `Preview survey result`, `About survey and privacy`. The options page repeats it as `Automated survey` / `Participate in automated survey`, tooltip `When enabled, OpenTTD will transmit a survey when leaving a game`, with the same preview and privacy-link buttons beside it.

**Steam, the hardware and software survey.** DOCUMENTED, source in claim 10.

> Participation in the survey is optional, and anonymous.

**Slime Rancher 2 (Monomi Park).** DOCUMENTED, [developer help centre](https://slimerancher2.zendesk.com/hc/en-us/articles/14025336022931-Data-Collection-and-Opting-Out). The on-screen label is `Data Collection`, reached by "open the Options Menu and select the ( i ) About tab. Then select the option for Data Collection and on the pop up select the option to Disable." The exact pop-up wording is not published.

**Unity.** DOCUMENTED, source in claim 9. Ships the dormant-by-default SDK and the developer obligation, no wording.

**Minecraft.** COMMUNITY-MEASURED, <https://minecraft.wiki/w/Telemetry>. A telemetry screen where "the player can view the collected data and choose between sending a required 'minimal' amount of data or an extended 'all'." The negative case: the choice is between two amounts with no off, which is why it is the one in this set players wrote mods to defeat.

### The privacy-notice practice for a hobby game with no accounts

The spread runs from nothing to a GDPR document. Vampire Survivors on PC has no analytics toggle anywhere in its options menus (COMMUNITY-MEASURED, <https://vampire.survivors.wiki/w/Options>, which lists every option and lists none), and poncle's notice is a web page whose substance is mobile crash reporting and ad partners (COMMUNITY-MEASURED, <https://poncle.net/privacyPolicy.html>). 0 A.D. is the other end: an 8 KB shipped Terms and Conditions text file argued article by article against the GDPR, naming the fields collected, stating that the UserID "is a pseudonym generated by the UserReporter the first time it is used", and disabling itself on every version update until the player agrees again. DOCUMENTED, source in claim 8.

Off Steam there is no platform requirement at all (claim 10), and what ships in that case is a linked notice plus an in-game toggle.

### Candidate wordings

Written for a title-screen toggle: one line as the label, one sentence under it. The tape header carries three fields a person might care about: an author name if the player types one, the input device, and the policy field (which reads as a human run for a person). The sentence names all three, and never claims the payload holds no personal data, because a typed name is personal data.

**A. Payload-first.**
> Send my runs to the developer
> Each finished run uploads its tape: the dice it rolled, the steering you gave it, the kind of control you played with, and a name if you type one. Nothing else leaves your device.

**B. Benefit-first, the 0 A.D. shape.**
> Help tune The Hungry Grave
> You can send each finished run to the designer so the game can be tuned by watching real runs. A run is a seed, your inputs and the kind of control you used, with a name only if you type one. No account.

**C. Short, the Steam shape.**
> Share runs (optional, anonymous)
> A finished run uploads its recording so the designer can replay it. Sending is optional and there is no account.

### Recommendation

**Ship B, with A's payload sentence folded in, plus a "see what a tape holds" affordance beside the toggle. Opt in once per device, not per run. INFERRED.**

B's headline is the one shipped shape that reads as an invitation rather than a disclosure, and 0 A.D. and OpenTTD both lead that way. What B is missing is A's exactness, and this game can be exact where 0 A.D. cannot: a tape is a seed, a list of inputs, an optional typed name and an input-device field, and that fits in one sentence. So the shipped line should be B's heading over A's sentence.

The affordance matters more than the wording. OpenTTD ships `Preview survey result` on both the prompt and the options page, and 0 A.D. tells the player the file is on disk and reviewable before enabling (claim 8). It is cheap here: the tape is already a file the player can save and hand to a friend, so "show me one" is a button over something already built. That is the highest-value thing to copy out of this section.

Per device, asked once, changeable in the options at any time. Every shipped example except Steam's own survey is a stored setting rather than a question at each event, and OpenTTD's dialog says so in its third sentence. A per-run prompt would fire eight to ten times an hour and train the player to dismiss it, which is worse consent than one deliberate answer.

Two shipped details to copy and one to avoid. Copy 0 A.D.'s re-consent on change: if the tape format or what is uploaded ever grows, the flag resets and the player is asked again. Copy 0 A.D.'s live status line, so the panel says whether the last upload worked rather than failing silently. Avoid Minecraft's shape, a choice between two amounts with no off, which is the one arrangement in this set that produced mods written to defeat it.

One thing the wording must carry that no precedent faced: the author name field. Since a tape has somewhere to put a name, the toggle text has to say the name is typed by the player and optional, or the honest reading of "no personal data" breaks. All three candidates above say it.

---

## 3. Rung restore: specific or generic

### Case by case

**Battle Garegga: generic item, quantity matched to the loss.** Death "will also weaken the player's main shot by one level and take away their options", and "the explosion will release a large shot icon (even if they were already at shot Level 1) and an option power up for each option lost". The Large Shot Power Up is the ordinary item popcorn enemies drop, it "levels up the ship's main shot" regardless of how many small icons were banked, and picking it back up returns exactly the one level that died. DOCUMENTED (wiki transcription), <https://www.shmups.wiki/library/Battle_Garegga>.

**Salamander and Life Force: the specific object, because it never stopped being that object.** "The options float in space for a brief time before disappearing; the new ship can grab and retain them." The thing recovered is the Option itself, not an item that grants one. DOCUMENTED, quoted and sourced in [visible-ladder-precedent.md](visible-ladder-precedent.md) section 1.

**Gradius V: the same shape as Salamander, one generation later.** The player respawns in place rather than at a checkpoint, and the Options left by the dead ship can be recollected within a short window. COMMUNITY-MEASURED, <https://classic-games.net/ps2/gradius-v/>, and claim 5 in [visible-ladder-precedent.md](visible-ladder-precedent.md). The shmups wiki page documents the respawn options and is silent on the Options, so this rests on secondary sources.

**Raiden II's Fairy: generic, and explicitly drawn from the standard item order.** The fairy is found by shooting a specific tree in stages 1 and 4 and is held in stock. "A collected fairy is released when the player loses a life and will drop items in the middle of the screen. These follow the item order and occasionally missile items appear among the group." DOCUMENTED (wiki transcription), <https://shmups.wiki/library/Raiden_II>. Nothing in the shipped behaviour ties what it drops to what the player had.

**DoDonPachi: generic, escalating with repeated deaths, and a special generic on the last life.** Death "will reduce the player's strengthened weapon by one level and the non-strengthened weapon reverts back to level 1". After the second death a `P` item is released, two on the third, three on the fourth. The `MP` item "grants max power, only appears after the player loses their last life". Both are ordinary items from the ordinary pool; the rubber band is in how many appear, not in what they restore. DOCUMENTED, <https://shmups.wiki/library/DoDonPachi>.

**Cave Story: generic, and redirectable, which is the strongest version of the generic case.** Experience is per weapon and does not carry between weapons, but the crystals do not know that: they "raise the experience level of Quote's equipped weapon". Lost experience is not ejected onto the floor at all, so there is nothing to reclaim; the game instead places breakable experience capsules in the two areas that reduce a weapon to level 1, the Last Cave and the Blood Stained Sanctuary. DOCUMENTED, <https://cavestory.fandom.com/wiki/Game_objects> and <https://cavestory.fandom.com/wiki/Experience>.

**The tally.** Four of six restore a generic level, and the two that restore the specific thing, Salamander and Gradius V, do so only because that thing is a physical object which outlived the ship. Three of the four generic cases are a *life* loss with a respawn, where the build was gone and could not have been handed back item by item even in principle; Cave Story is the fourth and is not a loss ejected onto the floor at all, which is why its crystals are redirectable. INFERRED.

### Two options for the fallen rung

**Option A: the fallen rung restores the same line's level.** You are at the floor, a revenant tags you, and a level of the bell tears out of the grave and lands on the field as a body. The bell rings slower and shorter for as long as it lies there. You turn back into the wave you were running from, pass under it, and the bell is what it was. Only the scroll can take it for good.

*What it buys:* the loss and the recovery are one object, which [visible-ladder-precedent.md](visible-ladder-precedent.md) names as what made the legible ladders legible. It is the Salamander shape, the only case here where the recovered thing is the lost thing. It keeps the ladder a cost rather than a shuffle, because taking it back is the only good outcome, and it keeps ADR 0003's promise legible: the player watched it leave and watched it come back.

*What it costs:* it needs the falling body to carry an identity on screen, so a bell rung and a Territory rung cannot look alike, which is a new readability obligation under ADR 0014 at a moment when the field is at its worst. It also means the rung is worth nothing to a player whose lost line was already thin, so the dive back can be a bad trade the player has to be able to read as one.

**Option B: the fallen rung is a generic level, applied by the game's usual rule.** Same hit, same falling body, but a plain rung: you dive under it, the drop rule runs, and the level goes wherever the dice or the offer put it.

*What it buys:* it is the industry standard by five cases to one, it reuses the drop path that already exists, and it needs no new art or new identity on the falling body. It also gives the player in the spiral a chance to redirect into a line that is worth more than the one they lost, which is a comeback on top of a comeback.

*What it costs:* the redirect is exactly the problem. Cave Story's crystals are the shipped proof that generic experience gets poured into the weapon the player prefers rather than the one that bled, so here a hit becomes a chance to re-roll a bad build. And ADR 0034 makes a drop an offer of three, so a generic rung is a build decision presented in the second after a hit at the size floor, which is the worst moment in the run to open a menu.

### Recommendation

**Option A, the same line's level. INFERRED.**

The record's one specific-restore case is the one whose shape this mechanic already has. Salamander's Option survives because it is an object the ship shed rather than a value the ship lost, and Hungry Grave's rung is written the same way: it falls out of the grave as a body, it lies on the field, the scroll carries it off. Every generic case in this record is a life loss where the build was gone and a generic item was the only thing the game could hand back, and that constraint does not apply here, because the grave does not die when the rung falls.

The two design promises point the same way. ADR 0003 says the floor ladder takes things the player can watch themselves lose, and a rung that comes back as a different line was not the thing they watched leave. The vision's "greed is the right play" needs the dive back to be unambiguously the right move, and a re-roll makes losing a rung sometimes better than keeping it, which is Battle Garegga's suicide problem in miniature, already named as a standing caution in `docs/design/game-concept.md`.

Borrow Battle Garegga's quantity rule rather than its identity rule: one body per rung stripped, so two rungs taken in a bad stretch are two bodies to go and get. That is the shipped precedent for making the count of the loss legible, and it needs none of Garegga's genericness.

The obligation this creates should be tracked rather than assumed away: the falling body has to say which line it is at the densest moment the field ever reaches. The cheapest shipped answer is Cave Story's second channel, the field itself, since each line already has to look different at each of its five levels, so the rung can be a piece of that line's own storm, falling. Whether it reads at measured density belongs to the check ADR 0014 already requires.

---

## Open items

- **No verbatim on-screen consent string was found for any commercial survivors-like or shmup.** Searched Vampire Survivors (its wiki lists every option and lists no analytics toggle), Slay the Spire, Brotato, Halls of Torment, 20 Minutes Till Dawn, Hades and Celeste. Slay the Spire's metrics collection is documented from the developer side, in the GDC 2019 talk "'Slay the Spire': Metrics Driven Design and Balance", but no in-game prompt or opt-out setting is documented anywhere I looked. The verbatim record in this document is entirely open-source games plus Valve.
- **Slime Rancher 2's actual pop-up wording is not published,** only the path to it and the fact that a Disable option exists.
- **Minecraft's telemetry screen text is not transcribed anywhere I could reach.** The wiki describes the screen and reproduces a screenshot but does not quote the heading, the body or the button labels.
- **No primary source confirms that Gradius V's recollected Options restore the same count the player had.** The shmups wiki page documents respawn behaviour and is silent on Options; the claim rests on a review and on the sibling record.
- **Cogmind's scoresheet upload is a real per-device opt-in for run data, and its setting name and prompt text could not be found.** Grid Sage's two 2019 leaderboard posts cover the protobuf format and the local signing key and never show the settings UI.
- **No developer statement was found on why Downwell spends its fourth colour in the Aquifer specifically.** Fumoto's GDC 2016 talk is about the single key mechanic; the palette-per-area facts are wiki transcriptions of shipped behaviour.
- **Crimzon Clover's and Blue Revolver's stages are not documented as named internal sections anywhere I looked.** The shmups wiki Crimzon Clover page covers mechanics, ships, modes and scoring and has no stage structure at all, so neither game could be used as a section-feel precedent here.
- **Cave Story's area transitions could not be sourced.** The map-name-on-entry behaviour and per-area music are things I could not find transcribed on any wiki, so Cave Story appears in this document only for its experience system.
- **ZeroRanger's sections could not be pinned down from a primary source.** The ZeroRanger wiki describes scripted stages whose scroll speed responds to clearing sections early, and a music shift at transitions, but no named section list or timing exists.
- **No shipped game was found that restores a specific power level from a field pickup while a generic pickup also exists in the same game.** Salamander's Options are specific and its capsules are generic, but the capsules were never the loss channel, so the two are not a choice the game ever put in front of a designer.

---

## Reproducing the checks

Every URL is inline at the claim it supports; there is no separate source list. The 0 A.D. and OpenTTD strings came from the shipped translation templates in each repository, so to re-read them, fetch the two raw URLs and grep for `userreport` and `SURVEY`. The Downwell and Cave Story facts came through the Fandom API (`?action=parse&page=Aquifer&prop=wikitext&format=json`), because the rendered pages refuse automated fetches.
