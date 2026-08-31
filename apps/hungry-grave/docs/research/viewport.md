# Logical world vs rendered viewport across aspect ratios

Research for Hungry Grave (PixiJS v8, portrait, fixed 540x760 logical playfield, deterministic replay tapes).
Every finding is labelled DOCUMENTED (stated in a primary source I read) or INFERRED (my reasoning, or a secondary/community source).

## What is solid

Five things came back consistent across every engine, platform and shipped game I looked at.

**1. The industry has one shared shape for this, and it is exactly the shape Hungry Grave already has.** Every mainstream 2D engine separates a "design resolution" / "reference resolution" / "base size" (the units gameplay code thinks in) from the physical surface, and then picks a *policy* for reconciling the two. Cocos2d-x states it most bluntly: set the design resolution and "you should always focus on this size in your game logic". Godot, Unity and Cocos differ only in the names of the policies, not in the structure. So 540x760 is not the thing to throw away; the thing to add is the policy layer above it.

**2. The policy menu is small and fully enumerated.** Ignore/stretch, keep (letterbox+pillarbox), keep-width, keep-height, expand, crop/shrink, integer scale. Godot, Unity's Canvas Scaler, Unity's Pixel Perfect Camera and Cocos2d-x are the same five-to-seven options under different names. There is no eighth clever option that shipped games discovered.

**3. Fairness has a settled answer in competitive play, and it is "cap the world, not the pixels".** Valorant, CS2 and Overwatch all render the extra pixels but refuse to hand over extra world. Overwatch's stated reason is verbatim a fairness argument. The 2D equivalent that shipped is osu!, whose playfield stays 4:3 inside any window, with the extra space given to HUD only. Terraria is the counter-example that proves it: its no-spawn rectangle is in fixed pixel units, so it has to clamp minimum zoom by resolution to stop enemies spawning on screen.

**4. Simulation in fixed units with only the camera adapting is standard, and the failure mode is well attested.** Age of Empires' network model states the rule generally: simulation code "must not depend on any local factor (such as having free time, special hardware, or different settings)". Minecraft's 1.18 split of simulation distance from render distance is the same principle applied deliberately after the two had been fused. Terraria is the live example of the leak, and its symptom is precisely a gameplay-fairness symptom, not a crash.

**5. Touch and legibility minimums are absolute physical quantities, never fractions of the playfield.** 44x44 pt (Apple), 48x48 dp (Material, about 9 mm physical), 24x24 CSS px (WCAG 2.5.8 AA). These are the one category that must resist the scale factor.

---

## Numbered findings

### Part 1: the standard patterns

**F1. Godot names the full policy set, and its two axes are stretch *mode* and stretch *aspect*.** DOCUMENTED.
Modes: `disabled` ("One unit in the scene corresponds to one pixel on the screen"), `canvas_items` (base size stretched to cover the screen, rendered directly at target resolution, recommended for non-pixel-art 2D), `viewport` (render at base size then scale the whole viewport, low-res look).
Aspects: `ignore` (distort), `keep` ("black bars will be added to the top/bottom of the screen ('letterboxing') or the sides ('pillarboxing')"), `keep_width` (pillarbox on wider, grow vertically on taller), `keep_height` (letterbox on taller, grow horizontally on wider), `expand` (grow in whichever direction exceeds the base aspect, proportions maintained).
https://github.com/godotengine/godot-docs/blob/master/tutorials/rendering/multiple_resolutions.rst

**F2. Godot states plainly that `expand` reveals additional world content.** DOCUMENTED. With `keep_width` a wider screen reveals "more content to the bottom"; with `keep_height`, "more content to the right". This is the doc admitting that expand is a gameplay decision, not a presentation decision.
Same URL as F1.

**F3. Godot recommends a square base resolution when both orientations must be supported.** DOCUMENTED. "consider a *square* (1:1 aspect ratio)" base so the automatically determined scale factor is similar across orientations. Directly relevant if Hungry Grave ever wants a landscape presentation of the same portrait playfield.
Same URL as F1.

