/**
 * The plugin-free config for headless script runs. vite-node auto-loads
 * vite.config.ts, and the assetpack plugin there writes progress to stdout
 * before a script's first line runs, so headless script runs point here
 * instead to keep stdout for the script's own output.
 */

import { defineConfig } from 'vite';

export default defineConfig({});
