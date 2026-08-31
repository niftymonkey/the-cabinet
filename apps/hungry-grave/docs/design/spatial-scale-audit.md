# Hungry Grave: spatial scale inventory

Read-only audit of `apps/hungry-grave` on branch `feat/76-territory` (tip `c35d79de72`). Every number below is quoted from source with a `file:line` citation. All paths are relative to `/home/mlo/dev/niftymonkey/the-cabinet/apps/hungry-grave`.

Units: "field units" (fu) throughout the sim. `TICK_HZ = 60` (`src/game/clock.ts:4`), so a per-tick magnitude times 60 is per second.

---

## 1. The field

### Declared constants

| Constant | Value | Declared at |
|---|---|---|
| `FIELD_WIDTH` | `540` | `src/game/field.ts:10` |
| `FIELD_HEIGHT` | `760` | `src/game/field.ts:11` |
| `FieldPoint` (x, y in field units) | type | `src/game/field.ts:19-22` |

The file's own header says these are ADR 0003 and explicitly **not** tunable (`src/game/field.ts:1-9`). Aspect ratio is 540:760 = 0.7105, i.e. 1:1.4074 (close to but not exactly 9:16 = 0.5625, nor 3:4 = 0.75).

### Field-level geometry derived from them

| Constant | Expression | Value | Declared at |
|---|---|---|---|
| `BASE_SPEED` (grave speed) | `FIELD_WIDTH / (2 * TICK_HZ)` | `4.5` fu/tick = `270` fu/s | `src/game/tuning.ts:18` |
| `SCROLL_SPEED` | `38 / TICK_HZ` | `0.63333` fu/tick = `38` fu/s | `src/game/tuning.ts:27` |
| `FRESHNESS_SECONDS` | `FIELD_HEIGHT / 2 / (SCROLL_SPEED * TICK_HZ)` | `10.0` s | `src/game/tuning.ts:37` |
| `SIZE_CEILING` | `FIELD_WIDTH / 8` | `67.5` fu | `src/game/tuning.ts:53` |
| `SPAWN_MARGIN` | `= MAX_ENTRY_DEPTH` | `160` fu | `src/game/mobs.ts:137`, declared `src/game/stage/templates.ts:60` |
| `START_X` (grave) | `FIELD_WIDTH / 2` | `270` | `src/game/grave.ts:24` |
| `START_Y` (grave) | `FIELD_HEIGHT * 0.8` | `608` | `src/game/grave.ts:25` |

`SCROLL_SPEED` is the only field-level pace number that is *declared* rather than derived; everything downstream (`FRESHNESS_SECONDS`, mob speeds, patch drift) hangs off it.

### Consumers of `FIELD_WIDTH` / `FIELD_HEIGHT`

Twenty-two non-test sites import them. Exhaustive list:

**Simulation (`src/game`)**
- `src/game/tuning.ts:6,18,37,53` — `BASE_SPEED`, `FRESHNESS_SECONDS`, `SIZE_CEILING`.
- `src/game/grave.ts:6,24,25,96,97` — start mark and containment clamp.
- `src/game/mobs.ts:8,392,394` — `cullMobs` bottom edge and side margins.
- `src/game/mobFire.ts:6,165,167` — `cullShots` on all four sides.
- `src/game/corpses.ts:8,293` — `cullCorpses` bottom edge only.
- `src/game/lines/soulStream.ts:8,143,145` — `cullSkulls` all four sides.
- `src/game/lines/wisps.ts:7,183,185` — `cullWisps` all four sides.
- `src/game/lines/territory.ts:6,242` — patch close rule, bottom edge only.
- `src/game/lines/bell.ts:5,107,112` — push clamp to field widened by `SPAWN_MARGIN`.
- `src/game/stage/templates.ts:8,105,115,133,151,170,180` — every template's placement.
- `src/game/invariants.ts:15,235,236,251,252,352,353` — bounds harness.

