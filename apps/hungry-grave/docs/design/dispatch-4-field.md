# Tracer dispatch 4: the field

This is the plan half of the feature playbook's dispatch contract for tracer plan section 6 item 4.

Mark ruled on 2026-08-21 that this stays one dispatch rather than splitting the way dispatch 3 did. The split was offered with its reason, which was that landing headless rules and app wiring together buries the cause when the feel is wrong, and he took the whole dispatch anyway. So this document carries both halves and the report has to be good enough to separate them if something feels off.

3a landed the rules the grave lives by. 3b made the grave steerable on an empty field. This dispatch fills the field: three mob types, the placement library, the authored stage, everything that overlaps, corpses and their freshness, and the first thing in the game that can end a run.

You are writing production code in `/home/mlo/dev/niftymonkey/the-cabinet/apps/hungry-grave`.

Read `docs/agents/feature-playbook.md` at the repo root first and follow it. This prompt is the plan half of its dispatch contract; you execute.

Read these before you write anything: `apps/hungry-grave/docs/adr/0016-mob-types-and-templates-are-pools.md`, `apps/hungry-grave/docs/adr/0006-authored-rows-not-a-director.md`, `apps/hungry-grave/docs/adr/0004-one-freshness-meter.md`, `apps/hungry-grave/docs/adr/0003-size-is-health.md`, `apps/hungry-grave/docs/adr/0002-hybrid-swallow-economy.md`, `apps/hungry-grave/docs/adr/0014-readability-layering.md`, `apps/hungry-grave/docs/adr/0013-the-sim-verification-contract.md`, `apps/hungry-grave/docs/adr/0015-determinism-across-devices.md`, `apps/hungry-grave/docs/design/tracer-plan.md` sections 3, 4 and 5, `apps/hungry-grave/docs/design/dispatch-3b-playable.md` section 9, and `apps/hungry-grave/CONTEXT.md` for the vocabulary.

**Never open `src/prototypes/` at all.** Not to read, not to copy, not to check. Everything you need is in this prompt and the docs above. The row tables in section 4.7 are authored here from the concept doc's prose and are not lifted from anywhere.

## 1. The thing, in observable terms

The field stops being empty. Mobs come down it, some of them shoot, one of them chases, and the run can now end in both directions.

When it works:

- Three mob types are on the field, each readable before it acts: a shambler that falls, a revenant that fires an aimed shot with a tell that lights before it, and a ghoul that turns toward the grave and whose body is the threat.
- Mobs arrive in named placements, and the placement's shape holds for a beat before each mob's own movement takes over.
- The stage is an authored timeline of rows over phases, chained by boundary events, and an identical seed gives an identical spawn sequence.
- Mob contact and mob fire both shrink the grave through the one damage entry point, and both are throttled by the same invulnerability window.
- A hit announces by dimming the field, with mob fire and the grave's rim spared, so a hit reads on a channel that is not the shrink.
- A killed mob leaves a corpse. The corpse drifts at exactly the scroll speed, its freshness drains, it fades as it drains, and at empty the dirt takes it under.
- The grave passing under a corpse swallows it, and the swallow pays through the rules 3a already landed.
- Surviving to the end of the last phase ends the run in victory, and the end screen says which of the two endings happened.
- The readouts and the pause button no longer sit over the field on any viewport, because mob fire now comes down that lane.
- The grave's rim reads against food and mob bodies underneath it, which today it does not.
- Resuming from the pause menu counts down before the field is live again.
- The build is deployed and Mark has played it.

What this build is **not** is the game. Nothing kills a mob except the test rig, because the weapon lines are dispatch 5. What a player can do here is dodge. Section 6 says what that costs and section 8 tells Mark what is and is not worth reading from it.

## 2. Verification steps, with actors

1. Every planned test in section 5 written and green. Actor: you.
2. `pnpm lint`, `pnpm typecheck`, and `pnpm build`, all clean. `vitest` alone is not enough: three dispatches have now shipped prettier errors that only `pnpm lint` sees. Actor: you.
3. The sim invariant harness runs on every step in every sim test, per ADR 0013, and gains the entity checks in section 4.11. It is not yours to weaken. Actor: you.
4. A rendered check of the built app via `vite preview`, screenshots actually read. **Play a run, end it, and play another**, because this app's defects live in the screen pool and three dispatches of run-one screenshots missed a dead pause button. Read: mobs visible and falling, a revenant's tell visible before its shot, mob fire visible and inside its value band against the field, a ghoul visibly turning, the grave's rim still readable with a mob body under it, the hit dim firing on contact and the rim surviving it, the readout stack and pause button clear of the field at 1440x900 and at 820x1180, and the resume countdown. Actor: you.
5. A grayscale check, which also reads whether **an armed shambler is distinguishable from an unarmed one in grayscale**. That costs nothing here and it is the readability check the armed marker otherwise never gets, while every player has to read it at Wall density where seven of twenty-two shamblers are armed. One screenshot of the field at its densest reachable moment, converted with `filter: grayscale(1)`, read for whether mob fire wins wherever it overlaps anything (ADR 0014). This is early, and the tracer plan puts the real one at dispatches 5 and 7. Do it anyway and say it is a floor: there is no storm yet, so the hardest case this check exists for cannot be produced. Actor: you.
6. Deploy to production, following `apps/hungry-grave/docs/deploy.md` exactly. Do not re-derive the recipe and do not reach for `-e` flags. Actor: you, **after** Mark says yes. Stop and ask.
7. The on-device play, using the read-list in section 8. Actor: Mark.
8. Whether any tuning number feels right is a human call after playing. Never claim a number is right. Actor: Mark.

## 3. The seams under test

- `overlaps(a, b)` in `src/game/overlap.ts`.
- `spawnMob(state, type, order)`, `damageMob(state, mob, amount, source)`, `mobHitbox(mob)`, `advanceMobs(state)` in `src/game/mobs.ts`.
- `spawnCorpse(state, mob)`, `advanceCorpses(state)`, `corpseHitbox(corpse)`, `asSwallowable(corpse)` in `src/game/corpses.ts`.
- `place(template, count, stream)` in `src/game/stage/templates.ts`.
- `advanceStage(state)` and the exported row tables in `src/game/stage/stage.ts`.
- `takeSlot(pool, nextId)` and the cap policy in `src/game/caps.ts`.
- `createRun(seed?, startingSize?)` in `src/game/run.ts`, gaining the starting size.
- `step(state, command)` in `src/game/step.ts`, now with a full tick order.
- `runPolicy` and the three policies in `src/dev/bot.ts`.
- `FieldRenderer` in `src/app/screens/game/FieldRenderer.ts`: `attach(layers)`, `sync(run)`, `detach()`.
- `fitField(viewportWidth, viewportHeight, reserve)` in `src/app/layout.ts`, gaining the reserve and the non-overlap rule in section 4.16.

Do not invent a seam. If the plan looks like it is missing one, stop and report rather than filling the gap.

## 4. Module boundaries

`src/boundary.test.ts` already governs this and it is not yours to weaken. The rules that bite here:

- `src/game` imports only from `src/game`. The new `src/game/stage/` folder is inside that, and it may not reach `src/app` or `src/dev`.
- `src/dev` may import from `src/dev` and `src/game`, and no bare packages. The bot lives there and never ships in the built app.
- `src/app` is the only place pixi lives.

`src/app/palette.test.ts` runs a source scan over `src/app/screens/game`, `src/app/FpsMeter.ts` and `src/main.ts`. `FieldRenderer.ts` lands inside that scan, so every colour it draws comes from `PALETTE`, it may not reach a `MENU` colour, it may not write a colour literal, and it may not set `blendMode`.

The `no-restricted-properties` lint rule keeps `src/game` and `src/input` off raw implementation-approximated operations and off `Math.random`. The ghoul's turn is the first thing in the game to need trigonometry, and it goes through `math.ts` (section 4.4).

### 4.1 `src/game/overlap.ts`, rectangle overlap

A leaf helper, not a seam with a policy in it.

Move the `Rect` interface here from `grave.ts`, which says in its own comment that this module should own it. `grave.ts` imports it back.

```ts
export function overlaps(a: Rect, b: Rect): boolean;
```

Axis-aligned, half-open on both axes, so two rectangles sharing exactly an edge do not overlap. Stating the convention matters more than which one is picked: a shot grazing the rim is a hit or a miss depending on it, and an unstated convention gets flipped by the next person who reads the code.

### 4.2 Entity pools, and where they live

Every field entity lives in a fixed-capacity pool on `RunState`, pre-allocated at `createRun` and mutated in place. The tracer plan section 3 states this directly, and it is the reason `step` mutates rather than returning new state.

A pool is a plain array of slots at full capacity. Each slot carries `alive: boolean` and an `id: number`. Spawning takes the first dead slot by index; when there is none, the cap policy in `caps.ts` decides. Iterating a pool means walking every slot in index order and skipping the dead ones.

The id comes from `state.nextEntityId`, which only ever increases. It exists for two reasons and neither is cosmetic: the cap policy has to be totally ordered to be deterministic, and a test that says "this corpse, not that one" needs a handle that a recycled slot index cannot give it.

No entity is ever handed out across a module boundary or put in an event payload. `events.ts` already says why: a held reference is a recycled slot by the time anything reads it.

### 4.3 `src/game/caps.ts`, the entity cap policy

The caps are identical on every device and are never lowered for a phone's frame budget. A device-varying cap makes the same seed a different game and spends exactly what ADR 0015 paid for.

```ts
export const MOB_CAP = 160;
export const MOB_FIRE_CAP = 400;
export const CORPSE_CAP = 200;
```

These are a safety net and not a tuning knob. The densest authored moment in section 4.7 puts 47 mobs alive at once, at the back half's t=68, so the caps are far enough above the content that hitting one means something has gone wrong, and near enough that a runaway spawn cannot allocate without bound. Dispatch 7 owns them if the storm changes the arithmetic.

At the cap, something must be dropped, and which one is a gameplay rule rather than a housekeeping detail. That is why this policy is in `src/game` and not in `invariants.ts`: checking a cap is not enforcing one, and if the policy lived in `src/dev` the test rig would be load-bearing in the shipped game.

The policy differs by pool, deliberately:

- **Mobs and mob fire: the spawn is refused.** Nothing already on the field is ever removed. A shot the player has read and started dodging cannot vanish, because that teaches the player that dodging is optional, and it is the kind of lie that is invisible in a test and infuriating in a hand.
- **Corpses: the oldest live corpse by id is taken under**, emitting `corpseEvicted`, and the new corpse takes its slot. The freshest corpse is the one worth diving for and the oldest is nearly worthless by ADR 0004's own curve, so dropping the oldest costs the player the least. Refusing the spawn instead would silently punish the best play, which is killing a lot at once.

Both orderings are by id, so both are deterministic and unit-testable.

### 4.4 `src/game/mobs.ts`, the mob types, their fire, and their deaths

One file rather than a folder. A mob type is a stat row plus a small rule, and the table reads best as a table (tracer plan section 3). Mob fire lives here too, because the tracer plan deliberately has no `projectiles.ts`: mob fire belongs to the mobs that emit it.

#### The table

Each type owns how it moves, whether and how it fires, its health, its corpse payout, and its size (ADR 0016). Magnitudes here are a first pass and belong to dispatch 7; the derivations are what this dispatch pins.

