# Dispatch: build the standing-in-front Pixi prototype

Paste the block below as the prompt of one `general-purpose` Agent, run in the background. It carries the six items of the dispatch contract. The dispatching session then publishes `index.html` as a Claude artifact itself (the agent has no Artifact tool) after loading the `artifact-design` skill, and sends Mark the link.

---

Read `docs/agents/feature-playbook.md` and follow it. This is a PROTOTYPE slice under the `prototype` skill (/home/mlo/.claude/skills/prototype/SKILL.md, UI branch): no tests, no abstractions, but the playbook's verification and reporting rules hold. Never commit, never run git write commands. Working directory: /home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/cabinet-app (a git worktree; the guard refuses compound shell commands with variables, heredocs, globs, or `&&` chains that name git; use literal absolute paths, one command per call, and the Write tool for files). No em dashes (U+2014) anywhere. No emojis. Use the glossary words in `apps/cabinet/CONTEXT.md` (cabinet, monitor, marquee, standing in front) in code and comments.

## Definition of the thing

Read `apps/cabinet/prototypes/standing-in-front/prototype-plan.md` in full: it is the definition, in observable terms. Also read `apps/cabinet/PRODUCT.md` (the brief and anti-references), `apps/cabinet/docs/research/craft-values-standing-in-front.md` (motion numbers and the frame-loop policy) and `apps/cabinet/docs/research/pseudo-3d-for-the-cabinet.md` (Recommendation section: turntable frame plus PerspectiveMesh monitor plus additive spill; `PerspectiveMesh` at its default 10 by 10 grid stays in the sprite batch). Output: `apps/cabinet/prototypes/standing-in-front/index.html`, one file, Pixi from cdnjs, WebP frames as data URIs, Bungee from Google Fonts.

One preparatory render is needed first: the light spill as a light-only additive plate. `render/spill.webp` is opaque (wall and floor geometry fill the frame). Add a `--spill-light` flag to `cabinet.py` that renders the same spill camera with the wall, floor and baseboard base colours set to black and the world off, so only the received light remains, and writes `render/spill-light.png` and `.webp`. Run it: `/home/mlo/.local/bin/blender --background --python apps/cabinet/prototypes/standing-in-front/cabinet.py -- apps/cabinet/prototypes/standing-in-front/render --spill-light` (about one minute). Use that plate with `blendMode: 'add'`, positioned so its floor pool sits at the cabinet's feet and moves with the cabinet layer. Read `regenerate-the-cabinet-frames.md` beside the script before touching it.

Pixi skills to consult for exact API: `pixijs-skills:pixijs-events` (pointer events, `eventMode`, `globalpointermove`), `pixijs-skills:pixijs-ticker` (`ticker.stop`, `maxFPS`, `deltaMS`), `pixijs-skills:pixijs-scene-mesh` (`PerspectiveMesh.setCorners`), `pixijs-skills:pixijs-application` (`resizeTo`, `autoDensity`, `resolution`).

## Verification steps

1. (agent) Serve the folder with `python3 -m http.server 8766 --directory /home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/cabinet-app/apps/cabinet/prototypes/standing-in-front` in the background and open it with `playwright-cli` (it blocks file: URLs). No console errors.
2. (agent) Desktop viewport 1440 by 900: screenshot at rest, then move the mouse to the left edge, wait for the lag to settle, screenshot; the frame index changed toward one arc end and the side panel with the stripe is visible. Repeat to the right edge.
3. (agent) Phone viewport 390 by 844 with touch: screenshot at rest; the whole cabinet and its floor contact are in view, the page does not scroll, the hint is legible. Dispatch a `touchstart`; the hint wording swaps. Drag; the frame changes.
4. (agent) Keys: ArrowLeft, ArrowRight, A, D each change the yaw without clicking the canvas first.
5. (agent) Loop modes: in on-demand mode with drift off, the counter's renders-per-second reads 0 after settling and rises only on input; in continuous 30 it reads about 30; in continuous 60 about 60 (headless may cap lower; report the numbers seen).
6. (agent) Emulate `prefers-reduced-motion: reduce` with playwright: the drift does not run and the first sweep does not run.
7. (agent) File size of `index.html` under 16 MB, and the switcher bar visibly separate from the scene.
8. (session) Loads the `artifact-design` skill, publishes `index.html` as an artifact with favicon and description, opens it once, and sends Mark the link.
9. (Mark) Plays it on phone and desktop and names the drift timing and the loop mode. Open.

## Seams under test

The page's inputs: pointer position, drag, keys, `touchstart`, `visibilitychange`, `prefers-reduced-motion`, and the two switcher controls. Its outputs: the frame index, the monitor mesh corners, the hint text, and the counter. `frames.json` is consumed as-is; do not edit it.

## Module boundaries

One file with one inline script, arranged as small named functions in story order: load assets, build room layers, build cabinet layer (frame sprites plus spill), build monitor mesh, build hint, build switcher and counter, input controller (pointer, drag, keys), motion model (target yaw, lag, drift, first sweep, reduced motion), frame loop (continuous with cap, on demand), and one `main()` call at the end. Around forty lines per function. The motion model is a pure function of time and inputs, so on-demand rendering can call it once per input.

## Planned test list

None: prototype per the prototype skill. The verification steps stand in.

## Report

End with the verification steps you ran and their results, the numbers the counter showed in each loop mode, the `index.html` size, the drift amplitudes and periods you shipped, and anything that surprised you or that you could not do.
