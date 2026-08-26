import { fireBelch } from './belch';
import type { TickCommand } from './command';
import {
  advanceCorpses,
  asSwallowable,
  corpseHitbox,
  cullCorpses,
} from './corpses';
import { creditKill } from './drops';
import type { SimEvent } from './events';
import { ageGrave, graveHitbox, hitGrave, moveGrave } from './grave';
import { advanceBell } from './lines/bell';
import { advanceHeadstones } from './lines/headstones';
import { advanceStream } from './lines/soulStream';
import { advanceWisps } from './lines/wisps';
import {
  advanceMobs,
  cullMobs,
  cullShots,
  mobHitbox,
  resolveStorm,
  shotHitbox,
} from './mobs';
import { overlaps } from './overlap';
import type { RunState } from './run';
import { advanceStage } from './stage/stage';
import { swallow } from './swallow';
import { SCROLL_SPEED } from './tuning';

/**
 * The constant downward drift of everything on the field. Mob fire does not
 * carry it: an aimed shot that then drifts downward is not aimed.
 *
 * A corpse has no velocity of its own, so this is the only thing that moves it,
 * and that is what makes ADR 0004's coupling true by construction.
 */
const scrollField = (state: RunState): void => {
  for (const mob of state.mobs) {
    if (mob.alive) mob.y += SCROLL_SPEED;
  }
  for (const corpse of state.corpses) {
    if (corpse.alive) corpse.y += SCROLL_SPEED;
  }
};

/**
 * Mob fire meeting the grave. A shot overlapping the grave is consumed whether
 * or not it lands, an invulnerable grave included: left on the field it keeps
 * overlapping and lands again the tick the window expires, turning one shot
 * into two hits with nothing on screen to explain the second.
 */
const resolveMobFire = (state: RunState, events: SimEvent[]): void => {
  const box = graveHitbox(state.grave);
  for (const shot of state.mobFire) {
    if (!shot.alive) continue;
    if (!overlaps(shotHitbox(shot), box)) continue;
    shot.alive = false;
    events.push(...hitGrave(state, shot.emitter));
  }
};

/**
 * Mob bodies meeting the grave. The mob is not consumed, because live mobs are
 * never food and contact never kills a mob (ADR 0005).
 */
const resolveMobContact = (state: RunState, events: SimEvent[]): void => {
  const box = graveHitbox(state.grave);
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    if (!overlaps(mobHitbox(mob), box)) continue;
    events.push(...hitGrave(state, 'contact'));
  }
};

// Food meeting the grave. The grave passes under it and it falls in.
const resolveSwallows = (state: RunState, events: SimEvent[]): void => {
  const box = graveHitbox(state.grave);
  for (const corpse of state.corpses) {
    if (!corpse.alive) continue;
    if (!overlaps(corpseHitbox(corpse), box)) continue;
    corpse.alive = false;
    events.push(...swallow(state, asSwallowable(corpse)));
  }
};

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
const resolveOverlaps = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  resolveMobFire(state, events);
  resolveMobContact(state, events);
  resolveSwallows(state, events);
  return events;
};

/**
 * The weapon lines' own tick, in a stated order so the same seed fires the same
 * sequence. It runs after mob motion and before overlap detection, so a skull or
 * a wisp launched this tick does not also move this tick, which is the rule mob
 * fire already has and what puts a skull at the mouth for one tick.
 */
const advanceLines = (state: RunState): SimEvent[] => {
  const events = advanceStream(state);
  events.push(...advanceHeadstones(state));
  events.push(...advanceWisps(state));
  events.push(...advanceBell(state));
  return events;
};

/**
 * The deaths phase: the storm meeting the mobs, and every kill the tick made
 * counted against the price of the next drop.
 *
 * It walks the tick's whole accumulated list of kills rather than only the ones
 * the overlap pass returned, because the bell resolves two phases earlier and a
 * kill is a kill: a price that depended on which weapon landed the last point of
 * damage would move a drop boundary for a reason no player could read.
 *
 * One second-order consequence, stated here so nobody reads it later as a bug: a
 * bell kill's corpse exists before resolveSwallows runs, so it is swallowable
 * one tick sooner than a kill from the overlap pass.
 */
const resolveDeaths = (
  state: RunState,
  earlier: readonly SimEvent[],
): SimEvent[] => {
  const struck = resolveStorm(state);
  const paid: SimEvent[] = [];
  for (const event of [...earlier, ...struck]) {
    if (event.type !== 'mobKilled') continue;
    paid.push(...creditKill(state, event.x, event.y));
  }
  return [...struck, ...paid];
};

/**
 * The sim seam: one fixed tick of the game's rules (tracer plan section 3). It
 * hides the order of a tick and holds no rules of its own; every rule belongs
 * to the module that owns it. Run state is mutated in place and the tick's
 * events are returned, because at storm density pooled entities mutated in
 * place are the right answer.
 *
 * The order is scroll, the move command, the belch, spawns, mob motion and fire,
 * the weapon lines, overlap detection, deaths, decay, culling, then the grave's
 * own tick and the counters.
 *
 * The belch runs before spawns and before every overlap. A bomb pressed on the
 * frame a shot would land has to save the player, or the button is a lie at the
 * only moment it matters; running it after resolveOverlaps would cancel the shot
 * on the tick after it hit.
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
const step = (state: RunState, command: TickCommand): SimEvent[] => {
  const events: SimEvent[] = [];
  scrollField(state);
  moveGrave(state.grave, command.move);
  if (command.belch) events.push(...fireBelch(state));
  events.push(...advanceStage(state));
  events.push(...advanceMobs(state));
  events.push(...advanceLines(state));
  events.push(...resolveOverlaps(state));
  events.push(...resolveDeaths(state, events));
  events.push(...advanceCorpses(state));
  cullMobs(state);
  cullShots(state);
  events.push(...cullCorpses(state));
  ageGrave(state.grave);
  state.tick += 1;
  state.stage.phaseTick += 1;
  return events;
};

export { step };
