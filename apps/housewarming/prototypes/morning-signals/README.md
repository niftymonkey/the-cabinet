# Morning signals

A prototype for the Wayfinder ticket [Play it: does a morning tell you enough?](https://github.com/niftymonkey/the-cabinet/issues/9)

**The question.** Does a morning actually tell the keeper enough to deduce a true name in a sane number of nights? This plays the night contract settled by ticket #3, with hardcoded pools of four values per axis, no presentation (ticket #17) and no sound.

**The economy in it is provisional.** The first playtest showed that with everything free the dominant play is a full candle every night and a coin flip on the last trait, which tests the information ceiling rather than the game. So the web version carries stand-in prices, every number invented for pressure only and owed to ticket #15: a candle costs its length in watches, a lure costs 1, a ward costs 2, each loose spirit drains 2 a morning, each named spirit gives back 3, a wrong name costs 3, and at zero warmth the house goes cold and the run is lost. The terminal version stays free of all costs on purpose, as the information-ceiling variant.

**This is not the kernel.** The kernel is its own ticket, built properly. This code is throwaway by intent and allowed to be bad.

## Run it

The playable version is `index.html`, a single self-contained page: open it in a browser, or play the hosted copy at <https://claude.ai/code/artifact/5dce53e3-60dc-473c-b5b9-e1e0192c11ac>. The controls for seed, spirit count, and the experiments-a-night cap sit in the header: one spirit is round one, two spirits is round two, and the cap is a crude stand-in for the warmth economy until ticket #15 prices things for real. Seeds replay the exact same house, so a run worth talking about can be re-rolled.

There is also a terminal version, the first cut, kept because it runs the same logic from `logic.ts`: `pnpm proto:morning-signals`, with flags `--spirits 2`, `--seed 123`, `--cap 2`. The web page carries its own hand-synced copy of the logic; if the two ever disagree, `logic.ts` is the one the kernel discussion will read.

## How to play

Each night: press `1` to `4` to set up a room (candle length in watches, then the lure, then an optional ward), `s` to sleep, and read the morning. When you think you know a spirit, `n` submits its whole name, all four traits at once or not at all. Wrong names cost nothing here; they are just counted.

The provisional targets, not to be defended: one spirit cracked in five or six nights, two spirits in ten to twelve, and no run that needs guessing.

## The log

Every run logs the same JSONL stream: run start with the rolled spirits (the answer key, so no peeking mid-run), every night's experiments and scenes, every naming attempt, and the run end. The terminal version appends to `night-log.jsonl` in this directory, which is gitignored scratch; the web page shows the stream in a copyable panel behind the Night log button, because the artifact sandbox blocks file downloads. The sharing ticket (#8) inherits this format rather than inventing one.

The runs the resolution rests on are kept in `playtest-logs/`, one file per run, so the basis of the decision can be replayed by seed.

## What it decided

Resolved 2026-08-07: the morning tells you enough, and the night contract survived play unchanged. One spirit fell in 4 nights (target 5-6); two spirits fell in 8 nights capped at one experiment a night, then 6 nights under the provisional economy (target 10-12); no run needed a guess, and two spirits stayed two separate puzzles behind their visible traces. Free naming attempts invited brute force until wrong names cost warmth, which is now evidence on the warmth ticket. The full resolution and the findings routed to other tickets are on [the ticket](https://github.com/niftymonkey/the-cabinet/issues/9).
