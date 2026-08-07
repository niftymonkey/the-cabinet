# One repository holding the launcher and every game

The Cabinet is a single pnpm monorepo with `apps/*` workspaces. Each game is a self-contained application owning its own code, tests, assets, dependencies and technology stack, and games may be built in different technologies from one another. Only tooling configuration is shared, at the root.

## Considered options

A repository per game was proposed and rejected. For a solo project it costs an install, an issue tracker and a deploy for every game, and buys nothing the monorepo does not already provide, since the games were never going to share code anyway.

Widening the existing `nostalgia` repository was also rejected. Nostalgia is a product identity about rebuilding QBasic-era games, not a general container, and its two games were only ever scaffolded. It is the architectural reference for this repo and not an investment to protect.

## Consequences

Games do not import each other. No shared package gets created until at least two real callers need the same stable behaviour.
