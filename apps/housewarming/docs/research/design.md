# Research

Done 2026-08-06 via Exa. Each finding is followed by what it means for this specific game, because
the finding on its own is not the useful part.

## Game design fundamentals

The core loop is the heartbeat: a repeatable activity tied to a player motivation. The MDA framework
splits a game into mechanics (rules and data), dynamics (what happens at runtime) and aesthetics
(what the player feels). Meaningful choice needs four things: the player is aware of the choice, it
has gameplay consequences, they are reminded of past decisions, and the consequences are permanent.

**For us:** our loop is set-up, sleep, read, deduce, bind, and the motivation is curiosity. The book
of names is what satisfies "reminded of past decisions" and "permanence" in one object, which is
another reason it should be the centrepiece rather than a menu.

## Incremental and idle games

Three pillars come up repeatedly.

**Meaningful decisions.** Resources must be limited enough that the player chooses what to buy
rather than walking a fixed upgrade path.

**Unfolding mechanics.** Universal Paperclips and A Dark Room are remembered because new features,
mechanics and narrative shifts appear as you progress. The game evolves rather than just climbing.

**Prestige systems.** Resets are considered crucial for pacing. Restart with a multiplier, growth
resets to a manageable range, the player ladder-climbs. Convention is a fractional exponent such as
a square root for the prestige currency.

Also: always give a clear reachable next goal, and make sure each new system adds value rather than
bloat.

**For us:** the first two we already have. Limited nights and limited setups per night force
choices, and unfolding is what unlocking new experiment types gives us.

Prestige is the interesting one, because we deliberately cut the roguelite reset. This is a real
tension worth naming: the incremental literature says resets are load-bearing for pacing, and we
removed them on tone grounds. Our procedural reroll is the natural place for a prestige layer if we
want one, because clearing or losing a house and taking something into the next one is exactly a
prestige loop wearing different clothes. Flagged as an open question rather than a decision.

## Deduction game design

**Staged disclosure.** Clues live in the environment, not in menus.

**Obra Dinn's lock-in rule.** Fates only confirm when three correct entries are made at once. The
player cannot brute-force one answer at a time, and the confirmation validates their reasoning
method without pointing at the answer.

**Golden Idol's friction.** Small obstacles in front of hints exist specifically to discourage
impulsive guessing.

**Visual clarity.** A consistent style that highlights what matters and hides distractions.

**Iterative playtesting** is what actually separates a logical deduction path from an arbitrary one.

**For us:** the lock-in rule is the strongest thing in this whole document and we should steal it
directly. Binding should require completing a whole name at once, not confirming traits one at a
time. Otherwise a player brute-forces each trait individually and the deduction collapses into
guess-and-check. This is a concrete mechanic, not a principle, and it costs almost nothing to build.

The playtesting note is the uncomfortable one given inconsistent weeks. It argues for getting a
crude playable build up early and ugly rather than building well and playing late.

## Procedurally generating solvable deduction puzzles

The standard pipeline:

1. Generate a random valid solution first.
2. Enumerate all possible clues that solution could produce.
3. Use a constraint solver to select a minimal subset of clues that narrows the space to exactly one
   candidate.
4. Verify uniqueness by asking the solver to enumerate all solutions. If more than one, add clues
   until only one remains.
5. Run an automated solver that mimics human reasoning, and reject any puzzle that requires
   guessing.

**For us:** this is directly usable and it is the recipe for our generator. Step 5 is the part that
makes puzzles feel fair, and it is also the part that can be improved indefinitely over the next
year, which is exactly the growth story we want.

Note the ordering: solution first, clues second. Our instinct would be to roll spirits and then see
what traces they produce, which is the same thing said differently, but the solver step is where
fairness actually comes from and it does not happen by accident.

## Puzzle difficulty and complexity

Researched 2026-08-06, prompted by Mark pointing out that puzzle games are not his genre and his own
taste is not a reliable difficulty gauge.

