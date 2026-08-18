// The whole game state and one fixed-timestep step function. Pure data in,
// events out; rendering and audio subscribe to the event list per frame.

import { circleTouchesGrave, graveHalfW } from "./grave";
import { createInstruments, type Instruments } from "./instruments";
import { createStream, type Rng } from "./rng";
import {
  BACKHALF_ROWS,
  expandPhase,
  RAMP_ROWS,
  WALL_LANDED_MIN,
  type SpawnOrder,
} from "./stage";
import * as T from "./tuning";
import {
  LINE_NAMES,
  type Boss,
  type BellRing,
  type Corpse,
  type Drop,
  type Enemy,
  type EnemyBullet,
  type GameEvent,
  type Input,
  type PhaseName,
  type Player,
  type PlayerBullet,
} from "./types";

export interface Sim {
  seed: number;
  t: number;
  phase: PhaseName;
  phaseT: number;
  player: Player;
  invulnLeft: number;
  enemies: Enemy[];
  enemyBullets: EnemyBullet[];
  playerBullets: PlayerBullet[];
  bells: BellRing[];
  corpses: Corpse[];
  drops: Drop[];
  boss: Boss | null;
  pendingSpawns: SpawnOrder[];
  spawnCursor: number;
  kills: number;
  dropsPaid: number;
  events: GameEvent[];
  instruments: Instruments;
  nextEnemyId: number;
  wallEnemyIds: Set<number>;
  wallSpawned: boolean;
  belchGlow: boolean;
  spiralSinceChunk: number;
  emissionsThisChunk: number;
  rng: {
    enemyFire: Rng;
    dropLine: Rng;
    gapWalk: Rng;
    ringGap: Rng;
  };
}

function at(arr: readonly number[], index: number, fallback: number): number {
  const v = arr[index];
  return v === undefined ? fallback : v;
}

export function createSim(seed: number): Sim {
  return {
    seed,
    t: 0,
    phase: "ramp",
    phaseT: 0,
    player: {
      x: T.FIELD_W / 2,
      y: T.FIELD_H * 0.75,
      halfH: T.GRAVE_START_HALF_H,
      score: 0,
      // The floor is the birthright: both floor lines at level 1, the burst
      // lines only ever arrive through eating (decision-log entry 5).
      lines: { soul: 1, stone: 1, wisp: 0, bell: 0 },
      reservoir: 0,
      surgeLeft: 0,
      soulCooldown: 0,
      stoneAngle: 0,
      stoneDamageCooldown: 0,
    },
    invulnLeft: 0,
    enemies: [],
    enemyBullets: [],
    playerBullets: [],
    bells: [],
    corpses: [],
    drops: [],
    boss: null,
    pendingSpawns: expandPhase(RAMP_ROWS, "ramp", seed),
    spawnCursor: 0,
    kills: 0,
    dropsPaid: 0,
    events: [],
    instruments: createInstruments(),
    nextEnemyId: 1,
    wallEnemyIds: new Set(),
    wallSpawned: false,
    belchGlow: false,
    spiralSinceChunk: 0,
    emissionsThisChunk: 0,
    rng: {
      enemyFire: createStream(seed, "enemyFire"),
      dropLine: createStream(seed, "dropLine"),
      gapWalk: createStream(seed, "gapWalk"),
      ringGap: createStream(seed, "ringGap"),
    },
  };
}

export function dropCostForNext(dropsPaid: number): number {
  return at(
    T.DROP_COSTS,
    dropsPaid,
    T.DROP_COSTS[T.DROP_COSTS.length - 1] ?? 63,
  );
}

export function killsNeededForDrops(drops: number): number {
  let total = 0;
  for (let i = 0; i < drops; i++) total += dropCostForNext(i);
  return total;
}

function spawnEnemy(
  sim: Sim,
  x: number,
  vx: number,
  vy: number,
  isWall: boolean,
): void {
  const enemy: Enemy = {
    id: sim.nextEnemyId++,
    x,
    y: -T.ENEMY_RADIUS,
    vx,
    vy,
    hp: T.ENEMY_HP,
    fireCooldown: sim.rng.enemyFire.range(
      T.ENEMY_FIRE_INTERVAL[0],
      T.ENEMY_FIRE_INTERVAL[1],
    ),
    pushX: 0,
    pushY: 0,
  };
  sim.enemies.push(enemy);
  if (isWall) sim.wallEnemyIds.add(enemy.id);
}

