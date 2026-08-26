# Drop legibility: the fix inside #36

The plan half of the feature playbook's dispatch contract, for the one acceptance criterion of #36 that Mark's 2026-08-23 play failed: "Every drop shows which line it upgrades at a glance, with no HUD glance needed."

Settled 2026-08-25 by a throwaway prototype played by Mark, at https://claude.ai/code/artifact/12739de2-504a-40e1-ab76-409c0904fce8

## The finding the prototype produced, which is the whole reason this ticket was hard

**A drop draws smaller than a corpse, while every number in the tree says it draws bigger.**

- `src/game/drops.ts:42` sets `DROP_HALF_EXTENT = 8`, so the drop's box is 16 units against a corpse's 14 (`src/game/corpses.ts:37`).
- `src/app/palette.test.ts:629` asserts exactly that, 16 greater than 14, and passes.
- But `drawDropIcon` at `src/app/screens/game/FieldRenderer.ts:291` draws shapes that use a fraction of the box. The headstones icon is `circle(0, 0, r * 0.72)`, which is **11.5 units against the corpse's solid 14**. The other three are concave slivers narrower still.
- Then `drawDrop` at `FieldRenderer.ts:334` punches a `dropCore` circle through the bright middle, and a 1.5-unit dark `foodOutline` stroke eats more of a small shape's area.

The test measures the constant. The player sees the ink. This is the class of defect feature-playbook rule 2 exists for, and it explains Mark's read far better than any colour argument does: "they're just very, very hard to see, so that's the biggest problem."

**Consequence for this plan: until a drop is visible, no channel can be judged.** Weight comes first and everything else sits on top of it.

## The route not taken, recorded so it is not re-walked

The first plan for this ticket gave the four lines four hues. It was wrong, and the repo already said so. `docs/research/readability-value-band.md:826` states plainly: **"The per-line drop colours have no budget here."** Hue is scarce, mob fire closes 0 to 39 degrees, the brown ban closes 20 to 50 at saturation, and amber at 41 is spoken for. Line 822 adds that above luma 60 the value budget is spent and every remaining distinction has to come from hue, silhouette or motion.

A full derivation was run anyway and confirmed the squeeze from the other side: four hues can be found at a shared luma 67.25, but they cannot also be separated on the protan and deutan scales, because sharing one luma and separating on an observer luma are the same requirement pulling opposite ways. The four candidate hexes and their measured table are not carried forward. **Colour is not the channel.**

One finding came out of that derivation and is routed to #38: `skull` (hue 208.24), `stone` (208.42) and `bellRing` (210.00) sit inside two degrees of each other, so three of the four weapon lines are one pale blue-grey on the field.

## 1. The thing, in observable terms

A player mid-dodge can tell, without looking at any readout and without looking at the drop, which of the four weapon lines it will upgrade.

- A drop draws at **24 units**, filling its silhouette rather than a fraction of it, with no dark core punched through the middle.
- The four silhouettes split on the coarsest axis a shape has: **tall, round, pointed, wide.** This is what survives a peripheral read.
- A drop **breathes**: its drawn size pulses by about 18 percent on a 2.75 second cycle, so it separates from the still corpses around it.
- **Its brightness never changes.** Steady-bright still means treasure (ADR 0004), and the corpse's own last-chance flicker keeps the brightness channel to itself.
- The draw stack is unchanged. `treasure` stays above corpses and mob bodies and below mob fire, per ADR 0014. Ruled by Mark 2026-08-25 after considering drawing drops above everything: "I think how we're doing it now is fine."
- No sim number moves. Every sealed tape outside the tree still replays byte-identically.

### Why a size pulse and not a brightness pulse

Mark played both. His ruling, 2026-08-25: "Size only. Keep the existing steady-bright treasure rule. The prototype proved that motion helps, but I don't think we have a reason to spend an existing visual-language distinction when size can provide that motion."

The distinction being protected is real and written down twice: `FieldRenderer.ts:582` pins that a drop never takes the freshness tint and never flickers, and `palette.test.ts:134` exempts `graveGlow` from sharing `drop`'s hex on the stated grounds that "the glow is the grave wearing treasure's own colour, always at the grave's own position and **pulsing where a drop is steady**". A brightness pulse would have made that sentence false. A size pulse leaves both standing.

### Drawn size versus the hitbox

