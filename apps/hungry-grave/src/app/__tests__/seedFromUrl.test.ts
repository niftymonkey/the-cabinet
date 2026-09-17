/**
 * ?seed= and ?size= in both URL forms (ADR 0012). Pure functions over two
 * strings, so they are testable without a browser.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_LEVEL } from '../../game/lines/roster';
import { createRun, SEED_LIMIT } from '../../game/run';
import { SIZE_CEILING, SIZE_FLOOR } from '../../game/tuning';
import { SIGNAL_FULL, SIGNAL_RAN_LIVE } from '../../game/signalLock';
import { tapeHeaderFor } from '../tapeHeader';
import type { RunConditions } from '../tapeHeader';
import {
  atFromUrl,
  levelsFromUrl,
  seedFromUrl,
  signalLockFromUrl,
  sizeFromUrl,
  tapeFromUrl,
} from '../seedFromUrl';

/** The arguments of a mock's Nth call, once a call count assertion has proven it exists. */
function callArgsOf(mock: { calls: unknown[][] }, index: number): unknown[] {
  const call = mock.calls[index];
  if (call === undefined) throw new Error(`no call at index ${index}`);
  return call;
}

describe('seedFromUrl', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('?seed=1234 in the search pins that seed (ADR 0012)', () => {
    expect(seedFromUrl('?seed=1234', '')).toBe(1234);
    expect(seedFromUrl('?seed=1234', '#/')).toBe(1234);
  });

  it('#/?seed=1234 after the route pins that seed (ADR 0012)', () => {
    expect(seedFromUrl('', '#/?seed=1234')).toBe(1234);
    expect(seedFromUrl('', '#?seed=1234')).toBe(1234);
  });

  it("with both present the hash's query wins, because the hash is this app's navigation authority", () => {
    // A stale ?seed= left in the search would otherwise silently override a
    // fresh seed an in-app link had just written, and the hash is the part
    // that changes without a reload.
    expect(seedFromUrl('?seed=1', '#/?seed=2')).toBe(2);
  });

  it('no seed anywhere gives null, and the run rolls fresh', () => {
    expect(seedFromUrl('', '')).toBeNull();
    expect(seedFromUrl('?size=20', '#/prototypes')).toBeNull();
  });

  it('a non-numeric, negative, fractional or out-of-range seed gives null and warns, so a typo still yields a game', () => {
    for (const raw of ['abc', '-1', '1.5', '', '1e999']) {
      expect(seedFromUrl(`?seed=${raw}`, '')).toBeNull();
    }
    expect(console.warn).toHaveBeenCalledTimes(5);
    expect(callArgsOf(vi.mocked(console.warn).mock, 0).join(' ')).toContain(
      'abc',
    );
  });

  it('SEED_LIMIT - 1 is accepted and SEED_LIMIT is not, so every pinned seed is one the roll could have produced', () => {
    expect(seedFromUrl(`?seed=${SEED_LIMIT - 1}`, '')).toBe(SEED_LIMIT - 1);
    expect(seedFromUrl(`?seed=${SEED_LIMIT}`, '')).toBeNull();
    expect(seedFromUrl('?seed=0', '')).toBe(0);
  });
});

describe('sizeFromUrl', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('?size= pins a starting size in either form', () => {
    // It exists because the on-device check is otherwise blind to two thirds of
    // the game: the grave is unfeedable in 3b, so without it Mark steers at
    // SIZE_START only, and a floor grave covers 15 of its own body-widths a
    // second where a ceiling grave covers 4.
    expect(sizeFromUrl(`?size=${SIZE_FLOOR}`, '')).toBe(SIZE_FLOOR);
    expect(sizeFromUrl('', `#/?size=${SIZE_CEILING}`)).toBe(SIZE_CEILING);
    expect(sizeFromUrl('?size=27.5', '')).toBe(27.5);
    expect(sizeFromUrl('?size=1', '#/?size=40')).toBe(40);

    expect(sizeFromUrl('', '')).toBeNull();
    expect(sizeFromUrl('?size=huge', '')).toBeNull();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it("parses and does not clamp, because ADR 0003's bounds belong to the rules layer", () => {
    // The hole this closes: ?size= used to write run.grave.size from src/app,
    // so the sim's own hard bounds were defended by a URL parser. createRun
    // takes the value now and grave.ts holds the floor and the ceiling.
    expect(sizeFromUrl(`?size=${SIZE_FLOOR - 10}`, '')).toBe(SIZE_FLOOR - 10);
    expect(sizeFromUrl(`?size=${SIZE_CEILING + 10}`, '')).toBe(
      SIZE_CEILING + 10,
    );
    expect(
      createRun(1, { startingSize: sizeFromUrl('?size=0', '')! }).grave.size,
    ).toBe(SIZE_FLOOR);
    expect(
      createRun(1, { startingSize: sizeFromUrl('?size=999', '')! }).grave.size,
    ).toBe(SIZE_CEILING);
  });
});

describe('levelsFromUrl', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('?levels= pins a starting level for all four lines, in either URL form', () => {
    // The measurement's stated condition is a dense moment with the lines
    // levelled, and no reachable run produces one: the ladder to level five on
    // all four costs eighteen power-ups and the stage pays for at most twelve.
    expect(levelsFromUrl('?levels=5', '')).toBe(5);
    expect(levelsFromUrl('', '#/?levels=3')).toBe(3);
    expect(levelsFromUrl('', '')).toBeNull();
  });

  it("with both present the hash's query wins, the same way the seed's does", () => {
    expect(levelsFromUrl('?levels=1', '#/?levels=4')).toBe(4);
  });

  it('accepts exactly zero to the max line level, whole numbers only', () => {
    expect(levelsFromUrl('?levels=0', '')).toBe(0);
    expect(levelsFromUrl(`?levels=${MAX_LEVEL}`, '')).toBe(MAX_LEVEL);
    expect(levelsFromUrl(`?levels=${MAX_LEVEL + 1}`, '')).toBeNull();
    expect(levelsFromUrl('?levels=-1', '')).toBeNull();
    expect(levelsFromUrl('?levels=2.5', '')).toBeNull();
  });

  it('warns about garbage and ignores it, so a typo still yields a game', () => {
    for (const raw of ['max', '', '1e999', 'NaN']) {
      expect(levelsFromUrl(`?levels=${raw}`, '')).toBeNull();
    }
    expect(console.warn).toHaveBeenCalledTimes(4);
    expect(callArgsOf(vi.mocked(console.warn).mock, 0).join(' ')).toContain(
      'max',
    );
  });
});

