export async function withConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  if (limit <= 0) {
    throw new Error("Concurrency limit must be greater than 0");
  }

  const results: Promise<T>[] = [];
  const executing: Promise<T>[] = [];

  for (const task of tasks) {
    const p = task().then((result) => {
      executing.splice(executing.indexOf(p), 1);
      return result;
    });
    results.push(p);
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing); // Wait for any promise to resolve
    }
  }

  return Promise.all(results);
}
