// The mob type table, one behaviour rule per type, and the consequence of a mob
// being hit (tracer plan section 3).

import { createPool, takeSlot } from './caps';
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
import type { Impulse, ShoveCarrier } from './shove';
import {
  advanceShove,
  blankImpulse,
  clearImpulse,
  impulseSpent,
  shoveInFlight,
  takeShoveTravel,
} from './shove';
import type { SpawnOrder } from './stage/formations';
import { MAX_ENTRY_DEPTH } from './stage/formations';
import { BASE_SPEED, SCROLL_SPEED, TRASH_CORPSE_PAYOUT } from './tuning';

type MobType = 'shambler' | 'revenant' | 'ghoul' | 'cairn';

// Which corpse a kill leaves. The tier is a payout read and never a size (ADR 0014).
type CorpseTier = 'trash' | 'rich';

/**
 * Whatever can hit a mob, spelled as the roster's own line names so an
 * instrument grouping damage by line never meets a second spelling (#48).
 * Contact is absent because contact never damages a mob (ADR 0005).
 *
 * `belch` has had no producer since the press became a push and stopped taking
 * health off anything (ADR 0008 as amended, Mark's ruling 3 of 2026-09-15). It
 * stays a member so that the damage reading keeps the arm it has always had and
 * prints it at zero, rather than losing a key and making every batch before the
 * amendment unmatchable to every batch after it by name. A test guards the
 * absence itself (mobs.test.ts, "is never named by a belch").
 */
type DamageSource = WeaponLine | 'belch';

// How a type moves once its arriving beat has passed.
type MobMotion = 'falls' | 'chases';

/**
 * What put a body on the field, in the words the stage's own glossary uses.
 *
 * It is not a wave index. An index is section-local and goes stale the moment a
 * body outlives the section it arrived in, and two of the four spawners are not
 * waves at all. What a reading needs of it is the distinction a wave index
 * could not carry anyway: a standing wave's body is the section's authored
 * floor, and a shaped wave's is a beat on top of it (ADR 0060).
 *
 * `directed` has no producer until the director spends, which is the plan's
 * step 12, slice F. It is declared here because this is the commit that widens
 * the fold, and a member arriving later would be a folded value the fold's own
 * version never declared.
 */
type MobOrigin = 'wave' | 'standingWave' | 'setPiece' | 'boss' | 'directed';

