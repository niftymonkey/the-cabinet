# Tracer dispatch 2: render structure

This is the plan half of the feature playbook's dispatch contract for tracer plan section 6 item 2, reviewed by all three gates on 2026-08-20 and revised from their findings. Their markers are on #36.

You are writing production code in `/home/mlo/dev/niftymonkey/the-cabinet/apps/hungry-grave`.

Read `docs/agents/feature-playbook.md` at the repo root first and follow it. This prompt is the plan half of its dispatch contract; you execute.

Read these before you write anything: `apps/hungry-grave/docs/adr/0014-readability-layering.md`, `apps/hungry-grave/docs/adr/0003-size-is-health.md`, `apps/hungry-grave/docs/research/readability-value-band.md` sections 0 and 7, `apps/hungry-grave/docs/design/tracer-plan.md` section 3, and `apps/hungry-grave/CONTEXT.md` for the vocabulary.

**Never open `src/prototypes/` at all.** Not to read, not to copy, not to check. Everything you need is in this prompt and the docs above. The prototype's own palette is a dead end that uses banned vocabulary.

## 1. The thing, in observable terms

The game's render structure exists before any field content does: one fitted mapping of the fixed field into any viewport, one declared palette that a unit test can hold to Hungry Grave ADR 0014's value band, and one fixed draw stack.

When it works:

- The game screen shows the field's frame fitted and centred in the window, whole and uncropped, at a desktop shape and at a phone shape alike, and the frame keeps the field's 540 by 760 aspect in both.
- Every colour the game draws is declared in one place with its measured value, and a test fails if any of them enters mob fire's reserved band.
- The draw stack exists as named, empty containers in the order ADR 0014 fixes, so every later renderer attaches to a stack that is already right.
- Nothing on the title screen or the end screen looks different, and the prototype list still works.

## 2. Verification steps, with actors

1. Every planned test in section 5 written and green. Actor: you.
2. `pnpm lint`, `pnpm typecheck`, and `pnpm build`, all clean. `vitest` alone is not enough: the last two dispatches both shipped prettier errors that only `pnpm lint` sees. Actor: you.
3. Rendered check on the **built** app through `vite preview`, never the dev server, with the screenshots actually read: the game screen at 1440 by 900 and at 390 by 844, showing the whole field frame centred and uncropped in both; the tick readout legible at its new value; the title screen and the end screen unchanged. Actor: you.
4. The grayscale differential from research section 0.5 does **not** run in this dispatch, and that is deliberate rather than skipped: it needs mob fire on the field to hide, and there is no field content until dispatch 5. The tracer plan schedules it at dispatches 5 and 7. Say so in your report. Actor: nobody yet.
5. Whether the new palette looks right is a human call after playing, at the dispatch-5 deploy. Never claim the look is right. Actor: Mark.

## 3. The seams under test

- `fitField(viewportWidth, viewportHeight): FieldPlacement` and `screenToField(placement, screenX, screenY)`, in `src/app/layout.ts`.
- `luma`, `apcaLc`, `observerLuma` and `hsv`, in `src/app/color.ts`.
- `PALETTE`, `MENU` and `MOB_FIRE` as declared data, in `src/app/palette.ts`.
- `LAYER_ORDER` and `FieldLayers`, in `src/app/screens/game/layering.ts`.

Do not invent a seam. If the plan looks like it is missing one, stop and report rather than filling the gap.

## 4. Module boundaries

### `src/app/color.ts`, the colour maths

Pure arithmetic. No pixi, no palette data, nothing else imports into it.

```ts
export type Observer = "normal" | "protan" | "deutan";
export interface Hsv { readonly h: number; readonly s: number; readonly v: number }

/** Rec.709 luma on gamma-encoded sRGB, 0 to 100. Channels are raw sRGB bytes and are NOT linearized. */
export function luma(hex: number): number;

/** APCA Lc, constant set 0.0.98G-4g. Signed: light on dark returns a negative Lc. */
export function apcaLc(foreground: number, background: number): number;

/** Apparent lightness for one observer, 0 to 100: linear luminance under that observer's weights, re-encoded to sRGB. */
export function observerLuma(hex: number, observer: Observer): number;

/** HSV, hue in degrees 0 to 360, saturation and value 0 to 1. */
export function hsv(hex: number): Hsv;
```