| type | half-width | half-height | hp | corpse payout | corpse tier | own descent |
| --- | --- | --- | --- | --- | --- | --- |
| `shambler` | 11 | 11 | 3 | `TRASH_CORPSE_PAYOUT` | `trash` | `0.5 * SCROLL_SPEED` straight down |
| `revenant` | 13 | 13 | 5 | `2 * TRASH_CORPSE_PAYOUT` | `rich` | `0.35 * SCROLL_SPEED` straight down |
| `ghoul` | 9 | 9 | 2 | `TRASH_CORPSE_PAYOUT` | `trash` | `0.8 * SCROLL_SPEED` toward the grave, with a descent floor (below) |

**The fire row is part of the type table, not a set of module constants.** Every firing number belongs to the type that owns it: whether it fires at all, its armed share, its interval, its first-shot offset, its shot speed, and its shot extent. The first-pass values are identical across the two firing types on purpose, but they are *data* from the first commit, so dispatch 7 differentiates a revenant's fire from a shambler's by editing a row rather than by refactoring shared constants out of a module. `tuning.ts`'s own header already says a mob type owns its stats, and this is the case it was written for.

| type | fires | armed share | interval | first shot | shot speed | shot half-extent |
| --- | --- | --- | --- | --- | --- | --- |
| `shambler` | armed share only | every third mob | 180 ticks | end of arriving beat plus a per-mob offset from the `mobFire` stream | `110 / TICK_HZ` | 5 |
| `revenant` | always | all | 150 ticks | end of arriving beat | `110 / TICK_HZ` | 5 |
| `ghoul` | never | n/a | n/a | n/a | n/a | n/a |

Without this the revenant is not its own threat. It lives about fifteen seconds on the field and fires six times per pass, so an interval of 150 against the shambler's 180 is a difference no player can perceive, and once health is invisible the two armed types differ by nothing that reaches the screen. Shmup rosters are told apart by aimed-versus-spread-versus-radial fire rather than by stats, which is Cave's and Touhou's grammar and ADR 0014's too.

The shambler's half-width is the one number here that is load-bearing rather than a first pass, because the Wall's row count derives from it: an edge-to-edge curtain at 22 units wide needs 22 mobs to fill 540 units of field, leaving gaps of 2.5 units. The size floor makes the grave 18 units wide, so the curtain has no gap the grave can slip through at any size, which is what "edge to edge" has to mean. Section 4.7's Wall row carries that count and a test pins the relation, so a retune of the shambler's size cannot silently open a hole in the Wall.

Health numbers come from the tracer plan section 4: the shambler dies to two or three wisp hits at wisp damage 1, the revenant to about five. The ghoul at 2 is new here and follows from what it is: it is the body threat, it is small, and it closes, so it has to die fast or positioning stops being the answer to it.

#### Motion, and the arriving beat

A mob carries `vx, vy` in field units per tick, which is its **own** motion. The scroll is added separately in `step` (section 4.9), so a mob's total descent is the scroll plus its own, and the scroll never has to be remembered by any type's rule.

**A template supplies a direction and the mob type supplies the speed.** This is ADR 0016's own split, placement and entry to the template and motion to the type, and it is the general rule rather than a ghoul special case. `place()` returns a unit direction per spawn order, and a mob's arriving velocity is that direction times its own speed.

It matters more than a tidiness point, because the alternative was a template declaring an absolute velocity, and that produces a defect nobody would ever diagnose. A straight-down template's velocity would be the scroll, so at the end of its beat every shambler would jump from 38 to 57 units per second and every revenant by 35 percent, with nothing on screen to explain it. Four of the six templates enter straight down, so for most of the game the only thing that happens when the beat ends is that the mob gets faster. In a build whose whole player verb is judging closing speed, that is the thing that gets called unfair without ever being named. With direction and speed split, a straight-down entry has no discontinuity at all, and the beat still bites exactly where the lesson lives, which is the V and the Pincer.

Every mob holds the template's arriving velocity for `ARRIVE_TICKS`, and only then does its own movement take over (ADR 0016). The beat governs movement only and never firing.

```ts
export const ARRIVE_TICKS = 45;
export const SPAWN_MARGIN = 160;
```

`SPAWN_MARGIN` is derived from the deepest authored row rather than picked, and a test pins it there. The back half's `file 6 revenant` is six 26-unit bodies nose to tail, which is 156 units of depth, so a margin of 120 would have made two of section 5's own tests unsatisfiable together against rows in this same document.

**The beat is counted per mob, from the tick that mob's top edge crosses into the field, and never from its spawn.** ADR 0016 gives a mob the template's motion so "the placement's lesson still reads", and reading happens on screen. Templates spawn above the top edge so nothing pops into existence, and the deep ones spawn a long way above it: a File puts each mob one body length behind the last, so the fifth shambler of a five-mob File starts about 110 units up and takes 2.9 seconds to become visible. Counted from spawn, its beat would have expired 2.4 seconds before anyone saw it, and a V of ghouls would show leaders holding a chevron and trailers already turning, which is precisely the wave the beat exists to prevent. Galaga is the standing precedent for entry choreography being performed on screen as the wave's identity rather than resolved off it.

Three quarters of a second, and the derivation is a reading-time one rather than a taste one. The quantity that matters is not simple reaction time, which sits near a quarter second, but the time to recognize a spatial arrangement, which the literature puts near 400 to 450 milliseconds. Half a second would be about one recognition time with nothing left over to act on. 45 ticks leaves roughly 300 milliseconds after recognition, which is the margin that makes the beat information rather than a formality. ADR 0016 makes this same window the revenant's warning window, so it carries fairness weight and not only readability. Dispatch 7 owns the magnitude.

The ghoul turns by rotating its own unit velocity toward the unit direction to the grave by at most a fixed step per tick, then scaling to `GHOUL_SPEED`. Vector rotation, not angle math: the sim prefers vectors because a normalized direction uses only exactly-specified operations (tracer plan section 3). The step's `cos` and `sin` are computed once at module load through `math.ts`.

At the tick its arriving beat ends, a ghoul's own unit velocity is the template's arriving direction, not straight down. Defaulting to straight down would evaporate the V's and the Pincer's lesson on that exact tick, which is the opposite of what the beat is for.

**One bound on the ghoul, and it is the descent floor.** After turning, its own vertical component is floored at `0.35 * SCROLL_SPEED`, matching the revenant's descent, and it is written back into the stored velocity rather than applied at move time, so the next tick's rotation turns the bent vector. Without the floor a ghoul can hold the grave's height and descend at the scroll alone, which is 20 seconds to cross the field, and in a build where nothing can kill it that is a mob that never leaves. The floor makes climbing and station-holding impossible whatever the ghoul's speed is, unconditionally.

An earlier draft also capped `GHOUL_SPEED` below `SCROLL_SPEED` and justified it as the anti-climb rule. The floor already delivers that, so the cap was doing something else entirely: it was setting the ghoul's threat, and setting it to nothing. At `0.8 * SCROLL_SPEED` the ghoul has 30.4 units per second, the descent floor claims 13.3 of it, and the 27.3 that remain are 10 percent of the grave's 270. The mob whose body is the threat and which turns toward the grave could not intercept anything that was looking at it, while the plan's own words called its threat "interception on one pass". The cap is gone.

**`GHOUL_SPEED` is a real fraction of `BASE_SPEED`, and the turn rate is what keeps it fair.** That is ADR 0016's own construction: it bounds the type with "its turn rate is slow enough that cutting hard across it beats it", which is only a meaningful safety valve if the speed is meaningful. Bounding a chaser by turn rate, arc and recovery rather than by a speed cap is also the standing guidance, precisely so contact is threatening without being unavoidable. First pass is `0.35 * BASE_SPEED`; dispatch 7 owns the magnitude and it is now the obvious dial rather than a number pinned by a test.

The turn rate gets a **pair** of relation tests, because one alone only proves the ghoul is not cheap and nothing proves it is a threat: a grave that commits early gets clear, and a grave that commits inside the last N ticks does not. That pair survives retuning and is the only thing that would catch dispatch 7 tuning the ghoul into scenery.

#### Firing

The armed share of a wave is fixed and not rolled: **a mob is armed when its group index modulo three is two**, so the third, sixth and ninth mobs of a group carry fire. A die would make the armed ones a scatter, and the point of the rule is that "picking targets matters" reads as a shape in the formation rather than as noise the player cannot learn. It also keeps the `mobFire` stream for what actually needs dice.

The phase is pinned deliberately and it is not cosmetic. Arming index zero would arm the first mob of every group, including a lone Drip, so the very first mob in the game would shoot at the player with no teaching beat at all. At index two, no Drip of one or two mobs is ever armed, and section 4.7's ramp gains a Drip of three so the first armed shambler in the game arrives alone, which is the treatment the record gives every other new threat.

**The tell's lead time is a firing number and lives on the type's row**, `TELL_TICKS`, not as a shared constant. The source scan in section 5 checks shot speed, extent and interval and would not catch a shared one.

**A tell precedes every shot, not only the first, and the lead is the same every time.** ADR 0016 and the tracer plan both require the armed type to carry a visible tell "because otherwise its only tell is the damage", and a revenant fires about six times per pass. A tell on shot one and nothing on shots two through six satisfies the sentence and not the rule. The tell lights for a fixed lead time before each shot, and for the first shot that lead falls inside the arriving beat, which is exactly ADR 0016's picture of how the two rules compose: the type arrives flying the template's shape, its tell lights during the beat, and then it fires, so the player gets the warning window as information rather than as a pause.

An armed shambler's first shot carries a per-mob offset drawn from the `mobFire` stream, so a File of armed shamblers does not fire as one volley.

A shot is aimed by taking the unit vector from the emitter to the grave's centre at the moment of firing. Nothing homes: mob fire is large, slow and irregular, and it never tracks (ADR 0014, and ADR 0016's ruling against homing pointed at the player).

The shot speed and extent live in the fire row above rather than as module constants, for the reason that table states. The speed is a reaction budget rather than a feel number. The grave's starting mark sits at y 608, so a shot fired from mid-field covers 228 units to reach it in about two seconds, and one fired at the top edge takes about five and a half. Two seconds is the window a player actually has to read a shot and move, which is why the number is set from the mid-field case and not from the generous one. Mob fire does **not** carry the scroll. An aimed shot that then drifts downward is not aimed, and the whole grammar ADR 0014 sets up depends on the player reading mob fire as a line from a mob to where they are.

#### Damage

```ts
export type DamageSource = "storm" | "bell" | "headstone" | "contact";

export function damageMob(state: RunState, mob: Mob, amount: number, source: DamageSource): SimEvent[];
```

The single entry point for a mob being hit, whatever hits it. Dispatch 5's weapon lines call it and change nothing here, which is the same shape `hitGrave` already has on the other side. In this dispatch its only callers are tests and the bot.

`source` is carried from the first commit even though this dispatch only ever passes one value, and that is deliberate rather than speculative. The tracer plan already assigns `mobs.ts` "the consequence of a mob being hit, whether by the storm, by the bell's ring, or by an orbiting headstone", and names the bell's exception explicitly: a boss takes its damage and never its push, while adds are pushed normally. Without the parameter that rule has nowhere to live and dispatch 6 either invents a second entry point or amends four call sites and their tests. One parameter now is the cheaper end of that trade, and it is the kind of seam that is expensive to unpick once dispatch 5 has built on it.

