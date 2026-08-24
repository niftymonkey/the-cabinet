/**
 * The tape's encodings, which harden the moment the first tape exists.
 *
 * Every one of these is pinned by name rather than by a member's position in
 * its union (ADR 0018 and ADR 0019). Reordering a union would otherwise change
 * what every tape ever written means, with no version bump and no diff anybody
 * reads as dangerous, which is exactly the failure the maps exist to prevent.
 */

import { describe, expect, it } from "vitest";

import { FAULT_IDENTITIES } from "../game/invariants";
import {
  ABSENT_CODE,
  codeReader,
  ENDING_CODES,
  FAULT_IDENTITY_CODES,
  FAULT_SEVERITIES,
  FAULT_SEVERITY_CODES,
  INPUT_DEVICE_CODES,
  INTEGRITY_CODES,
  OBSERVATION_KIND_CODES,
  OBSERVATION_KINDS,
  RUN_ENDINGS,
  STOP_CODES,
  STOP_REASONS,
  TAPE_INPUT_DEVICES,
  TAPE_INTEGRITIES,
} from "./tape";

/**
 * One code map's three promises, asserted for whichever map it is handed.
 *
 * It takes the members and the map together, because the two halves are what
 * can drift apart: the compiler holds each map total over its union, and
 * nothing but this holds the list a decoder walks against the map it walks it
 * through.
 */
function itNamesEvery<T extends string>(
  what: string,
  members: readonly T[],
  codes: Readonly<Record<T, number>>,
): void {
  it(`names every ${what} a decoder can meet`, () => {
    expect(Object.keys(codes).sort()).toEqual([...members].sort());
  });

  it(`gives every ${what} its own code, none of them the absent code`, () => {
    const assigned = Object.values(codes);
    expect(new Set(assigned).size).toBe(assigned.length);
    expect(assigned).not.toContain(ABSENT_CODE);
  });

  it(`reads a ${what} back by name`, () => {
    const byCode = codeReader(members, codes);
    for (const member of members) {
      expect(byCode.get(codes[member])).toBe(member);
    }
    expect(byCode.size).toBe(members.length);
  });
}

describe("the tape's code maps", () => {
  itNamesEvery("run ending", RUN_ENDINGS, ENDING_CODES);
  itNamesEvery("stop", STOP_REASONS, STOP_CODES);
  itNamesEvery("integrity", TAPE_INTEGRITIES, INTEGRITY_CODES);
  itNamesEvery("input device", TAPE_INPUT_DEVICES, INPUT_DEVICE_CODES);
  itNamesEvery("fault severity", FAULT_SEVERITIES, FAULT_SEVERITY_CODES);
  itNamesEvery("fault identity", FAULT_IDENTITIES, FAULT_IDENTITY_CODES);
  itNamesEvery("observation kind", OBSERVATION_KINDS, OBSERVATION_KIND_CODES);

  it("keeps the fault identity codes off the closed list's ordinals", () => {
    // ADR 0017: an identity is append-only from the first tape and outlives the
    // check that raises it, so its code cannot be where the identity happens to
    // sit in FAULT_IDENTITIES today. The two agree by name and the codes are
    // written down, which is what lets the list be reordered without moving a
    // single tape's meaning.
    expect(FAULT_IDENTITY_CODES["no NaN"]).toBe(1);
    expect(FAULT_IDENTITY_CODES["phase tick resets at a boundary"]).toBe(12);
    expect(Object.keys(FAULT_IDENTITY_CODES).length).toBe(
      FAULT_IDENTITIES.length,
    );
  });
});
