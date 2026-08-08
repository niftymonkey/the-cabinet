// One night resolved into one morning, per the night contract settled by ticket #3.
//
// Every watched room resolves independently and is a pure function of its own experiment
// and the loose spirit that haunts it, if any. Any experiment draws that spirit out at
// its hour whatever the lure; a ward that is its aversion turns it back at the boundary;
// otherwise it comes in and the bowl empties only if the lure is its lure. The candle
// takes a mark at the watch of the approach if it is still burning then.

import type {
  Experiment,
  HourValue,
  Morning,
  Pools,
  Scene,
  Spirit,
  TraitId,
  Watch,
} from './types.ts';

export function hourValue(pools: Pools, hour: TraitId): HourValue {
  const value = pools.hour.find((candidate) => candidate.id === hour);
  if (!value) throw new Error(`no hour ${hour} in this house`);
  return value;
}

export function watchOf(pools: Pools, hour: TraitId): Watch {
  return hourValue(pools, hour).watch;
}

// A night the keeper could not actually have placed is a bug in the caller rather than a
// move to be resolved, so it throws instead of resolving to something plausible.
export function assertNightIsLegal(
  pools: Pools,
  experiments: readonly Experiment[],
): void {
  const rooms = new Set<TraitId>();
  for (const experiment of experiments) {
    if (rooms.has(experiment.room)) {
      throw new Error(`two experiments in ${experiment.room} on one night`);
    }
    rooms.add(experiment.room);

    if (![1, 2, 3, 4].includes(experiment.candle)) {
      throw new Error(
        `a candle of ${experiment.candle} watches cannot be bought`,
      );
    }
    if (!pools.haunt.some((room) => room.id === experiment.room)) {
      throw new Error(`no room ${experiment.room} is open in this house`);
    }
    if (!pools.lure.some((lure) => lure.id === experiment.lure)) {
      throw new Error(`no lure ${experiment.lure} in this house`);
    }
    if (
      experiment.ward !== null &&
      !pools.aversion.some((ward) => ward.id === experiment.ward)
    ) {
      throw new Error(`no ward ${experiment.ward} in this house`);
    }
  }
}

export function resolveNight(
  pools: Pools,
  loose: readonly Spirit[],
  experiments: readonly Experiment[],
  night: number,
): Morning {
  assertNightIsLegal(pools, experiments);
  return {
    night,
    scenes: experiments.map((experiment) =>
      resolveRoom(pools, loose, experiment),
    ),
  };
}

// One watched room, resolved on its own. Exported because deduction replays a room
// against a hypothetical spirit; a night the keeper actually places goes through
// `resolveNight`, which checks it first.
export function resolveRoom(
  pools: Pools,
  loose: readonly Spirit[],
  experiment: Experiment,
): Scene {
  // A generation invariant: never more than one loose spirit to a room.
  const spirit = loose.find((s) => s.name.haunt === experiment.room);
  if (!spirit) return { scene: 'silent', room: experiment.room };

  const approach = watchOf(pools, spirit.name.hour);
  const mark = experiment.candle >= approach ? approach : null;

  if (experiment.ward !== null && experiment.ward === spirit.name.aversion) {
    return {
      scene: 'turned-back',
      room: experiment.room,
      trace: spirit.trace,
      mark,
      ward: experiment.ward,
    };
  }

  return {
    scene: 'came-in',
    room: experiment.room,
    trace: spirit.trace,
    mark,
    bowlTaken: experiment.lure === spirit.name.lure,
    wardCrossed: experiment.ward,
  };
}