function killEnemy(sim: Sim, enemy: Enemy): void {
  sim.kills++;
  sim.instruments.killsTotal++;
  sim.player.score += T.SCORE_PER_KILL;
  sim.events.push({ kind: "kill", x: enemy.x, y: enemy.y });
  sim.corpses.push({
    x: enemy.x,
    y: enemy.y,
    radius: T.CORPSE_RADIUS,
    kind: "corpse",
    freshness: 1,
    growth: T.CORPSE_GROWTH,
    belchCharge: T.BELCH_CHARGE_PER_CORPSE,
  });
  if (sim.kills >= killsNeededForDrops(sim.dropsPaid + 1)) {
    sim.dropsPaid++;
    sim.drops.push({
      x: enemy.x,
      y: enemy.y,
      spawnedAtKills: sim.kills,
      spawnedAtTime: sim.t,
    });
    sim.instruments.dropsSpawned++;
    sim.instruments.dropSpawnTimes.push(sim.t);
    sim.events.push({ kind: "drop", x: enemy.x, y: enemy.y });
  }
}

function shrinkPlayer(sim: Sim, cause: string, x: number, y: number): void {
  if (sim.invulnLeft > 0) return;
  sim.invulnLeft = T.HIT_INVULN_SECONDS;
  sim.instruments.hits.push({ t: sim.t, cause });
  sim.events.push({ kind: "hit", x, y, cause });
  const p = sim.player;
  if (p.halfH - T.HIT_SHRINK >= T.GRAVE_MIN_HALF_H) {
    p.halfH -= T.HIT_SHRINK;
    return;
  }
  p.halfH = T.GRAVE_MIN_HALF_H;
  // At the hard floor, damage bleeds score, then weapon levels above the
  // birthright loadout. Sealed shut only when there is nothing left to bleed.
  if (p.score >= T.FLOOR_SCORE_BLEED) {
    p.score -= T.FLOOR_SCORE_BLEED;
    return;
  }
  const strippable = LINE_NAMES.filter((line) => {
    const base = line === "soul" || line === "stone" ? 1 : 0;
    return p.lines[line] > base;
  });
  const line = strippable[strippable.length - 1];
  if (line !== undefined) {
    p.lines[line] -= 1;
    return;
  }
  sim.phase = "dead";
  sim.events.push({ kind: "sealed" });
}

// Growth respects the hard ceiling; whatever would not fit becomes score,
// so a big meal at full size is never worthless (decision-log entry 6).
function growGrave(sim: Sim, amount: number, x: number, y: number): void {
  const p = sim.player;
  const grown = Math.min(T.GRAVE_MAX_HALF_H, p.halfH + amount);
  const excess = p.halfH + amount - grown;
  p.halfH = grown;
  // Growing near a field edge must not push the grave outside it.
  const halfW = graveHalfW(p.halfH);
  p.x = Math.max(halfW, Math.min(T.FIELD_W - halfW, p.x));
  p.y = Math.max(p.halfH, Math.min(T.FIELD_H - p.halfH, p.y));
  if (excess > 0.0001) {
    const score = Math.round(excess * T.OVERSIZE_SCORE_PER_UNIT);
    p.score += score;
    sim.instruments.oversizeScore += score;
    sim.events.push({ kind: "sizeOverflow", x, y });
  }
}

function swallowPayout(sim: Sim, corpse: Corpse): void {
  const p = sim.player;
  const freshness =
    corpse.kind === "corpse"
      ? Math.max(T.FRESHNESS_FLOOR, corpse.freshness)
      : 1;
  sim.instruments.swallowCount++;
  sim.instruments.freshnessSum += freshness;
  sim.instruments.corpsesEaten++;
  if (p.lines.bell >= 2) {
    sim.instruments.swallowsWithBellLeveled++;
    sim.instruments.freshnessSumWithBellLeveled += freshness;
  }
  growGrave(sim, corpse.growth * freshness, corpse.x, corpse.y);
  if (corpse.kind === "bansheeFeast") {
    // Only the swallow slams the reservoir and fires the glow (entry 5.11).
    p.reservoir = T.BELCH_CAP;
    sim.belchGlow = true;
    sim.events.push({ kind: "feast", x: corpse.x, y: corpse.y });
    sim.events.push({ kind: "belchReady" });
  } else {
    const before = p.reservoir;
    p.reservoir = Math.min(
      T.BELCH_CAP,
      p.reservoir + corpse.belchCharge * freshness,
    );
    const waste = corpse.belchCharge * freshness - (p.reservoir - before);
    if (waste > 0.01) {
      sim.instruments.wastedCharge += waste;
      sim.events.push({ kind: "splashWaste", x: corpse.x, y: corpse.y });
    }
    if (p.reservoir >= T.BELCH_CAP && before < T.BELCH_CAP) {
      sim.events.push({ kind: "belchReady" });
    }
  }
  sim.events.push({ kind: "eat", x: corpse.x, y: corpse.y, freshness });
  // Every swallow fires the burst lines the player has earned, plus the
  // baseline chime; the bell upgrades the chime into the damage ring.
  p.surgeLeft = T.SOUL_SURGE_SECONDS;
  const wispLevel = p.lines.wisp;
  if (wispLevel > 0) {
    // Freshness multiplies the burst volley too, down to the floor, and a
    // scrap still buys at least one wisp (decision-log entry 2.2).
    const count = Math.max(
      1,
      Math.round(at(T.WISP_COUNT_BY_LEVEL, wispLevel - 1, 1) * freshness),
    );
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (i - (count - 1) / 2) * 0.5;
      sim.playerBullets.push({
        x: corpse.x,
        y: corpse.y,
        vx: Math.cos(angle) * T.WISP_SPEED,
        vy: Math.sin(angle) * T.WISP_SPEED,
        damage: T.WISP_DAMAGE,
        kind: "wisp",
        lifetime: T.WISP_LIFETIME,
      });
    }
    sim.events.push({ kind: "burst", x: corpse.x, y: corpse.y });
  }
  const bellLevel = p.lines.bell;
  if (bellLevel > 0) {
    sim.bells.push({
      x: p.x,
      y: p.y,
      radius: p.halfH,
      maxRadius: at(T.BELL_RADIUS_BY_LEVEL, bellLevel - 1, 90),
      damage: at(T.BELL_DAMAGE_BY_LEVEL, bellLevel - 1, 1),
      push: at(T.BELL_PUSH_BY_LEVEL, bellLevel - 1, 12),
      hitEnemies: new Set(),
      hitBoss: false,
    });
    sim.events.push({ kind: "bell", x: p.x, y: p.y });
  } else {
    sim.events.push({ kind: "chime", x: p.x, y: p.y });
  }
}