At or below zero health the mob dies, its slot is freed, `spawnCorpse` runs, and a `mobKilled` event is emitted. Live mobs are never food and contact never kills a mob: only kills leave corpses (ADR 0005 and the glossary). A mob that reaches the bottom edge is culled and costs the player nothing.

### 4.5 `src/game/corpses.ts`, corpses, freshness, and feasts

Hides ADR 0004 entirely: the decay curve, the scroll-speed coupling, the payout floor, and the dirt taking an empty corpse under.

A corpse spawns at the dead mob's centre, carrying the mob type's payout and corpse tier, freshness 1, and **zero own velocity**. That last one is the whole coupling: the scroll phase moves it and nothing else does, so a corpse drifts at exactly `SCROLL_SPEED`, and `FRESHNESS_SECONDS` is already derived as the time a mid-field corpse takes to reach the bottom edge at that speed. A mid-field kill therefore arrives at the bottom edge as a nearly empty scrap by construction rather than by two numbers agreeing. A spec test pins it, and the test is the reason nobody can later give corpses a drift of their own without noticing what it costs.

Corpse size is constant across mob types, even though the revenant's payout is double. The payout is data and the size is not, because ADR 0014 makes silhouette the first discriminator between corpses, treasure and mob fire, and a corpse that changes size to show its value breaks that. Payout reads as a per-tier hue instead (section 4.15).

Freshness drains linearly from 1 to 0 over `FRESHNESS_SECONDS`. At zero the dirt takes the corpse under and `corpseExpired` fires. A corpse that leaves the bottom edge with freshness left fires `corpseLost` instead, because the two are different things to a player and to the instruments: one is greed that ran out of time, the other is a dive never attempted.

Feasts never decay (ADR 0004). The never-decaying flag lives on the corpse record now, with the treasure class already in the glossary, so dispatch 6 authors the Banshee's shed and does not also invent a mechanism. It is tested here and unused by any spawner in this dispatch; say that in your report rather than leaving it looking like dead code.

`asSwallowable(corpse)` converts a corpse to the `Swallowable` that `swallow.ts` already takes. It stays a conversion rather than the corpse being a `Swallowable`, because `swallow.ts` takes values and never an entity, for the reason `events.ts` states.

### 4.6 `src/game/stage/templates.ts`, the placement library

A template says where a group arrives and how it is arranged, and never which mob type is in it (ADR 0016). Nothing in this file may import `mobs.ts`, and if it needs to, the design has gone wrong.

```ts
export type TemplateName = "drip" | "file" | "v" | "pincer" | "rain" | "wall";

export interface SpawnOrder {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly index: number;
}

export function place(template: TemplateName, count: number, stream: Stream): SpawnOrder[];
```

`vx, vy` is the arriving velocity the mob holds for `ARRIVE_TICKS`. `index` is the mob's position in the group, and the armed share reads it.

The six shapes, each teaching one thing, from the concept doc:

- **Drip**: lone teaching kills. `count` mobs, spread across the field's width at even spacing, entering straight down. This is where a new mob type is introduced.

  On mirrored templates, the V and the Pincer, the armed share is indexed **per arm** rather than across the whole group. Armed at group index modulo three equals two puts the shooter third in one arm and second in the other, and a Pincer's whole lesson is a symmetry that forces the player across the middle, so asymmetric arming reads as exactly the noise the fixed share was written to avoid.
- **File**: a single-file lane down one x, each mob one body-length behind the last, entering straight down. Its corpses land in a trail, which is what teaches the dive. The lane's x is drawn from the stream.
- **V**: a spreading chevron, apex first, arms opening as they descend. It makes the player pick a side.
- **Pincer**: two files angled in from opposite top corners. It forces the player across the middle.
- **Rain**: a loose full-width scatter, drawn from the stream, entering straight down at slightly varied speeds. The density filler.
- **Wall**: an edge-to-edge curtain, evenly spaced across the full width, entering straight down together.

Every template enters from the top edge, spawning above it so nothing pops into existence on screen. No template may place a mob more than `SPAWN_MARGIN` above the edge, and a test holds it, because the arriving beat is now counted from the top-edge crossing and an unbounded margin would let a template park a mob off screen for an arbitrary time before its beat even starts.

The Wall is a set piece, and ADR 0016 forbids pinning its cast. It names a property instead, that it stays crossable unloaded and is never crossable for free, and that property cannot be tested in this dispatch because there is no belch and no weapon to carve with. Dispatch 5 and dispatch 6 own the two bot policies that carry it. Say in your report that the Wall ships here untested against its own property.

### 4.7 `src/game/stage/stage.ts`, the authored timeline

Rows are data: a phase-local time in seconds, a template, a count, and a mob type (ADR 0006, with the mob-type column the tracer plan requires). Count lives on the row, never on the template, so density tuning never edits a playtest-proven shape.

Phases chain on boundary events rather than on one absolute clock, because a shootable boss dies when killed and fight length varies per player. The printed clock marks are nominal design intent.

Five phases: `ramp`, `banshee`, `backHalf`, `undertaker`, `over`.

**The drain-out is a spawn silence long enough that the field is empty when the boss arrives, and it is 20 seconds.**

```ts
export const DRAIN_OUT_SECONDS = 20;
```

The concept doc's "roughly ten seconds" is design prose the mob speeds do not support. A mob spends up to `SPAWN_MARGIN` above the edge, then its arriving beat, then falls the field's height plus its own half-height, and for the slowest type that is a little over 18 seconds. 20 is that with margin.

**Do not re-derive it and do not pin the magnitude by test.** It has now been derived twice and been wrong twice, once for measuring only the visible field and once for missing the spawn margin. It is a tuning number in a build with no weapons in it, and it belongs to whoever plays it. What gets pinned is the property, below.

**A phase's length is its last row's time plus `DRAIN_OUT_SECONDS`.** The ramp's last row is at t=105, so the ramp is 125 seconds and the Banshee lands at 2:05. The back half's last row is at t=68, so the back half is 88 seconds. The concept doc's 2:00 is nominal design intent and ADR 0006 says so in as many words, because a shootable boss dies when killed, so the five seconds are recorded rather than bought back by moving an authored wave.

**The test is that no mob is alive at the phase boundary**, which is what the glossary actually asks for. Do not write it as "no mob is alive during the last `DRAIN_OUT_SECONDS`": the last row fires at exactly `phaseEnd - DRAIN_OUT_SECONDS`, so its mobs are alive inside that window by construction and the test can never pass.

**This length is a weaponless artifact and dispatch 5 should re-derive it.** The field can only empty by everything falling the full height because nothing kills a mob here. Once the storm exists, trash dies in a second or two and the silence only has to cover stragglers plus a breath and a warning. 20 seconds of nothing, twice, in a three and a half minute run is a sixth of the run with nothing to do, and an empty screen is not how the genre signals a boss: Radiant Silvergun and Ikaruga both use a WARNING telegraph. Section 9 carries the re-derivation and the telegraph.

**The boss phases are stubbed here.** A boss phase with no boss ends on the tick it begins. That is deliberately the simplest possible stub, and it happens to be exactly right for the Wall: the Wall's clock anchors on the Banshee's death, so with the stub firing immediately the Wall's row at phase-local t=2 lands two seconds into the back half, which is where the concept doc puts it. Dispatch 6 replaces the stub with a boss and nothing else about the stage moves.

A trash phase ends when its last row's time plus `DRAIN_OUT_SECONDS` has passed. The drain-out is authored silence so the field empties before a boss arrives (glossary: drain-out). It is silence in the rows, not a special rule: no row falls inside it.

**Victory is stubbed.** When the `over` phase is reached, the run ends with `ending = "victory"` and a `victory` event fires. In the finished game the Undertaker's death is the ending and his swallow is the animation (ADR 0007). The stub exists so that every deploy from this dispatch on is a complete run in both directions, which is the tracer plan's stated reason for putting it here. Dispatch 6 is the trigger to replace it.

#### The ramp rows

The first 45 seconds are Drips and one File; Files, Vs and Pincers then overlap two at a time with Rain joining thin, to the drain-out that begins after the last row at t=105. A new mob type always arrives first as a lone Drip, so ADR 0016's readable-before-it-acts rule has somewhere to be read.

| t | template | count | type |
| --- | --- | --- | --- |
| 2 | drip | 1 | shambler |
| 8 | drip | 1 | shambler |
| 14 | drip | 3 | shambler |
| 20 | file | 5 | shambler |
| 30 | drip | 2 | shambler |
| 36 | drip | 3 | shambler |
| 42 | drip | 1 | revenant |
| 46 | v | 5 | shambler |
| 52 | file | 6 | shambler |
| 56 | pincer | 6 | shambler |
| 62 | drip | 1 | ghoul |
| 66 | v | 7 | shambler |
| 70 | rain | 6 | shambler |
| 74 | file | 4 | revenant |
| 78 | pincer | 8 | shambler |
| 83 | v | 7 | ghoul |
| 88 | rain | 6 | shambler |
| 92 | file | 6 | shambler |
| 96 | pincer | 8 | shambler |
| 101 | rain | 8 | shambler |
| 105 | v | 7 | shambler |

Phase length 125 seconds: the last row at t=105 plus the 20 second drain-out.

The Drip of three at t=14 is the game's first mob fire. It does not arrive alone, and that is better than the alternative: three shamblers spread across the width arrive together and exactly one of them is armed, so it is the only place in the game where a player sees armed and unarmed side by side in one glance and can calibrate the marker. One caution for dispatch 7: the armed one is always at the same index, so if the Drip spreads left to right it is always in the same position, and a second teaching Drip at a different count is the cheap way to break that read.

#### The back half rows

The Wall first, then a climb through Rain, Pincers and Vs overlapping two and three at a time to a sustained peak just under Wall density, then the drain-out.

| t | template | count | type |
| --- | --- | --- | --- |
| 2 | wall | 22 | shambler |
| 10 | rain | 6 | shambler |
| 14 | pincer | 8 | shambler |
| 19 | v | 7 | ghoul |
| 23 | rain | 8 | shambler |
| 26 | file | 5 | revenant |
| 30 | pincer | 8 | shambler |
| 32 | rain | 8 | shambler |
| 37 | v | 7 | shambler |
| 40 | rain | 10 | shambler |
| 43 | pincer | 8 | ghoul |
| 46 | v | 7 | shambler |
| 50 | rain | 10 | shambler |
| 53 | file | 6 | revenant |
| 56 | pincer | 8 | shambler |
| 58 | rain | 12 | shambler |
| 62 | v | 7 | ghoul |
| 65 | pincer | 8 | shambler |
| 68 | rain | 12 | shambler |

Phase length 88 seconds: the last row at t=68 plus the 20 second drain-out.

Every count here is first-pass tuning owned by dispatch 7. What is not tuning, and must not be quietly changed, is the shape: teaching Drips before a type appears in numbers, the 45-second ramp, a drain-out long enough that the field is empty at the boundary, and the Wall's count matching the shambler's width.

