# A playing harness: how shipped games built bots that play the game for tuning

Research for Hungry Grave. Labels: **DOCUMENTED** = a developer statement (talk, deck, commentary, interview, paper by the studio, patch note), a shipped data or source file, or a disassembly write-up. **COMMUNITY-MEASURED** = wiki, format reverse-engineering, or player-derived. **INFERRED** = my reading across sources.

This document sits beside [survivor-numbers.md](survivor-numbers.md), [director-precedent.md](director-precedent.md), [progression-tuning-precedent.md](progression-tuning-precedent.md) and [reward-delivery-models.md](reward-delivery-models.md), and it is read against [CONTEXT.md](../CONTEXT.md). The siblings already hold the arcade rank formulas, the survivors-like spawn tables, the Halls of Torment Agony history and everything the Left 4 Dead director reads and changes, and none of that is repeated here. Two sources the siblings also cite, Michael Booth's GDC 2009 decks and Gabe Newell's December 2008 Edge essay, are re-read here for different passages, because the dispatch asks for the harness sentences rather than the director ones and those sentences are not in the siblings.

The new ground is the harness itself: who built a bot to tune a game rather than to ship as opponent AI, what that bot read, what its runs measured, how many styles it wore, how fast it ran, and how its numbers were kept from becoming the verdict.

The question this answers: what should a machine that plays Hungry Grave many times over be shaped like, what should each of its runs write down, and how many deliberate styles should it wear?

The strongest sources are Fernando de Mesentier Silva and Igor Borovikov's EA papers on The Sims Mobile, which name the questions the designers asked and the changes the answers caused; Borovikov's Game AI Pro chapter for EA's methodology across several titles; Mike Ambinder's GDC 2009 deck on Valve's playtesting philosophy; Booth's deck for the survivor bots; Newell's essay for the overnight runs; the Cave interviews at shmuplations.com for the arcade side; and Khalifa, Lee, Nealen and Togelius's Talakat, which is the only agent in this record built for a bullet hell and the only one whose style knobs are published as numbers.

---

## What is solid

These are the claims I would build on.

1. **Valve's "tens of thousands of games every night" is real, it is Gabe Newell's own sentence, and it is bounded on both sides by the paragraph it sits in.** The claim and the guard are two sentences apart, and the guard is the more useful half. DOCUMENTED.

2. **Valve's bots were survivor bots, not a tuning rig: the same code that filled an empty player slot in the shipped game was pointed at an accelerated clock overnight.** Booth's deck lists the automated stress testing as one bullet under a goal about human player proxies, not as a measurement system. DOCUMENTED.

3. **Valve's stated playtesting goal excludes the thing a harness measures.** Ambinder's deck: "Playtesting Goal: Fun. Not bug testing. Not game balancing. DEFINITELY not focus testing." The automated runs sit in a different column of the same deck, under stat collection and design experiments, whose listed weaknesses are "Averages hide extreme examples, Miss nuance (lacking context), Requires rigor, Can see 'illusory' patterns." DOCUMENTED.

4. **No arcade shmup developer on record automated play at all, and the one who was asked said the judgement cannot be imitated.** Cave's Ichimura: difficulty "is set by the programmers," after the first location test, off "about a 3 minute portion of the game," and "That's something that we really do by intuition, and it would be very difficult to imitate I think." DOCUMENTED.

5. **The one automated instrument an arcade shmup team is on record using is a god-mode ceiling run, and it under-read the humans by a third.** Cave's Kouyama on Dodonpachi: "we set the board to invincibility mode and calculate what the limits are on scoring. But we only got to about 400m when we did that!!" against a human 600m. A bot that cannot die still bounds a number, and the bound was wrong in the direction that matters. DOCUMENTED.

6. **The measured finding that most changes what a weak bot is worth: relative difficulty was invariant to the policy, and four studios found it independently.** Borovikov, on a mobile match-3: "the *relative* difficulty measured from random autoplay was actually like that obtained from near-optimal agents." On The Sims Mobile: "the relative rate of progression did not notably change after we applied RL and learned more sophisticated gameplay policies." Tactile Games: "despite performing sub par, it is still possible to use the performance of the agent to estimate... player metrics." Ubisoft's agent sat about twenty points of win rate under its humans and still moved the same direction per player cluster. Absolute numbers were far from human; the ordering was not. DOCUMENTED.

7. **Published bot-to-human correlations do exist, and they are not King's.** Rovio and Aalto report Spearman correlations against human pass rates of 0.80 for AI pass rate, 0.74 for the ratio of moves left, and 0.60 for cleared goals, "computed as averages over 1000 runs of the DRL agent per level." King reports only mean absolute error and redacts the human axis of its own plot. DOCUMENTED.

8. **The best runs predict humans better than the average run, found twice.** Rovio used the top 15% of runs for one feature and the top 5% for another; Tactile found "the highest correlation occurs when only considering ~5% of the best runs." A batch that reports a mean throws away the part that correlated best. DOCUMENTED.

9. **Not one significant survivors-like ships an autoplay or an idle mode, and one studio states the reason as a principle.** Vampire Survivors (275 patch bodies searched), Brotato (86), Halls of Torment (110), Death Must Die, Deep Rock Galactic: Survivor and 20 Minutes Till Dawn all automate the weapon and reserve the movement. Chasing Carrots: "the player should always stay in direct control of the character and be able to move in a precise manner." DOCUMENTED.

10. **poncle nonetheless shipped a named policy menu into this exact genre.** Vampire Survivors' Party Mode offers eight CPU behaviors, of which the useful half is Defensive, Aggressive, Greedy for pickups and Stands still. Player one is always human. DOCUMENTED.

11. **Every hand-authored style roster in the record landed on four or five, and its members differ by two or three numbers in one shared vector.** Holmgard's five personas differ by one or two utility weights each. EA's shooter set is four. Unreal Tournament ships five names over one float. Quake III exposes 49 characteristics and its recognisable characters move about four of them off centre, with two shipped bots sitting flat on all of them. DOCUMENTED.

12. **Skill is a small number of scalars degrading one policy, never a second policy.** Quake III authors three skill anchors per bot and linearly interpolates every float between them. Counter-Strike moves five numbers across an eight-rung ladder. Borovikov uses one SoftMax temperature: "the temperature may be interpreted as player skill." Talakat uses two error terms. DOCUMENTED.

13. **No published game telemetry schema carries a field marking a session as bot or human, and no paper in the automated-playtesting literature describes one either.** The vendors' documented answers are separate environments (Unity) or a separate game key (GameAnalytics), both of which make comparing the two in one query impossible. The one-store-one-discriminator pattern is attested only outside games: Datadog's `session.type` (`user` / `synthetics` / `ci_test`), OpenTelemetry's `user_agent.synthetic.type` (`bot` / `test`), GA4's `traffic_type`. DOCUMENTED.

14. **The four reasons EA abandoned driving the real client are the four things Hungry Grave's sim already does not do.** Silva et al.: the client could only run as fast as it responded to finger tapping, graphics and animation could not be turned off, menus had to be navigated, and waits could not be fast-forwarded. Their answer was to re-implement the mechanics headless, for "roughly thousand fold" speed. Hungry Grave is already the thing they had to build. DOCUMENTED.

15. **A deterministic policy needs one run per configuration; a stochastic one needs thousands.** Silva et al. ran 2000 simulations of each approach: "The simulation with A* agent achieves a deterministic playstyle, having no variance. In contrast, the game client Softmax agent has high variance requiring numerous simulations for convergence... A single run of A* already achieves our goals." DOCUMENTED.

16. **The only agent in this record built for a bullet hell parameterizes style as two axes with three values each, and both axes are errors rather than skills.** Talakat's A* agent carries a dexterity error (a Gaussian on how many frames an action is forced to repeat, standard deviation 10 / 6 / 2 for low / medium / high) and a strategy error (decision time per frame, 40 / 60 / 80 ms), giving nine named configurations. DOCUMENTED (paper).

17. **Authoring a style is the expensive part, and two studios say so.** Silva et al.: "The challenge is then to build a heuristic that can target the gameplay style that we are looking for in an experiment... Weighting the different components to achieve the desired outcome is not simple. The parts have to be managed delicately and minor changes can result in different strategies." EA SEED, on the same problem as a reward function: it "can easily result in unexpected behaviors" and "often requires extensive reward engineering by those with in-depth domain knowledge." The persona authors add their own caveat, that hand-set personas are "extremes within the space of strategies" and should later be learned from player data. DOCUMENTED.

18. **Every published case where a bot's number decided something has a designer between the number and the change, and the papers say so in the same paragraph as the result.** Silva et al. closed a build comparison with "The two different builds provide very different experiences. It is up to the designers to decide which experience they prefer," and closed a career comparison with "The game team decided that these values represented their original design intentions and choose not to make any changes." DOCUMENTED.

19. **Bot runs find bugs and exploits at least as reliably as they find difficulty.** Silva et al.'s agent discovered it could stop an event at the first step for the same reward as finishing it: "When presented with this novel strategy, the game team traced it to an error in the tuning parameters and fixed it." DOCUMENTED.

20. **The oldest named case of a game playing itself for feedback is an accident, and its stated benefit is wall-clock.** Borovikov on Sid Meier's Alpha Centauri: "developers discovered by accident that the computer players could play each other... The result was a valuable source of feedback that could be collected in hours compared to the multiple days it might take a human to play the full game." DOCUMENTED.

21. **A shipped shmup already stores a run the way Hungry Grave's tape does: a per-stage seed, the resolved starting conditions, and a frame-stamped key bitmask.** Touhou 6's replay format carries `random_seed`, `power`, `lives`, `bombs` and `difficulty` (the rank value) per stage, then a list of `{time, keys}` keystates. It stamps the adaptive value at stage entry because the seed alone cannot rebuild it. COMMUNITY-MEASURED (format reverse-engineering).

22. **The bot Hungry Grave already has is a Policy type with four named policies, and its own comments say why it is not an optimizer.** `src/dev/bot.ts`: "Every policy is a pure function of run state, so a seed and a policy name are a whole run and two machines get the same one," and "a bot proof is an upper bound on perfect play and never a fairness result." The shape the industry arrived at is the shape already in the file; what is missing is the offer. DOCUMENTED (repo).

23. **The tape header already tells bot runs from human ones, and it does it by device rather than by policy.** `TAPE_INPUT_DEVICES` is `keyboard`, `touch`, `bot`, `script`, `unknown`, decided before the first tick. There is no field naming which policy steered. DOCUMENTED (repo).

---

## 1. Valve: the "tens of thousands of games", and what they were actually for

### The source for the claim (DOCUMENTED)

The sentence is Gabe Newell's, in his own essay for Edge, published 2008-12-24, four weeks after Left 4 Dead shipped. It is not from Booth and not from a talk. Source: <https://web.archive.org/web/20090106130006/http://www.edge-online.com/blogs/gabe-newell-writes-edge>.

Verbatim, with the sentences either side, because the claim is routinely quoted without them:

> "There have also been lots of advantages, in terms of customizability, about having a procedural approach. We can turn off the graphics and have the game play itself and then use much more statistical methods for analyzing outcomes. We can play tens of thousands of games every night and then spend some time looking at graphs rather than watching individual players play. It definitely moves us in a much more abstract and quantitative way of thinking about big chunks of gameplay while moving a lot of the responsibility out of the hands of level designers and into the hands of programmers."

