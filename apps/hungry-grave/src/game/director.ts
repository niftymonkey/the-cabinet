// The director (ADR 0047, ADR 0056): the pressure it reads, and the cards it
// buys with a section's purse while that reads low. It puts no body on the
// field and calls nothing that does, so the one execution authority stays the
// stage's (ADR 0017).

import { TICK_HZ } from './clock';
import type { SimEvent } from './events';
import type { MobOrigin } from './mobs';
import type { Stream } from './rng';
import type { RunState } from './run';
import type { SignalLock } from './signalLock';
import { isLocked, SIGNAL_FULL, SIGNAL_RAN_LIVE } from './signalLock';
import type { SpawnOrder } from './stage/formations';
import { place } from './stage/formations';
import type { Section } from './stage/stage';
import type { DirectorCard, StageWave } from './stage/waves';
import { CARDS, cardCost } from './stage/waves';
import { HIT_SHRINK, SIZE_FLOOR, SIZE_START } from './tuning';
import type { TuningRecord } from './tuningRecord';

/**
 * The pressure the run is putting on the player (CONTEXT.md Pressure): harm and
 * floor events only, held for an interval and then decaying linearly.
 *
 * It never reads a kill near the grave, because a kill up close is food here
 * and a near-kill term would answer a player doing exactly what the design asks
 * by holding back (ADR 0056).
 *
 * The lock is the third field and it owes no witness version move, because a
 * lock is a figure the run resolves before its first tick and never moves,
 * which is the run's identity in exactly the sense seed and roster[] are, and
 * both of those are excluded from the fold with that reason beside them.
 */
interface PressureSignal {
  readonly value: number;
  // The tick the held interval ends on, after which the value decays.
  readonly heldUntilTick: number;
  /**
   * The figure this run holds the signal at, or SIGNAL_RAN_LIVE. It is
   * resolved by createRun before the first tick and never written again, which
   * is why advancePressure asks only whether it is a lock and never moves it.
   */
  readonly lock: SignalLock;
}

/**
 * What the director holds across a run. It lives on RunState so the witness
 * folds it and a replay rebuilds it, which is ADR 0047's binding constraint.
 *
 * Every field is readonly and the record is replaced wholesale rather than
 * mutated, which is what lets one starting value be shared by every run.
 */
interface DirectorState {
  readonly signal: PressureSignal;
  // What is left of the section's purse, in bodies (ADR 0056).
  readonly purseLeft: number;
  // The tick the quiet interval after an add ends on.
  readonly quietUntilTick: number;
}

/**
 * The director at the top of a run: nothing held and no quiet owed. The purse
 * is a section's to grant, so createRun grants the opening section's over this
 * value rather than this value naming a figure of its own.
 */
const STARTING_DIRECTOR: DirectorState = {
  signal: { value: 0, heldUntilTick: 0, lock: SIGNAL_RAN_LIVE },
  purseLeft: 0,
  quietUntilTick: 0,
};

/**
 * The signal a run starts from, under the lock it resolved. A locked run stands
 * at its own figure from the first tick, because the experiment is the gate and
 * the population read against a held signal rather than a signal that has to
 * climb to one.
 */
const startingSignal = (lock: SignalLock): PressureSignal => ({
  value: isLocked(lock) ? lock : 0,
  heldUntilTick: 0,
  lock,
});

/**
 * What one hit on the grave is worth, and the derivation is ADR 0003's own
 * ladder: a grave that starts at SIZE_START loses HIT_SHRINK per hit until it
 * reaches SIZE_FLOOR, so three hits is the whole walk from a starting grave to
 * the floor and each of them is a third of the scale.
 *
 * It is read off the tuning rows rather than written down, so a retune of the
 * shrink or the floor moves what a hit is worth to the director with it.
 */
const GRAVE_HIT_WEIGHT = HIT_SHRINK / (SIZE_START - SIZE_FLOOR);

/**
 * What one rung of the floor ladder is worth: the whole scale. A floor event
 * only fires on a grave that cannot shrink any further (grave.ts's
 * runFloorLadder), which is the most pressure this signal measures short of the
 * run ending, so one of them alone reads the signal full.
 *
 * The two rungs weigh the same. Which rung fired says how deep the run is in
 * the ladder; it does not say the run is under more or less pressure than the
 * other, and a split between them would be a tuned number rather than a stated
 * one.
 */
const FLOOR_EVENT_WEIGHT = SIGNAL_FULL;

/**
 * What each of the signal's three inputs is worth (ADR 0056). One graveHit is a
 * third of one weaponStripped, because three hits is the walk a starting grave
 * takes to reach the floor and a strip is what the floor pays out.
 *
 * Nothing else is an input, and in particular no kill at any distance: the
 * lookup answers zero for every other event, which is the deliberate absence
 * ADR 0056 rules and Darktide shipped after Vermintide 2's near-kill term read
 * a player mowing a horde as a player in trouble.
 */
