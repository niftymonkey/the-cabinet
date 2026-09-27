# Decision log: the tilted view (#159)

No grill ran for this branch. Mark ruled on #156 by playing six builds of a throwaway prototype on his phone, and his words from that play are the record. The prior art for every decision is that prototype (`prototype/156-tilted-view` at `63f34824f3`), built from #148's build 7, plus what is named beside the decision. The design record, `apps/hungry-grave/docs/design/tilted-view.md`, carries the same rulings as T1 to T10 with what each means for the code, and the agent's calls as A1 onward.

## Mark's decisions

1. The game goes tilted, in V1, before the phone-first pass (#151). On tilt 6, 2026-09-26: "This is looking real good. I think this is what we should be using as our guide for how we build the equivalent into the real app." It sits right after the `scripts/roadmap/v1.yaml` fix and before foundations (#152).
2. The tilt is 32.5 degrees off straight down. Read off his phone, 2026-09-27, after 81 swallows.
3. The camera stands 42.50 grave half-lengths up, measured off the starting grave size and never the live grave, so growing never flattens the view. Same screenshot; the grave size of 48.0 in it is growth, not a ruling.
4. The hole is cut by the shared scene camera, a flat dark opening, chosen over the prototype's `own` camera that kept build 7's walls. Same screenshot.
5. Every other value stays at build 7's: the pull, the tip threshold, the tip and drop times, and the headstone off.
6. The view is still and the grave moves inside it. Confirmed before tilt 3: a still rectangle of world seen at an angle, with the grave moving inside it, is exactly what he wants. On tilt 2 he named the difference from hole.io himself, where the hole is always in the middle.
7. The whole grave stays on screen. On tilt 4: "Yes this looks good. I like what we're doing here."
8. Mobs fill the whole screen, top and sides. His ask on tilt 4, built as tilt 5.
9. A drag and a held key both work on the glass. On tilt 5, "almost there", because W drifted toward the vanishing point off the middle column; built as tilt 6.
10. This is a design ruling and not an ADR (#156's resolution comment). The build is its own branch, #159.
11. The tilt is drawing only (2026-09-27, after playing slice 4's deploy): "nothing should have changed about the physics of the game"; shots go straight up and mobs come straight down anywhere on screen; the 540 by 760 "is just the viewport" and stays. He rejected tilt 8 ("This just looks like a flat thing again") and approved tilt 9, "as long as the weapons behave right". This supersedes how 7, 8 and 9 were to be built: 8 is met by the play layer without a sim change, 9 holds in its words with keys in plain field units, and 7 gives way where it would need a sim hold (design record T7, T8, T9, T10, A25).

## The agent's calls, open to Mark's overrule

The design record holds each with its evidence, how to reverse it and its status after the correction: A1 to A29. A1 is answered by decision 11. The one that needs his ruling is A28, after he plays tilt 10: tilt 9's rows bow diagonal paths and speed things up as they near, and evenly spaced rows keep every motion flat but make lying things slide on the ground.

## Outside this branch

A lit 3D scene, the hands, real art for standing mobs and a topple on death (#38), the grave's headstone and the prototype's far markers, colour work, the column's shape on a phone and the HUD (#151), haze, camera shake, and the grave's top size (#39).
