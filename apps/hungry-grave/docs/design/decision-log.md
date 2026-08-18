# Decision log, The Hungry Grave

Newest entries at the top. One entry per decision moment, dated, with enough context to stand alone. Reopening any logged decision is welcome; argue from the game.

## 2026-08-17, entry 1: First Dig verdict is Pursue, and the founding decisions

First Dig (the /new-game-idea workflow) ran end to end: capture, grilling, three review gates plus a follow-up frame gate, verdict. Mark accepted Pursue and shelved housewarming to focus here. Full evidence and numbers: [first-dig-2026-08-17.md](first-dig-2026-08-17.md). Concept: [game-concept.md](game-concept.md).

Decisions locked in this entry, each Mark's explicit call:

1. The game: "The Hungry Grave", a Halloween vertical scrolling shmup crossed with hole.io; the protagonist is a moving open grave, chosen over hearse, war-wagon, and nine other candidates for having the highest weapon-line saturation potential (the swallow economy plus multiplicative growth).
2. Mechanical ending: authored stages capped by a final boss. v1 done-line is one stage plus final boss; three stages stay the target. Survival-timer and endless modes are future iterations.
3. Frame: pure vertical scroller for v1. The scroll is the corpse deadline. Free-roam arena is recorded as the deferred survival mode's native frame; a panning-wide playfield is a dont-build.
4. Economy: hybrid. Always-on free weapon lines carry saturation; each swallowed corpse erupts as a burst; strict corpse-per-bullet was killed by arithmetic (needs ~200 kills/s). Corpses must be physically eaten by driving over them.
5. Size is health, with a hard size floor (can always eat the current tier's smallest corpse) so the comeback path never closes.
6. Overflow rule: drops for maxed lines are still eaten (radius, score, bomb charge). Everything goes in the hole. Death costs a chunk of weapon levels and some radius, so late drops re-matter.
7. Controls: steering, autofire, one button, the belch (capped reservoir, visible overflow waste).
8. Gate adjustments accepted as design rules: conveyor cure required (decay or freshness, ticket open); bosses shed edible pieces; readability layering from day one; hits never zoom the camera back mid-stage; satellites (if ever) never automate eating; zoom tiers and satellites deferred with named triggers.
9. Sidecar and tracker: the game lives at apps/hungry-grave; planning runs on a Wayfinder map as GitHub issues per docs/agents/issue-tracker.md.