const SIGNAL_WEIGHTS: Readonly<Partial<Record<SimEvent['type'], number>>> = {
  graveHit: GRAVE_HIT_WEIGHT,
  scoreBled: FLOOR_EVENT_WEIGHT,
  weaponStripped: FLOOR_EVENT_WEIGHT,
};

/**
 * What counts as reading low, and the director spends only below it (ADR 0056).
 *
 * Two hits' worth. One hit inside the hold is ordinary play, since the grave is
 * a body the player steers through a field of bodies; two is the run pressing,
 * and pressing is what the director is told to stand down for. Stated as a
 * multiple of the hit weight rather than as a decimal, so the sentence a reader
 * gets is "two hits in five seconds" and not "0.67".
 */
const SIGNAL_LOW_THRESHOLD = 2 * GRAVE_HIT_WEIGHT;

/**
 * How long the signal holds at whatever it reached before it starts falling:
 * five seconds, which is Left 4 Dead's shipped constant (the record's section 5
 * item 6 table). Converted through TICK_HZ here, because seconds are what the
 * record states and ticks are what the run is played in.
 */
const SIGNAL_HOLD_TICKS = 5 * TICK_HZ;

/**
 * How long a full signal takes to fall to nothing: thirty seconds, Left 4
 * Dead's other shipped constant (the record's section 5 item 6 table).
 */
const SIGNAL_DECAY_TICKS = 30 * TICK_HZ;

/**
 * The fall, per tick, and it is a fixed quantity rather than a share of what
 * the signal held.
 *
 * The plan states the decay as linear over thirty seconds, which reads as "the
 * held value, straight-lined to zero", and that needs a third field holding the
 * value the fall began from. PressureSignal carries two fields and slice E
 * declared them in the commit that moved WITNESS_VERSION, so a third field is
 * not this slice's to add. A fixed rate, the signal's own full scale over
 * SIGNAL_DECAY_TICKS, needs only the two fields that are there and is the same
 * shipped shape: Left 4 Dead's decay is a rate. A signal at half scale takes
 * fifteen seconds to reach nothing rather than thirty, which is what a rate
 * means and what the source describes.
 */
const SIGNAL_DECAY_PER_TICK = SIGNAL_FULL / SIGNAL_DECAY_TICKS;

/**
 * The shortest this run's director may go between two adds, in ticks.
 *
 * Both ends are rows of the run's own tuning record (ADR 0064) and neither is a
 * constant here, so a cap and the director cannot disagree about the same
 * director: the corpse cap and the mob cap derive from the same row off the
 * same record, which is what the defect commit 2fb33ee5de removed was made of.
 * Stated in seconds on the record and converted here, because a per-tick
 * magnitude is unreadable and a per-second one is the number a sweep moves.
 */
const quietMinTicks = (tuning: TuningRecord): number =>
  tuning.stage.quietIntervalMinimumSeconds * TICK_HZ;

/**
 * The longest, from the same record. The resolver asserts the minimum sits at
 * or below the maximum before either reaches here, so the span the draw below
 * takes is never negative and this module defends nothing (parse at the edge).
 */
const quietMaxTicks = (tuning: TuningRecord): number =>
  tuning.stage.quietIntervalMaximumSeconds * TICK_HZ;

/**
 * What the director bought this tick: the card, where its bodies go, what the
 * purse has left and when it may buy again.
 *
 * It answers with the add rather than performing it, so the spawn stays where
 * every other spawn is (ADR 0017). The placement is drawn here rather than by
 * the executor so that every die the director rolls is rolled in one function,
 * which is what lets one test say no other stream's cursor moved.
 */
interface Spend {
  readonly card: DirectorCard;
  readonly orders: readonly SpawnOrder[];
  readonly purseLeft: number;
  readonly quietUntilTick: number;
  // The signal the gate read low, which is why this spend was permitted.
  readonly signal: number;
}

// What one tick's events add to the signal, over the three inputs and nothing else.
const raisedBy = (events: readonly SimEvent[]): number => {
  return events.reduce(
    (raise, event) => raise + (SIGNAL_WEIGHTS[event.type] ?? 0),
    0,
  );
};

/**
 * The signal after one tick's events, which are the only thing that raises it.
 *
 * A tick carrying a raising event pushes the hold out to this tick plus the
 * whole interval, so a run under sustained harm never starts decaying, which is
 * what a hold is for.
 *
 * It is pure: the signal in, the tick's events and the tick number, a new signal
 * out.
 *
 * A locked signal is returned unmoved whatever the tick's events, which is the
 * lock's whole purpose: the gate and the population are tuned against a held
 * signal. The spend gate downstream still reads the signal's own value and
 * never the lock, so a held run reads exactly as a live run that happened to
 * stand at that figure.
 */
const advancePressure = (
  signal: PressureSignal,
  events: readonly SimEvent[],
  tick: number,
): PressureSignal => {
  if (isLocked(signal.lock)) return signal;
  const raise = raisedBy(events);
  if (raise > 0) {
    return {
      value: Math.min(SIGNAL_FULL, signal.value + raise),
      heldUntilTick: tick + SIGNAL_HOLD_TICKS,
      lock: signal.lock,
    };
  }
  if (tick <= signal.heldUntilTick) return signal;
  return {
    value: Math.max(0, signal.value - SIGNAL_DECAY_PER_TICK),
    heldUntilTick: signal.heldUntilTick,
    lock: signal.lock,
  };
};

