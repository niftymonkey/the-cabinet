# The header records resolved values, never absences

Every starting value in the tape header is recorded as the value the run actually started from, never as an absence meaning "the default". A run with no `?size=` pin records the compiled `SIZE_START` it resolved to, and a run with no `?levels=` pin records the birthright, on the same terms: recording the absence would let a later tune of the default silently change what every old tape replays as. The header is one-way once tapes exist, so the replay meaning of a tape must be closed at record time, and verification readback rebuilds a run from the header alone, so an unresolved field would diverge at checkpoint 0.

The rule decided the size field and, a day later, the starting levels, and it governs any starting value the header gains.

Extracted from Hungry Grave ADR 0018 on 2026-08-26, decision unchanged. Ruled by Mark 2026-08-23 and 2026-08-24; the argument is in [../design/analytics-and-replay-grill-2026-08-22.md](../design/analytics-and-replay-grill-2026-08-22.md).
