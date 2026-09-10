# Six words realigned to the genre: chunk becomes phase, phase collapses into section, row becomes wave, template becomes formation, drop becomes power-up, strip becomes HUD

Research for Hungry Grave. Labels: **DOCUMENTED** = a shipped data file, decompiled source, a developer statement, a primary wiki's own definitional text, or a measurement of this repository. **COMMUNITY-MEASURED** = a wiki transcription of shipped behaviour, a datamined table, a forum report. **INFERRED** = my reading across sources.

The question this answers: Mark ruled on 2026-09-09 that the glossary's system layer uses the words the genre's designers and players use, and that flavor words stay only at the surface the player touches, which is the Hades split of Boons in the UI and Traits in the code. Six terms are realigned now, ahead of slice B, because slice B rewrites the wave tables and the golden pin regenerates anyway. This record picks the exact replacement word for each of the six from evidence, says why each runner-up loses, and produces the rename map a coder executes.

It sits beside [naming-the-authored-growth-rate.md](naming-the-authored-growth-rate.md), which surveyed the same two lineages this morning for a different question and whose sources are reused rather than re-fetched. Where this record moves one of that record's conclusions, section 3 says so and says what it could not have known.

---

## What is solid

These are the claims I would build on.

1. **"Phase" is the genre's word for one segment of a boss's fight, in both parent lineages, and in the shmup half it is tied to a health pool and drawn as a segment of the health bar.** Shmups Wiki's glossary uses it without defining it, which is the tell that it is ambient rather than coined: "Multi-phase fights may have a timer set for each phase, with the boss usually advancing to the next phase when timed out." Its STELLAVANITY page ties a phase to its own HP: "The player can also overkill stage bosses if they reduce the current phase's HP to 0 during Ethereal Shift". Its Espgaluda page draws the boundary in the bar: "Killing and destroying certain boss phases will cause a bullet cancel - indicated by a line in their health bar and an audio cue when almost at the cancel point." COMMUNITY-MEASURED, section 1.

2. **The MMO half says the same thing and hangs it on health percentages.** Warcraft Wiki's Boss article: "Many boss fights consist of different phases, where raid members have to pay attention to different aspects of the fight." Its Onyxia article is the cleanest health-threshold example found anywhere: "Phase Two starts when Onyxia reaches 65% health", "Phase Three starts as Onyxia is brought to 40% health." COMMUNITY-MEASURED, section 1.

3. **Phase and Section are one unit in this codebase, not two, and the code has been saying so for a while.** `PHASES` in `src/game/stage/stage.ts` is a seven-entry table of one record type; `SectionName` in `src/game/stage/rows.ts` is a three-member string union naming three of those seven. There is no Section record, no Section table and no finer unit under a Phase. The instrument that measures the stage's segments is named `sectionTimeline.ts`, its own opening comment reads "Every section the tape crossed", the field it stores is called `phase`, and `batchReport.ts` maps its output under the reduction key `phaseSpans`. One unit, two words, already used interchangeably. DOCUMENTED (this repository).

3a. **"Section" is the genre's own word for a stretch of a stage, in English shmup writing and in Touhou's, and it is a translation of a Japanese term with an exact definition.** Shmups Wiki prose uses it as its dominant construction: "In Stage 3, after the section with the bridge and before the boss, you get into a section with the small red rail tanks", and "there is a 1UP item in the airship section at the end of stage 1-3 and 2-3". Touhou Wiki structures every stage strategy page on it, alternating two headings, "1st Stage Portion" and "Stage section 1", both above and below the midboss heading. Both are English for 道中 (dōchū), glossed in the shmups.system11 Japanese terminology reference as "the part of a level before the boss". Radiant Silvergun ships the subdivision as a real mechanic: "Radiant Silvergun presents a total of 6 stages, each divided into sub-sections discriminated by letters". COMMUNITY-MEASURED and DOCUMENTED, section 2.

3b. **Left 4 Dead's scripting API models a map exactly the way `PHASES` models this stage, as one flat sequence of named segments with the boss segments in the same list.** Valve's EMS enum is `STAGE_SETUP, STAGE_PANIC, STAGE_DELAY, STAGE_CLEAROUT, STAGE_ESCAPE, STAGE_TANK, STAGE_RESULTS, STAGE_NONE`, each carrying a value and an exit condition. DOCUMENTED (<https://developer.valvesoftware.com/wiki/L4D2_EMS/StageTypeAppendix>). The tank segment and the panic segment sit in the same list as the setup segment, which is the shipped precedent for putting the boss fights and the set piece in with the trash stretches rather than in a second category.

4. **"Wave" is the word both parents put on the authored entry, and the genre's one published glossary definition of it is this game's Wave almost verbatim.** Sega-16's unofficial shmups glossary gives "Wave" three senses, and the second is "A specific group of enemies which appears at a certain point in a stage" (<https://www.sega-16.com/2005/04/unofficial-shmups-glossary/>). Brotato's `WaveGroupData` is one resource with `spawn_timing` for the one-shot time and `repeating` for the continuous case, so the one-shot is the base and the standing case is a flag on it. SHMUP Creator, SHMUPKIT and deepnight's `WaveEmitter` all put "wave" on the one-shot group. Vampire Survivors' community puts it on the per-minute row. DOCUMENTED, the Sega-16 definition new here and the rest carried from [naming-the-authored-growth-rate.md](naming-the-authored-growth-rate.md) claims 1, 2 and 4.

5. **The shipped hobbyist idiom already assigns "wave" and "formation" exactly the way this rename assigns them.** `rusty-ship`'s `waves.json` keys a wave to a duration and an enemy pool and puts the shaped group inside it under the field name `formations`, as `{"type":"vee","count":5,"spacing":60.0}`. DOCUMENTED (<https://raw.githubusercontent.com/rhettjay/rusty-ship/main/assets/content/waves.json>). The naming record recorded this as a trap, because under its question both words were banned; under Mark's ruling both words move together and the trap is the answer.

6. **The genre uses "formation" for the arrangement and tracks the enemy type on a separate axis, though no genre source defines it as a fillable template the way SHMUP Creator does.** Bandai Namco's own Galaga page: "Each stage features about 40 enemy units in a formation", then, next sentence, "The Galaga forces are comprised of 3 types of enemies - Bosses, Guards, and Grunts." The Galaga wiki puts different types in different parts of one formation: Zako "make up the bottom two rows of the enemy formation", Goei "make up the two rows behind the Zako in the enemy formation". The Gradius wiki treats "formation enemy" as a class three unrelated types belong to. DOCUMENTED, section 4. The caveat is real and recorded there: what the genre supports is that formation names the arrangement and type is tracked separately, not that a formation is a named shape you pour any type into. That last step is SHMUP Creator's and this codebase's.

7. **"Power-up" is the shmup genre's word for the dropped permanent upgrade in five of five games checked, including Konami's own manual for the game this mechanism came from.** The Gradius Collection manual, page 4: "When you defeat certain enemies or enemy squadrons, a power-up capsule will appear." Raiden, DoDonPachi, Twin Cobra and Tyrian all use "power-up" or "power-ups" on their wiki and StrategyWiki pages; R-Type is the outlier with "unit symbols". Sega-16's glossary draws the line this game needs: a power-up is "any type of item whose purpose is to directly increase the abilities of your craft", against an item, which is "more or less a universal term for any type of icon or the like which can be collected". DOCUMENTED, section 5.

7. **The code already reached for the genre's word past the glossary's, three times, unprompted.** The shipped HUD module is `RunHud.ts` and exports `createRunHud`, `HudLines`, `hudInk` and `hudDim`; the noun "strip" appears zero times in `src` and `scripts`. The prototype's authored timeline type is `WaveRow`, not `StageRow` (`src/prototypes/ugly-slice/game/stage.ts`). One shipped test names its stage row local `wave` (`src/game/__tests__/mobs.test.ts:594`). DOCUMENTED (this repository). Nobody was told to do any of that.

8. **Five of the glossary's 341 Avoid bans resolve a real collision, and two of the five are in the Chunk entry.** `CONTEXT.md` holds 101 terms, each with an Avoid list, 341 bans over 314 distinct words. Exactly five bans carry a parenthetical explaining why the banned word is taken: "territory (which is the line, not the ground)", "pip (which is the mark, not the step)", "add (which is the boss's summon)", and, in one entry, "phase (belongs to the stage)" and "stage (of a fight)". DOCUMENTED (this repository). The one entry that needed two collision parentheticals is the one entry where the project word was standing on the genre's.

9. **Gradius's shape is this game's shape, and this repository already cites it.** ADR 0034 says in its own text: "Gradius's stored capsules and Brotato's bag are the shipped shape of a reward that waits its turn." A carrier squadron dies, leaves a capsule where it died, the player flies over it, and a permanent step of a weapon system is bought. That is the Carrier, the Power-up and the Swallow, already written down. DOCUMENTED (`docs/adr/0034-a-drop-is-an-offer-of-three-and-the-grave-swallows-one.md`).

10. **Nothing in the six reaches the wire.** `src/tape/records.ts` reads the header positionally (`readU32`, `readF64`, `readU16`, and so on in fixed order); the only strings written are the recorded roster's weapon-line names, the commit hash, the build identity, the author, the policy and the renderer backend. Every enum crosses as a number through a code map read by name, including `FAULT_IDENTITY_CODES`, whose comment says it is "deliberately not the index of FAULT_IDENTITIES". DOCUMENTED (this repository), section 6.

11. **The one version that moves is `READINGS_VERSION`, and its own version-3 note is the precedent for moving it on a rename.** Version 3's recorded reason is that a batch "used to print them as one row named `levelUps` and now prints the count, the first tick, the line and the phase under `levelUps.rungs` and its siblings. Every figure still means what it meant and no row can be subtracted from its predecessor by name, which is the case this version exists to make loud." Six reading keys and two report keys move here on exactly those terms. DOCUMENTED (`src/dev/readingsVersion.ts`).

12. **The dangerous part of the rename is that `phaseIndex` changes owner.** Today `StageState.phaseIndex` is the stage's cursor and `Boss.chunkIndex` is the boss's. After the rename the stage's is `sectionIndex` and the boss's is `phaseIndex`. A blind sequential edit that renames chunk to phase before phase to section produces two different things called `phaseIndex` and a witness fold that reads the wrong one. Section 5 orders the map to prevent it. INFERRED from the code.

---

## 1. Chunk becomes phase

**The pick: `phase`.** Two sources, one per lineage, as the brief asked.

