import { Container } from "pixi.js";

import type { RunEnding } from "../../game/run";
import { engine } from "../getEngine";
import { MENU } from "../palette";
import type { FaultSummary, RunSummary } from "../runHandoff";
import { runHandoff } from "../runHandoff";
import { saveTapeFile, tapeFileName } from "../tapeExport";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { bindKeyPress } from "../utils/bindKeyPress";
import { GameScreen } from "./game/GameScreen";

/**
 * What the end screen says happened. Sealed shut is ADR 0003's death and the
 * vocabulary is exact about it. The victory line is a stub's line only in the
 * sense that the Undertaker is not built yet; a stubbed victory is still a
 * victory the player sees, so it does not admit to being one.
 */
const ENDING_TITLE: Record<RunEnding, string> = {
  sealed: "SEALED SHUT",
  victory: "THE STAGE SURVIVED",
};

/** A run the player ended themselves, which is neither ending. */
const ABANDONED_TITLE = "THE RUN IS OVER";

/**
 * A run the instrument stopped (ADR 0017 ruling 2). No new screen: the fatal
 * fault adds enough to this state to say the run stopped because the
 * instrument found a problem. A fatal fault is never a player death, so the
 * copy wears no sealing vocabulary and never reads as a game over, and it must
 * be tellable from a quit without being told which: the precedent is
 * Minecraft's fatal-error state, distinct from both death and quit because the
 * player's next action differs.
 */
const FAULTED_TITLE = "THE GAME BROKE";

/**
 * The fault line's size, half a step under the menu's 18. The widest identity
 * line, FAULT phase tick resets at a boundary, is 37 characters: at 18 its
 * width bound overruns a 390-unit phone stage and at 16 it fits whole with
 * margin. screenLifecycle.test.ts holds every identity in the closed list
 * against the stage at a seven-digit tick.
 */
export const FAULT_FONT_SIZE = 16;

/**
 * Which fault stopped the run and its first tick, split onto two lines: as one
 * line the widest identity plus a seven-digit tick runs 53 characters, which
 * clips both ends on a 390-unit stage and drops the tick number, and the tick
 * is half of what filing a bug from a phone screenshot needs.
 */
export function faultCaption(fault: FaultSummary): string {
  return `FAULT ${fault.identity}\nAT TICK ${fault.firstTick}`;
}

/**
 * Which title the handed-off run earns. A fault outranks an ending: when both
 * exist the run's numbers were taken past the moment the instrument declared
 * it broken, and the trailer's stop already says faulted for the same reason.
 */
function titleFor(summary: RunSummary | null): string {
  if (summary === null) return ABANDONED_TITLE;
  if (summary.fault !== null) return FAULTED_TITLE;
  return summary.ending !== null
    ? ENDING_TITLE[summary.ending]
    : ABANDONED_TITLE;
}

/**
 * The screen a run ends on. Render only: it reports the run the game screen
 * recorded and offers another one.
 */
export class EndScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ["main"];

  private readonly title: Label;
  private readonly seedLabel: Label;
  private readonly tickLabel: Label;
  /**
   * Which fault stopped a faulted run, and its first tick: enough for a bug
   * filed from a phone screenshot. Empty on every run the instrument did not
   * stop.
   */
  private readonly faultLabel: Label;
  private readonly againButton: Button;
  /**
   * The minimal export (ADR 0020): scaffolding that gets the run's tape off
   * the device, never the storage system. It lives on this screen because the
   * end of a run is the first moment a sealed tape exists and the last moment
   * a real tap can still reach it before the next run overwrites the handoff.
   */
  private readonly saveButton: Button;
  private releaseKeys: (() => void) | null = null;
  private rising = false;

  constructor() {
    super();

    this.title = new Label({
      text: ABANDONED_TITLE,
      style: { fill: MENU.menuInk.hex, fontSize: 36, letterSpacing: 4 },
    });
    this.seedLabel = new Label({
      style: { fill: MENU.menuDim.hex, fontSize: 18 },
    });
    this.tickLabel = new Label({
      style: { fill: MENU.menuInk.hex, fontSize: 30 },
    });
    // Monospace rather than the menu face: the fit on a phone stage is then
    // provable by the corner stack's own advance bound instead of needing a
    // renderer, and a diagnostic readout wears the diagnostic face.
    this.faultLabel = new Label({
      style: {
        fontFamily: "monospace",
        fill: MENU.menuDim.hex,
        fontSize: FAULT_FONT_SIZE,
      },
    });
    this.againButton = new Button({
      text: "RISE AGAIN",
      width: 300,
      height: 100,
      fontSize: 24,
    });
    this.againButton.onPress.connect(() => this.riseAgain());
    this.saveButton = new Button({
      text: "SAVE TAPE",
      width: 300,
      height: 70,
      fontSize: 18,
    });
    this.saveButton.onPress.connect(() => this.saveTape());

    this.addChild(
      this.title,
      this.seedLabel,
      this.tickLabel,
      this.faultLabel,
      this.againButton,
      this.saveButton,
    );
  }

  public prepare() {
    this.rising = false;
    const summary = runHandoff.read();
    this.title.text = titleFor(summary);
    const fault = summary === null ? null : summary.fault;
    this.faultLabel.text = fault === null ? "" : faultCaption(fault);
    this.seedLabel.text = summary ? `SEED ${summary.seed}` : "NO RUN RECORDED";
    this.tickLabel.text = summary ? `${summary.ticks} TICKS` : "";
    this.saveButton.visible = runHandoff.readTape() !== null;
    this.releaseKeys = bindKeyPress("Enter", () => this.riseAgain());
  }

  public reset() {
    this.releaseKeys?.();
    this.releaseKeys = null;
  }

  public resize(width: number, height: number) {
    const cx = width / 2;
    this.title.position.set(cx, height * 0.26);
    this.seedLabel.position.set(cx, height * 0.42);
    this.tickLabel.position.set(cx, height * 0.42 + 40);
    this.faultLabel.position.set(cx, height * 0.42 + 80);
    this.againButton.position.set(cx, height * 0.68);
    this.saveButton.position.set(cx, height * 0.82);
  }

  /**
   * Hands the run's sealed bytes to the browser, from inside the real tap
   * handler because iOS Safari honours a download only from a user gesture
   * (ADR 0020). The bytes go out exactly as the recorder sealed them.
   */
  private saveTape(): void {
    const summary = runHandoff.read();
    const tape = runHandoff.readTape();
    if (summary === null || tape === null) return;
    saveTapeFile(tape, tapeFileName(summary.seed, COMMIT_HASH));
  }

  private riseAgain() {
    if (this.rising) return;
    this.rising = true;
    engine()
      .navigation.showScreen(GameScreen)
      .catch((error) => {
        // A failed navigation releases the guard, or RISE AGAIN never fires
        // again and the run cannot be left.
        this.rising = false;
        console.error(error);
      });
  }
}
