# Combat number scale and tuning resolution: published design evidence

Research brief on whether to raise a game's combat health/damage scale. Every finding is labelled DOCUMENTED (a named source states it) or INFERRED (my reading across sources, not stated by anyone). Where a source is an opinion essay rather than a postmortem, that is said in the evidence line.

## What is solid

Six things are well enough evidenced to build on.

1. The scale choice is a recognised, named tradeoff in design writing, not a matter of taste. Every source that discusses it frames it the same way: small numbers buy player comprehension, large numbers buy balancing leverage. Nobody claims one side is correct in general.

2. The remedy list is real, but the remedies are not equally evidenced. Raising the base scale, floating internally and rounding for display, and percentage multipliers over a small base are all documented in shipped games. Overkill damage carried to the next enemy is documented but rare and essentially Path of Exile shaped. Fractional damage accumulation as a distinct technique has no primary source I could find.

3. Rescaling both sides by the same factor is feel-neutral by design, and Blizzard said so explicitly when they did it. That means a pure 10x on HP and damage does not by itself solve or create a popcorn problem. It also means it does not by itself buy anything except headroom.

4. Percentage multipliers over a base are the mainstream way modern action games get fine resolution without large displayed numbers. Risk of Rain 2 is the cleanest documented case: characters have a base damage and everything else is a coefficient.

5. Cadence is not a free fine knob. Diablo 2's attack speed breakpoints are the canonical documented failure: because the sim advanced in whole frames at 25fps, large stat ranges produced literally zero change until a threshold was crossed. A tick-quantised sim moves the granularity problem rather than solving it.

6. On determinism, the answer is unambiguous and matters most here. Basic IEEE 754 arithmetic is reproducible under tight conditions, transcendental functions are not, and the standard answer for replay-deterministic games is fixed-point integer math. Two shipped examples wrote their own trig rather than trust the platform's.

The single biggest hazard on record is not aesthetic. World of Warcraft overflowed a signed 32-bit health value on a live raid boss.

---

## 1. Why games pick the HP scale they do

### Finding 1.1: The tradeoff is comprehension versus granularity, stated in exactly those terms
**Claim.** Design writing consistently frames scale choice as a single tradeoff: small numbers are easier for players to compute and reason about, large numbers give the designer room to differentiate and tune.
**Evidence.** Dax Gazaway, in a published design textbook chapter, states that "the more frequently a player is required to do calculations, the simpler the calculations tend to be and the smaller the numbers involved are," and against that, that with single-digit constraints "there is no longer room on the scale for stronger characters like dragons or giants." His recommendation is explicit: use numbers "just large enough to accommodate all needed variety but no larger than absolutely necessary."
**Source.** https://www.informit.com/articles/article.aspx?p=3128856&seqNum=2
**Label.** DOCUMENTED

### Finding 1.2: A practitioner rule of thumb is that numbers above 1, 2, 3 must justify themselves
**Claim.** The default starting position among designers who write about prototyping is the smallest scale that works, with escalation requiring a reason.
**Evidence.** Alexander King writes "Any numbers higher than 1,2,3 ought to justify themselves!" and cites Matthew Davis's talk on Into the Breach for the principle that "low health, low damage" designs make "1 point of damage meaningful," so small increments produce significant change.
**Source.** https://www.literallyaking.com/blog/good-numbers-part1
**Label.** DOCUMENTED (King's own rule; the Into the Breach attribution is King's, second-hand from the talk)

### Finding 1.3: Granularity is framed as a foundational, context-dependent choice with no default answer
**Claim.** Low granularity buys accurate player mental models; high granularity buys balance levers and incremental change; neither is recommended in general.
**Evidence.** The Nameless Quality's tech-design piece: "Low granularity tends to be easier to read. Players are more likely to be able to build an accurate mental model." Against it: "High granularity is easier to balance, show incremental change, and better at representing reality," enabling things like 2% damage reductions or 5% stat increases. The stated cost of low granularity is that all changes feel significant and subtle tweaks are impossible. The author explicitly declines to endorse a side and calls granularity "one of the most foundational choices." Into the Breach is cited as the low-granularity exemplar with 1-2 damage and 2-3 health.
**Source.** https://namelessquality.com/tech-design-high-vs-low-granularity/
**Label.** DOCUMENTED

