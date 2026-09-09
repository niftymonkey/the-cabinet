// A boss's chunked health and the flash between chunks (ADR 0007, ADR 0052).

import { spawnFeast } from '../corpses';
import type { SimEvent } from '../events';
import { FIELD_WIDTH } from '../field';
import type { DamageSource } from '../mobs';
import type { Rect } from '../overlap';
import type { RunState } from '../run';
import type { BossKind } from '../stage/rows';
import { FEAST_PAYOUT } from '../tuning';
import { advanceBanshee, bansheeDied } from './banshee';
import { advanceUndertaker, undertakerDied } from './undertaker';

/**
 * The one boss on the field (ADR 0007). One record on RunState and never a
 * pool: there is exactly one at a time, ever, and a pool of one is a lie about
 * the design.
 */
interface Boss {
  /**
   * Spawn identity, from the same counter every entity draws from. It is the
   * join key a mobDamaged carries, so an instrument can credit the storm's work
   * on a boss the way it credits work on a mob.
   */
  readonly id: number;
  readonly kind: BossKind;
  // Which chunk is live. It only ever increases, and an invariant holds it.
  chunk: number;
  hp: number;
  x: number;
  y: number;
  // Ticks of the invincible flash left; while positive, player shots do nothing.
  flash: number;
  // The pattern's own clock, reset at each chunk break.
  patternTick: number;
}

/**
 * How long the invincible flash between chunks runs (ADR 0007). Initial row,
 * tuned by the harness at step 4: long enough to read as a beat and short
 * enough that it is not a pure-dodge stretch of its own.
 */
const CHUNK_FLASH_TICKS = 30;

/**
 * Health per chunk, per boss (ADR 0052: "Health per chunk is tuning data").
 *
 * The length of a row is the boss's chunk count, so the fight's length is chunk
 * count times health per chunk rather than one bar. Every number is initial and
 * first in line for the harness at step 4; the derivation is in the design
 * record's section 4 and it is a property rather than a pick. The floor is a
 * full build's storm damage across one full emit, five seconds at the longest,
 * so no chunk ever dies before the pattern it was written for has run once. The
 * rows sit well above that floor because the floor is not the fight's length:
 * at an initial one-third effective share against a boss standing at the top of
 * the field, the Undertaker's three chunks buy ADR 0052's hundred seconds and
 * the Banshee's two buy her nominal forty-five.
 */
const CHUNK_HP: Readonly<Record<BossKind, readonly number[]>> = {
  banshee: [1100, 1100],
  undertaker: [1700, 1700, 1700],
};

/**
 * The body every boss stands in, and where it stands when it arrives. Initial
 * rows: a silhouette wide enough that the storm meets it without aiming and a
 * standing point high in the field, so the whole field is between it and the
 * grave.
 *
 * One size for both bosses rather than a row each, because nothing this slice
 * builds tells them apart by shape: the two silhouettes are the renderer's
 * (BossRenderer) and each boss's own module may take a row of its own the day
 * its pattern needs one.
 */
const BOSS_HALF_WIDTH = 60;
const BOSS_HALF_HEIGHT = 40;
const BOSS_ARRIVAL_Y = 110;

/**
 * What a boss's own module owns: one tick of whichever chunk is live, and what
 * its death sheds. The machine holds the health, the flash and the break; the
 * grammar is the boss's, so a boss is added by writing a module and naming it
 * below.
 */
interface BossGrammar {
  readonly advance: (state: RunState, boss: Boss) => SimEvent[];
  readonly died: (state: RunState, boss: Boss) => SimEvent[];
}

/**
 * Every boss's grammar, one row per kind. It is total rather than partial, so a
 * kind added to BossKind without a module to fight with is a compile error
 * rather than a boss who never arrives and a phase nothing ever leaves.
 */
const BOSS_GRAMMARS: Record<BossKind, BossGrammar> = {
  banshee: { advance: advanceBanshee, died: bansheeDied },
  undertaker: { advance: advanceUndertaker, died: undertakerDied },
};

/**
 * How many chunks this boss runs, which is the length of its own health row. It
 * is a reader rather than a table anyone else indexes, so what the fight is
 * worth and what its shape is announced as cannot come apart.
 */
const bossChunks = (kind: BossKind): number => {
  return CHUNK_HP[kind].length;
};

/**
 * The boss this phase carries, put on the field at its standing point with its
 * first chunk live (ADR 0007).
 *
 * It returns the record and announces nothing. The arrival is the phase's own
 * report, in the slice that gives each boss its patterns, for the same reason
 * spawnMob leaves carrierLost to the row that placed it.
 */
