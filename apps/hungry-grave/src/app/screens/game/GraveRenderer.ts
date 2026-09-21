import { Container, Graphics } from 'pixi.js';

import type { Grave } from '../../../game/grave';
import { graveWidth } from '../../../game/grave';
import { PALETTE } from '../../palette';
import {
  BITE_REACH,
  BLADE_WIDTH,
  CORNER_EDGE_INK,
  CORNER_EDGE_WIDTH,
  FACE_BANDS,
  FACE_MOON,
  GRAVE_VIEW,
  LIP_BITES,
  MARGIN_DARK_ALPHA,
  MARGIN_PALE_ALPHA,
  MARGIN_PATCH,
  MARGIN_REACH,
  MARGIN_SWELL,
  NEAR_LIP_FROM,
  OVERHANGING_GRASS,
  TUFT_ALPHA,
  TUFT_BLADES,
  TUFT_FAN,
  TUFTS,
  TURF_SHADOW,
  TURF_SHADOW_ALPHA,
  TURF_SHADOW_FAR,
} from './graveDrawingValues';
import { belowGround, lightAtDepth } from './graveProjection';
import type { Spot } from './graveProjection';
import type { FieldLayers } from './layering';

/**
 * The rim's stroke in field units, stroked inward.
 *
 * Do not derive this from BOUNDARY_STROKE's reasoning. That path gives 8, and
 * at SIZE_FLOOR two 8-unit rims leave 2 units of mouth on an 18-unit grave: the
 * grave stops being a hole exactly when the player most needs to read it.
 * BOUNDARY_STROKE sits in APCA's Lc 30 bracket, which carries a 5.5 rendered
 * pixel floor, because fieldFrame cannot be raised far enough to reach Lc 45
 * against night without eating mob fire's own margin. graveRim is not in that
 * position: it measures Lc 52.9 against night and Lc 53.4 against graveHole,
 * both inside the Lc 45 fine-detail bracket, and that bracket carries no pixel
 * floor at all. An APCA bracket belongs to the element it was chosen for.
 *
 * With no floor from APCA the number is bracketed from both ends instead. Not
 * thinner than about 2 CSS pixels on the phone, which is 2.77 units, borrowing
 * WCAG 2.2 SC 2.4.13's focus indicator area loosely as the nearest published
 * figure for a thin outline a person must see, and nothing more. And not
 * thicker than 4, so that at SIZE_FLOOR the mouth's interior stays wider than a
 * power-up. 3 is the only integer in that bracket with margin at both ends, and it
 * leaves a floor grave a mouth 12 units wide.
 *
 * It is a field unit and not a share of the opening, which is why the three rim
 * jobs are redrawn on a size change while the hole's art is built once and
 * scaled: a stroke scaled with the art would thin exactly where this bracket
 * needs it most (design record R4, "What scales and what does not").
 */
const GRAVE_RIM_STROKE = 3;

/**
 * The rim's dark companion, stroked inward immediately inside the bright band,
 * in field units.
 *
 * ADR 0014 requires the rim to read above the food layer even under a pile, and
 * graveRim measures APCA Lc 0.00 against corpse, feast, power-up and mob, all four.
 * Re-valuing either side is arithmetically impossible, so the rim becomes two
 * colours, which is ADR 0014's own construction for exactly this problem. The
 * pair spans 62.12 luma and the dark band clears the Lc 45 fine-detail bracket
 * against everything the rim can cross.
 *
 * It costs the mouth one unit on each side, so a floor-size grave reads ten
 * units wide inside its rim rather than twelve. Nothing is drawn outside the
 * hitbox and the hitbox is untouched. What binds a power-up is the grave's own
 * width and never the mouth's interior: ADR 0003 rules that size never gates a
 * swallow, so the mouth is not a gate.
 */
const GRAVE_RIM_SHADOW = 1;

/**
 * The reservoir's glow is the rim's own band wearing treasure's colour, drawn
 * over it at the identical geometry rather than as a ring of its own.
 *
 * It takes no width at all, which is what ADR 0003 requires: that ADR makes the
 * drawn grave the health bar and graveHitbox is exactly the sim rect, so the
 * visible outer edge has to equal the hitbox. A glow standing outside the rim
 * would make the grave read wider than the box the player passes under, and a
 * glow standing inside it would eat the mouth at the size floor, where the hole
 * most needs to read as a hole.
 *
 * Its dark companion is the rim's own graveHole band, already stroked one unit
 * inside it, so the pair is the construction ADR 0014 asks for without a second
 * dark edge of its own.
 */
