/**
 * The witness fold (ADR 0019).
 *
 * Two kinds of test live here and they are not interchangeable. The per-field
 * tests are the evidence that each field is really folded, and they only ever
 * cover the fields somebody remembered. The completeness assertion is the
 * mechanism: it walks the nested value types and fails when a field appears at
 * any depth that neither list has decided about.
 *
 * The assertion needs both halves of the partition. Naming only the folded half
 * rebuilds the two-hand-maintained-lists problem it exists to kill, since a new
 * field added to neither list would then simply be absent from both.
 */

import { describe, expect, it } from 'vitest';
import { stepping } from '../../dev/stepping';
import type { BellRing } from '../lines/bell';
import type { WeaponLine } from '../lines/roster';
import { WEAPON_LINES } from '../lines/roster';
import type { RunState } from '../run';
import { createRun } from '../run';
import {
  ABSENT_CODE,
  boolCode,
  CORPSE_TIER_CODES,
  FOOD_KIND_CODES,
  foldWitness,
  NO_TARGET_ID,
  RUN_ENDING_CODES,
  WEAPON_LINE_CODES,
} from '../witness';

const FIXTURE_SEED = 20260823;

/** The fixture ring's own state, so a per-field test can move one part of it. */
const RING_LEVEL = 2;
const RING_TICKS = 5;
const RING_STRUCK: readonly number[] = [11, 12];

function ring(): BellRing {
  return { level: RING_LEVEL, ticks: RING_TICKS, struck: new Set(RING_STRUCK) };
}

/**
 * A run with every pool slot the fold walks alive and every nullable field
 * present, so a per-field test can move any one of them.
 *
 * It is hand-built rather than played, because a played run cannot be made to
 * hold a live entity of every kind at one tick and a test that moves a field
 * needs the field to exist.
 */
function fixture(): RunState {
  const run = createRun(FIXTURE_SEED);
  fillGrave(run);
  fillMob(run);
  fillShot(run);
  fillCorpse(run);
  fillSkull(run);
  fillWisp(run);
  fillRun(run);
  return run;
}

function fillRun(run: RunState): void {
  run.score = 250;
  run.reservoir = 0.375;
  run.killsSinceDrop = 3;
  run.dropsPaid = 2;
  run.nextEntityId = 16;
  run.levels.soulStream = 2;
  run.levels.headstones = 1;
  run.levels.wisps = 3;
  run.levels.bell = 4;
  run.stage.phaseIndex = 1;
  run.stage.phaseTick = 40;
  run.stage.firedRows = 2;
  run.lines.streamIn = 17;
  run.lines.surgeVolleys = 2;
  run.lines.orbitPhase = 1.25;
  run.lines.stoneRecharge[1] = 8;
  run.lines.tollIn = 90;
  run.lines.ring = ring();
}

function fillGrave(run: RunState): void {
  run.grave.x = 137.5;
  run.grave.y = 421.25;
  run.grave.size = 23.5;
  run.grave.invulnerable = 7;
}

function fillMob(run: RunState): void {
  const mob = run.mobs[0];
  mob.alive = true;
  mob.id = 11;
  mob.type = 'ghoul';
  mob.x = 60.25;
  mob.y = 90.5;
  mob.vx = 0.75;
  mob.vy = 1.25;
  mob.hp = 4;
  mob.beat = 12;
  mob.fireIn = 33;
  mob.armed = true;
}

function fillShot(run: RunState): void {
  const shot = run.mobFire[0];
  shot.alive = true;
  shot.id = 12;
  shot.emitter = 'revenant';
  shot.x = 200.5;
  shot.y = 310.75;
  shot.vx = -0.5;
  shot.vy = 2;
  shot.halfExtent = 3;
}

function fillCorpse(run: RunState): void {
  const corpse = run.corpses[0];
  corpse.alive = true;
  corpse.id = 13;
  corpse.x = 310.5;
  corpse.y = 120.25;
  corpse.freshness = 0.625;
  corpse.payout = 1.5;
  corpse.tier = 'rich';
  corpse.kind = 'drop';
  corpse.decays = false;
  corpse.line = 'wisps';
  corpse.halfExtent = 9;
}

