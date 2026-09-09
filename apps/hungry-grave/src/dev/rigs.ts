// The rigs: one starting condition a run is played from, by name (#107).

import { MAX_LEVEL, WEAPON_LINES } from '../game/lines/roster';
import type { WeaponLine } from '../game/lines/roster';
import { birthrightLevels, uniformLevels } from '../game/run';
import { SIZE_START } from '../game/tuning';

/**
 * The starting conditions the harness plays from, and never a description of
 * the hand that steers: a figure names its rig beside its configuration, and
 * the two are separate facts about one run (CONTEXT.md Rig, ADR 0053).
 */
const RIG_NAMES = ['birthright', 'maxed'] as const;

type RigName = (typeof RIG_NAMES)[number];

/**
 * One rig: the size and the levels a run under it begins with.
 *
 * Both fields together are the rig, never either alone. #107 was raised
 * because two rigs differing only in starting size were reported under one
 * label, so a row that pinned levels and left size implicit would rebuild the
 * same defect.
 */
interface Rig {
  readonly name: RigName;
  readonly startingSize: number;
  readonly startingLevels: Readonly<Record<WeaponLine, number>>;
}

/**
 * The rows, keyed by name.
 *
 * Two, because two are what the power-curve ruling needs read: every reading
 * step 4 tunes on today comes from a run that starts at the birthright, where
 * the ruling is about the maxed end, and a rig is the one argument that moves
 * a batch from one end to the other. The hand is untouched by either row: a
 * rig changes what a run starts holding and nothing about how it is played.
 *
 * The ceiling rig and the ladder rig the record names have no row here because
 * nothing plays them through the harness; a row for either is a row the day
 * something does.
 */
const RIGS: Readonly<Record<RigName, Rig>> = {
  birthright: {
    name: 'birthright',
    startingSize: SIZE_START,
    startingLevels: birthrightLevels(),
  },
  maxed: {
    name: 'maxed',
    startingSize: SIZE_START,
    startingLevels: uniformLevels(MAX_LEVEL),
  },
};

// Whether a raw name is one the table holds, which is where a command line's argument is checked.
const isRigName = (raw: string): raw is RigName =>
  RIG_NAMES.some((name) => name === raw);

const sameLevels = (
  levels: Readonly<Record<WeaponLine, number>>,
  rig: Rig,
): boolean =>
  WEAPON_LINES.every((line) => levels[line] === rig.startingLevels[line]);

/**
 * Which rig a run began under, or null when no row holds that condition.
 *
 * Null rather than the nearest row, because a condition nobody named is
 * exactly what #107 asks a figure never to be banded under. A conditioned run
 * pinned to a row's own size and levels is that row: the rig is the starting
 * condition, and what steered the run is the policy beside it.
 */
const rigOf = (
  startingSize: number,
  levels: Readonly<Record<WeaponLine, number>>,
): RigName | null => {
  const named = RIG_NAMES.find(
    (name) =>
      RIGS[name].startingSize === startingSize &&
      sameLevels(levels, RIGS[name]),
  );
  return named ?? null;
};

export { isRigName, rigOf, RIGS, RIG_NAMES };
export type { Rig, RigName };
