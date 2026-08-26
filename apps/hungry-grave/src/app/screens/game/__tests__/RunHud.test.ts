/** The dumb view: a run's readout in, label text out, and nothing of its own between renders. */

import { Container, Text } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';

import type { FaultRecord } from '../../../../game/execution';
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
      seedPinned: true,
      pinnedSize: 48,
      pinnedLevels: { soulStream: 3, headstones: 3, wisps: 3, bell: 3 },
    });
    hud.render({
      debtTicks: 5,
      tick: 120,
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
    hud.render({ debtTicks: 0, tick: 121, faults: [] });
    expect(textsOf(hud.view)).toEqual([
      'DEBT 0',
      'TICK 121',
      'SEED 424242 PINNED',
      'SIZE 48 PINNED',
      'LEVELS 3 PINNED',
      '',
    ]);
  });

  it('shows the seed the run rolled, and says PINNED only when the URL named one', () => {
    // ADR 0012 makes the visible seed a promise: a run a player wants back is
    // named by the number on screen, and the word is what says whether that
    // number was chosen or rolled. An ordinary run shows neither pin below it.
    const rolled = createRunHud();
    rolled.showIdentity({
      seed: 8675309,
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
      seedPinned: true,
      pinnedSize: null,
      pinnedLevels: null,
    });
    expect(pinned.lines.seed.text).toBe('SEED 8675309 PINNED');
  });
});