function fillSkull(run: RunState): void {
  const skull = run.skulls[0];
  skull.alive = true;
  skull.id = 14;
  skull.x = 400.25;
  skull.y = 500.5;
  skull.vx = 0;
  skull.vy = -4;
}

function fillWisp(run: RunState): void {
  const wisp = run.wisps[0];
  wisp.alive = true;
  wisp.id = 15;
  wisp.x = 55.75;
  wisp.y = 66.5;
  wisp.vx = 1.5;
  wisp.vy = -2.5;
  wisp.life = 45;
  wisp.targetId = 11;
}

interface FieldCase {
  /** The field's path into RunState, the same spelling the partition uses. */
  readonly path: string;
  readonly move: (run: RunState) => void;
  /**
   * Puts the field back where it was. Absent only where the field cannot be
   * moved backwards at all, which is the four stream cursors: `drawn` is a
   * getter over a counter that only ever increases.
   */
  readonly restore?: (run: RunState) => void;
}

const ENTITY_CASES: readonly FieldCase[] = [
  {
    path: 'grave.x',
    move: (run) => void (run.grave.x += 1e-6),
    restore: (run) => void (run.grave.x -= 1e-6),
  },
  {
    path: 'grave.y',
    move: (run) => void (run.grave.y += 1e-6),
    restore: (run) => void (run.grave.y -= 1e-6),
  },
  {
    path: 'grave.size',
    move: (run) => void (run.grave.size += 1e-6),
    restore: (run) => void (run.grave.size -= 1e-6),
  },
  {
    path: 'grave.invulnerable',
    move: (run) => void (run.grave.invulnerable -= 1),
    restore: (run) => void (run.grave.invulnerable += 1),
  },
  {
    path: 'mobs[].x',
    move: (run) => void (run.mobs[0].x += 1e-6),
    restore: (run) => void (run.mobs[0].x -= 1e-6),
  },
  {
    path: 'mobs[].y',
    move: (run) => void (run.mobs[0].y += 1e-6),
    restore: (run) => void (run.mobs[0].y -= 1e-6),
  },
  {
    path: 'mobs[].vx',
    move: (run) => void (run.mobs[0].vx += 1e-6),
    restore: (run) => void (run.mobs[0].vx -= 1e-6),
  },
  {
    path: 'mobs[].vy',
    move: (run) => void (run.mobs[0].vy += 1e-6),
    restore: (run) => void (run.mobs[0].vy -= 1e-6),
  },
  {
    path: 'mobs[].hp',
    move: (run) => void (run.mobs[0].hp -= 1),
    restore: (run) => void (run.mobs[0].hp += 1),
  },
  {
    path: 'mobs[].beat',
    move: (run) => void (run.mobs[0].beat -= 1),
    restore: (run) => void (run.mobs[0].beat += 1),
  },
  {
    path: 'mobs[].fireIn',
    move: (run) => void (run.mobs[0].fireIn -= 1),
    restore: (run) => void (run.mobs[0].fireIn += 1),
  },
  {
    path: 'mobs[].armed',
    move: (run) => void (run.mobs[0].armed = false),
    restore: (run) => void (run.mobs[0].armed = true),
  },
  {
    path: 'mobFire[].x',
    move: (run) => void (run.mobFire[0].x += 1e-6),
    restore: (run) => void (run.mobFire[0].x -= 1e-6),
  },
  {
    path: 'mobFire[].y',
    move: (run) => void (run.mobFire[0].y += 1e-6),
    restore: (run) => void (run.mobFire[0].y -= 1e-6),
  },
  {
    path: 'mobFire[].vx',
    move: (run) => void (run.mobFire[0].vx += 1e-6),
    restore: (run) => void (run.mobFire[0].vx -= 1e-6),
  },
  {
    path: 'mobFire[].vy',
    move: (run) => void (run.mobFire[0].vy += 1e-6),
    restore: (run) => void (run.mobFire[0].vy -= 1e-6),
  },
  {
    path: 'corpses[].x',
    move: (run) => void (run.corpses[0].x += 1e-6),
    restore: (run) => void (run.corpses[0].x -= 1e-6),
  },
  {
    path: 'corpses[].y',
    move: (run) => void (run.corpses[0].y += 1e-6),
    restore: (run) => void (run.corpses[0].y -= 1e-6),
  },
  {
    path: 'corpses[].freshness',
    move: (run) => void (run.corpses[0].freshness -= 1e-6),
    restore: (run) => void (run.corpses[0].freshness += 1e-6),
  },
  {
    path: 'corpses[].payout',
    move: (run) => void (run.corpses[0].payout += 1e-6),
    restore: (run) => void (run.corpses[0].payout -= 1e-6),
  },
  {
    path: 'corpses[].tier',
    move: (run) => void (run.corpses[0].tier = 'trash'),
    restore: (run) => void (run.corpses[0].tier = 'rich'),
  },
  {
    path: 'corpses[].kind',
    move: (run) => void (run.corpses[0].kind = 'feast'),
    restore: (run) => void (run.corpses[0].kind = 'drop'),
  },
  {
    path: 'corpses[].line',
    move: (run) => void (run.corpses[0].line = 'bell'),
    restore: (run) => void (run.corpses[0].line = 'wisps'),
  },
  {
    path: 'skulls[].x',
    move: (run) => void (run.skulls[0].x += 1e-6),
    restore: (run) => void (run.skulls[0].x -= 1e-6),
  },
  {
    path: 'skulls[].y',
    move: (run) => void (run.skulls[0].y += 1e-6),
    restore: (run) => void (run.skulls[0].y -= 1e-6),
  },
  {
    path: 'skulls[].vx',
    move: (run) => void (run.skulls[0].vx += 1e-6),
    restore: (run) => void (run.skulls[0].vx -= 1e-6),
  },
  {
    path: 'skulls[].vy',
    move: (run) => void (run.skulls[0].vy += 1e-6),
    restore: (run) => void (run.skulls[0].vy -= 1e-6),
  },
  {
    path: 'wisps[].x',
    move: (run) => void (run.wisps[0].x += 1e-6),
    restore: (run) => void (run.wisps[0].x -= 1e-6),
  },
  {
    path: 'wisps[].y',
    move: (run) => void (run.wisps[0].y += 1e-6),
    restore: (run) => void (run.wisps[0].y -= 1e-6),
  },
  {
    path: 'wisps[].vx',
    move: (run) => void (run.wisps[0].vx += 1e-6),
    restore: (run) => void (run.wisps[0].vx -= 1e-6),
  },
  {
    path: 'wisps[].vy',
    move: (run) => void (run.wisps[0].vy += 1e-6),
    restore: (run) => void (run.wisps[0].vy -= 1e-6),
  },
  {
    path: 'wisps[].life',
    move: (run) => void (run.wisps[0].life -= 1),
    restore: (run) => void (run.wisps[0].life += 1),
  },
  {
    path: 'wisps[].targetId',
    move: (run) => void (run.wisps[0].targetId = null),
    restore: (run) => void (run.wisps[0].targetId = 11),
  },
];

