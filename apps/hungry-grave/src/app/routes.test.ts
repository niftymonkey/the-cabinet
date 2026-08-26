// The router's rules, tested away from pixi.

import { describe, expect, it } from 'vitest';
import { PROTOTYPES, prototypeHash } from '../prototypes';
import {
  DIGEST_HASH,
  PROTOTYPES_HASH,
  REPLAY_HASH,
  resolveRoute,
  RUNS_HASH,
} from './routes';

describe('resolveRoute', () => {
  it('the default hash routes to the game app, not to the prototypes', () => {
    for (const hash of ['', '#', '#/', '#?seed=7', '#/anything-else']) {
      expect(resolveRoute(hash).kind).toBe('game');
    }
  });

  it('the prototype list keeps #/prototypes', () => {
    expect(resolveRoute(PROTOTYPES_HASH).kind).toBe('prototype-list');
    expect(resolveRoute(`${PROTOTYPES_HASH}/`).kind).toBe('prototype-list');
    expect(resolveRoute(`${PROTOTYPES_HASH}?seed=7`).kind).toBe(
      'prototype-list',
    );
  });

  it('a hash that only starts the same, #/prototypes-old, is the game', () => {
    for (const hash of [
      `${PROTOTYPES_HASH}-old`,
      `${PROTOTYPES_HASH}x`,
      `${PROTOTYPES_HASH}-old/ugly-slice`,
    ]) {
      expect(resolveRoute(hash).kind).toBe('game');
    }
  });

  it('an unknown prototype id falls back to the list, never the game', () => {
    expect(resolveRoute(`${PROTOTYPES_HASH}/not-a-prototype`).kind).toBe(
      'prototype-list',
    );
  });

  it("#/digest resolves to the digest route, so ADR 0015's claim can be checked in a browser", () => {
    expect(resolveRoute(DIGEST_HASH).kind).toBe('digest');
    expect(resolveRoute(`${DIGEST_HASH}/`).kind).toBe('digest');
    expect(resolveRoute(`${DIGEST_HASH}?seed=7`).kind).toBe('digest');
  });

  it('#/digest-old does not, the same lookalike rule the prototype list already carries', () => {
    for (const hash of [`${DIGEST_HASH}-old`, `${DIGEST_HASH}x`]) {
      expect(resolveRoute(hash).kind).toBe('game');
    }
  });

  it('#/replay resolves to the replay route, the instrument route ADR 0020 reserves', () => {
    expect(resolveRoute(REPLAY_HASH).kind).toBe('replay');
    expect(resolveRoute(`${REPLAY_HASH}/`).kind).toBe('replay');
    expect(resolveRoute(`${REPLAY_HASH}?tape=blob%3Ax&at=120`).kind).toBe(
      'replay',
    );
  });

  it('#/replay-old does not, the same lookalike rule the digest already carries', () => {
    for (const hash of [`${REPLAY_HASH}-old`, `${REPLAY_HASH}x`]) {
      expect(resolveRoute(hash).kind).toBe('game');
    }
  });

  it('#/runs resolves to the runs route', () => {
    expect(resolveRoute(RUNS_HASH).kind).toBe('runs');
    expect(resolveRoute(`${RUNS_HASH}/`).kind).toBe('runs');
    expect(resolveRoute(`${RUNS_HASH}?seed=7`).kind).toBe('runs');
  });

  it('#/runs-old does not, the same lookalike rule again', () => {
    for (const hash of [`${RUNS_HASH}-old`, `${RUNS_HASH}x`]) {
      expect(resolveRoute(hash).kind).toBe('game');
    }
  });

  it('#/watch stays unbuilt: the reserved player route resolves nowhere yet (ADR 0020)', () => {
    // The shipped watch screen is reserved and deliberately not built, and the
    // instrument route must not quietly become it. If this test fails because
    // a watch route now exists, that is a ruling being overturned, not a fix.
    expect(resolveRoute('#/watch').kind).toBe('game');
  });

  it('a registered prototype routes to its entry, query and all', () => {
    for (const entry of PROTOTYPES) {
      const route = resolveRoute(prototypeHash(entry.id));
      expect(route).toEqual({ kind: 'prototype', entry });
      expect(resolveRoute(`${prototypeHash(entry.id)}?seed=7`)).toEqual({
        kind: 'prototype',
        entry,
      });
    }
  });
});
