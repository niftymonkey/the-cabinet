# Step 6 progress note: the tuning record (ticket #142)

The design record is `apps/hungry-grave/docs/push/drafts/step-5-tuning-record-draft.md` and the prompts are `step-6-slice-prompts.md`. The coder contract is still `step-4-coder-contract.md`, with the three standing exceptions to it at the top of the prompts file. One section per slice at the end, in run order, and the cross-slice facts first. Written by each slice's coder, appended to and never rewritten.

**Step 5's note is `step-5-progress.md`, round two's is `round-two-progress.md` and step 4's is `step-4-progress.md`, and all three are read and never appended to.** This step's slices carry `#142` rather than `#99`, `#72` or `#39`.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| 1, the vocabulary | the commit this note rides in, section 6 says why | `docs(hungry-grave): the glossary gains the tuning record, the candidate and the starting condition, and a sweep is not a batch (#142)` |

## 2. The version ledger

Where each constant stood when step 6 opened, where it is permitted to go, and where it actually went. **A move anywhere the prompts do not name is a stop and report, never a re-pin and never a bump taken on the spot.**

| Constant | At step 6's opening tip `fd9fadf562` | Permitted move | Owner | Landed |
| --- | --- | --- | --- | --- |
| `WITNESS_VERSION` (`src/game/witness.ts`) | 11 | none, in any slice | nobody | |
| `READINGS_VERSION` (`src/dev/readingsVersion.ts`) | 9 | none, in any slice | nobody | |
| `FORMAT_VERSION` (`src/tape/wireCodes.ts`) | 4 | 4 to 5, exactly once | Slice 6, the header, and no other slice | |
| `GOLDEN` (`src/dev/digest.ts`), checksum `-2049717150` | pinned by step 5's slice M1 | no re-pin, in any slice | nobody | |

**The whole budget is slice 6's single `FORMAT_VERSION` move and nothing else** (prompts ruling 4, draft section 2a rulings 6 and 7). The witness does not move because the record is a starting condition and every consequence of it is already in the fold through live state; the readings do not move because no existing reading changes meaning; `GOLDEN` holds by arithmetic in every slice, because a re-pin would mean a magnitude moved and a moved magnitude is a stop.

**Slice 1 moved none of the four and was permitted none.** `WITNESS_VERSION` 11, `READINGS_VERSION` 9, `FORMAT_VERSION` 4 and `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2`, each read off the tree before the first edit, and none of the four files is in the commit. Every figure matched the prompts' own header line, so nothing in this step starts from a stale constant.

## 3. GOLDEN moves

One entry per slice that was permitted one, whether or not it moved, with the dated paragraph's location and every field that moved beside every field that held.

**No slice in this step is permitted a re-pin**, so an entry here would itself be the report of a stop. Slice 1 has none: no file under `src/` is in its commit.

## 4. CodeRabbit

One entry per commit: files reviewed, findings by severity, applied and declined, each decline with its reason.

**Slice 1's docs commit, `coderabbit review --agent --uncommitted`, one iteration: two files reviewed, one finding, minor, applied.** The two files are this slice's own, `CONTEXT.md` and this note; the worktree held no other agent's edits, so the review saw nothing else. The finding is on this section: it stood as an unfilled marker when the review ran, because the review is the step before the commit and the note rides inside the commit it describes, so the only way to record the review was to write the entry after it. **Applied by writing this paragraph**, which is the finding's own first option, files reviewed and findings by severity with what was applied. Zero findings on `CONTEXT.md`, so none of the three entries or two amendments was touched by the review.

## 5. Record and prompt claims found false against the tree

Every claim in the design record or in a slice prompt that did not survive contact, with the file and what is actually there. **The source's intent is followed rather than its stale letter, and an unclear intent is a stop.**

**Slice 1. The prompts' header expects one new ADR and two exist at the tip it was written against.** `step-6-slice-prompts.md`'s second further ruling says "Expected: **one new ADR** for the tuning record and the starting-condition record on the run". The orchestrator filed two at `8924d5b397`, ADR 0063 for the starting-condition record and ADR 0064 for the tuning record, which is what the draft's own third prompt-time ruling calls for: "the step's new decisions are two ADRs under the one-decision rule, not one; the second stands on its own without the first, which is the test". **The intent was followed and both were cited**: Starting condition cites ADR 0063, Tuning record and Candidate cite ADR 0064, and neither entry cites a record that does not exist. The header sentence is stale rather than wrong about anything a slice has to do.

## 6. Slice 1: the vocabulary, and the step's progress note exists (#142)

Two files: `apps/hungry-grave/CONTEXT.md` and this note, new. **Written inside the commit it describes**, because slice 1 is one docs commit by its own prompt and there is no second commit to record a hash from; section 1's row points here and the hash is in the dispatch report. **No file under `src/` or `scripts/` is in it, no test moved, and the test-name diff is zero and zero.**

**The worktree was clean before the first edit.** The short status returned nothing at all, so no other agent's file was open and nothing had to be kept out of the commit.

