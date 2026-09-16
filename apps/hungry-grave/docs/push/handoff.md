# Continue: The Hungry Grave

> **Last updated:** 2026-09-16, **session 28 closes here with slice K landed and deployed and this file pruned for the first time since session 1.** **Slice K gave the belch's control a charge arc and moved it to the bottom-left corner** (code `538fd21a9b`, docs `7c935b5627`, round two note section 13): a grey track with a wider arc filling clockwise over it in `PALETTE.reservoirCharge` `0x76b7d7` at luma 67.25, the ready state keeping `graveGlow` and its pulse, and all three colours held inside 0.02 luma of each other so no state announces by getting brighter. **The one thing the coder could not obtain is a full-reservoir screenshot in a headless run**, so the ready state is pinned by test rather than by a picture and **whether a closed amber pulsing ring reads as ready is Mark's play**. Next is slice J2, the dying body, then L, then round two's close. **This file is trimmed on every rewrite from here on, never only appended** (Mark, 2026-09-16): sessions 1 to 27 each appended and none pruned, and it reached 89 KB loaded whole into every session.
> **Branch:** `hungry-grave-v1`, worktree `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/hungry-grave-v1`, tip `7c935b5627`. **Every slice's hashes live in the round two progress note's section 1 table and in `step-4-progress.md`.** **Round two's three files are `docs/design/round-two-wall-belch.md` (the record, rulings R1 to R12 in section 2, findings in section 7), `docs/push/round-two-slice-prompts.md` and `docs/push/round-two-progress.md`**, all under `apps/hungry-grave/`. Cite their sections rather than restating them; this file is the state of play and the standing rules, nothing more.
> **Working tree:** clean and nothing running in it. `pnpm verify` green at slice K: 146 test files, **2075 passed, 21 expected fail, 2 todo**, against J-fix's 2068. **`WITNESS_VERSION` 8, `READINGS_VERSION` 5, `FORMAT_VERSION` 4, `GOLDEN` `-145039082`.** **Round two's `GOLDEN` budget of two ends with one spent**, slice H's; J's permit went unused, K took none and L is permitted none. **Every tape recorded before `2e90597cad` is refused at the decode**, on the witness version. Run `git log --oneline -25` first anyway.
> **Deployed:** **slice K's tip is live on https://hungry-grave.vercel.app**, Mark's own phone-play address; deploy over it freely. **The next deploy is at round two's close**, or earlier if a slice is worth his play. Two build warnings, both pre-existing: `@pixi/sound` sits in the main chunk whatever the dynamic import says, and one chunk is over 500 kB. **Both already have tickets, #50 and #51**, which this file wrongly said they did not.
> **Session shape:** the orchestrator makes every hard call itself or in a Fable subagent; everything else is an Opus or cheaper subagent. **Usage at session 28's close: session low, weekly all 29, weekly Fable 16**; re-read it with the usage script rather than trusting this line. **The caution lines are waived; only the stops apply** (weekly all 85, Fable 95). One code slice per wave. The deploy recipe is `apps/hungry-grave/docs/deploy.md`.

## FIRST ACTION

