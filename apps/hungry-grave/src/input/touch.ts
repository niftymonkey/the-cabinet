/**
 * Uncapped relative drag steering as a pure model: no DOM in it at all. It
 * takes pointer ids and points already in field units, converted by
 * GameScreen through layout.ts's screenToField.
 *
 * Relative rather than absolute (ADR 0011). The player can anchor away from
 * the grave so their own hand need not occlude the thing being steered, and an
 * absolute model would teleport the grave to wherever a finger first lands.
 * Cave went relative across its whole iOS line.
 *
 * Steering is all this model does. The belch is not a steering command: Mark
 * ruled on 2026-08-22 that it binds to a dedicated corner button, because the
 * belch is the scarcest object in the game and is only spendable at the moment
 * it is worth most, so a binding that can misfire is the wrong one.
 */

import type { FieldPoint } from "../game/grave";
import type { MoveCommand } from "../game/run";
import { BASE_SPEED } from "../game/tuning";

export type { FieldPoint };

/**
 * How far the drag target travels per unit of finger travel. A one to one
 * drag, a first pass, and the tuning dispatch owns it. No shipped game
 * publishes its drag ratio, so there is no number to look up.
 */
export const DRAG_RATIO = 1;

/**
 * How far a pointer must travel before it is the steering pointer, in field
 * units. The default is the phone's own figure, about 3 CSS pixels there;
 * GameScreen replaces it per viewport through setSlop, because a finger-jitter
 * threshold is physical and expressing it in field units bakes in one viewport.
 *
 * Deliberately far below Android's 8 dp ViewConfiguration slop, which is
 * calibrated for the harder job of telling a deliberate tap from a scroll and
 * so has to survive the finger roll of a press. Telling a resting thumb from a
 * steering thumb needs far less.
 */
export const STEER_SLOP = 4;

/**
 * How far the grave may sit from the target it was sent to and still count as
 * standing on it, in field units.
 *
 * An exact comparison is unusable: moveGrave computes
 * `x + ((target - x) / BASE_SPEED) * BASE_SPEED`, and that round trip is not
 * exact in binary64 for most positions, so an exact test would re-anchor on
 * every tick and silently drop steering. This is far below anything visible
 * and far above the rounding error, the same shape as clock.ts's
 * TICK_TOLERANCE.
 */
const TARGET_TOLERANCE = 1e-6;

const STILL: MoveCommand = { x: 0, y: 0 };

interface PointerTrack {
  /** Where the slop is measured from: the down position, or the current position after a steering lift. */
  origin: FieldPoint;
  current: FieldPoint;
}

function distance(from: FieldPoint, to: FieldPoint): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** The point a fraction of the way along the segment from one point to another. */
function along(from: FieldPoint, to: FieldPoint, fraction: number): FieldPoint {
  return {
    x: from.x + (to.x - from.x) * fraction,
    y: from.y + (to.y - from.y) * fraction,
  };
}

function apart(a: FieldPoint, b: FieldPoint): boolean {
  return (
    Math.abs(a.x - b.x) > TARGET_TOLERANCE ||
    Math.abs(a.y - b.y) > TARGET_TOLERANCE
  );
}

export class TouchSteer {
  private readonly pointers = new Map<number, PointerTrack>();
  private steeringId: number | null = null;
  private slop = STEER_SLOP;

  /** Where the steering pointer was when it crossed the slop, and where the grave was then. */
  private anchor: FieldPoint | null = null;
  private graveAtAnchor: FieldPoint | null = null;

  /** The previous call's target and the pointer position that produced it, both needed by the re-anchor. */
  private previousTarget: FieldPoint | null = null;
  private previousPointer: FieldPoint | null = null;

  /** The grave as recently as this model has been told, so a promotion anchors to where it is now. */
  private lastGrave: FieldPoint = { x: 0, y: 0 };

  public setSlop(fieldUnits: number): void {
    if (Number.isFinite(fieldUnits) && fieldUnits > 0) this.slop = fieldUnits;
  }

  /** A pointer landing. */
  public down(id: number, point: FieldPoint, grave: FieldPoint): void {
    this.lastGrave = { x: grave.x, y: grave.y };
    this.pointers.set(id, { origin: point, current: point });
  }

  /**
   * A pointer moving. Idempotent by construction: it sets an absolute position
   * rather than accumulating a delta, because globalpointermove is dispatched
   * twice per DOM move on a static container with interactive children.
   */
  public move(id: number, point: FieldPoint): void {
    const track = this.pointers.get(id);
    if (!track) return;
    track.current = point;
    if (this.steeringId !== null) return;
    const travelled = distance(track.origin, point);
    if (travelled > this.slop) {
      this.startSteering(id, along(track.origin, point, this.slop / travelled));
    }
  }

