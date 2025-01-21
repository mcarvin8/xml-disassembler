export async function withConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: Promise<T>[] = [];
  const executing: Promise<T>[] = []; // Change this to Promise<T>[]

  for (const task of tasks) {
    const p = task().then((result) => {
      executing.splice(executing.indexOf(p), 1);
      return result;
    });
    results.push(p);
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing); // Wait for the first one to complete
    }
  }

  return Promise.all(results);
}
