import { Container } from 'pixi.js';

import { primeSound } from '../sound';
import { MENU } from '../palette';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { bindKeyPress } from './keyBinding';

/** The two ways out of the front door, both owned by the driver in main.ts. */
interface TitleScreenProps {
  // The run RISE starts. Its rejection is what releases the guard below.
  onRise(): Promise<void>;
  // The way out to the prototype list.
  onPrototypes(): void;
}

/**
 * The game's front door. Render only: it names the game and offers the way in.
 * It knows nothing of the screens either door leads to.
 */
class TitleScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ['main'];

  private readonly title: Label;
  private readonly tagline: Label;
  private readonly riseButton: Button;
  private readonly prototypesButton: Button;
  private releaseKeys: (() => void) | null = null;
  private rising = false;
  /**
   * The powers this showing was handed. The pool calls init() before the screen
   * reaches the stage, so it is set before any handler below can run.
   */
  private props!: TitleScreenProps;

  constructor() {
    super();

    this.title = new Label({
      text: 'THE HUNGRY GRAVE',
      style: { fill: MENU.menuInk.hex, fontSize: 44, letterSpacing: 6 },
    });
    this.tagline = new Label({
      text: 'Swallow the dead. Feed the grave.',
      style: { fill: MENU.menuDim.hex, fontSize: 16 },
    });
    this.riseButton = new Button({ text: 'RISE', width: 300, height: 100 });
    this.riseButton.onPress.connect(() => this.rise());
    this.prototypesButton = new Button({
      text: 'PROTOTYPES',
      width: 220,
      height: 70,
      fontSize: 16,
    });
    this.prototypesButton.onPress.connect(() => this.props.onPrototypes());

    this.addChild(
      this.title,
      this.tagline,
      this.riseButton,
      this.prototypesButton,
    );
  }

  public init(props: TitleScreenProps) {
    this.props = props;
  }

  public prepare() {
    this.rising = false;
    this.releaseKeys = bindKeyPress('Enter', () => this.rise());
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
    // Browser autoplay policy blocks audio before a user gesture, and this is
    // the first gesture in the game.
    primeSound();
    this.props.onRise().catch((error) => {
      // A failed navigation releases the guard, or the way in is dead for
      // the rest of the session.
      this.rising = false;
      console.error(error);
    });
  }
}

export { TitleScreen };
