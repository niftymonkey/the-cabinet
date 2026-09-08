# Dispatch plan: path step 2, the stage floor (ticket #97)

Planning half only, written per `docs/agents/feature-playbook.md`. No production code was written and no repo file was edited for this plan.

The design record it runs on is `stage-floor.md`. Combat magnitudes appear only as data rows marked initial. The stream line is the skull stream. The grave swallows and passes under; it never drives.

## What this plan may claim, and what it cannot

Every claim about existing code below cites a file and a line. They were first read in this worktree while **path step 1 was mid-build**, and every one of them has since been re-located by content and corrected against the tree with step 1 landed (the planning read of 2026-09-08; what moved is listed in `docs/push/step-2-progress.md` section 0). The numbers below are current as of that read and go stale again the moment a slice of this step lands, so a later slice locates its site by content and a site it cannot find is a finding rather than something to skip (`docs/agents/lessons.md`, "a plan's line numbers go stale the moment its first phase lands").

Step 1 has landed in full, slices 1 to 10 plus its gate fixes and its tip review. `src/game/lines/skullStream.ts` exists, `run.ts:11-12` imports it, and `soulStream` survives only in tests that pin the old name on purpose (`witness.test.ts:852`, `startingLevels.test.ts:98,102,109`, `roster.test.ts:70`).

**The claims that were re-checked when it landed, by name, each restated as the tree now reads:**

1. **Every line number in `src/game/run.ts`, `src/game/step.ts`, `src/game/events.ts`, `src/game/mobs.ts`, `src/game/corpses.ts`, `src/game/witness.ts`, `src/game/invariants.ts`, `src/game/faults.ts` and `src/tape/wireCodes.ts`.** Step 1 changed all nine (its plan, section 5), and every citation into them in this document has been re-located by content and corrected.
2. **`RunState`'s shape.** `RunState` is `run.ts:60-114`. Step 1 added `roster` (`run.ts:70`), `offer` (`:82`) and `bankedOffers` (`:84`) and deleted `killsSinceDrop` and `dropsPaid`, which `witness.test.ts`'s `RETIRED_RUN_FIELDS` now fails on if either comes back.
3. **`spawnMob`'s signature.** It is `(state, type, order, carries): Mob | null` at `mobs.ts:244-249`, step 1's fourth argument landed.
4. **`cullMobs`'s return type.** `cullMobs` (`mobs.ts:422`) returns `SimEvent[]`, and `step.ts:220` is its only caller.
5. **`StageRow`'s shape.** `StageRow` is `stage.ts:14-29` and carries `carries: boolean` (`stage.ts:28`). Step 1's first schedule stands on `RAMP_ROWS` (`stage.ts:95-117`) and `BACK_HALF_ROWS` (`stage.ts:127-147`); this step owns the authored schedule.
6. **`WITNESS_VERSION`.** `witness.ts:38` reads 5, where step 1's slice 2 left it. This step takes it to 6, once, in slice 6.
7. **`FAULT_IDENTITIES` and `FAULT_IDENTITY_CODES`.** Step 1 appended three, so `FAULT_IDENTITIES` (`faults.ts:18-34`) holds fifteen and the wire codes run to 15. This step appends after them, and the wire codes are append-only (`wireCodes.ts:30-37`).
8. **`src/game/drops.ts` is gone** and `src/game/__tests__/drops.test.ts` with it. Anything in this plan that mentions the drop path means the offer path, which lives in `src/game/offer.ts` and is tested in `src/game/__tests__/offer.test.ts`.
9. **`src/__tests__/lineAgnosticPolicies.test.ts` exists** as a cross-cutting fence file created by step 1's slice 9. This step extends it rather than creating it.

The re-check covered every citation in this document rather than only the nine files above, and it found movement outside them. `stage/stage.ts` moved most, because step 1 owns the carrier column on `StageRow` and a first schedule on both row tables and both live in that file. `caps.ts` moved when step 1's gate fix took `TERRITORY_CAP` out to `lines/territory.ts`, which shifted `territory.ts` too; `bell.ts` moved with the cone rows and renamed `sweepRing` to `sweepToll`; `belch.ts` moved with the gas and burst split; `bot.test.ts` moved a long way. `stage/templates.ts`, `tuning.ts`, `field.ts`, `clock.ts`, `grave.ts`, `mobFire.ts`, `palette.ts`, `layering.ts`, `sound.ts`, `audio.ts` and `engine.ts` did not move, and neither did `stage.test.ts`.

---

## 1. Definition, in observable terms

**The stage is three named sections a player can tell apart (ADR 0049, ADR 0050).** A run is nine minutes nominal, inside eight to ten. The Procession runs to the Banshee, the Crowd runs to the Waking, the Vigil runs to the Undertaker; the first is the shortest, the middle the longest, the last shorter again. A headless caller reading a tape sees seven phases in order and can print each one's tick span. A player sees three different places: one where a group arrives, dies and leaves a gap; one where two groups are always overlapping; one where fewer, tougher bodies come and corpses are scarce.

**Both bosses are real, and neither boundary is a stub (ADR 0007, ADR 0052).** The Banshee arrives alone, throws expanding tear-rings with one clean gap, adds a second offset ring source at her chunk break, dies, and drops a feast that never decays. The Undertaker arrives alone and runs three chunks: falling clod curtains with a gap that always fits the grave, then a shovel spiral plus summoned diggers, then both at once with the gap where the arm just swept and the curtain thinned to pay for it. A headless caller sees `bossArrived`, one `chunkBroke` per break, food shed throughout, and `bossKilled`.

**The set piece is heaven at its loudest (ADR 0042, ADR 0050).** A Crowd row places a dormant eye, it rides the ground layer down on a slower parallax, opens around mid-field, and pours trash from its one point while the source drags across. It fires nothing and it never touches the grave. It is shootable once open and immune while dormant, and its health is sized so the pour always completes: a fast kill ends the source's stay rather than its pour. It pours faster than the densest ten seconds the Crowd authored. A grave that swims up its corpse trail eats most of it; a grave that waits at the bottom edge gets scraps; neither seals. That difference, measured in corpses and never in hits, is the property the tests hold, and no test names a mob type it pours.

**Before each boss the field thins instead of falling silent (ADR 0051).** Mobs keep arriving, slowly and further apart, and the boss enters on the tick the last of them leaves the field. A player sees a held breath rather than a pause. There is no thinning before the set piece: the Crowd ends on the eye opening rather than on an empty field, its rows keep firing under the pour at a reduced share, and the set piece arrives into trash and stays in it. A headless caller sees no window anywhere in the stage in which no row is due and no mob is alive for longer than the slowest type's own descent.

**Each section's property is a gate on the director's spend (ADR 0047, ADR 0050).** The Procession carries a live-template ceiling and the Vigil a live-body ceiling, both as rows on the phase. What they bind is the director at step 4: it may not add a template or a body while the phase already stands at its ceiling. They are never a fault on an authored spawn, because the authored rows are the floor ADR 0047 keeps and a slow hand leaving bodies alive is play rather than a defect. That distinction is load-bearing rather than fussy: ADR 0023 runs every invariant in every build a player is handed, so a check a slow player can trip is a check that fires at a player. The Crowd's property is a floor and needs no such row. A headless caller can read the ceilings out of the phase data without calling into the stage machine.

**Both endings are real (ADR 0003, ADR 0007, ADR 0028).** Sealed shut still ends a run through the full floor ladder, now reachable inside a boss fight. Victory fires on the Undertaker's death rather than on reaching an empty phase, pays nothing, and the topple into the grave is the animation over a run that has already ended. A headless caller reaches both across the seeds under two policies.

**The carrier schedule is stage data with slack (ADR 0002, ADR 0048).** Twenty-five carriers stand across the three sections, eight, eleven and six, against nineteen for a full build. A player who kills every carrier in the Procession and the Crowd meets the Waking at full power; one who misses some meets the Undertaker under-built and nothing reaches after them to make it up.

**The corpse cap never evicts (ADR 0056, decision 19).** No food the player can see is ever removed by housekeeping. At the cap a corpse spawn is refused and the invariant harness raises a recoverable fault, and the cap itself is computed from the mob cap, the stage's own peak arrivals inside a freshness window, and a treasure allowance, so it cannot bind in normal play.

