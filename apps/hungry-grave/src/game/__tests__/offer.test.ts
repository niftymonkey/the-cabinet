/**
 * The offer of three and the bank (ADR 0034), and the carrier that pays for it
 * (ADR 0002). Expected values come from the ADRs and from the step 1 dispatch
 * plan's sections 6 and 8, never from running the module.
 */

import { describe, expect, it } from 'vitest';

import { stepping } from '../../dev/stepping';

import { DROP_HALF_EXTENT, spawnDrop } from '../corpses';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import { graveWidth } from '../grave';
import { checkInvariants, createStageWatch } from '../invariants';
import type { WeaponLine } from '../lines/roster';
import { BIRTHRIGHT, MAX_LEVEL, WEAPON_LINES } from '../lines/roster';
import { spawnMob } from '../mobs';
import {
  chooseOfferBody,
  loseOffer,
  offerableLines,
  openBankedOffer,
  openOffer,
  OFFER_ENTRY_DEPTH,
  OFFER_SIZE,
  OFFER_SPACING,
} from '../offer';
import type { RunState } from '../run';
import { createRun, uniformLevels } from '../run';
import { PROCESSION_ROWS } from '../stage/rows';
import { PHASES } from '../stage/stage';
import { SIZE_CEILING } from '../tuning';

const STILL = { move: { x: 0, y: 0 }, belch: false } as const;

/**
 * A run whose stage will not spawn anything on top of the mob under test, and
 * whose one birthright line is held silent, so every kill in these tests is a
 * kill the test made.
 */
function quietRun(seed = 7): RunState {
  const run = createRun(seed);
  run.stage.firedRows = PROCESSION_ROWS.length;
  run.lines.streamIn = Number.MAX_SAFE_INTEGER;
  return run;
}

/** A mob standing under a skull, so the storm kills it inside the tick. */
function doomed(state: RunState, x: number, y: number, carries: boolean) {
  const mob = spawnMob(
    state,
    'shambler',
    { x, y, vx: 0, vy: 0, index: 0 },
    carries,
  )!;
  mob.beat = 0;
  mob.hp = 1;
  const skull = state.skulls.find((each) => !each.alive)!;
  skull.alive = true;
  skull.id = state.nextEntityId;
  state.nextEntityId += 1;
  skull.x = x;
  skull.y = y;
  skull.vx = 0;
  skull.vy = 0;
  return mob;
}

function typesOf(events: readonly { type: string }[]): string[] {
  return events.map((event) => event.type);
}

/** Every body of the live offer that is still on the field. */
function offerBodies(state: RunState) {
  const ids = state.offer?.bodyIds ?? [];
  return state.corpses.filter(
    (corpse) => corpse.alive && ids.includes(corpse.id),
  );
}

describe('a carrier is the only thing that pays power (ADR 0002)', () => {
  it('is the only thing that ever puts an offer on the field', () => {
    // ADR 0002: "Power is metered by carriers: specific authored mobs carry
    // the offer, and killing one drops it where it died."
    const state = quietRun();
    const step = stepping(state);
    doomed(state, 200, 100, false);
    const carrier = doomed(state, 300, 100, true);

    const events = step(STILL);

    expect(typesOf(events).filter((type) => type === 'mobKilled')).toHaveLength(
      2,
    );
    const opened = events.filter((event) => event.type === 'offerOpened');
    expect(opened).toHaveLength(1);
    expect({ x: opened[0].x, y: opened[0].y }).toEqual({
      x: carrier.x,
      y: carrier.y,
    });
  });

  it('pays no drop at all for a hundred trash kills with no carrier among them', () => {
    // ADR 0002 keeps every other job kills had: "corpses are fuel, growth and
    // belch charge come from swallowing, score is kills, and killing buys room
    // to live", with power taken out of that list. A hundred kills is more
    // than twice what the retired price table charged for its first ten drops.
    const state = quietRun();
    const step = stepping(state);
    let killed = 0;
    const paid: string[] = [];

    for (let kill = 0; kill < 100; kill++) {
      doomed(state, 200, 100, false);
      const events = step(STILL);
      killed += typesOf(events).filter((type) => type === 'mobKilled').length;
      paid.push(
        ...typesOf(events).filter(
          (type) => type === 'dropSpawned' || type === 'offerOpened',
        ),
      );
    }

    expect(killed).toBe(100);
    expect(paid).toEqual([]);
    // The jobs kills keep are still done: every one of them left fuel on the
    // field. Score is not asserted here because the tree pays it from
    // overflow alone, which no kill in this test reaches.
    expect(
      state.corpses.filter((corpse) => corpse.alive).length,
    ).toBeGreaterThan(0);
  });
});

