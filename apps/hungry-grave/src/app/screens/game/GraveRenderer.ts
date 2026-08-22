import { Graphics } from "pixi.js";

import type { Grave } from "../../../game/grave";
import { graveWidth } from "../../../game/grave";
import { PALETTE } from "../../palette";
import type { FieldLayers } from "./layering";

/** The rounded rectangle's corner radius, as a share of the grave's width. */
const GRAVE_CORNER_RATIO = 0.2;

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
 * drop. 3 is the only integer in that bracket with margin at both ends, and it
 * leaves a floor grave a mouth 12 units wide.
 */
export const GRAVE_RIM_STROKE = 3;

/**
 * The rim's dark companion, stroked inward immediately inside the bright band,
 * in field units.
 *
 * ADR 0014 requires the rim to read above the food layer even under a pile, and
 * graveRim measures APCA Lc 0.00 against corpse, feast, drop and mob, all four.
 * Re-valuing either side is arithmetically impossible, so the rim becomes two
 * colours, which is ADR 0014's own construction for exactly this problem. The
 * pair spans 62.12 luma and the dark band clears the Lc 45 fine-detail bracket
 * against everything the rim can cross.
 *
 * It costs the mouth one unit on each side, so a floor-size grave reads ten
 * units wide inside its rim rather than twelve. Nothing is drawn outside the
 * hitbox and the hitbox is untouched. What binds a drop is the grave's own
 * width and never the mouth's interior: ADR 0003 rules that size never gates a
 * swallow, so the mouth is not a gate.
 */
export const GRAVE_RIM_SHADOW = 1;

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
/** How fast the glow pulses at a full reservoir, in ticks per cycle. */
const GLOW_PULSE_TICKS = 40;

/** How far the pulse swings, as a share of full brightness. */
const GLOW_PULSE_DEPTH = 0.35;

/**
 * How bright the glow draws at this much charge, and this far into a pulse.
 *
 * Below full it builds with the fullness alone, so the player reads the meter on
 * the thing they are already looking at. At full it pulses, which is the concept
 * doc's own language for the feast beat, and pulsing rather than brightening
 * further is what makes full a state rather than the top of a ramp.
 */
export function glowAlpha(fullness: number, tick: number): number {
  const charge = Math.max(0, Math.min(1, fullness));
  if (charge < 1) return charge;
  const phase = (tick % GLOW_PULSE_TICKS) / GLOW_PULSE_TICKS;
  return 1 - GLOW_PULSE_DEPTH * (1 - Math.cos(phase * Math.PI * 2)) * 0.5;
}

/**
 * The grave on screen: a rounded rectangle drawn twice, once as the mouth
 * beneath the food layers and once as the rim above them, with the reservoir's
 * glow around it.
 *
 * Two Graphics in two different layers rather than one, because ADR 0014's
 * stack puts graveMouth beneath the food and graveRim above it, and one
 * Graphics cannot be in two layers.
 *
 * The glow takes a number from 0 to 1 and never the RunState. Handing a renderer
 * live sim state is the thing the rest of this design works to avoid, and
 * fullness is everything it needs.
 */
export class GraveRenderer {
  private readonly mouth = new Graphics();
  private readonly rim = new Graphics();
  private readonly glow = new Graphics();
  private drawnSize: number | null = null;
  private glowSize: number | null = null;

  /**
   * Puts both pieces into their layers. FieldLayers.clear() empties every layer
   * between runs, so the renderer has to be able to put itself back rather than
   * assume it is still attached.
   */
  public attach(layers: FieldLayers): void {
    layers.layer("graveMouth").addChild(this.mouth);
    layers.layer("graveRim").addChild(this.rim);
    // Over the rim in the same layer, at the rim's own geometry, so a charged
    // grave reads as the rim itself warming rather than as a second shape.
    layers.layer("graveRim").addChild(this.glow);
  }

  public detach(): void {
    this.mouth.removeFromParent();
    this.glow.removeFromParent();
    this.rim.removeFromParent();
  }

  /**
   * The grave as the sim says it is. Geometry comes from the sim and nowhere
   * else: the half-height is grave.size and the width is graveWidth's, never
   * re-derived here from the aspect.
   *
   * The geometry is rebuilt only when the size changes, which is on a swallow
   * or a hit. Position is a container transform and is free.
   */
  public sync(grave: Grave, reservoirFullness: number, tick: number): void {
    if (grave.size !== this.drawnSize) {
      this.redraw(grave.size);
      this.drawnSize = grave.size;
    }
    if (grave.size !== this.glowSize) {
      this.redrawGlow(grave.size);
      this.glowSize = grave.size;
    }
    this.mouth.position.set(grave.x, grave.y);
    this.rim.position.set(grave.x, grave.y);
    this.glow.position.set(grave.x, grave.y);
    // Alpha rather than a redraw, because the charge changes on every swallow
    // and the geometry only changes with the size.
    this.glow.alpha = glowAlpha(reservoirFullness, tick);
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
      .roundRect(-width / 2, -size, width, size * 2, width * GRAVE_CORNER_RATIO)
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
    const radius = width * GRAVE_CORNER_RATIO;
    const left = -width / 2;
    const top = -size;

    this.mouth
      .clear()
      .roundRect(left, top, width, size * 2, radius)
      .fill({ color: PALETTE.graveHole.hex });

    const inset = GRAVE_RIM_STROKE;
    this.rim
      .clear()
      .roundRect(left, top, width, size * 2, radius)
      .stroke({
        width: GRAVE_RIM_STROKE,
        color: PALETTE.graveRim.hex,
        alignment: 1,
      })
      .roundRect(
        left + inset,
        top + inset,
        width - inset * 2,
        size * 2 - inset * 2,
        Math.max(0, radius - inset),
      )
      .stroke({
        width: GRAVE_RIM_SHADOW,
        color: PALETTE.graveHole.hex,
        alignment: 1,
      });
  }
}
