import { setEngine } from "./app/getEngine";
import { LoadScreen } from "./app/screens/LoadScreen";
import { PrototypesScreen } from "./app/screens/PrototypesScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";
import { prototypeFromHash } from "./prototypes";

/**
 * Importing these modules will automatically register there plugins with the engine.
 */
import "@pixi/sound";
// import "@esotericsoftware/spine-pixi-v8";

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await engine.init({
    background: "#0e1119",
    resizeOptions: { minWidth: 540, minHeight: 760, letterbox: false },
  });

  // Initialize the user settings
  userSettings.init();

  // Show the load screen
  await engine.navigation.showScreen(LoadScreen);
  // The URL fragment is the single navigation authority between the list and
  // a prototype: buttons only assign location.hash, and this router answers
  // boot, in-app hash writes, and the browser's back and forward buttons
  // alike. Screens inside one prototype navigate directly and never touch
  // the hash.
  // Routes are chained so two showScreen calls can never interleave, and a
  // route whose hash went stale while its module loaded steps aside.
  let pending: Promise<void> = Promise.resolve();
  const route = async () => {
    const hash = window.location.hash;
    const entry = prototypeFromHash(hash);
    const screen = entry ? await entry.load() : PrototypesScreen;
    if (window.location.hash !== hash) return;
    await engine.navigation.showScreen(screen);
  };
  const queueRoute = () => {
    pending = pending.then(route).catch((error) => console.error(error));
  };
  window.addEventListener("hashchange", queueRoute);
  queueRoute();
  await pending;
})().catch((error) => console.error(error));