// How fast the glow pulses at a full reservoir, in ticks per cycle.
const GLOW_PULSE_TICKS = 40;

// How far the pulse swings, as a share of full brightness.
const GLOW_PULSE_DEPTH = 0.35;

/**
 * How bright the glow draws at this much charge, and this far into a pulse.
 *
 * Below full it builds with the fullness alone, so the player reads the meter on
 * the thing they are already looking at. At full it pulses, which is the concept
 * doc's own language for the feast beat, and pulsing rather than brightening
 * further is what makes full a state rather than the top of a ramp.
 */
const glowAlpha = (fullness: number, tick: number): number => {
  const charge = Math.max(0, Math.min(1, fullness));
  if (charge < 1) return charge;
  const phase = (tick % GLOW_PULSE_TICKS) / GLOW_PULSE_TICKS;
  return 1 - GLOW_PULSE_DEPTH * (1 - Math.cos(phase * Math.PI * 2)) * 0.5;
};

/**
 * How many segments Territory's charge arc is sampled at. It doubles as the
 * redraw quantum: the charge moves every tick, and rebuilding the trace only
 * when it crosses a segment keeps the redraw rate at the arc's own visible
 * resolution rather than the clock's.
 */
const ARC_SEGMENTS = 64;

/** A place on a rectangle's perimeter, and the way out of the rectangle there. */
interface Lip {
  readonly x: number;
  readonly y: number;
  readonly outX: number;
  readonly outY: number;
}

/**
 * A point this far around a rectangle's perimeter, clockwise from top-centre,
 * with `along` from 0 to 1, and the outward normal at it. The rectangle is
 * centred on the origin.
 *
 * Piecewise over the four edges, because the grave is a true rectangle: the
 * mouth is the rule's own geometry under R1, and the rounded corner the drawing
 * used to carry made the drawn hole a shape the sim never had.
 */
const aroundTheRectangle = (
  width: number,
  height: number,
  along: number,
): Lip => {
  const total = 2 * width + 2 * height;
  let s = ((along % 1) + 1) % 1;
  s *= total;

  if (s < width / 2) return { x: s, y: -height / 2, outX: 0, outY: -1 };
  s -= width / 2;
  if (s < height) {
    return { x: width / 2, y: -height / 2 + s, outX: 1, outY: 0 };
  }
  s -= height;
  if (s < width) return { x: width / 2 - s, y: height / 2, outX: 0, outY: 1 };
  s -= width;
  if (s < height) {
    return { x: -width / 2, y: height / 2 - s, outX: -1, outY: 0 };
  }
  s -= height;
  return { x: -width / 2 + s, y: -height / 2, outX: 0, outY: -1 };
};

/**
 * The mouth in the grave's own half-lengths: one unit is the size, so the
 * opening runs from -1 to 1 down the field and the width comes off the sim's
 * own graveWidth rather than from the aspect written out a second time.
 */
const MOUTH_HALF_WIDTH = graveWidth(1) / 2;
const MOUTH_WIDTH = graveWidth(1);
const MOUTH_HEIGHT = 2;

/**
 * The three cut faces the camera can see, each named by the ground edge it
 * hangs under and walked from one end of that edge to the other.
 *
 * The near face is not among them: the camera stands behind the grave, so the
 * whole of that face projects past the near lip and the ground hides it.
 */
const WALL_FACES = [
  {
    moon: FACE_MOON.far,
    from: { x: -MOUTH_HALF_WIDTH, y: -1 },
    to: { x: MOUTH_HALF_WIDTH, y: -1 },
  },
  {
    moon: FACE_MOON.right,
    from: { x: MOUTH_HALF_WIDTH, y: -1 },
    to: { x: MOUTH_HALF_WIDTH, y: 1 },
  },
  {
    moon: FACE_MOON.left,
    from: { x: -MOUTH_HALF_WIDTH, y: 1 },
    to: { x: -MOUTH_HALF_WIDTH, y: -1 },
  },
] as const;

/**
 * A projected spot held inside the opening. The near lip stands between the
 * camera and the bottom of a side face, so the sliver that projects past it is
 * ground and not hole; clipping it here is what keeps the drawn mouth exactly
 * the hitbox (ADR 0003).
 */
