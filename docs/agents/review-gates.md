# Review gates

Significant work carries review gates: a review through one lens, run by the matching gate agent in `.claude/agents/` (`gate-game-design`, `gate-tech-architecture`, `gate-product-vision`). The session performing a workflow owns firing the right gates; Mark is never the one who has to remember. Fire multiple gates concurrently when more than one applies.

## When gates fire

| Activity | Lenses | Default depth |
|---|---|---|
| Discovery, mechanic exploration | game design + product/vision | standard |
| Feature design, before implementation begins | all three | standard; deep when it touches the core loop |
| Implementation | tech architecture; add game design or product/vision when decisions materially affect behavior or experience | quick |
| Substantial bug fix | tech architecture | quick |
| Significant refactor or architectural change | tech architecture + product/vision where scope or complexity is affected | standard |
| Whole-design audit | all three, plus adversarial verification and adjudication | deep |
| Small, localized change | none, deliberately | none |

These are quality gates, not bureaucracy: proportional to the size and risk of the change.

## Depths

**Quick**: judge from the design record alone. No lookups.

**Standard**: quick, plus a lookup for every load-bearing claim, cited in the marker.

**Deep**: the shape proven by the 2026-08-08 pilot (`apps/housewarming/docs/reviews/2026-08-08-three-lens-review.md`): a per-lens sourced research brief targeted at the thing under review, then the review, then adversarial verification of every plan-changing finding, then adjudication across lenses. Verification covers all plan-changing findings, not a capped subset.

## Findings

Classify every finding DECIDE-NOW, ADJUST, DEFER, or DONT-BUILD, with its consequence: what postponing costs, what it conflicts with, the trigger to revisit, or the reason not to build. Judge relevance before depth: "does not apply to this change, and why" is a finding.

Does not apply to Housewarming, settled by the pilot, reopened only with new information: camera, collision and physics, real-time loop, performance and scale engineering, input abstraction, animation tooling, multiplayer, monetization, combat balance, map and traversal, prestige and meta-progression, save-management UX, ports, localization, live-ops, engine licensing, team scaling, ratings and compliance.

## The marker

Every gate run leaves a marker comment on the working issue via `gh`, first line machine-readable so a future hook can verify gates ran:

```
<!-- gate:<game-design|tech-architecture|product-vision> v1 depth:<quick|standard|deep> verdict:<clear|findings> -->
```

The body: date, one line naming what was reviewed, findings with classifications and reasoning (or "no findings" and why the change is clean through this lens), sources for anything looked up. One paragraph per line, no em dashes. No issue yet: return the marker block to the calling session, which owes it to the issue once one exists. A gate writes its marker and nothing else.

How this system was derived from Mark's draft, item by item: `docs/agents/review-gates-provenance.md`. Gates never need that file.
