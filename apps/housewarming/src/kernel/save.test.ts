import { describe, expect, it } from 'vitest';

import {
  deserialize,
  loadSave,
  saveRun,
  serialize,
  SAVE_VERSION,
  type Migration,
} from './save.ts';
import { at } from './rng.ts';
import { THE_HOUSE } from './rules.ts';
import { playNight, startRun } from './run.ts';
import type { Run } from './run.ts';

function played(): Run {
  const run = startRun(THE_HOUSE, 2026);
  return playNight(THE_HOUSE, run, [
    {
      room: 'haunt-hearth',
      candle: 3,
      lure: 'lure-milk',
      ward: 'aversion-iron',
    },
  ]).run;
}

describe('a save', () => {
  it('carries a version from the first day it exists', () => {
    expect(saveRun(played()).version).toBe(SAVE_VERSION);
  });

  it('comes back as the run that went in', () => {
    const run = played();
    expect(deserialize(serialize(run))).toEqual(run);
  });

  it('carries the mornings, so loading restores the book and not just the house', () => {
    const run = played();
    expect(run.seen).toHaveLength(1);
    expect(deserialize(serialize(run)).seen).toEqual(run.seen);
  });
});

describe('a save this house cannot read', () => {
  it('is refused when it comes from a later version', () => {
    const ahead = { version: SAVE_VERSION + 1, run: played() };
    expect(() => loadSave(ahead)).toThrow(/reads up to/);
  });

  it('is refused when nothing knows how to bring an older one forward', () => {
    const behind = { version: 0, run: played() };
    expect(() => loadSave(behind)).toThrow(/no migration from save version 0/);
  });

  it('is refused when it is not a save at all', () => {
    expect(() => loadSave('a house')).toThrow(/must be an object/);
    expect(() => loadSave({ run: played() })).toThrow(/version/);
  });

  it('is refused when the run inside it is malformed', () => {
    const run = played();
    expect(() =>
      loadSave({ version: 1, run: { ...run, warmth: 'cold' } }),
    ).toThrow(/warmth/);
    expect(() =>
      loadSave({ version: 1, run: { ...run, status: 'haunted' } }),
    ).toThrow(/status/);
    expect(() =>
      loadSave({ version: 1, run: { ...run, spirits: [{ trace: 1 }] } }),
    ).toThrow(/trace/);
  });

  it('is refused when a morning in it shows something this house cannot show', () => {
    const run = played();
    const bent = run.seen.map((observation) => ({
      ...observation,
      scene: { ...observation.scene, scene: 'a knocking at the door' },
    }));
    expect(() => loadSave({ version: 1, run: { ...run, seen: bent } })).toThrow(
      /not a scene/,
    );
  });

  it('is refused when its roster breaks what the generator guarantees', () => {
    const run = played();
    const twin = at(run.spirits, 0);
    expect(() =>
      loadSave({ version: 1, run: { ...run, spirits: [twin, twin] } }),
    ).toThrow(/same trace/);
    expect(() =>
      loadSave({
        version: 1,
        run: {
          ...run,
          spirits: [twin, { ...at(run.spirits, 1), name: twin.name }],
        },
      }),
    ).toThrow(/same haunt/);
  });

  it('is refused when it names a spirit that is not in the house', () => {
    const run = played();
    expect(() =>
      loadSave({ version: 1, run: { ...run, named: ['trace-nothing'] } }),
    ).toThrow(/which no spirit leaves/);
  });

  it('is refused when a scene and the experiment that made it disagree', () => {
    const run = played();
    const moved = run.seen.map((observation) => ({
      ...observation,
      scene: { ...observation.scene, room: 'haunt-attic' },
    }));
    expect(() =>
      loadSave({ version: 1, run: { ...run, seen: moved } }),
    ).toThrow(/a room it did not watch/);

    const rewarded = run.seen.map((observation) => ({
      ...observation,
      experiment: { ...observation.experiment, ward: 'aversion-rowan' },
    }));
    expect(() =>
      loadSave({ version: 1, run: { ...run, seen: rewarded } }),
    ).toThrow(/a ward the experiment did not put down/);
  });

  it('is refused when a candle in it burnt for no watch anyone sells', () => {
    const run = played();
    const bent = run.seen.map((observation) => ({
      ...observation,
      experiment: { ...observation.experiment, candle: 7 },
    }));
    expect(() => loadSave({ version: 1, run: { ...run, seen: bent } })).toThrow(
      /four watches/,
    );
  });
});

describe('the migration path', () => {
  // There is nothing to migrate yet, so this proves the machinery on a save the
  // registry does not carry. The real chain gets its entries the first time the run's
  // shape changes under a save someone is holding.
  const fromZero: Migration = (save) => ({
    version: 1,
    run: save['keeping'],
  });

  it('brings an older save forward and then loads it', () => {
    const run = played();
    const old = { version: 0, keeping: run };
    expect(loadSave(old, new Map([[0, fromZero]]))).toEqual(run);
  });

  it('refuses a migration that does not move the version forward', () => {
    const stuck: Migration = (save) => save;
    expect(() =>
      loadSave({ version: 0, run: played() }, new Map([[0, stuck]])),
    ).toThrow(/did not move the version on by one/);
  });

  it('refuses a migration that skips a version, so no step is jumped', () => {
    const leaps: Migration = (save) => ({ ...save, version: 3 });
    expect(() =>
      loadSave({ version: 0, run: played() }, new Map([[0, leaps]])),
    ).toThrow(/did not move the version on by one/);
  });
});
