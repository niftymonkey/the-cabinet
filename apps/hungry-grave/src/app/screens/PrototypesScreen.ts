// The base app's only screen: the list of prototypes. It knows nothing about
// any prototype's insides; it renders the registry and routes into one.

import type { Container as ContainerType } from "pixi.js";
import { Container } from "pixi.js";

import { prototypeHash, PROTOTYPES } from "../../prototypes";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";

const INK = 0xdde3ea;
const DIM = 0x6b7686;

export class PrototypesScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  private readonly title: Label;
  private readonly tagline: Label;
  private readonly rows: { button: Button; blurb: Label }[];
  private readonly empty: Label | null = null;

  constructor() {
    super();

    this.title = new Label({
      text: "PROTOTYPES",
      style: { fill: INK, fontSize: 44, letterSpacing: 8 },
    });
    this.tagline = new Label({
      text: "Throwaway builds that answer design questions. Play, learn, discard.",
      style: { fill: DIM, fontSize: 16 },
    });
    this.rows = PROTOTYPES.map((entry) => {
      const button = new Button({
        text: entry.title,
        width: 420,
        height: 100,
        fontSize: 24,
      });
      button.onPress.connect(() => {
        // The router in main.ts observes the hash and shows the screen.
        window.location.hash = prototypeHash(entry.id);
      });
      const blurb = new Label({
        text: entry.blurb,
        style: { fill: DIM, fontSize: 14 },
      });
      return { button, blurb };
    });
    if (PROTOTYPES.length === 0) {
      this.empty = new Label({
        text: "No prototypes right now. The scaffold waits, blank on purpose.",
        style: { fill: DIM, fontSize: 16 },
      });
      this.addChild(this.empty);
    }

    const children: ContainerType[] = [this.title, this.tagline];
    for (const row of this.rows) children.push(row.button, row.blurb);
    this.addChild(...children);
  }

  public resize(width: number, height: number) {
    const cx = width / 2;
    this.title.position.set(cx, height * 0.16);
    this.tagline.position.set(cx, height * 0.16 + 46);
    this.rows.forEach((row, i) => {
      const y = height * 0.34 + i * 150;
      row.button.position.set(cx, y);
      row.blurb.position.set(cx, y + 62);
    });
    this.empty?.position.set(cx, height * 0.4);
  }

  /** Reset screen, after hidden */
  public reset() {}
}
