/**
 * One harness run played and sealed (ADR 0017, ADR 0019, ADR 0033, the
 * playing-harness record's sections 4 and 6).
 *
 * The seam is the bytes: everything here reads what a tape file would hold,
 * because the report is a function of the tapes and never of the run state the
 * runner happened to hold in memory (ADR 0057).
 */

import { describe, expect, it, vi } from 'vitest';

import { TICK_HZ } from '../../game/clock';
import { FIELD_HEIGHT } from '../../game/field';
import {
  BIRTHRIGHT,
  BIRTHRIGHT_LEVEL,
  MAX_LEVEL,
  WEAPON_LINES,
} from '../../game/lines/roster';
import {
  GHOUL_DESCENT_FLOOR,
  MOB_TYPES,
  MOB_TYPE_NAMES,
  SPAWN_MARGIN,
} from '../../game/mobs';
import { PHASES } from '../../game/stage/stage';
import { SCROLL_SPEED, SIZE_START } from '../../game/tuning';
import { WITNESS_VERSION } from '../../game/witness';
import { decodeTape } from '../../tape/decode';
import { RECORDER_CHECKPOINT_SPACING } from '../../tape/recorder';
import { CONFIGURATIONS, SHARP_HAND } from '../configurations';
import { playHarnessRun, runTickBudget, RUN_TICK_SLACK } from '../harnessRun';
import { measure } from '../measure';
import { RIGS } from '../rigs';

/** The one row this slice ships, which is the sharp corner. */
const SHARP = CONFIGURATIONS[SHARP_HAND];

/**
 * A seed the sharp hand finishes on well inside the budget, so the tests that
 * need a whole sealed run pay for one run rather than for a budget's worth of
 * ticks. It is fixed so a failure is reproducible and never a flake.
 */
const SEALING_SEED = 202;

/** What the shell would hand the runner: git's answer and the clock's, once. */
const COMMIT_HASH = 'e6f6c0dd2f6a4b5c8d9e0f1a2b3c4d5e6f7a8b9c';
const RECORDED_AT = 1_757_000_000_000;

/**
 * Long because one whole run under the hand is the subject and a verified
 * readback plays it a second time. It is stated on the file rather than raised
 * for the suite, in the shape bot.test.ts and harnessPolicy.test.ts already
 * use.
 */
const ONE_PLAYED_AND_REPLAYED_RUN_MS = 60_000;

/** One harness run under the sharp hand, played once and read by every test here. */
let played: ReturnType<typeof playHarnessRun> | null = null;

const sealingRun = () => {
  played ??= playHarnessRun(
    SHARP,
    RIGS.birthright,
    SEALING_SEED,
    COMMIT_HASH,
    RECORDED_AT,
  );
  return played;
};

/**
 * How long a run may take to cross the whole stage, derived from the phases
 * the way bot.test.ts derives its own budgets, so this file's expectation
 * follows the authored rows instead of restating the module's answer.
 */
const SLOWEST_DESCENT_TICKS =
  (FIELD_HEIGHT +
    SPAWN_MARGIN +
    Math.max(...MOB_TYPE_NAMES.map((type) => MOB_TYPES[type].halfHeight))) /
  (SCROLL_SPEED +
    Math.min(
      MOB_TYPES.shambler.speed,
      MOB_TYPES.revenant.speed,
      GHOUL_DESCENT_FLOOR,
    ));

const budgetOf = (phase: (typeof PHASES)[number]): number => {
  if (phase.rows.length === 0) return SLOWEST_DESCENT_TICKS;
  const lastRow = phase.rows[phase.rows.length - 1];
  if (lastRow === undefined)
    throw new Error('phase.rows is non-empty but its last row is absent');
  return lastRow.t * TICK_HZ + SLOWEST_DESCENT_TICKS;
};

const STAGE_TICKS = Math.ceil(
  PHASES.reduce((total, each) => total + budgetOf(each), 0),
);

/** Ten seconds added to the last row of the first phase, which re-authors it. */
const LENGTHENED_SECONDS = 10;

