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

There is no health bar. Hits shrink the hole; eating grows it; being sealed shut is death. Live enemies are never food: contact with one shrinks you the same as enemy fire, and only kills leave corpses, so a big grave can never just drive under the wave. Shrinking also shrinks your hitbox, which is the built-in comeback. A hard size floor guarantees you can always eat the current tier's smallest corpse, so the recovery path is never physically closed; damage at the floor bleeds score or weapon levels instead of radius. A hit's shrink stays small relative to a size tier, and the camera never zooms back in mid-stage.

## The economy

Hybrid, sized by arithmetic (see the First Dig record's numbers table). The four v1 lines, from ticket #28: the soul stream and orbiting headstones are the always-on floor, and will-o-wisps and bell shockwaves fire on each swallow, so eating defends the dive that earned it, one corpse in, one theatrical volley out.

The soul stream is the saturation workhorse: skulls pour straight up out of the grave's mouth, from one thin column at level 1 to five rigid fanned columns at level 5, surging for a beat after each swallow, and never homing. The orbiting headstones are last-ditch close defense, from one slow stone to six in two counter-rotating rings. The will-o-wisps are the game's only homing: each swallowed corpse's soul tears loose and hunts, from one lazy wisp to a converging flight of seven or eight. The bell shockwaves are the funeral toll on every swallow, an expanding damage ring with a small pushback, from a faint nudge to a screen-wide gong with real knockback. The four motions never blur: straight columns, circling solids, curving trails, expanding rings.

Every swallow makes the baseline eat-chime and swallow juice even before any bell line is drawn; the bell line upgrades the chime the player already knows into the damage ring, so RNG drops can never leave the early minutes silent. Four lines at five levels each in v1, and the five levels of a line must look different on screen. Drops for maxed lines are still eaten: bonus radius, score, bomb charge. Everything goes in the hole; nothing on the ground is ever worthless.

## The belch

The one button. Swallowing charges a capped reservoir; the belch vomits it all as a screen-clearing eruption. The cap is load-bearing: corpses eaten at a full reservoir visibly splash and waste, so belching is the greedy play, not the cowardly one. This is the documented cure for shmup bomb hoarding.

## Bosses

Minibosses and bosses arrive on a phase boundary, after the trash wave drains out, and bring authored, readable bullet-hell patterns. They shed edible pieces throughout the fight (knocked-off armor, summoned adds, a feast chunk at each phase break) so the swallow economy never goes dark at the climax, and the player can earn a belch inside the fight. A dead miniboss is a feast: a corpse big enough to jump your size.

Bosses are always shootable (ticket #29). The health bar splits into chunks, one authored pattern per chunk, with a short invincible flash at each chunk break during which player shots do nothing; there are no pure-dodge survival phases anywhere in v1, because the player's storm must always matter. So the will-o-wisps need no boss-side rule: homing is plain damage against bosses. Bosses and minibosses take full bell damage but are immune to bell pushback, so authored patterns never smear; their summoned adds are ordinary live enemies and get pushed normally.

The belch is the bomb everywhere, boss fights included: it cancels every enemy bullet on screen (boss patterns too), deals a big chunk of boss damage, never pushes a boss, and the pattern resumes emitting immediately, so a wipe buys a breath and a repositioning, not a skip. Each wipe is re-earned by diving for shed pieces; boss-fight belch taming (damage per belch, wipe re-earn cadence) is tracked tuning work on the map, watched by a slice instrument.

Shed armor pieces and add corpses run the normal freshness meter; the feast chunk dropped at each chunk break never decays, exactly like an upgrade drop, so the reward beat is calm and steady-bright keeps meaning treasure.

The slice miniboss is the Banshee. Chunk one: slow expanding tear-rings, each with one clean gap. Chunk two: a second offset ring source, so the gaps stop lining up. Her death feast pays a growth jump worth roughly 8 to 10 fresh trash corpses and slams the belch reservoir to full with a pulsing on-screen glow, and the next trash wave, deliberately oversized, is already arriving as the glow lands, so the loaded belch always has a stage to clear and is never reflexed into empty sky.

The slice boss is the Undertaker: the man who seals graves, come to seal you. Chunk one, the burial: shovelfuls of dirt fall from the top as slow clod-curtains with one moving gap. The gap always fits (gap width = current hole diameter plus a fixed margin) and clods are ordinary bullets, one small shrink on touch and never a wall, so size earned before the fight is never punished. Chunk two, the exhumation: a slow one-arm shovel spiral plus summoned digger zombies, which are the slice's one trash enemy re-spawned by the boss (no new enemy budget), whose corpses land inside the fight and keep the swallow economy and the bell alive at the climax. His death is the ending: he topples into the grave and the swallow is the victory animation, no payout, the grave eats the gravedigger.

Enemy pattern grammar stays exclusive too: the Banshee owns expanding enemy rings, the Undertaker owns falling curtains and slow spirals. Her ring deliberately echoes the player's bell ring, one shape with two owners, separated by layer and palette.

## The storm, and reading through it

Endgame target is on the order of 300 player projectiles airborne at once (a tuning target, not content); the soul stream's density (column count, skull spacing, speed) is the free knob that reaches it. Readability is a day-one rule, not polish: enemy bullets render on the top layer in a reserved high-contrast palette; player fire is dimmer and desaturated; corpses and upgrade drops are perceptually unmistakable from each other at a glance.

## Deferred, with triggers

- Stepped zoom tiers with graduating enemy sizes: deferred until a second stage exists. The one-tier game keeps the full identity.
- Satellite mini-graves: deferred; trigger is maxed weapon lines undershooting the saturation target in practice. If built, they shoot but do not eat at full value, and are never independently steered.
- Survival-timer mode: future iteration, and free-roam arena is its native frame, designed arena-native (collection pins you under swarm pressure, short decay so doubling back really loses corpses, no v1-style phase bosses).
- Endless score mode: future iteration.

## Explicitly not doing

- A horizontally panning playfield wider than the screen. Shipped shmups use width as repositioning margin, not roaming room; camera motion taxes bullet readability; corpse deadlines would expire offscreen.
- Genericizing v1's corpse, camera, or threat systems to pre-serve the future arena mode. v1 is built scroller-only.
- Pause-menu upgrade choices. Progression is physical and in-run.
- Mouse-cursor aiming, or any second aim axis. Position is the whole skill; aiming grammar belongs to the deferred free-roam arena mode.
- Cross-line homing upgrades. Homing is the will-o-wisps' identity only; every other line's shots fly dumb and straight.

## Open questions

- The central bet: steering into where danger just was (to eat) versus the shmup instinct to dodge away. Delicious or miserable? The ugly slice answers it with rectangles.
- After a bad hit, does the comeback force (smaller hitbox) or the spiral force (smaller mouth) dominate? Freshness sharpens this: healing off older corpses pays quarter value, so the slice must watch recovery speed on decayed corpses specifically (product gate on #27).
- Slice instruments to build in: time off the bottom edge, belch rate versus full-reservoir time, whether a playtester can say when they got hit, average freshness at swallow once the bell is leveled (its knockback may push kills up-screen into staler corpses), and whether the four line motions stay tellable at full density. From ticket #29's gates: whether the post-Banshee loaded belch lands on the oversized wave or gets spent on empty sky, whether a tester can tell the Banshee's tear-rings from their own bell rings (trigger: shape-break the tears into teardrops before touching the pattern), and how often the belch fires inside each boss fight, with whether a pattern chunk ever ends before finishing one full emit. The slice milestone carries a named playtester and a date.
