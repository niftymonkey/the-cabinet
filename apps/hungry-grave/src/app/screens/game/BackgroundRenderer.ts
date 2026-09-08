// The ground under the field: the floor it is laid from, the per-section
// dressing that drifts across a boundary, and the Waking's own source. It draws
// into `ground` and adds no layer name (ADR 0014, ADR 0049).

import { Rectangle, Sprite, Texture, TilingSprite } from 'pixi.js';

import { FIELD_HEIGHT, FIELD_WIDTH } from '../../../game/field';
import type { RunState } from '../../../game/run';
import type { SetPiece } from '../../../game/stage/setPiece';
import { PHASES } from '../../../game/stage/stage';
import { SCROLL_SPEED } from '../../../game/tuning';
import { PALETTE } from '../../palette';
import type { DressingSetName, StandInArt } from './groundDressing';
import {
  acrossAt,
  artAt,
  DRESSING_BY_PHASE,
  DRESSING_SETS,
  EYE_CELL_PIXELS,
  GROUND_FLOOR,
  GROUND_TINT,
  SOURCE_AWAKE,
  SOURCE_DORMANT,
} from './groundDressing';
import type { FieldLayers } from './layering';

/**
 * How fast the ground runs against the field: the field's own scroll, so what
 * lands on the ground stays where it landed.
 *
 * Territory is lobbed onto the ground and becomes hands pulling at mobs, so a
 * patch belongs to the ground; it drifts in the sim at `SCROLL_SPEED`
 * (`lines/territory.ts`), the step mobs and corpses take. A ground running at
 * any other rate slides out from under every patch, which is what the slice 13b
 * deploy showed (Mark, 2026-09-08).
 */
const GROUND_SPEED = SCROLL_SPEED;

/**
 * How many times the dressing eyes' footprint the Waking's source draws at.
 *
 * The source takes the Crowd's colour family on purpose, so size is the whole
 * of the stand-in answer to which eye is going to wake (design record section
 * 7). Initial row, marked stand-in.
 */
const SOURCE_SIZE_MULTIPLE = 3;

/**
 * How many field units one texture pixel draws as. Initial row, marked
 * stand-in.
 *
 * It is a row and not a derivation, so the two ends it was chosen to meet are
 * assertions rather than arithmetic: at 1.875 the Crowd's 16-pixel eye cell
 * draws at 30 units, and three of those is the 90 the source's own hitbox is
 * across, so the storm hits what a player sees. A test holds both, and moving
 * this or the hitbox turns it red rather than quietly agreeing with itself.
 */
const DRESSING_SCALE = 1.875;

/** The tallest staged piece, the cliff, in its own pixels. */
const TALLEST_DRESSING_PIXELS = 112;

/**
 * How long a piece of dressing takes to fall from the top edge to clear of the
 * bottom one. It is the drift window: at a boundary the outgoing set stops
 * being placed and the incoming starts, and both are on screen until the last
 * of the old leaves the bottom edge (decision 22's amendment, Einhänder's
 * answer). No fade, no cut, no card.
 */
const DRIFT_WINDOW_TICKS = Math.ceil(
  (FIELD_HEIGHT + TALLEST_DRESSING_PIXELS * DRESSING_SCALE) / GROUND_SPEED,
);

/**
 * How many placements are in flight at once, which is the density the ground is
 * authored at. Initial row, marked stand-in: Mark asked for a field carrying
 * about two and a half to three times what slice 13b showed (2026-09-08).
 *
 * The density is the row and the interval falls out of it and the crossing,
 * never the other way round: the crossing halved when the ground took the
 * field's own scroll, and an interval held fixed would have halved the dressing
 * with it without anything saying so.
 *
 * What is drawn runs a few under this. The crossing is the tallest piece's, and
 * a short piece leaves the bottom edge that much earlier.
 */
