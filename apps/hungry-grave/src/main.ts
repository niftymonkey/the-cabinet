import { Assets, BlurFilter, Cache, Texture } from 'pixi.js';

import { createFpsMeter } from './app/FpsMeter';
import { FpsSampler } from './app/FpsSampler';
import { setEngine } from './app/getEngine';
import { FIELD_HEIGHT, FIELD_WIDTH } from './game/field';
import { PALETTE } from './app/palette';
import { PausePopup } from './app/popups/PausePopup';
import { SettingsPopup } from './app/popups/SettingsPopup';
import {
  HOME_HASH,
  PROTOTYPES_HASH,
  REPLAY_HASH,
  resolveRoute,
} from './app/routes';
import { EndScreen } from './app/screens/EndScreen';
import { STAND_IN_BUNDLE } from './app/screens/game/groundDressing';
import { GameScreen } from './app/screens/game/GameScreen';
import { LoadScreen } from './app/screens/LoadScreen';
import { PrototypesScreen } from './app/screens/PrototypesScreen';
import { TitleScreen } from './app/screens/TitleScreen';
import type { MusicOutput } from './app/sound';
import { MUSIC_BUNDLE, playFor, playMusicFor } from './app/sound';
import { userSettings } from './app/userSettings';
import { prototypeHash } from './prototypes';
import { CreationEngine, registerEnginePlugins } from './engine/engine';

/**
 * These libraries register their plugins by being imported and offer no call to
 * do it with, so the entry point is the only place they are imported.
 */
import '@pixi/sound';
import 'pixi.js/app';

const initEngine = async (): Promise<CreationEngine> => {
  registerEnginePlugins();
  const engine = new CreationEngine();
  setEngine(engine);
  await engine.init({
    background: PALETTE.night.hex,
    // The stage's floor is the field's own unit space, never device pixels
    // (ADR 0003). The two were the same numbers written twice, and nothing
    // noticed if one of them moved.
    resizeOptions: {
      minWidth: FIELD_WIDTH,
      minHeight: FIELD_HEIGHT,
      letterbox: false,
    },
  });
  return engine;
};

/**
 * The volumes the player last set, told to the audio system before the first
 * sound. The settings store keeps them and nothing else, so somebody has to
 * say them out loud, and this is the boot's own step for it.
 */
const applySavedVolumes = (audio: CreationEngine['audio']): void => {
  audio.setMasterVolume(userSettings.getMasterVolume());
  audio.bgm.setVolume(userSettings.getBgmVolume());
  audio.sfx.setVolume(userSettings.getSfxVolume());
};

/**
 * Puts the frame-rate readout on the stage, above every screen. Navigation
 * adds its own container to the stage lazily, when the first screen is shown
 * (src/engine/navigation/navigation.ts), so a meter added earlier would end up
 * underneath it. zIndex settles the order by rule instead of by who was added
 * first, and holds however the screens are later reshuffled.
 */
const attachFpsMeter = (engine: CreationEngine): void => {
  const meter = createFpsMeter();
  meter.view.zIndex = 1;
  engine.stage.sortableChildren = true;
  engine.stage.addChild(meter.view);

  const sampler = new FpsSampler();
  let shown: number | null = null;
  engine.ticker.add((ticker) => {
    // elapsedMS is the raw frame time; deltaMS is clamped and speed-scaled.
    const reading = sampler.sample(ticker.elapsedMS);
    if (reading === null || reading === shown) return;
    shown = reading;
    meter.render(reading);
  });
};

// Where every BACK button sends the player: the router answers the write.
const goHome = (): void => {
  window.location.hash = HOME_HASH;
};

/**
 * The screen a popup opened over, blurred while the panel is up and cleared on
 * the way out. Which screen that is is the engine's answer and not the popup's,
 * so a popup asks for a strength and never for the screen.
 */
const backdropPowers = (engine: CreationEngine) => ({
  blurBackdrop: (strength: number): void => {
    const behind = engine.navigation.currentScreen;
    if (behind) behind.filters = [new BlurFilter({ strength })];
  },
  clearBackdrop: (): void => {
    const behind = engine.navigation.currentScreen;
    if (behind) behind.filters = [];
  },
});

/**
 * The chrome every button makes on hover and on press. A widget under
 * src/app/ui reaches nothing in the app (src/__tests__/boundary.test.ts), so
 * the one thing a button cannot do for itself arrives from here, through the
 * screen that builds it.
 */
const buttonSound = (engine: CreationEngine) => ({
  playButtonSound: (alias: string): void => {
    engine.audio.sfx.play(alias);
  },
});

