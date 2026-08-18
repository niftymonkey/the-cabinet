# The Hungry Grave

A Halloween vertical shmup crossed with hole.io. You are a moving open grave ascending a scrolling world, eating what you kill to fuel an ever-thickening storm of your own projectiles, with deliberate, phase-separated doses of bullet hell from bosses.

## What it is, in a paragraph

Weapon lines auto-fire upward at descending undead. Kills leave corpses that scroll down the field, and you physically drive the hole over them to swallow them; swallowed corpses erupt back out as dramatic burst weapons on top of an always-on floor of free lines. Kills also drop RNG upgrades, collected with the same verb, that add and level weapon lines. Eating grows the hole, enemy fire shrinks it, and death is being filled in and sealed shut: size is health. The player makes the bullet heaven; bosses arrive alone, after the trash drains out, and provide the bullet hell.

## The box

- v1 done-line: one authored stage plus a final boss, playable start to finish in a desktop browser. Three stages of ~25 minutes stay the design target, as stretch, not the done-line.
- Frame: pure vertical scroller, bottom to top. The scroll is the corpse deadline and the authored stage and phase bosses depend on the fixed frame.
- Stack: PixiJS v8 + React + Vite + Vitest in the existing pnpm workspace, as apps/hungry-grave beside housewarming. Continuous ticker; housewarming's render-on-demand seam does not transfer.
- Timeline: Halloween 2026 is the soft target (about ten weeks from the 2026-08-17 verdict). Fun side project; housewarming is shelved for now by Mark's explicit call.
- Controls: steering, autofire, one button (the belch). Nothing else.

## The core loop

Shoot, kill, and the field fills with two kinds of grave food: corpses (fuel, common) and upgrade drops (permanent power, roughly 1 in 8-10 kills). Both are eaten by driving over them. Every corpse runs one freshness meter, about 10 seconds from kill to gone: freshness multiplies all three payouts (growth, burst, belch charge) down to a floor of about a quarter, the fill dims as the meter drains, flickers as a last-chance warning near empty (Devil Daggers precedent), and at empty the dirt sucks the corpse under. The seconds are derived and the coupling is the rule: a mid-screen kill must reach the bottom edge as a dim, nearly empty scrap, so a scroll-speed retune retunes the meter with it. Greed has a deadline, the level never feeds a bottom-edge camper, and scraps are never worthless. Upgrade drops never decay; the scroll is their only deadline, and a steady-bright drop beside fading corpses is a free legibility cue between the two.

## Size is health

There is no health bar. Hits shrink the hole; eating grows it; being sealed shut is death. Shrinking also shrinks your hitbox, which is the built-in comeback. A hard size floor guarantees you can always eat the current tier's smallest corpse, so the recovery path is never physically closed; damage at the floor bleeds score or weapon levels instead of radius. A hit's shrink stays small relative to a size tier, and the camera never zooms back in mid-stage.

## The economy

Hybrid, sized by arithmetic (see the First Dig record's numbers table). The always-on free lines (orbiting headstones, will-o-wisps, bell shockwaves, grasping hands are the working set) guarantee the storm never stops; each swallowed corpse additionally erupts as a visible burst, one corpse in, one theatrical volley out. Four weapon lines at five levels each in v1, and the five levels of a line must look different on screen. Drops for maxed lines are still eaten: bonus radius, score, bomb charge. Everything goes in the hole; nothing on the ground is ever worthless.

## The belch

The one button. Swallowing charges a capped reservoir; the belch vomits it all as a screen-clearing eruption. The cap is load-bearing: corpses eaten at a full reservoir visibly splash and waste, so belching is the greedy play, not the cowardly one. This is the documented cure for shmup bomb hoarding.

## Bosses

Minibosses and bosses arrive on a phase boundary, after the trash wave drains out, and bring authored, readable bullet-hell patterns. They shed edible pieces throughout the fight (knocked-off armor, summoned adds, a feast chunk at each phase break) so the swallow economy never goes dark at the climax, and the player can earn a belch inside the fight. A dead miniboss is a feast: a corpse big enough to jump your size.

## The storm, and reading through it

Endgame target is on the order of 300 player projectiles airborne at once (a tuning target, not content). Readability is a day-one rule, not polish: enemy bullets render on the top layer in a reserved high-contrast palette; player fire is dimmer and desaturated; corpses and upgrade drops are perceptually unmistakable from each other at a glance.

## Deferred, with triggers

- Stepped zoom tiers with graduating enemy sizes: deferred until a second stage exists. The one-tier game keeps the full identity.
- Satellite mini-graves: deferred; trigger is maxed weapon lines undershooting the saturation target in practice. If built, they shoot but do not eat at full value, and are never independently steered.
- Survival-timer mode: future iteration, and free-roam arena is its native frame, designed arena-native (collection pins you under swarm pressure, short decay so doubling back really loses corpses, no v1-style phase bosses).
- Endless score mode: future iteration.

## Explicitly not doing

- A horizontally panning playfield wider than the screen. Shipped shmups use width as repositioning margin, not roaming room; camera motion taxes bullet readability; corpse deadlines would expire offscreen.
- Genericizing v1's corpse, camera, or threat systems to pre-serve the future arena mode. v1 is built scroller-only.
- Pause-menu upgrade choices. Progression is physical and in-run.

## Open questions

- The central bet: steering into where danger just was (to eat) versus the shmup instinct to dodge away. Delicious or miserable? The ugly slice answers it with rectangles.
- After a bad hit, does the comeback force (smaller hitbox) or the spiral force (smaller mouth) dominate? Freshness sharpens this: healing off older corpses pays quarter value, so the slice must watch recovery speed on decayed corpses specifically (product gate on #27).
- Which four weapon lines ship in v1, and what each looks like at level 1 versus level 5.
- Slice instruments to build in: time off the bottom edge, belch rate versus full-reservoir time, and whether a playtester can say when they got hit. The slice milestone carries a named playtester and a date.
