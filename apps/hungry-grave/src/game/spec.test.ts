// Spec tests authored from the design record BEFORE running against the
// implementation (decision-log entry 6.5). Every assertion takes its expected
// value from the decision log, the concept doc, or the First Dig numbers
// table, and cites the entry it enforces. A failure here is presumed a code
// bug; the code gets fixed to meet the test, never the reverse.
//
// Named omissions, and why they are not asserted here:
// - Perceptual instruments (line-motion tellability, tear-ring vs bell-ring)
//   are playtest questions for a human; the sim cannot count them.
// - Readability layering and palette rules (contract item 11) are renderer
//   work; they get checked at the render layer, not in the sim.
// - Fight lengths (~30s Banshee, ~60s Undertaker, entry 5.2) depend on player
//   damage output; they enter only as nominal arithmetic in the five-minute
//   skeleton check.
// - Freshness scaling of the burst volley (entry 2.2) is asserted on the wisp
//   volley; the bell still rings full because the chime must fire on every
//   swallow (entry 3.2).
// - Entry 1.6's "death costs a chunk of weapon levels" describes a respawn
//   economy the slice does not have; the floor-bleed path covers the living
//   half of that rule.
// - The full-run shape (kills in band, both endings, ~5 minutes played) lives
//   in fullrun.test.ts per the done-contract, not here.

import { describe, expect, it } from "vitest";
import { botInput, PHASE_ORDER } from "./bot";
import { graveHalfW } from "./grave";
import { checkInvariants } from "./invariants";
import {
  createSim,
  dropCostForNext,
  killsNeededForDrops,
  step,
  stonePositions,
  type Sim,
} from "./sim";
import {
  BACKHALF_ROWS,
  densestRowCount,
  RAMP_ROWS,
  rowsTotalCount,
  type WaveRow,
} from "./stage";
import * as T from "./tuning";
import {
  LINE_NAMES,
  type Boss,
  type BossKind,
  type Corpse,
  type Enemy,
  type Input,
  type PlayerBullet,
} from "./types";

const DT = 1 / 60;
const IDLE: Input = { moveX: 0, moveY: 0, focus: false, belch: false };
const BELCH: Input = { moveX: 0, moveY: 0, focus: false, belch: true };

// A sim with the authored spawn rows emptied, so behavior tests see only the
// entities they place themselves. The invariants still run on every step
// (entry 6.5).
function isolatedSim(seed = 123): Sim {
  const sim = createSim(seed);
  sim.pendingSpawns = [];
  return sim;
}

function stepChecked(sim: Sim, input: Input = IDLE): void {
  step(sim, input, DT);
  const violations = checkInvariants(sim);
  expect(violations).toEqual([]);
}

function stepSeconds(sim: Sim, seconds: number, input: Input = IDLE): void {
  const steps = Math.round(seconds / DT);
  for (let i = 0; i < steps; i++) stepChecked(sim, input);
}

function eventKinds(sim: Sim): string[] {
  return sim.events.map((e) => e.kind);
}

// Test-entity builders. Tuning constants are legitimate INPUTS here; the
// standing rule bars them only from the expected side of an assertion.
function trashCorpse(x: number, y: number, freshness = 1): Corpse {
  return {
    x,
    y,
    radius: T.CORPSE_RADIUS,
    kind: "corpse",
    freshness,
    growth: T.CORPSE_GROWTH,
    belchCharge: T.BELCH_CHARGE_PER_CORPSE,
  };
}

function trashEnemy(x: number, y: number, hp: number): Enemy {
  return {
    id: 9000 + Math.floor(x + y),
    x,
    y,
    vx: 0,
    vy: 0,
    hp,
    fireCooldown: 999,
    pushX: 0,
    pushY: 0,
  };
}

function shot(x: number, y: number, damage = 1): PlayerBullet {
  return { x, y, vx: 0, vy: 0, damage, kind: "skull", lifetime: 1 };
}

function makeBoss(kind: BossKind, over: Partial<Boss> = {}): Boss {
  return {
    kind,
    x: T.FIELD_W / 2,
    y: 140,
    radius: kind === "banshee" ? 34 : 42,
    chunkIndex: 0,
    chunkHp: kind === "banshee" ? T.BANSHEE_CHUNK_HP : T.UNDERTAKER_CHUNK_HP,
    flashLeft: 0,
    entering: 0,
    emitTimer: 999,
    emitProgress: 0,
    gapAngle: 0,
    gapAngle2: 0,
    gapX: T.FIELD_W / 2,
    spiralAngle: 0,
    summonTimer: 999,
    toppleLeft: 0,
    ...over,
  };
}