Row times are phase-local and rows fire when the phase-local tick passes their time. Every spawn draws from the `spawns` stream and every placement scatter draws from it too, so an identical seed gives an identical spawn sequence (ADR 0006 and ADR 0012).

### 4.8 `src/game/run.ts`, what a run now holds

`RunState` gains the three pools, the stage's own state, and the id counter:

```ts
readonly mobs: Mob[];
readonly mobFire: Shot[];
readonly corpses: Corpse[];
readonly stage: StageState;
nextEntityId: number;
```

`createRun` gains a starting size:

```ts
export function createRun(seed: number = rollSeed(), startingSize: number = SIZE_START): RunState;
```

It clamps the starting size to `SIZE_FLOOR` and `SIZE_CEILING` itself. This closes a hole dispatch 3b opened and recorded: `?size=` currently writes `run.grave.size` from `src/app`, so the sim's own hard bounds are defended by a URL parser in the app layer. `sizeFromUrl` keeps parsing and stops clamping, `GameScreen` passes the value in, and `grave.ts` owns the bound again. `hitGrave` is then the only thing outside `grave.ts` that changes size at all.

### 4.9 `src/game/step.ts`, the whole tick order

`step.ts` still holds no rules of its own. It orchestrates, and every consequence belongs to the module that owns it. The order it has always documented, now filled in:

1. **Scroll.** Add `SCROLL_SPEED` to the y of every live mob and every live corpse. Mob fire does not scroll (section 4.4).
2. **The move command.** `moveGrave`, unchanged.
3. **Spawns.** `advanceStage` reads the rows for this phase-local tick and spawns through `spawnMob`.
4. **Motion.** Each mob applies its own velocity, turning first if it is a ghoul and its arriving beat has passed. Each shot applies its velocity. Mobs fire, which spawns shots.
5. **Overlap detection.** Three pairs, in this order: mob fire against the grave, mob bodies against the grave, corpses against the grave. Each consequence goes to its owner: `hitGrave` for the first two, `swallow` for the third. **A shot overlapping the grave is consumed whether or not it lands**, invulnerable grave included. Left on the field it keeps overlapping and lands again the tick the window expires, turning one shot into two hits with nothing on screen to explain the second. A mob that hits is not consumed, because contact never kills a mob.
6. **Deaths.** Nothing kills a mob in this dispatch, so this phase exists as the place `damageMob`'s results are collected and is otherwise quiet. Say so rather than leaving the phase looking unfinished.
7. **Decay.** `advanceCorpses` drains freshness and takes empty corpses under.
8. **Culling.** Mobs and corpses past the bottom edge, shots fully outside the field on any side.
9. **The grave's own tick and the counters.** `ageGrave` counts the invulnerability window down, then the tick counter and the stage's phase-local tick advance. `ageGrave` is landed in `step.ts` today and is easy to lose in a rewrite: drop it and the window never expires, put it before overlap detection and it expires a tick early, and the test that a second contact inside the window does nothing goes red for a reason nobody would look for in the tick order.

Pools are always walked in slot order, and overlap pairs are always tested in the order above, so the same seed produces the same events in the same order. Determinism here is not an accident of iteration and must not become one.

Order 5 before 7 is deliberate: a corpse at exactly zero freshness that the grave is under this tick is swallowed rather than taken under. Greed that arrives on the last tick is rewarded, which is the direction ADR 0004 already leans by giving freshness a payout floor instead of a zero.

### 4.10 `src/game/events.ts`, the new events

Only events with a subscriber. Every payload carries values, never entity references.

- `mobKilled`: type, x, y. The kill sound, and the instruments' kill count.
- `mobFired`: emitter, x, y. The mob-fire sound, and ADR 0014's airborne-projectile instrument.
- `corpseExpired`: x, y. The dirt taking it under, and the missed-food instrument.
- `corpseEvicted`: x, y, freshness. The cap policy dropping the oldest corpse to make room. It is a separate event from `corpseExpired` and not a reuse of it: the two look identical on screen and mean opposite things to an instrument, one being greed that ran out of time and the other being the game running out of slots, and folding them would have the missed-food instrument counting evictions as player misses.
- `corpseLost`: x, y, freshness. Off the bottom edge with value left, which is a different read from expired.
- `phaseChanged`: phase name, tick. The stage test's handle, and where dispatch 5's music cue will hang.
- `victory`: tick. The mirror of `sealed`.

`graveHit` gains nothing. Nothing subscribed needs to know what hit the grave, and a field added on speculation is a field that gets trusted.

### 4.11 `src/dev/invariants.ts`, extended

Added to the existing checks, all of them checked on every step in every sim test:

- No NaN anywhere in any live entity: x, y, vx, vy, hp, freshness.
- No pool ever exceeds its cap, and no pool ever holds two live slots with the same id.
- Freshness is always between 0 and 1 inclusive.
- Every live mob and corpse sits inside the field widened by a spawn margin, because they legitimately exist above the top edge before they arrive. Shots sit inside the field widened by their own extent.
- The stage's phase index only ever increases, and the phase-local tick resets to zero at a boundary.

Checking a cap is not enforcing one. `caps.ts` enforces; this only notices.

### 4.12 `src/dev/bot.ts`, the deterministic headless player

New file, and the first real use of ADR 0013's autopilot half. Three policies, all pure functions of run state producing a move command, all deterministic.

- **`dodgePolicy`**: a plausible human. It steers away from the nearest threat that is above it and closing, and drifts toward the field's centre otherwise. Not an optimizer: a bot proof is an upper bound on perfect play and never a fairness result, so the policy that stands in for a person has to be written as one.
- **`clearingPolicy`**: `dodgePolicy` plus a stand-in for the storm. Each tick it calls `damageMob` on any mob within a fixed radius of the grave. This is rig code and never a game rule, and it exists because there are no weapon lines yet and without it nothing in this dispatch can produce a corpse, run the stage end to end, or reach the victory stub. Dispatch 5 deletes it and the full-run test then runs on real weapons. Say clearly in your report that it exists and why.
- **`hitTakingPolicy`**: steers deliberately into the nearest threat, and reaches sealed shut. **It cannot walk the full ADR 0003 ladder in this dispatch and must not be asked to.** Score arrives only as ceiling overflow from a swallow, and a strippable level needs a drop's `line`, so in a build with no drops the bot arrives at the floor with score zero and nothing above the birthright: `bleedScore` and `stripLevels` are both skipped and the next hit seals. The ladder's order is already tested in `grave.test.ts` from 3a against hand-seeded state, and that is where it stays. It **starts from a grown grave** rather than a fresh one, and the reason is recorded in the 3b plan: size stops reading as health above roughly size 40, because a hit at the ceiling moves the half-height by 4.4 percent, so a bot that starts fresh measures a three-hit opening and reports on a regime the player spends twenty seconds in. Give it a starting size at the ceiling and let it walk the whole range down to sealed shut.

The bot is not wired into the rendered app. ADR 0013 makes the same bot the dev-only autopilot there, and the tracer plan puts that at dispatch 7 with the input-model fence. Do not build it here.

### 4.13 `src/dev/digest.ts`, extended

The golden digest is blind in a way this dispatch closes: nothing on its path called `math.ts`, so a green digest was not determinism verified (3b plan section 9).

Extend the scripted scenario to spawn a ghoul and run it long enough to turn, and put a mob kill, a corpse, and a swallow on it.

**Extending the scenario is not enough on its own, and this is the part to get right.** `Digest`'s checksum folds only the grave's x, y and size, and a ghoul's turn reaches none of those at the precision an f32 divergence lives at: an ulp in `cos` will never move the grave. Fold **every live entity's x, y, vx, vy and freshness into the checksum, in slot order**. That is what actually puts `math.ts` on the digest's path, and it buys coverage of the spawn sequence and of pool iteration order at the same time, which is what ADR 0015 needs from this scenario.

Do not write the assertion as "the scenario reaches `math.ts`". The turn step's `cos` and `sin` are computed once at module load, so that assertion is trivially true at import and says nothing about the run. Assert instead that the checksum moves when an entity's state moves.

Regenerate `GOLDEN` with `pnpm digest` and commit it. The snapshot the digest compares stays a by-value snapshot, because `RunState` holds live streams and now pools, and `toEqual` on the state itself compares closures.

### 4.14 `src/app/screens/game/FieldRenderer.ts`, the field on screen

One renderer for all three entity kinds, following `GraveRenderer`'s shape: `attach(layers)`, `sync(run)`, `detach()`. `FieldLayers.clear()` empties every layer between runs, so it has to be able to put itself back rather than assume it is still attached.

**Attach it inside `dressField()` and do not detach it in `reset()`.** `reset()` already calls `layers.clear()` and then `dressField()`, and `dressField()` is what puts the `GraveRenderer` back. A renderer attached once in the constructor and detached in `reset()` leaves run two with no field renderer at all, and the planned lifecycle test, that a second run starts with an empty field and a live pause button, goes green on exactly that bug. This app has now shipped three pooled-screen leaks and this would be the fourth, arriving through the door marked "clean up after yourself".

**The mob silhouettes here are placeholders and #38 owns the art.** They have to satisfy the readability rules below, and satisfying them is the whole job. Deliberate placeholder design is the standing expectation on this project and Halloween art is not: if you find yourself drawing a zombie, stop.

Sprites are pooled the same way the entities are: a `Graphics` per slot, reused, with `visible` following `alive`. Allocating a sprite per spawn is what makes a wave hitch, and this app's whole defect history is pooled things nobody reset.

Layers, from `layering.ts` and not from taste: mob bodies into `mobBodies`, corpses into `corpses`, mob fire into `mobFire`, the hit dim into `hitDim`.

Drawing rules that are ADR 0014 and not decoration:

- Each mob type has a distinct silhouette, and an armed mob looks armed. A shambler that will never shoot and one that will must not be the same drawing. This is the readability rule ADR 0016 puts ahead of everything else about the mob pool.
- The revenant's tell is a visible change that precedes its shot, lit through the arriving beat. Without it the type's only tell is the damage.
- Mob fire draws as three colours: the near-white core carrying the value band, the saturated body carrying the hue, and the near-black outline. `MOB_FIRE.trash` already holds them. Alpha 1.0, no blend mode, both forbidden rather than measured.
- Corpses hold constant size and fade as freshness drains, with a last-chance flicker near empty. Without the fade, freshness is a hidden multiplier and the greed-has-a-deadline choice never presents itself. The fade is a multiplicative tint on the declared hex and never an alpha over `night` (section 4.15.4).
- Every mob body and every corpse draws with its dark companion from `SPRITE_OUTLINE` (section 4.15.2). Without it the grave's rim meets a pile of food at Lc 0.00 from the outside and the grave reads wider than it is.
- The grave's rim gains its 1-unit `graveHole` band, stroked inward inside the existing 3 units, in the `graveRim` layer (section 4.15.1). This is a change to `GraveRenderer`, not to `FieldRenderer`.
- **A consumed shot needs a cancel read, and it must not look like a swallow.** A shot vanishing into the grave's mouth with no effect is, in this game's grammar, the one verb of collection: the grave passes under a thing and it falls in. Draw the cancel as a scatter rather than a fall-in, and use the same read the belch will use when it cancels every shot on the field in dispatch 5, so cancellation has one vocabulary from the start.
- The hit dim is a full-field rectangle in the `hitDim` layer, in `night`, its alpha ramping down over the invulnerability window. It sits beneath mob fire and beneath the grave's rim, so both survive it: dimming the rim would occlude the announcing channel at the exact tick it changes. Its duration is `INVULNERABLE_TICKS` and there is no second number, because that window is its refractory interval under WCAG SC 2.3.1.