The constants are all in the research doc: `luma` in section 0.1, APCA in section 3.3, the three observer weight rows in section 5.3. Copy them from there, do not derive them. The APCA algorithm the constants belong to is `apca-w3`, `src/apca-w3.js`, constant set 0.0.98G-4g: a soft clamp near black, a polarity branch, and a low-contrast offset and clip. Hand-roll it rather than taking the dependency; it is about thirty lines and only the tests call it.

`apcaLc` is **signed**. Light on dark returns a negative Lc, so a near-white core on the night sky measures about -97, and every threshold in this plan is on the magnitude. The research doc's section 3.3 table is printed unsigned while its own prose says the output is signed, so read the prose.

This module is also the single source of the luma formula for the grayscale differential at dispatch 5. Research 0.5 rule 3 requires the screenshot check and the unit test to use the same formula, and ADR 0014 stakes its "the two instruments cannot disagree about what they are looking at" claim on exactly that. Dispatch 5 imports `luma` from here; it does not paste the formula.

`observerLuma(hex, "normal")` and `luma(hex)` agree exactly on neutral greys and diverge on saturated colours. That is expected and it is why assertion 6 below is a separation rather than a threshold.

### `src/app/palette.ts`, every colour the game draws

Data plus the band constants. Imports `color.ts` for nothing at runtime; the declared luma numbers are written out, and the test is what checks them.

```ts
export interface PaletteEntry { readonly hex: number; readonly luma: number }

export const MOB_FIRE_BAND_MIN = 88;    // only a mob-fire core may sit at or above this luma
export const FIELD_LUMA_CEILING = 68;   // every other field colour sits at or below this luma
export const BAND_MARGIN_MIN = 20;

/** Every colour drawn while the field is live, the readouts over it included (ADR 0014). */
export const PALETTE: { readonly [name: string]: PaletteEntry };

/** Colours that only draw when the field is not live. Exempt from the ceiling; see the test that holds the exemption shut. */
export const MENU: { readonly [name: string]: PaletteEntry };

export type FireEmitter = "trash" | "tear" | "clod" | "spiral";
export interface FireSprite { readonly core: PaletteEntry; readonly body: PaletteEntry; readonly outline: PaletteEntry }
/** Every mob-fire emitter, each naming its three colours (ADR 0014). */
export const MOB_FIRE: Readonly<Record<FireEmitter, FireSprite>>;
```

Prefer named keys with real types over an index signature if you can express it without an `as` cast; the shape above is the contract, not the literal syntax.

**The table is pinned. Use these exact hexes and these exact declared lumas. Do not round them, adjust them, or add to them.** They are derived in `docs/research/readability-value-band.md` section 7, which also records why three of them are a judgement rather than arithmetic.

`PALETTE`:

| name | hex | luma |
| --- | --- | --- |
| `night` | `0x0e1119` | 6.64 |
| `nightSpeckle` | `0x1d2434` | 13.99 |
| `fieldFrame` | `0x2a3348` | 19.84 |
| `graveHole` | `0x04060b` | 2.33 |
| `graveRim` | `0x93a7bd` | 64.45 |
| `graveGlow` | `0xd8a941` | 67.25 |
| `mob` | `0x59c964` | 66.63 |
| `mobDark` | `0x1d4a26` | 24.25 |
| `banshee` | `0x98b2a7` | 67.32 |
| `bansheeDark` | `0x3f7a68` | 42.41 |
| `undertaker` | `0x5d6b80` | 41.39 |
| `undertakerDark` | `0x232b38` | 16.56 |
| `fireCore` | `0xffece6` | 93.96 |
| `fireTrash` | `0xff4a3d` | 43.74 |
| `fireTear` | `0xff6a55` | 53.40 |
| `fireClod` | `0xf5563d` | 46.27 |
| `fireSpiral` | `0xff8248` | 59.76 |
| `fireOutline` | `0x1a0906` | 4.86 |
| `skull` | `0x8496a6` | 57.78 |
| `stone` | `0x9aa4ad` | 63.73 |
| `wisp` | `0x63b8ad` | 64.76 |
| `bellRing` | `0x9faebd` | 67.41 |
| `corpse` | `0xa29e92` | 61.95 |
| `feast` | `0xb0ac9e` | 67.39 |
| `drop` | `0xd8a941` | 67.25 |
| `dropCore` | `0x141a26` | 10.04 |
| `belchEruption` | `0xb5ac8e` | 67.35 |
| `splash` | `0x7f9184` | 54.99 |
| `hudInk` | `0xa8acb0` | 67.23 |
| `hudDim` | `0x76839a` | 50.94 |