describe("field units and the grave shape (decision-log entry 6)", () => {
  it("the sim runs in one fixed 540x760-unit field (entry 6.3)", () => {
    expect(T.FIELD_W).toBe(540);
    expect(T.FIELD_H).toBe(760);
  });

  it("crossing the field width takes about two seconds (entry 6.3)", () => {
    const crossing = T.FIELD_W / T.PLAYER_SPEED;
    expect(crossing).toBeGreaterThanOrEqual(1.7);
    expect(crossing).toBeLessThanOrEqual(2.3);
  });

  it("holding focus moves at about half speed; released, full speed returns (entry 8)", () => {
    const run = (focus: boolean): number => {
      const sim = isolatedSim();
      sim.player.x = 100;
      const startX = sim.player.x;
      stepSeconds(sim, 0.5, { moveX: 1, moveY: 0, focus, belch: false });
      return sim.player.x - startX;
    };
    const full = run(false);
    const focused = run(true);
    expect(focused).toBeLessThan(full);
    expect(focused / full).toBeGreaterThan(0.45);
    expect(focused / full).toBeLessThan(0.55);
  });

  it("the grave is taller than wide, width derived from the one half-height scalar (entry 6.1)", () => {
    expect(T.GRAVE_ASPECT).toBeGreaterThan(0);
    expect(T.GRAVE_ASPECT).toBeLessThan(1);
    expect(graveHalfW(20)).toBeCloseTo(20 * T.GRAVE_ASPECT, 10);
  });

  it("the hard ceiling is 64 half-height units, about a quarter of the field width tall (entry 6.4)", () => {
    expect(T.GRAVE_MAX_HALF_H).toBe(64);
    const heightOverQuarterField = (2 * T.GRAVE_MAX_HALF_H) / (T.FIELD_W / 4);
    expect(heightOverQuarterField).toBeGreaterThanOrEqual(0.85);
    expect(heightOverQuarterField).toBeLessThanOrEqual(1.15);
  });

  it("growth at the ceiling converts to score, so nothing swallowed is worthless (entry 6.4)", () => {
    const sim = isolatedSim();
    sim.player.halfH = T.GRAVE_MAX_HALF_H;
    const scoreBefore = sim.player.score;
    sim.corpses.push(trashCorpse(sim.player.x, sim.player.y));
    stepChecked(sim);
    expect(sim.player.halfH).toBe(T.GRAVE_MAX_HALF_H);
    expect(sim.player.score).toBeGreaterThan(scoreBefore);
    expect(eventKinds(sim)).toContain("sizeOverflow");
    expect(sim.instruments.oversizeScore).toBeGreaterThan(0);
  });
});

describe("size is health, floor and sealing (entries 1.5, 1.6; concept doc)", () => {
  it("an enemy bullet shrinks the grave and records a hit the player could name", () => {
    const sim = isolatedSim();
    const before = sim.player.halfH;
    sim.enemyBullets.push({
      x: sim.player.x,
      y: sim.player.y,
      vx: 0,
      vy: 0,
      radius: 5,
      kind: "shot",
    });
    stepChecked(sim);
    expect(sim.player.halfH).toBeLessThan(before);
    expect(sim.instruments.hits.length).toBe(1);
    expect(sim.instruments.hits[0]?.cause).toBeTruthy();
  });

  it("live enemies are never food: contact shrinks, nothing is eaten (entry 3.4)", () => {
    const sim = isolatedSim();
    const before = sim.player.halfH;
    sim.enemies.push(trashEnemy(sim.player.x, sim.player.y, 999));
    stepChecked(sim);
    expect(sim.player.halfH).toBeLessThan(before);
    expect(sim.kills).toBe(0);
    expect(sim.corpses.length).toBe(0);
    expect(sim.instruments.swallowCount).toBe(0);
  });

  it("at the hard floor, damage bleeds score instead of size (entry 1.5; concept doc)", () => {
    const sim = isolatedSim();
    sim.player.halfH = T.GRAVE_MIN_HALF_H;
    sim.player.score = 1000;
    sim.enemyBullets.push({
      x: sim.player.x,
      y: sim.player.y,
      vx: 0,
      vy: 0,
      radius: 5,
      kind: "shot",
    });
    stepChecked(sim);
    expect(sim.player.halfH).toBe(T.GRAVE_MIN_HALF_H);
    expect(sim.player.score).toBeLessThan(1000);
    expect(sim.phase).not.toBe("dead");
  });

  it("at the floor with no score, damage bleeds weapon levels (concept doc, size is health)", () => {
    const sim = isolatedSim();
    sim.player.halfH = T.GRAVE_MIN_HALF_H;
    sim.player.score = 0;
    sim.player.lines.wisp = 2;
    const levelsBefore = LINE_NAMES.reduce(
      (s, l) => s + sim.player.lines[l],
      0,
    );
    sim.enemyBullets.push({
      x: sim.player.x,
      y: sim.player.y,
      vx: 0,
      vy: 0,
      radius: 5,
      kind: "shot",
    });
    stepChecked(sim);
    const levelsAfter = LINE_NAMES.reduce((s, l) => s + sim.player.lines[l], 0);
    expect(sim.player.halfH).toBe(T.GRAVE_MIN_HALF_H);
    expect(levelsAfter).toBe(levelsBefore - 1);
    expect(sim.phase).not.toBe("dead");
  });

  it("with nothing left to bleed, the grave is sealed shut: death (concept doc)", () => {
    const sim = isolatedSim();
    sim.player.halfH = T.GRAVE_MIN_HALF_H;
    sim.player.score = 0;
    sim.enemyBullets.push({
      x: sim.player.x,
      y: sim.player.y,
      vx: 0,
      vy: 0,
      radius: 5,
      kind: "shot",
    });
    stepChecked(sim);
    expect(sim.phase).toBe("dead");
    expect(eventKinds(sim)).toContain("sealed");
  });
});

