// The deterministic headless player (ADR 0013).

import { FIELD_HEIGHT, FIELD_WIDTH } from '../game/field';
import type { SimEvent } from '../game/events';
import { graveWidth } from '../game/grave';
import { MOB_TYPES } from '../game/mobs';
import type { MoveCommand, RunState, TickCommand } from '../game/run';
import { BASE_SPEED, RESERVOIR_CAPACITY, SCROLL_SPEED } from '../game/tuning';
import type { Execution } from '../game/execution';
import { executeTick } from '../game/execution';

/**
 * A policy's whole command for this tick, the belch included. Anything the rig
 * itself does is pushed onto `caused` so the run's events stay one list in tick
 * order, and today nothing does: the weapon lines are the game's own.
 *
 * It returns a TickCommand rather than a move because a policy that cannot
 * express a belch cannot carry ADR 0016's Wall property, which is two-sided over
 * exactly that: crossable unloaded, and never crossable for free.
 *
 * Every policy is a pure function of run state, so a seed and a policy name are
 * a whole run and two machines get the same one.
 */
type Policy = (state: RunState, caused: SimEvent[]) => TickCommand;

interface PolicyRun {
  readonly events: SimEvent[];
  readonly ticks: number;
}

/**
 * Runs a policy until the run ends, a fatal fault stops it, or the budget is
 * spent. Every tick crosses the one authority (ADR 0017), so the bot's runs go
 * through the same code the rendered game does and no test can prove something
 * the shipped game does not do.
 *
 * The bot lives in src/dev because it is the test rig and not the game, and it
 * is not wired into the rendered app: ADR 0013 makes the same bot the dev-only
 * autopilot there, and the tracer plan puts that at the tuning dispatch behind
 * the input-model fence.
 */
const runPolicy = (
  execution: Execution,
  policy: Policy,
  maxTicks: number,
): PolicyRun => {
  const state = execution.run;
  const events: SimEvent[] = [];
  let ticks = 0;
  while (ticks < maxTicks && state.ending === null && execution.stop === null) {
    const command = policy(state, events);
    events.push(...executeTick(execution, command));
    ticks += 1;
  }
  return { events, ticks };
};

// The nine moves a thumb can make, as unit commands. Staying put is one of them.
const DIAGONAL = 1 / Math.SQRT2;
const MOVES: readonly MoveCommand[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: DIAGONAL, y: DIAGONAL },
  { x: -DIAGONAL, y: DIAGONAL },
  { x: DIAGONAL, y: -DIAGONAL },
  { x: -DIAGONAL, y: -DIAGONAL },
];

/**
 * When the policy looks, in ticks ahead. Half a second is about what a person
 * reads a falling wave over, and the near samples are there because a threat
 * that passes through the grave and is gone again by the far sample is exactly
 * the one a policy sampling only the horizon cannot see at all.
 */
const LOOKAHEAD_SAMPLES = [5, 12, 20, 30];
const LOOKAHEAD_TICKS = LOOKAHEAD_SAMPLES[LOOKAHEAD_SAMPLES.length - 1];

// Only threats this close are considered, so the policy stays a local read rather than a search.
const THREAT_RADIUS = 240;

// Clearance past this counts as safe, and drifting back toward the centre decides instead.
const ENOUGH_CLEARANCE = 60;

// Where the policy drifts when nothing is closing: the shmup's own starting mark.
const HOME = { x: FIELD_WIDTH / 2, y: FIELD_HEIGHT * 0.8 };

interface Threat {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly halfWidth: number;
  readonly halfHeight: number;
}

const near = (state: RunState, x: number, y: number): boolean => {
  const dx = state.grave.x - x;
  const dy = state.grave.y - y;
  return dx * dx + dy * dy <= THREAT_RADIUS * THREAT_RADIUS;
};

/**
 * Everything close enough to matter, each with the velocity it will actually
 * travel at: a mob carries the scroll on top of its own motion and a shot does
 * not.
 */
const threatsNear = (state: RunState): Threat[] => {
  const threats: Threat[] = [];
  for (const mob of state.mobs) {
    if (!mob.alive || !near(state, mob.x, mob.y)) continue;
    const row = MOB_TYPES[mob.type];
    threats.push({
      x: mob.x,
      y: mob.y,
      vx: mob.vx,
      vy: mob.vy + SCROLL_SPEED,
      halfWidth: row.halfWidth,
      halfHeight: row.halfHeight,
    });
  }
  for (const shot of state.mobFire) {
    if (!shot.alive || !near(state, shot.x, shot.y)) continue;
    threats.push({
      x: shot.x,
      y: shot.y,
      vx: shot.vx,
      vy: shot.vy,
      halfWidth: shot.halfExtent,
      halfHeight: shot.halfExtent,
    });
  }
  return threats;
};

// Where a move would put the grave after some ticks, held inside the field.
const graveAfter = (
  state: RunState,
  move: MoveCommand,
  ticks: number,
  speed: number,
): { x: number; y: number } => {
  const halfWidth = graveWidth(state.grave.size) / 2;
  const size = state.grave.size;
  return {
    x: Math.min(
      Math.max(state.grave.x + move.x * speed * ticks, halfWidth),
      FIELD_WIDTH - halfWidth,
    ),
    y: Math.min(
      Math.max(state.grave.y + move.y * speed * ticks, size),
      FIELD_HEIGHT - size,
    ),
  };
};

// How far apart the two boxes are on their widest separating axis. Negative means they overlap.
const clearanceAt = (
  state: RunState,
  at: { x: number; y: number },
  threat: Threat,
  ticks: number,
): number => {
  const dx =
    Math.abs(at.x - (threat.x + threat.vx * ticks)) -
    (graveWidth(state.grave.size) / 2 + threat.halfWidth);
  const dy =
    Math.abs(at.y - (threat.y + threat.vy * ticks)) -
    (state.grave.size + threat.halfHeight);
  return Math.max(dx, dy);
};

