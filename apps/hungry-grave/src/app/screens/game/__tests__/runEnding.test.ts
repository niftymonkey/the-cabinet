/**
 * How a run reaches its end state: the seal, the hold a won run keeps the field
 * for, and the one way out (design record R6).
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Execution } from '../../../../game/execution';
import { createExecution } from '../../../../game/execution';
import type { RunState } from '../../../../game/run';
import { createRun } from '../../../../game/run';
import { ENDING_SCENE_MS } from '../endingScene';
import type { EndingPowers, RunEnding } from '../runEnding';
import { createRunEnding } from '../runEnding';

/** How many frames the hold is spent over, so a frame is a real slice of it. */
const FRAMES_IN_THE_HOLD = 20;
const FRAME_MS = ENDING_SCENE_MS / FRAMES_IN_THE_HOLD;

/** The four powers, faked, so the ending's own machine is all that is under test. */
function faked(showEnd: () => Promise<void> = async () => undefined) {
  return {
    sealTape: vi.fn<(execution: Execution) => void>(),
    tapeBytes: () => null,
    clearFieldBlur: () => undefined,
    showEnd: vi.fn(showEnd),
  } satisfies EndingPowers;
}

/** A run standing at the ending it reached, with the stop its execution carries. */
function stood(
  ending: RunState['ending'],
  stop: Execution['stop'] = null,
): { run: RunState; execution: Execution } {
  const run = createRun(11);
  const execution = createExecution(run);
  run.ending = ending;
  execution.stop = stop;
  return { run, execution };
}

/** The frame seam's own loop: the ending re-entered on every frame, holding or not. */
function playFrames(
  ending: RunEnding,
  run: RunState,
  execution: Execution,
  frames: number,
): void {
  for (let frame = 0; frame < frames; frame++) {
    ending.advance(FRAME_MS);
    ending.end(run, execution);
  }
}