describe("the freshness meter (decision-log entry 2)", () => {
  it("runs about 10 seconds from kill to gone (entry 2.1)", () => {
    expect(T.FRESHNESS_SECONDS).toBeGreaterThanOrEqual(8);
    expect(T.FRESHNESS_SECONDS).toBeLessThanOrEqual(12);
  });

  it("is coupled to scroll speed: a mid-screen kill reaches the bottom edge nearly empty (entry 2.1)", () => {
    const midScreenTravelSeconds = T.FIELD_H / 2 / T.SCROLL_SPEED;
    expect(
      Math.abs(T.FRESHNESS_SECONDS - midScreenTravelSeconds),
    ).toBeLessThanOrEqual(0.5);
  });

  it("has a payout floor of about 25 percent, so scraps are never worthless (entry 2.2)", () => {
    expect(T.FRESHNESS_FLOOR).toBeGreaterThanOrEqual(0.2);
    expect(T.FRESHNESS_FLOOR).toBeLessThanOrEqual(0.3);
  });

  it("multiplies size growth down to the floor (entry 2.2)", () => {
    const fresh = isolatedSim();
    const freshBefore = fresh.player.halfH;
    fresh.corpses.push(trashCorpse(fresh.player.x, fresh.player.y, 1));
    stepChecked(fresh);
    const freshGrowth = fresh.player.halfH - freshBefore;

    const stale = isolatedSim();
    const staleBefore = stale.player.halfH;
    stale.corpses.push(trashCorpse(stale.player.x, stale.player.y, 0.05));
    stepChecked(stale);
    const staleGrowth = stale.player.halfH - staleBefore;

    expect(staleGrowth).toBeGreaterThan(0);
    expect(staleGrowth / freshGrowth).toBeGreaterThanOrEqual(0.2);
    expect(staleGrowth / freshGrowth).toBeLessThanOrEqual(0.3);
  });

  it("multiplies belch charge down to the floor (entry 2.2)", () => {
    const fresh = isolatedSim();
    fresh.corpses.push(trashCorpse(fresh.player.x, fresh.player.y, 1));
    stepChecked(fresh);
    const freshCharge = fresh.player.reservoir;

    const stale = isolatedSim();
    stale.corpses.push(trashCorpse(stale.player.x, stale.player.y, 0.05));
    stepChecked(stale);
    const staleCharge = stale.player.reservoir;

    expect(staleCharge).toBeGreaterThan(0);
    expect(staleCharge / freshCharge).toBeGreaterThanOrEqual(0.2);
    expect(staleCharge / freshCharge).toBeLessThanOrEqual(0.3);
  });

  it("multiplies the burst volley down to the floor (entry 2.2)", () => {
    const fresh = isolatedSim();
    fresh.player.lines.wisp = 5;
    fresh.corpses.push(trashCorpse(fresh.player.x, fresh.player.y, 1));
    stepChecked(fresh);
    const freshVolley = fresh.playerBullets.filter(
      (b) => b.kind === "wisp",
    ).length;

    const stale = isolatedSim();
    stale.player.lines.wisp = 5;
    stale.corpses.push(trashCorpse(stale.player.x, stale.player.y, 0.05));
    stepChecked(stale);
    const staleVolley = stale.playerBullets.filter(
      (b) => b.kind === "wisp",
    ).length;

    expect(staleVolley).toBeGreaterThanOrEqual(1);
    expect(staleVolley).toBeLessThan(freshVolley);
    expect(staleVolley).toBeLessThanOrEqual(
      Math.ceil(freshVolley * T.FRESHNESS_FLOOR),
    );
  });

  it("flickers as a last-chance warning near empty (entry 2.3; routed comment on #30)", () => {
    expect(T.FRESHNESS_FLICKER_AT).toBeGreaterThan(0);
    expect(T.FRESHNESS_FLICKER_AT).toBeLessThanOrEqual(0.2);
  });

  it("at empty, the dirt sucks the corpse under (entry 2.3)", () => {
    const sim = isolatedSim();
    sim.corpses.push(trashCorpse(60, 100, 1));
    stepSeconds(sim, T.FRESHNESS_SECONDS + 1);
    expect(sim.corpses.length).toBe(0);
    expect(sim.instruments.corpsesSuckedUnder).toBe(1);
    expect(eventKinds(sim)).toContain("suckedUnder");
  });

  it("upgrade drops never decay: only the scroll removes them (entry 2.4)", () => {
    const sim = isolatedSim();
    sim.drops.push({ x: 60, y: 100, spawnedAtKills: 0, spawnedAtTime: 0 });
    stepSeconds(sim, T.FRESHNESS_SECONDS + 5);
    expect(sim.drops.length).toBe(1);
    stepSeconds(sim, 10);
    expect(sim.drops.length).toBe(0);
    expect(sim.instruments.dropsScrolledOff).toBe(1);
  });

  it("boss feast chunks never decay: treasure class (entry 4.5)", () => {
    const sim = isolatedSim();
    sim.corpses.push({
      x: 60,
      y: 100,
      radius: T.CORPSE_RADIUS,
      kind: "feast",
      freshness: 1,
      growth: 3,
      belchCharge: 10,
    });
    stepSeconds(sim, T.FRESHNESS_SECONDS + 4);
    expect(sim.corpses.length).toBe(1);
    expect(sim.corpses[0]?.freshness).toBe(1);
  });
});

