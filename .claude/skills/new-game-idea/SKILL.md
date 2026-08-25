---
name: new-game-idea
description: Vet a game idea and return pursue, park, or drop.
disable-model-invocation: true
---

# First Dig

Determine whether a loose game idea could become a real game. This is a verdict workflow, not design or implementation.

## Entry

If the invocation includes an idea, begin with Capture. Otherwise ask the user to describe the idea in their own words. Accept an incomplete thought or mostly vibes; impose no intake format and begin no evaluation until they respond.

**Complete when:** the user's own description of the idea is available.

## Sidecar

Treat the exploration as a **sidecar** to the user's current work. Before any write, establish a dedicated destination for the new idea. The current project's source, context, ADRs, and issue tracker remain read-only. If no destination is chosen, deliver artifacts in chat.

**Complete when:** every write target is inside the chosen sidecar, or no external write occurs.

## 1. Capture

Restate the fantasy, core loop, and minute-to-minute player activity. Turn themes, feelings, and genre labels into **mechanics, not vibes**.

**Complete when:** the user confirms the mechanics-level statement.

## 2. Interrogate

Load `grilling`. Its first frontier must include:

1. **Mechanical ending** — what the player does to complete the game.
2. **Ugly slice** — the least polished end-to-end version that demonstrates the promise, achievable in roughly one or two weeks.
3. **Numeric foundations** — every load-bearing claim about combinatorics, economy, pacing, probability, content volume, or difficulty. Calculate rather than estimate.

Find retrievable facts yourself; leave design decisions to the user.

**Complete when:** the grilling frontier is resolved, explicitly parked, or recorded as risk.

## 3. Lens Pass

Read `references/review-lenses.md`. Apply each lens once using current, cited comparables and postmortems. Distinguish sourced evidence from judgment.

**Complete when:** Game Design and Product/Vision each have an evidence-grounded finding, and Technical Architecture returns either one concrete feasibility veto or **No feasibility veto**.

## 4. Verdict

Return one provisional verdict:

- **Pursue** — invest in structured discovery.
- **Park** — name the exact evidence or conditions required to unpark.
- **Drop** — state which central promise or constraint failed.

Show the reasoning so the user can challenge it.

**Complete when:** the user accepts the verdict or their disagreement is recorded with it.

## 5. Pursue Branch

Enter this branch exclusively after the user accepts **Pursue**.

1. Confirm the sidecar destination.
2. Load `wayfinder` explicitly; its model invocation is disabled.
3. Keep Wayfinder and `domain-modeling` artifacts inside the sidecar.
4. Set a destination that includes the ugly slice, not merely a buildable specification.
5. Seed fog with the mechanical ending, core-loop fun check, and unresolved First Dig findings.
6. Start a dated decision log with entry one.

Use Wayfinder's local-Markdown fallback when no tracker is configured. Configure a tracker only at the user's request.

**Complete when:** the map points to an ugly slice, its initial fog is present, and the current project remains unchanged.

## Record

Whatever the verdict, read `templates/first-dig-record.md` and produce a dated, cold-start-readable exploration record. Write it to the sidecar or deliver the complete Markdown in chat.

**Complete when:** a future session can recover the concept, evidence, risks, verdict, and next condition or pointer from that record alone.

## Verification

- The user supplied the idea in their own words.
- The user confirmed a mechanics-level capture.
- The mechanical ending, ugly slice, and numeric foundations were tested.
- Every lens returned its required result with cited evidence.
- The verdict is exactly **Pursue**, **Park**, or **Drop**.
- Wayfinder ran only on an accepted **Pursue** branch.
- Every external write stayed in the sidecar.
- The dated exploration record exists or was delivered in chat.
