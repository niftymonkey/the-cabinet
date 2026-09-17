# ADR review: 64 ADRs, what the evidence supports

The bar Mark set on 2026-09-17 is that an ADR holds a really large, important, extremely tough-to-reverse decision won by hard knowledge, and that anything we should be able to reverse while we are still figuring the first version out does not belong in one. Every card was read against that bar, every proposal was argued against, and deletion was the expected common outcome. Of the 64 records, 16 are deleted, 4 are merged into another record, 28 are demoted into a design record or the glossary, and 16 are kept.

## The game's premise and frame

The one record that says what game this is.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0001 | A grave in a vertical scroller | delete | It is the only place the frame is written as a decision, and a live design note leans on its fitted-camera distinction (3 strong, 3 weak) | keep | Mark confirmed the frame only after asking for a gate, on researched evidence about panning shmups and the two shipped hybrids that chose a fixed screen. Reversing it redesigns the camera and the whole stage structure, and nothing in the code guards it. |

## The swallow economy: what food is and how power arrives

Where food comes from, and how permanent power reaches the player.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0002 | Corpses are fuel and carriers meter power | keep | The card bundles five rulings, two of them already superseded (strong) | keep | Only the carrier rule clears the bar: it is the cut that keeps the director away from power, and reopening it reopens the whole loop. The record shrinks to that one sentence, and the rest moves to the concept doc and the glossary. |
| 0004 | One freshness meter | delete | Two other records and about fifty code sites argue from a coupling that would then be written nowhere (strong) | demote to game-concept.md, The core loop | A payout curve is a retune, so it is not a record's work, but the choice of one meter rather than two systems has no other home. It joins the core loop paragraph that already carries the ten seconds and the floor. |
| 0048 | A missed carrier is missed, and the schedule carries the slack | merge into 0002 | The merge text drops the rejections that the offer code and its tests actually cite (strong) | merge into 0002 | The no-catch-up rule is a corollary of the loop 0002 cut, as the record itself says, so it is the same decision. The surviving sentence must say that nothing reads the player's power to place a carrier or move an offer. |

## Size is health and the floor ladder

The grave's one scalar, and what a hit costs once it is at the floor.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0003 | Size is health | delete | The card prices the amendment rather than the decision, and about two hundred code sites hang off it (4 strong) | keep | Reversing one scalar instead of a health bar rewrites the grave module, the always-on size check, the shrinking hitbox and the rim as the hit's channel. It is also the only written form of the bleed cap Mark was told to review before merge. |
| 0037 | Live mobs are never food | delete | A plain delete carries the reason away and leaves the rule reading as an oversight (2 strong, 1 weak) | demote to game-concept.md, the Size is health section | Two sentences extracted from another record with borrowed rationale, and whether a big grave can eat a live mob is exactly the first-version feel rule that should stay reversible. The section already states the behaviour and gains the Donut County reason. |

## Content is an open pool, not a fixed category

Whether weapon lines, mob types and formations are open lists or fixed categories.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0005 | Weapon lines are a pool | keep | The claimed reversal cost does not exist: the code holds a flat four-name list (2 strong, 2 weak) | demote to CONTEXT.md, Weapon line | The old categories survive only in a retired prototype, and the hard-won halves already left as their own records. What remains is the admission rule, which is a glossary sentence. |
| 0016 | Mob types and formations are pools | delete | A fence test, four other records and a tracking-shot rejection all point at it (4 strong, 2 weak) | demote to CONTEXT.md, Mob type | The pool shape and the placement-only split are reversible modelling the glossary already carries. The refusal of homing mob fire lives nowhere else, so it moves rather than vanishing. |
| 0046 | A run's roster is drawn from a growing pool | demote to game-concept.md, Deferred | The roster half shipped, and its subset rule is a promise about stored tapes (4 strong, 1 weak) | keep | Seventeen production files read the roster, and the tape rule means a build must keep accepting recordings that name fewer lines than it compiles. Only the unbuilt unlock store is deferred, and that trigger already has a home. |

## What each weapon line does

