# Forty Health

*The Hungry Grave · #76 · combat scale*

The four ruled interaction contracts turn out to have exactly one arithmetic answer. Here it is, what it does to cadence and targeting, and the two passes it should land in.

---

## The two open items are closed

**Territory patches did not do visible work.** That is three separate failures on one line, not one: the trigger was not legible, the placement put patches off screen, and the placeholder art did not read as opening, grabbing or control. The redesign already answers the first two. The third is a rendering job no number pass touches, and it is now a named item rather than an assumption.

**The 456-versus-152 question is dead, not answered.** Autonomous cluster targeting has no fixed up-field offset to be right or wrong about, so `TERRITORY_OFFSET` is deleted rather than retuned. The up-field traffic reading that produced both numbers survives as an instrument; it stops being an input to placement.

---

## One number sets everything

> ## 40
>
> **A shambler has 40 health.**
>
> It is the smallest whole number that divides cleanly by every ruled touch count at once: 5 for the stream, 4 for the wisps, 8 for the bell's edge, 8 for Territory's pulses. Their lowest common multiple is 40.
>
> Nothing smaller works. At 20 the bell's edge and Territory each deal two and a half.

| Constant | Today | New | Where it comes from |
| --- | ---: | ---: | --- |
| shambler hp | 3 | **40** | The anchor. LCM of 5, 4 and 8. |
| revenant hp | 5 | **64** | Eight stream touches exactly. |
| ghoul hp | 2 | **24** | Three stream touches exactly. |
| `SKULL_DAMAGE` | 1 | **8** | 40 ÷ 5 |
| `WISP_DAMAGE` | 1 | **10** | 40 ÷ 4 |
| `BELL_DAMAGE_NEAR` | 3 | **40** | One shambler exactly. The ruled equality, preserved. |
| `BELL_DAMAGE_FAR` | 0.5 | **5** | 40 ÷ 8 |
| Territory pulse | — | **5** | 40 ÷ 8 |
| `TERRITORY_DAMAGE` | 2 | **25** | Placeholder for Pass A only. Five pulses' worth, and it holds Territory's behaviour exactly where it is today. |

### Why the other two mobs are 64 and 24

They are anchored on the stream, not on proportion. The stream is the always-on workhorse and the one line whose contract is a plain touch count, so every mob lands on a whole number of skulls: 5, 8, 3. Anchoring on exact proportion instead gives 66.67 and 26.67, which round *up* to 9 and 4 skulls and make both mobs relatively *tougher* than they are today.

The drift is small and worth naming out loud. A revenant goes from 1.67 shamblers to 1.60. A ghoul goes from 0.67 to 0.60. Both slightly easier in relative terms.

---

## Every touch count, before and after

| Line | Shambler | Revenant | Ghoul |
| --- | ---: | ---: | ---: |
| soul stream | 3 → **5** | 5 → **8** | 2 → **3** |
| wisps | 3 → **4** | 5 → **7** | 2 → **3** |
| bell, at the grave | 1 → **1** | 2 → **2** | 1 → **1** |
| bell, at the edge | 6 → **8** | 10 → **13** | 4 → **5** |
| territory pulses | 2 grabs → **8** | 3 grabs → **13** | 1 grab → **5** |

**The bell's curve barely moves.** At the grave, at three quarters, at half and at a quarter of its radius, the touch counts are identical before and after. Only the outermost edge changes, 6 to 8. This is the most conservative change in the pass, and it does exactly what the contract asked: it gives the far end shape without touching the near end's identity.

**The stream now wastes nothing.** At 8 damage against 40, 64 and 24, every mob dies on an exact multiple. That is the payoff for anchoring on the stream.

### The one place a number change reaches a rule

The wisps' no-overkill rule reads health, and it is exact today only because a wisp does 1 damage. At 10 against a 24-health ghoul, three wisps commit 30, and the test asserting `committed × damage <= hp` goes red.

**The production rule is already right and does not change.** It admits a wisp only while the committed damage is under the mob's health, which is exactly "never more wisps than it takes to kill". The test was written as if that meant "never more damage than the mob has", and those were the same sentence only while damage was 1. One assertion and one comment get re-expressed; `wisps.ts` itself is untouched.

There is no health scale that avoids this. Making 10 divide the other two mobs' health forces both to a multiple of 40, which is 80 for the revenant and 40 for the ghoul, and both are badly wrong.