// What a browser would have reported, so the header is a pure function here.
const CONDITIONS: RunConditions = {
  inputDevice: 'keyboard',
  keyboardSpeed: 1,
  rendererBackend: 'webgl',
  rendererResolution: 2,
  devicePixelRatio: 2,
  recordedAt: 1_766_000_000_000,
};

describe('signalLockFromUrl (CONTEXT.md Signal lock)', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('a run with no lock in its URL resolves the value that means the signal ran live', () => {
    // Spec test 49, ADR 0027: the header records what the run started from and
    // never an absence, so the parser answers null and the run resolves it.
    expect(signalLockFromUrl('', '')).toBeNull();

    const run = createRun(1234);
    expect(run.director.signal.lock).toBe(SIGNAL_RAN_LIVE);
    expect(tapeHeaderFor(run, CONDITIONS).signalLock).toBe(SIGNAL_RAN_LIVE);
  });

  it('a lock the URL states resolves to that figure, and the header records it', () => {
    // Spec test 50, the other half. Both URL forms, on the seed's own terms.
    expect(signalLockFromUrl('?signal=0.25', '')).toBe(0.25);
    expect(signalLockFromUrl('', '#/?signal=0.25')).toBe(0.25);
    expect(signalLockFromUrl('?signal=0.1', '#/?signal=0.25')).toBe(0.25);

    const run = createRun(1234, { signalLock: 0.25 });
    expect(run.director.signal.lock).toBe(0.25);
    expect(run.director.signal.value).toBe(0.25);
    expect(tapeHeaderFor(run, CONDITIONS).signalLock).toBe(0.25);
  });

  it('a lock the module cannot use is warned about once and ignored, and the run plays', () => {
    // Spec test 51, seedFromUrl.ts's own standing rule for a fat-fingered
    // value. The bounds are the signal's own scale: a figure outside it would
    // hold the gate where the signal can never stand.
    expect(signalLockFromUrl('?signal=0', '')).toBe(0);
    expect(signalLockFromUrl(`?signal=${SIGNAL_FULL}`, '')).toBe(SIGNAL_FULL);

    for (const raw of ['full', '', '-0.5', String(SIGNAL_FULL + 1), 'NaN']) {
      expect(signalLockFromUrl(`?signal=${raw}`, '')).toBeNull();
    }
    expect(console.warn).toHaveBeenCalledTimes(5);
    expect(callArgsOf(vi.mocked(console.warn).mock, 0).join(' ')).toContain(
      'full',
    );

    // And the run still plays: a refused pin is a run with a live signal.
    const run = createRun(1234, { signalLock: undefined });
    expect(run.director.signal.lock).toBe(SIGNAL_RAN_LIVE);
  });
});

describe('tapeFromUrl', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('?tape= names the tape URL a replay fetches, in either URL form', () => {
    expect(tapeFromUrl('?tape=blob%3Afake', '')).toBe('blob:fake');
    expect(tapeFromUrl('', '#/replay?tape=blob%3Afake')).toBe('blob:fake');
    expect(tapeFromUrl('', '#/replay?tape=/tapes/run.tape&at=120')).toBe(
      '/tapes/run.tape',
    );
    expect(tapeFromUrl('', '')).toBeNull();
  });

  it("with both present the hash's query wins, the same way the seed's does", () => {
    expect(tapeFromUrl('?tape=search', '#/replay?tape=hash')).toBe('hash');
  });

  it('an empty ?tape= warns and gives null, because there is nothing to fetch', () => {
    expect(tapeFromUrl('?tape=', '')).toBeNull();
    expect(tapeFromUrl('?tape=%20', '')).toBeNull();
    expect(console.warn).toHaveBeenCalledTimes(2);
  });
});

describe('atFromUrl', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('?at= names the tick a replay opens at, in either URL form', () => {
    expect(atFromUrl('?at=120', '')).toBe(120);
    expect(atFromUrl('', '#/replay?at=9000')).toBe(9000);
    expect(atFromUrl('?at=0', '')).toBe(0);
    expect(atFromUrl('', '')).toBeNull();
  });

  it("with both present the hash's query wins, the same way the seed's does", () => {
    expect(atFromUrl('?at=1', '#/replay?at=2')).toBe(2);
  });

  it('warns about a non-numeric, negative or fractional tick and ignores it, so a typo still yields a replay', () => {
    for (const raw of ['abc', '-1', '1.5', '', '1e999']) {
      expect(atFromUrl(`?at=${raw}`, '')).toBeNull();
    }
    expect(console.warn).toHaveBeenCalledTimes(5);
    expect(callArgsOf(vi.mocked(console.warn).mock, 0).join(' ')).toContain(
      'abc',
    );
  });
});