The four lines, how each fires, and how a level is bought.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0008 | The belch: full only, gas everywhere, shove nearby | delete | Three supersessions all left the same core untouched, and two records reason from its no-invulnerability rule (strong) | keep | The core is a tape-measured decision that took the belch from nearly half of all kills down to an air clear, and the no-invulnerability premise lives only here. The newest ruling is not built yet, so the code still answers the old way. |
| 0034 | A power-up is an offer of three and the grave swallows one | delete | An always-on check enforces it by number, and its no-menus reason is nowhere else (strong) | keep | The offer replaced a dice roll on a tape reading, and reversing it rewrites the offer, the bank and the economy. The fixed first offer and the parked wildcard have no other home. |
| 0035 | Homing is capped at one | delete | ADR 0005 names this cap as one of the two standing constraints every new line answers (strong) | merge into 0005 | The cap is empty while only one homing line exists, so it does not stand alone. It folds back into the pool's admission rule, which is where it came from. |
| 0036 | The bell is a timed pulse of cones | delete | A dated design record still describes the ring bell the game no longer has (strong) | demote to weapon-pool-review.md, Repel | A damage shape already rebuilt once from circle to cones is what the bar says must stay reversible. The move overwrites the stale ruling and carries the boundary rules and the accepted maxed-bell price. |
| 0038 | The belch binds to a dedicated button | delete | ADR 0011 hands its one boxed control off to this record (weak) | delete | Cave's mobile ports are the whole rationale, and the button test's header already carries the ruling, its date and its reason. The refused second-pointer model and the dangling handoff are one-line repairs. |
| 0044 | Territory is autonomous controlling ground | delete | The named home still rules the on-swallow Territory this record killed (strong) | demote to weapon-pool-review.md, Territory | One line's targeting and levels, amended after its first playtest, is the kind of choice that stays reversible. The move overwrites the superseded section and keeps the bounded scan window the code leans on. |
| 0045 | The birthright is the skull stream alone | delete | A recovery watch item and a correction to a stale record go with the file (weak) | delete | Cheap to flip by the card's own reading, with both halves pinned by tests and stated in the glossary. The watch item rides into the tuning record's open questions. |
| 0058 | Each on-swallow line pays in its own currency, at its own cadence | delete | The delete reason argues against the amendment, not Mark's ruling underneath it (strong) | demote to weapon-pool-review.md, the freshness defect section | The per-line axis is a tuning rule that fourteen code sites already pin, so it is not a record's work. Moving it closes the defect section that still lists it as open and Mark's to rule. |

## Losing and showing the ladder

How a weapon level reads on screen, and what happens when one is stripped.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0054 | The ladder reads twice, in the storm and on the HUD | delete | It is a precedent argument over five shipped games, one of which reached the conclusion twice (3 strong, 2 weak) | demote to show-what-you-have.md, a ladder section | Calling it an in-the-moment choice is wrong, but the HUD's form is live design work and the card's own reversal is a design regression. The amendment's note that it is Mark's to overrule travels with the text. |
| 0055 | A stripped rung falls onto the field as a body | delete | Fifteen code sites cite it, and a filed correction waits on Mark's own next read (4 strong, 2 weak) | demote to show-what-you-have.md, a fallen rung section | Not-hard-won is a mislabel given the three-way comparison behind it, but the record itself calls the drop new ground no shipped game has tested. Demotion keeps the correction's trigger as his read of the moved section. |

## The director's remit

Whether a director may exist, what signal it may read, and what it may touch.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0047 | Directed density inside authored beats | keep | Strip what other records own and one sentence is left (2 weak) | keep | Reading the pressure the player is under and never the power he holds is Mark's ruling, taken on the Battle Garegga suicide loop, and reversing it rewrites the director's signal. Both objections ask the record to shrink or wait, neither of which is a different action. |
| 0006 | Authored waves, not a director | merge into 0047 | The survivor sentence drops the seeded-stream rule and the authored wave shape (2 strong, 1 weak) | merge into 0047 | Already superseded and not hard-won, so it cannot stand alone, but the rule that every die draws from its own named stream is stated in full nowhere else. It and the authored floor carry into 0047. |
| 0056 | The director spends a finite budget per section | merge into 0047 | Mark named 0047 and 0056 as two standing records with different content (4 strong, 1 weak) | keep | The signal reading harm and never a kill near the player is bought from two shipped games, the second of which deleted the kill term in its own rewrite. Its caps rule has no home in the proposed survivor, and one flip already cost a tape version. |
| 0060 | Growth over the run is authored per section | merge into 0047 | The merge loses stepped-not-lerped, the rate held at zero and the wave ending rule (3 strong, 1 weak) | demote to mow-ladder-director.md, a stage growth section | Decided by a session rather than by Mark, re-ruled the day a survey appeared, and reversed by editing a data table. The rulings move to the design record it already points at, and the naming call stays in the glossary. |

