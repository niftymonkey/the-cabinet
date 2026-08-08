// The kernel: a house, its nights, and the deduction they feed. Headless and pure, so
// the room, the book and the solver can each be built against it without a browser.

export type {
  Axis,
  Experiment,
  HourValue,
  Morning,
  NameSubmission,
  Pools,
  Scene,
  Spirit,
  TraitId,
  TraitValue,
  TrueName,
  Watch,
} from './types.ts';

export { at, mulberry32, pick, pickDistinct, type Rng } from './rng.ts';

export {
  AVERSIONS_AT_FIRST,
  HOURS,
  LURES_AT_FIRST,
  LURES_WHEN_THE_LARDER_OPENS,
  ROOMS_AT_FIRST,
  ROOMS_WHEN_THE_HOUSE_OPENS,
  TRACES,
} from './pools.ts';

export {
  drainPerLooseSpirit,
  poolsAtStage,
  rosterSize,
  ECONOMY,
  GENERATION,
  THE_HOUSE,
  type DrainStep,
  type Economy,
  type GenerationRules,
  type HouseStage,
  type Ruleset,
} from './rules.ts';

export { assertRosterFits, rollSpirits } from './generator.ts';

export {
  assertNightIsLegal,
  hourValue,
  resolveNight,
  resolveRoom,
  watchOf,
} from './resolver.ts';

export {
  allNames,
  allows,
  consistentNames,
  evidenceFor,
  firstSighting,
  settledAxes,
  traitsStillPossible,
  type Observation,
} from './deduction.ts';

export {
  arrived,
  drainFor,
  drainTonight,
  experimentCost,
  leaveOffered,
  loose,
  namedSpirits,
  namesStillOpen,
  nightCost,
  playNight,
  poolsOf,
  sighted,
  startRun,
  submitName,
  takeLeave,
  type NamingResult,
  type NightResult,
  type Run,
  type RunStatus,
} from './run.ts';

export {
  deserialize,
  loadSave,
  saveRun,
  serialize,
  MIGRATIONS,
  SAVE_VERSION,
  type Migration,
  type Save,
} from './save.ts';
