# Stage length with a director: how much room a pacing cycle needs, and what long stages cost

Research for Hungry Grave. Labels: **DOCUMENTED** = a developer statement, a shipped data or script file, decompiled code, a disassembly, or a convar default read from the shipped binary. **COMMUNITY-MEASURED** = chapter markers on published one-credit runs, wiki transcriptions, forum reports, speedrun boards. **INFERRED** = my reading across sources.

The question this answers: is a longer single stage what makes a Left 4 Dead style director work, and if so how much longer. A director needs room to run build up, peak, relax and sustain, and five minutes may not hold two cycles.

This sits beside [director-precedent.md](director-precedent.md), [shmup-stage-design.md](shmup-stage-design.md), [progression-tuning-precedent.md](progression-tuning-precedent.md), [reward-delivery-models.md](reward-delivery-models.md) and [survivor-numbers.md](survivor-numbers.md). Those already hold the Left 4 Dead intensity signal and its four states, the arcade rank formulas, Vampire Survivors' per-minute Mad Forest schedule, the survivors-like run lengths, the per-carrier item models, and Iuchi's mountain-and-valley statement. Anything there is cited, never repeated. The new ground here is the arithmetic of cycles against stage minutes, the shipped long stages measured from chapter markers, and the forum record of exactly what made a long shmup stage bad.

Two facts carried throughout, both from the siblings: power arrives from authored carrier mobs the director never spawns, and the stage today is five minutes with a miniboss, two drain-outs and a final boss (ADR 0047, `docs/design/game-concept.md`).

---

## What is solid

These are the claims I would build on.

1. **A Left 4 Dead pacing cycle is bounded below by the mob clock, and that clock is 90 to 180 seconds on Normal.** `z_mob_spawn_min_interval_normal` is 90 and `z_mob_spawn_max_interval_normal` is 180 in the shipped binary, matching Booth's deck. The other three states are much shorter: Sustain Peak 3 to 5 seconds, Peak Fade at minimum 8 seconds (a 5 second hold plus 3 seconds of the 30 second linear decay to fall from 1.0 under 0.9), Relax 30 to 45 seconds. So the state machine's floor is roughly 45 to 60 seconds and its working period is the mob clock, one to three minutes. DOCUMENTED (convar defaults, deck, disassembly, all in director-precedent.md).

2. **The relax is shorter in practice than its own timer, because travel ends it first.** `director_relax_max_flow_travel` defaults to 3000 units and a healthy survivor runs at 220 units per second, so a team that keeps moving leaves Relax in about 14 seconds rather than 30 to 45. DOCUMENTED (convar default, <https://www.gamerconfig.eu/command/left-4-dead-2/director_relax_max_flow_travel/>; survivor speed COMMUNITY-MEASURED). Booth named this as the anti-rushing counter, not as a shortening, but the arithmetic is the arithmetic: a moving player gets a shorter valley.

3. **Hungry Grave's five minutes contains under three minutes the director may touch.** ADR 0047 puts boss phases, the drain-out and the Wall off limits. The stage is about 30 seconds of Banshee, about 60 seconds of Undertaker and two drain-outs measured at 15.0 to 15.5 seconds (`docs/design/game-concept.md`, `docs/design/tracer-plan.md`). That is roughly 2:02 of off-limits time before the Wall, leaving about 2:58 of directed scrolling. INFERRED from those DOCUMENTED figures.

4. **At the working period, five minutes holds one to two cycles and eight minutes holds two to four.** Table below. The number that matters is directed minutes, not stage minutes, and the off-limits overhead does not shrink when the stage grows.

5. **No shipped director lives in a unit shorter than a Left 4 Dead chapter, and a chapter is four to fifteen minutes.** Already in director-precedent.md as claim 12. Nothing found since changes it.

6. **The one long first stage the shmup community defends is Radiant Silvergun's, and the defence names the mechanism.** Shepardus: "Radiant Silvergun's the only game I can think of that gets away with a really long first stage, though it divides stages into shorter substages." Measured from two independent 1CC runs, that stage is 9:35 to 10:30 and holds five sub-stages of 1:07 to 3:17, each ending in a named boss, a Boss Report tally screen and a new stage screen. COMMUNITY-MEASURED (chapter markers) plus DOCUMENTED (shmups.wiki transcription of shipped behaviour). Each sub-stage is exactly the ordinary shipped stage length from shmup-stage-design.md, so a long stage on record is a chain of ordinary stages, not one long one.

7. **Long stages ship and are well liked in the home-console lineage.** Einhänder's seven stages run 5:33 to 10:12 each, measured across two full runs. Ikaruga's five chapters are 3:12, 4:16, 4:43, 5:42 and 3:26. Radiant Silvergun's stage 4 is 20:16 in one sitting. COMMUNITY-MEASURED (chapter markers, cited below). All three are console or console-derived games with lives, continues and no coin clock.

8. **The forum record's causes for a bad long stage are content causes, not pacing causes, and two of the six posters disagree that length is the cause at all.** What is named: a stretch spent on something that is not play (R-Type III's "10-minute-long tech demo for Mode 7"), repetition of waves and scenery (Tatsujin-Oh), too few scoring opportunities for a skilled player, and the learning cost of a long stage where "progress grinds to a halt." Against that, system11: "I don't even mind really long stages as long as there's some variation," and Despatche: "Tatsujin Ou's stages are too long, but at least they're interesting." COMMUNITY-MEASURED, quotes and URLs below.

