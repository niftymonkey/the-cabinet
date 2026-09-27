// The fixed field the sim runs in, in field units. The renderer scales it; the
// sim never knows the viewport (ADR 0003).

/**
 * The column the camera draws into, in field units, where one field unit draws
 * as one column unit: the field's middle row. They are the scale every speed
 * and size in the rules is measured against (ADR 0003's numbers).
 * Until the field takes its trapezoid shape they are also still its edges.
 * They live here rather than in tuning.ts because they are ADR 0003 and not
 * tunable, and here rather than in the app because the field is the sim's.
 * src/app/layout.ts imports them from here, so there is one declaration and
 * nothing to keep in sync.
 */
const VIEW_WIDTH = 540;
const VIEW_HEIGHT = 760;

/**
 * A point in field units. It lives here rather than in an input model because
 * src/game may not reach src/input: command.ts's CommandSource and src/input's
 * two models all speak it, and one declaration is what keeps them from drifting
 * into two shapes that only happen to match.
 */
interface FieldPoint {
  readonly x: number;
  readonly y: number;
}

export { VIEW_WIDTH, VIEW_HEIGHT };
export type { FieldPoint };
