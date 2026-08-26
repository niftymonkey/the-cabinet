import type { Ticker } from 'pixi.js';
import { Container, Graphics } from 'pixi.js';

import type { SimEvent } from '../../game/events';
import type { RunState } from '../../game/run';
import { RESERVOIR_CAPACITY } from '../../game/tuning';
import type { FieldPlacement } from '../layout';
import { DEGENERATE_PLACEMENT, fitField, READOUT_RESERVE } from '../layout';
import { atFromUrl, tapeFromUrl } from '../seedFromUrl';
import { Button } from '../ui/Button';
import { boundaryReadout, fieldClip } from './game/fieldFrame';
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
  private readonly fieldRenderer = new FieldRenderer();
  private readonly stormRenderer = new StormRenderer();
  private readonly readout = createReplayReadout();
  private readonly session = createTapePlaybackSession();
  private readonly backButton: Button;

  private placement: FieldPlacement = DEGENERATE_PLACEMENT;

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
    });
    this.backButton.onPress.connect(() => {
      // The router in main.ts observes the hash and shows the title screen.
      window.location.hash = '#/';
    });

    this.addChild(this.field, this.readout.view, this.backButton);
  }

  // The field's own furniture, put back after any clear() (see reset).
  private dressField(): void {
    this.layers.layer('fieldBoundary').addChild(this.frame);
    this.fieldRenderer.attach(this.layers);
    this.stormRenderer.attach(this.layers);
    this.grave.attach(this.layers);
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
    this.session.reset();
    this.readout.render(this.session.lines);
    this.layers.clear();
    this.dressField();
  }

  public update(ticker: Ticker): void {
    const frame = this.session.advance(ticker.elapsedMS);
    if (frame.forgetPreviousRun) {
      this.fieldRenderer.forgetPreviousRun();
      this.stormRenderer.forgetPreviousRun();
    }
    if (frame.run !== null) this.syncScreen(frame.run, frame.events);
    this.readout.render(this.session.lines);
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
      if (event.type === 'belched') this.stormRenderer.erupt(run);
      if (event.type === 'splashed') this.stormRenderer.splashed(run);
    }
    this.grave.sync(run.grave, run.reservoir / RESERVOIR_CAPACITY, run.tick);
    this.fieldRenderer.sync(run);
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