### 4.15 `src/app/palette.ts`, the rim against the food layer

Two changes, both from the derivation in `docs/research/readability-value-band.md`.

The first is a defect this dispatch makes reachable. `graveRim` measures APCA Lc 0.00 against `corpse`, `feast`, `drop` and `mob`, all four. ADR 0014 requires the rim to read above the food layer even under a pile, and the rim is the health bar because ADR 0003 has no bar. The palette's sprite-separation test uses a 2.0-luma threshold against gaps of 2.2 to 2.9, so it passes today and is structurally blind to this. Mob bodies pass under the rim constantly in this dispatch, so it cannot wait.

The second is the corpse tier hue. Corpse size is constant across mob types, so payout is unreadable without one, and the player is otherwise asked mid-dodge to remember which of five corpses came off the tougher mob they killed eight seconds ago.

The derivation behind everything below was run against this repo's own `color.ts`, and every figure in it was re-measured in the main thread before it was written here. Do not re-derive it and do not adjust a hex.

#### 4.15.1 The rim gets a dark companion, because re-valuing anything is impossible

The two obvious fixes were priced and both are arithmetically impossible, not merely expensive.

Re-valuing `graveRim` fails on its own hue ray at every luma from 8 to 68. The best minimum anywhere on the ray is `#57626f` at luma 37.88, which buys Lc 27 to 38 against food by dropping the rim against `night` from Lc 52.91 to 20.36 and against `graveHole` from 53.38 to 20.84. The rim would fall out of APCA's Lc 45 fine-detail bracket, which is the bracket `GRAVE_RIM_STROKE`'s whole derivation rests on, and two nearby candidates additionally collide with `undertaker` on all three sprite-separation axes at once.

Re-valuing the food fails on a crossover that does not exist. Giving the rim Lc 45 over food needs food down at luma 23, where food itself measures Lc 0.00 against both `night` and `nightSpeckle`, so the food is invisible on the ground it lies on. The two curves cross at about luma 42, where both sit at Lc 27, under the Lc 30 solid bracket.

So the rim becomes two colours, which is ADR 0014's own construction for exactly this problem: mob fire is three colours so it "reads on a background the palette never planned for".

- The outer 3 field units stay `graveRim`, `#93a7bd`, unchanged, stroked inward, so the drawn outer edge is still exactly the hitbox.
- A 1-unit band of `graveHole`, `#04060b`, is stroked inward immediately inside it, **in the `graveRim` layer** so it draws above the food rather than under it.

Measured in-tree: the pair spans 62.12 luma, against assertion 9's requirement of 20. The dark band clears the Lc 45 fine-detail bracket against everything the rim can cross: `corpse` 51.91, `feast` 59.08, `drop` 61.36, `mob` 62.91.

`graveHole` rather than a new near-black, because against the mouth it borders it is invisible, so the perceived hole stays 12 units wide at `SIZE_FLOOR` exactly as it is today. The band costs nothing where it is not needed and reads as the hole continuing under the rim. It also survives the hit dim for free, because `hitDim` sits below `graveRim` in `LAYER_ORDER`, so both bands are spared together at the tick the player re-reads their size.

Antialiasing was checked rather than assumed, because research 7.6 measured `fieldFrame` losing Lc 48 to 22 at 60 percent coverage and a 1-unit band is 0.72 CSS pixels on a 390-wide phone. It does not bite here: `fieldFrame`'s job is to be seen against `night` on both sides, where dilution is fatal, while this band's only job is to be dark enough. Composited over `feast`, the brightest food, it measures Lc 57.82 at 90 percent coverage, 52.72 at 75, 44.17 at 60, and 37.42 at even 50, so it clears the Lc 45 fine-detail bracket down to 60 percent coverage and stays above the Lc 30 solid bracket at half. These four figures replace a set the derivation first produced under an unstated blend model; the tech architecture gate could not reproduce those under any model, and the corrected figures here are measured under this repo's house model, a plain sRGB byte lerp, which is the model research 7.6's own figures reproduce under. The conclusion is unchanged and stronger than it was stated.

**What it costs, stated plainly.** The total drawn band goes from 3 units to 4, so at `SIZE_FLOOR` the mouth's interior narrows from 12 units to 10. The hitbox is untouched and nothing is drawn outside it. The price is the thick end of `GRAVE_RIM_STROKE`'s bracket, which had margin at both ends and now has none at the thick end, and the consequence lands on dispatch 5: **a drop must render under 10 field units.** The tracer plan says drops are sized up from the slice's 9 units, so dispatch 5's window is 9 to 10 and it is now pinned by a test rather than by a comment. Section 9 carries it.

The alternative was keeping the total at 3, split 2 light and 1 dark, which leaves the mouth at 12 and drops the bright line to 1.44 CSS pixels on a phone. It is rejected on research 7.6's own in-tree ordering, widen first and brighten second, which ranks thinning last, and because localizing two edges precisely is exactly what reading your own size off a rim requires.

#### 4.15.2 Food gets a dark companion too, because the rim's band only fixes half of it

The rim's dark band fixes the rim crossing a food body. It does not fix food abutting the rim's outer edge from outside, where the light band still meets a pile at Lc 0.00 and the grave reads wider than it is. Drawing outward is forbidden, so that half has to be fixed on the food.

Every sprite in the corpse, mob and treasure layers carries a near-black outline of its own. Half of this already exists: `fireOutline`, `dropCore`, `mobDark`, `bansheeDark` and `undertakerDark`. `corpse` and `feast` have no dark companion at all.

Declare one entry:

```ts
foodOutline: { hex: 0x141a26, luma: 10.04 },
```

The same hex as `dropCore`, declared apart with a written reason, which is the precedent `hudDim` and `menuDim` already set in this file. Measured: Lc 50.19 against `corpse`, 57.36 against `feast`, 59.64 against `drop`, 61.19 against `mob`. Against `night` at 6.64 it is 3.4 luma brighter, so it costs nothing on bare field.

This is cheap now, because this dispatch writes the corpse and mob renderers, and a retrofit later.

The scope of what it fixes is worth saying out loud. Taking the twelve declared colours between luma 61.95 and 67.41 and measuring every pair, **62 of 66 pairs measure exactly Lc 0.00**. The rim is one instance of a defect covering the entire top of the value budget, which research 7.5 predicted in words without anyone measuring what it costs. The outline construction is the only fix that touches the general case.

#### 4.15.3 The revenant's corpse tier

This lands now for the same reason 4.15.2 does, and not because a player can see it in this build. Nothing in a played dispatch-4 run draws a corpse at all. This dispatch writes the corpse renderer, so the tier costs one palette entry and one branch here, and costs a retrofit through a finished renderer later.

Brightness is freshness and nothing else, so **every corpse tier declares the same luma, 61.95**. That keeps research 7.2's gap to `feast` intact for the new tier and keeps the tier out of the freshness channel entirely. The tier cue is hue and saturation, which is what the tracer plan rules.

```ts
corpseRevenant: { hex: 0x93a85b, luma: 61.95 },
```

A moss green-yellow: hue 76.4, saturation 0.458. Re-measured in the main thread.

It clears the ceiling at 61.95. It sits 31.4 hue degrees and 0.359 saturation from `corpse`, 29.7 from `feast`, 35.04 from `drop`, and 49.5 from `mob`. Nothing declared shares its hue-and-saturation family at any luma, so its whole fade range is clear, and `corpse`'s own fade check is unaffected. It is outside the brown ban's hue range and 57.3 degrees from the nearest fire body.

The number that decided it is the observer one. Protan luma 62.57 against `corpse`'s 61.62, and deutan 62.32 against 62.11. If two tiers share Rec.709 luma but differ in observer luma, a colour-blind player reads the tier difference as a freshness difference, which corrupts the one channel ADR 0014 says survives colour vision deficiency. A fully saturated lime at the same luma diverges 6.3 points on protan, which is about 1.7 seconds of apparent freshness on a ten-second fade. This hex holds both observers within a point, so the tier is invisible to that player rather than lying to them.

A mid-green at hue 90 was rejected for closing to 35.9 degrees from `mob`: confusing a corpse with a live mob is a death, while confusing two corpse tiers is a misread payout, so the cost is asymmetric. An olive-yellow at hue 65 was rejected as too close to reading brown under the standing ban.

#### 4.15.4 The fade must be a tint, not an alpha

Also landed now rather than when it can be seen, because it is the premise every fade assertion in 4.15.5 reasons from, and a fade written the other way would make those tests green about a colour the sprite never is.

Freshness fades a corpse by multiplying its declared hex toward black, never by alpha over `night`. An alpha fade rotates a cream corpse's hue from 45 toward `night`'s 223 as it drains, so every hue-and-saturation check in the palette test would be reasoning about a colour the sprite never actually is. A value fade holds hue and saturation constant and makes the checks' premise true.

#### 4.15.5 The assertions `palette.test.ts` gains

1. A `SPRITE_OUTLINE` table in `palette.ts` maps `graveRim` to `graveHole`, and `corpse`, `corpseRevenant`, `feast`, `drop`, `mob`, `banshee` and `undertaker` to `foodOutline`. Assert the table covers every sprite entry in the layers beneath `mobFire`, so a new sprite with no companion fails rather than passing quietly.
2. Each pair spans at least `INTERNAL_SPAN_MIN` (20) luma, reusing assertion 9's own constant.
3. **At least one half of each pair** clears `|apcaLc| >= 45` against every field sprite colour it can be drawn over. Not the dark half alone: `foodOutline` against `night` is exactly Lc 0.00, which section 4.15.2 says itself, and `graveHole` is 0.00 against `night`, `nightSpeckle`, `dropCore` and `undertakerDark`, so the dark-half-only form fails on the first pair it touches.

   Four pairs fail even the one-half-clears form, and they go in the `SEPARATION_EXCEPTIONS` table `palette.test.ts` already carries, each with its measured value and a written reason, rather than the threshold being lowered for everything to accommodate four: `mobDark` at 43.10, `splash` at 43.16, `bansheeDark` at 29.53 and `undertaker` at 27.86. `mobDark` bites in this dispatch, because this fold gives every mob body a dark companion, so the rim crossing a mob's outline is ordinary play. The other three are dispatch 6's, and section 9 carries what they are a symptom of.
