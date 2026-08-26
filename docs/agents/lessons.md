# Lessons

Things this repo learned the expensive way. Each one cost a real defect, a wasted round, or a session.

They are here rather than in a session handoff because they outlive the work that produced them. Rules that can be enforced live in `feature-playbook.md` and `review-gates.md` instead; what is here is judgment, which cannot be.

Codebase-specific traps live beside their code. The Hungry Grave's are in `apps/hungry-grave/docs/lessons.md`.

## Planning

**A plan's every claim about existing code needs a file and a line.** Three claims in one document were false, and every one was false only against a file the plan never opened. This is now a rule in `feature-playbook.md` rather than a lesson, along with listing every reader of a constant a plan changes.

**A claim about a dependency is checked in `node_modules`, not from memory.** Agents on one ticket checked their instructions against PixiJS's source repeatedly and found several claims wrong, two of them in their own dispatch prompts and one in this repo's pinned rules record. Two that paid for the habit outright: `Pool.get(data)` already calls `item.init?.(data)`, which is what made a whole phase of powers-as-props cheap, and the text setter early-returns on an identical string, which retired four hand-written caches.

**A plan's line numbers go stale the moment its first phase lands.** One refactor's early phases moved every export and turned every function into a `const`, and plan line counts written before that were wrong by 2 to 22 lines by the time an agent reached them. **A later dispatch locates its site by content, and a site it cannot find is a finding rather than something to skip.**

**A summary line in a long document outlives the correction that supersedes it.** One drop-size bound existed in three places: right in the derivation, right in a test title, and stale in a later summary section. The plan read the stale one, because that was the one the inheritance ledger pointed at. **When a ledger entry points at a rule, open the section it came from rather than trusting the pointer's paraphrase.**

**A plan can contradict itself across sections, and the test list is usually the wrong half.** One section asserted a bot reaches victory from the size ceiling; another computed, correctly, that it cannot. When two halves of one document disagree, back the one carrying the derivation.

**A stale number can be written on the same commit that makes it stale.** A colour landed at luma 61.95 in the same fold that left "the twelve declared colours between luma 61.95 and 67.41" standing in two files. **After adding a declared value, grep the record for any count that ranges over its category.**

**A fold is where the next defect gets made.** Roughly half of one gate round's findings were defects the previous round's fold had created: a property that could never pass, an instruction still saying the opposite of the argument four sections above it, three stale numbers beside the derivation that replaced them. The pattern is always the same: **the fold edits the argument and forgets the instruction.** After any fold, grep the document for the old number and the old verb, not just the paragraph that was rewritten.

**Proofread yourself before spending a gate on it.** Most of one planning round was the main thread's own numbers contradicting each other in the same document. That is not what gates are for.

**Ask what is expensive to unpick later, not what is imperfect.** On a tracer-shaped project that is a short list: module seams, import boundaries, the event vocabulary, and anything the next dispatches build on top of. Numbers, row counts, silhouettes and pacing are settled by playing.

## Gates and reviewers

**Fire the gate on a fold, not just on a plan.** Three gates ran on a plan, their findings were folded, and three gates on the *fold* found four more real defects, including the worst of that session. A fold is new design, not bookkeeping.

**Three independent gates converging on one finding is worth more than any of them alone.** Three lenses found one broken bound from three unrelated starting points: the buff-uptime literature, the founding ticket, and the record disagreeing with itself. None had seen the others. That convergence is what separates a real defect from a lens's preference.

**A gate can be confidently wrong about the world while being right about the code.** Two gates disagreeing about an external fact is a signal to go look yourself; two gates agreeing about arithmetic in the tree is usually right.

**Verify a gate's arithmetic even when two gates agree.** Two gates independently flagged one figure as wrong and both were right, and the wrong number had understated the plan's own argument. That is the direction that never gets caught by someone reading for plausibility.

**A citation can be folklore, and a correct citation can still carry a wrong argument.** One cited page turned out to be a player-facing settings control rather than a designer's pattern. Another was quoted accurately and then used to support a claim it did not make (an area minimum read as a thickness minimum). Quote the source in full, then re-check the argument separately.

**A gate that attributes beats a gate that counts.** The main thread measured shots on the field at each death and inferred crowding. A gate attributed each hit and found fifteen of eighteen were aimed fire from one specific row. Same data, a real cause instead of a correlation.

