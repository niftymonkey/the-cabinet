// The grave's size, its motion, and the consequence of mob fire meeting it.
// Hides ADR 0003 entirely: no other module knows what a hit costs.

import type { MoveCommand } from './command';
import { POWER_UP_HALF_EXTENT, spawnFallenRung } from './corpses';
import type { SimEvent } from './events';
import { FIELD_HEIGHT, FIELD_WIDTH } from './field';
import type { MobType } from './mobs';
import type { WeaponLine } from './lines/roster';
import { BIRTHRIGHT, MAX_LEVEL } from './lines/roster';
import { spreadX } from './offer';
import type { Rect } from './overlap';
import type { RunState } from './run';
import type { BossKind } from './stage/waves';
import {
  BASE_SPEED,
  GRAVE_ASPECT,
  HIT_SHRINK,
  INVULNERABLE_TICKS,
  SIZE_CEILING,
  SIZE_FLOOR,
  SIZE_START,
} from './tuning';

// Where a run's grave stands: centred across the field and low in it, the
// shmup's own starting mark, with the whole field ahead of it.
const START_X = FIELD_WIDTH / 2;
const START_Y = FIELD_HEIGHT * 0.8;

/**
 * Who hurt the player (#48): the mob type whose shot landed, the boss whose
 * pattern landed, or body contact.
 *
 * A boss is one of the answers because a boss's pattern is mob fire by the
 * glossary's own definition, and which boss's pattern is landing on the player
 * is exactly what the harness's damage reading is asked.
 */
type GraveHitSource = MobType | BossKind | 'contact';

interface Grave {
  x: number;
  y: number;
  // The one scalar: the half-height. Width follows at a fixed aspect.
  size: number;
  // Ticks of invulnerability left. Zero means a hit lands.
  invulnerable: number;
  /**
   * Whether the floor ladder has already spent its score rung without yet
   * having it back (design record `show-what-you-have.md` R4).
   *
   * It is the grave's and not the run's because growth is what gives the rung
   * back and growGrave takes a Grave: kept on the run, this module's own rule
   * would have to be cleared from swallow.ts.
   */
  scoreRungBled: boolean;
}

/**
 * Says that a run did not start at the size it asked for, because nothing
 * abnormal is silent. It fires at most once per run: one createGrave call is
 * what a run is born from, so no flag is needed to keep the sim from flooding.
 */
const reportUnhonouredSize = (asked: number, started: number): void => {
  console.warn(
    `a run asked to start at size ${asked}, outside ADR 0003's ${SIZE_FLOOR} to ${SIZE_CEILING}; it starts at ${started} instead, so a pinned ?size= or a replayed tape header does not get the grave it named`,
  );
};

/**
 * A grave at the starting mark, at the size the run asks for. The size is
 * clamped here rather than by the caller, because ADR 0003's floor and ceiling
 * are this module's to defend and ?size= arrives from src/app unclamped.
 */
const createGrave = (size: number = SIZE_START): Grave => {
  const started = clamp(size, SIZE_FLOOR, SIZE_CEILING);
  if (started !== size) reportUnhonouredSize(size, started);
  return {
    x: START_X,
    y: START_Y,
    size: started,
    invulnerable: 0,
    scoreRungBled: false,
  };
};

/**
 * Width from the one scalar, at the fixed aspect (ADR 0003). Size is the
 * half-height, so at GRAVE_ASPECT 2 the width equals the size scalar exactly:
 * that reads as a bug otherwise.
 */
const graveWidth = (size: number): number => {
  return (size * 2) / GRAVE_ASPECT;
};

/**
 * The grave's hitbox in field units, as a top-left corner and a size. It shrinks
 * with size, so a smaller grave is a harder target.
 */
const graveHitbox = (grave: Grave): Rect => {
  const width = graveWidth(grave.size);
  return {
    x: grave.x - width / 2,
    y: grave.y - grave.size,
    width,
    height: grave.size * 2,
  };
};

const clamp = (value: number, low: number, high: number): number => {
  return Math.min(Math.max(value, low), high);
};

// Holds the whole grave inside the field, accounting for its own width and height.
const containGrave = (grave: Grave): void => {
  const halfWidth = graveWidth(grave.size) / 2;
  grave.x = clamp(grave.x, halfWidth, FIELD_WIDTH - halfWidth);
  grave.y = clamp(grave.y, grave.size, FIELD_HEIGHT - grave.size);
};

/**
 * Applies a move command in base-speed units exactly as given, then holds the
 * grave inside the field.
 *
 * The command is applied as given and is neither normalized nor capped: ADR
 * 0011 puts both in each input model and deliberately leaves touch uncapped,
 * recording that capping touch to keyboard feel was the input lag felt on
 * device. A cap here would silently undo that for touch.
 */
const moveGrave = (grave: Grave, command: MoveCommand): void => {
  grave.x += command.x * BASE_SPEED;
  grave.y += command.y * BASE_SPEED;
  containGrave(grave);
};

