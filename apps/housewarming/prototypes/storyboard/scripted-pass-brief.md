# Scripted pass brief

The storyboard pass of [#20](https://github.com/niftymonkey/the-cabinet/issues/20) is approved: all 23 frames settled frame by frame across four reaction rounds with Mark, 2026-08-10. This file records why each frame is what it is and what the scripted pass owes, so a fresh session can build pass two without re-deriving any of it. Read it with #20's body and comments; formal decision-log entries land in `game-concept.md` at ticket resolution, not before.

## What the scripted pass is

A non-interactive playthrough that strings the approved frames together with motion and sound. Nothing is clickable; each scene plays out and hands off to the next, so the shape of play can be judged whole. Art and sound stay first-pass quality, generated or reused cheaply; look and feel is the thing being judged, and no specific asset choice is load-bearing. Mark's approval of this pass resolves the ticket, and the end-to-end slice then builds it interactive.

Pacing constraint from the 2026-08-08 three-lens review: a night runs 70 to 90 seconds including the morning read. The scripted pass should demonstrate that pacing, not just assert it.

One shaping question to settle with Mark early, before building: the board carries branch beats (leave, freeze, return) alongside the main line to the win. A linear scripted run has to choose how those play: as chapters in board order, or as a main run with the branches shown as asides. The board's act order is the default; do not silently invent another structure.

## Conventions that carry over

- Sibling prototype dir, self-contained single page, pixi.js 8.19.0 pinned from CDN, served at `/prototypes/<name>/` via the vite copy plugin. Prettier-checked.
- Frames/scenes as pure functions returning Containers stays the seam (scene data in, events out), per the three-lens review's kernel-to-room deferral. The storyboard runs `autoStart: false` and renders once per swap; the scripted pass animates, so it runs a ticker, but the scene-function seam holds.
- Pixi canvas in a styled page: `autoDensity` writes inline pixel width/height that beat stylesheet rules; set `app.canvas.style.width/height` in JS after init.
- Palette rule: no brown, no AI purple. Cold is blue and slate, warmth is gold. Keeper accent teal (scarf/cap), aunt accent gold (shawl); those accents are placeholders, not decisions.
- Sound self-contained: WebAudio synthesis or tiny embedded assets, nothing fetched beyond the pinned pixi CDN.
- Iteration works the way the storyboard did: Mark walks it, reacts, rounds fold in. The storyboard's notes-box pattern (localStorage, copy-all, confirm-guarded clear) is worth reusing.

## Decisions the storyboard settled

These are agreed with Mark and get formal decision-log entries at resolution. The scripted pass must honor all of them.

1. The night is set in the room itself: glowing placement spots pop options where you click; picking which room to stand in is the first choice of the night. No form.
2. Set-the-night and its summary are one surface. What you place pops into a list beside the warmth meter and the cost climbs live. Candle and bowl are the two a night requires; the ward is optional; "Set the night" lights as soon as the required two are down, and you can still walk to the door and add salt after.
3. The book is one held key away during set-the-night, its hint (a "B · the book" chip) always on screen.
4. The night is a short hold, then candle-out total blackout; everything the night says lands in sound (a knock at the threshold, a step on the stair), then dawn.
5. The morning is evidence with no narration; in the real game each signal names itself on hover, the agreed backstop.
6. A commit frame sits between marking and naming: one value circled on every axis is the gate, and only then does "Speak the name" light. Whole-or-not-at-all lives there. The verb is a placeholder.
7. The completed entry composes as one four-slot sentence; in motion it writes itself out in the keeper's hand, and if the name is true the spirit's byname takes the page header as it lands.
8. Named spirits are visible as translucent shades working kept rooms, hover for the name.
9. The roll shows six bare lines from the start ("six are stirring", no counter). Genre logic (Obra Dinn's manifest, Golden Idol's visible blanks: scope shown, contents hidden), the mirror of her filled page teaching by worked example, and a priceable winter. The house is what gets discovered, never the census.
10. The Leave offer speaks survival ("past a certain cold there is no going at all"); the withdrawn offer is a buttonless dead notice under frost, not a dialog.
11. "Wintering out" is retired from all player-facing words; the beat is "Taking the road."
12. The frozen keeper is visibly a different person than her (knit cap against her bun; real art may make them non-binary, but different regardless).
13. The win plays whole before the offer interrupts it.
14. "Stay for tea?" is answered through the same interaction grammar as the rest of the game, no special UI. It is the one deliberately loud moment in a quiet game.
15. The coda runs the exact same experiment loop as the whole game, in the last cold room; no candles-only economy, no new rules. It should be hard to fail (the how is design still owed).
16. Consistency fixes: the lure is honey (not "shine"), the ward is iron (not "running water"), and the aversion named in frames 8/9 is iron.

## The frames, and what pass two owes each

Titles as on the board; act structure is Arrival / The loop / The house opens / The cold / The housewarming.

1. **Found frozen.** The premise image: her, found in spring, folded over her knees, book at her hands, hearth dead. Keypress-skippable in the real game. Owes: a held still with the premise line; skip not needed in a scripted run.
2. **Her book.** The whole tutorial: a finished entry left, her last entry unfinished right, cut off where she died. Struck values are her ruled-out candidates; the finished sentence carries the truth; "bowl full three nights." Owes: read-time, possibly a slow settle onto the page.
3. **The roll.** Her last full year left, six named; yours right, six bare lines. Margin threshold notes are #14's templates; the marginalia reads "the fourth, finer tools came" because tools pass keeper to keeper (hers from her predecessor, yours from her). Owes: read-time.
4. **Dusk: set the night, in the room.** Decision 1 and 3 staged: spots, popup mid-choice at the threshold, B chip. Owes: the click-place rhythm as motion, options popping and a thing landing in the room.
5. **Dusk: summed and set.** Decision 2 staged: list beside the meter, cost 3, commit lit, door spot still open. Owes: entries popping into the list as things are placed, cost ticking up, commit lighting the moment bowl and candle are both down.
6. **The night.** Decision 4. Owes: the blackout with sound carrying the event; this is the beat sound design exists for.
7. **The morning.** Decision 5. Owes: the at-a-glance read carried by staging and timing alone, since a scripted run has no hover; let the camera or pacing name the signals.
8. **The book, marked.** Strikes and circles are the keeper's hand, never checked; the ledger keeps the facts; the drain figure eases as a witnessed edit, struck and rewritten. Owes: marks landing as motion. (How marking is performed interactively, hover-to-strike/circle and any first-time animation, is build-time design, not pass-two work.)
9. **Speak the name.** Decision 6. Owes: the gate legibly lighting only when the fourth circle lands.
10. **The naming.** Decision 7. Owes: the sentence writing itself out in the keeper's hand, byname taking the header.
11. **The kept room.** Decision 8. Owes: the shade quietly tending, first sight of who the spirits are.
12. **The sealed wing.** The house opening is an event in a place, never a menu unlock: rooms four to seven in one beat, dust hanging. Three doors in one wall is storyboard shorthand; the real opening gets its own staging, and the scripted pass is where that staging first exists.
13. **Her finer tools.** The mid-run aunt beat: her bundle, each named in her hand (a listening vial, a finer rule, dust scales; names placeholder). What they do is deliberately open, that is #25. Owes: the gift landing as her reaching you mid-game.
14. **The pantry.** A found space no spirit haunts, stranger lures for the last arrivals plain lures stop reaching; her note on the shelf says why. Gameplay fit lands across #25 and #14. Owes: final-exam tone, not more-of-the-same.
15. **The Leave offer.** Decision 10 first half. Wording placeholder; #15 owns thresholds and the window. Owes: dread priced in survival terms.
16. **The offer, withdrawn.** Decision 10 second half: you went to check one night too late, dead notice under frost, nothing to press. When and how road-checking enters the day is #15 design, still open; do not invent it here.
17. **Taking the road.** Decision 11. The run ends; the house does not pass on. Owes Mark's staging explicitly: out the door, lock it, the shivering walk to the car.
18. **The freeze.** Decision 12: the intro image mirrored, except it is you, a visibly different person. The house passes over your body to the next keeper. Owes: the mirror landing without a word of text.
19. **The return.** Another autumn, same door unlocked, provisions on the step; the everyday gauge stands above the bare-start gold tick: same house, new year, warmer start.
20. **The win.** Decision 13. Owes: the moment played whole, quiet, before anything is offered.
21. **Stay for tea?** Decision 14. Owes: the loud moment, and the answer performed in the game's normal grammar, which a scripted run can finally show.
22. **The coda: her.** Decision 15 staged: the house warm after the win but this room still holds a chill, frost on its glass, gold light through the door; same spots, same book; her trace is the second chair, dragged in. (A separate chill-hint beat between win and offer was offered as a candidate frame; Mark did not take it.)
23. **Tea.** Her entry done, the second cup poured, her in front of it, barely there, the way every spirit is. About two sentences, written later. Owes: read-time on the sentences, then she fades in, or writes in, at the end of the animation. The image is the ending either way you read it: you got her back, and you took her like the others.

## Open design threads, routed elsewhere

Not pass-two work; listed so the scripted pass neither solves nor contradicts them.

- What her finer tools do, and whether they unlock new night-verbs beyond bowl, ward, and candle: #25, ordered before #14. Carry Mark's evidence there: he bounced off "tools that change nothing" in two separate rounds, and "how do you listen, with a vial?!" is the legibility bar the tool fiction must clear.
- How road-checking enters the day (radio or weather line, status line, confirm-on-stay; none loved): #15.
- How the coda is made hard to fail: design still owed, surfaces at resolution.
- Book marking interaction (hover to strike or circle, first-time animation vs hand-holding): build-time design.
- Revisiting opened kept rooms as ambient reward (Mark likes the idea): route at resolution.

## Deliberate placeholders, not decisions

The morning candle-mark presentation (#17's), threshold numbers 2/4/5 (#14's), Leave offer wording (#15's), teal-scarf keeper and gold-shawl aunt accents, the "Speak the name" verb, the tool names and everything about what tools do (#25's).

## Cancelled

The mocked-book-pages teaching test with fresh testers, a hand-off from #24, was struck outright by Mark on 2026-08-10. No tester session happens, and nothing downstream should expect one. The strike is recorded on #24's resolution comment and #20's hand-off comment.