function applyUpgradeDrop(sim: Sim): void {
  const p = sim.player;
  const openLines = LINE_NAMES.filter((l) => p.lines[l] < T.MAX_LINE_LEVEL);
  if (openLines.length === 0) {
    // Overflow rule: drops for maxed lines are still eaten.
    growGrave(sim, T.OVERFLOW_GROWTH, p.x, p.y);
    p.score += T.OVERFLOW_SCORE;
    p.reservoir = Math.min(T.BELCH_CAP, p.reservoir + T.OVERFLOW_BELCH_CHARGE);
    sim.events.push({ kind: "overflowEat" });
    return;
  }
  const line = sim.rng.dropLine.pick(openLines);
  p.lines[line] += 1;
  sim.events.push({ kind: "levelUp", line, level: p.lines[line] });
}

function fireBelch(sim: Sim): void {
  const p = sim.player;
  if (p.reservoir < T.BELCH_CAP) return;
  // Captured before damageBoss: a killing blow clears the boss and flips the
  // phase mid-call, and the instruments record the fight the belch was fired
  // into, not the state it left behind.
  const phaseAtFire = sim.phase;
  const bossKindAtFire = sim.boss?.kind ?? null;
  p.reservoir = 0;
  sim.belchGlow = false;
  sim.instruments.belchesFired++;
  if (sim.instruments.fullSince !== null) {
    sim.instruments.timeAtFullReservoir += sim.t - sim.instruments.fullSince;
    sim.instruments.fullSince = null;
  }
  sim.events.push({ kind: "belch" });
  // The bomb everywhere: every enemy bullet cancelled, boss patterns included.
  sim.enemyBullets.length = 0;
  let wallKills = 0;
  for (const enemy of [...sim.enemies]) {
    if (sim.wallEnemyIds.has(enemy.id)) wallKills++;
    killEnemy(sim, enemy);
  }
  sim.enemies.length = 0;
  const boss = sim.boss;
  if (
    boss !== null &&
    boss.flashLeft <= 0 &&
    boss.entering <= 0 &&
    boss.toppleLeft <= 0
  ) {
    damageBoss(sim, boss, T.BELCH_BOSS_DAMAGE);
  }
  if (bossKindAtFire === "banshee") sim.instruments.belchesInBansheeFight++;
  if (bossKindAtFire === "undertaker")
    sim.instruments.belchesInUndertakerFight++;
  // The belch-on-wave instrument: the first belch of the back half either
  // lands on the Wall or is spent on empty sky.
  if (sim.instruments.belchOnWall === "pending" && phaseAtFire === "backhalf") {
    sim.instruments.belchOnWall =
      wallKills >= WALL_LANDED_MIN ? "landedOnWall" : "emptySky";
  }
}

function spawnBoss(sim: Sim, kind: "banshee" | "undertaker"): void {
  sim.boss = {
    kind,
    x: T.FIELD_W / 2,
    y: -60,
    radius: kind === "banshee" ? 34 : 42,
    chunkIndex: 0,
    chunkHp: kind === "banshee" ? T.BANSHEE_CHUNK_HP : T.UNDERTAKER_CHUNK_HP,
    flashLeft: 0,
    entering: T.BOSS_ENTER_SECONDS,
    emitTimer: 1.2,
    emitProgress: 0,
    gapAngle: sim.rng.ringGap.range(0, Math.PI * 2),
    gapAngle2: sim.rng.ringGap.range(0, Math.PI * 2),
    gapX: T.FIELD_W / 2,
    spiralAngle: 0,
    summonTimer: T.DIGGER_INTERVAL,
    toppleLeft: 0,
  };
  sim.spiralSinceChunk = 0;
  sim.emissionsThisChunk = 0;
}

