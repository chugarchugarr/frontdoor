import { rm } from "node:fs/promises";
import { resolve, basename } from "node:path";

const outputDirectory = resolve(process.cwd(), "dist");

if (basename(outputDirectory) !== "dist") {
  throw new Error(`Refusing to clean unexpected build directory: ${outputDirectory}`);
}

await rm(outputDirectory, { recursive: true, force: true });
