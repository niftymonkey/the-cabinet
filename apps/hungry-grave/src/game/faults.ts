// What a fault is and which identities one can carry: the closed vocabulary the
// invariant harness records against and a tape's third section hardens (ADR 0024).

/**
 * Every fault the invariant harness can record, as a closed append-only list
 * (ADR 0024).
 *
 * The identity is written down here rather than taken from whatever string a
 * check happens to carry, because a fault record goes into a tape's third
 * section and hardens the moment the first tape exists. Twenty identities
 * against twenty-one checks: checkPools carries two, the caps and the ids,
 * checkStage carries two, one for each of the two things it watches, and
 * checkRefusals carries three, one per cap that can turn something away, while
 * the six bounds checks share one identity between them. The grave's own bounds
 * check is "in bounds" and sits beside a separate "entities in bounds", one
 * fatal and one recoverable, which is the pair a severity table most easily
 * confuses.
 */
const FAULT_IDENTITIES = [
  'no NaN',
  'size within floor and ceiling',
  'in bounds',
  'entities in bounds',
  'entity caps',
  'entity ids',
  'freshness in range',
  'reservoir in range',
  'levels in range',
  'one live ring',
  'phase index only increases',
  'phase tick resets at a boundary',
  'one live offer',
  'offer bodies alive and matching',
  'bank not negative',
  'corpse cap never binds',
  'carrier spawn never refused',
  'offer stands a body',
  'boss chunk only increases',
  'set piece budget not negative',
] as const;

// One member of the closed list above.
type FaultIdentity = (typeof FAULT_IDENTITIES)[number];

// Whether the run can safely carry on past a fault (ADR 0024).
type FaultSeverity = 'fatal' | 'recoverable';

/**
 * How safe continued execution is after each fault, by semantic safety and
 * never by how cosmetic the symptom looks (ADR 0024).
 *
 * Fatal, five checks and six identities. NaN spreads and every comparison
 * against it is false, so containment, culling and collision quietly stop
 * working. A level is an array index rather than a meter, and every per-level
 * table is sized to MAX_LEVEL. Two live slots sharing an id send a wisp after a
 * mob it never locked onto. A grave outside the field puts the player off it, so
 * collision and the Wall's width arithmetic stop meaning anything. Size is
 * health, so out of range means the seal condition was missed and a run that
 * should be over keeps playing. And a pool whose shape changed means a
 * structural assumption was violated outside the pool API, after which no other
 * check's answer is trustworthy.
 *
 * Recoverable, fourteen checks and twelve identities. A stray entity is culled or
 * draws off-screen and nothing reads it wrong, and the six checks that watch
 * for one all record under the same identity. A corpse pays the wrong amount
 * into a size the fatal check still guards. One line's charge is wrong and
 * payReservoir clamps it back. A bell ring over-expands within one line. And a
 * stage phase repeats or skips spawns while the simulation stays coherent.
 *
 * The three offer identities are recoverable for the same reason the ring is,
 * and it is worth saying plainly because what they guard is expensive: a
 * second offer's bodies on the field, a body carrying an option the offer does
 * not name, or a bank below zero all mean the player is paid the wrong power,
 * which spoils a run without making one number in it untrustworthy. Nothing
 * downstream of them reads a poisoned value, so terminating the run would
 * punish the player for a bookkeeping fault they cannot see.
 *
 * The three refusal identities are recoverable on the same reading, and the
 * reading is the whole reason they exist (ADR 0056). A cap sized so that it
 * cannot bind in normal play has, when it binds, cost the player a corpse, a
 * carrier or an offer that the game itself could not deliver. The run is coherent
 * and one body poorer, which is exactly a state to report loudly and carry on
 * from, and terminating it would take a whole run away over food.
 *
 * The boss's chunk and the set piece's budget are recoverable on the stage's
 * own reading (ADR 0007, ADR 0042). A chunk that went backwards replays a
 * pattern the player has already beaten and a budget below zero pours nothing;
 * both spoil a fight without poisoning a number anything downstream reads, and
 * killing the run at the climax is a worse answer than reporting it.
 */
const FAULT_SEVERITY: Readonly<Record<FaultIdentity, FaultSeverity>> = {
  'no NaN': 'fatal',
  'size within floor and ceiling': 'fatal',
  'in bounds': 'fatal',
  'entities in bounds': 'recoverable',
  'entity caps': 'fatal',
  'entity ids': 'fatal',
  'freshness in range': 'recoverable',
  'reservoir in range': 'recoverable',
  'levels in range': 'fatal',
  'one live ring': 'recoverable',
  'phase index only increases': 'recoverable',
  'phase tick resets at a boundary': 'recoverable',
  'one live offer': 'recoverable',
  'offer bodies alive and matching': 'recoverable',
  'bank not negative': 'recoverable',
  'corpse cap never binds': 'recoverable',
  'carrier spawn never refused': 'recoverable',
  'offer stands a body': 'recoverable',
  'boss chunk only increases': 'recoverable',
  'set piece budget not negative': 'recoverable',
};

// One invariant found broken on one tick.
interface Fault {
  readonly identity: FaultIdentity;
  readonly severity: FaultSeverity;
  // Where to find the offending number again, as "mob 12.vx is NaN".
  readonly detail: string;
}

export { FAULT_IDENTITIES, FAULT_SEVERITY };
export type { FaultIdentity, FaultSeverity, Fault };
