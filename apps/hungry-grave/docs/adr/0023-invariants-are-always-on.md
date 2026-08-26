# Invariants are always on

The invariant checks run on every tick, in every build a player is handed, with no flag and no opt-out. The obvious alternative, stripping checks from release builds, was rejected because an escape hatch makes a tape's honesty depend on which build recorded it, and a tape whose honesty is conditional is worth less than no tape. A tape recorded with the checks off, via the since-removed measurement control, declares itself `integrity: unchecked` (Hungry Grave ADR 0018).

The decision stands on a measured cost, about 3.3% of a frame in the worst desktop catch-up case; #45 and #48 carry the working, and the phone remains unmeasured.

Extracted from Hungry Grave ADR 0017 on 2026-08-26, decision unchanged. Ruled by Mark 2026-08-23; the argument is in [../design/analytics-and-replay-grill-2026-08-22.md](../design/analytics-and-replay-grill-2026-08-22.md).
