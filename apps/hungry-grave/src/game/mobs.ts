/**
 * The mob type table, one behaviour rule per type, mob fire, and the
 * consequence of a mob being hit (tracer plan section 3). One file rather than
 * a folder, because a mob type is a stat row plus a small rule and the table
 * reads best as a table.
 *
 * Mob fire lives here too. The tracer plan deliberately has no projectiles.ts:
 * mob fire belongs to the mobs that emit it.
 *
 * Every magnitude here is a first pass owned by the tuning dispatch. What this
 * dispatch pins is the derivations, and the one number that is load-bearing
 * rather than a first pass is the shambler's half-width, because the Wall's row
 * count derives from it.
 */

import { createPool, MOB_CAP, MOB_FIRE_CAP, takeSlot } from "./caps";
import { TICK_HZ } from "./clock";
import { spawnCorpse } from "./corpses";
import type { SimEvent } from "./events";
import { FIELD_HEIGHT, FIELD_WIDTH } from "./field";
import type { Grave } from "./grave";
import { cos, normalize, sin } from "./math";
import type { Rect } from "./overlap";
import type { RunState } from "./run";
import type { SpawnOrder } from "./stage/templates";
import { MAX_ENTRY_DEPTH } from "./stage/templates";
import { BASE_SPEED, SCROLL_SPEED, TRASH_CORPSE_PAYOUT } from "./tuning";

export type MobType = "shambler" | "revenant" | "ghoul";

/** Which corpse a kill leaves. The tier is a payout read and never a size (ADR 0014). */
export type CorpseTier = "trash" | "rich";

/** Whatever can hit a mob. Dispatch 4 only ever passes contact, from the test rig. */
export type DamageSource = "storm" | "bell" | "headstone" | "contact";

/** How much of a wave carries fire at all. */
export type ArmedShare = "none" | "everyThird" | "all";

/** How a type moves once its arriving beat has passed. */
export type MobMotion = "falls" | "chases";

/**
 * Every firing number a type owns. They are data from the first commit and not
 * shared module constants, so the tuning dispatch differentiates a revenant's
 * fire from a shambler's by editing a row rather than by refactoring constants
 * out of this module. The first-pass values are identical across the two firing
 * types on purpose.
 */
export interface FireRow {
  readonly armedShare: ArmedShare;
  /** Ticks between shots. */
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
   * shot's lead falls exactly inside the beat, which is how ADR 0016's two
   * rules compose.
   */
  readonly tellTicks: number;
  /** Field units per tick. A reaction budget: a shot from mid-field reaches the starting mark in about two seconds. */
  readonly shotSpeed: number;
  readonly shotHalfExtent: number;
}

export interface MobRow {
  readonly halfWidth: number;
  readonly halfHeight: number;
  readonly hp: number;
  readonly corpsePayout: number;
  readonly corpseTier: CorpseTier;
  /** The type's own speed in field units per tick. The scroll is added separately. */
  readonly speed: number;
  readonly motion: MobMotion;
  readonly fire: FireRow;
}

/** A type that never fires still declares the row, so nothing branches on a missing field. */
const NEVER_FIRES: FireRow = {
  armedShare: "none",
  interval: 0,
  firstShotJitter: 0,
  tellTicks: 0,
  shotSpeed: 0,
  shotHalfExtent: 0,
};

