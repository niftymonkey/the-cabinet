import react from '@vitejs/plugin-react';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

// Copies each prototype page whole instead of handing it to Rollup: the pages
// must stay self-contained single files that also open directly from disk.
function prototypePages(): Plugin {
  return {
    name: 'prototype-pages',
    apply: 'build',
    closeBundle() {
      const prototypesDir = join(import.meta.dirname, 'prototypes');
      const commit = process.env.VERCEL_GIT_COMMIT_SHA;
      for (const name of readdirSync(prototypesDir)) {
        const page = join(prototypesDir, name, 'index.html');
        if (!existsSync(page)) continue;
        const html = readFileSync(page, 'utf8');
        const stamped =
          commit === undefined || commit === ''
            ? html
            : `<meta name="build-commit" content="${commit}" />\n${html}`;
        const outDir = join(import.meta.dirname, 'dist', 'prototypes', name);
        mkdirSync(outDir, { recursive: true });
        writeFileSync(join(outDir, 'index.html'), stamped);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), prototypePages()],
});
