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
   * The dexterity error, as the largest number of ticks a decided command may
   * be held stale. The hold is drawn uniformly from 0 to this bound inclusive,
   * and a bound of zero draws nothing at all.
   *
   * Nothing reads it until slice 5, which is where the hold and its stream
   * land. It is on the row here because a row with a field missing is a
   * different row, and the sharp corner's own value is zero either way.
   */
  readonly holdBound: number;
  // The strategy error, as the look-ahead samples in ticks ahead, shortened from the far end.
  readonly lookaheadSamples: readonly number[];
  // Live shots on the field that make a belch worth spending.
  readonly belchWorthIt: number;
  // Clearance past which a move counts as safe and the wanting decides instead.
  readonly enoughClearance: number;
}

/**
 * A hand word and a head word, said in that order, and never a number.
 *
 * One name and not nine: the other eight rows land at slice 5 with the hold
 * that makes six of them differ from their head-only siblings. A row whose
 * knob nothing reads would be a second name for a hand already here.
 */
type ConfigurationName = 'steady-far';

/**
 * The rows, keyed by name.
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
    holdBound: 0,
    lookaheadSamples: [5, 12, 20, 30],
    belchWorthIt: 8,
    enoughClearance: 12,
  },
};

const CONFIGURATION_NAMES: readonly ConfigurationName[] = ['steady-far'];

/**
 * The sharp corner: the base policy with both knobs at no error, which is the
 * best this hand plays. A finding has to agree across it and the sloppy
 * corner, which arrives with the other eight rows.
 */
const SHARP_HAND: ConfigurationName = 'steady-far';

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
  RESERVED_POLICIES,
  isConfigurationName,
};
export type { Configuration, ConfigurationName };
