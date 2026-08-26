/**
 * One tape driven through the one playback loop (#58), and the lines it reports
 * as it goes: fetched, verified, fast-forwarded, played. No display tree.
 */

import type { Clock } from '../../game/clock';
import { createClock, ticksFor } from '../../game/clock';
import type { SimEvent } from '../../game/events';
import type { RunState } from '../../game/run';
import type { DecodedTape } from '../../tape/decode';
import { decodeTape } from '../../tape/decode';
import type { Playback, PlaybackResult } from '../../tape/playback';
import { createPlayback } from '../../tape/playback';
import type { Tape } from '../../tape/tape';
import { TapeFormatError } from '../../tape/tapeFormatError';
import { REPLAY_LEAD_IN_TICKS } from './game/transients';

/**
 * How many ticks a headless phase spends per rendered frame, for the
 * verification pre-pass and the fast-forward both. At ADR 0017's measured
 * figures, a bare tick at 17 to 25 microseconds plus always-on checks at 23 to
 * 37, 120 ticks is five to eight milliseconds of a frame, and a full
 * 12,000-tick tape verifies in about a hundred frames. A named starting value,
 * data to tune and never a rule.
 */
const HEADLESS_TICKS_PER_FRAME = 120;

/**
 * Where the session is in a tape's life. Idle is a session with nothing left to
 * do: no tape named, a refused tape, or a statement standing in for playback.
 */
type ReplayPhase =
  'idle' | 'fetching' | 'verifying' | 'fastForwarding' | 'playing' | 'played';

/** The lines the session reports, for a readout to draw. */
interface ReplayLines {
  posture: string;
  verified: string;
  debt: string;
  tick: string;
  // The plain statements: a format error, a truncation, a refusal.
  statement: string;
}

/** What one frame of the session left for the screen to draw. */
interface ReplayFrame {
  /**
   * The lead-in begins this frame, so the renderers' per-run memory is dropped
   * before anything is drawn: a held transient the skip never rendered belongs
   * to no frame anybody saw (#58).
   */
  readonly forgetPreviousRun: boolean;
  // The reproduced run to draw, or null on a frame that draws nothing.
  readonly run: RunState | null;
  // This frame's announcements, buffered from the playback's tick observer.
  readonly events: readonly SimEvent[];
}

/** One tape's life: begun, advanced a frame at a time, and read off as it goes. */
interface TapePlaybackSession {
  readonly phase: ReplayPhase;
  readonly playback: Playback | null;
  // The last verified checkpoint's tick, which playback never renders past (ADR 0019).
  readonly bound: number;
  readonly lines: ReplayLines;
  // The tape at a URL, and the tick to open at; a URL of null is a tape nobody named.
  begin(url: string | null, at: number): void;
  reset(): void;
  advance(elapsedMs: number): ReplayFrame;
}

/**
 * One session's own state: what it is driving and what it has concluded. It is
 * the module's private machine and never leaves it; a caller only ever sees the
 * TapePlaybackSession above.
 */
interface Session {
  phase: ReplayPhase;
  tape: Tape | null;
  /**
   * The verification pre-pass: the whole tape reproduced headless through the
   * one playback loop, stepwise so the loading posture can advance in chunks
   * across frames. Its verdict is exactly readBackForVerification's, being the
   * same loop (#58); the readback seam itself stays what ADR 0020 says it is,
   * the recorder's proof of its own artifact, and is deliberately not imported
   * into a replay.
   */
  verification: Playback | null;
  // The reproduction being rendered, bounded by the last verified checkpoint.
  playback: Playback | null;
  readonly frameEvents: SimEvent[];
  bound: number;
  // The tick the caller asked to open at, clamped to the bound once that is known.
  target: number;
  clock: Clock;
  /**
   * Which begin() the in-flight fetch belongs to. The screen driving this is
   * pooled, and a fetch that resolves after reset() must not dress a later
   * showing with an earlier tape.
   */
  generation: number;
  readonly lines: ReplayLines;
}

// A frame with nothing on it: the headless phases, and a session with nothing left to do.
const NOTHING_DRAWN: ReplayFrame = {
  forgetPreviousRun: false,
  run: null,
  events: [],
};

/**
 * The tick of the last checkpoint this playback verified. The playback
 * verifies a tape's checkpoints in ascending order and stops at the first
 * disagreement, so the verified ones are exactly the first
 * checkpointsVerified entries.
 */
const lastVerifiedTick = (tape: Tape, result: PlaybackResult): number => {
  if (result.checkpointsVerified === 0) return 0;
  return tape.checkpoints[result.checkpointsVerified - 1].index;
};

