// The header a run's tape opens with, assembled from the browser the run is
// being played in.

import { TICK_HZ } from '../game/clock';
import type { RunState } from '../game/run';
import { WITNESS_VERSION } from '../game/witness';
import type { TapeHeader, TapeInputDevice } from '../tape/tape';
import { RECORDER_CHECKPOINT_SPACING } from '../tape/recorder';
import { engine } from './getEngine';
import { userSettings } from './utils/userSettings';

/**
 * What the author field holds until something in the game names an author.
 *
 * The field is in the format now because header shape is one-way: a folder of
 * tapes from more than one pair of hands needs it to already be there, and
 * adding it later would invalidate every tape recorded before.
 */
const UNNAMED_AUTHOR = 'unknown';

// Reserved for a resolvable build identity, whose machinery is deliberately not built.
const UNRESOLVED_BUILD = '';

/**
 * The conditions a run was played under, read once before its first tick.
 *
 * The module is split in two on purpose, and this record is the seam. The
 * header itself is a pure function of a run and a record of conditions, so it
 * is testable without a browser; reading those conditions off the page and the
 * renderer is the part that needs one.
 */
interface RunConditions {
  readonly inputDevice: TapeInputDevice;
  readonly keyboardSpeed: number;
  readonly rendererBackend: string;
  readonly rendererResolution: number;
  readonly devicePixelRatio: number;
  // Wall clock at the top of the run, so a folder of tapes has an order.
  readonly recordedAt: number;
}

/**
 * The run's identity and its conditions, ready to be written before its first
 * tick.
 *
 * Every field is a constant for a run rather than a per-frame series, which is
 * the rule that decides what belongs in a header at all: header shape is
 * one-way once tapes exist, so a value that changes during a run would have to
 * be an observation instead.
 *
 * The starting size goes in as the number the run actually resolved to. Reading
 * it off the grave is the point: with no ?size= the run starts at the compiled
 * default, and recording the absence would let a later tune of that default
 * silently change what every old tape replays as. The starting levels go in on
 * exactly the same terms (ruled by Mark 2026-08-24): the resolved record for
 * every run, pinned or not, copied because the run levels up in place and the
 * header is a record of the start.
 */
const tapeHeaderFor = (
  run: RunState,
  conditions: RunConditions,
): TapeHeader => {
  return {
    seed: run.seed,
    startingSize: run.grave.size,
    startingLevels: { ...run.levels },
    tickRate: TICK_HZ,
    checkpointSpacing: RECORDER_CHECKPOINT_SPACING,
    witnessVersion: WITNESS_VERSION,
    commitHash: COMMIT_HASH,
    buildIdentity: UNRESOLVED_BUILD,
    author: UNNAMED_AUTHOR,
    inputDevice: conditions.inputDevice,
    keyboardSpeed: conditions.keyboardSpeed,
    rendererBackend: conditions.rendererBackend,
    rendererResolution: conditions.rendererResolution,
    devicePixelRatio: conditions.devicePixelRatio,
    recordedAt: conditions.recordedAt,
  };
};

/**
 * Which class of device steered the run.
 *
 * A coarse primary pointer is the phone, and the phone against the desktop is
 * the comparison the field exists to make. It is read once, before the first
 * tick, because the header is written before the first tick: a per-tick reading
 * of which input model won would be a different fact and would belong in a
 * different section.
 */
const inputDeviceHere = (): TapeInputDevice => {
  return window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'keyboard';
};

/**
 * The conditions this browser is playing under.
 *
 * The renderer's resolution and the device pixel ratio are both recorded
 * because neither substitutes for the other: the engine snaps its resolution to
 * at least two, so a phone reporting three is running a renderer at two.
 */
const runConditionsHere = (): RunConditions => {
  const renderer = engine().renderer;
  return {
    inputDevice: inputDeviceHere(),
    keyboardSpeed: userSettings.getKeyboardSpeed(),
    rendererBackend: renderer.name,
    rendererResolution: renderer.resolution,
    devicePixelRatio: window.devicePixelRatio,
    recordedAt: Date.now(),
  };
};

export { tapeHeaderFor, runConditionsHere, UNNAMED_AUTHOR };
export type { RunConditions };
