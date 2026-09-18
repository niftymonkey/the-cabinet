/**
 * The field's fixed draw stack (ADR 0014). Container order only: the value band
 * is palette.ts's job and nothing here touches colour.
 */

import { Container, Graphics } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';

import { resize } from '../../engine/resize/resize';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../game/field';
import type { FaultRecord } from '../../game/execution';
import type { FaultIdentity } from '../../game/faults';
import { FAULT_IDENTITIES, FAULT_SEVERITY } from '../../game/faults';
import { MAX_LEVEL } from '../../game/lines/roster';
import { SEED_LIMIT } from '../../game/run';
import { METER_FONT_SIZE, meterLinePosition } from '../cornerReadout';
import type { FieldPlacement, HudRow } from '../layout';
import {
  DEGENERATE_PLACEMENT,
  fitField,
  hudRow,
  READOUT_RESERVE,
} from '../layout';
import { BELCH_SIZE } from '../screens/game/BelchButton';
import type { LayerName } from '../screens/game/layering';
import { FieldLayers, LAYER_ORDER } from '../screens/game/layering';

/** The real widgets need a renderer: text metrics and a loaded texture. */
vi.mock('../ui/Label', () => ({
  Label: class extends Container {
    public text = '';
    public anchor = { set: () => {} };
  },
}));

vi.mock('../ui/Button', () => ({
  Button: class extends Container {
    public onPress = { connect: (handler: () => void) => void handler };
  },
}));

import { GameScreen } from '../screens/game/GameScreen';
import {
  FAULT_LINE_MAX_CHARS,
  faultReadout,
  levelsReadout,
} from '../screens/game/RunHud';

/**
 * A game screen holding faked powers, the way navigation hands them in. None
 * of them fire here: this file only measures where things are drawn.
 */
function gameScreen(): GameScreen {
  const screen = new GameScreen();
  screen.init({
    openMenu: () => Promise.resolve(),
    closeMenu: () => Promise.resolve(),
    menuShowing: () => false,
    showEnd: () => Promise.resolve(),
    playSound: () => {},
    playMusic: () => {},
    standInArt: () => null,
    playButtonSound: () => {},
    canvas: null,
    renderer: { name: 'webgl', resolution: 2 },
  });
  return screen;
}

// The screen reads its persisted keyboard speed on construction, and an
// unstubbed localStorage warns once through the storage guard.
Object.defineProperty(globalThis, 'localStorage', {
  value: { getItem: () => null, setItem: () => {} },
  configurable: true,
});

/**
 * The field's draw stack, top to bottom, with the hit's dim and the boundary in
 * their places. ADR 0014 delegates the full order to this pin, so this literal
 * is the canonical order rather than a mirror of the ADR's list, and the code
 * is checked against it rather than against itself.
 */
const ADR_0014_STACK: LayerName[] = [
  'mobFire',
  'fieldBoundary',
  'graveRim',
  'hitDim',
  'treasure',
  'mobBodies',
  'corpses',
  'storm',
  'bellRing',
  'belchEruption',
  'graveMouth',
  'ground',
];

/** How far up the stack a layer draws. Higher wins where two overlap. */
function height(name: LayerName): number {
  return LAYER_ORDER.indexOf(name);
}

describe('LAYER_ORDER (ADR 0014)', () => {
  it("reversed is the ADR's stack as the ADR states it, top to bottom", () => {
    expect([...LAYER_ORDER].reverse()).toEqual(ADR_0014_STACK);
  });

  it('puts mobFire topmost', () => {
    expect(LAYER_ORDER[LAYER_ORDER.length - 1]).toBe('mobFire');
  });

  it("puts the belch's eruption below mob fire, so no player effect occludes it", () => {
    // ADR 0008 resumes the boss pattern immediately and grants no
    // invulnerability, so the eruption may never hide the fire still coming.
    expect(height('belchEruption')).toBeLessThan(height('mobFire'));
  });

  it("puts the grave's rim above the food and its mouth below", () => {
    // The rim is the health bar, so it reads under a pile; the mouth stays
    // beneath the food so a swallow is visibly a fall into it.
    expect(height('graveRim')).toBeGreaterThan(height('corpses'));
    expect(height('graveRim')).toBeGreaterThan(height('treasure'));
    expect(height('graveMouth')).toBeLessThan(height('corpses'));
    expect(height('graveMouth')).toBeLessThan(height('treasure'));
  });

  it('puts hitDim below both mobFire and graveRim', () => {
    // A hit dims the field and both mob fire and the rim survive it: the rim
    // is the announcing channel at the tick it changes (amendment 2026-08-20).
    expect(height('hitDim')).toBeLessThan(height('mobFire'));
    expect(height('hitDim')).toBeLessThan(height('graveRim'));
  });
});

