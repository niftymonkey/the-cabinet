// The run handoff's mailbox, the one piece of logic the screen skeletons add.

import { describe, expect, it } from 'vitest';
import { RunHandoff } from '../runHandoff';

describe('the run handoff', () => {
  it('a fresh handoff has no run to report and no tape to hand out', () => {
    expect(new RunHandoff().read()).toBeNull();
    expect(new RunHandoff().readTape()).toBeNull();
  });

  it('the run read back is the last one recorded', () => {
    const handoff = new RunHandoff();
    handoff.record({ seed: 5, ticks: 90, ending: 'sealed', fault: null }, null);
    handoff.record(
      { seed: 6, ticks: 12, ending: 'victory', fault: null },
      null,
    );
    expect(handoff.read()).toEqual({
      seed: 6,
      ticks: 12,
      ending: 'victory',
      fault: null,
    });
  });

  it("carries the run's sealed tape bytes beside the summary, and a later run replaces them", () => {
    // The bytes and not the recorder: the recorder dies with the game screen's
    // reset, and the end screen's export needs the record after that.
    const handoff = new RunHandoff();
    const tape = new Uint8Array([72, 71, 84, 80]);
    handoff.record({ seed: 5, ticks: 90, ending: 'sealed', fault: null }, tape);
    expect(handoff.readTape()).toBe(tape);

    handoff.record({ seed: 6, ticks: 12, ending: null, fault: null }, null);
    expect(handoff.readTape()).toBeNull();
  });
});
