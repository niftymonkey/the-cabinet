# How we got here

Record of the design conversation that produced `game-concept.md`, `tooling-and-assets.md`,
`../research/design.md` and `docs/design/cabinet.md`. All of it happened in one session on
2026-08-06.

## Where it started

Mark shared a screenshot of a Discord thread in a channel called Spooky/Spoopy. Friends running an
informal jam: everyone builds their own game, spooky theme, done before Halloween, no other rules.

Ideas already in the thread: one romance option is secretly a serial killer, games with a fall
season get a Halloween festival, find and unlock spirits and befriend them, horror is mostly
folklore, discover the monster's weakness each round. Genre suggestions ranged over point-and-click,
incremental, visual novel, Stardew-like, 3D like Five Nights at Freddy's, and pixel top-down or
isometric like Project Zomboid.

Mark's ask: be grilled, and work out what to consider.

## How we worked

Three rounds of constraint questions before any concept was proposed, then concept work with Mark
steering. Docs and research were added partway through at Mark's insistence. Both should have been
there from the beginning.

## The path

1. **Constraints.** Solo build. Web and TypeScript. Design routes around art, with AI art as
   optional later fill. Goal is to ship something finished. Tone: cozy-spoopy. The core verb Mark
   wanted was poking at something to see what happens.

2. **Lanes.** Four offered, then four more. Mark picked deduction roguelite and spooky incremental
   from the first set, seance board and cryptid field guide from the second. All four turned out to
   be the same game: a hidden ruleset the player reverse-engineers.

3. **The writing worry.** Mark said he would lean incremental if writing were not a blocker, since
   he does not consider himself a writer. The answer was that incrementals need good naming and good
   unlock pacing rather than prose, and that folklore gives you content to transcribe rather than
   invent. That opened the door to a hybrid.

4. **The hybrid.** Knowledge as the currency. Solved spirits produce resource, resource buys
   experiments, experiments buy deduction, deduction solves spirits. The incremental curve falls out
   of the deduction instead of being invented and tuned.

5. **Mark found the hole.** If nights are unlimited there is no reason to want more experiments per
   night, which makes the incremental spine decoration. The fix was that unnamed spirits drain the
   house. That single change produced the pressure, the race between two curves, a loss condition
   with no combat system, and a darker tone, all at once.

6. **The frame.** "Befriend the house" was rejected as too cute. Replaced with binding by true name,
   which is the oldest rule in folklore and makes deduction the literal mechanism of power. Later
   split into **naming** (the action) and **keeper** (the role), once the ending turned warm and
   "binding" stopped fitting.

7. **The Cabinet.** Mark pointed at his Nostalgia repo. It turned out to hold a finished, tested
   launcher and two empty game stubs. Rather than widening Nostalgia's retro-remake identity, the
   architecture gets copied into a new box called The Cabinet, with Nostalgia recreated inside it
   later if wanted.

8. **The house.** One house, and it is the player's own. Mark's version beat all three of mine: I
   kept looking for a reason the player cannot leave, and he gave a reason they will not. A relative
   left the house to them, they love it, they find out it is haunted, they stay anyway.

9. **The ending.** Mark's. The aunt was doing the same thing, she lost, she died, and because she
   died she is now another spirit in the house. Straight causality. My version had her as a
   mind-bendy final twist and was worse. Naming her lets her stay rather than putting her to work,
   and she is optional so the good ending is earned.

10. **The loss condition.** Mine relied on prose to carry the point that she could have left and
    would not. Mark rejected it on the grounds that it needs good writing to land, and replaced it
    with a mechanic: cold has stages, a Leave action appears, and further down it disappears. The
    player nearly repeats her death themselves.

11. **Title.** Housewarming, from a shortlist. Reads three ways: warmth is the resource, the fiction
    is warming a house, and a housewarming is having someone new in the house, which is the ending.

12. **The axes.** Hour, lure, aversion, haunt, each paired to a player control. Research showed this
    is structurally Mastermind, that feedback density rather than search space is the real difficulty
    dial, and that parallel puzzles sharing resources multiply difficulty rather than adding it.

13. **Presentation, and a correction.** Mark asked whether the concept transcends the text-and-
    reading core it had drifted into, saying he is not much of a reader and was worried the game
    would be too dull to build. He was right, and the design had the evidence to know better: the
    deduction research said clues belong in the environment, and it had put them in menus anyway.
    The morning became a scene you look at rather than a paragraph you read, sound became a
    first-class channel, cold became a loss of visibility, and the stack went back to React plus
    PixiJS.

14. **Tooling and assets.** Sound turned out to be better supplied than art. PixiJS has no MCP
    server but does have an official skills collection for Claude Code. Mark found that page himself
    at pixijs.com/llms. See `tooling-and-assets.md`.

## Course corrections Mark made

Kept here because they are the useful part of the record.

- After the first grilling rounds I jumped straight to a single recommendation and framed the only
  remaining question as an implementation detail, skipping whether that was the game he wanted at
  all. He called it out and the candidates went back on the table as a real choice.
- No docs and no research had been produced. He pointed out that research into what makes games
  work should have come before designing one. Both started at that point.
- A passing personal detail he had shared for context ended up in a doc. He asked for it out. It was
  removed and is recorded nowhere.
- He corrected an over-reading of his ending idea. He meant simple causality, not a twist.
- He said puzzle games are outside his usual genre, so his own taste is not a reliable difficulty
  gauge. That produced the most useful conclusion in the project: the automated solver is not just a
  fairness check, it is the difficulty instrument, so difficulty gets measured rather than argued
  about.
- He questioned whether the concept had drifted into being a reading game. It had. The presentation
  rework came out of that.
- Asked what part of building this would be fun for him, he ruled the question out of scope. He has
  been an engineer for thirty years, got into it wanting to be a game programmer, and has never made
  a game. The goal is a good game built properly, piece by piece, not one routed around his comfort.

## Where it stands

Design is essentially complete and recorded. Open questions are listed at the end of
`game-concept.md`. The next piece of work is a build plan rather than more design.
