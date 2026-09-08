# Pre-authorizations for the V1 push (reviewed by Mark 2026-09-07)

Each line is one standing yes for the length of the push. Mark reviewed the full list on 2026-09-07; his edits are applied below and marked. Anything not on this list needs its own yes at the time, which under the stuck rule means a Discord note and a pause of that thread.

## Authorized for the whole push

1. **Commit** on branch `hungry-grave-v1` in its worktree, as often as the work lands. Conventional single-line messages. The CodeRabbit CLI runs before every commit that contains code and its findings are addressed first. The relevant gates run through the commits.
2. **Push** the branch to origin at any time, for safety and so a cloud session can chain from it.
3. **Open the pull request** against main when the done line is met, and a draft PR earlier if a cloud session needs it for visibility. No test plan section, no generated-with footer.
4. **Deploy** to hungry-grave.vercel.app freely: it is Mark's own play address, not production. Confirmed by Mark 2026-09-07 after he minted a Vercel token with `vercel tokens add`, so cloud sessions can deploy; the earlier plan of local-only deploys at the end is withdrawn.
5. **Tickets:** create the new tickets the path names, rewrite #85, #39, #31, #49, #72 and #86, close #67, #37 and #26, and move #38 and #47 off the road, all per `path-draft.md`. Bodies carry problem and need only; approach goes in a follow-up comment. Ticket numbers go in commit messages for doc commits.
6. **ADRs:** file the grill's decisions as ADRs (edit-in-place where the question is the same, a new number for a new question), update the learnings doc, and rewrite the affected design docs and glossary entries. Progression and density ADRs pass the game design gate before filing.
7. **Roadmap: struck by Mark 2026-09-07.** No roadmap edits and no artifact republish during the push. Tickets are the status source; when Mark asks where things stand, the answer is read from the tickets and the branch.
8. **Craft calls** are mine: set piece identity, boss chunk pattern, section feel, tuning data, test design, file layout, HUD form, consent wording, asset choices. Each is backed by research or measurement and written in a design record on the branch.
9. **Assets:** convert the packs into game-ready output (mp3 loops, composed background strips, one sprite atlas) and commit that output. Staging, agreed with Mark 2026-09-07: the music loops were converted to mp3 on his machine before the push and the two pixel packs were copied raw, all under `apps/hungry-grave/assets-staging/` (gitignored, on disk in the worktree only; they were tracked on the archived cloud branch `hungry-grave-v1-cloud` and never enter this branch). The raw wav files never enter git. The sourcing recipe, which becomes a project rule: vector placeholder first; then the staged packs; then an on-theme free itch.io pack through the itch.io API (`https://CREATOR.itch.io/PACK/data.json` for the id, `https://itch.io/api/1/$ITCH_API_KEY/game/ID/uploads` for the files, `https://itch.io/api/1/$ITCH_API_KEY/upload/ID/download` for the link; verified 2026-09-07 on a free pack; butler cannot fetch web-uploaded packs); then Kenney CC0 by scripted zip from the asset page; then stop and ask.
10. **Store:** create and migrate tables on the Neon database `hungry-grave-runs`, write to and read from the Blob store `hungry-grave-tapes`, ship the upload function and the consent toggle. Harness batches may upload rows and bytes.
11. **Subagents:** spawn freely under the lean rule: Opus for code and research, Sonnet or Haiku for mechanical work, gates on the inherited model until Fable caution, then Opus.
12. **Usage:** run under the rewritten `stay-within-limits` skill and its thresholds. At a Fable stop, write the handoff, commit it, and chain a new session on Opus (cloud routine or `claude --bg`).
13. **Discord:** send stuck notes and the one done message to Mark's channel. Nothing else.
14. **Dependencies:** add packages the plan needs (the Neon driver, the Blob client, an audio or image tool for asset conversion) via pnpm.
15. **Cloud, historical only. Chosen by Mark 2026-09-07, overturned by Mark 2026-09-08; the build run is local (see "Needed from Mark" below). Kept as the record of what was set up:** run the dry run and the push as cloud sessions on the branch, in the cloud environment `hungry-grave` (Full network access, a setup script that installs ffmpeg, imagemagick, pnpm 10.26.2, the Vercel CLI and the CodeRabbit CLI, and the keys below as environment variables). Sessions start from this worktree with `claude --cloud "<task>"` after a push, and the environment is picked once with `/remote-env`.

## Not authorized, ever, during the push

- Merging into main. Mark reviews the branch and gives the merge its own yes.
- Deleting or rewriting anything on main, force-pushing any branch, or touching any other worktree or repo.
- Changing or adding store products, plans, or anything that spends money.
- Uploading a person's run without the consent toggle on.
- Turning a craft call into a rule change or a new ADR-level commitment Mark did not make; those go in a design record with a note, and the ADR waits.

## Needed from Mark before the push starts

- Cloud or local: cloud was chosen 2026-09-07, then overturned 2026-09-08 after three dry runs left three cloud blockers standing (GitHub API refused, the classifier on `gh api` writes, no usage reading). The build run is local, in this worktree, on Mark's machine. Item 15 stands as a record only.
- Keys on the cloud environment, done 2026-09-07: `CODERABBIT_API_KEY`, `VERCEL_TOKEN`, `ITCH_API_KEY`, `DISCORD_WEBHOOK_URL`, and the store keys, all copied from `apps/hungry-grave/.env.local` (which stays gitignored). No GitHub token is needed; the cloud signs `gh` requests itself.
- The done line, confirmed by Mark 2026-09-08 (with the note that the harness is built inside the run, then plays the seeds): spec tests and `pnpm verify` green; harness batches show the sharp hand reaching the Undertaker on most seeds and the sloppy hand on fewer; a run uploaded from the deployed build lands as a row plus bytes that replay; every gate clear; CodeRabbit clean on the tip; then one play by Mark.

## One writer at a time (Mark, 2026-09-07)

Coding dispatches are serial: one runs alone on the branch, ends in a commit, and the next starts from that commit. Parallel agents are allowed only for read-only work (research, review, gates) or for files no other live agent touches. Never two cloud sessions on the same branch. The branch is pushed to origin before any cloud session starts, and every cloud session pulls before it writes.
