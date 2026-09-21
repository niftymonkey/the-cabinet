import { Container } from 'pixi.js';

/**
 * The field's draw stack, bottom to top, exactly as ADR 0014 fixes it. Reversed
 * it is the ADR's own list, top to bottom, with the hit's dim in the place its
 * 2026-08-20 amendment gives it: beneath both mob fire and the grave's rim, so
 * a hit dims the field while those two survive it.
 *
 * `fieldBoundary` holds the boundary readout, and it sits directly beneath mob
 * fire by its 2026-08-22 amendment. The boundary used to draw on `ground`, at
 * the very bottom, so every body, corpse and power-up crossing an edge passed over
 * the line that says where the world ends, which reads as the field leaking
 * rather than as a window. Directly beneath mob fire is the highest place it
 * can go without occluding fire, which this ADR lets nothing do.
 */
const LAYER_ORDER = [
  'ground',
  'graveMouth',
  'belchEruption',
  'bellRing',
  'storm',
  'corpses',
  'mobBodies',
  'treasure',
  'hitDim',
  'graveRim',
  'fieldBoundary',
  'mobFire',
] as const;

type LayerName = (typeof LAYER_ORDER)[number];

/**
 * The field's draw stack as named empty containers, in ADR 0014's fixed order.
 *
 * It holds a root rather than being one. Extending Container would let a later
 * renderer call addChild on the stack itself and land above mobFire, which is
 * what the ADR forbids, and no test on a fresh instance would ever see it.
 */
class FieldLayers {
  // A real private field rather than a TS one, so "there is no root to reach"
  // is a fact at runtime and a test can assert it.
  readonly #root: Container;

  private readonly layers: ReadonlyMap<LayerName, Container>;

  constructor() {
    this.#root = new Container();
    const layers = new Map<LayerName, Container>();
    for (const name of LAYER_ORDER) {
      const layer = new Container();
      layers.set(name, layer);
      this.#root.addChild(layer);
    }
    this.layers = layers;
  }

  /**
   * Puts the stack on the screen. The root stays private because a caller
   * holding it could addChild straight onto it and land above mobFire, which
   * is the one thing this class exists to make unreachable.
   */
  public addTo(parent: Container): void {
    parent.addChild(this.#root);
  }

  // The one way to reach a layer.
  public layer(name: LayerName): Container {
    const layer = this.layers.get(name);
    // LayerName is exactly LAYER_ORDER and the constructor fills every name, so
    // a miss is this class disagreeing with itself rather than anything a
    // caller did. It dies by name here instead of handing back an undefined
    // wearing a Container's type, which would surface as a renderer quietly
    // drawing nothing (#121).
    if (layer === undefined) {
      throw new Error(`the field has no layer named ${name}`);
    }
    return layer;
  }

  /**
   * Empties every layer and leaves the stack itself intact. Screens are pooled,
   * so without this a second run on the same screen starts with the first run's
   * sprites already on the field, and the bug reads as a sim bug.
   */
  public clear(): void {
    for (const name of LAYER_ORDER) {
      this.layer(name).removeChildren();
    }
  }
}

export { FieldLayers, LAYER_ORDER };
export type { LayerName };