`MENU`:

| name | hex | luma |
| --- | --- | --- |
| `menuInk` | `0xe8edf2` | 92.67 |
| `menuDim` | `0x76839a` | 50.94 |

There is no `hitDim` colour. The dim tints toward `night`, which is already declared, and its depth and its refractory interval are tuning numbers that land with the grave in dispatch 3.

`MOB_FIRE`: `trash` is `fireCore` / `fireTrash` / `fireOutline`, `tear` is `fireCore` / `fireTear` / `fireOutline`, `clod` is `fireCore` / `fireClod` / `fireOutline`, `spiral` is `fireCore` / `fireSpiral` / `fireOutline`. One shared core and one shared outline is deliberate: the core carries the value guarantee and the body carries the hue, and solving each body's own hue for a near-white produced the same colour four times (research 7.1).

There is no `hitFlash`. It was the identical hex to trash fire and is retired, not re-valued: the hit announces by dimming the field with mob fire spared, which is the `hitDim` layer below. Do not add a colour for it.

`hudDim` and `menuDim` are the same hex on purpose. One is bound by the ceiling and one is not, and they will move apart when the art pass touches the menus.

### `src/app/layout.ts`, the fixed field fitted into any viewport

The only place in the app that knows about the **viewport**. Nothing in `src/game` may ever import it.

It does not know about device pixels and must never ask for `devicePixelRatio`. The renderer already handles that through `resolution`, and `GameScreen.resize` receives logical stage units, so reaching for the ratio here double-scales everything.

```ts
export const FIELD_WIDTH = 540;
export const FIELD_HEIGHT = 760;

export interface FieldPlacement {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

/** Fits the whole field inside the viewport, centred, preserving its aspect (ADRs 0003 and 0009). */
export function fitField(viewportWidth: number, viewportHeight: number): FieldPlacement;

/** A viewport point back in field units. The inverse of the placement, and how touch input reaches the sim. */
export function screenToField(placement: FieldPlacement, screenX: number, screenY: number): { x: number; y: number };
```

`scale` is `min(viewportWidth / FIELD_WIDTH, viewportHeight / FIELD_HEIGHT)`, so the whole field always fits and nothing is ever cropped. The offsets centre it. A viewport that is zero, negative or not finite still has to produce a finite positive scale and finite offsets, because a browser reports one during boot and during an orientation change, and a `NaN` scale poisons every coordinate downstream.

`screenToField` is the exact inverse and it does **not** clamp. A touch outside the fitted field returns a point outside the field's bounds, and deciding what to do with that belongs to the input models in dispatch 3.

It exists rather than `container.toLocal()` because of the boundary: `src/input` may not import `src/app`, so a pointer handler in `src/app/screens/game/` converts `event.global` through `screenToField` and hands `src/input/touch.ts` a point already in field units. That is what this function is for, and it is why it is built one dispatch before its caller.

The placement is applied as **one container transform**, never by multiplying coordinates at call sites. That is what makes ADR 0003's "no number in the sim is ever a device pixel" true by construction rather than by discipline.

### `src/app/screens/game/layering.ts`, the fixed draw stack

Container order only. The value band is `palette.ts`'s job and this file does not touch colour.

