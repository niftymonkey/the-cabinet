import type { Boss } from './bosses/phases';
import type { Press } from './belch';
import type { Corpse } from './corpses';
import { createCorpsePool } from './corpses';
import type { DirectorState } from './director';
import { STARTING_DIRECTOR, startingSignal } from './director';
import type { Grave } from './grave';
import { createGrave } from './grave';
import type { BellToll } from './lines/bell';
import { BELL_PERIOD } from './lines/bell';
import type { WeaponLine } from './lines/roster';
import { BIRTHRIGHT, BIRTHRIGHT_LEVEL, WEAPON_LINES } from './lines/roster';
import type { Patch } from './lines/territory';
import { createTerritoryPool, TERRITORY_PERIOD } from './lines/territory';
import type { Skull } from './lines/skullStream';
import { createSkullPool, STREAM_INTERVAL } from './lines/skullStream';
import type { Wisp } from './lines/wisps';
import { createWispPool } from './lines/wisps';
import type { Shot } from './mobFire';
import { createShotPool } from './mobFire';
import type { Mob } from './mobs';
import { createMobPool } from './mobs';
import type { Offer } from './offer';
import type { Stream, StreamName } from './rng';
import { stream, STREAM_SALTS } from './rng';
import type { SignalLock } from './signalLock';
import { SIGNAL_RAN_LIVE } from './signalLock';
import type { SetPiece } from './stage/setPiece';
import type { StageState } from './stage/stage';
import { createStage, openingDirector } from './stage/stage';
import { SIZE_START } from './tuning';

// How a run finishes. Null while it is live.
type RunEnding = 'sealed' | 'victory';

/**
 * The weapon lines' own clocks and phases, as one record rather than six fields
 * scattered across the run.
 *
 * The grouping buys readability and not leak safety: RunState is built fresh by
 * createRun on every run, so nothing in here can survive a pooled screen. What
 * it does buy is that the stream's clock, the orbit's phase and the bell's ring
 * read as one subsystem's state, and that createRun initializes them in one
 * place a reader can check at a glance.
 */
interface LineState {
  // Ticks to the next stream volley.
  streamIn: number;
  // Surged volleys still owed. A swallow lengthens a running surge toward its
  // cap rather than starting a second beside it (ADR 0058 as amended).
  surgeVolleys: number;
  // Ticks to the next toll.
  tollIn: number;
  // The one live ring, or null between tolls.
  ring: BellToll | null;
  // Ticks to the next Territory lay. Held at zero while nothing is eligible.
  layIn: number;
  /**
   * Ticks until the wisps may fire again (ADR 0058 as amended). It starts at
   * zero and not at the interval, because the other three clocks are always-on
   * timers and the wisps fire on a swallow: a run's first swallow fires at
   * once, and it is the volley itself that arms the floor.
   */
  volleyIn: number;
}

/**
 * What the caps turned away on one tick (ADR 0056). Every count is of something
 * that never reached the field, so none of them describes anything a player can
 * see: they are the harness's input and nothing else reads them.
 */
interface Refusals {
  // Food a full corpse pool could not take: a corpse, a feast or an offer body.
  food: number;
  // Carrying placements the mob cap turned away, which is supply the player never met (ADR 0048).
  carriers: number;
  // Offers that could stand no body at all and banked instead (ADR 0034).
  offers: number;
}

/**
 * What a run starts from: the five facts a rig states under a name, a tape's
 * header records and createRun takes beside the seed (ADR 0063).
 *
 * Every field is required, because this is the resolved record and not what a
 * caller asked for. A rig row that left one implicit would be a rig half
 * applied, which is the defect #107 was raised for, and a recorded absence
 * would let a later tune of a default silently change what an old tape replays
 * as (ADR 0027). Resolving an absence is createRun's job and never a caller's,
 * which is why its own parameter takes a Partial of this and the record itself
 * holds none.
 */