// The verified length, stated up front, with the divergence named when there is one.
const verifiedReadout = (
  result: PlaybackResult,
  bound: number,
  bodyTicks: number,
): string => {
  const length = `VERIFIED ${bound} OF ${bodyTicks} TICKS`;
  if (result.firstDivergentCheckpoint === null) return length;
  return `${length}, DIVERGED AT CHECKPOINT ${result.firstDivergentCheckpoint}`;
};

/**
 * The original run's tick debt, stated beside the verified length. A missing
 * trailer is itself the reading (ADR 0018): the run's stop is unknown and so
 * is its debt, and saying so is the honest line.
 */
const debtReadout = (tape: Tape): string => {
  if (tape.trailer === null) return 'NO TRAILER: STOP AND DEBT UNKNOWN';
  return `ORIGINAL DEBT ${tape.trailer.debtTicks} TICKS`;
};

const messageOf = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

const clearLines = (lines: ReplayLines): void => {
  lines.posture = '';
  lines.verified = '';
  lines.debt = '';
  lines.tick = '';
  lines.statement = '';
};

// A statement instead of a playback: the session reports and plays nothing.
const refuse = (session: Session, statement: string): void => {
  session.phase = 'idle';
  session.lines.posture = 'NO REPLAY';
  session.lines.statement = statement;
};

// The frame the screen draws, this frame's announcements handed over and the buffer emptied.
const drawnFrame = (
  session: Session,
  playback: Playback,
  forgetPreviousRun: boolean,
): ReplayFrame => {
  const events = session.frameEvents.slice();
  session.frameEvents.length = 0;
  session.lines.tick = `TICK ${playback.run.tick}`;
  return { forgetPreviousRun, run: playback.run, events };
};

/**
 * The honest priming (#58): headless to a lead-in short of the target, then the
 * renderers' per-run memory is dropped, because a held transient the skip never
 * rendered belongs to no frame anybody saw, and the lead-in is then rendered
 * normally so every transient alive at the target was seen born.
 * REPLAY_LEAD_IN_TICKS covers the registry of held lifetimes, which the
 * transients test holds.
 */
const fastForwardChunk = (session: Session): ReplayFrame => {
  const playback = session.playback;
  if (playback === null) return NOTHING_DRAWN;
  const skipTo = Math.max(0, session.target - REPLAY_LEAD_IN_TICKS);
  let spent = 0;
  let rolling = true;
  while (
    rolling &&
    spent < HEADLESS_TICKS_PER_FRAME &&
    playback.run.tick < skipTo
  ) {
    rolling = playback.advanceTick();
    spent += 1;
  }
  // Headless ticks announce nothing: their momentary effects are older than
  // the lead-in by construction and would be invisible at the target anyway.
  session.frameEvents.length = 0;
  if (rolling && playback.run.tick < skipTo) return NOTHING_DRAWN;
  session.clock = createClock();
  session.phase = 'playing';
  session.lines.posture = 'REPLAYING';
  return drawnFrame(session, playback, true);
};

/**
 * The verdict, stated up front, and the bounded playback primed from it.
 * The target the caller asked for is clamped to the bound, because the bound is
 * where honesty ends: never show frames after the replay can no longer be
 * verified as the original run (ADR 0019).
 */
const primePlayback = (
  session: Session,
  tape: Tape,
  result: PlaybackResult,
): ReplayFrame => {
  session.bound = lastVerifiedTick(tape, result);
  session.lines.verified = verifiedReadout(
    result,
    session.bound,
    tape.commands.length,
  );
  session.lines.debt = debtReadout(tape);
  if (result.outcome === 'witnessVersionMismatch') {
    refuse(
      session,
      `THIS TAPE'S WITNESS IS VERSION ${result.tapeWitnessVersion} AND THIS READER FOLDS VERSION ${result.readerWitnessVersion}: IT CANNOT BE VERIFIED HERE.`,
    );
    return NOTHING_DRAWN;
  }
  session.target = Math.min(session.target, session.bound);
  session.playback = createPlayback(tape, (_tick, _command, events) => {
    for (const event of events) session.frameEvents.push(event);
  });
  session.phase = 'fastForwarding';
  session.lines.posture = 'FAST-FORWARDING';
  return fastForwardChunk(session);
};

const verifyChunk = (session: Session): ReplayFrame => {
  const verification = session.verification;
  const tape = session.tape;
  if (verification === null || tape === null) return NOTHING_DRAWN;
  let spent = 0;
  while (spent < HEADLESS_TICKS_PER_FRAME && verification.advanceTick()) {
    spent += 1;
  }
  if (spent === HEADLESS_TICKS_PER_FRAME) return NOTHING_DRAWN;
  session.verification = null;
  return primePlayback(session, tape, verification.result());
};

