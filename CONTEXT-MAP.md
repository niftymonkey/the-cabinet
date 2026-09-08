# Context Map

The Cabinet holds the cabinet and its games, each built on its own. Each is its own context with its own language. The cabinet shares nothing with a game except the game's address.

## Contexts

- [Housewarming](./apps/housewarming/CONTEXT.md). The spirit-naming game. Its language is the language of the house.
- [The Hungry Grave](./apps/hungry-grave/CONTEXT.md). The Halloween shmup where the player is a grave. Its language is the language of the funeral.
- [The Cabinet](./apps/cabinet/CONTEXT.md). The multicade every game is picked from. Its language is the language of the machine.

## Relationships

- **Cabinet → game.** The cabinet knows a game's address and nothing else. It never imports a game module, never mounts one onto its own stage, and never holds game state. The first cabinet sends the same tab to the address; a new window, a download, or embedding on the monitor (ADR 0002) stay open as per-game choices for later.
- **Game ↔ game.** Nothing. Games do not import each other and share no vocabulary. Two games using the same word for different things is expected rather than a conflict to resolve.
