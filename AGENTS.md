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

## Isolation rules

- Do not import one game from another.
- Do not move game rules, rendering, input, or assets into the launcher.
- Do not add a shared package until at least two real callers need the same stable behavior.
- Shared tooling configuration may live at the repository root.
- A game must remain runnable and buildable through its own workspace scripts.

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
