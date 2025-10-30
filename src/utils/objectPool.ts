"use strict";

/**
 * Simple object pool to reduce memory allocation overhead
 * Useful for frequently created/destroyed objects like result containers
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    maxSize: number = 100,
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  acquire(): T {
    return this.pool.pop() ?? this.factory();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool.length = 0;
  }
}

// Pre-configured pools for common objects
export const resultObjectPool = new ObjectPool(
  () => ({ leafContent: {}, leafCount: 0, hasNestedElements: false }),
  (obj) => {
    obj.leafContent = {};
    obj.leafCount = 0;
    obj.hasNestedElements = false;
  },
  50,
);
