# Lessons: this codebase's traps

Defects this app has actually shipped, and the shape that produces them. Repo-wide working lessons are in `docs/agents/lessons.md`; this file is about the code in `apps/hungry-grave/src`.

## The screen pool

**A pooled screen leaks anything nobody explicitly clears, and that is now five instances.** The pause blur, the held keys and drag anchor, `interactiveChildren`, and two inside the renderer. The general form: when the engine template writes a property on the way out, find the line that writes it back, and if that line sits behind a condition this app never satisfies, it is a bug waiting for run two. The reliable check for a new screen is to walk every property navigation touches, not only the ones the screen sets itself.

**A pooled leak hides in the renderer's caches, not only in the screen's fields.** One plan named the screen's own per-run field and the dispatch cleared it correctly, then leaked through the renderer's shot memory and a scatter's birth tick. The general test: **does this field compare against a value that resets with the run?** A draw cache keyed by slot is fine, because the sprite persists alongside it. Anything holding last frame's liveness, or a tick, is not.

**A rendered check that only ever plays run one is structurally blind.** Three dispatches of screenshots passed while every run after the first had dead buttons. Any rendered check here plays a run, ends it, and plays another.

## The sim

**Live streams on `RunState` mean `toEqual` compares closures**, so the digest compares a by-value snapshot. Written into the code that hit it.

**`1000 / 60` is inexact in binary64**, so `clock.ts` carries a named `TICK_TOLERANCE`. Same shape as the reservoir's fill, where `r + (CAP - r)` can exceed `CAP` by one ulp.

**A determinism snapshot that omits a pool lets two runs diverge inside it and pass.** It now spreads the stage, the id counter and every entity pool.

**An invariant that records its watch before it validates leaves a rejected value in the watch**, so the next check on the same run reads the broken state as healthy. Record after both checks.

## The bot

**A stand-in bot can be structurally incapable of the very manoeuvre a mechanic is bounded by.** `dodgePolicy` maximizes the tightest clearance over a half-second lookahead and projects threats at constant velocity, so it always flees a chaser radially. Cutting hard across a ghoul means accepting less clearance early to get behind its turn, which that scoring can never pick. **The turn-rate fairness bound in ADR 0016 therefore has no evidence behind it.** Read it by hand; do not improve the bot to make a test pass.

`dodgePolicy` also does not price the field edge, because the move clamps, so moving into the wall scores the same as standing still. A capped room-to-move term was written and re-run across five seeds and saved nothing.

## Reading a build without weapons

**The missing weapons inflate mob fire multiplicatively, not uniformly.** An armed mob's shot output is a function of how long it lives, so a weaponless build multiplies twice: more shooters alive at once, and each firing five or six times instead of zero or one. Mob counts in a weaponless read are roughly right. Mob fire is off by about a factor of five. Any pacing read from a build without weapons has to say which of the two it is measuring.

## Colour and readability

The full derivations are in `docs/research/readability-value-band.md`. Two conclusions that get misapplied if only the numbers are read:

**A relation fitted on luma is not a relation a player can see.** Luma is the right metric for ADR 0014's band, which is a one-way floor over mob fire. It is the wrong metric for "can these two things be told apart", which is APCA. Any palette claim of the second kind gets checked in APCA before it is written down.

**Above luma 60 this palette's value budget is spent, and the fix is a second colour rather than a better one.** 62 of the 66 pairs up there measure Lc 0.00. ADR 0014 already solved it once, for mob fire, with a three-colour sprite carrying a near-black outline. That construction is the general answer.

**An APCA bracket is not transferable between contexts.** Written into `readability-value-band.md` beside the paragraph that caused it.