/**
 * The stack container, reached the one way a caller can reach it. Nothing
 * exposes the root, so a test that wants to see the draw order has to attach
 * the stack exactly as GameScreen does.
 */
function attachedStack(layers: FieldLayers): Container {
  const parent = new Container();
  layers.addTo(parent);
  // addTo adds exactly one child and the parent was made two lines above.
  return parent.children[0]!;
}

describe('FieldLayers', () => {
  it('holds one container per name, in LAYER_ORDER order', () => {
    const layers = new FieldLayers();
    const stack = attachedStack(layers);
    expect(stack.children).toHaveLength(LAYER_ORDER.length);
    LAYER_ORDER.forEach((name, index) => {
      expect(stack.children[index]).toBe(layers.layer(name));
    });
  });

  it('returns the same container for a name on every call', () => {
    const layers = new FieldLayers();
    expect(layers.layer('mobFire')).toBe(layers.layer('mobFire'));
  });

  it('exposes no container a caller could add a child to outside a named layer', () => {
    // Extending Container would let a later renderer addChild straight onto the
    // stack, landing above mobFire, and no test on a fresh instance would see
    // it. Composition is what makes that unreachable.
    const layers = new FieldLayers();
    expect(layers).not.toBeInstanceOf(Container);
    expect('addChild' in layers).toBe(false);
    expect('root' in layers).toBe(false);
  });

  it('empties every layer on clear and leaves the stack standing', () => {
    const layers = new FieldLayers();
    const stack = attachedStack(layers);
    for (const name of LAYER_ORDER) {
      layers.layer(name).addChild(new Container());
    }

    layers.clear();

    expect(stack.children).toHaveLength(LAYER_ORDER.length);
    for (const name of LAYER_ORDER) {
      expect(layers.layer(name).children).toHaveLength(0);
      expect(stack.children).toContain(layers.layer(name));
    }
  });
});

describe("the game screen's field container", () => {
  it('carries exactly the transform fitField returns, on a desktop and a phone viewport', () => {
    // The placement is applied as one container transform and never by
    // multiplying coordinates at call sites, which is what makes ADR 0003's
    // "no number in the sim is ever a device pixel" true by construction.
    const viewports: readonly (readonly [number, number])[] = [
      [1440, 900],
      [390, 844],
    ];
    for (const [width, height] of viewports) {
      const screen = gameScreen();
      screen.resize(width, height);

      const placement = fitField(width, height);
      const field: Container = screen['field'];
      expect(field.position.x).toBe(placement.offsetX);
      expect(field.position.y).toBe(placement.offsetY);
      expect(field.scale.x).toBe(placement.scale);
      expect(field.scale.y).toBe(placement.scale);
      expect(screen['placement']).toEqual(placement);
    }
  });

  it('holds the placement it applied, so a pointer handler need not recompute it', () => {
    // screenToField inverts this exact value. A handler calling fitField again
    // at event time computes the placement a second time, and the two agree
    // only until something moves one of them.
    const screen = gameScreen();
    expect(screen['placement']).toEqual(DEGENERATE_PLACEMENT);

    screen.resize(1440, 900);
    const field: Container = screen['field'];
    const held: FieldPlacement = screen['placement'];
    expect(field.position.x).toBe(held.offsetX);
    expect(field.scale.x).toBe(held.scale);
  });
});

