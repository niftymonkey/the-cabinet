// The slice instruments (concept doc, open questions). Numbers a playtest can
// read back, kept by the sim and shown in the HUD's instrument panel.

export type BelchOnWallOutcome =
  'pending' | 'landedOnWall' | 'emptySky' | 'noBelch';

export interface HitRecord {
  t: number;
  cause: string;
}

export interface Instruments {
  runSeconds: number;
  timeInBottomBand: number;
  belchesFired: number;
  timeAtFullReservoir: number;
  fullSince: number | null;
  wastedCharge: number;
  dropsSpawned: number;
  dropsEaten: number;
  dropsScrolledOff: number;
  dropSpawnTimes: number[];
  killsTotal: number;
  hits: HitRecord[];
  swallowCount: number;
  freshnessSum: number;
  swallowsWithBellLeveled: number;
  freshnessSumWithBellLeveled: number;
  belchOnWall: BelchOnWallOutcome;
  belchesInBansheeFight: number;
  belchesInUndertakerFight: number;
  chunkEndedMidEmit: number;
  corpsesSuckedUnder: number;
  corpsesEaten: number;
  oversizeScore: number;
}

export function createInstruments(): Instruments {
  return {
    runSeconds: 0,
    timeInBottomBand: 0,
    belchesFired: 0,
    timeAtFullReservoir: 0,
    fullSince: null,
    wastedCharge: 0,
    dropsSpawned: 0,
    dropsEaten: 0,
    dropsScrolledOff: 0,
    dropSpawnTimes: [],
    killsTotal: 0,
    hits: [],
    swallowCount: 0,
    freshnessSum: 0,
    swallowsWithBellLeveled: 0,
    freshnessSumWithBellLeveled: 0,
    belchOnWall: 'pending',
    belchesInBansheeFight: 0,
    belchesInUndertakerFight: 0,
    chunkEndedMidEmit: 0,
    corpsesSuckedUnder: 0,
    corpsesEaten: 0,
    oversizeScore: 0,
  };
}

export interface InstrumentSummary {
  runSeconds: number;
  offBottomFraction: number;
  belchesFired: number;
  timeAtFullReservoir: number;
  wastedCharge: number;
  drops: {
    spawned: number;
    eaten: number;
    scrolledOff: number;
    meanGapSeconds: number;
  };
  kills: number;
  hits: number;
  avgFreshnessAtSwallow: number;
  avgFreshnessAtSwallowBellLeveled: number;
  belchOnWall: BelchOnWallOutcome;
  belchesInBansheeFight: number;
  belchesInUndertakerFight: number;
  chunkEndedMidEmit: number;
  corpsesEaten: number;
  corpsesSuckedUnder: number;
  oversizeScore: number;
}

export function summarize(ins: Instruments): InstrumentSummary {
  const gaps: number[] = [];
  for (let i = 1; i < ins.dropSpawnTimes.length; i++) {
    const prev = ins.dropSpawnTimes[i - 1];
    const curr = ins.dropSpawnTimes[i];
    if (prev !== undefined && curr !== undefined) gaps.push(curr - prev);
  }
  return {
    runSeconds: ins.runSeconds,
    offBottomFraction:
      ins.runSeconds > 0 ? 1 - ins.timeInBottomBand / ins.runSeconds : 1,
    belchesFired: ins.belchesFired,
    timeAtFullReservoir: ins.timeAtFullReservoir,
    wastedCharge: ins.wastedCharge,
    drops: {
      spawned: ins.dropsSpawned,
      eaten: ins.dropsEaten,
      scrolledOff: ins.dropsScrolledOff,
      meanGapSeconds: gaps.length
        ? gaps.reduce((a, b) => a + b, 0) / gaps.length
        : 0,
    },
    kills: ins.killsTotal,
    hits: ins.hits.length,
    avgFreshnessAtSwallow:
      ins.swallowCount > 0 ? ins.freshnessSum / ins.swallowCount : 0,
    avgFreshnessAtSwallowBellLeveled:
      ins.swallowsWithBellLeveled > 0
        ? ins.freshnessSumWithBellLeveled / ins.swallowsWithBellLeveled
        : 0,
    belchOnWall: ins.belchOnWall,
    belchesInBansheeFight: ins.belchesInBansheeFight,
    belchesInUndertakerFight: ins.belchesInUndertakerFight,
    chunkEndedMidEmit: ins.chunkEndedMidEmit,
    corpsesEaten: ins.corpsesEaten,
    corpsesSuckedUnder: ins.corpsesSuckedUnder,
    oversizeScore: ins.oversizeScore,
  };
}