const DRESSING_ON_SCREEN = 30;
const DRESSING_INTERVAL_TICKS = Math.round(
  DRIFT_WINDOW_TICKS / DRESSING_ON_SCREEN,
);

/** One sprite per placement that can be on screen at once, plus the one arriving. */
const DRESSING_SLOTS =
  Math.ceil(DRIFT_WINDOW_TICKS / DRESSING_INTERVAL_TICKS) + 1;

/** How far the source's dark companion stands out past its body, in field units. */
const SOURCE_RIM = 3;

/**
 * What the ground cannot reach on its own. The stand-in bundle is background
 * loaded and no screen declares it, so a texture can be missing for the first
 * frames of a run and the answer is null rather than a throw: the ground
 * arrives late instead of never, which is the shape the section music already
 * takes.
 */
interface BackgroundProps {
  standInArt(alias: string): Texture | null;
}

/**
 * The ground, drawn from the run's own tick. Render only: every sprite's
 * placement is a function of the tick, so a replay rendering a pinned tape at a
 * chosen tick draws the ground the run drew and this renderer holds nothing
 * across frames but its textures.
 */
class BackgroundRenderer {
  private readonly ground = new TilingSprite({
    texture: Texture.EMPTY,
    width: FIELD_WIDTH,
    height: FIELD_HEIGHT,
  });
  private readonly dressing: Sprite[] = [];
  private readonly sourceRim = new Sprite();
  private readonly source = new Sprite();
  private readonly textures = new Map<string, Texture>();
  private readonly props: BackgroundProps;
  private built = false;

  constructor(props: BackgroundProps) {
    this.props = props;
    this.ground.tint = GROUND_TINT.hex;
    // The floor draws at the same pixel size as everything else on this layer,
    // or the ground is pixel art at two scales in one picture.
    this.ground.tileScale.set(DRESSING_SCALE);
    this.sourceRim.tint = PALETTE.standInWakingDark.hex;
    this.source.tint = PALETTE.standInWaking.hex;
    for (const sprite of [this.sourceRim, this.source]) {
      sprite.anchor.set(0.5, 0.5);
      sprite.visible = false;
    }
  }

  /**
   * Puts every sprite into `ground`, the one layer this renderer draws in.
   * FieldLayers.clear() empties every layer between runs, so the renderer has
   * to be able to put itself back rather than assume it is still attached.
   */
  public attach(layers: FieldLayers): void {
    this.build();
    const ground = layers.layer('ground');
    ground.addChild(this.ground);
    for (const sprite of this.dressing) ground.addChild(sprite);
    ground.addChild(this.sourceRim, this.source);
  }

  // The dressing pool, allocated once, so a placement never allocates.
  private build(): void {
    if (this.built) return;
    this.built = true;
    while (this.dressing.length < DRESSING_SLOTS) {
      const sprite = new Sprite();
      // Bottom centre, so a placement's y is how far it has fallen and a piece
      // enters with its foot on the top edge.
      sprite.anchor.set(0.5, 1);
      sprite.visible = false;
      this.dressing.push(sprite);
    }
  }

  // The ground as the run's own tick says it is.
  public sync(run: RunState): void {
    this.syncGround(run.tick);
    this.syncDressing(run);
    this.syncSource(run.setPiece);
  }

  private syncGround(tick: number): void {
    const floor = this.textureFor(GROUND_FLOOR);
    if (floor !== null && this.ground.texture !== floor) {
      this.ground.texture = floor;
    }
    this.ground.tilePosition.y = tick * GROUND_SPEED;
  }

  /**
   * Every placement that can be on screen, newest first. A slot draws the
   * placement that many intervals back, so which sprite carries which
   * placement follows the tick and nothing is carried between frames.
   */
  private syncDressing(run: RunState): void {
    const newest = Math.floor(run.tick / DRESSING_INTERVAL_TICKS);
    for (let slot = 0; slot < this.dressing.length; slot++) {
      this.placeDressing(this.dressing[slot], run, newest - slot);
    }
  }

