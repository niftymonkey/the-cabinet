/**
 * A screen taken out of the pool a second time comes back with fresh state and
 * this showing's powers, never the last showing's.
 *
 * It is the one defect the props design can produce with every other test
 * green: the pool keeps the instance, so a screen that held on to the powers it
 * was first shown with goes on calling a finished run's driver, and a player
 * meets that as a dead button. Nothing below fakes the pool: the real
 * navigation and the real BigPool are what run here.
 *
 * It spans the navigation in src/engine, the screens in src/app and the wiring
 * a driver does between them, so it sits at the src root.
 */

import type { Ticker } from 'pixi.js';
import { Container } from 'pixi.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The asset loader, which navigation asks for a screen's bundles. Nothing else
 * in pixi is faked: the pool under test is the real BigPool this same module
 * exports.
 */
vi.mock('pixi.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('pixi.js')>()),
  Assets: { loadBundle: () => Promise.resolve() },
}));

/**
 * The animations, for the same reason the widgets are faked: framer-motion
 * resolves its subject against NodeList and there is none under node. How a
 * panel slides in is not what any of this file is about.
 */
vi.mock('motion', () => ({ animate: () => Promise.resolve() }));

/** The real widgets need a renderer: text metrics and a loaded texture. */
vi.mock('../app/ui/Label', () => ({
  Label: class extends Container {
    public text = '';
    public anchor = { set: () => {} };
  },
}));

vi.mock('../app/ui/Button', () => ({
  Button: class extends Container {
    public onPress = { connect: (handler: () => void) => void handler };
  },
}));

import { TICK_MS } from '../game/clock';
import type { GameScreenProps } from '../app/screens/game/GameScreen';
import { GameScreen } from '../app/screens/game/GameScreen';
import { EndScreen } from '../app/screens/EndScreen';
import type { SettingsPopupProps } from '../app/popups/SettingsPopup';
import { SettingsPopup } from '../app/popups/SettingsPopup';
import type { CreationEngine } from '../engine/engine';
import { Navigation } from '../engine/navigation/navigation';

const keyHandlers = new Set<(event: KeyboardEvent) => void>();

/** The URL the game screen reads its seed off (ADR 0012). */
const fakeLocation = { search: '?seed=7', hash: '' };

Object.defineProperty(globalThis, 'window', {
  value: {
    addEventListener: (_type: string, handler: (e: KeyboardEvent) => void) =>
      keyHandlers.add(handler),
    removeEventListener: (_type: string, handler: (e: KeyboardEvent) => void) =>
      keyHandlers.delete(handler),
    location: fakeLocation,
    matchMedia: () => ({ matches: false }),
    devicePixelRatio: 2,
  },
  configurable: true,
});

Object.defineProperty(globalThis, 'localStorage', {
  value: { getItem: () => null, setItem: () => {} },
  configurable: true,
});

/** Everything navigation touches on the engine: a stage and a ticker. */
function navigationOnFakeEngine(): Navigation {
  const navigation = new Navigation();
  navigation.init({
    stage: new Container(),
    ticker: { add: () => {}, remove: () => {} },
  } as unknown as CreationEngine);
  navigation.resize(1440, 900);
  return navigation;
}

/** One showing's powers, and the End Run the pause menu was armed with. */
interface Showing {
  readonly props: GameScreenProps;
  endRun(): void;
}

/**
 * One showing's powers, tagged so a call can be traced back to the showing that
 * handed them over. A stale prop shows up here as the first showing's tag.
 */
function showing(tag: string, menusOpened: string[]): Showing {
  let armed: (() => void) | null = null;
  return {
    props: {
      openMenu: (endRun) => {
        armed = endRun;
        menusOpened.push(tag);
        return Promise.resolve();
      },
      closeMenu: () => Promise.resolve(),
      menuShowing: () => false,
      showEnd: () => Promise.resolve(),
      playSound: () => {},
      // Button is faked in this file, so no button ever asks for a sound.
      playButtonSound: () => {},
      canvas: null,
      renderer: { name: 'webgl', resolution: 2 },
    },
    endRun: () => armed?.(),
  };
}

