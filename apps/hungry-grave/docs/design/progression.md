# Design record: progression mechanics (path step 1, ticket #96)

The craft calls this step ran on, each taken by the dispatching session under the push's pre-authorization item 8 (`docs/push/pre-authorizations.md:14`), each backed by research or by a measurement in the tree.

Every magnitude below is an initial data row. The harness (step 3) reads it and the tuning pass (step 4, #39) moves it. Nothing here is a ruled number, and nothing here belongs in an ADR.

Step 1 was planned before the other steps split their design record from their build plan, so this record was written on 2026-09-17 out of the plan's own durable half. The build plan itself, its slices, its verification menu and its test list, resolves in git history at the parent of the commit that retired it (`../lessons.md`).

---

## 1. The craft calls, each backed by evidence

**Carrier slack `CARRIER_SLACK = 1.3`, so the schedule holds 25 carriers against a full build's 19.** The 19 is derived, not picked: `(5 - 1) * 1 + 5 * 3` at the four-line roster. The slack is bounded by the two shipped ends ADR 0048 cites: DoDonPachi's four carriers are the tight end (no slack at all) and Touhou's Embodiment of Scarlet Devil pays roughly two stages of supply against about 500 kills to max, which is well over 100 percent slack. Thirty percent sits at the tight end of that band, which matches a five-minute single stage rather than a six-stage campaign.

**Which mobs in a row carry: the middle of the row's placement order, one carrier per carrying row.** ADR 0016's readable-before-it-acts rule and the arming precedent at `mobs.ts:95` (`isArmed(row.fire.armedShare, order.index)`) both key a per-mob property to a per-mob number, so the carrier follows the same mechanism rather than inventing one. It keys off the position in the placement order and not off `SpawnOrder.index`, which the arming reads: on the two mirrored templates that index is the rank within an arm, repeated once per arm on purpose, so keying the carrier to it would put one on each arm and break the one-carrier-per-row rule in the same sentence that states it. Middle rather than first, so a Pincer's symmetry, whose whole lesson is a symmetry that asymmetric arming would read as noise, is not broken by the carrier riding at the head of one arm.

**Offer spacing `OFFER_SPACING = 90` field units, three bodies spanning 180 of the field's 540.** Derived from the grave's own reach: `graveWidth(size) = size` at `GRAVE_ASPECT` 2 (`grave.ts:71-73`), so at the size ceiling of 67.5 the grave's half-width is 33.75 and a drop's half-extent is 14 (`corpses.ts:53`), giving a catch reach of 47.75 from the grave's centre. At 90 apart, two adjacent bodies are both reachable only from within 45 of their midpoint, which is inside the reach by 2.75 units. So the two-touch case is possible at the ceiling and impossible at the start size of 27 (reach 27.5), which is the shape the choice wants: the tie-break is a rare late-run event, not the normal case. Three bodies at 180 units is a third of the field's width, so choosing is a real move.

**Offer entry for a banked offer: `OFFER_ENTRY_DEPTH = 26` above the top edge, at the grave's own x.** Nothing ruled where a banked offer opens, and the death that paid it has scrolled away by the time it opens. Twenty-six is the templates' own `BODY` and `ENTRY_DEPTH`, so an offer enters the field exactly the way a wave does and nothing pops into existence on screen. Opening at the grave's x is not the drifting offer ADR 0048 rejects: it is placed once and then the world scrolls, and the grave has to stay under it.

**Nothing offerable: the carrier's death opens a single body carrying no line.** ADR 0034 says such a drop converts to overflow, keeping ADR 0002's nothing-swallowed-is-worthless promise. A body with `line: undefined` swallows through `swallow.ts`, pays growth and reservoir, and whatever the ceiling refuses becomes overflow. Below the ceiling it pays growth rather than score, which is a narrower reading than ADR 0034's word "overflow"; the alternative, adding score silently with no body on the field, deletes the dive and contradicts ADR 0002's everything-goes-in-the-hole. A run with every line maxed is almost certainly at the ceiling anyway, where the two readings coincide.

**What that body looks like: the food layer's own body shape in the feast's colour.** Taken as a correction at step 1's implementation gates, 2026-09-08. `drawDropIcon` requires a `WeaponLine`, so a body with no line had no look at all and fell through a default that drew it as a skull-stream drop. It gets its own draw path instead of a fake line: a hexagon at the drop's own drawn extent, breathing the way every drop breathes, filled with `PALETTE.feast` rather than `PALETTE.drop`. Silhouette is ADR 0014's first discriminator, so a maxed player reads permanent food with no build rather than hunting for a line the body does not carry, and the colour keeps it inside the treasure family instead of making it look like a corpse.

**The fixed first offer is a preference and not a demand.** A run pinned part-built can hold its birthright at max and every other line partway up, so it has no unowned line to draw and no birthright line to offer. An offer that insisted on the fixed shape there came back with nothing at all and handed the carrier a no-option body while three lines still had rungs left, which is what the rich measurement fixture caught. The rule is: take the offerable birthright lines, fill from the unowned, then fill any room left from the rest of the offerable pool. A fresh run is unchanged, because its unowned lines fill the offer before the last step is reached.

**Two-touch tie-break: the body whose centre is nearest the grave's centre, ties broken by the lower entity id.** Deterministic, needs no new stream draw, and is the reading a player would give.

**Bell cone rows.** Cone counts are Mark's own shape, one per level from one to five. The arc a toll actually covers climbs 90, 160, 196, 288 and 330 degrees, so at level five the surround is back as five cones separated by five six-degree slits, one of them dead astern: it reads as cones rather than as the old circle, which is what ADR 0036's earning back the whole surround at field scale asks for. Reach is derived area-preserving against the old ring radii, which is what "reach grows to compensate" means in numbers: preserving a circle's area `pi*r^2` in a wedge of total angle `t` gives `R = r * sqrt(2*pi/t)`.

The `t` in that derivation is the summed width of the cones, which is the column below, because the area of `n` wedges is `n * halfAngle * R^2` however they are pointed. It is the covered arc only where the cones do not overlap. Level three is the one row where they do: its three cones sum to 228 degrees of width and cover 196 degrees of arc, so its reach of 207 is derived against an area that counts the two overlaps twice and is that much generous. Initial rows.

| Level | Headings (deg from straight up) | Half-angle (deg) | Cone width summed (deg) | Reach | Push |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 45 | 90 | 160 | 6 |
| 2 | -40, +40 | 40 | 160 | 183 | 10 |
| 3 | -60, 0, +60 | 38 | 228 | 207 | 16 |
| 4 | -108, -36, +36, +108 | 36 | 288 | 231 | 26 |
| 5 | -144, -72, 0, +72, +144 | 33 | 330 | 261 | 40 |

The headings are written in degrees and converted once at the row, because degrees are what a person tunes in. Every row is symmetric about straight up, so no player ever learns a left-handed bell. At levels one to four the cones meet or overlap, so the toll answers one contiguous arc ahead and the open side is the rear; the slits arrive only at level five, where the wrap has gone all the way round.

**Cone headings are the row's own data, not a spacing rule.** One cone at level one points straight up, which is ADR 0036's level-one cone thrown forward. Level two's pair sits at forty degrees either side rather than at the even 180 a formula gives, because a cone dead astern at level two is the opposite of wrapping toward the sides. From there the pairs walk outward, reaching the rear only at level five.

**Push begins at level one.** Before this step it was zero through level three, and the evidence for moving it is the measured case #79 read: `BELL_PUSH_BY_LEVEL [0,0,0,0,20,40]` produced 42, 51 and 0 field units of total pushback and 4, 3 and 2 bell kills against roughly 267 mobs across three runs, which ADR 0036 records as evidence of a line that was never felt. Level five holds 40 so the top of the ladder is not retuned blind; the levels below it get a push they have never had.

**Belch burst radius `BELCH_BURST_RADIUS = 160` field units.** Under a third of the field's 540 width and equal to the level-one cone's reach, so the burst is legibly local against a field-wide gas. The evidence that the old scope was the problem is in ADR 0008: the 2026-08-31 tapes read the belch at 35 and 46 percent of all kills with the reservoir full 62 to 79 percent of the run. A local burst is the scope cut.

**Surge floor `SURGE_FLOOR_VOLLEYS = 1` and wisp floor `WISP_FLOOR_SOULS = 1`.** The wisp floor is ADR 0058's own word. The surge floor is the same argument transferred: `SURGE_VOLLEYS` is 2 and the freshness payout floor is 0.25, so an unfloored scale pays 0.5 volleys, and a swallow that fires nothing reads as a bug in exactly the way ADR 0058 names for the wisps.

**Level zero fires nothing whatever the floor.** `wisps.ts:36-38` states level zero is silence because homing is always bought with a dive. The freshness floor must not resurrect an unowned line, so the floor applies only above level zero. ADR 0058 does not state this because at the time of writing the birthright carried two lines and the case was less visible; ADR 0045 makes it live.

---

## 2. The calls the dispatching session took, 2026-09-08

The planning agent listed these as candidate rulings. Under the push's pre-authorization item 8 the dispatching session took each one. None is a new commitment at ADR level; each is a data row or a stand-in form that the harness and a person's play can overturn.

1. **Which body wins when the grave covers two of the three offer bodies.** The nearest body centre to the grave centre, ties broken by the lower entity id.
2. **Whether the two-touch case should be possible at all.** Possible at the size ceiling and impossible at the size floor, which is what a spacing of 90 gives.
3. **Where a banked offer opens.** At the grave's own x, one body-depth above the top edge, entering like a wave.
4. **Whether a carrier is visibly marked before it is killed.** Yes, with a stand-in mark: the mob renderer tints the carrying mob's body from the carrier flag, no new asset. Not a ring and not an outline: the ring is the boss's shape and ADR 0036 retired it from the player's grammar, and the genre marks carriers by colour rather than by dressing them (Gradius, DoDonPachi, Battle Garegga). Reason for marking at all: ADR 0002 makes killing the carrier the only way power arrives and ADR 0048 makes a miss a real cost, so a carrier the player cannot tell apart turns supply into luck; and the field rule is that a mob reads before it acts. The tint is `PALETTE.drop` (`0xd8a941`, luma 67.25, hue 41), which is treasure's own colour and therefore what the mob is carrying: it sits under the field ceiling and far under the band mob fire reserves (ADR 0014), it is outside the twenty hue degrees fire is given, and it parts from both the mob body it replaces and the notch an armed mob wears. The mark adds no shape to any type's silhouette, and the art pass owns the real one.
5. **Whether a fully-maxed run's carrier pays growth or pays score directly.** It opens one body with no line, which pays growth and overflows at the ceiling.
6. **How the bank is shown.** A count in the run readout beside the level readout. The field-side form belongs to step 5's strip.
7. **How fast a stripped player recovers at the thinner birthright.** No compensating mechanism, per ADR 0045's cost taken eyes-open. The numbers are reportable; only play judges them.
8. **Whether ADR 0046's roster resolver ships before any unlock exists to feed it.** Yes: the resolver and the recorded roster shipped, and the unlock store waits on its trigger in section 3, because the tape's recorded meaning is the expensive thing to change later.

---

## 3. Where a line's tuning rows live, and what a fifth line costs

Each line's level-indexed rows live in that line's own module and are exported at its module end. That is the shape `tuning.ts` already declares, a weapon line owns its level curve in its own module, and it is what keeps a fifth line from touching another line's numbers. Nothing outside a line's own module indexes that line's rows, and no policy names a line: the three policies that could are `offer.ts`, `carriers.ts` and `src/dev/bot.ts`, and `src/__tests__/lineAgnosticPolicies.test.ts` holds all three.

**Adding a fifth line is one module plus rows, plus five registrations that cannot be folded and are named here so nobody discovers them late.** The module is `src/game/lines/<name>.ts` with its own rows and its `advance` or `launch` seam. The registrations are: one member in `WeaponLine` and `WEAPON_LINES`; one call in `step.ts`'s `advanceLines` or in `swallow.ts`; one code in `WEAPON_LINE_CODES`, which is append-only by the wire rule and cannot be generated; one silhouette in `drawDropIcon`, which cannot live in the sim because `src/game` may not import rendering; and one pool cap in `src/game/caps.ts`, because a cap is a safety net over a shared pool and not a tuning row, which is why the fence admits a `_CAP` name there and nowhere else. Two more edits are not registrations but are found by the compiler and the tests rather than by this list: `run.ts` holds two `Record<WeaponLine, number>` literals, the ceiling and the maxed loadout, that typecheck refuses until the fifth member is added, both derivable from `WEAPON_LINES`; and `carriers.test.ts` pins `carriersScheduled()` to the schedule's literal count while `carriersForFullBuild()` grows by the new line's rungs, so the stage needs more carrying rows and that pin moves with the cause written down. The header costs nothing: the roster is written length-prefixed by name, so a fifth line spends no format version.

**Two things this step deliberately did not build, each with its trigger.**

- **The unlock pool store**, ADR 0046's cross-run persistence. It is built when a second run-to-run unlock exists to store, and ADR 0046 requires a ruling on denied or evicted browser storage before that work starts.
- **A fifth line's drop silhouette.** `drop-legibility-fix.md` states the coarse silhouette axis is exhausted at four lines. The trigger is the first fifth-line proposal.

---

## 4. Claims in the record found false against the code

**`weapon-pool-review.md:44` describes a header layout the tape no longer has.** It states that `HEADER_LEVELS_ORDER` in `wireCodes.ts` writes exactly four level bytes positionally, so a fifth line would grow the header and stop every recorded tape decoding. No such constant exists: `src/tape/__tests__/wireCodes.test.ts` explicitly asserts it is not exported, and the header writes the roster length-prefixed by name, with `wireCodes.ts` recording in its own comment that the next roster change costs no version at all. The claim was true when it was written on 2026-08-27 and was superseded by ADR 0043 and #76. It reads as current and it is load-bearing for the standing extensibility constraint, so it is worth correcting when #86's stale-docs sweep runs.
