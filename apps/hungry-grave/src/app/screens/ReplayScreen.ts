import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

import type { Clock } from "../../game/clock";
import { createClock, ticksFor } from "../../game/clock";
import type { SimEvent } from "../../game/events";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../../game/field";
import { RESERVOIR_CAPACITY } from "../../game/tuning";
import { TapeFormatError } from "../../tape/bytes";
import type { DecodedTape } from "../../tape/decode";
import { decodeTape } from "../../tape/decode";
import type { Playback, PlaybackResult } from "../../tape/playback";
import { createPlayback } from "../../tape/playback";
import type { Tape } from "../../tape/tape";
import { meterLinePosition, METER_FONT_SIZE } from "../FpsMeter";
import type { FieldPlacement } from "../layout";
import {
  BOUNDARY_STROKE,
  DEGENERATE_PLACEMENT,
  fitField,
  READOUT_RESERVE,
} from "../layout";
import { PALETTE } from "../palette";
import { atFromUrl, tapeFromUrl } from "../seedFromUrl";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { FieldRenderer } from "./game/FieldRenderer";
import { GraveRenderer } from "./game/GraveRenderer";
import { FieldLayers } from "./game/layering";
import { StormRenderer } from "./game/StormRenderer";
import { REPLAY_LEAD_IN_TICKS } from "./game/transients";

/**
 * The instrument replay route (ADR 0020): a kept or fetched tape rendered at a
 * chosen tick, honestly primed, bounded by the last verified checkpoint.
 *
 * It never grows player features, and the reserved player route #/watch stays
 * unbuilt: a player-facing feature must not later be built on a debug URL.
 * Watching is also silent for the same reason; the game screen's sound
 * subscription is a play feature and is deliberately not copied here.
 */

/**
 * How many ticks a headless phase spends per rendered frame, for the
 * verification pre-pass and the fast-forward both. At ADR 0017's measured
 * figures, a bare tick at 17 to 25 microseconds plus always-on checks at 23 to
 * 37, 120 ticks is five to eight milliseconds of a frame, and a full
 * 12,000-tick tape verifies in about a hundred frames. A named starting value,
 * data to tune and never a rule.
 */
const HEADLESS_TICKS_PER_FRAME = 120;

/** The back button's size, the pause button's own. */
const BACK_WIDTH = 132;
const BACK_HEIGHT = 68;

/**
 * Where the screen is in a tape's life. Idle is a screen with nothing left to
 * do: no tape named, a refused tape, or a statement standing in for playback.
 */
type ReplayPhase =
  "idle" | "fetching" | "verifying" | "fastForwarding" | "playing" | "played";

/** One line of the corner readout stack (the game screen's own construction). */
function stackLine(index: number): Label {
  const label = new Label({
    style: {
      fontFamily: "monospace",
      fill: PALETTE.hudDim.hex,
      fontSize: METER_FONT_SIZE,
    },
  });
  label.anchor.set(0, 0);
  const at = meterLinePosition(index);
  label.position.set(at.x, at.y);
  return label;
}

/** The playfield's boundary readout, the game screen's own (see GameScreen.ts). */
function boundaryReadout(): Graphics {
  return new Graphics().rect(0, 0, FIELD_WIDTH, FIELD_HEIGHT).stroke({
    width: BOUNDARY_STROKE,
    color: PALETTE.fieldFrame.hex,
    alignment: 1,
  });
}

/** The field's clip, exactly the field rect (see GameScreen.ts for the derivation). */
function fieldClip(): Graphics {
  return new Graphics().rect(0, 0, FIELD_WIDTH, FIELD_HEIGHT).fill();
}

/**
 * The tick of the last checkpoint this playback verified. The playback
 * verifies a tape's checkpoints in ascending order and stops at the first
 * disagreement, so the verified ones are exactly the first
 * checkpointsVerified entries.
 */
function lastVerifiedTick(tape: Tape, result: PlaybackResult): number {
  if (result.checkpointsVerified === 0) return 0;
  return tape.checkpoints[result.checkpointsVerified - 1].index;
}

/** The verified length, stated up front, with the divergence named when there is one. */
function verifiedReadout(
  result: PlaybackResult,
  bound: number,
  bodyTicks: number,
): string {
  const length = `VERIFIED ${bound} OF ${bodyTicks} TICKS`;
  if (result.firstDivergentCheckpoint === null) return length;
  return `${length}, DIVERGED AT CHECKPOINT ${result.firstDivergentCheckpoint}`;
}

