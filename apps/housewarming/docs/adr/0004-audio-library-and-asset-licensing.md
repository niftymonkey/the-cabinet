# Audio comes from a library, and every asset's licence is recorded on download

PixiJS says in its own documentation that it is not an audio library, so one is required rather than optional. `@pixi/sound` is the default because assets are already loaded through Pixi's asset system. Howler.js is the alternative if that ever stops fitting.

Sound is a first-class channel in this game, carrying both atmosphere and information, and none of it is going to be recorded by hand. Ambient horror audio is the most abundant category of free sound there is, and unlike art it does not need stylistic consistency across a set, so mixing sources does not show. Sonniss, Kenney, Freesound, OpenGameArt and generated effects are all in scope. See `../design/tooling-and-assets.md` for the full list and terms.

## Consequences

Record the licence of every asset at the moment it is downloaded. Retrofitting licence provenance across a mixed set is miserable, and mixing sources is the whole point of the approach.
