// Where every drop ended up.

import type { SimEvent } from '../../game/events';
import type { WeaponLine } from '../../game/lines/roster';
import type { RunState } from '../../game/run';
import type { NumberRecord } from '../numbersByName';

/**
 * Every option body that landed on the field, accounted for.
 *
 * A body reaches exactly one of four ends. It never expires and it is never
 * evicted: it does not decay, and the cap policy skips anything that does not,
 * refusing the spawn instead, so a refused spawn never reaches the denominator
 * either. The fourth end arrived with the offer (ADR 0034): the two siblings of
 * a taken body are neither swallowed nor lost, they vanish on the tick the take
 * lands, and without them the counts stop adding up to spawned. The four
 * terminal counts therefore add up to spawned, and that sum is the ledger's own
 * check on itself.
 *
 * The claim is that no body leaves the ledger unobserved mid-run, and nothing
 * stronger than that.
 */
interface DropLedger {
  readonly spawned: number;
  readonly swallowed: number;
  // Vanished because a sibling of the same offer went in (ADR 0034).
  readonly passed: number;
  // Off the bottom edge with its option still in it.
  readonly lost: number;
  readonly onFieldAtStop: number;
  /**
   * The same five counts under the line each body carried.
   *
   * A body carrying no option at all is in the totals and under no line: that
   * is the nothing-offerable branch and a maxed run's carrier, so the per-line
   * counts sum to the totals only on a run that never opened one. The four
   * terminal counts still add up to spawned for each line on its own.
   *
   * A line the run never offered has no entry, rather than an entry of zeroes:
   * a line that stood no body and a line whose bodies all scrolled away are
   * different readings, and the run's own roster is what says which lines
   * could have appeared.
   */
  readonly byLine: Readonly<Partial<Record<WeaponLine, DropLedgerByLine>>>;
}

// The five ends for one weapon line (ADR 0034, path-draft.md:21).
interface DropLedgerByLine {
  readonly spawned: number;
  readonly swallowed: number;
  readonly passed: number;
  readonly lost: number;
  readonly onFieldAtStop: number;
}

interface LineCounts {
  spawned: number;
  swallowed: number;
  passed: number;
  lost: number;
  onFieldAtStop: number;
}

interface DropLedgerAcc {
  spawned: number;
  swallowed: number;
  passed: number;
  lost: number;
  onFieldAtStop: number;
  // Every option body's line, by the id its spawn reported.
  readonly lineOfBody: Map<number, WeaponLine>;
  // The option bodies that were on the field when this reading last looked.
  readonly bodiesOnField: Set<number>;
  readonly byLine: Map<WeaponLine, LineCounts>;
}

const createDropLedger = (): DropLedgerAcc => ({
  spawned: 0,
  swallowed: 0,
  passed: 0,
  lost: 0,
  onFieldAtStop: 0,
  lineOfBody: new Map(),
  bodiesOnField: new Set(),
  byLine: new Map(),
});

const countsFor = (acc: DropLedgerAcc, line: WeaponLine): LineCounts => {
  const existing = acc.byLine.get(line);
  if (existing !== undefined) return existing;
  const fresh: LineCounts = {
    spawned: 0,
    swallowed: 0,
    passed: 0,
    lost: 0,
    onFieldAtStop: 0,
  };
  acc.byLine.set(line, fresh);
  return fresh;
};

const liveDrops = (state: RunState): number =>
  state.corpses.reduce(
    (count, corpse) => count + (corpse.alive && corpse.kind === 'drop' ? 1 : 0),
    0,
  );

// The option bodies standing on the field, by the entity id each was spawned under.
const bodiesStanding = (state: RunState): Set<number> => {
  const standing = new Set<number>();
  for (const corpse of state.corpses) {
    if (corpse.alive && corpse.kind === 'drop' && corpse.line !== undefined) {
      standing.add(corpse.id);
    }
  }
  return standing;
};

const observeEvents = (
  acc: DropLedgerAcc,
  events: readonly SimEvent[],
): void => {
  for (const event of events) {
    if (event.type === 'dropSpawned') {
      acc.spawned += 1;
      if (event.line === undefined) continue;
      acc.lineOfBody.set(event.id, event.line);
      countsFor(acc, event.line).spawned += 1;
    }
    if (event.type === 'swallowed' && event.kind === 'drop') {
      acc.swallowed += 1;
    }
    // The take names the options it passed over, which is the only report the
    // vanished siblings ever make: they leave the field without an event of
    // their own, exactly as ADR 0034's take describes.
    if (event.type === 'offerTaken') {
      acc.passed += event.passed.length;
      countsFor(acc, event.line).swallowed += 1;
      for (const line of event.passed) countsFor(acc, line).passed += 1;
    }
    if (event.type === 'corpseLost' && event.kind === 'drop') acc.lost += 1;
  }
};

