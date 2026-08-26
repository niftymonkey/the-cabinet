# The Hungry Grave

**You are a grave.**

Not a gravedigger, and not a character standing over one. The hole itself: an open grave moving up a Halloween hillside while the dead come down to meet it.

_Kill the dead. Swallow the dead. Get bigger._

The Hungry Grave is a vertical arcade shooter in which the player is an open grave that swallows the corpses of what it kills. Swallowing makes the grave bigger and its weapons stronger. Getting hit makes it smaller. Shrink to nothing and the earth closes over you.

Your weapons fire upward on their own. What they kill falls to the ground as a corpse, and a corpse is only worth something once you have moved the grave underneath it. Corpses land where the fighting was a moment ago, so the food is usually in the place you just had reason to leave.

## A run

The screen scrolls. The undead arrive from the top. You steer; everything else fires itself.

A cleared wave leaves bodies drifting toward the bottom edge, going stale as they go. A fresh corpse pays the most, a stale one pays less, and the scroll carries every one of them off the field, so each is a short window to reach it or let it go.

Among the corpses, kills sometimes leave a drop. Swallow one and a weapon line gains a level: another column of skulls out of the grave's mouth, another headstone in orbit, and so on across four lines that each move differently. A run starts with two thin lines and ends as a storm of your own projectiles with the dead dissolving inside it.

Swallowing also fills a reservoir. When it is full you can belch, one eruption that clears the whole field. It only fires when full, and anything swallowed past full spills out and is lost.

Then the spawns stop and the field empties. Something arrives alone.

A boss sends fire downward in large, slow patterns with a gap to find. Your weapons still hurt it, it still sheds food as it fights, and a full belch still clears the screen. When it dies it leaves a feast. Swallow the feast, and the waves resume.

## What makes it play differently

**Size is health.** There is no health bar. The grave's outline is the health readout. A hit visibly shrinks you, and a smaller grave is also a smaller target, which is the way back from a bad stretch.

**Food has to be reached.** Nothing comes to the grave. Every corpse and every drop is only collected by putting the grave under it, and the clock is running on each one.

**One movement does several jobs.** The dive that swallows a corpse also grows the grave, fires its burst weapons, and charges the belch. Offense, survival, and growth are the same decision.

**The storm keeps mattering.** No boss is immune to your weapons and no phase asks you only to dodge. The arsenal built over a run is never switched off.

**It stays readable at full density.** Mob fire draws above everything else and is always the brightest thing on the field, as a rule of the design. Your own projectiles can fill the screen without hiding the one shot that matters.

## Seeds and replays

Every run rolls fresh dice, and the seed is shown on screen. Put a seed in the URL and the run repeats exactly: the same waves, the same drops, the same fire. Two people on the same seed face the same run with different hands.

A replay is different. It preserves the run that actually happened, the player's own steering included, so someone else can watch it. Replay is part of the planned first release and is being built now.

## Playing it

The current build is at https://hungry-grave.vercel.app and runs in a desktop or phone browser.

Keyboard: arrows or WASD to steer, hold Shift for slow precise movement, Space or X to belch. Touch: drag anywhere to steer, tap the corner button to belch. Add `?seed=` and a number to the URL to pin a run.

The Hungry Grave is in active development. The first finish line is one full stage with a miniboss and a final boss. Current work is tracked on [the map](https://github.com/niftymonkey/the-cabinet/issues/26).

(Temporary: the build is drawn in placeholder shapes until the art pass, so there are no screenshots here yet.)

## Running it locally

From this directory, `pnpm dev` starts a local build and `pnpm test` runs the suite. Deploying is described in [docs/deploy.md](docs/deploy.md).

## Going deeper

- [docs/VISION.md](docs/VISION.md): what the game is, why it is this way, what it should feel like, and the principles that keep it on course.
- [CONTEXT.md](CONTEXT.md): the vocabulary. The grave swallows; it never drives.
- [docs/adr/](docs/adr/): the decision record, one decision per file, with the reasons.
- [docs/design/](docs/design/): the original concept, the first dig, and the plan for each build step.
- [docs/lessons.md](docs/lessons.md): the traps this codebase has actually shipped.

The Hungry Grave is one game in [The Cabinet](../../README.md).
