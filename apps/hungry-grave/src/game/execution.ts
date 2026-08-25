/**
 * The one execution authority (ADR 0017). Every executed tick crosses
 * executeTick, and reaching around it is a build failure rather than a
 * convention: eslint.config.mjs fences src/** off this module's step import,
 * and this is the only file exempt from that fence.
 *
 * Three paths reached the simulation before this existed, so a recording seam
 * anywhere else had a hole in it by construction: advance()'s inner loop, the
 * invariant harness's own step wrapper, and four raw step() calls in a screen
 * test. All three are absorbed here, and advance(), the bot's runPolicy and the
 * golden scenario are loops over this function.
 *
 * Execution is a plain record and not a class. It holds the run, an ordered
 * listener array, the stage watch, the broken-invariant handler and the run's
 * fault history. Listener order is array order, so the fan-out is deterministic
 * and one test cannot leak into another.
 *
 * ITS LIFETIME IS THE RUN'S, and it is created where the run is created. The
 * WeakMap the stage watch used to live in was giving that away for free; a
 * pooled screen leaks anything nobody explicitly clears, and this app has
 * shipped that defect five times.
 */

import type { SimEvent } from "./events";
import type {
  Fault,
  FaultIdentity,
  FaultSeverity,
  StageWatch,
} from "./invariants";
import { checkInvariants, createStageWatch } from "./invariants";
import { f32 } from "./math";
import type { MoveCommand, RunState, TickCommand } from "./run";
import { step } from "./step";

/**
 * Anything watching the simulation, told once per executed tick.
 *
 * The command it is handed is the quantised one the simulation actually
 * consumed, never the one the caller offered, because a recording of a command
 * the run did not execute is worse than no recording.
 */
export type TickListener = (
  tick: number,
  command: TickCommand,
  events: readonly SimEvent[],
  state: RunState,
) => void;

/**
 * Told when a tick broke one or more invariants, with the tick's whole fault
 * set rather than a single failure.
 *
 * It is a notification and never the decider (ADR 0017). The authority sets the
 * stop reason itself, so which build constructed the Execution cannot decide
 * what a tape records, and a handler may not stop or continue a run.
 */
export type BrokenHandler = (faults: readonly Fault[], state: RunState) => void;

/**
 * How a run stopped, as opposed to how it ended (CONTEXT.md). Absent is the
 * fourth reading, unknown, which is what a recording that simply breaks off
 * leaves behind. This authority only ever writes "faulted".
 */
export type StopReason = "finished" | "quit" | "faulted";

/**
 * One invariant, broken at least once during this run.
 *
 * A persistent recoverable fault fires on every tick, so a row per tick would
 * bury the run under one repeated fault. The identity, the tick it first fired
 * on and the total count are what a persistent fault needs to stay
 * diagnostically useful.
 */
export interface FaultRecord {
  readonly identity: FaultIdentity;
  readonly severity: FaultSeverity;
  /** The run tick this identity was first seen on. */
  readonly firstTick: number;
  /** The detail from the first time it fired, kept so a reader has one number to chase. */
  readonly detail: string;
  /** How many ticks it has fired on, this one included. */
  count: number;
}

export interface Execution {
  readonly run: RunState;
  /** Fired in array order after every executed tick. */
  readonly listeners: TickListener[];
  readonly watch: StageWatch;
  readonly onBroken: BrokenHandler | null;
  /** Every fault this run has seen, de-duplicated by identity, in first-seen order. */
  readonly faults: FaultRecord[];
  /** Null while the run may keep executing. */
  stop: StopReason | null;
}

export interface ExecutionOptions {
  readonly listeners?: TickListener[];
  readonly onBroken?: BrokenHandler;
}

/** The authority for one run, made where the run is made. */
export function createExecution(
  run: RunState,
  options: ExecutionOptions = {},
): Execution {
  return {
    run,
    listeners: options.listeners ?? [],
    watch: createStageWatch(),
    onBroken: options.onBroken ?? null,
    faults: [],
    stop: null,
  };
}

/**
 * The command the simulation consumes, rounded to the grid a tape records.
 *
 * It lives here and not at combineSteer's call site because combineSteer covers
 * only the live input path: the bot policies, the golden scenario's script and
 * every test helper produce commands that never pass through it, and a tape of
 * a bot run would then hold something the simulation did not consume. float32
 * is the grid because it needs no scale, has no range limit and asks for no
 * clamp in the input path, which is the shape ADR 0011 was already burned by.
 */
function quantiseMove(move: MoveCommand): MoveCommand {
  return { x: f32(move.x), y: f32(move.y) };
}

function quantiseCommand(command: TickCommand): TickCommand {
  return { move: quantiseMove(command.move), belch: command.belch };
}

