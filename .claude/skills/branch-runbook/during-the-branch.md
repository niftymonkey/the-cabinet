# During the branch

The shared terms, the ladder named "Who answers a question", the branch charter, the handoff, and the resume check are in [`SKILL.md`](SKILL.md).

## A step, in order

1. Write the step's design record from the decision log and the prior art.
2. Run the gates on the step's design record ("Gate points").
3. Write the step's coder contract and its slice entries from the design record ("The slice entry and the coder note").
4. For each slice, in run order: dispatch one coder, then land the slice ("Commits and reviews").
5. Run the gates on the built result ("Gate points").
6. Fold and delete the step's working records ("Process records").

While building, record each decision in the step's design record with its evidence. The design record is the home for decisions made during a build. An ADR comes only from the ADR pass at the branch close ([`end-of-the-branch.md`](end-of-the-branch.md)).

## The main session and its agents

The main session plans, decides, and reviews. Cheap agents read and gather for it.

The branch is checked out in its own git worktree: a second folder of the repo, separate from the main repo folder where Mark works and other sessions run. All work on the branch happens in the worktree, and the main repo folder stays untouched. One coder builds one slice, and each agent writes scratch files under a name no other agent uses.

One writer at a time, and that includes the main session: it writes the handoff between slices, never during one. A handoff update the watchdog asks for waits until the coder in flight returns.

New tooling and process changes wait. Ticket them and land them between branches.

## The slice entry and the coder note

The plan for a step is one slice entry per slice, in run order. One entry is the plan for that slice and the prompt its coder receives. It says what the slice builds and why, the parts of the code it touches (by name), its tests, what must stay unchanged, and when it is done.

Write each entry from the step's design record. What holds for every slice lives in the coder contract, and what a coder can find by looking at the code stays in the code. The dispatch is the entry plus pointers to the coder contract and the feature playbook. Write the entry so the dispatch carries every item the feature playbook's dispatch contract lists, or the coder stops and reports.

The coder note has a fixed short form: what changed (by name), the verification results, where the entry was wrong about the code, decisions made with their evidence, open items, and last the stuck line. The story of the work stays out.

## Commits and reviews

A commit is one slice: a piece of work whose result can be seen working. The slice's code, its tests, its coder note, and the handoff update go in that one commit. The commit message names the slice by its number and its words on the follow-along list.

How a slice is sized is in [`before-the-branch.md`](before-the-branch.md), under "The step order".

Land after every slice. After the coder returns, the main session lands the slice in this order:

1. Run one CodeRabbit review on the slice. Send each finding down the findings ladder ("Findings"), or decline it with a reason.
2. Update the handoff. It names this slice as the last landed slice.
3. Commit and push. Every commit is pushed at once, so origin always holds the latest work.
4. Update the slice's status on the follow-along list.
5. Check usage against the stop lines before the next dispatch ("Usage stop lines").

## Gate points

The three gates supply judgement Mark does not have in game design, game engineering, and product stewardship. Run them at the two points where that judgement can still change a decision:

- On the step's design record, before slice entries are written from it.
- At the close of the step, on the built result.

Slice entries go straight to the coder. They carry decisions the design record gate has already read.

## Findings

A finding is a problem that a gate, a reviewer, or a measurement reports during a build. Route each finding down the ladder and stop at the first rung that fits:

1. Fix it in the task at hand.
2. Write it into the next dispatch that touches that area.
3. File a ticket that names its return point: the step, the branch close, or the named later work that picks it up.
4. Ask Mark, only when prior art and data cannot decide it and it is hard to reverse.

A finding that argues against something Mark ruled changes nothing. The build follows his ruling, and the finding goes on the handoff's "for Mark's read" list.

## Reaching Mark when stuck

When an attempt fails, look up the prior art and try it.

Stuck means one of three things: two honest attempts failed and the prior art failed too; the decision is Mark's alone and hard to reverse; the next step is hard to reverse and nobody authorized it.

The coder, when stuck, stops the slice and returns a stuck report to the main session: what it tried, the prior art it found, why that failed, the decision needed, its recommendation. The coder's half of this rule goes in the step's coder contract, once, and never in a slice entry. Every coder return ends with a stuck line: "none", or the report.

The main session, on a stuck report or when stuck itself, checks that the prior art was looked up and tried, and does that first where it was not. If the problem still stands, it sends Mark one Discord note that carries the report whole, continues with work that does not depend on the answer, and records the note in the handoff.

## When Mark is present

Mark is sometimes at the computer while the branch runs. His input then is a shortcut. The rest of the runbook stays as it is.

Keep what waits for him visible. Say each call as it is made, with its reason. Keep the handoff's "for Mark's read" list and the list for his next play current, and name any human work that is coming, such as a grill.

When he answers a waiting item or overrules a call, that is the ruling. Record it in the design record and clear the item from its list. Read the recorded line back to him. If it makes the slice in flight wrong, stop that coder. Otherwise apply it from the next slice.

When Mark returns and writes to the main session, for any reason, answer him first. Then say in one line what waits for him, and offer to go through it now. Make the offer once each time he returns. If he takes it, bring the items that already wait, the most blocking first, one at a time. Human work that was planned for later can happen right then.

## When a rule changes

When Mark changes a rule during a branch, replace the old wording in the same turn, everywhere it lives: the charter, a memory file, a coder contract. One rule has one live wording.

## The follow-along list

The follow-along list is Mark's one page for where the branch stands, and it is the one live plan. The step order from the grill is its first version. When the order changes, the list changes in the same turn.

One row per slice, in run order, numbered in that order. Each row says in one short line what gets built and why, and carries a short status. Write for a product manager: words from the product, none from the engineering.

Add a slice's row when the slice is planned. Update its status when the slice lands. Renumber the remaining rows when the order changes. Done when the list matches the branch after every landed slice.

## Usage stop lines

The stop line is a safe landing. Work never runs into the hard limit mid-flight, where in-flight work and hard-won context are lost. Going past the line is Mark's choice, each time. The line values live in the `stay-within-limits` skill.

At the line, land: bring the slice in flight to a clean commit, push the branch, and write the handoff with the three usage numbers from the `stay-within-limits` check, why work is parked, and the reset time. Then ask Mark. If he is away, send him one Discord note with the three numbers, why work is parked, and the reset time. The work waits for his answer.

On his yes, continue. Landing after every slice holds past the line, so a hard cutoff loses nothing.

## Process records

A step's working records (coder contract, slice entries, coder notes, research records) live on the branch in one folder, committed and pushed. Every agent reads the same notes, and a lost machine loses nothing.

The folder holds the current step only. At the close of a step, after its gates:

1. Fold what later work still needs into the lasting homes: rulings and dropped paths into the step's design record, open items into the handoff. Each ruling keeps the remnant of its research: what the research taught, in a sentence or two, and its sources by name and link. Done when every ruling and every open item in the step's working records has a home outside them.
2. Delete the step's working records in one commit, and write that commit's hash in the handoff. The records stay reachable in git history through it, for the ADR pass and any later reader.
