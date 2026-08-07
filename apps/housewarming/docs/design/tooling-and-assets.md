# Tooling and assets

Researched 2026-08-06, prompted by Mark wanting to know he is not signing up for disappointment on
sound, and asking what tooling exists for PixiJS.

## Sound: better supplied than art

This was the worry, and it turns out to be the easier of the two. Ambient horror audio, drones,
creaks, wind, drips, is the most abundant category of free sound there is, and unlike images it does
not need stylistic consistency across a set, so mixing sources does not show.

| Source | Terms | Notes |
|---|---|---|
| **Sonniss GDC bundles** | Free, commercial use | Annual, very large, professional field recordings. The heavyweight option. |
| **Kenney** | CC0, no attribution | Curated and game-ready. Same place as the free art packs. |
| **Freesound** | Per-file, CC0 or CC-BY | Vast. Licence must be checked per file. |
| **OpenGameArt / itch.io** | Varies | Community packs, useful for themed sets. |
| **ElevenLabs** | Free plan needs attribution, paid does not | AI sound-effect generation for anything the libraries do not have. |
| **jsfxr / bfxr / ChipTone** | Commercially safe | Browser tools, retro and synthetic. Useful for interface sounds. |

**Rule:** record the licence of every asset at the moment of download. Retrofitting licence
provenance is miserable.

## Audio library

`@pixi/sound` (6.0.1) is the dedicated PixiJS audio library. It integrates with the Pixi asset
system and wraps the WebAudio API. Howler.js is the common third-party alternative. PixiJS itself is
explicit in its docs that it is not an audio library, so one of these is required rather than
optional.

Default to `@pixi/sound` since we are already loading assets through Pixi.

## PixiJS

Core is `pixi.js` 8.19.0.

**There is no PixiJS MCP server.** There is something better: an official **`pixijs-skills`**
collection, authored and maintained by the PixiJS team, 25 focused skills covering Application,
Assets, Graphics, Filters, Mesh and Performance.

Install in Claude Code from its slash-command prompt:

```
/plugin marketplace add pixijs/pixijs-skills
```

Mark has to run that himself. It cannot be done from a tool call.

Other pieces of the ecosystem worth knowing about:

- **create-pixi** CLI, scaffolds a project with the ecosystem libraries preconfigured.
- **PixiJS DevTools**, browser extension for inspecting the scene graph and performance.
- **@pixi/layout**, flexbox-style positioning via Yoga.
- **@pixi/ui**, prebuilt buttons, sliders, progress bars.
- **Filters**, a collection of visual effects. Relevant to us for light, flicker and frost.

For raw documentation there are `llms.txt`, `llms-medium.txt` and `llms-full.txt` at pixijs.com. The
skills collection is the better route for task-aware work; the llms files are for tools that take a
URL. **Ref** also indexes the PixiJS docs and works today with no setup.

## The Cabinet launcher

Several PixiJS showcase entries are sites that are themselves Pixi applications rather than pages
with canvas embedded. That is the model for The Cabinet's launcher. See
`docs/design/cabinet.md`.
