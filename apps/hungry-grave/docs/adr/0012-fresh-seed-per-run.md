# A fresh seed per run, a pinned seed as the instrument

Every fresh run rolls a fresh seed: first play, restart, and play again each roll fresh dice, because different seeds play as meaningfully different games and that variety is a keeper. A seed in the URL pins the run in either form (`?seed=` before the hash or after the route), and pinning is the playtest instrument: identical-run comparisons live behind an explicit URL, never the default. The two forms are equal until both are present, and then the hash's query wins, because the hash is this app's single navigation authority and the only part that changes without a reload. That precedence and the pinned-or-rolled readout below were both ruled in the dispatch-3b plan on 2026-08-20, after all three review gates found the ADR silent on the collision.

A run's seed stays visible in the UI, so seeds work as shareable challenges, and it says whether it was pinned or rolled, because a tester handed a `?seed=` link would otherwise play identical runs with nothing on screen saying so. Ruled after a silently defaulted seed made a dozen playthroughs the identical run.

Decision log entry 13.
