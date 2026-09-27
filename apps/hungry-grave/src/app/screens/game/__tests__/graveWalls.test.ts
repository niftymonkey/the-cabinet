/**
 * The cut earth and the dark under it, ported line for line from the
 * prototype's paintPit (build 7, slice 6 of #148).
 */

import { describe, expect, it } from 'vitest';

import { SCENE_CAMERA, stanceOverGrave } from '../camera';
import type { GraveCanvas } from '../graveCanvas';
import { GRAVE_DARK } from '../graveDrawingValues';
import { mouthPolygon } from '../graveMouth';
import type { GraveView, Spot } from '../graveProjection';
import type { WallFace } from '../graveWalls';
import { facePoint, paintPit, wallFaces } from '../graveWalls';

/**
 * Build 7's own camera over the hole, 4.95 half-lengths up and 1.07 behind, with
 * R4's dark: the view these promises were written against, handed in now that
 * the painters take the view they are cut with (tilted view T4).
 */
const BUILD_7_VIEW: GraveView = {
  cameraHeight: 4.95,
  nadirX: 0,
  nadirY: 1.07,
  darkDepth: 2.4,
  darkFalloff: 2.6,
};

/** The sizes the walls are judged at: the floor, the start, the prototype's top and the ceiling. */
const SIZES = [18, 27, 48, 67.5];

// The phone's view: 390 CSS pixels over the field's 540 units.
const PHONE_VIEW = 390 / 540;

interface Recording {
  readonly canvas: GraveCanvas;
  readonly log: string[];
}

/** What a style reads as in the log: its string, or which gradient it is. */
const styleName = (style: unknown): string =>
  typeof style === 'string' ? style : 'gradient';

/**
 * A canvas that paints nothing and writes down every call, with the style in
 * force at each fill and stroke, so a painter's order and colours can be read
 * back.
 */
const recordingCanvas = (): Recording => {
  const log: string[] = [];
  const note =
    (call: string) =>
    (...args: unknown[]): void => {
      log.push(`${call}(${args.map(String).join(',')})`);
    };
  let gradients = 0;
  const canvas: GraveCanvas = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    beginPath: note('beginPath'),
    closePath: note('closePath'),
    moveTo: note('moveTo'),
    lineTo: note('lineTo'),
    quadraticCurveTo: note('quadraticCurveTo'),
    ellipse: note('ellipse'),
    fillRect: (...args: number[]) =>
      log.push(`fillRect ${styleName(canvas.fillStyle)} ${args.join(',')}`),
    fill: () => log.push(`fill ${styleName(canvas.fillStyle)}`),
    stroke: () =>
      log.push(
        `stroke ${styleName(canvas.strokeStyle)} ${String(canvas.lineWidth)}`,
      ),
    clip: note('clip'),
    save: note('save'),
    restore: note('restore'),
    setTransform: note('setTransform'),
    createLinearGradient: (...args: number[]) => {
      const id = gradients++;
      log.push(`gradient ${id} ${args.join(',')}`);
      return {
        addColorStop: (offset: number, color: string) => {
          log.push(`stop ${id} ${offset} ${color}`);
        },
      };
    },
  };
  return { canvas, log };
};

/** The first line of the log that starts with this, or -1. */
const firstAt = (log: string[], start: string): number =>
  log.findIndex((line) => line.startsWith(start));

/** The hole's view over a grave standing here at this size: the scene camera's stance and R4's dark. */
const viewOver = (x: number, y: number, size: number): GraveView => ({
  ...stanceOverGrave(SCENE_CAMERA, { x, y, size }),
  ...GRAVE_DARK,
});

/** One of the faces cut from a view, by name. */
const faceNamed = (
  size: number,
  view: GraveView,
  id: WallFace['id'],
): WallFace => {
  const face = wallFaces(size, view).find((each) => each.id === id);
  if (face === undefined) throw new Error(`no ${id} face`);
  return face;
};

/**
 * How far a side face reaches into the opening from its lip down to the dark,
 * at the middle of its length, in field units: positive where it shows.
 */
const inwardOf = (
  size: number,
  view: GraveView,
  id: 'left' | 'right',
): number => {
  const face = faceNamed(size, view, id);
  const reach =
    facePoint(face, size, 0.5, 1).x - facePoint(face, size, 0.5, 0).x;
  return id === 'left' ? reach : -reach;
};

const distance = (a: Spot, b: Spot): number => Math.hypot(a.x - b.x, a.y - b.y);

