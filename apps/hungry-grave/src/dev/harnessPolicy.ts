// The hand the harness plays with, under one configuration (ADR 0053).

import type { TickCommand } from '../game/command';
import type { Corpse } from '../game/corpses';
import type { Stream } from '../game/rng';
import { stream } from '../game/rng';
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

// The name the harness's own stream is made under, off the run's seed (ADR 0053).
const HAND_STREAM = 'hand';

// The denominator the lapse rate is a numerator of, so a row reads as failures in a thousand.
const DECISIONS_PER_RATE = 1000;

/** What the hand does this tick with its attention on the game. */
const decided = (
  state: RunState,
  configuration: Configuration,
): TickCommand => ({
  move: bestMoveToward(
    state,
    pointWanted(state),
    configuration.enoughClearance,
    configuration.lookaheadSamples,
  ),
  belch: belchWanted(state, configuration),
});

/**
 * How many ticks the command just decided is held stale: none unless attention
 * failed, and a depth drawn uniformly from 0 to the row's bound when it did.
 *
 * The order is the rate first and the depth second, and a rate of zero rolls
 * nothing at all, so the sharp corner touches the stream not at all. Two things
 * rest on that: the determinism test runs under the sloppy corner precisely
 * because the sharp corner's stream is untouched, and every figure already
 * measured under the sharp corner stays comparable with everything measured
 * after the knobs landed.
 */
const lapseDepth = (hand: Stream, configuration: Configuration): number => {
  if (configuration.lapsePerMille === 0) return 0;
  const attentionHeld =
    hand.nextInt(DECISIONS_PER_RATE) >= configuration.lapsePerMille;
  if (attentionHeld) return 0;
  return hand.nextInt(configuration.lapseBound + 1);
};

/**
 * The hand the harness plays with, under one configuration.
 *
 * It is a factory rather than a bare Policy because it holds two things the six
 * policies in bot.ts do not: the command it is repeating, and the stream the
 * repeat length is drawn from.
 *
 * The stream is made here and never inside RunState, so the witness never
 * learns the bot exists and WITNESS_VERSION stays 6 (ADR 0019). The seed is the
 * run's own, handed in rather than read off the state, which is what makes one
 * seed under one configuration one run (ADR 0053).
 *
 * The dexterity error is a lapse of attention and not a standing slowness. On
 * nearly every decision attention holds and the hand acts on the tick, exactly
 * as the sharp corner does; when it fails, the hand keeps the command it
 * already had and the field moves under it.
 */
const harnessPolicy = (configuration: Configuration, seed: number): Policy => {
  const hand = stream(seed, HAND_STREAM);
  let holding = 0;
  let held: TickCommand | null = null;
  return (state) => {
    if (held !== null && holding > 0) {
      holding -= 1;
      return held;
    }
    const command = decided(state, configuration);
    holding = lapseDepth(hand, configuration);
    held = command;
    return command;
  };
};

export { harnessPolicy, HAND_STREAM };
