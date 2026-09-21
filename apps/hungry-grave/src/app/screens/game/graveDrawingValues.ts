/**
 * The drawing's own values for the grave in the ground: the projection's
 * constants, the prototype's named values its grave painters read, and the
 * values the fall is drawn with (design record R4 and R5, "Values are data").
 *
 * The grave's art is the prototype's (build 7, which Mark approved), ported
 * line for line in slice 6, so every value here carries the prototype's name
 * and number. Numbers the prototype writes inline in a painter stay inline in
 * the ported painter.
 */

import { PALETTE } from '../../palette';
import type { GraveView } from './graveProjection';

/**
 * The camera and the dark, in the grave's own half-lengths (the prototype's
 * build 7, which Mark played to his final values).
 *
 * The height and the setback are what the walls' shares of the opening come out
 * at: at this pair each side wall is about a seventh of the opening across and
 * the far wall about three tenths of it along, which is what an open grave looks
 * like from nearly overhead. The grave has no bottom, so `darkDepth` is where
 * the moon stops reaching the walls rather than where they end.
 */
const GRAVE_VIEW: GraveView = {
  cameraHeight: 4.95,
  cameraBehind: 1.07,
  darkDepth: 2.4,
  darkFalloff: 2.6,
};

/**
 * The cut face's layers, each starting a share of the way down to the dark.
 * Under the turf is a band of the shadow the overhang throws; below it the
 * subsoil pales once and then darkens the rest of the way (the prototype's
 * SOIL). Every colour is a palette row.
 */
const SOIL = [
  { at: 0, color: PALETTE.graveSoilShadow },
  { at: 0.18, color: PALETTE.graveWall },
  { at: 0.52, color: PALETTE.graveSubsoil },
  { at: 0.78, color: PALETTE.graveSubsoilDark },
  { at: 1, color: PALETTE.graveSubsoilDeep },
] as const;

/**
 * How much moon each face of the cut keeps, as a wash laid over it: a pale one
 * where the number is positive and a dark one where it is negative. The moon
 * is off to the left, so the right wall catches it, the far wall takes it at a
 * glance, and the left wall is left in deeper shade (the prototype's
 * FACE_WASH).
 */
const FACE_WASH: Readonly<Record<'far' | 'right' | 'left', number>> = {
  far: -0.14,
  right: 0.2,
  left: -0.17,
};

// How many steps a layer boundary is traced in along one face (the prototype's FACE_STEPS).
const FACE_STEPS = 12;

/**
 * Where the ground gave way at the edge: a handful of short bites out of the
 * lip, each a few hundredths of the opening across, placed a share of the way
 * round the perimeter (the prototype's NOTCHES).
 */
const NOTCHES = [
  { at: 0.065, span: 0.012, bite: 1 },
  { at: 0.215, span: 0.007, bite: 0.55 },
  { at: 0.31, span: 0.01, bite: 0.8 },
  { at: 0.425, span: 0.006, bite: 0.45 },
  { at: 0.552, span: 0.011, bite: 0.7 },
  { at: 0.705, span: 0.013, bite: 1 },
  { at: 0.82, span: 0.006, bite: 0.5 },
  { at: 0.905, span: 0.009, bite: 0.75 },
] as const;

/**
 * The two places round the rim where the bare margin swells, rather than noise
 * all the way round, which reads as a shadow (the prototype's TREAD).
 */
const TREAD = [
  { at: 0.3, span: 0.05 },
  { at: 0.79, span: 0.04 },
] as const;

/**
 * How far past the grave's own rectangle each baked layer's canvas reaches, as
 * a share of the opening's width: the pit's, and the lip's, which carries the
 * margin, the crumbs and the grass (the prototype's rebuildHole).
 */
const BAKE_PADDING = { pit: 0.12, lip: 0.3 } as const;

/**
 * The texture pixels a baked layer gets per field unit, as the view and the
 * device pixel ratio ask for them, held between these two (the prototype's
 * rebuildHole).
 */
const BAKE_PIXELS_PER_UNIT = { min: 1, max: 6 } as const;

/**
 * How far the grave's size has to move from the size last baked before the
 * hole is baked again, in field units (the prototype's stepWorld). A swallow
 * pays about a tenth of a unit, so the hole is baked about every fourth one.
 */
const HOLE_REBUILD_STEP = 0.4;

/**
 * How long the tip takes and how long the drop takes, in seconds (design record
 * R5, the prototype's build 7, which Mark played to his final values).
 *
 * They are seconds and never ticks, because what Mark tuned is how long the
 * fall reads for; a fall is counted in the run's own ticks so that pause, the
 * resume countdown and a replay all show the same fall, and the two are turned
 * into ticks in the one place that counts them.
 */
const FALL_TIP_SECONDS = 0.3;
const FALL_DROP_SECONDS = 0.75;

/** How far a body has swung over by the time the tip is finished, in radians. */
const FALL_TILT = 1.36;

/**
 * How far past the rim a body's middle has to be before the turn drops it in
 * rather than lifting it out, as a share of the body's own half extent.
 *
 * Food tips on a share of its area, so its middle can still sit a little
 * outside the edge when it goes. The tip slides it in by exactly the shortfall
 * and no further, because a body goes over the edge where it is and sliding it
 * to the middle of the hole is the read Mark rejected.
 */
const FALL_SLIP_SHARE = 0.6;

/**
 * How much of its ground speed a falling body loses each second, once the
 * ground under it has ended. It is what makes a body arrive rather than be
 * placed: the way it was pulled in with carries it on across the shaft and is
 * spent against the wall.
 */
const FALL_DRAG = 2.4;

