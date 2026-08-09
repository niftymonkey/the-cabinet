# Housewarming

A cozy-but-dark incremental deduction game for the Spooky/Spoopy jam. It will ship as the first app in The Cabinet, see `docs/design/cabinet.md`.

The title reads three ways at once: warmth is the resource, the fiction is literally warming a house, and a housewarming is a friendly ritual with someone new in the house, which is the ending.

Rejected titles: *True Names* (not smart enough), *Journal of Spirits* (accurate but flat, and it puts the interface on the marquee instead of the feeling), *What the Night Leaves*, *Small Hours*. Journal survives inside the fiction, though. The book is the keeper's journal.

## What it is, in a paragraph

You have taken on a house that already has residents. You cannot see them. Each night you set up an experiment and go to bed, and each morning you look at what the night left behind. Every spirit has hidden traits, and each trait you confirm is a piece of its true name. Complete a name and you name the spirit, and a named spirit works the house whether it likes it or not. Spirits you have not yet named are loose, and loose spirits take from the house. The game is a race between what your named spirits produce and what your unnamed ones drain.

## The box

These are settled. Changing one is a real decision, not a tweak.

| Constraint | Value |
|---|---|
| Team | Solo (Mark). Everyone in the jam builds their own game. |
| Stack | Web, TypeScript. |
| Tone | Spoopy leaning dark. Not cute, not grim. |
| Art | Design routes around art. AI-generated art may fill space later, never load-bearing. |
| Writing | Minimal by design. Names and one-liners, never paragraphs. |
| Deadline | Halloween 2026 (Oct 31) is a **target, not a boundary**. Missing it costs a Discord post, not a redesign. What fixes the scope instead is completeness: the smallest version that goes start to finish and that the following year can build on without tearing up. |
| Availability | Hours are not the binding constraint. The risk is that the interesting part arrives too late, so get a crude playable build up early even if it is ugly. |
| Longevity | This is a project to keep building for a year, not a jam throwaway. |
| Decision rule | Decisions are **not** made on what sounds fun to build. Mark has been an engineer for thirty years, got into it wanting to be a game programmer, and has never made a game. The goal is a good game built properly, piece by piece. "Which part would you enjoy building" is explicitly out of the decision-making process. |

## The core loop

1. **Set up the night.** Choose a combination of offerings and conditions. Each setup costs resource.
2. **Sleep.**
3. **Look at the morning.** The room at dawn shows what happened. Not prose, a scene. See Presentation.
4. **Update the book.** Mark traits ruled in and out.
5. **Name it.** When a name is complete, name the spirit. It flips from the drain column to the production column.

## Why the two loops are one loop

This is the thing that makes the hybrid worth doing rather than two systems bolted together.

- Named spirits produce resource passively.
- Resource buys experiments per night.
- More experiments per night means faster deduction.
- Faster deduction means more named spirits.

The incremental curve is not a set of numbers we invented and tuned. It falls out of the deduction. Knowledge is the currency.

## Pressure, and losing

Without pressure, experiments-per-night is a convenience rather than a resource, and the incremental spine is decoration. Unnamed spirits drain the house every night. That creates:

- A reason to want more experiments per night.
- A race between two curves, production against drain.
- A losable game with no combat system, no health bar, no second system to build.

**Anti-spiral rule:** partial knowledge reduces a spirit's drain. Every confirmed trait pays off immediately, so a player who falls behind always has a way back. Without this the drain produces unrecoverable death spirals.

Losing the house is in scope for the Halloween build. Decided 2026-08-06.

## The frame: naming, and being the keeper

Two layers, deliberately two different words. Using one word for both is what made "binding" stop fitting once the ending turned warm.

**Naming is the action.** You complete the true name, so you name it. The mechanic and the verb are the same fact, no explanation needed, and the book is already a book of names. It is neutral in exactly the way the ending needs: you name a stranger to get hold of it, you name your aunt to acknowledge her, same word, entirely different weight, and the game never points at the difference. A spirit you have dealt with is **named**.

