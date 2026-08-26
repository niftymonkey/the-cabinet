/**
 * The minimal export's plumbing, asserted at the browser seam it drives.
 *
 * Authored from ADR 0020: an anchor with a download name on a blob URL, fired
 * from inside a real tap handler. The gesture itself is iOS Safari's to judge
 * and no test here can see it, so what is pinned is the wiring the gesture
 * runs: the bytes reach the blob unchanged, the anchor carries the name, and
 * the URL is not revoked before the download has had time to start.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { saveTapeFile, tapeFileName } from './tapeExport';

interface FakeAnchor {
  href: string;
  download: string;
  click: () => void;
  remove: () => void;
}

describe("the tape's file name", () => {
  it("identifies the run: its seed and the build's commit hash", () => {
    expect(tapeFileName(505, 'f389eb55ff')).toBe(
      'hungry-grave-505-f389eb55ff.tape',
    );
  });

  it("shortens a full forty-character sha to the repo's short form", () => {
    expect(tapeFileName(7, 'f389eb55ff0123456789abcdef0123456789abcd')).toBe(
      'hungry-grave-7-f389eb55ff.tape',
    );
  });
});

describe('saving a tape file', () => {
  const createObjectURL = vi.fn<(blob: Blob) => string>(
    () => 'blob:tape-under-test',
  );
  const revokeObjectURL = vi.fn();
  let anchor: FakeAnchor;
  let attached: FakeAnchor[];
  let clickedWith: {
    href: string;
    download: string;
    inDocument: boolean;
  } | null;

  beforeEach(() => {
    vi.useFakeTimers();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    clickedWith = null;
    attached = [];
    anchor = {
      href: '',
      download: '',
      click: () => {
        clickedWith = {
          href: anchor.href,
          download: anchor.download,
          inDocument: attached.includes(anchor),
        };
      },
      remove: () => {
        attached = attached.filter((each) => each !== anchor);
      },
    };
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.stubGlobal('document', {
      createElement: () => anchor,
      body: { appendChild: (each: FakeAnchor) => attached.push(each) },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("clicks an anchor carrying the blob URL and the file's name", () => {
    saveTapeFile(new Uint8Array([1, 2, 3]), 'hungry-grave-505-abc.tape');

    expect(clickedWith).toEqual({
      href: 'blob:tape-under-test',
      download: 'hungry-grave-505-abc.tape',
      inDocument: true,
    });
  });

  it('has the anchor in the document for the click, and out of it after', () => {
    // Firefox historically honours a download click only on an anchor that is
    // in the document, while iOS Safari does not care either way. Detached, the
    // click did nothing on exactly one of the two browsers the export serves.
    saveTapeFile(new Uint8Array([1]), 'a.tape');

    expect(clickedWith?.inDocument).toBe(true);
    expect(attached).toHaveLength(0);
  });

  it('hands the sealed bytes out unchanged, never a re-encoding', () => {
    const bytes = new Uint8Array([72, 71, 84, 80, 9]);

    saveTapeFile(bytes, 'a.tape');

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob.size).toBe(bytes.length);
  });

  it('keeps the blob URL alive past the click, then revokes it', () => {
    // The download starts after the tap handler returns, so a URL revoked
    // synchronously can hand the browser nothing.
    saveTapeFile(new Uint8Array([1]), 'a.tape');

    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:tape-under-test');
  });
});
