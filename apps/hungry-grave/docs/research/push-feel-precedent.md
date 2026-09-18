# Research: how a shove reads as a push, how a wall traps, and how a phone shows a charge

Gathered 2026-09-15 for round two of The Hungry Grave's step 4. Every claim carries a URL, and where a source does not answer, it says so.

## 1. How shipped games make knockback read as a push

**Vampire Survivors.** Knockback is a paired stat, a weapon's multiplier times a body's. The displacement is not a position write: the wiki's own words are that "an enemy's overall movement speed is reversed and multiplied by a knockback multiplier for the duration of the effect", so the shove rides the same per-frame movement the walk uses, and it runs for a stated **120 milliseconds**. The body's own motion is not kept alongside it; the shove replaces the movement value for that window. No source documents hit-stop, a trail, squash or a flash. https://vampire-survivors.fandom.com/wiki/Knockback and https://vampire.survivors.wiki/w/Knockback

**HoloCure.** Velocity-and-duration based: "an enemy travels in the opposite direction based on the speed and duration of the knockback effect", and a body colliding with another mid-shove stops immediately, which only a multi-frame process can do. No duration figure and no visual detail. https://holocure.fandom.com/wiki/Enemy

**Three that do not answer.** Brotato has a knockback stat that always pushes away from the player whatever the hit vector was, but **no source says whether it is one frame or many, how long it lasts, or whether the body keeps its own motion** (https://brotato.wiki.spellsandguns.com/Knockback). Hades yields **nothing usable**: interviews and GDC coverage carry only "impactful, weighty" language with no figures at all. 20 Minutes Till Dawn's threads treat knockback only as a balance annoyance (https://steamcommunity.com/app/1966900/discussions/0/3416559391444370215/).

**Hit-stop, from the genre that documents it.** Fighting games are the only well-sourced precedent. Final Fight held 6 frames, Street Fighter II a flat 14, Street Fighter IV roughly 9, 11 and 13 by strength, and an SF4 projectile freezes the victim about 12 frames and only then starts the push, so freeze and displacement are sequential. **No bullet-heaven source documents hit-stop at all**, so it is not a genre norm to assume. https://sonichurricane.com/?p=1043 and https://www.ssbwiki.com/Hitlag Nijman's "The Art of Screenshake" names knockback, a hit pause, kickback and screenshake as separate levers, but the mirror carrying his numbers could not be read. https://www.youtube.com/watch?v=AJdEqssNZ-U

**The one fully numbered implementation found**, a Godot tutorial, is the most citable model. A dedicated `knockback_velocity` separate from the walk drives the body every frame; decay is **linear** rather than exponential, `move_toward(Vector2.ZERO, KNOCKBACK_DECAY * delta)` with `KNOCKBACK_DECAY = 900.0` against a base `SPEED = 220.0`; a `KNOCKBACK_END_SPEED = 20.0` threshold ends it; and the body's own movement is gated off by a state machine throughout. https://uhiyama-lab.com/en/notes/godot/move-and-slide-vs-move-toward-knockback/

**The synthesis, sourced, and rescoped 2026-09-16 to what the sources above actually say.** Every source that specifies a mechanism describes a timed displacement running over several frames, and **no source found describes knockback as a single-frame position set**; Brotato and Hades say nothing either way, so that is an absence of counter-evidence rather than a survey of every game. **Decay is documented by the Godot tutorial alone**, which is also the only source giving a curve at all; Vampire Survivors and HoloCure state a duration and a reversed or directed speed and stop there. **Suspending the body's own motion has two sources and not all of them**: Vampire Survivors replaces the movement value for the window rather than adding to it, and the tutorial gates the walk off with a state machine. Every duration found is short. **Visual accompaniment during a shove, trail, squash, flash or afterimage, is documented by no source for any of these games**, a real gap rather than an oversight. One caution: Megabonk players name enemy knockback as "by far the biggest issue", so a shove too strong or too frequent reads as chaos rather than force. https://steamcommunity.com/app/3405340/discussions/0/600792156684362820/

## 2. How a wall or ring event traps, and what opens it

**Vampire Survivors, the Flower Wall (Mad Forest).** A ring of durable, low-damage units spawns around the player and creeps inward. No telegraph beyond fixed times, 5:00, 10:00, 15:00 at 80% chance, and 25:10 as five separate 10-second waves; it stands 30, 60 and 30 seconds at the first three. **Nothing opens it as a key**: the wiki's advice is that "it's often better to break through their encirclement rather than stay trapped", because the units are individually low-damage. https://vampire.survivors.wiki/w/Flower_Wall_(event)

**Vampire Survivors, the Coffin ring.** Reaching a coffin spawns an expanding and contracting ring of enemies, with arrival as the only telegraph. It is the closer case to "demands a tool": the wiki names Pentagram and the Clock Lancet, but ordinary damage also clears it, so it is a recommendation rather than a requirement. https://vampire.survivors.wiki/w/Coffin

**Risk of Rain 2, the teleporter.** A red dome about 120 metres across appears on interaction with no prior telegraph, charging over a minimum of 90 seconds at a rate proportional to how many players stand inside, and ending when the boss dies and the charge completes. **The dome does not trap**: players may leave freely and only slow the charge by doing so. https://riskofrain2.wiki.gg/wiki/Teleporter

**The finding that matters.** None of the three is an unescapable lock: the two that encircle block by durability and cost rather than by a rule, and the one real barrier is explicitly leaveable. Brotato, Halls of Torment, 20 Minutes Till Dawn and Deep Rock Galactic: Survivor turned up no comparable mechanic; their hard waves are more bodies, not a barrier. https://brotato.wiki.spellsandguns.com/Elite_and_Horde_Waves

## 3. Whether a pushback-only ultimate reads as a boom that means something

**Super Smash Bros windboxes (Mario's F.L.U.D.D., Squirtle's Water Gun).** A windbox "deals knockback, but causes no hitstun", so the pushed character keeps acting and is simply repositioned. F.L.U.D.D. carries a **two-press charge** with a visible wind-up, the device mounting on Mario's back, cancellable by shielding, with charge level scaling the push. Contact between the stream and another attack produces **significant freeze frames** despite dealing zero damage. What makes it land is that the payoff is positional rather than numeric: it gimps a recovering opponent away from the ledge, changing the stock rather than a health bar, and a windbox cannot lift a grounded body, which scopes its power to the highest-stakes zone. https://www.ssbwiki.com/Windbox and https://www.ssbwiki.com/F.L.U.D.D.

**Overwatch, Lucio's Soundwave, the "boop".** Players and forums treat displacement rather than damage as the ability's identity, to the point of a forum proposal that it should deal zero damage outright, and its value is read independently of its damage number because it shoves people off a point, off a ledge, or out of an ultimate. **The honest caveat: it is not zero damage today**, with a minimum raised 20 to 25 in the 2026-01-08 patch, and no Blizzard statement was found making the design argument explicitly. https://overwatch.fandom.com/wiki/L%C3%BAcio and https://us.forums.blizzard.com/en/overwatch/t/lucio-boop-idea/169131

**Caveat on this section.** No GDC talk, dev blog or interview was found arguing explicitly that a no-damage boom reads as impactful because of a wind-up, a ring, shake or sound. The concrete facts are F.L.U.D.D.'s charge-and-freeze behaviour and the windbox no-hitstun property; the rest is inference, marked as such wherever this research is cited.

## 4. How a phone shows a charge meter for an ultimate

**Brawl Stars** shows the Super as "a gray circular meter with a slim yellow ring that tells you how much of your Super is charged", a filling ring rather than a wipe, and when full "the Super joystick glows yellow" with a ring spinning around the brawler: a colour change, a glow and a second channel. https://brawlstars.fandom.com/wiki/Beginner's_Guide

**Genshin Impact** fills the Elemental Burst icon with the element's colour as energy accumulates, bottom-right, and when ready "the icon will glow and an audio cue will play", with the gem slowly pulsing. https://genshin-impact.fandom.com/wiki/Elemental_Burst

**League of Legends** ships an "Ability Cooldown Display" whose option is named "None (radial timer only)", which is Riot's own name for the convention. https://wiki.leagueoflegends.com/en-us/Settings

**Material Design** makes consistency the load-bearing rule, treats determinate versus indeterminate as more important than circular versus linear, and names the circular indicator as the form that applies directly to a surface such as a button. https://github.com/material-components/material-components-android/blob/master/docs/components/ProgressIndicator.md

**The claim that could not be sourced.** No NN/g or Material text says a radial fill is measurably worse than a bar for reading an exact percentage. Treat it as folklore and do not cite it. https://www.nngroup.com/articles/progress-indicators/

## 5. Thumb zones and touch targets

**Hoober, UXmatters 2013.** One-handed use is 49% of observed grips, and of those the right thumb is on the screen 67% of the time; cradling is 36% and two-handed 15%. Reach maps green (easy), yellow (a stretch) and red (needs a grip change), and Hoober's own caution is that grips change often, sometimes every few seconds. https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php

**Hurff's thumb-zone map, via Smashing Magazine.** Green sits at the bottom and centre-bottom, biased toward the side of the holding hand; yellow is the mid-screen sides; **red is the top corners and, for a one-handed grip, the far bottom corner across from the holding hand**. A combined overlay is the recommendation when both handednesses are supported. https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/

**Touch target floors.** Apple's HIG recommends 44 by 44 points as its default tappable area rather than stating it as a conformance minimum, Material recommends 48 by 48 dp, and the figures that are requirements are WCAG 2.2's: 2.5.8 at AA, 24 by 24 CSS pixels with five exceptions, and 2.5.5 at AAA, 44 by 44. **The 44 by 44 this project holds itself to is the AAA one** and the coincidence with Apple's number is not what it rests on. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

**What could not be sourced.** No primary description of button geometry in a named portrait mobile shmup; Vampire Survivors mobile is confirmed only as joystick-left and abilities-right, so a 540 by 760 portrait layout has no shipped citation behind it.
