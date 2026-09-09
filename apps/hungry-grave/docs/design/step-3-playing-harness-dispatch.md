# Dispatch plan: path step 3, the playing harness (ticket #98)

Planning half only, written per `docs/agents/feature-playbook.md`. No production code was written and no repo file was edited for this plan.

The design record it runs on is `playing-harness.md`. Every magnitude appears only as a data row marked initial. Section 12 of that record took two calls under their recommended default and this plan is written against both: the base policy belches, and the director's budget is pinned to the build so the format bump carries one field. The grave swallows and passes under; it never drives.

## 0. What this plan may claim, and what it cannot

Every claim about existing code below cites a file and a line. They were read in this worktree on 2026-09-09, at the branch tip, **while adjustment iteration 4 (#104) was mid-flight**: its edits were staged in the index and its two commits were not yet in the log when this was written.

**Three files are therefore cited by content and never by line**: `src/game/stage/setPiece.ts`, `src/game/events.ts` and `src/game/witness.ts`. Adjustment 4 adds a body-gone boolean to `SetPiece`, a `setPieceKilled` event, a narrowing of `SetPieceClosing`, and possibly a witness partition entry, so a line number inside any of the three is a number that moved under this document's feet. Where this plan names something in one of them it names the declaration, not the line.

Nothing this step builds is inside those three files. The claims that carry the work are in `src/dev/bot.ts`, `src/dev/measure.ts`, `src/dev/readings/`, `src/dev/replayTallies.ts`, `src/dev/compareRuns.ts`, `src/dev/seriesSummary.ts`, `src/game/rng.ts`, `src/game/run.ts`, `src/game/offer.ts`, `src/game/lines/roster.ts`, `src/tape/`, `src/app/tapeHeader.ts`, `scripts/`, `src/__tests__/boundary.test.ts` and `src/__tests__/lineAgnosticPolicies.test.ts`, none of which the adjustment touches.

**Every line number here goes stale the moment slice 1 lands.** A later slice locates its site by content, and a site it cannot find is a finding rather than something to skip (`docs/agents/lessons.md`, "a plan's line numbers go stale the moment its first phase lands").

**The record's own section 11 was re-checked against the tree and all six items hold.** `bot.ts:432-441` exports six policies. `dodgePolicy` (`bot.ts:221-223`) drifts toward `HOME` (`bot.ts:89`) through `bestDodge` (`bot.ts:226-228`) and never targets food, so the decision-17 sentence about the offer going into the existing dodge policy does describe a hand that never feeds. `record-conditioned.ts:165-170` is a fixed arithmetic wander and not a policy. `rng.test.ts:12` names four stream names where `StreamName` carries five (`rng.ts:4`); that gap is ticket #113 and **this plan owns closing it**, in the slice that adds the sixth name, which is what the handoff already says. No production module writes `inputDevice: 'bot'`: the two writers in the tree are `record-conditioned.ts:151` and `local/slice13b-record.ts:47`, both `script`, and the browser writes `keyboard` or `touch` (`tapeHeader.ts:103-105`).

**Two things this plan found that the record does not carry, both named again in section 8.** Part of the airborne-projectile figure #39 asks the report for is not readable off a headless tape today: mob fire on the field is sampled only at expensive-frame ticks (`replayTallies.ts:158`, `densityOf` at `:74-80`), and a headless batch tape carries no frame rows at all, so that half of the sample set is empty.

**Amended 2026-09-09, after the tech architecture gate:** the storm half was already there and this plan proposed to re-count it wrongly. The airborne figure is the storm, the player's own projectiles, and mob fire is never the storm (`CONTEXT.md:73`; `tracer-plan.md:39` makes the bot's peak storm the density ADR 0014's check runs at). `fieldPerLine` already counts each line's own live things every tick and already reports each line's peak (`fieldPerLine.ts:24-31`, `:108`), which is the storm by line. What stood: that a headless tape is missing part of the figure, and that the fix belongs in `replayTallies.ts` beside `mobsAlivePerTick`. What changed: the series added is mob fire's, `mobFireAlivePerTick`, and the figure the report carries is each line's per-run storm peak with mob fire's peak beside it. What the paragraph could not have known: it read `densityOf`'s `shots` field as the airborne figure, where that field counts `state.mobFire`, which is the one pool the figure excludes. And the record's batch-cost estimate is soft by about a factor of three: it derives two seconds per stage length from `bot.test.ts:700`'s thirty-second budget for five runs and then bills each whole run at one stage length, where `MAXED_RUN_TICKS` (`bot.test.ts:355`) is three stage lengths.

---

## 1. Definition, in observable terms

**Something other than a person plays the whole game (ADR 0053, ADR 0013).** A hand exists that moves, dodges, feeds, takes offers and belches, and its runs reach levelled builds rather than sitting at the birthright. A headless caller runs it over a range of seeds from one command, faster than real time, and gets a tape per seed plus one report over the batch. It measures and never judges: whether the game is fun stays a person's answer.

**The hand is a seventh policy beside the six, and it belches (ADR 0053, ADR 0042, the record's sections 1 and 12).** ADR 0053's list is four verbs and this makes it five. The reason is filed rather than assumed: #37's story 12, one belch plus play beats the Undertaker, has no hand that can answer it, and #39's batch report inherits the boss-fight belch as an instrument reading no current policy can produce, which is #98's third comment. Under a hand that never belches, `belchCadence` reports an empty fire list and a run's whole length as waste, which is an instrument reading its own absence. The cost, eyes open: the belch is a spend judgement and neither knob touches its rule, so the sloppy hand belches on exactly the sharp hand's condition; the hold does delay a belch by up to its own bound, because a held command is repeated whole (the record's section 1, amended 2026-09-09). **Three places say four verbs and slice 1 restates all three**: ADR 0053 itself, the glossary's Playing harness entry (`CONTEXT.md:201`) and the V1 line in the concept box (`game-concept.md:11`), each with a citation to the amendment, so Mark sees one commitment in one review rather than three restatements he has to line up (added 2026-09-09 after the product vision gate).

**Which body it walks to is the nearest, ties broken by the lower entity id (ADR 0053, the record's section 2).** That is `chooseOfferBody`'s own rule (`offer.ts:231-248`), so the hand's rule and the sim's tie-break are one sentence and a hand that walks at the nearest body is never handed a different one. It is line-agnostic by having no line in it: it reads positions and entity ids and never touches `state.levels`. The take-by-slot reading #98's second comment asks for is a reading the report carries and never a rule the policy carries.

**Two knobs make nine named configurations, from a sharp hand to a sloppy one (ADR 0053, decision 17).** The dexterity error holds a decided command stale for a drawn number of ticks; the strategy error shortens the look-ahead from the far end so the near samples survive. Three values each. A name is a hand word and a head word a person can say, `steady-far` through `shaky-short`, and never a number. The sharp corner is `steady-far` and the sloppy corner is `shaky-short`.

**One run per seed is the whole of a batch's size, and that holds only because the hand draws from its own stream (ADR 0053, ADR 0012).** The hand's stale-command draws come from a named stream seeded off the run's seed, made and held by the harness in `src/dev` and never inside `RunState`. Running one seed twice under `shaky-short` gives the same tick count and the same witness at every checkpoint. The sharp corner draws nothing at all, which is why the determinism test runs sloppy.

**The witness never learns the bot exists (ADR 0019, hand-forward (f)).** `RunState.streams` (`run.ts:108`) keeps its exact record type, `STREAM_ORDER` in `witness.ts` keeps its five names, and `WITNESS_VERSION` stays 6. Replay is untouched either way, because a tape records the commands the simulation consumed, whatever produced them (ADR 0029).

**A batch is a distribution and never a mean, and a comparison is an ordering and never a target (ADR 0053).** Every reading prints as its five-number summary with the seeds that produced the extremes named beside them. Two batches compare as one row per reading with a direction, up, down or flat, and no row states a target. A finding reads agreed only where the sharp corner and the sloppy corner show the same direction, and split otherwise, which is the report's own grammar for ADR 0053's believed-when-they-agree.

**Every number the report prints that is a per-line quantity in a run is a per-line quantity in the batch (#98, `path-draft.md:21`).** Three of the thirteen readings are per line today (`readings.ts:78-92`) and the drop ledger is not (`dropLedger.ts:21-29`), so widening that ledger by line is this step's one reading to widen. A quantity that is not per-line in a run, a run's tick count or its ending, says so rather than being split by a key it does not have.

**The header names which policy steered, and that costs one format version (ADR 0053, ADR 0043, ADR 0027).** A `policy` field beside `inputDevice`, a name string and never a code byte because the set is open. A person's run records `person` and a scripted wander records `script`, both reserved so no configuration may take either name. The header is positional (`records.ts:105-147`, `segments.ts:79-101`), so the field moves `FORMAT_VERSION` from 2 to 3 (`wireCodes.ts:28`) and every tape recorded before it stops decoding with a precise refusal (`decode.ts:189-192`). **The bump is taken once and carries one field**, because the director's budget is authored stage content rather than a value a run resolves and therefore takes no header field (ADR 0056's open question, closed by the record's section 5).

**Every reported figure names its rig (#107).** Five exist: the ceiling rig (`bot.test.ts:431-441`), the start-size rig (`local/slice13b-record.ts:55-70`), the ladder rig (`bot.test.ts:454-463`), the conditioned rig (`record-conditioned.ts:178-195`) and the harness rig, which is this step's and is the only one that starts at the birthright. The `policy` field plus the header's resolved size and levels make a rig recoverable from the bytes for the three that record a tape.

**The done line: the sharp hand reaches the Undertaker on most seeds and the sloppy hand on fewer.** The agent runs both corners over a batch and reports the two reach rates; Mark reads them. It is deliberately not a test, and it is the one number in this step stated as a bar. ADR 0053 forbids the harness from stating thresholds *about the game*; this is a bar on the harness itself, the evidence that the two ends of the ladder are far enough apart to be worth reading, and it is Mark's own. **Both corners low is the likely first result and it is a tuning reading, never a reason to sharpen the hand** (added 2026-09-09 after the game design gate; the record's section 7). Hand-forward (g) says no dodging birthright run crosses the stage today, so a low sharp reach says the stage as authored is beyond a hand playing it straight, which is #39's first input. A hand tuned until it clears the stage would measure the tuning of the hand, and every ordering the batch then printed would be two builds read through two instruments.

---

## 2. Already built, partly built, absent

| Ruling | Source | What exists today (file:line) | What is missing |
| --- | --- | --- | --- |
| A policy type that can express a belch | ADR 0042 | Built: `Policy` returns a `TickCommand` (`bot.ts:13-25`), and the prose at `:18-20` says why | Nothing |
| One tick crosses one authority | ADR 0017 | Built: `runPolicy` loops `executeTick` (`bot.ts:43-57`, `execution.ts:257-262`) | Nothing |
| A policy that dodges | ADR 0013 | Built: `dodgePolicy` (`bot.ts:221-223`) over `bestMoveToward` (`bot.ts:239-254`) | Nothing |
| A policy that feeds | ADR 0053's "feeds" | **Half built.** `divingPolicy` (`bot.ts:406-415`) feeds through `nearestFood` (`bot.ts:366-379`) at `COMMITTING_CLEARANCE` (`bot.ts:393`), and `dodgePolicy` does not | A single hand that does both, plus the offer |
| A policy that takes offers | ADR 0053, ADR 0034 | **Absent.** No policy reads `state.offer`; `bot.ts` never names it | The offer clause and its body rule |
| A policy that belches | ADR 0042, #37 story 12 | **Half built.** `belchingPolicy` (`bot.ts:281-291`) spends on `BELCH_WORTH_IT` (`bot.ts:274`) and nothing else in the file belches | The belch inside the hand that also feeds and takes |
| A look-ahead that can be shortened | ADR 0053's strategy error | **Absent as a knob.** `LOOKAHEAD_SAMPLES` is a module constant read inside `scoreMove` (`bot.ts:79`, `:201`) and `LOOKAHEAD_TICKS` derives from it (`bot.ts:80`, `:207`) | The sample list as a parameter, and three lists as rows |
| A command held stale for drawn ticks | ADR 0053's dexterity error | **Absent.** Every policy in `bot.ts` is a pure function of run state with no memory (`bot.ts:22-23`) | A hand that holds state, and its stream |
| Named streams off a run seed | ADR 0012 | Built: `stream(seed, name)` folds the name in by addition then hashes (`rng.ts:71-79`) | The parameter widened past the closed union (`rng.ts:4`, `:71`) |
| The overlap guard over stream names | ADR 0012, #113 | **Contradicted.** `rng.test.ts:12` names four where `StreamName` has five, and its own comment at `:33-35` says a fifth colliding name should fail loudly | The list closed over every name plus the hand's |
| The offer's body choice | ADR 0034 | Built, sim-side: `chooseOfferBody` (`offer.ts:231-248`), nearest by centre, ties to the lower id | Nothing; the hand copies the rule rather than the code |
| An offer banked while one stands | ADR 0034, decision 9 | Built: `openOffer` banks (`offer.ts:207-213`), `openBanked` reopens at the grave's own x (`offer.ts:265-269`), `openBankedOffer` is the tick site (`offer.ts:289-292`) | A played run that walks the path, and the count on a report |
| Which body of an offer went in | #98's second comment | **Absent.** `offerTaken` carries the line and the lines passed and no slot; `offerOpened` carries the options, a point and the bank count (both in `events.ts`) | The slot on the take and the site on the opening |
| The drop ledger by line | #98, `path-draft.md:21` | **Half built.** `dropLedger` counts spawned, swallowed, passed, lost and standing as five plain totals (`dropLedger.ts:21-29`); `dropSpawned` carries an optional line, `offerTaken` the line and the passed, `offerLost` the options (all in `events.ts`) | The five counts keyed by line |
| Shots on the field over a run | #39's airborne-projectile figure | **Absent on a headless tape.** `densityOf` counts live shots (`replayTallies.ts:74-80`) but is sampled only at expensive-frame ticks (`:158`), and a headless tape has no frame rows | A per-tick series beside `mobsAlivePerTick` (`replayTallies.ts:34`, `measure.ts:117`) |
| The section timeline off a tape | ADR 0049 | Built: `sectionTimeline` spans (`readings.ts:78-92`, `sectionTimeline.ts:16-28`) | Nothing; the report reads it |
| The belch's rhythm off a tape | #39 | Built: `belchCadence` carries every fire with its tick, ticks at full and charge wasted (`belchCadence.ts:27-31`) | Nothing; the report crosses it with the boss spans |
| A verified per-run report | ADR 0019 | Built: `measure` returns metrics, a divergence or a refusal (`measure.ts:230-289`), thirteen readings in it (`readings.ts:78-92`) | Nothing |
| Runs excluded from default aggregates | ADR 0019 | **Half built.** `AggregateExclusion` names bot, script, conditioned, faulted and unchecked (`measure.ts:70-71`) and `exclusionsOf` reads the device (`measure.ts:173-187`), but nothing in production ever writes `bot` | The policy's own exclusion |
| A five-number summary | ADR 0053's distributions | **Absent.** `seriesSummary.ts:9-31` has first, last, least, greatest and mean, and no quartile | The three quartiles, in that same module |
| Two runs compared as declared readings | ADR 0053 | Built for runs: `compareRuns` over `READING_COMPARISONS` (`compareRuns.ts:290`, `:629-651`), guarded by `comparisonDeclared.test.ts:96-124` | The same shape over two batches |
| A batch runner | #98 | **Absent.** The two headless entries are `record-conditioned.ts` (a fixed wander) and `measure.ts` (one tape in, JSON out, `scripts/measure.ts:62-83`) | The whole thing |
| The policy in the header | ADR 0053, ADR 0043 | **Absent.** `TapeHeader` has sixteen fields and none of them is the policy (`tape.ts:53-115`) | The field, the bump, and the two reserved names |
| The header's resolved-value rule | ADR 0027 | Built: the pattern is `UNNAMED_AUTHOR` and `UNRESOLVED_BUILD` as named constants at the one write site (`tapeHeader.ts:18`, `:21`, `:70-92`) | The policy following it |
| One rig per starting condition | #107 | **Contradicted.** Two rigs share the "maxed dodge bot at seed 101" label: `bot.test.ts:435` starts at `SIZE_CEILING` and `local/slice13b-record.ts:57` at `SIZE_START` | Five names, and the harness rig |
| Tapes written somewhere | ADR 0057 | **Not yet.** The store is provisioned and the step is #100; `local/` is ignored by version control (`.gitignore:16`) and by eslint (`eslint.config.mjs:59`) | The batch folder, until step 6 |
| The dev-only autopilot in the rendered game | ADR 0013 | **Absent, deliberately.** `bot.ts:38-41` records that it is not wired into the app | Not this step's; see section 5 |

Three structural facts the table rests on, verified rather than assumed:

- **The event vocabulary is not on the wire.** `wireCodes.ts` carries input devices (`:37-43`), integrities (`:45-49`), stop reasons (`:61-67`), run endings (`:75-83`), fault identities (`:96-119`), severities and frame reasons, and no event codes at all. Adding a field to `offerOpened` and `offerTaken` therefore costs no format version and no witness version.
- **`src/dev` may reach `src/game` and `src/tape` and may import no package.** `boundary.test.ts:69-74` is the row, so every module this step adds under `src/dev` is fenced out of `node:fs` by construction and the filesystem work has to be a shell in `scripts/`, which is the shape `scripts/measure.ts:6-9` already states.
- **`scripts/` is outside every fence in `src/__tests__/boundary.test.ts`**, which scans `SRC` only (`boundary.test.ts:25`, `:434`), and it is inside `tsconfig.json`'s `include`, so a shell is typechecked and unfenced. `local/` is inside neither.

---

## 3. Verification steps

**Actor: agent.**

1. **Unit tests** at the seams in section 4, per the list in section 6. `pnpm vitest run` from `apps/hungry-grave/`.
2. **`pnpm typecheck`** from `apps/hungry-grave/`. Only this judges diagnostics.
3. **`pnpm build`** from `apps/hungry-grave/` (it runs lint and typecheck first, `package.json:9`).
4. **`pnpm verify`** at the repo root. A timeout with no assertion beside other running work is contention and not a failure; run the suite alone once more before calling it red (`docs/agents/lessons.md`, "contention is not flakiness").
5. **Test-name diff, per slice.** `pnpm vitest list --json` against the slice 0 baseline, comparing file-qualified names as well as bare ones. It matters most on the header slice, which edits fourteen files that build a `TapeHeader` literal (section 7).
6. **Golden digest, per slice.** `GOLDEN` (`digest.ts:314`) **must not move in any slice of this step.** The scenario runs 600 ticks from seed 20260820 (`digest.ts:18-19`) under a scripted input and never under a policy, and nothing this step changes is folded: the two new event fields are not on the wire and not in the witness, the harness's stream is outside `RunState`, and the header is not folded. If `GOLDEN` moves, the slice is wrong and it is a stop-and-report.
7. **Old-tape decode check.** Record two tapes at the tip before slice 1 with `record-conditioned.ts`, saved outside the repo, and after the format bump run `scripts/measure.ts` on them. Passing means the tool refuses with the precise format-version message (`decode.ts:189-192`) rather than throwing a generic error or silently coercing. This is ADR 0043's accepted cost, paid once.
8. **Verification readback on a harness tape.** Decode one batch tape and assert `measure` answers `outcome: 'verified'` rather than a divergence or a refusal (ADR 0019, ADR 0033). Passing means a bot tape replays and attests exactly as a person's does, which is #98's acceptance line.
9. **The determinism run.** One seed played twice under `shaky-short`, same tick count and same witness at every checkpoint, and the run's own five stream cursors identical between the two.
10. **The first batch, sharp corner.** 48 seeds under `steady-far` from the one command. The agent prints the report's table into the note: the endings, the reach, the phase spans, the drop ledger by line, take-by-slot, offers banked while one stood, the belch fires inside the boss spans, the Waking's swallows, the floor visits and what followed them, and each line's storm peak with mob fire's peak beside it. This is where the report stops being a design and becomes a measurement.
11. **Both corners, and the done line.** 48 seeds under `steady-far` and 48 under `shaky-short`, the two reach rates reported side by side, and the comparison run between them so the agreed and split rows exist. **The agent reports the two rates and does not judge them**; whether they are far enough apart is step 17 below.
12. **The band separation, measured.** The comparison's separation row is a number that must exist before it can be measured, so it ships as data at zero (bands that merely fail to overlap) and the first two batches are what say what it should be. The agent reports what the two corners' bands actually looked like and proposes a figure; it does not change the row without saying so.
13. **The fences.** `src/__tests__/lineAgnosticPolicies.test.ts`, `src/__tests__/boundary.test.ts`, `src/dev/__tests__/comparisonDeclared.test.ts` and the new declaration guard, each green and each named by test title in the note.
14. **The batch cost, measured rather than estimated.** The agent reports wall-clock for one 48-seed batch, split between playing and measuring, so step 4's tuning pass knows what nine configurations cost. The record's quarter-hour figure is soft (section 0); this replaces it.

**No rendered check is owed by this step, and that is deliberate.** The harness draws nothing: every module it adds is under `src/dev` and `scripts/`, and `src/app` is touched only by the one named constant in `tapeHeader.ts`. ADR 0013's dev-only autopilot in the rendered game is real and unbuilt, and it is recorded as unowned in section 5 rather than smuggled in here.

**Actor: human (Mark). Named as still open in the agent's report.**

15. **The two ADR-level calls in the record's section 12.** That the base policy belches, which widens ADR 0053's verb list; and that the director's budget is pinned to the build and never travels in the header, which closes ADR 0056's open question and makes this step's bump one field rather than two. Both were taken under their recommended default, both are amended into their ADRs by the slices that build them, and both are his to overrule on the branch before merge.
16. **The craft calls the record leaves him**, in particular the nearest-body rule, the nine configuration names, and the batch size of 48.
17. **Whether the two ends of the ladder are far enough apart.** He reads the two reach rates from step 11. This is the done line and no test can see it: it is a judgement about whether the sloppy hand is sloppy enough to be worth reading against the sharp one. If the two rates sit on top of each other, the answer is a wider knob and not a bigger batch.
18. **Whether the report reads.** #98's report is written for him and for step 4. Whether a five-number summary with two named seeds says more than a percentile band at this size is a read of the printed table, not of the code.

---

## 4. Seams under test

Signatures are the contract the coding agent implements. Every public name carries a glossary word (`CONTEXT.md`). Public interfaces are one export block at each module's end (`code-typescript.md`).

### `src/dev/configurations.ts` (new)

```ts
/**
 * One hand the harness plays with: the base policy under one value of each
 * knob (CONTEXT.md Configuration). Nine rows, keyed by name, with no
 * arithmetic between them, so the tuning pass moves one without touching the
 * other eight.
 */
interface Configuration {
  readonly name: ConfigurationName;
  /**
   * The dexterity error, as the largest number of ticks a decided command may
   * be held stale. The hold is drawn uniformly from 0 to this bound inclusive,
   * and a bound of zero draws nothing at all.
   */
  readonly holdBound: number;
  // The strategy error, as the look-ahead samples in ticks ahead, shortened from the far end.
  readonly lookaheadSamples: readonly number[];
  // Live shots on the field that make a belch worth spending.
  readonly belchWorthIt: number;
  // Clearance past which a move counts as safe and the wanting decides instead.
  readonly enoughClearance: number;
}

type ConfigurationName =
  | 'steady-far' | 'steady-middling' | 'steady-short'
  | 'loose-far' | 'loose-middling' | 'loose-short'
  | 'shaky-far' | 'shaky-middling' | 'shaky-short';

const CONFIGURATIONS: Readonly<Record<ConfigurationName, Configuration>>;
const CONFIGURATION_NAMES: readonly ConfigurationName[];

// The two corners a finding has to agree across (ADR 0053).
const SHARP_HAND: ConfigurationName;
const SLOPPY_HAND: ConfigurationName;

/**
 * The names no configuration may take, because the header writes them for a
 * person and for a scripted wander (ADR 0027, the record's section 5). The two
 * names themselves are imported from src/tape/tape.ts, where they are declared
 * beside TAPE_INPUT_DEVICES: this module names no value the tape format owns.
 */
const RESERVED_POLICIES: readonly string[];

// Parse at the edge: a shell's argument becomes a name here or is refused here.
const isConfigurationName: (name: string) => name is ConfigurationName;

export {
  CONFIGURATIONS,
  CONFIGURATION_NAMES,
  SHARP_HAND,
  SLOPPY_HAND,
  RESERVED_POLICIES,
  isConfigurationName,
};
export type { Configuration, ConfigurationName };
```

**The nine rows are written out and never computed from two axes, and that is the record's call restated.** It costs the belch threshold and the clearance being repeated nine times. What it buys is that the tuning pass moves one configuration's row without moving eight others, which is exactly what a comparison between two configurations needs, and that a reader sees what a configuration is without composing two tables. Section 8 carries it as a craft call with the record's section 3 cited.

**`holdBound` is a bound and not a range, because the low end is always zero.** A hold is drawn from 0 to the bound inclusive, so steady is 0, loose is 15 and shaky is 36, at `TICK_HZ` 60 (`clock.ts:4`), which is 0, 250 and 600 milliseconds (the record's section 3, amended 2026-09-09 after the game design gate: at 12 ticks a shot covers 22 units where the grave covers 54, so the old sloppy corner was a sharp hand under another name). Writing a two-ended range would put a second number in every row that is zero in all nine.

### `src/dev/harnessPolicy.ts` (new)

```ts
// The name the harness's own stream is made under, off the run's seed (ADR 0053).
const HAND_STREAM = 'hand';

/**
 * The hand the harness plays with, under one configuration (CONTEXT.md
 * Policy). It is a factory and not a bare Policy because it holds two things
 * the six policies in bot.ts do not: the command it is repeating, and the
 * stream the repeat length is drawn from.
 *
 * The stream is made here and never inside RunState, so the witness never
 * learns the bot exists and WITNESS_VERSION stays 6 (ADR 0019, hand-forward
 * (f)).
 */
const harnessPolicy: (configuration: Configuration, seed: number) => Policy;

export { harnessPolicy, HAND_STREAM };
```

**The seed arrives with the hold, in slice 5, and not before** (added 2026-09-09 after the tech architecture gate). Slice 1 lands `harnessPolicy(configuration)` with no hold and no stream, because a `seed` parameter nothing reads is a typecheck failure under `noUnusedParameters` (`tsconfig.json`). Slice 5 widens the signature to the shape above and records it as a seam that moved, which is one honest change in the slice that gives the parameter something to do.

**What the returned policy does each tick, in order.** If a hold is still running, decrement it and return the command it is holding. Otherwise decide: the point wanted is the live offer's nearest body if an offer stands, else the nearest food, else `HOME`; the move is `bestMoveToward` at the configuration's clearance over the configuration's samples; the belch is on when the reservoir is at capacity and at least the configuration's own count of shots is live. Then draw the next hold and remember the command. **A bound of zero draws nothing and decides every tick**, which is load-bearing: the record's determinism test runs under the sloppy corner precisely because the sharp corner's stream is never touched, and a `nextInt(1)` that always answers zero would make that sentence false.

**Which body, spelled out**: among the live offer's bodies, the one whose centre is nearest the grave's, ties broken by the lower entity id. It is `chooseOfferBody`'s rule (`offer.ts:231-248`) written again rather than called, because `chooseOfferBody` takes the bodies the grave already covers and the hand needs the ones it could reach. The two must not drift, and test 1 is what holds them together.

**This module names no weapon line and cannot**, because it reads positions and entity ids and never `state.levels`. Fence 76 makes that mechanical by adding it to `POLICY_MODULES` (`lineAgnosticPolicies.test.ts:79-83`).

### `src/dev/bot.ts` (changed)

```ts
// The look-ahead becomes a parameter, so a head can be shortened without a second dodge.
const scoreMove: (
  state: RunState,
  move: MoveCommand,
  threats: readonly Threat[],
  speed: number,
  wants: { x: number; y: number },
  enough: number,
  samples: readonly number[],
) => number;

const bestMoveToward: (
  state: RunState,
  point: { x: number; y: number },
  enough: number,
  samples: readonly number[],
) => MoveCommand;

export {
  runPolicy,
  dodgePolicy,
  unloadedPolicy,
  belchingPolicy,
  hitTakingPolicy,
  divingPolicy,
  waitingPolicy,
  bestMoveToward,
  nearestFood,
  LOOKAHEAD_SAMPLES,
};
export type { Policy, PolicyRun };
```

**No default on `samples`, and the three existing call sites pass `LOOKAHEAD_SAMPLES` by name** (`bot.ts:227`, `:411`, `:429`). A default would hide which horizon a policy reads at exactly the moment the file gains a policy that reads a different one. `LOOKAHEAD_TICKS` (`bot.ts:80`) retires: the settled point at `bot.ts:207` reads the last element of the list it was passed, which is what the constant was.

**The six policies' behaviour does not move, and that is the point.** Every figure any of them has ever produced keeps meaning what it meant: `dodgePolicy` carries the whole-stage suite over five seeds (`bot.test.ts:69`, `:464-512`), `unloadedPolicy` and `belchingPolicy` carry ADR 0042's two-sided Wall property (`bot.test.ts:931`), `divingPolicy` and `waitingPolicy` carry the Waking's property, and `hitTakingPolicy` walks ADR 0003's ladder (`bot.test.ts:840`). Module test 75 is the mechanical form of that promise.

**`LOOKAHEAD_SAMPLES` is exported but `configurations.ts` does not import it.** The far row is the same four numbers and it is written again, because the six policies' fixed horizon and the harness's far knob are two facts that happen to agree today: the day the tuning pass moves one it must not move the other. The export exists for the test that holds the six policies unchanged.

### `src/dev/harnessRun.ts` (new)

```ts
/**
 * How long one harness run may play, derived from the stage's own rows rather
 * than written down: a phase's own rows plus whatever they leave falling,
 * summed over PHASES, times the slack a fight costs (bot.test.ts's own
 * derivation, `budgetOf` and STAGE_TICKS).
 */
const RUN_TICK_SLACK: number;
const runTickBudget: () => number;

// One harness run, played and sealed, as the bytes a tape file holds.
interface HarnessRun {
  readonly seed: number;
  readonly configuration: ConfigurationName;
  readonly bytes: Uint8Array;
  readonly ticks: number;
  readonly ending: RunEnding | null;
}

/**
 * Plays one seed under one configuration through the one execution authority
 * and seals it (ADR 0017). The commit hash arrives as an argument because
 * asking git is the shell's job and src/dev may import no package.
 */
const playHarnessRun: (
  configuration: Configuration,
  seed: number,
  commitHash: string,
  recordedAt: number,
) => HarnessRun;

export { playHarnessRun, runTickBudget, RUN_TICK_SLACK };
export type { HarnessRun };
```

**The header this module writes** is the harness rig's: the run's own seed, resolved starting size and levels and roster off `createRun`'s defaults (`run.ts:250-254`), `TICK_HZ`, `RECORDER_CHECKPOINT_SPACING`, `WITNESS_VERSION`, the passed commit hash, the passed recorded-at stamp, an empty build identity, `unknown` as the author, `inputDevice: 'bot'` and `policy: configuration.name`. **The stamp is passed and never read here** (added 2026-09-09 after the tech architecture gate): `TapeHeader.recordedAt` (`tape.ts:114`) is written into the bytes, so a `Date.now()` inside `src/dev` would make one run's bytes different on every call and module test 58 unrepeatable. Asking the clock is the shell's job on the same terms as asking git. It is the second copy of a headless header literal in the tree beside `record-conditioned.ts:139-158`; the rule of three says a second copy is fine, and **the third copy is the trigger to extract one**, which is recorded here so the next writer sees it rather than discovering it.

**It writes `bot` where `record-conditioned.ts` writes `script`, and that is the first production write of `bot` in the tree.** The record found that today a scripted wander and a dodge-bot run are the same value in the header; this closes half of it and the `policy` field closes the rest.

### `src/dev/seriesSummary.ts` (changed)

```ts
/**
 * The five numbers a batch reading prints as, and never a mean (ADR 0053).
 * Absent for an empty series, on the same terms as the figures beside it: a
 * batch with no run has nothing to summarise.
 */
interface FiveNumbers {
  readonly min: number;
  readonly lowerQuartile: number;
  readonly median: number;
  readonly upperQuartile: number;
  readonly max: number;
}

const fiveNumbersOf: (series: readonly number[]) => FiveNumbers | undefined;

export { firstOf, lastOf, leastOf, greatestOf, meanOf, fiveNumbersOf };
export type { FiveNumbers };
```

**It joins this file rather than starting one**, because the file's stated concept is "what a series of numbers reduces to" (`seriesSummary.ts:1-2`) and a five-number summary is exactly that. `meanOf` stays for the readings that already use it; nothing in the batch report calls it, and guard 81 is what says so.

**Quartiles are nearest-rank on the sorted series**, the same method `framePerformance.ts:15` already states for its percentiles, so the tree has one convention rather than two.

### `src/dev/batchReport.ts` (new)

```ts
// How many seeds one batch walks, initial (ADR 0053: seeds and never repeats).
const BATCH_SEEDS: number;

// What a batch was, so the folder's name is a convenience and the report is the record (ADR 0057).
interface BatchIdentity {
  readonly configuration: ConfigurationName;
  readonly firstSeed: number;
  readonly seeds: number;
  readonly recordedAt: number;
  // Every commit the batch's tapes name, so a batch that spans two says so.
  readonly commitHashes: readonly string[];
  /**
   * The widths of the mob types this build fields, off MOB_TYPES, so the
   * grave's size spread is read as a scale rather than as a bare number
   * (the record's section 4, amended 2026-09-09). It is a fact about the
   * build and not a reading, so it sits on the identity and is declared
   * notReduced.
   */
  readonly mobWidths: Readonly<Record<string, number>>;
}

// One reading's spread across a batch, with the tail named rather than banded.
interface Spread {
  readonly count: number;
  readonly summary: FiveNumbers;
  readonly minSeed: number;
  readonly maxSeed: number;
}

// A run whose tape did not verify, kept in the report rather than dropped (ADR 0019).
interface UnverifiedRun {
  readonly seed: number;
  readonly outcome: string;
}

interface BatchReport {
  readonly identity: BatchIdentity;
  readonly readingsVersion: number;
  readonly verified: number;
  readonly unverified: readonly UnverifiedRun[];
  // Every reading the table declares as a spread, by its declared name.
  readonly spreads: Readonly<Record<string, Spread>>;
  // Every reading the table declares as per line, by line and then by name.
  readonly byLine: Readonly<Record<WeaponLine, Readonly<Record<string, Spread>>>>;
  // Readings that are a name rather than a number, counted: endings, stops, reach.
  readonly counts: Readonly<Record<string, Readonly<Record<string, number>>>>;
  // Each phase's span across the batch, which is ADR 0049's clock read as a distribution.
  readonly phaseSpans: Readonly<Record<PhaseName, Spread>>;
}

/**
 * How one reading on a verified report becomes a figure on a batch. Naming the
 * not-reduced kind is what gives guard 80 teeth: a reading nobody thought about
 * is a hole, and a reading deliberately carried whole says so.
 */
type BatchReduction =
  // A number per run, printed as five numbers with the extreme seeds beside it.
  | 'spread'
  // A number per run per weapon line, printed as one spread per line.
  | 'perLine'
  // A name per run, counted rather than spread, because a name has no quartile.
  | 'count'
  // A number per run reduced to the batch's peak, for a figure a density check reads.
  | 'peak'
  // Carried on the batch's identity and never reduced, which the commit hashes are.
  | 'notReduced';

interface DeclaredBatchReading {
  // The reading's path on a verified report, as comparisonDeclared walks it.
  readonly reading: string;
  readonly reduction: BatchReduction;
}

/**
 * Every reading a verified report carries, and how a batch reduces it.
 *
 * The same shape as READING_COMPARISONS (compareRuns.ts:290): adding a reading
 * is an explicit decision about how a batch reads it, never an accident of the
 * type it happens to have, and a reading with no entry here is a hole that
 * guard 80 keeps red.
 */
const BATCH_READINGS: readonly DeclaredBatchReading[];

const batchReportOf: (
  identity: BatchIdentity,
  runs: readonly { seed: number; measurement: Measurement }[],
) => BatchReport;

export { batchReportOf, BATCH_READINGS, BATCH_SEEDS };
export type {
  BatchIdentity,
  BatchReduction,
  BatchReport,
  DeclaredBatchReading,
  Spread,
  UnverifiedRun,
};
```

**The declared table is a genuine design decision and needs review before dispatch.** It is the mechanism that makes "every number in the report is broken out by weapon line" mechanical rather than a promise: a reading that is per line in a run declares itself per line here, one that is not declares itself a spread or a count, and guard 80 names anything nobody declared. Its caller today is `batchReportOf` and its cited future is step 4 (#39), which reads the report. The alternative, reflecting over the report's shape and inferring, is exactly what `comparisonDeclared.test.ts:107-110` was written against.

**The five readings the record promises, each declared here** (added 2026-09-09 after the game design gate, which found three of them with no mechanism at all). The belch inside a boss span is `belchCadence`'s fires crossed with the section timeline's boss spans, declared `spread` as a count of fires per span. The Waking's swallows are the new `wakingSwallows` reading, declared `spread`. Grave-to-mob scale is `gravePath.sizePerTick` declared `spread`, printed beside the widths the build fields, which `BatchReport` carries on its identity as `mobWidths` off `MOB_TYPES` (`mobs.ts:74`, `:91`, `:110`) so the ratio is a reader's to take and never the report's to state. The spiral-versus-comeback split is `gravePath`'s new floor visits and recoveries, both declared `spread` and both printed as hand-bound, because the hand dives at any size and never flees. The airborne figure is `fieldPerLine`'s per-line peaks declared `peak` with `mobFireAlivePerTick` declared `peak` beside them.

**Nothing in this module compares a number to anything.** There is no target, no pass, no verdict and no boolean anywhere in `BatchReport`, and guard 81 is what says so rather than a comment.

### `src/dev/compareBatches.ts` (new)

```ts
/**
 * How far two quartile bands must clear each other before a direction is
 * anything but flat, as a fraction of the wider band. An initial data row at
 * zero, which means bands that merely fail to overlap: it is a number that has
 * to exist before it can be measured, so it is data and the first two batches
 * are what say what it should be (#39's approach, the standing rule).
 */
const BAND_SEPARATION: number;

type Direction = 'up' | 'down' | 'flat' | 'incomparable';

interface ComparedSpread {
  readonly reading: string;
  readonly left: Spread | undefined;
  readonly right: Spread | undefined;
  readonly direction: Direction;
}

interface BatchComparison {
  readonly left: BatchIdentity;
  readonly right: BatchIdentity;
  readonly readings: readonly ComparedSpread[];
}

// Whether the two corners saw the same thing (ADR 0053).
type Agreement = 'agreed' | 'split';

interface CornerFinding {
  readonly reading: string;
  readonly sharp: Direction;
  readonly sloppy: Direction;
  readonly agreement: Agreement;
}

const compareBatches: (left: BatchReport, right: BatchReport) => BatchComparison;

/**
 * The two corners' comparisons read together: a row reads agreed only where
 * both show the same direction, and split otherwise, carrying both directions
 * rather than one of them (ADR 0053's believed-when-they-agree, as the
 * report's own grammar).
 */
const readAcrossCorners: (
  sharp: BatchComparison,
  sloppy: BatchComparison,
) => readonly CornerFinding[];

export { compareBatches, readAcrossCorners, BAND_SEPARATION };
export type { Agreement, BatchComparison, ComparedSpread, CornerFinding, Direction };
```

**`incomparable` is a fourth direction and not an absence**, on the precedent of `compareRuns.ts:33`'s own `INCOMPARABLE`: a reading one batch carries and the other does not is a fact about the two batches, and reporting it as flat would say they agreed.

### `src/dev/readings/offerChoices.ts` (new)

```ts
// Where an offer stood: at the carrier's death, or out of the bank (ADR 0034).
type OfferSite = 'death' | 'bank';

// One offer, and what the run did with it.
interface OfferChoice {
  readonly tick: number;
  readonly site: OfferSite;
  // The taken body's place among the offer's bodies, left to right, or null when the offer was lost.
  readonly slot: number | null;
  readonly line: WeaponLine | null;
  readonly passed: readonly WeaponLine[];
}

interface OfferChoices {
  readonly choices: readonly OfferChoice[];
  // Offers a carrier's death paid while one already stood (ADR 0034, decision 9).
  readonly bankedWhileStanding: number;
}

const createOfferChoices: () => OfferChoicesAcc;
const observeOfferChoices: (acc: OfferChoicesAcc, tick: number, events: readonly SimEvent[]) => void;
const offerChoicesOf: (acc: OfferChoicesAcc) => OfferChoices;

export { createOfferChoices, observeOfferChoices, offerChoicesOf };
export type { OfferChoice, OfferChoices, OfferChoicesAcc, OfferSite };
```

**It reads the two new event fields rather than deriving them, and that is the reviewable part.** The slot could be derived by remembering the live offer's options and indexing `offerTaken.line` into them, and the site could be guessed from `offerOpened.y` against `OFFER_ENTRY_DEPTH` (`offer.ts:53`, `:265-269`). Both derivations are sound only by accident: the first works because `drawFrom` never repeats a line inside one offer, which is a property of the draw and not of the offer, and the second works because no carrier dies above the field's top edge, which is a property of the stage. The sim knows both facts where they happen, so it records them (`code-core.md`, the fact recorded where it is known).

### `src/game/events.ts` (changed; cited by content, adjustment 4 is in it)

`OfferOpened` gains `site: OfferSite`, the site the offer stood at. `OfferTaken` gains `slot: number`, the taken body's index among the offer's bodies in the order they were laid. Both are payload fields on events that are not on the wire, so neither costs a format version and neither is folded.

### `src/game/offer.ts` (changed)

`standOffer` (`offer.ts:161`) takes the site as a third argument and puts it on the `offerOpened` it builds (`offer.ts:190-199`). Its two callers say which: `openOffer` (`offer.ts:207-213`) passes `death`, `openBanked` (`offer.ts:265-269`) passes `bank`. `resolveOffer` (`offer.ts:303-319`) already computes `index` and puts it on the `offerTaken` it returns. Nothing else in the module moves, and `chooseOfferBody`'s rule is untouched.

### `src/dev/readings/dropLedger.ts` (changed)

```ts
// The four ends by line, for every body that carried an option (ADR 0034, path-draft.md:21).
interface DropLedgerByLine {
  readonly spawned: number;
  readonly swallowed: number;
  readonly passed: number;
  readonly lost: number;
  readonly onFieldAtStop: number;
}

interface DropLedger {
  readonly spawned: number;
  readonly swallowed: number;
  readonly passed: number;
  readonly lost: number;
  readonly onFieldAtStop: number;
  readonly byLine: Readonly<Partial<Record<WeaponLine, DropLedgerByLine>>>;
}
```

**No event widening is needed for this and the plan checked rather than assumed.** `dropSpawned` carries an optional line, `offerTaken` carries the line taken and the lines passed, `offerLost` carries the options that went with it, and a live drop body carries `corpse.line` (`corpses.ts:80`). What the totals count and the per-line record cannot is the body carrying no option at all, which is the nothing-offerable branch (`offer.ts:164`) and a maxed run's carrier: those stay in the five totals and appear under no line, and module test 26 is what says so out loud rather than leaving the sums looking broken.

**`READINGS_VERSION` does not move** (`src/dev/readingsVersion.ts:28`, which is beside `measure.ts` and not inside `readings/`). Its own rule is that adding a reading beside unchanged ones does not bump it, and every existing figure the drop ledger prints means exactly what it meant.

### `src/dev/replayTallies.ts` and `src/dev/measure.ts` (changed)

`ReplayTallies` gains `mobFireAlivePerTick: number[]`, seeded `[0]` beside `mobsAlivePerTick` (`replayTallies.ts:34`, `:110`) and pushed from `liveCount(state.mobFire)` beside it (`replayTallies.ts:153`). `Metrics` gains `mobFireAlivePerTick` beside `mobsAlivePerTick` (`measure.ts:117`, `:282`).

**It is mob fire and not the storm, and the difference is the whole of the reading** (amended 2026-09-09 after the tech architecture gate). The storm is the player's own projectiles and mob fire is never the storm (`CONTEXT.md:73`), and the storm is already counted per line every tick by `fieldPerLine` (`fieldPerLine.ts:24-31`), whose per-line max (`:108`) is the per-run peak #39's airborne figure wants. What a headless tape has no reading of is mob fire, because `densityOf`'s `shots` field is sampled only where a frame row exists (section 0). So this series closes the missing half and the report prints the storm's per-line peaks with mob fire's peak beside them.

`AggregateExclusion` (`measure.ts:70-71`) gains `policy`, and `exclusionsOf` (`measure.ts:173-187`) pushes it when the header's policy is anything but the person's. `Provenance` (`measure.ts:74-84`) gains the policy so a report says which hand steered without anyone reading the header separately.

### `src/tape/tape.ts`, `records.ts`, `segments.ts`, `wireCodes.ts` (changed)

`TapeHeader` gains `readonly policy: string`, declared beside `inputDevice` (`tape.ts:105`) with the same comment shape the reserved fields carry. `writeHeaderRecord` writes it with `writeString` after the input device byte (`segments.ts:96`), `readHeader` reads it in the same place (`records.ts:116-120`). `FORMAT_VERSION` moves from 2 to 3 (`wireCodes.ts:28`) and its own comment gains the reason, in the shape the version-2 note already uses.

**A string and never a code byte**, because the set of policy names is open and a positional or ordinal encoding over an open set is the exact mistake ADR 0043 was written against; ADR 0053 says so outright. `writeString` already refuses a name past 65535 bytes (`bytes.ts:93-100`), which is the whole of the bound this field needs.

### `src/app/tapeHeader.ts` and `scripts/record-conditioned.ts` (changed)

```ts
// In src/tape/tape.ts, beside TAPE_INPUT_DEVICES.

// What a person's run records, resolved and true (ADR 0027 forbids an absence).
const PERSON_POLICY = 'person';

// What a fixed arithmetic wander records: not a policy, and not a person.
const SCRIPT_POLICY = 'script';
```

**Both names live in `src/tape/tape.ts` and never in `src/app`** (amended 2026-09-09 after the tech architecture gate). They are values the tape format reserves, and homing the person's in `src/app` would have made `exclusionsOf` in `src/dev` import from `src/app`, which `boundary.test.ts:69-74` forbids: `src/dev` reaches `dev`, `game` and `tape` and nothing else. Beside `TAPE_INPUT_DEVICES` (`tape.ts:19-25`) they sit with the field they are reserved against, and every writer imports them: `tapeHeaderFor` (`tapeHeader.ts:70-92`) writes `PERSON_POLICY` beside `UNNAMED_AUTHOR` (`:18`) and `UNRESOLVED_BUILD` (`:21`), which is the pattern the reserved fields already use; `record-conditioned.ts`'s `headerFor` (`:139-158`) writes `SCRIPT_POLICY`, because a fixed arithmetic wander (`:165-170`) is neither; and `configurations.ts` builds `RESERVED_POLICIES` from the pair rather than spelling either again.

**Two reserved names and not one.** `unknown` is not available because `inputDevice` spends that word on a real unknown (`tape.ts:19-25`). Test 17 asserts no configuration is named either, so the set the game writes and the set the harness writes are disjoint by construction.

### `src/game/rng.ts` (changed)

```ts
const stream = (seed: number, name: string): Stream => { ... };
```

**One word changes and nothing else.** `StreamName` stays the closed union naming the streams a run holds (`rng.ts:4`), `RunState.streams` keeps its exact record type (`run.ts:108`), and `STREAM_ORDER` in `witness.ts` keeps its five names. What widens is only who may ask for a stream, which is what lets `src/dev` make the hand's own without putting the bot's dice in the shipped simulation.

### `scripts/batch.ts` (new)

```
pnpm vite-node --config vite.headless.config.ts scripts/batch.ts <configuration> <first-seed> [count] [out-root]
```

The shell, and the only thing in this step that touches the filesystem. It refuses an unknown configuration name, a seed outside `SEED_LIMIT` (`run.ts:156`) and a count below one, each out loud with the usage, in the shape `record-conditioned.ts:43-47` already uses: a flawed argument is an external failure and the person holding the command line is the nearest owner who can act. It asks git for the commit hash the way `record-conditioned.ts:126-132` does. It takes the recorded-at stamp from the clock once, for the folder name and for every header it passes to `playHarnessRun`. Then, per seed: play through `playHarnessRun`, write `<out-root>/<configuration>-<stamp>/<seed>.tape`, decode and measure those same bytes, and collect the measurement. Finally it writes `report.json` beside the tapes and prints the folder path as the whole of stdout.

**`<out-root>` is an argument defaulting to `local/batches`** (added 2026-09-09 after the tech architecture gate). Tests 70 and 71 spawn this shell, and a shell whose output root is fixed writes into the worktree's own `local/batches/` every time they run; with the root as an argument they point it at a scratch folder and assert what it wrote there. A batch a person runs takes the default and needs no extra word on the command line.

**It measures the bytes it wrote rather than the run it just held in memory, and that costs a second replay per run.** It is the honest form and it is what step 6 turns into a query: nothing in the store is authoritative except the bytes (ADR 0057), so a report built from live state would be a report of something no tape can reproduce. It also means every batch exercises verification readback on all 48 tapes rather than on one. The cost is measured at verification step 14 rather than estimated.

**The folder name is a convenience and the bytes are authoritative** (ADR 0057). Every tape's header carries the seed, the commit hash, the resolved size, levels and roster, and now the policy, so step 6's ingest reads the folder and learns nothing from its name the bytes do not already say. `local/` is outside version control (`.gitignore:16`) and outside eslint (`eslint.config.mjs:59`), so nothing here can reach a commit or redden the standing checks.

---

## 5. Module boundaries

Every module is owned by this dispatch unless its row says otherwise.

| Module | New or changed | What it is for | Owner |
| --- | --- | --- | --- |
| `src/dev/configurations.ts` | New | The nine configuration rows, the two corners, the reserved policy names, and the parse an argument goes through. Data only: it imports nothing from `src/game` and declares no behaviour. | This dispatch |
| `src/dev/harnessPolicy.ts` | New | The hand: which point it wants, the belch, the hold, and the stream the hold is drawn from. The only module in the harness that draws. | This dispatch |
| `src/dev/bot.ts` | Changed | The look-ahead becomes a parameter; `bestMoveToward` and `nearestFood` are exported so the hand builds on the steering rather than copying it. The six policies are untouched in behaviour. | This dispatch |
| `src/dev/harnessRun.ts` | New | One seed played under one configuration and sealed to bytes: the tick budget derived from the stage, and the harness rig's header. Returns bytes and never writes them. | This dispatch |
| `src/dev/batchReport.ts` | New | The batch's identity, the declared reading table, and the report: spreads, per-line spreads, counts, phase spans and the unverified runs. Compares nothing and states no target. | This dispatch |
| `src/dev/compareBatches.ts` | New | Two reports as one ordering per reading, and the two corners read together as agreed or split. Owns the band-separation row. | This dispatch |
| `src/dev/seriesSummary.ts` | Changed | Gains the five-number summary, because the file's concept is what a series reduces to. `meanOf` stays for its existing callers and the batch report never calls it. | This dispatch |
| `src/dev/readings/offerChoices.ts` | New | Take-by-slot split by site, and the count of offers banked while one stood. | This dispatch |
| `src/dev/readings/dropLedger.ts` | Changed | The five ends keyed by weapon line beside the five totals. The one reading this step widens. | This dispatch |
| `src/dev/readings/wakingSwallows.ts` | New | The swallows inside the Waking's span, which is the one-hand form of the Waking's property (the record's section 4, amended 2026-09-09). | This dispatch |
| `src/dev/readings/gravePath.ts` | Changed | Floor visits and recoveries beside the size series, which is the spiral-versus-comeback split's mechanism. | This dispatch |
| `src/dev/readings/readings.ts` | Changed | Registers `offerChoices` and `wakingSwallows` in the four places the graph is declared (`readings.ts:78-92`, `:94-109`, `:117-133`, `:144-159`, `:166-181`). | This dispatch |
| `src/dev/replayTallies.ts` | Changed | `mobFireAlivePerTick` beside `mobsAlivePerTick`, which is the half of #39's airborne figure a headless tape has no reading of. The storm's half is `fieldPerLine`'s and already exists. | This dispatch |
| `src/dev/measure.ts` | Changed | `mobFireAlivePerTick` on `Metrics`; the policy on `Provenance`; the policy exclusion beside the device's. | This dispatch |
| `src/dev/compareRuns.ts` | Changed | Declares a comparison meaning for every new reading, or `comparisonDeclared.test.ts` stays red. | This dispatch |
| `src/game/rng.ts` | Changed | `stream`'s name parameter widens to a string. `StreamName` and `RunState.streams` are untouched. | This dispatch |
| `src/game/offer.ts` | Changed | `standOffer` takes the site; `resolveOffer` reports the slot it already computes. No rule moves. | This dispatch |
| `src/game/events.ts` | Changed | `OfferOpened.site` and `OfferTaken.slot`. Not on the wire, not folded. | This dispatch |
| `src/tape/tape.ts`, `records.ts`, `segments.ts`, `wireCodes.ts` | Changed | The `policy` field in the positional header, `FORMAT_VERSION` 3, and the two reserved names `PERSON_POLICY` and `SCRIPT_POLICY` beside `TAPE_INPUT_DEVICES`, so `src/dev` reads them without crossing its fence. | This dispatch |
| `src/app/tapeHeader.ts` | Changed | Writes `PERSON_POLICY`, imported from `src/tape/tape.ts`, at the one site that builds a person's header. The only file under `src/app` this step touches. | This dispatch |
| `scripts/record-conditioned.ts` | Changed | Writes `SCRIPT_POLICY` in its own header literal. Its steering is untouched. | This dispatch |
| `scripts/batch.ts` | New | The batch runner's shell: arguments, the commit hash, the tapes and the report on disk, the folder path on stdout. | This dispatch |
| `CONTEXT.md` | Changed | Six glossary entries, each landing in the same commit as the word enters the code: Configuration, Rig, Sharp hand and sloppy hand with slice 1; Batch with slice 4b; Dexterity error and Strategy error with slice 5. The Playing harness entry's verb list (`:201`) is restated with the belch in slice 1, beside ADR 0053's amendment. | This dispatch |
| `docs/design/game-concept.md` | Changed | The V1 line's verb list (`:11`) gains the belch in slice 1, with a citation to ADR 0053's amendment and a dated note that the widening is the session's commitment under review, because the line is Mark's own restated wording and is not silently rewritten. | This dispatch |
| `docs/adr/0053-*.md` | Changed | Amended in place with the verb list widened to include the belch, dated, in the what-stood, what-it-replaced, what-it-could-not-have-known form. Mark reviews on the branch. | This dispatch |
| `docs/adr/0056-*.md` | Changed | Amended in place: the budget is pinned to the build and never travels in the header, with the trigger that would reopen it, so the "left open as design work" line loses that item. | This dispatch |
| `src/app/tapeStore.ts`, `src/app/storeRecording.ts` | **Not built** | ADR 0057 says the store tells a person's run from a harness run by the author, the input device and the policy. `RunSummaryValues` carries the device and not the policy, and adding a column is a migration on a provisioned database. **Unowned, with a trigger:** step 6 (#100). The tape bytes carry the policy today, so step 6's ingest reads it from the header rather than needing this step to have written a column. | **Unowned, #100 owns it** |
| The stripped-rung take rate by line | **Not built** | ADR 0055 rules it a number to read rather than a bug, and the report is where it lands. There is no stripped-rung body to read yet. **Unowned, with a trigger:** step 5 (#99). When it lands, a rung body that is a drop-kind corpse carrying a line falls into the widened drop ledger with no edit here; a rung body of another kind needs a row, and that is #99's to notice. | **Unowned, #99 owns it** |
| The dev-only autopilot in the rendered game | **Not built** | ADR 0013 makes the same bot the dev-only autopilot in the rendered app, and `bot.ts:38-41` records that it is not wired in and that the tracer plan puts it at the tuning dispatch behind the input-model fence. **Unowned, with a trigger:** step 4 (#39), if the tuning pass wants to watch a hand play. | **Unowned, trigger recorded** |
| The named persona roster | **Not built** | ADR 0053 holds it until friends' tapes exist to point the weights at. **Unowned, off the road.** | **Unowned, off the road** |
| A committed fixture tape | **Not built** | #109 records its absence. This step's bump is exactly when a fixture tape would have had to be regenerated, and there is none, which is part of what makes the bump cheap. **Unowned, #109 owns it.** | **Unowned, #109 owns it** |
| The director's budget in the header | **Not built** | Closed rather than deferred: ADR 0056's open question is answered in this step's amendment, and the answer is that it takes no field. | This dispatch (as a record, not as code) |

**Where the rows live.** The nine configuration rows live in `configurations.ts` and nowhere else; the tick budget's slack lives in `harnessRun.ts` beside the derivation it scales; the batch size lives in `batchReport.ts` beside the batch's identity; the band separation lives in `compareBatches.ts` beside the direction it decides. Nothing outside a module indexes another's rows, and no row is keyed by weapon line, because a configuration is a hand and not a weapon. What is keyed by line is every number the report prints.

**No module in the harness names a weapon line.** The standing extensibility constraint (`path-draft.md:21`) binds here: the hand walks to a body by distance and entity id, the report keys by whatever lines the run's own roster named (`measure.ts`'s `linesInRun`, `readings.ts:117-133`), and a fifth line needs no edit in `src/dev`. Fences 76 and 77 hold it.

---

## 6. Planned test list

Every test is written as a `test.todo` placeholder against a stub before implementation. Spec tests first, each naming the ADR or the record sentence it pins.

### Spec tests from the ADRs and the record

**`src/dev/__tests__/harnessPolicy.test.ts`**

1. *The hand walks to the live offer's nearest body, ties broken by the lower entity id.* Pins ADR 0053's open question as the record's section 2 closes it, and holds the hand's rule against `chooseOfferBody`'s (`offer.ts:231-248`) so the two cannot drift: the body the hand steers at is the body the sim hands it.
2. *With no offer standing, the hand walks to the nearest food.* Pins ADR 0053's "feeds". The record's section 1 is why this is not `dodgePolicy` plus an offer: `dodgePolicy` drifts home and never targets food.
3. *With no offer and no food on the field, the hand drifts to the starting mark.* The third clause of the rule.
4. *The hand prefers a standing offer's body to a nearer ordinary corpse.* Pins the record's section 2 reason: a drop never decays and a corpse does, so a hand that preferred the nearer body would take offers by accident, and #98's first acceptance line asks for runs that reach levelled builds.
5. *The hand belches when the reservoir is at capacity and the configuration's own count of shots is live.* Pins ADR 0042's two-sided Wall property through the record's section 1 commitment, and #37's story 12 by making a belching hand exist at all.
6. *The hand belches on no other condition.* The deliberate-absence half: neither knob touches the belch, so a sloppy hand belches exactly as well as a sharp one, which the record states rather than hides.
7. *A run under the harness hand reaches a levelled build.* Pins #98's first acceptance line and ADR 0034: a harness-rig run over the pinned seeds ends above the birthright and produces `weaponLeveled` events.
8. *The hand decides which body to take from positions and entity ids alone.* Pins `path-draft.md:21`'s standing constraint from the policy's side: the decision never reads `state.levels`.
9. *With both knobs at their sharp values, the hand is the base policy.* Pins ADR 0053's "one policy over many seeds, and only then the same policy wearing two error knobs": the nine are one policy and not nine.
10. *A held command is repeated for the drawn number of ticks and then re-decided.* Pins ADR 0053's dexterity error and the record's section 3.
11. *A shorter look-ahead keeps the near samples and loses the far ones.* Pins ADR 0053's strategy error and `bot.ts:73-78`'s own argument that a policy sampling only the horizon cannot see a threat that passes through and is gone.
12. *No configuration reads more of the field or decides more often than the sharp corner.* Pins the record's section 3: both knobs cost the hand something rather than granting it something, which is Talakat's construction and the reason a sharp corner is the baseline.
13. *One seed twice under a sloppy configuration is one run.* Pins ADR 0053's determinism condition. It runs under `shaky-short` on purpose: the sharp corner draws nothing, so this test under the sharp hand would pass on a harness whose stream was wired wrong.
14. *The sharp corner draws nothing.* The other half of test 13's reason, held as its own promise so the reason survives.
15. *The hand's draws never move the run's own streams.* Pins ADR 0019 and hand-forward (f): the run's five cursors are identical whether the hand drew or not, which is what keeps the witness out of this.

**`src/dev/__tests__/configurations.test.ts`**

16. *Nine configurations exist, each named as a hand word and a head word.* Pins ADR 0053's "a small set of named configurations from a sharp hand to a sloppy one" and the record's section 3: a name is a plain word pair a person can say, never a number.
17. *No configuration is named `person` or `script`.* Pins the record's section 5: the set the game writes and the set the harness writes are disjoint by construction, which is how a bot run can never be mistaken for a person's.
18. *The sharp hand is `steady-far` and the sloppy hand is `shaky-short`.* Pins the two corners a finding has to agree across (ADR 0053) and the two the done line names.

**`src/game/__tests__/offer.test.ts`** (extended)

19. *An offer says whether it stood where a carrier died or came out of the bank.* Pins #98's second comment: `openBanked` opens at the grave's own x, so a still grave is handed the middle body, and the reading has to exist before anyone argues about the site.
20. *A take says which of the offer's bodies went in.* The other half of the same reading, recorded where the sim already knows it.
21. *An offer paid while one stands banks rather than opening.* Pins ADR 0034's "exactly one offer is live at a time" and decision 9's corner, which is #98's last acceptance line. Already true in the sim (`offer.ts:207-213`); the test is here because the harness is what will walk it.

**`src/dev/readings/__tests__/offerChoices.test.ts`**

22. *Take-by-slot is split between banked offers and death-point offers.* Pins #98's second comment as a reading the report carries.
23. *Offers banked while one stood are counted.* Pins decision 9's corner, and the record's ruling that a batch-wide zero is a finding to report and not a bug.
24. *A lost offer records no slot and is not counted as a take.* The deliberate-absence guard: an offer nobody dived for and an offer taken mean opposite things to an instrument, which is the same reason `offerLost` is a separate event from `carrierLost`.

**`src/dev/readings/__tests__/dropLedger.test.ts`** (extended)

25. *Every body that carried an option is accounted for under its own line.* Pins `path-draft.md:21` and #98's "every number in the report is broken out by weapon line".
26. *A body carrying no option is in the totals and under no line.* Pins ADR 0034's nothing-offerable branch, so the per-line sums not matching the totals is a stated fact rather than a defect somebody later reads as one.

**`src/tape/__tests__/codec.test.ts` and `segments.test.ts`** (extended)

27. *The header names the policy that steered, beside the input device.* Pins ADR 0053: "The header gains one field naming which policy steered, beside the existing input device, so a bot run is never mistaken for a person's."
28. *The policy is a name string and never a code byte.* Pins ADR 0043's positional-list-over-an-open-set mistake, which ADR 0053 names outright.
29. *The header records a resolved policy and never an absence.* Pins ADR 0027: every header value is the value the run actually started from.
30. *A format version 2 tape is refused with a format-version error rather than decoded.* Pins ADR 0018's refusal contract and ADR 0043's accepted cost, and it is the mechanical form of verification step 7.

**`src/app/__tests__/tapeHeader.test.ts`** (new file)

31. *A person's run records `person`.* Pins ADR 0053's "never mistaken for a person's" from the game's side. This is the first test `tapeHeader.ts` has ever had, and the module's own comment says it was split in two so the header would be testable without a browser (`tapeHeader.ts:29-36`).

**`src/dev/__tests__/measure.test.ts`** (extended, spec)

32. *A run whose policy is not the person's is excluded from default aggregates.* Pins ADR 0019's rule that aggregates exclude poor evidence by default, and closes the record's section 5 finding that the device field alone is not currently enough: nothing in production writes `bot`, so a scripted wander and a full dodge-bot run are the same header value today.

**`src/game/__tests__/rng.test.ts`** (extended)

33. *The overlap search covers every stream a run holds and the hand's beside them.* Pins ADR 0012 and closes #113: the test's own comment says it is written so that adding a fifth colliding stream name fails loudly (`rng.test.ts:33-35`), and the fifth was added and the list was not. **The list is derived and never hand-kept** (amended 2026-09-09 after the tech architecture gate): `NAMES` is `Object.keys(createRun(0).streams)` plus `HAND_STREAM`, because `StreamName` is a type and nothing at runtime can be closed over a type, and #113 accepts no hand-kept list. `createRun` is already imported in that file.
34. *The same seed and a name outside the run's own union give the same sequence twice.* Pins ADR 0012's determinism for the widened parameter, so the hand's stream is a stream on the same terms as the run's.

**`src/game/__tests__/witness.test.ts`** (extended)

35. *The run holds exactly its own streams and the witness folds exactly those.* Pins ADR 0019's closed field list and hand-forward (f): `WITNESS_VERSION` is 6 and the harness's stream is outside `RunState`, so the sim never learns the bot exists.

**`src/dev/__tests__/batchReport.test.ts`**

36. *A batch is one run per seed over a seed range under one configuration.* Pins ADR 0053: "A deterministic policy needs exactly one run per seed, so batch size is seeds and never repeats."
37. *Every reading is reported as a five-number summary and never as a mean.* Pins ADR 0053: "A batch reports a distribution rather than a mean, because the interesting runs are in a tail."
38. *The seeds that produced the minimum and the maximum are named beside them.* Pins the record's section 4: at 48 seeds the top five per cent is two runs, so a band drawn over two runs would dress two numbers as a distribution, and a named seed is a whole run somebody can re-record and watch.
39. *Every reading keyed by weapon line in a run is keyed by weapon line in the batch.* Pins #98's acceptance line and `path-draft.md:21`.
40. *The report names the runs whose tapes did not verify rather than dropping them.* Pins ADR 0019: a tape that cannot prove itself reports nothing rather than reporting wrongly, and a batch that silently shrank would be a batch whose size is no longer its seed count.
41. *No number in the report is stated as a target.* Pins ADR 0053: "this build against that build, this configuration against that one, never this number against a target."

**`src/dev/__tests__/compareBatches.test.ts`**

42. *Two batches compare as one ordering per reading, up, down or flat.* Pins ADR 0053's comparisons.
43. *A direction is flat unless the quartile bands clear each other by the stated separation, and the separation is a data row.* Pins the standing no-arithmetic-as-rules rule: a number that must exist before it can be measured is data rather than a compiled constant.
44. *A finding reads agreed only where the sharp and the sloppy corners show the same direction, and split otherwise, carrying both directions.* Pins ADR 0053: "a finding is believed when the sharp and the sloppy configurations agree on the ordering."

**`src/dev/__tests__/harnessRun.test.ts`**

45. *A harness run's tape replays and attests exactly as a person's does.* Pins ADR 0019 and ADR 0033 and #98's acceptance line: decode the bytes, recompute the fold at the checkpoints, and `measure` answers verified rather than a divergence or a refusal.

### Module tests

**`src/dev/__tests__/harnessPolicy.test.ts`**

46. A body that is not alive is never the hand's target.
47. The hand takes the roomiest move it can find rather than driving through bodies to reach a body.
48. The clearance the hand settles for is the configuration's own row and not a constant in the module.
49. A hold that expires re-decides on that same tick rather than on the next one.
50. A hold bound of zero re-decides every tick and touches the stream not at all.
51. The stream is made from the run's seed and `HAND_STREAM`, so one seed holds the same sequence whichever configuration draws from it, and two seeds hold different ones. (Rewritten 2026-09-09 after the tech architecture gate: the earlier promise wanted two configurations on one seed to hold different sequences, which is false by construction under one stream name, and a coder making it true would have built nine names whose collisions nobody measured.)

**`src/dev/__tests__/configurations.test.ts`**

52. Every configuration names a hold bound, a sample list, a belch threshold and a clearance, with no optional field anywhere.
53. Each shorter sample list is a prefix of the longer one, so a shorter head loses the far samples and keeps the near ones rather than thinning throughout.
54. Every configuration name resolves through the parse and an unknown name does not.

**`src/dev/__tests__/harnessRun.test.ts`**

55. The tick budget is derived from the stage's own rows rather than written down, so re-authoring a phase moves it.
56. The header carries the configuration's name, the bot device, and the resolved starting size, levels and roster.
57. A run that ends before its budget seals with its ending rather than as quit.
58. The bytes a run returns decode into a tape whose header is the one it was given.

**`src/dev/__tests__/batchReport.test.ts`**

59. The five numbers over an odd count and over an even count, against a series worked out by hand.
60. A batch with no verified run reports nothing rather than reporting zeroes.
61. Each phase's span is reported as a spread, so ADR 0049's clock reads as a distribution rather than as one run's length.
62. Endings, stops and the reach are counted rather than spread, because a name has no quartile.
63. A batch whose tapes name two commits names both in its identity.

**`src/dev/__tests__/seriesSummary.test.ts`** (new file)

64. The five-number summary of a known series, including the single-value case and the empty one.

**`src/dev/__tests__/measure.test.ts`** (extended)

65. Mob fire alive per tick starts at the empty field and follows `state.mobFire`, index by index, the way the mob series does, and the storm's own per-line series is `fieldPerLine`'s and is not re-counted here.
66. A verified report carries the policy on its provenance beside the input device.

**`src/dev/__tests__/compareBatches.test.ts`**

67. A reading one batch carries and the other does not is reported as incomparable rather than as flat.
68. Two identical batches compare as flat on every row.

**`src/tape/__tests__/codec.test.ts`** (extended)

69. A header written and read back is unchanged in every field, the policy included, for a name carrying multibyte characters.

**`scripts/__tests__/batch.test.ts`** (new file)

70. The command refuses an unknown configuration, a seed outside the range and a count below one, each by name, and writes nothing.
71. The command writes one tape per seed and one report beside them, and prints the folder path as the whole of stdout.

**`src/dev/readings/__tests__/offerChoices.test.ts`**

72. A run with no offer reports an empty list rather than an absent one.
73. Two offers in one run are two rows in tick order.

**`src/dev/readings/__tests__/dropLedger.test.ts`** (extended)

74. For every line, the four terminal counts add up to that line's spawned, which is the ledger's own check on itself carried down to the line.

**`src/dev/__tests__/bot.test.ts`** (extended)

75. The six existing policies are unchanged with the look-ahead passed rather than read: every figure this file pins holds. This is the mechanical form of the record's section 1 reason for not editing `dodgePolicy` in place, and it is what keeps every reading in the tree meaning what it meant.

### Invariants and the architecture fence

**`src/__tests__/lineAgnosticPolicies.test.ts`** (extended)

76. `dev/harnessPolicy.ts` and `dev/configurations.ts` name no weapon line: both join `POLICY_MODULES` (`:79-83`), so the standing extensibility constraint covers the harness the way it already covers `dev/bot.ts`, `game/offer.ts` and `game/carriers.ts`.
77. No configuration name is a weapon line name, so a configuration written into a tape header can never be read back as a line.

**`src/__tests__/boundary.test.ts`** (existing, must stay green)

78. Every new module under `src/dev` reaches only `dev`, `game` and `tape` and imports no package (`:69-74`), which is the mechanical proof that the harness's logic never touches `node:fs` and that the filesystem stays in the shell.

**`src/dev/__tests__/comparisonDeclared.test.ts`** (existing, must stay green)

79. Every new reading on a verified report declares what comparing it means. The walk reaches every leaf (`:69-85`), so `offerChoices`, `wakingSwallows`, the widened drop ledger, `gravePath`'s floor visits and `mobFireAlivePerTick` each need an entry in `READING_COMPARISONS` or this goes red.

**`src/dev/__tests__/batchReadingDeclared.test.ts`** (new, cross-cutting)

80. Every reading on a verified report declares how a batch reduces it, so a reading nobody declared is named rather than silently dropped from the report. Its own file and named for the behaviour it guards, because it spans the whole report rather than any one reading, which is the shape `comparisonDeclared.test.ts:1-9` already states for its own guard.

**`src/dev/__tests__/harnessStatesNoTarget.test.ts`** (new, cross-cutting)

81. Nothing the report or the comparison produces is a verdict: no leaf of a `BatchReport` or a `BatchComparison` is a boolean, and no reading is compared against a literal anywhere in `batchReport.ts` or `compareBatches.ts`. The mechanical form of ADR 0053's comparisons-never-thresholds, and the deliberate-absence guard for the thing this whole step exists not to do.

**`src/game/__tests__/witness.test.ts`** (existing, must stay green)

82. `WITNESS_VERSION` is 6 and `RunState.streams` gains no member, so the harness's own stream stays outside the fold. Hand-forward (f) says the version must not move again, and this is what says it did not.

### Added 2026-09-09, after the three gates

Numbered after 82 so every number already written into a slice prompt keeps its meaning. Each one exists because the game design gate found a promised reading with no mechanism (the record's section 4, amended).

**`src/dev/readings/__tests__/wakingSwallows.test.ts`** (new file)

83. *(Spec.)* *The swallows inside the Waking's span are counted, under one hand.* Pins the record's section 4 as amended: the Waking's property was promised as the committing and waiting corpse counts, which is two hands compared, and a batch runs one hand at a time. The reading is the `swallowed` events between `setPieceOpened` and `setPieceClosed`.
84. *(Module.)* A run that never opened the Waking reports no span rather than a count of zero, on the same terms as every other reading whose absence means the recording cannot support it.

**`src/dev/readings/__tests__/gravePath.test.ts`** (extended)

85. *(Module.)* A crossing down to `SIZE_FLOOR` is counted as a visit, and a climb back above it is counted beside it, so the spiral-versus-comeback split reads what followed a visit and not only that one happened.

**`src/dev/__tests__/batchReport.test.ts`** (extended)

86. *(Module.)* The grave's size spread prints beside the mob widths the build fields, so grave-to-mob scale is a ratio the reader takes and never a number the report states.

**Counts: 46 spec tests, 33 module tests, 7 fence and cross-cutting guards. 86 in all.**

---

## 7. Constants changed, with every reader

Each list is the full grep across `src` and `scripts`, excluding `src/prototypes/` (the prototype boundary, ADR 0010).

**`FORMAT_VERSION` (`wireCodes.ts:28`): 2 becomes 3.**
Readers: `wireCodes.ts:162` (its export); `segments.ts:37,213,221`; `decode.ts:36,189,191`; and in tests `segments.test.ts:21,131,143`; `codec.test.ts:22,148,405,497,504`; `verificationReadback.test.ts:283`; `tapeStore.test.ts:3`.
**`codec.test.ts:504` pins the literal 2** (`expect(FORMAT_VERSION).toBe(2)`) inside the test that a version 1 tape is refused. That test becomes the version 2 refusal at version 3, and the literal moves with it. The comments at `segments.test.ts:131`, `codec.test.ts:148` and `verificationReadback.test.ts:283` describe sealed version 1 tapes outside the tree; they are prose about a version two steps back now, and each gains one clause rather than being deleted, because what they explain is why a guard exists.
**The blast radius outside the constant is the header literal**, not the number: fourteen files build a `TapeHeader` and every one of them gains `policy`, and the typecheck finds them all. They are `scripts/record-conditioned.ts:139-158`; `src/app/tapeHeader.ts:70-92`; and the test files `scripts/__tests__/measure.test.ts:32-45`, `src/app/__tests__/RunsScreen.test.ts` (three literals, `:105`, `:131`, `:198`), `src/app/__tests__/storeRecording.test.ts:38`, `src/app/__tests__/tapeStore.test.ts:42`, `src/app/screens/__tests__/ReplayScreen.test.ts:77`, `src/app/screens/__tests__/tapePlaybackSession.test.ts:42`, `src/dev/__tests__/compareRuns.test.ts:58`, `src/dev/__tests__/comparisonDeclared.test.ts:42`, `src/dev/__tests__/measure.test.ts:63`, `src/tape/__tests__/codec.test.ts:36`, `src/tape/__tests__/playback.test.ts:39`, `src/tape/__tests__/recorder.test.ts:47`, `src/tape/__tests__/segments.test.ts:35`, `src/tape/__tests__/startingLevels.test.ts:20`, `src/tape/__tests__/verificationReadback.test.ts:47`. That is why verification step 5, the test-name diff, is mandatory on the header slice.
The two files under `local/` that build one (`slice13b-record.ts:36-53`, `step2/slice11-timeline.ts:63`) are outside version control, outside eslint (`eslint.config.mjs:59`) and outside `tsconfig.json`'s `include`, so the typecheck will not find them and they simply stop working. That is what `local/` is for and it needs no fix.

**`LOOKAHEAD_SAMPLES` (`bot.ts:79`): unchanged in value, no longer read inside `scoreMove`.**
Readers: `bot.ts:80` (through `LOOKAHEAD_TICKS`), `bot.ts:201` (the loop, which becomes the parameter). After the change its readers are the three policy call sites (`bot.ts:227`, `:411`, `:429`) and the test that holds the six policies unchanged (module test 75). It gains an export.

**`LOOKAHEAD_TICKS` (`bot.ts:80`): deleted.**
Readers: `bot.ts:207`, which reads the last element of the list it was passed instead.

**`BELCH_WORTH_IT` (`bot.ts:274`): unchanged, and copied as a row.**
Readers: `bot.ts:289` only. The harness's own threshold is `Configuration.belchWorthIt` with the same initial value of 8, in `configurations.ts`. Two owners on purpose: `belchingPolicy` carries ADR 0042's Wall property and its number must not move when the tuning pass moves the harness's.

**`COMMITTING_CLEARANCE` (`bot.ts:393`) and `ENOUGH_CLEARANCE` (`bot.ts:86`): unchanged, and copied as a row.**
Readers: `bot.ts:411` and `bot.ts:227,429` respectively. The harness's own is `Configuration.enoughClearance`, initial 12, which is `COMMITTING_CLEARANCE`'s value for the reason `bot.ts:381-392` already measures out loud: above the cap two moves tie on room and the wanting decides, so a hand holding out for 60 never reaches anything inside a swarm.

**`StreamName` (`rng.ts:4`): unchanged. `stream`'s parameter widens.**
Readers of the type: `witness.ts` (`STREAM_ORDER`), `run.ts:21,108`, `rng.ts:71,121`, `rng.test.ts:9,12,14`. Only `rng.ts:71` changes, from `StreamName` to `string`. `rng.test.ts:12`'s `NAMES` list changes separately, from four hand-written names to every member of the union plus `hand`, which is #113.

**`WITNESS_VERSION` (`witness.ts`, cited by content): does not move, and this step must prove it.**
Readers: `tapeHeader.ts:6,81`, `record-conditioned.ts:24,147`, `recorder.ts` (through the header it is handed), and every test header literal above. Guard 82 is the proof.

**`READINGS_VERSION` (`src/dev/readingsVersion.ts:28`, beside `measure.ts` and not inside `readings/`): does not move.**
Readers: `measure.ts:27,275`, `compareRuns.ts` (declared as a descriptive reading at `:293`). Its own rule at `readingsVersion.ts:13-16` is that adding a reading beside unchanged ones does not bump it, and every figure the drop ledger already printed means exactly what it meant. Stated here rather than left implicit, because a bump would make every step 2 reading incomparable with every step 3 one for no reason.

**The hold bounds, `steady` 0, `loose` 15 and `shaky` 36 ticks: new rows, initial** (set 2026-09-09 after the game design gate, which found 6 and 12 too sharp to make a sloppy corner).
Readers: the nine rows in `configurations.ts` and nothing else; the hold is drawn against the row inside `harnessPolicy.ts` and no other module reads a bound. Nothing in `bot.ts` reads them, because the six policies have no memory to hold a command in. The arithmetic behind them is the record's section 3: a mob shot covers 1.83 units a tick (`mobs.ts:86`) against the grave's 4.5 (`tuning.ts:18`) and a 27-unit width (`tuning.ts:58`).

**`BATCH_SEEDS`: new, 48, initial.**
The floor is 40, because both published correlations that found the tail most predictive read it at the top five per cent, and below 40 seeds the top five per cent is a single run, which is an outlier rather than a tail. Its only reader is `scripts/batch.ts`'s default, and the command takes a count so the row is overridable per run.

**`RUN_TICK_SLACK`: new, 3, initial.**
It scales a budget derived from `PHASES` the way `bot.test.ts:355` scales `STAGE_TICKS`, and its reason is written there: a maxed dodger crosses the whole stage in 22000 to 48000 ticks against the 27000 the rows alone bound, and the spread is the fight. It is a budget above the worst case and never a prediction of any run.

**`BAND_SEPARATION`: new, 0, initial.**
Zero means bands that merely fail to overlap. It is the weakest honest default and it is data rather than a compiled constant because it is a number that has to exist before it can be measured; verification step 12 is where the first two batches replace it.

---

## 8. Craft calls, each backed by evidence

The full argument for each is in `playing-harness.md`; what is here is the call, its evidence in one line, and the record's section.

**The hand is a seventh policy beside the six rather than an edit of `dodgePolicy`.** Record section 1: editing in place would move every figure the six have produced, which is #107's banding failure at the scale of the whole suite, and the sentence it would sit on describes a hand that never feeds.

**The hand belches, on `belchingPolicy`'s rule with the threshold as a row.** Record sections 1 and 12: without it, story 12 stays open past step 4 and `belchCadence` reports an empty fire list on every run of every batch. It widens ADR 0053's verb list, which is why it is section 9's as well.

**It walks to the nearest body, ties to the lower entity id.** Record section 2: it is `chooseOfferBody`'s own rule, and a lowest-level rule would make Mega Crit's pick-rate metric read the rule rather than the game, 1.0 for whichever line is behind on every offer of every seed.

**Take-by-slot is a reading and never a rule.** Record section 2, #98's second comment: under a nearest-body hand the slot taken is a fact about where the grave was, which is exactly informative; under a lowest-level hand it would have been noise.

**The dexterity error is a uniform draw and not a Gaussian, a stated departure from decision 17.** Record section 3: Box-Muller needs `Math.log` and `Math.cos`, which are the transcendentals ADR 0015 makes the project round by hand, where `Stream.nextInt` is integer-only rejection sampling already in the tree (`rng.ts:97-113`). ADR 0053 itself says only "a drawn number of ticks", so this departs from decision 17's wording and not from the ruling. If the lost tail matters, the next move is a triangular draw and not a transcendental.

**The strategy error shortens from the far end.** Record section 3, and `bot.ts:73-78`'s own argument: the near samples exist because a threat that passes through the grave and is gone by the far sample is the one a horizon-only policy cannot see at all.

**Nine rows written out, keyed by name, with no arithmetic between them.** Record section 3. It costs the belch threshold and the clearance being repeated nine times and it buys a tuning pass that moves one hand without moving eight others.

**The hand's stream is named `hand`, made in `src/dev`, held outside `RunState`.** Record section 3: a sixth stream inside the run would put the bot's dice in the shipped simulation and land on `WITNESS_VERSION`, which hand-forward (f) pins at 6. The record measured the collision rather than assuming it: at seed 77 over a hundred thousand draws and all fifteen ordered pairs of the six names, no stream repeats another's opening eight draws at any offset.

**Batch size is 48 seeds, and it is seeds and never repeats.** Record section 4, ADR 0053, and the top-five-per-cent floor of 40.

**Every reading prints as five numbers with the extreme seeds named.** Record section 4: at 48 seeds a percentile band would be drawn over two runs, and a named seed is a whole run somebody can re-record and watch.

**A finding reads agreed only where the two corners show the same direction.** Record section 4, ADR 0053, and Borovikov's cross-check used as the report's own grammar.

**The header field is `policy`, a name string, and a person's run records `person`.** Record section 5, ADR 0043, ADR 0027. The second guard, the aggregate exclusion, is doing real work because nothing in production writes `inputDevice: 'bot'` today.

**The bump is taken once and carries one field, because the director's budget is build-pinned.** Record section 5 as amended 2026-09-09: the budget is authored stage content and no URL pins it and no seed draws it, so ADR 0027 does not reach it. **There is no budget column on `Phase` today** (`stage.ts:48-78` carries `directed`, the two ceilings, `music`, `boss` and `bankOpens`), so the call rests on ADR 0056's wording and on the shape step 4 will author; if step 4 makes the budget a value a run resolves, the call reverses and a second bump is taken, still before ADR 0057's store starts filling. The trigger that reopens it is named: the day the budget becomes something a run resolves.

**Five rigs, one name each, and the harness rig is the only one that starts at the birthright.** Record section 6, #107. Two of the five write no tape and their figures live only in prose, which is a limitation of those two and not something this step fixes.

**The hand's own rows are never tuned with the game's** (added 2026-09-09 after the game design gate; the record's section 8). Step 4 moves the game's rows and reads them through these hands, so a hand row moved between two batches would compare two builds through two instruments. A changed hand row is a new configuration with a new name, never a retune of an existing one, and every comparison holds the hand fixed. It binds the tuning pass rather than this step, and it is stated here because this is the plan that hands #39 the rows.

**Three calls this plan adds that the record's section 8 does not carry**, each an initial data row and each named here rather than discovered by a coder:

- **The batch runner's tick budget is derived from the stage rather than written down**, with a slack row of 3, copying `bot.test.ts:324-355`'s own derivation and its stated reason. The alternative, a compiled tick count, is exactly the arithmetic-as-rules the standing rule forbids.
- **The band separation ships at zero**, meaning bands that merely fail to overlap, because the number has to exist before the first batch can measure it.
- **The runner measures the bytes it wrote rather than the run it held**, which costs a second replay per run and buys a report that is a function of the tapes, which is what step 6 turns into a query (ADR 0057: nothing in the store is authoritative except the bytes).

**Two claims in the record found soft against the tree**, both restated from section 0 so a reader of this section alone sees them:

- **Half the airborne-projectile figure is not readable off a headless tape today.** The record's section 4 lists it among #39's four instruments the report carries. The storm's half already exists, per line and per tick, in `fieldPerLine` (`fieldPerLine.ts:24-31`, `:108`); mob fire's half is counted only inside `densityOf` (`replayTallies.ts:74-80`), which is sampled at expensive-frame ticks (`:158`), and a headless tape has no frame rows. This plan adds `mobFireAlivePerTick` beside `mobsAlivePerTick` to close it. **An earlier draft of this bullet had it backwards** and proposed counting `state.mobFire` as the figure itself, which is the one pool the figure excludes (`CONTEXT.md:73`: mob fire is never the storm); the tech architecture gate found it on 2026-09-09.
- **The record's batch-cost estimate is optimistic by about a factor of three.** It reads two seconds per stage length off `bot.test.ts:700`'s thirty-second budget for five runs, then bills a whole run at one stage length, where `MAXED_RUN_TICKS` is three (`bot.test.ts:355`). Nine configurations at 48 seeds is 432 runs, and the same budget puts that nearer three quarters of an hour than a quarter, before the measurement pass. Nothing in this step runs nine configurations; verification step 14 measures the real figure so step 4 plans against a number rather than an estimate.

---

## 9. Anything that would be a new commitment rather than a craft call

**1. The base policy belches, which widens ADR 0053's list of what the policy does.** ADR 0053 says it "moves, dodges, feeds and takes offers"; this makes it five verbs. Taken under the recommended default by the dispatching session on 2026-09-09 (the record's section 12), amended into ADR 0053 in place by slice 1, dated, in the what-stood, what-it-replaced, what-it-could-not-have-known form. What stood is the whole ruling; what changed is the verb list; what it could not have known is that #37's story 12 would still have no hand two steps later, which is #98's third comment. **Mark reviews it on the branch before merge.**

**2. The director's budget is pinned to the build and never travels in the tape header, which closes ADR 0056's own open question.** Taken under the recommended default (the record's section 12), amended into ADR 0056 in place by slice 3, the slice that spends the format version. ADR 0056's "left open as design work" line loses that item and gains the ruling with its trigger, and ADR 0053's "the bump is taken once" sentence is satisfied by one field rather than two. **The commitment rests on ADR 0056's wording and on step 4's unbuilt shape, not on a column anybody has read**: `Phase` carries no budget today (`stage.ts:48-78`), and a step 4 reversal costs a second bump which still lands before the store starts filling (added 2026-09-09 after the product vision gate). **Mark reviews it on the branch before merge.**

**3. Two new event payload fields, `OfferOpened.site` and `OfferTaken.slot`, which the record does not name.** This plan's own addition. It is not ADR-level: the event vocabulary is not on the wire (section 2), neither field is folded, and ADR 0034 already rules everything the fields describe. It is recorded here because the record's section 4 asked for take-by-slot as a reading and this is the mechanism, and because a reader who expected the reading to be derived from existing events should see that the derivation was considered and rejected for being sound only by accident.

**4. `stream`'s name parameter widens from `StreamName` to a string.** Also this plan's own. It is not ADR-level: ADR 0012 rules that a run's dice come from named seeded streams off the run's seed, and this changes who may ask for one rather than what a stream is. `StreamName` stays the closed union naming the streams a run holds, `RunState.streams` keeps its exact record type, and guard 82 holds both.

**5. `BATCH_READINGS`, the declared table saying how a batch reduces each reading, over the five reduction kinds `spread`, `perLine`, `count`, `peak` and `notReduced`.** A new public surface that step 4 reads, on the precedent of `READING_COMPARISONS` and its guard. Flagged rather than filed: it is the mechanism that makes #98's per-line acceptance line mechanical, its caller today is `batchReportOf`, and its cited future is #39. It is named in section 4 as needing review before dispatch.

**Nothing else here is a commitment.** `CONTEXT.md` gains six glossary entries and no ADR is filed for any of them: ADR 0053 already rules that the harness is one policy under two knobs over many seeds, and the words are the vocabulary for what it already rules.

---

## 10. Slices

Each slice is one commit: its tests, its minimal implementation, and its record amendment or glossary entry where the section above names one. Each ends green on `pnpm typecheck` and `pnpm vitest run` before the next begins. CodeRabbit CLI runs before each code commit, per the branch's standing rule. The test-name diff (verification step 5) runs on every slice, and `GOLDEN` must not move on any of them.

**A then B is the ordering ADR 0053 itself gives**, and it falls between slices 4b and 5: every A slice lands the hand, the readings, the header field, the runner and the report under the sharp corner alone, and only then does B put the two knobs on it. **A ships one configuration and not nine.** An earlier draft of this section landed all nine rows in slice 1 with the hold unread, which would have made eight of them silently identical to their head-only siblings until slice 5: a batch run under `shaky-short` would have been a batch under `steady-short` wearing another name, and its report would have said nothing about it. One row that is fully implemented is the honest A.

**Slice 0. Baselines.** Before any edit: capture `pnpm vitest list --json` to `local/step3/tests-baseline.txt`, and record two tapes at the tip with `record-conditioned.ts`, saved outside the repo. They are format version 2 and they are the input to verification step 7 after the bump. No commit.

**Slice 1. The hand.** `bot.ts`'s look-ahead becomes a parameter, `LOOKAHEAD_TICKS` retires, and `bestMoveToward`, `nearestFood` and `LOOKAHEAD_SAMPLES` are exported. `configurations.ts` lands with **one row, `steady-far`**, plus `SHARP_HAND`, `RESERVED_POLICIES` and the parse. **`PERSON_POLICY` and `SCRIPT_POLICY` are declared in `src/tape/tape.ts` here**, because `RESERVED_POLICIES` is built from them and `src/dev` may not reach `src/app` (added 2026-09-09 after the tech architecture gate); nothing writes them into a header until slice 3. `harnessPolicy.ts` lands with the three-clause wanting rule and the belch, and with no hold and no stream, so its signature here is `harnessPolicy(configuration)` and slice 5 widens it to take the seed (section 4; a `seed` nothing reads fails `noUnusedParameters`). Spec tests 1 to 9 and 17, module tests 46 to 48, 52, 54 and 75, and fences 76 to 78 land here. (Test 17 lands with the reserved names it guards; the plan as first written left 17 and 18 in no slice at all.) `CONTEXT.md` gains Configuration, Rig, and Sharp hand and sloppy hand. **ADR 0053 is amended in place here**, with the belch, because this is the slice that builds it, **and the same commit restates the two other places that say four verbs**: the glossary's Playing harness entry (`CONTEXT.md:201`) and the V1 line in the concept box (`game-concept.md:11`), each citing the amendment, the second carrying a dated note that the widening is the session's commitment under Mark's review because that line is his own restated wording.

**Spec test 7 reports as well as passes.** It plays the pinned seeds, so the slice's note carries the reach it saw on them beside the pass, which is the earliest reading of hand-forward (g): a birthright hand crossing a stage no birthright run has crossed is this step's riskiest assumption. A low sharp reach is a finding for #39 and never a reason to sharpen the hand or to change a row in this slice (added 2026-09-09 after the product vision gate).

**Test 12 is not in this slice and cannot be**, because it holds every configuration against the sharp corner and there is only one. It lands at slice 5 with the other eight. Tests 10, 11 and 13 to 15 are the knobs' own and land there too; test 16's nine names land there as well, and slice 1's version of it asserts one.

**Slice 2. The two event fields and the readings.** `OfferOpened.site` and `OfferTaken.slot` in `events.ts`, written at `standOffer`'s two callers and at `resolveOffer`; `offerChoices.ts` and `wakingSwallows.ts` registered in the readings graph; `dropLedger` widened by line; `gravePath` gains floor visits and recoveries; `mobFireAlivePerTick` in `replayTallies.ts` and on `Metrics`; the `READING_COMPARISONS` entries that keep `comparisonDeclared.test.ts` green. Spec tests 19 to 26 and 83, module tests 65, 72 to 74, 84 and 85, and guard 79 land here. **`GOLDEN` must not move and `READINGS_VERSION` must not move**; if either does, the slice is wrong.

**Slice 3. The header field, and the one bump.** `TapeHeader.policy`, the write and the read in the positional header, `FORMAT_VERSION` 3, `PERSON_POLICY` and `SCRIPT_POLICY`, declared in `src/tape/tape.ts` by slice 1, imported and written here by `tapeHeader.ts` and `record-conditioned.ts`, the policy on `Provenance` and in `exclusionsOf`, and every one of the fourteen header literals in section 7. Spec tests 27 to 32, module tests 66 and 69, land here. **Verification step 7, the old-tape decode check, runs here on slice 0's two tapes and its result goes in the note.** **ADR 0056 is amended in place here**, because this is the slice that spends the version and the amendment is what says why it spends it once.

**This is the slice with the largest blast radius and the smallest amount of thinking in it.** Fourteen files gain one field each and the typecheck finds all fourteen. The test-name diff matters more here than anywhere else in the step.

**Slice 4a. The runner.** `harnessRun.ts` with the derived tick budget and the harness rig's header, taking the commit hash and the recorded-at stamp as arguments; `scripts/batch.ts` taking the output root as its fourth argument and writing one tape per seed under `steady-far`, with no report at all. Spec test 45, module tests 55 to 58, 70 and 71 land here. The agent records a small batch, measures two of its tapes with `scripts/measure.ts` by hand, and puts both readings in the note: this is the first proof that a harness tape replays and attests as a person's does.

**Slice 4b. The report.** `fiveNumbersOf` in `seriesSummary.ts`; `batchReport.ts` with `BatchReduction`, `BATCH_READINGS` and `batchReportOf`, and the build's mob widths on the batch's identity; `scripts/batch.ts` gains `report.json`; guards 80 and 81. Spec tests 36 to 41, module tests 59 to 64 and 86, land here. `CONTEXT.md` gains Batch. **Verification step 10, the first 48-seed batch under the sharp corner, runs here and its table goes in the note.** **A ends here**, and at this point the harness plays, records, and reports, under one hand.

**Slices 4a and 4b are two slices and neither number moves.** As first drafted this was one slice carrying a runner, a report, a summary helper, a shell and a guard, plus a 48-seed batch to read, which is two coders' work and one commit.

**Slice 5. The two knobs.** The other eight configuration rows; the hold and the `hand` stream in `harnessPolicy.ts`, whose signature widens here to `harnessPolicy(configuration, seed)` and which the note records as a seam that moved; `stream`'s name parameter widened; `rng.test.ts`'s `NAMES` derived from `Object.keys(createRun(0).streams)` plus `HAND_STREAM`, which closes #113 with a list nobody keeps by hand. Spec tests 10 to 16, 18 and 33 to 35, module tests 49 to 51 and 53, and guard 82 land here. (Test 18 lands here because the sloppy corner exists only once the other eight rows do.) `CONTEXT.md` gains Dexterity error and Strategy error. **Verification step 9, the determinism run under `shaky-short`, runs here.** **B begins here.**

**Slice 6. The comparison, and the done line.** `compareBatches.ts` with the directions, the band separation row and the corner agreement. Spec tests 42 to 44 and module tests 67 and 68 land here. **Verification steps 11 and 12 run here**: 48 seeds under each corner, the two reach rates side by side, the comparison between them, and the agent's proposal for the separation row. The two reach rates go in the note and in the ticket, and **the agent does not judge them**: whether they are far enough apart is Mark's step 17.

**Slice 7. The fences and the full verification pass.** Every agent-actor verification step at the branch tip, each with its result in the note: the suite, typecheck, build, `pnpm verify` at the repo root, the test-name diff net of what earlier slices account for, `GOLDEN` unmoved, the old-tape refusal, the readback on a batch tape, the determinism re-run, the four fence files green by test title, and the measured batch cost split between playing and measuring. No production feature. If a fence fails, the fix is a production change and it is a finding, not a fence edit. The report names Mark's steps 15 to 18 as still open and says which of them the batch tables let him answer now.

**Nine slices in all: 0 through 7, with 4 in two halves. Eight commits, because slice 0 makes none.**

**One thing no slice does: retune.** Every magnitude in this step is an initial data row and step 4's tuning pass (#39) is what moves it. A slice that finds a number wrong records the finding and leaves the number, under the standing rule that a gate finding becomes a ticket unless it blocks the next slice or Mark's read.
