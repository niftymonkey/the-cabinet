# Lessons

Things this repo learned the expensive way. Each one cost a real defect, a wasted round, or a session.

They are here rather than in a session handoff because they outlive the work that produced them. Rules that can be enforced live in `feature-playbook.md` and `review-gates.md` instead; what is here is judgment, which cannot be.

Codebase-specific traps live beside their code. The Hungry Grave's are in `apps/hungry-grave/docs/lessons.md`.

## Planning

**A plan's every claim about existing code needs a file and a line.** Three claims in one document were false, and every one was false only against a file the plan never opened. This is now a rule in `feature-playbook.md` rather than a lesson, along with listing every reader of a constant a plan changes.

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

**A review gate will write to production code if it can.** One refactored two unrelated files unasked; another left probe test files at the app root. **Check `git status` after every gate round.**

**CodeRabbit's findings are worth verifying one by one rather than triaging by severity label.** Of seven, six were real, and the two labelled Minor included a genuine invariant defect. The one that needed pushing back on was a Major. The label predicts nothing.

## Subagents

**A dispatch subagent can stall after doing all the work.** One wrote a whole dispatch, got partway through its own verification, and died on a watchdog with no report. The tree was complete and good. **Check `git status` and run the checks before assuming a stalled agent left a mess**, because re-dispatching would have thrown away two thousand good lines.

**A subagent that validates its own instrument before trusting it is worth copying.** One reimplemented a colour module and checked it against five figures already pinned in the tree before reporting anything. Every conclusion it drew that way held. The one part it got wrong was the one part it had no in-tree figure to validate against.

**A subagent's numbers get re-measured, and the instrument is cheap.** Every load-bearing figure from one agent's report was re-measured with a throwaway test file read off the failure message and deleted immediately. All of them reproduced exactly, which is the outcome that makes the check worth keeping.

## Tests

**Pin relations by test, never magnitudes.** One number was derived twice and wrong twice, on a thing a human settles in ten seconds of play. What survives is the property, not the figure.

**When a test asserts absence, check the input can produce presence.** A lifecycle test played a run for 200 ticks and asserted nothing was visible in one layer. The content could not produce anything in that layer in that window, so the assertion passed over an empty set. Disable the fix and watch it go red; that is the only proof a guard is a guard.

**An assertion written as a table can still be toothless.** One would have failed the day it was added, so it shipped with an allowlist. It passes today and keeps passing after the thing it governs is finally drawn. An allowlist with written reasons is the honest form, but **the requirement is recorded rather than inherited unless something forces the next dispatch to read it.**

**No flaky tests.** A failure is data. Several rounds of non-standard fixes (polling, timeout bumps, retry wrappers) means the test is probably wrong.

## Verification

**The on-device step is an instrument, not a formality.** Twice now, one human sitting down with the build found something six gate rounds and multiple reviewers did not, and both times it was layout rather than logic. Ship to it early rather than polishing first.

**Driving an app through a CLI browser cannot substitute for using it.** Command latency is seconds; the things being read last fractions of a second. **Say which reads were not obtained rather than implying the rendered check was complete.**

**A bug a refresh makes go away is a boot-order bug, not a flake.** **When a symptom disappears on reload, ask what the first load measured that the second one did not**, rather than accepting the reload as a fix.

**A layout rule that names a viewport is usually the wrong rule.** The first candidate fix read exactly like the reported symptom and fixed the case that was played, then failed at a different window size. The rule that held named no viewport at all. **Test a candidate layout rule across a sweep before believing it**, because the reported case is one point on a curve.
