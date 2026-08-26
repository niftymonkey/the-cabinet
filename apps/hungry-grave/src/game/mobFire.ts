// The fire mobs emit: the firing numbers a mob type owns, the shot record, and
// a shot's flight from the mob that fired it (ADR 0016, ADR 0014).

import { createPool, MOB_FIRE_CAP, takeSlot } from './caps';
import type { SimEvent } from './events';
import { FIELD_HEIGHT, FIELD_WIDTH } from './field';
import { normalize } from './math';
import type { Mob, MobType } from './mobs';
import type { Rect } from './overlap';
import type { RunState } from './run';

// How much of a wave carries fire at all.
type ArmedShare = 'none' | 'everyThird' | 'all';

/**
 * Every firing number a type owns. The rows sit on the mob table in mobs.ts and
 * are handed to this module by the mob that owns them, so nothing here fires
 * without a mob behind it.
 *
 * The numbers are data from the first commit and not shared module constants,
 * so the tuning dispatch differentiates a revenant's fire from a shambler's by
 * editing a row rather than by refactoring constants out of the table. The
 * first-pass values are identical across the two firing types on purpose.
 *
 * This supersedes the tracer plan's ruling that there is deliberately no
 * projectiles.ts because mob fire belongs to the mobs that emit it. What that
 * ruling was protecting still stands and is what the module's name says: fire
 * is never generic here, every row belongs to a mob type, and this module
 * imports only types from mobs.ts so the arrow runs one way, from the mob to
 * its fire. What it could not have known is that keeping the two in one file
 * also kept the storm's overlap pass there, which made the mob table import
 * three weapon lines and the corpse pool; splitting by concept produces neither
 * the generic projectile module the ruling feared nor those five arrows.
 */
interface FireRow {
  readonly armedShare: ArmedShare;
  // Ticks between shots.
  readonly interval: number;
  /**
   * How many ticks of per-mob offset the first shot may carry, drawn from the
   * mobFire stream, so a File of armed mobs does not fire as one volley.
   */
  readonly firstShotJitter: number;
  /**
   * How long the tell lights before every shot, not only the first. A revenant
   * fires about six times per pass, and a tell on shot one alone satisfies the
   * sentence and not the rule. At the arriving beat's own length the first
   * shot's lead falls exactly inside the beat, which is how ADR 0016's tell and ADR 0041's beat
   * compose.
   */
  readonly tellTicks: number;
  // Field units per tick. A reaction budget: a shot from mid-field reaches the starting mark in about two seconds.
  readonly shotSpeed: number;
  readonly shotHalfExtent: number;
}

// A type that never fires still declares the row, so nothing branches on a missing field.
const NEVER_FIRES: FireRow = {
  armedShare: 'none',
  interval: 0,
  firstShotJitter: 0,
  tellTicks: 0,
  shotSpeed: 0,
  shotHalfExtent: 0,
};

interface Shot {
  alive: boolean;
  id: number;
  emitter: MobType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  halfExtent: number;
}

const blankShot = (): Shot => {
  return {
    alive: false,
    id: 0,
    emitter: 'shambler',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    halfExtent: 0,
  };
};

const createShotPool = (): Shot[] => {
  return createPool(MOB_FIRE_CAP, blankShot);
};

const shotHitbox = (shot: Shot): Rect => {
  return {
    x: shot.x - shot.halfExtent,
    y: shot.y - shot.halfExtent,
    width: shot.halfExtent * 2,
    height: shot.halfExtent * 2,
  };
};

/**
 * The armed share of a wave is fixed and not rolled: the third, sixth and ninth
 * mobs of a group carry fire. A die would make the armed ones a scatter, and
 * the point of the rule is that picking targets reads as a shape in the
 * formation rather than as noise the player cannot learn.
 *
 * The phase is pinned at two rather than zero deliberately. Arming index zero
 * would arm the first mob of every group, including a lone Drip, so the very
 * first mob in the game would shoot with no teaching beat at all.
 */
const isArmed = (share: ArmedShare, index: number): boolean => {
  if (share === 'none') return false;
  if (share === 'all') return true;
  return index % 3 === 2;
};

// A per-mob offset on the first shot, so a File of armed mobs does not fire as one volley.
const firstShotOffset = (state: RunState, fire: FireRow): number => {
  if (fire.firstShotJitter <= 0) return 0;
  return state.streams.mobFire.nextInt(fire.firstShotJitter);
};

/**
 * One shot, aimed at the grave's centre at the moment of firing. Nothing homes:
 * mob fire is large, slow and irregular, and it never tracks (ADR 0014).
 *
 * Mob fire does not carry the scroll. An aimed shot that then drifts downward
 * is not aimed, and the whole grammar ADR 0014 sets up depends on the player
 * reading mob fire as a line from a mob to where they were.
 */
const fireShot = (state: RunState, mob: Mob, fire: FireRow): SimEvent[] => {
  const shot = takeSlot(state.mobFire, state.nextEntityId);
  if (shot === null) return [];
  state.nextEntityId += 1;

  const aim = normalize(state.grave.x - mob.x, state.grave.y - mob.y);
  const direction = aim.length === 0 ? { x: 0, y: 1 } : aim;
  shot.emitter = mob.type;
  shot.x = mob.x;
  shot.y = mob.y;
  shot.vx = direction.x * fire.shotSpeed;
  shot.vy = direction.y * fire.shotSpeed;
  shot.halfExtent = fire.shotHalfExtent;
  return [{ type: 'mobFired', emitter: mob.type, x: mob.x, y: mob.y }];
};

// Every live shot, one tick of flight on.
const advanceShots = (state: RunState): void => {
  for (const shot of state.mobFire) {
    if (!shot.alive) continue;
    shot.x += shot.vx;
    shot.y += shot.vy;
  }
};

// A shot fully outside the field on any side is gone.
const cullShots = (state: RunState): void => {
  for (const shot of state.mobFire) {
    if (!shot.alive) continue;
    const outside =
      shot.x + shot.halfExtent < 0 ||
      shot.x - shot.halfExtent > FIELD_WIDTH ||
      shot.y + shot.halfExtent < 0 ||
      shot.y - shot.halfExtent > FIELD_HEIGHT;
    if (outside) shot.alive = false;
  }
};

export {
  createShotPool,
  shotHitbox,
  isArmed,
  firstShotOffset,
  fireShot,
  advanceShots,
  cullShots,
  NEVER_FIRES,
};
export type { ArmedShare, FireRow, Shot };