**A dispatch is gated twice, on its plan and on its implementation, and only the second one has read the code.** Dispatch 5 got three plan gates and no implementation gate, and the miss survived a session boundary because the handoff listed the three plan markers in a way that read as full coverage. Every earlier dispatch had both. **Count the implementation marker separately from the plan marker before calling a dispatch reviewed**, because a plan gate cannot see what the build actually did.

**Gating after the build costs a second reviewer pass, not just the gate's own time.** CodeRabbit had already reviewed the exact head of the PR, and the merge rule is that it must have reviewed the exact commit being merged. Any gate finding that changes code invalidates that review. **Run the implementation gates before the reviewer, not after.**

**A review gate will write to production code if it can.** One refactored two unrelated files unasked; another left probe test files at the app root. **Check `git status` after every gate round.**

**CodeRabbit's findings are worth verifying one by one rather than triaging by severity label.** Of seven, six were real, and the two labelled Minor included a genuine invariant defect. The one that needed pushing back on was a Major. The label predicts nothing.

**Do not determine whether a bot review is current solely from the PR reviews list.** Some bots, including CodeRabbit, may update an existing summary comment without creating a new review object. Check the bot's current summary/comment state as well before concluding that no fresh review exists or that an existing review is stale. The summary comment names the commit range it reviewed and the files it covered, so it answers the question the reviews list cannot.

## Subagents

**A dispatch subagent can stall after doing all the work.** One wrote a whole dispatch, got partway through its own verification, and died on a watchdog with no report. The tree was complete and good. **Check `git status` and run the checks before assuming a stalled agent left a mess**, because re-dispatching would have thrown away two thousand good lines.

**A subagent that validates its own instrument before trusting it is worth copying.** One reimplemented a colour module and checked it against five figures already pinned in the tree before reporting anything. Every conclusion it drew that way held. The one part it got wrong was the one part it had no in-tree figure to validate against.

**A subagent's numbers get re-measured, and the instrument is cheap.** Every load-bearing figure from one agent's report was re-measured with a throwaway test file read off the failure message and deleted immediately. All of them reproduced exactly, which is the outcome that makes the check worth keeping.

## Tests

**Pin relations by test, never magnitudes.** One number was derived twice and wrong twice, on a thing a human settles in ten seconds of play. What survives is the property, not the figure.

**When a test asserts absence, check the input can produce presence.** A lifecycle test played a run for 200 ticks and asserted nothing was visible in one layer. The content could not produce anything in that layer in that window, so the assertion passed over an empty set. Disable the fix and watch it go red; that is the only proof a guard is a guard.

**An assertion written as a table can still be toothless.** One would have failed the day it was added, so it shipped with an allowlist. It passes today and keeps passing after the thing it governs is finally drawn. An allowlist with written reasons is the honest form, but **the requirement is recorded rather than inherited unless something forces the next dispatch to read it.**

**No flaky tests.** A failure is data. Several rounds of non-standard fixes (polling, timeout bumps, retry wrappers) means the test is probably wrong.

**Contention is not flakiness.** Three concurrent suite runs on a 12-core machine failed five tests, every one of them a timeout and not one an assertion failure, and run alone they all passed. **A red gate arriving beside running work is contention until a run on its own says otherwise.**

## Verification

**The on-device step is an instrument, not a formality.** Twice now, one human sitting down with the build found something six gate rounds and multiple reviewers did not, and both times it was layout rather than logic. Ship to it early rather than polishing first.

**Driving an app through a CLI browser cannot substitute for using it.** Command latency is seconds; the things being read last fractions of a second. **Say which reads were not obtained rather than implying the rendered check was complete.**

**A bug a refresh makes go away is a boot-order bug, not a flake.** **When a symptom disappears on reload, ask what the first load measured that the second one did not**, rather than accepting the reload as a fix.

**A layout rule that names a viewport is usually the wrong rule.** The first candidate fix read exactly like the reported symptom and fixed the case that was played, then failed at a different window size. The rule that held named no viewport at all. **Test a candidate layout rule across a sweep before believing it**, because the reported case is one point on a curve.

