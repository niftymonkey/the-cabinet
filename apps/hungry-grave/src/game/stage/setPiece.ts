// The Waking: a source on the ground layer that pours trash from one point
// (ADR 0042, ADR 0050).

/**
 * The one set piece on the field. One record on RunState and never a pool, for
 * the same reason a boss is: there is exactly one, ever.
 *
 * It has no hitbox against the grave at all, which is the parking rule: danger
 * and opportunity stand in the same place and the source is the opportunity
 * half of it.
 */
interface SetPiece {
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

export type { SetPiece };
