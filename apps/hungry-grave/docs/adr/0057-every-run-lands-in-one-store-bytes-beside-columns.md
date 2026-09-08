# Every run lands in one store, bytes beside columns

Runs go to a service with a database behind it. Three things are kept, and the order matters: the sealed tape bytes exactly as recorded, the header parsed into columns beside them, and the readings derived from replaying a tape cached as a third thing, each stamped with the build that computed it. A person's run and a harness run land in the same tables, told apart by what the header already carries, the author, the input device, and the policy that steered (ADR 0053), so the harness's batch report becomes a query rather than a second system.

The bytes come first because they are the only thing a replay can run. A tape refuses to replay across a simulation change, the witness checks the bytes themselves, and the export path is forbidden from re-encoding, so a parsed row is a convenience for finding and comparing runs and never a substitute for the artifact. The derived readings are a cache and are treated as one under ADR 0018's rule that anything recomputable stays out of the record. The build stamp says which build computed a reading and nothing more; whether a reading still holds is answered by replaying the tape and letting the witness attest the run (ADR 0019), never by comparing stamps, because a fingerprint standing in for fidelity is what ADR 0019 rejected outright. Nothing in the store is authoritative except the bytes.

Uploading a person's run needs their consent, and the shape of that consent is a craft call in [../research/section-feel-consent-and-rung-restore.md](../research/section-feel-consent-and-rung-restore.md) rather than a rule here. The game uploads at the end of a run; the harness pushes its batches to the same tables.

The cost is the project's first piece of backend: an upload path and a database attached to the deploy, where until now the game has been a static site. Which products serve it is an implementation choice and not this record's.

This replaces hand-carried tape files as the destination for a run. That escape hatch's own comment already called it scaffolding to be removed once something durable existed.

Ruled by Mark 2026-09-07 in the V1 grill.
