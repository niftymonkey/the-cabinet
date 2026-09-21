/**
 * The Undertaker's end as arithmetic: the drag, the furrows, the tip and the
 * fall, as a pure function of how far the scene has run (design record R6).
 */

import { describe, expect, it } from 'vitest';

import {
  BOSS_HALF_HEIGHT,
  BOSS_HALF_WIDTH,
} from '../../../../game/bosses/phases';
import type { BossKilled } from '../../../../game/events';
import type { Grave } from '../../../../game/grave';
import { createGrave, graveWidth } from '../../../../game/grave';
import { SIZE_START } from '../../../../game/tuning';
import { endingSceneAt, sceneFrom } from '../endingScene';
import { DROP_TICKS, fallAt, TIP_TICKS } from '../fall';
import { ENDING_BEATS, ENDING_DRAG_EASE } from '../graveDrawingValues';

/** Where he stood when he died: high in the field, which is where the sim puts a boss. */
const KILLED: BossKilled = {
  type: 'bossKilled',
  boss: 'undertaker',
  x: 270,
  y: 110,
};

/** The grave he is dragged into, parked at its starting mark and its starting size. */
function parked(): Grave {
  const grave = createGrave(SIZE_START);
  grave.x = 270;
  grave.y = 600;
  return grave;
}

/**
 * The rim he is dragged to, worked out here rather than read off the code: he
 * died straight above the grave, so the point he crosses is the far edge at his
 * own column, one half-height above the grave's centre.
 */
const RIM_Y = 600 - SIZE_START;
const RIM_X = 270;

/** Where the beats hand over, from the shares alone. */
const CLAW_STARTS = ENDING_BEATS.drag;
const TIP_STARTS = CLAW_STARTS + ENDING_BEATS.claw;
const FALL_STARTS = TIP_STARTS + ENDING_BEATS.tip;

