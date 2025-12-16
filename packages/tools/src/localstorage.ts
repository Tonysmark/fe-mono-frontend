export interface StorageLike {
  readonly length: number;
  clear(): void;
  getItem(key: string): string | null;
  key(index: number): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

class MemoryStorage implements StorageLike {
  #map = new Map<string, string>();
  get length() {
    return this.#map.size;
  }
  clear() {
    this.#map.clear();
  }
  getItem(key: string) {
    return this.#map.has(key) ? (this.#map.get(key) ?? null) : null;
  }
  key(index: number) {
    return Array.from(this.#map.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.#map.delete(key);
  }
  setItem(key: string, value: string) {
    this.#map.set(key, value);
  }
}

export interface LocalStorageManager {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  clear(): void;
  getJSON<T>(key: string): T | null;
  setJSON(key: string, value: unknown): void;
}

export interface CreateLocalStorageManagerOptions {
  /**
   * SSR/隐私模式下 localStorage 可能不可用；默认 fallback 到内存实现，避免报错。
   */
  fallback?: "memory" | "throw";
}

export function getBrowserLocalStorageSafe(): StorageLike | null {
  try {
    if (typeof window === "undefined") return null;
    if (!("localStorage" in window)) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createLocalStorageManager(
  storage: StorageLike | null | undefined = getBrowserLocalStorageSafe(),
  options: CreateLocalStorageManagerOptions = {},
): LocalStorageManager {
  const fallback = options.fallback ?? "memory";
  const s: StorageLike =
    storage ??
    (fallback === "memory"
      ? new MemoryStorage()
      : (() => {
          throw new Error("localStorage is not available");
        })());

  return {
    get: (key) => s.getItem(key),
    set: (key, value) => s.setItem(key, value),
    remove: (key) => s.removeItem(key),
    clear: () => s.clear(),
    getJSON<T>(key: string) {
      const raw = s.getItem(key);
      if (raw == null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    setJSON(key: string, value: unknown) {
      s.setItem(key, JSON.stringify(value));
    },
  };
}