```ts
export const LAYER_ORDER = [
  "ground", "graveMouth", "belchEruption", "bellRing", "storm",
  "corpses", "mobBodies", "treasure", "hitDim", "graveRim", "mobFire",
] as const;   // bottom to top
export type LayerName = (typeof LAYER_ORDER)[number];

/** The field's draw stack as named empty containers, in ADR 0014's fixed order. */
export class FieldLayers {
  public readonly root: Container;              // add this to the screen
  public layer(name: LayerName): Container;     // the only way to reach a layer
}
```

`LAYER_ORDER` reversed is exactly ADR 0014's stack as the ADR states it top to bottom, with one addition: `hitDim` sits beneath both `mobFire` and `graveRim`, so a hit dims the field while mob fire and the grave's rim both survive it. The rim is spared because ADR 0014 makes it the health bar and requires a hit to announce on a channel that is not the shrink; dimming it would occlude the announcing channel at the tick it changes. That addition is in the ADR as of the 2026-08-20 amendment and it is not yours to move.

**Composition, not inheritance.** If `FieldLayers` extended `Container`, a later renderer could call `addChild` on it and land above `mobFire`, which is exactly what ADR 0014 forbids, and no test on a fresh instance would ever see it. Hold the root privately and hand out layers by name.

### The edits to existing files

- `src/main.ts`: the engine background comes from `PALETTE.night`, and `resizeOptions.minWidth` and `minHeight` come from `FIELD_WIDTH` and `FIELD_HEIGHT`. They are the same numbers written twice today, and nothing notices if one moves.
- `src/app/screens/game/GameScreen.ts`: replace the local `INK` and `DIM` with `PALETTE.hudInk` and `PALETTE.hudDim`; hold a field container carrying a `FieldLayers`; apply `fitField` to that container in `resize()`; draw the field's frame as a `fieldFrame` outline into the `ground` layer. That frame is not scaffolding and it is not temporary: the engine background and the field's ground are both `night`, so the frame is the only visible edge of the playfield, and that edge is the grave's movement bound. Describe it as the boundary readout it is.

  The two placeholder readouts stay in **screen space**, positioned against the fitted field's rectangle rather than scaled with it, so text stays legible on a phone where the field scales down. They still sit inside the ceiling, because they draw over play. Left unstated this gets settled by accident here and inherited by `GameHud.ts`.

  If screen shake is ever added, it goes on a **child** of the field container, never on the field container itself: `screenToField` recomputes the placement in parallel with the container's transform, and they agree only while the field container's own transform is the placement. Shake applied there breaks touch input silently while every unit test stays green. Leave `update()` and its JSDoc about the fixed timestep exactly as they are; rewiring it is dispatch 3's job.
- `src/app/FpsMeter.ts`: its local `DIM` becomes `PALETTE.hudDim`. The meter draws over the field, so it is inside the ceiling, and at 50.94 it already passes.
- `src/app/screens/TitleScreen.ts`, `src/app/screens/EndScreen.ts`, `src/app/screens/PrototypesScreen.ts`: their local `INK` and `DIM` become `MENU.menuInk` and `MENU.menuDim`. The prototype list's two colours were slightly different from the other two screens' for no recorded reason; unifying them is intended.

**Not in this dispatch, and say so in your report rather than doing it:** `LoadScreen.ts`, `src/app/ui/*` and `src/app/popups/*` still carry the create-pixi template's pink chrome. That is the Halloween art pass, ticket #38. Leave it alone.

## 5. The planned test list

Pin every one of these as a named `test.todo` on a stub before you implement anything, per the playbook. Every test cites what it enforces in its name or a comment.

### `src/app/color.test.ts`

