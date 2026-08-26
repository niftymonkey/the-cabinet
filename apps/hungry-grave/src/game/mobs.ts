// The mob type table, one behaviour rule per type, and the consequence of a mob
// being hit (tracer plan section 3).

import { createPool, MOB_CAP, takeSlot } from './caps';
import { TICK_HZ } from './clock';
import { spawnCorpse } from './corpses';
import type { SimEvent } from './events';
import { FIELD_HEIGHT, FIELD_WIDTH } from './field';
import type { Grave } from './grave';
import type { WeaponLine } from './lines/roster';
import { cos, normalize, rotateToward, sin } from './math';
import type { FireRow } from './mobFire';
import {
  advanceShots,
  fireShot,
  firstShotOffset,
  isArmed,
  NEVER_FIRES,
} from './mobFire';
import type { Rect } from './overlap';
import type { RunState } from './run';
import type { SpawnOrder } from './stage/templates';
import { MAX_ENTRY_DEPTH } from './stage/templates';
import { BASE_SPEED, SCROLL_SPEED, TRASH_CORPSE_PAYOUT } from './tuning';

type MobType = 'shambler' | 'revenant' | 'ghoul';

// Which corpse a kill leaves. The tier is a payout read and never a size (ADR 0014).
type CorpseTier = 'trash' | 'rich';

/**
 * Whatever can hit a mob, spelled as the roster's own line names so an
 * instrument grouping damage by line never meets a second spelling (#48).
 * Contact is absent because contact never damages a mob (ADR 0005).
 */
type DamageSource = WeaponLine | 'belch';

// How a type moves once its arriving beat has passed.
type MobMotion = 'falls' | 'chases';

interface MobRow {
  readonly halfWidth: number;
  readonly halfHeight: number;
  readonly hp: number;
  readonly corpsePayout: number;
  readonly corpseTier: CorpseTier;
  // The type's own speed in field units per tick. The scroll is added separately.
  readonly speed: number;
  readonly motion: MobMotion;
  readonly fire: FireRow;
}

/**
 * The type table. One file rather than a folder, because a mob type is a stat
 * row plus a small rule and the table reads best as a table.
 *
 * Every magnitude here is a first pass owned by the tuning dispatch. The
 * derivations are what is pinned, and the one number that is load-bearing
 * rather than a first pass is the shambler's half-width.
 */
const MOB_TYPES = {
  shambler: {
    // The one load-bearing size here: an edge-to-edge curtain at 22 units wide
    // needs 22 mobs to fill the field's 540, leaving gaps of 2.5 units, and the
    // size floor makes the grave 18 units wide, so the curtain has no gap the
    // grave can slip through at any size.
    halfWidth: 11,
    halfHeight: 11,
    hp: 3,
    corpsePayout: TRASH_CORPSE_PAYOUT,
    corpseTier: 'trash',
    speed: 0.5 * SCROLL_SPEED,
    motion: 'falls',
    fire: {
      armedShare: 'everyThird',
      interval: 180,
      firstShotJitter: 45,
      tellTicks: 45,
      shotSpeed: 110 / TICK_HZ,
      shotHalfExtent: 5,
    },
  },
  revenant: {
    halfWidth: 13,
    halfHeight: 13,
    hp: 5,
    corpsePayout: 2 * TRASH_CORPSE_PAYOUT,
    corpseTier: 'rich',
    speed: 0.35 * SCROLL_SPEED,
    motion: 'falls',
    fire: {
      armedShare: 'all',
      interval: 150,
      firstShotJitter: 0,
      tellTicks: 45,
      shotSpeed: 110 / TICK_HZ,
      shotHalfExtent: 5,
    },
  },
  ghoul: {
    // It is the body threat, it is small, and it closes, so it has to die fast
    // or positioning stops being the answer to it.
    halfWidth: 9,
    halfHeight: 9,
    hp: 2,
    corpsePayout: TRASH_CORPSE_PAYOUT,
    corpseTier: 'trash',
    // A real fraction of the grave's own speed, because ADR 0016 bounds this
    // type by its turn rate rather than by a speed cap, and that is only a
    // meaningful safety valve if the speed is meaningful.
    speed: 0.35 * BASE_SPEED,
    motion: 'chases',
    fire: NEVER_FIRES,
  },
} as const satisfies Record<MobType, MobRow>;

const MOB_TYPE_NAMES: readonly MobType[] = ['shambler', 'revenant', 'ghoul'];

/**
 * How long a mob holds the template's arriving motion once it is on screen
 * (ADR 0016). Three quarters of a second, and the derivation is a reading-time
 * one rather than a taste one: recognizing a spatial arrangement takes near 400
 * to 450 milliseconds, so half a second would be one recognition time with
 * nothing left over to act on, and 45 ticks leaves roughly 300 milliseconds
 * after recognition. ADR 0016 makes this same window the revenant's warning
 * window, so it carries fairness weight and not only readability.
 */