describe('the walls of the hole (design record R4, slice 6)', () => {
  it('the left and right walls are equally wide at every size', () => {
    // Mark saw them unequal on slice 3's grave. The projection makes the two
    // side faces mirror images, so the drawn width from the lip to the dark is
    // the same on both sides at every size.
    for (const size of SIZES) {
      const widths = wallFaces(size, BUILD_7_VIEW)
        .filter((face) => face.id !== 'far')
        .map((face) =>
          Math.abs(
            facePoint(face, size, 0.5, 0).x - facePoint(face, size, 0.5, 1).x,
          ),
        );
      const [right, left] = widths;
      expect(`${size} ${widths.length}`).toBe(`${size} 2`);
      expect(`${size} ${(right ?? 0) > 0}`).toBe(`${size} true`);
      expect(Math.abs((right ?? 0) - (left ?? -1))).toBeLessThan(1e-9);
    }
  });

  it('the pit is laid black first, then the far, the right and the left faces, then the corner edges', () => {
    // The prototype's paintPit, in its own order: the black over the whole
    // opening, each face painted over it (each face's wash marks where it is),
    // and the two edges where the far face meets a side face last.
    const { canvas, log } = recordingCanvas();
    paintPit(canvas, mouthPolygon(27), 27, PHONE_VIEW, BUILD_7_VIEW);
    const order = [
      firstAt(log, 'fillRect #000000'),
      firstAt(log, 'fill rgba(3, 5, 9, 0.14)'),
      firstAt(log, 'fill rgba(132, 152, 182, 0.2)'),
      firstAt(log, 'fill rgba(3, 5, 9, 0.17)'),
      firstAt(log, 'stroke rgba(2, 3, 6,'),
    ];
    expect(order.every((at) => at >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});

describe('the walls cut by the scene camera (tilted view T4, A6)', () => {
  it("over the starting grave at (270, 608), the far wall's deepest drawn point sits at 0.946548 of the rim's own distance from the nadir", () => {
    // T4, A6: the hole is cut by the scene camera, 1147.5 field units up, which
    // is 42.5 half-lengths of a starting grave, so a wall at the dark depth 2.4
    // draws at 42.5 / 44.9 of the rim's distance from the nadir (the record's
    // 0.947, against build 7's 0.673).
    const view = viewOver(270, 608, 27);
    const far = faceNamed(27, view, 'far');
    const nadir = { x: view.nadirX * 27, y: view.nadirY * 27 };
    const rim = facePoint(far, 27, 0.5, 0);
    const deep = facePoint(far, 27, 0.5, 1);
    const share = distance(deep, nadir) / distance(rim, nadir);
    expect(Math.abs(share - 0.946548)).toBeLessThanOrEqual(1e-6);
  });

  it('a grave to the left of the middle shows more of its left wall than its right, and a grave to the right the reverse', () => {
    // T4: the camera stands over the middle of the column, so off the middle
    // the wall on the side away from it shows more than the one toward it.
    const left = viewOver(150, 608, 27);
    expect(inwardOf(27, left, 'left')).toBeGreaterThan(
      inwardOf(27, left, 'right'),
    );
    const right = viewOver(390, 608, 27);
    expect(inwardOf(27, right, 'right')).toBeGreaterThan(
      inwardOf(27, right, 'left'),
    );
  });

  it('a grave on the middle column shows its two side walls mirror images, as R4 promises', () => {
    // R4, under the scene camera: on the middle column the nadir lies straight
    // behind the grave, so the two side walls reach in equally at every size
    // and every depth, and meet the dark at the same height.
    for (const size of SIZES) {
      const view = viewOver(270, 608, size);
      const right = faceNamed(size, view, 'right');
      const left = faceNamed(size, view, 'left');
      for (const down of [0.25, 0.5, 1]) {
        const r = facePoint(right, size, 0.5, down);
        const l = facePoint(left, size, 0.5, down);
        expect(Math.abs(r.x + l.x)).toBeLessThan(1e-9);
        expect(Math.abs(r.y - l.y)).toBeLessThan(1e-9);
      }
      expect(inwardOf(size, view, 'right')).toBeGreaterThan(0);
    }
  });

  it('no near wall is drawn, and the mouth still clips every face', () => {
    // R4: the camera stands behind every grave, so only the far and the two
    // side faces are cut, and the mouth's clip is laid before the first face
    // and lifted only after the corner edges, off the middle column as on it.
    const view = viewOver(150, 608, 27);
    expect(wallFaces(27, view).map((face) => face.id)).toEqual([
      'far',
      'right',
      'left',
    ]);
    const { canvas, log } = recordingCanvas();
    paintPit(canvas, mouthPolygon(27), 27, PHONE_VIEW, view);
    const clipped = firstAt(log, 'clip(');
    const firstFace = firstAt(log, 'fill rgba(3, 5, 9, 0.14)');
    const lastEdge = log.findLastIndex((line) =>
      line.startsWith('stroke rgba(2, 3, 6,'),
    );
    const lifted = log.findLastIndex((line) => line.startsWith('restore('));
    expect(clipped).toBeGreaterThanOrEqual(0);
    expect(firstFace).toBeGreaterThan(clipped);
    expect(lastEdge).toBeGreaterThan(firstFace);
    expect(lifted).toBeGreaterThan(lastEdge);
  });
});