describe("the four weapon lines (decision-log entry 3; concept doc economy)", () => {
  it("there are four lines at five levels each (entry 1, concept doc)", () => {
    expect(LINE_NAMES.length).toBe(4);
    expect(T.MAX_LINE_LEVEL).toBe(5);
  });

  it("the run starts with both floor lines at level 1 and no burst lines (entry 5.5)", () => {
    const sim = createSim(1);
    expect(sim.player.lines).toEqual({ soul: 1, stone: 1, wisp: 0, bell: 0 });
  });

  it("the soul stream pours one column at level 1 and five at level 5 (concept doc)", () => {
    const l1 = isolatedSim();
    stepChecked(l1);
    expect(l1.playerBullets.filter((b) => b.kind === "skull").length).toBe(1);

    const l5 = isolatedSim();
    l5.player.lines.soul = 5;
    stepChecked(l5);
    expect(l5.playerBullets.filter((b) => b.kind === "skull").length).toBe(5);
  });

  it("the soul stream never homes: skull velocity is constant in flight (entry 3.3)", () => {
    const sim = isolatedSim();
    sim.enemies.push(trashEnemy(500, 300, 999));
    stepChecked(sim);
    const skull = sim.playerBullets.find((b) => b.kind === "skull");
    if (skull === undefined) throw new Error("no skull fired");
    const { vx, vy } = skull;
    stepSeconds(sim, 0.3);
    expect(skull.vx).toBe(vx);
    expect(skull.vy).toBe(vy);
  });

  it("headstones go from one slow stone to six in two rings (concept doc)", () => {
    const sim = isolatedSim();
    expect(stonePositions(sim.player).length).toBe(1);
    sim.player.lines.stone = 5;
    expect(stonePositions(sim.player).length).toBe(6);
  });

  it("wisps are the only homing line, one at level 1 and seven or eight at level 5 (entry 3.3, concept doc)", () => {
    const l1 = isolatedSim();
    l1.player.lines.wisp = 1;
    l1.corpses.push(trashCorpse(l1.player.x, l1.player.y));
    stepChecked(l1);
    expect(l1.playerBullets.filter((b) => b.kind === "wisp").length).toBe(1);

    const l5 = isolatedSim();
    l5.player.lines.wisp = 5;
    l5.corpses.push(trashCorpse(l5.player.x, l5.player.y));
    stepChecked(l5);
    const volley = l5.playerBullets.filter((b) => b.kind === "wisp").length;
    expect(volley).toBeGreaterThanOrEqual(7);
    expect(volley).toBeLessThanOrEqual(8);
  });

  it("every swallow chimes even with no bell line, and the bell upgrades the chime (entry 3.2)", () => {
    const noBell = isolatedSim();
    noBell.corpses.push(trashCorpse(noBell.player.x, noBell.player.y));
    stepChecked(noBell);
    expect(eventKinds(noBell)).toContain("chime");
    expect(eventKinds(noBell)).not.toContain("bell");
    expect(noBell.player.surgeLeft).toBeGreaterThan(0);

    const withBell = isolatedSim();
    withBell.player.lines.bell = 1;
    withBell.corpses.push(trashCorpse(withBell.player.x, withBell.player.y));
    stepChecked(withBell);
    expect(eventKinds(withBell)).toContain("bell");
    expect(withBell.bells.length).toBe(1);
  });

  it("bells deal bosses full damage with zero pushback; adds are pushed normally (entry 4.2)", () => {
    const sim = isolatedSim();
    sim.phase = "banshee";
    sim.boss = makeBoss("banshee", { y: sim.player.y - 100 });
    const enemy = trashEnemy(sim.player.x - 100, sim.player.y, 999);
    sim.enemies.push(enemy);
    const hpBefore = sim.boss.chunkHp;
    sim.bells.push({
      x: sim.player.x,
      y: sim.player.y,
      radius: 93,
      maxRadius: 400,
      damage: 3,
      push: 50,
      hitEnemies: new Set(),
      hitBoss: false,
    });
    stepChecked(sim);
    expect(hpBefore - (sim.boss?.chunkHp ?? 0)).toBe(3);
    expect(enemy.pushX).toBeLessThan(0);
  });
});

