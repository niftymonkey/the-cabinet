# Design record: the mow, the ladder and the director (path step 4, tickets #39 and #85)

The craft calls this step runs on, each taken by the planning session under the push's pre-authorization item 8 (`docs/push/pre-authorizations.md:14`: tuning data, test design, file layout), each backed by research or by a measurement in the tree, each open to Mark's overrule on the branch before merge.

Every magnitude below is an initial data row. The first batch reads it and the second round moves it. Nothing here is a ruled number, and nothing here belongs in an ADR unless section 11 names it.

The harness measures and never judges. Every figure in this record and every figure the batch prints is one thing against another: this build against that build, this hand against that hand, never this number against a target (ADR 0053: "this build against that build, this configuration against that one, never this number against a target"). Whether the game is fun stays a person's answer (ADR 0013).

Gates never overrule Mark. A gate finding that would reverse, defer or narrow something he decided is written into the branch note as "gate disagrees with ruling X", filed as a ticket, and the ruling is built on. That applies to every ruling in section 2 without exception.

Line citations were read in this worktree on 2026-09-09, at branch tip `9dfd0ca079`. Section 13 says which of the brief's own claims did not survive that read.

---

## 1. What step 4 is, as moments of play

Everything authored is re-authored so the game starts from a better place, and then the director goes on top. Three changes ship in one pass rather than in sequence, because each one is measured through the other two.

**The moment the first two minutes should be.** Today the Procession is a body every four to nine seconds, one template live, on the skull stream alone at level one. Mark played it and called the start boring. What it should be is a small, constant mow: bodies arriving faster than one at a time, dying in one skull each, and a corpse trail worth diving into rather than a lone corpse sitting in an empty field. The section still owns emptiness, because emptiness is a ceiling on what the director may add and never a law about how many bodies the schedule sends (`stage-floor.md` section 1, `stage.ts:72`).

**The moment the middle should be.** The Crowd owns overlap, and today two templates live is two small groups. What it should be is the field the phrase "bullet heaven" describes: enough bodies that the storm is visibly eating them, corpses stacking into a floor the grave swims through rather than objects to choose between, and the player's own guns doing the work. Mark's felt run went from that start into dodging without the power to kill; the mow answers the second half by making the power arrive against something worth killing.

**The moment a boss should be.** A boss is the dose of hell, and it is a dose because the trash around it is heaven (ADR 0050: "bullet heaven with doses of bullet hell from bosses"). Today the roster carries fire on the mow body, so the field is a low, constant drizzle of shots and the boss is a louder drizzle. After the mow the fire lives on the revenant, the few and the tough, and on the bosses, so the difference between a trash minute and a boss minute is a difference in kind.

**The moment the end should be.** Mark's felt run ended super easy near max. Reaching the end with every line maxed should be rare and for the best players, and the ceiling stays high and visible for everyone else. The lever is not a lower cap: it is that a full build takes more of the schedule than it takes today, and that the field a maxed player meets is a field the director has been raising while they built. **Adjusted by the product vision gate and the game design gate:** the third lever this paragraph carried was that an offer left standing costs something, which was the bank expiry, and section 5 item 5 withdraws it from round one. Round one measures the ladder against the field the mow makes rather than moving it.

**The moment the director exists for.** A player who is being hurt meets the authored floor and nothing more. A player who is not being hurt meets the floor plus whatever the phase's purse can still buy, added between the rows, quiet for an interval after each add, and silent through the four authored moments. The player should feel the game answer their power without the game ever reading their power.

---

## 2. Mark's rulings, verbatim, and what each binds

All five are his, all dated 2026-09-09, and they are quoted from `docs/push/handoff.md:18`.

**The mow.** "bullet heaven is mowing and mowing, getting more power and seeing more and harder enemies as you get it; density is bought with weak bodies, never tough ones."

It binds items 1, 2 and 3 below. It settles the direction of every health row in the step: a denser minute is paid for by making bodies weaker, never by making them tougher, which is what every shipped survivors-like does and is why the #76 pass A touch counts are superseded rather than defended.

**The ladder.** "reaching the end with every line maxed should be rare and for the best players, but the ceiling stays high and visible; rarity and skill expression, never a lower cap."

It binds item 5. It rules out the cheapest lever, `MAX_LEVEL` (`roster.ts:16`), and rules out cutting the carrier count as a first move, because both lower what a player can see. What is left is cost and skill, and the cost this step buys is a field that makes reaching an offer a real move. **Adjusted by the product vision gate and the game design gate:** this paragraph used to name a second cost, an offer that goes away, and item 5 withdraws it on the measurement. The ruling is untouched and every lever it forbids stays forbidden.

**One pass, not a sequence.** "The three changes (authored schedule, progression curve, director) ship in one pass, not sequenced."

It binds section 6. There is no batch between the schedule and the director, because a director tuned against the old schedule would be tuned against a field that will not exist.

**The density ADR gates first.** "A density ADR passes the game design gate before filing (pre-authorization 6)."

It binds the order in the dispatch plan: the gate runs on the density decision before the ADR is written, not after.

**Two ADRs stand and they are his.** "ADR 0047 (director reads pressure, never power; four off-limits moments; rows are the floor; own seeded streams) and ADR 0056 (finite purse per phase, quiet interval after an add, signal reads harm and never a nearby kill, caps re-derived and never evicting) stand and are Mark's. Gates never overrule rulings."

It binds item 6 and item 7 entirely. Nothing in this record proposes a change to either, and a gate finding against either is a note for Mark rather than a change.

---

## 3. Where the game is, measured

Two human runs on build `ad4657276e`, plus the harness batches from step 3. Every figure is a reading and none of them is a target.

| Reading | Today | Beside it |
| --- | --- | --- |
| Arrivals a second | 1.13 | Vampire Survivors' comparable minutes run one body every few tenths of a second |
| Bodies over a run | 458 over 406 s (356 shambler, 55 ghoul, 47 revenant) | The shambler is four fifths of the roster and carries fire |
| Mobs alive | mean 4.4, peak 30 | VS at minute 8 runs 100 on screen at 1.0 HP, at minute 11 runs 300 at 1.5 HP |
| Enemy shots in the air | peak 70 in every bot run, mean 5 | `MOB_FIRE_CAP` is 400 (`caps.ts:33`) |
| The player's storm | peak 7 under the harness hand | `SKULL_CAP` 120, `WISP_CAP` 64 (`caps.ts:131-132`) |
| Build at the end | all four lines at level 5, 35 hits, no strips | A full build is 19 rungs and the schedule holds 25 carriers (`carriers.ts:53-55`) |
| Mark's felt run | boring start, then dodging without the power to kill, then okay, then super easy near max | The four moments section 1 answers |

**The comparison that decides the direction.** Vampire Survivors buys every dense minute by making bodies weak again: minute 8 is 100 on screen at 1.0 HP, minute 11 is 300 at 1.5 HP, and minutes 5 and 12 are 10 to 20 bodies at 15 to 18 HP. Every shipped survivors-like kills trash in one to four hits at minute zero and never carries difficulty on trash health; Deep Rock Galactic: Survivor's trash sits at 0.95 times base at maximum hazard. Our shambler is 40 health against a skull's 8 (`mobs.ts:76`, `skullStream.ts:86`), which is five skulls, and five skulls at one body a second is a field the storm cannot clear.

**The economy as the code has it.** Weapon levels come only from carriers: `offer.ts:322` is the one increment of `state.levels` in the tree and `grave.ts:165` is the one decrement. 25 rows carry (`rows.ts`, 8 in the Procession, 11 in the Crowd, 6 in the Vigil), a full build is 19 rungs, and `CARRIER_SLACK` is 1.3 (`carriers.ts:45`). Corpses pay size (`CORPSES_TO_CEILING` 80, `TRASH_CORPSE_PAYOUT` 0.50625, start 27, ceiling 67.5, floor 18, and `HIT_SHRINK` 3 size units a hit, which is 5.93 fresh trash corpses; `tuning.ts:96`, `:99`, `:58`, `:53`, `:66`, `:70`), belch charge (`RESERVOIR_CAPACITY` is identically `FEAST_PAYOUT`, which is nine corpses, `tuning.ts:102`, `:109`), overflow to score, and the two on-swallow bursts (skull surge and wisp volley, ADR 0058, which carries no cadence limit).

**So ten times the bodies is ten times the belch, ten times the swallow-driven storm and an instant ceiling, and it moves the ladder not at all.** The same paid amount goes to growth and to the reservoir from one line (`swallow.ts:94-95`), so density multiplies both. The ladder's levers are elsewhere: the carrier count, `CARRIER_SLACK`, and how long an offer stands. The bank was a fourth candidate and section 5 item 5 withdraws it, because the measurement says the bank is barely reached at all.

**Three rows that decide what the mow feels like.** Shambler 40 health, every third armed, 180 ticks between shots, falling at half the scroll (`mobs.ts:76`, `:82`, `:83`, `:79`). Revenant 64 health, all armed, 150 ticks (`mobs.ts:93`, `:99`, `:100`). Ghoul 20 health, never fires, chases at 2.49 times the scroll with a descent floor (`mobs.ts:112`, `:120`, `:118`, `:153`).

---

## 4. Round 0: the frame budget

**This section is a slot and it is deliberately empty. It is filled from the measurement and never from an estimate.**

The measurement is running in parallel to this record. `src/dev/framePerformance.ts` already reads a tape's frame rows into interval, advance and update distributions with p50, p95 and p99, plus tick debt over time and every frame past `EXPENSIVE_FRAME_INTERVAL_MS` of 25 (`framePerformance.ts:13`, `:150-162`). What round 0 adds is a synthetic field rather than a played one: 100 mobs and 250 corpses standing at once, on desktop first and on the phone at the first deploy.

It runs before any content because two rows below cannot be sized without it. Item 3's on-screen expectation and item 7's `MOB_CAP` are both bounded by what the device can draw, and the project's own lesson is that a figure taken from automated play describes the field that play produced: the shipped bot only dodges, so every peak-density figure ever taken from it describes a field with no storm in it (`apps/hungry-grave/docs/lessons.md`, "The bot").

