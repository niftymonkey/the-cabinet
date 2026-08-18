# Decision log, The Hungry Grave

Newest entries at the top. One entry per decision moment, dated, with enough context to stand alone. Reopening any logged decision is welcome; argue from the game.

## 2026-08-17, entry 4: the slice miniboss and boss

Resolved wayfinder ticket #29 with Mark. The slice miniboss is the Banshee, the boss is the Undertaker, bosses are always shootable and bell-push-immune, and both boss questions routed from ticket #28 are closed.

1. Skeleton: always shootable, health bar in chunks, one pattern per chunk, short invincible flash at chunk breaks during which player shots do nothing. Touhou-style pure-dodge survival phases were priced and declined v1-wide (see point 9). This dissolves the routed wisp question: homing wisps are plain damage against bosses, no boss-side rule needed.
2. Bell versus bosses (routed from #28): full bell damage, zero pushback on miniboss and boss, adds pushed normally. Vampire Survivors precedent: bosses and elites resist or ignore knockback so big enemies cannot bounce off their own threat; protecting authored patterns is the day-one readability rule.
3. The Banshee: chunk one is slow expanding tear-rings with one clean gap each; chunk two adds a second offset ring source so gaps desync. Rings beat aimed fans because slow curved shapes read through the player's own storm (Boghog's shmup 101, Sparen's danmaku design guide: low density and clear bullet direction carry readability). Her ring deliberately echoes the player's bell ring, two owners of one shape, split by layer and palette.
4. The Undertaker: chunk one is falling clod-curtains with one moving gap; chunk two is a slow shovel spiral plus summoned digger zombies whose corpses feed the fight. Mark's concern that a fixed gap punishes size earned before the fight produced the rule: gap width equals current hole diameter plus a fixed margin, and clods are ordinary bullets (one small shrink), never walls.
5. Freshness: shed armor and add corpses decay normally, the urgency being the point; phase-break feast chunks never decay, like upgrade drops, so the reward beat is calm and steady-bright keeps meaning treasure.
6. Banshee death feast: growth worth roughly 8 to 10 fresh trash corpses plus an instant full belch with a pulsing glow, and the next wave arrives deliberately oversized as the belch's target. Undertaker death: the swallow is the victory animation, no payout; the grave eats the gravedigger.
7. Raised by Mark at close-out, recorded as map fog rather than a slice change: difficulty modes for replayability (normal and up, tuning density and speed) and whether v1 is the polished slice stage itself, Vampire Survivors' one-map first version being the shape.
8. Belch versus bosses, the gap the product gate caught (neither the grilling nor the routed questions had ruled on the one button): the belch is the bomb everywhere, cancelling every enemy bullet on screen including boss patterns, dealing a big chunk of boss damage, never pushing a boss, with the pattern resuming immediately (genre standard: shmup bombs clear bullets and damage bosses). Mark's condition: the taming is tracked work, not a hope; the map's belch-tuning fog now covers boss fights and the slice instruments belch rate inside each boss fight.
9. Gate adjust (product vision): the no-survival-phase rule is v1-wide, not slice-only, argued from identity (the player's storm must always matter, and an untouchable boss suspends the fantasy); reopenable per this log's preamble if a later boss concept earns it.
10. Gate adjusts (game design + product vision) accepted: the oversized post-Banshee wave is already arriving when the full-belch glow lands, so the loaded belch is never reflexed into empty sky (slice instrument added); the digger zombies are the slice's one trash enemy re-spawned by the boss, no new enemy budget.
11. Shared ring shape deferred with a trigger, both gates converging: the Banshee's tear-ring deliberately shares the bell ring's shape, and if a slice tester misreads a tear-ring as their own bell or cannot say which ring hit them, the cure is shape-breaking the tears into teardrops before touching the pattern.

## 2026-08-17, entry 3: the four weapon lines

Resolved wayfinder ticket #28 with Mark. The v1 lines are the soul stream, orbiting headstones, will-o-wisps, and bell shockwaves; grasping hands are cut from the working set.

1. Floor versus burst: the stream and headstones are always on; the wisps and bells fire per swallow, so eating defends the dive at the exact moment of commitment and the funeral bell doubles as the eat-chime the First Dig flagged as load-bearing for the sparse early minutes.
2. Gate adjust (game design): the baseline eat-chime and swallow juice fire from the first swallow regardless of loadout, since lines arrive as RNG drops; the bell line upgrades the chime the player already knows into the damage ring. The alternative (bell as a guaranteed starting line) was not needed.
3. The soul stream never homes; levels add straight fanned columns. Homing is the wisps' identity only, with no cross-line homing upgrades: homing trades power for convenience, and in a game whose one skill is positioning it stays quarantined behind the eat verb (shmup homing-design writing; gate adjust trimmed the citation so Thousand Edge is cited only for straight high-count fire staying readable, while fanned density is vulcan-lineage grammar).
4. Live enemies are never food; contact shrinks the hole the same as enemy fire. This is the anti-cheese rule that stops "get big and drive under everything," raised by Mark's own question; the unopposed hole reading as shallow is the documented Donut County failure.
5. Grasping hands cut because their jobs are spoken for (close defense is the headstones', crowd punctuation the bells') and they read on the ground layer where corpse-versus-drop legibility lives. Close-defense orbiters are a proven archetype (King Bible and Garlic in Vampire Survivors).
6. Mouse-cursor aiming raised and declined; controls stay as boxed (entry 1, point 7). No-aim positioning is the genre's skill axis, and aim variants are a recorded different feel routed to the deferred arena mode. Both cuts are now dont-builds in the concept doc.
7. Saturation plausibility from geometry: five columns at 25-30 visible skulls each hold 100-150 airborne from the stream alone, independent of fire rate; with stones, wisp flights, rings, geysers, and belch spikes the ~300 target is tuning, not content, exactly what the numbers table demanded.
8. Watched risks routed onward: bell knockback pushing kills up-screen into staler corpses under the freshness meter (slice instrument added: average freshness at swallow), line distinguishability at full density (slice instrument added), both to #30; boss interactions (pushback immunity, wisp auto-DPS through dodge phases) to #29.

Level-1-versus-5 silhouettes for all four lines are in the concept doc's economy section and the ticket #28 resolution comment.

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
