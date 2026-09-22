/**
 * The ground at the grave's edge, ported line for line from the prototype's
 * paintLip (build 7, slice 6 of #148).
 */

import { describe, expect, it } from 'vitest';

import type { GraveCanvas } from '../graveCanvas';
import { paintLip } from '../graveLip';
import { mouthPolygon } from '../graveMouth';
import { paintPit } from '../graveWalls';

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

/** Both of the grave's baked layers painted at one size, as one log. */
const paintedAt = (size: number): string[] => {
  const { canvas, log } = recordingCanvas();
  const mouth = mouthPolygon(size);
  paintPit(canvas, mouth, size, PHONE_VIEW);
  paintLip(canvas, mouth, size, PHONE_VIEW);
  return log;
};

describe('the ground at the edge of the hole (design record R4, slice 6)', () => {
  it('the lip is laid as the trodden margin, then the crumbs, then the turf shadow, then the overhanging grass', () => {
    // The prototype's paintLip, in its own order, each painter found by the
    // colour only it uses.
    const { canvas, log } = recordingCanvas();
    paintLip(canvas, mouthPolygon(27), 27, PHONE_VIEW);
    const margin = Math.min(
      ...[
        firstAt(log, 'fill rgba(32, 39, 49,'),
        firstAt(log, 'fill rgba(55, 64, 78,'),
      ].filter((at) => at >= 0),
    );
    const order = [
      margin,
      firstAt(log, 'fill rgba(26, 32, 41, 0.55)'),
      firstAt(log, 'stroke rgba(2, 4, 7, 0.45)'),
      Math.min(
        ...[
          firstAt(log, 'stroke #6e8a58'),
          firstAt(log, 'stroke #4a6040'),
        ].filter((at) => at >= 0),
      ),
    ];
    expect(order.every((at) => Number.isFinite(at) && at >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('the grave is painted the same way every time', () => {
    // Every scatter in the prototype's painters runs off a seeded stream, so
    // the grave at one size is one picture however often it is baked.
    expect(paintedAt(27)).toEqual(paintedAt(27));
    expect(paintedAt(48)).toEqual(paintedAt(48));
  });
});
