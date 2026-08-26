// Synthesized WebAudio blips for the slice: no sound files exist yet, the
// rectangles era gets synth tones. Volumes follow the engine's audio
// settings, so the settings popup's sliders govern these too. The baseline
// eat-chime fires on every swallow even before any bell line is drawn
// (decision-log entry 3.2).

import { engine } from '../../app/getEngine';

let ctx: AudioContext | null = null;

export function initSfx(): void {
  if (ctx === null) ctx = new AudioContext();
  // resume() rejects before the first user gesture; the next call retries.
  if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
}

function blip(
  freq: number,
  seconds: number,
  gainPeak: number,
  type: OscillatorType,
  slideTo?: number,
): void {
  if (ctx === null || ctx.state !== 'running') return;
  const level =
    gainPeak *
    engine().audio.getMasterVolume() *
    engine().audio.sfx.getVolume();
  if (level <= 0.0001) return;
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + seconds);
  }
  gain.gain.setValueAtTime(level, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + seconds);
}

export const sfx = {
  chime(): void {
    blip(660, 0.12, 0.12, 'sine', 880);
  },
  bell(): void {
    blip(330, 0.4, 0.18, 'triangle', 220);
  },
  belch(): void {
    blip(140, 0.5, 0.28, 'sawtooth', 55);
  },
  hit(): void {
    blip(180, 0.15, 0.2, 'square', 90);
  },
  levelUp(): void {
    blip(520, 0.2, 0.14, 'triangle', 1040);
  },
  feast(): void {
    blip(220, 0.6, 0.24, 'triangle', 660);
  },
  sealed(): void {
    blip(200, 1.2, 0.28, 'sawtooth', 40);
  },
};
