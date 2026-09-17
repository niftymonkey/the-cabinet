/**
 * Size is health (ADR 0003): swallowing grows the grave, hits shrink it, and
 * sealed shut is death.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { corpseHitbox, cullCorpses, POWER_UP_HALF_EXTENT } from '../corpses';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import {
  ageGrave,
  createGrave,
  graveHitbox,
  graveWidth,
  growGrave,
  hitGrave,
  moveGrave,
  SCORE_RUNG_REARM_SIZE,
} from '../grave';
import type { WeaponLine } from '../lines/roster';
import { BIRTHRIGHT, MAX_LEVEL, WEAPON_LINES } from '../lines/roster';
import { OFFER_SPACING } from '../offer';
import { overlaps } from '../overlap';
import { createRun } from '../run';
import {
  BASE_SPEED,
  freshnessScale,
  GRAVE_ASPECT,
  HIT_SHRINK,
  INVULNERABLE_TICKS,
  SCORE_BLEED_CAP,
  SIZE_CEILING,
  SIZE_FLOOR,
  SIZE_START,
  TRASH_CORPSE_PAYOUT,
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
    run.score = SCORE_BLEED_CAP * 2;
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;

    // Rung one bleeds a capped slice of the score and touches no weapon level.
    // The rung is exactly one rung whatever it paid, which is why the amount is
    // bounded and the order is not (ADR 0003 as amended 2026-09-16).
    const bled = hitGrave(run, 'contact');
    expect(kinds(bled)).toContain('scoreBled');
    expect(kinds(bled)).not.toContain('weaponStripped');
    expect(kinds(bled)).not.toContain('sealed');
    expect(run.score).toBe(SCORE_BLEED_CAP);
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
    // is what stops a great run dying more slowly than a poor one. It holds
    // whatever the score too, and a score many times the cap is what says so:
    // the rung is spent once per arming whatever it paid, so a bounded bleed
    // never buys a second hit's worth of ladder.
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    run.score = SCORE_BLEED_CAP * 100;
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
  it('strips back to exactly the loadout a fresh run started with (ADR 0045)', () => {
    // ADR 0045: "ADR 0003's floor ladder strips back to that same list, so
    // start state and floor state keep one shared rule." Read as the two states
    // agreeing rather than as either one's contents, so the thinning of the
    // birthright cannot pull them apart without failing here.
    const fresh = createRun(1);
    const startingLevels = { ...fresh.levels };

    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;

    let hits = 0;
    while (run.ending === null && hits < 20) {
      hitGrave(run, 'contact');
      ageOut(run);
      hits += 1;
    }

    expect(run.ending).toBe('sealed');
    expect(run.levels).toEqual(startingLevels);
  });

  it('leaves a stripped player firing one line and nothing else (ADR 0045)', () => {
    // The cost taken eyes-open: a stripped player at the size floor is firing
    // one column of skulls, with no Territory patches and no wisps.
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;

    let hits = 0;
    while (run.ending === null && hits < 20) {
      hitGrave(run, 'contact');
      ageOut(run);
      hits += 1;
    }

    const owned = WEAPON_LINES.filter((line) => run.levels[line] > 0);
    expect(owned).toEqual(['skullStream']);
    expect(run.levels.skullStream).toBe(1);
  });

  it('a hit at the size floor with more score standing than the cap bleeds the cap and the rest stays (ADR 0003 as amended)', () => {
    // Mark's ruling of 2026-09-16, "Cap the bleed": the ladder still spends the
    // score rung before it spends a level, and the amount alone is bounded, so
    // a run keeps most of what it earned and goes on earning. The event carries
    // what was taken and what was left, which is what the readout counts from.
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    run.score = SCORE_BLEED_CAP * 3;
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;

    const events = hitGrave(run, 'contact');
    const bled = events.find((event) => event.type === 'scoreBled');

    expect(kinds(events)).not.toContain('weaponStripped');
    expect(bled).toEqual({
      type: 'scoreBled',
      amount: SCORE_BLEED_CAP,
      score: SCORE_BLEED_CAP * 2,
    });
    expect(run.score).toBe(SCORE_BLEED_CAP * 2);
    for (const line of WEAPON_LINES) expect(run.levels[line]).toBe(MAX_LEVEL);
  });

  it('a hit at the size floor with less score standing than the cap bleeds all of it (ADR 0003 as amended)', () => {
    // The lesser of the two, so the one case that does not change is the small
    // score: it is taken whole and the remainder is zero, which is the floor
    // every shipped flat subtraction has without writing a second rule down.
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    run.score = SCORE_BLEED_CAP / 2;
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;

    const events = hitGrave(run, 'contact');
    const bled = events.find((event) => event.type === 'scoreBled');

    expect(kinds(events)).not.toContain('weaponStripped');
    expect(bled).toEqual({
      type: 'scoreBled',
      amount: SCORE_BLEED_CAP / 2,
      score: 0,
    });
    expect(run.score).toBe(0);
    for (const line of WEAPON_LINES) expect(run.levels[line]).toBe(MAX_LEVEL);
  });

  it('a run can end sealed shut while still holding what the bleed left (ADR 0003 as amended)', () => {
    // The whole point of the ruling: the ladder runs to its end and the number
    // the run is judged on survives it. The score is never touched again after
    // the rung is spent, so what stands at the seal is what the cap left.
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    run.score = SCORE_BLEED_CAP * 4;
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;

    let hits = 0;
    while (run.ending === null && hits < 20) {
      hitGrave(run, 'contact');
      ageOut(run);
      hits += 1;
    }

    expect(run.ending).toBe('sealed');
    expect(run.score).toBe(SCORE_BLEED_CAP * 3);
  });

  it('a second floor hit while still at the floor strips a level rather than bleeding the score again (design record R4)', () => {
    // R4: a rung the next kill re-armed would be a floor the storm paid for, so
    // the rung the ladder bled stays bled until the grave grows. A capped bleed
    // spends it exactly as a whole one did, which is the half the amount cannot
    // be allowed to move: a remainder left standing is not a rung left armed.
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    run.score = SCORE_BLEED_CAP * 3;
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;

    hitGrave(run, 'contact');
    expect(run.score).toBe(SCORE_BLEED_CAP * 2);
    ageOut(run);
    const second = hitGrave(run, 'contact');

    expect(kinds(second)).toContain('weaponStripped');
    expect(kinds(second)).not.toContain('scoreBled');
    // The score keeps accruing while the rung is bled: what is withheld is the
    // rung, never the number.
    expect(run.score).toBe(SCORE_BLEED_CAP * 2);
    for (const line of WEAPON_LINES)
      expect(run.levels[line]).toBe(MAX_LEVEL - 1);
  });

  it('a third floor hit while still at the floor strips again, because the memory is not a one-shot (design record R4)', () => {
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    run.score = 250;
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;

    hitGrave(run, 'contact');
    ageOut(run);
    hitGrave(run, 'contact');
    run.score = 800;
    ageOut(run);
    const third = hitGrave(run, 'contact');

    expect(kinds(third)).toContain('weaponStripped');
    expect(kinds(third)).not.toContain('scoreBled');
    expect(run.score).toBe(800);
    for (const line of WEAPON_LINES)
      expect(run.levels[line]).toBe(MAX_LEVEL - 2);
  });

  it('a floor hit that finds no score leaves the rung bled too, so score arriving after it does not buy the cushion back (design record R4)', () => {
    // Any ladder run spends the rung, the one that finds nothing included.
    // Otherwise a hit that stripped would leave the rung re-armable by the next
    // kill, which is the same hole one rung down.
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    run.score = 0;
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;

    const first = hitGrave(run, 'contact');
    expect(kinds(first)).toContain('weaponStripped');

    run.score = 400;
    ageOut(run);
    const second = hitGrave(run, 'contact');

    expect(kinds(second)).toContain('weaponStripped');
    expect(kinds(second)).not.toContain('scoreBled');
    expect(run.score).toBe(400);
  });

  it("growth of a full hit's worth off the floor re-arms the score rung (design record R4)", () => {
    // Growing is the player's own act, which is the whole of why it is what
    // gives the rung back. The threshold is read off the rule rather than
    // written down here.
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    run.score = 250;
    hitGrave(run, 'contact');
    expect(run.score).toBe(0);

    growGrave(run.grave, SCORE_RUNG_REARM_SIZE - run.grave.size);
    expect(run.grave.size).toBe(SCORE_RUNG_REARM_SIZE);

    // Back at the floor with score standing, the rung absorbs the hit again.
    run.grave.size = SIZE_FLOOR;
    run.score = 250;
    ageOut(run);
    const after = hitGrave(run, 'contact');

    expect(kinds(after)).toContain('scoreBled');
    expect(kinds(after)).not.toContain('weaponStripped');
    expect(run.score).toBe(0);
  });

  it('a crumb of growth does not re-arm the score rung (design record R4)', () => {
    // A fully stale trash corpse is the crumb the threshold exists to refuse: a
    // rung given back at any growth at all would be bought back invisibly
    // inside the mow.
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    run.score = 250;
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;
    hitGrave(run, 'contact');

    const crumb = TRASH_CORPSE_PAYOUT * freshnessScale(0);
    expect(SIZE_FLOOR + crumb).toBeLessThan(SCORE_RUNG_REARM_SIZE);
    growGrave(run.grave, crumb);

    // Back at the floor, exactly as the re-arming test puts it back, so the
    // only thing that differs between the two is how much was grown.
    run.grave.size = SIZE_FLOOR;
    run.score = 250;
    ageOut(run);
    const after = hitGrave(run, 'contact');

    expect(kinds(after)).toContain('weaponStripped');
    expect(kinds(after)).not.toContain('scoreBled');
    expect(run.score).toBe(250);
  });

  it('size never leaves floor-to-ceiling across any sequence of grows and hits (ADR 0003)', () => {
    const run = createRun(1);
    const amounts = [0.4, 12, 0, 60, 3, 0.1];
    for (let i = 0; i < 120; i++) {
      if (i % 3 === 0) {
        hitGrave(run, 'contact');
      } else {
        const amount = amounts[i % amounts.length];
        if (amount === undefined) throw new Error(`no amount at tick ${i}`);
        growGrave(run.grave, amount);
      }
      ageGrave(run.grave);
      expect(run.grave.size).toBeGreaterThanOrEqual(SIZE_FLOOR);
      expect(run.grave.size).toBeLessThanOrEqual(SIZE_CEILING);
    }
  });
});

/**
 * The floor ladder's second rung on the field (ADR 0055, decision 24, design
 * record R6): a hit at the floor with nothing left to bleed drops one body per
 * rung it took, and the dive can catch one of them.
 */
