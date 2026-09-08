# Render with Blender, headless

For an agent asked to make pictures with Blender in this repo: a turntable, a sprite layer, a lit plate, a texture bake. Blender runs here with no window, driven by a Python script, on CPU. The script builds the scene, sets the camera and lights, renders, and exits. The pictures are the deliverable; the script is the model. Edit the script, run it, look at the pictures.

Worked example in the repo: `apps/cabinet/prototypes/standing-in-front/cabinet.py` builds an arcade cabinet from boxes and renders a 25 frame yaw turntable with per-frame corner data. `example.py` beside this file is the smallest complete scene: a box on a floor under one glowing panel.

## Steps

1. Check Blender: `blender --version` prints `Blender 5.2.1 LTS` or newer. If missing, install with no admin: download `blender-<version>-linux-x64.tar.xz` from `https://download.blender.org/release/`, unpack into `~/.local/opt/`, symlink `~/.local/opt/blender` to the unpacked folder and `~/.local/bin/blender` to its `blender` binary (`~/.local/bin` is on PATH). Done when `blender --version` prints.
2. Write the script as small named functions in story order (clear scene, build objects, materials, lights, camera, render settings, render, export data) with one `main()` call at the end. Read the script's arguments from `sys.argv` after the `--` separator; Blender consumes everything before it. Start from `example.py`.
3. Run it: `blender --background --python <script.py> -- <out-dir> [flags]`. Filter the output, Blender is chatty: pipe through `grep -E 'Saved|Error|Traceback|<your own marker>'`. Done when it exits 0 and every expected file exists.
4. Iterate on a quick render first: 3 frames, 16 samples, a small size. Only then run the full set. A 720 by 1200 frame at 96 samples with the denoiser takes about 15 s on 12 cores; budget from that.
5. Look at the output. Read one image as an image and check what the task asked for (shape, light direction, colours, transparent background). Judge colours by numbers when the brief gives hex values: sample pixels (ffmpeg raw decode, or a scratch page) and compare hue and saturation, because the eye misreads warm light on cool surfaces.
6. Show the human: reading an image only shows it to the agent. Use SendUserFile or `open <file>`.

## Rules the code cannot show

- Blender 5.2 API drift: the Principled BSDF socket is `Specular IOR Level` (not `Specular`), and `Material.use_nodes` is deprecated because materials now have node trees by default. Snippets from older tutorials that set either one fail. The API reference is at https://docs.blender.org/api/current/.
- Cycles on CPU: `scene.render.engine = "CYCLES"`, `scene.cycles.device = "CPU"`, samples 64 to 128 with OpenImageDenoise (`scene.cycles.use_denoising = True`). Eevee needs a GPU context and is not reliable headless in WSL.
- Transparent output: `scene.render.film_transparent = True` and PNG with RGBA. An object that must light the scene but stay out of the picture: `obj.visible_camera = False` (Cycles), it still emits and casts.
- Exact base colours: a lit world adds haze and darkens floors. For plates that must hit a hex value exactly, give the surfaces an emission plus diffuse material and turn the world background to black.
- Warm light on cool surfaces multiplies to olive at mid values. Use a paler throw colour than the face colour of the lamp, aim it, and check the result by numbers.
- Projecting 3D points to pixel coordinates (for corner tables and hit areas): `bpy_extras.object_utils.world_to_camera_view(scene, cam, point)` returns normalised (x, y) with y up; pixel x = x times width, pixel y = (1 - y) times height.
- Fonts: load a TTF with `bpy.data.fonts.load(path)` and assign it to a text object's `data.font`. Google Fonts files come from the google/fonts GitHub repo raw URLs under the OFL; keep `OFL.txt` beside the TTF.
- Materials: ambientCG has a keyless JSON API, all CC0: `https://ambientcg.com/api/v3/assets?id=<Id>&include=downloads`, pick the 1K JPG zip, use the `NormalGL` and `Roughness` maps as Non-Color. Poly Haven is the same kind of source (`https://api.polyhaven.com`). Which sources may ship in this public repo, and how to query them: `apps/cabinet/docs/research/free-assets-for-the-cabinet.md`.
- WebP for the web: `cwebp -q 88 -alpha_q 100 -exact in.png -o out.webp` (cwebp is at `/home/linuxbrew/.linuxbrew/bin/cwebp`). Keep the PNGs out of git; the script regenerates them.
- Worktree guard: run one command per call with literal absolute paths. Compound commands with variables, heredocs, globs or `&&` chains that name git are refused.
