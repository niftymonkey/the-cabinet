import { execSync } from 'node:child_process';

import { defineConfig } from 'vite';

import { assetpackPlugin } from './scripts/assetpack-vite-plugin';

/**
 * The commit this bundle was built from, which every tape carries in its header
 * as human-readable metadata (ADR 0018).
 *
 * It is metadata and never a fidelity gate: the witness is the only thing that
 * decides whether a tape reproduced its run, so a README typo moving this
 * string must not be able to invalidate a tape. Vercel supplies the sha as an
 * environment variable, a local build asks git, and a tree with neither says so
 * rather than inventing one.
 */
function commitHash(): string {
  const fromCi = process.env.VERCEL_GIT_COMMIT_SHA;
  if (fromCi !== undefined && fromCi !== '') return fromCi;
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [assetpackPlugin()],
  server: {
    port: 8080,
    open: true,
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
    COMMIT_HASH: JSON.stringify(commitHash()),
  },
  build: {
    rollupOptions: {
      output: {
        // All of pixi in one boot-time chunk. Split by route, pixi's pipe
        // registrations (e.g. sprite-tiling/init) land in the lazy prototype
        // chunk and run after the renderer has built its pipe table, which
        // crashes the first render (validateRenderable of undefined).
        manualChunks: { pixi: ['pixi.js'] },
      },
    },
  },
});
