// Relative-drag touch steering (ticket #33): the finger rests anywhere and
// the grave copies the finger's movement, scaled by a tunable ratio. Pure
// logic in field units; GameScreen converts pointer pixels and feeds the
// result into the same Input the keyboard feeds.
//
// The model keeps a drag TARGET the grave lands on every step, uncapped:
// the grave IS the finger (decision-log entry 12). The keyboard's designated
// speed is its own setting and no longer bounds touch.

import { FIELD_H, FIELD_W } from '../game/tuning';

export interface SteerRead {
  moveX: number;
  moveY: number;
  belch: boolean;
}

interface PointerPos {
  x: number;
  y: number;
}

export class TouchSteer {
  // Insertion order is the steering order: the earliest finger still down
  // steers, later fingers are belch taps until the steering finger lifts.
  private readonly pointers = new Map<number, PointerPos>();
  private target: PointerPos | null = null;
  // Finger movement that arrived before the first read could anchor the
  // target to the grave's position.
  private pendingX = 0;
  private pendingY = 0;
  private belchQueued = false;

  constructor(public ratio: number) {}

  public down(id: number, x: number, y: number): void {
    // Only the second finger belches; a third (a palm edge, or the debug
    // toggle) must not queue another one.
    if (this.pointers.size === 1) this.belchQueued = true;
    this.pointers.set(id, { x, y });
  }

  public move(id: number, x: number, y: number): void {
    const p = this.pointers.get(id);
    if (p === undefined) return;
    if (id === this.steerId()) {
      const dx = (x - p.x) * this.ratio;
      const dy = (y - p.y) * this.ratio;
      if (this.target !== null) {
        this.target.x = clampX(this.target.x + dx);
        this.target.y = clampY(this.target.y + dy);
      } else {
        this.pendingX += dx;
        this.pendingY += dy;
      }
    }
    p.x = x;
    p.y = y;
  }

  public up(id: number): void {
    this.pointers.delete(id);
    if (this.pointers.size === 0) {
      this.target = null;
      this.pendingX = 0;
      this.pendingY = 0;
    }
  }

  public cancel(): void {
    this.pointers.clear();
    this.target = null;
    this.pendingX = 0;
    this.pendingY = 0;
    this.belchQueued = false;
  }

  public get steering(): boolean {
    return this.pointers.size > 0;
  }

  /** Once per sim step: the movement toward the drag target, in the sim's
   *  Input units (magnitude 1 = one full step of maxStep). */
  public read(graveX: number, graveY: number, maxStep: number): SteerRead {
    const belch = this.belchQueued;
    this.belchQueued = false;
    if (this.pointers.size === 0) return { moveX: 0, moveY: 0, belch };
    if (this.target === null) {
      this.target = {
        x: clampX(graveX + this.pendingX),
        y: clampY(graveY + this.pendingY),
      };
      this.pendingX = 0;
      this.pendingY = 0;
    }
    return {
      moveX: (this.target.x - graveX) / maxStep,
      moveY: (this.target.y - graveY) / maxStep,
      belch,
    };
  }

  private steerId(): number | undefined {
    for (const id of this.pointers.keys()) return id;
    return undefined;
  }
}

function clampX(x: number): number {
  return Math.max(0, Math.min(FIELD_W, x));
}

function clampY(y: number): number {
  return Math.max(0, Math.min(FIELD_H, y));
}