describe('the game screen across a pooled reuse', () => {
  it("empties the field on reset and puts the field's own furniture back", () => {
    // Screens are pooled, so a second run on this instance must not open with
    // the first run's sprites still on the field. What dressField() puts back
    // is the boundary readout and the pooled entity sprites, every one of them
    // invisible until a live entity claims it; anything else is a leak.
    const screen = gameScreen();
    const layers: FieldLayers = screen['layers'];
    const frame = screen['frame'];
    const stray = new Container();
    layers.layer('corpses').addChild(stray);
    layers.layer('mobFire').addChild(new Container());

    screen.reset();

    for (const name of ['corpses', 'mobFire', 'mobBodies'] as const) {
      const children = layers.layer(name).children;
      expect(children).not.toContain(stray);
      expect(children.every((child) => !child.visible)).toBe(true);
      expect(children.every((child) => child instanceof Graphics)).toBe(true);
    }
    expect(layers.layer('fieldBoundary').children).toEqual([frame]);
  });

  it('keeps the same boundary readout instance across repeated resets', () => {
    // Rebuilding it per run would allocate a Graphics on every reuse.
    const screen = gameScreen();
    const frame = screen['frame'];
    screen.reset();
    screen.reset();
    expect(screen['frame']).toBe(frame);
    const layers: FieldLayers = screen['layers'];
    expect(layers.layer('fieldBoundary').children).toEqual([frame]);
  });

  it('draws the boundary above every body and food layer and still beneath mob fire', () => {
    // Both halves are the point. Above the bodies is the change: the boundary
    // used to sit on ground, so a mob crossing an edge drew over the line that
    // says where the world ends. Beneath mob fire is the rule that constrains
    // how far up it could go, and ADR 0014 lets nothing occlude fire.
    for (const under of [
      'corpses',
      'mobBodies',
      'treasure',
      'graveRim',
    ] as const) {
      expect(height(under)).toBeLessThan(height('fieldBoundary'));
    }
    expect(height('fieldBoundary')).toBeLessThan(height('mobFire'));
  });
});

/**
 * The three regimes the frame is specified against, and not three named devices
 * (record R10). A tall shape gives bands and no gutter, a wide shape gives
 * gutters and no band, and between them, at a viewport aspect near the field's
 * own 0.711, both collapse and every control ends up over the field. The tablet
 * is here as a test viewport only: nobody plays this on a tablet and it is the
 * cheapest shape that exercises the squeeze deterministically.
 */
const REGIMES = [
  { name: 'tall', width: 393, height: 660 },
  { name: 'wide', width: 1440, height: 900 },
  { name: "the field's own aspect", width: 820, height: 1180 },
] as const;

/** The stage GameScreen.resize is handed, which is never the window's own numbers. */
function stageOf(viewport: { width: number; height: number }) {
  return resize(
    viewport.width,
    viewport.height,
    FIELD_WIDTH,
    FIELD_HEIGHT,
    false,
  );
}

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/** A child placed by its centre, as GameScreen positions every control. */
function centredOn(
  at: { x: number; y: number },
  width: number,
  height: number,
): Box {
  return {
    left: at.x - width / 2,
    top: at.y - height / 2,
    right: at.x + width / 2,
    bottom: at.y + height / 2,
  };
}

/** The two top corners the reserve claims, exactly as layout.ts builds them. */
function reservedCorners(stageWidth: number): { name: string; box: Box }[] {
  const corner = (left: number): Box => ({
    left,
    top: 0,
    right: left + READOUT_RESERVE.width,
    bottom: READOUT_RESERVE.height,
  });
  return [
    { name: 'readout stack', box: corner(0) },
    { name: 'pause button', box: corner(stageWidth - READOUT_RESERVE.width) },
  ];
}

/** Half-open on both axes, the convention layout.ts's own intersects uses. */
function crosses(a: Box, b: Box): boolean {
  return (
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
  );
}

/** Which of a named list of boxes the row runs into, in one readable string. */
function crossedBy(row: HudRow, boxes: { name: string; box: Box }[]): string {
  const rowBox: Box = {
    left: row.left,
    top: row.top,
    right: row.left + row.width,
    bottom: row.top + row.height,
  };
  const hit = boxes.filter((each) => crosses(rowBox, each.box));
  return hit.map((each) => each.name).join(',');
}

