/**
 * The one seam through which the storm finds what it can hit.
 *
 * Every weapon line used to walk state.mobs for itself, in five places. A boss
 * is one record on RunState and not a member of the mob pool, so every one of
 * those walks would have gone straight past it and ADR 0007's storm must always
 * matter would have failed in five modules at once. The fix is one seam and
 * never five widened walks, because five copies of the same branch is exactly
 * how a weapon line learns that a boss exists, which the standing extensibility
 * constraint forbids (path-draft.md:21).
 *
 * A line asks for targets, damages one and pushes one; what it is holding is
 * this module's business. src/__tests__/lineAgnosticPolicies.test.ts holds the
 * retirement of the five walks, read from the line's side.
 *
 * THE LIST IS ANSWERED FOR THE MOMENT IT IS ASKED FOR, AND NO CALLER RETAINS IT
 * PAST ITS OWN PASS. The slots are reused, so a target kept across a later call
 * is a reading of whatever now stands in that place. A pass that needs one
 * target across two calls carries its id and asks again.
 */

import type { Boss } from './bosses/chunks';
import { bossHitbox, damageBoss } from './bosses/chunks';
import { MOB_CAP } from './caps';
import type { SimEvent } from './events';
import { FIELD_HEIGHT, FIELD_WIDTH } from './field';
import type { DamageSource, Mob } from './mobs';
import { damageMob, hasEntered, mobHitbox, SPAWN_MARGIN } from './mobs';
import type { Rect } from './overlap';
import type { RunState } from './run';

/**
 * One thing the storm can hit this tick, whatever kind of thing it is standing
 * on the field as. A weapon line reads this and never learns that a boss or a
 * set piece exists.
 */
interface StormTarget {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly box: Rect;
  readonly hp: number;
  // Whether its top edge is inside the field, which is the belch's scope limit.
  readonly entered: boolean;
  // Whether a push moves it. False where an authored pattern would smear (ADR 0007).
  readonly pushable: boolean;
  /**
   * Whether one hit can take the whole of it. False where health is chunked or
   * is sized to outlive its own moment, which is what a kill rule has to read:
   * the belch's burst is a kill rule rather than a damage number, so a belch
   * reaching a chunked body would break a chunk outright, which is a skip
   * rather than the breath the belch buys.
   */
  readonly killableOutright: boolean;
}

/**
 * A slot of this module's own buffer: the public reading, plus the handle back
 * to whatever it stands for. Exactly one handle is set.
 *
 * The handle is what lets a line damage or move a target without ever holding
 * the entity itself, and it is a field of this record rather than of
 * StormTarget so that no caller typed to the seam can reach it.
 */
interface TargetSlot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  box: { x: number; y: number; width: number; height: number };
  hp: number;
  entered: boolean;
  pushable: boolean;
  killableOutright: boolean;
  mob: Mob | null;
  boss: Boss | null;
}

const blankSlot = (): TargetSlot => {
  return {
    id: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    box: { x: 0, y: 0, width: 0, height: 0 },
    hp: 0,
    entered: false,
    pushable: false,
    killableOutright: false,
    mob: null,
    boss: null,
  };
};

/**
 * The slots this module owns, one per thing that can stand on the field at
 * once: the whole mob pool, and the boss.
 *
 * They are pre-allocated and refilled in place so that a tick allocates nothing
 * however many lines ask, which is the point. Five callers a tick over a
 * hundred-and-sixty-slot pool is exactly where a fresh array per call would
 * show up.
 */
const SLOTS: TargetSlot[] = Array.from({ length: MOB_CAP + 1 }, blankSlot);

/**
 * The list handed out, held at the number of slots filled. It is the same array
 * every call, so no caller may retain it past its own pass; every entry is the
 * SLOTS entry at the same index, which is why growing it back only ever writes
 * over a hole.
 */
const LIVE: TargetSlot[] = [];

const fillBox = (slot: TargetSlot, box: Rect): void => {
  slot.box.x = box.x;
  slot.box.y = box.y;
  slot.box.width = box.width;
  slot.box.height = box.height;
};

const fillFromMob = (slot: TargetSlot, mob: Mob): void => {
  slot.id = mob.id;
  slot.x = mob.x;
  slot.y = mob.y;
  slot.vx = mob.vx;
  slot.vy = mob.vy;
  fillBox(slot, mobHitbox(mob));
  slot.hp = mob.hp;
  slot.entered = hasEntered(mob);
  slot.pushable = true;
  slot.killableOutright = true;
  slot.mob = mob;
  slot.boss = null;
};

