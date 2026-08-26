/**
 * Size is health (ADR 0003): swallowing grows the grave, hits shrink it, and
 * sealed shut is death.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import {
  ageGrave,
  createGrave,
  graveHitbox,
  graveWidth,
  growGrave,
  hitGrave,
  moveGrave,
} from '../grave';
import { BIRTHRIGHT, MAX_LEVEL, WEAPON_LINES } from '../lines/roster';
import { createRun } from '../run';
import {
  BASE_SPEED,
  GRAVE_ASPECT,
  HIT_SHRINK,
  INVULNERABLE_TICKS,
  SIZE_CEILING,
  SIZE_FLOOR,
  SIZE_START,
} from '../tuning';

/** Waits out the invulnerability window, so the next hit lands. */
function ageOut(run: ReturnType<typeof createRun>): void {
  for (let i = 0; i < INVULNERABLE_TICKS; i++) ageGrave(run.grave);
}

function kinds(events: { type: string }[]): string[] {
  return events.map((event) => event.type);
}

/** Every size the rules can produce, end to end. */
const SIZES = [
  SIZE_FLOOR,
  SIZE_START,
  (SIZE_START + SIZE_CEILING) / 2,
  SIZE_CEILING,
];

describe('a starting size the sim will not honour', () => {
  afterEach(() => vi.restoreAllMocks());

  it("a starting size outside ADR 0003's bounds is not silent", () => {
    // ?size= parses without clamping and a tape header carries whatever it was
    // written with, so both arrive here unchecked.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(createGrave(SIZE_CEILING + 100).size).toBe(SIZE_CEILING);

    const said = warn.mock.calls.map((call) => call.join(' '));
    expect(said).toHaveLength(1);
    // What happened, and what it costs.
    expect(said[0]).toContain(String(SIZE_CEILING + 100));
    expect(said[0]).toContain(String(SIZE_CEILING));
    expect(said[0]).toContain('starts at');
  });

  it('a size inside the bounds says nothing, and so does the default', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    createGrave();
    createGrave(SIZE_CEILING);
    createGrave(SIZE_FLOOR);

    expect(warn).not.toHaveBeenCalled();
  });
});

