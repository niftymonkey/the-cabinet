# Mob types and templates are pools

A mob type owns its own properties rather than being one entry in a fixed cast: how it moves, whether and how it fires, its health, its corpse payout, and its size. The pool is open by design, the same treatment weapon lines got in Hungry Grave ADR 0005, and one rejection rode with it: a type firing tracking shots was rejected, because homing pointed at the player takes away the answer positioning is supposed to be (ruled by Mark 2026-08-19). The current roster lives with the code, not here.

A template owns placement and entry, never who is in it: it says where a group arrives and how it is arranged, and the mob type inside it supplies the motion and the firing. This is what lets both pools grow without multiplying into each other: a single-file lane of base trash falls in a line, and the same lane of the body-threat type arrives in a line and then turns, which is two completely different waves out of one template. The library is open on the same terms, and a new template has to teach a lesson no existing template teaches, or the library becomes six flavors of "some mobs come down". This supersedes the slice-era statements that the library is six shapes with the one trash mob playing all of them, and that the Undertaker's diggers are that one trash mob respawned.

The type pool's admission rule is readability: a mob type must be readable before it acts, its silhouette saying what it does, one that will shoot looking armed rather than identical to one that never shoots, and its fire staying large, slow, irregular, and inside the value band Hungry Grave ADR 0014 reserves for mob fire.

Content stays counted in authored rows, never as mob types multiplied by templates, and count stays on the row rather than in the template (Hungry Grave ADR 0006). Live mobs are never food whatever their type (Hungry Grave ADR 0037). The arriving beat is ADR 0041 and the set-piece rule is ADR 0042, both extracted from this file on 2026-08-26.

Ruled by Mark 2026-08-19 across the pools work and the three review gates.
