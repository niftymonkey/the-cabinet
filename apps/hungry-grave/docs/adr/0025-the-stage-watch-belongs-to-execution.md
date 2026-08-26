# The stage watch belongs to Execution

`checkStage`'s per-run phase history is a field on `Execution`, never on `RunState`. Hungry Grave ADR 0019 makes `RunState` the surface a replay is checked against, and a phase watch is neither the run's identity nor something the rules mutate, so it lives with the observer rather than the observed. This supersedes the note on #45 that placed it on `RunState`: that note predates ADR 0019 and could not have known `RunState` would become the replay-checked surface.

Extracted from Hungry Grave ADR 0017 on 2026-08-26. The extraction moved the record and changed no part of the decision; the supersession above was ruled with the decision itself, on #45 and the analytics and replay grill of 2026-08-22.
