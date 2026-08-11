# Playthrough

The scripted pass for the Wayfinder ticket [The whole game, watched: storyboard, then scripted playthrough](https://github.com/niftymonkey/the-cabinet/issues/20). Pass two of two; pass one is the sibling `storyboard/` directory, and `storyboard/scripted-pass-brief.md` is the document this was built from.

**The question.** The storyboard settled what each beat looks like as a still. This asks the next thing: does the shape of play hold up when the beats run one after another with motion and sound, at the speed a player would actually meet them.

**What it is.** Twenty-three animated PixiJS scenes playing themselves end to end in about four and a half minutes. Nothing is clickable. A pale ring stands in for the player's cursor, so what gets clicked and when is visible rather than implied; every sound is synthesised in WebAudio in the page, so the file stays self-contained.

**Shape of the run.** Mark's call, 2026-08-11: the branch beats play as two years rather than as a highlight reel. Year one runs arrival, the loop, the house opening, and the Leave offer, and ends by taking the road; a single marked aside off the offer shows the year you stay one night too long and freeze. The return then opens year two on the warmer gauge, and that year runs to the win, the tea offer, the coda, and her.

**Pacing is on the page.** The strip under the stage measures the night that matters, dusk through the morning read and the book, against the 70-to-90-second budget from the 2026-08-08 three-lens review. As built it is 75 seconds.

**Art, wording, and sound are first-pass placeholders.** Look, feel, staging, and pacing are what is being judged. The two sentences in the last scene, the Leave offer wording, the tool names, threshold numbers, and every sound belong to their own tickets.

## Run it

Open `index.html` in a browser (pixi.js 8.19.0 comes from a CDN, so it needs network), or the deployed copy at `/prototypes/playthrough/` on <https://housewarming.niftymonkey.dev>. Press Play; the sound needs that first click to start. Space pauses, the arrow keys jump scene to scene, the strip under the stage jumps anywhere, and the URL hash deep-links a scene by its storyboard frame number.

Each scene has a notes box, saved to localStorage as you type; a teal mark shows noted scenes on the strip, "Copy all notes" puts them on the clipboard as one `scene N · title: comment` block, and "Clear notes" (confirm-guarded) separates reaction rounds.

## Shape of the code

Scenes are pure functions of scene data returning `{ view, update(t), cues }`: a Container, a function of the scene's own clock, and a list of one-shot sound cues. The director owns the clock and the swap, so a scene knows nothing about the run around it. This is the same seam the storyboard set and the real room inherits, with a ticker added because these move.

## What it decided

Nothing yet. Mark's approval of this pass resolves #20; decision-log entries land in `game-concept.md` at that point.