const distanceToHome = (at: { x: number; y: number }): number => {
  const dx = at.x - HOME.x;
  const dy = at.y - HOME.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * How good a move looks: the tightest clearance it leaves over the look-ahead,
 * capped, with the drift home breaking ties. Capping the clearance is what
 * keeps this a plausible human rather than an optimizer: past a body's width of
 * room it stops caring how much more it could have had.
 */
const scoreMove = (
  state: RunState,
  move: MoveCommand,
  threats: readonly Threat[],
  speed: number,
): number => {
  let tightest = ENOUGH_CLEARANCE;
  for (const ticks of LOOKAHEAD_SAMPLES) {
    const at = graveAfter(state, move, ticks, speed);
    for (const threat of threats) {
      tightest = Math.min(tightest, clearanceAt(state, at, threat, ticks));
    }
  }
  const settled = graveAfter(state, move, LOOKAHEAD_TICKS, speed);
  return tightest * 1000 - distanceToHome(settled);
};

/**
 * A plausible human: it takes the roomiest of the nine moves a thumb can make,
 * reading half a second ahead, and drifts back toward the starting mark when
 * nothing is closing.
 *
 * It is deliberately not an optimizer. A bot proof is an upper bound on perfect
 * play and never a fairness result, so the policy that stands in for a person
 * has to be written as one: one step of look-ahead, a capped reward for space,
 * and no search over the future at all.
 */
const dodgePolicy: Policy = (state) => {
  return { move: bestDodge(state), belch: false };
};

// The roomiest of the nine moves a thumb can make, which is the whole of the dodge.
const bestDodge = (state: RunState): MoveCommand => {
  const threats = threatsNear(state);
  let best = MOVES[0];
  let bestScore = -Infinity;
  for (const move of MOVES) {
    const score = scoreMove(state, move, threats, BASE_SPEED);
    if (score <= bestScore) continue;
    bestScore = score;
    best = move;
  }
  return best;
};

/**
 * Dodges and never belches. It carries the first half of ADR 0016's two-sided
 * Wall property: an edge-to-edge curtain built as the belch's target stays
 * crossable unloaded, at a real cost in size or hits.
 *
 * Written as a plausible human and not as an optimizer, the same rule
 * dodgePolicy is written under, because a bot proof is an upper bound on
 * perfect play and never a fairness result.
 */
const unloadedPolicy: Policy = (state, caused) => {
  return { move: dodgePolicy(state, caused).move, belch: false };
};

/**
 * How many shots on the field make a belch worth spending. Below this the
 * reservoir is better kept, which is the judgement a person makes and the only
 * thing this policy adds to dodging.
 */
const BELCH_WORTH_IT = 8;

/**
 * Dodges, and belches when the reservoir is full and there is a curtain worth
 * cancelling. It carries the other half of ADR 0016's property: the curtain is
 * never crossable for free.
 */
const belchingPolicy: Policy = (state, caused) => {
  const loaded = state.reservoir >= RESERVOIR_CAPACITY;
  const shots = state.mobFire.reduce(
    (count, shot) => count + (shot.alive ? 1 : 0),
    0,
  );
  return {
    move: dodgePolicy(state, caused).move,
    belch: loaded && shots >= BELCH_WORTH_IT,
  };
};

// The nearest live mob or shot to the grave, or null when the field is empty.
const nearestThreat = (state: RunState): Threat | null => {
  let nearest: Threat | null = null;
  let best = Infinity;
  const consider = (threat: Threat) => {
    const dx = threat.x - state.grave.x;
    const dy = threat.y - state.grave.y;
    const distance = dx * dx + dy * dy;
    if (distance >= best) return;
    best = distance;
    nearest = threat;
  };
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    const row = MOB_TYPES[mob.type];
    consider({
      x: mob.x,
      y: mob.y,
      vx: mob.vx,
      vy: mob.vy + SCROLL_SPEED,
      halfWidth: row.halfWidth,
      halfHeight: row.halfHeight,
    });
  }
  for (const shot of state.mobFire) {
    if (!shot.alive) continue;
    consider({
      x: shot.x,
      y: shot.y,
      vx: shot.vx,
      vy: shot.vy,
      halfWidth: shot.halfExtent,
      halfHeight: shot.halfExtent,
    });
  }
  return nearest;
};

/**
 * Steers deliberately into the nearest threat, and reaches sealed shut.
 *
 * It cannot walk the whole ADR 0003 ladder and must not be asked to. Score
 * arrives only as ceiling overflow from a swallow and a strippable level needs
 * a drop, so in a build with no drops the bot arrives at the floor with score
 * zero and nothing above the birthright: the next hit seals. The ladder's own
 * order is tested in grave.test.ts against hand-seeded state, and that is where
 * it stays.
 */
const hitTakingPolicy: Policy = (state) => {
  return { move: towardNearest(state), belch: false };
};

// Straight at whatever is closest, which is how this policy reaches sealed shut.
const towardNearest = (state: RunState): MoveCommand => {
  const target = nearestThreat(state);
  if (target === null) return { x: 0, y: 0 };
  const dx = target.x - state.grave.x;
  const dy = target.y - state.grave.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return { x: 0, y: 0 };
  return { x: dx / length, y: dy / length };
};

export {
  runPolicy,
  dodgePolicy,
  unloadedPolicy,
  belchingPolicy,
  hitTakingPolicy,
};
export type { Policy, PolicyRun };
