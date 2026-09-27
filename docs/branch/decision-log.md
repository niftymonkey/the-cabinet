# Decision log: the tilted view (#159)

No grill ran for this branch. Mark ruled on #156 by playing six builds of a throwaway prototype on his phone, and his words from that play are the record. The prior art for every decision is that prototype (`prototype/156-tilted-view` at `63f34824f3`), built from #148's build 7, plus what is named beside the decision. The design record, `apps/hungry-grave/docs/design/tilted-view.md`, carries the same rulings as T1 to T9 with what each means for the code, and the agent's calls as A1 onward.

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

## The agent's calls, open to Mark's overrule

The design record holds each with its evidence and how to reverse it: A1 to A17. The one that needs his ruling before the field slice is A1: the field is one fixed shape on every device, and keeping today's 540 by 760 column for this step is the agent's recommendation, not a ruling, since no ruling has set the column's shape on a phone and #151 is the pass that sets it. The one most worth his eye in play is A6: the hole's camera never follows the live grave, so a big grave's hole shows a little more wall than the prototype did.

## Outside this branch

A lit 3D scene, the hands, real art for standing mobs and a topple on death (#38), the grave's headstone and the prototype's far markers, colour work, the column's shape on a phone and the HUD (#151), haze, camera shake, and the grave's top size (#39).