**Instruments (`src/dev`)**
- `src/dev/bot.ts:3,89,151,155` — bot `HOME = { x: FIELD_WIDTH/2, y: FIELD_HEIGHT*0.8 }` (duplicates the grave's start mark by expression, `src/dev/bot.ts:89`), and its own containment clamp.
- `src/dev/readings/gravePath.ts:3,18,32` — `BOTTOM_EDGE_MARGIN = FIELD_HEIGHT / 10` = `76`.
- `src/dev/readings/upfieldTraffic.ts:5,34,45` — `LATERAL_REACH = FIELD_WIDTH / 10` = `54`; `BAND_COUNT = ceil((FIELD_HEIGHT + SPAWN_MARGIN) / BAND_UNITS)`.

**Render / app (`src/app`, `src/main.ts`)**
- `src/main.ts:6,43,44` — `resizeOptions.minWidth/minHeight` = the field.
- `src/app/layout.ts:1,112,120,121,131,133` — `fitField` scale and offsets.
- `src/app/screens/game/fieldFrame.ts:5,18,44` — boundary readout rect and clip rect.
- `src/app/screens/game/FieldRenderer.ts:4,157,267,269` — full-field dim rect; inside-the-field test for the cancel scatter.
- `src/app/screens/game/StormRenderer.ts:4,77-79` — `ERUPTION_REACH` = field diagonal.

### Anything hardcoding 540 / 760

Every non-test occurrence:
- `src/game/field.ts:10-11` — the declarations themselves.
- `src/game/mobs.ts:64` — **prose comment** "needs 22 mobs to fill the field's 540". The *code* that depends on it is `{ t: 2, template: 'wall', count: 22, ... }` at `src/game/stage/stage.ts:102`, which never sees `FIELD_WIDTH`. See §8, leak 1.
- `src/game/lines/bell.ts:42` — prose comment "nearly across the field's 540-unit width".
- `src/game/math.ts:9-10` — prose comment "in a 540 by 760 field there is no overflow range to protect".
- `src/game/witness.ts:45` — prose comment "`Math.round(760 * 1e9)` stays inside ToInt32's range".
- `src/app/screens/game/fieldFrame.ts:15` — prose comment "the field's own 540 by 760".
- `src/dev/digest.ts:32` — `const LEFTOVER_AT = 540;`. **False positive**: this is a *tick number*, not a field dimension (`src/dev/digest.ts:31`).

No non-test *code* site hardcodes 540 or 760. Every one of them is a comment or a coincidence. The real disguised dimensions are elsewhere (§8).

---

## 2. The grave

### Size

| Constant | Value | Declared at |
|---|---|---|
| `SIZE_START` | `27` | `src/game/tuning.ts:58` |
| `SIZE_FLOOR` | `18` | `src/game/tuning.ts:66` |
| `SIZE_CEILING` | `FIELD_WIDTH / 8` = `67.5` | `src/game/tuning.ts:53` |
| `GRAVE_ASPECT` | `2` (height over width) | `src/game/tuning.ts:50` |
| `HIT_SHRINK` | `3` fu per hit | `src/game/tuning.ts:69` |
| `INVULNERABLE_TICKS` | `24` (0.4 s) | `src/game/tuning.ts:93` |
| `CORPSES_TO_CEILING` | `80` | `src/game/tuning.ts:96` |
| `TRASH_CORPSE_PAYOUT` | `(67.5 - 27) / 80` = `0.50625` fu | `src/game/tuning.ts:99` |
| `FEAST_PAYOUT` | `9 * TRASH` = `4.55625` fu | `src/game/tuning.ts:102` |
| `RESERVOIR_CAPACITY` | `= FEAST_PAYOUT` = `4.55625` | `src/game/tuning.ts:109` |

### Size to geometry

`size` is the **half-height** (`src/game/grave.ts:33-34`).
`graveWidth(size) = size * 2 / GRAVE_ASPECT` (`src/game/grave.ts:71-73`). With `GRAVE_ASPECT = 2` this is **exactly `size`**, which the comment at `src/game/grave.ts:66-70` flags as intentional and confusing-looking.

So: **width = size, height = 2 × size.**

| State | size | width (fu) | height (fu) |
|---|---|---|---|
| Floor | 18 | 18 | 36 |
| Start | 27 | 27 | 54 |
| Ceiling | 67.5 | 67.5 | 135 |

Growth per fully fresh trash corpse: `0.50625` fu of half-height, i.e. `+0.50625` width and `+1.0125` height. 80 of them span floor-to... no, **start** to ceiling.

### Movement and containment

- Applied per tick: `grave.x += command.x * BASE_SPEED` (`src/game/grave.ts:110-111`), `BASE_SPEED = 4.5` fu/tick = `270` fu/s. Crosses the width in 2.0 s, the height in 2.81 s.
- The command is **neither normalized nor capped here** (`src/game/grave.ts:100-108`); touch is deliberately uncapped per ADR 0011.
- `containGrave` clamps `x ∈ [halfWidth, FIELD_WIDTH - halfWidth]` and `y ∈ [size, FIELD_HEIGHT - size]` (`src/game/grave.ts:94-98`). At `SIZE_START` that is `x ∈ [13.5, 526.5]`, `y ∈ [27, 733]`. At ceiling, `x ∈ [33.75, 506.25]`, `y ∈ [67.5, 692.5]`.
- Containment re-runs on growth (`src/game/grave.ts:124`), because a widened grave can straddle an edge it was pressed against.

### Hitbox vs drawn footprint

`graveHitbox` (`src/game/grave.ts:79-87`): top-left `(x - width/2, y - size)`, size `width × 2*size`. Exactly the same rect the renderer draws.

`GraveRenderer.redraw` (`src/app/screens/game/GraveRenderer.ts:177-209`) draws `roundRect(left, top, width, size*2, radius)` with `alignment: 1` (inward stroke). **The drawn outer edge equals the hitbox exactly**, by design (`src/app/screens/game/GraveRenderer.ts:170-176`, `53-67`).

Render-only grave constants:
- `GRAVE_CORNER_RATIO = 0.2` of width (`src/app/screens/game/GraveRenderer.ts:9`).
- `GRAVE_RIM_STROKE = 3` fu, inward (`src/app/screens/game/GraveRenderer.ts:32`).
- `GRAVE_RIM_SHADOW = 1` fu, inward inside the rim (`src/app/screens/game/GraveRenderer.ts:51`).
- Combined the two rims eat 4 fu per side, so a floor grave's visible mouth interior is **10 fu wide** on an 18-fu body (`src/app/screens/game/GraveRenderer.ts:48-50`).
- `GLOW_PULSE_TICKS = 40`, `GLOW_PULSE_DEPTH = 0.35` (`src/app/screens/game/GraveRenderer.ts:69,72`); the glow takes **zero** extra width, drawn at the rim's identical geometry (`src/app/screens/game/GraveRenderer.ts:158-168`).

---

## 3. The mobs

Table at `src/game/mobs.ts:61-115`. Three types, `MOB_TYPE_NAMES` at `src/game/mobs.ts:117`.

| | shambler | revenant | ghoul |
|---|---|---|---|
| `halfWidth` | `11` (`:64`) | `13` (`:84`) | `9` (`:103`) |
| `halfHeight` | `11` (`:65`) | `13` (`:85`) | `9` (`:104`) |
| **body (fu)** | **22 × 22** | **26 × 26** | **18 × 18** |
| `hp` | `3` (`:66`) | `5` (`:86`) | `2` (`:105`) |
| `corpsePayout` | `TRASH` = 0.50625 (`:67`) | `2 × TRASH` = 1.0125 (`:87`) | `TRASH` (`:106`) |
| `corpseTier` | trash (`:68`) | rich (`:88`) | trash (`:107`) |
| `speed` | `0.5 * SCROLL` = `0.31667` fu/tick (`:69`) | `0.35 * SCROLL` = `0.22167` (`:89`) | `0.35 * BASE_SPEED` = `1.575` (`:111`) |
| `motion` | falls (`:70`) | falls (`:90`) | chases (`:112`) |
| `armedShare` | everyThird (`:72`) | all (`:92`) | never (`:113`) |

Hitbox: `mobHitbox` (`src/game/mobs.ts:208-216`) is the axis-aligned box `halfWidth × halfHeight` around the centre, for all three types including the ghoul which is *drawn* as a rotated wedge (`src/app/screens/game/mobSprite.ts:49`, rotation at `src/app/screens/game/FieldRenderer.ts` `syncMobs`). **The ghoul's hitbox does not rotate with its sprite.**

### Effective descent (own speed + scroll)

`scrollField` adds `SCROLL_SPEED` to every live mob every tick (`src/game/step.ts:32-39`), on top of the type's own `vy`.

| | own vy | + scroll | total fu/tick | fu/s | seconds to cross 760 |
|---|---|---|---|---|---|
| shambler | 0.31667 | 0.63333 | 0.95 | 57.0 | 13.3 |
| revenant | 0.22167 | 0.63333 | 0.855 | 51.3 | 14.8 |
| ghoul (floored) | ≥ 0.22167 | 0.63333 | ≥ 0.855 | ≥ 51.3 | ≤ 14.8 |

`GHOUL_DESCENT_FLOOR = 0.35 * SCROLL_SPEED` = `0.22167` fu/tick (`src/game/mobs.ts:146`) — a hard floor on the ghoul's own downward component so it can never station-hold.

### Ghoul turning

- `GHOUL_TURN_DEGREES_PER_SECOND = 60` (`src/game/mobs.ts:154`), i.e. `GHOUL_TURN_RADIANS = 60 * π/180 / 60` = `0.017453` rad/tick (`src/game/mobs.ts:156-157`). Full reversal takes 3 s.
- Turn applied as a vector rotation, `TURN_COS`/`TURN_SIN` precomputed (`src/game/mobs.ts:163-164`), rule at `src/game/mobs.ts:261-271`.

### Spawn rules and positions

`ARRIVE_TICKS = 45` (`src/game/mobs.ts:128`) — the arriving beat, counted only once the mob's top edge is inside the field (`hasEntered`, `src/game/mobs.ts:219-221`).

Placement library, `src/game/stage/templates.ts`:

| Constant | Value | Line |
|---|---|---|
| `BODY` | `26` (largest body in the pool) | `:38` |
| `ENTRY_DEPTH` | `= BODY` = `26` above the top edge | `:45` |
| `MAX_ENTRY_DEPTH` | `160` | `:60` |
| `EDGE_MARGIN` | `BODY / 2` = `13` | `:63` |
| `V_SPREAD_X` | `56` per rank | `:65` |
| `V_SPREAD_Y` | `= BODY` = `26` per rank | `:69` |
| `RAIN_SPREAD` | `3 * BODY` = `78` | `:72` |
| `V_OPENING` | `normalize(0.45, 1)` = `(0.4104, 0.9120)` | `:78` |
| `PINCER_ANGLE` | `normalize(1, 1)` = `(0.7071, 0.7071)` | `:81` |

Per-template x placement:
- `drip`: `x = FIELD_WIDTH * (i + 0.5) / count`, `y = -26` (`:104-110`). Spans the full width edge to edge.
- `file`: one random lane `x = 13 + rand * (540 - 26)` = `[13, 527]`; `y = -26 - i * rankStep(count, 26)` (`:114-124`).
- `v` (chevron): `x = 270 ± (rank + 0.5) * 56` (`:133`). At the authored count 7 (max rank 3) that is `270 ± 196` → `x ∈ [74, 466]`, **span 392 fu**.
- `pincer`: leads at `x = 13` and `x = 527`, trailing ranks step outward along the 45° entry (`:143-160`).
- `rain`: `x = 13 + rand * 514`, `y = -26 - rand * 78` (`:168-176`).
- `wall`: `spacing = FIELD_WIDTH / count`, `x = (i + 0.5) * spacing` (`:179-188`). At the authored count 22, spacing = `24.545` fu against a 22-fu shambler → **2.545 fu gaps**, narrower than the 18-fu floor grave.

`rankStep` caps a group's total depth at `MAX_ENTRY_DEPTH` by closing ranks up (`:87-90`).

### Despawn / cull bounds

`cullMobs` (`src/game/mobs.ts:387-397`):
```
mob.y - halfHeight > FIELD_HEIGHT || mob.x < -SPAWN_MARGIN || mob.x > FIELD_WIDTH + SPAWN_MARGIN
```
So mobs live from `y = -160` down to `y = 760 + halfHeight`, and sideways out to `x ∈ [-160, 700]`. **There is no top cull** — a mob above the field is never removed, only a mob past the bottom or a spawn margin off a side.

`hasPassed` (`src/game/mobs.ts:301-303`): a mob whose top edge is below `grave.y + grave.size` stops firing.

### How many can exist at once

- `MOB_CAP = 160` (`src/game/caps.ts:22`). At the cap `takeSlot` returns null and the spawn is **refused** (`src/game/caps.ts:60-68`, `src/game/mobs.ts:236`).
- Measured densest authored moment: **51 mobs alive at tick 11341** (`src/game/caps.ts:13-16`).
- Largest single authored group: `{ t: 2, template: 'wall', count: 22 }` (`src/game/stage/stage.ts:102`); next largest are `rain count: 12` (`src/game/stage/stage.ts:117,120`) and `pincer count: 8` / `v count: 7`.

---

## 4. The four weapon lines

`WEAPON_LINES = ['soulStream', 'territory', 'wisps', 'bell']` (`src/game/lines/roster.ts:6-11`); `BIRTHRIGHT = ['soulStream', 'territory']` (`:14`); `MAX_LEVEL = 5` (`:16`).

### 4.1 soulStream (`src/game/lines/soulStream.ts`)

| Constant | Value | Line |
|---|---|---|
| `COLUMNS_BY_LEVEL` | `[0, 1, 2, 3, 4, 5]` | `:25` |
| `STREAM_INTERVAL` | `30` ticks (0.5 s), fixed across levels | `:39` |
| `SKULL_SPEED` | `420 / 60` = `7.0` fu/tick = `420` fu/s | `:48` |
| `FAN_STEP_DEGREES` | `6°` between columns, symmetric about vertical | `:57` |
| `SURGE_VOLLEYS` | `1` extra volley per swallow | `:66` |
| `SURGE_INTERVAL` | `10` ticks | `:69` |
| `SKULL_HALF_EXTENT` | `4` → **8 fu square** | `:71` |
| `SKULL_DAMAGE` | `1` | `:72` |
| `SKULL_CAP` | `120` | `src/game/caps.ts:89` |

- Launch point: `x = grave.x`, `y = grave.y - grave.size` (the mouth's top edge) (`:112-113`).
- `columnAngle(column, columns) = (column - (columns-1)/2) * 6` (`:89-91`). Fan half-angles by level: L1 `0°`; L2 `±3°`; L3 `0, ±6°`; L4 `±3°, ±9°`; L5 `0, ±6°, ±12°`.
- **Lateral reach**: at L5 the widest column is 12° off vertical. From the start mark (`y = 608`) to the top edge is 608 fu of travel → lateral drift `tan(12°) × 608` = **129.3 fu each side, 258.6 fu total spread**. The comment at `:52-56` quotes 128 fu over 600 fu of travel, which agrees.
- Range is unbounded; a skull dies only by leaving the field (`cullSkulls`, `:138-148`, all four sides) or by hitting a mob (`src/game/storm.ts:53-64`, one mob per skull).
- Time to cross the field's height: `760 / 7` = `108.6` ticks = **1.81 s**.

### 4.2 territory (`src/game/lines/territory.ts`)

| Constant | Value | Line |
|---|---|---|
| `TERRITORY_OFFSET` | `456` fu straight up-field of the grave | `:26` |
| `TERRITORY_FULL_RADIUS` | `48` fu → **96 fu diameter** | `:34` |
| `BITES_BY_LEVEL` | `[0, 2, 3, 4, 6, 8]` | `:44` |
| `TERRITORY_OPENING_TICKS` | `24` (0.4 s) | `:54` |
| `TERRITORY_DAMAGE` | `2` per grab | `:57` |
| `TERRITORY_CAP` | `24` patches | `src/game/caps.ts:106` |

- **Radius by freshness, not by level.** `patchRadius(f) = 48 * sqrt(max(f, 0.25))` (`:124-126`, floor from `FRESHNESS_PAYOUT_FLOOR = 0.25` at `src/game/tuning.ts:40`). So the radius ranges `24 → 48` fu, i.e. **48 → 96 fu diameter**. Level buys *bites*, never size.

  | freshness | radius (fu) | diameter (fu) |
  |---|---|---|
  | 1.00 | 48.0 | 96.0 |
  | 0.50 | 33.9 | 67.9 |
  | 0.25 (floor) | 24.0 | 48.0 |

- Spawn: `patch.x = grave.x`, `patch.y = grave.y - 456` (`:214-215`). **Never clamped, never suppressed** (`:196-198`). From the start mark (`y = 608`) a patch is born at `y = 152`, on screen. From the top of the movement range (`grave.y = 27`) it is born at `y = -429`, i.e. **269 fu above `-SPAWN_MARGIN`**. `invariants.ts:352` bounds patches sideways only; `:353` bounds them below. Up-field is deliberately unbounded.
- Drift: `patch.y += SCROLL_SPEED` per tick (`:238`) — the same 0.63333 fu/tick the food layer gets. It is the only player-owned thing in the world's frame (`:229-231`).
- Time from birth to reaching the grave: `456 / 0.63333` = **720 ticks = 12.0 s**.
- Close rule: `patch.y - patch.radius > FIELD_HEIGHT` (`:242`). Total on-screen life from `y = -429` to close ≈ `(760 + 48 + 429) / 0.63333` = 1953 ticks = 32.5 s.
- Overlap test: `circleOverlapsBox(patch circle, mobHitbox)` — the mob's whole *body*, not its centre (`:257-262`, predicate at `src/game/overlap.ts:54-60`, closed convention).
- Render: rim drawn at the collision radius exactly (`src/app/screens/game/StormRenderer.ts:147-165`), `PATCH_STROKE = 2` fu (`:43`), hands at `HAND_REACH = 0.34` of radius inward with `HAND_WIDTH = 0.16` of radius (`:51-52`), `OPENING_TINT = 0.45` while opening (`:40`).

### 4.3 wisps (`src/game/lines/wisps.ts`)

| Constant | Value | Line |
|---|---|---|
| `WISPS_BY_LEVEL` | `[0, 1, 2, 4, 6, 8]` | `:34` |
| `WISP_SPEED` | `300 / 60` = `5.0` fu/tick = `300` fu/s | `:41` |
| `WISP_LIFETIME` | `90` ticks (1.5 s) | `:43` |
| `WISP_TURN_DEGREES_PER_SECOND` | `180` (full reversal in 1 s) | `:50` |
| `WISP_HALF_EXTENT` | `4` → **8 fu square** | `:52` |
| `WISP_DAMAGE` | `1` | `:53` |
| `WISP_CAP` | `64` | `src/game/caps.ts:90` |

- **Effective range = `WISP_SPEED × WISP_LIFETIME` = `450` fu** of path length (`:36-40`), 59.2% of the field's height, 83.3% of its width.
- Launch point: `x = grave.x`, `y = grave.y - grave.size` (`:161-162`), same mouth as skulls.
- Targeting is unbounded in distance: `nearestMob` scans the whole live pool with no range cut (`:112-131`). A wisp will home on a mob it cannot physically reach.
- `TURN_RADIANS = 180 * π/180 / 60` = `0.052360` rad/tick (`:72`).
- Cull on all four field sides (`:178-188`).
- Render: teardrop drawn from `-1.6r` to `+r` along x, i.e. **20.8 fu long × 11.2 fu wide** at `r = 4` (`src/app/screens/game/StormRenderer.ts:176`), rotated to heading (`:406`).

### 4.4 bell (`src/game/lines/bell.ts`)

| Constant | Value | Line |
|---|---|---|
| `BELL_PERIOD` | `180` ticks (3.0 s) | `:31` |
| `BELL_EXPAND_TICKS` | `45` ticks (0.75 s) | `:38` |
| `BELL_RADIUS_BY_LEVEL` | `[0, 80, 122, 165, 207, 250]` | `:50` |
| `BELL_DAMAGE_NEAR` | `3` (at the grave) | `:53` |
| `BELL_DAMAGE_FAR` | `0.5` (at full radius) | `:56` |
| `BELL_PUSH_BY_LEVEL` | `[0, 0, 0, 0, 20, 40]` fu | `:63` |

Per-level geometry:

| Level | radius (fu) | diameter (fu) | expansion rate (fu/tick) | push at grave (fu) |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 |
| 1 | 80 | 160 | 1.778 | 0 |
| 2 | 122 | 244 | 2.711 | 0 |
| 3 | 165 | 330 | 3.667 | 0 |
| 4 | 207 | 414 | 4.600 | 20 |
| 5 | 250 | 500 | 5.556 | 40 |

- Ring is centred on `grave.x, grave.y` (the centre, not the mouth) (`:143-144`, render `src/app/screens/game/StormRenderer.ts:415`).
- `ringRadius(ring) = BELL_RADIUS_BY_LEVEL[level] * (ticks / 45)` (`:66-68`) — linear expansion.
- Damage falls off linearly: `0.5 + 2.5 * proximity`, `proximity = max(0, 1 - distance/full)` (`:78-81`, `:149-150`). Damage and push share the same falloff.
- Push clamps the mob to `x ∈ [-160, 700]`, `y ∈ [-160, 920]` (`:104-113`), i.e. the field widened by `SPAWN_MARGIN`.
- A ring keeps the level it was born with; one live ring at a time is an invariant, since 45 < 180 (`:33-37`, `:163`).
- Render: `RING_STROKE = 2.5` fu with a `SPRITE_STROKE * 2` = `2.4` fu dark companion, so the drawn band is **4.9 fu wide** (`src/app/screens/game/StormRenderer.ts:55,193-202`); `RING_ALPHA = 0.85` fading to 0 as it expands (`:58`, `:418-419`).

### 4.5 The belch (`src/game/belch.ts`) — not a line, but field-wide

- No spatial constant in the sim at all: it cancels **every** live shot (`:10-18`) and kills **every** mob whose top edge is inside the field (`hasEntered`, `:32-40`). The only spatial rule is "has entered": mobs above `y = halfHeight` survive.
- Render only: `ERUPTION_REACH = sqrt(540² + 760²)` = **932.3 fu** (`src/app/screens/game/StormRenderer.ts:77-79`), `ERUPTION_TICKS = 20`, `ERUPTION_STROKE = 14` fu (`:76,82`). `SPLASH_TICKS = 18`, `SPLASH_REACH = 26` fu, `SPLASH_SPOKES = 7` (`:85-87`). Both anchored at the mouth `grave.y - grave.size` (`:347-348`, `:354-355`).

---

## 5. Corpses, drops and other field objects

### Corpses (`src/game/corpses.ts`)

| Constant | Value | Line |
|---|---|---|
| `CORPSE_HALF_EXTENT` | `7` → **14 fu square** | `:26` |
| `DROP_HALF_EXTENT` | `14` → **28 fu square catch box** | `:53` |
| `FRESHNESS_PER_TICK` | `1 / (10 × 60)` = `0.0016667` | `:56` |
| `CORPSE_CAP` | `200` | `src/game/caps.ts:24` |

- Corpse size is **constant across mob types** (`:16-25`) — a revenant's double payout shows as hue, never as size.
- Corpses have **no velocity of their own**; the scroll is the only thing that moves them (`:58-65`, `src/game/step.ts:36-38`). Drift = `0.63333` fu/tick.
- Lifetime: freshness drains linearly over `FRESHNESS_SECONDS = 10 s` = 600 ticks (`:272-282`). At `SCROLL_SPEED` that is `600 × 0.63333` = **380 fu of travel**, exactly `FIELD_HEIGHT / 2` — the derivation at `src/game/tuning.ts:37` made this true by construction.
- Cull: bottom edge only, `corpse.y - halfExtent > FIELD_HEIGHT` (`:293`).
- At the cap the **oldest decaying** corpse is evicted rather than the spawn refused (`:144-177`); drops and feasts are never evicted (`:143-151`).

### Drops

- Catch box `28 × 28` fu (`DROP_HALF_EXTENT = 14`, `:53`), deliberately **1.17× the drawn peak** (`:29-45`).
- Never decay, always `freshness = 1` (`:262-264`).
- Prices in kills: `DROP_PRICES = [5, 6, 8, 10, 12, 15, 18, 23, 28, 35, 43, 53]` (`src/game/drops.ts:26-28`) — 10 to 12 drops per run.
- Render: `DROP_DRAW_HALF_EXTENT = 12` → **24 fu drawn peak** (`src/app/screens/game/foodSprite.ts:116`); breath dips inward by `DROP_BREATH_DEPTH = 0.18` (`:141`) over `DROP_BREATH_TICKS = round(2.75 × 60) = 165` ticks (`:125`), phase offset by `DROP_BREATH_ID_STRIDE = 103` (`:153`). So the drawn extent swings **19.68 → 24.0 fu**, inside a 28-fu hitbox.

### Feasts

- `spawnFeast` uses `CORPSE_HALF_EXTENT` (`:235`), so **14 fu square**, same as a corpse. Nothing spawns one yet (`:211-215`).

### Mob fire (`src/game/mobFire.ts`)

| | shambler | revenant | ghoul |
|---|---|---|---|
| `shotHalfExtent` | `5` (`src/game/mobs.ts:80`) | `5` (`:97`) | `0` (`NEVER_FIRES`, `src/game/mobFire.ts:64`) |
| **shot hitbox (fu)** | **10 × 10** | **10 × 10** | — |
| `shotSpeed` | `110/60` = `1.8333` fu/tick = `110` fu/s (`:79`) | same (`:96`) | 0 |
| `interval` | `180` ticks (`:77`) | `150` (`:94`) | 0 |
| `firstShotJitter` | `45` ticks (`:78`) | `0` (`:95`) | 0 |
| `tellTicks` | `45` (`:79`) | `45` (`:96`) | 0 |

- Aimed at the grave's centre at the moment of firing, never homing, **does not carry the scroll** (`src/game/mobFire.ts:126-148`).
- Spawns at the mob's centre, `shot.x = mob.x, shot.y = mob.y` (`:141-142`).
- Cull on all four sides (`:160-170`).
- `MOB_FIRE_CAP = 400`, spawn **refused** at the cap (`src/game/caps.ts:23`, `:50-58`).
- Render: `SHOT_DRAW_SCALE = 1.6` → drawn star outer radius `8`, **16 fu across** against a 10-fu hitbox (`src/app/screens/game/mobFireSprite.ts:19,58`). Bright core at `SHOT_CORE_OF_HITBOX = 0.9` → radius `4.5`, **9 fu** (`:29,72`). `SCATTER_REACH = 2.4 × extent`, `SCATTER_SPOKES = 6`, `SCATTER_TICKS = 12` (`:77-83`).

### Mob sprite decorations (render only)

- `SPRITE_STROKE = 1.5` fu for food and mob bodies (`src/app/screens/game/foodSprite.ts:13`).
- `SPRITE_STROKE = 1.2` fu for storm sprites (`src/app/screens/game/StormRenderer.ts:34`) — **same name, different value, different file**.
- `ARMED_NOTCH_HEIGHT = 0.28 × halfWidth`, notch `1.2 × halfWidth` wide (`src/app/screens/game/mobSprite.ts:53,69`).
- `TELL_STROKE = 2` fu (`:74`); tell iris `max(2, halfWidth × (0.9 - 0.7p))`, alarm ring `halfWidth × (0.95 + 0.5p)` (`:100-109`). At a shambler's `halfWidth = 11` the alarm ring reaches **radius 15.95 fu at p = 1**, i.e. 31.9 fu across — larger than the body it announces.
- `TELL_STEPS = 6` quantization (`:19`).

---

## 6. Ratio table

Everything as a fraction of `FIELD_WIDTH = 540`. The `%FH` column is against `FIELD_HEIGHT = 760` where the object's own axis is vertical.

### The field itself

| Thing | fu | % of 540 |
|---|---|---|
| `FIELD_WIDTH` | 540 | 100.0% |
| `FIELD_HEIGHT` | 760 | 140.7% |
| `SPAWN_MARGIN` | 160 | 29.6% |
| Field diagonal | 932.3 | 172.6% |

### The grave

| Thing | fu | % of 540 |
|---|---|---|
| Grave width, floor (18) | 18 | **3.3%** |
| Grave height, floor | 36 | 6.7% |
| Grave width, start (27) | 27 | **5.0%** |
| Grave height, start | 54 | 10.0% |
| Grave width, ceiling (67.5) | 67.5 | **12.5%** |
| Grave height, ceiling | 135 | **25.0%** (17.8% of FH) |
| Grave mouth interior, floor (rims subtracted) | 10 | 1.9% |
| Grave x-travel range, start size | 513 | 95.0% |

### The mobs (body, full extent)

| Thing | fu | % of 540 |
|---|---|---|
| shambler body | 22 | **4.1%** |
| revenant body | 26 | **4.8%** |
| ghoul body | 18 | **3.3%** |
| Wall of 22 shamblers: spacing | 24.5 | 4.5% |
| Wall of 22 shamblers: gap between bodies | 2.5 | 0.5% |
| V (count 7) total span | 392 | **72.6%** |
| Template `BODY` spacing unit | 26 | 4.8% |
| Template `EDGE_MARGIN` | 13 | 2.4% |
| Shambler alarm ring at full tell | 31.9 | 5.9% |

### Projectiles

| Thing | fu | % of 540 |
|---|---|---|
| Mob shot hitbox | 10 | **1.9%** |
| Mob shot drawn (×1.6) | 16 | **3.0%** |
| Mob shot bright core | 9 | 1.7% |
| Skull (soulStream) | 8 | **1.5%** |
| Wisp hitbox | 8 | **1.5%** |
| Wisp drawn length | 20.8 | 3.9% |

### Food

| Thing | fu | % of 540 |
|---|---|---|
| Corpse / feast | 14 | **2.6%** |
| Drop catch box | 28 | **5.2%** |
| Drop drawn, peak | 24 | 4.4% |
| Drop drawn, breath trough | 19.7 | 3.6% |

### Weapon effects, level 1 vs level 5

| Line | L1 extent (fu) | L1 % of 540 | L5 extent (fu) | L5 % of 540 |
|---|---|---|---|---|
| **soulStream** — columns | 1 column, 0 spread | 0% | 5 columns, ±12° | — |
| **soulStream** — fan spread at the top edge from the start mark | 0 | 0.0% | 258.6 | **47.9%** |
| **soulStream** — skull size | 8 | 1.5% | 8 | 1.5% |
| **territory** — patch diameter (fresh) | 96 | **17.8%** | 96 | **17.8%** *(level buys bites, not size)* |
| **territory** — patch diameter (stale, 0.25) | 48 | 8.9% | 48 | 8.9% |
| **territory** — bites | 2 | — | 8 | — |
| **territory** — up-field offset | 456 | **84.4%** (60.0% of FH) | 456 | **84.4%** |
| **wisps** — count | 1 | — | 8 | — |
| **wisps** — travel range | 450 | **83.3%** (59.2% of FH) | 450 | **83.3%** |
| **bell** — ring diameter | 160 | **29.6%** | 500 | **92.6%** (65.8% of FH) |
| **bell** — push at the grave | 0 | 0% | 40 | 7.4% |
| **belch** — eruption reach (render only) | 1864.6 dia | 345.3% | same | 345.3% |
| **belch** — splash reach | 52 dia | 9.6% | same | 9.6% |

### The headline comparisons

| | fu | ×shambler body | % of 540 |
|---|---|---|---|
| Skull | 8 | 0.36× | 1.5% |
| Corpse | 14 | 0.64× | 2.6% |
| Mob shot drawn | 16 | 0.73× | 3.0% |
| Ghoul | 18 | 0.82× | 3.3% |
| Grave, floor (width) | 18 | 0.82× | 3.3% |
| Shambler | 22 | 1.00× | 4.1% |
| Drop catch box | 28 | 1.27× | 5.2% |
| Grave, start (width) | 27 | 1.23× | 5.0% |
| Grave, ceiling (width) | 67.5 | 3.07× | 12.5% |
| Territory patch (fresh) | 96 | 4.36× | 17.8% |
| Grave, ceiling (height) | 135 | 6.14× | 25.0% |
| Bell L1 ring | 160 | 7.27× | 29.6% |
| Bell L5 ring | 500 | 22.7× | **92.6%** |

**A maxed bell ring is 92.6% of the field's width.** It is 22.7 shambler bodies across. From a centred grave its edge stands 20 fu (3.7% of the width) short of each side wall; from a grave pressed against a side wall it covers the entire width and reaches 216 fu past the far edge.

---

## 7. Render vs simulation

### There is no camera and no world-to-screen transform beyond one uniform scale

The whole logical-to-screen conversion is a **single pixi container transform** set in `GameScreen.resize`:

```
src/app/screens/game/GameScreen.ts:405-408
public resize(width: number, height: number) {
  this.placement = fitField(width, height, READOUT_RESERVE);
  this.field.position.set(this.placement.offsetX, this.placement.offsetY);
  this.field.scale.set(this.placement.scale);
```

Every sprite is positioned in raw field units inside that container (`sprite.position.set(mob.x, mob.y)`, `src/app/screens/game/FieldRenderer.ts` `syncMobs`; `StormRenderer.ts:368,383,404,415`). No per-entity scaling anywhere.

### The placement

`fitField` (`src/app/layout.ts:182-208`) is the only viewport-aware module in the app, and `src/game` may not import it (`src/app/layout.ts:3-6`, fence at `src/__tests__/boundary.test.ts`).

```
src/app/layout.ts:112
const scale = Math.min(viewportWidth / FIELD_WIDTH, height / FIELD_HEIGHT);
```
plus centring offsets (`:120-121`). Uniform scale, aspect preserved, letterboxed.

- `READOUT_RESERVE = { margin: 12, width: 260, height: 120 }` in **stage units** (`src/app/layout.ts:69-73`). If the natural fit would put a readout over the field, the field is lowered by `reserve.height` — but only when the lowering is free, i.e. costs no width (`:192-207`).
- `DEGENERATE_PLACEMENT = { scale: 1, offsetX: 0, offsetY: 0 }` for an unmeasurable viewport (`:82-86`), with a once-per-session warning (`:98-104`).
- `screenToField` is the exact inverse (`:211-220`); touch input goes through it so `src/input` never sees a viewport (`:12-15`).

### Canvas sizing chain

1. `src/main.ts:37-47` — `engine.init({ resizeOptions: { minWidth: FIELD_WIDTH, minHeight: FIELD_HEIGHT, letterbox: false } })`. The comment at `:39-41` says explicitly that the stage floor **is** the field's unit space, and that these used to be the same numbers written twice.
2. `src/engine/engine.ts:47` — `opts.resolution ??= getResolution()`.
3. `src/engine/utils/getResolution.ts:2` — `Math.max(window.devicePixelRatio, 2)`, forced to 2 for a fractional DPR (`:4-9`).
4. `src/engine/resize/ResizePlugin.ts:98-135` — on every window resize (rAF-throttled, `:82-91`): canvas **CSS** size is set to the raw viewport in px (`:130-131`), and `renderer.resize(width, height)` is called with the *stage* size computed by `resize()`.
5. `src/engine/resize/resize.ts:1-37` — with `letterbox: false`, `canvasWidth/Height` stay the viewport; then `scaleX = canvasWidth < minWidth ? minWidth/canvasWidth : 1`, likewise `scaleY`, `scale = max(scaleX, scaleY)`, and stage size = `floor(canvas * scale)`.

**Consequence:** on a viewport narrower than 540 CSS px the *stage* is upscaled so its width is at least 540 stage units, and only then does `GameScreen.resize` receive those stage units. On a 390-px-wide phone, `scaleX = 540/390 = 1.3846`, so the stage is ~540 wide and `fitField` returns `scale ≈ 1.0` in stage units — but each stage unit is `390/540 = 0.722` CSS px. That 0.72 figure is quoted as fact in three places: `src/game/tuning.ts:61-63`, `src/app/layout.ts:22-27`, `src/app/screens/game/mobFireSprite.ts:14-17`.

6. `style.css:14-19` — `#app { width: 100%; height: 100vh; height: 100dvh; overflow: hidden; }`, flex-centred. `index.html:6-9` — `viewport-fit=cover`, zoom disabled.

### Does the renderer assume 540 × 760?

Not directly — it imports both constants and computes from them (`fieldFrame.ts:18,44`; `FieldRenderer.ts:157`; `StormRenderer.ts:77-79`; `layout.ts:112`). Nothing render-side re-states the numbers.

### Render-side constants duplicating simulation constants

| Render constant | Value | Sim counterpart | Value | Relationship |
|---|---|---|---|---|
| `DROP_DRAW_HALF_EXTENT` (`foodSprite.ts:116`) | 12 | `DROP_HALF_EXTENT` (`corpses.ts:53`) | 14 | Deliberate: catch box 1.17× the ink, ruled 2026-08-25 |
| `SHOT_DRAW_SCALE` (`mobFireSprite.ts:19`) | 1.6 | `shotHalfExtent` (`mobs.ts:80,97`) | 5 | Drawn 16 fu vs 10 fu hitbox |
| `SHOT_CORE_OF_HITBOX` (`mobFireSprite.ts:29`) | 0.9 | same | 5 | Core sized *from* the hitbox — correct coupling |
| `SPRITE_STROKE` (`foodSprite.ts:13`) | 1.5 | — | — | Same name as `StormRenderer.ts:34` = **1.2** |
| `ERUPTION_REACH` (`StormRenderer.ts:77`) | field diagonal | — | — | Derived from both field constants |
| `patchLook` / `drawPatch` (`StormRenderer.ts:147,234`) | radius passed through | `patch.radius` | — | Drawn rim = collision radius exactly, by design (`:141-145`) |
| `ringRadius` (`StormRenderer.ts:414`) | imported from `bell.ts:66` | — | — | Single source, correct |
| `GraveRenderer.redraw` (`GraveRenderer.ts:177-185`) | uses `graveWidth` | `grave.ts:71` | — | Single source, correct |
| `boundaryReadout` (`fieldFrame.ts:18`) | field rect | — | — | Single source, correct |

No render constant *contradicts* a sim constant. The two intentional divergences (drop, shot) are documented and the direction is stated.

---

## 8. Leaks and disguised field dimensions

### Leak 1 — the Wall's count 22 is `FIELD_WIDTH / shambler width` with the arithmetic done by hand

`src/game/stage/stage.ts:102`:
```
{ t: 2, template: 'wall', count: 22, type: 'shambler' },
```
`wall()` computes `spacing = FIELD_WIDTH / count` (`src/game/stage/templates.ts:180`). The guarantee that the curtain has **no gap the floor-size grave can slip through** rests on `540/22 = 24.545` against a 22-fu body giving 2.545-fu gaps, which is less than the 18-fu floor grave. That reasoning lives only in a prose comment at `src/game/mobs.ts:63-67` and a second at `src/game/stage/stage.ts:58-62`. Nothing computes it, nothing tests it against `FIELD_WIDTH`, and the count sits in a data table that reaches neither the field nor the mob table (`templates.ts:3-7` forbids the latter by design). **Change `FIELD_WIDTH` and the Wall silently opens.** This is the single most load-bearing magic literal in the codebase.

### Leak 2 — `TERRITORY_OFFSET = 456` is exactly `0.6 × FIELD_HEIGHT`, written as a literal

`src/game/lines/territory.ts:26`. `456 / 760 = 0.600` exactly. The comment says the number is PROVISIONAL and deliberately unbounded, and does not claim a derivation — but the coincidence is exact, and a change to `FIELD_HEIGHT` would leave the patch's travel time (`456 / SCROLL_SPEED` = 720 ticks = 12.0 s) uncoupled from the field it crosses. `TERRITORY_CAP = 24` is then sized *against* that 12-second window (`src/game/caps.ts:98-104`), so the literal has a second consumer downstream.

### Leak 3 — a phone's CSS-pixel budget reaches into three sim and near-sim constants

The "0.72 CSS pixels per field unit on a 390-wide phone" figure is used as the *justification* for:
- `SIZE_FLOOR = 18` (`src/game/tuning.ts:60-66`) — "a floor grave is roughly 13 CSS pixels across. Narrower than this and it stops reading as a grave shape."
- `BOUNDARY_STROKE = 2` (`src/app/layout.ts:20-35`) — an APCA rendered-pixel floor converted through 0.72.
- `GRAVE_RIM_STROKE = 3` (`src/app/screens/game/GraveRenderer.ts:11-31`) — "not thinner than about 2 CSS pixels on the phone, which is 2.77 units".
- `SHOT_DRAW_SCALE = 1.6` (`src/app/screens/game/mobFireSprite.ts:11-18`) — sized so the drawn shot reaches 11.5 CSS px.

Only `SIZE_FLOOR` is in `src/game`, so the import fence is not violated. But **a screen dimension is the deciding argument for a simulation constant**, and it is a screen dimension nothing enforces: the derivation assumes a 390-px viewport and would be wrong on any other.

### Leak 4 — `STEER_SLOP` is a viewport quantity living in an input model as a field-unit default

`src/input/touch.ts:25` — `const STEER_SLOP = 4;` in field units, documented at `:14-24` as "the phone's own figure, about 3 CSS pixels there". It is overwritten per viewport by `setSlop(scale)` (`src/app/screens/game/GameScreen.ts:412`, `src/input/touch.ts:99`) from `STEER_SLOP_STAGE_UNITS = 3` (`src/app/screens/game/steering.ts:42`). The default `4` is only ever seen before the first resize, or in tests. It is the one place a viewport-derived number sits inside a module that produces sim commands — deliberately, and it is documented, but it is a leak by the letter of the rule.

### Leak 5 — the engine's fallback resize floor is a hardcoded screen size

`src/engine/resize/ResizePlugin.ts:145-150`:
```
app.resizeOptions = { minWidth: 768, minHeight: 1024, letterbox: true, ...options.resizeOptions };
```
`768 × 1024` is an iPad. `src/main.ts:42-46` overrides all three, so this never fires in the shipped game — but it is a field-shaped pair of literals in an engine file, and the comment at `src/main.ts:39-41` records that the field and the stage floor *were* the same numbers written twice once already.

### Leak 6 — the field diagonal is recomputed render-side

`src/app/screens/game/StormRenderer.ts:77-79` computes `sqrt(FIELD_WIDTH² + FIELD_HEIGHT²)` = 932.3 as a render constant. It imports the field, so it cannot drift, but it is a render-side geometry derivation from sim dimensions, and it is the only one.

### Leak 7 — two `SPRITE_STROKE` constants with different values

`src/app/screens/game/foodSprite.ts:13` = `1.5`; `src/app/screens/game/StormRenderer.ts:34` = `1.2`. Same identifier, same concept ("the dark companion"), same ADR cited, different files, different numbers, no cross-reference. `mobSprite.ts:17` imports the 1.5 one; `StormRenderer` uses its own.

### Non-leaks worth recording

- `src/dev/digest.ts:32` `LEFTOVER_AT = 540` is a **tick**, not a field dimension.
- `src/dev/readings/gravePath.ts:18` `BOTTOM_EDGE_MARGIN = FIELD_HEIGHT / 10` and `src/dev/readings/upfieldTraffic.ts:34` `LATERAL_REACH = FIELD_WIDTH / 10` are measurement boundaries, explicitly documented as *not* game rules and deliberately not tied to Territory's own radius (`upfieldTraffic.ts:26-34`).
- `src/dev/bot.ts:89` duplicates the grave's start mark as an expression, and `:151-155` duplicates the containment clamp. Both are dev-only and both are derived from the field constants, so they cannot drift numerically — but they are a second copy of `grave.ts`'s rules.
- The import fence (`src/__tests__/boundary.test.ts`) holds: nothing in `src/game` imports `src/app`, and no viewport value reaches spawn positions, cull bounds, or AI ranges.

### Where "chunky" actually comes from

Nothing here is a leak, but the audit was commissioned against a density complaint, so the arithmetic is worth stating:

- The **field is small in units** relative to what stands on it. 540 fu holds 24.5 shambler bodies edge to edge. A 1080-fu field would hold 49.
- The **grave at ceiling is 25% of the field's width tall** (135 fu) and 12.5% wide. It is 3.07 shambler bodies wide and 6.14 tall.
- A **maxed bell ring is 92.6% of the field's width**, so at level 5 the line is functionally a full-screen pulse rather than a ranged weapon; only 3.7% of the width on each side is outside it from a centred grave.
- A **fresh Territory patch is 17.8% of the width** (96 fu, 4.36 shambler bodies), and up to 24 of them can stand at once (`TERRITORY_CAP`, `src/game/caps.ts:106`) — a potential 24 × 96-fu circles in the food layer.
- The **drop's catch box (28 fu) is larger than any mob body** (max 26) and 1.27× a shambler.
- The **drawn mob shot (16 fu) is 73% of a shambler body**, on an object ADR 0014 calls large; its hitbox is only 10 fu, so the drawn-to-real ratio is 1.6.
- The **caps are far above the content**: `MOB_CAP = 160` against a measured peak of 51 (`src/game/caps.ts:13-16`); `MOB_FIRE_CAP = 400`; `CORPSE_CAP = 200`; `SKULL_CAP = 120`; `WISP_CAP = 64`. Density is bounded by the authored stage, not by the caps.
