import type { RunEnding, RunState } from "../game/run";

/**
 * What the game screen tells the end screen about the run that just ended. A
 * snapshot of values rather than the run itself, because run state is mutated
 * in place and the next run reuses it.
 */
export interface RunSummary {
  readonly seed: number;
  readonly ticks: number;
  /**
   * Which way the run finished. Null is a run the player ended themselves from
   * the pause menu, which is neither ending and must not claim to be one: the
   * grave is never destroyed or killed, it is sealed.
   */
  readonly ending: RunEnding | null;
}

export function summarizeRun(state: RunState): RunSummary {
  return { seed: state.seed, ticks: state.tick, ending: state.ending };
}

/**
 * Where the summary waits between the two screens. Screens are pooled and
 * constructed with no arguments (see src/engine/navigation/navigation.ts), so
 * a screen cannot be handed its data at construction and the handoff needs a
 * home outside both.
 */
export class RunHandoff {
  private summary: RunSummary | null = null;
  private tape: Uint8Array | null = null;

  /**
   * The tape rides beside the summary as sealed encoded bytes, never as the
   * live recorder, which dies with the game screen's reset. It is a required
   * parameter because optional is how it would get forgotten: a caller with no
   * tape says so.
   */
  public record(summary: RunSummary, tape: Uint8Array | null): void {
    this.summary = summary;
    this.tape = tape;
  }

  public read(): RunSummary | null {
    return this.summary;
  }

  /** The last run's sealed tape, or null when that run left none. */
  public readTape(): Uint8Array | null {
    return this.tape;
  }
}

// The shared handoff between the game screen and the end screen.
export const runHandoff = new RunHandoff();
