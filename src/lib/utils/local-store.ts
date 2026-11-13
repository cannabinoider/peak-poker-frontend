/**
 * Small safe wrapper around localStorage: private windows and blocked storage
 * throw, and the server has no `window`. Reads return null on any problem.
 */
export const readJson = <T>(key: string): T | null => {
  try {
    if (typeof window === "undefined") {
      return null;
    }
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
};

export const writeJson = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the game still works, it just won't remember.
  }
};

export const removeKey = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
};