interface MobRow {
  readonly halfWidth: number;
  readonly halfHeight: number;
  readonly hp: number;
  readonly corpsePayout: number;
  readonly corpseTier: CorpseTier;
  /**
   * How many mow bodies killing this one is worth (design record R4). What it
   * pays in score is this times the run's own kill unit, which is a row of the
   * tuning record (ADR 0064), so the table says the relation and the record
   * says the magnitude.
   */
  readonly scorePayoutInKills: number;
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
 *
 * Health is on its own scale, and it is the one thing here read against the
 * storm rather than against the field. ADR 0059 rules that a trash minute is a
 * mow and that density is bought with weak bodies, so the touch counts a mow
 * body costs each weapon line are one skull, one wisp, one toll at the grave,
 * two tolls at the bell's far edge and two Territory pulses. 8 is the smallest
 * health that makes the skull exact rather than rounded, so no damage row has
 * to become a float, and the other two rows are whole skull counts against it.
 *
 * What a kill pays into the score is the whole number of mow bodies the body's
 * health is worth, floored so no row pays more than it cost to take down: the
 * revenant's 64 is eight of the shambler's 8, and the ghoul's 20 is two with
 * the half discarded. The cairn is the one row that does not follow it, for the
 * same reason its corpse payout does not, and its own entry says so. Every
 * figure is a first pass stated in mow bodies, and what one of those pays is
 * score.trashKillScore on the run's own record (ADR 0064); the score a whole
 * run ends on is what the tuning step reads them against.
 */
const MOB_TYPES = {
  shambler: {
    // The mow body's own 22 units, which is the body width shove.ts states its
    // readability criterion against: a drawn step has to stay under one.
    halfWidth: 11,
    halfHeight: 11,
    hp: 8,
    corpsePayout: TRASH_CORPSE_PAYOUT,
    corpseTier: 'trash',
    scorePayoutInKills: 1,
    speed: 0.5 * SCROLL_SPEED,
    motion: 'falls',
    // The mow body carries no fire at all (ADR 0059). Ten times the shamblers
    // at an armed share is a bullet hell the storm cannot answer, so fire lives
    // on the revenant and the bosses, and the revenant is the armed minority
    // the player picks out of the mow.
    fire: NEVER_FIRES,
  },
  revenant: {
    halfWidth: 13,
    halfHeight: 13,
    hp: 64,
    corpsePayout: 2 * TRASH_CORPSE_PAYOUT,
    corpseTier: 'rich',
    scorePayoutInKills: 8,
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
    hp: 20,
    corpsePayout: TRASH_CORPSE_PAYOUT,
    corpseTier: 'trash',
    scorePayoutInKills: 2,
    // A real fraction of the grave's own speed, because ADR 0016 bounds this
    // type by its turn rate rather than by a speed cap, and that is only a
    // meaningful safety valve if the speed is meaningful.
    speed: 0.35 * BASE_SPEED,
    motion: 'chases',
    fire: NEVER_FIRES,
  },
  /**
   * The curtain's body: stone rather than a body, and a member of this pool
   * like the other three, so any wave may name it and nothing anywhere is
   * keyed on the set piece that happens to name it today (ADR 0016, ADR 0042
   * as amended 2026-09-15).
   *
   * Every figure below follows from it being stone. It is the widest thing on
   * the field and the only one wider than it is tall, so a row of them reads
   * as masonry rather than as more bodies in a line, which is the set piece's
   * own done line. 30 units divides the field's 540 exactly, so eighteen stand
   * edge to edge with no gap at all where twenty-two shamblers left 2.5 units
   * between neighbours; the Wall's wave carries that count and its derivation
   * (stage/waves.ts).
   */
  cairn: {
    halfWidth: 15,
    halfHeight: 11,
    /**
     * What the strongest storm the game can throw cannot take down before the
     * grave reaches it, measured rather than felt: a curtain thinned into a
     * lane on the way down costs nothing to cross, which is the shambler's
     * measured failure this row exists to answer
     * (`docs/push/step-4-progress.md` section 4 item 7).
     *
     * It is derived against the ceiling build and not against the rung a run
     * is born on, because a wall only a weak hand cannot pass is not a wall to
     * the hand most likely to be holding one when the curtain arrives. Vampire
     * Survivors keeps its own Flower Wall solid at every power the same way,
     * by reading the player's level into the wall's health
     * (https://vampire.survivors.wiki/w/Flower_Wall, the wiki's
     * Enemies with HP x Level). A static row derived against the ceiling
     * reaches that property with nothing keyed on the build.
     *
     * The measurement is the worst case the storm can make: every line at the
     * top of its ladder and the grave parked under one body for the whole
     * descent, which is 668 ticks from the curtain's spawn to the grave's own
     * row. That lands 2158.8 on the one body the column can reach and nothing
     * near it on any other, worst at the grave's floor size where the column is
     * narrowest, identical on every seed measured
     * (`local/round2/Lfix-storm-throughput.ts`). One touch more of the dearest
     * thing that touched it, 46.8, is 2205.6, so 2206 is the first whole point
     * that leaves that body standing at contact however the descent is spent,
     * and the belch stays the key rather than the stream (design record R5,
     * ADR 0042 as amended).
     *
     * It is data and the tuning step owns it, like every other magnitude here.
     */
    hp: 2206,
    /**
     * The mow body's payout and the mow body's tier, at four times its health.
     *
     * A rich payout would make grinding the curtain down the better play and
     * retire the belch as its key, which is the whole of what ADR 0042 puts at
     * the centre of this set piece. There is nothing in stone to eat, so what
     * a kill leaves pays what the ordinary body pays, and the tier rides with
     * the payout rather than with the size: the tier is a payout read and
     * never a size (ADR 0014), so a corpse that pays trash has to look it.
     */
    corpsePayout: TRASH_CORPSE_PAYOUT,
    corpseTier: 'trash',
    /**
     * The mow body's score too, and the one row that does not follow the table
     * header's health rule.
     *
     * At 2206 health the rule would make this the best-paying body in the game
     * by a wide margin, so grinding the curtain down would be the play that
     * scores, which is exactly what its corpse payout above is written to
     * refuse and what ADR 0042 puts at the centre of this set piece. There is
     * nothing in stone to kill for, so stone pays what the ordinary body pays.
     */
    scorePayoutInKills: 1,
    // The mow body's own descent, so the curtain arrives on the beat the
    // Crowd's table already spaces its next wave against (stage/waves.ts).
    speed: 0.5 * SCROLL_SPEED,
    motion: 'falls',
    // The cost of the crossing is the bodies themselves and never a shot they
    // put in the air (design record R5).
    fire: NEVER_FIRES,
  },
} as const satisfies Record<MobType, MobRow>;

const MOB_TYPE_NAMES: readonly MobType[] = [
  'shambler',
  'revenant',
  'ghoul',
  'cairn',
];

/**
 * How long a mob holds the formation's arriving motion once it is on screen
 * (ADR 0016). Three quarters of a second, and the derivation is a reading-time
 * one rather than a taste one: recognizing a spatial arrangement takes near 400
 * to 450 milliseconds, so half a second would be one recognition time with
 * nothing left over to act on, and 45 ticks leaves roughly 300 milliseconds
 * after recognition. ADR 0016 makes this same window the revenant's warning
 * window, so it carries fairness weight and not only readability.
 */
const ARRIVE_TICKS = 45;

/**
 * The deepest a formation may spawn above the top edge. It is the placement
 * library's own bound, declared there and re-exported here because everything
 * downstream reads it from the mob table: one declaration, nothing to keep in
 * sync. It is derived from the deepest authored wave rather than picked, and a
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
   * edge is inside the field, never from its spawn: formations spawn above the
   * edge so nothing pops into existence, and a beat counted from spawn would
   * have expired before anyone saw the placement it exists to show.
   */
  beat: number;
  // Ticks until this mob's next shot, counted on the same trigger as the beat.
  fireIn: number;
  armed: boolean;
  /**
   * Whether this mob carries the offer (ADR 0002). Authored on the stage wave
   * and written once at the spawn, never directed: the director adds mobs and
   * never carriers, which is what keeps density from buying a build.
   */
  carries: boolean;
  /**
   * Whether this mob appeared inside the field rather than crossing the top
   * edge. Written once at the spawn from the placement it was given, never
   * directed: only the spawn knows it, and a mob never crosses back out.
   *
   * Formations place every body above the edge, so the crossing is the warning.
   * A body placed below the edge has no crossing to give, which is what its
   * arriving beat stands in for at contact.
   */
  appearedInside: boolean;
  /**
   * What put this body on the field. Written once at the spawn and never
   * mutated afterwards, exactly as carries is, because where a body came from
   * cannot change once it is standing there.
   */
  from: MobOrigin;
  /**
   * The shove this body is carrying, if one landed on it. It sits beside the
   * body's own motion rather than inside it, because the shove replaces the
   * walk for its ticks and a body flying is still a body whose own rule is
   * waiting (shove.ts, design record R1).
   */
  impulse: Impulse;
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
    carries: false,
    appearedInside: false,
    from: 'wave',
    impulse: blankImpulse(),
  };
};

