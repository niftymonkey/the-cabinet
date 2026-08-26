# Verification readback is not replay

Verification readback exists to prove that a newly recorded tape can be decoded and deterministically reproduced: work may verify the artifact it creates. It satisfies no player-facing replay obligation, however much replay machinery it shares, and the specific hazard this record guards is the "small replay on the way to a full replay" framing, which lets an obligation quietly look discharged, because a small thing sounds like a stage on the way to a big thing, and this is not a stage. The hazard does not age out as playback machinery becomes real: a reader who finds code that decodes a tape and re-runs it, or a canonical playback primitive beside the verification wrapper, must not infer that the player-facing feature exists.

The protection travels in the name: the capability is called verification readback wherever the distinction can matter, in module and function names, tests, commit messages and tickets, and never replay.

Extracted and restated from Hungry Grave ADR 0020 on 2026-08-26, decision unchanged; the earlier requirement that this record's bullets stay quoted verbatim was retired in the restatement (ruled by Mark 2026-08-26). Ruled by Mark 2026-08-23; the argument is in [../design/analytics-and-replay-grill-2026-08-22.md](../design/analytics-and-replay-grill-2026-08-22.md).