/**
 * The size at which the floor ladder has its score rung back: a full hit's
 * worth of growth off the floor (design record R4).
 *
 * A crumb is deliberately not enough. A fully stale trash corpse pays 0.025
 * units against a fresh one's 0.10125, so a rung given back at any growth at
 * all would be bought back invisibly inside the mow, which is the hole the rule
 * above it exists to close one step up.
 */
const SCORE_RUNG_REARM_SIZE = SIZE_FLOOR + HIT_SHRINK;

/**
 * Grows the grave and returns whatever did not fit under the ceiling, as
 * overflow (ADR 0003). A wider grave can end up straddling an edge it was
 * pressed against, so the containment runs again here rather than waiting for
 * the next move command.
 *
 * Growing a full hit's worth off the floor is also what gives the score rung
 * back (design record R4), and it lands here because this is where growth
 * lands: the rule reads end to end in the module that owns the ladder.
 */
const growGrave = (grave: Grave, amount: number): number => {
  const grown = grave.size + amount;
  grave.size = Math.min(grown, SIZE_CEILING);
  if (grave.size >= SCORE_RUNG_REARM_SIZE) grave.scoreRungBled = false;
  containGrave(grave);
  return Math.max(0, grown - SIZE_CEILING);
};

// One tick of the grave: invulnerability counts down.
const ageGrave = (grave: Grave): void => {
  if (grave.invulnerable > 0) grave.invulnerable -= 1;
};

// The whole score, gone. The score tier is exactly one rung, so it never partly bleeds.
const bleedScore = (state: RunState): SimEvent[] => {
  const amount = state.score;
  state.score = 0;
  return [{ type: 'scoreBled', amount }];
};

// The level a line can never be stripped below (glossary: birthright).
const levelFloor = (line: WeaponLine): number => {
  return BIRTHRIGHT.includes(line) ? 1 : 0;
};

/**
 * The lines this hit can take a rung off, in the run's own roster order
 * (ADR 0046, design record R3 and R6).
 *
 * It walks the roster rather than the build's four, so the bodies the strip
 * drops stand in the order the HUD's rows read. It changes no order today,
 * because implementsLines already keeps a roster inside the pool; it is the
 * line a fifth weapon would break.
 */
const strippableLines = (state: RunState): WeaponLine[] => {
  return state.roster.filter((line) => state.levels[line] > levelFloor(line));
};

/**
 * How far below the grave's own centre a fallen rung stands, in field units. An
 * initial data row.
 *
 * Downfield rather than upfield, which is decision 20's own "how far down the
 * rung body spawns": an upfield body is scrolled back into the swallow box
 * within a tick or two and hands the rung to a player who only has to hold the
 * lane, which is the Salamander shape Mark rejected.
 *
 * Far enough to clear the swallow box on the tick it falls, and one tick of the
 * grave's own travel further. A strip runs only at the size floor, so the
 * grave's half-height there is SIZE_FLOOR exactly and the body's own is the
 * treasure extent; a grave already diving at full speed therefore cannot reach
 * a body on the tick after the fall either. That is the transferable half of
 * Sonic's no-recollect window, as geometry rather than as a clock: the loss
 * registers before the chase can connect.
 *
 * There is no containment on y. Where the field has no room below the grave the
 * offset is mirrored above it instead, which fallenRungY rules.
 */
const FALLEN_RUNG_DROP = SIZE_FLOOR + POWER_UP_HALF_EXTENT + BASE_SPEED;

/**
 * Which side of the grave the strip's bodies stand on: the drop below it, or
 * the same offset mirrored above it when there is no room below (orchestrator,
 * 2026-09-16, under design record R6 and Mark's ask).
 *
 * No room below means the downfield spawn would put a body's own extent past
 * the field's bottom edge, where it is lost on the tick it fell. Mark's ask is
 * a lost level the player can see fall and dive to catch, and a rung that never
 * appears cannot be dived for, so the drop mirrors rather than vanishing.
 *
 * Mirrored at the same offset, so an upfield body clears the swallow box by the
 * margin a downfield one does and the loss is never handed straight back. The
 * scroll then carries it down toward the grave and past it, which is a window
 * to re-catch it rather than the Salamander hand-back an upfield spawn with
 * room below would be, and it is lost off the bottom edge like any other body
 * if nobody takes it.
 */
const fallenRungY = (graveY: number): number => {
  const below = graveY + FALLEN_RUNG_DROP;
  const roomBelow = below + POWER_UP_HALF_EXTENT <= FIELD_HEIGHT;
  return roomBelow ? below : graveY - FALLEN_RUNG_DROP;
};

