import { setEngine } from "./app/getEngine";
import { runState } from "./app/runState";
import { LoadScreen } from "./app/screens/LoadScreen";
import { TitleScreen } from "./app/screens/TitleScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";

/**
 * Importing these modules will automatically register there plugins with the engine.
 */
import "@pixi/sound";
// import "@esotericsoftware/spine-pixi-v8";

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

(async () => {
  // The run seed is shareable through the URL, so every tester can play the
  // identical run (decision-log entry 5: named seeded streams).
  const seedParam = new URLSearchParams(window.location.search).get("seed");
  const seed = seedParam === null ? 42 : Number(seedParam);
  if (Number.isFinite(seed)) runState.seed = seed;

  // Initialize the creation engine instance. The minimum size is the sim's
  // fixed logical field (540x760 units, decision-log entry 6.3).
  await engine.init({
    background: "#0e1119",
    resizeOptions: { minWidth: 540, minHeight: 760, letterbox: false },
  });

  // Initialize the user settings
  userSettings.init();

  // Show the load screen
  await engine.navigation.showScreen(LoadScreen);
  // Show the title screen once the load screen is dismissed
  await engine.navigation.showScreen(TitleScreen);
})();
