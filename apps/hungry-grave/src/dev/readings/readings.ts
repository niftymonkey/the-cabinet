// The readings graph: one accumulator per reading, driven by the one replay pass.

import type { SimEvent } from '../../game/events';
import type { WeaponLine } from '../../game/lines/roster';
import type { RunState } from '../../game/run';
import type { SignalLock } from '../../game/signalLock';
import type { Arrivals, ArrivalsAcc } from './arrivals';
import { arrivalsOf, createArrivals, observeArrivals } from './arrivals';
import type { BelchCadence, BelchCadenceAcc } from './belchCadence';
import {
  belchCadenceOf,
  createBelchCadence,
  observeBelchCadence,
} from './belchCadence';
import type { BledRungMemory, BledRungMemoryAcc } from './bledRungMemory';
import {
  bledRungMemoryOf,
  createBledRungMemory,
  observeBledRungMemory,
} from './bledRungMemory';
import type { DamageTaken, DamageTakenAcc } from './damageTaken';
import {
  createDamageTaken,
  damageTakenOf,
  observeDamageTaken,
} from './damageTaken';
import type { FallenRungLedger, FallenRungLedgerAcc } from './fallenRungLedger';
import {
  createFallenRungLedger,
  fallenRungLedgerOf,
  observeFallenRungLedger,
} from './fallenRungLedger';
import type { StripsLanded, StripsLandedAcc } from './stripsLanded';
import {
  createStripsLanded,
  observeStripsLanded,
  stripsLandedOf,
} from './stripsLanded';
import type { Pressure, PressureAcc } from './pressure';
import { createPressure, observePressure, pressureOf } from './pressure';
import type { PowerUpLedger, PowerUpLedgerAcc } from './powerUpLedger';
import {
  createPowerUpLedger,
  powerUpLedgerOf,
  observePowerUpLedger,
} from './powerUpLedger';
import type { FieldPerLine, FieldPerLineAcc } from './fieldPerLine';
import {
  createFieldPerLine,
  fieldPerLineOf,
  observeFieldPerLine,
} from './fieldPerLine';
import type { FoodLedger, FoodLedgerAcc } from './foodLedger';
import {
  createFoodLedger,
  foodLedgerOf,
  observeFoodLedger,
} from './foodLedger';
import type { FreshnessPaid, FreshnessPaidAcc } from './freshness';
import {
  createFreshnessPaid,
  freshnessPaidOf,
  observeFreshnessPaid,
} from './freshness';
import type { GravePath, GravePathAcc } from './gravePath';
import { createGravePath, gravePathOf, observeGravePath } from './gravePath';
import type { GroundHeld, GroundHeldAcc } from './groundHeld';
import {
  createGroundHeld,
  groundHeldOf,
  observeGroundHeld,
} from './groundHeld';
import type { OfferChoices, OfferChoicesAcc } from './offerChoices';
import {
  createOfferChoices,
  observeOfferChoices,
  offerChoicesOf,
} from './offerChoices';
import type { ScoreByInput, ScoreByInputAcc } from './scoreByInput';
import {
  createScoreByInput,
  observeScoreByInput,
  scoreByInputOf,
} from './scoreByInput';
import type { Refusals, RefusalsAcc } from './refusals';
import { createRefusals, observeRefusals, refusalsOf } from './refusals';
import type { Repel, RepelAcc } from './repel';
import { createRepel, observeRepel, repelOf } from './repel';
import type { SectionTimeline, SectionTimelineAcc } from './sectionTimeline';
import {
  createSectionTimeline,
  observeSectionTimeline,
  sectionTimelineOf,
} from './sectionTimeline';
import type { TerritoryControl, TerritoryControlAcc } from './territoryControl';
import {
  createTerritoryControl,
  observeTerritoryControl,
  territoryControlOf,
} from './territoryControl';
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
import type { UpfieldTraffic, UpfieldTrafficAcc } from './upfieldTraffic';
import {
  createUpfieldTraffic,
  observeUpfieldTraffic,
  upfieldTrafficOf,
} from './upfieldTraffic';
import type { WakingSwallows, WakingSwallowsAcc } from './wakingSwallows';
import {
  createWakingSwallows,
  observeWakingSwallows,
  wakingSwallowsOf,
} from './wakingSwallows';

