# Shmup and danmaku object scale: evidence for sizing a 540x760 portrait playfield

Research date 2026-08-27. Every number below is expressed both in its native pixels and as a fraction of that game's **playfield width (W)**, so it transfers to any coordinate system.

Labels: **DOCUMENTED** = a developer said it, or it is in decompiled/reverse-engineered source or a manual. **INFERRED** = reasoned from evidence, with the evidence named. **FOLKLORE** = community consensus with no primary backing.

---

## What is solid

Six things came back with hard primary evidence and no ambiguity.

1. **The canonical vertical arcade playfield is 240x320 (aspect 0.75).** DoDonPachi, ESP Ra.De., Guwange, Mushihimesama, Espgaluda II, Pink Sweets, Battle Garegga: all are a 320x240 raster rotated 270 degrees. This is straight out of the MAME driver source. Touhou is the outlier at 384x448 (0.857), and it is a windowed PC game, not an arcade board.

2. **A 540x760 playfield has aspect 0.711, which is squarely inside convention** (Psikyo's 224x320 = 0.700, CAVE's 240x320 = 0.750). The aspect is not the problem. The **linear scale** is: 540 is 2.25x a CAVE playfield and 1.41x a Touhou playfield, so 540x760 has roughly **5x the area of a DoDonPachi screen**. Anything sized by eye against a mental image of an arcade shmup will read as too chunky by about that factor.

3. **The lethal contact radius converges on about 1% of playfield width across both schools.** Touhou EoSD: 0.85% of W. DoDonPachi: 1.25% of W. These two games take opposite approaches to get there (Touhou gives the player a 2.5px box and bullets a 4-32px box; DoDonPachi gives the player a 6x7px box and bullets a **zero-size point**), and they still land within 50% of each other. On a 540-wide field that is a lethal contact radius of **4.6 to 6.8 logical units**, i.e. a kill footprint 9 to 14 units across.

4. **Bullet sprites are drawn 2x to 4x larger than their collision boxes, and this is in the source, not folklore.** EoSD's bullet table buckets bullets by sprite height (8, 16, 32, >32 px) and assigns collision boxes of 4, 6, 16 and 32 px respectively, with special cases as small as 4px for a 16px rice sprite. The visible bullet is between 2x and 4x its own hitbox in linear terms, meaning **4x to 16x in area**.

5. **The thing that kills is small; the thing that does the killing is large.** In EoSD the player's own shot boxes are 32-48px (8.3-12.5% of W) while the player's vulnerable box is 2.5px (0.65% of W): a factor of ~15 in linear size between the player's offensive and defensive footprints. Item pickup is 24px (6.3% of W), also ~10x the kill box.

6. **Density is bought with a reserved colour palette, and a developer says so on the record.** CAVE's Hiroyuki Tanaka: "Our games use a lot of pink, blue, and colorful bullet patterns, so I try not to use those colors in the backgrounds. I also avoid using the orange colors of explosions." Bullet hues are protected; everything else is painted around them. Touhou's own hard cap is 640 bullets and 64 lasers, which in a 384x448 field is one object per 16x16 px cell at absolute saturation.

What is **not** solid: there is no documented numeric rule for how much free space a player needs to weave. I searched for it specifically and found only qualitative treatments. Section 4 says what I found and gives an explicitly inferred number instead.

---

## 1. Playfield dimensions and aspect

### Finding 1.1 - CAVE first-generation hardware: 240x320 portrait
- **Claim:** DoDonPachi, ESP Ra.De., Dangun Feveron and Guwange all render a 320x240 raster displayed rotated 270 degrees, giving a 240 wide x 320 tall play area.
- **Number:** `m_screen[0]->set_size(320, 240); m_screen[0]->set_visarea(0, 320-1, 0, 240-1);` in `cave_state::add_base_config`, and every one of those games is registered `ROT270`. Refresh is `15625/271.5` Hz (~57.55 Hz). Aspect W:H = 240:320 = **0.750**.
- **Source:** https://raw.githubusercontent.com/mamedev/mame/master/src/mame/atlus/cave.cpp (lines ~2162-2163 for the screen config; lines 5645, 5651, 5655, 5664 for the ROT270 game registrations)
- **Label:** DOCUMENTED

### Finding 1.2 - CAVE third-generation hardware (CV1000): also 240x320
- **Claim:** Mushihimesama, Mushihimesama Futari, Espgaluda II, Ibara and Pink Sweets run on CV1000 at the same effective play area.
- **Number:** `screen.set_raw(12.8_MHz_XTAL / 2, 407, 0, 320, 262, 0, 240);` with a MAME comment reading "Measured from futari15 PCB. 262 total lines... Each line is 407 pixels... Framerate is 60.0183806291 Hz". All the shooters in the driver are `ROT270`. So: **240x320, 60.018 Hz**.
- **Source:** https://raw.githubusercontent.com/mamedev/mame/master/src/mame/cave/cv1k.cpp (lines 587-592, 1104-1135)
- **Label:** DOCUMENTED

