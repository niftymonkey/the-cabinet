// The save, versioned from the first day it exists.
//
// A year of adding rooms, axes and spirits changes a save's shape, and without a version
// every addition silently breaks a run in progress with no way forward for it. So the
// number is here before there is anything to migrate, and the loader refuses anything it
// cannot account for rather than guessing.
//
// A save carries the run and nothing else. The rules are code, and a change to them that
// an old run cannot survive is what a migration is for.

import type { Observation } from './deduction.ts';
import type { Run, RunStatus } from './run.ts';
import type {
  Experiment,
  Scene,
  Spirit,
  TraitId,
  TrueName,
  Watch,
} from './types.ts';

export const SAVE_VERSION = 1;

export interface Save {
  readonly version: number;
  readonly run: Run;
}

// Takes a save of version n and returns one of version n + 1, keyed by the version it
// reads. Every migration is written once, kept forever, and never edited afterwards.
export type Migration = (
  save: Record<string, unknown>,
) => Record<string, unknown>;

export const MIGRATIONS: ReadonlyMap<number, Migration> = new Map();

export function saveRun(run: Run): Save {
  return { version: SAVE_VERSION, run };
}

export function serialize(run: Run): string {
  return JSON.stringify(saveRun(run));
}

export function loadSave(
  data: unknown,
  migrations: ReadonlyMap<number, Migration> = MIGRATIONS,
): Run {
  if (!isRecord(data)) throw new Error('a save must be an object');

  let save = data;
  let version = integer(save, 'version', 'save');

  if (version > SAVE_VERSION) {
    throw new Error(
      `this save is version ${version} and this house reads up to ${SAVE_VERSION}`,
    );
  }

  while (version < SAVE_VERSION) {
    const migration = migrations.get(version);
    if (!migration) {
      throw new Error(`no migration from save version ${version}`);
    }
    save = migration(save);
    const migrated = integer(save, 'version', 'save');
    if (migrated !== version + 1) {
      throw new Error(
        `the migration from version ${version} did not move the version on by one`,
      );
    }
    version = migrated;
  }

  return parseRun(record(save, 'run', 'save'));
}

export function deserialize(
  text: string,
  migrations: ReadonlyMap<number, Migration> = MIGRATIONS,
): Run {
  return loadSave(JSON.parse(text), migrations);
}

const STATUSES: readonly RunStatus[] = ['keeping', 'won', 'lost', 'left'];

function parseRun(value: Record<string, unknown>): Run {
  const status = value['status'];
  if (!isStatus(status)) {
    throw new Error(`run.status is not a status this house knows: ${status}`);
  }
  const spirits = list(value, 'spirits', 'run').map((spirit, index) =>
    parseSpirit(spirit, `run.spirits[${index}]`),
  );
  const named = list(value, 'named', 'run').map((trace, index) =>
    traitId(trace, `run.named[${index}]`),
  );
  assertRosterHolds(spirits, named);

  return {
    seed: integer(value, 'seed', 'run'),
    night: integer(value, 'night', 'run'),
    stage: integer(value, 'stage', 'run'),
    warmth: integer(value, 'warmth', 'run'),
    spirits,
    named,
    seen: list(value, 'seen', 'run').map((observation, index) =>
      parseObservation(observation, `run.seen[${index}]`),
    ),
    status,
  };
}

// The generator's invariants are what the resolver and the deduction both lean on, so a
// save that breaks them would play as nonsense rather than fail. It gets refused at the
// door instead.
function assertRosterHolds(
  spirits: readonly Spirit[],
  named: readonly TraitId[],
): void {
  const traces = new Set(spirits.map((spirit) => spirit.trace));
  if (traces.size !== spirits.length) {
    throw new Error('two spirits in this save leave the same trace');
  }
  const haunts = new Set(spirits.map((spirit) => spirit.name.haunt));
  if (haunts.size !== spirits.length) {
    throw new Error('two spirits in this save hold the same haunt');
  }
  if (new Set(named).size !== named.length) {
    throw new Error('this save names the same spirit twice');
  }
  for (const trace of named) {
    if (!traces.has(trace)) {
      throw new Error(`this save names ${trace}, which no spirit leaves`);
    }
  }
}

