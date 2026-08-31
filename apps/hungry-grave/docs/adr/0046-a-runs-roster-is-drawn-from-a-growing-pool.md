# A run's roster is drawn from a growing pool

The pool of weapon lines grows over the game's life, and each run fields a roster drawn from it, with the skull stream the one constant every run. Playing more unlocks lines into the pool, in the Vampire Survivors shape, and this is the game's first cross-run persistence commitment: state outside a run's seed now exists and matters. ADR 0005 stands untouched, the admission rule and line-owns-its-properties shape included; this record adds how a particular run meets the pool.

Two consequences named now. A tape must replay without the player's unlock state, so the header records the run's resolved roster in ADR 0027's resolved-values pattern, a small list rather than stored state; the header field already exists (ADR 0043), and the real implementation cost is sim-side, because the roster resolver, LineState, and the witness all assume exactly the compiled four lines today. And the unlock pool is the game's first stored cross-run state, so what happens when browser storage is denied or evicted needs a ruling before the unlock dispatch builds it, not during.

A shared or pinned seed carries its resolved roster exactly as a tape does, so a shared seed stays the same run whatever either player has unlocked, which is what ADRs 0012 and 0020 promise; Binding of Isaac's and Slay the Spire's dailies fix unlock state the same way.

Ruled by Mark 2026-08-31 in the belch-thread grilling.
