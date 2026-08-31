# Reset the Combat Scale?

Evidence and recommendation on whether to reset The Hungry Grave's combat number scale and object scale before the next Territory iteration.

Sources: seven parallel investigations, four on outside evidence and three read-only audits of our own code, docs and tests. Read at tree `c35d79de72`. Nothing was modified.

Artifact version: https://claude.ai/code/artifact/2d42cfa7-db55-4aa6-845a-351c601702c1

---

## The short answer

**Yes to the numbers. No to the viewport. And the chunkiness is neither of them.**

The two concerns are three things wearing one coat. Separating them is most of the work, because they have wildly different costs and only one of them is genuinely foundational.

| | Verdict | Why |
| --- | --- | --- |
| Combat number resolution | **Do it now** | Real, arithmetically exact, licensed outright by ADR 0018. Five test files, one golden regeneration, no ADR superseded, no version bumped. |
| Object scale in the field | **Do it with the numbers** | The chunkiness instinct is right and measurable. Independent of the viewport. Needs one structural change before it becomes ordinary tuning. |
| Responsive battlefield | **Not yet, and maybe never** | Every game that has faced this says cap the world, not the pixels. Filling a desktop window with more battlefield is the one option the evidence rules out. |

---

## 1. The first concern contains two different changes

They were written as one: 540x760 is an accidental constant, *and* objects feel too chunky for the density wanted. They are separable, and separating them is the single most useful thing in this document.

**Shrinking objects relative to the field does not require touching the viewport.** The field can stay a fixed 540x760 logical space forever and the storm still gets denser. That change costs a handful of constants and one careful re-derivation.

**Making the battlefield adapt to the viewport is a different animal.** It bumps the tape format, kills every recording, forces a records fix, and re-opens a set piece that can break in silence. And the outside evidence says it is the wrong goal anyway.

---

## 2. Our spatial scale

Every number is measured from the code with a file and line behind it. Genre targets derive from MAME driver source, the GensokyoClub decompilation of Touhou 6, and published DoDonPachi ROM reverse-engineering, scaled to our field width.

| Object | Units | Share of 540 | Genre target | Read |
| --- | ---: | ---: | ---: | --- |
| Skull, soulStream shot | 8 | 1.5% | 11 | right size |
| Wisp | 8 | 1.5% | 11 | right size |
| Mob shot, drawn | 16 | 3.0% | 11 | a medium bullet |
| Ghoul | 18 | 3.3% | 17 | right size |
| **Shambler** | **22** | **4.1%** | **17** | **29% over** |
| **Revenant** | **26** | **4.8%** | **17** | **53% over** |
| Grave, at start | 27 | 5.0% | 45-70 | under, and fine |
| Grave width, at ceiling | 67.5 | 12.5% | 45-70 | top of range |
| Territory patch | 96 | 17.8% | n/a | no genre analogue |
| **Grave height, at ceiling** | **135** | **25.0%** | **45-70** | **2x over** |
| Bell ring, level 1 | 160 | 29.6% | n/a | |
| **Bell ring, level 5** | **500** | **92.6%** | n/a | **the whole field** |

### What the numbers actually say

The instinct is right, but not uniformly. The projectiles are correctly sized. The mobs are 29% to 53% larger than the genre's popcorn enemies, and the mob shot is drawn at a medium-bullet size when it should read as a small one. The grave is fine at start and twice the genre's player-sprite size at its ceiling.

There is a second, cheaper lever the genre leans on hard and we do not use at all. **Collision is supposed to be much smaller than the art.** Touhou derives each bullet's hitbox from its sprite at roughly half; DoDonPachi goes to the limit with literally zero-area bullets, testing the player's rectangle against a bullet's centre point. Our mobs use one number for both. Shrinking collision buys density with no art change and no visual loss. (Documented.)

One scale fact worth carrying: **540 is 2.25 times a canonical arcade playfield, so about five times the area.** Anything sized by eye against a remembered arcade screen lands that far too big, and the error compounds in area, which is exactly what thin density feels like.

