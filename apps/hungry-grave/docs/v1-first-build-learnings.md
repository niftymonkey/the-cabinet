# Learnings from the first build

What building the first pass taught us, from the map at #26 through the tracer and the tuning work that followed. This is not a plan and not a design record: the ADRs rule, the design docs describe how a thing works, `lessons.md` records the traps this codebase's own code has shipped, the roadmap sequences, and this file says what the work itself taught us and what still has no home. Read it before replanning, so a new path keeps the direction we already earned instead of rediscovering it.

It grows. An entry earns its place by being something we did not know when we started and cannot read off the code.

## Where this started

The map (#26) and the spec (#37) set out to prove one bet: that steering a hole into the space danger just left, against every shmup instinct, is delicious rather than miserable. The tracer was built to make that bet playable, and everything in the first pass served it.

That framing is still right, and it is worth saying plainly before the rest of this file lists what went wrong: the bet is not what failed.

## What the first pass proved

- **The core loop holds.** The swallow, the growth, and passing under what you outgrew work as a loop and are fun to do. The game runs start to finish on desktop and under thumbs on a phone.
- **The instrument works, and it is better than we expected.** Every run records a tape that proves it is the real run; a tape replays exactly; the measure tool reports cost, pace, path, field share, freshness, belch cadence and drop landings; conditioned tapes can be recorded at chosen weapon levels; two runs compare without hand arithmetic. This turned out to be the most valuable thing the first pass produced, because it is what let us find the problems below rather than argue about them.
- **Determinism is real.** Fixed ticks, rounded math behind a lint rule, named seeded streams, and a committed golden digest. A director or any other new system can be added without breaking replay, and that was verified against the code rather than assumed.
- **Drop legibility landed.** Each drop carries its line's silhouette and separates from the field without a HUD glance, shipped and accepted in play (#36).

## What the first pass never designed

This is the finding that triggered the replan, and it is the reason the tuning work kept feeling like it had nothing to push on.

Two systems were built as scaffolding to prove the core loop, not designed as systems:

- **Difficulty, pacing and mob density.** The stage is a fixed authored timeline of rows. Density is a count typed onto a row. There is no signal read from play and no dial to turn, so "make it harder" means editing rows by hand and re-recording every tape.
- **Weapons and power progression.** Four lines, compiled in, handed out by a uniform roll. There is no roster, no choice, no unlock, and no shape to how power arrives. What a run becomes is dice.

The consequence is the important part. **A tuning pass cannot tune a game whose difficulty and progression are not systems.** It can only move individual numbers, one at a time, with no way to say what the move was supposed to achieve. And a playtest against that build cannot tell us what is wrong, because the player's experience is a roll of the dice rather than the output of anything we chose.

The caps make the same point in miniature. `caps.ts` sets `MOB_CAP` at 160 and states its own rule, that a cap which binds in normal play is a bug rather than a policy. It was derived against a measured densest authored moment of about fifty mobs alive. That number is only safe because the density is fixed. The moment density is directed, the safety net becomes the real ceiling, and `CORPSE_CAP` at 200 is worse in kind, because it evicts the oldest live corpse rather than refusing, quietly taking food off the field in a game whose whole premise is that nothing swallowed is worthless.

## What the iterations taught us

- **The symptom is rarely the system.** The belch looked broken; the drop curve was the cause. Belch share of kills swung wildly between runs on seed luck alone, under a uniform roll nobody had chosen.
- **Luck was doing the job choice should do.** The weapon pool review found the roll, not the lines, deciding what a run became. That produced the offer of three (ADR 0034) and the per-run roster (ADR 0046), and it is the clearest case of a "tuning" problem that was really a missing system.
- **One static density cannot serve both ends of the ladder.** ADR 0003 bleeds score and then weapon levels on the way to death, so a stripped player and a levelled player meet the same rows in completely different games. Any single authored density is wrong for one of them.
- **Reading power punishes power; reading pressure does not.** Battle Garegga tied difficulty to what the player had collected and the optimal line became deliberate suicide. Left 4 Dead reads how hard the player is being pressed and has no progression to punish. Risk of Rain 2 keys difficulty to time rather than to items, deliberately. ADR 0047 rules that we read pressure. This was a late correction: the record first said power, and it took a review pass to catch it.
- **The bot measures the policy, never the build.** It only dodges and never levels anything, so it sits at whatever the weakest state is and can say nothing about drop choice, progression, or the difficulty question. It is a dodging instrument, not a player. Refined 2026-09-07 by the harness research: four studios found independently that a bot whose absolute numbers sit far from human still orders changes the way humans do, so a weak policy is worthless as a threshold and sound as a comparison. What our bot still cannot do is express a choice, which is why the offer goes into it before any second style.
- **Numbers must be data, not compiled constants.** Every tuning question we hit ran into a value that had to be edited and rebuilt to ask a question. Where a number has to exist before it can be measured, it belongs in data. The grill priced the other side (2026-09-07): a knob that ships as data and changes what the simulation does is something a tape's replay depends on, so it costs a header field and its versioning (ADR 0027, `docs/research/director-knobs-and-signal.md`). The cost is real and it is not a reason to compile a number we still have to move.
- **Two different needs shared one word at the start.** The tape was built so a run could be judged without going off anybody's feel, and player-facing replay got folded into the same concept because both involve watching a run back. They are separate: one is an instrument for evaluating a change, the other is a feature a player uses. Keeping them fused hid the fact that we still have no way to produce a run without a human playing it.
- **Review gates catch decisions, not just defects.** Several of the sharper rulings in the ADR set exist because a gate found a record asserting something the evidence did not support.

## What the grill taught us

The V1 grill ran across six sessions (2026-08-31 to 2026-09-07) and produced 26 decisions and eight research records. What it ruled belongs in the ADRs. What it turned up along the way belongs here.

- **The old build cannot answer a question about the new systems.** A scratch tally was run against the current fixed stage to find out whether one breath of kills could cross two drop prices, and it was stopped as soon as it started, because the stage it measured is the old game (decision 9). The same trap sits under the price table itself: it is the number the tuning pass would have spent its effort on, and the carrier ruling retires it whole (decision 10).
- **A pause is a hole in the pressure signal.** A director reads pressure continuously, so anything that halts the run while the field stays live, a wildcard pause above all, leaves the reader with nothing across the gap. That is one of the two reasons progression is designed before density (decision 4), and any pause proposed later has to answer it.
- **Fatshark deleted the near-kill term, and here it would be worse than wrong.** Left 4 Dead grades a nearby enemy death by two radii and Vermintide 2 adds intensity for every kill near a player; Darktide, the same studio's rewrite, dropped the term and reads only harm (`docs/research/director-knobs-and-signal.md`). A kill up close is food in this game, so a grave in the storm would read as maximally pressed, and a director briefed to ease would thin the storm at exactly the moment the design wants it thickest.
- **No shipped director has ever added enemies that were also the reward.** Every director on record adds pure threat, and every shipped set piece either pays a separate reward for surviving it or taxes the kills inside it (`docs/research/stage-length-with-a-director.md`, `docs/research/set-piece-and-final-boss-chunk.md`). Mobs are food here by rule, so the payout side of a directed swarm has no precedent to check against and can only be read off our own tape.
- **No shipped director had to replay, either.** All of them read wall-clock timers and unseeded randomness. The pieces exist separately, Risk of Rain 2 chains its director's dice off the run seed inside a fixed update, Barotrauma runs its event director in a 60 Hz accumulator with a spiral-of-death clamp, Factorio verifies lockstep replays per tick, but nobody has built the whole thing, so our replay constraint is ours to prove (`docs/research/director-precedent.md`, `docs/research/director-knobs-and-signal.md`).
- **What the director gets is directed minutes, not stage minutes.** Boss phases, drain-outs and set pieces are off limits, that overhead does not shrink when the stage grows, and every added boundary costs about another 45 seconds of it, so five minutes held under three directed minutes against a shipped cycle period of one to three (`docs/research/stage-length-with-a-director.md`). The stage length was picked from the shmup record first (decision 7) and superseded six days later once that arithmetic existed (decision 13): a craft number chosen before the system that consumes it is designed is a guess wearing a citation.
- **A complaint record has to be sorted by cause before it counts as evidence.** The shmup forums' case against long first stages looked decisive until it was read complaint by complaint: of six, four are about content (no play, repeated waves, no scoring layer), one is about retry cost, and one is about length itself and is contradicted in its own thread (`docs/research/stage-length-with-a-director.md`).
- **Gain reads off the field; loss does not.** Every shipped game announces a rung gained on the field, and none announces a rung lost there, because a decrement inside a dense storm is invisible, so loss needs a second channel (`docs/research/visible-ladder-precedent.md`). Two absences travel with that: no shipped game subtracts from a running score on a hit, and every shipped recovery of lost power is a death mitigation rather than a hit at the floor, so ADR 0003's score bleed and a catchable stripped rung are both new ground, noted and not pushed.
- **A deterministic policy needs exactly one run per seed.** A fixed policy replayed on the same seed reproduces the same run, so a batch's size is its seed count and a repeated seed is a wasted run (`docs/research/playing-harness-precedent.md`).
- **Nothing shipped hands a player three powers on the field to be taken by touch under fire.** Searched across the shmup and survivors-like field and not found; the nearest shapes are the Gradius meter, Risk of Rain 2's Multishop and the single item cycling on a timer (`docs/research/reward-delivery-models.md`). That is an absence in a search rather than proof, and the record's real contribution is the failure mode by name: Iuchi's deaths came from mis-selecting under fire, which is what took the spin out and left the offer standing (decision 8).
- **A summarising fetch tool fabricated quotations.** Chasing ZUN interview quotes, the page summariser returned invented Japanese sentences and two invented claims for both 4gamer pages; every quote in that record was re-verified against the raw page bytes (`docs/research/set-piece-and-final-boss-chunk.md`). Sibling records that cite 4gamer ZUN quotes obtained the same way, `shmup-stage-design.md` above all, need the same check before anything leans on them.

## Ruled, and not yet built

Everything here is decided and none of it is in the game. Any new path has to carry all of it, and one golden and bot regeneration commit covers the sim changes together (ADR 0019).

| Ruling | Record |
| --- | --- |
| A drop is an offer of three side by side, and the grave swallows one | ADR 0034 |
| The belch splits: gas cancels mob fire field-wide, burst kills nearby | ADR 0008 |
| The birthright thins to the skull stream alone, at start and at the floor | ADR 0045 |
| The weapon pool grows, with a per-run roster and unlocks that persist across runs | ADR 0046 |
| Soul stream becomes skull stream everywhere, tape wire identity included | the 2026-08-31 rulings |
| Density and timing are directed inside authored beats, read from pressure | ADR 0047 |

ADR 0047 also carries four off-limits moments where the director adds nothing: boss phases, the sparse last row before each boss (ADR 0051), the Wall, and the swarm set piece that ends the stage's middle section.

Added 2026-09-07: the grill ruled a good deal more unbuilt work than this table holds, across how power arrives, the shape and length of the stage, what the director may spend, the playing harness and where runs are kept. Those land as ADRs at the grill's ADR step, and this table is rebuilt from the ADR set once they do.

## Named, wanted, and homeless

None of these has a ticket or a card, and each one shapes what a real path should contain.

- **The ladder is invisible.** ADR 0003 bleeds score first and then weapon levels, and the player can see none of it happen. Wanted: a visible score, weapon icons carrying their levels, damage blinking out of the score, and stripped lines visibly blowing up. Until the ladder is legible, the player cannot learn what a hit cost them, and we cannot ask them whether it felt fair. Housed 2026-09-07: the grill put the visible ladder inside the V1 line, on both channels, and made a stripped rung a body on the field (decisions 18 and 20).
- **The weapon roles are described but never ruled.** `docs/design/weapon-pool-review.md` names the four jobs, my lane, anywhere, around me at field scale, and ahead of me, and tables each shipped line against one. What is missing is status, not text: it is prose in a design record rather than a rule, so nothing binds a fifth line to the taxonomy or makes a new line declare its job.
- **Coverage before kill speed.** A working principle from the pool review, that coverage is the primary job and kill speed is bounded and late, with no durable home.
- **Mob design direction.** Every mob seeks, with seek speed drawn from its movement value. Discussed on #81, never ruled.
- **Nothing can play this game except Mark.** The bot dodges and never levels anything, so it reports on a dodging policy and nothing else. Every question about progression, drop choice or difficulty waits on a person sitting down to play. Wanted: a harness that actually plays, moving, dodging, feeding and choosing, in several deliberate styles, so a change can be evaluated without a human in the loop. This is the other half of why the tape exists, and Mark's read is that everything built after it goes faster once it exists. Housed 2026-09-07: the playing harness is inside the V1 line, one policy over many seeds first and two error knobs on it after (decisions 3 and 17).
- **The bell becomes cones.** A complete design exists in conversation and in a gitignored file, waiting on its record: cones rather than a ring, growing toward the sides with level, blindness at level one accepted, push that must be felt. Ruled 2026-09-07: the cones get built rather than only filed, and ADR 0036 is rewritten in place at the grill's ADR step.

## What the current plan gets wrong

The roadmap was cut from what already existed, which means it sequences finishing work around the two systems above as though they were settled.

- **The tuning pass (#39) is a `now` card that tunes a fixed row density that directed density (#85) then turns into a floor.** Three review gates flagged the ordering and all three left it unresolved. Resolved 2026-09-07: the grill's path puts the tuning after the harness and the director and makes it harness-driven rather than a static-row tune. The roadmap source itself is untouched, so the card still reads the old way.
- **Only one of the six unbuilt rulings has a card.** Directed density is n85; the offer of three, the belch split, the thinned birthright, the per-run roster and the skull stream rename have none, so most of the decided work is invisible on the plan.
- **`blocked_by` in the roadmap source declares itself the complete edge set and gives the two newest cards no edges at all**, and the build does not validate edges, so nothing catches a missing one.
- **The promises the plan counts are the old promises.** Some of them, particularly around a shared seed producing the same run, have since been superseded.

## Open questions we are carrying

Things a rethink should decide the home for rather than answer in passing.

- Do the caps get re-derived, or does the director get a live-mob budget instead? Answered 2026-09-07 by decision 19: both, a finite budget per phase with the caps re-derived above floor plus budget and the corpse cap never evicting.
- What guards the felt payoff of levelling? Frequency over amplitude does not by itself stop a treadmill; only clear rate outrunning fill rate does. Closed in part by the same decision, since a finite budget is a fill the storm can visibly outrun; whether it feels that way is still a question for play.
- What is the consequence of a dodge-only bot once density is directed, given that every bot difficulty number then measures the floor alone? Answered 2026-09-07: its numbers are comparisons and never thresholds, per the refinement above.
- How does a grown grave avoid mis-picking on a spinning offer under fire, and what makes the two-touch tie-break deterministic for the tape? Half answered 2026-09-07: the spin is gone (decision 8), and the tie-break when the grave covers two offer bodies is still open.
- How fast does a stripped player recover at the thinner birthright?
- Does the gas become the new lean, and do boss patterns ever complete uncancelled?

## Where the canonical records live

`docs/adr/` rules. `CONTEXT.md` is the glossary. `docs/influences.md` records what we take and refuse from other games, by system. `docs/design/` holds design records, each written at its own stage. `docs/research/` holds the sourced reading behind the rulings. `scripts/roadmap/v1.yaml` is the plan's source.
