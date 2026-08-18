// The in-canvas HUD: score, clock, phase or boss health, the belch reservoir,
// and the four weapon-line pips. Built from the template's Label component.

import { Container, Graphics, Sprite, Texture } from "pixi.js";

import type { Sim } from "../../game/sim";
import * as T from "../../game/tuning";
import { LINE_NAMES, type LineName } from "../../game/types";
import { PALETTE } from "../../palette";
import { Label } from "../../../../app/ui/Label";

const LINE_LABEL: Record<LineName, string> = {
  soul: "SOUL",
  stone: "STONE",
  wisp: "WISP",
  bell: "BELL",
};

const PHASE_LABEL: Record<string, string> = {
  ramp: "THE RAMP",
  bansheeDrain: "SOMETHING IS COMING",
  banshee: "THE BANSHEE",
  backhalf: "THE FEAST",
  undertakerDrain: "HE IS COMING",
  undertaker: "THE UNDERTAKER",
};

export class GameHud extends Container {
  private readonly scoreLabel: Label;
  private readonly killsLabel: Label;
  private readonly timerLabel: Label;
  private readonly centerLabel: Label;
  private readonly pilotLabel: Label;
  private readonly bossBarBg: Graphics;
  private readonly bossBarFill: Sprite;
  private readonly belchBarBg: Graphics;
  private readonly belchBarFill: Sprite;
  private readonly belchLabel: Label;
  private readonly lineLabels: Record<LineName, Label>;

  private lastScore = -1;
  private lastKills = -1;
  private lastSecond = -1;
  private lastCenter = "";

  constructor() {
    super();

    this.scoreLabel = new Label({
      text: "0",
      style: { fill: PALETTE.drop, fontSize: 26 },
    });
    this.scoreLabel.anchor.set(0, 0);
    this.killsLabel = new Label({
      text: "0 kills",
      style: { fill: PALETTE.skull, fontSize: 13 },
    });
    this.killsLabel.anchor.set(0, 0);
    this.timerLabel = new Label({
      text: "0:00",
      style: { fill: PALETTE.skull, fontSize: 16 },
    });
    this.timerLabel.anchor.set(1, 0);
    this.centerLabel = new Label({
      text: "",
      style: { fill: PALETTE.skull, fontSize: 14, letterSpacing: 4 },
    });
    this.centerLabel.anchor.set(0.5, 0);
    this.pilotLabel = new Label({
      text: "AUTOPILOT",
      style: { fill: PALETTE.enemy, fontSize: 13 },
    });
    this.pilotLabel.anchor.set(1, 0);
    this.pilotLabel.visible = false;

    this.bossBarBg = new Graphics();
    this.bossBarBg
      .roundRect(0, 0, 320, 10, 4)
      .fill({ color: 0xffffff, alpha: 0.12 });
    this.bossBarFill = new Sprite({ texture: Texture.WHITE });
    this.bossBarFill.tint = PALETTE.enemyShot;
    this.bossBarFill.height = 10;
    this.bossBarBg.addChild(this.bossBarFill);
    this.bossBarBg.visible = false;

    this.belchBarBg = new Graphics();
    this.belchBarBg
      .roundRect(0, 0, 320, 12, 4)
      .fill({ color: 0xffffff, alpha: 0.12 });
    this.belchBarFill = new Sprite({ texture: Texture.WHITE });
    this.belchBarFill.tint = PALETTE.graveGlow;
    this.belchBarFill.height = 12;
    this.belchBarBg.addChild(this.belchBarFill);
    this.belchLabel = new Label({
      text: "BELCH",
      style: { fill: PALETTE.skull, fontSize: 11, letterSpacing: 2 },
    });

    this.lineLabels = {
      soul: new Label({
        text: "",
        style: { fill: PALETTE.skull, fontSize: 12 },
      }),
      stone: new Label({
        text: "",
        style: { fill: PALETTE.skull, fontSize: 12 },
      }),
      wisp: new Label({
        text: "",
        style: { fill: PALETTE.skull, fontSize: 12 },
      }),
      bell: new Label({
        text: "",
        style: { fill: PALETTE.skull, fontSize: 12 },
      }),
    };
    for (const line of LINE_NAMES) this.lineLabels[line].anchor.set(0, 1);

    this.addChild(
      this.scoreLabel,
      this.killsLabel,
      this.timerLabel,
      this.centerLabel,
      this.pilotLabel,
      this.bossBarBg,
      this.belchBarBg,
      this.belchLabel,
      ...LINE_NAMES.map((line) => this.lineLabels[line]),
    );
  }

