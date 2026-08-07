# Housewarming

A cozy-but-dark incremental deduction game for the Spooky/Spoopy jam. It will ship as the first app
in The Cabinet, see `docs/design/cabinet.md`.

The title reads three ways at once: warmth is the resource, the fiction is literally warming a
house, and a housewarming is a friendly ritual with someone new in the house, which is the ending.

Rejected titles: *True Names* (not smart enough), *Journal of Spirits* (accurate but flat, and it
puts the interface on the marquee instead of the feeling), *What the Night Leaves*, *Small Hours*.
Journal survives inside the fiction, though. The book is the keeper's journal.

## What it is, in a paragraph

You have taken on a house that already has residents. You cannot see them. Each night you set up an
experiment and go to bed, and each morning you look at what the night left behind. Every spirit has
hidden traits, and each trait you confirm is a piece of its true name. Complete a name and you name
the spirit, and a named spirit works the house whether it likes it or not. Spirits you have not yet
named are loose, and loose spirits take from the house. The game is a race between what your named
spirits produce and what your unnamed ones drain.

## The box

These are settled. Changing one is a real decision, not a tweak.

| Constraint | Value |
|---|---|
| Team | Solo (Mark). Everyone in the jam builds their own game. |
| Stack | Web, TypeScript. |
| Tone | Spoopy leaning dark. Not cute, not grim. |
| Art | Design routes around art. AI-generated art may fill space later, never load-bearing. |
| Writing | Minimal by design. Names and one-liners, never paragraphs. |
| Deadline | Playable by Halloween 2026 (Oct 31). That build is the beta, not v1. |
| Availability | Hours are not the binding constraint. The risk is that the interesting part arrives too late, so get a crude playable build up early even if it is ugly. |
| Longevity | This is a project to keep building for a year, not a jam throwaway. |
| Decision rule | Decisions are **not** made on what sounds fun to build. Mark has been an engineer for thirty years, got into it wanting to be a game programmer, and has never made a game. The goal is a good game built properly, piece by piece. "Which part would you enjoy building" is explicitly out of the decision-making process. |

## The core loop

1. **Set up the night.** Choose a combination of offerings and conditions. Each setup costs
   resource.
2. **Sleep.**
3. **Look at the morning.** The room at dawn shows what happened. Not prose, a scene. See
   Presentation.
4. **Update the book.** Mark traits ruled in and out.
5. **Name it.** When a name is complete, name the spirit. It flips from the drain column to the
   production column.

## Why the two loops are one loop

This is the thing that makes the hybrid worth doing rather than two systems bolted together.

- Named spirits produce resource passively.
- Resource buys experiments per night.
- More experiments per night means faster deduction.
- Faster deduction means more named spirits.

The incremental curve is not a set of numbers we invented and tuned. It falls out of the deduction.
Knowledge is the currency.

## Pressure, and losing

Without pressure, experiments-per-night is a convenience rather than a resource, and the incremental
spine is decoration. Unnamed spirits drain the house every night. That creates:

- A reason to want more experiments per night.
- A race between two curves, production against drain.
- A losable game with no combat system, no health bar, no second system to build.

**Anti-spiral rule:** partial knowledge reduces a spirit's drain. Every confirmed trait pays off
immediately, so a player who falls behind always has a way back. Without this the drain produces
unrecoverable death spirals.

Losing the house is in scope for the Halloween build. Decided 2026-08-06.

## The frame: naming, and being the keeper

Two layers, deliberately two different words. Using one word for both is what made "binding" stop
fitting once the ending turned warm.

**Naming is the action.** You complete the true name, so you name it. The mechanic and the verb are
the same fact, no explanation needed, and the book is already a book of names. It is neutral in
exactly the way the ending needs: you name a stranger to get hold of it, you name your aunt to
acknowledge her, same word, entirely different weight, and the game never points at the difference.
A spirit you have dealt with is **named**.

