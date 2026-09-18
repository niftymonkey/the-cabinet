# Where the retired ADRs went

This set was condensed from 64 records to 16 on Mark's ruling of 2026-09-17. The review every ruling came from is `docs/push/adr-review.md` at this commit's parent, card by card with the objection against each proposal; that file is push scaffolding and is removed when the branch merges, so the table below is what survives it.

The bar a record has to clear is Mark's: a really large, important, extremely tough-to-reverse, hard-won decision. A choice made in the moment, however real, is a design-record ruling and lives in the narrower home that owns it, a design record, the glossary, the lessons file or the feature flow. The 16 records that cleared it are the files beside this one, and the table below is every number that did not: it is a retirement map rather than an index. Citations to those numbers still appear in code comments, tests, design records and the glossary, and they were left alone on purpose, because this table is how they resolve. Paths are from the app root, `apps/hungry-grave/`, except the feature flow, which is the repo's own `docs/agents/feature-flow.md`.

| # | Title | What happened |
| --- | --- | --- |
| 0004 | One freshness meter | demoted to `docs/design/game-concept.md`, The core loop |
| 0005 | Weapon lines are a pool | demoted to `CONTEXT.md`, the Weapon line entry |
| 0006 | Authored waves, not a director | merged into ADR 0047 |
| 0009 | The base is the create-pixi creation-web template, and React is out | deleted |
| 0010 | The prototype boundary | deleted |
| 0011 | Each input owns its speed | demoted to `docs/design/game-concept.md`, the controls line, with the touch-cap trap to `docs/lessons.md` |
| 0012 | A fresh seed per run, a pinned seed as the instrument | deleted |
| 0013 | The sim verification contract | demoted to the feature flow, the verification menu |
| 0015 | Determinism across devices | merged into ADR 0019 |
| 0016 | Mob types and formations are pools | demoted to `CONTEXT.md`, the Mob type entry |
| 0018 | The tape format | demoted to `CONTEXT.md`, the Tape and Observation entries |
| 0020 | Replay ships and is not a challenge | deleted |
| 0021 | The instrument's purposes are an open pool | demoted to `CONTEXT.md`, a new Instrument entry |
| 0022 | Instrumentation controls are gated at build time | deleted |
| 0023 | Invariants are always on | deleted |
| 0024 | Invariant faults carry severity | deleted |
| 0025 | The stage watch belongs to Execution | deleted |
| 0026 | A partial tape is a valid tape | deleted |
| 0028 | The run's outcome is orthogonal fields | demoted to `CONTEXT.md`, a new Ending entry |
| 0029 | The tape holds exactly what the simulation consumed | deleted |
| 0030 | Steering carries the simulation's own precision | demoted to `docs/design/analytics-and-replay-grill-2026-08-22.md`, the superseded quantisation paragraph |
| 0031 | Damage is attributed in both directions | deleted |
| 0032 | The frame row | demoted to `CONTEXT.md`, a new Frame row entry |
| 0033 | Verification readback is not replay | demoted to `CONTEXT.md`, the Verification readback entry |
| 0035 | Homing is capped at one | merged into ADR 0005, which is itself demoted, so the cap sits in `CONTEXT.md`, the Weapon line entry |
| 0036 | The bell is a timed pulse of cones | demoted to `docs/design/weapon-pool-review.md`, Repel |
| 0037 | Live mobs are never food | demoted to `docs/design/game-concept.md`, the Size is health section |
| 0038 | The belch binds to a dedicated button | deleted |
| 0039 | The field boundary is a readout | demoted to `docs/research/readability-value-band.md`, section 7.6 |
| 0040 | A hit announces by subtraction | demoted to `docs/research/readability-value-band.md`, section 1.4 |
| 0041 | A mob holds the formation's arriving motion for a beat | demoted to `CONTEXT.md`, the Arriving beat entry |
| 0044 | Territory is autonomous controlling ground | demoted to `docs/design/weapon-pool-review.md`, Territory |
| 0045 | The birthright is the skull stream alone | deleted |
| 0048 | A missed carrier is missed, and the schedule carries the slack | merged into ADR 0002 |
| 0049 | The stage runs eight to ten minutes in named sections | deleted |
| 0050 | Three sections, and one boundary is not a boss | deleted |
| 0051 | The drain-out becomes a sparse last wave | deleted |
| 0052 | The Undertaker's length is bought in phases | demoted to `docs/design/stage-floor.md`, section 4 |
| 0053 | The playing harness is one policy over many seeds | demoted to `docs/design/playing-harness.md`, sections 2 and 4 |
| 0054 | The ladder reads twice, in the storm and on the HUD | demoted to `docs/design/show-what-you-have.md`, a ladder section |
| 0055 | A stripped rung falls onto the field as a body | demoted to `docs/design/show-what-you-have.md`, a fallen rung section, with the harness take-rate sentence to `docs/design/playing-harness.md` |
| 0057 | Every run lands in one store, bytes beside columns | demoted to `CONTEXT.md`, the Store entry |
| 0058 | Each on-swallow line pays in its own currency, at its own cadence | demoted to `docs/design/weapon-pool-review.md`, the freshness defect section |
| 0060 | Growth over the run is authored per section, and the director never owns it | demoted to `docs/design/mow-ladder-director.md`, a stage growth section |
| 0061 | The system vocabulary is the genre's and flavor stays at the player's surface | demoted to `CONTEXT.md`, a Language preamble |
| 0062 | A reading's meaning is declared, never taken from the shape its value happens to have | demoted to `CONTEXT.md`, a new Reading entry |
| 0063 | A run's starting condition is one record | demoted to `CONTEXT.md`, the Starting condition entry |
| 0064 | A tuning magnitude is a row of one record, resolved at the shell and carried on the run | demoted to `docs/design/tuning-record.md` |