const RUN_CASES: readonly FieldCase[] = [
  {
    path: 'score',
    move: (run) => void (run.score += 1e-6),
    restore: (run) => void (run.score -= 1e-6),
  },
  {
    path: 'reservoir',
    move: (run) => void (run.reservoir += 1e-6),
    restore: (run) => void (run.reservoir -= 1e-6),
  },
  {
    path: 'ending',
    move: (run) => void (run.ending = 'sealed'),
    restore: (run) => void (run.ending = null),
  },
  {
    path: 'killsSinceDrop',
    move: (run) => void (run.killsSinceDrop += 1),
    restore: (run) => void (run.killsSinceDrop -= 1),
  },
  {
    path: 'dropsPaid',
    move: (run) => void (run.dropsPaid += 1),
    restore: (run) => void (run.dropsPaid -= 1),
  },
  {
    path: 'nextEntityId',
    move: (run) => void (run.nextEntityId += 1),
    restore: (run) => void (run.nextEntityId -= 1),
  },
  {
    path: 'levels.soulStream',
    move: (run) => void (run.levels.soulStream += 1),
    restore: (run) => void (run.levels.soulStream -= 1),
  },
  {
    path: 'levels.headstones',
    move: (run) => void (run.levels.headstones += 1),
    restore: (run) => void (run.levels.headstones -= 1),
  },
  {
    path: 'levels.wisps',
    move: (run) => void (run.levels.wisps += 1),
    restore: (run) => void (run.levels.wisps -= 1),
  },
  {
    path: 'levels.bell',
    move: (run) => void (run.levels.bell += 1),
    restore: (run) => void (run.levels.bell -= 1),
  },
  {
    path: 'streams.spawns.drawn',
    move: (run) => void run.streams.spawns.next(),
  },
  { path: 'streams.drops.drawn', move: (run) => void run.streams.drops.next() },
  {
    path: 'streams.mobFire.drawn',
    move: (run) => void run.streams.mobFire.next(),
  },
  { path: 'streams.shed.drawn', move: (run) => void run.streams.shed.next() },
  {
    path: 'stage.phaseIndex',
    move: (run) => void (run.stage.phaseIndex += 1),
    restore: (run) => void (run.stage.phaseIndex -= 1),
  },
  {
    path: 'stage.phaseTick',
    move: (run) => void (run.stage.phaseTick += 1),
    restore: (run) => void (run.stage.phaseTick -= 1),
  },
  {
    path: 'stage.firedRows',
    move: (run) => void (run.stage.firedRows += 1),
    restore: (run) => void (run.stage.firedRows -= 1),
  },
  {
    path: 'lines.streamIn',
    move: (run) => void (run.lines.streamIn -= 1),
    restore: (run) => void (run.lines.streamIn += 1),
  },
  {
    path: 'lines.surgeVolleys',
    move: (run) => void (run.lines.surgeVolleys -= 1),
    restore: (run) => void (run.lines.surgeVolleys += 1),
  },
  {
    path: 'lines.orbitPhase',
    move: (run) => void (run.lines.orbitPhase += 1e-6),
    restore: (run) => void (run.lines.orbitPhase -= 1e-6),
  },
  {
    path: 'lines.stoneRecharge[]',
    move: (run) => void (run.lines.stoneRecharge[1] -= 1),
    restore: (run) => void (run.lines.stoneRecharge[1] += 1),
  },
  {
    path: 'lines.tollIn',
    move: (run) => void (run.lines.tollIn -= 1),
    restore: (run) => void (run.lines.tollIn += 1),
  },
  {
    path: 'lines.ring.level',
    // The level is captured at strike time and read-only on the record, so the
    // only way to move it is to hand the line a different ring.
    move: (run) => void (run.lines.ring = { ...ring(), level: RING_LEVEL + 1 }),
    restore: (run) => void (run.lines.ring = ring()),
  },
  {
    path: 'lines.ring.ticks',
    move: (run) => void (run.lines.ring!.ticks += 1),
    restore: (run) => void (run.lines.ring!.ticks -= 1),
  },
  {
    path: 'lines.ring.struck',
    move: (run) => void run.lines.ring!.struck.add(13),
    restore: (run) => void run.lines.ring!.struck.delete(13),
  },
];

