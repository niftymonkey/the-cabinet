// The trait values this house draws from. Every id and every claim behind it is in
// `docs/research/folklore-pools.md`, which is deliberately wider than the game uses;
// these are the values in play, chosen from it.
//
// Ids are the durable part. A presentation name is expected to be rewritten and must
// never move an id.

import type { HourValue, TraitValue } from './types.ts';

// The four watches, in order, dusk through first light. The night cannot be sliced
// finer than four without inventing, so this pool never widens; whether the hour axis
// may leave the night at all (noon, the eve) is open and belongs to ticket #14.
export const HOURS: readonly HourValue[] = [
  { id: 'hour-nightfall', name: 'Nightfall', watch: 1 },
  { id: 'hour-midnight', name: 'Midnight', watch: 2 },
  { id: 'hour-small-hours', name: 'The small hours', watch: 3 },
  { id: 'hour-first-light', name: 'First light', watch: 4 },
];

export const LURES_AT_FIRST: readonly TraitValue[] = [
  { id: 'lure-milk', name: 'A bowl of milk' },
  { id: 'lure-bread', name: 'A piece of bread' },
  { id: 'lure-honey', name: 'Honey' },
  { id: 'lure-fresh-water', name: 'Fresh water set out' },
];

export const LURES_WHEN_THE_LARDER_OPENS: readonly TraitValue[] = [
  { id: 'lure-porridge-and-butter', name: 'Porridge with butter' },
  { id: 'lure-ale', name: 'A cup of ale' },
];

export const AVERSIONS_AT_FIRST: readonly TraitValue[] = [
  { id: 'aversion-iron', name: 'Cold iron' },
  { id: 'aversion-salt-line', name: 'A line of salt' },
  { id: 'aversion-rowan', name: 'Rowan' },
  { id: 'aversion-running-water', name: 'Running water' },
];

export const ROOMS_AT_FIRST: readonly TraitValue[] = [
  { id: 'haunt-hearth', name: 'The hearth' },
  { id: 'haunt-cellar', name: 'The cellar' },
  { id: 'haunt-attic', name: 'The attic' },
  { id: 'haunt-bedchamber', name: 'The bedchamber' },
];

export const ROOMS_WHEN_THE_HOUSE_OPENS: readonly TraitValue[] = [
  { id: 'haunt-kitchen', name: 'The kitchen' },
  { id: 'haunt-byre', name: 'The byre' },
  { id: 'haunt-washhouse', name: 'The washhouse' },
];

// A trace is the spirit's visible identity and carries no trait information, so this
// pool is chosen for being distinguishable at a glance rather than for covering ground.
//
// Two exclusions are the night contract's, not taste. Nothing here may be a state of an
// instrument or of the house's cold, which rules out the candle burning blue, the bowl
// taken, the fire out and water used, each of which is already a reading the keeper
// makes. And frost and damp are reserved for the cold itself, which is what settles the
// research doc's open question about drawing non-attested values: both of the pool's
// design inventions were already excluded on other grounds.
export const TRACES: readonly TraitValue[] = [
  { id: 'trace-knocking', name: 'Knocking' },
  { id: 'trace-scratching', name: 'Scratching' },
  { id: 'trace-moved-objects', name: 'Objects moved' },
  { id: 'trace-work-done', name: 'Work found finished' },
  { id: 'trace-uneasy-dog', name: 'The dog would not settle' },
  { id: 'trace-footprints-in-ash', name: 'Footprints in the ash' },
  { id: 'trace-elf-locks', name: 'Hair found plaited' },
  { id: 'trace-soured-milk', name: 'Milk soured' },
];
