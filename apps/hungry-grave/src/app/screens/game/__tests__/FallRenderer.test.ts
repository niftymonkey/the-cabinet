/**
 * The pool that draws falling food (design record R5). Render only: a fall is
 * born of the swallow's own event and driven by the run's tick, never by a
 * wall clock, so pause, the resume countdown and a replay all show the same
 * fall.
 */

import { Container, Graphics } from 'pixi.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { capsFor } from '../../../../game/caps';
import { CORPSE_HALF_EXTENT } from '../../../../game/corpses';
import type { Swallowed } from '../../../../game/events';
import type { RunState } from '../../../../game/run';
import { createRun } from '../../../../game/run';
import { DEFAULT_TUNING } from '../../../../game/tuningRecord';
import { FallRenderer } from '../FallRenderer';
import { FALL_TICKS } from '../fall';

const CAPS = capsFor(DEFAULT_TUNING);

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
  const renderer = new FallRenderer();
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

const shown = (into: Container): Graphics[] =>
  into.children.filter(
    (child): child is Graphics => child instanceof Graphics && child.visible,
  );

afterEach(() => {
  vi.restoreAllMocks();
});

describe('the falls on screen (grave-in-the-ground R5)', () => {
  it('puts one fall in the air at the place the swallowed event names', () => {
    // R5: the fall starts where the body crossed the rim. The event carries
    // that place as an offset from the grave's centre, and the container this
    // renderer draws into is the one positioned at the grave, so the sprite
    // sits at the offset itself.
    const { into, renderer } = attached();
    const run = runAt(200, 270, 380);
    renderer.swallowed(run, swallowedAtTheRim());
    renderer.sync(run);
    const falling = shown(into);
    expect(falling).toHaveLength(1);
    expect(falling[0]?.position.x).toBeCloseTo(13.5, 6);
    expect(falling[0]?.position.y).toBeCloseTo(0, 6);
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
