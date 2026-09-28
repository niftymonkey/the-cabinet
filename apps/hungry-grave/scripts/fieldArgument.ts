// The field= argument the headless scripts share: which field a command's runs play on (design record A30, A31).

import { SHORTEST_FIELD_HEIGHT, TALLEST_FIELD_HEIGHT } from '../src/game/field';

/** A field height read off a command line, or why the argument names none. */
type FieldArgument = { readonly height: number } | { readonly refusal: string };

/**
 * The field height a raw field= value names: a whole number inside the shapes
 * a run may take (A30), and the shortest field when none is named, so a bare
 * command plays what it played before the field had a height (A31). A flawed
 * value comes back as the reason, and each script refuses it with its own
 * usage, because the person holding the command line is the owner who can act.
 */
const readFieldArgument = (raw: string | undefined): FieldArgument => {
  if (raw === undefined) return { height: SHORTEST_FIELD_HEIGHT };
  const value = raw.trim() === '' ? Number.NaN : Number(raw);
  if (
    !Number.isInteger(value) ||
    value < SHORTEST_FIELD_HEIGHT ||
    value > TALLEST_FIELD_HEIGHT
  ) {
    return {
      refusal: `${raw} is not a field height (a whole number from ${SHORTEST_FIELD_HEIGHT} to ${TALLEST_FIELD_HEIGHT})`,
    };
  }
  return { height: value };
};

export { readFieldArgument };
export type { FieldArgument };
