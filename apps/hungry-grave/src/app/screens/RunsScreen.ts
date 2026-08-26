import { Container } from 'pixi.js';

import { TapeFormatError } from '../../tape/bytes';
import { decodeTape } from '../../tape/decode';
import { MENU } from '../palette';
import { REPLAY_HASH } from '../routes';
import { saveTapeFile, tapeFileName } from '../tapeExport';
import type { TapeStore } from '../tapeStore';
import { openTapeStore } from '../tapeStore';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import type { RunList } from './runList';
import { createRunList } from './runList';

/**
 * The recent runs this browser's tape store kept (#58), each offering
 * open-in-replay, save-file and delete. It is the driver over the dumb list in
 * runList.ts: it owns the store, the loading and the refresh, and the list
 * only renders rows and signals intent back.
 *
 * It lives here rather than under a route the game grows into: like #/replay
 * beside it, it is the instrument's surface, and the reserved player route
 * #/watch stays unbuilt (ADR 0020).
 */

const STORE_UNAVAILABLE =
  'THE TAPE STORE IS UNAVAILABLE IN THIS BROWSER, SO NO RUNS ARE KEPT HERE.';

const NO_RUNS = 'NO RUNS KEPT YET.';

const TAPE_MISSING = "THAT RUN'S TAPE COULD NOT BE LOADED FROM THE STORE.";

/** The back button's size, the pause button's own. */
const BACK_WIDTH = 132;
const BACK_HEIGHT = 68;

class RunsScreen extends Container {
  // Assets bundles required by this screen
  public static assetBundles = ['main'];

  private readonly title: Label;
  /** Store-unavailable, an empty store, and a load that came back empty: facts, stated. */
  private readonly statement: Label;
  private readonly list: RunList;
  private readonly backButton: Button;

  /**
   * The store connection, deliberately not per-showing: opening IndexedDB is
   * async and once per screen life, and a null resolution is the designed
   * store-unavailable state. Not cleared in reset() because it holds no
   * per-showing state at all.
   */
  private store: Promise<TapeStore | null> | null = null;
  /**
   * Which prepare() the in-flight async work belongs to. This screen is
   * pooled, and a list that resolves after reset() must not dress a later
   * showing with an earlier one's rows.
   */
  private generation = 0;

  constructor() {
    super();

    this.title = new Label({
      text: 'RUNS',
      style: { fill: MENU.menuInk.hex, fontSize: 44, letterSpacing: 8 },
    });
    this.statement = new Label({
      style: { fill: MENU.menuDim.hex, fontSize: 16, wordWrap: true },
    });
    this.list = createRunList({
      open: (runId) => void this.openInReplay(runId),
      save: (runId) => void this.saveFile(runId),
      remove: (runId) => void this.deleteRun(runId),
    });
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

    this.addChild(this.title, this.statement, this.list.view, this.backButton);
  }

  public prepare(): void {
    this.generation += 1;
    // The engine takes this screen's children away on the way out and only
    // gives them back to a screen that declares show(); without this every
    // button is dead on every showing after the first.
    this.interactiveChildren = true;
    this.statement.text = '';
    this.list.render([]);
    this.store ??= openTapeStore();
    void this.refresh(this.generation);
  }

  public reset(): void {
    this.generation += 1;
    this.statement.text = '';
    this.list.render([]);
  }

  private async openedStore(): Promise<TapeStore | null> {
    return this.store === null ? null : await this.store;
  }

  private async refresh(generation: number): Promise<void> {
    const store = await this.openedStore();
    if (generation !== this.generation) return;
    if (store === null) {
      this.statement.text = STORE_UNAVAILABLE;
      return;
    }
    const rows = await store.list();
    if (generation !== this.generation) return;
    this.list.render(rows);
    this.statement.text = rows.length === 0 ? NO_RUNS : '';
  }

  private async loadedTape(runId: string): Promise<Uint8Array | null> {
    const store = await this.openedStore();
    if (store === null) return null;
    return await store.load(runId);
  }

  /**
   * The kept run, opened in the replay route by the same path any later tape
   * source uses: a URL the replay screen fetches, with where the bytes came
   * from not its business (#58).
   *
   * The blob URL is deliberately never revoked here. The replay hash keeps
   * pointing at it, so the browser's back and forward buttons can re-enter the
   * replay route and fetch it again; the URL dies with the document either
   * way.
   */
  private async openInReplay(runId: string): Promise<void> {
    const generation = this.generation;
    const bytes = await this.loadedTape(runId);
    if (generation !== this.generation) return;
    if (bytes === null) {
      this.statement.text = TAPE_MISSING;
      return;
    }
    const url = URL.createObjectURL(
      new Blob([bytes], { type: 'application/octet-stream' }),
    );
    window.location.hash = `${REPLAY_HASH}?tape=${encodeURIComponent(url)}`;
  }

  /**
   * The kept run as a file, named from the tape's own header rather than this
   * build's constants: an old tape carries its own seed and commit, and a name
   * wearing today's commit would misfile it.
   *
   * The store load resolves inside the tap's transient activation window, so
   * the download still counts as gesture-driven where that matters (the
   * researched iOS constraint tapeExport.ts records).
   */
  private async saveFile(runId: string): Promise<void> {
    const generation = this.generation;
    const bytes = await this.loadedTape(runId);
    if (generation !== this.generation) return;
    if (bytes === null) {
      this.statement.text = TAPE_MISSING;
      return;
    }
    try {
      const { tape } = decodeTape(bytes);
      saveTapeFile(
        bytes,
        tapeFileName(tape.header.seed, tape.header.commitHash),
      );
    } catch (error) {
      // A stored tape that does not decode is stated, not thrown: the store's
      // bytes are an external artifact here. Anything else is a bug and flies.
      if (!(error instanceof TapeFormatError)) throw error;
      this.statement.text = `THAT RUN'S TAPE DOES NOT DECODE: ${error.message}`;
    }
  }

  private async deleteRun(runId: string): Promise<void> {
    const generation = this.generation;
    const store = await this.openedStore();
    if (store === null || generation !== this.generation) return;
    await store.delete(runId);
    if (generation !== this.generation) return;
    void this.refresh(this.generation);
  }

  public resize(width: number, height: number): void {
    const cx = width / 2;
    this.title.position.set(cx, height * 0.1);
    this.statement.position.set(cx, height * 0.2);
    this.statement.style.wordWrapWidth = Math.min(width - 64, 520);
    this.list.view.position.set(cx, height * 0.28);
    this.backButton.position.set(cx, height * 0.9);
  }
}

export { RunsScreen };
