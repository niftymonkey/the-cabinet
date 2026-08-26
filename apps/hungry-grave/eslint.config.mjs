import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

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
  'acos',
  'acosh',
  'asin',
  'asinh',
  'atan',
  'atanh',
  'atan2',
  'cbrt',
  'cos',
  'cosh',
  'exp',
  'expm1',
  'hypot',
  'log',
  'log1p',
  'log10',
  'log2',
  'pow',
  'sin',
  'sinh',
  'tan',
  'tanh',
];

const approximated = APPROXIMATED.map((property) => ({
  object: 'Math',
  property,
  message: `Math.${property} is implementation-approximated, so two engines may differ in the last bit and the same seed stops being the same run (ADR 0015). Go through src/game/math.ts, which rounds every result to single precision. If it has no wrapper for this one yet, that is a conversation rather than a call to let through.`,
}));

const random = {
  object: 'Math',
  property: 'random',
  message:
    "Math.random breaks determinism outright (ADR 0015). The named seeded streams in src/game/rng.ts are the sim's only source of dice.",
};

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettier,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {},
  },
  {
    // ADR 0015 requires that the rest of the sim cannot reach around math.ts,
    // and a comment asking nicely is not that.
    //
    // src/input is under the same fence because input is the sim's only
    // external input: an approximated operation there diverges a run exactly as
    // one inside src/game would, and the golden digest cannot see it, because
    // the digest scripts move commands directly and never runs an input model.
    // The one path this leaves open is the SteerSource closure, which is
    // written in src/app where no fence reaches; in practice it only picks
    // between two commands through combineSteer.
    files: ['src/game/**/*.ts', 'src/input/**/*.ts'],
    rules: {
      'no-restricted-properties': ['error', ...approximated, random],
      'no-restricted-globals': [
        'error',
        {
          name: 'Date',
          message:
            "Wall clock inside the sim breaks determinism exactly as a raw approximated operation does, and a run's length is counted in ticks (ADR 0015).",
        },
        {
          name: 'performance',
          message:
            "Wall clock inside the sim breaks determinism exactly as a raw approximated operation does, and a run's length is counted in ticks (ADR 0015).",
        },
      ],
      'no-restricted-syntax': [
        'error',
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
    files: ['src/game/math.ts', 'src/game/rng.ts'],
    rules: {
      'no-restricted-properties': ['error', random],
    },
  },
  {
    // ADR 0017 requires that every executed tick crosses executeTick, and a
    // comment saying so is what the previous version of this rule was: the
    // harness's own comment claimed every sim test stepped through it, and a
    // screen test had already broken that four times without anybody noticing.
    //
    // Two details of the shape are load-bearing. It is a patterns entry and
    // never a paths entry naming "./step", because paths matches the literal
    // string as written, so a rule on "./step" blocks nothing spelled
    // "../step" from src/game/lines. And it covers src/** rather than
    // src/game/**, because the raw calls this exists for were in src/app and
    // src/__tests__/boundary.test.ts separately permits src/dev to reach
    // game/step, so both roots that can break it sit outside a src/game/**
    // scope. That is the same hole the math fence documents above, where the
    // SteerSource closure in src/app is out of reach.
    //
    // patterns matches gitignore-style globs against the import source string
    // and never resolves a module, so this is containment rather than proof:
    // it catches every spelling anybody writes today, and a re-export barrel or
    // a tsconfig path alias would walk through it. Two more things walk through
    // it, both measured against eslint 9 rather than assumed: a call expression
    // like advance.test.ts's vi.importActual, which no no-restricted-imports
    // rule can see, and a dynamic import("./step"), which this rule does not
    // report. The extension-carrying spelling is not one of those holes and is
    // listed here instead: "**/step" does not match "./step.js", which Vite
    // resolves happily, so the group names both. The spelling test in
    // src/__tests__/executionFence.test.ts is what keeps the claim it does
    // make honest.
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/step', '**/step.js'],
              message:
                'Every executed tick crosses executeTick in src/game/execution.ts (ADR 0017). A fourth path into step() is a hole in every recording, so this is a build failure rather than something a review has to catch.',
            },
          ],
        },
      ],
    },
  },
  {
    // The one authority is the one importer, the same file-scoped carve-out
    // math.ts and rng.ts get from the fence above them, and re-specified with
    // narrower content the same way rather than switched off. The step fence is
    // the only import restriction in the block above today, so the narrower
    // content is an empty pattern list; a second restriction added there would
    // silently not apply here under an "off", and belongs in this list too.
    files: ['src/game/execution.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [] }],
    },
  },
);