### Finding 1.4: The scale should be derived from touches-to-kill, not chosen in the abstract
**Claim.** The useful frame is percentage of health per hit, which determines pacing; the absolute numbers are then arbitrary and chosen for granularity.
**Evidence.** Celia Wagar (fighting and action game design writer, CritPoints): "The actual values can be arbitrary, but percentages help you keep track of the actual impact." A game where each hit removes 10% is a ten-touch game; 80% is a two-touch game. She contrasts Magic: The Gathering's 20 life, which she says suffers from low granularity and enables stalemates, with Yu-Gi-Oh's 8000 life, whose fine granularity lets attack values sit in increments of 100. Her own game uses 600 life specifically to gain threefold granularity over Magic. Her recommendation is a middle ground.
**Source.** https://critpoints.net/2023/05/14/how-do-you-set-the-maximum-limit-for-health-such/
**Label.** DOCUMENTED

Relevance note. This is the most directly transferable frame for the decision at hand. Wagar's argument says the current 2/3/5 HP against 1 damage weapons is a two-to-five-touch system, and the resolution complaint is a restatement of that: at five touches the smallest possible change is 20%.

### Finding 1.5: The scale changes what kind of engagement the game asks for
**Claim.** Small integer health invites strategic reasoning about a transparent system; health in the hundreds or thousands invites executional skill inside a progression fantasy.
**Evidence.** Brandon Franklin, writing on Game Developer: "Health that scales from the hundreds to the thousands asks a lot more of a player than health that scales from 12 to 32." He argues small-integer systems make players "guard each health jealously" and are more accessible to new and casual players, while large-scale systems support a scaling progression narrative and reward execution over systems literacy.
**Source.** https://www.gamedeveloper.com/design/integer-based-combat-systems (Brandon Franklin, 23 April 2020)
**Label.** DOCUMENTED, but this is an opinion essay, not a postmortem. Franklin also uses "floating point system" loosely to mean "large scale," which is a category error worth not importing.

Relevance note. Franklin also observes in passing that most modern combat systems assume players start around 100 health rather than the 12 of classic Zelda. That is a useful data point on where the industry default sits.

