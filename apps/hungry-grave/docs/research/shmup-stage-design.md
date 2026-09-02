# Vertical shmup stage construction: length, structure, density, item cadence, and how stages were tuned

Research for Hungry Grave. Labels: **DOCUMENTED** = a developer statement, a shipped data table, or a disassembly. **COMMUNITY-MEASURED** = timestamps, counts, or records taken by players from the shipped game (superplay chapter markers, speedrun boards, wiki tables, tool-assisted runs). **INFERRED** = my reading across sources.

The strongest sources here are translated developer interviews at shmuplations.com (Cave, Toaplan, Treasure, Raizing), ZUN's two-part 4Gamer interview in Japanese (my translations, so treat the wording as approximate and the substance as his), the Cave programmer and artist interviews in the Cave Shooting History collection, and two indie developers who described their process in their own words (Final Form on Jamestown, Sunny Tam on Danmaku Unlimited). Per-stage minutes come from chapter markers on published one-credit runs, cross-checked against speedrun.com record times pulled from its API on 2026-09-01.

---

## What is solid

These are the claims I would build on.

1. **A shipped vertical shmup stage runs 2 to 4 minutes including its boss, and first stages are the short end at about 2 minutes.** DoDonPachi stage 1 is 2:05 start to start (1:20 of scrolling, 45 seconds of boss); its stages 3 to 6 are 3:31 to 4:14. Garegga's first two stages are 2:24 and 2:11, its fifth and sixth 5:58 and 5:12. Deathsmiles' selectable stages are 1:58 to 4:05. Crimzon Clover and Blue Revolver both open at about 2:30 to 3:10 and end at 8 minutes. Sky Force Reloaded's thirteen stages run 2:48 to 7:15 at record pace. COMMUNITY-MEASURED, table below.

2. **The people who built these games say the length of a stage was a business constraint before it was a design choice.** Toaplan's Tatsuya Uemura: "We were told to make our games so that 'One credit for 3 minutes', but we said you can't make an interesting game like that." ZUN independently: arcades lived through "a long era of one play, three minutes," and the working rule became "end it around stage 2." Cave's Takashi Ichimura: after the first location test, "we use about a 3 minute portion of the game as a base, and set the difficulty from there." DOCUMENTED. The 20 to 30 minute one-credit run is the other end of the same constraint: Raizing's Kenichi Yokoo says an STG "should take about 30 minutes to clear one loop," and ZUN says 20 minutes is "just right when you can clear it" but "rough" for a game that takes hundreds of attempts.

3. **The template is stage, midboss, stage, boss, and the people using it name it as a convention rather than a discovery.** Sunny Tam (Danmaku Unlimited): "Danmaku Unlimited follows the Cave style so that means stage, midboss, stage, boss." DOCUMENTED. Measured midboss placement is not centred: DoDonPachi's stage 1 midboss arrives 60% of the way through the scrolling section, its stage 3 midboss 24% of the way through. COMMUNITY-MEASURED.

4. **Two of the most respected stage designers in the genre say the stage sections are subordinate to the boss, and the third counted every enemy.** ZUN: "In Touhou I hardly think about the fineness of the stage sections. The most important thing in Touhou is the boss fight, so everything other than the boss fights is fairly rough." Junya Inoue on Batsugun: "a speedy feeling where one stage is about one minute, and with a refreshing feeling, where you feel that you accomplished something." Hiroshi Iuchi on Ikaruga: "we precisely counted the number of enemies and designed the stages around combos," then deliberately obscured the optimal route. DOCUMENTED.

5. **Ikaruga is the one game where a stage's enemy count is on the record, and it is about 430 to 900 kills per chapter, roughly 3 to 4 kills per second of scrolling.** A tool-assisted maximum-score run chains 144, 230, 305, 243 and 131 times across the five chapters; one chain is three kills, so the chapters contain at least 432, 690, 915, 729 and 393 killable enemies. Unassisted records are within 10% of those. COMMUNITY-MEASURED (counts), INFERRED (rate).

6. **Item cadence is authored per enemy, and the two documented models are opposite.** Touhou EoSD drops an item from every third enemy killed, cycling a fixed 32-entry pattern of 16 small power, 1 large power and 15 point items. DoDonPachi reaches full power in exactly 4 power-ups, carried by specific enemies. Battle Garegga opens its first stage with 30 idle tanks that each drop a weapon fragment, and everything you pick up raises the hidden rank. DOCUMENTED (wiki transcriptions of shipped behaviour) and COMMUNITY-MEASURED.

7. **Difficulty escalates across a run through hidden rank driven by survival time and power, and the numbers are known.** DoDonPachi: +2 rank per minute since last death, +2 per life in stock, +2 per shot power level, +1 per laser level, capped at 63. EoSD: +1 every 40 seconds of survival (4 seconds less per spare life), +0 to +2 per item, cap 32, and boss bullet counts differ by "a factor of 4 or more" between minimum and maximum rank. DOCUMENTED (disassembly and wiki transcription).

8. **Every developer who described tuning described the same loop: build it, watch people die, adjust, and do most of that at the end.** Toaplan made location-test builds easy, saw someone clear them in a day, and "dramatically" raised difficulty. Cave's Ikeda says "everything has to be consolidated and adjusted at the end" after the location test, and DoDonPachi's Kouyama put "2 to 3 weeks before the master" into playtest and debug. Jamestown "timed things like the duration of levels and boss fights" in Ikaruga and DoDonPachi, used blind testers, and tuned "placements, health totals, movement speeds, and bullet patterns right up to the day of the gold master." Yagawa: "The benchmark for game balance is simple. It is myself." ZUN: "If I get angry playing it myself, I delete it." DOCUMENTED.

9. **Portrait mobile shmups shrink the unit of play, not the genre.** Bullet Hell Monday ships 5 chapters of 10 stages with a boss on every tenth, describes its chapter mode as "a mode where you clear short stages in order," and sets stage missions like "clear the level within 25 sec." Phoenix 2 generates a fresh daily mission of 20 waves. Sky Force Reloaded keeps arcade-length stages (3 to 7 minutes) but wraps them in a medal and upgrade grind that HowLongToBeat puts at 16 hours for the main story. DOCUMENTED and COMMUNITY-MEASURED. No developer statement on *why* was found for any of them.

10. **Nobody I could find has published a pre-boss silence as a designed number.** The only length-of-lull evidence is qualitative: a player describing Guwange's "very brief breather period of minimal enemy fire in between waves," and a designer's advice that the final phase of a stage should "go slower... build momentum and anticipation." Cave chapter markers put the boss immediately after the last wave. COMMUNITY-MEASURED (absence).

---

## 1. Stage length

### Per-stage minutes from published one-credit runs (COMMUNITY-MEASURED)

