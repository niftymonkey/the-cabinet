// The grave's size, its motion, and the consequence of mob fire meeting it.
// Hides ADR 0003 entirely: no other module knows what a hit costs.

import type { SimEvent } from './events';
import { FIELD_HEIGHT, FIELD_WIDTH } from './field';
import type { MobType } from './mobs';
import type { WeaponLine } from './lines/roster';
import { BIRTHRIGHT, WEAPON_LINES } from './lines/roster';
import type { Rect } from './overlap';
import type { MoveCommand, RunState } from './run';
import {
  BASE_SPEED,
  GRAVE_ASPECT,
  HIT_SHRINK,
  INVULNERABLE_TICKS,
  SIZE_CEILING,
  SIZE_FLOOR,
  SIZE_START,
} from './tuning';

// Where a run's grave stands: centred across the field and low in it, the
// shmup's own starting mark, with the whole field ahead of it.
const START_X = FIELD_WIDTH / 2;
const START_Y = FIELD_HEIGHT * 0.8;

// Who hurt the player (#48): the mob type whose shot landed, or body contact.
type GraveHitSource = MobType | 'contact';

interface Grave {
  x: number;
  y: number;
  // The one scalar: the half-height. Width follows at a fixed aspect.
  size: number;
  // Ticks of invulnerability left. Zero means a hit lands.
  invulnerable: number;
}

/**
 * A point in field units. It lives here rather than in an input
 * model because src/game may not reach src/input: advance.ts's SteerSource and
 * src/input's two models all speak it, and one declaration is what keeps them
 * from drifting into two shapes that only happen to match.
 */
interface FieldPoint {
  readonly x: number;
  readonly y: number;
}

/**
 * Says that a run did not start at the size it asked for, because nothing
 * abnormal is silent. It fires at most once per run: one createGrave call is
 * what a run is born from, so no flag is needed to keep the sim from flooding.
 */
const reportUnhonouredSize = (asked: number, started: number): void => {
  console.warn(
    `a run asked to start at size ${asked}, outside ADR 0003's ${SIZE_FLOOR} to ${SIZE_CEILING}; it starts at ${started} instead, so a pinned ?size= or a replayed tape header does not get the grave it named`,
  );
};

/**
 * A grave at the starting mark, at the size the run asks for. The size is
 * clamped here rather than by the caller, because ADR 0003's floor and ceiling
 * are this module's to defend and ?size= arrives from src/app unclamped.
 */
const createGrave = (size: number = SIZE_START): Grave => {
  const started = clamp(size, SIZE_FLOOR, SIZE_CEILING);
  if (started !== size) reportUnhonouredSize(size, started);
  return {
    x: START_X,
    y: START_Y,
    size: started,
    invulnerable: 0,
  };
};

/**
 * Width from the one scalar, at the fixed aspect (ADR 0003). Size is the
 * half-height, so at GRAVE_ASPECT 2 the width equals the size scalar exactly:
 * that reads as a bug otherwise.
 */
const graveWidth = (size: number): number => {
  return (size * 2) / GRAVE_ASPECT;
};

/**
 * The grave's hitbox in field units, as a top-left corner and a size. It shrinks
 * with size, so a smaller grave is a harder target.
 */
const graveHitbox = (grave: Grave): Rect => {
  const width = graveWidth(grave.size);
  return {
    x: grave.x - width / 2,
    y: grave.y - grave.size,
    width,
    height: grave.size * 2,
  };
};

const clamp = (value: number, low: number, high: number): number => {
  return Math.min(Math.max(value, low), high);
};

// Holds the whole grave inside the field, accounting for its own width and height.
const containGrave = (grave: Grave): void => {
  const halfWidth = graveWidth(grave.size) / 2;
  grave.x = clamp(grave.x, halfWidth, FIELD_WIDTH - halfWidth);
  grave.y = clamp(grave.y, grave.size, FIELD_HEIGHT - grave.size);
};

/**
 * Applies a move command in base-speed units exactly as given, then holds the
 * grave inside the field.
 *
 * The command is applied as given and is neither normalized nor capped: ADR
 * 0011 puts both in each input model and deliberately leaves touch uncapped,
 * recording that capping touch to keyboard feel was the input lag felt on
 * device. A cap here would silently undo that for touch.
 */
