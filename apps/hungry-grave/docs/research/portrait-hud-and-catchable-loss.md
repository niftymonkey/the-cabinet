# Portrait HUDs, and power lost as a thing you can chase

Research for Hungry Grave path step 5, gathered 2026-09-16 for [`../design/show-what-you-have.md`](../design/show-what-you-have.md). Labels: **DOCUMENTED** = a primary source read directly. **SECONDARY** = a wiki, guide or trade-press account of shipped behaviour. **WEAK** = reachable only through a search summary, or contradicted by another source.

This document sits beside [visible-ladder-precedent.md](visible-ladder-precedent.md), [floor-ladder-precedent.md](floor-ladder-precedent.md), [viewport.md](viewport.md) and [push-feel-precedent.md](push-feel-precedent.md). Those already hold the Gradius power-up gauge and Machiguchi's account of it, Cave Story's experience bar, Halls of Torment's chevron patch, Battle Garegga's dropped power item, Boghog on what a player can read under fire, the engine-by-engine viewport policy menu, and the shipped radial-fill precedents. Anything there is cited and never repeated. The new ground here is **portrait**: where a phone-shaped game puts a score and a level, what the platform rules say about the edges of a phone, and whether anything ships a lost power the player can dive after.

## What is solid

Five claims are worth building on.

**1. No shipped portrait game in this pass puts its level readout anywhere but the top of the play area, and two shipped vertical shmups make the score's position a setting.** Sections 1, 3, 5 and 7.

**2. The closest portrait-mobile analogue of a per-line rung is a row of blocks that fill, not a number.** Sky Force Reloaded shows a weapon tier as ten blocks that progressively light up, **though on its hangar screen rather than its live HUD** (section 2), and Halls of Torment's shipped fix for an unreadable level was a mark on the icon rather than a digit beside it (section 4).

**3. The catchable lost power has no shmup precedent at all, and the one arcade game that ships the catch is Defender.** R-Type, Darius and Thunder Force all subtract on death with nothing left behind (section 8). Defender's humanoid falls, can be caught mid-air, and dies if the fall was great enough.

**4. A portrait shmup has already shipped a HUD-position patch because a phone's hardware ate its score.** Bullet Hell Monday 2.3.0, dated, in the App Store's own version history (section 12). This is the evidence that safe-area work on a portrait game is not theoretical.

**5. Apple does not state 44 by 44 points as a minimum, and this project has been repeating the industry's loose version of that number.** Apple's own accessibility page tabulates 44 by 44 as the iOS *default* and 28 by 28 as the minimum (section 9). The floor worth holding is WCAG's 44 at AAA.

## 1. Vampire Survivors

