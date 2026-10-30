const NS = 'crypto-analytics';

export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(`${NS}:${key}`);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
    } catch {
      /* privacy mode */
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(`${NS}:${key}`);
    } catch {
      /* ignore */
    }
  },
};
