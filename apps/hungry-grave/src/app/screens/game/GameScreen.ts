import { Container, Graphics } from "pixi.js";

import type { MoveCommand, RunState } from "../../../game/run";
import { createRun } from "../../../game/run";
import { step } from "../../../game/step";
import { engine } from "../../getEngine";
import type { FieldPlacement } from "../../layout";
import {
  BOUNDARY_STROKE,
  DEGENERATE_PLACEMENT,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  fitField,
} from "../../layout";
import { PALETTE } from "../../palette";
import { runHandoff, summarizeRun } from "../../runHandoff";
import { Button } from "../../ui/Button";
import { Label } from "../../ui/Label";
import { bindKeyPress } from "../../utils/bindKeyPress";
import { EndScreen } from "../EndScreen";
import { FieldLayers } from "./layering";

const STILL: MoveCommand = { x: 0, y: 0 };

/**
 * The playfield's boundary readout. The engine's background and the field's
 * ground are both night, so this outline is the only visible edge of the field,
 * and that edge is the bound on the grave's movement. That makes it a readout
 * and not scenery, which is why it carries a contrast floor of its own and a
 * width the floor depends on. It strokes inward so the whole of it stays inside
 * the field's own 540 by 760.
 */
function boundaryReadout(): Graphics {
  return new Graphics().rect(0, 0, FIELD_WIDTH, FIELD_HEIGHT).stroke({
    width: BOUNDARY_STROKE,
    color: PALETTE.fieldFrame.hex,
    alignment: 1,
  });
}

/**
 * The screen a run plays on. Render only: it owns this run's state and shows
 * it, and holds no game rules. The rules live in src/game and reach the screen
 * one tick at a time through step().
 */
export class GameScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ["main"];

  /**
   * The field, carrying exactly the placement fitField returns and nothing
   * else. Screen shake, if it is ever added, goes on a child of this container:
   * screenToField recomputes the placement in parallel with this transform, and
   * the two agree only while this transform is the placement alone. Shake
   * applied here would break touch input silently, with every test still green.
   */
  private readonly field: Container;
  private readonly layers: FieldLayers;

  /**
   * The boundary readout, held rather than rebuilt. reset() empties the layers,
   * so the frame has to be put back, and putting back this instance keeps a
   * pooled screen from allocating a new Graphics on every run.
   */
  private readonly frame: Graphics;
  private readonly seedLabel: Label;
  private readonly tickLabel: Label;
  private readonly endButton: Button;
  /**
   * The live placement, held rather than recomputed. A pointer handler converts
   * an event through screenToField with this exact value: calling fitField a
   * second time at event time computes the placement in parallel, and the two
   * agree only until something moves one of them.
   */
  private placement: FieldPlacement = DEGENERATE_PLACEMENT;
  private run: RunState | null = null;
  private releaseKeys: (() => void) | null = null;
  private ending = false;

  constructor() {
    super();

    this.field = new Container();
    this.layers = new FieldLayers();
    this.field.addChild(this.layers.root);
    this.frame = boundaryReadout();
    this.layers.layer("ground").addChild(this.frame);

    // Inside ADR 0014's ceiling, because these draw over play.
    this.seedLabel = new Label({
      style: { fill: PALETTE.hudDim.hex, fontSize: 18 },
    });
    this.tickLabel = new Label({
      style: { fill: PALETTE.hudInk.hex, fontSize: 52 },
    });
    this.endButton = new Button({
      text: "END RUN",
      width: 240,
      height: 84,
      fontSize: 20,
    });
    this.endButton.onPress.connect(() => this.endRun());

    this.addChild(this.field, this.seedLabel, this.tickLabel, this.endButton);
  }

  public prepare() {
    this.ending = false;
    this.run = createRun();
    this.seedLabel.text = `SEED ${this.run.seed}`;
    this.tickLabel.text = `TICK ${this.run.tick}`;
    this.releaseKeys = bindKeyPress("Escape", () => this.endRun());
  }

  public reset() {
    this.releaseKeys?.();
    this.releaseKeys = null;
    this.run = null;
    this.layers.clear();
    this.layers.layer("ground").addChild(this.frame);
  }

  /**
   * One sim tick per rendered frame, which is a placeholder and not the
   * design: a 144 Hz display would run the sim 2.4 times as fast as a 60 Hz
   * one, and the same seed would stop being the same game (ADR 0015). The
   * fixed timestep and its catch-up clamp belong to src/game/clock.ts, which
   * takes this call over in the sim-core dispatch.
   */
  public update() {
    if (this.ending || !this.run) return;
    step(this.run, STILL);
    this.tickLabel.text = `TICK ${this.run.tick}`;
  }

  public resize(width: number, height: number) {
    this.placement = fitField(width, height);
    this.field.position.set(this.placement.offsetX, this.placement.offsetY);
    this.field.scale.set(this.placement.scale);
    this.placeReadouts(this.placement);
  }

  /**
   * The readouts stay in screen space, positioned against the fitted field's
   * rectangle rather than scaled with it, so the text holds its size on a phone
   * where the field scales down.
   */
  private placeReadouts(placement: FieldPlacement) {
    const width = FIELD_WIDTH * placement.scale;
    const height = FIELD_HEIGHT * placement.scale;
    const cx = placement.offsetX + width / 2;
    this.seedLabel.position.set(cx, placement.offsetY + height * 0.22);
    this.tickLabel.position.set(cx, placement.offsetY + height * 0.46);
    this.endButton.position.set(cx, placement.offsetY + height * 0.78);
  }

  private endRun() {
    if (this.ending || !this.run) return;
    this.ending = true;
    runHandoff.record(summarizeRun(this.run));
    engine()
      .navigation.showScreen(EndScreen)
      .catch((error) => {
        // A failed navigation releases the guard: left up it deafens every
        // retry and holds the ticker's work stopped for the rest of the run.
        this.ending = false;
        console.error(error);
      });
  }
}
