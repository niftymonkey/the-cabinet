# Slice 9: the grave grows smoothly, and its blinking border is gone (design record R-next)

Follow-along row 9: "The grave swells up as you eat instead of sitting still and then jumping when a feast lands, and the blinking border round it is gone."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. This entry is the planning half of the flow: the definition, the verification steps, the seams, the module boundaries and the test list are all below. Your scratch folder is `local/148-slice-9/` in the worktree. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`.

Line numbers were read on the tree at `42cfa0b569` with slice 7's work uncommitted in it. **The name beside a number is what binds**: where a line has moved under you, find the named thing and work on that. Three files this entry names are being changed by other slices in flight, so they are cited by name only and never by line: `src/game/events.ts`, `src/game/invariants.ts`, `src/app/screens/game/GameScreen.ts`, `src/app/screens/ReplayScreen.ts`, `src/app/palette.ts` and `src/app/__tests__/palette.test.ts`. If a fact this entry states about any file is false, stop and report with the file and the name.

## What this slice builds, and why

Mark played the deployed build on 2026-09-21 and ruled two things. In his words:

> "One thing that you claimed to have fixed was the ability for the grave to gradually increase from min to max size as you eat corpses. That is not happening." And: "it used to grow gradually and then it stopped doing that. It started staying at basically the same size until it reached a certain point and they would pop into a larger state. That is what is happening right now."

> "now occasionally you do this weird blinking border. That also needs to go. I don't even know what that's for", then "we already have a different indicator that shows when the belch is full so let's get rid of that blinky border."

Both are rulings. This slice builds them. It does not argue them, offer alternatives, or weigh an earlier decision against them.

The measured cause of the first one is not the drawing. A probe over 1,009 frames of a replay of `local/148-won-tape/3000.tape` found the drawn width equal to the sim's size on every frame, with no mismatch, and the largest frame-to-frame change outside a feast was 0.22 units. The cause is in the growth numbers. A trash corpse pays `TRASH_CORPSE_PAYOUT`, which is `(SIZE_CEILING - SIZE_START) / CORPSES_TO_CEILING` = 40.5 / 400 = 0.10125 size units (`src/game/tuning.ts:104`, `:107`). A feast pays `FEAST_PAYOUT`, which is `300 * TRASH_CORPSE_PAYOUT` = 30.375 units (`:118`), 75% of the whole climb from the starting size to the ceiling, all of it on one tick. On that same won tape the size went 31.26 to 61.64 in one frame, then 61.64 to 67.5 in one frame a little later. That is the pop he saw, and the dribble between the pops is the corpse.

When this slice works, a player sees:

- A feast swallowed is a swell the player watches the grave take in over about a second, never a jump between two frames.
- Mowing plain corpses visibly grows the grave over a stretch of play, and the size on screen reads as how much has been eaten.
- A hit still shrinks the grave at once, on the tick it lands.
- No border round the grave lights up or blinks at any charge. The belch button is the only thing that says the belch is loaded.
- Nothing about the belch itself changes: the reservoir fills at the same rate, a feast still slams it full on the swallow, and the splash is unchanged.

## The shape of the change

Three parts, and they are one commit.

**Part A, the grave takes its growth in over time.** A swallow pays growth into growth the grave owes itself, and the grave takes it in at a rate per tick. It is in the rules and not only in the drawing because ADR 0003 makes the drawn grave the hitbox, so the drawing must never lag or lead the box. The payment still lands on the tip tick exactly as R2 says: the grave is owed it at once, the reservoir is charged at once, the score overflow is paid at once, the offer resolves at once. Only the size catches up.

**Part B, the feast comes down and the reservoir is untouched.** The feast's growth goes back to 4.55625 size units, which is what it paid on the day Mark ruled it, and its reservoir charge stays the reservoir's whole capacity, so the belch behaviour does not move by one event. The arithmetic and the sources are under "The values" below.

**Part C, the glow goes.** Every part of it, with a test that fails if it comes back.

## Part A: the rules, exactly

### The grave's new field

`Grave` (`src/game/grave.ts:40-56`) gains one number:

```
// Growth the grave has been paid and has not yet taken in (design record R-next).
owed: number;
```

`createGrave` (`:74-84`) sets it to 0.

The glossary gets the word. `apps/hungry-grave/CONTEXT.md` gains **Swell**: the grave taking in the growth a swallow paid it, over the ticks after the tip, so that no swallow ever pops. The branch charter pre-authorizes glossary edits. Every public seam below carries that word or the words the glossary already has.

### Paying growth

`growGrave` (`src/game/grave.ts:156-162`) keeps its name and its signature and stops writing `size`:

```
const growGrave = (grave: Grave, amount: number): number => {
  const room = Math.max(0, SIZE_CEILING - (grave.size + grave.owed));
  const taken = Math.min(amount, room);
  grave.owed += taken;
  return amount - taken;
};
```

Two consequences to get right, and both are named in the tests:

- The overflow past the ceiling is still decided on the tip tick and still returns the same figure it returns today, because the room is measured against the size plus what is already owed. `swallow` (`src/game/swallow.ts:161-170`) pays it into the score on that tick, unchanged.
- `containGrave` and the score rung move out of `growGrave` and into the swell, because that is where the size actually changes. `SCORE_RUNG_REARM_SIZE` (`:144`) and the rule that reads it keep their home in this module.

### Taking it in

`ageGrave` (`src/game/grave.ts:165-167`) is the grave's own tick and stays the one per-tick seam. It gains the swell, takes the rate, and returns events:

```
const ageGrave = (grave: Grave, swellPerSecond: number): SimEvent[]
```

It reads top to bottom as two named things: the invulnerability counting down, and the grave taking in what it is owed. Write the second as its own private helper with a descriptive-complete name. What the swell does, in order: take `Math.min(grave.owed, swellPerSecond / TICK_HZ)`, add it to `grave.size`, take it off `grave.owed`, clear the score rung when the size has reached `SCORE_RUNG_REARM_SIZE`, and run `containGrave` because a wider grave can straddle an edge it was pressed against. When it took anything in, it returns one `grew` event carrying the amount taken in this tick and the new size.

The per-second value becomes a per-tick value here, where it is read, which is the convention design record R3 already states for the pull. `grave.ts` imports `TICK_HZ` from `./clock` for it.

`step.ts` (`:355`) passes the rate off the run and pushes the events:

```
events.push(...ageGrave(state.grave, state.conditions.tuning.growth.swellPerSecond));
```

The grave's own tick stays last in the tick, for the reason `step`'s own JSDoc (`:313-315`) already gives. That also means the first slice of a swallow's growth lands on the tick of the tip, so the grave starts growing on the tick the food went in.

### The `grew` event

`grew` (`src/game/events.ts`, the `Grew` record) keeps its type and its two fields and changes when it fires: once a tick, from the swell, carrying what was taken in that tick. No shipped module reads it today (grep `'grew'` across `src`: only `events.ts` and `swallow.ts`), so nothing downstream follows. `swallow.ts` stops pushing it. List every reader you find in your note.

### A hit

`hitGrave` (`src/game/grave.ts:372-385`) keeps its shape, its invulnerability window, its event and its ladder. What changes is the four lines that shrink, because a hit that left the owed growth alone would be undone by the swell within a second, and a hit that only ate the owed growth would be invisible. The rule is that a hit takes `HIT_SHRINK` out of the grave's true size, which is its size plus what it is owed, and the visible size gives as much of it as it can at once:

```
const trueSize = grave.size + grave.owed;
const atFloor = trueSize <= SIZE_FLOOR;
if (!atFloor) {
  const taken = Math.min(HIT_SHRINK, trueSize - SIZE_FLOOR);
  grave.size = Math.max(SIZE_FLOOR, grave.size - taken);
  grave.owed = trueSize - taken - grave.size;
}
```

With nothing owed this is today's behaviour line for line: the size drops by `HIT_SHRINK`, floored, and `owed` stays 0. With growth owed, the drop is still immediate and still the full `HIT_SHRINK` wherever the size can give it, and the run ends up exactly `HIT_SHRINK` smaller than it would have been. The `graveHit` event carries `grave.size`, the visible size, as today.

### Determinism, the witness and the invariants

`owed` is run state that decides later ticks, so the witness folds it. `foldGrave` (`src/game/witness.ts:308-313`) gains it, in the position the JSDoc block above the version explains, and `WITNESS_VERSION` (`:216`) moves from 12 to 13 with its own note. Every tape recorded before this slice is refused by version, which is what ADR 0019 intends.

`FORMAT_VERSION` (`src/tape/wireCodes.ts:68`) stays 5. The starting-condition block is self-describing and carries the tuning rows by name (`src/tape/startingCondition.ts:38`, `:59`), so new rows do not move it, exactly as slice 1's new row did not. A tape recorded before this slice that does not name the two new rows is refused as `conditionNotImplemented`, which slice 7 gives a spoken refusal.

`src/game/invariants.ts` gains, by name: `owed` in the grave's no-NaN check beside the fields already there, and a check that `owed` is never below zero and that `size + owed` never stands above `SIZE_CEILING`. `checkSize` and `checkScoreRung` do not change. `checkScoreRung`'s JSDoc credits `growGrave` with giving the rung back; make it name the swell instead, because that is where it now happens. The same is true of the comment in `src/dev/readings/bledRungMemory.ts` that says the rule "lives in `growGrave`".

The rules use exact arithmetic only, as the contract says: add, subtract, multiply, divide, `Math.min`, `Math.max`. No `Math.pow` and no `Math.exp`.

## Part B: the values, and the two rows

### The feast's growth

`FEAST_PAYOUT` (`src/game/tuning.ts:118`) goes. Its figure becomes a tuning row, because it is a starting value that the first tuning round (#39) will move and the branch's own "Values are data" rule puts a rules value in `src/game/tuningRecord.ts`.

A new group `growth` on `TuningRecord` (`src/game/tuningRecord.ts:290-294`), with two rows. A new group needs its type, its member on `TuningRecord`, its member on `TuningOverlay` (`:303-307`), its values in `DEFAULT_TUNING` (`:324-345`) and its spread in `resolveTuning` (`:453`). `SwallowTuning` (`:215-278`) is the pattern for the JSDoc, and `refuseUnplayableTipThreshold` (`:414`) and `refusePullBelowZero` (`:430`) are the pattern for the refusals.

```
growth: {
  feastInCorpses: 45,
  swellPerSecond: 4.5,
},
```

- `growth.feastInCorpses`: what a feast pays in growth, in fresh trash corpses. **45.** Refused at or below zero: a feast that pays nothing is not a feast, and a negative one would shrink the grave through a path that has nothing to do with a hit.
- `growth.swellPerSecond`: how fast the grave takes in the growth it is owed, in size units a second. **4.5.** Refused at or below zero: at zero the grave would never take in anything it was paid and would never grow again at all.

A tuning record comes from a document, so a bad one is rejected and never repaired.

Both rows need an entry with its reason in the two closed lists that force a new row to answer for itself, which slice 1's note names: `EXCLUDED` in `src/game/__tests__/witness.test.ts` and the exclusion table in `src/game/__tests__/invariants.test.ts`. They are starting conditions the rules never write, like the ten rows before them.

`spawnFeast` (`src/game/corpses.ts:270-290`) drops its `payout` parameter and reads the row itself, because it already takes the state and its two callers both passed the same constant, so the parameter has no caller earning it. Inside, the growth is `state.conditions.tuning.growth.feastInCorpses * TRASH_CORPSE_PAYOUT`. The two callers become `spawnFeast(state, boss.x, boss.y)`: `bansheeDied` (`src/game/bosses/banshee.ts:164`) and the phase break (`src/game/bosses/phases.ts:171`). Both stop importing `FEAST_PAYOUT`.

The JSDoc on `bansheeDied` (`src/game/bosses/banshee.ts:155`) says the feast is "worth nine fresh trash corpses". That has been false since the economy moved to 400 and it is false again after this slice; rewrite it to name the row rather than a figure.

### The reservoir does not move

`RESERVOIR_CAPACITY` (`src/game/tuning.ts:125`) is written as `FEAST_PAYOUT` today. It stops being written that way and keeps its own figure:

```
// A belch roughly every forty seconds at Crowd rates rather than every two.
const RESERVOIR_IN_CORPSES = 300;
const RESERVOIR_CAPACITY = RESERVOIR_IN_CORPSES * TRASH_CORPSE_PAYOUT;
```

The identity decision-log entry 5.11 rules is kept, and it moves from arithmetic into a rule stated in the one place that pays it. In `swallow` (`src/game/swallow.ts:145-146`), the reservoir is charged the capacity for a feast and the food's own paid amount for everything else:

```
const overflow = payGrowth(state, paid, events);
// Entry 5.11: the swallow of a feast slams the reservoir full, so a fully fresh
// feast fills it and wastes nothing. It is the charge and not the growth,
// because the two stopped being one number when the feast's growth came down.
payReservoir(state, food.kind === 'feast' ? RESERVOIR_CAPACITY : paid, events);
```

This reproduces today's reservoir behaviour event for event, including the splash. Check the arithmetic and say in your note that you did: today a feast charges `FEAST_PAYOUT * 1`, which is exactly the capacity, so `taken` is `capacity - reservoir` and `wasted` is whatever was already in it; under the line above the same two figures come out. The freshness scale drops out because a feast is treasure and its freshness is always 1 (`spawnFeast` sets `freshness` to 1 and `decays` to false, ADR 0004).

`payGrowth` and `payReservoir` keep their names, their bodies and their events. Nothing else in the reservoir's path changes: `belch.ts:318`, `invariants.ts`'s reservoir check, `src/dev/bot.ts:365`, `src/dev/harnessPolicy.ts:78`, `src/dev/readings/belchCadence.ts:224` and the belch button all read `RESERVOIR_CAPACITY` and all get the same number they get today.

### What moved, and what it is against

| Row | Today | This slice | What it is against |
| --- | --- | --- | --- |
| A feast's growth | 30.375 units, 300 corpses, 75% of the climb | 4.55625 units, 45 corpses, 11.25% of the climb | It is the figure the feast paid on the day it was ruled, 9 corpses of an 80-corpse climb, and a ninth of a climb that has not moved |
| The swell's rate | none, growth was instant | 4.5 size units a second, 0.075 a tick | The largest single swallow takes about one second to come in, and no tick moves the grave a tenth of a size unit |
| The reservoir | `FEAST_PAYOUT`, 300 corpses | 300 corpses, written out | Unchanged on purpose |
| `CORPSES_TO_CEILING` | 400 | 400 | Unchanged on purpose. See below |

`CORPSES_TO_CEILING` does not move in this slice, and that is a decision with evidence rather than an omission. Three things hold it. The relation `tuning.test.ts:124-126` pins bounds it into 300 to 600 exclusive, so the whole available move is 33%, which takes a corpse from 0.146 to 0.194 CSS pixels of drawn height on a 390-wide phone: both are far under one pixel and neither is a corpse a player can see on its own. The measured cause is the split and not the rate: on the steady-far birthright corner of `after-slice-2-batch.md` the median run swallows 85 corpses, worth 8.61 units, against 2 feasts worth 60.75, so feasts are 88% of everything the grave grows by and the corpse's share goes from 12% to 51% on this slice's numbers alone. And on the maxed corners the mow already pays more than the whole climb over a run, 739 corpses being 74.8 units against a climb of 40.5, so raising the corpse would bring the ceiling forward, which is the thing `CORPSES_TO_CEILING` was moved from 80 to 400 to stop. It is #39's row and #39's batch is where it moves.

## Part C: the glow goes

Everything below is removed, not disabled.

In `src/app/screens/game/GraveRenderer.ts`:

- `GRAVE_RIM_STROKE` (`:48`) and its JSDoc, `GLOW_PULSE_TICKS` (`:60`), `GLOW_PULSE_DEPTH` (`:63`), `glowAlpha` (`:73-78`) and the JSDoc block above them (`:50-58`).
- The `glow` field (`:182`), the `glowSize` field (`:186`), `redrawGlow` (`:318-328`), the `graveRim` line of `attach` (`:202`) and of `detach` (`:209`).
- The `reservoirFullness` and `tick` parameters of `sync` (`:220-232`) and the two lines of its body that use them. `sync` becomes `public sync(grave: Grave): void`. Its JSDoc loses the sentence about the glow being rebuilt on a size change, and the class JSDoc (`:150-168`) loses the glow from its first paragraph and loses its last paragraph whole.
- The export block (`:331`) keeps `GraveRenderer` alone.
- `PALETTE` and `Graphics` are no longer imported here if nothing else in the file uses them. Check both and remove what is dead.

In `src/app/screens/game/GameScreen.ts`, by name: the `grave.sync` call passes `run.grave` alone. `RESERVOIR_CAPACITY` stays imported, because the belch button's own `sync` still reads it.

In `src/app/screens/ReplayScreen.ts`, by name: the `grave.sync` call passes `run.grave` alone, and the `RESERVOIR_CAPACITY` import goes, because that screen has no belch button and nothing else there reads it.

`src/app/screens/game/layering.ts` does not change. The `graveRim` layer stays in ADR 0014's stack with nothing drawing in it: ticket #155 brings Territory's countdown back and that is the cited caller. Say in your note that the layer is now empty, so the branch close can see it.

`PALETTE.graveGlow` stays declared, because `src/app/screens/game/BelchButton.ts:110` reads it as the belch button's ready ink and `src/app/screens/game/__tests__/BelchButton.test.ts` pins that. What changes is what kind of colour it is. In `src/app/__tests__/palette.test.ts`, by name: `graveGlow` leaves `SPRITE_LAYER` and `SPRITE_OUTLINE` and joins `NOT_SPRITES` with a one-line reason, because it no longer draws over the field and its only reader is a readout in the HUD, which is where `hudInk` and `hudDim` already sit. Any row of `SEPARATION_EXCEPTIONS` that names `graveGlow` goes with it, because the pair it prices no longer exists. The comment in `src/app/palette.ts` beside `SPRITE_OUTLINE` that explains `graveGlow`'s dark companion goes for the same reason, and the JSDoc on `territory` that cites "the construction graveGlow already uses" is left alone, because it describes a construction and not a live drawing. Slice 8 is working in both palette files and may already have resolved the exception row; if it has, there is nothing to remove and your note says so.

`src/app/screens/game/foodSprite.ts:138-139` carries a written exemption for `graveGlow` "on the written grounds that the glow pulses where a power-up is steady". That ground is gone. Read what the exemption is doing, and if it still stands on some other ground say so in your note; if it does not, remove it and let whatever test it was excusing speak. If removing it turns a test red, stop and report rather than deciding the colour question yourself.

## Parts of the code this slice touches

The rules:

- `src/game/grave.ts`. `Grave` gains `owed`; `createGrave`, `growGrave`, `ageGrave` and `hitGrave` change as above. `ageGrave` returns events and takes the rate. `SCORE_RUNG_REARM_SIZE` keeps its home and its meaning.
- `src/game/swallow.ts`. One line in `swallow`: the reservoir's charge. Nothing else, and `payGrowth` and `payReservoir` keep their bodies.
- `src/game/step.ts`. One call site (`:355`) and its import (`:13`).
- `src/game/tuning.ts`. `FEAST_PAYOUT` goes, `RESERVOIR_IN_CORPSES` arrives, `RESERVOIR_CAPACITY` is rewritten, and the export block follows.
- `src/game/tuningRecord.ts`. The new `growth` group and its two refusals.
- `src/game/corpses.ts`. `spawnFeast` drops a parameter and reads the row.
- `src/game/bosses/banshee.ts` and `src/game/bosses/phases.ts`. One call each and one stale JSDoc.
- `src/game/witness.ts`. `foldGrave` and `WITNESS_VERSION`.
- `src/game/events.ts`, by name. Only if the `Grew` record's JSDoc says when it fires; the fields do not change.
- `src/game/invariants.ts`, by name. The grave's no-NaN check, the two new checks, and one JSDoc.

The drawing:

- `src/app/screens/game/GraveRenderer.ts`, `GameScreen.ts`, `ReplayScreen.ts`, `palette.test.ts`, `palette.ts`, `foodSprite.ts`, as Part C says.

The harness:

- `src/dev/digest.ts`. `GOLDEN` re-pins. See "Pins".
- `src/dev/readings/bledRungMemory.ts`. One comment.

## What must stay unchanged

- The belch. The reservoir's capacity in corpses, the charge per corpse, the splash, the full event, the button, the bot's and the harness hand's reading of "loaded". Not one event about the reservoir moves in timing or in amount.
- Every payout's tick. R2 holds: on the tip tick the grave is paid its growth, the reservoir is charged, the overflow is scored, the offer resolves, the rung is caught, the chime and the bursts fire. Only the size takes time.
- The overflow past the ceiling. Same figure, same tick, same two events.
- `CORPSES_TO_CEILING`, `TRASH_CORPSE_PAYOUT`, `SIZE_START`, `SIZE_FLOOR`, `SIZE_CEILING`, `HIT_SHRINK`.
- The fall and the teeter. `fall.ts` anchors a fall in the grave's proportions (design record R5) and that does not change; the grave now swells under a falling body instead of doubling under it, which is the case the anchoring was written for.
- The `graveRim` layer's place in ADR 0014's stack.
- `FORMAT_VERSION`, `READINGS_VERSION`. `READINGS_VERSION` holds because no reading's definition moves; the payout figures a reading reports move, and that is data. Read the version's own JSDoc (`src/dev/readingsVersion.ts:12-21`) and say in your note that you did. If you find a reading whose question changed, stop and report.
- `src/game` imports nothing from `src/app`, `src/dev` or Pixi.

## Pins

- **`WITNESS_VERSION` moves, 12 to 13.** The grave gains a folded field. Say so in your note with the reason.
- **`GOLDEN` (`src/dev/digest.ts:507`) re-pins.** Its `checksum` moves because the fold gained a field. Its `size` (24.10125 today) should hold, because the scenario's one swallow is far from its last tick and 0.10125 is taken in over two ticks; if `size` moves, say by how much and why that is what the swell predicts. `reservoir` (0.10125) must hold: that swallow is a corpse, not a feast. If it moves, stop and report.
- **The bot's pinned seed lists move**, in `src/dev/__tests__/bot.test.ts` and in `src/dev/__tests__/harnessPolicy.test.ts`. A feast is now worth a ninth of what it was, so graves stay smaller through a run and outcomes shift. For each list that moves, your note says from what to what. The faults stay empty.
- **`REACHES_VICTORY_MAXED` (`bot.test.ts:421`) must keep at least one seed**, because the rendered check below needs a won run. If it would empty, stop and report: that is a finding about the value, and changing the value is not yours to decide.
- Every tape recorded before this slice stops replaying. That is what ADR 0019 intends and it is why this slice records fresh ones.

## Planned tests

Pin every name as a `test.todo` first. Each test carries a comment naming Mark's ruling, or R2, or the decision-log entry it enforces. Every sim test steps through `stepping` (`src/dev/stepping.ts`), so the invariants run on every tick. Expected values are worked by hand from the arithmetic in this entry, never read off a run.

Where a test asserts a property that holds under the old code as well as the new one, there is no honest red for it. Prove those by a mutation spot check in a scratch copy of the tree, never in the working tree, exactly as slice 1's note did, and say which mutation turned which test red.

### `src/game/__tests__/grave.test.ts`

1. a swallow's growth is owed at once and none of it is in the size on that tick beyond the first slice
2. the grave takes in the growth it is owed at the rate the run's record names, and no tick grows it by more than a tenth of a size unit
3. the growth a swallow pays is conserved: the size gained plus the growth still owed equals what was paid
4. growth past the ceiling is handed back as overflow on the tick it was paid, counted against the size and the growth already owed together
5. a hit shrinks the grave on the tick it lands, by a full hit's worth, with nothing owed
6. a hit mid-swell shrinks the grave on the tick it lands and leaves the rest of the swell to arrive
7. a hit never takes the grave below the floor, and takes the shortfall out of the growth it was owed
8. a grave whose size and owed growth together stand above the floor is not at the floor, so the floor ladder does not run
9. growing a full hit's worth off the floor gives the score rung back on the tick the size reaches it, not on the tick it was paid

### `src/game/__tests__/step.test.ts`, in a new block "the grave swells rather than popping (Mark's ruling of 2026-09-21)"

10. twenty fresh trash corpses swallowed grow the grave's drawn height by at least two CSS pixels on a 390-wide phone
11. no single swallow pays more growth than an eighth of the whole climb from the starting size to the ceiling
12. a feast's growth is taken in over about a second and never on one tick
13. the swell rate is read off the run's own tuning record: under a record naming half the rate, the same feast takes twice as long
14. the feast's growth in corpses is read off the run's own tuning record

Test 10 needs the phone's scale in one place. State it in the test as `FIELD_WIDTH` field units across 390 CSS pixels, which is where `SIZE_FLOOR`'s own JSDoc (`src/game/tuning.ts:60-66`) gets its 0.72, and take the drawn height as twice the size, which is `GRAVE_ASPECT`. Do not add a constant to `src/game` for it: the phone is not the rules' business and the figure belongs in the test that asks the question.

### `src/game/__tests__/swallow.test.ts`

15. a feast swallowed at an empty reservoir fills it exactly and splashes nothing (entry 5.11)
16. a feast swallowed at a part-full reservoir fills it and splashes exactly what was in it, as it does today
17. a feast pays the reservoir its whole capacity and pays growth the far smaller figure its own row names
18. a corpse charges the reservoir what it pays in growth, unchanged

If a test of this shape already exists for 15, leave it where it is, make sure it still passes, and say in your note that you found it rather than writing a second one.

### `src/game/__tests__/tuning.test.ts`

The two derivation tests there are about relations and not magnitudes, and one of them asserts the identity this slice moves.

19. the reservoir's capacity is the corpses of mowing its own row names, and the ceiling still costs more mowing than a full reservoir pays (replaces the arithmetic identity in "the reservoir's capacity is the Banshee feast's payout exactly", `:88-106`, whose first assertion is the one this slice changes; the relation it protected moves to test 15, which asserts it as behaviour). Say in your note that you replaced it and why the ruling did not move.
20. a feast pays growth worth a ninth of the whole climb, whatever the economy is stated in

### `src/game/__tests__/tuningRecord.test.ts`

The literal row list and its count (14 today) gain the two rows. Plus:

21. a feast growth of zero or below is refused
22. a swell rate of zero or below is refused

### `src/game/__tests__/witness.test.ts` and `src/game/__tests__/invariants.test.ts`

The two closed lists gain an entry each for the two new rows, with a reason. The invariants file gains:

23. a grave owed a negative amount of growth is a fault
24. a grave whose size and owed growth together stand above the ceiling is a fault

### `src/app/screens/game/__tests__/GraveRenderer.test.ts`

Every test naming the glow goes: the ones at `:119-136`, `:149`, `:161-169`, `:176-180`, `:186-189`, `:273-286`, `:294-298`, `:305-310` and `:348-372`, whichever of them are about the glow rather than about the hole. Read each one before you remove it; the ones about the baked hole, the falls container and the layers stay, with their assertions about the `graveRim` layer's contents rewritten. Then:

25. the grave puts nothing in the graveRim layer, so no glow comes back

That is the deliberate-absence guard the code rules ask for. It attaches the renderer, syncs it, renders a frame and asserts the layer's children are empty. It must be red against today's renderer.

### A whole run, end to end

26. In `src/dev/__tests__/bot.test.ts`'s existing full-stage block, the run's grave never grows by more than a tenth of a size unit on any tick, from the first tick to won or lost, and the invariants fire zero faults.

That is the loop test: the one real bug in this kernel passed every unit test and showed itself the moment a run was played end to end.

## Re-recording the tapes

Every stored tape is refused by the witness version, so this slice leaves fresh ones. Run these from `apps/hungry-grave/` in the worktree, with the out-root written out in full, because `pnpm vite-node` keeps the working directory it is called in.

A won tape, to replace the one slice 5 left:

```
pnpm vite-node --config vite.headless.config.ts scripts/batch.ts steady-far 3000 4 /home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/148-grave-in-the-ground/local/148-slice-9/won rig=maxed
```

Copy the won tape up to `local/148-slice-9/won-tape/<seed>.tape` and write a README beside it in the form of `local/148-won-tape/README.md`: the seed, the hand, the rig, the tick count, the victory, the checkpoint count, the replay command and the command that recorded it. If seed 3000 no longer wins, take whichever of the four does and say which. If none of the four wins, widen the batch to the five seeds `REACHES_VICTORY_MAXED` names and report what you found.

Append one closing line to `local/148-won-tape/README.md` and to `local/148-proof-tape/README.md` saying that slice 9 moved the witness version to 13, that neither tape replays any more, and where the fresh one is. Do not delete or overwrite either file's existing text.

Verify the new tape with the command those READMEs carry:

```
pnpm vite-node --config vite.headless.config.ts scripts/measure.ts <the new tape>
```

It passes when `outcome` reads `verified` and both `readbackFaults` and `recordedFaults` are empty.

## The batch

This slice changes the grave's whole growth economy, and the one figure that says whether the grave now grows through a run is the peak grave size. Run the four commands of `docs/branch/records/before-batch.md` with the out-root changed to the full path of `local/148-slice-9/batches`, in the background, and wait for them. It takes about 31 minutes of wall clock and no tokens.

Then compare against slice 2's batch with `scripts/compare-batches.ts`, two corners per rig, in the form `after-slice-2-batch.md` shows, and write `docs/branch/records/after-slice-9-batch.md` with the same table it uses: corpses swallowed, feasts, power-ups, peak grave size, contact hits, sealed against victory, ticks. Figures only and no verdict, because the bot only dodges.

What to expect, so that a surprise is visible as a surprise rather than read as a result: on the two maxed corners the median peak should stay at 67.5, because 739 and 1,675 corpses are worth 74.8 and 169.6 units against a climb of 40.5. On the steady-far birthright corner the median peak should fall well below 67.5, because 85 corpses and 2 feasts are worth 17.7 units against the 69.4 they are worth today. On the shaky-short birthright corner the peak was already 27.3 and should barely move. Score paid by overflow should fall on the corners whose peak falls. If the maxed corners' peak falls off the ceiling, that is a finding worth its own paragraph.

If `compare-batches.ts` refuses on a mismatched `readingsVersion`, that means a reading's meaning moved after all; stop and report rather than bumping the version to get past it.

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. Every planned test above, with test 26 playing a whole run end to end.
2. `pnpm --filter hungry-grave test` runs the bot's full stages with the invariants on. Zero faults.
3. **The measured proof that nothing pops.** Over a replay of the new won tape, headless, record the grave's size on every tick and report three figures in your note: the largest single-tick change, the largest change across any one frame of the rendered replay, and the tick of each. The largest must be at or under 0.075 size units, which is the rate per tick. This is the mechanical half of Mark's first ruling and it is stronger than any screenshot; do it before the screenshots.
4. **A rendered check of the built app through `vite preview`**, never only the dev server, with `playwright-cli` at a phone's viewport, 390 by 844 at device scale 3. Screenshots go under `local/148-slice-9/screenshots/`. Read and describe every one in your note, and name any read you could not obtain rather than implying the check was complete.
   - Find, by headless stepping of the new won tape, the tick of a feast swallow and a stretch of plain mowing. The replay fast-forwards and then plays on, so hold a tick the way slices 1 and 7 held one: replace the page's `requestAnimationFrame` with a manual pump and freeze `performance.now`, advancing it one tick's worth per pumped frame, because Pixi's ticker reads real elapsed time. Change nothing in the repository for it.
   - The feast swell: four frames, at the tip tick, and 20, 40 and 61 ticks after it. Say what the grave's width is in each, in field units, off the same probe as step 3, and say whether the four read as one continuous swell.
   - The mow: two frames about ten seconds of swallowing apart, with the corpse count swallowed between them, and the grave's width in each.
   - The glow's absence: one frame at a tick where `run.reservoir` stands at or above `RESERVOIR_CAPACITY`, showing no lit band anywhere round the grave, with the belch button in the same shot showing its own ready tell. Find that tick by stepping the tape headlessly.
   - A hit: one frame on the tick a hit lands and one on the tick before it, with the grave's width in each, showing the drop happened at once.
5. The batch and its record, above.
6. Test names compared before and after, by the method in `docs/agents/lessons.md`. Your note explains every lost name, and this slice loses a good many, all of them glow tests and one tuning identity.

Open for the human after this slice, and say so in your note: whether the swell reads as the grave eating rather than as a wobble, whether one second is the right length for a feast's swell, and whether the grave now visibly grows as he mows on his phone. None of those is a property any test here can see.

## Done when

Every planned test is green, every verification step has a result in your note, the pins moved only as this entry says, and the working tree holds the code, the tests, `docs/branch/records/slice-9-note.md`, `docs/branch/records/after-slice-9-batch.md`, the new won tape with its README under `local/148-slice-9/`, and the two closing lines on the old tape READMEs, all uncommitted.
