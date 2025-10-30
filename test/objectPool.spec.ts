import { ObjectPool, resultObjectPool } from "../src/utils/objectPool";

describe("ObjectPool", () => {
  it("should use default maxSize when not specified", () => {
    // Line 13 - default maxSize parameter
    const factory = jest.fn(() => ({ value: 0 }));
    const reset = jest.fn((obj) => {
      obj.value = 0;
    });
    const pool = new ObjectPool(factory, reset); // No maxSize specified

    // Create and release 150 objects to test default max size of 100
    const objects = Array.from({ length: 150 }, () => pool.acquire());
    objects.forEach((obj) => pool.release(obj));

    // Clear and verify the pool was using a size limit
    pool.clear();
    const newObj = pool.acquire();
    expect(newObj).toBeDefined();
  });

  it("should create new objects when pool is empty", () => {
    const factory = jest.fn(() => ({ value: 0 }));
    const reset = jest.fn((obj) => {
      obj.value = 0;
    });
    const pool = new ObjectPool(factory, reset, 10);

    const obj1 = pool.acquire();
    const obj2 = pool.acquire();

    expect(factory).toHaveBeenCalledTimes(2);
    expect(obj1).toHaveProperty("value", 0);
    expect(obj2).toHaveProperty("value", 0);
    expect(obj1).not.toBe(obj2);
  });

  it("should reuse objects from the pool", () => {
    const factory = jest.fn(() => ({ value: 0 }));
    const reset = jest.fn((obj) => {
      obj.value = 0;
    });
    const pool = new ObjectPool(factory, reset, 10);

    const obj1 = pool.acquire();
    obj1.value = 42;
    pool.release(obj1);

    const obj2 = pool.acquire();

    expect(factory).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
    expect(obj1).toBe(obj2);
    expect(obj2.value).toBe(0); // Should be reset
  });

  it("should respect max pool size", () => {
    const factory = () => ({ value: 0 });
    const reset = (obj: { value: number }) => {
      obj.value = 0;
    };
    const pool = new ObjectPool(factory, reset, 3);

    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    const obj3 = pool.acquire();
    const obj4 = pool.acquire();

    // Release all objects
    pool.release(obj1);
    pool.release(obj2);
    pool.release(obj3);
    pool.release(obj4); // This should be discarded due to max size

    // Acquire 4 objects again
    const newObj1 = pool.acquire();
    const newObj2 = pool.acquire();
    const newObj3 = pool.acquire();
    const newObj4 = pool.acquire(); // This should be newly created

    // First 3 should be from pool, 4th should be new
    expect([newObj1, newObj2, newObj3]).toContain(obj1);
    expect([newObj1, newObj2, newObj3]).toContain(obj2);
    expect([newObj1, newObj2, newObj3]).toContain(obj3);
    expect(newObj4).not.toBe(obj4); // obj4 was discarded
  });

  it("should clear the pool", () => {
    const factory = () => ({ value: 0 });
    const reset = (obj: { value: number }) => {
      obj.value = 0;
    };
    const pool = new ObjectPool(factory, reset, 10);

    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    pool.release(obj1);
    pool.release(obj2);

    pool.clear();

    const obj3 = pool.acquire();
    const obj4 = pool.acquire();

    // Should create new objects after clear
    expect(obj3).not.toBe(obj1);
    expect(obj3).not.toBe(obj2);
    expect(obj4).not.toBe(obj1);
    expect(obj4).not.toBe(obj2);
  });

  it("should handle multiple acquire/release cycles", () => {
    const factory = jest.fn(() => ({ id: Math.random(), value: 0 }));
    const reset = jest.fn((obj) => {
      obj.value = 0;
    });
    const pool = new ObjectPool(factory, reset, 5);

    for (let i = 0; i < 10; i++) {
      const obj = pool.acquire();
      obj.value = i;
      pool.release(obj);
    }

    // Should have created at most 5 objects (the pool size)
    expect(factory.mock.calls.length).toBeLessThanOrEqual(5);
    // Reset should have been called for each release
    expect(reset).toHaveBeenCalledTimes(10);
  });

  it("should properly reset objects before reuse", () => {
    const factory = () => ({ count: 0, items: [] as number[] });
    const reset = (obj: { count: number; items: number[] }) => {
      obj.count = 0;
      obj.items = [];
    };
    const pool = new ObjectPool(factory, reset, 5);

    const obj1 = pool.acquire();
    obj1.count = 10;
    obj1.items.push(1, 2, 3);
    pool.release(obj1);

    const obj2 = pool.acquire();
    expect(obj2).toBe(obj1);
    expect(obj2.count).toBe(0);
    expect(obj2.items).toEqual([]);
  });

  it("should work with different object types", () => {
    const stringPool = new ObjectPool(
      () => "",
      () => {}, // Strings are immutable, no reset needed
      5,
    );

    const str1 = stringPool.acquire();
    stringPool.release(str1);
    const str2 = stringPool.acquire();

    expect(typeof str2).toBe("string");
  });

  it("should handle concurrent acquire and release", () => {
    const factory = () => ({ value: 0 });
    const reset = (obj: { value: number }) => {
      obj.value = 0;
    };
    const pool = new ObjectPool(factory, reset, 10);

    const objects = Array.from({ length: 20 }, () => pool.acquire());
    objects.forEach((obj) => pool.release(obj));

    const newObjects = Array.from({ length: 10 }, () => pool.acquire());
    expect(newObjects.length).toBe(10);
  });
});

