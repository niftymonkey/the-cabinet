// The replay screen's readout: the corner line stack and the centred statement.

import { Container } from 'pixi.js';

import { meterLinePosition, METER_FONT_SIZE } from '../cornerReadout';
import { PALETTE } from '../palette';
import { Label } from '../ui/Label';
import type { ReplayLines } from './tapePlaybackSession';

/** A dumb view of the lines a session reports: data in, pixels out. */
interface ReplayReadout {
  readonly view: Container;
  render(lines: ReplayLines): void;
  // Where the statement sits and how wide it wraps, which only the viewport knows.
  resize(width: number, height: number): void;
}

// How much viewport the statement leaves to either side of itself.
const STATEMENT_GUTTER = 64;

// The widest the statement wraps however wide the viewport is, so a line stays readable.
const STATEMENT_MAX_WIDTH = 520;

// One line of the corner readout stack (the game screen's own construction).
const stackLine = (index: number): Label => {
  const label = new Label({
    style: {
      fontFamily: 'monospace',
      fill: PALETTE.hudDim.hex,
      fontSize: METER_FONT_SIZE,
    },
  });
  label.anchor.set(0, 0);
  const at = meterLinePosition(index);
  label.position.set(at.x, at.y);
  return label;
};

// The plain statements: a format error, a truncation, a refusal.
const statementLine = (): Label => {
  return new Label({
    style: {
      fontFamily: 'monospace',
      fill: PALETTE.hudInk.hex,
      fontSize: METER_FONT_SIZE,
      wordWrap: true,
    },
  });
};

const createReplayReadout = (): ReplayReadout => {
  const view = new Container();
  // Line 0 belongs to the frame-rate meter, so the stack starts at one.
  const posture = stackLine(1);
  const verified = stackLine(2);
  const debt = stackLine(3);
  const tick = stackLine(4);
  const statement = statementLine();
  view.addChild(posture, verified, debt, tick, statement);
  return {
    view,
    render(lines) {
      posture.text = lines.posture;
      verified.text = lines.verified;
      debt.text = lines.debt;
      tick.text = lines.tick;
      statement.text = lines.statement;
    },
    resize(width, height) {
      statement.position.set(width / 2, height / 2);
      statement.style.wordWrapWidth = Math.min(
        width - STATEMENT_GUTTER,
        STATEMENT_MAX_WIDTH,
      );
    },
  };
};

export { createReplayReadout };
export type { ReplayReadout };
