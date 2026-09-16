/**
 * Registering the engine's Pixi plugins is a named step, not something an
 * import does behind the caller's back.
 */

import type { ApplicationPlugin } from 'pixi.js';
import { Application, ResizePlugin } from 'pixi.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CreationAudioPlugin } from '../audio/AudioPlugin';
import { CreationNavigationPlugin } from '../navigation/NavigationPlugin';
import { CreationResizePlugin } from '../resize/ResizePlugin';

// Pixi's own application plugins, registered the way the entry point registers
// them. Without this the stock ResizePlugin is never present, and asserting
// that registration removed it would assert nothing.
import 'pixi.js/app';

/**
 * @pixi/sound probes which audio formats the browser can play the moment it is
 * imported (node_modules/@pixi/sound/lib/utils/supported.mjs:27), and the
 * engine's audio plugin imports it. The probe is all the DOM anything in this
 * import graph asks for, so the suite gives it one element rather than a whole
 * document. vi.hoisted runs before the imports above, which is the only place
 * this can be installed from inside the test file.
 */
vi.hoisted(() => {
  Object.defineProperty(globalThis, 'document', {
    value: {
      createElement: () => ({ canPlayType: () => '' }),
      getElementById: () => null,
    },
    configurable: true,
  });
  Object.defineProperty(globalThis, 'window', {
    value: {},
    configurable: true,
  });
});

/**
 * The registration itself, not a proxy for it: extensions.handleByList keeps
 * Application._plugins in step with every ExtensionType.Application add and
 * remove (node_modules/pixi.js/lib/app/Application.mjs:211).
 */
const registeredPlugins = (): ApplicationPlugin[] => [...Application._plugins];

const pluginsAtFileLoad = registeredPlugins();

afterEach(() => {
  Application._plugins.length = 0;
  Application._plugins.push(...pluginsAtFileLoad);
});

describe('the engine module', () => {
  // This case has to run first: a module body executes once, so only the first
  // import of it can observe what that execution did.
  it('importing the engine registers no plugin', async () => {
    // An import that mutates a global registry makes module order load-bearing
    // across the whole app and leaves the engine untestable in isolation, so
    // the mutation belongs to a function a caller chooses to call.
    const before = registeredPlugins();

    await import('../engine');

    expect(registeredPlugins()).toEqual(before);
  });

  it("registering swaps the stock resize plugin for the engine's own", async () => {
    const { registerEnginePlugins } = await import('../engine');

    registerEnginePlugins();

    const plugins = registeredPlugins();
    expect(plugins).toContain(CreationResizePlugin);
    expect(plugins).toContain(CreationAudioPlugin);
    expect(plugins).toContain(CreationNavigationPlugin);
    expect(plugins).not.toContain(ResizePlugin);
  });

  it('registering twice is harmless', async () => {
    // Pixi's handleByList skips an extension whose ref is already in the list,
    // so a second call is redundant rather than corrupting.
    const { registerEnginePlugins } = await import('../engine');

    registerEnginePlugins();
    const afterFirst = registeredPlugins();
    registerEnginePlugins();

    expect(registeredPlugins()).toEqual(afterFirst);
  });
});

describe('the box the renderer measures', () => {
  /** What the page hands the engine, swapped per case. */
  function pageHolding(box: unknown): void {
    Object.defineProperty(globalThis, 'document', {
      value: {
        createElement: () => ({ canPlayType: () => '' }),
        getElementById: (id: string) => (id === 'app' ? box : null),
      },
      configurable: true,
    });
  }

  it('is the page element rather than the window', async () => {
    // The window is what the stock default measures, and `innerHeight` tracks
    // the dynamic viewport on iOS: a renderer sized from the window re-fits its
    // stage mid-run as the browser's chrome retracts, whatever height the
    // page's own stylesheet asks for. Measuring the element is what makes the
    // stylesheet's small-viewport height reach the canvas at all.
    const { measuredBox } = await import('../engine');
    const box = { id: 'app' };
    pageHolding(box);

    expect(measuredBox()).toBe(box);
    expect(measuredBox()).not.toBe(globalThis.window);
  });

  it('falls back to the window on a page with no such element, and says so', async () => {
    const { measuredBox } = await import('../engine');
    pageHolding(null);
    const said = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(measuredBox()).toBe(globalThis.window);

    // Nothing abnormal is silent: what happened, and what it costs.
    const words = said.mock.calls.map((call) => call.join(' ')).join(' ');
    expect(words).toContain('app');
    expect(words).toContain('window');
    said.mockRestore();
  });
});