const ARRIVE_TICKS = 45;

/**
 * The deepest a template may spawn above the top edge. It is the placement
 * library's own bound, declared there and re-exported here because everything
 * downstream reads it from the mob table: one declaration, nothing to keep in
 * sync. It is derived from the deepest authored row rather than picked, and a
 * file of six 26-unit bodies nose to tail is 156 units of depth.
 */
const SPAWN_MARGIN = MAX_ENTRY_DEPTH;

/**
 * The ghoul's floor on its own descent, matching the revenant's. Without it a
 * ghoul can hold the grave's height and descend at the scroll alone, which is
 * twenty seconds to cross the field, and in a build where nothing can kill it
 * that is a mob that never leaves. The floor makes climbing and station-holding
 * impossible whatever the ghoul's speed is, unconditionally.
 */
const GHOUL_DESCENT_FLOOR = 0.35 * SCROLL_SPEED;

/**
 * How far a ghoul may re-aim per tick: a full reversal takes three seconds.
 * ADR 0016 bounds this type by turn rate, arc and recovery rather than by a
 * speed cap, precisely so contact is threatening without being unavoidable, and
 * the pair of relation tests in mobs.test.ts is what holds it there.
 */
const GHOUL_TURN_DEGREES_PER_SECOND = 60;

const GHOUL_TURN_RADIANS =
  (GHOUL_TURN_DEGREES_PER_SECOND * Math.PI) / 180 / TICK_HZ;

// Computed once at module load, through math.ts, because ADR 0015 keeps the sim
// off raw approximated operations. The pair stays here rather than travelling
// with math.ts's rotateToward, so each turning thing's rate reads beside the
// rule it belongs to.
const TURN_COS = cos(GHOUL_TURN_RADIANS);
const TURN_SIN = sin(GHOUL_TURN_RADIANS);

interface Mob {
  alive: boolean;
  id: number;
  type: MobType;
  x: number;
  y: number;
  // The mob's own motion in field units per tick. The scroll is added separately, in step.
  vx: number;
  vy: number;
  hp: number;
  /**
   * Ticks of the arriving beat left. It counts down only once the mob's top
   * edge is inside the field, never from its spawn: templates spawn above the
   * edge so nothing pops into existence, and a beat counted from spawn would
   * have expired before anyone saw the placement it exists to show.
   */
  beat: number;
  // Ticks until this mob's next shot, counted on the same trigger as the beat.
  fireIn: number;
  armed: boolean;
}

const blankMob = (): Mob => {
  return {
    alive: false,
    id: 0,
    type: 'shambler',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    hp: 0,
    beat: 0,
    fireIn: 0,
    armed: false,
  };
};

const createMobPool = (): Mob[] => {
  return createPool(MOB_CAP, blankMob);
};

const mobHitbox = (mob: Mob): Rect => {
  const row = MOB_TYPES[mob.type];
  return {
    x: mob.x - row.halfWidth,
    y: mob.y - row.halfHeight,
    width: row.halfWidth * 2,
    height: row.halfHeight * 2,
  };
};

// Whether the mob's top edge is inside the field, which is what starts its beat and its fire clock.
const hasEntered = (mob: Mob): boolean => {
  return mob.y - MOB_TYPES[mob.type].halfHeight >= 0;
};

// The tell the renderer draws, and the only warning a shot gets.
const mobTellLit = (mob: Mob): boolean => {
  if (!mob.armed || !hasEntered(mob)) return false;
  return mob.fireIn <= MOB_TYPES[mob.type].fire.tellTicks;
};

// Puts one mob on the field in the placement the template asked for, or refuses at the cap.
const spawnMob = (
  state: RunState,
  type: MobType,
  order: SpawnOrder,
): Mob | null => {
  const mob = takeSlot(state.mobs, state.nextEntityId);
  if (mob === null) return null;
  state.nextEntityId += 1;

  const row = MOB_TYPES[type];
  mob.type = type;
  mob.x = order.x;
  mob.y = order.y;
  mob.vx = order.vx * row.speed;
  mob.vy = order.vy * row.speed;
  mob.hp = row.hp;
  mob.beat = ARRIVE_TICKS;
  mob.armed = isArmed(row.fire.armedShare, order.index);
  mob.fireIn = mob.armed ? ARRIVE_TICKS + firstShotOffset(state, row.fire) : 0;
  return mob;
};

/**
 * The ghoul's own rule: rotate its heading toward the grave by at most a fixed
 * step, scale to its speed, then floor the descent. Vector rotation and not
 * angle math, because a normalized direction uses only exactly-specified
 * operations (ADR 0015).
 *
 * The floored velocity is written back rather than applied at move time, so the
 * next tick's rotation turns the bent vector.
 */