const FIELD_CASES: readonly FieldCase[] = [...ENTITY_CASES, ...RUN_CASES];

function runFieldCase(field: FieldCase): void {
  const run = fixture();
  const before = foldWitness(run, 0);
  field.move(run);
  expect(foldWitness(run, 0)).not.toBe(before);
  if (field.restore === undefined) return;
  field.restore(run);
  expect(foldWitness(run, 0)).toBe(before);
}

/** Every field the fold covers. One half of the partition (ADR 0019). */
const FOLDED: readonly string[] = [
  'grave.x',
  'grave.y',
  'grave.size',
  'grave.invulnerable',
  'mobs[].x',
  'mobs[].y',
  'mobs[].vx',
  'mobs[].vy',
  'mobs[].hp',
  'mobs[].beat',
  'mobs[].fireIn',
  'mobs[].armed',
  'mobFire[].x',
  'mobFire[].y',
  'mobFire[].vx',
  'mobFire[].vy',
  'corpses[].x',
  'corpses[].y',
  'corpses[].freshness',
  'corpses[].payout',
  'corpses[].tier',
  'corpses[].kind',
  'corpses[].line',
  'skulls[].x',
  'skulls[].y',
  'skulls[].vx',
  'skulls[].vy',
  'wisps[].x',
  'wisps[].y',
  'wisps[].vx',
  'wisps[].vy',
  'wisps[].life',
  'wisps[].targetId',
  'score',
  'reservoir',
  'ending',
  'killsSinceDrop',
  'dropsPaid',
  'nextEntityId',
  'levels.soulStream',
  'levels.headstones',
  'levels.wisps',
  'levels.bell',
  'streams.spawns.drawn',
  'streams.drops.drawn',
  'streams.mobFire.drawn',
  'streams.shed.drawn',
  'stage.phaseIndex',
  'stage.phaseTick',
  'stage.firedRows',
  'lines.streamIn',
  'lines.surgeVolleys',
  'lines.orbitPhase',
  'lines.stoneRecharge[]',
  'lines.tollIn',
  'lines.ring.level',
  'lines.ring.ticks',
  'lines.ring.struck',
];

