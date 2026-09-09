# Step 3 progress note: the playing harness (ticket #98)

One section per slice at the end, and the cross-slice facts first. Written by each slice's coder, appended to and never rewritten.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| 0, the baselines | none | No commit by design. Section 6 says what it produced and where. |
| 1, the hand | `66dfcea268` | `feat(hungry-grave): the harness hand feeds, takes offers and belches (#98)` |

## 2. GOLDEN moves

None, and none is allowed in this step.

Slice 1: `GOLDEN` (`digest.ts:314`) did not move, `WITNESS_VERSION` did not move from 6, and `READINGS_VERSION` did not move from 2. None of the three is touched by the diff, and `src/game/__tests__/digest.test.ts` is green, which is the mechanical form of the first. Nothing this slice changed is folded: the look-ahead is a parameter on a `src/dev` function, the two reserved policy names are declared and written nowhere, and the hand is a seventh policy no scenario runs.

## 3. CodeRabbit

Slice 1: `coderabbit review --agent --uncommitted` from the repo root over the staged work, twelve files reviewed, **one finding, minor, applied**.

- **Applied.** The glossary's new Configuration entry said "Nine of them exist", where one row ships until slice 5. It now reads "Nine are named", which is true today and stays true when the other eight land. CodeRabbit's own suggestion added the slice number to the entry; that half was declined, because a glossary entry carries the word and not the delivery state, and an entry naming a slice would need editing again the day that slice lands.

## 4. Plan claims found false against the tree

