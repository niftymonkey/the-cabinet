// The Waking: a source on the ground layer that pours trash from one point
// (ADR 0042, ADR 0050).

import { TICK_HZ } from '../clock';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT } from '../field';
import type { DamageSource } from '../mobs';
import { spawnMob } from '../mobs';
import type { Rect } from '../overlap';
import type { RunState } from '../run';
import { SCROLL_SPEED } from '../tuning';
import type { SetPieceClosing } from '../events';
import {
  POUR_JITTER_X,
  POUR_LIP_X,
  POUR_TYPE,
  SET_PIECE_BUDGET,
  SET_PIECE_HALF_HEIGHT,
  SET_PIECE_HALF_WIDTH,
  SET_PIECE_HP,
  SET_PIECE_OPEN_DEPTH,
  SET_PIECE_POUR_SECONDS,
  SET_PIECE_SWEEP_MAX_X,
  SET_PIECE_SWEEP_MIN_X,
} from './rows';

/**
 * The one set piece on the field. One record on RunState and never a pool, for
 * the same reason a boss is: there is exactly one, ever.
 *
 * It has no hitbox against the grave at all, which is the parking rule: danger
 * and opportunity stand in the same place and the source is the opportunity
 * half of it.
 */
interface SetPiece {
  /**
   * Spawn identity, from the same counter every entity draws from. It is what
   * the storm's target seam matches on and the join key a mobDamaged carries.
   */
  readonly id: number;
  // Where the source is, in field units. It drifts down and sweeps across.
  x: number;
  y: number;
  // Whether it has opened and is pouring. While false it takes no damage.
  open: boolean;
  // Bodies left to pour. At zero it is spent.
  budget: number;
  // Ticks to the next body.
  pourIn: number;
  /**
   * Its own health, sized so the pour completes under a full build (ADR 0007's
   * storm must always matter): the moment a fast kill ends is the source's
   * stay, never its pour.
   */
  hp: number;
}

/**
 * The module's clock and geometry, every term of it read from a row rather than
 * declared here. The rows are in rows.ts because the corpse cap's query needs
 * the pour's rate and a rows.ts that reached this module would close the cycle
 * that derivation lives inside: behaviour here, data there.
 */
// The scroll itself: the source is a place on the ground, and the ground moves
// at the field's own scroll, so anything slower slides out of its own rock.
const DRIFT_PER_TICK = SCROLL_SPEED;
const OPENS_BELOW = FIELD_HEIGHT * SET_PIECE_OPEN_DEPTH;
const POUR_INTERVAL_TICKS = SET_PIECE_POUR_SECONDS * TICK_HZ;

// The arriving direction every poured body takes: straight down, at its own speed.
const FALLING = { x: 0, y: 1 };

const clamp = (value: number, low: number, high: number): number => {
  return Math.min(Math.max(value, low), high);
};

/**
 * Where the sweep has carried the source at this depth: one traversal of its
 * authored bounds across the whole fall.
 *
 * The place is read off the depth rather than kept as a heading, so the source
 * cannot sweep twice, cannot turn back, and cannot come out of step with its
 * own drift. The bounds are the field's middle rather than its width, so the
 * trail stays a curve a dive can follow instead of a line of corpses in the
 * gutter a body walking in at an edge leaves.
 */
const sweptTo = (y: number): number => {
  const across = clamp(y / FIELD_HEIGHT, 0, 1);
  return (
    SET_PIECE_SWEEP_MIN_X +
    (SET_PIECE_SWEEP_MAX_X - SET_PIECE_SWEEP_MIN_X) * across
  );
};

/**
 * Placed dormant at the top edge (ADR 0050). It takes no damage and pours
 * nothing until it has drifted to its own opening depth, which is Gradius's
 * ordinary Moai: the mouth is there to shoot only while the statue is firing.
 */
const placeSetPiece = (state: RunState): SetPiece => {
  const piece: SetPiece = {
    id: state.nextEntityId,
    x: sweptTo(0),
    y: 0,
    open: false,
    budget: SET_PIECE_BUDGET,
    pourIn: POUR_INTERVAL_TICKS,
    hp: SET_PIECE_HP,
  };
  state.nextEntityId += 1;
  state.setPiece = piece;
  return piece;
};

// The source's hitbox against the storm, or null while it is dormant.
const setPieceHitbox = (piece: SetPiece): Rect | null => {
  if (!piece.open) return null;
  return {
    x: piece.x - SET_PIECE_HALF_WIDTH,
    y: piece.y - SET_PIECE_HALF_HEIGHT,
    width: SET_PIECE_HALF_WIDTH * 2,
    height: SET_PIECE_HALF_HEIGHT * 2,
  };
};

/**
 * The source leaves, and what it had left to pour goes with it. The unspent
 * budget is never poured later: what a killed moment costs the player is the
 * rest of the trail, which is the whole of why the health row sits above a full
 * build's storm across the pour.
 */
