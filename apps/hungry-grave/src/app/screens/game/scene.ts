// The run's drawing geometry: its field, the column it is drawn into, and the camera over that column (design record A34).

import type { Field } from '../../../game/field';
import { SIZE_START } from '../../../game/tuning';
import type { Camera, Column } from './camera';
import { makePlayLayer, type PlayLayer } from './playLayer';
import {
  CAMERA_VALUES,
  groundToColumn,
  makeCamera,
  visibleGround,
} from './camera';

/**
 * One run's drawing geometry, handed to everything that draws the run when the
 * run begins (A34), because the screen and its renderers are pooled and built
 * before any run exists.
 */
interface Scene {
  readonly field: Field;
  // The screen column the field is drawn into, the field's own shape (T12).
  readonly column: Column;
  // Mark's camera over this column (T2, T3), looking at the column's centre.
  readonly camera: Camera;
  /**
   * The camera's scale at the column's bottom row, where the ground and the
   * hole draw largest, so both are baked as sharp as they draw there (A10).
   */
  readonly nearestScale: number;
  // Where everything the sim moves is drawn over this column (T10, T11, A18).
  readonly playLayer: PlayLayer;
}

/**
 * The scene a run on this field is drawn with. A taller field is a taller
 * column under the same camera, so it shows more ground ahead and draws its top
 * row smaller (A34).
 */
const sceneFor = (field: Field): Scene => {
  const column: Column = { width: field.width, height: field.height };
  const camera = makeCamera(
    CAMERA_VALUES.tiltDegrees,
    CAMERA_VALUES.heightInStartingHalfLengths,
    SIZE_START,
    column,
  );
  const nearestRow = visibleGround(camera, column).bottom;
  return {
    field,
    column,
    camera,
    nearestScale: groundToColumn(camera, column.width / 2, nearestRow).scale,
    playLayer: makePlayLayer(camera, column),
  };
};

export { sceneFor };
export type { Scene };
