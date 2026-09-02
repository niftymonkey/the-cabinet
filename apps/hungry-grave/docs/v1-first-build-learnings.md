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
- **The bot measures the policy, never the build.** It only dodges and never levels anything, so it sits at whatever the weakest state is and can say nothing about drop choice, progression, or the difficulty question. It is a dodging instrument, not a player.
- **Numbers must be data, not compiled constants.** Every tuning question we hit ran into a value that had to be edited and rebuilt to ask a question. Where a number has to exist before it can be measured, it belongs in data.
- **Two different needs shared one word at the start.** The tape was built so a run could be judged without going off anybody's feel, and player-facing replay got folded into the same concept because both involve watching a run back. They are separate: one is an instrument for evaluating a change, the other is a feature a player uses. Keeping them fused hid the fact that we still have no way to produce a run without a human playing it.
- **Review gates catch decisions, not just defects.** Several of the sharper rulings in the ADR set exist because a gate found a record asserting something the evidence did not support.

## Ruled, and not yet built

Everything here is decided and none of it is in the game. Any new path has to carry all of it, and one golden and bot regeneration commit covers the sim changes together (ADR 0019).

| Ruling | Record |
| --- | --- |
| A drop is an offer of three spinning options, touched to pick | ADR 0034 |
| The belch splits: gas cancels mob fire field-wide, burst kills nearby | ADR 0008 |
| The birthright thins to the skull stream alone, at start and at the floor | ADR 0045 |
| The weapon pool grows, with a per-run roster and unlocks that persist across runs | ADR 0046 |
| Soul stream becomes skull stream everywhere, tape wire identity included | the 2026-08-31 rulings |
| Density and timing are directed inside authored beats, read from pressure | ADR 0047 |

ADR 0047 also carries three off-limits moments where the director adds nothing: boss phases, the drain-out, and the ADR 0042 set pieces, the Wall above all.

## Named, wanted, and homeless

None of these has a ticket or a card, and each one shapes what a real path should contain.

- **The ladder is invisible.** ADR 0003 bleeds score first and then weapon levels, and the player can see none of it happen. Wanted: a visible score, weapon icons carrying their levels, damage blinking out of the score, and stripped lines visibly blowing up. Until the ladder is legible, the player cannot learn what a hit cost them, and we cannot ask them whether it felt fair.
- **The weapon roles are described but never ruled.** `docs/design/weapon-pool-review.md` names the four jobs, my lane, anywhere, around me at field scale, and ahead of me, and tables each shipped line against one. What is missing is status, not text: it is prose in a design record rather than a rule, so nothing binds a fifth line to the taxonomy or makes a new line declare its job.
- **Coverage before kill speed.** A working principle from the pool review, that coverage is the primary job and kill speed is bounded and late, with no durable home.
- **Mob design direction.** Every mob seeks, with seek speed drawn from its movement value. Discussed on #81, never ruled.
- **Nothing can play this game except Mark.** The bot dodges and never levels anything, so it reports on a dodging policy and nothing else. Every question about progression, drop choice or difficulty waits on a person sitting down to play. Wanted: a harness that actually plays, moving, dodging, feeding and choosing, in several deliberate styles, so a change can be evaluated without a human in the loop. This is the other half of why the tape exists, and Mark's read is that everything built after it goes faster once it exists.
- **The bell becomes arcs.** A complete design exists in conversation and in a gitignored file, waiting on its record: cones rather than a ring, growing toward the sides with level, blindness at level one accepted, push that must be felt.

## What the current plan gets wrong

The roadmap was cut from what already existed, which means it sequences finishing work around the two systems above as though they were settled.

- **The tuning pass (#39) is a `now` card that tunes a fixed row density that directed density (#85) then turns into a floor.** Three review gates flagged the ordering and all three left it unresolved.
- **Only one of the six unbuilt rulings has a card.** Directed density is n85; the offer of three, the belch split, the thinned birthright, the per-run roster and the skull stream rename have none, so most of the decided work is invisible on the plan.
- **`blocked_by` in the roadmap source declares itself the complete edge set and gives the two newest cards no edges at all**, and the build does not validate edges, so nothing catches a missing one.
- **The promises the plan counts are the old promises.** Some of them, particularly around a shared seed producing the same run, have since been superseded.

## Open questions we are carrying

Things a rethink should decide the home for rather than answer in passing.

- Do the caps get re-derived, or does the director get a live-mob budget instead?
- What guards the felt payoff of levelling? Frequency over amplitude does not by itself stop a treadmill; only clear rate outrunning fill rate does.
- What is the consequence of a dodge-only bot once density is directed, given that every bot difficulty number then measures the floor alone?
- How does a grown grave avoid mis-picking on a spinning offer under fire, and what makes the two-touch tie-break deterministic for the tape?
- How fast does a stripped player recover at the thinner birthright?
- Does the gas become the new lean, and do boss patterns ever complete uncancelled?

## Where the canonical records live

`docs/adr/` rules. `CONTEXT.md` is the glossary. `docs/influences.md` records what we take and refuse from other games, by system. `docs/design/` holds design records, each written at its own stage. `docs/research/` holds the sourced reading behind the rulings. `scripts/roadmap/v1.yaml` is the plan's source.