// Everything a run says about how it played, beside what it produced.
interface TuningReadings {
  readonly arrivals: Arrivals;
  readonly damageTaken: DamageTaken;
  // What each input paid into the score, gross, beside run.score's net.
  readonly scoreByInput: ScoreByInput;
  // The floor ladder's cost, beside the counts damageTaken already carries.
  readonly fallenRungLedger: FallenRungLedger;
  readonly stripsLanded: StripsLanded;
  readonly bledRungMemory: BledRungMemory;
  readonly engagements: Engagements;
  readonly gravePath: GravePath;
  readonly fieldPerLine: FieldPerLine;
  readonly freshnessPaid: FreshnessPaid;
  readonly belchCadence: BelchCadence;
  readonly pressure: Pressure;
  readonly powerUpLedger: PowerUpLedger;
  // Swallowed against lost, for every kind of food (grave-in-the-ground.md, "Values are data").
  readonly foodLedger: FoodLedger;
  readonly offerChoices: OfferChoices;
  readonly wakingSwallows: WakingSwallows;
  readonly territoryPatches: TerritoryPatches;
  readonly territoryControl: TerritoryControl;
  readonly groundHeld: GroundHeld;
  readonly repel: Repel;
  readonly refusals: Refusals;
  readonly upfieldTraffic: UpfieldTraffic;
  readonly sectionTimeline: SectionTimeline;
}

interface ReadingsAcc {
  readonly arrivals: ArrivalsAcc;
  readonly damageTaken: DamageTakenAcc;
  readonly scoreByInput: ScoreByInputAcc;
  readonly fallenRungLedger: FallenRungLedgerAcc;
  readonly stripsLanded: StripsLandedAcc;
  readonly bledRungMemory: BledRungMemoryAcc;
  readonly engagements: EngagementsAcc;
  readonly gravePath: GravePathAcc;
  readonly fieldPerLine: FieldPerLineAcc;
  readonly freshnessPaid: FreshnessPaidAcc;
  readonly belchCadence: BelchCadenceAcc;
  readonly pressure: PressureAcc;
  readonly powerUpLedger: PowerUpLedgerAcc;
  readonly foodLedger: FoodLedgerAcc;
  readonly offerChoices: OfferChoicesAcc;
  readonly wakingSwallows: WakingSwallowsAcc;
  readonly territoryPatches: TerritoryPatchesAcc;
  readonly territoryControl: TerritoryControlAcc;
  readonly groundHeld: GroundHeldAcc;
  readonly repel: RepelAcc;
  readonly refusals: RefusalsAcc;
  readonly upfieldTraffic: UpfieldTrafficAcc;
  readonly sectionTimeline: SectionTimelineAcc;
}

/**
 * The readings graph, made once per measurement. The starting size seeds the
 * grave's own series from the tape header's resolved value, so a conditioned
 * run reports the size it really began at, and the line set comes from that
 * same header, so a reading keyed by line stands before the first tick rather
 * than waiting to discover its names from one.
 *
 * The signal lock arrives the same way and for the same reason: it is a value
 * the run resolved before its first tick, so the pressure reading takes it from
 * the header rather than from the director it measures.
 */
