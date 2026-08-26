import type { CreationEngine } from '../engine/engine';

let instance: CreationEngine | null = null;

/**
 * The engine instance, reached from anywhere.
 *
 * Its only callers left are in src/prototypes, which ticket #59 drops by name.
 * No module under src/app may call it: a screen, a popup or a widget takes the
 * powers it needs as props from src/main.ts, which is the one module that knows
 * the engine at all. src/__tests__/boundary.test.ts holds that shut.
 */
const engine = (): CreationEngine => {
  return instance!;
};

const setEngine = (app: CreationEngine) => {
  instance = app;
};

export { engine, setEngine };
