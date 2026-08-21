/**
 * Screens are pooled and reused, which src/app/runHandoff.ts and
 * src/app/utils/bindKeyPress.ts both build on. It only holds if a hidden
 * screen goes back to the pool: without the return, every RISE AGAIN builds a
 * fresh screen and orphans the canvas-backed text textures of the old one.
 */

import { Container } from "pixi.js";
import { describe, expect, it } from "vitest";
import type { CreationEngine } from "../engine";
import { Navigation } from "./navigation";

/** Everything navigation touches on the engine: a stage and a ticker. */
function fakeEngine() {
  return {
    stage: new Container(),
    ticker: { add: () => {}, remove: () => {} },
  };
}

function navigationOnFakeEngine(): Navigation {
  const navigation = new Navigation();
  navigation.init(fakeEngine() as unknown as CreationEngine);
  return navigation;
}

/**
 * A screen class of its own, so each test gets its own pool: BigPool keys on
 * the constructor and lives for the whole process.
 */
function screenClass() {
  const built: PooledScreen[] = [];
  class PooledScreen extends Container {
    public armed = false;
    constructor() {
      super();
      built.push(this);
    }
    public prepare() {
      this.armed = true;
    }
    public reset() {
      this.armed = false;
    }
  }
  return { PooledScreen, built };
}

describe("navigation's screen pooling", () => {
  it("a screen shown again is the instance the pool kept", async () => {
    const nav = navigationOnFakeEngine();
    const first = screenClass();
    const second = screenClass();

    await nav.showScreen(first.PooledScreen);
    await nav.showScreen(second.PooledScreen);
    await nav.showScreen(first.PooledScreen);

    expect(first.built).toHaveLength(1);
    expect(nav.currentScreen).toBe(first.built[0]);
  });

  it("a screen is off the stage and reset before the pool takes it", async () => {
    const nav = navigationOnFakeEngine();
    const first = screenClass();
    const second = screenClass();

    await nav.showScreen(first.PooledScreen);
    await nav.showScreen(second.PooledScreen);

    expect(first.built[0].parent).toBeNull();
    expect(first.built[0].armed).toBe(false);
  });

  it("a reused screen is prepared again for its next showing", async () => {
    const nav = navigationOnFakeEngine();
    const first = screenClass();
    const second = screenClass();

    await nav.showScreen(first.PooledScreen);
    await nav.showScreen(second.PooledScreen);
    await nav.showScreen(first.PooledScreen);

    expect(first.built[0].armed).toBe(true);
  });

  it("a screen shown again from the pool gets its children back, with or without a show()", async () => {
    const nav = navigationOnFakeEngine();
    const first = screenClass();
    const second = screenClass();

    await nav.showScreen(first.PooledScreen);
    await nav.showScreen(second.PooledScreen);
    await nav.showScreen(first.PooledScreen);

    // showScreen and hideAndRemoveScreen both take a screen's children away on
    // the way out. Restoring them only inside `if (screen.show)` means a screen
    // that declares no show() never gets them back, so its buttons are dead on
    // every showing after the first while the screen itself still takes
    // pointer events. That reached Mark's phone as a pause button that stopped
    // working partway through a session.
    expect(first.built[0].interactiveChildren).toBe(true);
  });

  it("a popup is pooled too, so returning one is never a one-way trip", async () => {
    const nav = navigationOnFakeEngine();
    const popup = screenClass();

    await nav.presentPopup(popup.PooledScreen);
    await nav.dismissPopup();
    await nav.presentPopup(popup.PooledScreen);

    expect(popup.built).toHaveLength(1);
    expect(nav.currentPopup).toBe(popup.built[0]);
  });
});