The drop's hitbox stays `DROP_HALF_EXTENT = 8`. Only the drawing grows, to 1.5 times the box, plus the pulse. The precedent is already in the tree and already tested: `FieldRenderer.test.ts:445` asserts a mob-fire shot "draws larger than its hitbox and its core no larger than its hitbox", and `SHOT_DRAW_SCALE` is 1.6. So a drawn-larger-than-hitbox sprite is the house style rather than a new liberty, and `palette.test.ts:629`'s bound on the hitbox against the grave's floor width is untouched.

## 2. Verification steps, with actors

1. Every planned test in section 4 written and green. Actor: the agent.
2. `pnpm test` (full suite), `pnpm typecheck`, `pnpm build`, all clean, full log kept. The historic flaky-test anomaly is still on watch; the baseline on `eeda8b5f14` is 69 files, 1035 passed, 10 expected fail, 3 todo. Actor: the agent.
3. A rendered check of the built app via `pnpm vite preview`, never the dev server, screenshots actually read: a drop plainly reads larger than a corpse beside it, and the four are separable. Actor: the agent.
4. A grayscale check at the same moment: mob fire still wins wherever it overlaps the storm (ADR 0014), and a drop is still tellable from a shot. Actor: the agent.
5. Deploy, following `apps/hungry-grave/docs/deploy.md` exactly, and only after Mark says yes. Stop and ask. Actor: the agent, after Mark's yes.
6. The play: does a drop now say which line, mid-dodge, with no HUD glance. Only Mark can call this. The agent delivers the build and reports it ready; it never claims the read is right. Actor: Mark.

## 3. Module boundaries

The whole change lives in `src/app` plus its tests. Nothing under `src/game`, `src/dev`, `src/tape` or `src/prototypes` is edited, which is what keeps every sealed tape replayable and keeps this out of the determinism surface entirely.

- **`src/app/screens/game/FieldRenderer.ts`.** `drawDropIcon` is replaced by four coarse silhouettes filling their extent. `drawDrop` drops the `dropCore` circle, draws at `DROP_HALF_EXTENT * DROP_DRAW_SCALE`, and applies the breath. The breath is a pure function of `run.tick`, never of wall clock, so the renderer stays a pure function of sim state, the same rule the corpse flicker's phase offset already follows at `FieldRenderer.ts:646`.
- Two new constants beside `SHOT_DRAW_SCALE`: `DROP_DRAW_SCALE = 1.5` and the breath's period and depth. Named and derived in the file, in the shape `SHOT_DRAW_SCALE` already sets.
- **No palette entry is added or changed.** `PALETTE.drop` stays the one treasure gold.

## 4. The planned test list

Pinned as `test.todo` before implementation. Each cites what it enforces.

In `src/app/screens/game/FieldRenderer.test.ts`:

1. **A drop's drawn ink is larger than a corpse's, measured off the sprite rather than off the constant.** This is the hole the whole ticket fell through: `palette.test.ts:629` compares `DROP_HALF_EXTENT` to `CORPSE_HALF_EXTENT` and cannot see the drawing. Compare drawn bounds to drawn bounds.
2. **Each of the four silhouettes fills its extent**, so no icon quietly shrinks back to a fraction of the box.
3. **The four are separable on the coarse axis**: their drawn bounds differ in aspect, not only in outline, so a corner-of-the-eye read has something to work with.
4. **A drop's brightness is constant whatever the tick**, so the breath never leaks into the value channel. `FieldRenderer.test.ts:501` already asserts this for the freshness tint and must stay green untouched; this adds the pulse's case.
5. **The breath is a function of the tick alone**: the same tick gives the same drawn size, twice.
6. **A drop still draws into the treasure layer and never the corpses layer.** `FieldRenderer.test.ts:469`, stays green untouched.
7. **Nothing draws a `dropCore`**, guarding a deliberate absence, since the core is what ate the bright middle. Per code-core, a deliberate absence gets a test that fails if the absent thing appears.

Unchanged and expected to stay green with no edit: `palette.test.ts:629`'s hitbox bound, and every test under `src/game`.

`FieldRenderer.test.ts:483`, "draws a different silhouette for each of the four lines", is expected to stay green: it distinguishes by `getLocalBounds()`, and four coarse shapes differ in bounds more than four fine ones did.

## 5. What #38 inherits, and what it may not spend

Mark's ruling, 2026-08-25: "The current primitive shapes are not the final identity. #38 can replace them with weapon-appropriate Halloween imagery, but it must preserve the coarse silhouette separation so the four drops remain immediately distinguishable."

