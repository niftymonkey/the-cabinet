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
 */
const READINGS_VERSION = 2;

export { READINGS_VERSION };
