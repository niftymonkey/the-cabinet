// The frame-rate readout's dumb view: data in, pixels out.

import { Container, Text } from 'pixi.js';
import { describe, expect, it } from 'vitest';
import { meterLinePosition, METER_FONT_SIZE } from '../cornerReadout';
import { createFpsMeter } from '../FpsMeter';
import { PALETTE } from '../palette';

/** The one readout the meter builds, read back off the view it hands out. */
function readoutOf(view: Container): Text {
  const [child] = view.children;
  if (!(child instanceof Text)) {
    throw new Error('the meter built no text readout');
  }
  return child;
}

describe('the frame-rate readout', () => {
  it('the fps meter renders what it is given', () => {
    // A dumb view holds no sampler and no loop, so the only thing that can
    // move its number is a caller handing it one.
    const meter = createFpsMeter();
    const readout = readoutOf(meter.view);

    expect(readout.text).toBe('');

    meter.render(60);
    expect(readout.text).toBe('60 FPS');

    meter.render(144);
    expect(readout.text).toBe('144 FPS');
  });

  it('builds its own body at line 0 of the corner stack', () => {
    // The rest of the stack positions from the same geometry, so a meter that
    // measured its own corner would let the readouts drift apart.
    const readout = readoutOf(createFpsMeter().view);
    const line = meterLinePosition(0);

    expect({ x: readout.x, y: readout.y }).toEqual(line);
    expect({ x: readout.anchor.x, y: readout.anchor.y }).toEqual({
      x: 0,
      y: 0,
    });
    expect(readout.style.fontSize).toBe(METER_FONT_SIZE);
    expect(readout.style.fill).toBe(PALETTE.hudDim.hex);
    // Monospace so the number holds its width as the digits change.
    expect(readout.style.fontFamily).toBe('monospace');
  });
});