**Keeper is the role.** You keep the house. Your aunt was the last keeper, and the book is the keeper's book. Losing means the house stops being kept.

Rejected: *binding* (coercive, stopped fitting the tea ending), *keeping* as the action verb too (warmest option, but if keeping the house and keeping a spirit are the same word a player has to work out which one a button means), *taking in* (best tonal ambiguity, reads badly as an interface verb), *quieting* (sounds like killing).

The oldest rule in folklore is that knowing what a thing truly is gives you power over it. That does three jobs at once:

- It makes deduction the literal mechanism of power rather than mere research.
- It gives the game its central object: a book of names. Same logic grid underneath, much better thing to look at and to put on an itch page.
- It supplies moral texture for free. You are doing something slightly wrong to something that was here before you. Tone without words, which matters given the writing constraint.

Grounding the creatures in real folklore also means content is research and transcription rather than invention, which shrinks the writing job further.

## The four axes

The rule everything else follows from: **the spirit's traits and the player's controls are the same vocabulary.** If a spirit is drawn to something, the player must be able to set that thing out. Otherwise the trait exists but no experiment can test it and it is only noise.

| Axis | What it is | How the player controls it |
|---|---|---|
| **Hour** | When it is abroad. Dusk, midnight, the small hours, first light. | What is left burning and for how long. A candle burnt to a known height is both instrument and clock. |
| **Lure** | What draws it in. Milk, something sweet, something shiny, warmth, music, a smell. | Directly, by what is set out. |
| **Aversion** | What turns it away. Salt, iron, a mirror, running water, an open door. | By what is placed, and more importantly by what is left out. |
| **Haunt** | Which room it belongs to. | By where the night is set up. |

Those four decisions are the whole setup screen, and they are the whole name. A true name has four parts because a spirit has four traits, so the book entry and the setup screen mirror each other and neither needs explaining.

**Deduction.** Settled by the night contract (see the decision log, 2026-08-07): any experiment draws the room's spirit out at its hour, so each instrument reads one axis on its own. The trace pins the haunt, the mark on the candle dates the hour, the bowl confirms or refuses the lure, and a ward held or crossed rules the aversion in or out. The ambiguity that makes a careful experiment better than a random one lives in the setup: a short candle leaves the hour half dark, and a held ward blinds the bowl for the night.

**Submit whole names only.** Obra Dinn's rule. All four parts at once or not at all, so nobody brute-forces one axis at a time.

### Information density is the real difficulty dial

Structurally this is Mastermind. Four positions, N values, guess the code. Classic Mastermind is four positions and six colours, 1296 combinations, solvable in five guesses with optimal play.

The size of the space is not the problem. The feedback is. Mastermind returns roughly four bits a guess by reporting exact and partial matches. A morning that only says "something came" or "nothing came" is one bit, and 1296 possibilities at one bit a night is twenty or thirty nights per spirit, which is unbearable.

**So the morning report must carry four independent signals, not one.** Which room shows a trace. How far the candle burnt before it happened, giving the hour. Whether the lure was taken or refused. Whether something approached and turned back, giving the aversion. Roughly four bits, and the same space becomes solvable in a handful of nights.

Getting this right matters more than how many values each axis has.

### Numbers

Start at four values per axis, 256 names. The house growing adds values: opening the cellar adds a room, which widens an axis, which widens the space. But the space cannot grow far. With two or three openings of one axis each, the first spent on rooms and the hour axis able to widen at most once without leaving the night, it tops out near 4 by 6 by 4 by 7, roughly 670 names, not Mastermind's 1296. The ramp is not the search space. It is the economy tightening as the season turns, arrivals staggered so late spirits land mid-solve, and parallel loose spirits sharing the keeper's nights, with modest pool growth on top. The kernel already measured the economy as the difficulty dial (see the decision log, 2026-08-08).

