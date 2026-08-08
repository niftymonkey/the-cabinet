// The kernel's vocabulary. Every name here is the name `apps/housewarming/CONTEXT.md`
// gives the thing, and nothing in this file knows how anything is drawn.

// The four dimensions a spirit's traits are drawn from. Trace is deliberately absent:
// it is the spirit's visible identity, not a hidden fifth axis.
export type Axis = 'hour' | 'lure' | 'aversion' | 'haunt';

// A trait is an id plus presentation, and the generator, resolver and solver only ever
// touch the id (game-concept decision log, 2026-08-06). The id is what a save carries,
// so renaming the presentation must never move one.
export type TraitId = string;

export interface TraitValue {
  readonly id: TraitId;
  readonly name: string;
}

// One of the four parts of the night, dusk through first light. Four is the ceiling:
// the folklore divides the night into four watches and nothing divides them further
// (docs/research/folklore-pools.md).
export type Watch = 1 | 2 | 3 | 4;

// An hour carries the watch it falls in, because the candle's mark is read as a watch
// and the resolver has to compare the two. The morning-signals prototype took the watch
// from the hour pool's index order instead, which hid a coupling between the order of a
// data table and the rules, and which has no answer at all for an hour outside the night.
export interface HourValue {
  readonly id: TraitId;
  readonly name: string;
  readonly watch: Watch;
}

// The values available on each axis at one point in a playthrough. Widens as the house
// opens up.
export interface Pools {
  readonly hour: readonly HourValue[];
  readonly lure: readonly TraitValue[];
  readonly aversion: readonly TraitValue[];
  readonly haunt: readonly TraitValue[];
}

// A spirit's four traits taken together. Submitted whole or not at all.
export interface TrueName {
  readonly hour: TraitId;
  readonly lure: TraitId;
  readonly aversion: TraitId;
  readonly haunt: TraitId;
}

export interface Spirit {
  // Unique to this spirit, openly visible, carrying no trait information.
  readonly trace: TraitId;
  readonly name: TrueName;
  // The house stage this spirit arrives with. Its traits come from the pools in force
  // at that stage, so a house opening never widens a puzzle already in progress.
  readonly stage: number;
}

// One configured test placed for a night: a room, a candle, a lure, and optionally a
// ward. At most one per room per night.
export interface Experiment {
  readonly room: TraitId;
  // The length bought, in watches. Both the cost of watching and the clock.
  readonly candle: Watch;
  readonly lure: TraitId;
  readonly ward: TraitId | null;
}

// What one watched room shows in the morning. Unwatched rooms produce no scene at all.
export type Scene =
  | {
      // No loose spirit haunts this room: untouched bowl, intact ward, candle burnt clean.
      readonly scene: 'silent';
      readonly room: TraitId;
    }
  | {
      // The ward held. The trace stops in an arc at the line and the bowl goes untested.
      readonly scene: 'turned-back';
      readonly room: TraitId;
      readonly trace: TraitId;
      readonly mark: Watch | null;
      readonly ward: TraitId;
    }
  | {
      // It came in. The trace is inside, the bowl is taken or refused, and any ward that
      // was down has been crossed and is ruled out as the aversion.
      readonly scene: 'came-in';
      readonly room: TraitId;
      readonly trace: TraitId;
      readonly mark: Watch | null;
      readonly bowlTaken: boolean;
      readonly wardCrossed: TraitId | null;
    };

export interface Morning {
  readonly night: number;
  readonly scenes: readonly Scene[];
}

// A name offered for the spirit that leaves this trace.
export interface NameSubmission {
  readonly trace: TraitId;
  readonly name: TrueName;
}
