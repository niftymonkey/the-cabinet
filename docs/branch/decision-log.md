# Decision log: the grave in the ground (#148)

The numbered decisions from the grill of 2026-09-20. Mark approved this wording on that date. The prior art for every decision is prototype build 7, which Mark played for 403 swallows before he sent his final values, plus what is named beside the decision.

## Mark's decisions

1. The grave takes food of any size. There is no size gate. Prior art: hole.io gates by size, and Mark ruled against it: "it doesn't matter what the size of the grave is, it can pull in everything."
2. The pull moves food only, never a living mob. Start values: reach 24, strength 125. Prior art: Vampire Survivors pulls its fuel (experience gems) and nothing else, and a living mob is never food here.
3. Food is swallowed when the share of it over the mouth reaches 55% of the most that could ever be over the mouth. A sliver over the edge stays out. Prior art: prototype build 7 and Mark's final values. The claim that hole.io drops a thing when its middle passes the rim is unverified agent research, and nothing rests on it.
4. Food tips about the point of the rim it crosses (0.30 s). Then it falls (0.75 s), shrinks, darkens, and never lands. The grave has no bottom.
5. The grave is a hole cut in the ground, drawn from one projection. It has three walls and a moon on the left. It has no ring of earth. The headstone is off. Prior art: Mark's two photos of real graves.
6. No hands for now.
7. Real build only: a falling corpse eases toward the middle of the dark. Translucent tufts grow round the grave, in Mark's words "dark brownish, grayish, greenish".
8. The Undertaker's death ends the run. The grave drags him across the ground to the rim. He claws at the ground and leaves marks. He tips, folds in, and falls. No payout. Prior art: `game-concept.md`, "he topples into the grave and the swallow is the victory animation, no payout".
9. Order: #148 first. Then all foundations work: the fingerprint (#152), the rest of the #86 doc sweep, and all six #150 debts. #149 (the toll and the bleed) comes after foundations.
10. The glossary gains Pull, Tip and Fall, and Swallow is reworded, with the text Mark approved on 2026-09-20.
11. The slices of this branch are not tickets. Each slice is one commit that names its slice and #148.

## The agent's calls, open to Mark's overrule

- A1. The payout lands at the tip. Evidence: Mark played 403 swallows this way, `swallow.ts` fires its bursts on the swallow tick on purpose, and a payout at the end of the fall would fire the skull stream's surge and the wisps about one second late. To reverse: move the payout to the end of the fall.
- A2. A corpse that rots away before the tip is lost, as today. After the tip it is already paid.
- A3. A bell or belch shove adds to the pull. A shove can knock a corpse off the rim before the tip, never after.
- A4. Power-ups, feasts and fallen rungs follow the same swallow rule as corpses. The pull never moves an offer's option bodies, so ADR 0034's "a place to be rather than a moment to hit" stays true (added after the gates, 2026-09-20; evidence in the design record under R3).
- A5. A falling corpse moves with the grave.
- A6. The game rules decide the pull and the tip. The drawing code shows the turn and the fall. The tech architecture gate checks this.

## Outside this branch

The tilted or 3D view (a throwaway prototype when Mark names it, research at `local/research/148-the-3d-view.md` in the main repo folder; a ticket draft is held until this branch closes), the hands, the grave's top size (tuning, #39), and the tell for a living mob (#129).