**Keeper is the role.** You keep the house. Your aunt was the last keeper, and the book is the
keeper's book. Losing means the house stops being kept.

Rejected: *binding* (coercive, stopped fitting the tea ending), *keeping* as the action verb too
(warmest option, but if keeping the house and keeping a spirit are the same word a player has to
work out which one a button means), *taking in* (best tonal ambiguity, reads badly as an interface
verb), *quieting* (sounds like killing).

The oldest rule in folklore is that knowing what a thing truly is gives you power over it. That does
three jobs at once:

- It makes deduction the literal mechanism of power rather than mere research.
- It gives the game its central object: a book of names. Same logic grid underneath, much better
  thing to look at and to put on an itch page.
- It supplies moral texture for free. You are doing something slightly wrong to something that was
  here before you. Tone without words, which matters given the writing constraint.

Grounding the creatures in real folklore also means content is research and transcription rather
than invention, which shrinks the writing job further.

## The four axes

The rule everything else follows from: **the spirit's traits and the player's controls are the same
vocabulary.** If a spirit is drawn to something, the player must be able to set that thing out.
Otherwise the trait exists but no experiment can test it and it is only noise.

| Axis | What it is | How the player controls it |
|---|---|---|
| **Hour** | When it is abroad. Dusk, midnight, the small hours, first light. | What is left burning and for how long. A candle burnt to a known height is both instrument and clock. |
| **Lure** | What draws it in. Milk, something sweet, something shiny, warmth, music, a smell. | Directly, by what is set out. |
| **Aversion** | What turns it away. Salt, iron, a mirror, running water, an open door. | By what is placed, and more importantly by what is left out. |
| **Haunt** | Which room it belongs to. | By where the night is set up. |

Those four decisions are the whole setup screen, and they are the whole name. A true name has four
parts because a spirit has four traits, so the book entry and the setup screen mirror each other and
neither needs explaining.

**Deduction.** A positive result says several things at once: it came, so the room was right or it
wanders, the lure matched, the hour overlapped, and whatever was used as a ward is *not* its
aversion. A negative result is the interesting one because it is ambiguous: wrong room, wrong lure,
wrong hour, or it was warded off by accident. That ambiguity is the puzzle, and it is what makes a
careful experiment better than a random one.

**Submit whole names only.** Obra Dinn's rule. All four parts at once or not at all, so nobody
brute-forces one axis at a time.

### Information density is the real difficulty dial

Structurally this is Mastermind. Four positions, N values, guess the code. Classic Mastermind is
four positions and six colours, 1296 combinations, solvable in five guesses with optimal play.

The size of the space is not the problem. The feedback is. Mastermind returns roughly four bits a
guess by reporting exact and partial matches. A morning that only says "something came" or "nothing
came" is one bit, and 1296 possibilities at one bit a night is twenty or thirty nights per spirit,
which is unbearable.

**So the morning report must carry four independent signals, not one.** Which room shows a trace.
How far the candle burnt before it happened, giving the hour. Whether the lure was taken or refused.
Whether something approached and turned back, giving the aversion. Roughly four bits, and the same
space becomes solvable in a handful of nights.

Getting this right matters more than how many values each axis has.

### Numbers

Start at four values per axis, 256 names. The house growing adds values: opening the cellar adds a
room, which widens an axis, which widens the space. At six values across the board it is 1296, full
Mastermind, arrived at gradually. The difficulty ramp and the house opening up are the same
mechanism.

Target, to be confirmed by the solver rather than argued about: first spirit in five or six nights,
later ones in ten to twelve, and nothing the solver cannot crack without guessing.

### Trace type is a visible identifier, not a hidden axis

How a spirit marks a room (frost, damp, a sound, moved objects) is also how the player tells which
spirit did it when several are loose.

