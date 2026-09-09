// The recorded roster, resolved against the roster this build implements (ADR 0043).

import { describe, expect, it } from 'vitest';

import { WEAPON_LINES } from '../../game/lines/roster';
import { resolveStartingLevels } from '../startingLevels';
import type { TapeHeader } from '../tape';
import { SCRIPT_POLICY } from '../tape';

const BASE: TapeHeader = {
  seed: 20260827,
  startingSize: 27,
  recordedRoster: [...WEAPON_LINES],
  startingLevels: { skullStream: 1, territory: 3, wisps: 0, bell: 5 },
  tickRate: 60,
  checkpointSpacing: 60,
  witnessVersion: 2,
  commitHash: 'f389eb55ff',
  buildIdentity: '',
  author: 'unknown',
  inputDevice: 'script',
  policy: SCRIPT_POLICY,
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
      skullStream: 1,
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

  it('implements a roster naming fewer lines than this build has, and fields exactly those', () => {
    // ADR 0046: "a tape must replay without the player's unlock state, so the
    // header records the run's resolved roster." A run that never fielded the
    // bell is an ordinary run, not an older format, so the roster resolves and
    // the lines it does not name are unowned rather than unsaid.
    const smaller = [...WEAPON_LINES].filter((line) => line !== 'bell');
    const levels = { ...BASE.startingLevels };
    delete levels.bell;
    const resolved = resolveStartingLevels(
      headerWith({ recordedRoster: smaller, startingLevels: levels }),
    );

    expect(resolved.outcome).toBe('implemented');
    if (resolved.outcome !== 'implemented') return;
    expect([...resolved.roster]).toEqual(smaller);
    expect(resolved.levels).toEqual({
      skullStream: 1,
      territory: 3,
      wisps: 0,
      bell: 0,
    });
  });

  it('reports a tape recorded under the old stream name and refuses to replay it', () => {
    // ADR 0043: "A tape naming a line this build does not implement is still
    // readable: its header is reported as recorded, in the tape's own
    // vocabulary." The rename spends no format version, so the bytes still
    // decode and the refusal is precise rather than blanket.
    const old = ['soulStream', 'territory', 'wisps', 'bell'];
    const resolved = resolveStartingLevels(
      headerWith({
        recordedRoster: old,
        startingLevels: { soulStream: 1, territory: 3, wisps: 0, bell: 5 },
      }),
    );

    expect(resolved.outcome).toBe('notImplemented');
    if (resolved.outcome !== 'notImplemented') return;
    expect(resolved.recordedRoster).toEqual(old);
    expect(resolved.recordedRoster).toContain('soulStream');
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