  public updateFrom(sim: Sim, autopilot: boolean): void {
    const p = sim.player;
    if (p.score !== this.lastScore) {
      this.lastScore = p.score;
      this.scoreLabel.text = String(p.score);
    }
    if (sim.kills !== this.lastKills) {
      this.lastKills = sim.kills;
      this.killsLabel.text = `${sim.kills} kills`;
    }
    const second = Math.floor(sim.t);
    if (second !== this.lastSecond) {
      this.lastSecond = second;
      const m = Math.floor(second / 60);
      const s = String(second % 60).padStart(2, "0");
      this.timerLabel.text = `${m}:${s}`;
    }
    this.pilotLabel.visible = autopilot;

    const boss = sim.boss;
    if (boss !== null && boss.entering <= 0) {
      const maxHp =
        boss.kind === "banshee" ? T.BANSHEE_CHUNK_HP : T.UNDERTAKER_CHUNK_HP;
      const name = boss.kind === "banshee" ? "THE BANSHEE" : "THE UNDERTAKER";
      const chunks = boss.chunkIndex === 0 ? "◆◆" : "◆";
      const center = `${name}  ${chunks}`;
      if (center !== this.lastCenter) {
        this.lastCenter = center;
        this.centerLabel.text = center;
        this.centerLabel.style.fill = PALETTE.enemyShot;
      }
      this.bossBarBg.visible = true;
      this.bossBarFill.width = Math.max(0, (boss.chunkHp / maxHp) * 320);
    } else {
      this.bossBarBg.visible = false;
      const center = PHASE_LABEL[sim.phase] ?? "";
      if (center !== this.lastCenter) {
        this.lastCenter = center;
        this.centerLabel.text = center;
        this.centerLabel.style.fill = PALETTE.skull;
      }
    }

    const full = p.reservoir >= T.BELCH_CAP;
    this.belchBarFill.width = (p.reservoir / T.BELCH_CAP) * 320;
    if (full) {
      this.belchBarFill.alpha = 0.6 + 0.4 * Math.sin(sim.t * 10);
      this.belchLabel.text = "BELCH READY · SPACE";
      this.belchLabel.style.fill = PALETTE.graveGlow;
    } else {
      this.belchBarFill.alpha = 1;
      this.belchLabel.text = "BELCH";
      this.belchLabel.style.fill = PALETTE.skull;
    }

    for (const line of LINE_NAMES) {
      const level = p.lines[line];
      const pips = "●".repeat(level) + "○".repeat(T.MAX_LINE_LEVEL - level);
      const label = this.lineLabels[line];
      const text = `${LINE_LABEL[line]} ${pips}`;
      if (label.text !== text) {
        label.text = text;
        label.alpha = level > 0 ? 1 : 0.4;
      }
    }
  }

  public resize(width: number, height: number): void {
    this.scoreLabel.position.set(18, 14);
    this.killsLabel.position.set(18, 46);
    this.timerLabel.position.set(width - 18, 14);
    this.pilotLabel.position.set(width - 18, 38);
    this.centerLabel.position.set(width / 2, 14);
    this.bossBarBg.position.set(width / 2 - 160, 38);
    this.belchBarBg.position.set(width / 2 - 160, height - 44);
    this.belchLabel.position.set(width / 2, height - 22);
    let x = 18;
    for (const line of LINE_NAMES) {
      this.lineLabels[line].position.set(x, height - 18);
      x += 110;
    }
  }
}
