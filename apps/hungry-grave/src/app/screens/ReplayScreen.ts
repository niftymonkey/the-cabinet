import type { Texture, Ticker } from 'pixi.js';
import { Container, Graphics } from 'pixi.js';

import type { Caps } from '../../game/caps';
import { capsFor } from '../../game/caps';
import type { SimEvent } from '../../game/events';
import type { RunState } from '../../game/run';
import { DEFAULT_TUNING } from '../../game/tuningRecord';
import type { FieldPlacement } from '../layout';
import { DEGENERATE_PLACEMENT, fitField, READOUT_RESERVE } from '../layout';
import { atFromUrl, tapeFromUrl } from '../seedFromUrl';
import type { ButtonChrome } from '../ui/Button';
import { Button } from '../ui/Button';
import { BackgroundRenderer } from './game/BackgroundRenderer';
import { BossRenderer } from './game/BossRenderer';
import { ENDING_SCENE_MS } from './game/endingScene';
import { EndingSceneRenderer } from './game/EndingSceneRenderer';
import { boundaryReadout, fieldClip } from './game/fieldFrame';
import { FallRenderer } from './game/FallRenderer';
import { FieldRenderer } from './game/FieldRenderer';
import { GraveRenderer } from './game/GraveRenderer';
import { FieldLayers } from './game/layering';
import { StormRenderer } from './game/StormRenderer';
import { createReplayReadout } from './replayReadout';
import { createTapePlaybackSession } from './tapePlaybackSession';

/**
 * The instrument replay route (ADR 0020): a kept or fetched tape rendered at a
 * chosen tick, honestly primed, bounded by the last verified checkpoint.
 *
 * It never grows player features, and the reserved player route #/watch stays
 * unbuilt: a player-facing feature must not later be built on a debug URL.
 * Watching is also silent for the same reason; the game screen's sound
 * subscription is a play feature and is deliberately not copied here.
 */

// The back button's size, the pause button's own.
const BACK_WIDTH = 132;
const BACK_HEIGHT = 68;

/** The one way off the replay screen, owned by the driver in main.ts. */
interface ReplayScreenProps extends ButtonChrome {
  onBack(): void;
  /**
   * A stand-in texture, or null while its bundle is still coming. The replay
   * takes it for the reason the game screen does: a renderer wired into one of
   * the two dressField sites and not the other is how a renderer ships unseen.
   */
  standInArt(alias: string): Texture | null;
}

/**
 * The screen a tape replays on. Render only: it wires the session that drives
 * the one playback loop to the renderers and the readout that show it, and
 * holds no game rules and no player input.
 */
class ReplayScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ['main'];

  private readonly field: Container;
  private readonly layers: FieldLayers;
  // The boundary readout, held rather than rebuilt (reset() empties the layers).
  private readonly frame: Graphics;
  // The field's clip: a mask is not a layer, so it is built once and survives clear().
  private readonly clip: Graphics;
  private readonly grave = new GraveRenderer();
  // The lookup is read at sync time, so props being set after construction is safe.
  private readonly background = new BackgroundRenderer({
    standInArt: (alias) => this.props.standInArt(alias),
  });
  private readonly fieldRenderer = new FieldRenderer();
  /**
   * The food on its way into the hole, wired into this screen as well as the
   * live one: a renderer wired into one of the two dressField sites and not the
   * other is how a renderer ships unseen, and the lead-in's whole promise is
   * that a replay shows what the run showed (design record R5).
   */
  private readonly falls = new FallRenderer();
  /**
   * The Undertaker's end, wired in here as well as into the live screen. A
   * replay has no way out to hold, so it plays the scene where it stands, on
   * its own frame clock, past the tape's own end (design record R6).
   */
  private readonly scene = new EndingSceneRenderer();
  private readonly bossRenderer = new BossRenderer();
  private readonly stormRenderer = new StormRenderer();
  private readonly readout = createReplayReadout();
  private readonly session = createTapePlaybackSession();
  private readonly backButton: Button;

  private placement: FieldPlacement = DEGENERATE_PLACEMENT;
  /**
   * How much of the ending scene this showing has played, in milliseconds, or
   * null while no death has begun one. It is this screen's own two-line clock
   * rather than a shared one: the live screen's hold is a way out being held
   * back, and this screen has no way out at all.
   */
  private sceneMs: number | null = null;
  /**
   * The powers this showing was handed. The pool calls init() before the screen
   * reaches the stage, so it is set before the back button can be pressed.
   */
  private props!: ReplayScreenProps;

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

    this.backButton = new Button({
      text: 'BACK',
      width: BACK_WIDTH,
      height: BACK_HEIGHT,
      fontSize: 18,
      playSound: (alias) => this.props.playButtonSound(alias),
    });
    this.backButton.onPress.connect(() => this.props.onBack());

    this.addChild(this.field, this.readout.view, this.backButton);
  }

  /**
   * The caps this screen dresses its field at.
   *
   * dressField runs from the constructor and from reset(), with no run in hand
   * either time, so the caps a run under the build's own record derives are
   * what the sprite pools open at. A replayed tape carries the record it was
   * played under (FORMAT_VERSION 5) and its caps can sit above these, which is
   * what beginDrawing below is for: the pools are grow-only and attach is the
   * one place they grow.
   */
  private fieldCaps(): Caps {
    return capsFor(DEFAULT_TUNING);
  }

  // The field's own furniture, put back after any clear() (see reset).
  private dressField(): void {
    this.layers.layer('fieldBoundary').addChild(this.frame);
    this.background.attach(this.layers);
    this.fieldRenderer.attach(this.layers, this.fieldCaps());
    // After the mob pool, so a boss draws over the adds it summons.
    this.bossRenderer.attach(this.layers);
    this.stormRenderer.attach(this.layers);
    this.grave.attach(this.layers);
    // After the grave, because the container the falls draw into is its child.
    this.falls.attach(this.grave.falls, this.fieldCaps());
    this.scene.attach(this.layers, this.grave.falls);
  }

  public init(props: ReplayScreenProps): void {
    this.props = props;
  }

  public prepare(): void {
    // The engine takes this screen's children away on the way out and only
    // gives them back to a screen that declares show(); without this the back
    // button is dead on every showing after the first.
    this.interactiveChildren = true;
    // A pooled showing's renderers still wear the previous tape's frame until
    // the first sync, and a showing that refuses never syncs; hide the field
    // until the first real frame reveals it (syncScreen).
    this.field.visible = false;
    const search = window.location.search;
    const hash = window.location.hash;
    this.session.begin(tapeFromUrl(search, hash), atFromUrl(search, hash) ?? 0);
    this.readout.render(this.session.lines);
  }

  public reset(): void {
    this.sceneMs = null;
    this.session.reset();
    this.readout.render(this.session.lines);
    this.layers.clear();
    this.dressField();
  }

  public update(ticker: Ticker): void {
    // Before the playback, so a scene that begins on this frame opens on its first frame, as it does live.
    this.runScene(ticker.elapsedMS);
    const frame = this.session.advance(ticker.elapsedMS);
    if (frame.forgetPreviousRun) this.beginDrawing(frame.run);
    if (frame.run !== null) this.syncScreen(frame.run, frame.events);
    this.readout.render(this.session.lines);
  }

  /**
   * The ending scene, advanced on the frame clock and left on its last frame.
   *
   * It runs past the last tick the tape can verify, because the scene is
   * drawing rather than playback: the run it belongs to ended on the tick the
   * death was verified at, and nothing after that is claimed to be the run.
   */
  private runScene(elapsedMs: number): void {
    if (this.sceneMs === null) return;
    this.sceneMs = Math.min(this.sceneMs + elapsedMs, ENDING_SCENE_MS);
    const progress = this.sceneMs / ENDING_SCENE_MS;
    this.scene.show(progress);
    this.fieldRenderer.fadeForEnding(progress);
  }

  /**
   * The renderers put back for the run about to be drawn.
   *
   * The field renderer goes through attach rather than forgetPreviousRun alone,
   * because the run this screen is about to draw is the tape's and not this
   * build's: a tape carries the tuning record it was played under, its caps are
   * derived from that record (ADR 0056 as amended), and the sprite pools this
   * screen dressed with have no reason to reach them. attach is the one place a
   * pool grows and it forgets the previous run on its way through, so the slot
   * walk in the first sync finds a sprite for every entity the run can hold.
   */
  private beginDrawing(run: RunState | null): void {
    if (run === null) this.fieldRenderer.forgetPreviousRun();
    else this.fieldRenderer.attach(this.layers, run.caps);
    if (run === null) this.falls.forgetPreviousRun();
    else this.falls.attach(this.grave.falls, run.caps);
    this.stormRenderer.forgetPreviousRun();
    this.scene.forgetPreviousRun();
    this.sceneMs = null;
  }

  /**
   * Everything on the field, from the reproduced run, through the same
   * renderers the live game draws with. The frame's buffered events are
   * announced first, per frame rather than per tick, exactly as the game screen
   * delivers them.
   */
  private syncScreen(run: RunState, events: readonly SimEvent[]): void {
    this.field.visible = true;
    for (const event of events) {
      if (event.type === 'swallowed') this.falls.swallowed(run, event);
      if (event.type === 'belched') this.stormRenderer.erupt(run);
      if (event.type === 'splashed') this.stormRenderer.splashed(run);
      // The Undertaker's end, mirrored from GameScreen.announce for the same
      // reason the strip's blow-up is: a replay shows what the run showed.
      if (event.type === 'bossKilled' && this.scene.begin(event, run.grave)) {
        this.sceneMs = 0;
      }
      // The weapon strip's blow-up, mirrored from GameScreen.announce: wired
      // into the live screen alone it would simply not play on a replay, and
      // the lead-in's whole promise is that a replay shows what the run showed
      // (#58). The loss the live screen watches for is not mirrored, because
      // its product is a HUD reading and this screen carries no HUD.
      if (event.type === 'weaponStripped') {
        this.stormRenderer.weaponStripped(run, event.lines);
      }
    }
    this.grave.sync(run.grave);
    this.background.sync(run);
    this.fieldRenderer.sync(run);
    this.falls.sync(run);
    this.bossRenderer.sync(run);
    this.stormRenderer.sync(run);
  }

  public resize(width: number, height: number): void {
    this.placement = fitField(width, height, READOUT_RESERVE);
    this.field.position.set(this.placement.offsetX, this.placement.offsetY);
    this.field.scale.set(this.placement.scale);
    this.readout.resize(width, height);
    this.backButton.position.set(
      width - READOUT_RESERVE.margin - BACK_WIDTH / 2,
      READOUT_RESERVE.margin + BACK_HEIGHT / 2,
    );
  }
}

export { ReplayScreen };
