import { Application, Container, FillGradient, Graphics, Text } from 'pixi.js';

export interface RoomHandle {
  destroy(): void;
}

// The room is PixiJS's side of the seam (Housewarming ADR 0002): React mounts it
// once and never re-renders it; everything past this call is driven by the ticker.
export async function createRoom(host: HTMLElement): Promise<RoomHandle> {
  const app = new Application();
  await app.init({
    background: '#0a0d15',
    resizeTo: host,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  host.appendChild(app.canvas);

  const glowGradient = new FillGradient({
    type: 'radial',
    center: { x: 0.5, y: 0.5 },
    innerRadius: 0,
    outerCenter: { x: 0.5, y: 0.5 },
    outerRadius: 0.5,
    colorStops: [
      { offset: 0, color: 'rgba(255, 205, 130, 0.45)' },
      { offset: 0.3, color: 'rgba(255, 170, 90, 0.16)' },
      { offset: 0.7, color: 'rgba(200, 120, 60, 0.04)' },
      { offset: 1, color: 'rgba(160, 90, 50, 0)' },
    ],
  });
  const glow = new Graphics().circle(0, 0, 220).fill(glowGradient);
  glow.blendMode = 'add';

  const flameHalo = new Graphics()
    .ellipse(0, 0, 11, 17)
    .fill({ color: 0xffb45e, alpha: 0.55 });
  flameHalo.blendMode = 'add';

  const flameCore = new Graphics().ellipse(0, 0, 5, 9).fill(0xfff3d8);
  flameCore.blendMode = 'add';

  const waxGradient = new FillGradient({
    colorStops: [
      { offset: 0, color: '#f2e6ca' },
      { offset: 0.35, color: '#b3a88e' },
      { offset: 1, color: '#33343c' },
    ],
  });
  const wax = new Graphics()
    .roundRect(-15, 14, 30, 88, 7)
    .fill(waxGradient)
    .ellipse(0, 15, 15, 5)
    .fill('#f7edd6')
    .rect(-1, 4, 2, 11)
    .fill('#3c3428');

  const candle = new Container();
  candle.addChild(glow, wax, flameHalo, flameCore);

  const title = new Text({
    text: 'Housewarming',
    style: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: 42,
      letterSpacing: 8,
      fill: '#d9d2c4',
    },
  });
  title.anchor.set(0.5);
  title.alpha = 0.85;

  const fps = new Text({
    text: '',
    style: { fontFamily: 'monospace', fontSize: 13, fill: '#5d6678' },
  });
  fps.position.set(12, 10);

  app.stage.addChild(candle, title, fps);

  const place = () => {
    const { width, height } = app.screen;
    candle.position.set(width / 2, height / 2 + 60);
    title.position.set(width / 2, height / 2 - 110);
  };
  place();
  app.renderer.on('resize', place);

  let time = 0;
  let fpsElapsed = 0;
  app.ticker.add((ticker) => {
    time += ticker.deltaMS / 1000;
    fpsElapsed += ticker.deltaMS;
    if (fpsElapsed >= 500) {
      fps.text = `${Math.round(ticker.FPS)} fps`;
      fpsElapsed = 0;
    }
    const gutter =
      Math.sin(time * 6.3) * 0.04 +
      Math.sin(time * 17) * 0.025 +
      Math.sin(time * 2.1) * 0.035;
    glow.scale.set(1 + gutter * 1.5);
    glow.alpha = 0.9 + gutter;
    flameCore.scale.set(1 - gutter, 1 + gutter * 2.5);
    flameHalo.scale.set(1 + gutter * 0.5, 1 + gutter * 1.5);
    flameHalo.skew.x = Math.sin(time * 3.7) * 0.06;
    title.alpha = 0.85 + gutter * 0.6;
  });

  return {
    destroy() {
      app.destroy(true, { children: true });
    },
  };
}