**Watch the feature end to end, not just the suite.** Two real defects had been shipping unseen because nothing had ever rendered a replay from start to finish, and the eight pinned screenshots contained no replay screen at all. What found them was one agent told to record a run, open the tape and watch it. Where the thing to observe leaves no pixels, instrument the boundary instead: logging every WebAudio buffer start proved a click fired on all 41 button presses in a session, and that report was explicit that it could not prove the clip was the right one. **An instrument says what it cannot see.**

## Proving a refactor changed nothing

**A behaviour fingerprint is worth exactly its event coverage.** One folded 63 headless runs, 7 seeds by 9 policies at up to 20,000 ticks each, reducing each run to the sim's own witness checksum plus its ending, stop reason, faults, score, size, reservoir, levels, peak live corpses and a count of every event type, and it held byte-identical to a frozen baseline at every phase boundary of a 259-file refactor. What made it proof rather than a smoke test is that it reached 22 of the sim's 23 event types: the shipped bot only dodges, so five of the nine policies were written for the fingerprint alone, to reach the payout, overflow and belch paths no shipped policy walks. The 23rd type is unreachable in play by design, which the instrument had to establish rather than assume. **Count the event types an instrument reaches before trusting what it says**, because a fingerprint over the paths a bot happens to walk is a fingerprint of the bot.

**A throwaway instrument lives in a git-excluded folder, and that folder is excluded more than once.** `local/` sits outside git and outside prettier, so a harness survives a context reset and can never land in a commit. Eslint keeps its own ignore list and had not been told, so the instruments broke `pnpm verify` on a tree that was supposed to be green. **Check every ignore list the standing checks read, not only the one that keeps the folder out of a commit.**

**Compare test names before and after, never pass counts.** A vitest suite can fail to load and still report `numFailedTests: 0`: one phase broke a `vi.importActual` call and 13 tests vanished while the counter looked green, and nothing else in the run saw it. The comparison is cheap enough for every dispatch: build a detached worktree at the previous commit with `node_modules` symlinked, run `vitest list --json` in both trees, and diff file-qualified names as well as bare ones, so a test that changed file is visible rather than silently matching its old self.

**Every proof that a change moved nothing is the same instrument: parse both sides, project each down to the thing that must not move, diff the projections.** A line diff cannot rule out a rename or a reordered declaration; the TypeScript scanner's token stream with comment tokens stripped can, and it cleared 23 of 23 changed files in one phase. When 46 header essays were reflowed, no existing check could see that work at all, so the same instrument took every comment out through the parser, split it to sentences and normalised them, which is what showed no recorded ruling had been lost. Multisets of numeric and string literals across every production module answer "did a tuned number or a player-visible string move" over hundreds of files in one pass. **The projection is the claim, so name it before building it.**

**A screenshot is byte-comparable only with a pinned input and a clipped frame.** Six of eight pinned-seed shots differed across identical code purely because of the frame-rate readout in the corner, and clipping that band made the four static screens byte-stable. The four that sample a live run at a wall-clock offset never will be, and are read by eye. **Record which shots are comparisons and which are looks**, or eight files on disk read as eight comparisons.

**A visual gate that shoots only static screens is blind to every renderer.** Title, prototypes, runs and digest were the byte-diffed four, while both game screens, the HUD, the countdown and every renderer appeared only on the live shots. The fix was machinery already in the tree: a replay renders a pinned tape at a chosen tick and is deterministic by construction, so one shot freezes the whole renderer stack. **Take the new shot at the baseline commit too**, which prices the work already done instead of only guarding what comes after it.

**A defect called pre-existing is proved pre-existing.** Both defects found by watching a replay were reproduced against the baseline commit in a throwaway worktree before anyone called them old, and the phase that met seven browser-console warnings rebuilt the pre-change files and re-ran the capture rather than assuming they predated the branch. It is the same worktree the test-name diff already needs, and it costs minutes.

**A gameplay fingerprint is not promoted into a committed test.** Committing it creates a standing obligation to update it every time gameplay intentionally changes, and this repo already has a committed golden digest at that seam. Instruments of this kind are deleted at the end of the work and the technique is written down here instead, which is why the entries above carry their own detail. **The pinned-replay screenshot is the exception worth revisiting**, because it has no committed equivalent and it is the only automated check that has ever seen the renderers.