/**
 * The game screen the navigation is holding. It comes back out of the pool
 * through the lifecycle interface, and every assertion below is about the class
 * behind it, so the narrowing is the check as well as the reach.
 */
function heldGameScreen(navigation: Navigation): GameScreen {
  const screen = navigation.currentScreen;
  if (!(screen instanceof GameScreen)) {
    throw new Error('the navigation is not holding a game screen');
  }
  return screen;
}

function press(key: string): void {
  const event = { key, code: '', preventDefault: () => {} };
  for (const handler of [...keyHandlers]) handler(event as KeyboardEvent);
}

describe('a screen shown a second time out of the pool', () => {
  // The tape store is absent under node, and saying so is the recorder doing
  // its job; this file is not the place that reads the report.
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('is the same instance, with the run started over and live powers', async () => {
    const navigation = navigationOnFakeEngine();
    const opened: string[] = [];
    const first = showing('first', opened);
    const second = showing('second', opened);

    // A run, played a little way and then ended through the pause menu, which
    // is the only place End Run lives.
    await navigation.showScreen(GameScreen, first.props);
    const played = heldGameScreen(navigation);
    // Spent ten ticks at a time, because the clock clamps one frame's worth.
    for (let spent = 0; spent < 30; spent += 10) {
      played.update({ elapsedMS: TICK_MS * 10 } as Ticker);
    }
    expect(played['session'].run?.tick).toBe(30);
    press('Escape');
    first.endRun();
    await navigation.showScreen(EndScreen, {
      onRiseAgain: () => Promise.resolve(),
      playButtonSound: () => {},
    });

    // The next run, which the pool answers with the instance it kept.
    await navigation.showScreen(GameScreen, second.props);
    const reused = heldGameScreen(navigation);
    expect(reused).toBe(played);

    // Fresh state: the run behind it is a new one, at its first tick.
    expect(reused['session'].run?.tick).toBe(0);

    // Live powers: the pause button reaches the driver of this showing. Held
    // powers would send it to a run that is already over.
    press('Escape');
    expect(opened).toEqual(['first', 'second']);
  });
});

/** A settings showing's powers. Nothing here records: the sliders are the subject. */
function settingsPowers(): SettingsPopupProps {
  return {
    onDone: () => Promise.resolve(),
    setMasterVolume: () => {},
    setBgmVolume: () => {},
    setSfxVolume: () => {},
    blurBackdrop: () => {},
    clearBackdrop: () => {},
    playButtonSound: () => {},
  };
}

/**
 * The settings panel the navigation is holding, narrowed the same way the game
 * screen is above, so the reach is a check as well.
 */
function heldSettingsPopup(navigation: Navigation): SettingsPopup {
  const popup = navigation.currentPopup;
  if (!(popup instanceof SettingsPopup)) {
    throw new Error('the navigation is not holding the settings panel');
  }
  return popup;
}

/** Where the four handles sit, which is the whole of what this panel shows. */
function handlePositions(popup: SettingsPopup): number[] {
  return [
    popup['masterSlider'].value,
    popup['bgmSlider'].value,
    popup['sfxSlider'].value,
    popup['keyboardSpeedSlider'].value,
  ];
}

describe('the settings panel shown a second time out of the pool', () => {
  it("comes back showing the stored values, not the last showing's", async () => {
    // Its reset() is empty, and this is what makes that safe: prepare() reads
    // every handle back off the settings store on every showing, so nothing a
    // showing leaves behind can survive into the next one. Were prepare() to
    // stop restoring a handle, the panel would open on the previous player's
    // drag and the store would be telling the truth to nobody.
    const navigation = navigationOnFakeEngine();

    await navigation.presentPopup(SettingsPopup, settingsPowers());
    const first = heldSettingsPopup(navigation);
    const stored = handlePositions(first);
    first['masterSlider'].value = 7;
    first['bgmSlider'].value = 9;
    first['sfxSlider'].value = 11;
    first['keyboardSpeedSlider'].value = 13;
    await navigation.dismissPopup();

    await navigation.presentPopup(SettingsPopup, settingsPowers());
    const reused = heldSettingsPopup(navigation);

    expect(reused).toBe(first);
    expect(handlePositions(reused)).toEqual(stored);
  });
});
