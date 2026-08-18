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
import { TouchSteer } from "../../input/touch";
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

  // Ticket #33: relative-drag touch steering. Mouse pointers are excluded so
  // desktop clicking (debug panel, popups) never doubles as steering.
  private readonly touch = new TouchSteer(T.TOUCH_DRAG_RATIO);
  private touchUsed = false;
  private fieldScale = 1;
  private screenW = T.FIELD_W;
  private readonly onPointerDown = (ev: PointerEvent) =>
    this.handlePointerDown(ev);
  private readonly onPointerMove = (ev: PointerEvent) => {
    if (ev.pointerType === "mouse" || this.paused) return;
    const p = this.toField(ev);
    this.touch.move(ev.pointerId, p.x, p.y);
  };
  private readonly onPointerEnd = (ev: PointerEvent) => {
    if (ev.pointerType === "mouse") return;
    this.touch.up(ev.pointerId);
  };

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
    this.touch.cancel();
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
    this.hud.updateFrom(this.sim, this.autopilot, this.touchUsed);
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
    const touch = this.touch.read(
      this.sim.player.x,
      this.sim.player.y,
      T.PLAYER_SPEED * DT,
    );
    const belch = this.belchPressed || touch.belch;
    this.belchPressed = false;
    if (this.touch.steering) {
      // The drag target chase assumes full speed, so focus never combines
      // with steering; drag precision is what focus was for (ticket #33).
      return { moveX: touch.moveX, moveY: touch.moveY, focus: false, belch };
    }
    const focus = h.has("ShiftLeft") || h.has("ShiftRight");
    return { moveX: right - left, moveY: down - up, focus, belch };
  }

  private handlePointerDown(ev: PointerEvent): void {
    if (ev.pointerType === "mouse") return;
    if (!this.touchUsed) {
      this.touchUsed = true;
      this.hud.setDragRatio(this.touch.ratio);
    }
    if (this.paused) return;
    const logical = this.toLogical(ev);
    if (this.hud.ratioChipContains(logical.x, logical.y)) {
      this.cycleDragRatio();
      return;
    }
    const p = this.toField(ev);
    this.touch.down(ev.pointerId, p.x, p.y);
  }

  private cycleDragRatio(): void {
    const ratios = T.TOUCH_DRAG_RATIOS;
    const index = ratios.indexOf(this.touch.ratio);
    this.touch.ratio = ratios[(index + 1) % ratios.length];
    this.hud.setDragRatio(this.touch.ratio);
  }

  /** Pointer pixels to the engine's logical screen coordinates */
  private toLogical(ev: PointerEvent): { x: number; y: number } {
    const rect = engine().renderer.canvas.getBoundingClientRect();
    const s = rect.width > 0 ? this.screenW / rect.width : 1;
    return { x: (ev.clientX - rect.left) * s, y: (ev.clientY - rect.top) * s };
  }

  /** Pointer pixels to field units (only deltas matter to the steer model) */
  private toField(ev: PointerEvent): { x: number; y: number } {
    const logical = this.toLogical(ev);
    return {
      x: (logical.x - this.field.position.x) / this.fieldScale,
      y: (logical.y - this.field.position.y) / this.fieldScale,
    };
  }

  private handleKeyDown(ev: KeyboardEvent): void {
    if (ev.code === "Space" || ev.code.startsWith("Arrow")) {
      ev.preventDefault();
    }
    if (ev.repeat) return;
    // The pause popup owns the keyboard while it is up; without this guard
    // R, P, and the phase-skip digits still act behind it.
    if (this.paused) return;
    this.held.add(ev.code);
    if (ev.code === "Space") this.belchPressed = true;
    if (ev.code === "Escape") {
      // paused flips only once the popup is presented, so a double-tap of
      // Escape in that gap would re-present it without this check.
      if (!engine().navigation.currentPopup) {
        void engine().navigation.presentPopup(PausePopup);
      }
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
    this.touch.cancel();
  }

  /** Resume gameplay */
  public async resume() {
    this.paused = false;
  }

  /** Release held keys; the run itself is reset in prepare() */
  public reset() {
    this.held.clear();
  }

  public resize(width: number, height: number) {
    const scale = Math.min(width / T.FIELD_W, height / T.FIELD_H);
    this.screenW = width;
    this.fieldScale = scale;
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
    window.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerEnd);
    window.addEventListener("pointercancel", this.onPointerEnd);
  }

  public async hide() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerEnd);
    window.removeEventListener("pointercancel", this.onPointerEnd);
    this.touch.cancel();
  }

  /** Auto pause when the window loses focus */
  public blur() {
    if (!engine().navigation.currentPopup && !this.ended) {
      void engine().navigation.presentPopup(PausePopup);
    }
  }
}
