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
 * VERIFICATION READBACK IS NOT REPLAY (ADR 0020, and it is quoted rather than
 * paraphrased).
 *
 * - Verification readback is not the replay feature.
 * - It exists only to prove that a newly recorded tape can be decoded and
 *   deterministically reproduced.
 * - Full replay remains owned by 6b.
 * - No 6b replay story, issue, acceptance criterion or other obligation may be
 *   treated as satisfied by the existence of verification readback.
 * - Future work must not infer that replay exists merely because internal
 *   readback primitives do.
 *
 * Amended 2026-08-26: 6b has delivered, and the ownership bullet above is
 * discharged rather than transferred. The player-facing half, the reserved
 * `#/watch` screen and getting a tape out of one browser and into another, is
 * owned by #49, and no #49 obligation may be treated as satisfied by
 * verification readback or the instrument route existing.
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
