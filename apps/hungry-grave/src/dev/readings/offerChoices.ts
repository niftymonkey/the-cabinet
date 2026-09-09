// Every offer the run stood, and what the run did with each one.

import type { OfferSite, SimEvent } from '../../game/events';
import type { WeaponLine } from '../../game/lines/roster';

/**
 * One offer, and what the run did with it.
 *
 * The tick is the tick it opened on, so the rows read in the order the offers
 * stood rather than in the order they resolved.
 *
 * A slot of null is an offer that was never taken, which is a loss or an offer
 * still standing when the tape stopped. An offer nobody dived for and an offer
 * taken mean opposite things to an instrument, which is the same reason
 * offerLost is a separate event from carrierLost.
 */
interface OfferChoice {
  readonly tick: number;
  readonly site: OfferSite;
  // The taken body's place among the offer's bodies, left to right, or null when nothing was taken.
  readonly slot: number | null;
  readonly line: WeaponLine | null;
  // What went untaken: the take's own passed lines, and every option of a lost offer.
  readonly passed: readonly WeaponLine[];
}

/**
 * Take-by-slot split by site, and the count of offers banked while one stood.
 *
 * It reads the offer events' own site and slot rather than deriving either.
 * The slot could be found by remembering the live offer's options and indexing
 * the taken line into them, and the site could be guessed from the opening's y
 * against OFFER_ENTRY_DEPTH, but both derivations are sound only by accident:
 * the first works because a draw never repeats a line inside one offer, and
 * the second because no carrier dies above the field's top edge. The sim knows
 * both facts where they happen, so it records them.
 */
interface OfferChoices {
  readonly choices: readonly OfferChoice[];
  // Offers a carrier's death paid while one already stood (ADR 0034, decision 9).
  readonly bankedWhileStanding: number;
}

// One offer's row while the offer it belongs to is still live.
interface OpenChoice {
  readonly tick: number;
  readonly site: OfferSite;
  slot: number | null;
  line: WeaponLine | null;
  passed: readonly WeaponLine[];
}

interface OfferChoicesAcc {
  readonly choices: OpenChoice[];
  // The row the live offer is writing into, or null while no offer stands.
  live: OpenChoice | null;
  bankedWhileStanding: number;
}

const createOfferChoices = (): OfferChoicesAcc => ({
  choices: [],
  live: null,
  bankedWhileStanding: 0,
});

/**
 * The row an ending offer writes into. An offer that ends without one is the
 * sim announcing a take or a loss for an offer it never announced opening,
 * which is a bug in the event stream rather than a reading with a hole in it.
 */
const liveRow = (acc: OfferChoicesAcc, ending: string): OpenChoice => {
  if (acc.live === null) {
    throw new Error(`${ending} with no offer standing`);
  }
  return acc.live;
};

const openChoice = (
  acc: OfferChoicesAcc,
  tick: number,
  site: OfferSite,
): void => {
  const row: OpenChoice = { tick, site, slot: null, line: null, passed: [] };
  acc.choices.push(row);
  acc.live = row;
};

const takeChoice = (
  acc: OfferChoicesAcc,
  slot: number,
  line: WeaponLine,
  passed: readonly WeaponLine[],
): void => {
  const row = liveRow(acc, 'offerTaken');
  row.slot = slot;
  row.line = line;
  row.passed = [...passed];
  acc.live = null;
};

// Every option of a lost offer went untaken, so every one of them is passed.
const loseChoice = (
  acc: OfferChoicesAcc,
  options: readonly WeaponLine[],
): void => {
  const row = liveRow(acc, 'offerLost');
  row.passed = [...options];
  acc.live = null;
};

/**
 * One tick of offer events, in the order the sim emitted them.
 *
 * Whether a bank happened while an offer stood is read off the stream rather
 * than off the run: offerBanked is fired both by a carrier's death arriving on
 * a standing offer and by an offer whose every body the corpse cap refused,
 * and only the first is decision 9's corner. The live row tells them apart.
 */
const observeOfferChoices = (
  acc: OfferChoicesAcc,
  tick: number,
  events: readonly SimEvent[],
): void => {
  for (const event of events) {
    if (event.type === 'offerOpened') openChoice(acc, tick, event.site);
    if (event.type === 'offerBanked' && acc.live !== null) {
      acc.bankedWhileStanding += 1;
    }
    if (event.type === 'offerTaken') {
      takeChoice(acc, event.slot, event.line, event.passed);
    }
    if (event.type === 'offerLost') loseChoice(acc, event.options);
  }
};

const offerChoicesOf = (acc: OfferChoicesAcc): OfferChoices => ({
  choices: acc.choices.map((row) => ({
    tick: row.tick,
    site: row.site,
    slot: row.slot,
    line: row.line,
    passed: [...row.passed],
  })),
  bankedWhileStanding: acc.bankedWhileStanding,
});

export { createOfferChoices, observeOfferChoices, offerChoicesOf };
export type { OfferChoice, OfferChoices, OfferChoicesAcc };
