// The recorded roster, resolved against the roster this build implements (ADR 0043).

import { describe, expect, it } from 'vitest';

import { WEAPON_LINES } from '../../game/lines/roster';
import { resolveStartingLevels } from '../startingLevels';
import type { TapeHeader } from '../tape';

const BASE: TapeHeader = {
  seed: 20260827,
  startingSize: 27,
  recordedRoster: [...WEAPON_LINES],
  startingLevels: { soulStream: 1, territory: 3, wisps: 0, bell: 5 },
  tickRate: 60,
  checkpointSpacing: 60,
  witnessVersion: 2,
  commitHash: 'f389eb55ff',
  buildIdentity: '',
  author: 'unknown',
  inputDevice: 'script',
  keyboardSpeed: 1,
  rendererBackend: 'webgl',
  rendererResolution: 2,
  devicePixelRatio: 2,
  recordedAt: 1_766_000_000_000,
};

function headerWith(over: Partial<TapeHeader>): TapeHeader {
  return { ...BASE, ...over };
}

describe('resolveStartingLevels', () => {
  it('reads starting levels by name against the recorded roster, never by position', () => {
    // The roster IS the order, so a tape that recorded its lines in a different
    // order than this build lists them still resolves to the same levels. A
    // positional read would hand back a permuted record and nothing would say
    // so, which is the exact failure ADR 0043 was written against.
    const shuffled = [...WEAPON_LINES].reverse();
    const resolved = resolveStartingLevels(
      headerWith({ recordedRoster: shuffled }),
    );

    expect(resolved.outcome).toBe('implemented');
    if (resolved.outcome !== 'implemented') return;
    expect(resolved.levels).toEqual({
      soulStream: 1,
      territory: 3,
      wisps: 0,
      bell: 5,
    });
  });

  it('names the roster it cannot implement rather than coercing it', () => {
    // A build cannot simulate a line it does not have, so the answer is the
    // roster it was handed, unedited. Nothing is dropped to make it fit and
    // nothing is invented to fill it out.
    const recorded = [...WEAPON_LINES, 'moonlight'];
    const resolved = resolveStartingLevels(
      headerWith({
        recordedRoster: recorded,
        startingLevels: { ...BASE.startingLevels, moonlight: 2 },
      }),
    );

    expect(resolved.outcome).toBe('notImplemented');
    if (resolved.outcome !== 'notImplemented') return;
    expect(resolved.recordedRoster).toEqual(recorded);
  });

  it('refuses a roster short of a line this build has, rather than filling it in', () => {
    // The absence is the tape's, and ADR 0027 rules that a header records
    // resolved values and never absences: a zero invented here would be this
    // reader claiming the run started with the bell unowned, which the tape
    // never said.
    const older = [...WEAPON_LINES].filter((line) => line !== 'bell');
    const levels = { ...BASE.startingLevels };
    delete levels.bell;
    const resolved = resolveStartingLevels(
      headerWith({ recordedRoster: older, startingLevels: levels }),
    );

    expect(resolved.outcome).toBe('notImplemented');
    if (resolved.outcome !== 'notImplemented') return;
    expect(resolved.recordedRoster).toEqual(older);
  });

  it('refuses a roster that names the same line twice', () => {
    // A duplicate name means one of the two level bytes is unreachable by name,
    // which is the positional ambiguity this whole seam exists to remove.
    const doubled = [...WEAPON_LINES, WEAPON_LINES[0]];
    const resolved = resolveStartingLevels(
      headerWith({ recordedRoster: doubled }),
    );

    expect(resolved.outcome).toBe('notImplemented');
  });
});