describe("the frame's three regimes (record R10)", () => {
  it('places every control and readout deliberately at each regime', () => {
    // Every position here is derived from the reserve GameScreen positions it
    // from, so the assertion is that the screen and the reserve have not
    // drifted apart rather than that a number is still a number.
    for (const regime of REGIMES) {
      const stage = stageOf(regime);
      const screen = gameScreen();
      screen.resize(stage.width, stage.height);

      const placement = fitField(stage.width, stage.height);
      const field: Container = screen['field'];
      expect(`${regime.name} ${field.position.y} ${field.scale.x}`).toBe(
        `${regime.name} ${placement.offsetY} ${placement.scale}`,
      );

      // The button holds the reserve's own corner except at the squeeze, where
      // the row reaches that corner and the button drops clear below it.
      const row = hudRow(placement);
      const squeezed = crossedBy(row, [
        {
          name: 'pause corner',
          box: {
            left: stage.width - READOUT_RESERVE.margin - 132,
            top: READOUT_RESERVE.margin,
            right: stage.width - READOUT_RESERVE.margin,
            bottom: READOUT_RESERVE.margin + 68,
          },
        },
      ]);
      const pause = centredOn(screen['pauseButton'].position, 132, 68);
      const expectedTop =
        squeezed === ''
          ? READOUT_RESERVE.margin
          : row.top + row.height + READOUT_RESERVE.margin;
      expect(`${regime.name} ${pause.right} ${pause.top}`).toBe(
        `${regime.name} ${stage.width - READOUT_RESERVE.margin} ${expectedTop}`,
      );

      const belch = centredOn(
        screen['belchButton'].position,
        BELCH_SIZE,
        BELCH_SIZE,
      );
      expect(`${regime.name} ${belch.left} ${belch.bottom}`).toBe(
        `${regime.name} ${READOUT_RESERVE.margin} ${stage.height - READOUT_RESERVE.margin}`,
      );
    }
  });

  it("puts the HUD's row at the field's top edge at every regime, never clipped", () => {
    // Outside the field where the stage's band above it is at least the row's
    // own height, and over the field's own top edge where it is not. One rule,
    // no viewport breakpoint (record R1).
    for (const regime of REGIMES) {
      const stage = stageOf(regime);
      const placement = fitField(stage.width, stage.height);
      const row = hudRow(placement);
      const fieldTop = placement.offsetY;
      const outside = fieldTop >= row.height;

      expect(`${regime.name} ${row.top}`).toBe(
        `${regime.name} ${outside ? fieldTop - row.height : fieldTop}`,
      );
      expect(`${regime.name} clipped ${row.top >= 0}`).toBe(
        `${regime.name} clipped true`,
      );
      expect(
        `${regime.name} clipped ${row.top + row.height <= stage.height}`,
      ).toBe(`${regime.name} clipped true`);
      expect(`${regime.name} ${row.left} ${row.width}`).toBe(
        `${regime.name} ${placement.offsetX} ${FIELD_WIDTH * placement.scale}`,
      );
    }
  });

  it("keeps the ladder HUD's row outside the field's own stack", () => {
    // ADR 0014 fixes what draws inside the field and lets nothing above
    // mobFire. The row is a readout drawn on top of the field, which the ADR's
    // own sentence contemplates, rather than a thirteenth layer or an exception
    // to the list: a child of the field would inherit the field's clip and
    // vanish at every viewport where the row sits outside it (record R1).
    const screen = gameScreen();
    const row = screen['ladder'].view;
    const field: Container = screen['field'];

    expect(row.parent).toBe(screen);
    expect(field.children).not.toContain(row);
    expect(screen.children.indexOf(row)).toBeGreaterThan(
      screen.children.indexOf(field),
    );
  });

  it('records which top corner the row runs into at each regime, and which it clears', () => {
    // The corners the row has to live beside are the readout stack's on the
    // left and the pause button's on the right, both 120 stage units deep. The
    // wide regime clears both, because its side gutter holds the whole reserve.
    // The other two cannot: the row keeps the field's own width, because the
    // band's content is 520 field units inside the field's 540 (record R1), and
    // a 540-unit phone stage whose reserve claims 260 units at each end leaves
    // 20 units between them. R12 already rules the crossing: the dev corner
    // stack and the HUD's band overlap on a shortened window, it is a
    // dev-build-only collision, and it is named so nobody reports it as a bug.
    // A reserved corner is deeper than what stands in it, so crossing one is
    // not yet crossing a widget; the pause button's own rectangle is the test
    // below.
    const crossed = REGIMES.map((regime) => {
      const stage = stageOf(regime);
      const row = hudRow(fitField(stage.width, stage.height));
      return `${regime.name}: ${crossedBy(row, reservedCorners(stage.width))}`;
    });
    expect(crossed).toEqual([
      'tall: readout stack,pause button',
      'wide: ',
      "the field's own aspect: readout stack,pause button",
    ]);
  });

  it("clears the pause button's own rectangle at every regime, the squeeze included", () => {
    // The dev stack comes out before v1 (#66) and the pause button does not, so
    // the button's own footprint is the crossing that reaches a player. At the
    // tall regime the band holds the row above the button and at the wide one
    // the side gutter holds the button clear of the field's width. At a
    // viewport near the field's own aspect both collapse, and there the button
    // drops below the row rather than the row narrowing: R1's content is 520
    // field units inside the field's 540, so a row that cleared both reserved
    // corners would be 20 units wide. Slice M2 pinned that crossing; this is
    // the clearance that replaced it.
    const crossed = REGIMES.map((regime) => {
      const stage = stageOf(regime);
      const row = hudRow(fitField(stage.width, stage.height));
      const screen = gameScreen();
      screen.resize(stage.width, stage.height);
      const pause = {
        name: 'pause button',
        box: centredOn(screen['pauseButton'].position, 132, 68),
      };
      return `${regime.name}: ${crossedBy(row, [pause])}`;
    });
    expect(crossed).toEqual(['tall: ', 'wide: ', "the field's own aspect: "]);
  });

  it('drops the pause button below the row at the squeeze and moves it nowhere else', () => {
    // The two halves of the same rule, said as positions rather than as an
    // absence of overlap: a button that had vanished would clear the row too.
    // The button stays in the reserve's corner at both regimes that hold it,
    // the tall one because the band carries the row above it and the wide one
    // because the side gutter carries the button clear of the field's width,
    // and only the squeeze puts it below the row's own bottom edge.
    const tops = REGIMES.map((regime) => {
      const stage = stageOf(regime);
      const screen = gameScreen();
      screen.resize(stage.width, stage.height);
      const row = hudRow(fitField(stage.width, stage.height));
      const pause = centredOn(screen['pauseButton'].position, 132, 68);
      const below = pause.top >= row.top + row.height;
      return `${regime.name}: top ${pause.top} below the row ${below}`;
    });
    expect(tops).toEqual([
      'tall: top 12 below the row false',
      'wide: top 12 below the row false',
      "the field's own aspect: top 67.48148148148145 below the row true",
    ]);
  });
});