**There is no score at all, and the experience bar sits at the top of the HUD.** The end-of-run Results screen lists stage, mode, gold bonus, time survived, gold earned, level reached and enemies defeated, and the word score does not appear anywhere on it; the level-up bar is "shown on the top of the game HUD". SECONDARY, [Results](https://vampire.survivors.wiki/w/Results) and [Level up](https://vampire.survivors.wiki/w/Level_up).

**The always-visible corner row of weapon icons carrying level badges could not be confirmed from a primary source in this pass and stays WEAK.** That is the same caveat [visible-ladder-precedent.md](visible-ladder-precedent.md) already records against its own item 11, reached independently here.

## 2. Sky Force Reloaded

**It ships in portrait on phones. Its ten-block tier display is a hangar screen and not an in-run readout, and a first draft of this record blurred the two.** Each plane carries eight armaments, each with a variable number of tiers, and each tier is ten blocks that fill with every upgrade until the tier promotes; **that is the between-runs upgrade screen**, where the player spends stars, not something drawn over the play field while dodging. SECONDARY, [Loadout](https://sky-force-reloaded-2016.fandom.com/wiki/Loadout), reached through a search summary rather than a direct fetch because the page refused one.

**What it is still good for, and what it is not.** It is real shipped evidence that a portrait mobile shmup expresses a level as a row of filling blocks rather than a digit, which is a claim about the *form* of a count. **It is not evidence that such a row belongs on the live HUD**, and anything leaning on it for placement is leaning on the wrong half. The live-HUD placement claims in this document rest on sections 1, 3, 5 and 7.

Portrait orientation on the mobile version is DOCUMENTED from the [Google Play listing](https://play.google.com/store/apps/details?id=pl.idreams.SkyForceReloaded2016); a separate widescreen version exists for desktop and console.

Score is a running tally fed by enemies dropping stars and points, with a multiplier that breaks when a kill chain does. SECONDARY, [Game Play](https://sky-force-reloaded-2016.fandom.com/wiki/Game_Play), same fetch caveat. **The score counter's exact screen position was not confirmed.**

## 3. Cave Story

**The weapon experience bar carries the level beside it, in the top-left.** Already established in [visible-ladder-precedent.md](visible-ladder-precedent.md) item 6 and cited here for placement rather than re-established.

## 4. Halls of Torment

**Chevrons were added to the HUD's ability icons four months after launch, under a heading called UI.** DOCUMENTED, [patch notes 2023-09-21](https://primagames.com/tips/halls-of-torment-update-2023-09-21-patch-notes), already in [visible-ladder-precedent.md](visible-ladder-precedent.md) item 9.

It is a construction and a warning at once: the fix for a level nobody could read was a mark drawn on the icon, not a number placed beside it.

## 5. Danmaku Unlimited 3

**The graze counter sits top-left with its gauge below it, a hyper gauge sits on the right, and TATE rotates the whole interface ninety degrees.** SECONDARY, [shmups wiki](https://shmups.wiki/library/Danmaku_Unlimited_3).

**The raw score's exact position could not be confirmed**, only the graze counter's.

## 6. HoloCure

**The HUD is a portrait, six weapon and six item slots with equipped stamps, HP, experience, level, special attack, stage, timer, coin count and kill count, with buffs along the bottom.** SECONDARY, [HUD](https://holocure.wiki.gg/wiki/HUD) and its [Fandom mirror](https://holocure.fandom.com/wiki/HUD).

No score stat. Progression reads as kills, gold and level, the same shape Vampire Survivors uses.

A later update is referenced as having made inventory icons clearer and moved the HP bar beside the portrait, but no patch number or note URL was found, so **that revision is WEAK.**

## 7. Vertical shmups treat score as separable furniture

**Ikaruga's vertical layout orders score, enemy health bar, chain status, energy bar and life stock from top to bottom, and "players can configure the scores, lives, etc. to display outside the playing field."** WEAK, reached through a search summary of a [Steam Community thread](https://steamcommunity.com/app/253750/discussions/0/540744937314956518/) that refused a direct fetch.

**DoDonPachi Resurrection's settings treat score as its own overlay window: an independent toggle for showing it at all, a second for the high score, and X and Y position sliders to place it anywhere on the physical screen**, commonly used to push it into the pillarbox beside the vertical field. WEAK, same reason, a search summary of a [shmups.system11.org thread](https://shmups.system11.org/viewtopic.php?t=58342&start=450).

**No developer statement was found explaining why score sits in a side panel.** The convention is attested structurally, by position sliders and dedicated toggles and configurable pillarbox placement, and its cause is inference. That is the same absence [visible-ladder-precedent.md](visible-ladder-precedent.md) records for Cave, Treasure and Raizing: those studios' shipped readability statements are all about the play field and none of them is about the status bar.

TATE itself, and the pillarbox-with-treated-surround answer on a landscape monitor, are already in [viewport.md](viewport.md) findings F34, F35 and F37 and are not re-established here.

## 8. Lost power as a catchable object

**Nothing in the shmup lineage drops power into the field for the player to chase.** R-Type wipes weapons, Force and speed at a checkpoint with nothing left behind. Darius Gaiden steps shot power down one full stage and leaves nothing. Thunder Force IV removes exactly one equipped weapon, downgrading or deleting it, and never drops it. No Gradius-family game ejects power as an object; the meter resets, wholly in the arcade games and gradually right-to-left in Gradius III's Beginner Course. All SECONDARY: [shmups wiki R-Type](https://shmups.wiki/library/R-Type), [Darius Gaiden](https://shmups.wiki/library/Darius_Gaiden), [StrategyWiki Thunder Force IV](https://strategywiki.org/wiki/Thunder_Force_IV/Gameplay) (direct fetch refused, search summary), [Gradius Power Meter](https://gradius.fandom.com/wiki/Power_Meter). **The Gradius III gradual-strip detail is WEAK**, snippet-sourced only.

**This is a negative result and it corroborates Hungry Grave ADR 0055's own claim to new ground**, reached by a different route than [visible-ladder-precedent.md](visible-ladder-precedent.md)'s pass, which found the catch-back cases and noted that every one of them recovers from a death.

**Battle Garegga drops one power item per option lost and every dropped item stays on the field on the ordinary clock**, so nothing about a dropped upgrade expires early. SECONDARY, [shmups wiki](https://www.shmups.wiki/library/Battle_Garegga). This is the answer design record R6 takes for whether an untaken fallen rung lingers.

**Defender ships the catch, and it names the risk variable.** A Lander that seizes a humanoid carries it upward; shooting the Lander releases the humanoid, which falls freely, and the player can fly underneath and catch it mid-fall and carry it back down. "If the fall was great enough" the humanoid dies on impact before it can be intercepted, so catching early is safer than catching late. A humanoid carried off the top edge becomes a Mutant, a worse enemy, so intervening is worth more than its rescue points. SECONDARY but editorially reviewed, [Game Developer, The History of Defender](https://www.gamedeveloper.com/business/the-history-of-i-defender-i-the-joys-of-difficult-games), corroborated by dougmahugh.com's account of the arcade original and by the Intellivision port's own manual. The mechanic was direct enough to be credited as the inspiration for Choplifter.

**No sourced number exists for Defender's height threshold**, only the qualitative rule. Anything that wants a number here has to derive it rather than cite it.

**Sonic's ring scatter is now sourced with its numbers, and the earlier note recording them as unreachable is retired.** A scattered ring lives **255 frames**, about four and a quarter seconds at 60Hz, and is **not collectable for its first 64 frames**, a little over a second, so the player is forced to watch the loss before the chase is even possible. The recoverable count caps at twenty in the 16-bit original however many were held. SECONDARY, Sonic Retro's SCHG ring-loss documentation; [Ring, Sonic Wiki Zone](https://sonic.fandom.com/wiki/Ring) corroborates the cap.

**The 64-frame no-recollect window is the transferable part and it is not a timer, it is a beat.** It exists so the loss registers as a loss before it becomes a chase, which is the same job Hungry Grave's spawn offset does by geometry rather than by a clock (design record R6).

**Sonic's rings are both the score and the death buffer, and they refill only by the player's own act** ([floor-ladder-precedent.md](floor-ladder-precedent.md)). Nothing in that game re-arms the buffer as a side effect of the player's weapon firing. That is the precedent under design record R4's bled-rung memory.

**Vampire Survivors' experience gems are the opposite pole and worth naming as such.** They sit on the ground until collected, are pulled in by a magnet radius, and cap at 400 on the field, past which further experience folds into one red gem rather than spawning more objects. SECONDARY, [Experience Gem](https://vampire.survivors.wiki/w/Experience_Gem). **Whether they despawn on a timer could not be confirmed either way.** A magnetised pickup with a population cap has no dive-back tension at all, which is what makes it the contrast case.

**Raiden Fighters is the clean "falls off the bottom and it is gone" case.** A medal worth over 10,000 points that leaves the bottom edge resets every future medal to the 10,000 base, so one escape breaks the whole chain rather than costing one pickup. WEAK, search summaries of [rf-emporium](https://rf-emporium.ghegs.com/rfjet/secrets.htm) pages that were not directly fetched.

## 9. Touch targets, and a correction to a number this project repeats

**WCAG 2.2 SC 2.5.8 Target Size (Minimum), Level AA: "The size of the target for pointer inputs is at least 24 by 24 CSS pixels", with five exceptions.** DOCUMENTED, [w3.org](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

**SC 2.5.5 Target Size (Enhanced), Level AAA: at least 44 by 44 CSS pixels**, with four exceptions. DOCUMENTED, [w3.org](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html).

**Material Design 3: "consider making touch targets at least 48 x 48dp. A touch target this size results in a physical size of about 9mm", with "targets separated by 8dp of space or more", and a note that "iOS recommends 44 x 44dp targets."** DOCUMENTED, [m3.material.io](https://m3.material.io/foundations/designing/structure).

**Apple's current Human Interface Guidelines do not state 44 by 44 points as a minimum.** Its accessibility page tabulates, per platform, a default control size and a minimum control size: for iOS and iPadOS, **44 by 44 points default and 28 by 28 points minimum**. Its wording is "Strive to meet the recommended minimum control size for each platform." DOCUMENTED, [developer.apple.com](https://developer.apple.com/design/human-interface-guidelines/accessibility).

**This contradicts the widely repeated claim that 44 is Apple's floor, and [viewport.md](viewport.md)'s F-item on touch minimums carries the loose version.** The floor worth holding is WCAG's 44 at AAA, which is a real published requirement and is stricter than Apple's own stated minimum.

**The safe area's purpose is DOCUMENTED and its numbers are not.** Apple: "A safe area defines the area within a window that isn't covered on the edge by a hardware feature or another view within the window... Respecting the safe area is essential to make sure system UI and hardware features like the Dynamic Island don't obstruct content and controls", [developer.apple.com](https://developer.apple.com/design/human-interface-guidelines/layout). **The commonly cited 34 points for the home indicator and 44 to 59 points for the status bar and Dynamic Island region are empirical, observed through runtime insets, and were not found stated as a published table in Apple's current prose.** WEAK as numbers, and the reason to read them from `env()` at runtime rather than declare them.

## 10. Viewport units

**`lvh` is the viewport with browser chrome retracted and is what bare `vh` currently equals; `svh` is the viewport with chrome fully expanded; `dvh` updates live as chrome shows and hides.** DOCUMENTED, [MDN length](https://developer.mozilla.org/en-US/docs/Web/CSS/length).

**`svh` is the unit for a canvas that must never be clipped and must never move.** `dvh` guarantees the canvas always fills the window and pays for it by resizing under whatever is running inside it.

## 11. Browser gestures under a canvas

**`env(safe-area-inset-*)` returns zero unless the page opts in with `viewport-fit=cover` in its viewport meta tag.** DOCUMENTED, [MDN env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env) and [MDN viewport-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/@viewport/viewport-fit).

**`touch-action: none` hands every gesture to the page and `overscroll-behavior: none` suppresses scroll chaining and the navigation gestures built on it.** DOCUMENTED, [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) and [MDN overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior). MDN flags that `touch-action: none` also disables pinch-zoom, which is an accessibility cost.

**No specification-level mechanism to suppress iOS Safari's system edge-swipe was found.** The edge-margin workaround in circulation is developer practice rather than a documented API. The PWA display modes, `fullscreen` through `browser`, are DOCUMENTED at [MDN display](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display) and **none of them is documented as suppressing the OS gesture either.**

## 12. A portrait shmup that patched its HUD because hardware ate its score

**Bullet Hell Monday 2.3.0, dated 2024-01-24, verbatim: "support to adjust the position of the HUD on the settings screen. (Available for devices equipped with iPhone's Dynamic Island; allows adjustments when the score is hidden.)"** DOCUMENTED, [App Store version history](https://apps.apple.com/us/app/bullet-hell-monday/id1107355213).

A portrait shmup shipped, the notch hid the score, and the fix was a position control. **It is the strongest single item in this document for the claim that a portrait game's edges are a design surface rather than a detail.**

Its multiplier is reported as a percentage at the top of the screen, WEAK, from a [minireview.io](https://minireview.io/arcade/bullet-hell-monday) summary. The Steam store page carries no interface description at all, checked directly.

## 13. Thumb reach

**Hoober's observational study of more than 1,300 people: 49 percent hold the phone in one hand and use that hand's thumb, 36 percent cradle it and tap with the other hand, 15 percent use two thumbs.** DOCUMENTED, [UXmatters, 2013-02](https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php). This is the origin of the thumb-zone vocabulary.

**Hurff's per-device thumb-zone maps build on Hoober's data and put the far bottom corner across from the holding hand in the hard-reach zone.** [scotthurff.com](http://scotthurff.com/posts/how-to-design-for-thumbs-in-the-era-of-huge-screens). Already cited by [push-feel-precedent.md](push-feel-precedent.md) section 5 and by round two's finding on the belch corner.

**No Apple HIG page discussing thumb-reach zones for iPhone touch placement was found**; Apple's reach guidance is for Watch and CarPlay layouts. Material 3 says only to "place important actions at the top or bottom of the screen", [m3.material.io](https://m3.material.io/foundations/designing/structure).

**What the sources do support: controls belong low and read-only information is safe high.** That is an inference from the zone maps plus Material's placement line, not a statement anyone made about a game.

## 14. Searched for and not found

Recorded as absences, and none of them is used as evidence for anything above.

- **Survivor.io's HUD layout.** The closest shipped portrait bullet heaven to Hungry Grave's shape, and no review, wiki page or developer statement describing where its score, timer, level or skill row sit was reachable. Its capacity, six active and six passive skills, is SECONDARY from [One Chilled Gamer](https://onechilledgamer.com/survivor-io-skill-guide/) and says nothing about placement.
- **Brotato's in-wave icon row.** Its slot counts are sourced; where the row sits and how a tier is drawn on an icon is not, across several targeted searches. Its deliberate withholding of stats during a wave is already in [visible-ladder-precedent.md](visible-ladder-precedent.md) item 10.
- **Archero.** Nothing sourced on wave-counter or ability-icon placement.
- **Any developer statement on why a vertical shmup's score sits in a side panel.** Section 7.
- **Defender's catch-height threshold as a number.** Section 8.
- **Resogun's rescue window as a number.** Every source describes the risk qualitatively rather than as a clock, and the absence of a timer could not itself be confirmed.
