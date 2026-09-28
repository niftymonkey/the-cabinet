/**
 * The pool that draws falling food (design record R5). Render only: a fall is
 * born of the swallow's own event and driven by the run's tick, never by a
 * wall clock, so pause, the resume countdown and a replay all show the same
 * fall.
 */

import { Container, Graphics } from 'pixi.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { capsFor } from '../../../../game/caps';
import { SHORTEST_FIELD } from '../../../../game/field';
import { CORPSE_HALF_EXTENT } from '../../../../game/corpses';
import type { Swallowed } from '../../../../game/events';
import type { RunState } from '../../../../game/run';
import { createRun } from '../../../../game/run';
import { DEFAULT_TUNING } from '../../../../game/tuningRecord';
import { FallRenderer } from '../FallRenderer';
import { FALL_TICKS, TIP_TICKS } from '../fall';
import type { GraveView } from '../graveProjection';
import { playToColumn } from '../playLayer';
import { graveFrameOnPlay } from '../playPlacement';
import { sceneFor } from '../scene';

// The shortest field's scene, the one this file's values were pinned on (tilted view A34).
const SHORTEST_SCENE = sceneFor(SHORTEST_FIELD);

/**
 * Build 7's own camera over the hole, 4.95 half-lengths up and 1.07 behind, with
 * R4's dark: the view these promises were written against, handed in now that
 * the painters take the view they are cut with (tilted view T4).
 */
const BUILD_7_VIEW: GraveView = {
  cameraHeight: 4.95,
  nadirX: 0,
  nadirY: 1.07,
  darkDepth: 2.4,
  darkFalloff: 2.6,
};

const CAPS = capsFor(DEFAULT_TUNING, SHORTEST_FIELD);

/** A corpse swallowed at the right-hand rim of a grave at the start size. */
const swallowedAtTheRim = (): Swallowed => ({
  type: 'swallowed',
  kind: 'corpse',
  freshness: 1,
  payout: 1,
  offsetX: 13.5,
  offsetY: 0,
  halfExtent: CORPSE_HALF_EXTENT,
  vx: 0,
  vy: 0,
  graveSize: 27,
  tier: 'trash',
  treasureBody: false,
});

const attached = (): { into: Container; renderer: FallRenderer } => {
  const into = new Container();
  const renderer = new FallRenderer({ holeView: () => BUILD_7_VIEW });
  renderer.useScene(SHORTEST_SCENE);
  renderer.attach(into, CAPS);
  return { into, renderer };
};

/** A run stood at a tick, with its grave put where the test wants it. */
const runAt = (tick: number, x: number, y: number): RunState => {
  const run = createRun(1);
  run.tick = tick;
  run.grave.x = x;
  run.grave.y = y;
  run.grave.size = 27;
  return run;
};

/** A corpse swallowed at an offset from the grave's centre, still. */
const swallowedAt = (offsetX: number, offsetY: number): Swallowed => ({
  ...swallowedAtTheRim(),
  offsetX,
  offsetY,
});

/**
 * Where a fall's sprite draws on the column: its place in the grave's frame,
 * through the grave's placement on the play layer (A29).
 */
const onColumn = (run: RunState, sprite: Graphics) => {
  const frame = graveFrameOnPlay(
    SHORTEST_SCENE.playLayer,
    run.grave.x,
    run.grave.y,
  );
  return {
    x: frame.x + sprite.position.x * frame.scaleX,
    y: frame.y + sprite.position.y * frame.scaleY,
  };
};

const shown = (into: Container): Graphics[] =>
  into.children.filter(
    (child): child is Graphics => child instanceof Graphics && child.visible,
  );

afterEach(() => {
  vi.restoreAllMocks();
});