/**
 * The smallest a body folds to on its way in, as a share of its own size. Food
 * longer than the opening folds to fit; the floor is there so that a body far
 * longer than the mouth still goes in as itself rather than as a speck.
 */
const FALL_FOLD_FLOOR = 0.3;

/**
 * The share of itself a piece of food must have over the mouth before it starts
 * to lean in (design record R5, the prototype's figure).
 *
 * The teeter is the tell for the swallow rule: without it a corpse lying 40%
 * across the mouth tells the player nothing and a sliver left out reads as a
 * missed swallow. It starts above zero so that food merely brushing the rim
 * stands still, and it runs to the run's own tip threshold, which is read off
 * the run and never from here.
 */
const TEETER_START = 0.12;

/**
 * How far a body leans toward the mouth at the threshold, in radians, and the
 * tremble it carries there: how far it shakes and how many times a second.
 *
 * The prototype leaned a body four ways at once (a nudge, a squash, a shake and
 * a darkening) on bodies 20 to 44 units long. A corpse here is 14 units, about
 * twenty-five pixels of a phone at the field's own scale, so the lean rides two
 * channels and both are opened up to survive that pixel grid: the prototype's
 * one-degree tremble moves a corner of this body by a fifth of a pixel. How it
 * reads in play is Mark's.
 */
const TEETER_TILT = 0.35;
const TEETER_SHAKE = { radians: 0.1, hertz: 4.5 } as const;

/**
 * How much of its own brightness a body keeps at the threshold. It multiplies
 * into the freshness tint rather than replacing it, so a body about to go in is
 * still a body about to rot.
 */
const TEETER_DARKEN = 0.8;

/**
 * How long the Undertaker's end runs, in seconds, counted on the frame clock
 * because the run's tick has stopped (design record R6).
 *
 * It is the first prototype's figure for the whole ending. Whether it is the
 * right length is a play question and the reason it is one row.
 */
const ENDING_SCENE_SECONDS = 2.8;

/**
 * What share of the scene each of its four beats takes: the grave hauls him to
 * the rim, he digs in at the edge, he turns over it, and he goes down (design
 * record R6). They sum to one.
 *
 * The tip and the fall are the shared fall's own lengths read as shares of the
 * scene, so a body falls here at the rate a swallowed corpse falls: at this
 * length 0.11 is FALL_TIP_SECONDS and 0.27 is FALL_DROP_SECONDS, each within a
 * tick. Moving the scene's length alone changes that rate, which is a thing to
 * see in play rather than a thing to hold by arithmetic.
 *
 * The dark takes him before the fall beat is spent, because the shared fall
 * carries a body into the dark partway down and keeps dropping it after: at
 * these shares that is measured at 0.29 seconds of held field at the size
 * ceiling and 0.56 at the floor. It is kept rather than trimmed because the
 * rate is the thing worth holding, and because a held field is the beat
 * between the grave closing over him and the end screen.
 */
const ENDING_BEATS = {
  drag: 0.52,
  claw: 0.1,
  tip: 0.11,
  fall: 0.27,
} as const;

/**
 * The power the drag's ease-in runs at: the grave takes up the slack and then
 * hauls. A drag at a steady speed reads as a man walking into a hole, which is
 * the read this ending exists to avoid.
 */
const ENDING_DRAG_EASE = 2;

/**
 * The furrows his hands leave in the ground behind him: how many, how far
 * apart they sit across the way he is dragged as a share of his own width, how
 * wide each one draws in field units, and how much of the soil shadow they
 * carry.
 *
 * They wear graveSoilShadow, which against the stand-in ground tile draws
 * lighter rather than darker: measured on a phone at device scale 3, a furrow
 * reads 31,37,50 over a ground of 17,22,31. Turned earth catching the moon is
 * the read, and it is the one that survives a ground this dark; a darker
 * furrow is what the trodden margin already tried, and it vanishes.
 */
const ENDING_FURROWS = {
  lines: 4,
  spread: 0.62,
  width: 3,
  alpha: 0.75,
  /**
   * How a furrow wanders off the straight line, in widths, walked end to end.
   * One profile for all of them, each starting at its own place in it, so four
   * hands scrape four different marks without a random stream a replay would
   * have to reproduce.
   */
  wander: [0, 0.7, -0.5, 1, -0.8, 0.4, -0.2, 0.6],
} as const;

/**
 * The field under the scene, frozen and out of the way: the share of the scene
 * by which the shots in the air have gone, the share by which the mobs have
 * finished dimming, and how much of itself a dimmed mob keeps.
 *
 * The shots go first and fast, which is what the genre does on a boss's death.
 * The mobs stay where they were, because the field freezing is the tell that
 * the run is over.
 */
const ENDING_FIELD_FADE = {
  shotsGoneBy: 0.15,
  mobsDimBy: 0.25,
  mobsKeep: 0.35,
} as const;

export {
  BAKE_PADDING,
  BAKE_PIXELS_PER_UNIT,
  ENDING_BEATS,
  ENDING_DRAG_EASE,
  ENDING_FIELD_FADE,
  ENDING_FURROWS,
  ENDING_SCENE_SECONDS,
  FACE_STEPS,
  FACE_WASH,
  FALL_DRAG,
  FALL_DROP_SECONDS,
  FALL_FOLD_FLOOR,
  FALL_SLIP_SHARE,
  FALL_TILT,
  FALL_TIP_SECONDS,
  GRAVE_VIEW,
  HOLE_REBUILD_STEP,
  NOTCHES,
  SOIL,
  TEETER_DARKEN,
  TEETER_SHAKE,
  TEETER_START,
  TEETER_TILT,
  TREAD,
};
