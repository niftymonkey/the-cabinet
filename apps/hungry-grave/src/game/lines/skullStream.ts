// The skull stream: skulls pouring straight up out of the grave's mouth in
// distinct parallel streams from mounts across its width, always on from
// level 1, surging after every swallow (ADR 0005, geometry per #79).

import { createPool, SKULL_CAP, takeSlot } from '../caps';
import { TICK_HZ } from '../clock';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import type { RunState } from '../run';
import { freshnessScale } from '../tuning';
import { MAX_LEVEL } from './roster';

interface Skull {
  alive: boolean;
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * How many columns each level fires, indexed by level. The level curve is
 * columns and nothing else.
 */
const COLUMNS_BY_LEVEL: readonly number[] = [0, 1, 2, 3, 4, 5];

/**
 * Ticks between volleys, fixed across levels because "the saturation workhorse"
 * is a statement about how much is on the field rather than about how fast one
 * lane repeats, and a curve that moved both would make the two
 * indistinguishable to anyone reading the code or the screen.
 *
 * The magnitude is derived rather than picked, and what it is derived against
 * is a kill time. At rung 1 a mow body takes one skull (ADR 0059), so a
 * shambler standing in a column dies to the first volley that reaches it and
 * the interval sets how often the stream offers that volley rather than how
 * long trash survives. The bodies above the mow are what the interval is
 * measured on: at rung 1 a ghoul is three skulls and a revenant eight, so a
 * revenant standing in one column falls in eight volleys, about 2.4 seconds,
 * and three tenths of a second between volleys is what keeps that inside the
 * "trash dies in a second or two" the drain-out is re-derived against.
 */
const STREAM_INTERVAL = 18;

/**
 * Field units per tick. Mob fire travels at 110 units per second and ADR 0014
 * makes it slow on purpose, so the player's storm reading as unmistakably not
 * mob fire is the same rule from the other side: the skull is roughly four times
 * faster. It crosses the field's height in about 1.8 seconds, which is a real
 * lead time and is why the stream is a saturation weapon rather than a sniper.
 */
const SKULL_SPEED = 420 / TICK_HZ;

/**
 * How many volleys one swallow buys at the shortened interval. Mark ruled the
 * shape on 2026-08-22: a fixed number of extra volleys, never a time window.
 *
 * Two is a provisional restoration of the swallow burst's old functional
 * magnitude under #76 pass A's touch counts. It is not a new tuning direction
 * and not a permanent design rule. The rescale is neutral for a rate-based
 * effect and a straight cut for a count-based one, and the surge is counted in
 * volleys: at the ceiling one extra volley is five skulls, which used to be
 * 1.67 shambler bodies and is exactly 1.0 after the rescale. Mark's reason for
 * restoring it: "The old one-volley surge lost a large share of its functional
 * value under the new touch counts, and because surge fires on every swallow it
 * directly weakens the snowball loop." Two volleys clear 2.0 bodies against the
 * old 1.67, so this over-restores slightly; no integer count lands on 1.67, and
 * holding the burst's old magnitude is what the number is for.
 */
const SURGE_VOLLEYS = 2;

/**
 * The shortest surge freshness can buy, in volleys (ADR 0058).
 *
 * The wisps' one-soul argument transferred: SURGE_VOLLEYS is 2 against a
 * freshness floor of 0.25, so an unfloored scale pays half a volley, and a
 * swallow that fires nothing reads as a bug.
 */
const SURGE_FLOOR_VOLLEYS = 1;

// The shortened interval a surged volley waits, in ticks: a third of the fixed
// one, which is the ratio it has always carried.
const SURGE_INTERVAL = 6;

/**
 * The longest a running surge is ever extended to by further swallows, in
 * ticks (ADR 0058 as amended). A swallow during a running surge lengthens it
 * toward this rather than starting a second beside it.
 *
 * The magnitude is derived rather than picked, and it is derived against one
 * surge's own length. SURGE_VOLLEYS 2 at SURGE_INTERVAL 6 is twelve ticks, so
 * a second holds exactly five of them: a chain of five swallows inside one
 * second lengthens the surge to its cap and every swallow after that buys
 * nothing. That is what a cadence floor is for. Past the cap the swallow rate
 * stops setting the stream's cadence, and once the swallows stop the stream is
 * back at its own interval within a second, so a surge still reads as an
 * answer to eating rather than as a mode the stream sits in.
 *
 * The other half of the derivation is that SKULL_CAP must not bind, which is
 * the thing a floor exists to keep true: a bound cap is a fault and never a
 * throttle (ADR 0056). A level-5 stream held at the surged interval stands
 * five columns every six ticks against a skull's 109-tick crossing, about 91
 * alive against a cap of 120, so the pool has room at any surge duration and
 * this cap is a legibility bound rather than a pool one.
 */
const SURGE_DURATION_CAP_TICKS = 60;

// The cap in the unit the surge is actually counted in.
const SURGE_VOLLEY_CAP = SURGE_DURATION_CAP_TICKS / SURGE_INTERVAL;

const SKULL_HALF_EXTENT = 4;

/**
 * What one skull takes off a mob at each rung, indexed by level. The lane adds
 * 25% of the rung-1 figure per rung, to a ceiling of twice it
 * (docs/research/weapon-growth-per-level-precedent.md section 4): this line's
 * own ladder is already the genre's shortest at x5.0 throughput, so a x2
 * damage lane over the top of it lands the stream at x10, inside the genre's
 * x8 to x16 band, where a x3 lane would make the workhorse the strongest
 * ladder in the game.
 *
 * One skull is a mow body at every rung (ADR 0059), so what the lane buys is
 * the bodies above the mow: at rung 1 a ghoul is three skulls and a revenant
 * eight, and at rung 5 they are two and four.
 *
 * Level 0 is a line a run does not hold, so it takes nothing off anything.
 */
const SKULL_DAMAGE_BY_LEVEL: readonly number[] = [0, 8, 10, 12, 14, 16];

/**
 * What one skull takes off a mob at this rung, clamped at the last rung the
 * table authors rather than reading past it, which is the refusal bell.ts's
 * rowFor already makes for the cone rows. A level below zero is not a rung and
 * fails loudly.
 */
const skullDamage = (level: number): number => {
  const damage = SKULL_DAMAGE_BY_LEVEL[Math.min(level, MAX_LEVEL)];
  if (damage === undefined) {
    throw new Error(`no skull damage at level ${level}`);
  }
  return damage;
};

const blankSkull = (): Skull => {
  return { alive: false, id: 0, x: 0, y: 0, vx: 0, vy: 0 };
};

const createSkullPool = (): Skull[] => {
  return createPool(SKULL_CAP, blankSkull);
};

/**
 * The fraction of the grave's size between adjacent mounts, so the storm's
 * footprint breathes with growth. PROVISIONAL; the playtest judges the value,
 * this comment owns the reasoning.
 *
 * The mouth's full width equals the size scalar (graveWidth at GRAVE_ASPECT 2),
 * so the mouth's edge is half the size from the centre. At five columns the
 * outer pair stands two steps out, 0.4 of the size, spanning 80% of the mouth
 * with a tenth of the size spare each side: the storm still pours out of the
 * hole rather than reading as hardpoints, and the outer pair never leaves the
 * mouth. The tests hold the plan's looser bound, offset at most the grave's
 * size.
 *
 * The standing-lane consequence the spec carries knowingly, in numbers: at a
 * typical mid-run size of 45 (start 27, ceiling 67.5), adjacent streams stand
 * 0.2 x 45 = 9 units apart centre to centre, and a skull is 8 wide, so the
 * clear lane between adjacent streams is 1 unit. The widest mob, the revenant
 * at half-width 13, needs 13 + 4 = 17 units clear of each neighbouring stream
 * centre, a 34-unit gap, to stand between streams untouched, and no reachable
 * size grants that (the ceiling grave's gap is 13.5). The standing room this
 * geometry concedes is at the storm's flanks: parallel streams hold one width
 * at every range, so everything beyond the outermost stream is never under
 * the storm.
 */
const MOUNT_STEP_FRACTION = 0.2;

/**
 * How far from the grave's x one mount of a row of this many stands, in field
 * units, at this grave size. The mounts straddle the centre, so an even count
 * has none at the centre and an odd count has exactly one.
 */
const mountOffset = (column: number, columns: number, size: number): number => {
  return (column - (columns - 1) / 2) * MOUNT_STEP_FRACTION * size;
};

/**
 * The mount held inside the field with the skull's own half-extent as margin,
 * so a wall-hugging grave's outer columns clamp inward and survive the cull
 * instead of dying on their first tick.
 */
const mountIntoField = (x: number): number => {
  return Math.min(
    Math.max(x, SKULL_HALF_EXTENT),
    FIELD_WIDTH - SKULL_HALF_EXTENT,
  );
};

/**
 * A skull put on the field at its mount across the mouth, flying one column of
 * the storm.
 *
 * The heading is built once here and never touched again, which is what makes
 * "rigid" and "never homes" the same requirement. Straight up is assigned
 * rather than computed, so the heading is exact and owes nothing to trig
 * rounding.
 */
const launchSkull = (
  state: RunState,
  column: number,
  columns: number,
): void => {
  const skull = takeSlot(state.skulls, state.nextEntityId);
  if (skull === null) return;
  state.nextEntityId += 1;

  skull.x = mountIntoField(
    state.grave.x + mountOffset(column, columns, state.grave.size),
  );
  skull.y = state.grave.y - state.grave.size;
  skull.vx = 0;
  skull.vy = -SKULL_SPEED;
};

// Every column of one volley, in column order so the same level always fires the same sequence.
const fireVolley = (state: RunState): void => {
  const columns = COLUMNS_BY_LEVEL[state.levels.skullStream];
  if (columns === undefined) {
    throw new Error(`no column count at level ${state.levels.skullStream}`);
  }
  for (let column = 0; column < columns; column++) {
    launchSkull(state, column, columns);
  }
};

/**
 * How long until the volley after this one, and the surge spent in the asking.
 * A surged volley is one scheduled at the shortened interval, so the count is
 * discharged here rather than at the moment that volley leaves.
 */
const nextInterval = (state: RunState): number => {
  if (state.lines.surgeVolleys <= 0) return STREAM_INTERVAL;
  state.lines.surgeVolleys -= 1;
  return SURGE_INTERVAL;
};

// A skull fully outside the field on any side is gone.
const cullSkulls = (state: RunState): void => {
  for (const skull of state.skulls) {
    if (!skull.alive) continue;
    const outside =
      skull.x + SKULL_HALF_EXTENT < 0 ||
      skull.x - SKULL_HALF_EXTENT > FIELD_WIDTH ||
      skull.y + SKULL_HALF_EXTENT < 0 ||
      skull.y - SKULL_HALF_EXTENT > FIELD_HEIGHT;
    if (outside) skull.alive = false;
  }
};

/**
 * One skull's flight for this tick, and the moment the next volley is due
 * (tracer plan section 3). Skulls move before the volley fires, so a skull
 * launched this tick does not also move this tick and the stream visibly pours
 * out of the mouth.
 */
const advanceStream = (state: RunState): SimEvent[] => {
  for (const skull of state.skulls) {
    if (!skull.alive) continue;
    skull.x += skull.vx;
    skull.y += skull.vy;
  }
  cullSkulls(state);
  state.lines.streamIn -= 1;
  if (state.lines.streamIn > 0) return [];
  fireVolley(state);
  state.lines.streamIn = nextInterval(state);
  return [];
};

/**
 * A swallow's surge, its length scaled by the corpse's freshness (ADR 0058 as
 * amended).
 *
 * It lengthens a running surge toward a cap rather than setting the count, and
 * the cap is why that is not a banked queue: extending is what overwriting
 * becomes once a swallow chain is the normal case rather than the corner
 * (ADR 0059's mow made it the normal case), and past the cap a further swallow
 * buys nothing at all.
 *
 * Freshness scales how many volleys the surge pays and never how wide the
 * stream fires, because the column count is what draws the line's five levels
 * and a rotten corpse must never make a level-five stream look like a
 * level-two one. A part volley is floored rather than rounded, so the scale
 * only ever pays what it has fully bought.
 */
const surgeStream = (state: RunState, freshness: number): void => {
  const paid = Math.max(
    SURGE_FLOOR_VOLLEYS,
    Math.floor(SURGE_VOLLEYS * freshnessScale(freshness)),
  );
  state.lines.surgeVolleys = Math.min(
    SURGE_VOLLEY_CAP,
    state.lines.surgeVolleys + paid,
  );
};

export {
  createSkullPool,
  advanceStream,
  surgeStream,
  skullDamage,
  COLUMNS_BY_LEVEL,
  STREAM_INTERVAL,
  SKULL_SPEED,
  SURGE_VOLLEYS,
  SURGE_FLOOR_VOLLEYS,
  SURGE_INTERVAL,
  SURGE_DURATION_CAP_TICKS,
  SKULL_HALF_EXTENT,
  SKULL_DAMAGE_BY_LEVEL,
};
export type { Skull };
