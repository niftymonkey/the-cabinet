# Weapons check (slice D, part 1)

Mark's condition for the tilt (T10): "yes it is as long as the weapons behave right". This record is the evidence, measured on the real renderers and photographed, on the tree at `11f3e9e339`. Figures only; the bow, the rings' shape and the edge slide are Mark's to read (A28, T11).

## The tools and the commands

All scratch lives in `local/tilt-slice-D/`. Commands run from `apps/hungry-grave/` unless shown otherwise.

- **Staged tapes:** `record-edge.ts`, modelled on `scripts/record-conditioned.ts` (its header and its record-and-seal loop). Commands are in `local/tilt-slice-D/record.log`.
  - Edge tapes, 3000 ticks at seed 1000, every line at level 5, the grave held at the left edge, the middle (270) or the right edge on its starting row: `pnpm vite-node --config vite.headless.config.ts ../../local/tilt-slice-D/record-edge.ts <out> 1000 3000 <left|middle|right> <760|1168>`. Six tapes, `local/tilt-shots/tapes/sliceD-edge-*.tape`.
  - Belch tapes: a held-still grave never fills the reservoir (300 corpses' worth), so none of the six edge tapes belches. So six more tapes play the maxed rig under the harness's steady-far hand, never belching, until the reservoir is full (the Banshee's feast, tick 8259 to 8905), then the edge hand takes the grave to its side on the row it stands on and presses the belch there, and the tape runs 240 ticks on: same command with a trailing `belch`. `local/tilt-shots/tapes/sliceD-belch-*.tape`. The three per field are the same run until the reservoir fills.
  - All twelve verify to their end headlessly and in the replay screen.
- **Numbers from the renderers:** `sliceD-weapons-measure.ts <tape>` replays a tape through `playTape` and drives the real `FieldRenderer`, `StormRenderer` and `BossRenderer` on the run's own scene every tick, with the events the replay screen feeds them (`erupt`, `splashed`, `weaponStripped`), then reads every sprite by slot. Run over all sixteen tapes (the twelve staged ones and the four recorded by slice P1); outputs in `local/tilt-slice-D/measure/`.
- **Mutation check of the measure:** the same tape measured with the sample points mapped through a 40-unit taller field's play layer (`mutant/`) reports 7251 wrong Territory points and 454161 wrong cone points, so a clean result is not a blind check.

## Figures, all sixteen tapes (both fields, left, middle and right)

| Line | Mark | Result | Pass |
| --- | --- | --- | --- |
| Skulls: drawn x minus field x | 0 to 1e-9 | 0 exactly, 3.34 million skull-ticks | pass |
| Skulls: sideways drawn move not in field x | 0 to 1e-9 | 0 exactly | pass |
| Wisps: drawn x minus field x | 0 to 1e-9 | 0 exactly, 260 thousand wisp-ticks | pass |
| Wisps: sprite angle against its drawn move that tick | under 1 degree | 0.056 degrees at most | pass |
| Mob fire (trash, tears, spiral, clods): drawn x minus field x | 0 to 1e-9 | 0 exactly, 1.1 million shot-ticks | pass |
| Mob fire: drawn scale over the hitbox's image, least of across and along (A21) | never below 1 | 1.0000 | pass |
| Mob fire: the drawn star's half extent over the hitbox's image | never below 1 | 1.4472 | pass |
| Territory: points one unit inside and outside each patch's sim circle (A20) | every one on its side | 11.3 million points, 0 wrong | pass |
| Bell: points one unit either side of each cone's edges, judged by the sim's own cone test (A20) | every one on its side | 418 million points, 0 wrong | pass |
| Belch: points one unit inside and outside each front's circle (A20) | every one on its side | 110 thousand points, 0 wrong | pass |
| Mobs and the boss: drawn x minus field x | 0 to 1e-9 | 0 exactly | pass |
| Tears and clods: drawn x minus field x | 0 to 1e-9 | 0 exactly | pass |
| Clods: sideways drawn move not in field x | 0 to 1e-9 | 0 exactly | pass |

## For Mark's read (reported, not pass marks)

**The bow of mob fire's drawn path (A28),** from the straight line between where each shot was first and last drawn. CSS px are on a 390-wide column (0.722 px per column unit).

| Kind | Largest | Median, per tape |
| --- | --- | --- |
| Trash (aimed) | 52.0 column units, 37.6 px (1168 field) | 3.8 to 17.0 units (2.7 to 12.3 px) |
| Tears (the Banshee's rings) | 42.2 units, 30.5 px (1168) | 0.6 to 0.8 units (0.5 to 0.6 px) |
| Spiral (the Undertaker's arm) | 25.5 units, 18.4 px (1168) | 0.4 to 0.7 units |
| Clods (the Undertaker's curtains) | 0 | 0 |

The median trash bow is three to four times larger on the staged edge tapes (a grave at a side edge draws shots across the field diagonally) and on the 1168 field (longer paths down more spread rows).

**The Banshee's rings (A28).** Every ring's tears measured each tick with at least 8 alive, fitted to a least-squares circle in column units:

| Tape | Rings | Largest departure from a circle | Mean of each ring's largest | Gap lane bow, largest (mean) |
| --- | --- | --- | --- | --- |
| won, 760 | 6 | 18.3 units at radius about 118 | 16.1 | 3.8 units, 2.7 px (0.9) |
| won, 1168 | 8 | 32.0 units at radius about 110 | 26.9 | 4.4 units, 3.2 px (1.3) |
| sealed, 760 | 67 | 20.7 | 17.3 | 15.8 units, 11.4 px (2.2) |
| sealed, 1168 | 60 | 34.0 units at radius 107 | 28.2 | 17.8 units, 12.8 px (2.0) |

The same rings in field units depart from a circle by 1e-12: the eggs are the drawing's rows (A28), as the record predicted. The gap lane (the straight field line from the ring's source down the middle of its opening, read inside the field only) bows under 1.3 units on average; the large figures are late in a ring's life, when the lane runs the height of the column. The opening itself is 4 spoke spacings (90 degrees) and is never narrower than the grave: when a ring reaches the grave's distance, the gap between the two flanking tears' hitboxes is 290 to 1346 field units against a grave 20 to 32 wide, and 280 to 1290 column units between the drawn stars' edges.

**The Undertaker's curtains.** 7 emits on the 760 won tape, 3 on the 1168 one: every clod falls with zero sideways drawn move and zero bow. Across is one to one, so a curtain's way through draws exactly as wide as the sim's.

**The edge slide (A22).** Lying things landing within 40 field units of a side edge, how far each drawn centre ends from the ground point it landed on:

- Corpses: largest 93.5 column units (67.5 px), medians 16 to 70 units per tape. Corpses whose field x never moved (no pull or shove): largest 90.7 units (65.5 px, 1168).
- Territory patches: 133.6 units on 760 and 228.5 on 1168. A patch lives until its whole circle has passed the bottom edge, so its centre is carried below the column's last row, past where the tech gate's figure stops.
- By the camera's own arithmetic (`sliceD-slide-arith.ts`), a thing landing on the top row at x 20 to 40 ends 99.6 to 108.2 column units (72 to 78 px) off its ground at the bottom row on the 760 field, which is the tech gate's figure. **On the 1168 field it is 173.1 to 188.2 units (125 to 136 px);** the record states only the 760 figure (A22).

## The shots

Mark's ruling of 2026-09-28 cut the sweep: shots stay few, and only at his two screens, the iPhone at 428 by 926 and the desktop at 1440 by 900. The first shots below were taken at 390 by 844 before that ruling reached this slice; they stand as taken.

SHOTS_PLACEHOLDER

## Step 4: the weapons' rules against the flat game

`git diff 517ee0753e -- apps/hungry-grave/src/game/lines apps/hungry-grave/src/game/belch.ts apps/hungry-grave/src/game/mobs.ts` (tests left out) lists only slice P1's hunks. `belch.ts` has no diff. Each hunk, against P1's reader table (`docs/branch/records/slice-P1.md`):

| Hunk | P1 table row |
| --- | --- |
| `lines/skullStream.ts` `cullSkulls`: `FIELD_HEIGHT` to `state.field.height`, and the import | `game/lines/skullStream.ts:256`, cull, the run's height |
| `lines/territory.ts` `advanceTerritory`: the scrolled-off test reads `state.field.height`, and the import | `game/lines/territory.ts:590`, cull, the run's height |
| `lines/wisps.ts` `cullWisps`: `state.field.height`, and the import | `game/lines/wisps.ts:284`, cull, the run's height |
| `mobs.ts` `moveInsideBounds` takes the field and clamps y to `field.height + SPAWN_MARGIN`; `travelShove` passes it through; its two callers pass `state.field` | `game/mobs.ts:513`, a carrier's clamp, the run's height |
| `mobs.ts` `cullMobs`: `state.field.height` | `game/mobs.ts:742`, cull, the run's height |
| `mobs.ts` the comment on `moveInsideBounds` | the stale comment `game/mobs.ts:503` P1 owns |

The full output is `local/tilt-slice-D/sliceD-weapons-diff.txt`. Otherwise the weapons' rules are byte for byte the flat game's.