---

## 3. Our combat numbers

Mob health is `shambler 3`, `revenant 5`, `ghoul 2`, with no scaling of any kind over a run. Kills quantise at `ceil(hp / damage)`, so the only tuning step that matters is one that moves a hits-to-kill count.

| Weapon line | Damage | Smallest visible step | Usable settings | Progression axis |
| --- | ---: | ---: | ---: | --- |
| soulStream | 1 | +50% | 5 | count: 1 to 5 columns |
| territory | 2 | +50% | 3 | count: 2 to 8 bites |
| wisps | 1 | +50% | 5 | count: 1 to 8 wisps |
| bell | 0.5-3.0 | +67% | ~3 | radius, then knockback |
| belch | = mob hp | n/a | n/a | none |

Measured against the shambler, which was 222 of 268 engagements in the playtest tape.

A wisp on a shambler is one third of a kill per hit, and the next stronger setting is one half of a kill per hit. That is a 50% jump in killing power with nothing in between, and a 1% reduction costs a whole extra hit. The design literature has a name for this frame: think in touches-to-kill, because the smallest expressible change is one over the touch count. (Documented.)

### The finding nobody asked for, and it may matter more

**Not one weapon line levels up damage. Not one.** Levels buy count and radius only. soulStream and the bell have *identical* per-target kill speed at level 1 and at level 5; the whole curve buys coverage and never kill speed.

Against the genre, that is a narrow instrument. Across all Vampire Survivors level-ups the axes rank power 154, amount 141, area 108, cooldown 65, duration 64, speed 56, pierce 32. **We use two of those seven.** (Documented, parsed from the shipped data files.)

> Knockback and critical hits are never granted by a level-up in Vampire Survivors. Our bell grants knockback at levels 4 and 5, and the design gate has already found that this knockback evicts Territory's own traffic.

That cross-confirmation is worth pausing on. Vampire Survivors pins knockback to *zero* on its ground-effect weapons for exactly this reason: a zone must not push away the things it is trying to damage. We shipped the bug the genre designed around.

---

## 4. Where a provisional number became a rule

The project is unusually disciplined. `tuning.ts` states the house policy outright, that tests pin derivations and never magnitudes. These are the places that broke it.

### H1. Three records disagree about whether 540x760 is a rule (blocks the viewport change)

A test asserts `FIELD_WIDTH).toBe(540)` under the title *"is 540 by 760 and is not a tuning knob"*. The field module says the dimensions *"are ADR 0003 and not tunable"*. The glossary says *"the field's dimensions and aspect are tuning numbers, not vocabulary"*. ADR 0003 states the numbers inside a sentence whose subject is the renderer relationship, so it settles nothing.

`src/app/__tests__/layout.test.ts:67` and `src/game/field.ts:4` and `CONTEXT.md:85`

### H9. Three weapon lines are written in units of "hits per shambler" (blocks the number change, as a design question)

This is the deepest finding in the audit, and it is a decision rather than an edit. The wisps refuse to over-commit: a wisp skips a mob whose committed damage already covers its health. At 3 health and 1 damage, a volley of eight spreads across three bodies. **At 30 health, all eight pile onto one body, the spread silently stops, and the volley kills nothing.**

The same coupling appears twice more. soulStream's fire interval is justified by *"three volleys kills a shambler"*. The bell's near damage is justified by *"three is one shambler exactly"*. Raising health without deciding this per line changes what those rules *do*, not just what they measure.

`src/game/lines/wisps.ts:118` and `soulStream.ts:29` and `bell.ts:52`

### H5. The Wall's load-bearing property is an arithmetic identity between four numbers (would break in silence)

ADR 0042 promises the Wall set piece *"stays crossable unloaded, and is never crossable for free"*, and warns that leaving it to the author *"fails silently"*. The mechanism is a comment multiplying the shambler's half-width, the field's 540, the Wall's authored count of 22, and the size floor of 18. Both halves of a spatial change attack it at once: a different field needs a different count, and shrinking objects shrinks both the bodies and the grave, so the gap comparison becomes a race between two rescalings.