interface StartingConditions {
  /**
   * The size the run began at, which is the size the grave took: ADR 0003's
   * floor and ceiling are grave.ts's to hold, so a size outside them reads here
   * as the bound it was clamped to rather than as the figure that was asked
   * for. ?size= used to write run.grave.size from src/app, which left the sim's
   * own hard bounds defended by a URL parser; with the size in this record,
   * hitGrave is the only thing outside grave.ts that changes size at all.
   */
  readonly startingSize: number;
  /**
   * The levels the run began at, defaulting to the birthright. The run copies
   * them rather than aliasing them, because the rules mutate its own levels in
   * place as it levels up: ?levels= pins them, and a tape's header rebuilds a
   * pinned run from the resolved record it carries (ADR 0027).
   */
  readonly startingLevels: Readonly<Record<WeaponLine, number>>;
  /**
   * The weapon lines the run fields, defaulting to the whole pool, which is
   * every run today. It is here because a replay fields the roster its tape
   * recorded (ADR 0046) and not the one the reading build happens to compile,
   * and it is copied for the same reason the levels are: the caller's list is
   * the caller's.
   */
  readonly roster: readonly WeaponLine[];
  /**
   * The figure the run holds its pressure signal at, or SIGNAL_RAN_LIVE. It is
   * here on exactly the terms the size and the levels are: ?signal= pins it,
   * the default is the resolved value that means the signal ran live, and a
   * tape's header rebuilds a held run from the figure it carries (ADR 0027),
   * which is what makes a locked run replay locked.
   */
  readonly signalLock: SignalLock;
  /**
   * The score the run begins holding, which exists for the harness's staged
   * floor ladder: the rigs' ladder row (src/dev/rigs.ts) and the walk that
   * plays it (src/dev/floorLadderWalk.ts) are its callers, and no player-facing
   * caller names it. No tape header carries a score at this tip, so a run
   * staged with one replays from zero.
   */
  readonly startingScore: number;
}

/**
 * The run's identity and everything the rules mutate as it plays (tracer plan
 * section 3).
 *
 * Scroll distance is deliberately absent: it is tick * SCROLL_SPEED exactly, so
 * it is derived where it is read. That is one less field in the digest and one
 * less thing that can drift out of step with the tick.
 */
interface RunState {
  // The seed this run was rolled or pinned with (ADR 0012).
  readonly seed: number;
  /**
   * What this run started from, resolved once at createRun and never written
   * again (ADR 0063). It is the run's identity in the same way the seed is: a
   * rig is this record under a name, and a header reads the condition off the
   * run rather than reassembling it from live state.
   */
  readonly conditions: StartingConditions;
  /**
   * The weapon lines this run is fielding, resolved once at createRun from the
   * pool the build holds (ADR 0046). It is the run's identity in the same way
   * the seed is: the rules read it and never write it, and the tape header
   * records it so a replay fields the roster the run played rather than the
   * roster the reading build happens to compile.
   */
  readonly roster: readonly WeaponLine[];
  // A run's length is counted in ticks, never wall clock.
  tick: number;
  readonly grave: Grave;
  score: number;
  // Belch charge, filled by swallows and capped (ADR 0008).
  reservoir: number;
  readonly levels: Record<WeaponLine, number>;
  /**
   * The one offer standing on the field, or null between offers (ADR 0034).
   * Exactly one is live at a time, so this is a field and never a pool.
   */
  offer: Offer | null;
  // Carriers killed under a live offer, waiting their turn (ADR 0034).
  bankedOffers: number;
  ending: RunEnding | null;
  /**
   * The live streams, held here rather than made on demand, each exposing its
   * own draw cursor. Without the cursor in the digest, a divergence in how many
   * draws a tick made is invisible to the one test built to catch divergence,
   * and 3b's ?seed= replay cannot resume mid-run without it.
   */
  readonly streams: Readonly<Record<StreamName, Stream>>;
  /**
   * The field's entities, every one of them a fixed-capacity pool
   * pre-allocated here and mutated in place. This is the reason step mutates
   * rather than returning new state: at storm density, pooled entities mutated
   * in place are the right answer.
   */
  readonly mobs: Mob[];
  readonly mobFire: Shot[];
  readonly corpses: Corpse[];
  readonly skulls: Skull[];
  readonly wisps: Wisp[];
  readonly patches: Patch[];
  readonly stage: StageState;
  /**
   * The one boss on the field, or null between them (ADR 0007). A field and
   * never a pool: there is exactly one at a time, ever, and a pool of one is a
   * lie about the design.
   */
  boss: Boss | null;
  // The one set piece on the field, or null (ADR 0042). A field for the same reason.
  setPiece: SetPiece | null;
  /**
   * The one press the belch is carrying, or null between presses (ADR 0008).
   * A field and never a pool, exactly as the boss and the set piece are: one
   * press is live at a time and the newer one replaces it whole.
   *
   * It lives here so the witness folds it and a replay rebuilds it, which is
   * what makes the second and third shoves of a press reproducible from a tape
   * alone (ADR 0019).
   */
  press: Press | null;
  readonly lines: LineState;
  /**
   * What the director holds across the run (ADR 0047). It lives here so the
   * witness folds it and a replay rebuilds it, which is what makes a directed
   * add reproducible from a tape alone.
   *
   * The slot is written and never the record: every field of DirectorState is
   * readonly and the whole record is replaced, exactly as the boss's and the
   * offer's are.
   */
  director: DirectorState;
  /**
   * What a cap refused on this tick, cleared at the top of every one and read
   * by the invariant harness at the end of it (ADR 0056).
   *
   * A refusal is a fact about a tick rather than about the state it leaves
   * behind: the body a kill could not put down is not in any pool, and the slot
   * that was taken when it was refused can be free again by the time the tick
   * ends. Nothing in the rules reads it; it exists so that a cap binding is
   * loud rather than silent.
   */
  readonly refusals: Refusals;
  /**
   * The next entity id, only ever increasing. It is not cosmetic: the cap
   * policy has to be totally ordered to be deterministic, and a test that says
   * "this corpse, not that one" needs a handle a recycled slot index cannot
   * give it.
   */
  nextEntityId: number;
}