describe("drops and the rising price curve (decision-log entry 5.6; entry 1.6)", () => {
  it("the first drop costs about five kills (entry 5.6)", () => {
    expect(killsNeededForDrops(1)).toBeGreaterThanOrEqual(4);
    expect(killsNeededForDrops(1)).toBeLessThanOrEqual(6);
  });

  it("each next drop costs more, for at least the twelve drops a run pays (entry 5.6)", () => {
    for (let i = 0; i < 11; i++) {
      expect(dropCostForNext(i + 1)).toBeGreaterThan(dropCostForNext(i));
    }
  });

  it("the founding one-in-eight-to-ten rhythm reads true in the early minutes (entry 5.6)", () => {
    const earlyCosts = [
      dropCostForNext(1),
      dropCostForNext(2),
      dropCostForNext(3),
    ];
    const mean = earlyCosts.reduce((a, b) => a + b, 0) / earlyCosts.length;
    expect(mean).toBeGreaterThanOrEqual(7);
    expect(mean).toBeLessThanOrEqual(11);
  });

  it("the authored kills fund ten to twelve drops, never thirteen (entry 5.6)", () => {
    const authoredKills =
      rowsTotalCount(RAMP_ROWS) + rowsTotalCount(BACKHALF_ROWS);
    expect(authoredKills).toBeGreaterThanOrEqual(killsNeededForDrops(10));
    expect(authoredKills).toBeLessThan(killsNeededForDrops(13));
  });

  it("a kill leaves a corpse, and the priced kill spawns a drop (concept doc core loop; entry 5.6)", () => {
    const sim = isolatedSim();
    sim.kills = killsNeededForDrops(1) - 1;
    sim.enemies.push(trashEnemy(100, 300, 0));
    stepChecked(sim);
    expect(sim.corpses.filter((c) => c.kind === "corpse").length).toBe(1);
    expect(sim.instruments.dropsSpawned).toBe(1);
    expect(eventKinds(sim)).toContain("drop");
  });

  it("an eaten drop levels exactly one line, picked by the dice (entry 5.6)", () => {
    const sim = isolatedSim();
    const levelsBefore = LINE_NAMES.reduce(
      (s, l) => s + sim.player.lines[l],
      0,
    );
    sim.drops.push({
      x: sim.player.x,
      y: sim.player.y,
      spawnedAtKills: 0,
      spawnedAtTime: 0,
    });
    stepChecked(sim);
    const levelsAfter = LINE_NAMES.reduce((s, l) => s + sim.player.lines[l], 0);
    expect(levelsAfter).toBe(levelsBefore + 1);
    expect(eventKinds(sim)).toContain("levelUp");
    expect(sim.instruments.dropsEaten).toBe(1);
  });

  it("drops for maxed lines are still eaten: radius, score, bomb charge (entry 1.6)", () => {
    const sim = isolatedSim();
    for (const line of LINE_NAMES) sim.player.lines[line] = T.MAX_LINE_LEVEL;
    const before = {
      halfH: sim.player.halfH,
      score: sim.player.score,
      reservoir: sim.player.reservoir,
    };
    sim.drops.push({
      x: sim.player.x,
      y: sim.player.y,
      spawnedAtKills: 0,
      spawnedAtTime: 0,
    });
    stepChecked(sim);
    expect(sim.player.halfH).toBeGreaterThan(before.halfH);
    expect(sim.player.score).toBeGreaterThan(before.score);
    expect(sim.player.reservoir).toBeGreaterThan(before.reservoir);
    expect(eventKinds(sim)).toContain("overflowEat");
  });
});

