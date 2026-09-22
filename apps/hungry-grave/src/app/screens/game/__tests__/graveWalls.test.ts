/**
 * The cut earth and the dark under it, ported line for line from the
 * prototype's paintPit (build 7, slice 6 of #148).
 */

import { describe, expect, it } from 'vitest';

import type { GraveCanvas } from '../graveCanvas';
import { mouthPolygon } from '../graveMouth';
import { facePoint, paintPit, wallFaces } from '../graveWalls';

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

describe('the walls of the hole (design record R4, slice 6)', () => {
  it('the left and right walls are equally wide at every size', () => {
    // Mark saw them unequal on slice 3's grave. The projection makes the two
    // side faces mirror images, so the drawn width from the lip to the dark is
    // the same on both sides at every size.
    for (const size of SIZES) {
      const widths = wallFaces(size)
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
    paintPit(canvas, mouthPolygon(27), 27, PHONE_VIEW);
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
