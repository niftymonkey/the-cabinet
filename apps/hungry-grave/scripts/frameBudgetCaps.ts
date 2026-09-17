/**
 * The caps module the frame-budget config puts in src/game/caps's place, so a
 * synthetic field can stand at a size the shipped caps refuse.
 *
 * The shipped caps are derived from the stage's own waves, and round 0's table
 * names fields the derivation does not price, so an instrument that could only
 * stand what the shipped build holds could not measure the headroom it exists
 * to measure. Both figures moved when the derivation landed, which is the whole
 * reason this module reads them rather than naming them. The
 * caps stay identical on every device in the game itself; this is a bench, and
 * nothing here is in a player's build: only the frame-budget config aliases it
 * in, and only the frame-budget script imports it by name.
 *
 * Two caps move and the rest are the shipped ones, because a field is bodies
 * and food. They are derivations over the run's tuning record rather than
 * numbers, because that is what the shipped module exports now: the pools are
 * built inside createRun, which derives them at call time, so one process can
 * size its pools per row rather than per run of the tool. Nothing here is read
 * when the module loads, so the bench's own size is set by calling
 * sizePoolsFor before the run that is to stand at it.
 */

import type { FieldSize } from '../src/dev/syntheticField';
import type { Caps, PoolSlot } from '../src/game/caps';
import {
  corpseCap as shippedCorpseCap,
  createPool,
  liveCount,
  mobCap as shippedMobCap,
  mobFireCap,
  peakLive,
  revenantFirePeak,
  SKULL_CAP,
  takeSlot,
  TRANSIT_SECONDS,
  TREASURE_ALLOWANCE,
  WISP_CAP,
  WORST_BOSS_PATTERN,
} from '../src/game/caps';
import type { TuningRecord } from '../src/game/tuningRecord';

let benchMobs: number | null = null;
let benchCorpses: number | null = null;

/**
 * The pools every run made after this call is built with. It is world-changing
 * setup and it is named, so the entry story says out loud where the bench stops
 * being the shipped build.
 */
const sizePoolsFor = (size: FieldSize): void => {
  benchMobs = size.mobs;
  benchCorpses = size.corpses;
};

// The bench's own body count once a field is named, and the shipped one before.
const mobCap = (tuning: TuningRecord): number =>
  benchMobs ?? shippedMobCap(tuning);

// The bench's own food count once a field is named, and the shipped one before.
const corpseCap = (tuning: TuningRecord): number =>
  benchCorpses ?? shippedCorpseCap(tuning);

/**
 * The three caps a run is built at under this bench: the two the field names
 * and the shipped mob-fire cap, which no field row moves.
 */
const capsFor = (tuning: TuningRecord): Caps => ({
  mobs: mobCap(tuning),
  mobFire: mobFireCap(tuning),
  corpses: corpseCap(tuning),
});

export {
  createPool,
  takeSlot,
  liveCount,
  peakLive,
  TRANSIT_SECONDS,
  mobCap,
  revenantFirePeak,
  WORST_BOSS_PATTERN,
  mobFireCap,
  corpseCap,
  capsFor,
  TREASURE_ALLOWANCE,
  SKULL_CAP,
  WISP_CAP,
  sizePoolsFor,
};
export type { Caps, PoolSlot };