Target, to be confirmed by the solver rather than argued about: first spirit in five or six nights, later ones in ten to twelve, and nothing the solver cannot crack without guessing.

### Trace type is a visible identifier, not a hidden axis

How a spirit marks a room (frost, damp, a sound, moved objects) is also how the player tells which spirit did it when several are loose.

Parallel puzzles multiply difficulty rather than adding it when they share resources, and ours share everything: the same rooms, the same nights, the same lures. Two loose spirits is considerably worse than twice one, because every night's setup serves two sets of constraints and every trace must be attributed before it means anything.

Keeping trace type visible is the scaffolding that lets two spirits stay two separate puzzles rather than collapsing into one entangled mess. Hiding it makes difficulty explode. Spirits should also arrive staggered rather than all at once.

### The solver is the difficulty instrument

The automated human-mimicking solver from the procgen research is not only a fairness check. It reports how many nights a generated puzzle takes to crack, which turns difficulty from a feeling into a number. Generate a thousand houses, run the solver, read the distribution, move the dials.

This matters because puzzle games are not Mark's genre and his own taste is not a reliable gauge. Measuring beats guessing here.

## Procedural generation

Spirits are rolled from trait pools at the start of a playthrough, not authored. This gives the replayability Mark wanted from the roguelite lane, and it makes content a data table rather than written creatures.

The Halloween build ships a deliberately dumb generator. All traits, pools, drain rates and generation rules live in data, not code, so the generator can be replaced later without touching anything else. Improving the generator is the main thing this project has to grow into over the following year.

## Scope sketch

Smallest shippable version: four trait axes with a handful of options each, six spirits, two screens plus the book.

## Why the player is here

One house, and it is yours. A relative you cared about left it to you. They died and nobody ever explained why.

You love the house. That is the whole motivation. You find out it is haunted and you stay anyway, because you are not going to be driven out of your own home. Naming is not survival and not a job, it is insisting on living somewhere.

The book was theirs. You find it in the intro, half filled, in their handwriting. It explains where the book came from, it teaches the player how naming works without a tutorial, and it gives the game's small allowance of flavour text a natural home in someone else's marginal notes.

Her last entry is unfinished, because she died before she could write it. Its job is to teach: it shows the keeper what the work is and how a name gets assembled, without a tutorial and without anyone explaining anything. Whatever she had already named counts for nothing. You start from scratch with her method in your hands.

### Who the spirits are

They are the keepers who lived in this house before you and failed. Each one lost, went cold, and stayed. That is why there are spirits here at all, why they drain warmth, and why the drain is the house asking for what it has always taken.

The fiction stays quiet about it. Their lures and aversions are folkloric rather than personal, which is not a compromise: they have been dead a long time and what is left is the folklore-shaped part rather than the person.

### The ending

She was doing exactly what you are doing. She lost, and because she lost she died, and because she died she is now another spirit in the house. Straight causality, no twist. She is the most recent of the line, not a special case and not secretly the last one all along.

So the name still missing from the book is hers, and she is the final entry. She is found the same way every other spirit is found. The weight comes from who she is, not from a different mechanism.

Intro lore, skippable with a keypress: she was found frozen solid in the middle of winter, which almost explains itself, except she was found inside the house. The mundane explanation is available and nearly holds. That plants the mechanic without teaching it.

**How her entry resolves.** Every stranger you take gets put to work. Her you take and she simply stays. The game never explains the difference. That is the tea scene, and it needs about two sentences.

Both readings of that scene are available for free and we do not have to pick. The warm one is that you got her back. The darker one is that a spirit cannot help draining, so keeping the house meant taking her the way you took the others, and you know what you did. Same two sentences either way.

**She is optional.** You can win the house without ever finishing her entry, and if you do, it is warm and empty. Finish it and it is warm and she is there. The good ending is earned rather than handed over, and it costs nothing to build, because she is just the last entry and the player is allowed to stop early.

