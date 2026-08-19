// Every number the slice runs on. One file so a retune is one diff.
//
// Unit contract: all lengths are logical field units on a fixed 540x760
// field, all speeds are field units per second. Nothing here is a device
// pixel; the renderer scales the whole field to whatever screen it gets.

export const FIELD_W = 540;
export const FIELD_H = 760;

// The scroll IS the corpse deadline: a mid-screen kill must reach the bottom
// edge as a dim, nearly empty scrap, so freshness seconds derive from scroll
// speed and any scroll retune retunes the meter with it (decision-log entry 2).
export const SCROLL_SPEED = 38;
export const FRESHNESS_SECONDS = FIELD_H / 2 / SCROLL_SPEED;
export const FRESHNESS_FLOOR = 0.25;
export const FRESHNESS_FLICKER_AT = 0.12;

// Tuned so crossing the field's width takes about two seconds.
export const PLAYER_SPEED = 270;
// Hold-to-focus speed, as a fraction of full speed (entry 8).
export const PLAYER_FOCUS_MULTIPLIER = 0.5;
// Ticket #33: relative-drag touch. The grave copies the finger's movement
// times this ratio (Danmaku Unlimited 3 style); cyclable in-game from the
// HUD chip so the right number can be felt on real hardware.
export const TOUCH_DRAG_RATIO = 1.5;
export const TOUCH_DRAG_RATIOS: readonly number[] = [1, 1.5, 2];
// Entry 12: the keyboard's designated speed is a player setting, tuned in
// steps with the - and = keys and persisted between runs.
export const KEY_SPEED_DEFAULT = 1;
export const KEY_SPEED_STEP = 0.05;
export const KEY_SPEED_MIN = 0.5;
export const KEY_SPEED_MAX = 1.5;

// The grave is a rounded rectangle hole, taller than wide (decision-log
// entry 6). One scalar is the size: the half-height; width derives from it.
export const GRAVE_ASPECT = 0.62;
export const GRAVE_CORNER_FRAC = 0.45;
export const GRAVE_START_HALF_H = 22;
export const GRAVE_MIN_HALF_H = 12;
// The hard ceiling: at 64 half-height the grave stands 128 units tall,
// roughly a quarter of the field's width. Growth past it becomes score.
export const GRAVE_MAX_HALF_H = 64;
export const OVERSIZE_SCORE_PER_UNIT = 25;
export const HIT_SHRINK = 3;
export const HIT_INVULN_SECONDS = 0.35;
export const CORPSE_GROWTH = 1.1;
export const FLOOR_SCORE_BLEED = 100;

export const ENEMY_RADIUS = 12;
export const ENEMY_HP = 3;
export const ENEMY_FALL_SPEED = 80;
// The field contests the dive (entry 10): fire reaches deep enough that
// eating under threat is the normal case, not a safe-lane exception.
export const ENEMY_FIRE_INTERVAL: [number, number] = [2.0, 4.0];
export const ENEMY_FIRE_MAX_Y = FIELD_H * 0.75;
export const ENEMY_BULLET_SPEED = 140;
export const ENEMY_BULLET_RADIUS = 5;

export const CORPSE_RADIUS = 9;
export const DROP_RADIUS = 9;
export const SCORE_PER_KILL = 10;

// Drop prices in kills on a rising curve, tuned with the authored wave rows so
// a full-clear run pays out ten to twelve drops (decision-log entry 5).
export const DROP_COSTS = [5, 7, 9, 11, 14, 18, 23, 29, 36, 44, 53, 63];
export const OVERFLOW_GROWTH = 2;
export const OVERFLOW_SCORE = 250;
export const OVERFLOW_BELCH_CHARGE = 30;

export const BELCH_CAP = 100;
export const BELCH_CHARGE_PER_CORPSE = 12;
export const BELCH_BOSS_DAMAGE = 40;

export const MAX_LINE_LEVEL = 5;
export const SOUL_DAMAGE = 1;
export const SOUL_SPEED = 430;
export const SOUL_INTERVAL = 0.21;
export const SOUL_SURGE_SECONDS = 1.5;
export const SOUL_SURGE_RATE = 1.8;
export const SOUL_FAN_DEGREES = 40;

export const STONE_DAMAGE_INTERVAL = 0.35;
export const STONE_DAMAGE = 2;
export const STONE_RADIUS = 8;
export const STONE_ORBIT_GAP = 26;
export const STONE_SPIN = 1.7;

export const WISP_DAMAGE = 2;
export const WISP_SPEED = 210;
export const WISP_TURN = 3.2;
export const WISP_LIFETIME = 4;
export const WISP_COUNT_BY_LEVEL = [1, 2, 4, 6, 8];

export const BELL_DAMAGE_BY_LEVEL = [1, 1, 2, 2, 3];
export const BELL_RADIUS_BY_LEVEL = [90, 160, 260, 400, 620];
export const BELL_PUSH_BY_LEVEL = [12, 26, 44, 66, 90];
export const BELL_SPEED = 420;

// Stage skeleton (phase-local seconds, decision-log entry 5). The printed
// clock marks are nominal intent; fight length varies per player.
export const RAMP_END = 110;
export const DRAIN_SECONDS = 10;
export const WALL_DELAY_AFTER_BANSHEE = 2;
// Phase-local: the nominal Banshee death is 2:30, the back half drains out at
// the 3:50 mark, so the Undertaker's drain starts 80 seconds in (entry 5.2).
export const BACKHALF_END = 80;

export const BANSHEE_CHUNK_HP = 60;
export const BANSHEE_RING_INTERVAL = 2.2;
export const BANSHEE_RING_BULLETS = 24;
export const BANSHEE_RING_GAP_DEGREES = 64;
export const BANSHEE_RING_SPEED = 74;
export const BANSHEE_FEAST_GROWTH = CORPSE_GROWTH * 9;
export const CHUNK_BREAK_FLASH = 1.2;
export const CHUNK_FEAST_GROWTH = CORPSE_GROWTH * 3;
export const CHUNK_FEAST_BELCH_CHARGE = 40;

export const UNDERTAKER_CHUNK_HP = 90;
export const CURTAIN_INTERVAL = 3.0;
export const CURTAIN_FALL_SPEED = 95;
export const CLOD_RADIUS = 7;
export const CLOD_SPACING = 26;
// The gap always fits: current grave width plus this margin (entry 4).
export const CURTAIN_GAP_MARGIN = 34;
export const SPIRAL_INTERVAL = 0.09;
export const SPIRAL_STEP = 0.38;
export const SPIRAL_BULLET_SPEED = 105;
export const DIGGER_INTERVAL = 4.0;
export const DIGGER_COUNT = 2;

export const BOSS_ENTER_SECONDS = 2.5;
export const VICTORY_TOPPLE_SECONDS = 2.8;

// Bottom-edge camping band for the off-bottom instrument.
export const BOTTOM_BAND = FIELD_H * 0.85;