So the deliverable to #38 is the rule, not the shapes:

> Four drops, each drawn at 24 units, filling their box with no dark core, breathing on size alone, and split on the coarsest silhouette axis there is: tall, round, pointed, wide.

The imagery lands on those axes almost by itself, and the natural mapping flips two of this dispatch's assignments, which is fine and expected: a **headstone** is tall, a **skull** is round, a **flame** is pointed, a **bell** is wide. What must not happen is the art pass spending the separation back on four shapes that are all roughly the same aspect.

## 6. Slices

Two, in this order, each green before the next starts.

1. **Weight.** The four silhouettes fill their extent, the dark core goes, the drawing scales to 24 units. This alone is the "can I see it" fix and it is the larger half of the read.
2. **Breath.** The size pulse, on the tick.

If slice 2 fights, slice 1 still stands on its own and the breath is reported as unlanded rather than forced.

---

# The gate round, and the rulings it produced

Three plan gates fired on this document on 2026-08-25, at standard depth per `docs/agents/review-gates.md:12`. They should have fired before the dispatch and did not; that is recorded here rather than quietly fixed. Markers are on #36: product vision `issuecomment-5416998699`, game design `issuecomment-5417022124`, tech architecture `issuecomment-5417036709`.

**All three converged independently on one finding**, which `docs/agents/lessons.md:29` names as the signal that separates a real defect from a lens's preference: the plan draws the drop wider than the grave is at its size floor, and `palette.test.ts:629` stays green while the ruling it was written to hold is broken. That is this document's own thesis, the test measures the constant and the player sees the ink, reproduced one level up against the same assertion.

## Mark's rulings, 2026-08-25

**1. Twenty-four is the ceiling, and the breath moves inward from it.** Verbatim: "Keep 24 as the maximum and have the size breath move inward from there. I don't want to weaken the readability fix to preserve a visual size relationship that is not a gameplay rule, and I don't see evidence that we need to grow beyond 24 either." So `DROP_BREATH_DEPTH` inverts: the drawn peak is 24 and the trough is below it. The shipped constant currently grows outward to 28.32 and is wrong.

**2. The catch box grows to 28 units**, `DROP_HALF_EXTENT` from 8 to 14. The rule behind it, in Mark's words, and the rule outranks the number: "the pickup area should stay slightly more generous than the drop's maximum visible footprint, because collecting treasure should not be a precision test."

Three reasons it is more generous than the ink rather than equal to it. The breath moves the visible edge, so a catch box equal to the peak makes "I touched it and got it" true at one phase and false at another, where a box above the peak makes it true at every phase and testable. The grave's own hitbox shrinks with damage, so the grab is hardest at the size floor, which is exactly where ADR 0003's ladder is stripping weapon levels and the recovery path has to stay open. And ADR 0003 already ruled that size never gates a swallow, so a swallow not being a precision test is the philosophy already on the record.

It is deliberately nowhere near the genre's most generous. Touhou ships a 48 by 40 catch for a 16 by 16 item, three times the sprite, but its items are collected in bulk behind an auto-collect line. Here a drop is one of ten to twelve in a run and ADR 0002 makes it the thing the player routes toward, so a catch box large enough to remove the routing choice would delete the mechanic. 28 against a 24 peak is about 1.17 times the ink.

**3. Twenty-eight is tuning, not doctrine.** Mark: "If the playtest shows that pickups feel magnetic enough to remove the routing choice, that is the trigger to tighten it." Trigger: #31.

**4. Tape compatibility is not a cost, and this is a general ruling rather than one about this change.** Verbatim: "I don't want existing tapes to constrain intentional game tuning at this stage. We are going to change simulation behavior as we iterate toward the game feeling right, and old tapes becoming incompatible with new rules is an expected consequence that the replay/witness system should detect honestly." This supersedes the working assumption that a sim change must be avoided because sealed tapes exist. The witness refusing an old tape is the system working, not a regression.

**5. The `palette.test.ts:629` assertion is retired**, with the supersession recorded.

## The supersession, written out

**Superseded:** Mark's ruling of 2026-08-22, carried in `src/game/drops.ts:33` and asserted at `palette.test.ts:629`, that the drop is bound under `graveWidth(SIZE_FLOOR)` so the smallest grave can visibly swallow it.

**What stood:** the reasoning that produced it. The bound was never mechanical, and the comment says so twice: ADR 0003 rules the mouth is not a gate. It existed purely for the read.

