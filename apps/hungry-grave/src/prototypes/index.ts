// The prototype registry (decision-log entry 11). A prototype is one folder
// under src/prototypes and one entry here; the base app reaches it only
// through this list, and only by dynamic import. Removing a prototype is
// deleting its folder and its entry, and the base app stays a blank scaffold.

import type { Container } from "pixi.js";

/** Pooled like any screen, so a prototype clears its own state too. */
interface PrototypeScreen extends Container {
  reset(): void;
}

interface PrototypeScreenConstructor {
  new (): PrototypeScreen;
  assetBundles?: string[];
}

export interface PrototypeEntry {
  id: string;
  title: string;
  blurb: string;
  load: () => Promise<PrototypeScreenConstructor>;
}

export const PROTOTYPES: readonly PrototypeEntry[] = [
  {
    id: "ugly-slice",
    title: "THE UGLY SLICE",
    blurb:
      "The five-minute rectangle slice from ticket #30: swallow, grow, belch, two bosses.",
    load: async () =>
      (await import("./ugly-slice/screens/TitleScreen")).TitleScreen,
  },
];

export function prototypeHash(id: string): string {
  return `#/prototypes/${id}`;
}

export function prototypeFromHash(hash: string): PrototypeEntry | undefined {
  // The hash may carry a query (#/prototypes/ugly-slice?seed=7); the id ends there.
  const match = /^#\/prototypes\/([^?]+)/.exec(hash);
  return PROTOTYPES.find((p) => p.id === match?.[1]);
}
