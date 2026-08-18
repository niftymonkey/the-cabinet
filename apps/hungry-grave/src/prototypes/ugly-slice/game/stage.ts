// The authored stage: data rows of phase-local time, template, and count over
// the six named shapes (decision-log entry 5). Count lives on the row so
// density tuning and difficulty modes turn a knob without editing the shapes.

import { createStream, type Rng } from "./rng";
import { ENEMY_FALL_SPEED, FIELD_W } from "./tuning";

export type TemplateName = "drip" | "file" | "v" | "pincer" | "rain" | "wall";

export interface WaveRow {
  t: number;
  template: TemplateName;
  count: number;
}

export interface SpawnOrder {
  t: number;
  x: number;
  vx: number;
  vy: number;
}

// The first 45 seconds are Drips and one File; Files, Vs and Pincers then
// overlap two at a time, Rain joining thin, until the 1:50 drain-out.
export const RAMP_ROWS: readonly WaveRow[] = [
  { t: 2, template: "drip", count: 1 },
  { t: 8, template: "drip", count: 1 },
  { t: 14, template: "drip", count: 1 },
  { t: 20, template: "file", count: 5 },
  { t: 28, template: "drip", count: 2 },
  { t: 34, template: "drip", count: 5 },
  { t: 46, template: "v", count: 5 },
  { t: 50, template: "file", count: 6 },
  { t: 56, template: "pincer", count: 6 },
  { t: 63, template: "v", count: 7 },
  { t: 70, template: "rain", count: 6 },
  { t: 76, template: "pincer", count: 8 },
  { t: 83, template: "v", count: 7 },
  { t: 85, template: "rain", count: 6 },
  { t: 92, template: "file", count: 6 },
  { t: 94, template: "pincer", count: 8 },
  { t: 101, template: "rain", count: 8 },
  { t: 103, template: "v", count: 7 },
];

// The Wall is the feast wave: its clock starts at the Banshee's death and the
// curtain enters about two seconds later, 2.5 to 3 times the front half's
// densest row. The back half then climbs back toward that figure without
// reaching it, to a sustained peak before the 3:50 drain-out.
export const BACKHALF_ROWS: readonly WaveRow[] = [
  { t: 2, template: "wall", count: 22 },
  { t: 10, template: "rain", count: 6 },
  { t: 14, template: "pincer", count: 8 },
  { t: 19, template: "v", count: 7 },
  { t: 23, template: "rain", count: 8 },
  { t: 25, template: "v", count: 7 },
  { t: 30, template: "pincer", count: 8 },
  { t: 31, template: "rain", count: 8 },
  { t: 36, template: "v", count: 7 },
  { t: 38, template: "rain", count: 10 },
  { t: 40, template: "pincer", count: 8 },
  { t: 45, template: "rain", count: 10 },
  { t: 47, template: "v", count: 9 },
  { t: 52, template: "pincer", count: 10 },
  { t: 53, template: "rain", count: 10 },
  { t: 58, template: "v", count: 9 },
  { t: 60, template: "rain", count: 12 },
  { t: 62, template: "pincer", count: 10 },
  { t: 67, template: "rain", count: 12 },
  { t: 68, template: "v", count: 9 },
  { t: 70, template: "pincer", count: 10 },
];

// The Wall's count is the named difficulty knob (entry 5), so the instrument
// threshold derives from it: a belch "landed on the Wall" if it caught at
// least a third of the curtain. A count retune moves the threshold with it.
export const WALL_COUNT = BACKHALF_ROWS.filter(
  (row) => row.template === "wall",
).reduce((sum, row) => sum + row.count, 0);
export const WALL_LANDED_MIN = Math.ceil(WALL_COUNT / 3);

const MARGIN = 40;

function expandRow(row: WaveRow, rng: Rng): SpawnOrder[] {
  const orders: SpawnOrder[] = [];
  const fall = ENEMY_FALL_SPEED;
  switch (row.template) {
    case "drip": {
      // Lone teaching kills.
      for (let i = 0; i < row.count; i++) {
        orders.push({
          t: row.t + i * 1.4,
          x: rng.range(MARGIN, FIELD_W - MARGIN),
          vx: 0,
          vy: fall * 0.9,
        });
      }
      break;
    }
    case "file": {
      // A single-file lane whose corpses land in a trail that teaches the dive.
      const x = rng.range(MARGIN, FIELD_W - MARGIN);
      for (let i = 0; i < row.count; i++) {
        orders.push({ t: row.t + i * 0.55, x, vx: 0, vy: fall * 1.05 });
      }
      break;
    }
    case "v": {
      // A spreading chevron that makes you pick a side.
      const centerX = rng.range(FIELD_W * 0.3, FIELD_W * 0.7);
      orders.push({ t: row.t, x: centerX, vx: 0, vy: fall });
      const ranks = Math.floor(row.count / 2);
      for (let i = 1; i <= ranks; i++) {
        for (const side of [-1, 1]) {
          orders.push({
            t: row.t + i * 0.35,
            x: centerX + side * i * 42,
            vx: side * 14,
            vy: fall,
          });
        }
      }
      break;
    }
    case "pincer": {
      // Two files angling in from opposite corners, forcing you across the middle.
      const perSide = Math.ceil(row.count / 2);
      for (let i = 0; i < perSide; i++) {
        orders.push({ t: row.t + i * 0.5, x: MARGIN, vx: 58, vy: fall * 0.95 });
        if (orders.length - 1 < row.count) {
          orders.push({
            t: row.t + 0.25 + i * 0.5,
            x: FIELD_W - MARGIN,
            vx: -58,
            vy: fall * 0.95,
          });
        }
      }
      orders.length = Math.min(orders.length, row.count);
      break;
    }
    case "rain": {
      // A loose full-width scatter, the density filler.
      for (let i = 0; i < row.count; i++) {
        orders.push({
          t: row.t + rng.range(0, 3),
          x: rng.range(MARGIN, FIELD_W - MARGIN),
          vx: 0,
          vy: fall * rng.range(0.85, 1.15),
        });
      }
      break;
    }
    case "wall": {
      // The one-shot edge-to-edge curtain.
      const step = (FIELD_W - MARGIN * 2) / (row.count - 1);
      for (let i = 0; i < row.count; i++) {
        orders.push({ t: row.t, x: MARGIN + i * step, vx: 0, vy: fall * 0.75 });
      }
      break;
    }
  }
  return orders;
}

export function expandPhase(
  rows: readonly WaveRow[],
  phase: string,
  runSeed: number,
): SpawnOrder[] {
  const orders = rows.flatMap((row, i) =>
    expandRow(row, createStream(runSeed, `place:${phase}:${i}`)),
  );
  return orders.sort((a, b) => a.t - b.t);
}

export function rowsTotalCount(rows: readonly WaveRow[]): number {
  return rows.reduce((sum, row) => sum + row.count, 0);
}

export function densestRowCount(rows: readonly WaveRow[]): number {
  return Math.max(...rows.map((row) => row.count));
}
