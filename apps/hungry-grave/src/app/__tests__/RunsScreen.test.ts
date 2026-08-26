/**
 * The runs screen (#58): recent runs listed from the tape store, each offering
 * open-in-replay, save-file and delete, with store-unavailable stated as a
 * fact rather than an error.
 */

import { Container } from 'pixi.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** The real widgets need a renderer: text metrics and a loaded texture. */
vi.mock('../ui/Label', () => ({
  Label: class extends Container {
    public text: string;
    public anchor = { set: () => {} };
    public style: Record<string, unknown> = {};
    constructor(options: { text?: string } = {}) {
      super();
      this.text = options.text ?? '';
    }
  },
}));

vi.mock('../ui/Button', () => ({
  Button: class extends Container {
    public press: () => void = () => {};
    public readonly text: string;
    public onPress = {
      connect: (handler: () => void) => {
        this.press = handler;
      },
    };
    constructor(options: { text?: string } = {}) {
      super();
      this.text = options.text ?? '';
    }
  },
}));

const { openTapeStore } = vi.hoisted(() => ({ openTapeStore: vi.fn() }));

vi.mock('../tapeStore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../tapeStore')>()),
  openTapeStore,
}));

const { saveTapeFile } = vi.hoisted(() => ({ saveTapeFile: vi.fn() }));

/** The browser download seam is stubbed; the file name stays the real one. */
vi.mock('../tapeExport', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../tapeExport')>()),
  saveTapeFile,
}));

import { createExecution, executeTick } from '../../game/execution';
import { createRun } from '../../game/run';
import type { RunState } from '../../game/run';
import { WITNESS_VERSION } from '../../game/witness';
import { encodeTape } from '../../tape/encode';
import { recordInto, sealTrailer, tapeOf } from '../../tape/recorder';
import type { TapeHeader } from '../../tape/tape';
import { RECORDER_CHECKPOINT_SPACING } from '../../tape/tape';
import { tapeFileName } from '../tapeExport';
import type { StoredRunSummary, TapeStore } from '../tapeStore';
import { RunsScreen } from '../screens/RunsScreen';

const fakeLocation = { search: '', hash: '' };

Object.defineProperty(globalThis, 'window', {
  value: { location: fakeLocation },
  configurable: true,
});

function headerFor(run: RunState): TapeHeader {
  return {
    seed: run.seed,
    startingSize: run.grave.size,
    startingLevels: { ...run.levels },
    tickRate: 60,
    checkpointSpacing: RECORDER_CHECKPOINT_SPACING,
    witnessVersion: WITNESS_VERSION,
    commitHash: 'test-commit',
    buildIdentity: '',
    author: 'test',
    inputDevice: 'script',
    keyboardSpeed: 1,
    rendererBackend: 'test',
    rendererResolution: 1,
    devicePixelRatio: 1,
    recordedAt: 0,
  };
}

/** A short real tape, so the save path can decode a name out of the bytes. */
function recordedBytes(seed: number): Uint8Array {
  const run = createRun(seed);
  const execution = createExecution(run);
  const recorder = recordInto(execution, headerFor(run));
  for (let tick = 0; tick < 10; tick++) {
    executeTick(execution, { move: { x: 0, y: 0 }, belch: false });
  }
  sealTrailer(recorder, execution, 0);
  return encodeTape(tapeOf(recorder));
}

function summaryRow(overrides: Partial<StoredRunSummary>): StoredRunSummary {
  return {
    id: 'run-1',
    seed: 7,
    recordedAt: Date.UTC(2026, 7, 24, 12, 0, 0),
    inputDevice: 'keyboard',
    ending: 'sealed',
    stop: 'finished',
    integrity: 'clean',
    debtTicks: 0,
    ...overrides,
  };
}

function fakeStore(
  rows: StoredRunSummary[],
  bytes: Uint8Array | null,
): TapeStore {
  return {
    append: vi.fn(async () => {}),
    list: vi.fn(async () => rows),
    load: vi.fn(async () => bytes),
    delete: vi.fn(async () => {}),
  };
}

/** Every text on the screen, the dumb list's rows included. */
function textsOf(screen: RunsScreen): string[] {
  const texts: string[] = [];
  const walk = (node: Container): void => {
    const text = (node as { text?: string }).text;
    if (typeof text === 'string' && text !== '') texts.push(text);
    for (const child of node.children) walk(child as Container);
  };
  walk(screen);
  return texts;
}

function buttonsNamed(screen: RunsScreen, name: string): { press(): void }[] {
  const found: { press(): void }[] = [];
  const walk = (node: Container): void => {
    const button = node as { text?: string; press?: () => void };
    if (button.text === name && typeof button.press === 'function') {
      found.push({ press: button.press });
    }
    for (const child of node.children) walk(child as Container);
  };
  walk(screen);
  return found;
}

