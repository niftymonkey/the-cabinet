# The Hungry Grave: the north star

Reread this when a proposal is on the table and nobody is sure whether it belongs. It says what the game is, why it is this way, what it should feel like, and which principles keep it pointed the same direction as it grows. It carries no numbers and no rules of its own: the rules live in the ADRs under `adr/`, the words in `../CONTEXT.md`, the shipped traps in `lessons.md`. Where this document and one of those disagree, this one is stale.

## 1. What it is

The Hungry Grave is a Halloween vertical shmup crossed with hole.io. You are the grave: a moving open hole in the ground, ascending a scrolling world full of undead. Your weapons fire upward on their own. Everything that dies falls to the field, and everything on the field goes in the hole.

The loop is one verb. Kill, and a corpse drifts down the field with the scroll. Pass the grave under it and it falls in. A swallow grows the grave, fires its burst weapons, and charges the reservoir behind its one button, the belch. Some kills leave a drop instead, swallowed the same way, that levels a weapon line for good. You start as a modest pit with a couple of thin lines and end as a screen-filling storm of your own projectiles.

Size is health. There is no health bar; the grave's rim is the health bar. Swallowing grows it, hits shrink it, and when nothing is left the grave is sealed shut. One object does four jobs at once, the health bar, the collection loop, the ammo economy, and the comeback mechanic, and that object is the game's identity.

Two textures alternate. Most of the run you are the bullet heaven: mowing down authored waves, roaming to swallow fresh corpses and drops under light return fire, watching your storm thicken. On a phase boundary the field drains empty and a boss arrives alone. The direction of fire flips, you dodge large slow readable patterns, and when it dies you feast on it and are the storm again.

The world scrolls, and the scroll is the deadline: every corpse and every drop is carried off the field whether or not the player reached it.

## 2. The bets

**The cross is the game.** The grave needs a field that shoots back, or swallowing has no pressure and the hole fantasy goes slack. The shooter needs the grave, or it is a shooter with a different skin. Neither half is the game; the cross is.

**Danger produces opportunity where danger just was.** Shmup instinct says move away from threat. The swallow economy pays the player to move into the space a threat just vacated, because that is where the corpse landed. This is the central bet, the one thing the project exists to test, and everything that puts food where the fight was is load-bearing: the scroll, freshness, bosses that shed food mid-fight, belch kills that leave ordinary corpses.

**Does it feed the hole?** Progression and reward flow through the swallow: growth, weapon levels, and the belch all arrive by passing under something. The dive that swallows a corpse is also the move that grows the grave, fires its burst weapons, and charges the belch. Offense, survival, growth, and collection are one motion. The design folds new systems back into the grave rather than adding meters beside it, and this question is the identity test for anything proposed.

**The storm must always matter.** The player spends a run building a thing, and nothing may make that thing irrelevant for a stretch. Bosses are always shootable, no phase is pure dodging, and the belch buys a breath and a repositioning, never a skip.

**Greed is the right play.** The greedy choice and the correct choice are made the same choice. The belch fires only when full and charge past full visibly wastes, so holding it costs something the player can see. Nothing swallowed is ever worthless, so the player never regrets diving.

**Position is the whole skill.** The player steers and has one button; the weapons fire themselves and nothing is aimed. Homing never solves the field on its own: it is scarce, never always-on, and always bought with a dive. The field is read and answered with the body of the grave.

**Readability is play.** Mob fire wins wherever it overlaps anything else, at any density the game can produce. The storm is never dimmed to make room, because the storm is the reward for swallowing and a reward turned down stops reading as one. A hit announces on a channel other than the shrink, so the player can always say when they were hit.

**Death is gradual and the recovery path never closes.** The size floor is hard, size never gates a swallow, and at the floor the game takes things the player can watch themselves lose before it takes the run. A player in the spiral always has a physical way out.

**The stage is authored and a seed is the same run anywhere.** The stage is written by hand, nothing reads the player's performance to reshape it, and the dice are seeded. The beats are locked, every tester on a seed plays the identical run, and a shared seed is a challenge a friend can play.

**Everything is a pool, nothing is a club.** Weapon lines, mob types, and placement templates are open sets whose members carry their own properties, and so is any set this project grows later. A new member must own something no existing member owns: a motion, a lesson, a job.