Times are chapter markers written by the uploader, so they carry a few seconds of slop. "Scroll" is stage start to boss music; "Boss" is boss to next stage start.

**DoDonPachi**, arcade, C-L 1-ALL longplay. Source: <https://www.youtube.com/watch?v=2UXpVV-iSpo>

| Stage | Scroll | Midboss at | Boss | Stage total |
|---|---|---|---|---|
| 1 | 1:20 | 0:48 (60% of scroll) | 0:45 | 2:05 |
| 2 | 1:34 | none marked | 0:46 | 2:20 |
| 3 | 2:39 | 0:38 (24% of scroll) | 1:35 | 4:14 |
| 4 | 2:24 | none marked | 1:07 | 3:31 |
| 5 | 2:44 | none marked | 1:05 | 3:49 |
| 6 | 2:41 | none marked | 1:01 | 3:42 |

First loop total 19:41 in this run; the speedrun.com record is 16:33. Boss share of a stage runs 20% (stage 5) to 37% (stage 3).

**Battle Garegga**, arcade, Gain 1CC. Source: <https://www.youtube.com/watch?v=UUMAwFNCIJo>

| Stage | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| Length incl. boss | 2:24 | 2:11 | 3:39 | 2:54 | 5:58 | 5:12 | 4:07 |

Total 26:25. The shmups.wiki stage guide describes stage 5 as "long... starts slowly and has a lot of repetition, but accelerates as it progresses, ending with a boss rush," and stage 6 as "the wall... a huge difficulty spike." Source: <https://shmups.wiki/library/Battle_Garegga/Stages>

**Ikaruga**, arcade Normal, 1-miss ALL. Source: <https://www.youtube.com/watch?v=AnQKWg1lLvs>

| Chapter | Scroll to boss | Boss | Chapter total |
|---|---|---|---|
| 1 | 2:16 | 1:02 | 3:18 |
| 2 | 3:29 | 0:44 | 4:13 |
| 3 | 3:29 | 0:50 | 4:19 |
| 4 | 3:47 (midboss "The Flower" at 0:32) | 1:26 | 5:13 |
| 5 | 1:18 | ~6:48 (final boss sequence) | ~8:06 |

Total 25:09. Bosses in Ikaruga are on a visible timer and pay 10,000 points per second remaining, so a long boss is a scoring choice as much as a design one. Source for the timer rule: <https://tasvideos.org/4600S>

**Deathsmiles**, arcade, 1CC with selectable stage order. Source: <https://www.youtube.com/watch?v=VI0sE04YzhY>

| Stage | A-1 | A-2 | B-1 | B-2 | C-1 | C-2 | Final |
|---|---|---|---|---|---|---|---|
| Length incl. boss | 2:27 | 2:55 | 2:37 | 2:55 | 1:58 | 4:05 | 9:26 |

**Crimzon Clover World EXplosion**, Novice Original. Source: <https://www.youtube.com/watch?v=ciXFBt6K4FY>

| Stage | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Length incl. boss | 3:11 | 4:11 | 6:00 | 5:18 | 8:26 |

**Blue Revolver** v1.12, Parallel ALL. Source: <https://www.youtube.com/watch?v=wk2d2iO2kwE>

| Stage | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Length incl. boss | 2:32 | 3:21 | 5:16 | 4:24 | 7:58 |

**Batsugun** (exA-Arcadia version, Kiwami mode, scoring run so bosses are milked). Scrolling sections only: stage 1 1:25, stage 2 1:07, stage 3 1:22, stage 4 3:48, stage 5 3:49. Source: <https://www.youtube.com/watch?v=FF9vcbMFJ58>. This matches Inoue's "about one minute" intent for the early stages (section 2).

**Sky Force Reloaded**, per-stage Any% records from speedrun.com individual-level boards: stages 1 to 13 run 2:48, 4:01, 4:33, 3:14, 3:38, 4:42, 3:33, 5:14, 4:00, 3:26, 4:37, 4:25, 7:15. Source: <https://www.speedrun.com/Sky_Force_Reloaded>

### Full one-credit run length (COMMUNITY-MEASURED, speedrun.com record times, API, 2026-09-01)

| Game | Stages | Record | Board |
|---|---|---|---|
| Batsugun | 5 | 14:35 (1P), 16:39 (1P 1CC) | <https://www.speedrun.com/batsugun> |
| DoDonPachi | 6 | 16:33 (1P Normal) | <https://www.speedrun.com/dodonpachi> |
| Mushihimesama | 5 | 17:05 | <https://www.speedrun.com/mushihimesama> |
| Touhou 6 EoSD | 6 | 17:52 (Normal), 13:59 (Easy, 5 stages) | <https://www.speedrun.com/eosd> |
| ESP Ra.De. | 5 | 18:03 (1P 1CC) | <https://www.speedrun.com/esprade> |
| Deathsmiles | 7 played | 18:52 to 20:15 | <https://www.speedrun.com/deathsmiles> |
| Ikaruga | 5 | 19:27 to 20:19 | <https://www.speedrun.com/ikaruga> |
| Blue Revolver | 5 | 20:09 | <https://www.speedrun.com/blue_revolver> |
| Jamestown | 5 | 20:30 (Any% 1P) | <https://www.speedrun.com/jamestown_legend_of_the_lost_colony> |
| Radiant Silvergun | 7 arcade | 21:10 (Arcade mode) | <https://www.speedrun.com/radiant_silvergun> |
| Touhou 7 PCB | 6 | 21:18 (Normal) | <https://www.speedrun.com/touhou_youyoumu_perfect_cherry_blossom> |
| Battle Garegga | 7 | 21:54 (1P 1CC) | <https://www.speedrun.com/battle_garegga> |
| Danmaku Unlimited 3 | 5 | 23:52 (Spirit) | <https://www.speedrun.com/Danmaku_Unlimited_3> |
| ZeroRanger | 4 + 4 | 9:45 (White Vanilla), 28:53 to 39:54 (Green Orange) | <https://www.speedrun.com/zeroranger> |
| Crimzon Clover WE | 5 | 32:39 (2P Original) | <https://www.speedrun.com/crimzon_clover_world_explosion_> |
| Drainus | 6 per loop | 38:01 (Loop 1, Easy) | <https://www.speedrun.com/drainus> |
| Truxton II | 7 | 45:41 (2P) | <https://www.speedrun.com/truxton_ii> |
| Sky Force Reloaded | 13 | 58:39 (2P Any%) | <https://www.speedrun.com/Sky_Force_Reloaded> |

