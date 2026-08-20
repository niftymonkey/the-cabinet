import { Container } from "pixi.js";

import { engine } from "../getEngine";
import { runHandoff } from "../runHandoff";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { bindKeyPress } from "../utils/bindKeyPress";
import { GameScreen } from "./game/GameScreen";

const INK = 0xe8edf2;
const DIM = 0x76839a;

/**
 * The screen a run ends on. Render only: it reports the run the game screen
 * recorded and offers another one.
 */
export class EndScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ["main"];

  private readonly title: Label;
  private readonly seedLabel: Label;
  private readonly tickLabel: Label;
  private readonly againButton: Button;
  private releaseKeys: (() => void) | null = null;
  private rising = false;

  constructor() {
    super();

    this.title = new Label({
      text: "THE RUN IS OVER",
      style: { fill: INK, fontSize: 36, letterSpacing: 4 },
    });
    this.seedLabel = new Label({ style: { fill: DIM, fontSize: 18 } });
    this.tickLabel = new Label({ style: { fill: INK, fontSize: 30 } });
    this.againButton = new Button({
      text: "RISE AGAIN",
      width: 300,
      height: 100,
      fontSize: 24,
    });
    this.againButton.onPress.connect(() => this.riseAgain());

    this.addChild(this.title, this.seedLabel, this.tickLabel, this.againButton);
  }

  public prepare() {
    this.rising = false;
    const summary = runHandoff.read();
    this.seedLabel.text = summary ? `SEED ${summary.seed}` : "NO RUN RECORDED";
    this.tickLabel.text = summary ? `${summary.ticks} TICKS` : "";
    this.releaseKeys = bindKeyPress("Enter", () => this.riseAgain());
  }

  public reset() {
    this.releaseKeys?.();
    this.releaseKeys = null;
  }

  public resize(width: number, height: number) {
    const cx = width / 2;
    this.title.position.set(cx, height * 0.26);
    this.seedLabel.position.set(cx, height * 0.42);
    this.tickLabel.position.set(cx, height * 0.42 + 40);
    this.againButton.position.set(cx, height * 0.68);
  }

  private riseAgain() {
    if (this.rising) return;
    this.rising = true;
    engine()
      .navigation.showScreen(GameScreen)
      .catch((error) => console.error(error));
  }
}
