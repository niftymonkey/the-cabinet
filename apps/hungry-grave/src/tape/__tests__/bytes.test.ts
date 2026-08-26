/**
 * The byte cursor a tape is written through, at the one place it repairs
 * something rather than refusing it: the capacity a caller asks for.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createWriter, writeU8, writtenBytes } from '../bytes';

describe('the capacity a writer is built with', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('a capacity below one byte is not silent', () => {
    const writer = createWriter(0);
    writeU8(writer, 7);

    expect([...writtenBytes(writer)]).toEqual([7]);

    const said = vi
      .mocked(console.warn)
      .mock.calls.map((call) => call.join(' '));
    expect(said).toHaveLength(1);
    // What happened, and what it costs.
    expect(said[0]).toContain('0');
    expect(said[0]).toContain('bug');
  });

  it('a capacity a caller can write into says nothing, and so does the default', () => {
    createWriter();
    createWriter(1);
    createWriter(4096);

    expect(console.warn).not.toHaveBeenCalled();
  });
});
