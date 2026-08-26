/**
 * Keyboard steering as a pure model: no DOM in it at all. It holds the set of
 * held key codes and turns them into a move command in base-speed units.
 *
 * Normalization and the speed setting both live here rather than in the sim.
 * ADR 0011 puts them in each input model, and moveGrave deliberately applies
 * the command as given, so a cap or a normalization in src/game would silently
 * undo the ADR's uncapped touch drag.
 */

import type { MoveCommand } from '../game/run';

/**
 * How much of the designated speed a held focus key leaves (glossary: focus).
 *
 * A first pass, and the tuning dispatch owns it. Touhou tunes focused speed per
 * character rather than at a fixed fraction, and its derived ratios land around
 * 0.40 to 0.44, so 0.5 is a defensible opening number and definitely a feel
 * number. A retune after Mark plays is a tuning change, not a rules change.
 */
const FOCUS_FACTOR = 0.5;

/** ADR 0011's narrowed player speed range, 0.75x to 1.5x. */
const MULTIPLIER_MIN = 0.75;
const MULTIPLIER_MAX = 1.5;

interface KeySteerOptions {
  /** The persisted player speed setting, 0.75 to 1.5 (ADR 0011). */
  readonly multiplier: number;
}

/**
 * The steering codes, as physical codes and never event.key. An ev.key
 * character fallback is a recorded dead end: on the iPad-over-Windows remote
 * path it caused stuck keys and was reverted.
 */
const DIRECTIONS: Readonly<Record<string, MoveCommand>> = {
  KeyW: { x: 0, y: -1 },
  KeyA: { x: -1, y: 0 },
  KeyS: { x: 0, y: 1 },
  KeyD: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowDown: { x: 0, y: 1 },
  ArrowRight: { x: 1, y: 0 },
};

const FOCUS_CODES = ['ShiftLeft', 'ShiftRight'];

const STILL: MoveCommand = { x: 0, y: 0 };

const clampMultiplier = (value: number): number => {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(value, MULTIPLIER_MIN), MULTIPLIER_MAX);
};

/**
 * The sum of every held direction, with opposed keys cancelling to zero on
 * their axis. Left-wins is the alternative and it does not survive a player
 * rolling their hand across a keyboard.
 */
const sumHeld = (held: ReadonlySet<string>): MoveCommand => {
  let x = 0;
  let y = 0;
  for (const code of held) {
    const direction = DIRECTIONS[code];
    if (!direction) continue;
    x += direction.x;
    y += direction.y;
  }
  return { x, y };
};

/**
 * A command no longer than one unit, so a diagonal is not faster than a
 * cardinal (ADR 0011).
 *
 * Math.sqrt rather than math.ts, and this is newer than most readers expect:
 * tc39/ecma262 PR #3345 made Math.sqrt correctly rounded in 2024, so it needs
 * no rounding gate, while a reader working from the 2024 edition will find it
 * listed as implementation-approximated and think this is wrong. V8,
 * SpiderMonkey and JavaScriptCore all comply. Math.hypot is still approximated
 * and is deliberately not used.
 */
const normalize = (command: MoveCommand): MoveCommand => {
  const length = Math.sqrt(command.x * command.x + command.y * command.y);
  if (length <= 1) return command;
  return { x: command.x / length, y: command.y / length };
};

const scale = (command: MoveCommand, factor: number): MoveCommand => {
  return { x: command.x * factor, y: command.y * factor };
};

class KeySteer {
  private readonly held = new Set<string>();
  private multiplier: number;

  constructor(options: KeySteerOptions) {
    this.multiplier = clampMultiplier(options.multiplier);
  }

  public press(code: string): void {
    this.held.add(code);
  }

  public release(code: string): void {
    this.held.delete(code);
  }

  /** Every key let go at once, which is what a window blur and a pause both need. */
  public releaseAll(): void {
    this.held.clear();
  }

  public setMultiplier(value: number): void {
    this.multiplier = clampMultiplier(value);
  }

  private isFocused(): boolean {
    return FOCUS_CODES.some((code) => this.held.has(code));
  }

  /**
   * The held keys as one move command: sum the directions, normalize, scale by
   * the speed setting, then halve while focus is held.
   */
  public command(): MoveCommand {
    const summed = sumHeld(this.held);
    if (summed.x === 0 && summed.y === 0) return STILL;
    const speed = this.isFocused()
      ? this.multiplier * FOCUS_FACTOR
      : this.multiplier;
    return scale(normalize(summed), speed);
  }
}

export { KeySteer, FOCUS_FACTOR, MULTIPLIER_MIN, MULTIPLIER_MAX };
export type { KeySteerOptions };