### Finding 1.6: Into the Breach's clarity principle is documented; the "keep numbers small" causal claim is not directly quoted
**Claim.** Subset Games sacrificed mechanics for legibility, and the game's stat range is famously tiny, but I could not find them saying in their own words that they chose small numbers for that reason.
**Evidence.** Justin Ma, on Game Developer: "As a game design principle, we would sacrifice cool ideas for the sake of clarity every time," and the team cut weapons and firing patterns they could not communicate to playtesters, noting "our requirement that the player has to understand what's going on in any situation restricted our game design options considerably." The 1-2 damage, 2-3 health range is attested by third parties, not by that article.
**Sources.** https://www.gamedeveloper.com/design/-i-into-the-breach-i-dev-on-ui-design-sacrifice-cool-ideas-for-the-sake-of-clarity-every-time- and https://namelessquality.com/tech-design-high-vs-low-granularity/
**Label.** DOCUMENTED for the clarity principle. INFERRED for "and that is why the numbers are small." The GDC 2019 postmortem (https://gdcvault.com/play/1026333/-Into-the-Breach-Design) is the place the direct quote would live; I did not retrieve its content.

---

## 2. The granularity problem and its known fixes

Seven candidate remedies were in scope. Their evidence quality varies a lot, so they are ranked by how well evidenced they are rather than by the order in the brief.

### Finding 2.1 (well evidenced): Raise the base scale
**Claim.** The standard, boring answer is to multiply the scale until the smallest meaningful change is expressible, and no further.
**Evidence.** Gazaway's "just large enough ... but no larger than absolutely necessary." Wagar's Charmed Chains at 600 life explicitly to get threefold granularity over Magic's 20. Franklin's observation that modern systems default to about 100 rather than 12.
**Sources.** As in 1.1, 1.4, 1.5.
**Label.** DOCUMENTED

### Finding 2.2 (well evidenced): Store as float internally, display rounded
**Claim.** Shipped games routinely keep sub-display precision internally and round only at the HUD.
**Evidence.** Minecraft stores health and damage as floating-point numbers in units of half-hearts. The HUD shows integers and fractional values are rounded up for display, so 6.2 HP is shown as 7. The player sees ten hearts; the simulation sees continuous values.
**Source.** https://minecraft.wiki/w/Health and https://minecraft.wiki/w/Damage
**Label.** DOCUMENTED
**Caution.** This is exactly the remedy that collides with the determinism requirement. See section 4.

### Finding 2.3 (well evidenced): Percentage multipliers over a small base, so the multiplier is the fine knob
**Claim.** The mainstream modern answer is to keep the base damage number small and put all tuning resolution into continuous coefficients applied on top.
**Evidence.** Risk of Rain 2 gives each character a base damage that scales with level, and every ability is expressed as a coefficient of it. Items and modifiers are percentage increases on top. The distinction is explicit in the game's own terminology: "base damage only scales with your character, whereas damage or total damage takes into account other modifiers." League of Legends' Giant Slayer is the same shape from the item side: "1% increased physical damage for every 50 maximum health the target has more than you, up to 10%."
**Sources.** https://riskofrain2.fandom.com/wiki/Damage and https://wiki.leagueoflegends.com/en-us/Giant_Slayer
**Label.** DOCUMENTED

Relevance note. This remedy does not require raising HP at all. It requires that the damage pipeline be a multiply rather than a subtract of a literal.

### Finding 2.4 (well evidenced, and a warning): Cadence and attack speed as the fine knob, with quantisation as the trap
**Claim.** Attack speed is a genuine continuous knob only if the simulation can express it continuously. When the sim advances in whole frames or ticks, attack speed is quantised and produces breakpoints, which is the original granularity problem relocated.
**Evidence.** Diablo 2 runs at 25 frames per second and "events cannot occur in timeframes smaller than a single frame, so improvements to animation speeds ... are only realized in intervals of 1 frame or more." The consequence is documented and named by the community as breakpoints: "if a normal attack with a given weapon takes 10 frames, some amount of faster attack bonus will drop it down to 9 frames, but until that amount is reached, no improvement will occur." A second documented cost is visual: at high speeds most animation frames are skipped and the attack "looks choppy," which the source calls unavoidable in a frame-based game.
**Source.** https://wiki.projectdiablo2.com/wiki/Breakpoints and https://diablo2.diablowiki.net/Breakpoints
**Label.** DOCUMENTED

Relevance note. This is the finding most likely to bite. If the answer to "we need finer resolution" is "tune fire rate instead of damage," and the sim runs on fixed ticks, the resolution of the fire-rate knob is bounded by the tick rate exactly as damage resolution is bounded by the HP scale.

### Finding 2.5 (mechanic documented, purpose inferred): Probabilistic fine knobs, crit and proc chance
**Claim.** A chance value is continuous even when the payload is an integer, so probability is a fine knob layered on a coarse one.
**Evidence.** Risk of Rain 2's proc coefficient is explicitly a continuous scalar on trigger rates: "Effective Trigger Chance = Item Chance x Proc Coefficient," with the stated design purpose that "if something hits very frequently, it may have a lower proc coefficient to lower the power of the ability to not outclass other abilities." That is a designer using a continuous multiplier to balance high-frequency against low-frequency attacks, which is precisely the storm-of-small-interactions case.
**Source.** https://riskofrain2.fandom.com/wiki/Proc_Coefficient
**Label.** DOCUMENTED for the mechanic and for that stated purpose. INFERRED that designers reach for crit chance specifically to recover damage granularity; no source says that.
**Caution.** Randomness bought as granularity has a variance cost that none of these sources price. A 15% buff delivered as crit chance is 15% in expectation and noisy per encounter.

### Finding 2.6 (documented as a mechanic, thin as a granularity remedy): Separate effective-HP multipliers
**Claim.** Armour, resistance and percentage-of-max-health modifiers form a second continuous layer that changes time-to-kill without touching the integer HP pool.
**Evidence.** League of Legends' percent maximum health damage is documented as existing to keep damage relevant against health scaling, so that "tanks are not safe." Giant Slayer's formula is a continuous ramp over a health difference.
**Source.** https://wiki.leagueoflegends.com/en-us/Giant_Slayer and https://leagueoflegends.fandom.com/wiki/Health/Scaling
**Label.** DOCUMENTED as mechanics. INFERRED that they are used as a granularity remedy rather than a counterplay tool. The sources describe them as counterplay against health stacking, not as tuning resolution.

### Finding 2.7 (no primary source found): Fractional damage accumulation
**Claim.** The brief lists accumulating fractional damage until it crosses an integer threshold. I could not find a shipped-game or practitioner account of this as a named technique.
**Evidence.** None located. The nearest documented relatives are Minecraft's internal floats with rounded display (2.2) and Diablo 2's breakpoint quantisation (2.4), neither of which is accumulation.
**Label.** NOT EVIDENCED. Treat as a plausible implementation, not an established practice.

### Finding 2.8 (no primary source found): Damage-over-time ticks as a granularity remedy
**Claim.** DoT is listed as a way to express sub-integer damage through many small ticks. I found no design writing arguing for DoT on granularity grounds.
**Evidence.** None located. Path of Exile and World of Warcraft both have extensive DoT systems, but the design writing about them is about pacing, counterplay and build identity, not tuning resolution.
**Label.** NOT EVIDENCED as a granularity remedy. INFERRED that it works arithmetically, since N ticks of small damage subdivide a total, but nobody in the retrieved sources justifies it that way.

---

## 3. The popcorn problem

### Finding 3.1: Uniform rescaling is explicitly feel-neutral, which cuts both ways
**Claim.** If HP and damage both go up by the same factor, nothing about time-to-kill changes, and the developers who did this at the largest scale said so up front.
**Evidence.** Blizzard's stat squish scaled down item stats, player and mob health, and damage and healing together. Blizzard "stressed that the item squish will not affect the relative difficulty of killing any creature, or the ability to solo old content." The one deliberate exception was that damage was reduced slightly more than health, in order to reduce "burst in combat."
**Source.** https://warcraft.wiki.gg/wiki/Stat_squish
**Label.** DOCUMENTED

Relevance note. This is the strongest single answer to the popcorn worry. A 10x on trash HP with a 10x on weapon damage is, by the largest shipped precedent, a no-op on feel. It buys resolution and costs nothing in pacing. The corollary is that it also does not fix any existing pacing problem, and the WoW precedent shows the deliberate use of a slight asymmetry when a pacing change is actually wanted.

### Finding 3.2: Overkill carried to other enemies is real, defined, and rare
**Claim.** Damage in excess of a killing blow can be captured and reapplied, but I found essentially one game family that does it.
**Evidence.** Path of Exile defines it precisely: "Overkill damage refers to the difference between damage dealt in one hit and the target's remaining life. Overkill only occurs if two conditions are met: the hit kills an enemy and dealt more damage than the enemy's remaining life. For example, if a target has 20 life and a player deals a hit of 100 damage, the target dies and the overkill damage is 80." Herald of Ash consumes it, reflecting overkill damage from a killing blow to surrounding targets. Herald of Ice is the related shatter-explosion case, though its explosion is based on the dead enemy's life rather than on overkill.
**Source.** https://pathofexile.fandom.com/wiki/Overkill_damage and https://www.poewiki.net/wiki/Herald_of_Ice
**Label.** DOCUMENTED for the mechanic. INFERRED that it is rare, based on the breadth of the search returning one game family for damage-carrying overkill.

### Finding 3.3: Overkill as a reward multiplier is common; overkill as damage transfer is not
**Claim.** Many games detect surplus damage, but the overwhelming majority spend it on experience or loot rather than on the next enemy.
**Evidence.** A catalogue of the pattern lists Final Fantasy X (overkill grants more AP and items), Xenoblade Chronicles 2 and 3 (surplus chain-attack damage becomes an experience multiplier), and Trails of Cold Steel (5x the target's current HP in one hit grants a 10% experience bonus). None of these transfer damage.
**Source.** https://tvtropes.org/pmwiki/pmwiki.php/Main/SurplusDamageBonus
**Label.** DOCUMENTED for the examples. This is a tertiary aggregator, so treat the list as a pointer rather than a citation. INFERRED that the reward form dominates the damage-transfer form.

### Finding 3.4: Execute thresholds are a common, well-established pattern
**Claim.** Massive or lethal damage below a percentage-of-max-health threshold is standard vocabulary across MMOs and MOBAs.
**Evidence.** Described as an ability that "allows a character to deal massive damage to targets under a certain percentage of max health (for example, 30% health)." World of Warcraft's Execute and Kill Shot and League of Legends' execute abilities are the canonical instances.
**Source.** Search-level attestation across the wikis; no single strong primary source located. Closest is the general description surfaced with https://grimdawn.fandom.com/wiki/Game_Mechanics
**Label.** DOCUMENTED that the pattern exists and is common. WEAKLY SOURCED as to any designer's stated rationale.

### Finding 3.5: Percentage-of-max-health damage is common, and its documented purpose is anti-scaling, not anti-popcorn
**Claim.** Damage proportional to the target's max HP exists so that damage keeps pace with health scaling on high-HP targets.
**Evidence.** "Percent maximum health damage deals bonus damage based on the target's maximum health, being more effective the higher health the target has in total ... designed so tanks are not safe."
**Source.** https://leagueoflegends.fandom.com/wiki/Health/Scaling
**Label.** DOCUMENTED

Relevance note. This is the inverse of what a popcorn fix needs. It makes big targets die faster, not small ones. For trash, the equivalent tool is a flat one-shot tag or an execute at a high threshold.

### Finding 3.6: Common versus rare, ranked
**Claim.** Ordering the popcorn techniques by how widely they appear in shipped games.
**Evidence and reasoning.** Scaling both sides by the same factor: universal, and the only one with a first-party statement of its effect (3.1). Execute thresholds: very common (3.4). Percent-of-max-health damage: very common, but pointed at the wrong end of the HP range for this purpose (3.5). One-shot tags on weak enemy classes: I found no design writing on this at all, only the Diablo 2 breakpoint literature as an adjacent quantisation case. Overkill carried to the next enemy: rare, effectively Path of Exile (3.2). Overkill as reward: common but does not address pacing (3.3).
**Label.** INFERRED. This ranking is mine, from search coverage, and search coverage is a weak proxy for industry frequency.

---

## 4. Integer versus float damage in practice, and determinism

This is the section with the firmest evidence, and it is the one that constrains the decision most.

### Finding 4.1: Float determinism is "yes, if", not "yes"
**Claim.** Deterministic floating point is achievable under tight constraints and is not guaranteed in general.
**Evidence.** Glenn Fiedler: "the answer is not a simple 'yes' or 'no' but 'yes, if…'". For replay on the same machine with the same binary, he concludes "with a bit of work you should be able to get it to play back a replay ... and get the exact same result." For cross-machine determinism he requires identical compiler and architecture, strict IEEE 754 compliance via compiler flags, restricted operations, and accepts significant performance penalties. His summary is that determinism "conflicts fundamentally with performance optimization."
**Source.** https://gafferongames.com/post/floating_point_determinism/
**Label.** DOCUMENTED

### Finding 4.2: What actually breaks it, from shipped postmortems
**Claim.** The breakages are specific and known: transcendental functions, compiler and optimisation differences, instruction-set differences, and build configuration.
**Evidence.** Pandemic Studios on Battlezone 2 found AMD and Intel processors produced different results for transcendental functions, and wrapped sin and cos in non-optimised calls forced to single precision. Gas Powered Games on Supreme Commander enforced FPU precision with `_controlfp` and asserted the FPU settings every tick to catch unauthorised changes. Shawn Hargreaves on MotoGP could not share replays between Xbox and PC, or between debug and release builds, and patches required identical compiler versions. Fiedler also names PowerPC fused multiply-add versus Intel's separate multiply and add, and quotes Jon Watte that SSE and SSE2 are "too under-specified to be deterministic."
**Source.** https://gafferongames.com/post/floating_point_determinism/
**Label.** DOCUMENTED

Relevance note. The MotoGP case is the sharpest one for a game that ships replay tapes: a debug build could not replay a release build's tape.

### Finding 4.3: Fixed-point integer math is the common answer for replay-deterministic games
**Claim.** Games that need bit-exact reproducibility across machines move the simulation to integers.
**Evidence.** Maksym Hryniv, writing on Game Developer about cross-platform RTS synchronisation, adopted fixed-point numbers stored in 64-bit integers with a 12-bit shift, on the reasoning that "all the calculations are made using integers so they are deterministic. 2x2 is always 4 right?" He is explicit about the cost: eliminating third-party libraries and rewriting physics, pathfinding and data structures from scratch. The Q16.16 convention (32-bit integer, low 16 bits fractional, 1.5 stored as 98304) is the standard form. Age of Empires is repeatedly cited as having moved the simulation entirely to integer arithmetic for this reason. The general practice guidance is to use fixed-point for authoritative game logic and convert to float only for rendering and visual effects.
**Sources.** https://www.gamedeveloper.com/programming/cross-platform-rts-synchronization-and-floating-point-indeterminism (Maksym Hryniv, 7 January 2015) and https://cppcat.com/deterministic-physics-engine/ and https://dev.to/shaisrc/deterministic-physics-in-ts-why-i-wrote-a-fixed-point-engine-4b0l
**Label.** DOCUMENTED for Hryniv. The second and third are practitioner blogs, so treat them as corroboration of common practice rather than as primary postmortems.

### Finding 4.4: A shipped replay-deterministic game wrote its own trigonometry
**Claim.** Factorio, which has hard determinism and replays as a first-class feature, could not rely on the platform's math library.
**Evidence.** Factorio runs a fully deterministic simulation where "replays would not be possible if the results changed each time," and integration tests check determinism correctness. Because "in C++ basic trigonometric functions (sin, cos, asin, atan, etc.) are not guaranteed to give same results across different platforms," the developers implemented their own.
**Source.** Factorio Friday Facts, https://www.factorio.com/blog/post/fff-388 and the surrounding FFF series including https://forums.factorio.com/viewtopic.php?t=82891
**Label.** DOCUMENTED, but sourced through search summaries of the FFF series rather than a fetched page. Worth confirming the exact FFF number before quoting it anywhere load-bearing.

### Finding 4.5: In JavaScript specifically, basic arithmetic is safe and Math functions are not
**Claim.** For a browser game recording replay tapes, `+ - * /` on doubles are reproducible across engines, and `Math.sin`, `Math.cos`, `Math.pow` and friends are not.
**Evidence.** JavaScript numbers are IEEE 754 double precision by specification, and IEEE 754 exactly specifies correctly-rounded results for the basic operations, so the same operations in the same order produce identical bits anywhere. Transcendental functions are the exception: the ECMAScript specification carries a defined term "implementation-approximated" (section 4.4.1 of ECMA-262) precisely to cover them. Practitioner discussion is consistent: relying on platform math libraries "is fraught with issues, as some call CPU transcendental instructions which can produce different results on different CPU models," and different library versions differ between updates on the same platform.
**Sources.** https://tc39.es/ecma262/ (term defined at 4.4.1) and https://www.gamedev.net/forums/topic/609592-is-javascript-floating-point-math-deterministic/
**Label.** DOCUMENTED for IEEE 754 basic-operation reproducibility and for the existence of the "implementation-approximated" term. PARTIALLY VERIFIED for the specific claim that Math.sin is the term's target: I could not retrieve the section text, and MDN's Math.sin page carries no such caveat. Verify against ECMA-262 section 21.3 before relying on it.

### Finding 4.6: Integer HP does not by itself buy determinism
**Claim.** Whether health is 3 or 30 is orthogonal to determinism. What matters is whether every operation in the damage pipeline is an exactly-specified one.
**Reasoning.** An integer HP pool reduced by a float-multiplied damage value is exactly as non-deterministic as a float HP pool, if the multiply involves a transcendental or a non-reproducible operation. Conversely a large integer HP pool makes an all-integer pipeline cheap, because a 15% buff on a 30 HP enemy is expressible as an integer numerator over an integer denominator with no float anywhere.
**Label.** INFERRED. No source states this; it follows from 4.1 through 4.5.

Relevance note. This is the strongest technical argument in favour of raising the scale for this particular game. A large integer HP pool lets fine multipliers be exact rational arithmetic on integers, which is bit-exact by construction. Under a small pool, the same fine multipliers force either floats or fixed-point, both of which need the discipline described in 4.1 to 4.3.

---

## 5. Number inflation hazards

### Finding 5.1: The largest documented hazard is a real integer overflow on a live boss
**Claim.** World of Warcraft's inflation ran into a hard technical wall, not just a readability one.
**Evidence.** The game stored health in signed 32-bit integers, maximum 2,147,483,647. Ra-den in Throne of Thunder approached 1.5 billion health, and when player mistakes increased his health it could overflow to negative values. Designers had to add artificial mechanics such as healing phases to avoid repeating the problem. By the end of Mists of Pandaria, damage-specialised raiders had more health than most Molten Core bosses and dealt nearly as much DPS as an entire 25-player raid from an earlier expansion.
**Source.** https://warcraft.wiki.gg/wiki/Stat_squish
**Label.** DOCUMENTED

### Finding 5.2: Blizzard's stated reason for squishing was that the numbers outgrew the plan
**Claim.** The inflation was emergent, not designed, and took a decade of compounding to become intolerable.
**Evidence.** Blizzard first raised the issue in a developer blog on 3 November 2011, about "the numbers in the game growing larger than envisioned over the course of WoW's first decade." Inflation began in earnest in Wrath of the Lich King when hard modes and a fourth raid tier pushed item levels far past what was anticipated. The squish was demonstrated at BlizzCon 2013 and shipped in patch 6.0, scaling down item stats, player and mob health, and damage and healing.
**Source.** https://warcraft.wiki.gg/wiki/Stat_squish
**Label.** DOCUMENTED

Relevance note. This is the closest thing to a developer account of regretting a scale, and it is worth being precise about what they regretted. They did not regret picking a large base scale. They regretted an unbounded multiplicative growth curve compounding across expansions. Those are different failures.

### Finding 5.3: Number bloat lands on the UI, and the fixes are presentational
**Claim.** When numbers get large, the visible cost is damage popups, and shipped fixes are display-layer rather than simulation-layer.
**Evidence.** Diablo III patch 2.4.0 added optional number truncation and an orange highlight for standout damage, with a calibration system: only numbers above 10,000 qualify, the threshold decays 3% per second, the first 10 large numbers are ignored while calibrating, and it resets after 10 seconds of inactivity. The abbreviation choices were made on feel: "in English, we opted not to abbreviate in the low millions because seeing '1,000,000' is much more satisfying than '1M'," and billions were skipped because "1,000M" told a more exciting story than "1B."
**Source.** https://blizzardwatch.com/2016/01/25/diablo-damage-numbers-changed/ reporting Blizzard's patch 2.4.0 blog post
**Label.** DOCUMENTED

Relevance note. The calibration machinery is the cost of the choice. A game with an unbounded number scale eventually needs an adaptive highlighting system just to tell the player which hit mattered.

### Finding 5.4: Large numbers carry a localisation hazard
**Claim.** Abbreviation schemes do not translate.
**Evidence.** Blizzard noted that "Spanish or French do not commonly use a unique term for 'billion'," instead using a construction meaning one thousand million.
**Source.** https://blizzardwatch.com/2016/01/25/diablo-damage-numbers-changed/
**Label.** DOCUMENTED

### Finding 5.5: Arbitrary-looking numbers read as carelessness
**Claim.** Beyond arithmetic, there is an aesthetic cost to numbers that look computed rather than chosen.
**Evidence.** Alexander King criticises a starting value like 912 as revealing "indiscriminate output of some function" and lacking care, arguing numbers should be "aesthetically chosen" as well as contextually appropriate.
**Source.** https://www.literallyaking.com/blog/good-numbers-part1
**Label.** DOCUMENTED

Relevance note. This argues against a raise chosen as a round multiplier applied uniformly. Whatever the new scale, the individual values should be picked, not generated.

### Finding 5.6: Very large numbers defeat player arithmetic entirely
**Claim.** There is a threshold past which players stop reasoning about the numbers at all.
**Evidence.** Gazaway: "try to calculate the final hit point score ... 34863298 hit points, taking 456321 points of damage. It's clear that the smaller the numbers, the easier the calculations." Wagar makes the parallel point that high granularity becomes incalculable in a tabletop format.
**Sources.** https://www.informit.com/articles/article.aspx?p=3128856&seqNum=2 and https://critpoints.net/2023/05/14/how-do-you-set-the-maximum-limit-for-health-such/
**Label.** DOCUMENTED

### Finding 5.7: No developer account of regretting a deliberately-chosen larger base scale was found
**Claim.** The retrieved record contains regret about compounding growth (WoW), about display (Diablo III), and about quantisation (Diablo 2 breakpoints). It does not contain a case of a team saying "we set our base HP at 100 instead of 10 and it was a mistake."
**Evidence.** Absence across the searches described above.
**Label.** INFERRED, and an honest gap rather than a finding. Absence of evidence here is weak, because a one-time scale choice at the start of development is not the kind of thing teams write postmortems about.

---

## 6. Competing positions on raising this game's combat number scale

Both positions are stated as strongly as the evidence allows.

### The case for raising the scale

The complaint is arithmetically correct and the literature agrees it is a real problem. With 2, 3 and 5 HP against 1 damage, the smallest expressible change to a weapon's effect on a shambler is 33%. Wagar's framing (1.4) says this is a two-to-five-touch system and the resolution of any tuning knob in it is one over the touch count. Gazaway's rule (1.1) is to use numbers just large enough to accommodate the variety needed, and the variety needed here demonstrably exceeds what 2 to 5 accommodates.

The popcorn worry is answered by the largest shipped precedent. Blizzard scaled an entire MMO's health and damage together and stated flatly that it would not change the relative difficulty of killing anything (3.1). A uniform 10x is a no-op on feel and a pure gain in resolution. The one intentional asymmetry they applied, reducing damage slightly more than health to soften burst, shows the knob is available in both directions if pacing does need adjusting.

The determinism argument runs in favour of raising, not against it (4.6). This game records replay tapes and needs bit-exact reproduction. Under a 2-to-5 HP scale, any fine tuning knob must be a float multiplier or a fixed-point one, which drags in the whole discipline Fiedler describes (4.1) and that Battlezone 2, Supreme Commander and MotoGP had to enforce (4.2). Under a 30-ish HP scale, a 15% buff is integer arithmetic, exact by construction, with no float in the damage pipeline at all. The industry's answer for replay-deterministic simulation is integer math (4.3), and a larger integer scale is what makes integer math expressive enough to be usable.

The feel goal points the same way. A storm of many small interactions is, by definition, many low-value hits. At 1 damage against 3 HP, "many small interactions" is three interactions. The scale is currently fighting the stated feel goal.

The hazard evidence does not apply at this magnitude. WoW's failure was a 32-bit overflow at 2.1 billion after a decade of compounding multipliers (5.1, 5.2). Diablo III's was display crowding in the millions (5.3). Neither is within several orders of magnitude of a 30 HP shambler.

### The case against raising the scale

The default position in design writing is the small scale, and escalation carries the burden of proof. King's rule is that anything above 1, 2, 3 must justify itself (1.2). Gazaway's is "no larger than absolutely necessary" (1.1). Into the Breach is held up as the exemplar precisely for its 1-2 damage, 2-3 health range (1.3), and Subset's stated principle was to sacrifice mechanics for clarity every time (1.6). A bullet-heaven with dozens of enemies on screen has a harder legibility problem than a tactics game, not an easier one.

Raising the scale is the crudest of the available remedies, and cheaper ones exist that the evidence supports better. Risk of Rain 2 gets arbitrary tuning resolution while keeping small base damage, by putting every modifier in a coefficient over a base (2.3). That is the mainstream modern answer and it requires no HP change at all. It requires only that the damage pipeline be a multiply. Percentage multipliers over a base of 1 give exactly the same resolution as integer damage over a base of 30, and they keep the displayed numbers small.

Franklin's argument (1.5) is that the scale changes what kind of game it is: small integers invite the player to reason about a transparent system, large ones ask for executional skill inside a progression fantasy. If the intent is that a player can look at a shambler and know how many hits it takes, that knowledge is destroyed by a 30 HP pool with fractional-feeling per-hit values.

Uniform rescaling is a no-op, and a no-op is not a fix. Blizzard's own statement (3.1) is that it changes nothing about how hard anything is to kill. If the real complaint is that tuning is coarse, and the answer is a change that by first-party account changes nothing observable, then the change buys headroom for a future problem rather than solving a present one. Under the cited-future standard, that headroom needs a named caller.

The fine knob may already be quantised somewhere else, and raising HP will not find it. Diablo 2's breakpoints (2.4) are the cautionary case: the team had a continuous-looking stat that the engine could only express in whole frames, so wide ranges of the stat did nothing. If this game's fire rates, tick rate or spawn cadence are similarly quantised, HP resolution is not the binding constraint and raising it will produce a game that still cannot be tuned by 15%, now with bigger numbers.

Two techniques in the popcorn toolkit are thinner than they look. Fractional damage accumulation and DoT-as-granularity have no primary sources at all (2.7, 2.8), and overkill-carries-to-the-next-enemy is essentially one game family (3.2). A plan that leans on those is leaning on inference.

### Where the two sides actually disagree

They agree on the diagnosis and disagree on the remedy. Both accept that 2/3/5 against 1 has no tuning resolution. The raise camp puts the resolution in a bigger integer HP pool; the hold camp puts it in a continuous multiplier over a small pool. The determinism requirement is the tiebreaker that the general design literature does not address, and it favours the raise camp, because integer arithmetic over a large pool is bit-exact for free while a continuous multiplier over a small pool needs fixed-point discipline to be reproducible at all.

The question that would settle it is not a design question. It is whether the intended fine knobs (fire rate, cadence, spawn timing) are themselves quantised by the tick rate. If they are, that quantisation is the real granularity ceiling and it should be measured before the HP scale is touched.
