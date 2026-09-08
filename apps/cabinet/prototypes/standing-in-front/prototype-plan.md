# Standing in front: the Pixi prototype

The question, from ticket 93: what does it feel like to stand in front of the cabinet? Look B ("Lit by the machine") is already picked. This prototype settles the motion timing and the frame-loop policy, and it is the thing Mark plays on his phone and his desktop.

Inputs already on disk, produced by `cabinet.py` (see `regenerate-the-cabinet-frames.md`): `render/cabinet-00.webp` to `render/cabinet-24.webp` (720 by 1200, transparent, yaw -12 to +12 in 1 degree steps, frame 12 dead-on), `render/spill.webp` (1440 by 900 opaque room plate with the light baked in, same camera at yaw 0), and `render/frames.json` (per frame: monitor and marquee corners in frame pixels, floor contact point; plus camera numbers and `cabinet_sprite_scale` 0.679 with centre (720, 450) for dropping a frame onto the plate).

## Shape

One HTML file, `index.html`, beside this plan. Pixi 8.16.0 from cdnjs (`https://cdnjs.cloudflare.com/ajax/libs/pixi.js/8.16.0/pixi.min.js`, UMD, global `PIXI`, has `PerspectiveMesh`). The 26 WebP files embedded as data URIs (628 KB total). Bungee from Google Fonts with a fallback stack. No build step, no server: the file is published as a Claude artifact and opened on a phone and a desktop. Artifact limits that bind: scripts only from cdnjs, fonts only from Google, everything else inline, page under 16 MB.

## What the visitor sees and does

- The whole cabinet, standing in a dark room, with air on both sides. Portrait phones show the cabinet larger and less room; landscape desktops show more room. Wall, floor and baseboard colours from the look B artboard: wall `#08090c`, floor `#0c0f13` to `#050608`, baseboard `#0d1014`, outlet `#14181d`, cord `#030405`. The room must stay visible (the accepted risk is the product-shot anti-reference).
- Moving left and right. Mouse position sets a target yaw across the arc. Arrow keys and WASD nudge it. Drag (pointerdown, globalpointermove, pointerup, pointerupoutside on the stage) pulls it. The canvas has focus on load so keys work at once.
- Depth. The room is Z-as-multiplier parallax layers (far wall moves least, floor edge most). The cabinet is the turntable frame nearest the current yaw. The light spill rides with the cabinet, never with the wall.
- The monitor is alive. A `PerspectiveMesh` sits on the glass using that frame's corners from `frames.json`, showing a stand-in: dark teal glass `#0b1a1d`, the words THE CABINET in `#8fd0c9`, and a hint line. What plays on it for real is ticket 94.
- Coaching the first move, in the machine's own idiom. Before the visitor does anything the scene already moves (the drift starts at once, and a first slow sweep from one end of the arc to the other shows the sides exist). The monitor hint reads "LOOK AROUND" with arrows; on the first `touchstart` it swaps to "DRAG TO LOOK"; after the first real move it fades out. No text outside the canvas.
- Idle drift. A slow sine on yaw. Three timings to switch between, from the craft record: Heffernan's 78.5 s period as the long option, and two faster ones (about 40 s and 20 s), each with an amplitude of a few degrees inside the arc. The camera lags the pointer with an exponential smoothing that is delta-time corrected (the record notes Heffernan's per-frame lerps break at 30 fps).
- Reduced motion. With `prefers-reduced-motion: reduce` the drift stops, the first sweep does not run, and input snaps instead of lagging.
- The frame-loop switch and counter. Two modes: continuous rendering with a frame cap (30 and 60 as sub-options), and render on demand (ticker stopped at rest, one render per input, ticker running only while the drift or the lag is still moving; stop on `visibilitychange`). A small counter in the corner shows renders per second and total renders since load, so Mark can compare the two on his phone.
- A floating switcher bar (the prototype skill's UI-branch bar) at the bottom: drift timing (long, medium, short, off), loop mode (continuous 60, continuous 30, on demand). Visibly not part of the design.

## What must be true

- Everything time-based uses delta time; nothing assumes 60 fps.
- The frame shown never jumps more than one index per rendered frame while the lag is settling; the drift is imperceptible as steps.
- On a phone in portrait the whole cabinet and the floor contact are in view without scrolling; the page does not scroll.
- The hint is legible on the phone at arm's length.
- No brown, no purple, anywhere.

## Done means

Mark has played it on phone and desktop and said which drift timing and which loop mode the cabinet gets. The resolution comment on ticket 93 records the look (B), the timing, the loop pick, the canvas link, the prototype link and the research records.
