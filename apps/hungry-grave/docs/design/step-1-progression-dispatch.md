# Dispatch plan: path step 1, progression mechanics

Planning half only, written per `docs/agents/feature-playbook.md`. No production code was written and no repo file was edited for this plan.

Every claim below about existing code cites a file and a line, read in this worktree at the branch tip. Prototype code under `src/prototypes/ugly-slice/` is never touched (ADR 0010); its `BELL_PUSH_BY_LEVEL` at `src/prototypes/ugly-slice/game/tuning.ts:96` and its `dropsPaid` at `src/prototypes/ugly-slice/game/sim.ts:47` are name collisions, not readers.

The stream line is the skull stream throughout. Combat magnitudes appear only as data rows marked initial.

---

## 1. Definition, in observable terms

**Carriers meter power (ADR 0002, ADR 0048).** A headless caller runs a stage and sees `dropSpawned` events only on the tick a carrier mob died, never on any other kill. Killing ordinary trash pays corpses, growth, reservoir charge and score, and pays nothing toward power. A run that kills every carrier in the schedule can reach every line at level five with carriers left over; a run that misses some meets the boss under-built and nothing in the game hands the missed power back. A player sees a distinguishable mob arrive in a wave, and killing that one mob is the only thing that ever puts an offer on the field.

**The offer of three, and the bank (ADR 0034).** A carrier's death spawns three option bodies side by side at the death point, each drawn as its own line's silhouette, drifting down with the field like any other food. The grave passes under exactly one and the other two vanish on that tick. Options are lines the run has not maxed: unowned lines and level-ups of owned lines, never a maxed one. The first offer of a run always holds the skull stream plus two unowned lines. Exactly one offer stands at a time; a carrier killed while an offer is live increments a bank shown on the field, and when the live offer resolves the next one opens from the bank. A headless caller sees `offerOpened`, then exactly one of `offerTaken` or `offerLost`, then the next `offerOpened` if the bank was non-zero.

**The thinned birthright (ADR 0045).** A fresh run starts with the skull stream at level one and nothing else: no Territory patches, no wisps, no toll until a drop buys one. The floor ladder strips back to that same single line, so a stripped player at the size floor is firing one column of skulls and nothing else.

**A run's roster is a resolved value (ADR 0046).** `RunState` carries the roster the run is fielding, the header records that roster rather than the build's compiled list, and the offer never offers a line outside it. Today the pool holds four lines and every run's roster is all four, so nothing visibly changes for a player; what changes is that the interface exists and a tape naming a roster this build can implement replays even when it names fewer lines than the build has.

**The skull stream rename.** Every identifier, event payload, damage-source string, tuning key and recorded roster name that said `soulStream` says `skullStream`. A tape recorded before the rename still decodes and still reports its header truthfully, and refuses replay with the precise message that it names a roster this build does not implement (ADR 0043). No wire format version is spent.

**The belch split (ADR 0008).** One press at a full reservoir clears every mob-fire shot on the whole field and kills only the mobs inside a radius of the grave. A player sees the air go clean and the crowd still walking, and the storm eats what the burst did not reach. A headless caller sees `belched` with a `cancelled` count covering every live shot and a `killed` count covering only mobs inside the burst radius.

**The bell arcs (ADR 0036).** A toll throws forward cones instead of a ring: one cone at level one, more at each level, wrapping toward the sides until the top of the line has the surround back at field scale. The timer and the distance falloff are untouched. A player at level one sees the toll answer what is ahead and sees nothing happen behind the grave; a player at level five sees mobs shoved out of the space around the grave and into the skull stream's fire. Angles, reach, damage and push per level are tuning rows.