Parallel puzzles multiply difficulty rather than adding it when they share resources, and ours share
everything: the same rooms, the same nights, the same lures. Two loose spirits is considerably worse
than twice one, because every night's setup serves two sets of constraints and every trace must be
attributed before it means anything.

Keeping trace type visible is the scaffolding that lets two spirits stay two separate puzzles rather
than collapsing into one entangled mess. Hiding it makes difficulty explode. Spirits should also
arrive staggered rather than all at once.

### The solver is the difficulty instrument

The automated human-mimicking solver from the procgen research is not only a fairness check. It
reports how many nights a generated puzzle takes to crack, which turns difficulty from a feeling
into a number. Generate a thousand houses, run the solver, read the distribution, move the dials.

This matters because puzzle games are not Mark's genre and his own taste is not a reliable gauge.
Measuring beats guessing here.

## Procedural generation

Spirits are rolled from trait pools at the start of a playthrough, not authored. This gives the
replayability Mark wanted from the roguelite lane, and it makes content a data table rather than
written creatures.

The Halloween build ships a deliberately dumb generator. All traits, pools, drain rates and
generation rules live in data, not code, so the generator can be replaced later without touching
anything else. Improving the generator is the main thing this project has to grow into over the
following year.

## Scope sketch

Smallest shippable version: four trait axes with a handful of options each, six spirits, two screens
plus the book.

## Why the player is here

One house, and it is yours. A relative you cared about left it to you. They died and nobody ever
explained why.

You love the house. That is the whole motivation. You find out it is haunted and you stay anyway,
because you are not going to be driven out of your own home. Naming is not survival and not a job,
it is insisting on living somewhere.

The book was theirs. You find it in the intro, half filled, in their handwriting. It explains where
the book came from, it teaches the player how naming works without a tutorial, and it gives the
game's small allowance of flavour text a natural home in someone else's marginal notes.

Her last entry is unfinished, because she died before she could write it.

### The ending

She was doing exactly what you are doing. She lost, and because she lost she died, and because she
died she is now another spirit in the house. Straight causality, no twist. She was never secretly
the last one all along.

So the name still missing from the book is hers, and she is the final entry.

Intro lore, skippable with a keypress: she was found frozen solid in the middle of winter, which
almost explains itself, except she was found inside the house. The mundane explanation is available
and nearly holds. That plants the mechanic without teaching it.

She is deduced from her own book rather than from traces, because she was writing about herself
without knowing it. The final act is structurally different without needing a new system.

**How her entry resolves.** Every stranger you take gets put to work. Her you take and she simply
stays. The game never explains the difference. That is the tea scene, and it needs about two
sentences.

Both readings of that scene are available for free and we do not have to pick. The warm one is that
you got her back. The darker one is that a spirit cannot help draining, so keeping the house meant
taking her the way you took the others, and you know what you did. Same two sentences either way.

**She is optional.** You can win the house without ever finishing her entry, and if you do, it is
warm and empty. Finish it and it is warm and she is there. The good ending is earned rather than
handed over, and it costs nothing to build, because she is just the last entry and the player is
allowed to stop early.

### Losing: the exit that closes

Cold has stages. Partway down, a **Leave** action appears in the interface. One or two stages
further down it is gone, greyed out, too cold to get packed and out. The game visibly offers you the
exit and then takes it away, in front of you, while you are deciding whether one more night is worth
it.

The beat this exists for: you are packed, you leave tomorrow, and you could try one more experiment
tonight. Take it and you might save the house. Take it and miss and you are past the threshold.

So the player can die of cold, the same way she did. This is deliberately not carried by prose. An
earlier version had the player merely evicted, with the "she could have left and wouldn't" point
delivered in writing. Mark rejected it because it needs good writing to land. Turning it into a
mechanic means the player nearly repeats her death themselves and understands it without being told.

### Winter is the difficulty ramp

Play runs through autumn into winter and the drain worsens as the season turns. Not a countdown,
just a race that keeps tightening, which gives escalation without a timer. It also places Halloween
in the middle of the game rather than at the end, which suits the jam.