const chase = (mob: Mob, grave: Grave): void => {
  const row = MOB_TYPES[mob.type];
  const heading = normalize(mob.vx, mob.vy);
  const target = normalize(grave.x - mob.x, grave.y - mob.y);
  const turned =
    heading.length === 0 || target.length === 0
      ? { x: 0, y: 1 }
      : rotateToward(heading, target, TURN_COS, TURN_SIN);
  mob.vx = turned.x * row.speed;
  mob.vy = Math.max(turned.y * row.speed, GHOUL_DESCENT_FLOOR);
};

// A falling type's own rule: straight down at its own speed, whatever direction it arrived on.
const fall = (mob: Mob): void => {
  mob.vx = 0;
  mob.vy = MOB_TYPES[mob.type].speed;
};

// One mob's motion for this tick: the arriving beat first, then its own rule.
const moveMob = (mob: Mob, grave: Grave): void => {
  if (hasEntered(mob)) {
    if (mob.beat > 0) {
      mob.beat -= 1;
    } else if (MOB_TYPES[mob.type].motion === 'chases') {
      chase(mob, grave);
    } else {
      fall(mob);
    }
  }
  mob.x += mob.vx;
  mob.y += mob.vy;
};

/**
 * Whether a mob has already gone past the grave.
 *
 * Mobs are culled only past the bottom edge, so an armed mob that has overtaken
 * the player turns round and shoots upward at them. That follows from the
 * aiming rule rather than being a bug in it, and it reads as unfair.
 */
const hasPassed = (mob: Mob, grave: Grave): boolean => {
  return mob.y - MOB_TYPES[mob.type].halfHeight > grave.y + grave.size;
};

// One mob's fire clock. It runs on the same trigger as the beat and is never delayed by it.
const tickFire = (state: RunState, mob: Mob): SimEvent[] => {
  if (!mob.armed || !hasEntered(mob)) return [];
  if (hasPassed(mob, state.grave)) return [];
  mob.fireIn -= 1;
  if (mob.fireIn > 0) return [];
  const fire = MOB_TYPES[mob.type].fire;
  mob.fireIn += fire.interval;
  return fireShot(state, mob, fire);
};

/**
 * Motion and firing for every live mob, then motion for every live shot, in the
 * order the tick documents. Pools are walked in slot order, so the same seed
 * produces the same events in the same order.
 *
 * A shot spawned this tick does not also move this tick, which is what puts it
 * at its emitter for one tick and makes the shot read as coming from the mob.
 */
const advanceMobs = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    moveMob(mob, state.grave);
  }
  advanceShots(state);
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    events.push(...tickFire(state, mob));
  }
  return events;
};

/**
 * The single entry point for a mob being hit, whatever hits it. The weapon
 * lines call it and change nothing here, which is the same shape hitGrave
 * already has on the other side.
 *
 * Every hit reports mobDamaged, the fatal blow included and reported before its
 * mobKilled, so an instrument can credit the kill to the source that landed the
 * last point of damage (#48).
 *
 * The corpse's payout and tier are read off the table here and handed to
 * corpses.ts as values, the way events.ts's payloads carry values and never
 * entity references: the mob table is this module's, so the lookup is this
 * module's too.
 */
const damageMob = (
  state: RunState,
  mob: Mob,
  amount: number,
  source: DamageSource,
): SimEvent[] => {
  if (!mob.alive) return [];
  mob.hp -= amount;
  const events: SimEvent[] = [
    { type: 'mobDamaged', id: mob.id, amount, source },
  ];
  if (mob.hp > 0) return events;
  mob.alive = false;
  events.push({
    type: 'mobKilled',
    id: mob.id,
    mob: mob.type,
    x: mob.x,
    y: mob.y,
  });
  const row = MOB_TYPES[mob.type];
  events.push(...spawnCorpse(state, mob, row.corpsePayout, row.corpseTier));
  return events;
};

/**
 * A mob past the bottom edge is culled and costs the player nothing.
 *
 * A mob a spawn margin outside a side goes with it. A falling type can never
 * reach that, and a template never places one there, so the only thing this
 * catches is a ghoul whose beat ended pointing away from the grave: its turn
 * rate is slow by design, so it can carry a long way off screen before it comes
 * round. Off screen and unkillable is the same to the player as gone, and
 * leaving it live would let a mob wander arbitrarily far outside the field.
 */
const cullMobs = (state: RunState): void => {
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    const row = MOB_TYPES[mob.type];
    const gone =
      mob.y - row.halfHeight > FIELD_HEIGHT ||
      mob.x < -SPAWN_MARGIN ||
      mob.x > FIELD_WIDTH + SPAWN_MARGIN;
    if (gone) mob.alive = false;
  }
};

export {
  createMobPool,
  mobHitbox,
  hasEntered,
  mobTellLit,
  spawnMob,
  advanceMobs,
  damageMob,
  cullMobs,
  MOB_TYPES,
  MOB_TYPE_NAMES,
  ARRIVE_TICKS,
  SPAWN_MARGIN,
  GHOUL_DESCENT_FLOOR,
};
export type { MobType, CorpseTier, DamageSource, MobMotion, MobRow, Mob };