const createReadings = (
  startingSize: number,
  lines: readonly WeaponLine[],
  signalLock: SignalLock,
): ReadingsAcc => ({
  arrivals: createArrivals(),
  damageTaken: createDamageTaken(),
  scoreByInput: createScoreByInput(),
  fallenRungLedger: createFallenRungLedger(),
  stripsLanded: createStripsLanded(),
  bledRungMemory: createBledRungMemory(startingSize),
  engagements: createEngagements(lines),
  gravePath: createGravePath(startingSize),
  fieldPerLine: createFieldPerLine(),
  freshnessPaid: createFreshnessPaid(),
  belchCadence: createBelchCadence(),
  pressure: createPressure(signalLock),
  powerUpLedger: createPowerUpLedger(),
  foodLedger: createFoodLedger(),
  offerChoices: createOfferChoices(),
  wakingSwallows: createWakingSwallows(),
  territoryPatches: createTerritoryPatches(),
  territoryControl: createTerritoryControl(),
  groundHeld: createGroundHeld(),
  repel: createRepel(),
  refusals: createRefusals(),
  upfieldTraffic: createUpfieldTraffic(),
  sectionTimeline: createSectionTimeline(),
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
  observeArrivals(acc.arrivals, events, state);
  observeDamageTaken(acc.damageTaken, events);
  observeScoreByInput(acc.scoreByInput, events);
  observeFallenRungLedger(acc.fallenRungLedger, tick, events, state);
  observeStripsLanded(acc.stripsLanded, events, state);
  observeBledRungMemory(acc.bledRungMemory, state);
  observeEngagements(acc.engagements, tick, events, state);
  observeGravePath(acc.gravePath, state);
  observeFieldPerLine(acc.fieldPerLine, state, lines);
  observeFreshnessPaid(acc.freshnessPaid, events);
  observeBelchCadence(acc.belchCadence, tick, events, state);
  observePressure(acc.pressure, tick, events);
  observePowerUpLedger(acc.powerUpLedger, events, state);
  observeFoodLedger(acc.foodLedger, events);
  observeOfferChoices(acc.offerChoices, tick, events);
  observeWakingSwallows(acc.wakingSwallows, tick, events);
  observeTerritoryPatches(acc.territoryPatches, events);
  observeTerritoryControl(acc.territoryControl, tick, events, state);
  observeGroundHeld(acc.groundHeld, state);
  observeRepel(acc.repel, events);
  observeRefusals(acc.refusals, state);
  observeUpfieldTraffic(acc.upfieldTraffic, events, state);
  observeSectionTimeline(acc.sectionTimeline, events);
};

const readingsOf = (acc: ReadingsAcc): TuningReadings => ({
  arrivals: arrivalsOf(acc.arrivals),
  damageTaken: damageTakenOf(acc.damageTaken),
  scoreByInput: scoreByInputOf(acc.scoreByInput),
  fallenRungLedger: fallenRungLedgerOf(acc.fallenRungLedger),
  stripsLanded: stripsLandedOf(acc.stripsLanded),
  bledRungMemory: bledRungMemoryOf(acc.bledRungMemory),
  engagements: engagementsOf(acc.engagements),
  gravePath: gravePathOf(acc.gravePath),
  fieldPerLine: fieldPerLineOf(acc.fieldPerLine),
  freshnessPaid: freshnessPaidOf(acc.freshnessPaid),
  belchCadence: belchCadenceOf(acc.belchCadence),
  pressure: pressureOf(acc.pressure),
  powerUpLedger: powerUpLedgerOf(acc.powerUpLedger),
  foodLedger: foodLedgerOf(acc.foodLedger),
  offerChoices: offerChoicesOf(acc.offerChoices),
  wakingSwallows: wakingSwallowsOf(acc.wakingSwallows),
  territoryPatches: territoryPatchesOf(acc.territoryPatches),
  territoryControl: territoryControlOf(acc.territoryControl),
  groundHeld: groundHeldOf(acc.groundHeld),
  repel: repelOf(acc.repel),
  refusals: refusalsOf(acc.refusals),
  upfieldTraffic: upfieldTrafficOf(acc.upfieldTraffic),
  sectionTimeline: sectionTimelineOf(acc.sectionTimeline),
});

export { createReadings, observeReadings, readingsOf };
export type { ReadingsAcc, TuningReadings };
