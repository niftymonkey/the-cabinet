// The version of what the derived readings mean.

/**
 * The version of the definitions behind the derived readings.
 *
 * It versions meaning, not build. `commitHash` and `buildIdentity` say which
 * build a tape was recorded against; this says which set of measurement
 * definitions produced the numbers read off it. The witness proves a replay
 * reproduced the recorded run, and nothing in it says two reports counted the
 * same thing the same way.
 *
 * Bump it when an existing reading changes meaning, or when comparison
 * semantics change, in a way that leaves old and new reports not directly
 * equivalent. Adding a brand-new reading beside unchanged ones does not bump
 * it: every old reading still means what it meant.
 *
 * The worked example is the bottom edge. One tape reported
 * tuning.gravePath.ticksNearBottomEdge as 366 before that reading was
 * corrected to measure the grave's bottom rim, and 560 after. Same tape, same
 * sim, same witness verdict, different question answered, and subtracting one
 * from the other would have been arithmetic across two definitions.
 *
 * Version 2: Territory became autonomous (#76 pass B). `bitten` and `spent`
 * are gone with the bite budget, and upfieldTraffic changed meaning: it
 * samples the field at the lay rather than at the swallow, so a version-1
 * band and a version-2 band answer different questions.
 *
 * Version 3: the readings step 4 tunes on (#39). Arrivals are new beside
 * unchanged readings and would not move this on their own, and neither would
 * the raw samples a spread now keeps. What moves it is the rungs a run bought:
 * a batch used to print them as one row named `levelUps` and now prints the
 * count, the first tick, the line and the section under `levelUps.rungs` and its
 * siblings. Every figure still means what it meant and no row can be
 * subtracted from its predecessor by name, which is the case this version
 * exists to make loud rather than leaving it to read as a reading one side
 * happened not to carry.
 *
 * Version 4: the glossary realignment (ADR 0061, #39). Eight reading and report
 * keys change name, so a version-4 report cannot be matched to a version-3 one
 * by name, which is exactly the case version 3 exists to make loud. The eight
 * are the six under `tuning.dropLedger`, now `tuning.powerUpLedger`, plus
 * `tuning.arrivals.byPhase`, now `.bySection`, plus the `phaseSpans` reduction,
 * now `sectionSpans`; the `phase` field inside every `SectionSpan`, now
 * `section`, rides with them. Every figure still means what it meant and not
 * one of them moved: this is a vocabulary change and nothing else.
 *
 * The other three versions hold, and each for its own reason. `FORMAT_VERSION`
 * stays 3 because the tape header is read positionally, field by field, and the
 * only strings on the wire are the recorded roster's weapon-line names, the
 * commit hash, the build identity, the author, the policy and the renderer
 * backend, none of which carries one of the six words: no byte moves and no
 * reader's walk changes. `WITNESS_VERSION` was not moved by the rename either,
 * because the fold takes numbers and every union crosses it through a code map
 * read by name, so renaming a key while holding its number changes nothing the
 * fold sees, and the version's own comment says it moves only when the order or
 * the field list moves. `GOLDEN` does not re-pin because one key inside it renames with its
 * type, `drawn.drops` to `drawn.powerUps`, holding its value: that is a field
 * rename on the `Digest` interface and not a re-pin, so ADR 0019's regeneration
 * ritual does not apply.
 */
const READINGS_VERSION = 4;

export { READINGS_VERSION };