1. `luma` of `0xffffff` is 100 and of `0x000000` is 0 (research 0.1).
2. `luma` reproduces the research 5.1 measured table, to two decimals, for `0x0e1119` 6.64, `0xff4a3d` 43.74, `0x59c964` 66.63, `0xe9e4d2` 89.32 and `0xfff3c9` 95.11.
3. `apcaLc(0x000000, 0xffffff)` is 106.0 and `apcaLc(0xffffff, 0x000000)` is -107.9, to one decimal (apca-w3 constant set 0.0.98G-4g, research 3.3).
4. `apcaLc` reproduces research 3.3's measured table in **magnitude and sign**: `0xff4a3d` on `0x0e1119` is -41.8 and `0xffece6` on `0x0e1119` is -97.4, both light on dark.
5. `observerLuma` on a neutral grey equals `luma` under all three observers, which is why the band's thresholds carry across (research 7.4).
6. `observerLuma` reproduces research 5.3 for `0xff4a3d`: 55.2 normal and 43.6 protan, to one decimal.
7. `hsv` reproduces research 1.5's measurement of the retired `0x4a3b12`: hue 43.9, saturation 0.76, value 0.29.

### `src/app/palette.test.ts`

Every one of these cites ADR 0014 and the research assertion number it implements.

8. Every declared `luma` matches `luma(hex)` within 0.05, across `PALETTE` and `MENU` both (assertion 1: without it the declared numbers drift and every other assertion checks a fiction).
9. Every entry named as a core in `MOB_FIRE` has luma at or above `MOB_FIRE_BAND_MIN` (assertion 2).
10. Every `PALETTE` entry that is not a mob-fire core has luma at or below `FIELD_LUMA_CEILING` (assertion 3).
11. `MOB_FIRE_BAND_MIN - FIELD_LUMA_CEILING` is at least `BAND_MARGIN_MIN`, as its own test so shrinking the margin is a deliberate edit with a failing test attached (assertion 4).
12. All four emitters are present in `MOB_FIRE` and each names a core, a body and an outline (assertion 5: exclusivity alone is satisfied by an empty band).
13. Under both the protan and the deutan weights, the lowest core sits at least 20 above the highest non-core (assertion 6, restated as a separation per research 7.4).
14. No `PALETTE` entry outside mob fire shares a hex with any mob-fire colour (assertion 7: this is what would have caught `hitFlash` outright).
15. Every core clears APCA Lc 45 in magnitude against `night`, `nightSpeckle`, `fieldFrame` and `graveHole` (assertion 8).
16. For every emitter, core luma minus outline luma is at least 20 (assertion 9).
17. No non-fire `PALETTE` hue falls within 20 degrees of any mob-fire body hue (assertion 10; the floor is fitted, research 7.4 says why).
18. No `PALETTE` colour is brown: no hue in the range 20 up to 50 with saturation at or above 0.5 and value below 0.55. This closes the queued `dropCore` check from ticket #30 by measurement rather than by eye.
19. No two field **sprite** colours sit within 2.0 luma and 15 hue degrees and 0.25 saturation of each other, over an exceptions table where every exception carries a written reason. Three entries today, all three listed with their reasons in research 7.4: `graveRim` against `stone`, `graveGlow` against `drop`, and `feast` against `belchEruption`. The readouts, the ground and the frame are outside this check because they are not sprites the player tells apart mid-dodge.
20. The same check run over `corpse`'s whole fade range rather than its fresh value alone. Freshness animates that one colour from 61.95 down toward nothing, so it occupies a range and not a point, and any cream colour below 62 would collide with it at some instant of every corpse's life. Nothing is there today and this test is what keeps it that way (research 7.5).
21. `PALETTE` declares nothing named `hitFlash` (ADR 0014 amendment 2026-08-20: retired, not re-valued).
22. One source scan over `src/app/screens/game/`, `src/app/FpsMeter.ts` and `src/main.ts`, shaped like `src/boundary.test.ts`, asserting three things at once. No reference to `MENU`, which is what holds the menu exemption shut. No raw colour literal, because a module can write `0xffffff` directly and the first rule never sees it. And no `blendMode`, which is the only enforcement anywhere of ADR 0014's rule that mob fire draws at alpha 1.0 with no blend mode, the rule that eats the whole 20-point margin when it is broken.
23. Test 12's emitter list is pinned to today's four by literal, and the Undertaker's curtain arrives at dispatch 6 without reddening anything. Leave a `test.todo` naming that gap and its trigger, so the hole is dated rather than silent.

