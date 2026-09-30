// The ground under the field: the photographed stand-in ground laid on the
// camera, the per-section dressing that drifts across a boundary, and the
// Waking's own source. It draws into `ground` and adds no layer name (ADR 0014, ADR 0049).

import { Mesh, MeshGeometry, Rectangle, Sprite, Texture } from 'pixi.js';

import {
  fieldOfHeight,
  SHORTEST_FIELD,
  TALLEST_FIELD_HEIGHT,
} from '../../../game/field';
import type { RunState } from '../../../game/run';
import type { SetPiece } from '../../../game/stage/setPiece';
import { SECTIONS } from '../../../game/stage/stage';
import { SCROLL_SPEED } from '../../../game/tuning';
import { PALETTE, PHOTO_TINT } from '../../palette';
import type { Camera, VisibleGround } from './camera';
import { visibleGround } from './camera';
import type { DressingSetName, Stance, StandInArt } from './groundDressing';
import {
  acrossAt,
  artAt,
  DRESSING_BY_SECTION,
  DRESSING_SETS,
  EYE_CELL_PIXELS,
  SOURCE_AWAKE,
  SOURCE_DORMANT,
} from './groundDressing';
import type { GroundGrid, Tile } from './groundMesh';
import { groundGrid, groundGridIndices } from './groundMesh';
import type { Placement } from './groundPlacement';
import { lyingAt, standingAt } from './groundPlacement';
import type { FieldLayers } from './layering';
import { lyingOnPlay } from './playPlacement';
import type { Scene } from './scene';
import { sceneFor } from './scene';

/**
 * How fast a run's ground runs against its field, in ground units a tick: the
 * field's own scroll times the scene's stretch, so what lands on the ground
 * stays where it landed. It is the run's, because the stretch is (T12).
 *
 * Territory is lobbed onto the ground and becomes hands pulling at mobs, so a
 * patch belongs to the ground; it drifts in the sim at `SCROLL_SPEED`
 * (`lines/territory.ts`), the step mobs and corpses take. A ground running at
 * any other rate slides out from under every patch, which is what the slice 13b
 * deploy showed (Mark, 2026-09-08). On the play layer a field unit along is the
 * stretch in ground units (1.224454 on the 760 field, 1.281514 on the 1168
 * one), so a patch on the middle column stays on its ground all the way down
 * only at the sim's scroll times the stretch (tilted view A22).
 */
const groundSpeedOf = (scene: Scene): number =>
  SCROLL_SPEED * scene.playLayer.stretch;

/**
 * The ground the camera lays on the column: a photographed patch of turf and
 * bare earth standing in until the ground's art is made (tilted view T13),
 * repeated plainly because it is seamless, its tile's size in field units, and
 * the night laid over it.
 *
 * The photo is Poly Haven's Forest Ground 01 by Rob Tuytel, its diffuse map
 * resized to 1024 square (https://polyhaven.com/a/forrest_ground_01). A tile
 * of 512 is the prototype's `GROUND_PHOTO_TILE`: at the photo's true scale of
 * about a grave's length its twigs shrink to a mottle, and at 512 they read as
 * twigs, grass and bare earth while the tile still repeats down the leaning
 * ground often enough to carry the lean.
 */
const GROUND_PHOTO = {
  alias: 'standIn/ground/forest-ground.jpg',
  tile: { width: 512, height: 512 } satisfies Tile,
  tint: PHOTO_TINT.groundNight,
} as const;

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
 * How long a piece of dressing takes to fall from the top row of the ground a
 * scene's camera sees to clear of its bottom row. It is the drift window: at a
 * boundary the outgoing set stops being placed and the incoming starts, and
 * both are on screen until the last of the old leaves the bottom edge
 * (decision 22's amendment, Einhänder's answer). No fade, no cut, no card.
 */
const crossingTicks = (scene: Scene): number => {
  const seen = visibleGround(scene.camera, scene.column);
  return Math.ceil(
    (seen.bottom - seen.top + TALLEST_DRESSING_PIXELS * DRESSING_SCALE) /
      groundSpeedOf(scene),
  );
};

/**
 * The drift window on the shortest field, where the dressing's density was
 * authored. A taller field's column shows more ground at the same interval, so
 * it carries more pieces at the same density per unit of ground (A34).
 */
const DRIFT_WINDOW_TICKS = crossingTicks(sceneFor(SHORTEST_FIELD));

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

/**
 * One sprite per placement that can be on screen at once, plus the one
 * arriving, on the tallest field's crossing, so the pool is never short for
 * any run's scene and one built before any run exists never grows.
 */
