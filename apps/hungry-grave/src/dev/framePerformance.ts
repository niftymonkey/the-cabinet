// The performance read off a tape's frame rows (ADR 0018): the timing
// distributions, the tick debt over time, and the frames that cost too much.

import type { FrameObservation, FrameReason } from '../tape/tape';
import type { FieldDensity } from './replayTallies';

/**
 * The frame interval past which a frame is reported as expensive, in
 * milliseconds. A named starting value and data to tune, never a rule: 25ms is
 * a frame that missed a 60Hz deadline by half a frame, and the right figure is
 * whatever the measured runs say it is.
 */
const EXPENSIVE_FRAME_INTERVAL_MS = 25;

// One timing series summarised. Nearest-rank percentiles; all zero when the series is empty.
interface Distribution {
  readonly count: number;
  readonly min: number;
  readonly max: number;
  readonly mean: number;
  readonly p50: number;
  readonly p95: number;
  readonly p99: number;
}

// The tick debt as of one frame row, recorded only where it changed.
interface DebtSample {
  // The row's index among the tape's frame observations.
  readonly frame: number;
  readonly tick: number | null;
  readonly debtTicks: number;
}

/**
 * One frame past the expensive threshold, joined to the field that frame began
 * on. The density is sampled during the same single replay pass, and it is
 * null when the frame bought no tick or the replay never reached its tick.
 */
interface ExpensiveFrame {
  // The row's index among the tape's frame observations.
  readonly frame: number;
  readonly reason: FrameReason;
  readonly tick: number | null;
  readonly intervalMs: number;
  readonly advanceMs: number;
  readonly updateMs: number;
  readonly ticksExecuted: number;
  readonly debtTicks: number;
  readonly density: FieldDensity | null;
}

interface PerformanceReport {
  readonly frames: number;
  readonly interval: Distribution;
  readonly advance: Distribution;
  readonly update: Distribution;
  readonly ticksPerFrame: Distribution;
  // Frames that bought more than one tick.
  readonly catchUpFrames: number;
  readonly debtOverTime: readonly DebtSample[];
  readonly expensiveFrames: readonly ExpensiveFrame[];
}

// Nearest-rank percentile over an ascending series.
const percentile = (sorted: readonly number[], rank: number): number =>
  sorted[Math.max(0, Math.ceil(rank * sorted.length) - 1)];

const distributionOf = (values: readonly number[]): Distribution => {
  if (values.length === 0) {
    return { count: 0, min: 0, max: 0, mean: 0, p50: 0, p95: 0, p99: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((total, value) => total + value, 0);
  return {
    count: sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: sum / sorted.length,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
  };
};

// The debt series compacted to the frames where it changed, the first row always included.
const debtSamplesOf = (frames: readonly FrameObservation[]): DebtSample[] => {
  const samples: DebtSample[] = [];
  let last: number | null = null;
  frames.forEach((frame, index) => {
    if (frame.debtTicks === last) return;
    samples.push({
      frame: index,
      tick: frame.tickIndex,
      debtTicks: frame.debtTicks,
    });
    last = frame.debtTicks;
  });
  return samples;
};

const isExpensive = (frame: FrameObservation): boolean =>
  frame.intervalMs >= EXPENSIVE_FRAME_INTERVAL_MS;

const expensiveFramesOf = (
  frames: readonly FrameObservation[],
  densities: ReadonlyMap<number, FieldDensity>,
): ExpensiveFrame[] =>
  frames.flatMap((frame, index) => {
    if (!isExpensive(frame)) return [];
    return [
      {
        frame: index,
        reason: frame.reason,
        tick: frame.tickIndex,
        intervalMs: frame.intervalMs,
        advanceMs: frame.advanceMs,
        updateMs: frame.updateMs,
        ticksExecuted: frame.ticksExecuted,
        debtTicks: frame.debtTicks,
        density:
          frame.tickIndex === null
            ? null
            : (densities.get(frame.tickIndex) ?? null),
      },
    ];
  });

// The ticks the expensive frames began at, decided before the pass so the join needs only one.
const ticksToSample = (
  frames: readonly FrameObservation[],
): ReadonlySet<number> => {
  const ticks = new Set<number>();
  for (const frame of frames) {
    if (isExpensive(frame) && frame.tickIndex !== null) {
      ticks.add(frame.tickIndex);
    }
  }
  return ticks;
};

const performanceOf = (
  frames: readonly FrameObservation[],
  densities: ReadonlyMap<number, FieldDensity>,
): PerformanceReport => ({
  frames: frames.length,
  interval: distributionOf(frames.map((frame) => frame.intervalMs)),
  advance: distributionOf(frames.map((frame) => frame.advanceMs)),
  update: distributionOf(frames.map((frame) => frame.updateMs)),
  ticksPerFrame: distributionOf(frames.map((frame) => frame.ticksExecuted)),
  catchUpFrames: frames.filter((frame) => frame.ticksExecuted > 1).length,
  debtOverTime: debtSamplesOf(frames),
  expensiveFrames: expensiveFramesOf(frames, densities),
});

export { performanceOf, ticksToSample };
export type { DebtSample, Distribution, ExpensiveFrame, PerformanceReport };
