/**
 * The game's voice (plan 6.22). It subscribes to the event list and nothing
 * else, and holds no game rules of its own.
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../../game/events';
import { clipFor } from '../sound';

const SRC = resolve(import.meta.dirname, '..', '..');

/** One of every event the sim can emit, so the ignored ones are checked as a set. */
const EVERY_EVENT: SimEvent[] = [
  { type: 'swallowed', kind: 'corpse', freshness: 1, payout: 1 },
  { type: 'chimed', kind: 'corpse' },
  { type: 'chimed', kind: 'drop' },
  { type: 'chimed', kind: 'feast' },
  { type: 'grew', amount: 1, size: 20 },
  { type: 'overflowed', amount: 1, score: 1 },
  { type: 'reservoirCharged', amount: 1, reservoir: 1 },
  { type: 'splashed', wasted: 1, reservoir: 1 },
  { type: 'reservoirFull', reservoir: 1 },
  { type: 'weaponLeveled', line: 'bell', level: 2 },
  { type: 'graveHit', source: 'contact', size: 20, invulnerable: 24 },
  { type: 'mobDamaged', id: 7, amount: 1, source: 'bell' },
  { type: 'scoreBled', amount: 5 },
  { type: 'weaponStripped', lines: ['bell'] },
  { type: 'sealed', tick: 10 },
  { type: 'victory', tick: 10 },
  { type: 'mobKilled', id: 7, mob: 'shambler', x: 1, y: 2 },
  { type: 'mobFired', emitter: 'shambler', x: 1, y: 2 },
  { type: 'corpseExpired', x: 1, y: 2 },
  { type: 'corpseEvicted', x: 1, y: 2, freshness: 0.1 },
  { type: 'corpseLost', kind: 'corpse', x: 1, y: 2, freshness: 0.5 },
  { type: 'tolled', level: 3, radius: 165 },
  { type: 'belched', cancelled: 12, killed: 4 },
  { type: 'dropSpawned', line: 'wisps', x: 1, y: 2 },
  { type: 'phaseChanged', phase: 'backHalf', tick: 10 },
];

describe('which events make a sound (plan 6.22)', () => {
  it('reacts to chimed, tolled, graveHit and belched, and ignores every other event', () => {
    const heard = EVERY_EVENT.filter((event) => clipFor(event) !== null).map(
      (event) => event.type,
    );
    expect(new Set(heard)).toEqual(
      new Set(['chimed', 'tolled', 'graveHit', 'belched']),
    );
  });

  it('covers five clips, because coverage is the point rather than the count', () => {
    // An earlier shape shipped two and both landed on the two commonest events
    // in the game while the scarcest objects stayed silent: a drop sounded
    // exactly like a corpse and the belch made no noise at all.
    const clips = new Set(
      EVERY_EVENT.map(clipFor).filter((clip) => clip !== null),
    );
    expect(clips).toEqual(
      new Set(['swallow', 'treasure', 'toll', 'hit', 'eruption']),
    );
  });
});

describe('the swallow chime and the treasure chime (plan 6.22)', () => {
  it('chimes for a corpse and for a feast, from the very first swallow whatever the loadout', () => {
    // The headline criterion that stops an unlucky drop sequence leaving the
    // early minutes silent.
    expect(clipFor({ type: 'chimed', kind: 'corpse' })).toBe('swallow');
    expect(clipFor({ type: 'chimed', kind: 'feast' })).toBe('swallow');
  });

  it('plays a different clip for a drop, chosen from the kind the event already carries', () => {
    // The scarcest object in the game must not sound like the commonest, and
    // this needs no event change and no game rule here: Chimed already carries
    // the food's kind.
    expect(clipFor({ type: 'chimed', kind: 'drop' })).toBe('treasure');
    expect(clipFor({ type: 'chimed', kind: 'drop' })).not.toBe(
      clipFor({ type: 'chimed', kind: 'corpse' }),
    );
  });
});

describe('it holds no game rule (plan 6.22)', () => {
  it('plays the same clip for the same event, whatever the run state is', () => {
    // A pure function of the event. There is no run to vary, which is the
    // property: the events carry values for exactly this reason.
    const event: SimEvent = { type: 'tolled', level: 1, radius: 80 };
    expect(clipFor(event)).toBe(clipFor(event));
    expect(clipFor({ type: 'tolled', level: 5, radius: 250 })).toBe(
      clipFor(event),
    );
  });

  it('keeps its imports inside the boundary rule that governs it', () => {
    // src/boundary.test.ts holds this mechanically; this is the readable half,
    // so a reader of the module sees what it is allowed to reach.
    const source = readFileSync(join(SRC, 'app', 'sound.ts'), 'utf8');
    const specifiers = [...source.matchAll(/from\s+"([^"]+)"/g)].map(
      (match) => match[1],
    );
    for (const specifier of specifiers) {
      const inside =
        !specifier.startsWith('../game') || specifier === '../game/events';
      expect(`${specifier}: ${inside}`).toBe(`${specifier}: true`);
    }
  });
});