const DRESSING_SLOTS =
  Math.ceil(
    crossingTicks(sceneFor(fieldOfHeight(TALLEST_FIELD_HEIGHT))) /
      DRESSING_INTERVAL_TICKS,
  ) + 1;

/**
 * Where a piece of dressing draws with its foot at this ground point. Every
 * piece is anchored at its foot, so a standing one rises from it and a lying
 * one reaches up the ground from it.
 */
const placementOf = (
  camera: Camera,
  stance: Stance,
  x: number,
  y: number,
): Placement =>
  stance === 'standing' ? standingAt(camera, x, y, 0) : lyingAt(camera, x, y);

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
 * The ground as a grid laid on the column, each vertex sampling the ground the
 * camera shows it (A9). Its positions never move; only the texture rows do, as
 * the ground scrolls. Held out of the batcher, which would not keep the
 * repeat the texture samples with.
 */
const groundMeshOver = (grid: GroundGrid): Mesh => {
  const geometry = new MeshGeometry({
    positions: grid.positions,
    uvs: grid.uvs,
    indices: groundGridIndices(),
  });
  geometry.batchMode = 'no-batch';
  return new Mesh({ geometry, texture: Texture.EMPTY });
};

/**
 * The photo made ready to lay on the ground: repeated plainly, sampled
 * linearly and mipmapped, the prototype's `loadGroundPhoto`. The mip chain is
 * sized when the texture first reaches the GPU, which is after this, because
 * the mesh is the only thing that draws it. Its style is pushed, because WebGL2
 * binds a sampler cached by the style's id.
 */
const readiedGroundPhoto = (photo: Texture): Texture => {
  const source = photo.source;
  source.style.addressMode = 'repeat';
  source.style.scaleMode = 'linear';
  source.style.update();
  source.autoGenerateMipmaps = true;
  source.updateMipmaps();
  return photo;
};

/**
 * The ground, drawn from the run's own tick. Render only: every sprite's
 * placement is a function of the tick, so a replay rendering a pinned tape at a
 * chosen tick draws the ground the run drew and this renderer holds nothing
 * across frames but its textures.
 */
class BackgroundRenderer {
  /**
   * The run's scene, or the shortest field's before any run is handed in. The
   * ground, the dressing and the source are all drawn through it (A34).
   */
  private scene: Scene = sceneFor(SHORTEST_FIELD);
  // The run's ground speed, set with its scene (A22, T12).
  private groundSpeed = groundSpeedOf(this.scene);
  /** The patch of ground the scene's camera shows its column (A2), which the dressing is laid across. */
  private seen: VisibleGround = visibleGround(
    this.scene.camera,
    this.scene.column,
  );
  /** The grid unscrolled, which every frame's texture rows are read from. */
  private grid = groundGrid(
    this.scene.camera,
    this.scene.column,
    GROUND_PHOTO.tile,
    0,
  );
  private readonly ground = groundMeshOver({
    positions: this.grid.positions,
    uvs: this.grid.uvs.slice(),
  });
  private readonly dressing: Sprite[] = [];
  private readonly sourceRim = new Sprite();
  private readonly source = new Sprite();
  private readonly textures = new Map<string, Texture>();
  private readonly props: BackgroundProps;
  private built = false;

