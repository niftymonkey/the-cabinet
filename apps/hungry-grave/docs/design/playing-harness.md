# Design record: the playing harness (path step 3, ticket #98)

The craft calls this step runs on, each taken by the planning session under the push's pre-authorization item 8 (`docs/push/pre-authorizations.md:14`: tuning data, test design, file layout), each backed by research or by a measurement in the tree, each open to Mark's overrule on the branch before merge.

Every magnitude below is an initial data row. The harness reads it and the tuning pass (step 4, #39) moves it. Nothing here is a ruled number, and nothing here belongs in an ADR unless section 10 names it.

The harness measures and never judges. Everything it produces is one thing against another: this build against that build, this hand against that hand, never this number against a target (ADR 0053). Whether the game is fun stays a person's answer (ADR 0013).

Line citations were read in this worktree at the step 2 close, while adjustment iteration 4 was landing; section 11 says which of them will have drifted.

---

## 1. The hand the harness plays with

### It is a new policy, not an edit of the dodge policy

ADR 0053 says the policy "moves, dodges, feeds and takes offers", and decision 17 and #98's approach both say the offer "goes into the existing dodge policy". Against the code, that sentence does not land where it points.

`dodgePolicy` does not feed (`bot.ts:221-228`): it takes the roomiest of the nine moves with `HOME` as the point it drifts back to (`bot.ts:89`). The policy in this file that feeds is `divingPolicy` (`bot.ts:406-415`), which is the same dodge under `nearestFood` and a tighter clearance. So "the existing dodge policy plus the offer" would produce a hand that takes offers and still never eats, which is three of ADR 0053's four verbs.

The second reason is heavier. Six policies are exported from `bot.ts` (`bot.ts:432-441`) and every one of them is load-bearing in a test: `dodgePolicy` carries the whole-stage suite over five seeds (`bot.test.ts:69`, `:405-421`), `unloadedPolicy` and `belchingPolicy` carry ADR 0042's two-sided Wall property, `divingPolicy` and `waitingPolicy` carry the Waking's property over six seeds (`setPiece.test.ts:588`), and `hitTakingPolicy` walks ADR 0003's ladder. Editing `dodgePolicy` in place moves every figure any of them ever produced, which is #107's banding failure at the scale of the whole suite.

**The craft call: the base policy is a seventh policy beside the six, assembled from the parts already there.** `bestMoveToward` (`bot.ts:239-254`) is the whole of the steering, and what the new policy adds is which point it wants and when it belches. The six stay untouched, so every reading in the tree keeps meaning what it meant.

### What it wants, in order

One rule, three clauses, read every tick.

The live offer's nearest body, if an offer stands. Otherwise the nearest food (`nearestFood`, `bot.ts:366-379`, which already walks the corpse pool and already sees a drop body, since a drop is a corpse of kind `drop`). Otherwise `HOME`.

The offer outranks an ordinary corpse because a drop never decays and a corpse does: a hand that preferred the nearer corpse would take offers by accident, and #98's first acceptance line is that its runs reach levelled builds rather than sitting at the birthright.

Clearance: the initial row is `COMMITTING_CLEARANCE`'s 12 rather than `ENOUGH_CLEARANCE`'s 60. The reason is already measured and written down at `bot.ts:381-392`: above the cap two moves tie on room and the wanting decides, so a hand holding out for 60 units "never reaches anything inside a swarm", and every move inside a pour leaves less than a body's width. A base policy at 60 would sit at the birthright, which is the failure #98 exists against.

### It belches, and that is the call

ADR 0053's four verbs do not include the belch, and no policy the harness could inherit belches except `belchingPolicy`, whose rule is loaded plus eight live shots on the field (`bot.ts:274-291`).

The cost of not belching is already filed. #98's third comment, from the step 2 vision gate: #37's story 12, one belch plus play beats the Undertaker, "still has no hand that can answer it", and #39's batch report inherits "one belch plus play beats the boss" as an instrument reading no current policy can produce. The instrument itself is already built: `belchCadence` carries every fire with its tick, the ticks spent at full and the charge wasted (`belchCadence.ts:27-31`). Under a hand that never belches it reports an empty fire list and a run's whole length as waste, which is an instrument reading its own absence.

The `Policy` type's own prose already made the choice available: it returns a `TickCommand` rather than a move because "a policy that cannot express a belch cannot carry ADR 0042's Wall property" (`bot.ts:13-24`).

**The craft call: the base policy belches on `belchingPolicy`'s rule, reservoir full and at least `BELCH_WORTH_IT` live shots, with the threshold moved into the configuration rows as data.** What it costs, eyes open: the belch is a spend judgement and neither knob in section 3 touches its rule, so the sloppy hand belches on exactly the sharp hand's condition. That is acceptable and it is stated rather than hidden. The belch instrument still separates across configurations, because the sloppy hand arrives at a fight with a worse build and a fuller history of hits, so what varies is the play around the belch and not the belch rule. If a later reading needs the belch itself to degrade, the move is a third knob and not a widening of these two.

**Amended 2026-09-09, after the game design gate:** the hold does reach the belch, by delaying it. A held command is repeated whole, so a belch the rule turns on inside a hold fires up to that configuration's own bound late, which at `shaky` is up to 36 ticks. What stood: the rule, the threshold as a data row, and that neither knob makes the spend judgement itself worse. What changed: only the claim that the knobs do not touch the belch at all, which was true of the rule and false of its timing. What the paragraph could not have known: it was written against a shaky bound of 12 ticks, where a delay of a fifth of a second sits inside the reservoir's own charge noise.

This widens ADR 0053's own list of what the policy does. Section 10 carries it as a commitment and section 12 puts it to Mark.

---

## 2. Which of the three bodies it walks to

ADR 0053 leaves this open in as many words, and adds that "the per-line preference belongs to the roster if the roster is ever built".

**The craft call: the nearest body by centre distance, ties broken by the lower entity id.** That is `chooseOfferBody`'s own rule (`offer.ts:223-248`), so the hand's rule and the sim's tie-break are one sentence and a hand that walks at the nearest body is never handed a different one.

The rejected rule is the body carrying the lowest-level line, and it fails on what it would do to the instrument rather than on what it would do to the play. Mega Crit's first metric translates straight onto this offer, "how often a player picks a card when given the choice" (research record, section 4), and under a lowest-level rule that metric is 1.0 for whichever line is behind and 0 for the rest on every offer of every seed: the number would read the rule and never the game. Nearest hands the choice to where the danger put the grave, which is what the offer's own spacing was built to price (`offer.ts:29-41`: three bodies span a third of the field's width, "which makes choosing a real move").

**The fence stays green by construction, and by a stronger route than the alternative.** `lineAgnosticPolicies.test.ts` forbids `dev/bot.ts` from quoting any weapon line name (`:79-83`). A nearest-body rule reads positions and entity ids and never touches `state.levels` at all, so there is nothing for the fence to catch. A lowest-level rule would also have passed, since the fence reads quoted literals and not field reads (`:361-371`), but it would have passed by argument where this passes by having no line in it.

**Take-by-slot is a reading the report carries and never a rule the policy carries.** #98's second comment: `openBanked` opens a banked offer at the grave's own x (`offer.ts:265-269`), so a still grave is handed the middle body. Under a nearest-body hand that reading is exactly informative, because the slot taken is a fact about where the grave was; under a lowest-level hand it would have been noise. The report splits take-by-slot between banked offers and death-point offers, so the reading exists before anyone argues about the site.

**What this costs, eyes open.** The hand's build is decided by geometry, so it never prefers a line and never turns one down. Ubisoft's warning is the exact shape of the risk: "Had we used the WinOnly model to give feedback to the designers... we would however have missed completely the feedback on the super capacities" (research record, section 4). The answer is the report and not the rule: take-by-line and pass-by-line are broken out, so "the hand never chose" is visible in the numbers rather than buried under them, and the per-line preference stays where ADR 0053 puts it.

**A stripped rung is food and not an offer.** Once #99 lands, a stripped rung falls onto the field as a body (ADR 0055), which is the second clause of the rule above, so the base policy walks to it whenever it is the nearest food. ADR 0055 already predicts this and rules the take rate "a number to read rather than a bug to fix". The report carries it by line.

---

## 3. The two knobs, and the nine hands they make

Both knobs cost the hand something rather than granting it something, which is Talakat's construction and the reason it fits a dodging game: "A style is a way of playing worse along a named axis, and the baseline is the agent playing as well as it can" (research record, section 5).

### The hand: a command held stale

The parameter is the number of ticks a decided command is repeated before the policy decides again. When a hold expires the policy decides, draws the next hold, and repeats that command for the drawn number of ticks.

**A hold is a lapse of attention and not a standing slowness.** Each time the policy decides, it first rolls whether its attention held. On nearly every decision attention holds and the hand acts on the tick, exactly as the sharp corner does. When attention fails, the hand keeps the command it already had for a drawn number of ticks and the field moves under it. So a hand carries two rows and not one: how often attention fails, and how deep a lapse runs when it does.

| Name | Attention fails | Lapse depth, ticks | Lapse depth, ms |
| --- | --- | --- | --- |
| steady | never | none | none |
| loose | 100 in 1000 | 0 to 15 | 0 to 250 |
| shaky | 250 in 1000 | 0 to 36 | 0 to 600 |

**steady draws nothing at all**, which is load-bearing twice over: the determinism condition below runs under the sloppy corner precisely because the sharp corner never touches the stream, and the 48-seed sharp batch already played under `steady-far` stays comparable with everything measured after this change, because the row it was played under has not moved.

The depths are anchored on Counter-Strike's shipped ladder, whose `ReactionTime` runs 0.05 at Elite to 0.60 at Easy (research record, section 5), so the two sit at the middle rung and at the far end of a ladder eight rungs deep. Talakat's own axis is a Gaussian standard deviation of 10, 6 and 2 repeated frames.

**The rungs are nested and that is the point.** A loose hand is a steady hand on nine decisions in ten. A shaky hand is a steady hand on three decisions in four, and when it does lapse the depth it draws runs the whole way from nothing to the full 36 ticks, so a single shaky hand produces steady decisions, loose-sized lapses and shaky-sized lapses across one run. A rung is not a separate character; it is the same hand failing more often and worse.

**Amended 2026-09-09, after the game design gate:** the depths were 6 and 12 ticks and they are now 15 and 36. The arithmetic the gate did against this field is the reason. A mob shot travels 1.83 units a tick (`mobs.ts:86`, 110 units a second at `TICK_HZ` 60) and the grave travels 4.5 (`tuning.ts:18`, `BASE_SPEED` crosses the field's 540 units in two seconds), against a grave 27 units wide at the start size (`tuning.ts:58`). Inside a 12-tick hold a shot covers 22 units while the grave covers 54, so a stale command moved the grave further than the threat travelled and the sloppy corner could not eat a shot it had already seen: the old shaky was a sharp hand under another name and the done line would have started flat. At 15 ticks a shot first covers the grave's own width, 27.5 units, which is where loose sits; 36 ticks is 600 milliseconds, which is Counter-Strike's own Easy rung. What stood: the parameter, the three-value shape, and that both knobs cost the hand something. What changed: only the two depths. What the paragraph could not have known: it read its milliseconds against a reaction-time ladder and never against this field's own speeds, where a hold is an error only once the field can carry a threat through the grave inside it.

**Amended 2026-09-09, after Mark asked whether the knobs were too siloed, and this is the larger of the two amendments.** Every draw above used to be taken on every decision, uniformly over the range. That made a shaky hand stale about 300 milliseconds on **every** decision it ever took: not a person who occasionally whiffs, but a person who is evenly mediocre forever. The correction is the attention roll, and it is the standard model rather than an invention.

The evidence, gathered 2026-09-09. Human response time is not symmetric and not uniform: the standard descriptive model is the ex-Gaussian, a tight body plus an exponential right tail, and the tail parameter tau is read directly as attentional lapses ([meta-analysis](https://link.springer.com/article/10.1007/s11065-023-09587-2), [Sci Rep](https://www.nature.com/articles/s41598-021-94161-0)). Psychophysics fits an explicit lapse rate as a separate term, where with some probability the observer responds independently of what was in front of it, and omitting that term biases every other estimate ([Wichmann and Hill 2001](https://www.psy.gla.ac.uk/~martinl/Assets/MCMPS/Wichmann&Hill01a.pdf)). The vigilance literature measures the rate: a rested adult lapses on roughly 1 to 2 percent of trials, rising to about 9.6 percent averaged across a total sleep deprivation protocol ([Riedy et al. 2022](https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2022.815697/full), [Lim and Dinges 2008](https://www.med.upenn.edu/uep/assets/user-content/documents/LimDinges2008VigilantAttention.pdf)), and the slow population reads as a second mode rather than as the tail of one distribution.

**The finding that decided the shape of the ladder**: comparing elite Classic Tetris players against novices, the expert advantage on a *simple* response sits in the mode and the spread, but on a *choice* response it is carried **entirely by tau, the lapse tail** (BF 39.4, with the mode and spread not significant; [Agrawal et al., CogSci 2021](https://escholarship.org/uc/item/7vk8r5fq)). Dodging is a choice task. So the ladder moves the tail and leaves the body at zero, which is why an attentive decision here is a perfect one and the rungs differ only in how often and how deeply attention fails.

Shipped practice says the same from the other side. Quake III's bots take a uniform symmetric error scaled by skill ([ai_dmq3.c](https://github.com/id-Software/Quake-III-Arena/blob/master/code/game/ai_dmq3.c)), which is what this record used to say and is 1999's answer. Stockfish's skill levels draw uniformly but multiply the draw by the gap between the best and second-best move, so a uniform input produces a heavy-tailed output that rarely changes a clear position and often flips a murky one ([search.cpp](https://github.com/official-stockfish/Stockfish/blob/master/src/search.cpp)). Maia's authors show that weakening an engine by depth alone "does not pass our test of accurately modeling granular human behavior" ([KDD 2020](https://arxiv.org/abs/2006.01855)). Mick West's working mechanism for believable mistakes is full-strength play plus a probabilistic deliberate error rather than reduced computation ([Game Developer](https://www.gamedeveloper.com/programming/intelligent-mistakes-how-to-incorporate-stupidity-into-your-ai-code)). And the BotPrize record is blunt about the failure this amendment removes: bots that repeated the same mistakes consistently were the ones judges spotted as machines ([survey](https://arxiv.org/pdf/2505.20011)).

What stood: the parameter, the three-value shape, the two depths, the nine names, and steady drawing nothing. What changed: the draw is now gated by an attention roll, so the depths bound a lapse instead of bounding every decision, and each row gained a rate. What it could not have known: that a uniform draw taken every time is the one shape the human-performance literature and the game-AI literature both name as the thing that does not read as a person.

**The two rates are starting rows and step 4 moves them (#39).** Loose at 100 in 1000 sits just past the degraded end of the measured human range; shaky at 250 in 1000 sits deliberately past any measured human, because the bottom rung has to be clearly worse than the top for Mark's done line to be readable at all. Neither number is derived and neither is defended as correct: they exist so the first batch can be played, and the first comparison between the two corners is what says where they belong. A moved rate is a new configuration name, by the rule above.

**This no longer departs from decision 17 the way it did, and the transcendental constraint is still honoured.** Decision 17 and the research both said Gaussian, and the objection stands: a Gaussian from this project's stream needs Box-Muller, whose `Math.log` and `Math.cos` are exactly the transcendentals ADR 0015 makes the project round by hand, where `Stream.nextInt` is integer-only rejection sampling already in the tree (`rng.ts:97-113`). What decision 17 was reaching for with a Gaussian was a body with a tail, and the attention roll delivers the tail with two integer draws and no transcendental at all. ADR 0053 says only "a drawn number of ticks", so nothing here departs from the ruling.

**Amended 2026-09-09, after the game design gate on the slice that built this, and it narrows what this record may claim.** Two paragraphs above are measured against the wrong unit and anchored on the wrong literature. Both corrections leave the mechanism and every number untouched, and neither is a gate overruling anything: they are errors in this record.

**The unit.** The nesting paragraph counts decisions. Counted per **tick**, which is the unit the field moves in, the loose hand acts on a stale command about 43 percent of ticks and the shaky hand about 82 percent: the rate times the mean depth, over a cycle of one deciding tick plus its stale tail. ALE's sticky actions, the closest shipped formulation of this mechanism, state their probability per frame for exactly that reason. "A steady hand on nine decisions in ten" is true; "a steady hand nine ticks in ten" is false, and the second is what a reader hears.

**The literature.** The anchors cited above are discrete-trial reaction time and vigilance, where a lapse is one slow trial among many normal ones. Dodging is continuous manual tracking, whose own literature puts a human's open-loop correction interval at 250 to 650 milliseconds, two to four corrections a second. The shaky hand re-decides about every 92 milliseconds, three to five times faster than that. **So this ladder is not a human hand at the top degrading toward a human hand at the bottom. It is superhuman in update rate at every rung**, and its sloppy rungs fail by the depth of a blind drift rather than by a slow reaction. A held command is a held direction: a 36-tick lapse drives the grave about 162 units across a 540-unit field blind, past the body it was walking to. The sloppy corner dies of overshoot.

What stood: the mechanism, the attention roll, every row, and the evidence for preferring a gated tail to a flat draw, which is a claim about the **shape** of error and survives the change of unit. What changed: this record no longer claims the ladder models a human's reaction. It claims only that the ladder plays worse along a named axis, which is Talakat's construction and what section 3 opens with. What it could not have known: that counting per tick and reading the tracking literature would land on the same correction, and that they would arrive from a gate run on the slice that built the thing.

**Measured immediately after, and the reason this matters beyond wording (#117).** Under these rows the sloppy corner reached the Undertaker's phase on **0 of 48** seeds, with 47 of 48 ending inside the Procession, against the sharp corner's 29 of 48. ADR 0053 believes a finding where the two corners agree, so as built the rule reaches about one minute of a nine-minute stage. Whether the second corner must reach the bosses, or whether the corner a finding must agree across becomes a middling rung, is Mark's and is #117. No row was moved for it.

**What was considered and left out.** A geometric stretch on the lapse depth, redrawing to extend the rare lapse further, is the closest match to the ex-Gaussian's actual tail and both research passes named it. It is left out of this step: it adds three more undefended numbers before a single measurement exists, where the attention roll alone is the correction that carries the finding. Filed as **#116** with its trigger: if the first comparison shows the two corners' bands too tight to separate, or the shaky hand's failures still read as uniform mediocrity in the tape, the stretch is the next move. A sum of uniforms is not, because it produces a symmetric bell, which is the same evenly-mediocre failure with more draws.

### The head: a shorter look-ahead

The parameter is the look-ahead sample list `scoreMove` walks (`bot.ts:79-80`, `:201-206`). It shortens from the far end, so a short-sighted hand keeps the near samples and loses the developing wave, which is the direction the file's own comment argues for: the near samples exist because "a threat that passes through the grave and is gone again by the far sample is exactly the one a policy sampling only the horizon cannot see at all" (`bot.ts:73-78`).

| Name | Samples, in ticks ahead | Horizon |
| --- | --- | --- |
| far | 5, 12, 20, 30 | half a second |
| middling | 5, 12, 20 | a third of a second |
| short | 5, 12 | a fifth of a second |

The head draws nothing. It is a constant per configuration, so the hand is the only thing in the harness that touches a stream.

**Amended 2026-09-09, after the game design gate:** shortening the list moves the wanting's settled point too, and the record said only that it loses the developing wave. `scoreMove` judges where a move arrives at the last sample in the list (`bot.ts:207`, through `LOOKAHEAD_TICKS` at `bot.ts:80`), so a short head settles at 12 ticks ahead where a far head settles at 30: it commits to food and to an offer's body on a nearer read as well as dodging on one. What stood: the parameter, the three lists, and that a list shortens from the far end so the near samples survive. What changed: nothing in the rows, only what this record claims the knob costs. What the paragraph could not have known: it read the sample list as the threat horizon alone, where the same list is also the wanting's.

### The nine names

A configuration is the hand word and the head word, said in that order: `steady-far`, `steady-middling`, `steady-short`, `loose-far`, `loose-middling`, `loose-short`, `shaky-far`, `shaky-middling`, `shaky-short`.

The two corners carry the project's own words. **The sharp hand is `steady-far`** and **the sloppy hand is `shaky-short`**, and those are the two the done line names and the two an ordering has to agree across.

`steady-far` is the base policy with both knobs at no error, which is the best this hand plays. It is not `dodgePolicy`, so no figure recorded under `dodgePolicy` bands with any configuration here. That is section 6's rule applied to this step's own new work.

**Amended 2026-09-09: the set is eighteen names, and the measurement that forced it.** Three hands were added between `loose` and `shaky`, each with the same three head words: `unsteady` (rate 140, bound 20), `wavering` (175, 25) and `faltering` (210, 30). The bound keeps the ratio to the rate that `loose` and `shaky` already carried. No existing row moved, so every batch already on disk stays comparable, and this was proved rather than asserted: `steady-far` replayed at the widening commit gave 48 tapes identical from byte 165 to the end, every differing byte inside the header's commit hash and timestamp.

The names were added to answer a question this section could not: the sloppy corner reached the Undertaker on 0 of 48 seeds where the sharp corner reached it on 29, and nothing between the two corners had ever been played. **What the sweep found is that the hand axis alone does not carry the difference.** Reach out of 48 at seed 20260909: `steady-far` 29, `loose-far` 32, `unsteady-far` 32, `wavering-far` 31, `faltering-far` 36, `shaky-far` 28. Six rows across the whole dexterity range and reach never leaves the high twenties or thirties. On the head axis, `steady-short` reaches 38, the highest figure in the table. **Only `shaky-short`, both errors maximal at once, reaches 0.** So the sloppy corner is not the bottom of a slope in either knob; it is the one place the two errors meet, and the drop belongs to their interaction rather than to either row.

Two points on the head axis do not map that interaction, and mapping it is not yet done. **The victories are the second reading and they do not line up with either knob**: 7, 7, 17, 5, 17 across `steady-far`, `loose-far`, `unsteady-far`, `wavering-far` and `faltering-far`. A swing from 5 to 17 out of 48 is about four standard errors, so it is not sampling noise around one rate, and it is not monotonic in the knob either. Either winning is not driven by the hand at all, or 48 seeds cannot separate these rows. Section 3's batch size of 48 was a budget-derived floor and never a measured one; this is the first evidence bearing on it, and it is a reading for Mark's #117 and for step 4, judged by neither this record nor any agent.

### The determinism condition, and where the stream lives

ADR 0053 is binding: one run per seed holds "only if the hand's stale-command draws and the head's shortened look-ahead come from their own named stream seeded off the run's seed".

**The stream is named `hand`, and it is made by the harness from the run's seed and held by the harness, never inside `RunState`.** `stream(seed, name)` folds the name into the seed by addition and then hashes, so the same seed and name always give the same sequence (`rng.ts:71-79`), and `src/dev` may reach `src/game` (`boundary.test.ts:70-73`).

Putting it in the run instead was rejected on a cost the tree states out loud. `RunState.streams` is a record over `StreamName` (`run.ts:267-273`, `rng.ts:4`), the witness folds every stream the run holds (`witness.ts:272`), and ADR 0019 requires the excluded half of that partition to be written down beside the folded half. A sixth stream inside the run would put the bot's dice in the shipped simulation and would land on `WITNESS_VERSION`, which hand-forward (f) pins at 6 and says must not move again. Outside the run, the witness is untouched, `WITNESS_VERSION` stays 6, and the sim never learns the bot exists. Replay is untouched either way, because a tape records the commands the simulation consumed (ADR 0053, ADR 0029).

The one sim-side change is `stream`'s own parameter, which widens from `StreamName` to a name string. `StreamName` stays the closed union naming the streams a run holds, and `RunState.streams` keeps its exact record type.

**`hand` does not collide, and that is measured rather than assumed.** Running `rng.test.ts`'s own overlap search over all six names at seed 77, across a hundred thousand draws and all fifteen ordered pairs, the closest overlap is none at all: no stream ever repeats another's opening eight draws inside the window, against a run draw budget of ten thousand. The name offsets are spawns 2074232581, drops 1682356354, mobFire 4273000731, shed 205143746, territory 4139688377, hand 31561984.

### Where the rows live

One data module in `src/dev`, one row per configuration, keyed by the configuration's name: the hold range, the sample list and the belch threshold. Nine rows and no arithmetic between them.

The standing extensibility constraint binds the report and not these rows: a configuration is a hand, not a weapon, so it is not keyed by line, and what is keyed by line is every number the report prints.

---

## 4. The batch, and what its report says

### The batch

One command, headless, over a seed range under one configuration: a first seed, a count, and a configuration name. The seeds walk consecutively, so a batch is named by three things and is reproducible from them; consecutive seeds are safe because the name offset is added and then avalanched (`rng.ts:78`), so seed n and seed n+1 hash to unrelated states.

**Batch size: 48 seeds, initial.** It is seeds and never repeats, because a deterministic policy needs one run per seed (ADR 0053; Silva et al., "A single run of A* already achieves our goals"). It is specified in runs and never in minutes, because cost is not symmetric across styles: Talakat's careful configuration got about 180 generations in twenty-four hours where its sloppy one got about 1,700 (research record, "What this implies"). The floor is 40, because both published correlations that found the tail most predictive read it at the top 5% (Rovio's top 15% and Tactile's "~5% of the best runs"), and below 40 seeds the top 5% is a single run, which is an outlier rather than a tail. 48 is that floor with margin. The cost the tree implies: `bot.test.ts` budgets 30 seconds for five runs of three stage lengths (`bot.test.ts:700`), so a stage-length run is on the order of two seconds and nine configurations at 48 seeds is 432 runs, roughly a quarter of an hour. That is a budget-derived estimate, not a measurement, and the first batch replaces it.

### Where the tapes go

Step 6's store does not exist, so batches write local tapes, under `local/batches/<batch>/<seed>.tape` with the batch's own report beside them as `local/batches/<batch>/report.json`. `local/` is gitignored by the repo root's own list (`the-cabinet/.gitignore:16`), so nothing here ever reaches a commit.

`<batch>` is the configuration name and the batch's recorded-at stamp, so two batches of one configuration against two builds do not collide. **The folder name is a convenience and the bytes are authoritative** (ADR 0057): every tape's header already carries the seed, the commit hash, the resolved starting size and levels, the roster and, after section 5, the configuration, so the store's later ingest reads the folder and learns nothing from its name that the bytes do not already say.

### What the report carries

Per run, everything `measure(tape)` already produces (`measure.ts:99-126`): the run summary (ticks, ending, stop, integrity, score, kills, checkpoints verified), damage per source, end levels, level-ups, the mob count per tick, the thirteen tuning readings (`readings.ts:78-92`), the frame performance report, the recorded and readback faults, and provenance.

Per batch, on top of those: the ending and the reach (did the run reach the Undertaker's phase, and how did it end); the section timeline, which is the instrument ADR 0049's clock is measured with (`sectionTimeline.ts:22-29`); the drop ledger split by line, which is take, pass, loss and still-standing per weapon line; take-by-slot split between banked offers and death-point offers (#98's second comment); the count of offers banked while one stood, which is decision 9's corner; the stripped-rung take rate by line once #99 lands (ADR 0055); the Waking's property; and #39's four instruments, which are the belch's own weight inside a boss span, grave-to-mob scale, the airborne-projectile figure, and the spiral-versus-comeback split at the size floor. **Each of those five is defined below as a one-hand reading**, because a reading no single hand can produce is a promise and not an instrument.

**Amended 2026-09-09, after the game design and tech gates: what those five actually read.**

**The belch inside a boss span** is a fire count and never one belch. `belchCadence` carries every fire with its tick (`belchCadence.ts:27-31`) and the boss spans come off the section timeline, so the reading is how many belches landed inside each boss's span and how much charge was carried into it. #37's story 12 is one belch plus play beating the Undertaker, and the count is what says whether the hand ever had one belch's worth to spend there; a reading of exactly one belch would be a reading of the story's wording rather than of the fight.

**The Waking's property** was listed as the committing and waiting corpse counts, which is two hands compared, and this report runs one hand at a time. As a one-hand reading it is the swallows inside the Waking's span: the `swallowed` events between `setPieceOpened` and `setPieceClosed`, one number per run, printed as a spread. It says what committing up the trail paid this build, and a build-to-build direction on it is what ADR 0042's property is worth to a batch. The two-hand comparison stays where it already lives, as `divingPolicy` against `waitingPolicy` in the suite.

**Grave-to-mob scale** reads the size series against the widths the build fields. `gravePath.sizePerTick` (`gravePath.ts`) is already recorded per run and `MOB_TYPES` carries each type's half width (`mobs.ts:74`, `:91`, `:110`), so the reading is the run's size spread printed beside those widths, and the scale is a ratio a reader takes rather than a number the report invents.

**The spiral-versus-comeback split** reads floor visits and what followed. A visit is the size series crossing down to `SIZE_FLOOR` (`tuning.ts:66`), and what followed is whether the run climbed back above it or ended there, which the report already carries as the ending. It is printed hand-bound and read only for its direction across builds: the hand dives at any size and never flees, so the absolute split is a fact about the hand, and the feel call underneath it is Mark's play and not this instrument (the design gate's deferral to #39).

**The airborne-projectile figure** is the storm and never mob fire. `fieldPerLine` already counts each line's own live things per tick and reports each line's peak (`fieldPerLine.ts:24-31`, and each line's own max at `:108`), which is the storm's pools by line, and what is missing on a headless tape is mob fire beside it. So the figure is each line's per-run peak with mob fire's peak beside it, and the batch reduces both to spreads. ADR 0014's density check is what reads it, and mob fire alone would have read the one pool the figure excludes.

**Every number is broken out by weapon line.** Three of the thirteen readings are per line today and the drop ledger is not: `dropLedger` counts drops spawned, swallowed, passed, lost and standing as five plain totals (`dropLedger.ts:21-29`), where the `offerTaken` event already carries the line taken and the lines passed (`offer.ts:314-318`). Splitting that ledger by line is the one reading this step has to widen, and it is named here rather than left for the coder to discover.

### How a distribution is printed

Never a mean. Every reading prints as its five-number summary, minimum, lower quartile, median, upper quartile, maximum, with the seed that produced the minimum and the seed that produced the maximum named beside it.

Naming the two extreme seeds rather than printing a percentile band is the honest form at this batch size: at 48 seeds the top 5% is two runs, so a band drawn over two runs would dress two numbers as a distribution. Naming them makes the tail reproducible, because a named seed is a whole run somebody can re-record and watch.

### How a comparison is stated

Two batches compare as orderings. The report prints one row per reading with one column per batch and a direction, up, down or flat, and no row states a target.

A direction is flat unless the quartile bands clear each other by a stated separation, and that separation is a data row rather than a compiled constant, because it is a number that must exist before it can be measured (the standing no-arithmetic-as-rules rule, #39's approach).

**A finding is printed as believed only where the sharp corner and the sloppy corner show the same direction.** `steady-far` and `shaky-short` are the two corners, and a row where they agree reads "agreed", a row where they differ reads "split" and carries both directions rather than one of them. That is Borovikov's own cross-check used as the report's own grammar: two policies, same content, and the agreement between them is the evidence that the finding is a property of the content rather than an artifact of the policy (research record, section 5).

### The seams the plan cuts at

Five, named and no further: the base policy and its configuration rows in `src/dev`; the batch runner's filesystem shell in `scripts/`, because `src/dev` carries `mayImport: []` and may not touch `node:fs` (`boundary.test.ts:70-73`, and `scripts/measure.ts:1-10` is the shape already in use); the report builder in `src/dev` beside `measure.ts`; the header field in `src/tape`; and the drop ledger's widening in `src/dev/readings`.

---

## 5. The header field, and the one bump

### The field

**Name: `policy`. A string. Beside `inputDevice` in the positional header.**

The name comes from the glossary, which already defines Policy as "the rules one harness run steers by, named in the tape header beside the input device so a bot run is never mistaken for a person's" (`CONTEXT.md`, The build). The value is the configuration's name, `steady-far` and its eight siblings, because under one policy with two knobs the thing that steered a run is the configuration.

A name string and never a code byte, because the set is open and a positional or ordinal encoding over an open set is the exact mistake ADR 0043 was written against (ADR 0053 says so outright). The nine names of section 3 are the set today, and the roster ADR 0053 defers would add names to it without touching the format.

**A person's run records `person`.** ADR 0027 forbids an absence, so the empty string is not available; `unknown` is not available either, because `inputDevice` already spends that word on a real unknown (`tape.ts:19-25`). `person` is resolved and true. It follows the pattern the reserved fields already use, a named constant at the one site that writes it (`tapeHeader.ts:18` and `:21`, and `tapeHeaderFor` at `:70-91`).

**How a bot run can never be mistaken for a person's**, in two guards rather than one. The name `person` is reserved: a test asserts no configuration the harness can run is named it, so the set the game writes and the set the harness writes are disjoint by construction. And `measure`'s aggregate exclusions gain the policy: today a run is excluded from default aggregates when its device is `bot` or `script` (`measure.ts:70-71`, `:173-188`), and a run whose policy is anything but `person` joins them.

The second guard is doing real work, because the device field alone is not currently enough. Nothing in production writes `inputDevice: 'bot'` at all: `record-conditioned.ts:151` and `local/slice13b-record.ts:47` both write `script`, and the browser writes `keyboard` or `touch` (`tapeHeader.ts:103-105`). So today a scripted wander and a full dodge-bot run are the same value in the header, and the `policy` field is what separates them.

### The bump, and the director's budget

The header is positional (`records.ts:105-125`), so one more field moves `FORMAT_VERSION` from 2 to 3 (`wireCodes.ts:28`) and every tape recorded before it stops decoding.

ADR 0053 asks that the bump be taken once, together with ADR 0056's open question of whether the director's budget travels in the header, and before ADR 0057's store starts filling.

**The budget is pinned to the build and takes no header field, so the single bump carries one field and is taken in this step.**

The rule that decides it is ADR 0027's own scope. ADR 0027 governs starting values, "the value the run actually started from", and its worked cases are the size a `?size=` pin resolved to and the levels a `?levels=` pin resolved to; it closes with "it governs any starting value the header gains". The director's budget is not a value a run resolves. It is authored stage content, and no URL pins it and no seed draws it.

Recording it would also be a false promise. A tape's replay already depends on every authored row in the stage, none of which is in the header, so a build that retunes the budget has retuned the rows around it, and the witness refuses the tape the moment the run reaches a tick where those rows change what the simulation did (ADR 0019 is the fidelity gate, and ADR 0043 says the recorded identity "answers interpretation and the witness answers fidelity"). A run that never reaches such a tick replays clean under both builds, which is exactly the fold reading live run state and nothing about an unreached authored row (`witness.ts`, `foldWitness`); amended 2026-09-09 after slice 3's CodeRabbit pass, which found the earlier "refuses either way" overstated. A header that named the budget while a hundred sibling rows stayed compiled would say a run could be rebuilt from it when it could not.

**Amended 2026-09-09, after the product vision gate:** the budget has no column on the phase today. `Phase` carries `directed`, `liveTemplateCeiling`, `liveBodyCeiling`, `music`, `boss`, `bankOpens` and its rows, and no budget (`stage.ts:48-78`), so the sentence that named one was describing step 4's shape rather than the tree's. What stood: the ruling and its whole argument, which rests on ADR 0056's own wording that the budget is authored and on ADR 0027 governing values a run resolves. What changed: the claim that the column already exists, which becomes a claim about the shape step 4 will author. What the paragraph could not have known: nothing, and that is the point; the column was assumed rather than read. The cost of being wrong is named rather than hidden: if step 4 authors a budget a run resolves, ADR 0027 pulls it into the header and a second bump is taken, and that bump still lands before ADR 0057's store starts filling, which is the moment ADR 0043 says a bump is cheapest.

ADR 0043's own sort confirms it: the format version describes wire layout, recorded content identity carries the vocabulary a content-dependent value is written in, and no recorded value's meaning depends on knowing the budget's number.

**The trigger that would reopen it, named rather than left implicit: the day the budget becomes something a run resolves**, drawn from the seed or pinned by URL for a tuning experiment, it is a starting value and ADR 0027 pulls it into the header, at the cost of a second bump.

### What the bump costs

Every tape at format version 2 stops decoding. In the tree that costs nothing: `local/` and `dist/` are gitignored and every tape in them is regenerated, and there is no committed fixture tape (#109 records its absence).

What it does cost is outside the tree. Mark saves tapes to `/mnt/c/Users/markd/Downloads/*.tape`, and any tape he is holding from before this step stops decoding on the branch. That is the whole of the price and it is paid at the point ADR 0043 argues is smallest, before the store starts filling, since after that a bump orphans database rows as well as loose files.

---

## 6. The rigs, and what each one's figures mean

#107 found two rigs under one label. There are five, and the label covers two of them.

| Name | Starting size | Starting levels | Policy | Tape | Where |
| --- | --- | --- | --- | --- | --- |
| the ceiling rig | `SIZE_CEILING` | maxed | `dodgePolicy` | none | `bot.test.ts:431-441` |
| the start-size rig | `SIZE_START` | maxed | `dodgePolicy` | records one | `local/slice13b-record.ts:55-70` |
| the ladder rig | `SIZE_CEILING` | birthright | `hitTakingPolicy` | none | `bot.test.ts:452-463` |
| the conditioned rig | `SIZE_START` | chosen per run | a fixed wander | records one | `scripts/record-conditioned.ts:165-195` |
| the harness rig | `SIZE_START` | birthright | the base policy under a named configuration | records one | this step |

"The maxed dodge bot at seed 101" is the label #107 found, and it covers the first two, which differ by starting size. The label is retired: every reported figure names its rig.

**The harness rig starts at the birthright and is the only one that does.** That is the point of it: #98's first acceptance line is that its runs reach levelled builds rather than sitting there, so a rig that started maxed could not show the thing the ticket asks for. Hand-forward (g) says no dodging birthright run crosses the stage today, which is the reading the harness rig exists to move.

**Two of the five write no tape, and their figures live only in prose.** The `policy` field plus the header's resolved size and levels make a rig recoverable from the bytes for the three that record, so a figure from a tape names its own rig without anybody writing it down. The ceiling rig and the ladder rig have no such guard, and a figure from either is only ever as well labelled as the sentence carrying it. That is a limitation of those two rigs and not something this step fixes.

---

## 7. What proves the harness itself

Six things, each with the actor who does it.

**The policy takes offers, and its runs reach levelled builds.** Agent, as a spec test: a harness-rig run over the pinned seeds ends above the birthright and produces `weaponLeveled` events. It is a test rather than a reading because it is a property of the policy and not a comparison about the game.

**One seed twice is one run.** Agent, as a spec test, and it must run under a sloppy configuration: `steady-far` draws nothing, so a determinism test under the sharp hand would pass on a harness whose stream was wired wrong. The test plays one seed twice under `shaky-short` and asserts the same tick count and the same witness at every checkpoint.

**A bot tape replays and attests as a person's does.** Agent, as verification readback (ADR 0019, ADR 0033): decode one batch tape, recompute the fold at its checkpoints, and assert `measure` answers `outcome: 'verified'` rather than a divergence or a refusal.

**The corner where a second carrier is killed while an offer stands.** Agent, as a reading and not a test. The path exists in the sim already (`openOffer` banks when an offer stands, `offer.ts:207-213`), so what the harness adds is that a played run walks it. The report carries the count of offers banked while one stood; the corner is exercised when that count is above zero on at least one seed. **A batch-wide zero is a finding to report, not a bug**: it would say the corner is unreachable at the density the stage currently reaches, which is a fact about the schedule and something the director step needs to know.

**The sharp hand reaches the Undertaker on most seeds and the sloppy hand on fewer.** Agent runs both corners over the batch and reports the two reach rates; Mark reads them. This is the done line, and it is deliberately not a test.

**One honest note on that line.** "Most seeds" is a threshold, and ADR 0053 forbids the harness from stating thresholds. The two are not in conflict, and the distinction is worth writing down rather than papering over: ADR 0053 governs findings the harness reports *about the game*, and the done line is a bar on *the harness itself*, the evidence that the two ends of the ladder are far enough apart to be worth reading. It is the one number in this step stated as a bar, it is Mark's own, and nothing the harness says about the game may be stated that way.

**Added 2026-09-09, after the game design gate: what both corners low means.** Hand-forward (g) says no dodging birthright run crosses the stage today, so the likely first result is that the sharp hand reaches the Undertaker rarely and the sloppy one hardly ever. That is a reading about the game and it is step 4's first tuning input: it says the stage as authored is beyond a hand that plays it straight, which is exactly what #39 exists to move. **It is never grounds to sharpen the hand.** A hand tuned until it clears the stage measures the tuning of the hand, and every ordering the batch then prints is an ordering between two builds read by an instrument that moved between them. The knobs widen only if the two corners land on top of each other, which is a different failure and the one step 17 names.

---

## 8. Magnitudes

Every number in this record is an initial data row, tuned at step 4 by the tuning pass (#39). Each with its home.

| Row | Initial | Home |
| --- | --- | --- |
| The base policy's clearance | 12 | the configuration rows in `src/dev` |
| The belch threshold, live shots | 8 | the configuration rows |
| The attention failure rate, steady | never | the configuration rows |
| The attention failure rate, loose | 100 in 1000 decisions | the configuration rows |
| The attention failure rate, shaky | 250 in 1000 decisions | the configuration rows |
| The lapse depth, steady | none | the configuration rows |
| The lapse depth, loose | 0 to 15 ticks | the configuration rows |
| The lapse depth, shaky | 0 to 36 ticks | the configuration rows |
| The look-ahead, far | 5, 12, 20, 30 | the configuration rows |
| The look-ahead, middling | 5, 12, 20 | the configuration rows |
| The look-ahead, short | 5, 12 | the configuration rows |
| Batch size, in seeds | 48 | the batch runner's default, overridable per run |
| The band separation a direction needs | to be measured on the first batch | the report's own rows |

**Added 2026-09-09, after the game design gate: these rows are not tuned with the game's.** Every row above is the hand's own, and step 4 moves the game's rows while reading the hand. A hand row moved between two batches would compare two builds through two instruments, which is the one thing the batch's whole grammar exists to prevent. So a changed hand row is a new configuration with a new name, never a retune of an existing one, and any comparison holds the hand fixed. What #39 tunes is the game; what this record hands it is a fixed set of hands to read the game with.

What is not a magnitude, and must not be quietly changed: that both knobs cost the hand something rather than granting it something; that the hand is the only thing in the harness that draws, and it draws from its own stream seeded off the run's seed; that batch size is seeds and never repeats; that a finding is believed only where the two corners agree on the ordering; and that no number the report prints is a target.

---

## 9. The words this record adds

Challenged against `CONTEXT.md`, which already carries **Playing harness** and **Policy**. Six candidates, none written into the glossary here, because a coder holds the branch and the entries land with the slices.

**Amended 2026-09-09, after the product vision gate:** the **Playing harness** entry does need rewriting, and so does the V1 line in the concept box. Both say the harness "moves, dodges, feeds and takes offers" (`CONTEXT.md:201`, `game-concept.md:11`), which is ADR 0053's four verbs, and section 1's commitment makes it five. What stood: **Policy**, which already names the header field and needs nothing, and the six candidates below. What changed: the entry is no longer finished, and the dispatch plan's slice 1 carries both edits beside its amendment to ADR 0053, so all three restatements reach Mark in one review. What the paragraph could not have known: it challenged the new words against the glossary and never re-read the entries the record's own commitment had aged.

**Configuration**: One hand the harness plays with: the base policy under one value of each knob, named by a word pair a person can say. Nine of them exist, from `steady-far` to `shaky-short`, and the name is what a tape's header records. *Avoid*: difficulty, skill level, persona, profile.

**Dexterity error**: The knob that holds a decided command stale for a drawn number of ticks. It is an error and not a skill: it takes something away from the hand rather than giving it something. *Avoid*: reaction time, lag, input delay, twitch.

**Strategy error**: The knob that shortens how far ahead the policy looks, from the far end so the near samples survive. An error on the same terms as the dexterity one. *Avoid*: intelligence, planning depth, foresight, IQ.

**Sharp hand, sloppy hand**: The two corner configurations, `steady-far` and `shaky-short`. A finding is believed only where both show the same ordering, so these two are what an agreement is between. *Avoid*: good bot, bad bot, expert, novice.

**Batch**: One run per seed over a seed range under one configuration, reported as distributions. Its size is seeds and never repeats, because the policy is deterministic. *Avoid*: sample, trial, simulation run, sweep.

**Rig**: One starting condition a run is played from, named so a figure always says which one produced it. Five exist. Figures from two rigs are never banded. *Avoid*: setup, harness, scenario, fixture.

---

## 10. Commitments this record would create

Two, both flagged rather than filed, because turning a craft call into an ADR-level commitment Mark did not make is outside the pre-authorized list.

**The base policy belches, which widens ADR 0053's list of what the policy does.** ADR 0053 says it "moves, dodges, feeds and takes offers", and this record makes it five verbs. The evidence is in section 1 and the alternative is named there. If Mark takes it, ADR 0053 is amended in place with the dated what-stood, what-it-replaced, what-it-could-not-have-known triple: what stood is the whole ruling, what changed is the verb list, and what it could not have known is that #37's story 12 would still have no hand two steps later, which is #98's third comment.

**The director's budget is pinned to the build and never travels in the header**, which closes ADR 0056's own open question. Section 5 carries the argument. If Mark takes it, ADR 0056's "left open as design work" line loses that item and gains the ruling with its trigger, and ADR 0053's "the bump is taken once" sentence is satisfied by one field rather than two.

Neither is filed here. `CONTEXT.md` and the ADRs are untouched by this record.

---

## 11. Claims in the record found false against the code

**1. The research record says `bot.ts` carries four named policies. It carries six.**

`playing-harness-precedent.md` claim 22 says "a Policy type with four named policies", and its own Open items correct the dispatch's "one policy" to "four named policies, not one". Against the code, `bot.ts:432-441` exports six: `dodgePolicy`, `unloadedPolicy`, `belchingPolicy`, `hitTakingPolicy`, `divingPolicy` and `waitingPolicy`. The substance of the claim stands, which is that a `Policy` type and several named policies already exist and that none of them reads an offer; the count is wrong and the two that were added, `divingPolicy` and `waitingPolicy`, are the pair carrying the Waking's property, which is exactly the pair this step's base policy is closest to.

**2. "The offer goes into the existing dodge policy" does not describe a hand that feeds.**

Decision 17 (`decisions.md:83`) and #98's approach comment both say it. `dodgePolicy` drifts toward `HOME` and never targets food (`bot.ts:221-228`, `:89`); the policy that feeds is `divingPolicy` (`bot.ts:406-415`). The ruling underneath stands exactly as written, that the offer goes into the policy before any second style exists, because until a hand can take a drop no two styles have anything to differ about. What is wrong is only which existing function the new work sits on top of, and section 1 takes that call.

**3. `scripts/record-conditioned.ts` steers a fixed wander, not a policy, so the harness inherits its header and not its steering.**

#98's approach names it under "what it touches", and `path-draft.md` item 3 reads as though the recording entry already plays. `steer` at `record-conditioned.ts:165-170` is a fixed arithmetic wander, and the progress note records that it seals shut inside the Procession. What the harness inherits from it is the header shape, the seal and the one-execution-authority loop (`:178-195`); what actually recorded every bot tape in step 2 is `local/slice13b-record.ts`, which is gitignored and throwaway.

**4. `rng.test.ts`'s overlap test names four stream names and there are five.**

`rng.test.ts:12` sets `NAMES` to `spawns`, `drops`, `mobFire`, `shed`. `StreamName` has carried `territory` since the Territory line landed (`rng.ts:4`, `run.ts:272`). The test's own comment says it is "written this way so that adding a fifth colliding stream name fails loudly", and the fifth stream name was added and the test does not cover it. It is a real gap and it is adjacent to this step rather than inside it, because the harness's own determinism condition rests on exactly the property this test guards. Measured for this record, at seed 77 over a hundred thousand draws and all fifteen ordered pairs of the six names including `hand`, no stream repeats another's opening eight draws at any offset, so nothing is currently wrong; what is wrong is that nothing would say so. **This wants a ticket rather than a fix inside this step**, under the standing rule that a gate finding becomes a ticket unless it blocks the next slice.

**5. No production module writes `inputDevice: 'bot'`.**

The research record's claim 23 says the header "already tells bot runs from human ones... by device", and the value exists in `TAPE_INPUT_DEVICES` (`tape.ts:19-25`). Only tests ever write it (`measure.test.ts`, `compareRuns.test.ts`). Every bot-recorded tape in this tree says `script`, the same word the fixed wander writes. The claim is true about the format and false about what the tree records, which is a second reason the `policy` field is worth its bump.

**6. Line citations drift.**

Everything above was read at the step 2 close while adjustment iteration 4 was landing on `setPiece.ts`, so citations into `src/game/stage/setPiece.ts` and anything the #104 slice touched will have moved. Nothing this record depends on is in that file; the citations that carry the calls are in `bot.ts`, `offer.ts`, `rng.ts`, `run.ts`, `witness.ts`, `tape.ts`, `records.ts`, `wireCodes.ts` and `measure.ts`, none of which the adjustment touches.

---

## 12. Two commitments taken under the default, for Mark to review on the branch before merge

Both items below were taken under their recommended default by the dispatching session on 2026-09-09, under the one-push rule that ADR-level calls are the session's to make and Mark's to review on the branch before merge. Each ADR amendment waits for that review; the dispatch plan is written against the defaults.

**1. The base policy belches.** Recommended default: yes, on `belchingPolicy`'s existing rule with the threshold as a data row. It is what lets #37's story 12 and #39's boss-fight belch instrument be answered at all, and #98's third comment is the filed cost of the alternative. If he says no, the harness is a hand that never belches, `belchCadence` reports an empty fire list on every run of every batch, story 12 stays open past step 4, and #39's tuning pass loses one of its four instruments. It widens ADR 0053's verb list, which is why it is here rather than only in section 1.

**2. The director's budget is pinned to the build and never travels in the tape header.** Recommended default: yes, and take the format bump now with one field. It closes ADR 0056's open question and satisfies ADR 0053's "take the bump once". If he says the budget should be in the header, this step's bump carries two fields instead of one and section 5's argument is the thing to overturn: that the budget is authored stage content rather than a value a run resolves, and that naming one stage row in the header while a hundred stay compiled promises a rebuild the header cannot deliver. **Stated plainly after the product vision gate:** the budget is not built yet, so this commitment rests on ADR 0056's wording and on the shape step 4 will author, not on a column anybody has read. If step 4 makes the budget something a run resolves, the ruling reverses and a second bump is taken, and that bump still lands before the store starts filling.

**3. Everything else in this record is a craft call and is his to overrule on the branch**, in particular the nearest-body rule in section 2, the nine configuration names in section 3, and the batch size of 48.