### What that buys mechanically

- **The loss condition is losing the house.** Not death. If the drain wins, the place becomes
  unlivable and you move out. Crueller than dying and it fits the tone.
- **The drain has a face.** Unnamed spirits make the house cold, damp, dark. You are fighting to
  keep somewhere habitable, which motivates the economy without a word of explanation.
- **There is an authored ending on a procedural body.** The endgame is finishing the entry they did
  not finish. The middle of the game is generated, the last spirit is written. Cheap, and it gives
  the mystery an answer.

## Presentation

This section corrects an earlier mistake. The deduction research said clues belong in the
environment rather than in menus, and the design went ahead and put them in menus anyway. Mark
pushed back that a game made of text would not hold him, which was right.

### The morning is a scene, not a paragraph

The four signals the morning has to carry become four things you can **see** in the room at dawn.

- The candle burnt down to a height, giving the hour.
- Frost across the window, or not.
- The bowl tipped, licked clean, or untouched, giving the lure.
- The salt line scuffed or intact, giving the aversion.

Same four bits of information, no prose. This is what Obra Dinn and Golden Idol actually do: present
a static scene as pure evidence and let the player draw the conclusion without narration.

**The art cost is smaller than it looks.** It is one room, seen every single morning, with a small
set of swappable states per detail. A background plus overlays. That amortises across the whole game
and it is exactly the sort of job AI-generated art handles well.

### Sound is the third channel

Neither text nor art, and by the research it is at least half the horror experience. It is also the
best atmosphere per unit of effort available to us.

- An ambient drone as the base layer, semi-random creaks and drips over it, silence used as contrast
  so a stinger lands.
- And it carries information: you **heard** something in the night. Scratching in a wall, footsteps
  overhead, a voice from a room you were not in. A trace that costs no art and no writing.

### Darkness is the economy made visible

The research says darkness is the strongest atmosphere tool because it restricts what the player can
see. Our resource is literally warmth and light.

So the colder the house gets, the less of the morning is legible. The drain stops being a number
ticking down and becomes the room going dark around you, with clues you can no longer read. The
economy and the atmosphere become one system.

**Caveat to watch:** this takes information away from a player who is already behind, which is the
opposite of the anti-spiral rule. Tune carefully or cap how dark it gets.

### Stack, revised

React alone was the right answer for a game of tables and text. It is the wrong answer for an
inspectable scene with a light radius, a guttering candle and frost creeping across glass.

- **React** owns the book and the setup screens. Those genuinely are grids and forms.
- **PixiJS** owns the room. This is the hybrid the original stack research described: DOM as the UI
  layer, canvas as the world layer, and no React re-render driving the frame loop.
- **Not Phaser**, which is built for worlds with physics and movement we do not have.

## The resource: warmth, and only warmth

Setting up a room costs warmth, because it has to be kept lit. Unnamed spirits drain warmth. Named
spirits produce it. Too little warmth and the Leave action appears, then disappears.

One number runs the entire economy. The fiction and the mechanic are the same thing again, and the
title is about it.

## Open questions

- Exactly how the house expands, and which axis each new area widens.
- Who she was to Mark. "Favourite aunt" is the placeholder. It is the difference between the ending
  being sad and being merely tidy.
- Values per axis at each stage, pending the solver.

## Pacing, and why there is no prestige layer

The incremental research says prestige resets are load-bearing for pacing. That advice is written for
idle games with infinite runtime. This one has an ending, and the two games the same research names
as the most memorable in the genre, Universal Paperclips and A Dark Room, have no prestige layer at
all. They pace on unfolding instead: new mechanics and new areas appear as you progress.

So the house does the pacing. It opens up as you name. The cellar, the attic, the room that was
always locked. Each new area brings new trait axes, which raises the ceiling on deduction difficulty
and keeps the vocabulary growing. That is the unfolding pillar, and it fits a single house that you
love and are slowly taking back.