/**
 * A boss reads as a target already on the field, that a push does not move
 * (ADR 0007, so authored patterns never smear) and that a kill rule may not
 * take whole, because its health is one chunk of several.
 *
 * It carries no velocity of its own: a boss stands where its pattern puts it,
 * and what reads a target's velocity is a line aiming ahead of a body that is
 * travelling.
 */
const fillFromBoss = (slot: TargetSlot, boss: Boss): void => {
  slot.id = boss.id;
  slot.x = boss.x;
  slot.y = boss.y;
  slot.vx = 0;
  slot.vy = 0;
  fillBox(slot, bossHitbox(boss));
  slot.hp = boss.hp;
  slot.entered = true;
  slot.pushable = false;
  slot.killableOutright = false;
  slot.mob = null;
  slot.boss = boss;
};

/**
 * Every live target this tick, in a fixed order: the mob pool in slot order,
 * then the boss.
 *
 * The order is as load-bearing as the membership. Lines resolve ties by taking
 * the first target in the list, so a fixed order is what makes the same seed
 * produce the same kills in the same order.
 */
const stormTargets = (state: RunState): readonly StormTarget[] => {
  let filled = 0;
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    fillFromMob(SLOTS[filled], mob);
    filled += 1;
  }
  if (state.boss !== null) {
    fillFromBoss(SLOTS[filled], state.boss);
    filled += 1;
  }
  LIVE.length = filled;
  for (let at = 0; at < filled; at++) LIVE[at] = SLOTS[at];
  return LIVE;
};

/**
 * The slot standing behind a target the caller is holding, or null once it is
 * gone.
 *
 * It matches on the id rather than on the record, because the id is unique
 * across everything live at once and the invariant harness holds it so
 * (faults.ts, "entity ids").
 */
const slotFor = (target: StormTarget): TargetSlot | null => {
  for (const slot of LIVE) {
    if (slot.id === target.id) return slot;
  }
  return null;
};

// The target carrying this id, or null once it is gone.
const stormTarget = (state: RunState, id: number): StormTarget | null => {
  for (const target of stormTargets(state)) {
    if (target.id === id) return target;
  }
  return null;
};

/**
 * Damage onto whatever carries this target. The kill, the corpse and the chunk
 * break are the owning module's business and come back as events.
 *
 * A target that has already gone takes nothing and reports nothing. That is an
 * ordinary outcome rather than an anomaly: one line's pass can kill a target
 * another line is still walking.
 */
const damageStormTarget = (
  state: RunState,
  target: StormTarget,
  amount: number,
  source: DamageSource,
): SimEvent[] => {
  const slot = slotFor(target);
  if (slot === null) return [];
  if (slot.mob !== null) return damageMob(state, slot.mob, amount, source);
  if (slot.boss !== null) return damageBoss(state, amount, source);
  return [];
};

const clamp = (value: number, low: number, high: number): number => {
  return Math.min(Math.max(value, low), high);
};

/**
 * Moves whatever carries this target, for a line that pushes. A no-op on a
 * target that is not pushable, so the caller never branches on what it hit and
 * reads the displacement back off the target rather than deciding it.
 *
 * The bounds are the field plus a spawn margin, which is where a body may
 * stand: a push is never what carries something out of the world.
 */
const moveStormTarget = (
  // The run is in the signature because moving a target is the run's own state
  // changing; nothing here needs to read it, and the set piece's source is
  // moved by its own drift rather than by a line.
  _state: RunState,
  target: StormTarget,
  x: number,
  y: number,
): void => {
  const slot = slotFor(target);
  // pushable is the rule and the handle is what the move is applied through.
  // They agree today, and only the first of them is a decision: a target the
  // seam has no way to move is a target nothing can push either way.
  if (slot === null || !slot.pushable || slot.mob === null) return;
  slot.mob.x = clamp(x, -SPAWN_MARGIN, FIELD_WIDTH + SPAWN_MARGIN);
  slot.mob.y = clamp(y, -SPAWN_MARGIN, FIELD_HEIGHT + SPAWN_MARGIN);
  // The reading follows the move, the body with it, so a pass that moves a
  // target and then tests it again reads where it now is rather than where it
  // stood when the list was filled.
  slot.box.x += slot.mob.x - slot.x;
  slot.box.y += slot.mob.y - slot.y;
  slot.x = slot.mob.x;
  slot.y = slot.mob.y;
};

export { stormTargets, stormTarget, damageStormTarget, moveStormTarget };
export type { StormTarget };
