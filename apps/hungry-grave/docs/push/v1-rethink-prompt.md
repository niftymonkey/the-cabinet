# Prompt: grill the path to V1

I want to grill the path to V1 before we touch another ticket. Do not start planning until the grilling is done.

This is not a fresh start. We have been going in a consistent direction for a while and I want to keep going in it. What I want is a real path that includes the things we have realized we need to do, instead of the path we cut back when we did not know them yet.

## Read this first

`apps/hungry-grave/docs/v1-first-build-learnings.md` is the compass for this session. It records what building the first pass taught us, what it proved, what it never designed, what is ruled and unbuilt, what is wanted and homeless, and what the current plan gets wrong. Everything I am about to say is in there in more detail. Do not re-derive it; check it, and tell me where it is wrong.

Also read `continue-hungry-grave.md` at the repo root. It carries how we work rather than what we are deciding: the standing rules, the commands, the deploy state, and the bell arcs design that has no other home.

Then read, in this order:

- `apps/hungry-grave/docs/influences.md`, the difficulty/pacing/density and weapons/progression sections especially
- `apps/hungry-grave/docs/VISION.md` and `apps/hungry-grave/docs/design/game-concept.md`
- `apps/hungry-grave/docs/adr/`, and 0047 (directed density), 0034 (offer of three), 0045 (birthright), 0046 (per-run roster), 0003 (size is health, the floor ladder), 0008 (the belch split) in particular
- `apps/hungry-grave/CONTEXT.md` for the glossary
- `scripts/roadmap/v1.yaml`, the current plan's source
- The open Hungry Grave tickets: #85, #86, #82, #81, #72, #68, #67, #66, #64, #55, #51, #50, #49, #47, #39, #38, #37, #31, #26

## The short version of why we are here

We keep trying to tune this game and the tuning has nothing solid to push on. Difficulty, pacing and mob density is one reason; weapons and power progression is the other. Both were built as scaffolding to prove the core loop, not designed as systems. Density is a count typed onto a row. Progression is four compiled lines handed out by a uniform roll. So a tuning pass can only nudge single numbers, and a playtest cannot tell us what is wrong, because what the player got was dice.

My suspicion, which I want attacked rather than agreed with: the current V1 plan encodes the old game. It sequences finishing and polish work around two systems that are about to be redesigned, so patching tickets inside it is fixing small problems in a shape we no longer want.

I am willing to close the existing tickets and re-cut them, carrying the learnings across. If there is a less destructive path to the same result, I want to hear it. If the honest answer is that the plan mostly survives and I am over-reacting, say that plainly and show me why.

## Things the new path has to carry, and must not lose

These are in `v1-first-build-learnings.md` in full. They are inputs to the grill, not work items. **Do not turn any of them into tickets during the grilling.** Tickets come out the far end, once we know the shape.

- **Six rulings that are decided and entirely unbuilt**: the offer of three, the belch split, the thinned birthright, the per-run roster with cross-run unlocks, the skull stream rename including the tape wire identity, and directed density. No card on the current plan represents any of them.
- **The ladder is invisible.** Score, weapon icons with their levels, damage blinking out of the score, stripped lines visibly blowing up. I want this and it has no ticket. A player who cannot see what a hit cost them cannot tell us whether it felt fair.
- **The tuning pass (#39) tunes a fixed row density that directed density (#85) turns into a floor.** Three gates flagged the ordering and all three left it to me.
- **Three homeless design pieces**: the weapon role taxonomy, the coverage-before-kill-speed principle, and the bell arcs design that is written down nowhere durable.
- **The open questions** at the bottom of `v1-first-build-learnings.md`, including the caps question and the dodge-only bot.

## Settled, not up for grilling

The core loop (the swallow, growth, passing under what you outgrew), the shmup crossing, replay from seed plus inputs, and the ADRs as the canonical record. The central bet is not what failed. Do not reopen these unless the grill genuinely proves one of them is the problem, and say so loudly if it does.

## How to grill me

Use `/grill-with-docs`. One question at a time, and wait for my answer. Do not propose the answer before I have given mine. Frame design questions as moments of play rather than abstractions, and back any recommendation with named games and sources rather than intuition.

Questions I expect to be pushed on, though find better ones if they exist:

- What is V1 actually for now? If it is still "test the central bet with a real person", does either system have to be designed first for that test to mean anything?
- What does "tunable" concretely mean for each system: which knob, read by which measurement, changing what in play?
- Which of the two systems is load-bearing for the central bet, and which one is comfort?
- Is a director inside V1, or is the honest V1 an authored stage with real knobs that a director replaces later?
- Does the invisible ladder belong before the systems work, given that it is how a playtester tells us anything at all?
- Ticket by ticket: which ones encode an assumption that is now wrong?

## What I want at the end

1. A redefined path to V1, with order and dependencies laid out the way that makes sense now.
2. A disposition for every open Hungry Grave ticket: keep, rewrite, or close, with the learning that survives it named.
3. The decisions that came out of the grill recorded as ADRs, per the usual pattern, and `v1-first-build-learnings.md` updated with anything the grill taught us.
4. Only then, tickets and roadmap cards.

Draft all of it for me to review before anything is created, closed or edited.
