/**
 * The plugin-free config for headless script runs. vite-node auto-loads
 * vite.config.ts, and the assetpack plugin there writes progress to stdout
 * before a script's first line runs, so headless script runs point here
 * instead to keep stdout for the script's own output.
 *
 * It compiles the build identity because the tape edge reads it in every
 * runtime that records or replays, this one included (#82). COMMIT_HASH
 * stays out: the headless shells stamp a commit hash of their own, asked of
 * git at the moment they write a header.
 */

import { defineConfig } from 'vite';

import { buildIdentityHere } from './scripts/buildIdentity';

export default defineConfig({
  define: { BUILD_IDENTITY: JSON.stringify(buildIdentityHere()) },
});