/**
 * How many stack lines the reserve's height covers: FPS, DEBT, TICK, SEED and
 * SIZE. The levels and fault lines below them deliberately sit past the
 * reserve and draw over the field, the meter's own allowance under ADR 0014,
 * so the height rule stops here and the two of them carry the width rule on
 * their own.
 */
const RESERVED_LINES = 5;

/**
 * The widest string the reserve-height lines can show: a pinned seed at the
 * top of the roll's range, with the word every pinned line carries.
 */
const WIDEST_RESERVED_LINE = `SEED ${SEED_LIMIT - 1} PINNED`;

/**
 * The widest levels line the pin can render: levels are single digits capped
 * at MAX_LEVEL, and the four-figure form only appears when the lines differ,
 * so any differing four digits give the widest case.
 */
const WIDEST_LEVELS_LINE = `LEVELS ${levelsReadout({
  skullStream: MAX_LEVEL,
  territory: MAX_LEVEL,
  wisps: MAX_LEVEL,
  bell: 0,
})} PINNED`;

/** A record as the authority keeps them, for driving the readout over the closed list. */
function faultRecord(identity: FaultIdentity): FaultRecord {
  return {
    identity,
    severity: FAULT_SEVERITY[identity],
    firstTick: 1,
    detail: '',
    count: 1,
  };
}

