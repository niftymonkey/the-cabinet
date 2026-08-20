/**
 * The two lifecycle rules a screen has to hold. Its transition guard comes
 * back down when the navigation rejects, because left up it deafens every
 * retry and on the game screen holds the ticker's work stopped for the rest of
 * the run. And its reset() is idempotent, because a pooled screen is reset
 * once by navigation and again by Pool.return.
 */

import { Container } from "pixi.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { showScreen } = vi.hoisted(() => ({ showScreen: vi.fn() }));

vi.mock("../getEngine", () => ({
  engine: () => ({ navigation: { showScreen } }),
}));

/** The real widgets need a renderer: text metrics and a loaded texture. */
vi.mock("../ui/Label", () => ({
  Label: class extends Container {
    public text = "";
  },
}));

vi.mock("../ui/Button", () => ({
  Button: class extends Container {
    public onPress = { connect: (handler: () => void) => void handler };
  },
}));

import { EndScreen } from "./EndScreen";
import { GameScreen } from "./game/GameScreen";
import { TitleScreen } from "./TitleScreen";

const keyHandlers = new Set<(event: KeyboardEvent) => void>();

// The screens bind their keys on window, which node does not have.
Object.defineProperty(globalThis, "window", {
  value: {
    addEventListener: (_type: string, handler: (e: KeyboardEvent) => void) =>
      keyHandlers.add(handler),
    removeEventListener: (_type: string, handler: (e: KeyboardEvent) => void) =>
      keyHandlers.delete(handler),
  },
  configurable: true,
});

function press(key: string): void {
  for (const handler of [...keyHandlers]) handler({ key } as KeyboardEvent);
}

/** Waits for the rejection handler, which runs a microtask after the press. */
async function settle(): Promise<void> {
  await vi.waitFor(() => expect(console.error).toHaveBeenCalled());
}

describe("a screen whose navigation rejects", () => {
  beforeEach(() => {
    keyHandlers.clear();
    showScreen.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("the title screen offers the way in again", async () => {
    showScreen.mockRejectedValueOnce(new Error("no screen"));
    const screen = new TitleScreen();
    screen.prepare();

    press("Enter");
    await settle();

    showScreen.mockResolvedValueOnce(undefined);
    press("Enter");
    expect(showScreen).toHaveBeenCalledTimes(2);
  });

  it("the end screen offers another run again", async () => {
    showScreen.mockRejectedValueOnce(new Error("no screen"));
    const screen = new EndScreen();
    screen.prepare();

    press("Enter");
    await settle();

    showScreen.mockResolvedValueOnce(undefined);
    press("Enter");
    expect(showScreen).toHaveBeenCalledTimes(2);
  });

  it("the game screen lets the run be ended again", async () => {
    showScreen.mockRejectedValueOnce(new Error("no screen"));
    const screen = new GameScreen();
    screen.prepare();

    press("Escape");
    await settle();

    showScreen.mockResolvedValueOnce(undefined);
    press("Escape");
    expect(showScreen).toHaveBeenCalledTimes(2);
  });

  it("the game screen keeps stepping the sim while it is still playing", async () => {
    showScreen.mockRejectedValueOnce(new Error("no screen"));
    const screen = new GameScreen();
    screen.prepare();

    press("Escape");
    await settle();
    screen.update();
    screen.update();

    expect(screen["run"]?.tick).toBe(2);
  });
});

describe("a screen on its way back to the pool", () => {
  beforeEach(() => keyHandlers.clear());

  it("the title screen's reset runs twice and still unbinds its key", () => {
    const screen = new TitleScreen();
    screen.prepare();
    expect(keyHandlers.size).toBe(1);

    screen.reset();
    screen.reset();

    expect(keyHandlers.size).toBe(0);
  });

  it("the end screen's reset runs twice and still unbinds its key", () => {
    const screen = new EndScreen();
    screen.prepare();
    expect(keyHandlers.size).toBe(1);

    screen.reset();
    screen.reset();

    expect(keyHandlers.size).toBe(0);
  });

  it("the game screen's reset runs twice and still drops the run", () => {
    const screen = new GameScreen();
    screen.prepare();
    expect(keyHandlers.size).toBe(1);

    screen.reset();
    screen.reset();

    expect(keyHandlers.size).toBe(0);
    expect(screen["run"]).toBeNull();
  });
});