**F4. Godot's integer scale mode is the pixel-art rule.** DOCUMENTED. Setting stretch scale mode to `integer` "prevents uneven pixel scaling from occurring, which makes pixel art not display as intended"; each viewport pixel then maps to an exact NxN block rather than a fractional 2.133x. Cost is extra letterboxing, since the scale factor can only step.
Same URL as F1.

**F5. Unity's Canvas Scaler is the same policy set expressed for UI.** DOCUMENTED. `Scale With Screen Size` takes a Reference Resolution, then a Screen Match Mode of `Match Width Or Height` (with a 0..1 blend), `Expand` ("Expand the canvas area either horizontally or vertically, so the size of the canvas will never be smaller than the reference"), or `Shrink` ("Crop the canvas area either horizontally or vertically, so the size of the canvas will never be larger than the reference"). `Expand` is the safe-area-plus-expand-area pattern under its Unity name. `Constant Physical Size` exists as a third mode for exactly the touch-target problem.
https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/script-CanvasScaler.html

**F6. Unity's 2D Pixel Perfect Camera exposes crop policy per axis.** DOCUMENTED. A Reference Resolution ("the original resolution your Assets are designed for") plus a Crop Frame of None, Pillarbox, Letterbox, Windowbox or Stretch Fill; crop adds black bars along the checked axis so the visible region matches the reference.
https://docs.unity3d.com/6000.4/Documentation/Manual/urp/2d-pixelperfect-ref.html

**F7. Cinemachine's camera-fitting is "compute the lens from the content and the aspect".** DOCUMENTED. Group Framing has a Framing Mode of Horizontal, Vertical, or "Horizontal And Vertical: Use the larger of the horizontal and vertical dimensions to get the best fit", and for orthographic cameras it "Clamps the camera's Orthographic Size to the specified range". That clamp is the engine-blessed hook for capping how much world a huge screen may see.
https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/manual/CinemachineGroupFraming.html

**F8. Cocos2d-x names the same policies and states the logical-units rule outright.** DOCUMENTED. `EXACT_FIT` (fill, distort), `NO_BORDER` (fill, crop, no distortion), `SHOW_ALL` (fit, letterbox/pillarbox), `FIXED_WIDTH` (keep design width, extend height to the device), `FIXED_HEIGHT` (keep design height, extend width). And on the design resolution: "you should always focus on this size in your game logic, and the coordinate of right top corner of your game will always be (320, 480)".
https://docs.cocos2d-x.org/api-ref/js/v3x/symbols/cc.ResolutionPolicy.html and https://github.com/dalinaum/chukong-cocos-docs/blob/master/manual/framework/cocos2d-js/4-essential-concepts/4-4-resolution-policies/en.md

**F9. WSGF's scaling taxonomy is the canonical vocabulary for what happens to the world when the frame widens.** DOCUMENTED.
Hor+: "expands the horizontal component of the FOV while keeping the vertical component roughly or exactly the same"; considered the ideal for widescreen.
Vert-: "decreases the vertical component of the FOV" on a wider screen; correct aspect, no distortion, but less picture.
Pixel Based: "The horizontal component of the FOV is directly tied to the number of horizontal pixels... The larger your resolution, the more the game will display." This is the failure mode a naive PixiJS resize produces, and it is the one that is unfair by construction.
Anamorphic: letterbox at narrower aspects, no bars at the design aspect, added content wider than it.
https://www.wsgf.org/article/screen-change

**F10. The "guaranteed-visible inner rect inside a larger maybe-visible rect" is an old broadcast standard with hard numbers.** DOCUMENTED. SMPTE ST 2046-1 defines Safe Action Area as 93% of width and height of the production aperture, Safe Title Area as 90%, and both SMPTE and EBU converged on 90/93. Games inherited the idea; the game-side version is the design-safe rect plus an expand region.
https://pub.smpte.org/pub/st2046-1/st2046-1-2009.pdf and https://en.wikipedia.org/wiki/Safe_area_(television)