const createMobPool = (cap: number): Mob[] => {
  return createPool(cap, blankMob);
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

/**
 * Whether this mob's body can hurt the grave yet.
 *
 * A body that crossed the top edge announced itself by crossing, and it touches
 * from the tick it overlaps, exactly as it always has. A body that appeared
 * inside the field announced nothing, so it holds its arriving beat before it
 * can touch: the beat is the window the placement is read in (ADR 0041), and a
 * body poured into the middle of the field is otherwise a hit with nothing to
 * see coming. The beat still governs no firing at all.
 */
const canTouchGrave = (mob: Mob): boolean => {
  if (!mob.appearedInside) return true;
  return mob.beat === 0;
};

// Puts one mob on the field in the placement the formation asked for, or refuses at the cap.
const spawnMob = (
  state: RunState,
  type: MobType,
  order: SpawnOrder,
  carries: boolean,
  from: MobOrigin,
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
  mob.appearedInside = hasEntered(mob);
  mob.armed = isArmed(row.fire.armedShare, order.index);
  mob.carries = carries;
  mob.from = from;
  // The slot may be one a shoved body died in, and an inherited impulse would
  // carry a new body away on a push that never reached it.
  clearImpulse(mob.impulse);
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

/**
 * A falling type's own rule: straight down at its own speed, whatever direction
 * it arrived on. A body split by a side edge first walks inward at that same
 * speed, still descending, until it is fully on-field: formations place pincer
 * trailing ranks outside the field on purpose, and a bell toll can park a mob
 * there, so without the walk-in a settled faller can descend nearly invisible
 * at the edge (#76).
 */
const fall = (mob: Mob): void => {
  const row = MOB_TYPES[mob.type];
  if (mob.x < row.halfWidth) {
    mob.vx = row.speed;
  } else if (mob.x > FIELD_WIDTH - row.halfWidth) {
    mob.vx = -row.speed;
  } else {
    mob.vx = 0;
  }
  mob.vy = row.speed;
};

const clamp = (value: number, low: number, high: number): number => {
  return Math.min(Math.max(value, low), high);
};

/**
 * Puts a carrier at a place, held inside the box a body may stand in: the field
 * widened by the spawn margin, which is where a formation places one and the
 * furthest anything may carry one.
 *
 * It is the one bound and it lives here because this module owns SPAWN_MARGIN.
 * Everything that carries something somewhere it did not walk reads it: the
 * storm's push seam (stormTargets.ts) and the shove's own travel below, for a
 * body and for the corpse a kill hands the shove to alike. A push is never what
 * takes something out of the world, so the harness never fires on a legal move
 * by the player's own weapon.
 *
 * A corpse thrown down the field meets cullCorpses' edge at FIELD_HEIGHT before
 * it meets this bound, so it is lost as food the way any corpse is rather than
 * being parked at the margin.
 */
const moveInsideBounds = (
  carrier: ShoveCarrier,
  x: number,
  y: number,
): void => {
  carrier.x = clamp(x, -SPAWN_MARGIN, FIELD_WIDTH + SPAWN_MARGIN);
  carrier.y = clamp(y, -SPAWN_MARGIN, FIELD_HEIGHT + SPAWN_MARGIN);
};

/**
 * The one report an impulse makes: how far it really carried whatever was
 * carrying it, taken once, when the impulse is spent.
 *
 * It is also taken at an exit that ends a flight early and hands the impulse to
 * nothing, so nothing the storm actually pushed goes unreported: a body culled
 * off the field, a corpse swallowed mid-flight, a corpse lost off the bottom
 * edge. The kill exit is the one that hands over instead, because it is the one
 * that leaves a corpse to carry it on.
 *
 * The event names the body the push reached, off the impulse and never off the
 * carrier, because the carrier at the end may be a corpse the body left behind.
 *
 * A carrier that covered nothing reports nothing, whether the bound refused the
 * whole move or the body died on the tick the shove landed on it. A shove that
 * bought no distance would otherwise report a push that never happened.
 */
const reportShoveTravel = (carrier: ShoveCarrier): SimEvent[] => {
  const impulse = carrier.impulse;
  const source = impulse.source;
  const id = impulse.bodyId;
  const displacement = takeShoveTravel(impulse);
  if (displacement === 0) return [];
  if (source === null) {
    // Travel only accumulates under a shove and a shove only starts with a
    // source, so something that went somewhere under nothing is a bug in this
    // module rather than a reading to repair.
    throw new Error(`body ${id} travelled ${displacement} under no shove`);
  }
  return [{ type: 'mobShoved', id, displacement, source }];
};

/**
 * One tick of the shove a carrier is carrying: the travel it owes, applied and
 * measured, and the report once the impulse is spent.
 *
 * What is recorded is the distance really covered rather than the distance the
 * impulse asked for, because the bound above can refuse part of a step and a
 * repel reading may only sum what actually happened.
 */
const travelShove = (carrier: ShoveCarrier): SimEvent[] => {
  const impulse = carrier.impulse;
  if (impulseSpent(impulse)) return [];
  const step = advanceShove(impulse);
  if (step !== null) {
    const fromX = carrier.x;
    const fromY = carrier.y;
    moveInsideBounds(carrier, carrier.x + step.x, carrier.y + step.y);
    const movedX = carrier.x - fromX;
    const movedY = carrier.y - fromY;
    impulse.travelled += Math.sqrt(movedX * movedX + movedY * movedY);
  }
  if (!impulseSpent(impulse)) return [];
  return reportShoveTravel(carrier);
};

/**
 * One mob's motion for this tick: the arriving beat first, then its own rule.
 *
 * A body a shove is carrying stands its own walk down for those ticks and picks
 * it up on the tick after, which is what every source that specifies a
 * mechanism does (design record R1). Its arriving beat stands still with it:
 * the shove never writes the beat, because ADR 0041 gives the beat one meaning
 * and canTouchGrave reads it.
 */
const moveMob = (mob: Mob, grave: Grave): void => {
  if (shoveInFlight(mob.impulse)) return;
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
    // The walk reads the impulse and stands down for a body still flying, and
    // the shove travels after it, so the last tick of a shove is never also a
    // tick of walking. No line owns either of them by here: a shove that has
    // landed is the body's own motion.
    moveMob(mob, state.grave);
    events.push(...travelShove(mob));
  }
  // The second carrier, advanced from this same pass rather than from one of
  // its own, because one module owns the travel and the bound is written once
  // (design record R10). It also keeps one impulse to one advance a tick: the
  // deaths section runs later in the tick than this, so a corpse's own pass
  // placed down there would advance the shove a body handed over on the very
  // tick that body had already been advanced under it.
  //
  // A corpse this pass has already walked past cannot be handed one either,
  // because nothing inside this function kills a body.
  for (const corpse of state.corpses) {
    if (!corpse.alive) continue;
    events.push(...travelShove(corpse));
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
    carried: mob.carries,
  });
  const row = MOB_TYPES[mob.type];
  // A kill pays score from its own row, which is ADR 0002's surviving clause as
  // Mark amended it on 2026-09-16: a kill pays, and a kill is never the whole of
  // what does. It is paid here and not at the swallow, which is what keeps the
  // two currencies clean (design record R4). The boss and the set piece's source
  // die down their own paths and pay at their own sites, so what a kill pays is
  // this row and nothing else.
  const paid =
    row.scorePayoutInKills * state.conditions.tuning.score.trashKillScore;
  state.score += paid;
  events.push({
    type: 'scorePaid',
    input: 'kill',
    amount: paid,
    score: state.score,
  });
  // The corpse the kill leaves takes the shove over and finishes the flight, so
  // a body caught by a press travels the whole of what the press threw whether
  // or not the storm kills it on the way (design record R10). That makes the
  // kill the one exit that hands over: the report is the corpse's when the
  // impulse is finally spent.
  events.push(...spawnCorpse(state, mob, row.corpsePayout, row.corpseTier));
  // At the food cap no corpse spawns, so the impulse is still on the body and
  // there is nothing to carry it on. It reports what it was already carried
  // rather than leaving that distance out of the reading.
  events.push(...reportShoveTravel(mob));
  return events;
};