describe('the rungs a floor hit drops onto the field (ADR 0055)', () => {
  /** A run standing at the size floor with its score already bled, so the next hit strips. */
  function atTheFloorWithNoScore(levels: number): ReturnType<typeof createRun> {
    const run = createRun(1);
    run.grave.size = SIZE_FLOOR;
    run.grave.scoreRungBled = true;
    run.score = 0;
    for (const line of WEAPON_LINES) run.levels[line] = levels;
    return run;
  }

  const fallenRungs = (run: ReturnType<typeof createRun>) =>
    run.corpses.filter(
      (corpse) => corpse.alive && corpse.kind === 'fallenRung',
    );

  it('takes one level off every line that has one to give and drops exactly that many bodies', () => {
    const run = atTheFloorWithNoScore(3);
    const events = hitGrave(run, 'contact');

    const stripped = events.find((event) => event.type === 'weaponStripped');
    expect(stripped?.lines).toEqual([...run.roster]);
    for (const line of WEAPON_LINES) expect(run.levels[line]).toBe(2);

    const bodies = fallenRungs(run);
    expect(bodies).toHaveLength(run.roster.length);
    expect(
      events.filter((event) => event.type === 'rungFell').map((e) => e.line),
    ).toEqual([...run.roster]);
  });

  it('drops one body for each line that had a rung and none for the lines that did not', () => {
    // The strip's own rule, unchanged: every line that has one to give, in the
    // same tick. A birthright line at its floor gives nothing, so nothing falls
    // for it.
    const run = atTheFloorWithNoScore(0);
    run.levels.skullStream = 1;
    run.levels.bell = 2;

    hitGrave(run, 'contact');

    expect(fallenRungs(run).map((body) => body.line)).toEqual(['bell']);
  });

  it("stands the bodies apart at the offer's own spacing, in roster order, centred on the grave's x", () => {
    // The loss is the mirror of the gain (design record R6): the same spacing
    // the offer lays three bodies at, so one dive cannot catch all four.
    const run = atTheFloorWithNoScore(3);
    run.grave.x = FIELD_WIDTH / 2;

    hitGrave(run, 'contact');

    const bodies = fallenRungs(run);
    expect(bodies.map((body) => body.line)).toEqual([...run.roster]);
    const xs = bodies.map((body) => body.x);
    for (let index = 1; index < xs.length; index += 1) {
      expect(xs[index]! - xs[index - 1]!).toBeCloseTo(OFFER_SPACING, 9);
    }
    const middle = (xs[0]! + xs[xs.length - 1]!) / 2;
    expect(middle).toBeCloseTo(run.grave.x, 9);
  });

  it('shifts the whole group inward at an edge, so the gap between bodies never changes', () => {
    // Clamping each body on its own would stack two rungs on one x at exactly
    // the edge a pinned player takes the hit against, which deletes the choice
    // of which line to save.
    const run = atTheFloorWithNoScore(3);
    run.grave.x = 0;

    hitGrave(run, 'contact');

    const xs = fallenRungs(run).map((body) => body.x);
    expect(xs).toHaveLength(run.roster.length);
    for (let index = 1; index < xs.length; index += 1) {
      expect(xs[index]! - xs[index - 1]!).toBeCloseTo(OFFER_SPACING, 9);
    }
    for (const x of xs) {
      expect(x - POWER_UP_HALF_EXTENT).toBeGreaterThanOrEqual(0);
      expect(x + POWER_UP_HALF_EXTENT).toBeLessThanOrEqual(FIELD_WIDTH);
    }
  });

  it('spawns below the grave and clear of its own swallow box at the size floor', () => {
    // The design gate's finding: a body landing inside the swallow box hands
    // the rung straight back on the tick it was lost and makes the whole loss a
    // flicker.
    const run = atTheFloorWithNoScore(3);

    hitGrave(run, 'contact');

    const box = graveHitbox(run.grave);
    const bodies = fallenRungs(run);
    expect(bodies).toHaveLength(run.roster.length);
    for (const body of bodies) {
      // On y rather than through the box alone, because a body standing in a
      // lane the narrow grave does not cover would clear the box while sitting
      // level with it, and what is ruled is that it falls below the grave.
      expect(body.y - body.halfExtent).toBeGreaterThan(
        run.grave.y + run.grave.size,
      );
      expect(overlaps(corpseHitbox(body), box)).toBe(false);
    }
  });

  it('is still clear of the swallow box after a tick of the grave diving at full speed', () => {
    // The transferable half of Sonic's no-recollect window, as geometry rather
    // than as a clock: the loss registers before the chase can connect.
    const run = atTheFloorWithNoScore(3);
    run.grave.y = FIELD_HEIGHT / 2;

    hitGrave(run, 'contact');
    moveGrave(run.grave, { x: 0, y: 1 });

    const box = graveHitbox(run.grave);
    const bodies = fallenRungs(run);
    expect(bodies).toHaveLength(run.roster.length);
    for (const body of bodies) {
      // The drop's own derivation makes the two edges meet exactly here, and
      // overlap.ts's half-open convention is what says a touch is not a
      // swallow. On any real tick the scroll has carried the body further away
      // as well, so the clearance is strict in play.
      expect(body.y - body.halfExtent).toBeGreaterThanOrEqual(
        run.grave.y + run.grave.size,
      );
      expect(overlaps(corpseHitbox(body), box)).toBe(false);
    }
  });

  it("spawns in the run's own roster order and never the build's", () => {
    // The line a fifth weapon would break: WEAPON_LINES is the build's four and
    // the roster is what this run was born with (ADR 0046, design record R3).
    const roster: WeaponLine[] = ['bell', 'skullStream', 'wisps'];
    const run = createRun(1, SIZE_FLOOR, undefined, roster);
    run.grave.scoreRungBled = true;
    run.score = 0;
    for (const line of roster) run.levels[line] = 3;

    hitGrave(run, 'contact');

    expect(fallenRungs(run).map((body) => body.line)).toEqual(roster);
    expect(fallenRungs(run).map((body) => body.line)).not.toEqual(
      WEAPON_LINES.filter((line) => roster.includes(line)),
    );
  });

  /** The drop the placement uses, read off an ordinary strip rather than imported. */
  function dropOffset(): number {
    const run = atTheFloorWithNoScore(3);
    run.grave.y = FIELD_HEIGHT / 2;
    hitGrave(run, 'contact');
    const body = fallenRungs(run)[0];
    if (body === undefined) throw new Error('no body fell');
    return body.y - run.grave.y;
  }

  /** A run standing at the bottom clamp, where nothing fits below the grave. */
  function atTheBottomClamp(): ReturnType<typeof createRun> {
    const run = atTheFloorWithNoScore(3);
    run.grave.y = FIELD_HEIGHT;
    moveGrave(run.grave, { x: 0, y: 0 });
    return run;
  }

  it('drops the bodies above the grave at the bottom clamp, where every one stands inside the field', () => {
    // Mark's ask is a lost level the player can see fall and dive to catch, and
    // a rung that never appears cannot be dived for. So with no room below, the
    // same offset is mirrored upfield (orchestrator, 2026-09-16, under design
    // record R6). It replaces the test that pinned those rungs as lost on the
    // tick they fell.
    const run = atTheBottomClamp();

    hitGrave(run, 'contact');

    const standing = fallenRungs(run);
    expect(standing).toHaveLength(run.roster.length);
    for (const body of standing) {
      expect(body.y).toBeLessThan(run.grave.y);
      expect(body.y - body.halfExtent).toBeGreaterThanOrEqual(0);
      expect(body.y + body.halfExtent).toBeLessThanOrEqual(FIELD_HEIGHT);
    }
    expect(cullCorpses(run)).toHaveLength(0);
  });

  it("mirrors the drop upfield only once a body's own extent no longer fits below the grave", () => {
    // The switch is the body's own extent reaching the field's bottom edge and
    // not the grave's position, because a body dropped half off the field is a
    // rung the player cannot read as catchable either.
    const drop = dropOffset();
    const lastWithRoom = FIELD_HEIGHT - drop - POWER_UP_HALF_EXTENT;

    const roomy = atTheFloorWithNoScore(3);
    roomy.grave.y = lastWithRoom;
    hitGrave(roomy, 'contact');
    for (const body of fallenRungs(roomy)) {
      expect(body.y).toBeCloseTo(lastWithRoom + drop, 9);
      expect(body.y + body.halfExtent).toBeLessThanOrEqual(FIELD_HEIGHT);
    }

    const tight = atTheFloorWithNoScore(3);
    tight.grave.y = lastWithRoom + 0.5;
    hitGrave(tight, 'contact');
    for (const body of fallenRungs(tight)) {
      expect(body.y).toBeCloseTo(lastWithRoom + 0.5 - drop, 9);
    }
  });

  it("stands an upfield rung clear of the grave's own swallow box on the tick it falls", () => {
    // The design gate's finding holds on the upfield side too: a body landing
    // inside the swallow box hands the rung straight back on the tick it was
    // lost. The scroll then carries it down toward the grave, which is the
    // window the player can re-catch it in rather than a hand-back.
    const run = atTheBottomClamp();

    hitGrave(run, 'contact');

    const box = graveHitbox(run.grave);
    const bodies = fallenRungs(run);
    expect(bodies).toHaveLength(run.roster.length);
    for (const body of bodies) {
      expect(body.y + body.halfExtent).toBeLessThan(
        run.grave.y - run.grave.size,
      );
      expect(overlaps(corpseHitbox(body), box)).toBe(false);
    }
  });

  it("spreads an upfield drop at the offer's own spacing and centres it exactly as a downfield one", () => {
    // One rule read on two axes: which side of the grave the group stands on
    // changes nothing about the spread, so the choice of which line to save is
    // the same choice wherever the hit landed.
    const run = atTheBottomClamp();

    hitGrave(run, 'contact');

    const bodies = fallenRungs(run);
    expect(bodies.map((body) => body.line)).toEqual([...run.roster]);
    const xs = bodies.map((body) => body.x);
    for (let index = 1; index < xs.length; index += 1) {
      expect(xs[index]! - xs[index - 1]!).toBeCloseTo(OFFER_SPACING, 9);
    }
    expect((xs[0]! + xs[xs.length - 1]!) / 2).toBeCloseTo(run.grave.x, 9);
    expect(new Set(bodies.map((body) => body.y)).size).toBe(1);
  });
});