**F11. "Safe area" also has a second, unrelated platform meaning that must not be conflated with the design-safe rect.** DOCUMENTED. Unity's `Screen.safeArea` returns "the safe area of the screen in pixels", covering notches, cutouts, rounded corners and TV overscan, with the instruction to "avoid placing user interface elements in areas outside the safe area rectangle". This is a device-insets problem for HUD only, orthogonal to the gameplay framing policy.
https://docs.unity3d.com/ScriptReference/Screen-safeArea.html

**F12. PixiJS v8 gives you the surface and nothing above it.** DOCUMENTED. `ResizePlugin` is installed automatically by `Application.init()`; with `resizeTo: window` it reads `innerWidth`/`innerHeight` (or `clientWidth`/`clientHeight` for an element), resizes the renderer to those dimensions, throttled to one resize per animation frame, and you can drive it with `app.resize()` / `app.queueResize()` / `app.cancelResize()`, or set `resizeTo = null` to opt out entirely. `renderer.resize(w, h)` is the manual path. `resolution` plus `autoDensity` handle device pixel ratio only.
https://github.com/pixijs/pixijs/blob/dev/src/app/__docs__/resize-plugin.md and https://github.com/pixijs/pixijs/blob/dev/src/rendering/__docs__/rendering-overview.md and https://pixijs.com/8.x/guides/components/application

**F13. Consequence: in Pixi the design-resolution layer is yours to write.** INFERRED, but forced by F12. Pixi has no Canvas Scaler and no stretch aspect setting. The standard community shape is a root "stage/camera" container whose scale is `min(screenW/logicalW, screenH/logicalH)` (or `max` for cover/crop), centred by offset, with the renderer sized to the real surface. `resizeTo: window` alone, with world objects positioned in raw screen pixels, is precisely WSGF "Pixel Based" and is the trap.
https://github.com/pixijs/pixijs/discussions/8525 and https://coderevue.net/posts/scale-to-fit-screen-pixijs/ (community, not primary)

### Part 2: which pattern preserves fairness

**F14. Overwatch's policy is a stated fairness decision, in the developer's own words.** DOCUMENTED (quote widely reproduced; primary is a Blizzard forum post by Jeff Kaplan). "We feel like it would be unfair to 16:10 and 16:9 players if 21:9 gave a substantial FOV advantage." The implementation is Vert- at 21:9: the extra pixels exist, the extra world does not.
https://www.wsgf.org/phpBB3/viewtopic.php?f=95&t=31077 and https://us.forums.blizzard.com/en/overwatch/t/when-are-you-gonna-support-proper-ultrawide-21-9/50332

**F15. Valorant renders 16:9 and pillarboxes anything wider, explicitly for competitive integrity.** DOCUMENTED (Riot support page lists supported resolutions; the fairness rationale is stated in Riot communications and reproduced widely). A 21:9 resolution in fullscreen gets black bars rather than extra view.
https://support.riotgames.com/en-us/valorant/support-tools/supported-resolutions-in-valorant

**F16. The measured size of the advantage is roughly 29% more visible area at 21:9 vs 16:9 at equal height.** DOCUMENTED (secondary, hardware press). Useful only as an order of magnitude for how big the fairness gap is if you let width expand freely.
https://us.ktcplay.com/blogs/technology-hub/why-competitive-games-ban-ultrawide-monitors

**F17. The 2D, score-attack precedent is osu!: fixed playfield, variable chrome.** DOCUMENTED. The osu! playfield is scaled by screen *height* and is always 4:3; wider aspects get more room for score bars, leaderboard and HUD, and gameplay is unaffected. This is the closest structural analogue to Hungry Grave: a leaderboard game that refuses to let the window change the play area, and spends the surplus on HUD.
https://osu.ppy.sh/wiki/en/Client/Playfield

**F18. Terraria demonstrates the opposite architecture and the workaround it forces.** DOCUMENTED. Enemies must spawn outside a fixed 2088x1172 pixel rectangle centred on the player. Because that rectangle is fixed while the visible area is not, the game clamps minimum zoom based on resolution, and players on very wide or very large displays who defeat the clamp (mods, 32:9) see enemies spawn on screen. The community guidance is explicit that this is the trade for the extra real estate.
https://terraria.wiki.gg/wiki/NPC_spawning and https://terraria.wiki.gg/wiki/Talk:NPC_spawning and https://steamcommunity.com/sharedfiles/filedetails/?id=3364518273