function damageBoss(sim: Sim, boss: Boss, amount: number): void {
  if (boss.flashLeft > 0 || boss.entering > 0 || boss.toppleLeft > 0) return;
  boss.chunkHp -= amount;
  if (boss.chunkHp > 0) return;
  // A chunk break: short invincible flash, and for the spiral pattern, note
  // whether the chunk ended before finishing one full rotation.
  if (
    sim.emissionsThisChunk === 0 ||
    (boss.kind === "undertaker" &&
      boss.chunkIndex === 1 &&
      sim.spiralSinceChunk % (Math.PI * 2) > 0.4)
  ) {
    sim.instruments.chunkEndedMidEmit++;
  }
  if (boss.chunkIndex === 0) {
    boss.chunkIndex = 1;
    boss.chunkHp =
      boss.kind === "banshee" ? T.BANSHEE_CHUNK_HP : T.UNDERTAKER_CHUNK_HP;
    boss.flashLeft = T.CHUNK_BREAK_FLASH;
    sim.spiralSinceChunk = 0;
    sim.emissionsThisChunk = 0;
    sim.events.push({ kind: "chunkBreak", x: boss.x, y: boss.y });
    // The phase-break feast chunk never decays: treasure class.
    sim.corpses.push({
      x: boss.x,
      y: boss.y + boss.radius + 12,
      radius: T.CORPSE_RADIUS * 1.6,
      kind: "feast",
      freshness: 1,
      growth: T.CHUNK_FEAST_GROWTH,
      belchCharge: T.CHUNK_FEAST_BELCH_CHARGE,
    });
    return;
  }
  // The boss is dead.
  sim.events.push({ kind: "bossDeath", boss: boss.kind });
  if (boss.kind === "banshee") {
    sim.corpses.push({
      x: boss.x,
      y: boss.y,
      radius: T.CORPSE_RADIUS * 2.2,
      kind: "bansheeFeast",
      freshness: 1,
      growth: T.BANSHEE_FEAST_GROWTH,
      belchCharge: 0,
    });
    sim.boss = null;
    // Her death starts the Wall clock (entry 5.11): the back half's rows are
    // phase-local to this moment, the Wall itself two seconds in.
    sim.phase = "backhalf";
    sim.phaseT = 0;
    sim.pendingSpawns = expandPhase(BACKHALF_ROWS, "backhalf", sim.seed);
    sim.spawnCursor = 0;
    sim.events.push({ kind: "wallIncoming" });
  } else {
    boss.toppleLeft = T.VICTORY_TOPPLE_SECONDS;
  }
}