---

## Cadence

| Knob | Today | New | Reason |
| --- | ---: | ---: | --- |
| `STREAM_INTERVAL` | 30 | **18** | Scaled by 3/5, the touch ratio. 5 × 18 is the same 90 ticks as 3 × 30, so the module's own written derivation survives. |
| `SURGE_INTERVAL` | 10 | **6** | Same 3/5, so the surge stays a third of the base interval. |
| `WISPS_BY_LEVEL` | 0,1,2,4,6,8 | **0,1,3,5,8,11** | Scaled by 4/3 so bodies-cleared-per-volley holds. Level 4 is exact; level 5 goes 2.67 to 2.75. |
| Territory re-hit delay | — | **30** | Half a second, where the genre's ground zones cluster. Eight pulses is seven intervals, so 3.5 seconds of dwell kills a shambler. |
| bell period, radii, push | — | **unchanged** | Only the two damage endpoints move. |

Strictly neutral for the stream is 17, not 18, because a mob waits a random part of an interval for its first hit. 18 is 8% slower than exactly neutral, which is inside "roughly current kill time" and errs on the safe side for a texture change. I took 18; it needs no decision from you unless you want 17.

Skulls on the field at level 5 rise from about 18 to about 30, and wisps in flight from about 36 to about 50. `SKULL_CAP` is 120 and `WISP_CAP` is 64, so both still sit above. The margins shrink and their derivation comments have to be recomputed.

### Eleven wisps contradicts the concept doc

The concept doc and the line's own comment both name the level-5 endpoint as *"a converging flight of seven or eight"*. Holding bodies-cleared at four touches needs eleven.

The alternative is holding at eight, which drops the volley from 2.67 bodies to 2.0. That is a 25% cut to the only promise this line makes, so it is not really an alternative, it is a different ruling. I would amend the concept doc.

`game-concept.md:32` · `wisps.ts:26-31` · `dispatch-5-weapons.md:230`

---

## The dwell arithmetic gives the slow a derivation

A patch drifts with the field at scroll speed and so do mobs, so a mob closes on a patch at **its own type speed only**. At today's full radius of 48, a mob crossing the centre travels 96 units.

| Mob | Dwell needed | Dwell at radius 48 | Result |
| --- | ---: | ---: | --- |
| shambler | 210 ticks | 303 ticks | Dies, 44% margin. |
| revenant | 360 ticks | 433 ticks | Dies, 20% margin. |
| ghoul | 120 ticks | 61 ticks | **Survives at half health.** |

**The number the pull and slow exist for.** The falling types already die in a full central crossing with no pull at all. The ghoul is the case control is for. A ghoul needs its speed at or below 0.8 units a tick to dwell long enough, and its speed is 1.575, so **a 50% slow is the number**. That lands on your own stated second growth axis with arithmetic behind it rather than taste.

It also gives the area ladder a reason to be first. Below a radius of about 34, a centre-crossing shambler does not die to Territory alone, so level 1 sits under that line and softens, and the ladder crosses it around level 2 or 3.

---

## Targeting: only Territory changes

The stream does not target. The bell does not target. The wisps keep their exact targeting shape and only read a bigger number. `TERRITORY_OFFSET` is deleted, and in its place Territory needs three pieces of logic that exist nowhere in the sim today.

1. **A charge clock of its own.** Replacing the swallow trigger. Same shape as the bell's `tollClock`, which is the exact precedent: the bell already made this identical move from on-swallow to its own timer, and that move got ADR 0036.

2. **A cluster scan over the live mobs.** No precedent in the codebase or in the genre. It must walk `state.mobs` in slot order exactly once, never sort, break every tie by first-encountered, draw no randomness, and use only the exactly-specified float operations ADR 0015 allows. *(The rule other lines follow: `wisps.ts` `nearestMob`, `territory.ts` `oldestPatch`.)*

3. **A predictive lead.** Straightforward once the scan exists, with one trap: a lead that ignores mob type will be badly wrong for ghouls, whose descent runs several times the scroll where the falling types close at a fraction of it.

**A slow cannot be done by scaling velocity.** `moveMob` rewrites `vx` and `vy` from the type table every tick, so a scaled velocity is erased on the next tick. The two routes are a displacement applied after motion, which is the bell's `pushMob` shape, or a new field on `Mob` read inside `moveMob`, which makes `mobs.ts` know about a weapon line and undoes the whole point of the last refactor. **Take the displacement route.**

