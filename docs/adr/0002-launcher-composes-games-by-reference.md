# The launcher composes games by reference, never by import

The launcher may present a game in whatever way suits that game: navigating to it, opening it in a new window, offering a download, or embedding it inside the cabinet so the player appears to zoom into the screen and the game takes over the viewport. All of these stay open, and which one a given game uses is a per-game choice.

What is ruled out is the launcher importing a game's code. The launcher never imports a game module, never mounts a game onto its own PixiJS stage, never shares a ticker or an asset loader with one, and never holds game state. A game is referenced by URL or by artifact, and that is the whole contract.

This is what keeps a game a self-contained application with its own technology stack, per ADR 0001. Mounting a game into the launcher's own renderer would force a shared PixiJS version, a shared frame loop and shared asset paths on every game in the cabinet, which is the coupling that decision exists to prevent.

## How embedding stays within the rule

An `<iframe>` satisfies the contract, because the game inside it is still an independently built application reached by URL. PixiJS `DOMContainer` drives an element's CSS transform from the scene graph, so an iframe positioned on the cabinet's screen follows the zoom, scale and opacity of the cabinet itself. That gives the immersive route without any coupling, and because it is an iframe it works for plain HTML games exactly as well as for PixiJS ones.

Two caveats a future reader should know before relying on it. `DOMContainer` is marked experimental in PixiJS v8 and its API may move between minor releases. And every `DOMContainer` element renders above all canvas content on a shared root, so PixiJS cannot draw a bezel, glass or scanlines over an embedded game. Those have to be CSS on top of the iframe.

The fully composited alternative is `HTMLSource`, which turns a live element into a PixiJS texture that can be warped onto a mesh and layered under Pixi effects. It relies on the HTML-in-Canvas browser proposal, which is behind a flag and throws on first render when unavailable, so it can only ever be a feature-detected enhancement rather than the primary path.

## Consequences

This breaks the composition approach inherited from Nostalgia, which built each application independently and copied the resulting `dist` trees into one static site. That assumed every application produces a page, and a game offered as a download has an artifact and no page. The copied scripts were deleted rather than kept as a half-answer, and the real composition step gets written once the launcher exists and it is clear how each kind of game is reached.
