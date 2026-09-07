# Working agreement for the V1 push

This file carries, into any environment that loads only the repo's `.claude` folder, the rules that otherwise live in Mark's personal configuration. It binds every session on branch `hungry-grave-v1`. The push's plan, decisions and standing yeses live in `apps/hungry-grave/docs/push/`; read `handoff.md` there first. Remove this file and that folder before the branch merges.

## How the push runs

- The main thread plans, orchestrates, reads short results, reviews, and runs the gates. Everything else goes to a subagent: every coding dispatch, research job, asset conversion, batch run and file sweep. Subagents run on Opus for code and research and on Sonnet or Haiku for mechanical work. A subagent returns the bare minimum, never a file dump.
- One writer on the branch at a time. Coding dispatches run serially, each ending in a commit. Parallel agents only for read-only work or for files no other live agent touches. Never two cloud sessions on one branch. Pull before writing.
- Before every commit that contains code, run the CodeRabbit CLI against that dispatch's own diff (`coderabbit review --agent -t committed --base-commit HEAD~1` after the commit, or `-t uncommitted` before it, adding `--api-key` where no login exists) and address its findings. Never review against `main`: that diffs the whole branch, and most of it is skills, rules and handoff docs that only exist to run the push. Run the relevant review gate agents through the commits. Never commit unverified code; fix warnings and build errors first.
- Usage: run under the `stay-within-limits` thresholds. Session and weekly-all windows: caution 75%, stop 85%. Weekly Fable window: caution 85%, stop 95%. At a stop, write the handoff, commit it, and chain a new session on Opus.
- **The stuck rule.** Stuck means one of: the same blocker has beaten two honest attempts; the next step needs a decision only Mark can make (money, his accounts, a product call the record does not cover); the next step is irreversible or outward-facing and not pre-authorized. Then stop that thread at once, no third try. Write a stuck note: what was being done, the two attempts and why each failed, the question in one sentence. Send it to Mark over Discord. Move to work that does not depend on it; if nothing else can proceed, write the handoff and pause. Discord carries stuck notes and the one done message, nothing else.
- Craft calls are the agent's: set piece details, boss patterns, section feel, tuning data, test design, file layout, HUD form, consent wording, asset choices. Each is backed by research against shipped games or by harness measurement and written in a design record on the branch. Design questions are framed as moments of play.
- The first build is scaffolding. Alignment with what exists, "nothing new to author", and "players will recognise it" are never reasons. Any system may change when industry standard and measured data say a better shape exists. The goal is a game that feels real.
- "Is it fun" is never the harness's verdict. The harness compares; a person judges feel.
- Research before deciding a craft value: primary sources, labelled DOCUMENTED, COMMUNITY-MEASURED or INFERRED, written under `apps/hungry-grave/docs/research/`. The term is "industry standard", never "the world".
- The game is bullet heaven with doses of bullet hell from bosses, in that order. A hell dose is a cost, never the promise.

## Writing

- Never use an em dash (U+2014) or an en dash substitute, anywhere: files, commits, PRs, tickets, chat. Use a comma, colon, parentheses, or two sentences.
- No emojis unless asked.
- Recaps are prose, not bullet lists. Lead with what is now different, then only what could not have been predicted. Anything odd gets said plainly. Err short.
- Comments serve readers of the current code and state constraints the code cannot show. Never a comment explaining absent or removed code. Multi-line comments are JSDoc on the declaration; single-line comments are `//` lines.

## Code

- TypeScript over JavaScript. No `Type & { extra }` intersections to extend a type; write the interface. No `as` except at a library boundary that returns a generic type.
- The core and TypeScript rules in this folder (`code-core.md`, `code-typescript.md`) bind every file. The feature playbook at `docs/agents/feature-playbook.md` binds every coding dispatch: spec tests from the design record first, a failing spec test indicts the code, the dispatch contract's fields are all present.
- Tests: no flaky tests; a failure is data, investigate before committing. Several rounds of non-standard fixes (polling, timeout bumps, retry wrappers) mean the test is probably wrong.
- Any anomaly (an error, a warning, odd output) is a finding: investigate, preserve, report. Never write it off as environmental. Decide separately whether it belongs to the current goal.

## Git and GitHub

- Commits: conventional format, single line, no trailers. Pass the message with `-m`; a multi-line body goes in a file. Never split one body of changes when the split needs code edited or hunk-surgeried.
- Pull requests: no test plan section, no generated-with footer.
- Merging is never done by the agent during the push. Mark reviews the branch and gives the merge its own yes.
- GitHub issues: the body carries the problem and the need only, no approach, no file paths, no links; the approach goes in a follow-up comment posted right after creation. Acceptance criteria are observable outcomes. Ticket numbers go in commit messages for doc commits.
- Use `gh` for GitHub, `pnpm` over `npm`, simple shell commands over defensive compound patterns.

## ADRs

- One qualifying decision per ADR, and the title names it. Record the decision and the minimum rationale; implementation state and mechanics live in narrower homes.
- Same question, new answer: rewrite the ADR in place, supersession note inside (what stood, what it replaced, what it could not have known), filename slug follows the new title, number stays. New number only for a new question. No YAML frontmatter.
- An ADR makes reversal deliberate, not forbidden. An ADR is never a cost in itself; the cost of reversing one is the property of play it protected.
- No ADR carries a combat magnitude; numbers are data.

## Assets

- Sourcing order: a vector placeholder that meets the readability rules (own outline per type, armed mark, tell) and the palette rules (no brown, no AI purple, fire hues only in the orange band); then the three agreed packs (a horror music pack, the Crawling Depths tileset, the scary mobs sprites); then Kenney CC0 by direct zip from the asset page, license file read; stop and ask only if all three fail, naming the exact thing needed.
- Raw packs stay in a gitignored staging folder. Only game-ready output (mp3 loops, composed background strips, one sprite atlas) is committed. Pixel art draws nearest-neighbour.

## Playtests and people

- Never ask for tester names or dates. The human read is "a person plays on desktop and phone"; who and when is Mark's.
- Never upload a person's run without the consent toggle on.
