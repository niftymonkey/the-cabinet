import { Container } from "pixi.js";

import type { Digest } from "../../dev/digest";
import { GOLDEN, runScenario } from "../../dev/digest";
import { MENU } from "../palette";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";

/**
 * The golden digest, run in whatever browser opened this URL.
 *
 * ADR 0015's whole claim is cross-engine, and CI and the developer's machine
 * are the same Node. Without a browser that runs the digest the claim goes
 * unchecked until the final dispatch, and this build already deploys, so the
 * check becomes "open the URL on a phone and compare one word".
 *
 * It lives here rather than under screens/game because it never draws while a
 * field is live, so it is outside the palette scan and may use MENU colours.
 */
export class DigestScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ["main"];

  private readonly verdict: Label;
  private readonly detail: Label;
  private readonly caveat: Label;
  private readonly backButton: Button;

  constructor() {
    super();

    this.verdict = new Label({
      style: { fill: MENU.menuInk.hex, fontSize: 64, letterSpacing: 6 },
    });
    this.detail = new Label({
      style: {
        fontFamily: "monospace",
        fill: MENU.menuDim.hex,
        fontSize: 14,
        align: "left",
      },
    });
    this.caveat = new Label({
      style: { fill: MENU.menuDim.hex, fontSize: 14, wordWrap: true },
    });
    this.backButton = new Button({
      text: "BACK",
      width: 220,
      height: 70,
      fontSize: 18,
    });
    this.backButton.onPress.connect(() => {
      // The router in main.ts observes the hash and shows the title screen.
      window.location.hash = "#/";
    });

    this.addChild(this.verdict, this.detail, this.caveat, this.backButton);
  }

  public prepare() {
    try {
      this.showDigest(runScenario().digest);
    } catch (error) {
      this.showBreach(error);
    }
  }

  private showDigest(digest: Digest): void {
    const diverged = divergences(digest);
    this.verdict.text = diverged.length === 0 ? "MATCH" : "DIVERGED";
    this.detail.text =
      diverged.length === 0
        ? describe(digest)
        : `${diverged.join("\n")}\n\n${describe(digest)}`;
    // A MATCH here is evidence that binary64 behaves, and not yet evidence for
    // ADR 0015's claim over the approximated operations. Without this on
    // screen a phone MATCH reads in the record as more than it is.
    this.caveat.text =
      "A MATCH proves less than it looks. This scenario's path uses only exactly-specified arithmetic and never calls math.ts, so it says binary64 agrees between engines and says nothing yet about sin, cos, pow or the rest.";
  }

  /**
   * An invariant fired before a digest could be taken. runScenario steps
   * through stepChecked, which throws by design (ADR 0013), and
   * addAndShowScreen calls prepare() synchronously, so an unguarded throw
   * rejects the navigation and renders nothing at all. That would be a blank
   * page in exactly the case this screen exists for, on the one platform with
   * no console to read.
   */
  private showBreach(error: unknown): void {
    this.verdict.text = "BROKEN";
    this.detail.text = error instanceof Error ? error.message : String(error);
    this.caveat.text =
      "A sim invariant fired before the scenario finished, so there is no digest to compare. That is a finding on this device, not a test failure.";
  }

  public reset() {}

  public resize(width: number, height: number) {
    const cx = width / 2;
    this.verdict.position.set(cx, height * 0.16);
    this.detail.position.set(cx, height * 0.36);
    this.caveat.position.set(cx, height * 0.68);
    this.caveat.style.wordWrapWidth = Math.min(width - 64, 520);
    this.backButton.position.set(cx, height * 0.86);
  }
}

/** The digest as readable lines, so a divergence can be read off a phone with no console. */
function describe(digest: Digest): string {
  return Object.entries(digest)
    .map(([field, value]) => `${field}: ${format(value)}`)
    .join("\n");
}

function format(value: unknown): string {
  return typeof value === "object" && value !== null
    ? Object.entries(value)
        .map(([key, inner]) => `${key}=${inner}`)
        .join(" ")
    : String(value);
}

/**
 * Every field that differs from the committed constant, named. A digest that
 * diverges here is a real finding on that device and not a test failure, and
 * the screen has to say which field it was because a phone shows no console.
 */
function divergences(digest: Digest): string[] {
  const found: string[] = [];
  for (const [field, expected] of Object.entries(GOLDEN)) {
    const actual = digest[field as keyof Digest];
    if (format(actual) !== format(expected)) {
      found.push(
        `${field}: expected ${format(expected)}, got ${format(actual)}`,
      );
    }
  }
  return found;
}