describe('a drop is an offer of three (ADR 0034)', () => {
  it('spawns three option bodies side by side and apart from each other', () => {
    // ADR 0034: "three option bodies falling side by side and apart from each
    // other." Side by side is one y for all three, apart is a gap wider than
    // the bodies themselves.
    const state = quietRun();
    const events = openOffer(state, 260, 180);

    const spawned = events.filter((event) => event.type === 'dropSpawned');
    expect(spawned).toHaveLength(OFFER_SIZE);
    expect(new Set(spawned.map((event) => event.y)).size).toBe(1);
    const xs = spawned.map((event) => event.x).sort((a, b) => a - b);
    for (let index = 1; index < xs.length; index++) {
      expect(xs[index] - xs[index - 1]).toBeGreaterThan(2 * DROP_HALF_EXTENT);
    }
  });

  it('lays the middle body on the death point and the outer two a spacing either side', () => {
    const state = quietRun();
    openOffer(state, 260, 180);

    expect(offerBodies(state).map((body) => `${body.x} ${body.y}`)).toEqual([
      `${260 - OFFER_SPACING} 180`,
      '260 180',
      `${260 + OFFER_SPACING} 180`,
    ]);
  });

  it('holds a group opening near a field edge inside the field, spacing intact', () => {
    // The whole group shifts rather than each body clamping on its own:
    // clamping each would stack two bodies on one x, which deletes the choice
    // at exactly the moment the player is pinned against an edge.
    const state = quietRun();
    openOffer(state, 4, 180);

    const xs = offerBodies(state).map((body) => body.x);
    for (const x of xs) {
      expect(x - DROP_HALF_EXTENT).toBeGreaterThanOrEqual(0);
      expect(x + DROP_HALF_EXTENT).toBeLessThanOrEqual(FIELD_WIDTH);
    }
    expect(xs[1] - xs[0]).toBe(OFFER_SPACING);
    expect(xs[2] - xs[1]).toBe(OFFER_SPACING);
  });

  it('lays the options in draw order, so one seed lays the same three in the same places', () => {
    const laid = (seed: number): string[] => {
      const state = quietRun(seed);
      openOffer(state, 260, 180);
      return offerBodies(state).map((body) => `${body.x} ${body.line}`);
    };
    expect(laid(19)).toEqual(laid(19));
    // And the order on the field really is the offer's own order, so a reader
    // joining an option to a body by index is reading the field it sees.
    const state = quietRun(19);
    openOffer(state, 260, 180);
    expect(offerBodies(state).map((body) => body.line)).toEqual([
      ...state.offer!.options,
    ]);
  });

  it('holds the skull stream and two unowned lines in the first offer of a run', () => {
    // ADR 0034: "The first offer of a run is fixed in shape, the skull stream
    // and two unowned lines", so deepening the main gun and opening something
    // new are both on the table from the first swallow. Asserted over many
    // seeds, because what is fixed is the shape and not which two.
    for (let seed = 1; seed <= 40; seed++) {
      const state = quietRun(seed);
      openOffer(state, 260, 180);
      const options = state.offer!.options;
      expect(options).toHaveLength(OFFER_SIZE);
      for (const line of BIRTHRIGHT) expect(options).toContain(line);
      const rest = options.filter((line) => !BIRTHRIGHT.includes(line));
      for (const line of rest) expect(state.levels[line]).toBe(0);
    }
  });

  it('fills the first offer of a part-built run, which has no unowned line to draw', () => {
    // The shape is a preference and never a demand. A pinned run can start
    // with its birthright maxed and every other line part way up, and an offer
    // that insisted on unowned lines there came back empty and handed the
    // carrier a body carrying nothing while three lines still had rungs left.
    const state = quietRun();
    state.levels[BIRTHRIGHT[0]] = MAX_LEVEL;
    for (const line of WEAPON_LINES) {
      if (!BIRTHRIGHT.includes(line)) state.levels[line] = 2;
    }

    openOffer(state, 260, 180);

    expect(state.offer!.options).toHaveLength(OFFER_SIZE);
    expect(state.offer!.options).not.toContain(BIRTHRIGHT[0]);
    expect(new Set(state.offer!.options).size).toBe(OFFER_SIZE);
  });

  it('stops holding that fixed shape from the second offer on', () => {
    // The proof that the fixed shape is the first offer's alone: over enough
    // seeds a later offer leaves the birthright out, which the fixed shape
    // never does.
    const withoutBirthright: number[] = [];
    for (let seed = 1; seed <= 40; seed++) {
      const state = quietRun(seed);
      openOffer(state, 260, 180);
      state.offer = null;
      openOffer(state, 260, 180);
      const options = state.offer!.options;
      if (!BIRTHRIGHT.every((line) => options.includes(line))) {
        withoutBirthright.push(seed);
      }
    }
    expect(withoutBirthright.length).toBeGreaterThan(0);
  });
});