## The stage's shape and boundaries

How long the stage runs, how it is cut into sections, and how a section ends.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0049 | The stage runs eight to ten minutes in named sections | delete | An open tripwire test measures a whole run against this band (2 strong, 2 weak) | delete | The band is in Mark's own done-line and the derivation is in the research record, so the tripwire can cite those. Length buys no power is already pinned by a test and stated in the stage record. |
| 0050 | Three sections, and one boundary is not a boss | delete | The not-a-second-feast rule and the director's fourth exemption lean on it (2 strong, 1 weak) | delete | The three sections, the boundary that is not always a boss, and the Waking are all in the glossary, and the not-a-second-feast line is already prose in the stage record. What is left is an authored content choice. |
| 0051 | The drain-out becomes a sparse last wave | delete | A cheap edit with an expensive consequence the card itself names (3 strong) | delete | Every piece has a native home: the glossary, the stage record's section on how a section ends, and the two records that state the closing zero row and the held breath in their own words. How the old silence was once measured is history, not a ruling. |
| 0042 | A set piece names the property it must keep | delete | A whole guard file and three mob rows are built against it (3 strong, 1 weak) | keep | This is about how content is specified and tested rather than what content exists, and it is why a structural fence exists and why three mob rows are derived as they are. It is also the only home of the Wall's supersession. |

## Bosses

How a boss fight is built, and how long it lasts.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0007 | Bosses are always shootable | delete | The reason collapses the amendment's ruling with the tuning rows the record refuses to own (4 strong, 1 weak) | keep | Always shootable is the promise that the storm always matters, and the reason a boss is never pushed is what the belch's surviving re-ruling argues from. The code still holds the old shape for the set piece's source, so the record is doing live work. |
| 0052 | The Undertaker's length is bought in phases | delete | The named home holds the ruling only as a citation, and in a banned word (2 strong, 2 weak) | demote to stage-floor.md section 4 | A day of tuning to reverse and not hard-won, so it fails the bar, but deleting it leaves the ruling stated nowhere in the game's current words. The one sentence with reach, that a boss is the game's longest unpaced stretch, travels with it. |

## Mobs: density and arrival

How tough an ordinary body is, and how a mob arrives.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0059 | A trash minute is a mow, and density is bought with weak bodies | delete | Three other records name it as what their earlier ruling could not have known (4 strong, 1 weak) | keep | Mark played tough trash at mow density and rejected it, so reversal is a return to a rejected feel rather than a tuning row. It also retires an earlier promise about armed mobs, which the glossary states as an outcome without the trade. |
| 0041 | A mob holds the formation's arriving motion for a beat | delete | The card says never amended, and the glossary carries an amendment the file never received (2 strong, 2 weak) | demote to CONTEXT.md, Arriving beat | A scoped timing rule, cheap to reverse and pinned in code and tests, so it is not a record's work. The glossary is already the live version, and it gains the reason and the one-owner rule that refused a reuse of the beat. |

## The tape's wire format

