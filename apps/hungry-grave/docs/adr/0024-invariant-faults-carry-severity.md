# Invariant faults carry severity

A fired invariant does not end the run by itself. Every fault is fatal or recoverable, and the test is semantic safety, never how cosmetic the symptom looks: fatal means continued execution would be unusable or untrustworthy and stops the run; recoverable means execution can safely continue, and the fault is recorded while the run carries on. Checks record their fault and return rather than throw, so a recoverable fault can never mask a later fatal check. Precedent: Unreal's `ensure()` against `check()`.

The per-check classification is retunable severity policy and lives in the code beside the checks. Two consequences are format-locked instead: a fault's identity is a closed append-only list, encoded per Hungry Grave ADR 0019's code-map rule, and a replay reports the faults the tape carries separately from what today's checks say, so a severity retune never invalidates an existing tape.

This supersedes the earlier ruling that a broken invariant stops the run. Both were Mark's, ruled on 2026-08-23: the earlier came out of the grill and was right that the frozen dead canvas is the bug, and it was superseded the same day, when reading the fourteen checks against the code showed that only some describe an unplayable field.

Extracted from Hungry Grave ADR 0017 on 2026-08-26; the extraction moved the record and changed no part of the decision. The argument is in [../design/analytics-and-replay-grill-2026-08-22.md](../design/analytics-and-replay-grill-2026-08-22.md).
