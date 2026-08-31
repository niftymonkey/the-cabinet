# Replay: where it came from

The replay system exists because answering "what was happening in the game" through memory and hand-typed notes was not working. The agent kept asking Mark questions about bullet speed and density, mob counts at peak moments, how often the belch felt necessary. The honest answers required either a good memory or a way to record what actually happened. Recording won.

The insight that shaped the implementation came from PUBG: a replay only needs what the engine cannot reproduce on its own. Player actions and the seed regenerate everything else deterministically, so the tape stays small. The same idea drove Hungry Grave's tape format, and it works: a run recorded, saved, and played back looks exactly as it was experienced.

The PUBG example also carried a second want, not yet built: sending a run to somebody so they can watch it the way the player did, including seeing what the player could and could not see at the time. The v1 scope covers the recording and the local playback; sharing a tape as a file is the piece issue 49 owns.

## What the tape turned out to be

Once the ugly slice existed (a full first pass with a mini boss and a boss, roughly four minutes), the tape for that run was around 700 KB. Scaling that to the 25-minute level v1 aims for makes it far too large to treat as something a person emails or a player downloads without thinking about storage. The size problem is the reason the tape had to be an efficient, deliberately designed format rather than a naive dump.

The same work surfaced a second want beyond the tape: general observability. Not only movement and actions but pickups, damage, frames per second, and anything else the engine can report about its own behaviour. Performance metrics matter most, and the first thought was an RxJS-style observable-stream mechanism so the game could store all of it alongside the tape.

As the implementation matured, though, the observability streams started to look like a separate concern from the tape itself. The tape answers "what happened in this run so it can be replayed." Observability answers "what is the engine telling me about how it ran." They can both be collected, but the tape does not have to carry every stream, and a server-side store (once one exists) could hold them together without the tape needing to.

The same reasoning applies to the file itself: a file was the mechanism available now, not the end state. Once a server and a database exist, the game could post a run's tape (and observability data) directly, beta testers could contribute without ever touching a file, and the file becomes an export path rather than the primary storage.

## What the tape format needs next

The tape's binary format was the right call for its first purpose: compact, deterministic replay. Nothing about the format is wrong. The risk is that it now has more than one consumer, and each consumer reads the same bytes without a documented, versioned contract.

The playback engine, the measure tool, and the eventual player-facing replay all touch the same bytes. None of them share a documented schema. If more consumers are added (a server, the player route, an observability store) without fixing this, each one builds its own ad hoc path into the format and it becomes something nobody can change safely.

The fix is not a service layer, an API, or a database. It is a documented, versioned schema: the header already carries a format version, and a spec describes what every segment means. Every existing consumer already reads through `decodeTape`, so this is mostly documentation work. It is the thing that makes every future consumer read against a contract instead of guessing at bytes.

The measure tool's output pollution (issue 71) is a separate problem with a separate fix. It does not mean the tape format is wrong. A schema document fixes the consumer problem; issue 71 fixes the tool's output stream.

## Deliberate decisions recorded

- The RxJS-style multi-stream observability idea (performance, player actions, movement, mob actions, damage as separate streams) was a real design discussion, deliberately parked. The current need does not justify an external observables library beyond what PixiJS already provides. When observability is needed, it is designed then.
- Observability streams are a separate storage concern from the replay tape. They do not go in the tape.
- Files are the v1 delivery mechanism for issue 49. The eventual server-side store coexists with files as long as the tape format is stable, because the server accepts the same bytes the file contains. This is not a choice between the two right now.

## The size problem, and where it actually comes from

The 700 KB figure from the ugly slice is not the whole story. Breaking down what the tape actually carries per frame reveals that the dominant cost is the frame observations section, not the player actions or the seed.

The frame observation row is 25 bytes fixed width. At 60 FPS that is 1500 bytes per second, 90 KB per minute, and roughly 2.25 MB for a 25-minute run in the observations section alone. The command stream (player actions, two float32 of steering plus a flag per tick) is much smaller by comparison, and the checkpoints are bounded by the checkpoint spacing.

The frame observations exist because the tape was built to answer the agent's tuning questions. They are observability data riding in the same container as the replay data. They do not serve the replay's purpose: a replay does not need to know what the render loop's interval, advance, update time, and tick debt were on any given frame. The engine regenerates everything visible deterministically from the seed and the commands; frame observations are what the engine reports about its own behaviour while it happened.

PUBG (and games with similar replay systems) do not record per-frame engine telemetry in their replay files for the same reason. They record player positions, actions, and the seed. The replay stays small because the only thing in it is what the engine cannot reproduce on its own.

## The container split

The tape already has three separable sections (commands, checkpoints, observations) plus a header and trailer. The structural separation exists. What does not exist yet is a deliberate decision about which sections go into which container.

The shape of the fix:

1. **Replay tape (the small one):** header, commands, checkpoints, trailer. This is what the player saves, what gets shared, and what the server eventually stores. Without observations, a 25-minute run at 60 FPS is likely well under 100 KB, small enough to handle casually.
2. **Observability data (the larger one):** frame observations and fault observations. This is what the measure tool and any future performance-reporting feature consume. It can be a separate stream, stored separately, and sent to a different place (a "share performance data" button, a different database table, a different API).

This is not a redesign of the format from scratch. It is a deliberate decision about which sections serve which purpose, and then updating the recorder to write them separately. The format already supports it structurally.

## The three-stream distinction

Within the observations data, three further distinctions emerged from discussion:

- **Frame observations:** what the render loop did on a given frame (interval, advance, update time, debt ticks). This is the engine reporting on its own render loop.
- **Fault observations:** errors the engine caught, with identity, severity, first tick, and count. This is error reporting, not performance data and not replay data.
- **Performance data:** the broader category (FPS, timing, device conditions) that a player might consent to share. Frame observations are a subset of this, but the category is larger and its destination is different.

These are three different concerns with three different destinations. They currently share one container because the tape was built to answer one set of questions and the others had not been asked yet.

## The RxJS question: when it earns its place

The instinct to reach for RxJS (or a similar observable-stream library) came from seeing these three distinctions and wanting a deterministic, composable way to route each to its own destination. The instinct is right in shape but premature in timing.

The trigger for introducing a stream library is not "I want to think of these as streams." It is the first time manual code to combine, filter, or throttle multiple event sources becomes ugly or hard to reason about. Right now all three are collected synchronously inside the same tick loop and appended to the same recorder. There is no composition, no throttling, no combining, no subscription lifecycle to manage. The problem the library solves does not exist yet.

When it does exist (a debug logger, a performance reporter, and a telemetry uploader all wanting to subscribe to the same game events in different combinations), that is the moment a stream architecture pays for itself. Building it before there is a second real consumer is the same trap as building a schema before there is a second caller.

## What the open questions are

- Does the measure tool stop reading the replay tape and start reading a separate observability container? This is the concrete decision that forces the container split.
- Does the container split happen as part of issue 49 (the player-facing replay, which needs the tape to be small) or as its own ticket? Issue 49's scope already requires the tape to be handleable by a person; the split may be the prerequisite that makes that possible.
- When the server exists, does it accept the replay tape and the observability data as separate uploads, or does one consent button cover both?
- Does the documented, versioned schema (from the earlier section) describe one format with optional sections, or two separate formats?