/**
 * The lines a take accounted for on this tick, one entry per body it took off
 * the field. A draw never repeats a line inside one offer and exactly one
 * offer is live at a time, so removing one entry per vanished body's line is
 * unambiguous.
 */
const linesTakenIn = (events: readonly SimEvent[]): WeaponLine[] => {
  const taken: WeaponLine[] = [];
  for (const event of events) {
    if (event.type !== 'offerTaken') continue;
    taken.push(event.line, ...event.passed);
  }
  return taken;
};

/**
 * The bodies that left the field this tick and were not taken, counted as lost
 * under the line each carried.
 *
 * It is read off the field rather than off corpseLost, which names no line: a
 * body scrolls off on its own tick whether or not its siblings are still
 * standing, so an offer half gone at the stop still accounts for the half that
 * went. A drop never decays and is never evicted, so a body that is neither
 * standing nor taken left over the bottom edge.
 */
const observeDepartures = (
  acc: DropLedgerAcc,
  events: readonly SimEvent[],
  standing: ReadonlySet<number>,
): void => {
  const accountedFor = linesTakenIn(events);
  for (const id of acc.bodiesOnField) {
    if (standing.has(id)) continue;
    const line = acc.lineOfBody.get(id);
    if (line === undefined) continue;
    const at = accountedFor.indexOf(line);
    if (at >= 0) {
      accountedFor.splice(at, 1);
      continue;
    }
    countsFor(acc, line).lost += 1;
  }
};

const observeStanding = (
  acc: DropLedgerAcc,
  standing: ReadonlySet<number>,
): void => {
  for (const counts of acc.byLine.values()) counts.onFieldAtStop = 0;
  for (const id of standing) {
    const line = acc.lineOfBody.get(id);
    if (line === undefined) continue;
    countsFor(acc, line).onFieldAtStop += 1;
  }
};

const observeDropLedger = (
  acc: DropLedgerAcc,
  events: readonly SimEvent[],
  state: RunState,
): void => {
  observeEvents(acc, events);
  const standing = bodiesStanding(state);
  observeDepartures(acc, events, standing);
  // The last tick's field is the one the run stopped on.
  acc.onFieldAtStop = liveDrops(state);
  observeStanding(acc, standing);
  acc.bodiesOnField.clear();
  for (const id of standing) acc.bodiesOnField.add(id);
};

const byLineOf = (
  acc: DropLedgerAcc,
): Partial<Record<WeaponLine, DropLedgerByLine>> => {
  const lines: Partial<Record<WeaponLine, DropLedgerByLine>> = {};
  for (const [line, counts] of acc.byLine) {
    lines[line] = {
      spawned: counts.spawned,
      swallowed: counts.swallowed,
      passed: counts.passed,
      lost: counts.lost,
      onFieldAtStop: counts.onFieldAtStop,
    };
  }
  return lines;
};

const dropLedgerOf = (acc: DropLedgerAcc): DropLedger => ({
  spawned: acc.spawned,
  swallowed: acc.swallowed,
  passed: acc.passed,
  lost: acc.lost,
  onFieldAtStop: acc.onFieldAtStop,
  byLine: byLineOf(acc),
});

/**
 * The per-line counts flattened into names keyed by line, so a line only one of
 * two runs offered is five absent names rather than a missing block.
 *
 * It is this reading's own, declared beside the counts it flattens, so
 * comparing the ledger by line is one decision in one place rather than a shape
 * the comparer recognised.
 */
const ledgerByLineNumbers = (
  byLine: Readonly<Partial<Record<WeaponLine, DropLedgerByLine>>>,
): NumberRecord => {
  const names: Record<string, number | undefined> = {};
  for (const [line, counts] of Object.entries(byLine)) {
    if (counts === undefined) continue;
    for (const [end, count] of Object.entries(counts)) {
      names[`${line}.${end}`] = count;
    }
  }
  return names;
};

export {
  createDropLedger,
  observeDropLedger,
  dropLedgerOf,
  ledgerByLineNumbers,
};
export type { DropLedger, DropLedgerAcc, DropLedgerByLine };
