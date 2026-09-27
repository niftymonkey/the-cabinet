// The field the sim runs in, in field units: fixed across, and as tall as the
// run's starting condition asks (T12). The renderer scales it; the sim never
// knows the viewport (ADR 0003).

/**
 * These live here rather than in tuning.ts because they are ADR 0003 and not
 * tunable, and here rather than in the app because the field is the sim's.
 * src/app/layout.ts imports them from here, so there is one declaration and
 * nothing to keep in sync.
 */
const FIELD_WIDTH = 540;

/**
 * The squattest and the tallest field a run may ask for (design record A30).
 * The floor is 760, 1.407 times the width, the squattest shape that still
 * covers every phone stage measured in a browser (540 by 776 to 540 by 1170,
 * `docs/design/show-what-you-have.md` section 3.1), so no phone plays with bars
 * above and below. The ceiling is 21:9, 1260, past the tallest phone stage
 * measured. A stage outside the range plays the nearest bound with bars.
 */
const SHORTEST_FIELD_HEIGHT = 760;
const TALLEST_FIELD_HEIGHT = 1260;

/**
 * Today's field height, kept for src/app alone, which reads it until slice P2
 * draws the run's own field and deletes it. No file under src/game, src/tape,
 * src/dev or scripts may import it (src/__tests__/boundary.test.ts): a
 * constant called the field's height that is not the run's field's height is
 * the trap design record A32 names.
 */
const FIELD_HEIGHT = SHORTEST_FIELD_HEIGHT;

// The field one run plays on: 540 wide, and the height its starting condition names.
interface Field {
  readonly width: number;
  readonly height: number;
}

/**
 * The field of a height a run may ask for.
 *
 * A height that is not whole or lies outside the bounds throws, because every
 * caller hands it a value our own code resolved or a tape row already checked
 * at the edge (startingCondition.ts), so a bad one is a bug and not an input.
 */
const fieldOfHeight = (height: number): Field => {
  if (
    !Number.isInteger(height) ||
    height < SHORTEST_FIELD_HEIGHT ||
    height > TALLEST_FIELD_HEIGHT
  ) {
    throw new Error(
      `a field ${height} tall is outside the whole ${SHORTEST_FIELD_HEIGHT} to ${TALLEST_FIELD_HEIGHT} this build plays`,
    );
  }
  return { width: FIELD_WIDTH, height };
};

const SHORTEST_FIELD: Field = fieldOfHeight(SHORTEST_FIELD_HEIGHT);

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

export {
  FIELD_WIDTH,
  FIELD_HEIGHT,
  SHORTEST_FIELD_HEIGHT,
  TALLEST_FIELD_HEIGHT,
  SHORTEST_FIELD,
  fieldOfHeight,
};
export type { Field, FieldPoint };