One test derives it correctly and will fire. A neighbouring test hardcodes the count of 22.

`src/game/mobs.ts:60`, `stage.test.ts:132` (correct), `templates.test.ts:176` (hardcoded)

### H4. A tape cannot name the geometry its steering was recorded in (blocks the viewport change)

The header records the seed, starting size, roster, tick rate, even the keyboard speed multiplier *"which changes what a command means"*. It does not record the field. But a steering command is a velocity in base-speed units, and `BASE_SPEED = FIELD_WIDTH / (2 * TICK_HZ)`, so the larger multiplier sits uncaptured.

This is the exact bug ADR 0043 was written against, arriving a second time: *"whether a reader can name what a byte means without assuming its own present-day world is the test"*. The fix is known and the record already binds its shape, which is why the viewport change costs a format version.

`src/tape/tape.ts:53` and `src/game/tuning.ts:18`

### H2. Mob health is pinned as a promise, twenty lines from a test that refuses to pin its neighbour (one-line fix)

The mob table's own source says *"every magnitude here is a first pass owned by the tuning dispatch"*. Its test pins `hp` at 3, 5 and 2 as bare literals, and pins the body sizes at 11, 13 and 9. Three lines later, the same file declines to pin the ghoul's speed, with the comment *"the magnitude is the tuning dispatch's and is deliberately not pinned"*. The file knows the difference and applies it to one number and not the other.

`src/game/__tests__/mobs.test.ts:162`

### H6 and H7. Two constants are justified by a phone's pixel budget, inside a design that forbids device pixels

The size floor of 18 is justified by *"on a 390-wide phone the field scales to about 0.72 CSS pixels per field unit"*, and the boundary stroke carries the same figure. ADR 0003 says *"no number anywhere is a device pixel"*. The constants are not device pixels, but their entire justification is, and it assumes exactly one units-per-pixel figure exists. A responsive viewport turns that figure into a range.

The import fence held. No viewport value reaches spawn, cull or AI logic. It is the reasoning that leaked, not the code.

`src/game/tuning.ts:60` and `src/app/layout.ts:18`

### Already right, leave alone

The axis-split patch bounds ruled last session are cited by the audit as the correct shape, and the tuning test file is otherwise the house model: the two-second field crossing, the freshness trip simulated tick by tick, the reservoir-equals-feast identity. All derivations. One line in it breaks its own rule, and the rest is what everything else should look like.

`src/game/invariants.ts:333`

---

## 5. The two changes cost wildly different amounts

### Raise the number scale (health and damage rescaled together)

- **Tests red:** 5 files. The other six that touch health compute from the constants and survive.
- **ADRs superseded:** none. ADR 0018 licenses it outright: *"tape compatibility never freezes gameplay tuning"*.
- **Versions:** nothing bumps. Format, witness and readings all stand.
- **Golden:** regenerates. The documented path already exists.
- **Tapes:** all die as divergences, with no label saying why.
- **Determinism:** no new risk. Damage is already float, the bell already deals fractions, and the golden already carries fractional state.
- **Real work:** deciding H9 per line. That is a design call, not an edit.

**Cheap now, and this is the cheapest it will ever be.**

### Make the battlefield responsive (logical field separated from rendered viewport)

- **Tests red:** 9 files on the value alone, plus a roughly 20-case rewrite of the layout tests and a roughly 27-case bot re-baseline.
- **ADRs superseded:** ADR 0003's spatial clause, and it must be extracted into its own record first because 0003 carries three decisions.
- **Versions:** format to 3, readings to 2. Witness stands.
- **Also moves:** `layout.ts` rewritten. `fieldFrame`, `FieldRenderer`, `BelchButton`, `GameScreen` and touch input all move with it.
- **Tapes:** all die, cleanly at decode once the format bumps.
- **Re-measure:** the ADR 0014 density reading and the ADR 0039 boundary grading both need retaking.
- **Watch out:** ADR 0001 names a horizontally panning playfield as a dont-build. A fitted, non-panning camera is untouched by it; anything wider than the drawn view is not.

