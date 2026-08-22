/**
 * The placement library (ADR 0016). A template says where a group arrives and
 * how it is arranged, and never which kind of mob is in it. Nothing in this
 * file may reach the mob table, and if it needs to, the design has gone wrong.
 *
 * Every template enters from the top edge and spawns above it, so nothing pops
 * into existence on screen, and no template places a mob more than
 * SPAWN_MARGIN above the edge: the arriving beat is counted from the top-edge
 * crossing, and an unbounded margin would let a template park a mob off screen
 * for an arbitrary time before its beat even starts.
 *
 * The velocity a template supplies is a unit direction. The speed belongs to
 * whatever is flying the shape, which is ADR 0016's own split of placement and
 * entry from motion. A template declaring an absolute velocity would make every
 * straight-down entry jump in speed the tick its beat ends, with nothing on
 * screen to explain it.
 */

import { FIELD_WIDTH } from "../field";
import { normalize } from "../math";
import type { Stream } from "../rng";

export type TemplateName = "drip" | "file" | "v" | "pincer" | "rain" | "wall";

export interface SpawnOrder {
  readonly x: number;
  readonly y: number;
  /** The arriving direction, a unit vector. Speed is the mob type's. */
  readonly vx: number;
  readonly vy: number;
  /**
   * The mob's position in its group, and on a mirrored template its position
   * in its own arm. The armed share reads it, and a Pincer's whole lesson is a
   * symmetry that asymmetric arming would read as noise.
   */
  readonly index: number;
}

/**
 * The library's unit of spacing, in field units: one body length, taken as the
 * largest body the mob pool holds. It is the library's own number rather than a
 * mob type's, because a template may not know who is in it.
 */
const BODY = 26;

/** How far above the top edge the leading mob of a group spawns. */
const ENTRY_DEPTH = BODY;

/**
 * The deepest any template may place a mob above the top edge. The arriving
 * beat is counted from the top-edge crossing, so an unbounded depth would let a
 * template park a mob off screen for an arbitrary time before its beat even
 * starts, and a deep group's trailing mobs would arrive long after its leaders.
 *
 * It is derived from the deepest authored row rather than picked: a file of six
 * 26-unit bodies nose to tail is 156 units of depth. A group deeper than the
 * budget closes up rather than reaching past it, so the bound holds for counts
 * no row has asked for yet. mobs.ts declares SPAWN_MARGIN as exactly this
 * number, because it is a property of the placement library and everything
 * downstream reads it from one place.
 */
export const MAX_ENTRY_DEPTH = 160;

/** How far a lane or a scatter stays clear of the field's sides. */
const EDGE_MARGIN = BODY / 2;

/** How far a V's arms step sideways per rank. At the authored count of 7 the chevron spans 392 units, so picking a side is a real choice. */
const V_SPREAD_X = 56;

/** How far a V's arms trail behind the apex per rank. */
const V_SPREAD_Y = BODY;

/** How deep below its shallowest a mob in a Rain may spawn, so the scatter arrives loose rather than as a line. */
const RAIN_SPREAD = 3 * BODY;

/** Straight down. Four of the six templates enter this way. */
const DOWN = { x: 0, y: 1 } as const;

/** A V's arms open as they descend, which is what makes the player pick a side. */
const V_OPENING = normalize(0.45, 1);

/** A Pincer comes in from the top corners at forty-five degrees, so it forces the player across the middle. */
const PINCER_ANGLE = normalize(1, 1);

/**
 * How far apart consecutive ranks sit along the entry direction, closed up if
 * the group would otherwise reach past the depth budget.
 */
function rankStep(ranks: number, wanted: number): number {
  if (ranks <= 1) return wanted;
  return Math.min(wanted, (MAX_ENTRY_DEPTH - ENTRY_DEPTH) / (ranks - 1));
}

/** Left arm or right arm, on the two mirrored templates. */
function armSign(index: number): number {
  return index % 2 === 0 ? -1 : 1;
}

/** A mirrored template's position within its own arm. */
function armRank(index: number): number {
  return Math.floor(index / 2);
}