And the next paragraph, headed "Test, Test, Test":

> "But I don't want to give anyone the impression that we've abandoned human play testing. The automatic testing gives us a security blanket but we still want to watch people and make sure that the things that we create quantitative metrics for actually have real world applicability. We're theorizing about a lot of this stuff, we want to actually watch players and find out how they're reacting. We have to test each play theory and make sure it's actually true."

The essay's last sentence is the one that decides what a harness is for:

> "Ultimately, statistics are guiding stories and generating narrative, but they are all based on actual, real-world, human experiences of playing the game."

### What ran, and what it measured (DOCUMENTED)

Booth's GDC 2009 deck puts the automated runs under the goal "Provide Competent Human Player Proxies," alongside the shipped drop-in bots, as three bullets:

> "Survivor Bots. Allowed us to assume 4 player Survivor team for game tuning and balance. Drop in/out ("Take a Break") incredibly valuable in the wild. Automated stress testing with 4 SurvivorBots and accelerated game time."

Source: <https://steamcdn-a.akamaihd.net/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf>. The companion cooperative-design deck carries the same three bullets with the last one shortened to "Automated testing": <https://cdn.cloudflare.steamstatic.com/apps/valve/2009/GDC2009_ReplayableCooperativeGameDesign_Left4Dead.pdf>.

**What the runs measured is not published.** Newell says "statistical methods for analyzing outcomes" and "looking at graphs"; Booth says "stress testing." No deck, commentary node, or interview found names a metric, a graph, a threshold, or a decision the overnight runs settled. Searched for and not found, listed again under Open items.

The nearest thing to a metric list is a different deck. Mike Ambinder's GDC 2009 "Valve's Approach to Playtesting" gives the stat-collection category as "Record of gameplay behaviors: Deaths, level times, friendly fire, ..." and its analyses as "T-tests, Regressions." Source: <https://cdn.cloudflare.steamstatic.com/apps/valve/2009/GDC2009_ValvesApproachToPlaytesting.pdf>.

### The bot was a game feature first (DOCUMENTED)

Every constraint on the survivor bot in Booth's deck is a fairness constraint for a human teammate, not a measurement constraint:

> "Players need to believe bot replacements are 'fair'. Imperfect knowledge - simulated senses. Simulated aiming. Reaction times. Reliable and predictable decision making."

> "SurvivorBots prioritize human teammates over bots. Game 'cheats' to guarantee some undesirable events cannot occur. SurvivorBots cannot deal friendly fire damage. SurvivorBots never use Molotovs. If a SurvivorBot ever gets far out of place for any reason, it is teleported near the team when no human is looking at it."

Read that list as a warning rather than a model. A bot that cannot deal friendly fire, never throws a Molotov, and teleports back to the team when unobserved is not measuring the game a human plays; it is measuring a game with three rules removed. The deck's own framing is that this was acceptable because the bot's job was to stand in for a missing fourth player.

### Valve's own separation of the two data sources (DOCUMENTED)

Ambinder's deck is the clearest published statement of what a harness is not allowed to answer, and it comes from the studio that ran the harness:

> "Playtesting Goal: Fun. Not bug testing. Not game balancing. DEFINITELY not focus testing."

Its process line is the several-variations model stated plainly: "Goal is a fun game. Game designs are hypotheses. Playtests are experiments. Evaluate designs off playtest results. Repeat." Its technical half lists "Design Experiments: Hypothesis testing. Compare two or more conditions. Collect data. Verify hypothesis," with the cost "Right questions aren't always clear" and "Proper experimental design is a process." The stat-collection half lists its own weaknesses: "Averages hide extreme examples. Miss nuance (lacking context). Requires rigor. Can see 'illusory' patterns."

So the studio that could run tens of thousands of nightly games put fun in the human column, hypothesis comparison in the technical column, and never merged them.

---

## 2. Arcade shmups: no bot on record, a three minute base, and one god-mode instrument

### The direct answer, from Cave (DOCUMENTED)

Ichimura, in the Cave Shooting History interview collection, asked who sets difficulty:

> "That is set by the programmers, yes. For the arcade games, it usually gets set after the first location test. We use about a 3 minute portion of the game as a base, and set the difficulty from there. The difficult part is when the game doesn't stress the player's abilities enough and we have to adjust the balance to be more challenging. That's something that we really do by intuition, and it would be very difficult to imitate I think."

Source: <https://shmuplations.com/cavestghistory/>. Two things in one answer. The tuning unit is a roughly three minute slice, which is Hungry Grave's whole stage. And the developer's own claim is that the judgement is not imitable, which is the strongest on-record statement against a harness anywhere in this document.

### The one automated instrument, and how far off it was (DOCUMENTED)

Kouyama, in the 1997 Dodonpachi developer interview, on how the team bounded the score:

> "When we do the playtesting, we set the board to invincibility mode and calculate what the limits are on scoring. But we only got to about 400m when we did that!! (laughs) I mean, seriously... 600m?"

Source: <https://shmuplations.com/dodonpachi2/>. This is the closest thing the arcade lineage has to a harness: an instrumented build, a removed failure condition, and a computed ceiling. It produced a number, the number was a third under what a top player actually scored, and the developer's reaction was laughter rather than a tuning change. **An invulnerable run bounds the economy and does not bound the play.**

### The ordinary loop, from the same team (DOCUMENTED)

Kouyama, 1998, asked how bugs and playtesting are handled:

> "At first it's done in parallel with the rest of the development, by the programmers themselves who test for bugs and adjust the difficulty as they go. Then, 2 to 3 weeks before the master app is due, we use that time to playtest extensively and debug."

Source: <https://shmuplations.com/dodonpachi/>. Ikeda, in the Cave 15th anniversary interview, puts the balancing after the location test and says the game listens to players: "our usual workflow is to tune everything up after the location test, taking into account both the player's and programmer's opinions," and "I think our ability to make good games really does have a lot to do with how we listen to players during our development process." Source: <https://shmuplations.com/cave15th/>.

### The author-skill bias, named by a shmup designer (DOCUMENTED)

Yagawa, asked whether his own skill affects how he tunes, in the Cave Shooting History collection:

> "Naturally, when you make a game you test play it, and I think there ends up being a relationship between the programmer's skill and the skill required by the game. Though I'm not sure if that's apparent to other people. Actually, among programmers, there are plenty of people who aren't very skilled, and when those people are forced to make a 'difficult stage', they unfortunately have to rely on their imaginations to create it."

This is the shmup-native argument *for* a harness with several styles, made by someone who never built one: the single tester who tunes the game is the author, and the author's hands are the calibration. Borovikov names the same problem from the other side, as a reason to use agents: they operate "at a scale and depth inaccessible to the relatively few (and frequently biased) developers playing the game early in its development."

### What a shipped Cave debug build actually contained (COMMUNITY-MEASURED)

A disassembly of DonPachi recovers the debug tooling still present in the shipped ROM: a pause with stage scrubbing forward and backward that doubles as a level select, a RAM editor, a palette editor, an object spawner, a stage select, a leftover "DEBUG MODE" configuration string, and a hidden sound-test auto-play that "will automatically cycle through the sound effects and play each once." Source: <https://sudden-desu.net/entry/donpachi-debug-tools-and-more/>.

Read the list for what is absent. The only thing in a Cave debug build with "auto" in its name plays sound effects. There is a stage scrubber so a human can get to the part they are tuning, and there is nothing that plays.

### The replay format, which is the tape (COMMUNITY-MEASURED)

