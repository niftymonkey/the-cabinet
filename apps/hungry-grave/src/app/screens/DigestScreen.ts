import { Container } from 'pixi.js';

import type { Digest } from '../../dev/digest';
import { GOLDEN, runScenario } from '../../dev/digest';
import type { FaultRecord } from '../../game/execution';
import { MENU } from '../palette';
import type { ButtonChrome } from '../ui/Button';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';

/** The one way off the digest screen, owned by the driver in main.ts. */
interface DigestScreenProps extends ButtonChrome {
  onBack(): void;
}

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
class DigestScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ['main'];

  private readonly verdict: Label;
  private readonly detail: Label;
  private readonly caveat: Label;
  private readonly backButton: Button;
  /**
   * The powers this showing was handed. The pool calls init() before the screen
   * reaches the stage, so it is set before the back button can be pressed.
   */
  private props!: DigestScreenProps;

  constructor() {
    super();

    this.verdict = new Label({
      style: { fill: MENU.menuInk.hex, fontSize: 64, letterSpacing: 6 },
    });
    this.detail = new Label({
      style: {
        fontFamily: 'monospace',
        fill: MENU.menuDim.hex,
        fontSize: 14,
        align: 'left',
      },
    });
    this.caveat = new Label({
      style: { fill: MENU.menuDim.hex, fontSize: 14, wordWrap: true },
    });
    this.backButton = new Button({
      text: 'BACK',
      width: 220,
      height: 70,
      fontSize: 18,
      playSound: (alias) => this.props.playButtonSound(alias),
    });
    this.backButton.onPress.connect(() => this.props.onBack());

    this.addChild(this.verdict, this.detail, this.caveat, this.backButton);
  }

  public init(props: DigestScreenProps) {
    this.props = props;
  }

  public prepare() {
    try {
      const result = runScenario();
      // Only a fatal fault stops the scenario's loop (ADR 0017), so only a
      // fatal fault leaves no digest worth comparing. A recoverable fault
      // rides beside the digest that was still taken.
      if (result.faults.some((fault) => fault.severity === 'fatal')) {
        this.showBreach(faultLines(result.faults));
        return;
      }
      this.showDigest(result.digest, result.faults);
    } catch (error) {
      this.showBreach(error instanceof Error ? error.message : String(error));
    }
  }

  private showDigest(digest: Digest, faults: readonly FaultRecord[]): void {
    const diverged = divergences(digest);
    this.verdict.text = diverged.length === 0 ? 'MATCH' : 'DIVERGED';
    const sections = [
      ...(faults.length > 0 ? [faultLines(faults)] : []),
      ...(diverged.length > 0 ? [diverged.join('\n')] : []),
      describe(digest),
    ];
    this.detail.text = sections.join('\n\n');
    // A MATCH here is evidence that binary64 behaves, and not yet evidence for
    // ADR 0015's claim over the approximated operations. Without this on
    // screen a phone MATCH reads in the record as more than it is.
    this.caveat.text =
      "A MATCH proves less than it looks. This scenario's path uses only exactly-specified arithmetic and never calls math.ts, so it says binary64 agrees between engines and says nothing yet about sin, cos, pow or the rest.";
  }

  /**
   * A fatal invariant fired before a digest could be taken, or the checker
   * itself failed.
   *
   * A check records a fault and returns rather than throwing (ADR 0017), so the
   * scenario's faults arrive as a list and are read here. The try/catch stays
   * for the other case: a checker that cannot run still throws, and
   * addAndShowScreen calls prepare() synchronously, so an unguarded throw
   * rejects the navigation and renders nothing at all. That would be a blank
   * page in exactly the case this screen exists for, on the one platform with
   * no console to read.
   */
  private showBreach(detail: string): void {
    this.verdict.text = 'BROKEN';
    this.detail.text = detail;
    this.caveat.text =
      'A sim invariant fired before the scenario finished, so there is no digest to compare. That is a finding on this device, not a test failure.';
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

// The scenario's faults as readable lines, so a phone with no console can still say what broke.
const faultLines = (faults: readonly FaultRecord[]): string => {
  return faults
    .map(
      (fault) =>
        `${fault.identity} (${fault.severity}) first at tick ${fault.firstTick}, ${fault.count} times: ${fault.detail}`,
    )
    .join('\n');
};

// The digest as readable lines, so a divergence can be read off a phone with no console.
const describe = (digest: Digest): string => {
  return Object.entries(digest)
    .map(([field, value]) => `${field}: ${format(value)}`)
    .join('\n');
};

const format = (value: unknown): string => {
  return typeof value === 'object' && value !== null
    ? Object.entries(value)
        .map(([key, inner]) => `${key}=${inner}`)
        .join(' ')
    : String(value);
};

/**
 * Every field that differs from the committed constant, named. A digest that
 * diverges here is a real finding on that device and not a test failure, and
 * the screen has to say which field it was because a phone shows no console.
 */
const divergences = (digest: Digest): string[] => {
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
};

export { DigestScreen };