**The coda.** The last loose name lands and the win plays whole: the house warm, quiet, yours, the drain visibly over. Then one choice, made once. Close the book and the run ends there, warm and empty. Stay, and nights continue into the coda: the economy is over, nothing drains and nothing yields, and what is left to burn is a fixed stock of candles, visible and counted, the same for every keeper who stays. Only now can her trace appear. Her page opens at her sighting like any other spirit's, her name is submitted whole like any other, and a wrong name burns candles, priced so a guess is never cheaper than a night of testing.

**Three ways out of the coda.** Naming her is the earned ending. Stopping is offered every coda morning, and the last candle stops it for you. Not finding her is one outcome, warm and empty, staged by how it arrives; running out carries no loss framing, because the win is never revocable and staying is pure upside.

**She is findable, guaranteed.** In every generated house her name is reachable within the stock with room to spare, a generator invariant the solver verifies per house, the same standing as rooms outnumbering the roster.

### Losing: the exit that closes

Cold has stages. Partway down, a **Leave** action appears in the interface. One or two stages further down it is gone, greyed out, too cold to get packed and out. The game visibly offers you the exit and then takes it away, in front of you, while you are deciding whether one more night is worth it.

The beat this exists for: you are packed, you leave tomorrow, and you could try one more experiment tonight. Take it and you might save the house. Take it and miss and you are past the threshold.

So the player can die of cold, the same way she did. This is deliberately not carried by prose. An earlier version had the player merely evicted, with the "she could have left and wouldn't" point delivered in writing. Mark rejected it because it needs good writing to land. Turning it into a mechanic means the player nearly repeats her death themselves and understands it without being told.

### Winter is the difficulty ramp

Play runs through autumn into winter and the drain worsens as the season turns. Not a countdown, just a race that keeps tightening, which gives escalation without a timer. It also places Halloween in the middle of the game rather than at the end, which suits the jam.

### What that buys mechanically

- **The loss condition is losing the house.** Not death. If the drain wins, the place becomes unlivable and you move out. Crueller than dying and it fits the tone.
- **The drain has a face.** Unnamed spirits make the house cold, damp, dark. You are fighting to keep somewhere habitable, which motivates the economy without a word of explanation.
- **There is an authored ending on a procedural body.** The endgame is finishing the entry they did not finish. The middle of the game is generated, the last spirit is written. Cheap, and it gives the mystery an answer.

## Presentation

This section corrects an earlier mistake. The deduction research said clues belong in the environment rather than in menus, and the design went ahead and put them in menus anyway. Mark pushed back that a game made of text would not hold him, which was right.

### The morning is a scene, not a paragraph

The four signals the morning has to carry become four things you can **see** in the room at dawn.

- The candle burnt down to a height, giving the hour.
- Frost across the window, or not.
- The bowl tipped, licked clean, or untouched, giving the lure.
- The salt line scuffed or intact, giving the aversion.

Same four bits of information, no prose. This is what Obra Dinn and Golden Idol actually do: present a static scene as pure evidence and let the player draw the conclusion without narration.

**The art cost is smaller than it looks.** It is one room, seen every single morning, with a small set of swappable states per detail. A background plus overlays. That amortises across the whole game and it is exactly the sort of job AI-generated art handles well.

### Sound is the third channel

Neither text nor art, and by the research it is at least half the horror experience. It is also the best atmosphere per unit of effort available to us.

- An ambient drone as the base layer, semi-random creaks and drips over it, silence used as contrast so a stinger lands.
- And it presents information the morning already carries: the night's scenes given a voice. Sound never adds a signal of its own, and an unwatched room shows nothing ever, by the night contract, so nothing is heard from a room the keeper did not rig.

### Darkness is the atmosphere, not the information

