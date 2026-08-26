// The run's controls: what a held key, a dragged finger and a belch press become.

import type { FederatedPointerEvent } from 'pixi.js';

import type { CommandSource } from '../../../game/command';
import type { FieldPoint } from '../../../game/field';
import { KeySteer } from '../../../input/keys';
import { combineSteer } from '../../../input/steering';
import { TouchSteer } from '../../../input/touch';
import { engine } from '../../getEngine';
import type { FieldPlacement } from '../../layout';
import { screenToField } from '../../layout';
import { userSettings } from '../../userSettings';

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
 * is converted to field units against the live placement, because a
 * finger-jitter threshold is physical and a field-unit constant bakes in one
 * viewport. It is 3 CSS pixels wherever the stage is not itself scaled up, and
 * about 2.2 on a 390-wide phone, where it is.
 */
const STEER_SLOP_STAGE_UNITS = 3;

/** The belch button's pointer claim, which steering must neither steal nor outlive. */
interface SteeringPowers {
  // Whether the button already owns this pointer, so a thumb that rolls off it does not drag the grave.
  claimsPointer(pointerId: number): boolean;
  // Drops that claim, for a gesture the platform took away.
  releaseClaim(): void;
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
  // The drag's slop in field units, from the scale the field is drawn at.
  setSlop(scale: number): void;
  // The keyboard speed the player set, re-read whenever they could have changed it.
  readKeyboardSpeed(): void;
  // A lost keyup or a drag interrupted by a popup must not survive into the resumed run.
  goQuiet(): void;
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
  readonly powers: SteeringPowers;
}

// Whether this pointer is one the drag model is reasoned about in.
const steersWith = (event: FederatedPointerEvent): boolean => {
  return STEERING_POINTERS.includes(event.pointerType);
};

const toField = (
  placement: FieldPlacement,
  event: FederatedPointerEvent,
): FieldPoint => {
  return screenToField(placement, event.global.x, event.global.y);
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
  const canvas = engine().canvas;

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
    return { move: combineSteer(keyCommand, steering.touch, grave), belch };
  };
};

// A finger landing, in field units. A mouse is filtered out: desktop steering is the keyboard by design.
const pointerDown = (
  steering: Steering,
  event: FederatedPointerEvent,
  placement: FieldPlacement,
  grave: FieldPoint | null,
): void => {
  if (!steersWith(event) || grave === null) return;
  if (steering.powers.claimsPointer(event.pointerId)) return;
  steering.touch.down(event.pointerId, toField(placement, event), grave);
};

const pointerMove = (
  steering: Steering,
  event: FederatedPointerEvent,
  placement: FieldPlacement,
): void => {
  if (!steersWith(event)) return;
  if (steering.powers.claimsPointer(event.pointerId)) return;
  steering.touch.move(event.pointerId, toField(placement, event));
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
  };
};

export { createRunSteering };
export type { RunSteering, SteeringPowers };