1. **Enter the worktree.** Run EnterWorktree with `path: /home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/hungry-grave-v1` before anything else.
2. **Run the usage script**, `bash /home/mlo/dev/niftymonkey/claude/skills/stay-within-limits/usage.sh`, and read it against the stops above.
3. **Run `git log --oneline -25`, then `git status --short`**, one plain command per Bash call, and confirm the tip and the clean tree this file claims.
4. **Slice J2, the dying body, is next**, entered in the record's section 4 and its prompt written by a separate agent as session 28 closed; read `round-two-slice-prompts.md` for its section before assuming it is missing. It is R10's held separate-clocks lever, and Mark's sighting of 2026-09-16 is its trigger: *"12 to 15 mobs get pushed and easily 5 or 6 that were right next to those other ones that did get pushed did not get pushed"*, all at about the same distance. **Session 27 proved the belch itself is fair**: twelve bodies on one ring at one distance took identical impulses, identical `firstStep`, `ticksLeft` and `shovesLeft`. **What is not fair is what happens next**: over the 90 ticks of flight six of the twelve died and stopped dead where they died, at flight ticks 18, 31, 31, 33, 66 and 66, because a corpse carries no impulse. **A second cause is named and not ruled out**: the reach is a hard edge with no falloff, and J-fix made the drawn ring and the real reach one circle, so his next play is evidence on whether that was part of it.
5. **The tape's blind spot rides with J2 rather than alone**, because that slice already moves a version. Mark, 2026-09-16: *"Literally everything that we need to care about and measure should have some representation in our tape. That's the whole point of it so that we can measure things and iterate."* Today `belched` carries `cancelled` and `shoved` and **nothing at all about the misses**. **The belch's record must carry, per press, every body in the frame with its distance, whether the press moved it, and which gate refused it.** Together the two halves are **`WITNESS_VERSION` 8 to 9 and `READINGS_VERSION` 5 to 6**, both past what the record's section 5 permits and both taken under one-push mode for Mark's read at merge. **`GOLDEN` is ruled**: a corpse gaining folded fields moves the checksum at their resting zeroes, a further re-pin past R9's two named slices, and the orchestrator granted it on 2026-09-16 under one-push mode as a dated closing paragraph on R9, bounded to one re-pin, with the coder owing an isolation proof (old fold with the new field at rest returns `-145039082`) before pinning.
6. **Then slice L**, one Opus coder, a usage check between: the Wall becomes a real wall only a belch opens (#123, the L section of the prompts file written ahead at `40adc7edd5`, progress note section 14). Its input list already names J-fix's reach as what its curtain measurement is taken against.
7. **Then round two's close**: the three gates on round two's diff, CodeRabbit on the tip, a batch, and a deploy.
8. **Then step 5, "Show what you have"**, which Mark ruled on 2026-09-16 comes straight after round two: #72's layout with the score, the weapon levels and the falling level on screen. **It is planned the way steps 3 and 4 were**: a design record, gates on it, slice prompts, then one Opus coder per slice.
9. **Then the tuning-record step**, draft at `apps/hungry-grave/docs/push/drafts/step-5-tuning-record-draft.md`. **Mark moved it behind step 5 on 2026-09-16**, against his own 2026-09-15 order, because his instruction is V1 first and iterate later. Its eleven decisions are unruled and the orchestrator rules them before any coder is dispatched; the tuning-step inputs below are its first sweep.
10. **Write the follow-along document's row for a slice when its prompt is written, not when it lands** (Mark, 2026-09-16, after he did not know what slice L was). The doc is https://md.niftymonkey.dev/api/raw/CTtB5BJJ, edited through the md.niftymonkey.dev targeted-edits API with `MD_API_KEY` from the environment. **Session 28 brought it current through slice K (revisions `rv_SSj1F1zt` and `rv_FjTYv6r0`): a "Step 4, round two" subsection with a row per slice, K marked live, the dying-body row marked as being planned, and step 5 before the tuning tool.** Read the live doc before writing to it. It is for a regular human: what it is and what it means for the game, no hashes, no counts, no process jargon.
11. **#131, #132 and #130 are outside round two and are Mark's to schedule.** #131 is the boss's per-toll tell plus the shed armor pieces, #132 is the Waking's source taking a resisted push, and #130, typed agent roles, he wants at a pause point between pushes and never mid-push.
12. **No asking**: the work is ruled, and the stops are the stuck rule and the usage stops and nothing else. **The handoff is still written when the context watchdog fires**; only the stop and the `/clear` ask are waived.

Push records are the tracked copies in `apps/hungry-grave/docs/push/`. The isolation guard refuses writes to the main checkout and refuses compound Bash that mentions git even in quoted text; use plain separate commands. The stop hook error about `local/publish-instruction.mjs` is harmless (open item 0 below).

**This file is the continue document and it is ephemeral.** It is tracked on the branch only because the worktree cannot see the main checkout's gitignored `continue-hungry-grave.md`, which is now a pointer here. Delete it when the push merges.

## STEP 4 BRIEF: the mow, the ladder, the director

**What step 4 is**, what it ruled, where the game was before it and every one of its eighteen plan steps: `apps/hungry-grave/docs/design/mow-ladder-director.md` for the design and `apps/hungry-grave/docs/design/step-4-mow-ladder-director-dispatch.md` for the plan, whose section 10 is the step order.

**Steps 0 through 15 are done and closed**, slices A0 through G landed and deployed, and the running detail with every hash is `apps/hungry-grave/docs/push/step-4-progress.md`, sections 6 through 19.

**Step 16 is round two and it is what is building**; its own table is below.

**What must not move at any point**: the fences, the invariants, replay determinism.

## Mark's reads

His phone and localhost reads through 2026-09-15 are recorded where they were acted on: the 2026-09-14 reads became tickets #122 to #125, and the 2026-09-15 evening reads on H2 and J are in `round-two-wall-belch.md` section 2 under R10 and R12 and in the round two note's slice sections. **What is still owed from him is a read of the deployed belch and meter**, because his last belch read was taken on the build before slice J.

## Mark's rulings

His 2026-09-09 rulings are `mow-ladder-director.md` section 2 verbatim, and his 2026-09-15 rulings are `round-two-wall-belch.md` section 2 as R1 to R12 plus ADRs 0007, 0008 and 0042. **Three rulings of 2026-09-16 are not written anywhere else and live here until they are:**

1. **This handoff is trimmed on every rewrite, never only appended.** Prune what is recorded elsewhere on the branch and cite where it lives.
2. **Step 5, "Show what you have", is built right after round two closes, and the tuning-record step moves to after it.** He picked this over his own 2026-09-15 order because his 2026-09-16 instruction is V1 first, iterate later.
3. **The follow-along document gets a plain-words row for every slice when its prompt is written**, not when it lands, because he did not know what slice L was.

## Findings filed for Mark's read, not applied

Each is a finding against something he ruled, so it is written down and built past. **Everything this section used to carry that is now closed, superseded or recorded elsewhere has been cut**; the fuller versions live in `round-two-wall-belch.md` section 7, `round-two-progress.md` sections 8 to 13 and `step-4-progress.md` sections 13 to 19.

**Waiting on his read.**

- **The ladder does not open across 96 bot runs** (record section 7): median one rung a run, nothing bought at all in 20 and 19 of 48, level 5 on no line. The bot does not hunt carriers, so it is a floor rather than the truth. **For him: next time he plays, did he reach rung 3 on any line.**
- **A body costs about a third fewer hits by minute six** (record section 7), which is the evidence `mow-ladder-director.md` section 12 item 6 asked for when the per-minute enemy health step was struck. That record marks the call as his.
- **The witness moved 7 to 8 inside round two, which the plan did not carry**, and J2 moves it to 9 with the readings to 6 beside it. All are the orchestrator's call under one-push mode, and each witness move makes every tape before it a dead baseline. **A plan change is his to see at merge.**
- **The push ladder has flattened and the Waking's corpse property has become dominant** (round two note section 10): rung one to rung five went 6.7 times to 1.6, the corpse property 1.51 to 6.8. **It follows from R2 exactly as he picked it**, so nothing was built past; it is the clearest number for him to react to when he next plays a high bell.
- **A toll's damage now steps to nothing at a line inside the cone that is never drawn** (round two note section 10), the body's travel its only tell. That is R10 working, and whether the step wants a visible edge is a feel question.
- **The bottom-left corner is the hard-reach corner for a right-handed one-handed grip** (record section 7). He ruled the corner and ruled handedness future work, so slice K made the move as ruled.
- **The charging control is now as loud as the ready one used to be** (round two note section 13), because ADR 0054 forbids the old alpha step. Whether the corner reads as too loud on a real device is his.
- **A full build's doubled throughput puts the nominal run at about six and three quarter minutes against ADR 0049's eight** (step 4 note section 15). CodeRabbit asked twice to retune boss health or `BOSS_STORM_SHARE` back inside the band and both were declined, because the damage lane is ruled. It stands as an `it.fails` tripwire.
- **CodeRabbit's major on slice I was declined** (round two note section 9): fold `impulse.source` and bump the witness with it. **A reviewer's major built past is his to see at merge.**

**Tuning-step inputs, its first sweep list.** Each is measured in full where it is cited and none is anyone's build.

- **The purses are priced above what the quiet interval lets a section spend**, and the director takes three quarters of the Procession's empty ticks (record section 7, step 4 note section 18).
- **At rungs four and five the storm kills bodies before a belch shove can carry them**, and **the living fringe is wide but shallow**, a damage reach of 0.47 in place of 0.7 roughly doubling its depth (round two note sections 10 and 11).
- **The belch is the least observable thing in the game and it is the thing being changed.** No hand tape and no conditioned tape can carry one, so **measuring a belch wants a new named configuration** (round two note sections 11 and 12, and slice K hit the same wall). Item 5 above is the other half of it.
- **Slice J-fix missed its second pass line and nothing was tuned to reach it**, and **the eruption's front no longer pictures the field-wide gas** (record section 7, round two note section 12). Both are candidate reasons a press can still feel like it did nothing.
- **A hit costs about 46 seconds of mowing at rung 1 and about 12 at rung 5**, against about 5 on the dead baseline (step 4 note section 15).
- **Territory's bottom rung inverts against his #79 dwell ruling**: two pulses is a shambler now and a level-one crossing lands five. **#125 is the felt half and is still unruled.**

**Open against tickets, one line each.** #122, the offer is not separable at a glance in a Crowd-density field. #129, a body touching the grave does the dominant harm and there is no tell. #128, the renderer walks every pool slot at the derived caps. #50 and #51, the two build warnings.

**Owed to whoever next touches the code they sit in.** `src/dev/readings/repel.ts` carries a stale sentence, "push only exists at bell levels 4 and 5", in its JSDoc at line 19 and in `__tests__/repel.test.ts` at line 54; it is wrong at every rung now. A stale "ramp" comment survives at `digest.ts:316`. **The trash's `mobFire` stream is drawn by nothing at all in a whole run** (step 4 note section 17), so a reading that treats a moving `mobFire` cursor as evidence is reading a stream nothing spends.

## The three implementation gates, plan step 14

**Read and closed, none blocking and none saying `gate disagrees`.** The surviving record is `round-two-wall-belch.md` section 7 and the tickets it names; their findings files are gone with the job's scratch folder.

## The 48-seed batch, plan step 15

**Read and closed, and it is what closed density round one.** The four headline findings and the rest of the read are `round-two-wall-belch.md` section 7; the reports are `apps/hungry-grave/local/batches/steady-far-birthright-1789459315771` and `loose-far-birthright-1789459319726`. **#118 did not reproduce in 108 bot runs and stays open on Mark's own sighting.**

## Round two

| Slice | What it is | Where it stands |
| --- | --- | --- |
| ADR commit | ADR 0008 re-ruled to the shove, ADR 0042 for the Wall | landed, `ec87a2e9e7` and `40adc7edd5` |
| R-fix | the three tech gate findings | landed, note section 7 |
| H | the shove is a body travelling, witness 7 to 8 | landed, note section 8 |
| I | the shove is measurable, readings 4 to 5 | landed, note section 9 |
| H2 | the toll's push is watched and outreaches its damage | landed and deployed, note section 10 |
| J | the belch is three waves of pushback and takes no health | landed and deployed, note section 11 |
| J-fix | the belch reaches half the field's width | landed and deployed, note section 12 |
| K | the meter fills and moves to the bottom-left corner | landed and deployed, note section 13 |
| J2 | a body killed mid-shove finishes its flight, and the press records what it missed | prompt written by another agent, record section 4, FIRST ACTION items 4 and 5 |
| L | the Wall is a real wall only a belch opens | prompt written at `40adc7edd5`, note section 14 reserved |
| close | three gates on the diff, CodeRabbit on the tip, a batch, a deploy | not started |

**R12's motion slice is gone**: its speed question closed at the floor R3 already fixes, which is the value J-fix deployed, and its curve and body halves are tuning-step inputs on his instruction to stop getting caught on little things and reach a full V1.

## Open items with no other home

0. **Stop hook error in this worktree, harmless, not to be chased.** `scripts/roadmap/on-v1-change.mjs:23` imports `local/publish-instruction.mjs`, which lives only in the main checkout. The fix is copying that one file into the worktree's ignored `local/` folder; if the error returns, the copy is missing again.
1. **Open tickets against step 4, none blocking.** #118 the Undertaker deadlock, open on Mark's sighting. #117 is Mark's alone. #116, #121, and the deferred gate findings on #39 and #109.
2. **The human-tape replay divergence** on `b1c3a584d1` is undiagnosed and its evidence is preserved at `docs/push/divergence-b1c3a584d1.md`, because after slice A the tip cannot reproduce that run at all. Mark: it cannot be allowed to fail, and a test holds the cause once known.
3. **#82 and #37 stay open deliberately.** #82's fix is on this branch only, so it closes at merge; #37 (boss stories 12-14, fog story 22) waits for the path's step 2.
4. **540x760 records disagree** (`layout.test.ts:67`, `field.ts:4`, `CONTEXT.md:85`), docs-only fix pending.
5. **Stamp-order trigger** on PR #84's stamp thread: a second output in `v1.yaml` `outputs:` moves the stamp into the hook. Dormant while roadmap edits are struck.
6. **Stream flank narrowness**, Mark: "the edge thing could be an issue". Watch item, arithmetic in `soulStream.ts` JSDoc.
7. **`local/grill/` at the main checkout is stale** (moved onto the branch 2026-09-07); Mark can delete it. **The rewritten `stay-within-limits` skill files are uncommitted** at `/home/mlo/dev/niftymonkey/claude/skills/stay-within-limits/`, and the worktree guard blocks committing them from this session.
8. **Cloud push playbook** at https://md.niftymonkey.dev/v/NCQUpIOq (memory `cloud-push-playbook`); the three dry runs and the local ruling are its inputs when Mark next wants it refined.
9. **The shove and the impulse still have no `CONTEXT.md` entry of their own.** Slices H, I, H2, J and K each flagged it and none added one. **It is a glossary decision for the orchestrator**, folded into a dispatch or filed as a ticket, and **never asked of Mark cold**.
10. **Candidate ADR: a reading may not inherit a meaning from the shape its value happens to have.** It is already the stated reason behind three declines (step 4 note section 19, round two note sections 8 and 9) and lives only in `comparisonDeclared.test.ts` and three progress notes. **The orchestrator files it when a slice next touches the readings**, and Mark reviews it before merge.
11. **The wisp-cap silence is still open.** `launchWisps` takes a null slot from `takeSlot` and returns, so a truncated volley raises nothing and moves no counter, against the rule that nothing abnormal is ever silent. Slice I added no fourth counter, no fault identity and no invariant check. **The trigger is the next time either line cap is measured binding.** No ticket, and none is needed.
12. **`STREAM_SALTS` decouples a stream's salt from its name** so a rename never re-seeds a run. It was forced by a real divergence in slice B0 rather than chosen, and it reads as incidental until someone tidies it away. Step 4 note section 13.

## Standing rules and facts, still true

- **Craft calls are settled by research, and precedent outranks our own record (Mark, 2026-09-09).** Naming and every craft number comes from research off the main thread; a record that disagrees with precedent is re-ruled to precedent rather than amended to permit both; his rulings are the feel and the numbers under them are the session's arithmetic and move freely.
- **Decide craft values, never offer Mark a comparison (Mark, 2026-09-16).** His words: *"half of that feedback is solicited... We're still getting caught up on little things... I want a V1. Please help me get there."* **Pick the value with a stated reason, preferring a floor or ceiling an existing rule already implies over a number somebody liked. Where a value is genuinely open, annotate it and move on. Build no comparison knob before V1.** His unsolicited reaction after playing is still welcome and still binding; what is banned is manufacturing the question.
- **Gates never overrule Mark (Mark, 2026-09-09).** A gate can find, never rule. A finding that would reverse, defer, narrow or reconsider something he decided is outside its authority: file it, list it as "gate disagrees with ruling X", and build on his ruling. Questions to him only when the session cannot make the call and it is hard to reverse.
- **One-push build mode (Mark, 2026-09-07):** one autonomous push on one branch in its own worktree; CodeRabbit CLI before every code commit; gates as relevant; ADRs are my call, reviewed on the branch before merge. Memory `one-push-build-mode.md` carries it and the lean rule in full.
- **Stuck rule:** two failed honest attempts, or a decision only Mark can make, or an unauthorized irreversible step: stop the thread, write a stuck note (doing, two attempts and why each failed, one-sentence question), send it over Discord (`DISCORD_WEBHOOK_URL`, a curl POST with `{"content": ...}`), move to independent work; if none, write the handoff and pause. **Discord only for stuck notes and the done message.**
- **Fable never reads (Mark, 2026-09-09).** Cheaper agents do the searching and hand Fable the result; a small Fable job runs in the main thread, a big one as a Fable subagent with those results in its prompt. **Fable is worth spending on the balance itself, the interaction of changes, and reading each batch to pick the next move.** Not records, prompts, coding, gates, batches, tickets, commits, deploys, the follow-along list, or ADR drafting once the decision is made.
- **Dispatch shape.** The gate agents are `gate-game-design`, `gate-product-vision` and `gate-tech-architecture`; they are exempt from the dispatch hook and their prompts must tell them not to edit and not to leave markers. A non-coding dispatch prompt opens with the literal line `Non-coding dispatch: <reason>`. A coding prompt names `docs/agents/feature-playbook.md` and carries the six contract items; a coder handed a slice missing any of them stops and reports. The standing coder rules are `apps/hungry-grave/docs/push/step-4-coder-contract.md`, unchanged, and a dispatch names it plus the prompts file. A prompt is drafted by an Opus agent into the scratchpad while the previous slice builds, then committed as docs; **the orchestrator reads only the decision parts of a draft** and rules on any stop it names before the dispatch goes out. **A coder is never dispatched in the last hour of a session**, because it dies with the context switch.
- **Two slices per session is the observed pace.** The watchdog fired in session 24 at about 150k tokens after two code slices, one deploy and three brief agents; a session that reads no files itself still fills, on agent reports and pasted prompts.
- **Usage limits:** `stay-within-limits` thresholds are session and weekly-all caution 75 stop 85, Fable caution 85 stop 95; main thread lean by default. The caution lines are waived for this push. At a Fable stop, write the handoff, commit it, chain a new session on Opus.
- **Frame a craft-value question in perception terms**, what the player must see and against which ruler already on screen, and convert every candidate into the field's own units before it is a number in the tree. `push-feel-precedent.md` asked how long knockback is in shipped games instead and produced a confident wrong `SHOVE_TICKS` 7; the post-mortem is `docs/research/watched-pushback-duration.md` section 0.
- **A headless browser cannot photograph a short-lived state.** It draws this build at 3 to 5 frames a second while the app runs twenty to thirty sim ticks per drawn frame, so a seven-tick shove finished inside one frame and a reservoir never filled. Such a property is pinned by test in the sim and is **human-checkable only, at 60 frames a second on a real device**. Round two note sections 8 and 13 record the attempts.
- **Deploys run from the branch worktree between coders, never from a scratch worktree**, which the isolation guard makes impossible for a subagent to use or clean up.
- **Commits on this branch carry no trailer of any kind.** Mark's global rule is a single-line conventional message with no trailers, and it overrides the harness's own `Co-Authored-By` reminder.
- **Mark's operating rule (2026-08-28):** batch mechanical already-ruled work; stop only for a new product or architecture decision, an invariant conflict, scope expansion, or invalidating evidence. Commit, push, deploy and merge each need their own explicit yes outside the pre-authorized list.
- **His issue format**, which the triage skill is not the source of: three one-line paragraphs, Problem, Need, Done when, and a follow-up comment posted right after creation opening with a Placement line.
- **Edit-in-place ADR pattern:** same question, new answer: rewrite the ADR in place, supersession note inside, filename slug follows the new title, number stays. New number only for a new question. Supersession convention: dated inline bold prose plus a what-stood / what-it-replaced / what-it-could-not-have-known triple. No YAML frontmatter anywhere.
- **Vercel:** Mark is locked out of the dashboard (2FA prompt, support ticket open) but the CLI login works and `vercel tokens add` minted a token. Project `hungry-grave`, org `team_rDwpau77qippLMDxVoyeq5Ev`; the worktree's `.vercel/` link and `.env.local` are ignored copies.
- **The store is provisioned and dormant**, Neon Postgres `hungry-grave-runs` and a private Blob store, keys in `.env.local`; its shape and its read-after-write trap are in `apps/hungry-grave/docs/push/pre-authorizations.md`.
- **Assets, agreed**, are the mapping in `docs/design/step-2-stage-floor-dispatch.md`. **Every asset is a placeholder and will be replaced before the real game, so licensing is never a question to raise** (Mark, 2026-09-08, repeated).
- **Commands:** the conditioned-tape, frame-budget, measure and verification lines are in `apps/hungry-grave/docs/push/step-4-coder-contract.md`; only `pnpm typecheck` judges diagnostics and `pnpm verify` is the repo gate. Local play: `cd apps/hungry-grave && pnpm build && pnpm exec vite preview`. Mark saves tapes to `/mnt/c/Users/markd/Downloads/*.tape`. **`coderabbit review --agent --uncommitted` from the worktree root is the working form**, and it does not see untracked files, so add by path first.
- ADR set 0001-0061 canonical; no ADR carries a combat magnitude; a /to-spec spec lands as a comment on the existing ticket.
- **Reading big files:** `cat` over roughly 30KB gets saved to a file; use the Read tool on the saved path. In zsh, a bare `echo ====` fails and `--include=*.ts` needs quoting. The scratchpad is per session and shared between subagents, so a generic filename gets clobbered; anything a later session needs goes into `apps/hungry-grave/docs/push/` on the branch.
- **A stray file named `-o` in the worktree root** is a subagent's malformed curl, from a redirect flag the shell took as a filename. Remove it with `rm ./-o`, because a bare `rm -o` is parsed as a flag.

## How we got here, one line

Sessions 1 to 27, from the V1 grill of 2026-08-31 through step 4's close and round two's slices up to K, are in this file's own git history: `git log --follow apps/hungry-grave/docs/push/handoff.md`.

The last version carrying the full session-by-session narrative is commit `7f5cb0105b`.

## Suggested skills

`/domain-modeling` for the ADR step (challenge terms against `CONTEXT.md`, record decisions as ADRs). `/triage` for the tickets (drafts to Mark first), but **the triage skill is not the source of his issue format**, which is in the standing rules above. `/to-spec` output lands as a ticket comment. `/tdd` and `docs/agents/feature-playbook.md` bind any coding; dispatches go to subagents with the dispatch contract, and a non-coding dispatch prompt opens with "Non-coding dispatch:". `/stay-within-limits` between waves.