/**
 * One past the largest seed a roll can produce, the top of a 31-bit range.
 * Exported so ?seed= can accept exactly the seeds the roll itself could have
 * produced (ADR 0012).
 */
const SEED_LIMIT = 0x7fffffff;

/**
 * The one place chance enters a run. Everything after this reads the seeded
 * streams, so a run's identity is decided once and then replays (ADR 0012).
 *
 * The roll itself is not deterministic and does not need to be. What is
 * deterministic is the run, which only ever sees the seed the roll produced.
 * The roll lives in the sim rather than in a screen because a run's identity is
 * the sim's (ADR 0012), so this is the sim's one documented way past the rule
 * that otherwise keeps Math.random out of src/game.
 */
const rollSeed = (): number => {
  // eslint-disable-next-line no-restricted-properties -- the carve-out above
  return Math.floor(Math.random() * SEED_LIMIT);
};

// Every line's clock at the top of a run, in one place.
const startingLines = (): LineState => {
  return {
    streamIn: STREAM_INTERVAL,
    surgeVolleys: 0,
    tollIn: BELL_PERIOD,
    ring: null,
    layIn: TERRITORY_PERIOD,
    volleyIn: 0,
  };
};

/**
 * The levels a run starts with: the birthright lines this run fields at one,
 * every other line unowned.
 *
 * A birthright line outside the run's roster is not fielded at all, so it
 * starts unowned rather than at one: the roster decides what a run has and the
 * birthright decides which of those it is born holding (ADR 0046).
 */
const birthrightLevels = (
  roster: readonly WeaponLine[] = WEAPON_LINES,
): Record<WeaponLine, number> => {
  const levels: Record<WeaponLine, number> = {
    skullStream: 0,
    territory: 0,
    wisps: 0,
    bell: 0,
  };
  for (const line of BIRTHRIGHT) {
    if (roster.includes(line)) levels[line] = BIRTHRIGHT_LEVEL;
  }
  return levels;
};

/**
 * Every line at one level, which is the loadout pin's shape: the
 * pin exists so a measurement's dense, levelled moment is reproducible, and
 * per-line syntax buys nothing that needs.
 */
const uniformLevels = (level: number): Record<WeaponLine, number> => {
  return { skullStream: level, territory: level, wisps: level, bell: level };
};

/**
 * Whether these are the birthright levels, the ones a run is born with when
 * nothing pins them. A caller that treats a pinned run differently gates on
 * this rather than re-deriving the birthright for itself.
 */
const isBirthrightLevels = (
  levels: Readonly<Record<WeaponLine, number>>,
): boolean => {
  const birthright = birthrightLevels();
  return WEAPON_LINES.every((line) => levels[line] === birthright[line]);
};

