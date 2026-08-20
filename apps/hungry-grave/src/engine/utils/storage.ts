/**
 * Simple local storage utility that can safely get/set number, boolean and object values too
 * not only string as in plain localStorage.
 */

let warned = false;

function warnOnce(error: unknown) {
  if (warned) return;
  warned = true;
  console.warn(
    "Local storage is unavailable; settings will not persist.",
    error,
  );
}

/**
 * Reads through the guard. A browser blocking cookies throws on localStorage
 * itself, and an unguarded read from userSettings.init() in main() takes the
 * whole boot down with it.
 */
function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    warnOnce(error);
    return null;
  }
}

// Writes through the same guard, dropping the value when storage is blocked.
function writeRaw(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    warnOnce(error);
  }
}

// Every access goes through readRaw/writeRaw, never localStorage directly.
class StorageWrapper {
  /** Get a string value from storage */
  public getString(key: string) {
    return readRaw(key) ?? undefined;
  }

  /** Set a string value to storage */
  public setString(key: string, value: string) {
    writeRaw(key, value);
  }

  /** Get a number value from storage or undefined if value can't be converted */
  public getNumber(key: string) {
    const str = this.getString(key) ?? undefined;
    const value = Number(str);
    return isNaN(value) ? null : value;
  }

  /** Set a number value to storage */
  public setNumber(key: string, value: number) {
    this.setString(key, String(value));
  }

  /** Get a boolean value from storage or undefined if value can't be converted */
  public getBool(key: string) {
    const bool = readRaw(key);
    return bool ? Boolean(bool.toLowerCase()) : undefined;
  }

  /** Set a boolean value to storage */
  public setBool(key: string, value: boolean) {
    writeRaw(key, String(value));
  }

  /** Get an object value from storage or undefined if value can't be parsed */
  public getObject(key: string) {
    const str = this.getString(key);
    if (!str) return undefined;
    try {
      return JSON.parse(str);
    } catch (e) {
      console.warn(e);
      return undefined;
    }
  }

  /** Set an object value to storage */
  public setObject(key: string, value: Record<string, unknown>) {
    this.setString(key, JSON.stringify(value));
  }
}

export const storage = new StorageWrapper();
