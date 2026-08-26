/**
 * Simple local storage utility that can safely get/set number, boolean and object values too
 * not only string as in plain localStorage.
 */

let warned = false;

const warnOnce = (error: unknown) => {
  if (warned) return;
  warned = true;
  console.warn(
    'Local storage is unavailable; settings will not persist.',
    error,
  );
};

/**
 * Reads through the guard. A browser blocking cookies throws on localStorage
 * itself, and an unguarded read from userSettings.init() in main() takes the
 * whole boot down with it.
 */
const readRaw = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    warnOnce(error);
    return null;
  }
};

// Writes through the same guard, dropping the value when storage is blocked.
const writeRaw = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    warnOnce(error);
  }
};

// Every access goes through readRaw/writeRaw, never localStorage directly.
class StorageWrapper {
  public getString(key: string) {
    return readRaw(key) ?? undefined;
  }

  public setString(key: string, value: string) {
    writeRaw(key, value);
  }

  // Get a number value from storage or undefined if value can't be converted
  public getNumber(key: string) {
    const str = this.getString(key) ?? undefined;
    const value = Number(str);
    return isNaN(value) ? null : value;
  }

  public setNumber(key: string, value: number) {
    this.setString(key, String(value));
  }

  // Get a boolean value from storage or undefined if value can't be converted
  public getBool(key: string) {
    // Parsed rather than coerced: Boolean("false") is true, so a coerced read
    // never round-trips a stored false and never reports an unusable value.
    const raw = readRaw(key)?.toLowerCase();
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return undefined;
  }

  public setBool(key: string, value: boolean) {
    writeRaw(key, String(value));
  }

  // Get an object value from storage or undefined if value can't be parsed
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

  public setObject(key: string, value: Record<string, unknown>) {
    this.setString(key, JSON.stringify(value));
  }
}

const storage = new StorageWrapper();

export { storage };