export const MOB_TYPES = {
  shambler: {
    // The one load-bearing size here: an edge-to-edge curtain at 22 units wide
    // needs 22 mobs to fill the field's 540, leaving gaps of 2.5 units, and the
    // size floor makes the grave 18 units wide, so the curtain has no gap the
    // grave can slip through at any size.
    halfWidth: 11,
    halfHeight: 11,
    hp: 3,
    corpsePayout: TRASH_CORPSE_PAYOUT,
    corpseTier: "trash",
    speed: 0.5 * SCROLL_SPEED,
    motion: "falls",
    fire: {
      armedShare: "everyThird",
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
    corpseTier: "rich",
    speed: 0.35 * SCROLL_SPEED,
    motion: "falls",
    fire: {
      armedShare: "all",
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
    corpseTier: "trash",
    // A real fraction of the grave's own speed, because ADR 0016 bounds this
    // type by its turn rate rather than by a speed cap, and that is only a
    // meaningful safety valve if the speed is meaningful.
    speed: 0.35 * BASE_SPEED,
    motion: "chases",
    fire: NEVER_FIRES,
  },
} as const satisfies Record<MobType, MobRow>;

export const MOB_TYPE_NAMES: readonly MobType[] = [
  "shambler",
  "revenant",
  "ghoul",
];

/**
 * How long a mob holds the template's arriving motion once it is on screen
 * (ADR 0016). Three quarters of a second, and the derivation is a reading-time
 * one rather than a taste one: recognizing a spatial arrangement takes near 400
 * to 450 milliseconds, so half a second would be one recognition time with
 * nothing left over to act on, and 45 ticks leaves roughly 300 milliseconds
 * after recognition. ADR 0016 makes this same window the revenant's warning
 * window, so it carries fairness weight and not only readability.
 */
export const ARRIVE_TICKS = 45;

/**
 * The deepest a template may spawn above the top edge. It is the placement
 * library's own bound, declared there and re-exported here because everything
 * downstream reads it from the mob table: one declaration, nothing to keep in
 * sync. It is derived from the deepest authored row rather than picked, and a
 * file of six 26-unit bodies nose to tail is 156 units of depth.
 */
export const SPAWN_MARGIN = MAX_ENTRY_DEPTH;

/**
 * The ghoul's floor on its own descent, matching the revenant's. Without it a
 * ghoul can hold the grave's height and descend at the scroll alone, which is
 * twenty seconds to cross the field, and in a build where nothing can kill it
 * that is a mob that never leaves. The floor makes climbing and station-holding
 * impossible whatever the ghoul's speed is, unconditionally.
 */
export const GHOUL_DESCENT_FLOOR = 0.35 * SCROLL_SPEED;

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
// off raw approximated operations and the turn is the first thing in the game
// to need trigonometry at all.
const TURN_COS = cos(GHOUL_TURN_RADIANS);
const TURN_SIN = sin(GHOUL_TURN_RADIANS);

export interface Mob {
  alive: boolean;
  id: number;
  type: MobType;
  x: number;
  y: number;
  /** The mob's own motion in field units per tick. The scroll is added separately, in step. */
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
  /** Ticks until this mob's next shot, counted on the same trigger as the beat. */
  fireIn: number;
  armed: boolean;
}

export interface Shot {
  alive: boolean;
  id: number;
  emitter: MobType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  halfExtent: number;
}

function blankMob(): Mob {
  return {
    alive: false,
    id: 0,
    type: "shambler",
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    hp: 0,
    beat: 0,
    fireIn: 0,
    armed: false,
  };
}

function blankShot(): Shot {
  return {
    alive: false,
    id: 0,
    emitter: "shambler",
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    halfExtent: 0,
  };
}

export function createMobPool(): Mob[] {
  return createPool(MOB_CAP, blankMob);
}

export function createShotPool(): Shot[] {
  return createPool(MOB_FIRE_CAP, blankShot);
}

export function mobHitbox(mob: Mob): Rect {
  const row = MOB_TYPES[mob.type];
  return {
    x: mob.x - row.halfWidth,
    y: mob.y - row.halfHeight,
    width: row.halfWidth * 2,
    height: row.halfHeight * 2,
  };
}

export function shotHitbox(shot: Shot): Rect {
  return {
    x: shot.x - shot.halfExtent,
    y: shot.y - shot.halfExtent,
    width: shot.halfExtent * 2,
    height: shot.halfExtent * 2,
  };
}

/** Whether the mob's top edge is inside the field, which is what starts its beat and its fire clock. */
export function hasEntered(mob: Mob): boolean {
  return mob.y - MOB_TYPES[mob.type].halfHeight >= 0;
}

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
function isArmed(share: ArmedShare, index: number): boolean {
  if (share === "none") return false;
  if (share === "all") return true;
  return index % 3 === 2;
}

/** The tell the renderer draws, and the only warning a shot gets. */
export function mobTellLit(mob: Mob): boolean {
  if (!mob.armed || !hasEntered(mob)) return false;
  return mob.fireIn <= MOB_TYPES[mob.type].fire.tellTicks;
}

/** Puts one mob on the field in the placement the template asked for, or refuses at the cap. */
export function spawnMob(
  state: RunState,
  type: MobType,
  order: SpawnOrder,
): Mob | null {
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
  mob.fireIn = mob.armed ? ARRIVE_TICKS + firstShotOffset(state, row) : 0;
  return mob;
}

/** A per-mob offset on the first shot, so a File of armed mobs does not fire as one volley. */
function firstShotOffset(state: RunState, row: MobRow): number {
  if (row.fire.firstShotJitter <= 0) return 0;
  return state.streams.mobFire.nextInt(row.fire.firstShotJitter);
}

/** A unit heading rotated toward a unit target by at most one turn step. */
function rotateToward(
  heading: { x: number; y: number },
  target: { x: number; y: number },
): { x: number; y: number } {
  const dot = heading.x * target.x + heading.y * target.y;
  if (dot >= TURN_COS) return target;
  const cross = heading.x * target.y - heading.y * target.x;
  const sign = cross >= 0 ? 1 : -1;
  return {
    x: heading.x * TURN_COS - heading.y * sign * TURN_SIN,
    y: heading.x * sign * TURN_SIN + heading.y * TURN_COS,
  };
}

/**
 * The ghoul's own rule: rotate its heading toward the grave by at most a fixed
 * step, scale to its speed, then floor the descent. Vector rotation and not
 * angle math, because a normalized direction uses only exactly-specified
 * operations (ADR 0015).
 *
 * The floored velocity is written back rather than applied at move time, so the
 * next tick's rotation turns the bent vector.
 */
function chase(mob: Mob, grave: Grave): void {
  const row = MOB_TYPES[mob.type];
  const heading = normalize(mob.vx, mob.vy);
  const target = normalize(grave.x - mob.x, grave.y - mob.y);
  const turned =
    heading.length === 0 || target.length === 0
      ? { x: 0, y: 1 }
      : rotateToward(heading, target);
  mob.vx = turned.x * row.speed;
  mob.vy = Math.max(turned.y * row.speed, GHOUL_DESCENT_FLOOR);
}

/** A falling type's own rule: straight down at its own speed, whatever direction it arrived on. */
function fall(mob: Mob): void {
  mob.vx = 0;
  mob.vy = MOB_TYPES[mob.type].speed;
}

/** One mob's motion for this tick: the arriving beat first, then its own rule. */
function moveMob(mob: Mob, grave: Grave): void {
  if (hasEntered(mob)) {
    if (mob.beat > 0) {
      mob.beat -= 1;
    } else if (MOB_TYPES[mob.type].motion === "chases") {
      chase(mob, grave);
    } else {
      fall(mob);
    }
  }
  mob.x += mob.vx;
  mob.y += mob.vy;
}

/**
 * One shot, aimed at the grave's centre at the moment of firing. Nothing homes:
 * mob fire is large, slow and irregular, and it never tracks (ADR 0014).
 *
 * Mob fire does not carry the scroll. An aimed shot that then drifts downward
 * is not aimed, and the whole grammar ADR 0014 sets up depends on the player
 * reading mob fire as a line from a mob to where they were.
 */
function fireShot(state: RunState, mob: Mob): SimEvent[] {
  const shot = takeSlot(state.mobFire, state.nextEntityId);
  if (shot === null) return [];
  state.nextEntityId += 1;

  const row = MOB_TYPES[mob.type];
  const aim = normalize(state.grave.x - mob.x, state.grave.y - mob.y);
  const direction = aim.length === 0 ? { x: 0, y: 1 } : aim;
  shot.emitter = mob.type;
  shot.x = mob.x;
  shot.y = mob.y;
  shot.vx = direction.x * row.fire.shotSpeed;
  shot.vy = direction.y * row.fire.shotSpeed;
  shot.halfExtent = row.fire.shotHalfExtent;
  return [{ type: "mobFired", emitter: mob.type, x: mob.x, y: mob.y }];
}

/** One mob's fire clock. It runs on the same trigger as the beat and is never delayed by it. */
function tickFire(state: RunState, mob: Mob): SimEvent[] {
  if (!mob.armed || !hasEntered(mob)) return [];
  mob.fireIn -= 1;
  if (mob.fireIn > 0) return [];
  mob.fireIn += MOB_TYPES[mob.type].fire.interval;
  return fireShot(state, mob);
}

/**
 * Motion and firing for every live mob, then motion for every live shot, in the
 * order the tick documents. Pools are walked in slot order, so the same seed
 * produces the same events in the same order.
 *
 * A shot spawned this tick does not also move this tick, which is what puts it
 * at its emitter for one tick and makes the shot read as coming from the mob.
 */
export function advanceMobs(state: RunState): SimEvent[] {
  const events: SimEvent[] = [];
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    moveMob(mob, state.grave);
  }
  for (const shot of state.mobFire) {
    if (!shot.alive) continue;
    shot.x += shot.vx;
    shot.y += shot.vy;
  }
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    events.push(...tickFire(state, mob));
  }
  return events;
}

