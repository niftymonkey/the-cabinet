import type { FederatedPointerEvent } from 'pixi.js';
import { Container, Graphics } from 'pixi.js';

import { PALETTE } from '../../palette';

/**
 * The belch's one control: a Container holding a Graphics, and deliberately not
 * the template's Button.
 *
 * That Button carries hardcoded pinks and lives in src/app/ui, which
 * palette.test.ts's source scan does not reach, so using it for a control drawn
 * over a live field would put unbounded colour on the field with no test able to
 * see it. A purpose-built button inside src/app/screens/game is bound by the
 * palette scan from its first commit, which is where a live-field control
 * belongs. The shared widgets are #38's and must not be pre-empted here.
 *
 * It is drawn as a ring and never a filled disc. `GameScreen` adds the field
 * first, so anything added as a sibling draws above `mobFire`, which ADR 0014
 * lets nothing do. A hollow shape gets the loaded tell without filling the
 * corner a shot may cross.
 */

/**
 * The button's diameter in stage units.
 *
 * It is bounded from below by the smaller of the two published touch-target
 * floors, 44 by 44 CSS pixels, at every viewport the game runs at. That is
 * asserted rather than eyeballed, because the stage scales per viewport and the
 * phone is the case where it binds.
 */
const BELCH_SIZE = 108;

// How thick the ring is drawn, in stage units.
const RING_STROKE = 5;

// How thick the inner mark is drawn, and how far in it sits.
const MARK_STROKE = 4;
const MARK_INSET = 0.42;

// How dim the ring draws while the reservoir is still filling.
const QUIET_ALPHA = 0.32;

// How far the lit ring pulses, and how fast, in ticks per cycle.
const LIT_PULSE_DEPTH = 0.22;
const LIT_PULSE_TICKS = 40;

/**
 * How bright the ring draws at this charge and this far into a pulse. Quiet
 * while the reservoir fills, lit and pulsing at full, so the player learns where
 * their belch lives by seeing the thing under their thumb change rather than by
 * reading a meter.
 */
const ringAlpha = (loaded: boolean, tick: number): number => {
  if (!loaded) return QUIET_ALPHA;
  const phase = (tick % LIT_PULSE_TICKS) / LIT_PULSE_TICKS;
  return 1 - LIT_PULSE_DEPTH * (1 - Math.cos(phase * Math.PI * 2)) * 0.5;
};

class BelchButton extends Container {
  private readonly ring = new Graphics();

  /**
   * The pointer that pressed the button, held until it lifts.
   *
   * GameScreen listens on itself with a stage-wide hitArea and pixi's federated
   * events bubble, so without this a press on the button also reaches the steer
   * model. STEER_SLOP saves a clean tap and does not save a thumb that rolls, so
   * the id is claimed instead and the steer model ignores it until it lifts.
   */
  private claimed: number | null = null;

  private drawn: boolean = false;

  constructor(private readonly onFire: () => void) {
    super();
    this.addChild(this.ring);
    this.eventMode = 'static';
    // On press and never on release. The belch runs before overlap resolution
    // precisely so a bomb pressed on the frame a shot would land saves the
    // player, and firing on release gives that back as input latency at exactly
    // that moment.
    this.on('pointerdown', this.onDown, this);
    this.on('pointerup', this.onUp, this);
    this.on('pointerupoutside', this.onUp, this);
  }

  private onDown(event: FederatedPointerEvent): void {
    this.claimed = event.pointerId;
    this.onFire();
  }

  private onUp(event: FederatedPointerEvent): void {
    if (this.claimed === event.pointerId) this.claimed = null;
  }

  // Whether this pointer belongs to the button, so the steer model can ignore it.
  public owns(pointerId: number): boolean {
    return this.claimed === pointerId;
  }

  // Every claim dropped, which pause, blur and pointercancel all need.
  public release(): void {
    this.claimed = null;
  }

  // The loaded tell. Quiet while the reservoir fills, lit at full.
  public sync(loaded: boolean, tick: number): void {
    if (!this.drawn) {
      this.drawn = true;
      this.redraw();
    }
    this.ring.alpha = ringAlpha(loaded, tick);
  }

  private redraw(): void {
    const radius = BELCH_SIZE / 2;
    this.ring
      .clear()
      .circle(0, 0, radius - RING_STROKE / 2)
      .stroke({ width: RING_STROKE, color: PALETTE.graveGlow.hex })
      .circle(0, 0, radius * MARK_INSET)
      .stroke({ width: MARK_STROKE, color: PALETTE.graveGlow.hex });
    // The hit area is the whole square the ring sits in, so a thumb landing
    // anywhere on the control fires it rather than only on the stroke.
    this.hitArea = {
      contains: (x: number, y: number) => x * x + y * y <= radius * radius,
    };
  }
}

export { ringAlpha, BelchButton, BELCH_SIZE };