/**
 * An upper bound on a monospace advance, as a share of the font size. Common
 * monospace faces sit between 0.5 and 0.6 em, and DejaVu Sans Mono, Menlo and
 * Consolas are all at or under 0.602, so 0.62 is a bound rather than a
 * measurement.
 *
 * It is arithmetic and not a measurement because pixi cannot measure text
 * without a document, and this test environment has none. The rendered check in
 * the dispatch's verification steps is where the real read happens; this is the
 * instrument that survives a longer readout being added.
 */
const MONOSPACE_ADVANCE_MAX = 0.62;

/** Where a stack line's right edge lands, by the advance bound above. */
function lineRight(line: string): number {
  return (
    meterLinePosition(0).x +
    line.length * METER_FONT_SIZE * MONOSPACE_ADVANCE_MAX
  );
}

describe('the readouts stay inside the reserve the field is fitted around', () => {
  it("fits the reserve-height lines' widest and the pause button inside it", () => {
    expect(lineRight(WIDEST_RESERVED_LINE)).toBeLessThanOrEqual(
      READOUT_RESERVE.width,
    );

    const stackBottom =
      meterLinePosition(RESERVED_LINES - 1).y + METER_FONT_SIZE * 1.5;
    expect(stackBottom).toBeLessThanOrEqual(READOUT_RESERVE.height);

    const screen = gameScreen();
    screen.resize(1440, 900);
    const button = screen['pauseButton'];
    const halfWidth = 132 / 2;
    expect(1440 - (button.position.x + halfWidth)).toBeGreaterThanOrEqual(
      READOUT_RESERVE.margin,
    );
    expect(1440 - (button.position.x - halfWidth)).toBeLessThanOrEqual(
      READOUT_RESERVE.width,
    );
    expect(button.position.y + 68 / 2).toBeLessThanOrEqual(
      READOUT_RESERVE.height,
    );
  });

  it("puts the belch's control in the bottom-left corner, inset by the same margin", () => {
    // Mark ruled the corner on 2026-09-15, so the steering thumb and the belch
    // no longer share one. It is positioned from the reserve the pause button
    // is positioned from, which is what keeps the non-overlap rule in one
    // place, and the reserve claims the two top corners only, so the field's
    // own fit is untouched by the move.
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
    ] as const) {
      const screen = gameScreen();
      screen.resize(width, height);
      const button = screen['belchButton'];
      expect(`${width}: ${button.position.x - BELCH_SIZE / 2}`).toBe(
        `${width}: ${READOUT_RESERVE.margin}`,
      );
      expect(`${width}: ${height - (button.position.y + BELCH_SIZE / 2)}`).toBe(
        `${width}: ${READOUT_RESERVE.margin}`,
      );
    }
  });

  it("keeps the levels and fault lines, past the reserve's height, inside its width", () => {
    // The two lines below the reserve draw over the field, so its height does
    // not bind them. Its width still does: a wider line runs most of a
    // 390-unit phone stage, and the fault line exists under ADR 0017's ruling
    // that it stays minimal, never a banner across the field. The bank was a
    // third of these until the ladder HUD took it (record R11).
    expect(lineRight(WIDEST_LEVELS_LINE)).toBeLessThanOrEqual(
      READOUT_RESERVE.width,
    );
    expect(lineRight('x'.repeat(FAULT_LINE_MAX_CHARS))).toBeLessThanOrEqual(
      READOUT_RESERVE.width,
    );
  });

  it('caps the fault line for every identity in the closed list, each form still unambiguous', () => {
    // The identities are closed and append-only (ADR 0017), so the longest is
    // known: FAULT section tick resets at a boundary runs 37 characters uncut,
    // nearly the full width of a 390-unit phone stage. A cut form must stay
    // tellable from every other member, or the readout names the wrong fault.
    const lines = FAULT_IDENTITIES.map((identity) =>
      faultReadout([faultRecord(identity)]),
    );
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(FAULT_LINE_MAX_CHARS);
      expect(line.startsWith('FAULT ')).toBe(true);
    }
    expect(new Set(lines).size).toBe(FAULT_IDENTITIES.length);

    // An identity that fits the budget shows whole, and several faults stay
    // the count they already were.
    expect(faultReadout([faultRecord('freshness in range')])).toBe(
      'FAULT freshness in range',
    );
    expect(
      faultReadout([faultRecord('no NaN'), faultRecord('entity ids')]),
    ).toBe('FAULTS 2');
  });
});
