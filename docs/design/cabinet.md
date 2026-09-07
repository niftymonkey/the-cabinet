# The Cabinet

The place where you can play all the games Mark has built. A launcher plus independently built browser games, each at its own address.

Name reads two ways on purpose: an arcade cabinet and a cabinet of curiosities. It does not presume an era, so games from any period or genre fit.

## Relationship to Nostalgia

`~/dev/niftymonkey/nostalgia` is the direct ancestor and the reason we know this architecture works. It was one or two days of work, so it is a reference and not an investment to protect.

What Nostalgia got right and we are keeping:

- pnpm monorepo, `apps/*` workspaces.
- Parent launcher knows only public routes. It never imports a game and never holds game state.
- Each game is a full, independently runnable and buildable Vite application.
- Games do not import each other. No shared package until at least two real callers need the same stable behaviour.
- A typed game registry in the launcher, so adding a game is one local data entry.

What is not carrying over: the Nostalgia product identity. That was specifically about rebuilding QBasic-era games that mattered to Mark before he was an engineer, with QBasic menus and shareware CD launchers as the visual anchors. The Cabinet is a wider box and needs its own framing.

Nostalgia's games (Gorillaz, Nibblez) were never implemented, only scaffolded. If Mark wants that work later he recreates it inside The Cabinet rather than going back to the old repo.

## Decisions

- **2026-08-06** New repo rather than widening Nostalgia.
- **2026-08-06** Name: The Cabinet. Mark's own Nostalgia design brief had already selected "Launcher cabinet" as its visual direction, so the name was already sitting in the work.
- **2026-08-06** Architecture copied from Nostalgia, listed above.
- **2026-08-06** The launcher is itself a PixiJS application rendering a game cabinet you move around and zoom into, following showcase entries where the whole site is a Pixi app. Games may open in a new window or offer a download; the launcher need not embed them.
- **2026-08-06** One repo holds the launcher and every game, each game a self-contained app with its own code, tests, assets, dependencies and technology stack. Games may be built in different technologies. Rejected a repo per game: it costs an install, a tracker and a deploy each, for a solo project, and buys nothing this does not already give. Shared tooling config lives at the root, which is one of the things one repo is for.
- **2026-09-07** Nothing composes the site. The cabinet and each game deploy as their own Vercel project with their own public address, and the cabinet reaches a game by that address. ADR 0004.
- **2026-09-07** The cabinet lives at `cabinet.niftymonkey.dev`, in `apps/cabinet`, and the repository root's Vercel link belongs to it.
- **2026-09-07** The first cabinet ships with The Hungry Grave as its one game. Picking it sends the same tab to the game's own address. Embedding a game inside the cabinet screen stays open per ADR 0002 and gets its own effort later.
- **2026-09-07** Phones get the same cabinet: drag to move around it, tap to zoom in. Tilt is not part of the first cabinet.
- **2026-09-07** The PixiJS showcase turned out to hold no whole-site entry; the shipped exemplars sit outside it, two of them in Three.js. The direction stands on those, per `apps/cabinet/docs/research/whole-site-pixi-precedent.md`.

## Launcher direction: the site is the cabinet

Mark went through the PixiJS showcase and found that several of the entries are not websites with canvas on them. The **website itself is a PixiJS application** that you move around in rather than click through. That is the model.

So The Cabinet is a PixiJS app that renders an actual game cabinet.

- The cabinet sits there with subtle motion, and things are playing on its screen.
- You move around it, left and right, with the mouse or keys. A parallax-ish sense of depth, done in the canvas rather than as a web-page scroll effect.
- Clicking the cabinet **zooms you into the screen**, and from there you interact with the screen itself to choose a game.

Launching a game in a new browser window is fine, and so is a download link where that suits a particular game. The launcher does not have to embed anything.

### Honest note on scope

This makes the launcher a genuine piece of work rather than a static page, and it changes the earlier assumption that the parent app was plain DOM. It is also the thing that makes The Cabinet worth existing instead of being a list of links.

It reinforces the build order: prototype the game's deduction loop first, standalone. The game is where the risk is. The cabinet is presentation and can come later without blocking anything.

## Open

- What is playing on the cabinet's screen while you stand in front of it.
- How the in-screen game selection actually works once you have zoomed in.
- Whether the launcher has a notion of collections or shelves, which would let a Nostalgia shelf exist inside The Cabinet without diluting either.