function parseObservation(value: unknown, where: string): Observation {
  if (!isRecord(value)) throw new Error(`${where} must be an object`);
  const experiment = parseExperiment(
    record(value, 'experiment', where),
    `${where}.experiment`,
  );
  const scene = parseScene(record(value, 'scene', where), `${where}.scene`);

  // A scene is what one experiment did, so the two have to agree about the room it
  // happened in and the ward that was down. A save where they disagree would poison the
  // deduction quietly rather than fail.
  if (scene.room !== experiment.room) {
    throw new Error(`${where} puts its scene in a room it did not watch`);
  }
  const wardInScene =
    scene.scene === 'turned-back'
      ? scene.ward
      : scene.scene === 'came-in'
        ? scene.wardCrossed
        : experiment.ward;
  if (wardInScene !== experiment.ward) {
    throw new Error(`${where} shows a ward the experiment did not put down`);
  }

  return { night: integer(value, 'night', where), experiment, scene };
}

function parseExperiment(
  value: Record<string, unknown>,
  where: string,
): Experiment {
  const ward = value['ward'];
  return {
    room: traitId(value['room'], `${where}.room`),
    candle: watch(value['candle'], `${where}.candle`),
    lure: traitId(value['lure'], `${where}.lure`),
    ward: ward === null ? null : traitId(ward, `${where}.ward`),
  };
}

function parseScene(value: Record<string, unknown>, where: string): Scene {
  const room = traitId(value['room'], `${where}.room`);
  const kind = value['scene'];
  if (kind === 'silent') return { scene: 'silent', room };

  const trace = traitId(value['trace'], `${where}.trace`);
  const mark = value['mark'];
  const marked = mark === null ? null : watch(mark, `${where}.mark`);

  if (kind === 'turned-back') {
    return {
      scene: 'turned-back',
      room,
      trace,
      mark: marked,
      ward: traitId(value['ward'], `${where}.ward`),
    };
  }
  if (kind === 'came-in') {
    const crossed = value['wardCrossed'];
    return {
      scene: 'came-in',
      room,
      trace,
      mark: marked,
      bowlTaken: boolean(value['bowlTaken'], `${where}.bowlTaken`),
      wardCrossed:
        crossed === null ? null : traitId(crossed, `${where}.wardCrossed`),
    };
  }
  throw new Error(`${where}.scene is not a scene this house shows: ${kind}`);
}

function parseSpirit(value: unknown, where: string): Spirit {
  if (!isRecord(value)) throw new Error(`${where} must be an object`);
  return {
    trace: traitId(value['trace'], `${where}.trace`),
    stage: integer(value, 'stage', where),
    name: parseTrueName(record(value, 'name', where), `${where}.name`),
  };
}

function parseTrueName(
  value: Record<string, unknown>,
  where: string,
): TrueName {
  return {
    hour: traitId(value['hour'], `${where}.hour`),
    lure: traitId(value['lure'], `${where}.lure`),
    aversion: traitId(value['aversion'], `${where}.aversion`),
    haunt: traitId(value['haunt'], `${where}.haunt`),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStatus(value: unknown): value is RunStatus {
  return STATUSES.some((status) => status === value);
}

function record(
  value: Record<string, unknown>,
  key: string,
  where: string,
): Record<string, unknown> {
  const found = value[key];
  if (!isRecord(found)) throw new Error(`${where}.${key} must be an object`);
  return found;
}

function list(
  value: Record<string, unknown>,
  key: string,
  where: string,
): unknown[] {
  const found = value[key];
  if (!Array.isArray(found)) throw new Error(`${where}.${key} must be a list`);
  return found;
}

function integer(
  value: Record<string, unknown>,
  key: string,
  where: string,
): number {
  const found = value[key];
  if (typeof found !== 'number' || !Number.isInteger(found)) {
    throw new Error(`${where}.${key} must be a whole number`);
  }
  return found;
}

function boolean(value: unknown, where: string): boolean {
  if (typeof value !== 'boolean')
    throw new Error(`${where} must be true or false`);
  return value;
}

function watch(value: unknown, where: string): Watch {
  switch (value) {
    case 1:
    case 2:
    case 3:
    case 4:
      return value;
    default:
      throw new Error(`${where} must be one of the four watches`);
  }
}

function traitId(value: unknown, where: string): TraitId {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${where} must be a trait id`);
  }
  return value;
}