**Stand-ins mark the sections and nothing more (ADR 0049, decision 1, decision 22's amendment).** Three loops, one per section, and the two changes fall on the two boundary events decision 22's amendment names: the Banshee's death and the eye opening. Each phase still names its own loop, so six is a data-row edit rather than a rebuild. The ground under the field carries a per-section dressing set that drifts continuously from one to the next, with one real tint departure in the Vigil. Every imported sprite and tile is grayscale, so the only hue on screen is a palette entry's. There is no section card. A person's read of the stage is separable from a read of the placeholder look.

**The director's off-limits cells are readable from the data (ADR 0047, ADR 0056).** Every phase and every row carries whether the director may spend in it. Boss phases, the set piece, the Wall's row and the sparse rows are marked, so step 4 reads them rather than re-authoring them.

---

## 2. Already built, partly built, absent

| Ruling | ADR | What exists today (file:line) | What is missing |
| --- | --- | --- | --- |
| Three named sections | 0049, 0050 | **Absent.** Two trash phases: `ramp` (`stage.ts:95-117`, 21 rows) and `backHalf` (`stage.ts:127-147`, 19 rows), chained through `PHASES` at `stage.ts:165-171` | Seven phases, three section tables, the one-property-per-section authoring, the names in `PhaseName` (`stage.ts:12`) |
| The eight-to-ten minute clock | 0049 | **Absent.** Ramp is 122 seconds and the back half 85 (`stage.test.ts:96,101`), so the stage is about three and a half minutes of rows | The re-authored rows |
| One property per section | 0050 via `game-concept.md:48` | **Absent.** Nothing in `stage.ts` distinguishes the two tables beyond density | The authoring, and the three property tests |
| A section's property as a gate on the director's spend | 0047, 0050 | **Absent.** No live-count ceiling exists anywhere; `MOB_CAP` (`caps.ts:29`) is a bug detector and not a section's property | `Phase.liveTemplateCeiling` and `Phase.liveBodyCeiling` as rows step 4 reads before it spends, and the three property tests run under a stated killing policy rather than as always-on invariants |
| Phases chain on boundary events | 0006 | Built: `enterNextPhase` at `stage.ts:223-233`, `advanceStage` at `stage.ts:240-249` | Nothing structural; the loop at `stage.ts:242` exists only because stubbed boss phases end on the tick they begin |
| A phase's length | 0051, 0050 | **Superseded.** `phaseLengthTicks` at `stage.ts:187-191` is `last row t + DRAIN_OUT_SECONDS`, with `DRAIN_OUT_SECONDS` 17 at `stage.ts:68` | The end condition as a column on the phase: rows spent and the field clear at the two boss boundaries, the eye opening for the Crowd, the boss's death for the boss phases |
| The sparse last row | 0051 | **Absent.** The drain-out is silence in the rows and no row falls inside it (`stage.ts:31-34`) | The sparse rows, and the retirement of the silence |
| The Banshee | 0007 | **Absent.** `{ name: 'banshee', rows: [] }` at `stage.ts:167`, a stub whose reason is written at `stage.ts:160-163` | The whole boss: chunks, patterns, the feast, the ring emitter |
| The Wall | 0042 | **Half built.** The template is at `templates.ts:179-189`; its one row is `{ t: 2, template: 'wall', count: 22, type: 'shambler', carries: false }` at `stage.ts:128`, anchored per the comment at `stage.ts:119-126`. Never tested against its own property (`tracer-plan.md:176`) | The real anchor on the Banshee's death, and the two bot policies that carry the property |
| The feast | 0004, 0007 | **Mechanism built, unused.** `spawnFeast` at `corpses.ts:217-238`, `decays: false` at `:234`; its comment at `corpses.ts:212-216` says nothing spawns one yet. `FEAST_PAYOUT` at `tuning.ts:102` and `RESERVOIR_CAPACITY` at `tuning.ts:109` are the same number by construction | The callers: the Banshee's death, and both bosses' chunk breaks |
| The Undertaker | 0007, 0052 | **Absent.** `{ name: 'undertaker', rows: [] }` at `stage.ts:169` | The whole boss: three chunks, curtains, spiral, diggers, the gap rule |
| Chunked health, the break flash | 0007 | **Absent.** No boss module of any kind exists under `src/game` | `bosses/chunks.ts` per `tracer-plan.md:85` |
| A shot with an authored direction | 0007 | **Absent.** `fireShot` at `mobFire.ts:134` always aims at the grave (`mobFire.ts:139-140`) | A directed-shot seam; every boss pattern needs it |
| The swarm set piece | 0042, 0050 | **Absent.** Nothing on the field has a position, an open state and a budget | The whole thing |
| Victory | 0007 | **Stubbed.** `state.ending = 'victory'` at `stage.ts:231`, fired on entering the `over` phase, with the reason at `stage.ts:218-222`. `EndScreen.ts:15-17` says the same | Victory on the Undertaker's death |
| Sealed shut | 0003 | Built: `sealShut` at `grave.ts:161-163` through `runFloorLadder` at `grave.ts:171` | Nothing |
| The corpse cap never evicts | 0056 | **Contradicted.** `claimSlot` at `corpses.ts:161-178` evicts the oldest decaying corpse through `oldestEvictable` at `corpses.ts:145-152` and emits `corpseEvicted` at `corpses.ts:169-174`. The rationale is written at `corpses.ts:154-160` | The refusal, the fault, and the retirement of the eviction path |
| The corpse cap sized from scroll physics | 0056 | **Absent.** `CORPSE_CAP = 200` at `caps.ts:31`, a flat number; the surrounding comment at `caps.ts:17-28` derives `MOB_CAP` from a measured 51 mobs alive but derives nothing for corpses | The derivation, and the query over the stage rows it needs |
| Directed off-limits cells as data | 0047, 0056 | **Absent.** `StageRow` (`stage.ts:14-29`) and `Phase` (`stage.ts:149-152`) carry no permission column | Both columns |
| The carrier schedule on the new rows | 0002, 0048 | **Step 1's column, step 1's first schedule.** Step 1 plan, section 5: it owns the column and a schedule on the existing rows; this step owns the authored schedule | The re-placement across the three sections |
| Stand-in music | 0049 | **Engine built, no caller.** `BGM` loops at `audio.ts:38`, cross-fades at `audio.ts:24-31`, and no-ops on an unchanged alias at `audio.ts:21`. `bgm.play` is called only in the prototype (`prototypes/ugly-slice/screens/TitleScreen.ts:128`). `sound.ts:61` returns null for `phaseChanged`, and `events.ts:309` says the music cue hangs there | The caller, the per-phase row, the bundle, the loop-gap trim |
| Stand-in backgrounds | 0049 | **Layer built, no consumer.** `layering.ts:17` declares `ground` and nothing calls `layers.layer('ground')`. `fieldFrame.ts:10-12` states that the engine background and the field's ground are both night | The ground, the dressing sets, the drift window, the palette entries |
| Nearest-neighbour drawing | handoff | **Absent.** No `scaleMode`, no `TextureStyle.defaultOptions`, no assetpack option anywhere in `src`, `scripts`, `.assetpack.js` or `vite.config.ts` | Per-texture nearest on the stand-in sprites |
| A section timeline off a tape | #39's instrument list | **Absent.** `src/dev/readings/readings.ts:72-85` declares twelve readings and none reads `phaseChanged` | A `sectionTimeline` reading |

Three structural facts the table depends on, verified rather than assumed:

- **The event vocabulary is not on the wire.** `wireCodes.ts:38-50` and the maps around it carry input device, integrity, run endings, stop reasons, fault identities, frame reasons and observations, and no event codes. So adding boss and set-piece events, and retiring `corpseEvicted`, costs no format version.
- **`ground` is already masked to the field.** `GameScreen.ts:171-173` applies `fieldClip()` (`fieldFrame.ts:43-45`) as the field container's mask, and `layers.addTo(this.field)` at `GameScreen.ts:170` puts the whole stack inside it. A background drawn into `ground` is clipped for free.
- **Adding a layer name would be an ADR 0014 change.** `layering.ts:16-30`'s order is pinned as a literal at `src/app/__tests__/layering.test.ts:75-88` under the name `ADR_0014_STACK`, and `:143` asserts the container count equals `LAYER_ORDER.length`. The background therefore orders itself inside `ground` and adds no name.

---

## 3. Verification steps

**Actor: agent.**

1. **Unit tests** at the seams in section 4, per the list in section 6. `pnpm vitest run` from `apps/hungry-grave/`.
2. **`pnpm typecheck`** from `apps/hungry-grave/`. Only this judges diagnostics.
3. **`pnpm build`** from `apps/hungry-grave/` (it runs lint and typecheck first, `package.json:9`).
4. **`pnpm verify`** at the repo root.
5. **Test-name diff, per slice.** Build a detached worktree at the previous commit with `node_modules` symlinked, run `vitest list --json` in both trees, and diff file-qualified names as well as bare ones. A vitest suite can fail to load and still report zero failures, and this step is the only thing that sees it (`docs/agents/lessons.md`, "compare test names before and after, never pass counts"). This step matters more here than in step 1 because 15 test files import `RAMP_ROWS` and every one of them is edited (section 7).
6. **Golden digest, per behaviour-changing slice.** `GOLDEN` (`src/dev/digest.ts:297`) regenerates in the same commit as the behaviour, and the agent reads the diff field by field. The scenario runs 600 ticks from `SEED` 20260820 (`digest.ts:18-19`), which is inside what is now the Procession, so slice 2 moves it and later slices should not unless they claim to. A field moving that the slice did not claim is a stop-and-report, not a re-blessing.
7. **Headless run to victory, under the dodge bot at maxed levels.** From `apps/hungry-grave/`, a full-run test using `createRun`'s third parameter with `uniformLevels(5)` (`run.ts:177`, `run.ts:218`). This is named separately because the shipped bot only dodges and never levels a line (`docs/lessons.md`, "the bot is not a player"), so it cannot kill a boss from the birthright and the pinned loadout is the only way a headless run reaches the Undertaker at all. Passing means: `victory` fires, it fires on `bossKilled` for the Undertaker and not on a phase index, and no invariant fault fired.
8. **Headless run to sealed shut**, under a hit-taking policy at the birthright, through the full floor ladder inside a boss fight. Passing means `scoreBled`, then `weaponStripped`, then `sealed`, in that order, on at least one seed.
9. **The section timeline, read off a tape.** Record a full run with `record-conditioned.ts`, then run `scripts/measure.ts` on it, and read the new `sectionTimeline` reading. Passing means: seven phases in order; the Procession shorter than the Crowd; the Vigil shorter than the Procession; the whole run between eight and ten minutes at 60 Hz; and every boss phase beginning on a tick with zero live mobs. The agent prints the table into its report, because this is the one place the nine-minute claim is a measurement rather than an intention.
10. **Old-tape decode check.** This step moves `WITNESS_VERSION`, which is a wire change in the header. Record a tape at the branch tip before slice 1 lands, saved outside the repo, and after the change run `scripts/measure.ts` on it. Passing means the tool reports the header fields it can and refuses replay with the precise witness-version message rather than throwing a format error or silently coercing (ADR 0043's precise-refusal contract, ADR 0019's witness).
11. **Rendered check, per section and per boss.** `pnpm build && pnpm exec vite preview` from `apps/hungry-grave/`, then screenshots the agent actually reads, of: the Procession with one template live over its own dressing; the Crowd with two templates overlapping over its dressing; the Vigil with the tint departure; the Banshee mid-chunk-one with her tear-rings; the Wall arriving with the reservoir full; the dormant source riding down through the Crowd beside the Crowd's own eye dressing; the Waking open and pouring; the Undertaker in chunk three with both emitters running. Every shot is taken through the pinned-replay path (a recorded tape rendered at a chosen tick) so it is deterministic and so it reaches the renderers, which no static screenshot does (`docs/agents/lessons.md`, "a visual gate that shoots only static screens is blind to every renderer"). The agent states which reads it obtained and which it did not, and says explicitly that driving the app through a CLI browser is not a substitute for using it.
12. **Grayscale check at target density**, on the Crowd's densest moment and on the Waking's pour. This is #38's own criterion. It is a check of the palette rather than of the staged pack, because every imported sprite and tile is desaturated on import and coloured only through tint, and the mechanical guard on that is fence test 122.
13. **The music loop gap, measured before anything is built for it.** It has a slice of its own, 12b, and it runs before a single line of gap handling exists, because what it measures decides whether any is written. For each of the three loops, in a real browser through the app's own audio path: decode the file, report the decoded duration in samples and the encoder's stated frame count, then loop it and report the audible gap at the wrap, measured off a recording of the output rather than off the numbers. Passing means the three rows exist and the agent has read them. The expected result is no gap: every engine the app runs on trims the encoder's delay and padding on decode (Firefox since 83, Chrome, and WebKit), so the earlier premise that `decodeAudioData` hands back an untrimmed buffer is stale and no trim is built on it. If a gap remains on any loop, the answer is a `start` and an `end` in seconds as data rows beside that loop's alias, passed straight through `Sound.play` (`@pixi/sound` 6 maps them to the source node's `loopStart` and `loopEnd`, `WebAudioInstance.mjs:172-175`). What is forbidden either way is an in-app encoder-header parse: it is a decoder written into a game to work around a browser bug that no longer exists, and its deliberate absence is guarded by module test 129.
14. **Every layer name is unchanged.** `src/app/__tests__/layering.test.ts` green with `ADR_0014_STACK` (`:75-88`) untouched, which is the mechanical proof that the background did not become an ADR 0014 change.
15. **Fences and invariants** are ordinary tests and are listed in section 6, but they are the step's own architectural verification and are named here: no boss module names a weapon line; `stage/rows.ts` value-imports nothing that would close a cycle with `caps.ts`; the witness partition names every new nested field.

**Actor: human (Mark). Named as still open in the agent's report.**

16. **Whether the three sections are tellable.** ADR 0049's whole cost is that each section has to read as its own place, and #97's first acceptance criterion is that a player can say which section they are in without being told. No test can see this. If Mark cannot say, decision 22's amendment already names the fallback: a section card is one text draw away.
17. **Whether chunk three's twist is legible.** The player has to see that the gap follows the arm, or it reads as a random gap in a busier screen. ZUN's bar, quoted in `docs/research/set-piece-and-final-boss-chunk.md` section 4: at the instant a player is hit, the solution should be understandable. This is the specific thing decision 26 says playing has to answer.
18. **Whether one belch plus play beats the Undertaker.** #37 story 12. The agent can report belch count per fight and time to kill by loadout; only a hand judges whether earning two or three reads as skilled play.
19. **Whether the Waking reads as heaven rather than as a wall.** ADR 0050 says the storm is meant to shred it and the corpses are the payout. The agent reports corpses swallowed by the committing policy against the waiting one; whether it feels like a reward is a hand question.
20. **Whether nine minutes is bearable.** The research names this as the honest risk in as many words: a tint is not content, and if the minutes feel long the channels that add play are the mob mix and the wave shape mix (`docs/research/stage-length-with-a-director.md` section 4 and its recommendation).

21. **Whether the dormant source reads apart from the Crowd's eye dressing.** The source takes the Crowd's colour family on purpose, so the player has to be able to tell which eye is going to wake before it does. The stand-in answer is size, three times the dressing eyes' footprint, and no test can judge it.

22. **Whether three loops is enough, or the bosses want their own.** Six loops is written up as a proposal in the design record's section 7 with Iuchi's argument for it. Nothing that can hear it is automated, so this is Mark's ear or nothing, and the change costs three strings in a data table.

---

## 4. Seams under test

Signatures are the contract the coding agent implements. Every public name carries a glossary word (`CONTEXT.md`). Public interfaces are one export block at each module's end.

### `src/game/stage/rows.ts` (new)

```ts
// One entry of the authored timeline (CONTEXT.md Row).
interface StageRow {
  // Phase-local seconds.
  readonly t: number;
  readonly template: TemplateName;
  readonly count: number;
  readonly type: MobType;
  // Whether this row's mob is a carrier (step 1's column, `carries` on `StageRow`
  // in `stage.ts`); which placement carries is `carriers.ts`'s rule (`carrierRow`,
  // `carriesAt`), never a list on the row.
  readonly carries: boolean;
  // Whether the director may spend in the span this row opens (ADR 0047, ADR 0056).
  readonly directed: boolean;
}

// The three sections, as the tables' own key (CONTEXT.md Section).
type SectionName = 'procession' | 'crowd' | 'vigil';

// Which boss a phase carries. Here rather than in bosses/chunks.ts because which
// boss arrives where is authored stage data, and the phase column that carries
// it is written two slices before any boss module exists.
type BossKind = 'banshee' | 'undertaker';

const PROCESSION_ROWS: readonly StageRow[];
const CROWD_ROWS: readonly StageRow[];
const VIGIL_ROWS: readonly StageRow[];

// The phase-local second at which a Crowd row places the dormant source (ADR 0050).
const SET_PIECE_PLACED_AT: number;

// The pour, as data. setPiece.ts reads these and declares none of them, so a
// query over what the stage can put on the field never imports the machine that
// does the putting.
const SET_PIECE_BUDGET: number;
const SET_PIECE_POUR_TICKS: number;
const SET_PIECE_HP: number;
const SET_PIECE_SWEEP_MIN_X: number;
const SET_PIECE_SWEEP_MAX_X: number;

/**
 * The share of its own authored rate a section keeps while the set piece pours,
 * so it thins under the pour rather than going silent (ADR 0051). One row per
 * section and no optional key: only the Crowd is ever under a pour, and the
 * other two say 1 rather than saying nothing.
 */
const POUR_SHARES: Readonly<Record<SectionName, number>>;

// Bodies a boss's own adds may put on the field inside a freshness window (ADR 0007).
const BOSS_ADD_ALLOWANCE: number;
// Rungs a hit can strip onto the field inside one, bounded by the hit clock and by the build (ADR 0055).
const RUNG_ALLOWANCE: number;

// The most bodies the stage can put on the field inside any window of this length,
// anywhere in the stage: the section tables, the pour at its own share, boss adds,
// stripped rungs. Every term is a row in this module, so the query reads data only.
const peakArrivals: (seconds: number) => number;

export {
  PROCESSION_ROWS,
  CROWD_ROWS,
  VIGIL_ROWS,
  SET_PIECE_PLACED_AT,
  SET_PIECE_BUDGET,
  SET_PIECE_POUR_TICKS,
  SET_PIECE_HP,
  SET_PIECE_SWEEP_MIN_X,
  SET_PIECE_SWEEP_MAX_X,
  POUR_SHARES,
  BOSS_ADD_ALLOWANCE,
  RUNG_ALLOWANCE,
  peakArrivals,
};
export type { StageRow, SectionName, BossKind };
```

**`StageRow.directed` is a genuine design decision and needs review before dispatch.** It is a new public field that step 4 reads and it is the mechanism ADR 0056 asks for in as many words ("so ADR 0047's four off-limits moments read as cells in the phase's data rather than as conditions in code, which is Darktide's shipped permission matrix"). Its caller today is step 4 (#85), which the cited-future rule requires and which `path-draft.md:16` names. The reviewable choice is that the flag is per row rather than a separate table of forbidden time windows: a row already owns a span, from its own fire until the next row fires or the phase ends, and a director briefed to fill gaps cannot tell a sparse row from any other gap unless the row itself says so (ADR 0047's own reason for authoring the thin row as a row).

**`peakArrivals` counts four terms, and the last two are the review.** The section tables and the pour are the obvious two. Boss-summoned adds and stripped rung bodies are the two the game design gate found missing: without them the query never looks inside a boss phase, and the one place a refused corpse costs the player most is the climax of the Undertaker fight, where the diggers are the only food there is. They enter as allowances declared in `rows.ts` rather than as reads into `bosses/undertaker.ts` and the floor ladder, because `rows.ts` value-imports nothing and a cross-module read of another module's tuning rows is exactly what section 5 forbids. The allowance is the same shape as `TREASURE_ALLOWANCE`: a number the cap is sized against, with a test that the bosses' authored cadences stay inside it (module test 121).

**The pour's own rows live here for the same reason, and an earlier draft put them in `setPiece.ts`.** That draft closed the cycle it was written to avoid: `mobs.ts` value-imports `caps.ts` (`mobs.ts:4`), `caps.ts` would read `rows.ts` for the query, `rows.ts` would read `setPiece.ts` for the pour's rate, and `setPiece.ts` spawns through `mobs.ts`, which is a cycle and fails the guard at `src/__tests__/boundary.test.ts:17-19`. The rule that resolves it is one direction: **the pour is data in `rows.ts` and behaviour in `setPiece.ts`.** `setPiece.ts` imports `SET_PIECE_BUDGET`, `SET_PIECE_POUR_TICKS`, `SET_PIECE_HP` and the two sweep bounds from `rows.ts` and spawns through `mobs.ts`; `peakArrivals` reads those same rows and imports nothing. The same draft left the Crowd's rows-under-the-pour with no home at all, which is why `POUR_SHARES` is a named table here rather than a number the coding agent would otherwise have to invent a seam for: the reduced share is an arrival rate, `peakArrivals` needs it, and an arrival rate the query cannot see is exactly the term the corpse cap's derivation was found missing once already.

**`peakArrivals` is a genuine design decision and needs review.** It exists so `CORPSE_CAP` is computed from the stage rather than written down, which is the standing no-arithmetic-as-rules rule applied. The reviewable part is that it lives in `rows.ts` rather than in `caps.ts`: `caps.ts` must not value-import the stage machine, because `stage.ts` value-imports `mobs.ts` (`stage.ts:7`) and `mobs.ts` value-imports `caps.ts` (`mobs.ts:4`), so putting the query anywhere in that chain closes a cycle. `rows.ts` value-imports nothing from `src/game` and takes `MobType` and `TemplateName` as type-only imports, which the guard reads as no edge.

### `src/game/stage/stage.ts` (changed)

```ts
type PhaseName =
  | 'procession' | 'banshee' | 'crowd' | 'waking' | 'vigil' | 'undertaker' | 'over';

// What ends a phase (ADR 0050, ADR 0051).
type PhaseEnd = 'rowsSpentAndFieldClear' | 'setPieceOpened' | 'bossKilled';

// Which loop plays under a phase, named for the phase the loop starts in and
// never for a file. src/app resolves it to an asset alias; the sim never does.
type PhaseMusic = 'procession' | 'crowd' | 'waking';

interface Phase {
  readonly name: PhaseName;
  readonly rows: readonly StageRow[];
  readonly ends: PhaseEnd;
  // Which boss arrives in this phase, or null. A column and not a switch, so
  // enterNextPhase reads the phase rather than testing its name.
  readonly boss: BossKind | null;
  // Whether the director may spend anywhere in this phase (ADR 0047, ADR 0056).
  readonly directed: boolean;
  // The loop this phase plays, or null for the ending's fade (ADR 0049).
  readonly music: PhaseMusic | null;
  // What the director may not push a live count past here. Null where the
  // phase's property is a floor rather than a ceiling (ADR 0047, ADR 0050).
  // It gates a spend and never faults an authored spawn.
  readonly liveTemplateCeiling: number | null;
  readonly liveBodyCeiling: number | null;
  // Whether a banked offer may open in this phase (ADR 0034, ADR 0048). True
  // everywhere unless the record names a reason, written beside the row. The
  // step 1 gate block at the end of section 6 is what rules this column.
  readonly bankOpens: boolean;
}

const PHASES: readonly Phase[];
// Whether this phase's own end condition is met on this tick.
const phaseEnded: (state: RunState, phase: Phase) => boolean;
const advanceStage: (state: RunState) => SimEvent[];
const createStage: () => StageState;
```

`phaseLengthTicks` (`stage.ts:187`) and `DRAIN_OUT_SECONDS` (`stage.ts:68`) are deleted. Their readers are in section 7. `phaseSpent`, the rows-spent-and-field-clear predicate, survives as the module-private helper `phaseEnded` calls for the `rowsSpentAndFieldClear` case; it is not exported, because the phase's own column is what a caller should read.

**`Phase.ends` is a genuine design decision and needs review.** The Crowd cannot end on rows spent and an empty field. It has to hand the set piece a field with trash on it (ADR 0051: "there is no drain-out before the set piece"), and the dormant eye is placed by one of its own rows at `SET_PIECE_PLACED_AT`, so a Crowd that drains has nothing to place it from and the set piece arrives into silence. Making the end condition a column rather than a branch puts the fact in the phase's own data, which is the same move `directed` makes for permission and the shape ADR 0056 asks for by name. The reviewable alternative is one function switching on `PhaseName`: the same behaviour with the fact hidden in code.

**`liveTemplateCeiling` and `liveBodyCeiling` are a genuine design decision and need review, and what they are was corrected between the two review gates.** They are the director's spend gate: at step 4 the director may not add a template or a body while the phase already stands at its ceiling. Without them the Procession's emptiness and the Vigil's scarcity are exactly what a low-pressure director fills, and every spec test here stays green while the three sections stop being three places. ADR 0047's off-limits list already protects the set piece, the Wall, the sparse rows and the boss chunks by rule; it does not cover the body of a section, which is where the director is meant to work, so these two rows are what a section says about itself. The Crowd carries neither on purpose: its property is a floor of two live templates, and a director that only adds cannot break a floor. The precedent is Vampire Survivors' per-minute enemy minimum, which drops Mad Forest's floor from 30 to 10 on both guaranteed Flower Wall minutes so the table protects its own event rather than trusting the event to survive the floor (`docs/research/set-piece-and-final-boss-chunk.md` section 2).

**What they are not is an always-on invariant over every live mob, and that is what reconciles the two gates.** The game design gate asked that a section's property survive the director rather than describe the authored rows alone, and a spend gate delivers exactly that: the property is a fact about what the section will ever hold, and the director cannot spend past it. The tech architecture gate found that the same rows written as an invariant fault the wrong party. The Procession's rows stand about nine seconds apart against an unkilled body's roughly fifteen-second descent (`stage.ts:54-56`, the measured drain-out), and the Vigil authors about 0.8 bodies a second against a ceiling of four, so a player who kills slowly puts two authored templates and a fifth authored body on the field with nothing wrong. ADR 0023 runs every invariant in every build a player is handed, so a check a slow hand can trip is a check that fires at a player and lands in their tape as a defect in the game. Both gates are answered by the same two rows read as a permission rather than as a law: the director obeys them, and the authored rows are never measured against them.

**So spec tests 4 to 6 state their killing policy, and the policy is part of the assertion.** Each of the three runs the section under a stated hand rather than under whatever the default produces: either the sharp hand, which kills what arrives, or a pinned full build through `createRun`'s third parameter with `uniformLevels` (`run.ts:177`, `run.ts:215-219`), the same pin verification step 7 already uses. The sentence each test pins is that the section holds its property under a hand that plays it, and the deliberate absence beside it is that nothing faults when a slower hand does not.

**`Phase.boss` is a genuine design decision and needs review.** It is the same move as `ends`, one column further: which boss a phase carries is authored stage data, so `enterNextPhase` reads the phase rather than testing its name. Today's `enterNextPhase` (`stage.ts:223-233`) already branches on `phase.name !== 'over'` to fire the stubbed victory, and with two real bosses and a set piece a name switch would grow three more arms, each of which is a fact the table could have carried. `BossKind` is declared in `rows.ts` rather than in `bosses/chunks.ts` for the ordering reason: the column is authored at slice 2 and the boss module does not exist until slice 6, and which boss stands where is stage data either way.

**`Phase.music` is a genuine design decision and needs review, and the earlier draft of it is withdrawn.** That draft carried the asset alias itself, a bare `string` on the phase, and argued it was not a boundary violation because the sim never resolves it. It is withdrawn for a smaller reason than the boundary: a bare `string` cannot be checked. `PhaseMusic` is instead a closed union of three loop names, and the alias table that resolves them to files lives in `src/app` beside the clip table `sound.ts:31-37` already carries. That buys two things a string could not. A phase naming a loop that has no file is a type error rather than a silent no-op the player hears as silence, and module test 131 can assert the alias table covers every member of the union, which is what makes six loops a data-row edit that the compiler checks rather than one somebody has to remember to mirror. The authored fact stays in `src/game` where the section's music belongs (ADR 0049); only the filename crosses into `src/app`, which is where every other filename in the app already is.

### `src/game/stage/setPiece.ts` (new)

```ts
// The waking: a source on the ground layer that pours trash from one point (ADR 0042, ADR 0050).
interface SetPiece {
  // Where the source is, in field units. It drifts down and sweeps across.
  x: number;
  y: number;
  // Whether it has opened and is pouring. While false it takes no damage.
  open: boolean;
  // Bodies left to pour. At zero it is spent.
  budget: number;
  // Ticks to the next body.
  pourIn: number;
  // Its own health, sized so the pour completes under a full build (ADR 0007's
  // storm must matter; the moment it can end early is the source's stay).
  hp: number;
}

// Placed dormant by a Crowd row at SET_PIECE_PLACED_AT (ADR 0050).
const placeSetPiece: (state: RunState) => SetPiece;
// One tick: drift, sweep, open around mid-field, pour, and the three ways it ends.
const advanceSetPiece: (state: RunState) => SimEvent[];
// The source's hitbox against the storm, or null while it is dormant. It has
// none against the grave, ever.
const setPieceHitbox: (piece: SetPiece) => Rect | null;

export { placeSetPiece, advanceSetPiece, setPieceHitbox };
export type { SetPiece };
```

**This module declares no magnitude of its own.** The budget, the pour interval, the health and the two sweep bounds are rows in `rows.ts` and are imported here, because `peakArrivals` needs the pour's rate and `rows.ts` is the one module in the chain that value-imports nothing. Behaviour here, data there, and the arrow points one way. `POUR_SHARES` is read by the stage's spawner and not by this module: what fires under the pour is the Crowd's business and not the source's.

**`SetPiece` is a genuine design decision and needs review.** It is a new kind of thing on the field: not a mob, not food, not mob fire. The reviewable choices are that it is a single record on `RunState` rather than a pool (there is exactly one, ever, and a pool of one is a lie about the design), that it has no hitbox against the grave (the parking rule in the design record, section 2), and that it emits no mob fire at all (ADR 0050: "it fires no pattern the player has to dodge as a boss pattern"), so it never touches `mobFire.ts`.

**`SET_PIECE_HP` and the dormant source's immunity are a genuine design decision and need review.** The game design gate found that the loudest beat in the run could not fire as written: the source had no health row while the dive that carries its property is the same move that shoots it, so a committing full build deletes the moment it is committing to. Two rows answer it, both in the design record's section 2 with the arithmetic shown. The source takes damage only while it is open and pouring, which is Gradius's ordinary Moai. And `SET_PIECE_HP` is 2400 initially against a full build's 150 points of storm a second over a fifteen-second pour, 2250, so the pour always completes and a fast kill ends the source's stay rather than its pour, which is Ikaruga's bunretsu read the same way round. `SET_PIECE_POUR_TICKS` is 12 rather than 20, so the pour runs at 5.0 bodies a second against the Crowd's densest authored 3.6, and `SET_PIECE_BUDGET` is 75 so the pour still lasts fifteen seconds. Every one of those is an initial row tuned by the harness at step 4. The commitment this creates is in section 9: it refines `game-concept.md:50`'s "killing it ends the moment early".

### `src/game/bosses/chunks.ts` (new)

Named after `tracer-plan.md:85`, which already reserves the module and its job.

```ts
// A boss's chunked health and the flash between chunks (ADR 0007).
interface Boss {
  readonly kind: BossKind;
  // Which chunk is live. It only ever increases.
  chunk: number;
  hp: number;
  x: number;
  y: number;
  // Ticks of the invincible flash left; while positive, player shots do nothing.
  flash: number;
  // The pattern's own clock, reset at each chunk break.
  patternTick: number;
}

// BossKind is declared in rows.ts and type-imported here: the phase column that
// names a boss is authored two slices before this module exists.

const spawnBoss: (state: RunState, kind: BossKind) => Boss;
// Damage from the storm. Zero while the flash is live; a break sheds a feast (ADR 0007).
const damageBoss: (state: RunState, amount: number, source: DamageSource) => SimEvent[];
const bossHitbox: (boss: Boss) => Rect;
// One tick of whichever chunk is live, delegated to the boss's own module.
const advanceBoss: (state: RunState) => SimEvent[];

const CHUNK_FLASH_TICKS: number;
const CHUNK_HP: Readonly<Record<BossKind, readonly number[]>>;
```

**`Boss` and `CHUNK_HP` are a genuine design decision and need review.** `Boss` is one record on `RunState` and never a pool, for the same reason as `SetPiece`, and `chunk` only ever increasing is what an invariant holds. `CHUNK_HP` is a per-boss table of health per chunk, which is what ADR 0052 means by "health per chunk is tuning data" and what makes the fight's length chunk count times health per chunk rather than one bar. Four fields on the row and no more; a fifth needs a caller today.

**`CHUNK_HP` carries a property as well as a length, and it is derived rather than picked.** The property is that every chunk survives one full emit under the sharp hand, so the best player in the game still sees the pattern the chunk was written for; `game-concept.md:104` already names the symptom as an instrument, and the handoff's open question about uncancelled patterns is answered there for the belch and not for the storm. The floor per chunk is a full build's 150 points of storm a second times one emit's length, and one emit is one clod curtain falling with its gap sweeping once, four seconds, or one full revolution of the shovel arm, five seconds: 150 x 5 = 750. The initial rows sit well above the floor, because the floor is not the fight's length: at an initial effective share of one third against a boss at the top of the field, 50 points a second, ADR 0052's hundred seconds across three chunks is 5000, so the Undertaker's rows are 1700, 1700, 1700 and the Banshee's are 1100 and 1100 for her nominal forty-five. All initial, all first in line for the harness at step 4, and the arithmetic is in the design record's section 4. Spec test 44 asserts the property.

### `src/game/bosses/banshee.ts` and `src/game/bosses/undertaker.ts` (new)

```ts
// banshee.ts: expanding tear-rings, one clean gap; chunk two adds a second offset source.
const advanceBanshee: (state: RunState, boss: Boss) => SimEvent[];
// Her death: a feast that never decays, and the Wall clock starts (game-concept.md:56).
const bansheeDied: (state: RunState, boss: Boss) => SimEvent[];
const RING_ROWS: readonly RingRow[];

// undertaker.ts: the burial, the exhumation, the locked overlap.
const advanceUndertaker: (state: RunState, boss: Boss) => SimEvent[];
// The gap the curtain always leaves: the grave's current width plus a fixed margin (ADR 0003).
const curtainGap: (graveSize: number) => number;
const CURTAIN_ROWS: readonly CurtainRow[];
const SPIRAL_ROWS: readonly SpiralRow[];
const GAP_MARGIN: number;
```

**`curtainGap` is a genuine design decision and needs review.** It is the one place in the game where a boss's pattern reads the grave's state, and ADR 0003 requires it ("the Undertaker's gap rule scales with grave width"). The reviewable part is that it takes the size scalar rather than the grave, so the pattern module never holds an entity and the rule is one arithmetic function a test can exercise across the whole size range from `SIZE_FLOOR` (`tuning.ts:66`) to `SIZE_CEILING` (`tuning.ts:53`).

### `src/game/stormTargets.ts` (new)

The one seam through which the storm finds what it can hit.

```ts
/**
 * One thing the storm can hit this tick, whatever kind of thing it is standing
 * on the field as. A weapon line reads this and never learns that a boss or a
 * set piece exists (the standing extensibility constraint, path-draft.md:21).
 */
interface StormTarget {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly box: Rect;
  readonly hp: number;
  // Whether its top edge is inside the field, which is the belch's scope limit.
  readonly entered: boolean;
  // Whether a push moves it. False where an authored pattern would smear (ADR 0007).
  readonly pushable: boolean;
  // Whether one hit can take the whole of it. False where health is chunked or
  // is sized to outlive its own moment, which is what a kill rule has to read.
  readonly killableOutright: boolean;
}

// Every live target this tick, in a fixed order: the mob pool in slot order,
// then the boss, then the set piece's source.
const stormTargets: (state: RunState) => readonly StormTarget[];
// The target carrying this id, or null once it is gone.
const stormTarget: (state: RunState, id: number) => StormTarget | null;
// Damage onto whatever carries this target. The kill, the corpse and the chunk
// break are the owning module's business and come back as events.
const damageStormTarget: (
  state: RunState,
  target: StormTarget,
  amount: number,
  source: DamageSource,
) => SimEvent[];
// Moves whatever carries this target, for a line that pushes. A no-op on a
// target that is not pushable, so the caller never branches on what it hit.
const moveStormTarget: (state: RunState, target: StormTarget, x: number, y: number) => void;

export { stormTargets, stormTarget, damageStormTarget, moveStormTarget };
export type { StormTarget };
```

**The seam is what makes the storm's pass reach a boss at all, and without it the boss is unreachable.** Every weapon line finds its targets today by walking `state.mobs` directly, in five places: `storm.ts:44` (`mobUnder`, the skulls' overlap), `bell.ts:256` (`sweepToll`), `territory.ts:351` (`eligiblePoints`), `wisps.ts:99` (`targetOf`) and `belch.ts:56` (`burstNearbyMobs`). A boss is one record on `RunState` and not a member of the mob pool, so on the plan as first written every line would have walked straight past it and ADR 0007's storm-must-always-matter would have failed in five modules at once. The five sites are the seam's readers and they are the whole of its caller list.

**The fix is one seam and never five, because the alternative is five copies of the same branch.** The rule the seam exists to keep is that no weapon line learns a boss or a set piece exists: a line asks for targets, damages one, and pushes one, and what it is holding is the seam's business. That is the same constraint fence test 110 already makes mechanical from the boss's side, read from the line's side, and fence 124 is its guard: none of the five modules walks `state.mobs`.

**Per-tick cost is a stated constraint and not an afterthought.** `stormTargets` refills a module-owned buffer of pooled records in place and returns it, so a tick allocates nothing however many lines call it, and no caller retains the list past its own pass. That is the same shape the entity pools already use, and it is written down here because five callers a tick over a 160-slot pool is exactly where a fresh array per call would show up.

**`killableOutright` is a genuine design decision and needs review.** It exists for one caller, the belch, whose burst is a kill rule rather than a damage number (`belch.ts:59`: `damageMob(state, mob, mob.hp, 'belch')`). A boss's `hp` is one chunk, so a belch reaching it would break a chunk outright, which is a skip rather than the breath the design record's section 4 already rules the belch buys. The flag says the kill rule does not apply, the belch skips those targets, and what the belch still does in a boss fight is what that section already says it does: the gas takes every shot on the field. The reviewable alternative is a belch damage number against a chunked target, which is a magnitude nobody has measured and a second way for the reservoir to matter.

### `src/game/mobFire.ts` (changed)

```ts
// A shot with an authored direction, which is what every boss pattern needs (ADR 0007).
const fireDirectedShot: (
  state: RunState,
  from: { x: number; y: number },
  direction: { x: number; y: number },
  fire: FireRow,
  emitter: MobType | BossKind,
  kind: FireKind,
) => SimEvent[];

// Which of the four authored fire reads a shot draws in. It is the sim's word
// and the renderer's key, and palette.ts:256 already declares all four.
type FireKind = 'trash' | 'tear' | 'clod' | 'spiral';
```

`Shot` (`mobFire.ts:67-76`) gains `kind`, beside the `emitter` it already carries. `fireShot` (`mobFire.ts:134`) is untouched in aim and passes `'trash'`.

**Boss fire needs a fire kind and not a widened `emitter` alone, and the widening alone would have shipped boss patterns drawn as trash.** `MobFired.emitter` and `Shot.emitter` answer *who fired*, and four things read that answer, each of which the widening reaches:

- **`GraveHitSource` (`grave.ts:28`)** is `MobType | 'contact'` and is what `hitGrave` is handed at `step.ts:54`, straight off `shot.emitter`. It widens with the emitter.
- **`DamageTaken.hits` (`damageTaken.ts:20`)** is `Record<GraveHitSource, number>`, so the widened source adds two rows to a reading the harness prints, which is wanted: which boss's pattern is landing on the player is the exact thing #39 will ask.
- **`mobDamaged.id`** is joined against the mob pool in two readings, `timeToKill.ts:199-207` (which closes an engagement on `mobKilled` and rebuilds `liveIds` from `state.mobs`) and `replayTallies.ts:140-143`. A boss's id appears in neither pool, so a boss engagement would read as interrupted forever unless the readings say what they cover. They stay mob-only and say so in a comment; the boss's own report is `bossArrived`, `chunkBroke` and `bossKilled`, which is the vocabulary section 4's event block declares for it.
- **`mobFireSprite.ts:57` and `:99`** hard-code `MOB_FIRE.trash` for both the shot and its scatter, so every boss shot in the game would draw in the trash body colour. `palette.ts:256` already declares `type FireEmitter = 'trash' | 'tear' | 'clod' | 'spiral'` and `palette.ts:270-290` already declares all four sprites, so the renderer's half is reading `shot.kind` instead of a literal, and `FireKind` and `FireEmitter` are the same four members on both sides of the boundary.

*Who fired* and *what it looks like* are two different questions and neither answers the other: the Banshee's rings and her adds' shots share an emitter and not a read, and a clod and a tear share a boss and not a read. So the kind is its own field on the shot and on the event, and the sprite change lands in the slice that draws boss fire rather than in the slice that fires it.

### `src/game/corpses.ts` (changed)

```ts
// Room for one more corpse, or null at the cap. Nothing on the field is ever removed (ADR 0056).
const claimSlot: (state: RunState) => Corpse | null;
```

`oldestEvictable` (`corpses.ts:145`) is deleted and `claimSlot` loses its `events` parameter, because it no longer has anything to report.

### `src/game/caps.ts` (changed)

```ts
/**
 * Every corpse alive came from a mob alive when the freshness window opened or
 * from one that arrived inside it, plus treasure that never decays. So the cap
 * cannot bind in normal play (ADR 0056).
 */
const CORPSE_CAP: number; // MOB_CAP + peakArrivals(FRESHNESS_SECONDS) + TREASURE_ALLOWANCE
const TREASURE_ALLOWANCE: number;
```

### `src/game/run.ts` (changed)

```ts
interface RunState {
  // ... step 1's fields ...
  // The one boss on the field, or null (ADR 0007).
  boss: Boss | null;
  // The one set piece on the field, or null (ADR 0042).
  setPiece: SetPiece | null;
}
```

### `src/game/events.ts` (changed)

```ts
interface BossArrived { readonly type: 'bossArrived'; readonly boss: BossKind; readonly chunks: number }
interface ChunkBroke { readonly type: 'chunkBroke'; readonly boss: BossKind; readonly chunk: number }
interface BossKilled { readonly type: 'bossKilled'; readonly boss: BossKind; readonly x: number; readonly y: number }
interface SetPieceOpened { readonly type: 'setPieceOpened'; readonly x: number; readonly y: number; readonly budget: number }
interface SetPiecePoured { readonly type: 'setPiecePoured'; readonly x: number; readonly y: number; readonly left: number }
interface SetPieceClosed { readonly type: 'setPieceClosed'; readonly reason: SetPieceClosing; readonly left: number }
type SetPieceClosing = 'spent' | 'killed' | 'scrolled';

// MobFired (events.ts:144-149) gains the fire kind beside the emitter it carries.
interface MobFired {
  readonly type: 'mobFired';
  readonly emitter: MobType | BossKind;
  readonly kind: FireKind;
  readonly x: number;
  readonly y: number;
}
```

`CorpseEvicted` (`events.ts:165-170`) is deleted with the path that produced it.

**These six events are a genuine design decision and need review.** They are the vocabulary the section timeline reading, the harness's boss report and the store's per-run columns are built on, and `docs/agents/lessons.md` names the event vocabulary as one of the four things expensive to unpick later. `SetPieceClosing` is one event with a closed reason rather than three events, on the `PatchClosed` precedent at `events.ts:199-215`: the three are ends of one thing rather than opposite meanings, every set piece reaches exactly one of them, and a reading groups by the reason.

### `src/dev/readings/sectionTimeline.ts` (new)

```ts
// One phase's span on the tape, in ticks.
interface SectionSpan {
  readonly phase: PhaseName;
  readonly from: number;
  // Null while the phase is still live at the tape's end (ADR 0026: a partial tape is a valid tape).
  readonly to: number | null;
}
interface SectionTimeline { readonly spans: readonly SectionSpan[] }
```

Adding a reading beside unchanged ones does not bump `READINGS_VERSION` (`src/dev/readingsVersion.ts:13-15`).

### `src/app/screens/game/BackgroundRenderer.ts` and `BossRenderer.ts` (new)

Both are dumb views: data in, pixels out, powers as props at construction, attached in `GameScreen.dressField` (`GameScreen.ts:222-227`) and in `ReplayScreen`'s mirror at `ReplayScreen.ts:95`. Both draw into layers that already exist; neither adds a layer name.

### `src/app/sound.ts` (changed)

```ts
// The music seam, beside the one-shot seam. Loops and cross-fades (audio.ts:21-44).
interface MusicOutput { play(alias: string, options: { volume: number }): void }
// The loop a phase change asks for, or null when the phase names none.
const musicFor: (event: SimEvent) => string | null;
```

`SoundOutput` (`sound.ts:26-28`) is untouched; the music channel is a second seam rather than a widening of the first, because `SFX.play` and `BGM.play` are different objects on the engine (`AudioPlugin.ts:27-39`) and folding them would put a stop-and-fade contract on a one-shot.

---

## 5. Module boundaries

Every module is owned by this dispatch unless its row says otherwise.

| Module | New or changed | What it is for | Owner |
| --- | --- | --- | --- |
| `src/game/stage/rows.ts` | New | The three section tables as data, their carrier and permission columns, the row that places the dormant source, the pour's own rows, the reduced share the Crowd fires at under it, `BossKind`, the boss-add and rung allowances, and the peak-arrivals query over all of it. Value-imports nothing from `src/game`; takes `MobType` and `TemplateName` type-only. Every magnitude the query counts is declared here, which is what keeps `caps.ts` off the stage machine. | This dispatch |
| `src/game/stormTargets.ts` | New | **The storm's pass reaches the boss and the source.** The one seam through which every weapon line finds what it can hit, damages it and pushes it, so no line learns a boss or a set piece exists. Its five readers are `storm.ts:44`, `bell.ts:256`, `territory.ts:351`, `wisps.ts:99` and `belch.ts:56`, each of which stops walking `state.mobs`. | This dispatch |
| `src/game/lines/storm.ts`, `bell.ts`, `territory.ts`, `wisps.ts`, `belch.ts` | Changed | Each swaps its own walk over `state.mobs` for the seam. No other change: the bell keeps its own push arithmetic and only asks the seam to apply it, and the belch keeps its own scope and only asks the seam what its kill rule can apply to. | This dispatch |
| `src/game/stage/stage.ts` | Changed | The seven-phase machine, the boundary chain, the per-phase end condition, and the per-phase permission, music and ceiling rows. The tables move out to `rows.ts`. | This dispatch |
| `src/game/stage/setPiece.ts` | New | The Waking's behaviour: the source, its dormant placement and its opening, the sweep, the pour, and the three ways it closes. Owns ADR 0042's second instance entirely, and declares none of its own magnitudes: the budget, the interval, the health and the sweep bounds are rows in `rows.ts` and are read from there, so the corpse cap's query never imports this module. | This dispatch |
| `src/game/stage/templates.ts` | Unchanged | The placement library stands as it is. The Waking pours from a point and is not a template, because a template says where a group arrives and how it is arranged (ADR 0016) and a pour is neither. | This dispatch (no edit) |
| `src/game/bosses/chunks.ts` | New | Chunked health, the invincible flash, the chunk-break feast, bell immunity to push with full bell damage. Owns ADR 0007's machine. | This dispatch |
| `src/game/bosses/banshee.ts` | New | Her two chunks, her ring emitter, her death feast, the Wall clock. Owns her half of the grammar (`game-concept.md:72`). | This dispatch |
| `src/game/bosses/undertaker.ts` | New | His three chunks, the curtains, the spiral, the diggers, the gap rule, and the locked overlap. Owns his half of the grammar. | This dispatch |
| `src/game/mobFire.ts` | Changed | Gains the directed shot, the widened emitter and the fire kind on `Shot`. The aimed shot, the tell, the armed share and the cull all stand. | This dispatch |
| `src/game/grave.ts` | Changed | `GraveHitSource` (`grave.ts:28`) widens with the emitter, so who hurt the player names a boss where a boss's pattern landed. Nothing else in the module moves. | This dispatch |
| `src/dev/readings/damageTaken.ts` | Changed | `hits` (`:20`) is keyed by `GraveHitSource` and gains the two boss rows for free. | This dispatch |
| `src/dev/readings/timeToKill.ts`, `src/dev/replayTallies.ts` | Changed | Comment only, and it is the point: both join `mobDamaged.id` against the mob pool (`timeToKill.ts:199-207`, `replayTallies.ts:140-143`) and neither covers a boss, so each says so where a reader would otherwise assume it did. | This dispatch |
| `src/app/screens/game/mobFireSprite.ts` | Changed | `MOB_FIRE.trash` at `:57` and `:99` becomes a read of the shot's own kind, so a tear, a clod and a spiral draw in the three sprites `palette.ts:270-290` already declares. | This dispatch |
| `src/game/mobs.ts` | Changed | The digger path: a boss spawns ordinary trash at a chosen point, so adds are trash with normal pushback and normal corpses (`CONTEXT.md:157`). No new `MobType`. | This dispatch |
| `src/game/corpses.ts` | Changed | `claimSlot` refuses at the cap; the eviction path and `oldestEvictable` retire; `spawnFeast` gains its first callers. | This dispatch |
| `src/game/caps.ts` | Changed | `CORPSE_CAP` derived, `TREASURE_ALLOWANCE` declared. `MOB_CAP` is **not** touched: re-deriving it above floor plus budget needs the budget, which is step 4's. | This dispatch for the corpse cap; **`MOB_CAP` unowned, trigger recorded** |
| `src/game/run.ts` | Changed | `RunState` gains `boss` and `setPiece`. | This dispatch |
| `src/game/step.ts` | Changed | The boss tick and the set-piece tick take their places in the stated order. The storm's pass reaching them is `stormTargets.ts`'s row above and not this one. The belch-before-every-overlap rule at `step.ts:195-198` is guarded through the change, and `step.ts:54` hands `hitGrave` a widened emitter. | This dispatch |
| `src/game/events.ts` | Changed | Six new payloads; `CorpseEvicted` retires. | This dispatch |
| `src/game/witness.ts` | Changed | `WITNESS_VERSION` moves once; folds the boss and the set piece; `foldStage` (`witness.ts:266-269`) gains nothing, because the phase state's shape is unchanged. | This dispatch |
| `src/game/invariants.ts` | Changed | New checks: a boss chunk only increases, a set piece budget is never negative, a corpse spawn refused at the cap. | This dispatch |
| `src/game/faults.ts` | Changed | Appends the new identities to `FAULT_IDENTITIES` (`faults.ts:18-34`) and their severities, after step 1's. | This dispatch |
| `src/tape/wireCodes.ts` | Changed | Appends the new fault identity codes. `FORMAT_VERSION` (`wireCodes.ts:28`) does not move. | This dispatch |
| `src/dev/readings/sectionTimeline.ts` | New | The per-phase spans read off a tape, and the instrument the nine-minute claim is measured with. | This dispatch |
| `src/dev/readings/readings.ts` | Changed | Registers the new reading in the five places the graph is declared (`readings.ts:72-85`, `:87-100`, `:109-125`, `:135-154`, `:156-169`). | This dispatch |
| `src/dev/bot.ts` | Changed | A hit-taking policy so the floor ladder is reachable in a boss fight. The offer in the dodge policy is **step 3**. | This dispatch for the hit-taking policy; **the offer policy unowned, step 3 owns it** |
| `src/dev/digest.ts` | Changed | `GOLDEN` regenerated per behaviour-changing slice. The scenario itself is unchanged. | This dispatch |
| `src/app/screens/game/BackgroundRenderer.ts` | New | The ground, the per-section dressing, the drift window, and the Waking's source sprite. Draws into `ground` only. | This dispatch |
| `src/app/screens/game/BossRenderer.ts` | New | The two bosses as vector silhouettes in their existing palette pairs, and the chunk-break flash. Draws into `mobBodies`. | This dispatch |
| `src/app/screens/game/FieldRenderer.ts` | Changed | Sprite pools resize with `CORPSE_CAP` (`FieldRenderer.ts:154-155`); boss patterns are ordinary mob fire and need no change. | This dispatch |
| `src/app/screens/game/GameScreen.ts`, `ReplayScreen.ts` | Changed | Both `dressField` sites attach the two new renderers (`GameScreen.ts:222-227`, `ReplayScreen.ts:95`). Missing the replay one is how a renderer ships unseen (`docs/agents/lessons.md`, "watch the feature end to end"). | This dispatch |
| `src/app/screens/game/layering.ts` | Unchanged | `ground` gains a consumer and no name is added. Guarded by verification step 14. | This dispatch (no edit) |
| `src/app/palette.ts` | Changed | Five new entries, each measured in tree before it is written down. | This dispatch |
| `CONTEXT.md` | Changed | Four glossary entries: the Procession, the Crowd and the Vigil under the existing Section entry (`CONTEXT.md:121`), and the Waking beside the Wall (`CONTEXT.md:129`). No ADR: ADR 0050 already rules that there are three sections and what bounds them, and decision 25 is Mark's naming of the set piece. | This dispatch |
| `apps/hungry-grave/scripts/grayscale-import.ts` | New | **The grayscale import, as a script with an owner.** It takes the staged folders it is given, desaturates every sprite and tile through ImageMagick, and writes them into `raw-assets`. It is a script and not a note in a slice because it is run again every time an asset is restaged, and an import step nobody owns is an import step that gets done by hand once and forgotten. It runs under `pnpm` beside the other scripts in that folder. | This dispatch |
| `raw-assets/` | Changed | Holds the grayscale output the script writes, so the art is coloured only by its palette entry through tint. | This dispatch |
| `apps/hungry-grave/package.json` | Changed | Adds `pngjs` as a devDependency. Fence 122 has to read pixels out of a PNG under vitest and nothing in the tree can: `sharp` is transitive at best and depending on another package's tree for a test's only decoder is how a fence stops running without anyone noticing. Covered by pre-authorization item 14 (`pre-authorizations.md:20`, an image tool for asset conversion). | This dispatch |
| `src/app/sound.ts` | Changed | The music seam and the per-phase cue. | This dispatch |
| `src/main.ts` | Changed | Wires the music power beside `playSound` (`main.ts:178`). | This dispatch |
| `.assetpack.js`, `scripts/assetpack-vite-plugin.ts` | Changed | A `music` bundle from a new `raw-assets/music{m}` folder, in both places, because `.assetpack.js:1-4` says the two configs must mirror each other. | This dispatch |
| The director's budget, the per-phase purse, `MOB_CAP` re-derived | **Not built** | ADR 0056's budget. **Unowned, with a trigger:** step 4 (#85). `peakArrivals` is written so the budget is one more addend, and `StageRow.directed` and `Phase.directed` are the cells it reads. | **Unowned, trigger recorded** |
| The dodge policy taking an offer | **Not built** | Step 3 (#98). This step's headless runs read carriers reached and bosses killed, never offers chosen. | **Unowned, step 3 owns it** |
| The visible ladder and the rung body | **Not built** | Step 5 (#72, ADR 0054, ADR 0055). Nothing here draws a level. | **Unowned, step 5 owns it** |
| A general body-separation mechanism | **Not built** | #81. The Waking's pour carries its own narrow no-stack rule (a spacing at the source), which is the one caller this step creates. **Unowned, with a trigger:** the rendered check at verification step 11, if bodies pile unreadably at the Waking or in the Crowd's overlap, #81 lands before step 3. | **Unowned, trigger recorded** |
| Real audio, and the art pass | **Not built** | #47 and #38, both off the road. Everything this step draws and plays is a stand-in and is tagged as one. | **Unowned, off the road** |
| `@pixi/sound` chunk splitting | **Not built** | #50. This step touches the audio path, which is #50's named look-here moment (`path-draft.md:40`), and finds the claim true with drifted citations (design record, section 10, item 2). Not fixed here: it is a build concern with no measured player cost. **Unowned, trigger recorded.** | **Unowned, #50 owns it** |

### Where the tuning rows live

Each boss's per-chunk rows live in that boss's own module and are exported at its module end, which is the shape `tuning.ts:1-3` already declares for weapon lines and which keeps one boss's numbers out of the other's file. The stage's rows live in `rows.ts`, and so do the set piece's: `setPiece.ts` declares no magnitude of its own and imports its budget, pour interval, health and sweep bounds from `rows.ts`, because `peakArrivals` reads those same rows and a `rows.ts` that reached `setPiece.ts` would close the import cycle section 4 rejects. Behaviour in `setPiece.ts`, data in `rows.ts`. Nothing outside a module indexes another's rows.

**No boss module names a weapon line.** The standing extensibility constraint (`path-draft.md:21`) binds here too: a boss takes damage from a `DamageSource` (`mobs.ts:36`) and never asks which line landed it, so a fifth line needs no edit in `bosses/`. The fence in section 6 holds it.

---

## 6. Planned test list

Every test is written as a `test.todo` placeholder against a stub before implementation. Spec tests first, each quoting the sentence it pins.

### Spec tests from the ADRs and the record

**`src/game/stage/__tests__/stage.test.ts`**

1. *The stage runs in three sections, with the Banshee, the set piece and the Undertaker as their boundary events.* Pins ADR 0050: "The Banshee ends the first, a swarm set piece ends the second, and the Undertaker ends the third and the stage."
2. *The opening section is the shortest, the middle the longest, and the last shorter again.* Pins ADR 0050: "The opening section is the short one, the middle section is the longest, and the last is shorter again, Ikaruga's shape."
3. *A full run lands inside eight to ten minutes.* Pins ADR 0049's title and its band.
4. *Under a hand that kills what arrives, the Procession never has more than one template live.* Pins `game-concept.md:48`: "the first owns emptiness, never more than one template live." The killing policy is part of the assertion and is stated in the test: the sharp hand, or a pinned full build through `createRun`'s third parameter with `uniformLevels` (`run.ts:177`). The section's ceiling is `Phase.liveTemplateCeiling`, which the director at step 4 may not spend past (ADR 0047), and the test reads it from the phase rather than restating it. The deliberate absence beside it, in the same file: a slower hand that leaves two templates on the field raises no fault, because the authored rows are the floor and ADR 0023 puts every invariant in the player's own build.
5. *The Crowd never has fewer than two templates live.* Pins the same sentence's second clause. It stays a floor over live mobs and carries no ceiling row, because a director that adds and never removes cannot break a floor. A floor needs no killing policy: a hand that kills slowly only ever helps it.
6. *Under the same hand, the Vigil pays less food per second than the Crowd.* Pins the same sentence's third clause, restated on the quantity the code supports (design record section 10, item 1). The test holds **food swallowed per second**, growth paid per second, and never corpses per second and never payout per kill: a revenant corpse pays double (`mobs.ts:94`), so a corpses-per-second test passes while the section feeds better. It runs under the same stated policy as test 4, because food swallowed per second is only a number once something is doing the killing. The section's ceiling is `Phase.liveBodyCeiling`, read from the phase and binding on the director, and the comparison is against the Crowd rather than against the Procession, which owns emptiness rather than a feeding rate.
7. *A section ends on a boundary event rather than on an absolute clock.* Pins `CONTEXT.md:119` and `game-concept.md:52`: "because a shootable boss dies when killed and fight length varies per player."
8. *Where each boundary falls is stage data.* Pins ADR 0050: "where each boundary falls on the clock is stage data." The test moves a row and watches the boundary move.
9. *Mobs keep arriving through the last row before a boss, thinly and further apart.* Pins ADR 0051: "Mobs keep arriving, thinly and further apart."
10. *A boss phase begins on a field with no live mob.* Pins ADR 0051: "the boss arrives as the last of them leaves the field," and "the Banshee and the Undertaker arrive alone on an empty field."
11. *Nothing thins before the set piece, and the Crowd is still firing while it pours.* Pins ADR 0051: "there is no drain-out before the set piece ... only the two boss boundaries need the field empty." The Crowd's rows keep firing through the pour at their authored reduced share, so the set piece arrives into trash and stays in it.
12. *The sparse row's count, type and spacing are stage data.* Pins ADR 0051: "The row itself, how many, which type, how far apart, is stage data." Initial rows, from the design record's "How a section ends": four bodies, shamblers, one every ninety ticks. The test moves them and watches the row follow.
13. *No spawn silence exists anywhere in the stage.* The deliberate-absence guard for ADR 0051's supersession of the drain-out: no window in any phase has no row due and no mob alive for longer than the slowest type's own descent.
14. *Length buys no power on its own.* Pins ADR 0049: "so a longer stage is a longer stage and not a richer one unless the carrier rows say so." The test doubles a section's length and watches the carrier count not move.

**`src/game/stage/__tests__/setPiece.test.ts`**

15. *The set piece pours trash from one point and fires nothing.* Pins ADR 0050: "it fires no pattern the player has to dodge as a boss pattern."
16. *A grave that commits to the trail swallows more of it than one that holds at the bottom edge.* The property, first half. Pins ADR 0042: "a set piece names the property it must keep."
17. *Neither the committing policy nor the waiting policy is sealed.* The property, second half. Pins ADR 0042's requirement that the property be two-sided with both halves load-bearing, and ADR 0050's "the storm shreds the swarm."
18. *Killing the source ends the moment early and the unspent budget is never poured later.* Pins ADR 0007's storm-must-always-matter through the shootable answer in `game-concept.md:50`.
19. *Nothing the set piece does fills the reservoir.* Pins ADR 0050: "It is not a second feast, because the Wall stays the run's outlier and its reservoir gift is the one that is choreographed."
20. *The set piece's tests name no mob type.* Pins ADR 0042: "A set piece names the property it must keep, never the mob types allowed in it." The fence form: the file contains no string literal equal to any member of `MOB_TYPE_NAMES` (`mobs.ts:124`).
21. *The source never damages the grave.* The deliberate-absence guard for the parking rule: the source is in no overlap pass against the grave.
22. *The trail never lays against a field edge.* The sweep stays inside its authored bounds at every tick.

**`src/game/bosses/__tests__/chunks.test.ts`**

23. *A boss arrives alone on a phase boundary with chunked health and one authored pattern per chunk.* Pins ADR 0007's first sentence.
24. *A short invincible flash separates chunks, and player shots do nothing during it.* Pins ADR 0007.
25. *No chunk is pure dodging: the storm damages the boss in every one.* Pins ADR 0007: "there are no pure-dodge survival phases anywhere in v1, because the player's storm must always matter."
26. *A boss takes the bell's full damage at its distance.* The damage half of ADR 0007's sentence. Split from the push half, which is test 123, because the two land in different modules: the damage is the seam carrying a line's number to a target it does not know the kind of, and the push is the seam refusing to move one. A test that asserts both at once passes when either is right.
27. *A boss sheds food throughout the fight.* Pins ADR 0007: "Bosses shed food throughout the fight, so the swallow economy never goes dark at the climax."
28. *A chunk-break feast never decays.* Pins `game-concept.md:66` under ADR 0004: "the feast chunk dropped at each chunk break never decays, exactly like an upgrade drop."

**`src/game/bosses/__tests__/banshee.test.ts`**

29. *Chunk one throws slow expanding tear-rings, each with one clean gap.* Pins `game-concept.md:68` under ADR 0007's one-pattern-per-chunk.
30. *Chunk two adds a second offset ring source, so the gaps stop lining up.* Pins the same.
31. *Her death drops a feast that never decays.* Pins the same, and ADR 0004's treasure class.
32. *Swallowing her feast fills the reservoir exactly and wastes nothing.* Pins `tuning.ts:104-108`'s stated construction and `game-concept.md:56`.
33. *Her death starts the Wall clock and her swallow does not.* Pins `game-concept.md:56`: "the belch stays earned through the mouth and the stage never waits on a pickup." The test kills her and never dives, and the Wall still arrives.
34. *Her tear-rings are mob fire and never a cone.* Pins `CONTEXT.md:79`: "The Banshee's tear-rings are mob fire and are never a cone."

**`src/game/bosses/__tests__/undertaker.test.ts`**

35. *He runs three chunks.* Pins ADR 0052: "it gets there across three chunks rather than across a bigger health bar."
36. *The third chunk is a new pattern inside his own grammar.* Pins ADR 0052: "a new authored pattern inside the Undertaker's own grammar of falling curtains and slow spirals, so the grammar stays exclusive to him."
37. *The curtain's gap is the grave's current width plus a fixed margin, at every size from floor to ceiling.* Pins ADR 0003's gap rule through `game-concept.md:70`: "so size earned before the fight is never punished."
38. *A clod curtain is never a wall: a gap always exists.* Pins `game-concept.md:70` and the danmaku definition of a wall cited in `docs/research/set-piece-and-final-boss-chunk.md` section 3.
39. *Chunk two summons diggers, which are ordinary trash leaving ordinary corpses.* Pins `game-concept.md:70` and `CONTEXT.md:157`: "Adds are trash: normal pushback, normal corpses."
40. *Chunk three runs both earlier patterns at once, and its curtain is thinner than chunk one's.* Pins decision 26 and the record's Yuyuko trade: "the overlap should arrive with the clod curtain thinner than in chunk one, not denser."
41. *Chunk three's gap sits where the arm has just swept.* Pins decision 26: "the safe place is the place the arm has already been."
42. *The diggers keep coming through chunk three.* Pins ADR 0007's shed-food requirement across the last chunk, and the record's "last, not middle, and the reason is food."
43. *He throws no cone and no expanding ring.* The deliberate-absence guard for `game-concept.md:72`'s grammar exclusivity.
44. *Every chunk survives one full emit under the sharp hand, and his length is chunk count times health per chunk.* Pins ADR 0052 ("Health per chunk is tuning data") and `game-concept.md:104`'s instrument, "whether a pattern chunk ever ends before finishing one full emit". The first half is the property the game design gate asked for: at a full build's storm, no chunk dies before its live pattern has completed one emit, so the best player still sees the pattern the chunk was written for. The second half pins the relation and never a magnitude. **The test derives the storm floor and never pins 150.** The design record's arithmetic shows the derivation from the four lines' own rows, and the test computes the same figure the same way, from each line's exported damage and interval at maxed levels. Pinning the number would pin a figure read off `skullStream.ts`, `bell.ts` and `belch.ts` while step 1 was rewriting all three, and a test carrying a stale constant that no longer matches the weapons is worse than no test: it passes while the property it names has quietly gone.

**`src/__tests__/endings.test.ts`** (cross-cutting, spans `src/game` and `src/dev`)

45. *Victory fires on the Undertaker's death and not on reaching a phase.* Pins ADR 0007's ending through `game-concept.md:70`: "His death is the ending." Retires the stub at `stage.ts:230-232`, whose own comment at `stage.ts:218-222` says it is one.
46. *Victory pays nothing.* Pins `game-concept.md:70`: "no payout, the grave swallows the gravedigger."
47. *Sealed shut is reachable inside a boss fight, through the whole ladder in order.* Pins ADR 0003: "hits bleed score first, then weapon levels down to the birthright loadout, and only when nothing is left to bleed does the next hit seal the grave shut."
48. *Both endings are reached across the seeds, so neither is unreachable.* Pins ADR 0028's `ending` field being sealed, victory or absent, and carries forward the existing assertion at `bot.test.ts:488-509`.

**`src/game/__tests__/caps.test.ts`**

49. *The corpse cap never evicts food.* Pins ADR 0056: "the corpse cap is sized from scroll physics so that it cannot bind in normal play, never evicts food."
50. *A corpse spawn at the cap is refused and raises a fault.* Pins ADR 0056: "and raises a fault if it ever binds."
51. *The corpse cap is the mob cap plus the stage's peak arrivals in a freshness window plus the treasure allowance.* Pins ADR 0056's "sized from scroll physics" and the standing rule that a number which must exist before it can be measured is data rather than a compiled constant. Peak arrivals counts four terms, the section tables, the pour, boss-summoned adds and stripped rung bodies (ADR 0055), so the window it maximises over includes the inside of a boss fight.
52. *Nothing already on the field is ever removed.* Pins `caps.ts:62-65`'s own rule, guarded through the change: "a shot the player has read and started dodging cannot vanish."

**`src/game/stage/__tests__/rows.test.ts`**

53. *The stage's carrier rows hold at least `carriersScheduled()`.* Pins ADR 0048: "it holds more carriers than a full build needs, so missing one costs a step rather than the run."
54. *A run that kills every carrier before the set piece holds a full build.* Pins `game-concept.md:36` and decision 10's condition that a player who kills every carrier reaches the storm well before the boss.
55. *Every boss phase and the set piece phase are marked as cells the director may not spend in.* Pins ADR 0047's off-limits list and ADR 0056's "a per-phase permission row saying whether the director may spend at all."
56. *The Wall's row and every sparse row are marked the same way.* Pins ADR 0047: "The sparse last row before each boss ... it is authored as a thin row rather than as a special rule, so a director briefed to fill gaps cannot tell it from any other gap," and "The Wall, whose crossable-unloaded property is two-sided and fails silently with every test still green."
57. *The off-limits cells are readable from the row and phase data alone.* Pins ADR 0056: "so ADR 0047's four off-limits moments read as cells in the phase's data rather than as conditions in code." The test reads them without calling into `stage.ts`.

**`src/app/screens/game/__tests__/` and `src/app/__tests__/palette.test.ts`**

58. *Each phase names one music loop, and exactly two changes fire in a run, at the Banshee's death and at the eye opening.* Pins ADR 0049 ("plus stand-in music and backgrounds that enter V1 as the thing that makes a section tellable rather than as dressing") and decision 22's amendment, which names two changes and where they fall. Three aliases across seven phases, so the phases that inherit a loop name the same alias and `audio.ts:21` makes the call a no-op.
59. *The Vigil's tint departure sits in the hue band the readability record records as empty.* Pins `docs/research/readability-value-band.md` section 7.5 as quoted in #38's second comment: "hue 50 to 125 and 175 to 205 are entirely empty." The test holds the new entry's hue inside 175 to 205.
60. *Every colour the background and boss renderers draw is a declared palette entry.* Pins ADR 0014's band by construction, and is what makes the existing ceiling, hue-exclusion and brown checks cover the new art for free.

### Module tests

**`src/game/stage/__tests__/stage.test.ts`** (changed)

61. A phase that ends on `rowsSpentAndFieldClear`, whose rows are spent but whose field holds a live mob, does not end.
62. A phase that ends on `rowsSpentAndFieldClear`, with rows left, does not end even on an empty field.
63. The phase order crossed is procession, banshee, crowd, waking, vigil, undertaker, over.
64. `phaseTick` resets at every boundary and `phaseIndex` only increases.
65. The sparse tail is bounded by the slowest type's own descent across every seed.
66. Two boundaries can no longer fall on one tick, because no phase is empty.

**`src/game/stage/__tests__/rows.test.ts`** (new)

67. `peakArrivals(seconds)` returns the maximum arrivals inside any window of that length across all three tables, the pour, `BOSS_ADD_ALLOWANCE` and `RUNG_ALLOWANCE`.
68. `peakArrivals` moves when a row is added, and is zero for a zero window.
69. Every row's carrying indices are inside its own count.
70. Every section table is ordered by `t`.
71. `directed` is declared on every row and every phase, with no optional field anywhere.

**`src/game/stage/__tests__/setPiece.test.ts`** (new)

72. The source opens at its authored depth and not before.
73. The pour stops when the budget is spent, and `setPieceClosed` reports `spent` once.
74. A killed source reports `killed`, and a source off the bottom edge reports `scrolled`.
75. Two poured bodies never arrive on the same point.
76. The source draws from its own named seeded stream, so one seed pours one sequence (ADR 0006's stream rule, `game-concept.md:52`).
77. The source's own drift is slower than the field's scroll, so it is on screen longer than a mob.

**`src/game/bosses/__tests__/chunks.test.ts`** (new)

78. A chunk break fires exactly once per chunk.
79. Damage during the flash is reported as `mobDamaged` with zero applied, so an instrument can still see the storm working.
80. A boss cannot be killed during the flash.
81. A boss's adds are ordinary members of the mob pool and are culled by the ordinary rule.

**`src/game/bosses/__tests__/banshee.test.ts`** (new)

82. Her ring emitter draws from its own named stream.
83. The feast spawns at her death point and inherits the scroll like any other food.

**`src/game/bosses/__tests__/undertaker.test.ts`** (new)

84. The gap tracks a grave that grows mid-fight.
85. The gap tracks a grave that shrinks mid-fight, down to the size floor.
86. The two chunk-three emitters stay in phase for the whole chunk, so the gap keeps following the arm.

**`src/game/__tests__/caps.test.ts`** and **`corpses.test.ts`** (changed)

87. `oldestEvictable` is gone and no code path sets a live corpse's `alive` to false except a swallow, an expiry or a cull.
88. The derived cap is at least the mob cap plus peak arrivals plus the treasure allowance.
89. A refused corpse spawn returns no corpse and leaves the pool unchanged.

**`src/game/__tests__/mobFire.test.ts`** (changed)

90. A directed shot travels the direction it was given and is never re-aimed.
91. An aimed shot still aims at the grave, so the existing rule is unchanged.

**`src/game/__tests__/witness.test.ts`** (changed)

92. Moving a boss's chunk moves the witness.
93. Moving a set piece's budget moves the witness.
94. The witness partition names every new nested field of `RunState` as folded or deliberately excluded.

**`src/game/__tests__/invariants.test.ts`** (changed)

95. A boss chunk index that decreases raises a fault.
96. A set piece budget below zero raises a fault.
97. A corpse spawn refused at the cap raises a recoverable fault.

**`src/game/__tests__/step.test.ts`** (changed)

98. The tick runs the belch before every overlap pass, guarded through the boss and set-piece additions (`step.ts:195-198`'s stated rule).
99. A boss's shots and a mob's shots share the one pool and the one cull.

**`src/dev/readings/__tests__/sectionTimeline.test.ts`** (new)

100. The reading reports one span per phase, in order, with its tick bounds.
101. A tape that ends mid-section reports the live section's span as open, never as closed at the last tick (ADR 0026).

**`src/dev/__tests__/bot.test.ts`** (changed)

102. The phase order crossed on every seed is the seven-phase order.
103. A maxed-levels loadout reaches victory on at least one seed.
104. A hit-taking policy reaches sealed on at least one seed, through the whole ladder.

**`src/app/screens/game/__tests__/`** (new and changed)

105. The background renderer attaches into `ground` and adds no layer name.
106. Across a boundary, both dressing families are drawn during the drift window and only the incoming one after it.
107. Each boss draws in its own palette pair and the chunk flash is visible on the body.
108. The music cue is issued on every phase change and is a no-op on an unchanged alias, so seven phases naming three aliases produce two audible changes.
109. The corpse and treasure sprite pools are `CORPSE_CAP` long after the cap moves (`FieldRenderer.ts:154-155`).

### Invariants and the architecture fence

**`src/__tests__/lineAgnosticPolicies.test.ts`** (extended; step 1 creates it)

110. No boss module and no set piece module names a weapon line: `src/game/bosses/*.ts` and `src/game/stage/setPiece.ts` contain no string literal equal to any member of `WEAPON_LINES`. The standing extensibility constraint (`path-draft.md:21`) made mechanical.

**`src/__tests__/boundary.test.ts`** (existing, must stay green)

111. `src/game/stage/rows.ts` closes no cycle: `caps.ts` reaching it, and it reaching nothing in `src/game` by value, leaves the cycle guard (`boundary.test.ts:17-19`) green.
112. `src/game` still reaches only `src/game`, so `bosses/` and `setPiece.ts` pull nothing from `src/app` or `src/dev`.

**`src/app/__tests__/layering.test.ts`** (existing, must stay green)

113. `ADR_0014_STACK` (`:75-88`) and `LAYER_ORDER`'s length (`:143`) are unchanged, which is the proof the background added no layer.

**`src/app/__tests__/palette.test.ts`** (existing, must stay green)

114. The source scan over `DRAWS_DURING_A_RUN` (`:766-771`) passes over the two new renderers: no hex literal, no `blendMode` (`:781-788`).

### Added after the two review gates, 2026-09-08

These carry the next free numbers rather than being inserted into the lists above, so every slice reference in section 10 stays valid. Each one belongs to the file named over it.

**`src/game/stage/__tests__/stage.test.ts`** (spec)

115. *The Crowd ends on the eye opening and never on an empty field.* Pins ADR 0051's "there is no drain-out before the set piece" and ADR 0050's "a swarm set piece ends the second". The test holds the Crowd open while its rows are still firing and watches the phase turn on `setPieceOpened`.
116. *The Crowd's rows keep firing through the pour, at the section's own reduced share.* The other half of the same ruling: if the Crowd stopped, the set piece would arrive into silence, and the dormant eye would have no row to be placed from. The share is a data row and the test holds that it is non-zero and below the Crowd's authored rate, never the magnitude.

**`src/game/stage/__tests__/setPiece.test.ts`** (spec)

117. *The source outlives its own pour under the sharp hand.* The floor is a full build's storm damage per second times the pour's length, and the source's health is above it, so a committing grave never deletes the moment it is committing to. Pins ADR 0050's "the storm shreds the swarm" against ADR 0042's requirement that the property be two-sided: the dive has to pay more than waiting, and it cannot pay by cancelling the pour. Precedent in the design record's section 2: Gradius's ordinary Moai, vulnerable only while open, and Ikaruga's bunretsu, where a fast kill buys a longer payout. **Like test 44, it derives the storm floor from the lines' own rows and never pins 150**, for the same reason and against the same three rewritten modules; the pour's length comes from `SET_PIECE_BUDGET` and `SET_PIECE_POUR_TICKS` in `rows.ts`, so both sides of the comparison move when the data moves.
118. *The pour is denser than the Crowd's densest authored ten seconds.* The loudest beat in the run cannot arrive thinner than the section it interrupts. The test compares the pour's rate against `peakArrivals` over the Crowd's own tables and holds the relation, never either magnitude.

**`src/game/stage/__tests__/rows.test.ts`** (module)

119. Every phase declares both ceiling fields, with the Procession's template ceiling and the Vigil's body ceiling set and the Crowd's both null; no optional field anywhere.
120. No Drip row in the Procession carries the offer, so the run's first tell and its first offer are never the same body.
121. No boss's authored add cadence exceeds `BOSS_ADD_ALLOWANCE`, and no build holds more rungs than `RUNG_ALLOWANCE`, which is what makes the derived cap cover the inside of the Undertaker fight.

**`src/app/__tests__/palette.test.ts`** (fence)

122. Every staged sprite and tile the game draws is grayscale: no pixel with a saturation above zero anywhere under the stand-in asset folders. This is the one test in the suite that reads a texture, and it exists because the palette source scan cannot see one and a PixiJS tint cannot move a hue. It decodes through `pngjs`, added as a devDependency in the same slice.

### Added after the tech architecture gate, 2026-09-08

The same rule as the block above: next free numbers, no insertions, every existing slice reference still valid.

**`src/game/bosses/__tests__/chunks.test.ts`** (spec)

123. *A boss takes no bell pushback, while its adds are pushed normally.* The push half of ADR 0007's "so authored patterns never smear", split out of test 26. The same ring in the same tick moves the adds and does not move the boss, which is the whole of the sentence and is what a single combined test could pass without showing.

**`src/__tests__/lineAgnosticPolicies.test.ts`** (fence, extended)

124. No weapon line walks the mob pool: none of `storm.ts`, `bell.ts`, `territory.ts`, `wisps.ts` and `belch.ts` contains a read of `state.mobs`, and each reaches its targets through the seam. The mechanical form of the constraint that no line learns a boss or a set piece exists, read from the line's side; fence 110 reads it from the boss's side.

**`src/game/__tests__/stormTargets.test.ts`** (module, new)

125. The seam's list holds the mob pool, the boss and the set piece's source together, and drops each on the tick it stops being live, so a line that reaches every target reaches all three without naming any of them.

**`src/game/__tests__/mobFire.test.ts`** (module, changed)

126. A shot carries the fire kind its emitter authored, and a boss's shot landing on the grave is counted under its own hit source, so `DamageTaken.hits` separates a boss's pattern from a trash shot.

**`src/app/screens/game/__tests__/`** (module, changed)

127. The shot sprite draws the shot's own kind rather than a literal: a tear draws in `MOB_FIRE.tear`, a clod in `MOB_FIRE.clod`, a spiral in `MOB_FIRE.spiral`, and a trash shot is unchanged. The scatter at `mobFireSprite.ts:99` follows the same kind, so a cancelled boss shot comes apart in its own colour.

**`src/game/stage/__tests__/rows.test.ts`** (module)

128. The pour's budget, interval, health and sweep bounds, and the share the section under it keeps firing at, are rows in `rows.ts`, and `peakArrivals` reads them without importing `setPiece.ts`. The guard on the cycle the derivation would otherwise close, beside fence 111 which guards the direction.

**`src/app/__tests__/sound.test.ts`** (module, changed)

129. Nothing in the app parses an audio file's encoder header, and each loop's gapless points, where it has any, are data rows beside its alias. The deliberate-absence guard for the trim that is not built, because every engine the app runs on trims on decode.

**`src/game/stage/__tests__/stage.test.ts`** (module, changed)

130. `enterNextPhase` reads the phase's own columns and never switches on `PhaseName`: adding a phase whose columns are filled in needs no edit in that function.
131. Every member of `PhaseMusic` has an alias in `src/app`'s table and every alias is named by some phase, so three loops and six are the same edit and neither can half-land.

### Added after step 1's implementation gates, 2026-09-08

Step 1 landed (last code commit 8a7ecc5c31) and its tech architecture gate read this plan against the tree. Three corrections, same numbering rule as the blocks above.

**The carrier column is `carries: boolean`, not `carrying: readonly number[]`.** Step 1 put the flag on `StageRow` and the placement rule in `carriers.ts` (`carrierRow`, `carriesAt`), so a row says whether its mob carries and the module says which placement. The `rows.ts` seam above is corrected in place; every schedule this plan authors sets the flag per row and lets `carriers.ts` place it. `carriersScheduled()` must still meet `carriersForFullBuild()` across the new stage, and `carriers.test.ts:228` pins the count literally, so the slice that rewrites the schedule rewrites that pin with the cause written down.

**The bank needs an opening site that is not a take or a loss.** Step 1's `openBanked` (`offer.ts:256-260`) runs only from `resolveOffer` and `loseOffer`, so a bank held shut through a phase that does not permit it would never reopen once the phase ends: there is no offer to take or lose. This step adds the site and the column together, in the slice that lands the phase columns: a `Phase.bankOpens` boolean, and a per-tick check in `offer.ts` ("no offer live, bank above zero, phase permits: open one") called from `step.ts` beside `advanceLines`. Which phases set the column false is the question the step 1 plan gate deferred here (a boss phase, the sparse last row); the default is true everywhere, and a phase is set false only where the record names the reason, written beside the row. The harness at step 3 reads take-by-slot on banked offers, so the value is a data row and not a ruling.

**Supply must not vanish at a cap.** Step 1's `standOffer` with every body refused (`offer.ts:178`) returns no event, no fault and no bank increment, and `spawnDueRows` drops `spawnMob`'s null, so a refused carrier is never `carrierLost`. Both are unreachable today and reachable the moment slice 5's corpse cap refuses. Slice 5 therefore lands: a refused carrier spawn raises `carrierLost` with its reason; an offer whose bodies are all refused banks rather than disappears, opening through the site above; and a recoverable fault identity for each, with its wire code, beside the corpse-refusal identity that slice already carries.

**`src/game/stage/__tests__/rows.test.ts`** (module, changed)

132. A row carries or does not, and `carriers.ts` alone says which placement of a carrying row holds the offer.

**`src/game/__tests__/offer.test.ts`** (spec, extended)

133. A banked offer opens on the first tick with no offer live in a phase that permits it, and stays banked through a phase that does not, then opens on the first permitting tick after; ADR 0048's "missed is missed" still holds because the bank only ever holds offers a carrier's death already paid.
134. An offer whose three bodies are all refused at the corpse cap is banked, not lost, and a fault with its own identity records the refusal.

**`src/game/stage/__tests__/stage.test.ts`** (module, changed)

135. A carrier the mob cap refuses to spawn is announced as `carrierLost` with the cap as its reason, so the carrier ledger's taken plus lost plus live still accounts for every scheduled carrier.

**Counts: 67 spec tests, 61 module tests, 7 fence and cross-cutting guards. 135 in all.**

---

## 7. Constants changed, with every reader

Each list is the full grep across `src` and `scripts`, excluding `src/prototypes/` (the prototype boundary, ADR 0010).

**`DRAIN_OUT_SECONDS` (`stage.ts:68`): deleted.**
Readers: `stage.ts:190`; `stage.ts:255`; `src/game/stage/__tests__/stage.test.ts:23,92,94,98,107`.

**`phaseLengthTicks` (`stage.ts:187`): deleted, replaced by `phaseEnded` (with `phaseSpent` surviving as its module-private helper).**
Readers: `stage.ts:245,253`; `src/game/stage/__tests__/stage.test.ts:25,93,96,97,101,106,170,186,218`; `src/dev/__tests__/bot.test.ts:29,202,203`.

**`RAMP_ROWS` (`stage.ts:95`): renamed `PROCESSION_ROWS` and re-authored, and it moves to `rows.ts`.**
Readers: `stage.ts:166,256`; `src/game/stage/__tests__/stage.test.ts:26,94,113,125,154`; `src/dev/__tests__/bot.test.ts:30,206,212,562`; `src/game/__tests__/carriers.test.ts:26,30,43`; and **twelve test files that import it only to silence spawns with `run.stage.firedRows = RAMP_ROWS.length`**: `src/game/__tests__/corpses.test.ts:30,47`; `src/game/__tests__/mobs.test.ts:41,66`; `src/game/__tests__/belch.test.ts:15,25`; `src/game/lines/__tests__/bell.test.ts:18,37`; `src/game/__tests__/storm.test.ts:21,31`; `src/game/__tests__/mobFire.test.ts:38,57`; `src/game/__tests__/caps.test.ts:16,20`; `src/game/__tests__/step.test.ts:17,191`; `src/game/__tests__/offer.test.ts:28,40`; `src/game/lines/__tests__/skullStream.test.ts:18,36`; `src/game/lines/__tests__/wisps.test.ts:14,31`; `src/app/screens/game/__tests__/StormRenderer.test.ts:17,30`. Fifteen test files import it in all, which is the count verification step 5 names.

That blast radius is why verification step 5 (the test-name diff) is mandatory on the slice that renames it. The `firedRows = ROWS.length` idiom is a test reaching into stage state to stop spawns; it is a smell and it is not this step's to fix. **Unowned, with a trigger:** #59, the ticket that brings the existing tree up to the rules.

**`BACK_HALF_ROWS` (`stage.ts:127`): replaced by `CROWD_ROWS` and `VIGIL_ROWS`, and it moves to `rows.ts`.**
Readers: `stage.ts:76` (a comment), `stage.ts:168,257`; `src/game/stage/__tests__/stage.test.ts:22,98,125,136,154`; `src/dev/__tests__/bot.test.ts:27,206,212,218`; `src/game/__tests__/carriers.test.ts:26,30`.

**`PHASES` (`stage.ts:165`): five entries become seven, and each gains `ends`, `directed`, `music`, `liveTemplateCeiling` and `liveBodyCeiling`.**
Readers: `stage.ts:228,242,243,258`; `src/game/stage/__tests__/stage.test.ts` (throughout, via its `phase()` helper); `src/dev/__tests__/bot.test.ts:28,202,203`.

**`PhaseName` (`stage.ts:12`): `'ramp' | 'banshee' | 'backHalf' | 'undertaker' | 'over'` becomes `'procession' | 'banshee' | 'crowd' | 'waking' | 'vigil' | 'undertaker' | 'over'`.**
Readers in production: `stage.ts:150,260`; `src/game/events.ts:7,312`. In tests: `src/game/stage/__tests__/stage.test.ts`; `src/dev/__tests__/bot.test.ts:224-227` (its `phaseOrder` helper) and `:301,303,466,470,471`, which name the phases as literals. The prototype's own `PhaseName` (`src/prototypes/ugly-slice/game/types.ts:88`) is a name collision and not a reader (ADR 0010).

**`CORPSE_CAP` (`caps.ts:31`): 200 becomes a derived value, initially 232.**
Readers: `caps.ts:110`; `src/game/corpses.ts:5,108`; `src/game/invariants.ts:7,394`; **`src/app/screens/game/FieldRenderer.ts:3,154,155`**; `src/game/__tests__/corpses.test.ts:9,363,374,381`; `src/game/__tests__/run.test.ts:9,37`; `src/game/__tests__/caps.test.ts:9,102,106,122,128`; `src/app/screens/game/__tests__/FieldRenderer.test.ts:9,89,100,348`.

`FieldRenderer.ts:154-155` is the reader this list exists for: `CORPSE_CAP` is also the sprite pool length in **two** layers, so raising it from 200 to 232 allocates 64 more `Graphics` objects at screen construction, not 32. That is the same shape as the defect the playbook's rule 2 was written for. The cost is named and accepted: a pooled sprite that is never made visible costs allocation and nothing per frame, and the alternative, letting the sprite pool and the entity pool disagree, is a class of bug this renderer has already shipped once.

**`oldestEvictable` (`corpses.ts:145`): deleted.**
Readers: `corpses.ts:167`.

**`corpseEvicted` (`events.ts:165`): deleted with the path that produced it.**
Readers: `corpses.ts:170`; `events.ts:166,347`; `src/game/__tests__/caps.test.ts:111,142`; `src/app/__tests__/sound.test.ts:38`. It carries no wire code, so no format version moves.

**`WITNESS_VERSION` (`witness.ts:38`, 5 today, where step 1 left it): moves once to 6, in the first behaviour-changing slice of this step.**
Readers: `witness.ts:337`; `src/tape/playback.ts:8,121,167,266`; `src/app/tapeHeader.ts:6,81`; `scripts/record-conditioned.ts:24,147`; and the test sites across `src/tape/__tests__/`, `src/dev/__tests__/`, `src/app/__tests__/`, `src/app/screens/__tests__/` and `scripts/__tests__/`, all of which read it symbolically rather than pinning a number, so none needs editing. Step 1's plan established that; re-verify it holds after step 1 lands.

**`FAULT_IDENTITIES` (`faults.ts:18-34`): three appended, after step 1's three.**
Readers: `faults.ts:37`, the severity table below it, `src/game/invariants.ts`, `src/tape/wireCodes.ts`'s `FAULT_IDENTITY_CODES`, and the codec tests. Append-only by the wire rule (`wireCodes.ts:30-37`).

**`Shot.emitter` (`mobFire.ts:70`) and `MobFired.emitter` (`events.ts:146`): `MobType` becomes `MobType | BossKind`, and both gain a `kind` beside it.**
Readers of the emitter: `mobFire.ts:82,141,147`; `step.ts:54` (which hands it to `hitGrave`); `grave.ts:28`'s `GraveHitSource`; `src/game/__tests__/mobFire.test.ts`; `src/app/__tests__/sound.test.ts`. Readers of the new kind: `mobFireSprite.ts:57` and `:99`, and nothing else, because the kind exists for the draw.

**`GraveHitSource` (`grave.ts:28`): `MobType | 'contact'` becomes `MobType | BossKind | 'contact'`.**
Readers: `grave.ts`'s `hitGrave` and the `graveHit` payload; `src/dev/readings/damageTaken.ts:20`, where it keys `hits` and therefore adds two rows to the reading; the reading's tests. It is a widened union and not a renamed one, so every existing row and every existing count stands.

**`MOB_FIRE` and `FireEmitter` (`palette.ts:256,270-290`): unchanged, and three of the four sprites gain their first consumer.**
Readers today: `mobFireSprite.ts:57,99`, both hard-coded to `MOB_FIRE.trash`; `src/app/__tests__/palette.test.ts`. After: the same two sites, keyed by the shot's kind. No entry moves and no colour is measured again, because `tear`, `clod` and `spiral` were declared for exactly this and have been waiting for a boss.

**The five walks over `state.mobs` in the weapon lines: retired in favour of the seam.**
Sites: `storm.ts:44` (`mobUnder`), `bell.ts:256` (`sweepToll`), `territory.ts:351` (`eligiblePoints`), `wisps.ts:99` (`targetOf`), `belch.ts:56` (`burstNearbyMobs`). `wisps.ts:106` (`committedTo`) walks the wisp pool and not the mob pool, so it stands. Every other walk over `state.mobs` in the tree is outside `src/game/lines/` and outside `belch.ts` and is untouched: `step.ts`, `mobs.ts`, `invariants.ts`, `witness.ts`, `timeToKill.ts:205` and `replayTallies.ts` all keep theirs, and the last two keep them on purpose (section 4's fire-kind block). Fence 124 is what holds the retirement.

**`FORMAT_VERSION` (`wireCodes.ts:28`): unchanged at 2, deliberately.** The deliberate absence is guarded by verification step 10.

**`TICK_HZ` (`clock.ts:4`), `SCROLL_SPEED` (`tuning.ts:27`), `FRESHNESS_SECONDS` (`tuning.ts:37`), `MOB_CAP` (`caps.ts:29`), `FEAST_PAYOUT` (`tuning.ts:102`), `RESERVOIR_CAPACITY` (`tuning.ts:109`), `SIZE_FLOOR` (`tuning.ts:66`), `SIZE_CEILING` (`tuning.ts:53`): all unchanged, all newly read.** `FRESHNESS_SECONDS` and `MOB_CAP` become inputs to the corpse cap's derivation; `FEAST_PAYOUT` and `RESERVOIR_CAPACITY` become the Banshee's; `SIZE_FLOOR` and `SIZE_CEILING` bound the gap rule's test. None of their values move, and a new reader of an unchanged constant is listed here so the next plan that does move one finds the list already complete.

---

## 8. Craft calls, each backed by evidence

The full argument for each is in `stage-floor.md`; what is here is the call, its evidence in one line, and its initial rows.

**The three section names are the Procession, the Crowd and the Vigil.** The Crowd is the research record's own word for that moment of play (`docs/research/section-feel-consent-and-rung-restore.md` section 1) and it stands. The record's other two do not: "lane" is already the File's single-file lane and the skull stream's "my lane" (`game-concept.md:52`, `game-concept.md:34`), and "descent" is the mob motion word in the same paragraph and in the code (`GHOUL_DESCENT_FLOOR`, `mobs.ts:153`), so two of three collided with words in use. The Procession is the funeral filing past in single file, and the Vigil is the watch kept before the gravedigger arrives; both are the moment of play the record already describes. A grep of `apps/hungry-grave/src`, `CONTEXT.md` and `scripts` finds neither new word in use. `CONTEXT.md:121` defines Section and names none, which is what the glossary slice adds.

**The clock: 2:00, 0:45, 2:35, 0:45, 1:15, 1:40.** Nine minutes nominal, Ikaruga's short-longest-short (`game-concept.md:46`, ADR 0050). The Banshee's forty-five seconds is DoDonPachi's stage-one boss at 0:45 (`docs/research/shmup-stage-design.md` section 1); the Undertaker's hundred seconds is Cave's stage-ending size, one minute to one thirty-five for stage 3 to 6 bosses (ADR 0052). All initial rows.

**A section ends on a condition, not a clock, and the condition is a column on the phase.** Rows spent and no live mob for the Procession and the Vigil; the eye opening for the Crowd, which must hand the set piece a field with trash on it and must have a row left to place the dormant source from (ADR 0051, ADR 0050). ADR 0051's own sentence made literal, and it terminates by construction because every type descends: the ghoul carries a hard descent floor at `mobs.ts:153`, and the slowest total descent is 1.35 times `SCROLL_SPEED` (`tuning.ts:27`, `mobs.ts:96`), about 890 ticks to cross the field, which matches the 14.98 to 15.47 seconds `stage.ts:54-56` measured for the old drain-out.

**The set piece's property: the trail pays a grave that commits to it far more than one that waits at the bottom edge, and neither way is death.** Two-sided on the Wall's own pattern (ADR 0042), carried by two bot policies, measured in corpses and never in hits. From `docs/research/set-piece-and-final-boss-chunk.md` section 2, option C: "A grave that commits to the trail swallows the bulk of it before freshness runs out; one that stays low and lets the scroll deliver gets scraps."

**The set piece's two open rules.** Parking under the mouth gets no special rule and the source gets no hitbox against the grave, because danger and opportunity in the same place is the project's central bet (`VISION.md:21`). The trail stays inside the field's middle three fifths, initial rows x 108 to 432 of 540 (`field.ts:10`), so the trail is a curve the dive can follow rather than corpses in a gutter against the edge walk-in (`mobs.ts:297-307`).

**The set piece's budget: 75 bodies, one every 12 ticks, the source drifting at half the scroll, 2400 points of health, and no hitbox at all while dormant.** It ends on a condition and never a timer, which is the industry standard and the one thing the research found no shipped number for at all (research record, claim 1 and Open items). The pour's 5.0 bodies a second is above the Crowd's densest authored 3.6, so the loudest beat does not arrive thinner than the section it interrupts, and the health is above a full build's 150 points a second across the fifteen-second pour, so a fast kill ends the source's stay rather than its pour. The shape is Gradius's ordinary Moai, vulnerable only while open, and the payout reading is Ikaruga's bunretsu. All initial rows, arithmetic in the design record's section 2.

**Every chunk survives one full emit under the sharp hand.** `CHUNK_HP` is derived rather than picked: the floor is a full build's 150 points a second times one emit's length, five seconds at the longest, which is 750, and the initial rows sit above it at 1700 a chunk for the Undertaker and 1100 for the Banshee, sized from ADR 0052's length band at an initial one-third effective share against a boss. Otherwise the best player in the game is the one who never sees the pattern the chunk was written for, and the dose of hell is deleted by playing well. Arithmetic in the design record's section 4. **The 150 is the derivation and never the test.** It was read off `skullStream.ts`, `bell.ts` and `belch.ts` while step 1 was rewriting all three, so tests 44 and 117 recompute it from the lines' own exported rows at maxed levels rather than pinning it; a pinned figure would keep passing after the weapons moved, which is the one failure mode a property test of this shape has.

**Each section's property is a gate on the director's spend, held by a row on the phase.** A live-template ceiling of one on the Procession and a live-body ceiling of four on the Vigil, both initial. The director at step 4 fills exactly what those two sections own, and ADR 0047's off-limits list covers the set piece, the Wall, the sparse rows and the boss chunks but not the body of a section. The precedent is Vampire Survivors' per-minute enemy minimum dropping from 30 to 10 on the guaranteed Flower Wall minutes (`docs/research/set-piece-and-final-boss-chunk.md` section 2). It is a permission the director reads and never an invariant over the field: the Procession's rows stand about nine seconds apart against a roughly fifteen-second unkilled descent, so an authored ceiling written as a law would fire at a player who kills slowly, in their own build, under ADR 0023. The three property tests therefore state their killing policy, which is section 4's own correction between the two gates.

**The Vigil's scarcity is food per second, not corpses per second.** A revenant corpse pays double (`mobs.ts:94`) for 64 health against 40 (`mobs.ts:93`, `mobs.ts:76`), so a corpses-per-second test passes while the section feeds better than the one before it. Growth paid per second is the honest quantity: an initial 1.8 units a second for the Crowd against 0.96 for the Vigil, and the comparison is against the Crowd rather than the Procession, which owns emptiness rather than a feeding rate.

**The Undertaker's third chunk is the locked overlap, placed last, with Yuyuko's trade attached.** Decision 26 and the research's recommendation. The chunk-three curtain carries about two thirds of chunk one's clod count, because the shipped precedent buys simultaneity by cutting density and doing the same protects the never-a-wall rule and the gap rule. Initial row.

**Boss patterns complete uncancelled, and that is the baseline.** The belch fires only at a full reservoir (`belch.ts:82`) and capacity is one whole feast (`tuning.ts:109`), so the diggers and the chunk-break feasts buy at most one or two belches across ninety to a hundred and twenty seconds, against many more pattern cycles. Every chunk is therefore authored survivable uncancelled and the belch is a relief valve. `game-concept.md:104` already lists "whether a pattern chunk ever ends before finishing one full emit" as an instrument, so the assumption has a watcher.

**Victory fires on the Undertaker's death.** `game-concept.md:70`: "His death is the ending: he topples into the grave and the swallow is the victory animation, no payout." The topple is the renderer's animation over a run that has already ended, because gating the ending on a dive would leave a player who never dives with a running run and nothing to play.

**The carrier schedule: eight, eleven, six.** Twenty-five against nineteen for a full build (step 1's derivation and its `CARRIER_SLACK` of 1.3). Front-loaded so a clean player is at full power for the Waking, which is decision 10's own condition and ADR 0049's "every shipped shmup on record puts its power ceiling in the first stage or two." The Vigil's six are the slack ADR 0048 requires. Initial rows.

**In the Procession the carriers stand on File and V rows and never on a Drip.** Initial: thirteen rows, eight of them carrying, four Drips that do not, and the sparse row last. The one that matters is the lone revenant Drip that teaches the tell: it does not carry, so the run's first tell and its first offer are two different moments rather than one body doing both jobs, and the first shambler Drip does not carry either because the first kill of the run teaches the swallow.

**The corpse cap is `MOB_CAP + peakArrivals(FRESHNESS_SECONDS) + TREASURE_ALLOWANCE`, initially 232.** A proof rather than an estimate: every decaying corpse alive came from a body alive when the ten-second freshness window opened or from one that arrived inside it, and treasure is bounded at three offer bodies plus the feasts a fight has shed. Peak arrivals counts four terms and not two: the section tables, the pour, boss-summoned adds and stripped rung bodies (ADR 0055). The maximum falls on the Waking, 50 poured plus the Crowd's reduced 12, which is 62; the Undertaker's window is 7 diggers plus 19 rungs, 26, well inside it. Without the last two terms the query never looks inside a boss fight, which is the one place a refused corpse is food taken from the player at the climax. `TREASURE_ALLOWANCE` is an initial row of 10. The director's budget is the missing addend and it is step 4's.

**Three music loops, one per section, with the two changes at the two boundary events.** `bells-of-death` from the first tick to the Banshee's death, `seek-n-slaughter` from there to the eye opening, `a-hollow-call` from there to the end, mapped in the design record's section 7. Three rather than six because decision 22's amendment ruled two changes and named where they fall, and six would give the two bosses and the set piece themes of their own, which is the one place this step would dress past the line decision 1 drew. The per-phase row stays, so six is three strings in a data table if Mark's ear asks for it, and Iuchi's argument for six is written up beside the table with the loops chosen so each still sits under its own boss (`docs/research/stage-length-with-a-director.md` section 4). Re-encoded to 96 kbps mono under pre-authorization item 9, in their own `music` bundle rather than `main`, because `engine/navigation/navigation.ts:156-158` makes every screen wait on its declared bundles and `main` is declared by all seven app screens.

**The loop gap is measured first, and nothing is built for it until the measurement says so.** `handoff.md:37` names mp3 loop gaps and the LAME headers the encoder wrote, and an earlier draft of this plan turned that into an in-app header parse: decode the file, read the encoder's delay and padding, slice the buffer by them. That premise is stale. Firefox has trimmed on decode since 83 (Bugzilla 1566389), Chrome and WebKit both do the same (WebKit 223519), so the buffer the app gets back is already trimmed and the parse would be a decoder shipped inside a game to work around a browser bug that no longer exists. Verification step 13 runs before the music slice and reports the three loops' real wrap. If a gap survives anyway, the answer is `start` and `end` in seconds as data rows beside that loop's alias, which `@pixi/sound` 6 already maps to the source node's `loopStart` and `loopEnd` (`WebAudioInstance.mjs:172-175`), and which is three numbers rather than a parser. Module test 129 guards the absence either way.

**The background is one tiled ground plus a per-section dressing set, drawn into the existing `ground` layer.** The layer exists and has no consumer (`layering.ts:17`), it is already masked to the field (`GameScreen.ts:171-173`), and using it rather than adding a name keeps ADR 0014's stack literal (`layering.test.ts:75-88`) untouched. The sets are named in the design record's section 7, from `assets-staging/crawling-depths/`.

**The boundary is a drift and not a cut.** Decision 22's amendment takes Einhänder's answer: at a boundary the outgoing dressing stops being placed and the incoming starts, and both are on screen until the last of the old leaves the bottom edge. No card, no fade, no cut.

**Every imported sprite and tile is desaturated to grayscale on import, and coloured only through tint.** The staged pixel art is violet-blue, measured rather than eyeballed: the tileset's median hue is 234, the statues 252, the Waking sprite 234, the Vigil's floating rocks 265 at 0.59 saturation. A PixiJS tint multiplies and cannot move a hue, and the palette suite's source scan reads modules for hex literals (`palette.test.ts:781-788`) and cannot see a PNG at all, so the purple ban would be unguarded on exactly the assets it was written for. Desaturating at import (ImageMagick `-colorspace Gray`, or ffmpeg's `hue=s=0`; both installed) makes the existing ceiling, hue-exclusion and brown tests binding on the stand-in art for free. Fence test 122 is the guard.

**The Waking's source takes the Crowd's colour family, hue about 165, not the Vigil's hue 190.** It is placed by a Crowd row and it opens as the Crowd's boundary event, so it belongs to that section; giving it the fourth colour would spend Downwell's one addition a section early, and the addition has to be the event. What that costs is a source in the same family as the Crowd's own eye dressing, and the stand-in answer to which eye will wake is size: three times the dressing eyes' footprint, initial row, marked stand-in. A slow blink was the alternative and needs frames the staged pack does not carry.

**The tint departure is deep teal-cyan, hue about 190.** `docs/research/readability-value-band.md` section 7.5, quoted in #38's second comment, records hue 175 to 205 as entirely empty, and it still is: the nearest occupants are `wisp` at 172.24 and `skull` at 208.24 (`palette.ts:140,71`), leaving 190 eighteen degrees clear of each against a fifteen-degree sprite-separation minimum. It is not brown, it is not purple, and it clears the fire exclusion by a wide margin. Spent once, in one section, which is Downwell's move (research record claims 1 and 2). Five new palette entries, each measured in tree under this repo's own `color.ts` before it is written down, never carried from this plan.

**The two bosses are vector silhouettes, not pixel art.** `palette.ts:57-60` already declares `banshee`, `bansheeDark`, `undertaker` and `undertakerDark`, so the palette anticipated them, and the construction is the one the three mob types already use: a body plus a near-black companion, which is ADR 0014's answer to 62 of 66 pairs measuring Lc 0.00 at the top of the value budget. That confines pixel art and the smoothing question to the ground layer.

**Nearest-neighbour is set per texture, not globally.** No scale mode exists anywhere in the app today. A global default would soften nothing useful and would harden the edges of the existing UI art at `raw-assets/main{m}/ui{tps}/`, which is not pixel art.

**The stand-ins are tagged.** Their own bundle and folder names, and a stand-in prefix on the palette entries and the background module, so a report can say which build drew stand-ins and a tester's reaction to the look is separable from a reaction to the game. Decision 13 asks for it and #38's closing comment repeats it; the tape header already carries the commit hash, so the join is free.

---

## 9. Anything that would be a new commitment rather than a craft call

The push's pre-authorization is explicit that turning a craft call into a rule change or a new ADR-level commitment Mark did not make is never authorized (`pre-authorizations.md`, "Not authorized, ever"), and those go in a design record with a note while the ADR waits. Each item below is one sentence plus the assumption the plan runs under.

1. **Naming the three sections adds three words to the project's vocabulary, and two of them are minted here rather than inherited.** The research record's Crowd stands; its Lane and Descent collide with the File's lane, the skull stream's "my lane" and the mob motion word, so the first and last sections become the Procession and the Vigil. Assumption: the plan adds all three to `CONTEXT.md` under the existing Section entry (`CONTEXT.md:121`) and adds the Waking beside the Wall (`CONTEXT.md:129`), and files no ADR, because ADR 0050 already rules that there are three sections and what bounds them and decision 25 is Mark's own naming of the set piece.

2. **Ending a phase on a condition rather than on a clock is a change to how the stage machine works, not only to its data.** Assumption: it is ADR 0051's own sentence implemented literally and needs no new ruling; if the reviewer reads it as a ruling, the alternative is a clock derived from the sparse row's fall time, which is one function's worth of change.

3. **The set piece's health row makes killing the source end its stay rather than its pour.** `game-concept.md:50` says "it is shootable, so killing it ends the moment early," and a health row sized above a full build's damage across the pour means the pour always finishes. Assumption: the sentence describes the shootable answer rather than ruling that a fast hand may cut the moment short, and the shipped precedent it came from says the same (`docs/research/set-piece-and-final-boss-chunk.md` section 2: killing the mouth "shortens the moment instead of skipping it"). Without the row the loudest beat in the run is deleted by the exact play the property rewards. If the reviewer reads that sentence as the ruling, the health row drops below the pour's damage and the property changes with it, which is one data row.

4. **A section's property becomes a ceiling row the director must respect before it spends.** Assumption: ADR 0047 already bounds the director by an authored floor and four off-limits moments, and none of the four is the body of a section, so a section that owns a property has to say what that property costs the director; the rows are data, and step 4 reads them rather than re-authoring them. What is deliberately not claimed, after the tech architecture gate: they are not an invariant over the field. The authored rows can exceed them under a slow hand and nothing faults, because ADR 0023 puts every invariant in the player's own build and a check a player can trip is a defect reported against the player. If the reviewer reads a ceiling as a second ruling on the director, the rows are declared and unread until #85.

5. **`Phase.music` names a loop rather than a file.** An earlier draft put the asset alias itself on the phase, as a bare `string`. Assumption: the section's music is authored data and belongs on the phase (ADR 0049), while a filename is `src/app`'s business like every other filename, so the phase carries a closed union of three loop names and `src/app` maps them. That also makes the mapping checkable in both directions, which a string was not. If the reviewer wants the whole fact in one place, the union and the table collapse into one file either way round, in one edit.

6. **Retiring `corpseEvicted` removes an event other things could have read.** Assumption: ADR 0056's "never evicts food" makes the producer unreachable, an unreachable branch is worse than an absent one, and the event carries no wire code so nothing recorded is lost.

7. **Widening `MobFired.emitter` to include a boss changes an event payload's type, and it reaches further than the payload.** Assumption: boss patterns are mob fire by the glossary's own definition (`CONTEXT.md:103`: "Every hostile shot on the field, trash shots and boss patterns alike"), so the payload was already meant to carry them. What the widening reaches is `GraveHitSource` (`grave.ts:28`) through `step.ts:54`, and `DamageTaken.hits` through that, which gains two rows and loses none. The assumption there is that who hurt the player is a question a boss is allowed to be the answer to, which #48 wrote the field for.

8. **Three music loops rather than six, with the two changes on the two boundary events.** Assumption: decision 22's amendment ruled two changes and named where they fall, so three is the ruling and six would be dressing past decision 1's line. The cost is that a boss inherits its section's loop, which is the specific mistake Iuchi names, so the three are chosen to sit under their own bosses and the argument for six is written up in the design record's section 7. If Mark's ear asks for six, it is three strings in a data table.

9. **The Vigil's scarcity is authored as less food per second rather than as smaller payouts**, because `game-concept.md:48`'s "kills pay less food" is false against `mobs.ts:94`. Assumption: the property Mark chose is what stands and the mechanism named beside it was wrong, so the code follows the property, measured as growth paid per second rather than as corpses per second, which would pass while the section fed better. The correction `game-concept.md:48` wants when the record is next touched is one phrase, "the section pays less food per minute", and it belongs to #86's sweep rather than to this dispatch.

10. **Folding ticket #81 in was considered and declined.** Assumption: the Waking's pour carries its own narrow no-stack rule, #81's general mechanism changes every mob's motion and therefore every reading in the tree, and its trigger is the rendered check at verification step 11. If Mark wants #81 inside this step, it is a slice of its own placed last so its `GOLDEN` move is isolated.

11. **A shot carries a fire kind of its own, beside who fired it.** The widened emitter alone would have shipped every boss pattern in the game drawn in the trash body colour, because `mobFireSprite.ts:57` and `:99` name `MOB_FIRE.trash` as a literal. Assumption: who fired and what it looks like are two questions, the Banshee's rings and her adds' shots share an emitter and not a read, and `palette.ts:256` declaring `tear`, `clod` and `spiral` before any boss existed is the palette having already answered this. If the reviewer reads the emitter as sufficient, the renderer keys on it instead and the two boss kinds collapse to one read each.

12. **The storm reaches a boss through one seam rather than through five widened walks.** Assumption: a weapon line learning that a boss exists is the thing `path-draft.md:21` forbids, and five copies of the same branch is how it would learn. What the seam commits to is that damage, push and the kill rule are asked of the target rather than decided by the line, which is a change to how every line is written even though no line's behaviour moves. If the reviewer prefers the boss in the mob pool instead, that is a different and larger commitment: it puts a boss under `MOB_CAP`, under `cullMobs`, and under every reading that counts mobs.

---

## 10. Slices

Each slice is one commit: its tests, its minimal implementation, and its `GOLDEN` regeneration when it changes behaviour. Each ends green on `pnpm typecheck` and `pnpm vitest run` before the next begins. CodeRabbit CLI runs before each code commit, per the branch's standing rule. The test-name diff (verification step 5) runs on every slice.

**Slice 0. Baselines.** Before any edit, record two tapes at step 1's tip with `record-conditioned.ts` and save them outside the repo; capture `vitest list --json`. Inputs to verification steps 5 and 10. No commit.

**Slice 1. `rows.ts`, extraction only.** The three tables move out of `stage.ts` under their old content and new names, `peakArrivals` lands, `caps.ts` does not read it yet. Behaviour does not change and `GOLDEN` must not move; if it moves, the slice is wrong. The fifteen test files that import `RAMP_ROWS` are updated here, in one commit, so the rename is one reviewable diff. Module tests 67 to 71 and fence 111 land here.

**Slice 2. The three sections, re-authored.** Seven phases, the three section tables at their new lengths, the one-property-per-section authoring, `PhaseName`, `Phase.ends`, `Phase.boss`, `Phase.directed`, `Phase.music` as the closed `PhaseMusic` union, `StageRow.directed`, and the two ceiling rows. `BossKind` is declared in `rows.ts` here, four slices before any boss module exists, because the phase column that names a boss is authored here. `enterNextPhase` stops testing `phase.name` and reads the columns. The Procession's carrier-free Drips are authored here even though the schedule lands in slice 4, because which rows may carry is a property of the table. `Phase.bankOpens` and the per-tick opening site in `offer.ts` land here too, because this is the slice that lands the phase columns and a bank held shut by a column that does not exist yet is a column nobody obeys. `GOLDEN` moves and the bot test's phase order moves. Spec tests 1, 2, 4 to 6, 8, 14, 55 to 57, 133 and module tests 63, 64, 66, 119, 130 land here.

**Spec tests 3 and 7 are not in this slice, and the earlier draft put them here.** Test 3 holds a full run inside eight to ten minutes and test 7 holds that a section ends on a boundary event rather than on an absolute clock, and neither can be green until a boss phase is a real fight: with both bosses stubbed, a run has no length worth measuring and every boundary is still effectively a clock. Test 7 lands at slice 7, the first slice with a real boss phase, and test 3 at slice 10, the first slice in which the whole stage is traversable end to end.

**Slice 2 also adds the glossary entries.** `CONTEXT.md` gains the Procession, the Crowd and the Vigil under the existing Section entry (`CONTEXT.md:121`) and the Waking beside the Wall (`CONTEXT.md:129`), in the same commit as the names enter the code so the two never disagree. No ADR is filed: ADR 0050 rules that there are three sections and what bounds them, and decision 25 is Mark's naming of the set piece.

**Slice 3. The sparse row and the per-phase end condition.** `phaseEnded` replaces `phaseLengthTicks` and reads `Phase.ends`, with `phaseSpent` surviving as its private helper; `DRAIN_OUT_SECONDS` retires. The Crowd's end on the eye opening is authored here and asserted once the set piece exists in slice 10. Spec tests 9 to 13, 115, 116 and module tests 61, 62, 65 land here.

**Slice 4. The carrier schedule on the new rows.** Eight, eleven and six, on File and V rows in the Procession and never on a Drip. Spec tests 53, 54 and module tests 120, 132 and 69's re-check land here.

**Slice 5. The corpse cap.** Derived from all four peak-arrivals terms, never evicting, the refusal, the fault, the sprite pool following it. `corpseEvicted` and `oldestEvictable` retire here with the path that produced them, and the two supply refusals the step 1 gate block names land beside the corpse refusal: a carrier the mob cap refuses is announced as `carrierLost` with its reason, and an offer whose three bodies are all refused banks rather than disappears, each with its own recoverable fault identity and wire code. The pour's own rows and `POUR_SHARES` land in `rows.ts` here rather than with the set piece at slice 10, because this is the slice where `peakArrivals` first needs them and where putting them in `setPiece.ts` would close the import cycle section 4 describes. **The corpse-refusal fault identity and its wire code land here too, with the refusal that raises them**, not at slice 6 with the boss identities: a fault the code can raise while its identity does not exist yet is a fault that reports as unknown, and an earlier draft split them across the two slices. `WITNESS_VERSION` does **not** move here. Spec tests 49 to 52 and 134, and module tests 87 to 89, 97, 109, 121, 128, 135, land here.

**Slice 6. The boss machine, the target seam and the directed shot.** `bosses/chunks.ts`, `stormTargets.ts` with all five weapon lines moved onto it, `fireDirectedShot`, the widened emitter and the fire kind on `Shot` and `MobFired`, `GraveHitSource` and `DamageTaken.hits` following the widening, `RunState.boss`, the new events, the invariants and their fault identities and wire codes. Spec tests 23 to 28 and 123, and module tests 78 to 81, 90 to 96, 98, 99, 125, 126 and fence 124, land here. Spec test 123 is test 26's push half and lands beside it. Module test 97's fault is slice 5's and is not repeated.

**`WITNESS_VERSION` moves here and not again, and both new fields are declared and folded here.** `RunState.setPiece` is declared as null and folded in the same commit as `RunState.boss`, four slices before `setPiece.ts` exists, and module test 93 lands here rather than at slice 10. The earlier draft moved the version at slice 6 and widened the fold at slice 10, which is two fold shapes under one version number: a tape recorded in between would recompute a different witness and report a divergence instead of refusing, which is exactly the failure ADR 0019's version exists to prevent. Slice 10 fills the field and moves no version.

**Slice 7. The Banshee.** Two chunks, the ring emitter, the feast, the Wall clock on her death. Spec tests 7, 29 to 34 and module tests 82, 83 land here. Spec test 7 lands here because this is the first phase in the game that ends when something dies rather than when a clock runs out. The two Wall policies from ADR 0042 land here, which is the first time the Wall has been tested against its own property.

**Slice 8. The Undertaker.** Three chunks, the curtains, the spiral, the diggers, the gap rule, the locked overlap. Spec tests 35 to 44 and module tests 84 to 86 land here.

**Slice 9. Both endings, as code.** Victory on his death, the stub at `stage.ts:230-232` retired, the hit-taking policy. Spec tests 45 to 47 land here, each driven from a pinned phase rather than from a run. The endings' headless runs are slice 10's and not this slice's, because the Crowd ends on the eye opening (spec test 115) and no run reaches the Vigil before the source exists.

**Slice 10. The set piece.** `setPiece.ts` in full, reading its budget, interval, health and sweep bounds from `rows.ts`; the Crowd row that places the dormant source; the dormant immunity; the source taking its place in the seam's target list. `RunState.setPiece` is filled rather than declared, because slice 6 declared and folded it, and `WITNESS_VERSION` does not move. The two carrying policies land here. Spec tests 3, 15 to 22, 48, 117, 118 and module tests 72 to 77, 96, 102 to 104 land here, and spec tests 115 and 116 from slice 3 are asserted for the first time. **Verification steps 7 and 8, the headless runs to victory and to sealed shut, run here.** Everything in that list needs a run that crosses all seven phases, and this is the first slice that has one: the Crowd ends on the eye opening, so before the source exists there is no full run to time, to end, or to cross.

**Slice 11. The section timeline reading.** Module tests 100, 101 land here. Verification step 9 runs here, and its table goes in the report.

**Slices 12 and 13 are each two slices, and neither number moves.** Mark's rule of 2026-09-08 is one agent per slice, and as first written each of these two mixed a pipeline change with a renderer or a seam, which is two agents' work and one commit. They split as 12a, 12b, 13a, 13b so that every later slice reference in this plan stays valid.

**Slice 12a. The music bundle and the seam.** The `music` bundle in both assetpack configs, the three loops re-encoded and staged into `raw-assets/music{m}`, `Phase.music` filled in across all seven phases from the union slice 2 declared, the alias table in `src/app` resolving the three loop names to files, the music seam in `sound.ts`, and the caller in `main.ts`. No gap handling of any kind. Spec test 58 and module tests 108, 131 land here.

**Slice 12b. The loop gap, measured.** Verification step 13 runs here, on the three loops slice 12a staged, and its three rows go in the report. The expected result is that the browsers already trim and nothing is built. If a gap survives on any loop, that loop gains a `start` and an `end` in seconds as data rows beside its alias in the same commit. Module test 129 lands here either way, because it guards the absence of the header parse and not the presence of the rows. This is a slice with a measurement in it and possibly no production change at all, which is the point: the earlier draft folded the measurement into the build and would have shipped the workaround before knowing whether the problem exists.

**Slice 13a. The grayscale import, and the fence that holds it.** The import script at `apps/hungry-grave/scripts/grayscale-import.ts`, `pngjs` added as a devDependency, the staged sprites and tiles desaturated through it into `raw-assets`, and fence 122 reading the output. No palette entry and no renderer. It is first because the palette entries are meaningless against a violet texture, and it is its own commit because a pipeline step plus its fence is a whole piece of work with a whole verification.

**Slice 13b. The ground and the dressing.** The five palette entries measured in tree, the ground tiles, the three dressing sets, the drift window, nearest-neighbour per texture, and the Waking's source sprite in the Crowd's colour family at three times the dressing eyes' size. Spec tests 59, 60 and module tests 105, 106 and fences 113, 114 land here.

**Slice 14. The boss renderers and boss fire's own read.** Both bosses drawn, the chunk flash, and both `dressField` sites wired. `mobFireSprite.ts:57` and `:99` stop naming `MOB_FIRE.trash` and read the shot's own kind, so the tear, the clod and the spiral draw in the three sprites `palette.ts:270-290` has been carrying since before any boss existed. The sprite change is here rather than at slice 6 because slice 6 fires the shots and this is the slice that draws them; between the two, boss fire draws in the trash read, which is stated rather than a surprise. Module tests 107 and 127 land here. Verification step 11's boss shots run here.

**Slice 15. The fences.** Fence 110 extended onto `bosses/` and `setPiece.ts`, and the confirmation that 111 to 114, 122 and 124 are green. No production change; if a fence fails, the fix is a production change and it is a finding, not a fence edit.

**Slice 16. The full verification pass.** `pnpm verify` at the repo root, both headless endings in their full-run form, the section timeline table, the rendered check per section and per boss with the screenshots read, the grayscale check at target density, the old-tape decode check, and the report naming verification steps 16 to 22 as still open for Mark.

**Nineteen slices in all: 0 through 16, with 12 and 13 each in two halves. Eighteen commits, because slice 0 makes none.**