/**
 * Every field the fold deliberately skips, with the reason beside it. The other
 * half of the partition, and it is not optional: naming only the folded half
 * would let a new field added to neither list pass unnoticed.
 */
const EXCLUDED: Readonly<Record<string, string>> = {
  seed: "the run's identity, fixed by createRun and never mutated by the rules. The tape header carries it.",
  tick: "the witness's own address. A checkpoint at index N is by definition the state after executeTick has run N times, so the tick names a fold rather than being part of one.",
  'mobs[].alive':
    'gates the walk. A dead slot contributes nothing at all, so liveness already moves the fold by deciding which entities are folded.',
  'mobs[].id':
    "spawn identity, summarised by nextEntityId, which is folded. A slot's own id follows from the spawn order the walk already witnesses.",
  'mobs[].type':
    'written once at spawn (mobs.ts:340) and never mutated. A divergence in type shows through the hp, motion and hitbox the walk folds.',
  'mobFire[].alive': 'gates the walk, as mobs[].alive does.',
  'mobFire[].id': 'spawn identity, as mobs[].id is.',
  'mobFire[].emitter':
    "written once at spawn from the firing mob's type (mobs.ts:416) and never mutated.",
  'mobFire[].halfExtent':
    "written once at spawn from the emitter's fire row (mobs.ts:421) and never mutated.",
  'corpses[].alive': 'gates the walk, as mobs[].alive does.',
  'corpses[].id': 'spawn identity, as mobs[].id is.',
  'corpses[].decays':
    'written once at spawn from the kind, which is folded: treasure never decays and a corpse always does.',
  'corpses[].halfExtent':
    'written once at spawn from the kind, which is folded: a drop is larger than a corpse.',
  'skulls[].alive': 'gates the walk, as mobs[].alive does.',
  'skulls[].id': 'spawn identity, as mobs[].id is.',
  'wisps[].alive': 'gates the walk, as mobs[].alive does.',
  'wisps[].id': 'spawn identity, as mobs[].id is.',
  'streams.spawns.next': 'a draw function, not state. Its cursor is folded.',
  'streams.spawns.nextInt': 'a draw function, not state.',
  'streams.drops.next': 'a draw function, not state. Its cursor is folded.',
  'streams.drops.nextInt': 'a draw function, not state.',
  'streams.mobFire.next': 'a draw function, not state. Its cursor is folded.',
  'streams.mobFire.nextInt': 'a draw function, not state.',
  'streams.shed.next': 'a draw function, not state. Its cursor is folded.',
  'streams.shed.nextInt': 'a draw function, not state.',
};