The bytes a recorded run is written as.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0018 | The tape format | keep | The version has moved four times in three weeks, each break called negligible (strong) | demote to CONTEXT.md, Tape and Observation | The card marks it neither hard-won nor hard to reverse, and the repo keeps reversing it cheaply. Bytes, the three sections and the refusal of an unknown version are pinned by the codec tests, so one glossary sentence is the residue. |
| 0026 | A partial tape is a valid tape | merge into 0018 | The reason a closed tab must still yield a tape has no other home (strong) | delete | The merge is refused, because a player closing a tab and a float range sweep share no trade-off. The argument does live in the code and in the Trailer entry, so only the precedent's name is lost. |
| 0027 | The header records resolved values, never absences | merge into 0018 | It is the most cited rule in the group and it keeps deciding new questions (strong) | keep | Four records reason from it, and one named it as a reopening trigger that has since fired. Once tapes are shared, a default recorded as an absence silently rewrites what every old tape replays as. |
| 0029 | The tape holds exactly what the simulation consumed | merge into 0018 | The survivor keeps the promise and drops the mechanism that holds it up (strong) | delete | Where the rounding sits is not a byte-layout clause, so the merge is refused. It is already structural in the code with its reason beside it and a test guarding it, so moving it is a reversible code change. |
| 0030 | Steering carries the simulation's own precision | merge into 0018 | The numbers behind it exist nowhere else in the repo (strong) | demote to the replay grill record, the superseded paragraph | One field's width is not a large decision, but the merge would keep the conclusion and throw away the measurement. That paragraph already names this decision as the successor to its retired figure. |
| 0043 | Recorded content is self-describing | merge into 0018 | Five records and fifty-five code sites reason from it, more than from 0018 (strong) | keep | It constrains the format from outside rather than sitting inside it, and the refusal path it rules is built and tested. The core is Mark's, written against a flaw found in the build and paid for twice in version bumps. |
| 0028 | The run's outcome is orthogonal fields | delete | The glossary has Stop and Integrity entries and no Ending entry (weak) | demote to CONTEXT.md, a new Ending entry | A struct shape whose reasoning fits one sentence, already kept honest by a test. The three values and the rule that a fault stays out of the ending need that entry written first. |
| 0031 | Damage is attributed in both directions | delete | Almost nothing is lost, and the record is wrong about its own side of the split (weak) | delete | Attribution is recomputed by replaying, so the card's unrecoverable reversal cost does not hold. The glossary states both directions, the types carry the shapes, and no code cites the record. |
| 0032 | The frame row | delete | Same-day refinement records a shape that was ruled, tried and rejected (strong) | demote to CONTEXT.md, a Frame row entry | The Observation entry does not cover the row at all, so a bare delete forgets the rejected design and strands two code comments. A row whose change costs one version bump is not a large decision. |

## Determinism, the witness, and what a replay may claim

What makes two runs the same run, and what a replay is allowed to claim.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0019 | The witness and the refusal rule | keep | The field list has widened a dozen times cheaply, and half the file is implementation (strong) | keep | The refusal rule is Mark's, with two rejected alternatives named, and the glossary carries only its numbers half. The record keeps that one decision and sheds the field working. |
| 0015 | Determinism across devices | keep | Its lint rule already carries the whole argument, and the cross-device claim was never checked (strong) | merge into 0019 | It does not stand alone once the mechanism documents itself, and the record admits divergence is unlikely rather than impossible. Fixed ticks, seeded dice and one rounding module become the witness record's opening. |
| 0012 | Fresh seed per run, pinned seed as instrument | delete | ADR 0015's closing argument cites it, and the URL precedence rule is not in the glossary (1 strong, 1 weak) | delete | A fresh seed and a URL to pin one are reversible in an afternoon, with the precedence rule and the readout tested where they live. The strong objection falls with the merge, and the silent-42 trap is already in the frozen log. |
| 0020 | Replay ships and is not a challenge | delete | The shipped-feature premise is why a build mismatch is a note and not a refusal (2 weak) | delete | Not hard-won, and the commitment is a roadmap row already stated in three surviving places. The mismatch reason is a sentence of the refusal rule kept in 0019, so the code comments point there. |
| 0033 | Verification readback is not replay | delete | The glossary bans the words but cannot say why a reader would break the ban (weak) | demote to CONTEXT.md, Verification readback | A naming rule is cheap and cannot bind a future commit message by any mechanism. The entry gains the one clause it lacks, and the module fence stays in the test that already paraphrases it. |

## Where runs land

The backend store for recorded runs.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0057 | Every run lands in one store, bytes beside columns | delete | Two sentences guard unbuilt code and live nowhere else (3 strong, 3 weak) | demote to CONTEXT.md, Store | Nothing writes a row, the batch report shipped as a folder read rather than the promised query, and reversing means deleting one script and two dependencies. How a person's run is told from a harness run, and the ban on trusting a build stamp, join the glossary entry. |

## The instrument's integrity

