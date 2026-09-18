---
name: branch-runbook
description: Branch runbook, how Mark and an agent run work on a branch, from the goal to the merge. Use when Mark names work to do (an issue, a ticket, a goal), when a session starts or resumes on a branch, and when a branch closes for merge.
---

# Branch runbook

How Mark and an agent run work on a branch: what happens before the branch, during it, and at its end.

## Find the phase

- Mark names work to do and no branch exists yet: size the work ("The size of the work" below), then follow [`before-the-branch.md`](before-the-branch.md).
- A session starts or resumes on a running branch: do "Surviving a restart" below, then work from [`during-the-branch.md`](during-the-branch.md).
- Mark says the branch's work is finished: follow [`end-of-the-branch.md`](end-of-the-branch.md).

## Terms

These are the terms every file of the runbook shares. Any other term is defined in the section that owns its rule.

- **Branch:** one piece of work on its own git branch, from the grill to the merge.
- **Step:** one stage of a branch, with one goal and one design record. A branch has one or more steps, run in order.
- **Slice:** one piece of a step. One coder builds it, and it lands as one commit whose result can be seen working.
- **Main session:** the conversation with Mark. It plans, decides, reviews, and dispatches agents.
- **Coder:** a subagent that builds one slice.
- **Coder contract:** one file per step with the rules that hold for every coder in that step.
- **Design record:** one document per step. It holds the step's decisions, each with its evidence and how to reverse it.
- **Decision log:** the numbered decisions from the grill before the branch.
- **Handoff:** the one file on the branch that lets a new session continue the work.

## The size of the work

The runbook runs on every piece of work that gets a branch. The parts never drop. Only their size changes. Read the work first, count its slices, and tell Mark the count in one line. When the count changes, the size changes with it.

One slice: the runbook runs in the conversation. The grill asks only what is Mark's alone, and that can be nothing. The plan is one visible message. It names the pre-authorizations it asks for, and his yes to the plan grants them. The charter, the handoff, the follow-along list, and the working records folder are not made, because there is nothing to resume and nothing to follow. The slice entry and the coder contract's rules ride in the dispatch. The gates run once, on the built result.

More than one slice: every part is a file, as written.

## Who answers a question

Prior art is how the industry already solves this kind of problem: shipped products, official docs, standard practice. Nearly every problem here has been solved before.

Every open question, in the grill or mid-build, goes to the first answerer that fits:

1. Prior art and reasoning. State the question first as what the person using the product must see or feel. Then look up how the industry solves that question, reason from the data at hand, make the call, and record it in the design record with its evidence and how to reverse it.
2. An instrument: a test, a harness run, a measurement. Where the instrument cannot answer yet, giving it that ability is the work. Plan it as a slice. An instrument built for something Mark saw is proven on a real recording of what he saw before it is called done.
3. Mark. Only what is his alone: his preference, the direction of the product, the feel of a played thing, and a hard-to-reverse call that rungs 1 and 2 leave open. A feel question waits for a played thing and goes on the handoff's list for his next play.

A question reaches Mark only after rungs 1 and 2 have been tried and named in the ask.

## Surviving a restart

The branch charter is one file on the branch. It opens with a pointer to the `branch-runbook` skill, so a new session loads the way of working. It holds what is specific to this branch: its goal, the pre-authorizations, the never-list, where the branch's files live (the handoff, the decision log, the working records folder, the follow-along list), and pointers to the design records. A pre-authorization is Mark's standing yes for the life of the branch. Commit and push after each slice is one. The never-list is what needs his yes every time. The merge is one. Global rules load on their own and stay out of it.

The handoff opens with a pointer to the branch charter. Every new session on the branch reads the charter, then the handoff, before it acts. Trim the handoff on every rewrite, and keep the lines later work needs: the deletion commits, open notes to Mark, and his two lists.

On start, run the resume check: the working tree is clean, the tip equals origin, and the tip's commit names the slice the handoff calls last landed. Report any gap (unpushed commits, uncommitted files, a slice in flight), then continue from the handoff.

## What the runbook relies on

Each of these has its own home. The runbook points at them and repeats none of them.

- The feature flow (`docs/agents/feature-flow.md`) and its dispatch hook (`.claude/hooks/dispatch-contract.mjs`): how one slice of code is written and tested.
- The merge gate hook (`require-review-before-merge.py`, in Mark's global hooks): CodeRabbit must have reviewed the exact commit being merged.
- The context watchdog (`context-watchdog.sh`) and the session-start hook (`session-start-resume.sh`), both in Mark's global hooks: at the threshold the handoff is updated, and Mark chooses whether the session stops.
- The `stay-within-limits` skill: the usage line values and the check between slices.
- The three gate agents in `.claude/agents/`.
- The anomaly rule in Mark's global rules ("An anomaly is a finding"), and the lessons file (`docs/agents/lessons.md`).