describe('what an offer may hold (ADR 0034)', () => {
  it('draws its options from unowned lines and level-ups of owned, un-maxed lines', () => {
    // ADR 0034: "options draw from the lines still unowned plus level-ups of
    // owned, un-maxed lines." Both halves have to turn up, so the assertion is
    // over the set every seed reaches rather than over one offer.
    const owned: WeaponLine[] = [];
    const unowned: WeaponLine[] = [];
    for (let seed = 1; seed <= 60; seed++) {
      const state = quietRun(seed);
      // One line pushed off the floor and one line left at zero, so an offer
      // can only be drawn from a pool holding both kinds.
      state.levels[WEAPON_LINES[1]] = 2;
      state.streams.drops.next();
      openOffer(state, 260, 180);
      for (const line of state.offer!.options) {
        (state.levels[line] > 0 ? owned : unowned).push(line);
      }
    }
    expect(owned.length).toBeGreaterThan(0);
    expect(unowned.length).toBeGreaterThan(0);
  });

  it('never offers a maxed line', () => {
    // ADR 0034: "a maxed line is never offered."
    for (let seed = 1; seed <= 60; seed++) {
      const state = quietRun(seed);
      state.levels[WEAPON_LINES[0]] = MAX_LEVEL;
      state.streams.drops.next();
      openOffer(state, 260, 180);
      expect(state.offer!.options).not.toContain(WEAPON_LINES[0]);
    }
  });

  it('shrinks below three as lines max', () => {
    // ADR 0034: "The offer shrinks below three as lines max."
    const state = quietRun();
    for (const line of WEAPON_LINES.slice(0, 2)) state.levels[line] = MAX_LEVEL;
    openOffer(state, 260, 180);

    expect(state.offer!.options).toHaveLength(WEAPON_LINES.length - 2);
    expect(offerBodies(state)).toHaveLength(WEAPON_LINES.length - 2);
  });

  it('offers nothing when every line in the roster is maxed', () => {
    const state = createRun(7, undefined, uniformLevels(MAX_LEVEL));
    expect(offerableLines(state)).toEqual([]);
  });

  it('never offers a line outside the run roster', () => {
    // ADR 0046: a run fields a roster drawn from a growing pool, and the offer
    // reads that roster rather than the pool the build compiles.
    const roster = [
      ...BIRTHRIGHT,
      WEAPON_LINES.find((line) => !BIRTHRIGHT.includes(line))!,
    ];
    const state = createRun(7, undefined, undefined, roster);
    expect(offerableLines(state)).toEqual(roster);
    for (let seed = 1; seed <= 20; seed++) {
      const run = createRun(seed, undefined, undefined, roster);
      run.streams.drops.next();
      openOffer(run, 260, 180);
      for (const line of run.offer!.options) expect(roster).toContain(line);
    }
  });
});

