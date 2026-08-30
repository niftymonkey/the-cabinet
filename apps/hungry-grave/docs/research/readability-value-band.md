# Readability palette research: the reserved value band for mob fire

Research pass for [ADR 0014](../adr/0014-readability-layering.md) and the `palette.ts` module in [tracer-plan.md](../design/tracer-plan.md), answering two questions: what band should `palette.ts` encode for mob fire, and what numbers should a unit test enforce.

**Section 0 is the whole rule and stands on its own: it can be implemented and tested from without reading a line of the rest.** Everything after it is the evidence, there to be cited and spot-checked rather than re-read. Every number in section 0 carries the section that justifies it. Every number in this document is either measured here (the arithmetic and the browser measurements are reproducible from it) or cited to a primary source, and where the evidence is thin it is labelled thin, with the full accounting in section 6.2.

## 0. The rule

### 0.1 The metric

Every value in this document, and every value a test asserts, is **Rec.709 luma on gamma-encoded sRGB**, scaled 0 to 100:

```ts
/** Rec.709 luma on gamma-encoded sRGB, 0-100. The channels are the raw 0-255 sRGB bytes and are NOT linearized. */
export function luma(hex: number): number {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  return ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255) * 100;
}
```

This is exactly what `filter: grayscale(1)` produces, verified byte-for-byte against Chromium on all 27 palette colours. It is the metric the grayscale screenshot will contain, so it is the metric the unit test must use. Do **not** use WCAG relative luminance, do **not** use CIE L\*, and do **not** let the screenshot check call a library default: three plausible metrics give three different bands and three different lists of violators. *(Justified in [section 4](#4-which-luminance-metric-and-why); the divergence table is [4.4](#44-the-same-palette-under-four-metrics).)*

### 0.2 The band

```ts
export const MOB_FIRE_BAND_MIN = 88;    // only a mob-fire CORE colour may sit at or above this luma
export const FIELD_LUMA_CEILING = 68;   // every other declared colour must sit at or below this luma
export const BAND_MARGIN_MIN = 20;      // MOB_FIRE_BAND_MIN - FIELD_LUMA_CEILING
```

The band is at the **top** of the range, not the middle. The field is capped and mob fire owns what is above the cap. *(Band shape: [1.2](#12-the-band-shape-top-not-middle). The 88 floor and the free 68 ceiling: [1.3](#13-the-numbers). The margin, which is the thinnest number here: [6.2](#62-what-is-well-sourced-here-and-what-is-not).)*

### 0.3 Mob fire is three colours, not one

Every mob-fire sprite declares a **core**, a **body** and an **outline**:

| part | constraint | carries |
| --- | --- | --- |
| core | `luma >= 88`, near-neutral warm white | the value guarantee, and the band exclusivity |
| body | `luma <= 68`, saturated | the hue, and the size-and-shape grammar |
| outline | near-black | readability against anything bright the band did not anticipate |

The band alone is not the rule. A sprite that carries light-against-dark **internally** reads against a background the palette never planned for, which is why this construction and not a flat bright bullet. *(Justified in [2.3](#23-the-construction-that-actually-makes-a-bullet-win-internal-contrast); Enter the Gungeon ships a core at roughly luma 90 with a near-black outer ring.)*

### 0.4 The eleven assertions

1. **Declared luma matches the hex**, within 0.05.
2. **Presence.** Every `mobFireCore` has `luma >= MOB_FIRE_BAND_MIN`.
3. **Exclusivity.** Everything not `mobFireCore` has `luma <= FIELD_LUMA_CEILING`.
4. **Margin.** `MOB_FIRE_BAND_MIN - FIELD_LUMA_CEILING >= BAND_MARGIN_MIN`, as its own test.
5. **Coverage.** Every mob-fire emitter names at least one `mobFireCore`.
6. **Colour vision.** Assertions 2 and 3 hold under the protanope and deuteranope luminance weights.
7. **No shared hex** between any fire and any non-fire colour.
8. **Visible against the sky.** Every core clears APCA Lc 45 against every background colour.
9. **Internal contrast.** Core-to-outline luma span at least 20.
10. **Hue exclusivity** between mob fire, effects, and pickups.
11. **The field's boundary is visible.** The boundary readout clears APCA Lc 45 against the ground it is drawn on, which is the fine-detail level and carries no width floor. It was Lc 30 and a 5.5-pixel floor until 2026-08-22; 7.6 has the re-grading and what it cost.

Assertion 11 was added on 2026-08-20 by the render-structure gate. The first ten give mob fire a floor and everything else a ceiling, and ask of nothing else that it be visible at all, which is how a boundary at APCA Lc 0.00 passed three gates unseen. Its reasoning is in 7.6.

*(Each spelled out with its rationale in [1.6](#16-what-the-unit-test-should-assert). The CVD weights are in [5.3](#53-how-the-band-moves-for-a-colourblind-player); the APCA implementation is in [3.3](#33-the-apca-constants-and-why-it-is-the-right-model-on-a-near-black-field).)*

### 0.5 The three code rules no test in 0.4 can see

1. **Mob fire draws at alpha 1.0, with no blend mode.** Alpha eats the margin: a core at luma 90 at alpha 0.90 over `night` composites to 81.7, below the band. Forbid it rather than measure it, the same way ADR 0014 already forbids additive blending on the storm.
2. **The grayscale screenshot check is a differential, not a histogram.** Two captures at the same autopilot tick, one full field and one with the mob-fire layer hidden; any pixel at or above `MOB_FIRE_BAND_MIN` in the fire-hidden capture is a violation. A single-capture histogram cannot work, because an antialiased bright sprite necessarily puts edge pixels inside the forbidden gap.
3. **Convert to grayscale with the same formula as 0.1.** Apply `filter: grayscale(1)`, or transform the captured PNG with the exact expression above. Not an SVG `feColorMatrix` (defaults to linearRGB, and behaved unreliably in testing) and not Pillow's `convert("L")` (which is BT.601).

*(Justified in [1.7](#17-overlap-and-compositing-which-neither-instrument-sees) and [4.3](#43-two-ways-to-get-this-wrong).)*

### 0.6 The four things that must change in the palette today

1. **`hitFlash` `#ff4a3d` is the identical hex to `enemyShot`.** Fix it by announcing the hit through **subtraction**, a brief darkening of everything except mob fire, rather than by adding a bright colour. *(Reasoning, and the ADR 0008 argument for why this game cannot afford the flash that Cave and Touhou can: [1.4](#14-the-player-hit-flash).)*
2. **Seven non-fire colours are above the ceiling** and must come down: `belchFlash` 95.1, `feast` 94.8, `corpse` 89.3, `banshee` 89.2, `graveGlow` 79.5, `drop` 79.5, `bellRing` 73.9. *(Full sorted palette: [5.1](#51-the-band-today).)*
3. **The four fire colours must gain cores and outlines.** As they stand two of them, `enemyShot` at APCA Lc 41.8 and `enemyClod` at Lc 41.4, are below the fine-detail minimum against the night sky before the band question even arises.
4. **`dropCore` `#4a3b12` is a brown** (hue 43.9 degrees, saturation 0.76, value 0.29) and violates the ban. It is the only violator; nothing is near the banned purple range. *(Full hue audit: [1.5](#15-dropcore-is-a-brown) and [5.2](#52-the-hue-audit).)*

### 0.7 One decision this document does not make

ADR 0014's "mob fire owns a reserved value band that nothing else on the field may enter" has two readings that cost very different amounts, and picking one is Mark's call. Section 0 assumes the cheaper reading. *(Both options priced in [6.1](#61-the-one-call-that-is-marks) and [5.4](#54-what-each-option-costs).)*

### 0.8 Two things to stop citing

ADR 0014's parenthetical that "Ikaruga's polarity is a value opposition" is fan analysis, not a Treasure statement, and "enemy bullets should be the brightest thing on screen" is folklore with no named source behind it. Neither weakens the rule, which is independently supported. Both should stop being cited for it. *(Evidence: [2.1](#21-two-claims-that-do-not-hold-up).)*

---

## 1. The recommendation, and why each number is what it is

Section 0 is the rule. This section is the same rule with its reasoning attached, and it is what to read when a number needs to be challenged or changed rather than applied.

### 1.1 The metric

Express the band as **Rec.709 luma on gamma-encoded sRGB**, on a 0 to 100 scale:

```
luma = (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255 * 100     // R, G, B are the 0-255 sRGB bytes, NOT linearized
```

This is well sourced and was verified empirically, not assumed. It is exactly what `filter: grayscale(1)` produces, which is what the ADR's grayscale screenshot check will read. Section 4 has the spec text and the browser measurements. Do not use WCAG relative luminance for the band, do not use CIE L\*, and do not let the screenshot check reach for a library default, because three plausible metrics give three different bands and three different lists of violators (section 4.4).

### 1.2 The band shape: top, not middle

**The band should sit at the top of the value range, and the rest of the field should be capped below it.** The current palette puts mob fire in the middle (43.7 to 59.8), which is the structurally worst choice available: a middle band has to be defended from both directions, and the palette already has eight non-fire colours within five luma points of one of its two edges. A top band has one edge to defend.

Say it as *the field is capped and mob fire owns what is above the cap*, not as *mob fire is the brightest thing on screen*. The second phrasing is folklore and no developer is on record saying it (section 2.1). The first is what the one measurable shipped example does: ZeroRanger's backgrounds top out at luma 51.3 while its bullet-bright elements sit at 64.0, 79.9 and 100.0 (section 2.6). It is also how Boghog states the rule from the constraint side, "low contrast backgrounds that rely primarily on midtones... let you freely use extreme values for important elements", and how Cave got there in practice, by drawing the background black and sparse rather than by boosting bullets (section 2.2).

The top band also fixes a problem the current palette has independently. `belchFlash` at luma 95.1 is the single brightest colour in the game, and it is a player effect. ADR 0014 forbids a player effect occluding mob fire; a player effect being the brightest region on the field is the same failure by a different route.

There is a third argument, and it is the one that surprised me. Pushing the band up **automatically makes the band stable for protanopes**, because you cannot reach high luma with a saturated red. The four current fire colours are the four colours in the whole palette whose apparent lightness moves most for a protanope (section 5.3). Desaturating them to reach a high band shrinks that movement from about 11 points to about 2. WCAG's own rationale for SC 1.4.3 flags this exact combination, long-wavelength colours against a dark background, as the one case where its luminance model does not hold for colour vision deficiency, and then never published the mitigating technique it promises (section 3.1).

There is a fourth, which is not about the band at all but falls out of the same change. Measured in APCA against the `night` background, `enemyShot` scores **Lc 41.8** and `enemyClod` **Lc 41.4**, both below APCA's Lc 45 minimum for fine-detail pictograms, which is the category a small bullet falls into. A near-white core scores Lc 89 or better. The current fire colours are not only badly separated from the rest of the palette, they are marginal against the sky they are drawn on.

### 1.3 The numbers

Two readings of ADR 0014 are available and they cost very different amounts. This is the one call in this document that is genuinely Mark's, and section 6.1 puts it plainly.

**Recommended (option B, the bright-core reading):**

```
MOB_FIRE_BAND_MIN  = 88    // only a mob-fire core colour may sit at or above this luma
FIELD_LUMA_CEILING = 68    // every other declared colour must sit at or below this luma
BAND_MARGIN_MIN    = 20    // MOB_FIRE_BAND_MIN - FIELD_LUMA_CEILING, asserted separately
```

Each mob-fire sprite declares **three** colours, which is the construction Enter the Gungeon shipped and Boghog states as the general danmaku pattern (section 2.3): a near-white **core** inside the band, which carries the value guarantee; a saturated **body** below the ceiling, which carries the hue and the size-and-shape grammar the ADR already names as the primary discriminator; and a near-black **outline**, which is what makes the sprite survive being drawn over something bright. The outline is not decoration. It is the half of the construction that stops the whole rule from depending on the band holding, and it is why Crooks describes a Gungeon bullet as "90% white and a very dark red halos and a second ring of darker red, almost black".

The 88 floor is not arbitrary against that: Gungeon's core sits at roughly luma 90.

**A caution on the ceiling of the band.** Riot's VFX Style Guide bars pure white and pure black from its VFX band outright, on the grounds that both are already claimed by the environment and the UI (section 2.2). Hungry Grave has no bright UI on the field and nothing else near-white once the seven violators come down, so 100 is probably safe here, but if a HUD element or a white flash is ever drawn over the field, the band's top needs revisiting rather than assuming.

The ceiling is 68 rather than 72 because it is free. The palette has a natural gap between `enemy` at 66.6 and `bellRing` at 73.9, so any ceiling from 67 to 73 breaks the **same seven colours**, and picking the bottom of that gap buys four extra points of margin at no cost. Seven non-fire colours have to come down either way: `belchFlash` 95.1, `feast` 94.8, `corpse` 89.3, `banshee` 89.2, `graveGlow` 79.5, `drop` 79.5, `bellRing` 73.9. At a 68 ceiling the food is still bright (`corpse` lands around `#b4b1a3`), which is the reason to prefer this option over option C below.

A 20-point margin is worth **APCA Lc 26** between the band floor and the field ceiling. For scale, APCA treats anything below Lc 15 as "invisible" and sets Lc 30 as the minimum for solid icons at least 5.5px across. Lc 26 is short of that, and 20 points is a floor rather than a target: Lc 30 would need a 23.5-point margin, which is available by lowering the ceiling to 64.5 at the cost of one more colour (`enemy` at 66.6). Section 3.3 has the thresholds and the caveat that APCA's numbers were calibrated for reading a foreground against a background, not for telling two sprites apart.

**Option C, the strict reading**, where every mob-fire pixel must be inside the band, needs `MOB_FIRE_BAND_MIN = 74` and `FIELD_LUMA_CEILING = 58`, and it costs much more. At luma 74 the fire colours must desaturate from HSV saturation 0.72-0.76 down to 0.35-0.46, becoming pale salmon (`#ffaca6`, `#ffaf89`), which throws away the red-means-danger hue signal. Eleven non-fire colours have to come down, and the food lands in muddy mid-grey (`corpse` at `#959286`). The arithmetic for both options is in section 5.4.

**A companion rule the value band does not replace: reserve the hue too.** This is the one thing every shipped studio in section 2 actually does, and Cave enforces it in three mutually exclusive channels rather than two. Tanaka: "Our games use a lot of pink, blue, and colorful bullet patterns, so I try not to use those colors in the backgrounds. **I also avoid using the orange colors of explosions.**" Wakabayashi extends it to pickups. Hungry Grave has all three classes (mob fire, the belch and hit effects, and the drops and food), and it currently has a hue collision on top of the value one: `enemySpiral` at hue 19 degrees is close to `graveGlow` and `drop` at 41.5 and `dropCore` at 43.9, which is fire crowding treasure. A hue-exclusivity assertion is as cheap as the value one and it covers the axis with the actual shipped track record behind it.

### 1.4 The player-hit flash

`hitFlash` is `#ff4a3d`, the exact same hex as `enemyShot`. This is the worst entry in the set and it should not be fixed by nudging the value.

**The hit should announce by taking value away from the field, not by adding a bright colour to it.** A brief darkening or desaturation of everything except mob fire makes mob fire *more* readable at the exact moment the player most needs to read it, and it satisfies ADR 0014's two-channel requirement without putting a single new pixel anywhere near the reserved band.

This is a documented pattern rather than an invention. Microsoft and AbleGamers' [Accessible Player Experiences](https://accessible.games/accessible-player-experiences/) publishes it as the **Clear Channels** pattern: "Players with visual disabilities may need to remove background details to be able to distinguish important objects in the foreground", with *Way of the Passive Fist* cited as the shipped example, where "the background has a darkening filter that causes character models and visual cues from the enemy NPC attacks to stand out more significantly."

The reason this matters more in Hungry Grave than in the games it borrows from is specific and ADR-grounded. Cave games and Touhou clear the bullets on the screen when the player is hit, so their bright hit flash lands on an empty field. Hungry Grave ADR 0008 resumes the boss pattern immediately and grants no invulnerability, so its flash lands on a field that is still full of fire, and lands there at the one moment the player has to re-read the whole screen from a new position. A red flash at the hue and value of enemy fire, fired into a screen full of enemy fire, is the readability failure ADR 0014 exists to prevent.

If a flash is kept as one of the two channels, it must be neither red nor in the band, and the third channel should be the grave's rim, which ADR 0014 already makes the health bar.

AbleGamers' Includification reached the same conclusion for the same reason in a different genre, and it is the one piece of games guidance that names this exact collision: "In situations where both the enemy and reticle are red, the user is unable to identify between the target and the sight... The easiest solution is to change the target reticle to blue or white."

**This generalises past `hitFlash`, and it is the biggest open item the band creates.** Hungry Grave has four full-brightness events: `belchFlash`, `hitFlash`, the invincible flash at boss breaks, and the last-chance flicker on a decaying corpse. Every one of them breaks a top band by construction, and the genre's dominant game-feel vocabulary is built on exactly these (Vlambeer's *Art of Screenshake* prescribes full-screen white flashes on hit and explosions that "flash from black to white", section 2.4). Either each flash gets an explicit carve-out in ADR 0014, or the flash vocabulary changes to subtraction. There is a third constraint on them regardless of which way that goes: WCAG SC 2.3.1 caps flashing at three times per second for luminance swings above 10% of maximum, and a shmup with a hit flash, a break flash and a decay flicker can reach that (section 3.1).

### 1.5 dropCore is a brown

`dropCore` `#4a3b12` is HSV hue 43.9 degrees, saturation 0.76, value 0.29. Dark, saturated orange is the definition of brown. It violates the ban and should be replaced.

It is the only violator. `graveGlow` and `drop` at `#ffc84d` share almost the same hue (41.5 degrees) but at value 1.00 they read as gold, not brown, and `corpse` and `feast` at hue 47-48 have saturation 0.10, which is cream. Nothing in the palette is anywhere near the banned purple range; the darks are all blue-navy at hue 217-224.

### 1.6 What the unit test should assert

`palette.ts` declares each colour with its luma and a role, and the test asserts ten things. The first is the one that keeps the file honest over time and the seventh is the one that would have caught `hitFlash` outright.

1. **Declared luma matches the hex.** For every entry, `|entry.luma - luma709(entry.hex)| < 0.05`. Without this the declared number drifts the first time somebody nudges a hex and forgets the number, and every other assertion in this list is then checking a fiction.
2. **Presence.** Every entry tagged `mobFireCore` has `luma >= MOB_FIRE_BAND_MIN`.
3. **Exclusivity.** Every entry not tagged `mobFireCore` has `luma <= FIELD_LUMA_CEILING`.
4. **Margin.** `MOB_FIRE_BAND_MIN - FIELD_LUMA_CEILING >= BAND_MARGIN_MIN`, asserted as its own test so shrinking the margin is a deliberate edit with a failing test attached, not a side effect of moving one constant.
5. **Coverage.** Every mob-fire emitter in the game (trash fire, the Banshee's tear-rings, the clod, the spiral, and every boss pattern) names at least one `mobFireCore` colour. Exclusivity alone is satisfied by a band with nothing in it.
6. **Colour vision.** Assertions 2 and 3 still hold under the protanope and deuteranope luminance estimates in section 5.3. This is thirty lines of pure arithmetic, deterministic, no browser, and it is the only instrument in the set that sees the failure mode described in section 5.
7. **No shared hex.** No non-fire colour equals any mob-fire colour. This is trivially cheap and it is the assertion that names `hitFlash == enemyShot` as a single obvious failure rather than as a band-edge near-miss.
8. **Visible against the sky.** Every `mobFireCore` colour clears **APCA Lc 45** against every background colour it can be drawn over (`night`, `nightSpeckle`, `fieldFrame`, `graveHole`). This is the other half of the problem and the band does not cover it: exclusivity says fire is not confusable with other sprites, it does not say fire is visible at all. Lc 45 is APCA's stated minimum for fine-detail pictograms and small outline icons, which is the category a bullet falls into. Use APCA rather than WCAG here, because the field is near-black and WCAG demonstrably overstates contrast in that region (section 3.3).
9. **Internal contrast.** Every mob-fire sprite declares a core, a body and an outline, and the span from its core's luma to its outline's luma is at least some stated minimum. This is the assertion that makes the sprite readable against a background the band never anticipated, and it is the property Gungeon and Boghog both describe (section 2.3). A sensible starting figure is the same 20 points as the margin, though this one is a judgement call with no number behind it in any source.
10. **Hue exclusivity.** No non-fire colour's hue falls within some stated angle of a mob-fire body hue, and the same exclusion holds between the three classes Cave separates: fire, effects, and pickups. Section 1.3 has the current collision. The angle is a judgement call; nothing in the sources gives one.

The band constants, the CVD weights, and the hue exclusions belong in `palette.ts` next to the colours, not in the test file. A constant that only exists in a test is a constant the renderer cannot honour.

### 1.7 Overlap and compositing, which neither instrument sees

ADR 0014 already says the palette check reads declared colours and the grayscale screenshot reads one instant, so neither can see compositing. Three rules close most of that gap, and they are code rules, not palette rules.

**Mob fire draws at alpha 1.0 with no blend mode.** This has to be forbidden rather than measured, the same way the ADR already forbids additive blending on the storm, because alpha eats the margin fast: a core at luma 90 drawn at alpha 0.90 over `night` composites down to 81.7, which is below an 88 band. Alpha 0.98 already costs 1.7 points.

**The grayscale screenshot check should be a differential, not a histogram.** Take two captures at the same deterministic tick from ADR 0013's autopilot, one rendering the full field and one with the mob-fire layer hidden. Any pixel at or above `MOB_FIRE_BAND_MIN` in the fire-hidden capture is a violation, named by position. This is exact, and it sidesteps the problem that a single-capture histogram cannot avoid: a bright sprite antialiased against a dark background necessarily produces edge pixels inside the forbidden gap, so "no pixel in the gap" can never be asserted and any tolerance chosen for it is arbitrary.

**Convert to grayscale with the same formula the unit test uses.** Section 4.3 has the measured trap: the obvious library call produces a different metric and a different answer.

## 2. Shipped shmup practice

The reservation instinct is well documented. The **luminance** framing is the part with the least support behind it, and two claims this project has been leaning on do not survive the search. Everything below is labelled DOCUMENTED (a named developer said it, quoted, with a link) or ANALYSIS (a critic, fan, or wiki inferred it).

### 2.1 Two claims that do not hold up

**"Ikaruga's polarity is a value opposition."** ADR 0014 carries this as a parenthetical justification. **No statement by Hiroshi Iuchi or anyone at Treasure gives black/white a luminance, contrast, or colourblindness rationale, in either language.** What Iuchi says is that it is a mechanic simplification.

> DOCUMENTED, Hiroshi Iuchi, [shmuplations.com/ikaruga](https://shmuplations.com/ikaruga/): "In order to avoid this and also to simplify things, I reduced the colors for enemies from 3 to 2, and updated it so combos are formed with every three same-colored enemies you kill. This increased the emphasis on aimed shots."

> DOCUMENTED, Masato Maegawa (Treasure president), [shmuplations.com/treasure](https://shmuplations.com/treasure/): "It inherits the color (black and white polarity, this time) and combo system from Radiant Silvergun."

The polarity is a reduction of Radiant Silvergun's red/blue/yellow, chosen for system clarity. The only readability levers Iuchi puts on record anywhere are bullet **speed** and removing things the eye has to check. ZUN, discussing Ikaruga versus Radiant Silvergun in a [4Gamer interview](https://www.4gamer.net/specials/shanghai_alice/zone_z.shtml), reads the monochrome as thematic coherence rather than legibility.

**This does not undermine ADR 0014's rule**, which is independently supported by section 3.1 and by everything in 2.2 below. It undermines only the citation. The rule should stop leaning on Ikaruga, because the strongest thing that can honestly be said is that a value opposition is what Ikaruga happens to have, not what Treasure was reaching for.

**"Enemy bullets should be the brightest thing on screen."** This is folklore. No named developer states it in any form, in any of the sources reached. What the dev-authored record actually says is consistently weaker: bullets must always be **visible**, contrast must be **high**, and bullets must not **share a colour** with other object classes. Nobody claims a luminance monopoly. The nearest documented ancestor is a z-order rule, not a value rule:

> DOCUMENTED, Michael Molinari, [The Anatomy of a Shmup](https://www.gamedeveloper.com/design/the-anatomy-of-a-shmup): "Enemy bullets should always be visible. The bullets shot by enemies should be visible on top of explosions, power-ups, other enemies, etc." and "The contrast between bullets and backgrounds should be high."

### 2.2 What studios actually reserve, and on which axis

**Cave reserves hue, and enforces it in the background art.** This is the strongest material in the pass and it is the closest documented analogue to ADR 0014's rule.

> DOCUMENTED, Hiroyuki Tanaka (Cave background artist, DoDonPachi through Deathsmiles), *Cave Shooting History*, [shmuplations.com/cavestghistory](https://shmuplations.com/cavestghistory/): "The first thing I'm careful to do when designing a map is to make sure that the bullet patterns, which are Cave's games' selling point, are easy to see... **Our games use a lot of pink, blue, and colorful bullet patterns, so I try not to use those colors in the backgrounds. I also avoid using the orange colors of explosions. But if you do that too much the backgrounds become kind of bland, and balancing the colors well is a difficult part of the work.**"

> DOCUMENTED, Akira Wakabayashi (Cave lead designer), Ibara superplay DVD interview, [shmuplations.com/ibara](https://shmuplations.com/ibara/): "**Our basic design premise for the bullets is that they not interfere with the backgrounds. So we use colors that don't appear in the background for bullets and explosions. Medals and other items need to be similarly distinct**, so that you can clearly see them in one glance, we try to use bright and 'happy' colors for those."

Three things fall out of this. The axis is hue, not value. The reservation covers **three** mutually exclusive channels, not two: bullets, explosions, and pickups each get their own. And Tanaka names the price out loud, which is the thing a value band will hit too: hold the reservation absolutely and the environment goes bland.

Cave also confesses failing it, which is how you know it is a hard constraint rather than a preference. Wakabayashi, same book: "But I really worked hard on Muchi Muchi Pork. **There were problems with the bullets being hard to see.**"

**The one Cave statement that touches value points at subtracting the background, not boosting the bullets.**

> DOCUMENTED, Hiroyuki Kimura (producer) and Hideki Nomura (designer), [Famitsu Xbox 360](https://www.famitsu.com/news/201205/02014100.html): Kimura, "I gave Nomura an order like, 'make me bullets you can see from 100 metres away.'" Nomura, "100 metres is an exaggeration, but I made them so the bullets are visible even with the device held at arm's length. **And because the background is black, the bullets read even more sharply.**" Nomura also notes the background is drawn entirely in line-work.

**Riot Games publish an explicit multi-band value system, and it bars the extremes.**

> DOCUMENTED, [Riot VFX Style Guide, 2017](https://nexus.leagueoflegends.com/wp-content/uploads/2017/10/VFX_Styleguide_final_public_hidpjqwx7lqyx0pjj3ss.pdf): "VFX VALUE RANGE GUIDELINES: HIGHER VALUE RANGE DRAWS MORE FOCUS. CONTRAST CAN CREATE A CLEAR AREA OF EFFECT. **AVOID USING 100% OR 0% VALUES, AS IT CAN BE CONFUSED FOR THE GAME ENVIRONMENT OR UI.**" The guide diagrams four separate bands, "UI VALUE RANGE / CHARACTER VALUE RANGE / ENVIRONMENT VALUE RANGE / VFX VALUE RANGE", and repeats the exercise for saturation.

This is the closest thing in the industry to a formal reserved-band system, it is on the value axis, and it is a **middle-high** band rather than the top, on the explicit grounds that pure white and pure black are already spoken for. It is a direct caution against defining the band as "up to 100".

**Returnal reserves hue per threat class, with a reaction-time budget attached.**

> DOCUMENTED, John Hollingworth, Housemarque, [PlayStation Blog](https://blog.playstation.com/2021/05/28/returnal-the-making-of-that-unforgettable-hyperion-fight/): "The colour of projectiles used represent the style of attack. **Green is commonly used for more random, non-direct clusters** (Low reaction response). **Orange is reserved for slower moving non-targeting shapes that consume space** (Medium). **Blue projectiles are for Hyperion's main attacks**, they are often direct and require the player to quickly respond (High)."

Worth noting because Hungry Grave has four distinct mob-fire types. Collapsing all four into one value band spends a channel that a shipped game uses to carry urgency, so the four types need to stay separable by hue and by the ADR's size-and-shape grammar.

### 2.3 The construction that actually makes a bullet win: internal contrast

This is the finding that most directly shapes the recommendation in section 1.3, and it is documented twice.

> DOCUMENTED, Dave Crooks, Dodge Roll (Enter the Gungeon), [Rock Paper Shotgun, 2016](https://www.rockpapershotgun.com/how-enter-the-gungeon-brought-bullet-hell-to-the-dungeon-crawler): "**They're really 90% white and a very dark red halos and a second ring of darker red, almost black, around that**, which is pretty much invisible because the bullets move so fast."

> DOCUMENTED, Boghog (designer, Gunvein), [Boghog's bullet hell shmup 101](https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101): "The world of art provides a very helpful concept when dealing with visibility: **VALUE**... While looking at the values of different bullet sprites, you may notice a pattern: **they put light and dark values side-by-side. The bullets often have very bright elements (the glowing cores) right next to dark elements (borders, sometimes inner circles/lines). This is how you maximise visibility by using values.**" And: "**Low contrast backgrounds that rely primarily on midtones also help with visibility since they let you freely use extreme values for important elements.**"

A bullet built this way reads against a bright background *and* a dark one, so it stops depending on the band holding at all. It also explains why "bullets are the brightest thing on screen" never got said: the operative property is that the bullet contains the extremes, not that it monopolises one of them.

Note that Gungeon's core sits at roughly **luma 90**, which is where section 1.3 puts the band floor, and its outer ring is near-black. The three-part construction (bright core, saturated body, dark outline) is what section 1.3 should specify, not the two-part version.

The same three-part idea appears independently in games accessibility guidance as a background-agnostic technique. Xbox Accessibility Guidelines cite *For Honor*'s double outline for exactly this: "The white outline ensures that the symbols remain visible against dark backgrounds... while the black outline ensures that the symbols remain visible against light backgrounds" (section 3.5).

### 2.4 The band gets broken by your own effects, not by the scenery

Every shipped legibility fix found in this pass spends most of its effort suppressing the **player's own** feedback and the **pickups**, not the background. That converges exactly with the measurement in section 5.1, where all three intruders in Hungry Grave's band today (`skull`, `waste`, `hitFlash`) are player-side.

> DOCUMENTED, danbo (Blue Revolver), [DOUBLE ACTION changelog](https://danboland.net/DA_FINAL_CHANGES.html): the shipped legibility submenu is ClearGold (transparency on score items), ClearShot (transparent player bullets), bullet glow, background brightness percentage, background saturation percentage, Reduce Flash Intensity, and custom bullet colours. Separately, "Score items now draw on a lower layer than most enemies."

Six of those seven knobs subtract from non-threat elements; one adds to bullets.

> DOCUMENTED, danbo, [shmups.system11.org, 2015](https://web.archive.org/web/20230427130525id_/https://shmups.system11.org/viewtopic.php?f=9&t=52710): "**we've already went to the point of having to cheat outside of a very limited palette for the bullet graphics**, it's just something we're always going to have to try to improve somehow" and "I prefer to err on the side of readability when it comes to shmups."

> DOCUMENTED, Yotsubane (Crimzon Clover), [own blog, 2009](http://yotsubane.blog99.fc2.com/blog-entry-6.html): on the feedback that enemy bullets are hard to see, "absolutely right. I know that suppressing the screen effects would easily improve it somewhat, but dropping the flashiness would weaken one of this game's selling points, so I want to find a compromise." His shipped fix, [a month later](http://yotsubane.blog99.fc2.com/blog-entry-12.html), was a five-step effects slider, score-item transparency, and reworked **item draw priority**, not a palette assignment.

> DOCUMENTED, Montoli, Paper Dino Software, [Imperishable Lessons](https://paperdino.com/2009/09/23/imperishable-lessons-what-i-learned-from-touhou/): "**Ideally, powerups should be on their own unique group, with no bullets sharing their color.**"

Two of those developers reached for **draw order** as the cheap fix before touching colour, which is `layering.ts`'s half of ADR 0014 rather than `palette.ts`'s.

**And the counter-evidence, which the band has to answer for.** The dominant game-feel vocabulary in the genre would break a reserved value band on every single kill:

> DOCUMENTED, Jan Willem Nijman, Vlambeer, [The Art of Screenshake](https://www.youtube.com/watch?v=AJdEqssNZ-U): projectile legibility solved with size and speed ("bullets in video games should be at least like the size of your chest"), while simultaneously prescribing full-screen white flashes on hit and explosions that "flash from black to white."

Hungry Grave has `belchFlash`, `hitFlash`, the invincible flash at boss breaks, and the last-chance flicker. Every one of those is a full-brightness event. The band needs an explicit position on them, and section 1.4 argues for taking value away rather than adding it.

### 2.5 Dimming the background: documented, and shipped as a player setting

> DOCUMENTED, Nathan Fouts, Mommy's Best Games (Shoot 1UP), [dev blog, 2010](http://mommysbest.blogspot.com/2010/08/accessibility-options-ideas.html): "**Especially in a shoot 'em up, it's important to see the dangers. Shoot 1UP offered an option to lower the background contrast or turn it off.**"

> DOCUMENTED, id Software / Bethesda, [DOOM: The Dark Ages accessibility guide](https://slayersclub.bethesda.net/en-EU/article/doom-the-dark-ages-accessibility-guide): "**World Desaturation:** This setting enables high contrast mode and makes the world background color more muted. When set between 10% and 100%, a desaturation effect is applied to the world and color highlights can be adjusted for various enemies and objects."

> DOCUMENTED, Harry Krueger, Housemarque, [Resogun postmortem](https://www.gamedeveloper.com/business/the-game-is-the-boss-a-i-resogun-i-postmortem): "We weren't happy with the bright, more colorful tone we initially targeted, as it lacked a certain 'edge' and **made gameplay difficult to read**. So we eventually shifted to a darker tone... **a clear contrast between bright gameplay and dark background elements, which directly helped the game's readability.**"

> DOCUMENTED, Gwenaël Massé, Motion Twin, [Dead Cells art deep dive](https://www.gamedeveloper.com/production/art-design-deep-dive-giving-back-colors-to-cryptic-worlds-in-i-dead-cells-i-): "**the background of the levels and the collisions have to contrast as much as possible, while the colors used to design the background have to fade into each other, creating no discernible rupture**" and "**The enemies, their projectiles and any spells they may eventually cast are treated with high levels of saturation, contrast and brightness so the immediate danger is quickly identifiable.**"

Dead Cells is the closest shipped analogue to what section 1.3 proposes, with one important difference: the threat tier is separated on **three axes at once** (saturation, contrast, brightness), and the background is compressed into a no-rupture band rather than the threats being granted a monopoly. ADR 0014's deferred storm-opacity setting has good company here; DOOM and Blue Revolver both ship the equivalent as a continuous slider.

**One process note worth adopting.** Dodge Roll deleted a finished level theme rather than tune around it: RPS, reporting Crooks, "Dungeon floors are almost uniformly very dark so they show up (**a level set in heaven was scrapped because bullets simply didn't read well enough against it**)." Riot clamp materials at authoring time rather than in post. The band belongs in asset review, which is exactly what putting it in `palette.ts` with a unit test achieves.

### 2.6 The one shipped palette that can be measured

ZeroRanger's palettes are published, so its band can be computed rather than asserted. Converted to this document's metric, the GREEN ORANGE palette's backgrounds top out at **luma 51.3**, and its bullet-bright elements sit at **64.0**, **79.9** and **100.0**. That is a real top band with a **12.7-point** gap at its narrowest, which makes the 20-point margin recommended in section 1.3 more conservative than the one shipped example available to measure.

Two honest qualifications. The palette's two dim warm steps land at 36.6 and 51.4, inside the background range, so separation at the dim end of ZeroRanger is hue-only, not value. And the restricted palette was not a readability decision in the first place:

> DOCUMENTED, System Erasure, [Electric Underground interview](https://www.youtube.com/watch?v=p6Q6NxvNeHA): "**that was probably just an accident**... I drew the initial sprites in about 15 minutes... **There was not much consideration used. Although we have tweaked that palette just a little bit to make it somewhat more readable over the years.**"

Their retrofit is instructive on its own terms: it was done globally with a post-process shader rather than by reauthoring assets, and the confusion that forced it was **bullets versus pickups**, not bullets versus background. "The hard mode warranted making the bullets way way more clear because there's a lot of them, and also there's a pick up item... Those lessons learned in hard mode became global changes for the normal mode as well." Author the rule against the densest pattern the game will ever contain, which is what ADR 0014's density clause already says.

### 2.7 Touhou, and a warning about encoding function into bullet art

ZUN is the one developer on record who **refused** to spend bullet appearance on legibility.

> DOCUMENTED, ZUN, own BBS, March 2003 (log archived, [discussion](https://hupelyotfront.hatenablog.com/entry/2026/01/24/172155)): "It's easy to imagine that attaching a hitbox display to enemy bullets would do fatal damage to the enemy bullets' appearance. **Since I think the appearance of enemy bullets is one of the most important factors in danmaku**, it doesn't look like something I could easily implement."

He does, however, encode behaviour class into bullet appearance:

> DOCUMENTED, ZUN, [4Gamer](https://www.4gamer.net/specials/shanghai_alice/zone_t.shtml): "White bullets get this angle, bigger bullets are randomised within a narrower angle, and so on. Uncancellable bullets have a narrower random spread."

Relevant because Hungry Grave's belch cancels mob fire (ADR 0008). If some fire is ever made uncancellable, Touhou's convention says that difference belongs in the sprite, and the value band is already spoken for.

### 2.8 Claims to stop repeating

Each of these was searched for and could not be traced to any primary source. They are listed because they circulate and because two of them have been informing this project.

1. **"Ikaruga's black/white is a luminance opposition rather than a hue one."** Never stated by Treasure. Section 2.1.
2. **"Enemy bullets should be the brightest thing on screen."** Folklore. No developer says it. Section 2.1.
3. **"The bright core of a Cave bullet is its hitbox."** Fan belief, no developer statement and no code evidence.
4. **"Cave's Black Label editions darken backgrounds for bullet visibility."** Traces to a 2010 article, not to Cave.
5. **"NieR: Automata's hacking minigame is desaturated for bullet readability."** Contradicted by its own designer. Hisayoshi Kijima, PlatinumGames, [official blog](https://www.platinumgames.com/official-blog/article/9624): the beige came from a Yoko Taro mandate, and "**It took a lot of hard work to find and maintain a readable color scheme among all the soft, low-contrast beiges.** My original color scheme had much higher contrast than the final design." Readability was clawed back against the palette, not delivered by it. This is the cautionary version of the rule, not a precedent for it.
6. **"ZeroRanger's restricted palette is a deliberate readability decision."** Contradicted by the developers. Section 2.6.
7. **"Superhot's black-and-white world was chosen so red enemies pop."** Widely asserted, not found on record.
8. **The Valve quote "We tended to desaturate the world around the characters to make sure that they popped off the background."** Not present in the [NPAR 2007 paper](https://cdn.akamai.steamstatic.com/apps/valve/2007/NPAR07_IllustrativeRenderingInTeamFortress2.pdf) or the GDC 2008 deck; both were checked in full. What the paper does say is relevant anyway: "**high frequency geometric and texture detail found in photorealistic games can often overpower the ability of designers to compose game environments and emphasize gameplay features visually using intentional design choices such as changes in color value.**" If the background is noisy, no luminance band is safe wherever it is drawn. Spatial frequency is a prerequisite, not an optional extra.

## 3. Accessibility standards

The short version: **the standards support the value-not-hue rule strongly and explicitly, and they support the specific numbers weakly or not at all.** WCAG says in as many words that luminance contrast is the channel that survives colour vision deficiency, and it is the reason its own contrast maths ignores hue. What no standard provides is a threshold calibrated for a small moving sprite. Section 3.5 says plainly where the numbers are being stretched.

### 3.1 WCAG 2.2 says to distinguish by value, and names the exception this game is standing in

The single most on-point passage in the whole standards pass is in [Understanding SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), explaining why the contrast formula has no hue term:

> "For people with color vision deficiency who are not able to distinguish certain shades of color, hue and saturation have minimal or no effect on legibility as assessed by reading performance. Further, the inability to distinguish certain shades of color does not negatively affect light-dark contrast perception. Therefore, in the recommendation, contrast is calculated in such a way that color (hue) is not a key factor."

That is ADR 0014's premise, stated by the standard rather than inferred. [Understanding SC 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) adds the operational form, and it is the only place any standard puts a number on "distinguish by value as well as hue":

> "If content is conveyed through the use of colors that differ not only in their hue, but that also have a significant difference in lightness, then this counts as an additional visual distinction, as long as the difference in relative luminance between the colors leads to a contrast ratio of 3:1 or greater."

And then, in the same Understanding 1.4.3 document, WCAG names the exception:

> "Fortunately, most of the luminance contribution is from the mid and long wave receptors which largely overlap in their spectral responses. The result is that effective luminance contrast can generally be computed without regard to specific color deficiency, **except for the use of predominantly long wavelength colors against darker colors (generally appearing black) for those who have protanopia. (We provide an advisory technique on avoiding red on black for that reason.)**"

Saturated red mob fire on a night field is exactly and only the case WCAG excepts from its own claim. **The promised advisory technique does not exist.** The full WCAG 2.2 techniques index carries 432 techniques and none of them is about red on black; the words "protan", "red on black" and "long wavelength" appear nowhere in it. The standard flags the hazard this game is built on and then ships no mitigation for it, which is why sections 3.4 and 5.3 do the work themselves.

The formulas, for the record. Relative luminance, from the WCAG 2.2 definitions, is `L = 0.2126 * R + 0.7152 * G + 0.0722 * B` where each channel is linearized as `c/12.92` if `c <= 0.04045` else `((c+0.055)/1.055) ^ 2.4`. Note 2 settles the recurring `0.03928` question outright: "Before May 2021 the value of 0.04045 in the definition was different (0.03928). It was taken from an older version of the specification and has been updated. It has no practical effect on the calculations." Contrast ratio is `(L1 + 0.05) / (L2 + 0.05)`, lighter over darker, ranging 1:1 to 21:1, and both Understanding documents state the thresholds are not rounded: "2.999:1 would not meet the 3:1 threshold".

The thresholds themselves: **1.4.3** is 4.5:1 for text, 3:1 for large text. **1.4.11 Non-text Contrast** is 3:1 for "Graphical Objects: Parts of graphics required to understand the content", which is the criterion a bullet would fall under, with an Essential exception "when a particular presentation of graphics is essential to the information being conveyed". **1.4.1 Use of Color** is "Color is not used as the only visual means of conveying information".

Two things WCAG does not do. It does not exempt games: the word appears **once** in the entire 2.2 specification, in SC 1.4.10 Reflow, and never in a contrast context. And the Essential exception does not cover art direction. Understanding 1.4.11 enumerates logos, flags, photographs of real scenes, screenshots, medical diagrams and heatmaps, and is explicit that an author's preference does not qualify: where low contrast "was an author choice rather than being mandated by corporate identity or brand guidelines, then that particular low contrast presentation is not 'essential'." "It is a night graveyard and it is meant to be dark" is not an exception WCAG recognises.

One more that a shmup should know about, since ADR 0014's field involves flashes: **SC 2.3.1 Three Flashes (Level A)**, "Web pages do not contain anything that flashes more than three times in any one second period", where a general flash is "a pair of opposing changes in relative luminance of 10% or more of the maximum relative luminance" below 0.80, over an area larger than 0.006 steradians. That is a hard constraint on the hit flash, the invincible flash at boss breaks, and the last-chance flicker, and it is out of scope for this document.

### 3.2 APCA is not WCAG 3, and WCAG 3 has no contrast algorithm yet

Worth stating clearly because it is widely misreported. The current [WCAG 3.0 Working Draft (03 March 2026)](https://www.w3.org/TR/wcag-3.0/) mentions APCA **zero times**, and its glossary entry for "contrast ratio test" carries the status *Exploratory* with an editor's note: "**The contrast algorithm used in WCAG 3 is yet to be determined.**" Every contrast requirement in the draft defers to that undetermined test.

APCA's own documentation describes itself as "the candidate contrast method for the future WCAG 3, and is also developing as the APCA Readability Criterion, an independent standard". Treat it as a well-specified independent standard that is a candidate, not as a W3C recommendation. Licensing matters if any of it is transcribed: the main SAPC-APCA repository is "Beta Non-Com", and only the [`apca-w3`](https://github.com/Myndex/apca-w3) distribution is W3-licensed.

Also worth noting for the hue-not-value question: WCAG 3's draft "Hue not relied on" requirement carries an exception WCAG 2 does not have, "Content is artistic or expressive". That would cover a game, but the requirement is only *Developing* and the exception is about hue reliance, not about contrast.

### 3.3 The APCA constants, and why it is the right model on a near-black field

From [`apca-w3`](https://github.com/Myndex/apca-w3) `src/apca-w3.js`, constant set **0.0.98G-4g**, Beta 0.1.9 W3:

```
mainTRC 2.4                                     // no piecewise knee, unlike WCAG
sRco 0.2126729  sGco 0.7151522  sBco 0.0721750
normBG 0.56  normTXT 0.57  revTXT 0.62  revBG 0.65
blkThrs 0.022  blkClmp 1.414
scaleBoW 1.14  scaleWoB 1.14  loBoWoffset 0.027  loWoBoffset 0.027
deltaYmin 0.0005  loClip 0.1
```

Two structural differences from WCAG matter here. There is no linear segment near black: APCA raises `channel/255` straight to 2.4. And the output is **signed**, so light-on-dark returns a negative Lc and polarity is part of the answer. Black on white computes to Lc 106.0 and white on black to Lc -107.9; the implementation used for this document reproduces both.

The relevant thresholds, from [APCA in a Nutshell](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell). The last two are the ones that apply to sprites rather than text:

> "**Lc 45** The minimum for larger, heavier text (36px normal weight or 24px bold) such as headlines... This is also the minimum for pictograms with fine details, or smaller outline icons."
> "**Lc 30** The absolute minimum for any text not listed above... This is also the minimum for large/solid semantic and understandable non-text elements such as 'mostly solid' icons or pictograms. Generally no less than 5.5px solid in its smallest dimension."
> "**Lc 15** The absolute minimum for any non-semantic non-text that needs to be discernible... Designers should treat anything below this level as invisible, as it will not be visible for many users."

APCA is also the only standard in this pass that acknowledges size at all: "design flexibility is achieved by relaxing contrast for large non-text elements which do not need brute-force contrast levels, due to their larger size (i.e. lower spatial frequencies use lower contrasts)."

**Why APCA rather than WCAG for this game.** On a near-black field the two models disagree sharply, and WCAG is the one that is wrong. Measured against the `night` background `#0e1119`:

| colour | WCAG | APCA Lc |
| --- | --- | --- |
| `enemyShot` `#ff4a3d` | 5.66:1 | 41.8 |
| `enemyClod` `#f5563d` | 5.64:1 | 41.4 |
| `enemyTear` `#ff6a55` | 6.69:1 | 47.9 |
| `enemySpiral` `#ff8248` | 7.67:1 | 53.7 |
| a candidate core `#ffece6` | 16.53:1 | 97.4 |

WCAG scores all four current fire colours as comfortably passing AA for body text. APCA puts two of them below its fine-detail minimum. Pure red on pure black is the cleanest demonstration: WCAG 5.25:1, a comfortable AA pass, against APCA Lc 37.5, below even the pictogram floor. That is the failure mode WCAG's own 1.4.3 rationale warns about for protanopes, scored as a pass by WCAG's own formula.

### 3.4 Colour vision deficiency: prevalence, and the protanope correction

**Prevalence.** Birch J., ["Worldwide prevalence of red-green color deficiency", J Opt Soc Am A 2012;29(3):313-320](https://doi.org/10.1364/JOSAA.29.000313): "the prevalence of deficiency in European Caucasians is about 8% in men and about 0.4% in women and between 4% and 6.5% in men of Chinese and Japanese ethnicity." Note 0.4%, not the widely repeated 0.5%, and note that **Birch carries no per-type breakdown**, so it cannot be cited for one. The per-type table in [Webvision, "The Perception of Color", Table 1](https://www.ncbi.nlm.nih.gov/books/NBK11538/table/ch28kallcolor.T1/) gives protanomaly 1%, deuteranomaly 5%, protanopia 1%, deuteranopia 1.5%, tritanopia 0.008% for males, but states outright that it is "modified after" Cole, Pease and Wright, so it is a compilation, not a survey. Treat the split as approximate. The commonly circulated precise figures (4.63% deuteranomaly, 1.08% protanomaly and so on) could not be traced to any primary survey at all.

**The correction that matters.** The reduced-red-sensitivity effect is **protanope-only**, and protans are the smaller group. Judd D.B., ["Standard response functions for protanopic and deuteranopic vision", NBS RP1618, 1944](https://nvlpubs.nist.gov/nistpubs/jres/33/jresv33n6p407_A1b.pdf), poses the question directly and answers it:

> "an average protanope finds the spectrum from 700 to 770 mµ to have less than 10 percent of the normal luminosity... It is more convenient to say that the luminosity function of the average protanope is shifted about 10 mµ toward the short-wave end of the spectrum relative to normal."

> "the deuteranopic and deuteranomalous observers alike possess luminosity functions generally well within normal limits; but both protanomalous observers and protanopic observers possess luminosity functions that are abnormally low at the long-wave end."

Hecht S. and Hsia Y., ["Colorblind vision; luminosity losses in the spectrum for dichromats", J Gen Physiol 1947;31(2):141-152](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2147092/), measured it psychophysically: "in the red the threshold is more than ten times as high as normal" for protanopes, while "deuteranopes do not show so high an elevation, their maximum in the green being only about 70 per cent above normal."

Computed from the CVRL cone fundamentals and the CIE 1924 luminous efficiency data, the peak shift is 555 nm to **543 nm** for protanopes and to 570 nm for deuteranopes. Protanopic luminance relative to normal is 0.504x at 600 nm, 0.223x at 630 nm, 0.140x at 650 nm. Deuteranopes stay within 0.2 log units of normal across the whole spectrum and are marginally **more** sensitive in the red.

So the design rule has to be stated carefully. "Colourblind players see red as darker" is wrong, and wrong for the larger group. **Protanopes see saturated red as substantially darker; deuteranopes do not.** Roughly 2% of males are protan against roughly 6.5% deutan. That does not weaken the conclusion, because a band has to hold for every player, and it is the protan case that breaks it.

The method used in section 5.3 falls straight out of this literature rather than being improvised: Stockman and Sharpe measured M-cone sensitivities **in protanopes** and L-cone sensitivities **in deuteranopes**, so protanopic luminous efficiency simply *is* the M-cone fundamental. Deleting the L cone and re-weighting is the mechanism, not an analogy for it.

### 3.5 Games guidance, and the hole in it

**Xbox Accessibility Guidelines** are the only source anywhere with a number attached to a gameplay object rather than to text. [XAG 102: Contrast](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102) scopes itself with "Key gameplay elements against their background (for example, targeting icons are gray and should be discerned against a generally dark game environment background)", which is close to this game's exact problem, and then:

> "Standard-sized text and visual elements (those that aren't considered large-scale) that provide important information or context for gameplay should have a contrast ratio of at least 4.5:1 against their background."
> "Large-scale text and large-scale visual elements should meet a minimum contrast of 3:1 against their background."

Two of its bullets bear directly on the recommendation in section 1.3, and this is the documented support for the core-plus-body structure:

> "When text is displayed over a non-solid color background, the text contrast ratio should be measured between the text and the lowest contrasting area of the background."
> "**Outlining characters or other key gameplay elements is helpful for increasing the contrast ratio of the elements against their background.** The color used for the outline should also be configurable or provide a strong contrast against all backgrounds they appear against by default."

XAG cites *For Honor*'s double outline for the same reason: "The white outline ensures that the symbols remain visible against dark backgrounds... while the black outline ensures that the symbols remain visible against light backgrounds." That is the same idea as a bright core inside a reserved band, arrived at independently by a shipping studio. XAG 103 carries the colour rule: "Color alone should never be used to represent information", requiring "at least one additional signifier such as shape, pattern, iconography, or text labels", which is ADR 0014's size-and-shape grammar. Microsoft is explicit that the XAGs "aren't intended to act as a checklist to validate any type of compliance".

**[Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/)** carry one number and it is scoped to text: "a foreground/background contrast ratio of at least 4.5:1", under "Provide high contrast between text/UI and background" (Vision, Basic). Its colour guideline is "Ensure no essential information is conveyed by a fixed colour alone" (Vision, Basic), where *fixed* is load-bearing, since the guideline accepts colour reliance if the colour is configurable. It notes the protan effect in passing: "Some colours also appear darker than without colour deficiency (most commonly red) so check using a simulator for foreground/background contrast too." **There is no guideline on the site about hazards, enemies, or projectiles being distinguishable from the background.** That was checked across all six categories and all three tiers.

**AbleGamers** publish no contrast ratios at all. [Includification](https://accessible.games/wp-content/uploads/2018/11/AbleGamers_Includification.pdf) scores "Game presented in high contrast" with no definition and a cross-reference to a section that does not exist in the document. What it does provide is the single most useful unmeasured test anyone in games offers, and it is precisely ADR 0014's grayscale check:

> "Would you be able to play your game if it were played on a black and white display?"

Its reticle guidance is also a direct precedent for the `hitFlash` problem: "In situations where both the enemy and reticle are red, the user is unable to identify between the target and the sight... The easiest solution is to change the target reticle to blue or white."

**What does not exist.** IGDA GASIG repeats WCAG's 4.5:1 and 3:1, scoped to text. The CVAA does not apply: the [FCC's own guidance](https://www.fcc.gov/consumers/guides/accessibility-communications-video-games) says "These rules do not cover non-communications aspects of video games", so anyone citing it for a contrast number is wrong. EA publishes no guidelines but ships [Fonttik](https://github.com/electronicarts/fonttik), which is OCR-driven and text-only and cannot check a sprite, though notably it does run protanopia, deuteranopia, tritanopia and greyscale simulation over its checks. Sony, Nintendo and Ubisoft publish no comparable numbers.

**The honest summary:** exactly one sentence in the entire accessibility field puts a number on a gameplay object, and it is XAG 102's 4.5:1. It is also *stricter* than WCAG 1.4.11's 3:1 for graphical objects, and neither body explains the discrepancy. Four of the five games bodies checked have nothing testable to say about whether a player can see a bullet coming.

### 3.6 Where these standards are being stretched

Flagged plainly, because the numbers in section 1.3 lean on them.

**The maths has no size term and no motion term.** `(L1+0.05)/(L2+0.05)` takes two colours and nothing else, so a 2px bullet and a full-screen panel in the same two colours score identically. APCA is the only standard that says out loud that this is wrong, which is why its non-text guidance is banded by size with an explicit floor of "no less than 5.5px solid in its smallest dimension".

**"Adjacent colour" is undefined for a scrolling field.** WCAG's testing procedure assumes you can name the colour next to the thing. For a sprite crossing a parallax background it changes every frame. Microsoft's "measure against the lowest contrasting area of the background" is the only stated convention and it is given for text over a non-solid background, not for a moving object.

**4.5:1 was derived for reading.** Understanding 1.4.3 derives it as 3:1 (the ANSI legibility floor) times 1.5 (contrast sensitivity loss at 20/40 acuity), "as assessed by reading performance". Detecting a moving hazard in peripheral vision is a different visual task and no standard in this pass has measured its threshold.

**None of this is calibrated for telling two foreground objects apart.** Every threshold above, WCAG's and APCA's alike, is foreground-against-background. The reserved band is a *sprite versus sprite* rule, and no standard addresses it. The APCA figure quoted for the 20-point margin in section 1.3 is therefore an analogy, not a compliance claim, and it is the thinnest-evidence number in this document.

## 4. Which luminance metric, and why

The working reasoning going into this pass was that the band must be expressed in whatever a grayscale screenshot actually produces, because ADR 0014 pairs a unit test on declared colours with a grayscale screenshot, and if the two use different metrics they can disagree. The claim to test was that this means Rec.709 luma on gamma-encoded sRGB rather than linear relative luminance.

**The working reasoning is correct.** It is correct for a more specific reason than the original argument gave, and the specific reason matters, because two of the obvious ways to implement the grayscale check would silently get it wrong.

### 4.1 What the spec says

The W3C [Filter Effects Module Level 1](https://www.w3.org/TR/filter-effects-1/) defines the CSS `grayscale()` shorthand in section 13.1.1 as an exact `feColorMatrix`:

```
<filter id="grayscale">
  <feColorMatrix type="matrix" values="
    (0.2126 + 0.7874 * [1 - amount]) (0.7152 - 0.7152 * [1 - amount]) (0.0722 - 0.0722 * [1 - amount]) 0 0
    (0.2126 - 0.2126 * [1 - amount]) (0.7152 + 0.2848 * [1 - amount]) (0.0722 - 0.0722 * [1 - amount]) 0 0
    (0.2126 - 0.2126 * [1 - amount]) (0.7152 - 0.7152 * [1 - amount]) (0.0722 + 0.9278 * [1 - amount]) 0 0
    0 0 0 1 0"/>
</filter>
```

At `amount = 1` every row becomes `0.2126 0.7152 0.0722`, the Rec.709 luminance coefficients exactly, not the rounded `0.213 0.715 0.072` that the `saturate` primitive uses in the same spec.

The colour space is settled by two normative statements in the same document. In the `filter` property section: "color-interpolation-filters has no affect for Filter Functions. **Filter Functions must operate in the sRGB color space.**" And in section 10, as a note: "The color-interpolation-filters property has no affect on Filter Functions, which operate in the sRGB color space."

That is the whole answer. `grayscale()` applies Rec.709 coefficients to gamma-encoded sRGB values. It is not a photometric quantity and it is not a perceptual one; it is a video-engineering shortcut. But it is the quantity the screenshot will contain, so it is the quantity the unit test has to use.

### 4.2 What Chromium actually produces

Specs and implementations diverge, so this was measured rather than trusted. All 27 palette colours were rendered as solid swatches under `filter: grayscale(1)`, screenshotted in headless Chromium, and the pixels decoded.

**All 27 matched `round(0.2126*R + 0.7152*G + 0.0722*B)` exactly, byte for byte.** Verified on both the system Chrome and the Playwright-bundled Chromium build, and with and without `--force-color-profile=srgb`. Verified again on a 2D canvas and on a WebGL canvas, which is the path Pixi actually renders through: `#ff4a3d` reads 112 in every case, and `112/255*100 = 43.9`, matching the computed 43.74 to within the rounding.

One practical note for whoever builds the check: a WebGL canvas screenshots as black under old headless with `--disable-gpu`. Use `--headless=new` with a software rasterizer available. `preserveDrawingBuffer` made no difference in either direction.

### 4.3 Two ways to get this wrong

Both of these are things a reasonable engineer would reach for, and both silently produce a different band.

**An SVG `feColorMatrix` defaults to linearRGB.** `color-interpolation-filters` has initial value `linearRGB` for filter primitives, and the spec calls this out explicitly: "in the default case, filter effects operations occur in the linearRGB color space, whereas all other color interpolations occur by default in the sRGB color space." Measured in Chromium, `<feColorMatrix type="saturate" values="0"/>` left at its default renders `#ff4a3d` as **141**, where CSS `grayscale(1)` renders it as **112**. Adding `color-interpolation-filters="sRGB"` to the filter element brings it back to 112. That is an 11-point divergence on the exact colour at the band's edge, from a change most people would consider cosmetic.

Separately, and worth knowing before anyone builds tooling on it: hand-written `feColorMatrix type="matrix"` filters applied to HTML content behaved **unreliably** in headless Chromium during this pass, rendering either as pass-through or as solid black depending on document structure, while the same matrix expressed as `type="saturate"` and the CSS `grayscale()` shorthand both worked correctly every time. This was reproduced on two Chromium builds. The cause was not chased down because the conclusion does not depend on it: use the CSS shorthand.

**Pillow's `convert("L")` is BT.601, not Rec.709.** The [Pillow documentation](https://pillow.readthedocs.io/en/stable/reference/Image.html) states the conversion as `L = R * 299/1000 + G * 587/1000 + B * 114/1000`, the ITU-R 601-2 luma transform. This is not a rounding difference. It changes the band and it changes who is in it, as section 4.4 shows.

### 4.4 The same palette under four metrics

The mob-fire band, and the non-fire colours that fall inside it, computed four ways over the same 27 hexes:

| metric | mob-fire band | non-fire colours inside it |
| --- | --- | --- |
| **Rec.709 luma on gamma-encoded sRGB** (`filter: grayscale(1)`) | 43.7 to 59.8 | `hitFlash` 43.7, `waste` 55.0, `skull` 57.8 |
| BT.601 luma (Pillow `convert("L")`) | 49.7 to 63.0 | `hitFlash` 49.7, `waste` 54.2, `skull` 57.4, **`enemy` 61.2, `wisp` 61.7** |
| WCAG relative luminance (linear) | 26.4 to 37.7 | `waste` 26.4, `hitFlash` 26.5, `skull` 29.5, **`stone` 36.4, `graveRim` 37.5** |
| CIE L\* | 58.4 to 67.8 | `waste` 58.4, `hitFlash` 58.5, `skull` 61.2, **`stone` 66.9, `graveRim` 67.7** |

Three violators under the correct metric, five under each of the two obvious wrong ones, and the extra two are different colours in each case. The argument for pinning the metric is not pedantry; picking the wrong one puts two innocent colours on the fix list and, worse, would let a genuinely colliding colour pass on a future palette edit.

### 4.5 Why not express the rule as a contrast ratio

WCAG contrast ratio is the wrong instrument for this rule, and the reason is worth stating because reaching for `3:1` is the obvious move.

Contrast ratio is a ratio of linear luminances with a 0.05 flare term, so the same perceptual distance yields wildly different ratios depending on where on the scale it sits, and it does not order colours the same way a grayscale screenshot does. Two measured examples from this palette: `enemyShot` and `bansheeDark` are 1.3 luma points apart and score **1.50:1**, while `enemySpiral` and `stone` are 4.0 luma points apart and score **1.03:1**. The pair that is three times further apart in the metric the screenshot reads scores as one third of the contrast.

APCA does order them the way the screenshot does, which is one more reason to prefer it as the sanity check. The same three pairs in APCA: `enemyShot` versus `bansheeDark` is Lc 14.4, and `enemySpiral` versus `stone` and `enemyTear` versus `skull` and `enemyTear` versus `waste` are all **Lc 0.0**. Not "low", zero, because APCA clips below its `loClip` threshold. By APCA's model three of the current fire-versus-non-fire pairs are indistinguishable in lightness, which is a far sharper statement of the problem than "4.4 luma points apart".

For scale on the other side, at a band floor of luma 76 a WCAG ratio of 3:1 would require every other colour on the field to sit at or below luma 41.7, and 4.5:1 would require luma 31.5. Those are enormous separations, and the reason is that WCAG's thresholds were set for static text against a background, not for a moving sprite against a field. Report the equivalent ratio as context if it is useful; do not make it the rule. The recommended 88/68 band is 1.70:1 in WCAG and Lc 26.0 in APCA.

## 5. The current palette, measured

### 5.1 The band as this pass found it

**Historical, and written in the prototype names of the time.** `enemyShot`, `enemyClod`, `enemyTear`, `enemySpiral`, `waste`, `hitFlash` and `stone` are all retired terms. 7.3 holds the current palette, where `stone` is `territory` and the claimed ground it once painted is `territoryGround`.

The four mob-fire colours are `enemyShot` `#ff4a3d` (43.74), `enemyClod` `#f5563d` (46.27), `enemyTear` `#ff6a55` (53.40), `enemySpiral` `#ff8248` (59.76). The band is **43.7 to 59.8** and three non-fire colours are inside it: `skull` 57.78 (a player weapon line), `waste` 54.99 (wasted belch charge), and `hitFlash` 43.74, which is the identical hex to `enemyShot`. These reproduce the measurements this pass was given, to two decimals.

The margins at the edges are the real story. Below the band, `bansheeDark` sits 1.3 points clear. Above it, `stone` sits 4.0 points clear. The full palette sorted by luma:

```
  2.33  graveHole       #04060b
  6.64  night           #0e1119
 13.99  nightSpeckle    #1d2434
 16.56  undertakerDark  #232b38
 19.84  fieldFrame      #2a3348
 23.23  dropCore        #4a3b12
 24.25  enemyDark       #1d4a26
 41.39  undertaker      #5d6b80
 42.41  bansheeDark     #3f7a68     <- 1.3 below the band
 43.74  enemyShot       #ff4a3d     <- FIRE
 43.74  hitFlash        #ff4a3d     <- identical hex
 46.27  enemyClod       #f5563d     <- FIRE
 53.40  enemyTear       #ff6a55     <- FIRE
 54.99  waste           #7f9184     <- inside the band
 57.78  skull           #8496a6     <- inside the band
 59.76  enemySpiral     #ff8248     <- FIRE
 63.73  stone           #9aa4ad     <- 4.0 above the band
 64.45  graveRim        #93a7bd
 64.76  wisp            #63b8ad
 66.63  enemy           #59c964
 73.94  bellRing        #aebfcf
 79.53  drop            #ffc84d
 79.53  graveGlow       #ffc84d
 89.21  banshee         #c9ecdd
 89.32  corpse          #e9e4d2
 94.75  feast           #f7f2de
 95.11  belchFlash      #fff3c9
```

Eight non-fire colours sit within five luma points of one of the two band edges. That is the case against a middle band stated as a measurement: the band is in the busiest part of the range, and every future colour has to thread it from whichever side it approaches.

### 5.2 The hue audit

Hue, HSV saturation and HSV value for all 27, checking the brown and purple bans. One violator, `dropCore`, covered in section 1.5. Nothing sits in the banned purple range at any saturation; the darks are blue-navy (hue 217 to 224) and nothing else is between hue 165 and 208.

### 5.3 How the band moves for a colourblind player

This is the finding that changed the recommendation, so the method and its limits are stated before the numbers.

**The method, and a correction.** The first attempt used the Viénot, Brettel and Mollon (1999) dichromat simulation and measured the luma of its output. That is wrong and the numbers it produced should not be used. The simulation projects onto a plane in LMS space to show a normal observer which colours a dichromat confuses; it does not preserve luminance, and its output luma is not a lightness estimate. Sanity check that caught it: the simulation makes pure red `#ff0000` *lighter* (luma 21.3 to 34.6 for protanopia), where the documented direction is that long-wavelength light appears markedly **darker** to a protanope.

The estimate used instead is simpler and it falls out of the literature rather than being improvised. A protanope has no L cone, so luminance is carried by M alone; a deuteranope has no M cone, so it is carried by L. That is not an analogy: Stockman and Sharpe measured the M-cone fundamental **in protanopes** and the L-cone fundamental **in deuteranopes**, so protanopic luminous efficiency simply *is* the M cone (section 3.4). Taking the M and L rows of the Viénot RGB-to-LMS matrix and normalising them gives luminance weights in linear RGB:

```
normal observer  (Rec.709)   0.2126  0.7152  0.0722
protanope        (M only)    0.1002  0.7876  0.1122
deuteranope      (L only)    0.2729  0.6642  0.0629
```

Red's weight roughly halves for a protanope, from 0.2126 to 0.1002. Sanity check: pure red drops from equivalent-grey 49.8 to 35.0. That is the documented direction and roughly the documented magnitude. Judd measured protanopic luminosity at "less than 10 percent of the normal" from 700 to 770 nm, Hecht and Hsia found the red threshold "more than ten times as high as normal", and the CVRL cone data puts protanopic luminance at 0.223x normal at 630 nm (section 3.4). An sRGB red primary is broadband rather than monochromatic, so a smaller drop than the spectral figures is expected. This is an estimate, not a measurement of perception, and it should be read for its ordering and its rough size rather than its decimals.

**Deuteranopes are not affected and the table below shows it.** The measured deuteranope column moves the *other* way, by a few points, which matches Judd's finding that deuteranopic luminosity functions are "generally well within normal limits" and Hecht and Hsia's that deuteranopes show far less elevation than protanopes. The rule this supports is narrower than the one usually stated: **protanopes see saturated red as substantially darker; deuteranopes do not**, and deutans are roughly three times the more common group. That does not weaken the case, because the band has to hold for every player and it is the protan case that breaks it. It does mean the rule should never be written down as "colourblind players see red as darker", which is wrong for most of them.

**The result.** Every value below is on a single consistent scale (linear luminance under the given weights, re-encoded to sRGB, as a percentage), so the columns are comparable to each other but not to the luma figures elsewhere in this document.

| colour | normal | protanope shift | deuteranope shift |
| --- | --- | --- | --- |
| `enemyShot` / `hitFlash` `#ff4a3d` | 55.2 | **-11.6** | +5.1 |
| `enemyClod` `#f5563d` | 55.1 | **-10.1** | +4.5 |
| `enemyTear` `#ff6a55` | 60.3 | **-9.3** | +4.2 |
| `enemySpiral` `#ff8248` | 64.8 | **-7.9** | +3.6 |
| `graveGlow` / `drop` `#ffc84d` | 81.6 | -4.0 | +1.7 |
| every remaining colour | | within 2.7 | within 1.8 |

**The four mob-fire colours are the four largest movers in the palette.** They slide down 8 to 12 points for a protanope while the rest of the palette holds within about 3. A value band whose members are all one saturated hue, and specifically that hue, is the least stable band available: the band slides out from under a margin that the palette test says is intact.

This is not an argument against value bands. It is an argument that **the band's own colours should be near-neutral**, which the top band delivers for free. Measured on candidate cores: `#ffdccd` at luma 88.8 moves 1.9, `#ffece6` at 94.0 moves 1.0, and pure white moves 0.0. Compare the current `#ff4a3d` at 11.6.

The clean way to say it: at low and middle values a warm hue can be saturated, and saturation is what makes it move. At high values it cannot be, so it does not.

### 5.4 What each option costs

**Option B, the recommended bright-core band at 88/68.** Seven non-fire colours come down: `belchFlash` 95.1, `feast` 94.8, `corpse` 89.3, `banshee` 89.2, `graveGlow` 79.5, `drop` 79.5, `bellRing` 73.9. The four fire bodies stay exactly as they are, keeping their hue and their saturation, and each gains a near-white core. Food at a 68 ceiling still reads as bone and cream.

**Option C, the strict band at 74/58.** Eleven non-fire colours come down, including all of the above plus `enemy` 66.6, `wisp` 64.8, `graveRim` 64.4, `stone` 63.7. All four fire colours must desaturate: `enemyShot`'s hue at value 1.0 does not reach luma 74 until saturation 0.35 (`#ffaca6`), against its current 0.76. At a 58 ceiling `corpse` lands at `#959286` and `feast` at `#959285`, which are the same muddy grey, so the corpse-versus-treasure silhouette rule loses its brightness backup entirely.

**Option A, keeping the middle band, is not recommended and the numbers say why.** Holding 43.7 to 59.8 with a 14-point margin forbids the whole range from 30 to 74, which is ten current colours and, more importantly, removes the entire midtone range from the artist permanently. That is a severe constraint on a game whose whole look is a night graveyard.

## 6. Open questions and thin evidence

### 6.1 The one call that is Mark's

Does ADR 0014's "mob fire owns a reserved value band that nothing else on the field may enter" mean every mob-fire pixel is inside the band, or that the band contains only mob fire?

Both readings satisfy the sentence as written. The exclusivity direction is identical in both; they differ only on whether fire is also required to be *entirely* inside. The strict reading is the stronger guarantee and costs the palette its saturated reds and its bright food (option C). The core reading keeps both, matches the shipped Cave convention the ADR already cites, and leans on the size-and-shape grammar that ADR 0014 already names as the primary discriminator, with the band as a backstop rather than the whole rule.

This document recommends the core reading, but it is a real weakening of the sentence and it should be an explicit amendment to ADR 0014 rather than an interpretation a test quietly encodes.

### 6.2 What is well sourced here and what is not

**Well sourced, safe to build on.** The metric (section 4): W3C spec text plus a byte-exact measurement across 27 colours on two Chromium builds. The claim that value contrast is the channel that survives colour vision deficiency (section 3.1): stated by WCAG itself as the reason its own formula has no hue term. The protanopic red penalty (section 3.4): three independent primary lines, Judd 1944 colorimetry, Hecht and Hsia 1947 psychophysics, and the Stockman and Sharpe cone fundamentals, converging. That hue is the axis studios actually reserve (section 2.2): two named Cave staff, on the record, in a book Cave published. The internal-contrast bullet construction (section 2.3): a shipped developer describing his own sprites, plus an independent designer stating it as the general pattern. That the intruders are your own effects and pickups (section 2.4): four independent developers, converging with this palette's own measurement.

**Judgement calls on thin evidence, flagged as such.**

*The 20-point margin.* Every threshold in every standard is foreground-against-background; none of them is about telling two foreground objects apart, which is what the band actually does. The APCA Lc 26 figure quoted for it is an analogy, not a compliance claim. The only empirical anchor is ZeroRanger's 12.7-point shipped gap, which is one data point from a palette its own authors describe as an accident. **This is the thinnest number in the document.** It is defensible as a floor and it should not be presented as derived.

*The 88 band floor.* Anchored on Gungeon's "90% white" core and on ZeroRanger's top band, which is two shipped examples, and on the arithmetic showing the palette has a free gap at 67 to 73. That is better than the margin but it is still calibrated against two games.

*Lc 45 for the visibility assertion.* APCA's own stated minimum for fine-detail pictograms, but APCA is not a W3C recommendation (section 3.2), and "a bullet is a fine-detail pictogram" is my classification, not APCA's.

*The internal-contrast minimum and the hue-exclusion angle* (test assertions 9 and 10). No source gives a number for either. Both are stated as "some minimum" deliberately.

**Where the field simply has nothing.** No standards body and no studio publishes a threshold for a small moving sprite. Four of the five games accessibility bodies checked say nothing testable about whether a player can see a bullet coming, and the fifth, Xbox, gives one sentence and a number (4.5:1) that is stricter than WCAG's own graphical-object figure with no explanation of the difference. That is a gap in the field, not a gap in the search.

**Two claims this project was carrying that the search retired.** ADR 0014's Ikaruga citation is fan analysis rather than developer statement, and "bullets are the brightest thing on screen" is folklore with no named source. Both are in section 2.1. Neither weakens the rule; both should stop being cited for it.

### 6.3 What no instrument here covers

The band is a guarantee about declared colours and about one rendered instant. It says nothing about **motion**, and motion is a large part of why bullets are readable in the games this borrows from. Iuchi's only recorded readability levers are bullet speed and removing things the eye must check; Nijman's are size and speed. Nothing in this document, in the unit test, or in the grayscale screenshot measures either. The feel call stays the human's, as ADR 0014 already says.

The band also says nothing about **density**. ADR 0014 requires that mob fire wins wherever it overlaps at any density the game can produce, verified at the density the tuned field actually measures. A 20-point margin between single colours does not establish that, and the differential screenshot in section 1.7 tests it only at the ticks it samples. ZeroRanger's retrofit is the relevant precedent: the confusion that forced it showed up in the densest mode first, and the fix then became global.

It says nothing about **spatial frequency**, which Valve's NPAR paper argues is a prerequisite rather than an extra: "high frequency geometric and texture detail... can often overpower the ability of designers to compose game environments and emphasize gameplay features visually using intentional design choices such as changes in color value." A noisy `nightSpeckle` layer at high density can defeat the band without any declared colour entering it.

And two warnings from developers who have run this test on themselves, both of which say the instruments in this document are necessary and not sufficient. Yotsubane, who could not see his own legibility problem until he returned to the build cold: "habituation is the great enemy of tuning." And a Blue Revolver playtester who reported bullets disappearing in his **periphery** while being perfectly visible at fixation, which is a failure mode no screenshot taken by anyone staring at the screen will ever reproduce.

---

## 7. The derived palette

Section 0 is the rule and this is the palette that satisfies it, derived on 2026-08-20 by applying that rule to the 27 colours in section 5.1. It exists so the render-structure dispatch implements a pinned table rather than making colour choices of its own, and so every hex here has a stated method behind it rather than an eye behind it.

Every number below was produced by the same arithmetic as the rest of this document, and is reproducible from section 0.1 (luma), section 3.3 (APCA) and section 5.3 (the colour-vision weights).

### 7.1 The four methods

**Mob-fire bodies do not move.** All four keep their exact hex, their hue and their saturation, which is what option B buys and section 5.4 states outright.

**One shared core, one shared outline.** Solving each body's own hue for a near-white at luma 90 produced `#ffdfdc`, `#ffdfdb`, `#ffdfdb` and `#ffe0d1`, which are the same colour four times over, so four cores would have been four names for one value. The core carries the value guarantee and the body carries the hue, exactly as section 0.3 splits them, so one core and one outline serve all four emitters. The core is `#ffece6`, the section 5.3 candidate measured at a 1.0-point protanopic shift. The outline is `#1a0906`, the fire family's own hue at HSV value 0.10.

**The colours above the ceiling come down by proportional RGB scaling.** Hue and saturation are held and only value moves, so nothing changes identity on the way down. Each was scaled until its luma reached the target, and the default target is 67.5 rather than 68.0 so that rounding to a byte cannot push an entry over the line. The same arithmetic raises a colour, and one entry took that direction: `fieldFrame` went up on 2026-08-20 under assertion 11, on its own ray, with its hue and saturation held exactly as they are on the way down. The 67.5 target does not apply to a raise, because a raise is bounded by whatever check binds it first, and for `fieldFrame` that is assertion 8 rather than the ceiling.

**`dropCore` is replaced rather than scaled**, because scaling a brown gives a darker brown. Its replacement `#141a26` is the palette's own night-navy family (hue 220), which is where every other near-black in the palette already sits.

### 7.2 One value assigned by judgement, and two that were and are not

Scaling everything to one ceiling collapses colours the old palette separated, so three entries were first given a value by hand rather than computed. The three review gates on 2026-08-20 took two of them apart, and the record of that is kept here rather than tidied away, because the failure is instructive: each hand-picked value solved the collision in front of it and created a worse one behind it.

**`corpse` goes to 62.0 and stays there.** At the ceiling it lands on `#b0ac9f` against `feast` at `#b0ac9e`, one byte apart, and the design needs the feast to read as the bigger prize. 62.0 restores a 5.4-luma gap, which is the 5.5-luma gap the old palette had between them. The game-design gate re-checked the relation under CIE L\* rather than luma, since a fixed luma gap does not mean the same thing at 62 as at 89: it was 4.85 before and is 5.19 now, so the relation survives on a perceptual metric and not only on the metric it was fitted to. That pass also retired an assumption this project had been carrying, that "steady-bright means treasure" was working: in the old palette `drop` sat at 79.5 while a fresh `corpse` sat at 89.3, so treasure was nine luma points **darker** than the fuel it was supposed to out-shine, and the cue was carried entirely by "steady".

**Corrected 2026-08-21, on the dispatch-4 fold.** Two design intents stated in the paragraph above are not delivered by the numbers under them, and both were re-measured in-tree before this was written. The 5.4-luma gap between `corpse` and `feast` measures **APCA Lc 0.00**, so the feast does not read as the bigger prize on that gap at all: what the relation measures is a luma difference nobody can see. And the slogan is not true at 67.25 against 61.95 either: `drop` against `corpse` measures **Lc 7.43** one way round and **Lc -9.03** the other, both far under the Lc 30 solid bracket, and `drop` against `feast` measures **Lc 0.00** in both directions. APCA is signed and directional, so a figure from this document is only usable with the direction it was taken in named, which section 7.4 already warns about. The relations were fitted on luma, which is the right metric for the band, and never checked on APCA, which is the metric for whether a player can see the difference. The hexes are unchanged, because the values are right and only the claims about them were wrong. What now delivers the intent is the outline construction in the dispatch-4 plan's section 4.15.2: every sprite in the food, mob and treasure layers carries `foodOutline` as a dark companion, which is what makes a food sprite read against another food sprite and against the grave's rim.

**`belchEruption` was moved to 56.0 and moved back to 67.35.** Moving it down escaped `feast` and put it one luma point from `splash`, the wasted charge. ADR 0008's cure for hoarding the belch is that hoarding is visibly a loss, and a loss and a payoff at the same brightness do not teach that. Worse, `corpse` is the one entry in this table whose value is animated, and a corpse fading from 62 downward sweeps straight through 56 at the same hue, so a half-fresh corpse and the screen-clearing eruption would have been the same colour at the exact moment the belch fills the field with corpses. Back at the computed 67.35 it clears `splash` by 12.4 and sits above the whole fade range.

**`graveGlow` was moved to 56.9 and moved back to 67.25.** Moving it down escaped `drop`, which it shares a hex with, and made the grave's glow darker than the grave's own rim at 64.45. The concept doc makes that glow the tell that the reservoir has slammed full, read mid-dodge without looking away, so making it the dimmest thing on the grave broke the job it exists for. The judgement was made with the collision in view and not the job. Back at 67.25 it out-shines the rim by 2.8.

The two reversions cost two entries in the exception table of 7.4, and an exception carrying a written reason is a cheaper thing to own than a value nobody can trace.

### 7.2.1 The general form of that defect, measured

The correction above is not about two pairs. Taking the thirteen declared colours between luma 61.95 and 67.41, which is `graveRim`, `graveGlow`, `mob`, `banshee`, `stone`, `wisp`, `bellRing`, `corpse`, `corpseRevenant`, `feast`, `drop`, `belchEruption` and `hudInk`, and measuring every one of the 78 pairs between them: **72 of the 78 measure exactly APCA Lc 0.00.** Two colours in that band are, to APCA, the same colour. The six that are not zero span only -10.67 to 7.43, so none of them reaches even the Lc 30 solid bracket, and the band is flat for every practical purpose rather than merely mostly flat.

Section 7.5 predicted this in words, that above luma 60 the value budget is spent and every remaining distinction has to come from hue, silhouette or motion, but nobody measured what it costs. This is the measurement. The rim against the food layer is one instance of it, not a defect of one colour, and it is why the fix is the outline construction rather than a re-valuing: re-valuing anything inside a band that is already flat to the metric moves it to another part of the same flat band. The construction is the only fix that touches the general case, and the assertion that holds it is written as a table over the layers rather than as a list of the sprites that happen to exist today, so the storm's four colours inherit the requirement when dispatch 5 draws them.

**`fieldFrame` adds a judgement of a different kind, and it is a bracket rather than a value.** Its hex is arithmetic once the bracket is chosen, but choosing the bracket is not. APCA grades non-text by the element's smallest dimension, and a boundary stroke is a long thin thing that the grading has no term for: it gives Lc 15 to non-semantic shapes no thinner than 5 rendered pixels, Lc 30 to solid semantic ones no thinner than 5.5, and Lc 45 to fine detail. The boundary was placed in the Lc 30 bracket and the stroke widened to reach its size floor, rather than left at 2 units in the fine-detail bracket, which `fieldFrame` cannot reach. The judgement is that a playfield edge is semantic, which rules out Lc 15, and solid rather than fine detail once it is wide enough to be. Both halves are written into the test, so a later thinning of the stroke fails rather than passing quietly at a colour chosen for a width it no longer has.

**Re-graded 2026-08-22, into the fine-detail bracket, and the sentence above about what `fieldFrame` cannot reach was true only of its old value.** Mark played the field and called the 8-unit band too heavy. Two routes to a thinner stroke were measured in-tree before either was taken. The first is the release ADR 0014 already names, a ground fill distinct from the surround, and it does not work on this palette: on a ray from `night` at luma 6.64 upward, every candidate through luma 22.68 measures APCA Lc 0.00 against `night` in both directions, the first that grades at all is luma 25.00 at Lc 9.48, and reaching even Lc 15 needs luma 31.95, where `hudDim` drawn on it falls to Lc 19.6 and `hudInk` to Lc 40.8. A boundary carried by two adjacent fills is not available in the near-black region, and this is worth keeping: APCA's clipping is not a claim that the step is invisible, it is a refusal to grade, and a refusal to grade is not evidence of safety. The second route is re-grading the stroke itself, and that is the one taken. It is the same move this section's own last paragraph makes for the grave's rim. `fieldFrame` rises from luma 48.63 to **62.43** (`#8fa0c7`), measuring **Lc 50.32** against `night`, clearing the fine-detail bracket, which carries no width floor, so `BOUNDARY_STROKE` drops from 8 to 2. **The window is about 1.3 luma points wide and three assertions close it from both sides**, so the hex is close to forced rather than chosen: below luma 62.0 the nearest mob-fire body comes inside the 2.0-luma separation (`fireSpiral` at 59.76), above luma 63.3 a mob-fire core stops clearing Lc 45 against the frame, and below Lc 45 against `night` the stroke needs its old width back. **What it cost is stated rather than buried**: the worst mob-fire core against the boundary falls from **Lc 63.54 to Lc 46.26**, because fire is drawn over the boundary wherever a shot reaches an edge and every point the frame rises is spent out of assertion 8. What it bought on the same axis is that the band in which fire is drawn over the boundary at all falls from 8 field units to 2. The 2 itself is a taste and is the only number in this decision that is; everything else above is measured.

**Corrected 2026-08-20, on the dispatch-3b tech architecture gate.** This paragraph previously said the fine-detail bracket is one "where no colour under the ceiling can reach Lc 45 against `night` at all". That is false, measured in-tree with this repo's own `apcaLc`: a neutral gray at the ceiling of luma 68 is Lc 57.4 against `night`, and even at luma 62 it is Lc 49.3. What actually caps `fieldFrame` is assertion 8 (section 7.5, and the table entry below): every `mobFireCore` colour must clear Lc 45 against `fieldFrame` **as a background**, and every point `fieldFrame` rises is spent straight out of that margin, which is why it sat at luma 48.63 and Lc 33.1. `BOUNDARY_STROKE` at 8 was unaffected by this correction; only the reason given for its bracket was wrong. The 2026-08-22 re-grading above then spent that margin deliberately, down to Lc 46.26, and `BOUNDARY_STROKE` is 2.

**An APCA bracket belongs to the element it was chosen for, and does not transfer.** The dispatch-3b plan's first draft told an agent to derive the grave's rim stroke by following this paragraph's reasoning, which lands on 8 field units. At `SIZE_FLOOR` that is two 8-unit rims on an 18-unit grave, leaving 2 units of mouth against a 3.6 corner radius: the grave stops being a hole exactly when the player most needs to read it. The error was the bracket, not the arithmetic. `graveRim` measures Lc 52.9 against `night` and Lc 53.4 against `graveHole`, clearing the Lc 45 fine-detail bracket with headroom, and that bracket carries no 5.5-pixel floor at all. Anything reading this section for a stroke width, and dispatch 4's corpse, mob and drop renderers will, must first ask which bracket its own element qualifies for.

### 7.3 The pinned table

Names are the ratified vocabulary from `CONTEXT.md`. The old prototype names appear only in the "was" column, as history: `enemy`, `enemyShot`, `enemyTear`, `enemyClod`, `enemySpiral`, `belchFlash`, `waste` and `hitFlash` are all banned or retired terms and none of them is a key here.

`fireCore` is the only entry tagged `mobFireCore`. Everything else is a field colour bound by the 68 ceiling.

**the night field**

| name | hex | luma | was | note |
| --- | --- | --- | --- | --- |
| `night` | `#0e1119` | 6.64 | `night`, unchanged | |
| `nightSpeckle` | `#1d2434` | 13.99 | `nightSpeckle`, unchanged | |
| `fieldFrame` | `#8fa0c7` | 62.43 | `fieldFrame` `#2a3348` 19.84 | raised, then raised again 2026-08-22 from `#677db0` at 48.63 |

**the grave**

| name | hex | luma | was | note |
| --- | --- | --- | --- | --- |
| `graveHole` | `#04060b` | 2.33 | `graveHole`, unchanged | |
| `graveRim` | `#93a7bd` | 64.45 | `graveRim`, unchanged | |
| `graveGlow` | `#d8a941` | 67.25 | `graveGlow` `#ffc84d` 79.53 | lowered |

**mobs**

| name | hex | luma | was | note |
| --- | --- | --- | --- | --- |
| `mob` | `#59c964` | 66.63 | `enemy`, unchanged hex | renamed |
| `mobDark` | `#1d4a26` | 24.25 | `enemyDark`, unchanged hex | renamed |
| `banshee` | `#98b2a7` | 67.32 | `banshee` `#c9ecdd` 89.21 | lowered |
| `bansheeDark` | `#3f7a68` | 42.41 | `bansheeDark`, unchanged | |
| `undertaker` | `#5d6b80` | 41.39 | `undertaker`, unchanged | |
| `undertakerDark` | `#232b38` | 16.56 | `undertakerDark`, unchanged | |

**mob fire**

| name | hex | luma | was | note |
| --- | --- | --- | --- | --- |
| `fireCore` | `#ffece6` | 93.96 | - | new, the only colour in the band |
| `fireTrash` | `#ff4a3d` | 43.74 | `enemyShot`, unchanged hex | renamed, body |
| `fireTear` | `#ff6a55` | 53.40 | `enemyTear`, unchanged hex | renamed, body |
| `fireClod` | `#f5563d` | 46.27 | `enemyClod`, unchanged hex | renamed, body |
| `fireSpiral` | `#ff8248` | 59.76 | `enemySpiral`, unchanged hex | renamed, body |
| `fireOutline` | `#1a0906` | 4.86 | - | new |

**player fire**

| name | hex | luma | was | note |
| --- | --- | --- | --- | --- |
| `skull` | `#8496a6` | 57.78 | `skull`, unchanged | |
| `territory` | `#82b26b` | 63.79 | `stone` `#9aa4ad` 63.73 | renamed, and re-hued 2026-08-28 (7.7); the charge arc on the grave's rim, after the split in 7.8 |
| `territoryGround` | `#9495ac` | 59.00 | split out of `territory` 2026-08-28 | claimed ground on the open field (7.8) |
| `wisp` | `#63b8ad` | 64.76 | `wisp`, unchanged | |
| `bellRing` | `#9faebd` | 67.41 | `bellRing` `#aebfcf` 73.94 | lowered |

**food and treasure**

| name | hex | luma | was | note |
| --- | --- | --- | --- | --- |
| `corpse` | `#a29e92` | 61.95 | `corpse` `#e9e4d2` 89.32 | lowered, then held off the ceiling (7.2) |
| `feast` | `#b0ac9e` | 67.39 | `feast` `#f7f2de` 94.75 | lowered |
| `drop` | `#d8a941` | 67.25 | `drop` `#ffc84d` 79.53 | lowered |
| `dropCore` | `#141a26` | 10.04 | `dropCore` `#4a3b12` 23.23 | replaced, the brown |

**effects**

| name | hex | luma | was | note |
| --- | --- | --- | --- | --- |
| `belchEruption` | `#b5ac8e` | 67.35 | `belchFlash` `#fff3c9` 95.11 | renamed and lowered |
| `splash` | `#7f9184` | 54.99 | `waste`, unchanged hex | renamed |

**readouts drawn over the field**

| name | hex | luma | was | note |
| --- | --- | --- | --- | --- |
| `hudInk` | `#a8acb0` | 67.23 | `#e8edf2` 92.67, a screen-local constant | lowered |
| `hudDim` | `#76839a` | 50.94 | `#76839a`, a screen-local constant | unchanged hex |

**menu, declared apart and exempt from the ceiling**

| name | hex | luma |
| --- | --- | --- |
| `menuInk` | `#e8edf2` | 92.67 |
| `menuDim` | `#76839a` | 50.94 |

`hitFlash` does not appear. It is retired rather than re-valued, per section 1.4 and the ADR 0014 amendment of 2026-08-20: the hit announces by subtraction, and a dim layer needs no colour of its own beyond the night the field already sits on.

**The table is not closed.** It is complete for everything the game draws today, and two dispatches must open it: the per-weapon-line drop colours and the per-tier corpse hues, both of which the tracer plan requires and neither of which has an entry here. What they must satisfy is 7.5.

### 7.4 What this palette measures

| check | required | measured |
| --- | --- | --- |
| 0.4 assertion 2, presence | core luma >= 88 | 93.96 |
| 0.4 assertion 3, exclusivity | every non-core <= 68 | highest is `bellRing` 67.41 |
| 0.4 assertion 4, margin | >= 20 | 20 |
| 0.4 assertion 6, protanope | core still clears every non-core | 93.1 against 72.5, a 20.6 gap |
| 0.4 assertion 6, deuteranope | core still clears every non-core | 94.5 against 70.4, a 24.1 gap |
| 0.4 assertion 8, APCA vs sky | core Lc 45 or better on all four backgrounds | 46.26 worst, against `fieldFrame`, and it was 63.54 before 2026-08-22 |
| 0.4 assertion 9, internal contrast | core to outline span >= 20 | 89.10 |
| 0.4 assertion 10, restated below | fire's hue family closed to everything else | 22.2 degrees, `graveGlow` against `fireSpiral` |
| the standing brown ban, not an assertion in 0.4 | no hue 20 to 50 with saturation >= 0.5 and value < 0.55 | none; closest is `drop` at value 0.85 |
| sprite separation, new here | no two field sprites within 2.0 luma, 15 degrees and 0.25 saturation | three named exceptions, below |
| 0.4 assertion 11, the boundary | boundary Lc 45 or better against the ground it sits on | 50.32, and it was 33.1 at Lc 30, and 0.00 before that |
| 0.4 assertion 11, the stroke | at least one whole CSS pixel at the phone viewport; the fine-detail bracket carries no 5.5 floor | 1.44 CSS pixels at 2 field units |
| the boundary against fire, new here | no mob-fire body within 2.0 luma of the boundary | 2.67, `fireSpiral`, and the binding body changed from `fireClod` on 2026-08-22 |

APCA output is **signed**: light on dark returns a negative Lc, so the core against `night` measures -97.4 and the requirement is on its magnitude. Section 3.3's table is written unsigned while its own prose says the output is signed, which is a trap for anyone pinning a test against it.

Assertion 6 is stated as a **separation** rather than as the 88 and 68 thresholds re-applied, because the colour-vision estimate is on its own scale (section 5.3) and the two scales agree only on neutral greys. What the band is for survives the restatement unchanged: under every observer, the core still sits clear of everything else. Its protan headroom is 0.6 points, held by `mob` at 72.5, so this is the first check the Halloween art pass will redden when it recolours mobs. That is the check doing its job, not a defect in it.

**Assertion 8's headroom moved on 2026-08-20 and its binding background changed.** Raising `fieldFrame` to satisfy assertion 11 cut the worst core-against-background figure from 92.0 to 63.5, so the margin over the Lc 45 floor fell from 47 points to 18.5. `fieldFrame` was already the worst of the four backgrounds and still is, and it is now the only one anywhere near the floor: the other three are near-black and sit above Lc 90. Any further raise of the boundary spends that margin directly, which is what caps `fieldFrame` at about luma 62 well below the 68 ceiling. The ceiling is not the constraint on this entry; assertion 8 is.

**And on 2026-08-22 that margin was spent, on purpose, to buy the thinner stroke.** The worst core against `fieldFrame` is now **Lc 46.26**, 1.26 points over the floor, and `fieldFrame` at luma 62.43 is within 0.4 of the cap the paragraph above predicted for it. There is no headroom left on this entry in either direction: the art pass cannot raise the boundary at all without breaking assertion 8, and cannot lower it without breaking assertion 11 or the fire-body separation. **This entry is now the tightest in the document and it is the first place #38 will feel constrained.** If the art pass needs room, the way to make it is to move `fireSpiral`'s body rather than the boundary, since it is `fireSpiral` at luma 59.76 that sets the bottom of the window.

**Assertion 10 is a tripwire here, not the rule.** Its 20-degree floor was fitted 2.2 degrees below the tightest gap in the palette it checks, so a passing result means no **new** colour has walked into fire's family. It does not certify the current gap as comfortable, and the wider rule it stands in for, Cave's three-way separation of fire, effects and pickups, is not asserted anywhere in this build. See 7.5. It should be read and named as the tripwire it is.

**The three sprite-separation exceptions, each with its reason.**

`graveRim` against `stone`, 0.71 luma and 3 hue degrees apart. The rim is a large outline fixed to the grave and a headstone is a small orbiting sprite, so ADR 0014's silhouette-first rule carries them. It predates this pass.

`graveGlow` against `drop`, the identical hex. The glow is the grave wearing treasure's own colour, it is always at the grave's own position, and the concept doc has it pulsing while a drop is steady. Position and motion carry it. This also predates this pass.

`feast` against `belchEruption`, 0.04 luma and 0.5 hue degrees apart. A feast is a small steady sprite in the food layer and the eruption is a momentary full-field event two layers below it, so silhouette, duration and layer all separate them. This one is created by the ceiling and it is the price of reverting the judgement in 7.2.

### 7.5 What is deliberately not fixed here, and what #38 inherits

**Cave's three-way hue separation is not asserted.** Tanaka separates fire, effects and pickups into three mutually exclusive hue channels (section 1.3), and this palette does not: `belchEruption` at hue 46.5 sits in the same cream family as `corpse` and `feast`, and `graveGlow` at 41.3 shares its hex with `drop`. Separating them means rebuilding the warm half of the palette around three channels rather than one, which is the Halloween art pass. Fire against everything else, the separation with the actual evidence behind it, **is** asserted.

**The boundary sat 2.4 luma from `fireClod` at its old value, and it is a readout inside the value budget rather than scenery.** `fieldFrame` at 48.63 cleared `fireClod`'s body at 46.27 by 2.36 and `hudDim` at 50.94 by 2.31, which was the widest window assertion 11 left between a fire body below it and a readout above it. Fire crosses the boundary every time a bullet reaches an edge, and the art pass moves fire bodies, so this was the second check after assertion 6's protan headroom that #38 will redden.

**Re-measured 2026-08-22, and the finding is worse than the old one, so it is stated rather than left for the art pass to trip over.** At luma 62.43 the boundary is no longer below the crowded band, it is **inside** it: `corpse` and `corpseRevenant` are 0.48 away, `stone` 1.30, `graveRim` 2.02, `wisp` 2.33, `fireSpiral` 2.67. Only the last of those is checked by a test, because `fieldFrame` is in the sprite-separation exemption list and the others are sprites it is not compared against. **Every point inside the 1.3-luma window is within 2.0 luma of something in the food or storm band**, so this is not a colour that could have been chosen better: the band between 61.95 and 67.41 is flat, 72 of its 78 pairs measure Lc 0.00, and joining it is the price of the fine-detail bracket.

What makes it survivable is the same construction 7.4 already relies on, and it is the reason the boundary also changed layer on the same day. The boundary draws directly beneath mob fire and **above** the corpse, mob and treasure layers, so it is never the thing being hidden, and every sprite in those layers carries `foodOutline` at luma 10.04 as a dark companion, which is what separates a food sprite from `graveRim` at 64.45 and now separates it from the boundary on the same mechanism. **The trigger to revisit is the art pass: if #38 moves any food or storm colour, or gives the boundary a second band the way `graveRim` has one, re-measure this list rather than trusting it.**

**Above luma 60 the value budget is spent.** `bellRing` 67.41, `feast` 67.39, `belchEruption` 67.35, `banshee` 67.32, `drop` 67.25, `graveGlow` 67.25 and `hudInk` 67.23 all sit inside two tenths of a luma point of each other. Every remaining distinction in the top of the range has to come from hue, silhouette or motion. The art pass needs that as a starting constraint rather than as a discovery.

**Fire's 20-degree exclusion closes hue 20 to 39 to every non-fire colour, and that is pumpkin orange.** With purple already banned by the project's standing rule, both of Halloween's signature colours are out of the non-fire palette, in a game whose one never-cut requirement is that it reads as Halloween within seconds. It is survivable: the fire itself is orange-red, `drop` and `graveGlow` are amber at 41, `mob` is graveyard green, and hue 50 to 125 and 175 to 205 are entirely empty. But #38 should meet it as a stated constraint and it belongs on that ticket as an acceptance criterion.

**The per-line drop colours have no budget here, and neither do the per-tier corpse hues.** The v1 done-line requires every drop to show its weapon line at a glance mid-dodge, on the drop itself. The four player-fire colours are `skull` 57.78, `territory` 63.79, `wisp` 64.76 and `bellRing` 67.41, and two of the four are still hue 208 at saturation 0.11 to 0.21: one pale blue-grey at two brightnesses. `territory` left that family on 2026-08-28 (7.7) because it had to, which is one line solved out of four and not a method for the rest. Sprite separation passes them all, because they are 3.7 to 9.6 luma apart and its threshold is 2.0, so that check will go green on four drops a player cannot tell apart. Hue is what is scarce: fire closes 0 to 39, the brown ban closes 20 to 50 at saturation, and amber at 41 is spoken for. Risk of Rain's answer to the same problem is hue tiering. The same squeeze applies to the corpse tiers.

**A corpse's colour is animated and the separation check only sees its fresh value.** Freshness fades the sprite from 61.95 down toward nothing, so a corpse occupies a whole range rather than a point, and any colour in the cream family below 62 collides with it at some instant of every corpse's life. Today nothing is there. The check must compare `corpse` across its fade range rather than at one value, or the next colour added below 62 in that hue family passes a green test and fails on screen.

**The freshness fade has less room than it had, and its floor is unwritten.** A fresh corpse now starts at CIE L\* 65.1 instead of 90.5, so the fade has roughly 38 L\* points to spend rather than 64, about 3.8 per second over a ten-second life instead of 6.4. That is readable at fixation, and the constant silhouette and the last-chance flicker work alongside it. But freshness is the whole greed-has-a-deadline choice and it is read peripherally mid-dodge, which section 6.3 says is where small differences vanish. The fade's floor and its per-second step should be stated as numbers before the field dispatch builds it, because at 38 points of range the floor cannot be discovered by feel afterwards without redoing the palette.

**The belch loses brightness as a channel and needs the replacement budgeted.** The eruption fell from 95.1 to 67.35 and it already sits second from the bottom of the draw stack, so it has lost top brightness and never had a layer above the field. What it gains is bigger than what it lost, and it is only available now that the band exists: mob fire is the only thing above 68, so belching puts out every highlight on the screen at once, where the old `belchFlash` at 95.1 competed with the fire it was cancelling. But the eruption's own punch has to come from hitstop, shake, scale and speed rather than from a white flare, which is the Vlambeer vocabulary section 2.4 already cites. The weapon-lines dispatch should budget those deliberately rather than discover after the deploy that the button feels like nothing.

**At the size floor there is no shrink, so the dim is the only field-side announcement.** ADR 0003's ladder bleeds score and then weapon levels instead of size, and the same dim currently says both "you took a hit" and "you just lost the wisps". The most consequential non-death event in the game has no tell of its own, and it fires exactly when the player is in the spiral the comeback design exists to rescue. That is the sim-core dispatch's problem, but this pass is where a colour for it would have been reserved and none was.

**No colour here has been seen on a screen.** Everything above is arithmetic. The grayscale differential of section 0.5 runs at the weapon-lines dispatch and again at tuning, and the feel call stays Mark's after he plays it.

### 7.7 `territory` re-hued, 2026-08-28

**The finding that forced it.** Territory's charge arc is the grave rim's own band wearing the line's colour, which is the construction `graveGlow` already uses for the reservoir. Drawn in `stone` `#9aa4ad` the arc is invisible: it sits 0.72 luma and 3 hue degrees from `graveRim`, inside the flat span 7.5 measures, where 72 of 78 pairs read APCA Lc 0.00. This was found by pixel probe on a rendered build rather than by eye, and the arc draws correctly; only its colour fails.

**Lightness cannot fix it and APCA cannot grade it.** Both colours are held under the band ceiling of 68, so neither can move far enough on luma, and every candidate at that luma measures Lc 0.00 against the rim whatever its hue, because APCA grades lightness alone. The reservoir glow is the proof that this is survivable: it also measures Lc 0.00 against the rim and reads plainly, on hue gap 170 and saturation gap 0.48. So the instrument here is 7.4's own separation rule and not APCA.

**The hue was forced rather than chosen.** Fire's 20-degree exclusion closes 20 to 39, amber at 41 is spoken for by `drop` and `graveGlow`, purple is closed by the project's standing ban, and 175 to 220 is the grave's own family, which is the thing that has to be left. What remains is the window between `corpseRevenant` at hue 76 and `mob` at hue 126. Hue 101 is its midpoint: 24 degrees off the moss and 25 off a mob body, 111 off `graveRim` and 59 off `graveGlow`. Saturation 0.40 sits midway between the grave family's 0.11 to 0.22 and a mob's 0.56, so claimed ground parts from a mob on saturation as well as on hue. Luma is held at the old value, 63.79 against 63.73, so nothing else in the crowded band moves.

**What it costs.** Claimed ground was green on a field whose trash mobs are green, and the two are 25 hue degrees and 2.84 luma apart, which clears 7.4's separation on hue and on luma. It is 0.16 saturation apart and does not clear that channel, and it does not have to: a violation needs all three at once, which is how `palette.test.ts` states it. The pair was also carried by silhouette, a large static circle against small moving bodies, which is the reasoning the retired `graveRim` and `territory` exception used to carry. That exception is deleted rather than left standing, because it now describes a collision that no longer exists. **The cost stood for one day.** 7.8 splits the entry and moves claimed ground off this colour, which now serves the charge arc alone.

**Not seen on a screen at the time of writing.** The arithmetic above is checked by `palette.test.ts`; the feel call stays Mark's after he plays it.

### 7.8 The entry split, and `territoryGround`, 2026-08-28

**One entry was serving two jobs.** 7.7 re-hued `territory` for the charge arc on the grave's rim, which needs hue to part from the rim. The same entry also painted claimed ground on the open field, which needs to part from green mob bodies, and the playtest named that in as many words: there is so much green that the colours do not differ. The entry is therefore split. `territory` keeps 7.7's green and serves the arc alone; a new `territoryGround` `#9495ac` carries the ground.

**Both channels are close to forced, and `palette.ts` holds the full derivation beside the value.** Luma 59.00: under 58.3 claimed ground stops clearing APCA Lc 45 over the grave's own mouth, which it can be laid across; a tenth of a point under that, `foodOutline` stops clearing 45 over the ground itself; over 59.95 the luma channel closes against revenant moss at 61.95. The two margins cross at 59.01. Brighter is not available at all, because `mob` sits at 66.63 under a ceiling of 68. Hue 237.5 is what is left once fire's exclusion and amber close the warm end, corpse and feast hold the warm bone, the green family from 76 to 155 is the defect itself, 175 to 220 is the grave's own family, and purple is closed by the standing ban. Saturation is capped rather than picked: parting from the moss needs 0.208 or under, and 0.140 leaves margin on both greens at once, which is what makes the entry read as cold stone rather than as a blue-violet.

**Against a mob body** the pair is 7.63 luma, 111.6 degrees and 0.418 saturation apart, clearing 7.4's separation on all three channels at once. Measured against everything it is drawn over: Lc 45.92 on the grave's mouth, 57.45 on an eruption, 57.48 on a bell ring, and 41.44 over the splash, which is the figure every storm colour reaches there. For the sprites drawn over it: Lc 46.44 for the food and mob layer through `foodOutline`, and 48.16 for the rim.

**Hue 237.5 sits next door to the banned family, so the feel call was flagged for veto on sight.** Mark played the build on 2026-08-29 with the colour named to him as the first thing to watch, and did not veto it.

### 7.6 Assertion 11, and why the boundary needed one

The render-structure gate on 2026-08-20 measured `apcaLc(fieldFrame, night)` at exactly 0.00, under APCA's own `LO_CLIP`, and WCAG contrast at 1.497:1. The engine's background is `night` and the field draws no ground fill, so inside the field and outside it are the same pixels and the stroke is the entire visual statement of where the world ends. That edge is the bound on the grave's movement, so it is required to understand the content rather than decorative.

**WCAG 2.2 SC 1.4.11 is in scope, under Graphical Objects, and it is the floor rather than the rule here.** [Understanding SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) requires 3:1 for "parts of graphics required to understand the content", treats it as a threshold and not a rounding target, and its Essential exception enumerates logos, flags, photographs, screenshots, medical diagrams and heat maps while stating that low contrast chosen by an author "is not 'essential'". The listed sufficient technique is on the nose: [G209](https://www.w3.org/WAI/WCAG22/Techniques/general/G209) says that where adjoining colours are under 3:1, add a border with at least 3:1 against **each** of them, which is exactly this construction with `night` on both sides. Section 4.5 already settled that a contrast ratio is the wrong instrument on a near-black field, so 3:1 is recorded as the conformance floor and APCA carries the rule.

**Understanding 1.4.11 also says, in its own words, that a thin line needs more than the threshold.** "Due to anti-aliasing, particularly thin lines and shapes of non-text elements may be rendered by user agents with a much fainter color than the actual color defined in the underlying CSS. In these cases, best practice would be for authors to avoid particularly thin lines and shapes, or to use a combination of colors that exceeds the normative requirements of this success criterion." Note the order: widen first, brighten second. That is why the stroke moved from 2 field units to 8 before the colour was chosen, and it is not hypothetical here, because the field is scaled by a non-integer factor so the stroke lands on fractional pixels. At the recommended colour, partial coverage measures Lc 48 at full, 41 at 90 percent, 31 at 75 and 22 at 60. Colour cannot fix that and width can.

**APCA's brackets, from [APCA in a Nutshell](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell), are what set the number.** Lc 15 is "the absolute minimum for any non-semantic non-text that needs to be discernible, and is no less than 5px (solid) in its smallest dimension", with the instruction that "designers should treat anything below this level as invisible". Lc 30 is for "large/solid semantic and understandable non-text elements, generally no less than 5.5px solid". Lc 45 is "the minimum for pictograms with fine details, or smaller outline icons". The boundary is semantic, which rules out the first, and at 8 field units it cleared the second's size floor at 5.78 CSS pixels on a 390-wide phone, where a 2-unit stroke renders 1.44. Lc 30 was the honest bracket while the boundary was 8 units wide, and the value then chosen cleared it at 33.1.

**Superseded 2026-08-22.** Semantic still rules out Lc 15, but "solid" was never forced: the third bracket is the one a 2-unit stroke actually qualifies for, and the question is only whether the colour can reach Lc 45. It can, at luma 62.43, which measures Lc 50.32 against `night`. The boundary is now graded fine-detail at 2 units and 1.44 CSS pixels. 7.4 has what that cost in assertion 8's margin and 7.5 has it in the crowded band, and it is not free.

**What the shipped record says, including where it says nothing.** The genre default is that there is no drawn edge at all. [Boghog's shmup 101](https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101) says only that "the play area can either be contained by the screen, or it can be wider thanks to horizontal panning", and treats the edge as a gameplay concern rather than a drawn one. Molinari's [Anatomy of a Shmup](https://www.gamedeveloper.com/design/the-anatomy-of-a-shmup) does not mention playfield boundaries at all, and that negative result is recorded rather than filled in. The one layout sourced in primary detail is Touhou's, from nmlgc's [ReC98 decompilation](https://rec98.nmlgc.net/blog/2023-06-30): the playfield ends at x 448 "where the HUD begins" and "the playfield borders come in, and helpfully cover 16 pixels at the top and 16 pixels at the bottom", which is an opaque region and a HUD panel rather than a stroke, exists for a VRAM-masking reason rather than a readability one, and is PC-98 specific. **No developer is on record prescribing anything about the appearance of a playfield boundary**, and this document has retired two folklore claims already, so nothing further is asserted.

**What that licenses is the opposite of a bright frame, and it is the cheaper fix this palette cannot yet take.** The shipped record supports bounding the play area by the screen, or by a surround of different material. Hungry Grave has neither: the field is letterboxed into an arbitrary viewport so the screen edge is not the play boundary, and the ground is unfilled so there is no material difference. G209's other branch, and Understanding 1.4.11's own Boundaries logic that a boundary needs contrast only "when there is no other visual way to identify the presence of the control", both say that a ground fill distinct from the surround releases the stroke entirely. **If #38 gives the field its own ground, `fieldFrame` should be revisited and lowered rather than kept**, because a bright line spending value budget for a job structure has taken over is exactly the kind of value nobody can trace that 7.2 exists to prevent.
