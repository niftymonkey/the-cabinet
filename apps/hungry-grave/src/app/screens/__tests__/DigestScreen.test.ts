/**
 * The digest screen's fault routing (ADR 0017): severity means the same thing
 * everywhere, so only a fatal fault hides the digest. runScenario's loop breaks
 * on execution.stop, which only a fatal fault sets, so a recoverable fault
 * leaves a completed digest and has to be shown beside it rather than in place
 * of it.
 */

import { Container } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';

/** The real widgets need a renderer: text metrics and a loaded texture. */
vi.mock('../../ui/Label', () => ({
  Label: class extends Container {
    public text = '';
    public anchor = { set: () => {} };
  },
}));

vi.mock('../../ui/Button', () => ({
  Button: class extends Container {
    public onPress = { connect: (handler: () => void) => void handler };
  },
}));

const { runScenario } = vi.hoisted(() => ({ runScenario: vi.fn() }));

/** The scenario seam is stubbed so a fault of either severity can be handed in; GOLDEN stays the real constant. */
vi.mock('../../../dev/digest', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../dev/digest')>()),
  runScenario,
}));

import { GOLDEN } from '../../../dev/digest';
import type { FaultRecord } from '../../../game/execution';
import { DigestScreen } from '../DigestScreen';

const FATAL: FaultRecord = {
  identity: 'no NaN',
  severity: 'fatal',
  firstTick: 3,
  detail: 'grave.x is NaN',
  count: 1,
};

const RECOVERABLE: FaultRecord = {
  identity: 'freshness in range',
  severity: 'recoverable',
  firstTick: 5,
  detail: 'corpse 1 has freshness 5',
  count: 2,
};

function prepared(faults: readonly FaultRecord[]): DigestScreen {
  runScenario.mockReturnValue({ digest: GOLDEN, faults });
  const screen = new DigestScreen();
  screen.prepare();
  return screen;
}

describe("the digest screen's fault routing (ADR 0017)", () => {
  it('shows the breach on a fatal fault, because the scenario stopped before its digest', () => {
    const screen = prepared([FATAL, RECOVERABLE]);
    expect(screen['verdict'].text).toBe('BROKEN');
    expect(screen['detail'].text).toContain('no NaN');
    expect(screen['detail'].text).toContain('freshness in range');
  });

  it('shows the digest on recoverable faults only, with the fault lines beside it', () => {
    const screen = prepared([RECOVERABLE]);
    expect(screen['verdict'].text).toBe('MATCH');
    expect(screen['detail'].text).toContain(
      'freshness in range (recoverable) first at tick 5, 2 times',
    );
    // The digest itself is still on screen under the fault lines.
    expect(screen['detail'].text).toContain(`checksum: ${GOLDEN.checksum}`);
  });

  it('shows the digest alone when the scenario recorded no fault at all', () => {
    const screen = prepared([]);
    expect(screen['verdict'].text).toBe('MATCH');
    expect(screen['detail'].text).not.toContain('recoverable');
    expect(screen['detail'].text).toContain(`checksum: ${GOLDEN.checksum}`);
  });
});
