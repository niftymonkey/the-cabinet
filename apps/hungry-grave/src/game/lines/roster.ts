// The four weapon lines as identity and levels. The file is roster.ts and not
// lines.ts, because lines/lines.ts stutters beside lines/skullStream.ts.

type WeaponLine = 'skullStream' | 'territory' | 'wisps' | 'bell';

const WEAPON_LINES: readonly WeaponLine[] = [
  'skullStream',
  'territory',
  'wisps',
  'bell',
];

// The lines a run starts with (glossary: birthright). The floor's ladder strips back to exactly these (ADR 0045).
const BIRTHRIGHT: readonly WeaponLine[] = ['skullStream'];

const MAX_LEVEL = 5;

/**
 * Whether every name is a line this build implements, and together they are a
 * roster a run could be born into (ADR 0043, ADR 0046).
 *
 * A subset of the pool and not an exact set. A run fields a roster drawn from a
 * growing pool, so a roster naming fewer lines than the pool holds is an
 * ordinary run this build can field, and the lines it does not name are simply
 * lines that run never had.
 *
 * Three things are still refused. A name this build has no line for, which is
 * the build's limit rather than the tape's. A name given twice, which is not a
 * roster at all. And a roster short of a birthright line: the birthright is
 * what every run is born holding, so a roster without it describes a run that
 * starts with nothing and that the level invariant would fault on its first
 * tick.
 */
const implementsLines = (names: readonly string[]): boolean => {
  const named = new Set(names);
  if (named.size !== names.length) return false;
  const pool: readonly string[] = WEAPON_LINES;
  if (!names.every((name) => pool.includes(name))) return false;
  return BIRTHRIGHT.every((line) => named.has(line));
};

export { WEAPON_LINES, BIRTHRIGHT, MAX_LEVEL, implementsLines };
export type { WeaponLine };
