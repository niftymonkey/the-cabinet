// The run's controls: what a held key, a dragged finger and a belch press become.

import type { FederatedPointerEvent } from 'pixi.js';

import type { CommandSource, MoveCommand } from '../../../game/command';
import type { FieldPoint } from '../../../game/field';
import { SHORTEST_FIELD } from '../../../game/field';
import { BASE_SPEED } from '../../../game/tuning';
import { KeySteer } from '../../../input/keys';
import { combineSteer } from '../../../input/steering';
import type { ColumnPoint } from '../../../input/touch';
import { TouchSteer } from '../../../input/touch';
import type { FieldPlacement } from '../../layout';
import { screenToColumn } from '../../layout';
import { userSettings } from '../../userSettings';
import type { PlayLayer } from './playLayer';
import { columnToPlay, playToColumn } from './playLayer';
import type { Scene } from './scene';
import { sceneFor } from './scene';

// The codes the page would otherwise scroll on. Space joins them so the page cannot scroll under a belch.
const SCROLL_CODES = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
];

/**
 * The belch's keyboard binding, as physical codes.
 *
 * Space is the free, unambiguous key on this layout: there is no manual shot to
 * bind it to, Shift is already focus, and WASD and the arrows are steering. KeyX
 * rides alongside it for the Touhou muscle memory, where X is the bomb.
 */
const BELCH_CODES = ['Space', 'KeyX'];

// The pointer kinds TouchSteer is reasoned about in. A mouse steers with the keyboard by design.
const STEERING_POINTERS = ['touch', 'pen'];

/**
 * How far a finger must travel to be the steering pointer, in stage units. It
 * is converted to column units against the live placement, because a
 * finger-jitter threshold is physical and a field-unit constant bakes in one
 * viewport. It is 3 CSS pixels wherever the stage is not itself scaled up, and
 * about 2.2 on a 390-wide phone, where it is.
 */
const STEER_SLOP_STAGE_UNITS = 3;

// A still move is exactly still, never a play layer round trip's rounding.
const STILL: MoveCommand = { x: 0, y: 0 };

/** What the run's controls need from the screen around them. */
interface SteeringPowers {
  // Whether the button already owns this pointer, so a thumb that rolls off it does not drag the grave.
  claimsPointer(pointerId: number): boolean;
  // Power-ups that claim, for a gesture the platform took away.
  releaseClaim(): void;
  // The canvas a gesture the platform took away is announced on.
  canvas(): HTMLCanvasElement | null;
}

interface RunSteering {
  readonly keys: KeySteer;
  readonly touch: TouchSteer;
  // A belch asked for and not yet spent.
  readonly belchRequested: boolean;
  // Every listener a run holds outside pixi, added together and released together.
  listen(): () => void;
  // Where this frame's ticks take their commands from.
  commandSource(): CommandSource;
  requestBelch(): void;
  pointerDown(
    event: FederatedPointerEvent,
    placement: FieldPlacement,
    grave: FieldPoint | null,
  ): void;
  pointerMove(event: FederatedPointerEvent, placement: FieldPlacement): void;
  pointerUp(event: FederatedPointerEvent): void;
  // The drag's slop in column units, from the scale the field is drawn at.
  setSlop(scale: number): void;
  // The keyboard speed the player set, re-read whenever they could have changed it.
  readKeyboardSpeed(): void;
  // A lost keyup or a drag interrupted by a popup must not survive into the resumed run.
  goQuiet(): void;
  // The run about to be steered's scene, whose play layer a drag converts through (A34, T10).
  useScene(scene: Scene): void;
}

/**
 * One run's controls. It is the module's private machine and never leaves it;
 * a caller only ever sees the RunSteering above.
 */
interface Steering {
  readonly keys: KeySteer;
  readonly touch: TouchSteer;
  /**
   * A belch asked for and not yet spent. It is read and cleared inside the
   * command closure, which is only called when a tick actually runs, so a press
   * during a zero-tick frame survives to the next one rather than being eaten.
   *
   * It is per-run mutable state on a pooled screen, which is the class of defect
   * this app has shipped five times, so goQuiet() clears it and the screen calls
   * that on prepare(), on reset() and on every hold.
   */
  belchRequested: boolean;
  // Whether a move past the horizon has been logged, so a stuck one is reported once rather than every tick.
  pastHorizonLogged: boolean;
  // The run's scene, or the shortest field's before any run is handed in.
  scene: Scene;
  readonly powers: SteeringPowers;
}

// Whether this pointer is one the drag model is reasoned about in.
const steersWith = (event: FederatedPointerEvent): boolean => {
  return STEERING_POINTERS.includes(event.pointerType);
};

const toColumn = (
  placement: FieldPlacement,
  event: FederatedPointerEvent,
): ColumnPoint => {
  return screenToColumn(placement, event.global.x, event.global.y);
};

// Where the grave draws on the column, which is where the input models reason about it (tilted view T10).
const graveOnColumn = (layer: PlayLayer, grave: FieldPoint): ColumnPoint => {
  const drawn = playToColumn(layer, grave.x, grave.y);
  return { x: drawn.x, y: drawn.y };
};

/**
 * The field move, in base-speed units, that makes a drag's move on the column
 * (tilted view T9, T10): the grave's drawn point plus the move, taken back
 * through the play layer's exact inverse, less the grave's field point. It is
 * tilt 9's drag.
 *
 * A target past the horizon has no field point and comes back still. It
 * cannot happen from inside the column in one tick, because the horizon is
 * 1552 column rows or more above the top row, so one that does is an anomaly
 * and is logged once rather than thrown: a pointer is a live input.
 */
