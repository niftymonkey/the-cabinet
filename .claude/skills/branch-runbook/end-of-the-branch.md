# At the end of the branch

The shared terms and the things the runbook relies on are in [`SKILL.md`](SKILL.md).

## The branch close

The branch's work is finished when Mark says so. Then close it in this order:

1. The ticket pass.
2. The ADR pass.
3. The cleanup pass: delete the working records that are left, and the handoff, the charter, and the decision log, which the ADR pass has read by now. Documents stay only where they earn a long-term place. Code is not swept.
4. CodeRabbit reviews the exact tip commit. The merge gate hook checks this.
5. Open the PR. Where the work was cut short, the PR lists what the plan still needs, in order, in its own section apart from the review tickets.
6. Ask Mark for the merge yes, once, when the review of the tip is clean. The merge is always his.

## The ticket pass

List every finding ticket filed on the branch and give each one an end: fixed on the branch, carried to named later work, or closed with the reason. Done when every finding ticket from the branch is closed or names its return point. It runs before the ADR pass, because its fixes can change what the ADR pass reads.

## The ADR pass

Run the ADR pass once per branch, at the branch close. A finished step, slice, or commit inside the branch is not the trigger.

1. Gather every change, decision, and dropped path from the branch's records, through subagents. Done when every design record and decision log on the branch is listed.
2. Put each item to the future reader, who has none of this work's context. Keep an item only when that reader would likely undo it or re-fight it, and that costs real work or brings back something already rejected.
3. Send each kept item to its narrowest home: a test, the code, the glossary, the design record. Keep for an ADR only what no narrower home can carry.
4. Present the survivors to Mark, each with what it protects and what iteration it slows. He rules each one. An ADR is written only after his yes.

The default is no ADR. A long survivor list means the bar slipped: run step 2 again.