4. Geometry, held the way the boundary stroke is held: `GRAVE_RIM_STROKE` at the 390 by 844 viewport is at least 2.0 CSS pixels, and `GRAVE_RIM_STROKE + GRAVE_RIM_SHADOW` is at most 4.

   **The drop is bounded by the grave's width, not by the mouth's interior**, so the third clause is `DROP_SIZE <= graveWidth(SIZE_FLOOR)` once that constant exists in dispatch 5. Use `graveWidth(SIZE_FLOOR)` and never `SIZE_FLOOR`: size is a half-height and the two are equal only because `GRAVE_ASPECT` happens to be exactly 2.

   An earlier draft bound the drop to the mouth's interior, which the 4-unit band leaves at 10 units, or 7.2 CSS pixels on a 390-wide viewport. That is under half Android's 16dp small-icon floor, against a v1 line requiring four weapon-line silhouettes tellable at a glance mid-dodge, and the tracer plan's own remedy of "sized up from the slice's 9 units" would have been capped at 0.72 CSS pixels of remedy. The constraint was also wrong on the record's own terms: ADR 0003 rules that size never gates a swallow, so the mouth is not a gate and never was. What actually binds is the grave's own width, because a drop wider than the grave cannot look like it falls in, and that is 18 units or 13.0 CSS pixels. The rim's band is untouched by this: its derivation was about reading against food and the drop was never in it.
5. Generalize the existing fade test from `PALETTE.corpse` to a declared `CORPSE_TIERS` list, so every tier's fade range is checked. It currently hard-codes `PALETTE.corpse` and would go green on a tier-two corpse that collides through its whole fade.
6. Every corpse tier declares the same luma.
7. Every pair of corpse tiers is at least 25 hue degrees apart. The existing 15-degree gate is a collision tripwire, not a legibility floor.
8. Every pair of corpse tiers stays within 2.5 on both `observerLuma("protan")` and `observerLuma("deutan")`.
9. Every corpse tier clears the treasure class, `drop` and `feast`, on hue gap at least 25 **or** saturation delta at least 0.25. Written as an either-or deliberately: `corpseRevenant` against `drop` measures 0.241 on saturation, just under, and passes on hue at 35.04.

### 4.16 `src/app/layout.ts`, the reserved gutter

The gutter invariant fails as the viewport aspect approaches the field's own. At 820 by 1180 the gutter is 13 CSS pixels and the readout stack and the pause button sit over the field's top edge. That was harmless on an empty field and it is wrong now, because mob fire comes down that lane and a drag anchored on the pause button fights the button.

**The invariant is rectangle non-overlap, not a reserved band.** The readout stack's rect and the pause button's rect do not intersect the fitted field's rect, on any viewport. That is the property; reserving space is one of two ways to reach it and it is the expensive one.

An unconditional top reserve would be wrong, and the first draft of this plan had it. At 1440x900 the height binds the fit, so `offsetY` is already exactly zero and the desktop gutter is the 400-unit band on each side, not a strip on top. Reserving about 108 units of height there would shrink the desktop field by 12 percent to solve a problem desktop does not have, and it would break the landed test that the field is centred with equal margins on both axes.

The readouts do not actually move anywhere, and the first fold's branch prose pretended they did. `meterLinePosition` pins the stack to the stage's top-left corner and the pause button to the top-right. "Living in the side gutter" is only `offsetX` happening to exceed the stack's width, and at 1440x900 it does, at 400 against a stack around 210 wide. At 1024x900 `offsetX` is 192 and at 960x900 it is 160, so ordinary desktop widths fail with `offsetY` at zero and, under a rule that refits only tall viewports, no refit available. The two originally named test viewports sit one on each side of that band and neither is in it.

So the rule is: **`fitField` takes a reserve and refits whenever the natural fit would put a readout over the field**, on any aspect. A height reduction fixes both branches and there is no wide-versus-tall case.

The seam is settled here rather than left to you, because section 3 forbids inventing one. `fitField` gains a reserve argument. The reserve is declared in `layout.ts`. `GameScreen` positions the readout stack and the pause button from that reserve rather than from the stage corner. And the assertion that the measured label widths actually fit inside the reserve lives in `GameScreen`'s own test where pixi is available, because the stack's width is a pixi text measurement that `layout.ts` structurally cannot see, and a constant guessed inside `layout.ts` is one the layout test can never falsify.

`layout.test.ts` composes `resize()` with `fitField` already, because `CreationResizePlugin` upscales a 390-wide window to a 540-wide stage before `GameScreen.resize` ever runs. Keep that composition. A phone claim tested against a raw 390 is structurally blind.

### 4.17 `src/app/screens/game/GameScreen.ts`, rewired

- Construct a `FieldRenderer` beside the `GraveRenderer`, **attach it inside `dressField()`** where `GraveRenderer.attach` already lives, and sync it every frame. Do not detach it in `reset()`: section 4.14 says why, and `reset()` calls `layers.clear()` and then `dressField()`, so `dressField()` is the one place that puts renderers back.
- Pass the starting size into `createRun` rather than writing `run.grave.size` after the fact.
- End the run on `victory` as well as on `sealed`, and carry which one into the handoff.
- **The resume countdown.** Resuming from the pause menu drops the player straight back into a live field, and `pause()` calls `cancelAll()`, so the drag anchor is gone and the first `STEER_SLOP` crossing has to happen before anything moves. That was free on an empty field and it is not free now that something can kill you. Resume counts down three, two, one before the sim advances again, drawn over the field in `hudInk`. Touch and keyboard are both live during the count, so the player can get a thumb down before it matters.

  **Hold the pause blur through "3" and "2", and clear it on "1".** `PausePopup.hide()` clears `filters` before dismissing, so a countdown over a frozen, sharp field would hand the player three free seconds to study the curtain, and this record has twice called that blur load-bearing against exactly that line. One second of sharp static field is ample to re-find the grave and far too short to plan a route through a wave. The countdown exists so a thumb can get down before anything can kill you, not to buy a read. No shipped precedent for a countdown over a deliberately obscured field could be found, so this is a judgement rather than a lookup, and section 8 asks Mark to read it.

  **The countdown is per-run mutable state with a timer in it, on a pooled screen.** Clear it in `prepare()` or `reset()`, and guard the `focus()` path on the transition rather than on a flag: `focus()` can fire while `menuPaused` is still true, which either runs a countdown behind the pause menu or stacks a second one on resume. That is the same shape as 3b's fix, which guarded the pause menu on the transition itself rather than on a flag a pooled run can lower.

  **Blur mob bodies and mob fire, and spare the grave and its rim**, exactly as ADR 0014's hit dim already spares them. Re-finding the grave is what the countdown exists for, so blurring the grave defeats its own purpose, and the plan's own hit-dim rule already settles the principle: never occlude the channel the player is being asked to re-read. Sparing the grave costs nothing, because a player who can see their grave for three seconds still cannot read a route through a curtain they cannot see. The shipped convention for resume countdowns is a legible frozen frame, faded or dithered rather than blurred, so this is a deliberate departure and it should be no wider than its reason.

  **The same countdown runs on a `focus()` return from a backgrounded tab.** `goQuiet()` has cancelled the drag anchor by then, so the tab return drops the player into a live field with no anchor, which is the identical hazard arriving without the player having asked for it.

Everything the screen already does stays. It is pooled, so anything you add that `prepare()` writes conditionally has to be cleared somewhere, and this app has now shipped three separate pooled-screen leaks: the pause blur, the held keys and drag anchor, and `interactiveChildren`. Walk every property you touch and find the line that clears it.

### 4.18 `src/app/runHandoff.ts` and `EndScreen`

`RunSummary` gains `ending: RunEnding`. The end screen says which ending happened: sealed shut, or the stage survived. Use the vocabulary in `CONTEXT.md`, which is exact about this: the grave is never destroyed or killed, it is sealed.

The victory copy is a stub's copy, and a stubbed victory is still a victory the player sees. Do not write copy that admits it is a stub.

### 4.19 Record edits

- `docs/design/tracer-plan.md`: dispatch 4 done, with what shipped stubbed named. Four more edits there, because the plan's own lists no longer describe the sequence: the rendered check now runs at dispatch 4 as well as 1, 2, 3b, 6 and 7; the grayscale check runs early here as a floor as well as at 5 and 7; dispatch 4 ends in a deploy; and dispatch 4 ends in a play by Mark. Section 6's dispatch list and the sentence naming the check schedule both need it.
- `apps/hungry-grave/docs/design/game-concept.md`: it still says "a deliberate roughly ten-second drain-out silence before each fight", "until the 1:50 drain-out" and "then drains out at 3:50". Section 4.7 overrides all three. Correct them there too, or the 20 gets re-argued from the concept doc in dispatch 6. It is not an ADR and ticket work has edited it before, including under #36.
- `apps/hungry-grave/CONTEXT.md`, the Mob type entry: add a clause naming the ghoul as the closer, because it is the only one of the three whose name does not say what it does. Shambler says how it moves and revenant says roughly what it is.
- `apps/hungry-grave/docs/design/tracer-plan.md`, the input test list: it attributes "pause cancels touch" to ADR 0011, and ADR 0011 contains no pause rule at all. Fix the attribution so a durable feel rule stops hanging off a record that does not carry it.
- `apps/hungry-grave/CONTEXT.md`, the Row entry: it reads "a phase-local time, a template, a placement, and a count", and this dispatch's rows carry a mob-type column that ADR 0016 requires. Correct the entry rather than adding a term beside it.
- `docs/research/readability-value-band.md`: section 7.2 states two design intents its own numbers do not deliver, and both were verified false in the main thread. It says `corpse` at luma 62 "restores a 5.4-luma gap" so "the feast reads as the bigger prize": that gap measures APCA Lc 0.00. It says that at 67.25 against 61.95 the slogan "steady-bright means treasure" is "true for the first time": `drop` against `corpse` measures Lc 7.43, and `drop` against `feast` measures Lc 0.00. The relations were fitted on luma, which is the right metric for the band, and never checked on APCA, which is the metric for whether a player can see the difference. Correct both sentences in place, say what they actually measure, and record that the outline construction in section 4.15.2 is what now delivers the intent. Do not change a hex: the values are right and only the claims about them were wrong. Add a short subsection recording the 62-of-66 measurement, because it is the general form of the same defect and research 7.5 predicted it in words.
- `apps/hungry-grave/CONTEXT.md`: add any term this dispatch introduces that a reader would otherwise have to guess at. Do not add a term the code does not use.
- Do not edit an ADR. If you believe one is wrong, stop and report; ADRs are Mark's.

## 5. The planned test list

Every test cites the ADR, tracer plan line, or decision log entry it enforces. Every sim test steps through `stepChecked`, never through `step`.

### `src/game/overlap.test.ts`

- Two rectangles sharing exactly an edge do not overlap; one unit of penetration does.
- Overlap is symmetric.

### `src/game/caps.test.ts`

- At `MOB_CAP` a further mob spawn is refused and nothing already live is removed.
- At `MOB_FIRE_CAP` a further shot is refused.
- At `CORPSE_CAP` the oldest live corpse by id is taken under, `corpseEvicted` fires for it and `corpseExpired` does not, and the new corpse takes the slot.
- The drop is by id and not by slot index, proved by recycling a slot first.

### `src/game/mobs.test.ts`

