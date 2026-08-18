// The playing screen: owns the sim, the fixed 60Hz timestep, the keyboard,
// the autopilot, and the dev tools. The sim steps at the same fixed dt the
// headless tests use, so what the tests assert is what the screen shows
// (decision-log entry 6.5).

import type { Ticker } from "pixi.js";
import { Container } from "pixi.js";

import { advanceToPhase, botInput, PHASE_ORDER } from "../../game/bot";
import { checkInvariants } from "../../game/invariants";
import { createSim, step, type Sim } from "../../game/sim";
import * as T from "../../game/tuning";
import type { Input } from "../../game/types";
import { engine } from "../../../../app/getEngine";
import { PausePopup } from "../../../../app/popups/PausePopup";
import { runState } from "../../runState";
import { initSfx } from "../../sfx";
import { EndScreen } from "../EndScreen";
import { DebugPanel } from "./DebugPanel";
import { FieldRenderer } from "./FieldRenderer";
import { GameHud } from "./GameHud";

const DT = 1 / 60;
const MAX_STEPS_PER_FRAME = 6;
const END_LINGER_SECONDS = 1.4;

export class GameScreen extends Container {
  /** Assets bundles required by this screen (the popups draw from "main") */
  public static assetBundles = ["main"];

  private sim: Sim;
  private field: FieldRenderer;
  private hud: GameHud;
  private debugPanel: DebugPanel;
  private autopilot = false;
  private paused = false;
  private acc = 0;
  private endLinger = 0;
  private ended = false;
  private violationCount = 0;
  private lastViolations: string[] = [];
  private readonly held = new Set<string>();
  // The belch is a press, not a hold: holding Space must never auto-fire the
  // bomb the instant the reservoir fills, or the greed instruments read a
  // policy the player never chose.
  private belchPressed = false;
  private readonly onKeyDown = (ev: KeyboardEvent) => this.handleKeyDown(ev);
  private readonly onKeyUp = (ev: KeyboardEvent) => this.held.delete(ev.code);

  constructor() {
    super();
    this.sim = createSim(runState.seed);
    this.field = new FieldRenderer(engine().renderer);
    this.hud = new GameHud();
    this.debugPanel = new DebugPanel();
    this.debugPanel.position.set(14, 60);
    this.addChild(this.field, this.hud, this.debugPanel);
  }

  /** Fresh run every time the screen is shown (screens are pooled) */
  public prepare() {
    this.sim = createSim(runState.seed);
    this.autopilot = false;
    this.paused = false;
    this.acc = 0;
    this.endLinger = 0;
    this.ended = false;
    this.violationCount = 0;
    this.lastViolations = [];
    this.held.clear();
    this.belchPressed = false;
  }

  public update(time: Ticker) {
    if (this.paused) return;
    const dt = Math.min(time.deltaMS, 100) / 1000;

    if (this.sim.phase !== "victory" && this.sim.phase !== "dead") {
      this.acc += dt;
      let steps = 0;
      while (this.acc >= DT && steps < MAX_STEPS_PER_FRAME) {
        const input = this.autopilot ? botInput(this.sim) : this.readInput();
        step(this.sim, input, DT);
        this.watchInvariants();
        this.acc -= DT;
        steps++;
      }
      if (this.acc >= DT) this.acc = 0;
    } else if (!this.ended) {
      // Let the seal or the topple read before the end screen arrives.
      this.endLinger += dt;
      if (this.endLinger >= END_LINGER_SECONDS) {
        this.ended = true;
        runState.outcome = this.sim.phase === "dead" ? "dead" : "victory";
        runState.lastSim = this.sim;
        void engine().navigation.showScreen(EndScreen);
      }
    }

    this.field.sync(this.sim, dt);
    this.hud.updateFrom(this.sim, this.autopilot);
    this.debugPanel.updateFrom(
      this.sim,
      dt,
      runState.seed,
      this.autopilot,
      this.violationCount,
      this.lastViolations,
    );
  }

  private watchInvariants(): void {
    const violations = checkInvariants(this.sim);
    if (violations.length > 0) {
      this.violationCount += violations.length;
      this.lastViolations = violations;
    }
  }

  private readInput(): Input {
    const h = this.held;
    const left = h.has("ArrowLeft") || h.has("KeyA") ? 1 : 0;
    const right = h.has("ArrowRight") || h.has("KeyD") ? 1 : 0;
    const up = h.has("ArrowUp") || h.has("KeyW") ? 1 : 0;
    const down = h.has("ArrowDown") || h.has("KeyS") ? 1 : 0;
    const belch = this.belchPressed;
    this.belchPressed = false;
    const focus = h.has("ShiftLeft") || h.has("ShiftRight");
    return { moveX: right - left, moveY: down - up, focus, belch };
  }

  private handleKeyDown(ev: KeyboardEvent): void {
    if (ev.code === "Space" || ev.code.startsWith("Arrow")) {
      ev.preventDefault();
    }
    if (ev.repeat) return;
    this.held.add(ev.code);
    if (ev.code === "Space") this.belchPressed = true;
    if (ev.code === "Escape") {
      void engine().navigation.presentPopup(PausePopup);
      return;
    }
    if (ev.code === "Backquote") {
      this.debugPanel.visible = !this.debugPanel.visible;
      return;
    }
    if (ev.code === "KeyP") {
      this.autopilot = !this.autopilot;
      return;
    }
    if (ev.code === "KeyR") {
      this.prepare();
      return;
    }
    // Dev phase-skip: fast-forward by honestly playing the bot (entry 6.5).
    if (ev.code.startsWith("Digit")) {
      const index = Number(ev.code.slice(5)) - 1;
      const target = PHASE_ORDER[index];
      if (target !== undefined && target !== this.sim.phase) {
        advanceToPhase(this.sim, target);
        this.sim.events.length = 0;
      }
    }
  }

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause() {
    this.paused = true;
    this.held.clear();
    this.belchPressed = false;
  }

  /** Resume gameplay */
  public async resume() {
    this.paused = false;
  }

  /** Fully reset */
  public reset() {
    this.held.clear();
  }

  public resize(width: number, height: number) {
    const scale = Math.min(width / T.FIELD_W, height / T.FIELD_H);
    this.field.scale.set(scale);
    this.field.position.set(
      (width - T.FIELD_W * scale) / 2,
      (height - T.FIELD_H * scale) / 2,
    );
    this.hud.resize(width, height);
  }

  public async show(): Promise<void> {
    initSfx();
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.35 });
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  public async hide() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  /** Auto pause when the window loses focus */
  public blur() {
    if (!engine().navigation.currentPopup && !this.ended) {
      void engine().navigation.presentPopup(PausePopup);
    }
  }
}