describe("the belch (entry 1.7; entry 4.8; concept doc)", () => {
  it("is the bomb everywhere: clears every enemy bullet, damages the boss, empties the reservoir (entry 4.8)", () => {
    const sim = isolatedSim();
    sim.phase = "banshee";
    sim.boss = makeBoss("banshee");
    sim.player.reservoir = T.BELCH_CAP;
    for (let i = 0; i < 5; i++) {
      sim.enemyBullets.push({
        x: 100 + i * 40,
        y: 200,
        vx: 0,
        vy: 50,
        radius: 5,
        kind: "tear",
      });
    }
    sim.enemies.push(trashEnemy(400, 200, 999));
    const hpBefore = sim.boss.chunkHp;
    stepSeconds(sim, 1);
    stepChecked(sim, BELCH);
    expect(eventKinds(sim)).toContain("belch");
    expect(sim.enemyBullets.length).toBe(0);
    expect(sim.enemies.length).toBe(0);
    expect(sim.corpses.length).toBeGreaterThanOrEqual(1);
    expect(sim.player.reservoir).toBe(0);
    expect(sim.boss?.chunkHp ?? 0).toBeLessThan(hpBefore);
    expect(sim.instruments.belchesFired).toBe(1);
    expect(sim.instruments.belchesInBansheeFight).toBe(1);
    expect(sim.instruments.timeAtFullReservoir).toBeGreaterThan(0.5);
  });

  it("never fires below a full reservoir: no partial bombs (entry 9)", () => {
    const sim = isolatedSim();
    sim.player.reservoir = T.BELCH_CAP - 1;
    sim.enemyBullets.push({
      x: 200,
      y: 200,
      vx: 0,
      vy: 50,
      radius: 5,
      kind: "shot",
    });
    stepChecked(sim, BELCH);
    expect(eventKinds(sim)).not.toContain("belch");
    expect(sim.enemyBullets.length).toBe(1);
    expect(sim.instruments.belchesFired).toBe(0);
  });

  it("a killing-blow belch counts toward her fight and never resolves the Wall instrument (entries 4.8, 5.11)", () => {
    const sim = isolatedSim();
    sim.phase = "banshee";
    sim.boss = makeBoss("banshee", { chunkIndex: 1, chunkHp: 1 });
    sim.player.reservoir = T.BELCH_CAP;
    stepChecked(sim, BELCH);
    expect(eventKinds(sim)).toContain("bossDeath");
    expect(sim.phase).toBe("backhalf");
    expect(sim.instruments.belchesInBansheeFight).toBe(1);
    // The belch was fired into her fight, not at the Wall her death launches.
    expect(sim.instruments.belchOnWall).toBe("pending");
  });

  it("eating at a full reservoir visibly splashes and wastes (entry 1.7)", () => {
    const sim = isolatedSim();
    sim.player.reservoir = T.BELCH_CAP;
    sim.corpses.push(trashCorpse(sim.player.x, sim.player.y));
    stepChecked(sim);
    expect(sim.player.reservoir).toBeLessThanOrEqual(T.BELCH_CAP);
    expect(eventKinds(sim)).toContain("splashWaste");
    expect(sim.instruments.wastedCharge).toBeGreaterThan(0);
  });
});

