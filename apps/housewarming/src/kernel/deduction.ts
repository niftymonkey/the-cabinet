// Narrowing a spirit's name to the candidates a set of mornings still allows.
//
// This is the third and fourth steps of the standard pipeline for generating solvable
// deduction puzzles: enumerate the names the pools could produce, then narrow them by
// what was actually seen. It is pure and it holds no opinion about how a keeper plays,
// which is what lets the solver (#12) drive it and an interface display it without
// either one inventing its own copy of the rules.

import { resolveRoom } from './resolver.ts';
import type {
  Axis,
  Experiment,
  Pools,
  Scene,
  TraitId,
  TrueName,
} from './types.ts';

export interface Observation {
  readonly night: number;
  readonly experiment: Experiment;
  readonly scene: Scene;
}

export function allNames(pools: Pools): TrueName[] {
  const names: TrueName[] = [];
  for (const hour of pools.hour) {
    for (const lure of pools.lure) {
      for (const aversion of pools.aversion) {
        for (const haunt of pools.haunt) {
          names.push({
            hour: hour.id,
            lure: lure.id,
            aversion: aversion.id,
            haunt: haunt.id,
          });
        }
      }
    }
  }
  return names;
}

// Spirits arrive over the course of a playthrough, so a room that was watched and silent
// before one of them moved in says nothing about where it lives. Counting those nights
// against it rules out its real haunt and leaves it with no name that fits at all, which
// is a puzzle the keeper cannot solve however carefully they play.
//
// So a spirit's evidence starts the night its trace first appears. That is the keeper's
// own honest starting point too: a new trace in a room is the moment they learn there is
// something new to name, and the book opens its page there.
export function firstSighting(
  trace: TraitId,
  observations: readonly Observation[],
): number | null {
  // The earliest, rather than the first in the list: a caller is free to hand these over
  // in any order and the answer must not change.
  let earliest: number | null = null;
  for (const observation of observations) {
    if (
      observation.scene.scene !== 'silent' &&
      observation.scene.trace === trace
    ) {
      earliest =
        earliest === null
          ? observation.night
          : Math.min(earliest, observation.night);
    }
  }
  return earliest;
}

export function evidenceFor(
  trace: TraitId,
  observations: readonly Observation[],
): Observation[] {
  const since = firstSighting(trace, observations);
  if (since === null) return [];
  return observations.filter((observation) => observation.night >= since);
}

export function consistentNames(
  pools: Pools,
  trace: TraitId,
  observations: readonly Observation[],
): TrueName[] {
  const evidence = evidenceFor(trace, observations);
  return allNames(pools).filter((name) =>
    evidence.every((observation) => allows(pools, trace, name, observation)),
  );
}

// A morning constrains this spirit two ways. Where its trace appears, the room has to
// have played out exactly as it did. Everywhere else, a watched room that shows silence
// or somebody else's trace says this spirit was not in it, because no two loose spirits
// share a haunt.
export function allows(
  pools: Pools,
  trace: TraitId,
  name: TrueName,
  observation: Observation,
): boolean {
  const supposed = resolveRoom(
    pools,
    [{ trace, name, stage: 0 }],
    observation.experiment,
  );
  const observed = observation.scene;
  if (observed.scene !== 'silent' && observed.trace === trace) {
    return sameScene(supposed, observed);
  }
  return supposed.scene === 'silent';
}

// How many of the four axes the evidence has narrowed to a single value. This is the
// objective reading of a trait "ruled in": the mornings leave one value standing, rather
// than the keeper having marked the book. The anti-spiral rule in the design turns on
// this count, and pricing the relief it buys belongs to the warmth economy ticket #15.
export function settledAxes(names: readonly TrueName[]): number {
  if (names.length === 0) return 0;
  const possible = traitsStillPossible(names);
  return Object.values(possible).filter((values) => values.length === 1).length;
}

// What each axis still allows.
export function traitsStillPossible(
  names: readonly TrueName[],
): Record<Axis, TraitId[]> {
  const axes: Axis[] = ['hour', 'lure', 'aversion', 'haunt'];
  const possible: Record<Axis, TraitId[]> = {
    hour: [],
    lure: [],
    aversion: [],
    haunt: [],
  };
  for (const axis of axes) {
    possible[axis] = [...new Set(names.map((name) => name[axis]))];
  }
  return possible;
}

function sameScene(left: Scene, right: Scene): boolean {
  if (left.scene !== right.scene) return false;
  if (left.room !== right.room) return false;
  if (left.scene === 'silent') return true;
  if (right.scene === 'silent') return false;
  if (left.trace !== right.trace) return false;
  if (left.mark !== right.mark) return false;
  if (left.scene === 'turned-back') {
    return right.scene === 'turned-back' && left.ward === right.ward;
  }
  return (
    right.scene === 'came-in' &&
    left.bowlTaken === right.bowlTaken &&
    left.wardCrossed === right.wardCrossed
  );
}
