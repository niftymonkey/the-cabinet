# The Cabinet

The place where you can play all the games Mark has built: a main application you go to when you want to reach a game, and games that are each self-contained.

The name reads two ways on purpose: an arcade cabinet and a cabinet of curiosities. It does not presume an era, so games from any period or genre fit.

## What is here

| Path                | What it is                                                                |
| ------------------- | ------------------------------------------------------------------------- |
| `apps/housewarming` | Housewarming, a cozy-but-dark incremental deduction game. The first game. |
| `docs/`             | Documents about the repository and the cabinet as a whole.                |

No code exists yet. `apps/housewarming` currently holds only the game's design record, and there is no launcher application at all. The first piece of work is Housewarming's deduction kernel, which is pure TypeScript with no user interface.

## How the repository is arranged

One repository holds the launcher and every game. Each game is a self-contained application that owns its own code, tests, assets, dependencies, and technology stack, and games may be built in different technologies. A game is reached by navigating to it directly, by the launcher opening it in a new window, or by a download link, so the launcher never has to embed one.

Documents live next to what they are about. `docs/` at the root is for the repository and the cabinet as a whole; each application keeps its own `docs/` for what is specific to it. Something only moves up to the root once it genuinely applies to more than one application.

## Working on it

```
pnpm install
pnpm verify
```

`pnpm verify` runs format, lint, typecheck, and tests.

## Design

`docs/design/cabinet.md` for the launcher and the shape of the repository, and `apps/housewarming/docs/design/game-concept.md` for the game. Both carry a dated decision log at the bottom. `apps/housewarming/docs/design/how-we-got-here.md` is the narrative of how the design was arrived at, including the course corrections.