**1. Spec test 7's claim that a harness-rig run over the pinned seeds "ends above the birthright and produces `weaponLeveled` events" is false on three of the five seeds.** Plan section 6, test 7, and the record's section 7. Measured at `66dfcea268` under `steady-far` over the whole stage: seeds 101 and 404 open no offer at all, so nothing is ever taken and nothing levels; seed 202 takes one offer, levels one line and a hit strips it back (ADR 0003's ladder), so it ends where it started; seeds 303 and 505 end above the birthright. The cause is the stage and not the hand, and it is measured rather than argued: at the birthright the skull stream is the whole storm, so which mobs a run kills follows the lane it steers, and whether a carrier is among them is a fact about the seed. `dodgePolicy` is paid on four of these five and never on 505 (`NEVER_PAID` in `bot.test.ts`); this hand is paid on the other three. **The plan's intent was followed and its letter was not**: the test now pins what the policy owns, that an offer which stands is taken and pays a rung, plus the two measured seed sets as equalities in `bot.test.ts`'s own idiom, each with its cause written on it, so either set moving fires the test and names the seed. Nothing was sharpened and no row moved, per the plan's own instruction and the record's section 7 as amended. **It is #39's first tuning input** and it is the reading hand-forward (g) asks for.

**2. Plan section 4's `harnessPolicy.ts` seam names `HOME` as the hand's third clause while its `bot.ts` export list omits `HOME`.** Section 4's bot.ts block exports `runPolicy`, the six policies, `bestMoveToward`, `nearestFood` and `LOOKAHEAD_SAMPLES`, and `HOME` (`bot.ts:88`) is none of them. The hand cannot reach the starting mark without it, and declaring a second starting mark in `harnessPolicy.ts` would give one row two owners. **`HOME` is exported from `bot.ts` as well**, which is section 5 below.

**3. Plan section 4 declares `SLOPPY_HAND` and `CONFIGURATION_NAMES` on `configurations.ts` while section 10 ships one row.** `SLOPPY_HAND` would name `shaky-short`, a row that does not exist until slice 5, so it is not in this slice and test 18 is already assigned to slice 5 for that reason. `CONFIGURATION_NAMES` did land, because tests 54 and 77 both walk it.

## 5. Seams that moved

Slice 1:

- **`bot.ts` exports `HOME`**, beyond the plan's export list, for the reason in section 4 item 2. Its declaration and its comment are untouched.
- **`ConfigurationName` is the single-member union `'steady-far'` in this slice**, not the nine-name union plan section 4 prints. `CONFIGURATIONS` is `Readonly<Record<ConfigurationName, Configuration>>`, so a nine-name union over one row does not compile, and section 10's "A ships one configuration and not nine" is what the type says. **Slice 5 widens the union with the other eight rows**, in the same commit, and the type is the only thing that changes.
- **`harnessPolicy(configuration)` takes no seed**, which is plan section 4's own amendment of 2026-09-09 rather than a move. Slice 5 widens it.
- **`HAND_STREAM` is not in this slice.** Plan section 4's `harnessPolicy.ts` block declares it beside `harnessPolicy`; the stream lands at slice 5 and a name with no stream behind it and no reader is a constant nothing can go red about. **Slice 5 lands it**, and `rng.test.ts`'s derived `NAMES` (test 33, closing #113) is already assigned there.

## 6. The baseline tapes

Recorded at the branch tip `db428611d1` before any step 3 edit, saved under `apps/hungry-grave/local/step3/`, which is outside version control (`.gitignore:16`), outside eslint (`eslint.config.mjs:59`), outside prettier and outside `tsconfig.json`'s include. The slice prompt says "outside the repo"; step 2 put its own under `local/step2/` for the reason that matters here, which is that a session scratchpad does not survive to the slice that needs the file. **They are the input to verification step 7, the old-tape refusal, which slice 3 runs after the format bump.**

- `apps/hungry-grave/local/step3/baseline-a.tape`: seed 2093383922, 12000 ticks, the birthright only (`skullStream=1 territory=0 wisps=0 bell=0`). Format version 2. Measures `verified`, 1397 ticks, ending `sealed`, 24 checkpoints verified, integrity clean.
- `apps/hungry-grave/local/step3/baseline-b.tape`: the same seed and ticks, every line at level 5. Format version 2. Measures `verified`, 3447 ticks, ending `sealed`, 58 checkpoints verified, integrity clean.
- `apps/hungry-grave/local/step3/baseline-a.measure.txt` and `baseline-b.measure.txt`: `scripts/measure.ts` against each, recorded at the tip so slice 3 can compare the refusal against a reading that worked.

**The test-name baseline for verification step 5** is `apps/hungry-grave/local/step3/tests-baseline.txt`, a sorted `file :: name` list, one per line, beside `tests-baseline.json` (the raw `vitest list --json` array with the AssetPack log lines before it stripped so the file parses). **1670 tests, all unique, over 120 files.** `vitest list` does not report a `test.todo`, so the suite's own count runs ahead of this file by the number of todos standing.

## 7. Verification steps run

Slice 0: the step 5 and step 7 baselines recorded, see section 6. No commit.

Slice 1, from the plan's section 3:

- **Step 1, unit tests.** Green. 122 files, 1691 passed, 10 expected fail, 2 todo.
- **Step 2, `pnpm typecheck`.** Green.
- **Step 3, `pnpm build`.** Green, lint and typecheck included. Its warnings are the two standing ones, `@pixi/sound` statically imported alongside its dynamic import (#50) and the pixi chunk over 500 kB.
- **Step 4, `pnpm verify` at the repo root.** Green, exit 0, run from inside the worktree.
- **Step 5, the test-name diff.** `vitest list --json` against `local/step3/tests-baseline.txt`: **31 names added, none removed, none renamed.** Nine in `harnessPolicy.test.ts` plus five per-seed rows, four in `configurations.test.ts`, six in `bot.test.ts` under `the six policies steer on this module's own look-ahead`, and three in `lineAgnosticPolicies.test.ts` (the two new policy modules plus the configuration-name fence). 1670 to 1701.
- **Step 6, the golden digest.** Did not move. See section 2.
- **Step 13, the fences**, in the part this slice owns: `src/__tests__/lineAgnosticPolicies.test.ts` and `src/__tests__/boundary.test.ts` both green. `boundary.test.ts` needed no edit, which is the point of fence 78: `harnessPolicy.ts` and `configurations.ts` reach only `dev`, `game` and `tape` and import no package, so the row that already exists covers them.
- **Steps 7 to 12 and 14** belong to later slices and were not run. **Steps 15 to 18 are Mark's and stay open.**

## 8. Slice 1, the hand

The commit is `66dfcea268`. Thirty-one test names added across four files, none removed and none renamed: eighteen in `harnessPolicy.test.ts`, six in `bot.test.ts`, four in `configurations.test.ts` and three in `lineAgnosticPolicies.test.ts`.

**What landed.** `scoreMove` and `bestMoveToward` take the look-ahead samples as a parameter with no default; `LOOKAHEAD_TICKS` is gone and the settled point reads the last element of the list it was passed; the three existing call sites pass `LOOKAHEAD_SAMPLES` by name; `bot.ts` exports `bestMoveToward`, `nearestFood`, `HOME` and `LOOKAHEAD_SAMPLES`. `configurations.ts` lands with one row, `steady-far`, plus `CONFIGURATION_NAMES`, `SHARP_HAND`, `RESERVED_POLICIES` and `isConfigurationName`. `PERSON_POLICY` and `SCRIPT_POLICY` are declared in `src/tape/tape.ts` beside `TAPE_INPUT_DEVICES` and nothing writes either into a header yet. `harnessPolicy.ts` lands with the three-clause wanting rule, the belch on the row's own threshold, and no hold and no stream. ADR 0053 is amended in place with the fifth verb; the glossary's Playing harness entry and the concept box's V1 line are restated with a citation to that amendment, the second carrying a dated note that the widening is the session's commitment under Mark's review; `CONTEXT.md` gains Configuration, Sharp hand and sloppy hand, and Rig.

**Spec test 7's reading, which the slice prompt asks for beside the pass.** The sharp hand over the five pinned seeds, whole stage, budget 27859 ticks:

| Seed | Ticks | Ending | Phases crossed | Offers opened / taken / lost | Levels bought | Belches | Hits | Ends above birthright |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 101 | 27327 | sealed | banshee, crowd, waking, vigil, undertaker | 0 / 0 / 0 | 0 | 3 | 12 | no |
| 202 | 19111 | sealed | banshee, crowd | 1 / 1 / 0 | 1, stripped | 2 | 11 | no |
| 303 | 27859 | budget spent | banshee, crowd, waking, vigil, undertaker | 7 / 6 / 1 | 6 | 5 | 13 | yes, three lines |
| 404 | 20999 | sealed | banshee, crowd, waking | 0 / 0 / 0 | 0 | 3 | 11 | no |
| 505 | 27859 | budget spent | banshee, crowd, waking, vigil, undertaker | 2 / 2 / 0 | 2 | 3 | 12 | yes, two lines |

**The reach: the hand enters the Undertaker's phase on three of the five seeds, and no dodging run reaches it on any.** Measured beside it on the same budget, `dodgePolicy` from the birthright crosses into the Crowd at best (101, 303, 404) and stops at the Banshee on 202 and 505, never sealing and never finishing, because it cannot empty a boss and the phase does not end. That is hand-forward (g)'s reading moved: the hand belches and levels, so it gets through boss fights the dodger stands in front of forever. It is a reading and not a bar, and step 4's tuning pass is what moves it.

**What the same table says against the hand.** It seals on three of five where the dodger seals on none, taking 11 to 13 hits a run against the dodger's 0 to 7. That is the clearance row doing exactly what the record says it does: at 12 rather than 60 the hand commits into a swarm to reach a body, which is what makes it a player rather than a dodger, and the price is hits. **No row was moved and nothing was sharpened.**

**The six policies did not move, proved outside the suite.** A throwaway instrument played all six over the five pinned seeds for the Procession's budget of 8082 ticks, at the tip before any edit, and recorded each run's tick count, ending, grave size to six decimals and swallow count. The grave's size after 8082 ticks is a fine-grained signature of a whole run, because every swallow and every hit moves it. Thirty runs, every figure identical either side of the change. The instrument is deleted, per `docs/agents/lessons.md`: a gameplay fingerprint is not promoted into a committed test, and this repo already has a committed golden digest at that seam.

**Module test 75 is the committed half of that promise**, and it is a walk rather than a sampled state. Each of the six is re-derived from `bestMoveToward` under `LOOKAHEAD_SAMPLES` at every tick of a 500-tick walk on each pinned seed, and the walk counts the ticks where a threat and where food were actually present so a pass over an empty field cannot pass for a pass. **The first version of it read one state at tick 900 and was toothless**: the Procession owns emptiness, nothing comes inside the look-ahead's reach until a shade before tick 1000, and every assertion held on a policy handed a horizon it never read. It was found by mutation, not by reading: shortening `divingPolicy`'s list left the suite green. The walk now goes red on all five seeds for that same mutation. **Four other assertions were found toothless the same way and tightened**: three offer-steering tests passed whichever body the hand chose, because the offer stands its three bodies in a row at one height and a hand below answers the same move for any of them, and because an offer body is itself a corpse, so a hand with no offer clause reached the same body as the nearest food. They spread the bodies to three bearings and lay an ordinary corpse nearer than any of them.

**Two tests carry a stated budget**, `ONE_WHOLE_STAGE_MS` and `SIX_POLICY_WALKS_MS`, both 30000, in the shape `bot.test.ts`'s `FIVE_MAXED_RUNS_MS` already uses and each with its reason on it. Both were added after a run of the whole suite timed them out at vitest's five seconds with no assertion, which is contention plus a genuinely long test rather than a failure; each passes alone. `bot.test.ts`'s new walk helper caches its played states per seed for the same reason.

**Hand-forwards for slice 2 and later.**

- The two reserved policy names are declared and unread. **Slice 3 writes them**: `tapeHeaderFor` writes `PERSON_POLICY`, `record-conditioned.ts`'s `headerFor` writes `SCRIPT_POLICY`, and both import from `src/tape/tape.ts`.
- **Slice 5 owns four things this slice deliberately left**: `HAND_STREAM`, the seed on `harnessPolicy`, the eight other rows, and the widened `ConfigurationName`. Section 5 says why each.
- **The hand walks at a banked offer's body while it is still above the top edge**, because `openBanked` opens at `-OFFER_ENTRY_DEPTH` and the wanting rule reads the body's position with no clause about the field's bounds. It is correct under the rule as ruled and it is worth a reading rather than an edit: slice 4b's report is where a hand pressed against the top edge would show up.
- `apps/hungry-grave/docs/push/handoff.md` was modified by the dispatching session while this slice was in flight. It is not this slice's and it was left unstaged.