function stepBoss(sim: Sim, dt: number): void {
  const boss = sim.boss;
  if (boss === null) return;
  const p = sim.player;
  if (boss.toppleLeft > 0) {
    // The victory animation: he topples into the grave, and the swallow is
    // the win. The grave eats the gravedigger.
    boss.toppleLeft -= dt;
    boss.x += (p.x - boss.x) * dt * 1.4;
    boss.y += (p.y - boss.y) * dt * 1.4;
    boss.radius = Math.max(4, boss.radius - dt * 16);
    if (boss.toppleLeft <= 0) {
      sim.phase = "victory";
      sim.boss = null;
    }
    return;
  }
  if (boss.entering > 0) {
    boss.entering -= dt;
    boss.y += ((boss.kind === "banshee" ? 140 : 120) - boss.y) * dt * 1.8;
    return;
  }
  if (boss.flashLeft > 0) boss.flashLeft -= dt;
  boss.x =
    T.FIELD_W / 2 +
    Math.sin(sim.phaseT * (boss.kind === "banshee" ? 0.55 : 0.3)) *
      (boss.kind === "banshee" ? 130 : 90);

  boss.emitTimer -= dt;
  if (boss.kind === "banshee") {
    const interval =
      boss.chunkIndex === 0
        ? T.BANSHEE_RING_INTERVAL
        : T.BANSHEE_RING_INTERVAL / 2;
    if (boss.emitTimer <= 0) {
      boss.emitTimer += interval;
      sim.emissionsThisChunk++;
      // Chunk two adds a second offset ring source, so the gaps stop lining up.
      const fromSecond =
        boss.chunkIndex === 1 && sim.emissionsThisChunk % 2 === 0;
      const sourceX =
        boss.x + (fromSecond ? 70 : boss.chunkIndex === 1 ? -70 : 0);
      const gap = fromSecond ? boss.gapAngle2 : boss.gapAngle;
      const gapHalf = (T.BANSHEE_RING_GAP_DEGREES / 2) * (Math.PI / 180);
      for (let i = 0; i < T.BANSHEE_RING_BULLETS; i++) {
        const angle = (i / T.BANSHEE_RING_BULLETS) * Math.PI * 2;
        let delta = Math.abs(angle - gap) % (Math.PI * 2);
        if (delta > Math.PI) delta = Math.PI * 2 - delta;
        if (delta < gapHalf) continue;
        sim.enemyBullets.push({
          x: sourceX,
          y: boss.y,
          vx: Math.cos(angle) * T.BANSHEE_RING_SPEED,
          vy: Math.sin(angle) * T.BANSHEE_RING_SPEED,
          radius: T.ENEMY_BULLET_RADIUS,
          kind: "tear",
        });
      }
      // Chunk one teaches one lane: the gap holds, the player learns to sit
      // in it. Chunk two's re-rolls are the escalation, the learned rule
      // breaking (entry 4).
      if (boss.chunkIndex === 1) {
        if (fromSecond) {
          boss.gapAngle2 = sim.rng.ringGap.range(0, Math.PI * 2);
        } else {
          boss.gapAngle = sim.rng.ringGap.range(0, Math.PI * 2);
        }
      }
    }
    return;
  }
  // The Undertaker.
  if (boss.chunkIndex === 0) {
    if (boss.emitTimer <= 0) {
      boss.emitTimer += T.CURTAIN_INTERVAL;
      sim.emissionsThisChunk++;
      // The gap always fits: current grave width plus a fixed margin, and
      // clods are ordinary bullets, one small shrink and never a wall.
      boss.gapX = sim.rng.gapWalk.range(60, T.FIELD_W - 60);
      const gapWidth = graveHalfW(p.halfH) * 2 + T.CURTAIN_GAP_MARGIN;
      for (let x = T.CLOD_SPACING / 2; x < T.FIELD_W; x += T.CLOD_SPACING) {
        if (Math.abs(x - boss.gapX) < gapWidth / 2) continue;
        sim.enemyBullets.push({
          x,
          y: -T.CLOD_RADIUS,
          vx: 0,
          vy: T.CURTAIN_FALL_SPEED,
          radius: T.CLOD_RADIUS,
          kind: "clod",
        });
      }
    }
    return;
  }
  // Chunk two, the exhumation: slow shovel spiral plus digger zombies.
  if (boss.emitTimer <= 0) {
    boss.emitTimer += T.SPIRAL_INTERVAL;
    sim.emissionsThisChunk++;
    boss.spiralAngle += T.SPIRAL_STEP;
    sim.spiralSinceChunk += T.SPIRAL_STEP;
    sim.enemyBullets.push({
      x: boss.x,
      y: boss.y,
      vx: Math.cos(boss.spiralAngle) * T.SPIRAL_BULLET_SPEED,
      vy: Math.sin(boss.spiralAngle) * T.SPIRAL_BULLET_SPEED,
      radius: T.ENEMY_BULLET_RADIUS,
      kind: "spiral",
    });
  }
  boss.summonTimer -= dt;
  if (boss.summonTimer <= 0) {
    boss.summonTimer += T.DIGGER_INTERVAL;
    // The digger zombies are the slice's one trash enemy re-spawned by the
    // boss; their corpses keep the swallow economy alive at the climax.
    for (let i = 0; i < T.DIGGER_COUNT; i++) {
      spawnEnemy(
        sim,
        i % 2 === 0 ? 60 : T.FIELD_W - 60,
        i % 2 === 0 ? 30 : -30,
        55,
        false,
      );
    }
  }
}

function stepWeapons(sim: Sim, dt: number): void {
  const p = sim.player;
  // The soul stream: straight fanned columns pouring out of the mouth,
  // surging for a beat after each swallow, never homing.
  p.soulCooldown -= dt * (p.surgeLeft > 0 ? T.SOUL_SURGE_RATE : 1);
  if (p.soulCooldown <= 0) {
    p.soulCooldown += T.SOUL_INTERVAL;
    const columns = p.lines.soul;
    for (let i = 0; i < columns; i++) {
      const spreadDeg =
        columns === 1 ? 0 : (i / (columns - 1) - 0.5) * T.SOUL_FAN_DEGREES;
      const angle = -Math.PI / 2 + (spreadDeg * Math.PI) / 180;
      sim.playerBullets.push({
        x: p.x,
        y: p.y - p.halfH,
        vx: Math.cos(angle) * T.SOUL_SPEED,
        vy: Math.sin(angle) * T.SOUL_SPEED,
        damage: T.SOUL_DAMAGE,
        kind: "skull",
        lifetime: 3,
      });
    }
  }
  if (p.surgeLeft > 0) p.surgeLeft -= dt;
  p.stoneAngle += T.STONE_SPIN * dt;
  p.stoneDamageCooldown -= dt;

  // Wisps home; everything else flies dumb and straight.
  for (const bullet of sim.playerBullets) {
    if (bullet.kind === "wisp") {
      const target = nearestTarget(sim, bullet.x, bullet.y);
      if (target !== null) {
        const desired = Math.atan2(target.y - bullet.y, target.x - bullet.x);
        const current = Math.atan2(bullet.vy, bullet.vx);
        let delta = desired - current;
        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;
        const turn = Math.max(
          -T.WISP_TURN * dt,
          Math.min(T.WISP_TURN * dt, delta),
        );
        const next = current + turn;
        bullet.vx = Math.cos(next) * T.WISP_SPEED;
        bullet.vy = Math.sin(next) * T.WISP_SPEED;
      }
      bullet.lifetime -= dt;
    }
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
  }
  for (const bell of sim.bells) {
    bell.radius += T.BELL_SPEED * dt;
  }
  sim.bells = sim.bells.filter((b) => b.radius < b.maxRadius);
  sim.playerBullets = sim.playerBullets.filter(
    (b) =>
      b.lifetime > 0 &&
      b.y > -30 &&
      b.y < T.FIELD_H + 30 &&
      b.x > -30 &&
      b.x < T.FIELD_W + 30,
  );
}

