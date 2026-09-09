/**
 * The plugin-free config for the frame-budget instrument: vite.headless.config
 * plus one alias, src/game/caps to scripts/frameBudgetCaps.ts.
 *
 * The alias is the whole difference. Round 0's table names fields above the
 * shipped caps, and a pool is built at its cap, so without it the instrument
 * could stand only the three smallest of the six rows. Nothing else uses this
 * config: the game's own builds and every other headless script take theirs
 * from the two configs beside this one, and neither of those aliases anything.
 */

import { resolve } from 'node:path';

import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

import { buildIdentityHere } from './scripts/buildIdentity';

const SHIM = resolve(import.meta.dirname, 'scripts/frameBudgetCaps.ts');
const SHIPPED = resolve(import.meta.dirname, 'src/game/caps.ts');

/**
 * Every import that resolves to the shipped caps, answered with the bench's
 * own, whatever relative spelling the importer used. The shim itself is exempt,
 * because it is built out of the shipped module and an alias that caught its
 * own import would resolve in a circle.
 */
const frameBudgetCaps = (): Plugin => ({
  name: 'frame-budget-caps',
  enforce: 'pre',
  async resolveId(source, importer, options) {
    if (importer === SHIM) return null;
    const resolved = await this.resolve(source, importer, options);
    if (resolved === null || resolved.id !== SHIPPED) return null;
    return SHIM;
  },
});

export default defineConfig({
  plugins: [frameBudgetCaps()],
  define: { BUILD_IDENTITY: JSON.stringify(buildIdentityHere()) },
});
