// The mailbox the last run's summary and sealed tape wait in, between screens.

import type { RunSummary } from './runSummary';

/**
 * Screens are pooled and constructed with no arguments (see
 * src/engine/navigation/navigation.ts), so a screen cannot be handed its data
 * at construction and the handoff needs a home outside both.
 */
class RunHandoff {
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

  // The last run's sealed tape, or null when that run left none.
  public readTape(): Uint8Array | null {
    return this.tape;
  }
}

// The shared handoff between the game screen and the end screen.
const runHandoff = new RunHandoff();

export { RunHandoff, runHandoff };