describe('the take (ADR 0034)', () => {
  it('gives the grave the one body it passes under and vanishes the other two', () => {
    // ADR 0034: "the grave gets exactly the one it passes under, the other two
    // vanishing." The offer is laid on the grave's own centre, so the middle
    // body is the one it is under and the outer two are a spacing either side.
    const state = quietRun();
    const step = stepping(state);
    openOffer(state, state.grave.x, state.grave.y);
    const options = [...state.offer!.options];
    const before = state.levels[options[1]];

    const events = step(STILL);

    const taken = events.find((event) => event.type === 'offerTaken')!;
    expect(taken.line).toBe(options[1]);
    expect([...taken.passed]).toEqual([options[0], options[2]]);
    expect(state.levels[options[1]]).toBe(before + 1);
    expect(state.corpses.filter((corpse) => corpse.alive)).toEqual([]);
  });

  it('takes exactly one when the grave covers two, and the other vanishes on the same tick', () => {
    // The two-touch case is possible only at the size ceiling, which is what
    // the spacing is derived to give. The tie-break is the body whose centre is
    // nearest the grave's, so the grave stands nearer the right body of the
    // pair than the middle one: a rule that only ever took the first body in
    // pool order would take the middle and pass this by luck.
    const state = quietRun();
    state.grave.size = SIZE_CEILING;
    const step = stepping(state);
    openOffer(state, state.grave.x - 47, state.grave.y);
    const options = [...state.offer!.options];
    const reach = graveWidth(SIZE_CEILING) / 2 + DROP_HALF_EXTENT;
    expect(reach).toBeGreaterThan(47);

    const events = step(STILL);

    const swallows = events.filter((event) => event.type === 'swallowed');
    expect(swallows).toHaveLength(1);
    const taken = events.find((event) => event.type === 'offerTaken')!;
    expect(taken.line).toBe(options[2]);
    expect([...taken.passed]).toEqual([options[0], options[1]]);
    expect(state.corpses.filter((corpse) => corpse.alive)).toEqual([]);
  });

  it('breaks a dead heat on the lower entity id', () => {
    // Deterministic, needs no draw of its own, and it is the reading a player
    // would give: the two bodies are exactly as far away, so the older one
    // goes in.
    const state = quietRun();
    state.grave.size = SIZE_CEILING;
    openOffer(state, state.grave.x - OFFER_SPACING / 2, state.grave.y);
    const bodies = offerBodies(state);
    const pair = [bodies[1], bodies[2]];
    expect(pair[0].id).toBeLessThan(pair[1].id);
    expect(state.grave.x - pair[0].x).toBe(pair[1].x - state.grave.x);

    expect(chooseOfferBody(state, pair)).toBe(pair[0]);
    expect(chooseOfferBody(state, [pair[1], pair[0]])).toBe(pair[0]);
  });

  it('leaves no offer live when the bank is empty', () => {
    const state = quietRun();
    const step = stepping(state);
    openOffer(state, state.grave.x, state.grave.y);
    expect(state.bankedOffers).toBe(0);

    step(STILL);

    expect(state.offer).toBeNull();
    expect(state.bankedOffers).toBe(0);
  });

  it('adds no command channel, because the take is a movement input', () => {
    // ADR 0034: "the take as a movement input already on the tape so replay
    // still runs from the seed plus inputs alone." A whole take happens under
    // a command that carries a move and a belch and nothing else.
    const state = quietRun();
    const step = stepping(state);
    openOffer(state, state.grave.x, state.grave.y);

    expect(Object.keys(STILL)).toEqual(['move', 'belch']);
    expect(typesOf(step(STILL))).toContain('offerTaken');
  });
});

