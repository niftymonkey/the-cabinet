// The run's corner readout: the line stack a run is read off, data in and pixels out.

import { Container } from 'pixi.js';

import type { FaultRecord } from '../../../game/execution';
import type { FaultIdentity } from '../../../game/faults';
import type { WeaponLine } from '../../../game/lines/roster';
import { WEAPON_LINES } from '../../../game/lines/roster';
import { meterLinePosition, METER_FONT_SIZE } from '../../cornerReadout';
import { PALETTE } from '../../palette';
import { Label } from '../../ui/Label';
import type { RunIdentity, RunReadout } from './runSession';

/**
 * The most characters the fault line may carry, prefix included. It is
 * READOUT_RESERVE.width spent as corner-stack characters: layering.test.ts
 * holds the two together through the same advance bound the rest of the stack
 * is held by, so the line hugs the corner on a 390-unit phone stage instead of
 * running nearly the full width of it.
 */
const FAULT_LINE_MAX_CHARS = 25;

// The fault line's prefix, counted inside FAULT_LINE_MAX_CHARS.
const FAULT_PREFIX = 'FAULT ';

/** The lines the stack is, each named for what it says. */
interface HudLines {
  readonly debt: Label;
  readonly tick: Label;
  readonly seed: Label;
  readonly size: Label;
  readonly levels: Label;
  readonly fault: Label;
}

/** A dumb view of one run's readout: no data source, no loop, no change detection. */
interface RunHud {
  readonly view: Container;
  readonly lines: HudLines;
  // The run's pinned identity, written once when the run starts.
  showIdentity(identity: RunIdentity): void;
  // The lines that change as the run goes.
  render(readout: RunReadout): void;
}

// One line of the corner readout stack, in the shared size and anchored to its top-left.
const stackLine = (index: number): Label => {
  const label = new Label({
    style: {
      fontFamily: 'monospace',
      fill: PALETTE.hudDim.hex,
      fontSize: METER_FONT_SIZE,
    },
  });
  // Label centres itself by default, so a line that inherited that would sit
  // on the x where the FPS line starts rather than beginning there.
  label.anchor.set(0, 0);
  const at = meterLinePosition(index);
  label.position.set(at.x, at.y);
  return label;
};

/**
 * A fault's identity, cut to the line's budget where it must be.
 *
 * The identities are a closed list (ADR 0017), so the cut forms are checkable
 * against every member: layering.test.ts asserts no two identities render the
 * same line, which is what keeps a cut form unambiguous. The ellipsis says
 * honestly that the name is cut, and the full identity is in the tape's own
 * fault record either way.
 */
const shortIdentity = (identity: FaultIdentity): string => {
  const budget = FAULT_LINE_MAX_CHARS - FAULT_PREFIX.length;
  if (identity.length <= budget) return identity;
  return `${identity.slice(0, budget - 1).trimEnd()}…`;
};

/**
 * The HUD's fault line (ADR 0017 ruling C): a recoverable fault shows live,
 * minimally, while the run continues, so a read is never taken for minutes on
 * a run whose tuning evidence is already compromised. It reads the authority's
 * own de-duplicated record rather than keeping a second tally, it appears when
 * the first fault fires and stays for the rest of the run, and it never
 * terminates or pauses anything, in any build.
 */
const faultReadout = (faults: readonly FaultRecord[]): string => {
  if (faults.length === 0) return '';
  if (faults.length === 1) {
    return `${FAULT_PREFIX}${shortIdentity(faults[0].identity)}`;
  }
  return `FAULTS ${faults.length}`;
};

/**
 * The pinned-levels line's figure: one number when the four lines agree, which
 * is the only shape the pin produces, and all four in roster order otherwise.
 */
const levelsReadout = (
  levels: Readonly<Record<WeaponLine, number>>,
): string => {
  const values = WEAPON_LINES.map((line) => levels[line]);
  return values.every((value) => value === values[0])
    ? `${values[0]}`
    : values.join('/');
};

const createRunHud = (): RunHud => {
  const view = new Container();
  // Line zero belongs to the frame-rate meter, so the stack starts at one.
  const lines: HudLines = {
    debt: stackLine(1),
    tick: stackLine(2),
    seed: stackLine(3),
    size: stackLine(4),
    // Lines five and six sit past the readout reserve and draw over the field,
    // which is the meter's own allowance under ADR 0014. Growing the reserve
    // instead would move the field on every ordinary run: the levels line is
    // empty on an ordinary run, and the fault line is empty on a healthy one,
    // because ADR 0017 shows a recoverable fault live on an ordinary run.
    levels: stackLine(5),
    fault: stackLine(6),
  };
  view.addChild(
    lines.debt,
    lines.tick,
    lines.seed,
    lines.size,
    lines.levels,
    lines.fault,
  );
  return {
    view,
    lines,
    showIdentity(identity) {
      lines.seed.text = identity.seedPinned
        ? `SEED ${identity.seed} PINNED`
        : `SEED ${identity.seed}`;
      lines.size.text =
        identity.pinnedSize === null
          ? ''
          : `SIZE ${identity.pinnedSize} PINNED`;
      lines.levels.text =
        identity.pinnedLevels === null
          ? ''
          : `LEVELS ${levelsReadout(identity.pinnedLevels)} PINNED`;
    },
    render(readout) {
      // Zero reads rather than hides: an absent readout and a healthy one look
      // the same, and this is the only readout that separates "the game feels
      // slow" from "we blew the frame budget" on a phone.
      lines.debt.text = `DEBT ${readout.debtTicks}`;
      lines.tick.text = `TICK ${readout.tick}`;
      lines.fault.text = faultReadout(readout.faults);
    },
  };
};

export { createRunHud, FAULT_LINE_MAX_CHARS, faultReadout, levelsReadout };
export type { HudLines, RunHud };