**Expensive, and the evidence says it is aimed at the wrong target.**

---

## 6. The viewport verdict: every game that has faced this says cap the world

The strongest single result from the outside research, and it is unanimous. When visible area is a gameplay advantage, shipped games restrict the *world* and give the surplus screen to the interface.

- **Overwatch** renders 21:9 but restricts vertical field of view, and the stated reason is fairness. (Documented.)
- **Valorant** pillarboxes anything past 16:9. (Documented.)
- **osu!**, the closest 2D score-attack precedent, scales its playfield by height, keeps it always 4:3, and spends surplus width on the heads-up display and leaderboard only. (Documented.)
- **Modern shmups** pillarbox portrait with side panels, and there is a design reason beyond fairness: a wider playfield demands a faster ship, which costs precision. (Documented.)
- **Terraria** is the cautionary case and the closest to us. Its no-spawn rectangle was expressed in screen pixels, and it now has to clamp minimum zoom by resolution forever, with mobs visibly spawning on screen at 32:9. (Documented.)

Applied to us: our run comparisons and the up-field traffic reading are exactly the thing extra visible height would corrupt. A desktop player who can see further up-field gets more warning, and that is precisely what the instrument measures.

**Determinism, separately, is safe under every policy**, as long as the scale factor never reaches simulation code. Our import fence already enforces that and the audit confirmed it holds. The risk here is fairness, not reproducibility.

So the honest reading of the desktop session is not that the battlefield should grow. It is that *the presentation around a fixed battlefield is unfinished on desktop*. That is a rendering job with no foundation underneath it, and it does not need to happen before Territory.

---

## 7. Three defensible answers to the resolution problem

### Reading A: raise health and damage together by one factor

Keep every hits-to-kill count exactly where it is today, so the change is provably feel-neutral on the day it lands. Blizzard did precisely this in World of Warcraft and stated on the record that scaling both together would not change the relative difficulty of killing anything. (Documented.)

What it buys: real tuning resolution across every line at once, and a base big enough that fine multipliers stay exact integer ratios with no new float in the damage path.

What it costs: the H9 decision per line, and one golden regeneration.

**My pick.** It is the only option that fixes the problem for all four lines at once, and it is provably neutral on landing, which means the next playtest measures the thing that changed next, not this.

### Reading B: keep small health, put the fine knob in percentage coefficients

Risk of Rain 2's base damage plus coefficients is the mainstream modern answer and it needs no health change at all. Minecraft's variant stores health and damage as floats in half-heart units and rounds only for display. (Documented.)

What it buys: resolution with a far smaller blast radius, and H9 never fires because hits-per-body is untouched.

What it costs: a multiplier layer between the constants and the damage, which is a new concept in a codebase that currently has none. The numbers a designer reads stay tiny while the numbers that matter live one indirection away.

Genuinely competitive. Cheaper than A. I do not pick it because a multiplier layer solves the arithmetic and leaves the storm feel untouched, and the storm feel is what the complaint was actually about.

### Reading C: the problem is missing axes, not a missing decimal point

We use two of the genre's seven progression axes. Damage, cadence, duration, pierce and projectile speed are all unused, and cadence in particular is the fine knob the literature reaches for first. You cannot make wisps 15% stronger, but you could make them fire 15% faster today.

What it buys: design room with no scale change, no golden regeneration, and no dead tapes.

What it costs: Diablo 2 is the warning here. Its 25-frames-per-second cadence produced attack-speed breakpoints where wide stretches of a stat did literally nothing. If our fire rates are quantised to ticks, cadence is coarse too. (Documented.)

**Not either-or.** This is real and should happen regardless, but it is Territory's redesign work rather than a foundation. It does not fix the fact that a shambler can only be killed in 1, 2 or 3 hits.

---

## 8. Does doing this now save work?

**Yes, and the argument does not depend on the scale change being right.** It depends on Territory being redesigned, which is already decided.