describe("the Undertaker's ending scene", () => {
  it("the scene starts where the Undertaker fell, from the death's own event", () => {
    // R6: the scene fires on bossKilled, which carries the kind and where the
    // body fell, because killBoss takes the boss off the field before it
    // announces and the renderer has nothing left to read.
    const scene = sceneFrom(KILLED, parked());
    const opening = endingSceneAt(scene, 0);

    expect(scene.boss).toBe('undertaker');
    expect(opening.x).toBe(KILLED.x);
    expect(opening.y).toBe(KILLED.y);
    expect(opening.inTheHole).toBe(false);
    expect(opening.furrows).toBe(0);
  });

  it("the grave drags him from there to the rim over the drag's share of the scene", () => {
    // R6: the grave takes him. He crosses the ground from where he fell to the
    // rim and is there by the end of the drag, and the claw that follows holds
    // him at that edge rather than moving him on.
    const scene = sceneFrom(KILLED, parked());

    const arrived = endingSceneAt(scene, CLAW_STARTS);
    expect(arrived.x).toBeCloseTo(RIM_X, 10);
    expect(arrived.y).toBeCloseTo(RIM_Y, 10);
    expect(arrived.inTheHole).toBe(false);

    const clawing = endingSceneAt(scene, TIP_STARTS - 0.001);
    expect(clawing.x).toBeCloseTo(RIM_X, 10);
    expect(clawing.y).toBeCloseTo(RIM_Y, 10);

    // Halfway through the drag he is short of halfway across, because the
    // drag eases in: the grave takes up the slack and then hauls.
    const halfway = endingSceneAt(scene, CLAW_STARTS / 2);
    const crossed = (halfway.y - KILLED.y) / (RIM_Y - KILLED.y);
    expect(crossed).toBeCloseTo(0.5 ** ENDING_DRAG_EASE, 10);
    expect(crossed).toBeLessThan(0.5);
  });

  it('he is hauled to the edge the pull crosses, not to whichever edge is nearest', () => {
    // Found in the rendered check. The Undertaker dies high in the field and
    // the grave is narrow, so the nearest point of the rim to him is a corner:
    // taking the nearest edge slid him in sideways from the left and put him
    // under the lip, where he could not be seen going in. The grave pulls him
    // toward its middle, so the edge he goes over is the one that pull crosses.
    const grave = parked();
    const killed: BossKilled = {
      type: 'bossKilled',
      boss: 'undertaker',
      x: grave.x - graveWidth(SIZE_START),
      y: 110,
    };
    const scene = sceneFrom(killed, grave);

    // The far edge, one half-height above the grave's centre, and the way in
    // from it runs down the field rather than across it.
    expect(scene.rimY).toBeCloseTo(grave.y - SIZE_START, 10);
    expect(scene.intoX).toBe(0);
    expect(scene.intoY).toBe(1);
    // And on it, not past it: the pull leans him in as he comes.
    expect(scene.rimX).toBeGreaterThan(killed.x);
    expect(scene.rimX).toBeLessThan(grave.x);
  });

  it('the furrows follow him, and they are as long as the ground he has crossed', () => {
    // R6: furrows left in the ground behind him as he comes, and they stay
    // until the scene ends, so the reach is exactly the ground he has covered.
    const scene = sceneFrom(KILLED, parked());

    for (const progress of [0.1, 0.25, CLAW_STARTS / 2, CLAW_STARTS * 0.9]) {
      const drawn = endingSceneAt(scene, progress);
      const crossed = (drawn.y - KILLED.y) / (RIM_Y - KILLED.y);
      expect(drawn.furrows).toBeCloseTo(crossed, 10);
    }

    expect(endingSceneAt(scene, CLAW_STARTS).furrows).toBeCloseTo(1, 10);
    expect(endingSceneAt(scene, TIP_STARTS).furrows).toBe(1);
    expect(endingSceneAt(scene, 1).furrows).toBe(1);
  });

  it('he tips about the rim he reached and folds to fit the opening', () => {
    // R6: at the rim he turns about the point he crossed and folds to fit the
    // opening. The tip opens where the claw left him, so the hand-over from the
    // field to the hole moves nothing at all.
    const scene = sceneFrom(KILLED, parked());
    const grave = parked();

    const opening = endingSceneAt(scene, TIP_STARTS);
    expect(opening.inTheHole).toBe(true);
    expect(grave.x + opening.x).toBeCloseTo(RIM_X, 10);
    expect(grave.y + opening.y).toBeCloseTo(RIM_Y, 10);
    expect(opening.turn).toBeCloseTo(0, 10);
    expect(opening.wide).toBeCloseTo(1, 10);
    expect(opening.tall).toBeCloseTo(1, 10);

    // By the end of the tip he has gone over the edge: foreshortened along the
    // way in, folded across it, and carried past the rim he turned about.
    const over = endingSceneAt(scene, FALL_STARTS);
    expect(over.tall).toBeLessThan(0.5);
    expect(over.wide).toBeLessThan(1);
    expect(grave.y + over.y).toBeGreaterThan(RIM_Y);

    // Dragged in straight down the field he stays square to it, because the
    // turn is the skew the projection puts on him and there is none to put.
    // Taken over a side of the grave instead, there is.
    const sideways = sceneFrom(
      { type: 'bossKilled', boss: 'undertaker', x: 70, y: 600 },
      parked(),
    );
    expect(endingSceneAt(sideways, FALL_STARTS).turn).not.toBe(0);
  });

  it('he falls the way a corpse falls, on the same projection and the same light curve', () => {
    // R6: he falls with the shared fall, so he shrinks and darkens on the
    // walls' own curve and never lands. The check is against fall.ts itself,
    // handed his own half extent along the way into the hole, which is his
    // half height because he goes in over the far edge.
    const scene = sceneFrom(KILLED, parked());
    const halfway = (FALL_STARTS + 1) / 2;
    const drawn = endingSceneAt(scene, halfway);

    const share = (halfway - FALL_STARTS) / ENDING_BEATS.fall;
    const corpse = fallAt(
      {
        unitX: 0,
        unitY: -1,
        unitVx: 0,
        unitVy: 0,
        halfExtent: BOSS_HALF_HEIGHT,
        born: 0,
      },
      TIP_TICKS + share * DROP_TICKS,
      SIZE_START,
    );

    expect(drawn.x).toBeCloseTo(corpse.x, 10);
    expect(drawn.y).toBeCloseTo(corpse.y, 10);
    expect(drawn.light).toBeCloseTo(corpse.light, 10);
    expect(drawn.light).toBeLessThan(1);
    expect(drawn.tall).toBeCloseTo(corpse.along, 10);
    expect(drawn.wide).toBeCloseTo(corpse.across, 10);
    // His body is wider than it is tall, and the mouth is narrower than it is
    // long, so the half extent the fall folds him by is the one along the way in.
    expect(BOSS_HALF_WIDTH).toBeGreaterThan(BOSS_HALF_HEIGHT);
    expect(graveWidth(SIZE_START)).toBeLessThan(SIZE_START * 2);
  });

  it('the scene is whole exactly when its length is spent, and never before', () => {
    // The ending module owns when the hold ends, so the four beats fill the
    // length exactly and the last of them runs right up to the last frame: a
    // scene that finished its arithmetic early would hold a still field for
    // the rest of the hold, and one that ran past would be cut off.
    const scene = sceneFrom(KILLED, parked());
    const shares =
      ENDING_BEATS.drag +
      ENDING_BEATS.claw +
      ENDING_BEATS.tip +
      ENDING_BEATS.fall;
    expect(shares).toBeCloseTo(1, 10);

    // The drag is not over before its own share, and the fall is still
    // deepening on the last frame of the scene.
    expect(endingSceneAt(scene, CLAW_STARTS * 0.999).furrows).toBeLessThan(1);
    const late = endingSceneAt(scene, 0.99);
    const last = endingSceneAt(scene, 1);
    expect(last.y).toBeGreaterThan(late.y);
    expect(last.tall).toBeLessThan(late.tall);

    // The dark has him by the end, which is what the grave swallowing him looks like.
    expect(last.gone).toBe(true);
    expect(endingSceneAt(scene, TIP_STARTS).gone).toBe(false);
  });
});
