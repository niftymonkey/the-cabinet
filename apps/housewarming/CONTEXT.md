# Housewarming

A house with hidden residents. Each night the keeper sets out experiments and each morning reads
what the night left behind, working out the four traits that make up each spirit's true name.
Warmth is the only resource, and the game is a race between the spirits that have been named and
the ones that have not.

## Language

### The house and the keeper

**Keeper**:
The role the player occupies. The person who keeps the house.
_Avoid_: player character, owner, protagonist, hero.

**House**:
The single dwelling the game takes place in. Rooms open up over the course of a playthrough.
_Avoid_: level, map, mansion, manor.

**Room**:
One named space in the house. The set of rooms is also the set of values on the haunt axis.
_Avoid_: area, zone, location, tile.

**Book**:
The keeper's book of names, inherited half filled from the last keeper. Where traits ruled in and
out are recorded and where a name is submitted. The fiction may call it a journal; the interface and
the code say book.
_Avoid_: journal, log, notebook, grid, notes.

**Last keeper**:
The relative who kept the house before the player, died in it, and left both the house and the book
behind. The most recent of the line of failed keepers, not a special case. Her relationship to the
keeper is not yet decided.
_Avoid_: aunt, previous owner, the dead woman.

### The spirits

**Spirit**:
One of the house's hidden residents. Holds exactly one trait on each of the four axes. Every spirit
is a keeper who lived here before and failed, which is why they are here and why they take warmth.
_Avoid_: ghost, monster, creature, entity, haunt.

**Axis**:
One of the four dimensions a spirit's traits are drawn from: hour, lure, aversion, haunt. Every axis
pairs with something the keeper can set, because a trait no experiment can test is only noise.
_Avoid_: dimension, category, slot, column, field.

**Trait**:
The one value a spirit holds on a given axis.
_Avoid_: attribute, property, stat, characteristic.

**True name**:
A spirit's four traits taken together. Submitted whole or not at all.
_Avoid_: solution, answer, code, combination.

**Hour**:
The axis for when a spirit is abroad. Dusk, midnight, the small hours, first light.
_Avoid_: time, phase, window, shift.

**Lure**:
The axis for what draws a spirit in, and the word for the thing itself when the keeper sets one out.
_Avoid_: bait, offering, attractant, treat.

**Aversion**:
The axis for what turns a spirit away.
_Avoid_: weakness, fear, repellent, bane.

**Ward**:
The thing the keeper places to test an aversion. A ward is what you put down; an aversion is what
the spirit holds. They are only the same when the guess is right.
_Avoid_: protection, charm, barrier.

**Haunt**:
The axis for which room a spirit belongs to.
_Avoid_: home, nest, territory, lair.

**Trace**:
What a spirit leaves in a room overnight. Its kind (frost, damp, a sound, moved objects) is openly
visible and identifies which spirit left it, so it is never a hidden fifth axis.
_Avoid_: clue, evidence, sign, mark, tell.

### Naming

**Naming**:
Submitting a complete true name for a spirit. The action and the mechanic are the same word.
_Avoid_: binding, capturing, quieting, taking in, solving, catching.

**Named**:
A spirit whose true name has been submitted correctly. A named spirit works the house and produces
warmth.
_Avoid_: bound, caught, tamed, solved, captured.

**Loose**:
A spirit not yet named. A loose spirit drains warmth, and each of its traits the keeper has ruled in
reduces that drain.
_Avoid_: unbound, unnamed, free, wild, unsolved, active.

### The cycle

**Night**:
One turn. The keeper places experiments, then sleeps.
_Avoid_: turn, day, round, cycle.

**Experiment**:
One configured test placed for a night: a room, a lure, a ward, and a candle. Costs warmth, and how
many fit in one night is the thing the economy is buying.
_Avoid_: setup, attempt, trial, run, guess.

**Candle**:
What is left burning in a room. Both the light an experiment needs and the clock that dates
whatever happened, because it burns to a readable height.
_Avoid_: lamp, timer, light.

**Morning**:
The scene the keeper looks at after a night. Evidence, never narration.
_Avoid_: result, report, outcome, summary, aftermath.

**Signal**:
One independent piece of information the morning carries. A morning carries roughly four, and that
density rather than the size of the search space is what makes the game solvable.
_Avoid_: bit, clue, hint, feedback, datum.

### Warmth

**Warmth**:
The only resource. Spent on experiments, produced by named spirits, drained by loose ones.
_Avoid_: heat, energy, fuel, currency, resource, points.

**Drain**:
Warmth taken by loose spirits each night, worsening as the season turns from autumn into winter.
_Avoid_: decay, upkeep, tax, cost.

**Leave**:
The action offered once warmth falls past a threshold and withdrawn once it falls further. Taking it
ends the run; being too cold to take it is how the last keeper died.
_Avoid_: quit, escape, flee, abandon, give up.

### Generation and tuning

**Pool**:
The set of values available on one axis at a given point in a playthrough. Widens as the house opens
up.
_Avoid_: options, choices, table, deck.

**Generator**:
What rolls a playthrough's spirits from the pools. Its rules live in data rather than code so it can
be replaced without touching anything else.
_Avoid_: procgen, roller, spawner.

**Solver**:
The automated player that reports how many nights a generated house takes to crack. It exists to
turn difficulty into a measured number rather than a matter of taste.
_Avoid_: bot, AI, validator, checker.

**Prototype**:
A kept artifact built to answer one question, living in `prototypes/` with a README naming what it
decided. Deliberately not production code, and deliberately not deleted, because prototypes get
shared with playtesters and the basis of a decision is worth being able to re-run.
_Avoid_: spike, demo, throwaway, POC.
