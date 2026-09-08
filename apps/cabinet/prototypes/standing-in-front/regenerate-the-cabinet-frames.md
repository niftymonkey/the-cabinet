# Regenerate the cabinet frames

How to render with Blender in general, including install and the 5.2 gotchas: `tools/blender-render/README.md`. This note carries only what is specific to `cabinet.py` beside it.

Run: `blender --background --python apps/cabinet/prototypes/standing-in-front/cabinet.py -- apps/cabinet/prototypes/standing-in-front/render [--quick]`. `--quick` renders yaws -12, 0 and +12 at 16 samples in about a minute; the full run renders 25 frames plus the spill plate in 7 to 8 minutes and writes `frames.json`.

Where things live in the script: dimensions and the side profile at the top (metres, floor at z = 0, front toward negative y); every colour in `build_materials()`; one `build_*` function per part; camera in `build_camera` and `fit_camera`; frame size, arc and samples in `FRAME_W`, `FRAME_H`, `YAWS`, `SAMPLES`.

Rules the code cannot show:

- The marquee face is `#f6e094` but its light throw is the paler `#f6e4a8`, aimed nearly straight down with a 50 degree spread; a redder throw saturates the control panel, so move both together.
- The bezel art is `#172838`, not the artboard's `#182a30`, so warm light neutralises it to grey rather than green.
- `frames.json` records `body_fallback` and `door_fallback`; a true there means the ambientCG fetch failed and the frames lack the material grain. Re-run.
- The Pixi scene depends on the frame size, the corner order and the yaw list in `frames.json`. Change those and the consumer changes too.
- Check a render the way the first one was checked: frames 00, 12 and 24 as images, side stripe at one arc end only, alpha 0 background, darks at hue 180 to 240, no brown, no purple, and the `frames.json` corners overlaid on a frame in a scratch page screenshot with `playwright-cli`.

The look and its sources: the design canvas https://claude.ai/code/artifact/4a24a868-28b6-4e90-8cca-a5ba487fb105 (look B artboards), `apps/cabinet/docs/research/craft-values-standing-in-front.md`, `apps/cabinet/docs/research/pseudo-3d-for-the-cabinet.md`, `apps/cabinet/docs/research/free-assets-for-the-cabinet.md`.
