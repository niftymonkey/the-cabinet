# Slice 3: the grave in the ground (design record R4)

Follow-along row 3: "The grave looks like a real hole in the ground: walls that go dark, no bottom, turf and see-through tufts round it."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. This entry is the planning half of the flow. Your scratch folder is `local/148-slice-3/` in the worktree. Load the `pixijs-skills:pixijs` skill before you write Pixi code. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read on the tree at `c309fc812b`, before slices 1 and 2 landed; neither slice touches the drawing code, but the name beside each number is what binds. A name that is gone, or that does something else, is a false claim: stop and report it.

## What this slice builds, and why

Mark, from play: the grave reads as "a rectangular ship that's hovering above" and it should be what "a human walking up to a grave in the ground" sees, "not just an empty rectangle". This slice changes how the grave is drawn and nothing else. The hitbox, the sizes and the growth stay as they are.

When it works, a player sees, at the floor size (18), the start size (27) and the ceiling size (67.5), at real scale on a phone:

- A hole cut in the ground: a true rectangle with a few small outward bites, black laid first, and three wall faces painted over it (far, right, left). The near wall is never drawn. There is no floor, and the walls get darker as they go down until the dark takes them.
- The moon is off to the left, so the right wall is lit and the left wall is in shade.
- No ring of earth. A narrow trodden margin, a turf shadow a hair inside the edge, and grass hanging over the far and side edges.
- Translucent tufts round the grave, so the ground under them shows through and changes as the grave moves.
- No headstone. No hands.
- The two-colour rim, the reservoir's glow and Territory's charge arc all still show, each doing the job it does today.

