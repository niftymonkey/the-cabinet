/**
 * The minimal export: the smallest plumbing that gets one recorded run off a
 * phone (ADR 0020).
 *
 * It is scaffolding and never the storage or analytics system. A later system
 * may send this evidence straight to durable storage, at which point this
 * escape hatch is removed rather than grown. It exists because nothing else
 * lets a tape outlive its run: without it the evidence a measurement needs dies
 * with the tab on the one device the question is about.
 *
 * The mechanism is an anchor with a download name on a blob URL, clicked from
 * inside a real tap handler, which iOS Safari honours from version 13. The
 * caller owns the gesture: WebKit ignores a programmatic download that no user
 * gesture is running, so these functions must be called from the tap itself.
 */

/**
 * How much of the commit hash the file name carries. The header inside the
 * bytes keeps the full hash; the name only has to tell one build's tapes from
 * another's at a glance, the way the repo's own short hashes do.
 */
const NAME_HASH_LENGTH = 10;

/**
 * How long the blob URL outlives the click, in milliseconds. The browser
 * starts the download after the tap handler returns, so a URL revoked
 * synchronously can hand it nothing; a minute is over once the download has
 * begun and the run's end screen is still up.
 */
const REVOKE_DELAY_MS = 60_000;

// A name that identifies the run: the dice it rolled and the build that ran them.
const tapeFileName = (seed: number, commitHash: string): string => {
  return `hungry-grave-${seed}-${commitHash.slice(0, NAME_HASH_LENGTH)}.tape`;
};

/**
 * Hands sealed tape bytes to the browser as a file download.
 *
 * The bytes are handed out exactly as the recorder sealed them, never
 * re-encoded here: this module does not own the run and has no business
 * producing a second version of its record.
 */
const saveTapeFile = (bytes: Uint8Array, fileName: string): void => {
  const url = URL.createObjectURL(
    new Blob([bytes], { type: 'application/octet-stream' }),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  // In the document for the click, FileSaver-style: iOS Safari honours a
  // detached anchor's download click and Firefox historically only honours one
  // on an anchor that is in the document.
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
};

export { tapeFileName, saveTapeFile };
