# Design record draft: path step 5, the tuning record and the sweep runner

Planning half only, in the shape `docs/design/step-4-mow-ladder-director-dispatch.md` takes. No production code was written for this draft and nothing inside the worktree was edited: slice G is in flight there and its files are uncommitted.

**What this draft may claim.** Every claim about existing code cites a file and a line, read on 2026-09-15 at branch tip `524bb68447` with slice G's 48 files still uncommitted, and every line number goes stale the moment slice G commits. The tip this step plans against is the one slice G leaves behind: `FORMAT_VERSION` 4 (`wireCodes.ts:50` in the working tree, 3 at HEAD), `signalLockFromUrl` a sixth URL parser, `signalLock.ts` present.

---

## 1. The goal, and the done line

Mark built the V1 rewrite so that he is not the feel check on every tuning iteration, and today every authored magnitude is a compiled constant, so moving one costs a coder, a review and a deploy. This step makes the numbers something a run resolves rather than something a build was compiled with, so the agent can play many batches under many candidate tunings with the bot hands, read the spreads, and bring him a candidate with the evidence behind it. It changes no rule of the game and moves no magnitude: what it moves is where a magnitude lives and who may name one at run start. Round one of density closes as step 4's step 15 batch, and this step is what makes every round after it cheap.

**The done line, in observable terms.** One command plays a batch under a named tuning candidate, the same `scripts/batch.ts` invocation with one extra argument, writing a folder whose report says which tuning produced it; a second command sweeps a list of candidates and prints the comparison across them. No coder is dispatched, nothing is compiled, no deploy happens, and a tape recorded under a candidate says on its own header what it was played under. A tuning iteration costs one batch command and one read.

---

## 2. The decisions the orchestrator must rule

Each is a question with its options and the evidence for each. None is settled here.

**Decision 1. Which numbers are in the tuning record, and what rule decides membership.** Option A, every authored magnitude in the core. Option B, only the numbers the iteration plan has asked to move. Option C, a stated rule: a magnitude is in the record when a batch reading can move it and it is neither a derivation nor a safety net. The evidence for a rule over a list: `caps.ts`'s own JSDoc calls a capacity "a safety net and not a tuning knob", and ADR 0056 makes `MOB_CAP` (`caps.ts:111`), `MOB_FIRE_CAP` (`:196`) and `CORPSE_CAP` (`:231`) derivations of the tables, so admitting a cap would re-open the decision ADR 0056 closed. The same rule excludes `TRASH_CORPSE_PAYOUT` and `RESERVOIR_CAPACITY` (`tuning.ts:107`, `:125`), whose whole point is that the feast identity is true by construction. What it admits on today's tree, by owner: five declared numbers in `tuning.ts` (`:27`, `:58`, `:69`, `:104`, `:118`), `MOB_TYPES` (`mobs.ts:85`), and in `waves.ts` the three purses (`:449`, `:853`, `:1009`), `BODY_COST` (`:1032`), `CARDS` (`:1061`), `QUIET_INTERVAL_MINIMUM_SECONDS` (`:1099`) and the section wave tables, plus each line's level curve. The harness hand rows are excluded by a rule that already exists: a moved hand row is a new configuration with a new name, or a batch compares two builds through two instruments (`configurations.ts`).

**Decision 2. One flat record or grouped by owner file.** Option A, one flat object keyed by dotted name, the shape `BatchReport.spreads` already uses (`batchReport.ts:170`) and which `compareBatches` walks by name across two sides. Option B, grouped by the module that owns each number, which is what the code rules mean by a file being a concept module and which makes "re-derive the caps from the tables" legible as one group feeding another. Option C, a separate record per owner module, passed separately. The evidence for flat: a sweep's whole output is a comparison keyed by name, and one namespace makes the command line, the header and the report use one spelling. The evidence for grouping: the group name is the thing a person names on a command line, and it keeps each owner module's numbers together where its own JSDoc explains them.

