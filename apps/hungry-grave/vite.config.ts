import { defineConfig } from "vite";

import { assetpackPlugin } from "./scripts/assetpack-vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [assetpackPlugin()],
  server: {
    port: 8080,
    open: true,
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    rollupOptions: {
      output: {
        // All of pixi in one boot-time chunk. Split by route, pixi's pipe
        // registrations (e.g. sprite-tiling/init) land in the lazy prototype
        // chunk and run after the renderer has built its pipe table, which
        // crashes the first render (validateRenderable of undefined).
        manualChunks: { pixi: ["pixi.js"] },
      },
    },
  },
});
