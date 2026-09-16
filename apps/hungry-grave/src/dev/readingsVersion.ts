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
 * Version 5: the two pushes read apart (design record R9, #126). `tuning.repel`
 * used to mean every shove on the run, because the bell was the only thing that
 * could throw one, and it now means the bell's shoves alone: `tolls`,
 * `totalShoves` and `totalDistance` keep their exact names, shapes and
 * reductions and count bell shoves only, and `belchShoves` and `belchDistance`
 * are a new arm beside them. **So every step 4 batch is incomparable with every
 * post-belch batch by name**: subtracting one build's `totalShoves` from the
 * other's would be arithmetic across a definition that changed underneath it
 * the moment a second pusher existed, which is exactly the case version 3 was
 * written to make loud. That is accepted eyes open on ruling R9, which chose a
 * belch that emits its own source over a repel reading widened to swallow both,
 * so the two pushes stay separable in every batch the tuning step reads.
 *
 * It also carries what the change made possible rather than what forced it.
 * `observeRepel` threw outright on a shove arriving with no toll window open,
 * which is exactly what the belch's first shove produces; the throw is kept for
 * a bell shove, where the case is still impossible, and the belch's arm holds
 * its own.
 *
 * **Four readings land in the same commit and none of them is what moves this.**
 * `tuning.refusals.food`, `.carriers` and `.offers` go in beside unchanged keys,
 * as does `tuning.repel`'s belch arm itself: every reading that existed before
 * still means what it meant, apart from the repel split above. The batch report
 * also gained a `directedAdds` field, which is not a reading at all. The split
 * is what moves the version.
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
 *
 * Version 6: a shove outlives the body carrying it (design record R10, #124).
 * **Three things change meaning at once and every one of them is an existing
 * reading, which is this file's own rule for when the version moves.**
 *
 * First, `tuning.repel.belchShoves` and `belchDistance` used to count what a
 * body was carried **before it died**, because the one report fired on the kill
 * path. A body killed in flight now hands its shove to the corpse the kill
 * leaves and the flight finishes, so a distance here is what a whole flight
 * covered. Second, **the bell is in exactly the same position**, which is easy
 * to miss because the sighting behind this move was a belch: `sweepToll`
 * (`src/game/lines/bell.ts`) pushes before it damages, so a body the cone kills
 * on arrival used to die holding a live impulse and report nothing, and now
 * flies the whole of the toll's push. So `tuning.repel.totalDistance` and each
 * toll's own `distance` move exactly the way `belchDistance` does, and they
 * move most at the top rungs, where the kill reaches most of the cone (round
 * two progress note section 10). Third, the belch's own record gains the
 * misses, which is what makes `shoved: 0` readable: `tuning.belchCadence`
 * gains `frameShares` and `misses` beside the fires it already carried, and
 * every `BelchFire` gains `inFrame` and its own `misses`.
 *
 * **So every batch recorded at slice J-fix's tip is incomparable with every
 * batch recorded after this, on both arms.** Subtracting one build's
 * `totalDistance` or `belchDistance` from the other's would be arithmetic
 * across a definition that changed underneath it, which is exactly the case
 * version 3 was written to make loud. It is taken eyes open.
 *
 * The other two versions hold and each for its own reason. `FORMAT_VERSION`
 * stays 4 because nothing new is recorded in a tape header and no sim event is
 * ever encoded into a tape at all: a replay rebuilds every event from the seed
 * and the commands, so the press's record costs no bytes. `WITNESS_VERSION`
 * moved to 9 in its own commit for the impulse a corpse now carries, which is
 * folded state and not a reading.
 */
const READINGS_VERSION = 6;

export { READINGS_VERSION };