---

## The bell and Territory now actually fight

Today the overlap is mild: a ring can evict a mob before a patch grabs it. Under the redesign it is a literal tug of war, because Territory pulls in and the bell pushes out, on the same mobs, at the same time.

Rough size of it: a level-5 ring shoves 40 units at the centre, once every 180 ticks. A pull of half a unit a tick takes 80 ticks to undo that. So one toll can cost Territory about 80 of the 210 ticks it needs to kill a shambler, every three seconds. That is a 38% tax and it is not a rounding error.

**This blocks Pass B, not Pass A.** Territory's pull strength cannot be chosen without knowing what a toll's push does to it. Picking one blind is how the bell's own levels 4 and 5 ended up reaching for knockback in the first place.

---

## Territory's redesign is not part of a number pass

The surface audit came back much bigger than a retune. It touches ten shipped files, roughly eight test files and two records, and it inverts a deliberate-absence spec test.

**Territory is a birthright line.** Every run starts with it at level 1, so an autonomous cadence lays ground from tick 0, where today a run that never swallows lays none at all. Two bot seeds are pinned as "swallow nothing and play the soul stream alone". `roster.ts:14` · `bot.test.ts:64-79`

**A spec test says the opposite of the redesign.** Titled *"Territory never reads the mob list to choose where a patch goes"*, and it fails if targeting appears. That test is the record of the old ruling, and this is where the supersession you already ruled gets written down. `territory.test.ts:410-439`

**The spec forbids the level order you want.** *"Levels must not buy radius, because that is the freshness channel and the two would visually confound"*, and it adds that the rejected alternatives *"must not be re-proposed"*. Your order puts area first. `local/spec-territory.md:34`

**Freshness loses its input.** With no swallow there is no freshness, so `patchRadius` has nothing to read. No ADR ties Territory to freshness; the link lives in the spec and the concept doc, and both need editing. `spec-territory.md:14,32` · `game-concept.md:32`

**A pulling patch re-triggers on the mob it just pulled.** The exact bug the bell's `struck` set was invented for. The per-mob cooldown prohibition is narrower than it reads: what is forbidden is a cooldown *field on the mob*, because slots are recycled. State held by the patch and keyed by entity id is already the endorsed shape, so `Patch.struck` becomes a map from mob id to next-eligible tick.

**A targeted patch can leave the field sideways.** Today a patch is always at the grave's x, so it cannot. A cluster-targeted one that is not clamped trips the invariant harness. `invariants.ts:348-362`

**`TERRITORY_CAP` loses its derivation.** It is derived from `TERRITORY_OFFSET / SCROLL_SPEED` and "a measured swallow roughly every 0.78 seconds". Both inputs die. `caps.ts:92-105`

**The instrument breaks in three places.** `spent` becomes meaningless with no bite budget. `bitten` stops being a count of grabs and wants splitting into distinct-mobs-touched and total-pulses-landed. `evicted`'s stated dominance rests on the swallow rate. `emptied` survives and becomes the most important of the five, because it is the only counter that catches a scan landing patches on empty ground. And nothing measures pull or slow at all, which is the same gap as the missing repel reading. `dev/readings/territoryPatches.ts`

**Two glossary entries are superseded.** *Territory* is defined as "every swallow tears the earth open a fixed distance straight up-field", and *Bite budget* as "one bite per patch per mob, however long the mob stands there". Dwell damage is the exact opposite of that last clause, and the term "bite budget" probably stops naming the right thing. *Claimed ground* at `:75` describes swallows marching a trail down the field, which I read as dying too. `CONTEXT.md:51, :79` · `game-concept.md:32`

### And one ADR that only you can settle

**ADR 0035 caps homing at one line and says a homing line is never always-on.** Its reasoning is that *"an always-on homing line is a turret that finds targets while the player does something else, and positioning is this game's one skill."*

The redesign makes Territory autonomous *and* gives it target-seeking placement with a predictive lead. That is both halves of what 0035 is worried about, on a line that is not the wisps. Whether placement counts as homing is not obvious from the record, and both audits stopped at the same place: this one needs you.

---

## What has to move before either pass

The suite is green today: 102 files, 1220 passing, plus 10 deliberate expected-failures in the bot tests. Here is what the two passes cost.

### Pass A, the scale