- Each type's own descent, health, corpse payout and size are what the table says (ADR 0016).
- A mob holds the template's arriving velocity for `ARRIVE_TICKS` and then moves under its own rule (ADR 0016).
- The arriving beat does not delay firing: a revenant's tell lights on spawn and its shot lands at the end of the beat (ADR 0016).
- A mob is armed when its group index modulo three is two, so a Drip of one or two is never armed and a Drip of three carries exactly one armed mob. An unarmed shambler never fires.
- On the V and the Pincer the armed share is indexed per arm, so a mirrored template arms symmetrically.
- **The ghoul's threat is a pair of relations, not a speed.** A grave that commits early gets clear of it, and a grave that commits inside the last N ticks does not. One alone only proves the ghoul is not cheap; the pair is the only thing that would catch dispatch 7 tuning it into scenery. Neither test asserts a magnitude.
- A ghoul always descends at least `1.35 * SCROLL_SPEED`, so it can never climb, never hold station, and its life on the field is bounded.
- A mob's arriving velocity is the template's direction times its own type speed, so a straight-down entry has no speed change at all when its beat ends.
- At the tick its arriving beat ends, a ghoul's own direction is the template's arriving direction and not straight down.
- The arriving beat is counted from the top-edge crossing: a mob spawned `SPAWN_MARGIN` above the edge still holds the template's motion for `ARRIVE_TICKS` of visible field.
- A tell precedes every shot with the same lead each time, over a revenant's whole pass.
- Every firing number is on the type's row, `TELL_TICKS` included, asserted as a source scan: no shared module constant for shot speed, extent, interval or tell lead.
- Mob fire is aimed at the grave's centre at the moment of firing and never changes direction after.
- Mob fire does not carry the scroll.
- `damageMob` below zero health kills, frees the slot, spawns a corpse, and emits `mobKilled`.
- Contact never kills a mob and never leaves a corpse (ADR 0005).
- A mob past the bottom edge is culled and costs nothing.

### `src/game/corpses.test.ts`

- A corpse's own velocity is zero, so it drifts at exactly `SCROLL_SPEED`. **The coupling test**: a corpse spawned at mid-field reaches the bottom edge with freshness at or near zero, which is ADR 0004's invariant and the reason `FRESHNESS_SECONDS` is derived rather than declared.
- Freshness drains from 1 to 0 over `FRESHNESS_SECONDS` and never below.
- Payouts scale by freshness down to the `FRESHNESS_PAYOUT_FLOOR` and never to zero (ADR 0004).
- An empty corpse is taken under and emits `corpseExpired`.
- A corpse leaving the bottom edge with freshness left emits `corpseLost`.
- A feast never decays (ADR 0004).
- Corpse size is constant across mob types while payout is not (tracer plan section 4).

### `src/game/stage/templates.test.ts`

- Each template places its own shape: the File in one lane at even spacing, the V as a chevron, the Pincer from two corners, the Rain scattered across the full width, the Wall edge to edge.
- No template names a mob type, asserted as a source scan over the file for the type names (ADR 0016). A comment saying so is not a test.
- Every template spawns above the top edge.
- The same stream state gives the same placement, twice.
- Count comes from the caller and never from the template (ADR 0006).

### `src/game/stage/stage.test.ts`

- Rows are phase-local: the same t in two phases fires at two different absolute ticks (ADR 0006).
- Phases chain on boundary events and in order, and `phaseChanged` fires at each.
- A stubbed boss phase begins and ends on the same tick, and the Wall lands two seconds into the back half as a result.
- **No mob is alive at the phase boundary.** Assert that, and not "no mob is alive during the last `DRAIN_OUT_SECONDS`": the last row fires at exactly that moment, so its mobs are alive inside the window by construction and the second form can never pass.
- A phase's length is its last row's time plus `DRAIN_OUT_SECONDS`, giving 125 for the ramp and 88 for the back half. Do not pin `DRAIN_OUT_SECONDS` itself: it is a tuning number and the property above is what matters.
- `SPAWN_MARGIN` is at least the deepest authored row's depth, so no template can violate it against the rows in this plan.
- The ramp's first 45 seconds hold only Drips and one File.
- A new mob type's first appearance in the rows is a Drip (ADR 0016's readable-before-it-acts rule, held as a property of the timeline).
- The Wall's row count fills the field's width at the shambler's size, so no gap in the curtain is wider than the grave at `SIZE_FLOOR`.
- Reaching the `over` phase ends the run with `ending = "victory"` and emits `victory`.
- An identical seed gives an identical spawn sequence, asserted over a whole phase (ADRs 0006 and 0012).

### `src/game/step.test.ts`, extended

- The tick order is the one in section 4.9, asserted by observable consequence rather than by spying: a corpse at exactly zero freshness under the grave this tick is swallowed and not taken under.
- Mob fire meeting the grave shrinks it through `hitGrave` and the shot is consumed.
- A shot overlapping an invulnerable grave is consumed and lands nothing, so one shot can never become two hits.
- Mob contact shrinks the grave through `hitGrave` and the mob survives.
- A second contact inside the invulnerability window does nothing (ADR 0003 and `INVULNERABLE_TICKS`).
- Pools are walked in slot order, so the event order for one seed is stable across runs.

### `src/game/run.test.ts`

- `createRun` clamps a starting size below the floor and above the ceiling.
- A run with no starting size starts at `SIZE_START`.

### `src/game/digest.test.ts`, extended

- The extended scenario matches the regenerated `GOLDEN`.
- The checksum folds every live entity's x, y, vx, vy and freshness in slot order, asserted by moving one entity's state and seeing the digest change. Do not assert that the scenario "reaches `math.ts`": the turn step's `cos` and `sin` are computed at module load, so that assertion is true at import and says nothing.

### `src/dev/invariants.test.ts`, extended

Each new invariant gets a test that fires it deliberately, because an invariant nobody has ever seen fail is a claim and not a check.

### `src/dev/bot.test.ts` and the full-run test

Across at least five seeds:

- `clearingPolicy` runs the stage from tick zero to the `over` phase with zero invariant fires, and reaches victory.
- The run's shape is in band: phases in order, every row spawned, kills and corpses produced, at least one swallow paid.
- `hitTakingPolicy`, starting from a grown grave, reaches sealed shut. Not through the full ladder: with no drops and no ceiling overflow there is no score to bleed and no level to strip, so the floor's next hit seals. The ladder's order stays `grave.test.ts`'s, against seeded state, where 3a already tests it.
- `dodgePolicy` starting at the size ceiling reaches the `over` phase, which is the only evidence in this dispatch that the back half is survivable by something that does not delete it.
- `dodgePolicy` survives the ramp phase without dying, which is the only fairness read available before weapons exist.

**If either `dodgePolicy` test fails, that is a finding about the content and never a reason to make the bot better.** Report it and stop. This applies to the ceiling run as much as to the ramp, and the ceiling one is the harder test and therefore the likelier place to start tuning the stand-in for a human until it passes. That is precisely how a bot stops being an anchor and becomes a solver, and a solver proves nothing about whether a person can play this.

### `src/app/layout.test.ts`, extended

- **On every viewport tested, the readout stack's rect and the pause button's rect do not intersect the fitted field's rect.** This is the invariant; the two below are the two cases it resolves into.
- At 1440 by 900 the placement is unchanged from today. The landed test that the field is centred with equal non-negative margins on both axes still passes.
- At 820 by 1180 the field is refitted so the reserve can hold the readouts, composed through `resize()` and not against a raw viewport.
- **At 1024 by 900 too.** That is inside the band the first fold's branch rule missed: `offsetY` is zero and `offsetX` is 192 against a readout stack around 210 wide, so a rule that refits only tall viewports leaves a readout over the field on an ordinary desktop window.
- The measured readout and pause-button widths fit inside the declared reserve. This one lives in `GameScreen`'s test, where pixi can measure them.

### `src/app/palette.test.ts`, extended

The assertions are in section 4.15.1.

### `src/app/runHandoff.test.ts` and the end screen, extended

- `RunSummary` carries the ending, and the end screen renders the victory branch, built from a hand-made `RunSummary` with `ending: "victory"`.

This is small and it is not optional. Victory is unreachable by hand this dispatch and verification step 4's played run always ends sealed, so without this test the victory copy ships drawn by nobody. This app's entire defect history is pooled screens and unrendered branches, and that would be the fourth door with the same sign on it.

### `src/app/screens/game/FieldRenderer.test.ts`

- Each entity kind draws into the layer `layering.ts` names for it.
- Sprites are pooled: a spawn after a death reuses a sprite rather than allocating.
- A corpse's alpha follows its freshness.
- The hit dim draws in the `hitDim` layer and its alpha follows the invulnerability window, reaching zero when the window does.
- `detach` then `attach` puts everything back, because screens are pooled.

### `src/app/screens/screenLifecycle.test.ts`, extended

- A second run on the pooled game screen starts with an empty field, no live entities from the first run, and a live pause button.

### `src/boundary.test.ts`, unchanged but load-bearing

`src/game/stage/` is new and inside `src/game`. Confirm the boundary test's globs actually reach a nested folder rather than assuming they do.

## 6. What is deliberately not tested here, and why it matters

Say this in your report rather than leaving it implied.

**Nothing kills a mob but the rig.** `clearingPolicy` stands in for the storm. Every claim in this dispatch about corpses, freshness, swallows and victory rests on a bot doing what dispatch 5's weapon lines will do, and none of it has been read by a person.

**`clearingPolicy` deletes the field the human faces, and that is the sharpest limit here.** The full-run test proves the stage completes for a bot that removes mobs on contact, which is a different game from the one Mark plays. The only two reads of the back half in this dispatch are a bot that clears it and a human who cannot, and neither is the game. `dodgePolicy` from the ceiling is the one read that sits between them.

**The Wall ships untested against its own property.** ADR 0016 requires it to be crossable unloaded and never crossable for free, carried by two bot policies. Neither can exist before the belch does. In a played build here the Wall is uncrossable, which is not a bug and is not evidence about the Wall either.

**The grayscale check cannot see its hardest case.** There is no storm, so the density the check exists for cannot be produced. Verification step 5 is a floor.

**The stage's pacing is untested by anything but a clock.** Whether the ramp teaches, whether the back half climbs, and whether the drain-outs land are feel calls, and the only instrument for them is Mark playing it.

**Freshness cannot be read as a choice.** Greed has a deadline only when there is something to be greedy about, and a dodging drill has no dive worth timing.

## 7. How you work

- One vertical slice at a time: one test red, then the smallest implementation that makes it green, then the next. Never write the whole module and then the tests.
- Expected values come from the ADRs and this plan, not from running your own code and pasting the output. A test that asserts what the implementation already does is worth nothing.
- Small functions, each doing the one thing its name says. No IIFEs. Around forty lines is where splitting becomes the default. This dispatch is large and that rule is what keeps it readable.
- Comments: a JSDoc block on the declaration for anything that needs prose, `//` for a one-liner. Do not copy the comment style of whatever file you happen to be in. Never write a comment explaining code that is not there.
- No em dashes anywhere, in code, comments or your report. Comma, colon, parentheses, or two sentences.
- Use the vocabulary in `CONTEXT.md`. "Enemy" is banned; a hostile is a mob and its shots are mob fire. The grave swallows and passes under; it never drives. It presses against the field boundary; there are no walls, because the Wall is the Banshee's set piece.
- Assert every edit matched. A prettier rewrap made an exact-match edit silently miss in 3a, and a test was lost that way.
- Never weaken, skip or rewrite a test to reach green. If you think a test is wrong, that means the plan is wrong, and replanning is not yours: stop and report.
- Three strikes on the same wrong observed behaviour, then stop and report what you tried, what you saw, and your best guess. No fourth attempt.
- Do not commit anything and do not deploy. Leave the work in the tree. The deploy is verification step 6 and it waits for Mark.