const insideTheMouth = (spot: Spot): Spot => ({
  x: Math.min(MOUTH_HALF_WIDTH, Math.max(-MOUTH_HALF_WIDTH, spot.x)),
  y: Math.min(1, Math.max(-1, spot.y)),
});

/** A point on one face: `along` runs its ground edge, `depth` is in half-lengths. */
const onTheFace = (
  face: (typeof WALL_FACES)[number],
  along: number,
  depth: number,
): Spot =>
  insideTheMouth(
    belowGround(
      face.from.x + (face.to.x - face.from.x) * along,
      face.from.y + (face.to.y - face.from.y) * along,
      depth,
      GRAVE_VIEW,
    ),
  );

/**
 * One band of one cut face, as the quad between two depths, painted in the
 * moonlight that reaches the middle of it.
 *
 * Flat bands rather than one gradient fill: the light dies on a curve and a
 * Graphics fill is one colour, so the curve is carried by the stack. Each band
 * is laid over the black, so its own alpha is the whole of how much moon it
 * keeps and the deep end fades into the black rather than meeting anything.
 */
const paintFaceBand = (
  into: Graphics,
  face: (typeof WALL_FACES)[number],
  band: number,
): void => {
  const top = (GRAVE_VIEW.darkDepth * band) / FACE_BANDS;
  const bottom = (GRAVE_VIEW.darkDepth * (band + 1)) / FACE_BANDS;
  const light = lightAtDepth((top + bottom) / 2, GRAVE_VIEW);
  const corners = [
    onTheFace(face, 0, top),
    onTheFace(face, 1, top),
    onTheFace(face, 1, bottom),
    onTheFace(face, 0, bottom),
  ];
  into
    .poly(corners.flatMap((corner) => [corner.x, corner.y]))
    .fill({ color: PALETTE.graveWall.hex, alpha: light * face.moon });
};

/**
 * The two edges where the far face meets a side face, each running from a
 * corner of the opening down into the shaft and going out with everything
 * around it. It is what turns a pale band across the top of the opening into
 * the back face of a box.
 */
const paintCornerEdges = (into: Graphics): void => {
  for (const side of [-1, 1]) {
    // From the second band down. The first band starts on the opening's own
    // corner, where a stroke's envelope would reach outside the mouth, and a
    // hole drawn past its own rectangle is the thing ADR 0003 forbids.
    for (let band = 1; band < FACE_BANDS; band++) {
      const top = (GRAVE_VIEW.darkDepth * band) / FACE_BANDS;
      const bottom = (GRAVE_VIEW.darkDepth * (band + 1)) / FACE_BANDS;
      const from = belowGround(side * MOUTH_HALF_WIDTH, -1, top, GRAVE_VIEW);
      const to = belowGround(side * MOUTH_HALF_WIDTH, -1, bottom, GRAVE_VIEW);
      const light = lightAtDepth((top + bottom) / 2, GRAVE_VIEW);
      into
        .moveTo(from.x, from.y)
        .lineTo(to.x, to.y)
        .stroke({
          width: MOUTH_WIDTH * CORNER_EDGE_WIDTH,
          color: PALETTE.graveHole.hex,
          alpha: CORNER_EDGE_INK * light,
          cap: 'round',
        });
    }
  }
};

/**
 * The cut earth and the dark under it, in the grave's own half-lengths: the
 * black laid down first over the whole opening, then the three faces the camera
 * can see painted over it, and no floor at all.
 */
const paintTheHole = (into: Graphics): void => {
  into
    .rect(-MOUTH_HALF_WIDTH, -1, MOUTH_WIDTH, MOUTH_HEIGHT)
    .fill({ color: PALETTE.graveHole.hex });
  for (const face of WALL_FACES) {
    for (let band = 0; band < FACE_BANDS; band++) {
      paintFaceBand(into, face, band);
    }
  }
  paintCornerEdges(into);
};

/**
 * The bites out of the lip: short stretches where the ground fell away and left
 * the hole wider. They only ever go outward, and they are drawn under the rim's
 * own rectangle so the grave still reads as the box the player passes under.
 */
const paintLipBites = (into: Graphics): void => {
  for (const bite of LIP_BITES) {
    const at = aroundTheRectangle(MOUTH_WIDTH, MOUTH_HEIGHT, bite.at);
    const out = MOUTH_WIDTH * BITE_REACH * bite.depth;
    const across = MOUTH_WIDTH * bite.span * 2;
    into
      .ellipse(
        at.x + at.outX * out * 0.4,
        at.y + at.outY * out * 0.4,
        at.outX === 0 ? across : out,
        at.outX === 0 ? out : across,
      )
      .fill({ color: PALETTE.graveHole.hex });
  }
};

