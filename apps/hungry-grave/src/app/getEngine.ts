import type { CreationEngine } from '../engine/engine';

let instance: CreationEngine | null = null;

/**
 * Get the main application engine
 * This is a simple way to access the engine instance from anywhere in the app
 */
const engine = (): CreationEngine => {
  return instance!;
};

const setEngine = (app: CreationEngine) => {
  instance = app;
};

export { engine, setEngine };
