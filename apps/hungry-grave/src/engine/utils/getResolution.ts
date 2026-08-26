export function getResolution(): number {
  let resolution = Math.max(window.devicePixelRatio, 2);

  if (resolution % 1 !== 0) {
    console.warn(
      `the device pixel ratio is ${window.devicePixelRatio}, which is no whole number of pixels; the renderer runs at 2 instead, so the canvas is a little softer than this display could show`,
    );
    resolution = 2;
  }

  return resolution;
}