What a build must check about itself, and how faults are graded.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0023 | Invariants are always on | keep | A compile-time guard test already holds it, and it cites 0017 rather than this record (strong) | delete | The rule is enforced where it cannot drift, and the format already declares an unchecked tape, so reversal is one flag plus a query. A desktop-only cost with the phone unmeasured is something Mark should stay free to revisit. |
| 0013 | The sim verification contract | merge into 0023 | It is the most cited record here, and the survivor drops four of its sentences (strong) | demote to the feature playbook, the verification menu | The merge is refused, but the card says not hard-won and tests-before-code is reversible any day. The record itself names the playbook as the flow it composes with, so the sim-specific layers go there. |
| 0022 | Instrumentation controls are gated at build time | merge into 0023 | The gate is unbuilt, so the record is the only place the obligation is stated (strong) | delete | A ticket already carries the obligation with acceptance criteria, quoting the never-by-URL sentence from the record this one was extracted from. An obligation with no code behind it is a requirement, not knowledge. |
| 0021 | The instrument's purposes are an open pool | delete | The counterweight sentence appears nowhere else, and two records lean on it (strong) | demote to CONTEXT.md, a new Instrument entry | An open pool with nothing to reverse is a stance rather than a decision. The preference for the smallest design that still measures honestly is the live brake on speculative fields, so it moves. |
| 0024 | Invariant faults carry severity | delete | Only this record holds record-and-return, the Unreal precedent and the format lock (strong) | delete | The glossary's three fault entries already carry the ruling, including that the run continues and that fault identity is a closed list. The mechanics are code with their own comments, and the per-check grading is retunable by the card's own admission. |
| 0062 | A reading's meaning is declared, never taken from its value | delete | It holds the project's only prose definition of a reading (strong) | demote to CONTEXT.md, a new Reading entry | Filed a day ago by a session and never ruled by Mark, so it is nowhere near the bar. Two tests hold the completeness half, and the forbidding half becomes the glossary entry a progress note already asked for. |

## The playing harness

The bot that plays many seeds, and what its numbers are allowed to say.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0053 | The playing harness is one policy over many seeds | delete | A guard test's whole authority is this file, and the roster refusal has no other home (3 strong, 2 weak) | demote to playing-harness.md sections 2 and 4 | Nothing here is extremely hard to reverse: the header field is out of scope by 0018's own words, and reading a harness number as a direction is a discipline. The four-studio evidence stays in the research record, and the rulings drawn from it sit beside the sections that apply them. |

## Field readability and hit feedback

What the field may draw, and how a hit is announced.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0014 | Readability layering | keep | Most of it has narrower homes, and the title names one of the eight things it holds (strong) | keep | The one-way guarantee, that anything at or above the floor is mob fire, was priced against a stricter reading and binds every colour the field will ever draw, including the art that replaces the placeholders. Keep that pair of sentences; the stack, the grammar and the procedure leave the file. |
| 0039 | The field boundary is a readout | merge into 0014 | A contrast floor for one element is the opposite move from a ceiling on everything else (strong) | demote to the value-band research record, section 7.6 | The merge would file it under the wrong decision, but a stroke regraded on one play is reversible as we learn. The readout ruling, the priced-out alternative and the release trigger move to the section that already holds the numbers. |
| 0040 | A hit announces by subtraction | merge into 0014 | Dimming rather than flashing follows from the boss contract, and the spared rim from size-is-health (strong) | demote to the value-band research record, section 1.4 | Neither half is a clause of the value band, so 0014 is the wrong parent. It is hit-feedback feel that a palette test and the flash-rate arithmetic already guard, so it moves to the section named for it. |

## Controls

How steering reaches the simulation.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0011 | Each input owns its speed | delete | Three sentences have no other home, and ADR 0030's closing argument cites it (4 strong, 2 weak) | demote to game-concept.md, the controls line | Nothing here is hard to reverse: the command shape is in code and the speed range is a tuning number that already narrowed once. The focus-collision working, the older range it superseded and a corrected research claim move to the controls line, and the touch-cap trap goes to the lessons file. |

## Code structure and one-record refactors

Module seams, and the refactors that pulled scattered fields into one record.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0009 | Creation-web template base, React out | delete | Two citations would dangle (weak) | delete | A scaffolding pick, and the wider rule about generating the official scaffold first already sits in the frozen log with the rejected alternatives. Repointing the two citations is the whole cleanup. |
| 0017 | One execution authority | delete | The lint fence forbids the import and says nothing about why three alternatives lost (strong) | keep | Ruled by Mark across a grill and three gates after a convention had been broken four times unnoticed, and the tape, the witness and the checks all rest on this seam. Six code sites cite lettered rulings that no document lists, which is a separate problem to find a home for. |
| 0025 | The stage watch belongs to Execution | delete | Only the file records that an earlier note was overturned (weak) | delete | One field's placement, reversible in an afternoon, with the whole argument already written in the invariants file. The pooled-lifetime lesson belongs in the lessons file. |
| 0063 | A run's starting condition is one record | delete | The glossary contradicts the build about how a figure is banded (strong) | demote to CONTEXT.md, Starting condition | Deleting outright would leave that contradiction standing, so the three-field banding rule moves and the stale sentence gets corrected. The ruling itself is the code rules applied, and the hard-won part is the bug, which is a lesson. |
| 0064 | A tuning magnitude is a row of one record | delete | The direction the shell resolves it in is fenced by a test and missing from the glossary (strong) | demote to the tuning record | The design record already holds the ruling twice over, and the glossary gains one sentence about the shell resolving it. The nine magnitudes that still have no row move to a ticket before the branch handoff is deleted. |

