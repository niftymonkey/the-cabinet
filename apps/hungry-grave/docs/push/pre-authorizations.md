# Pre-authorizations for the V1 push, draft (2026-09-07)

Each line is one standing yes for the length of the push. Mark strikes or edits any line; whatever remains is the list the push runs under. Anything not on this list needs its own yes at the time, which under the stuck rule means a Discord note and a pause of that thread.

## Authorized for the whole push

1. **Commit** on branch `hungry-grave-v1` in its worktree, as often as the work lands. Conventional single-line messages. The CodeRabbit CLI runs before every commit that contains code and its findings are addressed first. The relevant gates run through the commits.
2. **Push** the branch to origin at any time, for safety and so a cloud session can chain from it.
3. **Open the pull request** against main when the done line is met, and a draft PR earlier if a cloud session needs it for visibility. No test plan section, no generated-with footer.
4. **Deploy** to hungry-grave.vercel.app freely: it is Mark's own play address, not production.
5. **Tickets:** create the new tickets the path names, rewrite #85, #39, #31, #49, #72 and #86, close #67, #37 and #26, and move #38 and #47 off the road, all per `path-draft.md`. Bodies carry problem and need only; approach goes in a follow-up comment. Ticket numbers go in commit messages for doc commits.
6. **ADRs:** file the grill's decisions as ADRs (edit-in-place where the question is the same, a new number for a new question), update the learnings doc, and rewrite the affected design docs and glossary entries. Progression and density ADRs pass the game design gate before filing.
7. **Roadmap:** edit `scripts/roadmap/v1.yaml` per the path and republish the roadmap artifact at its existing URL.
8. **Craft calls** are mine: set piece identity, boss chunk pattern, section feel, tuning data, test design, file layout, HUD form, consent wording, asset choices. Each is backed by research or measurement and written in a design record on the branch.
9. **Assets:** convert the three packs and any Kenney CC0 pack into game-ready output (mp3 loops, composed background strips, one sprite atlas) and commit that output; raw packs stay in a gitignored staging folder. The sourcing recipe becomes a project rule.
10. **Store:** create and migrate tables on the Neon database `hungry-grave-runs`, write to and read from the Blob store `hungry-grave-tapes`, ship the upload function and the consent toggle. Harness batches may upload rows and bytes.
11. **Subagents:** spawn freely under the lean rule: Opus for code and research, Sonnet or Haiku for mechanical work, gates on the inherited model until Fable caution, then Opus.
12. **Usage:** run under the rewritten `stay-within-limits` skill and its thresholds. At a Fable stop, write the handoff, commit it, and chain a new session on Opus (cloud routine or `claude --bg`).
13. **Discord:** send stuck notes and the one done message to Mark's channel. Nothing else.
14. **Dependencies:** add packages the plan needs (the Neon driver, the Blob client, an audio or image tool for asset conversion) via pnpm.
15. **Cloud (if chosen):** run the dry run and the push as cloud sessions on the branch; widen the network allowlist to what the tools need.

## Not authorized, ever, during the push

- Merging into main. Mark reviews the branch and gives the merge its own yes.
- Deleting or rewriting anything on main, force-pushing any branch, or touching any other worktree or repo.
- Changing or adding store products, plans, or anything that spends money.
- Uploading a person's run without the consent toggle on.
- Turning a craft call into a rule change or a new ADR-level commitment Mark did not make; those go in a design record with a note, and the ADR waits.

## Needed from Mark before the push starts

- Cloud or local.
- If cloud: a CodeRabbit API token and a Vercel token as environment variables on the cloud environment, plus the store keys (copied from the Vercel project env). One dashboard step each.
- The done line, confirmed: spec tests and `pnpm verify` green; harness batches show the sharp hand reaching the Undertaker on most seeds and the sloppy hand on fewer; a run uploaded from the deployed build lands as a row plus bytes that replay; every gate clear; CodeRabbit clean on the tip; then one play by Mark.

## One writer at a time (Mark, 2026-09-07)

Coding dispatches are serial: one runs alone on the branch, ends in a commit, and the next starts from that commit. Parallel agents are allowed only for read-only work (research, review, gates) or for files no other live agent touches. Never two cloud sessions on the same branch. The branch is pushed to origin before any cloud session starts, and every cloud session pulls before it writes.
