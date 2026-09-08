# The Cabinet

The place where you can play all the games Mark has built: a multicade you walk up to, and games that are each self-contained at their own address.

The name reads two ways on purpose: an arcade cabinet and a cabinet of curiosities. It does not presume an era, so games from any period or genre fit.

## What is here

| Path                | What it is                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `apps/cabinet`      | The cabinet itself: the multicade every game is picked from. Being built now.            |
| `apps/hungry-grave` | The Hungry Grave, a Halloween shmup where the player is a grave. The first game to ship. |
| `apps/housewarming` | Housewarming, a cozy-but-dark incremental deduction game. Design record only, shelved.   |
| `docs/`             | Documents about the repository and the cabinet as a whole.                               |

The Hungry Grave is playable and being tuned toward its first release. The cabinet is being built to ship with that one game inside it. Housewarming was shelved on 2026-08-17 and holds only its design record.

## How the repository is arranged

One repository holds the cabinet and every game. Each game is a self-contained application that owns its own code, tests, assets, dependencies, and technology stack, and games may be built in different technologies. Each game lives at its own address and deploys on its own. The cabinet sends you to that address and never has to embed a game.

Documents live next to what they are about. `docs/` at the root is for the repository and the cabinet as a whole; each application keeps its own `docs/` for what is specific to it. Something only moves up to the root once it genuinely applies to more than one application.

## Working on it

```
pnpm install
pnpm verify
```

`pnpm verify` runs format, lint, typecheck, and tests.

## Design

`docs/design/cabinet.md` for the cabinet and the shape of the repository, with `apps/cabinet/PRODUCT.md` for what the cabinet is and `apps/cabinet/CONTEXT.md` for its words. `apps/hungry-grave/docs/VISION.md` and `apps/hungry-grave/docs/design/game-concept.md` for The Hungry Grave, and `apps/housewarming/docs/design/game-concept.md` for Housewarming. The design records carry a dated decision log at the bottom. `apps/housewarming/docs/design/how-we-got-here.md` is the narrative of how the design was arrived at, including the course corrections.