describe("bosses (decision-log entry 4)", () => {
  it("chunked health with an invincible flash at the break, during which shots do nothing (entry 4.1)", () => {
    const sim = isolatedSim();
    sim.phase = "banshee";
    sim.boss = makeBoss("banshee", { chunkHp: 1 });
    sim.playerBullets.push(shot(sim.boss.x, sim.boss.y));
    stepChecked(sim);
    expect(sim.boss?.chunkIndex).toBe(1);
    expect(sim.boss?.flashLeft ?? 0).toBeGreaterThan(0);
    expect(eventKinds(sim)).toContain("chunkBreak");
    const feast = sim.corpses.find((c) => c.kind === "feast");
    expect(feast).toBeDefined();
    const hpAfterBreak = sim.boss?.chunkHp ?? 0;
    sim.playerBullets.push(shot(sim.boss?.x ?? 0, sim.boss?.y ?? 0, 10));
    stepChecked(sim);
    expect(sim.boss?.chunkHp).toBe(hpAfterBreak);
  });

  it("the Banshee rings have one clean gap, and chunk two adds a second offset source (entry 4.3)", () => {
    const sim = isolatedSim();
    sim.phase = "banshee";
    sim.player.y = T.FIELD_H - 30;
    sim.boss = makeBoss("banshee", { chunkIndex: 1, emitTimer: 0.01 });
    stepChecked(sim);
    const firstRing = sim.enemyBullets.filter((b) => b.kind === "tear");
    expect(firstRing.length).toBeGreaterThan(0);
    expect(firstRing.length).toBeLessThan(T.BANSHEE_RING_BULLETS);
    const firstX = firstRing[0]?.x ?? 0;
    sim.enemyBullets = [];
    stepSeconds(sim, T.BANSHEE_RING_INTERVAL / 2 + 0.1);
    const secondRing = sim.enemyBullets.filter((b) => b.kind === "tear");
    expect(secondRing.length).toBeGreaterThan(0);
    const secondX = secondRing[0]?.x ?? 0;
    expect(Math.abs(secondX - firstX)).toBeGreaterThan(30);
  });

  it("chunk one teaches one lane: the gap holds from ring to ring (entry 4.3)", () => {
    const sim = isolatedSim();
    sim.phase = "banshee";
    sim.player.y = T.FIELD_H - 30;
    sim.boss = makeBoss("banshee", { chunkIndex: 0, emitTimer: 0.01 });
    const ringAngles = (): string[] =>
      sim.enemyBullets
        .filter((b) => b.kind === "tear")
        .map((b) => Math.atan2(b.vy, b.vx).toFixed(3))
        .sort();
    stepChecked(sim);
    const firstRing = ringAngles();
    expect(firstRing.length).toBeGreaterThan(0);
    sim.enemyBullets = [];
    stepSeconds(sim, T.BANSHEE_RING_INTERVAL + 0.1);
    // Desync only means something if there was sync: the same angles are
    // missing from every chunk-one ring, so the learned lane stays true.
    expect(ringAngles()).toEqual(firstRing);
  });

  it("the Banshee's death feast is worth roughly 8 to 10 fresh trash corpses (entry 4.6)", () => {
    expect(T.BANSHEE_FEAST_GROWTH / T.CORPSE_GROWTH).toBeGreaterThanOrEqual(8);
    expect(T.BANSHEE_FEAST_GROWTH / T.CORPSE_GROWTH).toBeLessThanOrEqual(10);
  });

  it("her death starts the Wall clock; only the swallow slams the reservoir and fires the glow (entries 5.11, 4.6)", () => {
    const sim = isolatedSim();
    sim.phase = "banshee";
    sim.boss = makeBoss("banshee", { chunkIndex: 1, chunkHp: 1 });
    sim.playerBullets.push(shot(sim.boss.x, sim.boss.y));
    stepChecked(sim);
    expect(eventKinds(sim)).toContain("bossDeath");
    expect(eventKinds(sim)).toContain("wallIncoming");
    expect(sim.phase).toBe("backhalf");
    expect(sim.boss).toBeNull();
    const feast = sim.corpses.find((c) => c.kind === "bansheeFeast");
    if (feast === undefined) throw new Error("no banshee feast corpse dropped");
    expect(sim.player.reservoir).toBeLessThan(T.BELCH_CAP);
    expect(sim.belchGlow).toBe(false);

    feast.x = sim.player.x;
    feast.y = sim.player.y;
    stepChecked(sim);
    expect(sim.player.reservoir).toBe(T.BELCH_CAP);
    expect(sim.belchGlow).toBe(true);
    expect(eventKinds(sim)).toContain("feast");
    expect(eventKinds(sim)).toContain("belchReady");

    // The Wall enters about two seconds after her death, edge to edge, at
    // 2.5 to 3 times the front half's densest wave (entry 5.8).
    stepSeconds(sim, T.WALL_DELAY_AFTER_BANSHEE + 0.6);
    expect(sim.wallEnemyIds.size).toBeGreaterThanOrEqual(
      Math.ceil(densestRowCount(RAMP_ROWS) * 2.5),
    );
    const xs = sim.enemies.map((e) => e.x);
    expect(Math.min(...xs)).toBeLessThan(T.FIELD_W * 0.15);
    expect(Math.max(...xs)).toBeGreaterThan(T.FIELD_W * 0.85);

    // The loaded belch lands on the Wall, and the instrument records it.
    stepChecked(sim, BELCH);
    expect(sim.instruments.belchOnWall).toBe("landedOnWall");
  });

  it("the Undertaker's curtain gap always fits the current grave plus a margin (entry 4.4)", () => {
    const sim = isolatedSim();
    sim.phase = "undertaker";
    sim.player.halfH = 50;
    sim.boss = makeBoss("undertaker", { emitTimer: 0.01 });
    stepChecked(sim);
    const clods = sim.enemyBullets.filter((b) => b.kind === "clod");
    expect(clods.length).toBeGreaterThan(0);
    const gapX = sim.boss?.gapX ?? 0;
    for (const clod of clods) {
      expect(Math.abs(clod.x - gapX)).toBeGreaterThan(
        graveHalfW(sim.player.halfH),
      );
    }
  });

  it("the Undertaker re-spawns the one trash enemy as digger zombies (entry 4.10; routed build note)", () => {
    const sim = isolatedSim();
    sim.phase = "undertaker";
    sim.boss = makeBoss("undertaker", { chunkIndex: 1, summonTimer: 0.01 });
    stepChecked(sim);
    expect(sim.enemies.length).toBeGreaterThanOrEqual(1);
  });

  it("the Undertaker's death is the victory swallow, no payout (entry 4.6)", () => {
    const sim = isolatedSim();
    sim.phase = "undertaker";
    sim.boss = makeBoss("undertaker", { chunkIndex: 1, chunkHp: 1 });
    sim.playerBullets.push(shot(sim.boss.x, sim.boss.y));
    stepChecked(sim);
    expect(eventKinds(sim)).toContain("bossDeath");
    expect(sim.boss?.toppleLeft ?? 0).toBeGreaterThan(0);
    expect(sim.corpses.length).toBe(0);
    stepSeconds(sim, 4);
    expect(sim.phase).toBe("victory");
    expect(sim.boss).toBeNull();
    expect(sim.corpses.length).toBe(0);
  });
});