- Territory's numbers are throwaway either way. The offset of 456, the cap of 24, the bites of 2/3/4/6/8, the radius of 48, the damage of 2. The artillery redesign replaces the trigger, the targeting and the progression axes. Tuning those numbers now is tuning a weapon that is being rebuilt.
- Every one of those numbers is expressed in the current scale, so a later rescale re-expresses all of them a second time.
- Both changes kill every tape and force the same bot re-baseline. Doing them in one pass pays that cost once instead of twice.
- ADR 0043 already recorded that now is the cheapest moment: no tape has been shared, and player-facing replay has not shipped.

### The strongest case against, stated properly

We have exactly one human tape. Changing the foundation on one data point means the evidence base for the change is a single run, and the change destroys that run as replayable evidence. Its stored report survives, but report-to-report comparison across a rescale is arithmetic across two different tunings, and the only thing distinguishing them is a commit hash in the header.

The answer I would give: the resolution problem is not an empirical claim that needs more tapes. It is arithmetic, and it is true at any number of tapes. More runs would tell us where to *set* the numbers, which is exactly the work that comes after.

---

## 9. Structural now, tuning after play

### Decide before any code (these change what the rules are)

1. **The hits-per-body contract, per line.** Is a weapon specified as "N of my hits kill one body" or as "this much damage per second"? Three lines currently assume the first, and the wisps' spread rule breaks in silence if the answer changes underneath it.
2. **Is 540x760 a rule or a tuning number?** Three of our own records disagree. This has to be ruled either way before anything else touches the field.
3. **Are object sizes absolute units or derivations of field width?** Making them derivations is the one structural change that turns "shrink the mobs" into ordinary tuning, and it is what a responsive field would need later if we ever want one.
4. **Does a zone get stronger or weaker in a crowd?** The genre has three incompatible answers and no default. Territory's redesign needs this decided before it can have numbers at all.

### Leave to play (these are numbers, set by feel)

- **The scale factor itself.** 30 was an illustration and it stays one. The right factor falls out of how fine a step each line needs, and that is measurable once the contract above is decided.
- **How much smaller the mobs get.** The genre target is roughly 17 units against our 22 and 26, but that is a starting point, not a ruling.
- **Every Territory number.** Offset, cap, bites, radius, cadence, pull strength.
- **The bell's radius table**, and whether its knockback survives at all. The genre never grants knockback on a level-up, and ours evicts our own claimed ground.

### The smallest coherent change, if you want one

One pass, three moves, and no change to how the game feels on the day it lands:

1. Rule the hits-per-body contract per line, and write it down.
2. Rescale health and damage by one common factor, holding every hits-to-kill count identical. Regenerate the golden with the reason in the commit message.
3. Resolve the 540x760 contradiction in the records, and re-express object sizes as derivations of field width rather than bare literals.

After that, shrinking the mobs is a number, not a change. And Territory's redesign gets to be a design problem instead of a scale problem.

---

## Where this came from

Seven parallel investigations: four on outside evidence, three read-only audits of our own code, docs and tests. Full findings in the session scratchpad as `research-shmup-scale.md`, `research-survivor-numbers.md`, `research-number-resolution.md`, `research-viewport.md`, `audit-spatial-scale.md`, `audit-damage-numbers.md`, `audit-adr-hardening.md`.

Arcade playfield resolutions came from MAME driver source; every Touhou 6 constant from the GensokyoClub decompilation; DoDonPachi's from published ROM reverse-engineering; the Vampire Survivors figures from parsing 579 enemy and 151 weapon entries in the game's shipped data files.

Two corrections worth knowing: the Touhou wiki's claim that larger bullets have proportionally smaller hitboxes is contradicted by the source, and its stated player hitbox is double the actual constant.

Our own numbers were read from the tree at `c35d79de72`. Nothing was modified. The playtest report is stored at `local/76/reports/` and the Territory redesign notes at `local/76/territory-redesign-notes.md`, both held and unacted on.