/** Lone teaching kills: count mobs spread across the field's width at even spacing. */
function drip(count: number): SpawnOrder[] {
  return Array.from({ length: count }, (_unused, index) => ({
    x: (FIELD_WIDTH * (index + 0.5)) / count,
    y: -ENTRY_DEPTH,
    vx: DOWN.x,
    vy: DOWN.y,
    index,
  }));
}

/** A single-file lane down one x, each mob one body length behind the last. Its corpses land in a trail, which is what teaches the dive. */
function file(count: number, stream: Stream): SpawnOrder[] {
  const lane = EDGE_MARGIN + stream.next() * (FIELD_WIDTH - 2 * EDGE_MARGIN);
  const step = rankStep(count, BODY);
  return Array.from({ length: count }, (_unused, index) => ({
    x: lane,
    y: -ENTRY_DEPTH - index * step,
    vx: DOWN.x,
    vy: DOWN.y,
    index,
  }));
}

/** A spreading chevron, apex first, arms opening as they descend. */
function chevron(count: number): SpawnOrder[] {
  const step = rankStep(armRank(count - 1) + 1, V_SPREAD_Y);
  return Array.from({ length: count }, (_unused, order) => {
    const sign = armSign(order);
    const rank = armRank(order);
    return {
      x: FIELD_WIDTH / 2 + sign * (rank + 0.5) * V_SPREAD_X,
      y: -ENTRY_DEPTH - rank * step,
      vx: sign * V_OPENING.x,
      vy: V_OPENING.y,
      index: rank,
    };
  });
}

/** Two files angled in from opposite top corners. */
function pincer(count: number): SpawnOrder[] {
  const ranks = armRank(count - 1) + 1;
  const along = rankStep(ranks, BODY * PINCER_ANGLE.y) / PINCER_ANGLE.y;
  return Array.from({ length: count }, (_unused, order) => {
    // The left arm leads at the left corner and heads in, and its trailing
    // mobs sit back along its own direction, which is further out of the field.
    const sign = armSign(order);
    const rank = armRank(order);
    const lead = sign < 0 ? EDGE_MARGIN : FIELD_WIDTH - EDGE_MARGIN;
    return {
      x: lead + sign * rank * along * PINCER_ANGLE.x,
      y: -ENTRY_DEPTH - rank * along * PINCER_ANGLE.y,
      vx: -sign * PINCER_ANGLE.x,
      vy: PINCER_ANGLE.y,
      index: rank,
    };
  });
}

/**
 * A loose full-width scatter, the density filler. The looseness is in where and
 * when each mob arrives, never in how fast: a template supplies a direction and
 * the type supplies the speed, so a varied entry speed here would be the same
 * defect as an absolute velocity.
 */
function rain(count: number, stream: Stream): SpawnOrder[] {
  return Array.from({ length: count }, (_unused, index) => ({
    x: EDGE_MARGIN + stream.next() * (FIELD_WIDTH - 2 * EDGE_MARGIN),
    y: -ENTRY_DEPTH - stream.next() * RAIN_SPREAD,
    vx: DOWN.x,
    vy: DOWN.y,
    index,
  }));
}

/** An edge-to-edge curtain, evenly spaced across the full width, entering together. */
function wall(count: number): SpawnOrder[] {
  const spacing = FIELD_WIDTH / count;
  return Array.from({ length: count }, (_unused, index) => ({
    x: (index + 0.5) * spacing,
    y: -ENTRY_DEPTH,
    vx: DOWN.x,
    vy: DOWN.y,
    index,
  }));
}

/** Where a group of `count` arrives and how it is arranged. Count comes from the row and never from the template (ADR 0006). */
export function place(
  template: TemplateName,
  count: number,
  stream: Stream,
): SpawnOrder[] {
  if (count <= 0) return [];
  if (template === "drip") return drip(count);
  if (template === "file") return file(count, stream);
  if (template === "v") return chevron(count);
  if (template === "pincer") return pincer(count);
  if (template === "rain") return rain(count, stream);
  return wall(count);
}