/**
 * Where a section's loop comes out, and what holds it until it can.
 *
 * The music bundle is background-loaded and no screen declares it, so the first
 * section's cue can land before the file is there and the library throws on an
 * alias it has not registered. Awaiting the bundle is what turns that into a
 * late start instead of a lost cue, and the awaits resolve in the order the
 * cues were made, so a run that crosses a boundary while the bundle is still
 * coming still ends on the loop its own phase named.
 */
const musicChannel = (engine: CreationEngine): MusicOutput => ({
  play: (alias) => {
    void Assets.loadBundle(MUSIC_BUNDLE)
      .then(() => engine.audio.bgm.play(alias))
      .catch((error) =>
        console.warn(
          `the section music ${alias} would not play; the run carries on without it`,
          error,
        ),
      );
  },
});

/**
 * Where the stand-in ground's art comes from, and what holds it until it is
 * there.
 *
 * The stand-in bundle is background loaded and no screen declares it, so a
 * renderer can ask for a tile before the file is registered and Cache.get warns
 * on every miss. Asking the cache first turns that into a ground that arrives
 * late rather than a warning per sprite per frame, and the load is started here
 * so the wait is bounded by the file and not by the background queue.
 */
const standInArt = (): ((alias: string) => Texture | null) => {
  void Assets.loadBundle(STAND_IN_BUNDLE).catch((error) =>
    console.warn(
      'the stand-in ground would not load; the run carries on without it',
      error,
    ),
  );
  return (alias) => (Cache.has(alias) ? Texture.from(alias) : null);
};

/** A volume the player moved: heard now, and kept for the next sitting. */
const volumePowers = (engine: CreationEngine) => ({
  setMasterVolume: (value: number): void => {
    engine.audio.setMasterVolume(value);
    userSettings.setMasterVolume(value);
  },
  setBgmVolume: (value: number): void => {
    engine.audio.bgm.setVolume(value);
    userSettings.setBgmVolume(value);
  },
  setSfxVolume: (value: number): void => {
    engine.audio.sfx.setVolume(value);
    userSettings.setSfxVolume(value);
  },
});

/**
 * The settings panel, which replaces the pause menu rather than stacking on it.
 * OK goes back to the menu with the same End Run it was opened holding, because
 * presentPopup replaces: dismissing here would drop the player into live play.
 */
const showSettings = (
  engine: CreationEngine,
  endRun: () => void,
): Promise<void> =>
  engine.navigation.presentPopup(SettingsPopup, {
    ...backdropPowers(engine),
    ...volumePowers(engine),
    ...buttonSound(engine),
    onDone: () => showPauseMenu(engine, endRun),
  });

/** The pause menu over a live run, armed with what that run's End Run does. */
const showPauseMenu = (
  engine: CreationEngine,
  endRun: () => void,
): Promise<void> =>
  engine.navigation.presentPopup(PausePopup, {
    ...backdropPowers(engine),
    ...buttonSound(engine),
    onDismiss: () => engine.navigation.dismissPopup(),
    onSettings: () => showSettings(engine, endRun),
    onEndRun: endRun,
  });

/** The screen a run ends on, and the only way back into another one. */
const showEnd = (engine: CreationEngine): Promise<void> =>
  engine.navigation.showScreen(EndScreen, {
    onRiseAgain: () => showGame(engine),
    ...buttonSound(engine),
  });

/** A run, and every power the screen it plays on cannot reach on its own. */
const showGame = (engine: CreationEngine): Promise<void> => {
  // One channel per showing rather than one per event: the screen asks on every
  // event a run emits.
  const music = musicChannel(engine);
  const art = standInArt();
  return engine.navigation.showScreen(GameScreen, {
    openMenu: (endRun) => showPauseMenu(engine, endRun),
    closeMenu: () => engine.navigation.dismissPopup(),
    menuShowing: () => engine.navigation.currentPopup instanceof PausePopup,
    showEnd: () => showEnd(engine),
    playSound: (event) => playFor(engine.audio.sfx, event),
    playMusic: (event) => playMusicFor(music, event),
    standInArt: art,
    ...buttonSound(engine),
    canvas: engine.canvas,
    renderer: engine.renderer,
  });
};

/** The front door, and the two places it leads. */
const showTitle = (engine: CreationEngine): Promise<void> =>
  engine.navigation.showScreen(TitleScreen, {
    onRise: () => showGame(engine),
    onPrototypes: () => {
      window.location.hash = PROTOTYPES_HASH;
    },
    ...buttonSound(engine),
  });

