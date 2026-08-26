/**
 * Binds a key for a screen and returns the release. Screens are pooled and
 * reused (see src/engine/navigation/navigation.ts), so a binding made in one
 * lifecycle hook must be released in its pair. Handing back the release rather
 * than exposing the handler keeps the two from drifting apart.
 */
const bindKeyPress = (key: string, action: () => void): (() => void) => {
  const handler = (event: KeyboardEvent) => {
    if (event.key !== key) return;
    action();
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
};

export { bindKeyPress };
