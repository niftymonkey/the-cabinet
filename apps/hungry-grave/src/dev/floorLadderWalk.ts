// The floor ladder, staged at the size floor and walked one forced hit at a time.

/**
 * src/dev may reach src/game and imports no bare packages, which is what keeps
 * this module usable from a screen and why it returns its rows rather than
 * asserting or printing any of them.
 */
import type { SimEvent } from '../game/events';
import { createExecution, executeTick } from '../game/execution';
import type { WeaponLine } from '../game/lines/roster';
import { MAX_LEVEL } from '../game/lines/roster';
import type { RunEnding, RunState } from '../game/run';
import { createRun } from '../game/run';
import { RIGS } from './rigs';
import { standMobOnGrave } from './staging';

/**
 * A fixed seed, so a walk that disagrees with its rows is reproducible and
 * never a flake. Which seed it is decides nothing here: the hits are forced
 * rather than waited for, and the ladder is the same ladder under any stage.
 */
const SEED = 404;

/** The grave stands still, so a forced hit is the only thing that moves the run. */
const STILL = { move: { x: 0, y: 0 }, belch: false } as const;

/**
 * The most hits a walk of the whole ladder can take, derived rather than
 * written down: the bleed, one strip per rung every line stands above its
 * floor, the seal, and the one hit played past the seal.
 *
 * It is a bound and never a length. A rule change that made the ladder
 * infinite ends the walk here, so the test that reads it fails rather than
 * hanging.
 */
const LADDER_HIT_BUDGET = MAX_LEVEL + 3;

/** The three rungs of ADR 0003's ladder, in the order a hit can fire them. */
type LadderEvent = 'scoreBled' | 'weaponStripped' | 'sealed';

/**
 * One forced hit: what the ladder did with it, what the score was on either
 * side of it, which lines paid, where the levels stood after it, and the
 * ending if it made one.
 *
 * The grave's size going in is here because a hit above the floor shrinks
 * instead of laddering: without it a walk that grew off the floor would read
 * as a ladder that stopped firing rather than as a grave that left.
 */
interface LadderHit {
  readonly tick: number;
  readonly sizeBefore: number;
  readonly event: LadderEvent | null;
  readonly scoreBefore: number;
  readonly scoreAfter: number;
  readonly lines: readonly WeaponLine[];
  readonly levels: Readonly<Record<WeaponLine, number>>;
  readonly ending: RunEnding | null;
}

interface LadderWalk {
  readonly hits: readonly LadderHit[];
  readonly state: RunState;
}

/** Which rung of the ladder a tick's events say fired, or none at all. */
const ladderRungIn = (events: readonly SimEvent[]) => {
  for (const event of events) {
    if (
      event.type === 'scoreBled' ||
      event.type === 'weaponStripped' ||
      event.type === 'sealed'
    ) {
      return event;
    }
  }
  return undefined;
};

type LadderRung = ReturnType<typeof ladderRungIn>;

const linesThatPaid = (rung: LadderRung): readonly WeaponLine[] =>
  rung !== undefined && rung.type === 'weaponStripped' ? rung.lines : [];

/**
 * The run the walk is staged into: the ladder rig's own starting condition,
 * applied whole the way playHarnessRun applies one.
 */
const stagedRun = (): RunState => createRun(SEED, RIGS.ladder.conditions);

/**
 * One hit, made to land on the tick it is asked for.
 *
 * The invulnerable window is cleared directly rather than waited out, and the
 * mob is re-staged for every hit. Waiting it out is what makes a staged ladder
 * stop laddering: a kill or a crumb swallowed inside a live window grows the
 * grave above the size floor, and the next hit then shrinks the grave rather
 * than spending a rung.
 */
const forceOneHit = (
  execution: ReturnType<typeof createExecution>,
  run: RunState,
): LadderHit => {
  run.grave.invulnerable = 0;
  standMobOnGrave(run);
  const sizeBefore = run.grave.size;
  const scoreBefore = run.score;
  const tick = run.tick;
  const rung = ladderRungIn(executeTick(execution, STILL));
  return {
    tick,
    sizeBefore,
    event: rung === undefined ? null : rung.type,
    scoreBefore,
    scoreAfter: run.score,
    lines: [...linesThatPaid(rung)],
    levels: { ...run.levels },
    ending: run.ending,
  };
};

/**
 * The floor ladder staged and walked: a run started at the size floor holding
 * a score, hit until it seals, and hit once more after it has.
 *
 * The hit past the seal is played rather than skipped because nothing in the
 * tree asserts what one does, and the walk is where a scenario can watch it.
 * It prints nothing and asserts nothing: src/dev may import no bare package,
 * vitest included, so the rows are the whole of what it says.
 */
const walkFloorLadder = (): LadderWalk => {
  const run = stagedRun();
  const execution = createExecution(run);
  const hits: LadderHit[] = [];
  let sealed = false;
  while (hits.length < LADDER_HIT_BUDGET && !sealed) {
    const hit = forceOneHit(execution, run);
    hits.push(hit);
    sealed = hit.ending !== null;
  }
  if (sealed && hits.length < LADDER_HIT_BUDGET) {
    hits.push(forceOneHit(execution, run));
  }
  return { hits, state: run };
};

export { walkFloorLadder, LADDER_HIT_BUDGET };
export type { LadderEvent, LadderHit, LadderWalk };
