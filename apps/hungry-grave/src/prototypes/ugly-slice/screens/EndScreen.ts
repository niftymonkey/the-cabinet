// The end of a run, both endings: sealed shut, or the grave eats the
// gravedigger. Reads the finished run from runState.

import { Container } from "pixi.js";

import { engine } from "../../../app/getEngine";
import { Button } from "../../../app/ui/Button";
import { Label } from "../../../app/ui/Label";
import { PALETTE } from "../palette";
import { runState } from "../runState";
import { GameScreen } from "./game/GameScreen";

export class EndScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  private readonly title: Label;
  private readonly tagline: Label;
  private readonly tally: Label;
  private readonly againButton: Button;
  private readonly backButton: Button;
  private readonly onKeyDown = (ev: KeyboardEvent) => {
    if (ev.code === "Enter") this.again();
  };

  constructor() {
    super();
    this.title = new Label({
      text: "",
      style: { fontSize: 40, letterSpacing: 4 },
    });
    this.tagline = new Label({
      text: "",
      style: { fill: PALETTE.skull, fontSize: 18 },
    });
    this.tally = new Label({
      text: "",
      style: { fill: PALETTE.corpse, fontSize: 17, lineHeight: 28 },
    });
    this.againButton = new Button({ text: "", width: 320, height: 100 });
    this.againButton.onPress.connect(() => this.again());
    this.backButton = new Button({
      text: "PROTOTYPES",
      width: 190,
      height: 70,
      fontSize: 16,
    });
    this.backButton.onPress.connect(() => {
      // The router in main.ts observes the hash and shows the list.
      window.location.hash = "#/prototypes";
    });
    this.addChild(
      this.title,
      this.tagline,
      this.tally,
      this.againButton,
      this.backButton,
    );
  }

  /** Fill from the finished run just before showing (screens are pooled) */
  public prepare() {
    const dead = runState.outcome === "dead";
    this.title.text = dead ? "SEALED SHUT" : "THE GRAVE EATS THE GRAVEDIGGER";
    this.title.style.fill = dead ? PALETTE.enemyShot : PALETTE.enemy;
    this.tagline.text = dead
      ? "The dirt takes you back."
      : "Nothing is left to bury you.";
    const sim = runState.lastSim;
    if (sim !== null) {
      const ins = sim.instruments;
      this.tally.text = [
        `${sim.player.score} score`,
        `${ins.killsTotal} kills · ${ins.corpsesEaten} swallowed · ${ins.belchesFired} belches`,
        `${ins.dropsEaten} of ${ins.dropsSpawned} drops taken`,
      ].join("\n");
    }
    this.againButton.text = dead ? "DIG BACK OUT" : "RUN IT BACK";
  }

  private again(): void {
    void engine().navigation.showScreen(GameScreen);
  }

  public resize(width: number, height: number) {
    const cx = width / 2;
    this.title.position.set(cx, height * 0.28);
    this.tagline.position.set(cx, height * 0.28 + 46);
    this.tally.position.set(cx, height * 0.48);
    this.againButton.position.set(cx, height * 0.7);
    this.backButton.position.set(cx, height * 0.7 + 100);
  }

  public async show(): Promise<void> {
    window.addEventListener("keydown", this.onKeyDown);
  }

  public async hide() {
    window.removeEventListener("keydown", this.onKeyDown);
  }
}
