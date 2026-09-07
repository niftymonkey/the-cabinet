# Each application deploys as its own Vercel project, and the cabinet reaches games by public URL

The cabinet and every game each deploy as a separate Vercel project with their own public address, and the cabinet reaches a game by that address. The repository root's Vercel link belongs to the cabinet, and each game's link lives in its own `apps/<game>` directory. Nothing composes the applications into one site.

## Considered options

Composing every application's build output into one static tree, as Nostalgia did, was the inherited assumption. It was rejected because it assumes every application produces a page, and a game offered as a download has an artifact and no page. It also makes one deploy carry every game, so a broken game build blocks the cabinet and every other game.

## Consequences

This closes the open question ADR 0002 left about how the site gets composed: it is not composed. Adding a game to the cabinet means adding its public address to the cabinet's registry, and the game ships on its own schedule. A game keeps its own deploy recipe, as The Hungry Grave already does.
