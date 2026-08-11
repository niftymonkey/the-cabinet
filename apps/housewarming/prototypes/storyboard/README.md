# Storyboard

A prototype for the Wayfinder ticket [The whole game, watched: storyboard, then scripted playthrough](https://github.com/niftymonkey/the-cabinet/issues/20).

**The question.** What does playing Housewarming look like, start to finish, watched as scenes rather than read as a document? The record settles the rules and the fiction; nowhere before this shows the game as a sequence of things happening on a screen.

**What it is.** Twenty-three still PixiJS frames, one per beat of the game, from the found-frozen intro through the tea scene. The centerpiece question (set the night in the room versus a form) was settled in Mark's first walk: the night is set in the room by clicking placement spots (frame 4), the placements popping into a list beside the warmth meter with the cost climbing live, candle and bowl required, the ward optional, one commit (frame 5). Every frame carries a caption saying what it stages and an italic line that is either a live question or a note that the frame is settled.

**Art and wording are first-pass placeholders.** Look, feel, and staging are the things being judged; specific art, exact wording (the Leave offer text, her margin notes, threshold numbers) all belong to their own tickets and iterate later. Palette rule applies: no brown, no AI purple. Cold is blue and slate, warmth is gold.

## Run it

Open `index.html` in a browser (it loads pixi.js 8.19.0 from a CDN, so it needs network), or the deployed copy at `/prototypes/storyboard/` on <https://housewarming.niftymonkey.dev>. Arrow keys or the buttons step frames; the dots jump; the URL hash deep-links a frame.

Each frame has a notes box under the caption, saved to the browser's localStorage as you type; a teal ring marks noted frames on the dots, "Copy all notes" puts every note on the clipboard as one `frame N · title: comment` block for pasting back in a single message, and "Clear notes" (confirm-guarded) separates reaction rounds.

## Shape of the code

Frames are pure functions of scene data returning a PixiJS `Container`; the `Application` runs `autoStart: false` and renders once per frame swap. This is the seam the real room inherits (scene data in, events out, no free-running ticker), per the three-lens review's kernel-to-room deferral.

## What it decided

The storyboard pass is approved: all 23 frames settled across four reaction rounds with Mark, 2026-08-10. `scripted-pass-brief.md` beside this file records why each frame is what it is, the sixteen decisions the walk settled, and what the scripted pass owes each beat; it is the driving document for pass two. Formal decision-log entries land on the ticket and in `game-concept.md` when the scripted pass is approved.
