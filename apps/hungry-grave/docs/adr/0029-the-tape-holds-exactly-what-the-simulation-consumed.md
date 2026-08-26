# The tape holds exactly what the simulation consumed

The tape always contains exactly the commands the deterministic simulation consumed, never rounded or transformed after that boundary (Mark's stated invariant). Steering is therefore quantised inside `executeTick`, before the simulation sees the value, so recording at the one execution authority (Hungry Grave ADR 0017) makes the invariant structural rather than a rule to remember.

Both other homes for the quantiser were designed and rejected. At `combineSteer`'s call site it covers only the live input path: the bot policies, the golden scenario's script and the test helpers never pass through it, so a tape of a bot run would hold something the simulation did not consume. Inside the tape encoder it is worse: replay then feeds a different number back in and the run drifts, which is precisely the divergence Hungry Grave ADR 0015 and the golden digest exist to catch.

How the consumed command is encoded on the tape is its own decision and its own record (Hungry Grave ADR 0030).

Extracted from Hungry Grave ADR 0018 on 2026-08-26, decision unchanged. Ruled by Mark 2026-08-23; the argument is in [../design/analytics-and-replay-grill-2026-08-22.md](../design/analytics-and-replay-grill-2026-08-22.md).
