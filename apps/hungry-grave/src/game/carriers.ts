// What a carrier is worth to the schedule, and which of a wave's mobs carries
// (ADR 0002, ADR 0048).

import {
  BIRTHRIGHT,
  BIRTHRIGHT_LEVEL,
  MAX_LEVEL,
  WEAPON_LINES,
} from './lines/roster';

/**
 * A carrier schedule wave: which of a stage wave's mobs carry the offer.
 *
 * A list rather than one index, because step 2 authors the schedule and a wave
 * that carries more than once is a shape it may want; today every carrying wave
 * holds exactly one.
 */
interface WaveCarriers {
  // Indices into the stage wave's placement order that carry. Deterministic and authored.
  readonly carrying: readonly number[];
}

/**
 * How many carriers a run must kill to reach every line's top level.
 *
 * Derived from the roster rather than authored as a magnitude: a birthright
 * line is born partway up its ladder and every other line is bought from
 * nothing, so a fifth line moves this number and the schedule above it with no
 * edit here.
 */
const carriersForFullBuild = (): number => {
  const fromBirthright = (MAX_LEVEL - BIRTHRIGHT_LEVEL) * BIRTHRIGHT.length;
  const fromUnowned = MAX_LEVEL * (WEAPON_LINES.length - BIRTHRIGHT.length);
  return fromBirthright + fromUnowned;
};

/**
 * How much more than a full build the schedule holds, so missing a carrier
 * costs a step rather than the run (ADR 0048). An initial data row, bounded by
 * the two shipped ends the ADR cites: DoDonPachi's four carriers are the tight
 * end and Touhou's roughly two stages of surplus is well over 100 percent, and
 * thirty percent sits at the tight end of that band, which is what a
 * five-minute single stage is.
 */
const CARRIER_SLACK = 1.3;

/**
 * How many the schedule must hold, full build plus the slack (ADR 0048).
 *
 * Rounded up rather than down, because a schedule holds whole carriers and
 * rounding down would spend part of the slack the ADR asks for.
 */
const carriersScheduled = (): number => {
  return Math.ceil(carriersForFullBuild() * CARRIER_SLACK);
};

/**
 * Which of a wave's mobs carry: the middle of its placement order, one per
 * carrying wave.
 *
 * The middle rather than the leader, so a Pincer's symmetry is not broken by
 * the carrier riding at the head of one arm. The position is the wave's
 * placement order and not the SpawnOrder's own index, which a mirrored
 * formation repeats once per arm and would put a carrier on each of them.
 */
const waveCarriers = (waveCarries: boolean, count: number): WaveCarriers => {
  if (!waveCarries || count <= 0) return { carrying: [] };
  return { carrying: [Math.floor(count / 2)] };
};

// Whether the mob at this position in a wave's placement order carries.
const carriesAt = (wave: WaveCarriers, position: number): boolean => {
  return wave.carrying.includes(position);
};

export {
  carriersForFullBuild,
  carriersScheduled,
  waveCarriers,
  carriesAt,
  CARRIER_SLACK,
};
export type { WaveCarriers };