Touhou 6 ships `.rpy` replays whose reverse-engineered layout is a per-stage struct carrying `score`, `random_seed`, `power`, `lives`, `bombs` and `difficulty` (EoSD's rank value), followed by a list of `{uint32 time, uint16 keys}` keystates, where keys is a bitmask of shoot, bomb, focus, up, down, left, right and skip-dialogs. Source: <https://pytouhou.linkmauve.fr/doc/06/t6rp.xhtml>.

Two details earn their place. The seed is per stage rather than per run, so a stage is independently replayable. And `difficulty`, the adaptive rank number, is stamped at stage entry alongside the resolved power and lives, because the seed and the inputs alone cannot rebuild an adaptive value that depends on everything the player did before. That is the same argument Hungry Grave ADR 0027 makes for recording resolved values rather than absences.

---

## 3. Survivors-likes: no autoplay anywhere, and one shipped policy menu

### The genre-level finding (DOCUMENTED, patch bodies and wikis)

**Not one significant survivors-like ships an autoplay or an idle mode.** Vampire Survivors, Brotato, Halls of Torment, Death Must Die, Deep Rock Galactic: Survivor and 20 Minutes Till Dawn all automate the *weapon* and reserve the *movement* for the player. Where autoplay exists, the game has crossed into the idle genre and sells itself that way.

Chasing Carrots state it as a principle rather than an omission: "there are some important principles like the player should always stay in direct control of the character and be able to move in a precise manner. We never unnecessarily impede the player's movement and hit boxes are sized in the player's favor." Source: <https://fullcleared.com/features/inside-halls-of-torment-an-interview-with-chasing-carrots/>.

### Vampire Survivors (DOCUMENTED, 275 Steam news items and the official wiki)

All 275 news items for appid 1794680 were pulled and searched for autoplay, auto play, idle, AFK, bot, AI and auto aim. Every hit is a false positive: `idle` is sprite work ("added idle animations for bats"), and the single `auto-play` is a Steam overlay bug fix.

The Options menu has no auto anything, and cannot: weapons fire on fixed timers in fixed patterns, so there is nothing to aim. Source: <https://vampire.survivors.wiki/w/Options>. No Arcana touches movement (<https://vampire.survivors.wiki/w/Arcanas>). Il Molise is a gold-farm bonus stage whose enemies do not move, not a test rig (<https://vampire.survivors.wiki/w/Il_Molise>).

**But poncle did ship a policy menu, and it is the most directly transferable artifact in this section.** The Masquerade relic (October 2025) unlocks Party Mode, where the player picks the behavior of up to three CPU companions from eight named options:

> "Defensive: CPUs stay close to the player. Multiple CPUs with this behavior will try to evenly defend the player in a ring formation.
> Aggressive: CPUs stay close to enemies, but attempt to avoid damage.
> Chaotic: CPUs move randomly.
> Mirrors your movements: CPUs perform the opposite inputs the player does.
> Follows you: CPUs repeat the player's inputs after a delay.
> Greedy for pickups: CPUs collect pickups when available, including Experience Gems.
> Stands still...?: CPUs stand still.
> Actively trying to get damaged: Similar to the Aggressive Behavior, but CPUS will not avoid enemies and keep receiving damage."

Source: <https://vampire.survivors.wiki/w/Masquerade>. Eight named movement policies, shipped in this exact genre, and player one is always human. Note what is on the list: two ordinary styles (Defensive, Aggressive), one greedy style aimed at pickups, one null baseline (Stands still), one deliberate suicide policy, one random policy, and two that are functions of the player's own input. **Every one is expressible as a movement target plus a threat weight**, which is the shape `src/dev/bot.ts` already has.

**Galante tuned by hand, at volume.** "on Steam alone, I probably have 3,000 hours, and those are 3,000 hours of playing and play testing" (<https://www.gamesradar.com/games/roguelike/on-steam-alone-i-probably-have-3-000-hours-nobody-loves-vampire-survivors-more-than-its-creator-who-once-thought-nobody-would-play-it-for-more-than-two-hours-and-ironically-says-short-games-rule/>), and his own routine is a short fixed list: "I always try the latest characters, for sure, and then I go back to the first couple of characters... Plus, of course, I need to have a run with Queen Sigma and see how much chaos I can put on screen" (<https://www.pockettactics.com/vampire-survivors/interview>). His balance position is in the sibling record already.

No poncle statement about a bot, a simulation, or an automated run exists in the Noclip documentary transcript or in any interview found. In the documentary he says of the enemies: "Smart enemies aren't really the point of the game. There is no AI whatsoever in the game." Source: <https://www.youtube.com/watch?v=XQVdR8mJrds>.

### Brotato and Halls of Torment (DOCUMENTED, patch bodies and interviews)

Brotato: 86 news items searched, no autoplay and no idle mode, and no Blobfish statement about automated testing. Autoplay for Brotato exists only as community mods.

Halls of Torment: 110 news items searched. It ships auto-aim and auto-attack as separate toggles with key bindings, and movement is always manual. Chasing Carrots on balancing: "Balancing is hard and a lot of time and effort went into it on Halls of Torment. In very simplified terms, it's playing our own game a lot and making a ton of gut decisions based on our observations. We have a lot of spreadsheets lying about that we use to plan how different progressions should play out and tweak certain values to arrive at a desired outcome."

They do mention automation once, and the sentence is about QA, not balance: "we are a very small team, and as such we don't have a very elaborate QA process. We do a lot of internal testing, some of it is even automated. But inevitably bugs will slip through." Source: <https://www.pieuvre.ca/2024/09/06/videogames-halls-torment-chasing-carrotts-interview/>. **Do not read that as a balancing bot.**

### The idle hybrids (COMMUNITY-MEASURED, store pages)

Where autoplay exists in this shape, the game is selling idleness. Novivors advertises "Various playing modes available to suit your needs (fully auto, all manual, or a mix)" (<https://store.steampowered.com/app/3002860/Novivors/>). Swarm Survivor: Endless Siege advertises "No manual movement, no pickup chores. Combat is fully automated" plus "Desktop small-window mode: Park the game in a corner of your screen and let a run tick along while you work" (<https://store.steampowered.com/app/3745020/Swarm_Survivor_Endless_Siege/>).

The demand exists and the genre answered it with community mods and AFK farm builds, never with a first-party toggle on a headline title.

---

## 4. Automated playtesting with shipped cases

Read this section for two things: what each bot was allowed to see, and what happened to its number after it was produced.

### King, Candy Crush Saga (DOCUMENTED, papers by the studio)

**Input: a hand-designed feature stack, never pixels.** Gudmundsson et al., "Human-Like Playtesting with Deep Learning," CIG 2018: "The game board state, as the input of CNN, is represented as a 9x9 grid with 102 binary feature planes," made of "80 item channels," a "20 objective channel," "1 legal-move channel," and "1 bias channel." Source: <https://gwern.net/doc/reinforcement-learning/imitation-learning/2018-gudmundsson.pdf>.

**The bot imitates, it does not optimise.** "The training of the network is done with supervised learning from player data from previous levels. Therefore, the policy network learns the most common action taken by the players in similar states." Training data came from "approximately 1% of players, selected at random, during about 2 weeks," giving "nearly 1.2 x 10^7 samples." Move-prediction accuracy "reached around 47%."

**What the runs measured:** success rate per level, at 100 or 1,000 attempts per level, plus, per the same paper's future work, "score distribution and move distribution."

**How it was compared to humans, and the thing to know: King has never published a correlation coefficient.** The abstract claims only "we show that this approach increases correlation with average level difficulty." What is published instead is a binomial regression with random effects mapping bot success rate to human success rate, scored by mean absolute error, fitted on 800 levels and tested on the next 200: CNN at 1,000 attempts reaches 4.0% MAE against MCTS at 100 attempts reaching 5.4%. The human axis is redacted from the plot: "The actual success rates for players are considered as sensitive information and therefore removed."

Their reason for a regression rather than a correlation is the finding that matters to a harness with few styles: "The agent is much less random than players. It is because (a) the agent is a single player while human-players belong to a large group of millions of individuals playing with different skills and strategies; (b) agents follow their own policy to the point and that leads to highly correlated results." Their own proposed fix is personas: "Creating player 'personas' based on different policies to represent clusters of similar players has the potential to greatly increase the understanding of levels."

**Speed and shipped use.** "In CCS we can now estimate the difficulty of a new level in less than a minute... This compares to the previous 7 days needed with human playtesting on each new episode of 15 levels." And: "Since we ran the experiments presented in this paper we have used the CNN agent for more than a year, for more than 1,000 new levels in CCS."

**The 2025 successor changes the input and repeats the caution.** Fragkedaki et al., "Comparative Analysis of GAT and BERT for Human-Like Playtesting," CoG 2025, moved the board from a grid to a graph because "Portal connections cannot be represented using the CNN input as those are connections between non-adjacent tiles," and reports two warnings in its own words: "Surprisingly, move prediction accuracy results do not directly translate to the simulation performance," and "the correlation is weaker on harder levels, where players tend to win more frequently than the models predict." Source: <https://arxiv.org/abs/2607.11501>.

**Weaker bot, more runs, same answer.** Purmonen's KTH thesis, done at King and cited by the CIG paper: "even though the DNN is much weaker than MCTS it is about as good or better at predicting human difficulty when it is allowed to make 1000 attempts per level instead of 100." Source: <https://kth.diva-portal.org/smash/get/diva2:1154062/FULLTEXT01.pdf>.

### EA, The Sims Mobile: the closest thing to the harness described (DOCUMENTED, papers by the studio)

Silva, Borovikov, Kolen, Aghdaie and Zaman, "Exploring Gameplay with AI Agents," AIIDE 2018, is the single most transferable source in this document. Source: <https://ojs.aaai.org/index.php/AIIDE/article/download/13034/12882>.

Its abstract states the model exactly: "we present a playtesting approach that explores the game space with automated agents and collects data to answer questions posed by the designers. Rather than have agents interacting with an actual game client, this approach recreates the bare bone mechanics of the game as a separate system. Our agent is able to play in minutes what would take testers days of organic gameplay... Our test case game, The Sims Mobile, was recently released and the findings shown here influenced design changes."

**Why driving the real client failed, in four reasons that are all absent from Hungry Grave:**

> "First, the game mechanics could only be driven as fast as the client allowed. Since human gameplay was the only use case, it was built to fast enough to respond to human finger tapping, but no faster. Second, neither graphics nor animation could be turned off, skipped, or otherwise bypassed... Finally, the in-game menus could not be turned off as well, so the agents had to navigate them as part of their logic. It was also impossible to fast forward the time spent waiting for actions to be performed."

Their answer was a headless re-implementation from the game's own JSON tuning files, at "roughly thousand fold" speed, "about a thousand actions every second."

**The four questions came from designers, and the heuristic was written per question.** "Our experiments were agreed upon in consultation with the game designers with whom we identified clear goals for the agents... They propose questions about the game tuning, such as imbalance or possible exploits. We then write a heuristic aimed at exploring the issues raised. This means heuristics are frequently changed or re-written."

**What happened to the four answers is the whole lesson.** One found an imbalance and caused a change: the second Romantic event needed thirteen appointments against three or four elsewhere, and "The game team adjusted the number of appointments for this event over the next iterations of the game." One found an imbalance and caused nothing: "The game team decided that these values represented their original design intentions and choose not to make any changes." One found a bug: the agent stopped an event at its first step for the same reward as finishing it, and "When presented with this novel strategy, the game team traced it to an error in the tuning parameters and fixed it." One compared two builds and refused to rank them: "The two different builds provide very different experiences. It is up to the designers to decide which experience they prefer."

**Run counts, which is the direct answer to how many is enough.** The relationship experiment ran 1,000 times to average out local optima. The approach comparison ran 2,000 simulations each and concluded: "The simulation with A* agent achieves a deterministic playstyle, having no variance. In contrast, the game client Softmax agent has high variance requiring numerous simulations for convergence... A single run of A* already achieves our goals."

Borovikov's Game AI Pro chapter is the methodology behind the same work, and carries the finding that matters most for a bot that is not very good: **relative difficulty was invariant to the policy, in two different games.** On a mobile match-3: "the *relative* difficulty measured from random autoplay was actually like that obtained from near-optimal agents." On The Sims Mobile: "While the absolute number of taps we obtained was far from what was observed from human gameplay, the relative rate of progression did not notably change after we applied RL and learned more sophisticated gameplay policies." Source: <https://www.gameaipro.com/GameAIProOnlineEdition2021/GameAIProOnlineEdition2021_Chapter10_AI-Driven_Autoplay_Agents_for_Prelaunch_Game_Tuning.pdf>.

Two more lines from that chapter earn their place. On the oldest case: "In SMAC, developers discovered by accident that the computer players could play each other... The result was a valuable source of feedback that could be collected in hours compared to the multiple days it might take a human to play the full game." And on why agents rather than the team: they operate "at a scale and depth inaccessible to the relatively few (and frequently biased) developers playing the game early in its development," which is Yagawa's programmer-skill problem restated by the other side.

A caution the chapter raises that Hungry Grave is already immune to: "Many games can support a simulation speed multiplier, but this has limitations due to the main update loop requirements... That is true for any system that makes an implicit assumption of sufficiently small fixed-size time increments per update." A fixed-tick sim does not scale time; it runs ticks as fast as the machine allows, and each tick is the same tick.

### EA SEED, Battlefield 2042 and Dead Space: testing, not tuning (DOCUMENTED)

Gillberg et al., "Technical Challenges of Deploying Reinforcement Learning Agents for Game Testing in AAA Games," CoG 2023, names the shipped titles: "a set of AAA games including Battlefield 2042 and Dead Space (2023)." Source: <https://arxiv.org/abs/2307.11105>.

**What these bots measured is coverage, not difficulty:** "In order to validate and test that helicopters can be successfully piloted to reach all intended locations in the game world and that they do not get stuck."

**Their reason for refusing pixels is a scale argument, not a purity argument:** "simulating 250 helicopters over all game processes does not allow for efficient image based input generation as rendering viewports for all of them is intractable. Further, when using image data, the agent becomes sensitive to graphical changes in the environment, such as new textures, assets or rendering post processing common in the game production process. Hence, we decided to construct an observation space based on a minimal set of game state features. This state is ego-centric to the agent."

Their inference budget is worth writing down, because it bounds how clever a per-tick policy may be: "current solutions for automated testing only require under 100 microseconds for decision making, setting an upper feasibility boundary for inference time."

The earlier CoG 2020 paper measured difficulty as training cost, which is an idea with no analogue here but is worth knowing exists: "The time it takes for the agent to master a task can be used as an indicator of how difficult the game would be for a human player." Source: <https://arxiv.org/abs/2103.15819>.

### Ubisoft: bot capability, and one warning about win-only bots (DOCUMENTED)

Ubisoft's published work is mostly about building bots that can play, not about predicting human difficulty. The For Honor SmartBot deck lists "Fight balancing (153 unique match-ups)" as a motivation, reads a hand-picked state vector rather than pixels, and rewards `damage_to_opponent - damage_received`. Source: <https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2zfAyG0mnCZ9IBkt4W5iEP/21a379147c6351fa2ab9d2f6f0184397/DeepBots_Autodesk_2018_v2.pdf>. Delalleau's GDC 2019 rule is blunt: "Learning from pixels: Avoid it if you can." Source: <https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2KBudkg4PSyN7io2qQWAxv/886ec7bd381cd666dec7978c83b196b2/Delalleau-2019_ML-tutorial-day-smart-bots-for-better-games-reinforcement-learning-in-production.pdf>.

The transferable result is from Le Pelletier de Woillemont, Labory and Corruble, AIIDE 2022, on an internal tactics prototype rather than a shipped title, and it is the best per-cluster human comparison found anywhere: the agent's absolute win rate sits about twenty points under the humans', but when a new level made three human clusters do better, better and worse respectively, the agent emulating each cluster moved the same three directions. Their conclusion about win-only bots is the warning: "Had we used the WinOnly model to give feedback to the designers we would have been right about the shots and dash, we would however have missed completely the feedback on the super capacities." Source: <https://arxiv.org/abs/2211.17188>.

Their human dataset was 25 players over 7 levels, 175 data points.

### Unity: three studios, and the conclusion is that simple bots were enough (DOCUMENTED)

Unity's own case-study post covers iLLOGIKA, Furyion and Ritz Deli, "offloading nearly 40,000 hours (~4.5 years) of automated playtesting," and draws this conclusion: "What's particularly noteworthy is that all three studios were able to gain immense value with Game Simulation while relying on relatively simple approaches for creating their Virtual Player." Source: <https://unity.com/blog/games/automate-your-playtesting-create-virtual-players-for-game-simulation>.

None of the three used machine learning. Ritz Deli used "a simple heuristic greedy algorithm." Furyion used a four-rule behavior tree and measured "the average time of level completion for each combination of weapon, ammo, and weapon module" over "over one hundred thousand possible combinations," saving "more than 600 hours of playthrough." iLLOGIKA used raycasts plus rules and deliberately injected error: "For each action described in steps 1 and 2, choose an incorrect but possible action to account for the unpredictability of a real player."

None of the three published a comparison to human runs. These are self-consistency and outlier sweeps.

The one Unity case with an explicit human anchor is Jam City's Snoopy Pop, and the anchor is small: "we declare an agent to have 'mastered' a level if it reaches average human performance (solves the level at or under the number of bubbles a human uses)... For Level 25, this corresponds to 25.14 steps/bubbles shot, averaged from 21 human plays of the same level." Twenty-one human plays was enough to calibrate the bot. Source: <https://unity.com/blog/engine-platform/training-your-agents-7-times-faster-with-ml-agents>.

Unity Game Simulation itself is gone: development was put on hold in January 2022 and the service deprecated in December 2023, per Unity's package changelog. COMMUNITY-MEASURED, since this came back as a summary of the doc pages rather than a quoted line: <https://docs.unity3d.com/Packages/com.unity.simulation.games@0.5/changelog/CHANGELOG.html>.

### Rare, Sea of Thieves: the premise does not hold (DOCUMENTED)

Rare's automated play is a functional and regression suite, not a tuning bot, and it does not run overnight. Robert Masella's GDC 2019 talk describes about 23,000 tests run through TeamCity "about every 20 minutes," across unit tests, actor tests, integration tests, network tests, screenshot diffs, performance runs and boot flows. Source: <https://www.youtube.com/watch?v=X673tOi8pU8>, notes transcribed at <https://docslib.org/doc/7277552/automated-testing-for-multiplayer-game-ai-in-sea-of-thieves>.

The tests inject synthetic input and assert on internal state: "we do the run operation, which is in this case is having the player apply a fake input just to turn the wheel, and then finally we do an assertion and we check that the wheel angle has kind of gone beyond a certain tolerance." Nothing in the talk measures difficulty, compares bot runs to human runs, or feeds a design number.

The one continuous number is performance: "we have the whole world, a client in a world, and we'd collect data for five minutes or something like that, travel to every island... and then we have graphs that we'll monitor."

The stated payoff is worth recording because it is the payoff a tape-and-invariants rig already claims: "because we've done all that automated testing first, the manual testers are going to always get a good build to test with, so they're not going to get that show-stopping bug that happens all the time."

### The small-team counter-example: Slay the Spire ran no bot at all (DOCUMENTED)

Two full-time developers with a card game to balance built a metric server and read humans, not agents. Anthony Giovannetti: "I said at one point, 'look, we're not going to reasonably be able to balance this many cards, we don't have a team of people to do this'... so we took a data-driven approach." Source: <https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder>.

**Their two headline metrics translate directly onto Hungry Grave's offer:** "how often a player picks a card when given the choice (too low and it's 'basically not a card in our game at that point'), and how often a card appears in a winning deck (too high and you know that card is overpowered)."

Two more lines are the shape of the instrument rather than the shape of the game. Casey Yano on what makes the data usable: "it's important to have it filterable for a specific thing," and "it's also important to have a specific question in mind when looking at the data that you couldn't answer just by playing the game." And Giovannetti on what the numbers were not: "Acting on that data was not a 'mathematical' approach. The team looked for patterns and tried to intuitively decide how to make a card more fun."

### Developers saying, in their own words, not to trust the bot alone (DOCUMENTED)

- EA SEED, CoG 2020: "we have observed that RL is better suited for modular integration where it can complement rather than replace existing techniques."
- EA SEED, CoG 2023: "The use of RL agents alone should not be seen as means of replacing scripted bots altogether, but rather complement scripted bots in a symbiotic fashion where they fall short."
- Sahar Asadi, Director of AI Labs at King: "the tweaking is an assistive tool where the designer determines the criteria for what is a good tweak or refinement for each level. It's an assistive tool, right? Consider it like a co-pilot for coding, but this is a co-pilot for designing." Reported quotation rather than a studio publication: <https://mobilegamer.biz/how-king-balances-human-and-ai-powered-design-in-candy-crush-saga/>.
- Alexander Andelkovic, senior agile testing lead at King, in his own article: "I think bots will replace all the predictive testing that exists today. Important questions that we will continue to struggle with and where humans will continue to play an important part in are, does this look good? Is this fun? Is this healthy?" Source: <https://www.infoq.com/articles/candy-crush-QA-AI-saga/>.
- Philip Dunstan, lead AI programmer at Massive, on The Division's client bots: "they're not really trying to play like a human, we're not trying to model human play. They move through the levels on a 'golden path'... You still need to have dev testers testing that you can't walk off... But you get an early sort of smoke-test system of saying is there something significantly wrong with this level?" Source: <https://www.gamedeveloper.com/design/the-secret-ai-testers-inside-tom-clancy-s-the-division>.
- Ubisoft, on metric gaming: "in a RTS game with a metric measuring the amount of resources gathered, the CARMI agent could gather the desired amount of resources in an unexpected way. This could indeed produce misleading feedback for the designers."

---

## 5. Deliberate styles, and how they were parameterized

This is the section the dispatch cares about most, and the industry-standard answer is unusually consistent: **four or five named styles, each differing from the others by two or three numbers in one shared weight vector, with skill as a separate axis.**

### Procedural personas: the academic origin, and the weights are tiny (DOCUMENTED, papers)

Holmgard, Liapis, Togelius and Yannakakis defined personas on the MiniDungeons testbed as utility weight vectors over game events. From "Personas versus Clones for Player Decision Modeling," Table 1, weights over Move, Monster, Treasure, Death, Exit:

| Persona | Move | Monster | Treasure | Death | Exit |
|---|---|---|---|---|---|
| Exit | -0.01 | | | | 0.5 |
| Runner | -0.02 | | | | 0.5 |
| Survivalist | -0.01 | | | -1 | 0.5 |
| Monster Killer | -0.01 | 1 | | | 0.5 |
| Treasure Collector | -0.01 | | 1 | | 0.5 |

Source: <http://julian.togelius.com/Holmgard2014Personas.pdf>. Every persona differs from every other by one or two numbers, and the Runner is the Exit persona with one weight doubled: "All personas derive a slight amount of negative utility from each move made, in order to ensure progression through the level. The value subtracted is doubled for the Runner persona."

The later MCTS paper cuts to four (Runner, Monster Killer, Treasure Collector, Completionist) and states the method plainly: "The personas vary solely in the weights of decision-making utilities that describe their valuation of a set affordances... By configuring these weights using designer expert knowledge, and passing the configurations directly to the MCTS algorithm, we make the personas exhibit a number of distinct decision making and play styles." Source: <https://ar5iv.labs.arxiv.org/html/1802.06881>.

**The count came from the game, not from taste:** "Five different potential sources of positive or negative utility were identified in the MiniDungeons game, based on an analysis of the game's mechanics." And the design goal was legibility: "this paper focuses on 'archetypical' agents which are straightforward to understand or modify by designers."

The authors flag their own hand-authoring as provisional: "The current personas are defined by hand, and are in a sense extremes within the space of strategies that can be represented with the current set of primary utilities. When sufficient player data has been collected... we should try to learn personas directly from player behavior."

### EA: four named styles for a shooter, and a later reframe away from counting (DOCUMENTED)

EA's "Winning Isn't Everything: Enhancing Game Development with Intelligent Agents," on an open-world shooter, names four:

> "Aggressive: the agent tries to defeat adversarial NPCs. Sniper: the agent finds a good sniping spot and waits for adversaries to appear in its cone of sight to shoot them. Exploratory: the agent attempts to explore as many locations and objects of interest as possible while actively trying to avoid combat. Sneaky: the agent tries focus on its objectives while avoiding combat."

The same paper separates the two axes explicitly: "We define skill as how efficient the agent is at completing the task it is designed for. Style is vaguely defined as how the player engages with the game and what makes the player enjoy their game-play." Source: <https://ar5iv.labs.arxiv.org/html/1903.10545>.

SEED's later MultiGAIL uses two styles for racing ("careful: applies forward acceleration sparingly, and uses minimal right and left steering" versus "reckless: maximum forward acceleration with excessive steering right and left") and three for navigation ("jump", "zigzag", "strafe"), and deliberately replaces the count with a blend: "game developers can select any desired alpha values to control the behavior of the personas, using only one single model." It also carries the cost warning: authoring a style as a reward function "can easily result in unexpected behaviors" and "often requires extensive reward engineering by those with in-depth domain knowledge." Source: <https://arxiv.org/abs/2308.07598>.

### Quake III Arena: one table, forty-nine knobs, three skill anchors (DOCUMENTED, shipped source)

id Software's GPL release is the richest hand-authored example on record. `code/game/chars.h` defines 49 characteristics, each with its range in a comment, and several with a documented behavioral threshold table:

```
//attack skill
// >  0.0 && <  0.2 = don't move
// >  0.3 && <  1.0 = aim at enemy during retreat
// >  0.0 && <  0.4 = only move forward/backward
// >= 0.4 && <  1.0 = circle strafing
// >  0.7 && <  1.0 = random strafe direction change
#define CHARACTERISTIC_ATTACK_SKILL                 2  //float [0, 1]
```

Plus `CHARACTERISTIC_AGGRESSION`, `CHARACTERISTIC_SELFPRESERVATION`, `CHARACTERISTIC_VENGEFULNESS`, `CHARACTERISTIC_CAMPER`, `CHARACTERISTIC_EASY_FRAGGER`, `CHARACTERISTIC_ALERTNESS` and `CHARACTERISTIC_FIRETHROTTLE`, all `float [0, 1]`. Source: <https://raw.githubusercontent.com/id-Software/Quake-III-Arena/master/code/game/chars.h>.

Shipped values at `skill 4`, the standard tier:

| Bot | Aggression | SelfPres | Vengefulness | Camper | EasyFragger | AttackSkill | Reaction | Jumper |
|---|---|---|---|---|---|---|---|---|
| Sarge | 0.75 | 0.25 | 0.5 | 0.15 | 0.5 | 0.75 | 1.0 | 1.0 |
| Grunt | 0.5 | 0.75 | 0.5 | **0.75** | 0.5 | 0.75 | 1.75 | 0.75 |
| Crash | 0.7 | 0.7 | 0.7 | 0.7 | 0.0 | 0.7 | 2.5 | 0.0 |
| Klesk | **1.0** | **1.0** | **0.0** | **0.0** | 0.5 | 0.8 | 1.25 | 1.0 |
| Major | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.95 | 2.5 | 0.5 |
| Visor | 0.95 | 0.25 | 0.95 | 0.5 | 0.1 | 0.75 | 2.0 | 1.0 |
| Anarki | 1.0 | **0.0** | 1.0 | 0.5 | 1.0 | 1.0 | 0.75 | 1.0 |
| Xaero | 0.75 | 0.95 | 0.95 | 0.25 | 0.05 | 0.95 | 0.5 | 0.95 |

**Read the table for what stays still.** Forty-nine knobs exist and the bots that read as different characters move about four of them off centre. Crash, the tutorial bot, is a flat 0.7 on every style field; Major is a flat 0.5. A deliberately styleless baseline is one of the shipped entries.

**The skill mechanism is the cleanest answer to skilled versus novice anywhere in this record.** Each bot file authors exactly three blocks, `skill 1`, `skill 4` and `skill 5`, and `be_ai_char.c` linearly interpolates every float between the two nearest anchors at load time:

```c
scale = (float) (desiredskill - ch1->skill) / (ch2->skill - ch1->skill);
out->c[i].value._float = ch1->c[i].value._float +
                    (ch2->c[i].value._float - ch1->c[i].value._float) * scale;
```

Source: <https://raw.githubusercontent.com/id-Software/Quake-III-Arena/master/code/botlib/be_ai_char.c>. Three authored anchors, one continuous dial, no separate difficulty code.

### Counter-Strike: skill tier crossed with a preference list, and the roster is composed (DOCUMENTED, shipped file)

The shipped `botprofile.db` is headed "Author: Michael S. Booth, Turtle Rock Studios" and "This database defines bot 'personalities'." Source: <https://raw.githubusercontent.com/SteamTracking/GameTracking-CS2/55f2a470f68b60540e801ce853acd3fc4faceedd/game/csgo/pak01_dir/botprofile.db>.

Its templates fall into exactly two groups, and neither is a playstyle in the persona sense. One group is a weapon preference list (Rifle, Sniper, Shotgun, Punch, Power, Spray). The other is an eight-rung skill ladder (Elite, Expert, VeryHard, Hard, Tough, Normal, Fair, Easy). A named bot is then a composition of one from each, with only cosmetics overridden: `Elite+Sniper Rebel`, `Hard+Spray Maximus`, `Tough+Sniper Bank`.

The two ends of the ladder move five numbers:

| | Elite | Easy |
|---|---|---|
| Skill | 100 | 5 |
| Aggression | 95 | 10 |
| ReactionTime | 0.05 | 0.60 |
| AttackDelay | 0 | 0.70 |
| AimFocusOffsetScale | 0.05 | 0.6 |

The parser's recognised attribute set is closed and short: Aggression, Skill, Skin, Teamwork, Cost, VoicePitch, VoiceBank, WeaponPreference, ReactionTime, AttackDelay, Difficulty, Team, with anything else an error. The header documents the three scalars as percentages with named poles: "0 = coward, 1 = berserker", "0 = terrible, 1 = expert", "0 = rogue, 1 = complete obeyance to team". Source: <https://raw.githubusercontent.com/ValveSoftware/halflife/master/game_shared/bot/bot_profile.cpp>.

**One scalar earning its keep across several unrelated decisions is the pattern worth copying.** Aggression is read three ways in the attack state, each a plain linear expression:

```c
crouchChance = 20.0f * (1.0f - me->GetProfile()->GetAggression());
m_isCoward = (RANDOM_FLOAT(0.0f, 100.0f) > 100.0f * me->GetProfile()->GetAggression());
float chaseTime = 2.0f + 2.0f * (1.0f - me->GetProfile()->GetAggression());
```

Source: <https://raw.githubusercontent.com/rehlds/ReGameDLL_CS/master/regamedll/dlls/bot/states/cs_bot_attack.cpp>.

Correction to a widely repeated claim: **there is no Rusher template and no Fool template in any shipped Valve bot profile.** Both the CS2 file and the Condition Zero vanilla file were checked; every match for those names is a community mod.

### Unreal Tournament: five named combat styles as an enum over one float (DOCUMENTED, shipped source)

Competence is one scalar behind eight labels (Novice through Godlike), clamped in `Bot.uc` with `bNovice = (Skill < 4)`. Style is a separate small record, `RosterEntry`, with Epic's own range comments:

```
var() float Aggressiveness;  // 0 to 1 (0.3 default, higher is more aggressive)
var() float Accuracy;        // -1 to 1 (0 is default, higher is more accurate)
var() float CombatStyle;     // 0 to 1 (0= stay back more, 1 = charge more)
var() float StrafingAbility; // -1 to 1 (higher uses strafing more)
var() float Tactics;         // -1 to 1 (higher uses better team tactics)
var() float ReactionTime;
var() float Jumpiness;       // -1 to 1
```

And the shipped menu turns one of those floats into a named enum of five:

```
CombatStyleNames(0)="Normal"      CombatStyleValues(1)=0.500000
CombatStyleNames(1)="Aggressive"  CombatStyleValues(2)=1.000000
CombatStyleNames(2)="Berserk"     CombatStyleValues(3)=-0.500000
CombatStyleNames(3)="Cautious"    CombatStyleValues(4)=-1.000000
CombatStyleNames(4)="Avoidant"
```

Sources: <http://ericdives.com/UT2004-UnCodex/Source_unrealgame/rosterentry.html>, <https://eatsleeput.com/undox/Uncodex-UT99-v436/utmenu/utindivbotsetupclient.html>. **Five names over one continuous number** is the smallest workable version of this whole idea.

### Talakat: the only style parameterization built for a bullet hell (DOCUMENTED, paper)

Khalifa, Lee, Nealen and Togelius, GECCO 2018. Their A* agent's style is two error terms, not two skills, which is the inversion worth stealing:

> "Dexterity error forces the agent to repeat its actions for a number of frames. The severity of dexterity error is modeled as a gaussian distribution modeling the number of repeated frames. A high dexterity agent is forced to repeat fewer frames. The strategy error reduces the time alloted for the agent's decision making process. A high strategy error can force the agent to make decisions before it arrives at an optimal choice. A high strategy agent has more time to explore its options."

| | Dexterity (std dev of repeated frames) | Strategy (decision ms per frame) |
|---|---|---|
| low | 10 | 40 |
| medium | 6 | 60 |
| high | 2 | 80 |

Two axes, three values each, "for a total of 9 possible dexterity-strategy configurations," each run as its own 24 hour experiment. Source: <https://arxiv.org/abs/1806.04718>. The dexterity and strategy model itself comes from Isaksen, Gopstein, Togelius and Nealen, "Simulating Strategy and Dexterity for Puzzle Games," CIG 2017: <http://www.nealen.net/papers/isaksen-cig17.pdf>.

**Both knobs cost the agent something rather than granting it something.** A style is a way of playing worse along a named axis, and the baseline is the agent playing as well as it can. That is a materially different construction from adding an aggression weight, and it fits a dodging game better: for a grave, dexterity error is input held stale across ticks, and strategy error is a shorter look-ahead.

The paper also names the per-run measurements it logged, and all three are readable off a shmup: **entropy** ("the information entropy using the first, second, and third derivatives of the agent's action sequence... correlated to number of times the player changed direction, stopped while moving, or began moving while stopped"), **risk** ("dividing the screen into a grid and counting the number of squares around the player that contain bullets"), and **distribution** ("the number of squares occupied by at least one bullet"). Survival is the fitness, expressed as remaining boss health.

Its run-cost finding is a warning about mixing styles in one budget: the high dexterity, high strategy configuration completed about 180 generations in 24 hours while low dexterity, low strategy completed about 1,700. **A more careful policy is slower per run, so equal wall clock buys unequal sample counts across styles.**

### One scalar that reads as skill (DOCUMENTED)

Borovikov's SoftMax over utility gives the cheapest possible skill dial: "Here tau = 1/T is the inverse of the 'temperature' parameter T. A higher temperature results in the distribution of probabilities over actions close to the uniform, like in a random policy. Correspondingly, a lower temperature increases preference for the action with higher utility. **Thus, the temperature may be interpreted as player skill.**"

One number turns the same weight vector from a near-random novice into a near-optimal expert, without a second policy being written.

### Left 4 Dead has no styles at all (DOCUMENTED)

Booth's deck describes one competence, tuned for believability rather than for variety: "Imperfect knowledge - simulated senses. Simulated aiming. Reaction times. Reliable and predictable decision making." There is no per-bot roster file and no aggression or caution field. The shipped cvars (`sb_neighbor_range`, "How close a friend needs to be to feel safe", `sb_separation_range`, `sb_friend_immobilized_reaction_time_normal`) are global knobs with per-difficulty variants, not per-bot identity. COMMUNITY-MEASURED for the cvar list: <https://developer.valvesoftware.com/wiki/Survivor_bot>.

So the game whose overnight bot runs opened this document ran one style, tens of thousands of times a night.

### Running the same content through several styles (DOCUMENTED)

The one case stated in a practitioner's own words is Borovikov's, and the styles are used as a cross-check rather than as coverage: "Figure 2 Relative difficulty of the relationship tracks before (left) and after (right) the autoplay agents' feedback. The optimized policy estimated the absolute difficulty (shown), which had the same relative nature as a near-random policy."

Two policies, same content, and the agreement between them is the evidence that the finding is a property of the content rather than an artifact of the policy. **That is a use for a second style that has nothing to do with modelling a second kind of player**, and it is the cheapest one to build.

The academic full factorial exists too: "Beyond Playing to Win: Diversifying Heuristics for GVGAI" ran 20 games through 5 agents crossed with 4 named heuristics, 400 games per cell, and concluded "the performance of the agents changes depending on the heuristic used. So making use of several agents with different goals... could be a feasible approach." Source: <http://kisenshi.github.io/files/201708_PlayingDiversifying.pdf>.

### The two shapes on offer (INFERRED)

Quake III puts skill and style in one table: a weight vector per named bot, with three authored skill anchors interpolated between. A new character costs a row; a new difficulty costs nothing.

Counter-Strike composes: a skill tier crossed with a preference list, so `Elite+Sniper` and `Easy+Sniper` both exist without either being authored. A new style costs one list; a new difficulty costs one row; the cross product is free.

Which fits depends on whether a grave's style and its skill are one axis or two. Talakat says two, and both of its axes are errors.

---

---

## 6. Telling human data from bot data in one store

### The headline: game analytics never solved this, and the research literature never had to (DOCUMENTED)

**No published game telemetry schema found carries a field marking a session as bot or human.** Checked: Valve's Source `gamestats.h`, whose `BasicGameStatsRecord_t` carries `m_nCount, m_nSeconds, m_nCommentary, m_nHDR, m_nCaptions, m_nSkill[3], m_bSteam, m_bCyberCafe, m_nDeaths` (two booleans about the environment, nothing about the actor); Unity Analytics' reserved parameter list and its REST envelope of `eventName, userID, unityInstallationID, unityPlayerID, sessionID, eventUUID, eventTimestamp, eventParams`; GameAnalytics' full default annotation set; the PUBG Developer API telemetry objects; and the AWS game analytics reference schema. Sources: <https://docs.unity.com/en-us/analytics/events/reserved-parameter-names.md>, <https://docs.gameanalytics.com/event-tracking-and-integrations/sdks-and-collection-api/api/event-types>.

The one game-side exception is a protocol enum rather than a telemetry field: StarCraft II's `enum PlayerType { Participant = 1; Computer = 2; Observer = 3; }`, carried per participant in every replay. Source: <https://github.com/Blizzard/s2client-proto/blob/master/s2clientprotocol/sc2api.proto>. Worth the note that DeepMind, filtering a ladder corpus, did not read that flag: PySC2's `valid_replay()` rejects on behavior instead (`p.player_apm < 10 or p.player_mmr < 1000`, commented "Low APM = player just standing around"). **The people who had the flag still filtered on behavior.**

**The two vendors' documented answers are both separation rather than tagging.** Unity: "Use staging environment for QA/test builds. Use production environment for live builds only," under a recommended strategy of "deny by default" so that "rogue, test, QA, or legacy builds" never send at all (<https://support.unity.com/hc/en-us/articles/45917105568148-How-to-prevent-unauthorized-builds-from-polluting-Analytics-using-Remote-Config>). GameAnalytics: "We recommend creating a separate game when implementing or testing the SDK." Both designs make comparing bot runs to human runs in one query structurally impossible.

### Where the discriminator does exist, it is one field with a short closed list (DOCUMENTED)

The pattern is standard outside games. OpenTelemetry defines `user_agent.synthetic.type` with two values, `bot` and `test`: "This attribute is useful for distinguishing between genuine client traffic and synthetic traffic generated by bots or tests." Source: <https://opentelemetry.io/docs/specs/semconv/registry/attributes/user-agent/>. Note where it is not: OTel's session conventions carry only `session.id` and `session.previous_id`, with no `session.type`.

Datadog RUM is the closest analogue to a tape header. Its documented field is `session.type`, "The type of session: `user` or `synthetics`," and the shipped type definition carries a third value the docs omit: `readonly type: 'user' | 'synthetics' | 'ci_test'`. Source: <https://docs.datadoghq.com/real_user_monitoring/application_monitoring/browser/data_collected/>. **One bot bucket turned out to be insufficient and they split monitoring bots from CI runs**, which is the same distinction as an interactive autopilot versus a batch harness.

GA4 runs both designs at once and the contrast is the argument: known bots are dropped with no record ("you cannot disable known bot traffic exclusion or see how much known bot traffic was excluded"), while internal traffic is tagged with a `traffic_type` parameter and can be marked instead of dropped while a filter is in Testing. Sources: <https://support.google.com/analytics/answer/9888366>, <https://support.google.com/analytics/answer/10104470>.

The clearest statement of the requirement is PostHog's: "Your own team's traffic skews your data. Developers on localhost, staff accounts, contractors, and QA runs all get captured alongside real users." Their answer keeps everything and filters both directions. Source: <https://posthog.com/docs/data/test-accounts>.

### Valve ran both streams and separated them by role, not by field (DOCUMENTED, INFERRED)

Newell's essay describes the two as different jobs rather than two rows in one table: the bots are "a security blanket," the humans are the check that "the things that we create quantitative metrics for actually have real world applicability." Ambinder's playtesting deck, read end to end, contains no bots at all: every method in it is human, and the word does not appear.

INFERRED, and worth flagging as my reading of the architecture rather than a Valve statement: Valve's shipped stats are keyed to Steam accounts ("The stats have been collected since 12/12/08," <https://www.l4d.com/blog/post.php?id=2460>), and a headless nightly run with graphics off has no Steam account. **They got separation for free from the identity key, without anyone designing a filter.**

### The research literature joins the two only at the aggregate, on the content key (DOCUMENTED)

King states it in one sentence: "The data we model is aggregated per level, i.e. each data point is represented by the average success rate for players and the average success rate obtained for the agents."

Nobody unifies the schemas, and the reason is visible across the papers rather than argued: a bot run and a human session are not the same kind of record. King's agent takes 1,000 attempts at one level while the human aggregate is millions of players at roughly one attempt each. Tactile's agent "is able to take an unlimited number of moves per level. The move distribution is therefore different compared to player data, where there is a sharp cut-off after the move limit... we normalise the agent moves with the level move limit." Rovio's agent is given "4x more moves per level than available for human players."

**Two correlation numbers do exist, and they are not King's.** Roohi et al. (Aalto and Rovio), "Predicting Game Difficulty and Engagement Using AI Players," report Spearman correlations against human pass rates of **0.80 for AI pass rate, 0.74 for the ratio of moves left, and 0.60 for cleared goals percentage**, "computed as averages over 1000 runs of the DRL agent per level." Source: <https://arxiv.org/abs/2107.12061>. Their earlier paper carries the honest negative: "AI pass rate alone is not a great predictor of human pass rate, especially in the later game levels" (<https://arxiv.org/abs/2008.12937>).

**The finding in that work that most changes what a run should log:** "an AI agent's best-case performance can yield stronger correlations with human data than the agent's average performance." They used the top 15% of runs for average moves left and the top 5% for cleared goals. Tactile independently found the same thing: "the highest correlation occurs when only considering ~5% of the best runs." A mean over a batch throws away the part that predicts best.

Kristensen, Valdivia and Burelli (Tactile Games) give the cleanest statement of what a weak bot is still worth, on a human corpus of roughly 900,000 players:

> "while in absolute terms, the agent is unable to reach human-level performance across all levels, the differences in terms of behaviour between levels are highly correlated to the differences in human behaviour. Thus, despite performing sub par, it is still possible to use the performance of the agent to estimate, and perhaps further model, player metrics."

Source: <https://ieee-cog.org/2020/papers/paper_231.pdf>.

**One warning about keeping two collection paths honest.** Microsoft Research and Ninja Theory's Navigation Turing Test had to scrub a provenance leak before human and agent trajectories could be compared at all: "Cut the last 1-3 seconds of the human player videos to just before they stopped moving to correct for an effect of the human data collection process, where human players had to manually end the recording and thus appeared briefly 'stopped' at the end of each episode." Source: <https://proceedings.mlr.press/v139/devlin21a/devlin21a.pdf>. The human runs were identifiable by their collection mechanism alone until they fixed it.

### Where Hungry Grave already stands (DOCUMENTED, repo)

The tape header decides the question before the first tick, and it does it the way the APM world does rather than the way game analytics does. `TAPE_INPUT_DEVICES` is `keyboard`, `touch`, `bot`, `script`, `unknown`, documented as "the run's device class rather than a per-frame reading of which model won a given tick." That is one field with a short closed list, in one store, and it already splits `bot` from `script`, which is the split Datadog had to add later.

Two more header fields are already reserved for exactly the harness's other two questions. `buildIdentity`, with the comment that the field exists "because header shape is one-way once tapes exist," is where a variant of a fix would be named. `author`, "Reserved in the same sense as the build identity: nothing in the game names an author yet, and a folder of tapes from more than one pair of hands needs the field to already be in the format," is whose hands.

**Nothing in the header names which policy steered.** A folder of tapes can say bot, and cannot say which bot.

And the rule for what else a run writes down is already ruled, by ADR 0018: "deterministic, recomputable evidence is derived later from replay, and runtime, measured evidence is captured during the original run, because replay cannot recreate it... anything recomputable, entity counts and event volume included, is deliberately absent from the record." The measurement pipeline follows it: `scripts/record-conditioned.ts` writes a tape, `scripts/measure.ts` replays it into a report, and `src/dev/compareRuns.ts` is already "Two measured runs, side by side, with no hand arithmetic."

---

## Open items

- **No developer anywhere published what Valve's overnight bot runs measured.** Newell says "outcomes" and "graphs"; Booth says "stress testing." Searched: both GDC 2009 decks, the AiGameDev transcription, the shipped Left 4 Dead and Left 4 Dead 2 commentary, Ambinder's playtesting and biofeedback decks, his Steam Dev Days data talk, and the L4D "by the Numbers" post. No metric, no threshold, no decision is attributed to them.
- **King has never published a correlation coefficient between bot pass rate and human pass rate.** The CIG 2018 paper reports mean absolute error and redacts the human axis of its plot; the CoG 2025 paper reports median absolute error and says "strongly correlates" without a number; Asadi's 2019 slide deck has a slide titled "Correlation with real players" with no coefficient on it. Treat any number quoted elsewhere as unsourced. The published correlations in this document are Rovio's and Tactile's, on different games.
- **No arcade shmup developer statement on automated play was found at all.** Searched the shmuplations Cave, Treasure, Toaplan, Raizing and Konami interviews for playtest, test play, location test, automatic and debug. The nearest hits are the four quoted in section 2 plus a DonPachi disassembly whose only "auto" is a sound-effect cycler.
- **No Treasure statement on testing or balance methodology was found** beyond Maegawa's general "there's a lot you can't know until you make it and test it out." Nothing on Ikaruga or Radiant Silvergun specifically.
- **No survivors-like developer statement on bots for tuning exists.** poncle, Blobfish, flanne, Mega Crit and Ghost Ship are all silent or explicitly manual. Chasing Carrots' one automation sentence is about QA and bugs.
- **No modl.ai documentation naming any playstyle as a product feature.** `docs.modl.ai` would not load, `modl.ai/modl-bots` returns 404 with no archive snapshots, and their GDC 2023 deck contains zero hits for persona, playstyle, aggressive or slider. The persona vocabulary lives in the founders' academic papers, not in the product.
- **No studio anywhere states a number of bot styles as sufficient, or argues a count.** EA's MultiGAIL deliberately reframes away from counting toward a continuous blend, and that reframe is the closest thing to an answer any studio gives.
- **No Rusher and no Fool template exist in any shipped Valve bot profile.** Both the CS2 file and the Condition Zero vanilla file were checked; every match for those names is a community mod. If you have seen them, they came from a downloaded profile.
- **Left 4 Dead has no per-bot identity file.** It genuinely does not exist; the shipped `sb_*` cvars are global with per-difficulty variants.
- **No published game telemetry schema with a bot-versus-human field was found**, and no paper in the automated-playtesting literature describes one either, across sixteen papers checked. The discriminator pattern is attested only outside games.
- **GDC Vault video is paywalled** for King's 2024 talk, EA's "AI for Testing" talks, Ubisoft's "The Division" automated testing talk, and modl.ai's sessions. Only abstracts and public slide PDFs were readable.
- **The Unity Game Simulation deprecation dates** (on hold January 2022, deprecated December 2023) came back as a summary of Unity's doc pages rather than a line I read myself, and would need one more check if they matter.
- **A small-team precedent that published its own harness could not be verified.** The one build-in-public post found on the subject carries no author byline and names no shipped game, so it is not cited here. Its one useful idea is stated as INFERRED in the implications instead.
- **The bot Hungry Grave has is not the bot the dispatch described, and the difference matters.** `src/dev/bot.ts` carries four named policies, not one, and `belchingPolicy` already makes a spend decision. What is true is that none of the four reads an offer, so no policy can express drop choice, and the prototype's own bot in `src/prototypes/ugly-slice/game/bot.ts` does target drops. The prototype is off limits for reuse and is noted only so the two are not confused.

---

## What this implies for Hungry Grave

Stated as implications, not decisions. INFERRED throughout. The designer decides.

### What the record settles before any option is chosen

**A weak bot ranks well and scores badly.** Two EA games and two other studios independently found the same thing: the absolute number a bot produces is far from human, and the ordering it produces is not. Borovikov twice, on a match-3 and on The Sims Mobile; Tactile, "despite performing sub par, it is still possible to use the performance of the agent to estimate... player metrics"; Ubisoft, whose agent sat twenty points under the humans and still moved the same direction per cluster. This is the strongest argument in the whole record that the existing dodge policy is worth pointing at a question today, and the strongest argument that its number is never an answer about difficulty.

**Ordering is what a harness is for, so every question put to it should be a comparison.** Valve's own frame is "Compare two or more conditions," and the two cases in this record where a bot changed a shipped game were both comparisons: three relationship tracks against each other, and build A against build B. Neither was a threshold.

**Log distributions, never means.** Rovio's best predictor was the top 15% of runs, and Tactile's was the top 5%. A batch that reports an average throws away the part that correlated best with humans. The same point in the other direction is the one useful idea from the small-team writing found: a pass rate says how hard, and where the failures land says what kind of hard.

**A deterministic policy needs one run per configuration.** Silva et al. ran 2,000 of each and concluded "A single run of A* already achieves our goals" against a stochastic agent needing thousands. Hungry Grave's policies are pure functions of run state and its sim is fixed-tick, so a seed plus a policy is already a whole run and the sample count is a question about seeds, not about noise.

**Cost is not symmetric across styles.** Talakat's careful configuration got about 180 generations in 24 hours where its sloppy one got about 1,700. Equal wall clock buys unequal sample counts, so a batch specifies runs and not minutes.

**The four things that forced EA off the real client are already absent here.** No render, no menus, no waits, no human-tapping speed cap. The thing EA had to build from JSON tuning files is the thing Hungry Grave's sim already is, and Borovikov's warning about simulation speed multipliers does not apply to a fixed-tick sim that simply runs ticks.

**Whatever else is built, "is it fun" is off the harness.** Valve's playtesting deck puts fun in the human column and explicitly excludes balance from it. King's own testing lead: "does this look good? Is this fun? Is this healthy?" is the part humans keep. ADR 0013 already says the same thing in this repo's words: "Feel evaluation is the human's, never the agent's." Nothing here changes that, and the recommendation below is built so that a harness number cannot be mistaken for a verdict.

### Option A: one policy, many seeds, Left 4 Dead's shape

Add the offer to `dodgePolicy` as one more target in the same nine-move score, then run it over a batch of seeds and compare distributions across a change.

Worth stating plainly because it makes this cheaper than it sounds: an offer is taken by touching an option, so **drop choice in this game is expressed entirely as a movement target and needs no new command channel.** The existing `Policy` signature already carries everything a style needs to prefer one option over another.

What the precedent says: this is what Valve did, tens of thousands of times a night with a single competence; it is what King did for over a year and a thousand levels with a single CNN; it is what all three of Unity's case-study studios did with heuristics simpler than the one already in this repo. Unity's own conclusion is that the simple bots were enough.

What it costs: one target term in an existing function, a seed loop, and a batch report over `measure.ts` output.

What breaks: King's own diagnosis, "agents follow their own policy to the point and that leads to highly correlated results," so the spread across seeds understates a population's spread and the harness answers only for one imaginary player. Ubisoft's sharper version, on why a win-only bot misleads: "we would however have missed completely the feedback on the super capacities." A single greedy-for-food policy will report that the offer is fine because it never turns one down.

### Option B: two error axes over the one policy, Talakat's shape

Keep one policy and one target utility. Add two knobs that make it play *worse* along named axes: a dexterity error that holds a command stale across a number of ticks drawn from a Gaussian, and a strategy error that shortens the look-ahead the policy already samples at ticks 5, 12, 20 and 30. Three values each gives nine named configurations from two numbers.

What the precedent says: this is the only style parameterization in the record built for a bullet hell, and both of its axes are the axes a dodging game actually has. Quake III does the same job with three authored skill anchors interpolated between; Counter-Strike does it with `ReactionTime` and `AttackDelay` on an eight-rung ladder; Borovikov does it with one SoftMax temperature, "the temperature may be interpreted as player skill." All four say the same thing: **skill is a small number of scalars degrading one policy, not a second policy.**

What it costs: two fields on the policy, a stale-command buffer, and a parameterized `LOOKAHEAD_SAMPLES`. Neither threatens replay: the tape records the commands the simulation actually consumed, so whatever a noisy policy did is already on the tape and a replay reproduces it without knowing the policy existed.

What breaks: neither axis says anything about drop choice, so nine configurations still make one decision at every offer. And the record's honest caveat is that Talakat is a paper, not a shipped game; nobody has shipped this.

### Option C: a named roster over one weight vector, the persona shape

One utility over the things a grave can want (clearance from mob fire, distance to a corpse weighted by freshness, distance to a drop, reservoir state, and a per-line weight over the three options an offer spins), with four or five named weightings: a flat baseline like Quake's Crash, a greedy one that takes food into fire, a cautious one that leaves food to decay, and one or two that prefer a named weapon line at the offer. Skill arrives separately, as Quake's interpolated anchors or as Option B's two errors.

What the precedent says: every hand-authored roster in the record landed on **four or five styles, each differing from the others by two or three numbers in one shared vector**. Holmgard's five differ by one or two weights each. EA's shooter set is four. Unreal's shipped enum is five names over one float. Quake III offers 49 knobs and its characters move about four of them. And poncle shipped eight named behaviors into this exact genre, of which the useful half is Defensive, Aggressive, Greedy for pickups and Stands still.

What it costs: the vector, the names, and an offer read, plus the authoring problem Silva names: "Weighting the different components to achieve the desired outcome is not simple. The parts have to be managed delicately and minor changes can result in different strategies."

What breaks: the persona authors' own caveat, that hand-set personas are "extremes within the space of strategies" and should later be learned from player data, which requires human tapes that do not exist yet. And a roster invented before any human tape is a roster of the author's guesses about hands other than his own, which is exactly the bias Yagawa describes.

### Recommendation (INFERRED)

**Build Option A first, and specifically build the offer into the existing policy before building any second style, because until a policy can turn a drop down there is nothing for a second style to differ about.** Then add Option B's two error axes, because they are two numbers, they are the axes a dodging game has, and they buy the cross-check Borovikov actually used: run a question through the sharp configuration and the sloppy one, and believe the finding only where the two agree on the ordering. Hold Option C's named roster until there are human tapes to point the weights at.

For the header, add one field naming which policy steered, beside the `inputDevice` that already says `bot` and the reserved `buildIdentity` that already has a place to name which variant of a fix a run was played against. That is the one discriminator the APM world converged on and game analytics never built, and the tape format is the right place for it because the header is one-way once tapes exist.

For what each run logs, nothing changes: ADR 0018 already rules that anything a replay can recompute stays out of the tape, and the whole harness output is therefore a folder of tapes plus a batch report built by replaying them. What a batch report should carry, from the record: the ending and stop distribution rather than a mean, the run's shape over time rather than its total, and the offer's take rate per option, which is Mega Crit's first metric and translates onto a spinning three-option offer without modification.

This rests on: the invariance of relative difficulty to the policy, found independently by EA twice, Tactile and Ubisoft; Valve's own separation of fun from measurement in the same year they ran tens of thousands of nightly games; the consistent four-or-five landing of every hand-authored roster in the record and the two-or-three numbers that separate its members; Talakat's two error axes being the only style model built for a bullet hell; Silva's deterministic-agent finding that one run per configuration suffices; Rovio's and Tactile's finding that the best runs predict better than the average run; Cave's Ichimura saying the judgement "would be very difficult to imitate" and Cave's own god-mode ceiling run landing a third under a real player; and the absence of any survivors-like that ever shipped or admitted to a bot. The designer decides.

---

## Sources

Primary (developer decks, essays, commentary, papers by the studio, shipped source and data files, patch bodies):

**Valve**
- Gabe Newell, "Gabe Newell Writes for Edge," 2008-12-24: <https://web.archive.org/web/20090106130006/http://www.edge-online.com/blogs/gabe-newell-writes-edge>
- Michael Booth, "The AI Systems of Left 4 Dead," GDC 2009: <https://steamcdn-a.akamaihd.net/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf>
- Michael Booth, "Replayable Cooperative Game Design: Left 4 Dead," GDC 2009: <https://cdn.cloudflare.steamstatic.com/apps/valve/2009/GDC2009_ReplayableCooperativeGameDesign_Left4Dead.pdf>
- Mike Ambinder, "Valve's Approach to Playtesting: The Application of Empiricism," GDC 2009: <https://cdn.cloudflare.steamstatic.com/apps/valve/2009/GDC2009_ValvesApproachToPlaytesting.pdf>
- Mike Ambinder, "Data to Drive Decision-Making," Steam Dev Days: <https://media.steampowered.com/apps/steamdevdays/slides/data.pdf>
- Charlie Burgin, "Left 4 Dead, by the Numbers," 2009-04-30: <https://www.l4d.com/blog/post.php?id=2460>
- Source engine `gamestats.h`: <https://git.h3cjp.net/H3cJP/source-engine/raw/commit/ba90de20d9655d73f35f8643461747438065d4cb/game/shared/gamestats.h>
- Shipped `botprofile.db` (CS2): <https://raw.githubusercontent.com/SteamTracking/GameTracking-CS2/55f2a470f68b60540e801ce853acd3fc4faceedd/game/csgo/pak01_dir/botprofile.db>; parser `bot_profile.cpp`: <https://raw.githubusercontent.com/ValveSoftware/halflife/master/game_shared/bot/bot_profile.cpp>; aggression reads in `cs_bot_attack.cpp`: <https://raw.githubusercontent.com/rehlds/ReGameDLL_CS/master/regamedll/dlls/bot/states/cs_bot_attack.cpp>

**Arcade shmups**
- Cave Shooting History interview collection (Ichimura, Yagawa): <https://shmuplations.com/cavestghistory/>
- Dodonpachi 1997 developer interview (Kouyama, invincibility mode): <https://shmuplations.com/dodonpachi2/>
- Dodonpachi 1998 developer interview (Kouyama, bug and playtest cycle): <https://shmuplations.com/dodonpachi/>
- Cave STG 15th Anniversary interview (Ikeda, location tests and balancing): <https://shmuplations.com/cave15th/>
- Treasure 12th Anniversary interview (Maegawa): <https://shmuplations.com/treasure12th/>
- DonPachi debug tooling disassembly: <https://sudden-desu.net/entry/donpachi-debug-tools-and-more/>
- Touhou 6 T6RP replay format: <https://pytouhou.linkmauve.fr/doc/06/t6rp.xhtml>

**Automated playtesting, studio papers and chapters**
- Gudmundsson et al. (King), "Human-Like Playtesting with Deep Learning," CIG 2018: <https://gwern.net/doc/reinforcement-learning/imitation-learning/2018-gudmundsson.pdf>
- Fragkedaki et al. (King), "Comparative Analysis of GAT and BERT for Human-Like Playtesting," CoG 2025: <https://arxiv.org/abs/2607.11501>
- Purmonen (KTH, at King), "Predicting Game Level Difficulty Using Deep Neural Networks," 2017: <https://kth.diva-portal.org/smash/get/diva2:1154062/FULLTEXT01.pdf>
- Asadi (King), "AI and Automation at King," Castor Software Days 2019: <https://castor-software-days-2019.github.io/slides/Sahar_Asadi_CSD19.pdf>
- Silva, Borovikov, Kolen, Aghdaie, Zaman (EA), "Exploring Gameplay with AI Agents," AIIDE 2018: <https://ojs.aaai.org/index.php/AIIDE/article/download/13034/12882>
- Borovikov (EA), "AI-Driven Autoplay Agents for Prelaunch Game Tuning," Game AI Pro Online Edition 2021: <https://www.gameaipro.com/GameAIProOnlineEdition2021/GameAIProOnlineEdition2021_Chapter10_AI-Driven_Autoplay_Agents_for_Prelaunch_Game_Tuning.pdf>
- Zhao et al. (EA), "Winning Isn't Everything: Enhancing Game Development with Intelligent Agents," IEEE ToG 2020: <https://ar5iv.labs.arxiv.org/html/1903.10545>
- Bergdahl, Gordillo, Tollmar, Gisslen (EA SEED), "Augmenting Automated Game Testing with Deep Reinforcement Learning," CoG 2020: <https://arxiv.org/abs/2103.15819>
- Gillberg et al. (EA SEED), "Technical Challenges of Deploying Reinforcement Learning Agents for Game Testing in AAA Games," CoG 2023: <https://arxiv.org/abs/2307.11105>
- Ahlberg, Sestini, Tollmar, Gisslen (EA SEED), MultiGAIL: <https://arxiv.org/abs/2308.07598>
- Le Pelletier de Woillemont, Labory, Corruble (Ubisoft), "Automated Play-Testing through RL Based Human-Like Play-Styles Generation," AIIDE 2022: <https://arxiv.org/abs/2211.17188>
- Delalleau and Logut (Ubisoft La Forge), DeepBots deck 2018: <https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2zfAyG0mnCZ9IBkt4W5iEP/21a379147c6351fa2ab9d2f6f0184397/DeepBots_Autodesk_2018_v2.pdf>
- Delalleau (Ubisoft), "Smart Bots for Better Games," GDC 2019: <https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2KBudkg4PSyN7io2qQWAxv/886ec7bd381cd666dec7978c83b196b2/Delalleau-2019_ML-tutorial-day-smart-bots-for-better-games-reinforcement-learning-in-production.pdf>
- Roohi et al. (Aalto and Rovio), "Predicting Game Difficulty and Engagement Using AI Players," CHI PLAY 2021: <https://arxiv.org/abs/2107.12061>; "Predicting Game Difficulty and Churn Without Players," CHI PLAY 2020: <https://arxiv.org/abs/2008.12937>
- Kristensen, Valdivia, Burelli (Tactile Games), CoG 2020: <https://ieee-cog.org/2020/papers/paper_231.pdf>
- Devlin et al. (Microsoft Research and Ninja Theory), "Navigation Turing Test," ICML 2021: <https://proceedings.mlr.press/v139/devlin21a/devlin21a.pdf>
- Khalifa, Lee, Nealen, Togelius, "Talakat: Bullet Hell Generation through Constrained Map-Elites," GECCO 2018: <https://arxiv.org/abs/1806.04718>
- Isaksen, Gopstein, Togelius, Nealen, "Simulating Strategy and Dexterity for Puzzle Games," CIG 2017: <http://www.nealen.net/papers/isaksen-cig17.pdf>
- Holmgard, Liapis, Togelius, Yannakakis, "Personas versus Clones for Player Decision Modeling": <http://julian.togelius.com/Holmgard2014Personas.pdf>; "Generative Agents for Player Decision Modeling in Games," FDG 2014: <https://antoniosliapis.com/papers/generative_agents_for_player_decision_modeling_in_games.pdf>; "Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics": <https://ar5iv.labs.arxiv.org/html/1802.06881>
- "Beyond Playing to Win: Diversifying Heuristics for GVGAI": <http://kisenshi.github.io/files/201708_PlayingDiversifying.pdf>

**Studio blogs, talks and interviews**
- Robert Masella (Rare), "Automated Testing of Gameplay Features in 'Sea of Thieves'," GDC 2019: <https://www.youtube.com/watch?v=X673tOi8pU8>, notes at <https://docslib.org/doc/7277552/automated-testing-for-multiplayer-game-ai-in-sea-of-thieves>
- Unity, "Automate your playtesting: Create virtual players for game simulation": <https://unity.com/blog/games/automate-your-playtesting-create-virtual-players-for-game-simulation>
- Unity, "Training your agents 7 times faster with ML-Agents" (Jam City, Snoopy Pop): <https://unity.com/blog/engine-platform/training-your-agents-7-times-faster-with-ml-agents>
- Mega Crit on data-driven balance: <https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder>
- Philip Dunstan (Massive) on The Division's client bots: <https://www.gamedeveloper.com/design/the-secret-ai-testers-inside-tom-clancy-s-the-division>
- Alexander Andelkovic (King) on what bots will not replace: <https://www.infoq.com/articles/candy-crush-QA-AI-saga/>
- Sahar Asadi (King) on the designer's veto, reported: <https://mobilegamer.biz/how-king-balances-human-and-ai-powered-design-in-candy-crush-saga/>
- Chasing Carrots on balancing and on QA: <https://fullcleared.com/features/inside-halls-of-torment-an-interview-with-chasing-carrots/>, <https://www.pieuvre.ca/2024/09/06/videogames-halls-torment-chasing-carrotts-interview/>
- Luca Galante interviews: <https://www.pockettactics.com/vampire-survivors/interview>, <https://www.gamesradar.com/games/roguelike/on-steam-alone-i-probably-have-3-000-hours-nobody-loves-vampire-survivors-more-than-its-creator-who-once-thought-nobody-would-play-it-for-more-than-two-hours-and-ironically-says-short-games-rule/>; Noclip, "The Making of Vampire Survivors": <https://www.youtube.com/watch?v=XQVdR8mJrds>

**Shipped source, data files and schemas**
- Quake III Arena `chars.h`: <https://raw.githubusercontent.com/id-Software/Quake-III-Arena/master/code/game/chars.h>; skill interpolation in `be_ai_char.c`: <https://raw.githubusercontent.com/id-Software/Quake-III-Arena/master/code/botlib/be_ai_char.c>
- Unreal Tournament `RosterEntry`: <http://ericdives.com/UT2004-UnCodex/Source_unrealgame/rosterentry.html>; combat style enum: <https://eatsleeput.com/undox/Uncodex-UT99-v436/utmenu/utindivbotsetupclient.html>
- StarCraft II protocol `PlayerType`: <https://github.com/Blizzard/s2client-proto/blob/master/s2clientprotocol/sc2api.proto>; PySC2 replay filter: <https://github.com/google-deepmind/pysc2/blob/master/pysc2/bin/replay_actions.py>
- OpenTelemetry `user_agent.synthetic.type`: <https://opentelemetry.io/docs/specs/semconv/registry/attributes/user-agent/>
- Datadog RUM `session.type`: <https://docs.datadoghq.com/real_user_monitoring/application_monitoring/browser/data_collected/>
- GA4 bot exclusion and internal traffic tagging: <https://support.google.com/analytics/answer/9888366>, <https://support.google.com/analytics/answer/10104470>
- Unity Analytics reserved parameters and the environments guidance: <https://docs.unity.com/en-us/analytics/events/reserved-parameter-names.md>, <https://support.unity.com/hc/en-us/articles/45917105568148-How-to-prevent-unauthorized-builds-from-polluting-Analytics-using-Remote-Config>
- GameAnalytics default annotations: <https://docs.gameanalytics.com/event-tracking-and-integrations/sdks-and-collection-api/api/event-types>
- PostHog internal traffic filtering: <https://posthog.com/docs/data/test-accounts>

**Community wikis, store pages and mirrors**
- <https://vampire.survivors.wiki/w/Masquerade>, <https://vampire.survivors.wiki/w/Options>, <https://vampire.survivors.wiki/w/Arcanas>, <https://vampire.survivors.wiki/w/Il_Molise>
- <https://developer.valvesoftware.com/wiki/Survivor_bot>
- <https://store.steampowered.com/app/3002860/Novivors/>, <https://store.steampowered.com/app/3745020/Swarm_Survivor_Endless_Siege/>

Sibling records cited rather than repeated: [survivor-numbers.md](survivor-numbers.md), [director-precedent.md](director-precedent.md), [progression-tuning-precedent.md](progression-tuning-precedent.md), [reward-delivery-models.md](reward-delivery-models.md).

---

## Reproducing the checks

The Valve decks, to Markdown:

```
curl -sL -o l4d_booth.pdf 'https://steamcdn-a.akamaihd.net/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf'
curl -sL -o vpt.pdf 'https://cdn.cloudflare.steamstatic.com/apps/valve/2009/GDC2009_ValvesApproachToPlaytesting.pdf'
pdf2md l4d_booth.pdf --raw --pages | grep -i -B4 -A8 'bot\|automat'
```

The survivors-like patch bodies, searched for autoplay:

```
curl -s 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1794680&count=300&maxlength=0&format=json' \
  | python3 -c "import json,sys,re,html; d=json.load(sys.stdin)
for n in d['appnews']['newsitems']:
    c=html.unescape(re.sub(r'\[/?[a-z*]+[^\]]*\]','',n['contents']))
    for l in c.split('\n'):
        if re.search(r'autoplay|auto.play|idle|afk|\bbot\b', l, re.I): print(n['title'][:40],'|',l.strip()[:200])"
```

Replace the appid with 1942280 for Brotato and 2218750 for Halls of Torment.

The shipped bot rosters:

```
curl -sL 'https://raw.githubusercontent.com/id-Software/Quake-III-Arena/master/code/game/chars.h'
curl -sL 'https://raw.githubusercontent.com/SteamTracking/GameTracking-CS2/55f2a470f68b60540e801ce853acd3fc4faceedd/game/csgo/pak01_dir/botprofile.db'
```

The repo's own bot and tape header:

```
sed -n '1,60p' apps/hungry-grave/src/dev/bot.ts
grep -n 'TAPE_INPUT_DEVICES' -A8 apps/hungry-grave/src/tape/tape.ts
```
