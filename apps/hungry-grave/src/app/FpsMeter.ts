import type { Ticker } from "pixi.js";
import { Container } from "pixi.js";

import { FpsSampler } from "./fpsSampler";
import { PALETTE } from "./palette";
import { Label } from "./ui/Label";

const MARGIN = 12;

/**
 * The frame rate, shown quietly in the top-left corner of whatever screen is
 * up. The corner is a constant offset from the stage origin, so a viewport
 * change moves the corner and the readout rides along with no work per resize
 * and none per frame beyond the sampler.
 */
export class FpsMeter extends Container {
  private readonly readout: Label;
  private readonly sampler = new FpsSampler();
  private shown: number | null = null;

  constructor() {
    super();

    this.readout = new Label({
      // Monospace so the number holds its width as the digits change.
      // The meter draws over the field, so it is inside ADR 0014's ceiling.
      style: {
        fontFamily: "monospace",
        fill: PALETTE.hudDim.hex,
        fontSize: 16,
      },
    });
    this.readout.anchor.set(0, 0);
    this.readout.position.set(MARGIN, MARGIN);

    this.addChild(this.readout);
  }

  // elapsedMS is the raw frame time; deltaMS is clamped and speed-scaled.
  public update(ticker: Ticker): void {
    const reading = this.sampler.sample(ticker.elapsedMS);
    if (reading === null || reading === this.shown) return;
    this.shown = reading;
    this.readout.text = `${reading} FPS`;
  }
}
