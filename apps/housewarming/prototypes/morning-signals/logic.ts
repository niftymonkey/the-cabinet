// Pure logic for the morning-signals prototype (Wayfinder ticket #9).
// Implements the night contract settled by ticket #3. No I/O, no terminal code.

export interface TraitValue {
  id: string;
  name: string;
}

export interface Pools {
  hour: TraitValue[];
  lure: TraitValue[];
  aversion: TraitValue[];
  haunt: TraitValue[];
  trace: TraitValue[];
}

// Hardcoded starting pools, four values per axis, ids from docs/research/folklore-pools.md.
// The hour pool is positional: index order is watch order, dusk through first light.
export const POOLS: Pools = {
  hour: [
    { id: 'hour-nightfall', name: 'Dusk' },
    { id: 'hour-midnight', name: 'Midnight' },
    { id: 'hour-small-hours', name: 'The small hours' },
    { id: 'hour-first-light', name: 'First light' },
  ],
  lure: [
    { id: 'lure-milk', name: 'A bowl of milk' },
    { id: 'lure-bread', name: 'A piece of bread' },
    { id: 'lure-honey', name: 'Honey' },
    { id: 'lure-fresh-water', name: 'Fresh water' },
  ],
  aversion: [
    { id: 'aversion-iron', name: 'Cold iron' },
    { id: 'aversion-salt-line', name: 'A line of salt' },
    { id: 'aversion-rowan', name: 'Rowan' },
    { id: 'aversion-running-water', name: 'Running water' },
  ],
  haunt: [
    { id: 'haunt-hearth', name: 'The hearth' },
    { id: 'haunt-cellar', name: 'The cellar' },
    { id: 'haunt-attic', name: 'The attic' },
    { id: 'haunt-bedchamber', name: 'The bedchamber' },
  ],
  trace: [
    { id: 'trace-knocking', name: 'Knocking' },
    { id: 'trace-scratching', name: 'Scratching' },
    { id: 'trace-moved-objects', name: 'Objects moved' },
    { id: 'trace-work-done', name: 'Work found finished' },
    { id: 'trace-uneasy-dog', name: 'The dog would not settle' },
  ],
};

export interface Spirit {
  trace: string;
  hour: string;
  lure: string;
  aversion: string;
  haunt: string;
}

export interface Experiment {
  room: string;
  candle: number; // length in watches, 1..4
  lure: string;
  ward: string | null;
}

export type Scene =
  | { scene: 'silent'; room: string }
  | {
      scene: 'turned-back';
      room: string;
      trace: string;
      mark: number | null;
      ward: string;
    }
  | {
      scene: 'came-in';
      room: string;
      trace: string;
      mark: number | null;
      bowlTaken: boolean;
      wardCrossed: string | null;
    };

export interface NameSubmission {
  trace: string;
  hour: string;
  lure: string;
  aversion: string;
  haunt: string;
}

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function at<T>(values: T[], index: number): T {
  const value = values[index];
  if (value === undefined) throw new Error(`index ${index} out of range`);
  return value;
}

function pick<T>(values: T[], rng: Rng): T {
  return at(values, Math.floor(rng() * values.length));
}

function pickDistinct<T>(values: T[], count: number, rng: Rng): T[] {
  const rest = [...values];
  const taken: T[] = [];
  while (taken.length < count) {
    const i = Math.floor(rng() * rest.length);
    taken.push(at(rest, i));
    rest.splice(i, 1);
  }
  return taken;
}

// Generation invariants from the night contract: no two loose spirits share a haunt,
// and a trace kind is unique to its spirit. Hours, lures and aversions may collide.
export function rollSpirits(pools: Pools, count: number, rng: Rng): Spirit[] {
  const haunts = pickDistinct(pools.haunt, count, rng);
  const traces = pickDistinct(pools.trace, count, rng);
  return haunts.map((haunt, i) => ({
    trace: at(traces, i).id,
    hour: pick(pools.hour, rng).id,
    lure: pick(pools.lure, rng).id,
    aversion: pick(pools.aversion, rng).id,
    haunt: haunt.id,
  }));
}

export function watchOf(pools: Pools, hourId: string): number {
  const index = pools.hour.findIndex((h) => h.id === hourId);
  if (index === -1) throw new Error(`unknown hour ${hourId}`);
  return index + 1;
}

export function traitName(pool: TraitValue[], id: string): string {
  const value = pool.find((v) => v.id === id);
  if (!value) throw new Error(`unknown trait ${id}`);
  return value.name;
}

// One night, resolved per the contract. Each watched room is a pure function of its
// own experiment and the loose spirit that haunts it, if any. Unwatched rooms show
// nothing, ever, so they produce no scene at all.
export function resolveNight(
  pools: Pools,
  loose: Spirit[],
  experiments: Experiment[],
): Scene[] {
  return experiments.map((experiment) => {
    const spirit = loose.find((s) => s.haunt === experiment.room);
    if (!spirit) return { scene: 'silent', room: experiment.room };
    const approach = watchOf(pools, spirit.hour);
    const mark = experiment.candle >= approach ? approach : null;
    if (experiment.ward !== null && experiment.ward === spirit.aversion) {
      return {
        scene: 'turned-back',
        room: experiment.room,
        trace: spirit.trace,
        mark,
        ward: experiment.ward,
      };
    }
    return {
      scene: 'came-in',
      room: experiment.room,
      trace: spirit.trace,
      mark,
      bowlTaken: experiment.lure === spirit.lure,
      wardCrossed: experiment.ward,
    };
  });
}

export function nameHolds(
  spirits: Spirit[],
  submission: NameSubmission,
): boolean {
  const spirit = spirits.find((s) => s.trace === submission.trace);
  return (
    spirit !== undefined &&
    spirit.hour === submission.hour &&
    spirit.lure === submission.lure &&
    spirit.aversion === submission.aversion &&
    spirit.haunt === submission.haunt
  );
}