describe('the harness run', () => {
  it('plays every phase the stage authors before its budget is spent', () => {
    // Test 55, first half. The budget is the stage's own rows plus what they
    // leave falling, scaled by the slack a fight costs. A compiled tick count
    // would be the arithmetic-as-rules the standing rule forbids.
    expect(runTickBudget()).toBe(STAGE_TICKS * RUN_TICK_SLACK);
    // A budget above the worst case and never a prediction of any run: the
    // rows alone bound one crossing and a fight is neither.
    expect(runTickBudget()).toBeGreaterThan(STAGE_TICKS);
  });

  it('grows by exactly what a re-authored phase adds', async () => {
    // Test 55, second half, and the half that has teeth: an equality against
    // a derivation this file repeats passes just as well over a written-down
    // number, because both sides are today's rows. Lengthening a phase and
    // re-importing the module is what a written-down number cannot survive.
    vi.resetModules();
    vi.doMock('../../game/stage/stage', async (importOriginal) => {
      const original =
        await importOriginal<typeof import('../../game/stage/stage')>();
      const [first, ...rest] = original.PHASES;
      if (first === undefined) throw new Error('PHASES is empty');
      const last = first.rows[first.rows.length - 1];
      if (last === undefined) throw new Error('the first phase has no rows');
      return {
        ...original,
        PHASES: [
          {
            ...first,
            rows: [
              ...first.rows.slice(0, -1),
              { ...last, t: last.t + LENGTHENED_SECONDS },
            ],
          },
          ...rest,
        ],
      };
    });

    const lengthened = await import('../harnessRun');
    expect(lengthened.runTickBudget()).toBe(
      runTickBudget() + LENGTHENED_SECONDS * TICK_HZ * RUN_TICK_SLACK,
    );

    vi.doUnmock('../../game/stage/stage');
    vi.resetModules();
  });

  it(
    'names the configuration, the bot device and the conditions it started from in its header',
    () => {
      // Test 56. The harness rig is the only rig that starts at the
      // birthright, which is what #98 asks the hand to play out of, and the
      // header is where a figure recovers which rig produced it.
      const { header } = decodeTape(sealingRun().bytes).tape;

      expect(header.policy).toBe(SHARP.name);
      expect(header.inputDevice).toBe('bot');
      expect(header.startingSize).toBe(SIZE_START);
      expect(header.recordedRoster).toEqual([...WEAPON_LINES]);
      for (const line of WEAPON_LINES) {
        expect(header.startingLevels[line]).toBe(
          BIRTHRIGHT.includes(line) ? BIRTHRIGHT_LEVEL : 0,
        );
      }
    },
    ONE_PLAYED_AND_REPLAYED_RUN_MS,
  );

  it(
    'seals with the ending the run reached rather than as a run somebody quit',
    () => {
      // Test 57. A run that ends before its budget stopped because the game
      // ended, and a trailer saying quit would report the runner's own loop
      // rather than the run.
      const run = sealingRun();
      const { trailer } = decodeTape(run.bytes).tape;

      expect(run.ending).not.toBeNull();
      expect(run.ticks).toBeLessThan(runTickBudget());
      expect(trailer?.ending).toBe(run.ending);
      expect(trailer?.stop).toBe('finished');
    },
    ONE_PLAYED_AND_REPLAYED_RUN_MS,
  );

  it(
    'returns bytes that decode into the tape it was handed the header for',
    () => {
      // Test 58. The commit hash and the recorded-at stamp arrive as
      // arguments, because asking git and asking the clock are the shell's
      // jobs: a Date.now() in here would make one seed's bytes differ on every
      // call and this assertion unrepeatable.
      const run = sealingRun();
      const { header } = decodeTape(run.bytes).tape;

      expect(header.seed).toBe(SEALING_SEED);
      expect(header.commitHash).toBe(COMMIT_HASH);
      expect(header.recordedAt).toBe(RECORDED_AT);
      expect(header.tickRate).toBe(TICK_HZ);
      expect(header.checkpointSpacing).toBe(RECORDER_CHECKPOINT_SPACING);
      expect(header.witnessVersion).toBe(WITNESS_VERSION);
      expect(header.buildIdentity).toBe('');
      expect(header.author).toBe('unknown');
      // Played twice, the same seed under the same hand writes the same bytes.
      const again = playHarnessRun(
        SHARP,
        RIGS.birthright,
        SEALING_SEED,
        COMMIT_HASH,
        RECORDED_AT,
      );
      expect(again.bytes).toEqual(run.bytes);
    },
    ONE_PLAYED_AND_REPLAYED_RUN_MS,
  );

  it(
    'starts from the build its rig names, and plays a different run for it',
    () => {
      // The pinned-build rig (#107, #39): every reading step 4 tunes on came
      // from a run that started at the birthright, where the power-curve
      // ruling is about the maxed end. The rig is what moves a batch there,
      // and the hand's policy is untouched by which end it starts from.
      const maxed = playHarnessRun(
        SHARP,
        RIGS.maxed,
        SEALING_SEED,
        COMMIT_HASH,
        RECORDED_AT,
      );
      const { header } = decodeTape(maxed.bytes).tape;

      expect(maxed.rig).toBe('maxed');
      expect(header.startingSize).toBe(RIGS.maxed.startingSize);
      for (const line of WEAPON_LINES) {
        expect(header.startingLevels[line]).toBe(MAX_LEVEL);
      }
      // It reached the sim rather than only the header: the same seed under
      // the same hand from two rigs is two runs.
      expect(maxed.bytes).not.toEqual(sealingRun().bytes);
    },
    ONE_PLAYED_AND_REPLAYED_RUN_MS,
  );

  it(
    "replays and attests exactly as a person's tape does",
    () => {
      // Spec test 45, ADR 0019 and ADR 0033 and #98's acceptance line. The
      // witness is recomputed from the decoded bytes at every checkpoint, so a
      // verified outcome is the tape proving it reproduced its own run rather
      // than resembling it.
      const run = sealingRun();
      const measured = measure(decodeTape(run.bytes));

      expect(measured.outcome).toBe('verified');
      if (measured.outcome !== 'verified') return;
      expect(measured.run.ticks).toBe(run.ticks);
      expect(measured.run.checkpointsVerified).toBeGreaterThan(0);
      expect(measured.run.sealed).toBe(true);
      // A hand's run is never counted as a person's: the device and the policy
      // are two exclusions and both are correct on a harness tape.
      expect(measured.provenance.policy).toBe(SHARP.name);
      expect(measured.provenance.exclusions).toContain('bot');
      expect(measured.provenance.exclusions).toContain('policy');
      // The harness rig starts at the birthright, so nothing conditioned it.
      expect(measured.provenance.exclusions).not.toContain('conditioned');
    },
    ONE_PLAYED_AND_REPLAYED_RUN_MS,
  );
});
