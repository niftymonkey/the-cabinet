# The Cabinet workspace instructions

## Structure

- `apps/housewarming` owns all Housewarming code, tests, and assets.
- There is no launcher application yet.

## Documents

`docs/` holds every kind of document about what it sits next to, not only design. Root `docs/` is for the repository and the cabinet as a whole; each application keeps its own `docs/` for what is specific to it. Put a document at the root only once it genuinely applies to more than one application.

Read the design documents before proposing design changes. `docs/design/cabinet.md` and `apps/housewarming/docs/design/game-concept.md` each carry a dated decision log at the bottom; append to it rather than rewriting what is above.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `niftymonkey/the-cabinet`, driven with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: `CONTEXT-MAP.md` at the root, one `CONTEXT.md` per application. See `docs/agents/domain.md`.

### How an issue is written here

**The body carries the problem and the need, nothing else.** No approach, no file paths, no links. Everything else, the pointers, the constraints, the prior decisions, the skills to use, goes in a follow-up comment posted immediately after creation. Acceptance criteria are observable outcomes, not tasks. This applies to Wayfinder tickets as well as ordinary ones: the body is the question, and its context is the first comment.

**So always read an issue with `gh issue view <number> --comments`.** Half of what an agent needs is in the comments by design, and this is already true regardless: Wayfinder records the answer to a ticket as a comment too, so a body-only read misses every resolution on a map.

## Writing

**Never hard-wrap prose.** One paragraph is one line, however long it runs. One list item is one line. This covers every markdown file in this repository, every GitHub issue body, and every issue comment. Blank lines between blocks, tables, and code fences are unaffected. This is not about line length in code, which follows the linter.

Two reasons. A wrapped paragraph reflows entirely when one word changes, which makes a diff unreadable. And GitHub renders a single newline inside an issue body or comment as a real line break, so wrapped prose comes out snapped mid-sentence on the page even though it looked tidy in the editor.

**Never use an em dash.** A comma, a colon, parentheses, or two sentences instead.

**One question per message, and put it at the end.** Mark reads and answers as he goes rather than reading a whole message first, so a message carrying a correction, a recommendation, and a question at once gets answered in pieces and the later parts get the least attention. When several things need saying, send the one that needs a decision and hold the rest.

## Isolation rules

- Do not import one game from another.
- Do not move game rules, rendering, input, or assets into the launcher.
- Do not add a shared package until at least two real callers need the same stable behavior.
- Shared tooling configuration may live at the repository root.
- A game must remain runnable and buildable through its own workspace scripts.

## How to work here

**The design documents are the record of a grilling session, not a specification.** They exist so the same questions do not get asked twice. Read them before proposing design work, and do not make someone answer what is already written down; the research behind them sits in `apps/*/docs/research/` for the same reason.

They are not a boundary. The design is expected to keep improving. Reopening a question because new information turned up is welcome, and reopening one because the answer went unread is waste. That is the whole distinction. Decisions genuinely hard to reverse live in `docs/adr/` and `apps/*/docs/adr/`; a position stated only in a design document is still a position.

**Land the agreement before editing files.** When something is being worked through, put it in conversation and wait. Propose rather than record: design does not go into a document until it has been agreed.

**A design question is put to Mark in gameplay terms.** When a decision affects how the game plays, describe what the player would see, do, and feel under each option, not the data model. Add the technical framing alongside only when it is genuinely needed, never instead of the gameplay one. Mark has thirty years as an engineer and zero as a game designer, so the gameplay reading is the one he needs in order to judge.

**Guidance on game design rests on looked-up evidence.** When recommending a design decision, look up how real games and industry practice handle the same problem and cite what was found, rather than arguing from intuition. Research beats taste here for the same reason the solver beats taste on difficulty.

**Read what was actually written.** "Does not have to" is permission and "never" is a prohibition, and turning one into the other has caused real rework here more than once. Before building an argument on a phrase, check that the argument answers what was said rather than something adjacent.

**Nothing already landed is fixed**, including decisions inherited from a previous session's notes. If a better shape exists, say so. Never defend a design position on the grounds that it is already written down; Mark is not precious about the design and treating a document as an argument wastes both of you.

**Grill before proposing.** Mark asked to be grilled and he means it. Questions about the thing he is reaching for beat a polished proposal built on a guess.

**A soft yes is a signal, not an answer.** Twice an "I think so" has hidden a real objection. When agreement sounds thin, name the wobble you suspect and ask about it directly. Both times that resolved it in one message.

**Several of the best ideas here are his.** Leave room for them rather than filling every gap with a recommendation.

**A reference is a reference, not a template.** When another repository is pointed at for an idea, take the idea. Copying its files imports decisions nobody made.

**Test claims about tooling rather than reasoning from version numbers.** Install it, run it, read the actual error. See `docs/adr/0003-typescript-6-until-typescript-eslint-supports-7.md` for a case where the version metadata and the real behaviour told different stories.

**Builds stay free of warnings.** A warning is either fixed or explained in an ADR, never left to sit.

**Work is not chosen on the basis of what would be enjoyable to build.** Recorded in the constraints table in `apps/housewarming/docs/design/game-concept.md`.

**A placeholder still gets real effort.** Deliberate composition, the canvas filling the viewport, chrome rendered where it belongs. Something standing in for the real thing is not an excuse to make it ugly.

**Coach the first contact with a prototype.** Walk Mark through his own first result line by line rather than handing over a link and waiting. What he misreads on the first morning is design data about the prototype, not a support question.

**Play the whole thing, do not only unit-test it.** The one real bug in the Housewarming kernel passed every unit test and was obvious the moment a run was played from the first night to won or lost. Anything with a loop wants at least one test that runs the loop end to end.

## Code review

Whenever a code review would normally happen, run the `coderabbit:code-review` skill rather than the built-in `code-review`. That includes the review step inside `/implement`, an explicit request to review a branch or a diff, and any point where a review is judged necessary unprompted.

This repository is public, so CodeRabbit's GitHub app reviews pushed commits on its own a few minutes after each push. The skill is for reviewing locally, before a push.

**A local review cannot see untracked files.** `coderabbit review -t uncommitted` reads the git diff, so brand new files are invisible to it and it reports a clean pass having reviewed nothing. Run `git add -N <path>` first. Its findings are worth taking seriously: across the kernel it was right six times and wrong none, including one it raised twice.

## Commands

- `pnpm --filter <workspace> typecheck`
- `pnpm --filter <workspace> test`
- `pnpm verify`

Do not commit automatically. Verify scoped work before proposing a commit.
