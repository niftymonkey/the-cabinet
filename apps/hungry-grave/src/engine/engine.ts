import { sound } from '@pixi/sound';
import type {
  ApplicationOptions,
  DestroyOptions,
  RendererDestroyOptions,
} from 'pixi.js';
import { Application, Assets, extensions, ResizePlugin } from 'pixi.js';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - This is a dynamically generated file by AssetPack
import manifest from '../manifest.json';

import { CreationAudioPlugin } from './audio/AudioPlugin';
import { CreationNavigationPlugin } from './navigation/NavigationPlugin';
import { CreationResizePlugin } from './resize/ResizePlugin';
import { getResolution } from './utils/getResolution';

// The element the page gives the engine to measure, beside the one it gives it to append the canvas to.
const STAGE_BOX_ID = 'app';

/**
 * The box the renderer is sized from.
 *
 * The element rather than the window, because `globalThis.innerHeight` tracks
 * the dynamic viewport on iOS: a renderer sized from the window re-fits its
 * stage mid-run as the browser's chrome retracts, whatever height the page's own
 * stylesheet asks for, so the element is what makes a small-viewport height
 * reach the canvas at all. A page with no such element is measured from the
 * window, which is the stock behaviour, and the fall back is said out loud
 * because it is the case where the stage moves under a run.
 */
const measuredBox = (): Window | HTMLElement => {
  const box = document.getElementById(STAGE_BOX_ID);
  if (box !== null) return box;
  console.warn(
    `there is no #${STAGE_BOX_ID} element to measure, so the renderer is sized from the window instead; the stage will re-fit whenever the browser's chrome moves`,
  );
  return window;
};

/**
 * Swaps Pixi's stock resize handling for the engine's own and adds the audio
 * and navigation plugins the engine's API is built on. Application reads the
 * plugin list inside init(), so this has to have run before an engine is
 * initialised.
 */
const registerEnginePlugins = (): void => {
  extensions.remove(ResizePlugin);
  extensions.add(CreationResizePlugin);
  extensions.add(CreationAudioPlugin);
  extensions.add(CreationNavigationPlugin);
};

/**
 * The main creation engine class.
 *
 * This is a lightweight wrapper around the PixiJS Application class.
 * It provides a few additional features such as:
 * - Navigation manager
 * - Audio manager
 * - Resize handling
 * - Visibility change handling (pause/resume sounds)
 *
 * It also initializes the PixiJS application and loads any assets in the `preload` bundle.
 */
export class CreationEngine extends Application {
  /** Initialize the application */
  public async init(opts: Partial<ApplicationOptions>): Promise<void> {
    opts.resizeTo ??= measuredBox();
    opts.resolution ??= getResolution();

    await super.init(opts);

    // Append the application canvas to the document body
    document.getElementById('pixi-container')!.appendChild(this.canvas);
    // Add a visibility listener, so the app can pause sounds and screens
    document.addEventListener('visibilitychange', this.visibilityChange);

    // Init PixiJS assets with this asset manifest
    await Assets.init({ manifest, basePath: 'assets' });
    await Assets.loadBundle('preload');

    // List all existing bundles names
    const allBundles = manifest.bundles.map((item) => item.name);
    // Start up background loading of all bundles
    Assets.backgroundLoadBundle(allBundles);
  }

  public override destroy(
    rendererDestroyOptions: RendererDestroyOptions = false,
    options: DestroyOptions = false,
  ): void {
    document.removeEventListener('visibilitychange', this.visibilityChange);
    super.destroy(rendererDestroyOptions, options);
  }

  /** Fire when document visibility changes - lose or regain focus */
  protected visibilityChange = () => {
    if (document.hidden) {
      sound.pauseAll();
      this.navigation.blur();
    } else {
      sound.resumeAll();
      this.navigation.focus();
    }
  };
}

export { measuredBox, registerEnginePlugins };