function nearestTarget(
  sim: Sim,
  x: number,
  y: number,
): { x: number; y: number } | null {
  let best: { x: number; y: number } | null = null;
  let bestDist = Infinity;
  for (const enemy of sim.enemies) {
    const d = (enemy.x - x) ** 2 + (enemy.y - y) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = enemy;
    }
  }
  const boss = sim.boss;
  if (boss !== null && boss.entering <= 0 && boss.toppleLeft <= 0) {
    const d = (boss.x - x) ** 2 + (boss.y - y) ** 2;
    if (d < bestDist) best = boss;
  }
  return best;
}

function stonePositions(p: Player): { x: number; y: number }[] {
  const level = p.lines.stone;
  if (level <= 0) return [];
  const positions: { x: number; y: number }[] = [];
  // One slow stone growing to six in two counter-rotating rings.
  const total = [1, 2, 3, 4, 6][level - 1] ?? 1;
  const innerCount = level >= 4 ? Math.ceil(total / 2) : total;
  const outerCount = total - innerCount;
  const innerR = p.halfH + T.STONE_ORBIT_GAP;
  for (let i = 0; i < innerCount; i++) {
    const angle = p.stoneAngle + (i / innerCount) * Math.PI * 2;
    positions.push({
      x: p.x + Math.cos(angle) * innerR,
      y: p.y + Math.sin(angle) * innerR,
    });
  }
  const outerR = innerR + 24;
  for (let i = 0; i < outerCount; i++) {
    const angle = -p.stoneAngle * 1.2 + (i / outerCount) * Math.PI * 2;
    positions.push({
      x: p.x + Math.cos(angle) * outerR,
      y: p.y + Math.sin(angle) * outerR,
    });
  }
  return positions;
}