**Mastermind as the benchmark.** Search space size does not map linearly to guesses needed. The
standard six-colour four-position game is 1296 combinations and solvable in five guesses. Nine or
ten colours needs seven. No simple formula connects total codes to guesses, because the structure
and symmetry of the code space matter.

**Difficulty is measured in logic operations.** Puzzle difficulty is effectively the number of
solver loops needed. Cognitive difficulty tracks the informational content of the feedback and the
number of hypotheses a player must hold at once. Step dependency, whether a step can be solved
independently or needs a specific sequence, predicts human performance better than step count.

**Parallel puzzles multiply rather than add** when they force players to juggle shared resources, a
common grid, shared letters. The shift from additive to multiplicative happens when a single guess
has to satisfy multiple independent constraints. Tuning means limiting how many elements are in play
at once, or providing scaffolding that steers toward the easier deductions without trivialising
them.

**For us:** three things came out of this.

Our design is Mastermind wearing folklore. That gives a known benchmark instead of guesswork.

But our feedback channel is far thinner than Mastermind's. Mastermind returns about four bits a
guess. A binary "something came or did not" is one bit, and one bit a night against 1296
possibilities is twenty to thirty nights per spirit. So the morning report has to be engineered to
carry roughly four independent signals. Feedback density, not space size, is the difficulty dial.

And the shared-resource warning lands directly on multiple simultaneous spirits, which share rooms,
nights and lures. That is why trace type stays a visible identifier rather than a hidden axis:
visible traces keep concurrent spirits as separate puzzles instead of one entangled one.

## Solo jam scoping

Scope creep is the named primary cause of failure. The advice: define the one-sentence core loop and
the hook first. Sort features with MoSCoW (must, should, could, won't). Build the MVP with
placeholders to prove the loop is fun before building anything properly. Then a vertical slice at
near-final quality to learn what production actually costs. Pre-commit a cut order before the
deadline stress arrives. Reserve at least twenty percent of the time for shipping work: the build,
testing it, writing the page.

**For us:** the pre-committed cut order is the piece worth acting on, given weeks that vanish
without warning. Deciding now what gets dropped means a bad October does not turn into a decision
made in a panic.

## Atmosphere on a small budget

Researched 2026-08-06, prompted by Mark asking whether the concept transcends its text-and-reading
core, since he is not much of a reader.

Atmosphere is a technology of space and sound and relies on restraint rather than high-fidelity
assets. Lighting and geometry are the delivery system: keep view distance short, because darkness
restricts information and makes players fear what they cannot see. Sound is at least half the horror
experience. Establish an ambient drone, layer semi-random environmental noises like creaking and
dripping, and use silence as contrast so event stingers land. For creatures, prefer silhouettes and
irregular movement over detailed animation, since ambiguity disturbs more than realism. Test the
core loop in a single room with one mechanic before expanding.

## Visual clue design

Deduction games convey information by making observation the mechanic. They present static scenes,
frozen moments, where the environment is the evidence. Players decode them through specific visual
markers: clothing, position, props. Golden Idol has players collect keywords from objects to
populate a logic interface. Obra Dinn's 1-bit style strips everything to essential shapes so details
like fabric and accessories carry the load. The common thread is a clinical space of pure facts with
no narration, and progress gated behind committing to an answer the game then confirms or rejects.

**For us:** these two sections together are why the morning became a scene rather than a paragraph,
why sound became a first-class channel, and why cold now reduces visibility. See Presentation in
`../design/game-concept.md`. The earlier design had the research in hand and did not apply it.

## Stack

For a UI-heavy 2D browser game, plain React is enough when the game is primarily menus, tables and
text. Use a canvas engine (Phaser for batteries-included, PixiJS for a lightweight renderer) only
for a real-time world layer, and never drive a high-frequency game loop through React re-renders.

**For us:** this game is a porch, a morning readout and a book. That is menus, tables and text.
React is sufficient and no canvas engine is needed for the Halloween build. If atmosphere later
wants a rendered porch scene, PixiJS can be added as a world layer behind the DOM without rewriting
anything.