describe('the run ending', () => {
  afterEach(() => vi.restoreAllMocks());

  it('a won run seals its record on the ending tick, exactly as a lost one does', () => {
    // R6: the seal does not move. A drawing bug must never be able to cost a
    // player the tape, so the trailer is written on the ending tick whichever
    // way the run ended.
    const powers = faked();
    const ending = createRunEnding(powers);
    const { run, execution } = stood('victory');

    ending.end(run, execution);

    expect(powers.sealTape).toHaveBeenCalledTimes(1);
    expect(powers.sealTape).toHaveBeenCalledWith(execution);
    expect(ending.ended).toBe(true);
  });

  it('a won run does not leave for the next screen on the ending tick', () => {
    // R6: the win ends with a scene the player watches, so the field is held
    // rather than cut away from on the frame the last boss falls.
    const powers = faked();
    const ending = createRunEnding(powers);
    const { run, execution } = stood('victory');

    ending.end(run, execution);

    expect(powers.showEnd).not.toHaveBeenCalled();
  });

  it("a won run leaves for the next screen once the scene's length has been spent", () => {
    // R6: the ending module owns when the hold ends, so the way out runs on its
    // own clock and a drawing bug cannot strand a won run.
    const powers = faked();
    const ending = createRunEnding(powers);
    const { run, execution } = stood('victory');

    ending.end(run, execution);
    playFrames(ending, run, execution, FRAMES_IN_THE_HOLD);

    expect(powers.showEnd).toHaveBeenCalledTimes(1);
  });

  it('a lost run leaves at once', () => {
    // R6: victory only. A sealed run has no scene and goes straight to the end screen.
    const powers = faked();
    const ending = createRunEnding(powers);
    const { run, execution } = stood('sealed');

    ending.end(run, execution);

    expect(powers.showEnd).toHaveBeenCalledTimes(1);
    expect(ending.sceneProgress).toBeNull();
  });

  it('a run stopped by a fatal fault leaves at once', () => {
    // R6: a fatal fault stops the run through the authority (ADR 0017) and
    // leaves the ending null, so there is nothing to celebrate and no hold.
    const powers = faked();
    const ending = createRunEnding(powers);
    const { run, execution } = stood(null, 'faulted');

    ending.end(run, execution);

    expect(powers.showEnd).toHaveBeenCalledTimes(1);
    expect(ending.sceneProgress).toBeNull();
  });

  it('a run quit from the pause menu leaves at once', () => {
    // R6: a quit leaves the ending null, and a player who asked to leave is not
    // made to watch anything.
    const powers = faked();
    const ending = createRunEnding(powers);
    const { run, execution } = stood(null);

    ending.end(run, execution);

    expect(powers.showEnd).toHaveBeenCalledTimes(1);
    expect(ending.sceneProgress).toBeNull();
  });

  it('the record is sealed once however many frames the hold lasts', () => {
    // The capture is once-only: a re-entry that sealed again would fold the
    // scene's own frames into the exported artifact.
    const powers = faked();
    const ending = createRunEnding(powers);
    const { run, execution } = stood('victory');

    ending.end(run, execution);
    playFrames(ending, run, execution, FRAMES_IN_THE_HOLD * 2);

    expect(powers.sealTape).toHaveBeenCalledTimes(1);
  });

  it('a rejected way out is tried again on the next frame, and the record stays sealed', () => {
    // The navigation guard comes back down on a rejection and the ending latch
    // does not: lowering the latch would let a post-stop frame step a stopped run.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let attempts = 0;
    const powers = faked(async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('the end screen refused');
    });
    const ending = createRunEnding(powers);
    const { run, execution } = stood('victory');

    ending.end(run, execution);
    playFrames(ending, run, execution, FRAMES_IN_THE_HOLD);
    return Promise.resolve().then(() => {
      ending.end(run, execution);
      expect(powers.showEnd).toHaveBeenCalledTimes(2);
      expect(powers.sealTape).toHaveBeenCalledTimes(1);
      expect(ending.ended).toBe(true);
    });
  });

  it('the hold ends on the frame clock alone, so nothing a player does can shorten it', () => {
    // R6: no tap skips the scene in this step. end() re-enters from the frame
    // seam on every frame, and re-entry alone must never spend the hold.
    const powers = faked();
    const ending = createRunEnding(powers);
    const { run, execution } = stood('victory');

    ending.end(run, execution);
    for (let frame = 0; frame < FRAMES_IN_THE_HOLD * 4; frame++) {
      ending.end(run, execution);
    }

    expect(powers.showEnd).not.toHaveBeenCalled();
    expect(ending.sceneProgress).toBe(0);
  });

  it('the hold reports no progress before it starts, and runs from nothing to whole while it holds', () => {
    // The scene is handed a progress number and answers with pixels, so the
    // number has to start at nothing, reach whole, and stop there.
    const powers = faked();
    const ending = createRunEnding(powers);
    const { run, execution } = stood('victory');

    expect(ending.sceneProgress).toBeNull();
    ending.end(run, execution);
    expect(ending.sceneProgress).toBe(0);

    playFrames(ending, run, execution, FRAMES_IN_THE_HOLD / 2);
    expect(ending.sceneProgress).toBeCloseTo(0.5, 10);

    playFrames(ending, run, execution, FRAMES_IN_THE_HOLD);
    expect(ending.sceneProgress).toBe(1);
  });

  it("a reset lowers the hold as well as the latch, so a pooled screen's next run starts clean", () => {
    // Screens are pooled: a hold left standing would open the next run's first
    // frame inside the last run's ending scene.
    const powers = faked();
    const ending = createRunEnding(powers);
    const { run, execution } = stood('victory');

    ending.end(run, execution);
    ending.advance(FRAME_MS);
    ending.reset();

    expect(ending.ended).toBe(false);
    expect(ending.sceneProgress).toBeNull();
  });
});
