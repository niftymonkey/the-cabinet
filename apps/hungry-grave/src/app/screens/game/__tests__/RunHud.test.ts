/** The dumb view: a run's readout in, label text out, and nothing of its own between renders. */

import { Container, Text } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';

import type { FaultRecord } from '../../../../game/execution';
import { WEAPON_LINES } from '../../../../game/lines/roster';
import type { RunReadout } from '../runSession';
import type { FaultIdentity } from '../../../../game/faults';
import { FAULT_SEVERITY } from '../../../../game/faults';

/** The real widget needs a renderer: text metrics and a loaded texture. */
vi.mock('../../../ui/Label', () => ({
  Label: class extends Container {
    public text = '';
    public anchor = { set: () => {} };
  },
}));

import { createRunHud } from '../RunHud';

/** What the stack shows, in the order it draws it. */
const textsOf = (view: Container): string[] =>
  view.children.map((child) => (child as Text).text);

/** A readout with everything not under test at rest, as the session writes one. */
const atRest = (over: Partial<RunReadout> = {}): RunReadout => ({
  debtTicks: 0,
  tick: 0,
  score: 0,
  levels: { skullStream: 0, territory: 0, wisps: 0, bell: 0 },
  scoreRungBled: false,
  bankedOffers: 0,
  faults: [],
  ...over,
});

/** A record as the authority keeps them, for driving the fault line. */
const faultRecord = (identity: FaultIdentity): FaultRecord => ({
  identity,
  severity: FAULT_SEVERITY[identity],
  firstTick: 1,
  detail: '',
  count: 1,
});

describe('the run readout', () => {
  it('renders what it is given', () => {
    const hud = createRunHud();

    hud.showIdentity({
      seed: 424242,
      roster: WEAPON_LINES,
      seedPinned: true,
      pinnedSize: 48,
      pinnedLevels: { skullStream: 3, territory: 3, wisps: 3, bell: 3 },
    });
    hud.render({
      debtTicks: 5,
      tick: 120,
      score: 4200,
      levels: { skullStream: 3, territory: 3, wisps: 3, bell: 3 },
      scoreRungBled: false,
      bankedOffers: 2,
      faults: [faultRecord('freshness in range')],
    });

    expect(textsOf(hud.view)).toEqual([
      'DEBT 5',
      'TICK 120',
      'SEED 424242 PINNED',
      'SIZE 48 PINNED',
      'LEVELS 3 PINNED',
      'FAULT freshness in range',
    ]);

    // A second render shows the second set of lines and nothing of the first.
    hud.render(atRest({ tick: 121 }));
    expect(textsOf(hud.view)).toEqual([
      'DEBT 0',
      'TICK 121',
      'SEED 424242 PINNED',
      'SIZE 48 PINNED',
      'LEVELS 3 PINNED',
      '',
    ]);
  });

  it('carries no bank line, because the ladder HUD carries the bank now', () => {
    // Design record R11: the bank was this stack's stand-in form and it is the
    // player's readout now, beside the score. The absence is guarded here
    // rather than left to a comment, because a bank line put back would be one
    // reading in two places and neither would be wrong on its own.
    const hud = createRunHud();
    hud.render(atRest({ tick: 1, bankedOffers: 3 }));

    expect(Object.keys(hud.lines)).toEqual([
      'debt',
      'tick',
      'seed',
      'size',
      'levels',
      'fault',
    ]);
    expect(textsOf(hud.view).some((line) => line.includes('3'))).toBe(false);
  });

  it('shows the seed the run rolled, and says PINNED only when the URL named one', () => {
    // ADR 0012 makes the visible seed a promise: a run a player wants back is
    // named by the number on screen, and the word is what says whether that
    // number was chosen or rolled. An ordinary run shows neither pin below it.
    const rolled = createRunHud();
    rolled.showIdentity({
      seed: 8675309,
      roster: WEAPON_LINES,
      seedPinned: false,
      pinnedSize: null,
      pinnedLevels: null,
    });
    expect(rolled.lines.seed.text).toBe('SEED 8675309');
    expect(rolled.lines.size.text).toBe('');
    expect(rolled.lines.levels.text).toBe('');

    const pinned = createRunHud();
    pinned.showIdentity({
      seed: 8675309,
      roster: WEAPON_LINES,
      seedPinned: true,
      pinnedSize: null,
      pinnedLevels: null,
    });
    expect(pinned.lines.seed.text).toBe('SEED 8675309 PINNED');
  });
});