/**
 * A mob past the bottom edge is culled and costs the player nothing.
 *
 * A mob a spawn margin outside a side goes with it. A falling type can never
 * reach that, and a formation never places one there, so the only thing this
 * catches is a ghoul whose beat ended pointing away from the grave: its turn
 * rate is slow by design, so it can carry a long way off screen before it comes
 * round. Off screen and unkillable is the same to the player as gone, and
 * leaving it live would let a mob wander arbitrarily far outside the field.
 *
 * A carrier culled unkilled reports itself (ADR 0048). It is the whole of what
 * a missed carrier costs: nothing reaches after the player to make it up, so
 * the report exists for the instruments and never for the rules.
 */
const cullMobs = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    const row = MOB_TYPES[mob.type];
    const gone =
      mob.y - row.halfHeight > FIELD_HEIGHT ||
      mob.x < -SPAWN_MARGIN ||
      mob.x > FIELD_WIDTH + SPAWN_MARGIN;
    if (!gone) continue;
    mob.alive = false;
    // The same reason as the kill path: a body leaving the field mid-shove was
    // pushed as far as it got, and the reading sums what happened.
    events.push(...reportShoveTravel(mob));
    if (mob.carries) {
      events.push({
        type: 'carrierLost',
        mob: mob.type,
        x: mob.x,
        reason: 'leftField',
      });
    }
  }
  return events;
};

export {
  createMobPool,
  mobHitbox,
  hasEntered,
  canTouchGrave,
  mobTellLit,
  spawnMob,
  moveInsideBounds,
  reportShoveTravel,
  advanceMobs,
  damageMob,
  cullMobs,
  MOB_TYPES,
  MOB_TYPE_NAMES,
  ARRIVE_TICKS,
  SPAWN_MARGIN,
  GHOUL_DESCENT_FLOOR,
};
export type {
  MobType,
  CorpseTier,
  DamageSource,
  MobMotion,
  MobOrigin,
  MobRow,
  Mob,
};