9. **Nothing on record says a director's relax cures a long-stage complaint, because no shmup has ever run a director inside a stage.** Rank is the only in-stage adaptive system in the genre and it never relaxes: it rises with survival time and power and falls only on death or a hit (director-precedent.md claim 10). Booth's own statement is the reason to expect a relax not to help here: "Algorithm adjusts pacing, not difficulty. Amplitude (difficulty) is not changed, frequency (pacing) is." The complaints in claim 8 are amplitude and content, which a director does not touch. DOCUMENTED (Booth) plus INFERRED (the mapping).

10. **A survivors-like run is a long single stage and it holds up, but it is chopped.** Brotato's 17.5 minutes of wave time is 20 discrete waves of 20 to 90 seconds with a shop after every one. Vampire Survivors runs 30 unbroken minutes on a per-minute authored table whose density curve is deliberately non-monotonic. 20 Minutes Till Dawn's developers patched a mid-run trough in at 8 to 10 minutes on purpose. DOCUMENTED (all in the siblings, cited not repeated).

11. **The one documented complaint about a 15 to 30 minute run got a shipped answer, and the answer was to shorten the clock and raise density together.** Halls of Torment's Hastening Sands artifact cuts 10 minutes off the 30 minute run, adds +30% enemy spawn rate and +20% movement speed to everything. DOCUMENTED (<https://hot.fandom.com/wiki/Artifact>). The developers did not move the base run length.

12. **A longer stage does not automatically buy more power, because power is authored per carrier and every shmup on record puts its ceiling in the first stage or two.** DoDonPachi reaches full power in exactly four power-ups; Truxton, Fire Shark and Gradius all author a per-carrier cycle table (reward-delivery-models.md, progression-tuning-precedent.md). Whether a longer stage means more drops or a longer flat stretch is a separate authoring decision from the length itself.

13. **Hungry Grave's current stage does not deliver its own intended drop count, and the shortfall is proportional to length.** ADR 0013 asks for ten to twelve drops; a measured full run on real weapons produces 23 to 42 kills and 3 to 5 drops against a price table fitted to 268 authored mobs (`docs/design/tracer-plan.md`). At the same carrier density, doubling the stage's length reaches the recorded target without touching the price table. DOCUMENTED (the measurement), INFERRED (the proportionality).

14. **The shipped answer to a longer stage is more punctuation at the same cadence, never one punctuation pushed later.** Radiant Silvergun puts five bosses in its ten-minute first stage, one every two minutes. Brotato puts a shop after every 20 to 90 second wave and a boss every ten waves. Midboss placement in the arcade games is not proportional (DoDonPachi stage 1 at 60% of the scroll, stage 3 at 24%, Ikaruga chapter 4 at 14%), so the midboss is a tempo change placed where the designer wants one, and a longer stage wants more of them. COMMUNITY-MEASURED and DOCUMENTED, per shmup-stage-design.md and the markers below.

---

## 1. What length a director's wave needs

### The cycle, assembled from the shipped numbers (DOCUMENTED)

All four states and their thresholds are in director-precedent.md. What that record did not do is add them up. Doing so:

| Part | Duration | Source |
|---|---|---|
| Build Up | until max survivor intensity crosses 0.9; unbounded, in practice paced by the mob clock | deck, disassembly |
| Mob clock (Normal) | **90 to 180 s** between mobs of 20 to 30 | `z_mob_spawn_min_interval_normal 90`, `_max_ 180` |
| Sustain Peak | **3 to 5 s** | `director_sustain_peak_min_time 3`, `_max_time 5` |
| Peak Fade | at minimum **8 s** (5 s hold plus 3 s of the 30 s linear decay from 1.0 to 0.9), longer if combat continues | disassembly, `intensity_decay_time 30` |
| Relax | **30 to 45 s** by timer, or **about 14 s** if the team keeps running | `director_relax_min_interval 30`, `_max_interval 45`, `director_relax_max_flow_travel 3000` at 220 units/s |

Two periods fall out, and both are worth carrying because they bound the answer from opposite sides.

The **floor**, everything at minimum and the player moving: roughly 45 to 60 seconds. The **working period**, bounded by the clock on the director's biggest pressure event: 90 to 180 seconds. Vermintide 2 and Darktide are slower still, at 50 to 70 and 65 to 100 seconds of relax alone (director-precedent.md). So one to three minutes per cycle is the industry-standard figure, with a floor near a minute.

Verification: `curl -s https://www.gamerconfig.eu/command/left-4-dead-2/<convar>/ | grep -o 'Default value:</b>[^<]*'` for each of `z_mob_spawn_min_interval_normal`, `z_mob_spawn_max_interval_normal`, `director_relax_min_interval`, `director_relax_max_interval`, `director_relax_max_flow_travel`.

### Cycles per stage length (INFERRED from the DOCUMENTED numbers above)

Hungry Grave's off-limits overhead, held constant at about 2:02 (a 30 second miniboss, a 60 second boss, two 16 second drain-outs) plus the Wall. The 15 minute row assumes a second miniboss and its drain-out, per the punctuation cadence in claim 14, so its overhead is about 2:48.

