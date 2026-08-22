/**
 * The golden digest (ADR 0015): a short scripted scenario, digested, compared
 * with a constant committed from one engine and checked on every other engine
 * a developer or CI ever runs.
 *
 * ADR 0015 explains why this test and not the obvious one. Replaying one seed
 * twice runs both replays in the same engine, so it passes with a raw Math.sin
 * still sitting in the sim: the engine is the varying input, and a same-engine
 * test is structurally blind to it.
 *
 * The scenario, the digest shape and GOLDEN live in src/dev/digest.ts, because
 * the #/digest screen runs the same scenario in a browser. The constant and its
 * never-update warning moved together and must never end up in two files.
 *
 * This is not a vitest snapshot, deliberately. `-u` maps to update mode `all`
 * and rewrites every changed snapshot in the run, so a future unrelated `-u`
 * for a renderer snapshot would silently rewrite the determinism digest;
 * CI=true does not save it, because a truthy `update` skips the CI branch
 * entirely, and toMatchFileSnapshot is writable by --update too. A prose
 * warning is not a defense. The readable object form is kept rather than a
 * hash, so a diff names the field that diverged.
 *
 * ONE BLINDNESS LEFT, and the one this dispatch closed.
 *
 * Closed: nothing on the digest's path used to call math.ts, because the grave
 * moves linearly and the scroll is linear, so a green digest was not
 * determinism verified at all. The scenario now spawns a ghoul and runs it long
 * enough to turn, and the checksum folds every live entity's own state, so an
 * ulp in cos moves the digest. The assertion below is that the checksum reaches
 * an entity, and never that the scenario "reaches math.ts": the turn step's cos
 * and sin are computed once at module load, so that claim is true at import and
 * says nothing about the run.
 *
 * Left: moveGrave clamps to the field's edges, so a script holding full-right
 * pins x to the field boundary exactly and erases any divergence in it. This
 * script is kept off the boundary, asserted below against the extremes
 * runScenario returns, and a per-tick checksum accumulates alongside the end
 * state so a divergence that later re-converges still shows.
 */

import { describe, expect, it } from "vitest";
import { foldEntities, GOLDEN, runScenario } from "../dev/digest";
import { FIELD_HEIGHT, FIELD_WIDTH } from "./field";
import { SIZE_START } from "./tuning";

/** What the scenario's grave starts at, so growth from its one swallow is visible. */
const GOLDEN_START_SIZE = SIZE_START;

describe("the golden digest", () => {
  it("a golden digest over a short scripted scenario matches the committed constant (ADR 0015)", () => {
    const { digest } = runScenario();
    if (JSON.stringify(digest) !== JSON.stringify(GOLDEN)) {
      console.log(
        `The digest moved. If that was deliberate, paste this over GOLDEN in src/dev/digest.ts and say why in the commit message:\n\nexport const GOLDEN: Digest = ${JSON.stringify(digest, null, 2)};\n`,
      );
    }
    expect(digest).toEqual(GOLDEN);
  });

  it("folds every live entity's own state, so a divergence in one moves the digest (ADR 0015)", () => {
    // The check that the extension actually bought something. The grave's x, y
    // and size cannot see a ghoul's turn at the precision an f32 divergence
    // lives at, so the fold has to reach the entity itself.
    const { state } = runScenario();
    const mob = state.mobs.find((each) => each.alive);
    const corpse = state.corpses.find((each) => each.alive);
    expect(mob).toBeDefined();
    expect(corpse).toBeDefined();

    const before = foldEntities(state, 0);
    mob!.vx += 1e-5;
    expect(foldEntities(state, 0)).not.toBe(before);
    mob!.vx -= 1e-5;
    expect(foldEntities(state, 0)).toBe(before);

    corpse!.freshness -= 1e-5;
    expect(foldEntities(state, 0)).not.toBe(before);
  });

  it("puts a ghoul's turn, a kill, a corpse and a swallow on the digest's path", () => {
    const { digest } = runScenario();
    expect(digest.kills).toBeGreaterThan(0);
    expect(digest.mobs).toBeGreaterThan(0);
    expect(digest.corpses).toBeGreaterThan(0);
    // Only a swallow charges the reservoir, so this is the swallow's own
    // signature. The grave's size cannot carry it: the ghoul reaches the grave
    // on this path too, and a hit costs more than one trash corpse pays.
    expect(digest.reservoir).toBeGreaterThan(0);
    expect(digest.size).toBeLessThan(GOLDEN_START_SIZE);
  });

  it("the script never reaches the field boundary, so no clamp erases a divergence", () => {
    // Recorded blindness two, kept as an assertion after the scenario moved to
    // src/dev, which may import no bare packages and so cannot carry expect().
    const { boundary } = runScenario();
    expect(boundary.minX).toBeGreaterThan(0);
    expect(boundary.minY).toBeGreaterThan(0);
    expect(boundary.maxX).toBeLessThan(FIELD_WIDTH);
    expect(boundary.maxY).toBeLessThan(FIELD_HEIGHT);
  });
});