  private placeDressing(sprite: Sprite, run: RunState, index: number): void {
    const fallen = (run.tick - index * DRESSING_INTERVAL_TICKS) * GROUND_SPEED;
    const set = DRESSING_SETS[this.dressingFor(run, index)];
    const texture = this.textureFor(artAt(set, index));
    if (texture === null) {
      sprite.visible = false;
      return;
    }
    const width = texture.frame.width * DRESSING_SCALE;
    const height = texture.frame.height * DRESSING_SCALE;
    sprite.visible = fallen - height <= FIELD_HEIGHT;
    if (!sprite.visible) return;
    if (sprite.texture !== texture) sprite.texture = texture;
    sprite.tint = set.tint.hex;
    sprite.setSize(width, height);
    sprite.position.set(
      width / 2 + acrossAt(index) * (FIELD_WIDTH - width),
      fallen,
    );
  }

  /**
   * Which set a placement wears: the one being placed now if it was placed
   * inside this phase, and the phase before it otherwise, which is the drift.
   *
   * A run opens already inside its first phase, so the ground the run starts
   * on is dressed by placements older than the run and every one of them wears
   * the first section's own set.
   */
  private dressingFor(run: RunState, index: number): DressingSetName {
    const at = run.stage.phaseIndex;
    const placed = index * DRESSING_INTERVAL_TICKS;
    if (at === 0 || run.tick - placed <= run.stage.phaseTick) {
      return DRESSING_BY_PHASE[PHASES[at].name];
    }
    return DRESSING_BY_PHASE[PHASES[at - 1].name];
  }

  private syncSource(setPiece: SetPiece | null): void {
    const art = setPiece?.open === true ? SOURCE_AWAKE : SOURCE_DORMANT;
    const texture = setPiece === null ? null : this.textureFor(art);
    this.source.visible = texture !== null;
    this.sourceRim.visible = texture !== null;
    if (texture === null || setPiece === null) return;
    const width = EYE_CELL_PIXELS * DRESSING_SCALE * SOURCE_SIZE_MULTIPLE;
    const height = (width * texture.frame.height) / texture.frame.width;
    if (this.source.texture !== texture) this.source.texture = texture;
    if (this.sourceRim.texture !== texture) this.sourceRim.texture = texture;
    this.source.setSize(width, height);
    this.sourceRim.setSize(width + 2 * SOURCE_RIM, height + 2 * SOURCE_RIM);
    this.source.position.set(setPiece.x, setPiece.y);
    this.sourceRim.position.set(setPiece.x, setPiece.y);
  }

  /**
   * One piece of art as a texture, or null while its bundle is still coming.
   *
   * Nearest-neighbour is set here, per texture, and never as a global default:
   * the existing UI art is not pixel art and a default would harden its edges
   * while softening nothing useful (design record section 7).
   */
  private textureFor(art: StandInArt): Texture | null {
    const cell =
      art.cell === null
        ? 'whole'
        : `${art.cell.x},${art.cell.y},${art.cell.width},${art.cell.height}`;
    const key = `${art.alias}#${cell}`;
    const held = this.textures.get(key);
    if (held !== undefined) return held;
    const loaded = this.props.standInArt(art.alias);
    if (loaded === null) return null;
    loaded.source.scaleMode = 'nearest';
    const texture =
      art.cell === null
        ? loaded
        : new Texture({
            source: loaded.source,
            frame: new Rectangle(
              art.cell.x,
              art.cell.y,
              art.cell.width,
              art.cell.height,
            ),
          });
    this.textures.set(key, texture);
    return texture;
  }
}

export {
  BackgroundRenderer,
  DRESSING_INTERVAL_TICKS,
  DRESSING_ON_SCREEN,
  DRIFT_WINDOW_TICKS,
  GROUND_SPEED,
};
export type { BackgroundProps };
