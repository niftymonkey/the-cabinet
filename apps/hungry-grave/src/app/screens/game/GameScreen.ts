import { Container } from "pixi.js";

import type { MoveCommand, RunState } from "../../../game/run";
import { createRun } from "../../../game/run";
import { step } from "../../../game/step";
import { engine } from "../../getEngine";
import { runHandoff, summarizeRun } from "../../runHandoff";
import { Button } from "../../ui/Button";
import { Label } from "../../ui/Label";
import { bindKeyPress } from "../../utils/bindKeyPress";
import { EndScreen } from "../EndScreen";

const INK = 0xe8edf2;
const DIM = 0x76839a;

const STILL: MoveCommand = { x: 0, y: 0 };

function rollSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}

/**
 * The screen a run plays on. Render only: it owns this run's state and shows
 * it, and holds no game rules. The rules live in src/game and reach the screen
 * one tick at a time through step().
 */
export class GameScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ["main"];

  private readonly seedLabel: Label;
  private readonly tickLabel: Label;
  private readonly endButton: Button;
  private run: RunState | null = null;
  private releaseKeys: (() => void) | null = null;
  private ending = false;

  constructor() {
    super();

    this.seedLabel = new Label({ style: { fill: DIM, fontSize: 18 } });
    this.tickLabel = new Label({ style: { fill: INK, fontSize: 52 } });
    this.endButton = new Button({
      text: "END RUN",
      width: 240,
      height: 84,
      fontSize: 20,
    });
    this.endButton.onPress.connect(() => this.endRun());

    this.addChild(this.seedLabel, this.tickLabel, this.endButton);
  }

  public prepare() {
    this.ending = false;
    this.run = createRun(rollSeed());
    this.seedLabel.text = `SEED ${this.run.seed}`;
    this.tickLabel.text = `TICK ${this.run.tick}`;
    this.releaseKeys = bindKeyPress("Escape", () => this.endRun());
  }

  public reset() {
    this.releaseKeys?.();
    this.releaseKeys = null;
    this.run = null;
  }

  public update() {
    if (this.ending || !this.run) return;
    step(this.run, STILL);
    this.tickLabel.text = `TICK ${this.run.tick}`;
  }

  public resize(width: number, height: number) {
    const cx = width / 2;
    this.seedLabel.position.set(cx, height * 0.22);
    this.tickLabel.position.set(cx, height * 0.46);
    this.endButton.position.set(cx, height * 0.78);
  }

  private endRun() {
    if (this.ending || !this.run) return;
    this.ending = true;
    runHandoff.record(summarizeRun(this.run));
    engine()
      .navigation.showScreen(EndScreen)
      .catch((error) => console.error(error));
  }
}
