/**
 * The renderer's resolution, chosen from the display the game booted on. The
 * device pixel ratio is a live environment input: whatever the browser reports
 * is what the canvas has to be built from.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getResolution } from '../getResolution';

function useDevicePixelRatio(ratio: number): void {
  Object.defineProperty(globalThis, 'window', {
    value: { devicePixelRatio: ratio },
    configurable: true,
  });
}

describe('the renderer resolution', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('a fractional device pixel ratio is not silent', async () => {
    // 2.625 is what a Pixel reports, so this is a real display and not a
    // hypothetical one.
    useDevicePixelRatio(2.625);

    expect(getResolution()).toBe(2);

    const said = vi
      .mocked(console.warn)
      .mock.calls.map((call) => call.join(' '));
    expect(said).toHaveLength(1);
    // What happened, and what it costs.
    expect(said[0]).toContain('2.625');
    expect(said[0]).toContain('softer');
  });

  it('a whole-number ratio is taken as it stands, and says nothing', () => {
    useDevicePixelRatio(3);

    expect(getResolution()).toBe(3);

    expect(console.warn).not.toHaveBeenCalled();
  });

  it('an ordinary desktop display says nothing', () => {
    useDevicePixelRatio(1);

    expect(getResolution()).toBe(2);

    expect(console.warn).not.toHaveBeenCalled();
  });
});
