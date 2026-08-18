// The prototype registry (decision-log entry 11). A prototype is one folder
// under src/prototypes and one entry here; the base app reaches it only
// through this list, and only by dynamic import. Removing a prototype is
// deleting its folder and its entry, and the base app stays a blank scaffold.

import type { Container } from "pixi.js";

interface PrototypeScreenConstructor {
  new (): Container;
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
  const match = /^#\/prototypes\/(.+)$/.exec(hash);
  return PROTOTYPES.find((p) => p.id === match?.[1]);
}