describe('exactly one offer at a time, and the bank (ADR 0034)', () => {
  it('keeps exactly one offer live at a time', () => {
    // ADR 0034: "Exactly one offer is live at a time." Three carriers die on
    // three separate ticks and the field never holds more than one offer's
    // worth of option bodies.
    const state = quietRun();
    const step = stepping(state);
    const standing: number[] = [];
    for (let kill = 0; kill < 3; kill++) {
      doomed(state, 200 + kill * 40, 100, true);
      step(STILL);
      standing.push(
        state.corpses.filter((corpse) => corpse.alive && corpse.kind === 'drop')
          .length,
      );
    }
    expect(standing).toEqual([OFFER_SIZE, OFFER_SIZE, OFFER_SIZE]);
    expect(state.offer!.bodyIds).toHaveLength(OFFER_SIZE);
  });

  it('banks a carrier killed while an offer stands', () => {
    // ADR 0034: "A second drop paid while an offer stands banks toward the
    // next one."
    const state = quietRun();
    openOffer(state, 260, 180);
    const bodies = offerBodies(state).map((body) => body.id);

    const events = openOffer(state, 100, 100);

    expect(typesOf(events)).toEqual(['offerBanked']);
    expect(state.bankedOffers).toBe(1);
    expect(offerBodies(state).map((body) => body.id)).toEqual(bodies);
  });

  it('reports the bank on the live offer', () => {
    // ADR 0034: "the bank shows on the live offer so a burst of paying kills
    // still reads as paid." The banked event carries the running count, and
    // the next offer opens saying what still waits behind it.
    const state = quietRun();
    openOffer(state, 260, 180);
    const first = openOffer(state, 100, 100);
    const second = openOffer(state, 100, 100);

    expect(first).toEqual([{ type: 'offerBanked', banked: 1 }]);
    expect(second).toEqual([{ type: 'offerBanked', banked: 2 }]);

    state.offer = null;
    const opened = loseOffer(state).find(
      (event) => event.type === 'offerOpened',
    );
    expect(opened).toBeUndefined();
  });

  it('opens a banked offer once the live one resolves, and the bank falls by one', () => {
    const state = quietRun();
    const step = stepping(state);
    openOffer(state, state.grave.x, state.grave.y);
    openOffer(state, 100, 100);
    expect(state.bankedOffers).toBe(1);

    const events = step(STILL);

    expect(typesOf(events)).toContain('offerTaken');
    const opened = events.find((event) => event.type === 'offerOpened')!;
    expect(state.bankedOffers).toBe(0);
    expect(opened.banked).toBe(0);
    // A banked offer enters the field the way a wave does, at the grave's own
    // x and one body depth above the top edge.
    expect(opened.y).toBe(-OFFER_ENTRY_DEPTH);
    expect(opened.x).toBe(state.grave.x);
    expect(state.offer!.bodyIds).toHaveLength(OFFER_SIZE);
  });

  it('reports an offer whose bodies all scrolled off as lost once, not three times', () => {
    const state = quietRun();
    const step = stepping(state);
    openOffer(state, state.grave.x, FIELD_HEIGHT - 5);
    const options = [...state.offer!.options];

    const seen: string[] = [];
    for (let tick = 0; tick < 120; tick++) seen.push(...typesOf(step(STILL)));

    expect(seen.filter((type) => type === 'corpseLost')).toHaveLength(
      OFFER_SIZE,
    );
    const lost = seen.filter((type) => type === 'offerLost');
    expect(lost).toHaveLength(1);
    expect(state.offer).toBeNull();
    // Nothing reaches after the player to make it up: the options are gone and
    // no level came of them.
    for (const line of options) {
      expect(state.levels[line]).toBe(createRun(7).levels[line]);
    }
  });

  it('opens the banked offer when the live one scrolls off untaken', () => {
    const state = quietRun();
    const step = stepping(state);
    openOffer(state, state.grave.x, FIELD_HEIGHT - 5);
    openOffer(state, 100, 100);

    const seen: string[] = [];
    for (let tick = 0; tick < 120; tick++) seen.push(...typesOf(step(STILL)));

    expect(seen.filter((type) => type === 'offerLost')).toHaveLength(1);
    expect(seen.filter((type) => type === 'offerOpened')).toHaveLength(1);
    expect(state.bankedOffers).toBe(0);
    expect(state.offer).not.toBeNull();
  });

  it('opens a banked offer on the first permitting tick, and holds it through a phase that permits none', () => {
    // The bank's own opening site, which is neither a take nor a loss. Without
    // it a bank held shut through a phase that does not permit an offer would
    // never reopen once that phase ended: there would be no offer left to take
    // or to lose, so the site and the phase's own column arrive together.
    //
    // ADR 0048's "missed is missed" still holds through it, because the bank
    // only ever holds offers a carrier's death already paid.
    const state = quietRun();
    state.bankedOffers = 2;

    const withheld = openBankedOffer(state, false);

    expect(withheld).toEqual([]);
    expect(state.offer).toBeNull();
    expect(state.bankedOffers).toBe(2);

    const opened = openBankedOffer(state, true);

    expect(typesOf(opened)).toContain('offerOpened');
    expect(state.offer!.bodyIds).toHaveLength(OFFER_SIZE);
    expect(state.bankedOffers).toBe(1);

    // One at a time: the second stays banked while the first still stands, and
    // the permission alone does not open it.
    expect(openBankedOffer(state, true)).toEqual([]);
    expect(state.bankedOffers).toBe(1);
  });

  it('opens nothing from an empty bank, however permitting the phase is', () => {
    const state = quietRun();

    expect(openBankedOffer(state, true)).toEqual([]);
    expect(state.offer).toBeNull();
    expect(state.bankedOffers).toBe(0);
  });

  it('banks an offer whose every body the corpse cap refused, and opens it once there is room', () => {
    // Supply must not vanish at a cap. An offer whose three bodies are all
    // refused used to return no event, no fault and no bank increment, so a
    // carrier's whole payment disappeared with nothing said. ADR 0048's
    // "missed is missed" is about a carrier the player let past, never about
    // one the game could not put on the field.
    const state = quietRun();
    while (state.corpses.some((corpse) => !corpse.alive)) {
      // No line on the bodies: an option body standing for no live offer is
      // itself a fault, and what is under test here is the cap.
      spawnDrop(state, 10, 10);
    }

    const events = openOffer(state, 200, 100);

    expect(typesOf(events)).toEqual(['offerBanked']);
    expect(state.offer).toBeNull();
    expect(state.bankedOffers).toBe(1);
    const faults = checkInvariants(state, createStageWatch());
    const refusal = faults.find(
      (fault) => fault.identity === 'offer stands a body',
    );
    expect(refusal?.severity).toBe('recoverable');

    // And the bank's own tick hands it back the moment the pool has room, so
    // the payment is delayed rather than lost.
    for (const corpse of state.corpses) corpse.alive = false;
    const opened = openBankedOffer(state, true);
    expect(typesOf(opened)).toContain('offerOpened');
    expect(state.bankedOffers).toBe(0);
    expect(state.offer!.bodyIds).toHaveLength(OFFER_SIZE);
  });

  it('permits a banked offer to open in every phase but the one the run has ended in', () => {
    // The column is true by default and false only where the record names a
    // reason. The one reason the record names is the over phase: the run has
    // ended there, so there is no run left to spend an offer in.
    expect(
      PHASES.filter((phase) => !phase.bankOpens).map((phase) => phase.name),
    ).toEqual(['over']);
    for (const phase of PHASES) {
      expect(`${phase.name} ${typeof phase.bankOpens}`).toBe(
        `${phase.name} boolean`,
      );
    }
  });
});

describe('nothing offerable (ADR 0034)', () => {
  it('converts a maxed run carrier pay to a body that is never worthless', () => {
    // ADR 0034: "when nothing is offerable a paid drop converts to overflow,
    // keeping ADR 0002's nothing-swallowed-is-worthless promise." One body
    // carrying no option at all, which the grave still swallows for what it
    // is worth.
    const state = quietRun();
    for (const line of WEAPON_LINES) state.levels[line] = MAX_LEVEL;
    const step = stepping(state);
    doomed(state, state.grave.x, state.grave.y, true);

    const opening = step(STILL);
    const spawned = opening.filter((event) => event.type === 'dropSpawned');
    expect(typesOf(opening)).not.toContain('offerOpened');
    expect(spawned).toHaveLength(1);
    expect(spawned[0].line).toBeUndefined();
    expect(state.offer).toBeNull();

    const paid = step(STILL);
    const swallowed = paid.filter(
      (event) => event.type === 'swallowed' && event.kind === 'drop',
    );
    expect(swallowed).toHaveLength(1);
    expect(typesOf(paid)).not.toContain('weaponLeveled');
    expect(
      typesOf(paid).some((type) => type === 'grew' || type === 'overflowed'),
    ).toBe(true);
  });
});
