/**
 * Synthesizes this dispatch's five placeholder sound effects into
 * raw-assets/main{m}/sounds, from where AssetPack builds them into the loaded
 * bundle.
 *
 * They are generated rather than sourced, so there is no licensing question and
 * a regeneration is a diff rather than a binary anyone has to trust. Placeholder
 * audio is the standing expectation here exactly as placeholder art is, and
 * nothing owns replacing these five past this dispatch.
 *
 * Run with: node scripts/make-sounds.mjs
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RATE = 44100;
const OUT = join(import.meta.dirname, '..', 'raw-assets', 'main{m}', 'sounds');

/** One partial of an inharmonic bell, as a frequency and how loudly it enters. */
function partial(frequency, gain, decay) {
  return { frequency, gain, decay };
}

/**
 * A struck-metal voice: a few inharmonic partials under an exponential decay.
 *
 * Inharmonic is what makes it a bell rather than a note. The ratios are the
 * classic ones for a struck bar, and a chime is the same shape shorter and
 * brighter, which is why one function makes all five clips.
 */
function strike(seconds, partials, attack = 0.002) {
  const samples = Math.floor(seconds * RATE);
  const data = new Float32Array(samples);
  for (let index = 0; index < samples; index++) {
    const t = index / RATE;
    let value = 0;
    for (const p of partials) {
      value +=
        p.gain *
        Math.sin(2 * Math.PI * p.frequency * t) *
        Math.exp(-t / p.decay);
    }
    const envelope = t < attack ? t / attack : 1;
    data[index] = value * envelope;
  }
  return data;
}

/** Filtered noise under a decay, which is what a body impact and an eruption are. */
function rumble(seconds, cutoff, decay) {
  const samples = Math.floor(seconds * RATE);
  const data = new Float32Array(samples);
  let previous = 0;
  // A one-pole low pass, so the noise reads as weight rather than as hiss.
  const alpha = Math.min(1, cutoff / (RATE / 2));
  for (let index = 0; index < samples; index++) {
    const t = index / RATE;
    const white = Math.random() * 2 - 1;
    previous += alpha * (white - previous);
    data[index] = previous * Math.exp(-t / decay);
  }
  return data;
}

function mix(...tracks) {
  const length = Math.max(...tracks.map((track) => track.length));
  const out = new Float32Array(length);
  for (const track of tracks) {
    for (let index = 0; index < track.length; index++)
      out[index] += track[index];
  }
  return out;
}

/** Scales the loudest sample to just under full, so nothing clips on any device. */
function normalize(data, peak = 0.89) {
  let loudest = 0;
  for (const sample of data) loudest = Math.max(loudest, Math.abs(sample));
  if (loudest === 0) return data;
  const scale = peak / loudest;
  for (let index = 0; index < data.length; index++) data[index] *= scale;
  return data;
}

/** A 16-bit mono PCM wav, which is the format AssetPack's audio pipe takes. */
function wav(data) {
  const bytes = data.length * 2;
  const buffer = Buffer.alloc(44 + bytes);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + bytes, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(RATE, 24);
  buffer.writeUInt32LE(RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  for (let index = 0; index < data.length; index++) {
    const clamped = Math.max(-1, Math.min(1, data[index]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + index * 2);
  }
  return buffer;
}

const CLIPS = {
  // Every swallow, from the very first, whatever the loadout.
  'sfx-swallow': strike(0.28, [
    partial(523, 0.6, 0.09),
    partial(1046, 0.3, 0.06),
    partial(1571, 0.14, 0.04),
  ]),
  // A drop. Brighter and longer than the corpse chime, because the scarcest
  // object in the game must not sound like the commonest.
  'sfx-treasure': strike(0.75, [
    partial(784, 0.55, 0.28),
    partial(1176, 0.35, 0.22),
    partial(1568, 0.24, 0.16),
    partial(2352, 0.12, 0.1),
  ]),
  // The bell's toll: low, inharmonic, and long.
  'sfx-toll': strike(1.6, [
    partial(196, 0.7, 0.85),
    partial(392, 0.4, 0.55),
    partial(553, 0.25, 0.4),
    partial(784, 0.15, 0.3),
    partial(1067, 0.08, 0.2),
  ]),
  // The hit. ADR 0014's own text makes the rim the second damage channel until
  // sound arrives, and this is where sound arrives.
  'sfx-hit': mix(
    rumble(0.22, 900, 0.06),
    strike(0.22, [partial(110, 0.5, 0.05), partial(146, 0.3, 0.04)]),
  ),
  // The eruption: the single loudest thing the player can do.
  'sfx-eruption': mix(
    rumble(1.1, 500, 0.32),
    strike(1.1, [
      partial(58, 0.8, 0.4),
      partial(87, 0.4, 0.3),
      partial(131, 0.2, 0.2),
    ]),
  ),
};

for (const [name, data] of Object.entries(CLIPS)) {
  const path = join(OUT, `${name}.wav`);
  writeFileSync(path, wav(normalize(data)));
  console.log(`wrote ${path} (${(data.length / RATE).toFixed(2)}s)`);
}
