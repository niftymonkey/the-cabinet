import { fireBelch } from './belch';
import { advanceBoss } from './bosses/chunks';
import type { TickCommand } from './command';
import type { Corpse } from './corpses';
import {
  advanceCorpses,
  asSwallowable,
  corpseHitbox,
  cullCorpses,
} from './corpses';
import type { SimEvent } from './events';
import { ageGrave, graveHitbox, hitGrave, moveGrave } from './grave';
import { advanceBell } from './lines/bell';
import { advanceStream } from './lines/skullStream';
import { advanceTerritory } from './lines/territory';
import { advanceWisps } from './lines/wisps';
import { cullShots, shotHitbox } from './mobFire';
import { advanceMobs, canTouchGrave, cullMobs, mobHitbox } from './mobs';
import {
  chooseOfferBody,
  loseOffer,
  openBankedOffer,
  openOffer,
} from './offer';
import { overlaps } from './overlap';
import type { RunState } from './run';
import { clearRefusals } from './run';
import { advanceSetPiece } from './stage/setPiece';
import { advanceStage, bankOpensNow, winStage } from './stage/stage';
import { resolveStorm } from './storm';
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
 * never food and contact never kills a mob (ADR 0037).
 *
 * A body that appeared inside the field waits out its arriving beat before it
 * can touch, which is mobs.ts's rule and not this pass's: the pour puts bodies
 * in the middle of the field, and one that could touch on the tick it
 * materialised would be a hit with nothing to see coming.
 */
const resolveMobContact = (state: RunState, events: SimEvent[]): void => {
  const box = graveHitbox(state.grave);
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    if (!canTouchGrave(mob)) continue;
    if (!overlaps(mobHitbox(mob), box)) continue;
    events.push(...hitGrave(state, 'contact'));
  }
};

/**
 * One piece of food the grave is under, remembered with the id it had.
 *
 * The id is not decoration. Taking an option body vanishes its siblings and
 * opens the offer behind it in the bank, whose bodies claim the very slots
 * those siblings just freed, so a slot that is alive again by the time the
 * walk reaches it is a different body and was never covered at all.
 */
interface CoveredFood {
  readonly body: Corpse;
  readonly id: number;
}

/**
 * Every piece of food the grave is under as this pass begins, read once so a
 * swallow that grows and shoves the grave cannot change what the pass sees.
 */
const coveredFood = (state: RunState): CoveredFood[] => {
  const box = graveHitbox(state.grave);
  return state.corpses
    .filter((corpse) => corpse.alive && overlaps(corpseHitbox(corpse), box))
    .map((body) => ({ body, id: body.id }));
};

const swallowFood = (
  state: RunState,
  corpse: Corpse,
  events: SimEvent[],
): void => {
  corpse.alive = false;
  events.push(...swallow(state, asSwallowable(corpse)));
};

/**
 * Food meeting the grave. The grave passes under it and it falls in.
 *
 * The offer's own body goes first, and that order is the rule rather than a
 * detail: a grave covering two option bodies takes exactly one, and the take
 * is what vanishes the siblings, so the chosen body has to be swallowed before
 * the walk reaches the ones it takes off the field (ADR 0034).
 */
const resolveSwallows = (state: RunState, events: SimEvent[]): void => {
  const covered = coveredFood(state);
  const taken = chooseOfferBody(
    state,
    covered.map((each) => each.body),
  );
  if (taken !== null) swallowFood(state, taken, events);
  for (const { body, id } of covered) {
    if (!body.alive || body.id !== id) continue;
    swallowFood(state, body, events);
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
  events.push(...advanceTerritory(state));
  events.push(...advanceWisps(state));
  events.push(...advanceBell(state));
  return events;
};

/**
 * The deaths phase: the storm meeting the mobs, and the offer every carrier
 * the tick killed leaves where it died (ADR 0002, ADR 0034).
 *
 * It walks the tick's whole accumulated list of kills rather than only the ones
 * the overlap pass returned, because the bell resolves two phases earlier and a
 * carrier is a carrier whatever killed it: power that arrived only when the
 * right weapon landed the last point of damage would meter itself differently
 * for a reason no player could read.
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
    if (event.type !== 'mobKilled' || !event.carried) continue;
    paid.push(...openOffer(state, event.x, event.y));
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
 * the boss's own tick, the set piece's own tick, the weapon lines, the bank's
 * own tick, overlap detection, deaths, the stage's own ending, decay, culling,
 * the offer's own loss, then the grave's own tick and the counters.
 *
 * The boss ticks with the mobs and before the lines, because its pattern is
 * fire on the field and a shot fired this tick must not also fly this tick,
 * which is the rule mob fire already has. The set piece ticks beside it and
 * after it, so a body it pours arrives on the field the same way a boss's own
 * add does.
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
  // First, so what a cap refuses is this tick's own count when the harness
  // reads it at the end of the tick (ADR 0056).
  clearRefusals(state);
  scrollField(state);
  moveGrave(state.grave, command.move);
  if (command.belch) events.push(...fireBelch(state));
  events.push(...advanceStage(state));
  events.push(...advanceMobs(state));
  events.push(...advanceBoss(state));
  events.push(...advanceSetPiece(state));
  events.push(...advanceLines(state));
  events.push(...openBankedOffer(state, bankOpensNow(state)));
  events.push(...resolveOverlaps(state));
  events.push(...resolveDeaths(state, events));
  // Straight after the deaths, because the deaths phase is the last of the
  // tick that can empty a boss and the ending is that death's own (ADR 0007).
  events.push(...winStage(state, events));
  events.push(...advanceCorpses(state));
  events.push(...cullMobs(state));
  cullShots(state);
  events.push(...cullCorpses(state));
  // After the cull, because an offer is lost on the tick its last body leaves
  // the field and the cull is what takes it (ADR 0034).
  events.push(...loseOffer(state));
  ageGrave(state.grave);
  state.tick += 1;
  state.stage.phaseTick += 1;
  return events;
};

export { step };
