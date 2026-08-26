/** The dumb view: lines in, label text out, and nothing of its own between renders. */

import { Container, Text } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';

/** The real widget needs a renderer: text metrics and a loaded texture. */
vi.mock('../../ui/Label', () => ({
  Label: class extends Container {
    public text = '';
    public anchor = { set: () => {} };
    public style: Record<string, unknown> = {};
  },
}));

import { createReplayReadout } from '../replayReadout';

/** What the readout shows, in the order it draws it. */
const textsOf = (view: Container): string[] =>
  view.children.map((child) => (child as Text).text);

describe('the readout', () => {
  it('renders what it is given', () => {
    const readout = createReplayReadout();

    readout.render({
      posture: 'REPLAYING',
      verified: 'VERIFIED 120 OF 360 TICKS',
      debt: 'ORIGINAL DEBT 5 TICKS',
      tick: 'TICK 120',
      statement: 'THE TAPE IS CUT SHORT.',
    });
    expect(textsOf(readout.view)).toEqual([
      'REPLAYING',
      'VERIFIED 120 OF 360 TICKS',
      'ORIGINAL DEBT 5 TICKS',
      'TICK 120',
      'THE TAPE IS CUT SHORT.',
    ]);

    // A second render shows the second set of lines and nothing of the first.
    readout.render({
      posture: 'NO REPLAY',
      verified: '',
      debt: '',
      tick: '',
      statement: 'NO TAPE NAMED.',
    });
    expect(textsOf(readout.view)).toEqual([
      'NO REPLAY',
      '',
      '',
      '',
      'NO TAPE NAMED.',
    ]);
  });
});
