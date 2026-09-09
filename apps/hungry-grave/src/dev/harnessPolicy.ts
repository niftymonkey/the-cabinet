// The hand the harness plays with, under one configuration (ADR 0053).

import type { Corpse } from '../game/corpses';
import type { RunState } from '../game/run';
import { RESERVOIR_CAPACITY } from '../game/tuning';
import { bestMoveToward, HOME, nearestFood } from './bot';
import type { Policy } from './bot';
import type { Configuration } from './configurations';

/**
 * Which of the live offer's bodies the hand walks at: the one whose centre is
 * nearest the grave's, ties broken by the lower entity id.
 *
 * It is chooseOfferBody's own rule (src/game/offer.ts) written again rather
 * than called, because that function takes the bodies the grave already covers
 * and the hand needs the ones it could reach. The two must not drift, and the
 * spec test that plays a take against this choice is what holds them together.
 */
const offerBodyWanted = (state: RunState): Corpse | null => {
  const offer = state.offer;
  if (offer === null) return null;
  let nearest: Corpse | null = null;
  let best = Infinity;
  for (const body of state.corpses) {
    if (!body.alive || !offer.bodyIds.includes(body.id)) continue;
    const gap = squaredGap(state, body);
    if (nearest !== null && gap > best) continue;
    if (nearest !== null && gap === best && body.id > nearest.id) continue;
    nearest = body;
    best = gap;
  }
  return nearest;
};

// How far a body's centre sits from the grave's, squared, which orders the same way the distance does.
const squaredGap = (state: RunState, body: Corpse): number => {
  const dx = body.x - state.grave.x;
  const dy = body.y - state.grave.y;
  return dx * dx + dy * dy;
};

/**
 * Where the hand wants to be this tick, in three clauses: the live offer's
 * nearest body, else the nearest food, else the starting mark.
 *
 * The offer outranks an ordinary corpse because a drop never decays and a
 * corpse does, so a hand that preferred the nearer body would take offers by
 * accident and sit at the birthright.
 *
 * It reads positions and entity ids and never state.levels, which is why this
 * module can name no weapon line and why a fifth line needs no edit here.
 */
const pointWanted = (state: RunState): { x: number; y: number } => {
  const body = offerBodyWanted(state);
  if (body !== null) return { x: body.x, y: body.y };
  return nearestFood(state) ?? HOME;
};

// Live shots on the field, which is the half of the belch rule the row prices.
const liveShots = (state: RunState): number =>
  state.mobFire.reduce((count, shot) => count + (shot.alive ? 1 : 0), 0);

/**
 * Whether to spend the reservoir: full, and a curtain worth cancelling.
 *
 * It is belchingPolicy's rule with the threshold as a row, and neither knob
 * touches it, so a sloppy hand belches on exactly a sharp hand's condition.
 * What varies across the configurations is the play around the belch, because
 * a sloppy hand arrives at a fight with a worse build.
 */
const belchWanted = (
  state: RunState,
  configuration: Configuration,
): boolean => {
  if (state.reservoir < RESERVOIR_CAPACITY) return false;
  return liveShots(state) >= configuration.belchWorthIt;
};

/**
 * The hand the harness plays with, under one configuration.
 *
 * It is a factory rather than a bare Policy because slice 5's hold gives it
 * two things the six policies in bot.ts do not have: the command it is
 * repeating, and the stream the repeat length is drawn from. Here it holds
 * neither, so it is still a pure function of run state, and the sharp corner
 * it ships under draws nothing at all.
 *
 * The seed arrives with the hold at slice 5, not before: a seed parameter
 * nothing reads is a typecheck failure under noUnusedParameters.
 */
const harnessPolicy = (configuration: Configuration): Policy => {
  return (state) => ({
    move: bestMoveToward(
      state,
      pointWanted(state),
      configuration.enoughClearance,
      configuration.lookaheadSamples,
    ),
    belch: belchWanted(state, configuration),
  });
};

export { harnessPolicy };
