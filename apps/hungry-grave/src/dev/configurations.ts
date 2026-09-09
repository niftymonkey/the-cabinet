// The hands the harness plays with, as rows (ADR 0053, CONTEXT.md Configuration).

import { PERSON_POLICY, SCRIPT_POLICY } from '../tape/tape';

/**
 * One hand the harness plays with: the base policy under one value of each
 * knob. The rows are written out and never computed from two axes, so the
 * tuning pass moves one hand without moving the others and a reader sees what
 * a configuration is without composing two tables.
 *
 * Every field is an initial data row that step 4's tuning pass (#39) moves,
 * except that a moved hand row is a new configuration with a new name: a hand
 * changed between two batches would compare two builds through two
 * instruments.
 */
interface Configuration {
  readonly name: ConfigurationName;
  /**
   * The dexterity error, as how often attention fails, in failures per
   * thousand decisions. A rate of zero rolls nothing and never lapses.
   */
  readonly lapsePerMille: number;
  /**
   * The dexterity error's depth: the largest number of ticks a decided command
   * may be held stale once attention has failed. Drawn uniformly from 0 to
   * this bound inclusive, and only on a decision that lapsed.
   */
  readonly lapseBound: number;
  // The strategy error, as the look-ahead samples in ticks ahead, shortened from the far end.
  readonly lookaheadSamples: readonly number[];
  // Live shots on the field that make a belch worth spending.
  readonly belchWorthIt: number;
  // Clearance past which a move counts as safe and the wanting decides instead.
  readonly enoughClearance: number;
}

/** A hand word and a head word, said in that order, and never a number. */
type ConfigurationName =
  | 'steady-far'
  | 'steady-middling'
  | 'steady-short'
  | 'loose-far'
  | 'loose-middling'
  | 'loose-short'
  | 'unsteady-far'
  | 'unsteady-middling'
  | 'unsteady-short'
  | 'wavering-far'
  | 'wavering-middling'
  | 'wavering-short'
  | 'faltering-far'
  | 'faltering-middling'
  | 'faltering-short'
  | 'shaky-far'
  | 'shaky-middling'
  | 'shaky-short';

/**
 * The rows, keyed by name.
 *
 * The dexterity error is a lapse of attention and not a standing slowness: the
 * hand acts on the tick on nearly every decision, and only a failed attention
 * roll holds the last command stale. So the rungs nest, a loose hand being a
 * steady hand on nine decisions in ten, and one shaky run holds steady
 * decisions, loose-sized lapses and shaky-sized lapses at once.
 *
 * The depths are anchored on Counter-Strike's shipped ReactionTime ladder and
 * on this field's own speeds: at 15 ticks a mob shot first covers the grave's
 * own width, and 36 ticks is 600 milliseconds, which is that ladder's Easy
 * rung. The two rates are undefended starting rows, loose sitting just past
 * the degraded end of the measured human range and shaky deliberately past any
 * measured human, so the two corners are readable apart before anything has
 * been measured.
 *
 * The three hands between loose and shaky were added after the ends had been
 * played. At 48 seeds each, `steady-far` reached the Undertaker's phase on 29
 * and `loose-far` on 32, which is one reading within the other's noise, and
 * every shaky rung reached it on none: the ladder was a cliff somewhere inside
 * a gap no batch had ever played. `unsteady`, `wavering` and `faltering` step
 * the rate across that gap and keep the bound at roughly 0.14 of the rate,
 * which is the ratio loose and shaky already sit at. They are rows to measure
 * rather than rows anybody derived, and where the cliff edge belongs is #117.
 *
 * The far list is the same four numbers as bot.ts's LOOKAHEAD_SAMPLES and it
 * is written again rather than imported: the six policies' fixed horizon and
 * the harness's far knob are two facts that happen to agree today, and the day
 * the tuning pass moves one it must not move the other.
 *
 * The clearance is COMMITTING_CLEARANCE's 12 and not ENOUGH_CLEARANCE's 60,
 * for the reason bot.ts measures out loud beside it: above the cap two moves
 * tie on room and the wanting decides, so a hand holding out for 60 never
 * reaches anything inside a swarm and would sit at the birthright.
 */