async function listed(screen: RunsScreen, count: number): Promise<void> {
  await vi.waitFor(() =>
    expect(buttonsNamed(screen, 'REPLAY')).toHaveLength(count),
  );
}

describe('the runs screen', () => {
  beforeEach(() => {
    fakeLocation.search = '';
    fakeLocation.hash = '';
    openTapeStore.mockReset();
    saveTapeFile.mockClear();
  });
  afterEach(() => vi.restoreAllMocks());

  it("lists the store's rows with seed, recorded-at, device, ending, stop and integrity", async () => {
    const rows = [
      summaryRow({ id: 'run-1', seed: 7 }),
      summaryRow({
        id: 'run-2',
        seed: 505,
        inputDevice: 'touch',
        ending: null,
        stop: 'unknown',
        integrity: null,
        recordedAt: Date.UTC(2026, 7, 23, 9, 30, 0),
      }),
    ];
    openTapeStore.mockResolvedValue(fakeStore(rows, null));
    const screen = new RunsScreen();
    screen.prepare();
    await listed(screen, 2);

    const texts = textsOf(screen).join('\n');
    expect(texts).toContain('SEED 7');
    expect(texts).toContain('2026-08-24 12:00');
    expect(texts).toContain('keyboard');
    expect(texts).toContain('sealed');
    expect(texts).toContain('finished');
    expect(texts).toContain('clean');
    expect(texts).toContain('SEED 505');
    expect(texts).toContain('touch');
    expect(texts).toContain('unknown');
    screen.reset();
  });

  it('states store-unavailable as a fact, never an error', async () => {
    // Null is the designed unavailable state (#58): private mode and storage
    // policy both land there, and the screen reports the fact and offers
    // nothing it cannot do.
    openTapeStore.mockResolvedValue(null);
    const screen = new RunsScreen();
    screen.prepare();

    await vi.waitFor(() =>
      expect(screen['statement'].text).toContain('UNAVAILABLE'),
    );
    expect(buttonsNamed(screen, 'REPLAY')).toHaveLength(0);
    screen.reset();
  });

  it('open-in-replay builds a blob URL from load() bytes and assigns the replay hash with it', async () => {
    // The same path any later tape source uses: the replay route fetches a
    // URL, and where the tape came from is not its business.
    const bytes = recordedBytes(7);
    const store = fakeStore([summaryRow({ id: 'run-1' })], bytes);
    openTapeStore.mockResolvedValue(store);
    const created: unknown[] = [];
    URL.createObjectURL = vi.fn((blob: Blob | MediaSource) => {
      created.push(blob);
      return 'blob:fake';
    });
    const screen = new RunsScreen();
    screen.prepare();
    await listed(screen, 1);

    buttonsNamed(screen, 'REPLAY')[0].press();
    await vi.waitFor(() =>
      expect(fakeLocation.hash).toBe('#/replay?tape=blob%3Afake'),
    );
    expect(store.load).toHaveBeenCalledWith('run-1');
    expect(created).toHaveLength(1);
    screen.reset();
  });

  it("saves the loaded bytes under the tape's own name, read from its header", async () => {
    const bytes = recordedBytes(505);
    openTapeStore.mockResolvedValue(
      fakeStore([summaryRow({ id: 'run-2', seed: 505 })], bytes),
    );
    const screen = new RunsScreen();
    screen.prepare();
    await listed(screen, 1);

    buttonsNamed(screen, 'SAVE')[0].press();
    await vi.waitFor(() => expect(saveTapeFile).toHaveBeenCalled());
    expect(saveTapeFile).toHaveBeenCalledWith(
      bytes,
      tapeFileName(505, 'test-commit'),
    );
    screen.reset();
  });

  it('delete removes the run from the store and relists', async () => {
    const store = fakeStore([summaryRow({ id: 'run-1' })], null);
    openTapeStore.mockResolvedValue(store);
    const screen = new RunsScreen();
    screen.prepare();
    await listed(screen, 1);

    buttonsNamed(screen, 'DELETE')[0].press();
    await vi.waitFor(() => expect(store.delete).toHaveBeenCalledWith('run-1'));
    await vi.waitFor(() => expect(store.list).toHaveBeenCalledTimes(2));
    screen.reset();
  });

  it('a pooled second showing lists afresh, and reset is idempotent', async () => {
    const store = fakeStore([summaryRow({ id: 'run-1' })], null);
    openTapeStore.mockResolvedValue(store);
    const screen = new RunsScreen();
    screen.prepare();
    await listed(screen, 1);

    screen.reset();
    screen.reset();
    expect(buttonsNamed(screen, 'REPLAY')).toHaveLength(0);

    // What navigation leaves behind on the way out.
    screen.interactiveChildren = false;
    screen.prepare();
    await listed(screen, 1);
    expect(screen.interactiveChildren).toBe(true);
    screen.reset();
  });
});
