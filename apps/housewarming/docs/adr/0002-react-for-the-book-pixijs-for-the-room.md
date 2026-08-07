# React owns the book and setup screens, PixiJS owns the room

The DOM is the interface layer and the canvas is the world layer. React renders the book and the setup screens, which genuinely are grids and forms. PixiJS renders the room, which needs a light radius, a guttering candle and frost creeping across glass. No React re-render drives the frame loop.

## Considered options

React alone was the earlier decision and it was reversed. It was the right answer while the morning was going to be a report you read, and the wrong one once the morning became a scene you look at.

Phaser was rejected. It is built for worlds with physics and movement, and this game has neither.
