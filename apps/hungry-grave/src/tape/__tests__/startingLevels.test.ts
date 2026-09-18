// The recorded roster, resolved against the roster this build implements (ADR 0043).

import { describe, expect, it } from 'vitest';

import { WEAPON_LINES } from '../../game/lines/roster';
import { resolveStartingLevels } from '../startingLevels';

/** The levels a tape recorded, in its own vocabulary rather than this build's. */
const RECORDED: Record<string, number> = {
  skullStream: 1,
  territory: 3,
  wisps: 0,
  bell: 5,
};

describe('resolveStartingLevels', () => {
  it('reads starting levels by name against the recorded roster, never by position', () => {
    // The roster IS the order, so a tape that recorded its lines in a different
    // order than this build lists them still resolves to the same levels. A
    // positional read would hand back a permuted record and nothing would say
    // so, which is the exact failure ADR 0043 was written against.
    const shuffled = [...WEAPON_LINES].reverse();
    const resolved = resolveStartingLevels(shuffled, RECORDED);

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
    const resolved = resolveStartingLevels(recorded, {
      ...RECORDED,
      moonlight: 2,
    });

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
    const levels = { ...RECORDED };
    delete levels.bell;
    const resolved = resolveStartingLevels(smaller, levels);

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
    const resolved = resolveStartingLevels(old, {
      soulStream: 1,
      territory: 3,
      wisps: 0,
      bell: 5,
    });

    expect(resolved.outcome).toBe('notImplemented');
    if (resolved.outcome !== 'notImplemented') return;
    expect(resolved.recordedRoster).toEqual(old);
    expect(resolved.recordedRoster).toContain('soulStream');
  });

  it('refuses a roster that names the same line twice', () => {
    // A duplicate name means one of the two recorded levels is unreachable by
    // name, which is the positional ambiguity this whole seam exists to remove.
    const firstLine = WEAPON_LINES[0];
    if (firstLine === undefined) throw new Error('WEAPON_LINES is empty');
    const doubled = [...WEAPON_LINES, firstLine];
    const resolved = resolveStartingLevels(doubled, RECORDED);

    expect(resolved.outcome).toBe('notImplemented');
  });
});
