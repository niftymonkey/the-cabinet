// The food on the field: a corpse or feast fading by its freshness, and a drop
// wearing its own line's silhouette (ADR 0014, ADR 0004).

import { Graphics } from 'pixi.js';

import { TICK_HZ } from '../../../game/clock';
import type { Corpse } from '../../../game/corpses';
import { CORPSE_HALF_EXTENT } from '../../../game/corpses';
import type { WeaponLine } from '../../../game/lines/roster';
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

const drawCorpse = (into: Graphics, corpse: Corpse): void => {
  const tier = CORPSE_TIERS[corpse.tier];
  into
    .clear()
    .poly(polygon(6, CORPSE_HALF_EXTENT))
    .fill({ color: tier.hex })
    .poly(polygon(6, CORPSE_HALF_EXTENT))
    .stroke({
      width: SPRITE_STROKE,
      color: PALETTE.foodOutline.hex,
      alignment: 0.5,
    });
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

// How far the flicker drops on its dark half.
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
 * Half of a drop's drawn extent at the breath's peak: a 24-unit drawn ceiling
 * against a corpse's 14 and a mob-fire shot's 16. Twenty-four is the value
 * Mark played in the prototype, and the breath only moves inward from it.
 *
 * Weight is the first half of the at-a-glance line read: a player cannot judge
 * which line a drop upgrades until the drop itself is the loudest thing near it.
 *
 * The catch box (DROP_HALF_EXTENT, 28 units) is deliberately more generous
 * than this drawn peak, about 1.17 times the ink, so collecting treasure is
 * never a precision test: the breath moves the visible edge, and ADR 0003
 * already rules that size never gates a swallow. Raising that box was a sim
 * change, and old sealed tapes replaying differently is expected; the witness
 * refusing them is the system working (Mark's general ruling, 2026-08-25).
 * The retired bound tying the drop's box to graveWidth(SIZE_FLOOR) is
 * superseded, written out in docs/design/drop-legibility-fix.md.
 */
const DROP_DRAW_HALF_EXTENT = 12;

/**
 * How long one breath takes, in ticks: 2.75 seconds, the period Mark played.
 *
 * Derived from TICK_HZ rather than written as 165, because the figure that was
 * chosen is the duration and a later change to the tick rate must not silently
 * rescale it.
 */
const DROP_BREATH_TICKS = Math.round(2.75 * TICK_HZ);

/**
 * How far the breath dips the drawing below its peak, as a share of the drawn
 * size.
 *
 * The breath is what separates a drop from the still corpses around it, and it is
 * spent on size alone. Brightness was played against it on 2026-08-25 and ruled
 * out: steady-bright means treasure (ADR 0004), the corpse's last-chance flicker
 * owns the value channel, and graveGlow is exempted from sharing this colour on
 * the written grounds that the glow pulses where a drop is steady. A size pulse
 * leaves all three standing.
 *
 * It only ever dips inward, because the peak is the ceiling: "keep 24 as the
 * maximum and have the size breath move inward from there" (Mark, 2026-08-25).
 */
const DROP_BREATH_DEPTH = 0.18;

/**
 * How far apart one id sits from the next in the breath's cycle.
 *
 * Ids are handed out in sequence, so an eruption's drops arrive with adjacent
 * ones. Adding the bare id moves a neighbour by a single tick of the period,
 * which is the lockstep the offset exists to break. The stride is prime, so it
 * shares no factor with the period and never folds a run of ids onto one phase,
 * and it is close to the golden section of the period, which is the ratio that
 * keeps successive ids furthest apart.
 */
const DROP_BREATH_ID_STRIDE = 103;

/**
 * How much of its drawn size a drop wears on this tick.
 *
 * The tick and the drop's own id are the only inputs. The renderer is a pure
 * function of sim state, and a wall clock here would make a replay disagree
 * with the run it replays. The id offsets each drop's phase, the same device
 * the corpse flicker already uses, so a field of drops does not pulse in
 * lockstep.
 */
const dropBreath = (tick: number, id: number): number => {
  const offset = id * DROP_BREATH_ID_STRIDE;
  const phase = ((tick + offset) / DROP_BREATH_TICKS) * Math.PI * 2;
  return 1 - DROP_BREATH_DEPTH * (0.5 + 0.5 * Math.sin(phase));
};

/**
 * A drop, as a steady-bright icon of its own line's silhouette.
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
 */
const drawDropIcon = (
  into: Graphics,
  line: WeaponLine,
  extent: number,
): void => {
  const r = extent;
  if (line === 'soulStream') {
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
 * A drop on the field: its line's silhouette in treasure's colour, with the food
 * layer's own companion around it.
 *
 * The silhouette is solid to its outline. Nothing dark is drawn through the
 * middle, because the bright field of the sprite is what carries the read, and
 * the coverage floor in FieldRenderer.test.ts fails if it hollows out again.
 *
 * The breath rebuilds the geometry and is never a scale on the sprite: a sprite
 * scale would scale the stroke with it, and the companion has to hold
 * SPRITE_STROKE on screen at every phase, the width ADR 0014's brackets grade.
 * The per-tick rebuild is bounded by the handful of drops alive at once, never
 * a wave.
 */
const drawDrop = (into: Graphics, corpse: Corpse, tick: number): void => {
  const line = corpse.line ?? 'soulStream';
  const extent = DROP_DRAW_HALF_EXTENT * dropBreath(tick, corpse.id);
  into.clear();
  drawDropIcon(into, line, extent);
  into.fill({ color: PALETTE.drop.hex });
  drawDropIcon(into, line, extent);
  into.stroke({
    width: SPRITE_STROKE,
    color: PALETTE.foodOutline.hex,
    alignment: 0.5,
  });
};

export {
  drawCorpse,
  drawDrop,
  freshnessBrightness,
  freshnessTint,
  polygon,
  DROP_DRAW_HALF_EXTENT,
  FLICKER_HALF_PERIOD,
  SPRITE_STROKE,
};
