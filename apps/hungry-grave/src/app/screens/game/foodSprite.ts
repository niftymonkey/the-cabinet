// The food on the field: a corpse or feast fading by its freshness, and a
// treasure body wearing its own line's silhouette (ADR 0014, ADR 0004).

import { Graphics } from 'pixi.js';

import { TICK_HZ } from '../../../game/clock';
import type { Corpse } from '../../../game/corpses';
import { CORPSE_HALF_EXTENT } from '../../../game/corpses';
import type { WeaponLine } from '../../../game/lines/roster';
import type { CorpseTier } from '../../../game/mobs';
import { CORPSE_TIERS, PALETTE } from '../../palette';

// The dark companion every mob body and corpse draws with (section 4.15.2).
const SPRITE_STROKE = 1.5;

// A regular polygon's points, as a flat list, starting at the top.
const polygon = (sides: number, radius: number, turn = 0): number[] => {
  const points: number[] = [];
  for (let corner = 0; corner < sides; corner++) {
    const angle = turn + (corner / sides) * Math.PI * 2 - Math.PI / 2;
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  return points;
};

const paintCorpseBody = (into: Graphics, tier: CorpseTier): void => {
  into
    .poly(polygon(6, CORPSE_HALF_EXTENT))
    .fill({ color: CORPSE_TIERS[tier].hex })
    .poly(polygon(6, CORPSE_HALF_EXTENT))
    .stroke({
      width: SPRITE_STROKE,
      color: PALETTE.foodOutline.hex,
      alignment: 0.5,
    });
};

const drawCorpse = (into: Graphics, corpse: Corpse): void => {
  into.clear();
  paintCorpseBody(into, corpse.tier);
};

// How dark a corpse fades to at empty, as a share of its declared colour.
const CORPSE_FADE_FLOOR = 0.25;

// Below this freshness a corpse flickers, which is its last-chance warning (ADR 0004).
const FLICKER_BELOW = 0.2;

/**
 * Half the flicker's period, in ticks: 2.5 Hz.
 *
 * It was 6, which is 5 Hz. A single corpse was covered by WCAG SC 2.3.1's
 * small-area exemption, but a burst kill lands a whole wave of corpses at once
 * and a wave flashing together is not, and the criterion invokes Non-Interference
 * so a game gets no essential-to-functionality carve-out. Twelve clears the
 * eleven-tick floor tuning.ts already derives from the three-flashes-a-second
 * limit. Nothing could produce a burst kill before the storm existed.
 */
const FLICKER_HALF_PERIOD = 12;

// How far the flicker power-ups on its dark half.
const FLICKER_DEPTH = 0.45;

/**
 * How bright a corpse draws. Freshness is a multiplicative tint on the declared
 * hex and never an alpha over the night: an alpha fade would rotate a cream
 * corpse's hue toward the ground it lies on as it drains, so every hue check in
 * the palette test would be reasoning about a colour the sprite never is.
 *
 * Feasts never decay, so they never fade.
 */
const freshnessBrightness = (corpse: Corpse, tick: number): number => {
  if (!corpse.decays) return 1;
  const faded =
    CORPSE_FADE_FLOOR + (1 - CORPSE_FADE_FLOOR) * Math.max(0, corpse.freshness);
  if (corpse.freshness >= FLICKER_BELOW) return faded;
  // Each corpse's phase is offset by its own id, one tick per id, so a wave
  // killed in one burst spreads its switches across the period instead of
  // changing together: the area changing luminance on any one tick is a
  // twelfth of the wave, which is the hazard SC 2.3.1 is written about. The
  // offset is the id and not a random draw, because the renderer must stay a
  // pure function of the sim's own state.
  const phase = Math.floor((tick + corpse.id) / FLICKER_HALF_PERIOD);
  return phase % 2 === 0 ? faded * FLICKER_DEPTH : faded;
};

// One byte's full value, for building a grey tint without writing a colour literal.
const CHANNEL_MAX = 255;

// A grey tint at a given brightness. pixi multiplies it into the drawn colour, which is what makes the fade a tint and not an alpha.
const greyTint = (brightness: number): number => {
  const level = Math.max(
    0,
    Math.min(CHANNEL_MAX, Math.round(brightness * CHANNEL_MAX)),
  );
  return (level << 16) | (level << 8) | level;
};

// The tint a corpse wears on this tick: its freshness as the grey pixi multiplies in.
const freshnessTint = (corpse: Corpse, tick: number): number =>
  greyTint(freshnessBrightness(corpse, tick));

/**
 * Half of a power-up's drawn extent at the breath's peak: a 24-unit drawn ceiling
 * against a corpse's 14 and a mob-fire shot's 16. Twenty-four is the value
 * Mark played in the prototype, and the breath only moves inward from it.
 *
 * Weight is the first half of the at-a-glance line read: a player cannot judge
 * which line a power-up upgrades until the power-up itself is the loudest thing near it.
 *
 * The catch box (POWER_UP_HALF_EXTENT, 28 units) is deliberately more generous
 * than this drawn peak, about 1.17 times the ink, so collecting treasure is
 * never a precision test: the breath moves the visible edge, and ADR 0003
 * already rules that size never gates a swallow. Raising that box was a sim
 * change, and old sealed tapes replaying differently is expected; the witness
 * refusing them is the system working (Mark's general ruling, 2026-08-25).
 * The retired bound tying the power-up's box to graveWidth(SIZE_FLOOR) is
 * superseded, written out in docs/design/drop-legibility-fix.md.
 */
const POWER_UP_DRAW_HALF_EXTENT = 12;

/**
 * How long one breath takes, in ticks: 2.75 seconds, the period Mark played.
 *
 * Derived from TICK_HZ rather than written as 165, because the figure that was
 * chosen is the duration and a later change to the tick rate must not silently
 * rescale it.
 */
const POWER_UP_BREATH_TICKS = Math.round(2.75 * TICK_HZ);

/**
 * How far the breath dips the drawing below its peak, as a share of the drawn
 * size.
 *
 * The breath is what separates a power-up from the still corpses around it, and it is
 * spent on size alone. Brightness was played against it on 2026-08-25 and ruled
 * out: steady-bright means treasure (ADR 0004), and the corpse's last-chance
 * flicker owns the value channel. A size pulse leaves both standing.
 *
 * It only ever dips inward, because the peak is the ceiling: "keep 24 as the
 * maximum and have the size breath move inward from there" (Mark, 2026-08-25).
 */
const POWER_UP_BREATH_DEPTH = 0.18;

/**
 * How far apart one id sits from the next in the breath's cycle.
 *
 * Ids are handed out in sequence, so an eruption's power-ups arrive with adjacent
 * ones. Adding the bare id moves a neighbour by a single tick of the period,
 * which is the lockstep the offset exists to break. The stride is prime, so it
 * shares no factor with the period and never folds a run of ids onto one phase,
 * and it is close to the golden section of the period, which is the ratio that
 * keeps successive ids furthest apart.
 */
const POWER_UP_BREATH_ID_STRIDE = 103;

/**
 * How much of its drawn size a power-up wears on this tick.
 *
 * The tick and the power-up's own id are the only inputs. The renderer is a pure
 * function of sim state, and a wall clock here would make a replay disagree
 * with the run it replays. The id offsets each power-up's phase, the same device
 * the corpse flicker already uses, so a field of power-ups does not pulse in
 * lockstep.
 */
const powerUpBreath = (tick: number, id: number): number => {
  const offset = id * POWER_UP_BREATH_ID_STRIDE;
  const phase = ((tick + offset) / POWER_UP_BREATH_TICKS) * Math.PI * 2;
  return 1 - POWER_UP_BREATH_DEPTH * (0.5 + 0.5 * Math.sin(phase));
};

/**
 * A power-up, as a steady-bright icon of its own line's silhouette.
 *
 * The four have to be told apart mid-dodge with no HUD glance, so they split on
 * the coarsest axis a silhouette has: tall, round, pointed, wide. A
 * corner-of-the-eye read resolves an aspect ratio and nothing finer, so four
 * outlines differing in detail are one shape to the player who is dodging.
 *
 * The mapping follows the natural imagery, a grasping hand tall, a skull round,
 * a flame pointed, a bell wide, so #31's playtest never learns a mapping #38's
 * art would invert.
 *
 * Each fills its box on its long axis. Ticket #38 may replace the imagery and
 * must hold both of those: the four aspects stay apart, and each one still fills
 * its box.
 *
 * The extent passed in is the drawn one, already carrying the breath, and never
 * the hitbox.
 *
 * The ladder HUD's row draws these same silhouettes at its own size, so the
 * offer's body and the row teach one vocabulary and a fallen rung wears the
 * icon its row taught (`LadderHud.ts`, design record R6). Both properties above
 * bind at the row's size too, and a replacement at #38 has to hold them there.
 */
const drawPowerUpIcon = (
  into: Graphics,
  line: WeaponLine,
  extent: number,
): void => {
  const r = extent;
  if (line === 'skullStream') {
    into.circle(0, 0, r);
    return;
  }
  if (line === 'territory') {
    // A hand reaching up out of the ground: three fingers, a palm and a wrist,
    // held inside the same tall box the headstone slab spanned so the four
    // aspects stay exactly as far apart as they were. The imagery is a plain
    // first pass and is #38's to replace; what it must keep is this aspect and
    // the coverage floor beneath it.
    into.poly([
      -r * 0.34,
      -r * 0.82,
      -r * 0.15,
      -r * 0.82,
      -r * 0.15,
      -r * 0.45,
      -r * 0.08,
      -r * 0.45,
      -r * 0.08,
      -r,
      r * 0.08,
      -r,
      r * 0.08,
      -r * 0.45,
      r * 0.15,
      -r * 0.45,
      r * 0.15,
      -r * 0.82,
      r * 0.34,
      -r * 0.82,
      r * 0.34,
      r * 0.55,
      r * 0.22,
      r,
      -r * 0.22,
      r,
      -r * 0.34,
      r * 0.55,
    ]);
    return;
  }
  if (line === 'wisps') {
    // The half-width is set so the kite's own filled area beats a corpse's
    // hexagon at the breath's peak; at 0.42 it measured five percent under.
    into.poly([0, -r, r * 0.48, r * 0.72, 0, r, -r * 0.48, r * 0.72]);
    return;
  }
  into.poly([
    -r,
    r * 0.52,
    -r * 0.44,
    -r * 0.52,
    r * 0.44,
    -r * 0.52,
    r,
    r * 0.52,
  ]);
};

/**
 * The body a maxed run's carrier opens: treasure carrying no option at all.
 *
 * It wears the food layer's own body shape rather than any line's silhouette,
 * because there is no line to read, and it is filled in the feast's colour
 * rather than the power-up's, so a maxed player reads permanent food with no build
 * instead of hunting for which line a power-up-coloured body upgrades. It keeps the
 * power-up's size and breath, which is what still says treasure.
 */
const drawOptionlessBody = (into: Graphics, extent: number): void => {
  into
    .poly(polygon(6, extent))
    .fill({ color: PALETTE.feast.hex })
    .poly(polygon(6, extent))
    .stroke({
      width: SPRITE_STROKE,
      color: PALETTE.foodOutline.hex,
      alignment: 0.5,
    });
};

/**
 * A treasure body on the field: its line's silhouette in treasure's colour,
 * with the food layer's own companion around it.
 *
 * An offer's body and a fallen rung both wear it, and the sharing is deliberate
 * (design record R6): both are treasure, the icon is what parts one line's rung
 * from another's, and the treasure body itself is what parts a rung from a
 * corpse. Which bodies wear it is the food's own row and never a kind test here
 * (corpses.ts).
 *
 * The silhouette is solid to its outline. Nothing dark is drawn through the
 * middle, because the bright field of the sprite is what carries the read, and
 * the coverage floor in FieldRenderer.test.ts fails if it hollows out again.
 *
 * The breath rebuilds the geometry and is never a scale on the sprite: a sprite
 * scale would scale the stroke with it, and the companion has to hold
 * SPRITE_STROKE on screen at every phase, the width ADR 0014's brackets grade.
 * The per-tick rebuild is bounded by the handful of power-ups alive at once, never
 * a wave.
 */
const paintTreasureBody = (
  into: Graphics,
  line: WeaponLine | undefined,
  extent: number,
): void => {
  if (line === undefined) {
    drawOptionlessBody(into, extent);
    return;
  }
  drawPowerUpIcon(into, line, extent);
  into.fill({ color: PALETTE.powerUp.hex });
  drawPowerUpIcon(into, line, extent);
  into.stroke({
    width: SPRITE_STROKE,
    color: PALETTE.foodOutline.hex,
    alignment: 0.5,
  });
};

const drawTreasureBody = (
  into: Graphics,
  corpse: Corpse,
  tick: number,
): void => {
  into.clear();
  paintTreasureBody(
    into,
    corpse.line,
    POWER_UP_DRAW_HALF_EXTENT * powerUpBreath(tick, corpse.id),
  );
};

/** What a piece of food looks like, carried as values rather than as a body. */
interface FoodLook {
  readonly tier: CorpseTier;
  readonly treasureBody: boolean;
  readonly line?: WeaponLine;
}

/**
 * A piece of food drawn from what it looked like rather than from the body it
 * was, for the fall, whose body left the field on the tick it tipped (design
 * record R5).
 *
 * Treasure draws at its own peak and takes no breath: the breath is what parts
 * a power-up lying on the field from the still bodies round it, and a body on
 * its way into the hole has nothing to be told apart from.
 */
const drawFoodBody = (into: Graphics, look: FoodLook): void => {
  into.clear();
  if (!look.treasureBody) {
    paintCorpseBody(into, look.tier);
    return;
  }
  paintTreasureBody(into, look.line, POWER_UP_DRAW_HALF_EXTENT);
};

export {
  drawCorpse,
  drawFoodBody,
  drawTreasureBody,
  drawPowerUpIcon,
  freshnessBrightness,
  freshnessTint,
  greyTint,
  polygon,
  POWER_UP_DRAW_HALF_EXTENT,
  FLICKER_HALF_PERIOD,
  SPRITE_STROKE,
};
export type { FoodLook };