// Real elapsed time spent as ticks (ADR 0015), stopping at the bound.
const playFrame = (session: Session, elapsedMs: number): ReplayFrame => {
  const playback = session.playback;
  if (playback === null) return NOTHING_DRAWN;
  let ticks = ticksFor(session.clock, elapsedMs);
  let rolling = true;
  while (rolling && ticks > 0 && playback.run.tick < session.bound) {
    rolling = playback.advanceTick();
    ticks -= 1;
  }
  const frame = drawnFrame(session, playback, false);
  if (!rolling || playback.run.tick >= session.bound) {
    session.phase = 'played';
    session.lines.posture = `PLAYED TO TICK ${playback.run.tick}, THE LAST VERIFIED CHECKPOINT`;
  }
  return frame;
};

const receiveTape = (session: Session, decoded: DecodedTape): void => {
  session.tape = decoded.tape;
  if (decoded.truncated) {
    session.lines.statement =
      'THE TAPE IS CUT SHORT: IT READS TO ITS LAST WHOLE RECORD AND PLAYS TO ITS LAST VERIFIED CHECKPOINT.';
  }
  session.verification = createPlayback(decoded.tape);
  session.phase = 'verifying';
  session.lines.posture = 'VERIFYING';
};

/**
 * The tape's bytes, from wherever the URL points: the runs screen hands a
 * blob URL here, and any later source walks the same door.
 */
const fetchTape = async (
  session: Session,
  url: string,
  generation: number,
): Promise<void> => {
  let bytes: Uint8Array;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`the tape URL answered ${response.status}`);
    }
    bytes = new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    // An unreachable URL is an external failure, stated as a fact.
    if (generation === session.generation) {
      refuse(session, `THE TAPE COULD NOT BE FETCHED: ${messageOf(error)}`);
    }
    return;
  }
  if (generation !== session.generation) return;
  try {
    receiveTape(session, decodeTape(bytes));
  } catch (error) {
    // A tape that cannot be read is rejected and its refusal shown plainly;
    // anything else is a bug and keeps flying.
    if (!(error instanceof TapeFormatError)) throw error;
    refuse(session, error.message);
  }
};

const begin = (session: Session, url: string | null, at: number): void => {
  session.generation += 1;
  session.phase = 'idle';
  session.tape = null;
  session.verification = null;
  session.playback = null;
  session.frameEvents.length = 0;
  session.bound = 0;
  session.clock = createClock();
  clearLines(session.lines);
  session.target = at;
  if (url === null) {
    refuse(session, 'NO TAPE NAMED: #/replay?tape=<url>&at=<tick> NAMES ONE.');
    return;
  }
  session.phase = 'fetching';
  session.lines.posture = 'FETCHING TAPE';
  void fetchTape(session, url, session.generation);
};

const reset = (session: Session): void => {
  session.generation += 1;
  session.phase = 'idle';
  session.tape = null;
  session.verification = null;
  session.playback = null;
  session.frameEvents.length = 0;
  session.bound = 0;
  session.target = 0;
  clearLines(session.lines);
};

/**
 * One frame of the session's work: the two headless phases advance in chunks,
 * so a long tape shows a loading posture rather than a hung frame, and the
 * playing phase spends real time as ticks the way the game does.
 */
const advance = (session: Session, elapsedMs: number): ReplayFrame => {
  if (session.phase === 'verifying') return verifyChunk(session);
  if (session.phase === 'fastForwarding') return fastForwardChunk(session);
  if (session.phase === 'playing') return playFrame(session, elapsedMs);
  return NOTHING_DRAWN;
};

const createTapePlaybackSession = (): TapePlaybackSession => {
  const session: Session = {
    phase: 'idle',
    tape: null,
    verification: null,
    playback: null,
    frameEvents: [],
    bound: 0,
    target: 0,
    clock: createClock(),
    generation: 0,
    lines: { posture: '', verified: '', debt: '', tick: '', statement: '' },
  };
  return {
    get phase() {
      return session.phase;
    },
    get playback() {
      return session.playback;
    },
    get bound() {
      return session.bound;
    },
    lines: session.lines,
    begin: (url, at) => begin(session, url, at),
    reset: () => reset(session),
    advance: (elapsedMs) => advance(session, elapsedMs),
  };
};

export { createTapePlaybackSession };
export type { ReplayFrame, ReplayLines, ReplayPhase, TapePlaybackSession };