/**
 * Bare earth where the digging trod the grass off, laid down as overlapping
 * patches rather than as a ring. A ring has an outline, and an even halo round
 * an opening reads as a shadow, which a hole does not cast. Alternating pale
 * and dark, because trodden ground is turned and not swept.
 */
const paintTroddenMargin = (into: Graphics): void => {
  MARGIN_SWELL.forEach((swell, index) => {
    const at = aroundTheRectangle(
      MOUTH_WIDTH,
      MOUTH_HEIGHT,
      index / MARGIN_SWELL.length,
    );
    const away = MOUTH_WIDTH * MARGIN_REACH * swell;
    const pale = index % 2 === 0;
    into
      .ellipse(
        at.x + at.outX * away,
        at.y + at.outY * away,
        MOUTH_WIDTH * MARGIN_PATCH,
        MOUTH_WIDTH * MARGIN_PATCH * 0.6,
      )
      .fill({
        color: pale ? PALETTE.graveWall.hex : PALETTE.graveHole.hex,
        alpha: pale ? MARGIN_PALE_ALPHA : MARGIN_DARK_ALPHA,
      });
  });
};

/** One blade, from its root out along a way, bending by its own lean. */
const paintBlade = (
  into: Graphics,
  root: Spot,
  wayX: number,
  wayY: number,
  reach: number,
  lean: number,
  alpha: number,
): void => {
  const tipX = root.x + wayX * reach;
  const tipY = root.y + wayY * reach;
  // The bend runs across the way, so a blade curves rather than kinking.
  const bendX = root.x + wayX * reach * 0.6 - wayY * lean * reach;
  const bendY = root.y + wayY * reach * 0.6 + wayX * lean * reach;
  into
    .moveTo(root.x, root.y)
    .quadraticCurveTo(bendX, bendY, tipX, tipY)
    .stroke({
      width: MOUTH_WIDTH * BLADE_WIDTH,
      color: PALETTE.graveTurf.hex,
      alpha,
      cap: 'round',
    });
};

/**
 * The tufts growing on the ground round the grave (Mark's decision 7). They are
 * drawn translucent, so the ground under them shows through and changes as the
 * grave moves over it, and they stand outside the lip rather than hemming it.
 */
const paintTufts = (into: Graphics): void => {
  for (const tuft of TUFTS) {
    const at = aroundTheRectangle(MOUTH_WIDTH, MOUTH_HEIGHT, tuft.at);
    const root = {
      x: at.x + at.outX * MOUTH_WIDTH * tuft.out,
      y: at.y + at.outY * MOUTH_WIDTH * tuft.out,
    };
    for (let blade = 0; blade < TUFT_BLADES; blade++) {
      const fan = (blade / (TUFT_BLADES - 1) - 0.5) * TUFT_FAN;
      paintBlade(
        into,
        root,
        at.outX + at.outY * fan,
        at.outY - at.outX * fan,
        MOUTH_WIDTH * tuft.reach,
        tuft.lean,
        TUFT_ALPHA,
      );
    }
  }
};

/**
 * The turf overhangs the cut by a hair, so it throws a line of shadow just
 * inside the edge all the way round, heaviest under the far lip. Stroked inside
 * the opening, so the shadow is the hole's own and never a kerb round it.
 */
const paintTurfShadow = (into: Graphics): void => {
  into
    .rect(-MOUTH_HALF_WIDTH, -1, MOUTH_WIDTH, MOUTH_HEIGHT)
    .stroke({
      width: MOUTH_WIDTH * TURF_SHADOW,
      color: PALETTE.graveHole.hex,
      alpha: TURF_SHADOW_ALPHA,
      alignment: 1,
    })
    // The far lip's own band, filled rather than stroked so it lands wholly
    // inside the opening: that is the edge the turf overhangs toward the camera.
    .rect(-MOUTH_HALF_WIDTH, -1, MOUTH_WIDTH, MOUTH_WIDTH * TURF_SHADOW_FAR)
    .fill({ color: PALETTE.graveHole.hex, alpha: TURF_SHADOW_ALPHA });
};

