// Hard invariants the sim must hold on every step (decision-log entry 6).
// Tests call this after each step; the dev overlay shows any fire live.
// A violation is a plain string so a test failure names the broken rule.

import { graveHalfW } from './grave';
import { LINE_NAMES } from './types';
import * as T from './tuning';
import type { Sim } from './sim';

export const ENTITY_CAPS = {
  enemies: 300,
  enemyBullets: 3000,
  playerBullets: 2000,
  corpses: 600,
  drops: 40,
  bells: 20,
} as const;

function finite(label: string, value: number, out: string[]): void {
  if (!Number.isFinite(value)) out.push(`${label} is not finite: ${value}`);
}

export function checkInvariants(sim: Sim): string[] {
  const out: string[] = [];
  const p = sim.player;

  finite('player.x', p.x, out);
  finite('player.y', p.y, out);
  finite('player.halfH', p.halfH, out);
  finite('player.score', p.score, out);
  finite('player.reservoir', p.reservoir, out);

  if (
    p.halfH < T.GRAVE_MIN_HALF_H - 0.001 ||
    p.halfH > T.GRAVE_MAX_HALF_H + 0.001
  ) {
    out.push(
      `grave size ${p.halfH} outside [${T.GRAVE_MIN_HALF_H}, ${T.GRAVE_MAX_HALF_H}]`,
    );
  }
  const halfW = graveHalfW(p.halfH);
  if (p.x < halfW - 0.001 || p.x > T.FIELD_W - halfW + 0.001) {
    out.push(`player.x ${p.x} outside the field`);
  }
  if (p.y < p.halfH - 0.001 || p.y > T.FIELD_H - p.halfH + 0.001) {
    out.push(`player.y ${p.y} outside the field`);
  }
  if (p.score < 0) out.push(`score is negative: ${p.score}`);
  if (p.reservoir < -0.001 || p.reservoir > T.BELCH_CAP + 0.001) {
    out.push(`reservoir ${p.reservoir} outside [0, ${T.BELCH_CAP}]`);
  }
  for (const line of LINE_NAMES) {
    const level = p.lines[line];
    if (level < 0 || level > T.MAX_LINE_LEVEL) {
      out.push(
        `line ${line} at level ${level} outside [0, ${T.MAX_LINE_LEVEL}]`,
      );
    }
  }

  const counts: [string, number, number][] = [
    ['enemies', sim.enemies.length, ENTITY_CAPS.enemies],
    ['enemyBullets', sim.enemyBullets.length, ENTITY_CAPS.enemyBullets],
    ['playerBullets', sim.playerBullets.length, ENTITY_CAPS.playerBullets],
    ['corpses', sim.corpses.length, ENTITY_CAPS.corpses],
    ['drops', sim.drops.length, ENTITY_CAPS.drops],
    ['bells', sim.bells.length, ENTITY_CAPS.bells],
  ];
  for (const [name, count, cap] of counts) {
    if (count > cap) out.push(`${name} count ${count} over cap ${cap}`);
  }
  for (const e of sim.enemies) {
    finite('enemy.x', e.x, out);
    finite('enemy.y', e.y, out);
  }
  for (const b of sim.enemyBullets) {
    finite('enemyBullet.x', b.x, out);
    finite('enemyBullet.y', b.y, out);
  }
  for (const b of sim.playerBullets) {
    finite('playerBullet.x', b.x, out);
    finite('playerBullet.y', b.y, out);
  }
  for (const c of sim.corpses) {
    finite('corpse.x', c.x, out);
    finite('corpse.y', c.y, out);
    finite('corpse.freshness', c.freshness, out);
  }

  return out;
}