/**
 * Every leaf field of a value, as a path. Arrays walk their first element under
 * a `[]` segment because a pool's slots all carry the same fields, and a Set is
 * a leaf because its members are values rather than fields.
 */
function fieldPaths(value: unknown, path: string): string[] {
  if (value === null || value === undefined) return [path];
  if (typeof value === 'function') return [path];
  if (value instanceof Set) return [path];
  if (Array.isArray(value)) {
    if (value.length === 0) return [path];
    return fieldPaths(value[0], `${path}[]`);
  }
  if (typeof value !== 'object') return [path];
  return Object.entries(value).flatMap(([key, nested]) =>
    fieldPaths(nested, path === '' ? key : `${path}.${key}`),
  );
}

const EXCLUDED_PATHS = new Set(Object.keys(EXCLUDED));

function undecided(paths: readonly string[]): string[] {
  return paths
    .filter((path) => !FOLDED.includes(path) && !EXCLUDED_PATHS.has(path))
    .sort();
}

describe('the closed field list', () => {
  it('every nested field is either folded or excluded with a reason beside it', () => {
    const walked = fieldPaths(fixture(), '');
    expect(undecided(walked)).toEqual([]);
    // And the other direction, so a field that goes away takes its entry with
    // it rather than leaving a name nothing answers to.
    const listed = [...FOLDED, ...EXCLUDED_PATHS];
    expect(listed.filter((path) => !walked.includes(path)).sort()).toEqual([]);
  });

  it('a field in neither list fails the assertion', () => {
    // The proof that the guard is a guard: a nested field nobody has decided
    // about is named, rather than passing over an empty set.
    const invented = fieldPaths({ stage: { phaseIndex: 0, drainOut: 0 } }, '');
    expect(undecided(invented)).toEqual(['stage.drainOut']);
  });

  it('every folded field carries a perturbation, so none goes untested', () => {
    const perturbed = FIELD_CASES.map((field) => field.path);
    expect(FOLDED.filter((path) => !perturbed.includes(path))).toEqual([]);
    expect(perturbed.filter((path) => !FOLDED.includes(path))).toEqual([]);
  });

  it('no field appears in both halves of the partition', () => {
    expect(FOLDED.filter((path) => EXCLUDED_PATHS.has(path))).toEqual([]);
  });
});

describe('one field at a time', () => {
  for (const field of FIELD_CASES) {
    it(`the fold moves when ${field.path} alone moves`, () => {
      runFieldCase(field);
    });
  }
});

const WEAPON_LINE_NAMES: readonly WeaponLine[] = [
  'soulStream',
  'headstones',
  'wisps',
  'bell',
];

describe('the fold order over the weapon lines', () => {
  it("WEAPON_LINES is frozen in the order every sealed tape's witness folded", () => {
    // The witness fold traverses WEAPON_LINES in array order and sealed tapes
    // exist outside the tree, so a reorder silently changes every witness. A
    // change to this order needs a witness version bump, never a test update.
    expect(WEAPON_LINES).toEqual(['soulStream', 'headstones', 'wisps', 'bell']);
  });
});