/**
 * One body per rung the strip took, standing apart at the offer's own spacing
 * in roster order, centred on the grave's x and shifted whole to stay inside
 * the field (ADR 0055, decision 24, design record R6).
 *
 * The group shifts rather than each body clamping on its own, which is the
 * offer's rule and the reason it is one function: clamping each would stack two
 * rungs on one x at exactly the edge a pinned player takes the hit against, and
 * the choice of which line to save is the whole point of the spread.
 */
const dropFallenRungs = (
  state: RunState,
  lines: readonly WeaponLine[],
): SimEvent[] => {
  const events: SimEvent[] = [];
  const y = fallenRungY(state.grave.y);
  for (const [index, line] of lines.entries()) {
    const at = spreadX(state.grave.x, lines.length, index);
    events.push(...spawnFallenRung(state, at, y, line));
  }
  return events;
};

/**
 * One level off every line that has one to give, and one body onto the field
 * per rung taken. Taking the whole loadout down a step bounds the ladder at
 * five rungs whatever the build, so a great run and a poor one die at the same
 * length, and each rung visibly thins the entire storm in one beat.
 *
 * The strip is announced before the bodies, so a reader meets the loss and then
 * what is left of it, which is the order the player sees it in.
 */
const stripLevels = (state: RunState): SimEvent[] => {
  const lines = strippableLines(state);
  for (const line of lines) state.levels[line] -= 1;
  const stripped: SimEvent = { type: 'weaponStripped', lines };
  return [stripped, ...dropFallenRungs(state, lines)];
};

/**
 * The dive catching a fallen rung: the line it came off gets its rung back and
 * no other line moves (decision 24), and a line already at its cap is never
 * taken past it (ADR 0034's MAX_LEVEL).
 *
 * The event fires on the catch and not on the restore, so a rung caught onto a
 * line that climbed back to its cap in the meantime is still a catch: the
 * player dived and took the body, and a reading that counted only the ones that
 * paid would measure the ladder rather than the dive.
 *
 * A fallen rung with no line is a value this module produced, so a missing one
 * is a bug and fails loudly rather than being repaired into some other line's
 * rung.
 */
const catchRung = (
  state: RunState,
  line: WeaponLine | undefined,
): SimEvent[] => {
  if (line === undefined) {
    throw new Error('a fallen rung was swallowed carrying no line');
  }
  if (state.levels[line] < MAX_LEVEL) state.levels[line] += 1;
  return [{ type: 'rungCaught', line, level: state.levels[line] }];
};

const sealShut = (state: RunState): SimEvent[] => {
  state.ending = 'sealed';
  return [{ type: 'sealed', tick: state.tick }];
};

/**
 * ADR 0003's floor ladder, one rung per hit. The floor is hard, so a hit here
 * never shrinks: it bleeds all of the score, then takes one level off every
 * line, and only when nothing is left to bleed does it seal the grave shut.
 *
 * Every ladder run spends the score rung, the run that finds no score included,
 * and only growth gives it back (design record R4). A rung the next kill
 * re-armed would be a floor the storm paid for: at the storm's measured 2.47
 * kills a second the level strip could fire only where nothing was dying, and
 * ADR 0003 says the floor is never immortality.
 */
const runFloorLadder = (state: RunState): SimEvent[] => {
  const rungArmed = !state.grave.scoreRungBled;
  state.grave.scoreRungBled = true;
  if (rungArmed && state.score > 0) return bleedScore(state);
  if (strippableLines(state).length > 0) return stripLevels(state);
  return sealShut(state);
};

/**
 * Mob fire meeting the grave. Ignored while invulnerable. Runs ADR 0003's floor
 * ladder when the grave cannot shrink.
 *
 * This is the single entry point for every kind of damage: mob contact routes
 * through it rather than shrinking the grave itself, so the invulnerability
 * window, the ladder and the events stay in one place.
 *
 * Every landed hit starts invulnerability, a floor hit that does not shrink
 * included. The window is ADR 0040's dim refractory interval, and a floor hit
 * that skipped it would let the ladder run in consecutive ticks: sixty
 * full-field dims a second, in the exact state where the player is one hit from
 * sealed shut.
 */
const hitGrave = (state: RunState, source: GraveHitSource): SimEvent[] => {
  const grave = state.grave;
  if (grave.invulnerable > 0) return [];
  const atFloor = grave.size <= SIZE_FLOOR;
  if (!atFloor) grave.size = Math.max(SIZE_FLOOR, grave.size - HIT_SHRINK);
  grave.invulnerable = INVULNERABLE_TICKS;
  const hit: SimEvent = {
    type: 'graveHit',
    source,
    size: grave.size,
    invulnerable: grave.invulnerable,
  };
  return atFloor ? [hit, ...runFloorLadder(state)] : [hit];
};

export {
  createGrave,
  graveWidth,
  graveHitbox,
  moveGrave,
  growGrave,
  ageGrave,
  hitGrave,
  catchRung,
  SCORE_RUNG_REARM_SIZE,
};
export type { GraveHitSource, Grave };
