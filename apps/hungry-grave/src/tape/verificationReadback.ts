// Proof that a newly recorded tape is sound, which is not the replay feature.

import { playTape } from './playback';
import type { PlaybackOutcome, PlaybackResult } from './playback';
import type { Tape } from './tape';

type VerificationOutcome = PlaybackOutcome;

type VerificationReadbackResult = PlaybackResult;

/**
 * Reproduces the run a tape holds and recomputes its witness at every
 * checkpoint the body reaches, through the one playback loop (#58). The
 * verdict is the playback's, under this seam's own name.
 *
 * VERIFICATION READBACK IS NOT REPLAY (ADR 0033). It satisfies no
 * player-facing replay obligation, and real playback machinery beside this
 * wrapper must not be read as the player feature existing; that half is #49's.
 *
 * What it proves is that the artifact the recorder just wrote is sound: that it
 * decodes, that its witness recomputes, and that the same tape gives the same
 * run twice. That is the whole of the capability. A witness that has never been
 * recomputed from a decoded tape is an untested claim.
 */
const readBackForVerification = (tape: Tape): VerificationReadbackResult =>
  playTape(tape);

export { readBackForVerification };
export type { VerificationOutcome, VerificationReadbackResult };