/**
 * Blades rooted on the grass outside the edge and hanging in over the hole, on
 * the far and the two side edges. Nothing along the near lip: grass there leans
 * toward the camera and only ever reads as a fringe laid across the bottom of
 * the opening.
 */
const paintOverhangingGrass = (into: Graphics): void => {
  for (const blade of OVERHANGING_GRASS) {
    const at = aroundTheRectangle(MOUTH_WIDTH, MOUTH_HEIGHT, blade.at);
    if (at.y > NEAR_LIP_FROM) continue;
    // Rooted half a blade outside the edge, so the root itself is under the turf
    // rather than standing on the cut.
    const root = MOUTH_WIDTH * BLADE_WIDTH;
    paintBlade(
      into,
      { x: at.x + at.outX * root, y: at.y + at.outY * root },
      -at.outX,
      -at.outY,
      MOUTH_WIDTH * blade.reach,
      blade.lean,
      1,
    );
  }
};

/**
 * The grave on screen: a hole cut in the ground, drawn once in the grave's own
 * half-lengths and scaled by its size, with the rim, the reservoir's glow and
 * Territory's charge arc above the food on the rim's one geometry.
 *
 * Two layers rather than one, because ADR 0014's stack puts graveMouth beneath
 * the food and graveRim above it, and one Graphics cannot be in two layers.
 *
 * The hole's art is never cleared after it is built: the size changes on every
 * swallow, and every proportion it is built from is a share of the opening, so
 * a swallow is a scale and not a redraw. The three rim jobs keep a fixed stroke
 * in field units and are redrawn on a size change, as they always were (design
 * record R4, "What scales and what does not").
 *
 * The glow takes a number from 0 to 1 and never the RunState. Handing a renderer
 * live sim state is the thing the rest of this design works to avoid, and
 * fullness is everything it needs.
 */
class GraveRenderer {
  private readonly groundArt = new Graphics();
  private readonly mouth = new Graphics();
  /**
   * Where falling food draws: inside the hole, between the cut and the turf, so
   * a body lying across the opening stays visible until it tips. Slice 4 fills
   * it (design record R5, "Falling food draws in a container in the existing
   * graveMouth layer, positioned at the grave"); this slice only puts it in the
   * one place the draw order is decided.
   *
   * It follows the grave and is never scaled: a fall holds its own place in the
   * grave's proportions and multiplies by the size itself, so a container scaled
   * here would apply the size twice.
   */
  public readonly falls = new Container();
  private readonly overhang = new Graphics();
  private readonly rim = new Graphics();
  private readonly glow = new Graphics();
  private readonly arc = new Graphics();
  private glowSize: number | null = null;
  private rimSize: number | null = null;
  private arcSize: number | null = null;
  private arcStep: number | null = null;

  constructor() {
    paintLipBites(this.groundArt);
    paintTroddenMargin(this.groundArt);
    paintTufts(this.groundArt);
    paintTheHole(this.mouth);
    paintTurfShadow(this.overhang);
    paintOverhangingGrass(this.overhang);
  }

  /**
   * Puts the pieces into their layers, in the order the hole is read from the
   * ground down: the ground outside the lip, the cut and its walls, the place a
   * fall draws, and the turf hanging over the top of it all.
   *
   * FieldLayers.clear() empties every layer between runs, so the renderer has to
   * be able to put itself back rather than assume it is still attached.
   */
  public attach(layers: FieldLayers): void {
    layers
      .layer('graveMouth')
      .addChild(this.groundArt, this.mouth, this.falls, this.overhang);
    layers.layer('graveRim').addChild(this.rim);
    // Over the rim in the same layer, at the rim's own geometry, so a charged
    // grave reads as the rim itself warming rather than as a second shape.
    layers.layer('graveRim').addChild(this.glow);
    // Territory's charge arc rides the same band, over the glow, so the rim
    // does three jobs on one geometry rather than growing a second shape.
    layers.layer('graveRim').addChild(this.arc);
  }

  public detach(): void {
    this.groundArt.removeFromParent();
    this.mouth.removeFromParent();
    this.falls.removeFromParent();
    this.overhang.removeFromParent();
    this.glow.removeFromParent();
    this.arc.removeFromParent();
    this.rim.removeFromParent();
  }

