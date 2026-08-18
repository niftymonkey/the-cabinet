// The dev instrument panel: every slice instrument readable live, plus any
// invariant fire (decision-log entry 6.5). Toggled with the backquote key.

import { Container, Graphics, Text } from "pixi.js";

import { summarize } from "../../../game/instruments";
import type { Sim } from "../../../game/sim";
import { PALETTE } from "../../palette";

export class DebugPanel extends Container {
  private readonly body: Text;
  private readonly bg: Graphics;
  private clock = 0;

  constructor() {
    super();
    this.bg = new Graphics();
    this.body = new Text({
      text: "",
      style: {
        fill: PALETTE.corpse,
        fontSize: 12,
        fontFamily: "monospace",
        lineHeight: 17,
      },
    });
    this.body.position.set(10, 8);
    this.addChild(this.bg, this.body);
    this.visible = false;
  }

  public updateFrom(
    sim: Sim,
    dt: number,
    seed: number,
    autopilot: boolean,
    violationCount: number,
    lastViolations: string[],
  ): void {
    if (!this.visible) return;
    this.clock += dt;
    if (this.clock < 0.25) return;
    this.clock = 0;
    const s = summarize(sim.instruments);
    const lines = [
      "INSTRUMENTS",
      `seed              ${seed}`,
      `phase             ${sim.phase} @ ${sim.phaseT.toFixed(1)}s`,
      `run               ${s.runSeconds.toFixed(1)}s`,
      `autopilot         ${autopilot ? "ON (P)" : "off (P)"}`,
      `off-bottom        ${(s.offBottomFraction * 100).toFixed(1)}%`,
      `kills             ${s.kills}`,
      `hits              ${s.hits}`,
      `drops             ${s.drops.spawned} spawned / ${s.drops.eaten} eaten / ${s.drops.scrolledOff} lost`,
      `drop gap          ${s.drops.meanGapSeconds.toFixed(1)}s mean`,
      `swallows          ${s.corpsesEaten} eaten / ${s.corpsesSuckedUnder} rotted`,
      `freshness@swallow ${s.avgFreshnessAtSwallow.toFixed(2)}`,
      `  with bell 2+    ${s.avgFreshnessAtSwallowBellLeveled.toFixed(2)}`,
      `belches           ${s.belchesFired}`,
      `full-res time     ${s.timeAtFullReservoir.toFixed(1)}s`,
      `wasted charge     ${s.wastedCharge.toFixed(0)}`,
      `belch on wall     ${s.belchOnWall}`,
      `belch in banshee  ${s.belchesInBansheeFight}`,
      `belch in undrtkr  ${s.belchesInUndertakerFight}`,
      `chunk mid-emit    ${s.chunkEndedMidEmit}`,
      `oversize score    ${s.oversizeScore}`,
      `invariant fires   ${violationCount}`,
      ...lastViolations.map((v) => `! ${v}`),
    ];
    this.body.text = lines.join("\n");
    this.bg.clear();
    this.bg
      .roundRect(0, 0, this.body.width + 20, this.body.height + 16, 6)
      .fill({ color: 0x0a0d14, alpha: 0.85 });
  }
}
