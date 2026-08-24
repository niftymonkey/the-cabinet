# The sim verification contract

Every sim-bearing build verifies itself the same way, because tests written against existing code only prove the test agrees with the code. Spec tests are authored from the design record before they ever run against an implementation, each citing the entry, ADR, or spec line it enforces, and a failing spec test indicts the code, never the test. Sim invariants (in bounds, size within floor and ceiling, no NaN, entity caps) are checked on every step in every sim test. A deterministic headless bot plays the full run in a test and asserts the run's shape: length in band, kills in band, ten to twelve drops, phases in order, both endings reachable, zero invariant fires. The same bot runs as a dev-only autopilot in the rendered game, so full-stage rendering can be watched and screenshotted without a human, and a browser boot check covers load, canvas, input, and console errors.

Feel evaluation is the human's, never the agent's. The repo's feature playbook (`docs/agents/feature-playbook.md`) carries the generic flow; this ADR carries the sim-specific contract it composes with.

**Amended by Hungry Grave ADR 0017 on 2026-08-23.** The invariant harness is no longer confined to `src/dev` and no longer runs only in tests: it lives in `src/game` and it checks every tick in every build, including the one a player plays, because a tape's honesty must not depend on which build recorded it. Everything else here stands, and 0017 carries what the shipped game does when a check fires.

Decision log entry 6.5; reaffirmed for the tracer by Mark 2026-08-19.
