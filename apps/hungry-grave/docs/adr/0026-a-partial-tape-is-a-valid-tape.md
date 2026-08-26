# A partial tape is a valid tape

Nothing in the tape format may require a value known only at run end. The header is written before the first tick, run-end values live in a trailer written once at the stop, and the decoder accepts a body that stops mid-stream, verifying to its last complete checkpoint. A missing trailer is itself the reading, a `stop` of unknown: one of the two shapes "too easy" takes is a player losing interest and closing the tab, and a format that yields tapes only for finished runs is structurally blind to the failure the instrument was built to find.

The self-describing alternative, totals in the header or an index written at the end, was rejected because it records only finished runs; MP4's trailing index, which makes an interrupted recording unplayable, is the named precedent.

Extracted from Hungry Grave ADR 0018 on 2026-08-26, decision unchanged. Ruled by Mark 2026-08-23; the argument is in [../design/analytics-and-replay-grill-2026-08-22.md](../design/analytics-and-replay-grill-2026-08-22.md).