const closeSetPiece = (
  state: RunState,
  piece: SetPiece,
  reason: SetPieceClosing,
): SimEvent[] => {
  state.setPiece = null;
  return [{ type: 'setPieceClosed', reason, left: piece.budget }];
};

/**
 * How far the further of the two lips can ever stand off the mouth's centre.
 * The pour is placed off a centre held this far inside the authored bounds, so
 * a lip is never folded back onto the edge: folding one back puts it on top of
 * the body the other lip just laid there, which is the one thing the alternating
 * lips exist to prevent.
 */
const POUR_REACH = POUR_LIP_X + POUR_JITTER_X;

/**
 * One body out of the mouth, at whichever lip is next.
 *
 * The lips alternate so two bodies in a row never stand on each other, and the
 * draw inside a lip is what keeps the pour a spray rather than a metronome. It
 * is the one place chance enters the moment and it comes from the spawns
 * stream, because a pour is a spawn (ADR 0006).
 *
 * A body the mob cap refuses is density the player never meets, which is the
 * answer the authored rows already give a refused non-carrier: a poured body
 * carries no offer, so nothing supply has to account for is lost (ADR 0048).
 */
const pourBody = (state: RunState, piece: SetPiece): SimEvent[] => {
  const poured = SET_PIECE_BUDGET - piece.budget;
  const side = poured % 2 === 0 ? 1 : -1;
  const off =
    POUR_LIP_X + (state.streams.spawns.next() - 0.5) * 2 * POUR_JITTER_X;
  const centre = clamp(
    piece.x,
    SET_PIECE_SWEEP_MIN_X + POUR_REACH,
    SET_PIECE_SWEEP_MAX_X - POUR_REACH,
  );
  const x = centre + side * off;
  spawnMob(
    state,
    POUR_TYPE,
    { x, y: piece.y, vx: FALLING.x, vy: FALLING.y, index: poured },
    false,
  );
  return [{ type: 'setPiecePoured', x, y: piece.y, left: piece.budget }];
};

// The source's own clock: a body every authored interval, and nothing between.
const pourIfDue = (state: RunState, piece: SetPiece): SimEvent[] => {
  piece.pourIn -= 1;
  if (piece.pourIn > 0) return [];
  piece.pourIn = POUR_INTERVAL_TICKS;
  piece.budget -= 1;
  return pourBody(state, piece);
};

/**
 * The dormant half of the stay: it drifts, and it opens the tick it reaches its
 * own authored depth.
 *
 * It always reaches that depth, because the depth is inside the field and the
 * drift is downward and never zero, so the phase that ends on the eye opening
 * terminates by construction.
 */
const openIfDeepEnough = (piece: SetPiece): SimEvent[] => {
  if (piece.y < OPENS_BELOW) return [];
  piece.open = true;
  return [
    { type: 'setPieceOpened', x: piece.x, y: piece.y, budget: piece.budget },
  ];
};

/**
 * One tick of the source: the drift and the sweep, then whichever half of its
 * stay it is in.
 *
 * The three ends are the budget spent, which is the ordinary one by
 * construction, the mouth killed, which damageSetPiece answers on the tick the
 * storm empties it, and the source off the bottom edge, which is the bound that
 * says it can never outlive the field.
 */
const advanceSetPiece = (state: RunState): SimEvent[] => {
  const piece = state.setPiece;
  if (piece === null) return [];
  piece.y += DRIFT_PER_TICK;
  piece.x = sweptTo(piece.y);
  if (!piece.open) return openIfDeepEnough(piece);
  if (piece.y - SET_PIECE_HALF_HEIGHT > FIELD_HEIGHT) {
    return closeSetPiece(state, piece, 'scrolled');
  }
  const events = pourIfDue(state, piece);
  if (piece.budget > 0) return events;
  events.push(...closeSetPiece(state, piece, 'spent'));
  return events;
};

/**
 * Damage from the storm onto an open source (ADR 0050). A dormant one takes
 * none at all and reports none, which is the immunity rather than a hit of
 * zero: there is nothing on the field to have been hit.
 *
 * At zero the source leaves and its pour stops where it stands. That is the
 * refinement the design record carries: killing it ends the source's stay
 * rather than its pour, and the health row above a full build's storm across
 * the whole pour is what makes the two the same thing in practice.
 */
const damageSetPiece = (
  state: RunState,
  amount: number,
  source: DamageSource,
): SimEvent[] => {
  const piece = state.setPiece;
  if (piece === null || !piece.open) return [];
  piece.hp -= amount;
  const events: SimEvent[] = [
    { type: 'mobDamaged', id: piece.id, amount, source },
  ];
  if (piece.hp <= 0) events.push(...closeSetPiece(state, piece, 'killed'));
  return events;
};

export { placeSetPiece, advanceSetPiece, setPieceHitbox, damageSetPiece };
export type { SetPiece };
