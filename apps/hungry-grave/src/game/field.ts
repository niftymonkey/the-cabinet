/**
 * The fixed field the sim runs in, in field units. The renderer scales it; the
 * sim never knows the viewport (ADR 0003).
 *
 * These live here rather than in tuning.ts because they are ADR 0003 and not
 * tunable, and here rather than in the app because the sim runs in the fixed
 * field and the renderer scales it, so the field is the sim's. src/app/layout.ts
 * imports them from here, so there is one declaration and nothing to keep in
 * sync.
 */

export const FIELD_WIDTH = 540;
export const FIELD_HEIGHT = 760;