### Finding 1.3 - Raizing / 8ing (Battle Garegga, Battle Bakraid): 240x320
- **Claim:** The Raizing GP9001-based boards use the same geometry as CAVE.
- **Number:** `m_screen->set_raw(27_MHz_XTAL/4, 432, 0, 320, 262, 0, 240);`, games registered `ROT270`. **240x320**.
- **Source:** https://raw.githubusercontent.com/mamedev/mame/master/src/mame/toaplan/raizing.cpp (lines 733, 780, 1271-1277)
- **Label:** DOCUMENTED

### Finding 1.4 - Psikyo (Gunbird, Strikers 1945): 224x320, a taller playfield
- **Claim:** Psikyo's vertical shooters use a narrower play area than CAVE's.
- **Number:** `m_screen->set_visarea(0, 320-1, 0, 256-32-1);` = 320x224 raster, `ROT270` = **224 wide x 320 tall**. Aspect **0.700**.
- **Source:** https://raw.githubusercontent.com/mamedev/mame/master/src/mame/psikyo/psikyo.cpp (lines 1213, 2106, 2113)
- **Label:** DOCUMENTED
- **Why this one matters:** 0.700 is the closest canonical aspect to the 540:760 = 0.711 currently in use.

### Finding 1.5 - Raiden: 224x256, nearly square
- **Claim:** Seibu's Raiden has a markedly squarer play area than the later danmaku games.
- **Number:** `screen.set_visarea(0*8, 32*8-1, 2*8, 30*8-1);` = 256x224 raster, `ROT270` = **224 wide x 256 tall**. Aspect **0.875**.
- **Source:** https://raw.githubusercontent.com/mamedev/mame/master/src/mame/seibu/raiden.cpp (lines 746, 1227)
- **Label:** DOCUMENTED

