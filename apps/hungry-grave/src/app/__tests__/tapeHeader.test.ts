/**
 * The header a person's run opens with, taken at the pure half of the seam.
 *
 * The module is split in two so the header is a function of a run and a record
 * of conditions, testable without a browser (`tapeHeader.ts`). This file tests
 * that half and never the reading of the page.
 */

import { describe, expect, it } from 'vitest';

import { createRun } from '../../game/run';
import { PERSON_POLICY } from '../../tape/tape';
import type { RunConditions } from '../tapeHeader';
import { tapeHeaderFor } from '../tapeHeader';

const SEED = 20260909;

/** A browser's conditions, each field a different value so none stands in for another. */
const CONDITIONS: RunConditions = {
  inputDevice: 'keyboard',
  keyboardSpeed: 1.25,
  rendererBackend: 'webgl',
  rendererResolution: 2,
  devicePixelRatio: 3,
  recordedAt: 1_766_200_000_789,
};

describe("the header a person's run records", () => {
  it('records person as the policy that steered it', () => {
    // ADR 0053: a bot run is never mistaken for a person's, and this is that
    // rule from the game's own side. ADR 0027 forbids an absence, so the empty
    // string is not available and `person` is resolved and true.
    const header = tapeHeaderFor(createRun(SEED), CONDITIONS);

    expect(header.policy).toBe(PERSON_POLICY);
    expect(header.policy).not.toBe('');
    expect(header.inputDevice).toBe('keyboard');
  });
});
