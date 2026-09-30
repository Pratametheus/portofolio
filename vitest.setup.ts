import '@testing-library/jest-dom/vitest';

// jsdom ships no IntersectionObserver; `motion`'s whileInView needs one.
// Report the target as in-view immediately so scroll-reveal primitives settle.
if (!('IntersectionObserver' in globalThis)) {
  class IntersectionObserverStub {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(el: Element) {
      this.cb(
        [{isIntersecting: true, target: el, intersectionRatio: 1} as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

// Node 22+ introduces an experimental globalThis.localStorage that evaluates to undefined
// unless --localstorage-file is provided, shadowing/breaking jsdom's storage.
// Provide an in-memory Storage mock bound to both window and globalThis.
class InMemoryStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

const memoryStorage = new InMemoryStorage();
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: memoryStorage,
    configurable: true,
    writable: true
  });
}
try {
  delete (globalThis as any).localStorage;
} catch {}
Object.defineProperty(globalThis, 'localStorage', {
  value: memoryStorage,
  configurable: true,
  writable: true
});
