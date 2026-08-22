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
 * The grave on screen: a rounded rectangle drawn twice, once as the mouth
 * beneath the food layers and once as the rim above them.
 *
 * Two Graphics in two different layers rather than one, because ADR 0014's
 * stack puts graveMouth beneath the food and graveRim above it, and one
 * Graphics cannot be in two layers.
 */
export class GraveRenderer {
  private readonly mouth = new Graphics();
  private readonly rim = new Graphics();
  private drawnSize: number | null = null;

  /**
   * Puts both pieces into their layers. FieldLayers.clear() empties every layer
   * between runs, so the renderer has to be able to put itself back rather than
   * assume it is still attached.
   */
  public attach(layers: FieldLayers): void {
    layers.layer("graveMouth").addChild(this.mouth);
    layers.layer("graveRim").addChild(this.rim);
  }

  public detach(): void {
    this.mouth.removeFromParent();
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
  public sync(grave: Grave): void {
    if (grave.size !== this.drawnSize) {
      this.redraw(grave.size);
      this.drawnSize = grave.size;
    }
    this.mouth.position.set(grave.x, grave.y);
    this.rim.position.set(grave.x, grave.y);
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