## Process and vocabulary

The prototype boundary, and the words the glossary uses.

| ADR | Title | Proposal | Objection (strength) | Ruling | Reason |
| --- | --- | --- | --- | --- | --- |
| 0010 | The prototype boundary | delete | A deferred want with a live citation, and no test fences the static import (4 strong, 1 weak) | delete | Every sentence already has a home: the glossary, the playbook's prototype section, the frozen log and the routing test, with the deferred want written out in full in the tracer plan. The never-lifted rule reverses by a one-line edit, since it is the lifting that cannot be undone. |
| 0061 | The system vocabulary is the genre's | demote to CONTEXT.md, a Language preamble | The readings version bump and the held seed salt are not glossary matters (4 strong, 1 weak) | demote to CONTEXT.md, a Language preamble | Hard-won on a count, but it governs how words are chosen and reverses by a rename plus one version bump. The pieces said to be stranded each explain themselves where they bind, so their citations simply point at the preamble. |

## What happens if Mark accepts every ruling

Sixteen records survive.

- 0001 A grave in a vertical scroller
- 0002 Corpses are fuel and carriers meter power (shrunk to the carrier rule)
- 0003 Size is health
- 0007 Bosses are always shootable
- 0008 The belch: full only, gas everywhere, shove nearby
- 0014 Readability layering (shrunk to the one-way guarantee and its metric)
- 0017 One execution authority
- 0019 The witness and the refusal rule (shrunk to the refusal rule, plus 0015's premise)
- 0027 The header records resolved values, never absences
- 0034 A power-up is an offer of three and the grave swallows one
- 0042 A set piece names the property it must keep
- 0043 Recorded content is self-describing
- 0046 A run's roster is drawn from a growing pool
- 0047 Directed density inside authored beats
- 0056 The director spends a finite budget per section
- 0059 A trash minute is a mow, and density is bought with weak bodies

Four records merge into another, each carrying one surviving decision.

- 0048 into 0002: power arrives only from authored carriers, and nothing in the game reads the player's power to place a carrier, move an offer or make up a miss.
- 0035 into 0005: the pool's admission rule gains the homing constraint, at most one line homing at a time and never always-on, with the revisit trigger for a second homing line. ADR 0005 is itself demoted, so the cap lands in the glossary's Weapon line entry.
- 0006 into 0047: the authored rows are the floor the director adds over, a wave carries its own count and never the formation, and every die draws from its own named seeded stream so a pinned seed replays exactly.
- 0015 into 0019: fixed ticks, seeded streams as the only dice, and every approximated operation rounded through one module, which is the premise the witness exists to prove.

Twenty-eight records are demoted.

- 0004 to game-concept.md, The core loop
- 0005 to CONTEXT.md, Weapon line
- 0011 to game-concept.md, the controls line, with the touch-cap trap to the lessons file
- 0013 to the feature playbook, the verification menu
- 0016 to CONTEXT.md, Mob type
- 0018 to CONTEXT.md, the Tape and Observation entries
- 0021 to CONTEXT.md, a new Instrument entry
- 0028 to CONTEXT.md, a new Ending entry
- 0030 to the replay grill record's superseded quantisation paragraph
- 0032 to CONTEXT.md, a Frame row entry
- 0033 to CONTEXT.md, Verification readback
- 0036 to weapon-pool-review.md, Repel
- 0037 to game-concept.md, the Size is health section
- 0039 to the value-band research record, section 7.6
- 0040 to the value-band research record, section 1.4
- 0041 to CONTEXT.md, Arriving beat
- 0044 to weapon-pool-review.md, Territory
- 0052 to stage-floor.md section 4
- 0053 to playing-harness.md sections 2 and 4
- 0054 to show-what-you-have.md, a ladder section
- 0055 to show-what-you-have.md, a fallen rung section, with the harness take-rate sentence to playing-harness.md
- 0057 to CONTEXT.md, Store
- 0058 to weapon-pool-review.md, the freshness defect section
- 0060 to mow-ladder-director.md, a stage growth section
- 0061 to CONTEXT.md, a Language preamble
- 0062 to CONTEXT.md, a new Reading entry
- 0063 to CONTEXT.md, Starting condition
- 0064 to the tuning record

Sixteen records are deleted outright: 0009, 0010, 0012, 0020, 0022, 0023, 0024, 0025, 0026, 0029, 0031, 0038, 0045, 0049, 0050 and 0051.

## Appendix: every card

| # | Title | Component | Reversal cost | Hard-won | In the moment |
| --- | --- | --- | --- | --- | --- |
| 0001 | A grave in a vertical scroller | concept and frame | a full redesign of frame, camera and stage structure | no | no |
| 0002 | Corpses are fuel and carriers meter power | swallow economy | rewrites witness state, bumps the witness version, forces test regeneration | yes | no |
| 0003 | Size is health | grave and floor ladder | a tuning row plus regenerating the tests tied to the ladder | yes | no |
| 0004 | One freshness meter | swallow economy | retunes the scroll coupling and every payout together | no | no |
| 0005 | Weapon lines are a pool | weapons and lines | every existing line re-derived into a category, and the bell rewritten | yes | no |
| 0006 | Authored waves, not a director | director and stage flow | re-litigating the rank-failure caution and rebuilding the timeline | no | no |
| 0007 | Bosses are always shootable | bosses | the tell is cheap, but removing it re-hides boss hits entirely | yes | no |
| 0008 | The belch: full only, gas everywhere, shove nearby | weapons and lines | sim behaviour plus regeneration, across three layered supersessions | yes | no |
| 0009 | Creation-web template base, React out | architecture and code rules | a full re-scaffold and migration off the template | no | no |
| 0010 | The prototype boundary | process and vocabulary | nothing structural, only routing and registry entries | no | no |
| 0011 | Each input owns its speed | controls and input | a shared touch cap brings back the felt input lag | yes | no |
| 0012 | Fresh seed per run, pinned seed as instrument | tape format and replay | identical playthroughs return, and URL precedence needs rework | yes | no |
| 0013 | The sim verification contract | harness and readings | rewriting the harness and re-authoring every spec test | no | no |
| 0014 | Readability layering | HUD and frame | rewriting the layering test, the palette test and the research behind them | no | no |
| 0015 | Determinism across devices | tape format and replay | cross-engine divergence splits two runs within a minute | yes | no |
| 0016 | Mob types and formations are pools | director and stage flow | re-deriving the formation library and re-authoring every wave | no | no |
| 0017 | One execution authority | architecture and code rules | hours to days re-threading three paths and dismantling the fence | no | no |
| 0018 | The tape format | tape format and replay | a rewrite, with every downstream tape rule on it and old tapes orphaned | no | no |
| 0019 | The witness and the refusal rule | tape format and replay | a rewrite: the field list and checkpoints are baked into every tape | yes | no |
| 0020 | Replay ships and is not a challenge | tape format and replay | pulling a shipped player-facing capability | no | no |
| 0021 | The instrument's purposes are an open pool | harness and readings | nothing structural, but closing the pool re-litigates every addition | no | no |
| 0022 | Instrumentation controls are gated at build time | harness and readings | measurement and dev controls become reachable in the player build | no | no |
| 0023 | Invariants are always on | harness and readings | reviving the unchecked path and re-auditing every tape since | yes | no |
| 0024 | Invariant faults carry severity | harness and readings | dropping the recoverable path and re-grading all fourteen checks | yes | no |
| 0025 | The stage watch belongs to Execution | director and stage flow | risks the field entering the witness fold | no | no |
| 0026 | A partial tape is a valid tape | tape format and replay | every interrupted run becomes unreadable | no | no |
| 0027 | The header records resolved values, never absences | tape format and replay | a migration over every existing tape | no | no |
| 0028 | The run's outcome is orthogonal fields | tape format and replay | losing faulted-but-continued against faulted-and-aborted | no | no |
| 0029 | The tape holds exactly what the simulation consumed | tape format and replay | a bot tape holding what the simulation never consumed, or replay drift | no | no |
| 0030 | Steering carries the simulation's own precision | tape format and replay | a permanent diagonal error in every future tape, to save four bytes a tick | yes | no |
| 0031 | Damage is attributed in both directions | tape format and replay | unrecoverable for any tape already recorded | no | no |
| 0032 | The frame row | tape format and replay | losing why a frame bought nothing, for every frame already recorded | yes | no |
| 0033 | Verification readback is not replay | tape format and replay | cheap in wording, but every module, test, commit and ticket needs re-auditing | no | no |
| 0034 | A power-up is an offer of three | weapons and lines | a rewrite of the offer, the bank and the economy, plus regeneration | yes | no |
| 0035 | Homing is capped at one | weapons and lines | cheap now, but a second homing line needs a new rule | no | no |
| 0036 | The bell is a timed pulse of cones | weapons and lines | a rewrite of the bell's damage shape and its per-level tuning rows | yes | no |
| 0037 | Live mobs are never food | grave and floor ladder | a rewrite of the contact interaction and the floor-ladder rules on it | no | no |
| 0038 | The belch binds to a dedicated button | weapons and lines | a control-scheme rewrite, plus rebalancing the set piece built on it | no | no |
| 0039 | The field boundary is a readout | HUD and frame | a rendering and contrast rework with a fresh palette pass | yes | no |
| 0040 | A hit announces by subtraction | HUD and frame | a rewrite of the hit-feedback layer and its flash-rate arithmetic | no | no |
| 0041 | A mob holds the arriving motion for a beat | director and stage flow | a small timing tweak | no | no |
| 0042 | A set piece names the property it must keep | director and stage flow | set pieces could re-pin mob casts, undoing the pools' open membership | yes | no |
| 0043 | Recorded content is self-describing | tape format and replay | a wire-format break, already paid twice | yes | yes |
| 0044 | Territory is autonomous controlling ground | weapons and lines | a rewrite of Territory's targeting, levels and tuning ladders | yes | no |
| 0045 | The birthright is the skull stream alone | weapons and lines | cheap to flip, but reopens the floor ladder's thinness and early scaling | no | no |
| 0046 | A run's roster is drawn from a growing pool | weapons and lines | undoing the game's first stored cross-run state | no | no |
| 0047 | Directed density inside authored beats | director and stage flow | a rewrite of the director's signal and its ties to the ladder and the offer | no | no |
| 0048 | A missed carrier is missed | weapons and lines | a rewrite of the schedule's carrier supply and its surplus numbers | no | no |
| 0049 | The stage runs eight to ten minutes | director and stage flow | a rewrite of the stage tables and boundary events, not a number bump | no | no |
| 0050 | Three sections, and one boundary is not a boss | director and stage flow | a new boss authored, and the north star's boundary wording changed | no | no |
| 0051 | The drain-out becomes a sparse last wave | director and stage flow | a cheap wave-table tweak that breaks the director's relaxation timing | yes | no |
| 0052 | The Undertaker's length is bought in phases | bosses | a day of tuning against the harness's time to kill | no | no |
| 0053 | The playing harness is one policy over many seeds | harness and readings | widening the knobs is fine, renaming the header field is a format bump | yes | yes |
| 0054 | The ladder reads twice, in the storm and on the HUD | weapons and lines | a design regression, not a code revert | yes | yes |
| 0055 | A stripped rung falls onto the field as a body | weapons and lines | a mechanic swap, not a tuning row | no | no |
| 0056 | The director spends a finite budget per section | director and stage flow | a second format bump, a field pulled from every header, orphaned rows | no | yes |
| 0057 | Every run lands in one store | tape format and replay | standing up a second system, or going back to hand-carried files | no | no |
| 0058 | Each on-swallow line pays in its own currency | weapons and lines | cheap in code, but reopens a known correctness gap under the mow | no | yes |
| 0059 | A trash minute is a mow | mobs and density | a data change, but a return to a feel already played and rejected | yes | no |
| 0060 | Growth over the run is authored per section | director and stage flow | a data-table rewrite across every section, plus dropping the repeat fields | no | yes |
| 0061 | The system vocabulary is the genre's | process and vocabulary | renaming six terms across the code, and another readings-version bump | yes | no |
| 0062 | A reading's meaning is declared | harness and readings | comparisons infer meaning from shape again, and the guard test goes | yes | yes |
| 0063 | A run's starting condition is one record | architecture and code rules | reopens the divergence bug, and rolls the tape format back a version | yes | yes |
| 0064 | A tuning magnitude is a row of one record | architecture and code rules | removes sweep comparability for every tuned value, a wide edit | no | yes |
