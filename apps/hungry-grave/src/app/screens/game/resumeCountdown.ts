// The count a resume drops the player into, and the blur it holds the threat layers under.

import { BlurFilter } from 'pixi.js';

import { PALETTE } from '../../palette';
import { Label } from '../../ui/Label';
import type { FieldLayers } from './layering';

/**
 * How long resume counts down for, in milliseconds.
 *
 * pause() calls cancelAll(), so resuming drops the player into a live field
 * with no drag anchor and a full STEER_SLOP crossing before anything moves.
 * That was free on an empty field and it is not free now that something can
 * kill you. The count exists so a thumb can get down before it matters, and
 * touch and keyboard are both live while it runs.
 */
const COUNTDOWN_MS = 3000;

/**
 * When the pause blur clears, in milliseconds remaining. The blur is held
 * through three and two and cleared on one: a countdown over a frozen, sharp
 * field would hand the player three free seconds to study the curtain, and this
 * record has twice called that blur load-bearing against exactly that line. One
 * second of sharp static field is ample to re-find the grave and far too short
 * to plan a route through a wave.
 */
const COUNTDOWN_CLEAR_BLUR_MS = 1000;

// How strong the countdown's blur is. It is the pause menu's own strength, because it is the same read continuing.
const COUNTDOWN_BLUR_STRENGTH = 5;

// The count reads at the middle of the viewport, in the size that carries across a blurred field.
const COUNTDOWN_FONT_SIZE = 72;

/**
 * The layers the countdown blurs. The grave and its rim are spared, exactly as
 * ADR 0014's hit dim spares them: re-finding the grave is what the countdown
 * exists for, so blurring it would defeat its own purpose, and the hit dim's
 * rule already settles the principle that the channel a player is being asked
 * to re-read is never occluded.
 */
const BLURRED_LAYERS = ['mobBodies', 'mobFire', 'corpses', 'treasure'] as const;

/**
 * One BlurFilter for the whole app, built on first use and then reused.
 *
 * The countdown fires on every resume and every return from a backgrounded tab,
 * and an instance per countdown was allocated and never destroyed. Sharing one
 * is Pixi's own guidance.
 *
 * It is built on demand inside a try rather than at module load. Constructing a
 * BlurFilter compiles a shader, which needs a document, and under node there is
 * none: at module load that throws on import and takes every screen test with
 * it, and inside the countdown it throws into a promise nobody is waiting on.
 *
 * Only success is remembered. A failure is not, because whether the shader can
 * be compiled is a property of the environment at that moment rather than of
 * this module, and caching the first failure would leave the field unblurred
 * for the rest of the session on the strength of one early attempt. Where no
 * shader can be compiled the field simply does not blur, which is the only
 * sensible answer there.
 */
let sharedBlur: BlurFilter | null = null;

const fieldBlur = (): BlurFilter | null => {
  if (sharedBlur !== null) return sharedBlur;
  try {
    sharedBlur = new BlurFilter({ strength: COUNTDOWN_BLUR_STRENGTH });
  } catch {
    return null;
  }
  return sharedBlur;
};

interface ResumeCountdown {
  readonly view: Label;
  // Milliseconds left of the count, and null when the field is live.
  readonly remainingMs: number | null;
  start(): void;
  advance(elapsedMs: number): void;
  // The count and its label alone, which is what a lost gesture drops.
  stop(): void;
  clearBlur(): void;
  resize(width: number, height: number): void;
}

/**
 * One count's own state. It is per-run mutable state with a timer in it on a
 * pooled screen, so the screen clears it on both prepare() and reset().
 */
interface Countdown {
  remainingMs: number | null;
}

// The threat layers, blurred. The grave and its rim are spared, so the player can re-find them.
const setBlur = (layers: FieldLayers): void => {
  const blur = fieldBlur();
  if (blur === null) return;
  blur.enabled = true;
  for (const name of BLURRED_LAYERS) layers.layer(name).filters = [blur];
};

const clearBlur = (layers: FieldLayers): void => {
  for (const name of BLURRED_LAYERS) layers.layer(name).filters = [];
};

const stop = (countdown: Countdown, view: Label): void => {
  countdown.remainingMs = null;
  view.visible = false;
};

/**
 * One frame of the resume countdown. The sim does not advance while it runs,
 * and the elapsed time is spent here rather than being handed to the clock,
 * so the tick-debt readout keeps telling the truth across a pause.
 */
const advance = (
  countdown: Countdown,
  view: Label,
  layers: FieldLayers,
  elapsedMs: number,
): void => {
  if (countdown.remainingMs === null) return;
  countdown.remainingMs -= elapsedMs;
  if (countdown.remainingMs <= COUNTDOWN_CLEAR_BLUR_MS) clearBlur(layers);
  if (countdown.remainingMs <= 0) {
    stop(countdown, view);
    return;
  }
  view.text = `${Math.ceil(countdown.remainingMs / 1000)}`;
};

const start = (
  countdown: Countdown,
  view: Label,
  layers: FieldLayers,
): void => {
  countdown.remainingMs = COUNTDOWN_MS;
  view.text = `${Math.ceil(COUNTDOWN_MS / 1000)}`;
  view.visible = true;
  setBlur(layers);
};

const countLabel = (): Label => {
  const label = new Label({
    style: {
      fontFamily: 'monospace',
      fill: PALETTE.hudInk.hex,
      fontSize: COUNTDOWN_FONT_SIZE,
    },
  });
  label.visible = false;
  return label;
};

const createResumeCountdown = (layers: FieldLayers): ResumeCountdown => {
  const countdown: Countdown = { remainingMs: null };
  const view = countLabel();
  return {
    view,
    get remainingMs() {
      return countdown.remainingMs;
    },
    start: () => start(countdown, view, layers),
    advance: (elapsedMs) => advance(countdown, view, layers, elapsedMs),
    stop: () => stop(countdown, view),
    clearBlur: () => clearBlur(layers),
    resize(width, height) {
      view.position.set(width / 2, height / 2);
    },
  };
};

export { createResumeCountdown };
export type { ResumeCountdown };