**What it could not have known:** that the drawn ink and the constant had come apart. At the time it was made, the drop drew at its box, so bounding the constant bounded the read. This ticket found that the icons used a fraction of the box and a dark core ate the middle, so the assertion had been guarding a number that stopped describing the picture. Bounding a hitbox no longer bounds anything a player sees.

**What replaces it:** two bounds instead of one, each on the thing it actually governs. The drawn peak is bounded at 24 units. The catch box is bounded below by the drawn peak, so the pickup area is never smaller than the largest visible footprint.

## Gate findings folded into the plan

- **The tests are blind in the way this ticket indicted.** Planned tests 1 to 3 measure `getLocalBounds()`, which cannot see ink: a concave star fills its bounding box exactly and is mostly empty, which is what the shipped wisp and bell icons are. They become a **coverage** measure, filled area over bounding-box area, computed from the polygons with the shoelace formula and no rendering.
- **Planned test 7 guards a name, not a defect.** It bans the identifier `dropCore`, where the defect is dark ink inside the silhouette at a small draw size. #38 brings a headstone with engraved lettering, a skull with eye sockets and a bell with a dark mouth, each of which honours the letter and reinstates the hole with that test green. It becomes a coverage floor stated as a number, which holds through an art pass because it says nothing about what the shape is. That also un-forecloses the one-token-plus-interior-mark construction that Gradius and Contra ship, which the blanket ban had closed off in code before #38 started.
- **The slice order's claim is backwards for this criterion.** Weight buys detection; #36's criterion is identification, and peripheral identification is limited by crowding, whose extent does not scale with target size (Pelli and Levi, *Vision Research* 2002; replicated in the Bouma-law work at PMC10408772). What breaks crowding is temporal change. So the breath is the half with evidence behind it, not the droppable polish. Section 6's "if slice 2 fights, slice 1 still stands" is withdrawn: the confirming play is only valid with the breath in, and #38 must not inherit the breath as optional.
- **The breath needs a per-drop phase offset.** It takes `run.tick` alone, so every drop pulses in lockstep and a drop can be born at its smallest, which is the moment it most needs to be seen. `freshnessBrightness` at `FieldRenderer.ts:646` already offsets each corpse's flicker by its own id; use the same.
- **`PALETTE.dropCore` has no drawing consumer any more**, while `palette.ts:91` and `:99` and `palette.test.ts:144`, `:222` and `:239` still describe it as a drop's own dark core and justify declaring its hex twice on that basis. Retire it, or copy the `graveRim`/`mobDark` exception form at `palette.test.ts:152` which states the absence and its trigger.
- **A comment written this session is already false.** `FieldRenderer.test.ts:488` says what separates a drop from a shot is not size but that a drop is steady. Both halves are now untrue: size separates them 24 to 16, and the drop breathes. The word "steady" was carrying a second job as the drop-versus-shot discriminator and this plan only protected its first.
- **The silhouette mapping ships known-wrong.** The soul stream holds the tall bar and headstones the disc, while the natural imagery is the reverse. Swap them now: #31 is the playtest that reads whether a drop says which line, and running it on a mapping already scheduled for inversion makes any tester confusion unattributable.
- **The scale breath scales the stroke.** A drop's `foodOutline` oscillates between 1.5 and 1.77 units where `SPRITE_STROKE` is fixed at 1.5 for every other food sprite, and ADR 0014 grades strokes in APCA brackets that carry width terms.
- **Verification step 3 is too weak to catch what the gates found.** It reads "a drop plainly reads larger than a corpse beside it". It becomes: over a floor-size grave, and beside a ghoul, which turns two arguments into one screenshot.
- **Verification step 4 overclaims.** ADR 0014's grayscale check runs at the density the tuned field measures, which is #39's. Step 4 is a spot check and says so.
- **The numbers are not attributed.** 24, the breath depth and 2.75 seconds are the values Mark played in the prototype. Say so, because `VISION.md` section 5 says numbers are measured rather than written down as rules.

## What #38 inherits, corrected

Section 5's rule travels with two changes the gates forced. **"24 units" does not travel**: it is this build's measured value, and the constraint that matters to an art pass is "visibly more ink than a corpse, filling its box", expressed as the coverage floor. And **tall, round, pointed, wide is exactly four axes for exactly four lines**, while ADR 0005 rules the weapon-line pool is open and a new line claims a motion no line owns yet. A fifth line needs a drop silhouette and the coarse axis is exhausted. Trigger: the first proposal for a fifth line.

