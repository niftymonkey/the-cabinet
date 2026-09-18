// Where every rung the floor ladder took ended up, and how long it stood there.

import type { SimEvent } from '../../game/events';
import type { WeaponLine } from '../../game/lines/roster';
import type { RunState } from '../../game/run';

/**
 * Every rung that fell onto the field, accounted for (ADR 0055, design record
 * R6).
 *
 * The denominator is the rungs that reached the field and never the rungs the
 * ladder took. `spawnFallenRung` emits `rungFell` only once it holds a slot, so
 * a rung the corpse cap refused reports nothing at all and `weaponStripped` is
 * what says the level went. There is therefore no refused arm here, and
 * `tuning.damageTaken.linesStripped` beside this is what a reader subtracts
 * from to find one.
 *
 * A fallen rung reaches exactly one of three ends. It never decays, so the dirt
 * never takes it; nothing in the storm moves it and the cap policy evicts
 * nothing; and a run's stop leaves the rest standing. The three therefore add
 * up to the rungs that fell, and that sum is the ledger's own check on itself.
 *
 * The claim is that no fallen rung leaves the ledger unobserved mid-run, and
 * nothing stronger than that.
 */
interface FallenRungLedger {
  readonly fell: number;
  // Swallowed by the dive, whether or not the line had climbed back to its cap.
  readonly caught: number;
  // Off the bottom edge with the rung still in it.
  readonly lost: number;
  readonly onFieldAtStop: number;
  /**
   * Ticks from a rung's fall to its catch or its loss, one entry per rung that
   * fell, in the order they fell.
   *
   * A rung still standing when the run stopped carries absence rather than a
   * zero, on `tuning.arrivals.perSecond`'s own terms: it has no span yet, and a
   * zero there would read as a rung that left on the tick it arrived.
   */
  readonly ticksOnField: readonly (number | null)[];
}

// One fallen rung, from the tick it landed to the tick it left.
interface FallenRungSpan {
  readonly line: WeaponLine;
  readonly fellAt: number;
  endedAt: number | null;
}

interface FallenRungLedgerAcc {
  fell: number;
  caught: number;
  lost: number;
  // Every fallen rung in the order it landed, by the entity id its body took.
  readonly spans: Map<number, FallenRungSpan>;
  // The fallen rungs that were on the field when this reading last looked.
  readonly bodiesOnField: Set<number>;
}

const createFallenRungLedger = (): FallenRungLedgerAcc => ({
  fell: 0,
  caught: 0,
  lost: 0,
  spans: new Map(),
  bodiesOnField: new Set(),
});

/**
 * The fallen rungs standing on the field, each under the entity id its body
 * took and the line it came off.
 *
 * A fallen rung with no line is a value this instrument's own sim produced, so
 * a missing one is a bug and fails loudly here exactly as it does in
 * `catchRung`, rather than being dropped out of a denominator that would then
 * silently stop adding up.
 */
const rungsStanding = (state: RunState): Map<number, WeaponLine> => {
  const standing = new Map<number, WeaponLine>();
  for (const corpse of state.corpses) {
    if (!corpse.alive || corpse.kind !== 'fallenRung') continue;
    if (corpse.line === undefined) {
      throw new Error(`a fallen rung stands on the field carrying no line`);
    }
    standing.set(corpse.id, corpse.line);
  }
  return standing;
};

/**
 * The rungs that arrived this tick, counted off the events and identified off
 * the field.
 *
 * The count comes from `rungFell`, which is the ledger's denominator, and the
 * identity comes from the corpse pool, because the event carries the line and
 * the place and no id at all. The two agree by construction: the event fires
 * from inside the spawn that claimed the slot. The arrivals are taken in id
 * order rather than in pool order, because the pool hands out whichever slot
 * fell free first and the ids are what the run issued in sequence.
 */
const observeFalls = (
  acc: FallenRungLedgerAcc,
  tick: number,
  events: readonly SimEvent[],
  standing: ReadonlyMap<number, WeaponLine>,
): void => {
  for (const event of events) {
    if (event.type === 'rungFell') acc.fell += 1;
  }
  const arrived = [...standing.keys()]
    .filter((id) => !acc.spans.has(id))
    .sort((one, other) => one - other);
  for (const id of arrived) {
    const line = standing.get(id);
    if (line === undefined) continue;
    acc.spans.set(id, { line, fellAt: tick, endedAt: null });
  }
};

/**
 * The lines a catch accounted for on this tick, one entry per body the dive
 * took off the field.
 *
 * A catch names its line and a loss names none, so a rung that left is read as
 * caught only while a catch of its own line is unspent. Two rungs of one line
 * leaving on one tick are matched oldest first, which is `linesTakenIn`'s own
 * rule in the power-up ledger and is unambiguous for the same reason: what the
 * ledger counts is how many of that line ended each way, never which body was
 * which.
 */
const linesCaughtIn = (events: readonly SimEvent[]): WeaponLine[] => {
  const caught: WeaponLine[] = [];
  for (const event of events) {
    if (event.type === 'rungCaught') caught.push(event.line);
  }
  return caught;
};

const observeDepartures = (
  acc: FallenRungLedgerAcc,
  tick: number,
  events: readonly SimEvent[],
  standing: ReadonlyMap<number, WeaponLine>,
): void => {
  const accountedFor = linesCaughtIn(events);
  for (const id of acc.bodiesOnField) {
    if (standing.has(id)) continue;
    const span = acc.spans.get(id);
    if (span === undefined) continue;
    span.endedAt = tick;
    const at = accountedFor.indexOf(span.line);
    if (at >= 0) {
      accountedFor.splice(at, 1);
      acc.caught += 1;
      continue;
    }
    acc.lost += 1;
  }
};

const observeFallenRungLedger = (
  acc: FallenRungLedgerAcc,
  tick: number,
  events: readonly SimEvent[],
  state: RunState,
): void => {
  const standing = rungsStanding(state);
  observeDepartures(acc, tick, events, standing);
  observeFalls(acc, tick, events, standing);
  acc.bodiesOnField.clear();
  for (const id of standing.keys()) acc.bodiesOnField.add(id);
};

const fallenRungLedgerOf = (acc: FallenRungLedgerAcc): FallenRungLedger => ({
  fell: acc.fell,
  caught: acc.caught,
  lost: acc.lost,
  onFieldAtStop: acc.bodiesOnField.size,
  ticksOnField: [...acc.spans.values()].map((span) =>
    span.endedAt === null ? null : span.endedAt - span.fellAt,
  ),
});

/**
 * The spans of the rungs that ended, with the ones still standing left out.
 *
 * It is this reading's own, declared beside the list it flattens, so reducing
 * the spans is one decision in one place rather than a shape a report
 * recognised, and an absent span is dropped rather than counted as a zero.
 */
const endedSpans = (ledger: FallenRungLedger): readonly number[] => {
  const spans: number[] = [];
  for (const ticks of ledger.ticksOnField) {
    if (ticks !== null) spans.push(ticks);
  }
  return spans;
};

export {
  createFallenRungLedger,
  observeFallenRungLedger,
  fallenRungLedgerOf,
  endedSpans,
};
export type { FallenRungLedger, FallenRungLedgerAcc };
