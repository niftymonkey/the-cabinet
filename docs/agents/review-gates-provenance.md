# Review gates: provenance

Documentation for Mark, not operational material: no gate loads this file. It maps his draft (https://md.niftymonkey.dev/api/raw/mvcVIedM) to the built system, using the evidence of the 2026-08-08 three-lens review pilot (`apps/housewarming/docs/reviews/`, report plus three research briefs). Nothing from the draft was dropped.

## The draft's lists, item by item

Kept means the charter carries it in the draft's own sense; sharpened means the pilot's evidence turned it into something more falsifiable.

Game Design Review: player experience (kept, framed as moments of play); fun/interesting/satisfying (sharpened: does the optimal line coincide with the interesting line, does every turn carry information); unintended incentives (sharpened: guessing economics and side-channel oracles); friction, repetition, pacing, cognitive load, complexity (kept, split into working memory, perceptual variety, and stuck states); comparable-games lessons (kept, hardened by the looked-up-evidence rule); implementation changing intended feel (sharpened: a designed beat must be able to fire, checked in numbers). The draft's instruction to explain reasoning rather than approve/reject is kept verbatim.

Technical Game Architecture Review: architectural implications (kept); game-specific implementation patterns (sharpened: the seam rules); state and lifecycle (sharpened: every designed moment needs a reachable state, the pilot's headline finding); performance characteristics (kept, demoted for this game by the does-not-apply list); rendering and update-loop implications (kept); hidden coupling and dependencies (sharpened: data edits that bypass version gates, tickets that must re-measure together); scalability (sharpened to content-pipeline scalability); maintainability and testability (sharpened: play the loop end to end, fixtures at save bumps, instrument blindness); expensive-to-reverse decisions (kept, with the ADR trigger). The draft's instruction to distinguish ordinary engineering concerns from game-specific ones is kept verbatim.

Product / Vision Review: belongs in this game (kept); strengthens the core experience (kept); feature creep (kept); complexity relative to player value (kept); simpler solution, same goal (kept); would it survive aggressive scope reduction (kept); conflicts with decisions or principles elsewhere (sharpened: the record can argue with itself). The draft's boundary that this lens is stewardship, not marketing, is kept verbatim.

The draft's Workflow Responsibility section became the when-gates-fire table plus the standing rule in `AGENTS.md`; its example mapping was kept with depths added, and its "small changes skip heavyweight process" line is the table's last row.

## Additions earned by the pilot

Game design: failure and rescue calibration (choice windows, what losing preserves), endings enacted rather than narrated, solver-human anchoring.

Tech architecture: persistence failure states as states, save identity under continuous deploy, determinism placement, telemetry through the existing pipe before new dependencies.

Product/vision: the plan must produce a played thing, riskiest assumption cheapest test, playtesting with names and dates, content counted in perceptually distinct units, falsifiable milestones, sequencing risk, solo sustainability, DONT-BUILDs recorded so they are never re-argued.

Sources for every addition sit in the pilot's research briefs beside the report.

## Folded from AGENTS.md

Two rules moved out of `AGENTS.md` into the game design gate's charter so they live once: "A design question is put to Mark in gameplay terms" and "Guidance on game design rests on looked-up evidence". Both moved near-verbatim; any session doing design work follows the charter.

## Process lessons the gates inherit from the pilot

The four-way classification with consequences worked and is kept at every depth. Relevance-first prevented generic advice and is kept. Cross-lens agreement was the strongest signal, so deep runs adjudicate across lenses. The pilot's verification cap (eight of twenty-two plan-changing findings) forced the report to flag fourteen findings as unverified line by line, so deep runs size verification to cover all plan-changing findings. The pilot's date argument never reached the workflow script and the report said "unknown date" until hand-stamped, so markers carry their date in the body.