describe("the authored stage (decision-log entry 5; concept doc)", () => {
  const allRows: readonly WaveRow[] = [...RAMP_ROWS, ...BACKHALF_ROWS];

  it("phases run in the skeleton order (entry 5.2)", () => {
    expect(PHASE_ORDER).toEqual([
      "ramp",
      "bansheeDrain",
      "banshee",
      "backhalf",
      "undertakerDrain",
      "undertaker",
      "victory",
    ]);
  });

  it("the ramp runs to the 1:50 drain-out and the Banshee arrives at about 2:00 (entries 5.2, concept doc)", () => {
    expect(T.RAMP_END).toBeGreaterThanOrEqual(105);
    expect(T.RAMP_END).toBeLessThanOrEqual(115);
    expect(T.DRAIN_SECONDS).toBeGreaterThanOrEqual(8);
    expect(T.DRAIN_SECONDS).toBeLessThanOrEqual(12);
    const bansheeNominal = T.RAMP_END + T.DRAIN_SECONDS;
    expect(bansheeNominal).toBeGreaterThanOrEqual(115);
    expect(bansheeNominal).toBeLessThanOrEqual(125);
  });

  it("the back half drains out at 3:50 nominal, so the Undertaker arrives at 4:00 (entry 5.2, concept doc)", () => {
    // Nominal Banshee death is 2:30 (2:00 arrival plus ~30s of fight), so the
    // phase-local back half is about 80 seconds long.
    expect(T.BACKHALF_END).toBeGreaterThanOrEqual(70);
    expect(T.BACKHALF_END).toBeLessThanOrEqual(90);
  });

  it("the whole stage is five minutes nominal including fights (entry 5.2)", () => {
    const bansheeFightNominal = 30;
    const undertakerFightNominal = 60;
    const total =
      T.RAMP_END +
      T.DRAIN_SECONDS +
      bansheeFightNominal +
      T.BACKHALF_END +
      T.DRAIN_SECONDS +
      undertakerFightNominal;
    expect(total).toBeGreaterThanOrEqual(285);
    expect(total).toBeLessThanOrEqual(315);
  });

  it("every authored row spawns before its phase drains out (entry 5.2)", () => {
    expect(Math.max(...RAMP_ROWS.map((r) => r.t))).toBeLessThan(T.RAMP_END);
    expect(Math.max(...BACKHALF_ROWS.map((r) => r.t))).toBeLessThan(
      T.BACKHALF_END,
    );
  });

  it("the library is six shapes and the stage uses all of them (entry 5.7)", () => {
    const used = new Set(allRows.map((r) => r.template));
    expect([...used].sort()).toEqual([
      "drip",
      "file",
      "pincer",
      "rain",
      "v",
      "wall",
    ]);
  });

  it("the first 45 seconds are Drips and one File (concept doc, the ramp)", () => {
    const opening = RAMP_ROWS.filter((r) => r.t < 45);
    expect(
      opening.every((r) => r.template === "drip" || r.template === "file"),
    ).toBe(true);
    expect(opening.filter((r) => r.template === "file").length).toBe(1);
  });

  it("the Wall is one-shot, in the back half only, entering about two seconds after the Banshee dies (entries 5.7, 5.8)", () => {
    expect(RAMP_ROWS.filter((r) => r.template === "wall").length).toBe(0);
    const walls = BACKHALF_ROWS.filter((r) => r.template === "wall");
    expect(walls.length).toBe(1);
    expect(walls[0]?.t).toBeGreaterThanOrEqual(1);
    expect(walls[0]?.t).toBeLessThanOrEqual(3);
    expect(T.WALL_DELAY_AFTER_BANSHEE).toBeGreaterThanOrEqual(1);
    expect(T.WALL_DELAY_AFTER_BANSHEE).toBeLessThanOrEqual(3);
  });

  it("the Wall is 2.5 to 3 times the front half's densest wave, and the back half never reaches it (entry 5.8)", () => {
    const wall = BACKHALF_ROWS.find((r) => r.template === "wall");
    if (wall === undefined) throw new Error("no wall row");
    const frontDensest = densestRowCount(RAMP_ROWS);
    expect(wall.count).toBeGreaterThanOrEqual(frontDensest * 2.5);
    expect(wall.count).toBeLessThanOrEqual(frontDensest * 3);
    const backhalfDensestNonWall = densestRowCount(
      BACKHALF_ROWS.filter((r) => r.template !== "wall"),
    );
    expect(backhalfDensestNonWall).toBeLessThan(wall.count);
  });
});

describe("determinism and per-step invariants (entries 5, 6.5)", () => {
  it("the same seed plays the identical run (entry 5: named seeded streams)", () => {
    const a = createSim(777);
    const b = createSim(777);
    for (let i = 0; i < Math.round(30 / DT); i++) {
      step(a, botInput(a), DT);
      step(b, botInput(b), DT);
    }
    expect(a.player).toEqual(b.player);
    expect(a.kills).toBe(b.kills);
    expect(a.phase).toBe(b.phase);
    expect(a.enemies.length).toBe(b.enemies.length);
    expect(a.corpses.length).toBe(b.corpses.length);
    expect(a.enemyBullets.length).toBe(b.enemyBullets.length);
  });

  it("a botted opening minute never fires an invariant (entry 6.5)", () => {
    const sim = createSim(42);
    for (let i = 0; i < Math.round(60 / DT); i++) {
      step(sim, botInput(sim), DT);
      const violations = checkInvariants(sim);
      if (violations.length > 0) {
        throw new Error(
          `invariant fired at t=${sim.t.toFixed(2)}: ${violations.join("; ")}`,
        );
      }
    }
    expect(sim.phase).toBe("ramp");
  });

  it("the off-bottom-edge instrument accumulates in the bottom band (entry 2; First Dig instruments)", () => {
    const sim = isolatedSim();
    sim.player.y = T.FIELD_H - 60;
    stepSeconds(sim, 1);
    expect(sim.instruments.timeInBottomBand).toBeGreaterThan(0.9);
  });
});
