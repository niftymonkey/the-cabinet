import { describe, expect, it } from 'vitest';

import {
  drainPerLooseSpirit,
  poolsAtStage,
  rosterSize,
  ECONOMY,
  GENERATION,
} from './rules.ts';

describe('the pools at a stage', () => {
  it('start as the house the keeper inherits', () => {
    const pools = poolsAtStage(GENERATION, 0);
    expect(pools.haunt).toHaveLength(4);
    expect(pools.hour).toHaveLength(4);
  });

  it('keep everything an earlier stage opened', () => {
    const first = poolsAtStage(GENERATION, 0);
    const last = poolsAtStage(GENERATION, GENERATION.stages.length - 1);
    for (const room of first.haunt) {
      expect(last.haunt).toContainEqual(room);
    }
    expect(last.haunt.length).toBeGreaterThan(first.haunt.length);
  });

  it('leave the night at four watches, because it cannot be sliced finer', () => {
    for (let stage = 0; stage < GENERATION.stages.length; stage += 1) {
      expect(poolsAtStage(GENERATION, stage).hour).toHaveLength(4);
    }
  });

  it('open more rooms than there are spirits, so the last name is not a giveaway', () => {
    const rooms = poolsAtStage(GENERATION, GENERATION.stages.length - 1).haunt
      .length;
    expect(rooms).toBeGreaterThan(rosterSize(GENERATION));
  });

  it('refuse a stage this house does not have', () => {
    expect(() => poolsAtStage(GENERATION, 9)).toThrow(/stage 9/);
    expect(() => poolsAtStage(GENERATION, -1)).toThrow(/stage -1/);
    expect(() => poolsAtStage(GENERATION, 0.5)).toThrow(/stage 0.5/);
    expect(() => poolsAtStage(GENERATION, Number.NaN)).toThrow(/stage NaN/);
  });
});

describe('the drain as the season turns', () => {
  it('holds its first rate through the early nights', () => {
    expect(drainPerLooseSpirit(ECONOMY, 1)).toBe(4);
    expect(drainPerLooseSpirit(ECONOMY, 14)).toBe(4);
  });

  it('worsens once winter comes on', () => {
    expect(drainPerLooseSpirit(ECONOMY, 15)).toBe(6);
    expect(drainPerLooseSpirit(ECONOMY, 30)).toBe(8);
  });

  it('says so rather than guessing when the schedule does not reach a night', () => {
    expect(() => drainPerLooseSpirit(ECONOMY, 0)).toThrow(/night 0/);
  });
});