**Freshness pays each line in its own currency (ADR 0058, #68).** Swallowing a nearly empty corpse launches fewer wisps, never fewer than one, and buys a shorter surge, never fewer skull columns. A player sees a rotten corpse still do something, and never sees a level-five stream draw itself as a level-two one.

---

## 2. Already built, partly built, absent

| Ruling | ADR | What exists today (file:line) | What is missing |
| --- | --- | --- | --- |
| Corpses are fuel | 0002 | Fully built: `swallow.ts:99-127` pays growth, reservoir and overflow through one verb | Nothing |
| Power metered by carriers | 0002, 0048 | **Absent.** Power is priced in kills: `drops.ts:26-28` `DROP_PRICES`, `drops.ts:79-88` `creditKill`, called per kill at `step.ts:134`. `RunState.killsSinceDrop` and `dropsPaid` at `run.ts:92,94` | The carrier concept, the carrier column on stage rows, the slack number, the schedule, `carrierLost`, and the retirement of the price table and its two state fields |
| A drop body on the field | 0002 | Built: `corpses.ts:247-269` `spawnDrop`, never decaying, `DROP_HALF_EXTENT` 14 at `corpses.ts:53`, silhouette per line at `foodSprite.ts:189-253` | Nothing for a single body |
| An offer of three | 0034 | **Absent.** One body per drop, its line rolled by dice at `drops.ts:65-69` `rollDropLine` | The three-body spawn, the sibling vanish, the option pool rule, the fixed first offer, the two-touch tie-break |
| One live offer, bank | 0034 | **Absent.** Several drops can stand at once today | The live-offer field, the bank counter, the bank shown on the field, the next-offer opening |
| Maxed line never offered | 0034 | Partly: `swallow.ts:79-89` `payLevel` converts a maxed line's drop to overflow after the fact | The line is never offered in the first place; the overflow branch goes dormant |
| Birthright is the skull stream alone | 0045 | **Partly.** The mechanism exists: `roster.ts:14` `BIRTHRIGHT`, read by `run.ts:145`, `grave.ts:142`, `invariants.ts:437`. Its value is `['soulStream','territory']` | The value, and every test that pins the old pair (`roster.test.ts:12`, `run.test.ts:51`, `grave.test.ts:234,274,280`) |
| A run's roster from a growing pool | 0046 | **Partly.** The tape already records a roster by name, length-prefixed: `segments.ts:85-90`, resolved at `startingLevels.ts:40-70`. But it records the build's list, written at `tapeHeader.ts:78` and `record-conditioned.ts:143`, and `implementsRoster` at `startingLevels.ts:40-45` demands an exact set match | `RunState.roster`, the header writing the run's roster, `implementsRoster` widened to a subset test, the offer reading the roster. The unlock store is out of scope (see section 9) |
| Skull stream rename | glossary `CONTEXT.md:53` | **Absent in code.** 30 files name `soulStream`; the production readers are `roster.ts:4,7`, `soulStream.ts` (whole file), `swallow.ts:7`, `run.ts:11-12`, `step.ts:13`, `storm.ts:24,61`, `invariants.ts:21`, `witness.ts:97`, `StormRenderer.ts:6`, `foodSprite.ts:195,270`, `digest.ts:203,298`, `fieldPerLine.ts:47`, `record-conditioned.ts:5` | The rename, plus the ADR 0043 old-tape reading |
| Belch: gas everywhere | 0008 | Built: `belch.ts:10-18` `cancelMobFire` takes every live shot | Nothing |
| Belch: burst nearby | 0008 | **Absent.** `belch.ts:32-40` `wipeEnteredMobs` kills every mob that has entered the field | The radius, and the reduction of the wipe to a local burst |
| Belch: full only, splash | 0008 | Built: `belch.ts:57`, `swallow.ts:49-71` | Nothing |
| Bell on a timer, falloff | 0036 | Built: `bell.ts:32` `BELL_PERIOD`, `bell.ts:79-82` `proximity` | Nothing; both stand |
| Bell throws cones | 0036 | **Absent.** `bell.ts:11-29` `BellRing` and `bell.ts:147-169` `sweepRing` are a full-circle radius test | Cone count, half-angle and direction per level; the angular test; the renderer at `StormRenderer.ts:594-598` |
| Bell push felt at more than the top levels | 0036 | Partly: `bell.ts:99-127` `pushMob` works; `BELL_PUSH_BY_LEVEL` at `bell.ts:64` is `[0,0,0,0,20,40]`, so four of six levels never push | Push rows that reach below level four |
| Freshness scales growth and reservoir | 0004 | Built: `swallow.ts:25-27,100` | Nothing |
| Freshness scales the wisp count | 0058 | **Absent.** `wisps.ts:167` reads `WISPS_BY_LEVEL[level]` with no freshness anywhere in the module | The count scaling and the one-soul floor |
| Freshness scales the surge length | 0058 | **Absent.** `soulStream.ts:216-218` `surgeStream` sets a constant | The volley scaling and the one-volley floor |

Two structural facts the gap table depends on, both verified rather than assumed:

- The tape's header writes the roster by name, length-prefixed (`segments.ts:85-90`), and the decoder never validates it against the build's list (`records.ts:108-109`). So the rename costs no format version, and old tapes decode.
- `FORMAT_VERSION` is 2 (`wireCodes.ts:28`) and `decode.ts:189` refuses anything else. Nothing in this step moves it.

---

## 3. Verification steps

**Actor: agent.**

1. Unit tests at the seams named in section 4, per the list in section 6. Run with `pnpm vitest run` from `apps/hungry-grave/`.
2. `pnpm typecheck` from `apps/hungry-grave/`. Only this judges diagnostics.
3. `pnpm build` from `apps/hungry-grave/` (it runs lint and typecheck first, `package.json` `"build"`).
4. `pnpm verify` at the repo root, which is `format:check && lint && typecheck && test` across the workspace (root `package.json`).
5. **Golden digest and bot test, per slice.** Every behaviour-changing slice regenerates `GOLDEN` (`src/dev/digest.ts:276`) in the same commit as the behaviour, and the agent reads the `GOLDEN` diff field by field. ADR 0019's convention is that the regeneration commit comes first and its diff touches only what the change claims to move; a field moving that the slice did not claim is a stop-and-report, not a re-blessing. The bot test's drop band at `src/dev/__tests__/bot.test.ts:294-295` (`>= 10` and `<= 12`) came from the retired price table and is rewritten to the carrier schedule's own count.
6. **Headless conditioned run, offer and carriers, no browser.** From `apps/hungry-grave/`:
   `pnpm vite-node --config vite.headless.config.ts scripts/record-conditioned.ts /tmp/step1-a.tape 2093383922 12000 skullStream=1 territory=0 wisps=0 bell=0`
   then `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts /tmp/step1-a.tape`.
   Passing means: the measurement names `skullStream` in its per-line readings; `dropSpawned` count equals three times the `offerOpened` count; every `offerOpened` is followed by exactly one `offerTaken` or `offerLost` before the next; `offerTaken` count plus `offerLost` count never exceeds carriers killed; and no invariant fault fired.
7. **Headless conditioned run, bell cones at the levels that push.** Same recorder at `bell=1`, `bell=3` and `bell=5`, then measure each. Passing means `mobShoved` events and a non-zero repel total (`src/dev/readings/repel.ts`) appear at `bell=1` and at `bell=3`, which is impossible today because push is zero below level four. The `bell=5` repel total is **reported beside the 42, 51 and 0 field units #79 read, not judged against them**: level five keeps its push of 40 and the falloff and reach barely move, so a level-five run cannot beat those figures by construction and a pass criterion that asked it to would be asking the slice to retune the top of the ladder blind. Step 4's harness is what judges the magnitudes.
8. **Old-tape decode check.** Take one tape recorded before this step (record it at the branch tip before slice 1 lands, saved outside the repo), and after the rename run `scripts/measure.ts` on it. Passing means the tool reports the tape's recorded roster containing `soulStream` verbatim, reports the header fields it can, and refuses replay with the not-implemented roster message rather than throwing a format error or silently coercing. This is ADR 0043's precise-refusal contract and it is the check that proves the rename cost no format version.
9. **Rendered check.** `pnpm build && pnpm exec vite preview` from `apps/hungry-grave/`, then a screenshot the agent actually reads, of: three offer bodies standing side by side on the field with three distinct silhouettes; the bank readout when a second carrier dies under a live offer; a level-one toll showing one forward cone; a level-five toll showing the surround. The level-five shot is taken through the pinned-replay path (a recorded tape rendered at a chosen tick) so it is deterministic. The agent states which reads it obtained and which it did not.
10. **Fence and invariant guards** are ordinary tests and are listed in section 6, but they are named here because they are the step's own architectural verification: no policy module names a weapon line, and no new `RunState` field escapes the witness partition.

**Actor: human (Mark). Named as still open in the agent's report.**

11. **The push of the bell.** Whether a toll visibly shoves, whether the cone at level one reads as an answer rather than as a hole, and whether the surround at level five reads as cones rather than as the old circle. ADR 0036 states the requirement as a feel: "a repel line the player cannot see repelling is not a repel line." No test the agent can run can see this.
12. **How fast a stripped player recovers at the thinner birthright.** ADR 0045 names it as a tape watch item and the handoff carries it as an open play question. The agent can report the numbers (ticks from `weaponStripped` to the next `offerTaken`, across the harness seeds) and cannot judge them.
13. **Whether the gas becomes the new lean.** The belch split makes one press cheap in kills and total in shots; whether the player now presses it constantly is a hand question.

---

## 4. Seams under test

Signatures below are the contract the coding agent implements. Every public name carries a glossary word (`CONTEXT.md`).

### `src/game/offer.ts` (new)

```ts
// An offer live on the field: the options and the bodies carrying them.
interface Offer {
  readonly options: readonly WeaponLine[];
  // The entity ids of the option bodies, one per option, in the same order.
  readonly bodyIds: readonly number[];
}

// The lines this run may still be offered: in the roster, below MAX_LEVEL.
const offerableLines: (state: RunState) => readonly WeaponLine[];

// Puts an offer on the field at a point, or banks it when one already stands.
const openOffer: (state: RunState, x: number, y: number) => SimEvent[];

// Which body of the live offer a grave covering more than one takes.
const chooseOfferBody: (state: RunState, covered: readonly Corpse[]) => Corpse | null;

// The take: the siblings vanish and the bank opens the next offer.
const resolveOffer: (state: RunState, takenId: number) => SimEvent[];

// The offer's bodies scrolled off with none taken.
const loseOffer: (state: RunState) => SimEvent[];

const OFFER_SIZE: number;
const OFFER_SPACING: number;
const OFFER_ENTRY_DEPTH: number;

export { offerableLines, openOffer, chooseOfferBody, resolveOffer, loseOffer, OFFER_SIZE, OFFER_SPACING, OFFER_ENTRY_DEPTH };
export type { Offer };
```

**`Offer` is a genuine design decision and needs review before dispatch.** It is a new public interface the harness (step 3), the ladder (step 5) and the store's readings (step 6) all depend on. Two choices inside it are the reviewable part: the options are a list of `WeaponLine` and never a list of richer option records, because nothing today offers anything but a line level-up; and the bodies are held by entity id rather than by slot index, on the precedent of `bell.ts:19-27`'s struck set, because a recycled slot is a different body.

### `src/game/carriers.ts` (new)

```ts
// A carrier schedule row: which of a stage row's mobs carry the offer.
interface CarrierRow {
  // Indices into the stage row's placement order that carry. Deterministic and authored.
  readonly carrying: readonly number[];
}

// How many carriers a run must kill to reach every line's top level.
const carriersForFullBuild: () => number;

// How many the schedule must hold, full build plus the slack (ADR 0048).
const carriersScheduled: () => number;

const CARRIER_SLACK: number;

export { carriersForFullBuild, carriersScheduled, CARRIER_SLACK };
export type { CarrierRow };
```

**`CarrierRow` and the derivation are a genuine design decision and need review.** The reviewable part is that the schedule's size is derived from the roster rather than authored as a magnitude: `carriersForFullBuild()` is `(MAX_LEVEL - BIRTHRIGHT_LEVEL) * BIRTHRIGHT.length + MAX_LEVEL * (WEAPON_LINES.length - BIRTHRIGHT.length)`, which is 4 + 15 = 19 at today's roster, and `carriersScheduled()` is that times `CARRIER_SLACK`. A fifth line moves both numbers with no edit here, which is what the standing extensibility constraint asks for.

### `src/game/lines/roster.ts` (changed)

```ts
type WeaponLine = 'skullStream' | 'territory' | 'wisps' | 'bell';
const WEAPON_LINES: readonly WeaponLine[];
// The one line every run fields and the ladder strips back to (ADR 0045, ADR 0046).
const BIRTHRIGHT: readonly WeaponLine[];   // ['skullStream']
const MAX_LEVEL: number;
// Whether every name is a line this build implements (ADR 0043, ADR 0046).
const implementsLines: (names: readonly string[]) => boolean;
```

**`implementsLines` is a genuine design decision and needs review.** It replaces `startingLevels.ts:40-45`'s exact-set test with a subset test, which changes a refusal: a tape naming three of this build's four lines becomes replayable where today it is refused. ADR 0046 requires it (a run's roster is drawn from a growing pool, so a recorded roster is smaller than the pool). The refusal that stays is a tape naming a line this build does not have, which is exactly what an old `soulStream` tape does.

### `src/game/lines/skullStream.ts` (renamed from `soulStream.ts`)

```ts
// A swallow's surge, its length scaled by the corpse's freshness (ADR 0058).
const surgeStream: (state: RunState, freshness: number) => void;
const SURGE_VOLLEYS: number;
const SURGE_FLOOR_VOLLEYS: number;
```

### `src/game/lines/wisps.ts` (changed)

```ts
// One swallow's volley, its count scaled by the corpse's freshness (ADR 0058).
const launchWisps: (state: RunState, events: SimEvent[], freshness: number) => void;
const WISP_FLOOR_SOULS: number;
```

### `src/game/lines/bell.ts` (changed)

```ts
// What one level's toll throws. Angles in radians, reach and push in field units.
interface ConeRow {
  // Where each cone points, zero being straight up and negative to the left. The cone count is the length.
  readonly headings: readonly number[];
  readonly halfAngle: number;
  readonly reach: number;
  readonly push: number;
}

// The live toll: its cones, expanding on one clock.
interface BellToll {
  readonly level: number;
  ticks: number;
  readonly struck: Set<number>;
}

const BELL_CONE_ROWS: readonly ConeRow[];
// How far the leading edge of this toll's cones stands from the grave.
const tollReach: (toll: BellToll) => number;
// The heading of cone `index` of a toll at this level, in radians, zero being straight up.
const coneHeading: (level: number, index: number) => number;
// Whether a bearing from the grave falls inside any cone of this level.
const insideCone: (level: number, bearing: number) => boolean;
const advanceBell: (state: RunState) => SimEvent[];
```

**`ConeRow` is a genuine design decision and needs review.** It is the per-line tuning row shape the standing constraint asks for, and it is the template a fifth line's rows copy. Four fields and no more: a fifth field would need a caller today (cited-future rule).

**The headings are a data row and never a formula (gate correction, 2026-09-08).** An even `k * (2*pi/n)` spacing puts level two's second cone dead astern, which is the opposite of "wrapping toward the sides as they multiply". So the row carries the headings themselves, the harness tunes them at step 4 the way it tunes reach and push, and `coneHeading(level, index)` reads the row rather than computing anything.

### `src/game/belch.ts` (changed)

```ts
const fireBelch: (state: RunState) => SimEvent[];
const BELCH_BURST_RADIUS: number;
```

### `src/game/run.ts` (changed)

```ts
interface RunState {
  // ... unchanged fields ...
  // The lines this run is fielding, resolved at createRun (ADR 0046).
  readonly roster: readonly WeaponLine[];
  // The one offer standing on the field, or null (ADR 0034).
  offer: Offer | null;
  // Carriers killed under a live offer, waiting their turn (ADR 0034).
  bankedOffers: number;
  // killsSinceDrop and dropsPaid are gone with the price table (ADR 0002).
}

const createRun: (
  seed?: number,
  startingSize?: number,
  startingLevels?: Readonly<Record<WeaponLine, number>>,
  roster?: readonly WeaponLine[],
) => RunState;
```

### `src/game/events.ts` (changed)

```ts
interface MobKilled {
  readonly type: 'mobKilled';
  readonly id: number;
  readonly mob: MobType;
  readonly x: number;
  readonly y: number;
  // Whether this mob carried the offer (ADR 0002). Values travel, references never do.
  readonly carried: boolean;
}

interface OfferOpened { readonly type: 'offerOpened'; readonly options: readonly WeaponLine[]; readonly x: number; readonly y: number; readonly banked: number }
interface OfferBanked { readonly type: 'offerBanked'; readonly banked: number }
interface OfferTaken { readonly type: 'offerTaken'; readonly line: WeaponLine; readonly passed: readonly WeaponLine[] }
interface OfferLost { readonly type: 'offerLost'; readonly options: readonly WeaponLine[] }
interface CarrierLost { readonly type: 'carrierLost'; readonly mob: MobType; readonly x: number }
```

**These five events are a genuine design decision and need review.** They are the vocabulary the harness's take-rate reading, the ladder's gain animation and the store's per-run columns are all built on, and `lessons.md` names the event vocabulary as one of the four things expensive to unpick later. `offerLost` and `carrierLost` are separate on the `corpseExpired`/`corpseLost` precedent at `events.ts:139-165`: an offer nobody dove for and a carrier nobody killed mean opposite things to an instrument.

### `src/game/mobs.ts` (changed)

```ts
interface Mob {
  // ... unchanged ...
  // Whether this mob carries the offer (ADR 0002). Authored, never directed.
  carries: boolean;
}
const spawnMob: (state: RunState, type: MobType, order: SpawnOrder, carries: boolean) => Mob | null;
// A mob past an edge is culled; a carrier culled unkilled reports it (ADR 0048).
const cullMobs: (state: RunState) => SimEvent[];
```

`cullMobs` changing from `void` to `SimEvent[]` is the one signature break outside the modules above; its single caller is `step.ts:175`.

---

## 5. Module boundaries

Every module below is owned by this dispatch unless its row says otherwise.

| Module | New or changed | What it is for | Owner |
| --- | --- | --- | --- |
| `src/game/offer.ts` | New | The offer of three, the take, the sibling vanish and the bank. Owns ADR 0034 entirely. Public interface in one export block at the module end. | This dispatch |
| `src/game/carriers.ts` | New | What a carrier is worth to the schedule: the full-build derivation, the slack, and the rule assigning carriers to a stage row's placement indices. Owns ADR 0048's slack. | This dispatch |
| `src/game/drops.ts` | **Deleted** | Its price table, `priceOfNextDrop`, `rollDropLine` and `creditKill` all retire with ADR 0002's supersession. `spawnDrop` already lives in `corpses.ts:247`, so nothing moves. `src/game/__tests__/drops.test.ts` is deleted with it and its surviving assertions move to `offer.test.ts`. | This dispatch |
| `src/game/lines/roster.ts` | Changed | The line identities, the birthright, the max level, and the roster-implemented test. Imports nothing (`roster.ts:1-19` today), and must keep importing nothing, so the cycle guard in `src/__tests__/boundary.test.ts:16-18` stays green. | This dispatch |
| `src/game/lines/skullStream.ts` | Renamed and changed | The skull stream, its level rows and its freshness-scaled surge. | This dispatch |
| `src/game/lines/wisps.ts` | Changed | Freshness-scaled soul count with a one-soul floor. | This dispatch |
| `src/game/lines/bell.ts` | Changed | The toll's cones: the per-level rows, the headings, the angular sweep. Timer, falloff and the push clamp stand. | This dispatch |
| `src/game/lines/territory.ts` | Unchanged except the rename sweep | Nothing in step 1 touches Territory's rules. | This dispatch (rename only) |
| `src/game/belch.ts` | Changed | The split: gas field-wide, burst local. | This dispatch |
| `src/game/swallow.ts` | Changed | Passes freshness to the two on-swallow lines; routes a drop's level through `resolveOffer`. | This dispatch |
| `src/game/step.ts` | Changed | `resolveDeaths` opens offers off carrier deaths instead of crediting kills; `resolveSwallows` asks `chooseOfferBody` before swallowing. | This dispatch |
| `src/game/mobs.ts` | Changed | The `carries` flag, the `carried` field on `mobKilled`, `cullMobs` reporting a lost carrier. | This dispatch |
| `src/game/stage/stage.ts` | Changed | `StageRow` gains its carrier column and the rows gain carriers. The full re-authoring of the stage is **step 2**; step 1 only puts enough carriers on the existing rows to satisfy `carriersScheduled()` so the harness and the bot test have a real schedule to read. | This dispatch for the column and a first schedule; **step 2 owns the authored schedule** |
| `src/game/run.ts` | Changed | `RunState` gains `roster`, `offer`, `bankedOffers` and loses `killsSinceDrop`, `dropsPaid`. | This dispatch |
| `src/game/witness.ts` | Changed | `WITNESS_VERSION` 4 to 5; folds the offer, the bank, the carrier flag; drops the two retired counters; `WEAPON_LINE_CODES` key renamed keeping code 1. | This dispatch |
| `src/game/invariants.ts` | Changed | New checks: one live offer, offer bodies alive and matching, bank not negative. Retires the two `checkFinite` calls at `invariants.ts:77-78`. | This dispatch |
| `src/game/faults.ts` | Changed | Appends the new fault identities to `FAULT_IDENTITIES` (`faults.ts:18-34`) and their severities. | This dispatch |
| `src/tape/wireCodes.ts` | Changed | Appends the new fault identity codes to `FAULT_IDENTITY_CODES` (`wireCodes.ts:96-109`). `FORMAT_VERSION` does not move. | This dispatch |
| `src/tape/startingLevels.ts` | Changed | `implementsRoster` delegates to `roster.ts`'s `implementsLines` (subset). | This dispatch |
| `src/app/tapeHeader.ts` | Changed | Writes `run.roster` at `tapeHeader.ts:78` instead of `[...WEAPON_LINES]`. | This dispatch |
| `src/app/screens/game/foodSprite.ts` | Changed | The rename at `foodSprite.ts:195,270`. The four silhouettes stand. | This dispatch |
| `src/app/screens/game/StormRenderer.ts` | Changed | Draws cones instead of a ring at `StormRenderer.ts:594-598`. | This dispatch |
| `src/app/screens/game/RunHud.ts` | Changed | The bank readout beside `levelsReadout` (`RunHud.ts:98-105`), which is already line-agnostic. | This dispatch |
| `src/dev/digest.ts` | Changed | The rename at `digest.ts:203,298`; `GOLDEN` regenerated per slice. | This dispatch |
| `src/dev/readings/fieldPerLine.ts` | Changed | The key rename at `fieldPerLine.ts:47`. | This dispatch |
| `src/dev/readings/dropLedger.ts` | Changed | Its three terminal ends now include an offer's two passed siblings, which are neither swallowed nor lost. | This dispatch |
| `src/dev/bot.ts` | Unchanged | The offer in the policy is **step 3**. The bot still only dodges (`lessons.md` "the bot is not a player"), so step 1's headless runs read carriers reached, not offers taken by choice. | **Unowned in step 1; step 3 owns it** |
| `scripts/record-conditioned.ts` | Changed | The usage string at `record-conditioned.ts:5` and the header roster at `:143`. The `line=N` arguments are already generated from `WEAPON_LINES` (`:34-36`), so the rename flows on its own. | This dispatch |
| The unlock pool store | **Not built** | ADR 0046's cross-run persistence. **Unowned, with a trigger:** it is built when a second run-to-run unlock exists to store, and ADR 0046 requires a ruling on denied or evicted browser storage before that dispatch starts. | **Unowned, trigger recorded** |
| A fifth line's drop silhouette | **Not built** | `docs/design/drop-legibility-fix.md` states the coarse silhouette axis is exhausted at four lines. **Unowned, with a trigger:** the first fifth-line proposal. | **Unowned, trigger recorded** |

### Where the per-line tuning rows live, and the fifth-line recipe

Each line's level-indexed rows live in that line's own module and are exported at its module end. That is the shape `tuning.ts:1-3` already declares ("a weapon line owns its level curve, in their own modules"), and it is what keeps a fifth line from touching another line's numbers. The rows are:

- `skullStream.ts`: `COLUMNS_BY_LEVEL` (`soulStream.ts:24`), `STREAM_INTERVAL`, `SURGE_VOLLEYS`, `SURGE_FLOOR_VOLLEYS`.
- `wisps.ts`: `WISPS_BY_LEVEL` (`wisps.ts:39`), `WISP_FLOOR_SOULS`.
- `bell.ts`: `BELL_CONE_ROWS`, one `ConeRow` per level.
- `territory.ts`: its existing ladders, untouched.

Nothing outside a line's own module indexes that line's rows, and no policy names a line. The three policies that could are `offer.ts`, `carriers.ts` and `src/dev/bot.ts`, and the fence test in section 6 holds all three.

**Adding a fifth line is one module plus rows, plus four registrations that cannot be folded and are named here so nobody discovers them late.** The module is `src/game/lines/<name>.ts` with its own rows and its `advance` or `launch` seam. The registrations are: one member in `WeaponLine` and `WEAPON_LINES` (`roster.ts:4-11`); one call in `step.ts`'s `advanceLines` (`step.ts:105-111`) or in `swallow.ts`; one code in `WEAPON_LINE_CODES` (`witness.ts:96-101`), which is append-only by the wire rule and cannot be generated; one silhouette in `drawDropIcon` (`foodSprite.ts:189`), which cannot live in the sim because `src/game` may not import rendering (`boundary.test.ts` allowlist). The header costs nothing: `segments.ts:85-90` writes the roster length-prefixed by name, so a fifth line spends no format version. `carriersForFullBuild()` and every offer rule move on their own.

---

## 6. Planned test list

Every test is written as a `test.todo` placeholder against a stub before implementation. Spec tests first, each quoting the ADR sentence it pins.

### Spec tests from the ADRs

**`src/game/__tests__/offer.test.ts`**

1. *A carrier's death is the only thing that ever puts a drop on the field.* Pins ADR 0002: "Power is metered by carriers: specific authored mobs carry the offer, and killing one drops it where it died."
2. *A hundred trash kills with no carrier among them pay no drop at all.* Pins ADR 0002: "kills keep every other job they had ... score is kills, and killing buys room to live", with power removed from that list.
3. *A drop spawns three option bodies side by side and apart from each other.* Pins ADR 0034: "three option bodies falling side by side and apart from each other."
4. *The grave gets exactly the one it passes under and the other two vanish.* Pins ADR 0034: "the grave gets exactly the one it passes under, the other two vanishing."
5. *Options are drawn from unowned lines and level-ups of owned, un-maxed lines.* Pins ADR 0034: "options draw from the lines still unowned plus level-ups of owned, un-maxed lines."
6. *A maxed line is never offered.* Pins ADR 0034: "a maxed line is never offered."
7. *The offer shrinks below three as lines max.* Pins ADR 0034: "The offer shrinks below three as lines max."
8. *The first offer of a run holds the skull stream and two unowned lines.* Pins ADR 0034: "The first offer of a run is fixed in shape, the skull stream and two unowned lines."
9. *Exactly one offer is live at a time.* Pins ADR 0034: "Exactly one offer is live at a time."
10. *A carrier killed while an offer stands banks toward the next one.* Pins ADR 0034: "A second drop paid while an offer stands banks toward the next one."
11. *The bank is reported on the live offer.* Pins ADR 0034: "the bank shows on the live offer so a burst of paying kills still reads as paid."
12. *A banked offer opens once the live one resolves, and the bank falls by one.* Pins ADR 0034's bank as the rule for the burst corner.
13. *Nothing offerable converts the carrier's pay to a body that is never worthless.* Pins ADR 0034: "when nothing is offerable a paid drop converts to overflow, keeping ADR 0002's nothing-swallowed-is-worthless promise."
14. *The take is a movement input and adds no command channel.* Pins ADR 0034: "the take as a movement input already on the tape so replay still runs from the seed plus inputs alone." Asserts `TickCommand` (`command.ts:19-22`) gains no field.

**`src/game/__tests__/carriers.test.ts`**

15. *A carrier the player never kills pays nothing, and nothing reaches after the player to make it up.* Pins ADR 0048: "A carrier the player never kills pays nothing, and nothing in the game reaches after the player to make up for it."
16. *The schedule holds more carriers than a full build needs.* Pins ADR 0048: "it holds more carriers than a full build needs, so missing one costs a step rather than the run."
17. *An offer never drifts toward the grave and never holds still waiting to be taken.* Pins ADR 0048's rejected alternative: "An offer that drifts toward the grave, or holds still until it is taken, is Raiden's lingering icon." Asserts an offer body's only motion is the scroll, on the `corpses.ts:58-65` coupling.
18. *Nothing reads the player's power to decide where a carrier goes.* Pins ADR 0048's second rejection: a catch-up carrier "needs something that reads how much power the player is holding." The fence form: `carriers.ts` never reads `state.levels`.

**`src/game/lines/__tests__/roster.test.ts`**

19. *A run starts with exactly one line, the skull stream at level one.* Pins ADR 0045: "A run starts with exactly one line, the skull stream at level 1."
20. *The floor ladder strips back to the same single line the run started with.* Pins ADR 0045: "ADR 0003's floor ladder strips back to that same list, so start state and floor state keep one shared rule."
21. *No line but the skull stream is forced into every run.* Pins ADR 0045: "no line but the skull stream is forced into every run, which the growing pool (ADR 0046) requires."
22. *The skull stream is the one constant of every run's roster.* Pins ADR 0046: "each run fields a roster drawn from it, with the skull stream the one constant every run."

**`src/tape/__tests__/startingLevels.test.ts`**

23. *A tape naming a roster this build implements replays even when it names fewer lines than the build has.* Pins ADR 0046: "a tape must replay without the player's unlock state, so the header records the run's resolved roster."
24. *A tape naming a line this build does not implement is reported truthfully and refused for replay.* Pins ADR 0043: "A tape naming a line this build does not implement is still readable: its header is reported as recorded, in the tape's own vocabulary ... It is not replayable by that build."
25. *A tape recorded under the old stream name still decodes and names `soulStream` verbatim.* Pins ADR 0043: "a reader never reinterprets bytes under changed meanings", and pins that the rename spends no format version.

**`src/game/__tests__/belch.test.ts`**

26. *The gas smothers every mob-fire shot on the whole field.* Pins ADR 0008: "The gas smothers every mob-fire shot on the whole field, boss patterns included, and kills nothing."
27. *The burst kills only the mobs within a local radius of the grave.* Pins ADR 0008: "The burst kills the mobs within a local radius of the grave."
28. *A press clears the air and leaves mobs outside the radius walking.* Pins ADR 0008: "A press that clears the air and leaves the mobs walking hands the wave back to the storm."
29. *The belch fires only at a full reservoir and never as a partial bomb.* Pins ADR 0008: "The one button fires only at a full reservoir, never as a partial bomb." (Already true at `belch.ts:57`; the test is the deliberate-absence guard that it stays true through the split.)
30. *A belched kill leaves a corpse like any other kill.* Pins ADR 0008: "belch kills as ordinary corpse-leaving kills."

**`src/game/lines/__tests__/bell.test.ts`**

31. *Level one throws one cone forward.* Pins ADR 0036: "Level one throws one cone forward."
32. *Higher levels throw more cones, wrapping toward the sides as they multiply.* Pins ADR 0036: "Higher levels throw more of them, wrapping around toward the sides as they multiply."
33. *The top of the line has the surround back at field scale.* Pins ADR 0036: "the top of the line earns back the whole surround at field scale."
34. *The sides and the rear are open at level one.* Pins ADR 0036: "The cost of a cone is knowingly taken at level one: the sides and the rear are open." The deliberate-absence guard: a mob directly behind the grave takes nothing from a level-one toll.
35. *Reach grows with level.* Pins ADR 0036: "Reach grows with level to widen the answer while the cone count is still low."
36. *The toll still fires on its own clock and never on a swallow.* Pins ADR 0036: "The bell fires on its own clock rather than on each swallow." (Standing behaviour, guarded through the change.)
37. *Damage still falls off with distance from the grave.* Pins ADR 0036: "Its damage also falls off with distance from the grave, so the far edge tickles rather than kills."
38. *One toll damages a mob once however far the push carries it.* Pins the `bell.ts:14-27` struck-set ruling, which the cone sweep must not lose.
39. *The push is on the field below the top levels.* Pins ADR 0036: "the push is the half that has to be felt, because a repel line the player cannot see repelling is not a repel line", against the recorded evidence that `BELL_PUSH_BY_LEVEL` was zero below the top levels. The test pins the relation (push at level two is greater than zero and rises with level), never a magnitude.
39a. *Every level's cones are symmetric about straight up, and at levels one to four they meet as one contiguous forward arc.* Pins ADR 0036's "wrapping around toward the sides as they multiply" against the shape of the rows themselves, so a heading row edited by the harness cannot quietly become left-handed or grow a hole in the arc ahead. Numbered `39a` rather than renumbering, because the slices below cite these numbers. Level five is deliberately outside the contiguity half: its three slits are the surround arriving, and test 33 is what holds that end.

**`src/game/lines/__tests__/wisps.test.ts`**

40. *A rotten corpse tears loose fewer souls.* Pins ADR 0058: "The wisps pay in souls, so freshness scales the count."
41. *A swallow never tears loose fewer than one soul.* Pins ADR 0058: "floored at one soul, because a bare proportional count pays nothing at level one where the flight is a single wisp and a swallow that fires nothing reads as a bug."
42. *An unowned wisp line fires nothing whatever the freshness.* The floor must not resurrect a line the run does not own; `wisps.ts:36-38` states level zero is silence.

**`src/game/lines/__tests__/skullStream.test.ts`**

43. *A rotten corpse buys a shorter surge.* Pins ADR 0058: "The skull stream pays as a surge ... freshness scales how many volleys the surge pays."
44. *A rotten corpse never makes a level-five stream look like a level-two one.* Pins ADR 0058: "rather than how wide it fires, because the column count is exactly what draws the line's five levels and a rotten corpse must never make a level-five stream look like a level-two one."
45. *A surge is never shorter than one volley.* Same floor reasoning as the wisps' one soul.
46. *A burst is never paid without freshness applied.* Pins ADR 0058: "A test that fails if a burst is ever paid without freshness applied is the point of naming the axis." This is #68's own requested test and it spans both on-swallow lines, so it lives in `src/game/__tests__/swallow.test.ts`.

### Module tests

**`src/game/__tests__/offer.test.ts`**

47. Three bodies open at the death point with the middle one on it and the outer two a spacing either side.
48. Bodies opening near a field edge are held inside the field and never spawn outside it.
49. The option order on the field is the draw order, so the same seed lays the same three in the same places.
50. A grave covering two bodies takes exactly one and the other vanishes on the same tick.
51. An offer whose bodies all scroll off the bottom edge reports lost once, not three times.
52. Taking a body when the bank is zero leaves no offer live.
53. `offerableLines` returns nothing when every line in the roster is maxed.
54. `offerableLines` never returns a line outside the run's roster.

**`src/game/__tests__/carriers.test.ts`**

55. `carriersForFullBuild()` counts the drops a full build costs from the birthright, and moves when the roster grows.
56. `carriersScheduled()` exceeds `carriersForFullBuild()`.
57. The stage's authored carrier count is at least `carriersScheduled()`.
58. A carrier culled off the bottom edge unkilled reports `carrierLost` exactly once.

**`src/game/__tests__/step.test.ts`** (changed)

59. A tick that kills a carrier and ordinary trash together opens exactly one offer.
60. A tick in which the grave covers two offer bodies swallows one and vanishes the other before either pays.
61. The tick order still runs the belch before every overlap pass (`step.ts:150-153`'s stated rule, guarded through the belch split).

**`src/game/__tests__/run.test.ts`** (changed)

62. A fresh run's roster is every line in the pool, and its levels are the birthright.
63. A run built with a smaller roster carries it, and its levels hold zero for the lines outside it.

**`src/game/__tests__/witness.test.ts`** (changed)

64. Moving the live offer moves the witness.
65. Moving the bank moves the witness.
66. Moving a mob's carrier flag moves the witness.
67. `WEAPON_LINE_CODES` keeps code 1 on the renamed skull stream and reuses no retired code.

**`src/game/__tests__/mobs.test.ts`** (changed)

68. A killed carrier's `mobKilled` carries `carried: true` and an ordinary mob's carries false.

**`src/game/__tests__/invariants.test.ts`** (changed)

69. Two live offers raise a fault.
70. An offer whose bodies are not on the field raises a fault.
71. A negative bank raises a fault.

**`src/tape/__tests__/codec.test.ts`** (changed)

72. A header carrying a three-line roster round-trips through encode and decode unchanged.

**`src/app/screens/game/__tests__/StormRenderer.test.ts`** (changed)

73. A level-one toll draws one cone and a level-five toll draws five.

**`src/app/screens/game/__tests__/RunHud.test.ts`** (changed)

74. The bank readout shows the number of banked offers and nothing when the bank is empty.

**`src/dev/readings/__tests__/dropLedger.test.ts`** (changed)

75. Every option body reaches exactly one end: taken, passed, or lost, and the three sum to the bodies spawned.

### Invariants and the architecture fence

**`src/__tests__/lineAgnosticPolicies.test.ts`** (new, a cross-cutting guard in its own file)

76. No policy module names a weapon line: `src/game/offer.ts`, `src/game/carriers.ts` and `src/dev/bot.ts` contain no string literal equal to any member of `WEAPON_LINES`. This is the standing constraint from `path-draft.md` made mechanical.
77. Every per-level tuning row is declared inside its own line's module: no module outside `src/game/lines/<line>.ts` declares a constant whose name begins with that line's own prefix.

**`src/game/__tests__/witness.test.ts`** (existing partition, extended)

78. The witness partition still names every nested field of `RunState` as folded or deliberately excluded, with the retired `killsSinceDrop` and `dropsPaid` removed from both lists (`witness.test.ts:582-583`) and the new fields added.

**`src/__tests__/quietOnTheHappyPath.test.ts`** and **`src/__tests__/boundary.test.ts`** (existing, must stay green)

79. `src/game/lines/roster.ts` still imports nothing, so the cycle guard holds with the roster carrying `implementsLines`.
80. `src/game` still reaches only `src/game`, so `offer.ts` and `carriers.ts` pull nothing from `src/app` or `src/dev`.

**Counts: 46 spec tests, 29 module tests, 5 invariant and fence guards.**

---

## 7. Constants changed, with every reader

Each list is the full grep across `src` and `scripts`, excluding `src/prototypes/` (prototype boundary, ADR 0010).

**`DROP_PRICES` (`drops.ts:26`), `priceOfNextDrop` (`drops.ts:35`), `rollDropLine` (`drops.ts:65`), `creditKill` (`drops.ts:79`): all deleted.**
Readers: `drops.ts:36,37,81,87,90`; `step.ts:9,134`; `src/game/__tests__/drops.test.ts:9-12,42-43,51-53,58,62-64,71-73,88-91,104,113,128,141,152,161,171,180,212` (file deleted); `src/game/__tests__/step.test.ts:10,470`.

**`RunState.killsSinceDrop` and `RunState.dropsPaid` (`run.ts:92,94`): deleted.**
Readers: `run.ts:215-216`; `drops.ts:80-86`; `invariants.ts:77-78`; `witness.ts:245`; `src/game/__tests__/witness.test.ts:91-92,421-428,582-583`; `src/game/__tests__/invariants.test.ts:458-459,606-615`; `src/game/__tests__/step.test.ts:73-74,457,487-488`; `src/game/__tests__/drops.test.ts:93-94,163-164,181`.

**`BIRTHRIGHT` (`roster.ts:14`): the value changes from `['soulStream','territory']` to `['skullStream']`.**
Readers: `run.ts:8,145`; `grave.ts:9,142`; `invariants.ts:19,437`; `roster.ts:18`; `src/game/lines/__tests__/roster.test.ts:5,12,31`; `src/game/__tests__/run.test.ts:10,51`; `src/game/__tests__/grave.test.ts:17,234,274,280`.

**`BELL_RADIUS_BY_LEVEL` (`bell.ts:51`): replaced by `BELL_CONE_ROWS[level].reach`.**
Readers: `bell.ts:68,153,194,216`; `src/game/lines/__tests__/bell.test.ts:23,86-90,98,132,140,162,195,270`.

**`BELL_PUSH_BY_LEVEL` (`bell.ts:64`): replaced by `BELL_CONE_ROWS[level].push`, and the values move.**
Readers: `bell.ts:106,219`; `src/game/lines/__tests__/bell.test.ts:22,235,271,282,294`.

**`BellRing` (`bell.ts:11`): renamed `BellToll` and reshaped.**
Readers: `bell.ts:67,101,149,221`; `run.ts:5,46`; `witness.ts:5,276`; `src/game/lines/territory.ts:216` (a comment citing the struck-set precedent, which stands); `src/game/__tests__/witness.test.ts:17,40`; `src/game/__tests__/invariants.test.ts:21,432`.

**`ringRadius` (`bell.ts:67`): renamed `tollReach`.**
Readers: `bell.ts:176,212`; `src/app/screens/game/StormRenderer.ts:5,594`; `src/game/lines/__tests__/bell.test.ts:24,95,97`.

**`BELL_EXPAND_TICKS` (`bell.ts:39`): the value is unchanged and it is kept as the toll's expansion clock.**
Readers: `bell.ts:68,177,215`; `invariants.ts:20,451`; `StormRenderer.ts:5,598`; `src/game/lines/__tests__/bell.test.ts:20,93,97,103,121,145,151,166,178,228,241,250,269,298,320,342,355,370,390`; `src/game/__tests__/step.test.ts:19,451`; `src/game/__tests__/invariants.test.ts:22,424`; `src/game/__tests__/drops.test.ts:14,157` (file deleted).

**`SURGE_VOLLEYS` (`soulStream.ts:67`): the value is unchanged, but `surgeStream` now scales it by freshness.**
Readers: `soulStream.ts:217,227`; `src/game/lines/__tests__/soulStream.test.ts:28,178,193-196,204,214,217,232`; `src/game/__tests__/mobs.test.ts:27,495,538`.

**`WISPS_BY_LEVEL` (`wisps.ts:39`): the value is unchanged, but `launchWisps` now scales it by freshness.**
Readers: `wisps.ts:167,245`; `src/game/lines/__tests__/wisps.test.ts:24,87,92,152,174,186,193`.

**`WITNESS_VERSION` (`witness.ts:38`): 4 to 5, once, in the first behaviour-changing slice.**
Readers: `witness.ts:318`; `playback.ts:8,121,167,265`; `tapeHeader.ts:7,82`; `record-conditioned.ts:24,147`; and 26 test sites across `src/tape/__tests__/`, `src/dev/__tests__/`, `src/app/__tests__/`, `src/app/screens/__tests__/` and `scripts/__tests__/`, all of which read it symbolically rather than pinning 4, so none needs editing.

**`WEAPON_LINE_CODES` (`witness.ts:96`): the key `soulStream` becomes `skullStream`, keeping code 1.**
Readers: `witness.ts:138,324`; `src/game/__tests__/witness.test.ts:30,778,784-785,795`.

**`FORMAT_VERSION` (`wireCodes.ts:28`): unchanged at 2, deliberately.**
Readers: `decode.ts:36,189,191`; `wireCodes.ts:153`; and the codec tests. The deliberate absence is guarded by spec test 25.

---

## 8. Craft calls, each backed by evidence

Every magnitude below is an **initial data row, tuned by the harness at step 4**.

**Carrier slack `CARRIER_SLACK = 1.3`, so the schedule holds 25 carriers against a full build's 19.** The 19 is derived, not picked: `(5 - 1) * 1 + 5 * 3` at today's roster. The slack is bounded by the two shipped ends ADR 0048 cites: DoDonPachi's four carriers are the tight end (no slack at all) and Touhou's Embodiment of Scarlet Devil pays roughly two stages of supply against about 500 kills to max, which is well over 100 percent slack. Thirty percent sits at the tight end of that band, which matches a five-minute single stage rather than a six-stage campaign.

**Which mobs in a row carry: the row's middle index, one carrier per carrying row.** ADR 0016's readable-before-it-acts rule and the arming precedent at `mobs.ts:95` (`isArmed(row.fire.armedShare, order.index)`) both key a per-mob property to the placement index, so the carrier follows the same mechanism rather than inventing one. Middle rather than first, so a Pincer's symmetry (`templates.ts:143-160`, whose "whole lesson is a symmetry that asymmetric arming would read as noise") is not broken by the carrier sitting on one arm.

**Offer spacing `OFFER_SPACING = 90` field units, three bodies spanning 180 of the field's 540.** Derived from the grave's own reach: `graveWidth(size) = size` at `GRAVE_ASPECT` 2 (`grave.ts:71-73`), so at the size ceiling of 67.5 (`tuning.ts:53`) the grave's half-width is 33.75 and a drop's half-extent is 14 (`corpses.ts:53`), giving a catch reach of 47.75 from the grave's centre. At 90 apart, two adjacent bodies are both reachable only from within 45 of their midpoint, which is inside the reach by 2.75 units. So the two-touch case is possible at the ceiling and impossible at the start size of 27 (reach 27.5), which is the shape the choice wants: the tie-break is a rare late-run event, not the normal case. Three bodies at 180 units is a third of the field's width, so choosing is a real move.

**Offer entry for a banked offer: `OFFER_ENTRY_DEPTH = 26` above the top edge, at the grave's own x.** The record does not rule where a banked offer opens, and the death that paid it has scrolled away by the time it opens. Twenty-six is `templates.ts:38,45`'s `BODY` and `ENTRY_DEPTH`, so an offer enters the field exactly the way a wave does and nothing pops into existence on screen. Opening at the grave's x is not the drifting offer ADR 0048 rejects: it is placed once and then the world scrolls, and the grave has to stay under it.

**Nothing offerable: the carrier's death opens a single body carrying no line.** ADR 0034 says such a drop "converts to overflow, keeping ADR 0002's nothing-swallowed-is-worthless promise". A body with `line: undefined` swallows through `swallow.ts:99-127`, pays growth and reservoir, and whatever the ceiling refuses becomes overflow at `swallow.ts:116-119`. Below the ceiling it pays growth rather than score, which is a narrower reading than ADR 0034's word "overflow"; the alternative, adding score silently with no body on the field, deletes the dive and contradicts ADR 0002's "everything goes in the hole". A run with every line maxed is almost certainly at the ceiling anyway, where the two readings coincide.

**Two-touch tie-break: the body whose centre is nearest the grave's centre, ties broken by the lower entity id.** Deterministic, needs no new stream draw, and is the reading a player would give. The handoff lists this as an open play question, so the plan runs under this as a stated assumption; see section 9.

**Bell cone rows.** Cone counts are Mark's own shape ("maybe 1-2-3-4-5 per level", handoff). The arc a toll actually covers climbs 90, 160, 196, 288 and 330 degrees, so at level five the surround is back as five cones separated by five six-degree slits, one of them dead astern: it reads as cones rather than as the old circle, which is what ADR 0036's "earns back the whole surround at field scale" asks for. Reach is derived area-preserving against the old ring radii at `bell.ts:51`, which is what "reach grows to compensate" means in numbers: preserving a circle's area `pi*r^2` in a wedge of total angle `t` gives `R = r * sqrt(2*pi/t)`.

The `t` in that derivation is the summed width of the cones, which is the column below, because the area of `n` wedges is `n * halfAngle * R^2` however they are pointed. It is the covered arc only where the cones do not overlap. Level three is the one row where they do: its three cones sum to 228 degrees of width and cover 196 degrees of arc, so its reach of 207 is derived against an area that counts the two overlaps twice and is that much generous. Initial rows, and the harness reads what they are worth at step 4.

| Level | Headings (deg from straight up) | Half-angle (deg) | Cone width summed (deg) | Reach | Push |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 45 | 90 | 160 | 6 |
| 2 | -40, +40 | 40 | 160 | 183 | 10 |
| 3 | -60, 0, +60 | 38 | 228 | 207 | 16 |
| 4 | -108, -36, +36, +108 | 36 | 288 | 231 | 26 |
| 5 | -144, -72, 0, +72, +144 | 33 | 330 | 261 | 40 |

The headings are written in degrees and converted once at the row, because degrees are what a person tunes in. Every row is symmetric about straight up, so no player ever learns a left-handed bell. At levels one to four the cones meet or overlap, so the toll answers one contiguous arc ahead and the open side is the rear; the slits arrive only at level five, where the wrap has gone all the way round.

Push begins at level one, where today it is zero through level three (`bell.ts:64`). The evidence for moving it is the handoff's own measured case: `BELL_PUSH_BY_LEVEL [0,0,0,0,20,40]` produced 42, 51 and 0 field units of total pushback and 4, 3 and 2 bell kills against roughly 267 mobs across the three #79 runs, which ADR 0036 records as "evidence of a line that was never felt". Level five holds 40 so the top of the ladder is not retuned blind; the levels below it get a push they have never had. All six numbers are initial.

**Cone headings are the row's own data, not a spacing rule.** One cone at level one points straight up, which is ADR 0036's "Level one throws one cone forward". Level two's pair sits at forty degrees either side rather than at the even 180 a formula gives, because a cone dead astern at level two is the opposite of wrapping toward the sides. From there the pairs walk outward, reaching the rear only at level five. All five rows are initial and the harness tunes them at step 4.

**Belch burst radius `BELCH_BURST_RADIUS = 160` field units.** Under a third of the field's 540 width and equal to the level-one cone's reach, so the burst is legibly local against a field-wide gas. The evidence that the old scope was the problem is in ADR 0008: the 2026-08-31 tapes read the belch at 35 and 46 percent of all kills with the reservoir full 62 to 79 percent of the run. A local burst is the scope cut; the number is initial and the harness reads the belch's kill share back at step 4.

**Surge floor `SURGE_FLOOR_VOLLEYS = 1` and wisp floor `WISP_FLOOR_SOULS = 1`.** The wisp floor is ADR 0058's own word. The surge floor is the same argument transferred: `SURGE_VOLLEYS` is 2 (`soulStream.ts:67`) and the freshness payout floor is 0.25 (`tuning.ts:40`), so an unfloored scale pays 0.5 volleys, and a swallow that fires nothing reads as a bug in exactly the way ADR 0058 names for the wisps.

**Level zero fires nothing whatever the floor.** `wisps.ts:36-38` states level zero is silence because "homing is always bought with a dive". The freshness floor must not resurrect an unowned line, so the floor applies only above level zero. ADR 0058 does not state this because at the time of writing the birthright carried two lines and the case was less visible; ADR 0045 makes it live.

---

## 9. Craft calls the record did not cover, taken by the dispatching session

The planning agent listed these as candidate rulings. Under the push's pre-authorization (item 8: craft calls are the session's, backed by evidence and recorded on the branch) the dispatching session took each one on 2026-09-08. None is a new commitment at ADR level; each is a data row or a stand-in form that the harness and a person's play can overturn. Mark reviews them on the branch before merge.

1. **Which body wins when the grave covers two of the three offer bodies.** The nearest body centre to the grave centre, ties broken by the lower entity id. Deterministic, no new stream draw, and the reading a player would give.
2. **Whether the two-touch case should be possible at all.** Possible at the size ceiling and impossible at the size floor, which is what a spacing of 90 gives. The spacing is a data row; the harness reads how often the tie-break fires.
3. **Where a banked offer opens.** At the grave's own x, one body-depth above the top edge, entering like a wave.
4. **Whether a carrier is visibly marked before it is killed.** Yes, in step 1, with a stand-in mark: a plain line-agnostic ring or outline drawn by the mob renderer from the carrier flag, no new asset. Reason: ADR 0002 makes killing the carrier the only way power arrives and ADR 0048 makes a miss a real cost, so a carrier the player cannot tell apart turns supply into luck; the genre precedent the ADRs cite (DoDonPachi's carriers, Garegga's tanks) marks them; and the field rule is that a mob reads before it acts. The mark's look is a stand-in and the art pass owns the real one. Add one module test: the render data for a carrying mob carries the flag. The mob's look is built in `src/app/screens/game/mobSprite.ts` and driven from `FieldRenderer.ts`; the coding agent cites the lines it changes and keeps the sprite a dumb view (the flag arrives as data, the sprite draws it).
5. **Whether a fully-maxed run's carrier pays growth or pays score directly.** It opens one body with no line, which pays growth and overflows at the ceiling (ADR 0034's overflow wording, ADR 0002's everything-in-the-hole).
6. **How the bank is shown.** A count in the run readout beside the level readout. The field-side form belongs to step 5's strip.
7. **How fast a stripped player recovers at the thinner birthright.** No compensating mechanism, per ADR 0045's cost taken eyes-open. The agent reports the numbers; only play judges them (verification step 12).
8. **Whether ADR 0046's roster resolver ships before any unlock exists to feed it.** Yes: the resolver and the recorded roster ship now, and the unlock store waits on its trigger (section 5), because the tape's recorded meaning is the expensive thing to change later.

---

## 10. Slices

Each slice is one commit: its tests, its minimal implementation, and its `GOLDEN` regeneration when it changes behaviour. Each slice ends green on `pnpm typecheck` and `pnpm vitest run` before the next begins. CodeRabbit CLI runs before each code commit, per the branch's standing rule.

**Slice 0. Record a baseline tape.** Before any edit, record two tapes at the branch tip with `record-conditioned.ts` and save them outside the repo. They are the input to verification step 8 and cannot be made after the rename. No commit.

**Slice 1. The rename, nothing else.** `soulStream.ts` to `skullStream.ts`, the `WeaponLine` member, the `WEAPON_LINE_CODES` key keeping code 1, the damage-source string at `storm.ts:61`, the digest's at `digest.ts:203,298`, the reading key at `fieldPerLine.ts:47`, the sprite branches at `foodSprite.ts:195,270`, the usage string at `record-conditioned.ts:5`, and every test that names it. Behaviour does not change and `GOLDEN` must not move; if it moves, the slice is wrong. Test 67 lands here.

**Slice 2. The roster is a resolved value.** `RunState.roster`, `createRun`'s fourth parameter, `implementsLines` on the roster, `startingLevels.ts` delegating to it, `tapeHeader.ts:78` and `record-conditioned.ts:143` writing the run's roster. Spec tests 22, 23, 24, 25 and module tests 62, 63, 72 land here. `WITNESS_VERSION` moves to 5 in this slice and not again. Verification step 8 runs here.

**Slice 3. The thinned birthright.** `BIRTHRIGHT` becomes `['skullStream']`. Spec tests 19, 20, 21 land here, plus the edits to `roster.test.ts:12`, `run.test.ts:51` and `grave.test.ts:234,274,280`. `GOLDEN` and the bot test regenerate; the digest scenario's starting levels at `digest.ts:298` are pinned uniformly, so the expected `GOLDEN` move is the run's own level fold and nothing else.

**Slice 4. Freshness pays each line in its own currency.** `surgeStream(state, freshness)`, `launchWisps(state, events, freshness)`, the two floors, and `swallow.ts:124-125` passing freshness. Spec tests 40 to 46 land here. This is #68 closed.

**Slice 5. The belch split.** `BELCH_BURST_RADIUS` and the reduction of `wipeEnteredMobs` to a local burst. Spec tests 26 to 30 land here.

**Slice 6. The bell arcs.** `ConeRow`, `BELL_CONE_ROWS`, `coneHeading`, `insideCone`, `tollReach`, the reshaped `BellToll`, the angular sweep, and the renderer at `StormRenderer.ts:594-598`. Spec tests 31 to 39, 39a and module test 73 land here. Verification step 7 runs here.

**Slice 7. Carriers, without the offer.** The `carries` flag on `Mob`, the `carried` field on `mobKilled`, `cullMobs` returning events, `carrierLost`, `carriers.ts` with its derivation and slack, the carrier column on `StageRow`, and a first schedule on the existing rows meeting `carriersScheduled()`. `creditKill` is replaced at `step.ts:134` by a carrier-death branch that still spawns a single old-style drop, so the slice is one change and not two. Spec tests 1, 2, 15, 16, 17, 18 and module tests 55 to 58, 68 land here. `drops.ts` loses `DROP_PRICES`, `priceOfNextDrop` and `creditKill`; `RunState` loses `killsSinceDrop` and `dropsPaid`; `invariants.ts:77-78` and the witness partition at `witness.test.ts:582-583` follow. The bot test's drop band at `bot.test.ts:294-295` is rewritten here. Verification step 6's carrier half runs here.

**Slice 8. The offer of three and the bank.** `offer.ts` in full, `RunState.offer` and `bankedOffers`, `resolveSwallows` asking `chooseOfferBody`, `swallow.ts` routing a drop's level through `resolveOffer`, the five new events, the three new invariants and their fault identities and codes, the bank readout in `RunHud`, and the deletion of `drops.ts` and `drops.test.ts`. Spec tests 3 to 14 and module tests 47 to 54, 59, 60, 61, 64, 65, 66, 69, 70, 71, 74, 75 land here. Verification step 6's offer half and verification step 9 run here.

**Slice 9. The fences.** `src/__tests__/lineAgnosticPolicies.test.ts` with tests 76 and 77, and the confirmation that tests 78, 79 and 80 are green. No production change; if a fence fails, the fix is a production change and it is a finding, not a fence edit.

**Slice 10. The full verification pass.** `pnpm verify` at the repo root, the two headless runs, the rendered check with its screenshots read, and the report naming verification steps 11, 12 and 13 as still open for Mark.

---

## Appendix: claims in the record found false against the code

1. **`docs/design/weapon-pool-review.md:44`** states: "`HEADER_LEVELS_ORDER` in `wireCodes.ts:130` writes exactly four level bytes, positionally, and its own comment calls the layout 'permanent from the first tape'. A fifth line grows the header, which is a layout change, so every tape ever recorded would stop decoding at all." No `HEADER_LEVELS_ORDER` exists in `src/tape/wireCodes.ts` (the file is 167 lines and its exports are at `wireCodes.ts:150-167`), and `src/tape/__tests__/wireCodes.test.ts:76` explicitly asserts it is not exported. The header now writes the roster length-prefixed by name at `segments.ts:85-90`, and `wireCodes.ts:26-27` records that "the next roster change costs no version at all". The claim was true when written on 2026-08-27 and was superseded by ADR 0043 and #76; it now reads as current and is load-bearing for the standing extensibility constraint, so it is worth correcting when `#86`'s stale-docs sweep runs.

2. **`docs/push/open-tickets.md:99`** (quoting ticket #68) states "`src/game/lines/soulStream.ts:173` is `surgeStream(state: RunState): void`, and `src/game/lines/wisps.ts:161` is the same shape." `surgeStream` is at `soulStream.ts:216` and `launchWisps` is at `wisps.ts:162`. Ordinary line drift, named because the coding agent will read that ticket and should locate both by content.

Everything else in the record checked out against the tree, including the handoff's `BELL_PUSH_BY_LEVEL [0,0,0,0,20,40]` (`bell.ts:64`), ADR 0002's naming of `killsSinceDrop` and `dropsPaid` as folded witness state (`witness.ts:245`), and the glossary's statement that the code and tape identifier follow the skull stream rename (`CONTEXT.md:53`).