**The four constants, each read off the tree and untouched.** `WITNESS_VERSION` 11 (`src/game/witness.ts`), `READINGS_VERSION` 9 (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` 4 (`src/tape/wireCodes.ts`), `GOLDEN`'s checksum `-2049717150` (`src/dev/digest.ts`) with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2`. Section 2 carries what that means for the rest of the step.

**The three entries added, each in the file's own voice with its own Avoid list, and all three placed beside the harness words rather than at the section's end** so a reader meets them together. **Starting condition**, placed immediately before `Rig` so the rig entry's first sentence reads off it: one record of how a run starts, the size, the levels, the roster, the signal lock and the starting score together, each absent field resolving to what the run would have resolved it to anyway, a rig being that record under a name, a tape's header carrying it whole and `createRun` taking it (ADR 0063), _Avoid_: initial state, preset, options, start state. **Tuning record**, placed after `Rig`'s two amendments and before `Candidate`: the magnitudes a batch reading can move, grouped by the module that owns them, resolved once at a run's start and carried on the run, its one name on every text surface the dotted path its grouping gives it, a row existing only where something reads it, and neither the caps nor the safety nets, which are a derivation and a bug detector (ADR 0064), _Avoid_: settings, parameters, config, balance table. **Candidate**, placed immediately after it and immediately before `Batch`, so the word `Batch`'s own amendment uses is defined above it: a named tuning record a batch or a play is run under, the name being what a batch folder and a report carry, a starting condition on exactly the terms a rig is and never a description of the hand that steered (ADR 0064), _Avoid_: variant, arm, treatment, recipe.

**The `Rig` amendment, in one sentence.** What stood is everything the entry says a rig is, the starting condition alone and never the hand, figures from two rigs never banded, and the 2026-09-17 step 5 amendment above it including what it says a rig's condition holds; what changed is the count and the list, six named rigs becoming the three rows `RIG_NAMES` actually holds (`birthright`, `maxed`, `ladder`), with the ceiling rig named as unrowed and waiting because `src/dev/rigs.ts` says exactly that in its own comment, and the entry now citing Starting condition rather than restating it; what the entry could not have known is that it was written when a rig was the only name any starting condition had, so counting rigs was the only way to count starting conditions.

**Why the correction says three and not seven.** `docs/design/playing-harness.md` section 6 holds a table of seven starting conditions and the glossary said six, while `RIG_NAMES` holds three. The prompt rules the entry to the rows the tree has, so the entry now names the three rows and says in one clause that the conditions the harness record names and nothing plays through the harness, the ceiling rig among them, have no row. **The harness record's table is not edited by this slice** and still reads seven: correcting a design record's own table is not a glossary slice's job, and the entry no longer depends on that count being right.

**The `Batch` amendment, in one sentence.** What stood is everything the entry says a batch is, one run per seed over a consecutive range under one configuration, its size counted in seeds and never in repeats, its tape per seed, and its report as a distribution and never a mean; what changed is the ban on "sweep", which now names a thing of its own, a list of candidates each played as an ordinary batch with one comparison printed across them, so a sweep is made of batches rather than being a loose word for one; what it could not have known is that nothing could name a tuning at a run's start when it was written, so there was nothing a sweep could sweep over. **`sample`, `suite`, `trial` and `experiment` stay on the avoid list untouched**, and the entry's body is otherwise unmoved.

**The two words the prompt's first ruling bans, checked rather than assumed, and not written out here either.** `CONTEXT.md` holds zero occurrences of the first of them. It holds exactly one of the second, which is `Signal lock`'s own avoid-list entry, predates this step and is the reason the step never uses the word. Neither appears in any new entry, either amendment, the commit message or any line of this note, which is why this paragraph names them by reference rather than spelling them.

**Every other glossary entry is untouched.** The diff on `CONTEXT.md` is one inserted entry before `Rig`, one rewritten opening to `Rig`, one appended amendment paragraph under it, two inserted entries before `Batch`, one word dropped from `Batch`'s avoid list and one appended amendment paragraph under it. No other line of the file moved.

**The ADRs this step still owes are not filed, and that is the orchestrator's and not a slice's.** ADR 0063 and ADR 0064 both exist at this tip and both were cited. **Neither `docs/adr/0043-recorded-content-is-self-describing.md` nor `docs/adr/0056-the-director-spends-a-finite-budget-per-section.md` carries a 2026-09-17 amendment yet**, which is expected: the prompts say each is filed before the slice that depends on it, ADR 0056 before slice 4 and ADR 0043 before slice 6. It is written down here so neither slice discovers it as a gap.

**A standing build warning, pre-existing and already ticketed.** `pnpm build` prints "Some chunks are larger than 500 kB after minification" on this tree. It is the roughly 589 kB pixi chunk that `docs/push/open-tickets.md` already carries as a ticket asking for the size to become understood and intentional. Nothing under `src/` is in this commit, so the warning is unchanged by it, and it is named here only so it is not read as new.

**Verification, with results.**

1. `pnpm typecheck`, `pnpm lint`, `pnpm vitest run` and `pnpm build` green in `apps/hungry-grave/`: 157 test files, 2323 passed, 11 expected fail and 2 todo of 2336.
2. `pnpm verify` green at the repo root, twice on the committed tree: format, lint, typecheck and both apps' suites.
3. The test-name diff, **0 added and 0 removed**, 2334 names on both sides, against a baseline captured off the clean tip into `local/step6/slice1-vocabulary-baseline.json` before the first edit. The 2334 against the run's 2336 is `vitest list` not printing a static `test.todo`, and both sides were captured the same way, so the assertion is unaffected.
4. The four constants above, each read off the tree with its file, none of them in the commit.
5. CodeRabbit CLI, one iteration, before the commit. Section 4 carries it.
6. **There is no Mark actor in this slice.** A glossary word is a craft call the orchestrator owns (draft section 7), and the three new entries and two amendments reach him in the session recap rather than as a stall.

**Left for later slices, each named.** The list of magnitudes that are eligible under ADR 0064's rule and carry no row, which the prompts' membership paragraph names (the rest of `tuning.ts`'s declared numbers, `MOB_TYPES` in `src/game/mobs.ts`, `BODY_COST` and `CARDS` in `waves.ts`, the section wave tables, and each line's level curve), belongs in **slice 3**'s section, because slice 3 is what declares the rows that do exist. `docs/design/playing-harness.md` section 6's table of seven is the branch's own **close pass**, with the docs debts of the handoff's open item 7.