/**
 * The single entry point for a mob being hit, whatever hits it. The weapon
 * lines call it and change nothing here, which is the same shape hitGrave
 * already has on the other side.
 *
 * The source is carried from the first commit even though this dispatch only
 * ever passes one value. The bell's exception, that a boss takes its damage and
 * never its push while adds are pushed normally, has nowhere else to live, and
 * one parameter now is cheaper than amending four call sites and their tests
 * once dispatch 5 has built on this seam. It wears a leading underscore because
 * no rule branches on it yet, and it loses the underscore in the dispatch that
 * writes the first one.
 */
export function damageMob(
  state: RunState,
  mob: Mob,
  amount: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- the seam the JSDoc above describes; TypeScript takes the underscore and ESLint does not
  _source: DamageSource,
): SimEvent[] {
  if (!mob.alive) return [];
  mob.hp -= amount;
  if (mob.hp > 0) return [];
  mob.alive = false;
  const events: SimEvent[] = [
    { type: "mobKilled", mob: mob.type, x: mob.x, y: mob.y },
  ];
  events.push(...spawnCorpse(state, mob));
  return events;
}

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
export function cullMobs(state: RunState): void {
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    const row = MOB_TYPES[mob.type];
    const gone =
      mob.y - row.halfHeight > FIELD_HEIGHT ||
      mob.x < -SPAWN_MARGIN ||
      mob.x > FIELD_WIDTH + SPAWN_MARGIN;
    if (gone) mob.alive = false;
  }
}

/** A shot fully outside the field on any side is gone. */
export function cullShots(state: RunState): void {
  for (const shot of state.mobFire) {
    if (!shot.alive) continue;
    const outside =
      shot.x + shot.halfExtent < 0 ||
      shot.x - shot.halfExtent > FIELD_WIDTH ||
      shot.y + shot.halfExtent < 0 ||
      shot.y - shot.halfExtent > FIELD_HEIGHT;
    if (outside) shot.alive = false;
  }
}
