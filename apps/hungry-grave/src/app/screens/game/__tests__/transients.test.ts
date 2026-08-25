/**
 * The replay lead-in covers every held transient (#58). The bound is taken
 * over the registry, never over a hand list, because two hand-maintained lists
 * of the same thing is the trap ADR 0019 closed for the witness fold: nothing
 * fails when a lifetime is added to one and forgotten in the other.
 */

import { describe, expect, it } from "vitest";
import { FIELD_RENDERER_TRANSIENT_TICKS } from "../FieldRenderer";
import { STORM_RENDERER_TRANSIENT_TICKS } from "../StormRenderer";
import { HELD_TRANSIENT_TICKS, REPLAY_LEAD_IN_TICKS } from "../transients";

describe("the held-transient registry", () => {
  it("carries every lifetime each renderer declares, so the registry is the renderers' own words", () => {
    expect(HELD_TRANSIENT_TICKS).toMatchObject(FIELD_RENDERER_TRANSIENT_TICKS);
    expect(HELD_TRANSIENT_TICKS).toMatchObject(STORM_RENDERER_TRANSIENT_TICKS);
  });

  it("carries nothing twice: no renderer's declaration shadows another's in the aggregate", () => {
    const declared =
      Object.keys(FIELD_RENDERER_TRANSIENT_TICKS).length +
      Object.keys(STORM_RENDERER_TRANSIENT_TICKS).length;
    expect(Object.keys(HELD_TRANSIENT_TICKS)).toHaveLength(declared);
  });

  it("REPLAY_LEAD_IN_TICKS covers the registry's longest lifetime, so a fast-forwarded replay has seen every transient born", () => {
    const lifetimes = Object.values<number>(HELD_TRANSIENT_TICKS);
    expect(lifetimes.length).toBeGreaterThan(0);
    expect(REPLAY_LEAD_IN_TICKS).toBeGreaterThanOrEqual(Math.max(...lifetimes));
  });
});
