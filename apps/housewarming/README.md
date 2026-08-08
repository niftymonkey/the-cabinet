# Housewarming

A cozy-but-dark incremental deduction game, web and TypeScript. The first game in The Cabinet.

The title reads three ways at once: warmth is the resource, the fiction is literally warming a house, and a housewarming is a friendly ritual with someone new in the house, which is the ending.

## The game

A relative left you the house. She died in it and nobody ever explained why. You love the place, you find out it has residents you cannot see, and you stay anyway, because you are not going to be driven out of your own home. You are the keeper now, and her book of names, inherited half filled in her handwriting, is what you have to work with.

Each night you set experiments, one to a room: a candle, a lure, and optionally a ward. Then you sleep. Each morning you look at the room and read what the night left, a scene rather than a paragraph. How far the candle burnt before it took its mark tells you the hour. The bowl taken or untouched tells you the lure. A trace inside the room, or one that stops at the ward, tells you the haunt and the aversion.

Every spirit holds one trait on each of four axes, hour, lure, aversion and haunt, and those four traits together are its true name. You rule traits in and out in the book, and a name is submitted whole or not at all.

Naming is the whole point. A named spirit works the house and produces warmth. A loose one drains warmth every night, a little less for each trait you have ruled in.

Warmth is the only resource. It buys experiments, named spirits make it, loose spirits take it, and the drain worsens as autumn turns into winter. Let the house cool far enough and a Leave action appears. Let it cool further and the action is gone, too cold to pack and get out, which is how the last keeper died.

## Playing

<https://housewarming.niftymonkey.dev>

## Working on it

From this directory:

```
pnpm dev
pnpm test
```

`pnpm verify` from the repository root runs format, lint, typecheck, and tests across the workspace.

## The rest of it

`docs/design/game-concept.md` is the full design, with a dated decision log at the bottom, and `docs/design/how-we-got-here.md` is the story of how it was arrived at. `CONTEXT.md` is the glossary and the words this game insists on. `docs/adr/` holds the decisions that are hard to reverse, `docs/research/` the reading behind them, and `prototypes/` the playable things built to settle one question each.