**Decision 3. Where the record is declared and how the game code reads it.** Option A, a module-level mutable in the core set at startup, which the code rules forbid outright: no import-time side effects, and a core module a shell writes into is the dependency rule inverted. Option B, one import at the shell, resolved once and passed inward through `createRun` onto `RunState`, every reader taking it as an argument. Option C, threaded to every reader without living on the state. The cost rides here: `createRun` already takes five positional parameters with `signalLock` fifth (`run.ts:278`), so a sixth is a smell and the sub-question is whether `createRun` moves to a narrow options record as the code rules ask of powers arriving at construction. The harder half is that `createRun` builds every pool at its cap in the same call (`mobs.ts:250`, `corpses.ts:107`) from module constants evaluated at import, so if a wave table is resolvable at run start then `MOB_CAP` cannot be a `const`; the one alternative, sizing pools at a worst case over any legal record, cannot be bounded because a legal record is open.

**Decision 4. How an override is stated, on the command line and on the URL.** Command line, option A, repeated keyed arguments, which the tree has twice: `batch.ts`'s `rig=<rig>` and `record-conditioned.ts`'s `<line>=N` (`:36-37`). Option B, a path to a JSON candidate file, which is what a sweep of forty numbers across six candidates needs and is an artifact a later run can be pointed back at. Option C, named candidates in a table under `src/dev` on the model of `RIGS`, so a candidate has a name a folder and a report can carry; the batch folder is already `<configuration>-<rig>-<recordedAt>` (`batch.ts`'s `folderFor`), and a candidate with no name cannot be compared by name. URL, option A, a `?tuning=` naming a candidate; option B, repeated key and value pairs; option C, no URL surface in this step. The evidence: every existing parser repairs to a safe value and warns rather than refusing (`seedFromUrl.ts`) and ADR 0022's build-time gate covers a new one for free; against a surface at all, that Mark's feel check is on a deployed build and what matters is that the candidate he plays is the one the batch read, which a named candidate gives and a hand-typed key list does not.

**Decision 5. How the record is stamped into the header, and what that does to `FORMAT_VERSION`.** ADR 0056's amendment names this exact trigger in its own words: the day the budget becomes something a run resolves, pinned for a tuning experiment, it is a starting value, ADR 0027 pulls it into the header, and a second bump is taken. So the question is not whether but in what shape. Option A, a second bump, 4 to 5, with the record appended as a length-prefixed self-describing block carrying names and values, which is what ADR 0043 asks of a recorded value whose meaning depends on an open membership. Option B, riding on slice G's own move while slice G is still uncommitted, which the witness-version lesson argues against in its own shape: stamp the version in the last slice that changes the layout, because a version stamped before the layout stops moving names several layouts. Option C, a fixed-width digest instead of the record, cheap on the wire and unreadable afterwards, which ADR 0043 rejects because a reader must name what a byte means without assuming its own present-day world. The refusal rule is this decision's second half: a tape whose record this build cannot honour is readable and reportable in the tape's own vocabulary and not replayable here, ADR 0043's roster case arriving again, and the precise refusal is what to build rather than a bare divergence at a checkpoint (ADR 0019).

**Decision 6. Whether the record reaches the witness fold or the readings.** Option A, fold it, which moves `WITNESS_VERSION` 7 to 8 (`witness.ts:75`). Option B, leave the fold alone. The evidence for B: the version's own comment says it moves when the order or the field list moves, the record is a starting condition rather than run state, and every consequence of a changed record is already inside the fold through the live state it changes, so folding it spends a version on a value that changes nothing the fold reads. The readings half is Decision 8.

**Decision 7. Whether `GOLDEN` and the fences are touched.** `GOLDEN` is a constant over 600 ticks from a pinned seed under a scripted input (`digest.ts`). If the resolved default record is value-identical to today's compiled constants the scenario runs the same run and `GOLDEN` does not move, so the question is whether any slice is permitted to re-pin it at all, and the answer follows Decision 3: if `createRun`'s signature changes, the call site moves and the values do not. The fence half is cheaper and real: `boundary.test.ts:61` holds `src/game` to `mayReach: ['game']` with `mayImport: []`, so a record declared in `src/game` keeps the fence and one declared in `src/dev` and read by the core breaks it. Option A, no new fence. Option B, a new fence naming that the caps derivation reads the record and never a shell, the shape step 4's slice D already added inside `boundary.test.ts` for the tables.

**Decision 8. Whether the report records the tuning's identity, and whether a mismatch refuses a comparison.** `compareBatches` refuses on exactly three mismatches today, `readingsVersion`, `configuration` and `rig` (`compareBatches.ts:213-220`), while `BatchIdentity.commitHashes` (`batchReport.ts:78`) is carried and never enforced. Option A, a fourth refusing mismatch on the tuning's identity. Option B, a fourth field carried and reported, never refusing, on the commit-hash precedent. Option C, refuse as today and print the tuning difference beside the comparison. The evidence against A is plain and still worth ruling: comparing two tunings is this step's central command, so a refusal there would refuse what the step exists to do. The evidence for carrying it either way: ADR 0053 makes a finding this build against that build and never a number against a target, and a report that cannot say which tuning it read cannot support that sentence.

**Decision 9. Whether the sweep runner is a new script over `batch.ts` or a mode of it.** Option A, `scripts/sweep.ts` beside `batch.ts` and `compare-batches.ts`, over the same `src/dev` seams, with `batch.ts` gaining only the candidate argument. Option B, a mode of `batch.ts` behind a keyed argument. Option C, no runner, a loop the agent writes each time. The evidence for A: `compare-batches.ts` is already a second shell over the same `src/dev` modules, and `batch.ts`'s `main` already carries six refusal paths against a code rule that makes forty lines where splitting becomes the default. Against C: the done line says one command, and a loop written fresh each time is a loop written wrong once.

**Decision 10. Whether the store is wired in this step. The recommendation is not.** ADR 0057 provisions it and `scripts/store-smoke.mjs` proves the connection, and nothing in the game or the harness writes a row. Both ADR 0043 and ADR 0053 say the cheapest moment for a wire bump is before the store starts filling, and this step takes one, so wiring the store here means the first rows written are rows the same step's bump orphans. The done line needs a folder on disk read by one command, not a query. The trigger that reopens it: the first tuning round whose comparison needs runs from more than one machine or session.

**Decision 11. Whether the vocabulary gains a word, and which.** `Rig` and `Configuration` both earned glossary entries as harness words (`CONTEXT.md`), so a harness word does earn one here. The candidates are Tuning record, Dial and Candidate, and the constraint worth naming is that the glossary's `Signal lock` entry already lists "override" among its avoid-words, so this step's own working title uses a word the glossary partly bans.

---

## Section 2a: the orchestrator's rulings on the eleven decisions (2026-09-17)

Each decision above is ruled here, before any coder is dispatched. A ruling names its option by the letter above and the reason in one or two sentences. Nothing here moves a magnitude or a moment of play.

1. **Membership is the stated rule, option C.** A magnitude is in the record when a batch reading can move it and it is neither a derivation nor a safety net. The list of what that admits today is re-read off the tree when the slice prompts are written, and it now includes `TRASH_KILL_SCORE` and `SCORE_BLEED_CAP`, both landed 2026-09-16 and both annotated as first figures read against slice 9's readings.

2. **Grouped by owner module in the type, flat dotted names on every text surface, option B carrying A's naming.** The record is one typed object nested by owning module, so each module's numbers sit beside their own JSDoc and the caps derivation reads one group. The dotted path (`grave.sizeFloor`) is the one addressable name a command line, a tape header, a report and a comparison all use, derived from the nesting and never hand-maintained.

3. **Resolved once at the shell and passed inward onto `RunState` through `createRun`, option B.** Option A is forbidden by the no-import-time-side-effects rule and stays ruled out. The sub-question is ruled too: **`createRun` moves to `seed` plus one narrow options record** for the starting conditions (size, levels, roster, signal lock, starting score, tuning record), because slice 8 makes the positional list six long and a seventh is past the smell. All call sites move in the same commit, none changes a value, and the golden holds. **The harder half is ruled by putting the caps on the run.** `MOB_CAP`, `MOB_FIRE_CAP` and `CORPSE_CAP` become per-run derivations computed inside `createRun` from the run's own record, carried on `RunState`, and every reader that read the module constant reads the run's field. A legal record is open, so the bound is per run rather than static, which is what the pools already are: built in `createRun`, at a cap, once.

4. **Named candidates in a table under `src/dev` on the `RIGS` model, option C for the command line; `?tuning=<candidate>` on the URL, option A.** A candidate is committed data with a name a batch folder and a report carry, so the build Mark plays and the batch the finding came from name the same thing. The URL parser repairs an unknown name to the default and warns, the shape every existing parser has. A JSON file path is not built: the sweep's candidates are rows, added the way a rig row is added.

5. **A second `FORMAT_VERSION` bump, 4 to 5, and the record rides in the header as a length-prefixed self-describing block of names and values, option A.** The refusal is precise and built: a tape whose block names a field this build's record does not have, or lacks one it requires, is readable and reportable in the tape's own vocabulary and is not replayable, said in those words. A tape whose names all match replays under the tape's own values, whatever this build's defaults are, which is the point of carrying values.

6. **The witness fold is left alone, option B.** The record is a starting condition and every consequence of it is already in the fold through live state.

7. **No `GOLDEN` re-pin in any slice of this step, and the fence is added, option B.** The default record is value-identical to today's constants, so the golden's run is the same run; a re-pin would mean a value moved and that is a stop. The new fence names that the caps derivation and the core read the record only off the run, never through a shell import.

8. **Carried and reported, never refusing, with the difference printed beside the comparison, option B plus C's print.** Comparing two tunings is the step's central command. `BatchIdentity` gains the candidate's name and the record's values; when two reports differ, the comparison prints the differing rows first, then the readings.

9. **`scripts/sweep.ts`, a new shell beside `batch.ts` and `compare-batches.ts`, option A.** `batch.ts` gains only the candidate argument.

10. **The store is not wired in this step.** As the draft recommends, with its reopening trigger.

11. **Two glossary entries: Tuning record and Candidate.** The record is the shape, the numbers a batch reading can move; a candidate is a named tuning record a batch or a play runs under. "Dial" is out because it implies a knob, and Mark ruled no comparison knobs before V1. "Override" is out by the glossary's own avoid-list. The step's title drops the word.

**Housekeeping the prompts carry when written**: the version constants in section 5 are read off the tree at that time (11, 9 after slice 10, 4 to 5 here); the draft's slices A to E take run-order numbers; every line number in the draft is stale and none is cited in a prompt.

## 3. The proposed shape

**The core.** `src/game/tuningRecord.ts` holds the `TuningRecord` type, the resolved default, and `resolveTuning(overlay)`, which takes a partial and answers a complete record. It is the `signalLock.ts` shape: a type and a resolver the sim, the header and playback can all own without any of them importing a consumer. The cycle guard in `boundary.test.ts` shapes it: `caps.ts` imports `waves.ts` today, so if `waves.ts` imported the record module the group would close, which is why readers take the record as an argument and never import it.

**The satellites, each seeing only the core.** `src/dev/tuningCandidates.ts` holds the named candidates as data rows on the model of `rigs.ts`, parsing a raw name at the edge the way `isRigName` does. `src/dev/tuningOverlay.ts` turns a keyed argument list or a JSON document into an overlay and refuses at the edge.

**The tape edge, parsing exactly once.** `src/tape/` encodes the resolved record into the header and decodes it back, and one function there answers whether this build implements what a tape names, its refusal carrying the tape's own vocabulary.

**The shell.** `scripts/batch.ts` gains the candidate argument and writes the tuning's identity into the report. `scripts/sweep.ts` is new: it plays a list of candidates, each as an ordinary batch, and prints the comparison across them.

**The arrows, all inward.** Shell reaches `src/dev` reaches `src/game`; `src/game` reaches only `src/game` and imports no package (`boundary.test.ts:61`). The record travels forward as a value from the shell to `createRun` to `RunState`, and nothing writes it after the first tick.

---

## 4. The slices

Each is one commit for one Opus coder: its tests, its minimal implementation, and its glossary entry where one is named, under a step 5 coder contract lifted from `docs/push/step-4-coder-contract.md`.

**Slice A. The record exists and nothing reads it.** `tuningRecord.ts`, the type, the resolved default, the resolver, and the fence test. It may not change a magnitude, touch `createRun`, or move `GOLDEN`. Its whole promise is that the default record is value-identical to the compiled constants, which is a test rather than a claim.

**Slice B. The core reads it.** `createRun` takes the record, `RunState` carries it, every admitted reader takes it as an argument, and the caps become a function of it computed once per run. This is the slice with the blast radius, and step 4's slice A is the warning: a slice touching a table every other module reads landed 19 files where its own table said five. It may not move a magnitude or admit a number Decision 1 excluded, and it is the one slice permitted to re-pin `GOLDEN`, only if Decision 3 moves the scenario's own call.

**Slice C. The header carries it.** The encode, the decode, `FORMAT_VERSION` moved once in this same commit with every new field declared in it, and the precise refusal for a tape this build cannot honour. It may not widen the fold or move `WITNESS_VERSION`.

**Slice D. The command line and the URL.** The candidate table, the overlay parser, `batch.ts`'s argument, the URL parser if Decision 4 takes one, and the build-time gate over it. It may not change what a run does when no candidate is named.

**Slice E. The sweep runner and the report's tuning identity.** `scripts/sweep.ts`, the report field, and the comparison's handling of a tuning difference. It may not add a refusing mismatch unless Decision 8 rules one.

---

## 5. What must not move

The fences: `boundary.test.ts`, `lineAgnosticPolicies.test.ts`, `executionFence.test.ts`, `harnessStatesNoTarget.test.ts`, `comparisonDeclared.test.ts`, and step 4 slice D's sixth, the cap derivation reading tables and never the stage. The invariants: every check in `invariants.ts` keeps its meaning and severity, and every fault identity keeps its wire number (ADR 0024). Replay determinism: two runs on one seed with the same inputs rebuild identically, and a tape replays and verifies off its own header. `STREAM_SALTS` and `STREAM_ORDER`. `WITNESS_VERSION` 7 (`witness.ts:75`). `READINGS_VERSION` 4 (`readingsVersion.ts:61`), because this step adds no reading and changes no reading's meaning. `GOLDEN`, except in slice B and only if Decision 3 moves the scenario's call. And every magnitude in the tree: a moved number is a stop and report.

---

## 6. Verification steps and the tests that pin the promises

**Verification, actor the agent unless named.** The step 4 contract's standing checks, unchanged: typecheck, suite, build and `pnpm verify` green twice on the committed tree, the test-name diff against this branch's own tip, replay determinism at each slice's tip, and a tape measured through `scripts/measure.ts` asserting `outcome: 'verified'`. This step's own three: a batch under the default candidate compared against one played before slice A, which must be indistinguishable; a batch under a candidate moving one number, which must show the direction that number predicts; and a hand-recorded tape at the new format through `vite preview`. **Actor Mark, blocking nothing:** one play of a candidate the batch says is ready.

**The tests that pin the promises, each a sentence.** The default tuning record holds exactly the values the build was compiled with, and a run started with no candidate plays the run it played before this step. Resolving an overlay that names one number leaves every other number at its default, and an overlay naming a number nothing owns is refused at the edge and never reaches the core. The caps re-derive from the record the run actually started with, not from the defaults. A run started under a candidate records that candidate's resolved record in its header, never an absence, and a tape so recorded replays and verifies on a build that implements it. A tape naming a tuning this build cannot honour is reported in the tape's own vocabulary and refused for replay with the reason named. The sweep runner plays each candidate as an ordinary batch, its folders indistinguishable from hand-played ones, and a comparison across two tunings says which tuning each side was played under. The core imports no shell module and no candidate table.

---

## 7. Open questions that need Mark

**None.** Every decision in section 2 is a craft call the orchestrator owns, closable by the code or the ADRs, and none changes a rule Mark ruled: the step moves no magnitude and changes no moment of play.

The closest was Decision 11, the glossary word, because ADR 0061 realigned this vocabulary on his read eleven days ago. It stays the orchestrator's, because the word is a harness word rather than a player-facing one and `Rig` and `Configuration` both entered the same way without an ask, and it reaches him in the session recap rather than as a stall in front of a slice.
