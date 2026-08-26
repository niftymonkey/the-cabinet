// The title screen. First contact gets coached: a fresh player has never
// seen the swallow verb (memory: prototypes need first-contact coaching).

import type { Ticker } from 'pixi.js';
import { Container } from 'pixi.js';

import { engine } from '../../../app/getEngine';
import { Button } from '../../../app/ui/Button';
import { Label } from '../../../app/ui/Label';
import { PALETTE } from '../palette';
import { runState } from '../runState';
import { GameScreen } from './game/GameScreen';

const KEYBOARD_COACHING = [
  'Steer with WASD or the arrow keys. Your storm fires on its own.',
  'Hold SHIFT to move slowly for fine dodging.',
  'Kills leave corpses. Pass the grave under them to swallow them.',
  'Swallowing grows you, fires your bursts, and charges the belch.',
  'Corpses rot in seconds. Gold things are treasure and keep.',
  'Enemy fire shrinks you. Sealed shut is death.',
  'SPACE belches when the meter is full: it clears the whole screen.',
];

// Ticket #33: the same coaching for thumbs. Relative drag has no focus key;
// the finger's own precision plays that role.
const TOUCH_COACHING = [
  'Rest a finger anywhere and drag. The grave copies the drag.',
  'Your storm fires on its own.',
  'Kills leave corpses. Pass the grave under them to swallow them.',
  'Swallowing grows you, fires your bursts, and charges the belch.',
  'Corpses rot in seconds. Gold things are treasure and keep.',
  'Enemy fire shrinks you. Sealed shut is death.',
  'Tap a second finger to belch when the meter is full.',
];

const COACHING = window.matchMedia('(pointer: coarse)').matches
  ? TOUCH_COACHING
  : KEYBOARD_COACHING;

export class TitleScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ['main'];

  private readonly title: Label;
  private readonly tagline: Label;
  private readonly coaching: Label[];
  private readonly startButton: Button;
  private readonly backButton: Button;
  private readonly devKeys: Label;
  private elapsed = 0;
  private readonly onKeyDown = (ev: KeyboardEvent) => {
    if (ev.code === 'Enter') this.start();
  };

  constructor() {
    super();

    this.title = new Label({
      text: 'THE HUNGRY GRAVE',
      style: { fill: PALETTE.drop, fontSize: 52, letterSpacing: 6 },
    });
    this.tagline = new Label({
      text: 'You are an open grave. Everything goes in the hole.',
      style: { fill: PALETTE.skull, fontSize: 18 },
    });
    this.coaching = COACHING.map(
      (text) =>
        new Label({
          text,
          style: { fill: PALETTE.corpse, fontSize: 16 },
        }),
    );
    this.startButton = new Button({ text: 'RISE', width: 260, height: 100 });
    this.startButton.onPress.connect(() => this.start());
    this.backButton = new Button({
      text: 'PROTOTYPES',
      width: 190,
      height: 70,
      fontSize: 16,
    });
    this.backButton.onPress.connect(() => {
      // The router in main.ts observes the hash and shows the list.
      window.location.hash = '#/prototypes';
    });
    this.devKeys = new Label({
      text: `seed ${runState.seed} · dev: P autopilot · \` debug · 1-7 phase skip · R restart`,
      style: { fill: PALETTE.fieldFrame, fontSize: 13 },
    });

    this.addChild(
      this.title,
      this.tagline,
      ...this.coaching,
      this.startButton,
      this.backButton,
      this.devKeys,
    );
  }

  private start(): void {
    void engine().navigation.showScreen(GameScreen);
  }

  public update(time: Ticker) {
    this.elapsed += time.deltaMS / 1000;
    this.title.alpha = 0.85 + 0.15 * Math.sin(this.elapsed * 2);
  }

  public resize(width: number, height: number) {
    const cx = width / 2;
    this.title.position.set(cx, height * 0.18);
    this.tagline.position.set(cx, height * 0.18 + 52);
    this.coaching.forEach((label, i) => {
      label.position.set(cx, height * 0.36 + i * 30);
    });
    this.startButton.position.set(cx, height * 0.75);
    this.backButton.position.set(110, 50);
    this.devKeys.position.set(cx, height - 24);
  }

  public async show(): Promise<void> {
    engine().audio.bgm.play('main/sounds/bgm-main.mp3', { volume: 0.35 });
    window.addEventListener('keydown', this.onKeyDown);
  }

  public async hide() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  /** Reset screen, after hidden */
  public reset() {
    this.elapsed = 0;
  }
}