| What | Where | Kind |
| --- | --- | --- |
| Three health literals | `mobs.test.ts:162-164` | Renumber. |
| The wisp level array | `wisps.test.ts:78` | Renumber, plus the title says "eight at level 5". |
| The no-overkill assertion | `wisps.test.ts:115` | **Re-express the property.** The rule is right; the test said it wrong. |
| "Spreads rather than piling on" | `wisps.test.ts:126-131` | Uses `shambler.hp` as a wisp count. Same accident of damage-equals-one. |
| "Crosses one point at eighty percent" | `bell.test.ts:165` | Becomes 12. Re-express as a fraction of a shambler or it stops meaning anything. |
| The golden digest | `dev/digest.ts:264` | Regenerate with `pnpm digest`. It is a constant, not a fixture file; there are no committed tapes. |
| Derivation comments | `soulStream.ts`, `bell.ts`, `wisps.ts`, `caps.ts` | Every worked example dies. The rulings behind them all stand. |
| Design records | `tracer-plan.md:127,138` · `dispatch-5-weapons.md:76,178,184,186,230,262` | Stale numbers under decisions that stand. |

**Green but hollow.** The one-swallow ordnance bound, the one-toll-cannot-clear-a-wave bound and the drain-out property all still pass at the new numbers, recomputed by hand. Every derivation behind them is dead and has to be rewritten. A passing test with a false reason in it is worse than a red one.

**No version bumps for Pass A.** `FORMAT_VERSION`, `WITNESS_VERSION` and `READINGS_VERSION` all stay. One consequence worth a deliberate call: every historical report's raw `damage` figures become incomparable with new ones by roughly thirteen times, and by its own rule `READINGS_VERSION` does not bump on a magnitude change, so nothing says so.

### Pass B, Territory

Five compile breaks from deleting `TERRITORY_OFFSET`, and in two test files the `claimAt` helper exists only to invert that offset, so both harnesses get rebuilt rather than renumbered. Then essentially all eighteen cases in `territory.test.ts`, all four in `territoryPatches.test.ts`, and the renderer tests.

`WITNESS_VERSION` goes to 3, because a per-mob re-hit delay is new mutable patch state and ADR 0019 requires it folded. `READINGS_VERSION` goes to 2, because `bitten` stops meaning what it means.

**The real cost is `bot.test.ts`.** Four pinned seed sets and two measured floors that only a re-run can settle, because Territory is half the birthright loadout the bot plays. Nothing there re-derives on paper.

---

## The plan

### A. The scale

Mob health, the three non-Territory lines' damage, the stream's cadence, the wisp ladder. `TERRITORY_DAMAGE` goes to 25 as a deliberate placeholder, which holds Territory's behaviour exactly where it is today: one patch never kills a shambler, two do, three kill a revenant, one kills a ghoul.

**Territory is held constant on purpose, so the playtest reads one thing.**

The prediction, stated before the tape so it can be wrong: `ticksToKillMean` for a shambler stays near 69, and `hitsPerKill` roughly doubles from 2.69 to about 5. Both are already instruments. Same difficulty, denser storm.

### B. Territory

Autonomy, cluster targeting, the predictive lead, dwell damage, pull and slow. Its own spec, its own ADR on ADR 0036's precedent, its own playtest.

**It changes one line, so a bad result is attributable.**

Blocked until the bell-versus-Territory question is answered, because the pull's strength is a number picked blind without it.

---

Two playtests rather than one costs you a run. It buys the ability to say which change did what. Bundled, a storm that feels wrong could be either, and Territory's redesign is the largest single mechanic change in the pool.

---

## What I need from you

Three things, in the order they block work.

1. **Say yes to 40 / 64 / 24.** The alternative is holding the two non-shamblers at their exact proportion, which rounds them up and makes both relatively tougher than they are today.
2. **Eleven wisps at level 5, and the concept doc gets amended?** Holding at eight instead costs the volley a quarter of the bodies it clears, which is the only thing that line promises.
3. **Split into Pass A and Pass B?** It costs a second playtest and buys the ability to say which change did what. I would split.

Two more need you before Pass B ships, and neither blocks Pass A: whether Territory's target-seeking placement runs into ADR 0035's homing cap, and how the bell's push and Territory's pull are meant to coexist.

---

*Read at `c35d79de72` on `feat/76-territory`. No code changed. Full working in `local/76/combat-number-plan.md`.*
