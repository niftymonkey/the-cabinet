/**
 * The kept-runs list: a dumb view of the store's summary rows. Data in, pixels
 * out; the screen that drives it owns the store, the loading and the refresh,
 * and this component only signals intent outward through the actions it was
 * handed at construction.
 */

import { Container } from 'pixi.js';

import { MENU } from '../palette';
import type { StoredRunSummary } from '../tapeStore';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';

/** What the list can ask its driver for, one callback per row offer. */
interface RunActions {
  open(runId: string): void;
  save(runId: string): void;
  remove(runId: string): void;
}

interface RunList {
  readonly view: Container;
  render(rows: readonly StoredRunSummary[]): void;
}

/** One row's vertical footprint, summary line plus its button rank. */
const ROW_SPACING = 150;

/** Where the button rank sits under its summary line. */
const BUTTON_ROW_OFFSET = 60;

const BUTTON_WIDTH = 150;
const BUTTON_HEIGHT = 60;
const BUTTON_GAP = 160;

/** Wall clock as a sortable line: UTC to the minute, because rows are evidence rather than prose. */
const describeWhen = (recordedAt: number): string =>
  new Date(recordedAt).toISOString().slice(0, 16).replace('T', ' ');

/**
 * One row's summary line: seed, recorded-at, device, ending, stop and
 * integrity, which are the trailer facts a reader needs before trusting the
 * run at all (ADR 0018). A null ending is a run that ended neither way, and a
 * null integrity is a row whose trailer never arrived, which reads unsealed.
 */
const describeRun = (row: StoredRunSummary): string =>
  [
    `SEED ${row.seed}`,
    describeWhen(row.recordedAt),
    row.inputDevice,
    row.ending ?? 'no ending',
    row.stop,
    row.integrity ?? 'unsealed',
  ].join('  ');

const summaryLine = (row: StoredRunSummary): Label =>
  new Label({
    text: describeRun(row),
    style: { fontFamily: 'monospace', fill: MENU.menuInk.hex, fontSize: 16 },
  });

const offerButton = (text: string, onPress: () => void): Button => {
  const button = new Button({
    text,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    fontSize: 14,
  });
  button.onPress.connect(onPress);
  return button;
};

const createRunList = (actions: RunActions): RunList => {
  const view = new Container();

  const render = (rows: readonly StoredRunSummary[]): void => {
    // Destroyed rather than only removed: render runs per showing on a pooled
    // screen, and rows that were merely unparented would pile up off-stage.
    for (const child of view.removeChildren())
      child.destroy({ children: true });
    rows.forEach((row, index) => {
      const y = index * ROW_SPACING;
      const line = summaryLine(row);
      line.position.set(0, y);
      const replay = offerButton('REPLAY', () => actions.open(row.id));
      replay.position.set(-BUTTON_GAP, y + BUTTON_ROW_OFFSET);
      const save = offerButton('SAVE', () => actions.save(row.id));
      save.position.set(0, y + BUTTON_ROW_OFFSET);
      const remove = offerButton('DELETE', () => actions.remove(row.id));
      remove.position.set(BUTTON_GAP, y + BUTTON_ROW_OFFSET);
      view.addChild(line, replay, save, remove);
    });
  };

  return { view, render };
};

export { createRunList };
export type { RunActions, RunList };
