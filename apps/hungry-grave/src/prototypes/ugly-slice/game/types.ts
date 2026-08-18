export type LineName = "soul" | "stone" | "wisp" | "bell";

export const LINE_NAMES: readonly LineName[] = [
  "soul",
  "stone",
  "wisp",
  "bell",
];

export interface Player {
  x: number;
  y: number;
  // The grave's one size scalar: half its height in field units. Width
  // derives from it through GRAVE_ASPECT; size is health.
  halfH: number;
  score: number;
  lines: Record<LineName, number>;
  reservoir: number;
  surgeLeft: number;
  soulCooldown: number;
  stoneAngle: number;
  stoneDamageCooldown: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  fireCooldown: number;
  pushX: number;
  pushY: number;
}

export type EnemyBulletKind = "shot" | "tear" | "clod" | "spiral";

export interface EnemyBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  kind: EnemyBulletKind;
}

export interface PlayerBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  kind: "skull" | "wisp";
  lifetime: number;
}

export interface BellRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  damage: number;
  push: number;
  hitEnemies: Set<number>;
  hitBoss: boolean;
}

export type CorpseKind = "corpse" | "feast" | "bansheeFeast";

export interface Corpse {
  x: number;
  y: number;
  radius: number;
  kind: CorpseKind;
  freshness: number;
  growth: number;
  belchCharge: number;
}

export interface Drop {
  x: number;
  y: number;
  spawnedAtKills: number;
  spawnedAtTime: number;
}

export type PhaseName =
  | "ramp"
  | "bansheeDrain"
  | "banshee"
  | "backhalf"
  | "undertakerDrain"
  | "undertaker"
  | "victory"
  | "dead";

export type BossKind = "banshee" | "undertaker";

export interface Boss {
  kind: BossKind;
  x: number;
  y: number;
  radius: number;
  chunkIndex: number;
  chunkHp: number;
  flashLeft: number;
  entering: number;
  emitTimer: number;
  emitProgress: number;
  gapAngle: number;
  gapAngle2: number;
  gapX: number;
  spiralAngle: number;
  summonTimer: number;
  toppleLeft: number;
}

export type GameEvent =
  | { kind: "eat"; x: number; y: number; freshness: number }
  | { kind: "feast"; x: number; y: number }
  | { kind: "burst"; x: number; y: number }
  | { kind: "bell"; x: number; y: number }
  | { kind: "chime"; x: number; y: number }
  | { kind: "splashWaste"; x: number; y: number }
  | { kind: "belch" }
  | { kind: "belchReady" }
  | { kind: "hit"; x: number; y: number; cause: string }
  | { kind: "drop"; x: number; y: number }
  | { kind: "levelUp"; line: LineName; level: number }
  | { kind: "overflowEat" }
  | { kind: "sizeOverflow"; x: number; y: number }
  | { kind: "suckedUnder"; x: number; y: number }
  | { kind: "kill"; x: number; y: number }
  | { kind: "chunkBreak"; x: number; y: number }
  | { kind: "bossDeath"; boss: BossKind }
  | { kind: "wallIncoming" }
  | { kind: "sealed" };

export interface Input {
  moveX: number;
  moveY: number;
  // Hold-to-focus: reduced speed for fine dodging while held (entry 8).
  focus: boolean;
  belch: boolean;
}
