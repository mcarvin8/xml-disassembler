import { promises as fs } from "fs";
import { strictEqual } from "assert";
import { join } from "path";

export async function compareDirectories(
  referenceDir: string,
  mockDir: string,
): Promise<void> {
  const entriesinRef = await fs.readdir(referenceDir, { withFileTypes: true });

  // Only compare files that are in the reference directory
  for (const entry of entriesinRef) {
    const refEntryPath = join(referenceDir, entry.name);
    const mockPath = join(mockDir, entry.name);

    if (entry.isDirectory()) {
      // If it's a directory, recursively compare its contents
      await compareDirectories(refEntryPath, mockPath);
    } else {
      // If it's a file, compare its content
      const refContent = await fs.readFile(refEntryPath, "utf-8");
      const mockContent = await fs.readFile(mockPath, "utf-8");
      strictEqual(
        refContent,
        mockContent,
        `File content is different for ${entry.name}`,
      );
    }
  }
}

export async function compareFiles(
  refEntryPath: string,
  mockPath: string,
): Promise<void> {
  const refContent = await fs.readFile(refEntryPath, "utf-8");
  const mockContent = await fs.readFile(mockPath, "utf-8");
  strictEqual(mockContent, refContent, `File content is different }`);
}