## 3. What it should feel like

**Ordinary waves** are mowing, roaming, and choosing. A handful of readable shapes in placements that each teach something, a visible minority of them armed. Where the player stands should feel like a decision.

**Swallowing** is the best sound and the best feeling in the game, from the very first swallow, before any weapon line has arrived. Steady-bright always means treasure; fading always means hurry.

**Growth** is felt in the body and seen in the storm. The fourth drop feels different from the first, each level of each line looks different, and the lines stay tellable by motion alone when the field is full. Late in a run the screen is yours, and mob fire still wins wherever the two overlap.

**Bosses** change the rhythm without changing the game. The drain-out is a held breath. The boss is alone, its patterns are large and slow with a gap visible through the player's own storm, and food keeps arriving so the dive is still the answer at the climax. A boss kill is a feast, and what follows the feast has a use for a full belch.

**Greed and danger** sit together. The reservoir filling is visible rising pressure, the loaded belch has one unmissable job, and spending it on the right wave is the run's first full-screen catharsis. The player always knows which mob will shoot and sees the tell before the shot.

**Recovery** is possible and felt. After a bad hit the grave is smaller and harder to hit, the field is still full of food, and the way back is to dive. Whether the comeback force or the spiral force dominates in the seconds after a hit is an open question, answered by play and not by this document.

**Failure** is legible and earned. The grave is filled in and sealed, never destroyed. The player watched it shrink, lost score, lost levels, and understood each step, so the end is a consequence and not a surprise.

## 4. Questions for any proposal

1. Does it feed the hole?
2. Does it keep danger and opportunity in the same place?
3. Does the storm still matter?
4. Is the greedy play still the right play?
5. Is position still the whole skill?
6. Can the player still read it at full density?
7. Does death stay gradual and the recovery path open?
8. Is it a pool member carrying its own properties, or a club rule naming a cast?
9. Does a pinned seed still replay the same run anywhere?
10. Is the hole verb intact? The grave swallows and passes under. It never drives.

## 5. How it is made

**Feel belongs to the human. Evidence belongs to the run.** Whether the dive is delicious, whether the fourth drop feels different, whether the game is fun: a person playing the build answers these, and nothing automated may claim them. An automated player measures its own policy, never the game. Feel on one random seed is not a measurement either, so every run is reproducible and recorded, and a run can be replayed exactly, measured later, and asked questions nobody thought of when it was played. A replay that cannot prove it is the original run reports nothing rather than reporting wrongly.

**The cycle is play, read, measure, tune, play again.** Play produces a read in the player's own words. The read names what to measure. The measurement says whether the tuning can produce the curve the design asks for. Then the human plays again and says whether it is fun. Neither step is skipped and neither overrules the other's question.

**Numbers are measured, not derived and written down as rules.** A number that can be measured is measured before a ruling rests on it. A number that must exist before it can be measured is data the game carries, never a compiled truth. Tuning waits for evidence, never for a build to feel good.

**The record is written to be overturned.** Decisions carry their reasons so that reopening one is an argument from the game. Nothing already landed is fixed; plans and earlier decisions are where the project got to, not the truth, and play has already changed many of them. The care goes to one-way doors, the seams and vocabularies later work is built on, not to numbers that will be retuned anyway.

**Replay is also a feature.** The same recording that makes a run measurable lets a player keep a good run and hand it to a friend to watch. The instrument and the feature are one artifact.

## 6. What it is not

- **Not a hole without pressure.** The shooter half is not decoration.
- **Not a survivors game with a director.** No spawn faucet, no performance-reading waves. The stage is authored and a seed replays it.
- **Not a menu-driven build game.** Progression is physical and in-run; drops are swallowed on the field.
- **Not an aiming game.** No cursor, no second axis, no cross-line homing.
- **Not a panning playfield.** Width is repositioning margin, and corpse deadlines must not expire offscreen.
- **Not a free lunch for a big grave.** Live mobs are never food; contact shrinks, and only kills leave corpses.
- **Not this document.** Rules, numbers, seams, formats, and tuning live in the ADRs, the glossary, the design records, and the tracker. When a detail here conflicts with one of those, this document gets corrected.