**F19. Practitioner mobile guidance says the same thing in layout terms: the base aspect is a floor that is never reduced.** DOCUMENTED (practitioner article, Space Ape Games; I could not fetch it directly, 403, so this is from the indexed summary). Define a base aspect as the safe area; other aspects only *add* space on X or Y; the safe area is never reduced, so layouts only ever adapt to surplus. The associated caution is that surplus must not reveal spawn points, out-of-bounds, or anything that confers advantage.
https://medium.com/the-space-ape-games-experience/aspect-ratio-scaling-mobile-and-tablets-d574ab20a943

**F20. Indie 2D games with a designed play area commonly refuse ultrawide outright.** DOCUMENTED that the refusals exist (community threads, dev statements relayed); INFERRED as to full reasoning. Hollow Knight's developers stated no plan to support 21:9. Vampire Survivors ships pillarboxed with dimmed borders, and the community reading is that it hides spawn/despawn at the edges. Both are consistent with "the play area is a design object".
https://steamcommunity.com/app/1794680/discussions/0/4512128114436423345/ and https://github.com/RoseTheFlower/UltrawideIndex/blob/main/README.md

**F21. Speedrun/leaderboard communities do not have a single answer, and the common compromise is disclosure rather than prohibition.** DOCUMENTED (forum discussion). The Diablo III speedrun thread's counter-argument to banning ultrawide was to record aspect ratio as a leaderboard column alongside platform, rather than force everyone down. Some hitless communities explicitly allow aspect-changing mods. Takeaway: if the game itself does not fix the play area, the community will end up segmenting the leaderboard.
https://www.speedrun.com/d3_ros/forums/k6xf5 and https://www.teamhitless.com/about/rules/

### Part 3: determinism and viewport

**F22. CONFIRMED: keeping the simulation in fixed logical units while only camera and render adapt is standard practice.** DOCUMENTED. The canonical statement is from the Age of Empires networking article: the simulation "code must not depend on any local factor (such as having free time, special hardware, or different settings) when it was in the simulation. The code path taken on all machines must match." Screen size is a local factor by that definition. The same article shows how ordinary the leak is: even random terrain sounds inside the simulation "would cause the games to behave differently".
https://www.gamedeveloper.com/programming/1500-archers-on-a-28-8-network-programming-in-age-of-empires-and-beyond

**F23. Minecraft split simulation distance from render distance precisely because the two had been fused.** DOCUMENTED. Before snapshot 21w38a (1.18), simulation distance equalled render distance, so entity ticking was governed by how far the client drew. Simulation distance now defines its own square of ticking chunks independent of what is rendered.
https://minecraft.wiki/w/Simulation_distance and https://learn.microsoft.com/en-us/minecraft/creator/documents/simulationrenderdistanceguide

**F24. Terraria is the clearest shipped case of a viewport quantity living in the simulation.** DOCUMENTED (see F18). The spawn exclusion zone is expressed in screen-space pixels, and the wiki talk page records contributors tracing it back to "an update that linked spawn 'rate' and location to the game window's size", with a remembered changelog line "Enemy spawn distance has been pushed back to the maximum resolution to ensure that they will never spawn on the screen." That is a spawn-position leak in exactly the category the dispatch asked about, and its cost is a permanent zoom clamp plus an unfixable edge case at extreme widths.

**F25. Factorio's desync documentation does not list display settings as a hazard at all.** DOCUMENTED, as an absence. The only relevant line is "Networking-, latency or performance problems do *not* cause desyncs"; the causes discussed are code bugs. INFERRED reading: in a codebase where the sim/render boundary was drawn correctly from the start, screen size never becomes a desync category, which is itself evidence that the boundary is the standard answer rather than a mitigation.
https://wiki.factorio.com/Desynchronization

