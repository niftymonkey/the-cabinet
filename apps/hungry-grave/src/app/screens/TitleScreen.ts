import { Container } from "pixi.js";

import { engine } from "../getEngine";
import { PROTOTYPES_HASH } from "../routes";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { bindKeyPress } from "../utils/bindKeyPress";
import { GameScreen } from "./game/GameScreen";

const INK = 0xe8edf2;
const DIM = 0x76839a;

/**
 * The game's front door. Render only: it names the game and offers the way in.
 * Screens inside the game navigate directly and never touch the hash; the one
 * exception is the way out to the prototype list, which is a route.
 */
export class TitleScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ["main"];

  private readonly title: Label;
  private readonly tagline: Label;
  private readonly riseButton: Button;
  private readonly prototypesButton: Button;
  private releaseKeys: (() => void) | null = null;
  private rising = false;

  constructor() {
    super();

    this.title = new Label({
      text: "THE HUNGRY GRAVE",
      style: { fill: INK, fontSize: 44, letterSpacing: 6 },
    });
    this.tagline = new Label({
      text: "A Halloween vertical shmup crossed with hole.io",
      style: { fill: DIM, fontSize: 16 },
    });
    this.riseButton = new Button({ text: "RISE", width: 300, height: 100 });
    this.riseButton.onPress.connect(() => this.rise());
    this.prototypesButton = new Button({
      text: "PROTOTYPES",
      width: 220,
      height: 70,
      fontSize: 16,
    });
    this.prototypesButton.onPress.connect(() => {
      // The router in main.ts observes the hash and shows the list.
      window.location.hash = PROTOTYPES_HASH;
    });

    this.addChild(
      this.title,
      this.tagline,
      this.riseButton,
      this.prototypesButton,
    );
  }

  public prepare() {
    this.rising = false;
    this.releaseKeys = bindKeyPress("Enter", () => this.rise());
  }

  public reset() {
    this.releaseKeys?.();
    this.releaseKeys = null;
  }

  public resize(width: number, height: number) {
    const cx = width / 2;
    this.title.position.set(cx, height * 0.28);
    this.tagline.position.set(cx, height * 0.28 + 48);
    this.riseButton.position.set(cx, height * 0.55);
    this.prototypesButton.position.set(cx, height * 0.78);
  }

  private rise() {
    if (this.rising) return;
    this.rising = true;
    engine()
      .navigation.showScreen(GameScreen)
      .catch((error) => console.error(error));
  }
}
