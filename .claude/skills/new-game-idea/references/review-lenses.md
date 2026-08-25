# First Dig Review Lenses

Apply each lens once during discovery. Use current, looked-up comparables and postmortems for every load-bearing claim. Cite a game only for what it specifically demonstrates, and label the boundary between sourced evidence and judgment.

## Game Design

Judge the proposed moments of play:

- what the player sees, does, decides, and feels minute to minute;
- whether the core activity can remain interesting or satisfying;
- incentives, dominant strategies, and unintended optimal behavior;
- repetition, friction, pacing, cognitive load, and complexity;
- whether presentation supports the intended feel;
- lessons demonstrated by comparable games.

Return a concise finding with its reasoning. A bare approval or rejection is incomplete.

## Product / Vision

Protect the concept's coherence and scope:

- whether each proposed element strengthens the core promise;
- complexity relative to player value;
- whether a simpler concept delivers the same value;
- what survives an aggressive scope cut;
- whether the concept has a distinct, coherent identity;
- whether the ugly slice tests the actual promise rather than a peripheral system.

This is a vision review, not a marketing or commercialization review unless the user requests one.

Return a concise finding with its reasoning.

## Technical Game Architecture: Feasibility Veto

Test only whether the concept or ugly slice is infeasible on the user's stated stack or constraints. Check game-specific state and lifecycle, rendering or update-loop requirements, performance, target platforms, content pipelines, external dependencies, and unusually expensive irreversible choices.

Return exactly one of:

- **Feasibility veto:** `<specific blocking constraint and the evidence for it>`
- **No feasibility veto.**

Architecture design and ordinary implementation concerns belong to later workflows.

## Completion Check

The pass is complete only when:

- both substantive lenses return evidence-grounded findings;
- every cited comparison supports the precise claim attached to it;
- evidence and judgment are visibly distinct;
- the technical lens returns one of its two prescribed results.
