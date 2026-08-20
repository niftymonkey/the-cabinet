/**
 * A browser with cookies blocked throws on any localStorage access. Without
 * the guard, userSettings.init() in main() throws and the playtester gets a
 * blank screen with a console error nobody reads.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { storage } from "./storage";

function useLocalStorage(impl: Partial<Storage>) {
  Object.defineProperty(globalThis, "localStorage", {
    value: impl,
    configurable: true,
  });
}

function blockedStorage(): Partial<Storage> {
  const deny = () => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  };
  return { getItem: deny, setItem: deny };
}

function workingStorage(): Partial<Storage> {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
  };
}

describe("the storage wrapper with a browser that blocks storage", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    useLocalStorage(blockedStorage());
  });
  afterEach(() => vi.restoreAllMocks());

  it("reads answer with the empty value instead of throwing", () => {
    expect(storage.getString("volume-master")).toBeUndefined();
    expect(storage.getNumber("volume-master")).toBeNull();
    expect(storage.getBool("muted")).toBeUndefined();
    expect(storage.getObject("run")).toBeUndefined();
  });

  it("writes are dropped instead of throwing", () => {
    expect(() => storage.setString("a", "b")).not.toThrow();
    expect(() => storage.setNumber("a", 1)).not.toThrow();
    expect(() => storage.setBool("a", true)).not.toThrow();
    expect(() => storage.setObject("a", { b: 1 })).not.toThrow();
  });
});

describe("the storage wrapper with a working browser", () => {
  beforeEach(() => useLocalStorage(workingStorage()));

  it("round-trips every value kind", () => {
    storage.setString("s", "hello");
    storage.setNumber("n", 0.5);
    storage.setBool("on", true);
    storage.setBool("off", false);
    storage.setObject("o", { seed: 7 });
    expect(storage.getString("s")).toBe("hello");
    expect(storage.getNumber("n")).toBe(0.5);
    expect(storage.getBool("on")).toBe(true);
    expect(storage.getBool("off")).toBe(false);
    expect(storage.getObject("o")).toEqual({ seed: 7 });
  });

  it("a stored value that is neither true nor false reads as undefined", () => {
    storage.setString("b", "yes");
    expect(storage.getBool("b")).toBeUndefined();
    expect(storage.getBool("never-written")).toBeUndefined();
  });

  it("a missing number reads as null, not NaN", () => {
    expect(storage.getNumber("absent")).toBeNull();
  });
});
