// The frame-rate readout as a dumb view: no sampler, no ticker, no decisions.

import { Container } from 'pixi.js';

import { meterLinePosition, METER_FONT_SIZE } from './cornerReadout';
import { PALETTE } from './palette';
import { Label } from './ui/Label';

/**
 * The frame rate, shown quietly in the top-left corner of whatever screen is
 * up. The corner is a constant offset from the stage origin, so a viewport
 * change moves the corner and the readout rides along with no work per resize.
 */
interface FpsMeter {
  readonly view: Container;
  render(fps: number): void;
}

const createFpsMeter = (): FpsMeter => {
  const view = new Container();
  const readout = new Label({
    // Monospace so the number holds its width as the digits change.
    // The meter draws over the field, so it is inside ADR 0014's ceiling.
    style: {
      fontFamily: 'monospace',
      fill: PALETTE.hudDim.hex,
      fontSize: METER_FONT_SIZE,
    },
  });
  readout.anchor.set(0, 0);
  const line = meterLinePosition(0);
  readout.position.set(line.x, line.y);
  view.addChild(readout);
  return {
    view,
    render(fps) {
      readout.text = `${fps} FPS`;
    },
  };
};

export { createFpsMeter };
export type { FpsMeter };
