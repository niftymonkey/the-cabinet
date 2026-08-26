import { FancyButton } from '@pixi/ui';

import { Label } from './Label';

// How a button looks. Every field has a default, so a caller names what differs.
const defaultButtonLook = {
  text: '',
  width: 301,
  height: 112,
  fontSize: 28,
};

type ButtonLook = typeof defaultButtonLook;

// The chrome a button makes: its own clips, the only two it ever asks for.
const HOVER_CLIP = 'main/sounds/sfx-hover.wav';
const PRESS_CLIP = 'main/sounds/sfx-press.wav';

/**
 * What a button is built with: how it looks, and the one power it cannot reach
 * on its own. Nothing under src/app/ui may import from the app
 * (src/__tests__/boundary.test.ts), so where a clip comes out arrives here.
 */
interface ButtonProps extends Partial<ButtonLook> {
  playSound(alias: string): void;
}

/**
 * The same power named from the other side: what a screen or popup must hold in
 * order to build a button at all. Every props record that builds one extends
 * this rather than restating the member, so the widget's one dependency is
 * declared once and a change to it reaches every host through the compiler.
 */
interface ButtonChrome {
  playButtonSound(alias: string): void;
}

/**
 * The big rectangle button, with a label, idle and pressed states.
 *
 * It stays a class extending the library's own, because @pixi/ui offers a
 * button no other way; the rule's plain-record form has nothing to build on
 * here.
 */
class Button extends FancyButton {
  private readonly playSound: (alias: string) => void;

  constructor(props: ButtonProps) {
    const look = { ...defaultButtonLook, ...props };

    super({
      defaultView: 'button.png',
      nineSliceSprite: [38, 50, 38, 50],
      anchor: 0.5,
      text: new Label({
        text: look.text,
        style: {
          fill: 0x4a4a4a,
          align: 'center',
          fontSize: look.fontSize,
        },
      }),
      textOffset: { x: 0, y: -13 },
      defaultTextAnchor: 0.5,
      scale: 0.9,
      animations: {
        hover: {
          props: {
            scale: { x: 1.03, y: 1.03 },
            y: 0,
          },
          duration: 100,
        },
        pressed: {
          props: {
            scale: { x: 0.97, y: 0.97 },
            y: 10,
          },
          duration: 100,
        },
      },
    });

    this.playSound = props.playSound;
    this.width = look.width;
    this.height = look.height;

    this.onDown.connect(this.handleDown.bind(this));
    this.onHover.connect(this.handleHover.bind(this));
  }

  private handleHover() {
    this.playSound(HOVER_CLIP);
  }

  private handleDown() {
    this.playSound(PRESS_CLIP);
  }
}

export { Button };
export type { ButtonChrome };