describe('the grave', () => {
  it('width derives from the one scalar at the fixed aspect, and the grave is taller than wide at every size (ADR 0003)', () => {
    for (const size of SIZES) {
      // Size is the half-height, so the standing height is twice it.
      expect(graveWidth(size)).toBe((size * 2) / GRAVE_ASPECT);
      expect(graveWidth(size)).toBeLessThan(size * 2);
    }
  });
  it('the hitbox shrinks with size, so a smaller grave is a harder target (ADR 0003)', () => {
    const grave = createGrave();
    grave.x = FIELD_WIDTH / 2;
    grave.y = FIELD_HEIGHT / 2;

    grave.size = SIZE_CEILING;
    const big = graveHitbox(grave);
    grave.size = SIZE_FLOOR;
    const small = graveHitbox(grave);

    expect(small.width).toBeLessThan(big.width);
    expect(small.height).toBeLessThan(big.height);
    // The hitbox is the grave, centred on it.
    for (const box of [big, small]) {
      expect(box.x + box.width / 2).toBe(grave.x);
      expect(box.y + box.height / 2).toBe(grave.y);
    }
  });
  it('a full move command moves exactly BASE_SPEED in one tick, and a diagonal is applied as given without normalizing (ADR 0011)', () => {
    const grave = createGrave();
    const from = { x: grave.x, y: grave.y };
    moveGrave(grave, { x: 1, y: 0 });
    expect(grave.x).toBe(from.x + BASE_SPEED);
    expect(grave.y).toBe(from.y);

    // ADR 0011 puts normalization and the diagonal cap in each input model, and
    // deliberately leaves touch uncapped: capping touch to keyboard feel WAS
    // the input lag felt on device. A cap here would silently undo that.
    const diagonal = createGrave();
    const start = { x: diagonal.x, y: diagonal.y };
    moveGrave(diagonal, { x: 1, y: -1 });
    expect(diagonal.x).toBe(start.x + BASE_SPEED);
    expect(diagonal.y).toBe(start.y - BASE_SPEED);

    const half = createGrave();
    const origin = { x: half.x, y: half.y };
    moveGrave(half, { x: 0.5, y: 0 });
    expect(half.x).toBe(origin.x + BASE_SPEED / 2);
  });
  it('the grave is held inside the field at every edge, accounting for its own width and height (ADR 0003)', () => {
    for (const size of SIZES) {
      for (const push of [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: 0, y: 1 },
      ]) {
        const grave = createGrave();
        grave.size = size;
        // Far more shoving than the field is wide or tall.
        for (let i = 0; i < 400; i++) moveGrave(grave, push);
        const box = graveHitbox(grave);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(FIELD_WIDTH);
        expect(box.y + box.height).toBeLessThanOrEqual(FIELD_HEIGHT);
      }
    }
  });
  it('growGrave grows by the amount given, below the ceiling (ADR 0003)', () => {
    const grave = createGrave();
    expect(growGrave(grave, 5)).toBe(0);
    expect(grave.size).toBe(SIZE_START + 5);
    expect(growGrave(grave, 2.5)).toBe(0);
    expect(grave.size).toBe(SIZE_START + 7.5);
  });
  it('growGrave past the ceiling stops at the ceiling and returns the remainder as overflow (ADR 0003)', () => {
    const grave = createGrave();
    const room = SIZE_CEILING - grave.size;
    expect(growGrave(grave, room + 4)).toBe(4);
    expect(grave.size).toBe(SIZE_CEILING);
    // At the ceiling every further crumb is overflow, and size never exceeds it.
    expect(growGrave(grave, 9)).toBe(9);
    expect(grave.size).toBe(SIZE_CEILING);
  });
  it('a hit above the floor shrinks the grave and starts invulnerability (ADR 0003)', () => {
    const run = createRun(1);
    expect(run.grave.size).toBe(SIZE_START);
    const events = hitGrave(run, 'contact');
    expect(run.grave.size).toBe(SIZE_START - HIT_SHRINK);
    expect(run.grave.invulnerable).toBe(INVULNERABLE_TICKS);
    expect(kinds(events)).toContain('graveHit');
  });
  it('a hit at the floor starts invulnerability too, so the ladder cannot run in consecutive ticks (WCAG SC 2.3.1)', () => {
    // Without this the ladder runs in consecutive ticks: sixty full-field dims
    // a second, in the exact state where the player is one hit from sealed
    // shut.
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    run.score = 10;
    const events = hitGrave(run, 'contact');
    expect(run.grave.size).toBe(SIZE_FLOOR);
    expect(run.grave.invulnerable).toBe(INVULNERABLE_TICKS);
    expect(kinds(events)).toContain('graveHit');
  });
  it('a hit while invulnerable does nothing at all: no shrink, no ladder, no event (ADR 0003)', () => {
    const run = createRun(1);
    run.score = 500;
    hitGrave(run, 'contact');
    const size = run.grave.size;
    const events = hitGrave(run, 'contact');
    expect(events).toEqual([]);
    expect(run.grave.size).toBe(size);
    expect(run.score).toBe(500);
    expect(run.grave.invulnerable).toBe(INVULNERABLE_TICKS);
  });
  it('ageGrave counts invulnerability down and stops at zero, and a hit lands again on the tick it reaches zero', () => {
    const run = createRun(1);
    hitGrave(run, 'contact');
    for (let i = INVULNERABLE_TICKS; i > 0; i--) {
      expect(run.grave.invulnerable).toBe(i);
      expect(hitGrave(run, 'contact')).toEqual([]);
      ageGrave(run.grave);
    }
    expect(run.grave.invulnerable).toBe(0);
    ageGrave(run.grave);
    expect(run.grave.invulnerable).toBe(0);
    expect(hitGrave(run, 'contact').length).toBeGreaterThan(0);
  });
  it('a hit never takes the grave below the floor (ADR 0003)', () => {
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR + HIT_SHRINK / 2;
    hitGrave(run, 'contact');
    expect(run.grave.size).toBe(SIZE_FLOOR);
  });
  it("at the floor the ladder runs in order, one rung per hit: score, then every line's level, then sealed shut (ADR 0003)", () => {
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    run.score = 250;
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;

    // Rung one bleeds all of the score and touches no weapon level. The whole
    // score, so that the score tier is exactly one rung.
    const bled = hitGrave(run, 'contact');
    expect(kinds(bled)).toContain('scoreBled');
    expect(kinds(bled)).not.toContain('weaponStripped');
    expect(kinds(bled)).not.toContain('sealed');
    expect(run.score).toBe(0);
    for (const line of WEAPON_LINES) expect(run.levels[line]).toBe(MAX_LEVEL);

    // Rung two takes one level off every line at once, and seals nothing.
    ageOut(run);
    const stripped = hitGrave(run, 'contact');
    expect(kinds(stripped)).toContain('weaponStripped');
    expect(kinds(stripped)).not.toContain('sealed');
    for (const line of WEAPON_LINES)
      expect(run.levels[line]).toBe(MAX_LEVEL - 1);
    expect(run.ending).toBeNull();

    // Rung three, with nothing left to bleed.
    for (const line of WEAPON_LINES) {
      run.levels[line] = BIRTHRIGHT.includes(line) ? 1 : 0;
    }
    ageOut(run);
    const sealed = hitGrave(run, 'contact');
    expect(kinds(sealed)).toContain('sealed');
    expect(run.ending).toBe('sealed');
  });
  it('the ladder is finite: from a maxed run at the floor holding score, at most 7 hits end in sealed shut (ADR 0003)', () => {
    // One hit for the score, five for the levels and one to seal. The bound
    // holds whatever the build, because taking a level off every line at once
    // is what stops a great run dying more slowly than a poor one.
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    run.score = 999;
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;

    let hits = 0;
    while (run.ending === null && hits < 20) {
      hitGrave(run, 'contact');
      ageOut(run);
      hits += 1;
    }
    expect(run.ending).toBe('sealed');
    expect(hits).toBe(7);
  });
  it('stripping stops at the birthright loadout exactly (glossary: birthright)', () => {
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;

    // Bounded at the sibling test's 20 hits so a ladder that never ends fails
    // the suite instead of hanging it, and the run's ending is what says the
    // loop stopped for the reason this test is about.
    let hits = 0;
    while (run.ending === null && hits < 20) {
      hitGrave(run, 'contact');
      ageOut(run);
      hits += 1;
      for (const line of WEAPON_LINES) {
        expect(run.levels[line]).toBeGreaterThanOrEqual(
          BIRTHRIGHT.includes(line) ? 1 : 0,
        );
      }
    }
    expect(run.ending).not.toBeNull();
    for (const line of WEAPON_LINES) {
      expect(run.levels[line]).toBe(BIRTHRIGHT.includes(line) ? 1 : 0);
    }
  });
  it('size never leaves floor-to-ceiling across any sequence of grows and hits (ADR 0003)', () => {
    const run = createRun(1);
    const amounts = [0.4, 12, 0, 60, 3, 0.1];
    for (let i = 0; i < 120; i++) {
      if (i % 3 === 0) {
        hitGrave(run, 'contact');
      } else {
        growGrave(run.grave, amounts[i % amounts.length]);
      }
      ageGrave(run.grave);
      expect(run.grave.size).toBeGreaterThanOrEqual(SIZE_FLOOR);
      expect(run.grave.size).toBeLessThanOrEqual(SIZE_CEILING);
    }
  });
});
