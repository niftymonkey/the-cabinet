import js from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

/**
 * ECMA-262's implementation-approximated functions, which engines are permitted
 * to differ on in the last bit. The spec's own list carries sqrt as well, but
 * tc39/ecma262 PR #3345 made sqrt exactly specified, so it is not here.
 *
 * The whole set is restricted even though math.ts wraps only seven of them.
 * Blocking a name that has no wrapper yet is the feature: asin, acos and
 * one-argument atan are exactly what a seeker's turn and a wisp's homing will
 * reach for, and the block forces that conversation instead of letting an
 * unrounded call through.
 */
const APPROXIMATED = [
  "acos",
  "acosh",
  "asin",
  "asinh",
  "atan",
  "atanh",
  "atan2",
  "cbrt",
  "cos",
  "cosh",
  "exp",
  "expm1",
  "hypot",
  "log",
  "log1p",
  "log10",
  "log2",
  "pow",
  "sin",
  "sinh",
  "tan",
  "tanh",
];

const approximated = APPROXIMATED.map((property) => ({
  object: "Math",
  property,
  message: `Math.${property} is implementation-approximated, so two engines may differ in the last bit and the same seed stops being the same run (ADR 0015). Go through src/game/math.ts, which rounds every result to single precision. If it has no wrapper for this one yet, that is a conversation rather than a call to let through.`,
}));

const random = {
  object: "Math",
  property: "random",
  message:
    "Math.random breaks determinism outright (ADR 0015). The named seeded streams in src/game/rng.ts are the sim's only source of dice.",
};

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettier,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {},
  },
  {
    // ADR 0015 requires that the rest of the sim cannot reach around math.ts,
    // and a comment asking nicely is not that.
    files: ["src/game/**/*.ts"],
    rules: {
      "no-restricted-properties": ["error", ...approximated, random],
      "no-restricted-globals": [
        "error",
        {
          name: "Date",
          message:
            "Wall clock inside the sim breaks determinism exactly as a raw approximated operation does, and a run's length is counted in ticks (ADR 0015).",
        },
        {
          name: "performance",
          message:
            "Wall clock inside the sim breaks determinism exactly as a raw approximated operation does, and a run's length is counted in ticks (ADR 0015).",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: 'BinaryExpression[operator="**"]',
          message:
            "x ** y really is Math.pow: both evaluate the spec's Number::exponentiate, so the operator is approximated identically. V8 shipped a real divergence between the two spellings, v8 issue 5848, where the same inputs gave different results depending on which one you wrote. Go through src/game/math.ts's pow (ADR 0015).",
        },
      ],
    },
  },
  {
    // math.ts wraps the approximated operations, and rng.ts is built on
    // Math.imul, which is exactly specified and is the generator's core
    // operation. Neither is exempt from the Math.random rule.
    files: ["src/game/math.ts", "src/game/rng.ts"],
    rules: {
      "no-restricted-properties": ["error", random],
    },
  },
);
