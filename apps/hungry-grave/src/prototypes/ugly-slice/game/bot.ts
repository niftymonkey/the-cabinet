// A deterministic player: the same policy drives the headless full-run test
// and the in-game autopilot (decision-log entry 6), so what the tests assert
// is what the screen shows. It steers by scoring nine candidate moves on
// bullet closest-approach danger plus distance to the current meal.

import { graveHalfW } from "./grave";
import { step, type Sim } from "./sim";
import { WALL_LANDED_MIN } from "./stage";
import * as T from "./tuning";
import type { Input, PhaseName } from "./types";

const HORIZON = 1.1;
const MOVE_TAU = 0.32;
const D = Math.SQRT1_2;
const DIRS: readonly [number, number][] = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [D, D],
  [D, -D],
  [-D, D],
  [-D, -D],
];

function closestApproach(
  px: number,
  py: number,
  bx: number,
  by: number,
  bvx: number,
  bvy: number,
): number {
  const rx = bx - px;
  const ry = by - py;
  const vv = bvx * bvx + bvy * bvy;
  let t = vv > 0 ? -(rx * bvx + ry * bvy) / vv : 0;
  t = Math.max(0, Math.min(HORIZON, t));
  const cx = rx + bvx * t;
  const cy = ry + bvy * t;
  return Math.hypot(cx, cy);
}

function threatPenalty(safe: number, d: number): number {
  if (d >= safe) return 0;
  const f = (safe - d) / safe;
  return f * f * 5000;
}

interface Target {
  x: number;
  y: number;
}

function pickTarget(sim: Sim): Target {
  const p = sim.player;
  const boss = sim.boss;
  // The curtain: hug the moving gap the Undertaker leaves open.
  if (
    boss?.kind === "undertaker" &&
    boss.chunkIndex === 0 &&
    boss.entering <= 0
  ) {
    return { x: boss.gapX, y: T.FIELD_H * 0.7 };
  }
  let best: Target | null = null;
  let bestCost = Infinity;
  for (const drop of sim.drops) {
    const cost = Math.hypot(drop.x - p.x, drop.y - p.y) * 0.5;
    if (cost < bestCost) {
      bestCost = cost;
      best = drop;
    }
  }
  for (const corpse of sim.corpses) {
    if (corpse.kind === "corpse" && corpse.freshness < 0.3) continue;
    const worth = corpse.kind === "corpse" ? 1 : 0.3;
    const cost = Math.hypot(corpse.x - p.x, corpse.y - p.y) * worth;
    if (cost < bestCost) {
      bestCost = cost;
      best = corpse;
    }
  }
  // Enemies compete in the same pool: the firing position under an enemy is
  // a target too, because position is the only aim this game has and a
  // center patrol never kills anything. Food stays cheaper at equal distance.
  for (const enemy of sim.enemies) {
    if (enemy.y < 0) continue;
    const standY = Math.min(
      Math.max(enemy.y + 220, T.FIELD_H * 0.5),
      T.FIELD_H * 0.75,
    );
    const cost = Math.hypot(enemy.x - p.x, standY - p.y) * 1.5;
    if (cost < bestCost) {
      bestCost = cost;
      best = { x: enemy.x, y: standY };
    }
  }
  if (best !== null) return best;
  // Empty table: sit under the boss so the soul stream lands, otherwise hold
  // a mid-low patrol off the bottom band.
  if (boss !== null && boss.entering <= 0) {
    return { x: boss.x, y: T.FIELD_H * 0.66 };
  }
  return { x: T.FIELD_W / 2, y: T.FIELD_H * 0.62 };
}

function wallAliveOnScreen(sim: Sim): number {
  let count = 0;
  for (const enemy of sim.enemies) {
    if (sim.wallEnemyIds.has(enemy.id) && enemy.y > 0) count++;
  }
  return count;
}

function wantBelch(sim: Sim): boolean {
  if (sim.player.reservoir < T.BELCH_CAP) return false;
  // The loaded post-Banshee belch is saved for the Wall, never empty sky.
  if (sim.phase === "backhalf")
    return wallAliveOnScreen(sim) >= WALL_LANDED_MIN;
  const boss = sim.boss;
  if (
    boss !== null &&
    boss.entering <= 0 &&
    boss.flashLeft <= 0 &&
    boss.toppleLeft <= 0
  ) {
    return true;
  }
  return sim.enemies.length >= 10;
}

export function botInput(sim: Sim): Input {
  const p = sim.player;
  const target = pickTarget(sim);
  const halfW = graveHalfW(p.halfH);
  const reach = T.PLAYER_SPEED * MOVE_TAU;
  let bestDir: [number, number] = [0, 0];
  let bestScore = Infinity;
  for (const dir of DIRS) {
    const cx = Math.max(
      halfW,
      Math.min(T.FIELD_W - halfW, p.x + dir[0] * reach),
    );
    const cy = Math.max(
      p.halfH,
      Math.min(T.FIELD_H - p.halfH, p.y + dir[1] * reach),
    );
    let score = Math.hypot(target.x - cx, target.y - cy);
    for (const b of sim.enemyBullets) {
      const safe = p.halfH * 0.9 + b.radius + 26;
      score += threatPenalty(
        safe,
        closestApproach(cx, cy, b.x, b.y, b.vx, b.vy),
      );
    }
    for (const e of sim.enemies) {
      const safe = p.halfH + T.ENEMY_RADIUS + 26;
      score += threatPenalty(
        safe,
        closestApproach(cx, cy, e.x, e.y, e.vx, e.vy),
      );
    }
    if (score < bestScore) {
      bestScore = score;
      bestDir = dir;
    }
  }
  // The bot never focuses: recorded bot runs keep the unmodified speed
  // baseline the feel-number tests assert (entry 8).
  return {
    moveX: bestDir[0],
    moveY: bestDir[1],
    focus: false,
    belch: wantBelch(sim),
  };
}

export const PHASE_ORDER: readonly PhaseName[] = [
  "ramp",
  "bansheeDrain",
  "banshee",
  "backhalf",
  "undertakerDrain",
  "undertaker",
  "victory",
];

// Fast-forward by honestly playing: the dev phase-skip keys and tests step
// the bot at fixed timestep until the sim reaches the asked-for phase.
export function advanceToPhase(
  sim: Sim,
  target: PhaseName,
  maxSeconds = 420,
): boolean {
  const dt = 1 / 60;
  let elapsed = 0;
  while (sim.phase !== target && elapsed < maxSeconds) {
    if (sim.phase === "victory" || sim.phase === "dead") break;
    step(sim, botInput(sim), dt);
    elapsed += dt;
  }
  return sim.phase === target;
}