const CONFIGURATIONS: Readonly<Record<ConfigurationName, Configuration>> = {
  'steady-far': {
    name: 'steady-far',
    lapsePerMille: 0,
    lapseBound: 0,
    lookaheadSamples: [5, 12, 20, 30],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'steady-middling': {
    name: 'steady-middling',
    lapsePerMille: 0,
    lapseBound: 0,
    lookaheadSamples: [5, 12, 20],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'steady-short': {
    name: 'steady-short',
    lapsePerMille: 0,
    lapseBound: 0,
    lookaheadSamples: [5, 12],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'loose-far': {
    name: 'loose-far',
    lapsePerMille: 100,
    lapseBound: 15,
    lookaheadSamples: [5, 12, 20, 30],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'loose-middling': {
    name: 'loose-middling',
    lapsePerMille: 100,
    lapseBound: 15,
    lookaheadSamples: [5, 12, 20],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'loose-short': {
    name: 'loose-short',
    lapsePerMille: 100,
    lapseBound: 15,
    lookaheadSamples: [5, 12],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'unsteady-far': {
    name: 'unsteady-far',
    lapsePerMille: 140,
    lapseBound: 20,
    lookaheadSamples: [5, 12, 20, 30],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'unsteady-middling': {
    name: 'unsteady-middling',
    lapsePerMille: 140,
    lapseBound: 20,
    lookaheadSamples: [5, 12, 20],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'unsteady-short': {
    name: 'unsteady-short',
    lapsePerMille: 140,
    lapseBound: 20,
    lookaheadSamples: [5, 12],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'wavering-far': {
    name: 'wavering-far',
    lapsePerMille: 175,
    lapseBound: 25,
    lookaheadSamples: [5, 12, 20, 30],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'wavering-middling': {
    name: 'wavering-middling',
    lapsePerMille: 175,
    lapseBound: 25,
    lookaheadSamples: [5, 12, 20],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'wavering-short': {
    name: 'wavering-short',
    lapsePerMille: 175,
    lapseBound: 25,
    lookaheadSamples: [5, 12],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'faltering-far': {
    name: 'faltering-far',
    lapsePerMille: 210,
    lapseBound: 30,
    lookaheadSamples: [5, 12, 20, 30],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'faltering-middling': {
    name: 'faltering-middling',
    lapsePerMille: 210,
    lapseBound: 30,
    lookaheadSamples: [5, 12, 20],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'faltering-short': {
    name: 'faltering-short',
    lapsePerMille: 210,
    lapseBound: 30,
    lookaheadSamples: [5, 12],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'shaky-far': {
    name: 'shaky-far',
    lapsePerMille: 250,
    lapseBound: 36,
    lookaheadSamples: [5, 12, 20, 30],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'shaky-middling': {
    name: 'shaky-middling',
    lapsePerMille: 250,
    lapseBound: 36,
    lookaheadSamples: [5, 12, 20],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
  'shaky-short': {
    name: 'shaky-short',
    lapsePerMille: 250,
    lapseBound: 36,
    lookaheadSamples: [5, 12],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
};

const CONFIGURATION_NAMES: readonly ConfigurationName[] = [
  'steady-far',
  'steady-middling',
  'steady-short',
  'loose-far',
  'loose-middling',
  'loose-short',
  'unsteady-far',
  'unsteady-middling',
  'unsteady-short',
  'wavering-far',
  'wavering-middling',
  'wavering-short',
  'faltering-far',
  'faltering-middling',
  'faltering-short',
  'shaky-far',
  'shaky-middling',
  'shaky-short',
];

/**
 * The sharp corner: the base policy with both knobs at no error, which is the
 * best this hand plays. A finding has to agree across it and the sloppy
 * corner, and those two are what the done line names.
 */
const SHARP_HAND: ConfigurationName = 'steady-far';

/** The sloppy corner: attention failing most often, deepest, over the shortest head. */
const SLOPPY_HAND: ConfigurationName = 'shaky-short';

/**
 * The names no configuration may take, because the header writes them for a
 * person and for a scripted wander. Built from the pair the tape format
 * reserves rather than spelling either name a second time.
 */
const RESERVED_POLICIES: readonly string[] = [PERSON_POLICY, SCRIPT_POLICY];

/**
 * Parse at the edge: a shell's argument becomes a name here or is refused
 * here, so nothing inside the harness ever holds a name it has not checked.
 */
const isConfigurationName = (name: string): name is ConfigurationName =>
  CONFIGURATION_NAMES.some((each) => each === name);

export {
  CONFIGURATIONS,
  CONFIGURATION_NAMES,
  SHARP_HAND,
  SLOPPY_HAND,
  RESERVED_POLICIES,
  isConfigurationName,
};
export type { Configuration, ConfigurationName };