function stepCollisions(sim: Sim, dt: number): void {
  const p = sim.player;
  // Player bullets against enemies and the boss.
  for (const bullet of sim.playerBullets) {
    for (const enemy of sim.enemies) {
      if (enemy.hp <= 0) continue;
      const rr = T.ENEMY_RADIUS + 5;
      if ((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2 < rr * rr) {
        enemy.hp -= bullet.damage;
        bullet.lifetime = 0;
        break;
      }
    }
    const boss = sim.boss;
    if (
      bullet.lifetime > 0 &&
      boss !== null &&
      (bullet.x - boss.x) ** 2 + (bullet.y - boss.y) ** 2 <
        (boss.radius + 5) ** 2
    ) {
      damageBoss(sim, boss, bullet.damage);
      bullet.lifetime = 0;
    }
  }
  // Orbiting headstones: last-ditch close defense on touch.
  if (p.stoneDamageCooldown <= 0) {
    let touched = false;
    for (const stone of stonePositions(p)) {
      for (const enemy of sim.enemies) {
        if (enemy.hp <= 0) continue;
        const rr = T.ENEMY_RADIUS + T.STONE_RADIUS;
        if ((stone.x - enemy.x) ** 2 + (stone.y - enemy.y) ** 2 < rr * rr) {
          enemy.hp -= T.STONE_DAMAGE;
          touched = true;
        }
      }
      const boss = sim.boss;
      if (
        boss !== null &&
        (stone.x - boss.x) ** 2 + (stone.y - boss.y) ** 2 <
          (boss.radius + T.STONE_RADIUS) ** 2
      ) {
        damageBoss(sim, boss, T.STONE_DAMAGE);
        touched = true;
      }
    }
    if (touched) p.stoneDamageCooldown = T.STONE_DAMAGE_INTERVAL;
  }
  // Bell rings: damage once per enemy per ring, push trash, never the boss.
  for (const bell of sim.bells) {
    for (const enemy of sim.enemies) {
      if (enemy.hp <= 0 || bell.hitEnemies.has(enemy.id)) continue;
      const d = Math.hypot(enemy.x - bell.x, enemy.y - bell.y);
      if (Math.abs(d - bell.radius) < 26) {
        bell.hitEnemies.add(enemy.id);
        enemy.hp -= bell.damage;
        const away = d === 0 ? 0 : 1 / d;
        enemy.pushX += (enemy.x - bell.x) * away * bell.push;
        enemy.pushY += (enemy.y - bell.y) * away * bell.push;
      }
    }
    const boss = sim.boss;
    if (boss !== null && !bell.hitBoss) {
      const d = Math.hypot(boss.x - bell.x, boss.y - bell.y);
      if (Math.abs(d - bell.radius) < 26 + boss.radius / 2) {
        bell.hitBoss = true;
        damageBoss(sim, boss, bell.damage);
      }
    }
  }
  // Deaths from this frame's damage.
  const survivors: Enemy[] = [];
  for (const enemy of sim.enemies) {
    if (enemy.hp <= 0) killEnemy(sim, enemy);
    else survivors.push(enemy);
  }
  sim.enemies = survivors;

  // Enemy bullets against the player. The hurtbox is a slightly smaller
  // grave than the drawn one, genre-standard forgiveness.
  const keptBullets: EnemyBullet[] = [];
  for (const bullet of sim.enemyBullets) {
    if (
      circleTouchesGrave(
        p.x,
        p.y,
        p.halfH,
        bullet.x,
        bullet.y,
        bullet.radius,
        0.8,
      )
    ) {
      shrinkPlayer(sim, bullet.kind, bullet.x, bullet.y);
      continue;
    }
    keptBullets.push(bullet);
  }
  sim.enemyBullets = keptBullets;

  // Live enemies are never food: contact shrinks the hole like fire does.
  for (const enemy of sim.enemies) {
    if (
      circleTouchesGrave(
        p.x,
        p.y,
        p.halfH,
        enemy.x,
        enemy.y,
        T.ENEMY_RADIUS,
        0.8,
      )
    ) {
      shrinkPlayer(sim, "contact", enemy.x, enemy.y);
    }
  }

  // Eating: everything goes in the hole; the grave passes under it and
  // swallows what falls in.
  const keptCorpses: Corpse[] = [];
  for (const corpse of sim.corpses) {
    if (
      circleTouchesGrave(
        p.x,
        p.y,
        p.halfH,
        corpse.x,
        corpse.y,
        corpse.radius * 0.4,
        1,
      )
    ) {
      swallowPayout(sim, corpse);
    } else {
      keptCorpses.push(corpse);
    }
  }
  sim.corpses = keptCorpses;
  const keptDrops: Drop[] = [];
  for (const drop of sim.drops) {
    if (
      circleTouchesGrave(
        p.x,
        p.y,
        p.halfH,
        drop.x,
        drop.y,
        T.DROP_RADIUS * 0.4,
        1,
      )
    ) {
      sim.instruments.dropsEaten++;
      applyUpgradeDrop(sim);
    } else {
      keptDrops.push(drop);
    }
  }
  sim.drops = keptDrops;
  void dt;
}

function stepPhase(sim: Sim, dt: number): void {
  sim.phaseT += dt;
  switch (sim.phase) {
    case "ramp": {
      if (sim.phaseT >= T.RAMP_END) {
        sim.phase = "bansheeDrain";
        sim.phaseT = 0;
      }
      break;
    }
    case "bansheeDrain": {
      if (sim.phaseT >= T.DRAIN_SECONDS) {
        sim.phase = "banshee";
        sim.phaseT = 0;
        spawnBoss(sim, "banshee");
      }
      break;
    }
    case "banshee":
      break;
    case "backhalf": {
      if (!sim.wallSpawned && sim.phaseT >= T.WALL_DELAY_AFTER_BANSHEE) {
        sim.wallSpawned = true;
      }
      if (sim.phaseT >= T.BACKHALF_END) {
        // If the loaded belch was never fired by the time the back half
        // drains, the no-belch Wall outcome is recorded as the third case.
        if (sim.instruments.belchOnWall === "pending") {
          sim.instruments.belchOnWall = "noBelch";
        }
        sim.phase = "undertakerDrain";
        sim.phaseT = 0;
      }
      break;
    }
    case "undertakerDrain": {
      if (sim.phaseT >= T.DRAIN_SECONDS) {
        sim.phase = "undertaker";
        sim.phaseT = 0;
        spawnBoss(sim, "undertaker");
      }
      break;
    }
    case "undertaker":
    case "victory":
    case "dead":
      break;
  }
}

export function step(sim: Sim, input: Input, dt: number): void {
  if (sim.phase === "victory" || sim.phase === "dead") return;
  sim.t += dt;
  sim.instruments.runSeconds = sim.t;
  if (sim.invulnLeft > 0) sim.invulnLeft -= dt;
  stepPhase(sim, dt);

  // Spawns from the authored rows (ramp and back half run rows; boss phases
  // spawn nothing except what the boss summons).
  if (sim.phase === "ramp" || sim.phase === "backhalf") {
    while (sim.spawnCursor < sim.pendingSpawns.length) {
      const order = sim.pendingSpawns[sim.spawnCursor];
      if (order === undefined || order.t > sim.phaseT) break;
      const isWall =
        sim.phase === "backhalf" &&
        order.t <= T.WALL_DELAY_AFTER_BANSHEE + 0.01;
      spawnEnemy(sim, order.x, order.vx, order.vy, isWall);
      sim.spawnCursor++;
    }
  }

  // Player movement.
  const p = sim.player;
  const mag = Math.hypot(input.moveX, input.moveY);
  if (mag > 0) {
    const speed =
      T.PLAYER_SPEED * (input.focus ? T.PLAYER_FOCUS_MULTIPLIER : 1);
    p.x += (input.moveX / mag) * speed * dt;
    p.y += (input.moveY / mag) * speed * dt;
  }
  const halfW = graveHalfW(p.halfH);
  p.x = Math.max(halfW, Math.min(T.FIELD_W - halfW, p.x));
  p.y = Math.max(p.halfH, Math.min(T.FIELD_H - p.halfH, p.y));
  if (p.y > T.BOTTOM_BAND) sim.instruments.timeInBottomBand += dt;

  if (input.belch) fireBelch(sim);
  if (p.reservoir >= T.BELCH_CAP && sim.instruments.fullSince === null) {
    sim.instruments.fullSince = sim.t;
  }

  stepWeapons(sim, dt);
  stepBoss(sim, dt);

  // Enemies drift down, weave, and fire the occasional aimed shot.
  for (const enemy of sim.enemies) {
    enemy.x += (enemy.vx + enemy.pushX) * dt;
    enemy.y += (enemy.vy + enemy.pushY) * dt;
    enemy.pushX *= Math.max(0, 1 - 4 * dt);
    enemy.pushY *= Math.max(0, 1 - 4 * dt);
    enemy.x = Math.max(
      T.ENEMY_RADIUS,
      Math.min(T.FIELD_W - T.ENEMY_RADIUS, enemy.x),
    );
    enemy.fireCooldown -= dt;
    if (enemy.fireCooldown <= 0 && enemy.y > 0 && enemy.y < T.ENEMY_FIRE_MAX_Y) {
      enemy.fireCooldown = sim.rng.enemyFire.range(
        T.ENEMY_FIRE_INTERVAL[0],
        T.ENEMY_FIRE_INTERVAL[1],
      );
      const angle = Math.atan2(p.y - enemy.y, p.x - enemy.x);
      sim.enemyBullets.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * T.ENEMY_BULLET_SPEED,
        vy: Math.sin(angle) * T.ENEMY_BULLET_SPEED,
        radius: T.ENEMY_BULLET_RADIUS,
        kind: "shot",
      });
    }
  }
  sim.enemies = sim.enemies.filter((e) => {
    if (e.y < T.FIELD_H + T.ENEMY_RADIUS * 2) return true;
    sim.wallEnemyIds.delete(e.id);
    return false;
  });

  for (const bullet of sim.enemyBullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
  }
  sim.enemyBullets = sim.enemyBullets.filter(
    (b) =>
      b.y > -40 && b.y < T.FIELD_H + 40 && b.x > -40 && b.x < T.FIELD_W + 40,
  );

  // Corpses ride the conveyor down, running the freshness meter; treasure
  // (feast chunks, upgrade drops) never decays and only the edge removes it.
  const keptCorpses: Corpse[] = [];
  for (const corpse of sim.corpses) {
    corpse.y += T.SCROLL_SPEED * dt;
    if (corpse.kind === "corpse") {
      corpse.freshness -= dt / T.FRESHNESS_SECONDS;
      if (corpse.freshness <= 0) {
        sim.instruments.corpsesSuckedUnder++;
        sim.events.push({ kind: "suckedUnder", x: corpse.x, y: corpse.y });
        continue;
      }
    }
    if (corpse.y > T.FIELD_H + corpse.radius) continue;
    keptCorpses.push(corpse);
  }
  sim.corpses = keptCorpses;
  const keptDrops: Drop[] = [];
  for (const drop of sim.drops) {
    drop.y += T.SCROLL_SPEED * dt;
    if (drop.y > T.FIELD_H + T.DROP_RADIUS) {
      sim.instruments.dropsScrolledOff++;
      continue;
    }
    keptDrops.push(drop);
  }
  sim.drops = keptDrops;

  stepCollisions(sim, dt);

  // The no-belch Wall third case can also resolve early: every Wall enemy
  // gone with no belch fired means the crossing happened on skill alone.
  if (
    sim.instruments.belchOnWall === "pending" &&
    sim.wallSpawned &&
    sim.wallEnemyIds.size > 0
  ) {
    let anyAlive = false;
    for (const enemy of sim.enemies) {
      if (sim.wallEnemyIds.has(enemy.id)) {
        anyAlive = true;
        break;
      }
    }
    if (!anyAlive) sim.instruments.belchOnWall = "noBelch";
  }
}

export { stonePositions };
export type { PhaseName };
