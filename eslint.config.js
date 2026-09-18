import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/local/**',
    '**/node_modules/**',
    '**/playwright-report/**',
    '**/references/**',
    'scripts/roadmap/**',
    '**/test-results/**',
  ]),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    // apps/hungry-grave/tsconfig.json now extends the shared tsconfig.base.json
    // here at the repo root, and that app also carries its own eslint.config.mjs.
    // Together those give typescript-eslint's project discovery two reachable
    // roots (this repo root and the app) for every file in one `eslint .` run,
    // including a plain .js/.mjs file at the repo root that sits in neither
    // tsconfig's `include`. Pinning tsconfigRootDir here, ahead of the
    // ts/tsx-scoped projectService block below, settles it for every extension
    // before that block's own project-aware options come into play.
    files: ['**/*.{js,mjs,ts,tsx}'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['apps/*/src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['apps/*/src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'apps/*/vite.config.ts',
            'apps/*/vitest.config.ts',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
