# The Cabinet workspace instructions

## Structure

- `apps/housewarming` owns all Housewarming code, tests, and assets.
- There is no launcher application yet.

## Documents

`docs/` holds every kind of document about what it sits next to, not only design. Root `docs/` is
for the repository and the cabinet as a whole; each application keeps its own `docs/` for what is
specific to it. Put a document at the root only once it genuinely applies to more than one
application.

Read the design documents before proposing design changes. `docs/design/cabinet.md` and
`apps/housewarming/docs/design/game-concept.md` each carry a dated decision log at the bottom;
append to it rather than rewriting what is above.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `niftymonkey/the-cabinet`, driven with the `gh` CLI. See
`docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See
`docs/agents/triage-labels.md`.

### Domain docs

Multi-context: `CONTEXT-MAP.md` at the root, one `CONTEXT.md` per application. See
`docs/agents/domain.md`.

## Isolation rules

- Do not import one game from another.
- Do not move game rules, rendering, input, or assets into the launcher.
- Do not add a shared package until at least two real callers need the same stable behavior.
- Shared tooling configuration may live at the repository root.
- A game must remain runnable and buildable through its own workspace scripts.

## How to work here

**The design documents are the record of a grilling session, not a specification.** They exist so the
same questions do not get asked twice. Read them before proposing design work, and do not make
someone answer what is already written down; the research behind them sits in
`apps/*/docs/research/` for the same reason.

They are not a boundary. The design is expected to keep improving. Reopening a question because new
information turned up is welcome, and reopening one because the answer went unread is waste. That is
the whole distinction. Decisions genuinely hard to reverse live in `docs/adr/` and
`apps/*/docs/adr/`; a position stated only in a design document is still a position.

**Land the agreement before editing files.** When something is being worked through, put it in
conversation and wait. Propose rather than record: design does not go into a document until it has
been agreed.

**Read what was actually written.** "Does not have to" is permission and "never" is a prohibition,
and turning one into the other has caused real rework here more than once. Before building an
argument on a phrase, check that the argument answers what was said rather than something adjacent.

**Nothing already landed is fixed**, including decisions inherited from a previous session's notes.
If a better shape exists, say so.

**A reference is a reference, not a template.** When another repository is pointed at for an idea,
take the idea. Copying its files imports decisions nobody made.

**Test claims about tooling rather than reasoning from version numbers.** Install it, run it, read
the actual error. See `docs/adr/0003-typescript-6-until-typescript-eslint-supports-7.md` for a case
where the version metadata and the real behaviour told different stories.

**Builds stay free of warnings.** A warning is either fixed or explained in an ADR, never left to
sit.

**Work is not chosen on the basis of what would be enjoyable to build.** Recorded in the constraints
table in `apps/housewarming/docs/design/game-concept.md`.

## Code review

Whenever a code review would normally happen, run the `coderabbit:code-review` skill rather than
the built-in `code-review`. That includes the review step inside `/implement`, an explicit request
to review a branch or a diff, and any point where a review is judged necessary unprompted.

This repository is public, so CodeRabbit's GitHub app reviews pushed commits on its own a few
minutes after each push. The skill is for reviewing locally, before a push.

## Commands

- `pnpm --filter <workspace> typecheck`
- `pnpm --filter <workspace> test`
- `pnpm verify`

Do not commit automatically. Verify scoped work before proposing a commit.
