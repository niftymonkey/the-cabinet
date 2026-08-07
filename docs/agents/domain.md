# Domain Docs

How the engineering skills should consume this repository's domain documentation when exploring the
codebase.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repository root. It points at one `CONTEXT.md` per application. Read
  each one relevant to the topic.
- **`docs/adr/`** for decisions that apply to the cabinet as a whole, and
  **`apps/<app>/docs/adr/`** for decisions scoped to a single game.

Design documents sit alongside these under `docs/design/` and `apps/<app>/docs/design/`. They carry
the reasoning an ADR summarises; read them when the ADR alone does not explain why.

If any of these files do not exist, **proceed silently**. Do not flag their absence and do not
suggest creating them upfront. The `/domain-modeling` skill creates them lazily when terms or
decisions actually get resolved.

## File structure

```
/
├── CONTEXT-MAP.md
├── docs/
│   ├── adr/                        ← cabinet-wide decisions
│   └── design/
└── apps/
    └── housewarming/
        ├── CONTEXT.md
        └── docs/
            ├── adr/                ← decisions scoped to this game
            └── design/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a
test name), use the term as defined in the relevant `CONTEXT.md`. Do not drift to synonyms the
glossary explicitly avoids.

If the concept you need is not in the glossary yet, that is a signal. Either you are inventing
language the project does not use, which is worth reconsidering, or there is a real gap to note for
`/domain-modeling`.

## Numbering and how to cite an ADR

Each `docs/adr/` numbers from `0001` independently, so a cabinet ADR and a game ADR can share a
number and mean entirely different things. Cite them the way this repository cites any document: a
bare number within its own folder, and a qualified one from anywhere else.

- From inside the same folder: _ADR 0002_
- From anywhere else: _cabinet ADR 0002_, _Housewarming ADR 0002_, or the repo-relative path

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts Housewarming ADR 0001 (generation rules live in data), but worth reopening because…_
