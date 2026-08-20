import { FpsMeter } from "./app/FpsMeter";
import { setEngine } from "./app/getEngine";
import { FIELD_HEIGHT, FIELD_WIDTH } from "./app/layout";
import { PALETTE } from "./app/palette";
import { resolveRoute } from "./app/routes";
import { LoadScreen } from "./app/screens/LoadScreen";
import { PrototypesScreen } from "./app/screens/PrototypesScreen";
import { TitleScreen } from "./app/screens/TitleScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";

/**
 * Importing these modules will automatically register their plugins with the engine.
 */
import "@pixi/sound";

async function initEngine(): Promise<CreationEngine> {
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
}

/**
 * Puts the frame-rate readout on the stage, above every screen. Navigation
 * adds its own container to the stage lazily, when the first screen is shown
 * (src/engine/navigation/navigation.ts), so a meter added earlier would end up
 * underneath it. zIndex settles the order by rule instead of by who was added
 * first, and holds however the screens are later reshuffled.
 */
function attachFpsMeter(engine: CreationEngine): void {
  const meter = new FpsMeter();
  meter.zIndex = 1;
  engine.stage.sortableChildren = true;
  engine.stage.addChild(meter);
  engine.ticker.add(meter.update, meter);
}

async function resolveScreen(hash: string) {
  const route = resolveRoute(hash);
  if (route.kind === "prototype") return await route.entry.load();
  if (route.kind === "prototype-list") return PrototypesScreen;
  return TitleScreen;
}

/**
 * Answers every navigation the URL fragment can produce: boot, in-app hash
 * writes, and the browser's back and forward buttons alike. The fragment is
 * the single navigation authority between the game and the prototypes, and
 * buttons only assign location.hash; screens inside the game navigate directly
 * and never touch it. Routes are chained so two showScreen calls can never
 * interleave, and a route whose hash went stale while its module loaded steps
 * aside.
 */
function startRouter(engine: CreationEngine): Promise<void> {
  let pending: Promise<void> = Promise.resolve();
  const route = async () => {
    const hash = window.location.hash;
    const screen = await resolveScreen(hash);
    if (window.location.hash !== hash) return;
    await engine.navigation.showScreen(screen);
  };
  const queueRoute = () => {
    pending = pending.then(route).catch((error) => console.error(error));
  };
  window.addEventListener("hashchange", queueRoute);
  queueRoute();
  return pending;
}

async function main(): Promise<void> {
  const engine = await initEngine();
  userSettings.init();
  attachFpsMeter(engine);
  // The load screen holds the stage while the router resolves the first route.
  await engine.navigation.showScreen(LoadScreen);
  await startRouter(engine);
}

main().catch((error) => console.error(error));
