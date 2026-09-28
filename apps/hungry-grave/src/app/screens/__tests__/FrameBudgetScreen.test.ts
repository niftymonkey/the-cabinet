/**
 * The frame budget screen's own seam: it measures the field the stage it runs
 * on asks for, so a phone's budget is a tall field's (tilted view A31).
 */

import { Container } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';

/** The real widgets need a renderer: text metrics and a loaded texture. */
vi.mock('../../ui/Label', () => ({
  Label: class extends Container {
    public text = '';
    public anchor = { set: () => {} };
    public style: Record<string, unknown> = {};
  },
}));

vi.mock('../../ui/Button', () => ({
  Button: class extends Container {
    public onPress = { connect: (handler: () => void) => void handler };
  },
}));

import { capsFor } from '../../../game/caps';
import { fieldOfHeight, SHORTEST_FIELD } from '../../../game/field';
import { DEFAULT_TUNING } from '../../../game/tuningRecord';
import { FrameBudgetScreen } from '../FrameBudgetScreen';

describe('the frame budget screen', () => {
  it("starts its runs on the field its stage asks for, with that field's caps", () => {
    // A31 and the tech gate's finding: the budget is measured on the field
    // the stage gives, so a 390 by 844 phone, whose stage is 540 by 1168,
    // measures a 1168 field at that field's caps rather than the desktop's.
    const tall = fieldOfHeight(1168);
    expect(capsFor(DEFAULT_TUNING, tall).mobs).not.toBe(
      capsFor(DEFAULT_TUNING, SHORTEST_FIELD).mobs,
    );
    const screen = new FrameBudgetScreen();
    screen.init({
      onBack: () => {},
      drawField: () => {},
      playButtonSound: () => {},
      stageBox: () => ({ width: 540, height: 1168 }),
    });

    screen.prepare();

    expect(screen['current']?.run.field.height).toBe(1168);
    expect(screen['layers'].layer('mobBodies').children.length).toBe(
      capsFor(DEFAULT_TUNING, tall).mobs,
    );
    screen.reset();
  });
});
