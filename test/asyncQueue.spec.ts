import { AsyncTaskQueue, processBatch } from "../src/utils/asyncQueue";

describe("AsyncTaskQueue", () => {
  it("should use default concurrency when not specified", async () => {
    const queue = new AsyncTaskQueue(); // Line 12 - default parameter
    const results: number[] = [];

    const tasks = Array.from({ length: 15 }, (_, i) =>
      queue.add(async () => {
        results.push(i);
        return i;
      }),
    );

    await Promise.all(tasks);
    expect(results).toHaveLength(15);
  });

  it("should process tasks with controlled concurrency", async () => {
    const queue = new AsyncTaskQueue(2);
    const results: number[] = [];
    const delays = [50, 30, 40, 20, 10];

    const tasks = delays.map((delay, index) =>
      queue.add(async () => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        results.push(index);
        return index;
      }),
    );

    await Promise.all(tasks);
    expect(results).toHaveLength(5);
    expect(results).toEqual(expect.arrayContaining([0, 1, 2, 3, 4]));
  });

  it("should respect concurrency limit", async () => {
    const queue = new AsyncTaskQueue(2);
    let runningCount = 0;
    let maxRunning = 0;

    const tasks = Array.from({ length: 10 }, (_, i) =>
      queue.add(async () => {
        runningCount++;
        maxRunning = Math.max(maxRunning, runningCount);
        await new Promise((resolve) => setTimeout(resolve, 10));
        runningCount--;
        return i;
      }),
    );

    await Promise.all(tasks);
    expect(maxRunning).toBeLessThanOrEqual(2);
  });

  it("should handle task errors gracefully", async () => {
    const queue = new AsyncTaskQueue(2);

    const task1 = queue.add(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return "success";
    });

    const task2 = queue.add(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      throw new Error("Task failed");
    });

    const task3 = queue.add(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return "also success";
    });

    await expect(task1).resolves.toBe("success");
    await expect(task2).rejects.toThrow("Task failed");
    await expect(task3).resolves.toBe("also success");
  });

  it("should process tasks in order they were added", async () => {
    const queue = new AsyncTaskQueue(1); // Single concurrency
    const results: number[] = [];

    const tasks = [1, 2, 3, 4, 5].map((num) =>
      queue.add(async () => {
        results.push(num);
        return num;
      }),
    );

    await Promise.all(tasks);
    expect(results).toEqual([1, 2, 3, 4, 5]);
  });

  it("should handle empty queue", async () => {
    const queue = new AsyncTaskQueue(2);
    await queue.waitForCompletion();
    // Should complete without error
    expect(true).toBe(true);
  });

  it("should wait for all tasks to complete", async () => {
    const queue = new AsyncTaskQueue(2);
    const results: number[] = [];

    // Don't await the tasks immediately
    queue.add(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      results.push(1);
    });

    queue.add(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
      results.push(2);
    });

    queue.add(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      results.push(3);
    });

    await queue.waitForCompletion();
    expect(results).toHaveLength(3);
    expect(results).toEqual(expect.arrayContaining([1, 2, 3]));
  });

  it("should handle high concurrency", async () => {
    const queue = new AsyncTaskQueue(10);
    const results: number[] = [];

    const tasks = Array.from({ length: 50 }, (_, i) =>
      queue.add(async () => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 20));
        results.push(i);
        return i;
      }),
    );

    await Promise.all(tasks);
    expect(results).toHaveLength(50);
  });

  it("should return task results correctly", async () => {
    const queue = new AsyncTaskQueue(3);

    const result1 = await queue.add(async () => "task1");
    const result2 = await queue.add(async () => 42);
    const result3 = await queue.add(async () => ({ key: "value" }));

    expect(result1).toBe("task1");
    expect(result2).toBe(42);
    expect(result3).toEqual({ key: "value" });
  });
});

describe("processBatch", () => {
  it("should use default batch size when not specified", async () => {
    // Line 61 - default batchSize parameter
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const processor = async (item: number) => item * 2;

    const results = await processBatch(items, processor); // No batchSize specified

    expect(results).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]);
  });

  it("should process items in batches", async () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const processor = async (item: number) => item * 2;

    const results = await processBatch(items, processor, 3);

    expect(results).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });

  it("should handle empty array", async () => {
    const items: number[] = [];
    const processor = async (item: number) => item * 2;

    const results = await processBatch(items, processor, 5);

    expect(results).toEqual([]);
  });

  it("should handle single item", async () => {
    const items = [42];
    const processor = async (item: number) => item.toString();

    const results = await processBatch(items, processor, 10);

    expect(results).toEqual(["42"]);
  });

  it("should process with batch size larger than array", async () => {
    const items = [1, 2, 3];
    const processor = async (item: number) => item + 10;

    const results = await processBatch(items, processor, 100);

    expect(results).toEqual([11, 12, 13]);
  });

  it("should handle async processor functions", async () => {
    const items = [1, 2, 3, 4, 5];
    const processor = async (item: number) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return item ** 2;
    };

    const results = await processBatch(items, processor, 2);

    expect(results).toEqual([1, 4, 9, 16, 25]);
  });

  it("should process items with different batch sizes", async () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const processor = async (item: number) => item + 1;

    const results1 = await processBatch(items, processor, 10);
    const results2 = await processBatch(items, processor, 25);
    const results3 = await processBatch(items, processor, 50);

    expect(results1).toHaveLength(100);
    expect(results2).toHaveLength(100);
    expect(results3).toHaveLength(100);
    expect(results1[0]).toBe(1);
    expect(results1[99]).toBe(100);
  });

  it("should handle processor errors", async () => {
    const items = [1, 2, 3, 4, 5];
    const processor = async (item: number) => {
      if (item === 3) {
        throw new Error("Processing error");
      }
      return item;
    };

    await expect(processBatch(items, processor, 2)).rejects.toThrow(
      "Processing error",
    );
  });

  it("should maintain order of results", async () => {
    const items = [5, 4, 3, 2, 1];
    const processor = async (item: number) => {
      // Add random delay to ensure order is maintained
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 20));
      return item * 10;
    };

    const results = await processBatch(items, processor, 3);

    expect(results).toEqual([50, 40, 30, 20, 10]);
  });

  it("should work with complex objects", async () => {
    const items = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ];
    const processor = async (item: { id: number; name: string }) => ({
      ...item,
      processed: true,
    });

    const results = await processBatch(items, processor, 2);

    expect(results).toEqual([
      { id: 1, name: "Alice", processed: true },
      { id: 2, name: "Bob", processed: true },
      { id: 3, name: "Charlie", processed: true },
    ]);
  });
});