Devil Engine has no speedrun board and no dev interview I could find; its store copy says "6 incredibly detailed stages" (<https://gamemaker.io/en/showcase/devil-engine>). Truxton (I) has no board either; the only documented figure is Inoue's remark that Tatsujin-Ou's first stage "took 10 minutes to clear."

### What developers said about length (DOCUMENTED)

Tatsuya Uemura, Toaplan: "We were told to make our games so that 'One credit for 3 minutes', but we said you can't make an interesting game like that." Source: <https://shmuplations.com/toaplan-chronicle/>

ZUN, on why arcade stages are shaped the way they are (my translation): "In the arcade you can't make the first play easy, and if one play is long it doesn't make money, so you have to kill the player character early. Arcades went through a long era of 'one play, three minutes.' So you have to kill them, but kill them too much and nobody plays. The result is that now the rule is roughly to end it around stage 2. It used to be stage 3." Source: <https://www.4gamer.net/specials/shanghai_alice/zone_t.shtml>

ZUN on the full-run length of his own games (my translation): "Before Flower View, clearing takes quite a while. Clearing Normal is about 30 to 40 minutes. Extra alone takes 15 to 20 minutes... Twenty minutes is just right when you can clear it. A game that takes hundreds of tries before you finally clear it is a bit rough at 20 minutes a play." Note the gap between ZUN's 30 to 40 and the 18 to 21 minute records above; his figure is an ordinary player's run with dialogue and deaths. Same source.

Kenichi Yokoo, Raizing: an STG "should take about 30 minutes to clear one loop." Source: <https://shmuplations.com/raizing/>

Junya Inoue, on Batsugun's intent: "like what we learned from Sonic Wings; a speedy feeling where one stage is about one minute, and with a refreshing feeling, where you feel that you accomplished something. Before that, you had Tatsujin-Ou where the first stage took 10 minutes to clear." Source: <https://web.archive.org/web/20060710035820/home.arcor.de/agony_/interviews/guwange.html>

Junya Inoue, on Esprade: "I believe the game balance for arcade shooters hinges most critically on Stages 1 and 2. That's because most casual players... only get to play Stages 1 through 3... if the early stages aren't fun, players won't touch the game again." And, on what he would change in retrospect: "shortening the early stages and shuffling them would keep the game fresh and engaging. Another point is no matter how impressive your visual effects are, players won't notice them unless their hands stop moving." Source: <https://shmuplations.com/esprade/>

Mike Ambrogi, Final Form Games (Jamestown): "We were actually pretty scientific about it... They analyzed their favorite shooters, and timed things like the duration of levels and boss fights. They figured out how much time passed between new gameplay ideas in games like Ikaruga and Dodonpachi. 'There's a good amount of stylistic variation between the classics of the genre, but trends do tend to emerge.'" Source: <https://arstechnica.com/gaming/2011/06/how-the-indie-jamestown-a-2d-shooter-and-instant-classic-was-born/>

### What players prefer (COMMUNITY-MEASURED, shmups.system11.org)

From "How long do you prefer your stages/progression" (<https://shmups.system11.org/viewtopic.php?t=57241>): Squire Grooktook opens with "Most shmups seem to give about 2 minutes for a stage 1." ciox: Psyvariar's stages are "roughly 50 seconds on average" with two 45-second boss phases each, and "you kind of need short stages to keep the whole game at a normal length of 24 minutes"; later, "to stay around 24-25 minutes for a full run which seems to be the favored shmup length." AxelMill: "About two to three minutes is the length I like the most... it isn't a matter of length as much as it is one of pacing and variety." Shepardus: "Garegga and most Touhou games have relatively short last stages to put the focus on the bosses." Several posters name long first stages (R-Type III, Super Aleste, Tatsujin) as off-putting. On stage-to-boss ratio, one poster wants "two thirds stage and one third boss," another "3 minute stage = 2 minute boss."

From "How many levels in a Shmup?" (<https://shmups.system11.org/viewtopic.php?t=68900>): the opener prefers 5 stages "around 25-30 minutes per session"; replies cluster at 15 to 30 minutes and 5 to 7 stages. From "The scrub rules of STG game design" (<https://shmups.system11.org/viewtopic.php?t=74766>): "The ideal length of a game is 20 to 40 minutes."

---

## 2. Stage structure and pacing

### The template, in the words of people who use it (DOCUMENTED)

Sunny Tam, Danmaku Unlimited 3: "Shoot'em ups, traditional bullet hell in particular, have pretty set conventions when it comes to level design. Danmaku Unlimited follows the Cave style so that means stage, midboss, stage, boss. The middle stages can be pretty flexible, while the first stage tends to be the toughest to design as it needs to simultaneously draw the player in visually, presents the mechanics and provide enough excitement without becoming too difficult." Source: <https://www.forgottenworlds.net/bullet-hell-danmaku>

Tam on boss rhythm, same source: patterns "follow the Touhou style of alternating between light and heavy phases... Since the heavy phases are often very claustrophobic, the light phases tend to get the player to move around more and in general offers a bit of respite until the next heavy phase."

Attilio Carotenuto (Himeki Games, An Oath to the Stars), an indie developer's own rule list after studying the genre: open with "an interesting but not too challenging wave"; build "more enemies and different twists to that same mechanic"; "around mid-level... that's the right moment to use a mid-boss, as a climax to reward the user for mastering the new gameplay element"; then mix the new mechanic with old ones; "in the final phase of the level, try to go slower and give the player an interesting challenge. You want to build momentum and anticipation for the final climax... don't rush it"; the boss "should feel like a summary of everything you learned up to that point." Also: "Keep the player busy at all times. Use popcorn enemies to fill blanks." Source: <https://www.gamedeveloper.com/design/designing-smart-meaningful-shmups>

### Where the midboss actually sits (COMMUNITY-MEASURED)

DoDonPachi stage 1: midboss at 0:48 of a 1:20 scroll (60%). Stage 3: midboss at 0:38 of 2:39 (24%). Ikaruga chapter 4: "The Flower" at 0:32 of 3:47 (14%). Garegga stage 3 carries the game's only non-score extend on its midboss; stage 6's midboss is "a wall of turrets" that the wiki says is "particularly difficult at high rank." So the shipped midboss is a punctuation mark placed where the designer wants a tempo change, not a fixed halfway marker. Sources: the video chapter markers above and <https://shmups.wiki/library/Battle_Garegga/Stages>

A player's description of what Cave midbosses are for, from "Midbosses. which is your favorite?" (WarpZone, <https://shmups.system11.org/viewtopic.php?t=45075>): "Cave mid-bosses usually have similar pattern design to the bosses, but the fights are briefer and don't overstay their welcome, feeling more like a quick break from the stage to mix up the pacing and bullet styles but then put you back in the fray without a hitch, and beyond that, they're more likely to overlap with other design elements, like stage enemies continuing to appear during the boss, some interesting resource management situations mid-level that have consequences carrying into the second half." The same poster wishes for "one long, continuous level through smoothly changing scenery and music with mid-bosses studded throughout... with a big multi-phase boss only at the very end," which is close to Hungry Grave's shape and worth knowing exists as a stated desire.

### The pre-boss lull (COMMUNITY-MEASURED, mostly absence)

No developer statement gives a number for the quiet before a boss. What exists: Doctor Butler on Guwange, "a good sense of pacing, with a very brief breather period of minimal enemy fire in between 'waves'" (<https://shmups.system11.org/viewtopic.php?t=58682>); Carotenuto's "go slower" final phase above; and Squire Grooktook's counter-pressure in the same stage design thread, "No dead air either, of course. You should always be doing something," with each challenge switching "before you're fully 'used to it.'" The DoDonPachi chapter markers show the boss following the last wave without a marked gap.

### How waves are authored

**Music first, sometimes.** Masahiro Yuge, Toaplan: "If there's 5 stages in a game, you want the music to bring out each stage's personality and character... There were also times when I'd write a certain melody or rhythm, and then program the enemies to move according to it." Uemura, on his opposite habit: "Depending on the placement of certain enemies, though, I would try to get the chorus or hook of the song to generally align with the stage progression." Source: <https://shmuplations.com/toaplan-chronicle/>. Yuichi Toyama on Garegga: Sakimoto "worked hard to make the stage progression match the music progression... like the music for the part in the third stage, when you can see the 'Donryuu' boss through a break in the clouds." Source: <https://shmuplations.com/raizing/>. Jamestown: "Sometimes, he would score the level we had created... Other times, such as Croatoa, we built the level to match the music." Tam: "probably more like half and half." DOCUMENTED.

**Counted, then obscured.** Iuchi on Ikaruga: "In the beginning, we precisely counted the number of enemies and designed the stages around combos. But that made the perfect route too obvious, and it would make everyone play the same way, so we ended up adding in a lot of undetermined elements... we arranged the stages and enemies so it would be extremely difficult to tell what the 'correct' path was for scoring." And on pacing: "we had a pacing in mind for Ikaruga before we even began making it, a progression along a curve of ups and downs, crescendos and diminuendos. Chapter 1 begins slowly, with an atmosphere of melancholy, then things suddenly burst out... Chapter 2 continues and sustains that mood, before it starts to turn more downtempo at the midway point, and the atmosphere becomes more one of endurance... The pacing and progression follows a 'mountain' and 'valley' curves." Source: <https://shmuplations.com/ikaruga/>. DOCUMENTED.

**Whole picture first, then in order.** ZUN (my translation): "When I decide 'I'll make this stage,' I decide the music, the stage and the flow. They get made in order, from the top... the whole picture is decided first. This character, this music, this background: that's decided at the start." ZeroRanger's eebro: "The game was also designed very chronologically linearly: whatever comes later in the game was also designed later. Though we did go back and touch up on things in the earlier stages as we got better." Sources: <https://www.4gamer.net/specials/shanghai_alice/zone_t.shtml>, <https://www.lost-town.com/ZeroRangerInterview.php>. DOCUMENTED.

**The map is built around placement, and placement has a tempo.** Tsuneki Ikeda on background maps: a delivered map with "castle and cliffs" gets rejected "because they don't work for enemy or item placement... The left/right aspect of map design is something that, if you don't have experience, you won't know how to do. How to make the backgrounds beautiful, and the balance and tempo of the left/right placement are very important." A Cave background artist in the same collection: "A normal stage map will generally take me about a month to complete. If the map is really long, then it might take about a month and a half." Source: <https://shmuplations.com/cavestghistory/>. DOCUMENTED.

**No enemy is an island.** Ambrogi: "In most shooters, the 'family' of enemies in each level, and the way they attack you in a huge variety of combinations, is really the lion's share of the experience of playing that level; it quite literally is the gameplay." Jamestown ships 45 enemy types and 6 bosses across 5 levels. Source: Ars Technica above. DOCUMENTED.

**The weapon shapes the stage.** eebro on a scrapped ZeroRanger weapon: "It got scrapped for serving pretty much no strategic purpose. The charge/lock-on mass destruction weapons worked way better to inform stage design." Source: Lost Town interview above. DOCUMENTED.

**Wave tables, as actually coded.** Every open implementation I found is a scroll-position or time keyed table, not a live director. TheRoboz's R-Type remake: one table per enemy type (hp, size, fire rate, spacing, score) and one row per wave (type, world x, world y, count, bitmask of which members shoot), activated when the camera comes within 128 pixels (<https://theroboz.itch.io/r-type/devlog/253724/enemy-waves-spawning>). Sahnvour's SHMµP: every enemy and wave is a Lua script with hot reload (<https://github.com/Sahnvour/shmup-scripting>). Wayfarer Games' 2026 write-up argues for a command queue keyed by timestamp with blocking commands such as "wait until clear," serialised to JSON so "a typical shmup level [that] might have hundreds of spawns" can be tuned without recompiling, and notes "a full, five-minute level" as the working unit (<https://wayfarer-games.com/blog/shmup-spawning/>). Vampire Survivors and 20 Minutes Till Dawn use per-minute tables the same way; see `survivor-numbers.md`. DOCUMENTED (open code and dev blogs).

### Escalation within a stage versus across stages

**Across stages it is rank, and rank is mostly time-alive and power (DOCUMENTED).** DoDonPachi's rank byte, from disassembly: `+2 per shot power level`, `+1 per laser level`, `+2 per life in stock`, `+1 per bee collected`, `+ frames_since_last_death / 2048` (about +2 per minute without dying), plus a per-stage constant that on Normal runs 16, 20, 24, 28, 32, 36 across the six stages, capped at 63. Source: <https://epozzobon.it/re/ddonpach/>. EoSD: rank 10 to 32, starts at 16, "+1 every 40 seconds, where 4 seconds is subtracted from this interval for every remaining life," items +0 to +2, graze +0.06, extend +2; at the boss "the bullet count difference between minimum and maximum rank can differ by a factor of 4 or more, and bullet movement speeds can double." Source: <https://en.touhouwiki.net/wiki/Embodiment_of_Scarlet_Devil/Gameplay>. Garegga: rank ticks every frame at a base that depends on your autofire rate, and rises on every shot fired, every item collected, every bomb, every bullet sealed; only dying lowers it. Source: <https://www.shmups.wiki/library/Battle_Garegga/Advanced_Rank>.

**Within a stage it is authored acceleration and a difficulty spike at the end (COMMUNITY-MEASURED).** Garegga stage 5 "starts slowly... but accelerates as it progresses, ending with a boss rush"; stage 6 is "the wall." Durandal's walkthrough of a Cave stage in the stage design thread describes the authored curve directly: new enemies "at first" with two shot types, then "the large ships now start coming in more unique formations which require a different approach, and now the newer enemies start get mixed in with the old ones (brief zako and carrier interlude here). And then we top it off with one last large hurdle where three waves of large enemies start attacking in different intervals." Source: <https://shmups.system11.org/viewtopic.php?t=58682>.

**A stage's parts should be legible as parts.** Shepardus, same thread: "Different parts within a stage should also be distinguishable from each other, while following the stage's overarching theme... it also aids with memorization, so players can think 'oh it's this part, then this part, then I need to do this' rather than 'I need to dodge 37 more waves of these enemies... or was it 36?'"

**Ikeda's rule for the extreme mode.** On Mushihimesama Ultra: "It won't be fun if the difficulty gradually ramps up in a half-ass way. It had to be so hard all you could do was laugh, like 'you need to die after 5 seconds of starting' level hard." Source: <https://shmuplations.com/mushihimesamahd/>. DOCUMENTED.

**Pacing was a stated design driver for DoDonPachi's core system.** Ikeda on why the second loop doubles bullets rather than adding suicide bullets: "Dodonpachi is a game of intense, fast-paced shooting and dodging, and that pacing was very important to us. We determined that having to wait and stagger your shooting because of the danger of suicide bullets didn't fit the flow of the game." Source: <https://shmuplations.com/dodonpachi/>. DOCUMENTED.

**ZUN's view of the stage section (DOCUMENTED, my translation).** "I don't deny 'enemy placements you've seen somewhere before.'... But if it makes things monotonous, that's painful. Still, having said all that, in Touhou I hardly think about the fineness of the stage sections. The most important thing in Touhou is the boss fight, so everything besides the boss fights is fairly rough. I doubt anyone puts as much weight on boss fights as Touhou does." He credits Darius Gaiden as the biggest influence, and the interviewer notes that in Darius Gaiden "the scrolling sections are close to filler, and most of the play time is spent on bosses." From part 1 of the same interview: "In Touhou the biggest aim is to make the enemies attractive... to make players practice, the boss itself has to be attractive. So you devise attacks to make it attractive," which is where named spell cards came from. Sources: <https://www.4gamer.net/specials/shanghai_alice/zone_t.shtml>, <https://www.4gamer.net/specials/shanghai_alice/zone_z.shtml>.

**Boghog's workshop (a shmup developer's own theory, DOCUMENTED).** From the Shmup Workshop video transcript: a level should be "one with varied pacing and good cycles of tension and release"; "as long as popcorn enemies keep spawning in players will be forced to move side to side"; "overlapping waves of lower HP enemies give the players more routing freedom and shift focus on dodge while still preserving very high intensity"; "sequences of elite enemy spawns do a good job of creating a main route through the level so they can get boring if not supported by smaller enemies like flying popcorn or ground tanks"; "try to think of the theme of different sections of your levels to prevent them from blending together." And the caution that matters for a game meant to be replayed: "arcade level design is an array of lines stacked vertically, the levels are built for repeated play... even something as minor as ship intro animations add up over the course of many runs." Source: <https://www.youtube.com/watch?v=RENI2gk0ZJA>, companion text at <https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101>.

---

## 3. Enemy count and density

**Ikaruga is the only game with an on-record per-stage count (COMMUNITY-MEASURED).** From the TASVideos maximum-score submission, chains per chapter (TAS, then best unassisted): chapter 1 144 / 138, chapter 2 230 / 220, chapter 3 305 / 287, chapter 4 243 / 239, chapter 5 131 / 117. A chain is three same-colour kills, so the chapters hold at least 432, 690, 915, 729 and 393 killable enemies in a max-kill route. Source: <https://tasvideos.org/4600S>

Against the chapter scroll lengths measured above (2:16, 3:29, 3:29, 3:47), that is roughly 190, 200, 260 and 190 kills per minute of scrolling, or 3 to 4 kills per second, with chapter 3 the densest. INFERRED: chain counts include kills during boss and midboss fights, so the true scroll-only rate is somewhat lower, and Ikaruga's polarity chains reward killing every popcorn, so it sits at the dense end of the genre.

**DoDonPachi hit counts are the nearest proxy and are not enemy counts.** The second-loop entry condition is a maximum chain of 270 (Type A), 300 (B) or 330 (C) hits, but a hit is any chained kill or laser tick on a big target, so it bounds one stage segment, not a stage. Source: <http://shmups.wiki/library/DoDonPachi>. COMMUNITY-MEASURED.

**Mission targets in Bullet Hell Monday bound its stage counts from below (DOCUMENTED, in-game mission table transcribed to the wiki).** Chapter 1 stage missions include "Defeat 3 enemies with bombs," "Items: 20," "Items: 150," "Items: 300"; by chapter 2, "Defeat 30 enemies with bombs," "Items: 1000," "Items: 1800"; by chapter 4, "Convert bullets into items with bombs: 500 bullets," "Items: 3000." Source: <https://shmups.wiki/library/Bullet_Hell_Monday>. Sky Force Reloaded's per-stage medals are percentages ("Destroy 70% of Enemy Forces," "Destroy 100%") rather than counts. Source: <https://sky-force-reloaded-2016.fandom.com/wiki/Stages>

**Density ramps by rank, not only by authored count.** In Garegga, "Between four and six miniature Black Hearts spawn depending on rank," and the wiki uses that spawn as the player's rank gauge. Source: <https://shmups.wiki/library/Battle_Garegga/Stages>. In EoSD, rank multiplies boss bullet counts by up to 4x. In DoDonPachi, the disassembly shows "Spawning, updating, and checking collisions between entities are the main causes of slowdown," and the hardware caps on-screen enemy bullets at 245 (Ichimura, 1998 interview), so density has a hard ceiling that the game visibly hits. Sources above and <https://shmuplations.com/dodonpachi/>. DOCUMENTED.

**Popcorn HP is kept at the minimum.** Boghog's 101: "Enemies, especially popcorn enemies, should not have much more HP than is needed to fulfil their function." Yagawa on his own stage 5 lasers: "I purposely changed them to be destroyed easily... I really hate when enemies are not destroyed even if I keep hitting them over and over." Sources: <https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101>, <https://cave-stg.com/forum/index.php?topic=1286.0>. DOCUMENTED.

I could not find a count for any Cave stage, any Toaplan stage, or any Touhou stage. Touhou's stage scripts have been decompiled by the ReC98 project but nobody has published spawn totals from them.

---

## 4. Power-up and item cadence

**Touhou: per enemy, on a fixed cycle (DOCUMENTED, wiki transcription of shipped behaviour).** In EoSD, "Point Items and Power Items drop from every third enemy defeated," following a repeating 32-entry pattern: 16 small power, 1 large power (worth 8 small), 15 point items. Shot power steps at 8, 16, 32, 48, 64, 80, 96 and 128 (MAX). Once maxed, further power items become score, rising to 51,200 points each. Source: <https://en.touhouwiki.net/wiki/Embodiment_of_Scarlet_Devil/Gameplay>. INFERRED from that table: one cycle of 96 kills yields 24 power, so reaching 128 from nothing takes on the order of 500 popcorn kills, which is why EoSD's power-up arc spans most of the first two stages rather than one wave. Touhou 1 used a hidden counter that drops a point item every tenth card flip and a bomb at 140. Source: <https://rec98.nmlgc.net/blog/2021-09-28>

**Cave: per carrier, a handful per stage (DOCUMENTED and COMMUNITY-MEASURED).** DoDonPachi: "It takes 4 power-ups to reach full power. Dying will reduce the player's strengthened weapon by one level and the non-strengthened weapon reverts back to level 1." Bombs start at 3, and stock rises by one per death to a cap of 6. A Max Power item "only appears after the player loses their last life." Bees are the stage's collectible rhythm: 13 hidden per stage, uncovered by lasering the spot, worth 100 to 100,000 in sequence. Source: <http://shmups.wiki/library/DoDonPachi>. Iuchi's counter-position at Treasure: "The reason I didn't include items in Radiant Silvergun is simply that when I play STGs, items are very frequently the stupid cause of my death." Source: <https://shmuplations.com/radiantsilvergun/>

**Raizing: per enemy, dense, and every pickup costs rank (COMMUNITY-MEASURED, shmups.wiki).** Garegga stage 1 opens with "three sets of idle tanks, a set of 12 on the right followed by a set of 10 on the left and a set of 8 on the right (30 total). Each tank drops a small weapon fragment when destroyed." Minecarts drop an option or a fragment depending on the kill order; a biplane drops a secret large shot if killed as it flees. Stage 1 "serves mostly as an opportunity to power up and gather resources for key tricks in stage 2." The rank page documents that a small shot power-up that levels the main shot adds +1 frame rank permanently, and "collecting a shot power up, option, or weapon fragment at max capacity... will increase the value added to rank." Sources: <https://shmups.wiki/library/Battle_Garegga/Stages>, <https://www.shmups.wiki/library/Battle_Garegga/Advanced_Rank>. Toaplan's Uemura on Kyuukyoku Tiger's yellow four-way "penalty" shot appearing right after the useful blue spread: "That wasn't the case, but it ended up being part of the game's style," and "People would also often say that we purposely programmed power-ups to move away from the players, but we didn't do that intentionally." Yuge admits the Kyuukyoku Tiger item swirl came from a ramen bowl. Source: <https://shmuplations.com/toaplan-uemura/>, <https://shmuplations.com/toaplan-yuge/>. DOCUMENTED.

**Scoring pace as stage rhythm (COMMUNITY-MEASURED and DOCUMENTED).** Garegga's medal chain must be kept alive across a whole stage: "Keeping a live medal chain throughout the stage can be a decent challenge," gunblimps carry 8 medals each, the stage 3 rail "is quite long" and reveals four medals per segment, and the stage 4 dock rails release 7 to 8 medals each that "fall off the screen and have to be caught to avoid a broken medal chain." DoDonPachi's chain meter drains between kills, so its stages are authored as runs of kills separated by gaps where the chain drops unless a laser target is available. Ikaruga's chain is three same-colour kills and the stage was designed around it. Crimzon Clover lets the player pick a 1UP or score bonus at the end of each stage; Yotsubane: "I made sure that the game players can choose either 1UPs or a higher score at the conclusion of each level... I want players to think: 'It was my own fault that the game is over because I didn't take the 1UP that last time.'" Sources above and <https://shmups.system11.org/viewtopic.php?t=38526>.

**Item shops break stage flow.** Housemarque cut Resogun's weapon shop because "it severely affected the pacing of the game: just as the intensity was ramping up and the player was getting into the flow" the shop interrupted it. Source: <https://www.gamedeveloper.com/business/the-game-is-the-boss-a-i-resogun-i-postmortem>. The shmups forum's "scrub rules" list the same: "No item shops. They interrupt the action." DOCUMENTED and COMMUNITY.

---

## 5. Mobile and browser portrait shmups

**Bullet Hell Monday** (Masayuki Ito, 2016 mobile, 2022 Steam). The developer's own Steam release text (via 4Gamer, my translation): "Chapter Mode: a mode where you clear short stages in order. Clear the missions and move on to the next stage. It starts from gentle stages, so you can improve little by little." Structure from the shipped mission tables: 5 chapters of 10 stages, the tenth stage of each a boss fight; chapter mode has no rank system; a chapter 2 mission is "Clear the level within 25 sec." TouchArcade counts "more than 50 stages" and notes the gating: "You can only proceed to the next stage if you've earned enough mission points." Sources: <https://www.4gamer.net/games/633/G063378/20220905064/>, <https://shmups.wiki/library/Bullet_Hell_Monday>, <https://toucharcade.com/2016/10/04/bullet-hell-monday-review/>. DOCUMENTED.

**Phoenix 2** (Firi Games, 2016). "New missions are generated daily"; "Each of the generated missions is a unique configuration of enemy ships and players need to destroy them all to complete the mission." The wiki: "Daily missions occur every day with 20 waves (16 waves from B league and below)"; community missions every 3 days with 24 waves. So the unit of play is a wave list, not a scrolling stage, and the boss-shaped enemies are just the last waves. Sources: <https://en.wikipedia.org/wiki/Phoenix_2>, <https://phoenix-2.fandom.com/wiki/Mission>. DOCUMENTED (Wikipedia) and COMMUNITY-MEASURED.

**Sky Force Reloaded** (Infinite Dreams, 2016). 13 main stages plus 3 bonus stages; each has four difficulty tiers and medals for 70% and 100% destruction, rescuing all survivors, and taking no damage; "Most Stages feature a single colossal Boss at the end, though a few Stages have none or semi-powerful Mini-bosses instead." Per-stage record times 2:48 to 7:15 (section 1). HowLongToBeat: 16 hours main story, 24.5 hours main plus extras, because stages are replayed for stars and medals. Sources: <https://sky-force-reloaded-2016.fandom.com/wiki/Stages>, <https://www.speedrun.com/Sky_Force_Reloaded>, <https://howlongtobeat.com/game/27055>. COMMUNITY-MEASURED. A developer statement on stage length was not found; Pocket Gamer and TouchArcade coverage is announcement-level.

**1945 Air Force** (OneSoft, 2019). Campaign stages grouped ten to a chapter, with "stages ending in 4, 7, and 0 are boss battles"; a submarine "Assault" mission has "a time limit of 3 minutes," with reinforcements "at about 30 second intervals"; PvP "Onslaught" is 3 minutes. Source: <https://en.namu.wiki/w/1945%20Air%20Force>. COMMUNITY-MEASURED.

**Danmaku Unlimited 3** (mobile and PC). Five stages, 23:52 for a full Spirit run at record pace. Sunny Tam on the lower difficulties: "it can be tricky to maintain the level of excitement and visual density when there are fewer bullets on screen... simply reducing the number of bullets in the pattern wasn't enough, but changing the pattern too much ruined the look/feel." His answer was the graze system, which leaves dead enemies' bullets on screen as harmless "ghost" bullets to keep density up. Sources: <https://twobeardgaming.wordpress.com/2021/02/27/interview-sunny-sy-tam-danmaku-unlimited-3-developer/>, <https://www.gameskinny.com/culture/interview-with-sunny-tam-the-mind-behind-danmaku-unlimited-3-and-maestro-of-modern-bullet-hell/>. DOCUMENTED.

**The one developer prediction about mobile pacing** is Cave's Ichimura in 2012: "There won't be many of the kind of hardcore games you see in game centers, but things will probably be more like the smartphone games you can casually play anywhere." Source: <https://shmuplations.com/cavestghistory/>. DOCUMENTED.

INFERRED across these: mobile portrait shmups keep the arcade stage's internal shape (waves, midboss or none, boss) and cut the unit of commitment to 25 seconds to 5 minutes, then replace the 20-minute credit with a meta loop (missions, medals, daily leaderboards). None of the developers explained the numbers.

---

## 6. How stages were playtested and tuned

**Toaplan (DOCUMENTED, <https://shmuplations.com/toaplan-uemura/> and <https://shmuplations.com/toaplan-chronicle/>).** Uemura: "we wanted to make our vertical shooters easier too, so we'd initially make them quite easy for our location tests, but then someone would 1cc them in one day and we'd end up dramatically raising the difficulty level." Also: "Balancing the difficulty started to get more and more difficult, and players were getting better and better. After the location tests we'd spend a lot of time upping the difficulty." Yuge measured a location test by the coin box: "When I saw the 100 yen coins piling up at the location test, I was truly happy." Uemura on bombs: designed for aggressive use, "but in the end skilled players wouldn't use them... They'd clear the stage without using a bomb for score."

**Cave (DOCUMENTED).** Ichimura: "For the arcade games, [difficulty] usually gets set after the first location test. We use about a 3 minute portion of the game as a base, and set the difficulty from there." Source: <https://shmuplations.com/cavestghistory/>. Kouyama, DoDonPachi: "At first it's done in parallel with the rest of the development, by the programmers themselves who test for bugs and adjust the difficulty as they go. Then, 2 to 3 weeks before the master app is due, we use that time to playtest extensively and debug." Source: <https://shmuplations.com/dodonpachi/>. Ikeda: "our usual workflow is to tune everything up after the location test... that final balancing is critical... the final phase of a development is just a whirlwind of adjustments." On Dangun Feveron, "the stats from the location tests weren't that encouraging, and the team realized they had to do something," and the system "changed 5 or 6 times." Source: <https://shmuplations.com/cave15th/>. The one recorded iteration count for a stage is Inoue's, and it is a failure: on his first Toaplan game "I was late recognizing that the balance between the map design and difficulty level didn't match. While placing each enemy and cannon one by one, you have to check it against the game system. However, I just kept drawing one after another." Source: Guwange interview above. Ikeda also describes DoDonPachi's unusually "lengthy and overall relaxed development" as what made "difficulty balance, enemy placement, and danmaku patterns" feel complete. Source: <http://shmups.wiki/library/DoDonPachi> (history section, citing Ikeda).

**Yagawa (DOCUMENTED, <https://cave-stg.com/forum/index.php?topic=1286.0>).** "The benchmark for game balance is simple. It is myself... when I see others playing the game, it's not that I do absolutely nothing... I observe such opinions when they come out, I decide myself (if any are worthwhile), then I implement changes." He watched the Daifukkatsu superplay DVD before starting Black Label and found the hyper play "uninteresting," which set his direction.

**ZUN (DOCUMENTED, my translation, <https://www.4gamer.net/specials/shanghai_alice/zone_t.shtml>).** "The simplest, clearest criterion is whether I get angry playing it myself. If I get angry, I delete it. Or rather, thinking about how to get around that spot without it making you angry produces all sorts of ideas. Whatever else, the creator has to play it themselves, a lot." His acceptance test for a death: "The ideal is that at the instant of a miss, any player can understand the solution... Even a simple control error is not an acceptable death unless the player can understand 'I moved too much' or 'I moved too late.'" On random spawns: "Random stages are the worst of it, luck decided per stage, that's no good."

**Treasure (DOCUMENTED).** Iuchi on Ikaruga's prototype: "I tend to prefer very stiff, rigid gameplay systems, but our programmer Atsutomo Nakagawa thought that it would be better if the game could be played in a more rough, casual style. We revised quite a few things." On Radiant Silvergun: "We also deliberately made the bullets slow. If you're going for a gameplay style that involves threading through tiny cracks in bullet curtains, then a slower bullet speed will allow a wider audience to enjoy the pleasure of bullet dodging." Sources: <https://shmuplations.com/ikaruga/>, <https://shmuplations.com/radiantsilvergun/>.

**Jamestown (DOCUMENTED, Ars Technica above).** "We found that the best way to create a smooth level flow is to test the gameplay over and over, on your own and with blind testers, and think consciously about the intensity curve... We were revisiting and tuning placements, health totals, movement speeds, and bullet patterns right up to the day of the gold master, because our clarity was constantly improving on what did and didn't work." The credits list more testers than any other role. The engine was built so "reducing the cost of iteration was a primary goal" and they ran through "a 'frankly huge' number of bad ideas." In the shmuplations interview Ambrogi adds: "Personally, I think the #1 challenge for any game is getting the game balance right... something we grappled with through the entire development." Source: <https://shmuplations.com/jamestown/>

**Indies on public builds (DOCUMENTED).** ZeroRanger's eebro: "The first build of FINAL BOSS was very rough and we got some valuable feedback for future direction from it on the System11 shoot 'em up forums. As we kept building the game, we kept releasing occasional builds to test how the changes worked... I don't think the game's direction drastically changed due to those comments, more just polishing things." The big changes "came from either of the developers 'growing out' of some aspects of the game," and they have "dedicated playtesters." Source: <https://www.lost-town.com/ZeroRangerInterview.php>. Blue Revolver's Danbo posted "a small 1-stage demo intended as a vertical slice" to the same forum in January 2015: "game/level/boss design feedback is obviously what i'm most interested in from system11," then shipped 0.15 with "a bunch of feedback, overhauls and fixes" two weeks later, including a safe spot a tester found ("how embarrassing"). Source: <https://shmups.system11.org/viewtopic.php?t=52710>. Yotsubane (Crimzon Clover): "As far as adjusting levels of difficulties goes, I asked a lady friend of mine who likes shooting games to help me with play-testing," after five years of solo development; he had previously been a Cave playtester. Sources: <https://shmups.system11.org/viewtopic.php?t=38526>, <https://www.pcgamer.com/revisiting-crimzon-clover-a-shmup-that-rivals-the-genres-best/>

**Housemarque (DOCUMENTED).** "We'd invite people from outside the company to test the game with new eyes, and we'd pay close attention to their initial reactions and feedback"; the single-life survival mode was kept over "a lot of criticism for this choice, both from test players and from our publisher." Source: Resogun postmortem above.

**What was measured, tallied across the sources:** coin income at location test (Toaplan); "stats from the location tests" (Cave, unspecified); where the average credit ends, stage 2 versus stage 3 (ZUN, arcade convention); whether a location-test build was 1CC'd within a day (Toaplan); a 3-minute sample of play as the difficulty baseline (Cave); duration of levels and bosses and time between new ideas in reference games (Jamestown); the designer's own anger at a death (ZUN) and the designer's own clear (Yagawa); superplay DVDs (Yagawa). Nobody in these sources reports deaths per section or bomb usage as a tracked statistic; Uemura's bomb observation is anecdotal.

---

## What this implies for Hungry Grave (INFERRED throughout)

**Five minutes is inside the shipped band for a single stage, at the long end.** Shipped stages including their boss run about 2 minutes (every first stage measured, Batsugun's early stages, Psyvariar) up to 5 to 8 minutes (Garegga 5 and 6, Crimzon Clover 3 to 5, Blue Revolver 5, Sky Force 8 and 13, Deathsmiles' final). A 5-minute stage with a 1-minute boss is the shape of a fourth or fifth stage in a Cave or Raizing game, not a first stage. The genre's first stages are short on purpose (Inoue: casual players only see stages 1 to 3; the forum: long first stages are "off-putting"). Since Hungry Grave's one stage is also its first stage, the precedent pulls in two directions: the whole-run length is far below the 15 to 40 minute band, and the single-stage length is above the first-stage band. The design question this raises is whether the first 90 seconds behave like a first stage (draw in, teach, low threat) while the back half behaves like a fourth stage.

**The 3.5-minute scroll to 1-minute boss ratio (78:22) is ordinary.** DoDonPachi's stages sit at 63:37 to 80:20 scroll to boss; the forum's stated preference is two thirds to one third. A 1-minute boss is short by Cave standards for a stage-ending boss (their stage 3 to 6 bosses run 1:01 to 1:35 in a competent run) and long for a first-stage boss (0:45). Ikaruga's bosses are timed and end on their own; Touhou's bosses are the entire point and are also timed per attack. If the boss is meant to carry the authored bullet-hell identity, precedent says it can be longer than the scroll ratio suggests, provided it has phases (the forum: a boss "longer than a minute or so... definitely needs to have some progression to it").

**A 30-second midboss at 2:00 is at 57% of the scroll, which matches DoDonPachi stage 1 (60%) and not its stage 3 (24%).** Shipped midbosses are placed where the designer wants a tempo change rather than at the arithmetic middle. What the precedent stresses about midbosses is overlap: stage enemies keep spawning during the fight, and the fight's outcome carries resources into the second half (WarpZone's description of Cave). A midboss that clears the screen and runs alone is the thing the Cave model avoids.

**The 17-second silence before each boss has no shipped precedent I could find, and the direction of the evidence is against long silences.** The Cave chapter markers show bosses arriving directly after the last wave. The one qualitative description of breathers (Guwange) calls them "very brief." Carotenuto's advice is to "go slower" before the boss, not to go silent. Squire Grooktook's rule, "No dead air either," is the community norm. ZUN warns that small pauses "add up over the course of many runs" in a game built for repetition, and Boghog says the same of intro animations. A slow, sparse final wave (Carotenuto's "interesting challenge... give them enough time to think") is what the precedent describes; silence is the extreme end of it, and the players who replay the stage will feel every second of it.

**Density: the storm should arrive as count, not as tougher trash, and the count ceiling is real.** This matches the survivor-likes finding in `survivor-numbers.md`, and the shmup side adds that popcorn HP is kept minimal (Boghog, Yagawa), Ikaruga runs 3 to 4 kills per second when it wants density, and DoDonPachi's hardware cap of 245 bullets is a visible wall. For Hungry Grave's storm, the questions the precedent raises are what the on-screen cap is, whether the stage ever hits it, and whether density is authored per wave or ramped by a hidden rank tied to survival time and power, which every arcade example does.

**Item cadence should be per enemy or per carrier, and the two shipped models produce different first minutes.** Touhou's every-third-enemy cycle makes power a slow accumulation across two stages; DoDonPachi's four carriers make it a handful of events; Garegga makes every pickup a cost. Hungry Grave's corpses-as-power is closest to Touhou's model. Touhou's cycle also implies a number: roughly 500 kills to max, which at Ikaruga-like rates is two to three minutes of scrolling. That is the same span as the scroll before the midboss.

**What a designer would measure to know the stage is right, from these sources:** where the median first credit ends (ZUN's stage 2 rule, translated to a timestamp); whether any tester clears it on day one (Toaplan's signal to raise difficulty); a 3-minute sample as the difficulty baseline (Cave); the time between new gameplay ideas across the scroll, against the 2 to 3 minute stage rhythm Jamestown timed in Ikaruga and DoDonPachi; scroll-to-boss and midboss-position ratios against the tables above; whether skilled players stop using bombs (Uemura); and the designer's own reaction to each death, with ZUN's test that the fix must be legible at the instant of the miss. The existing tape and bot give the deaths-per-section number nobody in these sources had; the precedent's contribution is the thresholds to compare it against.

---

## Could not source

- A developer statement giving the reason for a specific stage length in minutes, beyond Inoue's "about one minute" for Batsugun and the arcade "3 minutes per credit" constraint. Nobody says why a stage is 3 minutes rather than 4.
- Any published measurement of a pre-boss lull.
- Enemy counts for any Cave, Toaplan, Raizing, Touhou, or modern indie stage other than Ikaruga. Bullet Hell Monday's item-count missions bound its stages from below only.
- Any Devil Engine developer interview, run timing, or speedrun board. Coverage found is reviews and the publisher dispute.
- Any Sky Force, Phoenix 2, or 1945 Air Force developer statement on session or stage length.
- Any Drainus developer statement on stage design; the Edge piece fetched was a stub and the podcast episode was not transcribed.
- A ZeroRanger statement on stage length or pacing; the Aalto talk page links three Games Now videos that turned out to be other speakers.
- The Blue Revolver "Design of Blue Revolver" video interview with Danbo; the aggregator page did not expose the video URL.
- Per-stage timings for Mushihimesama, ESP Ra.De., Touhou, ZeroRanger, Jamestown, and Danmaku Unlimited 3; only whole-run records are given for those.
- Any tracked bomb-usage or deaths-per-section statistic from a shipped shmup's developer.
