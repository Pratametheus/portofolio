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