/**
 * The conditions a run starts from, every absence resolved to the value the run
 * would have started from anyway (ADR 0027).
 *
 * The roster resolves first because the birthright is drawn from it: a
 * birthright line outside the run's roster is not fielded at all (ADR 0046).
 * The roster and the levels are copied here rather than aliased, because the
 * caller's list is the caller's and the rules mutate the run's own levels as it
 * plays. ADR 0003's size bounds are not held here: they are grave.ts's, and
 * createRun reads back the size the grave took.
 */
const resolveConditions = (
  asked: Partial<StartingConditions> = {},
): StartingConditions => {
  const roster = [...(asked.roster ?? WEAPON_LINES)];
  return {
    startingSize: asked.startingSize ?? SIZE_START,
    startingLevels: { ...(asked.startingLevels ?? birthrightLevels(roster)) },
    roster,
    signalLock: asked.signalLock ?? SIGNAL_RAN_LIVE,
    startingScore: asked.startingScore ?? 0,
  };
};

/**
 * Starts a run: with no seed it rolls one, and with a seed it pins the run to
 * that seed and replays it (ADR 0012). The roll lives here rather than in a
 * screen so a run's identity is the sim's, and so ?seed= has one place to
 * plug into.
 *
 * The seed stays first and stays positional because it is the run's identity in
 * a way none of the rest is. Everything else a run starts from is one record
 * beside it (ADR 0063), optional as a whole and optional field by field, so
 * createRun(seed) is a fresh run and no caller ever counts arguments or pads a
 * list with undefined to reach the last one. Each field's own reason for
 * existing is on StartingConditions above, beside the field it explains.
 */
const createRun = (
  seed: number = rollSeed(),
  conditions?: Partial<StartingConditions>,
): RunState => {
  const asked = resolveConditions(conditions);
  const grave = createGrave(asked.startingSize);
  return {
    seed,
    // The size the grave took and never the one asked for: the bounds are
    // grave.ts's (ADR 0003), so what the record says is what the run started
    // from (ADR 0027).
    conditions: { ...asked, startingSize: grave.size },
    // The run and its record share the one copy, because neither writes it.
    roster: asked.roster,
    tick: 0,
    grave,
    score: asked.startingScore,
    reservoir: 0,
    levels: { ...asked.startingLevels },
    offer: null,
    bankedOffers: 0,
    ending: null,
    streams: {
      spawns: stream(seed, STREAM_SALTS.spawns),
      powerUps: stream(seed, STREAM_SALTS.powerUps),
      mobFire: stream(seed, STREAM_SALTS.mobFire),
      shed: stream(seed, STREAM_SALTS.shed),
      territory: stream(seed, STREAM_SALTS.territory),
      director: stream(seed, STREAM_SALTS.director),
      bossFire: stream(seed, STREAM_SALTS.bossFire),
      pour: stream(seed, STREAM_SALTS.pour),
    },
    mobs: createMobPool(),
    mobFire: createShotPool(),
    corpses: createCorpsePool(),
    skulls: createSkullPool(),
    wisps: createWispPool(),
    patches: createTerritoryPool(),
    stage: createStage(),
    boss: null,
    setPiece: null,
    press: null,
    lines: startingLines(),
    // The opening section's grant, made here because a run begins already
    // inside that section and no crossing grants it (stage.ts's
    // openingDirector).
    director: openingDirector({
      ...STARTING_DIRECTOR,
      signal: startingSignal(asked.signalLock),
    }),
    refusals: { food: 0, carriers: 0, offers: 0 },
    nextEntityId: 1,
  };
};

/**
 * The tick's refusal ledger, emptied. The tick that follows fills it and the
 * harness reads it at the end of that tick, so a refusal is reported against
 * the tick it happened on and never against the one after.
 */
const clearRefusals = (state: RunState): void => {
  state.refusals.food = 0;
  state.refusals.carriers = 0;
  state.refusals.offers = 0;
};

export {
  birthrightLevels,
  uniformLevels,
  isBirthrightLevels,
  createRun,
  clearRefusals,
  SEED_LIMIT,
};
export type { RunEnding, LineState, Refusals, RunState, StartingConditions };