/** The prototype list, which routes into one prototype by its registry id. */
const showPrototypes = (engine: CreationEngine): Promise<void> =>
  engine.navigation.showScreen(PrototypesScreen, {
    onOpen: (id) => {
      window.location.hash = prototypeHash(id);
    },
    ...buttonSound(engine),
  });

/** The kept runs, and the replay route each row can be opened in. */
const showRuns = async (engine: CreationEngine): Promise<void> => {
  const { RunsScreen } = await import('./app/screens/RunsScreen');
  await engine.navigation.showScreen(RunsScreen, {
    onOpenReplay: (tapeUrl) => {
      window.location.hash = `${REPLAY_HASH}?tape=${encodeURIComponent(tapeUrl)}`;
    },
    onBack: goHome,
    ...buttonSound(engine),
  });
};

/** One tape, rendered at the tick its URL asked for. */
const showReplay = async (engine: CreationEngine): Promise<void> => {
  const { ReplayScreen } = await import('./app/screens/ReplayScreen');
  await engine.navigation.showScreen(ReplayScreen, {
    onBack: goHome,
    standInArt: standInArt(),
    ...buttonSound(engine),
  });
};

/**
 * The golden digest, run in this browser. It is imported dynamically, the way
 * the prototypes already are, or src/dev/digest.ts lands in the boot chunk of
 * every player's first load.
 */
const showDigest = async (engine: CreationEngine): Promise<void> => {
  const { DigestScreen } = await import('./app/screens/DigestScreen');
  await engine.navigation.showScreen(DigestScreen, {
    onBack: goHome,
    ...buttonSound(engine),
  });
};

/**
 * Round 0's frame budget, measured in this browser (#39). Imported dynamically
 * for the same reason the digest is: the instrument reaches src/dev, and a
 * static import would put the synthetic field in the boot chunk of every
 * player's first load.
 */
const showFrameBudget = async (engine: CreationEngine): Promise<void> => {
  const { FrameBudgetScreen } = await import('./app/screens/FrameBudgetScreen');
  await engine.navigation.showScreen(FrameBudgetScreen, {
    onBack: goHome,
    drawField: (field) => engine.renderer.render({ container: field }),
    ...buttonSound(engine),
  });
};

/**
 * A route kind no branch above answers, which the Route union makes impossible:
 * add a kind without a showing and this call stops compiling. Reaching it at
 * run time is a bug rather than a bad URL, because resolveRoute answers every
 * unknown hash with the game.
 */
const noShowingForRoute = (route: never): never => {
  throw new Error(`unhandled route: ${JSON.stringify(route)}`);
};

/**
 * The showing a hash asks for, resolved before it is performed so a route whose
 * hash went stale while its module loaded can step aside. Every route kind is
 * answered here and the compiler holds that: a new kind with no branch fails to
 * build rather than landing silently on the title screen.
 */
const resolveShowing = async (
  engine: CreationEngine,
  hash: string,
): Promise<() => Promise<void>> => {
  const route = resolveRoute(hash);
  if (route.kind === 'prototype') {
    const screen = await route.entry.load();
    return () => engine.navigation.showScreen(screen);
  }
  if (route.kind === 'prototype-list') return () => showPrototypes(engine);
  if (route.kind === 'digest') return () => showDigest(engine);
  if (route.kind === 'replay') return () => showReplay(engine);
  if (route.kind === 'runs') return () => showRuns(engine);
  if (route.kind === 'frame-budget') return () => showFrameBudget(engine);
  if (route.kind === 'game') return () => showTitle(engine);
  return noShowingForRoute(route);
};

/**
 * Answers every navigation the URL fragment can produce: boot, in-app hash
 * writes, and the browser's back and forward buttons alike. The fragment is
 * the single navigation authority between the game and the prototypes, and
 * buttons only signal outward; screens inside the game navigate through the
 * graph above and never touch it. Routes are chained so two showings can never
 * interleave, and a route whose hash went stale while its module loaded steps
 * aside.
 */
const startRouter = (engine: CreationEngine): Promise<void> => {
  let pending: Promise<void> = Promise.resolve();
  const route = async () => {
    const hash = window.location.hash;
    const show = await resolveShowing(engine, hash);
    if (window.location.hash !== hash) return;
    await show();
  };
  const queueRoute = () => {
    pending = pending.then(route).catch((error) => console.error(error));
  };
  window.addEventListener('hashchange', queueRoute);
  queueRoute();
  return pending;
};

const main = async (): Promise<void> => {
  const engine = await initEngine();
  applySavedVolumes(engine.audio);
  attachFpsMeter(engine);
  // The load screen holds the stage while the router resolves the first route.
  await engine.navigation.showScreen(LoadScreen);
  await startRouter(engine);
};

main().catch((error) => console.error(error));