**F26. No source I found recommends letting the simulation see the viewport.** DOCUMENTED as an absence across Godot, Unity, Cocos, WSGF and the networking literature. The consistent framing is design-resolution-in, camera-policy-out. INFERRED consequence for Hungry Grave: the tape stays bit-exact for free as long as the adaptation is confined to a camera/root-container transform and the renderer size, and nothing in the sim reads `app.screen`, `window.inner*`, or the computed scale.

**F27. The specific quantities that leak, in order of how often they are named.** INFERRED from the pattern across F18/F22/F23, not a single source list. Spawn positions and spawn margins (Terraria). Despawn/cull bounds, where "off screen" doubles as "delete" (Minecraft's pre-1.18 fusion is the structural analogue). AI activation and aggro ranges gated on visibility. Difficulty pacing that counts on-screen actors. Camera-relative clamping of player position. Any of these reading a live viewport turns a device difference into a simulation difference.

### Part 4: proportional vs absolute

**F28. Apple: minimum tappable area is 44x44 points.** DOCUMENTED. "Maintain a minimum tappable area of 44x44 points for all controls." Absolute physical quantity, not a fraction of the playfield.
https://developer.apple.com/design/human-interface-guidelines/layout

**F29. Material Design: minimum touch target 48x48 dp, with 8 dp separation, about 9 mm physical regardless of screen size.** DOCUMENTED. Android's own accessibility help gives the same 48dp figure; Compose components pad themselves to 48 dp when interactive.
https://support.google.com/accessibility/android/answer/7101858 and https://m3.material.io/foundations/designing/structure and https://developer.android.com/develop/ui/compose/accessibility/api-defaults

**F30. WCAG 2.2 SC 2.5.8 Target Size (Minimum), Level AA: "at least 24 by 24 CSS pixels".** DOCUMENTED, with five exceptions, of which the relevant one is Spacing: undersized targets pass if a 24 px diameter circle centred on each bounding box does not intersect another target's circle.
https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

**F31. Unity offers a dedicated mode for the absolute-size case, which is the tell that this category is real.** DOCUMENTED. Canvas Scaler's `Constant Physical Size` "Makes UI elements retain the same physical size regardless of screen size and resolution", sitting beside the scale-with-screen mode used for everything else.
https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/script-CanvasScaler.html

**F32. The split that the sources collectively support.** INFERRED, synthesised from F1/F5/F8/F28-F31.
Fixed logical units (scale with the world, never with the device): entity sizes, hitboxes, speeds, accelerations, spawn margins, despawn bounds, AI ranges, everything the tape replays.
Fraction of the playfield: nothing in the simulation. Fractions belong to camera framing and to layout anchoring only, and even there Godot's advice is anchoring to corners rather than proportional positioning.
Absolute physical units (resist the world scale entirely): touch targets, minimum legible text, HUD insets against device notches. These need a second, device-space scale factor so they stay >= 44 pt / 48 dp / 24 CSS px however small the logical unit becomes on a phone.

**F33. Consequence for a 540-wide portrait playfield on a phone.** INFERRED arithmetic from F28-F30. If 540 logical units map to a 390 CSS px iPhone width, one logical unit is about 0.72 CSS px, so a 44 pt control is about 61 logical units, and anything sized in logical units for a desktop look will be under-sized for thumbs. Touch targets must be computed after the scale, in device space, not authored in logical units.

### Part 5: portrait composition on landscape screens

**F34. TATE is a real, still-shipping option, and its stated benefit is resolution and pixel size, not novelty.** DOCUMENTED (community/wiki). Tate mode rotates the presentation 90 degrees for a physically rotated display; ports historically used it both to fill the screen and to raise the game's effective resolution to the arcade original. Danmaku Unlimited 3 ships TATE with the whole UI rotating 90 degrees, plus user-defined resolutions via a `resolutions.txt`.
https://shmup.fandom.com/wiki/Tate_Mode and https://store.steampowered.com/app/450950/Danmaku_Unlimited_3/ and https://steamcommunity.com/app/450950/discussions/0/133259855831532710/

**F35. The default shipped answer on a 16:9 monitor is pillarboxed portrait with treated side space, not a widened playfield.** DOCUMENTED (community consensus plus observed shipped behaviour in recent shmups such as Gunvein and Danmaku Unlimited). Treatments named: decorative bezel/side art, and a desaturated blurred mirror of the playfield which "makes the screen feel larger with less dead space". Nobody in the sources widens the playfield.
https://shmups.system11.org/viewtopic.php?t=57910 and https://www.arcade-projects.com/threads/my-preferences-tips-tricks-for-vertical-games-on-a-vertical-tate-high-resolution-screen-1080p.32429/

**F36. There is a design argument against widening that is independent of fairness.** DOCUMENTED (practitioner discussion). A wider field of movement demands a higher base ship speed to traverse it, and higher speed costs precision, which is why shmups deliberately use a narrow playfield rather than all available width. Widening Hungry Grave's playfield would therefore be a movement-tuning change, not just a framing change.
https://shmups.system11.org/viewtopic.php?t=57910

**F37. The surplus width is where the HUD goes.** DOCUMENTED via F17 (osu! gives extra width to score bars and leaderboard) and F35 (shmup side panels carry score, lives, bombs). This is the established use for the space, and it also gets HUD off the playfield, which is a readability gain on phones.

### Part 6: extreme aspect policies

**F38. Android has a first-class platform mechanism for clamping aspect: `android:maxAspectRatio`.** DOCUMENTED. Expressed as the decimal quotient of longer over shorter dimension (7:3 becomes 2.33); if the device is wider, "the system automatically letterboxes the app". Only settable with `resizeableActivity="false"`. Caveat worth knowing: apps targeting Android 16 (API 36) have this ignored on form factors with smallest width >= 600 dp, with the opt-out slated for removal.
https://developer.android.com/guide/topics/manifest/activity-element and https://developer.android.com/develop/ui/compose/layouts/adaptive/app-orientation-aspect-ratio-resizability

**F39. Anamorphic is the shipped shape of "support a band of aspects, clamp outside it".** DOCUMENTED via F9. Letterbox below the design aspect, no bars at it, extra content above it up to a limit. Games that support 21:9 routinely do not support 32:9 and fall back to bars or to cropping top and bottom, because the wider ratio has to be handled as its own case.
https://www.wsgf.org/article/screen-change and https://us.ktcplay.com/blogs/technology-hub/why-games-have-black-bars-on-ultrawide-monitors

**F40. Capping the visible world via a camera clamp is engine-supported, not a hack.** DOCUMENTED via F7: Cinemachine Group Framing clamps orthographic size to a specified range. The 2D equivalent is: compute the fit scale, clamp it to `[minScale, maxScale]`, and letterbox the remainder.

**F41. Terraria's zoom clamp is the shipped precedent for "cap the visible world" in a 2D game.** DOCUMENTED via F18. Note the ordering lesson: they clamp because a simulation constant was already expressed in screen pixels. Capping is cheap when it is a policy and expensive when it is a patch.

---

## Candidate policies for Hungry Grave

All five keep the simulation in 540x760 logical units. They differ only in what the camera and renderer are allowed to do, so all five are neutral on tape bit-exactness *provided* the scale factor never reaches simulation code. Where a policy does threaten comparison, it is called out.

### P1. Fit-and-letterbox (Godot `keep`, Cocos `SHOW_ALL`, Unity Pixel Perfect `Windowbox`)

Scale the root container by `min(sw/540, sh/760)`, centre, bars everywhere else.

Buys: perfect fairness by construction; every run on every device sees exactly the same world; replay, leaderboard and screenshots are all directly comparable; zero new simulation risk; smallest amount of code.
Costs: on a 16:9 desktop monitor the playfield occupies about 39% of the width, so the page looks mostly empty unless the surplus is designed; on very tall modern phones (20:9, 21.5:9) it leaves horizontal-ish bands the designer did not ask for; the ask "fill the available viewport" is only satisfied in the weak sense.
Replay impact: none. Run comparison: none, this is the reference case.

### P2. Fit-and-letterbox with a designed surround (P1 plus F35/F37)

P1, plus the bars become HUD and art: score, lives, weapon state, a treated blur or bezel.

Buys: everything P1 buys; the widescreen case stops looking broken; moving the HUD off the playfield is a readability win on small screens, which is the same direction the shmup precedent points.
Costs: real art and layout work at several aspect bands; the HUD now has two homes (inside the playfield on a tall phone where there is no surround, outside it on a desktop), so HUD placement becomes conditional; that conditional layout is the part most likely to be fiddly.
Replay impact: none, as long as HUD layout reads the viewport and the simulation does not. Run comparison: none.

### P3. Fixed logical width, variable logical height (Godot `keep_width`, Cocos `FIXED_WIDTH`)

540 wide always; the visible height becomes `540 * sh/sw`, so taller devices see further up-field.

Buys: fills tall phones edge to edge, which is the primary target device; the up-field direction is the natural place for a vertical scroller to have slack.
Costs: this is the fairness break, and for this game it is the sharpest possible one. Seeing further up-field is exactly the advantage the dispatch names, because it is early warning of mob waves and of the tear. A 21.5:9 phone sees materially more approach time than a 4:3 tablet. Terraria (F18) shows the spawn-margin consequence: if mobs are spawned relative to a fixed logical top edge, a taller viewport shows them popping in.
Replay impact: bit-exactness survives, but only if spawn Y, despawn Y and any up-field measurement stay pinned to the fixed 760 logical box rather than the visible box. The moment one of them reads the visible height, tapes stop reproducing across devices.
Run comparison: broken, or at least segmented. Scores would need an aspect column (F21) to be honest.

### P4. Safe playfield plus expand margin (Unity `Expand`, F19, F10)

Guarantee 540x760 always visible; let surplus reveal a bounded decorative or non-authoritative margin (background, parallax, mob approach silhouettes that carry no information the 760 box will not also show).

Buys: fills the viewport on most real devices without conceding gameplay advantage; the guarantee is stated as an invariant that can be tested; matches the strongest practitioner guidance found (safe area never reduced, surplus never informative).
Costs: the invariant "the margin reveals nothing actionable" is a discipline, not a mechanism, and it decays. Every new effect, telegraph or spawn animation has to be re-checked against it. Sources are explicit that surplus must not reveal spawn points; a game where mobs enter from off-screen top is the hardest possible case for keeping that promise.
Replay impact: none if the margin is render-only. Run comparison: intact only while the discipline holds; the failure is silent, which is the worrying part.

### P5. Expand with a clamped aspect band (P4 plus F38/F39/F40/F41)

P4, but the fit scale is clamped so the visible world never exceeds a stated band, say 3:4 through 9:19.5, with letterbox beyond it in both directions.

Buys: bounds the worst case at both extremes, so a 32:9 monitor and a 4:3 tablet both land inside a known envelope; the band is a number that can be written down, tested, and cited in an ADR; it is the policy Android, Cinemachine and Terraria all implement in their own vocabularies.
Costs: more moving parts than P1 or P2; the band's edges have to be chosen with evidence rather than taste; still inherits P4's discipline problem inside the band, only over a smaller range.
Replay impact: none. Run comparison: bounded rather than eliminated. Honest framing is that runs are comparable within the band by construction, which is a weaker claim than P1/P2 make.

### The shape of the trade

P1 and P2 are the only options that make "every run saw the same world" a structural fact rather than a maintained promise. P2 is P1 with the emptiness solved, and it is what the shipped 2D score-attack precedent (osu!, modern shmups) actually does. P3 is the one to be most careful with, because it is the most natural thing to reach for on a phone and it concedes precisely the advantage the game's scoring cares about. P4 and P5 are legitimate and widely used, and they buy a fuller screen in exchange for converting a structural guarantee into an ongoing discipline.

One asymmetry worth stating: the tape is safe under all five, because determinism only requires that the scale factor never crosses into simulation code. Fairness is not safe under all five. Those are two different questions wearing similar clothes, and the sources are unanimous that only the second one has ever bitten a shipped game.