## Still open, with triggers

- **The drops-under-corpses separation force**, from Mark's 2026-08-23 read, has never been built, ruled out, or given a trigger. It gets one here. The weight fix probably resolves it for free, because a 24-unit drop overhangs a 14-unit corpse by five units on every side and treasure already draws above corpses. Trigger: #31 still reading a drop under a corpse as hidden.
- **A blue-yellow metric for `color.ts`.** `Observer` is `"normal" | "protan" | "deutan"`, so the repo cannot measure the axis on which three of the four weapon-line colours would separate. Routed to #38, which is the ticket that may re-hue into blues with a tool that cannot see them.
- **`src/game/corpses.ts:34`** still says seven units puts a corpse "clearly over a drop, so the three silhouettes stay ordered by size". Mark's 2026-08-22 ruling already broke that and this change widens it to 24 against 14. It sits in `src/game`, which this dispatch does not touch, so it needs its own pass rather than a smuggled edit.
- **#36 owes a sentence naming which criterion remains after this one**, so that #31 does not fire believing the difficulty read is settled. It is not: the quickly-fun-and-grows-teeth criterion is still open on the same 2026-08-23 play.

## Ruled after the dispatch reported, 2026-08-25

**`PALETTE.dropCore` is retired outright**, not given the `mobDark` written-exception treatment at `palette.test.ts:152`. The exception form exists for a colour a future dispatch will need; nothing needs this one, because the whole point of the change is that a drop has no dark middle. Deleting the entry makes the typechecker the guard, which is stronger than the source scan that planned test 7 relied on. It also removes the stale justification at `palette.ts:99` for declaring the hex twice. This belongs in this dispatch and not #38.

**`DROP_DRAW_SCALE`'s doc comment must be rewritten with the hitbox change.** It currently claims "every sealed tape still replays byte-identically" and that `palette.test.ts`'s bound "is untouched". Both become false at `DROP_HALF_EXTENT = 14`. The replacement says what is now true: the catch box is deliberately larger than the drawn peak, old tapes diverging is expected and the witness reporting it is the system working, and the retired assertion is superseded above.

**`SPRITE_STROKE` was exported by the dispatch** so a test could derive its tolerance rather than hard-code it. That is a seam the plan did not name and it is accepted, because the alternative is a magic number in a test that exists to catch magic numbers.

---

# The implementation gate round, 2026-08-25

Both implementation gates fired at quick depth on the finished diff, per `docs/agents/lessons.md:39`. Markers on #36: game design `issuecomment-5417942010`, tech architecture `issuecomment-5417964701`. Verdict from both: the implementation honors every ruling; nothing blocks. One ADJUST landed (the coverage floor's comment now says 0.5 is measured, the shipped kite's own coverage, not chosen doctrine). The DEFERs, recorded here so they are not re-derived:

- **#38 inherits a named limit of the ink instrument.** `brightInkArea` sums shoelace areas of fills, which equals visible ink only while fills are disjoint. Today's single-poly icons are; a skull built from overlapping shapes double-counts, and the more-ink-than-a-corpse test can pass while actual pixels shrink. The coverage side fails safe (dark overlaps under-count), so only the bright side is the trap.
- **#38 also inherits the floor's second job.** 0.5 is exactly a kite's coverage, so on the pointed axis the floor is a silhouette constraint with zero interior-ink slack unless the imagery is denser than a kite. The art dispatch must not lower the floor quietly.
- **The peak-only ink claim, measured.** The wisps kite out-inks a corpse for about 31 percent of the breath cycle; the other three beat it at every phase. Both gates judge this a designed consequence of three settled rulings, with the breath itself the identification channel. Trigger: #31 reading a drop as faint mid-dip. Levers, in order: `DROP_BREATH_DEPTH`, or the kite's half-width toward 0.66 at the cost of reading less pointed. The 24 ceiling is not a lever.
- **Born-at-smallest survives the phase offset.** The id offset fixes lockstep, not birth phase: a drop can still spawn mid-dip. Trigger: #31 reading fresh drops as faint. The fix shape if it fires: anchor phase to the drop's own spawn state, staying a pure function of sim state.
- **The bot re-pins carry no balance meaning.** Seed 505 sealing mid-ramp and 303 losing its ceiling victory are the dodging policy re-rolled under a bigger catch box, chaotic rather than directional. Nobody may read difficulty from them; #36's quickly-fun criterion stays open and human.