/**
 * The run's own signal, moved on by this tick's events. It is the one write
 * this module makes, and it writes the director's own record and never the
 * field.
 */
const advanceDirectorSignal = (
  state: RunState,
  events: readonly SimEvent[],
): void => {
  state.director = {
    ...state.director,
    signal: advancePressure(state.director.signal, events, state.tick),
  };
};

/**
 * A body the section's ceilings count: a shaped group's, authored or directed.
 * A standing wave's arrivals are the floor rather than a shaped group (the
 * record's section 5 item 6), so they sit outside every ceiling and the ceiling
 * bounds only what stands above the floor.
 */
const SHAPED_ORIGINS: readonly MobOrigin[] = ['wave', 'directed'];

const liveShapedBodies = (state: RunState): number => {
  return state.mobs.filter(
    (mob) => mob.alive && SHAPED_ORIGINS.includes(mob.from),
  ).length;
};

/**
 * Whether the section's own ceilings are already met, so the director may not
 * add over them (ADR 0047, ADR 0050).
 *
 * The formation count saturates. A body carries the mark of what put it on the
 * field and not which group it arrived in, so shaped bodies alive mean at least
 * one live formation and the count cannot tell one from two. Reading that as
 * the ceiling met is the strict answer, and it is exact against the one
 * formation ceiling the table states, the Procession's ceiling of one.
 */
const ceilingMet = (state: RunState, section: Section): boolean => {
  const shaped = liveShapedBodies(state);
  if (section.liveFormationCeiling !== null && shaped > 0) return true;
  if (section.liveBodyCeiling === null) return false;
  return shaped >= section.liveBodyCeiling;
};

/**
 * The wave whose span this tick sits in: the last one the section's cursor has
 * fired, of any kind. A wave's span runs from its own fire until the next wave
 * fires, so the permission cell the director reads is that wave's.
 *
 * Null before a section's first wave has fired, which is a span that does not
 * exist yet rather than one that permits.
 */
const spanWave = (state: RunState, section: Section): StageWave | null => {
  return section.waves[state.stage.firedWaves - 1] ?? null;
};

/**
 * What the director spends this tick, or nothing (ADR 0056).
 *
 * The gate: the section's permission cell, then the signal, then the quiet
 * interval, then a purse with something in it the cheapest card fits inside,
 * then the section's own ceiling, then the permission cell of the wave whose
 * span the card would land in. Every one of them reads off data and none of
 * them names a section, a boss or a set piece, which is ADR 0047's own
 * requirement.
 *
 * The two scalar refusals stand ahead of the affordable list rather than in the
 * order a reader would tell them, because the quiet interval alone runs four to
 * eight seconds and a list built to be discarded on the next line is a list
 * built on well over ninety per cent of a directed section's ticks. No refusal
 * can change another's answer: each reads a different field and none of them
 * writes.
 *
 * A tick it refuses draws nothing at all. The draws sit past the last refusal
 * on purpose: a stream advanced on a gate it never passed rebuilds #108's
 * defect inside the director.
 */
const directorSpend = (
  state: RunState,
  section: Section,
  stream: Stream,
): Spend | null => {
  if (!section.directed) return null;
  if (section.purse === null) return null;
  if (state.director.signal.value >= SIGNAL_LOW_THRESHOLD) return null;
  if (state.tick < state.director.quietUntilTick) return null;
  const affordable = CARDS.filter(
    (card) => cardCost(card) <= state.director.purseLeft,
  );
  if (affordable.length === 0) return null;
  if (ceilingMet(state, section)) return null;
  const span = spanWave(state, section);
  if (span === null || !span.directed) return null;

  const card = affordable[stream.nextInt(affordable.length)];
  if (card === undefined) return null;
  const orders = place(card.formation, card.count, stream);
  const floor = quietMinTicks(state.conditions.tuning);
  const ceiling = quietMaxTicks(state.conditions.tuning);
  const quiet = floor + stream.nextInt(ceiling - floor + 1);
  return {
    card,
    orders,
    purseLeft: state.director.purseLeft - cardCost(card),
    quietUntilTick: state.tick + quiet,
    signal: state.director.signal.value,
  };
};

export {
  STARTING_DIRECTOR,
  startingSignal,
  advancePressure,
  advanceDirectorSignal,
  directorSpend,
  GRAVE_HIT_WEIGHT,
  FLOOR_EVENT_WEIGHT,
  SIGNAL_LOW_THRESHOLD,
  SIGNAL_HOLD_TICKS,
  SIGNAL_DECAY_TICKS,
  SIGNAL_DECAY_PER_TICK,
  quietMinTicks,
  quietMaxTicks,
};
export type { DirectorState, PressureSignal, Spend };
