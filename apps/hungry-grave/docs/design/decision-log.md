# Decision log, The Hungry Grave

Newest entries at the top. One entry per decision moment, dated, with enough context to stand alone. Reopening any logged decision is welcome; argue from the game.

## 2026-08-17, entry 2: the conveyor cure is one freshness meter

Resolved wayfinder ticket #27 with Mark. The cure for bottom-edge camping is both candidate mechanisms folded into a single per-corpse freshness meter, not two systems.

1. Every corpse runs one meter, about 10 seconds from kill to gone. The seconds are derived and the coupling is the invariant (game design gate): a mid-screen kill must reach the bottom edge nearly empty, so any scroll-speed retune retunes the meter to hold that ratio.
2. Freshness multiplies all three payouts (size growth, burst volley, belch reservoir charge) down to a floor of about 25 percent; scraps are never worthless.
3. Slice read: fill brightness fades as the meter drains; corpse size stays constant so corpse-vs-drop shapes stay unmistakable and stale scraps stay easy to drive over. Near empty, a brief last-chance flicker (game design gate: Devil Daggers pairs its window with one, and a continuous fade alone reads "how much" but not "vanishing now"). At empty the dirt sucks the corpse under, a short swallowed-by-the-earth animation Mark wants even in the rectangle slice.
4. Upgrade drops never decay; the scroll is their only deadline. Permanent power never silently rots, and the steady-bright drop beside fading corpses is an extra legibility cue.
5. Boss-shed edible pieces inherit the same meter by default; ticket #29 may override for feast chunks.
6. Watched risk, deferred to the slice's after-hit instrument: freshness thumbs the spiral side of the open comeback-versus-spiral question, since the player pinned low after a hit is the one eating quarter-value scraps. Fallback cures if it bites (game design gate): a higher freshness floor at the smallest size tier, or freshness scaling only burst and belch while growth stays flat.

Success is measurable by the slice's off-bottom-edge instrument. Comparables that priced the call: Devil Daggers' ~10s gem decay (deadline produces the attack-then-scoop rhythm), DoDonPachi bees and Raiden medals (placement-scaled value), Vampire Survivors' persistent gems (what camping looks like when pickups never expire).

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