| Stage clock | Directed minutes | Cycles at the 50 s floor | Cycles at 90 s | Cycles at 180 s |
|---|---|---|---|---|
| **5:00** (today) | **2:58** | 3.6 | **2.0** | **1.0** |
| 8:00 | 5:58 | 7.2 | 4.0 | 2.0 |
| 10:00 | 7:58 | 9.6 | 5.3 | 2.7 |
| 15:00 | 12:12 | 14.6 | 8.1 | 4.1 |

Read the 90 and 180 second columns, not the floor column: the floor requires the player to be pressed hard enough to saturate intensity immediately and to keep moving through the valley, which is the fast end of the fast end.

**Five minutes holds one to two cycles.** That is one build up, one peak, and one valley, with the valley likely landing on or beside the drain-out the director is forbidden to touch. Eight minutes is the first row where two full cycles clear even at the slow end, so it is the first length at which a player can see a valley with a peak on either side of it and read it as pacing rather than as the stage.

### Left 4 Dead chapters, for the same comparison (COMMUNITY-MEASURED)

A campaign is 20 to 75 minutes over five chapters, so four to fifteen minutes per chapter, with a typical chapter near eight to ten. At the 90 to 180 second working period that is **2.7 to 6.7 cycles per typical chapter**, and 1.3 to 10 across the whole range. The lower end of that range is a chapter Valve pads with crescendo events and finales, during which the director is quieted outright (`director_quiet.nut`, `ProhibitBosses = true, SpecialRespawnInterval = 999999, CommonLimit = 0`), so the directed minutes of a chapter are less than its clock for exactly the reason Hungry Grave's are. Source for chapter length: <https://en.wikipedia.org/wiki/Left_4_Dead>; the script and quieting rule are in director-precedent.md.

The honest reading: Left 4 Dead's own unit of play sits at roughly three to seven cycles, and Hungry Grave at five minutes sits at one to two. Eight to ten minutes puts Hungry Grave inside Left 4 Dead's own band.

---

## 2. Long single stages and long runs that shipped

### Radiant Silvergun (COMMUNITY-MEASURED chapter markers, DOCUMENTED structure)

Two independent 1CC runs, both with per-sub-stage chapter markers. Run A is <https://www.youtube.com/watch?v=2u61v_yTBXw> (commentary 1CC, Stage 2 route); Run B is <https://www.youtube.com/watch?v=rsxfW0KubZM> (Steam arcade 1CC, 22,686,270 points, Stage 4 route).

