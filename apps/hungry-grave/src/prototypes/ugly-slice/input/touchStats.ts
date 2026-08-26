// Touch pipeline instrumentation (ticket #33 lag diagnosis). Answers, on the
// failing device itself: do pointer events arrive late from the browser, do
// they stop arriving (pointercancel), or do they arrive fine while the grave
// trails by policy (the speed-cap chase)? All windows are rolling ~1s.

const WINDOW_MS = 1000;

interface Sample {
  t: number;
  v: number;
}

class Rolling {
  private readonly samples: Sample[] = [];

  push(t: number, v: number): void {
    this.samples.push({ t, v });
    const cutoff = t - WINDOW_MS;
    while (this.samples.length > 0 && this.samples[0].t < cutoff) {
      this.samples.shift();
    }
  }

  get count(): number {
    return this.samples.length;
  }

  get avg(): number {
    if (this.samples.length === 0) return 0;
    let sum = 0;
    for (const s of this.samples) sum += s.v;
    return sum / this.samples.length;
  }

  get max(): number {
    let max = 0;
    for (const s of this.samples) if (s.v > max) max = s.v;
    return max;
  }
}

export class TouchStats {
  private readonly eventAge = new Rolling();
  private readonly moveGap = new Rolling();
  private readonly readDelay = new Rolling();
  private readonly chaseLag = new Rolling();
  private lastMoveAt: number | null = null;
  private lastConsumedMoveAt: number | null = null;
  private cancels = 0;
  private worstGap = 0;

  /** Raw arrival of a DOM pointermove: age = delivery delay in the browser */
  public onMove(eventTimeStamp: number, now: number): void {
    this.eventAge.push(now, now - eventTimeStamp);
    if (this.lastMoveAt !== null) {
      const gap = now - this.lastMoveAt;
      this.moveGap.push(now, gap);
      if (gap > this.worstGap) this.worstGap = gap;
    }
    this.lastMoveAt = now;
  }

  public onCancel(): void {
    this.cancels++;
  }

  public onSteerEnd(): void {
    this.lastMoveAt = null;
  }

  /** A sim read while steering: how stale the last move is, and how far the
   *  grave trails the drag target (the policy lag, in field units). */
  public onRead(now: number, chaseLagUnits: number): void {
    // Only a move not yet consumed by a read counts; a resting finger is
    // not latency.
    if (
      this.lastMoveAt !== null &&
      this.lastMoveAt !== this.lastConsumedMoveAt
    ) {
      this.readDelay.push(now, now - this.lastMoveAt);
      this.lastConsumedMoveAt = this.lastMoveAt;
    }
    this.chaseLag.push(now, chaseLagUnits);
  }

  public lines(): string[] {
    return [
      'TOUCH',
      `moves/s           ${this.eventAge.count}`,
      `event age ms      ${this.eventAge.avg.toFixed(1)} avg / ${this.eventAge.max.toFixed(1)} max`,
      `move gap ms       ${this.moveGap.avg.toFixed(1)} avg / ${this.moveGap.max.toFixed(1)} max`,
      `worst gap ms      ${this.worstGap.toFixed(0)}`,
      `read delay ms     ${this.readDelay.max.toFixed(1)} max`,
      `chase lag units   ${this.chaseLag.avg.toFixed(1)} avg / ${this.chaseLag.max.toFixed(1)} max`,
      `pointercancels    ${this.cancels}`,
    ];
  }
}