### Finding 1.6 - Ikaruga: 480x640
- **Claim:** Ikaruga on NAOMI runs at VGA rotated.
- **Number:** 640x480 at 61.702586 Hz, ROT270, so **480 wide x 640 tall**. Aspect **0.750**, the same as CAVE, at exactly double the linear resolution.
- **Source:** http://adb.arcadeitalia.net/dettaglio_mame.php?game_name=ikaruga
- **Label:** DOCUMENTED (arcade database mirroring MAME's machine definition; not read from source directly)

### Finding 1.7 - Touhou: a 384x448 playfield inside a 640x480 window, with a 224px HUD sidebar
- **Claim:** Touhou's play area is a defined sub-rectangle of the window, not the whole window. This is the single most transferable layout fact for a game that wants a HUD.
- **Number:** From the EoSD decompilation:
  - `#define GAME_REGION_WIDTH 384.0` and `#define GAME_REGION_HEIGHT 448.0`
  - `mgr->arcadeRegionTopLeftPos.x = 32.0; ...y = 16.0; ...Size.x = 384.0; ...Size.y = 448.0;`
  - Window is 640x480, so the HUD sidebar to the right of the playfield is `640 - 32 - 384` = **224 px wide, 35% of the window**. The bottom margin is 16 px.
  - Playfield aspect **384:448 = 0.857**.
- **Source:** https://github.com/GensokyoClub/th06 - `src/GameManager.hpp` lines 46-47, `src/GameManager.cpp` lines 286-289 and 611-614
- **Label:** DOCUMENTED
- **Contrast worth noting:** CAVE games have no sidebar. Score, lives and bombs are drawn *over* the play area, so the full 240x320 is playable space. Touhou spends more than a third of its window width on chrome. Two legitimate conventions, and the choice changes how much playfield you get per screen pixel.

### Summary of playfield geometry

| Game / hardware | Play area (W x H) | Aspect W:H | Ratio to 540x760 |
|---|---|---|---|
| Raiden (Seibu) | 224 x 256 | 0.875 | 540/224 = 2.41x |
| CAVE 1st gen (DoDonPachi, ESP Ra.De., Guwange) | 240 x 320 | 0.750 | 2.25x |
| CAVE CV1000 (Mushihimesama, Espgaluda II) | 240 x 320 | 0.750 | 2.25x |
| Raizing (Battle Garegga) | 240 x 320 | 0.750 | 2.25x |
| Psikyo (Gunbird, Strikers 1945) | 224 x 320 | 0.700 | 2.41x |
| Touhou (Windows era) | 384 x 448 | 0.857 | 1.41x |
| Ikaruga (NAOMI) | 480 x 640 | 0.750 | 1.13x |
| **Hungry Grave (current)** | **540 x 760** | **0.711** | 1.00x |

---

## 2. Object scale relative to playfield

All EoSD figures below come from the GensokyoClub decompilation of Touhou 6 v1.02h. Two conventions matter when reading the source: `Player::hitboxSize` is a **half-extent** (`hitboxTopLeft = positionCenter - hitboxSize`), while bullet `grazeSize` and enemy `hitboxDimensions` are **full sizes** (`ZunVec3::SetVecCorners` divides by 2). I have normalised everything to full box sizes.

### Finding 2.1 - Touhou player kill box: 2.5 x 2.5 px = 0.65% of playfield width
- **Claim:** The EoSD player's vulnerable box is a 2.5px square, one of the smallest collision volumes in any action game.
- **Number:** `p->hitboxSize.x = 1.25; p->hitboxSize.y = 1.25;` half-extents, so a **2.5 x 2.5 px AABB** in a 384-wide field = **0.0065 W**.
- **Source:** https://github.com/GensokyoClub/th06 - `src/Player.cpp` lines 107-109
- **Label:** DOCUMENTED

### Finding 2.2 - Touhou bullet collision boxes: 4 to 32 px, assigned by sprite height
- **Claim:** EoSD assigns each bullet type a square collision box chosen from the bullet's sprite height, with hand-tuned exceptions per bullet art.
- **Number:** From `BulletManager::InitializeToZero`, branching on `spriteBullet.sprite->heightPx`:

  | Sprite height | Bullet art | Collision box (full) | as fraction of W=384 |
  |---|---|---|---|
  | <= 8 px | any | 4 px | 0.0104 |
  | <= 16 px | rice | 4 px | 0.0104 |
  | <= 16 px | kunai | 5 px | 0.0130 |
  | <= 16 px | shard | 4 px | 0.0104 |
  | <= 16 px | default | 6 px | 0.0156 |
  | <= 32 px | fireball | 11 px | 0.0286 |
  | <= 32 px | dagger | 9 px | 0.0234 |
  | <= 32 px | default | 16 px | 0.0417 |
  | > 32 px | any | 32 px | 0.0833 |

- **Source:** https://github.com/GensokyoClub/th06 - `src/BulletManager.cpp` lines 1382-1431
- **Label:** DOCUMENTED

### Finding 2.3 - Touhou bullet sprites are 2x to 4x their collision boxes
- **Claim:** The visible bullet is substantially larger than the thing that kills you, and the source proves it because the collision box is *derived from* the sprite height.
- **Number:** The bucket boundaries are literally sprite heights of 8, 16 and 32 px. So an 8px sprite carries a 4px box (**2.0x linear, 4x area**); a 16px rice sprite carries a 4px box (**4.0x linear, 16x area**); a 16px generic sprite carries a 6px box (**2.7x linear**); a 32px sprite carries a 16px box (**2.0x linear**). The disparity narrows for the very largest bullets (>32px sprite, 32px box).
- **Source:** https://github.com/GensokyoClub/th06 - `src/BulletManager.cpp` lines 1381-1431
- **Label:** DOCUMENTED for the collision boxes and the bucket boundaries; INFERRED that the actual sprite heights sit exactly at 8/16/32 rather than just below those thresholds (the code only proves `<=`).

### Finding 2.4 - Touhou graze radius: a flat 20px margin around every bullet
- **Claim:** Grazing is implemented as a fixed spatial dilation of the bullet, not as a property of the player.
- **Number:** `Player::CheckGraze` inflates the bullet box by **20.0 px on every side** before testing against the player box: `bulletTopLeft.x = center->x - size->x / 2.0f - 20.0f;` and so on. For a small (4px) bullet the graze region is therefore 44x44 px around the bullet centre, i.e. **0.115 W**, versus a 4px kill box at 0.0104 W. **The graze zone is ~11x the linear size of the kill zone.**
- **Source:** https://github.com/GensokyoClub/th06 - `src/Player.cpp` lines 1197-1244
- **Label:** DOCUMENTED

### Finding 2.5 - Touhou enemy hitboxes: 12x12 default, 8x8 for body contact
- **Claim:** A generic popcorn enemy is a 12px square target, and touching an enemy uses a smaller box than shooting one.
- **Number:** `enemy->hitboxDimensions = D3DXVECTOR3(12.0f, 12.0f, 12.0f);` on spawn (ECL scripts can override per enemy). For player-shot damage the full 12x12 is used; for the enemy killing the player by contact, `enemyHitbox = curEnemy->hitboxDimensions / 1.5;` = **8x8**. As fractions of W=384: **0.031** and **0.021**.
- **Source:** https://github.com/GensokyoClub/th06 - `src/EnemyManager.cpp` lines 50, 588, 597
- **Label:** DOCUMENTED

### Finding 2.6 - Touhou player shot boxes: 32-48 px, and item grab 24 px
- **Claim:** The player's offensive and collection footprints are one to two orders of magnitude larger than the player's vulnerable footprint.
- **Number:** Marisa's orb bullets grow through `bullet->size` values of **32, 42, 48, 48 px** (0.083 to 0.125 W). Item pickup box is `grabItemSize` half-extent 12.0, i.e. a **24x24 px box** (0.0625 W). Against a 2.5px kill box (0.0065 W) that is a **12.8x to 19.2x linear ratio** for shots, and **9.6x** for pickups.
- **Source:** https://github.com/GensokyoClub/th06 - `src/Player.cpp` lines 110-112, 396-409
- **Label:** DOCUMENTED

### Finding 2.7 - Touhou player speed: 4 px/frame unfocused, 2 px/frame focused
- **Claim:** Movement speed, normalised to playfield width, is the number that actually governs whether an object size feels chunky, because it sets how long crossing the field takes.
- **Number:** `g_CharData` gives Reimu `{4.0, 2.0, 4.0, 2.0}` and Marisa `{5.0, 2.5, 5.0, 2.5}` (orthogonal, orthogonal-focused, and their duplicates); diagonal is derived as `speed / sqrt(2)`. At 60 fps in a 384-wide field:
  - Reimu unfocused: 4 px/f = **0.0104 W per frame = 0.625 W per second**; a full-width traverse takes **1.6 s**.
  - Reimu focused: 2 px/f = **0.3125 W/s**; traverse **3.2 s**.
  - Player spawns at `(W/2, H - 64)`, i.e. 64 px = **0.167 W** up from the bottom edge.
- **Source:** https://github.com/GensokyoClub/th06 - `src/Player.cpp` lines 27-32, 98-99, 115-116
- **Label:** DOCUMENTED

### Finding 2.8 - DoDonPachi player hitbox: 6x7 px = 2.5% of playfield width
- **Claim:** CAVE's player hitbox is roughly four times larger relative to the playfield than Touhou's, and it changes shape with movement.
- **Number:** "Default position: 6x7 pixels. Leaning towards one side: 5x7 pixels. Fully moving horizontally: 4x7 pixels." In a 240-wide field: **0.025 W x 0.029 W** default, narrowing to 0.017 W wide at full horizontal speed. The reverse-engineering notes phrase the same thing as "This player ship hitbox is 7x6 pixels and shrinks down to 7x4 when moving horizontally" and locate it at RAM address 0x102c9c (P1) / 0x102cdc (P2).
- **Source:** https://www.shmups.wiki/library/DoDonPachi and https://epozzobon.it/re/ddonpach/
- **Label:** DOCUMENTED (reverse-engineered from the ROM, with two independent sources agreeing)

### Finding 2.9 - DoDonPachi enemy bullets have a ZERO-size hitbox
- **Claim:** In DoDonPachi, collision is the player's rectangle against the bullet's **centre point**. Bullet visual size is decoupled from lethality entirely, and every bullet regardless of art is the same threat.
- **Number:** "All enemy bullets have the same 0x0 hitbox." The Shmups Wiki independently states "Despite the variety in bullet visuals, all bullets in DoDonPachi share the **same hitbox size**", and notes the same property holds in DoDonPachi DaiOuJou and Ketsui.
- **Source:** https://epozzobon.it/re/ddonpach/ and https://www.shmups.wiki/library/DoDonPachi
- **Label:** DOCUMENTED
- **Why this matters here:** it is the cleanest possible statement of the genre's core trick. A CAVE bullet sprite might be 16px of glowing colour in a 240px-wide field (6.7% of W) while carrying **zero** collision area. The disparity between what you see and what can kill you is not 2x or 4x, it is infinite.

### Finding 2.10 - The two schools converge on ~1% of playfield width as the lethal contact radius
- **Claim:** Despite opposite architectures, Touhou and DoDonPachi put the effective centre-to-centre lethal distance in the same place once normalised.
- **Number:** Both games use AABB overlap, so the lethal centre-to-centre distance on an axis is (half player box + half bullet box):
  - Touhou vs a small bullet: 1.25 + 2.0 = **3.25 px** in 384 = **0.0085 W**
  - Touhou vs a large (16px) bullet: 1.25 + 8.0 = 9.25 px = 0.024 W
  - DoDonPachi vs any bullet: 3.0 + 0 = **3.0 px** in 240 = **0.0125 W**
- **Source:** computed from Findings 2.1, 2.2, 2.8, 2.9
- **Label:** INFERRED (arithmetic on documented constants; the convergence itself is my observation, not anyone's stated design rule)

### Finding 2.11 - Player *sprite* sizes
- **Claim:** The player's visible body is roughly 8-13% of playfield width in both schools.
- **Number:** I could not find a primary source stating sprite pixel dimensions for either EoSD or DoDonPachi. Community sprite rips put EoSD's player frames at roughly 32x48 px (**0.083 W x 0.125 W**) and DoDonPachi's ships at roughly 32px wide in a 240 field (**0.133 W**). Secondary support for the general shape of the claim: "Your ship or character on screen might be 30-40 pixels tall, but the actual collision point... is usually just a few pixels around your character's center."
- **Source:** https://www.spriters-resource.com/pc_computer/touhoukoumakyoutheembodimentofscarletdevil/sheet/33545/ (sprite sheets, dimensions not stated in text); the quote is from https://dinogame.gg/blog/what-is-a-bullet-hell/
- **Label:** FOLKLORE for the specific pixel numbers. Treat 0.08-0.13 W as a plausible band, not a measurement. The **ratio** claim (sprite is roughly 10x the kill box) is DOCUMENTED for Touhou by Findings 2.1 and 2.6.

### Ratio table, normalised to playfield width W

| Object | Touhou EoSD (W=384) | as W | DoDonPachi (W=240) | as W |
|---|---|---|---|---|
| Player kill box (full) | 2.5 px | **0.0065** | 6 x 7 px | **0.025 x 0.029** |
| Player visible sprite | ~32 x 48 px | ~0.083 x 0.125 | ~32 px | ~0.133 |
| Effective lethal contact radius | 3.25 px | **0.0085** | 3.0 px | **0.0125** |
| Small bullet collision box | 4 px | **0.0104** | 0 px (point) | **0** |
| Medium bullet collision box | 6 px | 0.0156 | 0 px | 0 |
| Large bullet collision box | 16 px | 0.0417 | 0 px | 0 |
| Small bullet sprite | ~8 px | ~0.021 | n/a | n/a |
| Medium bullet sprite | ~16 px | ~0.042 | n/a | n/a |
| Large bullet sprite | ~32 px | ~0.083 | n/a | n/a |
| Popcorn enemy hit box | 12 px | **0.031** | n/a | n/a |
| Enemy body-contact box | 8 px | 0.021 | n/a | n/a |
| Player shot damage box | 32-48 px | 0.083-0.125 | n/a | n/a |
| Item grab box | 24 px | 0.0625 | n/a | n/a |
| Graze dilation (per side) | 20 px | **0.052** | n/a (no graze) | n/a |
| Player speed, free | 4 px/frame | **0.0104 W/f = 0.625 W/s** | n/a | n/a |
| Player speed, focused | 2 px/frame | 0.0052 W/f = 0.313 W/s | n/a | n/a |
| Spawn height above bottom | 64 px | 0.167 | n/a | n/a |

---

## 3. Density and readability

### Finding 3.1 - CAVE reserves the bullet hues and paints the background around them
- **Claim:** This is the strongest primary citation in the whole report: a CAVE staff designer stating that bullet colours are a protected palette and the background art is constrained to stay out of them, explosions included.
- **Rule:** Hiroyuki Tanaka: "The first thing I'm careful to do when designing a map is to make sure that the bullet patterns, which are Cave's games' selling point, are easy to see." And concretely: "Our games use a lot of pink, blue, and colorful bullet patterns, so I try not to use those colors in the backgrounds. I also avoid using the orange colors of explosions."
- **Source:** https://shmuplations.com/cavestghistory/
- **Label:** DOCUMENTED (developer statement, translated interview)

### Finding 3.2 - CAVE accepted that bullets win the layer war over character art
- **Claim:** Density is bought at the cost of legibility of everything that is not a bullet, and CAVE knew it and shipped it anyway.
- **Rule:** Junya Inoue: "The bullets and effects are so thick you can't see the character art! It's a shame, especially with small bosses..."
- **Source:** https://shmuplations.com/guwange/
- **Label:** DOCUMENTED (developer statement)

### Finding 3.3 - The tiny hitbox and the high bullet count are one design, and the tiny hitbox was an accident
- **Claim:** Ikeda states the pairing explicitly, and separately reveals that the genre-defining small hitbox originated by accident in an inherited sample program.
- **Rule:** Ikeda: "The enemies that fire lots of bullets and the small hitbox that makes it hard to die, both synergize to multiply the thrill of dodging." On its origin: "The senior programmer who made the sample program probably didn't do that deliberately... the hitbox for the player ship was tiny."
- **Source:** https://shmuplations.com/cave15th/
- **Label:** DOCUMENTED (developer statement)

### Finding 3.4 - Screen space for patterns is bought by shrinking everything else, including the final boss
- **Claim:** When CAVE needed room for bullet patterns they shrank the object competing for that room.
- **Rule:** Ikeda: "The whole reason I made the last boss Hibachi so small is that I wanted more space on the screen to create those beautiful bullet patterns (and due to memory limitations, you see, that was the only way)."
- **Source:** https://shmuplations.com/dodonpachi2/
- **Label:** DOCUMENTED (developer statement)

### Finding 3.5 - Bullet rendering: light and dark values side by side, midtone backgrounds, strict draw order
- **Claim:** The most complete public technical breakdown of danmaku bullet legibility, and it converges with Tanaka's statement in 3.1.
- **Rules, verbatim:**
  - "danmaku games must have exceptionally good visibility to guarantee a fair, non-frustrating player experience."
  - "While looking at the values of different bullet sprites, you may notice a pattern, they put light & dark values side-by-side" (bright glowing core against a dark border, so local contrast holds regardless of background).
  - "there are good reasons why so many danmaku games settled on reds, pinks and purples, they are less likely to clash with commonly used colours, unlike traditional yellow and orange bullets which tend to overlap with explosions & golden items."
  - "Low contrast backgrounds that rely primarily on midtones also help with visibility since they let you freely use extreme values for important elements."
  - **Draw order:** "Enemy bullets should always be drawn on top of other game objects such as player sprites, projectiles, items and explosions. Use bullet size and speed to inform their depth. Smaller, faster bullets should be drawn over bigger, slower bullets."
  - **Chunking:** "Chunking patterns is vital for visibility... single stray bullets are hard to read and can often feel unfair."
- **Source:** https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101
- **Label:** FOLKLORE by strict standard (a practising shmup developer reasoning from disassembled sprite sheets, not a citation of a developer statement), but the colour-reservation half is independently DOCUMENTED by Tanaka in 3.1.

### Finding 3.6 - The "core plus halo" convention: the visible core hints at the hitbox
- **Claim:** Bullets often carry a differently-coloured inner region that approximates the true hitbox, and player craft carry an equivalent tell.
- **Rule:** "Bullets may also have their hitboxes indicated via a different colored region toward the center of the bullet, that more closely matches its true hitbox." On the player: "developers will often add some sort of visual feature to hint at hitbox location, such as a bright cockpit on a ship, an ornament on a character's back, or even displaying the hitbox itself with a small dot."
- **Source:** https://shmups.wiki/library/Help:Glossary
- **Label:** FOLKLORE (wiki glossary, no primary source). The *practice* is visible in every game in the genre; the *statement* has no developer backing.

### Finding 3.7 - Touhou's graze aura is 20px on every side, and bombs clear using the same dilated box
- **Claim:** Grazing and bomb-clearing are both implemented as a fixed 20px spatial dilation of the bullet, making both affordances deliberately far coarser than dodging.
- **Number:** `Player::CheckGraze` builds `bulletTopLeft.x = center->x - size->x / 2.0f - 20.0f` and the matching three edges. Each bullet grazes once (latched). Bomb projectiles are tested against that same dilated box, and a hit returns 2, which despawns the bullet. So for a 4px bullet the graze band is 44px across (**0.115 W**) against a 4px kill box (**0.0104 W**): the forgiving affordance is ~11x the linear size of the lethal one.
- **Source:** https://github.com/GensokyoClub/th06/blob/master/src/Player.cpp (lines 1197-1244)
- **Label:** DOCUMENTED (decompiled source)

### Finding 3.8 - Touhou's hard caps: 640 bullets, 64 lasers
- **Claim:** A concrete upper bound on simultaneous danmaku objects in a 384x448 field.
- **Number:** `Bullet bullets[640]; Laser lasers[64];`
- **Source:** https://github.com/GensokyoClub/th06/blob/master/src/BulletManager.hpp
- **Label:** DOCUMENTED (decompiled source)
- **Normalised:** 640 bullets in 384x448 = 172,032 px^2 is one bullet per 269 px^2, i.e. one bullet per 16x16 px cell at absolute saturation. Scaled to 540x760 = 410,400 px^2, the equivalent saturation cap is **~1,525 objects**. This is a ceiling, not a target; typical play is far below it.

### Finding 3.9 - CAVE's slowdown is an emergent per-object cost, and it was preserved deliberately
- **Claim:** The famous CAVE slowdown under heavy bullet load is not a sprite-per-scanline hardware limit, it is per-object blitter time, and CAVE treated it as a gameplay feature worth reproducing.
- **Rule:** CV1000 has no hardware sprites at all; it is a blitter and framebuffer machine at 15-bit RGB. "A blitter object is something that takes CPU time and blitter copy time for each individual BOB. This means that blitter-based systems are inherently more prone to slowdown than sprite-based systems." Asada, on the HD port: "If it weren't [slowed down], you wouldn't be able to dodge the bullets."
- **Source:** https://nicole.express/2022/games-made-in-a-cave.html and https://shmuplations.com/mushihimesamahd/
- **Label:** DOCUMENTED (hardware teardown plus developer statement)

### Finding 3.10 - The wiki's "larger bullets have proportionally smaller hitboxes" rule is wrong
- **Claim:** Touhou Wiki states "the general rule being that larger bullets have a smaller ratio of hitbox to image than small bullets". The decompiled table does not support it.
- **Number:** The default ratios by sprite-height bucket are 4/8 = 50%, then 6/16 = 37.5%, then 16/32 = 50%: non-monotonic. Only the hand-listed pointy shapes are proportionally tighter (kunai 5 on a 16px sprite = 31%, dagger 9 on a 32px sprite = 28%, rice and shard 4 on a 16px sprite = 25%).
- **Source:** wiki claim at https://en.touhouwiki.net/wiki/Hitbox versus source at https://github.com/GensokyoClub/th06/blob/master/src/BulletManager.cpp
- **Label:** DOCUMENTED that the source contradicts the wiki. **The real rule is: collision is roughly half the drawn sprite, and oblong or pointy shapes get a much tighter box because their long axis is a direction cue rather than a threat.**

### Finding 3.11 - Whether CAVE bullets are truly all point-sized is contested
- **Claim:** The forum consensus that every CAVE bullet is a centre-point collision is disputed by people who have looked closely.
- **Rule:** "All cave bullets only check collision by the center pixel. No matter how much their sprite sizes may differ." Immediately answered with "all cave bullets, except like half of them", naming DoDonPachi stage 5 boss fireballs, DoDonPachi DaiFukkatsu laser spheres, and all Yagawa-directed games as exceptions.
- **Source:** https://shmups.system11.org/viewtopic.php?f=1&t=38284
- **Label:** FOLKLORE on both sides. What survives the disagreement, and is DOCUMENTED for DoDonPachi specifically by Finding 2.9, is that CAVE boxes are far smaller than the sprites and cannot be estimated by eye.

### Finding 3.12 - Academic framing exists, but not for readability
- **Claim:** There is published research on danmaku difficulty, none on readability.
- **Number/rule:** Khalifa, Lee, Nealen and Togelius, "Talakat: Bullet Hell Generation through Constrained Map-Elites", GECCO 2018, generates danmaku patterns and scores them with a best-first-search agent along **strategy** and **dexterity** axes.
- **Source:** https://arxiv.org/abs/1806.04718
- **Label:** DOCUMENTED as existing; relevant to difficulty measurement, not to object scale.
- **Negative results worth recording:** no GDC talk on bullet-hell readability was found; no published maximum bullet count exists for DoDonPachi or Mushihimesama Ultra; and no developer statement was found giving the rationale for graze, focus mode, or bullet cancel (ZUN's interviews cover spell cards and pattern variety instead). Do not let invented numbers for these into the design record.

---

## 4. Maneuvering space

### Finding 4.1 - There is no documented numeric convention for gap size
- **Claim:** I searched specifically for a "one-hitbox gap" rule, a bullet-spacing-to-hitbox ratio, or any published numeric guideline, and found none in primary or high-quality secondary material.
- **Source:** negative result across Sparen's Danmaku Design Studio (the most systematic public treatment of danmaku pattern design), Boghog's bullet hell shmup 101 on shmups.wiki, and the CAVE/Touhou developer interview archive.
- **Label:** DOCUMENTED as an absence. If someone quotes you a "one hitbox gap" rule, it is FOLKLORE.

### Finding 4.2 - The closest documented concept is the "wall": a formation with no passable gap
- **Claim:** The design literature treats passability as binary and geometric, not as a ratio.
- **Number/rule:** Sparen defines a wall as "any Group or formation of bullets where a player cannot move through the constituent bullets", and derives passability from **spread angle** and **ring radius** rather than from any fixed spacing. He also separates **macrododging** ("bullets in tight formation requiring significant player movement", focus on the pattern as a whole) from **micrododging** ("bullet arrays that require the player... to focus deeply on a small area of the screen"), and notes micrododging requires slow-moving bullets because "fast bullets and streaming are NOT considered micrododging".
- **Source:** https://sparen.github.io/ph3tutorials/ddsga4.html and https://sparen.github.io/ph3tutorials/ddsga2.html
- **Label:** DOCUMENTED as a definition; the guides state explicitly that there is no formula.

### Finding 4.3 - Gaps in radial patterns widen with travel distance, and that is the design lever
- **Claim:** Danmaku patterns are not designed with a target gap size; they are designed so the gap *becomes* passable at the distance the player is standing.
- **Rule:** "walls start really tiny at the origin, and then expand as they travel outwards. The gaps start off too tight to squeeze through, but as the walls spread out, the gaps widen and become dodgeable."
- **Source:** community synthesis surfaced via search, consistent with Sparen's spread-angle/ring-radius treatment above.
- **Label:** FOLKLORE for the phrasing, DOCUMENTED in substance by Sparen's ring-radius analysis.

### Finding 4.4 - Movement speed must be tuned to play-area size, and large play areas force high bullet counts
- **Claim:** This is the single most load-bearing statement I found for the question actually being asked, and it is a direct claim about the relationship between playfield size and object density.
- **Rule:** "A game's movement speed and shot type has to be tuned to match the size of the play area, narrow areas can afford to (and can benefit from) slower move speeds and narrow shot types to emphasise small differences in positioning and give enemies time to do their thing (examples: Gunbird 2, Dragon Blaze). Wider play areas tend to use faster speeds, wider shots or some kind of multi directional weapons to compensate for the large distances the player has to travel (examples: Mars Matrix, Under Defeat HD)." And: "The tiny hitboxes of Danmaku games make for relatively large play areas which allows them to fill the screen with bullets. This has downsides however - large play areas funnel games into relying on lots of projectiles for challenge."
- **Source:** https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101
- **Label:** FOLKLORE by strict standard (a respected community author on a community wiki, not a developer), but it is the most carefully argued statement of the principle in public writing and it is consistent with every measurement in section 2.

### Finding 4.5 - An inferred minimum gap, since no documented one exists
- **Claim:** Geometry alone bounds the answer from below.
- **Number:** A gap between two bullets is *geometrically* passable when the centre-to-centre spacing exceeds (bullet box + player box). Using the Touhou figures: 4 + 2.5 = 6.5 px = **0.017 W** as the absolute floor. Using DoDonPachi: 0 + 6 = 6 px = **0.025 W**. For a gap that is *comfortably* dodgeable rather than frame-perfect, the player needs room to arrive and leave, which at Touhou's focused speed of 2 px/frame over a ~6 frame reaction-and-commit window is another ~12 px each way. That puts a comfortable gap at roughly **0.05-0.07 W**, or 3-4x the geometric floor.
- **Source:** arithmetic on Findings 2.1, 2.2, 2.7, 2.8
- **Label:** INFERRED. No one publishes this number. The reaction-window assumption is mine and is the weak link.

---

## What this implies for a 540x760 portrait playfield

**The aspect is fine.** 0.711 sits between Psikyo's 0.700 and CAVE's 0.750. Nothing to change there.

**The scale is the issue, and the multiplier is 2.25x.** A 540-wide field is 2.25 canonical CAVE playfields across and roughly **5 times the area**. Any object sized by intuition against a remembered arcade screen will be too chunky by about that factor, and the error compounds in area, which is exactly what "not enough density" feels like.

### Ratio-derived target sizes at W=540, H=760

| Object | Ratio to W | Target at 540 wide | Basis |
|---|---|---|---|
| Player lethal footprint (radius) | 0.0085-0.0125 | **4.6 to 6.8 units** | Finding 2.10, both schools |
| Player lethal footprint (full box) | 0.017-0.025 | **9 to 14 units across** | same |
| Player visible sprite | 0.08-0.13 | **45 to 70 units wide** | Finding 2.11 (soft) |
| Popcorn enemy hit box | 0.031 | **17 units** | Finding 2.5 |
| Popcorn enemy body-contact box | 0.021 | **11 units** | Finding 2.5 |
| Popcorn enemy sprite | ~0.083 | **~45 units** | Finding 2.3 bucket, soft |
| Small bullet / small projectile sprite | 0.021 | **11 units** | Finding 2.3 |
| Small bullet collision box | 0.0104 | **5.6 units** | Finding 2.2 |
| Medium bullet sprite | 0.042 | **23 units** | Finding 2.3 |
| Medium bullet collision box | 0.0156 | **8.4 units** | Finding 2.2 |
| Large bullet sprite | 0.083 | **45 units** | Finding 2.3 |
| Large bullet collision box | 0.042 | **23 units** | Finding 2.2 |
| Pickup / collection radius | 0.063 | **34 units** | Finding 2.6 |
| Graze / near-miss dilation per side | 0.052 | **28 units** | Finding 2.4 |
| Geometric floor for a passable gap | 0.017-0.025 | **9 to 14 units** | Finding 4.5 |
| Comfortable dodge gap | 0.05-0.07 | **27 to 38 units** | Finding 4.5 (inferred) |
| Player traverse speed, free | 0.625 W/s | **338 units/s**, full width in 1.6 s | Finding 2.7 |
| Player traverse speed, precise | 0.313 W/s | **169 units/s**, full width in 3.2 s | Finding 2.7 |
| Player rest position above bottom edge | 0.167 | **90 units** | Finding 2.7 |

### The four rules that transfer, in order of confidence

1. **A "small" object in a 540-wide field is about 11 units, not 30.** The genre's small-bullet sprite is 2.1% of playfield width. At 540 that is 11 logical units. If Hungry Grave's corpses, projectiles or minions are drawn at 30-50 units, they are sitting at the genre's **large-bullet** size, and a screen of large bullets is by construction a screen with room for very few of them. This is the direct, testable answer to "objects feel too chunky": divide each object's current width by 540 and compare it to the ratio column above.

2. **Collision must be far smaller than the art, and the gap is 2x to 4x linear (4x to 16x by area).** This is the single most consistently documented technique in the genre, and DoDonPachi takes it to the limit with literally zero-area bullets. If Hungry Grave's collision boxes currently match its sprite bounds, shrinking collision alone will buy a large increase in perceived density without touching a single sprite, because the screen can then be much fuller before it becomes unfair.

3. **The playfield has to be crossable in about 1.5 to 3 seconds.** Touhou's 384-wide field crosses in 1.6 s free and 3.2 s focused. At 540 units that means roughly **340 units/s** for free movement and **170 units/s** for precise movement. If the grave moves much slower than that in a field this size, the fix is not smaller objects, it is that the field is functionally larger than it looks, which is exactly the failure mode Boghog names: a large play area forces you to fill it with projectiles to keep it interesting.

4. **Smaller objects only read as a storm if the palette is reserved for them and the draw order is fixed.** Once objects drop to 11-23 units, size stops carrying the signal and colour and contrast have to. The documented technique is Tanaka's: pick the hues that mean "threat" and "reward", then forbid those hues in the background and in explosion art. Boghog's supporting rules are that each object should put a light value directly beside a dark one so it holds contrast against anything behind it, that the background should live in midtones so extreme values stay available to gameplay objects, and that the threatening layer draws on top of everything with smaller and faster objects above bigger and slower ones. Chunking matters too: a lone stray object is hard to read and reads as unfair, whereas a legible group of them reads as a storm. This is the half of the density problem that shrinking the sprites will not solve on its own.