/**
 * The original run's tick debt, stated beside the verified length. A missing
 * trailer is itself the reading (ADR 0018): the run's stop is unknown and so
 * is its debt, and saying so is the honest line.
 */
function debtReadout(tape: Tape): string {
  if (tape.trailer === null) return "NO TRAILER: STOP AND DEBT UNKNOWN";
  return `ORIGINAL DEBT ${tape.trailer.debtTicks} TICKS`;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * The screen a tape replays on. Render only: it reproduces the run through the
 * one playback loop and shows it, and holds no game rules and no player input.
 */
export class ReplayScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ["main"];

  private readonly field: Container;
  private readonly layers: FieldLayers;
  /** The boundary readout, held rather than rebuilt (reset() empties the layers). */
  private readonly frame: Graphics;
  /** The field's clip: a mask is not a layer, so it is built once and survives clear(). */
  private readonly clip: Graphics;
  private readonly grave = new GraveRenderer();
  private readonly fieldRenderer = new FieldRenderer();
  private readonly stormRenderer = new StormRenderer();

  private readonly postureLabel: Label;
  private readonly verifiedLabel: Label;
  private readonly debtLabel: Label;
  private readonly tickLabel: Label;
  /** The plain statements: a format error, a truncation, a refusal. */
  private readonly statement: Label;
  private readonly backButton: Button;

  private placement: FieldPlacement = DEGENERATE_PLACEMENT;
  private phase: ReplayPhase = "idle";
  private tape: Tape | null = null;
  /**
   * The verification pre-pass: the whole tape reproduced headless through the
   * one playback loop, stepwise so the loading posture can advance in chunks
   * across frames. Its verdict is exactly readBackForVerification's, being the
   * same loop (#58); the readback seam itself stays what ADR 0020 says it is,
   * the recorder's proof of its own artifact, and is deliberately not imported
   * into a replay.
   */
  private verification: Playback | null = null;
  /** The reproduction being rendered, bounded by the last verified checkpoint. */
  private playback: Playback | null = null;
  /** This frame's events, buffered from the playback's tick observer. */
  private readonly frameEvents: SimEvent[] = [];
  /** The last verified checkpoint's tick, which playback never renders past (ADR 0019). */
  private bound = 0;
  /** The tick the URL asked to open at, clamped to the bound once that is known. */
  private target = 0;
  private clock: Clock = createClock();
  private shownTick: number | null = null;
  /**
   * Which prepare() the in-flight fetch belongs to. This screen is pooled, and
   * a fetch that resolves after reset() must not dress a later run's screen
   * with an earlier run's tape.
   */
  private generation = 0;

  constructor() {
    super();

    this.field = new Container();
    this.field.interactiveChildren = false;
    this.layers = new FieldLayers();
    this.layers.addTo(this.field);
    this.clip = fieldClip();
    this.field.addChild(this.clip);
    this.field.mask = this.clip;
    this.frame = boundaryReadout();
    this.dressField();

    this.postureLabel = stackLine(1);
    this.verifiedLabel = stackLine(2);
    this.debtLabel = stackLine(3);
    this.tickLabel = stackLine(4);
    this.statement = new Label({
      style: {
        fontFamily: "monospace",
        fill: PALETTE.hudInk.hex,
        fontSize: METER_FONT_SIZE,
        wordWrap: true,
      },
    });
    this.backButton = new Button({
      text: "BACK",
      width: BACK_WIDTH,
      height: BACK_HEIGHT,
      fontSize: 18,
    });
    this.backButton.onPress.connect(() => {
      // The router in main.ts observes the hash and shows the title screen.
      window.location.hash = "#/";
    });

    this.addChild(
      this.field,
      this.postureLabel,
      this.verifiedLabel,
      this.debtLabel,
      this.tickLabel,
      this.statement,
      this.backButton,
    );
  }

  /** The field's own furniture, put back after any clear() (see reset). */
  private dressField(): void {
    this.layers.layer("fieldBoundary").addChild(this.frame);
    this.fieldRenderer.attach(this.layers);
    this.stormRenderer.attach(this.layers);
    this.grave.attach(this.layers);
  }

  public prepare(): void {
    this.generation += 1;
    // The engine takes this screen's children away on the way out and only
    // gives them back to a screen that declares show(); without this the back
    // button is dead on every showing after the first.
    this.interactiveChildren = true;
    this.phase = "idle";
    this.tape = null;
    this.verification = null;
    this.playback = null;
    this.frameEvents.length = 0;
    this.bound = 0;
    this.clock = createClock();
    this.shownTick = null;
    this.postureLabel.text = "";
    this.verifiedLabel.text = "";
    this.debtLabel.text = "";
    this.tickLabel.text = "";
    this.statement.text = "";

    const search = window.location.search;
    const hash = window.location.hash;
    this.target = atFromUrl(search, hash) ?? 0;
    const url = tapeFromUrl(search, hash);
    if (url === null) {
      this.refuse("NO TAPE NAMED: #/replay?tape=<url>&at=<tick> NAMES ONE.");
      return;
    }
    this.phase = "fetching";
    this.postureLabel.text = "FETCHING TAPE";
    void this.fetchTape(url, this.generation);
  }

  public reset(): void {
    this.generation += 1;
    this.phase = "idle";
    this.tape = null;
    this.verification = null;
    this.playback = null;
    this.frameEvents.length = 0;
    this.bound = 0;
    this.target = 0;
    this.shownTick = null;
    this.postureLabel.text = "";
    this.verifiedLabel.text = "";
    this.debtLabel.text = "";
    this.tickLabel.text = "";
    this.statement.text = "";
    this.layers.clear();
    this.dressField();
  }

  /** A statement instead of a playback: the screen reports and plays nothing. */
  private refuse(statement: string): void {
    this.phase = "idle";
    this.postureLabel.text = "NO REPLAY";
    this.statement.text = statement;
  }

  /**
   * The tape's bytes, from wherever the URL points: the runs screen hands a
   * blob URL here, and any later source walks the same door.
   */
  private async fetchTape(url: string, generation: number): Promise<void> {
    let bytes: Uint8Array;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`the tape URL answered ${response.status}`);
      }
      bytes = new Uint8Array(await response.arrayBuffer());
    } catch (error) {
      // An unreachable URL is an external failure, stated as a fact.
      if (generation === this.generation) {
        this.refuse(`THE TAPE COULD NOT BE FETCHED: ${messageOf(error)}`);
      }
      return;
    }
    if (generation !== this.generation) return;
    try {
      this.receiveTape(decodeTape(bytes));
    } catch (error) {
      // A tape that cannot be read is rejected and its refusal shown plainly;
      // anything else is a bug and keeps flying.
      if (!(error instanceof TapeFormatError)) throw error;
      this.refuse(error.message);
    }
  }

  private receiveTape(decoded: DecodedTape): void {
    this.tape = decoded.tape;
    if (decoded.truncated) {
      this.statement.text =
        "THE TAPE IS CUT SHORT: IT READS TO ITS LAST WHOLE RECORD AND PLAYS TO ITS LAST VERIFIED CHECKPOINT.";
    }
    this.verification = createPlayback(decoded.tape);
    this.phase = "verifying";
    this.postureLabel.text = "VERIFYING";
  }

  /**
   * One frame of the screen's work: the two headless phases advance in chunks,
   * so a long tape shows a loading posture rather than a hung frame, and the
   * playing phase spends real time as ticks the way the game does.
   */
  public update(ticker: Ticker): void {
    if (this.phase === "verifying") {
      this.verifyChunk();
      return;
    }
    if (this.phase === "fastForwarding") {
      this.fastForwardChunk();
      return;
    }
    if (this.phase === "playing") this.playFrame(ticker.elapsedMS);
  }

  private verifyChunk(): void {
    const verification = this.verification;
    const tape = this.tape;
    if (verification === null || tape === null) return;
    let spent = 0;
    while (spent < HEADLESS_TICKS_PER_FRAME && verification.advanceTick()) {
      spent += 1;
    }
    if (spent === HEADLESS_TICKS_PER_FRAME) return;
    this.verification = null;
    this.primePlayback(tape, verification.result());
  }

  /**
   * The verdict, stated up front, and the bounded playback primed from it.
   * The target the URL asked for is clamped to the bound, because the bound is
   * where honesty ends: never show frames after the replay can no longer be
   * verified as the original run (ADR 0019).
   */
  private primePlayback(tape: Tape, result: PlaybackResult): void {
    this.bound = lastVerifiedTick(tape, result);
    this.verifiedLabel.text = verifiedReadout(
      result,
      this.bound,
      tape.commands.length,
    );
    this.debtLabel.text = debtReadout(tape);
    if (result.outcome === "witnessVersionMismatch") {
      this.refuse(
        `THIS TAPE'S WITNESS IS VERSION ${result.tapeWitnessVersion} AND THIS READER FOLDS VERSION ${result.readerWitnessVersion}: IT CANNOT BE VERIFIED HERE.`,
      );
      return;
    }
    this.target = Math.min(this.target, this.bound);
    this.playback = createPlayback(tape, (_tick, _command, events) => {
      for (const event of events) this.frameEvents.push(event);
    });
    this.phase = "fastForwarding";
    this.postureLabel.text = "FAST-FORWARDING";
    this.fastForwardChunk();
  }

  /**
   * The honest priming (#58): headless to a lead-in short of the target, then
   * the renderers' per-run memory is dropped, because a held transient the
   * skip never rendered belongs to no frame anybody saw, and the lead-in is
   * then rendered normally so every transient alive at the target was seen
   * born. REPLAY_LEAD_IN_TICKS covers the registry of held lifetimes, which
   * the transients test holds.
   */
  private fastForwardChunk(): void {
    const playback = this.playback;
    if (playback === null) return;
    const skipTo = Math.max(0, this.target - REPLAY_LEAD_IN_TICKS);
    let spent = 0;
    let rolling = true;
    while (
      rolling &&
      spent < HEADLESS_TICKS_PER_FRAME &&
      playback.run.tick < skipTo
    ) {
      rolling = playback.advanceTick();
      spent += 1;
    }
    // Headless ticks announce nothing: their momentary effects are older than
    // the lead-in by construction and would be invisible at the target anyway.
    this.frameEvents.length = 0;
    if (rolling && playback.run.tick < skipTo) return;
    this.fieldRenderer.forgetPreviousRun();
    this.stormRenderer.forgetPreviousRun();
    this.clock = createClock();
    this.phase = "playing";
    this.postureLabel.text = "REPLAYING";
    this.syncScreen(playback);
  }

  /** Real elapsed time spent as ticks (ADR 0015), stopping at the bound. */
  private playFrame(elapsedMs: number): void {
    const playback = this.playback;
    if (playback === null) return;
    let ticks = ticksFor(this.clock, elapsedMs);
    let rolling = true;
    while (rolling && ticks > 0 && playback.run.tick < this.bound) {
      rolling = playback.advanceTick();
      ticks -= 1;
    }
    this.syncScreen(playback);
    if (!rolling || playback.run.tick >= this.bound) {
      this.phase = "played";
      this.postureLabel.text = `PLAYED TO TICK ${playback.run.tick}, THE LAST VERIFIED CHECKPOINT`;
    }
  }

  /**
   * Everything on screen, from the reproduced run, through the same renderers
   * the live game draws with. The frame's buffered events are announced first,
   * per frame rather than per tick, exactly as the game screen delivers them.
   */
  private syncScreen(playback: Playback): void {
    const run = playback.run;
    for (const event of this.frameEvents) {
      if (event.type === "belched") this.stormRenderer.erupt(run);
      if (event.type === "splashed") this.stormRenderer.splashed(run);
    }
    this.frameEvents.length = 0;
    this.grave.sync(run.grave, run.reservoir / RESERVOIR_CAPACITY, run.tick);
    this.fieldRenderer.sync(run);
    this.stormRenderer.sync(run);
    if (run.tick !== this.shownTick) {
      this.shownTick = run.tick;
      this.tickLabel.text = `TICK ${run.tick}`;
    }
  }

  public resize(width: number, height: number): void {
    this.placement = fitField(width, height, READOUT_RESERVE);
    this.field.position.set(this.placement.offsetX, this.placement.offsetY);
    this.field.scale.set(this.placement.scale);
    this.statement.position.set(width / 2, height / 2);
    this.statement.style.wordWrapWidth = Math.min(width - 64, 520);
    this.backButton.position.set(
      width - READOUT_RESERVE.margin - BACK_WIDTH / 2,
      READOUT_RESERVE.margin + BACK_HEIGHT / 2,
    );
  }
}