describe('the four non-numeric encodings', () => {
  it('a boolean folds through an explicit 0 or 1', () => {
    expect(boolCode(false)).toBe(0);
    expect(boolCode(true)).toBe(1);
  });

  it('an absent wisp target folds through the 0 sentinel no id can take', () => {
    expect(NO_TARGET_ID).toBe(0);
    // The sentinel is safe only because no entity can ever hold id 0.
    expect(createRun(FIXTURE_SEED).nextEntityId).toBe(1);

    const absent = fixture();
    absent.wisps[0].targetId = null;
    const zero = fixture();
    zero.wisps[0].targetId = NO_TARGET_ID;
    expect(foldWitness(absent, 0)).toBe(foldWitness(zero, 0));
  });

  it('the run ending code map is pinned by name and never by ordinal', () => {
    // Read by name, so reordering the union cannot move a single tape's
    // witness, and typed as a total Record, so adding a member fails the
    // typecheck until somebody gives it a code.
    expect(RUN_ENDING_CODES).toEqual({ sealed: 1, victory: 2 });
  });

  it('the corpse tier code map is pinned by name and never by ordinal', () => {
    expect(CORPSE_TIER_CODES).toEqual({ trash: 1, rich: 2 });
  });

  it('the food kind code map is pinned by name and never by ordinal', () => {
    expect(FOOD_KIND_CODES).toEqual({ corpse: 1, drop: 2, feast: 3 });
  });

  it('the weapon line code map is pinned by name and never by ordinal', () => {
    expect(WEAPON_LINE_CODES).toEqual({
      soulStream: 1,
      headstones: 2,
      wisps: 3,
      bell: 4,
    });
  });

  it('no code map member may take the reserved absent code', () => {
    const codes = [
      ...Object.values(RUN_ENDING_CODES),
      ...Object.values(CORPSE_TIER_CODES),
      ...Object.values(FOOD_KIND_CODES),
      ...Object.values(WEAPON_LINE_CODES),
    ];
    expect(codes.filter((code) => code === ABSENT_CODE)).toEqual([]);
  });

  it('an absent corpse line folds through the reserved absent code', () => {
    const absent = fixture();
    absent.corpses[0].line = undefined;
    const witness = foldWitness(absent, 0);
    for (const line of WEAPON_LINE_NAMES) {
      const present = fixture();
      present.corpses[0].line = line;
      expect(foldWitness(present, 0)).not.toBe(witness);
    }
  });

  it('an absent ring folds differently from a ring whose fields are zero', () => {
    const absent = fixture();
    absent.lines.ring = null;
    const zeroed = fixture();
    zeroed.lines.ring = { level: 0, ticks: 0, struck: new Set() };
    expect(foldWitness(zeroed, 0)).not.toBe(foldWitness(absent, 0));
  });

  it('the struck set folds its members in iteration order', () => {
    const forward = fixture();
    forward.lines.ring = { ...ring(), struck: new Set([21, 22]) };
    const backward = fixture();
    backward.lines.ring = { ...ring(), struck: new Set([22, 21]) };
    expect(foldWitness(backward, 0)).not.toBe(foldWitness(forward, 0));
  });
});

describe('chained across ticks and snapshotted at a checkpoint', () => {
  it('the same state and the same starting value give the same number', () => {
    expect(foldWitness(fixture(), 0)).toBe(foldWitness(fixture(), 0));
  });

  it('the starting value changes the result, which is what chaining uses', () => {
    const run = fixture();
    expect(foldWitness(run, 1)).not.toBe(foldWitness(run, 0));
  });

  it('a snapshot depends only on the state at that checkpoint', () => {
    // Each checkpoint is an independent snapshot rather than a link in a chain
    // (ADR 0019), so a fold taken at tick 30 cannot depend on whether folds
    // were taken at ticks 10 and 20 of the same run.
    expect(snapshotAt30([30])).toBe(snapshotAt30([10, 20, 30]));
  });
});

const SNAPSHOT_SEED = 20260819;

/** A played run's witness at tick 30, folded at each of the ticks named. */
function snapshotAt30(foldAt: readonly number[]): number {
  const run = createRun(SNAPSHOT_SEED);
  const step = stepping(run);
  let snapshot = 0;
  for (let tick = 1; tick <= 30; tick++) {
    step({ move: { x: 0.5, y: -0.25 }, belch: false });
    if (foldAt.includes(tick)) snapshot = foldWitness(run, 0);
  }
  return snapshot;
}
