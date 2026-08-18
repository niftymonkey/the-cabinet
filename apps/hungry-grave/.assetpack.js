// CLI config for the typecheck path. Must mirror the config inside
// scripts/assetpack-vite-plugin.ts: engine.ts imports src/manifest.json,
// which only AssetPack generates, so tsc needs this to run first on a
// fresh clone where no dev server has produced it yet.
import { pixiPipes } from "@assetpack/core/pixi";

export default {
  entry: "./raw-assets",
  output: "./public/assets/",
  pipes: [
    ...pixiPipes({
      cacheBust: false,
      manifest: {
        output: "./src/manifest.json",
      },
    }),
  ],
};