### `src/app/layout.test.ts`

22. `FIELD_WIDTH` is 540 and `FIELD_HEIGHT` is 760 (ADR 0003; the sim's unit space is not a tuning knob).
23. A 1440 by 900 desktop viewport presents the whole field: the fitted field fits inside the viewport on both axes, at the expected scale computed independently in the test.
24. A 390 by 844 phone viewport presents the whole field, likewise.
24b. `resize()` from `src/engine/resize/resize.ts` composed with `fitField`, at both viewports, presents the whole field. This is the one that matters and the two above are blind to it: `CreationResizePlugin` upscales a 390-wide window to a 540-wide stage before `GameScreen.resize` ever runs, so `fitField` never sees 390 by 844 in the running app. Test 24 asserts a placement the app never computes.
25. The field is centred: the margin left of it equals the margin right of it, and the same vertically, and neither is negative.
26. `screenToField` inverts the placement at the field's four corners and its centre, within a tight tolerance.
27. A viewport point outside the fitted field maps outside the field's bounds, proving the mapping does not silently clamp.
28. A degenerate viewport, zero by zero and negative and `NaN`, yields a **stated** fallback placement, pinned by value rather than by the property of being finite and positive. Pinning only the property lets the implementation pick the fallback and leaves the test unable to say whether the pick was right. This is not hypothetical: `src/engine/resize/resize.ts` itself produces `NaN` at a zero viewport, through `Math.floor(0 * Infinity)`.
29. At exactly 540 by 760 the placement is scale 1 with zero offsets.

### `src/app/screens/game/layering.test.ts`

30. `LAYER_ORDER` reversed equals ADR 0014's stack as the ADR states it, written out as a literal in the test with `hitDim` in its place, so the code and the record are checked against each other rather than against themselves.
31. `FieldLayers` holds one container per name and its children are in `LAYER_ORDER` order.
32. `layer(name)` returns the same container on repeated calls.
33. `mobFire` is the topmost child (ADR 0014).
34. `belchEruption` sits below `mobFire`, so no player effect can occlude mob fire (ADR 0014, which grounds it in ADR 0008).
35. `graveRim` sits above `corpses` and `treasure` while `graveMouth` sits below them, so the grave reads as the health bar under a pile while food still visibly falls in (ADR 0014).
36. `hitDim` sits below both `mobFire` and `graveRim`, so a hit dims the field while mob fire and the grave's rim both survive it (ADR 0014 amendment 2026-08-20).
37. `FieldLayers` does not extend `Container` and exposes no way to add a child outside a named layer.
38. `GameScreen`'s field container carries exactly the transform `fitField` returns, for a desktop and a phone viewport. `screenLifecycle.test.ts` already proves the screen is instantiable under vitest with `Label` and `Button` mocked, so this costs almost nothing and it is what makes the one-transform rule true by test rather than by intention.

## 6. How you work

- One vertical slice at a time: one test red, then the smallest implementation that makes it green, then the next. Never write the whole module and then the tests.
- Expected values come from the research doc, not from running your own code and pasting the output. A test that asserts what the implementation already does is worth nothing.
- Small functions, each doing the one thing its name says. No IIFEs. Around forty lines is where splitting becomes the default.
- Comments: a JSDoc block on the declaration for anything that needs prose, `//` for a one-liner. Do not copy the comment style of whatever file you happen to be in. Never write a comment explaining code that is not there.
- No em dashes anywhere, in code, comments or your report. Comma, colon, parentheses, or two sentences.
- Use the vocabulary in `CONTEXT.md`. "Enemy" is banned; a hostile is a mob and its shots are mob fire.
- Never weaken, skip or rewrite a test to reach green. If you think a test is wrong, that means the plan is wrong, and replanning is not yours: stop and report.
- Three strikes on the same wrong observed behaviour, then stop and report what you tried, what you saw, and your best guess. No fourth attempt.
- Do not commit anything. Leave the work in the tree.

End your report with each verification step from section 2 and its result, and name step 4 as deliberately not run and step 5 as still open on Mark.