const moveGrave = (grave: Grave, command: MoveCommand): void => {
  grave.x += command.x * BASE_SPEED;
  grave.y += command.y * BASE_SPEED;
  containGrave(grave);
};

/**
 * Grows the grave and returns whatever did not fit under the ceiling, as
 * overflow (ADR 0003). A wider grave can end up straddling an edge it was
 * pressed against, so the containment runs again here rather than waiting for
 * the next move command.
 */
const growGrave = (grave: Grave, amount: number): number => {
  const grown = grave.size + amount;
  grave.size = Math.min(grown, SIZE_CEILING);
  containGrave(grave);
  return Math.max(0, grown - SIZE_CEILING);
};

// One tick of the grave: invulnerability counts down.
const ageGrave = (grave: Grave): void => {
  if (grave.invulnerable > 0) grave.invulnerable -= 1;
};

// The whole score, gone. The score tier is exactly one rung, so it never partly bleeds.
const bleedScore = (state: RunState): SimEvent[] => {
  const amount = state.score;
  state.score = 0;
  return [{ type: 'scoreBled', amount }];
};

// The level a line can never be stripped below (glossary: birthright).
const levelFloor = (line: WeaponLine): number => {
  return BIRTHRIGHT.includes(line) ? 1 : 0;
};

const strippableLines = (state: RunState): WeaponLine[] => {
  return WEAPON_LINES.filter((line) => state.levels[line] > levelFloor(line));
};

/**
 * One level off every line that has one to give. Taking the whole loadout down
 * a step bounds the ladder at five rungs whatever the build, so a great run and
 * a poor one die at the same length, and each rung visibly thins the entire
 * storm in one beat.
 */
const stripLevels = (state: RunState): SimEvent[] => {
  const lines = strippableLines(state);
  for (const line of lines) state.levels[line] -= 1;
  return [{ type: 'weaponStripped', lines }];
};

const sealShut = (state: RunState): SimEvent[] => {
  state.ending = 'sealed';
  return [{ type: 'sealed', tick: state.tick }];
};

/**
 * ADR 0003's floor ladder, one rung per hit. The floor is hard, so a hit here
 * never shrinks: it bleeds all of the score, then takes one level off every
 * line, and only when nothing is left to bleed does it seal the grave shut.
 */
const runFloorLadder = (state: RunState): SimEvent[] => {
  if (state.score > 0) return bleedScore(state);
  if (strippableLines(state).length > 0) return stripLevels(state);
  return sealShut(state);
};

/**
 * Mob fire meeting the grave. Ignored while invulnerable. Runs ADR 0003's floor
 * ladder when the grave cannot shrink.
 *
 * This is the single entry point for every kind of damage: mob contact routes
 * through it rather than shrinking the grave itself, so the invulnerability
 * window, the ladder and the events stay in one place.
 *
 * Every landed hit starts invulnerability, a floor hit that does not shrink
 * included. The window is ADR 0014's dim refractory interval, and a floor hit
 * that skipped it would let the ladder run in consecutive ticks: sixty
 * full-field dims a second, in the exact state where the player is one hit from
 * sealed shut.
 */
const hitGrave = (state: RunState, source: GraveHitSource): SimEvent[] => {
  const grave = state.grave;
  if (grave.invulnerable > 0) return [];
  const atFloor = grave.size <= SIZE_FLOOR;
  if (!atFloor) grave.size = Math.max(SIZE_FLOOR, grave.size - HIT_SHRINK);
  grave.invulnerable = INVULNERABLE_TICKS;
  const hit: SimEvent = {
    type: 'graveHit',
    source,
    size: grave.size,
    invulnerable: grave.invulnerable,
  };
  return atFloor ? [hit, ...runFloorLadder(state)] : [hit];
};

export {
  createGrave,
  graveWidth,
  graveHitbox,
  moveGrave,
  growGrave,
  ageGrave,
  hitGrave,
};
export type { GraveHitSource, Grave, FieldPoint };
