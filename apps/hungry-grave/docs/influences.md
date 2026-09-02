# Influences

What Hungry Grave takes from the games that came before it, and what it refuses to repeat, organized by game system: the recurring parts every game has to design. Each entry opens with its stance (take or refuse) and the concept, then a short expansion and where the decision lives in our records. This document grows as the research and design docs get mined; the gaps section at the bottom lists systems not yet filled in.

## Core loop

The verb the whole game hangs on, and the reward loop around it.

### hole.io

- **Stance:** take
- **Concept:** the swallow.  
The grave swallows, grows, and passes under what it has outgrown, and getting bigger is the reward loop everything else serves. Lives in `docs/VISION.md`.

### *Shmup games*

- **Stance:** take
- **Concept:** bullet heaven, with deliberate doses of bullet hell.  
The other half of the founding idea: the player's own storm makes the bullet heaven, while bosses arrive alone with authored, readable bullet-hell patterns to keep it challenging, and dodging is the survival skill in between. Crossing this with the swallow is the game. Lives in `docs/design/game-concept.md`.

## Difficulty, pacing, and mob density

How the game decides what to throw at you, when, and how much, and how that answers the player's strength.

### Left 4 Dead

- **Stance:** take
- **Concept:** the drama band.  
The AI Director paces to how much pressure the players are under, building to a peak, holding, then granting a breather, so even a weak run keeps its dramatic wave shape and is never boring or flat. Valve scales frequency rather than amplitude, and keeps the skeleton hand-authored while directing only the population between the beats. We follow the same split: authored phases, bosses, and templates, with a director setting density and timing inside them, keyed to the pressure the player is under and never to the power they hold, superseding part of ADR 0006 (authored rows, not a director) in ADR 0047.
- **Sources:**
  - [The AI Systems of Left 4 Dead, Michael Booth, GDC 2009](https://steamcdn-a.akamaihd.net/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf)
  - [The Left 4 Dead AI Director, CenterConsulting](https://www.centerconsulting.com/ai-library/concepts/l4d-director)
  - [11 Secrets about Left 4 Dead's AI Director, AiGameDev](https://www.cs.drexel.edu/~santi/teaching/2012/CS680/papers/11%20Secrets%20about%20LEFT%204%20DEAD%E2%80%99s%20AI%20Director%20and%20its%20Procedural%20Zombie%20Population%20%7C%20AiGameDev.com.pdf)
  - [The Discomfort Zone, Gamedeveloper](https://www.gamedeveloper.com/design/the-discomfort-zone-the-hidden-potential-of-valve-s-ai-director)

### Battle Garegga

- **Stance:** refuse
- **Concept:** rank.  
Difficulty rises as the player collects power but pays nothing back, so the community's optimal line became deliberate suicide to stay weak. Powering up must never feel like a mistake, and our guard is structural: mobs are food, so density pays in souls and score, and the authored stage is a floor that power only ever adds on top of. The standing caution lives in ADR 0006 and carries into the directed-density ruling.

### ZeroRanger

- **Stance:** take
- **Concept:** the invisible downward-only safety net.  
When you are in real trouble the game quietly slows bullets and shaves enemy health, in amounts tuned so you never notice, then gets out of the way once you are winning. Assist flows only downward, never upward, so it never punishes skill; the developers' principle is "it's better to err on the side of the player being a little too powerful than a little too weak." Documented with sources and timestamps in `docs/research/panic-button-pricing.md`.
- **Sources:**
  - [The Design of ZeroRanger, System Erasure interview](https://www.youtube.com/watch?v=p6Q6NxvNeHA)
  - [ZeroRanger Wiki](https://zeroranger.miraheze.org/wiki/ZeroRanger)

## Weapons and power progression

How power arrives, how fast, and what it teaches.

### ZeroRanger

- **Stance:** take
- **Concept:** gradual system introduction.  
Power arrives in steps, one system at a time, so progression doubles as a teaching device; the stated contrast is Radiant Silvergun dumping seven weapons on the player at once. Detailed in `docs/research/panic-button-pricing.md`.
- **Sources:**
  - [The Design of ZeroRanger, System Erasure interview](https://www.youtube.com/watch?v=p6Q6NxvNeHA)
  - [ZeroRanger Wiki](https://zeroranger.miraheze.org/wiki/ZeroRanger)

## Determinism, replay, and storage

What must be reproducible, and what that forces about how randomness and saves work.

### PlayerUnknown's Battlegrounds

- **Stance:** take
- **Concept:** replay through the game itself, not as video.  
Watch a run back exactly as it happened, and share it so someone else sees it as you experienced it, played back by the actual game system. PUBG replays a data file in-engine; we rebuild the run from seed plus inputs instead, but the promise is the same, and replay is a shipped feature here, not just a tuning instrument.
- **Sources:**
  - [Replay Files Documentation, EpicKitten PUBG-Resources](https://github.com/EpicKitten/PUBG-Resources/wiki/Replay-Files-Documentation)
  - [PUBG replay guide, Metabomb](https://www.metabomb.net/pubg/gameplay-guides/pubg-replay-guide-control-system-and-save-folder)

### Slay the Spire

- **Stance:** take
- **Concept:** named seeded streams.  
Every die draws from its own seeded stream, so one seed plus the player's recorded inputs rebuilds the entire run exactly, and replay files store only movements, actions, and choices. Any new system, a director included, must draw from these streams and read only state that comes from seed plus inputs, or replay breaks. Recorded in ADR 0006; the replay constraint is restated in the belch grilling rulings of 2026-08-31.

## Gaps still to mine

Systems with research on file but no entries pulled up yet:

- **Screen readability and scale**: `docs/research/shmup-scale.md`, `docs/research/readability-value-band.md`, `docs/research/viewport.md`.
- **Panic button and defensive verbs**: the rest of the families in `docs/research/panic-button-pricing.md` (Cave and Touhou's score pricing, Enter the Gungeon's Blank, Ikaruga's polarity, Vampire Survivors' found triggers).
- **Progression and floor structure**: `docs/research/floor-ladder-precedent.md`.
- **Survivor-genre numbers and density baselines**: `docs/research/survivor-numbers.md`.
- **Collision and clipping**, **saving and persistence**: no research docs on file yet; entries start when those systems get designed.

A separate pass fills these in.
