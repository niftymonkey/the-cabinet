const DEFAULT_WINDOW_MS = 250;

/**
 * Measures the frame rate by counting frames over a window of real time. It
 * counts rather than reading Ticker.FPS, which is 1000 / elapsedMS for the one
 * frame it is read on: a spot reading that throws away every other frame in
 * the window and jitters instead of measuring.
 *
 * The window closes on raw elapsed milliseconds, never on Ticker.deltaMS,
 * which the ticker clamps to its maxElapsedMS and scales by ticker.speed.
 *
 * Pure by design. It is driven by elapsed milliseconds handed to it, never by
 * a clock of its own, so a test can drive it with explicit values.
 */
class FpsSampler {
  private readonly windowMs: number;
  private frames = 0;
  private elapsedMs = 0;

  constructor(windowMs: number = DEFAULT_WINDOW_MS) {
    this.windowMs = windowMs;
  }

  /**
   * Takes one frame's raw elapsed milliseconds and answers with the frame rate
   * measured across the window just closed, or null while it is still open.
   */
  public sample(elapsedMs: number): number | null {
    this.frames += 1;
    this.elapsedMs += elapsedMs;
    if (this.elapsedMs < this.windowMs) return null;
    const fps = Math.round((this.frames * 1000) / this.elapsedMs);
    this.frames = 0;
    this.elapsedMs = 0;
    return fps;
  }
}

export { FpsSampler };