  /**
   * The steering pointer is the first to move past the slop, and it anchors at
   * the crossing point rather than at where it went down. Anchoring at the down
   * position would sit the grave still for the whole slop distance and then
   * teleport it that far in one tick; UIScrollView and AOSP's ScrollView both
   * discard the threshold travel instead, and the case is stronger here because
   * the thing that would jump is the player's own avatar.
   *
   * The crossing point is interpolated along the move that crossed, never taken
   * as that move's endpoint. Pointer moves are coarse on a phone and a flick
   * arrives as one big jump, so an endpoint anchor swallows the whole of the
   * first move and a quick swipe steers nothing at all. What the scroll views
   * discard is the slop distance, and only that: they subtract it from the
   * first delta and deliver the rest.
   */
  private startSteering(id: number, at: FieldPoint): void {
    this.steeringId = id;
    this.anchor = at;
    this.graveAtAnchor = this.lastGrave;
    this.previousTarget = null;
    this.previousPointer = null;
  }

  /**
   * A pointer lifting. On a steering lift the drag clears and does not hand
   * off: a handoff would promote a pointer that has never crossed the slop,
   * which is the grip disaster the slop rule exists to prevent. Every remaining
   * pointer earns the role by crossing the slop from where it currently is.
   */
  public up(id: number): void {
    this.pointers.delete(id);
    if (id !== this.steeringId) return;
    this.clearSteering();
    for (const track of this.pointers.values()) track.origin = track.current;
  }

  private clearSteering(): void {
    this.steeringId = null;
    this.anchor = null;
    this.graveAtAnchor = null;
    this.previousTarget = null;
    this.previousPointer = null;
  }

  /** Every pointer gone. Pause, blur and pointercancel all call this. */
  public cancelAll(): void {
    this.pointers.clear();
    this.clearSteering();
  }

  public isSteering(): boolean {
    return this.steeringId !== null;
  }

  /**
   * The drag never banks travel the grave could not take. moveGrave clamps
   * through containGrave and the drag target knows nothing about that clamp, so
   * without this the overshoot accumulates without bound: integral windup, and
   * in play it gives every field edge a dead zone, worst at the bottom edge
   * where a vertical shmup is actually played.
   *
   * The re-anchor takes the pointer position that produced the previous target,
   * never the pointer's current position. Re-anchoring to the current pointer
   * looks equivalent and is not: it discards the pointer's movement since the
   * last command along with the banked overshoot, which halves lateral speed
   * and stutters rather than lagging.
   *
   * It fires whenever the grave is not where the command put it, for any reason
   * at all. When mob contact arrives, anything that displaces the grave resets
   * the offset and the grave stays where it was left rather than snapping back
   * under the finger. That is the wanted behaviour and nobody has decided it
   * yet.
   */
  private reanchorIfClamped(grave: FieldPoint): void {
    if (!this.previousTarget || !this.previousPointer) return;
    if (!apart(grave, this.previousTarget)) return;
    this.graveAtAnchor = { x: grave.x, y: grave.y };
    this.anchor = this.previousPointer;
  }

  /**
   * The drag as one move command, recomputed on every tick and never sampled
   * once per frame.
   *
   * The command is a position error and not a velocity, and it is not
   * repeatable: with the grave at P and the target at T, applying it once lands
   * the grave on T and applying the same command again lands it on 2T - P. The
   * anchor and the pointer are both frame constants, so recomputing converges
   * instead: once the grave is on the target the recomputed command is zero.
   *
   * It is deliberately uncapped. Capping the drag at keyboard speed for
   * fairness WAS the input lag felt on device (ADR 0011), so no clamp goes here
   * and none goes in moveGrave.
   */
  public command(grave: FieldPoint): MoveCommand {
    this.lastGrave = { x: grave.x, y: grave.y };
    if (this.steeringId === null) return STILL;

    this.reanchorIfClamped(grave);
    const pointer = this.pointers.get(this.steeringId)!.current;
    const anchor = this.anchor!;
    const from = this.graveAtAnchor!;
    const target = {
      x: from.x + (pointer.x - anchor.x) * DRAG_RATIO,
      y: from.y + (pointer.y - anchor.y) * DRAG_RATIO,
    };
    this.previousTarget = target;
    this.previousPointer = pointer;

    return {
      x: (target.x - grave.x) / BASE_SPEED,
      y: (target.y - grave.y) / BASE_SPEED,
    };
  }
}
