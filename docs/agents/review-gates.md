# Review gates

Significant work carries review gates: a review through one lens, run by the matching gate agent in `.claude/agents/` (`gate-game-design`, `gate-tech-architecture`, `gate-product-vision`). The session performing a workflow owns firing the right gates; Mark is never the one who has to remember. Fire multiple gates concurrently when more than one applies.

What gates have got right and wrong here, and what a fold does to a plan, is in `docs/agents/lessons.md`.

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

## The north star

A game may carry a north star at `<app>/docs/VISION.md`. Where one exists, every gate reads it before the rest of the record: it states what the game is, the bets that make it this game, the experience it is meant to produce, and the questions a proposal has to answer, and every judgment the gate makes is made against it.

**It is deliberately downstream of the rules.** It carries no numbers and no rules of its own, and it says of itself that where it and an ADR, the glossary, or a lessons file disagree, the vision is the stale one. So a gate uses it to judge whether a change belongs, and never as grounds to correct an ADR against it. A genuine conflict between the vision and a rule is a finding for the human to rule on: report it, route it `**Human decides**`, and change neither file.

Only the product vision gate runs a change through the north star's proposal questions; the other two lenses read the same document and judge through their own checklists.

## Depths

**Quick**: judge from the design record alone. No lookups.

**Standard**: quick, plus a lookup for every load-bearing claim, cited in the marker.

**Deep**: the shape proven by the 2026-08-08 pilot (`apps/housewarming/docs/reviews/2026-08-08-three-lens-review.md`): a per-lens sourced research brief targeted at the thing under review, then the review, then adversarial verification of every plan-changing finding, then adjudication across lenses. Verification covers all plan-changing findings, not a capped subset.

## Findings

Classify every finding DECIDE-NOW, ADJUST, DEFER, or DONT-BUILD, with its consequence: what postponing costs, what it conflicts with, the trigger to revisit, or the reason not to build. Judge relevance before depth: "does not apply to this change, and why" is a finding.

### Does-not-apply lists are per game, never shared

Each game under `apps/` carries its own list, because a concern that is settled as irrelevant in one genre is often central in another. A gate reads only the list belonging to the game it is reviewing, and inherits nothing from any other game's list.

**Housewarming**, a turn-based deduction game, settled by the 2026-08-08 pilot and reopened only with new information: camera, collision and physics, real-time loop, performance and scale engineering, input abstraction, animation tooling, multiplayer, monetization, combat balance, map and traversal, prestige and meta-progression, save-management UX, ports, localization, live-ops, engine licensing, team scaling, ratings and compliance.

**The Hungry Grave**, a real-time vertical shmup, has no settled list yet. Several entries on Housewarming's list are load-bearing here (collision, the real-time loop, performance and scale, input abstraction, combat balance), so a gate on this game judges relevance per change and states its reasoning, rather than reaching for a list. A list gets written here once enough gate runs have settled the same items more than once.

## The marker

Every gate run leaves a marker comment on the working issue via `gh`. The first line is a visible heading naming the lens, so a reader can tell at a glance which review any comment is. The machine-readable marker is the line right after it, so a future hook can verify gates ran before a ticket closes:

```
### <Game design|Tech architecture|Product vision> review
<!-- gate:<game-design|tech-architecture|product-vision> v1 depth:<quick|standard|deep> verdict:<clear|findings> -->
```

The marker is a receipt, not the review, and months later it gets read for one thing: which finding touched the file the reader is looking at. Every finding line therefore carries its target on the left and its destination on the right, in the same position every time, so the eye can run down one edge. Hard cap of ten lines after the marker line:

- A context line, no bullet: the date, a middot, then what was reviewed.
- One bullet per finding, in this order and no other: ``- **CLASSIFICATION** `target` : the claim and its consequence. -> route``
- The target is the file, ADR, or artifact the finding lands on, in backticks. One or two of them; needing three means it is really several findings.
- The route is somewhere a reader can go: a file name, `gate report`, or `**Human decides**` when a person has to make the call, which is the only bolded route.
- One `Sources:` line naming what was looked up, if anything was.
- A clear verdict is the context line plus `No findings: <one reason>.`

Each bullet is exactly one line, never wrapped, because a wrap renders as a line break on GitHub and the left edge stops lining up. A finding that will not fit one line is too long for the issue: shorten the claim and let the gate report carry the rest. Several small findings of the same kind collapse into one bullet with a count, and the list itself goes in the report.

A worked example:

```
### Game design review
<!-- gate:game-design v1 depth:standard verdict:findings -->
2026-08-19 · domain-modeling backfill (glossary, 12 ADRs, frozen log, #36 spec)

- **ADJUST** `glossary` `ADR 0003` : floor damage narrowed to "bleeds score" where the record says "score or weapon levels", and that pick shapes the spiral question. -> **Human decides**
- **ADJUST** `spec` : closes #36's deliberately-open prototype-versus-base-game question and adds boot-straight-into-game. -> **Human decides**
- **ADJUST** `glossary` : no term for hostile fire, so Storm and Belch fall back on the banned word "enemy". -> glossary
- **ADJUST** `report` : 5 wording nits, from grave width to the wisp cap. -> gate report

Sources: mothershmupper.com on Gradius Syndrome, shmups.wiki on DonPachi overflow, paperdino.com on bomb hoarding.
```

Reasoning, gameplay framing, and cited evidence go in the gate's report to the calling session, which relays what matters to Mark; none of it belongs on the issue. One paragraph per line, no em dashes. No issue yet: return the marker block to the calling session, which owes it to the issue once one exists. A gate writes its marker and nothing else.

How this system was derived from Mark's draft, item by item: `docs/agents/review-gates-provenance.md`. Gates never need that file.
