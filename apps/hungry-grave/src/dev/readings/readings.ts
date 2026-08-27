// The readings graph: one accumulator per reading, driven by the one replay pass.

import type { SimEvent } from '../../game/events';
import type { WeaponLine } from '../../game/lines/roster';
import type { RunState } from '../../game/run';
import type { BelchCadence, BelchCadenceAcc } from './belchCadence';
import {
  belchCadenceOf,
  createBelchCadence,
  observeBelchCadence,
} from './belchCadence';
import type { DamageTaken, DamageTakenAcc } from './damageTaken';
import {
  createDamageTaken,
  damageTakenOf,
  observeDamageTaken,
} from './damageTaken';
import type { DropLedger, DropLedgerAcc } from './dropLedger';
import {
  createDropLedger,
  dropLedgerOf,
  observeDropLedger,
} from './dropLedger';
import type { FieldPerLine, FieldPerLineAcc } from './fieldPerLine';
import {
  createFieldPerLine,
  fieldPerLineOf,
  observeFieldPerLine,
} from './fieldPerLine';
import type { FreshnessPaid, FreshnessPaidAcc } from './freshness';
import {
  createFreshnessPaid,
  freshnessPaidOf,
  observeFreshnessPaid,
} from './freshness';
import type { GravePath, GravePathAcc } from './gravePath';
import { createGravePath, gravePathOf, observeGravePath } from './gravePath';
import type { TerritoryPatches, TerritoryPatchesAcc } from './territoryPatches';
import {
  createTerritoryPatches,
  observeTerritoryPatches,
  territoryPatchesOf,
} from './territoryPatches';
import type { Engagements, EngagementsAcc } from './timeToKill';
import {
  createEngagements,
  engagementsOf,
  observeEngagements,
} from './timeToKill';

// Everything a run says about how it played, beside what it produced.
interface TuningReadings {
  readonly damageTaken: DamageTaken;
  readonly engagements: Engagements;
  readonly gravePath: GravePath;
  readonly fieldPerLine: FieldPerLine;
  readonly freshnessPaid: FreshnessPaid;
  readonly belchCadence: BelchCadence;
  readonly dropLedger: DropLedger;
  readonly territoryPatches: TerritoryPatches;
}

interface ReadingsAcc {
  readonly damageTaken: DamageTakenAcc;
  readonly engagements: EngagementsAcc;
  readonly gravePath: GravePathAcc;
  readonly fieldPerLine: FieldPerLineAcc;
  readonly freshnessPaid: FreshnessPaidAcc;
  readonly belchCadence: BelchCadenceAcc;
  readonly dropLedger: DropLedgerAcc;
  readonly territoryPatches: TerritoryPatchesAcc;
}

/**
 * The readings graph, made once per measurement. The starting size seeds the
 * grave's own series from the tape header's resolved value, so a conditioned
 * run reports the size it really began at, and the line set comes from that
 * same header, so a reading keyed by line stands before the first tick rather
 * than waiting to discover its names from one.
 */
const createReadings = (
  startingSize: number,
  lines: readonly WeaponLine[],
): ReadingsAcc => ({
  damageTaken: createDamageTaken(),
  engagements: createEngagements(lines),
  gravePath: createGravePath(startingSize),
  fieldPerLine: createFieldPerLine(),
  freshnessPaid: createFreshnessPaid(),
  belchCadence: createBelchCadence(),
  dropLedger: createDropLedger(),
  territoryPatches: createTerritoryPatches(),
});

/**
 * One tick, offered to every reading. This is the only place the readings graph
 * is declared, and it rides the single replay pass the instrument already runs.
 *
 * The run's line set arrives as an argument rather than being read here: it is
 * known from the tape header before the first tick, and the field reading walks
 * it every tick.
 */
const observeReadings = (
  acc: ReadingsAcc,
  tick: number,
  events: readonly SimEvent[],
  state: RunState,
  lines: readonly WeaponLine[],
): void => {
  observeDamageTaken(acc.damageTaken, events);
  observeEngagements(acc.engagements, tick, events, state);
  observeGravePath(acc.gravePath, state);
  observeFieldPerLine(acc.fieldPerLine, state, lines);
  observeFreshnessPaid(acc.freshnessPaid, events);
  observeBelchCadence(acc.belchCadence, tick, events, state);
  observeDropLedger(acc.dropLedger, events, state);
  observeTerritoryPatches(acc.territoryPatches, events);
};

const readingsOf = (acc: ReadingsAcc): TuningReadings => ({
  damageTaken: damageTakenOf(acc.damageTaken),
  engagements: engagementsOf(acc.engagements),
  gravePath: gravePathOf(acc.gravePath),
  fieldPerLine: fieldPerLineOf(acc.fieldPerLine),
  freshnessPaid: freshnessPaidOf(acc.freshnessPaid),
  belchCadence: belchCadenceOf(acc.belchCadence),
  dropLedger: dropLedgerOf(acc.dropLedger),
  territoryPatches: territoryPatchesOf(acc.territoryPatches),
});

export { createReadings, observeReadings, readingsOf };
export type { ReadingsAcc, TuningReadings };
