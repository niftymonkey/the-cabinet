# Context Map

The Cabinet holds a launcher and a set of independently built games. Each game is its own context
with its own language. The launcher shares nothing with a game except a route.

## Contexts

- [Housewarming](./apps/housewarming/CONTEXT.md). The spirit-naming game. Its language is the
  language of the house.
- The launcher. Not built yet. It gets its own `CONTEXT.md` when it exists.

## Relationships

- **Launcher → game.** The launcher knows a game's public route or artifact and nothing else. It
  never imports a game module, never mounts one onto its own stage, and never holds game state. How
  a game is presented is a per-game choice: navigation, a new window, a download link, or embedded
  in the cabinet inside an iframe.
- **Game ↔ game.** Nothing. Games do not import each other and share no vocabulary. Two games using
  the same word for different things is expected rather than a conflict to resolve.
