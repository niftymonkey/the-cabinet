// The rigs: one starting condition a run is played from, by name (#107).

import { MAX_LEVEL, WEAPON_LINES } from '../game/lines/roster';
import type { WeaponLine } from '../game/lines/roster';
import { birthrightLevels, uniformLevels } from '../game/run';
import type { StartingConditions } from '../game/run';
import { SIGNAL_RAN_LIVE } from '../game/signalLock';
import { SCORE_BLEED_CAP, SIZE_FLOOR, SIZE_START } from '../game/tuning';

/**
 * The starting conditions the harness plays from, and never a description of
 * the hand that steers: a figure names its rig beside its configuration, and
 * the two are separate facts about one run (CONTEXT.md Rig, ADR 0053).
 */
const RIG_NAMES = ['birthright', 'maxed', 'ladder'] as const;

type RigName = (typeof RIG_NAMES)[number];

/**
 * One rig: a name and the whole starting condition a run under it begins with
 * (ADR 0063).
 *
 * The condition is held whole rather than restated field by field, which is
 * what makes a half-applied rig inexpressible: #107 was raised because two rigs
 * differing only in starting size were reported under one label, so a row that
 * pinned levels and left size implicit would rebuild the same defect, and a row
 * that left the score implicit would rebuild it again. A row states every field
 * because the record is the resolved one, so nothing a row leaves out can
 * quietly become the sim's default of the day.
 */
interface Rig {
  readonly name: RigName;
  readonly conditions: StartingConditions;
}

/**
 * What the ladder row starts holding, as a multiple of the cap one floor hit
 * bleeds. An initial data row.
 *
 * Three rather than two, which is the least that leaves a remainder at all: at
 * twice the cap the score left standing after the first bleed is exactly the
 * cap again, and a walk's table then cannot be read apart from one where the
 * cap itself stayed. At three the remainder is plainly neither the cap nor
 * zero, which is what makes the bleed's own rule legible in the rows.
 *
 * What would move it: SCORE_BLEED_CAP's own value, which is re-read after
 * slice M7, and a walk that wanted more than one bleed in it, which needs the
 * grave to grow off the floor rather than a larger score.
 */
const LADDER_RIG_BLEEDS = 3;

/**
 * The rows, keyed by name.
 *
 * The first two are what the power-curve ruling needs read: every reading step
 * 4 tunes on today comes from a run that starts at the birthright, where the
 * ruling is about the maxed end, and a rig is the one argument that moves a
 * batch from one end to the other. The hand is untouched by any row: a rig
 * changes what a run starts holding and nothing about how it is played.
 *
 * The ladder row is the floor ladder's own starting condition, and it exists
 * because the harness could not stage that ladder at all: a run at the size
 * floor holding a score is what "go to the lowest level, then the level below"
 * means, and it was the one scenario nothing here could play (#99).
 *
 * The ceiling rig the record names still has no row, because nothing plays it
 * through the harness; a row for it is a row the day something does.
 *
 * Every row states the whole pool and a live signal rather than leaving them
 * out, because a rig is the resolved condition (ADR 0063): those two are what
 * the sim resolves them to today, and writing them down is what stops a later
 * tune of a default from moving what a rig means.
 */
const RIGS: Readonly<Record<RigName, Rig>> = {
  birthright: {
    name: 'birthright',
    conditions: {
      startingSize: SIZE_START,
      startingLevels: birthrightLevels(),
      roster: WEAPON_LINES,
      signalLock: SIGNAL_RAN_LIVE,
      startingScore: 0,
    },
  },
  maxed: {
    name: 'maxed',
    conditions: {
      startingSize: SIZE_START,
      startingLevels: uniformLevels(MAX_LEVEL),
      roster: WEAPON_LINES,
      signalLock: SIGNAL_RAN_LIVE,
      startingScore: 0,
    },
  },
  ladder: {
    name: 'ladder',
    conditions: {
      startingSize: SIZE_FLOOR,
      startingLevels: uniformLevels(MAX_LEVEL),
      roster: WEAPON_LINES,
      signalLock: SIGNAL_RAN_LIVE,
      startingScore: LADDER_RIG_BLEEDS * SCORE_BLEED_CAP,
    },
  },
};

// Whether a raw name is one the table holds, which is where a command line's argument is checked.
const isRigName = (raw: string): raw is RigName =>
  RIG_NAMES.some((name) => name === raw);

const sameLevels = (
  levels: Readonly<Record<WeaponLine, number>>,
  rig: Rig,
): boolean =>
  WEAPON_LINES.every(
    (line) => levels[line] === rig.conditions.startingLevels[line],
  );

/**
 * Which rig a run began under, or null when no row holds that condition.
 *
 * Null rather than the nearest row, because a condition nobody named is
 * exactly what #107 asks a figure never to be banded under. A conditioned run
 * pinned to a row's own size and levels is that row: the rig is the starting
 * condition, and what steered the run is the policy beside it.
 *
 * It takes the size and the levels and never the score, because it answers
 * which row a tape was recorded under and a tape header carries no score at
 * all: a banding rule reading a fact the header cannot hold would answer null
 * forever. That is also why the rows stay unique on the size and the levels
 * alone, since two rows differing only by score would be unbandable.
 */
const rigOf = (
  startingSize: number,
  levels: Readonly<Record<WeaponLine, number>>,
): RigName | null => {
  const named = RIG_NAMES.find(
    (name) =>
      RIGS[name].conditions.startingSize === startingSize &&
      sameLevels(levels, RIGS[name]),
  );
  return named ?? null;
};

export { isRigName, rigOf, RIGS, RIG_NAMES };
export type { Rig, RigName };