describe('the falls on screen (grave-in-the-ground R5)', () => {
  it("a swallowed body's fall begins where the play layer drew it: at age zero its sprite, through the grave's placement, is where the play layer draws the body's field point", () => {
    // A24: the body goes over the rim from exactly where it was drawn the
    // frame before, with no jump. Graves at (270, 608), (40, 700) and (270,
    // 100); bodies at the hitbox's corners and past its far edge.
    for (const [x, y] of [
      [270, 608],
      [40, 700],
      [270, 100],
    ] as const) {
      for (const [dx, dy] of [
        [13.5, -27],
        [-13.5, 27],
        [0, -30],
      ] as const) {
        const { into, renderer } = attached();
        const run = runAt(200, x, y);
        renderer.swallowed(run, swallowedAt(dx, dy));
        renderer.sync(run);
        const sprite = shown(into)[0];
        if (sprite === undefined) throw new Error('no fall shown');
        const drawn = onColumn(run, sprite);
        const body = playToColumn(SHORTEST_SCENE.playLayer, x + dx, y + dy);
        const label = `grave ${x},${y} body ${dx},${dy}`;
        expect(Math.abs(drawn.x - body.x), label).toBeLessThan(1e-6);
        expect(Math.abs(drawn.y - body.y), label).toBeLessThan(1e-6);
      }
    }
  });

  it('a fall that starts past the drawn far rim still hinges on the far edge and goes into the hole', () => {
    // A24, fall.ts's rim rule: a body lying outside the far lip hinges on the
    // far edge. By the tip's end it has turned over that edge into the mouth,
    // never over a side, and once the fall is over it is gone.
    for (const [x, y] of [
      [270, 608],
      [40, 700],
      [270, 100],
    ] as const) {
      const { into, renderer } = attached();
      const born = runAt(200, x, y);
      renderer.swallowed(born, swallowedAt(3, -30));
      renderer.sync(born);
      renderer.sync(runAt(200 + TIP_TICKS, x, y));
      const tipped = shown(into)[0];
      if (tipped === undefined) throw new Error('no fall shown');
      const label = `grave ${x},${y}`;
      expect(tipped.position.y, label).toBeGreaterThan(-27);
      expect(tipped.position.y, label).toBeLessThan(0);
      expect(Math.abs(tipped.position.x), label).toBeLessThan(13.5);
      renderer.sync(runAt(200 + FALL_TICKS, x, y));
      expect(shown(into), label).toHaveLength(0);
    }
  });

  it("follows the grave, because a fall is drawn in the grave's own frame", () => {
    // R5, agent's call A5: a falling corpse moves with the grave, because it
    // is inside the hole. Everything this renderer draws is an offset from the
    // grave's centre, so the same fall at the same age draws at the same place
    // however far the grave has steered.
    const { into, renderer } = attached();
    const born = runAt(200, 270, 380);
    renderer.swallowed(born, swallowedAtTheRim());
    renderer.sync(born);
    const first = shown(into)[0]?.position.x;
    expect(first).toBeCloseTo(13.5, 6);
    // The same tick of the same fall, with the grave steered across the field.
    renderer.sync(runAt(200, 90, 120));
    expect(shown(into)[0]?.position.x).toBe(first);
  });

  it('hides the sprite of a fall that is over', () => {
    // R5: the fall lasts the tip time and the drop time together and nothing
    // catches it. A sprite left behind would hang in the hole for the rest of
    // the run.
    const { into, renderer } = attached();
    const born = runAt(200, 270, 380);
    renderer.swallowed(born, swallowedAtTheRim());
    renderer.sync(born);
    expect(shown(into)).toHaveLength(1);
    renderer.sync(runAt(200 + FALL_TICKS, 270, 380));
    expect(shown(into)).toHaveLength(0);
  });

  it('recycles the oldest fall when a tick swallows more food than the pool holds, and says so', () => {
    // The pool is sized at the corpse cap, so it takes a field that swallows
    // every body at once to run it out. Nothing abnormal is silent: the
    // recycle is reported rather than quietly dropping a fall.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { into, renderer } = attached();
    const run = runAt(200, 270, 380);
    for (let body = 0; body <= CAPS.corpses; body++) {
      renderer.swallowed(run, swallowedAtTheRim());
    }
    renderer.sync(run);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(shown(into)).toHaveLength(CAPS.corpses);
  });

  it('draws into the container it was attached to and adds no layer', () => {
    // R5: falling food draws in a container in the existing graveMouth layer,
    // so ADR 0014's stack is untouched and no new layer appears. The screen
    // hands the container over and the renderer puts its own sprites in it.
    const { into } = attached();
    expect(into.children).toHaveLength(CAPS.corpses);
    expect(into.children.every((child) => child instanceof Graphics)).toBe(
      true,
    );
  });

  it('forgets the falls of the run before it', () => {
    // The pooled-screen leak: a born tick belongs to the run it was taken
    // from, and a fresh run's early ticks are smaller than any of them, so a
    // fall carried over would hang in the hole from the first frame.
    const { into, renderer } = attached();
    const born = runAt(2000, 270, 380);
    renderer.swallowed(born, swallowedAtTheRim());
    renderer.sync(born);
    expect(shown(into)).toHaveLength(1);
    renderer.forgetPreviousRun();
    renderer.sync(runAt(0, 270, 380));
    expect(shown(into)).toHaveLength(0);
  });
});
