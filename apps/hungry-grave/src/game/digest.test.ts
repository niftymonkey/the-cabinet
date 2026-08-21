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
 * TWO BLINDNESSES, for whoever reads this next.
 *
 * One: nothing on this dispatch's digest path calls math.ts at all, because the
 * grave moves linearly and the scroll is linear. A green digest here is not
 * determinism verified, and later dispatches must extend the scenario as they
 * add approximated operations. The #/digest screen prints this on screen, so a
 * phone MATCH does not read in the record as more than it is.
 *
 * Two: moveGrave clamps to the field's edges, so a script holding full-right
 * pins x to the field boundary exactly and erases any divergence in it. This
 * script is kept off the boundary, asserted below against the extremes
 * runScenario returns, and a per-tick checksum accumulates alongside the end
 * state so a divergence that later re-converges still shows.
 */

import { describe, expect, it } from "vitest";
import { GOLDEN, runScenario } from "../dev/digest";
import { FIELD_HEIGHT, FIELD_WIDTH } from "./field";

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