End your report with each verification step from section 2 and its result, and name steps 6, 7 and 8 as not yours to run and whose they are. Also report, separately and plainly: every stub you shipped, every number you picked that this plan did not give you, and anything you found that contradicts this plan.

## 8. The on-device play, for verification step 7

This is Mark's, not yours. It is here so the dispatch ships with it.

**What this build is.** A dodging drill. Mobs come down and nothing kills them, because the weapon lines are dispatch 5. Expect to be sealed shut at the Wall about two minutes in: without a weapon to carve a lane, the Wall is doing exactly its job. A fresh grave takes four hits crossing it, which is three to the floor and one to seal, at about t=122.

**The victory screen is not reachable by hand this dispatch, and an earlier draft of this plan wrongly said it was.** Starting at `?size=67.5` buys 16.5 hits, but at ceiling size the grave is 135 units tall, so the Wall takes 2.75 seconds to pass it and costs 7 hits on its own, leaving 9 for the 66 seconds of content after it, carrying 145 more unkillable mobs at a peak of 47 on screen. The ceiling start buys a longer look at the back half and not a win. The full-run test is what proves victory here, and you see it for real in dispatch 5.

**One thing that will look like a bug and is not.** The last 20 seconds of each phase are a deliberately empty field, and at the end of the back half that empty field runs straight into the victory screen. That is the drain-out plus the stubbed boss standing where the Undertaker goes, not a pacing failure.

Reads well:

- Is the scroll speed right **as a dodging pace**. It is the run's root pace number and the most expensive one in the game to get wrong, which is exactly why the qualifier matters: the scroll is also the corpse deadline and the drop deadline, and neither of those exists in this build. A speed that reads right for weaving may be wrong for the dive. Half the evidence is here, so a revision in dispatch 5 is new information rather than a regression.
- Does the grave read at the right scale beside a mob. This is the first build where the two share a screen. The mob sizes are first pass, and the Wall's count of 22 derives from the shambler's width, so a change here ripples into the authored rows. The single-mob read is available now; the swarm read is not.
- Does holding the pause blur through the countdown and clearing it on "1" feel right, or does unpausing feel blind. This is a judgement with no shipped precedent behind it, so your read is the evidence.
- Does the resume countdown read, now that the blur spares your grave and its rim but not the field around them.
- Can you tell the three mob types apart before they act. An armed shambler must look armed and a revenant's tell must land before its shot, or ADR 0016's whole readability rule is not holding.
- Does mob fire read as mob fire: large, slow, irregular, and unmistakably not something of yours.
- Does the arriving beat read. A placement should hold its shape long enough to say what it is.
- Is the ghoul beatable by cutting hard across it, or does it feel cheap.
- Does a hit announce. The field dims and your rim survives the dim: does that land as "I was hit" without a sound.
- Can you read your own size while mob bodies pass under the rim.
- Do the readouts and the pause button stay clear of the field. This is the fix for the iPad-portrait gutter, so read it in portrait on the biggest screen you have.
- Does the resume countdown feel right, or is three too long.
- The ramp's shape over the first two minutes: does it teach before it tests. **Read the order, not the density.** With no weapons a shambler lives about 13 seconds instead of the second or two it will live under the storm, so on-screen density here is roughly an order of magnitude heavier than the real game's. A "too dense" or "too empty" note from this read is measuring the absence of weapons.

Blind, so a note from this read should not be acted on:

- Anything about corpses, freshness, drops or swallowing. None of it can happen in your hands here.
- Whether the Wall is fair. It is not crossable without a weapon and it is not meant to be judged yet.
- Anything about density at saturation. There is no storm.
- Whether the revenant and the armed shambler are different threats. They deliberately ship with identical fire this dispatch, and the plan already says that means they differ by nothing that reaches the screen. Their silhouettes will read; the roster's differentiation is dispatch 7's.
- Swallowing a corpse at a field edge, and what the drag does when growth shoves the grave inward. Nothing can put a corpse in your hands here. Section 9 carries it with a dispatch-5 trigger.
- The belch. Still wired and still consumes nothing.

## 9. Carried forward, not this dispatch

Do not act on these. They are here so the next planner does not rediscover them.

- **The drag re-anchor's feel rule is now live and still undecided.** An earlier draft of this plan said its trigger had not fired, on the grounds that `hitGrave` shrinks and never pushes. That was wrong, and the tech architecture gate caught it: `growGrave` calls `containGrave`, so a swallow while the grave is pressed against a field edge widens it and shoves it inward, and `reanchorIfClamped` fires on any displacement at all. Swallows become reachable for the first time in this dispatch and diving into a corpse at the edge is ordinary play. The behaviour is that the grave stays where the growth put it rather than snapping back under the finger, which is almost certainly right and is nobody's decision yet. Section 8 asks Mark to read it. Trigger to actually decide it: the dispatch-5 play, when food is real.
- **A drop must render under 10 field units, and dispatch 5 owns the number.** The rim's dark band narrows the floor-size mouth from 12 units to 10, and the tracer plan says drops are sized up from the slice's 9 units, so the window is 9 to 10. Assertion 4 in section 4.15.5 pins it the moment `DROP_SIZE` exists. Before this dispatch the bracket's thick end was a comment nothing enforced, and a drop sized up past 12 would have broken it silently.
- **The Wall's two bot policies.** ADR 0016's property test needs the belch, so dispatch 5 owns the belching policy and the unloaded one, written as a plausible human rather than an optimizer.
- **The storm's four colours collide with each other and with the food, and the outline assertion will catch it.** `skull`, `stone`, `wisp` and `bellRing` all sit in the 57 to 68 band, and assertion 1 in section 4.15.5 requires a dark companion for every sprite in a layer beneath `mobFire`, which the `storm` layer is. Dispatch 5 builds those renderers and inherits the requirement. This is the same defect as the rim's, at the same place in the value budget, and it is why the assertion is written as a table over the layers rather than as a list of the sprites that happen to exist today.
- **The dev-only autopilot in the rendered game.** ADR 0013 makes it the same bot as the headless one. Trigger: dispatch 7, with the `no-restricted-properties` fence over `src/input`.
- **`clearingPolicy` is deleted by dispatch 5.** It stands in for the storm and nothing else. If it is still there when weapon lines exist, the full-run test is measuring the rig.
- **End Run wants a confirm.** Trigger is dispatch 5, when there is a score to lose. The resume countdown, its pair, landed here.
- **Victory is a stub and the Undertaker's swallow is the real ending** (ADR 0007). Trigger: dispatch 6.
- **The boss phases are empty and end on the tick they begin.** Trigger: dispatch 6. The Wall's anchor already reads through the stub correctly, so nothing about the timeline moves when the Banshee lands.
- **The feast's never-decaying flag ships unused.** Trigger: dispatch 6, the Banshee's shed and her death feast.
- **Mob magnitudes are all first-pass.** Descents, fire intervals, mob fire speed, the arriving beat, and every row count belong to dispatch 7 and to the density instruments.
- **A burst kill makes every corpse's last-chance flicker land in lockstep.** Per corpse the flicker is naturally out of phase, because each corpse carries its own freshness, except when a whole wave dies together. ADR 0014 priced the full-field dim against WCAG SC 2.3.1 with care and this is the same question in a different form, and nobody can produce it until the belch and the storm exist. Trigger: dispatch 5.
- **The digest's `math.ts` coverage rides on the ghoul, and the ghoul is item 2 on the cut order.** If the third mob type is ever cut before dispatch 5's homing wisps put trigonometry back on the digest's path, the digest silently returns to the blindness section 4.13 exists to close. After dispatch 5 it is a non-issue.
- **The Wall's count-to-width relation is what gets renegotiated when its property is finally tested.** This dispatch pins 22 mobs to the shambler's half-width, leaving 2.5-unit gaps, and that is correct for what the test claims. ADR 0016's other half requires the Wall to stay crossable unloaded, and at those gaps the only unloaded crossing is carving with weapons. Dispatch 5 is where the two meet.
- **The drain-out's 20 seconds is a weaponless artifact and dispatch 5 should re-derive it.** The field can only empty by everything falling the full height because nothing kills a mob here. Under the storm, trash dies in a second or two and the silence only has to cover stragglers plus a breath. 20 seconds of nothing twice in a three and a half minute run is a sixth of the run with nothing to do, which is not shippable pacing.
- **A boss needs a warning telegraph, not an empty screen.** Radiant Silvergun and Ikaruga both use a WARNING sign. Trigger: dispatch 6, with the bosses, and it is the other half of shortening the drain-out.
- **A mid-band body colour is where neither a light nor a dark companion reads.** `undertaker` sits at luma 41.39, and both halves of any outline pair fall under the fine-detail bracket against it: 27.86 at best. `bansheeDark` at 29.53 is the same problem. Both are in `SEPARATION_EXCEPTIONS` with their numbers, and dispatch 6 puts the grave's rim over both of them. Trigger: dispatch 6.
- **#38 inherits section 4.15 and needs to be told which parts it may re-decide.** The band's construction and the outline table are structural and survive a re-palette; the individual hexes are #38's to change inside those rules. Post it as a comment on #38 when this dispatch lands.
- **The ghoul's name carries a mechanic promise.** A ghoul is a grave robber that feeds on the dead, so a ghoul that swallows a corpse before the grave reaches it would be the most thematically exact mob this game could have. If that is never built the name is a small lie. Trigger: mob variety, alongside banshee shedding.
- **The instruments do not exist yet.** The tracer plan section 5 lists eleven of them and this dispatch produces the events several of them read. `src/dev/instruments.ts` is unowned by any dispatch and should be claimed by dispatch 7 explicitly.
- **`user-scalable=no` in `index.html` fails WCAG SC 1.4.4 and is dead configuration.** Trigger: #38, which owns the dressing and the accessibility sweep.
- **Nothing owns retiring the corner readouts, `?size=`, `#/digest` or `#/prototypes`.** Trigger: #38.
- **`PausePopup`'s `BlurFilter` is load-bearing and #38 must not strip it as dressing.** It is what stops a pause menu opening a "pause and read the curtain" line.
- **`GRAVE_ASPECT` silently sets the Undertaker's difficulty**, because his curtain gap is grave width plus a margin. Trigger: dispatch 6.
- **`DRAG_RATIO` is the input-parity dial and dodge windows have to be authored against the slower input.** Trigger: dispatch 6 for the Undertaker, dispatch 7 for tuning.
- **The belch firing on any second pointer is a misfire risk on the scarcest thing in the game.** Every serious mobile shmup ships the binding as a choice. Trigger: dispatch 5.
- **There is no render interpolation**, so above 60 Hz the grave holds for two or three frames and jumps. `clock.remainderMs` is already the alpha if it is ever built.
- **`GRAVE_RIM_STROKE`'s 2 CSS pixel floor is a phone claim held in a field-unit constant**, and at a 320-wide viewport the rim renders at 1.78 CSS pixels.
- **The title screen's tagline has never been checked by eye on a phone.** Check it during the dispatch-5 play.
- **The bled score does not scatter as swallowable scraps.** Parked by Mark on 2026-08-20. The trigger is the #31 playtest's spiral-versus-comeback read.
