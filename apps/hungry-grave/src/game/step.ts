import {
  advanceCorpses,
  asSwallowable,
  corpseHitbox,
  cullCorpses,
} from "./corpses";
import type { SimEvent } from "./events";
import { ageGrave, graveHitbox, hitGrave, moveGrave } from "./grave";
import {
  advanceMobs,
  cullMobs,
  cullShots,
  mobHitbox,
  shotHitbox,
} from "./mobs";
import { overlaps } from "./overlap";
import type { MoveCommand, RunState } from "./run";
import { advanceStage } from "./stage/stage";
import { swallow } from "./swallow";
import { SCROLL_SPEED } from "./tuning";

/**
 * The constant downward drift of everything on the field. Mob fire does not
 * carry it: an aimed shot that then drifts downward is not aimed.
 *
 * A corpse has no velocity of its own, so this is the only thing that moves it,
 * and that is what makes ADR 0004's coupling true by construction.
 */
function scrollField(state: RunState): void {
  for (const mob of state.mobs) {
    if (mob.alive) mob.y += SCROLL_SPEED;
  }
  for (const corpse of state.corpses) {
    if (corpse.alive) corpse.y += SCROLL_SPEED;
  }
}

/**
 * Mob fire meeting the grave. A shot overlapping the grave is consumed whether
 * or not it lands, an invulnerable grave included: left on the field it keeps
 * overlapping and lands again the tick the window expires, turning one shot
 * into two hits with nothing on screen to explain the second.
 */
function resolveMobFire(state: RunState, events: SimEvent[]): void {
  const box = graveHitbox(state.grave);
  for (const shot of state.mobFire) {
    if (!shot.alive) continue;
    if (!overlaps(shotHitbox(shot), box)) continue;
    shot.alive = false;
    events.push(...hitGrave(state));
  }
}

/**
 * Mob bodies meeting the grave. The mob is not consumed, because live mobs are
 * never food and contact never kills a mob (ADR 0005).
 */
function resolveMobContact(state: RunState, events: SimEvent[]): void {
  const box = graveHitbox(state.grave);
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    if (!overlaps(mobHitbox(mob), box)) continue;
    events.push(...hitGrave(state));
  }
}

/** Food meeting the grave. The grave passes under it and it falls in. */
function resolveSwallows(state: RunState, events: SimEvent[]): void {
  const box = graveHitbox(state.grave);
  for (const corpse of state.corpses) {
    if (!corpse.alive) continue;
    if (!overlaps(corpseHitbox(corpse), box)) continue;
    corpse.alive = false;
    events.push(...swallow(state, asSwallowable(corpse)));
  }
}

/**
 * The three overlap pairs, always in this order, so the same seed produces the
 * same events in the same order. Each consequence goes to the module that owns
 * the rule: hitGrave for the first two, swallow for the third.
 *
 * Each pass tests against the grave as it stood when the pass began, because a
 * hit shrinks it and a swallow grows and shoves it. Testing against a grave
 * that moved mid-pass would let a corpse the grave was plainly under slip out
 * from under it because an earlier corpse in the same tick made it bigger.
 */
function resolveOverlaps(state: RunState): SimEvent[] {
  const events: SimEvent[] = [];
  resolveMobFire(state, events);
  resolveMobContact(state, events);
  resolveSwallows(state, events);
  return events;
}

/**
 * The sim seam: one fixed tick of the game's rules (tracer plan section 3). It
 * hides the order of a tick and holds no rules of its own; every rule belongs
 * to the module that owns it. Run state is mutated in place and the tick's
 * events are returned, because at storm density pooled entities mutated in
 * place are the right answer.
 *
 * The order is scroll, the move command, spawns, motion, overlap detection,
 * deaths, decay, culling, then the grave's own tick and the counters.
 *
 * Deaths is quiet in this dispatch rather than unfinished: nothing kills a mob,
 * so the phase exists as the place damageMob's results are collected and the
 * test rig is its only caller.
 *
 * Overlap before decay is deliberate. A corpse at exactly zero freshness that
 * the grave is under this tick is swallowed rather than taken under, so greed
 * that arrives on the last tick is rewarded, which is the direction ADR 0004
 * already leans by giving freshness a payout floor instead of a zero.
 *
 * The grave's own tick comes last. ageGrave before overlap detection expires
 * the invulnerability window a tick early, and dropping it means the window
 * never expires at all.
 */
export function step(state: RunState, command: MoveCommand): SimEvent[] {
  const events: SimEvent[] = [];
  scrollField(state);
  moveGrave(state.grave, command);
  events.push(...advanceStage(state));
  events.push(...advanceMobs(state));
  events.push(...resolveOverlaps(state));
  events.push(...advanceCorpses(state));
  cullMobs(state);
  cullShots(state);
  events.push(...cullCorpses(state));
  ageGrave(state.grave);
  state.tick += 1;
  state.stage.phaseTick += 1;
  return events;
}