The research says darkness is the strongest atmosphere tool because it restricts what the player can see, and our resource is literally warmth and light, so the temptation was to let the cold darken the morning until it could not be read.

Decided against (2026-08-08, closing ticket #16): the economy already throttles information through what a cold keeper can afford to watch, so degrading legibility would tax the losing player twice through the same resource, exactly what the anti-spiral rule exists to prevent. The cold is felt as vignette, palette, frost and sound, and every signal the keeper paid for stays readable at any warmth.

### Stack, revised

React alone was the right answer for a game of tables and text. It is the wrong answer for an inspectable scene with a light radius, a guttering candle and frost creeping across glass.

- **React** owns the book and the setup screens. Those genuinely are grids and forms.
- **PixiJS** owns the room. This is the hybrid the original stack research described: DOM as the UI layer, canvas as the world layer, and no React re-render driving the frame loop.
- **Not Phaser**, which is built for worlds with physics and movement we do not have.

## The resource: warmth, and only warmth

Setting up a room costs warmth, because it has to be kept lit. Unnamed spirits drain warmth. Named spirits produce it. Too little warmth and the Leave action appears, then disappears.

One number runs the entire economy. The fiction and the mechanic are the same thing again, and the title is about it.

## Open questions

These are charted as tickets on the Wayfinder map, [Housewarming: the way to a buildable spec](https://github.com/niftymonkey/the-cabinet/issues/1), which is where they get worked and where their answers land. The map is the live list; what follows is the standing summary.

- Exactly how the house expands, and which axis each new area widens.
- Who she was to Mark. "Favourite aunt" is the placeholder. It is the difference between the ending being sad and being merely tidy.
- Values per axis at each stage, pending the solver.
- What a night sets and what a morning gives back, precisely enough to write a resolver against.
- Whether a morning carrying four signals is actually enough. Only the solver answers this.
- What the morning looks like as a visual vocabulary, and what the setup screen is.

## Pacing, and why there is no prestige layer

The incremental research says prestige resets are load-bearing for pacing. That advice is written for idle games with infinite runtime. This one has an ending, and the two games the same research names as the most memorable in the genre, Universal Paperclips and A Dark Room, have no prestige layer at all. They pace on unfolding instead: new mechanics and new areas appear as you progress.

So the house does the pacing. It opens up as you name. The cellar, the attic, the room that was always locked. Each new area brings new trait axes, which raises the ceiling on deduction difficulty and keeps the vocabulary growing. That is the unfolding pillar, and it fits a single house that you love and are slowly taking back.

Proposed rather than settled. Revisit if the middle of the game goes flat.

## Explicitly not doing

- No run-and-reset roguelite structure. Procedural content gives the replayability; runs and deaths fight the tone. Revisit only if the drain mechanic fails to create tension.
- No combat, no health bar. Losing comes from the economy.
- No map or location placement. That was the cryptid-field-guide version and it costs interface we do not need.
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
- **2026-08-06** One house, and it is the player's own. Rejected house-after-house, which would have made procedural rerolls diegetic but cost the attachment that makes cozy work.
- **2026-08-06** The player stays because they love the house, not to survive and not for pay.
- **2026-08-06** The book belonged to a relative who died unexplained. "You are not the first."
- **2026-08-06** Losing means losing the house and moving out. Nobody dies.
- **2026-08-06** No prestige layer. The house expanding is the pacing mechanism instead.
- **2026-08-06** The final spirit is the relative herself. Mark's idea, replaced a weaker version where you merely finished the monster she had been working on.
- **2026-08-06** She froze inside the house in winter. Cold is both the backstory and the mechanic.
- **2026-08-06** Autumn into winter is the difficulty ramp. No countdown timer.
- **2026-08-06** The player can die of cold. Losing is not eviction. The Leave action appears as the house cools and disappears when it gets too cold, so the choice is mechanical rather than written.
- **2026-08-06** Ending: taking her lets her stay rather than putting her to work, and she is optional so the good ending is earned.
- **2026-08-06** Core action is **naming**, the role is **keeper**. Replaced "binding", which had gone coercive in a way the ending no longer supports.
- **2026-08-06** Title: **Housewarming**.
- **2026-08-06** Four axes: hour, lure, aversion, haunt. Each pairs with a player control, because a trait no experiment can test is only noise.
- **2026-08-06** The morning report must carry roughly four independent signals. This is the real difficulty dial, not the size of the search space.
- **2026-08-06** Trace type is a visible identifier rather than a hidden fifth axis, because parallel puzzles that share resources multiply difficulty instead of adding it.
- **2026-08-06** Start at four values per axis and let the house growing widen the space. Rewritten 2026-08-08: the original target of growing toward Mastermind's 1296 cannot hold against openings widening exactly one axis each; the reachable space tops out near 670, and the ramp is the economy, arrival stagger, and parallel loose spirits with modest pool growth.
- **2026-08-06** The solver is the difficulty instrument. Difficulty gets measured, not argued.
- **2026-08-06** Single resource: warmth.
- **2026-08-06** The morning is a scene you look at, not a paragraph you read. Corrects an earlier design that put clues in menus despite the research saying to put them in the environment.
- **2026-08-06** Sound is a first-class channel for atmosphere, and it presents scene data the morning already shows rather than carrying signals of its own. Rewritten 2026-08-08: the original line promised sound as an information carrier one day before the night contract made an unwatched room show nothing, ever.
- **2026-08-06** Cold reduces visibility of the morning scene, so the drain is felt rather than displayed. Flagged to watch against the anti-spiral rule.
- **2026-08-06** Stack revised to React for the book and setup screens, PixiJS for the room. The earlier React-only call assumed a game of tables and text.
- **2026-08-06** Decisions are not made on what would be fun to build. Recorded in the box above.
- **2026-08-06** Halloween 2026 is a target rather than a boundary. What fixes the scope instead is the smallest version that goes start to finish and that the following year can build on without tearing up. Reverses the deadline's status in the constraints box, which had it as settled and was shaping decisions accordingly.
- **2026-08-06** One playthrough is one sitting, roughly an hour, thirty to fifty nights, a night being a fast decision well under a minute. A single automatic save slot, no save management. The save carries a version number from the first day it exists, because a year of adding rooms, axes and spirits changes its shape and without a version every addition silently breaks an in-progress run.
- **2026-08-06** The house opens a small known number of times, two or three, triggered by naming rather than by a date, each opening widening exactly one axis.
- **2026-08-06** The roster is finite, rolled at the start, and its size is visible from the beginning. Winning is naming all of them, which ends the drain. Her entry then becomes available as the last one, and is optional.
- **2026-08-06** The spirits are the keepers who lived in this house before you and failed. She is the most recent of that line, not a special case. Mark's idea, and it answers a question the design had never answered, which is why there are spirits here at all.
- **2026-08-06** Cut "she is deduced from her own book rather than from traces". She is found the same way as every other spirit. That line handed her a bespoke final mechanic in the same section that insists there is no twist, and it had been recorded more firmly than it was landed.
- **2026-08-06** A trait is an id plus presentation, and the generator, resolver and solver only ever touch the id. This keeps open the year-two option of writing personal stories behind the folklore pools at zero mechanical cost. Those stories must explain why a keeper is drawn to a **shared** lure; a bespoke lure only one spirit could hold would make finding the lure identify the spirit, and the deduction would collapse.
- **2026-08-06** Prototypes are kept rather than thrown away, in `apps/housewarming/prototypes/`, each with a README naming what it decided. They get shared with playtesters, and being able to re-run the basis of a decision has value.
- **2026-08-07** The night contract, from its Wayfinder ticket. An experiment is a room, a candle, a lure, and optionally a ward, at most one experiment per room, and each watched room resolves independently of the others.
- **2026-08-07** The candle is chooser and recorder at once: the keeper buys a length of one to four watches priced in warmth, and the flame takes a mark at the watch of a spirit's approach, which is the morning's clock. Real candle clocks, marked candles read by burnt height, are the historical instrument behind it.
- **2026-08-07** Any experiment draws the room's spirit out at its hour, whatever the lure. The lure is required and tests preference rather than gating the visit; the ward is optional. A room with no experiment shows nothing, ever, so an unwatched room is silent by rule and "nothing happened" is never ambiguous.
- **2026-08-07** No wandering. A visit always happens in the spirit's haunt, so a single trace pins the haunt axis. The "or it wanders" clause is gone from the deduction paragraph, which was rewritten to match the contract.
- **2026-08-07** A held ward turns the spirit back at the room's boundary, visibly, the trace stopping at the line. The bowl goes untested rather than refused that night. Whether holding a ward pays anything beyond information belongs to the warmth economy ticket.
- **2026-08-07** The bowl has two physical states, taken or untouched, and three meanings by context: refused when a trace is inside, untested when the trace stopped at the ward, nothing came when there is no trace.
- **2026-08-07** A trace kind is unique to its spirit and is the spirit's identity in the book, carrying no trait information, and it is never a state of an instrument or of the house's cold. Frost and damp are reserved for the cold itself, which corrects their double-booking as both drain presentation and trace candidates.
- **2026-08-07** No two loose spirits hold the same haunt at the same time, enforced by generation. Every watched room is one spirit's story per night, which keeps every instrument attributable without a who-did-it puzzle.
- **2026-08-07** The morning is one of three scenes per watched room: silent, turned back, or came in. The signal count varies by scene, and the full four arrive when a spirit walks into a fully rigged room.
- **2026-08-07** The paper prototype answered its ticket: the morning tells you enough, and the night contract survived contact with play unchanged. By hand, one spirit fell in 4 nights and two spirits in 6 to 8, inside the provisional targets, with no run needing a guess, and two loose spirits stayed two separate puzzles behind their visible traces. Free naming attempts invited brute force on the last trait and a provisional economy stopped it in one run, which is now the warmth ticket's evidence that naming must cost something. The teaching, working-memory, and composed-name findings about the book are recorded on the map's book question. The prototype is kept in `prototypes/morning-signals/`, playable in a browser.
- **2026-08-07** The night cannot be sliced finer than four without inventing. The four-part night the design assumed, dusk, midnight, the small hours, first light, turns out to be the Roman four watches and is genuine practice rather than modern convention, named in one line of Mark 13:35 and standard across western Europe for two thousand years. But four is the ceiling: folklore's boundaries are sunset, midnight, first cockcrow and dawn, all observable events, and nothing divides them further. The only honest widenings take the axis out of the night entirely, and folklore offers two, noon as a dangerous hour rather than a safe one and the eve carrying the day. This bumps against the decision above that each opening widens exactly one axis, because hour can only be widened once before it stops being about night. From ticket #7, and the sourcing is in `docs/research/folklore-pools.md`.
- **2026-08-08** A spirit's evidence begins the night its trace first appears, not the night it arrived. Rooms watched and found empty before it moved in say nothing about where it lives, and counting them against it ruled a late arrival out of its own room and left it with no name that fitted at all. The book therefore opens a spirit's page on first sighting. From ticket #11, where it was a real bug that every unit test passed straight through.
- **2026-08-08** The book narrows a spirit against the pools that were open at the stage it arrived, not the wider ones now visible, so a page already solved stays solved when the house opens. A room sealed until tonight cannot hold what has been knocking since the first week, and the fiction carries that without a word of explanation. Mark's call, from ticket #11.
- **2026-08-08** The morning is not the difficulty dial. Measured against the kernel, a keeper with no strategy at all cracks the opening three spirits in five to nine nights watching every room, and twenty to thirty-six at one room a night. What the keeper can afford to watch is what sets difficulty. The feedback-density hypothesis above holds and is no longer the interesting half of it; the warmth economy is. From ticket #11.
- **2026-08-08** The trace pool carries no design inventions, settled by the night contract rather than by taste. A trace may never be a state of an instrument or of the house's cold, which excludes frost and damp on independent grounds, along with the candle burning blue, the bowl taken, the fire out and water used. From ticket #11, closing the question `docs/research/folklore-pools.md` left open.
- **2026-08-08** Drain relief is priced from the evidence, never from the keeper's marks. A trait counts as ruled in for the economy when the mornings leave one value standing on its axis, so the book stays the keeper's working memory and marking it cannot be gamed for warmth. From ticket #11, where the kernel embedded the call before the log recorded it.
- **2026-08-08** No save obfuscation and no local anti-cheat, ever. Client-side secrecy is unwinnable, wrong names already cost warmth, and a readable plaintext save is a debugging and fixture feature. Recorded so it is never re-argued. From the three-lens review.
- **2026-08-08** Cold does not degrade the morning's legibility. The economy already throttles information through what a cold keeper can afford to watch, so darkening the scene would tax the losing player twice through the same resource, against the anti-spiral rule. The atmosphere survives whole as vignette, palette, frost and sound. Reverses the 2026-08-06 line above and closes ticket #16; #17's art never draws illegible states.
- **2026-08-08** No per-value morning art. The night contract made scene states generic (mark heights, bowl taken or not, trace stopped at the line or crossing it), so the only art that scales is one trace kind per spirit and the setup screen's lures and wards, both bounded. Drawing per-lure or per-ward states would re-couple art cost to pool width. From the three-lens review.
- **2026-08-08** The ending is played, confirmed from the field of four shapes. Her entry is earned through nights like every other, in a bounded coda after the win, against her sitting in the roster, being handed over as a reveal, or completing from gathered evidence as a reading. Spiritfarer ends by turning the game's one verb on the person the game is about, and Obra Dinn withholds its final chapter until the investigation is over, so both halves of the shape are proven. From ticket #22, pressure-tested before #12 and #15 bake the end condition into code and prices.
- **2026-08-08** Her page obeys the sighting rule like every other spirit's: during the run the book holds pages only for spirits whose traces have appeared, and hers opens the coda night her trace first does. Her presence before that is the book itself, her hand in the margins. This is the book ticket's N-versus-N+1 answer, and the answer is N. From ticket #22.
- **2026-08-08** The win plays whole before the coda is offered: house warm, quiet, drain visibly over. Then one choice, made once, close the book or stay. Closing is the warm-and-empty ending and cannot be reopened, because every night all run is spent or lost, never undone. The offer's single line in her hand is #5's to write. From ticket #22.
- **2026-08-08** The coda runs on a fixed stock of candles, visible and counted from its first night, never converted from remaining warmth. Conversion would hand the shortest coda to the keeper who scraped through, the player the ending would hit hardest, and would invite hoarding warmth to buy ending. The number is #15's to measure. From ticket #22.
- **2026-08-08** A wrong name in the coda burns candles, priced so a guess is never cheaper than a night of testing. The paper prototype's naming-must-cost-something rule carried into the coda's only currency; whole-name submission holds unchanged. From ticket #22.
- **2026-08-08** Not finding her is one outcome, warm and empty, staged by how it arrives: the book closed by choice, offered every coda morning, or the last candle guttering. Running out is never a loss and the win is never revocable, or the coda rebuilds the ending-resentment trap it exists to avoid. From ticket #22.
- **2026-08-08** She is findable within the stock in every generated house, a generator invariant the solver verifies per house. The solver also measures nights-to-find-her so the stock lands where honest but imperfect play usually succeeds and a patience grind never pays. From ticket #22.