**Shmup lineage, Shmups Wiki** (<https://shmups.wiki/library/Help:Glossary>), the Time-out entry: "Multi-phase fights may have a timer set for each phase, with the boss usually advancing to the next phase when timed out." A glossary whose whole job is explaining vocabulary uses "phase" unexplained, which is the strongest available evidence that the word is ambient in the genre rather than one game's coinage.

Two more from the same wiki, because the brief's concept is specifically a segment of the health bar rather than a stage of a fight.

STELLAVANITY (<https://shmups.wiki/library/STELLAVANITY_-_Prelude_to_the_Destined_Calamity_->): "The player can also overkill stage bosses if they reduce the current phase's HP to 0 during Ethereal Shift, leading to a special overkill phase (marked by a special sound, the background reddening, and the boss' bottom health bar filling with a gray color instead of a red one)." A phase there owns an HP pool and the bar shows it, which is the glossary entry's "one segment of a boss's health bar" exactly.

Espgaluda (<https://shmups.wiki/library/Espgaluda>): "Killing and destroying certain boss phases will cause a bullet cancel - indicated by a line in their health bar and an audio cue when almost at the cancel point." A phase boundary drawn as a line in the health bar, and a cancel on crossing it, which is this game's chunk break and its invincible flash.

**MMO lineage, Warcraft Wiki** (<https://warcraft.wiki.gg/wiki/Boss>), definitional: "Many boss fights consist of different phases, where raid members have to pay attention to different aspects of the fight." And Onyxia (<https://warcraft.wiki.gg/wiki/Onyxia_(Classic)>), which hangs each phase on a health threshold: "Phase One starts as soon as anyone enters Onyxia's main chamber." "Phase Two starts when Onyxia reaches 65% health." "Phase Three starts as Onyxia is brought to 40% health." Warcraft Wiki is the successor to Wowpedia and the primary wiki, so this is not a Fandom mirror.

**Why the runners-up lose.** There are none worth ranking. "Chunk" has no genre currency at all: no shmup wiki, no MMO wiki, no engine and no shipped data file found in either this record or the naming record uses it for a boss's health. "Health bar segment" and "stage of a fight" are already banned in the entry as circumlocutions for the word the entry refused. The Chunk entry's own Avoid list is the argument for the rename: it bans "phase" and "stage" with parentheticals, which is a glossary admitting that the two words a reader will reach for are the two words the genre uses.

**What it costs.** "Chunk" survives untouched in its other, unrelated home: the tape's byte framing (`src/tape/chunks.ts`, `CHUNK_HEADER`, `writeChunk`, `readChunk`). That word is a file-format term of art, has nothing to do with a boss, and is not part of the game's vocabulary at all. The glossary never defined it and does not gain an entry for it.

---

## 2. Phase collapses into Section

**The pick: collapse. Every one of the stage's seven segments is a section, and Section absorbs Phase entirely.**

The brief asked first whether Phase and Section are two units or one. They are one.

`PHASES` in `src/game/stage/stage.ts` is a table of seven records of one type: procession, banshee, crowd, waking, vigil, undertaker, over. Each carries the same columns: `rows`, `ends`, `boss`, `directed`, `music`, `liveTemplateCeiling`, `liveBodyCeiling`, `bankOpens`. `SectionName` in `rows.ts` is a three-member union, `'procession' | 'crowd' | 'vigil'`, used as the key of `SECTION_TABLES` and `POUR_SHARES`. There is no section record, no section cursor, no section boundary machinery, and nothing sits between a phase and a wave. A section is three of the seven phases, distinguished by owning a property and holding trash rather than a boss. That is a subset label on one unit, not a second unit.

The code has been treating them as one word for longer than the glossary has. `src/dev/readings/sectionTimeline.ts` opens with "Every section the tape crossed, and the ticks each one held", stores its span's key in a field called `phase`, types that field `PhaseName`, and observes the `phaseChanged` event. `src/dev/batchReport.ts` then maps `'tuning.sectionTimeline.spans'` to the reduction key `'phaseSpans'`. One reading, two names, chosen by different hands on different days, and nobody noticed because there was nothing to notice: they mean the same thing.

**Why Section, and it is the genre's word rather than merely a convenient one.** The survey of shmup and Touhou strategy writing turned up a settled term, and it is section.

Shmups Wiki's prose uses it as its dominant construction for exactly this unit, always identified by landmark rather than by number. Raiden IV answers the question in one sentence: "In Stage 3, after the section with the bridge and before the boss, you get into a section with the small red rail tanks in which you have to destroy all of them without letting them escape." DoDonPachi: "there is a 1UP item in the airship section at the end of stage 1-3 and 2-3". Sengoku Ace: "For the destructible building section, position yourself between the two houses". Full-wiki phrase counts through the site's own API: "stage section" 5, "section of the stage" 4, "the section with" 9, against "segment of the stage" 0, "area of the stage" 0, "act of the stage" 0 and "beat of the stage" 0.

Touhou Wiki structures every stage strategy page on the same unit, alternating two headings across games. Legacy of Lunatic Kingdom, Stage 1, literal heading order: "1st Stage Portion", "Midboss 1: Seiran", "2nd Stage Portion". Unconnected Marketeers, Stage 1: "Stage section 1", "Midboss nonspell (Mike Goutokuji)", "Stage section 2". Site-wide counts: "stage portion" 35, "stage section" 13, "stage segment" 1 and that one is a racing minigame, "stage phase" 0. Both English forms translate 道中, glossed in the shmups.system11 Japanese terminology reference as "the part of a level before the boss".

Radiant Silvergun ships it as a mechanic rather than as commentary: "Radiant Silvergun presents a total of 6 stages, each divided into sub-sections discriminated by letters", and "Your chain does not carry over on each sub-section of a stage".

Every alternative the brief named is worse, and three of them are worse on evidence rather than on taste:

- **act** has zero currency in either lineage: zero hits across Shmups Wiki and Touhou Wiki. Its precedent is Sonic's alone, where Sonic Retro's Zone article defines Acts as "separate sub-levels within a Zone and sharing its theme", which are whole separate levels rather than segments of one continuous scroll. Outside Sonic it usually means a chapter *above* the level, as in Diablo and Path of Exile. It is also already banned twice in this glossary, under Phase and under Section.
- **area** is banned under Section and is taken in the genre for a whole stage. Shmups Wiki's Valtric page: stages are "called Areas in-game". "Finishing all of them will send the player back to Area 1." Same in Xevious, Tatsujin and RayForce. "Area of the stage" gets zero hits.
- **segment** gets zero hits for "segment of the stage" on Shmups Wiki and one on Touhou Wiki, and that one is a racing minigame. It is also the word the Chunk entry currently bans as a circumlocution, "health bar segment", so reusing it for the stage would put the banned word back into service one level up. Hellsinker uses it for a whole stage.
- **stage section** is two words for what "section" already says, and this glossary has no compound headwords except where two words are one name.
- **beat** has the best published definition of anything in the survey, from the Level Design Book: "A beat is a small self-contained chunk of a level. A single area, event, activity, or element." It loses twice. It has no currency with shmup or survivors players, and this project has already spent it three times over: Arriving beat, Opening beat, and ADR 0047's "authored beats".
- **phase** is the word being freed, so it cannot stay.

**One genre habit the game already matches.** Shmup guides almost never number these; they name them by landmark, "the section with the bridge", or by position against the boss. Taisei encodes exactly that in its stage timelines as skip markers rather than as a data type: `pre-midboss`, `post-midboss`, `post-midboss-filler`, `pre-boss`. This stage names its three trash sections the Procession, the Crowd and the Vigil, and its four boundary sections after what happens in them, which is the genre's own habit rather than an ordinal list.

**What the collapse costs, and it is one coinage.** Today's three-member `SectionName` and the new seven-member one cannot both be `SectionName`. The three-member type is the key of the two tables that only the trash stretches have, so it becomes `TrashSectionName`, built from the glossary's own word for what fills them. That is the single new identifier the collapse forces, and it is a qualified form of an existing term rather than a new concept. The alternative considered was `NamedSectionName`, dropped for saying "name" twice while naming nothing.

**What the collapse changes in the glossary.** The Section entry loses its clause "The boss and set-piece phases between them are phases and not sections", because they are sections now. It gains the distinction it needs instead: three of the sections are the named trash sections and each owns one property no other section has, and the rest are the boundary sections. The stage-and-boss reading then matches the genre exactly: a stage has sections, a boss has phases.

---

## 3. Row becomes wave, and wave and formation do not collide

**The pick: `wave`, with `standing row` becoming `standing wave`.**

The brief asked me to check that the survivors-like data formats say so, and that the shmup sense of wave does not collide once Template becomes formation. Both check out, but the second one needs the argument written down, because this morning's naming record concluded the opposite for a different question.

**What the two parents call the authored entry.** The genre's one published glossary definition of the word is this game's Wave: Sega-16 gives "Wave" three senses and the second is "A specific group of enemies which appears at a certain point in a stage." Brotato ships the one-shot and the continuous case as one resource: `WaveGroupData` declares `spawn_timing`, then `repeating`, `repeating_interval`, `reduce_repeating_interval` and `min_repeating_interval`, alongside `is_boss` and `is_horde`, with `WaveData` above it holding only `wave_duration`, `max_enemies` and `groups_data`. The base case is a group arriving at a time, and standing is a flag on it. Vampire Survivors' shipped `Stage.json` gives its per-minute object no noun, and its wiki supplies "wave" for it: "Enemies normally arrive in waves - one wave every minute." On the shmup side, SHMUP Creator, SHMUPKIT and deepnight's `WaveEmitter` all use "wave" for the one-shot group. Sources in [naming-the-authored-growth-rate.md](naming-the-authored-growth-rate.md) sections 1 and 2, and in this record's own source list for Sega-16.

So both parents put "wave" on the authored entry. The disagreement the naming record found is narrower than it looked: it is over whether "wave" also covers the standing case, and Brotato answers that with a qualifier on the same resource rather than a second noun.

Sega-16's third sense is worth naming so it is not discovered later: "An enemy bullet formation which forms a tight line or 'front' across all or most of the width of the screen." That is a wave of mob fire, which this glossary refuses already, in the Cone entry's ban on "wave" and in Mob fire's rule that mob fire is never the storm. It stays refused.

**The collision, and why moving both words dissolves it.** The naming record's claim 2 says the shmup lineage "uses 'wave' for the one-shot group, which is the opposite assignment", and its section 2 quotes SHMUP Creator defining a wave as "a formation, a group of the same enemy starting from the same position". Read as an identity, that sentence makes wave and formation the same thing and the rename incoherent. Read as a composition, it says a wave is one formation's worth of one enemy, which is exactly what this game's wave is: a time, a formation, a count and a mob type.

The shipped idiom already reads it as a composition. `rusty-ship`'s `waves.json` keys a wave to a duration and a pool and nests the shape inside it as `formations: [{"type":"vee","count":5,"spacing":60.0}]`. `astral_shards` does the same. The naming record filed this under "the trap it is", because under its question both words were banned and either one would have read backwards. Under Mark's ruling both words move at once, into exactly the two slots those files put them in, and there is no trap left: a wave names a formation, a formation names no wave, and neither word does the other's job anywhere in the vocabulary.

The one residual is Card's Avoid list, which bans "wave" today to keep a directed add distinct from an authored entry. That ban gets more useful, not less, and it earns the sixth collision parenthetical: "wave (which is the authored entry)".

**Why the runners-up lose.** "Row" loses on the ruling. It is not a genre word for this: no shipped survivors-like format, no shmup engine and no design chapter surveyed in either record calls an authored spawn entry a row. It survives in the codebase in its ordinary table sense, which is where it belongs and where it is left: `FireRow`, `ConeRow`, `RingRow`, `CurtainRow`, `SpiralRow`, `MobRow`, `FrameBudgetRow`, `SegmentRow` and the frame rows on the tape all stay. "Spawn event" and "script line" stay banned. "Group" is Card's word to refuse.

**Standing row becomes standing wave, and here is the test the brief asked for.** The phrase collides with the physics term: a standing wave is a stationary interference pattern, and this is a game about projectiles. That is a real reading hazard and it is the only argument against.

It is not enough to reopen the pick. The naming record chose "standing" this morning on the qualifier's own merits, over Brotato's `repeating` and Deep Rock's `trickle`, and nothing in Mark's ruling touches the qualifier. What the rename does touch is the runner-up, and it makes it worse: the naming record rejected "repeating row" because it "invites a File of eight arriving again every three seconds, which is a template firing on a loop, not a rate of bodies". A wave is more group-shaped than a row was, so "repeating wave" invites that misreading harder than "repeating row" did. The runner-up loses by more after the rename than before it.

The physics reading is also closed by the same clause that already closes the misread the naming record accepted, that a standing row might be mobs standing still: the entry's first line says what stands, which is the wave rather than anything on the field. And "standing wave" keeps the shape the evidence supports, one noun with two qualifiers over one kind of entry, which is Brotato's `WaveGroupData` with `repeating` set or not.

**What this supersedes in [naming-the-authored-growth-rate.md](naming-the-authored-growth-rate.md), recorded rather than left to be discovered.** That record's claim 2 and its section 4 ruled that "'wave' cannot be borrowed here without reading backwards to half the audience", and its claim 9 listed wave and formation together among the words already spent. What stood: the qualifier "standing", the reasoning that beat "repeating" and "trickle", the survey of both lineages, and the finding that no borrowable noun existed for the *continuous* thing. What changed: the noun under the qualifier, and only because both contested words move together rather than one of them. What that record could not have known: it was written to answer what to call the standing thing while "template" still held the shape, so "wave" had two jobs and could take neither; Mark's ruling of the same day moves the shape word to "formation", and a wave with only one job left is available.

---

## 4. Template becomes formation

**The pick: `formation`.** The brief asked for confirmation beyond SHMUP Creator's definition. There are four independent sources, and one honest limit on what they prove.

**SHMUP Creator** is the primary, verbatim: a wave is "a formation, a group of the same enemy starting from the same position", with properties "number of spawns", "start delay" and "spawn interval" and no loop, repeat, rate or duration property (<https://www.shmupcreator.com/doc/?docs=shmupcreator%2Fobjects-and-entities%2Fenemies-and-waves>).

**Bandai Namco's own Galaga page** is the second, and it is a publisher primary source that puts the arrangement and the type on two axes in consecutive sentences: "Each stage features about 40 enemy units in a formation. Defeating as many of them before they finish their formation is key in getting an advantage in battle. The Galaga forces are comprised of 3 types of enemies - Bosses, Guards, and Grunts." (<https://galaga.com/en/history/galaga.php>). The Galaga wiki carries it down to the individual type: Zako "make up the bottom two rows of the enemy formation", and Goei "make up the two rows behind the Zako in the enemy formation". One formation, different types in different parts of it, which is this game's split.

**The Gradius wiki treats "formation enemy" as a class three unrelated types belong to.** Battle Axe: "They come in formations similarly to Fans or Bellbergs ... Like the other formation enemies, they leave a Power Capsule when all members of the formation are destroyed." Dordia: "Dordias are another formation enemy." Foss: "Another formation enemy; Fosses move in snake-like waves." The formation behaviour is named independently of who is flying it.

**The `rusty-ship` and `astral_shards` `waves.json` files** are the fourth, and they are the only sources found in either record that put the entry and the shape as two named fields on one object: a wave carries `formations`, each `{"type":"vee","count":5,"spacing":60.0}` (<https://raw.githubusercontent.com/rhettjay/rusty-ship/main/assets/content/waves.json>). A named shape, a count beside it, and no enemy type inside the shape. That is `Template` and `StageRow.count` as this codebase already builds them, under the genre's two words. The `Emanon` devlog makes the same split in code: enemies "leave the entry path ... move to the formation and become children of the relative formation", so the formation exists before its occupants arrive (<https://watto-a.itch.io/emanon/devlog/438108/enemy-spawning>).

**The honest limit.** No genre source *defines* a formation as a named shape you pour an arbitrary type into. Shmups Wiki has no "Formation" headword at all, verified against the raw page, and its only use of the word is inside the Fixed Shooter entry: "A style of shooter where the player and enemy formations are held at set distances from each other". Sega-16's glossary formally defines only "Bullet Formation", as a synonym for bullet pattern. So what the genre supports is the weaker claim, that formation names the arrangement and the type is tracked separately, and the fillable-template step is SHMUP Creator's and this codebase's. That step is ADR 0016's own ruling, not a borrowing, and it stands on its own.

**Why the runners-up lose.** "Template" is the generic software word for a fill-in-the-blanks thing, has no shmup or survivors-like currency at all, and collides inside this repository with the project scaffolding sense: ADR 0009 is titled "Creation web template base" and means the create-pixi project template. That collision is silent today because the two never meet in one file; it stops being a risk once the placement word moves. "Pattern" is banned in the current entry and is spoken for in the genre by bullet patterns, which this game gives to bosses. "Spawn type" is banned and describes the wrong axis. "Shape" was considered and dropped: it is what a formation *is*, not what the genre *calls* it, and Card's entry already uses "shape" as the plain word for what the director puts on the field.

**What it costs.** Sega-16's formal use of the word is for bullets, so "formation" is not unambiguous in the genre either; it is unambiguous in this glossary, where mob fire is never a formation and the Cone entry already refuses "wave". Recorded rather than argued away. HoloCure using "Wave" for one of its five shapes (Wall, Stampede, Cluster, Horde, Wave, where a Wave is "enemies fly rapidly across the screen in a sine-wave pattern") is one more instance of the crossed assignment and one more reason the shape word has to be nailed down rather than left implicit. And the Galaga wiki's own word for a rank inside a formation is "row", which is a further argument for freeing "row" from the timeline sense: in the genre a row is a line of bodies inside a shape, which is much closer to what this codebase's other rows already mean.

---

## 5. Drop becomes power-up

**The pick: `power-up`, from the shmup parent, which is the parent whose mechanism this is.**

The brief asked me to pick from the two parents' usage. They do not agree, and the tiebreak is which parent's *mechanism* the game built.

**The shmup parent says power-up, and Konami says it in this game's exact shape.** The Gradius Collection manual, page 4, under the heading "How to Power Up": "When you defeat certain enemies or enemy squadrons, a power-up capsule will appear. When you pick it up, the items in the power meter will flash in order." Konami's own spelling is lowercase and hyphenated, "power-up capsule", and its word for the enemy that drops one is "enemy squadrons". The Gradius wiki capitalises the object as the Power Capsule and describes the trigger: "They are always found upon destroying certain enemy formations or red-colored enemies", where the Fan is the archetype, "If the entire row of Fans are destroyed, the last one will leave a capsule."

Correcting the brief on one detail, because it changes nothing but should not go into the record wrong: there is no "power-up squadron" in Gradius, and red marks individual enemies rather than the squadron. The wiki pairs the two triggers as "certain enemy formations **or** red-colored enemies", and the Dee-01 page notes "There are red colored Dee-01s that drop Power Capsules, though they are rare".

The shape still lines up exactly, which is what matters. ADR 0034 already cites it: "Gradius's stored capsules and Brotato's bag are the shipped shape of a reward that waits its turn." A formation of carrier enemies is killed as a set, a capsule is left where they died, the player flies over it, and a permanent step of a weapon system is bought. Against `CONTEXT.md`: a **Carrier** is "a mob authored to carry a drop. Killing one is the only way power arrives"; a **Drop** is "a permanent upgrade a carrier leaves where it died"; a **Swallow** is "the grave passes under a corpse or drop and it falls in". Three of this game's four nouns are Gradius's, and the fourth, Offer, is Vampire Survivors' level-up choice made diegetic, which ADR 0034 also says.

**And it is not just Gradius: four of five shmups checked use the word itself.** Raiden's Shmups Wiki page lists them under Items and its scoring table heads the row "Power ups"; StrategyWiki: "the player can collect several power-ups for them to make them stronger". DoDonPachi's Shmups Wiki page: "Items - Power up: Increases the player's shot and laser power", and "It takes 4 power-ups to reach full power." Twin Cobra on StrategyWiki: "The player can find power-ups by shooting down the relatively sturdy Chinook enemy choppers". Tyrian on Wikipedia: "Front and rear guns can also be upgraded to the next level by picking up power-up pods, which are found by destroying a specific enemy." R-Type is the one outlier and calls them "unit symbols" in its manual.

**Sega-16's glossary draws the line this game needs, between power-up and item.** A power-up is "Very broad term referring to any type of item whose purpose is to directly increase the abilities of your craft", while an item is "More or less a universal term for any type of icon or the like which can be collected and utilized by the player within a shmup; includes score items, power ups, and just about anything else that the player can obtain and use."

**So the survivors-like parent's word loses on being the umbrella.** Vampire Survivors' build pieces are weapons and passive items; Brotato's are items bought in a shop, with Upgrades reserved for the level-up stat bumps. Both are inventory words for things that sit in a list, and neither names a body lying on the ground that you drive over. Worse for this glossary, "item" is the genre's umbrella noun, which means adopting it makes a corpse and a feast items too; this vocabulary already has a word for that class and it is Treasure. "Item" is also banned twice in `CONTEXT.md` today, as "item enemy" under Carrier and "special item" under Treasure, and it would make the Carrier entry read "a mob authored to carry an item", which is the sentence those bans exist to prevent.

**"Upgrade" loses on being a category, not a genre word.** It is what the current entry uses to *define* Drop ("a permanent upgrade a carrier leaves"), so promoting it to the headword makes the definition circular and loses the only thing the word has to carry, which is that this is an object lying on the field with a position. Brotato is the one game that uses it, and there it is a stat bump chosen from a menu at level-up, not a thing on the floor.

**"Capsule" was considered and dropped.** It is Konami's noun, not the genre's, and the genre disagrees with Konami about it: Sega-16 defines a capsule as "A delivery system that is sometimes used to give power-ups to the screen ... Once a capsule is shot, it will release whatever power-ups it is carrying." Under that definition the Gradius capsule is the anomaly, and this game's object is what comes out of a capsule rather than the capsule.

**"Drop" loses on the ruling and on being the wrong half of the sentence.** It names the verb the carrier did, not the thing the player takes, which is why the current entry has to spend its first clause saying what a drop *is*. It is also, per this survey, not the genre's noun anywhere: Vampire Survivors, Brotato, Gradius, R-Type, Raiden, DoDonPachi, Twin Cobra and Tyrian all name the object, and none of them names the act.

**Two costs, both recorded rather than argued away.** First, this codebase already uses "powers" as a term of art: `SteeringPowers`, `EndingPowers`, `backdropPowers`, `PoweredScreen`, from `code-core.md`'s rule that "powers arrive as props at construction". `PowerUp` and `Powers` never collide as identifiers and never meet in one layer, since Powers is the app's component-wiring word and PowerUp is the sim's food word, but a reader meeting both for the first time has two unrelated senses of one root. The hyphen keeps them apart in prose and the CamelCase unit keeps them apart in code.

Second, the survivors-like half of the audience has two other senses of the word. Vampire Survivors ships "PowerUps" as a separate capital-P meta-progression noun: "PowerUps are purchasable permanent improvements to stats that apply to all characters. They can be bought with Gold Coins in the PowerUp Selection menu." Halls of Torment reserves "Power Ups" for timed buffs like Angelic Boon and Berserk's Rage. Neither reading can actually arise in this game: there is no meta-progression layer here at all, every run rolls a fresh seed and nothing persists between runs, and nothing in this game's power-up is timed. But a Vampire Survivors player reading the glossary cold will bring the menu with them, and that is the honest cost of taking the shmup parent's word over the survivors-like parent's.

**Corpse stays, and here is the genre word it is declining.** The survivors-like word for the thing a killed enemy leaves for the player to collect is, in each of the three games checked: an Experience Gem in Vampire Survivors, "pickups that can be dropped by killed enemies. Collecting enough experience allows the player to level up"; Materials in Brotato, "small green objects that are dropped by Enemies when they are killed", which are XP and currency in one object; and Gems in Halls of Torment, "Collecting Gems that spawn when Mobs are killed". Corpse is none of those, and it is not being realigned, for two reasons.

It is a flavor word at the surface the player touches, which is exactly the half of Mark's split that keeps its flavor: the player sees a body, and the whole premise is a grave eating what it kills. And it is not a system word wearing a costume; the system already calls the file `corpses.ts` and the kind `'corpse'`, and there is no second word underneath it fighting to get out, which is precisely what "strip" had and what "chunk" had. The same reasoning holds Grave, Swallow, Feast, Belch, Toll, Lay, the six formation names and the three section names.

Worth noting for the record that the genre's three words disagree with each other while all three agree on the mechanism, which is the pattern that separates a flavor word from a system word: where the genre has one word, taking it costs nothing and buys a reader; where the genre has three, there is nothing to take.

---

## 6. Strip becomes HUD

**The pick: `HUD`, and the code got there first.**

The noun "strip" appears zero times in `src` and `scripts`. The module is `src/app/screens/game/RunHud.ts`, and it exports `createRunHud` and `HudLines` and uses `hudInk` and `hudDim`. Nobody wrote a `Strip`. The glossary asked for a word the code declined to use for the entire life of the module, which is the cheapest possible confirmation of Mark's ruling.

**The verb survives untouched, and does not collide once the noun is gone.** Every "strip" identifier in the codebase is the verb: `weaponStripped`, `WeaponStripped`, `weaponStrips`, `linesStripped`, `stripLevels`, `strippable`, `strippableLines`, `stripping`. All four test titles carrying the word are the verb: "counts what a boss sheds and what a hit strips", "holds every rung a full build can strip onto the field", "strips back to exactly the loadout a fresh run started with (ADR 0045)", "leaves a stripped player firing one line and nothing else (ADR 0045)". With the noun gone there is exactly one sense of the word in the vocabulary, which is one fewer than today.

**Why the runners-up lose.** There are none. "Bar", "panel" and "overlay" stay banned; they are the words for a HUD's parts or for a thing that covers the field, and this readout is neither. "HUD" is banned in the current entry, which is the ban being inverted.

**What the rename buys beyond the word.** ADR 0054's whole argument is that the ladder needs a second channel because a rung lost is invisible in a dense storm. Naming that channel the HUD says what it is to anyone who has played a game; naming it a strip described its shape, which is a design detail the ADR itself leaves open ("The strip's exact form is design work").

---

## 7. The rename map

Scope: `apps/hungry-grave/src` and `apps/hungry-grave/scripts`. `src/prototypes/ugly-slice/**` is excluded under ADR 0010, so its `WaveRow`, `RAMP_ROWS`, `BACKHALF_ROWS`, `TemplateName`, `DROP_COSTS`, `dropCostForNext`, `killsNeededForDrops` and `applyUpgradeDrop` do not move.

**Order matters. Do the five renames in this order, and never in one pass.**

1. **Phase to section first.** Then chunk to phase. Reversed, `Boss.phaseIndex` and `StageState.phaseIndex` exist at the same time and a fold or a test can silently read the wrong one.
2. Row to wave, template to formation, drop to power-up in any order after that.
3. Strip is glossary-only and touches no code.
4. One collision inside step 2: `bossPhases` already exists as a test helper in `src/game/bosses/__tests__/chunks.test.ts`, where it means the stage phases that carry a boss. It becomes `bossSections` in step 1, which frees the name for step 2's `bossChunks`.

### Chunk to phase (the boss's health segment)

| Today | New |
|---|---|
| `src/game/bosses/chunks.ts` | `src/game/bosses/phases.ts` |
| `src/game/bosses/__tests__/chunks.test.ts` | `src/game/bosses/__tests__/phases.test.ts` |
| `bossChunks` | `bossPhases` |
| `CHUNK_HP` | `PHASE_HP` |
| `CHUNK_FLASH_TICKS` | `PHASE_FLASH_TICKS` |
| `BELCH_CHUNK_DAMAGE` (`belch.ts`) | `BELCH_PHASE_DAMAGE` |
| `Boss.chunkIndex` | `Boss.phaseIndex` |
| `Boss.chunkHp` | `Boss.phaseHp` |
| `BossChunk` (`invariants.ts`) | `BossPhase` |
| `StageWatch.seenBoss: BossChunk` | `seenBoss: BossPhase` |
| `ChunkBroke` (`events.ts`) | `PhaseBroke` |
| event type `'chunkBroke'` | `'phaseBroke'` |
| `breakChunk` | `breakPhase` |
| `firstChunkHp` | `firstPhaseHp` |
| `hasChunkLeft` | `hasPhaseLeft` |
| `checkBossChunk` (`invariants.ts`) | `checkBossPhase` |
| `emissionsThisChunk` (`undertaker.ts`) | `emissionsThisPhase` |
| `spiralSinceChunk` (`undertaker.ts`) | `spiralSincePhase` |
| `chunkEndedMidEmit` (`undertaker.ts`) | `phaseEndedMidEmit` |
| `atChunk` (test helper) | `atPhase` |
| `onItsLastChunk` (test helper) | `onItsLastPhase` |
| fault identity `'boss chunk only increases'` | `'boss phase only increases'` |

Unchanged, and the coder must not touch them: `src/tape/chunks.ts` in full (`writeChunk`, `CHUNK_HEADER`, `CHUNK_BODY`, `CHUNK_WITNESS`, `CHUNK_OBSERVATIONS`, `CHUNK_TRAILER`, `CHUNK_FRAME_BYTES`), `chunkBytes` in `segments.ts`, `readChunk` / `reportUnknownChunk` / `reportedUnknownChunk` in `decode.ts`, `withUnknownChunk` in `codec.test.ts`, and `fastForwardChunk` / `verifyChunk` in `tapePlaybackSession.ts`, which are a chunk of work per frame and a third sense again.

### Phase to section (the stage's segment)

| Today | New |
|---|---|
| `PhaseName` (7 members) | `SectionName` |
| `SectionName` (3 members, `rows.ts`) | `TrashSectionName` |
| `PhaseEnd` | `SectionEnd` |
| `PhaseEnd` member `'rowsSpentAndFieldClear'` | `'wavesSpentAndFieldClear'` |
| `PhaseMusic` | `SectionMusic` |
| `Phase` (interface) | `Section` |
| `PHASES` | `SECTIONS` |
| `Phase.rows` | `Section.waves` |
| `Phase.liveTemplateCeiling` | `Section.liveFormationCeiling` |
| `StageState.phaseIndex` | `StageState.sectionIndex` |
| `StageState.phaseTick` | `StageState.sectionTick` |
| `StageState.firedRows` | `StageState.firedWaves` |
| `phaseAt` | `sectionAt` |
| `phaseEnded` | `sectionEnded` |
| `phaseSpent` | `sectionSpent` |
| `phaseUnderway` | `sectionUnderway` |
| `enterNextPhase` | `enterNextSection` |
| `PhaseChanged` (`events.ts`) | `SectionChanged` |
| event type `'phaseChanged'` | `'sectionChanged'` |
| `PhaseChanged.phase` | `SectionChanged.section` |
| `StagePhase` (`invariants.ts`) | `StageSection` |
| `SectionSpan.phase` (`sectionTimeline.ts`) | `SectionSpan.section` |
| report key `'phaseSpans'` (`batchReport.ts`, `compareBatches.ts`, `scripts/compare-batches.ts`) | `'sectionSpans'` |
| `phaseSpansOf` | `sectionSpansOf` |
| `PhaseSpansDeclaration` | `SectionSpansDeclaration` |
| reading key `'tuning.arrivals.byPhase'` | `'tuning.arrivals.bySection'` |
| `Arrivals.byPhase` / `ArrivalsAcc.byPhase` | `.bySection` |
| `phaseNow` (`arrivals.ts`) | `sectionNow` |
| `Collected.phases` (`batchReport.ts`) | `Collected.sections` |
| `phaseBudget` (`harnessRun.ts`) | `sectionBudget` |
| fault identity `'phase index only increases'` | `'section index only increases'` |
| fault identity `'phase tick resets at a boundary'` | `'section tick resets at a boundary'` |
| test helpers `firstPhase`, `runInPhase`, `phaseNameAt`, `phaseOrder`, `loopPerPhase`, `lastFightPhase`, `phaseOf`, `advanceToPhase`, `expandPhase`, `bansheePhaseHeldFor`, `stepPhase`, `phaseAtFire`, `bossPhases` | the same names with section for phase, and `bossPhases` to `bossSections` |

Unchanged: `sectionTimeline.ts` and its exports keep their names, because the rename makes them correct rather than moving them. `ReplayPhase` and `Session.phase` in `tapePlaybackSession.ts` stay: that is the playback session's own lifecycle (`'idle' | 'fetching' | 'verifying' | 'fastForwarding' | 'playing' | 'played'`), a third sense of the word that belongs to the app and never to the stage or a boss. The seven section-name strings themselves (`'procession'`, `'banshee'`, `'crowd'`, `'waking'`, `'vigil'`, `'undertaker'`, `'over'`) do not move; they are flavor at the player's surface and they are the sub-keys of `bySection`.

### Row to wave (the authored timeline entry)

| Today | New |
|---|---|
| `src/game/stage/rows.ts` | `src/game/stage/waves.ts` |
| `src/game/stage/__tests__/rows.test.ts` | `src/game/stage/__tests__/waves.test.ts` |
| `StageRow` | `StageWave` |
| `StageRow.template` | `StageWave.formation` |
| `PROCESSION_ROWS` | `PROCESSION_WAVES` |
| `CROWD_ROWS` | `CROWD_WAVES` |
| `VIGIL_ROWS` | `VIGIL_WAVES` |
| `WAKING_ROWS` | `WAKING_WAVES` |
| `SPARSE_LAST_ROW` | `SPARSE_LAST_WAVE` |
| `sparseLastRow` | `sparseLastWave` |
| `CarrierRow` (`carriers.ts`) | `WaveCarriers` |
| `carrierRow` (`carriers.ts`) | `waveCarriers` |
| `carrierRow`'s `rowCarries` parameter | `waveCarries` |
| `spawnRow` (`stage.ts`) | `spawnWave` |
| `spawnDueRows` | `spawnDueWaves` |
| `rowsSpent` | `wavesSpent` |
| `rowTicks` | `waveTicks` |
| `rowsUnderThePour` | `wavesUnderThePour` |
| `SECTION_TABLES` value type `readonly StageRow[]` | `readonly StageWave[]` |
| test helpers `busiestRow`, `lastRowAt`, `firstProcessionRow`, `firstCarryingRow`, `lastCrowdRow`, `rowsSource`, `liveTemplates` | `busiestWave`, `lastWaveAt`, `firstProcessionWave`, `firstCarryingWave`, `lastCrowdWave`, `wavesSource`, `liveFormations` |

`CarrierRow` becoming `WaveCarriers` rather than `CarrierWave` is deliberate: "carrier wave" is a radio term and would read as a kind of wave rather than as which of a wave's mobs carry. `WaveCarriers` is descriptive-complete in `code-core.md`'s sense.

Unchanged, all the ordinary table-row sense: `FireRow` (`mobFire.ts`), `ConeRow` and `rowFor` and `rowAt` (`bell.ts`), `RingRow` and `RING_ROWS` (`banshee.ts`), `CurtainRow` and `SpiralRow` (`undertaker.ts`), `MobRow` (`mobs.ts`), `FrameBudgetRow` and `rowLine` (`frameBudget.ts`), `SegmentRow` (`tapeStore.ts`), `recordRow` (`runRecording.ts`), `faultRows` (`recorder.ts`), `summaryRow` and `rowsOf` and `lastRowOf` (test helpers over frame rows), `liveRow` (`offerChoices.ts`), and every "tuning row" and "initial row" in a comment. The frame row keeps its name and ADR 0032 keeps its title.

### Template to formation (the shape a group arrives in)

| Today | New |
|---|---|
| `src/game/stage/templates.ts` | `src/game/stage/formations.ts` |
| `src/game/stage/__tests__/templates.test.ts` | `src/game/stage/__tests__/formations.test.ts` |
| `TemplateName` | `FormationName` |
| `place`'s `template` parameter | `formation` |
| `Phase.liveTemplateCeiling` | `Section.liveFormationCeiling` |
| `liveTemplates` (test helper) | `liveFormations` |
| `templatesSource` (test helper) | `formationsSource` |

`place`, `SpawnOrder` and `MAX_ENTRY_DEPTH` keep their names. The six shape names (`'drip'`, `'file'`, `'v'`, `'pincer'`, `'rain'`, `'wall'`) do not move: they are flavor at the player's surface.

### Drop to power-up (the permanent upgrade on the field)

| Today | New |
|---|---|
| `src/dev/readings/dropLedger.ts` | `src/dev/readings/powerUpLedger.ts` |
| `src/dev/readings/__tests__/dropLedger.test.ts` | `src/dev/readings/__tests__/powerUpLedger.test.ts` |
| `spawnDrop` (`corpses.ts`) | `spawnPowerUp` |
| `DROP_HALF_EXTENT` | `POWER_UP_HALF_EXTENT` |
| `DROP_DRAW_HALF_EXTENT` | `POWER_UP_DRAW_HALF_EXTENT` |
| `DROP_RADIUS` | `POWER_UP_RADIUS` |
| `DROP_BREATH_DEPTH` | `POWER_UP_BREATH_DEPTH` |
| `DROP_BREATH_TICKS` | `POWER_UP_BREATH_TICKS` |
| `DROP_BREATH_ID_STRIDE` | `POWER_UP_BREATH_ID_STRIDE` |
| `DropSpawned` (`events.ts`) | `PowerUpSpawned` |
| event type `'dropSpawned'` | `'powerUpSpawned'` |
| `FoodKind` member `'drop'` | `'powerUp'` |
| `FOOD_KIND_CODES.drop` | `FOOD_KIND_CODES.powerUp`, code 2 held |
| `StreamName` member `'drops'` | `'powerUps'` |
| `STREAM_ORDER` entry `'drops'` | `'powerUps'`, position 2 held |
| `RunState.streams.drops` | `RunState.streams.powerUps` |
| `Digest.drawn.drops` | `Digest.drawn.powerUps`, value held |
| `TuningReadings.dropLedger` / `ReadingsAcc.dropLedger` | `.powerUpLedger` |
| `DropLedger` | `PowerUpLedger` |
| `DropLedgerAcc` | `PowerUpLedgerAcc` |
| `DropLedgerByLine` | `PowerUpLedgerByLine` |
| `createDropLedger` | `createPowerUpLedger` |
| `observeDropLedger` | `observePowerUpLedger` |
| `dropLedgerOf` | `powerUpLedgerOf` |
| reading key `'tuning.dropLedger.spawned'` | `'tuning.powerUpLedger.spawned'` |
| reading key `'tuning.dropLedger.swallowed'` | `'tuning.powerUpLedger.swallowed'` |
| reading key `'tuning.dropLedger.passed'` | `'tuning.powerUpLedger.passed'` |
| reading key `'tuning.dropLedger.lost'` | `'tuning.powerUpLedger.lost'` |
| reading key `'tuning.dropLedger.onFieldAtStop'` | `'tuning.powerUpLedger.onFieldAtStop'` |
| reading key `'tuning.dropLedger.byLine'` | `'tuning.powerUpLedger.byLine'` |
| `drawDrop` (`FieldRenderer.ts`, `foodSprite.ts`) | `drawPowerUp` |
| `drawDropIcon` | `drawPowerUpIcon` |
| `dropBreath` | `powerUpBreath` |
| `dropCore` (`palette.ts`) | `powerUpCore` |
| `liveDrops`, `keptDrops`, `dropsEaten`, `dropsScrolledOff`, `dropsSpawned`, `dropSpawnTimes`, `dropAt`, `dropOverTicks`, `drawnDrop`, `dropLine`, `strayDropsReachesIn`, `dropsReachesIn` | the same names with powerUp for drop |

Unchanged: `backdropPowers`, `clearBackdrop`, `blurBackdrop`, `teardrop`, `droplets` and every "dropped frame" or "dropped time" in `clock.ts`, `step.ts` and `BelchButton.ts`.

**One deliberate exception.** `RETIRED_RUN_FIELDS` in `src/game/__tests__/witness.test.ts` is `['killsSinceDrop', 'dropsPaid']`, a guard that two retired fields never reappear on `RunState`. Do not rename those two strings: they name fields that no longer exist, and renaming the ban would let `dropsPaid` come back. Add `'killsSincePowerUp'` and `'powerUpsPaid'` beside them so the guard covers both spellings.

### Strip to HUD

Zero identifiers. The glossary entry changes and nothing in `src` or `scripts` moves. The verb stays: `weaponStripped`, `WeaponStripped`, `weaponStrips`, `linesStripped`, `stripLevels`, `strippable`, `strippableLines`, `stripping`.

### Map totals

101 lines above, of which three bundle a group of test helpers, for 127 distinct renames: 20 for chunk to phase, 27 for phase to section, 19 for row to wave, 7 for template to formation, 28 for drop to power-up, and zero for strip to HUD.

Inside that count sit 8 file renames, 8 reading and report key strings, 3 fault identity strings whose wire numbers are held, and 4 serialized enum or code-map member keys whose numbers and positions are held. No URL flag and no route: `src/app/routes.ts` declares `#/`, `#/prototypes`, `#/digest`, `#/replay`, `#/runs` and `#/frame-budget`, the only build flags are `VITE_NEON_AUTH_URL` and `VITE_NODE`, the only CLI flag in `scripts` is `--config`, and no asset filename or `manifest.json` key carries one of the six.

Beyond the map, roughly 138 test titles carry an old word inside their sentence and rename with the code they describe: about 35 for row, 42 for phase, 24 for chunk (the other 5 chunk titles are the tape's and stay), 8 for template and 29 for drop. `scripts/test-names.ts` compares vitest listings between runs, so the slice will report about 138 removed and 138 added. That is the rename and not a regression.

Prose outside the map, and not this record's scope: 23 files under `docs/design`, 32 under `docs/adr`, `docs/lessons.md` and `README.md` carry at least one of the six.

---

## 8. The version constants

**`READINGS_VERSION` moves from 3 to 4.** Its own doc comment says to bump it "when an existing reading changes meaning, or when comparison semantics change, in a way that leaves old and new reports not directly equivalent", and the version-3 note is the precedent for a rename qualifying: version 3 moved because "no row can be subtracted from its predecessor by name, which is the case this version exists to make loud rather than leaving it to read as a reading one side happened not to carry." Eight keys move by name here: the six under `tuning.dropLedger`, plus `tuning.arrivals.byPhase` and the `phaseSpans` reduction, plus the `phase` field inside every `SectionSpan`. Every figure still means what it meant and none of them can be matched to a version-3 report by name.

**`FORMAT_VERSION` stays 3.** Verified in `src/tape/wireCodes.ts` and `src/tape/records.ts`. The header is read positionally, field by field, in a fixed order (`readU32` for the seed, `readF64` for the starting size, the roster, the starting levels, `readU16`, `readU32`, `readU8`, then five strings and four numbers). The only strings on the wire are the recorded roster's weapon-line names, the commit hash, the build identity, the author, the policy and the renderer backend, and none of the six words appears in any of them. No byte moves, no field is added or removed, and no reader's walk changes.

**`WITNESS_VERSION` stays 6.** Verified in `src/game/witness.ts`. The fold takes numbers, and every union crosses it through a code map read by name: `RUN_ENDING_CODES`, `CORPSE_TIER_CODES`, `FOOD_KIND_CODES`, `WEAPON_LINE_CODES`. Renaming a map's key while holding its number changes nothing the fold sees. The two folds that touch the renamed state are `fold(fold(checksum, stage.phaseIndex), stage.phaseTick)` then `stage.firedRows`, which become `sectionIndex`, `sectionTick` and `firedWaves` in the same positions with the same values; and `STREAM_ORDER`, which folds `run.streams[name].drawn` by walking a list, so renaming `'drops'` to `'powerUps'` in place holds its position and its number. The version's own comment says it "moves only when the order or the field list below moves", and neither moves.

**`GOLDEN` does not move.** Every value in `src/dev/digest.ts` holds: `tick: 600`, `seed: 20260820`, `graveX: 365.625`, `graveY: 318.875`, `size: 24.50625`, `mobs: 5`, `corpses: 1`, `skulls: 2`, `kills: 2`, every `drawn` figure, every `levels` figure, and `checksum: -279620599`. One key inside it renames with its type, `drawn.drops` to `drawn.powerUps`, holding the value 0. That is a field rename on the `Digest` interface and not a re-pin, and the ADR 0019 regeneration ritual does not apply, because no rule of the simulation changed. If the checksum moves when the coder runs it, something in the rename changed behaviour and the rename is wrong.

**The fault identities are the one place worth a second look, and they are safe.** `CONTEXT.md` says a fault identity is "fixed as a closed list that only ever gains entries", and three of the twenty-one carry an old word. They are safe to relabel because the wire anchor is the number, not the string: `FAULT_IDENTITY_CODES` maps `'phase index only increases'` to 11, `'phase tick resets at a boundary'` to 12 and `'boss chunk only increases'` to 19, and its own comment says the code "is deliberately not the index of FAULT_IDENTITIES: an identity is append-only from the first tape and outlives the check that raises it". Holding 11, 12 and 19 against the new spellings keeps every recorded tape naming the same fault. The append-only rule is about the set, not the spelling. `src/tape/__tests__/wireCodes.test.ts` holds the two lists against each other and takes the same edit.

---

## 9. ADR filenames

Filenames only. ADR bodies cite each other by number, and every code citation in `src` is of the form `(ADR 0016)`, so no cross-reference breaks on a rename.

| Today | New |
|---|---|
| `0006-authored-rows-not-a-director.md` | `0006-authored-waves-not-a-director.md` |
| `0016-mob-types-and-templates-are-pools.md` | `0016-mob-types-and-formations-are-pools.md` |
| `0034-a-drop-is-an-offer-of-three-and-the-grave-swallows-one.md` | `0034-a-power-up-is-an-offer-of-three-and-the-grave-swallows-one.md` |
| `0041-a-mob-holds-the-templates-arriving-motion-for-a-beat.md` | `0041-a-mob-holds-the-formations-arriving-motion-for-a-beat.md` |
| `0051-the-drain-out-becomes-a-sparse-last-row.md` | `0051-the-drain-out-becomes-a-sparse-last-wave.md` |
| `0052-the-undertakers-length-is-bought-in-chunks.md` | `0052-the-undertakers-length-is-bought-in-phases.md` |
| `0054-the-ladder-reads-twice-in-the-storm-and-on-a-strip.md` | `0054-the-ladder-reads-twice-in-the-storm-and-on-the-hud.md` |
| `0056-the-director-spends-a-finite-budget-per-phase.md` | `0056-the-director-spends-a-finite-budget-per-section.md` |

Eight files, and each one's `# Title` line takes the same edit.

Checked and deliberately not renamed:

- `0009-creation-web-template-base.md`. "Template" there is the create-pixi project template, a different sense entirely and not part of the game's vocabulary.
- `0032-the-frame-row.md`. The tape's frame row is a table row and keeps its name.
- `0046-a-runs-roster-is-drawn-from-a-growing-pool.md`. A false hit: "growing" contains the letters.
- `0055-a-stripped-rung-falls-onto-the-field-as-a-body.md`. The verb, which survives the rename intact.
- `0049-the-stage-runs-eight-to-ten-minutes-in-named-sections.md`, `0050-three-sections-and-one-boundary-is-not-a-boss.md`, `0060-growth-over-the-run-is-authored-per-section-and-the-director-never-owns-it.md`. Section stands, so these stand.

---

## 10. Draft ADR

Filed as the next free number. In the shape of the existing ADRs: prose paragraphs, no headings, no bullets, ruled-by line last.

> # The system vocabulary is the genre's; flavor stays at the player's surface
>
> The glossary's system layer uses the words the genre's designers and players already use, and a flavor word survives only at the surface the player touches. This is Supergiant's split in Hades, where the player is offered Boons from the gods and the code that resolves them calls them Traits: the fiction owns the noun the player hears, and the machinery owns the noun every developer already knows. Six terms are realigned on this ruling. A boss's health segment stops being a chunk and becomes a phase. The stage's own segment, which was a phase, collapses into the section it was always a subset of. An authored spawn entry stops being a row and becomes a wave. The shape a group arrives in stops being a template and becomes a formation. The permanent upgrade a carrier leaves on the field stops being a drop and becomes a power-up. The readout inside the field frame stops being a strip and becomes the HUD. Everything else in the glossary stands, including Grave, Swallow, Corpse, Feast, Belch, Toll, Lay, the three section names and every mob type, because those are the surface and the surface is where the fiction earns its keep.
>
> The cost of the old policy was measurable in the glossary itself. `CONTEXT.md` holds a hundred and one terms, each with an Avoid list, three hundred and forty one bans over three hundred and fourteen distinct words, and exactly five of those bans resolve a real collision, which is a ban carrying a parenthetical because the banned word is already taken by another term. Two of the five sit in one entry: Chunk banned "phase (belongs to the stage)" and "stage (of a fight)". So the single place where the project word stood on the genre's word needed two thirds as many collision notes as the entire rest of the vocabulary. That is not a vocabulary defending itself against ambiguity; it is a vocabulary defending one coinage against the two words every reader will reach for.
>
> The code had already voted. The readout module is `RunHud.ts` and exports `createRunHud` and `HudLines`, and the noun "strip" appears nowhere in `src` or `scripts` at all. The prototype's authored timeline type is `WaveRow`. A shipped test names its stage row local `wave`. The reading that measures the stage's segments is `sectionTimeline.ts`, whose opening line is "Every section the tape crossed" and whose stored field is called `phase`, reduced under a report key called `phaseSpans`. Three coders on three days reached past the glossary for the genre's word without being asked, and one of them wrote the same reading under two names because the two names meant the same thing.
>
> The precedent runs the other way from the old policy in every parent this game has. Shmups Wiki uses "phase" undefined in its own glossary and draws a phase boundary as a line in a boss's health bar; Warcraft Wiki hangs Onyxia's phases on 65 and 40 percent health. Shmup strategy writing calls a stretch of a stage a section, "the section with the bridge", and Touhou Wiki heads every stage strategy page "Stage Portion" or "Stage section", both translating 道中, the part of a level before the boss. Vampire Survivors' community and Brotato's shipped `WaveGroupData` both put "wave" on the authored entry, and Brotato makes the standing case a `repeating` flag on that same resource rather than a second noun. SHMUP Creator defines a wave as "a formation, a group of the same enemy starting from the same position", Bandai Namco's own Galaga page names the formation and the three enemy types as two axes in consecutive sentences, and the shipped hobbyist idiom in `waves.json` files splits the two into a wave carrying a `formations` array, which is exactly the split this game already builds. Gradius is where the power-up came from and is already cited in ADR 0034: Konami's own manual says "when you defeat certain enemies or enemy squadrons, a power-up capsule will appear", and the player flies over it to buy a permanent step of a weapon system. Darktide ships its pacing vocabulary as plain code terms, `hordes` and `roamers` and `specials` and `trickle_hordes`, with no flavor layer over the machinery at all. Against that, "chunk", "template", "row" and "strip" are four coinages carrying no meaning a new reader can bring with them, and one of them, "template", collides with the project scaffolding sense inside this repository.
>
> What this does not do is licence a sweep. The ruling is a test applied one term at a time, and the test has two halves: does the genre have a settled word for this exact thing, and is the term a system word rather than a word the player meets. Corpse fails the second half and stays, even though the genre's word for the thing a killed enemy leaves is an experience gem, because a grave eating bodies is the premise and the player sees a body. The three section names, the six formation names and every weapon line stay for the same reason. A term with no genre word stays too: the standing wave keeps its qualifier because the survey found no shipped noun for a time-keyed continuous schedule that this glossary had not already spent.
>
> This ruling changes no simulation behaviour. The tape's header is positional and every enum crosses it as a number, so `FORMAT_VERSION` and `WITNESS_VERSION` do not move and the golden digest does not re-pin. `READINGS_VERSION` moves from three to four, because eight reading and report keys change name and a version-four report cannot be matched to a version-three one by name, which is the same reason version three moved.
>
> Ruled by Mark 2026-09-09, ahead of slice B, because slice B rewrites the wave tables and the golden pin regenerates anyway. The evidence for each of the six picks lives in [../research/six-words-realigned-to-the-genre.md](../research/six-words-realigned-to-the-genre.md), and the survey of the spawn vocabulary it rests on is [../research/naming-the-authored-growth-rate.md](../research/naming-the-authored-growth-rate.md).

---

## 11. The new CONTEXT.md entries

Six replacements, in the sections they belong to, with the Avoid list banning the old project word in each.

**Phase**, in the Bosses section, replacing Chunk:

> **Phase**: One segment of a boss's health bar, owning one authored pattern, ended by a short invincible flash. _Avoid_: chunk, health bar segment, stage (of a fight), section (which is the stage's).

**Section**, in The field and the stage, absorbing the old Phase entry:

> **Section**: One segment of the stage, chained to the next by a boundary event rather than an absolute clock, because a shootable boss dies when killed. Three of the seven are the named trash sections, the Procession, the Crowd and the Vigil, and each owns one property no other section has. The boss fights, the set piece and the ending are sections too, each one as long as what happens in it takes. _Avoid_: phase (which is the boss's), act, chapter, zone, area.

**Wave**, replacing Row:

> **Wave**: One entry of the authored timeline: a section-local time, a formation, a count, and a mob type. Count lives on the wave, so density tuning never edits a formation, and the mob type lives there too, because a formation never names who is in it. _Avoid_: row, spawn event, script line, formation (which is the shape, not the entry).

**Standing wave**, replacing Standing row:

> **Standing wave**: A wave that stands for its section rather than firing once: a mob type, a formation, and a rate of bodies a second that ramps between two figures across the section's authored span, repeating down to a minimum interval. What stands is the wave and never the bodies, which fall like any others. It is the growth a run feels over its length, keyed to the clock and never to anything the player did, and the director adds over it rather than owning it. A section may declare none. _Avoid_: standing row, floor stream, faucet, spawn rate, wave table, repeating wave.

**Formation**, replacing Template:

> **Formation**: A named placement from the library: where a group of mobs arrives and how it is arranged, never which mob type is in it. Each teaches a lesson, and the library is open. The starting six are Drips, the File, the V, the Pincer, the Rain, the Wall. _Avoid_: template, pattern, spawn type, wave (which is the entry, not the shape).

**Power-up**, replacing Drop:

> **Power-up**: A permanent upgrade a carrier leaves where it died. It spawns as an offer, and the grave gets the option it passes under. Power-ups never decay. _Avoid_: drop, item, upgrade item, pickup, loot.

**HUD**, replacing Strip:

> **HUD**: The slim readout inside the field frame carrying the score and each line's rungs as pips: the ladder's second channel, and the one that makes a rung lost legible inside a dense storm. It announces by count, shape or subtraction, never by brightness. _Avoid_: strip, bar, panel, overlay.

### The other entries the rename touches

Not this record's picks, but the same edit has to reach them or the glossary contradicts itself. Listed for whoever owns `CONTEXT.md` at the time.

- **Carrier** bans "power-up carrier" today, which becomes the accurate description. It needs a new Avoid list: item enemy, power-up mob, drop mob.
- **Card** bans "wave" today to keep a directed add distinct from an authored entry. The ban stands and earns a parenthetical: "wave (which is the authored entry)".
- **Cone** bans "wave" and says "Its angles, reach and push are tuning rows". The ban stands; the sentence wants "tuning table rows" so the plain word is not read as a spawn entry.
- **Checkpoint** bans "phase" and says "Never a segment of the stage". Both become "section".
- **Treasure**, **Overflow**, **Offer**, **Swallow**, **Corpse**, **Rung** and **Freshness** all name drops in their bodies.
- **Boss** says "chunked health"; **Feast** says "dropped at chunk breaks"; **Burst** says "lands the boss chunk".
- **Sparse last row**, **The Crowd**, **The Procession**, **The Vigil**, **Directed density**, **Set piece**, **Armed** and **Stage** all name rows or phases in their bodies.
- **Arriving beat** and **Mob** name the template.

---

## Open items

- **`ReplayPhase` is a third sense of "phase" and it survives.** `src/app/screens/tapePlaybackSession.ts` uses `phase` for the playback session's own lifecycle, `'idle' | 'fetching' | 'verifying' | 'fastForwarding' | 'playing' | 'played'`. It is an app-layer state machine, never domain vocabulary, and it never meets a boss or a stage in one file. It is left alone, and it is the one place a future reader could be confused by three senses of the word instead of two.
- **"Powers" already means something else in this codebase.** `SteeringPowers`, `EndingPowers`, `backdropPowers` and `PoweredScreen` come from `code-core.md`'s "powers arrive as props at construction". `PowerUp` never collides with them as an identifier and never shares a layer, but the root is now doing two jobs. Recorded as the one real cost among the six.
- **`wavering` is a configuration hand name and contains the word "wave".** After the rename a grep for wave hits it. A naming hazard for the coder, not a semantic collision: a hand is a policy knob and a wave is a spawn entry.
- **Precedent runs one level flatter than the standing wave's shape, and that finding is not this record's to act on.** [naming-the-authored-growth-rate.md](naming-the-authored-growth-rate.md) section 5 and its open items already hold it: no shipped survivors-like makes the continuous case a separate kind of entry, and none composes a lerp between two figures with a repeating interval decaying to a floor. The rename does not touch that and does not resolve it.
- **No genre source defines a formation as a named shape you fill with an arbitrary type, and that step is this project's own.** Shmups Wiki has no "Formation" headword at all and Sega-16 formally defines only "Bullet Formation". What the genre gives is that formation names the arrangement and the type is tracked separately (Galaga, Gradius). The fillable-template step is ADR 0016's ruling and SHMUP Creator's data model, and this rename borrows the noun rather than the definition.
- **The genre never numbers its sections, and this stage does not either, which is agreement rather than a problem.** Shmup guides identify a section by landmark ("the section with the bridge") or by position against the boss, and Taisei encodes that as `pre-midboss` / `post-midboss` / `post-midboss-filler` skip markers rather than as a data type. This stage names its sections. Recorded because the finding would be a warning for a game that shipped "Section 3", and this one does not.
- **The Chunk entry's "ended by a short invincible flash" has no cited precedent in this record.** The phase word is evidenced; the flash is this game's own and stays as it is.
- **Wyatt Cheng's "Procedural Enemy Waves" chapter is still unread, and it is chapter 16 rather than the 14 the naming record cited.** Taylor and Francis returns 403 to fetch and a JavaScript shell to curl, the chapter PDF is paywalled, archive.org has no copy and Google Books reports no preview edition. Its four method headings are known and its containing noun is not, so nothing in this record leans on it.
- **Whether the three fault identity strings should relabel at all is a judgment, not a fact.** The wire is safe, the numbers hold, and the append-only rule reads as being about the set. If the coder or a gate disagrees, the fallback is to leave the three strings alone and accept that three of twenty-one identities carry retired words, which costs nothing on any tape.
- **The draft ADR's fifth paragraph makes a commitment the ruling does not literally contain, and it is Mark's to strike.** Mark ruled that the system layer takes the genre's word and flavor stays at the player's surface. The draft turns that into a two-part admission test and adds a second half, that a term with no settled genre word stays as it is. That follows from the ruling (there is nothing to take), and it is what holds the standing wave's qualifier in place, but it is a rule the ruling did not say out loud. Written into the draft rather than applied silently.
- **This record measures `src` and `scripts` only.** The 23 files under `docs/design`, 32 under `docs/adr`, `docs/lessons.md` and `README.md` that carry an old word are counted, not enumerated, because other hands hold those files while this was written.

---

## What this settles

**Chunk becomes phase.** Shmups Wiki uses "phase" undefined in its own glossary, ties a phase to its own HP pool on the STELLAVANITY page, and draws the phase boundary as a line in the health bar on the Espgaluda page; Warcraft Wiki defines boss fights as consisting of phases and hangs Onyxia's on 65 and 40 percent health. There is no runner-up: "chunk" has no currency in either lineage.

**Phase collapses into Section, and Section is the genre's word rather than a convenience.** They are one unit, not two: seven records of one type, three of them labelled sections, no section record and nothing finer, and a reading already written under both names. Shmups Wiki's prose says "the section with the bridge" and "the airship section", Touhou Wiki heads every stage strategy page "Stage Portion" or "Stage section", both translating 道中, and Radiant Silvergun ships lettered sub-sections as a scoring mechanic. Left 4 Dead's EMS enum is the shipped precedent for one flat list holding the boss segments and the trash segments together. Act has zero hits in either lineage and is Sonic's alone; area means a whole stage; segment has zero hits and is already banned as a circumlocution; beat has the best definition and no player currency, and this project has spent it three times. Section absorbs all seven, the three-member `SectionName` becomes `TrashSectionName`, and that coinage is the collapse's only cost.

**Row becomes wave.** Both parents put "wave" on the authored entry, and Sega-16's glossary defines it as "A specific group of enemies which appears at a certain point in a stage", which is this game's Wave almost verbatim. The contest the naming record found is over the standing case, which Brotato settles with a flag on the same resource rather than a second noun. Standing row becomes standing wave: the physics reading is a real hazard and it loses to the fact that the runner-up, repeating wave, gets worse under the rename than it was under the old noun.

**Template becomes formation.** SHMUP Creator's definition, Bandai Namco's own Galaga page naming the formation and the three enemy types as two axes in consecutive sentences, the Gradius wiki's "formation enemy" class shared across three unrelated types, and `rusty-ship`'s shipped `waves.json` naming the entry and the shape as two fields on one object. Pattern and spawn type stay banned; template also collides with the project scaffolding sense inside this repository. The limit is recorded: the genre gives the noun and the two-axis habit, not the fillable-template definition, which is ADR 0016's own.

**Drop becomes power-up.** The two parents disagree, and the tiebreak is which parent's mechanism this is. It is Gradius's, which ADR 0034 already cites, and Konami's own manual says the word: "When you defeat certain enemies or enemy squadrons, a power-up capsule will appear." Four of five shmups checked use "power-up" for the object, and Sega-16 draws the line the glossary needs, a power-up being a thing that increases the craft's abilities against an item, which is the umbrella over score pickups too. Item loses on being that umbrella and on being banned twice already; upgrade loses on being the word that defines the entry rather than names it; capsule loses because the genre defines a capsule as a container you shoot open. Two costs are recorded rather than argued away: "powers" already means props-at-construction in this codebase, and two survivors-likes use "power-up" for a meta-progression buy and for a timed buff, neither of which this game has. Corpse stays as flavor, declining the genre's Experience Gem, Materials and Gems, because the genre disagrees with itself there and the player sees a body.

**Strip becomes HUD.** The code never wrote a `Strip` and has exported `createRunHud` and `HudLines` the whole time. The verb survives with no collision left, and the vocabulary ends with one sense of the word where it had two.

**One version moves.** `READINGS_VERSION` goes 3 to 4 on eight renamed keys, under its own version-3 precedent. `FORMAT_VERSION` stays 3, `WITNESS_VERSION` stays 6 and `GOLDEN`'s values all hold, because the tape is positional and every enum crosses as a number.

---

## Sources

The boss phase:
- Help:Glossary, Shmups Wiki: <https://shmups.wiki/library/Help:Glossary>
- Mushihimesama, Shmups Wiki: <https://shmups.wiki/library/Mushihimesama>
- STELLAVANITY - Prelude to the Destined Calamity -, Shmups Wiki: <https://shmups.wiki/library/STELLAVANITY_-_Prelude_to_the_Destined_Calamity_->
- Espgaluda, Shmups Wiki: <https://shmups.wiki/library/Espgaluda>
- Boss, Warcraft Wiki: <https://warcraft.wiki.gg/wiki/Boss>
- Onyxia (Classic), Warcraft Wiki: <https://warcraft.wiki.gg/wiki/Onyxia_(Classic)>
- Godrick the Grafted, Elden Ring Wiki: <https://eldenring.wiki.fextralife.com/Godrick+the+Grafted>

The stage's section:
- Raiden IV, Shmups Wiki, the section with the bridge: <https://shmups.wiki/library/Raiden_IV>
- Battle Garegga stages, Shmups Wiki: <https://shmups.wiki/library/Battle_Garegga/Stages>
- DoDonPachi, Shmups Wiki, the airship section: <https://shmups.wiki/library/DoDonPachi>
- Sengoku Ace strategy, Shmups Wiki: <https://shmups.wiki/library/Sengoku_Ace/Strategy>
- Gradius III strategy, Shmups Wiki, part and section side by side: <https://shmups.wiki/library/Gradius_III:_Densetsu_kara_Shinwa_e/Strategy>
- Radiant Silvergun sub-sections, Shmups Wiki: <https://shmups.wiki/library/Radiant_Silvergun>
- Ikaruga, Shmups Wiki: <https://shmups.wiki/library/Ikaruga>
- Legacy of Lunatic Kingdom Stage 1 strategy, Touhou Wiki, "1st Stage Portion": <https://en.touhouwiki.net/wiki/Legacy_of_Lunatic_Kingdom/Gameplay/Strategy/Stage_1>
- Unconnected Marketeers Stage 1 strategy, Touhou Wiki, "Stage section 1": <https://en.touhouwiki.net/wiki/Unconnected_Marketeers/Gameplay/Strategy/Stage_1>
- Japanese shmup terminology reference, 道中 as "the part of a level before the boss": <https://shmups.system11.org/viewtopic.php?f=1&t=66723>, glossary at <https://pastebin.com/6DW0zyvu>
- Taisei stage 1 timeline, the `pre-midboss` / `post-midboss-filler` / `pre-boss` bookmarks: <https://github.com/taisei-project/taisei/blob/master/src/stages/stage1/timeline.c>
- Left 4 Dead 2 EMS stage type appendix, the flat named-stage enum: <https://developer.valvesoftware.com/wiki/L4D2_EMS/StageTypeAppendix>
- Zone, Sonic Retro, on Acts: <https://info.sonicretro.org/Zone>
- Pacing and Encounter, The Level Design Book, on beats: <https://book.leveldesignbook.com/process/preproduction/pacing>, <https://book.leveldesignbook.com/process/combat/encounter>

The formation:
- SHMUP Creator, enemies and waves: <https://www.shmupcreator.com/doc/?docs=shmupcreator%2Fobjects-and-entities%2Fenemies-and-waves>
- Galaga Web, Bandai Namco Entertainment: <https://galaga.com/en/history/galaga.php>
- Zako and Goei, Galaga Wiki, types in rows of one formation: <https://galaga.fandom.com/wiki/Zako>, <https://galaga.fandom.com/wiki/Goei>
- Battle Axe, Dordia and Foss, Gradius Wiki, the "formation enemy" class: <https://gradius.fandom.com/wiki/Battle_Axe>, <https://gradius.fandom.com/wiki/Dordia>, <https://gradius.fandom.com/wiki/Foss>
- Enemy spawning, Emanon devlog, the formation as a container object: <https://watto-a.itch.io/emanon/devlog/438108/enemy-spawning>
- Hobbyist `waves.json` idiom, a wave carrying formations: <https://raw.githubusercontent.com/rhettjay/rusty-ship/main/assets/content/waves.json>, <https://raw.githubusercontent.com/timdobras/astral_shards/main/assets/config/waves.json>

The power-up, and what the genre calls the XP pickup:
- Gradius Collection instruction manual, Konami 2006, page 4: <https://www.gamesdatabase.org/Media/SYSTEM/Sony_PSP/Manual/formated/Gradius_Collection_-_2006_-_Konami.pdf>
- Power Capsule, Fan and Dee-01, Gradius Wiki: <https://gradius.fandom.com/wiki/Power_Capsule>, <https://gradius.fandom.com/wiki/Fan>, <https://gradius.fandom.com/wiki/Dee-01>
- R-Type manual, "unit symbols": <https://www.smspower.org/seganotebook/rtype/manual/rtypem.html>
- Raiden, Shmups Wiki and StrategyWiki: <https://shmups.wiki/library/Raiden>, <https://strategywiki.org/wiki/Raiden>
- DoDonPachi items, Shmups Wiki: <https://shmups.wiki/library/DoDonPachi>
- Twin Cobra, StrategyWiki: <https://strategywiki.org/wiki/Twin_Cobra>
- Tyrian power-up pods, Wikipedia: <https://en.wikipedia.org/wiki/Tyrian_(video_game)>
- Unofficial Shmups Glossary, Sega-16, definitions of wave, power-up, item, capsule, pod and bullet formation: <https://www.sega-16.com/2005/04/unofficial-shmups-glossary/>
- Vampire Survivors passive items, weapons and PowerUps: <https://vampire.survivors.wiki/w/Passive_items>, <https://vampire.survivors.wiki/w/Weapons>, <https://vampire.survivors.wiki/w/PowerUps>
- Vampire Survivors Experience Gem and Pickups: <https://vampire.survivors.wiki/w/Experience_Gem>, <https://vampire.survivors.wiki/w/Pickups>
- Brotato shop, items and upgrades: <https://brotato.wiki.spellsandguns.com/Shop>, <https://brotato.wiki.spellsandguns.com/Items>, <https://brotato.wiki.spellsandguns.com/Upgrades>
- Brotato materials: <https://brotato.wiki.spellsandguns.com/Materials>
- Halls of Torment experience and pickups: <https://hot.fandom.com/wiki/Experience>, <https://hot.fandom.com/wiki/Pickup>

Shipped data and authoring formats, reused from [naming-the-authored-growth-rate.md](naming-the-authored-growth-rate.md) rather than re-fetched:
- Brotato decompiled `WaveGroupData` and `WaveData`: <https://github.com/Yeet195/BrotatoDecompiled/blob/main/Brotato/zones/wave_group_data.gd>, `.../wave_data.gd`
- Vampire Survivors shipped stage data: <https://github.com/Dezzelshipc/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Stage.json>
- Vampire Survivors enemy arrival rules: <https://vampire.survivors.wiki/w/Enemies>
- Darktide pacing template: <https://github.com/Aussiemon/Darktide-Source-Code/blob/master/scripts/managers/pacing/templates/default_pacing_template.lua>
- SHMUPKIT spawners and attack waves: <https://minilop.itch.io/shmupkit>
- Deepnight LD39 `WaveEmitter`: <https://raw.githubusercontent.com/deepnight/ld39-zeroVoltX/master/src/en/WaveEmitter.hx>
- HoloCure enemy patterns: <https://holocure.wiki.gg/wiki/Enemy>
- OpenTyrian event records, Danmakufu ph3 reference, Sparen's ph3 tutorials, as cited in the naming record

Refused, recorded so nobody re-runs them:
- `en.touhouwiki.net` returns HTTP 418 to a plain fetch, including <https://en.touhouwiki.net/wiki/Spell_card>. Curl with a browser user agent works, which is how the stage-portion headings above were read.
- Every Fandom wiki returns HTTP 402 to a plain fetch and 403 to plain curl behind Cloudflare, including `touhou.fandom.com`, `gradius.fandom.com`, `galaga.fandom.com` and `hot.fandom.com`. Their `api.php` endpoints answer, which is how those quotes were read.
- `strategywiki.org` returns HTTP 403 on HTML; its `/w/api.php` answers.
- `shmups.system11.org` returns HTTP 403 to fetch and to scripted curl, including the directly relevant thread "Pacing: On Filler, Breaks, and Stage Length". The Japanese glossary above came from a Pastebin mirror of the terminology thread.
- `developer.valvesoftware.com` and `info.sonicretro.org` return HTTP 403 plus a proof-of-work challenge; both were reached through a text proxy.
- `dmf.shrinemaiden.org`, the Danmakufu wiki, fails TLS outright.
- `taylorfrancis.com` returns HTTP 403, so the Cheng chapter is still unread.
- `hallsoftorment.wiki.gg` returns HTTP 401; `hot.fandom.com` was used instead.
- `world-of-nintendo.com`, the NES Gradius manual transcription, returns HTTP 406; Konami's own Gradius Collection manual PDF was used instead, which is the better source.
- `https://shmups.wiki/library/index.php?title=Help:Glossary&action=raw` returns HTTP 404; the glossary quotes come from the rendered page and the phrase counts from the site's `api.php` search.
- `terraria.wiki.gg` Moon Lord fetched clean but carries no health-threshold phase language.
- DoDonPachi DaiFukkatsu/Strategy (Survival) on Shmups Wiki is a stub, headers with no content. Shmups Wiki has no Strategy page for Ketsui at all.

This repository, measured rather than cited:
- `apps/hungry-grave/CONTEXT.md`, `src/game/stage/stage.ts`, `src/game/stage/rows.ts`, `src/game/stage/templates.ts`, `src/game/bosses/chunks.ts`, `src/game/carriers.ts`, `src/game/corpses.ts`, `src/game/events.ts`, `src/game/faults.ts`, `src/game/invariants.ts`, `src/game/rng.ts`, `src/game/swallow.ts`, `src/game/witness.ts`
- `src/tape/wireCodes.ts`, `src/tape/records.ts`, `src/tape/chunks.ts`, `src/tape/decode.ts`
- `src/dev/readingsVersion.ts`, `src/dev/digest.ts`, `src/dev/batchReport.ts`, `src/dev/compareRuns.ts`, `src/dev/readings/readings.ts`, `src/dev/readings/sectionTimeline.ts`, `src/dev/readings/dropLedger.ts`, `src/dev/readings/arrivals.ts`
- `src/app/screens/game/RunHud.ts`, `src/app/routes.ts`, `src/prototypes/ugly-slice/game/stage.ts`
- `docs/adr/0034-a-drop-is-an-offer-of-three-and-the-grave-swallows-one.md`, `docs/adr/0054-the-ladder-reads-twice-in-the-storm-and-on-a-strip.md`, `docs/adr/0009-creation-web-template-base.md`

---

## Reproducing the checks

The glossary's Avoid-list arithmetic, all four numbers in claim 8:

```
cd apps/hungry-grave
grep -cE '^\*\*[^*]+\*\*:' CONTEXT.md                              # 101 terms
grep -c '_Avoid_' CONTEXT.md                                       # 101 Avoid lists
grep -o '_Avoid_: [^*]*' CONTEXT.md | tr ',' '\n' | sed 's/^ *//;s/\.$//' | sed '/^$/d' | wc -l   # 341 bans
grep -o '_Avoid_: [^*]*' CONTEXT.md | tr ',' '\n' | grep -c '('    # 5 collision parentheticals
```

That the noun "strip" is absent from the code and the verb is not:

```
grep -rniE '\bthe strip\b|\ba strip\b' src scripts --include='*.ts'
grep -rhoE '\b[A-Za-z_]*[Ss]trip[A-Za-z_]*\b' src scripts --include='*.ts' | sort -u
```

That the six words never reach the wire:

```
grep -niE 'phase|chunk|template|drop|row|section' src/tape/records.ts | grep -viE 'chunk'
sed -n '/FAULT_IDENTITY_CODES/,/^};/p' src/tape/wireCodes.ts
```

Every identifier carrying each word, which is how the map in section 7 was built:

```
for w in Row Phase Chunk Template Drop Strip; do
  echo "== $w"
  grep -rhoE "\b[A-Za-z_]*[A-Za-z]$w[A-Za-z_]*\b|\b$w[A-Za-z_]*\b" src scripts --include='*.ts' \
    | sort | uniq -c | sort -rn
done
```
