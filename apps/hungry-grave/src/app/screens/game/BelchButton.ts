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
 * lets nothing do. A hollow shape carries the charge without filling the corner
 * a shot may cross.
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

// How thick the unfilled ring is drawn, in stage units.
const RING_STROKE = 5;

/**
 * How thick the charge's own arc is drawn, in stage units.
 *
 * It is wider than the ring it lies inside on purpose. The track and the charge
 * are held at one luma so neither can announce by getting brighter, which puts
 * them at APCA Lc 0.00 against each other, so in grayscale the arc's own width
 * and length are the whole reading.
 */
const CHARGE_STROKE = 9;

// How thick the inner mark is drawn, and how far in it sits.
const MARK_STROKE = 4;
const MARK_INSET = 0.42;

// How far the ready ring pulses, and how fast, in ticks per cycle.
const LIT_PULSE_DEPTH = 0.22;
const LIT_PULSE_TICKS = 40;

/**
 * How many segments the charge arc is sampled at, and its redraw quantum: the
 * reservoir moves on every swallow and rebuilding the arc only when the charge
 * crosses a segment keeps the redraw rate at the arc's own visible resolution
 * rather than the clock's. The same construction Territory's arc uses in
 * GraveRenderer.
 */
const CHARGE_SEGMENTS = 64;

// Where the arc starts, in radians: top centre, filling clockwise from there.
const CHARGE_START = -Math.PI / 2;

/**
 * How many of the arc's segments this much of a turn has filled.
 *
 * It rounds down rather than to nearest, and that is the whole reason it is a
 * function. Rounding to nearest closes the ring at 63.5 segments, so a
 * reservoir a half-segment short of full would draw the complete circle the
 * ready state draws, and the one thing the player reads off this control is
 * whether the belch can be spent.
 */
const filledSegments = (filled: number): number =>
  filled >= 1 ? CHARGE_SEGMENTS : Math.floor(filled * CHARGE_SEGMENTS);

/** What the control shows at this much charge, this far into a pulse. */
interface ChargeFace {
  // How far round the ring the charge has filled, in turns from 0 to 1.
  readonly filled: number;
  // What the arc and the inner mark draw in.
  readonly ink: number;
  // The control's alpha: steady while filling, pulsing at ready.
  readonly alpha: number;
}

/**
 * The face the control wears at this charge and this tick.
 *
 * The charge announces by area alone: the filled share moves and the alpha does
 * not, because ADR 0054's reading of ADR 0014 binds the HUD to announce by
 * count, by shape or by subtraction and never by getting brighter. Ready is the
 * ink changing to the grave's own glow, which means a thing there is to spend,
 * plus the pulse, which is motion rather than a brightness comparison the player
 * has to make against a remembered state.
 *
 * The clamp is here rather than at the caller because the reservoir's own fill
 * can exceed its capacity by one ulp (`clock.ts`'s TICK_TOLERANCE has the same
 * shape), and a fraction a hair over one must read as ready and not wrap.
 */
const chargeFace = (charge: number, tick: number): ChargeFace => {
  const filled = Math.max(0, Math.min(1, charge));
  if (filled < 1) {
    return { filled, ink: PALETTE.reservoirCharge.hex, alpha: 1 };
  }
  const phase = (tick % LIT_PULSE_TICKS) / LIT_PULSE_TICKS;
  return {
    filled: 1,
    ink: PALETTE.graveGlow.hex,
    alpha: 1 - LIT_PULSE_DEPTH * (1 - Math.cos(phase * Math.PI * 2)) * 0.5,
  };
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

  // The face already on screen, so the arc is rebuilt only when it changes.
  private drawnStep: number | null = null;

  private drawnInk: number | null = null;

  private readonly onFire: () => void;

  constructor(onFire: () => void) {
    super();
    this.onFire = onFire;
    this.addChild(this.ring);
    this.eventMode = 'static';
    // The hit area is the whole disc the ring sits in, set once here and never
    // from the drawing, so a thumb landing anywhere on the control fires it and
    // no state of the charge can shrink the target.
    const radius = BELCH_SIZE / 2;
    this.hitArea = {
      contains: (x: number, y: number) => x * x + y * y <= radius * radius,
    };
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

  /**
   * The charge as the run says it is. `charge` is the reservoir over its
   * capacity, 0 to 1, handed in as a number and never as the RunState: the
   * screen is the one place that reads the run.
   */
  public sync(charge: number, tick: number): void {
    const face = chargeFace(charge, tick);
    const step = filledSegments(face.filled);
    if (step !== this.drawnStep || face.ink !== this.drawnInk) {
      this.redraw(step, face.ink);
      this.drawnStep = step;
      this.drawnInk = face.ink;
    }
    this.ring.alpha = face.alpha;
  }

  /**
   * The unfilled ring in the readouts' own ink, the charge's share of it in the
   * charge's colour, and the mark inside. Every stroke is inset by half its own
   * width, so the widest of them ends exactly on the button's diameter and the
   * arc can never reach past the target the hit area already promised.
   */
  private redraw(step: number, ink: number): void {
    const radius = BELCH_SIZE / 2;
    this.ring
      .clear()
      .circle(0, 0, radius - RING_STROKE / 2)
      .stroke({ width: RING_STROKE, color: PALETTE.hudInk.hex });
    if (step > 0) {
      const arcRadius = radius - CHARGE_STROKE / 2;
      const sweep = (step / CHARGE_SEGMENTS) * Math.PI * 2;
      // The moveTo is load-bearing: an arc with a current point already set
      // draws a line to its own start, and the chord from the ring's end back
      // to the top pushed the control's footprint out to 112 units. Round caps
      // and joins for GraveRenderer's own reason, that a miter at a sampled
      // vertex spikes past the stroke's envelope, and the envelope is what the
      // target bound rests on.
      this.ring
        .moveTo(0, -arcRadius)
        .arc(0, 0, arcRadius, CHARGE_START, CHARGE_START + sweep)
        .stroke({
          width: CHARGE_STROKE,
          color: ink,
          cap: 'round',
          join: 'round',
        });
    }
    this.ring
      .circle(0, 0, radius * MARK_INSET)
      .stroke({ width: MARK_STROKE, color: ink });
  }
}

export { chargeFace, filledSegments, BelchButton, BELCH_SIZE };
export type { ChargeFace };