Proposed rather than settled. Revisit if the middle of the game goes flat.

## Explicitly not doing

- No run-and-reset roguelite structure. Procedural content gives the replayability; runs and deaths
  fight the tone. Revisit only if the drain mechanic fails to create tension.
- No combat, no health bar. Losing comes from the economy.
- No map or location placement. That was the cryptid-field-guide version and it costs interface we
  do not need.
- No paragraphs of prose anywhere. Hard rule, enforced so the temptation dies at the rule.

## Decision log

- **2026-08-06** Solo build, web TypeScript, art-light, ship-something-finished.
- **2026-08-06** Tone: spoopy, cozy leaning dark after the binding reframe.
- **2026-08-06** Lane: hybrid of deduction roguelite and spooky incremental, over either alone.
- **2026-08-06** Frame: binding by true name. Replaced "befriend the house" as too cute.
- **2026-08-06** Unbound spirits drain the house. This is the pressure mechanic.
- **2026-08-06** Losing the house is in scope for the Halloween build.
- **2026-08-06** Halloween build is the beta. Architecture over scope-cutting.
- **2026-08-06** Ships as the first app in The Cabinet, a new monorepo modelled on Nostalgia.
- **2026-08-06** One house, and it is the player's own. Rejected house-after-house, which would have
  made procedural rerolls diegetic but cost the attachment that makes cozy work.
- **2026-08-06** The player stays because they love the house, not to survive and not for pay.
- **2026-08-06** The book belonged to a relative who died unexplained. "You are not the first."
- **2026-08-06** Losing means losing the house and moving out. Nobody dies.
- **2026-08-06** No prestige layer. The house expanding is the pacing mechanism instead.
- **2026-08-06** The final spirit is the relative herself. Mark's idea, replaced a weaker version
  where you merely finished the monster she had been working on.
- **2026-08-06** She froze inside the house in winter. Cold is both the backstory and the mechanic.
- **2026-08-06** Autumn into winter is the difficulty ramp. No countdown timer.
- **2026-08-06** The player can die of cold. Losing is not eviction. The Leave action appears as the
  house cools and disappears when it gets too cold, so the choice is mechanical rather than written.
- **2026-08-06** Ending: taking her lets her stay rather than putting her to work, and she is
  optional so the good ending is earned.
- **2026-08-06** Core action is **naming**, the role is **keeper**. Replaced "binding", which had
  gone coercive in a way the ending no longer supports.
- **2026-08-06** Title: **Housewarming**.
- **2026-08-06** Four axes: hour, lure, aversion, haunt. Each pairs with a player control, because a
  trait no experiment can test is only noise.
- **2026-08-06** The morning report must carry roughly four independent signals. This is the real
  difficulty dial, not the size of the search space.
- **2026-08-06** Trace type is a visible identifier rather than a hidden fifth axis, because parallel
  puzzles that share resources multiply difficulty instead of adding it.
- **2026-08-06** Start at four values per axis and let the house growing widen the space toward
  Mastermind's 1296.
- **2026-08-06** The solver is the difficulty instrument. Difficulty gets measured, not argued.
- **2026-08-06** Single resource: warmth.
- **2026-08-06** The morning is a scene you look at, not a paragraph you read. Corrects an earlier
  design that put clues in menus despite the research saying to put them in the environment.
- **2026-08-06** Sound is a first-class channel, both for atmosphere and for carrying information.
- **2026-08-06** Cold reduces visibility of the morning scene, so the drain is felt rather than
  displayed. Flagged to watch against the anti-spiral rule.
- **2026-08-06** Stack revised to React for the book and setup screens, PixiJS for the room. The
  earlier React-only call assumed a game of tables and text.
- **2026-08-06** Decisions are not made on what would be fun to build. Recorded in the box above.
