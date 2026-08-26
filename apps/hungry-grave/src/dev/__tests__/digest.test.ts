/**
 * The golden digest's scenario, at the one place it gives up quietly: a
 * scripted victim the mob pool had no room for.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runScenario } from '../digest';

/**
 * The scenario is fixed and takes no arguments, so a full pool is not reachable
 * through its own seam. The spawn it depends on is faked at the one tick that
 * matters instead, which is 540, the tick digest.ts kills a mob away from the
 * grave on.
 */
vi.mock('../../game/mobs', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../game/mobs')>();
  return {
    ...original,
    spawnMob: (
      run: Parameters<typeof original.spawnMob>[0],
      type: Parameters<typeof original.spawnMob>[1],
      order: Parameters<typeof original.spawnMob>[2],
    ) => (run.tick === 540 ? null : original.spawnMob(run, type, order)),
  };
});

describe('a scripted victim the scenario could not put down', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('a victim that could not be spawned is not silent', () => {
    runScenario();

    const said = vi
      .mocked(console.warn)
      .mock.calls.map((call) => call.join(' '));
    expect(said).toHaveLength(1);
    // What happened, and what it costs.
    expect(said[0]).toContain('540');
    expect(said[0]).toContain('golden');
  });
});