  /**
   * The grave as the sim says it is. Geometry comes from the sim and nowhere
   * else: the half-height is grave.size and the width is graveWidth's, never
   * re-derived here from the aspect.
   *
   * The hole's art is a scale and a position, both free. The rim's three jobs
   * are rebuilt only when the size changes, which is on a swallow or a hit.
   * territoryCharge is territoryCharge(run), 0 to 1: the arc fills with it and
   * empties on the lay, rebuilt only when the charge crosses a segment.
   */
  public sync(
    grave: Grave,
    reservoirFullness: number,
    tick: number,
    territoryCharge: number,
  ): void {
    if (grave.size !== this.rimSize) {
      this.redraw(grave.size);
      this.rimSize = grave.size;
    }
    if (grave.size !== this.glowSize) {
      this.redrawGlow(grave.size);
      this.glowSize = grave.size;
    }
    const step = Math.round(
      Math.max(0, Math.min(1, territoryCharge)) * ARC_SEGMENTS,
    );
    if (grave.size !== this.arcSize || step !== this.arcStep) {
      this.redrawArc(grave.size, step);
      this.arcSize = grave.size;
      this.arcStep = step;
    }
    for (const art of [this.groundArt, this.mouth, this.overhang]) {
      art.position.set(grave.x, grave.y);
      art.scale.set(grave.size);
    }
    this.falls.position.set(grave.x, grave.y);
    this.rim.position.set(grave.x, grave.y);
    this.glow.position.set(grave.x, grave.y);
    this.arc.position.set(grave.x, grave.y);
    // Alpha rather than a redraw, because the charge changes on every swallow
    // and the geometry only changes with the size.
    this.glow.alpha = glowAlpha(reservoirFullness, tick);
  }

  /**
   * The filled share of the rim's perimeter in Territory's colour, clockwise
   * from top-centre. The trace runs on the rim path inset by half the stroke
   * and is stroked centred, so its outer edge equals the hitbox exactly: ADR
   * 0003 makes the drawn grave the health bar, and the arc must never make it
   * read wider.
   */
  private redrawArc(size: number, step: number): void {
    this.arc.clear();
    if (step <= 0) return;
    const width = graveWidth(size) - GRAVE_RIM_STROKE;
    const height = size * 2 - GRAVE_RIM_STROKE;
    const start = aroundTheRectangle(width, height, 0);
    this.arc.moveTo(start.x, start.y);
    for (let segment = 1; segment <= step; segment++) {
      const at = aroundTheRectangle(width, height, segment / ARC_SEGMENTS);
      this.arc.lineTo(at.x, at.y);
    }
    // Round caps and joins: a miter at a sampled corner would spike past the
    // stroke's own envelope, and the envelope is what the hitbox bound rests on.
    this.arc.stroke({
      width: GRAVE_RIM_STROKE,
      color: PALETTE.territory.hex,
      alignment: 0.5,
      cap: 'round',
      join: 'round',
    });
  }

  /**
   * The rim's bright band in treasure's colour, drawn once per size and then
   * only faded. The geometry is the rim's exactly, so the grave's outer edge is
   * unchanged at every charge.
   */
  private redrawGlow(size: number): void {
    const width = graveWidth(size);
    this.glow
      .clear()
      .rect(-width / 2, -size, width, size * 2)
      .stroke({
        width: GRAVE_RIM_STROKE,
        color: PALETTE.graveGlow.hex,
        alignment: 1,
      });
  }

  /**
   * The rim strokes inward, the same as the field's boundary readout. ADR 0003
   * makes the drawn grave the health bar and graveHitbox is exactly the sim
   * rect, so the visible outer edge has to equal the hitbox: a player reads the
   * outer edge as what they pass under and swallow. The cost is that the stroke
   * eats into the mouth, which is why it is thin.
   */
  private redraw(size: number): void {
    const width = graveWidth(size);
    const left = -width / 2;
    const top = -size;

    const inset = GRAVE_RIM_STROKE;
    this.rim
      .clear()
      .rect(left, top, width, size * 2)
      .stroke({
        width: GRAVE_RIM_STROKE,
        color: PALETTE.graveRim.hex,
        alignment: 1,
      })
      .rect(left + inset, top + inset, width - inset * 2, size * 2 - inset * 2)
      .stroke({
        width: GRAVE_RIM_SHADOW,
        color: PALETTE.graveHole.hex,
        alignment: 1,
      });
  }
}

export { glowAlpha, GraveRenderer, GRAVE_RIM_STROKE, GRAVE_RIM_SHADOW };