| Stage 3 (the game's first stage) | Run A | Run B |
|---|---|---|
| 3A (boss AKA-O) | 1:15 | 1:07 |
| 3B (MIKA-L) | 2:30 | 2:20 |
| 3C (GALLOP) | 2:08 | 1:53 |
| 3D (UNDO) | 1:20 | 1:25 |
| 3E (UE2A-GAL) | 3:17 | 2:50 |
| **Stage 3 total** | **10:30** | **9:35** |

Other stages, from the same runs: Stage 2 is 13:14 across five sub-stages (2:24 to 3:01 each); Stage 4 is **20:16** across five sub-stages (1:57 to 5:46 each); Stage 5A is 5:11 to 5:25 as a single sub-stage; Stage 6A is 3:33 to 5:28 as a single sub-stage.

The mechanism, in the wiki's own words: "each divided into sub-sections discriminated by letters (e.g. 3C, 5A). Your chain does not carry over on each sub-section of a stage, and you can determine a stage has ended when you see the boss tally screen at the end of the every boss fight, followed by the new stage screen, listing the sub-section, current time of events and descent point." Source: <https://www.shmups.wiki/library/Radiant_Silvergun>.

Three things travel from that. The boundary carries a **boss**, a **scoring reset** and a **named screen**, so it is unmissable. The sub-stages are **1:07 to 3:17**, exactly the shipped arcade stage length in shmup-stage-design.md. And a ten-minute first stage therefore contains five bosses, one about every two minutes.

### Ikaruga (COMMUNITY-MEASURED chapter markers)

From a Normal 1CC at 19 million, <https://www.youtube.com/watch?v=icQCUur6M24>:

| Chapter | Title | Start | Length |
|---|---|---|---|
| 1 | Ideal | 0:00 | 3:12 |
| 2 | Trial | 3:12 | 4:16 |
| 3 | Faith | 7:28 | 4:43 |
| 4 | Reality | 12:11 | **5:42** |
| 5 | Metempsychosis | 17:53 | 3:26 |
| Epilogue | | 21:19 | |

Note the shape: the first chapter is the shortest of the four scrolling chapters, the fourth is the longest, and the last drops back to 3:26 to put the weight on the boss. That is the same last-stage rule Shepardus states for Garegga and Touhou. Chapter names confirmed at <https://shmups.wiki/library/Ikaruga>; each chapter opens with a title card and a short preamble.

Ikaruga's chapters are meaningfully longer than the arcade standard of two to four minutes, and it is the one game in this record where the pacing curve is on the developer's own record as preceding the content (section 4).

### Einhänder (COMMUNITY-MEASURED chapter markers)

Two independent full runs: A is <https://www.youtube.com/watch?v=U5A-WXMUJOA> ("Full Run ALL Clear"), B is <https://www.youtube.com/watch?v=XDmqKobR69U> (longplay).

| Stage | Run A | Run B |
|---|---|---|
| 1 | 5:33 | 5:58 |
| 2 | **8:14** | **8:33** |
| 3 | 6:08 | 7:12 |
| 4 | 7:13 | 9:22 |
| 5 | 9:12 | **10:12** |
| 6 | 7:13 | 7:34 |
| 7 | (run ends) | 4:23 |

Caveat that matters: the markers sit at stage boundaries, so they include Einhänder's in-stage radio dialogue and its between-stage cutscenes, which the arcade figures in shmup-stage-design.md do not have. The pure play time is shorter than these numbers. Even discounted, the stages are two to three times the arcade standard, and the game is well regarded.

Einhänder also carries the counter-position on stage boundaries, from the same forum thread as the pushback. AxelMill: "I think the lack of any kind of stage transitions give an equal, or even better, feeling of a journey. Einhander or Rayforce are shining examples of this, and I wish more games did that." So the record holds two shipped answers, hard punctuation (Radiant Silvergun) and continuous travel (Einhänder, Rayforce), and both have defenders in the same thread.

### Survivors-likes at 15 to 30 minutes

Run lengths, level-up rates and the per-minute schedules are in progression-tuning-precedent.md and survivor-numbers.md and are not repeated. What matters here is the shape.

**Brotato chops its run into 20 beats with a relax after every one.** Waves are 20 s, then +5 s per wave to 60 s at wave 9, 60 s through wave 19, and 90 s for the wave 20 boss, totalling 1,050 s of wave time, with a shop between every pair. Source: <https://brotato.wiki.spellsandguns.com/Waves>. That is 17.5 minutes of play in units shorter than a single Radiant Silvergun sub-stage, each followed by an authored, unmissable valley.

**Vampire Survivors runs 30 minutes with no boundary at all and buys its valleys with density.** Mad Forest's minutes 8, 11 and 21 push peak enemy HP back *down* while concurrent count goes to 100 and then 300 (survivor-numbers.md). The valley is a change of texture, not a drop in pressure.

**20 Minutes Till Dawn's developers authored a mid-run trough on purpose,** and their patch notes say so: "HP of enemies from 10 minutes to 18 minutes reduced for a smoother difficulty ramp" and "Enemy spawn rate slightly reduced at the 8-10 minutes mark" (survivor-numbers.md).

**Halls of Torment holds 30 minutes and ships an opt-out.** The Hastening Sands artifact cuts the run by 10 minutes, raises enemy spawn rate by 30% and raises movement speed by 20% for everything. Source: <https://hot.fandom.com/wiki/Artifact>. Read as a design statement: when the answer to "too long" was needed, the shipped fix was to shorten the clock and raise the density in the same item, keeping the total pressure.

### Left 4 Dead 2 finales (DOCUMENTED, decompiled scripts)

A finale is the game's longest sustained high-pressure stretch and it is the one place the director's reader is switched off entirely. The Dark Carnival concert ships as `PANIC, PANIC, DELAY 15, TANK, DELAY 15, PANIC 2, DELAY 10, TANK, DELAY RandomInt(5,10)`; the Parish rooftop as `PANIC 2, DELAY, TANK, DELAY, PANIC 2, DELAY, TANK, DELAY`, delays 5 seconds in coop (director-precedent.md, from <https://github.com/Stabbath/L4D2-Decompiled>).

The transferable reading: across a whole finale the **authored relaxes total well under a minute**, and everything else is peak. Valve's answer to a long, dense stretch was not to let the director pace it; it was to write the peaks and the valleys out as a row list. That is ADR 0006's shape, used by the game ADR 0047 borrows from, at the moment the pressure is highest.

---

## 3. The pushback: where a long stage was called a bad experience

Presented flat. The bar is "this exact thing led to a bad player experience", with evidence. All of the following is COMMUNITY-MEASURED, from <https://shmups.system11.org/viewtopic.php?t=57241>, quoted verbatim.

**The complaints.**

vludi: "Short, i just can't get into R-Type 3 because of that first stage."

AxelMill, on the same stage: "Ugh, I hate that stage so much. Did they really need to make a 10-minute-long tech demo for Mode 7?"

davyK: "Longer early stages can be very off-putting. I can remember RType III and Super Aleste having long first stages. It's OK later on in the game but early stages should be short but be choked full of scoring opportunities to keep skilled players interested."

Sumez, replying to davyK: "I agree with this 100%. I never thought long and hard about it, but it's true that in almost every case where the first stage in a shmup lasted longer than average, it came across as off-putting to me. Of course it's all a question of feeling some kind of progression."

Shepardus: "Tatsujin and Tatsujin-Oh are two games that are too long for their own good." And separately: "Longer last stages tend to give a more 'epic' feeling but can also feel off-puttingly hard to learn since it feels like progress grinds to a halt while you're stuck on a long stage."

**The counter-position, from the same thread.**

system11: "I like stages to have a bit of meat to them... I don't even mind really long stages as long as there's some variation instead of just spamming the same waves and looping a bit of scenery. I think Tatsujin-Oh falls down a bit there, for example the section before the stage 1 boss has no reason to be as long as it is."

Despatche: "Tatsujin has pretty good stage length. Tatsujin Ou's stages are too long, but at least they're interesting, putting it well above the *vast* majority of shmups. A game with even slightly more variety than Tatsujin Ou would be a top 10 until the end times."

**What actually made it bad, sorted by named cause.**

| Cause named | Game | Who named it | Is it length? |
|---|---|---|---|
| Minutes spent on something that is not play (a Mode 7 showcase) | R-Type III | AxelMill | No. Absence of content. |
| Repetition: "spamming the same waves and looping a bit of scenery" | Tatsujin-Oh | system11 | No. Absence of variety. |
| A named section with "no reason to be as long as it is", immediately before the stage 1 boss | Tatsujin-Oh | system11 | No. One dead stretch, not the stage. |
| Not enough scoring opportunities to hold a skilled player | R-Type III, Super Aleste | davyK | No. Absence of a second layer of play. |
| Learning cost: "progress grinds to a halt while you're stuck on a long stage" | long last stages generally | Shepardus | Partly. This is a retry and checkpoint problem. |
| Length itself, mechanism unstated | R-Type III, Super Aleste | vludi, Sumez | Claimed as length; no mechanism given beyond "feeling some kind of progression". |

Four of the six causes are content or scoring absences. One is a retry cost. One is length with no stated mechanism, and it is directly contradicted in the same thread by two other posters.

A number for scale: R-Type III's first stage is reported at about six minutes (<https://viciogameblog.com/2023/05/29/snes_r_type_iii_complete_gameplay/>), against an industry-standard first stage of about two (shmup-stage-design.md). AxelMill's "10-minute" figure is hyperbole; the real ratio is about three to one. No chapter-marked run was found that confirms the figure, so treat it as approximate.

**Does a director that relaxes address the cause? Taken one by one, INFERRED.**

Minutes with no play: **no**. A relax is fewer enemies, which is more of the same problem, not less.

Repetition of waves and scenery: **partly, and only the first half**. A director varies *when* mobs arrive, never *what* arrives. Booth's stated reason for building one was memorization of static placement, and the population it draws from is fixed: wanderers, mobs, six special classes. Hungry Grave's directed density adds mobs of the types already on the roster (ADR 0047), so the vocabulary is unchanged. Scenery it does not touch at all.

Too few scoring opportunities: **no**. Density is not a scoring layer. Note the second-order effect though: in Hungry Grave mobs are food, so added density does pay in souls and score, which is more than a Left 4 Dead mob pays. ADR 0047 already names this.

Learning cost and progress grinding to a halt: **no, and a director makes it slightly worse**. This is a retry problem, answered in shipped games by checkpoints, stage select and practice modes. A directed stage is a different stage every attempt, which is the thing Booth built the director *for* ("Static placement of enemies and loot hinders replayability") and the thing a player learning a long stretch is fighting.

Length itself: **unanswerable from the record**, because the two posters who assert it give no mechanism, and Radiant Silvergun and Einhänder are counter-examples on the same axis.

**And the honest boundary on the whole question.** No shmup on record has ever run a director inside a stage, so no evidence exists either way about whether a relax fixes a long-stage complaint in this genre. The only in-stage adaptive system the genre has is rank, which never relaxes: it rises with survival time and power and falls only on death or a hit. What the record *does* show is what the games that survive a long stage actually did, and it was not pacing: Radiant Silvergun divided the stage and put a boss on every boundary, and Ikaruga wrote a mountain-and-valley curve into the content and the music before it built anything.

Booth's own framing is the cleanest statement of the limit: "Algorithm adjusts pacing, not difficulty. Amplitude (difficulty) is not changed, frequency (pacing) is."

---

## 4. Keeping the opening a first stage and the back half a last stage

**Ikaruga wrote the curve before it wrote the content, and the music carries it.** Iuchi: "we had a pacing in mind for Ikaruga before we even began making it, a progression along a curve of ups and downs, crescendos and diminuendos. Chapter 1 begins slowly, with an atmosphere of melancholy, then things suddenly burst out with an uptempo, militaristic feel. Then Chapter 2 continues and sustains that mood, before it starts to turn more downtempo at the midway point, and the atmosphere becomes more one of endurance in the face of a trial. The pacing and progression follows a 'mountain' and 'valley' curves."

The line that is new here, and it is the practical one: "Had we used a really uptempo, aggressive musical theme for the stage 2 boss, it would have destroyed this pacing, so we prepared some suitably downbeat music for that fight." Source: <https://shmuplations.com/ikaruga/>. DOCUMENTED. The valley is not only fewer enemies; it is a piece of music written to be the valley, and a wrong track would have erased it. A director that lowers density inside a fixed loop is carrying one of the two channels Iuchi used.

**Ikaruga's chapter lengths do the same job structurally**: 3:12, 4:16, 4:43, 5:42, 3:26. The opening is short so it reads as an opening; the fourth is the longest; the last drops back so the final boss carries the weight. Shepardus states the rule for the genre: "Garegga and most Touhou games have relatively short last stages to put the focus on the bosses."

**Radiant Silvergun's answer is punctuation the player can name.** Every sub-stage boundary is a boss kill, a Boss Report tally, a chain reset and a screen naming the new sub-section. A player mid-way through stage 3 is not in minute six of a long stage; they are at the start of 3D. Shepardus's whole defence of that stage rests on this.

**The counter-answer is to remove the boundaries entirely.** AxelMill: "the lack of any kind of stage transitions give an equal, or even better, feeling of a journey. Einhander or Rayforce are shining examples of this." Both are continuous descents. The mechanism there is the scenery: the world changes under you and that is the progress readout.

**Two more statements that bear on it, both already in shmup-stage-design.md and cited rather than repeated.** Shepardus: "Different parts within a stage should also be distinguishable from each other, while following the stage's overarching theme... it also aids with memorization, so players can think 'oh it's this part, then this part'". Boghog: "try to think of the theme of different sections of your levels to prevent them from blending together." And gray117, in the length thread: "Ikaruga's small chapter pre-ambles/run-ups/intros were really effective thematically."

**Junya Inoue's rule on where the effort goes, which argues against a long *first* stretch specifically.** "I believe the game balance for arcade shooters hinges most critically on Stages 1 and 2. That's because most casual players... only get to play Stages 1 through 3... if the early stages aren't fun, players won't touch the game again." And what he would change: "shortening the early stages and shuffling them would keep the game fresh and engaging." DOCUMENTED, <https://shmuplations.com/esprade/>, in shmup-stage-design.md.

Reading them together: there are exactly two shipped mechanisms for making a long stage read as a sequence, and they are opposites. Divide it and mark every boundary (Radiant Silvergun, Brotato), or refuse every boundary and let the world change (Einhänder, Rayforce, Vampire Survivors). Hungry Grave already has the vocabulary for the first (miniboss, drain-out, feast, the Wall, phases chained by boundary events) and the raw material for the second (the scroll is the world and the deadline). INFERRED.

---

## 5. What a longer stage does to the carrier schedule and the miniboss placement

### Carriers

Power in Hungry Grave is metered by authored carrier mobs the director never spawns, so stage length sets the carrier schedule directly. Two shipped models, both in reward-delivery-models.md and progression-tuning-precedent.md, and they answer a longer stage differently.

**The Cave model: a fixed handful, delivered early, then a flat run.** DoDonPachi reaches full power in exactly four power-ups, carried by specific enemies. Truxton runs a 60-entry per-carrier cycle table reset on death. Fire Shark has a 71-entry table and 75 carriers over ten stages, with at most four items on screen and a carrier's item silently discarded when the cap is full. In every one of these the ceiling arrives in the first stage or two, and the remaining 15 to 20 minutes run on a different economy: bombs, medals, rank, extends. Under this model, **a longer stage means a longer flat stretch**, and the designer has to have something else for the player to be doing in it.

**The Touhou model: a continuous drip.** An item from every third enemy killed, cycling a fixed 32-entry pattern, roughly 500 kills to max, which at Ikaruga-like kill rates is two to three minutes of scrolling. Under this model **a longer stage means proportionally more power**, and the ceiling has to move or the drip stops mattering.

Hungry Grave's corpses-as-power is closest to Touhou's, but its offers are authored per carrier like Cave's, which is a genuine hybrid the record does not have a precedent for.

**The measured numbers make the choice concrete.** A full run on real weapons produces 23 to 42 kills and 3 to 5 drops, against ADR 0013's ten to twelve and a price table fitted to 268 authored mobs (`docs/design/tracer-plan.md`). Since ADR 0034 makes a drop an offer of three, **the drop count is the number of build decisions in a run**, and 3 to 5 is thin: the survivors-likes deliver a power step every 12 to 45 seconds for the whole run (progression-tuning-precedent.md), which at five minutes would be seven to twenty-five steps.

Three carrier options fall out of a longer stage, and they are separable from the length decision. Keep the carrier density and let drops scale with minutes, which reaches ten to twelve at about eight to ten minutes without touching the price table. Keep the drop count and thin the carriers, which lengthens every dry stretch and is the DoDonPachi flat-run shape without DoDonPachi's replacement economy. Or raise the ceiling and keep both, which is a weapon-pool decision, not a stage-length one. INFERRED from the DOCUMENTED figures.

**One coupling worth naming.** Truxton writes power straight into enemy bullet speed at `power × 2` (reward-delivery-models.md). A longer stage that delivers more power to a director reading *pressure* has the opposite coupling: more power means less pressure means the director adds more, which is the loop ADR 0047 deliberately chose pressure over power to avoid. Lengthening the stage raises the total power delivered and therefore raises how hard the director is working in the back half. That is the interaction most worth watching in a tuning pass.

### Minibosses

**The shipped answer to a longer stage is more punctuation at the same cadence, not one punctuation pushed later.** Radiant Silvergun's ten-minute first stage carries five bosses, one about every two minutes, and each is what makes the sub-stage a sub-stage. Brotato puts a shop after every 20 to 90 second wave and a boss every ten waves. Vampire Survivors and Halls of Torment, which have no boundaries, still put a scheduled elite or Champion event on a clock.

**Midboss placement is not proportional, so it does not stretch.** DoDonPachi's stage 1 midboss is at 60% of the scroll, its stage 3 midboss at 24%, Ikaruga chapter 4's at 14% (shmup-stage-design.md). The midboss is a tempo change placed where the designer wants one, not a halfway marker. Hungry Grave's Banshee at the 2:00 midpoint of a five-minute stage is the genre-standard placement for a five-minute stage; it is not the genre-standard placement for a ten-minute one.

**A concrete consequence.** At eight to ten minutes with one miniboss, the player crosses four to five minutes of unbroken scroll before the first punctuation, which is longer than any single Radiant Silvergun sub-stage and longer than most shipped arcade stages entire. On the record above, that is the exact shape system11 complained about in Tatsujin-Oh: "the section before the stage 1 boss has no reason to be as long as it is." A second miniboss, or a set piece doing a miniboss's structural job, is the cost of the extra minutes and not an optional extra. INFERRED, and it is the strongest structural claim in this document.

**And each new boundary costs directed minutes.** ADR 0047 puts boss phases, drain-outs and the Wall off limits, so every added miniboss subtracts roughly 45 seconds (a fight plus its drain-out) from the director's own budget. Adding punctuation and adding director room pull against each other, which is why the table in section 1 charges the 15 minute row an extra 46 seconds of overhead.

---

## Open items

- **No developer of any shipped director states a target number of pacing cycles per level or per map.** Searched Booth's two 2009 decks, the Left 4 Dead and Left 4 Dead 2 in-game commentary, Newell's Edge essay, the decompiled Vermintide 2 and Darktide Lua referenced in director-precedent.md, and the l4d2-director-system-research disassembly README. The cycle durations exist; the count per map does not.
- **No published wall-clock duration for a Left 4 Dead 2 finale from any primary source.** The finale scripts give stage lists and delay seconds, and PANIC and TANK stages end on a condition rather than a timer, so the scripts cannot yield a duration. Community sources decline to give one because the game imposes no time limit.
- **Left 4 Dead map flow distances are not published per map,** so `director_relax_max_flow_travel 3000` cannot be turned into a fraction of a chapter. That would have given a primary derivation of cycles per chapter rather than an inference from campaign minutes.
- **Radiant Silvergun and Einhänder sub-stage times come from 1CC videos, so they carry player-skill and route slop,** and Einhänder's markers include in-stage dialogue and between-stage cutscenes. No shipped timing table exists for either.
- **No statement by Iuchi, Treasure or anyone at Treasure was found on why Radiant Silvergun's stages are subdivided.** The structure is documented on the wiki as shipped behaviour; the reasoning is not on record anywhere I looked.
- **No developer statement on first-stage length from Irem (R-Type III) or Compile (Super Aleste).** The complaint record is entirely player-side.
- **No chapter-marked run of R-Type III was found,** so its stage 1 length rests on one blog figure of about six minutes against a forum claim of ten.
- **Nothing was found on how a director behaves in a game where added enemies are also the reward.** Every shipped director adds pure threat. Hungry Grave's mobs are food (ADR 0037 makes only kills leave corpses, and ADR 0047 names the payment), which has no precedent in this record.

---

## What this implies for Hungry Grave

Stated as implications, not decisions. INFERRED throughout.

### The three options

**Option A: stay at five minutes.** Named games at this length: DoDonPachi stage 1 (2:05), Batsugun (Inoue's "one stage is about one minute"), Ikaruga chapter 1 (3:12), Brotato's early waves (20 to 60 seconds each).

*What it buys the director:* about 2:58 of directed time, one to two full cycles at the industry-standard period. Enough for one build up, one peak and one valley.

*What it costs as a moment of play:* the single valley almost certainly lands on or beside the drain-out the director is forbidden to touch, so the player experiences one authored valley and one directed one back to back and cannot tell them apart. The director's work reads as the stage rather than as pacing, which is the weakest possible case for having built it. And 3 to 5 drops means 3 to 5 build decisions in a whole run, against ADR 0013's own target of ten to twelve.

**Option B: eight to ten minutes, punctuated into named sections.** Named games: Radiant Silvergun stage 3 (9:35 to 10:30 across five sub-stages), Einhänder stage 2 (8:14 to 8:33), Battle Garegga stage 5 (5:58), Crimzon Clover and Blue Revolver's last stages at about 8 minutes, a typical Left 4 Dead chapter.

*What it buys the director:* about six to eight directed minutes, two to five full cycles. This is the first length at which two cycles clear even at the slow end, so a valley has a peak on either side of it and reads as pacing. It also puts Hungry Grave inside Left 4 Dead's own per-chapter band, which no shorter option does.

*What it costs as a moment of play:* the Radiant Silvergun tax, and it is not small. The evidence says a long stage survives only when it is divided, so this is not the same stage made longer: it is two or three named sections, each with its own punctuation, which means a second miniboss or a set piece doing a miniboss's job. That is more authored content, not a way to get more game from the rows already written. It also costs the director back roughly 45 seconds per added boundary.

**Option C: fifteen minutes or more, the survivors-like shape.** Named games: Brotato (17.5 minutes of wave time), 20 Minutes Till Dawn (20), Death Must Die (20 to 25), Vampire Survivors (30), Halls of Torment (30), Radiant Silvergun stage 4 (20:16).

*What it buys the director:* four to eight cycles, room for the deliberate density troughs Vampire Survivors and 20 Minutes Till Dawn author into their middles, and a power curve at genre-standard rate rather than a third of it.

*What it costs as a moment of play:* the stage stops being a stage and becomes a run, and every 15-to-30-minute precedent in this record has no stage boundary at all, so the comparison set changes underneath the decision. It is also the only length with a documented complaint attached: Halls of Torment's answer was a shipped item that cuts 10 minutes and adds 30% spawn rate. And it collides with `docs/design/game-concept.md`, where 20 to 25 minutes is the shape of the eventual full stage 1, not of a slice.

### The recommendation

**Option B, eight to ten minutes, divided into two or three named sections. INFERRED.**

Four things point there together. The arithmetic in section 1 is the clearest: five minutes buys one to two cycles and eight buys two to four, and the difference between one valley and two is the difference between a director the player can feel and one they cannot. The carrier schedule reaches its own recorded target of ten to twelve drops at roughly double the current length without touching the price table, which resolves a measured shortfall rather than creating a new tuning problem. The only long first stage the shmup community defends is Radiant Silvergun's, at 9:35 to 10:30, and its mechanism is precisely the punctuation Hungry Grave already has words for. And eight to ten minutes is a step along the road to the 20-to-25 minute stage already written down as the target, rather than a detour.

The honest risk, and it is the one to weigh against all four: the pushback in section 3 says a long stage goes wrong for content reasons, and a director pays none of those costs. It does not add enemy types, it does not add scoring layers, and it does not add scenery. So a longer stage is a commitment to authoring more, and if that authoring does not happen the extra minutes will read exactly as system11 described Tatsujin-Oh, as a section with no reason to be as long as it is. Length is what makes the director legible; content is what makes the length bearable, and the director cannot supply it.

The designer decides.

---

## Sources

Shipped data, scripts and binaries:
- Left 4 Dead 2 director convar defaults: <https://www.gamerconfig.eu/command/left-4-dead-2/z_mob_spawn_min_interval_normal/>, `.../z_mob_spawn_max_interval_normal/`, `.../director_relax_min_interval/`, `.../director_relax_max_interval/`, `.../director_relax_max_flow_travel/`, `.../director_sustain_peak_min_time/`
- Left 4 Dead 2 decompiled VScripts (finales, `director_quiet.nut`, `director_onslaught.nut`): <https://github.com/Stabbath/L4D2-Decompiled>
- Left 4 Dead 2 director disassembly, June 2026 `server.dll`: <https://github.com/zeljkovranjes/l4d2-director-system-research>
- Booth, GDC 2009, "The AI Systems of Left 4 Dead": <https://steamcdn-a.akamaihd.net/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf>

Developer interviews:
- Hiroshi Iuchi on Ikaruga's pacing curve and the stage 2 boss music: <https://shmuplations.com/ikaruga/>
- Junya Inoue on early-stage length in Esprade: <https://shmuplations.com/esprade/>

Structure and stage data:
- Radiant Silvergun sub-stage structure and boss list: <https://www.shmups.wiki/library/Radiant_Silvergun>
- Ikaruga chapter names: <https://shmups.wiki/library/Ikaruga>
- Brotato wave lengths: <https://brotato.wiki.spellsandguns.com/Waves>
- Halls of Torment Hastening Sands: <https://hot.fandom.com/wiki/Artifact>
- Left 4 Dead campaign length: <https://en.wikipedia.org/wiki/Left_4_Dead>
- R-Type III stage 1 length (approximate): <https://viciogameblog.com/2023/05/29/snes_r_type_iii_complete_gameplay/>

Chapter markers on published runs (COMMUNITY-MEASURED):
- Ikaruga, Normal 1CC, 19 million: <https://www.youtube.com/watch?v=icQCUur6M24>
- Radiant Silvergun, 1CC with commentary, Stage 2 route: <https://www.youtube.com/watch?v=2u61v_yTBXw>
- Radiant Silvergun, Steam arcade 1CC 22,686,270, Stage 4 route: <https://www.youtube.com/watch?v=rsxfW0KubZM>
- Einhänder, full run all clear: <https://www.youtube.com/watch?v=U5A-WXMUJOA>
- Einhänder, longplay: <https://www.youtube.com/watch?v=XDmqKobR69U>

Player reports:
- "How long do you prefer your stages/progression": <https://shmups.system11.org/viewtopic.php?t=57241>

Project records cited rather than repeated:
- [director-precedent.md](director-precedent.md), [shmup-stage-design.md](shmup-stage-design.md), [progression-tuning-precedent.md](progression-tuning-precedent.md), [reward-delivery-models.md](reward-delivery-models.md), [survivor-numbers.md](survivor-numbers.md)
- `docs/adr/0047-directed-density-inside-authored-beats.md`, `docs/adr/0034-a-drop-is-an-offer-of-three.md`, `docs/design/game-concept.md`, `docs/design/tracer-plan.md`

---

## Reproducing the checks

The convar defaults:

```
for c in z_mob_spawn_min_interval_normal z_mob_spawn_max_interval_normal \
         director_relax_min_interval director_relax_max_interval \
         director_relax_max_flow_travel; do
  curl -s "https://www.gamerconfig.eu/command/left-4-dead-2/$c/" \
    | grep -o 'Default value:</b>[^<]*'
done
```

The chapter markers on any of the runs above:

```
curl -s -A "Mozilla/5.0" "https://www.youtube.com/watch?v=<id>" \
  | grep -o '"title":{"simpleText":"[^"]*"},"timeDescription":{"simpleText":"[^"]*"'
```