  constructor(props: BackgroundProps) {
    this.props = props;
    this.ground.tint = GROUND_PHOTO.tint;
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

  /**
   * The run about to be drawn's scene. The grid is laid again on its column.
   */
  public useScene(scene: Scene): void {
    this.scene = scene;
    this.groundSpeed = groundSpeedOf(scene);
    this.seen = visibleGround(scene.camera, scene.column);
    this.grid = groundGrid(scene.camera, scene.column, GROUND_PHOTO.tile, 0);
    this.ground.geometry.positions = this.grid.positions;
    this.ground.geometry.uvs = this.grid.uvs.slice();
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
    this.dressGround();
    this.syncGround(run.tick);
    this.syncDressing(run);
    this.syncSource(run.setPiece);
  }

  /**
   * Lays the photo on the ground once its bundle has brought it. Until then
   * the ground is empty for those first frames, the same shape the dressing
   * takes while its art is coming.
   */
  private dressGround(): void {
    if (this.ground.texture !== Texture.EMPTY) return;
    const photo = this.props.standInArt(GROUND_PHOTO.alias);
    if (photo === null) return;
    this.ground.texture = readiedGroundPhoto(photo);
  }

  /**
   * The photo repeats down the ground a tile at a time, so the run's own tick
   * is the whole of where the ground stands: every vertex samples the ground it
   * shows less the scroll, in ground units, so near ground runs faster on the
   * screen than far ground (A9). The scroll is taken within one repeat, which
   * the texture cannot tell apart, so the rows keep their precision on a long
   * run.
   */
  private syncGround(tick: number): void {
    const height = GROUND_PHOTO.tile.height;
    const scrolled = ((tick * this.groundSpeed) % height) / height;
    const rows = this.ground.geometry.uvs;
    const unscrolled = this.grid.uvs;
    for (let at = 1; at < rows.length; at += 2) {
      rows[at] = (unscrolled[at] ?? 0) - scrolled;
    }
    this.ground.geometry.getBuffer('aUV').update();
  }

  /**
   * Every placement that can be on screen, newest first. A slot draws the
   * placement that many intervals back, so which sprite carries which
   * placement follows the tick and nothing is carried between frames.
   */
  private syncDressing(run: RunState): void {
    const newest = Math.floor(run.tick / DRESSING_INTERVAL_TICKS);
    for (let slot = 0; slot < this.dressing.length; slot++) {
      const sprite = this.dressing[slot];
      if (sprite === undefined)
        throw new Error(`no dressing sprite at slot ${slot}`);
      this.placeDressing(sprite, run, newest - slot);
    }
  }

  private placeDressing(sprite: Sprite, run: RunState, index: number): void {
    const fallen =
      (run.tick - index * DRESSING_INTERVAL_TICKS) * this.groundSpeed;
    const set = DRESSING_SETS[this.dressingFor(run, index)];
    const art = artAt(set, index);
    const texture = this.textureFor(art);
    if (texture === null) {
      sprite.visible = false;
      return;
    }
    const width = texture.frame.width * DRESSING_SCALE;
    const height = texture.frame.height * DRESSING_SCALE;
    const seen = this.seen;
    sprite.visible = fallen - height <= seen.bottom - seen.top;
    if (!sprite.visible) return;
    if (sprite.texture !== texture) sprite.texture = texture;
    sprite.tint = set.tint.hex;
    // Laid across the far row, where it is placed, so the far corners the
    // camera sees are dressed too (A4's rule for anything spread across).
    const farWidth = seen.farRight - seen.farLeft;
    const at = placementOf(
      this.scene.camera,
      art.stance,
      seen.farLeft + width / 2 + acrossAt(index) * (farWidth - width),
      seen.top + fallen,
    );
    sprite.setSize(width * at.scaleX, height * at.scaleY);
    sprite.position.set(at.x, at.y);
  }

  /**
   * Which set a placement wears: the one being placed now if it was placed
   * inside this section, and the section before it otherwise, which is the drift.
   *
   * A run opens already inside its first section, so the ground the run starts
   * on is dressed by placements older than the run and every one of them wears
   * the first section's own set.
   */
  private dressingFor(run: RunState, index: number): DressingSetName {
    const at = run.stage.sectionIndex;
    const placed = index * DRESSING_INTERVAL_TICKS;
    const section =
      SECTIONS[
        at === 0 || run.tick - placed <= run.stage.sectionTick ? at : at - 1
      ];
    if (section === undefined) throw new Error(`no section at index ${at}`);
    return DRESSING_BY_SECTION[section.name];
  }

  private syncSource(setPiece: SetPiece | null): void {
    // A killed source keeps pouring with nothing left on the ground to draw
    // (#104), and the record says so itself: the view never reads the health.
    const standing = setPiece !== null && !setPiece.bodyGone;
    const art = setPiece?.open === true ? SOURCE_AWAKE : SOURCE_DORMANT;
    const texture = standing ? this.textureFor(art) : null;
    this.source.visible = texture !== null;
    this.sourceRim.visible = texture !== null;
    if (texture === null || setPiece === null) return;
    const width = EYE_CELL_PIXELS * DRESSING_SCALE * SOURCE_SIZE_MULTIPLE;
    const height = (width * texture.frame.height) / texture.frame.width;
    if (this.source.texture !== texture) this.source.texture = texture;
    if (this.sourceRim.texture !== texture) this.sourceRim.texture = texture;
    // The source is a sim thing, so it lies at its play point (A7, A19).
    const at = lyingOnPlay(this.scene.playLayer, setPiece.x, setPiece.y);
    this.source.setSize(width * at.scaleX, height * at.scaleY);
    this.sourceRim.setSize(
      (width + 2 * SOURCE_RIM) * at.scaleX,
      (height + 2 * SOURCE_RIM) * at.scaleY,
    );
    this.source.position.set(at.x, at.y);
    this.sourceRim.position.set(at.x, at.y);
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
};
export type { BackgroundProps };