Build 7 of the prototype is the reference for the look (`.claude/worktrees/148-grave-fall`, `apps/hungry-grave/src/prototypes/grave-fall/index.html`; the projection is at `:545-585`, the mouth's bites at `:520-541`). Learn from it. Copy no code out of it.

## Parts of the code this slice touches

- New module `src/app/screens/game/graveProjection.ts`. Its concept is the one projection the whole hole is built from: a point below the ground draws where the camera's ray through it meets the ground. It has no Pixi import at all, not even a type import, because slice 4's fall uses it and its tests must run without Pixi. It works in unit space, where one unit is the grave's size (its half length). Public interface, both pure:
  - `belowGround(x: number, y: number, depth: number, view: GraveView): { x: number; y: number }`. With `shrink = cameraHeight / (cameraHeight + depth)` and the point the camera stands over at `y = cameraBehind`, a point draws at `x * shrink` and `cameraBehind + (y - cameraBehind) * shrink`.
  - `lightAtDepth(depth: number, view: GraveView): number`, which is `1 - (depth / darkDepth) ^ darkFalloff` with the depth's share clamped to 0 and 1. This is drawing code, so `Math.pow` is allowed here; the exact-arithmetic rule binds `src/game` only.
  - `GraveView` is the record of the four values the two functions read.
- New module `src/app/screens/game/graveDrawingValues.ts`: the one data table of the drawing's values for this step (design record, "Values are data"). This slice gives it the rows that have a reader today: camera height 4.95, camera behind 1.07, dark depth 2.4, dark falloff 2.6, and every proportion the art uses (the bites, the margin, the turf shadow, the grass, the tufts and their alpha), each a share of the opening. Slices 4 and 5 add their own rows. `src/app/screens/game/groundDressing.ts:86` is the pattern for a data table beside a renderer.
- `src/app/screens/game/GraveRenderer.ts` (the class at `:169-333`). Its public interface holds: `attach(layers)` (`:184`), `detach()` (`:195`), and `sync(grave, reservoirFullness, tick, territoryCharge)` (`:212`), so `GameScreen.ts:511-516` and `ReplayScreen.ts:205-210` do not change.
  - The hole's art is built once, in unit space, and scaled by the grave's size on every `sync`. It is never cleared or rebuilt after it is built, because the size changes on every swallow. Today `redraw` clears and redraws the mouth on a size change (`:300-332`, the clear at `:307`).
  - The three rim jobs keep a fixed stroke width in field units and are redrawn only when the size changes, as today. This is the main session's call: the why-comment on `GRAVE_RIM_STROKE` (`:11-32`) brackets that width from a phone's pixels at the floor size, and a stroke scaled with the art would thin exactly where ADR 0014 needs it most. The rim's outer edge still equals `graveHitbox` (ADR 0003). Their geometry becomes the true rectangle: the corner ratio (`GRAVE_CORNER_RATIO`, `:9`) goes, and `perimeterPoint` (`:104-154`), which the charge arc walks, walks a plain rectangle.
  - The draw order inside the `graveMouth` layer, bottom to top: the margin and the tufts; the black and the three walls; an empty container for falling food; the turf shadow and the overhanging grass. The empty container is positioned at the grave on every `sync`, is not scaled, and is exposed as a read-only member named `falls`. Its caller is slice 4 (design record R5: "Falling food draws in a container in the existing `graveMouth` layer, positioned at the grave"); name that citation at the member. Building it here fixes "between the cut and the turf" in one place. The rim, the glow and the arc stay in `graveRim` (`layering.ts:16-29` is the stack; `graveMouth` is under food and `graveRim` is over it).
- `src/app/palette.ts`: every new colour is a palette entry with its luma, as `graveHole`, `graveRim` and `graveGlow` are (`:50-52`). No brown and no purple. The tufts are a dark grey-green; Mark named the colour range himself and he judges it in play. ADR 0014's value band holds for everything drawn on the field; the palette's own tests are `src/app/__tests__/palette.test.ts`, and they stay green without a widened band.
- `src/app/screens/game/layering.ts:70` holds the one non-null assertion in the file (`return this.layers.get(name)!;`). This slice touches the mouth layer's children, so it pays that debt (#121): a missing layer is a bug and fails loudly by name.
- `src/__tests__/boundary.test.ts`: a new row in `BOUNDARIES` (`:51-137`) that forbids any Pixi import in `graveProjection.ts`, in the shape of the `sound.ts` row (`:114-120`).

## What must stay unchanged

- Nothing under `src/game`, `src/tape`, `src/input` or `src/dev` changes. No rule, no pin, no tape version.
- `graveHitbox`, the grave's sizes and its growth.
- The glow's alpha (`glowAlpha`, `:82-87`) and the arc's steps (`ARC_SEGMENTS`, `:95`).
- `GameScreen.ts` and `ReplayScreen.ts`.

## Planned tests

Pin every name as a `test.todo` first, against stubs that return a wrong value of the right type, so each test is red on its own assertion. Each test carries a comment that cites R4 or the ADR it enforces. Expected values are worked by hand from the formulas above.

`src/app/screens/game/__tests__/graveProjection.test.ts`:

1. a point on the ground draws where it stands
2. a deeper point draws nearer the spot the camera stands over, on both axes
3. a point at the dark depth on the far edge draws at the hand-worked place (far edge `y = -1`, depth 2.4: shrink is `4.95 / 7.35`, so `y = 1.07 - 2.07 * 4.95 / 7.35`)
4. the light is whole at the ground and gone at the dark depth, and stays gone below it
5. the light at half the dark depth is `1 - 0.5 ^ 2.6`

`src/app/screens/game/__tests__/GraveRenderer.test.ts`. The existing file has tests this ruling replaces, and the contract's rule against rewriting a test does not cover them, because the ruling changed and not the code's luck. Replace exactly these, say each in your note, and leave every other test as it stands: the test that spies on the mouth's `clear` (`GraveRenderer.test.ts:108`) becomes test 6; any test that asserts a rounded corner becomes test 8.

6. the hole's art is built once and never cleared again, at any size
7. the hole's art grows with the grave: at the floor, the start and the ceiling size the black mouth's bounds equal `graveHitbox`
8. the rim's outer bounds equal `graveHitbox` on a true rectangle, at the three sizes (ADR 0003)
9. the bites, the grass and the tufts reach no farther outside the hitbox than the bound the values table states
10. the mouth layer holds the ground art, the walls, the place for falls and the overhang, in that order
11. the place for falls follows the grave and is never scaled
12. the rim, the glow and the arc are still the three children of `graveRim`, and the arc never leaves the hitbox
13. a same-size `sync` redraws no rim stroke

`src/app/__tests__/layering.test.ts`: 14. asking for a layer that does not exist fails loudly and names the layer.

`src/__tests__/boundary.test.ts`: the new row is itself the test that `graveProjection.ts` imports no Pixi.

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. The proof tape: replay and verify the tape at `local/148-proof-tape/` with the command slice 2 left beside it. It must verify, which proves this slice moved no rule.
2. A rendered check of the built app through `vite preview` with `playwright-cli`, at a phone's viewport (390 by 844, device scale 3). The app reads the grave's size from `?size=` (`sizeFromUrl`, `src/app/seedFromUrl.ts:75`). Photograph the grave at `?size=18`, `?size=27` and `?size=67.5`, each once near the top of the field and once near the bottom, because the ground under the tufts differs. Read every screenshot. For each, say in your note: whether the three walls, the black and the missing near wall can be told apart at that size; whether the lit and shaded walls differ; whether the ground shows through the tufts; and whether the rim, the glow and the arc still read. To see the glow and the arc you need a run with charge; say how you staged it, or name it as a read you did not obtain (`docs/agents/lessons.md:77`).
3. Take one more picture at `?size=33`, the size Mark tuned the prototype at. On it, measure the walls' shares of the opening and put them beside the design record's figures from the prototype: shaded side 12.3% of the width, lit side 18.3%, far wall 29.1% of the length. They are "about" figures. Report yours; do not tune to the decimal.
4. The frame cost: open the frame budget screen (`src/app/screens/FrameBudgetScreen.ts`) in the built app and put its render figures in your note beside the same figures from the tree before your change.

Open for the human after this slice (say so in your note): whether the grave reads as a grave in the ground on his phone, and the colour of the tufts.

## Done when

Every planned test is green, every verification step has a result in your note, the proof tape verifies, and the working tree holds the code, the tests and `docs/branch/records/slice-3-note.md`, uncommitted.