**Round 0, desktop, measured 2026-09-09.** A synthetic field drove the real step, `checkInvariants` and `FieldRenderer`, with pools sized per row through a Vite alias over `src/game/caps`. `framePerformance.ts` was not the instrument for this: it reads frames off a recorded tape, and a tape cannot hold a field nobody played.

**The instrument now exists in the tree, added 2026-09-09.** `scripts/frame-budget.ts` stands the synthetic field and prints the table below, so the rows are reproducible rather than a one-off reading (commit `c23be6156c`, with the pool refusal at `3594fe154a`). It also produced a finding this record's section 5 item 7 has to resolve rather than note: **the shipped caps cannot stand three of the six fields.** `MOB_CAP` is 160 and `CORPSE_CAP` is 233, so the 200 / 500, 400 / 1000 and 100 / 250 rows all ask the pools for more slots than they have, and the instrument refuses a field it cannot stand rather than quietly measuring a smaller one. Those three rows were measured through a per-row alias over `src/game/caps` for that reason. Slice D's derivations are what close it: a cap derived from the standing rows is what makes the step 4 field a field the pools can hold, and until they are derived the instrument's larger rows are a measurement of the renderer rather than of a playable stage.

| field (mobs / corpses) | sim tick mean | sim tick p95 | render CPU mean | render CPU p95 |
| --- | --- | --- | --- | --- |
| 4 / 10 (today's mean) | 0.03 ms | 0.05 ms | 0.43 ms | 0.9 ms |
| 30 / 60 (today's peak) | 0.08 ms | 0.15 ms | 0.71 ms | 1.2 ms |
| 80 / 200 (step 4 peak) | 0.12 ms | 0.25 ms | 1.14 ms | 1.6 ms |
| 100 / 250 | 0.16 ms | 0.31 ms | 1.77 ms | 2.4 ms |
| 200 / 500 | 0.35 ms | 0.64 ms | 3.00 ms | 3.8 ms |
| 400 / 1000 | 0.73 ms | 1.30 ms | 4.72 ms | 5.9 ms |

The step 4 field sits an order of magnitude under the 16.7 ms frame, against desktop CPU. The cost lives in the renderer, and inside the renderer it is Pixi's own render pass rather than `FieldRenderer.sync`: at 200 mobs and 500 corpses, sync costs 0.47 ms against 2.25 ms for the Pixi pass. The simulation is a rounding error next to both; invariant checks are about a third of the sim tick, which matches `docs/research/invariant-check-cost.md`. A linear fit against these rows crosses 16.7 ms around five to six thousand entities.

Two findings bind the caps slice below (item 7). One: this figure is CPU only. The measuring machine carries no GPU (no `/dev/dri`, so Chrome falls back to SwiftShader), so wall-clock frame time here says nothing about desktop or phone; GPU fill for a few hundred quads is not a plausible worry but stays unmeasured, and only the phone slot below, taken at the first deploy, closes it. Two: the caps are themselves a cost, not just a ceiling. Every pass walks the whole pool whether or not a slot is alive, and `stormTargets.ts` sizes a scratch array from `MOB_CAP` at module load, so a raised cap raises the per-tick and per-frame price even on a quiet field. A cap derived from data must be derived tight, never padded as a safety net.

One anomaly in the raw rows: 80 mobs and 200 corpses measured cheaper than a run in between, because each row plays its own run from tick zero and the two had different storms and bosses standing when sampled. It does not disturb the trend either side of it.

> **SLOT, round 0, phone, at the first deploy.** The same synthetic field on the device. To be filled from the measurement. **Do not invent these numbers.**

**What the slot does not decide. Adjusted by the product vision gate**, because this paragraph and section 12 item 4 disagreed about the phone and section 12 item 4 is the right one. `caps.ts:20-31` records that the caps "are identical on every device and are never lowered for a phone's frame budget", and that is the whole of what is settled: round 0 says what the phone draws, and no cap moves for it. What to do if the phone cannot draw the field the standing rows author is open and it is Mark's, section 12 item 4, which names lowering the authored rate and accepting a worse phone as the two moves. This paragraph used to close that by calling it a finding about the renderer, which is a judgment the measurement does not support.

---

## 5. The seven starting points

Reasoned rather than swept. Every number below is a data row the first batch moves, and each is stated as one thing against another rather than as a target (ADR 0053).

### 1. Fire lives on the few, not the many

**Carried from the brief, whole.**

Ten times the shamblers at every-third-armed is on the order of 700 shots in the air against a cap of 400 (`caps.ts:33`), and a bullet hell ten times worse than the one Mark played. The mow body stops firing: the shambler's `fire` becomes `NEVER_FIRES`, which is the row the ghoul already carries (`mobs.ts:120`, `mobFire.ts:70-77`).

Fire stays on the revenant, which is all-armed, few and tough (`mobs.ts:99`), and on the bosses, whose chunks are their own patterns (`chunks.ts:59-62`). So enemy fire on a trash minute is bounded by the revenant share of the roster rather than by the shambler share.

**Adjusted by the product vision gate.** This item used to end by saying the heaven-with-doses-of-hell promise becomes the roster split itself, and that sentence is struck. Mark's ruling is that the doses of hell come from bosses (ADR 0050). The revenant is the visible armed minority of a heaven minute, which is what a mow minute needs to stay readable, and it is never the dose. The density ADR carries the ruling in that form.

| Row | Today | Initial | What it is against |
| --- | --- | --- | --- |
| Shambler `fire` | `everyThird` at 180 ticks (`mobs.ts:82-83`) | `NEVER_FIRES` | The ghoul already carries this row |
| Revenant `fire` | `all` at 150 ticks (`mobs.ts:99-100`) | Unchanged | The few-and-tough row keeps every shot it has |
| Shots in the air, trash minute | peak 70, mean 5 | To be measured | Against `MOB_FIRE_CAP` 400, which must not bind |

**The Procession's teaching row changes with it.** The Drip of three with exactly one armed (`rows.ts:141-148`, and its rationale at `rows.ts:125-126`) is the game's first mob fire. With the shambler silent, that lesson has to be taught by a lone revenant Drip instead, which is also the standing rule that a type arrives first as a lone Drip (`stage-floor.md` section 1, ADR 0016's readable-before-it-acts).

**Alternative rejected: a low armed share on the shambler.** `isArmed` is `index % 3 === 2` today (`mobFire.ts:129-133`) and a one-in-ten share is a one-line change. At eight bodies a second even one in ten is 48 shooters a minute, and it makes the mow body a shooter with worse odds rather than a different thing. The glossary's own reason for an armed share is that "picking targets is a skill only if the player can see which mob to pick" (`CONTEXT.md`, Armed), and picking one shooter in ten out of a mow is not a skill anybody can exercise.

### 2. Trash health to one skull

**Carried from the brief, whole.**

| Mob | Health today | Initial | In skulls | In the run's other lines |
| --- | --- | --- | --- | --- |
| Shambler | 40 (`mobs.ts:76`) | 8 | five skulls becomes one | one wisp, one near toll, two far tolls, two territory pulses |
| Ghoul | 20 (`mobs.ts:112`) | unchanged | three skulls | the body threat, dies fast but not free |
| Revenant | 64 (`mobs.ts:93`) | unchanged | eight skulls | eight times trash, against Vampire Survivors' fifteen times |

Integers stay and the scale is not rewritten. **The hit count is an initial data row and it is not an invariant. Ruled by Mark 2026-09-09:** the one-skull kill, the touch counts, skull damage and the rates of fire are the session's arithmetic and never his ruling, and his ruling is the feel, weak bodies in quantity. So 8 is where the curve starts rather than a property the game keeps: it gives an exact one-skull kill against today's damage rows without turning every damage row into a float, and the four damage rows stay where they are (skull 8, wisp 10, bell 40 near and 5 far, territory 5 a pulse; `skullStream.ts:86`, `wisps.ts:71`, `bell.ts:111`, `:114`, `territory.ts:125`). What a body costs in skulls is a curve the run walks, because item 4 sets weapon damage per rung from a shipped table, and the batch moves it.

**The #76 pass A touch counts are superseded by the mow ruling.** Five skulls, four wisps, eight far tolls and one near toll was the derivation that put the shambler at 40 in the first place (`mobs.ts:60-66`), and every one of those counts is a count against a body that was meant to take work to kill. The mow ruling says a dense minute is bought with weak bodies, so the counts go and the health follows.

**One ruling inside that derivation survives, as a ratio.** The bell's far edge tickles rather than kills, which is Mark's own ruling of 2026-08-19 recorded in **ADR 0036** (`0036-the-bell-is-a-timed-pulse-of-cones.md:3`: "the far edge tickles rather than kills"). What survives is the ratio of far to near, an eighth (`bell.ts:111`, `:114`), and not the eight-tolls-to-a-shambler count that ratio produced at 40 health. At 8 health the far edge takes two tolls and the near edge takes one, and the curve between them is untouched (`bell.ts:270-271`).

**Adjusted, and this is the adjustment: the brief cites ADR 0005 for the far-toll ruling and ADR 0005 does not contain it.** ADR 0005 is seven lines and rules only that a weapon line owns its own properties. The far-toll ruling is ADR 0036's, same ruling date. Two working documents carry the wrong citation (`dispatch-5-weapons.md:262` and `docs/push/handoff.md:27`) and one carries the right one (`step-1-progression-dispatch.md:392`). The substance is unchanged; the citation moves.

### 3. Growth over the run is authored per section, as stepped rows

**Carried from the brief in substance. Adjusted in three places: the word, the shape of the growth, and what a repeating row is.**

This is the Vampire Survivors minute table in our shape, and it is the half of the split ADR 0047 does not own. ADR 0047 gives the director "density and timing inside a phase" over "the authored rows as a floor"; what has never existed is a floor that itself grows over the run. Today the floor is thirteen one-shot rows in the Procession, twenty-odd in the Crowd, and the gaps between them are four to nine seconds of empty ground, which is the emptiness Mark felt.

**Adjusted on precedent: growth is stepped and never a ramp, and a repeating row is not a second kind of row.** The research record surveyed every shipped stage table it could reach and found both halves of the brief's shape disagreed with (`docs/research/naming-the-authored-growth-rate.md` section 5 and its Open items). Four survivors-likes with visible structure author discrete figures and step them at row boundaries, and Mad Forest's own `frequency` column, which is milliseconds between spawn ticks so a larger figure is a thinner minute, is deliberately not monotonic: 1000, 1000, 500, 250, 500, 1000, 500, 500, 1500, 500, 500, 100 across its first twelve minutes. And no shipped format found makes the continuous case a separate kind of entry: Vampire Survivors puts `frequency` and `bosses` on one per-minute object, Brotato puts `repeating_interval` and `is_boss` on one `WaveGroupData`, and Taisei writes both as the same task with a count in one and a duration in the other. ADR 0060 is re-ruled to both, in place, on 2026-09-09.

**The mechanism: one construct and one list.** A `StageRow` today is a phase-local time, a template, a count, a mob type, a carries flag and a directed flag (`rows.ts:6-29`). It gains repeat fields: an interval it fires again on, a step that shrinks that interval, and the minimum the interval shrinks to, which is Brotato's `repeating`, `repeating_interval`, `reduce_repeating_interval` and `min_repeating_interval` on the same resource that carries its one-shot groups. A row with those fields unset fires once, exactly as every row does today. A row with them set is a **standing row**, and a section's growth is a run of them, each holding its own rate until the next one starts.

| Section | The standing rows it authors, in bodies a second | Why |
| --- | --- | --- |
| The Procession | 0 through the teaching rows, then 2, then 3.5, then 5, then 0 at the sparse last row | The mow arrives behind the teaching, thickens twice, and stops so the field can clear for the Banshee |
| The Crowd | 8, then 3 mid-section, then 12 | The trough is an authored step down, so the Waking lands against something |
| The Vigil | none | It is the few-and-tough minute |

**The trough is a step somebody wrote and not a dip in a curve.** One deliberate trough sits mid-section so the Waking lands against something rather than against a sustained peak (`stage-floor.md` section 1), and under the stepped shape it is simply the section's middle standing row carrying a lower figure, which is what Mad Forest does at its own minutes 5 and 8, where the `frequency` column steps back up to 1000 and 1500 milliseconds between spawn ticks. A reader sees three consecutive rows rather than one rate with an exception carved into it.

**Adjusted by the game design gate and the tech architecture gate: the teaching rows come first and the first standing row starts behind them.** The Procession's first two authored rows are the game teaching itself: the first-swallow Drip at t=2 (`rows.ts:141-148` is the second, and the first is the Drip of one at t=2) and the lone revenant Drip that item 1 puts in place of the Drip of three, which is the game's first mob fire. A standing row running from the section's first second would bury both under arrivals, so the Procession's first standing row starts after its teaching rows have fired. Two things follow. The section's opening seconds stay a teaching moment rather than becoming the mow's first seconds, which is what ADR 0016's readable-before-it-acts asks of every new type. And ADR 0015's golden scenario, which runs 600 ticks from a pinned seed and is required to stay tuning-stable, keeps roughly the field it has: the only authored row inside its ten seconds is the Drip at t=2, and no standing arrival lands in that window.

**Struck by both design gates, and this is what it was: a per-minute step on trash health and fall speed, at 0.05 and 0.005 of base.** The figures are Mad Forest's Inverse mode, which is that stage's hard mode; normal Mad Forest carries no `TimeMods` at all and its whole climb is enemy type substitution, which `docs/research/survivor-numbers.md:87`, `:98` and `:123` already said before the step was proposed. ADR 0059 is Mark's ruling and it rules the direction: growth is more enemies and harder ones, never the same enemies wearing more health. So no stat step is authored, growth is arrivals and the roster, and what would reopen it is a reading rather than an argument. Section 12 item 6 carries the question with its trigger.

**The Vigil carries no standing row, and that is a reading of its own property rather than an exception to the mow.** The section owns scarcity: less growth paid per second than the Crowd, on a roster of revenants and ghouls with the shambler thinned (`CONTEXT.md`, The Vigil). Against Vampire Survivors' own table, a section like this reads as VS's minute 5, ten to twenty bodies at fifteen to eighteen times trash health, which is a shape that table ships deliberately rather than a contradiction of the dense minutes around it. The measured quantity stays food swallowed per second and never corpses per second, because a revenant corpse pays double (`mobs.ts:94`, and `stage-floor.md` section 10 item 1).

**Adjusted: nothing measures a span, because a standing row carries its own start time. Adjusted again by the tech architecture gate: a standing row ends at the next row of any kind, and never at the end of its phase.** The brief says a rate "rising to 5 by its end", and a section has no end on the clock: every phase ends on an event, `rowsSpentAndFieldClear` or `setPieceOpened` or `bossKilled` (`stage.ts:51`, `:253-258`), and there is no duration column anywhere in `PHASES`. Under the stepped shape that stops being a problem to solve rather than one to work around. A standing row names the phase-local time it starts at, exactly as every other row does, and it holds until the next row of any kind, so a section's own list is what ends it. **That is why a section whose phase ends on `rowsSpentAndFieldClear` closes its list with a standing row authored at zero, at the time of its sparse last row.** That phase needs a field that can read clear (`stage.ts:101` and `:151`, through `phaseEnded` at `:253-258`), and a rate still producing arrivals under the sparse last row is a field that never clears, so the boss would never arrive (ADR 0051). Today it binds the Procession alone: the Vigil authors no standing row at all, and the Crowd ends on `setPieceOpened` and hands its rate to the Waking under the pour. The section's last authored row time is still data (the Procession's 116.5 seconds, the Crowd's 138, the Vigil's 67.5, at `rows.ts:231`, `:525`, `:657` through `sparseLastRow` at `rows.ts:92-100`), and it is where the last standing row's figure is chosen against and where the zero row is placed.

**Adjusted: the word. The brief calls this the floor stream, and "stream" is spoken for twice.** A stream is a named seeded random stream (`rng.ts:4`) and the skull stream is a weapon line (`CONTEXT.md`, the arsenal). The stage-floor record set the precedent when it retired "Lane" and "Descent" for exactly this collision. This record calls it a **standing row**: a row that stands from its own time until the next row rather than firing once. The concept is the brief's, unchanged; only the word moves, and the word is settled by research rather than by preference: `docs/research/naming-the-authored-growth-rate.md` surveyed the two parent genres and found every borrowable noun either spent in the glossary or pointing both ways at once, so "standing row" is what survives the three criteria and section 10 carries the reason.

**The shaped rows stay as beats on top.** Files, Vs, Pincers, the Wall, the revenant rows and the 25 carriers keep their places, with their shambler counts roughly doubled rather than tenfolded, because a File of 60 is 27 seconds of scroll and a template is a shape rather than a faucet. There are six templates and not five: `drip`, `file`, `v`, `pincer`, `rain`, `wall` (`templates.ts:12`), and `rain` is the density filler a section turns up when its property asks for it.

| Reading | Today | Initial expectation at four bodies a second |
| --- | --- | --- |
| Procession, mobs alive | mean 4.4 over the run, peak 30 | 8 to 20 |
| Crowd, mobs alive | as above | 30 to 50, plus the beats, so peaks near 60 to 80 |
| Against | `MOB_CAP` 160, derived against a 51-mob peak (`caps.ts:32`, `:20-31`) | which item 7 re-derives |

**Alternative rejected: tenfold the row counts in place.** The templates cannot hold it, the cadence between rows is 4 to 9 seconds and that cadence is the emptiness, and a Wall of 220 stops being the Wall. `templates.ts` places bodies at a `BODY` spacing of 26 units across a field 540 wide (`templates.ts:38`, `field.ts:10`), so a row of 60 is either two and a half field widths or a stack.

### 4. The food economy in units that survive the retune

**Carried from the brief, whole.**

The economy is stated in corpses of expected mowing rather than in corpses of today's trickle, so that the same sentence still means something after item 3 lands.

| Row | Today | Initial | What it is against |
| --- | --- | --- | --- |
| `CORPSES_TO_CEILING` | 80 (`tuning.ts:96`) | about 400 | The ceiling lands late in the Procession rather than ten seconds in |
| `RESERVOIR_CAPACITY`, in corpses | 9 (`tuning.ts:109`, identically `FEAST_PAYOUT`) | about 300 | A belch roughly every 40 s at Crowd rates rather than every 2 s |
| `FEAST_PAYOUT` | 9 corpses (`tuning.ts:102`) | reservoir capacity | Decision 5.11 stands: the feast still fills the reservoir in one swallow |
| The feast, in size | 4.56 units, a ninth of the climb | about 30 units | Nearly half the ceiling, which is a real moment |

**The identity between the feast and the reservoir is load-bearing and it is kept.** `RESERVOIR_CAPACITY` is written as `FEAST_PAYOUT` rather than as its own number (`tuning.ts:104-109`: "a fully fresh feast fills the reservoir and wastes nothing"). Moving the reservoir moves the feast with it by construction, and a feast that no longer filled the reservoir would break the Wall's choreography (`game-concept.md`, the split anchor).

**The on-swallow bursts get a cadence floor per line, and this is the row that is not just a number.** At ten swallows a second the level-five wisps launch on the order of 110 souls a second into a cap of 64 (`caps.ts:132`), and the wisps already land over half of all kills at today's density. Without a floor the auto-targeting line does the mowing and the player does not, which is the opposite of the feel the mow ruling describes.

| Row | Today | Initial | What it is against |
| --- | --- | --- | --- |
| Minimum interval between wisp volleys | none (ADR 0058 carries no cadence limit) | about 30 ticks | `WISP_CAP` 64, which must not bind |
| Running skull surges | one swallow buys one surge, a chain overwrites (`CONTEXT.md`, Surge) | one running surge whose duration extends to a cap | The five levels stay legible: freshness scales volley count, never column count (ADR 0058) |

ADR 0058's freshness axis is untouched. The cadence floor is a new row beside it, and section 11 carries it as a commitment rather than recording it as a decision.

**Weapon damage per rung comes from a shipped weapon level table. Ruled by Mark 2026-09-09**, in the same ruling that made the hit counts arithmetic: everything numeric under the mow moves to whatever shipped games do. **Adjusted by the tech architecture gate: this is a line's own data and it leaves ADR 0060 with the rest of the tuning.** ADR 0005 already rules that a line owns how its five levels grow, so what a rung buys is set per line against precedent rather than as one band the roster shares.

The precedent is in the tree and one record of it is in flight. `docs/research/survivor-numbers.md` holds Vampire Survivors' per-weapon level tables, worked level by level, and the axis tally over all 127 weapons in `Weapon.json`; `docs/research/weapon-growth-per-level-precedent.md` is the record slice C reads for the per-rung climb itself, **research in flight at the time of writing**. Three things in `survivor-numbers.md` bear directly.

| What the shipped tables say | Where | What it means for a rung here |
| --- | --- | --- |
| Damage roughly triples to quadruples over a weapon's eight levels: Garlic power 0.5 to 1.5, Santa Water 1 to 4, Song of Mana 1 to 4 | `survivor-numbers.md`, "Worked level tables for the control archetype" | The order of a climb, read per line rather than as a band the roster shares: Territory and the bell buy area and repel rather than damage |
| Damage is the filler axis and not the headline one: `amount` opens 22 of the level-2 grants and `power` opens only for weapons whose identity is one big hit | the same record's axis tally | A rung that only ever adds damage is the shape the genre avoids, and our lines already buy columns, souls and cones rather than a damage number alone |
| The first upgrade is the one the player must feel: Garlic's level 2 is the biggest area step in its whole table | the same record, on Garlic | The first rung of a line is not one fifth of the climb |

The rows themselves are slice C's to derive off those records and the batch's to move, **per line and never as one band across lines**, because what a rung buys differs by what the line does: Territory and the bell buy area and repel rather than damage. One thing the records cannot answer and the derivation has to: VS's tables run eight levels and ours run five (`roster.ts:16`), so the shipped curve is read as a shape over a line's whole climb rather than copied step for step. **If the derivation finds the two records do not carry enough of a table to sit against, that is research owed before slice C** and it is a step the orchestrator dispatches, not a number the slice invents.

### 5. The ladder is measured first

**Adjusted by the product vision gate and the game design gate.** The brief's item 5 was the bank expiry plus a slack that waits for a measurement. The expiry is withdrawn from round one, below, and what is left is that round one moves nothing on the ladder and reads it.

**Nothing on the ladder moves in round one.**

| Row | Today | Round one | Round two |
| --- | --- | --- | --- |
| Carriers scheduled | 25 (`carriers.ts:53-55`) | unchanged | unchanged; the count is what the ceiling is visible through |
| `CARRIER_SLACK` | 1.3 (`carriers.ts:45`) | unchanged | toward 1.1 if the sharp hand still maxes on most seeds, and ADR 0048 makes it data |
| Offer lifetime | the scroll, with no constant behind it | unchanged | unchanged |
| The bank | no deadline of any kind | unchanged | only on the condition below |

**What round one reads instead.** Three readings, each one thing against another and none of them a target.

| Reading | Where it comes from | What it is against |
| --- | --- | --- |
| Untaken death-point offers, which is the mow's routing cost | `offerChoices`, split by site | 8 in 48 runs under the sharp hand today, which is the baseline the mow is read against (`step-3-progress.md`, take-by-slot) |
| Banks per run | `offerChoices.bankedWhileStanding` and the bank's own opens | 1 in 48 runs under the sharp hand today, 0 under the sloppy one |
| Final rungs per line | `endLevels` per line, `levelUps` by name | 25 carriers against a 19-rung full build, at `CARRIER_SLACK` 1.3 |

The mow is a field change and the ladder's cost lives in crossing it. If routing through a full field is what makes a full build rare, the untaken count moves against that baseline on its own and nothing on the ladder had to be touched. If it does not move, round two has a measured reason to reach for the slack, which is the lever the ladder ruling leaves standing (rarity and skill, never a lower cap).

**The skill expression is routing, and it is the part the field change pays for.** Carriers die to wisps far from the grave and the offer opens where they died (`offer.ts:218`, site `'death'`), so reaching it costs position in a field that is now full. A banked offer opens at the grave's own x (`offer.ts:271-275`, site `'bank'`), which is why the report splits take-by-slot between the two sites.

**Withdrawn from round one: the bank expiry.**

The brief's proposal was that a banked offer not opened within one field crossing is lost, as its own event. It is withdrawn, and this is the evidence.

The bank is almost never reached. Over 48 runs under the sharp hand there was **one** banked offer, and `offerChoices.bankedWhileStanding` was 0 on 47 of the 48 with a single 1 at seed 20260936; under the sloppy hand a bank never happened at all (`step-3-progress.md`, take-by-slot split by site). A deadline on a thing that occurs once in 48 runs buys nothing a reading could see.

And the bank cannot wait long enough for a deadline to bite. `loseOffer` clears the live offer and opens the bank in the same expression on the same tick (`offer.ts:337-346`), `resolveOffer` does the same on a take (`offer.ts:309-327`), and `openBankedOffer` runs every tick and opens a bank the moment no offer is live and the phase permits one (`offer.ts:295-299`). So a bank waits under one offer lifetime and never longer. An expiry measured in field crossings would fire only where a phase withheld permission or the corpse cap refused every body, which means it would punish a player killing carriers fast, not a player leaving offers standing. That is the opposite of the ladder ruling's intent.

**ADR 0034 is not amended.** Nothing about the bank changes, so its ruling that a second drop banks toward the next one stands untouched, and no supersession is recorded.

**What would reopen it.** A batch in which banks actually happen: a run's banked opens rising off the floor, or `bankedWhileStanding` reading above zero on a real share of seeds. The mow may itself produce that, since a denser field means more carriers dying while an offer stands, and the round-one readings above are what would say so.

### 6. The director, on top, exactly as ruled

**Carried from the brief, whole. It is ADR 0047 and ADR 0056 implemented, and this record proposes no change to either.**

Per phase: a purse counted in bodies, a permission cell, cards the purse buys, spent only while the pressure signal reads low, then a quiet interval.

**Adjusted by the game design gate: what one add is.** An add is a card and never a body. A card is a template group, the same pairing an authored row is: a template, a mob type and a count. Its cost is a cost in bodies, at shambler 1, ghoul 3 and revenant 4 per body, so a card of four shamblers in a File costs 4 and a card of two revenants in a Drip costs 8. The purse spends on cards, so what arrives is always a shape a player can read, which is what `templates.ts` exists for and what a loose body would give up.

| Row | Initial | What it is against |
| --- | --- | --- |
| The purse, per phase | about a third of that phase's standing-row total in bodies | ADR 0056: "When the purse is empty the phase runs at its authored floor for whatever is left of it" |
| The Vigil's purse | 0 bodies, and a data row rather than a rule | The section owns scarcity, less growth paid per second than the Crowd, so a purse spent there buys exactly the growth the property forbids. It is zero and not null: the director may look and has nothing, which a reading can see from the first tick |
| Cost per body | shambler 1, ghoul 3, revenant 4 | The roster's own health and threat, 8, 20 and 64 |
| A card's cost | the sum over its bodies | A card is a template group, so its cost is what its count buys |
| Quiet interval | drawn from a min and a max, 4 to 8 s | ADR 0056 leaves the bounds open as design work |
| Signal hold | 5 s | Left 4 Dead's shipped constant |
| Signal decay | linear over 30 s | Left 4 Dead's shipped constant |

**Adjusted by the game design gate: what the ceilings count and what the caps count.** The two section ceilings are ceilings on shaped groups and on live bodies as the phase's own columns state them (`stage.ts:99-108`, `:149-158`), and a standing row's arrivals are the floor rather than a shaped group, so they never count against the Procession's ceiling of one live template. What that ceiling bounds is what the director may add over the floor. And the addend the mob cap takes from the director is **the largest single card, never the purse**: the purse is spent over a phase with a quiet interval between every add, so a purse-sized addend would size the pool for a moment the quiet interval forbids, and section 5 item 7 says why a padded cap costs on every tick of every run.

**The permission cell already exists.** `Phase.directed` is a column (`stage.ts:58`) and so is `StageRow.directed` (`rows.ts:28`, whose JSDoc already names the director at step 4 as its reader). The four off-limits moments read off the phase's own data rather than out of code, exactly as ADR 0047 requires: the Banshee and Undertaker phases carry `directed: false` (`stage.ts:110`, `:160`), the Waking carries `directed: false` (`stage.ts:138`), the Wall is the one authored row with `directed: false` (`rows.ts:261-268`), and the sparse last rows are the tail of the two `rowsSpentAndFieldClear` sections.

**The signal reads harm and floor events and never a kill near the grave**, which is ADR 0056's own wording and Darktide's shipped shape against Vermintide 2's. A kill up close is food here, so a near-kill term would read a player doing exactly what the design asks and answer it by holding back.

**Its dice come from its own named stream, chained, and the witness version moves once.** `StreamName` carries five members today (`rng.ts:4`) and `STREAM_ORDER` folds exactly those (`witness.ts:23-31`), so a sixth name moves `WITNESS_VERSION` from 6 to 7 (`witness.ts:41`). ADR 0047 requires it: "its own dice come from its own named seeded streams and never from the spawns stream, so authored placements downstream of a directed fill stay put and a tape alone still rebuilds the run exactly."

**Build the instrument before tuning anything, which is the research's strongest cross-game finding.** A replay graph from a tape, showing the signal, the mobs alive and every add with its reason, plus a signal lock. Then tune the gate and the population and never the signal's weights. #85's own acceptance line says the same from the other side: "A run's pressure signal can be read back off its tape and drawn against what was added and when."

**Decided by the session, on the tech architecture gate's finding: the signal lock is a value the run resolves, so it travels in the tape header and `FORMAT_VERSION` moves 3 to 4.** **Corrected 2026-09-09: this is not ADR 0056's trigger firing.** That trigger is written about one value and one only, "the day the **budget** becomes something a run resolves", and the purse stays pinned to the build, so the trigger is unfired and ADR 0056 is untouched here rather than applied or amended. The lock is a different value on its own footing: it is a figure a run resolves from its URL for a tuning experiment, ADR 0043 is where header-or-build is decided and it puts a value the run resolves in the header, and ADR 0027 rules the form it takes there, a resolved value and never an absence. The header records the lock the run resolved to, and a run with no lock records the value that means the signal ran live, because ADR 0027 forbids recording an absence. The reason to take it now rather than later is in section 8: this step already makes every saved tape a dead baseline, so a second version bump inside the same step costs nothing that the step is not already paying, and ADR 0043 puts the cheapest moment for a bump before ADR 0057's store starts filling.

**The growth-versus-pressure split is closed and it went through the design gate.** The time-keyed growth is the standing rows' and the pressure-keyed answer is the director's, so the director reads pressure and the player still feels the game answer their power. **The game design gate accepted it on the two shipped cases, Risk of Rain 2 and Halls of Torment, and ADR 0060 records it (commit `9cba278131`, re-ruled to precedent in the step 2 docs pass).** Section 12 item 1 is marked closed.

### 7. Caps become derivations of data, not constants

**Carried from the brief, whole. It is ADR 0056 implemented: "a phase's worst case is its floor plus its budget, which is a number in data, so the mob cap is re-derived above that."**

| Cap | Today | Becomes |
| --- | --- | --- |
| `MOB_CAP` | 160, derived by hand against a measured 51-mob peak (`caps.ts:32`, `:20-31`) | the worst standing-row peak plus the beats that overlap it plus the largest single card, computed from the rows |
| `MOB_FIRE_CAP` | 400 (`caps.ts:33`) | derived from the revenant peak **and the bosses**, which fire into the same pool |
| `CORPSE_CAP` | already derived: `MOB_CAP + peakArrivals(FRESHNESS_SECONDS) + TREASURE_ALLOWANCE`, resolving to 233 (`caps.ts:60-61`) | unchanged in shape; the addend `caps.ts:43-59` says is deliberately missing becomes the most the director can add inside the freshness window, which is the cards the quiet interval leaves room for and never the phase's whole purse |

**Adjusted by the tech architecture gate: three things the derivation has to get right.**

**A standing row's peak is not its rate.** A rate of bodies a second says how many arrive, and what is alive is how many arrived and have not yet died or left. The derivation reads an unkilled-lifetime row, the rate times the time a body of that type takes to cross the field, and never the rate alone, because a cap sized on arrivals alone is a cap that binds the first time nobody kills anything. A type's fall speed is its `MOB_TYPES` row for the whole run, so a lifetime is one figure per type rather than a figure per minute.

**And it starts from a measured refusal rather than from a guess.** Round 0's instrument stands a synthetic field and refuses one the pools cannot hold, and it refused three of its six rows against the shipped `MOB_CAP` 160 and `CORPSE_CAP` 233 (section 4). Those refusals are this slice's input: the step 4 field is a field the shipped caps do not have slots for, and the derivation is what makes it one they do.

**Boss fire is in the trash pool.** The Banshee's tears and the Undertaker's shots go through `fireDirectedShot` into the same `MOB_FIRE_CAP` pool the mow's revenants use (`bosses/banshee.ts:125`, `bosses/undertaker.ts:233`, `:280`, `mobFire.ts:107`). So `MOB_FIRE_CAP` is the revenant peak plus the worst boss pattern standing at once, and a derivation that read the revenant peak alone would be a cap sized for a field that never happens.

**A derived cap has to be derived tight.** Round 0's second finding is that a cap is a cost and not only a ceiling: `stormTargets.ts:113` sizes its scratch array from `MOB_CAP` at module load, `FieldRenderer.ts:175-178` allocates a sprite per slot for the mob, shot and corpse caps, and the pools are walked whole whether or not a slot is alive. Padding a derived cap as a safety net spends that padding on every tick of every run. The protection against getting it wrong is the fault, not the padding: a bound cap raises a fault and nothing is ever evicted, which is the code's own rule already (`caps.ts:6-18`, `caps.ts:60-69`) and which ADR 0056 says is that rule applied rather than a new one.

`CORPSE_CAP` is the model the other two follow: it is a proof from two clocks rather than an estimate, and `peakArrivals` is written so one more addend drops in (`rows.ts:919-929`).

---

## 6. The iteration plan, two rounds

Two rounds as Mark asked, never a sweep. Every item below is carried from the brief.

**Round 0 is the frame measurement**, section 4, running in parallel to this record.

**Then the records.** This record and the dispatch plan beside it, grilled with `/grilling` paired with `/domain-modeling`, then the three gates on the records. A gate finding against a section 2 ruling is written as "gate disagrees with ruling X" and built past.

**Then the ADRs, in this order. All three are done, in commit `9cba278131`.** The density ADR through the game design gate first, then filed: **ADR 0059, the mow**. The standing row as a new ADR: **ADR 0060, growth authored per section**. ADR 0058 amended in place for the cadence floor, carrying the dated what-stood, what-it-replaced, what-it-could-not-have-known triple: **done**. No ADR gains a combat magnitude, and none did.

**Then ADR 0060 re-ruled, in the step 2 docs pass.** The naming research came back with a finding against the shape the ADR had filed, so it is rewritten in place on precedent rather than amended to permit both: stepped values and never a ramp, and a repeating row as an ordinary row with its repeat fields set (`docs/research/naming-the-authored-growth-rate.md`). **The second gate round then struck the per-minute health and speed step the first re-ruling had adopted**, on the reading that its figures are Mad Forest's Inverse mode and that ADR 0059 rules growth as more enemies and harder ones. The number stays 0060 and the supersession triple is inside it.

**Adjusted by the product vision gate: no step in this order waits on a person.** The push runs in one-push mode, where the ADRs are the session's call and Mark reviews them on the branch before merge, so an ADR step is filed by the session rather than held for an answer. The surfaced commitments in section 11 reach him in the session recap, not as a stall in front of a slice. The one gate that runs before a filing is the game design gate on the density ADR, which is Mark's own ruling in section 2 and is a gate rather than a person waiting: it has run, and its finding is that the decision is admissible as one ADR if the title names the mow and silent trash is carried as the mow's cost, with "one skull" and the touch counts kept out of the ADR. **Adjusted by the same gate: ADR 0034 is no longer amended**, because the bank expiry is withdrawn.

**Then the slices, one Opus coder each, in this order.** The tape's build identity; the mob table and fire; the standing rows and the re-authored rows; the economy rows and the burst cadence; the caps as derivations; the witness fold widened once; the director's signal and purse; the instrument. **Eight slices, A0 and A through G**, and the bank expiry is not among them. **Slice A0 is shipped**: the tape carries a build identity that a dirty tree changes (#82), at `26a064a064`, with the cwd fix at `136a349aeb`, and it put a Build identity entry into `CONTEXT.md`. `GOLDEN` re-pins in five of the eight and section 8 says which. The dispatch plan beside this record carries each one's contract.

**Then one 48-seed batch on `steady-far` and `loose-far`**, with 192 seeds only for a victory-rate question, because the step 3 measurement found reach stable at 48 and a victory rate not (`playing-harness.md` section 4, amended). It is read in the main thread on Fable.

**Then pick the next move from that reading, dispatch it, run one more batch, then stop and let Mark play.** Nothing in round two is decided here: what round two moves is what round one's readings say is worth moving.

**What this step declines, and it is named here because the code points at this step. Adjusted by the product vision gate.** The dev-only autopilot in the rendered game is not built. ADR 0013 makes the same bot the dev-only autopilot, `bot.ts:38-41` records that it is not wired into the rendered app and names the tuning dispatch as where that would happen, and this is that dispatch. It is declined: watching a hand play is not a reading and the batch is, and the bot only dodges, so what it shows is the policy rather than the field (`docs/lessons.md`, "The bot"). The comment in `bot.ts` is updated to cite this decline rather than to promise a step that has now run.

---

## 7. What the batch must report

Every reading prints as a five-number summary with the seeds that produced the extremes named beside it, and never as a mean (ADR 0053). A finding reads as believed only where the two configurations agree on the direction.

| Reading | Where it comes from today | What this step needs |
| --- | --- | --- |
| Arrivals a second | `tuning.arrivals.total`, `byPhase`, `byType` (`readings/arrivals.ts`, declared at `batchReport.ts`) | the rate rather than the count, which is the total against the run's ticks |
| Mobs-alive distribution | `mobsAlivePerTick`, reduced as a **peak** only | a distribution over ticks, which is the one reduction the report does not have |
| Enemy shots in the air, peak | `mobFireAlivePerTick`, reduced as a peak | nothing; it exists |
| Kills by source | `tuning.engagements.fatalBlows` by name, and `damage` by name | nothing; both exist |
| Time to ceiling | `tuning.gravePath.sizePerTick`, reduced as a peak | the first tick the size reaches the ceiling, which is a new reading |
| Belch cadence | `tuning.belchCadence.fires` by boss, `ticksAtFull`, `wasted` | the interval between fires, which the fire list already carries the ticks for |
| Final rungs per line | `endLevels` per line, `levelUps` by name | nothing; both exist |
| Reach and seal rate | `run.ending` and `run.stop` as counts, plus the section timeline's spans | nothing; both exist |
| The pressure signal against the adds | absent | the director's instrument, which #85's acceptance line requires |
| What a body costs to kill, over the run | `timeToKill.ts`, which already carries hits per kill per type and per line | the minute the kill landed in. It is the instrument that decides whether a stat step ever comes back: with no step authored, a body costs less to kill every minute the ladder climbs, and this reading is what says whether the mow ends part-way through a run (section 12 item 6) |

**Two readings the batch must report that are not about the game.** How many runs stopped at the tick ceiling with no ending, which is #118 and which today makes a batch of 48 quietly a batch of 47. And the wall-clock cost of the batch, split between playing and measuring, so round two is planned against a measured figure.

**The ladder's own readings are section 5 item 5's three**, and all three come off readings that exist: untaken offers split by site and banks per run from `offerChoices`, and final rungs per line from `endLevels`.

**Three watch readings, added by the game design gate and the tech architecture gate. Each is a thing to look at, and none of them is a change.**

**The Vigil's bodies a second against the Crowd's.** The standing rows put the Vigil near a tenth of the Crowd: the Crowd steps 8, 3 and 12 bodies a second across its standing rows, on top of shaped rows that today total 255 bodies across 138 seconds, and the Vigil carries no standing row at all on 50 bodies across 67.5 seconds. That is a cliff, and it is a cliff the genre ships: Mad Forest runs 300 on screen at minute 11 and 20 at minute 12 (`docs/research/survivor-numbers.md`). Watch what the drop feels like against that precedent rather than pre-emptively softening it.

**What a hit costs, in corpses, after the economy moves.** `HIT_SHRINK` is 3 size units (`tuning.ts:70`), which is 5.93 fresh trash corpses today and about 30 at the payout item 4 moves to. Three hits still take a fresh run to the floor, which is the row that was ruled; what changes by a factor of five is how much mowing a hit costs back, and that is the reading.

**What the harness hand's belch rule prices after the shambler goes silent.** `belchWorthIt` is a threshold on live shots on the field (`harnessPolicy.ts:63-79`), and item 1 takes fire off four fifths of the roster. So the hand will belch almost only where boss patterns are in the air, and a belch cadence that collapses onto the bosses is a reading about the hand and not about the game. If the row has to move it becomes a new configuration name and never a retune of `belchWorthIt` 8, because a moved hand row compares two builds through two instruments (`playing-harness.md` section 8).

---

## 8. Costs taken eyes-open

Every item here is carried from the brief and each is a real price rather than a risk.

**Every tuning reading so far becomes a dead baseline.** Every figure in `step-2-progress.md`, `step-3-progress.md` and the step 3 batches describes a field that will not exist after the standing rows land.

**Every saved tape stops replaying twice over, and the second one is taken deliberately. Added by the tech architecture gate's finding and decided by the session.** The rows moving is the first: the witness refuses a tape the moment the run reaches a tick where the rows changed what the simulation did. The signal lock in the instrument slice is the second: it is a value the run resolves, so it goes in the header and `FORMAT_VERSION` moves 3 to 4, which refuses every format 3 tape outright rather than at a divergent checkpoint. The reason to take it inside this step rather than to defer it is that this step has already spent what the bump costs. A tape that no longer replays is a tape that no longer replays, and a second reason it does not costs nothing extra. Deferring it would spend the same cost twice, once here and once in whatever step wanted the lock, and ADR 0043 puts the cheapest moment for a wire bump before ADR 0057's store starts filling.

**`GOLDEN` moves, deliberately, and it moves more than once.** It is a constant and not a fixture file (`digest.ts:313`), and the scenario runs 600 ticks from a pinned seed under a scripted input that kills by each victim's own health (`digest.ts:203`), so a health row does not change its kills. What does move it is the witness fold: it folds every live mob's health and carrier flag, the grave's size and reservoir, the live offer and the bank, the boss and set piece, and every stream cursor. The brief says `GOLDEN` regenerates once, and that is true of the intent and false of the mechanism. **Five of this step's slices are permitted to re-pin it**: the mob table and fire, the standing rows and the re-authored rows, the economy rows, the widened witness fold, and the director. No other slice may move it, and a move in one that may not is a stop-and-report. A slice on the list that turns out not to move it is expected rather than a finding, because whether a row change reaches inside 600 ticks is a fact about the scenario's window and not about the slice. What makes each move deliberate is the discipline the constant's own JSDoc already carries, a dated paragraph per re-pin naming what moved, what held and why (`digest.ts:264-312`, eight of them so far). Section 13 item 9 carries the correction and the dispatch plan names which slices re-pin.

**Mark's saved tapes stop replaying.** His own tapes at `/mnt/c/Users/markd/Downloads/*.tape` were recorded against rows that are about to change, and the witness refuses a tape the moment the run reaches a tick where those rows change what the simulation did (ADR 0019, ADR 0043). Format 2 tapes are already refused, which is informative rather than a defect. **Added by the tech architecture gate:** one of those tapes is the undiagnosed divergence in section 12 item 5, and after the first slice lands the tip can never reproduce it again, so its seed and its first divergent checkpoint were written down before any edit, in `docs/push/divergence-b1c3a584d1.md`. Step 0 of the dispatch plan's order reads that file rather than re-deriving it.

**The step 2 tables are largely rewritten.** The Procession's thirteen rows, the Crowd's twenty-odd and the Vigil's are re-authored around the standing rows, and the carrier placements move with them.

**Two harness hand names are spent.** `enoughClearance` 12 and `belchWorthIt` 8 describe a field that will not exist. A moved hand row is a new configuration name and never a retune of an existing one (`playing-harness.md` section 8), so if either has to move, the batch that reads the new field reads it through a newly named hand and every earlier batch stays comparable.

**What must not move.** The four fences, the invariants, and replay determinism. A slice that moves any of them is wrong.

---

## 9. Magnitudes

Every number in this record is an initial data row, moved by the first batch and the second round. Each with its home.

| Row | Initial | Home |
| --- | --- | --- |
| Shambler health | 8 | `MOB_TYPES` in `mobs.ts` |
| Shambler `fire` | `NEVER_FIRES` | `MOB_TYPES` in `mobs.ts` |
| Ghoul health, revenant health | 20, 64, unchanged | `MOB_TYPES` in `mobs.ts` |
| Procession standing rows | 0 through the teaching rows, then 2, then 3.5, then 5 bodies a second, then 0 at the sparse last row | the Procession's own table |
| Crowd standing rows | 8, then 3 mid-section, then 12 bodies a second | the Crowd's own table |
| Vigil standing rows | none | the Vigil authors no standing row |
| Weapon damage per rung | derived per line from `weapon-growth-per-level-precedent.md` and `survivor-numbers.md`'s worked level tables, and never one band across lines | each line's own rows |
| Shaped row counts | roughly doubled | the rows they sit on |
| `CORPSES_TO_CEILING` | about 400 | `tuning.ts` |
| `RESERVOIR_CAPACITY`, in corpses | about 300 | `tuning.ts`, and `FEAST_PAYOUT` follows it |
| Minimum interval between wisp volleys | about 30 ticks | the wisps' own row |
| Running skull surge duration cap | to be set with the interval | the skull stream's own row |
| Carriers, `CARRIER_SLACK` | 25 and 1.3, unchanged in round one | `carriers.ts` |
| Director purse, per phase | about a third of the phase's standing-row total in bodies | the purse table beside the rows |
| The Vigil's purse | 0 bodies | the purse table beside the rows |
| Cost per body, and a card's cost | shambler 1, ghoul 3, revenant 4, and a card costs the sum over its bodies | the card table beside the rows |
| The signal lock | the value that means the signal ran live, until a run resolves a figure | the header, and the director's own module |
| Quiet interval | 4 to 8 s | the director's own rows |
| Signal hold, signal decay | 5 s, linear over 30 s | the director's own rows |
| `MOB_CAP`, `MOB_FIRE_CAP` | derived from the rows | `caps.ts`, as `CORPSE_CAP` already is |
| Batch size | 48 seeds, and 192 for a rate under a third | the batch runner's default |

What is not a magnitude, and must not be quietly changed: that density is bought with weak bodies and never tough ones; that the ceiling stays where it is and the ladder is made rare by cost and skill; that the rows are the floor and the director only ever adds over them; that the director reads harm and never a kill near the grave; that a cap raises a fault and never evicts; that every die the director rolls comes from its own named stream; and that no number the batch prints is a target.

---

## 10. The words this record adds

Challenged against `apps/hungry-grave/CONTEXT.md`, which is the glossary's real path. **Four landed with the ADRs at commit `9cba278131`: Standing row, Purse, Card, and the restated Procession entry**, and the restated **Armed** entry landed with slice A. **The second gate round's docs pass lands the rest and rewrites Standing row to the shape below**: The mow, Signal lock, Ladder, the widened **Row** clause and the **Add** clause. Nothing here is still owed to a code slice, and a rename pass follows separately.

**Standing row**: A row with its repeat fields set: it holds a fixed rate from its own time until the next row of any kind, repeating down to a minimum interval. A section's growth is a run of them at stepped figures, and a section may declare none. It is keyed to the clock and never to anything the player did, and the director adds over it rather than owning it. *Avoid*: floor stream, faucet, spawn rate, wave table. **The entry that landed at `9cba278131` says a standing row stands for its whole section and ramps across an authored span, and both halves are superseded, so this docs pass rewrites it to this.**

**The mow**: What the storm does to a field of weak bodies, and the feel the whole density pass exists to produce. Density is bought by making bodies weaker, never tougher. *Avoid*: grinding, farming, clearing, trash cleanup.

**Purse**: The finite budget one phase gives the director, counted in bodies and spent on cards. When it is empty the phase runs at its authored floor for the rest of its length, and the storm is seen to win. *Avoid*: budget, credits, pool, allowance.

**Pressure**: The number the director reads: harm and floor events, held for an interval and decaying linearly, never a kill near the grave. *Avoid*: intensity, threat meter, difficulty, tension. **The word is Pressure and not "Pressure signal", which is what `CONTEXT.md` already carries; `PressureSignal` is the type's name and never the glossary's.**

**Card**: One thing the director may buy: a template, a mob type and a count, costing the sum of its bodies. An add is always a card, so what the director puts on the field is a shape rather than a loose body. *Avoid*: spawn, wave, group, packet.

**Signal lock**: A figure a run resolves the pressure signal to and holds it at, for a tuning experiment. It is recorded in the tape header, because it is a value the run started from and never an absence (ADR 0027). *Avoid*: override, debug mode, freeze.

**Adjusted by the product vision gate and the game design gate: Bank expiry is not a word this record adds.** It named the deadline on a banked offer, and section 5 item 5 withdraws the deadline from round one, so there is nothing for the word to name.

**Two words already in circulation with no entry, and the call is made here rather than deferred.** **Ladder gets an entry.** It is load-bearing and undefined: it is used inside the Rung and Strip entries, it titles ADR 0054, and a reader meeting "the ladder" in three records has nowhere to look it up. **Density does not.** Both kinds already have owners, Standing row for the authored kind and Directed density for the other, so a bare Density entry would be a category label over two defined terms rather than a term of its own. **Ladder lands in this docs pass.** **Adjusted by the product vision gate and the game design gate: Bank was the third**, on the grounds that this step gave it a property worth naming, and the withdrawal takes that property away.

**One entry the mow retires rather than adds. Adjusted by the game design gate.** The Procession's entry promises that "a corpse sits alone long enough to be worth going to get" (`CONTEXT.md`, The Procession), and a section with a standing row under its beats has no lone corpse in it. The section keeps its property, which is emptiness as a ceiling on what may be added, and loses the sentence that described the old field. **The restatement landed with the ADRs at `9cba278131`**, so the glossary already carries it and slice B no longer owns it; the dispatch plan's slice B step keeps the wording only as the reference a reader can check it against.

---

## 11. Surfaced commitments, not yet ruled

Each of these is something the brief implies and Mark has not ruled on, or something the session decided that he has not seen. **Adjusted by the product vision gate: this list is a recap item and never a stall.** The push runs in one-push mode, where the ADRs are the session's call and Mark reviews them on the branch before merge, so every item below is taken under its default, filed in its ADR step, and shown to him in the session recap. No slice waits on this list, and none of it is softened: an item he overrules on the branch is reversed there.

Each carries the recommended default the dispatch plan is written against, and what it costs if he says no.

**1. The on-swallow cadence floor widens ADR 0058. Filed: ADR 0058 amended in place at `9cba278131`.** ADR 0058 rules the freshness axis per line and carries no cadence limit of any kind; the nearest cadence-shaped rule in the project is the glossary's Surge entry, that one swallow buys one surge and a chain overwrites an unspent one. A minimum interval between wisp volleys and one running surge extended to a cap is a new axis beside the freshness one. Recommended default: take it, as an in-place amendment to ADR 0058. If he says no, the wisps launch on the order of 110 souls a second into a cap of 64 at Crowd rates, the cap binds and raises a fault by ADR 0056's own rule, and the auto-targeting line does the mowing the player is supposed to do.

**Removed by the product vision gate and the game design gate: the bank expiry.** It was item 2, that the expiry reverses a property ADR 0034 leaves standing. It is withdrawn from round one rather than ruled, so there is no commitment to surface and ADR 0034 is not amended. Section 5 item 5 carries the evidence and the condition that would reopen it.

**2. The shambler never firing retires the armed share on the mow body. Filed: ADR 0059 at `9cba278131`; the glossary's Armed entry is restated by slice A, which is the slice that silences the shambler.** The glossary's Armed entry says "Only a fixed share of a wave is armed, and an armed mob looks armed, because picking targets is a skill only if the player can see which mob to pick." With the shambler silent, that skill moves from inside a row to between mob types: the player picks the revenant out of the mow rather than the third shambler out of a File. That is a real change to what the entry promises and it is the substance of the density ADR. **Adjusted by the game design gate**, which has now seen it: admissible as one ADR if the title names the mow and silent trash rides as the mow's cost, with the revenant as the visible armed minority of a heaven minute and never a dose of hell, and with "one skull" and the touch counts kept out of the ADR. Recommended default: take it in that form. If he says no, item 1's alternative is the one-in-ten armed share and section 5 item 1 says why that reads worse.

**3. The standing row widens what a Row is. Filed: ADR 0060 at `9cba278131`, and re-ruled in place in the step 2 docs pass.** The glossary defines a Row as "a phase-local time, a template, a count, and a mob type", and every row in the tree is one-shot. A row that fires again on an interval is a new authored primitive, which is why the brief calls for a new ADR rather than an amendment. Recommended default: file it as a new ADR after the density one, with the Row entry widened in the same slice. If he says no, the growth over the run has to be authored as more one-shot rows, which is the alternative item 3 rejects. **What the re-ruling changed, and it is a smaller commitment than the one filed:** the repeat is not a second row type, it is repeat fields on the row that already exists, so the Row entry gains a clause rather than the glossary gaining a parallel definition. **What it added and the second gate round then struck:** a per-minute step on trash health and fall speed. Both design gates read the figures back to Mad Forest's Inverse mode, normal Mad Forest carries no `TimeMods` at all, and ADR 0059 is Mark's ruling that growth is more enemies and harder ones rather than the same enemies wearing more health. So there is no stat commitment to surface and section 5 item 3 records the strike; what would reopen it is section 12 item 6.

**4. `WITNESS_VERSION` moves from 6 to 7. Stands: unfiled and unbuilt, and slice E owns it.** The step 3 record pins it at 6 and says it must not move again, in the sense that the harness must never be the thing that moves it. The director's own stream is a sim-side stream and ADR 0019 requires it folded, so the pin is satisfied rather than broken. The project's own lesson binds when: stamp the version in the commit that changes the fold, and declare every new folded field in that same commit, because a version stamped before the fold stops moving names several folds (`apps/hungry-grave/docs/lessons.md`, The sim). Recommended default: take it, once, in the slice that widens the fold. If he says no, the director draws from an existing stream and #108's exact defect is reproduced by design.

**5. `FORMAT_VERSION` moves from 3 to 4 for the signal lock. Decided by the session on the tech architecture gate's finding, not merely surfaced. Stands: unbuilt, and slice G owns it.** **Corrected 2026-09-09: this is not ADR 0056's trigger firing, and it stands on its own footing instead.** That trigger names the budget and only the budget, and the purse stays pinned to the build, so it is unfired. The lock is a figure a run resolves from its URL for a tuning experiment: ADR 0043 is where header-or-build is decided and it puts such a value in the header, and ADR 0027 rules the form it takes there, a resolved value and never an absence. The reason it is taken now: this step already turns every saved tape into a dead baseline, so the bump costs nothing the step is not paying, and taking it later would spend that cost a second time. The purse stays pinned to the build and ADR 0056's own ruling is untouched. If he says no, the lock is a build-time constant, which means a tuning experiment needs a rebuild per lock value and the tape cannot say what the run was locked to.

---

## 12. Open questions

Only what cannot be closed from this record, the code or the ADRs.

**1. Whether the growth-versus-pressure split survives the game design gate. CLOSED 2026-09-09: it did.** The standing rows are keyed to time and the director is keyed to pressure, and the two together are what makes the player feel the game answer their power without the game reading their power. The gate accepted the split on the two shipped cases, Risk of Rain 2 and Halls of Torment, and ADR 0060 records it (commit `9cba278131`, re-ruled to precedent in the step 2 docs pass). Fable was not needed for it. **Numbering is kept as it is: item 4 is cross-referenced by number from section 4.**

**2. Which second configuration a finding has to agree across.** ADR 0053's rule is that a finding is believed where the sharp and the sloppy configurations agree, and the two corners are `steady-far` and `shaky-short`. The brief names `steady-far` and `loose-far` for this step's batches, because the sloppy corner reached the Undertaker on 0 of 48 seeds while the sharp corner reached it on 29. That is #117 and it is Mark's alone. Until he rules, the batch runs the two the brief names and every finding says which two it agreed across.

**3. Whether the Undertaker phase can genuinely fail to end.** #118: across four 48-seed batches, one run in each of three configurations stopped at the tick budget with neither seal nor victory. The brief's reading is that boss phases author no adds, so the food economy starves there and the mow makes it worse. Whether the fix is the director slice or the boss row cannot be settled before the instrument exists, and a batch that does not say how many of its runs stopped at the ceiling cannot see it at all.

**4. Whether the phone can draw the field the standing rows author.** Section 4's slot answers what the phone does draw. What no measurement here can answer is what to do if it cannot, because `caps.ts:20-31` rules that the caps are never lowered for a phone's frame budget, and that leaves lowering the authored rate or accepting a worse phone as the two moves, both of which are Mark's.

**5. The undiagnosed human-tape replay divergence on `b1c3a584d1`.** Three tapes from the current build verify and that one does not. Mark's ruling is that it cannot be allowed to fail and that a test holds the cause once it is known. Re-authoring every row is the largest change to what a tape replays since the branch started, so this step is where a latent divergence would surface, and this record names it rather than assuming the green tapes settle it. **Added by the tech architecture gate, and already done:** what this step can lose is the evidence itself, because after the first slice the tip cannot reproduce that run at all. `docs/push/divergence-b1c3a584d1.md` pins it at this tip: seed 1445730872, first divergent checkpoint 16440, the checkpoint before it agreeing, so the true first divergent tick is inside 16381 to 16440. The question stays answerable after the rows move.

**6. Whether the mow ends part-way through a run, now that no stat step is authored. Owned with a trigger.** Growth is arrivals and the roster and nothing else, because ADR 0059 rules that a denser minute is bought by making bodies weaker, and Mad Forest's normal mode carries no `TimeMods` at all: its whole climb is enemy type substitution (`docs/research/survivor-numbers.md:87`, `:98`). The precedent is not one-sided and the record says so plainly. Six Vampire Survivors stages do carry a normal-mode per-minute health inflation, from 0.10 of base on Bat Country to 0.25 on The Coop, and the 0.05 the first re-ruling reached for is Mad Forest's Inverse mode rather than its normal one (`:123`). Against that, Deep Rock Galactic: Survivor's trash sits at its base health even at maximum hazard. **The trigger is the hits-to-kill-per-minute reading** (section 7, verification step 12, `timeToKill.ts`): with no step authored, a body costs fewer hits every minute the ladder climbs, so if the batch reads the mow ending early the candidate is enemy type substitution first, the sections standing harder types later, and a per-minute stat step second. Either one is a new ADR that amends ADR 0059, and it is Mark's read rather than a tuning row the batch may move on its own.

---

## 13. Claims in the brief found false against the code

**1. The far-toll ruling is ADR 0036's, not ADR 0005's.** `docs/push/handoff.md:27` cites ADR 0005; ADR 0005 is seven lines and rules only that a weapon line owns its own properties. The ruling is at `0036-the-bell-is-a-timed-pulse-of-cones.md:3`, same ruling date, and `dispatch-5-weapons.md:262` carries the same wrong citation while `step-1-progression-dispatch.md:392` carries the right one. The substance stands.

**2. The Vigil's scarcity ruling is not in ADR 0049.** The brief attributes it there; ADR 0049 rules the stage's length and its division into named sections and does not name the Vigil at all. The scarcity property is in the glossary (`CONTEXT.md`, The Vigil) and its derivation is in `stage-floor.md` section 1. The reading that it is Vampire Survivors' minute 5 rather than a contradiction stands on the property, wherever the property is recorded.

**3. The glossary is at `apps/hungry-grave/CONTEXT.md`, not `apps/hungry-grave/docs/CONTEXT.md`.** No file exists at the second path.

**4. The section schedule carries no durations and no drain-out phases.** The brief gives "Procession 118 s, Crowd 138 s plus the 15 s pour, Vigil 69 s, Banshee about 30 s, Undertaker about 60 s, two 15 s drain-outs; about 400 s in all". `PHASES` has seven entries and none of them has a length column: every phase ends on the event in its `ends` column (`stage.ts:51`, `:253-258`). What is authored is the time of each section's last row, 116.5, 138 and 67.5 seconds (`rows.ts:231`, `:525`, `:657`). The pour's 15 seconds is real and derived, `SET_PIECE_BUDGET` 75 times `SET_PIECE_POUR_SECONDS` 0.2 (`rows.ts:789`). The boss and drain-out figures are nominal design intent from `game-concept.md` and measured spans from `sectionTimeline.ts`, and item 3 above is adjusted so that nothing has to read a section's length at all: a standing row carries its own start time and ends at the next row of any kind.

**5. `MOB_TYPES` holds no boss types.** `MobType` is exactly the three trash types (`mobs.ts:26`); boss health is `CHUNK_HP` in `bosses/chunks.ts:59-62`. Item 1's "fire stays on the bosses" is true and is about a different table.

**6. There is no offer freshness or lifetime constant.** The three `OFFER_` constants are all spatial (`offer.ts:27`, `:41`, `:53`). A standing offer ends when its bodies leave the field, read off the field rather than counted (`offer.ts:337-346`), and the brief's "how long an offer stands" is the scroll and not a row. So a deadline on the bank would have been the first tick-counted deadline the offer has ever had, which is part of why section 5 item 5 withdraws it rather than opening that door for a corner that happens once in 48 runs.

**7. There are six templates and not five.** `rain` is missing from the brief's list (`templates.ts:12`), and it is the one the Crowd's overlap leans on.

**8. `CORPSE_CAP` resolves to 233 and the step 2 record says 232.** `peakArrivals(10)` is 63 rather than 62 at the current rows, pinned by `rows.test.ts:303-305` and `caps.test.ts:155-156`. The derivation is unchanged and this is the derivation working; the summary line in `stage-floor.md` section 8 has aged by one, which #86 owns.

**9. `GOLDEN` does not regenerate once.** The brief attaches one regeneration to the standing-row slice. The digest's own re-pin log shows what actually moves it: the witness folds every live mob's health, so the shambler's health row moves it; it folds each live mob's carrier flag and the scenario's window holds one authored row, so the re-authored rows and the re-placed carriers can move it; it folds the grave's size and reservoir, so the economy rows move it; the widened fold and `WITNESS_VERSION` 7 move it by construction; and the director's own state inside the scenario's 600 ticks moves it again. The scenario's two kills are scripted at each victim's own health (`digest.ts:203`) and hold through all of it. **Five slices are permitted to re-pin**, each with its own paragraph naming what moved and what held, which is the pattern the constant already carries eight times over (`digest.ts:264-312`). **Adjusted by the game design and tech architecture gates on two counts:** the bank expiry's re-pin is gone with the expiry, and the director's slice is split so the fold widens once in its own commit ahead of it.

**10. "3 per hit" is size units, not corpses.** `HIT_SHRINK` is 3 size units (`tuning.ts:70`), which at 0.50625 a fresh trash corpse is 5.93 corpses. The brief's list reads in size units throughout and is right; it is written here because the two readings differ by roughly a factor of two and item 4 moves the corpse figure under it.

---

## 14. The brief, item by item

Every numbered item, iteration step, cost and open item from `docs/push/handoff.md`'s step 4 brief, each marked. An unmentioned drop would be the failure, so nothing is left off this table.

| Brief item | Mark | Where, and why if not carried whole |
| --- | --- | --- |
| Starting point 1, fire lives on the few | Adjusted by the product vision gate | Section 5 item 1. Substance whole, including the lone revenant Drip and the rejected low armed share; the sentence making the heaven-with-doses-of-hell promise the roster split is struck, because the doses come from bosses and the revenant is the visible armed minority of a heaven minute |
| Starting point 2, trash HP to one skull | Adjusted | Section 5 item 2. Substance whole; the far-toll citation moves from ADR 0005 to ADR 0036, which does contain it |
| Starting point 3, growth as a per-section stream | Adjusted by the gates, then adjusted again on precedent | Section 5 item 3. Concept whole; the word becomes standing row because "stream" is spoken for twice. The gates add that the Procession's rate is zero through its teaching rows and starts behind them, which keeps the section's first seconds a teaching moment and keeps ADR 0015's 600-tick scenario roughly the field it has. **The naming research then found precedent against two halves of the shape and ADR 0060 is re-ruled to it**: growth is authored as stepped standing rows and never as a ramp, a repeating row is an ordinary row with its repeat fields set rather than a second kind of row, and nothing measures a span because a standing row carries its own start time and ends at the next row of any kind. **The first re-ruling also added a half the brief did not have, a per-minute trash health and speed step, and the second gate round struck it**: the figures are Mad Forest's Inverse mode, normal Mad Forest carries no `TimeMods` at all, and ADR 0059 rules growth as more enemies and harder ones rather than the same body wearing more health. Section 12 item 6 carries what would reopen it |
| Starting point 4, the food economy restated | Carried | Section 5 item 4, whole, including the cadence floor and decision 5.11's feast identity |
| Starting point 5, the ladder | Adjusted by the product vision gate and the game design gate | Section 5 item 5. **The bank expiry is withdrawn from round one** on the measurement, one bank in 48 sharp-hand runs and none under the sloppy hand, and on the code, where a bank waits under one offer lifetime and never longer. What is carried is the slack waiting for a measurement, and round one reads the ladder instead of moving it. ADR 0034 is not amended and the second banking site needs no expiry treatment |
| Starting point 6, the director | Adjusted by the game design gate and the tech architecture gate | Section 5 item 6, whole, including the instrument-first finding and the design-gate proposal. The gates add what one add is (a card, a template group costing the sum of its bodies), that a standing row's bodies are the floor and never count against the Procession's live-template ceiling, the Vigil's purse as an explicit zero with its reason, and the signal lock in the header at `FORMAT_VERSION` 4 |
| Starting point 7, caps as derivations | Adjusted by the tech architecture gate | Section 5 item 7, whole; the frame budget is section 4's slot. The gate adds that the peak reads an unkilled-lifetime row and never a rate alone, that the addend is the largest single card and never the purse, that boss fire shares the trash fire pool, and that a derived cap is derived tight because the pools are walked whole |
| Iteration: round 0, the frame measurement | Carried | Section 4, as a slot |
| Iteration: records, grilling, three gates | Carried | Section 6 |
| Iteration: the ADR order | Adjusted by the product vision gate and the game design gate | Section 6. Three ADR steps rather than four, because ADR 0034 is not amended; each precedes the slice that needs it, and no step waits on a person |
| Iteration: the seven slices in order | Adjusted by the game design gate and the tech architecture gate, then by #82 | Section 6, and the dispatch plan. **Eight, not seven**: the bank expiry slice is gone, the director's slice is split so the witness fold widens once in its own commit ahead of it, and slice A0 was added ahead of all of them so every tape recorded in this step says which build recorded it. **A0 is shipped at `26a064a064`, fixed at `136a349aeb`, and it put a Build identity entry in `CONTEXT.md`** |
| Iteration: one 48-seed batch on two configurations, 192 for a victory rate | Carried, and the condition restored in the plan by the product vision gate | Section 6 and section 7. The 192-seed batches run only where a victory rate is the question, which is the brief's own wording; the plan used to run them unconditionally |
| Iteration: pick the next move, dispatch, one more batch, stop | Carried | Section 6 |
| Cost: every tuning reading is a dead baseline | Carried | Section 8 |
| Cost: `GOLDEN` moves once | Adjusted, and recounted by the tech architecture gate | Section 8 and section 13 item 9. Five slices are permitted to re-pin it rather than one: the mob table, the re-authored rows, the economy rows, the widened fold, and the director. The intent stands: every move is deliberate and each carries its own dated paragraph |
| Cost: Mark's saved tapes stop replaying | Carried, and a second refusal added by the session | Section 8. The rows moving refuses them at a divergent checkpoint; the signal lock moves `FORMAT_VERSION` 3 to 4 and refuses format 3 outright, taken now because the step has already paid that cost |
| Cost: the step 2 tables are largely rewritten | Carried | Section 8 |
| Cost: the harness hands' rows describe a field that will not exist | Carried | Section 8 |
| Cost: what must not move | Carried | Section 8 |
| Open: #118, the Undertaker deadlock | Carried | Section 12 item 3, and section 7 makes the ceiling count a reported reading |
| Open: #117, Mark's alone | Carried | Section 12 item 2 |
| Open: #116, #121, and the deferred gate findings on #39 and #109 | Carried as filed, not opened here | None of the four bears on a decision in this record: #116 is the harness's lapse tail, #121 is four non-null assertions, and the #39 and #109 findings are filed. They stay tickets |
| Not in the brief: the dev-only autopilot | Declined, and the decline recorded by the product vision gate | Section 6's last paragraph. `bot.ts:38-41` names this step as its trigger; watching a hand play is not a reading and the batch is, so the comment is updated to cite the decline |
| Open: the human-tape replay divergence | Carried, with a step added by the tech architecture gate | Section 12 item 5, and step 0 of the plan's order records the tape's seed and first divergent checkpoint before any edit, because after the first slice the tip cannot reproduce that run |
| Open: format 2 tapes are refused, which is informative | Carried | Section 8, under the tapes cost |