const dragOnField = (
  steering: Steering,
  grave: FieldPoint,
  onColumn: MoveCommand,
): MoveCommand => {
  if (onColumn.x === 0 && onColumn.y === 0) return STILL;
  const layer = steering.scene.playLayer;
  const drawn = playToColumn(layer, grave.x, grave.y);
  const reached = columnToPlay(
    layer,
    drawn.x + onColumn.x * BASE_SPEED,
    drawn.y + onColumn.y * BASE_SPEED,
  );
  if (reached !== null) {
    return {
      x: (reached.x - grave.x) / BASE_SPEED,
      y: (reached.y - grave.y) / BASE_SPEED,
    };
  }
  if (!steering.pastHorizonLogged) {
    steering.pastHorizonLogged = true;
    console.warn(
      `a move of (${onColumn.x}, ${onColumn.y}) on the column from field (${grave.x}, ${grave.y}) reaches past the horizon; the grave is held still`,
    );
  }
  return STILL;
};

const keyDown = (steering: Steering, event: KeyboardEvent): void => {
  if (SCROLL_CODES.includes(event.code)) event.preventDefault();
  // The belch is not a steering command, so it never reaches KeySteer: the
  // one-shot edge belongs here, and the key's auto-repeat is harmless because
  // fireBelch does nothing below a full reservoir.
  if (BELCH_CODES.includes(event.code)) steering.belchRequested = true;
  steering.keys.press(event.code);
};

/**
 * Every listener a run holds outside pixi, added here and released together.
 * The canvas pointercancel listener is a real DOM one because Pixi v8 does
 * not carry the event: EventSystem attaches pointermove, pointerdown,
 * pointerleave, pointerover, pointerup and wheel, and EventBoundary's mapping
 * table has no pointercancel entry at all. When iOS takes a gesture away it
 * fires pointercancel and then never sends pointerup, so without this the
 * drag target goes stale and the grave parks on it and cannot leave, and the
 * belch button's claim outlives the finger that made it.
 */
const listen = (steering: Steering): (() => void) => {
  const onKeyDown = (event: KeyboardEvent) => keyDown(steering, event);
  const onKeyUp = (event: KeyboardEvent) => steering.keys.release(event.code);
  const onBlur = () => steering.keys.releaseAll();
  const onPointerCancel = () => {
    steering.touch.cancelAll();
    steering.powers.releaseClaim();
  };
  const canvas = steering.powers.canvas();

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas?.addEventListener('pointercancel', onPointerCancel);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
    canvas?.removeEventListener('pointercancel', onPointerCancel);
  };
};

/**
 * Where this frame's ticks take their commands from.
 *
 * The keyboard is sampled once, because it is a true velocity. The drag is
 * recomputed inside the closure on every tick, because it is a position error
 * and applying one twice doubles the travel.
 */
const commandSource = (steering: Steering): CommandSource => {
  const keyCommand = steering.keys.command();
  return (grave) => {
    // Read and cleared here rather than in advance: the closure is only called
    // when a tick runs, so this is the one place that can tell a frame that
    // bought ticks from one that did not.
    const belch = steering.belchRequested;
    steering.belchRequested = false;
    const move = combineSteer(
      keyCommand,
      steering.touch,
      graveOnColumn(steering.scene.playLayer, grave),
      (onColumn) => dragOnField(steering, grave, onColumn),
    );
    return { move, belch };
  };
};

// A finger landing, in column units. A mouse is filtered out: desktop steering is the keyboard by design.
const pointerDown = (
  steering: Steering,
  event: FederatedPointerEvent,
  placement: FieldPlacement,
  grave: FieldPoint | null,
): void => {
  if (!steersWith(event) || grave === null) return;
  if (steering.powers.claimsPointer(event.pointerId)) return;
  steering.touch.down(
    event.pointerId,
    toColumn(placement, event),
    graveOnColumn(steering.scene.playLayer, grave),
  );
};

const pointerMove = (
  steering: Steering,
  event: FederatedPointerEvent,
  placement: FieldPlacement,
): void => {
  if (!steersWith(event)) return;
  if (steering.powers.claimsPointer(event.pointerId)) return;
  steering.touch.move(event.pointerId, toColumn(placement, event));
};

const pointerUp = (steering: Steering, event: FederatedPointerEvent): void => {
  if (!steersWith(event)) return;
  steering.touch.up(event.pointerId);
};

const goQuiet = (steering: Steering): void => {
  steering.keys.releaseAll();
  steering.touch.cancelAll();
  steering.belchRequested = false;
  steering.powers.releaseClaim();
};

const createRunSteering = (powers: SteeringPowers): RunSteering => {
  const steering: Steering = {
    keys: new KeySteer({ multiplier: userSettings.getKeyboardSpeed() }),
    touch: new TouchSteer(),
    belchRequested: false,
    pastHorizonLogged: false,
    scene: sceneFor(SHORTEST_FIELD),
    powers,
  };
  return {
    keys: steering.keys,
    touch: steering.touch,
    get belchRequested() {
      return steering.belchRequested;
    },
    listen: () => listen(steering),
    commandSource: () => commandSource(steering),
    requestBelch() {
      steering.belchRequested = true;
    },
    pointerDown: (event, placement, grave) =>
      pointerDown(steering, event, placement, grave),
    pointerMove: (event, placement) => pointerMove(steering, event, placement),
    pointerUp: (event) => pointerUp(steering, event),
    setSlop(scale) {
      steering.touch.setSlop(STEER_SLOP_STAGE_UNITS / scale);
    },
    readKeyboardSpeed() {
      steering.keys.setMultiplier(userSettings.getKeyboardSpeed());
    },
    goQuiet: () => goQuiet(steering),
    useScene(scene) {
      steering.scene = scene;
    },
  };
};

export { createRunSteering };
export type { RunSteering, SteeringPowers };
