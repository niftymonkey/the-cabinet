# Slice 2 coder note

## 1. What changed

- `BackgroundRenderer`: the ground is a no-batch `Mesh` over `groundGrid`, with its repeat pushed to the sampler. The bake uses `bladeReach` at 1.178 times the view. The dressing is laid across the far row.
- `groundDressing.ts`: each piece has a stance. Vein-a, vein-b, little-eyes and eye lie; the rest stand, read off a contact sheet.
- `groundPainting.ts`: `copiesAt` wraps across the sides and corners, and `paintGround` takes the reach.
- `FieldRenderer`: mobs stand and sort by depth; corpses and treasure lie inside placement parents; shots and scatters are placed by the camera.
- `StormRenderer`: skulls, wisps and pops are airborne; patches, the ring, the eruption and the splash lie; the lob lifts on the column.
- `GraveRenderer`: `PerspectiveMesh` pit and lip through its `corners`; falls lie; the bake reads the pit's container.
- The boss and the dragged Undertaker stand; the furrows lie. The boss comments and the record are updated per the rulings.
- Helpers changed: `homes`, `withoutSideCopies`, `drawingsIn`, `drawnEyeWidth`, `groundOf`, `viewing`, `mouth`/`patchOnColumn`, and `drawingOf` in `layering.test.ts:261` and `screenLifecycle.test.ts:853`.

## 2. Verification results

- 22 planned tests plus a sampler pin: each was red on its own assertion; the four guards were mutation-checked.
- Names: 2651 to 2666. Eight lost, each replaced as planned or ruled.
- Typecheck, test (2655), build and verify: exit 0, with slice 1's two Rollup warnings only.
- Fourteen shots read.
- Frame budget render mean: 0.63 and 5.36 ms before, 0.91 and 4.52 ms after.
- Console: only AudioContext and ReadPixels warnings, both also present before.

## 3. Where the entry was wrong about the code

The unlisted tests, resolved by rulings 1 to 7, and the two lifecycle tests above.

## 4. Decisions made

- The eruption lies at its drifted ground point. A `liftOnColumn` drift outruns its bodies by 8%. To reverse, use `liftOnColumn`.
- Placement parents only on corpses and treasure. A uniform standing scale commutes with a node's own turn.
- The lob mark's drawn size peaks at tick 33 of 68, worked on a pinhole.

## 5. Open items

For Mark: whether the leaning ground reads as his angle, and whether the mobs read as standing.

Against the prototype: the field ends about 120 column units down, with dressing above it (slice 7). The hole is still build 7's (slice 3).

## 6. Stuck

None.