const spawnBoss = (state: RunState, kind: BossKind): Boss => {
  const firstChunkHp = CHUNK_HP[kind][0];
  if (firstChunkHp === undefined) {
    throw new Error(`${kind} has no first chunk in CHUNK_HP`);
  }
  const boss: Boss = {
    id: state.nextEntityId,
    kind,
    chunk: 0,
    hp: firstChunkHp,
    x: FIELD_WIDTH / 2,
    y: BOSS_ARRIVAL_Y,
    flash: 0,
    patternTick: 0,
  };
  state.nextEntityId += 1;
  state.boss = boss;
  return boss;
};

const bossHitbox = (boss: Boss): Rect => {
  return {
    x: boss.x - BOSS_HALF_WIDTH,
    y: boss.y - BOSS_HALF_HEIGHT,
    width: BOSS_HALF_WIDTH * 2,
    height: BOSS_HALF_HEIGHT * 2,
  };
};

// Whether this boss has another chunk behind the one that just emptied.
const hasChunkLeft = (boss: Boss): boolean => {
  return boss.chunk + 1 < CHUNK_HP[boss.kind].length;
};

/**
 * The chunk break: the next chunk's health, the invincible flash, the pattern's
 * clock back to zero, and the feast the break sheds.
 *
 * The feast is what keeps ADR 0007's shed-food promise inside the fight rather
 * than at the end of it, and it never decays (ADR 0004), so a player who cannot
 * dive through the pattern yet still has it waiting.
 */
const breakChunk = (state: RunState, boss: Boss): SimEvent[] => {
  boss.chunk += 1;
  const chunkHp = CHUNK_HP[boss.kind][boss.chunk];
  if (chunkHp === undefined) {
    throw new Error(`${boss.kind} has no chunk ${boss.chunk} in CHUNK_HP`);
  }
  boss.hp = chunkHp;
  boss.flash = CHUNK_FLASH_TICKS;
  boss.patternTick = 0;
  const events: SimEvent[] = [
    { type: 'chunkBroke', boss: boss.kind, chunk: boss.chunk },
  ];
  events.push(...spawnFeast(state, boss.x, boss.y, FEAST_PAYOUT));
  return events;
};

/**
 * The last chunk emptied: the boss leaves the field and its own module pays
 * out. The death is announced before the payout, so a reading of what a fight
 * shed never has to look behind the event that ended it.
 */
const killBoss = (state: RunState, boss: Boss): SimEvent[] => {
  state.boss = null;
  const events: SimEvent[] = [
    { type: 'bossKilled', boss: boss.kind, x: boss.x, y: boss.y },
  ];
  events.push(...BOSS_GRAMMARS[boss.kind].died(state, boss));
  return events;
};

/**
 * Damage from the storm onto whichever chunk is live (ADR 0007).
 *
 * A hit during the flash reports itself with nothing applied rather than
 * reporting nothing at all: the storm is still working and an instrument
 * reading damage by line has to see the shots that landed on an invincible
 * body, or a fight's damage record goes quiet exactly where the player is
 * hitting hardest.
 */
const damageBoss = (
  state: RunState,
  amount: number,
  source: DamageSource,
): SimEvent[] => {
  const boss = state.boss;
  if (boss === null) return [];
  if (boss.flash > 0) {
    return [{ type: 'mobDamaged', id: boss.id, amount: 0, source }];
  }
  boss.hp -= amount;
  const events: SimEvent[] = [
    { type: 'mobDamaged', id: boss.id, amount, source },
  ];
  if (boss.hp > 0) return events;
  events.push(
    ...(hasChunkLeft(boss) ? breakChunk(state, boss) : killBoss(state, boss)),
  );
  return events;
};

/**
 * One tick of whichever chunk is live.
 *
 * The flash runs first and holds the pattern's clock still, so a chunk's
 * pattern begins on the tick the player can hurt it again rather than part-way
 * through its own first cycle.
 *
 * The pattern itself is delegated to the boss's own module, which is where the
 * grammar lives: banshee.ts owns the tear-rings and undertaker.ts the curtains
 * and the spiral. What is left here is the machine's own half of the fight, the
 * health, the flash and the break.
 *
 * The pattern runs on the clock it can read, and the clock moves after it, so
 * the tick a chunk begins on is that pattern's own tick zero.
 */
const advanceBoss = (state: RunState): SimEvent[] => {
  const boss = state.boss;
  if (boss === null) return [];
  if (boss.flash > 0) {
    boss.flash -= 1;
    return [];
  }
  const events = BOSS_GRAMMARS[boss.kind].advance(state, boss);
  boss.patternTick += 1;
  return events;
};

export {
  spawnBoss,
  damageBoss,
  bossHitbox,
  advanceBoss,
  bossChunks,
  CHUNK_FLASH_TICKS,
  CHUNK_HP,
  BOSS_HALF_WIDTH,
  BOSS_HALF_HEIGHT,
  BOSS_ARRIVAL_Y,
};
export type { Boss };
