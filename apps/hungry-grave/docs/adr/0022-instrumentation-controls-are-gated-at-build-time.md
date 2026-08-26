# Instrumentation controls are gated at build time

A measurement or development control must be unreachable in a player build by construction: gated at build time, never by naming, convention or an unlisted URL, because a URL parameter is reachable by anybody who types one. The consequence is an instrumentation build flavour that honours the controls and a player flavour that ignores them, differing in nothing else, so a reading taken on the instrumentation build is a reading of the code a player runs.

This settles no deployment architecture: the gate is a property of the code, not of any URL.

Extracted from Hungry Grave ADRs 0017 and 0020 on 2026-08-26, restated with the gate as the decision and the flavours as its consequence. Ruled by Mark 2026-08-23; the argument is in [../design/analytics-and-replay-grill-2026-08-22.md](../design/analytics-and-replay-grill-2026-08-22.md).