/** Folds one tick's fault into the run's history, or counts it against the record already there. */
function recordFault(execution: Execution, fault: Fault): void {
  const seen = execution.faults.find(
    (record) => record.identity === fault.identity,
  );
  if (seen !== undefined) {
    seen.count += 1;
    return;
  }
  execution.faults.push({
    identity: fault.identity,
    severity: fault.severity,
    firstTick: execution.run.tick,
    detail: fault.detail,
    count: 1,
  });
}

function isFatal(fault: Fault): boolean {
  return fault.severity === "fatal";
}

/**
 * Runs every check for the tick, records what broke and decides whether the run
 * may carry on.
 *
 * Nothing here catches. A checker that cannot run is a bug in the checker, and
 * swallowing it into the fault list it exists to produce would hide it behind
 * the very mechanism meant to surface it.
 */
function observeFaults(execution: Execution): void {
  const faults = checkInvariants(execution.run, execution.watch);
  if (faults.length === 0) return;
  for (const fault of faults) recordFault(execution, fault);
  // The stop is set before the handler is told, so a handler that reads the
  // Execution sees the outcome rather than racing it.
  if (faults.some(isFatal) && execution.stop === null) {
    execution.stop = "faulted";
  }
  execution.onBroken?.(faults, execution.run);
}

function notifyListeners(
  execution: Execution,
  command: TickCommand,
  events: readonly SimEvent[],
): void {
  for (const listener of execution.listeners) {
    listener(execution.run.tick, command, events, execution.run);
  }
}

/**
 * One tick, executed: quantised, stepped, checked, and announced.
 *
 * It hands the tick's events straight back, so a caller does not have to
 * collect a frame's events through a listener.
 *
 * The listeners fire after the checks and are told about the faulted tick too,
 * which is load-bearing rather than incidental: a tape that dropped its own
 * last tick would hide the evidence of the tick that stopped the run.
 *
 * It does not read its own stop reason or the run's ending. The loops above it
 * read both before each tick, because the catch-up clamp buys up to fifteen
 * ticks in one frame: a fatal fault would otherwise re-fire fourteen more
 * times inside the frame that caught it, and a run that seals or wins
 * mid-frame would keep simulating past its own end and move the final score
 * and tick count a player sees (#52). Verification readback deliberately
 * guards on the stop alone: a sealed FORMAT_VERSION 1 tape recorded before the
 * ending guard can carry ticks after the ending, and a readback must feed
 * every command a tape holds.
 */
export function executeTick(
  execution: Execution,
  command: TickCommand,
): readonly SimEvent[] {
  const consumed = quantiseCommand(command);
  const events = step(execution.run, consumed);
  // Unconditionally: the checks are always on in every build, and there is
  // deliberately no off-switch (ADR 0017).
  observeFaults(execution);
  notifyListeners(execution, consumed, events);
  return events;
}

/**
 * A developer's handler: it reports and never throws, and it halts once per
 * fault identity rather than once per tick.
 *
 * A debugger statement halts on the exact frame when devtools are open and is
 * inert when they are not, which is the "stopped at the moment rather than told
 * later" that ADR 0017's word "crashes" was reaching for. A real throw would
 * leave executeTick, unwind through advance and the game screen, and reach
 * pixi's Ticker.update, which has no try/catch: the frozen canvas ADR 0017
 * opens with, now reachable in the build a developer actually uses, with no
 * clean stop and no end state. It is also unnecessary, because a fatal fault
 * already stops the run through the authority, and a handler that threw would
 * be changing the outcome onBroken is forbidden from changing.
 *
 * Once per identity is what keeps that promise in practice. onBroken is
 * notified on every tick a fault fires, and ADR 0017 makes a persistent
 * recoverable fault the normal case rather than an edge, so halting per tick
 * re-breaks on the next frame the moment a developer resumes and reads as a
 * stop in the build ruling H exists to keep running. The repeats are not lost:
 * the Execution's fault record carries the count. The de-duplication is the
 * loudness axis and never the severity one, and the set lives as long as the
 * module, so an identity halts on its first sighting and reports itself once.
 *
 * Severity means the same thing everywhere in the system: a recoverable fault
 * is loud here and still never terminates execution. Loudness and severity are
 * separate axes, and only the build decides loudness.
 */
export function createDevBrokenHandler(): BrokenHandler {
  const halted = new Set<FaultIdentity>();
  return (faults, state) => {
    const fresh = faults.filter((fault) => !halted.has(fault.identity));
    if (fresh.length === 0) return;
    for (const fault of fresh) {
      halted.add(fault.identity);
      console.error(
        `sim fault on tick ${state.tick}, ${fault.identity} (${fault.severity}): ${fault.detail}`,
      );
    }
    // eslint-disable-next-line no-debugger -- ADR 0017 ruling H: the dev handler halts here and never throws.
    debugger;
  };
}

/** The one a developer's build installs, made here so its identities span the session. */
export const devBrokenHandler: BrokenHandler = createDevBrokenHandler();
