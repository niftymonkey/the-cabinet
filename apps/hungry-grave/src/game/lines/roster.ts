/**
 * The four weapon lines as identity and levels. Their behaviour is dispatch 5,
 * and this folder exists now so that dispatch has one place to fill.
 *
 * The file is roster.ts and not lines.ts: lines/lines.ts stutters beside the
 * lines/soulStream.ts and friends dispatch 5 adds.
 */

export type WeaponLine = "soulStream" | "headstones" | "wisps" | "bell";

export const WEAPON_LINES: readonly WeaponLine[] = [
  "soulStream",
  "headstones",
  "wisps",
  "bell",
];

/** The lines a run starts with (glossary: birthright). The floor's ladder strips back to exactly these. */
export const BIRTHRIGHT: readonly WeaponLine[] = ["soulStream", "headstones"];

export const MAX_LEVEL = 5;
