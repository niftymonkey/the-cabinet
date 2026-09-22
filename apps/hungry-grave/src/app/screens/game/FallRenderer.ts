import { Container, Graphics } from 'pixi.js';

import type { Caps } from '../../../game/caps';
import type { Swallowed } from '../../../game/events';
import type { RunState } from '../../../game/run';
import type { Fall } from './fall';
import { fallAt, FALL_TICKS } from './fall';
import { drawFoodBody, greyTint } from './foodSprite';

/**
 * The food on its way into the hole, drawn from the swallow's own event.
 *
 * It is a pool of its own rather than a second job for the corpse pool, because
 * the body stops being food on the tick it tips: its slot is free for the next
 * kill while the fall it left is still in the air (design record R5).
 *
 * It takes the container it draws into rather than a layer, so each screen
 * declares where falls draw: the two game screens hand it the grave's own falls
 * container, inside the hole and under the turf, and the frame budget screen
 * hands it a bare layer so that what it times is the falls and not a grave.
 */

/**
 * Every transient read this renderer holds across frames, with its lifetime in
 * ticks, for the registry in transients.ts: a fall is born of a past tick, so a
 * replay primed mid-run has to start far enough back to have seen it born.
 */
const FALL_RENDERER_TRANSIENT_TICKS = {
  fall: FALL_TICKS,
} as const;

/** One falling body: where it is in the fall, the sprite, and what it draws as. */
interface Falling {
  readonly sprite: Graphics;
  readonly fall: Fall;
  look: string;
}

/** What a fall carrying this look draws as, so a slot is redrawn only on a change. */
const lookOf = (event: Swallowed): string =>
  `${event.tier}|${String(event.treasureBody)}|${event.line ?? 'none'}`;

/**
 * A slot's fall put back beyond any reach of the run's own ticks, which is what
 * makes it free: sync hides anything whose age is past the whole fall.
 */
const forget = (falling: Falling): void => {
  falling.fall.born = -FALL_TICKS;
  falling.sprite.visible = false;
};

/**
 * A pool at the corpse cap, so a tick that swallows a whole field of food finds
 * a slot for every fall and no swallow ever allocates.
 */
const fill = (falls: Falling[], capacity: number): void => {
  while (falls.length < capacity) {
    const sprite = new Graphics();
    sprite.visible = false;
    falls.push({
      sprite,
      fall: {
        unitX: 0,
        unitY: 0,
        unitVx: 0,
        unitVy: 0,
        halfExtent: 0,
        born: -FALL_TICKS,
      },
      look: '',
    });
  }
};

class FallRenderer {
  private readonly falls: Falling[] = [];

  /**
   * Every sprite into the container the driver names, the pool grown for the
   * run about to be drawn, and the previous run forgotten on the way through,
   * exactly as the field renderer's attach does: a screen's layers are cleared
   * between runs, so a renderer has to be able to put itself back.
   */
  public attach(into: Container, caps: Caps): void {
    fill(this.falls, caps.corpses);
    this.forgetPreviousRun();
    for (const falling of this.falls) into.addChild(falling.sprite);
  }

  public detach(): void {
    for (const falling of this.falls) falling.sprite.removeFromParent();
  }

  /**
   * Every fall of the run that just ended, dropped. A born tick belongs to the
   * run it was taken from, and a fresh run's first ticks are smaller than any
   * of them, so a fall carried over would hang in the hole from the first
   * frame of the new run.
   */
  public forgetPreviousRun(): void {
    for (const falling of this.falls) forget(falling);
  }

  /**
   * One piece of food over the rim, from the swallow's own event.
   *
   * The place and the way are turned into the grave's proportions here, against
   * the size the event carries from the tip: the grave grows on that very tick,
   * and it is the proportions that hold a feast at the rim it crossed while the
   * mouth doubles under it.
   */
  public swallowed(run: RunState, event: Swallowed): void {
    const falling = this.freeSlot(run.tick);
    falling.fall.unitX = event.offsetX / event.graveSize;
    falling.fall.unitY = event.offsetY / event.graveSize;
    falling.fall.unitVx = event.vx / event.graveSize;
    falling.fall.unitVy = event.vy / event.graveSize;
    falling.fall.halfExtent = event.halfExtent;
    falling.fall.born = run.tick;
    const look = lookOf(event);
    if (look === falling.look) return;
    falling.look = look;
    drawFoodBody(falling.sprite, event);
  }

  // Every fall placed for this tick, in the grave's own frame.
  public sync(run: RunState): void {
    for (const falling of this.falls) {
      const age = run.tick - falling.fall.born;
      if (age < 0 || age >= FALL_TICKS) {
        falling.sprite.visible = false;
        continue;
      }
      const drawn = fallAt(falling.fall, age, run.grave.size);
      falling.sprite.visible = !drawn.gone;
      falling.sprite.position.set(drawn.x, drawn.y);
      falling.sprite.rotation = drawn.turn;
      falling.sprite.scale.set(drawn.along, drawn.across);
      falling.sprite.tint = greyTint(drawn.light);
    }
  }

  /**
   * A slot for a new fall: a free one, or the oldest fall still in the air.
   *
   * Nothing abnormal is silent. The pool holds a fall for every body the field
   * can carry, so running it out means more food went in on one tick than the
   * field could hold, and the fall that is dropped is reported rather than
   * disappearing.
   */
  private freeSlot(tick: number): Falling {
    const first = this.falls[0];
    if (first === undefined) throw new Error('no falls in the pool');
    let oldest = first;
    for (const falling of this.falls) {
      if (falling.fall.born < oldest.fall.born) oldest = falling;
    }
    const age = tick - oldest.fall.born;
    if (age < FALL_TICKS) {
      console.warn(
        `the falls pool holds ${this.falls.length} and a fall born at tick ${oldest.fall.born} is ${age} ticks old, so it is being reused at tick ${tick}`,
      );
    }
    return oldest;
  }
}

export { FallRenderer, FALL_RENDERER_TRANSIENT_TICKS };