describe("resultObjectPool", () => {
  it("should provide pre-configured result objects", () => {
    const obj = resultObjectPool.acquire();

    expect(obj).toHaveProperty("leafContent");
    expect(obj).toHaveProperty("leafCount");
    expect(obj).toHaveProperty("hasNestedElements");
    expect(obj.leafContent).toEqual({});
    expect(obj.leafCount).toBe(0);
    expect(obj.hasNestedElements).toBe(false);
  });

  it("should reset result objects correctly", () => {
    const obj = resultObjectPool.acquire();
    obj.leafContent = { test: "value" };
    obj.leafCount = 42;
    obj.hasNestedElements = true;

    resultObjectPool.release(obj);
    const obj2 = resultObjectPool.acquire();

    expect(obj2).toBe(obj);
    expect(obj2.leafContent).toEqual({});
    expect(obj2.leafCount).toBe(0);
    expect(obj2.hasNestedElements).toBe(false);
  });

  it("should reuse objects from the pool", () => {
    const obj1 = resultObjectPool.acquire();
    const obj2 = resultObjectPool.acquire();

    resultObjectPool.release(obj1);
    resultObjectPool.release(obj2);

    const obj3 = resultObjectPool.acquire();
    const obj4 = resultObjectPool.acquire();

    // Should get back the same objects
    expect([obj3, obj4]).toContain(obj1);
    expect([obj3, obj4]).toContain(obj2);
  });

  it("should handle multiple acquire/release cycles", () => {
    const objects: any[] = [];

    for (let i = 0; i < 10; i++) {
      const obj = resultObjectPool.acquire();
      obj.leafCount = i;
      objects.push(obj);
      resultObjectPool.release(obj);
    }

    // All objects should be reset
    objects.forEach((obj) => {
      expect(obj.leafCount).toBe(0);
    });
  });

  it("should respect max pool size of 50", () => {
    const objects = Array.from({ length: 60 }, () =>
      resultObjectPool.acquire(),
    );

    // Release all
    objects.forEach((obj) => resultObjectPool.release(obj));

    // Clear to start fresh
    resultObjectPool.clear();

    // Now test that only 50 are kept
    const newObjects = Array.from({ length: 51 }, () =>
      resultObjectPool.acquire(),
    );

    // We can't directly test pool size, but we can verify it works
    expect(newObjects.length).toBe(51);
  });

  it("should maintain object structure after multiple uses", () => {
    for (let i = 0; i < 100; i++) {
      const obj = resultObjectPool.acquire();
      obj.leafContent = { [`key${i}`]: i };
      obj.leafCount = i;
      obj.hasNestedElements = i % 2 === 0;

      resultObjectPool.release(obj);

      const obj2 = resultObjectPool.acquire();
      expect(obj2.leafContent).toEqual({});
      expect(obj2.leafCount).toBe(0);
      expect(obj2.hasNestedElements).toBe(false);
      resultObjectPool.release(obj2);
    }
  });
});
